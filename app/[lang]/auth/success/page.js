'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getDictionary } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { broadcastAuthEvent } from '@/lib/useAuthSync'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gradient-to-br from-green-50 to-blue-50 py-12 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}

function AuthSuccessContent() {
  const [dict, setDict] = useState(null)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const type = searchParams.get('type') || 'email_verified'

  // Status can be: 'processing', 'success', 'error'
  const [status, setStatus] = useState('processing')
  const [errorMessage, setErrorMessage] = useState('')

  // Extract lang from pathname
  const lang = pathname?.split('/')[1] || 'en'

  // Load dictionary
  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  // Handle Session Refresh & Broadcast
  useEffect(() => {
    const handleSession = async () => {
      if (!supabase) return

      // Check for errors in hash or query
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const errorDesc = searchParams.get('error_description') ||
        new URLSearchParams(hash.substring(1)).get('error_description')

      if (errorDesc) {
        setStatus('error')
        setErrorMessage(errorDesc.replace(/\+/g, ' '))
        return
      }

      if (type === 'email_updated') {
        // Email update confirmation
        setStatus('success')

        // Check if we are logged in (original browser)
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          broadcastAuthEvent(type, session.user.id)
        }

        // Finalize local cleanup if needed. We don't sign out immediately 
        // to allow the session data to be captured by the broadcast if needed,
        // but for confirmation-only we could. 
        // Actually, just showing success is the priority.
        return
      }

      if (type === 'email_verified') {
        try {
          // Finalize session refresh for new accounts/sign-ups
          const { data, error } = await supabase.auth.refreshSession()

          if (error) {
            console.error('Session refresh error:', error)
            setStatus('error')
            setErrorMessage(error.message || 'Something went wrong.')
          } else {
            setStatus('success')
            if (data?.session?.user?.id) {
              broadcastAuthEvent(type, data.session.user.id)
            }
          }
        } catch (err) {
          console.error('Unexpected error during session refresh:', err)
          setStatus('error')
          setErrorMessage('An unexpected error occurred.')
        }
      } else {
        // Password resets and other types show success immediately
        setStatus('success')
      }
    }

    handleSession()
  }, [type, searchParams])

  // Determine message and icon based on type and status
  const getContent = () => {
    if (status === 'processing') {
      return {
        title: dict?.authSuccess?.processingTitle || 'Processing...',
        message: dict?.authSuccess?.processingMessage || 'Please wait while we securely verify your request.',
        icon: (
          <div className="w-16 h-16 mx-auto relative flex justify-center items-center">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        )
      }
    }

    if (status === 'error') {
      return {
        title: dict?.authSuccess?.errorTitle || 'Verification failed',
        message: errorMessage || 'We could not process your request. The link may have expired or is invalid.',
        icon: (
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        showLogin: true
      }
    }

    // Success States
    switch (type) {
      case 'email_verified':
        return {
          title: dict?.authSuccess?.emailVerifiedTitle || 'Email verified',
          message: dict?.authSuccess?.emailVerifiedMessage || 'Your email has been successfully verified. You can now log in to your account.',
          icon: (
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          showLogin: true,
          showProfile: true
        }
      case 'email_updated':
        return {
          title: dict?.authSuccess?.emailUpdatedTitle || 'Email updated',
          message: dict?.authSuccess?.emailUpdatedMessage || 'Your email has been successfully updated. You can now return to your profile.',
          icon: (
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          showProfile: true
        }
      case 'password_reset':
        return {
          title: dict?.authSuccess?.passwordResetTitle || 'Password reset',
          message: dict?.authSuccess?.passwordResetMessage || 'Your password has been successfully reset. You can now log in with your new password.',
          icon: (
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          ),
          showLogin: true
        }
      default:
        return {
          title: dict?.authSuccess?.successTitle || 'Success',
          message: dict?.authSuccess?.successMessage || 'Your action was completed successfully.',
          icon: (
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const content = getContent()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-glass p-8">
              {/* Logo */}
              <div className="text-center mb-6">
                <Image
                  src="/img/logo.png"
                  alt="GoHoliday Logo"
                  width={140}
                  height={40}
                  className="h-10 w-auto mx-auto mb-4"
                />
              </div>

              {/* Success Icon */}
              <div className="mb-6">
                {content.icon}
              </div>

              {/* Success Message */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {content.title}
                </h1>
                <p className="text-gray-600 text-lg">
                  {content.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {content.showLogin && (
                  <Link
                    href={`/${lang}/login`}
                    className="block w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-center"
                  >
                    {dict?.authSuccess?.goToLogin || 'Go to Login'}
                  </Link>
                )}

                {content.showProfile && (
                  <Link
                    href={`/${lang}/profile`}
                    className="block w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-center"
                  >
                    {dict?.authSuccess?.goToProfile || 'Return to Profile'}
                  </Link>
                )}

                <Link
                  href={`/${lang}`}
                  className="block w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
                >
                  {dict?.authSuccess?.goToHome || 'Go to Home'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
