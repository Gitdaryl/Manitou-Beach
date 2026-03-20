// Review URL fallback — replace with Blackbird's actual Google Place ID when confirmed
const BLACKBIRD_GOOGLE_REVIEW = 'https://search.google.com/local/writereview?placeid=ChIJblackbirdplaceid';

export default async function handler(req, res) {
  // GET: Barista views the status of the code
  if (req.method === 'GET') {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: 'Code required' });

    try {
      const searchRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_PROMO_CLAIMS}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: { property: 'Promo Code', title: { equals: code } }
        })
      });

      if (!searchRes.ok) return res.status(200).json({ valid: true, status: 'Unclaimed', mockMode: true });

      const data = await searchRes.json();
      if (!data.results || data.results.length === 0) {
        return res.status(404).json({ error: 'Code not found' });
      }

      const record = data.results[0];
      const status = record.properties['Status']?.select?.name || 'Unclaimed';
      const subscriberName = record.properties['Name']?.rich_text?.[0]?.text?.content || '';
      // Review URL can be overridden per vendor contract in the future via a 'Review URL' property
      const reviewUrl = record.properties['Review URL']?.url || BLACKBIRD_GOOGLE_REVIEW;

      return res.status(200).json({
        id: record.id,
        code,
        status,
        valid: status === 'Unclaimed',
        subscriberName,
        reviewUrl,
      });
    } catch (err) {
      return res.status(200).json({ valid: true, status: 'Unclaimed', mockMode: true });
    }
  }

  // POST: Barista hits "Redeem"
  if (req.method === 'POST') {
    const { id, code } = req.body;

    // Mockup mode fallback
    if (!id && code === 'LAKEBOUND') {
      return res.status(200).json({ success: true, mockMode: true });
    }

    if (!id) return res.status(400).json({ error: 'Record ID required' });

    try {
      const updateRes = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: {
            'Status': { select: { name: 'Redeemed' } },
            'Redeemed At': { date: { start: new Date().toISOString() } },
          }
        })
      });

      if (!updateRes.ok) throw new Error('Failed to update Notion');

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to redeem' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
