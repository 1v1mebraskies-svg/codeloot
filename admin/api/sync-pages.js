import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await kv.get('codeloot_games');
    
    // Trigger webhook to update main site
    if (process.env.WEBHOOK_URL) {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', data: data })
      }).catch(e => console.error('Webhook failed:', e));
    }
    
    res.json({ 
      success: true, 
      synced: (data?.games || []).length,
      note: 'Webhook triggered for main site sync'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
