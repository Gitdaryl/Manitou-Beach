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

import { list, put } from '@vercel/blob';

const PREFIX = 'organizer-links/';

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
