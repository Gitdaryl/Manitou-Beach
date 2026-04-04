import Stripe from 'stripe';

// Platform fee: 1.25% per ticket (deducted from org's payout via Stripe Connect)
const PLATFORM_FEE_PERCENT = 0.0125;

// Pre-generate ticket ID so it's available immediately on the success page
function generateTicketNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'MB-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment system is not configured yet.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { eventId, quantity, buyerName, email, phone } = req.body;

  if (!eventId || !quantity || !buyerName || !email) {
    return res.status(400).json({ error: 'Missing required fields: eventId, quantity, buyerName, email' });
  }

  const qty = parseInt(quantity, 10);
  if (qty < 1 || qty > 20) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 20' });
  }

  // Fetch event from Notion to get price, capacity, sold count
  try {
    const eventRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
    });

    if (!eventRes.ok) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = await eventRes.json();
    const p = event.properties;

    const ticketsEnabled = p['Tickets Enabled']?.checkbox;
    if (!ticketsEnabled) {
      return res.status(400).json({ error: 'Tickets are not available for this event' });
    }

    const priceRaw = p['Ticket Price']?.number;
    if (!priceRaw || priceRaw <= 0) {
      return res.status(400).json({ error: 'Ticket price not configured for this event' });
    }

    const capacity = p['Ticket Capacity']?.number || 0;
    const soldCount = p['Tickets Sold']?.number || 0;
    const eventName = p['Event Name']?.title?.[0]?.text?.content || 'Event';
    const eventDate = p['Event date']?.date?.start || '';
    const eventTime = p['Time']?.rich_text?.[0]?.text?.content || '';
    const eventLocation = p['Location']?.rich_text?.[0]?.text?.content || '';
    const ticketPartner = p['Ticket Partner']?.rich_text?.[0]?.text?.content || '';

    // Require a connected Stripe Express account - no account, no tickets
    if (!ticketPartner) {
      return res.status(400).json({ error: 'Ticket sales not configured for this event. Contact the organizer.' });
    }

    let connectedAccountId = null;
    try {
      const partnerRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_TICKET_PARTNERS}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Org Name', title: { equals: ticketPartner } },
              { property: 'Status', select: { equals: 'Active' } },
            ],
          },
        }),
      });
      const partnerData = await partnerRes.json();
      if (partnerData.results?.length > 0) {
        connectedAccountId = partnerData.results[0].properties['Stripe Account ID']?.rich_text?.[0]?.text?.content || null;
      }
    } catch (err) {
      console.error('Partner lookup error:', err.message);
    }

    if (!connectedAccountId) {
      return res.status(400).json({ error: 'Payment account not set up for this organizer. Contact the event organizer.' });
    }

    // Check capacity
    if (capacity > 0 && (soldCount + qty) > capacity) {
      const remaining = Math.max(0, capacity - soldCount);
      return res.status(400).json({
        error: remaining === 0
          ? 'This event is sold out'
          : `Only ${remaining} ticket${remaining === 1 ? '' : 's'} remaining`,
        remaining,
      });
    }

    // Compute price in cents (server-side - never trust client-sent prices)
    const unitAmountCents = Math.round(priceRaw * 100);

    const baseUrl = process.env.SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Ticket: ${eventName}`,
            description: [
              eventDate && `Date: ${eventDate}`,
              eventTime && `Time: ${eventTime}`,
              eventLocation && `Location: ${eventLocation}`,
              `Qty: ${qty}`,
            ].filter(Boolean).join(' | '),
          },
          unit_amount: unitAmountCents,
        },
        quantity: qty,
      }],
      metadata: {
        type: 'ticket',
        ticketId: generateTicketNumber(),
        eventId,
        eventName,
        eventDate,
        eventTime,
        eventLocation,
        buyerName,
        phone: phone || '',
        quantity: String(qty),
        ticketPartner: ticketPartner || '',
      },
      success_url: `${baseUrl}/ticket-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/happening`,
    };

    // Always route through Express Connect - platform fee to Daryl, rest to organizer
    const totalCents = unitAmountCents * qty;
    const applicationFee = Math.round(totalCents * PLATFORM_FEE_PERCENT);
    sessionParams.payment_intent_data = {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: connectedAccountId,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Ticket checkout error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
