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

// ============================================================
// 💛  PAGE SPONSORS — update to activate; null = show placeholder
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
  // To activate a sponsor, replace null with an object:
  // pageName: { name: "Business Name", logo: "/path/to/logo.png", tagline: "Your tagline here", url: "https://example.com", expiresAt: "March 2027" }
};

// ============================================================
// 🧭  NAV SECTIONS
// USA250 — set true to make the page publicly visible + add to Community nav
export const USA250_PUBLIC = false;

// Slot caps per tier per category — Enhanced has no cap
export const SLOT_CAPS = { premium: 1, featured: 3 };
export const LISTING_CATEGORIES = [
  "Real Estate", "Food & Drink", "Boating & Water", "Breweries & Wineries",
  "Shopping & Gifts", "Stays & Rentals", "Creative Media", "Home Services",
  "Health & Beauty", "Pet Services", "Arts & Culture", "Other",
];
// Drop your drone fireworks video in public/images/ and set the path here:
export const USA250_VIDEO_URL = ""; // e.g. "/images/fireworks-2025.mp4"

// ============================================================
export const SECTIONS = [
  { id: "home",       label: "Home" },
  { id: "happening",  label: "What's Happening" },
  { id: "explore",    label: "Explore" },
  { id: "businesses", label: "Local Businesses" },
  { id: "living",     label: "Living Here" },
  { id: "about",      label: "About" },
];

