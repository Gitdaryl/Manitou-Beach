// /api/photos-admin   (admin only — x-admin-token OR body.token === ADMIN_SECRET)
//
// GET  ?slug=<slug>            → every photo for the gallery, flagged floated to top
// POST { action, id }          → action: 'hide' (take down) | 'restore' (back to live)
//
// Reuses the same ADMIN_SECRET pattern as the rest of the API.

import { listAll, setStatus, KV_READY } from './lib/photos.js';
import { GALLERY_SLUGS } from './lib/photo-slugs.js';

function authed(req) {
  const token = req.headers['x-admin-token'] || req.body?.token || req.query?.token;
  return token && token === process.env.ADMIN_SECRET;
}

export default async function handler(req, res) {
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (!KV_READY) return res.status(503).json({ error: 'Photo store not connected' });

  try {
    if (req.method === 'GET') {
      const slug = (req.query.slug || '').toString();
      if (!slug || !GALLERY_SLUGS.has(slug)) return res.status(400).json({ error: 'Unknown gallery' });
      const photos = await listAll(slug);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ photos });
    }

    if (req.method === 'POST') {
      const { action, id } = req.body || {};
      if (!id || !action) return res.status(400).json({ error: 'Missing action or id' });
      const statusMap = { hide: 'hidden', restore: 'live' };
      const next = statusMap[action];
      if (!next) return res.status(400).json({ error: 'Invalid action' });
      const ok = await setStatus(id, next);
      if (!ok) return res.status(404).json({ error: 'Photo not found' });
      return res.status(200).json({ ok: true, status: next });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('photos-admin error:', err.message);
    return res.status(500).json({ error: 'Admin action failed' });
  }
}
