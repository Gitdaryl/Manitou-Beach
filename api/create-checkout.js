import Stripe from 'stripe';

const TIERS = {
  featured_30: {
    name: 'Starter — Featured Listing 30 Days',
    price: 2900, // $29 early bird
    days: 30,
    description: 'Dark premium card, priority placement, click-to-call & directions for 30 days.',
  },
  featured_90: {
    name: 'Season Pass — Featured Listing 90 Days',
    price: 7900, // $79 early bird (save 47%)
    days: 90,
    description: 'Featured listing for 90 days. Best value — includes newsletter feature.',
  },
  featured_video_30: {
    name: 'Spotlight — Featured + Video 30 Days',
    price: 14900, // $149 early bird
    days: 30,
    description: 'Premium featured listing with Holly & Yeti video spotlight for 30 days.',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Payment system is not configured yet. Please email us directly.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { tier, businessName, email } = req.body;

  if (!tier || !businessName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const plan = TIERS[tier];
  if (!plan) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  try {
    // VERCEL_URL is auto-set by Vercel, does NOT include protocol
    // For custom domains, use SITE_URL env var if set
    const baseUrl = process.env.SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: `${plan.description} — ${businessName}`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        businessName,
        tier,
        days: String(plan.days),
      },
      success_url: `${baseUrl}/featured?success=true&business=${encodeURIComponent(businessName)}`,
      cancel_url: `${baseUrl}/featured?cancelled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again or email us directly.' });
  }
}
