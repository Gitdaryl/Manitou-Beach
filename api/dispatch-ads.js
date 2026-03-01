// Dispatch Ad Slots — serves active ads from NOTION_DB_DISPATCH_PROMOTIONS
// Slot values: leaderboard | mid-article | footer-strip | listing-banner
// Pages values: all | dispatch-listing | dispatch-article | home

function richText(arr) {
  if (!arr || !arr.length) return '';
  return arr.map(t => t.plain_text).join('');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');

  const page = req.query?.page || 'all'; // dispatch-listing | dispatch-article | home

  try {
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_DISPATCH_PROMOTIONS}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
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

    if (!response.ok) {
      return res.status(200).json({ ads: {}, slots: [] });
    }

    const data = await response.json();
    const now = new Date();

    const ads = data.results
      .filter(p => {
        // Respect Start Date if set
        const start = p.properties['Start Date']?.date?.start;
        if (start && new Date(start + 'T00:00:00') > now) return false;
        // Page filter — show if pages = 'all' or includes the requested page
        const pages = (p.properties['Pages']?.multi_select || []).map(s => s.name);
        if (!pages.length || pages.includes('all') || pages.includes(page)) return true;
        return false;
      })
      .map(p => {
        const props = p.properties;
        return {
          id: p.id,
          name: richText(props['Business Name']?.title),
          slot: props['Placement']?.select?.name || 'leaderboard',
          imageUrl: props['Image URL']?.url || null,
          linkUrl: props['Link URL']?.url || null,
          altText: richText(props['Alt Text']?.rich_text) || richText(props['Business Name']?.title),
          offerText: richText(props['Offer Text']?.rich_text) || null,
          couponCode: richText(props['Coupon Code']?.rich_text) || null,
          animation: props['Animation']?.select?.name || 'none',
          tier: props['Tier']?.select?.name || 'Local',
          type: props['Type']?.select?.name || 'image',
        };
      })
      .filter(a => a.name);

    // Group by slot — each slot returns an array (multiple ads can rotate)
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
