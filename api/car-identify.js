// POST /api/car-identify
// "Know this car?" — a visitor tells us what a gallery photo shows and,
// ideally, whose car it is. Body:
//   { slug, photo, photoKey, car, owner?, contact?, note?, _hp? }
//
// Build standard: persist BEFORE notifying, and await the notify. A lost
// identification is a name we never get back, so the write happens first
// and a failed webhook never costs us the record.
//
// GET /api/car-identify?slug=<slug>&key=<ADMIN_KEY>  → the collected list.

import { addCarId, listCarIds, countCarIds, KV_READY } from './lib/carIds.js';
import { GALLERY_SLUGS } from './lib/photo-slugs.js';
import { notifyFlagHook } from './lib/notify.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleList(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, photo, photoKey, car, owner, contact, note, _hp } = req.body || {};

  // Honeypot — bots fill hidden fields, humans don't. Look successful to them.
  if (_hp) return res.status(200).json({ success: true });

  if (!slug || !GALLERY_SLUGS.has(slug)) {
    return res.status(400).json({ error: 'Unknown gallery' });
  }
  if (!String(car || '').trim()) {
    return res.status(400).json({ error: 'Tell us what the car is and we will take it from there.' });
  }

  // Log the payload before anything else can fail on us.
  console.log('car-identify:', JSON.stringify({ slug, photoKey, car, owner: !!owner, contact: !!contact }));

  if (!KV_READY) {
    return res.status(503).json({ error: 'We cannot save that just yet. Try again shortly.' });
  }

  let rec;
  try {
    rec = await addCarId({ slug, photo, photoKey, car, owner, contact, note });
  } catch (err) {
    console.error('car-identify save failed:', err.message);
    return res.status(500).json({ error: 'We could not save that. Please try again.' });
  }

  // Best effort, but awaited: the function freezes the moment we return.
  await notifyFlagHook({
    event: 'car-identify',
    slug: rec.slug,
    photoUrl: rec.photo,
    name: rec.owner || '(no name given)',
    reason: rec.car,
    id: rec.id,
  });

  return res.status(200).json({ success: true });
}

async function handleList(req, res) {
  const { slug, key } = req.query || {};
  const adminKey = process.env.ADMIN_KEY || process.env.YETI_ADMIN_KEY;
  if (!adminKey || key !== adminKey) return res.status(401).json({ error: 'Unauthorized' });
  if (!slug || !GALLERY_SLUGS.has(slug)) return res.status(400).json({ error: 'Unknown gallery' });
  if (!KV_READY) return res.status(503).json({ error: 'Store not connected' });

  const [items, total] = await Promise.all([listCarIds(slug), countCarIds(slug)]);
  return res.status(200).json({ total, items });
}
