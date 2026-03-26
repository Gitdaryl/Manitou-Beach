import Stripe from 'stripe';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const LISTING_TIERS = {
  enhanced: { label: 'Showcased', price: 9, annual: 108 },
  featured: { label: 'Highlighted', price: 25, annual: 300 },
  premium:  { label: 'Front and Center', price: 49, annual: 588 },
};

function statusToTier(status) {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s.includes('premium')) return 'premium';
  if (s.includes('featured')) return 'featured';
  if (s.includes('enhanced')) return 'enhanced';
  return null;
}

async function findByNameAndEmail(name, email) {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
    {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Name', title: { equals: name } },
            { property: 'Email', email: { equals: email } },
          ],
        },
        page_size: 1,
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}

export default async function handler(req, res) {
  // GET — verify ownership, return current tier
  if (req.method === 'GET') {
    const { name, email } = req.query;
    if (!name || !email) return res.status(400).json({ found: false, error: 'Name and email are required' });

    try {
      const page = await findByNameAndEmail(name.trim(), email.trim().toLowerCase());
      if (!page) return res.status(200).json({ found: false });

      const p = page.properties;
      const statusName = p['Status']?.status?.name || '';
      const tier = statusToTier(statusName);

      if (!tier) return res.status(200).json({ found: false });

      return res.status(200).json({
        found: true,
        businessName: p['Name']?.title?.[0]?.text?.content || name.trim(),
        tier,
      });
    } catch (err) {
      console.error('upgrade-listing GET error:', err.message);
      return res.status(500).json({ found: false, error: 'Server error' });
    }
  }

  // POST — create Stripe checkout session for upgrade
  if (req.method === 'POST') {
    const { businessName, email, currentTier, newTier, billingInterval } = req.body;
    if (!businessName || !email || !newTier) return res.status(400).json({ error: 'Missing required fields' });

    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Payment system not configured.' });

    const tierData = LISTING_TIERS[newTier];
    if (!tierData) return res.status(400).json({ error: 'Invalid tier' });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const baseUrl = process.env.SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
      || 'http://localhost:3000';

    try {
      // Re-verify ownership before creating checkout
      const page = await findByNameAndEmail(businessName.trim(), email.trim().toLowerCase());
      if (!page) return res.status(403).json({ error: 'Could not verify your listing.' });

      const isAnnual = billingInterval === 'year';
      const unitAmount = isAnnual ? tierData.annual * 100 : tierData.price * 100;
      const interval = isAnnual ? 'year' : 'month';
      const priceLabel = isAnnual ? `$${tierData.annual}/yr` : `$${tierData.price}/mo`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email.trim().toLowerCase(),
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tierData.label} Listing — Manitou Beach Directory`,
              description: `${businessName} · Upgrade to ${tierData.label} · ${priceLabel}`,
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        }],
        metadata: {
          businessName,
          tier: newTier,
          type: 'listing',
          upgrade: 'true',
          previousTier: currentTier || '',
          billingInterval: interval,
        },
        success_url: `${baseUrl}/upgrade-listing?success=true&business=${encodeURIComponent(businessName)}&tier=${newTier}`,
        cancel_url: `${baseUrl}/upgrade-listing?business=${encodeURIComponent(businessName)}`,
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('upgrade-listing POST error:', err.message);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
