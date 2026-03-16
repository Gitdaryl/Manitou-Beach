import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const getRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

// Shared helper — update a Notion page property by querying business name
async function updateNotionBusiness(businessName, properties) {
  const searchRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Name', title: { equals: businessName } }
    })
  });
  const data = await searchRes.json();
  if (data.results && data.results.length > 0) {
    const pageId = data.results[0].id;
    await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties })
    });
    return pageId;
  }
  return null;
}

// Log a promo or wine partner purchase to Website Inquiries DB
async function logPurchaseToNotion(name, details) {
  try {
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_WEBSITE_INQUIRIES },
        properties: {
          'Name':         { title: [{ text: { content: name } }] },
          'Notes':        { rich_text: [{ text: { content: details } }] },
          'Submitted At': { date: { start: new Date().toISOString() } },
          'Status':       { select: { name: 'Paid' } },
        },
      }),
    });
  } catch (err) {
    console.error('logPurchaseToNotion error:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe env vars.');
    return res.status(500).send('Webhook unconfigured');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── checkout.session.completed ──────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    // 1. Business Listing subscription checkout
    if (metadata.businessName && metadata.type === 'listing') {
      const businessName = metadata.businessName;
      const tierId = metadata.tier;

      let statusName = 'Listed Enhanced';
      if (tierId === 'premium') statusName = 'Listed Premium';
      if (tierId === 'featured') statusName = 'Listed Featured';
      if (tierId === 'food_truck_founding') statusName = 'Listed Featured';

      try {
        const pageId = await updateNotionBusiness(businessName, {
          'Status': { status: { name: statusName } }
        });
        if (pageId) {
          console.log(`Successfully upgraded ${businessName} to ${statusName} in Notion.`);
        } else {
          console.error(`Webhook Error: Business "${businessName}" not found in Notion to upgrade.`);
        }
      } catch (err) {
        console.error('Notion Webhook Fulfillment Error:', err);
      }
    }

    // 2. Featured placement one-time payment (/featured page)
    if (metadata.businessName && !metadata.type && metadata.days) {
      const businessName = metadata.businessName;
      try {
        const pageId = await updateNotionBusiness(businessName, {
          'Status': { status: { name: 'Listed Featured' } }
        });
        if (pageId) {
          console.log(`Successfully completed ONE-TIME upgrade for ${businessName} (${metadata.tier}, ${metadata.days} days).`);
        }
      } catch (err) {
        console.error('Notion Webhook Fulfillment Error:', err);
      }
    }

    // 3. Event/Advertising promo purchase (from create-promo-checkout.js)
    if (metadata.eventName) {
      const { eventName, tier, days, promoPages, notes } = metadata;
      const details = [
        `Promo tier: ${tier}`,
        days && days !== 'n/a' ? `Duration: ${days} days` : null,
        promoPages ? `Pages: ${promoPages}` : null,
        notes ? `Notes: ${notes}` : null,
        `Stripe Payment: ${session.payment_intent || session.id}`,
        `Amount: $${(session.amount_total / 100).toFixed(2)}`,
      ].filter(Boolean).join('\n');

      await logPurchaseToNotion(`Promo: ${eventName} — ${tier}`, details);
      console.log(`Promo purchase recorded: ${eventName} — ${tier}`);
    }

    // 4. Wine partner signup (from wine-partner-signup.js)
    if (metadata.venueName) {
      const { venueName, contactName, phone, note } = metadata;
      const details = [
        `Wine Trail Partner — 2026 Season`,
        `Venue: ${venueName}`,
        `Contact: ${contactName}`,
        phone ? `Phone: ${phone}` : null,
        note ? `Note: ${note}` : null,
        `Stripe Payment: ${session.payment_intent || session.id}`,
        `Amount: $${(session.amount_total / 100).toFixed(2)}`,
      ].filter(Boolean).join('\n');

      await logPurchaseToNotion(`Wine Partner: ${venueName} — PAID`, details);
      console.log(`Wine partner payment recorded: ${venueName}`);
    }
  }

  // ── customer.subscription.deleted ───────────────────────────
  // Fires when a subscriber cancels (end of billing period) or is removed
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const metadata = subscription.metadata || {};
    if (metadata.businessName && metadata.type === 'listing') {
      try {
        const pageId = await updateNotionBusiness(metadata.businessName, {
          'Status': { status: { name: 'Cancelled' } }
        });
        if (pageId) {
          console.log(`Subscription cancelled: ${metadata.businessName} → Cancelled`);
        }
      } catch (err) {
        console.error('Subscription cancellation Notion error:', err);
      }
    }
  }

  // ── invoice.payment_failed ──────────────────────────────────
  // Fires when a recurring payment fails (expired card, insufficient funds)
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    // Try to get metadata from the subscription
    if (invoice.subscription) {
      try {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const metadata = sub.metadata || {};
        if (metadata.businessName && metadata.type === 'listing') {
          const pageId = await updateNotionBusiness(metadata.businessName, {
            'Status': { status: { name: 'Payment Failed' } }
          });
          if (pageId) {
            console.log(`Payment failed: ${metadata.businessName} → Payment Failed`);
          }
        }
      } catch (err) {
        console.error('Payment failed Notion error:', err);
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
}
