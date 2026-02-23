export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, category, email, phone, description, date, dateEnd, time, location, imageUrl } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Event name and email are required' });
  }

  try {
    const dateProperty = date ? { date: { start: date, end: dateEnd || null } } : undefined;

    const properties = {
      'Event Name': { title: [{ text: { content: name } }] },
      'Category': { rich_text: [{ text: { content: category || '' } }] },
      'Email': { email: email },
      'Phone': { phone_number: phone || null },
      'Description': { rich_text: [{ text: { content: description || '' } }] },
      'Time': { rich_text: [{ text: { content: time || '' } }] },
      'Location': { rich_text: [{ text: { content: location || '' } }] },
    };

    if (dateProperty) properties['Event Date'] = dateProperty;
    if (imageUrl) properties['Image URL'] = { url: imageUrl };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_EVENTS },
        properties,
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
