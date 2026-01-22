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
        // Get list of unique users this user has interacted with, with latest message info
        const sql = `
            SELECT 
                u.id AS user_id, 
                u.username, 
                u.email,
                m.message AS last_message,
                m.created_at AS last_message_date,
                m.is_read,
                m.sender_id AS last_sender_id
            FROM messages m
            JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
            WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.id != ?
            AND m.id IN (
                SELECT MAX(id) 
                FROM messages 
                WHERE sender_id = ? OR receiver_id = ?
                GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
            )
            ORDER BY m.created_at DESC
        `;
        // We need simplify this query or handle it better.
        // A simpler way: Find all distinct pairs, then find latest message for each pair.
        // But for MVP, let's just get all messages and process in JS or do a simpler query.

        // Simpler query: Get all messages involving user, join with other user info.
        // Optimization: Let's focus on basic retrieval first.

        // Let's rely on backend filtering for now.
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
