// Village businesses API - fetches businesses with Village=true from Notion
const DB_ID = process.env.NOTION_DB_BUSINESS;
const TOKEN = process.env.NOTION_TOKEN_BUSINESS;

function txt(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map(t => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
  return '';
}

function normalizeUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
}

function mapBusiness(page) {
  const p = page.properties;
  return {
    id: page.id,
    name: txt(p['Name']),
    category: p['Category']?.select?.name || 'Other',
    description: (txt(p['Description']) || '').trim(),
    address: (txt(p['Address']) || '').trim() || null,
    phone: p['Phone']?.phone_number?.trim() || null,
    website: normalizeUrl(p['URL']?.url || null),
    logo: p['Logo URL']?.url || null,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Village', checkbox: { equals: true } },
            { property: 'Hidden', checkbox: { equals: false } },
            { property: 'Status', status: { does_not_equal: 'New' } },
          ],
        },
        sorts: [{ property: 'Name', direction: 'ascending' }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Notion query failed:', err);
      return res.status(502).json({ error: 'Failed to fetch village businesses' });
    }

    const data = await response.json();
    const businesses = data.results.map(mapBusiness).filter(b => b.name);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(businesses);
  } catch (err) {
    console.error('Village businesses error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
