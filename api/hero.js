const DAYS_AHEAD = 14;

export default async function handler(req, res) {
  // Cache for 10 minutes — no need to hit Notion on every page load
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_HERO}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_HERO}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            property: 'Hero Active',
            checkbox: { equals: true },
          },
          sorts: [{ property: 'Event Date', direction: 'ascending' }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Notion query failed:', await response.text());
      return res.status(200).json({ event: null });
    }

    const data = await response.json();
    const now = new Date();
    const cutoff = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

    // Find first event that is active and within the window (not yet passed)
    const activeEvent = data.results.find(page => {
      const dateProp = page.properties['Event Date']?.date?.start;
      if (!dateProp) return false;
      const eventDate = new Date(dateProp);
      return eventDate >= now && eventDate <= cutoff;
    });

    if (!activeEvent) {
      return res.status(200).json({ event: null });
    }

    const p = activeEvent.properties;
    return res.status(200).json({
      event: {
        name: p['Event Name']?.title?.[0]?.text?.content || '',
        date: p['Event Date']?.date?.start || '',
        tagline: p['Tagline']?.rich_text?.[0]?.text?.content || '',
        imageUrl: p['Hero Image URL']?.url || null,
        videoUrl: p['Hero Video URL']?.url || null,
      },
    });
  } catch (err) {
    console.error('Hero API error:', err.message);
    return res.status(200).json({ event: null });
  }
}
