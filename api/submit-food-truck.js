// /api/submit-food-truck.js
// Captures a food truck signup into Notion (Food Trucks DB)
// tier: 'free' → Status=Pending, Tier=Basic
// tier: 'paid' → Status=Pending Payment, Tier=Featured (activated by Daryl after Stripe confirms)
//
// Notion DB setup required (NOTION_DB_FOOD_TRUCKS):
// - Name (title)          ← truck name
// - Status (select)       ← needs "Pending" and "Pending Payment" options added
// - Tier (select)         ← Basic / Featured (already exists)
// - Description (rich_text) ← contact info + image URL stored here
// - Cuisine (select)      ← already exists
// - Phone (phone_number)  ← already exists
// - Website (url)         ← already exists
// - Subscription (select) ← ADD THIS: "Subscribed" / "Comped" / "None"
//   (lets Daryl mark comped trucks without Stripe payment)
// - Photo URL (url)       ← ADD THIS for image display on locator
//   Until added, image URL is stored in Description text.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { truckName, cuisine, email, phone, website, imageUrl, tier } = req.body || {};

  if (!truckName?.trim() || !email?.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Truck name and valid email are required.' });
  }

  const isPaid = tier === 'paid';
  const tierLabel = isPaid ? 'Featured' : 'Basic';
  const statusLabel = isPaid ? 'Pending Payment' : 'Pending';

  // Build Description with contact info + image URL fallback
  const descParts = [`Contact Email: ${email.trim()}`];
  if (imageUrl?.trim()) descParts.push(`Image URL: ${imageUrl.trim()}`);
  const descText = descParts.join('\n');

  const properties = {
    'Name':        { title: [{ text: { content: truckName.trim() } }] },
    'Status':      { select: { name: statusLabel } },
    'Tier':        { select: { name: tierLabel } },
    'Description': { rich_text: [{ text: { content: descText } }] },
  };

  if (cuisine?.trim()) {
    properties['Cuisine'] = { select: { name: cuisine.trim() } };
  }
  if (phone?.trim()) {
    properties['Phone'] = { phone_number: phone.trim() };
  }
  if (website?.trim()) {
    properties['Website'] = { url: website.trim().startsWith('http') ? website.trim() : `https://${website.trim()}` };
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_FOOD_TRUCKS },
        properties,
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('submit-food-truck Notion error:', err);
      // Still return ok for paid tier — Stripe redirect will proceed regardless
      return res.status(200).json({ ok: true, notionError: true });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('submit-food-truck error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
