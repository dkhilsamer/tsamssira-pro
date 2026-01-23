const db = require('../db');
const bcrypt = require('bcryptjs');

class User {
    static async findByUsername(username) {
        const rows = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0] || null;
    }

    static async getAll() {
        // Warning: Exposing plain_password is insecure!
        return await db.query('SELECT id, username, email, role, phone, address, plain_password FROM users');
    }

    static async findById(id) {
        const rows = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async findByEmail(email) {
        const rows = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    }

    static async create({ username, email, password, role = 'proprietaire', phone = null, address = null, birth_date = null, gender = null }) {
        const hash = await bcrypt.hash(password, 10);
        // Store plain password as requested (INSECURE)
        const result = await db.query(
            'INSERT INTO users (username, email, password, plain_password, role, phone, address, birth_date, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [username, email, hash, password, role, phone, address, birth_date, gender]
        );
        return result.insertId;
    }

    static async verifyPassword(plain, hash) {
        return await bcrypt.compare(plain, hash);
    }

    static async updatePassword(id, newPassword) {
        const hash = await bcrypt.hash(newPassword, 10);
        return await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
    }

    static async delete(id) {
        return await db.query('DELETE FROM users WHERE id = ?', [id]);
    }

    static async updateRole(id, role) {
        return await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    }
}

module.exports = User;
