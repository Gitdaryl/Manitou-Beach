// GET /api/organizer-dashboard?token=X&event=Y
// Returns event stats + ticket buyer list for the organizer dashboard.
// Auth: validates Edit Token on the event record (same token organizers use to edit).

const PLATFORM_FEE_PERCENT = 0.0125;
const STRIPE_PROCESSING_PERCENT = 0.029;
const STRIPE_FIXED_CENTS = 30;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token, event: eventId } = req.query;
  if (!token || !eventId) return res.status(400).json({ error: 'Missing token or event id' });

  if (!process.env.NOTION_TOKEN_EVENTS || !process.env.NOTION_DB_TICKETS) {
    return res.status(500).json({ error: 'Ticketing not configured' });
  }

  try {
    // 1. Fetch event + validate Edit Token
    const eventRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!eventRes.ok) return res.status(404).json({ error: 'Event not found' });

    const event = await eventRes.json();
    const p = event.properties;
    const storedToken = p['Edit Token']?.rich_text?.[0]?.plain_text;

    if (!storedToken || storedToken !== token) {
      return res.status(403).json({ error: 'Invalid access token' });
    }

    const eventName = p['Event Name']?.title?.[0]?.plain_text || p['Name']?.title?.[0]?.plain_text || 'Event';
    const eventDate = p['Event date']?.date?.start || '';
    const ticketPrice = p['Ticket Price']?.number || 0;
    const ticketCapacity = p['Ticket Capacity']?.number || 0;
    const ticketsSoldCount = p['Tickets Sold']?.number || 0;
    const ticketPartner = p['Ticket Partner']?.rich_text?.[0]?.plain_text || '';

    // 2. Fetch all tickets for this event (paginated - Notion caps at 100 per request)
    let allTickets = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const body = {
        filter: { property: 'Event Page ID', rich_text: { equals: eventId } },
        sorts: [{ property: 'Created At', direction: 'descending' }],
        page_size: 100,
      };
      if (startCursor) body.start_cursor = startCursor;

      const ticketRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_TICKETS}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(body),
      });

      if (!ticketRes.ok) {
        console.error('Ticket query error:', await ticketRes.text());
        return res.status(500).json({ error: 'Failed to fetch tickets' });
      }

      const ticketData = await ticketRes.json();
      allTickets = allTickets.concat(ticketData.results);
      hasMore = ticketData.has_more;
      startCursor = ticketData.next_cursor;
    }

    // 3. Parse tickets into clean objects + compute stats
    let totalQuantity = 0;
    let checkedInCount = 0;

    const buyers = allTickets.map(t => {
      const tp = t.properties;
      const qty = tp['Quantity']?.number || 1;
      const status = tp['Status']?.select?.name || 'Valid';

      totalQuantity += qty;
      if (status === 'Used') checkedInCount += qty;

      return {
        ticketId: tp['Ticket ID']?.title?.[0]?.plain_text || '',
        buyerName: tp['Buyer Name']?.rich_text?.[0]?.plain_text || '',
        email: tp['Email']?.email || '',
        phone: tp['Phone']?.phone_number || '',
        quantity: qty,
        status,
        purchasedAt: tp['Created At']?.date?.start || '',
        usedAt: tp['Used At']?.date?.start || null,
        pdfUrl: tp['PDF URL']?.url || '',
      };
    });

    // 4. Revenue breakdown
    const grossRevenue = totalQuantity * ticketPrice;
    const stripeProcessing = allTickets.reduce((sum, t) => {
      const qty = t.properties['Quantity']?.number || 1;
      const ticketTotal = qty * ticketPrice;
      return sum + (ticketTotal * STRIPE_PROCESSING_PERCENT) + (STRIPE_FIXED_CENTS / 100);
    }, 0);
    const platformFee = grossRevenue * PLATFORM_FEE_PERCENT;
    const netPayout = grossRevenue - stripeProcessing - platformFee;

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      eventName,
      eventDate,
      ticketPrice,
      ticketCapacity,
      ticketsSold: ticketsSoldCount,
      totalQuantity,
      checkedIn: checkedInCount,
      ticketPartner,
      revenue: {
        gross: Math.round(grossRevenue * 100) / 100,
        stripeProcessing: Math.round(stripeProcessing * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        netPayout: Math.round(netPayout * 100) / 100,
      },
      buyers,
    });

  } catch (err) {
    console.error('organizer-dashboard error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard' });
  }
}
