// POST /api/sms-optin
// Subscribes a phone number to SMS alerts. Saves to Notion, sends confirmation via Twilio.
// Body: { phone, name?, type: 'general'|'event'|'deals'|'welcome', preference?, source? }

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

function normalizePhone(raw) {
  return (raw || '').replace(/\D/g, '').slice(-10);
}

async function findExistingSubscriber(phone) {
  const dbId = process.env.NOTION_DB_SMS_SUBSCRIBERS;
  if (!dbId) return null;
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: { property: 'Phone', phone_number: { equals: `+1${phone}` } },
        page_size: 1,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}

async function sendSMS(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;
  if (!sid || !token || !from) return false;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: `+1${to}`, Body: body }).toString(),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, name, type = 'general', preference, source } = req.body || {};

  // Validate phone
  const digits = normalizePhone(phone);
  if (digits.length !== 10) {
    return res.status(400).json({ error: 'A valid 10-digit phone number is required.' });
  }

  const dbId = process.env.NOTION_DB_SMS_SUBSCRIBERS;
  if (!dbId) {
    console.error('sms-optin: NOTION_DB_SMS_SUBSCRIBERS not configured');
    return res.status(500).json({ error: 'SMS service not configured.' });
  }

  try {
    // Check for existing subscriber
    const existing = await findExistingSubscriber(digits);

    if (existing) {
      const isActive = existing.properties?.['Active']?.checkbox;
      if (isActive) {
        return res.status(200).json({ success: true, already_subscribed: true });
      }
      // Re-activate — update existing record
      await fetch(`https://api.notion.com/v1/pages/${existing.id}`, {
        method: 'PATCH',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          properties: {
            'Active': { checkbox: true },
            'Opted-in Date': { date: { start: new Date().toISOString() } },
          },
        }),
      });
    } else {
      // Create new subscriber
      const properties = {
        'Name':          { title: [{ text: { content: name?.trim() || '' } }] },
        'Phone':         { phone_number: `+1${digits}` },
        'Opt-in Type':   { select: { name: type } },
        'Preference':    { rich_text: [{ text: { content: preference || 'any' } }] },
        'Opted-in Date': { date: { start: new Date().toISOString() } },
        'Active':        { checkbox: true },
        'Source Page':   { rich_text: [{ text: { content: source || 'sms-optin' } }] },
      };

      const notionRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          parent: { database_id: dbId },
          properties,
        }),
      });

      if (!notionRes.ok) {
        const err = await notionRes.text();
        console.error('sms-optin Notion error:', err);
        return res.status(500).json({ error: 'Failed to save. Please try again.' });
      }
    }

    // Send confirmation SMS
    await sendSMS(
      digits,
      "You're in! You'll get texts about what's happening at Manitou Beach. Reply STOP anytime to unsubscribe. \u2014 Manitou Beach"
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('sms-optin error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
