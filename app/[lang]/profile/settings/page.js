'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/lib/i18n'
import { useAuthSync } from '@/lib/useAuthSync'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProfileSidebar from '@/components/ProfileSidebar'
import Skeleton from '@/components/Skeleton'

// Auto-close delay constants (in milliseconds)
const AUTO_CLOSE_DELAY_SHORT = 2000  // For password updates
const AUTO_CLOSE_DELAY_LONG = 3000   // For email updates (longer message to read)

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dict, setDict] = useState(null)

  // Edit mode states
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  // Email update states
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [emailUpdateMessage, setEmailUpdateMessage] = useState({ type: '', text: '' })

  // Email confirmation banner (shown when email is confirmed from another tab/browser)
  const [emailConfirmedBanner, setEmailConfirmedBanner] = useState(null)

  // Whether we're waiting for email confirmation (enables polling)
  const [waitingForEmailConfirmation, setWaitingForEmailConfirmation] = useState(false)

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState({ type: '', text: '' })

  // Password visibility states
  const [showEmailPassword, setShowEmailPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Refs for timeout IDs (prevents memory leaks)
  const emailTimeoutRef = useRef(null)
  const passwordTimeoutRef = useRef(null)
  const bannerTimeoutRef = useRef(null)

  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'en'

  // Handle auth events from other tabs or from polling
  const handleAuthEvent = useCallback(async (event) => {
    if (event.type === 'email_updated' || event.type === 'email_verified') {
      // Refresh user data from Supabase server
      if (supabase) {
        try {
          const { data: { user: freshUser }, error } = await supabase.auth.getUser()
          if (!error && freshUser) {
            setUser(freshUser)

            // Show success banner
            setEmailConfirmedBanner({
              type: 'success',
              text: event.type === 'email_updated'
                ? (dict?.settings?.emailConfirmedBanner || 'Your email has been confirmed and updated successfully!')
                : (dict?.settings?.emailVerifiedBanner || 'Your email has been verified successfully!')
            })

            // Reset email editing state
            setIsEditingEmail(false)
            setNewEmail('')
            setEmailPassword('')
            setEmailUpdateMessage({ type: '', text: '' })
            setWaitingForEmailConfirmation(false)

            // Auto-hide banner after 8 seconds
            if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
            bannerTimeoutRef.current = setTimeout(() => {
              setEmailConfirmedBanner(null)
            }, 8000)

            // Soft refresh the page to update Server Components without losing client state (like the banner)
            router.refresh()
          }
        } catch (err) {
          console.error('Error refreshing user after auth event:', err)
        }
      }
    }
  }, [dict, router])

  // Cross-tab sync hook via Supabase Realtime
  useAuthSync({
    userId: user?.id,
    onAuthEvent: handleAuthEvent
  })

  // Load dictionary
  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current)
      if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current)
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    }
  }, [])

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!supabase) {
          console.error('Supabase client not initialized')
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push(`/${lang}/login`)
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push(`/${lang}/login`)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
          router.push(`/${lang}/login`)
        } else {
          setUser(session.user)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [lang, router])

  // Detect auth provider
  const getAuthProvider = (user) => {
    if (user.app_metadata?.provider) {
      return user.app_metadata.provider
    }

    if (user.identities && user.identities.length > 0) {
      return user.identities[0].provider
    }

    return 'email'
  }

  // Check if user is using OAuth
  const isOAuthUser = (user) => {
    const provider = getAuthProvider(user)
    return provider !== 'email'
  }

  // Format auth provider name for display
  const getFormattedAuthProvider = (user) => {
    const provider = getAuthProvider(user)
    return provider.charAt(0).toUpperCase() + provider.slice(1)
  }

  // Handle email update
  const handleEmailUpdate = async (e) => {
    e.preventDefault()

    if (!newEmail || !newEmail.trim()) {
      setEmailUpdateMessage({
        type: 'error',
        text: dict?.profile?.emailRequired || 'Please enter a valid email address'
      })
      return
    }

    if (newEmail === user.email) {
      setEmailUpdateMessage({
        type: 'error',
        text: dict?.profile?.emailSameAsCurrent || 'New email must be different from current email'
      })
      return
    }

    if (!emailPassword || !emailPassword.trim()) {
      setEmailUpdateMessage({
        type: 'error',
        text: dict?.profile?.passwordRequired || 'Please enter your current password for verification'
      })
      return
    }

    setIsUpdatingEmail(true)
    setEmailUpdateMessage({ type: '', text: '' })

    try {
      // 1. Check if the new email is already in use in profiles to give immediate feedback
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', newEmail.trim())
        .maybeSingle()

      if (profileCheckError) {
        console.error('Error checking email availability:', profileCheckError)
      } else if (existingProfile) {
        setEmailUpdateMessage({
          type: 'error',
          text: dict?.errors?.emailAlreadyInUse || 'This email is already in use. Please use a different email address.'
        })
        setIsUpdatingEmail(false)
        return
      }

      // 2. Verify the current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: emailPassword
      })

      if (signInError) {
        setEmailUpdateMessage({
          type: 'error',
          text: dict?.profile?.incorrectPassword || 'Incorrect password. Please try again.'
        })
        setIsUpdatingEmail(false)
        return
      }

      // 3. If password is correct, proceed with email update in Supabase Auth
      const { error: authUpdateError } = await supabase.auth.updateUser({
        email: newEmail.trim()
      }, {
        emailRedirectTo: `${window.location.origin}/${lang}/auth/success?type=email_updated`
      })

      if (authUpdateError) throw authUpdateError

      // 4. Proactively update the profile email so Forgot Password works immediately
      // This is safe because we already checked for existence above.
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ email: newEmail.trim() })
        .eq('id', user.id)

      if (profileUpdateError) {
        console.warn('Auth updated but profile sync failed:', profileUpdateError)
        // We don't throw here as the main auth update succeeded
      }

      setEmailUpdateMessage({
        type: 'success',
        text: dict?.settings?.emailUpdateSuccessShort || dict?.profile?.emailUpdateSuccess || 'A verification link has been sent to your new email address.'
      })

      // We wait for the confirmation event from Supabase Realtime broadcast
      setWaitingForEmailConfirmation(true)

      // Keep the form visible with the success message (don't auto-close, wait for confirmation)
      // Only reset password field for security
      setEmailPassword('')
    } catch (error) {
      console.error('Error updating email:', error)

      // Map Supabase errors to user-friendly messages
      const errorMessage = error?.message || error?.toString() || ''

      if (errorMessage.toLowerCase().includes('email already') || errorMessage.toLowerCase().includes('already registered')) {
        setEmailUpdateMessage({
          type: 'error',
          text: dict?.errors?.emailAlreadyInUse || 'This email is already in use. Please use a different email address.'
        })
      } else if (errorMessage.toLowerCase().includes('rate limit')) {
        setEmailUpdateMessage({
          type: 'error',
          text: dict?.errors?.rateLimitExceeded || 'Email rate limit exceeded. Please wait a while before trying again.'
        })
      } else if (errorMessage.toLowerCase().includes('session') && errorMessage.toLowerCase().includes('expired')) {
        setEmailUpdateMessage({
          type: 'error',
          text: dict?.errors?.sessionExpired || 'Your session has expired. Please log in again.'
        })
      } else {
        setEmailUpdateMessage({
          type: 'error',
          text: dict?.profile?.emailUpdateError || 'Failed to update email. Please try again.'
        })
      }
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Handle cancel email edit
  const handleCancelEmailEdit = () => {
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current)
      emailTimeoutRef.current = null
    }
    setIsEditingEmail(false)
    setNewEmail('')
    setEmailPassword('')
    setEmailUpdateMessage({ type: '', text: '' })
  }

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (!currentPassword || !currentPassword.trim()) {
      setPasswordUpdateMessage({
        type: 'error',
        text: dict?.settings?.passwordRequired || dict?.profile?.passwordRequired || 'Please enter your current password for verification'
      })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordUpdateMessage({
        type: 'error',
        text: dict?.settings?.passwordTooShort || 'Password must be at least 6 characters long'
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordUpdateMessage({
        type: 'error',
        text: dict?.settings?.passwordsDoNotMatch || 'Passwords do not match'
      })
      return
    }

    setIsUpdatingPassword(true)
    setPasswordUpdateMessage({ type: '', text: '' })

    try {
      // Verify the current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (signInError) {
        setPasswordUpdateMessage({
          type: 'error',
          text: dict?.profile?.incorrectPassword || 'Incorrect password. Please try again.'
        })
        setIsUpdatingPassword(false)
        return
      }

      // If password is correct, proceed with password update
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setPasswordUpdateMessage({
        type: 'success',
        text: dict?.settings?.passwordUpdateSuccess || 'Your password has been updated successfully.'
      })

      // Reset form fields and exit edit mode after successful update
      passwordTimeoutRef.current = setTimeout(() => {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setIsEditingPassword(false)
        setPasswordUpdateMessage({ type: '', text: '' })
        router.refresh()
      }, AUTO_CLOSE_DELAY_SHORT)
    } catch (error) {
      console.error('Error updating password:', error)

      // Map Supabase errors to user-friendly messages
      const errorMessage = error?.message || error?.toString() || ''

      if (errorMessage.toLowerCase().includes('password') && (errorMessage.toLowerCase().includes('short') || errorMessage.toLowerCase().includes('weak'))) {
        setPasswordUpdateMessage({
          type: 'error',
          text: dict?.errors?.passwordTooWeak || 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.'
        })
      } else if (errorMessage.toLowerCase().includes('rate limit')) {
        setPasswordUpdateMessage({
          type: 'error',
          text: dict?.errors?.rateLimitExceeded || 'Too many attempts. Please wait a few minutes before trying again.'
        })
      } else if (errorMessage.toLowerCase().includes('session') && errorMessage.toLowerCase().includes('expired')) {
        setPasswordUpdateMessage({
          type: 'error',
          text: dict?.errors?.sessionExpired || 'Your session has expired. Please log in again.'
        })
      } else {
        setPasswordUpdateMessage({
          type: 'error',
          text: dict?.settings?.passwordUpdateError || 'Failed to update password. Please try again.'
        })
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle cancel password edit
  const handleCancelPasswordEdit = () => {
    if (passwordTimeoutRef.current) {
      clearTimeout(passwordTimeoutRef.current)
      passwordTimeoutRef.current = null
    }
    setIsEditingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordUpdateMessage({ type: '', text: '' })
  }

  if (loading) {
    return (
      <>
        <Header lang={lang} dict={dict} />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar Skeleton */}
              <div className="lg:w-64">
                <Skeleton variant="sidebar" />
              </div>

              {/* Main Content Skeleton */}
              <div className="flex-1">
                <div className="mb-6">
                  <Skeleton variant="title" className="mb-2" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>

                <div className="space-y-6">
                  <Skeleton variant="card" className="h-64" />
                  <Skeleton variant="card" className="h-64" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer lang={lang} dict={dict} />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Header lang={lang} dict={dict} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-24">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to access settings.</p>
            <button
              onClick={() => router.push(`/${lang}/login`)}
              className="px-6 py-3 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {dict?.nav?.login || 'Go to Login'}
            </button>
          </div>
        </div>
        <Footer lang={lang} dict={dict} />
      </>
    )
  }

  return (
    <>
      <Header lang={lang} dict={dict} />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <ProfileSidebar lang={lang} dict={dict} />

            {/* Main Content */}
            <div className="flex-1">
              {/* Page Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{dict?.settings?.accountSettings || 'Account Settings'}</h1>
                <p className="text-gray-600 mt-1">{dict?.settings?.subtitle || 'Manage your account security'}</p>
              </div>


              {/* Email Confirmed Banner */}
              {emailConfirmedBanner && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between animate-slide-down">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-800 font-medium">{emailConfirmedBanner.text}</p>
                  </div>
                  <button
                    onClick={() => setEmailConfirmedBanner(null)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                    aria-label="Dismiss"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Email Settings Card */}
              <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {dict?.settings?.emailSettings || 'Email Settings'}
                  </h2>
                </div>

                <div className="px-6 py-6">
                  {isOAuthUser(user) ? (
                    // OAuth user - show message
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {dict?.profile?.accountManagedBy || 'Account managed by'} {getFormattedAuthProvider(user)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {dict?.profile?.cannotChangeEmail || 'Email cannot be changed for OAuth accounts'}
                      </p>
                    </div>
                  ) : !isEditingEmail ? (
                    // Display mode - show current email with Edit button
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Current Email Address
                        </label>
                        <p className="text-base text-gray-900 break-all">{user.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(true)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {dict?.settings?.editEmail || 'Change Email'}
                      </button>
                    </div>
                  ) : (
                    // Edit mode - show update form
                    <form onSubmit={handleEmailUpdate} className="space-y-4">
                      {/* New Email Input */}
                      <div>
                        <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.settings?.newEmailLabel || dict?.profile?.newEmail || 'New Email Address'}
                        </label>
                        <input
                          type="email"
                          id="newEmail"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder={dict?.profile?.newEmailPlaceholder || 'Enter new email address'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          disabled={isUpdatingEmail}
                          required
                        />
                      </div>

                      {/* Password Input */}
                      <div>
                        <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.settings?.passwordLabel || dict?.profile?.currentPassword || 'Current Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={showEmailPassword ? "text" : "password"}
                            id="emailPassword"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            placeholder={dict?.profile?.passwordPlaceholder || 'Enter your current password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-10"
                            disabled={isUpdatingEmail}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmailPassword(!showEmailPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label={showEmailPassword ? (dict?.login?.hidePassword || "Hide password") : (dict?.login?.showPassword || "Show password")}
                          >
                            {showEmailPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {dict?.settings?.passwordHelp || dict?.profile?.passwordHint || 'Required for security verification'}
                        </p>
                      </div>

                      {/* Message Display */}
                      {emailUpdateMessage.text && (
                        <div className={`p-3 rounded-lg ${emailUpdateMessage.type === 'success'
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                          }`}>
                          <p className="text-sm">{emailUpdateMessage.text}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isUpdatingEmail}
                          className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isUpdatingEmail ? (dict?.profile?.updating || 'Updating...') : (dict?.settings?.updateEmailButton || dict?.profile?.updateEmail || 'Update Email')}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEmailEdit}
                          disabled={isUpdatingEmail}
                          className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {dict?.common?.cancel || 'Cancel'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Password Settings Card */}
              <div className="bg-white border border-gray-200 rounded-lg mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {dict?.settings?.passwordSettings || 'Password Settings'}
                  </h2>
                </div>

                <div className="px-6 py-6">
                  {isOAuthUser(user) ? (
                    // OAuth user - show message
                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {dict?.profile?.accountManagedBy || 'Account managed by'} {getFormattedAuthProvider(user)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Password cannot be changed for OAuth accounts
                      </p>
                    </div>
                  ) : !isEditingPassword ? (
                    // Display mode - show Change Password button
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Keep your account secure by regularly updating your password</p>

                      <button
                        type="button"
                        onClick={() => setIsEditingPassword(true)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {dict?.settings?.changePassword || 'Change Password'}
                      </button>
                    </div>
                  ) : (
                    // Edit mode - show password change form
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      {/* Current Password Input */}
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.settings?.currentPasswordLabel || dict?.settings?.passwordLabel || 'Current Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder={dict?.settings?.currentPasswordPlaceholder || dict?.profile?.passwordPlaceholder || 'Enter your current password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-10"
                            disabled={isUpdatingPassword}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label={showCurrentPassword ? (dict?.login?.hidePassword || "Hide password") : (dict?.login?.showPassword || "Show password")}
                          >
                            {showCurrentPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {dict?.settings?.passwordHelp || dict?.profile?.passwordHint || 'Required for security verification'}
                        </p>
                      </div>

                      {/* New Password Input */}
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.settings?.newPasswordLabel || 'New Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={dict?.settings?.newPasswordPlaceholder || 'Enter new password (min 6 characters)'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-10"
                            disabled={isUpdatingPassword}
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label={showNewPassword ? (dict?.login?.hidePassword || "Hide password") : (dict?.login?.showPassword || "Show password")}
                          >
                            {showNewPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Input */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          {dict?.settings?.confirmPasswordLabel || 'Confirm New Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={dict?.settings?.confirmPasswordPlaceholder || 'Re-enter new password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent pr-10"
                            disabled={isUpdatingPassword}
                            minLength={6}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label={showConfirmPassword ? (dict?.login?.hidePassword || "Hide password") : (dict?.login?.showPassword || "Show password")}
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Message Display */}
                      {passwordUpdateMessage.text && (
                        <div className={`p-3 rounded-lg ${passwordUpdateMessage.type === 'success'
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                          }`}>
                          <p className="text-sm">{passwordUpdateMessage.text}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isUpdatingPassword}
                          className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isUpdatingPassword ? (dict?.settings?.updatingPassword || 'Updating...') : (dict?.settings?.updatePasswordButton || 'Update Password')}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelPasswordEdit}
                          disabled={isUpdatingPassword}
                          className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {dict?.common?.cancel || 'Cancel'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </>
  )
}
