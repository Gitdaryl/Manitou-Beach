// Winery Ratings — POST to submit a tasting review, GET to fetch aggregates by venue
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const TOKEN = process.env.NOTION_TOKEN_BUSINESS;
  const DB_ID = process.env.NOTION_DB_WINERY_RATINGS;

  if (!TOKEN || !DB_ID) {
    return res.status(200).json({ ratings: {} });
  }

  if (req.method === 'POST') {
    const { venue, rating, wineTried, note, sessionId } = req.body || {};

    if (!venue || !rating || !wineTried) {
      return res.status(400).json({ error: 'venue, rating, and wineTried are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1–5' });
    }

    const today = new Date().toISOString().split('T')[0];

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: {
          'Name':      { title:     [{ text: { content: `${venue} — ${today}` } }] },
          'Venue':     { select:    { name: venue } },
          'Rating':    { number:    Number(rating) },
          'WineTried': { rich_text: [{ text: { content: String(wineTried).slice(0, 2000) } }] },
          'Note':      { rich_text: [{ text: { content: String(note || '').slice(0, 2000) } }] },
          'SessionID': { rich_text: [{ text: { content: String(sessionId || '') } }] },
          'Date':      { date:      { start: today } },
        },
      }),
    });

    if (!response.ok) {
      console.error('Notion winery-ratings write failed:', await response.text());
      return res.status(500).json({ error: 'Failed to save rating' });
    }

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    let allResults = [];
    let cursor = undefined;

    try {
      do {
        const body = {
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        };

        const response = await fetch(
          `https://api.notion.com/v1/databases/${DB_ID}/query`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${TOKEN}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) return res.status(200).json({ ratings: {} });

        const data = await response.json();
        allResults = allResults.concat(data.results);
        cursor = data.has_more ? data.next_cursor : undefined;
      } while (cursor);
    } catch (err) {
      console.error('Winery ratings GET error:', err.message);
      return res.status(200).json({ ratings: {} });
    }

    // Aggregate by venue: { avg, count }
    const agg = {};
    for (const page of allResults) {
      const p = page.properties;
      const venue = p['Venue']?.select?.name;
      const rating = p['Rating']?.number;
      if (!venue || !rating) continue;
      if (!agg[venue]) agg[venue] = { total: 0, count: 0 };
      agg[venue].total += rating;
      agg[venue].count += 1;
    }

    const ratings = {};
    for (const [venue, { total, count }] of Object.entries(agg)) {
      ratings[venue] = { avg: Math.round((total / count) * 10) / 10, count };
    }

    return res.status(200).json({ ratings });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
