import { C } from './config';

// ============================================================
//  WINE_PROGRAM_LIVE - master switch for the passport/ratings
//  program (stamp my visit, passport widget, scoreboard,
//  awards ceremony). Flip to true when the program launches.
// ============================================================
export const WINE_PROGRAM_LIVE = false;

// ============================================================
//  WINERY_VENUES - shared by WineriesPage + WineryProfilePage
//  `hidden: true` keeps a venue in the data but off the site
//  (unsigned partners) - remove the flag to re-list them.
// ============================================================
export const WINERY_VENUES = [
  // ── Village Tasting Rooms (3 of 4 now open · Summer 2026) ────────────
  {
    section: "village",
    name: "Devils Lake View Living",
    type: "Home & Lifestyle · Satellite Tasting Room",
    tagline: "High-end fashion, curated home goods, and the iconic lighthouse replica out front - now pouring organic wines from Traverse City that turn browsing into an occasion.",
    address: "200 Devils Lake Hwy, Manitou Beach",
    phone: "(517) 252-5287",
    website: "https://devilslakeviewliving.com",
    logo: "/images/dl-view-living-logo.png",
    accent: C.sage,
    distance: "In the Village",
    nowOpen: true,
    // Switch to "Daily 10–5" after Labor Day (farmers market season ends)
    hours: "Most days 10–5 · Tue & Sun 10–3 · Sat 9–5",
    lat: 41.9708, lng: -84.3099,
    photos: [
      "/images/wineries/dlv_brengman_01.jpg",
      "/images/wineries/dlv_brengman_03.jpg",
      "/images/wineries/dlv_brengman_02.jpg",
    ],
    hostedBrands: [
      {
        name: "Brengman Family Wines",
        pours: "11 wines · by the glass or bottle",
        url: "https://brengmanfamilywines.com",
        description: "Organic, estate-grown wines from the hills outside Traverse City. Eleven to choose from, poured by the glass or sent home by the bottle - ask Darlene where to start.",
      },
    ],
  },
  {
    section: "village",
    name: "Ang & Co",
    type: "Lifestyle Shop · Satellite Tasting Room",
    tagline: "Dirty sodas, custom apparel, curated gifts - and now eight Northern Michigan wines you can try by the taste before you commit to a glass.",
    address: "141 N. Lakeview Blvd., Manitou Beach",
    phone: "(517) 547-6030",
    website: "https://www.angandco.net",
    logo: "/images/ang_co_logo.png",
    accent: C.sunsetLight,
    distance: "In the Village",
    nowOpen: true,
    hours: "Mon–Wed 10–5 · Thu 10–6 · Fri 10–7 · Sat 8:30–7 · Sun 12–5",
    lat: 41.9712, lng: -84.3093,
    photos: [
      "/images/wineries/ang_co_fontaine_03.jpg",
      "/images/wineries/ang_co_fontaine_02.jpg",
      "/images/wineries/ang_co_fontaine_01.jpg",
    ],
    hostedBrands: [
      {
        name: "Chateau Fontaine",
        pours: "8 wines · by the taste, glass, or bottle",
        url: "https://www.chateaufontaine.com",
        description: "One of Michigan's most decorated estate wineries, grown on the Leelanau Peninsula. Eight wines on the list - and the by-the-taste pours mean you can work your way through before picking a favorite.",
      },
    ],
  },
  {
    section: "village",
    name: "The Boathouse at Michigan Gypsy",
    type: "Boathouse Shop · Satellite Tasting Room",
    tagline: "One of the Village's most distinctive spaces, now pouring Lake Leelanau wine steps from Devils Lake. Browse the boathouse, sip something memorable.",
    address: "138 N. Lakeview Blvd., Manitou Beach",
    phone: "(517) 224-1984",
    website: "https://www.facebook.com/ManitouBeachBoathouseArtGallery/",
    logo: "/images/boathouse-art-gallery-logo.jpg",
    accent: C.lakeBlue,
    distance: "In the Village",
    nowOpen: true,
    hours: "Sun–Mon 11–3 · Tue closed · Wed 11–4 · Thu 11–5 · Fri–Sat 9–5",
    lat: 41.971727, lng: -84.309131,
    hostedBrands: [
      {
        name: "Amoritas Vineyards",
        pours: "Ask what's pouring today",
        url: "https://www.amoritasvineyards.com",
        description: "A family vineyard on the shore of Lake Leelanau, known for crisp whites and small-lot rieslings. The lineup rotates - stop in and ask what's open.",
      },
    ],
  },
  {
    section: "village",
    name: "Faust House Scrap n Craft",
    type: "Craft Store · Satellite Tasting Room",
    tagline: "A beloved craft store getting a delicious upgrade. Stop in, browse the shelves - and soon, stay for a pour of Michigan's finest small-batch wine.",
    address: "140 N Lakeview Blvd., Manitou Beach",
    phone: "(517) 403-1788",
    website: "https://fausthousescrapncraft.com",
    logo: "/images/faust_house_logo.png",
    accent: "#8B5E3C",
    distance: "In the Village",
    openingDate: "Coming Soon",
    hours: "Tasting room coming soon",
    lat: 41.9717, lng: -84.3091,
    hostedBrands: [
      {
        name: "Cherry Creek Cellars",
        description: "Small-batch wines made just down the road in Brooklyn. Approachable reds and whites from a winery that feels like a well-kept local secret - because it is.",
      },
    ],
  },

  // ── The Trail (day trips) ─────────────────────────────────────────────
  {
    section: "trail",
    hidden: true, // not signed up yet - remove this flag when Meckleys joins the trail
    name: "Meckleys Flavor Fruit Farm",
    type: "Fruit Farm · Trail Stop",
    tagline: "Start your day here. Fresh-picked fruit, homemade jams, and flavors that reset the palate before your first pour. The perfect opening move on the wine trail.",
    address: "11025 S Jackson Rd, Cement City",
    phone: null,
    website: null,
    logo: "/images/meckleys-logo.png",
    accent: "#B35A1A",
    hours: "Wed–Sat 9am–6pm (seasonal - call ahead)",
    highlight: "The ideal first stop - palate fresh, appetite building",
    distance: "~16 min from Manitou Beach",
    lat: 42.0589177, lng: -84.4059253,
  },
  {
    section: "trail",
    name: "Cherry Creek Cellars",
    type: "Small-Batch Winery",
    tagline: "Brooklyn's neighborhood winery - small-batch Michigan wines in a laid-back tasting room that feels exactly like it should.",
    address: "11500 Silver Lake Hwy, Brooklyn",
    phone: "(517) 592-4848",
    website: "https://cherrycreekwine.com",
    logo: "/images/cherry_creek_logo.png",
    accent: C.sage,
    hours: "Mon–Sat 11am–6pm · Sun Noon–6pm",
    highlight: "Also pouring at Faust House in the Village - opening soon",
    distance: "~13 min from Manitou Beach",
    lat: 42.0505, lng: -84.3012,
  },
  {
    section: "trail",
    name: "Chateau Aeronautique Winery",
    type: "Winery & Entertainment Venue",
    tagline: "Aviation-themed. All-weather Biergarten. Live tribute concerts every weekend. Michigan wine with more personality than most.",
    address: "12000 Pentecost Hwy, Onsted",
    phone: "(517) 795-3620",
    website: "https://chateauaeronautiquewinery.com",
    logo: "/images/chateau_logo.png",
    accent: C.sunset,
    hours: "Wed–Thu 3–9pm · Fri–Sat Noon–9pm · Sun Noon–6pm",
    highlight: "Live music every weekend + Michigan-crafted wines",
    distance: "~22 min from Manitou Beach",
    lat: 42.0582, lng: -84.1274,
  },
  {
    section: "trail",
    name: "Gypsy Blue Vineyards",
    type: "Vineyard & Flower Farm",
    tagline: "Handcrafted wines, crisp hard ciders, and seasonal blooms from their own flower farm. Private events, tastings, and a setting that earns the drive.",
    address: "16476 Forrister Rd, Hudson",
    phone: "(517) 252-5023",
    website: "https://gypsybluevineyards.com",
    logo: "/images/gypsy_blue_logo.png",
    accent: C.lakeBlue,
    hours: "Check website for current hours",
    highlight: "Wines + ciders + flower farm - a full afternoon stop",
    distance: "~6 min from Manitou Beach",
    lat: 41.9170, lng: -84.3115,
    profilePath: '/business/gypsy-blue-vineyards',
    photos: [
      "/images/wineries/gypsy_blue_01.jpg",
      "/images/wineries/gypsy_blue_02.jpg",
      "/images/wineries/gypsy_blue_03.jpg",
      "/images/wineries/gypsy_blue_04.jpg",
    ],
  },

  // ── Worth the Drive ───────────────────────────────────────────────────
  {
    section: "extended",
    name: "Grand River Brewery",
    type: "Brewery · Event Partner",
    tagline: "Jackson's craft brewery and a longtime event partner with Cherry Creek Cellars. Worth the drive if you're making a full day of it.",
    address: "117 W Louis Glick Hwy, Jackson",
    phone: null,
    website: null,
    logo: null,
    accent: "#6B4E2A",
    highlight: "Partners with Cherry Creek Cellars for annual events",
    distance: "~35 min from Manitou Beach",
  },
  {
    section: "extended",
    name: "Black Fire Winery",
    type: "Winery",
    tagline: "A regional winery worth knowing about if you're building out a longer Michigan wine day beyond the Irish Hills.",
    address: "1261 E Munger Rd, Tecumseh",
    phone: null,
    website: null,
    logo: null,
    accent: "#4A2040",
    highlight: "Regional gem - best paired with a longer itinerary",
    distance: "~45 min from Manitou Beach",
  },
];
