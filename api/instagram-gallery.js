// /api/instagram-gallery.js
// GET → returns recent @manitoubeachlife Instagram posts (images only)
// Pulls from the MB account's own media feed via Meta Graph API.
// Cached hourly — Instagram API rate limits are generous but no need to hammer it.

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const igId = process.env.META_IG_ACCOUNT_ID || process.env.IG_BUSINESS_ACCOUNT_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;

  if (!igId || !token) {
    return res.status(200).json({ posts: [] });
  }

  try {
    const fields = 'id,caption,media_url,media_type,permalink,timestamp';
    const url = `https://graph.facebook.com/v25.0/${igId}/media?fields=${fields}&limit=24&access_token=${token}`;

    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('Instagram gallery API error:', await resp.text());
      return res.status(200).json({ posts: [] });
    }

    const data = await resp.json();
    const posts = (data.data || [])
      .filter(p => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
      .map(p => ({
        id: p.id,
        mediaUrl: p.media_url,
        permalink: p.permalink,
        caption: p.caption ? p.caption.slice(0, 120) : '',
        timestamp: p.timestamp,
      }));

    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('instagram-gallery error:', err.message);
    return res.status(200).json({ posts: [] });
  }
}
