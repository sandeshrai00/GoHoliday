import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    try {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: 'Migrations are not available in production' },
                { status: 404 }
            );
        }
        // Auth check - only admins can run migrations
        const authenticated = await isAuthenticated();
        if (!authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const client = getTurso();

        await client.execute(`
      ALTER TABLE tours ADD COLUMN video_urls TEXT;
    `);

        return NextResponse.json({ success: true, message: 'Migration executed: Added video_urls to tours' });
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            return NextResponse.json({ success: true, message: 'Column video_urls already exists' });
        }
        console.error('Migration error:', error.message);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
}
