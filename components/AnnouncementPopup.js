'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

// Theme config per popup_type
const POPUP_THEMES = {
  discount: {
    title: ['Special ', 'Offer'],
    buttonText: 'Grab This Deal',
    accentColor: 'bg-amber-500',
    buttonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
    highlightColor: 'text-amber-500',
    barColor: 'bg-amber-500',
  },
  new_feature: {
    title: ['What\'s ', 'New'],
    buttonText: 'Explore Now',
    accentColor: 'bg-blue-500',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    highlightColor: 'text-blue-600',
    barColor: 'bg-blue-600',
  },
  system_update: {
    title: ['System ', 'Update'],
    buttonText: 'Acknowledge',
    accentColor: 'bg-gray-700',
    buttonBg: 'bg-gray-900 hover:bg-black shadow-gray-300',
    highlightColor: 'text-gray-700',
    barColor: 'bg-gray-700',
  },
  general: {
    title: ['', 'Announcement'],
    buttonText: 'Got It',
    accentColor: 'bg-primary-600',
    buttonBg: 'bg-primary-600 hover:bg-primary-700 shadow-primary-200',
    highlightColor: 'text-primary-600',
    barColor: 'bg-primary-600',
  },
}

export default function AnnouncementPopup({ announcement }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'en'

  const theme = POPUP_THEMES[announcement.popup_type] || POPUP_THEMES.general

  useEffect(() => {
    // Check if user has already dismissed this announcement
    const dismissedId = localStorage.getItem('dismissedAnnouncementId')
    const dismissedAt = localStorage.getItem('dismissedAnnouncementAt')

    // Show popup if:
    // 1. Never dismissed OR
    // 2. Dismissed more than 24 hours ago OR
    // 3. Different announcement ID
    const shouldShow =
      !dismissedId ||
      dismissedId !== String(announcement.id) ||
      (dismissedAt && Date.now() - parseInt(dismissedAt) > 24 * 60 * 60 * 1000)

    if (shouldShow) {
      // Small delay before showing to ensure page is loaded
      setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, 500)
    }
  }, [announcement.id])

  const handleDismiss = (e) => {
    if (e) e.stopPropagation()
    setIsAnimating(false)

    // Store dismissal in localStorage
    localStorage.setItem('dismissedAnnouncementId', String(announcement.id))
    localStorage.setItem('dismissedAnnouncementAt', String(Date.now()))

    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  const handlePopupClick = () => {
    // If it's a discount popup and has a tour linked, redirect to it
    if (announcement.popup_type === 'discount' && announcement.discount_tour_id) {
      handleDismiss()
      router.push(`/${lang}/tours/${announcement.discount_tour_id}`)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-700 ${isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleDismiss}
        aria-hidden="true"
      ></div>

      {/* Modal / Container */}
      <div
        onClick={handlePopupClick}
        className={`relative cursor-pointer bg-white rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] max-w-lg w-full overflow-hidden transform transition-all duration-500 ease-out border border-gray-100 ${isAnimating ? 'translate-y-0 scale-100' : 'translate-y-12 scale-90'
          }`}
      >
        {/* Close Button - Outside the clickable flow if possible, or prevent bubble */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none group z-30 shadow-sm"
          aria-label="Dismiss announcement"
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 group-hover:text-gray-900 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        {announcement.image_url && (
          <div className="relative w-full h-56 sm:h-72">
            <Image
              src={announcement.image_url}
              alt="Announcement"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="p-8 sm:p-12 pt-6 sm:pt-10 relative z-10">

          {/* Dynamic Title */}
          <div className="text-center">
            {announcement.popup_type === 'discount' && announcement.discount_percentage ? (
              <div className="inline-block bg-red-500 text-white text-[11px] sm:text-sm font-black px-4 py-1.5 rounded-full mb-4 shadow-md uppercase tracking-widest animate-bounce">
                {announcement.discount_percentage}% OFF {announcement.localizedTourTitle ? `ON ${announcement.localizedTourTitle}` : 'MUST GRAB'}
              </div>
            ) : null}
            <h2
              id="announcement-title"
              className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 leading-[1.1] uppercase tracking-tighter"
            >
              {theme.title[0]}<span className={theme.highlightColor}>{theme.title[1]}</span>
            </h2>
            <div className={`h-1 w-12 ${theme.barColor} mx-auto rounded-full mb-8`}></div>
            <p className="text-base sm:text-lg font-bold text-gray-500 leading-relaxed mb-10 px-2 uppercase tracking-wide">
              {announcement.message}
            </p>
          </div>

          {/* Dynamic Button */}
          <div
            className={`w-full py-5 ${theme.buttonBg} text-white rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] group relative overflow-hidden text-center`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {theme.buttonText}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}
