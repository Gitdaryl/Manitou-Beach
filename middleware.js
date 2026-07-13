// ============================================================
// Vercel Edge Middleware - Per-page Open Graph tags
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
    title: 'Manitou Beach - Discover Devils Lake, Michigan',
    description: 'Business directory, local events, lake life, and community news on Devils Lake in the Michigan Irish Hills.',
    image: '/images/og-image.jpg',
  },
  '/events': {
    title: 'Events & Happenings - Manitou Beach',
    description: 'Live music, lake festivals, food trucks, and community events happening around Devils Lake.',
    image: '/images/happening-hero.jpg',
  },
  '/happening': {
    title: 'Events & Happenings - Manitou Beach',
    description: 'Live music, lake festivals, food trucks, and community events happening around Devils Lake.',
    image: '/images/happening-hero.jpg',
  },
  '/round-lake': {
    title: 'Round Lake - Manitou Beach',
    description: 'Explore Round Lake in the Irish Hills - fishing, boating, and peaceful lakeside living near Devils Lake.',
    image: '/images/explore-round-lake.jpg',
  },
  '/village': {
    title: 'Manitou Beach Village',
    description: 'The charming village of Manitou Beach on the shores of Devils Lake, Michigan.',
    image: '/images/og/village-og.jpg',
  },
  '/nightlife': {
    title: 'Nightlife - Manitou Beach',
    description: 'Bars, live music, and evening fun around Devils Lake in the Michigan Irish Hills.',
    image: '/images/og/nightlife-og.jpg',
  },
  '/business': {
    title: 'Business Directory - Manitou Beach',
    description: 'Local businesses, shops, restaurants, and services in the Devils Lake community.',
    image: '/images/og/village-og.jpg', // STOPGAP - replace with a Main Street / business collage when available
  },
  '/featured': {
    title: 'Featured Businesses - Manitou Beach',
    description: 'Premium local businesses serving the Devils Lake community.',
    image: '/images/og/village-og.jpg', // STOPGAP - replace with a Main Street / business collage when available
  },
  '/mens-club': {
    title: "Men's Club - Manitou Beach",
    description: 'The Manitou Beach Men\'s Club - community events, Tip-Up, Firecracker 7K, and more since 1946.',
    image: '/images/og/mensclub-og.jpg',
  },
  '/ladies-club': {
    title: "Ladies Club - Manitou Beach",
    description: 'The Manitou Beach Ladies Club - Summer Festival, community service, and lakeside camaraderie.',
    image: '/images/og/ladiesclub-og.jpg',
  },
  '/historical-society': {
    title: 'Historical Society - Manitou Beach',
    description: 'Preserving the heritage of Manitou Beach and Devils Lake - art shows, restoration, and community history.',
    image: '/images/historic-hero.jpg',
  },
  '/fishing': {
    title: 'Fishing Devils Lake - Manitou Beach',
    description: 'Bass, walleye, pike, and panfish - your guide to fishing Devils Lake in the Michigan Irish Hills.',
    image: '/images/og/fishing-og.jpg',
  },
  '/wineries': {
    title: 'Wine Trail - Manitou Beach',
    description: 'Explore the Irish Hills wine trail - local wineries, tastings, and vineyard tours near Devils Lake.',
    image: '/images/og/winetrail-og.jpg',
  },
  '/devils-lake': {
    title: 'Devils Lake - Manitou Beach, Michigan',
    description: 'All-sports Devils Lake in the Irish Hills - boating, fishing, swimming, and lakefront living.',
    image: '/images/explore-devils-lake.jpg',
  },
  '/dispatch': {
    title: 'The Manitou Dispatch',
    description: 'Lake life, local news, and a little Yeti wisdom from the shores of Devils Lake.',
    image: '/images/dispatch-header.jpg',
  },
  '/food-trucks': {
    title: 'Food Trucks - Manitou Beach',
    description: 'Street eats and mobile kitchens serving the Devils Lake community and local events.',
    image: '/images/og/foodtrucks-og.jpg',
  },
  '/discover': {
    title: 'Discover - Manitou Beach',
    description: 'Explore the map - find businesses, parks, boat launches, and hidden gems around Devils Lake.',
    image: null, // NEEDS IMAGE - aerial/map view of the lake area
  },
  '/fireworks': {
    title: 'USA250 Fireworks - Devils Lake',
    description: 'America\'s 250th birthday celebration on the shores of Devils Lake, Manitou Beach.',
    image: '/images/og/fireworks-og.jpg',
  },
  '/usa250': {
    title: 'USA250 Fireworks - Devils Lake',
    description: 'America\'s 250th birthday celebration on the shores of Devils Lake, Manitou Beach.',
    image: '/images/og/fireworks-og.jpg',
  },
  '/holly-yeti': {
    title: 'Holly & Yeti - Foundation Realty at Devils Lake',
    description: 'Irish Hills lake homes and real estate with Holly Griewahn and the Yeti - Foundation Realty.',
    image: '/images/holly-yeti-bg.jpg',
  },
  '/stays': {
    title: 'Lakefront Stays - Manitou Beach',
    description: 'Vacation rentals, cottages, and lakefront stays on Devils Lake in the Michigan Irish Hills.',
    image: '/images/og/stays-og.jpg',
  },
  '/promote': {
    title: 'Promote Your Business - Manitou Beach',
    description: 'Get your business in front of the Devils Lake community with featured listings and promotions.',
    image: null, // NEEDS IMAGE - promotional/marketing themed
  },
  '/advertise': {
    title: 'Advertise - Manitou Beach',
    description: 'Reach the Devils Lake community through newsletter ads, sponsored content, and featured placement.',
    image: null, // NEEDS IMAGE - same as /promote
  },
  '/founding': {
    title: 'Founding Member - Manitou Beach',
    description: 'Join as a founding member and help shape the future of the Manitou Beach community platform.',
    image: '/images/og/founding-og.jpg',
  },
  '/ticket-services': {
    title: 'Ticket Services - Manitou Beach',
    description: 'Community event ticketing powered by Yetickets - simple, affordable tickets for Devils Lake events.',
    image: '/images/og/tickets-og.jpg',
  },
  '/wine-partner': {
    title: 'Wine Trail Partner - Manitou Beach',
    description: 'Join the Irish Hills wine trail on Manitou Beach - reach lake visitors and wine lovers.',
    image: '/images/og/winetrail-og.jpg',
  },
  '/food-truck-partner': {
    title: 'Food Truck Partner - Manitou Beach',
    description: 'Bring your food truck to Devils Lake events - join the Manitou Beach food truck network.',
    image: '/images/og/foodtrucks-og.jpg',
  },
  '/partner-intake': {
    title: 'Become a Partner - Manitou Beach',
    description: 'Partner with Manitou Beach to reach the Devils Lake community.',
    image: null, // NEEDS IMAGE - partnership themed
  },
  '/check-in': {
    title: 'Check In - Manitou Beach',
    description: 'Check in to Devils Lake - let the community know you\'re here!',
    image: '/images/og/check-in-og.jpg',
  },
  '/launch': {
    title: 'Coming Soon - Manitou Beach',
    description: 'Manitou Beach is launching soon - the community platform for Devils Lake, Michigan.',
    image: '/images/og/og-launch.jpg',
  },

  // ── Internal / form pages - title + description only, default image ──
  '/vendor-register': {
    title: 'Vendor Registration - Manitou Beach',
    description: 'Register as a vendor for Manitou Beach community events.',
    image: null,
  },
  '/vendor-portal': {
    title: 'Vendor Portal - Manitou Beach',
    description: 'Manage your vendor profile and event registrations.',
    image: null,
  },
  '/organizer-dashboard': {
    title: 'Organizer Dashboard - Manitou Beach',
    description: 'Event organizer tools for the Manitou Beach community.',
    image: null,
  },
  '/submit-event': {
    title: 'Submit an Event - Manitou Beach',
    description: 'Add your event to the Manitou Beach community calendar.',
    image: null,
  },
  '/update-listing': {
    title: 'Update Your Listing - Manitou Beach',
    description: 'Keep your business listing current on Manitou Beach.',
    image: null,
  },
  '/upgrade-listing': {
    title: 'Upgrade Your Listing - Manitou Beach',
    description: 'Upgrade to a featured listing on Manitou Beach.',
    image: null,
  },
  '/privacy': {
    title: 'Privacy Policy - Manitou Beach',
    description: 'Privacy policy for the Manitou Beach community platform.',
    image: null,
  },
  '/terms': {
    title: 'Terms of Service - Manitou Beach',
    description: 'Terms of service for the Manitou Beach community platform.',
    image: null,
  },
  '/sms': {
    title: 'SMS Opt-In - Manitou Beach',
    description: 'SMS messaging terms and opt-in for Manitou Beach community alerts.',
    image: null,
  },
};


