'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { locales, localeConfig, replaceLocaleInPath } from '@/lib/i18n';

export default function LanguageSwitcher({ mobile = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    // Extract current locale from pathname
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && locales.includes(segments[0])) {
      setCurrentLocale(segments[0]);
    }
  }, [pathname]);

  const handleLanguageChange = (newLocale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Replace locale in current path
    const newPath = replaceLocaleInPath(pathname, newLocale);

    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;

    // Navigate to new path
    router.push(newPath);
    setIsOpen(false);
  };

  const currentConfig = localeConfig[currentLocale] || localeConfig.en;

  // Mobile view with text
  if (mobile) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 border border-transparent hover:border-primary-200"
          aria-label={`Select language - Current: ${currentConfig.name}`}
          aria-expanded={isOpen}
        >
          <Image
            src={currentConfig.flag}
            alt={currentConfig.name}
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            priority
          />
          <span className="flex-1 text-left font-medium">{currentConfig.name}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Inline accordion options */}
        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
          <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
            {locales.map((locale) => {
              const config = localeConfig[locale];
              const isActive = locale === currentLocale;

              return (
                <button
                  key={locale}
                  onClick={() => handleLanguageChange(locale)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${isActive ? 'bg-primary-50 text-primary-600 font-medium' : ''
                    }`}
                >
                  <Image
                    src={config.flag}
                    alt={config.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="flex-1 text-left">{config.name}</span>
                  {isActive && (
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="relative">
      {/* Desktop Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex items-center gap-2 px-1.5 py-2 rounded-2xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 border border-transparent hover:border-primary-200"
        aria-label={`Select language - Current: ${currentConfig.name}`}
        aria-expanded={isOpen}
      >
        <Image
          src={currentConfig.flag}
          alt={currentConfig.name}
          width={32}
          height={32}
          className="w-8 h-8 object-contain"
          priority
        />
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-lg bg-white border border-primary-200 z-50 animate-slide-down">
            <div className="py-1">
              {locales.map((locale) => {
                const config = localeConfig[locale];
                const isActive = locale === currentLocale;

                return (
                  <button
                    key={locale}
                    onClick={() => handleLanguageChange(locale)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${isActive ? 'bg-primary-50 text-primary-600 font-medium' : ''
                      }`}
                  >
                    <Image
                      src={config.flag}
                      alt={config.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="flex-1 text-left">{config.name}</span>
                    {isActive && (
                      <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
