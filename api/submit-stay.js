// /api/submit-stay.js
// Captures a stay/rental property signup into Notion (Stays DB)
// Sends 6-digit SMS verification code, activates on confirm

import { sendSMS, normalizePhone } from './lib/twilio.js';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizeUrl(url) {
  if (!url || !url.trim()) return url;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    name, stayType, email, phone, address, bookingUrl,
    website, description, beds, guests, amenities, photoUrl, tier, _hp
  } = req.body || {};

  // Honeypot - bots fill hidden fields, humans don't
  if (_hp) return res.status(200).json({ ok: true, needsVerification: true });

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Property name is required.' });
  }
  if (!email?.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  const digits = normalizePhone(phone);
  if (digits.length < 10) {
    return res.status(400).json({ error: 'A valid phone number is required.' });
  }

  const notionToken = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_STAYS;

  const code = generateCode();

  // Build Notion properties - only set optional fields if they have values
  const properties = {
    'Name':              { title: [{ text: { content: name.trim() } }] },
    'Status':            { status: { name: 'New' } },
    'Phone':             { phone_number: digits },
    'Email':             { email: email.trim() },
    'Verification Code': { rich_text: [{ text: { content: code } }] },
  };

  if (stayType?.trim())    properties['Stay Type']      = { select: { name: stayType.trim() } };
  if (tier?.trim())         properties['Requested Tier'] = { select: { name: tier.trim() } };
  if (description?.trim())  properties['Description']    = { rich_text: [{ text: { content: description.trim() } }] };
  if (address?.trim())      properties['Address']        = { rich_text: [{ text: { content: address.trim() } }] };

  const cleanWebsite = normalizeUrl(website);
  if (cleanWebsite?.trim()) properties['Website'] = { url: cleanWebsite };

  const cleanBookingUrl = normalizeUrl(bookingUrl);
  if (cleanBookingUrl?.trim()) properties['Booking URL'] = { url: cleanBookingUrl };

  if (photoUrl?.trim())     properties['Photo URL'] = { url: photoUrl.trim() };

  if (beds != null && beds !== '') {
    const bedsNum = Number(beds);
    if (!isNaN(bedsNum)) properties['Beds'] = { number: bedsNum };
  }
  if (guests != null && guests !== '') {
    const guestsNum = Number(guests);
    if (!isNaN(guestsNum)) properties['Guests'] = { number: guestsNum };
  }

  if (amenities && Array.isArray(amenities) && amenities.length > 0) {
    properties['Amenities'] = { multi_select: amenities.map(a => ({ name: a.trim() })) };
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ parent: { database_id: dbId }, properties }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('submit-stay Notion error:', err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }

    const smsOk = await sendSMS(
      digits,
      `Manitou Beach Stays\n\nYour verification code is: ${code}\n\nEnter this on the signup page to get your property listed.`
    );

    if (!smsOk) {
      return res.status(200).json({ ok: true, needsVerification: true, smsFailed: true });
    }

    return res.status(200).json({ ok: true, needsVerification: true });
  } catch (err) {
    console.error('submit-stay error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
