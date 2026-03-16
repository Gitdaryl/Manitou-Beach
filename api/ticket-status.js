// GET /api/ticket-status?event=NOTION_PAGE_ID
// Public endpoint — returns ticket availability for an event

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const eventId = req.query.event;
  if (!eventId) {
    return res.status(400).json({ error: 'Missing event ID' });
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');

  try {
    const eventRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!eventRes.ok) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = await eventRes.json();
    const p = event.properties;

    const ticketsEnabled = p['Tickets Enabled']?.checkbox || false;
    const capacity = p['Ticket Capacity']?.number || 0;
    const soldCount = p['Tickets Sold']?.number || 0;
    const price = p['Ticket Price']?.number || 0;

    return res.status(200).json({
      ticketsEnabled,
      price,
      capacity,
      sold: soldCount,
      remaining: capacity > 0 ? Math.max(0, capacity - soldCount) : null,
      soldOut: capacity > 0 && soldCount >= capacity,
    });
  } catch (err) {
    console.error('Ticket status error:', err.message);
    return res.status(500).json({ error: 'Failed to check availability' });
  }
}
