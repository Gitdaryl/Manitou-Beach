// Admin endpoint — creates a Stripe Express account for a community org
// and returns an onboarding link. Account ID is saved to Notion Business DB.
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { orgPageId, orgName, orgEmail } = req.body;
  if (!orgPageId || !orgName) {
    return res.status(400).json({ error: 'orgPageId and orgName are required' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.SITE_URL || 'https://manitoubeach.yetigroove.com';

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: 'individual',
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      ...(orgEmail ? { email: orgEmail } : {}),
      metadata: { orgName, orgPageId },
    });

    // Save account ID to Notion Business DB page
    const notionPatch = await fetch(`https://api.notion.com/v1/pages/${orgPageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          'Stripe Account ID': { rich_text: [{ text: { content: account.id } }] },
          'Stripe Status':     { select: { name: 'Pending' } },
          ...(orgEmail ? { 'Org Contact Email': { email: orgEmail } } : {}),
        },
      }),
    });

    if (!notionPatch.ok) {
      const err = await notionPatch.json();
      throw new Error(`Notion patch failed: ${err.message || JSON.stringify(err)}`);
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${siteUrl}/yeti-admin?tab=orgs&connect_refresh=1&orgId=${orgPageId}`,
      return_url:  `${siteUrl}/yeti-admin?tab=orgs&connect_return=1&orgId=${orgPageId}`,
      type: 'account_onboarding',
    });

    return res.status(200).json({
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });

  } catch (err) {
    console.error('stripe-connect-onboard error:', err);
    return res.status(500).json({ error: err.message || 'Onboarding failed' });
  }
}
