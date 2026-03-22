// Notion category values that already have pills in DISCOVER_CATS
const KNOWN_NOTION_KEYS = new Set([
  'Food & Drink',
  'Stays & Rentals',
  'Breweries & Wineries',
  'Boating & Water',
  'Events & Venues',
  'Shopping & Gifts',
  'Home Services',
]);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'no-store');

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            or: [
              { property: 'Status', status: { equals: 'Listed Free' } },
              { property: 'Status', status: { equals: 'Listed Enhanced' } },
              { property: 'Status', status: { equals: 'Listed Featured' } },
              { property: 'Status', status: { equals: 'Listed Premium' } },
            ],
          },
        }),
      }
    );

    if (!notionRes.ok) throw new Error('Notion query failed');
    const data = await notionRes.json();

    const seen = new Set();
    const unknownCategories = [];
    let hasOther = false;

    data.results.forEach(page => {
      const cat = page.properties['Category']?.select?.name || 'Other';
      if (cat === 'Other') { hasOther = true; return; }
      if (KNOWN_NOTION_KEYS.has(cat)) return;
      if (!seen.has(cat)) {
        seen.add(cat);
        unknownCategories.push(cat);
      }
    });

    return res.status(200).json({ unknownCategories, hasOther });
  } catch (err) {
    console.error('Categories API error:', err.message);
    return res.status(200).json({ unknownCategories: [], hasOther: false });
  }
}
