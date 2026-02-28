import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notionId, filename } = req.body || {};

  if (!notionId || !filename) {
    return res.status(400).json({ error: 'notionId and filename required' });
  }

  // Verify the file actually exists before patching Notion
  const filePath = path.join(process.cwd(), 'public', 'images', 'yeti', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'Image file not found on server',
      hint: `Drop ${filename} into public/images/yeti/ and push to deploy first`,
    });
  }

  const coverImageUrl = `/images/yeti/${filename}`;

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          'Cover Image URL': { url: coverImageUrl },
        },
      }),
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
