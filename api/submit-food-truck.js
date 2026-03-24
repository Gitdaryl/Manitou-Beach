// /api/submit-food-truck.js
// Captures a food truck signup into Notion (Food Trucks DB)
// Now requires phone — sends a 6-digit SMS verification code via Twilio
// Status starts as "Pending Verification" until code is confirmed
//
// Notion DB fields used:
// - Name (title), Status (select), Tier (select), Description (rich_text)
// - Cuisine (select), Phone (phone_number), Website (url), Photo URL (url)
// - Verification Code (rich_text) — 6-digit code for SMS verification

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizePhone(raw) {
  return (raw || '').replace(/\D/g, '').slice(-10);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { truckName, cuisine, email, phone, website, imageUrl, tier } = req.body || {};

  if (!truckName?.trim() || !email?.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Truck name and valid email are required.' });
  }

  const digits = normalizePhone(phone);
  if (digits.length < 10) {
    return res.status(400).json({ error: 'A valid phone number is required for verification.' });
  }

  const isPaid = tier === 'paid';
  const tierLabel = isPaid ? 'Featured' : 'Basic';
  const code = generateCode();

  // Build Description with contact info + image URL fallback
  const descParts = [`Contact Email: ${email.trim()}`];
  if (imageUrl?.trim()) descParts.push(`Image URL: ${imageUrl.trim()}`);
  const descText = descParts.join('\n');

  const properties = {
    'Name':              { title: [{ text: { content: truckName.trim() } }] },
    'Status':            { select: { name: 'Pending Verification' } },
    'Tier':              { select: { name: tierLabel } },
    'Description':       { rich_text: [{ text: { content: descText } }] },
    'Verification Code': { rich_text: [{ text: { content: code } }] },
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
  if (imageUrl?.trim()) {
    properties['Photo URL'] = { url: imageUrl.trim() };
  }

  try {
    // Create Notion record
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
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }

    // Send verification SMS via Twilio
    const toPhone = `+1${digits}`;
    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE,
          To: toPhone,
          Body: `Manitou Beach Food Trucks\n\nYour verification code is: ${code}\n\nEnter this on the signup page to activate your listing.`,
        }).toString(),
      }
    );

    if (!twilioRes.ok) {
      const err = await twilioRes.text();
      console.error('Twilio verification SMS failed:', err);
      // Record was created — they can retry verification
      return res.status(200).json({ ok: true, needsVerification: true, smsFailed: true });
    }

    return res.status(200).json({ ok: true, needsVerification: true });
  } catch (err) {
    console.error('submit-food-truck error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
