// Public endpoint — creates a Stripe checkout session for a community org
// sponsorship. Routes payment to the org's Stripe Express account with
// 1.25% platform fee retained by Yetickets.
import Stripe from 'stripe';

const PLATFORM_FEE_PERCENT = 0.0125;

function generateSponsorId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'SPNS-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orgPageId, orgName, sponsorName, email, tierLevel, amount, perks, returnPath } = req.body;
  if (!orgPageId || !sponsorName || !email || !tierLevel || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum < 1) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    // Look up org's Stripe account ID from Notion
    const notionRes = await fetch(`https://api.notion.com/v1/pages/${orgPageId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!notionRes.ok) return res.status(404).json({ error: 'Org not found' });
    const page = await notionRes.json();

    const connectedAccountId = page.properties['Stripe Account ID']?.rich_text?.[0]?.text?.content || null;
    if (!connectedAccountId) {
      return res.status(400).json({ error: 'This organisation has not yet connected their Stripe account.' });
    }

    const orgContactEmail = page.properties['Org Contact Email']?.email || null;
    const resolvedOrgName = orgName || page.properties['Name']?.title?.[0]?.plain_text || 'the organisation';

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.SITE_URL || 'https://manitoubeach.com';
    const returnTo = returnPath || '/';
    const sponsorId = generateSponsorId();

    const amountCents = Math.round(amountNum * 100);
    const applicationFee = Math.round(amountCents * PLATFORM_FEE_PERCENT);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tierLevel} — ${resolvedOrgName}`,
            description: perks?.join(' · ') || `${tierLevel} sponsorship`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      metadata: {
        type: 'sponsor_payment',
        sponsorId,
        orgPageId,
        orgName: resolvedOrgName,
        orgContactEmail: orgContactEmail || '',
        sponsorName,
        tierLevel,
        amount: String(amountNum),
        perks: perks?.join('|') || '',
      },
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: { destination: connectedAccountId },
      },
      success_url: `${siteUrl}${returnTo}?sponsor_success=1&name=${encodeURIComponent(sponsorName)}&tier=${encodeURIComponent(tierLevel)}&id=${sponsorId}`,
      cancel_url:  `${siteUrl}${returnTo}`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('sponsor-checkout error:', err);
    return res.status(500).json({ error: err.message || 'Checkout failed' });
  }
}
