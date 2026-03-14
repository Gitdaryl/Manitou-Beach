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

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    // 1. Check if this was a Business Listing checkout
    if (metadata.businessName && metadata.type === 'listing') {
      const businessName = metadata.businessName;
      const tierId = metadata.tier; // e.g., 'premium', 'featured', 'enhanced', 'food_truck_founding'
      
      let statusName = 'Listed Enhanced';
      if (tierId === 'premium') statusName = 'Listed Premium';
      if (tierId === 'featured') statusName = 'Listed Featured';
      if (tierId === 'food_truck_founding') statusName = 'Listed Featured'; // Assuming food trucks map to featured

      try {
        // Query Notion by Business Name to find the exact Page ID
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
          
          // Update the Status column in Notion to reflect the paid tier
          await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
              properties: {
                'Status': { status: { name: statusName } }
              }
            })
          });
          console.log(`Successfully upgraded ${businessName} to ${statusName} in Notion.`);
        } else {
           console.error(`Webhook Error: Business "${businessName}" not found in Notion to upgrade.`);
        }
      } catch (err) {
        console.error('Notion Webhook Fulfillment Error:', err);
      }
    }
    
    // 2. Check if this was a Feature placement payment (/featured page)
    if (metadata.businessName && !metadata.type) {
        // Typically has metadata.tier = 'featured_30', 'featured_90', 'featured_video_30'
        // And updates a different status or handles differently. For now, we will mark them as Featured.
        const businessName = metadata.businessName;
        try {
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
                body: JSON.stringify({
                  properties: { 'Status': { status: { name: 'Listed Featured' } } }
                })
              });
              console.log(`Successfully completed ONE-TIME upgrade for ${businessName}.`);
            }
        } catch (err) {
            console.error('Notion Webhook Fulfillment Error:', err);
        }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
}
