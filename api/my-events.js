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

// A year, not a month: this link becomes a home screen icon, and an icon that
// dies after 30 days is worse than no icon at all.
const TTL_MS = 365 * 24 * 60 * 60 * 1000;

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

function orgNameFor(pages, digits) {
  const page = pages.find(p => normalizePhone(p.properties['Phone']?.phone_number || '') === digits);
  return (page?.properties['Organizer Name']?.rich_text || []).map(x => x.plain_text).join('') || '';
}

// A business often has more than one person posting - at Gypsy Blue the owner
// and her daughter both submit, under their own phones. Each phone only ever
// sees what it submitted, which looks like half the calendar went missing.
//
// We do NOT merge them automatically. Email isn't verified at submission, so
// anyone who typed a business's address into the form could then look up their
// own phone and walk away with edit links for that whole business. Instead we
// notice the other number and offer to text IT - the link only ever lands on
// the phone already on the record, so there's nothing to escalate.
function otherNumbersFor(pages, digits) {
  const emailOf = p => (p.properties['Email']?.email || '').trim().toLowerCase();
  const myEmails = new Set(
    pages
      .filter(p => normalizePhone(p.properties['Phone']?.phone_number || '') === digits)
      .map(emailOf)
      .filter(Boolean)
  );
  if (myEmails.size === 0) return [];

  const counts = new Map();
  for (const p of pages) {
    const phone = normalizePhone(p.properties['Phone']?.phone_number || '');
    if (phone.length !== 10 || phone === digits) continue;
    if (!myEmails.has(emailOf(p))) continue;
    counts.set(phone, (counts.get(phone) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([phone, count]) => ({ phone, count, masked: `(${phone.slice(0, 3)}) •••-${phone.slice(6)}` }));
}

export default async function handler(req, res) {
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  // ── SEND THE LINK ──
  if (req.method === 'POST') {
    const digits = normalizePhone((req.body || {}).phone);
    if (digits.length !== 10) {
      return res.status(400).json({ error: 'Pop in the phone number you used when you added your events.' });
    }

    // ── SEND A LINK TO THE OTHER PERSON AT THIS BUSINESS ──
    // The target is recomputed server-side from the caller's own verified
    // events. A client-supplied phone number is never used as the destination.
    const { token, sendTo } = req.body || {};
    if (sendTo !== undefined) {
      if (!validToken(digits, token)) {
        return res.status(403).json({ error: 'This link has expired. Request a fresh one and we\'ll text it over.' });
      }
      try {
        const pages = await fetchAllEvents();
        const target = otherNumbersFor(pages, digits)[Number(sendTo)];
        if (!target) return res.status(404).json({ error: 'We couldn\'t find that number anymore.' });

        const org = orgNameFor(pages, digits);
        const link = `${siteUrl}/my-events?phone=${target.phone}&token=${makeToken(target.phone)}`;
        const sent = await sendSMS(
          target.phone,
          `Manitou Beach Events\n\nSomeone at ${org || 'your business'} asked us to send you your event list (${target.count}):\n${link}\n\nTap to edit any of them, or add it to your home screen.`
        );
        return res.status(200).json({ ok: true, sent, masked: target.masked });
      } catch (err) {
        console.error('my-events sendTo error:', err.message);
        return res.status(500).json({ error: 'Something went wrong on our end. Give it another go?' });
      }
    }

    try {
      const mine = eventsForPhone(await fetchAllEvents(), digits);
      if (mine.length === 0) {
        return res.status(200).json({ ok: true, found: false });
      }

      const link = `${siteUrl}/my-events?phone=${digits}&token=${makeToken(digits)}`;
      const sent = await sendSMS(
        digits,
        `Manitou Beach Events\n\nHere's everything you've got on the calendar (${mine.length}):\n${link}\n\nTap to edit any of them, or add it to your home screen for one-tap access.`
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
      const pages = await fetchAllEvents();
      return res.status(200).json({
        events: eventsForPhone(pages, digits),
        // Masked only - the raw number never leaves the server.
        otherNumbers: otherNumbersFor(pages, digits).map(({ masked, count }) => ({ masked, count })),
      });
    } catch (err) {
      console.error('my-events GET error:', err.message);
      return res.status(500).json({ error: 'Something went wrong on our end.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
