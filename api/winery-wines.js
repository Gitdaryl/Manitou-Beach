// Wines Registry — GET active wines for autocomplete on /rate
// Admin: GET with X-Admin-Token returns all; POST creates; PATCH toggles Active
export default async function handler(req, res) {
  const TOKEN = process.env.NOTION_TOKEN_BUSINESS;
  const DB_ID = process.env.NOTION_DB_WINES;
  const ADMIN_SECRET = process.env.ADMIN_SECRET;

  if (!TOKEN || !DB_ID) {
    return res.status(200).json({ wines: [] });
  }

  const isAdmin = req.headers['x-admin-token'] === ADMIN_SECRET;

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', isAdmin ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=60');

    try {
      let allResults = [];
      let cursor = undefined;

      do {
        const body = {
          page_size: 100,
          ...(isAdmin ? {} : { filter: { property: 'Active', checkbox: { equals: true } } }),
          sorts: [
            { property: 'Venue', direction: 'ascending' },
            { property: 'Name', direction: 'ascending' },
          ],
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

        if (!response.ok) return res.status(200).json({ wines: [] });

        const data = await response.json();
        allResults = allResults.concat(data.results);
        cursor = data.has_more ? data.next_cursor : undefined;
      } while (cursor);

      const wines = allResults.map(page => {
        const p = page.properties;
        return {
          id:       page.id,
          name:     p['Name']?.title?.[0]?.text?.content || '',
          venue:    p['Venue']?.select?.name || '',
          category: p['Category']?.select?.name || '',
          fullName: p['Full Name']?.rich_text?.[0]?.text?.content || '',
          season:   p['Season']?.select?.name || '2026',
          active:   p['Active']?.checkbox ?? false,
        };
      }).filter(w => w.name && w.venue);

      return res.status(200).json({ wines });
    } catch (err) {
      console.error('winery-wines GET error:', err.message);
      return res.status(200).json({ wines: [] });
    }
  }

  // ── POST — create wine (admin only) ──────────────────────────────────────
  if (req.method === 'POST') {
    if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

    const { name, venue, category, fullName, season } = req.body || {};
    if (!name || !venue || !category) {
      return res.status(400).json({ error: 'name, venue, and category are required' });
    }

    const displayName = fullName || `${venue} · ${name}`;

    try {
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
            'Name':      { title:     [{ text: { content: name.trim() } }] },
            'Venue':     { select:    { name: venue } },
            'Category':  { select:    { name: category } },
            'Full Name': { rich_text: [{ text: { content: displayName } }] },
            'Active':    { checkbox: true },
            'Season':    { select: { name: season || '2026' } },
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('winery-wines POST error:', err);
        return res.status(500).json({ error: 'Failed to create wine' });
      }

      const page = await response.json();
      return res.status(200).json({ ok: true, id: page.id });
    } catch (err) {
      console.error('winery-wines POST error:', err.message);
      return res.status(500).json({ error: 'Failed to create wine' });
    }
  }

  // ── PATCH — toggle Active (admin only) ───────────────────────────────────
  if (req.method === 'PATCH') {
    if (!isAdmin) return res.status(401).json({ error: 'Unauthorized' });

    const { id, active } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });

    try {
      const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: { 'Active': { checkbox: !!active } },
        }),
      });

      if (!response.ok) return res.status(500).json({ error: 'Failed to update wine' });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('winery-wines PATCH error:', err.message);
      return res.status(500).json({ error: 'Failed to update wine' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
