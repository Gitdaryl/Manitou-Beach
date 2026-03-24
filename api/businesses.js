// Fetch all pages from a Notion database query, following cursors past the 100-record limit
async function queryAllNotionPages(dbId, token, body) {
  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  let results = [];
  let startCursor;
  do {
    const pageBody = startCursor ? { ...body, start_cursor: startCursor } : body;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(pageBody) });
    if (!res.ok) throw new Error(`Notion query failed: ${await res.text()}`);
    const data = await res.json();
    results = results.concat(data.results);
    startCursor = data.has_more ? data.next_cursor : null;
  } while (startCursor);
  return results;
}

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
  // Reject natural water features — Nominatim sometimes matches "Devils Lake Hwy" to the lake itself
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

      const newPage = await response.json();

      // Auto-geocode address and write lat/lng back to Notion (fire-and-forget, never blocks submission)
      if (address && address.trim()) {
        geocodeAndStore(newPage.id, address).catch(() => {});
      }

      // Alert admin when a business submits with no category or "Other"
      if (!category || category === 'Other') {
        import('resend').then(({ Resend }) => {
          const resend = new Resend(process.env.RESEND_API_KEY);
          resend.emails.send({
            from: 'Manitou Beach <hello@manitou-beach.com>',
            to: process.env.ADMIN_EMAIL || 'daryl@yetigroove.com',
            subject: `⚠️ Uncategorized business listing — "${name}"`,
            html: `
              <div style="font-family:sans-serif;max-width:480px">
                <h2 style="color:#2D3B45">Uncategorized Business Listing</h2>
                <p><strong>${name}</strong> was submitted with category <em>"Other"</em>.</p>
                ${address ? `<p>Address: ${address}</p>` : ''}
                <p>Open Notion, find this listing, and assign a proper category — or create a new one if needed. Once categorized, it will automatically appear under the correct Local Guide pill.</p>
              </div>
            `,
          }).catch(() => {});
        }).catch(() => {});
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Server error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // GET — slot availability counts (lightweight, no business details exposed)
  if (req.query.slots === 'true') {
    const CAPS = { premium: 1, featured: 3 }; // Enhanced = unlimited
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
                { property: 'Status', status: { equals: 'Listed Enhanced' } },
                { property: 'Status', status: { equals: 'Listed Featured' } },
                { property: 'Status', status: { equals: 'Listed Premium' } },
              ],
            },
          }),
        }
      );
      if (!response.ok) return res.status(200).json({ tierCounts: { premium: {}, featured: {}, enhanced: {} }, caps: CAPS });
      const data = await response.json();
      const tierCounts = { premium: {}, featured: {}, enhanced: {} };
      data.results.forEach(page => {
        const cat = page.properties['Category']?.select?.name || 'Other';
        const status = page.properties['Status']?.status?.name || '';
        if (status === 'Listed Premium') tierCounts.premium[cat] = (tierCounts.premium[cat] || 0) + 1;
        else if (status === 'Listed Featured') tierCounts.featured[cat] = (tierCounts.featured[cat] || 0) + 1;
        else if (status === 'Listed Enhanced') tierCounts.enhanced[cat] = (tierCounts.enhanced[cat] || 0) + 1;
      });
      return res.status(200).json({ tierCounts, caps: CAPS });
    } catch {
      return res.status(200).json({ tierCounts: { premium: {}, featured: {}, enhanced: {} }, caps: CAPS });
    }
  }

  // GET — fetch listed businesses
  // no-store: coordinates update frequently (geocoding) — stale CDN data caused random pin behavior
  res.setHeader('Cache-Control', 'no-store');
  try {
    const queryBody = {
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
    };

    let pages;
    try {
      pages = await queryAllNotionPages(process.env.NOTION_DB_BUSINESS, process.env.NOTION_TOKEN_BUSINESS, queryBody);
    } catch (err) {
      console.error('Notion query failed:', err.message);
      return res.status(200).json({ free: [], enhanced: [], featured: [], premium: [] });
    }

    const free = [], enhanced = [], featured = [], premium = [];

    const today = new Date().toISOString().split('T')[0];

    pages.forEach(page => {
      const p = page.properties;
      const status = p['Status']?.status?.name || '';
      const featuredExpires = p['Featured Expires']?.date?.start || null;
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

      // If featured listing has expired, treat as free tier
      const expired = status === 'Listed Featured' && featuredExpires && featuredExpires < today;

      if (status === 'Listed Premium') premium.push({ ...business, tier: 'premium' });
      else if (status === 'Listed Featured' && !expired) featured.push({ ...business, tier: 'featured' });
      else if (status === 'Listed Enhanced' || status === 'Listed Comp') enhanced.push({ ...business, tier: 'enhanced' });
      else free.push({ ...business, tier: 'free' });
    });

    return res.status(200).json({ free, enhanced, featured, premium });
  } catch (err) {
    console.error('Businesses API error:', err.message);
    return res.status(200).json({ free: [], enhanced: [], featured: [], premium: [] });
  }
}
