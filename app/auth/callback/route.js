import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type') // email_verified, password_reset, etc.

  // Get the lang from the request or default to 'en'
  const allowedLangs = ['en', 'th', 'zh']
  let lang = requestUrl.searchParams.get('lang') || 'en'
  if (!allowedLangs.includes(lang)) lang = 'en'

  if (code) {
    // PKCE flow (OAuth, magic links, password recovery)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL(`/${lang}/login?error=auth_failed`, requestUrl.origin))
      }

      // Password recovery: exchange code for a temporary session, then forward
      // the access/refresh tokens to the browser via URL hash so the client
      // Supabase instance can set the session.
      if (type === 'recovery') {
        const session = data?.session
        if (!session?.access_token || !session?.refresh_token) {
          console.error('Recovery flow: session missing tokens after exchangeCodeForSession')
          return NextResponse.redirect(new URL(`/${lang}/login?error=auth_failed`, requestUrl.origin))
        }

        const hashParams = new URLSearchParams({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          type: 'recovery',
        })

        return NextResponse.redirect(
          new URL(`/${lang}/login/update-password#${hashParams.toString()}`, requestUrl.origin)
        )
      }

      // Robust social login detection (OAuth)
      // Check multiple possible paths for the provider
      const user = data?.user || (data?.session?.user)
      const provider = user?.app_metadata?.provider || (user?.identities && user.identities[0]?.provider)
      const isOAuth = provider && provider !== 'email'

      // Custom types (email_change) should still go to their respective pages

      // If it's a social login OR if no specific success type is requested,
      // redirect PROFESSIONALLY to the home page.
      if (isOAuth || !type) {
        return NextResponse.redirect(new URL(`/${lang}`, requestUrl.origin))
      }

      let successType = 'email_verified'
      if (type === 'email_change') {
        successType = 'email_updated'
      }

      return NextResponse.redirect(new URL(`/${lang}/auth/success?type=${successType}`, requestUrl.origin))
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(new URL(`/${lang}/login?error=unexpected`, requestUrl.origin))
    }
  } else if (requestUrl.searchParams.get('token_hash')) {
    // Handle email change confirmations (token_hash flow)
    const token_hash = requestUrl.searchParams.get('token_hash')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type || 'email', // default to email if type is missing, but it is usually email_change
      })

      if (error) {
        console.error('Error verifying OTP for email change:', error)
        return NextResponse.redirect(new URL(`/${lang}/login?error=auth_failed`, requestUrl.origin))
      }

      let successRedirectType = 'email_verified'
      if (type === 'email_change') {
        successRedirectType = 'email_updated'

        // Sync the new email to the public.profiles table
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (!userError && user) {
          await supabase
            .from('profiles')
            .update({ email: user.email })
            .eq('id', user.id)
        }
      }

      return NextResponse.redirect(new URL(`/${lang}/auth/success?type=${successRedirectType}`, requestUrl.origin))
    } catch (err) {
      console.error('Unexpected error in auth callback OTP verification:', err)
      return NextResponse.redirect(new URL(`/${lang}/login?error=unexpected`, requestUrl.origin))
    }
  }

  // If no code, redirect to home
  return NextResponse.redirect(new URL(`/${lang}`, requestUrl.origin))
}
