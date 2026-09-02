// ============================================================
// 🖨️  Poster generator  —  node scripts/make-poster.mjs <snapKey>
// ------------------------------------------------------------
// Builds the print-ready 24x36 "share your shots" A-frame poster
// for a snap key (see api/lib/snap-keys.js), plus a PNG proof.
//
// Output: marketing/posters/<key>-poster.pdf   (vector, with bleed)
//         marketing/posters/<key>-poster.png   (proof, screen only)
//
// Why a PDF and not a big PNG: everything except the logo badge is
// type or an SVG QR, so the PDF stays vector and prints crisp at any
// size. A 24x36 raster at 300dpi would be a 7200x10800 monster and
// would still print softer.
//
// Print spec:
//   trim 24 x 36 in, 0.125 in bleed on all sides (24.25 x 36.25)
//   1.5 in safe inset — an A-frame's lip eats roughly half an inch
//   and crowding the edge looks like a mistake.
//
// Layout is driven by where the thing physically sits: an A-frame
// panel starts a few inches off the ground, so the QR is placed in
// the upper-middle where it lands around chest height. Anything in
// the bottom third is at ankle height and is trust marks only.
// ============================================================

import { writeFileSync, readFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import QRCode from 'qrcode';
import { MENS_CLUB_YEARLY_SPONSORS } from '../src/data/mensClubSponsors.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'marketing', 'posters');

const SITE = 'https://manitoubeachmichigan.com';

// Per-poster copy. The headline is deliberately season-neutral: this board
// works at the October golf outing, February tip-up and the July 7K, so
// nothing here may reference a month, a sport, or the weather.
const POSTERS = {
  mensclub: {
    org: 'Devils Lake & Round Lake Men’s Club',
    headline: ['SHARE YOUR', 'SHOTS'],
    sub: 'Straight to the Men’s Club page, where everyone can find them.',
    logo: 'public/images/mens_club_logo.png',
    sponsorTitle: '2026 – 2027 Yearly Sponsors',
    sponsors: MENS_CLUB_YEARLY_SPONSORS.map((s) => s.name),
  },
  ladiesclub: {
    org: 'Manitou Beach Ladies Club',
    headline: ['SHARE YOUR', 'SHOTS'],
    sub: 'Straight to the Ladies Club page, where everyone can find them.',
    logo: null,
  },
};

const key = process.argv[2] || 'mensclub';
const theme = (process.argv[3] || 'light').toLowerCase();
if (!['light', 'dark'].includes(theme)) {
  console.error(`Unknown theme "${theme}". Use light or dark.`);
  process.exit(1);
}
const suffix = theme === 'dark' ? '-dark' : '';
const cfg = POSTERS[key];
if (!cfg) {
  console.error(`No poster copy for "${key}". Known: ${Object.keys(POSTERS).join(', ')}`);
  process.exit(1);
}

const url = `${SITE}/snap/${key}`;
const prettyUrl = url.replace(/^https:\/\//, '');

// Q, not H: for this payload length Q and M both land on version 4 (33x33),
// so Q's stronger error correction is free, while H would push to 41x41 and
// shrink every module. Fatter modules scan from further away, which matters
// more on a board in a field than resilience does. At 12.2in across, 33
// modules plus an 8-module quiet zone give 0.28in each, scannable from
// roughly seven feet.
// margin: 4 puts the spec-required 4-module quiet zone inside the SVG itself.
// With margin 0 the only quiet zone was the white panel's padding, about 2.6
// modules, which is under spec and makes a printed code flaky for no visible
// reason. The quiet zone costs module size, and that is the right trade.
const qrSvg = await QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'Q', margin: 4 });

