// ============================================================
// 📷  Snap keys — what a printed QR code resolves to
// ------------------------------------------------------------
// A poster's QR encodes one short, permanent URL: /snap/<key>.
// Nothing about a specific event is printed into the code, so a
// single board works for every event that org ever runs, and the
// routing stays changeable in software forever. Never print a deep
// link with query params — that is a poster you can't re-aim.
//
// At scan time /api/snap-resolve reads the live events feed and
// picks the most likely event. It NEVER decides silently: the page
// shows what it picked and lets the visitor change it in one tap,
// so a wrong guess costs a tap instead of misfiling the photos.
//
// Adding a poster for an org that already has a crowd gallery = add
// a key here. Adding one for a venue (a winery that wants its own
// board) ALSO needs a crowd gallery in src/data/galleries.js and its
// slug in GALLERY_SLUGS (photo-slugs.js) — photos can only land in a
// crowd gallery, not on a business profile page.
// ============================================================

// `match` narrows the events feed to one org's events. null = open key:
// any event that maps to a crowd gallery is fair game (the travelling board).
export const SNAP_KEYS = {
  mensclub: {
    slug: 'mens-club',
    label: 'Devils Lake & Round Lake Men’s Club',
    match: ['men’s club', "men's club", 'mens club', 'tip-up', 'tip up', 'firecracker', 'golf outing'],
  },
  ladiesclub: {
    slug: 'ladies-club',
    label: 'Manitou Beach Ladies Club',
    match: ['ladies club', 'ladies’ club', "ladies' club"],
  },
  autoshow: {
    slug: 'auto-show-2026',
    label: 'Devils & Round Lake Auto Show',
    match: ['auto show', 'car show'],
  },
  // The travelling board: works at whatever is on today, wherever it is.
  mb: {
    slug: null,
    label: 'Manitou Beach',
    match: null,
  },
};

// Notion event name → the gallery event tag it should be filed under.
// Tags must exist in GALLERY_EVENTS (photo-slugs.js) or cleanEvent drops them
// to the gallery's general bucket, which is a safe failure, not a broken one.
export const EVENT_TAG_MATCHERS = {
  'mens-club': [
    { event: 'golf-outing', terms: ['golf'] },
    { event: 'tip-up-festival', terms: ['tip-up', 'tip up'] },
    { event: 'firecracker-7k', terms: ['firecracker', '7k'] },
    { event: 'fireworks', terms: ['firework'] },
  ],
  'america-250': [
    { event: 'boat-parade', terms: ['boat parade', 'flotilla'] },
    { event: 'fireworks', terms: ['firework'] },
    { event: 'firecracker-7k', terms: ['firecracker', '7k'] },
    { event: 'skydivers', terms: ['skydiv', 'jump team'] },
  ],
};

const norm = (s) => String(s || '').toLowerCase().replace(/[’']/g, "'").trim();

// Does this event name belong to the org behind a snap key?
export function matchesOrg(keyCfg, eventName) {
  if (!keyCfg?.match) return true; // open key
  const n = norm(eventName);
  return keyCfg.match.some((t) => n.includes(norm(t)));
}

// Which gallery does an event belong to, for the open `mb` key? First org
// whose match terms hit wins; events belonging to no org get no gallery.
export function galleryForEvent(eventName) {
  for (const [key, cfg] of Object.entries(SNAP_KEYS)) {
    if (cfg.slug && cfg.match && matchesOrg(cfg, eventName)) return { key, slug: cfg.slug };
  }
  return null;
}

// Which event tag inside that gallery? '' means the gallery's general bucket.
export function tagForEvent(slug, eventName) {
  const n = norm(eventName);
  for (const m of EVENT_TAG_MATCHERS[slug] || []) {
    if (m.terms.some((t) => n.includes(norm(t)))) return m.event;
  }
  return '';
}
