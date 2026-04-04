export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, category, message, _hp } = req.body || {};

  // Honeypot - bots fill hidden fields, humans don't
  if (_hp) return res.status(200).json({ success: true });

  if (!name || !email || !email.includes('@') || !message) {
    return res.status(400).json({ error: 'Name, valid email, and message are required' });
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
        parent: { database_id: process.env.NOTION_DB_CONTACT },
        properties: {
          'Name':         { title: [{ text: { content: name } }] },
          'Email':        { email: email },
          'Category':     { select: { name: category || 'Other' } },
          'Message':      { rich_text: [{ text: { content: message.slice(0, 2000) } }] },
          'Submitted At': { date: { start: new Date().toISOString() } },
          'Status':       { select: { name: 'New' } },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion contact error:', err);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('contact error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
