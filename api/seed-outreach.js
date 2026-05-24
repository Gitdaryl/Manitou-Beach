// POST /api/seed-outreach — admin only
// Seeds the outreach DB with businesses near Manitou Beach village (5-mile radius)
// Body: { clear: true } wipes existing list before importing (for a fresh reseed)
import { put, list } from '@vercel/blob';

// Manitou Beach village, south shore of Devils Lake — not the lake center
const CENTER = { lat: 41.9561, lng: -84.0612 };
const RADIUS = 8047; // 5 miles in meters

// Cities to EXCLUDE — they show up inside 5 miles but aren't Manitou Beach area
const EXCLUDED_CITIES = [', adrian', ', tecumseh', ', blissfield', ', hudson', ', clinton,'];

// 13 searches — stays well under 60s maxDuration even on slow API days
const SEARCHES = [
  // Food & drink
  { type: 'restaurant' },
  { type: 'bar' },
  // Lodging & camping
  { type: 'lodging' },
  { type: 'campground' },
  // Recreation
  { type: 'tourist_attraction' },
  { type: 'golf_course' },
  // Wineries & lake businesses — keyword search is broader
  { keyword: 'winery vineyard' },
  { keyword: 'marina boat rental' },
  // Home services
  { type: 'plumber' },
  { type: 'electrician' },
  { type: 'painter' },
  { keyword: 'landscaping lawn care' },
  // Beauty & retail
  { type: 'beauty_salon' },
];

const CATEGORY_MAP = [
  [/restaurant|food|cafe|bakery|meal/,                          'Food & Drink'],
  [/bar|night_club|liquor/,                                     'Food & Drink'],
  [/lodging|rv_park|campground/,                                'Lodging'],
  [/golf/,                                                      'Recreation'],
  [/winery|vineyard|wine/,                                      'Winery'],
  [/marina|boat/,                                               'Recreation'],
  [/tourist|amusement|museum|park/,                             'Recreation'],
  [/plumber|electrician|locksmith|painter|contractor|handyman/, 'Home Services'],
  [/roofing/,                                                   'Home Services'],
  [/landscaping|lawn/,                                          'Home Services'],
  [/hvac|heating|cooling/,                                      'Home Services'],
  [/spa|beauty|hair|gym|fitness/,                               'Health & Beauty'],
  [/real_estate|insurance|finance|bank/,                        'Services'],
  [/car|auto|vehicle/,                                          'Auto'],
  [/grocery|supermarket|store|shop/,                            'Shopping'],
  [/doctor|dentist|pharmacy|medical/,                           'Health & Beauty'],
];

function inferCategory(types = [], name = '') {
  const s = [...types, name.toLowerCase()].join(' ');
  for (const [re, cat] of CATEGORY_MAP) {
    if (re.test(s)) return cat;
  }
  return 'Other';
}

function inferArea(vicinity = '') {
  const v = vicinity.toLowerCase();
  if (v.includes('manitou beach')) return 'Manitou Beach';
  if (v.includes('onsted')) return 'Manitou Beach'; // Onsted is the adjacent village
  if (v.includes('brooklyn')) return 'Brooklyn';
  if (v.includes('cambridge')) return 'Cambridge Junction';
  if (v.includes('clark lake') || v.includes('clarklake')) return 'Clark Lake';
  if (v.includes('irish hills') || v.includes('hayes')) return 'Irish Hills';
  return 'Irish Hills Area';
}

function shouldExclude(vicinity = '') {
  const v = vicinity.toLowerCase();
  return EXCLUDED_CITIES.some(city => v.includes(city));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function readDb() {
  try {
    const { blobs } = await list({ prefix: 'outreach/db', token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blobs.length) return { businesses: [], tickets: [] };
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const r = await fetch(latest.url);
    if (!r.ok) return { businesses: [], tickets: [] };
    return await r.json();
  } catch {
    return { businesses: [], tickets: [] };
  }
}

async function writeDb(data) {
  await put('outreach/db.json', JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }), {
    access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: 'application/json', addRandomSuffix: false,
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const pin = req.headers['x-outreach-pin'] || req.body?.pin;
  if (!pin || pin !== process.env.OUTREACH_PIN_ADMIN) {
    return res.status(401).json({ error: 'Admin PIN required' });
  }

  // GOOGLE_PLACES_API_KEY must be unrestricted (server-side). VITE_ key may have
  // HTTP referrer restrictions that block calls from Vercel's servers.
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No Google Places API key configured' });

  const clear = req.body?.clear === true;
  const db = await readDb();

  // When clearing: wipe businesses but preserve tickets
  const seenPlaceIds = clear
    ? new Set()
    : new Set((db.businesses || []).map(b => b.placeId).filter(Boolean));

  const added = [];
  let excluded = 0;

  for (const search of SEARCHES) {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${CENTER.lat},${CENTER.lng}&radius=${RADIUS}&key=${apiKey}`;
      if (search.type)    url += `&type=${encodeURIComponent(search.type)}`;
      if (search.keyword) url += `&keyword=${encodeURIComponent(search.keyword)}`;

      const r = await fetch(url);
      const data = await r.json();

      for (const place of (data.results || [])) {
        if (seenPlaceIds.has(place.place_id)) continue;
        if (place.business_status === 'CLOSED_PERMANENTLY') continue;

        // Filter out businesses clearly in Adrian, Tecumseh, etc.
        if (shouldExclude(place.vicinity || '')) { excluded++; continue; }

        seenPlaceIds.add(place.place_id);
        added.push({
          id: makeId(),
          placeId: place.place_id,
          name: place.name,
          category: inferCategory(place.types, place.name),
          area: inferArea(place.vicinity || ''),
          phone: '',
          contact: '',
          assignedTo: null,
          status: 'new',
          priority: (place.rating || 0) >= 4.3 ? 'hot' : 'warm',
          notes: place.vicinity || '',
          lastActivity: null,
          activityLog: [],
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(`Places fetch failed for search ${JSON.stringify(search)}:`, err.message);
    }

    await new Promise(r => setTimeout(r, 120));
  }

  db.businesses = clear ? [...added] : [...(db.businesses || []), ...added];
  await writeDb(db);

  return res.status(200).json({
    ok: true,
    cleared: clear,
    added: added.length,
    excluded,
    total: db.businesses.length,
  });
}
