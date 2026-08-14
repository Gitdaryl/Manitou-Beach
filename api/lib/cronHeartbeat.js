// ============================================================
// Cron heartbeat
// ------------------------------------------------------------
// Records "this scheduled job just started" so /api/status-agents can
// report which agents are running on time. One tiny KV write per run.
//
// Keys:  mbcron:<job>  string  ISO timestamp of the most recent invocation
//
// Design constraints, in order of importance:
//
//   1. It must NEVER break a cron. Every failure path swallows. A heartbeat
//      is observability, not business logic, and a KV outage must not take
//      down the job it is measuring.
//
//   2. It must NEVER change auth semantics. `record()` is synchronous and
//      returns undefined. It is called from requireCron() AFTER the auth
//      decision is already made. requireCron stays sync and keeps returning
//      a plain boolean, because callers do `if (!requireCron(req, res)) return;`
//      and a Promise there would be truthy on every path, silently turning
//      `!promise` into false and letting unauthorized requests through.
//
//   3. The write is fire-and-forget, issued at the very top of the handler.
//      The invocation then stays alive for the seconds of real work that
//      follow, which is ample time for a single REST write to land. We do not
//      await it, because awaiting would mean making requireCron async, which
//      is constraint 2.
//
// KV is optional here exactly as it is in photos.js: with no store connected,
// every call is a silent no-op and nothing else is affected.
// ============================================================

import { Redis } from '@upstash/redis';

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;

export const HEARTBEAT_READY = !!(REST_URL && REST_TOKEN);

const kv = HEARTBEAT_READY ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null;

export const hbKey = (job) => `mbcron:${job}`;

// Heartbeats are disposable. If a job stops running we want its key to age out
// rather than sit there forever asserting a run that happened last spring.
const TTL_SECONDS = 60 * 60 * 24 * 45; // 45 days, longer than the slowest job's monthly cadence

// Derive a stable job name from the request path: /api/cron-site-audit -> cron-site-audit
export function jobNameFromRequest(req) {
  const raw = req?.url || '';
  const path = raw.split('?')[0];
  const last = path.split('/').filter(Boolean).pop() || '';
  const name = last.replace(/\.js$/, '');
  return /^[a-z0-9-]{1,64}$/i.test(name) ? name : null;
}

// Fire-and-forget. Synchronous by contract. Never throws, never returns a Promise.
export function record(job) {
  if (!kv || !job) return;
  try {
    const p = kv.set(hbKey(job), new Date().toISOString(), { ex: TTL_SECONDS });
    // Attach a catch so an unhandled rejection can never surface as a crash.
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // swallow: see constraint 1
  }
}

export function recordFromRequest(req) {
  record(jobNameFromRequest(req));
}

// Bulk read for the status endpoint. Returns { job: isoString|null }.
export async function readAll(jobs) {
  if (!kv || !jobs?.length) return {};
  try {
    const values = await kv.mget(...jobs.map(hbKey));
    return jobs.reduce((acc, job, i) => {
      const v = values?.[i];
      acc[job] = typeof v === 'string' && v ? v : null;
      return acc;
    }, {});
  } catch {
    return {};
  }
}
