import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || '*', // Allow all origins by default for easy hosting, or restrict via ENV
    methods: ['GET', 'POST'],
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(bodyParser.json({ limit: '10mb' }));

// Authentication Middleware
const API_KEY = process.env.NETRUNNER_API_KEY || 'netrunner_default_2025'; // Stronger default
const authMiddleware = (req, res, next) => {
    const clientKey = req.headers['x-api-key'];
    if (!clientKey || clientKey !== API_KEY) {
        return setTimeout(() => res.status(401).json({ error: 'Unauthorized: Invalid API Key' }), 500); // Tarpit
    }
    next();
};

// Protect all API routes
app.use('/api/', authMiddleware);

// Ensure data file exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ state: { targets: [], templates: [], activeTargetId: null, defaultTemplateId: null }, version: 0 }, null, 2));
}

// Basic Sanitization Helper
const containsMaliciousPayload = (str) => {
    if (typeof str !== 'string') return false;
    // Basic filter for script injection. In production, use DOMPurify.
    const dangerous = /<script\b[^>]*>|javascript:|onerror=|onload=/i;
    return dangerous.test(str);
};

const deepSanitizeCheck = (obj) => {
    if (typeof obj === 'string') {
        if (containsMaliciousPayload(obj)) return true;
    } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            if (deepSanitizeCheck(obj[key])) return true;
        }
    }
    return false;
};

app.get('/api/data', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return res.json({ state: { targets: [], templates: [], activeTargetId: null, defaultTemplateId: null }, version: 0 });
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading data file:', err);
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/save', (req, res) => {
    try {
        const { state, version } = req.body;

        if (!state || typeof state !== 'object') {
            return res.status(400).json({ error: 'Invalid state data' });
        }

        // Security: Check for XSS Payloads
        if (deepSanitizeCheck(state)) {
            console.warn("Blocked attempt to save malicious payload.");
            return res.status(400).json({ error: 'Security Warning: Malicious content detected.' });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify({ state, version }, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error writing data file:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Secured with Helmet & Rate Limit`);
});
