// ============================================================
// Community Platform Configuration
// ============================================================
// Change these values to rebrand for a different community.
// Code reads from here; .env holds secrets (API keys, tokens).

export default {
  // ── Identity ──────────────────────────────────────────────
  name: 'Manitou Beach',
  tagline: 'Where the Lake Meets the Land',
  domain: 'manitoubeach.com',
  email: 'hello@manitoubeach.com',

  // ── Location ──────────────────────────────────────────────
  location: {
    state: 'Michigan',
    county: 'Lenawee',
    lat: 42.005,
    lng: -84.289,
    mapZoom: 13,
  },

  // ── Design tokens ─────────────────────────────────────────
  // Primary palette — imported by src/data/config.js as C
  colors: {
    cream: '#FAF6EF',
    warmWhite: '#F5F0E8',
    sand: '#E8DFD0',
    driftwood: '#C4B498',
    sage: '#7A8E72',
    sageDark: '#5C6F55',
    lakeBlue: '#5B7E95',
    lakeDark: '#3D5A6E',
    dusk: '#2D3B45',
    night: '#1A2830',
    sunset: '#D4845A',
    sunsetLight: '#E8A87C',
    warmGray: '#8A7E6E',
    text: '#3B3228',
    textLight: '#6B6052',
    textMuted: '#9A8E7E',
  },

  // ── Notion database IDs ───────────────────────────────────
  // Actual tokens live in .env; these IDs identify the databases
  notionDBs: {
    business: 'NOTION_DB_BUSINESS',
    events: 'NOTION_DB_EVENTS',
    pois: 'NOTION_DB_POIS',
    dispatchArticles: 'NOTION_DB_DISPATCH_ARTICLES',
    dispatchPromotions: 'NOTION_DB_DISPATCH_PROMOTIONS',
    dispatchIssues: 'NOTION_DB_DISPATCH_ISSUES',
    hero: 'NOTION_DB_HERO',
    claims: 'NOTION_DB_CLAIMS',
    promoClaims: 'NOTION_DB_PROMO_CLAIMS',
    websiteInquiries: 'NOTION_DB_WEBSITE_INQUIRIES',
    contact: 'NOTION_DB_CONTACT',
  },

  // ── Feature flags ─────────────────────────────────────────
  features: {
    voiceWidget: true,       // Vapi AI voice assistant
    dispatch: true,          // Community newspaper
    foodTrucks: true,        // Food truck locator
    wineries: true,          // Wine trail & ratings
    discover: true,          // Interactive discover map
    usa250: false,           // USA 250th anniversary page
    newsletter: true,        // Beehiiv newsletter integration
    promos: true,            // Promo/coupon system
  },

  // ── Stripe config ─────────────────────────────────────────
  stripe: {
    listingSlotCaps: { premium: 1, featured: 3 },
    listingCategories: [
      'Real Estate', 'Food & Drink', 'Boating & Water', 'Breweries & Wineries',
      'Shopping & Gifts', 'Stays & Rentals', 'Creative Media', 'Home Services',
      'Health & Beauty', 'Pet Services', 'Arts & Culture', 'Other',
    ],
  },
};
