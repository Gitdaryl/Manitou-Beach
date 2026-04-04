// Batch geocode all businesses in Notion that have an address but no lat/lng
// Protected: requires X-Admin-Token header matching ADMIN_SECRET env var

async function geocodeAddress(address) {
  const q = encodeURIComponent(address + ', Michigan, USA');
  const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
    headers: { 'User-Agent': 'ManitouBeach/1.0 (site@manitoubeach.com)' },
  });
  if (!res.ok) return null;
  const results = await res.json();
  if (!results.length) return null;
  // Reject natural water features - Nominatim sometimes matches road addresses to the lake itself
  if (results[0].class === 'natural' || results[0].type === 'water') return null;
  const lat = parseFloat(results[0].lat);
  const lng = parseFloat(results[0].lon);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng, displayName: results[0].display_name, osmClass: results[0].class, osmType: results[0].type };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch ALL business pages from Notion (no status filter)
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ page_size: 100 }),
      }
    );

    if (!notionRes.ok) throw new Error('Failed to fetch businesses from Notion');
    const data = await notionRes.json();

    let updated = 0, skipped = 0, failed = 0;
    const details = [];

    for (const page of data.results) {
      const p = page.properties;
      const name = p['Name']?.title?.[0]?.text?.content || '(unnamed)';
      const address = p['Address']?.rich_text?.[0]?.text?.content || '';
      const hasLat = p['Lat']?.number != null;
      const hasLng = p['Lng']?.number != null;

      if (!address) { skipped++; details.push({ name, result: 'skipped - no address' }); continue; }
      if (hasLat && hasLng) { skipped++; details.push({ name, result: 'skipped - already geocoded' }); continue; }

      // Rate limit: Nominatim asks for max 1 req/sec
      await new Promise(r => setTimeout(r, 1100));

      const coords = await geocodeAddress(address).catch(() => null);
      if (!coords) { failed++; details.push({ name, result: 'failed - no result' }); continue; }

      const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: {
            'Lat': { number: coords.lat },
            'Lng': { number: coords.lng },
          },
        }),
      });

      if (patchRes.ok) {
        updated++;
        details.push({ name, result: `geocoded → ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)} (${coords.osmClass}/${coords.osmType})` });
      } else {
        failed++;
        details.push({ name, result: 'failed - Notion patch error' });
      }
    }

    return res.status(200).json({ updated, skipped, failed, details });
  } catch (err) {
    console.error('Geocode batch error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
