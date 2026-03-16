function normalizeUrl(url) {
  if (!url || !url.trim()) return url;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

async function geocodeAndStore(pageId, address) {
  const q = encodeURIComponent(address + ', Michigan, USA');
  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
    headers: { 'User-Agent': 'ManitouBeach/1.0 (site@manitoubeach.com)' },
  });
  if (!geoRes.ok) return;
  const results = await geoRes.json();
  if (!results.length) return;
  if (results[0].class === 'natural' || results[0].type === 'water') return;
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
  // POST — submit a new stay listing
  if (req.method === 'POST') {
    const { name, stayType, phone, website, bookingUrl, description, address, beds, guests, amenities, logoUrl, _hp } = req.body;

    if (_hp) return res.status(200).json({ success: true });
    if (!name) return res.status(400).json({ error: 'Property name is required' });

    const amenityTags = (amenities || []).map(a => ({ name: a }));

    try {
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DB_STAYS },
          properties: {
            'Name': { title: [{ text: { content: name } }] },
            ...(stayType && { 'Stay Type': { select: { name: stayType } } }),
            'Phone': { phone_number: phone || null },
            'Website': { url: normalizeUrl(website) || null },
            ...(bookingUrl && { 'Booking URL': { url: normalizeUrl(bookingUrl) } }),
            'Description': { rich_text: [{ text: { content: description || '' } }] },
            'Address': { rich_text: [{ text: { content: address || '' } }] },
            ...(beds && { 'Beds': { number: parseInt(beds, 10) } }),
            ...(guests && { 'Guests': { number: parseInt(guests, 10) } }),
            ...(amenityTags.length && { 'Amenities': { multi_select: amenityTags } }),
            ...(logoUrl && { 'Logo URL': { url: normalizeUrl(logoUrl) } }),
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Notion error:', err);
        return res.status(500).json({ error: 'Failed to save submission' });
      }

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

  // GET — fetch listed stays
  res.setHeader('Cache-Control', 'no-store');
  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_STAYS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          sorts: [{ property: 'Name', direction: 'ascending' }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Notion query failed:', await response.text());
      return res.status(200).json({ stays: [] });
    }

    const data = await response.json();
    const today = new Date().toISOString().split('T')[0];
    const stays = [];

    data.results.forEach(page => {
      const p = page.properties;
      const featuredExpires = p['Featured Expires']?.date?.start || null;
      const status = p['Status']?.status?.name || '';

      // Skip entries still in "New" status (unapproved submissions)
      if (status === 'New') return;

      const expired = status === 'Listed Featured' && featuredExpires && featuredExpires < today;
      let tier = 'free';
      if (status === 'Listed Featured' && !expired) tier = 'featured';
      else if (status === 'Listed Enhanced') tier = 'enhanced';

      const stay = {
        id: `stay-${page.id}`,
        name: p['Name']?.title?.[0]?.text?.content || '',
        stayType: p['Stay Type']?.select?.name || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        address: p['Address']?.rich_text?.[0]?.text?.content || '',
        beds: p['Beds']?.number ?? null,
        guests: p['Guests']?.number ?? null,
        amenities: (p['Amenities']?.multi_select || []).map(s => s.name),
        bookingUrl: normalizeUrl(p['Booking URL']?.url || ''),
        website: normalizeUrl(p['Website']?.url || ''),
        phone: p['Phone']?.phone_number || '',
        photo: normalizeUrl(p['Photo URL']?.url || ''),
        logo: normalizeUrl(p['Logo URL']?.url || null),
        lat: p['Lat']?.number ?? null,
        lng: p['Lng']?.number ?? null,
        tier,
      };
      if (stay.name) stays.push(stay);
    });

    // Sort: featured first, then enhanced, then free
    const order = { featured: 0, enhanced: 1, free: 2 };
    stays.sort((a, b) => (order[a.tier] ?? 2) - (order[b.tier] ?? 2));

    return res.status(200).json({ stays });
  } catch (err) {
    console.error('Stays API error:', err.message);
    return res.status(200).json({ stays: [] });
  }
}
