// /api/event-stripe-refresh.js
// Called when a Stripe Express onboarding session expires mid-flow.
// Regenerates the account link with event-specific return/refresh URLs
// and redirects the organizer back to Stripe to continue.

import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const { acct, eventPageId, eventType } = req.query;

  if (!acct || !acct.startsWith('acct_')) {
    return res.redirect('/submit-event?error=invalid');
  }

  const baseUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const params = new URLSearchParams({ acct, eventPageId: eventPageId || '', eventType: eventType || 'free' });
    const returnUrl  = `${baseUrl}/api/event-stripe-return?${params}`;
    const refreshUrl = `${baseUrl}/api/event-stripe-refresh?${params}`;

    const accountLink = await stripe.accountLinks.create({
      account: acct,
      type: 'account_onboarding',
      return_url: returnUrl,
      refresh_url: refreshUrl,
    });

    return res.redirect(accountLink.url);
  } catch (err) {
    console.error('event-stripe-refresh error:', err.message);
    return res.redirect('/submit-event?error=refresh');
  }
}
