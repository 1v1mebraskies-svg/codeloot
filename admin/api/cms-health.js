import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.json({
    cms: true,
    storage: 'Vercel KV',
    writes: ['Vercel KV database', 'Vercel Blob storage (images)'],
    webhook: process.env.WEBHOOK_URL ? 'configured' : 'not configured'
  });
}
