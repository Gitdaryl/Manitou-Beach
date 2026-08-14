// ============================================================
// GET /api/status-agents
// ------------------------------------------------------------
// Public, read-only status board for the scheduled agents.
//
// Deliberately exposes ONLY: job name, cadence, the human role it replaces,
// the last invocation timestamp, and a derived on-time/late status.
//
// It exposes NO customer data, NO counts, NO revenue, and NO business names.
// Anything added here is world-readable, so keep it to operational metadata.
//
// Consumed by the positioning one-pager (work.yetigroove.com), which renders a
// static table first and upgrades it from this endpoint only if the fetch
// succeeds. If this endpoint is down the page silently keeps its static copy,
// so an outage here can never make that page look broken.
// ============================================================

import { readAll, HEARTBEAT_READY } from './lib/cronHeartbeat.js';

const HOUR = 3600;
const DAY = 24 * HOUR;

// Cadence mirrors the "crons" block in vercel.json. `every` is the expected gap
// between runs, used only to derive on-time vs late.
const JOBS = [
  { job: 'qa-agent',                cadence: '30 min',  every: 1800,    replaces: 'Manual site health checking' },
  { job: 'cron-category-qa',        cadence: 'Daily',   every: DAY,     replaces: 'Listing accuracy auditing' },
  { job: 'cron-event-reminders',    cadence: 'Daily',   every: DAY,     replaces: 'Events coordinator chasing vendors' },
  { job: 'cron-outreach-resolve',   cadence: 'Daily',   every: DAY,     replaces: 'Customer success follow-up' },
  { job: 'cron-review-digest',      cadence: 'Daily',   every: DAY,     replaces: 'Reputation monitoring' },
  { job: 'cron-sponsor-expiry',     cadence: 'Daily',   every: DAY,     replaces: 'Billing administration' },
  { job: 'cron-expire-featured',    cadence: 'Daily',   every: DAY,     replaces: 'Placement expiry admin' },
  { job: 'cron-expire-promotions',  cadence: 'Daily',   every: DAY,     replaces: 'Promotion expiry admin' },
  { job: 'cron-beta-trial-expiry',  cadence: 'Daily',   every: DAY,     replaces: 'Trial lifecycle admin' },
  { job: 'cron-new-listing',        cadence: 'Daily',   every: DAY,     replaces: 'New listing follow-up' },
  { job: 'cron-archive-events',     cadence: 'Daily',   every: DAY,     replaces: 'Data hygiene' },
  { job: 'sync-ical',               cadence: 'Daily',   every: DAY,     replaces: 'Manual calendar reconciliation' },
  { job: 'cron-newsletter-draft',   cadence: 'Weekly',  every: 7 * DAY, replaces: 'Copywriter' },
  { job: 'cron-social-post',        cadence: 'Weekly',  every: 7 * DAY, replaces: 'Social media manager' },
  { job: 'cron-truck-reminder',     cadence: 'Weekends',every: 7 * DAY, replaces: 'Vendor coordination' },
  { job: 'cron-truck-autopin',      cadence: 'Weekends',every: 7 * DAY, replaces: 'Manual map pinning' },
  { job: 'cron-profile-report-card',cadence: 'Monthly', every: 31 * DAY,replaces: 'Account management' },
  { job: 'cron-site-audit',         cadence: 'Monthly', every: 31 * DAY,replaces: 'Paid third-party site review' },
];

// A job is "late" once it has missed its window with room to spare. The grace
// multiplier absorbs normal scheduler drift so a job that runs a few minutes
// behind is not reported as a failure.
const GRACE = 2.5;

// CORS is wide open on purpose.
//
// An origin allowlist was tried first and was actively harmful here. This
// response is edge-cached, and the ACAO header varies by request origin, so the
// first cache fill from a request with no Origin header (a curl, a monitor, a
// crawler) got stored as the canonical response and then served to browsers,
// which saw no ACAO header and blocked it. Vary: Origin fixes that only if it
// is set on EVERY response including non-matching ones, which is easy to get
// wrong and silently breaks again on the next edit.
//
// The allowlist also bought nothing: this payload is public operational
// metadata with no credentials and no customer data, and anyone can read it
// with a single curl regardless. It was friction pretending to be security.
// A static "*" is cache-safe by construction.
const ALLOW_ORIGIN = '*';

function deriveStatus(lastRunIso, everySeconds) {
  if (!lastRunIso) return { status: 'unknown', ageSeconds: null };
  const ts = Date.parse(lastRunIso);
  if (Number.isNaN(ts)) return { status: 'unknown', ageSeconds: null };
  const ageSeconds = Math.max(0, Math.round((Date.now() - ts) / 1000));
  return { status: ageSeconds <= everySeconds * GRACE ? 'ok' : 'late', ageSeconds };
}

export default async function handler(req, res) {
  // Set unconditionally so the header is identical on every response and is
  // therefore safe to cache at the edge. See the ALLOW_ORIGIN note above.
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Short window on purpose. `ageSeconds` is computed at generation time, so a
  // long stale-while-revalidate would let the edge serve an age that drifts
  // further from reality the longer it sits. Consumers should prefer `lastRun`
  // (an absolute ISO timestamp, immune to caching) and derive age themselves.
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

  const heartbeats = await readAll(JOBS.map((j) => j.job));

  const agents = JOBS.map(({ job, cadence, every, replaces }) => {
    const lastRun = heartbeats[job] || null;
    const { status, ageSeconds } = deriveStatus(lastRun, every);
    return { job, cadence, replaces, lastRun, ageSeconds, status };
  });

  return res.status(200).json({
    ok: true,
    // false means no KV store is connected, so every row will read "unknown".
    // The consumer uses this to decide whether live data is worth showing at all.
    tracking: HEARTBEAT_READY,
    total: agents.length,
    generatedAt: new Date().toISOString(),
    agents,
  });
}
