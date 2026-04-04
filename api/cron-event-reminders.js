import { Resend } from 'resend';
import { sendSMS, normalizePhone } from './lib/twilio.js';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

function toDateStr(d) {
  return d.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  // Allow Vercel Cron (GET) or manual trigger (GET/POST)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const now = new Date();
  const today = toDateStr(now);
  const tomorrow = toDateStr(new Date(now.getTime() + 86400000));
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    let totalEmailsSent = 0;
    let totalSmsSent = 0;

    // ─── TRACK 1: RSVP reminders (existing) ──────────────────────────────────
    const rsvpEvents = await fetchEvents({
      extraFilter: { property: 'RSVP Enabled', checkbox: { equals: true } },
      today, tomorrow,
    });

    for (const event of rsvpEvents) {
      const isToday = event.date === today;
      const { emailsSent, smsSent } = await sendRsvpReminders({ event, isToday, resend, siteUrl });
      totalEmailsSent += emailsSent;
      totalSmsSent += smsSent;
    }

    // ─── TRACK 2: Ticket buyer reminders ──────────────────────────────────────
    const ticketedEvents = await fetchEvents({
      extraFilter: { property: 'Tickets Enabled', checkbox: { equals: true } },
      today, tomorrow,
    });

    for (const event of ticketedEvents) {
      const isToday = event.date === today;
      const { emailsSent, smsSent } = await sendTicketBuyerReminders({ event, isToday, resend, siteUrl });
      totalEmailsSent += emailsSent;
      totalSmsSent += smsSent;

      // Organizer morning-of SMS (only on event day)
      if (isToday && event.phone) {
        await sendOrganizerMorningOf({ event, siteUrl });
      }
    }

    const totalEvents = rsvpEvents.length + ticketedEvents.length;
    console.log(`Cron event reminders: ${totalEmailsSent} emails + ${totalSmsSent} SMS for ${totalEvents} events`);
    return res.status(200).json({ sent: totalEmailsSent, smsSent: totalSmsSent, events: totalEvents });
  } catch (err) {
    console.error('Cron event reminders error:', err.message);
    return res.status(200).json({ sent: 0, error: err.message });
  }
}

// ─── Fetch published events for today/tomorrow with an extra filter ──────────
async function fetchEvents({ extraFilter, today, tomorrow }) {
  const eventsRes = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
    {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: {
          and: [
            {
              or: [
                { property: 'Status', status: { equals: 'Approved' } },
                { property: 'Status', status: { equals: 'Published' } },
              ],
            },
            extraFilter,
            {
              or: [
                { property: 'Event date', date: { equals: today } },
                { property: 'Event date', date: { equals: tomorrow } },
              ],
            },
          ],
        },
      }),
    }
  );

  if (!eventsRes.ok) {
    console.error('Cron: failed to fetch events', await eventsRes.text());
    return [];
  }

  const eventsData = await eventsRes.json();
  return eventsData.results.map(page => {
    const p = page.properties;
    return {
      id: page.id,
      name: p['Event Name']?.title?.[0]?.text?.content || '',
      date: p['Event date']?.date?.start || '',
      time: p['Time']?.rich_text?.[0]?.text?.content || '',
      timeEnd: p['Time End']?.rich_text?.[0]?.text?.content || null,
      location: p['Location']?.rich_text?.[0]?.text?.content || '',
      phone: p['Phone']?.phone_number || '',
      editToken: p['Edit Token']?.rich_text?.[0]?.text?.content || '',
    };
  }).filter(e => e.name && e.date);
}

