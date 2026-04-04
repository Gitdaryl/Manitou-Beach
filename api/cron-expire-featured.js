// Nightly cron - downgrade expired one-time featured listings back to "Listed Free"
// and clear the Featured Expires date so they don't get re-processed.

export default async function handler(req, res) {
  // Vercel cron sends GET requests with authorization header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_BUSINESS;
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
    // Find featured listings with an expiration date in the past
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Status', status: { equals: 'Listed Featured' } },
            { property: 'Featured Expires', date: { before: today } },
          ],
        },
      }),
    });

    if (!queryRes.ok) {
      const err = await queryRes.text();
      console.error('Cron query failed:', err);
      return res.status(500).json({ error: 'Query failed' });
    }

    const data = await queryRes.json();
    const expired = data.results || [];

    let downgraded = 0;
    for (const page of expired) {
      const name = page.properties['Name']?.title?.[0]?.text?.content || page.id;
      await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: {
            'Status': { status: { name: 'Listed Free' } },
            'Featured Expires': { date: null },
          },
        }),
      });
      console.log(`Expired featured listing downgraded: ${name}`);
      downgraded++;
    }

    return res.status(200).json({ downgraded, checked: expired.length });
  } catch (err) {
    console.error('Cron expire-featured error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
