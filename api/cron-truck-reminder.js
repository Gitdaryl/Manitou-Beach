// /api/cron-truck-reminder.js
// Peak-season nudge. On weekend mornings (May-Sep), text every Active food truck a
// one-tap link to drop their location pin. Dropping a pin fires the finder map AND the
// auto-post to Facebook/Instagram (see food-trucks.js). The reactive "send me my link"
// path already existed; this is the proactive trigger that was missing — the thing that
// turns "I should update my location" from a thought that never occurs into a tap.
//
// Scheduled Sat/Sun 10am ET in vercel.json. Vercel cron can't express "months", so the
// May-Sep gate lives here.

import { requireCron } from './lib/cronAuth.js';
import { sendSMSFull, normalizePhone } from './lib/twilio.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (!requireCron(req, res)) return;

  // Peak season = May (5) through September (9), Michigan time.
  const monthET = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Detroit', month: 'numeric' }).format(new Date())
  );
  if (monthET < 5 || monthET > 9) {
    return res.status(200).json({ ok: true, skipped: 'off-season', month: monthET });
  }

  const token = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_FOOD_TRUCKS;
  if (!token || !dbId) {
    console.error('Truck reminder: missing NOTION_TOKEN_BUSINESS or NOTION_DB_FOOD_TRUCKS');
    return res.status(500).json({ error: 'config' });
  }

  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    // Fetch all Active trucks (paginated)
    let results = [];
    let cursor;
    do {
      const body = {
        filter: { property: 'Status', select: { equals: 'Active' } },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        console.error('Truck reminder query failed:', await r.text());
        return res.status(500).json({ error: 'query' });
      }
      const data = await r.json();
      results = results.concat(data.results);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    let sent = 0;
    let skipped = 0;
    for (const page of results) {
      const p = page.properties;
      const phoneRaw = p['Phone']?.phone_number || '';
      const slug = p['Slug']?.rich_text?.[0]?.text?.content || '';
      const tok = p['Checkin Token']?.rich_text?.[0]?.text?.content || '';
      const name = p['Name']?.title?.[0]?.text?.content || 'your truck';
      // Optional per-truck opt-out. Harmless if the column doesn't exist (reads as undefined).
      const optOut = p['SMS Opt Out']?.checkbox || false;

      if (!phoneRaw || !slug || !tok || optOut) { skipped++; continue; }
      const digits = normalizePhone(phoneRaw);
      if (!digits || digits.length < 10) { skipped++; continue; }

      // ref=reminder tags visits/check-ins that came from the nudge, so attribution
      // (coupon codes, "your pin got N looks") can slot in later without a rebuild.
      const link = `${siteUrl}/food-trucks?truck=${encodeURIComponent(slug)}&token=${encodeURIComponent(tok)}&ref=reminder`;
      const msg = `Good morning from Manitou Beach!\n\nOpen for business today, ${name}? Drop your pin so folks at the lake can find you, and we'll post you to Facebook automatically:\n${link}\n\nReply STOP to opt out.`;

      const ok = await sendSMSFull(`+1${digits}`, msg);
      if (ok) sent++; else skipped++;
    }

    console.log(`Truck reminder: sent ${sent}, skipped ${skipped}, total ${results.length}`);
    return res.status(200).json({ ok: true, sent, skipped, total: results.length });
  } catch (err) {
    console.error('Truck reminder error:', err.message);
    return res.status(500).json({ error: 'server', detail: err.message });
  }
}
