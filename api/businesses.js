// Ensure URLs entered in Notion without a protocol prefix still work as links
function normalizeUrl(url) {
  if (!url || !url.trim()) return url;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

// Geocode an address via Nominatim (free, no key) and write lat/lng back to the Notion page
async function geocodeAndStore(pageId, address) {
  const q = encodeURIComponent(address + ', Michigan, USA');
  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
    headers: { 'User-Agent': 'ManitouBeach/1.0 (site@manitoubeach.com)' },
  });
  if (!geoRes.ok) return;
  const results = await geoRes.json();
  if (!results.length) return;
  const lat = parseFloat(results[0].lat);
  const lng = parseFloat(results[0].lon);
  if (isNaN(lat) || isNaN(lng)) return;
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ properties: { 'Lat': { number: lat }, 'Lng': { number: lng } } }),
  });
}

export default async function handler(req, res) {
  // POST — submit a new business listing
  if (req.method === 'POST') {
    const { name, category, phone, website, email, description, address, newsletter, tier, duration, logoUrl, _hp } = req.body;

    // Honeypot — bots fill hidden fields, humans don't
    if (_hp) return res.status(200).json({ success: true });

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

      // Auto-geocode address and write lat/lng back to Notion (fire-and-forget, never blocks submission)
      if (address && address.trim()) {
        const newPage = await response.json();
        geocodeAndStore(newPage.id, address).catch(() => {});
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
        categories: p['Categories']?.multi_select?.length
          ? p['Categories'].multi_select.map(s => s.name)
          : [p['Category']?.select?.name || 'Other'],
        phone: p['Phone']?.phone_number || '',
        website: normalizeUrl(p['URL']?.url || ''),
        email: p['Email']?.email || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        address: p['Address']?.rich_text?.[0]?.text?.content || '',
        logo: normalizeUrl(p['Logo URL']?.url || null),
        lat: p['Lat']?.number ?? null,
        lng: p['Lng']?.number ?? null,
        emergency: p['Emergency']?.checkbox ?? false,
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
