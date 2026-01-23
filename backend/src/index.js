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

const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('--- FORCING REDEPLOY FOR EMAIL FIX (PORT 587) ---');
console.log('Using SMTP User:', process.env.EMAIL_USER ? 'Loaded' : 'MISSING');
console.log('Using SMTP Pass:', process.env.EMAIL_PASSWORD ? 'Loaded' : 'MISSING');

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
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://tsamssirapro.onrender.com',
            'https://tsamssira-pro.vercel.app',
            'https://tsamssirapro.vercel.app',
            'https://tsamssirapro.online',
            'https://www.tsamssirapro.online'
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
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
        secure: true, // enforce HTTPS
        httpOnly: true,
        maxAge: 3600000, // 1h
        sameSite: 'none' // Required for cross-site cookies (Vercel -> Render)
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
app.use('/api/messages', require('./routes/messages'));

app.use('/', require('./routes/sitemap'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend-react/dist')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Serve ads.txt explicitly for Google AdSense verification
app.get('/ads.txt', (req, res) => {
    res.type('text/plain');
    res.send("google.com, pub-5736875872236634, DIRECT, f08c47fec0942fa0");
});

// Serve robots.txt explicitly to ensure visibility for Google AdSense
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send("User-agent: *\nAllow: /\nSitemap: https://tsamssira-pro.onrender.com/sitemap.xml");
});

// Fallback for SPA routing - DISABLED (frontend deployed separately on Cloudflare)
// app.get('*', (req, res) => {
//     if (!req.url.startsWith('/api/')) {
//         res.sendFile(path.join(__dirname, '../../frontend-react/dist/index.html'));
//     }
// });

// Simple health check
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Root route for friendly message
app.get('/', (req, res) => {
    res.send('✅ Tsamssira-Pro API is alive. Use /api/... endpoints.');
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
