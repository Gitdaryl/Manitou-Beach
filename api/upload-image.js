import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action = 'upload' } = req.body || {};

  // action=apply — update a Notion article's Cover Image URL (no file upload)
  if (action === 'apply') {
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

  // action=upload (default) — upload file to Vercel Blob
  try {
    const { filename, contentType, data, folder = 'events' } = req.body;
    if (!data || !filename) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large. Max 2MB.' });
    }

    const safeName = filename.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.\-_]/g, '');
    const blob = await put(`${folder}/${Date.now()}-${safeName}`, buffer, {
      contentType: contentType || 'image/jpeg',
      access: 'public',
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
