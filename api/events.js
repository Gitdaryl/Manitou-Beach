export default async function handler(req, res) {
  // POST — submit a new event
  if (req.method === 'POST') {
    const { name, category, email, phone, description, date, time, location, eventUrl, imageUrl, cost, recurring, recurringDay } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Event name and email are required' });
    }

    let normalizedEventUrl = null;
    if (eventUrl && eventUrl.trim()) {
      let url = eventUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
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
      if (cost) properties['Cost'] = { rich_text: [{ text: { content: cost } }] };
      if (recurring && recurring !== 'None') properties['Recurring'] = { select: { name: recurring } };
      if (recurringDay) properties['Recurring Day'] = { select: { name: recurringDay } };
      return properties;
    };

    const postToNotion = async (properties) => fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ parent: { database_id: process.env.NOTION_DB_EVENTS }, properties }),
    });

    try {
      let response = await postToNotion(buildProperties());
      if (!response.ok) {
        const err = await response.json();
        console.error('Notion error (first attempt):', JSON.stringify(err));
        const isUrlFieldError = err?.message?.toLowerCase().includes('event url') ||
          err?.message?.toLowerCase().includes('image url') || err?.code === 'validation_error';
        if (isUrlFieldError) {
          response = await postToNotion(buildProperties({ includeEventUrl: false, includeImageUrl: false }));
          if (!response.ok) {
            const retryErr = await response.json();
            return res.status(500).json({ error: 'Submission failed', notionError: retryErr?.message || 'Unknown Notion error' });
          }
        } else {
          return res.status(500).json({ error: 'Submission failed', notionError: err?.message || 'Unknown Notion error' });
        }
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Server error:', err.message);
      return res.status(500).json({ error: 'Server error', detail: err.message });
    }
  }

  // GET — fetch approved/published events
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            or: [
              { property: 'Status', status: { equals: 'Approved' } },
              { property: 'Status', status: { equals: 'Published' } },
            ],
          },
          sorts: [{ property: 'Event date', direction: 'ascending' }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Notion query failed:', await response.text());
      return res.status(200).json({ events: [], recurring: [] });
    }

    const data = await response.json();
    const now = new Date();

    const allEvents = data.results
      .map(page => {
        const p = page.properties;
        const dateStr = p['Event date']?.date?.start;
        const recurringVal = p['Recurring']?.select?.name || null;
        return {
          id: page.id,
          name: p['Event Name']?.title?.[0]?.text?.content || '',
          date: dateStr || '',
          dateEnd: p['Event date']?.date?.end || null,
          category: p['Category']?.rich_text?.[0]?.text?.content || 'Community',
          description: p['Description']?.rich_text?.[0]?.text?.content || '',
          time: p['Time']?.rich_text?.[0]?.text?.content || '',
          location: p['Location']?.rich_text?.[0]?.text?.content || '',
          imageUrl: p['Image URL']?.url || null,
          email: p['Email']?.email || '',
          eventUrl: p['Event URL']?.url || null,
          cost: p['Cost']?.rich_text?.[0]?.text?.content || null,
          recurring: recurringVal,
          recurringDay: p['Recurring Day']?.select?.name || null,
          heroFeature: p['Hero Feature']?.checkbox || false,
        };
      })
      .filter(e => e.name);

    const recurring = allEvents.filter(e => e.recurring === 'Weekly' || e.recurring === 'Monthly');
    const events = allEvents
      .filter(e => e.recurring !== 'Weekly' && e.recurring !== 'Monthly')
      .filter(e => {
        if (!e.date) return false;
        return new Date(e.date + 'T23:59:59') >= now;
      });

    return res.status(200).json({ events, recurring });
  } catch (err) {
    console.error('Events API error:', err.message);
    return res.status(200).json({ events: [], recurring: [] });
  }
}
