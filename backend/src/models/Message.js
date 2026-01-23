const db = require('../db');

class Message {
    static async create({ sender_id, receiver_id, property_id, content }) {
        const result = await db.query(
            'INSERT INTO messages (sender_id, receiver_id, property_id, message) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id, property_id || null, content]
        );
        return result.insertId;
    }

    static async getConversations(userId) {
        // Robust query: Get other user in conversation, and the latest message details
        const sql = `
            SELECT 
                u.id AS user_id, 
                u.username, 
                u.email, 
                m.message AS last_message, 
                m.created_at AS last_message_time,
                m.is_read
            FROM users u
            JOIN (
                SELECT 
                    CASE 
                        WHEN sender_id = ? THEN receiver_id 
                        ELSE sender_id 
                    END AS other_user_id,
                    MAX(created_at) AS max_time
                FROM messages
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY other_user_id
            ) latest ON u.id = latest.other_user_id
            JOIN messages m ON (
                (m.sender_id = ? AND m.receiver_id = u.id) OR 
                (m.sender_id = u.id AND m.receiver_id = ?)
            ) AND m.created_at = latest.max_time
            ORDER BY m.created_at DESC
        `;
        return await db.query(sql, [userId, userId, userId, userId, userId]);
    }

    static async getMessages(userId, otherUserId) {
        // property_id logic could be complex (conversation per property vs per user).
        // Let's stick to per-user conversation for now.
        const sql = `
            SELECT m.*, u.username as sender_name, m.message as content
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;
        return await db.query(sql, [userId, otherUserId, otherUserId, userId]);
    }

    static async markAsRead(userId, otherUserId) {
        const sql = `
            UPDATE messages 
            SET is_read = 1 
            WHERE receiver_id = ? AND sender_id = ?
        `;
        return await db.query(sql, [userId, otherUserId]);
    }
}

module.exports = Message;
