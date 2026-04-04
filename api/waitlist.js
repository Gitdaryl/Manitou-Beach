export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, businessName, tier, _hp } = req.body || {};

  // Honeypot - bots fill hidden fields, humans don't
  if (_hp) return res.status(200).json({ success: true });

  if (!name || !email || !email.includes('@') || !businessName) {
    return res.status(400).json({ error: 'name, email, and businessName are required' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_BUSINESS },
        properties: {
          'Name':        { title: [{ text: { content: businessName } }] },
          'Category':    { select: { name: 'Waitlist' } },
          'Email':       { email: email },
          'Description': { rich_text: [{ text: { content: `Contact: ${name} | Preferred tier: ${tier || 'Any'}` } }] },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion waitlist error:', err);
      return res.status(500).json({ error: 'Failed to save waitlist entry' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Waitlist API error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
