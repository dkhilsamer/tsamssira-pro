const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const db = require('./db'); // ensure db connection works

const authRoutes = require('./routes/auth');
// Additional route imports can be added here (e.g., property, rental_requests)

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'change_this_secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 3600000 }, // 1h
    })
);

// Test DB connection on startup
(async () => {
    try {
        await db.query('SELECT 1');
        console.log('Database connection OK');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', require('./routes/property'));
app.use('/api/requests', require('./routes/rental_requests'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/payment', require('./routes/payment'));

app.use('/', require('./routes/sitemap'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Fallback for SPA routing (optional, but good for future)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Simple health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
