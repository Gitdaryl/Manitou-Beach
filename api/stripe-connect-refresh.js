import Stripe from 'stripe';

// Called when a Stripe Express onboarding session expires or needs to be restarted.
// Generates a new Account Link and redirects the org back to Stripe's onboarding form.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const acct = req.query.acct;
  if (!acct || !acct.startsWith('acct_')) {
    return res.redirect('/ticket-services?error=invalid');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.redirect('/ticket-services?error=config');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = process.env.SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000';

  try {
    const accountLink = await stripe.accountLinks.create({
      account: acct,
      type: 'account_onboarding',
      refresh_url: `${baseUrl}/api/stripe-connect-refresh?acct=${acct}`,
      return_url: `${baseUrl}/api/stripe-connect-return?acct=${acct}`,
    });

    return res.redirect(accountLink.url);
  } catch (err) {
    console.error('stripe-connect-refresh error:', err.message);
    return res.redirect('/ticket-services?error=refresh');
  }
}
