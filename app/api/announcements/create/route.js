import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { announcements as announcementsSchema } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { translateAnnouncementMessage } from '@/lib/translate'
import { tours as toursSchema } from '@/lib/schema'

export async function POST(request) {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, is_active, type, image_url, popup_type, discount_tour_id, discount_percentage } = await request.json()

    const VALID_TYPES = ['banner', 'popup'];
    const safeType = type && VALID_TYPES.includes(String(type).toLowerCase()) ? String(type).toLowerCase() : 'banner';

    const VALID_POPUP_TYPES = ['discount', 'new_feature', 'system_update', 'general'];
    const safePopupType = popup_type && VALID_POPUP_TYPES.includes(String(popup_type).toLowerCase()) ? String(popup_type).toLowerCase() : 'general';

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Translate announcement message to Thai and Chinese
    const translatedMessages = await translateAnnouncementMessage(message);

    const db = getDb();

    // If activating, enforce single-active per type (max 1 banner + 1 popup)
    if (is_active) {
      await db.update(announcementsSchema)
        .set({ is_active: 0 })
        .where(
          and(
            eq(announcementsSchema.type, safeType),
            eq(announcementsSchema.is_active, 1)
          )
        );
    }

    // Insert announcement
    const insertValues = {
      message: translatedMessages.message_en,
      message_en: translatedMessages.message_en,
      message_th: translatedMessages.message_th,
      message_zh: translatedMessages.message_zh,
      is_active: is_active ? 1 : 0,
      type: safeType,
      popup_type: safePopupType,
      image_url: image_url || null
    }

    // Add discount fields if popup_type is discount
    if (safePopupType === 'discount' && discount_tour_id) {
      const tourId = parseInt(discount_tour_id, 10)
      const pct = parseFloat(discount_percentage)
      if (!Number.isNaN(tourId) && tourId > 0) {
        insertValues.discount_tour_id = tourId
      }
      if (!Number.isNaN(pct) && pct > 0 && pct < 100) {
        insertValues.discount_percentage = pct
      }

      // Sync the discount directly to the tour if creating an active discount announcement
      if (is_active && !Number.isNaN(tourId) && tourId > 0 && !Number.isNaN(pct) && pct > 0 && pct < 100) {
        await db.update(toursSchema)
          .set({
            is_discount_active: 1,
            discount_percentage: pct
          })
          .where(eq(toursSchema.id, tourId))
      }
    }

    await db.insert(announcementsSchema).values(insertValues);

    revalidatePath('/admin/announcements')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json(
      { error: 'An error occurred while creating the announcement' },
      { status: 500 }
    )
  }
}