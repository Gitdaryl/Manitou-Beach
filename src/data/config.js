export const C = {
  cream:       "#FAF6EF",
  warmWhite:   "#F5F0E8",
  sand:        "#E8DFD0",
  driftwood:   "#C4B498",
  sage:        "#7A8E72",
  sageDark:    "#5C6F55",
  lakeBlue:    "#5B7E95",
  lakeDark:    "#3D5A6E",
  dusk:        "#2D3B45",
  night:       "#1A2830",
  sunset:      "#D4845A",
  sunsetLight: "#E8A87C",
  warmGray:    "#8A7E6E",
  text:        "#3B3228",
  textLight:   "#6B6052",
  textMuted:   "#9A8E7E",
};

// Community geo-center + map radius (miles) - used for food truck map bounds
// Change these values per community when duplicating for Yetickets
export const GEO = {
  centerLat: 42.0081,
  centerLng: -84.2794,
  mapRadiusMiles: 25,
};

// ============================================================
// 💛  PAGE SPONSORS - update to activate; null = show placeholder
// ============================================================
export const PAGE_SPONSORS = {
  home:                 null,
  happening:            null,
  'round-lake':         null,
  village:              null,
  fishing:              null,
  wineries:             null,
  'devils-lake':        null,
  dispatch:             null,
  discover:             null,
  stays:                null,
  'holly-yeti':         null,
  'food-trucks':        null,
  'historical-society': null,
  'nightlife':          null,
  // To activate a sponsor, replace null with an object:
  // pageName: { name: "Business Name", logo: "/path/to/logo.png", tagline: "Your tagline here", url: "https://example.com", expiresAt: "March 2027" }
};

// ============================================================
// 🧭  NAV SECTIONS
// USA250 - set true to make the page publicly visible + add to Community nav
export const USA250_PUBLIC = true;

// Slot caps per tier per category - disabled at Phase 1 launch.
// Profile tiers are unlimited; scarce directory positioning (Category Spotlight)
// ships in Phase 3 once density + traffic justify the price. To restore:
// SLOT_CAPS = { premium: 1, featured: 3 }
export const SLOT_CAPS = {};
export const LISTING_CATEGORIES = [
  "Food & Drink", "Food Truck", "Stays & Rentals", "Breweries & Wineries",
  "Boating & Water", "Events & Venues", "Shopping & Gifts", "Home Services",
  "Health & Beauty", "Real Estate", "Creative Media", "Pet Services",
  "Arts & Culture", "Activities", "Other",
];
// Drop your drone fireworks video in public/images/ and set the path here:
export const USA250_VIDEO_URL = "/images/fireworks/devilslake-fireworks-hero.mp4";

// ============================================================
export const SECTIONS = [
  { id: "home",       label: "Home" },
  { id: "happening",  label: "Events" },
  { id: "explore",    label: "Explore" },
  { id: "businesses", label: "Local Businesses" },
  { id: "living",     label: "Living Here" },
  { id: "about",      label: "About" },
];

// ============================================================
// 📋  BUSINESS DIRECTORY DATA
// ============================================================
// Village page editorial listings - hardcoded for the Walk the Village section only.
// BusinessDirectory is 100% Notion-driven and does NOT use this array.
// Category → accent color mapping (used by directory + business rows)
export const CAT_COLORS = {
  "Real Estate":        C.lakeBlue,
  "Food & Drink":       C.sunset,
  "Boating & Water":    C.sage,
  "Breweries & Wineries": "#8B5E3C",
  "Shopping & Gifts":   "#B07D62",
  "Stays & Rentals":    C.lakeBlue,
  "Creative Media":     C.driftwood,
  "Home Services":      C.sageDark,
  "Health & Beauty":    "#B5737A",
  "Pet Services":       "#8B7355",
  "Arts & Culture":     "#7B68B0",
  "Community":          C.sage,
  "Other":              C.textMuted,
};

// ── Dispatch Card Sponsors ──────────────────────────────────────────────────────
// Add/remove sponsors here. Rotates across cards by index.
// logo: path in /public (e.g. '/images/blackbird-logo.png'), or null → shows 📷 placeholder
// Set array to [] to hide all sponsor strips.
export const DISPATCH_CARD_SPONSORS = [
  {
    name: 'Blackbird Cafe & Baking Co.',
    logo: '/images/blackbird-logo.png',
    offerText: 'Free cookie for new subscribers',
    smallPrint: 'First 20 people only. Expires May 31.',
  },
];

export const DISPATCH_CATEGORIES = ['Lake Life', 'Community', 'Events', 'Real Estate', 'Food & Drink', 'History', 'Recreation', 'Seasonal Tips', "Holly's Corner", 'Advertorial'];

// ============================================================
// Events are 100% Notion-driven - no hardcoded data here.
// Add events in Notion with Status = "Approved" or "Published" to appear on site.

// ============================================================
// 🎬  VIDEO / STORY CONTENT
// ============================================================
export const VIDEOS = [
  {
    id: 1,
    title: "Party on Devils Lake",
    desc: "Life on the water at Manitou Beach - the boats, the people, and everything that makes this lake special.",
    youtubeId: "3MCb5X4bj9s",
    date: "2025",
    category: "Community",
  },
  {
    id: 2,
    title: "Wooden Boats on Devils Lake",
    desc: "Classic wooden boats and the timeless tradition of craftsmanship on Devils Lake.",
    youtubeId: "IczTln0Jxd4",
    date: "2025",
    category: "Community",
  },
  {
    id: 3,
    title: "July 4th on Devils Lake",
    desc: "Independence Day celebrations on the lake - fireworks, boats, and the full Manitou Beach summer experience.",
    youtubeId: "3MCb5X4bj9s",
    date: "July 4, 2025",
    category: "Community",
  },
  {
    id: 4,
    title: "Devils Lake Tip-Up Festival 2025",
    desc: "The annual Tip-Up Town ice fishing festival in full swing - one of Michigan's beloved winter traditions.",
    youtubeId: "uqEtu9GlBHk",
    date: "Winter 2025",
    category: "Events",
  },
  {
    id: 5,
    title: "Devils Lake Tip-Up Festival 2026",
    desc: "Ice fishing, community, and the spirit of Manitou Beach's signature winter celebration.",
    youtubeId: "6Gc7hTs88LI",
    date: "Winter 2026",
    category: "Events",
  },
  {
    id: 6,
    title: "Cruisin' Till the Sun Goes Down",
    desc: "A golden hour cruise on Devils Lake - the perfect way to end a summer day on the water.",
    youtubeId: "bfPKmB57ltY",
    date: "Summer 2025",
    category: "Community",
  },
];
