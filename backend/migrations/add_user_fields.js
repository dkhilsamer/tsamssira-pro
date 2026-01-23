require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require('mysql2/promise');

(async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tsamssira_pro'
    });
    // Add birth_date column if not exists
    await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE NULL`);
    // Add gender column if not exists (enum)
    await connection.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender ENUM('male','female','other') NULL`);
    console.log('Migration completed: birth_date and gender columns ensured.');
    await connection.end();
})();
