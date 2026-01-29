import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Large limit for images in canvas

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ state: { targets: [], templates: [], activeTargetId: null, defaultTemplateId: null }, version: 0 }, null, 2));
}

app.get('/api/data', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Return empty state if file missing
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
        // In a real app we might want to merge or handle versioning, 
        // but for single user self-hosted, overwriting is acceptable provided the frontend manages state correctly.
        fs.writeFileSync(DATA_FILE, JSON.stringify({ state, version }, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error writing data file:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Data file location: ${DATA_FILE}`);
});
