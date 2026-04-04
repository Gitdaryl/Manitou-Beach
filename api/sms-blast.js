// POST /api/sms-blast
// Admin-only: sends SMS to matching active subscribers
// Body: { token, type?: 'general'|'event'|'deals'|'welcome', slug?, message }
// token = ADMIN_SECRET env var (prevents unauthorized blasts)

import { sendSMSFull } from './lib/twilio.js';

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, type, slug, message } = req.body || {};

  // Auth check
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const dbId = process.env.NOTION_DB_SMS_SUBSCRIBERS;
  if (!dbId) {
    return res.status(500).json({ error: 'SMS subscriber database not configured.' });
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE) {
    return res.status(500).json({ error: 'Twilio not configured.' });
  }

  try {
    // Build Notion filter - active subscribers, optionally filtered by type/slug
    const filterConditions = [
      { property: 'Active', checkbox: { equals: true } },
    ];

    if (type && type !== 'general') {
      filterConditions.push({
        or: [
          { property: 'Opt-in Type', select: { equals: type } },
          { property: 'Opt-in Type', select: { equals: 'general' } },
        ],
      });
    }

    if (slug) {
      filterConditions.push({
        or: [
          { property: 'Preference', rich_text: { equals: slug } },
          { property: 'Preference', rich_text: { equals: 'any' } },
        ],
      });
    }

    // Paginate through all subscribers
    let allSubscribers = [];
    let startCursor = undefined;
    let hasMore = true;

    while (hasMore) {
      const body = {
        filter: filterConditions.length === 1 ? filterConditions[0] : { and: filterConditions },
        page_size: 100,
      };
      if (startCursor) body.start_cursor = startCursor;

      const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify(body),
      });

      if (!queryRes.ok) {
        console.error('sms-blast query error:', await queryRes.text());
        return res.status(500).json({ error: 'Failed to query subscribers.' });
      }

      const data = await queryRes.json();
      allSubscribers = allSubscribers.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    // Extract phone numbers
    const phones = allSubscribers
      .map(s => s.properties?.['Phone']?.phone_number)
      .filter(Boolean);

    if (phones.length === 0) {
      return res.status(200).json({ sent: 0, total: 0, message: 'No matching subscribers.' });
    }

    // Send SMS to each subscriber
    let sent = 0;
    const errors = [];

    for (const phone of phones) {
      try {
        const ok = await sendSMSFull(phone, message.trim());
        if (ok) sent++;
        else errors.push({ phone, error: 'Send failed' });
      } catch (e) {
        errors.push({ phone, error: e.message });
      }
    }

    console.log(`SMS blast: ${sent}/${phones.length} sent (type=${type || 'all'}, slug=${slug || 'any'})`);
    return res.status(200).json({ sent, total: phones.length, errors: errors.length ? errors : undefined });

  } catch (err) {
    console.error('sms-blast error:', err.message);
    return res.status(500).json({ error: 'Blast failed. Please try again.' });
  }
}
