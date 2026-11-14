// /api/cron-puzzle-watch.js
// The daily look at the puzzle page numbers, so nobody has to remember to check them.
//
// Every morning it adds up the last two weeks of finished days and asks three questions:
//   1. Are enough people playing, and coming back, to sell a sponsor?
//   2. Is one of the puzzles losing most of the people who start it?
//   3. Do people who fail to finish come back less than people who finish?
// If an answer is yes it tells Daryl once, by email and text, then stays quiet about that
// one for a while (quietDays in api/lib/puzzleStats.js) so it never nags daily.
// Most mornings it says nothing at all. That is the normal case.
//
// The thresholds are in FLAG_RULES in api/lib/puzzleStats.js.
// Try it without sending anything: GET /api/cron-puzzle-watch?dry=1 with the admin token.

import { requireCronOrAdmin } from './lib/cronAuth.js';
import { sendSMSFull } from './lib/twilio.js';
import { Resend } from 'resend';
import { put, list } from '@vercel/blob';
import { detroitDate, addDays, loadPuzzleEvents, summarize, evaluateFlags, FLAG_RULES, GAME_NAMES, PUZZLE_GAMES } from './lib/puzzleStats.js';

export const config = { maxDuration: 60 };

const FLAG_PREFIX = 'puzzle-flags';
const blobOpts = { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true };

// When was this flag last successfully sent? Read from pathnames, never from blob content.
async function lastSent(id) {
  const { blobs } = await list({ prefix: `${FLAG_PREFIX}/${id}/sent/`, token: process.env.BLOB_READ_WRITE_TOKEN });
  const dates = blobs.map(b => (b.pathname.split('/').pop() || '').replace('.json', '')).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  return dates.pop() || null;
}

function emailHtml(flag, s) {
  const row = (label, value) => `<tr><td style="padding:6px 16px 6px 0;color:#6B6052">${label}</td><td style="padding:6px 0;color:#2D3B45"><strong>${value}</strong></td></tr>`;
  const games = PUZZLE_GAMES.map(g => row(GAME_NAMES[g], `${s.games[g].starts} started, ${s.games[g].solved} finished${s.games[g].notFinishedPct === null ? '' : `, ${s.games[g].notFinishedPct}% not finished`}`)).join('');
  return `<div style="font-family:Georgia,serif;max-width:560px;color:#3B3228;font-size:17px;line-height:1.6">
  <h2 style="font-weight:400;color:#2D3B45;margin:0 0 12px">${flag.headline}</h2>
  <p style="margin:0 0 12px">${flag.detail}</p>
  <p style="margin:0 0 20px"><strong>What to do:</strong> ${flag.next}</p>
  <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">
    ${row('Days counted', `${s.from} to ${s.to}`)}
    ${row('Players a day', s.playersPerDay)}
    ${row('Came back the next day', s.cameBackNextDayPct === null ? 'not enough days yet' : `${s.cameBackNextDayPct}%`)}
    ${games}
    ${row('Back after finishing', s.backAfterSolvingPct === null ? 'no data' : `${s.backAfterSolvingPct}%`)}
    ${row('Back after not finishing', s.backAfterNotSolvingPct === null ? 'no data' : `${s.backAfterNotSolvingPct}%`)}
  </table>
  <p style="font-family:Arial,sans-serif;font-size:13px;color:#74685A;margin-top:20px">Counts are anonymous, United States and Canada only, with known bots left out. You will not hear about this one again for ${flag.quietDays} days. Sent by the daily puzzle watch on manitoubeachmichigan.com.</p>
</div>`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireCronOrAdmin(req, res)) return;
  const dry = req.query?.dry === '1';
  const today = detroitDate(0), to = addDays(today, -1), from = addDays(to, -(FLAG_RULES.windowDays - 1));

  try {
    const { events, capped } = await loadPuzzleEvents(from);
    const stats = summarize(events, from, to);
    const flags = evaluateFlags(stats);
    const results = [];

    for (const flag of flags) {
      const sentOn = await lastSent(flag.id);
      if (sentOn && addDays(sentOn, flag.quietDays) > today) { results.push({ id: flag.id, action: 'quiet', lastSent: sentOn }); continue; }
      if (dry) { results.push({ id: flag.id, action: 'would send', headline: flag.headline, detail: flag.detail }); continue; }

      // Keep the record before trying to tell anyone, so a failed send is never a lost flag.
      console.log('[PUZZLE-FLAG]', JSON.stringify({ flag, stats }));
      await put(`${FLAG_PREFIX}/${flag.id}/raised/${today}.json`, JSON.stringify({ flag, stats }), { ...blobOpts, token: process.env.BLOB_READ_WRITE_TOKEN });

      let emailed = false, texted = false;
      if (process.env.RESEND_API_KEY) {
        try {
          const out = await new Resend(process.env.RESEND_API_KEY).emails.send({
            from: 'Manitou Beach <tickets@manitoubeachmichigan.com>',
            to: process.env.ADMIN_EMAIL || 'daryl@manitoubeachmichigan.com',
            subject: `Puzzle page: ${flag.headline}`,
            html: emailHtml(flag, stats),
          });
          emailed = !out?.error;
          if (out?.error) console.error('Puzzle watch: email refused:', out.error.message || out.error);
        } catch (err) { console.error('Puzzle watch: email failed:', err.message); }
      }
      if (process.env.ADMIN_PHONE) {
        texted = await sendSMSFull(process.env.ADMIN_PHONE, `Manitou Beach puzzles: ${flag.headline}. ${flag.detail} Details are in your email.`);
      }
      // Only a flag that actually reached Daryl goes quiet. Otherwise tomorrow tries again.
      if (emailed || texted) await put(`${FLAG_PREFIX}/${flag.id}/sent/${today}.json`, '{}', { ...blobOpts, token: process.env.BLOB_READ_WRITE_TOKEN });
      results.push({ id: flag.id, action: emailed || texted ? 'sent' : 'NOT DELIVERED, will retry tomorrow', emailed, texted });
    }

    // A dated marker so anyone can see the watch is alive, without seeing any numbers.
    if (!dry) await put(`${FLAG_PREFIX}/last-run/${today}.json`, '{}', { ...blobOpts, token: process.env.BLOB_READ_WRITE_TOKEN });

    const failed = results.some(r => String(r.action).startsWith('NOT DELIVERED'));
    return res.status(failed ? 500 : 200).json({ ok: !failed, dry, capped, stats: { ...stats, after: undefined }, flags: results, rules: FLAG_RULES });
  } catch (err) {
    console.error('Puzzle watch failed:', err.message);
    return res.status(500).json({ error: 'Puzzle watch failed', message: err.message });
  }
}
