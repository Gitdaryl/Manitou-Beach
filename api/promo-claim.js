export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name = '', offer = 'Blackbird Cookie' } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    // 1. Check if email already claimed this offer
    const searchRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_PROMO_CLAIMS}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Email', email: { equals: email } },
            { property: 'Offer', select: { equals: offer } }
          ]
        }
      })
    });

    if (!searchRes.ok) {
        console.warn("Promo DB might not be setup yet.");
        // Fallback for local testing if DB missing
        return res.status(200).json({ code: 'LAKEBOUND', status: 'Unclaimed', isFallback: true }); 
    }

    const searchData = await searchRes.json();
    
    // If they already have a code, return it.
    if (searchData.results && searchData.results.length > 0) {
      const existingRecord = searchData.results[0];
      const code = existingRecord.properties['Promo Code']?.title?.[0]?.text?.content;
      const status = existingRecord.properties['Status']?.select?.name;
      const savedName = existingRecord.properties['Name']?.rich_text?.[0]?.text?.content || '';
      return res.status(200).json({ code, status, name: savedName });
    }

    // 2. Generate new unique code (e.g. BB-8X9P2R)
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newCode = `BB-${randomStr}`;

    // 3. Save to Notion
    const createRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_PROMO_CLAIMS },
        properties: {
          'Promo Code': { title: [{ text: { content: newCode } }] },
          'Email': { email: email },
          'Name': { rich_text: [{ text: { content: name.trim() } }] },
          'Offer': { select: { name: offer } },
          'Status': { select: { name: 'Unclaimed' } }
        }
      })
    });

    if (!createRes.ok) throw new Error('Failed to create in Notion');

    return res.status(200).json({ code: newCode, status: 'Unclaimed', name: name.trim() });

  } catch (err) {
    console.error('Promo claim error:', err);
    // Temporary fallback to let UI work before they create the DB
    return res.status(200).json({ code: 'LAKEBOUND', status: 'Unclaimed', isFallback: true }); 
  }
}
