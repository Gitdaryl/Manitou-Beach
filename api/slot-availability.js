// /api/slot-availability.js
// GET - returns live Featured and Premium slot counts from Notion
// Used by BetaBusinessPage to show real-time slot availability

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const SLOT_CAPS = { featured: 3, premium: 1 };

async function countByStatus(dbId, status) {
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        page_size: 1,
        filter: { property: 'Status', status: { equals: status } },
      }),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total_results_estimate ?? (data.results?.length ?? 0);
  } catch {
    return 0;
  }
}

// Simple in-process cache - prevents hammering Notion on every page load
let cache = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dbId = process.env.NOTION_DB_BUSINESS;
  if (!dbId) {
    return res.status(500).json({ error: 'Missing Notion config' });
  }

  // Return cached result if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL_MS) {
    return res.status(200).json(cache);
  }

  const [featuredUsed, premiumUsed] = await Promise.all([
    countByStatus(dbId, 'Listed Featured'),
    countByStatus(dbId, 'Listed Premium'),
  ]);

  cache = {
    featured: { used: featuredUsed, cap: SLOT_CAPS.featured, available: Math.max(0, SLOT_CAPS.featured - featuredUsed) },
    premium:  { used: premiumUsed,  cap: SLOT_CAPS.premium,  available: Math.max(0, SLOT_CAPS.premium  - premiumUsed)  },
    enhanced: { available: null }, // unlimited
  };
  cacheTime = Date.now();

  return res.status(200).json(cache);
}
