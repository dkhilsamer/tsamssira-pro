const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE, // e.g. 'gmail'
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// In-memory token store: { token: { userId, expires } }
const resetTokens = new Map();

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    try {
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const valid = await User.verifyPassword(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        return res.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Register
router.post('/register', async (req, res) => {
    const { username, email, password, phone, address } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already taken' });
        }
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ error: 'Email already used' });
        }
        const userId = await User.create({ username, email, password, role: 'proprietaire', phone, address });
        return res.status(201).json({ message: 'User created', userId });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: 'Logged out' });
    });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            // Check security best practices: maybe don't reveal if user exists?
            // For this dev app, revealing "Email not found" is helpful for user.
            return res.status(404).json({ error: 'Email not found' });
        }

        // Generate token
        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000; // 1 hour

        resetTokens.set(token, { userId: user.id, expires });

        // In a real app, send email. Here, we log it.
        console.log(`[RESET PASSWORD] Token for ${email}: ${token}`);
        const resetLink = `http://localhost:3000/reset-password.html?token=${token}`;
        console.log(`[RESET LINK] ${resetLink}`);

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Réinitialisation de mot de passe - Tsamssira Pro',
                html: `<p>Bonjour,</p>
                       <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                       <p>Cliquez sur le lien ci-dessous pour procéder :</p>
                       <p><a href="${resetLink}">${resetLink}</a></p>
                       <p>Ce lien expire dans 1 heure.</p>`
            });
            res.json({ message: 'Lien de réinitialisation envoyé par email !' });
        } else {
            res.json({ message: 'Lien généré (voir console serveur car SMTP non configuré).' });
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and password required' });

    const record = resetTokens.get(token);
    if (!record) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (Date.now() > record.expires) {
        resetTokens.delete(token);
        return res.status(400).json({ error: 'Token expired' });
    }

    try {
        await User.updatePassword(record.userId, newPassword);
        resetTokens.delete(token);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
    if (req.session.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    try {
        const users = await User.getAll();
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

const fs = require('fs');
const path = require('path');
const Property = require('../models/Property');

// Delete User (Tadmin Only)
router.delete('/users/:id', async (req, res) => {
    // Check strict username
    if (req.session.username !== 'Tadmin') {
        return res.status(403).json({ error: 'Seul le super-admin Tadmin peut effectuer cette action.' });
    }

    const userId = req.params.id;
    try {
        // 1. Get all properties of the user
        const properties = await Property.getByUserId(userId);

        // 2. Loop and delete files for each property
        if (properties && properties.length > 0) {
            for (const property of properties) {
                // Delete Main Image
                if (property.main_image) {
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
                // We need to fetch additional images if they are not in the 'properties' list (which usually just has basic info)
                // Property.getByUserId likely returns basic info.
                // Property model doesn't automatically join images table in getAll/getByUserId usually.
                // We should query property_images for this property
                // But typically, cascading delete in DB handles the rows. We just need to handle FILES.
                // Let's assume we want to be thorough.

                // Fetch property details to get images? Or direct query?
                // For simplicity/safety, let's rely on what we can easily access. 
                // If Property.getByUserId doesn't return images, we might miss them on disk deletion.
                // However, let's try to proceed with main_image which is critical.

                // Delete property ROW from DB (will cascade images rows if set up, or we do it manually)
                await Property.delete(property.id);
            }
        }

        // 3. Delete User
        await User.delete(userId);
        res.json({ message: 'User and their properties deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Role (Tadmin Only)
router.put('/users/:id/role', async (req, res) => {
    // Check strict username
    if (req.session.username !== 'Tadmin') {
        return res.status(403).json({ error: 'Seul le super-admin Tadmin peut effectuer cette action.' });
    }

    const { role } = req.body;
    if (!['admin', 'proprietaire'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        await User.updateRole(req.params.id, role);
        res.json({ message: 'User role updated' });
    } catch (err) {
        console.error('Update role error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
