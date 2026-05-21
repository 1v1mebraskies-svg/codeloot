import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await kv.get('codeloot_games');
      res.json(data || { games: [], metadata: { version: '1.0', last_updated: '' } });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read games data' });
    }
  } else if (req.method === 'PUT') {
    try {
      await kv.set('codeloot_games', req.body);
      
      // Trigger webhook to update main site
      if (process.env.WEBHOOK_URL) {
        await fetch(process.env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'sync', data: req.body })
        }).catch(e => console.error('Webhook failed:', e));
      }
      
      const data = req.body;
      res.json({
        success: true,
        synced: (data.games || []).filter(g => g.active !== false).length,
        files: ['data/games.json'],
        note: 'Data saved to Vercel KV, webhook triggered for main site sync'
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
