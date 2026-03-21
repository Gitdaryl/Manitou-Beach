// GET /api/page-sponsors?page=nightlife
// Returns the active sponsor for a given page from Notion.
// PageSponsorBanner calls this to auto-activate banners after payment.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const pageId = req.query.page;
  const all    = req.query.all === 'true';
  if (!pageId && !all) return res.status(400).json({ error: 'Missing page param' });

  const token = process.env.NOTION_TOKEN_PAGE_SPONSORS || process.env.NOTION_TOKEN_BUSINESS;
  const dbId  = process.env.NOTION_DB_PAGE_SPONSORS;
  if (!token || !dbId) return res.status(200).json(all ? { taken: [] } : { sponsor: null });

  const get = (p, prop, type) => {
    const v = p[prop];
    if (!v) return null;
    if (type === 'title')  return v.title?.[0]?.plain_text || null;
    if (type === 'text')   return v.rich_text?.[0]?.plain_text || null;
    if (type === 'select') return v.select?.name || null;
    if (type === 'email')  return v.email || null;
    if (type === 'url')    return v.url || null;
    if (type === 'date')   return v.date?.start || null;
    return null;
  };

  try {
    const today = new Date().toISOString().split('T')[0];

    const filter = all
      ? { and: [{ property: 'Status', select: { equals: 'active' } }, { property: 'Expiry Date', date: { on_or_after: today } }] }
      : { and: [{ property: 'Page ID', select: { equals: pageId } }, { property: 'Status', select: { equals: 'active' } }, { property: 'Expiry Date', date: { on_or_after: today } }] };

    const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ filter, sorts: [{ property: 'Start Date', direction: 'descending' }], page_size: all ? 50 : 1 }),
    });

    const data = await queryRes.json();
    if (!data.results || data.results.length === 0) {
      return res.status(200).json(all ? { taken: [] } : { sponsor: null });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

    if (all) {
      const taken = data.results.map(r => ({
        pageId:    get(r.properties, 'Page ID',       'select'),
        name:      get(r.properties, 'Business Name', 'title'),
        logo:      get(r.properties, 'Logo URL',      'url'),
        tagline:   get(r.properties, 'Tagline',       'text'),
        url:       get(r.properties, 'Website URL',   'url'),
        expiresAt: get(r.properties, 'Expiry Date',   'date'),
      })).filter(s => s.pageId && s.name);
      return res.status(200).json({ taken });
    }

    const p = data.results[0].properties;
    const sponsor = {
      name:      get(p, 'Business Name', 'title'),
      logo:      get(p, 'Logo URL',      'url'),
      tagline:   get(p, 'Tagline',       'text'),
      url:       get(p, 'Website URL',   'url'),
      expiresAt: get(p, 'Expiry Date',   'date'),
    };

    if (!sponsor.name) return res.status(200).json({ sponsor: null });
    return res.status(200).json({ sponsor });
  } catch (err) {
    console.error('page-sponsors error:', err.message);
    return res.status(200).json(all ? { taken: [] } : { sponsor: null });
  }
}
