import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { revalidatePath } from 'next/cache'
import { announcements as announcementsSchema, tours as toursSchema } from '@/lib/schema'
import { eq, and, ne } from 'drizzle-orm'

export async function POST(request) {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, is_active } = await request.json()

    const safeId = parseInt(id, 10);
    if (Number.isNaN(safeId) || safeId < 1) {
      return NextResponse.json(
        { error: 'Invalid announcement ID' },
        { status: 400 }
      )
    }

    const db = getDb();
    const newActiveValue = is_active ? 1 : 0;

    // Get the target announcement
    const targetResult = await db.select().from(announcementsSchema).where(eq(announcementsSchema.id, safeId));

    if (targetResult.length > 0) {
      const target = targetResult[0];
      const targetType = target.type;

      if (newActiveValue === 1) {
        // If activating a discount popup, we need to deactivate any other active discount popup's tour
        if (targetType === 'popup') {
          const activePopups = await db.select()
            .from(announcementsSchema)
            .where(
              and(
                eq(announcementsSchema.type, targetType),
                eq(announcementsSchema.is_active, 1),
                ne(announcementsSchema.id, safeId)
              )
            );

          for (const popup of activePopups) {
            if (popup.popup_type === 'discount' && popup.discount_tour_id) {
              await db.update(toursSchema)
                .set({ is_discount_active: 0 })
                .where(eq(toursSchema.id, popup.discount_tour_id));
            }
          }
        }

        // Deactivate all other announcements of the same type
        await db.update(announcementsSchema)
          .set({ is_active: 0 })
          .where(
            and(
              eq(announcementsSchema.type, targetType),
              ne(announcementsSchema.id, safeId),
              eq(announcementsSchema.is_active, 1)
            )
          );
      }

      // Sync target's discount to the tour
      if (target.popup_type === 'discount' && target.discount_tour_id) {
        if (newActiveValue === 1) {
          await db.update(toursSchema)
            .set({
              is_discount_active: 1,
              discount_percentage: target.discount_percentage
            })
            .where(eq(toursSchema.id, target.discount_tour_id));
        } else {
          await db.update(toursSchema)
            .set({ is_discount_active: 0 })
            .where(eq(toursSchema.id, target.discount_tour_id));
        }
      }
    }

    // Toggle the target announcement
    await db.update(announcementsSchema)
      .set({ is_active: newActiveValue })
      .where(eq(announcementsSchema.id, safeId));

    revalidatePath('/admin/announcements')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Toggle announcement error:', error)
    return NextResponse.json(
      { error: 'An error occurred while toggling the announcement' },
      { status: 500 }
    )
  }
}
