const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const { sendNewMessageNotification } = require('../services/emailService');

// Middleware to check auth
const requireAuth = (req, res, next) => {
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

router.use(requireAuth);

// Get all conversations for current user
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await Message.getConversations(req.session.userId);
        res.json(conversations);
    } catch (err) {
        console.error('Get conversations error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get messages with specific user
router.get('/:otherUserId', async (req, res) => {
    try {
        const messages = await Message.getMessages(req.session.userId, req.params.otherUserId);
        // Mark as read when fetching
        await Message.markAsRead(req.session.userId, req.params.otherUserId);
        res.json(messages);
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send message
router.post('/', async (req, res) => {
    const { receiver_id, content, property_id } = req.body;

    if (!receiver_id || !content) {
        return res.status(400).json({ error: 'Receiver and content are required' });
    }

    try {
        const messageId = await Message.create({
            sender_id: req.session.userId,
            receiver_id,
            property_id,
            content
        });

        // Send notification email to the receiver

        try {
            const [sender, receiver, property] = await Promise.all([
                User.findById(req.session.userId),
                User.findById(receiver_id),
                property_id ? Property.findById(property_id) : Promise.resolve(null)
            ]);

            if (receiver && receiver.email) {
                const senderName = sender ? sender.username : 'Un utilisateur';
                const propertyTitle = property ? property.title : 'un bien immobilier';

                // Email
                await sendNewMessageNotification(receiver.email, senderName, propertyTitle);

                // Internal Notification
                await Notification.create({
                    user_id: receiver_id,
                    type: 'message',
                    title: 'Nouveau message',
                    message: `${senderName} vous a envoyé un message : "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
                    link: `/messages`
                });
            }
        } catch (emailError) {
            console.error('Email notification error:', emailError);
            // Don't fail the message sending if email fails
        }

        res.status(201).json({ message: 'Message sent', id: messageId });
    } catch (err) {
        console.error('Send message error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
