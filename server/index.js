import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import http from 'http';
import { spawn, exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGIN || '*',
        methods: ["GET", "POST"]
    }
});

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

// Authentication Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'netrunner_secret_key_change_me_in_prod';
const ADMIN_USERNAME = process.env.NETRUNNER_USER || 'admin';
const ADMIN_PASSWORD = process.env.NETRUNNER_PASSWORD || 'password';

// Helper: Sign Token
import jwt from 'jsonwebtoken';

const generateToken = () => {
    return jwt.sign({ role: 'admin', username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '24h' });
};

// Authentication Middleware (JWT)
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
        req.user = user;
        next();
    });
};

// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Read latest DB state
    const dbData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Initialize auth if missing (migration)
    if (!dbData.auth) {
        dbData.auth = {
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(dbData, null, 2));
    }

    if (username === dbData.auth.username && password === dbData.auth.password) {
        const token = generateToken();
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Change Password Route
app.post('/api/change-password', authMiddleware, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const dbData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // Initialize auth if missing (migration) - defensive coding
    if (!dbData.auth) {
        dbData.auth = {
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(dbData, null, 2));
    }

    // Verify current password
    if (dbData.auth.password !== currentPassword) {
        return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Update password
    dbData.auth.password = newPassword;
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbData, null, 2));

    res.json({ success: true, message: 'Password updated successfully' });
});



// Protect all API routes EXCEPT login
app.use('/api/', (req, res, next) => {
    if (req.path === '/login') return next();
    authMiddleware(req, res, next);
});

// --- Socket.io Logic ---

// Socket Auth Middleware (JWT)
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('Socket Auth Failed:', err.message);
                return next(new Error("Authentication error"));
            }
            socket.data.user = decoded;
            next();
        });
    } else {
        console.log('Socket Auth Failed: No token provided');
        next(new Error("Authentication error"));
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id); // Authenticated

    socket.on('run-command', ({ command, targetName }) => {
        console.log(`Running: ${command} for target: ${targetName}`);
        if (!command || typeof command !== 'string') return;

        // Determine CWD
        let cwd = process.cwd();
        if (targetName) {
            // Sanitize targetName to allow only safe chars (alphanumeric, dots, dashes)
            const safeTarget = targetName.replace(/[^a-zA-Z0-9.-]/g, '_');
            cwd = path.join(__dirname, 'scans', safeTarget);

            // Create dir if not exists
            if (!fs.existsSync(cwd)) {
                fs.mkdirSync(cwd, { recursive: true });
            }
        }

        // Basic split to get command and args (very naive sh, better to use shell: true)
        // Using shell: true allows pipes and full command strings
        const childProcess = spawn(command, {
            shell: true,
            cwd: cwd
        });

        childProcess.stdout.on('data', (data) => {
            socket.emit('command-output', data.toString());
        });

        childProcess.stderr.on('data', (data) => {
            socket.emit('command-output', data.toString());
        });

        childProcess.on('close', (code) => {
            socket.emit('command-complete', { code });
        });

        // Handle kill request? (Future)
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// --- API Routes ---

// Tool Check Endpoint
app.post('/api/check-tool', (req, res) => {
    const { tool } = req.body;
    if (!tool || !/^[a-zA-Z0-9_-]+$/.test(tool)) {
        return res.status(400).json({ error: 'Invalid tool name' });
    }

    exec(`command -v ${tool}`, (error, stdout) => {
        if (error) {
            return res.json({ installed: false });
        }
        res.json({ installed: true, path: stdout.trim() });
    });
});


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

// Use server.listen instead of app.listen
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Secured with Helmet & Rate Limit`);
    console.log(`Socket.io Server Ready`);
});
