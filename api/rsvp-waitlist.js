const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { eventId, eventName, name, email, phone } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!eventId) return res.status(400).json({ error: 'Event ID required' });

  try {
    const properties = {
      'Name': { title: [{ text: { content: name || email } }] },
      'Email': { email: email },
      'Event ID': { rich_text: [{ text: { content: eventId } }] },
      'Event Name': { rich_text: [{ text: { content: eventName || '' } }] },
    };
    if (phone) properties['Phone'] = { phone_number: phone };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({ parent: { database_id: process.env.NOTION_DB_WAITLIST }, properties }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json();
      console.error('Waitlist Notion write error:', JSON.stringify(err));
      return res.status(500).json({ error: 'Failed to save' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Waitlist error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
