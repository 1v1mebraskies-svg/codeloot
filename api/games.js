import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'games.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
      } else {
        res.json({ games: [], metadata: { version: '1.0', last_updated: '' } });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to read games data' });
    }
  } else if (req.method === 'PUT') {
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf8');
      
      // Note: On Vercel, we can't run the Python sync script directly
      // You'll need to implement a different sync mechanism or use Vercel's build hooks
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      res.json({
        success: true,
        synced: (data.games || []).filter(g => g.active !== false).length,
        files: ['data/games.json'],
        note: 'Auto-sync disabled on Vercel - manual sync required'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
