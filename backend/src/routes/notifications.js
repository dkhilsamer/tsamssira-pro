const express = require('express');
const router = express.Router();
const db = require('../db');

// Get user notifications
router.get('/', async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const notifications = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