let logoTag = '';
if (cfg.logo) {
  const b64 = readFileSync(join(ROOT, cfg.logo)).toString('base64');
  logoTag = `<span class="logocard"><img class="logo" src="data:image/png;base64,${b64}" alt=""></span>`;
}

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  @page { size: 24.25in 36.25in; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }

  /* Semantic tokens so the two themes are the same layout, not two designs.
     The QR panel stays white in both: the code needs maximum contrast and a
     white block is also what tells people across a field where to point. */
  :root {
${theme === 'dark' ? `
    --ground:       #1A2830;
    --ink:          #FAF6EF;
    --ink-strong:   #FAF6EF;
    --ink-soft:     rgba(250,246,239,0.74);
    --ink-faint:    rgba(250,246,239,0.46);
    --accent:       #E8A87C;
    --panel-edge:   rgba(250,246,239,0.30);
    --panel-shadow: rgba(0,0,0,0.38);
    --logo-edge:    rgba(250,246,239,0.28);
` : `
    --ground:       #FAF6EF;
    --ink:          #3D5A6E;
    --ink-strong:   #2D3B45;
    --ink-soft:     #6B6052;
    --ink-faint:    #9A8E7E;
    --accent:       #D4845A;
    --panel-edge:   rgba(61,90,110,0.55);
    --panel-shadow: rgba(61,90,110,0.16);
    --logo-edge:    rgba(61,90,110,0.28);
`}  }

  body { width: 24.25in; height: 36.25in; background: var(--ground); }

  /* Bleed wrapper: art runs to the edge, trim line sits 0.125in in. */
  .bleed { width: 24.25in; height: 36.25in; background: var(--ground); padding: 0.125in; }
  .trim  { width: 24in; height: 36in; position: relative; overflow: hidden;
           display: flex; flex-direction: column; align-items: center;
           padding: 1.5in 1.5in 1.6in; }

  /* A thin sunset rule top and bottom keeps the cream from reading as blank. */
  .trim::before, .trim::after {
    content: ''; position: absolute; left: 1.5in; right: 1.5in; height: 0.05in;
    background: var(--accent);
  }
  .trim::before { top: 0.85in; }
  .trim::after  { bottom: 0.85in; }

  .brand {
    display: flex; align-items: center; justify-content: center; gap: 0.45in;
  }
  .logocard {
    background: #fff; border: 0.03in solid var(--logo-edge);
    border-radius: 0.17in; padding: 0.13in; display: block; flex: none;
  }
  .logo { width: 1.75in; height: 1.75in; border-radius: 0.07in; display: block; }
  .brandname {
    font-family: 'Libre Franklin', sans-serif; font-weight: 700;
    font-size: 0.5in; letter-spacing: 0.05em; color: var(--accent);
    text-transform: uppercase; text-align: left; line-height: 1.2;
  }

  h1 {
    font-family: 'Libre Franklin', sans-serif; font-weight: 900;
    font-size: 3.1in; line-height: 0.92; letter-spacing: -0.018em;
    color: var(--ink); text-align: center; text-transform: uppercase;
    margin-top: 0.5in;
  }

  .sub {
    font-family: 'Libre Baskerville', serif; font-size: 0.6in; line-height: 1.5;
    color: var(--ink-soft); text-align: center; max-width: 17in; margin-top: 0.45in;
  }

  /* QR panel. White ground, not cream: scanners want maximum contrast and
     the panel also tells people at a glance that this is the thing to point at. */
  .qrpanel {
    margin-top: 0.6in; width: 12.2in; height: 12.2in; flex: none; background: #fff;
    border: 0.055in solid var(--panel-edge); border-radius: 0.35in;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0.09in 0 var(--panel-shadow);
  }
  .qrpanel svg { width: 11.6in; height: 11.6in; display: block; shape-rendering: crispEdges; }

  .url {
    font-family: 'Libre Franklin', sans-serif; font-weight: 800;
    font-size: 0.72in; letter-spacing: -0.005em; color: var(--ink-strong);
    text-align: center; margin-top: 0.55in; line-height: 1.25;
  }
  .url .slug { color: var(--accent); }
  .url .typeit {
    display: block; font-weight: 600; font-size: 0.34in; letter-spacing: 0.02em;
    color: var(--ink-faint); text-transform: uppercase; margin-top: 0.14in;
  }

  .steps {
    margin-top: 0.6in; display: flex; align-items: flex-start;
    justify-content: center; gap: 0.9in;
  }
  .spacer { flex: 1 1 auto; min-height: 0.2in; }
  .step { text-align: center; width: 5.6in; }
  .step .n {
    font-family: 'Libre Franklin', sans-serif; font-weight: 900; font-size: 0.86in;
    color: var(--accent); line-height: 1; display: block;
  }
  .step .t {
    font-family: 'Libre Baskerville', serif; font-size: 0.45in; line-height: 1.35;
    color: var(--ink-soft); margin-top: 0.16in; display: block;
  }

  .sponsors { margin-top: 0.7in; width: 100%; text-align: center; }
  .sponsors .head {
    font-family: 'Libre Franklin', sans-serif; font-weight: 700; font-size: 0.3in;
    letter-spacing: 0.09em; text-transform: uppercase; color: var(--accent);
    margin-bottom: 0.22in;
  }
  .sponsors .head span { color: var(--ink-faint); letter-spacing: 0.04em; }
  .sponsors .names {
    font-family: 'Libre Franklin', sans-serif; font-weight: 600; font-size: 0.26in;
    line-height: 1.55; color: var(--ink-soft); max-width: 20.2in; margin: 0 auto;
  }
  .sponsors .names span { white-space: nowrap; }
  .sponsors .names i { font-style: normal; color: var(--accent); opacity: 0.55; }

