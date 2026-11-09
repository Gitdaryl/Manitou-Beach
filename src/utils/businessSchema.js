// Single source of truth for a business listing's schema.org JSON-LD.
//
// This is imported by BOTH:
//   - src/pages/BusinessProfilePage.jsx  (client render, for browsers + Google)
//   - middleware.js                      (edge, stamped into the HTML for crawlers
//                                         that never execute JavaScript)
//
// It exists because those two used to carry separate copies that drifted: the
// server-side one still emitted a hardcoded areaServed and no opening hours long
// after the client version had both. Anything JS-less - most AI crawlers - saw the
// stale one. Keep this the only place the schema is built.
//
// Input is a business object exactly as /api/businesses returns it.

import { buildOpeningHoursSpec } from './openingHours.js';

const SCHEMA_TYPES = {
  'Restaurant': 'Restaurant', 'Bar': 'BarOrPub', 'Real Estate': 'RealEstateAgent', 'Insurance': 'InsuranceAgency',
  'Marina': 'Marina', 'Retail': 'Store', 'Hotel': 'LodgingBusiness',
  'Vacation Rental': 'LodgingBusiness', 'Food Truck': 'FoodEstablishment',
  'Winery': 'Winery', 'Art Gallery': 'ArtGallery', 'Bakery': 'Bakery',
  'Cafe': 'CafeOrCoffeeShop', 'Auto': 'AutoRepair', 'Beauty': 'BeautySalon',
  'Fitness': 'SportsActivityLocation',
};

// "Will travel further" is a willingness, not a place - it would be meaningless
// (and unmatchable) as a schema.org Place, so it never reaches areaServed.
const NON_PLACE_AREAS = new Set(['Will travel further']);

function buildAreaServed(biz) {
  const named = (biz.serviceAreas || []).filter(a => a && !NON_PLACE_AREAS.has(a));
  const custom = (biz.serviceArea || '').trim();
  const places = [...named, ...(custom ? [custom] : [])];
  if (!places.length) return { '@type': 'Place', name: 'Manitou Beach, Devils Lake, Michigan' };
  if (places.length === 1) return { '@type': 'Place', name: places[0] };
  return places.map(name => ({ '@type': 'Place', name }));
}

export function isServiceAreaBusiness(biz) {
  return biz?.businessType === 'Service Area' || biz?.businessType === 'Mobile & Markets';
}

// The town in a free-text address. Needs a comma before the town, so write
// "123 Main St, Hudson, MI". Falls back to Manitou Beach.
export function localityFromAddress(address) {
  const parts = String(address || '').split(',').map(s => s.trim()).filter(Boolean)
    .filter(s => !/^(US|USA|United States)\.?$/i.test(s));
  for (let i = parts.length - 1; i >= 1; i--) {
    const cleaned = parts[i]
      .replace(/\s*\b\d{5}(-\d{4})?\b\s*$/, '')
      .replace(/[,\s]*\b(Michigan|Ohio|Indiana)\b\.?\s*$/i, '')
      .replace(/[,\s]*\b(MI|OH|IN)\b\.?\s*$/i, '')
      .replace(/^[A-Z]{2}$/, '')
      .trim();
    if (cleaned && !/^\d+$/.test(cleaned)) return cleaned;
    // "Curtice, OH 43412": the last part was only a state, so the town is the first part.
    if (i === 1 && !/^\d/.test(parts[0])) return parts[0];
  }
  return 'Manitou Beach';
}

// The two-letter state in a free-text address, so a listing based out of state
// (an Ohio contractor serving Lenawee, say) is not published as Michigan.
// No state written means Michigan, which is every listing before Nov 2026.
const STATE_NAMES = { MI: 'Michigan', OH: 'Ohio', IN: 'Indiana' };
export function regionFromAddress(address) {
  // Only the last comma part can hold the state; a street like "Indiana Ave" must not count.
  const parts = String(address || '').split(',').map(s => s.trim()).filter(Boolean)
    .filter(s => !/^(US|USA|United States)\.?$/i.test(s));
  if (parts.length < 2) return 'MI';
  const last = parts[parts.length - 1].replace(/\s*\b\d{5}(-\d{4})?\s*$/, '').trim();
  const named = Object.keys(STATE_NAMES).find(k => STATE_NAMES[k].toLowerCase() === last.toLowerCase());
  if (named) return named;
  const code = last.match(/(?:^|\s)([A-Za-z]{2})\.?$/);
  return code ? code[1].toUpperCase() : 'MI';
}
export function regionName(code) {
  return STATE_NAMES[code] || code;
}

export function buildBusinessSchema(biz) {
  if (!biz) return null;
  const serviceArea = isServiceAreaBusiness(biz);
  const hoursSpec = buildOpeningHoursSpec(biz.hours);

  return {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPES[biz.category] || 'LocalBusiness',
    name: biz.name,
    ...(biz.description && { description: biz.description }),
    ...(biz.phone && { telephone: biz.phone }),
    ...(biz.website && { url: biz.website }),
    ...(biz.logo && { image: biz.logo }),

    // Google's guidance for service-area businesses is to omit the street address
    // and describe coverage instead. These listings often run out of a home.
    ...(!serviceArea && biz.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: biz.address,
        addressLocality: localityFromAddress(biz.address),
        addressRegion: regionFromAddress(biz.address), addressCountry: 'US',
      },
    }),
    ...(!serviceArea && biz.lat && biz.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: biz.lat, longitude: biz.lng },
    }),

    // Owner-entered hours are free text; days that cannot be parsed are dropped
    // rather than guessed. See openingHours.js.
    ...(hoursSpec.length && { openingHoursSpecification: hoursSpec }),

    // Checklist areas become one named Place each, which local and AI search can
    // actually match against. A custom typed area is appended as its own Place, so
    // it still counts even before anyone gives it a shape for the map.
    areaServed: buildAreaServed(biz),
    // Extra offices of the same business, each a full place with its own phone.
    ...(!serviceArea && biz.otherLocations?.length && {
      department: biz.otherLocations.map(loc => ({
        '@type': SCHEMA_TYPES[biz.category] || 'LocalBusiness',
        name: `${biz.name}, ${loc.name || localityFromAddress(loc.address)}`,
        ...(loc.phone && { telephone: loc.phone }),
        address: {
          '@type': 'PostalAddress',
          streetAddress: loc.address,
          addressLocality: localityFromAddress(loc.address),
          addressRegion: regionFromAddress(loc.address), addressCountry: 'US',
        },
      })),
    }),
    ...(regionFromAddress(biz.address) === 'MI' && { containedInPlace: {
      '@type': 'Place', name: 'Manitou Beach',
      address: { '@type': 'PostalAddress', addressLocality: 'Manitou Beach', addressRegion: 'MI', addressCountry: 'US' },
    } }),
    memberOf: { '@type': 'Organization', name: 'Manitou Beach Michigan', url: 'https://manitoubeachmichigan.com' },
  };
}

// The full set of JSON-LD blocks for a business page: the business itself, plus
// its FAQ block when the listing has one.
export function buildBusinessSchemaBlocks(biz) {
  const main = buildBusinessSchema(biz);
  if (!main) return [];
  return biz.geoFaq
    ? [main, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: biz.geoFaq }]
    : [main];
}
