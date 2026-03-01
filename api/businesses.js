export default async function handler(req, res) {
  // POST — submit a new business listing
  if (req.method === 'POST') {
    const { name, category, phone, website, email, description, address, newsletter, tier, duration, logoUrl } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    let normalizedUrl = null;
    if (website && website.trim()) {
      let url = website.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      normalizedUrl = url;
    }

    let normalizedLogoUrl = null;
    if (logoUrl && logoUrl.trim()) {
      let url = logoUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      normalizedLogoUrl = url;
    }

    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DB_BUSINESS },
          properties: {
            'Name': { title: [{ text: { content: name } }] },
            'Category': { select: { name: category || 'Other' } },
            'Phone': { phone_number: phone || null },
            'URL': { url: normalizedUrl },
            'Email': { email: email || null },
            'Description': { rich_text: [{ text: { content: description || '' } }] },
            'Address': { rich_text: [{ text: { content: address || '' } }] },
            ...(normalizedLogoUrl && { 'Logo URL': { url: normalizedLogoUrl } }),
            ...(tier && { 'Requested Tier': { select: { name: tier } } }),
            ...(duration && { 'Requested Duration': { number: parseInt(duration, 10) } }),
            ...((newsletter === true || newsletter === 'true') && { 'Newsletter': { checkbox: true } }),
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Notion error:', err);
        return res.status(500).json({ error: 'Failed to save submission', detail: err?.message || JSON.stringify(err) });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Server error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // GET — fetch listed businesses
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
          ...(req.query.all !== 'true' && {
            filter: {
              or: [
                { property: 'Status', status: { equals: 'Listed Free' } },
                { property: 'Status', status: { equals: 'Listed Enhanced' } },
                { property: 'Status', status: { equals: 'Listed Featured' } },
                { property: 'Status', status: { equals: 'Listed Premium' } },
              ],
            },
          }),
          sorts: [{ property: 'Name', direction: 'ascending' }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Notion query failed:', await response.text());
      return res.status(200).json({ free: [], enhanced: [], featured: [], premium: [] });
    }

    const data = await response.json();
    const free = [], enhanced = [], featured = [], premium = [];

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
      if (status === 'Listed Premium') premium.push({ ...business, tier: 'premium' });
      else if (status === 'Listed Featured') featured.push({ ...business, tier: 'featured' });
      else if (status === 'Listed Enhanced') enhanced.push({ ...business, tier: 'enhanced' });
      else free.push({ ...business, tier: 'free' });
    });

    return res.status(200).json({ free, enhanced, featured, premium });
  } catch (err) {
    console.error('Businesses API error:', err.message);
    return res.status(200).json({ free: [], enhanced: [], featured: [], premium: [] });
  }
}
