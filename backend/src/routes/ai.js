const express = require('express');
const router = express.Router();
const { estimatePrice } = require('../services/aiService');

router.post('/estimate', async (req, res) => {
    try {
        const result = await estimatePrice(req.body);

        if (result) {
            res.json(result);
        } else {
            // Signal to use local fallback if AI fails or key is missing
            res.status(204).end();
        }
    } catch (error) {
        console.error('AI Route Error:', error);
        res.status(500).json({ error: 'Failed to get AI estimation' });
    }
});

module.exports = router;
