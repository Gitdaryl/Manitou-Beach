// /api/manage-stay-auth.js
// POST { phone }           → looks up their stay listing, sends a 6-digit SMS code
// POST { phone, code }     → verifies code, returns listing data for editing

import { sendSMS, normalizePhone } from './lib/twilio.js';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeUrl(url) {
  if (!url || !url.trim()) return '';
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

async function findListingByPhone(token, dbId, digits) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Phone', phone_number: { equals: digits } },
          {
            or: [
              { property: 'Status', status: { equals: 'Listed Free' } },
              { property: 'Status', status: { equals: 'Listed Enhanced' } },
              { property: 'Status', status: { equals: 'Listed Featured' } },
              { property: 'Status', status: { equals: 'Listed Premium' } },
              { property: 'Status', status: { equals: 'New' } },
            ],
          },
        ],
      },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: 5,
    }),
  });
  if (!res.ok) throw new Error('Notion query failed: ' + await res.text());
  return (await res.json()).results || [];
}

async function patchCode(token, pageId, code) {
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ properties: { 'Verification Code': { rich_text: [{ text: { content: code } }] } } }),
  });
}

function mapListing(page) {
  const p = page.properties;
  return {
    pageId: page.id,
    name: p['Name']?.title?.[0]?.text?.content || '',
    stayType: p['Stay Type']?.select?.name || '',
    description: p['Description']?.rich_text?.[0]?.text?.content || '',
    address: p['Address']?.rich_text?.[0]?.text?.content || '',
    beds: p['Beds']?.number ?? '',
    guests: p['Guests']?.number ?? '',
    amenities: (p['Amenities']?.multi_select || []).map(s => s.name),
    bookingUrl: p['Booking URL']?.url || '',
    website: p['Website']?.url || '',
    phone: p['Phone']?.phone_number || '',
    email: p['Email']?.email || '',
    photoUrl: p['Photo URL']?.url || '',
    photoUrl2: p['Photo URL 2']?.url || '',
    photoUrl3: p['Photo URL 3']?.url || '',
    tier: p['Status']?.status?.name || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, code } = req.body || {};
  const token = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_STAYS;
  const digits = normalizePhone(phone || '');

  if (digits.length < 10) {
    return res.status(400).json({ error: 'Valid phone number required.' });
  }

  try {
    const listings = await findListingByPhone(token, dbId, digits);

    if (listings.length === 0) {
      return res.status(404).json({ error: "We couldn't find a listing for that phone number. Make sure you're using the same number you signed up with." });
    }

    // ── VERIFY step: phone + code provided ──────────────────────
    if (code) {
      const trimmed = code.trim();
      if (trimmed.length !== 6) {
        return res.status(400).json({ error: 'Enter the 6-digit code from your text message.' });
      }

      const match = listings.find(page => {
        const stored = page.properties['Verification Code']?.rich_text?.[0]?.text?.content || '';
        return stored === trimmed;
      });

      if (!match) {
        return res.status(400).json({ error: 'Incorrect code. Check your messages and try again.' });
      }

      // Clear the code
      await patchCode(token, match.id, '');

      return res.status(200).json({ ok: true, listing: mapListing(match) });
    }

    // ── SEND step: just phone provided ──────────────────────────
    const newCode = generateCode();
    const page = listings[0]; // most recent listing for this phone

    await patchCode(token, page.id, newCode);

    const stayName = page.properties['Name']?.title?.[0]?.text?.content || 'your listing';
    const smsOk = await sendSMS(
      digits,
      `Manitou Beach Stays\n\nYour code to manage "${stayName}" is: ${newCode}\n\nThis code expires when used.`
    );

    if (!smsOk) {
      return res.status(500).json({ error: 'Could not send SMS. Please try again.' });
    }

    return res.status(200).json({ ok: true, sent: true });
  } catch (err) {
    console.error('manage-stay-auth error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
