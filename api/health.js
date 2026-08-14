// GET /api/health
// Self-check for the intake paths. Answers "is anything a visitor submits
// actually going to land somewhere?" without exposing any secret values.
//
// Build standard: every intake endpoint ships one of these, so a silent
// misconfiguration shows up here instead of in a lost submission.

import { KV_READY as PHOTOS_KV } from './lib/photos.js';
import { KV_READY as CARIDS_KV, countCarIds } from './lib/carIds.js';

export default async function handler(req, res) {
  const checks = {
    photoStore: PHOTOS_KV,
    carIdStore: CARIDS_KV,
    blobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    notifyHook: !!(process.env.N8N_FLAG_WEBHOOK) || 'default',
    adminKey: !!(process.env.ADMIN_KEY || process.env.YETI_ADMIN_KEY),
  };

  // Prove the car-id store actually answers, not just that env vars exist.
  let autoShowIds = null;
  if (CARIDS_KV) {
    try {
      autoShowIds = await countCarIds('auto-show-2026');
    } catch (err) {
      checks.carIdStore = `error: ${err.message}`;
    }
  }

  const ok = checks.photoStore === true && checks.carIdStore === true;
  res.setHeader('cache-control', 'no-store');
  return res.status(ok ? 200 : 503).json({
    ok,
    checks,
    autoShowIdentifications: autoShowIds,
    ts: new Date().toISOString(),
  });
}
