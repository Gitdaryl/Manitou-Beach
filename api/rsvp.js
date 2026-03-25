import { Resend } from 'resend';
import { sendSMS, normalizePhone } from './lib/twilio.js';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { eventId, eventName, eventDate, eventTime, eventLocation, organizerEmail, name, email, phone, guests } = req.body;

  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
  if (!eventId) return res.status(400).json({ error: 'Event ID required' });

  // 0. Capacity check — block if event is full
  let currentRsvpCount = 0;
  try {
    const eventPage = await fetch(`https://api.notion.com/v1/pages/${eventId}`, { headers: NOTION_HEADERS });
    if (eventPage.ok) {
      const ep = await eventPage.json();
      const capacity = ep.properties?.['RSVP Capacity']?.number || 0;
      currentRsvpCount = ep.properties?.['RSVPs Count']?.number || 0;
      if (capacity > 0 && currentRsvpCount >= capacity) {
        return res.status(409).json({ error: 'sold_out', message: 'This event is full.' });
      }
    }
  } catch (err) {
    console.error('RSVP capacity check error:', err.message);
    // Continue — don't block on capacity check failure
  }

  // 1. Write RSVP to Notion
  try {
    const properties = {
      'Name': { title: [{ text: { content: name } }] },
      'Email': { email: email },
      'Event ID': { rich_text: [{ text: { content: eventId } }] },
      'Event Name': { rich_text: [{ text: { content: eventName || '' } }] },
    };
    if (phone) properties['Phone'] = { phone_number: phone };
    if (guests) properties['Guests'] = { number: parseInt(guests, 10) || 1 };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({ parent: { database_id: process.env.NOTION_DB_RSVPS }, properties }),
    });
    if (!notionRes.ok) {
      const err = await notionRes.json();
      console.error('RSVP Notion write error:', JSON.stringify(err));
      return res.status(500).json({ error: 'Failed to save RSVP' });
    }
  } catch (err) {
    console.error('RSVP Notion error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }

  // 1b. Increment RSVPs Count on the event page (best-effort)
  try {
    await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      method: 'PATCH',
      headers: NOTION_HEADERS,
      body: JSON.stringify({ properties: { 'RSVPs Count': { number: currentRsvpCount + 1 } } }),
    });
  } catch (err) {
    console.error('RSVP count increment error:', err.message);
  }

  // 1c. Send SMS confirmation (best-effort)
  if (phone) {
    const digits = normalizePhone(phone);
    if (digits.length === 10) {
      const dateLine = eventDate
        ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : '';
      const parts = [`You're registered for ${eventName}!`];
      if (dateLine) parts.push(dateLine);
      if (eventTime) parts.push(eventTime);
      if (eventLocation) parts.push(eventLocation);
      parts.push("We'll text you a reminder before the event. — Manitou Beach");
      sendSMS(digits, parts.join('\n')).catch(() => {});
    }
  }

  // 2. Send confirmation email to attendee (best-effort)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const guestLine = guests > 1 ? ` (+${guests - 1} guest${guests - 1 > 1 ? 's' : ''})` : '';
    const dateLine = (() => {
      try { return eventDate ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''; }
      catch { return eventDate || ''; }
    })();

    // Confirmation to attendee
    try {
      await resend.emails.send({
        from: 'Manitou Beach <events@yetigroove.com>',
        to: email,
        subject: `You're registered for "${eventName}"`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
            <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">You're in! 🎉</h1>
            <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.7;">
              Your RSVP for <strong>${eventName}</strong>${guestLine} has been confirmed.
            </p>
            <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
              ${dateLine ? `<p style="margin:0 0 6px;color:#3B3228;font-size:14px;">📅 ${dateLine}</p>` : ''}
              ${eventTime ? `<p style="margin:0 0 6px;color:#3B3228;font-size:14px;">🕐 ${eventTime}</p>` : ''}
              ${eventLocation ? `<p style="margin:0;color:#3B3228;font-size:14px;">📍 ${eventLocation}</p>` : ''}
            </div>
            <p style="color:#8C806E;font-size:13px;line-height:1.6;">
              We'll send you a reminder the day before. See you there!
            </p>
            <p style="margin-top:24px;color:#8C806E;font-size:12px;">
              <a href="https://manitoubeach.com/events" style="color:#5B7D8E;">Browse more events →</a>
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('RSVP attendee email error:', emailErr.message);
    }

    // Organizer notification
    if (organizerEmail) {
      try {
        await resend.emails.send({
          from: 'Manitou Beach <events@yetigroove.com>',
          to: organizerEmail,
          subject: `New RSVP for "${eventName}"`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <h1 style="color:#1A2830;font-size:20px;margin:0 0 16px;">New RSVP 🎟️</h1>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 6px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${name}${guestLine}</p>
                <p style="margin:0 0 6px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${email}</p>
                ${phone ? `<p style="margin:0 0 6px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phone</p><p style="margin:0;color:#1A2830;font-size:15px;">${phone}</p>` : ''}
              </div>
              <p style="color:#8C806E;font-size:13px;margin-top:16px;">Event: <strong>${eventName}</strong>${dateLine ? ` · ${dateLine}` : ''}</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('RSVP organizer notify error:', emailErr.message);
      }
    }
  }

  return res.status(200).json({ success: true });
}
