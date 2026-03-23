import Stripe from 'stripe';

// One-time payment tiers (used by /featured page)
const TIERS = {
  featured_30: {
    name: 'Starter — Featured Listing 30 Days',
    price: 2900,
    days: 30,
    description: 'Dark premium card, priority placement, click-to-call & directions for 30 days.',
  },
  featured_90: {
    name: 'Season Pass — Featured Listing 90 Days',
    price: 7900,
    days: 90,
    description: 'Featured listing for 90 days. Best value — includes newsletter feature.',
  },
  featured_video_30: {
    name: 'Spotlight — Featured + Video 30 Days',
    price: 14900,
    days: 30,
    description: 'Premium featured listing with Holly & Yeti video spotlight for 30 days.',
  },
};

// Monthly recurring subscription tiers (used by business directory pricing section)
// Prices computed server-side from subscriber count — never trust client-sent prices
const LISTING_TIERS = {
  enhanced: {
    name: 'Enhanced Listing — Manitou Beach Directory',
    description: 'Clickable website link, business description, expandable listing card.',
    basePrice: 9,
  },
  featured: {
    name: 'Featured Listing — Manitou Beach Directory',
    description: 'Spotlight card, logo display, above standard listings.',
    basePrice: 23,
  },
  premium: {
    name: 'Premium Listing — Manitou Beach Directory',
    description: 'Full-width banner, large logo, top-of-directory placement, email contact button.',
    basePrice: 43,
  },
  food_truck_founding: {
    name: 'Founding Food Truck — Manitou Beach Food Truck Locator',
    description: 'Live map pin, personal check-in URL, newsletter shoutout, Featured badge, priority placement.',
    basePrice: 9,
  },
};

const GRACE = 100;

// Fetch subscriber count from Beehiiv and compute price server-side
async function computePriceCents(basePrice) {
  let count = 0;
  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions?limit=1`,
      { headers: { 'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}` } }
    );
    if (response.ok) {
      const data = await response.json();
      count = data.total_results || 0;
    }
  } catch (_) {}
  const increment = Math.max(0, count - GRACE);
  return Math.round((basePrice + increment * 0.01) * 100);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Payment system is not configured yet. Please email us directly.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { tier, businessName, email, mode: checkoutMode, duration, isBeta, billingInterval } = req.body;

  if (!tier || !businessName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const baseUrl = process.env.SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000';

  // Beta trial end: May 10 2026 at midnight UTC
  const BETA_TRIAL_END = Math.floor(new Date('2026-05-10T00:00:00Z').getTime() / 1000);

  // Monthly subscription — business directory listing tiers
  if (checkoutMode === 'subscription') {
    const plan = LISTING_TIERS[tier];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid listing tier' });
    }
    try {
      const isAnnual = billingInterval === 'year';
      const monthlyAmount = await computePriceCents(plan.basePrice);
      const unitAmount = isAnnual ? monthlyAmount * 12 : monthlyAmount;
      const interval = isAnnual ? 'year' : 'month';
      const priceLabel = isAnnual
        ? `$${(unitAmount / 100).toFixed(0)}/yr`
        : `$${plan.basePrice}/mo`;

      const sessionParams = {
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: isBeta ? `${plan.name} — Beta Founder` : plan.name,
              description: isBeta
                ? `${plan.description} — ${businessName} · Free through May 10, then ${priceLabel}`
                : `${plan.description} — ${businessName}`,
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        }],
        metadata: {
          businessName,
          tier,
          type: 'listing',
          billingInterval: interval,
          ...(duration && { duration: String(duration) + ' months' }),
          ...(isBeta && { beta: 'true' }),
        },
        success_url: isBeta
          ? `${baseUrl}/beta-business?success=true&business=${encodeURIComponent(businessName)}`
          : tier === 'food_truck_founding'
            ? `${baseUrl}/food-trucks?listed=true&truck=${encodeURIComponent(businessName)}`
            : `${baseUrl}/activate?success=true&business=${encodeURIComponent(businessName)}`,
        cancel_url: isBeta
          ? `${baseUrl}/beta-business`
          : tier === 'food_truck_founding'
            ? `${baseUrl}/food-truck-partner#food-truck-signup`
            : `${baseUrl}/activate?business=${encodeURIComponent(businessName)}&tier=${tier}`,
        ...(isBeta && { subscription_data: { trial_end: BETA_TRIAL_END } }),
      };
      const session = await stripe.checkout.sessions.create(sessionParams);
      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('Stripe subscription error:', err.message);
      return res.status(500).json({ error: 'Something went wrong. Please try again or email us directly.' });
    }
  }

  // One-time payment — featured listing (/featured page)
  const plan = TIERS[tier];
  if (!plan) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  try {
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
