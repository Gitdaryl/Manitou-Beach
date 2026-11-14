import { put, list } from '@vercel/blob';
import { detroitDate, addDays, loadPuzzleEvents, playersOn, summarize } from './lib/puzzleStats.js';

// Anonymous play counter for /puzzles. Nothing is shown on the site; it answers one
// question: do people play, and do they come back the next day.
//
// One tiny blob per event, never read back. Everything lives in the pathname, because
// blob content reads are CDN-cached and lose counts (see track-view.js for the old way):
//   puzzles/<date>/<game>/<event>/<visitor>.json
// event is "start", "fail" or "solve-<tries>". visitor is a random id made in the
// player's browser, so the same person on two days can be matched without a name.
//
// POST { game, date, event, tries, vid, wd }   from the page
// GET  ?days=30  with x-admin-token             daily totals, give-ups, who came back
// GET  ?watch=1  (public)                       the last day the daily watch ran, no numbers

const PREFIX = 'puzzles';
const GAMES = ['five', 'search', 'sudoku'];
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|bingpreview|python|curl|wget|httpclient|axios|node-fetch|go-http|java\/|playwright|puppeteer|phantom|selenium|scrapy|semrush|ahrefs|mj12|dotbot|petal|yandex|baidu/i;

function isHuman(req, body) {
  const country = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
  if (country !== 'US' && country !== 'CA') return false;
  const ua = String(req.headers['user-agent'] || '');
  if (!ua || !/Mozilla\//.test(ua) || BOT_UA.test(ua)) return false;
  return body.wd === false;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (req.method === 'POST') {
    const body = req.body || {};
    const { game, date, event, vid } = body;
    const tries = Number(body.tries);
    if (!GAMES.includes(game)) return res.status(400).json({ error: 'Unknown game' });
    if (!['start', 'solve', 'fail'].includes(event)) return res.status(400).json({ error: 'Unknown event' });
    if (!/^[a-z0-9]{12,40}$/.test(String(vid || ''))) return res.status(400).json({ error: 'Bad visitor id' });
    // Only today's puzzle counts (yesterday and tomorrow allowed for clocks near midnight).
    if (![detroitDate(-1), detroitDate(0), detroitDate(1)].includes(date)) return res.status(400).json({ error: 'Bad date' });
    if (!isHuman(req, body)) return res.status(200).json({ ok: true, counted: false });

    const label = event === 'solve' ? `solve-${Number.isInteger(tries) && tries >= 1 && tries <= 6 ? tries : 0}` : event;
    try {
      await put(`${PREFIX}/${date}/${game}/${label}/${vid}.json`, '{}', {
        access: 'public', token, addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json',
      });
      return res.status(200).json({ ok: true, counted: true });
    } catch (err) {
      console.error('puzzle-count write failed:', err.message);
      return res.status(500).json({ error: 'Could not record' });
    }
  }

  if (req.method === 'GET') {
    // Public, numbers-free: the last morning the daily watch ran (api/cron-puzzle-watch.js).
    if (req.query.watch === '1') {
      try {
        const { blobs } = await list({ prefix: 'puzzle-flags/last-run/', token });
        const last = blobs.map(b => (b.pathname.split('/').pop() || '').replace('.json', '')).sort().pop() || null;
        return res.status(200).json({ lastWatchRun: last });
      } catch (err) {
        return res.status(500).json({ error: 'Could not read watch status' });
      }
    }

    const admin = req.headers['x-admin-token'];
    if (!admin || admin !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 120);
    const since = detroitDate(-days);
    try {
      const { events, capped } = await loadPuzzleEvents(since);
      const dates = Object.keys(events).sort();
      const rows = dates.map((date) => {
        const players = playersOn(events, date), before = playersOn(events, addDays(date, -1));
        const games = {};
        for (const [game, g] of Object.entries(events[date])) {
          games[game] = { start: g.start.size, solve: g.solve.size, fail: g.fail.size, gaveUp: [...g.start].filter(v => !g.solve.has(v) && !g.fail.has(v)).length, tries: g.tries };
        }
        return { date, players: players.size, backFromDayBefore: [...players].filter(v => before.has(v)).length, games };
      });
      // Finished days only: today is still being played, so it would look like give-ups.
      const summary = { ...summarize(events, since, detroitDate(-1)), after: undefined };
      return res.status(200).json({ since, capped, summary, days: rows });
    } catch (err) {
      console.error('puzzle-count read failed:', err.message);
      return res.status(500).json({ error: 'Could not read counts' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
