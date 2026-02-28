import Stripe from 'stripe';

const PROMO_TIERS = {
  hero_7d: {
    name: 'Hero Takeover — 7 Days',
    price: 4900, // $49
    days: 7,
    description: 'Exclusive homepage hero for 7 days. Your event image, headline, and CTA button.',
  },
  hero_30d: {
    name: 'Hero Takeover — 30 Days',
    price: 14900, // $149
    days: 30,
    description: 'Exclusive homepage hero for 30 days.',
  },
  banner_1p: {
    name: 'Page Feature Banner — 1 Page (30 Days)',
    price: 2900, // $29
    days: 30,
    description: 'Full-width feature banner on your chosen page for 30 days.',
  },
  banner_3p: {
    name: 'Page Feature Banner — 3 Pages (30 Days)',
    price: 6900, // $69
    days: 30,
    description: 'Full-width feature banner on 3 pages of your choice for 30 days.',
  },
  strip_pin: {
    name: 'Featured Strip Pin — 30 Days',
    price: 1900, // $19
    days: 30,
    description: 'Pinned position 1 in the Coming Up strip below the homepage hero.',
  },
  newsletter: {
    name: 'Newsletter Feature — 1 Issue',
    price: 3900, // $39
    days: null,
    description: 'Featured callout at the top of the next Manitou Beach Dispatch issue.',
  },
  holly_yeti: {
    name: 'Holly & Yeti Video Spotlight',
    price: 17900, // $179
    days: 30,
    description: 'Short-form video feature by Holly & The Yeti, embedded on site for 30 days.',
  },
  spotlight: {
    name: 'Community Spotlight Bundle',
    price: 12900, // $129
    days: 30,
    description: 'Hero Takeover 7 days + 2 Page Banners + Newsletter Feature. Save $55.',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Payment system not configured. Please email us to arrange your promotion.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { tier, eventName, email, promoPages, notes } = req.body;

  if (!tier || !eventName || !email) {
    return res.status(400).json({ error: 'Event name, email, and promotion package are required.' });
  }

  const plan = PROMO_TIERS[tier];
  if (!plan) {
    return res.status(400).json({ error: 'Invalid promotion package.' });
  }

  try {
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
              description: `${plan.description} — ${eventName}`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventName,
        tier,
        days: plan.days ? String(plan.days) : 'n/a',
        promoPages: promoPages || '',
        notes: notes || '',
      },
      success_url: `${baseUrl}/promote?success=true&event=${encodeURIComponent(eventName)}`,
      cancel_url: `${baseUrl}/promote?cancelled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Promo Stripe error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again or email us directly.' });
  }
}
