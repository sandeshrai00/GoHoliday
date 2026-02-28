import { notFound } from 'next/navigation';
import { getSeoPageData, getAllSeoSlugs } from '@/lib/seo-content';
import { getDb } from '@/lib/turso';
import { tours } from '@/lib/schema';
import { like } from 'drizzle-orm';
import Image from 'next/image';
import Script from 'next/script';
import TourCard from '@/components/TourCard';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Helper to safely format our basic markdown-like strings from seo-content.js
function formatText(text) {
    if (!text) return '';
    let formatted = text
        .replace(/^\s*### (.*$)/gim, '<h3 class="text-xl md:text-2xl font-serif text-gray-800 mt-8 mb-4">$1</h3>')
        .replace(/^\s*## (.*$)/gim, '<h2 class="text-3xl md:text-4xl font-serif text-gray-900 mt-12 mb-6 border-b border-gray-200 pb-4">$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/^\s*- (.*$)/gim, '<li class="ml-6 mb-3 list-disc marker:text-gray-400">$1</li>');

    return formatted.replace(/\n\n/g, '<br/><br/>');
}

const locales = ['en', 'th', 'zh', 'ru', 'fr', 'de']; // Supported locales

export async function generateStaticParams() {
    // Returning an empty array shifts generation to Incremental Static Regeneration (ISR).
    // This prevents the build server from experiencing V8 Out-Of-Memory errors caused
    // by opening hundreds of concurrent parallel database connection spikes during static compilation.
    return [];
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const lang = resolvedParams.lang || 'en';
    const slugArray = resolvedParams.slug || [];
    const slug = Array.isArray(slugArray) ? slugArray.join('/') : slugArray;
    const pageData = getSeoPageData(slug);

    if (!pageData) {
        return {};
    }

    return {
        title: `${pageData.title} | GoHolidays`,
        description: pageData.metaDescription,
        alternates: {
            canonical: `/${lang}/${slug}`,
            languages: {
                'en': `/en/${slug}`,
                'th': `/th/${slug}`,
                'zh': `/zh/${slug}`,
            },
        },
        openGraph: {
            title: `${pageData.title} | GoHolidays`,
            description: pageData.metaDescription,
            url: `/${lang}/${slug}`,
            siteName: 'GoHolidays',
            images: [
                {
                    url: pageData.heroImage,
                    width: 1200,
                    height: 630,
                },
            ],
            type: 'website',
        },
    };
}

export const revalidate = 3600; // ISR Support

export default async function SeoLandingPage({ params }) {
    const resolvedParams = await params;
    const { lang } = resolvedParams;
    const slugArray = resolvedParams.slug || [];
    const slug = Array.isArray(slugArray) ? slugArray.join('/') : slugArray;
    const pageData = getSeoPageData(slug);

    // If the slug doesn't exist in our curated SEO content, return 404.
    // This prevents Google from indexing empty / thin pages.
    if (!pageData) {
        notFound();
    }

    // Fetch ACTUAL tour inventory matching the search query to ensure page legitimacy
    const db = getDb();
    const relatedTours = await db
        .select()
        .from(tours)
        .where(like(tours.location, `%${pageData.searchQuery}%`))
        .limit(3);

    // Build FAQ Schema perfectly
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: pageData.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `https://goholidays.me/${lang}`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Destinations',
                item: `https://goholidays.me/${lang}/destinations`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: pageData.title,
                item: `https://goholidays.me/${lang}/${slug.join('/')}`
            }
        ]
    };

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col pb-20">
            <Script
                id={`faq-schema-${slug.join('-')}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Script
                id={`breadcrumb-schema-${slug.join('-')}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Header lang={lang} />

            {/* 1. Massive SEO Hero Section */}
            <header className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center pt-20">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={pageData.heroImage}
                        alt={pageData.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                </div>
                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-10">
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-xl tracking-tight leading-tight">
                        {pageData.title}
                    </h1>
                    <p className="text-xl md:text-3xl text-gray-100 font-serif italic drop-shadow-lg max-w-3xl mx-auto font-light">
                        {pageData.subtitle}
                    </p>
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-7xl -mt-24 relative z-20">

                {/* 2. Inventory Grid - Proving the page is real to Google */}
                <section aria-labelledby="available-tours" className="bg-white p-10 sm:p-16 border border-gray-100 shadow-xl rounded-xl mb-20">
                    <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 pb-6 border-b border-gray-100">
                        <h2 id="available-tours" className="text-4xl font-serif text-gray-900 tracking-tight">
                            Curated {pageData.searchQuery} Experiences
                        </h2>
                        <Link href={`/${lang}/tours?location=${pageData.searchQuery}`} className="text-sm font-semibold text-primary-600 hover:text-primary-800 uppercase tracking-[0.2em] mt-6 md:mt-0 transition duration-300">
                            View Full Collection &rarr;
                        </Link>
                    </div>

                    {relatedTours.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedTours.map(tour => (
                                <TourCard key={tour.id} tour={tour} lang={lang} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-12 flex flex-col items-center justify-center text-center border border-gray-200">
                            <h3 className="text-2xl font-serif text-gray-900 mb-4">Ready to explore {pageData.searchQuery}?</h3>
                            <p className="text-gray-500 text-lg mb-8 max-w-xl">We are continuously updating our live inventory. Click below to view all current availability and pricing.</p>
                            <Link href={`/${lang}/tours?location=${pageData.searchQuery}`} className="px-8 py-4 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 transition shadow-md text-lg">
                                Search Live {pageData.searchQuery} Tours &rarr;
                            </Link>
                        </div>
                    )}
                </section>

                {/* 3. The 1200+ Word Semantic SEO Core Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">

                    <article className="lg:col-span-8 bg-white p-10 sm:p-16 border border-gray-100 shadow-xl rounded-xl text-gray-700 leading-loose text-lg sm:text-xl font-light">
                        <div dangerouslySetInnerHTML={{ __html: formatText(pageData.content) }} className="prose prose-lg prose-gray max-w-none prose-headings:font-serif prose-headings:text-gray-900" />

                        <div className="mt-16 pt-16 border-t border-gray-100">
                            <div dangerouslySetInnerHTML={{ __html: formatText(pageData.itinerary) }} className="prose prose-lg prose-gray max-w-none prose-headings:font-serif prose-headings:text-gray-900" />
                        </div>

                        <div className="mt-16 pt-16 border-t border-gray-100">
                            <div dangerouslySetInnerHTML={{ __html: formatText(pageData.pricingOverview) }} className="prose prose-lg prose-gray max-w-none prose-headings:font-serif prose-headings:text-gray-900" />
                        </div>

                        {/* Bottom CTA within Article */}
                        <div className="mt-16 pt-16 border-t border-gray-100 text-center bg-gray-50 p-12 rounded-xl border border-gray-100">
                            <h3 className="text-3xl font-serif text-gray-900 mb-6">Book Your {pageData.searchQuery} Experience</h3>
                            <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-xl font-light">Don't miss out on these highly curated packages. Availability changes daily.</p>
                            <Link href={`/${lang}/tours?location=${pageData.searchQuery}`} className="inline-block px-12 py-5 bg-gray-900 text-white text-lg rounded-full font-medium hover:bg-black transition duration-300 shadow-xl w-full sm:w-auto transform hover:-translate-y-1">
                                View Currently Available Tours
                            </Link>
                        </div>
                    </article>

                    {/* 4. Highly Specific Sidebar - Visa & Hotels */}
                    <aside className="lg:col-span-4 space-y-10">
                        <section className="bg-white p-8 sm:p-12 border border-gray-100 shadow-xl rounded-xl">
                            <h3 className="text-3xl font-serif text-gray-900 mb-8 pb-4 border-b border-gray-100">Visa Advisory</h3>
                            <div className="text-base sm:text-lg text-gray-600 font-light leading-relaxed prose prose-gray" dangerouslySetInnerHTML={{ __html: formatText(pageData.visaInfo) }} />
                        </section>

                        <section className="bg-gray-900 text-white p-8 sm:p-12 shadow-xl rounded-xl">
                            <h3 className="text-3xl font-serif mb-8 pb-4 border-b border-gray-800">Featured Accommodation</h3>
                            <ul className="space-y-6">
                                {pageData.hotelsMentioned.map((hotel, idx) => (
                                    <li key={idx} className="flex flex-col border-b border-gray-800 pb-5 last:border-0 last:pb-0">
                                        <span className="text-gray-100 text-lg font-medium">{hotel.name}</span>
                                        <span className="text-sm uppercase tracking-[0.15em] text-primary-400 mt-2">{hotel.rating}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </aside>

                </div>

                {/* 5. Rich FAQ Section mapped to FAQPage Schema */}
                <section aria-labelledby="faq-section" className="mt-20 bg-white p-10 sm:p-20 border border-gray-100 shadow-xl rounded-xl mb-20">
                    <div className="max-w-4xl mx-auto">
                        <h2 id="faq-section" className="text-4xl md:text-5xl font-serif text-gray-900 mb-12 text-center tracking-tight">Traveler Inquiries</h2>
                        <div className="space-y-10 border-t border-gray-100 pt-10">
                            {pageData.faqs.map((faq, idx) => (
                                <div key={idx} className="pb-10 border-b border-gray-100 last:border-0 last:pb-0">
                                    <h3 className="text-2xl font-serif text-gray-900 mb-4">{faq.question}</h3>
                                    <p className="text-gray-600 leading-loose text-lg font-light">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. Spiderweb Internal Linking Architecture */}
                <nav aria-label="Related Pages" className="mt-16 text-center pb-16">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em] mb-8">Continue Exploring</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {pageData.internalLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                href={`/${lang}${link.url.startsWith('/') ? link.url : `/${link.url}`}`}
                                className="px-6 py-3 bg-white border border-gray-200 rounded-full text-base font-medium text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:shadow-md transition duration-300"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>
                </nav>

            </div>

            <Footer lang={lang} />
        </main>
    );
}
