import { del } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { notionId, videoUrl, oldVideoUrl } = req.body;
  if (!notionId) return res.status(400).json({ error: 'notionId required' });

  try {
    // Delete old blob if it's a Vercel Blob URL and we're replacing/removing it
    if (oldVideoUrl && oldVideoUrl.includes('vercel-storage.com') && oldVideoUrl !== videoUrl) {
      try { await del(oldVideoUrl); } catch (e) { console.warn('Old blob del skipped:', e.message); }
    }

    const notionRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          'Video URL': videoUrl ? { url: videoUrl } : { url: null },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion patch-video error:', err);
      return res.status(500).json({ error: 'Notion update failed', details: err });
    }

    return res.json({ success: true, videoUrl: videoUrl || null });
  } catch (err) {
    console.error('patch-event-video error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
