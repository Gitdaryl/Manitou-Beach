// Shared authentication for scheduled (cron) endpoints.
//
// Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>` to each
// scheduled invocation when the CRON_SECRET env var is set. These helpers verify
// that header and FAIL CLOSED: if CRON_SECRET is unset, every request is rejected
// (so a missing env var can never silently expose a job to the public internet).
//
// Two variants:
//   requireCron(req, res)         → cron-only endpoints
//   requireCronOrAdmin(req, res)  → endpoints also triggered manually from the
//                                   admin UI, which sends `X-Admin-Token: <ADMIN_SECRET>`
//
// Both return `true` when authorized. When unauthorized they write a 401 and
// return `false`, so callers should do:  if (!requireCron(req, res)) return;

function timingSafeEqual(a, b) {
  // Constant-ish comparison without pulling in crypto for a short token.
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function isCronAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed
  const header = req.headers?.authorization || '';
  const expected = `Bearer ${secret}`;
  return timingSafeEqual(header, expected);
}

export function isAdminAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false; // fail closed
  const token = req.headers?.['x-admin-token'] || '';
  return timingSafeEqual(token, secret);
}

export function requireCron(req, res) {
  if (isCronAuthorized(req)) return true;
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

export function requireCronOrAdmin(req, res) {
  if (isCronAuthorized(req) || isAdminAuthorized(req)) return true;
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}
