// /api/visitor-pin.js
// GET  → returns all pins for the world map
// POST { city, state, country, lat, lng, name?, message?, _hp } → submit a new pin

const NOTION_VERSION = '2022-06-28';

function headers() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const dbId = process.env.NOTION_DB_VISITOR_PINS;
    if (!dbId) return res.status(200).json({ pins: [] });

    const allPins = [];
    let cursor;

    do {
      const body = {
        sorts: [{ property: 'Created', direction: 'descending' }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };
      const resp = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      });
      if (!resp.ok) break;
      const data = await resp.json();

      data.results.forEach(page => {
        const p = page.properties;
        const lat = p['Lat']?.number ?? null;
        const lng = p['Lng']?.number ?? null;
        if (lat === null || lng === null) return;
        allPins.push({
          id: page.id,
          city: p['City']?.rich_text?.[0]?.text?.content || '',
          state: p['State']?.rich_text?.[0]?.text?.content || '',
          country: p['Country']?.rich_text?.[0]?.text?.content || '',
          lat,
          lng,
          message: p['Message']?.rich_text?.[0]?.text?.content || '',
          created: p['Created']?.date?.start || '',
        });
      });

      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ pins: allPins });
  }

  if (req.method === 'POST') {
    const { city, country, state, lat, lng, name, message, _hp } = req.body || {};

    if (_hp) return res.status(200).json({ ok: true });
    if (!city?.trim() || !country?.trim()) return res.status(400).json({ error: 'City and country are required.' });
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return res.status(400).json({ error: 'Location coordinates required.' });

    const dbId = process.env.NOTION_DB_VISITOR_PINS;
    if (!dbId) return res.status(500).json({ error: 'Not configured.' });

    const today = new Date().toISOString().split('T')[0];
    const visitorLabel = name?.trim() || 'A visitor';

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          'Visitor Name': { title: [{ text: { content: visitorLabel } }] },
          'City':    { rich_text: [{ text: { content: city.trim() } }] },
          'State':   { rich_text: [{ text: { content: state?.trim() || '' } }] },
          'Country': { rich_text: [{ text: { content: country.trim() } }] },
          'Lat':     { number: parseFloat(lat) },
          'Lng':     { number: parseFloat(lng) },
          ...(message?.trim() && { 'Message': { rich_text: [{ text: { content: message.trim() } }] } }),
          'Created': { date: { start: today } },
        },
      }),
    });

    if (!notionRes.ok) {
      console.error('visitor-pin Notion error:', await notionRes.text());
      return res.status(500).json({ error: 'Could not save pin. Please try again.' });
    }

    return res.status(200).json({ ok: true, city: city.trim(), country: country.trim() });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
