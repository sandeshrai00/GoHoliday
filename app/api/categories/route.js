import { NextResponse } from 'next/server'
import { getDb } from '@/lib/turso'
import { categories as categoriesSchema } from '@/lib/schema'
import { isAuthenticated } from '@/lib/auth'
import { desc } from 'drizzle-orm'

export async function GET() {
    try {
        const db = getDb();
        const result = await db.select().from(categoriesSchema).orderBy(desc(categoriesSchema.created_at));
        const categories = result.map(row => JSON.parse(JSON.stringify(row)));
        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json([], { status: 500 })
    }
}

export async function POST(request) {
    try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, name_en, name_th, name_zh, slug } = body

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
        }

        const db = getDb();
        const [newCategory] = await db.insert(categoriesSchema).values({
            name: String(name).trim().slice(0, 100),
            name_en: name_en ? String(name_en).trim().slice(0, 100) : null,
            name_th: name_th ? String(name_th).trim().slice(0, 100) : null,
            name_zh: name_zh ? String(name_zh).trim().slice(0, 100) : null,
            slug: String(slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 100)
        }).returning()

        return NextResponse.json({ success: true, category: newCategory }, { status: 201 })
    } catch (error) {
        console.error('Create category error:', error)
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ error: 'A category with this slug already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}
