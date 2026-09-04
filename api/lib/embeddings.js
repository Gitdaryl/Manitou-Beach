// ============================================================
// Embeddings (Google Gemini)
// ------------------------------------------------------------
// Turns text into a vector: a list of numbers describing where that text sits
// on a "map of meaning". Two passages about late-night food land near each
// other even when they share no words, which is the whole point. Keyword search
// matches letters; this matches meaning.
//
// Model:  text-embedding-004
// Dims:   256 (not the default 768)
//
// Why 256. These models are Matryoshka-trained, so a truncated vector is still
// a usable vector, just slightly less precise. At our corpus size the retrieval
// quality difference is not observable, and it makes the stored index a third
// of the size. That matters because the whole shard gets pulled out of Redis on
// a cold query, and request size is the real constraint here, not accuracy.
//
// FAIL OPEN, ALWAYS. Every function returns null rather than throwing. If
// Gemini is down, out of quota, or the key is missing, retrieval degrades to
// "no extra context" and the concierge falls back to its static knowledge base.
// A degraded answer beats a broken agent. Same rule as the rest of the platform.
// ============================================================

import { Redis } from '@upstash/redis';

// text-embedding-004 was retired by Google. From 2026-08-29 to 2026-09-04 every
// call returned 404 "not found for API version v1beta", the daily reindex wrote
// zero passages, and nothing said so. gemini-embedding-001 is the replacement and
// is also Matryoshka-trained, so the 256-dim truncation below still holds.
// Verified against the live manitou-retrieval key before switching.
const MODEL = 'gemini-embedding-001';
const DIMS = 256;
const BATCH_LIMIT = 100; // Gemini's cap per batchEmbedContents call
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_REST_URL;
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_REST_TOKEN;
const kv = REST_URL && REST_TOKEN ? new Redis({ url: REST_URL, token: REST_TOKEN }) : null;

export const EMBEDDINGS_READY = !!process.env.GEMINI_API_KEY;
export { DIMS, MODEL };

// ── Cost tracking ───────────────────────────────────────────
// The project is on Tier 1 postpay, so there is no free-tier cliff to fall off,
// but an unattended indexer that silently loops is a real way to spend money.
// One counter per UTC day, read by /api/health.

const usageKey = (day) => `mbembed:usage:${day}`;
const today = () => new Date().toISOString().slice(0, 10);

function recordUsage(count) {
  if (!kv || !count) return;
  try {
    const p = kv.incrby(usageKey(today()), count);
    if (p?.catch) p.catch(() => {});
    // 60 days of history is enough to spot a trend, and it expires itself.
    const e = kv.expire(usageKey(today()), 60 * 60 * 24 * 60);
    if (e?.catch) e.catch(() => {});
  } catch {
    /* never let telemetry break the caller */
  }
}

export async function readUsage(days = 7) {
  if (!kv) return {};
  try {
    const keys = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      keys.push(d);
    }
    const values = await kv.mget(...keys.map(usageKey));
    return keys.reduce((acc, d, i) => {
      acc[d] = Number(values?.[i] ?? 0) || 0;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

// ── Embedding calls ─────────────────────────────────────────

async function callGemini(texts, taskType) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !texts.length) return null;

  const requests = texts.map((text) => ({
    model: `models/${MODEL}`,
    content: { parts: [{ text }] },
    taskType,
    outputDimensionality: DIMS,
  }));

  const res = await fetch(`${ENDPOINT}:batchEmbedContents?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    // 429 here means rate limited, 400 usually means a malformed chunk.
    console.error(`[embeddings] ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return null;
  }

  const data = await res.json();
  const out = data?.embeddings?.map((e) => e?.values).filter(Boolean);
  if (!out || out.length !== texts.length) {
    console.error('[embeddings] response length mismatch');
    return null;
  }
  recordUsage(texts.length);
  return out.map(normalize);
}

// Vectors are stored pre-normalised so that similarity is a plain dot product
// at query time. Saves recomputing magnitudes across the whole corpus on every
// question, which is the hot path.
function normalize(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const mag = Math.sqrt(sum) || 1;
  return vec.map((v) => v / mag);
}

// Embed many passages for storage. Chunks into batches automatically.
// Returns null if ANY batch fails, so a partial index is never written.
export async function embedDocuments(texts) {
  if (!EMBEDDINGS_READY || !texts?.length) return null;
  const out = [];
  for (let i = 0; i < texts.length; i += BATCH_LIMIT) {
    const batch = texts.slice(i, i + BATCH_LIMIT);
    let vectors = null;
    try {
      vectors = await callGemini(batch, 'RETRIEVAL_DOCUMENT');
    } catch (err) {
      console.error('[embeddings] batch threw:', err.message);
    }
    if (!vectors) return null;
    out.push(...vectors);
  }
  return out;
}

// ── Query embedding, with cache ─────────────────────────────
// "What is on tonight" gets asked over and over. Same words, same pin, so there
// is no reason to pay for it twice. Cheap hash, one hour TTL.

function hashText(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const QUERY_CACHE_TTL = 3600;

export async function embedQuery(text) {
  if (!EMBEDDINGS_READY || !text?.trim()) return null;
  const clean = text.trim().slice(0, 2000);
  const cacheKey = `mbembed:q:${hashText(clean.toLowerCase())}`;

  if (kv) {
    try {
      const hit = await kv.get(cacheKey);
      if (Array.isArray(hit) && hit.length === DIMS) return hit;
    } catch {
      /* cache miss is not an error */
    }
  }

  let vectors = null;
  try {
    // RETRIEVAL_QUERY, not RETRIEVAL_DOCUMENT. The model places questions and
    // answers differently on purpose, so that a question lands near the passage
    // that answers it rather than near other questions.
    vectors = await callGemini([clean], 'RETRIEVAL_QUERY');
  } catch (err) {
    console.error('[embeddings] query threw:', err.message);
  }
  if (!vectors) return null;

  if (kv) {
    try {
      const p = kv.set(cacheKey, vectors[0], { ex: QUERY_CACHE_TTL });
      if (p?.catch) p.catch(() => {});
    } catch {
      /* ignore */
    }
  }
  return vectors[0];
}

// Similarity between two pre-normalised vectors. Plain dot product, range -1..1,
// where 1 is identical meaning.
export function similarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}
