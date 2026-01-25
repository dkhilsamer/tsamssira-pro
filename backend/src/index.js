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
const Message = require('./models/Message');

// Cleanup old messages (Startup + Every 12h)
const runCleanup = () => {
    Message.cleanupOldMessages().catch(err => console.error('Cleanup failed:', err));
};
runCleanup();
setInterval(runCleanup, 12 * 60 * 60 * 1000); // 12 hours

const app = express();
app.set('trust proxy', 1); // Trust Render's proxy (1 layer)
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tsamssirapro.onrender.com',
    'https://tsamssirapro.online',
    'https://www.tsamssirapro.online'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.includes(origin) ||
            allowedOrigins.includes(origin + '/') ||
            origin.endsWith('.vercel.app');

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error('❌ CORS Reject Origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));

// Disable caching for API to ensure session cookies are always handled correctly
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tsamssira_db',
    ssl: process.env.DB_HOST?.includes('aivencloud') ? { rejectUnauthorized: false } : undefined,
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
});

// Session configuration
const sessionConfig = {
    store: sessionStore,
    name: 'tsamssira_session',
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true, // Required for secure cookies behind proxies
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'none', // Most compatible for cross-domain/proxy contexts
        path: '/'
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
app.use('/api/notifications', require('./routes/notifications'));

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
