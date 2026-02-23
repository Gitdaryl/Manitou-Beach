import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const TIERS = {
  featured_30: {
    name: 'Featured Listing — 30 Days',
    price: 5000, // $50
    days: 30,
    description: 'Dark card with logo, priority placement in directory, and shimmer effect for 30 days.',
  },
  featured_90: {
    name: 'Featured Listing — 90 Days',
    price: 12000, // $120 (save $30)
    days: 90,
    description: 'Featured listing for 90 days. Best value for seasonal businesses.',
  },
  featured_video_30: {
    name: 'Featured + Video — 30 Days',
    price: 10000, // $100
    days: 30,
    description: 'Featured listing with embedded video showcase for 30 days.',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tier, businessName, email } = req.body;

  if (!tier || !businessName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const plan = TIERS[tier];
  if (!plan) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

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
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
