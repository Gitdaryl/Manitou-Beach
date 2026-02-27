const DAYS_AHEAD = 30; // 30-day window for hero feature events

export default async function handler(req, res) {
  // Cache for 10 minutes
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');

  try {
    // Consolidated into NOTION_DB_EVENTS — uses Hero Feature checkbox
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
            and: [
              { property: 'Hero Feature', checkbox: { equals: true } },
              {
                or: [
                  { property: 'Status', status: { equals: 'Approved' } },
                  { property: 'Status', status: { equals: 'Published' } },
                ],
              },
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
    const cutoff = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

    const heroEvents = data.results
      .filter(page => {
        const dateProp = page.properties['Event date']?.date?.start;
        if (!dateProp) return false;
        const eventDate = new Date(dateProp);
        return eventDate >= now && eventDate <= cutoff;
      })
      .map(page => {
        const p = page.properties;
        return {
          name: p['Event Name']?.title?.[0]?.text?.content || '',
          date: p['Event date']?.date?.start || '',
          tagline: p['Tagline']?.rich_text?.[0]?.text?.content || '',
          heroImageUrl: p['Hero Image URL']?.url || null,  // High-res background image
          imageUrl: p['Image URL']?.url || null,           // Small event image — shown inline below date
          eventUrl: p['Event URL']?.url || null,
          ctaLabel: p['CTA Label']?.select?.name || null,  // e.g. "Get Tickets", "Learn More"
          time: p['Time']?.rich_text?.[0]?.text?.content || '',
          location: p['Location']?.rich_text?.[0]?.text?.content || '',
          cost: p['Cost']?.rich_text?.[0]?.text?.content || null,
        };
      })
      .filter(e => e.name);

    return res.status(200).json({ events: heroEvents });
  } catch (err) {
    console.error('Hero API error:', err.message);
    return res.status(200).json({ events: [] });
  }
}
