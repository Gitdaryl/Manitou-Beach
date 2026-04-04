// POST /api/social-post
// Admin-only: posts content to Facebook Page and/or Instagram Business Account
// Body: {
//   token,           // ADMIN_SECRET
//   message,         // text content for the post
//   imageUrl?,       // publicly accessible image URL (optional)
//   platforms?,      // array: ['facebook', 'instagram'] - defaults to both
// }
// Returns: { facebook?: { id }, instagram?: { id }, igAccountId? }

const FB_API = 'https://graph.facebook.com/v25.0';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, message, imageUrl, platforms = ['facebook', 'instagram'] } = req.body || {};

  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }

  const pageId = process.env.FB_PAGE_ID;
  const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageId || !pageToken) {
    return res.status(500).json({ error: 'Facebook credentials not configured' });
  }

  const results = {};
  const errors = {};

  // ── Facebook ──────────────────────────────────────────────────────────────
  if (platforms.includes('facebook')) {
    try {
      const fbBody = { message, access_token: pageToken };
      let fbEndpoint = `${FB_API}/${pageId}/feed`;

      if (imageUrl) {
        fbEndpoint = `${FB_API}/${pageId}/photos`;
        fbBody.url = imageUrl;
        fbBody.caption = message;
        delete fbBody.message;
      }

      const fbRes = await fetch(fbEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbBody),
      });

      const fbData = await fbRes.json();
      if (fbData.error) throw new Error(fbData.error.message);
      results.facebook = { id: fbData.id || fbData.post_id };
    } catch (err) {
      errors.facebook = err.message;
    }
  }

  // ── Instagram ─────────────────────────────────────────────────────────────
  if (platforms.includes('instagram')) {
    try {
      // Resolve IG Business Account ID if not cached
      let igAccountId = process.env.IG_BUSINESS_ACCOUNT_ID;

      if (!igAccountId) {
        const igLookup = await fetch(
          `${FB_API}/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
        );
        const igLookupData = await igLookup.json();
        igAccountId = igLookupData?.instagram_business_account?.id;

        if (!igAccountId) {
          throw new Error('Instagram Business Account not found - ensure IG is linked to the FB Page');
        }

        // Surface the ID so it can be saved to env
        results.igAccountId = igAccountId;
      }

      // Instagram requires an image for feed posts
      if (!imageUrl) {
        throw new Error('Instagram feed posts require an imageUrl');
      }

      // Step 1: Create media container
      const containerRes = await fetch(`${FB_API}/${igAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: message,
          access_token: pageToken,
        }),
      });
      const containerData = await containerRes.json();
      if (containerData.error) throw new Error(containerData.error.message);

      // Step 2: Publish the container
      const publishRes = await fetch(`${FB_API}/${igAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: pageToken,
        }),
      });
      const publishData = await publishRes.json();
      if (publishData.error) throw new Error(publishData.error.message);

      results.instagram = { id: publishData.id };
    } catch (err) {
      errors.instagram = err.message;
    }
  }

  const hasSuccess = Object.keys(results).length > 0;
  const hasErrors = Object.keys(errors).length > 0;

  return res.status(hasSuccess ? 200 : 500).json({
    success: hasSuccess,
    results,
    ...(hasErrors && { errors }),
  });
}
