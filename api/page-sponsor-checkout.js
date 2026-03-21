// Page Sponsorship Checkout
// Creates a Stripe subscription for an exclusive page sponsorship slot.
// Monthly: $97/mo | Annual: $970/year
import Stripe from 'stripe';

const PRICES = {
  monthly: { amount: 9700, interval: 'month', label: '$97/month' },
  annual:  { amount: 97000, interval: 'year',  label: '$970/year' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pageId, pageName, businessName, email, phone, tagline, logoUrl, term, betaSponsor, _hp } = req.body || {};
  if (_hp) return res.status(200).json({ url: null });

  if (!pageId || !pageName || !businessName || !email || !term) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const price = PRICES[term];
  if (!price) return res.status(400).json({ error: 'Invalid term — must be monthly or annual' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment system not configured.' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.SITE_URL || 'https://manitou-beach.vercel.app';

    // Beta founding sponsors get 1 free month (13 months annual / first month free monthly)
    const isBeta = !!betaSponsor && Date.now() < new Date('2026-04-10T16:00:00Z').getTime();
    const bonusMonths = isBeta ? 1 : 0;

    // Calculate expiry for display on success screen
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (term === 'annual' ? 12 : 1) + bonusMonths);
    const expiryDate = expiry.toISOString().split('T')[0];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: isBeta
              ? `Page Sponsorship — ${pageName} · Beta Founding Sponsor`
              : `Page Sponsorship — ${pageName}`,
            description: isBeta
              ? `${term === 'annual' ? '13 months (1 free beta month included)' : 'First month free — beta founding sponsor'} · ${price.label}`
              : `Exclusive sponsor placement · ${pageName} · ${price.label}`,
          },
          unit_amount: price.amount,
          recurring: { interval: price.interval },
        },
        quantity: 1,
      }],
      metadata: {
        type: 'page_sponsorship',
        pageId,
        pageName,
        businessName,
        email,
        phone: phone || '',
        tagline: tagline || '',
        logoUrl: logoUrl || '',
        term,
        ...(isBeta && { beta: 'true' }),
      },
      success_url: `${siteUrl}/business?ps=1&page=${encodeURIComponent(pageName)}&biz=${encodeURIComponent(businessName)}&term=${term}&exp=${expiryDate}#page-sponsorship`,
      cancel_url:  `${siteUrl}/business#page-sponsorship`,
      ...(isBeta && { subscription_data: { trial_period_days: 30 } }),
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('page-sponsor-checkout error:', err);
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
}
