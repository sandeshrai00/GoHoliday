'use client'

import Link from 'next/link'
import Image from 'next/image'
import { memo } from 'react'
import { useCurrency } from './CurrencyProvider'
import { getLocalizedField } from '@/lib/i18n'

const TourCard = memo(function TourCard({ tour, lang = 'en', dict }) {
  const { convertPrice } = useCurrency()
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return ''
    // Strip HTML tags and common entities since description is stored as rich text HTML
    const stripped = text.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim()
    if (stripped.length <= maxLength) return stripped
    return stripped.substring(0, maxLength) + '...'
  }

  // Get localized fields
  const localizedTitle = getLocalizedField(tour, 'title', lang)
  const localizedDescription = getLocalizedField(tour, 'description', lang)
  const localizedLocation = getLocalizedField(tour, 'location', lang)

  // Calculate discount price
  const hasDiscount = tour.is_discount_active === 1 && tour.discount_percentage > 0
  const discountedPrice = hasDiscount ? tour.price * (1 - tour.discount_percentage / 100) : tour.price

  return (
    <Link href={`/${lang}/tours/${tour.id}`} className="block group h-full">
      <article className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col overflow-hidden border border-gray-100 group-hover:scale-[1.01] group-hover:border-primary-200">
        {/* Banner Image with hover zoom and floating price badge */}
        <div className="relative h-28 sm:h-48 w-full overflow-hidden hover-zoom">
          {tour.banner_image ? (
            <Image
              src={tour.banner_image}
              alt={`${localizedTitle} - Tourist package in ${localizedLocation}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M12 3c-1.5 2-2.5 4-2.5 7h5C14.5 7 13.5 5 12 3zM7 10c-1.5-1.5-4-2-6-1.5C3 10 5 11 7 10zm10 0c1.5-1.5 4-2 6-1.5-2 1.5-4 2.5-6 1.5zM12 10v11" />
              </svg>
            </div>
          )}

          {/* Discount Badge OR Best Seller Tag */}
          <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1">
            {hasDiscount ? (
              <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                {tour.discount_percentage}% OFF
              </span>
            ) : (
              <span className="bg-primary-600/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                Popular
              </span>
            )}
          </div>

          {/* Category Tags (Top Right) */}
          {tour.categories && tour.categories.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none z-10">
              {tour.categories.slice(0, 3).map((cat) => (
                <span key={cat.id} className="bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                  {getLocalizedField(cat, 'name', lang)}
                </span>
              ))}
              {tour.categories.length > 3 && (
                <span className="bg-black/50 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  +{tour.categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Floating Price Badge */}
          <div className="absolute bottom-2 right-2 bg-white shadow-lg rounded-lg px-2 py-1 border border-gray-100/50 z-10">
            {hasDiscount ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-xs text-gray-400 line-through font-medium">
                  {convertPrice(tour.price, tour.currency || 'USD')}
                </span>
                <span className="text-[11px] sm:text-sm font-bold text-red-600">
                  {convertPrice(discountedPrice, tour.currency || 'USD')}
                </span>
              </div>
            ) : (
              <div className="text-[11px] sm:text-sm font-bold text-primary-700">
                {convertPrice(tour.price, tour.currency || 'USD')}
              </div>
            )}
          </div>
        </div>

        {/* Card Content - High Density */}
        <div className="p-2.5 sm:p-5 flex-1 flex flex-col">
          <h3 className="text-[13px] sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight" title={localizedTitle}>
            {localizedTitle}
          </h3>

          {/* Location & Tags */}
          <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-4">
            <div className="flex items-center gap-1 text-[10px] sm:text-sm text-gray-500">
              <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{localizedLocation}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] sm:text-sm text-gray-500">
              <svg className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{tour.duration}</span>
            </div>
          </div>

          {/* Hidden on mobile to save space */}
          <p className="hidden md:block text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed h-10">
            {truncateDescription(localizedDescription, 80)}
          </p>

          {/* Action Footer - Arrow only on mobile */}
          <div className="flex items-center justify-between mt-auto pt-2 sm:pt-4 border-t border-gray-50">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[9px] uppercase font-bold text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600 group-hover:translate-x-1 transition-transform">
              <span className="hidden sm:inline-block text-sm font-bold">Details</span>
              <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
})

export default TourCard
