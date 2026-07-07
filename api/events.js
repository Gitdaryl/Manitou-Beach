import { sendSMSFull } from './lib/twilio.js';

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

// Derive how likely an event is to change/cancel, so proactive check-ins only
// target the events that actually need them (e.g. weather-exposed outdoor markets).
const LOW_RISK_CATEGORIES = new Set(['Live Music', 'Arts & Culture', 'Community', 'Food & Social']);
const HIGH_RISK_CATEGORIES = new Set(['Markets & Vendors', 'Sports & Outdoors', 'Boating & Water']);
function deriveChangeRisk(category, outdoors) {
  if (outdoors) return 'high';
  if (HIGH_RISK_CATEGORIES.has(category)) return 'high';
  if (LOW_RISK_CATEGORIES.has(category)) return 'low';
  return 'medium';
}

// Surface events-feed outages loudly instead of silently serving an empty page.
// (A blanked NOTION_TOKEN_EVENTS once made the live /events page look like "no events".)
let lastEventsAlertAt = 0;
const EVENTS_ALERT_COOLDOWN_MS = 30 * 60 * 1000; // throttle so a sustained outage can't storm SMS
async function alertEventsOutage(detail) {
  const now = Date.now();
  if (now - lastEventsAlertAt < EVENTS_ALERT_COOLDOWN_MS) return;
  lastEventsAlertAt = now;
  const to = process.env.ADMIN_PHONE;
  if (!to) return;
  try {
    await sendSMSFull(to, `⚠️ Manitou Beach: the public Events feed is DOWN (${detail}). The /events page is empty until fixed — check NOTION_TOKEN_EVENTS in Vercel.`);
  } catch (_) { /* never let alerting break the response */ }
}

