// /api/stay-availability.js
// GET  ?pageId=xxx          → returns blocked date ranges for a property (public)
// POST { pageId, action, from, to } → block or unblock a date range (owner uses pageId as capability)
//   action: 'block' | 'unblock'
//   from/to: 'YYYY-MM-DD'
// On unblock: auto-notifies waitlist entries for this property

import { sendSMS } from './lib/twilio.js';

const NOTION_TOKEN = () => process.env.NOTION_TOKEN_BUSINESS;
const NOTION_VERSION = '2022-06-28';

function notionHeaders() {
  return {
    Authorization: `Bearer ${NOTION_TOKEN()}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  };
}

async function getBlockedDates(pageId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: notionHeaders(),
  });
  if (!res.ok) return [];
  const page = await res.json();
  try {
    const raw = page.properties['Blocked Dates JSON']?.rich_text?.[0]?.text?.content || '';
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveBlockedDates(pageId, ranges) {
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: notionHeaders(),
    body: JSON.stringify({
      properties: {
        'Blocked Dates JSON': { rich_text: [{ text: { content: JSON.stringify(ranges) } }] },
      },
    }),
  });
}

async function notifyWaitlist(pageId, stayName) {
  const dbId = process.env.NOTION_DB_WAITLIST_STAYS;
  if (!dbId) return;

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Stay Page ID', rich_text: { equals: pageId } },
          { property: 'Status', select: { equals: 'Pending' } },
        ],
      },
    }),
  });

  if (!res.ok) return;
  const data = await res.json();

  for (const entry of data.results) {
    const phone = entry.properties['Phone']?.phone_number;
    const dates = entry.properties['Dates Requested']?.rich_text?.[0]?.text?.content || 'your requested dates';
    const name = entry.properties['Guest Name']?.title?.[0]?.text?.content || 'there';

    if (phone) {
      await sendSMS(phone,
        `Hey ${name} - good news! ${stayName} just opened up. Your requested dates (${dates}) may be available now. Reply YES and we'll connect you with the owner directly.`
      ).catch(() => {});
    }

    // Mark as Notified
    await fetch(`https://api.notion.com/v1/pages/${entry.id}`, {
      method: 'PATCH',
      headers: notionHeaders(),
      body: JSON.stringify({
        properties: { 'Status': { select: { name: 'Notified' } } },
      }),
    }).catch(() => {});
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const { pageId } = req.query;
    if (!pageId) return res.status(400).json({ error: 'pageId required' });
    const ranges = await getBlockedDates(pageId);
    return res.status(200).json({ blocked: ranges });
  }

  if (req.method === 'POST') {
    const { pageId, action, from, to, stayName } = req.body || {};
    if (!pageId || !action || !from || !to) {
      return res.status(400).json({ error: 'pageId, action, from, to required' });
    }
    if (!['block', 'unblock'].includes(action)) {
      return res.status(400).json({ error: 'action must be block or unblock' });
    }

    const current = await getBlockedDates(pageId);

    let updated;
    if (action === 'block') {
      updated = [...current, { from, to }];
    } else {
      updated = current.filter(r => !(r.from === from && r.to === to));
      // Notify waitlist when dates open up
      if (stayName) {
        notifyWaitlist(pageId, stayName).catch(() => {});
      }
    }

    await saveBlockedDates(pageId, updated);
    return res.status(200).json({ ok: true, blocked: updated });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
