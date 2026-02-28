'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { getDictionary } from '@/lib/i18n'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [signupAttempts, setSignupAttempts] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [dict, setDict] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  // Extract lang from pathname
  const lang = pathname?.split('/')[1] || 'en'

  // Load dictionary
  useEffect(() => {
    getDictionary(lang).then(setDict)
  }, [lang])

  // Redirect if already logged in
  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace(`/${lang}`)
        }
      })

      // Also listen for auth changes (e.g. if they log in in another tab)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session && event === 'SIGNED_IN') {
          router.replace(`/${lang}`)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [supabase, router, lang])

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Rate limit for signup
    if (!isLogin && signupAttempts >= 2) {
      setError(dict?.errors?.rateLimitExceeded || 'Too many attempts. Please wait a few minutes before trying again.');
      setLoading(false);
      return;
    }

    if (!supabase) {
      setError(dict?.reviews?.errorConfig || 'Auth service temporarily unavailable.')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        setMessage('Login successful!')
        setTimeout(() => router.push(`/${lang}`), 1000)
      } else {
        // Sign up - validate password confirmation
        if (password !== confirmPassword) {
          setError(dict?.login?.passwordsDoNotMatch || 'Passwords do not match')
          setLoading(false)
          return
        }

        // Proactive check for existing email in profiles
        try {
          // Use .ilike for case-insensitive matching which is more reliable for emails
          const { data: existingProfiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, email')
            .ilike('email', email.trim())

          if (profileError) {
            console.error('Profile check error:', profileError)
          }

          if (existingProfiles && existingProfiles.length > 0) {
            setError(dict?.errors?.emailAlreadyInUse || 'This email is already registered. Please sign in or use a different email.')
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('Exception during profile check:', e)
        }

        setSignupAttempts(prev => prev + 1)

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })

        if (error) throw error

        setMessage('Registration successful! Please check your email for verification.')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setFullName('')
        setTimeout(() => setIsLogin(true), 2000)
      }
    } catch (error) {
      // Map Supabase errors to user-friendly messages
      const errorMessage = error?.message || error?.toString() || ''

      if (errorMessage.toLowerCase().includes('email already') || errorMessage.toLowerCase().includes('user already registered')) {
        setError(dict?.errors?.emailAlreadyInUse || 'This email is already registered. Please sign in or use a different email.')
      } else if (errorMessage.toLowerCase().includes('invalid login credentials') || errorMessage.toLowerCase().includes('invalid password')) {
        setError(dict?.errors?.invalidCredentials || 'Invalid email or password. Please check your credentials and try again.')
      } else if (errorMessage.toLowerCase().includes('password') && (errorMessage.toLowerCase().includes('short') || errorMessage.toLowerCase().includes('weak'))) {
        setError(dict?.errors?.passwordTooWeak || 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.')
      } else if (errorMessage.toLowerCase().includes('rate limit')) {
        setError(dict?.errors?.rateLimitExceeded || 'Too many attempts. Please wait a few minutes before trying again.')
      } else if (errorMessage.toLowerCase().includes('session') && errorMessage.toLowerCase().includes('expired')) {
        setError(dict?.errors?.sessionExpired || 'Your session has expired. Please log in again.')
      } else {
        setError(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError(dict?.reviews?.errorConfig || 'Auth service temporarily unavailable.')
      return
    }

    try {
      setError('')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) throw error
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

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
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-gray-600">
                  {isLogin ? 'Sign in to your account' : 'Join GoHoliday today'}
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

              {/* Google Sign In */}
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 transition shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>

              {/* OR Separator */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {dict?.login?.password || 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                      placeholder={dict?.login?.password || "Enter your password"}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-600 transition-colors"
                      aria-label={showPassword ? (dict?.login?.hidePassword || "Hide password") : (dict?.login?.showPassword || "Show password")}
                    >
                      {showPassword ? (
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
                  {isLogin && (
                    <div className="mt-2 text-right">
                      <Link href={`/${lang}/login/forgot-password`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        {dict?.login?.forgotPassword || 'Forgot Password?'}
                      </Link>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      {dict?.login?.confirmPassword || 'Confirm Password'}
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={!isLogin}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                        placeholder={dict?.login?.confirmPasswordPlaceholder || "Re-enter your password"}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-600 transition-colors"
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
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>

              {/* Toggle Login/Register */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setMessage('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                    setFullName('')
                    setShowPassword(false)
                    setShowConfirmPassword(false)
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>

              {/* Back to Home */}
              <div className="mt-4 text-center">
                <Link href={`/${lang}`} className="text-gray-600 hover:text-gray-800 text-sm">
                  ← Back to Home
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
