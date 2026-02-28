export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, name, email } = req.body || {};

  if (!slug || !name || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'slug, name, and valid email required' });
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_CLAIMS },
        properties: {
          'Name':     { title:     [{ text: { content: name } }] },
          'Email':    { email:     email },
          'Business': { select:    { name: slug } },
          'Claimed At': { date:    { start: new Date().toISOString() } },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion submit-claim error:', err);
      return res.status(500).json({ error: 'Failed to record claim' });
    }

    const page = await notionRes.json();
    const claimCode = page.id.replace(/-/g, '').substring(0, 6).toUpperCase();

    return res.status(200).json({ notionId: page.id, claimCode });
  } catch (err) {
    console.error('submit-claim error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
