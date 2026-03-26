// /api/send-checkin-link.js
// POST { phone } — looks up truck by phone in Notion, texts check-in URL via Twilio
// Used by vendors who forgot their check-in link

import { sendSMSFull, normalizePhone } from './lib/twilio.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone } = req.body || {};
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Valid phone number required' });
    }

    const inputDigits = normalizePhone(phone);

    // Query all Active trucks from Notion
    const queryBody = {
      filter: { property: 'Status', select: { equals: 'Active' } },
      page_size: 100,
    };

    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(queryBody),
      }
    );

    if (!queryRes.ok) {
      console.error('Notion query failed:', await queryRes.text());
      return res.status(500).json({ error: 'Lookup failed' });
    }

    const queryData = await queryRes.json();

    // Find truck matching the phone number
    const match = queryData.results?.find(page => {
      const stored = page.properties['Phone']?.phone_number || '';
      return normalizePhone(stored) === inputDigits;
    });

    if (!match) {
      // Return 200 with not-found so we don't leak whether a number is registered
      return res.status(200).json({ ok: true, sent: false });
    }

    const slug = match.properties['Slug']?.rich_text?.[0]?.text?.content || '';
    const token = match.properties['Checkin Token']?.rich_text?.[0]?.text?.content || '';
    const name = match.properties['Name']?.title?.[0]?.text?.content || 'your truck';

    if (!slug || !token) {
      console.error('Truck missing slug or token:', match.id);
      return res.status(200).json({ ok: true, sent: false });
    }

    const checkinUrl = `${process.env.SITE_URL || 'https://manitoubeach.yetigroove.com'}/food-trucks?truck=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`;

    const ok = await sendSMSFull(
      `+1${inputDigits}`,
      `Manitou Beach Food Trucks\n\nHere's your check-in link for ${name}:\n${checkinUrl}\n\nSave this to your home screen for quick access each day.`
    );

    if (!ok) {
      return res.status(500).json({ error: 'SMS failed' });
    }

    return res.status(200).json({ ok: true, sent: true });
  } catch (err) {
    console.error('send-checkin-link error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
