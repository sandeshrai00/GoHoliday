import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';

const locales = ['en', 'th', 'zh'];
const defaultLocale = 'en';

// Paths that should not be localized
const publicPaths = [
  '/api',
  '/admin',
  '/_next',
  '/favicon.ico',
  '/icon.png',
  '/logo.png',
  '/images',
  '/img',
  '/auth',
  '/robots.txt',
  '/sitemap.xml',
];

function getLocaleFromRequest(request) {
  // 1. Check cookie first
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const parts = lang.trim().split(';');
        const code = parts[0].toLowerCase();
        const quality = parts[1] ? parseFloat(parts[1].split('=')[1]) : 1.0;
        return { code, quality };
      })
      .sort((a, b) => b.quality - a.quality);

    for (const { code } of languages) {
      if (locales.includes(code)) {
        return code;
      }
      const prefix = code.split('-')[0];
      if (locales.includes(prefix)) {
        return prefix;
      }
    }
  }

  return defaultLocale;
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const res = NextResponse.next();

  // 1. Handle Admin Security
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = await getIronSession(request, res, sessionOptions);

    if (!session.userId) {
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Handle Localization
  // Skip middleware for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return res;
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return res;
  }

  // Redirect to path with locale
  const locale = getLocaleFromRequest(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  const redirectRes = NextResponse.redirect(newUrl);

  // Set cookie to remember the locale
  redirectRes.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    path: '/',
  });

  return redirectRes;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - img (public images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|img|logo.png|robots.txt|sitemap.xml).*)',
  ],
};