// ── JSON-LD schema map for static routes ─────────────────────
// Injected server-side so AI crawlers see schema without JS execution
const SCHEMA_MAP = {
  '/': [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Manitou Beach Michigan',
      url: 'https://manitoubeachmichigan.com',
      description: 'Community platform for Manitou Beach and Devils Lake, Michigan - events, businesses, food trucks, wineries, and lake life in the Irish Hills.',
      potentialAction: { '@type': 'SearchAction', target: 'https://manitoubeachmichigan.com/?q={search_term_string}', 'query-input': 'required name=search_term_string' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'TouristInformationCenter',
      name: 'Manitou Beach Michigan',
      url: 'https://manitoubeachmichigan.com',
      description: 'Manitou Beach Michigan is the community discovery platform for Devils Lake, the Irish Hills region, and Lenawee County, Michigan. The platform publishes a real-time events calendar, a local business directory, food truck location tracking, and weekly video announcements.',
      address: { '@type': 'PostalAddress', addressLocality: 'Manitou Beach', addressRegion: 'MI', postalCode: '49253', addressCountry: 'US' },
      geo: { '@type': 'GeoCoordinates', latitude: 41.9748, longitude: -84.0631 },
      areaServed: [
        { '@type': 'Place', name: 'Manitou Beach', containedInPlace: { '@type': 'AdministrativeArea', name: 'Lenawee County, Michigan' } },
        { '@type': 'Place', name: 'Irish Hills', containedInPlace: { '@type': 'AdministrativeArea', name: 'Lenawee County, Michigan' } },
        { '@type': 'Place', name: 'Devils Lake', description: 'A 1,024-acre inland lake in Lenawee County, Michigan.' },
      ],
      sameAs: ['https://www.youtube.com/@manitoubeachmichigan'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What is Manitou Beach Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Manitou Beach Michigan (manitoubeachmichigan.com) is a community discovery platform serving the Devils Lake and Irish Hills area of Lenawee County, Michigan. The platform publishes a real-time events calendar, a local business directory, food truck location tracking, and weekly video announcements covering upcoming programming.' } },
        { '@type': 'Question', name: 'What events are happening at Manitou Beach Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'The Manitou Beach Michigan events calendar features recurring summer programming including the Ladies Club Summer Festival, waterfront music series, food truck gatherings at Devils Lake, and seasonal markets. The platform publishes a weekly events update every Thursday covering upcoming programming across Lenawee County and the surrounding Irish Hills communities.' } },
        { '@type': 'Question', name: 'What businesses are near Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Manitou Beach Michigan features local businesses across the Irish Hills and Devils Lake region including restaurants, wineries, marinas, real estate services, home improvement contractors, and seasonal recreation providers. The directory at manitoubeachmichigan.com maintains current listings with contact information, hours, and service descriptions.' } },
        { '@type': 'Question', name: 'How do I get to Manitou Beach Michigan from Detroit?', acceptedAnswer: { '@type': 'Answer', text: 'Manitou Beach Michigan is approximately 75 miles southwest of Detroit via US-23 South to US-223 West, about 80-90 minutes by car. From Ann Arbor the drive is approximately 45 minutes via US-23 South. The area is also accessible from Toledo, Ohio, approximately 60 miles to the southeast via US-23 North.' } },
      ],
    },
  ],
  '/devils-lake': [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: 'Devils Lake',
      description: 'Devils Lake is a 1,024-acre inland lake in Lenawee County, Michigan, in the Irish Hills region approximately 75 miles southwest of Detroit. The lake supports largemouth bass, walleye, northern pike, and bluegill, and is the central recreational destination of the Manitou Beach community.',
      url: 'https://manitoubeachmichigan.com/devils-lake',
      address: { '@type': 'PostalAddress', addressLocality: 'Manitou Beach', addressRegion: 'MI', addressCountry: 'US', postalCode: '49253' },
      geo: { '@type': 'GeoCoordinates', latitude: 41.9748, longitude: -84.0631 },
      containedInPlace: { '@type': 'AdministrativeArea', name: 'Lenawee County, Michigan' },
      isPartOf: { '@type': 'Organization', name: 'Manitou Beach Michigan', url: 'https://manitoubeachmichigan.com' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Where is Devils Lake Michigan located?', acceptedAnswer: { '@type': 'Answer', text: 'Devils Lake is in Lenawee County in the Irish Hills region of southeastern Michigan, adjacent to Manitou Beach. The lake sits approximately 75 miles southwest of Detroit via US-23 South, 45 miles south of Ann Arbor, and 60 miles north of Toledo, Ohio.' } },
        { '@type': 'Question', name: 'How big is Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Devils Lake in Lenawee County, Michigan covers approximately 1,024 acres and reaches depths of up to 55 feet. It is one of the largest recreational lakes in the Irish Hills region with public access points and residential shoreline.' } },
        { '@type': 'Question', name: 'What fish can you catch in Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Devils Lake Michigan supports largemouth bass, smallmouth bass, walleye, northern pike, bluegill, crappie, and yellow perch. According to Michigan DNR lake survey data for Lenawee County, Devils Lake is rated a quality fishery for bass and walleye in the Irish Hills.' } },
        { '@type': 'Question', name: 'What activities are available at Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Devils Lake Michigan offers swimming, fishing, pontoon boating, water skiing, kayaking, paddleboarding, and jet skiing from May through September. The surrounding Manitou Beach community also offers restaurants, wineries, food trucks, and events listed at manitoubeachmichigan.com.' } },
        { '@type': 'Question', name: 'Are there vacation rentals on Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Vacation rentals on Devils Lake Michigan are available through Airbnb and VRBO, with lakefront cottages and lake-view homes concentrated during summer. Lodging near Manitou Beach is listed at manitoubeachmichigan.com.' } },
        { '@type': 'Question', name: 'How do I get to Devils Lake Michigan from Detroit or Ann Arbor?', acceptedAnswer: { '@type': 'Answer', text: 'Devils Lake Michigan is approximately 75 miles from Detroit via US-23 South to US-223 West, about 80-90 minutes by car. From Ann Arbor the drive is approximately 45 minutes via US-23 South. The lake is also accessible from Toledo, Ohio, approximately 60 miles to the southeast via US-23 North.' } },
      ],
    },
  ],
  '/fishing': [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What fish are in Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Devils Lake Michigan contains largemouth bass, smallmouth bass, walleye, northern pike, bluegill, crappie, and yellow perch. According to Michigan DNR lake survey data for Lenawee County, Devils Lake is rated a quality fishery for bass and walleye in the Irish Hills region.' } },
        { '@type': 'Question', name: 'Is fishing good at Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Fishing at Devils Lake Michigan is considered good for warm-water species, particularly largemouth bass, walleye, and northern pike. The lake covers 1,024 acres with depths up to 55 feet, providing habitat diversity that supports multiple species year-round including ice fishing in winter.' } },
        { '@type': 'Question', name: 'Do I need a fishing license to fish Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, a valid Michigan fishing license is required to fish Devils Lake in Lenawee County. Licenses are available through the Michigan DNR at michigan.gov/dnr. Anglers 17 and under are exempt from the fishing license requirement under Michigan law.' } },
        { '@type': 'Question', name: 'What fishing is available near Manitou Beach Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Manitou Beach Michigan is situated on Devils Lake, a 1,024-acre fishery in Lenawee County offering bass, walleye, pike, and panfish. Round Lake nearby provides additional fishing. The Manitou Beach Michigan platform at manitoubeachmichigan.com lists local bait shops and fishing services.' } },
      ],
    },
  ],
  '/wineries': [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What wineries are near Irish Hills Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'The Irish Hills region of Lenawee County, Michigan is home to several boutique wineries including Cherry Creek Cellars and Chateau Aeronautique Winery, which offer tastings, live music events, and local wine production. Additional wineries and breweries along the Irish Hills wine trail near Devils Lake are listed at manitoubeachmichigan.com.' } },
        { '@type': 'Question', name: 'Is there a wine trail near Manitou Beach Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'The Irish Hills region near Manitou Beach Michigan has an informal wine trail connecting multiple winery tasting rooms within a short driving distance of Devils Lake. The wineries feature Michigan-grown varietals, outdoor seating, live music on weekends, and seasonal events. Current listings are at manitoubeachmichigan.com.' } },
        { '@type': 'Question', name: 'What breweries are near Irish Hills and Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Craft breweries serving the Irish Hills and Devils Lake area of Lenawee County are listed in the Manitou Beach Michigan business directory at manitoubeachmichigan.com. Local establishments in the Manitou Beach area offer Michigan craft beers alongside wine in the Irish Hills region.' } },
      ],
    },
  ],
  '/stays': [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Are there vacation rentals on Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Vacation rental properties on Devils Lake Michigan are available through Airbnb and VRBO, with lakefront cottages and lake-view homes concentrated during summer. The Manitou Beach Michigan platform at manitoubeachmichigan.com lists lodging including cottages, tiny homes, glamping, and inn accommodations in the Irish Hills area.' } },
        { '@type': 'Question', name: 'Where can I stay near Manitou Beach Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Lodging near Manitou Beach Michigan includes lakefront cottages on Devils Lake, Airbnb and VRBO short-term rentals, bed and breakfasts in the Irish Hills, and campgrounds in Lenawee County. Current availability and listings are at manitoubeachmichigan.com.' } },
        { '@type': 'Question', name: 'Can I rent a lake cottage near Devils Lake Michigan for a week?', acceptedAnswer: { '@type': 'Answer', text: 'Weekly cottage rentals on Devils Lake Michigan are available through Airbnb and VRBO, with peak availability running from Memorial Day through Labor Day. Properties range from modest cottages to larger homes accommodating groups. Local lodging providers are listed at manitoubeachmichigan.com.' } },
      ],
    },
  ],
  '/food-trucks': [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Are there food trucks near Devils Lake Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'Food trucks operate near Devils Lake and Manitou Beach Michigan throughout the summer season, with real-time location updates at manitoubeachmichigan.com. Local food truck operators update their locations directly through the platform, covering the Manitou Beach waterfront and surrounding Lenawee County communities.' } },
        { '@type': 'Question', name: 'Where can I find food trucks near Manitou Beach Michigan this weekend?', acceptedAnswer: { '@type': 'Answer', text: 'The Manitou Beach Michigan food truck tracker at manitoubeachmichigan.com shows which food trucks are currently serving near Devils Lake. Operators in the Irish Hills area update their schedules and locations in real time on the platform.' } },
      ],
    },
  ],
  '/events': [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'What events are happening at Manitou Beach Michigan?', acceptedAnswer: { '@type': 'Answer', text: 'The Manitou Beach Michigan events calendar at manitoubeachmichigan.com features live music, festivals, food truck gatherings, community markets, and seasonal events around Devils Lake and the Irish Hills region of Lenawee County. A weekly Thursday update covers upcoming programming for the following seven days.' } },
        { '@type': 'Question', name: 'What is the Ladies Club Summer Festival at Manitou Beach?', acceptedAnswer: { '@type': 'Answer', text: 'The Ladies Club Summer Festival is an annual community gathering at Manitou Beach Michigan featuring local vendors, live entertainment, food service, and lakeside activities drawing attendees from across the Irish Hills region. The festival is listed on the Manitou Beach Michigan events calendar at manitoubeachmichigan.com.' } },
      ],
    },
  ],
};

