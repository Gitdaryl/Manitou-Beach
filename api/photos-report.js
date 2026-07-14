// POST /api/photos-report
// Community flag on a photo. Body: { id, reason?, deviceId? }
// One flag per person (deviceId, falling back to an IP+UA hash for old
// clients). After FLAG_HIDE_THRESHOLD distinct flaggers the photo auto-hides
// from the public feed and floats to the top of the admin view. Every real
// (non-duplicate) flag pings the n8n notify hook so Yeti hears about it.

import crypto from 'node:crypto';
import { reportPhoto, getPhoto, KV_READY } from './lib/photos.js';
import { notifyFlagHook } from './lib/notify.js';

const REASON_LABELS = {
  'not-event': 'Not from this event',
  'inappropriate': 'Inappropriate',
  'remove-request': 'Someone in it asked to remove it',
  'spam': 'Spam or ads',
};

function fallbackDevice(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  return 'ip_' + crypto.createHash('sha256').update(ip + '|' + ua).digest('hex').slice(0, 24);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!KV_READY) return res.status(503).json({ error: 'Not available' });

  const { id, reason, deviceId } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing photo id' });

  const dev = (typeof deviceId === 'string' && deviceId.length >= 6 && deviceId.length <= 64)
    ? deviceId
    : fallbackDevice(req);
  const reasonKey = REASON_LABELS[reason] ? reason : 'unspecified';
  const reasonLabel = REASON_LABELS[reason] || 'Not specified';

  try {
    const result = await reportPhoto(id, dev, reasonKey);
    if (result === null) return res.status(404).json({ error: 'Photo not found' });

    if (!result.duplicate) {
      const photo = await getPhoto(id);
      await notifyFlagHook({
        event: result.autoHidden ? 'auto-hide' : 'flag',
        slug: photo?.slug,
        photoUrl: photo?.url,
        name: photo?.name,
        reason: reasonLabel,
        flags: result.flags,
        id,
      });
    }

    return res.status(200).json({ ok: true, flags: result.flags, duplicate: result.duplicate });
  } catch (err) {
    console.error('photos-report error:', err.message);
    return res.status(500).json({ error: 'Could not report photo' });
  }
}
