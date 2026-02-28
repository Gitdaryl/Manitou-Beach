import { put } from '@vercel/blob';

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, contentType, data, folder = 'events' } = req.body;

    if (!data || !filename) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    // data is base64 encoded
    const buffer = Buffer.from(data, 'base64');

    // Max 2MB after compression
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 2MB.' });
    }

    const safeName = filename.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.\-_]/g, '');
    const blob = await put(`${folder}/${Date.now()}-${safeName}`, buffer, {
      contentType: contentType || 'image/jpeg',
      access: 'public',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
