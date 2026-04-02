import Stripe from 'stripe';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { businessName, email } = req.body || {};
  if (!businessName || !email) return res.status(400).json({ error: 'Name and email are required' });

  try {
    const page = await findByNameAndEmail(businessName.trim(), email.trim().toLowerCase());
    if (!page) return res.status(200).json({ found: false });

    const customerId = page.properties['Stripe Customer ID']?.rich_text?.[0]?.plain_text || '';
    if (!customerId) return res.status(200).json({ found: true, noStripe: true });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/manage-billing?returned=true`,
    });

    return res.status(200).json({ found: true, url: session.url });
  } catch (err) {
    console.error('Billing portal error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
