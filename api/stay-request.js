// /api/stay-request.js
// POST { pageId, stayName, guestName, guestPhone, guestEmail, datesRequested, guestCount, message }
// Sends an SMS to the property owner with the guest's inquiry details.
// Guest optionally receives a confirmation SMS.

import { sendSMS, normalizePhone } from './lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pageId, stayName, guestName, guestPhone, guestEmail, datesRequested, guestCount, message } = req.body || {};

  if (!pageId || !guestName?.trim() || !guestPhone?.trim()) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  const guestDigits = normalizePhone(guestPhone);
  if (guestDigits.length < 10) {
    return res.status(400).json({ error: 'A valid phone number is required.' });
  }

  // Fetch the owner's phone from Notion
  const ownerRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
      'Notion-Version': '2022-06-28',
    },
  });

  if (!ownerRes.ok) {
    return res.status(500).json({ error: 'Could not locate property. Please try again.' });
  }

  const page = await ownerRes.json();
  const ownerPhone = page.properties?.['Phone']?.phone_number;

  if (!ownerPhone) {
    return res.status(500).json({ error: 'Owner contact not found.' });
  }

  const dates = datesRequested?.trim() || 'dates not specified';
  const count = guestCount ? ` ${guestCount} guest${guestCount > 1 ? 's' : ''}.` : '';
  const note = message?.trim() ? ` Message: "${message.trim()}"` : '';

  const ownerMsg = `New booking request for ${stayName || 'your property'}\n\nFrom: ${guestName.trim()} - ${guestDigits}${guestEmail ? ` / ${guestEmail}` : ''}\nDates: ${dates}${count}${note}\n\nReply directly to this number to connect with them.`;

  await sendSMS(ownerPhone, ownerMsg).catch(() => {});

  // Confirmation to guest
  const guestMsg = `Your request for ${stayName || 'the property'} (${dates}) has been sent. The owner will contact you directly. - Manitou Beach Stays`;
  await sendSMS(guestDigits, guestMsg).catch(() => {});

  return res.status(200).json({ ok: true });
}
