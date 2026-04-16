/**
 * Convert a display name to a URL-safe slug.
 * Used to generate /business/:slug and /food-trucks/:slug paths.
 *
 * Example: "Holly's Real Estate" → "hollys-real-estate"
 */
export const toSlug = name =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
