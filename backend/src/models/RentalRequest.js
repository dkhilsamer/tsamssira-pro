const db = require('../db');

class RentalRequest {
    static async getAll() {
        const sql = `
            SELECT r.*, p.title as property_title 
            FROM rental_requests r
            JOIN properties p ON r.property_id = p.id
            ORDER BY r.created_at DESC
        `;
        return await db.query(sql);
    }

    static async findById(id) {
        const rows = await db.query('SELECT * FROM rental_requests WHERE id = ?', [id]);
        return rows[0] || null;
    }

    static async create(data) {
        const { property_id, visitor_name, visitor_email, visitor_phone, request_type, num_persons, message, user_id } = data;
        // Auto-accept requests as per user requirement
        const result = await db.query(
            `INSERT INTO rental_requests (property_id, visitor_name, visitor_email, visitor_phone, request_type, num_persons, message, status, user_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [property_id, visitor_name, visitor_email, visitor_phone, request_type, num_persons, message, user_id || null]
        );
        return result.insertId;
    }

    static async updateStatus(id, status) {
        return await db.query('UPDATE rental_requests SET status = ? WHERE id = ?', [status, id]);
    }

    static async delete(id) {
        return await db.query('DELETE FROM rental_requests WHERE id = ?', [id]);
    }

    static async getByPropertyId(propertyId) {
        return await db.query('SELECT * FROM rental_requests WHERE property_id = ? ORDER BY created_at DESC', [propertyId]);
    }

    static async getByOwnerId(userId) {
        // Join with properties table to filter by owner's user_id
        const sql = `
            SELECT r.*, p.title as property_title 
            FROM rental_requests r
            JOIN properties p ON r.property_id = p.id
            WHERE p.user_id = ?
            ORDER BY r.created_at DESC
        `;
        return await db.query(sql, [userId]);
    }

    static async getByVisitorId(userId) {
        const sql = `
            SELECT r.*, p.title as property_title 
            FROM rental_requests r
            JOIN properties p ON r.property_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        return await db.query(sql, [userId]);
    }
}

module.exports = RentalRequest;
