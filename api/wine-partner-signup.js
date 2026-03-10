import Stripe from 'stripe';

const PLANS = {
  annual_bundle: {
    label: 'Wine Trail Partner — Annual + Starter Kit',
    amount: 27900,
    mode: 'payment',
    desc: 'Full year of trail participation, 100 stamp cards (6×4), counter display insert, QR code setup, delivered.',
  },
  monthly: {
    label: 'Wine Trail Partner — Monthly',
    amount: 2900,
    mode: 'subscription',
    desc: 'Full trail participation — scorecard, passport, map pin, awards eligibility. Cancel anytime.',
  },
  refill: {
    label: 'Wine Trail Card Refill — 100 Cards',
    amount: 2900,
    mode: 'payment',
    desc: 'Refill pack of 100 stamp cards (same design). No counter display needed.',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { venueName, contactName, email, phone, plan, note } = req.body || {};

  if (!venueName || !contactName || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Venue name, your name, and a valid email are required.' });
  }
  if (!['annual_bundle', 'monthly', 'refill', 'digital'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selection.' });
  }

  // Always record in Notion regardless of plan
  try {
    const notesText = [`Wine Partner Signup — Plan: ${plan}`, note || ''].filter(Boolean).join('\n');
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
    // Don't block the payment flow on a Notion failure
  }

  // Digital-only — nothing to charge
  if (plan === 'digital') {
    return res.status(200).json({ ok: true });
  }

  // All paid plans → Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment system not configured. Please email admin@yetigroove.com to arrange your partnership.' });
  }

  const planConfig = PLANS[plan];
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const baseUrl = process.env.SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';

    const lineItem = planConfig.mode === 'subscription'
      ? {
          price_data: {
            currency: 'usd',
            product_data: { name: planConfig.label, description: `${planConfig.desc} — ${venueName}` },
            unit_amount: planConfig.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }
      : {
          price_data: {
            currency: 'usd',
            product_data: { name: planConfig.label, description: `${planConfig.desc} — ${venueName}` },
            unit_amount: planConfig.amount,
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: planConfig.mode === 'subscription' ? 'subscription' : 'payment',
      customer_email: email,
      line_items: [lineItem],
      metadata: { venueName, contactName, plan, phone: phone || '', note: note || '' },
      success_url: `${baseUrl}/wine-partner?joined=1`,
      cancel_url:  `${baseUrl}/wine-partner#signup`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('wine-partner-signup Stripe error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again or email admin@yetigroove.com.' });
  }
}
