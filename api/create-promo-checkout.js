import Stripe from 'stripe';

// Founding rates — locked in for early sponsors. Full rates shown on /promote page.
const PROMO_TIERS = {
  event_spotlight: {
    name: 'Event Spotlight — Featured Listing',
    price: 2500, // $25 founding (full: $49)
    days: null,
    description: 'Bold highlighted event card in the calendar with your image and ticket link.',
  },
  hero_7d: {
    name: 'Hero Feature — 7 Days',
    price: 7500, // $75 founding (full: $149)
    days: 7,
    description: 'Exclusive homepage hero for 7 days. Your event image, headline, and CTA button.',
  },
  hero_30d: {
    name: 'Hero Feature — 30 Days',
    price: 24900, // $249 founding (full: $499)
    days: 30,
    description: 'Exclusive homepage hero for a full month.',
  },
  banner_1p: {
    name: 'Page Feature Banner — 1 Page (30 Days)',
    price: 2900, // $29 founding (full: $59)
    days: 30,
    description: 'Full-width feature banner on your chosen page for 30 days.',
  },
  banner_3p: {
    name: 'Page Feature Banner — 3 Pages (30 Days)',
    price: 6900, // $69 founding (full: $129)
    days: 30,
    description: 'Full-width feature banner on 3 pages of your choice for 30 days.',
  },
  strip_pin: {
    name: 'Featured Strip Pin — 30 Days',
    price: 1900, // $19 founding (full: $39)
    days: 30,
    description: 'Pinned position 1 in the Coming Up strip below the homepage hero.',
  },
  newsletter: {
    name: 'Newsletter Feature — 1 Issue',
    price: 3900, // $39 founding (full: $79)
    days: null,
    description: 'Featured callout at the top of the next Manitou Beach Dispatch issue.',
  },
  holly_yeti: {
    name: 'Holly & Yeti Video Spotlight',
    price: 17900, // $179 founding (full: $350)
    days: 30,
    description: 'Short-form video feature by Holly & The Yeti, embedded on site for 30 days.',
  },
  spotlight: {
    name: 'Full Launch Bundle',
    price: 14900, // $149 founding (full: $299)
    days: 7,
    description: 'Hero Feature 7 days + Newsletter Feature + Event Spotlight. Save $55.',
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