// ── Default fallback values ──────────────────────────────────
const DEFAULT_OG = {
  title: 'Manitou Beach - Discover Devils Lake, Michigan',
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

  // ── Dynamic routes: /business/:slug and /events/:id ──────────
  const bizMatch = path.match(/^\/business\/([^/]+)$/);
  const eventMatch = path.match(/^\/events\/([^/]+)$/);

  if (bizMatch || eventMatch) {
    const htmlUrl = new URL('/index.html', url.origin);
    const htmlRes = await fetch(htmlUrl);
    if (!htmlRes.ok) return undefined;
    let html = await htmlRes.text();
    if (bizMatch) {
      html = await handleBusinessSchema(html, bizMatch[1], url.origin);
    } else if (eventMatch) {
      // Inject event-specific OG tags so shared links show the organizer's photo (crawlers don't run JS)
      html = await handleEventOG(html, eventMatch[1], url.origin);
    }
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300, s-maxage=600' },
    });
  }

  // ── Public event galleries: /gallery/:slug (per-photo OG via ?photo=) ─────────
  const galleryMatch = path.match(/^\/gallery\/([^/]+)$/);
  if (galleryMatch) {
    const htmlUrl = new URL('/index.html', url.origin);
    const htmlRes = await fetch(htmlUrl);
    if (!htmlRes.ok) return undefined;
    let html = await htmlRes.text();
    html = handleGalleryOG(html, galleryMatch[1], url);
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300, s-maxage=600' },
    });
  }

  // Look up OG data - try exact match, then strip trailing slash
  const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const og = OG_MAP[cleanPath];

  // No custom OG defined for this route - let default index.html handle it
  if (!og) return undefined;

  // Fetch the static index.html from the deployment
  const htmlUrl = new URL('/index.html', url.origin);
  const htmlResponse = await fetch(htmlUrl);

  if (!htmlResponse.ok) return undefined; // fallback if fetch fails

  let html = await htmlResponse.text();

  // Build absolute URLs
  const origin = url.origin;
  const pageUrl = `${origin}${cleanPath}`;
  let imageUrl = og.image
    ? `${origin}${og.image}`
    : `${origin}${DEFAULT_OG.image}`;
  let title = og.title || DEFAULT_OG.title;
  let description = og.description || DEFAULT_OG.description;

  // Per-photo preview for the Ladies Club Summerfest galleries:
  // /ladies-club?photo=YYYY-NN → shared link shows that exact festival photo.
  const lcPhoto = cleanPath === '/ladies-club' && url.searchParams.get('photo');
  if (lcPhoto) {
    const pm = String(lcPhoto).match(/^(\d{4})-(\d{1,2})$/);
    if (pm) {
      const yr = pm[1];
      const nn = pm[2].padStart(2, '0');
      const folder = yr === '2025' ? '/images/ladies-club/summerfest' : `/images/ladies-club/summerfest${yr}`;
      imageUrl = `${origin}${folder}/devils-lake-summerfest-${yr}-${nn}.jpg`;
      title = `Devil's Lake Summerfest ${yr} - Manitou Beach`;
      description = `A moment from Devil's Lake Summerfest ${yr} in Manitou Beach, Michigan. See the whole festival gallery.`;
    }
  }

  // ── Inject JSON-LD schema for AI crawlers ────────────────────
  const schemas = SCHEMA_MAP[cleanPath];
  if (schemas) {
    const schemaTag = schemas
      .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
      .join('\n    ');
    html = html.replace('</head>', `    ${schemaTag}\n  </head>`);
  }

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

  // Extra image hints so first-time scrapers render the photo faster / more reliably.
  html = html.replace('</head>', `    <meta property="og:image:secure_url" content="${imageUrl}" />\n    <meta property="og:image:type" content="image/jpeg" />\n  </head>`);

  return new Response(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}

