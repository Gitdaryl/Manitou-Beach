// Nightly cron — clear expired event promotions.
// Resets Promo Type, Hero Feature, and Promo End on events past their promo window.

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.NOTION_TOKEN_EVENTS;
  const dbId = process.env.NOTION_DB_EVENTS;
  if (!token || !dbId) {
    return res.status(500).json({ error: 'Missing Notion config' });
  }

  const today = new Date().toISOString().split('T')[0];
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    // Find events with a Promo Type set and Promo End in the past
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Promo Type', select: { is_not_empty: true } },
            { property: 'Promo End', date: { before: today } },
          ],
        },
      }),
    });

    if (!queryRes.ok) {
      const err = await queryRes.text();
      console.error('Cron promo expiry query failed:', err);
      return res.status(500).json({ error: 'Query failed' });
    }

    const data = await queryRes.json();
    const expired = data.results || [];

    let cleared = 0;
    for (const page of expired) {
      const name = page.properties['Event Name']?.title?.[0]?.text?.content || page.id;
      await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: {
            'Promo Type': { select: null },
            'Hero Feature': { checkbox: false },
            'Promo End': { date: null },
            'Promo Start': { date: null },
            'Promo Pages': { multi_select: [] },
          },
        }),
      });
      console.log(`Expired promo cleared: ${name}`);
      cleared++;
    }

    return res.status(200).json({ cleared, checked: expired.length });
  } catch (err) {
    console.error('Cron expire-promotions error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
