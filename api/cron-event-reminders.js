import { Resend } from 'resend';

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

  try {
    // 1. Fetch events for today and tomorrow that have RSVP enabled
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
              { property: 'RSVP Enabled', checkbox: { equals: true } },
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
      return res.status(200).json({ sent: 0, error: 'Failed to fetch events' });
    }

    const eventsData = await eventsRes.json();
    const events = eventsData.results.map(page => {
      const p = page.properties;
      return {
        id: page.id,
        name: p['Event Name']?.title?.[0]?.text?.content || '',
        date: p['Event date']?.date?.start || '',
        time: p['Time']?.rich_text?.[0]?.text?.content || '',
        timeEnd: p['Time End']?.rich_text?.[0]?.text?.content || null,
        location: p['Location']?.rich_text?.[0]?.text?.content || '',
      };
    }).filter(e => e.name && e.date);

    if (events.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No RSVP-enabled events today or tomorrow' });
    }

    // 2. For each event, fetch RSVPs and send reminders
    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    let totalSent = 0;

    for (const event of events) {
      const isToday = event.date === today;
      const label = isToday ? 'today' : 'tomorrow';

      const timeDisplay = event.time
        ? `${event.time}${event.timeEnd ? ` – ${event.timeEnd}` : ''}`
        : '';

      // Fetch RSVPs for this event
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
          })).filter(r => r.email);
        }
      } catch (err) {
        console.error(`Cron: failed to fetch RSVPs for event ${event.id}:`, err.message);
        continue;
      }

      if (!resend || rsvps.length === 0) continue;

      // Send reminder to each attendee
      for (const rsvp of rsvps) {
        try {
          await resend.emails.send({
            from: 'Manitou Beach <events@manitoubeach.com>',
            to: rsvp.email,
            subject: isToday
              ? `Happening today — ${event.name}`
              : `Reminder — ${event.name} is tomorrow`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
                <h1 style="color:#1A2830;font-size:20px;margin:0 0 8px;">
                  ${isToday ? '🎉 Happening today!' : '⏰ Reminder for tomorrow'}
                </h1>
                <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.7;">
                  ${rsvp.name ? `Hi ${rsvp.name} — ` : ''}don't forget, <strong>${event.name}</strong> is ${label}!
                </p>
                <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                  ${timeDisplay ? `<p style="margin:0 0 6px;color:#3B3228;font-size:14px;">🕐 ${timeDisplay}</p>` : ''}
                  ${event.location ? `<p style="margin:0;color:#3B3228;font-size:14px;">📍 ${event.location}</p>` : ''}
                </div>
                <p style="color:#8C806E;font-size:13px;line-height:1.6;">
                  See you there!
                </p>
                <p style="margin-top:24px;color:#8C806E;font-size:12px;">
                  <a href="https://manitoubeach.com/events" style="color:#5B7D8E;">Browse more events →</a>
                </p>
              </div>
            `,
          });
          totalSent++;
        } catch (emailErr) {
          console.error(`Cron: reminder email error for ${rsvp.email}:`, emailErr.message);
        }
      }
    }

    console.log(`Cron event reminders: sent ${totalSent} emails for ${events.length} events`);
    return res.status(200).json({ sent: totalSent, events: events.length });
  } catch (err) {
    console.error('Cron event reminders error:', err.message);
    return res.status(200).json({ sent: 0, error: err.message });
  }
}
