const mysql = require('mysql2/promise');

let pool;

// MySQL uniquement (compatible Aiven et local)
pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tsamssira_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_HOST?.includes('aivencloud') ? {
        rejectUnauthorized: false
    } : false
});

console.log('🐬 Using MySQL:', process.env.DB_HOST || 'localhost');

// Wrapper MySQL
const query = async (sql, params = []) => {
    const [rows] = await pool.query(sql, params);
    return rows;
};

module.exports = { query, pool };
