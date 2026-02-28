export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/turso'
import { tours as toursSchema } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getDictionary, getLocalizedField } from '@/lib/i18n'
import BookingForm from '@/components/BookingForm'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getTour(id) {
    try {
        const db = getDb();
        const result = await db.select({
            id: toursSchema.id,
            title: toursSchema.title,
            title_en: toursSchema.title_en,
            title_th: toursSchema.title_th,
            title_zh: toursSchema.title_zh,
            price: toursSchema.price,
            currency: toursSchema.currency,
            duration: toursSchema.duration,
            banner_image: toursSchema.banner_image,
            is_discount_active: toursSchema.is_discount_active,
            discount_percentage: toursSchema.discount_percentage
        }).from(toursSchema).where(eq(toursSchema.id, Number(id)));

        const row = result[0] || null;
        return row ? JSON.parse(JSON.stringify(row)) : null;
    } catch (error) {
        console.error('Error fetching tour:', error);
        return null; // Handle error gracefully
    }
}

export default async function BookingPage({ params }) {
    const { lang, id } = await params;
    const dict = await getDictionary(lang);
    const tour = await getTour(id);

    if (!tour) {
        notFound();
    }

    const localizedTitle = getLocalizedField(tour, 'title', lang);

    // Calculate actual price to pass to the booking form
    const hasDiscount = tour.is_discount_active === 1 && tour.discount_percentage > 0;
    const finalPrice = hasDiscount ? tour.price * (1 - tour.discount_percentage / 100) : tour.price;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header lang={lang} dict={dict} />

            <div className="container mx-auto px-4 py-8 md:py-12">
                <Link href={`/${lang}/tours/${id}`} className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6 font-medium transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {dict?.tourDetail?.backToTours || 'Back to Tour Details'}
                </Link>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Tour Summary Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
                            <div className="relative h-48 w-full">
                                {tour.banner_image ? (
                                    <Image
                                        src={tour.banner_image}
                                        alt={localizedTitle}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M12 3c-1.5 2-2.5 4-2.5 7h5C14.5 7 13.5 5 12 3zM7 10c-1.5-1.5-4-2-6-1.5C3 10 5 11 7 10zm10 0c1.5-1.5 4-2 6-1.5-2 1.5-4 2.5-6 1.5zM12 10v11" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{localizedTitle}</h2>
                                <div className="flex items-center text-gray-600 mb-4 text-sm">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {tour.duration}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form Section */}
                    <div className="md:col-span-2">
                        {hasDiscount && (
                            <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between shadow-sm animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black tracking-widest uppercase text-red-500">Special Offer Applied</div>
                                        <div className="font-bold text-red-700">You saved {tour.discount_percentage}% on this booking!</div>
                                    </div>
                                </div>
                                <div className="hidden md:block text-right">
                                    <div className="text-[10px] font-bold text-gray-400 line-through uppercase">Original: {tour.price.toLocaleString()} {tour.currency}</div>
                                </div>
                            </div>
                        )}
                        <BookingForm
                            tourId={tour.id}
                            tourTitle={localizedTitle}
                            basePrice={finalPrice}
                            currency={tour.currency}
                            dict={dict}
                        />
                    </div>
                </div>
            </div>

            <Footer lang={lang} dict={dict} />
        </div>
    )
}
