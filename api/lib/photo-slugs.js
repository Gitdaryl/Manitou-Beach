// ============================================================
// Crowd-gallery slug allowlist (server-side)
// ------------------------------------------------------------
// API functions can't reliably import from src/, so this mirrors the
// `crowd: true` galleries in src/data/galleries.js. It's the guard that
// stops strangers inventing arbitrary gallery slugs to write into.
// Keep in sync when you add a crowd gallery.
// ============================================================

export const GALLERY_SLUGS = new Set([
  'mens-club',
  'america-250',
  'ladies-club',
  'july-4-2026',
]);

// Event tags allowed per gallery (mirrors `events` in src/data/galleries.js).
// Unknown tags are silently dropped to '' (Club Life) — never trusted from the client.
export const GALLERY_EVENTS = {
  'mens-club': new Set(['tip-up-festival', 'firecracker-7k', 'fireworks', 'golf-outing']),
};

export function cleanEvent(slug, event) {
  const e = String(event || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  return GALLERY_EVENTS[slug]?.has(e) ? e : '';
}
