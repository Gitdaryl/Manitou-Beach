// POST /api/photos-heart
// Community heart on a photo. Body: { id, deviceId }
// Toggles: first call hearts, second call un-hearts. One heart per person,
// enforced by a device-id set in KV. Returns { hearts, hearted }.

import crypto from 'node:crypto';
import { heartPhoto, KV_READY } from './lib/photos.js';

function fallbackDevice(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  return 'ip_' + crypto.createHash('sha256').update(ip + '|' + ua).digest('hex').slice(0, 24);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!KV_READY) return res.status(503).json({ error: 'Not available' });

  const { id, deviceId } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing photo id' });

  const dev = (typeof deviceId === 'string' && deviceId.length >= 6 && deviceId.length <= 64)
    ? deviceId
    : fallbackDevice(req);

  try {
    const result = await heartPhoto(id, dev);
    if (result === null) return res.status(404).json({ error: 'Photo not found' });
    return res.status(200).json({ ok: true, hearts: result.hearts, hearted: result.hearted });
  } catch (err) {
    console.error('photos-heart error:', err.message);
    return res.status(500).json({ error: 'Could not heart photo' });
  }
}
