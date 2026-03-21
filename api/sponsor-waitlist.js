// POST /api/sponsor-waitlist
// Writes a waitlist entry to the Sponsor Waitlist Notion DB.
// Called from FeaturedPage when a user clicks "Join waitlist" on a taken page.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, businessName, pageId, pageLabel, _hp } = req.body || {};
  if (_hp) return res.status(200).json({ ok: true }); // honeypot
  if (!name || !email || !pageId) return res.status(400).json({ error: 'Missing required fields' });

  const token = process.env.NOTION_TOKEN_PAGE_SPONSORS || process.env.NOTION_TOKEN_BUSINESS;
  const dbId  = process.env.NOTION_DB_SPONSOR_WAITLIST;
  if (!token || !dbId) return res.status(500).json({ error: 'Waitlist not configured' });

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          'Name':          { title:       [{ text: { content: name } }] },
          'Page ID':       { select:      { name: pageId } },
          'Page Label':    { rich_text:   [{ text: { content: pageLabel || pageId } }] },
          'Email':         { email:       email },
          'Business Name': { rich_text:   [{ text: { content: businessName || '' } }] },
          'Status':        { select:      { name: 'waiting' } },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json();
      console.error('sponsor-waitlist Notion error:', err.message);
      return res.status(500).json({ error: 'Failed to save waitlist entry' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('sponsor-waitlist error:', err.message);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
