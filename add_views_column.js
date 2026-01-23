const db = require('./backend/src/db');

async function updateSchemaForViews() {
    try {
        console.log('Adding views column to properties table...');

        try {
            await db.query(`ALTER TABLE properties ADD COLUMN views INT DEFAULT 0`);
            console.log('Added views column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('views column already exists.');
            } else {
                console.error('Error adding views:', e.message);
            }
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

updateSchemaForViews();