</style></head>
<body><div class="bleed"><div class="trim">

  <div class="brand">
    ${logoTag}
    <div class="brandname">${cfg.org}</div>
  </div>

  <h1>${cfg.headline.map((l) => `<span style="display:block">${l}</span>`).join('')}</h1>

  <p class="sub">${cfg.sub}</p>

  <div class="qrpanel">${qrSvg}</div>

  <div class="url">
    ${prettyUrl.split('/snap/')[0]}<span class="slug">/snap/${key}</span>
    <span class="typeit">or type it into your phone</span>
  </div>

  <div class="steps">
    <div class="step"><span class="n">1</span><span class="t">Point your camera at the square</span></div>
    <div class="step"><span class="n">2</span><span class="t">Pick the photos you like</span></div>
    <div class="step"><span class="n">3</span><span class="t">They’re on the page in seconds</span></div>
  </div>

  <div class="spacer"></div>

  ${cfg.sponsors ? `<div class="sponsors">
    <div class="head">${cfg.sponsorTitle} <span>· thank you</span></div>
    <div class="names">${cfg.sponsors.map((n) => `<span>${n.replace(/&/g, '&amp;')}</span>`).join(' <i>·</i> ')}</div>
  </div>` : ''}


</div></div></body></html>`;

mkdirSync(OUT, { recursive: true });
const htmlPath = join(OUT, `${key}-poster${suffix}.html`);
writeFileSync(htmlPath, html);

// Playwright lives in the npx cache on this machine rather than as a dep here.
const npxRoot = `${process.env.HOME}/.npm/_npx`;
const pwPath = (existsSync(npxRoot) ? readdirSync(npxRoot) : [])
  .map((d) => `${npxRoot}/${d}/node_modules/playwright/index.js`)
  .find((f) => existsSync(f));
if (!pwPath) {
  console.log(`HTML written to ${htmlPath}`);
  console.error('Playwright not found — open the HTML and print to PDF manually.');
  process.exit(0);
}
// The npx-cached build exposes the API on the default export, not as named ones.
const pw = await import(pwPath);
const chromium = pw.chromium || pw.default?.chromium;

// The npx-cached Playwright and the installed browsers drift apart, so use
// whichever headless shell is actually on disk rather than the pinned revision.
const shellRoot = `${process.env.HOME}/Library/Caches/ms-playwright`;
const shell = (existsSync(shellRoot) ? readdirSync(shellRoot) : [])
  .filter((d) => d.startsWith('chromium_headless_shell-'))
  .sort()
  .reverse()
  .map((d) => `${shellRoot}/${d}/chrome-headless-shell-mac-arm64/chrome-headless-shell`)
  .find((f) => existsSync(f));

const browser = await chromium.launch(shell ? { executablePath: shell } : {});
const page = await browser.newPage({ viewport: { width: 1600, height: 2400 } });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// Fit check before anything is written. `.trim` clips its overflow, so a poster
// that is too tall does not look broken in code, it looks fine right up until
// the bottom rule crosses the last line of type. This caught exactly that.
const fit = await page.evaluate(() => {
  const inches = (px) => +(px / 96).toFixed(2);
  const trim = document.querySelector('.trim');
  const kids = [...trim.children];
  const last = kids[kids.length - 1];
  return {
    overflow: inches(trim.scrollHeight - trim.getBoundingClientRect().height),
    contentEnd: inches(last.offsetTop + last.getBoundingClientRect().height),
    ruleAt: 36 - 0.85,
  };
});
const clearance = +(fit.ruleAt - fit.contentEnd).toFixed(2);
if (fit.overflow > 0 || clearance < 0.3) {
  await browser.close();
  console.error(`✗ ${key}: content does not fit the trim box.`);
  console.error(`  overflow ${fit.overflow}in, content ends ${fit.contentEnd}in, bottom rule ${fit.ruleAt}in (clearance ${clearance}in).`);
  console.error('  Shrink .qrpanel or the type; nothing was written.');
  process.exit(1);
}

await page.pdf({
  path: join(OUT, `${key}-poster${suffix}.pdf`),
  width: '24.25in', height: '36.25in',
  printBackground: true, pageRanges: '1',
});

// Proof render. Wide enough that the QR in the PNG still decodes: at 1212px
// the modules softened past the point a scanner could read them, and the proof
// is the thing you point a phone at to test before paying a printer.
const PROOF_W = 1800;
await page.setViewportSize({ width: PROOF_W, height: Math.round(PROOF_W * 36.25 / 24.25) });
await page.evaluate((w) => { document.body.style.zoom = String(w / (24.25 * 96)); }, PROOF_W);
await page.screenshot({ path: join(OUT, `${key}-poster${suffix}.png`), fullPage: false });

await browser.close();
console.log(`✓ ${key} (${theme}): PDF + PNG proof in marketing/posters/`);
console.log(`  fit: content ends ${fit.contentEnd}in, ${clearance}in clear of the bottom rule`);
console.log(`  QR target: ${url}`);
