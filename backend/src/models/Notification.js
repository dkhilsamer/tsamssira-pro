const db = require('../db');

class Notification {
    static async create({ user_id, type, title, message, link = null }) {
        return await db.query(
            'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)',
            [user_id, type, title, message, link]
        );
    }

    static async getByUserId(userId) {
        return await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
    }

    static async markAsRead(id, userId) {
        return await db.query(
            'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
            [id, userId]
        );
    }
}

module.exports = Notification;