// ── Public event galleries ────────────────────────────────────
// Mirror of src/data/galleries.js (edge middleware can't reliably import from src).
// Keep in sync when adding a gallery so shared links show the right photo preview.
// Curated galleries have folder+prefix (per-photo previews via ?photo=NN).
// Crowd galleries have a static `cover` instead (photos are user-submitted Blob
// URLs with no predictable path), so the share preview uses the cover image.
const GALLERY_OG = {
  'mens-club': {
    title: "Men's Club",
    description: 'Community photos from the Devils Lake & Round Lake Men’s Club in Manitou Beach, Michigan. Add yours and share.',
    cover: '/images/og/mensclub-og.jpg',
  },
  'america-250': {
    title: 'America 250',
    description: 'Community photos from the America 250 celebration in Manitou Beach, Michigan. Add yours and share the day.',
    cover: '/images/happening-hero.jpg',
  },
  'ladies-club': {
    title: 'Ladies Club',
    description: 'Community photos from Manitou Beach Ladies Club events on Devils Lake, Michigan.',
    cover: '/images/ladies-club/artists.jpg',
  },
  'july-4-2026': {
    title: 'July 4th Weekend 2026',
    description: 'Photos from July 4th weekend on Devils Lake in Manitou Beach, Michigan. View the gallery and share your favorites.',
    folder: '/images/galleries/july-4-2026',
    prefix: 'manitou-july-4-2026',
  },
};

