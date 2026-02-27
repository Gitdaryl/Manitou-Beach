export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            or: [
              { property: 'Status', status: { equals: 'Listed Free' } },
              { property: 'Status', status: { equals: 'Listed Enhanced' } },
              { property: 'Status', status: { equals: 'Listed Featured' } },
              { property: 'Status', status: { equals: 'Listed Premium' } },
            ],
          },
          sorts: [{ property: 'Name', direction: 'ascending' }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Notion query failed:', await response.text());
      return res.status(200).json({ free: [], enhanced: [], featured: [], premium: [] });
    }

    const data = await response.json();
    const free = [];
    const enhanced = [];
    const featured = [];
    const premium = [];

    data.results.forEach(page => {
      const p = page.properties;
      const status = p['Status']?.status?.name || '';
      const business = {
        id: `notion-${page.id}`,
        name: p['Name']?.title?.[0]?.text?.content || '',
        category: p['Category']?.select?.name || 'Other',
        phone: p['Phone']?.phone_number || '',
        website: p['URL']?.url || '',
        email: p['Email']?.email || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        address: p['Address']?.rich_text?.[0]?.text?.content || '',
        logo: p['Logo URL']?.url || null,
      };

      if (!business.name) return;

      if (status === 'Listed Premium') {
        premium.push({ ...business, tier: 'premium' });
      } else if (status === 'Listed Featured') {
        featured.push({ ...business, tier: 'featured' });
      } else if (status === 'Listed Enhanced') {
        enhanced.push({ ...business, tier: 'enhanced' });
      } else {
        free.push({ ...business, tier: 'free' });
      }
    });

    return res.status(200).json({ free, enhanced, featured, premium });
  } catch (err) {
    console.error('Businesses API error:', err.message);
    return res.status(200).json({ free: [], enhanced: [], featured: [], premium: [] });
  }
}
