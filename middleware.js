// ============================================================
// Vercel Edge Middleware — Per-page Open Graph tags
// ============================================================
// Social crawlers (iMessage, Facebook, Twitter/X, LinkedIn) don't
// execute JavaScript, so an SPA's client-side <meta> updates are
// invisible to them. This middleware intercepts page requests,
// fetches the static index.html, and swaps in route-specific
// og:title / og:description / og:image before returning it.
// ============================================================

// ── OG data per route ────────────────────────────────────────
// image: null  →  keeps the default og-image.jpg (you need to provide one)
// image: path  →  absolute path from public root
const OG_MAP = {
  '/': {
    title: 'Manitou Beach — Discover Devils Lake, Michigan',
    description: 'Business directory, local events, lake life, and community news on Devils Lake in the Michigan Irish Hills.',
    image: '/images/og-image.jpg',
  },
  '/events': {
    title: 'Events & Happenings — Manitou Beach',
    description: 'Live music, lake festivals, food trucks, and community events happening around Devils Lake.',
    image: '/images/happening-hero.jpg',
  },
  '/happening': {
    title: 'Events & Happenings — Manitou Beach',
    description: 'Live music, lake festivals, food trucks, and community events happening around Devils Lake.',
    image: '/images/happening-hero.jpg',
  },
  '/round-lake': {
    title: 'Round Lake — Manitou Beach',
    description: 'Explore Round Lake in the Irish Hills — fishing, boating, and peaceful lakeside living near Devils Lake.',
    image: '/images/explore-round-lake.jpg',
  },
  '/village': {
    title: 'Manitou Beach Village',
    description: 'The charming village of Manitou Beach on the shores of Devils Lake, Michigan.',
    image: null, // NEEDS IMAGE — village street or storefronts
  },
  '/nightlife': {
    title: 'Nightlife — Manitou Beach',
    description: 'Bars, live music, and evening fun around Devils Lake in the Michigan Irish Hills.',
    image: '/images/explore-nightlife.jpg',
  },
  '/business': {
    title: 'Business Directory — Manitou Beach',
    description: 'Local businesses, shops, restaurants, and services in the Devils Lake community.',
    image: null, // NEEDS IMAGE — Main Street or business collage
  },
  '/featured': {
    title: 'Featured Businesses — Manitou Beach',
    description: 'Premium local businesses serving the Devils Lake community.',
    image: null, // NEEDS IMAGE — same as /business
  },
  '/mens-club': {
    title: "Men's Club — Manitou Beach",
    description: 'The Manitou Beach Men\'s Club — community events, Tip-Up, Firecracker 7K, and more since 1946.',
    image: '/images/mens-club-hero.jpg',
  },
  '/ladies-club': {
    title: "Ladies Club — Manitou Beach",
    description: 'The Manitou Beach Ladies Club — Summer Festival, community service, and lakeside camaraderie.',
    image: '/images/ladies-club/summerfest-yeti.jpg',
  },
  '/historical-society': {
    title: 'Historical Society — Manitou Beach',
    description: 'Preserving the heritage of Manitou Beach and Devils Lake — art shows, restoration, and community history.',
    image: '/images/historic-hero.jpg',
  },
  '/fishing': {
    title: 'Fishing Devils Lake — Manitou Beach',
    description: 'Bass, walleye, pike, and panfish — your guide to fishing Devils Lake in the Michigan Irish Hills.',
    image: '/images/explore-fishing.jpg',
  },
  '/wineries': {
    title: 'Wine Trail — Manitou Beach',
    description: 'Explore the Irish Hills wine trail — local wineries, tastings, and vineyard tours near Devils Lake.',
    image: '/images/Explore-wineries.jpg',
  },
  '/devils-lake': {
    title: 'Devils Lake — Manitou Beach, Michigan',
    description: 'All-sports Devils Lake in the Irish Hills — boating, fishing, swimming, and lakefront living.',
    image: '/images/explore-devils-lake.jpg',
  },
  '/dispatch': {
    title: 'The Manitou Dispatch',
    description: 'Lake life, local news, and a little Yeti wisdom from the shores of Devils Lake.',
    image: '/images/dispatch-header.jpg',
  },
  '/food-trucks': {
    title: 'Food Trucks — Manitou Beach',
    description: 'Street eats and mobile kitchens serving the Devils Lake community and local events.',
    image: '/images/foodtruck_hero.jpg',
  },
  '/discover': {
    title: 'Discover — Manitou Beach',
    description: 'Explore the map — find businesses, parks, boat launches, and hidden gems around Devils Lake.',
    image: null, // NEEDS IMAGE — aerial/map view of the lake area
  },
  '/fireworks': {
    title: 'USA250 Fireworks — Devils Lake',
    description: 'America\'s 250th birthday celebration on the shores of Devils Lake, Manitou Beach.',
    image: '/images/fireworks/devilslake-fireworks-1.jpg',
  },
  '/usa250': {
    title: 'USA250 Fireworks — Devils Lake',
    description: 'America\'s 250th birthday celebration on the shores of Devils Lake, Manitou Beach.',
    image: '/images/fireworks/devilslake-fireworks-1.jpg',
  },
  '/holly-yeti': {
    title: 'Holly & Yeti — Foundation Realty at Devils Lake',
    description: 'Irish Hills lake homes and real estate with Holly Griewahn and the Yeti — Foundation Realty.',
    image: '/images/holly-yeti-bg.jpg',
  },
  '/stays': {
    title: 'Lakefront Stays — Manitou Beach',
    description: 'Vacation rentals, cottages, and lakefront stays on Devils Lake in the Michigan Irish Hills.',
    image: '/images/og/og-stays.jpg',
  },
  '/promote': {
    title: 'Promote Your Business — Manitou Beach',
    description: 'Get your business in front of the Devils Lake community with featured listings and promotions.',
    image: null, // NEEDS IMAGE — promotional/marketing themed
  },
  '/advertise': {
    title: 'Advertise — Manitou Beach',
    description: 'Reach the Devils Lake community through newsletter ads, sponsored content, and featured placement.',
    image: null, // NEEDS IMAGE — same as /promote
  },
  '/founding': {
    title: 'Founding Member — Manitou Beach',
    description: 'Join as a founding member and help shape the future of the Manitou Beach community platform.',
    image: '/images/og/og-founding.jpg',
  },
  '/ticket-services': {
    title: 'Ticket Services — Manitou Beach',
    description: 'Community event ticketing powered by Yetickets — simple, affordable tickets for Devils Lake events.',
    image: '/images/og/og-tickets.jpg',
  },
  '/wine-partner': {
    title: 'Wine Trail Partner — Manitou Beach',
    description: 'Join the Irish Hills wine trail on Manitou Beach — reach lake visitors and wine lovers.',
    image: null, // NEEDS IMAGE — winery partnership themed
  },
  '/food-truck-partner': {
    title: 'Food Truck Partner — Manitou Beach',
    description: 'Bring your food truck to Devils Lake events — join the Manitou Beach food truck network.',
    image: null, // NEEDS IMAGE — food truck themed
  },
  '/partner-intake': {
    title: 'Become a Partner — Manitou Beach',
    description: 'Partner with Manitou Beach to reach the Devils Lake community.',
    image: null, // NEEDS IMAGE — partnership themed
  },
  '/check-in': {
    title: 'Check In — Manitou Beach',
    description: 'Check in to Devils Lake — let the community know you\'re here!',
    image: '/images/og/og-checkin.jpg',
  },
  '/launch': {
    title: 'Coming Soon — Manitou Beach',
    description: 'Manitou Beach is launching soon — the community platform for Devils Lake, Michigan.',
    image: '/images/og/og-launch.jpg',
  },

  // ── Internal / form pages — title + description only, default image ──
  '/vendor-register': {
    title: 'Vendor Registration — Manitou Beach',
    description: 'Register as a vendor for Manitou Beach community events.',
    image: null,
  },
  '/vendor-portal': {
    title: 'Vendor Portal — Manitou Beach',
    description: 'Manage your vendor profile and event registrations.',
    image: null,
  },
  '/organizer-dashboard': {
    title: 'Organizer Dashboard — Manitou Beach',
    description: 'Event organizer tools for the Manitou Beach community.',
    image: null,
  },
  '/submit-event': {
    title: 'Submit an Event — Manitou Beach',
    description: 'Add your event to the Manitou Beach community calendar.',
    image: null,
  },
  '/update-listing': {
    title: 'Update Your Listing — Manitou Beach',
    description: 'Keep your business listing current on Manitou Beach.',
    image: null,
  },
  '/upgrade-listing': {
    title: 'Upgrade Your Listing — Manitou Beach',
    description: 'Upgrade to a featured listing on Manitou Beach.',
    image: null,
  },
  '/privacy': {
    title: 'Privacy Policy — Manitou Beach',
    description: 'Privacy policy for the Manitou Beach community platform.',
    image: null,
  },
  '/terms': {
    title: 'Terms of Service — Manitou Beach',
    description: 'Terms of service for the Manitou Beach community platform.',
    image: null,
  },
  '/sms': {
    title: 'SMS Opt-In — Manitou Beach',
    description: 'SMS messaging terms and opt-in for Manitou Beach community alerts.',
    image: null,
  },
};

