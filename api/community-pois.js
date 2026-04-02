// Community POIs — public, visitor-facing locations that will never advertise
// (hospitals, schools, boat launches, pharmacies, etc.)
// Separate from the paid Businesses DB.

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let allResults = [];
    let cursor = undefined;

    // Also fetch Hidden POI names so the frontend can suppress hardcoded fallbacks
    const hiddenRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_POIS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_POIS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: { property: 'Status', select: { equals: 'Hidden' } },
          page_size: 100,
        }),
      }
    );
    const hiddenData = hiddenRes.ok ? await hiddenRes.json() : { results: [] };
    const suppressed = (hiddenData.results || [])
      .map(p => p.properties?.['Name']?.title?.[0]?.text?.content || '')
      .filter(Boolean)
      .map(n => n.toLowerCase());

    // Paginate through all Active POIs
    do {
      const body = {
        filter: { property: 'Status', select: { equals: 'Active' } },
        sorts: [{ property: 'Category', direction: 'ascending' }, { property: 'Name', direction: 'ascending' }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };

      const response = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DB_POIS}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NOTION_TOKEN_POIS}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        console.error('Notion POIs query failed:', await response.text());
        return res.status(200).json({ pois: [] });
      }

      const data = await response.json();
      allResults = allResults.concat(data.results);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    const pois = allResults
      .map(page => {
        const p = page.properties;
        const name = p['Name']?.title?.[0]?.text?.content || '';
        const lat = p['Lat']?.number ?? null;
        const lng = p['Lng']?.number ?? null;
        if (!name || lat === null || lng === null) return null;

        return {
          id: `poi-${page.id}`,
          name,
          cat: (p['Category']?.select?.name || 'community').toLowerCase(),
          sub: p['Sub']?.rich_text?.[0]?.text?.content || '',
          address: p['Address']?.rich_text?.[0]?.text?.content || '',
          lat,
          lng,
          phone: p['Phone']?.phone_number || '',
          website: p['Website']?.url || '',
          note: p['Note']?.rich_text?.[0]?.text?.content || '',
          hours: p['Hours']?.rich_text?.[0]?.text?.content || '',
        };
      })
      .filter(Boolean);

    return res.status(200).json({ pois, suppressed });
  } catch (err) {
    console.error('Community POIs API error:', err.message);
    return res.status(200).json({ pois: [] });
  }
}
