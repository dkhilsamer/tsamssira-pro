const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Property = require('../models/Property');
const User = require('../models/User');
const { sendRentalRequestNotification } = require('../services/emailService');

// Get all requests (Admin/Owner only - simplified to auth required)
router.get('/', async (req, res) => {
    const userId = req.session.userId;
    const role = req.session.role;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        let requests;
        if (role === 'admin') {
            requests = await RentalRequest.getAll();
        } else {
            requests = await RentalRequest.getByOwnerId(userId);
        }
        res.json(requests);
    } catch (err) {
        console.error('Get rental requests error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new request (Public)
router.post('/', async (req, res) => {
    const { property_id, visitor_name, visitor_email, visitor_phone, request_type, num_persons, message } = req.body;

    if (!property_id || !visitor_name || !visitor_email || !visitor_phone || !request_type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const insertId = await RentalRequest.create(req.body);

        // Notification Email Logic
        try {
            const property = await Property.findById(property_id);
            if (property && property.user_id) {
                const owner = await User.findById(property.user_id);
                if (owner && owner.email) {
                    await sendRentalRequestNotification(
                        owner.email,
                        visitor_name,
                        visitor_email,
                        visitor_phone,
                        property.title,
                        message || 'Pas de message'
                    );
                }
            }
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr.message);
            // Don't fail the request if email fails
        }

        res.status(201).json({ message: 'Request submitted successfully', id: insertId });
    } catch (err) {
        console.error('Create rental request error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update status (Admin/Owner only)
router.put('/:id/status', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { status } = req.body; // pending, accepted, rejected

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        await RentalRequest.updateStatus(id, status);
        res.json({ message: 'Status updated' });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
