'use client'

import { useCurrency } from '@/components/CurrencyProvider'

export default function TourPriceDisplay({ price, currency }) {
  const { convertPrice } = useCurrency()
  
  return (
    <div className="text-cyan-600 font-semibold">
      {convertPrice(price, currency || 'USD')}
    </div>
  )
}
