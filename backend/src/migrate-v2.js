const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('./db');

async function migrate() {
    console.log('Starting migration...');
    try {
        console.log('Adding latitude...');
        try {
            await db.query(`ALTER TABLE properties ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL`);
            console.log('✅ Column latitude added');
        } catch (e) { console.log('⚠️ Latitude column might already exist'); }

        console.log('Adding longitude...');
        try {
            await db.query(`ALTER TABLE properties ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL`);
            console.log('✅ Column longitude added');
        } catch (e) { console.log('⚠️ Longitude column might already exist'); }

        // Create notifications table
        await db.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                link VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table notifications created successfully');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
