'use client'

import { useCurrency } from './CurrencyProvider'
import { getLocalizedField } from '@/lib/i18n'
import TourBookingWrapper from './TourBookingWrapper'

export default function TourDetailSidebar({ tour, lang = 'en', dict }) {
  const { convertPrice } = useCurrency()

  const localizedTitle = getLocalizedField(tour, 'title', lang)
  const localizedLocation = getLocalizedField(tour, 'location', lang)

  const hasDiscount = tour.is_discount_active === 1 && tour.discount_percentage > 0;
  const originalPrice = tour.price;
  const discountedPrice = hasDiscount ? originalPrice * (1 - tour.discount_percentage / 100) : originalPrice;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 pt-10 sticky top-24 overflow-hidden">

      <div className="mb-8 pb-8 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {dict?.tourDetail?.price || 'Exclusive Price'}
          </div>
          {hasDiscount && (
            <span className="bg-red-50 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-red-100">
              {tour.discount_percentage}% OFF
            </span>
          )}
        </div>

        {hasDiscount && (
          <div className="text-lg font-bold text-gray-400 line-through mb-1">
            {convertPrice(originalPrice, tour.currency || 'USD')}
          </div>
        )}

        <div className="flex items-baseline gap-1">
          <div className={`text-5xl font-black tracking-tighter ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
            {convertPrice(discountedPrice, tour.currency || 'USD')}
          </div>
          <span className="text-gray-400 font-medium">{dict?.common?.perPerson || 'per person'}</span>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary-100">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dict?.tourDetail?.duration || 'Duration'}</div>
            <div className="text-gray-900 font-extrabold">{tour.duration}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary-100">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dict?.tourDetail?.availableDates || 'Availability'}</div>
            <div className="text-gray-900 font-extrabold">{tour.dates}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary-100">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{dict?.tourDetail?.location || 'Location'}</div>
            <div className="text-gray-900 font-extrabold">{localizedLocation}</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <TourBookingWrapper
          tourId={tour.id}
          tourTitle={localizedTitle}
          price={discountedPrice}
          currency={tour.currency}
        />
      </div>
    </div>
  )
}
