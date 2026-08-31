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
import { getAutoPinEntry, etParts } from './lib/autoPinSchedule.js';
import {
  consentMode, shouldAsk, askSentProperties, answeredToday,
  PIN_CONSENT, ASK_FATIGUE_LIMIT,
} from './lib/pinConsent.js';

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

    const now = new Date();
    let sent = 0;
    let skipped = 0;
    let asked = 0;
    const fatigued = [];
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

      // Trucks on the standing auto-pin schedule (api/lib/autoPinSchedule.js) don't need
      // the "remember to check in" nudge - theirs drops itself. They get a heads-up
      // instead, so a day off is one tap away rather than a surprise.
      const auto = getAutoPinEntry(slug);
      const autoToday = auto && auto.days.includes(etParts().weekday) &&
        (!auto.until || etParts().dateStr <= auto.until);

      const mode = consentMode(p);

      // Three shapes of message, and which one you get is the vendor's own choice:
      //
      //   asking      - on the standing schedule, wants to be asked. Silence means no,
      //                 so this text is the only thing standing between them and an
      //                 empty map. It leads with the question, not with a tip.
      //   automatic   - chose to be published without being asked. Heads-up only.
      //   nudge       - not on a standing schedule. The old "you out today?" prompt.
      const asking = autoToday && mode === PIN_CONSENT.ASK;

      // "Leave it to me" means no texts either, standing schedule or not. A weekly nudge
      // to someone who asked to be left alone is the opposite of the setting.
      if (mode === PIN_CONSENT.MANUAL) { skipped++; continue; }
      if (asking && !shouldAsk(p, now)) {
        // Either they already answered today, or they've ignored ASK_FATIGUE_LIMIT
        // weekends running and we've stopped asking. Silence is not a reason to nag.
        const strikes = p['Unanswered Asks']?.number ?? 0;
        if (!answeredToday(p, now) && strikes === ASK_FATIGUE_LIMIT) {
          // Exactly at the limit means this is the first weekend we've gone quiet, so
          // alert once and push the counter past it. Otherwise Daryl gets the same text
          // every Saturday until someone fixes it, which is its own kind of nag.
          fatigued.push(name);
          await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({ properties: { 'Unanswered Asks': { number: strikes + 1 } } }),
          }).catch(err => console.error('Truck reminder: fatigue patch failed:', err.message));
        }
        skipped++;
        continue;
      }

      const msg = asking
        ? `Good morning from Manitou Beach!\n\nHeading out today, ${name}? Reply Y and at ${auto.startET} we'll put you on the map and post you to Facebook.\n\nReply N, or just ignore this, and we'll do nothing - you'll stay off the map until you say so.\n\nRather set your own spot? ${link}\n\nReply STOP to opt out.`
        : autoToday
        ? `Good morning from Manitou Beach!\n\nHeads up ${name}: your pin drops automatically at ${auto.startET} today and you'll be posted to Facebook.\n\nNot heading out, or sold out early? Tap here any time to pull the pin down or change your spot:\n${link}\n\nTip: open that link once and add it to your home screen - then it's an icon on your phone, one tap.\n\nReply STOP to opt out.`
        : `Good morning from Manitou Beach!\n\nOpen for business today, ${name}? Drop your pin so folks at the lake can find you, and we'll post you to Facebook automatically:\n${link}\n\nTip: open that link once and add it to your home screen - then it's an icon on your phone, one tap, no digging for this text.\n\nReply STOP to opt out.`;

      const ok = await sendSMSFull(`+1${digits}`, msg);
      if (!ok) { skipped++; continue; }
      sent++;
      asked += asking ? 1 : 0;

      // Count the ask so an unanswered run eventually stops. Answering resets it.
      if (asking) {
        await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({ properties: askSentProperties(p) }),
        }).catch(err => console.error('Truck reminder: ask counter patch failed:', err.message));
      }
    }

    // A truck that has ignored three weekends running has drifted, and another text
    // won't fix that. Tell Daryl once so a person can pick up the phone.
    if (fatigued.length && process.env.ADMIN_PHONE) {
      await sendSMSFull(
        process.env.ADMIN_PHONE,
        `Manitou Beach: we've stopped asking ${fatigued.join(', ')} about the pin - ${ASK_FATIGUE_LIMIT} weekends with no reply. Worth a call.`
      );
    }

    console.log(`Truck reminder: sent ${sent} (asks ${asked}), skipped ${skipped}, fatigued ${fatigued.length}, total ${results.length}`);
    return res.status(200).json({ ok: true, sent, asked, skipped, fatigued, total: results.length });
  } catch (err) {
    console.error('Truck reminder error:', err.message);
    return res.status(500).json({ error: 'server', detail: err.message });
  }
}
