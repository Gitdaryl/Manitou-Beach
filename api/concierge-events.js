// Notion Events proxy for ElevenLabs voice concierge
// Returns upcoming events with ticket status, links, and voice-ready summaries

const DB_ID = process.env.NOTION_DB_EVENTS;
const TOKEN = process.env.NOTION_TOKEN_EVENTS;
const SITE   = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

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

function txt(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map(t => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
  return '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function mapEvent(page) {
  const p = page.properties;
  const name = txt(p['Event Name']);
  const date = p['Event date']?.date?.start || null;
  const dateEnd = p['Event date']?.date?.end || null;
  const time = txt(p['Time']);
  const timeEnd = txt(p['Time End']);
  const location = txt(p['Location']);
  const description = txt(p['Description']);
  const cost = txt(p['Cost']);
  const category = txt(p['Category']);
  const imageUrl = p['Image URL']?.url || null;
  const eventUrl = p['Event URL']?.url || null;
  const recurring = p['Recurring']?.select?.name || null;
  const recurringDay = p['Recurring Day']?.select?.name || null;
  const attendance = p['Attendance']?.select?.name || null;

  // Ticketing
  const ticketsEnabled = p['Tickets Enabled']?.checkbox || false;
  const ticketPrice = p['Ticket Price']?.number ?? null;
  const ticketCapacity = p['Ticket Capacity']?.number ?? null;
  const ticketsSold = p['Tickets Sold']?.number ?? 0;

  // Vendor registration
  const vendorRegEnabled = p['Vendor Reg Enabled']?.checkbox || false;

  // Build the event page link
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const eventPageUrl = `${SITE}/events`;

  // Ticket status
  let ticketStatus = 'none';
  let ticketsRemaining = null;
  if (ticketsEnabled && ticketCapacity) {
    ticketsRemaining = ticketCapacity - ticketsSold;
    if (ticketsRemaining <= 0) ticketStatus = 'sold_out';
    else if (ticketsRemaining <= 10) ticketStatus = 'almost_sold_out';
    else ticketStatus = 'available';
  } else if (ticketsEnabled) {
    ticketStatus = 'available';
  } else if (eventUrl) {
    ticketStatus = 'external';
  }

  return {
    name,
    date,
    dateEnd,
    dateFriendly: formatDate(date),
    time: time || null,
    timeEnd: timeEnd || null,
    location: location || null,
    description: description || null,
    cost: cost || 'Free',
    category: category || null,
    imageUrl,
    eventUrl,
    eventPageUrl,
    recurring,
    recurringDay,
    attendance,
    ticketsEnabled,
    ticketPrice,
    ticketStatus,
    ticketsRemaining,
    vendorRegEnabled,
  };
}

function buildVoiceSummary(events, weeklyEvents) {
  if (events.length === 0 && weeklyEvents.length === 0) {
    return "I don't see any upcoming events on the calendar right now. Click Events in the menu bar to check — new ones get added all the time.";
  }

  const parts = [];

  if (events.length > 0) {
    const next3 = events.slice(0, 3);
    parts.push(`There ${events.length === 1 ? 'is' : 'are'} ${events.length} upcoming event${events.length === 1 ? '' : 's'} on the calendar.`);
    next3.forEach(e => {
      let line = `${e.name} on ${e.dateFriendly}`;
      if (e.time) line += ` at ${e.time}`;
      if (e.location) line += `, at ${e.location}`;
      if (e.ticketsEnabled && e.ticketStatus === 'available') {
        line += e.ticketPrice ? ` — tickets are ${e.ticketPrice} dollars` : ' — tickets available';
        if (e.ticketsRemaining !== null && e.ticketsRemaining <= 20) line += ` and only ${e.ticketsRemaining} left`;
      } else if (e.ticketStatus === 'sold_out') {
        line += ' — sold out';
      } else if (e.ticketStatus === 'almost_sold_out') {
        line += ` — almost sold out, only ${e.ticketsRemaining} tickets left`;
      } else if (e.cost && e.cost !== 'Free') {
        line += ` — ${e.cost}`;
      } else {
        line += ' — free';
      }
      parts.push(line + '.');
    });
    if (events.length > 3) {
      parts.push(`Plus ${events.length - 3} more. Click Events in the menu bar to see them all.`);
    }
  }

  if (weeklyEvents.length > 0) {
    parts.push(`There ${weeklyEvents.length === 1 ? 'is also' : 'are also'} ${weeklyEvents.length} recurring event${weeklyEvents.length === 1 ? '' : 's'}.`);
    weeklyEvents.slice(0, 2).forEach(e => {
      let line = `${e.name}`;
      if (e.recurringDay) line += ` every ${e.recurringDay}`;
      if (e.time) line += ` at ${e.time}`;
      if (e.location) line += `, at ${e.location}`;
      parts.push(line + '.');
    });
  }

  return parts.join(' ');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pages = await queryAllNotionPages(DB_ID, TOKEN, {
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Approved' } },
          { property: 'Status', status: { equals: 'Published' } },
        ],
      },
      sorts: [{ property: 'Event date', direction: 'ascending' }],
    });

    const today = new Date().toISOString().slice(0, 10);
    const allEvents = pages.map(mapEvent);

    // Split into upcoming one-time and recurring
    const upcoming = allEvents.filter(e =>
      !e.recurring && e.date && e.date >= today
    );
    const weekly = allEvents.filter(e =>
      e.recurring === 'Weekly' || e.recurring === 'Monthly'
    );

    const summary = buildVoiceSummary(upcoming, weekly);

    // Optional search query — the concierge can ask for a specific event
    const q = (req.query.q || '').toLowerCase().trim();
    let matched = null;
    if (q) {
      matched = allEvents.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q))
      );
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=120');
    return res.status(200).json({
      upcoming: upcoming.slice(0, 10),
      recurring: weekly,
      matched: matched ? matched.slice(0, 5) : undefined,
      total: upcoming.length,
      summary,
      source: 'notion',
    });
  } catch (err) {
    console.error('Concierge events error:', err.message);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json({
      upcoming: [],
      recurring: [],
      total: 0,
      summary: "I'm having trouble pulling up the events calendar right now. Click Events in the menu bar to see everything that's coming up.",
      source: 'error',
    });
  }
}
