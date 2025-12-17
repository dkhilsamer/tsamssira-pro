const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Property = require('../models/Property');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Get all requests (Admin/Owner only - simplified to auth required)
// Get all requests (Admin sees all, Owner sees only their property requests)
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
                if (owner && owner.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
                    await transporter.sendMail({
                        from: process.env.SMTP_USER,
                        to: owner.email,
                        subject: `Nouvelle demande pour ${property.title}`,
                        html: `
                            <h3>Nouvelle demande reçue</h3>
                            <p><strong>De:</strong> ${visitor_name} (${visitor_email}, ${visitor_phone})</p>
                            <p><strong>Message:</strong></p>
                            <p>${message}</p>
                            <p>Connectez-vous à votre tableau de bord pour répondre.</p>
                        `
                    });
                }
            }
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
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
