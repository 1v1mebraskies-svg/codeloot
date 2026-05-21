import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { IncomingMessage } from 'http';

const ASSETS_IMG = path.join(process.cwd(), 'assets', 'img');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

function extensionForUpload(filename, mimetype) {
  const MIME_TO_EXT = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  
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
  fs.readdirSync(ASSETS_IMG).forEach(name => {
    if (name === keepName) return;
    if (name.startsWith(slug + '.') || name.startsWith(slug + '-banner.')) {
      fs.unlinkSync(path.join(ASSETS_IMG, name));
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('image'));
    
    const slug = (req.body.slug || '').trim();
    
    if (!slug) {
      return res.status(400).json({ success: false, error: 'Missing slug' });
    }
    
    const file = req.file;
    if (!file || !file.buffer) {
      return res.status(400).json({ success: false, error: 'Missing image file' });
    }

    const ext = extensionForUpload(file.originalname, file.mimetype);
    const outName = slug + ext;

    fs.mkdirSync(ASSETS_IMG, { recursive: true });
    removeOldSlugImages(slug, outName);
    
    const outPath = path.join(ASSETS_IMG, outName);
    fs.writeFileSync(outPath, file.buffer);

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
}
