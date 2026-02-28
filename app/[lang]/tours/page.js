export const revalidate = 3600; // Cache for 1 hour by default, revalidated on-demand

import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TourSearch from '@/components/TourSearch'
import { getDb } from '@/lib/turso'
import { tours as toursSchema, tour_categories as tourCategoriesSchema, categories as categoriesSchema } from '@/lib/schema'
import { desc, eq, inArray } from 'drizzle-orm'
import { getDictionary } from '@/lib/i18n'
import Skeleton from '@/components/Skeleton'

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: `${dict.tours.pageTitle} | GoHolidays`,
    description: `${dict.tours.pageDescription} Specialized flights and tour packages from India, Nepal, Thailand, and South Asia.`,
    alternates: {
      canonical: `/${lang}/tours`,
      languages: {
        'en': `/en/tours`,
        'th': `/th/tours`,
        'zh': `/zh/tours`,
      }
    },
    openGraph: {
      title: `${dict.tours.pageTitle} | GoHolidays`,
      description: `${dict.tours.pageDescription} Specialized flights and tour packages from India, Nepal, Thailand, and South Asia.`,
      url: `/${lang}/tours`,
      siteName: 'GoHolidays',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200',
          width: 1200,
          height: 630,
          alt: 'GoHolidays Tours Search',
        }
      ],
      locale: lang === 'th' ? 'th_TH' : lang === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${dict.tours.pageTitle} | GoHolidays`,
      description: `${dict.tours.pageDescription} Specialized flights and tour packages from India, Nepal, Thailand, and South Asia.`,
      images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200'],
    },
  };
}

async function getAllTours(lang) {
  try {
    const db = getDb();
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
    }).from(toursSchema).orderBy(desc(toursSchema.created_at));
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
    console.error('Error fetching tours:', error);
    return [];
  }
}

export default async function ToursPage({ params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const tours = await getAllTours(lang);

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
        name: 'Tours',
        item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://goholidays.me'}/${lang}/tours`
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header lang={lang} dict={dict} />

      <main id="main-content">
        {/* Page Header - Clean and Simple */}
        <header className="bg-white py-12 border-b border-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {dict.tours.pageTitle}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              {dict.tours.pageDescription}
            </p>
          </div>
        </header>

        {/* Tours with Search & Filter */}
        <section className="py-8 sm:py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {tours.length > 0 ? (
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} variant="tourCard" />
                  ))}
                </div>
              }>
                <TourSearch tours={tours} lang={lang} dict={dict} />
              </Suspense>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M12 3c-1.5 2-2.5 4-2.5 7h5C14.5 7 13.5 5 12 3zM7 10c-1.5-1.5-4-2-6-1.5C3 10 5 11 7 10zm10 0c1.5-1.5 4-2 6-1.5-2 1.5-4 2.5-6 1.5zM12 10v11" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{dict.tours.noToursTitle}</h2>
                <p className="text-gray-600">{dict.tours.noToursMessage}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer lang={lang} dict={dict} />
    </div>
  )
}
