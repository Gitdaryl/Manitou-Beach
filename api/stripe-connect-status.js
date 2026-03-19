// Admin endpoint — checks whether a community org's Stripe Express account
// is fully onboarded and ready to accept payments.
import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { orgPageId } = req.query;
  if (!orgPageId) return res.status(400).json({ error: 'orgPageId required' });

  try {
    // Fetch org from Notion
    const notionRes = await fetch(`https://api.notion.com/v1/pages/${orgPageId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!notionRes.ok) return res.status(404).json({ error: 'Org not found in Notion' });
    const page = await notionRes.json();

    const accountId = page.properties['Stripe Account ID']?.rich_text?.[0]?.text?.content || null;
    if (!accountId) return res.status(200).json({ connected: false, accountId: null });

    // Check account status with Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.accounts.retrieve(accountId);

    const connected = account.details_submitted && account.charges_enabled;

    // Update Notion if now active
    if (connected) {
      await fetch(`https://api.notion.com/v1/pages/${orgPageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: { 'Stripe Status': { select: { name: 'Active' } } },
        }),
      });
    }

    return res.status(200).json({
      connected,
      accountId,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      email: account.email || null,
      country: account.country || null,
    });

  } catch (err) {
    console.error('stripe-connect-status error:', err);
    return res.status(500).json({ error: err.message });
  }
}
