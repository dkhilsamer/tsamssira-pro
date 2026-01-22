const mysql = require('mysql2/promise');
const { Pool } = require('pg');

let pool;

// Détection automatique du type de base de données
if (process.env.DATABASE_URL) {
    // PostgreSQL (Render, Heroku, etc.)
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    console.log('🐘 Using PostgreSQL');
} else {
    // MySQL (local)
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'tsamssira_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log('🐬 Using MySQL');
}

// Wrapper compatible MySQL et PostgreSQL
const query = async (sql, params = []) => {
    if (process.env.DATABASE_URL) {
        // PostgreSQL
        const convertedSql = sql.replace(/\?/g, (match, offset) => {
            const index = sql.substring(0, offset).split('?').length;
            return `$${index}`;
        });
        const result = await pool.query(convertedSql, params);
        return result.rows;
    } else {
        // MySQL
        const [rows] = await pool.query(sql, params);
        return rows;
    }
};

module.exports = { query, pool };
