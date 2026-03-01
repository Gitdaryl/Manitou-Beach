// Dispatch Ad Slots — serves active ads from NOTION_DB_DISPATCH_PROMOTIONS
// Public: GET ?page=dispatch-listing|dispatch-article|home  → active ads grouped by slot
// Admin:  GET ?admin=true (X-Admin-Token required)          → all promos (active + inactive)

function richText(arr) {
  if (!arr || !arr.length) return '';
  return arr.map(t => t.plain_text).join('');
}

function mapPromo(p) {
  const props = p.properties;
  const expiryRaw = props['Expiry Date']?.date?.start || null;
  return {
    id: p.id,
    name: richText(props['Business Name']?.title),
    slot: props['Placement']?.select?.name || 'leaderboard',
    imageUrl: props['Image URL']?.url || null,
    linkUrl: props['Link URL']?.url || null,
    altText: richText(props['Alt Text']?.rich_text) || richText(props['Business Name']?.title),
    offerText: richText(props['Offer Text']?.rich_text) || null,
    couponCode: richText(props['Coupon Code']?.rich_text) || null,
    claimSlug: richText(props['Claim Slug']?.rich_text) || null,
    animation: props['Animation']?.select?.name || 'none',
    tier: props['Tier']?.select?.name || 'Local',
    type: props['Type']?.select?.name || 'image',
    active: props['Active']?.checkbox || false,
    expiry: expiryRaw,
    notionUrl: `https://notion.so/${p.id.replace(/-/g, '')}`,
  };
}

export default async function handler(req, res) {
  const HEADERS = {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  // ── Admin view — all promos regardless of active/date ──────────
  const isAdmin = req.query?.admin === 'true';
  if (isAdmin) {
    const token = req.headers['x-admin-token'];
    if (!token || token !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DB_DISPATCH_PROMOTIONS}/query`,
        {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({
            sorts: [{ timestamp: 'created_time', direction: 'descending' }],
            page_size: 50,
          }),
        }
      );
      if (!response.ok) return res.status(200).json({ promos: [] });
      const data = await response.json();
      const promos = data.results.map(mapPromo).filter(p => p.name);
      return res.status(200).json({ promos });
    } catch (err) {
      return res.status(200).json({ promos: [] });
    }
  }

  // ── Public view — active ads for blog slots ─────────────────────
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');
  const page = req.query?.page || 'all';

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_DISPATCH_PROMOTIONS}/query`,
      {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Active', checkbox: { equals: true } },
              {
                or: [
                  { property: 'Expiry Date', date: { is_empty: true } },
                  { property: 'Expiry Date', date: { on_or_after: today } },
                ],
              },
            ],
          },
          sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
          page_size: 50,
        }),
      }
    );

    if (!response.ok) return res.status(200).json({ slots: {} });

    const data = await response.json();
    const now = new Date();

    const ads = data.results
      .filter(p => {
        const start = p.properties['Start Date']?.date?.start;
        if (start && new Date(start + 'T00:00:00') > now) return false;
        const pages = (p.properties['Pages']?.multi_select || []).map(s => s.name);
        if (!pages.length || pages.includes('all') || pages.includes(page)) return true;
        return false;
      })
      .map(mapPromo)
      .filter(a => a.name);

    const slots = {};
    ads.forEach(ad => {
      if (!slots[ad.slot]) slots[ad.slot] = [];
      slots[ad.slot].push(ad);
    });

    return res.status(200).json({ slots });
  } catch (err) {
    console.error('dispatch-ads error:', err.message);
    return res.status(200).json({ slots: {} });
  }
}