// ─── RSVP reminders (email + SMS to each attendee) ──────────────────────────
async function sendRsvpReminders({ event, isToday, resend, siteUrl }) {
  let emailsSent = 0;
  let smsSent = 0;
  const label = isToday ? 'today' : 'tomorrow';
  const timeDisplay = event.time
    ? `${event.time}${event.timeEnd ? ` – ${event.timeEnd}` : ''}`
    : '';

  let rsvps = [];
  try {
    const rsvpRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_RSVPS}/query`,
      {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: { property: 'Event ID', rich_text: { equals: event.id } },
        }),
      }
    );
    if (rsvpRes.ok) {
      const rsvpData = await rsvpRes.json();
      rsvps = rsvpData.results.map(r => ({
        name: r.properties['Name']?.title?.[0]?.text?.content || '',
        email: r.properties['Email']?.email || '',
        phone: r.properties['Phone']?.phone_number || '',
      })).filter(r => r.email || r.phone);
    }
  } catch (err) {
    console.error(`Cron: failed to fetch RSVPs for event ${event.id}:`, err.message);
    return { emailsSent, smsSent };
  }

  for (const rsvp of rsvps) {
    if (resend && rsvp.email) {
      try {
        await resend.emails.send({
          from: 'Manitou Beach <events@manitoubeachmichigan.com>',
          to: rsvp.email,
          subject: isToday
            ? `Happening today - ${event.name}`
            : `Reminder - ${event.name} is tomorrow`,
          html: reminderEmailHtml({ name: rsvp.name, eventName: event.name, label, timeDisplay, location: event.location, siteUrl }),
        });
        emailsSent++;
      } catch (emailErr) {
        console.error(`Cron: reminder email error for ${rsvp.email}:`, emailErr.message);
      }
    }

    if (rsvp.phone) {
      const digits = normalizePhone(rsvp.phone);
      if (digits.length === 10) {
        const parts = [isToday
          ? `Happening today - ${event.name}!`
          : `Reminder: ${event.name} is tomorrow!`];
        if (timeDisplay) parts.push(timeDisplay);
        if (event.location) parts.push(event.location);
        parts.push('- Manitou Beach');
        const ok = await sendSMS(digits, parts.join('\n')).catch(() => false);
        if (ok) smsSent++;
      }
    }
  }

  return { emailsSent, smsSent };
}

// ─── Ticket buyer reminders (email + SMS to each buyer with valid tickets) ───
async function sendTicketBuyerReminders({ event, isToday, resend, siteUrl }) {
  let emailsSent = 0;
  let smsSent = 0;
  const label = isToday ? 'today' : 'tomorrow';
  const timeDisplay = event.time
    ? `${event.time}${event.timeEnd ? ` – ${event.timeEnd}` : ''}`
    : '';

  // Paginate through all tickets for this event
  let buyers = [];
  let cursor = undefined;
  try {
    do {
      const body = {
        filter: {
          and: [
            { property: 'Event Page ID', rich_text: { equals: event.id } },
            { property: 'Status', select: { equals: 'Valid' } },
          ],
        },
        page_size: 100,
      };
      if (cursor) body.start_cursor = cursor;

      const ticketRes = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DB_TICKETS}/query`,
        { method: 'POST', headers: NOTION_HEADERS, body: JSON.stringify(body) }
      );
      if (!ticketRes.ok) break;

      const ticketData = await ticketRes.json();
      for (const t of ticketData.results) {
        const p = t.properties;
        buyers.push({
          name: p['Buyer Name']?.rich_text?.[0]?.text?.content || '',
          email: p['Email']?.email || '',
          phone: p['Phone']?.phone_number || '',
          quantity: p['Quantity']?.number || 1,
        });
      }
      cursor = ticketData.has_more ? ticketData.next_cursor : null;
    } while (cursor);
  } catch (err) {
    console.error(`Cron: failed to fetch tickets for event ${event.id}:`, err.message);
    return { emailsSent, smsSent };
  }

  // Deduplicate by email (same person may have multiple purchases)
  const seen = new Set();
  const uniqueBuyers = buyers.filter(b => {
    const key = b.email || b.phone;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const buyer of uniqueBuyers) {
    // Email reminder
    if (resend && buyer.email) {
      try {
        const ticketNote = buyer.quantity > 1
          ? `You have ${buyer.quantity} tickets - don't forget to bring everyone!`
          : `Your ticket is ready - just show your confirmation at the door.`;
        await resend.emails.send({
          from: 'Manitou Beach <events@manitoubeachmichigan.com>',
          to: buyer.email,
          subject: isToday
            ? `Happening today - ${event.name}`
            : `Reminder - ${event.name} is tomorrow`,
          html: reminderEmailHtml({
            name: buyer.name, eventName: event.name, label, timeDisplay,
            location: event.location, siteUrl, ticketNote,
          }),
        });
        emailsSent++;
      } catch (emailErr) {
        console.error(`Cron: ticket reminder email error for ${buyer.email}:`, emailErr.message);
      }
    }

    // SMS reminder
    if (buyer.phone) {
      const digits = normalizePhone(buyer.phone);
      if (digits.length === 10) {
        const parts = [isToday
          ? `Happening today - ${event.name}!`
          : `Reminder: ${event.name} is tomorrow!`];
        if (timeDisplay) parts.push(timeDisplay);
        if (event.location) parts.push(event.location);
        parts.push('Show your ticket confirmation at the door.');
        parts.push('- Manitou Beach');
        const ok = await sendSMS(digits, parts.join('\n')).catch(() => false);
        if (ok) smsSent++;
      }
    }
  }

  return { emailsSent, smsSent };
}

// ─── Organizer morning-of SMS ────────────────────────────────────────────────
async function sendOrganizerMorningOf({ event, siteUrl }) {
  const digits = normalizePhone(event.phone);
  if (digits.length !== 10 || !event.editToken) return;

  const salesUrl = `${siteUrl}/organizer-dashboard?token=${event.editToken}&event=${event.id}`;
  const checkInUrl = `${siteUrl}/check-in?event=${event.id}`;

  const parts = [
    `Good morning! ${event.name} is today! 🎉`,
    '',
    `See who bought tickets + check-ins:`,
    salesUrl,
    '',
    `Volunteer check-in scanner:`,
    checkInUrl,
    '',
    '- Manitou Beach Events',
  ];

  await sendSMS(digits, parts.join('\n')).catch(err =>
    console.error(`Cron: organizer morning-of SMS error for event ${event.id}:`, err.message)
  );
}

// ─── Shared email HTML template ──────────────────────────────────────────────
function reminderEmailHtml({ name, eventName, label, timeDisplay, location, siteUrl, ticketNote }) {
  const isToday = label === 'today';
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
      <h1 style="color:#1A2830;font-size:20px;margin:0 0 8px;">
        ${isToday ? '🎉 Happening today!' : '⏰ Reminder for tomorrow'}
      </h1>
      <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.7;">
        ${name ? `Hi ${name} - ` : ''}don't forget, <strong>${eventName}</strong> is ${label}!
      </p>
      <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
        ${timeDisplay ? `<p style="margin:0 0 6px;color:#3B3228;font-size:14px;">🕐 ${timeDisplay}</p>` : ''}
        ${location ? `<p style="margin:0;color:#3B3228;font-size:14px;">📍 ${location}</p>` : ''}
      </div>
      ${ticketNote ? `<p style="color:#5C5248;font-size:14px;margin:0 0 16px;line-height:1.6;">${ticketNote}</p>` : ''}
      <p style="color:#8C806E;font-size:13px;line-height:1.6;">
        See you there!
      </p>
      <p style="margin-top:24px;color:#8C806E;font-size:12px;">
        <a href="${siteUrl}/events" style="color:#5B7D8E;">Browse more events →</a>
      </p>
    </div>
  `;
}
