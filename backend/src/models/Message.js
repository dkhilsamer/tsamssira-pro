const db = require('../db');

class Message {
    static async create({ sender_id, receiver_id, property_id, content, type = 'chat' }) {
        // Log basic message info to console for debugging
        console.log(`Sending message: ${type} from ${sender_id} to ${receiver_id}`);

        const result = await db.query(
            'INSERT INTO messages (sender_id, receiver_id, property_id, message, type) VALUES (?, ?, ?, ?, ?)',
            [sender_id, receiver_id, property_id || null, content, type]
        );
        return result.insertId;
    }

    static async getConversations(userId) {
        const sql = `
            SELECT 
                u.id AS user_id, 
                u.username, 
                u.email, 
                m.message AS last_message, 
                m.created_at AS last_message_time,
                m.is_read,
                m.type,
                m.property_id,
                p.title as property_title,
                (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = u.id AND m2.receiver_id = ? AND m2.is_read = 0) as unread_count
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
            LEFT JOIN properties p ON m.property_id = p.id
            ORDER BY m.created_at DESC
        `;
        return await db.query(sql, [userId, userId, userId, userId, userId, userId]);
    }

    static async getMessages(userId, otherUserId) {
        // property_id logic could be complex (conversation per property vs per user).
        // Let's stick to per-user conversation for now.
        const sql = `
            SELECT m.*, u.username as sender_name, m.message as content, m.type, m.property_id
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

    static async getUnreadCount(userId) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM messages 
            WHERE receiver_id = ? AND is_read = 0
        `;
        const rows = await db.query(sql, [userId]);
        return rows[0].count;
    }

    static async cleanupOldMessages() {
        const sql = `
            DELETE FROM messages 
            WHERE created_at < NOW() - INTERVAL 2 DAY
        `;
        const result = await db.query(sql);
        console.log(`🧹 Cleanup: Deleted ${result.affectedRows || 0} messages older than 48 hours.`);
        return result;
    }
}

module.exports = Message;
