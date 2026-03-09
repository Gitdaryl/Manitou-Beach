// Winery Ratings Admin — list all ratings, update status
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN_BUSINESS;
  const DB_ID = process.env.NOTION_DB_WINERY_RATINGS;

  if (!NOTION_TOKEN || !DB_ID) {
    return res.status(500).json({ error: 'Notion not configured' });
  }

  const HEADERS = {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  // GET — list all ratings (all statuses), newest first
  if (req.method === 'GET') {
    let allResults = [];
    let cursor = undefined;
    try {
      do {
        const body = {
          page_size: 100,
          sorts: [{ property: 'Date', direction: 'descending' }],
          ...(cursor ? { start_cursor: cursor } : {}),
        };
        const r = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
          method: 'POST', headers: HEADERS, body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error(await r.text());
        const d = await r.json();
        allResults = allResults.concat(d.results);
        cursor = d.has_more ? d.next_cursor : undefined;
      } while (cursor);
    } catch (err) {
      console.error('winery-ratings-admin GET error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch ratings' });
    }

    const ratings = allResults.map(page => {
      const p = page.properties;
      const richText = key => p[key]?.rich_text?.[0]?.plain_text || '';
      return {
        id: page.id,
        venue: p['Venue']?.select?.name || '',
        rating: p['Rating']?.number || 0,
        service: p['Service']?.number || null,
        atmosphere: p['Atmosphere']?.number || null,
        value: p['Value']?.number || null,
        wineTried: richText('WineTried'),
        note: richText('Note'),
        quote: richText('Quote'),
        sessionId: richText('SessionID'),
        date: p['Date']?.date?.start || '',
        status: p['Status']?.select?.name || 'Pending',
      };
    });

    return res.status(200).json({ ratings });
  }

  // PATCH — update status of a rating
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !['Pending', 'Published', 'Flagged'].includes(status)) {
      return res.status(400).json({ error: 'id and status (Pending|Published|Flagged) required' });
    }
    const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ properties: { Status: { select: { name: status } } } }),
    });
    if (!r.ok) {
      console.error('winery-ratings-admin PATCH error:', await r.text());
      return res.status(500).json({ error: 'Failed to update status' });
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
