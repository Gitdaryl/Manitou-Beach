import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';
import SEOHead from '../components/SEOHead';
import { FIVE_ANSWERS, FIVE_VALID, SEARCH_THEMES } from '../data/puzzleWords';

// ============================================================
// /puzzles - three daily puzzles, the same for everybody, for fun.
//   The Daily Five  (/puzzles)              guess the five-letter word
//   Word Search     (/puzzles/word-search)  eight local words in a grid
//   Sudoku          (/puzzles/sudoku)
// Everything is worked out in the browser from today's date (Michigan time), so there is
// nothing to publish each day. Progress is kept in the player's own browser. The only
// thing sent anywhere is an anonymous "started / solved" count to /api/puzzle-count.
// Test links: ?date=2026-12-25 plays that day's puzzles and saves nothing.
// ============================================================

const RED = '#B3261E';      // the red pen: right, found, done
const BLUE = '#1F3F9E';     // the blue pen: close, your own writing
const FIRST_DAY = Date.UTC(2026, 10, 13);   // puzzle No. 1
const SERIF = "'Libre Baskerville', serif";
const SANS = "'Libre Franklin', sans-serif";
const HAND = "'Caveat', cursive";
const STORE_KEY = 'mb-puzzles:v1';

const GAMES = [
  { id: 'five', slug: '', label: 'The Daily Five' },
  { id: 'search', slug: 'word-search', label: 'Word Search' },
  { id: 'sudoku', slug: 'sudoku', label: 'Sudoku' },
];

// ---------- date, random numbers, storage, counting ----------

function michiganToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function dayNumber(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - FIRST_DAY) / 864e5);
}
function longDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' });
}
// Same seed, same numbers, on every phone and computer.
function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(list, rand) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function readStore() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (_) { return {}; } }
function writeStore(patch) { try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...readStore(), ...patch })); } catch (_) {} }
function visitorId() {
  const s = readStore();
  if (s.vid) return s.vid;
  const vid = Array.from({ length: 20 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
  writeStore({ vid });
  return vid;
}
// One "start" and one finish per game per day, sent once.
function report(ctx, game, event, tries) {
  if (ctx.test) return;
  const sent = readStore().sent || {};
  const key = `${ctx.date}:${game}:${event}`;
  if (sent[key]) return;
  const keep = Object.fromEntries(Object.entries(sent).filter(([k]) => k.startsWith(ctx.date)));
  writeStore({ sent: { ...keep, [key]: 1 } });
  fetch('/api/puzzle-count', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ game, date: ctx.date, event, tries, vid: visitorId(), wd: !!navigator.webdriver }),
  }).catch(() => {});
}
function useSaved(ctx, game) {
  const initial = useMemo(() => { const s = ctx.test ? null : readStore()[game]; return s && s.date === ctx.date ? s : null; }, [ctx, game]);
  const save = useCallback((data) => { if (!ctx.test) writeStore({ [game]: { date: ctx.date, ...data } }); }, [ctx, game]);
  return [initial, save];
}
async function shareText(text) {
  const url = `${window.location.origin}/puzzles`;
  try {
    if (navigator.share && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) { await navigator.share({ text: `${text}\n${url}` }); return 'shared'; }
    await navigator.clipboard.writeText(`${text}\n${url}`); return 'copied';
  } catch (_) { return 'failed'; }
}

// ---------- shared bits ----------

