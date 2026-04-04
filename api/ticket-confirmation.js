import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Not configured' });

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const metadata = session.metadata || {};
    const paymentIntentId = session.payment_intent;
    const buyerEmail = session.customer_email || session.customer_details?.email || '';

    // Ticket ID is pre-generated at checkout time - available immediately
    let ticketId = metadata.ticketId || null;
    let pdfUrl = null;

    try {
      const notionRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_TICKETS}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            property: 'Stripe Payment ID',
            rich_text: { equals: paymentIntentId || session.id },
          },
        }),
      });
      const notionData = await notionRes.json();
      if (notionData.results?.length > 0) {
        const props = notionData.results[0].properties;
        pdfUrl = props['PDF URL']?.url || null;
      }
    } catch (notionErr) {
      console.error('Notion lookup error:', notionErr.message);
    }

    return res.status(200).json({
      ticketId,
      pdfUrl,
      eventName: metadata.eventName || 'Event',
      eventDate: metadata.eventDate || '',
      eventTime: metadata.eventTime || '',
      eventLocation: metadata.eventLocation || '',
      buyerName: metadata.buyerName || 'Guest',
      quantity: parseInt(metadata.quantity, 10) || 1,
      email: buyerEmail,
    });
  } catch (err) {
    console.error('ticket-confirmation error:', err.message);
    return res.status(500).json({ error: 'Could not retrieve ticket info' });
  }
}
