// ============================================================
// MARKETPLACE - homes and land for sale by owner
// ============================================================
// One object per listing. Photos live in
// /public/images/marketplace/<slug>/{full,thumb}/<id>.webp
// and the listing renders at /marketplace/<slug>.
// Also add the slug to OG_MAP in middleware.js and to api/sitemap.js.
// Set status to 'Sold' (or remove the object) when the home sells.

export const MARKETPLACE_LISTINGS = [
  {
    slug: '17239-manitou-rd',
    status: 'For Sale by Owner',
    address: '17239 Manitou Rd',
    city: 'Addison',
    state: 'MI',
    zip: '49220',
    price: '$589,900',
    tagline: '10 acres, a finished shop, and room for every toy you own',
    summary: '5 bed, 3 bath country home on 10.1 acres with a 36x70 finished shop, a finished 24x24 outbuilding, and a 30x40 pad ready for your next build.',
    description:
      "Ten acres of open country just down the road from Devils Lake. The 1996 home gives you 2,560 square feet with five bedrooms, three full baths, central air, and a fully finished basement with its own full bath and two more bedrooms. An indoor wood burner keeps things cozy, with propane as backup, and the water heater and furnace are both less than five years old. A heated breezeway with the laundry connects the house to the two-car garage. Then there is the part the gearheads will love: a fully finished 36x70 shop with a two-post hoist, an office, a bathroom, and a concrete floor. Add a finished 24x24 outbuilding with heat, air, and hot and cold water, plus a 30x40 concrete pad with water and sewer already there, and you have room for just about anything.",
    facts: {
      Bedrooms: '5',
      'Full Baths': '3',
      'Sq Ft': '2,560',
      Acres: '10.1',
      'Year Built': '1996',
    },
    features: [
      {
        title: 'The Home',
        items: [
          '5 bedrooms, 3 full baths, 2,560 sq ft',
          'Fully finished basement with its own full bath and 2 bedrooms',
          'Central air',
          'Indoor wood burner with propane backup',
          'New water heater and furnace within the past 5 years',
          'New siding in 2015',
          'Heated breezeway with the washer and dryer, connecting to the 2-car garage',
        ],
      },
      {
        title: 'The Shop & Outbuildings',
        items: [
          '36x70 fully finished shop: 2-post hoist, office, bathroom, concrete floor',
          '24x24 fully finished outbuilding with heat, air conditioning, and hot and cold water',
          '30x40 concrete pad (former pole barn site) with water and sewer at the pad',
        ],
      },
      {
        title: 'The Land',
        items: [
          '10.1 acres of open lawn and tree line',
          'Fire pit ringed by a hanging-swing pergola',
          'About 1.4 miles from Manitou Beach and Devils Lake',
        ],
      },
    ],
    contact: {
      name: 'Bryson',
      phone: '(517) 575-3010',
      tel: '+15175753010',
    },
    showingNote:
      'Private showings by appointment only. Out of respect for the family, please do not stop by or knock at the house. Call or text Bryson to set up a time.',
    heroImage: 'house-ext-6',
    gallery: [
      'house-ext-6', 'house-ext-front-1', 'house-ext-5', 'home-ext-1', 'house-ext-4', 'house-ext-3', 'house-ext-2',
      'living-1', 'living-2', 'kitchen-1', 'kitchen-3', 'kitchen-4', 'kitchen-2',
      'bed-1', 'bed-1-2', 'main-bath', 'bed-2', 'bed2-2', 'bathroom-2',
      'laundry-1', 'laundry-2', 'garage',
      'basement-1', 'basement-2', 'basement-3', 'basement-4', 'basement-bed',
      'shed-ext-1', 'shed-ext-2', 'shed-ext-3', 'shed-2', 'shed-3', 'shed-4', 'shed-5', 'shed-6', 'shed-1',
      'cottage-ext-1', 'cottage-ext-2', 'cottage-2',
      'firepit-1', 'firepit-2', 'property-outline-2', 'property-outline-1',
    ],
    // Shown letterboxed on a blurred fill, never hard-cropped
    portraits: ['bathroom-2'],
    gallerySections: [
      { label: 'Outside', startId: 'house-ext-6' },
      { label: 'Inside', startId: 'living-1' },
      { label: 'Basement', startId: 'basement-1' },
      { label: 'The Shop', startId: 'shed-ext-1' },
      { label: 'Outbuilding', startId: 'cottage-ext-1' },
      { label: 'The Land', startId: 'firepit-1' },
    ],
    mapQuery: '17239 Manitou Rd, Addison, MI 49220',
    // Driving distances via OSRM from the Census-geocoded address
    // (41.96462, -84.32772), Oct 2026. Rounded.
    area: [
      { name: 'Manitou Beach & Devils Lake', dist: '1.4 mi', time: '4 min' },
      { name: 'Addison', dist: '3 mi', time: '7 min' },
      { name: 'Hudson', dist: '10 mi', time: '15 min' },
      { name: 'Michigan International Speedway', dist: '14 mi', time: '25 min' },
      { name: 'Adrian', dist: '18 mi', time: '32 min' },
      { name: 'Ann Arbor', dist: '56 mi', time: '1 hr 10 min' },
    ],
  },
];

export function getListing(slug) {
  return MARKETPLACE_LISTINGS.find((l) => l.slug === slug);
}