// ============================================================
// 📋  BUSINESS DIRECTORY DATA
// ============================================================
// Village page editorial listings — hardcoded for the Walk the Village section only.
// BusinessDirectory is 100% Notion-driven and does NOT use this array.
export const VILLAGE_BUSINESSES = [
  {
    id: 3,
    name: "Two Lakes Tavern",
    category: "Food & Drink",
    description: "Family-owned lakeside restaurant known for smoked entrees and a full menu of options. Right on the shores of Devils Lake, steps from the water.",
    address: "110 Walnut St, Manitou Beach",
    village: true,
    logo: "/images/two_lakes_logo.jpg",
    website: "https://www.twolakestavern.com",
    phone: "(517) 547-7490",
  },
  {
    id: 16,
    name: "Ang & Co",
    category: "Shopping & Gifts",
    description: "Dirty sodas, satellite wine tasting, custom sweatshirt and t-shirt printing, and curated gifts. A little bit of everything on Lakeview Blvd.",
    address: "141 N. Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/ang_co_logo.png",
    website: "https://www.angandco.net",
    phone: "(517) 547-6030",
  },
  {
    id: 17,
    name: "Faust House Scrap n Craft",
    category: "Shopping & Gifts",
    description: "Scrapbooking supplies, craft workshops, and satellite wine tasting. A creative hub for makers in the heart of Manitou Beach village.",
    address: "140 N Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/faust_house_logo.png",
    website: "https://fausthousescrapncraft.com",
    phone: "(517) 403-1788",
  },
  {
    id: 18,
    name: "Devils Lake View Living",
    category: "Shopping & Gifts",
    description: "High-end fashion, curated home goods, and the iconic lighthouse replica out front. Manitou Beach's village anchor and a satellite wine tasting venue.",
    address: "200 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/dl-view-living-logo.png",
    website: "http://devilslakeviewliving.com",
    phone: "(517) 252-5287",
  },
  {
    id: 19,
    name: "Devils Lake Inn",
    category: "Stays & Rentals",
    description: "Six stylish, modern apartments available year-round. Walking distance to the village shops, the lake, and everything Manitou Beach has to offer.",
    address: "103 Walnut Street, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/dl-inn-logo.png",
    website: "https://www.devilslakeinn.com",
    phone: "(517) 252-5017",
  },
  {
    id: 20,
    name: "Michigan Gypsy",
    category: "Shopping & Gifts",
    description: "A gift boutique with personality — unique finds, local goods, and the kind of shop you stumble into and don't want to leave. Right in the village.",
    address: "136 North Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/michigan-gypsy-logo.png",
    website: "https://michigangypsy.com",
    phone: "(517) 224-1984",
  },
  {
    id: 21,
    name: "Blackbird Cafe",
    category: "Food & Drink",
    description: "Everything handmade — including the coffee syrups. A from-scratch cafe in Manitou Beach village with pastries, specialty drinks, and a loyal following.",
    address: "135 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/blackbird-logo.png",
    website: "https://www.blackbirdcafedevils.com",
    phone: "(567) 404-9655",
  },
  {
    id: 22,
    name: "Trends Salon & Spa",
    category: "Health & Beauty",
    description: "Full-service salon and spa in the heart of Manitou Beach village. Hair, color, nails, and spa treatments for locals and lake visitors alike.",
    address: "126 N Lakeview Blvd, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/trends-logo.png",
    website: "https://www.facebook.com/profile.php?id=100063483493738",
    phone: "(517) 547-5544",
  },
  {
    id: 23,
    name: "Phoenix Rising Wellness",
    category: "Health & Beauty",
    description: "Holistic wellness treatments and restorative services in the Irish Hills. Massage, energy work, and natural healing near the shores of Devils Lake.",
    address: "131 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/pheonix-logo.png",
    website: "https://www.phoenixrising-acupuncture.com/",
    phone: "(517) 759-4018",
  },
  {
    id: 24,
    name: "Trillium House",
    category: "Stays & Rentals",
    description: "A spacious 5-bedroom retreat that sleeps 9. Central air, two full bathrooms, in-unit washer and dryer, and a generous lot on Devils Lake Hwy.",
    address: "350 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/trillium-logo.png",
    website: "https://www.trilliumhouserental.com/",
    phone: "(419) 290-9974",
  },
  {
    id: 25,
    name: "Foundation Realty",
    category: "Real Estate",
    description: "Serving the Manitou Beach community with lakefront and residential real estate. Holly Griewahn — 30+ years of local expertise in the Irish Hills.",
    address: "100 Walnut St, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/foundation-logo.png",
    website: "https://www.foundationlenawee.com/",
    phone: "(517) 266-8888",
  },
  {
    id: 26,
    name: "Diamond in the Ruff",
    category: "Pet Services",
    description: "Professional pet grooming and care in the Manitou Beach area. Keeping your furry family members looking and feeling their best all season.",
    address: "251 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/diamond-ruff-logo.png",
    website: "https://www.facebook.com/diamondintheruffpetgroomingllc",
    phone: "(517) 252-5255",
  },
  {
    id: 28,
    name: "Boathouse Art Gallery",
    category: "Arts & Culture",
    description: "The largest nonprofit art gallery in Lenawee County — 50+ Michigan artists under one roof at the historic boathouse on the lake. Annual home of the Devils Lake Festival of the Arts.",
    address: "138 N. Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/boathouse-art-gallery-logo.jpg",
    website: "https://www.facebook.com/ManitouBeachBoathouseArtGallery/",
    phone: "(517) 224-1984",
  },
  {
    id: 27,
    name: "South Shore Marine",
    category: "Boating & Water",
    description: "Marine sales, service, and repair on Devils Lake. Pontoon boats, outboards, and everything to keep your boat running all season long.",
    address: "209 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/ss-marine-logo.png",
    website: "https://www.facebook.com/profile.php?id=100092384540558",
    phone: "(517) 260-6910",
  },
  {
    id: 29,
    name: "Lakes Preservation League",
    category: "Community",
    description: "Mission to Preserve and Protect the Lakes for Current and Future Generations. Advocacy, stewardship, and community engagement for the Irish Hills lakes.",
    village: true,
    featured: false,
    logo: null,
    website: "https://lakespreservationleague.org/",
    phone: "(989) 205-5079",
  },
];

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
  },
];

export const DISPATCH_CATEGORIES = ['Lake Life', 'Community', 'Events', 'Real Estate', 'Food & Drink', 'History', 'Recreation', 'Seasonal Tips', "Holly's Corner", 'Advertorial'];

// ============================================================
// Events are 100% Notion-driven — no hardcoded data here.
// Add events in Notion with Status = "Approved" or "Published" to appear on site.

// ============================================================
// 🎬  VIDEO / STORY CONTENT
// ============================================================
export const VIDEOS = [
  {
    id: 1,
    title: "Party on Devils Lake",
    desc: "Life on the water at Manitou Beach — the boats, the people, and everything that makes this lake special.",
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
    desc: "Independence Day celebrations on the lake — fireworks, boats, and the full Manitou Beach summer experience.",
    youtubeId: "3MCb5X4bj9s",
    date: "July 4, 2025",
    category: "Community",
  },
  {
    id: 4,
    title: "Devils Lake Tip-Up Festival 2025",
    desc: "The annual Tip-Up Town ice fishing festival in full swing — one of Michigan's beloved winter traditions.",
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
    desc: "A golden hour cruise on Devils Lake — the perfect way to end a summer day on the water.",
    youtubeId: "bfPKmB57ltY",
    date: "Summer 2025",
    category: "Community",
  },
];
