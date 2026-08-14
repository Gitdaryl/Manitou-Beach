// ============================================================
// Retrieval corpus
// ------------------------------------------------------------
// Turns Notion records into searchable passages, stores them with their
// embeddings, and finds the closest ones to a question.
//
// Design notes worth knowing before editing:
//
// 1. SCHEMA AGNOSTIC ON PURPOSE. This does not hardcode the shape of each
//    database. It flattens whatever text properties a page has, minus a
//    denylist. Seven databases with seven different schemas would otherwise be
//    seven extractors to maintain, and every schema change would silently break
//    one. It also means this ports to a new community without rewriting, which
//    is the point of community.config.js.
//
// 2. DENYLIST, NOT ALLOWLIST, FOR SECRETS. Anything matching the private
//    patterns never enters the corpus. The corpus is served to a public voice
//    agent, so a leak here is a leak to anyone who asks nicely. Erring toward
//    dropping a useful field beats erring toward exposing a token.
//
// 3. SHARDED BY SOURCE. One Redis key per source, holding its passages and a
//    packed vector blob. A question loads the shards, scores in memory, and
//    returns the best. At this corpus size brute force is a couple of
//    milliseconds and needs no vector database.
//
// 4. ALIASES ARE EMBEDDED, NOT JUST STORED. "Also Known As" goes into the text
//    that gets turned into a pin, so a question about a place's old name lands
//    on the same pin as its current name. Storing the alias without embedding
//    it would look right and do nothing.
// ============================================================

import { Redis } from '@upstash/redis';
import { embedDocuments, embedQuery, similarity, DIMS } from './embeddings.js';

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
const kv = REST_URL && REST_TOKEN ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null;

export const CORPUS_READY = !!kv;

// ── What goes in ────────────────────────────────────────────
// Deliberately excluded: RSVPs, beta testers, prize claims, contact form
// submissions, feedback, SMS subscribers, waitlists, partner intake. Those hold
// people's personal details and must never be retrievable by a public agent.
export const SOURCES = [
  { key: 'businesses',  env: 'NOTION_DB_BUSINESS',            token: 'NOTION_TOKEN_BUSINESS', label: 'Local business' },
  { key: 'events',      env: 'NOTION_DB_EVENTS',              token: 'NOTION_TOKEN_BUSINESS', label: 'Event' },
  { key: 'trucks',      env: 'NOTION_DB_FOOD_TRUCKS',         token: 'NOTION_TOKEN_BUSINESS', label: 'Food truck' },
  { key: 'stays',       env: 'NOTION_DB_STAYS',               token: 'NOTION_TOKEN_BUSINESS', label: 'Place to stay' },
  { key: 'wines',       env: 'NOTION_DB_WINES',               token: 'NOTION_TOKEN_BUSINESS', label: 'Winery' },
  { key: 'articles',    env: 'NOTION_DB_DISPATCH_ARTICLES',   token: 'NOTION_TOKEN_DISPATCH', label: 'Article' },
  { key: 'pois',        env: 'NOTION_DB_POIS',                token: 'NOTION_TOKEN_BUSINESS', label: 'Point of interest' },
];

// Property names that never enter the corpus. Matched case-insensitively as
// substrings, so "Stripe Account ID" and "Verification Code" both go.
const PRIVATE_PATTERNS = [
  'stripe', 'token', 'secret', 'verification', 'code', 'password',
  'private', 'internal', 'admin', 'claim', 'id', 'lat', 'lng',
  'color', 'url', 'photo', 'logo', 'gallery', 'expires', 'posted',
  'reminder', 'demo', 'hidden', 'beta', 'locked', 'qa',
];

// Fields worth leading with when present. Everything else still gets included,
// just after these, so the most identifying text sits early in the passage.
const PRIORITY_FIELDS = ['name', 'title', 'also known as', 'tagline', 'description', 'hours', 'address', 'category'];

const isPrivate = (name) => {
  const n = name.toLowerCase();
  return PRIVATE_PATTERNS.some((p) => n.includes(p));
};

// ── Notion ──────────────────────────────────────────────────

async function queryDatabase(dbId, token) {
  const results = [];
  let cursor;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(cursor ? { page_size: 100, start_cursor: cursor } : { page_size: 100 }),
    });
    if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    results.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

// Pull readable text out of any Notion property, whatever its type.
function propToText(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':
    case 'rich_text':
      return (prop[prop.type] || []).map((t) => t.plain_text).join('').trim();
    case 'select':
      return prop.select?.name || '';
    case 'multi_select':
      return (prop.multi_select || []).map((o) => o.name).join(', ');
    case 'status':
      return prop.status?.name || '';
    case 'number':
      return prop.number == null ? '' : String(prop.number);
    case 'phone_number':
      return prop.phone_number || '';
    case 'email':
      return prop.email || '';
    case 'date':
      return prop.date?.start || '';
    case 'checkbox':
      return prop.checkbox ? 'yes' : '';
    default:
      return '';
  }
}

// ── Passage building ────────────────────────────────────────

