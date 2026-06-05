// /api/stay-waitlist.js
// POST { pageId, stayName, guestName, guestPhone, guestEmail, datesRequested }
// Adds the guest to the Stay Waitlist Notion DB and sends them a confirmation SMS.
// Auto-notify on cancellation is triggered by api/stay-availability.js on unblock.

import { sendSMS, normalizePhone } from './lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pageId, stayName, guestName, guestPhone, guestEmail, datesRequested } = req.body || {};

  if (!pageId || !guestName?.trim() || !guestPhone?.trim()) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  const guestDigits = normalizePhone(guestPhone);
  if (guestDigits.length < 10) {
    return res.status(400).json({ error: 'A valid phone number is required.' });
  }

  const dbId = process.env.NOTION_DB_WAITLIST_STAYS;
  if (!dbId) return res.status(500).json({ error: 'Waitlist not configured.' });

  const dates = datesRequested?.trim() || '';
  const today = new Date().toISOString().split('T')[0];

  const notionRes = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        'Guest Name':      { title: [{ text: { content: guestName.trim() } }] },
        'Stay Page ID':    { rich_text: [{ text: { content: pageId } }] },
        'Stay Name':       { rich_text: [{ text: { content: stayName || '' } }] },
        'Phone':           { phone_number: guestDigits },
        ...(guestEmail?.trim() && { 'Email': { email: guestEmail.trim() } }),
        ...(dates && { 'Dates Requested': { rich_text: [{ text: { content: dates } }] } }),
        'Status':          { select: { name: 'Pending' } },
        'Created':         { date: { start: today } },
      },
    }),
  });

  if (!notionRes.ok) {
    console.error('stay-waitlist Notion error:', await notionRes.text());
    return res.status(500).json({ error: 'Could not save to waitlist. Please try again.' });
  }

  const confirmMsg = `You're on the waitlist for ${stayName || 'the property'}${dates ? ` (${dates})` : ''}. We'll text you if those dates open up. - Manitou Beach Stays`;
  await sendSMS(guestDigits, confirmMsg).catch(() => {});

  return res.status(200).json({ ok: true });
}
