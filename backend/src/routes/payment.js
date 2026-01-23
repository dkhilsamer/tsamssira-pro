const express = require('express');
const router = express.Router();

const db = require('../db');
const Message = require('../models/Message');
const Property = require('../models/Property');
const User = require('../models/User');

// Routes for Property Boost Management

// Get pending requests (Admin)
router.get('/pending', async (req, res) => {
    if (req.session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    try {
        const sql = `
            SELECT br.*, p.title as property_title, p.location, p.price, u.username as owner_name, u.email as owner_email 
            FROM boost_requests br
            JOIN properties p ON br.property_id = p.id
            JOIN users u ON p.user_id = u.id
            WHERE br.status = 'pending'
            ORDER BY br.created_at DESC
        `;
        const requests = await db.query(sql);
        res.json(requests);
    } catch (err) {
        console.error('Get pending boost requests error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Request Boost (Owner)
router.post('/request/:propertyId', async (req, res) => {
    const { propertyId } = req.params;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await db.query('INSERT INTO boost_requests (property_id, user_id, status) VALUES (?, ?, ?)', [propertyId, userId, 'pending']);

        // Notify Admins via Messaging
        try {
            const property = await Property.findById(propertyId);
            const user = await User.findById(userId);

            const admins = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
            if (admins.length > 0) {
                const adminId = admins[0].id;
                await Message.create({
                    sender_id: userId,
                    receiver_id: adminId,
                    property_id: propertyId,
                    content: `Demande de boost pour la propriété "${property?.title || propertyId}" par ${user?.username || 'un utilisateur'}.`,
                    type: 'boost_request'
                });
            }
        } catch (msgErr) {
            console.error('Error creating boost message notification:', msgErr);
        }

        res.json({ success: true, message: 'Demande de boost envoyée.' });
    } catch (err) {
        console.error('Request boost error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Boost (Direct)
router.post('/boost/:propertyId', async (req, res) => {
    if (req.session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { propertyId } = req.params;

    try {
        // Set boosted for 7 days
        await db.query('UPDATE properties SET is_boosted = 1, boost_end_date = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?', [propertyId]);
        res.json({ success: true, message: 'Propriété boostée.' });
    } catch (err) {
        console.error('Admin boost error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve Boost Request
router.put('/approve/:id', async (req, res) => {
    if (req.session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;

    try {
        const reqs = await db.query('SELECT property_id FROM boost_requests WHERE id = ?', [id]);
        if (reqs.length === 0) return res.status(404).json({ error: 'Request not found' });
        const propertyId = reqs[0].property_id;

        await db.query('UPDATE boost_requests SET status = ? WHERE id = ?', ['approved', id]);
        await db.query('UPDATE properties SET is_boosted = 1, boost_end_date = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?', [propertyId]);

        res.json({ success: true, message: 'Boost approuvé.' });
    } catch (err) {
        console.error('Approve boost error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Reject Boost Request
router.put('/reject/:id', async (req, res) => {
    if (req.session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { id } = req.params;

    try {
        await db.query('UPDATE boost_requests SET status = ? WHERE id = ?', ['rejected', id]);
        res.json({ success: true, message: 'Boost refusé.' });
    } catch (err) {
        console.error('Reject boost error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
