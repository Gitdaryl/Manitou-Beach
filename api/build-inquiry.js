export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, business, email, phone, notes, _hp } = req.body || {};

  // Honeypot - bots fill hidden fields, humans don't
  if (_hp) return res.status(200).json({ success: true });

  if (!name || !business || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'name, business, and valid email are required' });
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
        parent: { database_id: process.env.NOTION_DB_WEBSITE_INQUIRIES },
        properties: {
          'Name':         { title: [{ text: { content: name } }] },
          'Business':     { rich_text: [{ text: { content: business } }] },
          'Email':        { email: email },
          'Phone':        { phone_number: (phone || '').trim() || null },
          'Notes':        { rich_text: [{ text: { content: notes || '' } }] },
          'Submitted At': { date: { start: new Date().toISOString() } },
          'Status':       { select: { name: 'New' } },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion build-inquiry error:', err);
      return res.status(500).json({ error: 'Failed to save inquiry' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('build-inquiry error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
