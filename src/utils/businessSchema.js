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
  'Restaurant': 'Restaurant', 'Bar': 'BarOrPub', 'Real Estate': 'RealEstateAgent',
  'Marina': 'Marina', 'Retail': 'Store', 'Hotel': 'LodgingBusiness',
  'Vacation Rental': 'LodgingBusiness', 'Food Truck': 'FoodEstablishment',
  'Winery': 'Winery', 'Art Gallery': 'ArtGallery', 'Bakery': 'Bakery',
  'Cafe': 'CafeOrCoffeeShop', 'Auto': 'AutoRepair', 'Beauty': 'BeautySalon',
  'Fitness': 'SportsActivityLocation',
};

export function isServiceAreaBusiness(biz) {
  return biz?.businessType === 'Service Area' || biz?.businessType === 'Mobile & Markets';
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
        addressLocality: 'Manitou Beach',
        addressRegion: 'MI', addressCountry: 'US',
      },
    }),
    ...(!serviceArea && biz.lat && biz.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: biz.lat, longitude: biz.lng },
    }),

    // Owner-entered hours are free text; days that cannot be parsed are dropped
    // rather than guessed. See openingHours.js.
    ...(hoursSpec.length && { openingHoursSpecification: hoursSpec }),

    areaServed: {
      '@type': 'Place',
      name: biz.serviceArea?.trim() || 'Manitou Beach, Devils Lake, Michigan',
    },
    containedInPlace: {
      '@type': 'Place', name: 'Manitou Beach',
      address: { '@type': 'PostalAddress', addressLocality: 'Manitou Beach', addressRegion: 'MI', addressCountry: 'US' },
    },
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
