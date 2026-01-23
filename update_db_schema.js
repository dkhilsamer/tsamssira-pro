const db = require('./backend/src/db');

async function updateSchema() {
    try {
        console.log('Adding columns to users table...');

        try {
            await db.query(`ALTER TABLE users ADD COLUMN birth_date DATE DEFAULT NULL`);
            console.log('Added birth_date column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('birth_date column already exists.');
            } else {
                console.error('Error adding birth_date:', e.message);
            }
        }

        try {
            await db.query(`ALTER TABLE users ADD COLUMN gender ENUM('Homme', 'Femme', 'Autre') DEFAULT NULL`);
            console.log('Added gender column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('gender column already exists.');
            } else {
                console.error('Error adding gender:', e.message);
            }
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

updateSchema();
