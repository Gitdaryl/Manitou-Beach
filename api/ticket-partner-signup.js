import Stripe from 'stripe';

// In-memory rate limit store — max 3 Stripe account creations per IP per hour
// Resets per serverless instance but still meaningfully deters bot bursts
const _rl = new Map();
function checkRateLimit(ip) {
  const now = Date.now();
  const WINDOW = 60 * 60 * 1000; // 1 hour
  const MAX = 3;
  const entry = _rl.get(ip) || { count: 0, resetAt: now + WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW; }
  entry.count++;
  _rl.set(ip, entry);
  return entry.count <= MAX;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orgName, contactName, email, phone, notes, _hp } = req.body || {};

  // Honeypot — bots fill hidden fields, humans don't
  if (_hp) return res.status(200).json({ ok: true, onboardingUrl: null });

  // Rate limit by IP
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  if (!orgName || !contactName || !email || !email.includes('@')) {
    return res.status(400).json({ error: 'Organization name, contact name, and a valid email are required.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment system not configured.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 1. Create a Stripe Express connected account for the org
  let account;
  try {
    account = await stripe.accounts.create({
      type: 'express',
      email: email.trim(),
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { orgName: orgName.trim() },
    });
  } catch (err) {
    console.error('Stripe account creation error:', err.message);
    return res.status(500).json({ error: 'Failed to create payment account. Please try again.' });
  }

  // 2. Record in Notion Ticket Partners DB
  try {
    const notesText = [notes || ''].filter(Boolean).join('\n');
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_TICKET_PARTNERS },
        properties: {
          'Org Name':             { title: [{ text: { content: orgName.trim() } }] },
          'Contact Name':         { rich_text: [{ text: { content: contactName.trim() } }] },
          'Email':                { email: email.trim() },
          'Phone':                { phone_number: (phone || '').trim() || null },
          'Stripe Account ID':    { rich_text: [{ text: { content: account.id } }] },
          'Onboarding Complete':  { checkbox: false },
          'Status':               { select: { name: 'Pending' } },
          'Notes':                { rich_text: [{ text: { content: notesText } }] },
          'Created At':           { date: { start: new Date().toISOString() } },
        },
      }),
    });
  } catch (err) {
    console.error('ticket-partner-signup Notion error:', err.message);
  }

  // 3. Create an Account Link for Stripe-hosted onboarding
  const baseUrl = process.env.SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000';

  try {
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      refresh_url: `${baseUrl}/api/stripe-connect-refresh?acct=${account.id}`,
      return_url: `${baseUrl}/api/stripe-connect-return?acct=${account.id}`,
    });

    return res.status(200).json({ ok: true, onboardingUrl: accountLink.url });
  } catch (err) {
    console.error('Stripe account link error:', err.message);
    return res.status(500).json({ error: 'Failed to start onboarding. Please try again.' });
  }
}
