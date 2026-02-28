import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TourSearch from '@/components/TourSearch'
import { getDb } from '@/lib/turso'
import { tours as toursSchema, tour_categories as tourCategoriesSchema, categories as categoriesSchema } from '@/lib/schema'
import { desc, eq, inArray, sql } from 'drizzle-orm'
import { getDictionary } from '@/lib/i18n'
import Skeleton from '@/components/Skeleton'

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const revalidate = 3600; // Cache for 1 hour by default, revalidated on-demand
export async function generateMetadata({ params }) {
    const { lang, country } = await params;
    const dict = await getDictionary(lang);
    const locationName = capitalizeFirstLetter(decodeURIComponent(country));

    const title = `Best Tours & Vacation Packages in ${locationName} | GoHolidays`;
    const description = `Explore premium tours, trekking, and sightseeing packages in ${locationName}. Book your next adventure with GoHolidays's verified travel experts.`;

    return {
        title,
        description,
        alternates: {
            canonical: `/${lang}/destinations/${country}`,
            languages: {
                'en': `/en/destinations/${country}`,
                'th': `/th/destinations/${country}`,
                'zh': `/zh/destinations/${country}`,
            }
        },
        openGraph: {
            title,
            description,
            url: `/${lang}/destinations/${country}`,
            siteName: 'GoHolidays',
            locale: lang === 'th' ? 'th_TH' : lang === 'zh' ? 'zh_CN' : 'en_US',
            type: 'website',
        }
    };
}

async function getLocationTours(countryParam) {
    try {
        const db = getDb();
        const locationName = capitalizeFirstLetter(decodeURIComponent(countryParam));

        // Exact match for now (assuming DB locations are capitalized like 'Nepal', 'Thailand')
        const result = await db.select({
            id: toursSchema.id,
            title: toursSchema.title,
            title_en: toursSchema.title_en,
            title_th: toursSchema.title_th,
            title_zh: toursSchema.title_zh,
            description: toursSchema.description,
            description_en: toursSchema.description_en,
            description_th: toursSchema.description_th,
            description_zh: toursSchema.description_zh,
            price: toursSchema.price,
            currency: toursSchema.currency,
            location: toursSchema.location,
            location_en: toursSchema.location_en,
            location_th: toursSchema.location_th,
            location_zh: toursSchema.location_zh,
            duration: toursSchema.duration,
            banner_image: toursSchema.banner_image,
            dates: toursSchema.dates,
            is_discount_active: toursSchema.is_discount_active,
            discount_percentage: toursSchema.discount_percentage,
            created_at: toursSchema.created_at
        }).from(toursSchema)
            .where(sql`lower(${toursSchema.location}) = ${locationName.toLowerCase()}`)
            .orderBy(desc(toursSchema.created_at));

        const tours = result.map(row => JSON.parse(JSON.stringify(row)));

        if (tours.length === 0) return [];

        const tourIds = tours.map(t => t.id);

        // Fetch categories for all tours
        const categoriesResult = await db.select({
            tour_id: tourCategoriesSchema.tour_id,
            id: categoriesSchema.id,
            name: categoriesSchema.name,
            name_en: categoriesSchema.name_en,
            slug: categoriesSchema.slug
        })
            .from(tourCategoriesSchema)
            .innerJoin(categoriesSchema, eq(tourCategoriesSchema.category_id, categoriesSchema.id))
            .where(inArray(tourCategoriesSchema.tour_id, tourIds));

        // Group categories by tour_id
        const categoriesByTour = categoriesResult.reduce((acc, row) => {
            if (!acc[row.tour_id]) acc[row.tour_id] = [];
            acc[row.tour_id].push({ id: row.id, name: row.name, name_en: row.name_en, slug: row.slug });
            return acc;
        }, {});

        // Attach categories to tours
        return tours.map(tour => ({
            ...tour,
            categories: categoriesByTour[tour.id] || []
        }));
    } catch (error) {
        console.error('Error fetching location tours:', error);
        return [];
    }
}

export default async function DestinationPage({ params }) {
    const { lang, country } = await params;
    const dict = await getDictionary(lang);
    const locationName = capitalizeFirstLetter(decodeURIComponent(country));
    const tours = await getLocationTours(country);

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://goholidays.me'}/${lang}`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Destinations',
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://goholidays.me'}/${lang}/destinations`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: locationName,
                item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://goholidays.me'}/${lang}/destinations/${country}`
            }
        ]
    };

    const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What are the best tours in ${locationName}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `GoHolidays offers highly-rated guided tours and packages in ${locationName}, featuring top attractions, expert guides, and luxury accommodations.`
                }
            },
            {
                '@type': 'Question',
                name: `How much does a trip to ${locationName} cost?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Tour packages in ${locationName} vary based on duration and luxury level. We offer competitive pricing with transparent itineraries.`
                }
            }
        ]
    };

    return (
        <div className="min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />

            <Header lang={lang} dict={dict} />

            <main id="main-content">
                {/* Dynamic SEO Header */}
                <header className="bg-gradient-to-br from-primary-900 to-primary-800 py-20 border-b border-primary-700">
                    <div className="container mx-auto px-4 text-center">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white font-bold tracking-widest uppercase text-sm mb-6 animate-fade-in">
                            Destination Guide
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter shadow-sm animate-fade-in delay-100">
                            Explore <span className="text-accent-400">{locationName}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto font-medium animate-fade-in delay-200">
                            Discover {tours.length} exclusive packages and guided experiences handcrafted by local experts in {locationName}.
                        </p>
                    </div>
                </header>

                {/* Tours Section */}
                <section className="py-12 sm:py-20 bg-gray-50">
                    <div className="container mx-auto px-4 sm:px-6">
                        {tours.length > 0 ? (
                            <Suspense fallback={
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} variant="tourCard" />
                                    ))}
                                </div>
                            }>
                                <TourSearch tours={tours} lang={lang} dict={dict} />
                            </Suspense>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
                                <div className="mb-6">
                                    <svg className="w-20 h-20 mx-auto text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">No packages currently available for {locationName}</h2>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">We are constantly expanding our destinations. Check back soon or explore our other popular locations.</p>
                                <a href={`/${lang}/tours`} className="inline-flex px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors">
                                    View All Tours
                                </a>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer lang={lang} dict={dict} />
        </div>
    )
}
