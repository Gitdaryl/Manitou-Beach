// GET /api/ticket-verify?id=MB-XXXXXX
// Check-in verification - scanned by volunteers at the door
// Returns: { status: 'valid'|'used'|'invalid', ticket?, usedAt? }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ticketId = req.query.id;
  if (!ticketId) {
    return res.status(400).json({ status: 'invalid', error: 'No ticket ID provided' });
  }

  if (!process.env.NOTION_TOKEN_EVENTS || !process.env.NOTION_DB_TICKETS) {
    return res.status(500).json({ status: 'error', error: 'Ticketing not configured' });
  }

  try {
    // Query Notion Tickets DB for this ticket ID
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_TICKETS}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: { property: 'Ticket ID', title: { equals: ticketId } },
      }),
    });

    if (!queryRes.ok) {
      console.error('Notion query error:', await queryRes.text());
      return res.status(500).json({ status: 'error', error: 'Database error' });
    }

    const data = await queryRes.json();
    if (!data.results || data.results.length === 0) {
      return res.status(200).json({ status: 'invalid' });
    }

    const ticket = data.results[0];
    const p = ticket.properties;
    const currentStatus = p['Status']?.select?.name || 'Unknown';
    const buyerName = p['Buyer Name']?.rich_text?.[0]?.text?.content || '';
    const eventName = p['Event Name']?.rich_text?.[0]?.text?.content || '';
    const quantity = p['Quantity']?.number || 1;
    const usedAt = p['Used At']?.date?.start || null;

    // Already used
    if (currentStatus === 'Used') {
      return res.status(200).json({
        status: 'used',
        ticketId,
        buyerName,
        eventName,
        quantity,
        usedAt,
      });
    }

    // Refunded
    if (currentStatus === 'Refunded') {
      return res.status(200).json({ status: 'invalid', reason: 'refunded', ticketId });
    }

    // Valid - mark as used
    const now = new Date().toISOString();
    await fetch(`https://api.notion.com/v1/pages/${ticket.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          'Status': { select: { name: 'Used' } },
          'Used At': { date: { start: now } },
        },
      }),
    });

    return res.status(200).json({
      status: 'valid',
      ticketId,
      buyerName,
      eventName,
      quantity,
      usedAt: now,
    });
  } catch (err) {
    console.error('Ticket verify error:', err.message);
    return res.status(500).json({ status: 'error', error: 'Verification failed' });
  }
}
