// One-time seed: push hardcoded DISCOVER_POIS into the new Notion Community POIs DB
// Run: node scripts/seed-community-pois.mjs

const TOKEN = process.env.NOTION_TOKEN_POIS;
const DB_ID = process.env.NOTION_DB_POIS || '31c8c729eb5981baac48f12f50366ef1';
if (!TOKEN) { console.error('Set NOTION_TOKEN_POIS env var before running'); process.exit(1); }

const POIS = [
  // Healthcare
  { name: 'ProMedica Herrick Hospital', cat: 'healthcare', sub: 'Full Hospital · ER', address: '500 E Pottawatamie St, Tecumseh, MI', phone: '(517) 424-3000', note: '~15 min from Manitou Beach', lat: 42.0005, lng: -83.9340, website: 'https://www.promedica.org/herrick-hospital' },
  { name: 'Henry Ford Allegiance Health', cat: 'healthcare', sub: 'Full Hospital · Level II Trauma', address: '205 N East Ave, Jackson, MI', phone: '(517) 788-4800', note: '~30 min · Major medical center', lat: 42.2490, lng: -84.3945, website: 'https://www.henryford.com/locations/allegiance' },
  { name: 'Urgent Care – Tecumseh', cat: 'healthcare', sub: 'Urgent Care', address: '821 W Chicago Blvd, Tecumseh, MI', phone: '(517) 423-3200', note: '~15 min · Walk-in, no appointment needed', lat: 42.0040, lng: -83.9580 },
  { name: 'CVS Pharmacy – Tecumseh', cat: 'healthcare', sub: 'Pharmacy · MinuteClinic', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0035, lng: -83.9548 },
  { name: 'Walgreens – Adrian', cat: 'healthcare', sub: 'Pharmacy', address: 'N Main St, Adrian, MI', note: '~20 min · Open late', lat: 41.9197, lng: -84.0382 },
  // Grocery
  { name: 'Walmart Supercenter', cat: 'grocery', sub: 'Grocery · Pharmacy · Bait & Tackle', address: '1601 E US Hwy 223, Adrian, MI', note: '~20 min', lat: 41.9001, lng: -84.0174 },
  { name: 'Meijer', cat: 'grocery', sub: 'Grocery · Gas Station', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0030, lng: -83.9565 },
  // Water
  { name: 'Public Boat Launch – Devils Lake', cat: 'water', sub: 'Free Public Ramp', address: 'Devils Lake Hwy, Manitou Beach, MI', note: 'Free · Paved ramp · 60-car trailer parking', lat: 41.9795, lng: -84.3088 },
  { name: 'DNR Access Site – Round Lake', cat: 'water', sub: 'State DNR Ramp', address: 'Round Lake, Manitou Beach, MI', note: 'Kayaks · Canoes · Small boats', lat: 41.9580, lng: -84.3200 },
  { name: 'Manitou Beach Marina', cat: 'water', sub: 'Marina · 600+ Slips', address: '9517 Devils Lake Hwy, Manitou Beach, MI', note: 'Seasonal dockage available', lat: 41.9812, lng: -84.3091 },
  // Schools
  { name: 'Onsted High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '8036 Macon Rd, Onsted, MI', phone: '(517) 467-2170', note: '~10 min · Closest district to Manitou Beach', lat: 42.0030, lng: -84.1870 },
  { name: 'Onsted Elementary School', cat: 'schools', sub: 'Public K–5 · Onsted Community Schools', address: 'Onsted, MI', phone: '(517) 467-2170', note: '~10 min · Same campus area as HS', lat: 42.0043, lng: -84.1882 },
  { name: 'Addison Community Schools', cat: 'schools', sub: 'Public K–12 · Addison Community Schools', address: '219 N Comstock St, Addison, MI', phone: '(517) 547-6500', note: '~15 min · Northwest Lenawee County', lat: 41.9887, lng: -84.3448 },
  { name: 'Tecumseh High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '400 N Maumee St, Tecumseh, MI', phone: '(517) 423-3366', note: '~15 min · Tecumseh Public Schools', lat: 42.0100, lng: -83.9450 },
  { name: 'Adrian High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '785 Riverside Ave, Adrian, MI', phone: '(517) 263-2115', note: '~20 min · Adrian Public Schools', lat: 41.9060, lng: -84.0280 },
  { name: 'Lenawee Christian School', cat: 'schools', sub: 'Private K–12', address: 'Adrian, MI', phone: '(517) 265-5020', note: '~20 min · Faith-based PreK–12', lat: 41.8902, lng: -84.0557 },
  // Wineries
  { name: 'Chateau Aeronautique Winery', cat: 'wineries', sub: 'Winery & Event Venue', address: '1849 E Parnall Rd, Jackson, MI', phone: '(517) 795-3620', note: '~30 min · Live music weekends · All-weather biergarten', lat: 42.2380, lng: -84.3750, website: 'https://chateauaeronautique.com' },
  { name: 'Cherry Creek Cellars', cat: 'wineries', sub: 'Small-Batch Winery', address: '11500 Silver Lake Hwy, Brooklyn, MI 49230', phone: '(517) 592-4315', note: '~20 min · Laid-back tasting room', lat: 42.0504585, lng: -84.3012163, website: 'https://cherrycreekcellars.com' },
  { name: 'Ang & Co', cat: 'wineries', sub: 'Satellite Tasting Room', address: '141 N Lakeview Blvd, Manitou Beach, MI', phone: '(517) 547-6030', note: 'In the Village · Michigan wine + gifts', lat: 41.9720, lng: -84.3040, website: 'https://www.angandco.net' },
  // Community
  { name: "Devils Lake Yacht Club", cat: 'community', sub: 'Sailing & Social Club', address: '2097 Marsh Dr, Manitou Beach, MI', note: 'Since the 1940s · Regattas · Friday Fish Fry', lat: 41.9678, lng: -84.2880, website: 'https://www.devilslakeyachtclub.com' },
  { name: "Devils & Round Lake Men's Club", cat: 'community', sub: 'Civic Organization', address: 'Manitou Beach, MI', note: 'Tip-Up Festival · Firecracker 7K · Shop with a Cop', lat: 41.9720, lng: -84.2990 },
  { name: 'Manitou Beach Historic Renovation Society', cat: 'community', sub: 'Historical & Arts Org', address: 'Manitou Beach Village', note: 'Village restoration · Arts · Community stewardship', lat: 41.9730, lng: -84.3040 },
  { name: 'Manitou Beach Village', cat: 'community', sub: 'Village District', address: 'N Lakeview Blvd, Manitou Beach, MI', note: 'Shops · Cafe · Wine tasting · The Lighthouse', lat: 41.9720, lng: -84.3055 },
];

async function createPOI(poi) {
  const properties = {
    'Name': { title: [{ text: { content: poi.name } }] },
    'Category': { select: { name: poi.cat } },
    'Sub': { rich_text: poi.sub ? [{ text: { content: poi.sub } }] : [] },
    'Address': { rich_text: poi.address ? [{ text: { content: poi.address } }] : [] },
    'Lat': { number: poi.lat },
    'Lng': { number: poi.lng },
    'Note': { rich_text: poi.note ? [{ text: { content: poi.note } }] : [] },
    'Status': { select: { name: 'Active' } },
  };
  if (poi.phone) properties['Phone'] = { phone_number: poi.phone };
  if (poi.website) properties['Website'] = { url: poi.website };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ parent: { database_id: DB_ID }, properties }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`  ✗ ${poi.name}: ${data.message}`);
    return false;
  }
  console.log(`  ✓ ${poi.name}`);
  return true;
}

console.log(`Seeding ${POIS.length} POIs into Notion Community POIs DB…\n`);
let ok = 0, fail = 0;
for (const poi of POIS) {
  const success = await createPOI(poi);
  if (success) ok++; else fail++;
  await new Promise(r => setTimeout(r, 350)); // respect Notion rate limits
}
console.log(`\nDone: ${ok} created, ${fail} failed`);
