import { put, list } from '@vercel/blob';

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
// GET  ?days=30  with x-admin-token             daily totals and returning players

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

function detroitDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 864e5);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
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
    const admin = req.headers['x-admin-token'];
    if (!admin || admin !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 120);
    const since = detroitDate(-days);
    try {
      const byDay = {};          // date -> game -> { start, solve, fail, tries: {1..6} }
      const seen = {};           // date -> Set of visitors who started anything
      let cursor, pages = 0, capped = false;
      do {
        const out = await list({ prefix: `${PREFIX}/`, limit: 1000, cursor, token });
        for (const b of out.blobs) {
          const [, date, game, label, file] = b.pathname.split('/');
          if (!date || date < since || !GAMES.includes(game) || !file) continue;
          const day = (byDay[date] = byDay[date] || {});
          const g = (day[game] = day[game] || { start: 0, solve: 0, fail: 0, tries: {} });
          if (label === 'start') { g.start += 1; (seen[date] = seen[date] || new Set()).add(file); }
          else if (label === 'fail') g.fail += 1;
          else if (label.startsWith('solve-')) { g.solve += 1; const t = label.slice(6); g.tries[t] = (g.tries[t] || 0) + 1; }
        }
        cursor = out.hasMore ? out.cursor : undefined;
        if (++pages >= 40 && cursor) { capped = true; break; }
      } while (cursor);

      const dates = Object.keys(byDay).sort();
      const rows = dates.map((date, i) => {
        const players = seen[date] ? seen[date].size : 0;
        const prev = i > 0 ? seen[dates[i - 1]] : null;
        const backFromDayBefore = prev && seen[date] ? [...seen[date]].filter(v => prev.has(v)).length : 0;
        return { date, players, backFromDayBefore, games: byDay[date] };
      });
      return res.status(200).json({ since, capped, days: rows });
    } catch (err) {
      console.error('puzzle-count read failed:', err.message);
      return res.status(500).json({ error: 'Could not read counts' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
