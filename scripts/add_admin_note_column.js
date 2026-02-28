require('dotenv').config({ path: '.env.local' });
const { getTurso } = require('../lib/db');

async function addAdminNoteColumn() {
    console.log('Adding admin_note column to bookings table...');

    try {
        const turso = getTurso();

        // Check if column exists (SQLite doesn't support IF NOT EXISTS for columns easily in all versions, 
        // but adding it will fail if it exists, use try-catch)
        try {
            await turso.execute(`
        ALTER TABLE bookings ADD COLUMN admin_note TEXT;
        `);
            console.log('[OK] admin_note column added successfully');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('[OK] admin_note column already exists');
            } else {
                throw e;
            }
        }

        console.log('Migration complete!');
    } catch (error) {
        console.error('Error runing migration:', error);
        process.exit(1);
    }
}

addAdminNoteColumn();
