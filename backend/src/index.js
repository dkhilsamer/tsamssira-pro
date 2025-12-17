const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs'); // Import fs

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const db = require('./db'); // ensure db connection works

const authRoutes = require('./routes/auth');
// Additional route imports can be added here (e.g., property, rental_requests)

const app = express();
app.set('trust proxy', 1); // Required for Render/Heroku to handle secure cookies
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        // Allow all origins in production
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Temporarily disable secure cookies to fix login loop
        httpOnly: true,
        maxAge: 3600000, // 1h
        sameSite: 'lax' // More compatible setting
    }
};

app.use(session(sessionConfig));

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


// Serve robots.txt explicitly to ensure visibility for Google AdSense
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nAllow: /\nSitemap: https://tsamssira-pro.onrender.com/sitemap.xml");
});

// Fallback for SPA routing (optional, but good for future)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Simple health check
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// API 404 Handler - Force JSON for /api/* routes that are not found
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
});

// Global Error Handler - Force JSON for server errors
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    // If headers already sent, delegate to default handler
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
