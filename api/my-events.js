// /api/my-events.js
// One link that shows an organizer every event on their business's calendar.
//
// POST { phone }                     → texts them a magic link (no code to type in)
// GET  ?phone=X&token=Y              → their events, each with its edit link
// POST { phone, token, invite: i }   → invites another number to share the list
// GET  ?invite=T                     → who's inviting whom, for the accept screen
// POST { acceptInvite: T }           → links the two numbers, returns credentials
//
// Edit tokens are per-event and there was no way to see them all in one place,
// so an organizer who logged a month of events had to hunt through old texts.
// Auth is a signed link texted to the phone already on their event records -
// same trust model as the per-event edit links we already send by SMS.

import crypto from 'crypto';
import { sendSMS, normalizePhone } from './lib/twilio.js';
import { linkedPhones, linkPhones, makeToken, validToken, displayNames, setDisplayName } from './lib/organizer-links.js';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function signInvite(from, to, exp) {
  return crypto
    .createHmac('sha256', process.env.NOTION_TOKEN_EVENTS)
    .update(`my-events-invite:${from}:${to}:${exp}`)
    .digest('hex');
}

function makeInvite(from, to) {
  const exp = Date.now() + INVITE_TTL_MS;
  return `${exp}.${from}.${to}.${signInvite(from, to, exp)}`;
}

