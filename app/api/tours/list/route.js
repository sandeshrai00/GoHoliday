import { NextResponse } from 'next/server'
import { getDb } from '@/lib/turso'
import { tours as toursSchema, tour_categories as tourCategoriesSchema, categories as categoriesSchema } from '@/lib/schema'
import { desc, eq, inArray } from 'drizzle-orm'

export async function GET() {
    try {
        const db = getDb();
        const result = await db.select({
            id: toursSchema.id,
            title: toursSchema.title,
            title_en: toursSchema.title_en,
            price: toursSchema.price,
            currency: toursSchema.currency,
            location: toursSchema.location,
            location_en: toursSchema.location_en,
            is_discount_active: toursSchema.is_discount_active,
            discount_percentage: toursSchema.discount_percentage,
            image_urls: toursSchema.image_urls,
            banner_image: toursSchema.banner_image,
        }).from(toursSchema).orderBy(desc(toursSchema.created_at));

        if (result.length === 0) {
            return NextResponse.json([]);
        }

        const tourIds = result.map(t => t.id);

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
        const toursWithCategories = result.map(tour => ({
            ...tour,
            categories: categoriesByTour[tour.id] || []
        }));

        return NextResponse.json(toursWithCategories)
    } catch (error) {
        console.error('Error fetching tours list:', error)
        return NextResponse.json([], { status: 500 })
    }
}
