// Links two organizer phone numbers so they manage one shared event list.
//
// A business rarely has one person posting. At Gypsy Blue the owner and her
// daughter both submit, each under their own phone, and each was seeing only
// half the calendar. The failure it causes is subtle: one spots a typo in an
// event the other posted, goes to fix it, and the event simply isn't there.
//
// The link lives here, server-side, keyed by phone - NOT inside the magic-link
// token. That matters because organizers install /my-events to their home
// screen, and the installed launcher has its token frozen into start_url. If
// membership rode in the token, linking would silently fail to reach the very
// people already using the app.
//
// The pathname encodes both numbers, so resolving a group never reads blob
// content: blob content reads are CDN cached and can go stale, but list()
// returns pathnames fresh. Contents are deliberately empty - anyone who could
// guess the pathname already knows both numbers.

import crypto from 'crypto';
import { list, put, del } from '@vercel/blob';

const PREFIX = 'organizer-links/';
const NOTICE_PREFIX = 'organizer-notices/';

// One heads-up per submitting session, not one per event. An organizer logging
// a month of gigs in one sitting must not fire a dozen texts at their partner.
const NOTICE_COOLDOWN_MS = 2 * 60 * 60 * 1000;

// A year, not a month: this link becomes a home screen icon, and an icon that
// dies after 30 days is worse than no icon at all.
const TTL_MS = 365 * 24 * 60 * 60 * 1000;

function sign(phone, exp) {
  return crypto
    .createHmac('sha256', process.env.NOTION_TOKEN_EVENTS)
    .update(`my-events:${phone}:${exp}`)
    .digest('hex');
}

export function makeToken(phone) {
  const exp = Date.now() + TTL_MS;
  return `${exp}.${sign(phone, exp)}`;
}

export function validToken(phone, token) {
  const [expStr, sig] = String(token || '').split('.');
  const exp = Number(expStr);
  if (!exp || !sig || Date.now() > exp) return false;
  const expected = sign(phone, exp);
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

function pathFor(a, b) {
  const [x, y] = [a, b].sort();
  return `${PREFIX}${x}--${y}.json`;
}

async function allPairs() {
  const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
  return blobs
    .map(b => b.pathname.slice(PREFIX.length).replace(/\.json$/, '').split('--'))
    .filter(pair => pair.length === 2 && pair.every(p => /^\d{10}$/.test(p)));
}

// Everyone sharing a list with this number, including the number itself.
// Follows links transitively so a third helper joins the same group.
export async function linkedPhones(digits) {
  let pairs;
  try {
    pairs = await allPairs();
  } catch (err) {
    // Never let a storage hiccup lock someone out of their own events.
    console.error('organizer-links: list failed, falling back to solo -', err.message);
    return [digits];
  }

  const group = new Set([digits]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const [a, b] of pairs) {
      if (group.has(a) && !group.has(b)) { group.add(b); grew = true; }
      if (group.has(b) && !group.has(a)) { group.add(a); grew = true; }
    }
  }
  return [...group];
}

export async function linkPhones(a, b) {
  await put(pathFor(a, b), '{}', {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// Blob's own uploadedAt is the timestamp - no need to encode one in the
// pathname, and list() returns fresh metadata even though content reads are
// CDN cached.
function noticePath(from, to) {
  return `${NOTICE_PREFIX}${from}_${to}.json`;
}

export async function recentlyNotified(from, to) {
  try {
    const { blobs } = await list({ prefix: noticePath(from, to), limit: 1 });
    if (!blobs.length) return false;
    return Date.now() - new Date(blobs[0].uploadedAt).getTime() < NOTICE_COOLDOWN_MS;
  } catch (err) {
    // If we can't tell, stay quiet. A missed heads-up beats a text storm.
    console.error('organizer-links: notice check failed -', err.message);
    return true;
  }
}

export async function markNotified(from, to) {
  await put(noticePath(from, to), '{}', {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// ── DISPLAY NAMES ──
// "Allie just added Back Porch Duo" reads like a person; "(419) 367-4607 just
// added Back Porch Duo" reads like a system. For a mother-and-daughter
// operation that difference is the whole point of the notification.
//
// The name lives in the pathname for the same reason the links do: list()
// returns pathnames fresh, while blob content reads are CDN cached and a
// rename would appear to do nothing. encodeURIComponent never emits "/", so
// splitting the path back apart is unambiguous.

const NAME_PREFIX = 'organizer-names/';

export function cleanDisplayName(raw) {
  return String(raw || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 40);
}

export async function displayNames() {
  const map = new Map();
  try {
    const { blobs } = await list({ prefix: NAME_PREFIX, limit: 1000 });
    for (const b of blobs) {
      const [phone, encoded] = b.pathname.slice(NAME_PREFIX.length).replace(/\.json$/, '').split('/');
      if (!/^\d{10}$/.test(phone) || !encoded) continue;
      try { map.set(phone, decodeURIComponent(encoded)); } catch { /* skip a malformed name */ }
    }
  } catch (err) {
    // Falling back to phone numbers is ugly but harmless.
    console.error('organizer-links: name lookup failed -', err.message);
  }
  return map;
}

export async function setDisplayName(phone, raw) {
  const name = cleanDisplayName(raw);
  if (!/^\d{10}$/.test(phone)) return;
  // The name is the pathname, so a rename is a delete plus a write.
  const { blobs } = await list({ prefix: `${NAME_PREFIX}${phone}/`, limit: 100 });
  await Promise.all(blobs.map(b => del(b.url).catch(() => {})));
  if (!name) return;
  await put(`${NAME_PREFIX}${phone}/${encodeURIComponent(name)}.json`, '{}', {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
