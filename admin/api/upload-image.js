import { put } from '@vercel/blob';

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
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const slug = searchParams.get('slug');

    if (!slug) {
      return res.status(400).json({ success: false, error: 'Missing slug' });
    }

    const blob = await put(`games/${slug}.png`, req, {
      access: 'public',
    });

    res.json({
      success: true,
      image: blob.pathname,
      path: blob.url,
      files: [blob.pathname],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
