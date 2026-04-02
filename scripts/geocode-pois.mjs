/**
 * geocode-pois.mjs
 *
 * Reads all Community POIs from Notion, geocodes each address via Google
 * Geocoding API, then patches Notion with the corrected lat/lng.
 *
 * Usage:
 *   NOTION_TOKEN_POIS=<token> VITE_GOOGLE_MAPS_API_KEY=<key> node scripts/geocode-pois.mjs
 *
 * Flags:
 *   --dry-run    Show what would change without writing to Notion
 *   --force      Re-geocode even if lat/lng already exists
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN_POIS;
const NOTION_DB    = process.env.NOTION_DB_POIS || '31c8c729eb5981baac48f12f50366ef1';
const MAPS_KEY     = process.env.VITE_GOOGLE_MAPS_API_KEY;

const DRY_RUN = process.argv.includes('--dry-run');
const FORCE   = process.argv.includes('--force');

if (!NOTION_TOKEN) { console.error('❌  Set NOTION_TOKEN_POIS'); process.exit(1); }
if (!MAPS_KEY)     { console.error('❌  Set VITE_GOOGLE_MAPS_API_KEY'); process.exit(1); }

// ── Notion helpers ──────────────────────────────────────────────────────────

async function notionFetch(path, method = 'GET', body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function getAllPOIs() {
  const pois = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const data = await notionFetch(`/databases/${NOTION_DB}/query`, 'POST', body);
    if (data.results) pois.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return pois;
}

function extractText(prop) {
  if (!prop) return '';
  if (prop.type === 'title')     return prop.title?.map(t => t.plain_text).join('') || '';
  if (prop.type === 'rich_text') return prop.rich_text?.map(t => t.plain_text).join('') || '';
  return '';
}

function extractNumber(prop) {
  return prop?.number ?? null;
}

// ── Google Geocoding ─────────────────────────────────────────────────────────

async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') {
    return null;
  }
  const loc = data.results[0].geometry.location;
  const formattedAddress = data.results[0].formatted_address;
  return { lat: loc.lat, lng: loc.lng, formatted: formattedAddress };
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log(`\n🗺️  Manitou Beach POI Geocoder${DRY_RUN ? ' [DRY RUN]' : ''}${FORCE ? ' [FORCE]' : ''}\n`);

const pages = await getAllPOIs();
console.log(`Found ${pages.length} POIs in Notion\n`);

let updated = 0, skipped = 0, failed = 0, noAddress = 0;

for (const page of pages) {
  const props   = page.properties;
  const name    = extractText(props['Name']);
  const address = extractText(props['Address']);
  const curLat  = extractNumber(props['Lat']);
  const curLng  = extractNumber(props['Lng']);

  if (!address) {
    console.log(`⚠️  ${name} — no address, skipping`);
    noAddress++;
    continue;
  }

  // Skip if coords already look good and --force not set
  if (!FORCE && curLat && curLng) {
    console.log(`⏭️  ${name} — already has coords (${curLat.toFixed(5)}, ${curLng.toFixed(5)}), skipping`);
    skipped++;
    continue;
  }

  const result = await geocode(address);

  if (!result) {
    console.log(`❌  ${name} — geocode failed for: "${address}"`);
    failed++;
    continue;
  }

  const latDiff = curLat ? Math.abs(result.lat - curLat).toFixed(5) : 'new';
  const lngDiff = curLng ? Math.abs(result.lng - curLng).toFixed(5) : 'new';

  console.log(`✅  ${name}`);
  console.log(`    Address:  ${result.formatted}`);
  if (curLat) {
    console.log(`    Old:      (${curLat.toFixed(6)}, ${curLng.toFixed(6)})`);
  }
  console.log(`    New:      (${result.lat.toFixed(6)}, ${result.lng.toFixed(6)})`);
  if (curLat) {
    console.log(`    Drift:    Δlat=${latDiff}  Δlng=${lngDiff}`);
  }

  if (!DRY_RUN) {
    await notionFetch(`/pages/${page.id}`, 'PATCH', {
      properties: {
        Lat: { number: result.lat },
        Lng: { number: result.lng },
      },
    });
    console.log(`    → Notion updated`);
  }

  updated++;

  // Respect Google's rate limits (50 req/sec max, but be conservative)
  await new Promise(r => setTimeout(r, 120));
}

console.log(`
──────────────────────────────────
Updated:    ${updated}
Skipped:    ${skipped}  (already had coords)
No address: ${noAddress}
Failed:     ${failed}
──────────────────────────────────

${DRY_RUN ? '⚠️  Dry run — nothing written to Notion. Re-run without --dry-run to apply.' : '✅  Done — all changes saved to Notion.'}
`);
