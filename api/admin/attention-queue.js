// 2-minute in-memory cache
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 2 * 60 * 1000;

async function notionQuery(token, dbId, filter) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ filter, page_size: 100 }),
  });
  if (!res.ok) throw new Error(`Notion query failed for DB ${dbId}: ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return res.status(200).json(cache);
  }

  const tokenBiz = process.env.NOTION_TOKEN_BUSINESS;
  const tokenEvents = process.env.NOTION_TOKEN_EVENTS;
  const dbBiz = process.env.NOTION_DB_BUSINESS;
  const dbEvents = process.env.NOTION_DB_EVENTS;
  const dbRatings = process.env.NOTION_DB_WINERY_RATINGS;
  const dbTrucks = process.env.NOTION_DB_FOOD_TRUCKS;

  const results = {
    pendingEvents: 0,
    pendingRatings: 0,
    incompleteBiz: [],
    ghostTrucks: [],
    stalledOnboarding: 0,
  };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const queries = [];

  // 1. Pending events
  if (tokenEvents && dbEvents) {
    queries.push(
      notionQuery(tokenEvents, dbEvents, {
        or: [
          { property: 'Status', status: { equals: 'Pending' } },
          { property: 'Status', status: { equals: 'Review' } },
        ],
      })
        .then(data => { results.pendingEvents = data.results?.length || 0; })
        .catch(() => {}) // non-fatal — leave at 0
    );
  }

  // 2. Pending winery ratings
  if (tokenBiz && dbRatings) {
    queries.push(
      notionQuery(tokenBiz, dbRatings, {
        property: 'Status', status: { equals: 'Pending' },
      })
        .then(data => { results.pendingRatings = data.results?.length || 0; })
        .catch(() => {})
    );
  }

  // 3. Incomplete business listings (missing logo or description, status = active)
  if (tokenBiz && dbBiz) {
    queries.push(
      notionQuery(tokenBiz, dbBiz, {
        and: [
          {
            or: [
              { property: 'Status', status: { equals: 'Listed Free' } },
              { property: 'Status', status: { equals: 'Listed Enhanced' } },
              { property: 'Status', status: { equals: 'Listed Featured' } },
              { property: 'Status', status: { equals: 'Listed Premium' } },
            ],
          },
        ],
      })
        .then(data => {
          const incomplete = [];
          for (const page of data.results || []) {
            const name =
              page.properties['Name']?.title?.[0]?.text?.content ||
              page.properties['Business Name']?.title?.[0]?.text?.content ||
              'Unknown';
            const hasLogo = !!(page.properties['Logo URL']?.url);
            const hasDescription = !!(
              page.properties['Description']?.rich_text?.[0]?.text?.content?.trim()
            );
            const missing = [];
            if (!hasLogo) missing.push('logo');
            if (!hasDescription) missing.push('description');
            if (missing.length > 0) incomplete.push({ name, missing });
          }
          results.incompleteBiz = incomplete;
        })
        .catch(() => {})
    );
  }

  // 4. Ghost trucks — active but never checked in, or last check-in > 30 days ago
  if (tokenBiz && dbTrucks) {
    queries.push(
      notionQuery(tokenBiz, dbTrucks, {
        property: 'Status', status: { equals: 'Active' },
      })
        .then(data => {
          const ghosts = [];
          for (const page of data.results || []) {
            const name =
              page.properties['Truck Name']?.title?.[0]?.text?.content ||
              page.properties['Name']?.title?.[0]?.text?.content ||
              'Unknown';
            const lastCheckin = page.properties['Last Checkin']?.date?.start || null;
            const isGhost = !lastCheckin || lastCheckin < thirtyDaysAgo;
            if (isGhost) ghosts.push({ name, lastCheckIn: lastCheckin });
          }
          results.ghostTrucks = ghosts;
        })
        .catch(() => {})
    );
  }

  await Promise.all(queries);

  cache = results;
  cacheTime = Date.now();

  return res.status(200).json(results);
}