// Inject gallery OG tags. With ?photo=NN the preview is that exact photo; otherwise photo 01.
function handleGalleryOG(html, slug, url) {
  const g = GALLERY_OG[slug];
  if (!g) return html; // unknown gallery → leave default OG

  const origin = url.origin;
  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const photoParam = url.searchParams.get('photo');
  const nn = photoParam && /^\d{1,3}$/.test(photoParam) ? String(photoParam).padStart(2, '0') : '01';
  // Crowd galleries use a fixed cover; curated galleries preview the chosen photo.
  const img = esc(g.cover ? `${origin}${g.cover}` : `${origin}${g.folder}/${g.prefix}-${nn}.jpg`);
  const t = esc(`${g.title} - Manitou Beach`);
  const d = esc(g.description);
  const pageUrl = esc(`${origin}/gallery/${slug}${photoParam ? `?photo=${photoParam}` : ''}`);

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${d}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${t}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${d}"`)
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${img}"`)
    .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${pageUrl}"`)
    .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${t}"`)
    .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${d}"`)
    .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${img}"`)
    .replace('</head>', `    <meta property="og:image:secure_url" content="${img}" />\n    <meta property="og:image:type" content="image/jpeg" />\n  </head>`);
}

// ── Dynamic schema handler for business profiles ──────────────
export async function handleBusinessSchema(html, slug, origin) {
  try {
    const res = await fetch(`${origin}/api/businesses`);
    if (!res.ok) return html;
    const data = await res.json();
    const all = [...(data.premium||[]), ...(data.featured||[]), ...(data.enhanced||[]), ...(data.free||[])];
    const biz = all.find(b => b.name && b.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') === slug);
    if (!biz) return html;

    const SCHEMA_TYPES = { 'Restaurant':'Restaurant','Bar':'BarOrPub','Real Estate':'RealEstateAgent','Marina':'Marina','Retail':'Store','Hotel':'LodgingBusiness','Vacation Rental':'LodgingBusiness','Food Truck':'FoodEstablishment','Winery':'Winery','Art Gallery':'ArtGallery','Bakery':'Bakery','Cafe':'CafeOrCoffeeShop','Auto':'AutoRepair','Beauty':'BeautySalon','Fitness':'SportsActivityLocation' };
    const bizSchema = {
      '@context': 'https://schema.org',
      '@type': SCHEMA_TYPES[biz.category] || 'LocalBusiness',
      name: biz.name,
      ...(biz.description && { description: biz.description }),
      ...(biz.phone && { telephone: biz.phone }),
      ...(biz.website && { url: biz.website }),
      ...(biz.address && { address: { '@type': 'PostalAddress', streetAddress: biz.address, addressLocality: 'Manitou Beach', addressRegion: 'MI', addressCountry: 'US' } }),
      ...(biz.lat && biz.lng && { geo: { '@type': 'GeoCoordinates', latitude: biz.lat, longitude: biz.lng } }),
      areaServed: { '@type': 'Place', name: 'Manitou Beach, Devils Lake, Michigan' },
      memberOf: { '@type': 'Organization', name: 'Manitou Beach Michigan', url: 'https://manitoubeachmichigan.com' },
    };

    const schemas = [bizSchema];
    if (biz.geoFaq) {
      schemas.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: biz.geoFaq });
    }

    const schemaTag = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n    ');
    return html.replace('</head>', `    ${schemaTag}\n  </head>`);
  } catch { return html; }
}

