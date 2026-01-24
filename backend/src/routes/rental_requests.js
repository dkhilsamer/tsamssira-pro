const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { sendRentalRequestNotification, sendEmail } = require('../services/emailService');

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

// Get requests sent BY the user
router.get('/sent', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const requests = await RentalRequest.getByVisitorId(userId);
        res.json(requests);
    } catch (err) {
        console.error('Get sent requests error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get requests for a SPECIFIC property (Owner/Admin only)
router.get('/property/:propertyId', async (req, res) => {
    const userId = req.session.userId;
    const role = req.session.role;
    const { propertyId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        // Security: Only owner or admin
        if (role !== 'admin' && property.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const requests = await RentalRequest.getByPropertyId(propertyId);
        res.json(requests);
    } catch (err) {
        console.error('Get property requests error:', err);
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
        const insertId = await RentalRequest.create({
            ...req.body,
            visitor_phone: visitor_phone ? visitor_phone.toString().substring(0, 20) : '',
            user_id: req.session.userId || null
        });

        // Notification Logic (Email + In-app Message)
        try {
            const property = await Property.findById(property_id);
            if (property && property.user_id) {
                // 1. Email Notification
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

                // 2. In-app Message Notification
                const visitorDisplay = visitor_name || 'Un visiteur';
                let messageContent = `Nouvelle demande pour "${property.title}":\n`;
                messageContent += `Type: ${request_type}\n`;
                messageContent += `Nom: ${visitorDisplay}\n`;
                messageContent += `Message: ${message || 'Pas de message'}`;

                await Message.create({
                    sender_id: req.session.userId || 1, // Fallback to admin/system if guest
                    receiver_id: property.user_id,
                    property_id: property.id,
                    content: messageContent,
                    type: 'rental_request'
                });

                // 3. Internal Notification
                await Notification.create({
                    user_id: property.user_id,
                    type: 'request',
                    title: 'Nouvelle demande',
                    message: `Vous avez reçu une nouvelle demande pour "${property.title}" de la part de ${visitorDisplay}.`,
                    link: `/dashboard/requests`
                });
            }
        } catch (notifyErr) {
            console.error('Notification failed:', notifyErr.message);
            // Don't fail the request if notification fails
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

        // Notify the requester if they are a member
        try {
            const request = await RentalRequest.findById(id);
            if (request && request.user_id) {
                const property = await Property.findById(request.property_id);
                const owner = await User.findById(req.session.userId);

                let statusText = status === 'accepted' ? 'acceptée' : 'refusée';
                let messageContent = `Votre demande pour "${property?.title || 'le bien'}" a été ${statusText} par le propriétaire.`;

                await Message.create({
                    sender_id: req.session.userId,
                    receiver_id: request.user_id,
                    property_id: request.property_id,
                    content: messageContent,
                    type: 'chat'
                });

                // Internal Notification
                await Notification.create({
                    user_id: request.user_id,
                    type: 'status_update',
                    title: `Demande ${statusText}`,
                    message: messageContent,
                    link: `/dashboard/history`
                });

                // Optionally send email
                const requester = await User.findById(request.user_id);
                if (requester && requester.email) {
                    const subject = `Mise à jour de votre demande - Tsamssira Pro`;
                    const html = `
                        <h2>Sujet: Votre demande a été ${statusText}</h2>
                        <p>Bonjour ${requester.username},</p>
                        <p>Le propriétaire a ${statusText} votre demande pour "${property?.title}".</p>
                        <p>Connectez-vous pour voir les détails et discuter.</p>
                    `;
                    await sendEmail(requester.email, subject, html).catch(err => console.error('Status update email failed:', err));
                }
            }
        } catch (notifyErr) {
            console.error('Notification on status update failed:', notifyErr);
        }

        res.json({ message: 'Status updated' });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
