export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, category, email, phone, description } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Event name and email are required' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_EVENTS },
        properties: {
          'Event Name': { title: [{ text: { content: name } }] },
          'Category': { rich_text: [{ text: { content: category || '' } }] },
          'Email': { email: email },
          'Phone': { phone_number: phone || null },
          'Description': { rich_text: [{ text: { content: description || '' } }] },
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion error:', err);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
