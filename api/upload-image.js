import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
};

// Folders that public forms are allowed to write into.
// Admin-only folders (e.g. 'dispatch', 'social') are NOT listed here; they are
// still reachable by public callers — we just cap what strangers can name.
// The real guard against abuse is: 2 MB cap + this allowlist so no one can
// invent arbitrary top-level paths in Vercel Blob.
const ALLOWED_FOLDERS = new Set([
  'events',
  'food-trucks',
  'business-logos',
  'business-photos',
  'business-gallery',
  'sponsors',
  'stays',
  'dispatch',
  'social',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action = 'upload' } = req.body || {};

  // action=apply - update a Notion article's Cover Image URL (no file upload)
  // Admin-only: requires x-admin-token header matching ADMIN_SECRET env var
  if (action === 'apply') {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { notionId, filename, url } = req.body;
    if (!notionId || (!filename && !url)) {
      return res.status(400).json({ error: 'notionId and either filename or url required' });
    }

    let coverImageUrl = url || null;
    if (!coverImageUrl && filename) {
      const filePath = path.join(process.cwd(), 'public', 'images', 'yeti', filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'Image file not found on server',
          hint: `Drop ${filename} into public/images/yeti/ and push to deploy first`,
        });
      }
      coverImageUrl = `/images/yeti/${filename}`;
    }

    try {
      const notionRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties: { 'Cover Image URL': { url: coverImageUrl } } }),
      });

      if (!notionRes.ok) {
        const err = await notionRes.text();
        console.error('Notion patch failed:', err);
        return res.status(500).json({ error: 'Failed to update Notion', details: err });
      }

      return res.status(200).json({ success: true, coverImageUrl });
    } catch (err) {
      console.error('apply-cover-image error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // action=upload (default) - upload file to Vercel Blob
  try {
    const { filename, contentType, data, folder = 'events' } = req.body;
    if (!data || !filename) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    // Guard: reject unknown folders to prevent arbitrary blob path abuse
    if (!ALLOWED_FOLDERS.has(folder)) {
      return res.status(400).json({ error: 'Invalid folder' });
    }

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 2MB.' });
    }

    // ── Auto-rename using Claude Vision ─────────────────────────
    // Generates a descriptive, SEO-friendly filename from the image content.
    // Falls back to the original sanitised name if Claude is unavailable.
    let seoName = filename.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.\-_]/g, '');
    const ext = seoName.split('.').pop() || 'jpg';

    // Only attempt vision rename for image uploads (not apply actions)
    if (process.env.ANTHROPIC_API_KEY && (contentType || '').startsWith('image/')) {
      try {
        const FOLDER_CONTEXT = {
          'business-photos':  'a local business in the Manitou Beach Michigan / Irish Hills / Devils Lake area',
          'business-logos':   'a local business logo in the Manitou Beach Michigan area',
          'business-gallery': 'a local business in the Manitou Beach Michigan / Irish Hills / Devils Lake area',
          'events':           'a community event in the Manitou Beach Michigan / Irish Hills / Devils Lake area',
          'food-trucks':      'a food truck serving the Devils Lake Michigan / Manitou Beach area',
          'stays':            'a vacation rental or lodging near Devils Lake Michigan',
          'sponsors':         'a sponsor or business in the Manitou Beach Michigan area',
        };
        const context = FOLDER_CONTEXT[folder] || 'a location or business near Devils Lake Michigan';
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
                { type: 'image', source: { type: 'base64', media_type: contentType || 'image/jpeg', data } },
                { type: 'text', text: `This image is for ${context}. Generate a descriptive SEO-friendly filename (no extension, use hyphens, max 8 words, include location keywords like manitou-beach, devils-lake, irish-hills, michigan where relevant). Reply with ONLY the filename, nothing else. Example: devils-lake-pontoon-boat-rental-manitou-beach` },
              ],
            }],
          }),
        });
        if (visionRes.ok) {
          const visionData = await visionRes.json();
          const suggested = visionData.content?.[0]?.text?.trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 80);
          if (suggested && suggested.length > 4) {
            seoName = `${suggested}.${ext}`;
          }
        }
      } catch (visionErr) {
        console.warn('Vision rename skipped:', visionErr.message);
        // Fall through to original filename
      }
    }

    const blob = await put(`${folder}/${Date.now()}-${seoName}`, buffer, {
      contentType: contentType || 'image/jpeg',
      access: 'public',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
