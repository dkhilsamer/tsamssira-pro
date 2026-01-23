require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require('mysql2/promise');

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tsamssira_pro',
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected to database...');

        // Add type column to messages table
        await connection.execute(`
      ALTER TABLE messages 
      ADD COLUMN type ENUM('chat','boost_request') NOT NULL DEFAULT 'chat'
    `);

        console.log('✅ messages.type column added successfully');
        await connection.end();
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('✅ messages.type column already exists');
        } else {
            console.error('Error:', error.message);
        }
        process.exit(error.code === 'ER_DUP_FIELDNAME' ? 0 : 1);
    }
})();
