// POST /api/photos-report
// Community flag on a photo. Body: { id }
// After FLAG_HIDE_THRESHOLD reports the photo auto-hides from the public
// feed and floats to the top of the admin view. No auth — anyone at the
// event can flag; the admin makes the final call.

import { reportPhoto, KV_READY } from './lib/photos.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!KV_READY) return res.status(503).json({ error: 'Not available' });

  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing photo id' });

  try {
    const flags = await reportPhoto(id);
    if (flags === null) return res.status(404).json({ error: 'Photo not found' });
    return res.status(200).json({ ok: true, flags });
  } catch (err) {
    console.error('photos-report error:', err.message);
    return res.status(500).json({ error: 'Could not report photo' });
  }
}
