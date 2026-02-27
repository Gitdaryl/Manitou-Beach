export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, category, email, phone, description, date, time, location, eventUrl, imageUrl } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Event name and email are required' });
  }

  // Normalize event URL if provided
  let normalizedEventUrl = null;
  if (eventUrl && eventUrl.trim()) {
    let url = eventUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    normalizedEventUrl = url;
  }

  const buildProperties = ({ includeEventUrl = true, includeImageUrl = true } = {}) => {
    const properties = {
      'Event Name': { title: [{ text: { content: name } }] },
      'Category': { rich_text: [{ text: { content: category || '' } }] },
      'Email': { email: email },
      'Phone': { phone_number: phone || null },
      'Description': { rich_text: [{ text: { content: description || '' } }] },
      'Time': { rich_text: [{ text: { content: time || '' } }] },
      'Location': { rich_text: [{ text: { content: location || '' } }] },
    };

    if (date) properties['Event date'] = { date: { start: date } };
    if (includeEventUrl && normalizedEventUrl) properties['Event URL'] = { url: normalizedEventUrl };
    if (includeImageUrl && imageUrl) properties['Image URL'] = { url: imageUrl };

    return properties;
  };

  const postToNotion = async (properties) => {
    return fetch('https://api.notion.com/v1/pages', {
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
  };

  try {
    // First attempt — include all optional fields
    let response = await postToNotion(buildProperties());

    // If Notion rejected it, retry without optional URL fields (likely missing columns)
    if (!response.ok) {
      const err = await response.json();
      console.error('Notion error (first attempt):', JSON.stringify(err));

      const isUrlFieldError = err?.message?.toLowerCase().includes('event url') ||
        err?.message?.toLowerCase().includes('image url') ||
        err?.code === 'validation_error';

      if (isUrlFieldError) {
        console.log('Retrying without Event URL / Image URL fields...');
        response = await postToNotion(buildProperties({ includeEventUrl: false, includeImageUrl: false }));

        if (!response.ok) {
          const retryErr = await response.json();
          console.error('Notion error (retry):', JSON.stringify(retryErr));
          return res.status(500).json({
            error: 'Submission failed',
            notionError: retryErr?.message || 'Unknown Notion error',
            hint: 'Check that your Notion database has these columns: Event Name (title), Category (rich text), Email (email), Phone (phone), Description (rich text), Time (rich text), Location (rich text), Event date (date)',
          });
        }
      } else {
        return res.status(500).json({
          error: 'Submission failed',
          notionError: err?.message || 'Unknown Notion error',
          hint: 'Check that your Notion database columns match exactly (case-sensitive)',
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}
