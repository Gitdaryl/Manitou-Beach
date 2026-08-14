// ============================================================
// Car identifications  ("Know this car?" on event galleries)
// ------------------------------------------------------------
// Visitors tell us what a car is and, ideally, whose it is. This is
// how a gallery of unlabelled photos turns itself into next year's
// entrant list without anyone typing up a clipboard.
//
// Keys:
//   mbcarid:<id>       hash  { id, slug, photo, photoKey, car, owner, contact, note, ts, status }
//   mbcarids:<slug>    zset  member=id, score=ts   (newest-first)
//
// status: 'new' → straight from the public form, unverified
//         'ok'  → confirmed by the organizer
//
// Same optional-KV contract as api/lib/photos.js: until the store is
// connected, KV_READY is false and callers degrade gracefully rather
// than 500ing at a visitor who was trying to help.
// ============================================================

import { Redis } from '@upstash/redis';

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;

export const KV_READY = !!(REST_URL && REST_TOKEN);

const kv = KV_READY ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null;

const idKey = (id) => `mbcarid:${id}`;
const listKey = (slug) => `mbcarids:${slug}`;

function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Trim and hard-cap a free-text field so one paste can't fill the store.
const clean = (v, max) => String(v ?? '').trim().slice(0, max);

/**
 * Persist one identification. Returns the stored record.
 * Throws only if KV is connected and the write genuinely fails, so the
 * caller can tell "not switched on" apart from "we lost your answer".
 */
export async function addCarId({ slug, photo, photoKey, car, owner, contact, note }) {
  const rec = {
    id: newId(),
    slug: clean(slug, 60),
    photo: clean(photo, 300),
    photoKey: clean(photoKey, 20),
    car: clean(car, 160),
    owner: clean(owner, 120),
    contact: clean(contact, 160),
    note: clean(note, 500),
    ts: Date.now(),
    status: 'new',
  };
  if (!kv) return rec; // caller decides what to tell the visitor
  await kv.hset(idKey(rec.id), rec);
  await kv.zadd(listKey(rec.slug), { score: rec.ts, member: rec.id });
  return rec;
}

/** Newest-first identifications for a gallery. */
export async function listCarIds(slug, limit = 500) {
  if (!kv) return [];
  const ids = await kv.zrange(listKey(slug), 0, limit - 1, { rev: true });
  if (!ids?.length) return [];
  const recs = await Promise.all(ids.map((id) => kv.hgetall(idKey(id))));
  return recs.filter(Boolean);
}

/** How many identifications a gallery has collected. */
export async function countCarIds(slug) {
  if (!kv) return 0;
  return (await kv.zcard(listKey(slug))) || 0;
}
