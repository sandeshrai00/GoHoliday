import { NextResponse } from 'next/server';
import { getTurso } from '@/lib/turso';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    try {
        // Disable migration endpoint in production (run migrations via CLI/scripts instead)
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
      ALTER TABLE bookings ADD COLUMN admin_note TEXT;
    `);

        return NextResponse.json({ success: true, message: 'Migration executed: Added admin_note to bookings' });
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            return NextResponse.json({ success: true, message: 'Column admin_note already exists' });
        }
        console.error('Migration error:', error.message);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
}
