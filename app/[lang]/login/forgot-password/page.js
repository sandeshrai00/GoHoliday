'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/lib/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [dict, setDict] = useState(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Extract lang from pathname
  const lang = pathname?.split('/')[1] || 'en'

  // Load dictionary
  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(`/${lang}`)
    }
  }, [user, authLoading, router, lang])

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (error) setError('')
    if (message) setMessage('')
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (attempts >= 2) {
      setError(dict?.errors?.rateLimitExceeded || 'Too many attempts. Please wait a few minutes before trying again.');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError(dict?.reviews?.errorConfig || 'Supabase is not configured.')
      setLoading(false)
      return
    }

    try {
      setAttempts(prev => prev + 1);
      const trimmedEmail = email.trim();

      // 1. Verify existence in public.profiles (Fast, index-friendly query)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', trimmedEmail)
        .limit(1);

      if (profileError) {
        console.error('[ForgotPassword] Database query error:', profileError);
        // Do not block the user simply because the profiles check failed (e.g., due to RLS or network).
        // If it's a clear 'not found' or network issue, we proceed to let Auth resolve it securely.
        if (profileError.code !== 'PGRST116') {
          // Log only, allow the flow to proceed
        }
      } else if (!profiles || profiles.length === 0) {
        // Strict Account Not Found requested
        setError(dict?.forgotPassword?.errorNotFound || 'Account not found for this email address.');
        setLoading(false);
        return;
      }



      // 2. Determine redirect URL
      const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''
      // For password recovery, send users through our auth callback so we can
      // exchange the code for a session and then redirect them to update-password
      const redirectTo = `${origin}/auth/callback?type=recovery&lang=${lang}`

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      })

      if (resetError) {
        console.error('[ForgotPassword] Supabase Auth service error:', resetError);
        const errMsg = resetError.message?.toLowerCase() || '';
        if (errMsg.includes('rate limit')) {
          setError(dict?.errors?.rateLimitExceeded || 'Too many attempts. Please try again later.');
        } else {
          setError(resetError.message);
        }
        return;
      }

      setMessage(dict?.forgotPassword?.successMessage || 'Reset link has been sent to email.');
      setEmail('')
    } catch (err) {
      console.error('[ForgotPassword] UNEXPECTED EXCEPTION:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!dict) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header lang={lang} dict={dict} />

      <main className="flex-grow bg-gradient-to-br from-primary-50 to-secondary-50 py-12">
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {dict.forgotPassword.title}
                </h1>
                <p className="text-gray-600">
                  {dict.forgotPassword.subtitle}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {message && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {dict.forgotPassword.emailLabel}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={dict.forgotPassword.emailPlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? dict.forgotPassword.sending : dict.forgotPassword.sendButton}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link href={`/${lang}/login`} className="text-primary-600 hover:text-primary-700 font-medium">
                  ← {dict.forgotPassword.backToLogin}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  )
}
