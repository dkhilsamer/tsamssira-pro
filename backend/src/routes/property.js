const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');
const { addWatermark } = require('../services/watermarkService');
const { sendEmail } = require('../services/emailService');

// Get all properties
// Get all properties
router.get('/', async (req, res) => {
    try {
        const filters = {
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            city: req.query.city,
            type: req.query.type,
            property_type: req.query.property_type,
            category: req.query.category,
            bedrooms: req.query.bedrooms,
            is_student: req.query.is_student === 'true' || req.query.is_student === '1',
            publicOnly: true // Default for public route
        };

        // If admin is viewing specifically for management, they might use a different route or we check logic here.
        // But usually this route is for the public listing page.
        // If an authenticated user (admin/owner) wants to see all for management, they call specific endpoints.
        // However, if we want to allow filtered search even for specific views, we might need to adjust.
        // For now, assume this is the public search endpoint.

        const properties = await Property.getAll(filters);
        res.json(properties);
    } catch (err) {
        console.error('Get properties error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Get user's properties
router.get('/my-properties', async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        let properties;
        // Admin sees all properties, Owner sees only theirs
        if (req.session.role === 'admin') {
            properties = await Property.getAll();
        } else {
            properties = await Property.getByUserId(userId);
        }
        res.json(properties);
    } catch (err) {
        console.error('Get user properties error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get property by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        // Increment views (Non-blocking)
        Property.incrementViews(id).catch(err => console.error('Error incrementing views:', err));

        res.json(property);
    } catch (err) {
        console.error('Get property error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

const upload = require('../middleware/upload');

// Create new property (requires auth)
router.post('/', upload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
    // Expect userId from session
    // Expect userId from session or allow admin override
    let userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        let ownerId = userId;
        // If admin and owner_id is provided, use it
        if (req.session.role === 'admin' && req.body.owner_id) {
            ownerId = req.body.owner_id;
        }

        const data = { ...req.body, user_id: ownerId };

        // Sanitize string fields
        if (data.title) data.title = data.title.trim();
        if (data.description) data.description = data.description.trim();
        if (data.address) data.address = data.address.trim();
        if (data.city) data.city = data.city.trim();

        // Handle Main Image
        if (req.files && req.files['main_image'] && req.files['main_image'][0]) {
            const file = req.files['main_image'][0];
            // If Cloudinary, file.path is the URL. If local, we build it.
            // CloudinaryStorage puts the url in file.path
            if (file.path && file.path.startsWith('http')) {
                data.main_image = file.path;
            } else {
                const absolutePath = path.join(__dirname, '../../uploads/', file.filename);
                await addWatermark(absolutePath);
                data.main_image = '/uploads/' + file.filename;
            }
        }

        // Handle Extra Images
        if (req.files && req.files['images']) {
            data.images = [];
            for (const file of req.files['images']) {
                if (file.path && file.path.startsWith('http')) {
                    data.images.push(file.path);
                } else {
                    const absolutePath = path.join(__dirname, '../../uploads/', file.filename);
                    await addWatermark(absolutePath);
                    data.images.push('/uploads/' + file.filename);
                }
            }
        } else if (!data.images) {
            data.images = [];
        }

        const insertId = await Property.create(data);
        res.status(201).json({ message: 'Property created', id: insertId });
    } catch (err) {
        console.error('Create property error:', err);
        // Return actual error for debugging
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Update property (requires auth and ownership – simplified)
// Update property (requires auth and ownership)
router.put('/:id', upload.fields([{ name: 'main_image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });
        if (req.session.role !== 'admin' && property.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

        const data = { ...req.body };

        // Handle Main Image Update
        if (req.files && req.files['main_image'] && req.files['main_image'][0]) {
            const file = req.files['main_image'][0];
            if (file.path && file.path.startsWith('http')) {
                data.main_image = file.path;
            } else {
                const absolutePath = path.join(__dirname, '../../uploads/', file.filename);
                await addWatermark(absolutePath);
                data.main_image = '/uploads/' + file.filename;
            }

            // Optionally delete old main image if different? (Not strictly required but good practice)
        }

        // Handle New Extra Images
        const newImages = [];
        if (req.files && req.files['images']) {
            for (const file of req.files['images']) {
                if (file.path && file.path.startsWith('http')) {
                    newImages.push(file.path);
                } else {
                    const absolutePath = path.join(__dirname, '../../uploads/', file.filename);
                    await addWatermark(absolutePath);
                    newImages.push('/uploads/' + file.filename);
                }
            }
        }

        // Sanitize string fields
        if (data.title) data.title = data.title.trim();
        if (data.description) data.description = data.description.trim();
        if (data.location) data.location = data.location.trim();
        if (data.google_maps_link) data.google_maps_link = data.google_maps_link.trim();

        await Property.update(id, data);

        if (newImages.length > 0) {
            await Property.addImages(id, newImages);
        }

        res.json({ message: 'Property updated' });
    } catch (err) {
        console.error('Update property error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a specific image from property gallery
router.delete('/:id/images', async (req, res) => {
    const { id } = req.params;
    const { imageUrl } = req.body;
    const userId = req.session?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });

    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });
        if (req.session.role !== 'admin' && property.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

        await Property.removeImage(id, imageUrl);

        // Optionally delete file from disk if local...
        // For now, simple DB removal is enough.

        res.json({ message: 'Image deleted' });
    } catch (err) {
        console.error('Delete image error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Toggle visibility (requires auth and ownership)
router.put('/:id/visibility', async (req, res) => {
    const { id } = req.params;
    const { is_visible } = req.body;
    const userId = req.session?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });
        // Allow admin or owner
        if (req.session.role !== 'admin' && property.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

        await Property.toggleVisibility(id, is_visible);
        res.json({ message: 'Visibility updated' });
    } catch (err) {
        console.error('Update visibility error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete property (requires auth and ownership)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        // Allow deletion if user is owner OR admin (Strict check)
        const isAdmin = req.session.role === 'admin';
        if (!isAdmin && property.user_id !== userId) return res.status(403).json({ error: 'Forbidden' });

        // Delete Main Image
        if (property.main_image) {
            // Remove leading slash if present to join correctly, or handle absolute path
            // property.main_image is like '/uploads/...'
            const relativePath = property.main_image.startsWith('/') ? property.main_image.substring(1) : property.main_image;
            const absolutePath = path.join(__dirname, '../../', relativePath);
            if (fs.existsSync(absolutePath)) {
                try {
                    fs.unlinkSync(absolutePath);
                } catch (e) {
                    console.error('Error deleting main image:', e);
                }
            }
        }

        // Delete Additional Images
        if (property.images && Array.isArray(property.images)) {
            property.images.forEach(imgUrl => {
                const relativePath = imgUrl.startsWith('/') ? imgUrl.substring(1) : imgUrl;
                const absolutePath = path.join(__dirname, '../../', relativePath);
                if (fs.existsSync(absolutePath)) {
                    try {
                        fs.unlinkSync(absolutePath);
                    } catch (e) {
                        console.error('Error deleting image:', e);
                    }
                }
            });
        }

        await Property.delete(id);
        res.json({ message: 'Property deleted' });
    } catch (err) {
        console.error('Delete property error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Boost property (requires auth and ownership or admin)
router.put('/:id/boost', async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.userId;
    const isAdmin = req.session?.role === 'admin';

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        // Allow boost if user is owner OR admin
        if (!isAdmin && property.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Admin gets free boost, owner needs payment confirmation
        // Admin gets free boost
        // Non-admin users must "request" a boost (which sets a pending state or similar)
        // OR if this route implies immediate boosting, we restrict it to Admin only for now as requested:
        // "Boost direct si je suis admin, demande si user"

        if (isAdmin) {
            // Admin: Immediate Boost
            await Property.boostProperty(id);
            const boostEndDate = new Date();
            boostEndDate.setMonth(boostEndDate.getMonth() + 1);
            return res.json({
                message: 'Propriété boostée avec succès (Mode Admin)!',
                boost_end_date: boostEndDate,
                remaining_days: 30
            });
        } else {
            // User: Request Boost - Create a Message to Admin

            // Find Admin (Tadmin)
            const adminUser = await User.findByUsername('Tadmin');

            if (adminUser) {
                const boostMsg = `🔔 DEMANDE DE BOOST\n\nL'utilisateur souhaite booster le bien : "${property.title}" (ID: ${id}).\n\nVeuillez examiner ce bien et approuver le boost si valide.`;
                await Message.create({
                    sender_id: userId,
                    receiver_id: adminUser.id,
                    property_id: id,
                    content: boostMsg,
                    type: 'boost_request'
                });
            } else {
                console.error('Tadmin user not found, cannot send boost request message.');
            }

            return res.json({ message: 'Votre demande de boost a été envoyée à l\'administrateur par message.' });
        }

    } catch (err) {
        console.error('Boost property error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Remove boost from property (admin only)
router.delete('/:id/boost', async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (req.session.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        await Property.unboostProperty(id);
        res.json({ message: 'Boost removed' });
    } catch (err) {
        console.error('Remove boost error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Admin approve boost request (from messaging)
router.put('/:id/boost/approve', async (req, res) => {
    const { id } = req.params;
    const userId = req.session?.userId;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (req.session.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    try {
        const property = await Property.findById(id);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        await Property.boostProperty(id);
        res.json({ message: 'Boost approuvé et activé avec succès!' });
    } catch (err) {
        console.error('Approve boost error:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

module.exports = router;
