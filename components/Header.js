'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import CurrencySwitcher from './CurrencySwitcher'
import LanguageSwitcher from './LanguageSwitcher'
import { supabase } from '@/lib/supabase'
import { getUserDisplayName } from '@/lib/userUtils'
import { useAuthSync } from '@/lib/useAuthSync'
import { useAuth } from '@/components/AuthProvider'

export default function Header({ lang = 'en', dict }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Handle auth events from other tabs
  const handleAuthEvent = useCallback(async (event) => {
    // Rely on AuthProvider and useAuthSync for session updates
    // In AuthProvider it will re-fetch if this tab is active
  }, [])

  // Cross-tab sync via Supabase Realtime
  useAuthSync({
    userId: user?.id,
    onAuthEvent: handleAuthEvent
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        toggleMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  // Handle mobile menu toggle without history hacking
  const toggleMenu = useCallback((open) => {
    setIsMenuOpen(open)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-md border-b border-gray-100' : 'bg-white/95 backdrop-blur-md border-b border-gray-100'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* DESKTOP HEADER (Traboiwz Pattern) */}
        <div className="hidden md:flex items-center justify-between h-[80px]">
          {/* Left Side: Logo */}
          <div className="w-1/4 flex justify-start">
            <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/img/logo.png"
                alt="GoHoliday Logo"
                width={130}
                height={36}
                className="h-[36px] w-auto"
                priority
              />
            </Link>
          </div>

          {/* Center: Main Navigation Links */}
          <nav className="flex-1 flex justify-center items-center gap-8">
            <Link href={`/${lang}`} className={`relative text-gray-900 font-bold text-[14px] hover:text-primary-600 transition-colors group px-1 py-4 ${pathname === `/${lang}` ? 'text-primary-600' : ''}`}>
              {dict?.nav?.home || 'Home'}
              <span className={`absolute left-0 bottom-2 h-0.5 bg-primary-600 transition-all duration-300 rounded-full ${pathname === `/${lang}` ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href={`/${lang}/tours`} className={`relative text-gray-900 font-bold text-[14px] hover:text-primary-600 transition-colors group px-1 py-4 ${pathname.includes('/tours') ? 'text-primary-600' : ''}`}>
              {dict?.nav?.tours || 'Tours'}
              <span className={`absolute left-0 bottom-2 h-0.5 bg-primary-600 transition-all duration-300 rounded-full ${pathname.includes('/tours') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href={`/${lang}/contact`} className={`relative text-gray-900 font-bold text-[14px] hover:text-primary-600 transition-colors group px-1 py-4 ${pathname.includes('/contact') ? 'text-primary-600' : ''}`}>
              {dict?.nav?.contact || 'Contact'}
              <span className={`absolute left-0 bottom-2 h-0.5 bg-primary-600 transition-all duration-300 rounded-full ${pathname.includes('/contact') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href={`/${lang}/about`} className={`relative text-gray-900 font-bold text-[14px] hover:text-primary-600 transition-colors group px-1 py-4 ${pathname.includes('/about') ? 'text-primary-600' : ''}`}>
              {dict?.nav?.about || 'About us'}
              <span className={`absolute left-0 bottom-2 h-0.5 bg-primary-600 transition-all duration-300 rounded-full ${pathname.includes('/about') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          </nav>

          {/* Right Side: Action Items & Auth */}
          <div className="w-1/4 flex items-center justify-end gap-6">
            <div className="flex items-center gap-2">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>

            {/* Auth Section */}
            {user ? (
              <Link
                href={`/${lang}/profile`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 text-gray-900 hover:bg-gray-100 transition-all font-bold shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-[14px]">{getUserDisplayName(user)}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-5">
                <Link
                  href={`/${lang}/login`}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-[1rem] font-bold text-[14px] hover:bg-primary-700 transition-all shadow-md active:scale-95"
                >
                  {dict?.nav?.login || 'Login'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between h-16 w-full relative z-[51]">
          {/* Left: Profile / Login Action */}
          <div className="w-1/3 flex justify-start">
            {user ? (
              <Link
                href={`/${lang}/profile`}
                className="p-1 -ml-1 text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
                onClick={() => toggleMenu(false)}
              >
                <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 border border-primary-100 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </Link>
            ) : (
              <Link
                href={`/${lang}/login`}
                className="px-4 py-2.5 min-h-[40px] flex items-center justify-center bg-primary-600 text-white rounded-xl font-bold text-xs hover:bg-primary-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                onClick={() => toggleMenu(false)}
              >
                {dict?.nav?.login || 'Login'}
              </Link>
            )}
          </div>

          {/* Center: Logo */}
          <div className="w-1/3 flex justify-center">
            <Link href={`/${lang}`} className="hover:opacity-90 transition-opacity">
              <Image
                src="/img/logo.png"
                alt="GoHoliday Logo"
                width={120}
                height={34}
                className="h-[34px] w-auto relative z-10"
                priority
              />
            </Link>
          </div>

          {/* Right: Hamburger Button */}
          <div className="w-1/3 flex justify-end">
            <button
              ref={menuButtonRef}
              onClick={() => toggleMenu(!isMenuOpen)}
              className="p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Floating Mobile Menu Dropdown */}
        <div
          ref={menuRef}
          className={`md:hidden absolute top-16 right-4 w-72 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden transform origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[50] ${isMenuOpen ? 'scale-100 opacity-100 translate-y-2' : 'scale-95 opacity-0 translate-y-0 pointer-events-none'
            }`}
          style={{ maxHeight: 'calc(100vh - 5rem)' }}
        >
          <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
            {/* Navigation Links Section */}
            <div className="space-y-2">
              <Link
                href={`/${lang}/tours`}
                className="flex items-center gap-4 p-3 bg-gray-50/50 hover:bg-primary-50 active:bg-primary-100 border border-gray-100 rounded-2xl transition-all duration-200"
                onClick={() => toggleMenu(false)}
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 border border-gray-100/50 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 leading-tight">{dict?.nav?.tours || 'Explore Tours'}</div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">Find next adventure</div>
                </div>
              </Link>

              <Link
                href={`/${lang}/contact`}
                className="flex items-center gap-4 p-3 bg-gray-50/50 hover:bg-primary-50 active:bg-primary-100 border border-gray-100 rounded-2xl transition-all duration-200"
                onClick={() => toggleMenu(false)}
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 border border-gray-100/50 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 leading-tight">{dict?.nav?.contact || 'Contact'}</div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">Get in touch</div>
                </div>
              </Link>

              <Link
                href={`/${lang}/about`}
                className="flex items-center gap-4 p-3 bg-gray-50/50 hover:bg-primary-50 active:bg-primary-100 border border-gray-100 rounded-2xl transition-all duration-200"
                onClick={() => toggleMenu(false)}
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 border border-gray-100/50 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900 leading-tight">{dict?.nav?.about || 'About Us'}</div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">Learn our story</div>
                </div>
              </Link>
            </div>

            {/* Switchers Section */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currency</div>
                <CurrencySwitcher mobile />
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Language</div>
                <LanguageSwitcher mobile />
              </div>
            </div>

            {/* Dynamic Account Action (Bottom) */}
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut({ scope: 'local' });
                    toggleMenu(false);
                    router.refresh();
                  }}
                  className="w-full py-3 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl transition-all font-bold group shadow-sm text-sm"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013-3v1" />
                  </svg>
                  Logout
                </button>
              ) : (
                <Link
                  href={`/${lang}/login`}
                  className="flex justify-center w-full py-3 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-200 active:scale-95 transition-all text-center"
                  onClick={() => toggleMenu(false)}
                >
                  {dict?.nav?.login || 'Login'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>

  )
}

