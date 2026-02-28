import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getDb } from '@/lib/turso'
import { categories as categoriesSchema, tour_categories as tourCategoriesSchema } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function POST(request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await request.json()
        const safeId = parseInt(id, 10);

        if (Number.isNaN(safeId) || safeId < 1) {
            return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 })
        }

        const db = getDb();

        // Delete category mappings from the join table first
        await db.delete(tourCategoriesSchema).where(eq(tourCategoriesSchema.category_id, safeId));

        // Then delete the category itself
        await db.delete(categoriesSchema).where(eq(categoriesSchema.id, safeId));

        revalidatePath('/admin/categories')
        revalidatePath('/tours')
        revalidatePath('/')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete category error:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}
