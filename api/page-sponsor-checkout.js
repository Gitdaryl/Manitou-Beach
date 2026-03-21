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

  const { pageId, pageName, businessName, email, phone, tagline, logoUrl, term, _hp } = req.body || {};
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

    // Calculate expiry for display on success screen
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (term === 'annual' ? 12 : 1));
    const expiryDate = expiry.toISOString().split('T')[0];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Page Sponsorship — ${pageName}`,
            description: `Exclusive sponsor placement · ${pageName} · ${price.label}`,
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
      },
      success_url: `${siteUrl}/business?ps=1&page=${encodeURIComponent(pageName)}&biz=${encodeURIComponent(businessName)}&term=${term}&exp=${expiryDate}#page-sponsorship`,
      cancel_url:  `${siteUrl}/business#page-sponsorship`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('page-sponsor-checkout error:', err);
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
}