const PEN = {
  hit: 'M52 8 C24 5 7 26 9 52 C11 80 36 95 60 91 C84 87 96 64 91 41 C87 20 68 6 44 10',
  near: 'M12 90 C28 84 38 96 52 89 C66 83 76 95 90 87',
  miss: 'M14 84 L88 16',
};
function PenMark({ kind, delay = 0 }) {
  return (
    <svg className="pz-mark" viewBox="0 0 100 100" aria-hidden="true" style={{ '--d': `${delay}s` }}>
      <path pathLength="1" d={PEN[kind]} stroke={kind === 'hit' ? RED : kind === 'near' ? BLUE : C.warmGray} strokeWidth={kind === 'miss' ? 2.6 : 3.4} />
    </svg>
  );
}
function Note({ children, blue, sub, slim }) {
  return (
    <div role="status" aria-live="polite" style={{ minHeight: slim ? 44 : 64, textAlign: 'center', margin: slim ? '6px 0 4px' : '10px 0 6px' }}>
      <div style={{ fontFamily: HAND, fontSize: 29, lineHeight: 1.25, fontWeight: 600, color: blue ? BLUE : RED }}>{children}</div>
      {sub && <div style={{ fontFamily: SANS, fontSize: 15, color: C.textLight, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function ShareButton({ text }) {
  const [state, setState] = useState('');
  return (
    <button type="button" className="pz-btn" onClick={async () => { const r = await shareText(text); setState(r); setTimeout(() => setState(''), 2200); }}>
      {state === 'copied' ? 'Copied. Paste it anywhere.' : state === 'failed' ? "Couldn't copy, sorry" : 'Share my result'}
    </button>
  );
}
const TOMORROW = 'A new one is waiting tomorrow morning.';

// ============================================================
// THE DAILY FIVE
// ============================================================

function scoreGuess(guess, answer) {
  const res = Array(5).fill('miss'), left = answer.split('');
  for (let i = 0; i < 5; i++) if (guess[i] === answer[i]) { res[i] = 'hit'; left[i] = null; }
  for (let i = 0; i < 5; i++) if (res[i] !== 'hit') { const j = left.indexOf(guess[i]); if (j > -1) { res[i] = 'near'; left[j] = null; } }
  return res;
}
const FIVE_CHEERS = ['First try! Buy a lottery ticket.', 'Two! Show-off.', 'Three. Nicely done.', 'Got it in four.', 'Five. You made it.', 'Phew. Last line.'];
const FIVE_WORDS = { hit: 'right spot', near: 'wrong spot', miss: 'not in the word' };
const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', '>zxcvbnm<'];

function FiveGame({ ctx, onDone }) {
  const valid = useMemo(() => new Set(FIVE_VALID.split(' ')), []);
  const answer = useMemo(() => {
    if (ctx.word) return ctx.word;
    const n = FIVE_ANSWERS.length;
    return FIVE_ANSWERS[((ctx.day % n) + n) % n];
  }, [ctx]);
  const [saved, save] = useSaved(ctx, 'five');
  const [guesses, setGuesses] = useState(() => (saved && saved.guesses) || []);
  const [current, setCurrent] = useState('');
  const [fresh, setFresh] = useState(-1);       // row being inked right now
  const [busy, setBusy] = useState(false);
  const [oops, setOops] = useState('');
  const [shake, setShake] = useState(0);
  const [stats, setStats] = useState(() => (ctx.test ? null : readStore().fiveStats) || { played: 0, won: 0, streak: 0, best: 0, lastWin: null });

  const won = guesses[guesses.length - 1] === answer;
  const over = won || guesses.length === 6;
  const settled = over && !busy;
  useEffect(() => { if (settled) onDone('five'); }, [settled, onDone]);

  const press = useCallback((k) => {
    if (over || busy) return;
    if (k === 'Enter') {
      if (current.length < 5) { setOops('Five letters, please.'); setShake(s => s + 1); return; }
      if (!valid.has(current)) { setOops("Hmm, that's not in our dictionary."); setShake(s => s + 1); return; }
      const next = [...guesses, current];
      if (next.length === 1) report(ctx, 'five', 'start');
      setGuesses(next); setFresh(next.length - 1); setCurrent(''); setOops(''); setBusy(true);
      save({ guesses: next });
      const isWin = current === answer, isEnd = isWin || next.length === 6;
      if (isEnd && !ctx.test) {
        const s = { ...stats, played: stats.played + 1 };
        if (isWin) { s.won += 1; s.streak = stats.lastWin === ctx.day - 1 ? stats.streak + 1 : 1; s.lastWin = ctx.day; s.best = Math.max(s.best, s.streak); }
        else s.streak = 0;
        setStats(s); writeStore({ fiveStats: s });
      }
      if (isEnd) report(ctx, 'five', isWin ? 'solve' : 'fail', next.length);
      setTimeout(() => setBusy(false), 1500);
    } else if (k === 'Backspace') { setCurrent(c => c.slice(0, -1)); setOops(''); }
    else if (/^[a-z]$/.test(k)) setCurrent(c => (c.length < 5 ? c + k : c));
  }, [over, busy, current, guesses, valid, answer, ctx, save, stats]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === 'Enter' && tag === 'button') return;
      if (k === 'Enter' || k === 'Backspace' || /^[a-z]$/.test(k)) press(k);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [press]);

  // Keys take their colour once the row has finished being marked.
  const keyState = useMemo(() => {
    const rank = { miss: 1, near: 2, hit: 3 }, map = {};
    guesses.slice(0, busy ? guesses.length - 1 : guesses.length).forEach(g => scoreGuess(g, answer).forEach((s, i) => { if (!map[g[i]] || rank[s] > rank[map[g[i]]]) map[g[i]] = s; }));
    return map;
  }, [guesses, busy, answer]);

  const shareLines = () => {
    const sym = { hit: '●', near: '◐', miss: '○' };
    return `The Daily Five No. ${ctx.day + 1}  ${won ? guesses.length : 'X'}/6\n` + guesses.map(g => scoreGuess(g, answer).map(s => sym[s]).join('')).join('\n');
  };

  return (
    <div>
      <div role="grid" aria-label="Your guesses" style={{ display: 'grid', gap: 6, width: 'min(100%, 310px, 31vh)', margin: '0 auto' }}>
        {Array.from({ length: 6 }, (_, r) => {
          const guess = guesses[r], res = guess ? scoreGuess(guess, answer) : null;
          const typing = r === guesses.length && !over;
          return (
            <div role="row" key={r + (typing ? `-s${shake}` : '')} className={typing && shake ? 'pz-shake' : ''} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {Array.from({ length: 5 }, (_, i) => {
                const ch = guess ? guess[i] : typing ? current[i] || '' : '';
                const delay = r === fresh ? 0.06 + i * 0.23 : 0;
                return (
                  <div role="gridcell" key={i} className={`pz-cell${res ? ` pz-${res[i]}` : ''}`} style={{ '--d': `${delay}s`, borderColor: ch ? C.dusk : C.driftwood }}
                    aria-label={res ? `${ch.toUpperCase()}, ${FIVE_WORDS[res[i]]}` : ch ? ch.toUpperCase() : 'empty'}>
                    <span>{ch}</span>
                    {res && <PenMark kind={res[i]} delay={delay} />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {settled
        ? <Note blue={!won} sub={TOMORROW}>{won ? FIVE_CHEERS[guesses.length - 1] : `It was ${answer.toUpperCase()}.`}</Note>
        : <Note blue slim>{oops}</Note>}
      {settled && <div style={{ textAlign: 'center', marginBottom: 14 }}><ShareButton text={shareLines()} /></div>}

      <div aria-label="Keyboard" style={{ display: 'grid', gap: 6, maxWidth: 500, margin: '0 auto', userSelect: 'none' }}>
        {KEY_ROWS.map(line => (
          <div key={line} style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
            {line.split('').map(ch => {
              const k = ch === '>' ? 'Enter' : ch === '<' ? 'Backspace' : ch;
              const st = keyState[ch];
              return (
                <button type="button" key={ch} className={`pz-key${k.length > 1 ? ' pz-wide' : ''}${st ? ` pz-k-${st}` : ''}`}
                  aria-label={k === 'Backspace' ? 'Erase' : k === 'Enter' ? 'Enter' : `${ch.toUpperCase()}${st ? `, ${FIVE_WORDS[st]}` : ''}`}
                  onClick={(e) => { press(k); e.currentTarget.blur(); }}>
                  {k === 'Enter' ? 'Enter' : k === 'Backspace' ? 'Erase' : ch}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="pz-deck" style={{ margin: '26px auto 0' }}>One five-letter word a day. Six tries. Everybody around the lake gets the same one.</p>
      <div className="pz-legend" style={{ marginTop: 18 }}>
        <div><span className="pz-cell pz-hit pz-mini"><span>p</span><PenMark kind="hit" /></span><span><strong>Red circle:</strong> right letter, right spot.</span></div>
        <div><span className="pz-cell pz-near pz-mini"><span>e</span><PenMark kind="near" /></span><span><strong>Blue underline:</strong> in the word, wrong spot.</span></div>
        <div><span className="pz-cell pz-miss pz-mini"><span>x</span><PenMark kind="miss" /></span><span><strong>Crossed out:</strong> not in today's word.</span></div>
      </div>
      {stats && (
        <div className="pz-tally">
          <div><b>{stats.played}</b>Played</div><div><b>{stats.won}</b>Solved</div><div><b>{stats.streak}</b>Days running</div><div><b>{stats.best}</b>Best run</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// WORD SEARCH
// ============================================================

const SEARCH_N = 10;
const SEARCH_DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1]];   // across, down, and the two diagonals, always read left to right or top to bottom

function buildSearch(dateStr, day) {
  const n = SEARCH_THEMES.length, theme = SEARCH_THEMES[((day % n) + n) % n];
  for (let attempt = 0; attempt < 30; attempt++) {
    const rand = seededRandom(`search:${dateStr}:${attempt}`);
    const words = shuffled(theme.words, rand).slice(0, 8).sort((a, b) => b.replace(/ /g, '').length - a.replace(/ /g, '').length);
    const grid = Array.from({ length: SEARCH_N }, () => Array(SEARCH_N).fill(''));
    const placed = [];
    let ok = true;
    for (const label of words) {
      const w = label.replace(/ /g, '');
      let done = false;
      for (let t = 0; t < 300 && !done; t++) {
        const [dr, dc] = SEARCH_DIRS[Math.floor(rand() * SEARCH_DIRS.length)];
        const r = Math.floor(rand() * SEARCH_N), c = Math.floor(rand() * SEARCH_N);
        const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
        if (er < 0 || er >= SEARCH_N || ec < 0 || ec >= SEARCH_N) continue;
        let fits = true;
        for (let i = 0; i < w.length; i++) { const ch = grid[r + dr * i][c + dc * i]; if (ch && ch !== w[i]) { fits = false; break; } }
        if (!fits) continue;
        for (let i = 0; i < w.length; i++) grid[r + dr * i][c + dc * i] = w[i];
        placed.push({ label, word: w, r, c, er, ec });
        done = true;
      }
      if (!done) { ok = false; break; }
    }
    if (!ok) continue;
    const pool = placed.map(p => p.word).join('');
    for (let r = 0; r < SEARCH_N; r++) for (let c = 0; c < SEARCH_N; c++) if (!grid[r][c]) grid[r][c] = pool[Math.floor(rand() * pool.length)];
    return { title: theme.title, grid, placed: placed.sort((a, b) => a.label.localeCompare(b.label)) };
  }
  return null;
}
function Loop({ r, c, er, ec, color, width = 0.075, dashed }) {
  const cx = (c + ec) / 2 + 0.5, cy = (r + er) / 2 + 0.5;
  const len = Math.hypot(ec - c, er - r) + 0.84, ang = Math.atan2(er - r, ec - c) * 180 / Math.PI;
  return <rect x={-len / 2} y={-0.42} width={len} height={0.84} rx={0.42} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? '0.18 0.14' : undefined} transform={`translate(${cx} ${cy}) rotate(${ang})`} />;
}

function SearchGame({ ctx, onDone }) {
  const puzzle = useMemo(() => buildSearch(ctx.date, ctx.day), [ctx]);
  const [saved, save] = useSaved(ctx, 'search');
  const [found, setFound] = useState(() => (saved && saved.found) || []);
  const [drag, setDrag] = useState(null);       // { r, c, er, ec } while a finger is down
  const [anchor, setAnchor] = useState(null);   // first tap of a tap-then-tap pick
  const [miss, setMiss] = useState(0);
  const gridRef = useRef(null);
  const done = puzzle && found.length === puzzle.placed.length;
  useEffect(() => { if (done) onDone('search'); }, [done, onDone]);
  if (!puzzle) return <Note blue>Today's word search got tangled. Try the other two!</Note>;

  const cellAt = (e) => {
    const box = gridRef.current.getBoundingClientRect();
    const c = Math.floor((e.clientX - box.left) / box.width * SEARCH_N), r = Math.floor((e.clientY - box.top) / box.height * SEARCH_N);
    return { r: Math.max(0, Math.min(SEARCH_N - 1, r)), c: Math.max(0, Math.min(SEARCH_N - 1, c)) };
  };
  // Keep the line straight: across, down or a true diagonal from where it started.
  const snap = (from, to) => {
    const dr = to.r - from.r, dc = to.c - from.c;
    if (!dr && !dc) return { ...from, er: from.r, ec: from.c };
    const ang = Math.round(Math.atan2(dr, dc) / (Math.PI / 4));
    const ur = [0, 1, 1, 1, 0, -1, -1, -1][(ang + 8) % 8], uc = [1, 1, 0, -1, -1, -1, 0, 1][(ang + 8) % 8];
    let len = Math.max(Math.abs(dr), Math.abs(dc));
    while (len > 0 && (from.r + ur * len < 0 || from.r + ur * len >= SEARCH_N || from.c + uc * len < 0 || from.c + uc * len >= SEARCH_N)) len--;
    return { ...from, er: from.r + ur * len, ec: from.c + uc * len };
  };
  const tryLine = (line) => {
    const len = Math.max(Math.abs(line.er - line.r), Math.abs(line.ec - line.c));
    const sr = Math.sign(line.er - line.r), sc = Math.sign(line.ec - line.c);
    let text = '';
    for (let i = 0; i <= len; i++) text += puzzle.grid[line.r + sr * i][line.c + sc * i];
    const back = text.split('').reverse().join('');
    const idx = puzzle.placed.findIndex((p, i) => !found.includes(i) && (p.word === text || p.word === back));
    if (idx < 0) { if (len > 0) setMiss(m => m + 1); return; }
    const next = [...found, idx];
    if (next.length === 1) report(ctx, 'search', 'start');
    setFound(next); save({ found: next });
    if (next.length === puzzle.placed.length) report(ctx, 'search', 'solve');
  };
  const down = (e) => { if (done) return; e.currentTarget.setPointerCapture(e.pointerId); const p = cellAt(e); setDrag({ ...p, er: p.r, ec: p.c }); };
  const move = (e) => { if (drag) setDrag(snap(drag, cellAt(e))); };
  const up = () => {
    if (!drag) return;
    const tap = drag.r === drag.er && drag.c === drag.ec;
    if (!tap) { tryLine(drag); setAnchor(null); }
    else if (anchor && (anchor.r !== drag.r || anchor.c !== drag.c)) { tryLine(snap(anchor, drag)); setAnchor(null); }
    else setAnchor(anchor ? null : { r: drag.r, c: drag.c });
    setDrag(null);
  };
  const inFound = (r, c) => found.some(i => { const p = puzzle.placed[i], len = Math.max(Math.abs(p.er - p.r), Math.abs(p.ec - p.c)), sr = Math.sign(p.er - p.r), sc = Math.sign(p.ec - p.c); for (let k = 0; k <= len; k++) if (p.r + sr * k === r && p.c + sc * k === c) return true; return false; });

  return (
    <div>
      <p className="pz-deck">Today's theme: <strong style={{ fontStyle: 'normal', color: C.dusk }}>{puzzle.title}</strong>. Eight words are hiding. Drag across a word, or tap its first letter and then its last.</p>
      <div style={{ position: 'relative', width: 'min(100%, 430px)', margin: '0 auto' }} key={`m${miss}`} className={miss ? 'pz-shake' : ''}>
        <div ref={gridRef} role="img" aria-label={`Word search grid, theme ${puzzle.title}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => setDrag(null)}
          style={{ display: 'grid', gridTemplateColumns: `repeat(${SEARCH_N}, 1fr)`, border: `1.5px solid ${C.dusk}`, background: '#FFFDF8', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', cursor: 'pointer' }}>
          {puzzle.grid.map((row, r) => row.map((ch, c) => (
            <div key={`${r}-${c}`} style={{ aspectRatio: '1', display: 'grid', placeItems: 'center', fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(15px, 4.6vw, 21px)', color: inFound(r, c) ? RED : C.dusk,
              background: anchor && anchor.r === r && anchor.c === c ? `${BLUE}26` : 'transparent' }}>{ch}</div>
          )))}
        </div>
        <svg viewBox={`0 0 ${SEARCH_N} ${SEARCH_N}`} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {found.map(i => <Loop key={i} {...puzzle.placed[i]} color={RED} />)}
          {drag && <Loop {...drag} color={BLUE} dashed />}
        </svg>
      </div>

      <ul aria-label="Words to find" style={{ listStyle: 'none', padding: 0, margin: '16px auto 0', maxWidth: 430, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px' }}>
        {puzzle.placed.map((p, i) => {
          const got = found.includes(i);
          return <li key={p.label} style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: 0.5, color: got ? C.warmGray : C.text, textDecoration: got ? 'line-through' : 'none', textDecorationColor: RED, textDecorationThickness: 2 }}>{p.label}{got && <span className="pz-sr"> (found)</span>}</li>;
        })}
      </ul>
      {done
        ? <><Note sub={TOMORROW}>All eight. Sharp eyes!</Note><div style={{ textAlign: 'center' }}><ShareButton text={`Word Search No. ${ctx.day + 1}: found all 8 in "${puzzle.title}"`} /></div></>
        : <Note blue>{found.length ? `${found.length} down, ${puzzle.placed.length - found.length} to go.` : ''}</Note>}
    </div>
  );
}

// ============================================================
// SUDOKU
// ============================================================

function sudokuCount(cells, limit) {
  // Counts solutions up to `limit`, always filling the square with the fewest choices.
  const rows = Array(9).fill(0), cols = Array(9).fill(0), boxes = Array(9).fill(0), g = cells.slice();
  for (let i = 0; i < 81; i++) if (g[i]) { const b = 1 << g[i]; rows[(i / 9) | 0] |= b; cols[i % 9] |= b; boxes[((i / 27) | 0) * 3 + (((i % 9) / 3) | 0)] |= b; }
  let count = 0;
  const go = () => {
    let best = -1, bestMask = 0, bestN = 10;
    for (let i = 0; i < 81; i++) if (!g[i]) {
      const r = (i / 9) | 0, c = i % 9, bx = ((r / 3) | 0) * 3 + ((c / 3) | 0), mask = ~(rows[r] | cols[c] | boxes[bx]) & 0x3FE;
      let n = 0; for (let m = mask; m; m &= m - 1) n++;
      if (n < bestN) { best = i; bestMask = mask; bestN = n; if (n <= 1) break; }
    }
    if (best < 0) { count++; return; }
    const r = (best / 9) | 0, c = best % 9, bx = ((r / 3) | 0) * 3 + ((c / 3) | 0);
    for (let d = 1; d <= 9 && count < limit; d++) if (bestMask & (1 << d)) {
      g[best] = d; rows[r] |= 1 << d; cols[c] |= 1 << d; boxes[bx] |= 1 << d;
      go();
      g[best] = 0; rows[r] &= ~(1 << d); cols[c] &= ~(1 << d); boxes[bx] &= ~(1 << d);
    }
  };
  go();
  return count;
}
function buildSudoku(dateStr) {
  const rand = seededRandom(`sudoku:${dateStr}`);
  const three = () => shuffled([0, 1, 2], rand);
  const rowOrder = three().flatMap(b => three().map(r => b * 3 + r)), colOrder = three().flatMap(b => three().map(c => b * 3 + c));
  const digits = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9], rand);
  const solution = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) solution.push(digits[(rowOrder[r] * 3 + ((rowOrder[r] / 3) | 0) + colOrder[c]) % 9]);
  // Take numbers away one at a time, keeping only puzzles with exactly one answer. Stop at an easy 38 given.
  const givens = solution.slice();
  let left = 81;
  for (const i of shuffled(Array.from({ length: 81 }, (_, k) => k), rand)) {
    if (left <= 38) break;
    const keep = givens[i]; givens[i] = 0;
    if (sudokuCount(givens, 2) === 1) left--; else givens[i] = keep;
  }
  return { solution, givens };
}

function SudokuGame({ ctx, onDone }) {
  const puzzle = useMemo(() => buildSudoku(ctx.date), [ctx]);
  const [saved, save] = useSaved(ctx, 'sudoku');
  const [cells, setCells] = useState(() => (saved && saved.cells && saved.cells.length === 81 ? saved.cells : puzzle.givens.slice()));
  const [sel, setSel] = useState(-1);
  const done = cells.every((v, i) => v === puzzle.solution[i]);
  useEffect(() => { if (done) onDone('sudoku'); }, [done, onDone]);

  const put = useCallback((v) => {
    if (done || sel < 0 || puzzle.givens[sel]) return;
    const next = cells.slice(); next[sel] = v;
    if (!cells.some((x, i) => x && !puzzle.givens[i])) report(ctx, 'sudoku', 'start');
    setCells(next); save({ cells: next });
    if (next.every((x, i) => x === puzzle.solution[i])) report(ctx, 'sudoku', 'solve');
  }, [done, sel, cells, puzzle, ctx, save]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || sel < 0) return;
      if (/^[1-9]$/.test(e.key)) put(Number(e.key));
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') put(0);
      else if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const r = (sel / 9) | 0, c = sel % 9;
        const nr = e.key === 'ArrowUp' ? Math.max(0, r - 1) : e.key === 'ArrowDown' ? Math.min(8, r + 1) : r;
        const nc = e.key === 'ArrowLeft' ? Math.max(0, c - 1) : e.key === 'ArrowRight' ? Math.min(8, c + 1) : c;
        setSel(nr * 9 + nc);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sel, put]);

  const clash = (i) => {
    const v = cells[i]; if (!v) return false;
    const r = (i / 9) | 0, c = i % 9;
    for (let j = 0; j < 81; j++) if (j !== i && cells[j] === v) { const jr = (j / 9) | 0, jc = j % 9; if (jr === r || jc === c || (((jr / 3) | 0) === ((r / 3) | 0) && ((jc / 3) | 0) === ((c / 3) | 0))) return true; }
    return false;
  };
  const sr = sel < 0 ? -1 : (sel / 9) | 0, sc = sel < 0 ? -1 : sel % 9;
  const leftOf = (d) => 9 - cells.filter(v => v === d).length;
  const blanks = cells.filter(v => !v).length;

  return (
    <div>
      <p className="pz-deck">Fill every row, every column and every 3 by 3 box with the numbers 1 to 9. No repeats. Tap a square, then tap a number.</p>
      <div role="grid" aria-label="Sudoku grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', width: 'min(100%, 430px)', margin: '0 auto', border: `2.5px solid ${C.dusk}`, background: '#FFFDF8', userSelect: 'none' }}>
        {cells.map((v, i) => {
          const r = (i / 9) | 0, c = i % 9, given = !!puzzle.givens[i], bad = !given && clash(i);
          const near = sel >= 0 && (r === sr || c === sc || (((r / 3) | 0) === ((sr / 3) | 0) && ((c / 3) | 0) === ((sc / 3) | 0)));
          const same = sel >= 0 && v && v === cells[sel];
          return (
            <button type="button" role="gridcell" key={i} onClick={() => setSel(i)} aria-selected={i === sel}
              aria-label={`Row ${r + 1}, column ${c + 1}, ${v ? `${v}${given ? ', given' : bad ? ', repeated' : ''}` : 'empty'}`}
              style={{ aspectRatio: '1', padding: 0, margin: 0, border: 'none', borderRadius: 0, cursor: 'pointer', display: 'grid', placeItems: 'center',
                borderRight: c === 8 ? 'none' : `${c % 3 === 2 ? 2 : 1}px solid ${c % 3 === 2 ? C.dusk : C.driftwood}`,
                borderBottom: r === 8 ? 'none' : `${r % 3 === 2 ? 2 : 1}px solid ${r % 3 === 2 ? C.dusk : C.driftwood}`,
                background: i === sel ? `${BLUE}33` : same ? `${BLUE}1F` : near ? C.warmWhite : 'transparent',
                fontFamily: given ? SERIF : HAND, fontWeight: 700, fontSize: given ? 'clamp(17px, 5vw, 24px)' : 'clamp(24px, 7vw, 33px)', lineHeight: 1,
                color: given ? C.dusk : bad ? RED : BLUE, textDecoration: bad ? 'underline wavy' : 'none', outlineOffset: -3 }}>
              {v || ''}
            </button>
          );
        })}
      </div>

      {done
        ? <><Note sub={TOMORROW}>Every square. Beautiful.</Note><div style={{ textAlign: 'center' }}><ShareButton text={`Sudoku No. ${ctx.day + 1}: solved`} /></div></>
        : <Note blue>{cells.some((v, i) => !puzzle.givens[i] && clash(i)) ? 'A number repeats. Look for the squiggle.' : blanks < 81 - 38 ? `${blanks} squares to go.` : ''}</Note>}

      {!done && (
        <div aria-label="Number pad" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, maxWidth: 430, margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
            <button type="button" key={d} className="pz-key pz-num" disabled={leftOf(d) <= 0} onClick={() => put(d)} aria-label={`${d}, ${Math.max(0, leftOf(d))} left to place`}>{d}</button>
          ))}
          <button type="button" className="pz-key pz-num pz-wide" onClick={() => put(0)}>Erase</button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

const PUZZLE_CSS = `
.pz-deck{font-family:${SANS};font-size:17px;line-height:1.5;color:${C.textLight};text-align:center;max-width:460px;margin:0 auto 18px}
.pz-cell{position:relative;aspect-ratio:1;border:1.5px solid ${C.dusk};background:#FFFDF8;display:grid;place-items:center;font-family:${SERIF};font-weight:700;font-size:clamp(24px,7.5vw,32px);text-transform:uppercase;line-height:1;color:${C.dusk}}
.pz-cell.pz-miss{animation:pz-fade .3s ease-out forwards;animation-delay:var(--d,0s)}
.pz-mini{width:36px;flex:none;font-size:19px}
.pz-mark{position:absolute;inset:-7%;width:114%;height:114%;overflow:visible;pointer-events:none}
.pz-mark path{fill:none;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:pz-draw .38s ease-out forwards;animation-delay:var(--d,0s)}
@keyframes pz-draw{to{stroke-dashoffset:0}}
@keyframes pz-fade{to{color:${C.warmGray};background:${C.sand}}}
.pz-shake{animation:pz-shake .35s}
@keyframes pz-shake{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
.pz-key{flex:1 1 0;min-width:0;height:52px;border:1.5px solid ${C.dusk};border-radius:6px;background:#FFFDF8;color:${C.dusk};font-family:${SANS};font-weight:700;font-size:17px;text-transform:uppercase;cursor:pointer;padding:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.pz-key:active{transform:translateY(1px);background:${C.sand}}
.pz-key.pz-wide{flex:1.7 1 0;font-size:12px;letter-spacing:.5px}
.pz-key.pz-num{font-size:22px;height:54px}
.pz-key.pz-num.pz-wide{font-size:15px}
.pz-key:disabled{opacity:.35;cursor:default}
.pz-k-hit{box-shadow:inset 0 0 0 3px ${RED};color:${RED}}
.pz-k-near{box-shadow:inset 0 -5px 0 ${BLUE};color:${BLUE}}
.pz-k-miss{background:${C.sand};color:${C.warmGray};text-decoration:line-through;border-color:${C.driftwood}}
.pz-btn{font-family:${SANS};font-weight:700;font-size:16px;background:${C.dusk};color:${C.cream};border:none;border-radius:12px;padding:0 26px;min-height:50px;cursor:pointer}
.pz-btn:active{background:${C.night}}
.pz-tab{flex:1 1 0;min-height:48px;padding:6px 8px;border:1.5px solid ${C.dusk};background:transparent;color:${C.dusk};font-family:${SANS};font-weight:700;font-size:15px;cursor:pointer;line-height:1.2}
.pz-tab + .pz-tab{border-left:none}
.pz-tab:first-child{border-radius:10px 0 0 10px}.pz-tab:last-child{border-radius:0 10px 10px 0}
.pz-tab[aria-selected="true"]{background:${C.dusk};color:${C.cream}}
.pz-legend{display:grid;gap:8px;max-width:430px;margin:26px auto 0;padding-top:18px;border-top:1px solid ${C.driftwood};font-family:${SANS};font-size:16px;color:${C.text}}
.pz-legend>div{display:flex;align-items:center;gap:12px}
.pz-tally{display:flex;justify-content:space-around;max-width:430px;margin:20px auto 0;padding-top:16px;border-top:1px solid ${C.driftwood};text-align:center;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.textLight}}
.pz-tally b{display:block;font-family:${SERIF};font-size:28px;letter-spacing:0;color:${C.dusk};line-height:1.2}
.pz-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.pz-tab:focus-visible,.pz-key:focus-visible,.pz-btn:focus-visible{outline:3px solid ${BLUE};outline-offset:2px}
@media (max-width:400px){.pz-key{height:50px;font-size:15px}.pz-tab{font-size:14px}}
@media (prefers-reduced-motion:reduce){.pz-mark path{animation:none;stroke-dashoffset:0}.pz-cell.pz-miss{animation:none;color:${C.warmGray};background:${C.sand}}.pz-shake{animation:none}}
`;

export default function PuzzlesPage() {
  const { game: slug = '' } = useParams();
  const navigate = useNavigate();
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  const active = GAMES.find(g => g.slug === slug) || GAMES[0];

  const ctx = useMemo(() => {
    const q = new URLSearchParams(window.location.search);
    const forced = /^\d{4}-\d{2}-\d{2}$/.test(q.get('date') || '') ? q.get('date') : null;
    const word = /^[a-z]{5}$/i.test(q.get('word') || '') ? q.get('word').toLowerCase() : null;
    const date = forced || michiganToday();
    return { date, day: dayNumber(date), test: !!(forced || word), word };
  }, []);
  const [finished, setFinished] = useState(() => {
    if (ctx.test) return {};
    const s = readStore(), same = (k) => s[k] && s[k].date === ctx.date;
    return { five: same('five') && !!s.five.done, search: same('search') && !!s.search.done, sudoku: same('sudoku') && !!s.sudoku.done };
  });
  const onDone = useCallback((id) => {
    if (!ctx.test) { const cur = readStore()[id]; if (cur && cur.date === ctx.date && !cur.done) writeStore({ [id]: { ...cur, done: true } }); }
    setFinished(f => (f[id] ? f : { ...f, [id]: true }));
  }, [ctx]);
  const pick = (g) => navigate(`/puzzles${g.slug ? `/${g.slug}` : ''}${window.location.search}`, { replace: false });

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <style>{PUZZLE_CSS}</style>
      <SEOHead
        title={active.id === 'five' ? 'Daily Puzzles' : `${active.label} - Daily Puzzles`}
        description="Three free daily puzzles from Manitou Beach: a five-letter word, a local word search and a sudoku. New every morning, the same for everybody around the lake."
        path={`/puzzles${active.slug ? `/${active.slug}` : ''}`}
      />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <main style={{ maxWidth: 620, margin: '0 auto', padding: '88px 16px 72px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, letterSpacing: 4, textTransform: 'uppercase', color: C.sageDark, marginBottom: 6 }}>The Puzzle Page</div>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 8vw, 46px)', fontWeight: 400, color: C.dusk, margin: '0 0 4px', lineHeight: 1.1 }}>{active.label}</h1>
          <p style={{ fontFamily: SANS, fontSize: 15, color: C.textMuted, margin: '0 0 14px' }}>No. {ctx.day + 1} &nbsp;·&nbsp; {longDate(ctx.date)}</p>
        </div>

        <div role="tablist" aria-label="Choose a puzzle" style={{ display: 'flex', margin: '0 0 18px' }}>
          {GAMES.map(g => (
            <button type="button" role="tab" key={g.id} className="pz-tab" aria-selected={g.id === active.id} onClick={() => pick(g)}>
              {g.label}{finished[g.id] && <span aria-label="done today" style={{ color: g.id === active.id ? C.sunsetLight : RED }}> ✓</span>}
            </button>
          ))}
        </div>

        <section role="tabpanel" aria-label={active.label}>
          {active.id === 'five' && <FiveGame ctx={ctx} onDone={onDone} />}
          {active.id === 'search' && <SearchGame ctx={ctx} onDone={onDone} />}
          {active.id === 'sudoku' && <SudokuGame ctx={ctx} onDone={onDone} />}
        </section>

        <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.6, color: C.textMuted, textAlign: 'center', margin: '44px auto 0', maxWidth: 460 }}>
          Free, just for fun, and new every morning. Your puzzles are saved on this phone or computer, so you can put one down and pick it back up.
        </p>
      </main>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