function pageToPassage(page, source) {
  const props = page.properties || {};
  const entries = [];
  let title = '';

  for (const [name, prop] of Object.entries(props)) {
    if (prop?.type === 'title') {
      title = propToText(prop);
      continue;
    }
    if (isPrivate(name)) continue;
    const value = propToText(prop);
    if (!value) continue;
    entries.push([name, value]);
  }

  entries.sort((a, b) => {
    const ai = PRIORITY_FIELDS.indexOf(a[0].toLowerCase());
    const bi = PRIORITY_FIELDS.indexOf(b[0].toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  if (!title && !entries.length) return null;

  // The label ("Local business") gives the model a hint about what kind of
  // thing this is, which measurably improves matching on questions like
  // "where can I stay" versus "what is on this weekend".
  const body = entries.map(([k, v]) => `${k}: ${v}`).join('. ');
  const text = `${source.label}: ${title}. ${body}`.slice(0, 2000);

  const aka = entries.find(([k]) => k.toLowerCase() === 'also known as')?.[1] || '';

  return {
    id: page.id,
    source: source.key,
    title: title || '(untitled)',
    aka,
    text,
    url: page.url || '',
  };
}

// ── Storage ─────────────────────────────────────────────────
// Vectors are packed base64 rather than stored as JSON arrays. A 256-float
// array as JSON is roughly 3KB of text; packed it is 1KB of binary. Across a
// shard that is the difference between comfortably under the request limit and
// awkwardly near it.

const shardKey = (key) => `mbcorpus:${key}`;
const metaKey = 'mbcorpus:meta';

function packVectors(vectors) {
  const flat = new Float32Array(vectors.length * DIMS);
  vectors.forEach((v, i) => flat.set(v, i * DIMS));
  return Buffer.from(flat.buffer).toString('base64');
}

function unpackVectors(b64, count) {
  const buf = Buffer.from(b64, 'base64');
  const flat = new Float32Array(buf.buffer, buf.byteOffset, count * DIMS);
  const out = [];
  for (let i = 0; i < count; i++) out.push(flat.subarray(i * DIMS, (i + 1) * DIMS));
  return out;
}

export async function writeShard(sourceKey, passages, vectors) {
  if (!kv || !passages.length) return false;
  const payload = {
    n: passages.length,
    passages: passages.map(({ id, source, title, aka, text, url }) => ({ id, source, title, aka, text, url })),
    vectors: packVectors(vectors),
    at: new Date().toISOString(),
  };
  await kv.set(shardKey(sourceKey), payload);
  return true;
}

async function readShard(sourceKey) {
  if (!kv) return null;
  try {
    const raw = await kv.get(shardKey(sourceKey));
    if (!raw?.passages?.length || !raw?.vectors) return null;
    return { passages: raw.passages, vectors: unpackVectors(raw.vectors, raw.n), at: raw.at };
  } catch {
    return null;
  }
}

// Warm-lambda cache. Shards change once a day at most, so re-reading them from
// Redis on every question is wasted latency.
const shardCache = new Map();
const SHARD_TTL_MS = 5 * 60 * 1000;

async function getShard(sourceKey, now) {
  const hit = shardCache.get(sourceKey);
  if (hit && now - hit.cachedAt < SHARD_TTL_MS) return hit.data;
  const data = await readShard(sourceKey);
  shardCache.set(sourceKey, { data, cachedAt: now });
  return data;
}

// ── Indexing ────────────────────────────────────────────────

export async function indexSource(source) {
  const dbId = process.env[source.env];
  const token = process.env[source.token];
  if (!dbId || !token) return { source: source.key, skipped: 'missing env' };

  const pages = await queryDatabase(dbId, token);
  const passages = pages.map((p) => pageToPassage(p, source)).filter(Boolean);
  if (!passages.length) return { source: source.key, indexed: 0 };

  const vectors = await embedDocuments(passages.map((p) => p.text));
  // embedDocuments returns null if ANY batch failed, so we never half-write a
  // shard and leave the corpus quietly incomplete.
  if (!vectors) return { source: source.key, error: 'embedding failed' };

  await writeShard(source.key, passages, vectors);
  return { source: source.key, indexed: passages.length };
}

export async function indexAll() {
  const results = [];
  for (const source of SOURCES) {
    try {
      results.push(await indexSource(source));
    } catch (err) {
      results.push({ source: source.key, error: err.message.slice(0, 160) });
    }
  }
  const total = results.reduce((n, r) => n + (r.indexed || 0), 0);
  if (kv) {
    try {
      await kv.set(metaKey, { at: new Date().toISOString(), total, results });
    } catch {
      /* meta is nice to have, not required */
    }
  }
  return { total, results };
}

export async function readMeta() {
  if (!kv) return null;
  try {
    return await kv.get(metaKey);
  } catch {
    return null;
  }
}

// ── Search ──────────────────────────────────────────────────

// Below this, a "match" is really just the closest thing in a corpus that has
// no answer. Returning nothing is better than returning a confident wrong page,
// which is the main way these systems embarrass you.
const MIN_SCORE = 0.45;

export async function search(question, { limit = 5, sources = null } = {}) {
  if (!kv) return { ok: false, reason: 'no store', results: [] };

  const qVec = await embedQuery(question);
  if (!qVec) return { ok: false, reason: 'embedding unavailable', results: [] };

  const now = Date.now();
  const wanted = sources?.length ? SOURCES.filter((s) => sources.includes(s.key)) : SOURCES;
  const shards = await Promise.all(wanted.map((s) => getShard(s.key, now)));

  const scored = [];
  shards.forEach((shard) => {
    if (!shard) return;
    shard.passages.forEach((p, i) => {
      const score = similarity(qVec, shard.vectors[i]);
      if (score >= MIN_SCORE) scored.push({ ...p, score });
    });
  });

  scored.sort((a, b) => b.score - a.score);
  return { ok: true, results: scored.slice(0, limit) };
}
