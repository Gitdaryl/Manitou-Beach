// Winery Ratings — POST to submit a tasting review, GET to fetch aggregates by venue + wine rankings
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const TOKEN = process.env.NOTION_TOKEN_BUSINESS;
  const DB_ID = process.env.NOTION_DB_WINERY_RATINGS;
  const WINES_DB_ID = process.env.NOTION_DB_WINES;

  if (!TOKEN || !DB_ID) {
    return res.status(200).json({ ratings: {} });
  }

  if (req.method === 'POST') {
    const { venue, rating, service, atmosphere, value, wineTried, note, quote, sessionId } = req.body || {};

    if (!venue || !rating || !wineTried) {
      return res.status(400).json({ error: 'venue, rating, and wineTried are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1–5' });
    }

    const today = new Date().toISOString().split('T')[0];

    const props = {
      'Name':      { title:     [{ text: { content: `${venue} — ${today}` } }] },
      'Venue':     { select:    { name: venue } },
      'Rating':    { number:    Number(rating) },
      'WineTried': { rich_text: [{ text: { content: String(wineTried).slice(0, 2000) } }] },
      'Note':      { rich_text: [{ text: { content: String(note || '').slice(0, 2000) } }] },
      'Quote':     { rich_text: [{ text: { content: String(quote || '').slice(0, 2000) } }] },
      'SessionID': { rich_text: [{ text: { content: String(sessionId || '') } }] },
      'Date':      { date:      { start: today } },
      'Status':    { select:    { name: 'Pending' } },
    };
    if (service   && service   >= 1 && service   <= 5) props['Service']    = { number: Number(service) };
    if (atmosphere && atmosphere >= 1 && atmosphere <= 5) props['Atmosphere'] = { number: Number(atmosphere) };
    if (value     && value     >= 1 && value     <= 5) props['Value']      = { number: Number(value) };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ parent: { database_id: DB_ID }, properties: props }),
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
          filter: { property: 'Status', select: { equals: 'Published' } },
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

    // Aggregate by venue: { avg, count, service_avg, atmosphere_avg, value_avg }
    const agg = {};
    for (const page of allResults) {
      const p = page.properties;
      const venue = p['Venue']?.select?.name;
      const rating = p['Rating']?.number;
      if (!venue || !rating) continue;
      if (!agg[venue]) agg[venue] = { total: 0, count: 0, svcTotal: 0, svcCount: 0, atmTotal: 0, atmCount: 0, valTotal: 0, valCount: 0 };
      agg[venue].total += rating;
      agg[venue].count += 1;
      const svc = p['Service']?.number;
      const atm = p['Atmosphere']?.number;
      const val = p['Value']?.number;
      if (svc) { agg[venue].svcTotal += svc; agg[venue].svcCount += 1; }
      if (atm) { agg[venue].atmTotal += atm; agg[venue].atmCount += 1; }
      if (val) { agg[venue].valTotal += val; agg[venue].valCount += 1; }
    }

    const ratings = {};
    const rnd = (t, c) => c > 0 ? Math.round((t / c) * 10) / 10 : null;
    for (const [venue, d] of Object.entries(agg)) {
      ratings[venue] = {
        avg:            rnd(d.total, d.count),
        count:          d.count,
        service_avg:    rnd(d.svcTotal, d.svcCount),
        atmosphere_avg: rnd(d.atmTotal, d.atmCount),
        value_avg:      rnd(d.valTotal, d.valCount),
      };
    }

    // ── Wine-level aggregation ──────────────────────────────────────────────
    let wineRankings = [];
    if (WINES_DB_ID && allResults.length > 0) {
      try {
        // Fetch the wine registry
        const winesRes = await fetch(
          `https://api.notion.com/v1/databases/${WINES_DB_ID}/query`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${TOKEN}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
              page_size: 100,
              filter: { property: 'Active', checkbox: { equals: true } },
            }),
          }
        );

        if (winesRes.ok) {
          const winesData = await winesRes.json();
          const registry = winesData.results.map(p => ({
            id:       p.id,
            name:     p.properties['Name']?.title?.[0]?.text?.content || '',
            venue:    p.properties['Venue']?.select?.name || '',
            category: p.properties['Category']?.select?.name || '',
            fullName: p.properties['Full Name']?.rich_text?.[0]?.text?.content || '',
          })).filter(w => w.name);

          // Count mentions — case-insensitive substring match in WineTried
          const wineCounts = {};
          for (const page of allResults) {
            const wineTried = page.properties['WineTried']?.rich_text?.[0]?.text?.content || '';
            if (!wineTried) continue;
            const parts = wineTried.split('·').map(s => s.trim().toLowerCase());
            for (const wine of registry) {
              const nameLC = wine.name.toLowerCase();
              if (parts.some(p => p.includes(nameLC) || nameLC.includes(p))) {
                if (!wineCounts[wine.id]) wineCounts[wine.id] = 0;
                wineCounts[wine.id]++;
              }
            }
          }

          wineRankings = registry
            .map(w => ({ ...w, count: wineCounts[w.id] || 0 }))
            .filter(w => w.count > 0)
            .sort((a, b) => b.count - a.count);
        }
      } catch (err) {
        console.error('Wine rankings aggregation error:', err.message);
        // non-fatal — return empty rankings
      }
    }

    return res.status(200).json({ ratings, wineRankings });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
