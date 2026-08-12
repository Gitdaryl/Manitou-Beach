// /api/my-events.js
// One link that shows an organizer every event they've submitted.
//
// POST { phone }            → texts them a magic link (no code to type in)
// GET  ?phone=X&token=Y     → returns their events, each with its edit link
//
// Edit tokens are per-event and there was no way to see them all in one place,
// so an organizer who logged a month of events had to hunt through old texts.
// Auth is a signed link texted to the phone already on their event records -
// same trust model as the per-event edit links we already send by SMS.

import crypto from 'crypto';
import { sendSMS, normalizePhone } from './lib/twilio.js';

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days - organizers plan a season ahead

function sign(phone, exp) {
  return crypto
    .createHmac('sha256', process.env.NOTION_TOKEN_EVENTS)
    .update(`my-events:${phone}:${exp}`)
    .digest('hex');
}

function makeToken(phone) {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${sign(phone, exp)}`;
}

function validToken(phone, token) {
  const [expStr, sig] = String(token || '').split('.');
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  const expected = sign(phone, exp);
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

async function fetchAllEvents() {
  const results = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ page_size: 100, ...(cursor && { start_cursor: cursor }) }),
    });
    if (!res.ok) throw new Error('Notion query failed: ' + await res.text());
    const data = await res.json();
    results.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

// Notion stores phone numbers in whatever shape the organizer typed, so the
// match has to happen after normalizing - a Notion-side equals filter misses.
function eventsForPhone(pages, digits) {
  const rt = (p, k) => (p[k]?.rich_text || []).map(x => x.plain_text).join('');
  return pages
    .filter(page => normalizePhone(page.properties['Phone']?.phone_number || '') === digits)
    .map(page => {
      const p = page.properties;
      return {
        id: page.id,
        name: (p['Event Name']?.title || []).map(x => x.plain_text).join('') || 'Untitled event',
        date: p['Event date']?.date?.start || '',
        time: rt(p, 'Time End'),
        location: rt(p, 'Location'),
        status: p['Status']?.status?.name || '',
        lifecycle: p['Lifecycle']?.select?.name || 'Active',
        editToken: rt(p, 'Edit Token'),
      };
    })
    .filter(e => e.editToken)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

export default async function handler(req, res) {
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  // ── SEND THE LINK ──
  if (req.method === 'POST') {
    const digits = normalizePhone((req.body || {}).phone);
    if (digits.length !== 10) {
      return res.status(400).json({ error: 'Pop in the phone number you used when you added your events.' });
    }

    try {
      const mine = eventsForPhone(await fetchAllEvents(), digits);
      if (mine.length === 0) {
        return res.status(200).json({ ok: true, found: false });
      }

      const link = `${siteUrl}/my-events?phone=${digits}&token=${makeToken(digits)}`;
      const sent = await sendSMS(
        digits,
        `Manitou Beach Events\n\nHere's everything you've got on the calendar (${mine.length}):\n${link}\n\nTap to edit any of them. This link keeps working, so hang onto it.`
      );

      return res.status(200).json({ ok: true, found: true, sent, count: mine.length });
    } catch (err) {
      console.error('my-events POST error:', err.message);
      return res.status(500).json({ error: 'Something went wrong on our end. Give it another go?' });
    }
  }

  // ── LOAD THE LIST ──
  if (req.method === 'GET') {
    const digits = normalizePhone(req.query.phone);
    if (!validToken(digits, req.query.token)) {
      return res.status(403).json({ error: 'This link has expired. Request a fresh one and we\'ll text it over.' });
    }

    try {
      return res.status(200).json({ events: eventsForPhone(await fetchAllEvents(), digits) });
    } catch (err) {
      console.error('my-events GET error:', err.message);
      return res.status(500).json({ error: 'Something went wrong on our end.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
