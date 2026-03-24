import { Resend } from 'resend';
import { createHmac } from 'crypto';

function makeConfirmToken(pageId) {
  const secret = process.env.NOTION_TOKEN_BUSINESS || 'fallback';
  return createHmac('sha256', secret).update(pageId).digest('hex').slice(0, 40);
}

async function sendSMS(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;
  if (!sid || !token || !from) return false;
  try {
    let digits = to.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
    if (digits.length !== 10) return false;
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: `+1${digits}`, Body: body }).toString(),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

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

      // Build confirmation URL — used in both SMS and email
      const siteUrl = process.env.SITE_URL || `https://manitou-beach.vercel.app`;
      const confirmToken = makeConfirmToken(newPage.id);
      const confirmUrl = `${siteUrl}/api/confirm-listing?id=${newPage.id}&token=${confirmToken}`;

      const tasks = [];

      // SMS confirmation (primary — highest open rate, now that A2P is approved)
      if (phone && phone.trim()) {
        tasks.push(
          sendSMS(phone, `Manitou Beach: Tap to confirm your listing for ${name} and go live instantly.\n${confirmUrl}`)
            .then(ok => { if (!ok) console.error('SMS confirmation failed to send for', name); })
        );
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      // Alert admin when a business submits with no category or "Other"
      if (!category || category === 'Other') {
        tasks.push(
          resend.emails.send({
            from: 'Manitou Beach <hello@yetigroove.com>',
            to: process.env.ADMIN_EMAIL || 'daryl@yetigroove.com',
            subject: `⚠️ Uncategorized business listing — "${name}"`,
            html: `
              <div style="font-family:sans-serif;max-width:480px">
                <h2 style="color:#2D3B45">Uncategorized Business Listing</h2>
                <p><strong>${name}</strong> was submitted with category <em>"Other"</em>.</p>
                ${address ? `<p>Address: ${address}</p>` : ''}
                <p>Open Notion, find this listing, and assign a proper category. Once categorized and confirmed, it will appear under the correct Local Guide pill.</p>
              </div>
            `,
          }).then(r => { if (r.error) console.error('Resend admin alert error:', JSON.stringify(r.error)); })
            .catch(err => console.error('Resend admin alert exception:', err.message))
        );
      }

      // Welcome + confirmation email (secondary delivery channel)
      if (email) {
        tasks.push(
          resend.emails.send({
            from: 'Manitou Beach <hello@yetigroove.com>',
            reply_to: 'hello@yetigroove.com',
            to: email,
            subject: `Confirm your listing — ${name}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
                <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">One tap and you're live</h1>
                <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.6;">
                  We've got your info for <strong>${name}</strong>. Hit the button below to confirm it's you — your listing goes live instantly.
                </p>
                <div style="text-align:center;margin:0 0 28px;">
                  <a href="${confirmUrl}" style="display:inline-block;background:#2D6A4F;color:#fff;text-decoration:none;padding:16px 36px;border-radius:10px;font-size:17px;font-weight:700;letter-spacing:0.3px;">
                    Confirm &amp; Go Live →
                  </a>
                </div>
                <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Business</p>
                  <p style="margin:0 0 16px;color:#1A2830;font-size:16px;font-weight:600;">${name}</p>
                  ${category && category !== 'Other' ? `
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Type of Business</p>
                  <p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${category}</p>` : ''}
                  ${address ? `
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Address</p>
                  <p style="margin:0;color:#1A2830;font-size:15px;">${address}</p>` : ''}
                </div>
                <p style="color:#5C5248;font-size:13px;line-height:1.6;margin:0 0 16px;">
                  Need to fix something first? <a href="${siteUrl}/update-listing" style="color:#2D6A4F;">Update your info →</a>
                </p>
                <p style="color:#8C806E;font-size:13px;line-height:1.6;margin:0;">
                  Any questions — just reply to this email.
                </p>
              </div>
            `,
          }).then(r => { if (r.error) console.error('Resend confirmation email error:', JSON.stringify(r.error)); })
            .catch(err => console.error('Resend confirmation email exception:', err.message))
        );
      }

      await Promise.allSettled(tasks);

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
