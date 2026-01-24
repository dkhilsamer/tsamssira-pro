const path = require('path');
const dotenv = require('dotenv');

// MUST call dotenv.config() BEFORE requiring db
dotenv.config({ path: path.join(__dirname, '.env') });

const db = require('./src/db');

async function fixTadmin() {
    try {
        console.log('Connecting to DB:', process.env.DB_HOST);
        const users = await db.query('SELECT id, username, role FROM users WHERE username = ?', ['Tadmin']);
        console.log('User found:', users);
        if (users.length > 0) {
            if (users[0].role !== 'admin') {
                console.log('Fixing Tadmin role to admin...');
                await db.query('UPDATE users SET role = "admin" WHERE username = ?', ['Tadmin']);
                console.log('Role updated successfully.');
            } else {
                console.log('Tadmin is already an admin.');
            }
        } else {
            console.log('Tadmin user not found in database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixTadmin();
