// Named service areas a travelling business can claim.
//
// One list, used by:
//   - the listing form (the checklist)
//   - api/businesses.js  (whitelist on write)
//   - businessSchema.js  (structured areaServed, better than free text for local/AI search)
//   - the Discover map    (phase 3c: highlight the claimed areas - `center`/`radiusMiles`)
//
// Owners can also type an area that is not here. Custom areas still reach the
// schema, they just cannot be drawn until someone gives them a shape. When the
// same custom area keeps appearing, promote it: add a row below with a centre and
// radius and it starts rendering. The daily category-QA digest reports repeats.
//
// Centres are taken from the POI coordinates already in discover.js where possible.
// `radiusMiles` is a rough visual footprint, not a legal boundary.

export const SERVICE_AREAS = [
  { name: 'Devils Lake',           center: { lat: 41.9795, lng: -84.3088 }, radiusMiles: 2.5 },
  { name: 'Round Lake',            center: { lat: 41.9580, lng: -84.3200 }, radiusMiles: 1.5 },
  { name: 'Manitou Beach Village', center: { lat: 41.9720, lng: -84.3040 }, radiusMiles: 1 },
  { name: 'Irish Hills',           center: { lat: 42.0500, lng: -84.2500 }, radiusMiles: 10 },
  { name: 'Addison',               center: { lat: 41.9887, lng: -84.3448 }, radiusMiles: 3 },
  { name: 'Onsted',                center: { lat: 42.0030, lng: -84.1870 }, radiusMiles: 3 },
  { name: 'Tecumseh',              center: { lat: 42.0100, lng: -83.9450 }, radiusMiles: 4 },
  { name: 'Adrian',                center: { lat: 41.9060, lng: -84.0280 }, radiusMiles: 5 },
  { name: 'Lenawee County',        center: { lat: 41.9000, lng: -84.0700 }, radiusMiles: 20 },
  // Deliberately has no geometry: it is a statement of willingness, not a place.
  { name: 'Will travel further',   center: null, radiusMiles: null },
];

export const SERVICE_AREA_NAMES = SERVICE_AREAS.map(a => a.name);

export function isKnownServiceArea(name) {
  return SERVICE_AREA_NAMES.includes(name);
}

// Only the claimed areas that can actually be drawn on a map.
export function drawableAreas(names = []) {
  return SERVICE_AREAS.filter(a => a.center && names.includes(a.name));
}

// Human-readable coverage line: "Devils Lake, Round Lake and Onsted".
export function formatServiceAreas(names = [], custom = '') {
  const parts = [...names.filter(Boolean)];
  if (custom && custom.trim()) parts.push(custom.trim());
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}
