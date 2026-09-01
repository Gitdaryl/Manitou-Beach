// GET /api/snap-resolve?key=mensclub
// Decides where a scanned poster QR should send someone, at scan time.
//
// Returns { key, slug, confidence, picked, options } where:
//   confidence 'today'     — exactly one of that org's events is on today
//   confidence 'yesterday' — nothing today, but one ran yesterday (people
//                            upload the morning after; this is the grace window)
//   confidence 'ambiguous' — two or more candidates, visitor must pick
//   confidence 'none'      — nothing on the calendar; visitor picks or the
//                            photos land in the gallery's general bucket
//
// `picked` is a DEFAULT, never a lock. The page shows it and offers `options`.
//
// Failure policy: a printed poster must never dead-end. If Notion is down or
// unconfigured this still returns 200 with confidence 'none' so the upload
// screen opens and the photos are saved. Screen open beats gallery dark.

import { SNAP_KEYS, matchesOrg, galleryForEvent, tagForEvent } from './lib/snap-keys.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const etDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit' }).format(d);
const etWeekday = (d) => new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', weekday: 'long' }).format(d);

async function queryAllNotionPages(dbId, token, body) {
  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  let results = [];
  let startCursor;
  do {
    const pageBody = startCursor ? { ...body, start_cursor: startCursor } : body;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(pageBody) });
    if (!res.ok) throw new Error(`Notion query failed: ${await res.text()}`);
    const data = await res.json();
    results = results.concat(data.results);
    startCursor = data.has_more ? data.next_cursor : null;
  } while (startCursor);
  return results;
}

// Mirrors the field reading in api/events.js. 'Time' is a legacy field that is
// usually empty — the real times live in 'Time End' split on an EN DASH.
function readEvent(page) {
  const p = page.properties;
  const start = (p['Event date']?.date?.start || '').slice(0, 10);
  const raw = p['Time End']?.rich_text?.[0]?.text?.content || '';
  return {
    name: p['Event Name']?.title?.[0]?.text?.content || '',
    date: start,
    dateEnd: (p['Event date']?.date?.end || '').slice(0, 10) || null,
    time: p['Time']?.rich_text?.[0]?.text?.content || (raw.includes(' – ') ? raw.split(' – ')[0].trim() : raw),
    recurring: p['Recurring']?.select?.name || null,
    recurringDay: p['Recurring Day']?.select?.name || null,
    lifecycle: p['Lifecycle']?.select?.name || 'Active',
  };
}

// Is this event happening on `day`? Covers single-day, multi-day spans, and
// weekly/monthly recurrences whose stored date sits in the past.
function runsOn(e, day, weekday) {
  if (e.recurring === 'Weekly') return String(e.recurringDay || '').toLowerCase() === weekday.toLowerCase();
  if (!e.date) return false;
  if (e.dateEnd) return e.date <= day && day <= e.dateEnd;
  return e.date === day;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = String(req.query.key || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  const cfg = SNAP_KEYS[key];
  if (!cfg) return res.status(404).json({ error: 'Unknown poster code' });

  // Scan-time decision, so don't let a CDN pin yesterday's answer to the poster.
  res.setHeader('Cache-Control', 'no-store');

  const base = { key, slug: cfg.slug, label: cfg.label, confidence: 'none', picked: null, options: [] };

  if (!process.env.NOTION_TOKEN_EVENTS || !process.env.NOTION_DB_EVENTS) {
    return res.status(200).json({ ...base, degraded: 'config' });
  }

  let pages;
  try {
    pages = await queryAllNotionPages(process.env.NOTION_DB_EVENTS, process.env.NOTION_TOKEN_EVENTS, {
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Approved' } },
          { property: 'Status', status: { equals: 'Published' } },
        ],
      },
      sorts: [{ property: 'Event date', direction: 'ascending' }],
    });
  } catch (err) {
    console.error('snap-resolve: events feed unreachable:', err.message);
    return res.status(200).json({ ...base, degraded: 'feed' });
  }

  const now = new Date();
  const today = etDay(now);
  const yesterday = etDay(new Date(now.getTime() - DAY_MS));
  const todayWeekday = etWeekday(now);
  const yesterdayWeekday = etWeekday(new Date(now.getTime() - DAY_MS));

  // Cancelled events keep a ribbon on the public calendar but must never be a
  // photo destination; Paused events are pulled from the site entirely.
  const events = pages
    .map(readEvent)
    .filter((e) => e.name)
    .filter((e) => e.lifecycle !== 'Paused' && e.lifecycle !== 'Cancelled');

  // Shape one event into an upload destination, or null if it has no gallery.
  const asOption = (e, when) => {
    const slug = cfg.slug || galleryForEvent(e.name)?.slug;
    if (!slug) return null;
    return { slug, event: tagForEvent(slug, e.name), title: e.name, date: e.date, time: e.time || '', when };
  };

  const pick = (day, weekday, when) =>
    events
      .filter((e) => matchesOrg(cfg, e.name) && runsOn(e, day, weekday))
      .map((e) => asOption(e, when))
      .filter(Boolean);

  let candidates = pick(today, todayWeekday, 'today');
  let when = 'today';
  if (!candidates.length) {
    candidates = pick(yesterday, yesterdayWeekday, 'yesterday');
    when = 'yesterday';
  }

  if (candidates.length === 1) {
    return res.status(200).json({ ...base, slug: candidates[0].slug, confidence: when, picked: candidates[0], options: candidates });
  }
  if (candidates.length > 1) {
    return res.status(200).json({ ...base, slug: candidates[0].slug, confidence: 'ambiguous', picked: null, options: candidates });
  }

  // Nothing running. Offer this org's next few events so an early or late
  // scanner still files their photos somewhere sensible.
  const upcoming = events
    .filter((e) => matchesOrg(cfg, e.name) && e.date && e.date > today && e.date <= etDay(new Date(now.getTime() + 14 * DAY_MS)))
    .map((e) => asOption(e, 'upcoming'))
    .filter(Boolean)
    .slice(0, 4);

  return res.status(200).json({ ...base, confidence: 'none', options: upcoming });
}
