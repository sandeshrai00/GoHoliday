'use client'

import { useState } from 'react'

export default function AnnouncementBanner({ message }) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible || !message) {
    return null
  }

  return (
    <div
      className="bg-primary-700 relative z-40"
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2 md:py-2.5 gap-6">

          {/* Message Group */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Megaphone Icon */}
            <div className="hidden sm:flex flex-shrink-0 w-8 h-8 items-center justify-center rounded-xl bg-white/10">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>

            {/* Primary Message */}
            <p className="text-xs md:text-sm font-bold text-white tracking-wide leading-relaxed truncate">
              <span className="text-white/60 mr-2 uppercase tracking-widest text-[9px] font-bold">Latest Update:</span>
              {message}
            </p>
          </div>

          {/* Dismiss */}
          <div className="flex items-center">
            <button
              onClick={handleDismiss}
              className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss announcement"
            >
              <span className="text-[10px] font-bold text-white/70 group-hover:text-white uppercase tracking-wider transition-colors">Dismiss</span>
              <svg
                className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
