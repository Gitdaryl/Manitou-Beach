// ============================================================
// Public event galleries  (/gallery/:slug  +  hub at /gallery)
// ------------------------------------------------------------
// Two kinds of gallery, both live here:
//
//  • CURATED — photos you place yourself:
//      1. Run  ./scripts/optimize-gallery.sh <source-dir> <slug> <prefix>
//         (creates full .webp, /thumbs/ .webp, and .jpg in public/images/galleries/<slug>/)
//      2. Add an entry below with the count it reports.
//
//  • CROWD — community submits photos at the event (scan → upload):
//      Add an entry with  crowd: true  and  count: 0. No files needed; the
//      photos flow in through /api/photos-upload and appear automatically.
//      IMPORTANT: also add the slug to api/lib/photo-slugs.js (server allowlist).
//
// A gallery can be both (curated seed photos + open crowd submissions).
//
// NOTE: middleware.js keeps a small mirror of {slug -> title, cover} so shared
// links show the right preview. If you add a gallery here, add it there too.
// `order` (higher = newer) drives the hub sort; `cover` is the hub tile image.
// ============================================================

export const GALLERIES = {
  'mens-club': {
    title: "Men's Club",
    subtitle: 'Devils Lake & Round Lake Men’s Club events and get-togethers',
    date: '2026',
    order: 4,
    crowd: true,
    // Crowd uploads can be tagged to one of these; untagged photos land in the
    // `generalTitle` bucket. IMPORTANT: mirror the keys in api/lib/photo-slugs.js
    // (GALLERY_EVENTS).
    events: [
      { key: 'tip-up-festival', title: 'Tip-Up Festival', date: 'February' },
      { key: 'firecracker-7k', title: 'Firecracker 7K', date: 'July 4th' },
      { key: 'fireworks', title: 'July 4th Fireworks', date: 'July 4th' },
      { key: 'golf-outing', title: 'Golf Outing', date: 'Summer' },
    ],
    generalTitle: 'Club Life',
    count: 0,
    cover: '/images/og/mensclub-og.jpg',
    ogDescription:
      'Community photos from the Devils Lake & Round Lake Men’s Club in Manitou Beach, Michigan. Add yours and share.',
  },
  'america-250': {
    title: 'America 250',
    subtitle: 'Our town’s 250th of July celebration on Devils Lake',
    date: 'July 2026',
    order: 3,
    crowd: true,
    events: [
      { key: 'boat-parade', title: 'Boat Parades', date: 'July 3rd' },
      { key: 'fireworks', title: 'Fireworks', date: 'July 3rd' },
      { key: 'firecracker-7k', title: 'Firecracker 7K', date: 'July 4th' },
      { key: 'skydivers', title: 'Skydivers', date: 'July 4th' },
    ],
    generalTitle: 'Random Fun',
    count: 0,
    cover: '/images/happening-hero.jpg',
    ogDescription:
      'Community photos from the America 250 celebration in Manitou Beach, Michigan. Add yours and share the day.',
  },
  'ladies-club': {
    title: 'Ladies Club',
    subtitle: 'Moments from Ladies Club events around Manitou Beach',
    date: '2026',
    order: 2,
    crowd: true,
    count: 0,
    cover: '/images/ladies-club/artists.jpg',
    ogDescription:
      'Community photos from Manitou Beach Ladies Club events on Devils Lake, Michigan. Add yours and share.',
  },
  'july-4-2026': {
    title: 'July 4th Weekend 2026',
    subtitle: 'Sunsets, sparklers, and lake life on Devils Lake',
    date: 'July 2026',
    order: 1,
    crowd: true,
    folder: '/images/galleries/july-4-2026',
    prefix: 'manitou-july-4-2026',
    count: 3,
    ogDescription:
      'Photos from July 4th weekend on Devils Lake in Manitou Beach, Michigan. View the gallery and share your favorites.',
  },
};

// Hub list: galleries as {slug, ...config}, newest first (by `order`, then title).
export function galleryList() {
  return Object.entries(GALLERIES)
    .map(([slug, g]) => ({ slug, ...g }))
    .sort((a, b) => (b.order || 0) - (a.order || 0) || a.title.localeCompare(b.title));
}

// First curated photo (webp) for a gallery, or its explicit cover, for hub tiles.
export function galleryCover(g) {
  if (g.cover) return g.cover;
  if (g.folder && g.prefix && g.count > 0) return `${g.folder}/${g.prefix}-01.webp`;
  return '/images/og-image.jpg';
}

// Build the ordered list of full-size photo paths for a gallery config.
export function galleryPhotos(g) {
  return Array.from({ length: g.count }, (_, i) =>
    `${g.folder}/${g.prefix}-${String(i + 1).padStart(2, '0')}.webp`
  );
}

// Full-size path -> lightweight grid thumbnail path.
// /dir/name.webp -> /dir/thumbs/name.webp
export const thumbSrc = (src) => src.replace(/\/([^/]+)$/, '/thumbs/$1');
