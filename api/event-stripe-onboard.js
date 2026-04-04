// /api/event-stripe-onboard.js
// Called after SMS verification for platform_ticketing and vendor_market events.
// Creates a Stripe Express account, stores the Account ID on the event record,
// and returns an onboarding URL to redirect the organizer to Stripe.

import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { eventPageId, orgName, orgEmail, eventType } = req.body || {};

  if (!eventPageId || !orgName) {
    return res.status(400).json({ error: 'eventPageId and orgName are required.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment system not configured.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    // Create Stripe Express account for the organizer
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      ...(orgEmail ? { email: orgEmail } : {}),
      metadata: { orgName, eventPageId, eventType: eventType || 'unknown' },
    });

    // Store the Stripe Account ID on the event record immediately
    const patchRes = await fetch(`https://api.notion.com/v1/pages/${eventPageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          'Stripe Account ID': { rich_text: [{ text: { content: account.id } }] },
        },
      }),
    });

    if (!patchRes.ok) {
      console.error('event-stripe-onboard Notion patch failed:', await patchRes.text());
      // Non-fatal - proceed with onboarding, Stripe account exists
    }

    // Build return and refresh URLs carrying the event context
    const params = new URLSearchParams({ acct: account.id, eventPageId, eventType: eventType || 'free' });
    const returnUrl  = `${baseUrl}/api/event-stripe-return?${params}`;
    const refreshUrl = `${baseUrl}/api/event-stripe-refresh?${params}`;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: refreshUrl,
    });

    return res.status(200).json({ ok: true, onboardingUrl: accountLink.url });

  } catch (err) {
    console.error('event-stripe-onboard error:', err.message);
    return res.status(500).json({ error: 'Failed to start payment onboarding. Please try again.' });
  }
}
