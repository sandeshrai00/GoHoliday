'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCurrency } from './CurrencyProvider'

export default function MobileBookingBar({ tourId, tourTitle, price, currency, dict, isDiscountActive, discountPercentage }) {
    const { convertPrice } = useCurrency()
    const params = useParams()
    const lang = params?.lang || 'en'

    // Replace with actual number from env or config
    const whatsappNumber = "66812345678"

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] p-3 bg-white rounded-t-[2rem] border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] pb-safe-area-inset-bottom">
            <div className="flex items-center gap-3">
                {/* Simplified Info */}
                <div className="px-2 min-w-[100px]">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="text-[10px] font-bold text-gray-400 uppercase leading-none">
                            {dict?.common?.from || 'From'}
                        </div>
                        {isDiscountActive === 1 && discountPercentage > 0 && (
                            <span className="bg-red-50 text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-red-100">
                                {discountPercentage}% OFF
                            </span>
                        )}
                    </div>

                    {isDiscountActive === 1 && discountPercentage > 0 && (
                        <div className="text-xs font-bold text-gray-400 line-through mb-0.5">
                            {convertPrice(price, currency || 'USD')}
                        </div>
                    )}

                    <div className={`text-xl font-black leading-none tracking-tighter ${isDiscountActive === 1 && discountPercentage > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {isDiscountActive === 1 && discountPercentage > 0
                            ? convertPrice(price * (1 - discountPercentage / 100), currency || 'USD')
                            : convertPrice(price, currency || 'USD')}
                    </div>
                </div>

                {/* Dual Actions */}
                <div className="flex-1 flex gap-2">
                    <Link
                        href={`/${lang}/book/${tourId}`}
                        className="flex-1 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md active:scale-95 transition-all uppercase tracking-tighter"
                    >
                        {dict?.booking?.bookNow || dict?.tourDetail?.bookNow || 'Book Now'}
                    </Link>
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=I'm interested in booking ${tourId || ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md active:scale-95 transition-all gap-1 uppercase tracking-tighter"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118 1.157-.175 1.758-.967 1.758-1.761.017-.791-.412-1.558-.809-1.734zM12 21.463C6.794 21.463 2.536 17.205 2.536 12c0-5.204 4.257-9.463 9.463-9.463 5.204 0 9.463 4.257 9.463 9.463 0 5.204-4.257 9.463-9.463 9.463z" />
                        </svg>
                        {dict?.booking?.whatsapp || 'WhatsApp'}
                    </a>
                </div>
            </div>
        </div>
    )
}
