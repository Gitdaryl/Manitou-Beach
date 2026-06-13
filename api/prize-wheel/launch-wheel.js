// POST /api/prize-wheel/launch-wheel
// Admin-only. Resets all active vendor Trial Start to today and Trial End to today+60.
// Call this once when the 6th vendor activates to start all trials from the same date.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const headers = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_PRIZE_WHEEL_SPONSORS}/query`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: { property: 'Active', checkbox: { equals: true } },
        }),
      }
    );

    if (!queryRes.ok) throw new Error('Failed to query sponsors');
    const data = await queryRes.json();
    const vendors = data.results || [];

    if (vendors.length < 6) {
      return res.status(400).json({
        error: `Only ${vendors.length} active vendor${vendors.length === 1 ? '' : 's'}. Need at least 6 to launch.`,
        count: vendors.length,
      });
    }

    const trialStart = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    // Update all active vendors in parallel
    await Promise.all(
      vendors.map(vendor =>
        fetch(`https://api.notion.com/v1/pages/${vendor.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            properties: {
              'Trial Start': { date: { start: trialStart } },
              'Trial End':   { date: { start: trialEnd } },
              'Plan Type':   { select: { name: 'trial' } },
            },
          }),
        })
      )
    );

    const names = vendors.map(v => v.properties['Business Name']?.title?.[0]?.text?.content || 'Unknown');

    return res.status(200).json({
      ok: true,
      count: vendors.length,
      trialStart,
      trialEnd,
      vendors: names,
    });
  } catch (err) {
    console.error('Launch wheel error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
