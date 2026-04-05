// GET /api/lllc-sponsors
// Returns active LLLC sponsors from Notion, grouped by tier.
// Michele activates sponsors by checking the "Active" checkbox in Notion.
// Falls back gracefully if Notion is unavailable — page uses hardcoded defaults.

const TIER_ORDER = ['Platinum Sponsor', 'Gold Sponsor', 'Silver Sponsor', 'Bronze Sponsor', 'Friends & Family'];
const TIER_KEYS  = ['platinum', 'gold', 'silver', 'bronze', 'friends'];

function getText(p, prop) { return p[prop]?.rich_text?.[0]?.plain_text || null; }
function getTitle(p, prop) { return p[prop]?.title?.[0]?.plain_text || null; }
function getSelect(p, prop) { return p[prop]?.select?.name || null; }
function getUrl(p, prop) { return p[prop]?.url || null; }
function getEmail(p, prop) { return p[prop]?.email || null; }
function getBool(p, prop) { return p[prop]?.checkbox ?? false; }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const dbId = process.env.NOTION_DB_LLLC_SPONSORS;
  const token = process.env.NOTION_TOKEN_EVENTS;

  if (!dbId || !token) {
    return res.status(200).json({ sponsors: null }); // page falls back to hardcoded
  }

  try {
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: { property: 'Active', checkbox: { equals: true } },
        sorts: [{ property: 'Name', direction: 'ascending' }],
        page_size: 100,
      }),
    });

    if (!queryRes.ok) {
      console.error('Notion query failed:', await queryRes.text());
      return res.status(200).json({ sponsors: null });
    }

    const data = await queryRes.json();
    if (!data.results?.length) {
      return res.status(200).json({ sponsors: null }); // no active sponsors yet — use hardcoded
    }

    // Group by tier
    const grouped = { platinum: [], gold: [], silver: [], bronze: [], friends: [] };

    for (const page of data.results) {
      const p = page.properties;
      const tier = getSelect(p, 'Tier');
      const tierIdx = TIER_ORDER.indexOf(tier);
      if (tierIdx === -1) continue;

      const key = TIER_KEYS[tierIdx];
      grouped[key].push({
        name:    getTitle(p, 'Name'),
        logo:    getUrl(p, 'Logo URL'),
        url:     getUrl(p, 'Website URL'),
      });
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json({ sponsors: grouped });
  } catch (err) {
    console.error('lllc-sponsors error:', err);
    return res.status(200).json({ sponsors: null }); // graceful fallback
  }
}
