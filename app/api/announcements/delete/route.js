import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { announcements as announcementsSchema } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
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

    const { id } = await request.json()

    const safeId = parseInt(id, 10);
    if (Number.isNaN(safeId) || safeId < 1) {
      return NextResponse.json(
        { error: 'Invalid announcement ID' },
        { status: 400 }
      )
    }

    const db = getDb();

    // Check if we are deleting an active discount popup
    const target = await db.select().from(announcementsSchema).where(eq(announcementsSchema.id, safeId));
    if (target.length > 0) {
      const ann = target[0];
      if (ann.is_active === 1 && ann.popup_type === 'discount' && ann.discount_tour_id) {
        // Deactivate the discount on the tour
        await db.update(toursSchema)
          .set({ is_discount_active: 0 })
          .where(eq(toursSchema.id, ann.discount_tour_id));
      }
    }

    await db.delete(announcementsSchema).where(eq(announcementsSchema.id, safeId));

    revalidatePath('/admin/announcements')
    revalidatePath('/')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the announcement' },
      { status: 500 }
    )
  }
}
