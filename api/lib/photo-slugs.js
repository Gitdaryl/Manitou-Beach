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