function readInvite(raw) {
  const [expStr, from, to, sig] = String(raw || '').split('.');
  const exp = Number(expStr);
  if (!exp || !from || !to || !sig || Date.now() > exp) return null;
  const expected = signInvite(from, to, exp);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return { from, to };
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
function eventsForPhones(pages, phones) {
  const mine = new Set(Array.isArray(phones) ? phones : [phones]);
  const rt = (p, k) => (p[k]?.rich_text || []).map(x => x.plain_text).join('');
  return pages
    .filter(page => mine.has(normalizePhone(page.properties['Phone']?.phone_number || '')))
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

function orgNameFor(pages, phones) {
  const mine = new Set(Array.isArray(phones) ? phones : [phones]);
  const page = pages.find(p => mine.has(normalizePhone(p.properties['Phone']?.phone_number || '')));
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
function otherNumbersFor(pages, phones) {
  const mine = new Set(Array.isArray(phones) ? phones : [phones]);
  const emailOf = p => (p.properties['Email']?.email || '').trim().toLowerCase();
  const myEmails = new Set(
    pages
      .filter(p => mine.has(normalizePhone(p.properties['Phone']?.phone_number || '')))
      .map(emailOf)
      .filter(Boolean)
  );
  if (myEmails.size === 0) return [];

  const counts = new Map();
  for (const p of pages) {
    const phone = normalizePhone(p.properties['Phone']?.phone_number || '');
    if (phone.length !== 10 || mine.has(phone)) continue;
    if (!myEmails.has(emailOf(p))) continue;
    counts.set(phone, (counts.get(phone) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([phone, count]) => ({ phone, count, masked: `(${phone.slice(0, 3)}) •••-${phone.slice(6)}` }));
}

export default async function handler(req, res) {
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  // ── ACCEPT AN INVITE ──
  // Possession of the invite is the proof, exactly like the per-event edit
  // links: it was texted to that phone and nowhere else.
  if (req.method === 'POST' && (req.body || {}).acceptInvite) {
    const parsed = readInvite(req.body.acceptInvite);
    if (!parsed) return res.status(403).json({ error: 'That invite has expired. Ask them to send a new one.' });
    try {
      await linkPhones(parsed.from, parsed.to);
      if (req.body.displayName !== undefined) {
        await setDisplayName(parsed.to, req.body.displayName).catch(() => {});
      }
      return res.status(200).json({ ok: true, phone: parsed.to, token: makeToken(parsed.to) });
    } catch (err) {
      console.error('my-events accept error:', err.message);
      return res.status(500).json({ error: 'Couldn\'t link those up. Give it another go?' });
    }
  }

  // ── SEND THE LINK ──
  if (req.method === 'POST') {
    const digits = normalizePhone((req.body || {}).phone);
    if (digits.length !== 10) {
      return res.status(400).json({ error: 'Pop in the phone number you used when you added your events.' });
    }

    // ── NAME YOURSELF ──
    if (req.body.displayName !== undefined && req.body.invite === undefined) {
      if (!validToken(digits, (req.body || {}).token)) {
        return res.status(403).json({ error: 'This link has expired. Request a fresh one and we\'ll text it over.' });
      }
      try {
        await setDisplayName(digits, req.body.displayName);
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error('my-events name error:', err.message);
        return res.status(500).json({ error: 'Couldn\'t save that. Give it another go?' });
      }
    }

    // ── INVITE THE OTHER PERSON TO SHARE THE LIST ──
    // The target is recomputed server-side from the caller's own verified
    // events. A client-supplied phone number is never used as the destination,
    // so the invite can only ever land on a phone already on the records.
    const { token, invite } = req.body || {};
    if (invite !== undefined) {
      if (!validToken(digits, token)) {
        return res.status(403).json({ error: 'This link has expired. Request a fresh one and we\'ll text it over.' });
      }
      try {
        const pages = await fetchAllEvents();
        const mine = await linkedPhones(digits);
        const target = otherNumbersFor(pages, mine)[Number(invite)];
        if (!target) return res.status(404).json({ error: 'We couldn\'t find that number anymore.' });

        if (req.body.displayName !== undefined) {
          await setDisplayName(digits, req.body.displayName).catch(() => {});
        }
        const org = orgNameFor(pages, mine);
        const link = `${siteUrl}/my-events?invite=${makeInvite(digits, target.phone)}`;
        // The inviter's full number is shown on purpose. It's how the person
        // receiving this decides whether they recognise the request.
        const sent = await sendSMS(
          target.phone,
          `Manitou Beach Events\n\n(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)} wants to share the ${org || 'business'} event list with you, so you can both edit any event.\n\nTap to accept:\n${link}\n\nDon't recognise that number? Just ignore this.`
        );
        return res.status(200).json({ ok: true, sent, masked: target.masked });
      } catch (err) {
        console.error('my-events invite error:', err.message);
        return res.status(500).json({ error: 'Something went wrong on our end. Give it another go?' });
      }
    }

    try {
      const mine = eventsForPhones(await fetchAllEvents(), await linkedPhones(digits));
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

  // ── WHO'S INVITING WHOM (for the accept screen) ──
  if (req.method === 'GET' && req.query.invite) {
    const parsed = readInvite(req.query.invite);
    if (!parsed) return res.status(403).json({ error: 'That invite has expired. Ask them to send a new one.' });
    try {
      const pages = await fetchAllEvents();
      return res.status(200).json({
        invite: {
          // The number is always shown, never replaced by the name: a display
          // name is chosen by the sender, so it's the number that proves who
          // this actually is.
          fromName: (await displayNames()).get(parsed.from) || '',
          fromMasked: `(${parsed.from.slice(0, 3)}) ${parsed.from.slice(3, 6)}-${parsed.from.slice(6)}`,
          org: orgNameFor(pages, [parsed.from, parsed.to]),
          count: eventsForPhones(pages, [parsed.from, parsed.to]).length,
        },
      });
    } catch (err) {
      console.error('my-events invite lookup error:', err.message);
      return res.status(500).json({ error: 'Something went wrong on our end.' });
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
      const mine = await linkedPhones(digits);
      const names = await displayNames();
      return res.status(200).json({
        events: eventsForPhones(pages, mine),
        shared: mine.length > 1,
        displayName: names.get(digits) || '',
        crew: mine.filter(p => p !== digits).map(p => names.get(p) || `(${p.slice(0, 3)}) •••-${p.slice(6)}`),
        // Masked only - the raw number never leaves the server.
        otherNumbers: otherNumbersFor(pages, mine).map(({ phone, masked, count }) => ({
          masked, count, name: names.get(phone) || '',
        })),
      });
    } catch (err) {
      console.error('my-events GET error:', err.message);
      return res.status(500).json({ error: 'Something went wrong on our end.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