// ── Dynamic OG + schema handler for event detail pages ────────
// Crawlers (Facebook, iMessage, X) don't run JS, so the client-side SEOHead
// tags are invisible to them. Inject event-specific OG tags server-side here.
export async function handleEventOG(html, id, origin) {
  try {
    const res = await fetch(`${origin}/api/event-detail?id=${encodeURIComponent(id)}`);
    if (!res.ok) return html; // 404 / unapproved → keep default OG (safe fallback)
    const data = await res.json();
    const event = data.event;
    if (!event || !event.name) return html;

    // Escape for safe insertion into HTML attribute values (user-supplied content)
    const esc = (s) => String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    // Replicates formatFullDate() from EventDetailPage.jsx
    const fullDate = event.date
      ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    // Replicates metaDesc from EventDetailPage.jsx, capped to ~200 chars
    const rawDesc = `${event.name}${event.location ? ` at ${event.location}` : ''}. ${fullDate}${event.description ? '. ' + event.description.slice(0, 100) : ''}`.trim();
    const description = rawDesc.length > 200 ? rawDesc.slice(0, 197) + '…' : rawDesc;

    const title = `${event.name} - Manitou Beach`;
    const image = event.imageUrl || `${origin}${DEFAULT_OG.image}`;
    const pageUrl = `${origin}/events/${id}`;

    const t = esc(title);
    const d = esc(description);
    const img = esc(image);

    html = html
      .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
      .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${d}"`)
      .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${t}"`)
      .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${d}"`)
      .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${img}"`)
      .replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${esc(pageUrl)}"`)
      .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${t}"`)
      .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${d}"`)
      .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${img}"`);

    // Inject Event JSON-LD schema for richer crawler / AI results (mirrors EventDetailPage.jsx)
    const eventSchema = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.name,
      ...(event.date && { startDate: `${event.date}${event.timeStart ? 'T' + event.timeStart : 'T00:00:00'}` }),
      ...(event.date && { endDate: `${event.date}${event.timeEnd ? 'T' + event.timeEnd : 'T23:59:59'}` }),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: event.location || 'Manitou Beach, Michigan',
        address: { '@type': 'PostalAddress', addressLocality: 'Manitou Beach', addressRegion: 'MI', addressCountry: 'US' },
      },
      ...(event.description && { description: event.description }),
      image,
      url: pageUrl,
      organizer: event.organizerName
        ? { '@type': 'Organization', name: event.organizerName }
        : { '@type': 'Organization', name: 'Manitou Beach Michigan', url: 'https://manitoubeachmichigan.com' },
      ...(event.ticketPrice ? { offers: { '@type': 'Offer', price: String(event.ticketPrice), priceCurrency: 'USD', url: pageUrl, availability: 'https://schema.org/InStock' } } : {}),
    };
    const schemaTag = `<script type="application/ld+json">${JSON.stringify(eventSchema)}</script>`;
    html = html.replace('</head>', `    ${schemaTag}\n  </head>`);

    return html;
  } catch { return html; }
}

// ── Route matcher - skip files and API ───────────────────────
export const config = {
  matcher: ['/((?!api/|_vercel|images/|icons/|src/|favicon\\.ico).*)'],
};
