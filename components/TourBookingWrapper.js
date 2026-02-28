'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function TourBookingWrapper({ tourId, tourTitle, price, currency }) {
    const params = useParams()
    const lang = params?.lang || 'en'

    return (
        <div className="flex flex-col gap-4 mt-8">
            <Link
                href={`/${lang}/book/${tourId}`}
                className="flex-1 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
            </Link>

            <a
                href={`https://wa.me/66812345678?text=I'm interested in booking ${tourTitle || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transform transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118 1.157-.175 1.758-.967 1.758-1.761.017-.791-.412-1.558-.809-1.734zM12 21.463C6.794 21.463 2.536 17.205 2.536 12c0-5.204 4.257-9.463 9.463-9.463 5.204 0 9.463 4.257 9.463 9.463 0 5.204-4.257 9.463-9.463 9.463z" />
                </svg>
                WhatsApp
            </a>
        </div>
    )
}
