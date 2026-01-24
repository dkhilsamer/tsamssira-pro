const db = require('../db');

class Property {
    static async getAll(filters = {}) {
        // First, clean up expired boosts
        await this.unboostExpired();

        let sql = 'SELECT * FROM properties';
        const params = [];
        const conditions = [];

        if (filters.minPrice) {
            conditions.push('price >= ?');
            params.push(filters.minPrice);
        }
        if (filters.maxPrice) {
            conditions.push('price <= ?');
            params.push(filters.maxPrice);
        }
        if (filters.city) {
            conditions.push('location LIKE ?');
            params.push(`%${filters.city}%`);
        }
        if (filters.type) {
            conditions.push('type = ?');
            params.push(filters.type);
        }

        if (filters.category) {
            conditions.push('property_category = ?');
            params.push(filters.category);
        }
        if (filters.bedrooms) {
            conditions.push('bedrooms >= ?');
            params.push(filters.bedrooms);
        }
        if (filters.is_student) {
            conditions.push('is_student = 1');
        }

        // Always show only visible properties publicly if not admin (handled in controller or generic filter)
        // For now, let's assume 'getAll' is mostly for public listing, so respect is_visible=1
        // But admin might use it too. Let's add an explicit filter or default.
        // Let's rely on controller to pass is_visible if needed. 
        // Actually, public list should only show is_visible=1.
        if (filters.publicOnly) {
            conditions.push('is_visible = 1');
            conditions.push('status = ?');
            params.push('Disponible');
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        // Sorting logic
        let orderBy = 'is_boosted DESC, created_at DESC'; // Default
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price_asc': orderBy = 'price ASC'; break;
                case 'price_desc': orderBy = 'price DESC'; break;
                case 'newest': orderBy = 'created_at DESC'; break;
                case 'oldest': orderBy = 'created_at ASC'; break;
                case 'area': orderBy = 'area DESC'; break;
            }
            // Always keep boosted first? User might want to override.
            // Let's keep boosted first unless they specify a strict sort.
            if (!['price_asc', 'price_desc'].includes(filters.sortBy)) {
                orderBy = 'is_boosted DESC, ' + orderBy;
            }
        }

        sql += ' ORDER BY ' + orderBy;

        return await db.query(sql, params);
    }

    static async findById(id) {
        const rows = await db.query(`
            SELECT p.*, u.username as owner_username 
            FROM properties p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.id = ?
        `, [id]);
        if (rows.length === 0) return null;

        const property = rows[0];

        // Fetch additional images
        const images = await db.query('SELECT image_url FROM property_images WHERE property_id = ?', [id]);
        property.images = images.map(img => img.image_url);

        return property;
    }

    static async create(data) {
        const {
            user_id, title, description, price, location, bedrooms, bathrooms, area, type,
            status = 'Disponible',
            property_category,
            latitude, longitude, google_maps_link,
            max_occupants = 0,
            is_furnished = 0,
            price_per_person = 0,
            is_student = 0,
            main_image, images
        } = data;

        const result = await db.query(
            `INSERT INTO properties (user_id, title, description, price, location, bedrooms, bathrooms, area, type, status, property_category, latitude, longitude, google_maps_link, max_occupants, is_furnished, price_per_person, is_student, main_image) 
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [user_id, title, description, price, location, bedrooms, bathrooms, area, type, status, property_category, latitude || null, longitude || null, google_maps_link || null, max_occupants, is_furnished, price_per_person, is_student, main_image || null]
        );

        const propertyId = result.insertId;

        // Insert additional images if provided
        if (images && Array.isArray(images) && images.length > 0) {
            // mysql2 supports bulk insert with array of arrays IF enabled, but safer to do standard multiple values
            // Or simpler: just loop for now to be safe and avoid syntax error
            for (const url of images) {
                await db.query('INSERT INTO property_images (property_id, image_url) VALUES (?, ?)', [propertyId, url]);
            }
        }

        return propertyId;
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(data)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        const sql = `UPDATE properties SET ${fields.join(', ')} WHERE id = ?`;
        return await db.query(sql, values);
    }

    static async getByUserId(userId) {
        return await db.query('SELECT * FROM properties WHERE user_id = ?', [userId]);
    }

    static async delete(id) {
        return await db.query('DELETE FROM properties WHERE id = ?', [id]);
    }

    static async toggleVisibility(id, isVisible) {
        return await db.query('UPDATE properties SET is_visible = ? WHERE id = ?', [isVisible, id]);
    }

    // Boost a property for 1 month
    static async boostProperty(id) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1); // 1 month boost

        return await db.query(
            'UPDATE properties SET is_boosted = 1, boost_start_date = ?, boost_end_date = ? WHERE id = ?',
            [now, endDate, id]
        );
    }

    // Remove boost from a property
    static async unboostProperty(id) {
        return await db.query(
            'UPDATE properties SET is_boosted = 0, boost_start_date = NULL, boost_end_date = NULL WHERE id = ?',
            [id]
        );
    }

    // Clean up expired boosts
    static async unboostExpired() {
        const now = new Date();
        return await db.query(
            'UPDATE properties SET is_boosted = 0, boost_start_date = NULL, boost_end_date = NULL WHERE is_boosted = 1 AND boost_end_date < ?',
            [now]
        );
    }

    // Get remaining boost days for a property
    static getBoostRemainingDays(boostEndDate) {
        if (!boostEndDate) return 0;
        const now = new Date();
        const endDate = new Date(boostEndDate);
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    static async incrementViews(id) {
        return await db.query('UPDATE properties SET views = COALESCE(views, 0) + 1 WHERE id = ?', [id]);
    }
}

module.exports = Property;
