import { list } from '@vercel/blob';

// Reads the anonymous play records written by api/puzzle-count.js and turns them into
// the numbers we make decisions on. Kept apart from the endpoints so the same sums feed
// the admin report and the daily watch (api/cron-puzzle-watch.js).
//
// A record is a pathname:  puzzles/<date>/<game>/<event>/<visitor>.json
// event = "start" | "fail" | "solve-<tries>"

export const PUZZLE_PREFIX = 'puzzles';
export const PUZZLE_GAMES = ['five', 'search', 'sudoku'];
export const GAME_NAMES = { five: 'The Daily Five', search: 'Word Search', sudoku: 'Sudoku' };
const IGNORE_VISITORS = new Set(['deploycheck0000000001']);   // the launch-night test entry

export function detroitDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 864e5);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

// events[date][game] = { start:Set, solve:Set, fail:Set, tries:{} }
export function emptyGame() { return { start: new Set(), solve: new Set(), fail: new Set(), tries: {} }; }

export function addRecord(events, pathname) {
  const [prefix, date, game, label, file] = pathname.split('/');
  if (prefix !== PUZZLE_PREFIX || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !PUZZLE_GAMES.includes(game) || !file) return;
  const vid = file.replace(/\.json$/, '');
  if (IGNORE_VISITORS.has(vid)) return;
  const g = ((events[date] = events[date] || {})[game] = events[date][game] || emptyGame());
  if (label === 'start') g.start.add(vid);
  else if (label === 'fail') { g.fail.add(vid); g.start.add(vid); }
  else if (label.startsWith('solve-')) { g.solve.add(vid); g.start.add(vid); const t = label.slice(6); g.tries[t] = (g.tries[t] || 0) + 1; }
}

export async function loadPuzzleEvents(sinceDate) {
  const events = {};
  let cursor, pages = 0, capped = false;
  do {
    const out = await list({ prefix: `${PUZZLE_PREFIX}/`, limit: 1000, cursor, token: process.env.BLOB_READ_WRITE_TOKEN });
    for (const b of out.blobs) { const date = b.pathname.split('/')[1]; if (date && date >= sinceDate) addRecord(events, b.pathname); }
    cursor = out.hasMore ? out.cursor : undefined;
    if (++pages >= 60 && cursor) { capped = true; break; }
  } while (cursor);
  return { events, capped };
}

const pct = (n, d) => (d ? Math.round((n / d) * 100) : null);

// Everyone who started any puzzle that day.
export function playersOn(events, date) {
  const all = new Set();
  for (const g of Object.values(events[date] || {})) for (const v of g.start) all.add(v);
  return all;
}

// Sums over the days from..to (inclusive). `to` should be a finished day, never today.
export function summarize(events, from, to) {
  const days = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);

  let playerDays = 0, activeDays = 0, cameBack = 0, couldComeBack = 0;
  const games = Object.fromEntries(PUZZLE_GAMES.map(g => [g, { starts: 0, solved: 0, failed: 0, gaveUp: 0 }]));
  // Did the people who finished come back the next day more than the people who did not?
  const after = { solved: { n: 0, back: 0 }, notSolved: { n: 0, back: 0 } };

  for (const date of days) {
    const today = playersOn(events, date);
    if (today.size) activeDays++;
    playerDays += today.size;
    const hasNext = date < to;
    const next = hasNext ? playersOn(events, addDays(date, 1)) : null;
    if (hasNext) { couldComeBack += today.size; for (const v of today) if (next.has(v)) cameBack++; }

    for (const game of PUZZLE_GAMES) {
      const g = (events[date] || {})[game];
      if (!g) continue;
      const t = games[game];
      for (const v of g.start) {
        const solved = g.solve.has(v), failed = !solved && g.fail.has(v);
        t.starts++;
        if (solved) t.solved++; else if (failed) t.failed++; else t.gaveUp++;
        if (hasNext) { const bucket = solved ? after.solved : after.notSolved; bucket.n++; if (next.has(v)) bucket.back++; }
      }
    }
  }
  for (const t of Object.values(games)) { t.notFinishedPct = pct(t.failed + t.gaveUp, t.starts); t.gaveUpPct = pct(t.gaveUp, t.starts); }
  return {
    from, to, days: days.length, activeDays,
    playersPerDay: days.length ? Math.round((playerDays / days.length) * 10) / 10 : 0,
    playerDays,
    cameBackNextDayPct: pct(cameBack, couldComeBack), cameBack, couldComeBack,
    games,
    backAfterSolvingPct: pct(after.solved.back, after.solved.n), backAfterNotSolvingPct: pct(after.notSolved.back, after.notSolved.n),
    after,
  };
}

// ---------- the flags ----------
// Starting guesses, set Nov 13 2026 before any real numbers existed. Change them here.
export const FLAG_RULES = {
  windowDays: 14,
  sponsor: { minPlayersPerDay: 20, minActiveDays: 10, minCameBackPct: 25, quietDays: 90 },
  tooHard: { minStarts: 40, minNotFinishedPct: 50, quietDays: 21 },
  quitters: { minEach: 30, maxRatio: 0.5, quietDays: 30 },
};

export function evaluateFlags(s, rules = FLAG_RULES) {
  const flags = [];
  const sp = rules.sponsor;
  if (s.playersPerDay >= sp.minPlayersPerDay && s.activeDays >= sp.minActiveDays && (s.cameBackNextDayPct ?? 0) >= sp.minCameBackPct) {
    flags.push({
      id: 'sponsor-ready', quietDays: sp.quietDays,
      headline: 'The puzzle page has enough players to sell a sponsor',
      detail: `Over the last ${s.days} days about ${s.playersPerDay} people a day played, and ${s.cameBackNextDayPct}% of them came back the very next day.`,
      next: 'Time to offer the Puzzle Page sponsor (one business a month, "Today\'s puzzles are brought to you by"). The sponsor slot still has to be built first.',
    });
  }
  for (const game of PUZZLE_GAMES) {
    const g = s.games[game], r = rules.tooHard;
    if (g.starts >= r.minStarts && (g.notFinishedPct ?? 0) >= r.minNotFinishedPct) {
      flags.push({
        id: `too-hard-${game}`, quietDays: r.quietDays,
        headline: `${GAME_NAMES[game]} is losing most of the people who start it`,
        detail: `Over the last ${s.days} days it was started ${g.starts} times and not finished ${g.failed + g.gaveUp} times (${g.notFinishedPct}%). ${g.gaveUp} of those walked away part way through${g.failed ? ` and ${g.failed} ran out of tries` : ''}.`,
        next: 'Make it a little easier for everyone, or add a hint button, then watch whether the number drops.',
      });
    }
  }
  const q = rules.quitters;
  if (s.after.solved.n >= q.minEach && s.after.notSolved.n >= q.minEach && s.backAfterSolvingPct > 0 && s.backAfterNotSolvingPct <= s.backAfterSolvingPct * q.maxRatio) {
    flags.push({
      id: 'quitters-do-not-return', quietDays: q.quietDays,
      headline: 'People who do not finish a puzzle are not coming back',
      detail: `After finishing a puzzle, ${s.backAfterSolvingPct}% played again the next day. After not finishing, only ${s.backAfterNotSolvingPct}% did (${s.after.solved.n} and ${s.after.notSolved.n} plays compared).`,
      next: 'This is the clue to act on: get more people to the finish. A hint button is the first thing to try.',
    });
  }
  return flags;
}
