// ============================================================
// GET /api/retrieve?q=...
// ------------------------------------------------------------
// Semantic search over the community corpus. Given a question, returns the
// handful of passages closest to it in meaning.
//
// Consumers:
//   - the ElevenLabs voice concierge, as a webhook tool, so it can answer from
//     live records instead of a hand-written knowledge base
//   - site search, later
//   - the newsletter and article agents, later
//
// Everything it returns is already public on the site. No personal data enters
// the corpus in the first place (see the exclusions in corpus.js), so this can
// be open without a token.
//
// Returns 200 with an empty result set rather than an error when retrieval is
// unavailable. A voice agent mid-conversation should get "no extra context"
// and fall back to its static brief, never an exception.
// ============================================================

import { search, readMeta, CORPUS_READY } from './lib/corpus.js';
import { EMBEDDINGS_READY, readUsage } from './lib/embeddings.js';

const MAX_Q = 400;
const MAX_LIMIT = 8;

// A corpus that has not rebuilt in this long means the nightly agent is not
// running. Retrieval keeps working off stale pins, which is the failure mode
// that looks fine and quietly gets worse.
const STALE_AFTER_HOURS = 36;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Query embeddings are cached for an hour, so repeated questions are cheap,
  // but the edge should not hold an answer longer than the corpus lives.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  const body = req.method === 'POST' ? req.body || {} : {};
  const raw = (req.query?.q ?? body.q ?? body.query ?? '').toString();
  const question = raw.trim().slice(0, MAX_Q);

  // No question means "tell me about yourself". Doubles as the status probe
  // for the retrieval layer, so it can be watched without a second endpoint
  // and without touching the intake health check.
  if (!question) {
    const meta = await readMeta();
    const indexedAt = meta?.at || null;
    const ageHours = indexedAt ? (Date.now() - Date.parse(indexedAt)) / 3600000 : null;
    return res.status(200).json({
      ok: true,
      status: {
        embeddings: EMBEDDINGS_READY,
        store: CORPUS_READY,
        indexedAt,
        ageHours: ageHours == null ? null : Math.round(ageHours * 10) / 10,
        stale: ageHours == null ? true : ageHours > STALE_AFTER_HOURS,
        passages: meta?.total ?? 0,
        sources: meta?.results ?? [],
        embedCallsByDay: await readUsage(7),
      },
      results: [],
      note: 'pass ?q= to search',
    });
  }

  const limit = Math.min(Number(req.query?.limit ?? body.limit ?? 5) || 5, MAX_LIMIT);
  const sources = (req.query?.sources ?? body.sources ?? '')
    .toString()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let found = { ok: false, results: [] };
  try {
    found = await search(question, { limit, sources: sources.length ? sources : null });
  } catch (err) {
    console.error('[retrieve]', err.message);
  }

  return res.status(200).json({
    ok: true,
    question,
    available: found.ok === true,
    count: found.results.length,
    results: found.results.map((r) => ({
      title: r.title,
      source: r.source,
      text: r.text,
      url: r.url,
      alsoKnownAs: r.aka || undefined,
      score: Math.round(r.score * 1000) / 1000,
    })),
  });
}
