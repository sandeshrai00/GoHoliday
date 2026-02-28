import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { tours as toursSchema } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function POST(request) {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { tourId } = await request.json()

    const safeTourId = parseInt(tourId, 10);
    if (Number.isNaN(safeTourId) || safeTourId < 1) {
      return NextResponse.json(
        { error: 'Invalid tour ID' },
        { status: 400 }
      )
    }

    const db = getDb();
    await db.delete(toursSchema).where(eq(toursSchema.id, safeTourId));

    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete tour error:', error)
    return NextResponse.json(
      { error: 'An error occurred while deleting the tour' },
      { status: 500 }
    )
  }
}
