import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { venueName, contactName, email, phone, note, reserveOnly } = req.body || {};

  if (!venueName || !contactName || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Venue name, your name, and a valid email are required.' });
  }

  // Reserve-only path — skip Stripe, save to Notion with Status=Reserved
  if (reserveOnly === true) {
    try {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DB_WEBSITE_INQUIRIES },
          properties: {
            'Name':         { title: [{ text: { content: contactName } }] },
            'Business':     { rich_text: [{ text: { content: venueName } }] },
            'Email':        { email },
            'Notes':        { rich_text: [{ text: { content: 'Wine Trail Reserve — 2026 Season (not yet paid)' } }] },
            'Submitted At': { date: { start: new Date().toISOString() } },
            'Status':       { select: { name: 'Reserved' } },
          },
        }),
      });
      return res.status(200).json({ ok: true, reserved: true });
    } catch (err) {
      console.error('wine-partner-signup reserve error:', err.message);
      return res.status(500).json({ error: 'Could not save reservation. Please email admin@yetigroove.com.' });
    }
  }

  // Record in Notion
  try {
    const notesText = ['Wine Trail Partner Signup — 2026 Season', note || ''].filter(Boolean).join('\n');
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_WEBSITE_INQUIRIES },
        properties: {
          'Name':         { title: [{ text: { content: contactName } }] },
          'Business':     { rich_text: [{ text: { content: venueName } }] },
          'Email':        { email },
          'Phone':        { phone_number: (phone || '').trim() || null },
          'Notes':        { rich_text: [{ text: { content: notesText } }] },
          'Submitted At': { date: { start: new Date().toISOString() } },
          'Status':       { select: { name: 'New' } },
        },
      }),
    });
  } catch (err) {
    console.error('wine-partner-signup Notion error:', err.message);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment system not configured. Please email admin@yetigroove.com.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const baseUrl = process.env.SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Manitou Beach Wine Trail Partner — 2026 Season',
            description: `May 22 – October 31, 2026. Includes trail map pin, community scorecard, passport gamification, verified reviews, 100 stamp cards, counter display, QR setup, and season-end award plaque. — ${venueName}`,
          },
          unit_amount: 27900,
        },
        quantity: 1,
      }],
      metadata: { venueName, contactName, phone: phone || '', note: note || '' },
      success_url: `${baseUrl}/wine-partner?joined=1`,
      cancel_url:  `${baseUrl}/wine-partner#signup`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('wine-partner-signup Stripe error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again or email admin@yetigroove.com.' });
  }
}
