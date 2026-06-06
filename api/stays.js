function normalizeUrl(url) {
  if (!url || !url.trim()) return url;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

function parsePhotosJSON(field) {
  try {
    const raw = field?.rich_text?.[0]?.text?.content || '';
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch { return null; }
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
  // PATCH - update an existing listing
  if (req.method === 'PATCH') {
    const { pageId, name, stayType, phone, email, website, bookingUrl, description, address, beds, guests, amenities, photos, photoUrl, photoUrl2, photoUrl3, pricePerNight, minStay, checkIn, checkOut, houseRules } = req.body;
    if (!pageId) return res.status(400).json({ error: 'pageId is required' });

    const amenityTags = (amenities || []).map(a => ({ name: a }));
    const photoList = photos && Array.isArray(photos) ? photos.filter(Boolean) : null;

    try {
      const properties = {
        ...(name && { 'Name': { title: [{ text: { content: name } }] } }),
        ...(stayType && { 'Stay Type': { select: { name: stayType } } }),
        'Phone': { phone_number: phone || null },
        ...(email && { 'Email': { email } }),
        'Website': { url: normalizeUrl(website) || null },
        ...(bookingUrl !== undefined && { 'Booking URL': { url: normalizeUrl(bookingUrl) || null } }),
        'Description': { rich_text: [{ text: { content: description || '' } }] },
        'Address': { rich_text: [{ text: { content: address || '' } }] },
        ...(beds !== undefined && { 'Beds': { number: beds ? parseInt(beds, 10) : null } }),
        ...(guests !== undefined && { 'Guests': { number: guests ? parseInt(guests, 10) : null } }),
        'Amenities': { multi_select: amenityTags },
        ...(pricePerNight !== undefined && { 'Price Per Night': { rich_text: [{ text: { content: pricePerNight || '' } }] } }),
        ...(minStay !== undefined && { 'Min Stay': { number: minStay ? parseInt(minStay, 10) : null } }),
        ...(checkIn !== undefined && { 'Check In': { rich_text: [{ text: { content: checkIn || '' } }] } }),
        ...(checkOut !== undefined && { 'Check Out': { rich_text: [{ text: { content: checkOut || '' } }] } }),
        ...(houseRules !== undefined && { 'House Rules': { rich_text: [{ text: { content: houseRules || '' } }] } }),
        ...(req.body.paymentMethod !== undefined && { 'Payment Method': { rich_text: [{ text: { content: req.body.paymentMethod || '' } }] } }),
        ...(req.body.cancellationPolicy !== undefined && { 'Cancellation Policy': { rich_text: [{ text: { content: req.body.cancellationPolicy || '' } }] } }),
        ...(req.body.bookingConfirmation !== undefined && { 'Booking Confirmation': { rich_text: [{ text: { content: req.body.bookingConfirmation || '' } }] } }),
        ...(req.body.icalUrl !== undefined && { 'iCal Feed URL': { rich_text: [{ text: { content: req.body.icalUrl || '' } }] } }),
        ...(photoList && { 'Photos JSON': { rich_text: [{ text: { content: JSON.stringify(photoList) } }] } }),
        ...(photoList && photoList[0] && { 'Photo URL': { url: photoList[0] } }),
        ...(photoList && photoList[1] && { 'Photo URL 2': { url: photoList[1] } }),
        ...(photoList && photoList[2] && { 'Photo URL 3': { url: photoList[2] } }),
        ...(!photoList && photoUrl !== undefined && { 'Photo URL': { url: normalizeUrl(photoUrl) || null } }),
        ...(!photoList && photoUrl2 !== undefined && { 'Photo URL 2': { url: normalizeUrl(photoUrl2) || null } }),
        ...(!photoList && photoUrl3 !== undefined && { 'Photo URL 3': { url: normalizeUrl(photoUrl3) || null } }),
      };

      const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties }),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Notion update error:', err);
        return res.status(500).json({ error: 'Failed to update listing' });
      }

      // Re-geocode if address changed
      if (address && address.trim()) {
        geocodeAndStore(pageId, address).catch(() => {});
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Update error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // POST - submit a new stay listing
  if (req.method === 'POST') {
    const { name, stayType, phone, email, website, bookingUrl, description, address, beds, guests, amenities, logoUrl, photoUrl, photoUrl2, photoUrl3, tier, _hp } = req.body;

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
            ...(email && { 'Email': { email: email } }),
            'Website': { url: normalizeUrl(website) || null },
            ...(bookingUrl && { 'Booking URL': { url: normalizeUrl(bookingUrl) } }),
            'Description': { rich_text: [{ text: { content: description || '' } }] },
            'Address': { rich_text: [{ text: { content: address || '' } }] },
            ...(beds && { 'Beds': { number: parseInt(beds, 10) } }),
            ...(guests && { 'Guests': { number: parseInt(guests, 10) } }),
            ...(amenityTags.length && { 'Amenities': { multi_select: amenityTags } }),
            ...(logoUrl && { 'Logo URL': { url: normalizeUrl(logoUrl) } }),
            ...(photoUrl && { 'Photo URL': { url: normalizeUrl(photoUrl) } }),
            ...(photoUrl2 && { 'Photo URL 2': { url: normalizeUrl(photoUrl2) } }),
            ...(photoUrl3 && { 'Photo URL 3': { url: normalizeUrl(photoUrl3) } }),
            ...(tier && { 'Requested Tier': { select: { name: tier } } }),
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

  // GET - fetch listed stays (or owner lookup via ?manage=email)
  const manageEmail = req.query?.manage;
  res.setHeader('Cache-Control', 'no-store');
  try {
    const queryBody = {
      sorts: [{ property: 'Name', direction: 'ascending' }],
    };
    // If manage email provided, filter to just that owner's listings
    if (manageEmail) {
      queryBody.filter = { property: 'Email', email: { equals: manageEmail } };
    }
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_STAYS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(queryBody),
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

      // Skip entries still in "New" status (unapproved submissions) - unless owner is managing
      if (status === 'New' && !manageEmail) return;

      const expired = status === 'Listed Featured' && featuredExpires && featuredExpires < today;
      let tier = 'free';
      if (status === 'Listed Featured' && !expired) tier = 'featured';
      else if (status === 'Listed Enhanced') tier = 'enhanced';

      const stay = {
        id: `stay-${page.id}`,
        ...(manageEmail && { pageId: page.id }),
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
        email: p['Email']?.email || '',
        photos: parsePhotosJSON(p['Photos JSON']) || [
          normalizeUrl(p['Photo URL']?.url || ''),
          normalizeUrl(p['Photo URL 2']?.url || ''),
          normalizeUrl(p['Photo URL 3']?.url || ''),
        ].filter(Boolean),
        photo: normalizeUrl(p['Photo URL']?.url || ''),
        logo: normalizeUrl(p['Logo URL']?.url || null),
        lat: p['Lat']?.number ?? null,
        lng: p['Lng']?.number ?? null,
        pricePerNight: p['Price Per Night']?.rich_text?.[0]?.text?.content || '',
        minStay: p['Min Stay']?.number ?? null,
        checkIn: p['Check In']?.rich_text?.[0]?.text?.content || '',
        checkOut: p['Check Out']?.rich_text?.[0]?.text?.content || '',
        houseRules: p['House Rules']?.rich_text?.[0]?.text?.content || '',
        paymentMethod: p['Payment Method']?.rich_text?.[0]?.text?.content || '',
        cancellationPolicy: p['Cancellation Policy']?.rich_text?.[0]?.text?.content || '',
        bookingConfirmation: p['Booking Confirmation']?.rich_text?.[0]?.text?.content || '',
        icalUrl: p['iCal Feed URL']?.rich_text?.[0]?.text?.content || '',
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
