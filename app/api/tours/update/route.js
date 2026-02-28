import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { tours as toursSchema, tour_categories as tourCategoriesSchema } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { translateTourFields } from '@/lib/translate'

export async function POST(request) {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { id, title, description, price, currency, duration, dates, location, banner_image, image_urls, video_urls, is_discount_active, discount_percentage, category_ids } = data

    const safeId = parseInt(id, 10)
    if (Number.isNaN(safeId) || safeId < 1) {
      return NextResponse.json(
        { error: 'Invalid tour ID' },
        { status: 400 }
      )
    }

    // Validation
    if (!title || !description || !price || !duration || !dates || !location) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Translate tour fields to Thai and Chinese
    const translatedFields = await translateTourFields({ title, description, location });

    const db = getDb();
    await db.update(toursSchema).set({
      title: translatedFields.title_en,
      title_en: translatedFields.title_en,
      title_th: translatedFields.title_th,
      title_zh: translatedFields.title_zh,
      description: translatedFields.description_en,
      description_en: translatedFields.description_en,
      description_th: translatedFields.description_th,
      description_zh: translatedFields.description_zh,
      location: translatedFields.location_en,
      location_en: translatedFields.location_en,
      location_th: translatedFields.location_th,
      location_zh: translatedFields.location_zh,
      price: price,
      currency: currency || 'USD',
      duration: duration,
      dates: dates,
      banner_image: banner_image,
      image_urls: image_urls || '[]',
      video_urls: video_urls || '[]',
      is_discount_active: is_discount_active ? 1 : 0,
      discount_percentage: is_discount_active && discount_percentage ? parseFloat(discount_percentage) : null
    }).where(eq(toursSchema.id, id));

    // Handle Category Mapping Update
    // 1. Delete existing connections
    await db.delete(tourCategoriesSchema).where(eq(tourCategoriesSchema.tour_id, safeId));

    // 2. Re-insert new connections if any
    if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        tour_id: safeId,
        category_id: parseInt(categoryId)
      }));
      await db.insert(tourCategoriesSchema).values(categoryLinks);
    }

    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update tour error:', error)
    return NextResponse.json(
      { error: 'An error occurred while updating the tour' },
      { status: 500 }
    )
  }
}
