// GET /api/activity-summary
// Admin-only. Returns a 7-day activity snapshot across all platform DBs.

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const bizHeaders = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  const eventsHeaders = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  const pastWeek = {
    filter: { timestamp: 'created_time', created_time: { past_week: {} } },
    page_size: 50,
  };

  const queryDB = async (dbId, headers, extra = {}) => {
    if (!dbId) return [];
    try {
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...pastWeek, ...extra }),
      });
      if (!r.ok) return [];
      const d = await r.json();
      return d.results || [];
    } catch {
      return [];
    }
  };

  const [eventsPages, bizPages, truckPages, lovesPages, wheelPages, claimsPages] = await Promise.all([
    queryDB(process.env.NOTION_DB_EVENTS, eventsHeaders),
    queryDB(process.env.NOTION_DB_BUSINESS, bizHeaders),
    queryDB(process.env.NOTION_DB_FOOD_TRUCKS, bizHeaders),
    queryDB(process.env.NOTION_DB_FOOD_TRUCK_LOVES, bizHeaders),
    queryDB(process.env.NOTION_DB_PRIZE_WHEEL_SPONSORS, bizHeaders),
    queryDB(process.env.NOTION_DB_PRIZE_WHEEL_CLAIMS, bizHeaders),
  ]);

  const events = eventsPages.map(p => ({
    name: p.properties['Event Name']?.title?.[0]?.text?.content || 'Untitled event',
    createdAt: p.created_time,
  }));

  const businesses = bizPages.map(p => ({
    name: p.properties['Name']?.title?.[0]?.text?.content || 'Unknown',
    category: p.properties['Category']?.select?.name || '',
    createdAt: p.created_time,
  }));

  const foodTrucks = truckPages.map(p => ({
    name: p.properties['Name']?.title?.[0]?.text?.content || 'Unknown truck',
    createdAt: p.created_time,
  }));

  // Group food truck loves by truck
  const pinCounts = {};
  for (const p of lovesPages) {
    const slug = p.properties['Truck']?.select?.name
      || p.properties['TruckSlug']?.rich_text?.[0]?.text?.content
      || '';
    if (slug) pinCounts[slug] = (pinCounts[slug] || 0) + 1;
  }
  const truckPins = Object.entries(pinCounts)
    .map(([slug, count]) => ({
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const wheelVendors = wheelPages.map(p => ({
    name: p.properties['Business Name']?.title?.[0]?.text?.content || 'Unknown',
    approved: p.properties['Active']?.checkbox ?? false,
    createdAt: p.created_time,
  }));

  const totalClaims = claimsPages.length;
  const redeemed = claimsPages.filter(p => !!p.properties['Redeemed At']?.date?.start).length;

  const total = events.length + businesses.length + foodTrucks.length
    + lovesPages.length + wheelVendors.length + totalClaims;

  return res.status(200).json({
    window: '7 days',
    total,
    events,
    businesses,
    foodTrucks,
    truckPins,
    wheelVendors,
    wheelClaims: { issued: totalClaims, redeemed },
  });
}
