import Stripe from 'stripe';

// 5-minute in-memory cache
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

// Determine tier name from price amount (cents)
function tierFromAmount(amount) {
  if (amount === 900) return 'Basic';
  if (amount === 2500) return 'Enhanced';
  if (amount === 4900) return 'Featured';
  if (amount === 9700) return 'Premium';
  return 'Other';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Return cached result if fresh
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return res.status(200).json(cache);
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Fetch active and past-due subscriptions in parallel
    const [activeSubs, pastDueSubs] = await Promise.all([
      stripe.subscriptions.list({ status: 'active', limit: 100, expand: ['data.customer'] }),
      stripe.subscriptions.list({ status: 'past_due', limit: 100, expand: ['data.customer'] }),
    ]);

    // Count active subscriptions by tier + compute MRR
    const byTier = { Basic: 0, Enhanced: 0, Featured: 0, Premium: 0, Other: 0 };
    let mrr = 0;

    for (const sub of activeSubs.data) {
      const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
      const tier = sub.metadata?.tier || tierFromAmount(amount);
      byTier[tier] = (byTier[tier] || 0) + 1;
      mrr += amount;
    }
    mrr = Math.round(mrr / 100); // convert cents to dollars

    // Past-due details
    const pastDue = pastDueSubs.data.map(sub => {
      const customer = sub.customer;
      const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
      const name = customer?.metadata?.businessName || customer?.name || customer?.email || 'Unknown';
      const email = customer?.email || '';
      const daysOverdue = sub.current_period_end
        ? Math.max(0, Math.round((Date.now() / 1000 - sub.current_period_end) / 86400))
        : 0;
      return { name, email, amount: Math.round(amount / 100), daysOverdue };
    });

    // This month vs last month - use active sub MRR as proxy (no historical needed)
    // Get charges from last 60 days to compute monthly comparison
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 86400;
    const sixtyDaysAgo = now - 60 * 86400;

    const [thisMonthCharges, lastMonthCharges] = await Promise.all([
      stripe.charges.list({ created: { gte: thirtyDaysAgo }, limit: 100 }),
      stripe.charges.list({ created: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, limit: 100 }),
    ]);

    const sumSuccessful = charges =>
      charges.data
        .filter(c => c.status === 'succeeded' && !c.refunded)
        .reduce((sum, c) => sum + c.amount, 0);

    const thisMonth = Math.round(sumSuccessful(thisMonthCharges) / 100);
    const lastMonth = Math.round(sumSuccessful(lastMonthCharges) / 100);

    // Wine season: one-time payments of $279 in last 12 months
    const yearAgo = now - 365 * 86400;
    const wineCharges = await stripe.charges.list({ created: { gte: yearAgo }, limit: 100 });
    const winePartners = wineCharges.data.filter(
      c => c.status === 'succeeded' && !c.refunded && c.amount === 27900
    );

    const result = {
      mrr,
      activeSubscriptions: activeSubs.data.length,
      byTier,
      pastDue,
      thisMonth,
      lastMonth,
      wineSeason: {
        partners: winePartners.length,
        revenue: winePartners.length * 279,
      },
    };

    cache = result;
    cacheTime = Date.now();

    return res.status(200).json(result);
  } catch (err) {
    console.error('revenue-summary error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
}
