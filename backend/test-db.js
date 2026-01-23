require('dotenv').config();
const mysql = require('mysql2/promise');

async function test() {
    try {
        console.log('Connecting to:', process.env.DB_HOST);
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        console.log('✅ Connected to Aiven DB!');
        await conn.end();
    } catch (e) {
        console.error('❌ Connection failed:', e.message);
    }
}
test();
