// /api/food-truck-loves.js
// GET  — returns aggregated love counts per truck slug
// POST — submit a love for a specific item on a truck
//
// Pattern follows api/winery-ratings.js

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req, res) {
  try {
    let allResults = [];
    let cursor = undefined;

    do {
      const body = {
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };

      const response = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCK_LOVES}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        console.error('Food Truck Loves GET query failed:', await response.text());
        return res.status(200).json({ loves: {} });
      }

      const data = await response.json();
      allResults = allResults.concat(data.results);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    // Aggregate: { "truck-slug": { items: { "ribs": 23, "brisket": 12 }, total: 35 } }
    const loves = {};
    for (const page of allResults) {
      const p = page.properties;
      const slug = p['TruckSlug']?.rich_text?.[0]?.text?.content || '';
      const item = p['Item']?.rich_text?.[0]?.text?.content || '';
      if (!slug || !item) continue;

      if (!loves[slug]) loves[slug] = { items: {}, total: 0 };
      loves[slug].items[item] = (loves[slug].items[item] || 0) + 1;
      loves[slug].total += 1;
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60');
    return res.status(200).json({ loves });
  } catch (err) {
    console.error('Food Truck Loves GET error:', err.message);
    return res.status(200).json({ loves: {} });
  }
}

async function handlePost(req, res) {
  try {
    const { slug, item, sessionId } = req.body || {};

    if (!slug?.trim() || !item?.trim()) {
      return res.status(400).json({ error: 'slug and item are required' });
    }

    const normalizedItem = item.trim().toLowerCase().slice(0, 50);
    const normalizedSlug = slug.trim();
    const sid = (sessionId || '').trim();

    // Dedupe check: one love per item per session
    if (sid) {
      const dedupeRes = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCK_LOVES}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            filter: {
              and: [
                { property: 'TruckSlug', rich_text: { equals: normalizedSlug } },
                { property: 'Item',      rich_text: { equals: normalizedItem } },
                { property: 'SessionID', rich_text: { equals: sid } },
              ],
            },
            page_size: 1,
          }),
        }
      );

      if (dedupeRes.ok) {
        const dedupeData = await dedupeRes.json();
        if (dedupeData.results?.length) {
          return res.status(200).json({ ok: true, already: true });
        }
      }
    }

    // Get truck name from FOOD_TRUCKS DB for the Name title field
    const truckName = normalizedSlug; // fallback; slug is readable enough

    const dateStr = new Date().toISOString().slice(0, 10);
    const titleText = `${truckName} — ${normalizedItem} — ${dateStr}`;

    const createRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_FOOD_TRUCK_LOVES },
        properties: {
          'Name':      { title: [{ text: { content: titleText } }] },
          'Truck':     { select: { name: normalizedSlug } },
          'TruckSlug': { rich_text: [{ text: { content: normalizedSlug } }] },
          'Item':      { rich_text: [{ text: { content: normalizedItem } }] },
          'SessionID': { rich_text: [{ text: { content: sid } }] },
          'Date':      { date: { start: new Date().toISOString() } },
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error('Food Truck Loves POST create failed:', errText);
      return res.status(500).json({ error: 'Failed to save love', debug: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Food Truck Loves POST error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
