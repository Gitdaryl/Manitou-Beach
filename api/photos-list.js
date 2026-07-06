// GET /api/photos-list?slug=<slug>
// Public feed for a crowd gallery: live photos only, newest first.
// Returns [] (never errors) when the store isn't connected yet, so the
// gallery page renders cleanly with just its curated photos.

import { listLive, KV_READY } from './lib/photos.js';
import { GALLERY_SLUGS } from './lib/photo-slugs.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const slug = (req.query.slug || '').toString();
  if (!slug || !GALLERY_SLUGS.has(slug)) {
    return res.status(400).json({ error: 'Unknown gallery', photos: [] });
  }

  if (!KV_READY) return res.status(200).json({ photos: [], live: false });

  try {
    const photos = await listLive(slug);
    // 60s CDN cache so a busy event page doesn't hammer KV; still feels live.
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ photos, live: true });
  } catch (err) {
    console.error('photos-list error:', err.message);
    return res.status(200).json({ photos: [], live: false });
  }
}