export default async function handler(req, res) {
  // Event submissions go through /api/submit-event (SMS-verified + moderated).
  // The old instant-publish POST path was removed here. It set Status:'Published'
  // directly and bypassed verification, letting anyone spam the public calendar.
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Submit events via /api/submit-event.' });
  }

  // GET - fetch approved/published events
  // Fail fast + loudly on missing config (e.g. a blanked NOTION_TOKEN_EVENTS) instead of
  // serving an empty 200 that looks identical to "no events scheduled".
  if (!process.env.NOTION_TOKEN_EVENTS || !process.env.NOTION_DB_EVENTS) {
    console.error('Events config missing', { tokenSet: !!process.env.NOTION_TOKEN_EVENTS, dbSet: !!process.env.NOTION_DB_EVENTS });
    await alertEventsOutage('NOTION_TOKEN_EVENTS or NOTION_DB_EVENTS not set');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'events_unavailable', reason: 'config', events: [], recurring: [] });
  }
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  try {
    const queryBody = {
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Approved' } },
          { property: 'Status', status: { equals: 'Published' } },
        ],
      },
      sorts: [{ property: 'Event date', direction: 'ascending' }],
    };

    let pages;
    try {
      pages = await queryAllNotionPages(process.env.NOTION_DB_EVENTS, process.env.NOTION_TOKEN_EVENTS, queryBody);
    } catch (err) {
      console.error('Notion query failed:', err.message);
      const isAuth = /\b401\b|unauthorized|API token is invalid|restricted from accessing/i.test(err.message);
      await alertEventsOutage(isAuth ? 'Notion auth failed (401 / invalid token)' : 'Notion query failed');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(503).json({ error: 'events_unavailable', reason: isAuth ? 'auth' : 'query', events: [], recurring: [] });
    }

    // "Today" as a Michigan calendar day (YYYY-MM-DD). Comparing date strings avoids
    // both the UTC-midnight bug (events vanishing at 8pm ET) and DST offset math.
    const todayET = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit' }).format(new Date());

    const allEvents = pages
      .map(page => {
        const p = page.properties;
        // Normalize to a bare date. If an admin toggles "include time" in Notion, start
        // becomes a full ISO timestamp; slicing keeps date math from producing Invalid Date.
        const dateStr = (p['Event date']?.date?.start || '').slice(0, 10);
        const recurringVal = p['Recurring']?.select?.name || null;
        const desc = p['Description']?.rich_text?.[0]?.text?.content || '';
        // Fall back to parsing "Runs until: YYYY-MM-DD" from description if Notion date has no end
        const notionDateEnd = p['Event date']?.date?.end || null;
        const parsedEnd = !notionDateEnd && desc.match(/Runs until:?\s*(\d{4}-\d{2}-\d{2})/i)?.[1] || null;
        return {
          id: page.id,
          name: p['Event Name']?.title?.[0]?.text?.content || '',
          date: dateStr || '',
          dateEnd: notionDateEnd || parsedEnd,
          category: p['Category']?.rich_text?.[0]?.text?.content || 'Community',
          description: p['Description']?.rich_text?.[0]?.text?.content || '',
          time: (() => {
            // Prefer dedicated 'Time' field (admin-entered); fall back to start portion of 'Time End'
            const notionTime = p['Time']?.rich_text?.[0]?.text?.content || '';
            if (notionTime) return notionTime;
            const raw = p['Time End']?.rich_text?.[0]?.text?.content || '';
            return raw.includes(' – ') ? raw.split(' – ')[0].trim() : raw;
          })(),
          location: p['Location']?.rich_text?.[0]?.text?.content || '',
          imageUrl: normalizeUrl(p['Image URL']?.url || null),
          email: p['Email']?.email || '',
          eventUrl: normalizeUrl(p['Event URL']?.url || null),
          cost: p['Cost']?.rich_text?.[0]?.text?.content || null,
          recurring: recurringVal,
          recurringDay: p['Recurring Day']?.select?.name || null,
          timeEnd: (() => {
            const raw = p['Time End']?.rich_text?.[0]?.text?.content || null;
            if (!raw) return null;
            return raw.includes(' – ') ? raw.split(' – ')[1].trim() : null;
          })(),
          attendance: p['Attendance']?.select?.name || null,
          lifecycle: p['Lifecycle']?.select?.name || 'Active',
          outdoors: p['Outdoors']?.checkbox || false,
          changeNote: p['Change Note']?.rich_text?.[0]?.text?.content || '',
          changeRisk: deriveChangeRisk(
            p['Category']?.rich_text?.[0]?.text?.content || 'Community',
            p['Outdoors']?.checkbox || false
          ),
          updated: p['Updated']?.checkbox || false,
          rsvpEnabled: p['RSVP Enabled']?.checkbox || false,
          heroFeature: p['Hero Feature']?.checkbox || false,
          promoType: p['Promo Type']?.select?.name || null,
          promoEnd: p['Promo End']?.date?.start || null,
          ticketsEnabled: p['Tickets Enabled']?.checkbox || false,
          ticketPrice: p['Ticket Price']?.number || null,
          ticketCapacity: p['Ticket Capacity']?.number || null,
          ticketsSold: p['Tickets Sold']?.number || 0,
          rsvpCapacity: p['RSVP Capacity']?.number || 0,
          rsvpsCount: p['RSVPs Count']?.number || 0,
          vendorRegEnabled: p['Vendor Reg Enabled']?.checkbox || false,
          videoUrl: normalizeUrl(p['Video URL']?.url || null),
        };
      })
      .filter(e => e.name)
      // 'Paused' events are quietly pulled from the public site (organizer may resume later).
      // 'Cancelled' / 'Postponed' stay visible with a ribbon so attendees get the heads-up.
      .filter(e => e.lifecycle !== 'Paused');

    const recurring = allEvents.filter(e => e.recurring === 'Weekly' || e.recurring === 'Monthly');
    const events = allEvents
      .filter(e => e.recurring !== 'Weekly' && e.recurring !== 'Monthly')
      .filter(e => {
        if (!e.date) return false;
        return e.date >= todayET; // keep events through the end of their Michigan calendar day
      });

    return res.status(200).json({ events, recurring });
  } catch (err) {
    console.error('Events API error:', err.message);
    await alertEventsOutage('Unexpected events API error');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'events_unavailable', reason: 'server', events: [], recurring: [] });
  }
}