// ── Default fallback values ──────────────────────────────────
const DEFAULT_OG = {
  title: 'Manitou Beach — Discover Devils Lake, Michigan',
  description: 'Business directory, local events, lake life, and community news on Devils Lake in the Michigan Irish Hills.',
  image: '/images/og-image.jpg',
};

// ── Middleware entry point ────────────────────────────────────
export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip: API routes, static assets (anything with a file extension), internal paths
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_') ||
    /\.\w{2,5}$/.test(path)
  ) {
    return undefined; // pass through to default handling
  }

  // Look up OG data — try exact match, then strip trailing slash
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const og = OG_MAP[cleanPath];

  // No custom OG defined for this route — let default index.html handle it
  if (!og) return undefined;

  // Fetch the static index.html from the deployment
  const htmlUrl = new URL('/index.html', url.origin);
  const htmlResponse = await fetch(htmlUrl);

  if (!htmlResponse.ok) return undefined; // fallback if fetch fails

  let html = await htmlResponse.text();

  // Build absolute URLs
  const origin = url.origin;
  const pageUrl = `${origin}${cleanPath}`;
  const imageUrl = og.image
    ? `${origin}${og.image}`
    : `${origin}${DEFAULT_OG.image}`;
  const title = og.title || DEFAULT_OG.title;
  const description = og.description || DEFAULT_OG.description;

  // Replace OG meta tags
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"/,
      `<meta name="description" content="${description}"`
    )
    .replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${title}"`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"/,
      `<meta property="og:description" content="${description}"`
    )
    .replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${imageUrl}"`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"/,
      `<meta property="og:url" content="${pageUrl}"`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"/,
      `<meta name="twitter:title" content="${title}"`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"/,
      `<meta name="twitter:description" content="${description}"`
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"/,
      `<meta name="twitter:image" content="${imageUrl}"`
    );

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

// ── Route matcher — skip files and API ───────────────────────
export const config = {
  matcher: ['/((?!api/|_vercel|images/|icons/|src/|favicon\\.ico).*)'],
};
