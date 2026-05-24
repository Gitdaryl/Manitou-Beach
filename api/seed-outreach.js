// POST /api/seed-outreach — admin only, one-shot Google Places import
// Seeds the outreach DB with Devils Lake area businesses
import { put, list } from '@vercel/blob';

const CENTER = { lat: 41.9595, lng: -84.0525 }; // Devils Lake, MI
const RADIUS = 12000; // ~7.5 miles covers Devils Lake + Irish Hills core

const PLACE_TYPES = [
  'food', 'bar', 'lodging', 'tourist_attraction',
  'beauty_salon', 'campground', 'store', 'church',
];

const CATEGORY_MAP = [
  [/restaurant|food|cafe|bakery|meal/,    'Food & Drink'],
  [/bar|night_club|liquor/,               'Food & Drink'],
  [/lodging|rv_park|campground/,          'Lodging'],
  [/marina|boat/,                         'Recreation'],
  [/spa|beauty|hair|gym|fitness/,         'Health & Beauty'],
  [/real_estate|insurance|finance|bank/,  'Services'],
  [/car|auto|vehicle/,                    'Auto'],
  [/church|worship/,                      'Community'],
  [/tourist|amusement|museum|park/,       'Recreation'],
  [/grocery|supermarket|store|shop/,      'Shopping'],
  [/doctor|dentist|pharmacy|medical/,     'Health & Beauty'],
];

function inferCategory(types = []) {
  const s = types.join(' ');
  for (const [re, cat] of CATEGORY_MAP) {
    if (re.test(s)) return cat;
  }
  return 'Other';
}

function inferArea(vicinity = '') {
  const v = vicinity.toLowerCase();
  if (v.includes('manitou beach') || v.includes('onsted')) return 'Manitou Beach';
  if (v.includes('brooklyn')) return 'Brooklyn';
  if (v.includes('cambridge')) return 'Cambridge Junction';
  if (v.includes('tecumseh')) return 'Tecumseh';
  if (v.includes('clark lake') || v.includes('clarklake')) return 'Clark Lake';
  return 'Irish Hills Area';
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function readDb() {
  try {
    const { blobs } = await list({ prefix: 'outreach/db', token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blobs.length) return { businesses: [] };
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const r = await fetch(latest.url);
    if (!r.ok) return { businesses: [] };
    return await r.json();
  } catch {
    return { businesses: [] };
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

  // Note: GOOGLE_PLACES_API_KEY must be unrestricted (server-side use)
  // VITE_GOOGLE_MAPS_API_KEY may have HTTP referrer restrictions that block server calls
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No Google Places API key configured' });

  const db = await readDb();
  const seenPlaceIds = new Set((db.businesses || []).map(b => b.placeId).filter(Boolean));
  const added = [];

  for (const type of PLACE_TYPES) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${CENTER.lat},${CENTER.lng}&radius=${RADIUS}&type=${type}&key=${apiKey}`;
      const r = await fetch(url);
      const data = await r.json();

      for (const place of (data.results || [])) {
        if (seenPlaceIds.has(place.place_id)) continue;
        if (place.business_status === 'CLOSED_PERMANENTLY') continue;
        seenPlaceIds.add(place.place_id);

        added.push({
          id: makeId(),
          placeId: place.place_id,
          name: place.name,
          category: inferCategory(place.types),
          area: inferArea(place.vicinity || ''),
          phone: '',
          contact: '',
          assignedTo: null,
          status: 'new',
          priority: (place.rating || 0) >= 4.0 ? 'hot' : 'warm',
          notes: place.vicinity || '',
          lastActivity: null,
          activityLog: [],
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(`Places fetch failed for type ${type}:`, err.message);
    }

    await new Promise(r => setTimeout(r, 150));
  }

  db.businesses = [...(db.businesses || []), ...added];
  await writeDb(db);

  return res.status(200).json({ ok: true, added: added.length, total: db.businesses.length });
}
