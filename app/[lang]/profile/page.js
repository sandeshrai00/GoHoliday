'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/lib/i18n'
import { getUserDisplayName } from '@/lib/userUtils'
import { useAuthSync } from '@/lib/useAuthSync'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Skeleton from '@/components/Skeleton'

// Generate a consistent profile picture number (1-6) based on email hash
function getProfilePicture(email) {
  if (!email) return 1

  // Create a simple hash from the email
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
  }

  // Convert to 32-bit integer and get absolute value
  hash |= 0
  const positiveHash = Math.abs(hash)

  // Return value between 1-6
  return (positiveHash % 6) + 1
}

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dict, setDict] = useState(null)
  const router = useRouter()
  const params = useParams()
  const lang = params.lang || 'en'

  // Handle auth events from other tabs
  const handleAuthEvent = useCallback(async (event) => {
    if (event.type === 'email_updated' || event.type === 'email_verified') {
      if (supabase) {
        try {
          const { data: { user: freshUser }, error } = await supabase.auth.getUser()
          if (!error && freshUser) {
            setUser(freshUser)

            // Also refresh profile data
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', freshUser.id)
              .single()

            if (profileData) {
              setProfile(profileData)
            }

            // Soft refresh the page to update internal Server Components without losing client state
            router.refresh()
          }
        } catch (err) {
          console.error('Error refreshing user after auth event:', err)
        }
      }
    }
  }, [router])

  // Cross-tab sync via Supabase Realtime
  useAuthSync({
    userId: user?.id,
    onAuthEvent: handleAuthEvent
  })

  // Load dictionary
  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  useEffect(() => {
    const fetchUserAndProfile = async () => {
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

        // Fetch profile data from profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        router.push(`/${lang}/login`)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
          router.push(`/${lang}/login`)
        } else {
          setUser(session.user)

          // Fetch profile data
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error) {
            setProfile(profileData)
          }
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [lang, router])

  const handleSignOut = async () => {
    if (supabase) {
      // scope: 'local' = logout only in this browser; other browsers/tabs keep their session
      await supabase.auth.signOut({ scope: 'local' })
      router.push(`/${lang}`)
    }
  }

  // Map language codes to locale strings
  const getLocale = (langCode) => {
    const localeMap = {
      'th': 'th-TH',
      'zh': 'zh-CN',
      'en': 'en-US'
    }
    return localeMap[langCode] || 'en-US'
  }

  if (loading) {
    return (
      <>
        <Header lang={lang} dict={dict} />
        <div className="min-h-screen bg-white pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Profile Header Skeleton */}
              <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Skeleton variant="avatar" />
                  <div className="flex-1 text-center md:text-left w-full">
                    <Skeleton variant="title" className="mb-2" />
                    <Skeleton variant="text" className="w-2/3 mb-4" />
                    <div className="space-y-2">
                      <Skeleton variant="text" className="w-full" />
                      <Skeleton variant="text" className="w-3/4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton variant="card" className="h-32" />
                <Skeleton variant="card" className="h-32" />
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
        <div className="min-h-screen flex items-center justify-center bg-white pt-24">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
            <button
              onClick={() => router.push(`/${lang}/login`)}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer lang={lang} dict={dict} />
      </>
    )
  }

  const joinedDate = new Date(user.created_at).toLocaleDateString(getLocale(lang), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Get display name from profile or user metadata
  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : getUserDisplayName(user)

  return (
    <>
      <Header lang={lang} dict={dict} />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg mb-6">
            {/* Profile Picture Section */}
            <div className="px-6 py-8 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center mb-4 overflow-hidden relative">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={displayName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={`/img/profile${getProfilePicture(user.email)}.jpg`}
                      alt={displayName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="text-gray-600 mt-1">{user.email}</p>
              </div>
            </div>

            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {dict?.profile?.fullName || 'Full Name'}
                  </label>
                  <p className="text-base text-gray-900">{displayName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {dict?.profile?.email || 'Email'}
                  </label>
                  <p className="text-base text-gray-900">{user.email}</p>
                </div>
                {profile?.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {dict?.profileSettings?.gender || 'Gender'}
                    </label>
                    <p className="text-base text-gray-900">
                      {profile.gender === 'male' ? (dict?.profileSettings?.male || 'Male') :
                        profile.gender === 'female' ? (dict?.profileSettings?.female || 'Female') :
                          profile.gender === 'other' ? (dict?.profileSettings?.other || 'Other') :
                            profile.gender}
                    </p>
                  </div>
                )}
                {profile?.date_of_birth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      {dict?.profileSettings?.dateOfBirth || 'Date of Birth'}
                    </label>
                    <p className="text-base text-gray-900">
                      {new Date(profile.date_of_birth).toLocaleDateString(getLocale(lang), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {dict?.profile?.memberSince || 'Member Since'}
                  </label>
                  <p className="text-base text-gray-900">{joinedDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {dict?.profile?.userId || 'User ID'}
                  </label>
                  <p className="text-sm font-mono text-gray-900 break-all">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Link
              href={`/${lang}/profile/edit`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 rounded-lg p-3 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {dict?.profile?.profileSettings || 'Profile Settings'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dict?.profile?.profileSettingsDescription || 'Edit your personal information'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href={`/${lang}/profile/settings`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary-100 rounded-lg p-3 group-hover:bg-primary-200 transition-colors">
                  <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {dict?.profile?.accountSettings || 'Account Settings'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dict?.profile?.accountSettingsDescription || 'Manage your email and password'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/${lang}`)}
              className="px-8 py-2 bg-white text-gray-700 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors w-auto"
            >
              {dict?.nav?.home || 'Home'}
            </button>
            <button
              onClick={handleSignOut}
              className="px-8 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors w-auto"
            >
              {dict?.nav?.signOut || 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
      <Footer lang={lang} dict={dict} />
    </>
  )
}
