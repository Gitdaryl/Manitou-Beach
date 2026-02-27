export default async function handler(req, res) {
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
          // Only pull Approved or Published events — Pending = not ready for site
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
      return res.status(200).json({ events: [] });
    }

    const data = await response.json();
    const now = new Date();

    const events = data.results
      .map(page => {
        const p = page.properties;
        const dateStr = p['Event date']?.date?.start;
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
        };
      })
      .filter(e => {
        if (!e.date) return false;
        const eventDate = new Date(e.date + 'T23:59:59');
        return eventDate >= now;
      });

    return res.status(200).json({ events });
  } catch (err) {
    console.error('Events API error:', err.message);
    return res.status(200).json({ events: [] });
  }
}
