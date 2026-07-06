// POST /api/photos-upload
// Guest photo submission for a crowd gallery.
// Body: { slug, filename, contentType, data (base64, no prefix), w?, h? }
//
// Flow: base64 → Blob (public) with a Claude-Vision SEO filename → KV index.
// Images are downscaled client-side before they get here (see EventPhotoWall),
// so this just enforces a hard cap and stores what arrives.

import { put } from '@vercel/blob';
import { addPhoto, KV_READY } from './lib/photos.js';
import { GALLERY_SLUGS } from './lib/photo-slugs.js';

export const config = {
  api: { bodyParser: { sizeLimit: '6mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!KV_READY) {
    // Photo store not connected yet — tell the client cleanly instead of 500ing.
    return res.status(503).json({ error: 'Photo uploads are not switched on yet. Check back soon!' });
  }

  try {
    const { slug, filename, contentType, data, w, h } = req.body || {};

    if (!slug || !GALLERY_SLUGS.has(slug)) {
      return res.status(400).json({ error: 'Unknown gallery' });
    }
    if (!data || !filename) {
      return res.status(400).json({ error: 'Missing photo data' });
    }
    if (!(contentType || '').startsWith('image/')) {
      return res.status(400).json({ error: 'Only images can be uploaded' });
    }

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: 'Photo too large. Please try again.' });
    }

    // ── SEO filename via Claude Vision (falls back to a sanitised name) ──
    const ext = (filename.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    let seoName = `${slug}-photo`;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const visionRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 60,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: contentType, data } },
                { type: 'text', text: `This is a community photo submitted to the "${slug}" event gallery in Manitou Beach, Michigan (Devils Lake / Irish Hills). Generate a descriptive SEO-friendly filename (no extension, hyphens, max 8 words, include location keywords like manitou-beach, devils-lake, michigan where relevant). Reply with ONLY the filename. Example: manitou-beach-america-250-fireworks-devils-lake` },
              ],
            }],
          }),
        });
        if (visionRes.ok) {
          const vd = await visionRes.json();
          const suggested = vd.content?.[0]?.text?.trim().toLowerCase()
            .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
          if (suggested && suggested.length > 4) seoName = suggested;
        }
      } catch (visionErr) {
        console.warn('photos-upload vision rename skipped:', visionErr.message);
      }
    }

    const blob = await put(`crowd/${slug}/${Date.now()}-${seoName}.${ext}`, buffer, {
      contentType,
      access: 'public',
    });

    const rec = await addPhoto(slug, {
      url: blob.url,
      name: `${seoName}.${ext}`,
      w: Number(w) || undefined,
      h: Number(h) || undefined,
    });

    return res.status(200).json({ photo: rec });
  } catch (err) {
    console.error('photos-upload error:', err.message);
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
}
