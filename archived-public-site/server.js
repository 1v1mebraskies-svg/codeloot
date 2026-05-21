const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { execFileSync } = require('child_process');

const app = express();
const PORT = 3000;
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'games.json');
const ASSETS_IMG = path.join(ROOT, 'assets', 'img');

const MIME_TO_EXT = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static(ROOT));

function runPythonSync() {
    execFileSync('python3', [path.join(ROOT, 'scripts', 'run_sync.py')], { cwd: ROOT, stdio: 'pipe' });
}

function readGamesData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function extensionForUpload(filename, mimetype) {
    if (mimetype && MIME_TO_EXT[mimetype]) {
        return MIME_TO_EXT[mimetype];
    }
    let ext = path.extname(filename || '').toLowerCase();
    if (ext === '.jpeg') ext = '.jpg';
    if (['.png', '.jpg', '.webp', '.gif'].includes(ext)) return ext;
    return '.png';
}

function removeOldSlugImages(slug, keepName) {
    if (!fs.existsSync(ASSETS_IMG)) return;
    fs.readdirSync(ASSETS_IMG).forEach(function (name) {
        if (name === keepName) return;
        if (name.startsWith(slug + '.') || name.startsWith(slug + '-banner.')) {
            fs.unlinkSync(path.join(ASSETS_IMG, name));
        }
    });
}

app.get('/api/cms-health', function (req, res) {
    res.json({
        cms: true,
        root: ROOT,
        writes: ['data/games.json', 'index.html', 'games/*.html', 'assets/img/*'],
    });
});

app.get('/api/games', function (req, res) {
    try {
        res.json(readGamesData());
    } catch (error) {
        res.status(500).json({ error: 'Failed to read games data' });
    }
});

app.put('/api/games', function (req, res) {
    try {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
        runPythonSync();
        const data = readGamesData();
        res.json({
            success: true,
            synced: (data.games || []).filter(function (g) { return g.active !== false; }).length,
            files: ['data/games.json', 'index.html', 'games/*.html'],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/sync-pages', function (req, res) {
    try {
        runPythonSync();
        const data = readGamesData();
        res.json({ success: true, synced: (data.games || []).length });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/upload-image', upload.single('image'), function (req, res) {
    try {
        const slug = (req.body.slug || '').trim();
        if (!slug) {
            res.status(400).json({ success: false, error: 'Missing slug' });
            return;
        }
        if (!req.file || !req.file.buffer || !req.file.buffer.length) {
            res.status(400).json({ success: false, error: 'Missing image file' });
            return;
        }

        const ext = extensionForUpload(req.file.originalname, req.file.mimetype);
        const outName = slug + ext;

        fs.mkdirSync(ASSETS_IMG, { recursive: true });
        removeOldSlugImages(slug, outName);
        fs.writeFileSync(path.join(ASSETS_IMG, outName), req.file.buffer);

        res.json({
            success: true,
            image: outName,
            path: 'assets/img/' + outName,
            files: ['assets/img/' + outName],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', function () {
    console.log('CodeLoot CMS: http://localhost:' + PORT + '/admin/index.html');
    console.log('Public access: http://admin.codeloot.codes/admin/index.html');
    console.log('Image upload + auto-sync enabled (npm start)');
});
