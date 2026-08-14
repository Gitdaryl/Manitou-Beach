// ============================================================
// /api/cron-reindex
// ------------------------------------------------------------
// Rebuilds the retrieval corpus from Notion. Agent nineteen.
//
// Schedule: nightly, before the morning jobs that might want fresh context.
//
// Full rebuild rather than incremental diffing. At this corpus size a rebuild
// is a few thousand embeddings, which is cheap and finishes in well under the
// function timeout. Incremental indexing means tracking deletions and edit
// timestamps across seven databases, which is a class of bug that shows up as
// "the concierge still mentions a business that closed" months later. Not worth
// the complexity until the corpus is an order of magnitude bigger.
//
// Also triggerable by hand with X-Admin-Token, which is how you refresh after
// filling in a batch of "Also Known As" values without waiting for tonight.
// ============================================================

import { requireCronOrAdmin } from './lib/cronAuth.js';
import { indexAll } from './lib/corpus.js';
import { EMBEDDINGS_READY } from './lib/embeddings.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  if (!requireCronOrAdmin(req, res)) return;

  if (!EMBEDDINGS_READY) {
    // Loud, because a missing key means the corpus silently stops updating
    // while every other part of the system keeps reporting healthy.
    console.error('[cron-reindex] GEMINI_API_KEY missing, corpus not rebuilt');
    return res.status(200).json({ ok: false, error: 'GEMINI_API_KEY not configured' });
  }

  const started = Date.now();
  try {
    const { total, results } = await indexAll();
    const seconds = Math.round((Date.now() - started) / 100) / 10;
    console.log(`[cron-reindex] ${total} passages in ${seconds}s`, JSON.stringify(results));
    return res.status(200).json({ ok: true, total, seconds, results });
  } catch (err) {
    console.error('[cron-reindex] failed:', err.message);
    return res.status(200).json({ ok: false, error: err.message.slice(0, 300) });
  }
}
