// ============================================================
// Public event galleries  (/gallery/:slug)
// ------------------------------------------------------------
// To add a new gallery:
//   1. Run  ./scripts/optimize-gallery.sh <source-dir> <slug> <prefix>
//      (creates full .webp, /thumbs/ .webp, and .jpg in public/images/galleries/<slug>/)
//   2. Add an entry below with the count it reports.
// That's it — the route, masonry grid, lightbox, and sharing all work automatically.
//
// NOTE: middleware.js keeps a small mirror of {slug -> folder, prefix, title} so shared
// links show the right photo preview. If you add a gallery here, add it there too.
// ============================================================

export const GALLERIES = {
  'july-4-2026': {
    title: 'July 4th Weekend 2026',
    subtitle: 'Sunsets, sparklers, and lake life on Devils Lake',
    date: 'July 2026',
    folder: '/images/galleries/july-4-2026',
    prefix: 'manitou-july-4-2026',
    count: 3,
    ogDescription:
      'Photos from July 4th weekend on Devils Lake in Manitou Beach, Michigan. View the gallery and share your favorites.',
  },
};

// Build the ordered list of full-size photo paths for a gallery config.
export function galleryPhotos(g) {
  return Array.from({ length: g.count }, (_, i) =>
    `${g.folder}/${g.prefix}-${String(i + 1).padStart(2, '0')}.webp`
  );
}

// Full-size path -> lightweight grid thumbnail path.
// /dir/name.webp -> /dir/thumbs/name.webp
export const thumbSrc = (src) => src.replace(/\/([^/]+)$/, '/thumbs/$1');
