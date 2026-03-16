// GET /api/ticket-pdf?id=MB-XXXXXX
// Returns the stored PDF URL for a ticket (for re-download)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ticketId = req.query.id;
  if (!ticketId) {
    return res.status(400).json({ error: 'No ticket ID provided' });
  }

  if (!process.env.NOTION_TOKEN_EVENTS || !process.env.NOTION_DB_TICKETS) {
    return res.status(500).json({ error: 'Ticketing not configured' });
  }

  try {
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
      return res.status(500).json({ error: 'Database error' });
    }

    const data = await queryRes.json();
    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = data.results[0];
    const pdfUrl = ticket.properties['PDF URL']?.url;

    if (!pdfUrl) {
      return res.status(404).json({ error: 'PDF not available for this ticket' });
    }

    // Redirect to the Vercel Blob URL
    return res.redirect(302, pdfUrl);
  } catch (err) {
    console.error('Ticket PDF error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve ticket' });
  }
}
