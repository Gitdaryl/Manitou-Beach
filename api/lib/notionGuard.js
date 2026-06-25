import { sendSMSFull } from './twilio.js';

// Fire a throttled SMS alert when a Notion-backed feed fails to load, so a blanked or invalid
// NOTION_TOKEN_* surfaces loudly instead of silently emptying a public page.
// (Born from the events-feed incident where a wiped token made /events look like "no events".)
// Per-feed 30-min cooldown. Best-effort: never throws, never blocks the response.
const lastAlertAt = {};
const COOLDOWN_MS = 30 * 60 * 1000;

export async function alertOutage(feed, detail = '') {
  try {
    const now = Date.now();
    if (now - (lastAlertAt[feed] || 0) < COOLDOWN_MS) return;
    lastAlertAt[feed] = now;
    const to = process.env.ADMIN_PHONE;
    if (!to) return;
    const tail = detail ? ` (${String(detail).slice(0, 120)})` : '';
    await sendSMSFull(
      to,
      `⚠️ Manitou Beach: the "${feed}" feed is DOWN${tail}. That section is empty on the site until fixed — check the matching NOTION_TOKEN_* in Vercel.`
    );
  } catch (_) { /* alerting must never break the response */ }
}
