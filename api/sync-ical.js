import { requireCron } from './lib/cronAuth.js';
// api/sync-ical.js
// Daily cron: fetches iCal feeds from all listed stays, parses blocked date ranges,
// merges with manual blocks (preserving them), writes back to Notion.
//
// iCal-sourced entries are tagged { from, to, source: 'ical' } so re-syncs can
// replace only the iCal entries without wiping owner-set manual blocks.

const NOTION_VERSION = '2022-06-28';

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  };
}

// Minimal RFC 5545 iCal parser — handles Airbnb/VRBO/Booking.com exports.
// Supports DATE (YYYYMMDD) and DATETIME (YYYYMMDDTHHmmssZ) values.
function parseIcal(text) {
  // Unfold line continuations (RFC 5545 §3.1)
  const unfolded = text
    .replace(/\r\n[ \t]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const events = [];
  const blocks = unfolded.split('BEGIN:VEVENT');

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    if (/STATUS\s*:\s*CANCELLED/i.test(block)) continue;

    // Match DATE portion only — works for both DATE and DATETIME values
    const startMatch = block.match(/DTSTART(?:[^:\r\n]*):(\d{8})/i);
    const endMatch   = block.match(/DTEND(?:[^:\r\n]*):(\d{8})/i);
    if (!startMatch || !endMatch) continue;

    const ds = startMatch[1];
    const de = endMatch[1];

    const from = `${ds.slice(0, 4)}-${ds.slice(4, 6)}-${ds.slice(6, 8)}`;

    // iCal DTEND is the exclusive end for all-day events (RFC 5545 §3.6.1)
    // Subtract one day to get inclusive end
    const endDate = new Date(
      parseInt(de.slice(0, 4)),
      parseInt(de.slice(4, 6)) - 1,
      parseInt(de.slice(6, 8))
    );
    endDate.setDate(endDate.getDate() - 1);
    const to = endDate.toISOString().split('T')[0];

    if (from <= to) {
      events.push({ from, to, source: 'ical' });
    }
  }

  return events;
}

async function getPageBlocked(pageId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: notionHeaders(),
  });
  if (!res.ok) return null;
  const page = await res.json();
  try {
    const raw = page.properties['Blocked Dates JSON']?.rich_text?.[0]?.text?.content || '';
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveBlocked(pageId, ranges) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: notionHeaders(),
    body: JSON.stringify({
      properties: {
        'Blocked Dates JSON': {
          rich_text: [{ text: { content: JSON.stringify(ranges) } }],
        },
      },
    }),
  });
  return res.ok;
}

async function syncOne(pageId, icalUrl) {
  const current = await getPageBlocked(pageId);
  if (current === null) return { pageId, error: 'page fetch failed' };

  // Keep manual blocks, drop old iCal entries
  const manual = current.filter(r => r.source !== 'ical');

  // Fetch and parse the iCal feed
  let icalEvents = [];
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const icalRes = await fetch(icalUrl, {
      headers: { 'User-Agent': 'ManitouBeachStays/1.0' },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (icalRes.ok) {
      icalEvents = parseIcal(await icalRes.text());
    } else {
      return { pageId, error: `iCal HTTP ${icalRes.status}` };
    }
  } catch (err) {
    return { pageId, error: `fetch failed: ${err.message}` };
  }

  // Merge: manual first, then iCal, sorted by start date
  const merged = [...manual, ...icalEvents].sort((a, b) => a.from.localeCompare(b.from));
  const ok = await saveBlocked(pageId, merged);

  return { pageId, manual: manual.length, ical: icalEvents.length, total: merged.length, ok };
}

async function alertAdmin(message) {
  const adminPhone = process.env.PLATFORM_ADMIN_PHONE;
  if (!adminPhone) return;
  try {
    const { sendSMS } = await import('./lib/twilio.js');
    await sendSMS(adminPhone, `MB Stays iCal sync: ${message}`);
  } catch { /* silent - don't let alert failure break the cron */ }
}

export default async function handler(req, res) {
  if (!requireCron(req, res)) return;
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dbId = process.env.NOTION_DB_STAYS;
  if (!dbId) return res.status(500).json({ error: 'NOTION_DB_STAYS not set' });

  // Query all active listings that have an iCal feed URL
  const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: notionHeaders(),
    body: JSON.stringify({
      filter: {
        and: [
          {
            or: [
              { property: 'Status', status: { equals: 'Listed Enhanced' } },
              { property: 'Status', status: { equals: 'Listed Featured' } },
            ],
          },
          { property: 'iCal Feed URL', rich_text: { is_not_empty: true } },
        ],
      },
      page_size: 100,
    }),
  });

  if (!queryRes.ok) {
    const detail = await queryRes.text();
    console.error('sync-ical Notion query failed:', detail);
    return res.status(500).json({ error: 'Notion query failed', detail });
  }

  const data = await queryRes.json();
  const results = [];

  for (const page of data.results) {
    const icalUrl = page.properties['iCal Feed URL']?.rich_text?.[0]?.text?.content;
    if (!icalUrl?.trim()) continue;
    const result = await syncOne(page.id, icalUrl.trim());
    results.push(result);
    console.log('sync-ical:', result);
  }

  const failures = results.filter(r => r.error);
  if (failures.length > 0) {
    const names = failures.map(f => f.pageId).join(', ');
    await alertAdmin(`${failures.length} feed(s) failed: ${names}`);
  }

  return res.status(200).json({ ok: true, synced: results.length, failures: failures.length, results });
}
