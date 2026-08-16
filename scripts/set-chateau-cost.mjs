/**
 * Backfill the Cost field on the Chateau Aeronautique Winery tribute-band events.
 *
 * Why: scripts/import-chateau-events.mjs created all 77 rows without a Cost, and a
 * blank Cost is treated as free everywhere downstream — no cost badge on the card
 * (NightlifePage / HappeningPage) and `isAccessibleForFree: true` in the Event
 * schema.org markup (SEOHead.jsx). The shows actually have a $25 cover.
 *
 * Usage:
 *   node scripts/set-chateau-cost.mjs --dry-run     # show what would change
 *   node scripts/set-chateau-cost.mjs               # apply
 *   COST='$30 cover' node scripts/set-chateau-cost.mjs
 *   FROM=2026-08-16 node scripts/set-chateau-cost.mjs   # only on/after this date
 *
 * Needs NOTION_TOKEN_EVENTS (and optionally NOTION_DB_EVENTS) in the environment.
 */

const NOTION_TOKEN = process.env.NOTION_TOKEN_EVENTS;
const EVENTS_DB = process.env.NOTION_DB_EVENTS || '30d8c729eb5980eab54ac5ad67358731';
const COST = process.env.COST || '$25 cover';
const MATCH = process.env.MATCH || 'Chateau Aeronautique';
const FROM = process.env.FROM || null;
const DRY = process.argv.includes('--dry-run');
const OVERWRITE = process.argv.includes('--overwrite');

if (!NOTION_TOKEN) {
  console.error('Missing NOTION_TOKEN_EVENTS');
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

async function setCost(id) {
  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ properties: { Cost: { rich_text: [{ text: { content: COST } }] } } }),
  });
  if (!res.ok) throw new Error(`patch ${id} failed ${res.status}: ${await res.text()}`);
}

const rows = (await queryAll())
  .filter(r => !FROM || dateOf(r) >= FROM)
  .sort((a, b) => dateOf(a).localeCompare(dateOf(b)));

const todo = rows.filter(r => OVERWRITE || !text(r.properties['Cost']).trim());
const skipped = rows.length - todo.length;

console.log(`\nMatched ${rows.length} "${MATCH}" events${FROM ? ` on/after ${FROM}` : ''}.`);
console.log(`${todo.length} to set to "${COST}"${skipped ? `, ${skipped} already have a Cost (left alone)` : ''}.\n`);

let ok = 0, failed = 0;
for (let i = 0; i < todo.length; i++) {
  const r = todo[i];
  const label = `[${i + 1}/${todo.length}] ${dateOf(r)} ${titleOf(r)}`;
  if (DRY) { console.log(`  would set  ${label}`); continue; }
  try {
    await setCost(r.id);
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
