// /api/cron-truck-autopin.js
// Drops the location pin for trucks that keep the same standing weekend spot but keep
// forgetting to tap their check-in link (see api/lib/autoPinSchedule.js for the roster).
//
// It does NOT reimplement check-in - it posts to /api/food-trucks with the truck's own
// Checkin Token, so the pin, the Departure Time auto-expiry and the Facebook/Instagram
// announcement all fire exactly as if the vendor had tapped the link themselves.
//
// Scheduling: Vercel cron is UTC, so vercel.json fires this twice on Sat/Sun - once at
// the EDT-correct hour and once at the EST-correct hour. The ET window gate below lets
// exactly one of those through, which keeps 12:30 meaning 12:30 across a DST flip.
// The "already checked in recently" guard means a vendor who checked in (or sold out and
// checked out) on their own is never stomped on.

import { requireCronOrAdmin, isAdminAuthorized } from './lib/cronAuth.js';
import { sendSMSFull, normalizePhone } from './lib/twilio.js';
import { AUTO_PIN_SCHEDULE, etParts, etTimeToISO, parseHHMM } from './lib/autoPinSchedule.js';

export const config = { maxDuration: 60 };

// How far past startET the cron may still drop the pin. Wide enough to survive a late
// cron tick, narrow enough that it can't undo an early "sold out" checkout.
const WINDOW_BEFORE_MIN = 10;
const WINDOW_AFTER_MIN = 45;

// If the truck checked in this recently, a human already handled today - leave it alone.
const RECENT_CHECKIN_MS = 8 * 60 * 60 * 1000;

async function findTruck(slug) {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Slug', rich_text: { equals: slug } },
            { property: 'Status', select: { equals: 'Active' } },
          ],
        },
        page_size: 1,
      }),
    }
  );
  if (!res.ok) throw new Error(`Notion lookup ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.results?.[0] || null;
}

export default async function handler(req, res) {
  if (!requireCronOrAdmin(req, res)) return;

  // Admin-only escape hatches for testing from the terminal:
  //   ?force=1  ignore the time-of-day / weekday gate
  //   ?dryRun=1 report what it would do, change nothing
  const admin = isAdminAuthorized(req);
  const force = admin && (req.query?.force === '1' || req.query?.force === 'true');
  const dryRun = admin && (req.query?.dryRun === '1' || req.query?.dryRun === 'true');

  if (!process.env.NOTION_TOKEN_BUSINESS || !process.env.NOTION_DB_FOOD_TRUCKS) {
    console.error('Auto-pin: missing NOTION_TOKEN_BUSINESS or NOTION_DB_FOOD_TRUCKS');
    return res.status(500).json({ error: 'config' });
  }

  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const now = new Date();
  const et = etParts(now);
  const report = [];

  for (const entry of AUTO_PIN_SCHEDULE) {
    const tag = entry.slug;
    try {
      if (!entry.enabled) { report.push({ tag, skipped: 'disabled' }); continue; }
      if (entry.until && et.dateStr > entry.until) { report.push({ tag, skipped: 'past-until' }); continue; }

      if (!force) {
        if (!entry.days.includes(et.weekday)) { report.push({ tag, skipped: 'wrong-day', weekday: et.weekday }); continue; }
        const startMin = parseHHMM(entry.startET);
        const delta = et.minutesOfDay - startMin;
        if (delta < -WINDOW_BEFORE_MIN || delta > WINDOW_AFTER_MIN) {
          report.push({ tag, skipped: 'outside-window', etNow: `${String(et.hour).padStart(2, '0')}:${String(et.minute).padStart(2, '0')}` });
          continue;
        }
      }

      const page = await findTruck(entry.slug);
      if (!page) { report.push({ tag, skipped: 'truck-not-found-or-inactive' }); continue; }

      const props = page.properties;
      const token = props['Checkin Token']?.rich_text?.[0]?.text?.content || '';
      const name = props['Name']?.title?.[0]?.text?.content || entry.slug;
      if (!token) { report.push({ tag, skipped: 'no-checkin-token' }); continue; }

      const last = props['Last Checkin']?.date?.start;
      if (last && now.getTime() - new Date(last).getTime() < RECENT_CHECKIN_MS) {
        report.push({ tag, skipped: 'already-checked-in', lastCheckin: last });
        continue;
      }

      const departureTime = etTimeToISO(entry.endET, now);

      if (dryRun) {
        report.push({ tag, dryRun: true, wouldPin: { lat: entry.lat, lng: entry.lng, note: entry.note, departureTime } });
        continue;
      }

      // Same payload the vendor's own check-in form sends.
      const postRes = await fetch(`${siteUrl}/api/food-trucks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: entry.slug,
          token,
          lat: entry.lat,
          lng: entry.lng,
          note: entry.note,
          todaysSpecial: entry.todaysSpecial || '',
          departureTime,
        }),
      });
      const postBody = await postRes.json().catch(() => ({}));
      if (!postRes.ok || !postBody.ok) {
        console.error(`Auto-pin check-in failed for ${entry.slug}:`, postRes.status, JSON.stringify(postBody).slice(0, 200));
        report.push({ tag, error: `checkin-${postRes.status}` });
        continue;
      }

      // The check-in endpoint fires the Facebook/Instagram announcement on the first
      // check-in of the day and reports what happened. A pin nobody hears about is half
      // the feature, so an announcement that didn't post is an alert, not a silent log.
      const social = postBody.social || {};
      report.push({ tag, pinned: true, departureTime, social });
      console.log(`Auto-pin: dropped pin for ${name} until ${departureTime}; social=${JSON.stringify(social)}`);

      if (social.facebook !== 'posted') {
        console.error(`Auto-pin: Facebook announcement did not post for ${name}: ${social.facebook}`);
        const adminPhone = process.env.ADMIN_PHONE;
        if (adminPhone) {
          await sendSMSFull(
            adminPhone,
            `⚠️ Manitou Beach: auto-pin dropped for ${name} but the Facebook post didn't go out (${social.facebook}). Instagram: ${social.instagram}. Check META_PAGE_ACCESS_TOKEN in Vercel.`
          );
        }
      }

      // Tell the vendor it happened, and hand them the one tap that pulls it down early.
      if (entry.notify) {
        const digits = normalizePhone(props['Phone']?.phone_number || '');
        if (digits && digits.length >= 10) {
          const link = `${siteUrl}/food-trucks?truck=${encodeURIComponent(entry.slug)}&token=${encodeURIComponent(token)}&ref=autopin`;
          const endLabel = new Date(departureTime).toLocaleTimeString('en-US', {
            timeZone: 'America/Detroit', hour: 'numeric', minute: '2-digit',
          });
          await sendSMSFull(
            `+1${digits}`,
            `Manitou Beach: your pin just dropped automatically for ${name} - folks at the lake can see you now, and you're posted to Facebook.\n\nShowing until ${endLabel}. Sold out early or not out today? Tap here to pull the pin or update your spot:\n${link}\n\nReply STOP to opt out.`
          );
        }
      }
    } catch (err) {
      console.error(`Auto-pin error for ${tag}:`, err.message);
      report.push({ tag, error: err.message });
    }
  }

  return res.status(200).json({ ok: true, etNow: `${et.dateStr} ${String(et.hour).padStart(2, '0')}:${String(et.minute).padStart(2, '0')} ET`, force, dryRun, report });
}
