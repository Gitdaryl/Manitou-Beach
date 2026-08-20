/**
 * Backfill the start and end time on Chateau Aeronautique Winery shows.
 *
 * Why: scripts/import-chateau-events.mjs created the rows with no time at all.
 * All 37 upcoming Chateau events are timeless, which is more than half the live
 * feed, so the site shows no time, the schema.org markup carries no startTime,
 * and the AI Holly script has to say "no start time listed" every single week.
 * Daryl confirmed 8 to 11 PM is constant for that venue.
 *
 * Two things about this database that will bite you:
 *
 *   1. The property called `Time` is a created_time system field. It is
 *      read-only and api/events.js can never read anything out of it. Writing
 *      there does nothing. The real times live in `Time End`.
 *   2. `Time End` holds BOTH times as one string, split by an EN DASH with
 *      spaces around it: "8:00 PM – 11:00 PM". api/events.js splits on ' – '.
 *      A plain hyphen breaks the split and the whole string renders as the
 *      start time, which is exactly how the Two Lakes Tavern rows ended up
 *      reading as 11:00 PM starts.
 *
 * Usage:
 *   node scripts/set-chateau-times.mjs --dry-run    # show what would change
 *   node scripts/set-chateau-times.mjs              # apply
 *   TIMES='7:00 PM – 10:00 PM' node scripts/set-chateau-times.mjs
 *   FROM=2026-09-01 node scripts/set-chateau-times.mjs   # only on/after
 *   node scripts/set-chateau-times.mjs --overwrite  # clobber existing times
 *
 * Needs NOTION_TOKEN_EVENTS (and optionally NOTION_DB_EVENTS) in the environment.
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN_EVENTS;
const EVENTS_DB = process.env.NOTION_DB_EVENTS || '30d8c729eb5980eab54ac5ad67358731';
// En dash, not a hyphen. See the header.
const TIMES = process.env.TIMES || '8:00 PM – 11:00 PM';
const MATCH = process.env.MATCH || 'Chateau Aeronautique';
const FROM = process.env.FROM || null;
const DRY = process.argv.includes('--dry-run');
const OVERWRITE = process.argv.includes('--overwrite');

if (!NOTION_TOKEN) {
  console.error('Missing NOTION_TOKEN_EVENTS');
  process.exit(1);
}

if (!TIMES.includes('–')) {
  console.error(
    `TIMES must separate start and end with an en dash (–), not a hyphen.\n` +
    `  Got: "${TIMES}"\n` +
    `  api/events.js splits on ' – '; a hyphen makes the whole string the start time.`);
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

async function queryAll() {
  const rows = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${EVENTS_DB}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: { property: 'Event Name', title: { contains: MATCH } },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });
    if (!res.ok) throw new Error(`query failed ${res.status}: ${await res.text()}`);
    const data = await res.json();
    rows.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return rows;
}

const text = (p) => (p?.rich_text || []).map(t => t.plain_text).join('');
const titleOf = (r) => (r.properties['Event Name']?.title || []).map(t => t.plain_text).join('');
const dateOf = (r) => r.properties['Event date']?.date?.start || '';

async function setTimes(id) {
  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      properties: { 'Time End': { rich_text: [{ text: { content: TIMES } }] } },
    }),
  });
  if (!res.ok) throw new Error(`patch ${id} failed ${res.status}: ${await res.text()}`);
}

const rows = (await queryAll())
  .filter(r => !FROM || dateOf(r) >= FROM)
  .sort((a, b) => dateOf(a).localeCompare(dateOf(b)));

const todo = rows.filter(r => OVERWRITE || !text(r.properties['Time End']).trim());
const skipped = rows.length - todo.length;

console.log(`\nMatched ${rows.length} "${MATCH}" events${FROM ? ` on/after ${FROM}` : ''}.`);
console.log(`${todo.length} to set to "${TIMES}"${skipped ? `, ${skipped} already have a time (left alone)` : ''}.\n`);

let ok = 0, failed = 0;
for (let i = 0; i < todo.length; i++) {
  const r = todo[i];
  const label = `[${i + 1}/${todo.length}] ${dateOf(r)} ${titleOf(r)}`;
  if (DRY) { console.log(`  would set  ${label}`); continue; }
  try {
    await setTimes(r.id);
    ok++;
    console.log(`  ✅ ${label}`);
  } catch (e) {
    failed++;
    console.error(`  ❌ ${label}\n     ${e.message}`);
  }
  // Notion rate limit is ~3 req/sec.
  if (i < todo.length - 1) await new Promise(res => setTimeout(res, 350));
}

if (DRY) console.log('\nDry run — nothing written.\n');
else console.log(`\nDone. ${ok} updated, ${failed} failed.\n`);
