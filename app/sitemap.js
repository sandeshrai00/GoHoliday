import { getDb } from '@/lib/turso'
import { tours as toursSchema } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import { locales } from '@/lib/i18n'
import { getAllSeoSlugs } from '@/lib/seo-content'

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goholidays.me';

    // Base static routes that apply to all locales
    const routes = ['', '/tours', '/privacy'];

    // Generate localized static route entries
    const staticEntries = locales.flatMap((lang) =>
        routes.map((route) => ({
            url: `${baseUrl}/${lang}${route}`,
            lastModified: new Date().toISOString(),
            changeFrequency: route === '' ? 'daily' : 'weekly',
            priority: route === '' ? 1.0 : 0.8,
            alternates: {
                languages: Object.fromEntries(
                    locales.map((l) => [l, `${baseUrl}/${l}${route}`])
                )
            }
        }))
    );

    // Default fallback if DB fails
    let tourEntries = [];

    try {
        const db = getDb();
        const result = await db.select({
            id: toursSchema.id,
            updated_at: toursSchema.updated_at
        }).from(toursSchema).orderBy(desc(toursSchema.created_at));

        // Generate localized tour route entries
        tourEntries = result.flatMap((tour) => {
            const lastModified = tour.updated_at ? new Date(tour.updated_at).toISOString() : new Date().toISOString();

            return locales.map((lang) => ({
                url: `${baseUrl}/${lang}/tours/${tour.id}`,
                lastModified: lastModified,
                changeFrequency: 'weekly',
                priority: 0.9,
                alternates: {
                    languages: Object.fromEntries(
                        locales.map((l) => [l, `${baseUrl}/${l}/tours/${tour.id}`])
                    )
                }
            }));
        });
    } catch (error) {
        console.error('Error fetching tours for sitemap:', error);
    }

    // Generate localized SEO Pillar Page entries
    const seoSlugs = getAllSeoSlugs();
    const seoEntries = seoSlugs.flatMap((slug) =>
        locales.map((lang) => ({
            url: `${baseUrl}/${lang}/${slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
            alternates: {
                languages: Object.fromEntries(
                    locales.map((l) => [l, `${baseUrl}/${l}/${slug}`])
                )
            }
        }))
    );

    return [...staticEntries, ...tourEntries, ...seoEntries];
}
