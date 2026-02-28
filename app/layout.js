import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import { CurrencyProvider } from '@/components/CurrencyProvider'
import { AuthProvider } from '@/components/AuthProvider'
import ProgressBar from '@/components/ProgressBar'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://goholidays.me'),
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  // Script to intercept Supabase implicit flow hash fragments (e.g. from email confirmation links)
  // before React hydration, as Next.js server cannot see `#` fragments.
  const hashInterceptScript = `
    (function() {
      if (typeof window !== 'undefined' && window.location.hash) {
        var hash = window.location.hash;
        var pathname = window.location.pathname;
        var lang = pathname.split('/')[1] || 'en';
        var allowedLangs = ['en', 'th', 'zh'];
        if (!allowedLangs.includes(lang)) lang = 'en';

        // Prevent infinite loops if we are already on the success or update-password page
        if (pathname.includes('/auth/success') || pathname.includes('/login/update-password')) {
          return;
        }

        // Skip interception for social/OAuth logins (Google, etc.)
        // OAuth tokens include provider_token from the social provider.
        // Do NOT clear the hash - the Supabase JS client needs these tokens to establish the session.
        if (hash.includes('provider_token=') || hash.includes('provider_refresh_token=')) {
          return;
        }

        // Email change: go to success without storing tokens so this browser does not auto-login
        if (hash.includes('type=email_change')) {
          window.location.replace('/' + lang + '/auth/success?type=email_updated');
          return;
        }
        if (hash.includes('access_token=') || hash.includes('type=recovery')) {
          if (hash.includes('type=recovery')) {
            window.location.replace('/' + lang + '/login/update-password' + hash);
            return;
          }
          // Only redirect to success page for email signups (type=signup or type=magiclink),
          // NOT for social logins which should stay on the current page.
          if (hash.includes('type=signup') || hash.includes('type=magiclink') || hash.includes('type=email')) {
            window.location.replace('/' + lang + '/auth/success?type=email_verified' + hash);
            return;
          }
          // For any other access_token (e.g. social login without provider_token),
          // do NOT redirect and do NOT clear hash. Let Supabase JS client handle it.
          return;
        }
      }
    })();
  `;

  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <script dangerouslySetInnerHTML={{ __html: hashInterceptScript }} />
      </head>
      <body className={plusJakartaSans.className} suppressHydrationWarning>
        <AuthProvider>
          <CurrencyProvider>
            <ProgressBar />
            {children}
            <Analytics />
            <SpeedInsights />
            <WhatsAppFloat />
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
