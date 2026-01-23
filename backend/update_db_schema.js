const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const db = require('./src/db');

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

        try {
            await db.query(`ALTER TABLE rental_requests ADD COLUMN user_id INT DEFAULT NULL`);
            console.log('Added user_id column to rental_requests.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('user_id column already exists in rental_requests.');
            } else {
                console.error('Error adding user_id to rental_requests:', e.message);
            }
        }

        try {
            // Update messages type to include rental_request and admin_alert
            await db.query(`ALTER TABLE messages MODIFY COLUMN type ENUM('chat', 'rental_request', 'boost_request', 'admin_alert') DEFAULT 'chat'`);
            console.log('Updated messages type enum.');
        } catch (e) {
            console.error('Error updating messages type:', e.message);
        }

        console.log('Schema update complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

updateSchema();
