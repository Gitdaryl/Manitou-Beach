// ============================================================
// Crowd photo store  (Vercel KV)
// ------------------------------------------------------------
// The image bytes live in Vercel Blob; this KV layer is just the
// index: which photo belongs to which gallery, its status, and how
// the community has reacted to it (flags + hearts).
//
// Keys:
//   mbphoto:<id>           hash  { id, slug, url, name, w, h, status, flags, hearts, ts }
//   mbphoto:<id>:flaggers  set   device ids that flagged (1 flag per person)
//   mbphoto:<id>:hearters  set   device ids that hearted (toggle)
//   mbphoto:<id>:reasons   list  "<ts>:<reason>" per flag, for the admin view
//   mbgallery:<slug>       zset  member=id, score=ts   (newest-first ordering)
//
// status:  'live'    → public
//          'flagged' → auto-hidden after FLAG_HIDE_THRESHOLD reports (shows in admin, top of list)
//          'hidden'  → taken down by admin
//
// KV is optional: until the store is provisioned + connected in Vercel,
// KV_READY is false and every function no-ops gracefully so the rest of
// the site is unaffected.
// ============================================================

import { Redis } from '@upstash/redis';

// Accept whichever env-var names the connected store injects. Vercel's Upstash
// Marketplace integration sets KV_REST_API_* (legacy KV compatibility) and/or
// UPSTASH_REDIS_REST_*, so we look for both.
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;

export const KV_READY = !!(REST_URL && REST_TOKEN);
export const FLAG_HIDE_THRESHOLD = 3; // distinct people before a photo auto-hides from the public feed

const kv = KV_READY ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null;

const pKey = (id) => `mbphoto:${id}`;
const gKey = (slug) => `mbgallery:${slug}`;
const fKey = (id) => `mbphoto:${id}:flaggers`;
const hKey = (id) => `mbphoto:${id}:hearters`;
const rKey = (id) => `mbphoto:${id}:reasons`;

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `p_${Date.now().toString(36)}_${Math.round(Math.random() * 1e9).toString(36)}`;
}

// Coerce hash values (KV can hand numbers back as strings) into a clean shape.
function normalize(h) {
  if (!h || !h.id) return null;
  return {
    id: h.id,
    slug: h.slug,
    url: h.url,
    name: h.name || '',
    w: Number(h.w) || null,
    h: Number(h.h) || null,
    event: h.event || '',
    status: h.status || 'live',
    flags: Number(h.flags) || 0,
    hearts: Number(h.hearts) || 0,
    ts: Number(h.ts) || 0,
  };
}

// Add an uploaded photo to a gallery. Returns the stored record.
export async function addPhoto(slug, { url, name, w, h, event }) {
  const id = newId();
  const ts = Date.now();
  const rec = { id, slug, url, name: name || '', w: w || '', h: h || '', event: event || '', status: 'live', flags: 0, hearts: 0, ts };
  await kv.hset(pKey(id), rec);
  await kv.zadd(gKey(slug), { score: ts, member: id });
  return normalize(rec);
}

// Single photo record (for notify payloads etc). Null if unknown.
export async function getPhoto(id) {
  return normalize(await kv.hgetall(pKey(id)));
}

async function idsForGallery(slug) {
  // newest first
  return (await kv.zrange(gKey(slug), 0, -1, { rev: true })) || [];
}

async function recordsForIds(ids) {
  if (!ids.length) return [];
  const recs = await Promise.all(ids.map((id) => kv.hgetall(pKey(id))));
  return recs.map(normalize).filter(Boolean);
}

// Public feed: only live photos, newest first.
export async function listLive(slug) {
  const recs = await recordsForIds(await idsForGallery(slug));
  return recs.filter((r) => r.status === 'live');
}

// Admin feed: everything, flagged photos floated to the top, with flag reasons.
export async function listAll(slug) {
  const recs = await recordsForIds(await idsForGallery(slug));
  const withReasons = await Promise.all(recs.map(async (r) => {
    if (!r.flags) return r;
    const reasons = (await kv.lrange(rKey(r.id), 0, -1)) || [];
    return { ...r, reasons: reasons.map((x) => String(x).replace(/^\d+:/, '')) };
  }));
  return withReasons.sort((a, b) => {
    const af = a.status === 'flagged' ? 0 : 1;
    const bf = b.status === 'flagged' ? 0 : 1;
    if (af !== bf) return af - bf;
    return b.ts - a.ts;
  });
}

// Community flag: one per person (deviceId) per photo. Auto-hides once
// distinct flaggers cross the threshold. Returns { flags, duplicate, autoHidden }.
export async function reportPhoto(id, deviceId, reason) {
  const exists = await kv.hget(pKey(id), 'id');
  if (!exists) return null;
  const added = await kv.sadd(fKey(id), deviceId || 'anon');
  if (!added) {
    const flags = Number(await kv.hget(pKey(id), 'flags')) || 0;
    return { flags, duplicate: true, autoHidden: false };
  }
  if (reason) await kv.rpush(rKey(id), `${Date.now()}:${reason}`);
  const flags = await kv.scard(fKey(id));
  await kv.hset(pKey(id), { flags });
  let autoHidden = false;
  const status = await kv.hget(pKey(id), 'status');
  if (flags >= FLAG_HIDE_THRESHOLD && status === 'live') {
    await kv.hset(pKey(id), { status: 'flagged' });
    autoHidden = true;
  }
  return { flags, duplicate: false, autoHidden };
}

// Community heart: toggles per person. Returns { hearts, hearted }.
export async function heartPhoto(id, deviceId) {
  const exists = await kv.hget(pKey(id), 'id');
  if (!exists) return null;
  const dev = deviceId || 'anon';
  const added = await kv.sadd(hKey(id), dev);
  let hearted = true;
  if (!added) {
    await kv.srem(hKey(id), dev);
    hearted = false;
  }
  const hearts = await kv.scard(hKey(id));
  await kv.hset(pKey(id), { hearts });
  return { hearts, hearted };
}

// Admin action: 'hidden' (take down), 'live' (restore, clears flags + flaggers).
export async function setStatus(id, status) {
  const exists = await kv.hget(pKey(id), 'id');
  if (!exists) return false;
  const patch = { status };
  if (status === 'live') {
    patch.flags = 0;
    await kv.del(fKey(id));
    await kv.del(rKey(id));
  }
  await kv.hset(pKey(id), patch);
  return true;
}
