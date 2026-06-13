// GET /api/prize-wheel/sponsors-admin
// Admin-only. Returns full vendor list with contact info, PIN, trial dates.

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_PRIZE_WHEEL_SPONSORS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: { property: 'Active', checkbox: { equals: true } },
          sorts: [{ property: 'Created', direction: 'ascending' }],
        }),
      }
    );

    if (!notionRes.ok) throw new Error('Notion query failed');
    const data = await notionRes.json();

    const vendors = (data.results || []).map(page => {
      const p = page.properties;
      return {
        id: page.id,
        name: p['Business Name']?.title?.[0]?.text?.content || '',
        offer: p['Deal Label']?.rich_text?.[0]?.text?.content || '',
        color: p['Deal Color']?.rich_text?.[0]?.text?.content || '',
        pin: p['Vendor PIN']?.rich_text?.[0]?.text?.content || '',
        trialStart: p['Trial Start']?.date?.start || null,
        trialEnd: p['Trial End']?.date?.start || null,
        planType: p['Plan Type']?.select?.name || 'trial',
        contactName: p['Contact Name']?.rich_text?.[0]?.text?.content || '',
        contactEmail: p['Contact Email']?.email || '',
      };
    });

    return res.status(200).json({ count: vendors.length, vendors });
  } catch (err) {
    console.error('sponsors-admin error:', err.message);
    return res.status(500).json({ error: 'Failed to load vendors' });
  }
}
