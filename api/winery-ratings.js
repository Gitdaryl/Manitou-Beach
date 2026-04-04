// Winery Ratings - POST to submit a tasting review, GET to fetch aggregates by venue + wine rankings
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const TOKEN = process.env.NOTION_TOKEN_BUSINESS;
  const DB_ID = process.env.NOTION_DB_WINERY_RATINGS;
  const WINES_DB_ID = process.env.NOTION_DB_WINES;

  if (!TOKEN || !DB_ID) {
    return res.status(200).json({ ratings: {} });
  }

  if (req.method === 'POST') {
    const { venue, rating, wineRatings, service, atmosphere, experience, value, wineTried, note, firstName, sessionId } = req.body || {};

    // Support both new format (wineRatings array) and legacy (single rating + wineTried string)
    const hasNewFormat = Array.isArray(wineRatings) && wineRatings.length > 0;
    const validWineRatings = hasNewFormat
      ? wineRatings.filter(w => w.name?.trim() && w.rating >= 1 && w.rating <= 5)
      : [];

    // Compute the overall pour score: average of per-wine ratings, or legacy single rating
    const overallRating = hasNewFormat
      ? Math.round((validWineRatings.reduce((s, w) => s + w.rating, 0) / validWineRatings.length) * 10) / 10
      : Number(rating);

    // Build wineTried string: "name:rating · name:rating" for new format, or legacy plain string
    const wineTriedStr = hasNewFormat
      ? validWineRatings.map(w => `${w.name.trim()}:${w.rating}`).join(' · ')
      : String(wineTried || '').trim();

    if (!venue || (!hasNewFormat && !rating) || (!hasNewFormat && !wineTried)) {
      return res.status(400).json({ error: 'venue and wine ratings are required' });
    }
    if (hasNewFormat && validWineRatings.length === 0) {
      return res.status(400).json({ error: 'At least one wine with a valid rating (1-5) is required' });
    }
    if (!hasNewFormat && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be 1–5' });
    }

    const today = new Date().toISOString().split('T')[0];

    const props = {
      'Name':      { title:     [{ text: { content: `${venue} - ${today}` } }] },
      'Venue':     { select:    { name: venue } },
      'Rating':    { number:    overallRating },
      'WineTried': { rich_text: [{ text: { content: wineTriedStr.slice(0, 2000) } }] },
      'Note':      { rich_text: [{ text: { content: String(note || '').slice(0, 2000) } }] },
      // Quote stores the visitor's first name so comments can be attributed on site
      'Quote':     { rich_text: [{ text: { content: String(firstName || '').slice(0, 100) } }] },
      'SessionID': { rich_text: [{ text: { content: String(sessionId || '') } }] },
      'Date':      { date:      { start: today } },
      'Status':    { select:    { name: 'Pending' } },
    };
    if (service    && service    >= 1 && service    <= 5) props['Service']    = { number: Number(service) };
    if (atmosphere && atmosphere >= 1 && atmosphere <= 5) props['Atmosphere'] = { number: Number(atmosphere) };
    // New: Experience replaces Value - but accept either for backward compat
    const exp = experience || value;
    if (exp && exp >= 1 && exp <= 5) props['Experience'] = { number: Number(exp) };

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

    // ── Auto-register unknown wines ────────────────────────────────────────
    const wineNames = hasNewFormat
      ? validWineRatings.map(w => w.name.trim())
      : (wineTried || '').trim() ? [wineTried.trim()] : [];

    if (WINES_DB_ID && wineNames.length > 0) {
      try {
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
              filter: { property: 'Venue', select: { equals: venue } },
            }),
          }
        );

        if (winesRes.ok) {
          const winesData = await winesRes.json();
          const existingNames = winesData.results.map(p =>
            (p.properties['Name']?.title?.[0]?.text?.content || '').toLowerCase()
          );

          for (const wineName of wineNames) {
            const inputLC = wineName.toLowerCase();
            const alreadyKnown = existingNames.some(n =>
              n.includes(inputLC) || inputLC.includes(n)
            );

            if (!alreadyKnown) {
              // Add as inactive - admin reviews before it goes live on the leaderboard
              await fetch('https://api.notion.com/v1/pages', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${TOKEN}`,
                  'Content-Type': 'application/json',
                  'Notion-Version': '2022-06-28',
                },
                body: JSON.stringify({
                  parent: { database_id: WINES_DB_ID },
                  properties: {
                    'Name':      { title:     [{ text: { content: wineName.slice(0, 200) } }] },
                    'Venue':     { select:    { name: venue } },
                    'Category':  { select:    { name: 'Unknown' } },
                    'Full Name': { rich_text: [{ text: { content: `${venue} · ${wineName}`.slice(0, 200) } }] },
                    'Active':    { checkbox: false },
                    'Season':    { select:    { name: '2026' } },
                  },
                }),
              });
              existingNames.push(inputLC); // prevent double-add within same submission
            }
          }
        }
      } catch (err) {
        // Non-fatal - the rating was already saved successfully
        console.error('Auto-wine-register error:', err.message);
      }
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
          sorts: [{ property: 'Date', direction: 'descending' }],
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

    // ── Aggregate by venue ──────────────────────────────────────────────────
    const agg = {};
    const commentsByVenue = {};

    for (const page of allResults) {
      const p = page.properties;
      const venue = p['Venue']?.select?.name;
      const rating = p['Rating']?.number;
      if (!venue || !rating) continue;

      if (!agg[venue]) agg[venue] = { total: 0, count: 0, svcTotal: 0, svcCount: 0, atmTotal: 0, atmCount: 0, expTotal: 0, expCount: 0 };
      agg[venue].total += rating;
      agg[venue].count += 1;

      const svc = p['Service']?.number;
      const atm = p['Atmosphere']?.number;
      // Accept both Experience (new) and Value (legacy) - prefer Experience
      const exp = p['Experience']?.number || p['Value']?.number;
      if (svc) { agg[venue].svcTotal += svc; agg[venue].svcCount += 1; }
      if (atm) { agg[venue].atmTotal += atm; agg[venue].atmCount += 1; }
      if (exp) { agg[venue].expTotal += exp; agg[venue].expCount += 1; }

      // Collect comments (Quote = firstName, Note = comment body)
      const note = p['Note']?.rich_text?.[0]?.text?.content?.trim() || '';
      if (note) {
        const firstName = p['Quote']?.rich_text?.[0]?.text?.content?.trim() || '';
        const wineTried = p['WineTried']?.rich_text?.[0]?.text?.content?.trim() || '';
        const date = p['Date']?.date?.start || '';
        if (!commentsByVenue[venue]) commentsByVenue[venue] = [];
        commentsByVenue[venue].push({ firstName, note, wineTried, date });
      }
    }

    const ratings = {};
    const rnd = (t, c) => c > 0 ? Math.round((t / c) * 10) / 10 : null;
    for (const [venue, d] of Object.entries(agg)) {
      ratings[venue] = {
        avg:             rnd(d.total, d.count),
        count:           d.count,
        service_avg:     rnd(d.svcTotal, d.svcCount),
        atmosphere_avg:  rnd(d.atmTotal, d.atmCount),
        experience_avg:  rnd(d.expTotal, d.expCount),
        // Most recent 3 comments (results already sorted descending by date)
        comments:        (commentsByVenue[venue] || []).slice(0, 3),
      };
    }

    // ── Wine-level aggregation ──────────────────────────────────────────────
    // New format: WineTried stores "name:rating · name:rating"
    // Legacy format: WineTried stores "name · name" (no per-wine rating)
    let wineRankings = [];
    if (WINES_DB_ID && allResults.length > 0) {
      try {
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

          // Aggregate per-wine: count + average rating
          const wineStats = {}; // { id: { total, count } }
          for (const page of allResults) {
            const wineTried = page.properties['WineTried']?.rich_text?.[0]?.text?.content || '';
            const overallRating = page.properties['Rating']?.number;
            if (!wineTried) continue;

            const parts = wineTried.split('·').map(s => s.trim());
            for (const part of parts) {
              // New format: "Wine Name:4" - extract name and per-wine rating
              const colonIdx = part.lastIndexOf(':');
              let partName, partRating;
              if (colonIdx > 0) {
                const maybeRating = Number(part.slice(colonIdx + 1));
                if (maybeRating >= 1 && maybeRating <= 5) {
                  partName = part.slice(0, colonIdx).trim().toLowerCase();
                  partRating = maybeRating;
                } else {
                  partName = part.toLowerCase();
                  partRating = overallRating; // legacy fallback
                }
              } else {
                partName = part.toLowerCase();
                partRating = overallRating; // legacy: use overall rating
              }

              if (!partName) continue;

              for (const wine of registry) {
                const nameLC = wine.name.toLowerCase();
                if (partName.includes(nameLC) || nameLC.includes(partName)) {
                  if (!wineStats[wine.id]) wineStats[wine.id] = { total: 0, count: 0 };
                  wineStats[wine.id].total += partRating;
                  wineStats[wine.id].count += 1;
                  break; // one match per part
                }
              }
            }
          }

          wineRankings = registry
            .map(w => {
              const s = wineStats[w.id];
              return {
                ...w,
                count: s ? s.count : 0,
                avg: s ? Math.round((s.total / s.count) * 10) / 10 : null,
              };
            })
            .filter(w => w.count > 0)
            .sort((a, b) => {
              // Primary sort: average rating descending. Tiebreak: count descending.
              if (b.avg !== a.avg) return b.avg - a.avg;
              return b.count - a.count;
            });
        }
      } catch (err) {
        console.error('Wine rankings aggregation error:', err.message);
        // non-fatal - return empty rankings
      }
    }

    return res.status(200).json({ ratings, wineRankings });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
