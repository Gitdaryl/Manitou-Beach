import { put, list, del } from '@vercel/blob';

const BLOB_PREFIX = 'wheel-demo/spin-counts';

async function readCounts() {
  const { blobs } = await list({ prefix: BLOB_PREFIX, token: process.env.BLOB_READ_WRITE_TOKEN });
  if (!blobs.length) return { total: 0, byWedge: {}, updatedAt: null };
  const res = await fetch(blobs[0].url);
  return res.ok ? res.json() : { total: 0, byWedge: {}, updatedAt: null };
}

async function writeCounts(data) {
  const { blobs } = await list({ prefix: BLOB_PREFIX, token: process.env.BLOB_READ_WRITE_TOKEN });
  const payload = { ...data, updatedAt: new Date().toISOString() };
  await put('wheel-demo/spin-counts/data.json', JSON.stringify(payload), {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: true,
  });
  if (blobs.length) await del(blobs.map(b => b.url), { token: process.env.BLOB_READ_WRITE_TOKEN });
  return payload;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const data = await readCounts();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { wedge } = req.body || {};
    if (!wedge) return res.status(400).json({ error: 'Missing wedge' });
    try {
      const data = await readCounts();
      data.total = (data.total || 0) + 1;
      data.byWedge = data.byWedge || {};
      data.byWedge[wedge] = (data.byWedge[wedge] || 0) + 1;
      const saved = await writeCounts(data);
      return res.status(200).json(saved);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).end();
}
