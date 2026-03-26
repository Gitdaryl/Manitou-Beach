// /api/cron-review-digest.js
// Daily safety-net: texts admin if any events are sitting in Review or Pending status.
// Runs daily at 9am ET via Vercel Cron.

import { sendSMS } from './lib/twilio.js';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const darylPhone = process.env.DARYL_PHONE;
  if (!darylPhone) {
    return res.status(200).json({ skipped: true, reason: 'No DARYL_PHONE configured' });
  }

  try {
    // Query events in Review or Pending status
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
      {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: {
            or: [
              { property: 'Status', status: { equals: 'Review' } },
              { property: 'Status', status: { equals: 'Pending' } },
            ],
          },
          page_size: 100,
        }),
      }
    );

    if (!queryRes.ok) {
      console.error('cron-review-digest Notion query failed:', await queryRes.text());
      return res.status(500).json({ error: 'Notion query failed' });
    }

    const { results } = await queryRes.json();

    if (results.length === 0) {
      return res.status(200).json({ ok: true, queued: 0 });
    }

    // Build summary
    const review = [];
    const pending = [];

    for (const page of results) {
      const p = page.properties;
      const name = p['Event Name']?.title?.[0]?.text?.content || '(unnamed)';
      const status = p['Status']?.status?.name || '';
      const email = p['Email']?.email || '';
      const organizer = p['Organizer Name']?.rich_text?.[0]?.plain_text || '';
      const created = page.created_time ? new Date(page.created_time) : null;
      const age = created ? Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60)) : null;
      const ageLabel = age !== null ? `${age}h ago` : '';

      const line = `• ${name} (${organizer || email}) ${ageLabel}`;
      if (status === 'Review') review.push(line);
      else pending.push(line);
    }

    const parts = [];
    if (review.length > 0) parts.push(`🚩 HELD FOR REVIEW (${review.length}):\n${review.join('\n')}`);
    if (pending.length > 0) parts.push(`⏳ Pending verification (${pending.length}):\n${pending.join('\n')}`);

    const message = `Manitou Beach Event Queue\n\n${parts.join('\n\n')}\n\nCheck Notion to approve/reject.`;

    await sendSMS(darylPhone, message);

    return res.status(200).json({ ok: true, queued: results.length, review: review.length, pending: pending.length });
  } catch (err) {
    console.error('cron-review-digest error:', err.message);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
