const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const RentalRequest = require('../models/RentalRequest');
const Message = require('../models/Message');
const db = require('../db');

// Dashboard stats (Admin/Owner)
router.get('/stats', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.session.userId;
    const username = req.session.username;
    const role = req.session.role;
    const isAdmin = role === 'admin' || (username && username.toLowerCase() === 'tadmin');

    try {
        let properties, requests;

        if (isAdmin) {
            properties = await Property.getAll();
            requests = await RentalRequest.getAll();
        } else {
            properties = await Property.getByUserId(userId);
            requests = await RentalRequest.getByOwnerId(userId);
        }

        // Count requests sent BY the user
        const sentRequests = await RentalRequest.getByVisitorId(userId);

        // Count unread messages
        const unreadCount = await Message.getUnreadCount(userId);

        // Calculate total views
        const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);

        // Boosted properties count
        const boostedCount = properties.filter(p => p.is_boosted).length;

        const stats = {
            properties: properties.length,
            requests: requests.length,
            sentRequests: sentRequests.length,
            unreadMessages: unreadCount,
            pending: requests.filter(r => r.status === 'pending').length,
            accepted: requests.filter(r => r.status === 'accepted').length,
            totalViews: totalViews,
            boosted: boostedCount
        };

        res.json({
            message: `Welcome to the dashboard, ${req.session.username}`,
            role: req.session.role,
            stats
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Advanced statistics (charts data)
router.get('/analytics', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.session.userId;
    const username = req.session.username;
    const role = req.session.role;
    const isAdmin = role === 'admin' || (username && username.toLowerCase() === 'tadmin');

    try {
        let whereClause = '';
        let params = [];

        if (!isAdmin) {
            whereClause = 'WHERE p.user_id = ?';
            params = [userId];
        }

        // Properties by status
        const statusData = await db.query(`
            SELECT status, COUNT(*) as count 
            FROM properties p ${whereClause}
            GROUP BY status
        `, params);

        // Properties by type
        const typeData = await db.query(`
            SELECT property_category, COUNT(*) as count 
            FROM properties p ${whereClause}
            GROUP BY property_category
        `, params);

        // Requests by month (last 6 months)
        const requestsWhereClause = isAdmin ? '' : 'WHERE p.user_id = ?';
        const requestsMonthly = await db.query(`
            SELECT 
                DATE_FORMAT(r.created_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM rental_requests r
            JOIN properties p ON r.property_id = p.id
            ${requestsWhereClause}
            GROUP BY DATE_FORMAT(r.created_at, '%Y-%m')
            ORDER BY month DESC
            LIMIT 6
        `, isAdmin ? [] : [userId]);

        // Top viewed properties
        const topProperties = await db.query(`
            SELECT id, title, views, location 
            FROM properties p ${whereClause}
            ORDER BY views DESC
            LIMIT 5
        `, params);

        res.json({
            statusData,
            typeData,
            requestsMonthly: requestsMonthly.reverse(),
            topProperties
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
