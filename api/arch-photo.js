// /api/arch-photo.js
// GET  → returns all approved arch photos for the gallery
// POST { imageData (base64 jpeg), caption?, location? } → upload to Vercel Blob + save to Notion
// DELETE { pageId } → mark as unapproved (soft delete)

import { put } from '@vercel/blob';

export const config = {
  api: { bodyParser: { sizeLimit: '8mb' } },
};

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// Simple IP-based rate limit — max 5 uploads per IP per hour (in-memory, resets on cold start)
const ipCounts = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const entry = ipCounts.get(ip) || { count: 0, start: now };
  if (now - entry.start > window) { ipCounts.set(ip, { count: 1, start: now }); return true; }
  if (entry.count >= 5) return false;
  ipCounts.set(ip, { ...entry, count: entry.count + 1 });
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const dbId = process.env.NOTION_DB_ARCH_PHOTOS;
  if (!dbId) return res.status(500).json({ error: 'Not configured.' });

  // ── GET: return all approved photos ─────────────────────────
  if (req.method === 'GET') {
    const photos = [];
    let cursor;
    do {
      const body = {
        filter: { property: 'Approved', checkbox: { equals: true } },
        sorts: [{ property: 'Created', direction: 'descending' }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };
      const resp = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST', headers: NOTION_HEADERS, body: JSON.stringify(body),
      });
      if (!resp.ok) break;
      const data = await resp.json();
      data.results.forEach(page => {
        const p = page.properties;
        const url = p['Photo URL']?.title?.[0]?.text?.content || '';
        if (!url) return;
        photos.push({
          id: page.id,
          url,
          caption: p['Caption']?.rich_text?.[0]?.text?.content || '',
          location: p['Location']?.rich_text?.[0]?.text?.content || '',
          created: p['Created']?.date?.start || '',
        });
      });
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    res.setHeader('Cache-Control', 'public, max-age=120');
    return res.status(200).json({ photos });
  }

  // ── POST: upload photo ───────────────────────────────────────
  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    if (!checkRateLimit(ip)) return res.status(429).json({ error: 'Too many uploads. Please try again later.' });

    const { imageData, caption, location } = req.body || {};
    if (!imageData) return res.status(400).json({ error: 'No image provided.' });

    // Validate it's a base64 image
    const match = imageData.match(/^data:(image\/(?:jpeg|jpg|png|heic|webp));base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'Invalid image format. Please use JPG or PNG.' });

    const contentType = match[1] === 'image/heic' ? 'image/jpeg' : match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.byteLength > 7 * 1024 * 1024) return res.status(400).json({ error: 'Image too large. Please use a smaller photo.' });

    const timestamp = Date.now();
    const blob = await put(`padlock-arch/${timestamp}.jpg`, buffer, {
      access: 'public',
      contentType,
    });

    const today = new Date().toISOString().split('T')[0];
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          'Photo URL':  { title: [{ text: { content: blob.url } }] },
          'Caption':    { rich_text: caption?.trim() ? [{ text: { content: caption.trim() } }] : [] },
          'Location':   { rich_text: location?.trim() ? [{ text: { content: location.trim() } }] : [] },
          'Created':    { date: { start: today } },
          'Approved':   { checkbox: true },
        },
      }),
    });

    return res.status(200).json({ ok: true, url: blob.url });
  }

  // ── DELETE: unapprove (soft delete) ─────────────────────────
  if (req.method === 'DELETE') {
    const { pageId } = req.body || {};
    if (!pageId) return res.status(400).json({ error: 'pageId required.' });
    await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: NOTION_HEADERS,
      body: JSON.stringify({ properties: { 'Approved': { checkbox: false } } }),
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
