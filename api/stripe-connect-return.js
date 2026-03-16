import Stripe from 'stripe';

// Called when an org completes (or returns from) Stripe Express onboarding.
// Checks if onboarding is complete, updates Notion, and redirects to success page.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const acct = req.query.acct;
  if (!acct || !acct.startsWith('acct_')) {
    return res.redirect('/ticket-services?error=invalid');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.redirect('/ticket-services?error=config');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const account = await stripe.accounts.retrieve(acct);
    const isComplete = account.charges_enabled && account.details_submitted;

    if (isComplete) {
      // Update Notion: mark onboarding complete + status Active
      await updatePartnerInNotion(acct, true);
      return res.redirect('/ticket-services?onboarded=1');
    } else {
      // Onboarding not finished — let them retry
      return res.redirect(`/ticket-services?refresh=1&acct=${acct}`);
    }
  } catch (err) {
    console.error('stripe-connect-return error:', err.message);
    return res.redirect('/ticket-services?error=return');
  }
}

async function updatePartnerInNotion(stripeAccountId, complete) {
  try {
    // Find the partner record by Stripe Account ID
    const searchRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_TICKET_PARTNERS}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          property: 'Stripe Account ID',
          rich_text: { equals: stripeAccountId },
        },
      }),
    });

    const data = await searchRes.json();
    if (!data.results || data.results.length === 0) {
      console.error('Partner not found in Notion for:', stripeAccountId);
      return;
    }

    const pageId = data.results[0].id;
    await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          'Onboarding Complete': { checkbox: complete },
          'Status': { select: { name: complete ? 'Active' : 'Pending' } },
        },
      }),
    });
  } catch (err) {
    console.error('updatePartnerInNotion error:', err.message);
  }
}
