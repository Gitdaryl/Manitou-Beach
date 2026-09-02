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
// modules plus an 8-module quiet zone give 0.29in each, scannable from
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

  :root {
    --cream:    #FAF6EF;
    --navy:     #3D5A6E;
    --dusk:     #2D3B45;
    --sunset:   #D4845A;
    --text:     #3B3228;
    --light:    #6B6052;
    --muted:    #9A8E7E;
  }

  body { width: 24.25in; height: 36.25in; background: var(--cream); }

  /* Bleed wrapper: art runs to the edge, trim line sits 0.125in in. */
  .bleed { width: 24.25in; height: 36.25in; background: var(--cream); padding: 0.125in; }
  .trim  { width: 24in; height: 36in; position: relative; overflow: hidden;
           display: flex; flex-direction: column; align-items: center;
           padding: 1.5in 1.5in 1.35in; }

  /* A thin sunset rule top and bottom keeps the cream from reading as blank. */
  .trim::before, .trim::after {
    content: ''; position: absolute; left: 1.5in; right: 1.5in; height: 0.05in;
    background: var(--sunset);
  }
  .trim::before { top: 0.85in; }
  .trim::after  { bottom: 0.85in; }

  .eyebrow {
    font-family: 'Libre Franklin', sans-serif; font-weight: 700;
    font-size: 0.46in; letter-spacing: 0.055em; color: var(--sunset);
    text-transform: uppercase; text-align: center; line-height: 1.2;
  }

  h1 {
    font-family: 'Libre Franklin', sans-serif; font-weight: 900;
    font-size: 3.1in; line-height: 0.92; letter-spacing: -0.018em;
    color: var(--navy); text-align: center; text-transform: uppercase;
    margin-top: 0.5in;
  }

  .sub {
    font-family: 'Libre Baskerville', serif; font-size: 0.6in; line-height: 1.5;
    color: var(--light); text-align: center; max-width: 17in; margin-top: 0.45in;
  }

  /* QR panel. White ground, not cream: scanners want maximum contrast and
     the panel also tells people at a glance that this is the thing to point at. */
  .qrpanel {
    margin-top: 0.5in; width: 12.6in; height: 12.6in; background: #fff;
    border: 0.055in solid var(--navy); border-radius: 0.35in;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0.09in 0 rgba(61,90,110,0.16);
  }
  .qrpanel svg { width: 12in; height: 12in; display: block; shape-rendering: crispEdges; }

  .url {
    font-family: 'Libre Franklin', sans-serif; font-weight: 800;
    font-size: 0.72in; letter-spacing: -0.005em; color: var(--dusk);
    text-align: center; margin-top: 0.55in; line-height: 1.25;
  }
  .url .slug { color: var(--sunset); }
  .url .typeit {
    display: block; font-weight: 600; font-size: 0.34in; letter-spacing: 0.02em;
    color: var(--muted); text-transform: uppercase; margin-top: 0.14in;
  }

  .steps {
    margin-top: 0.6in; display: flex; align-items: flex-start;
    justify-content: center; gap: 0.9in;
  }
  .spacer { flex: 1 1 auto; min-height: 0.2in; }
  .step { text-align: center; width: 5.6in; }
  .step .n {
    font-family: 'Libre Franklin', sans-serif; font-weight: 900; font-size: 0.86in;
    color: var(--sunset); line-height: 1; display: block;
  }
  .step .t {
    font-family: 'Libre Baskerville', serif; font-size: 0.45in; line-height: 1.35;
    color: var(--light); margin-top: 0.16in; display: block;
  }

  .sponsors { margin-top: 0.7in; width: 100%; text-align: center; }
  .sponsors .head {
    font-family: 'Libre Franklin', sans-serif; font-weight: 700; font-size: 0.3in;
    letter-spacing: 0.09em; text-transform: uppercase; color: var(--sunset);
    margin-bottom: 0.22in;
  }
  .sponsors .head span { color: var(--muted); letter-spacing: 0.04em; }
  .sponsors .names {
    font-family: 'Libre Franklin', sans-serif; font-weight: 600; font-size: 0.26in;
    line-height: 1.55; color: var(--light); max-width: 20.2in; margin: 0 auto;
  }
  .sponsors .names span { white-space: nowrap; }
  .sponsors .names i { font-style: normal; color: var(--sunset); opacity: 0.55; }

  .foot {
    margin-top: 0.7in; display: flex; align-items: center;
    justify-content: center; gap: 0.5in;
  }
  .logocard {
    background: #fff; border: 0.035in solid rgba(61,90,110,0.3);
    border-radius: 0.2in; padding: 0.16in; display: block;
  }
  .logo { width: 2.3in; height: 2.3in; border-radius: 0.08in; display: block; }
  .footwords { text-align: left; }
  .footwords .site {
    font-family: 'Libre Franklin', sans-serif; font-weight: 800; font-size: 0.5in;
    color: var(--navy); line-height: 1.3; letter-spacing: -0.004em;
  }
  .footwords .site em {
    display: block; font-style: normal; font-weight: 600; font-size: 0.34in;
    color: var(--muted); margin-top: 0.09in; letter-spacing: 0.02em;
  }
</style></head>
<body><div class="bleed"><div class="trim">

  <div class="eyebrow">${cfg.org}</div>

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

  <div class="foot">
    ${logoTag}
    <div class="footwords">
      <div class="site">Your photos live here<em>${prettyUrl.split('/')[0]}</em></div>
    </div>
  </div>

</div></div></body></html>`;

mkdirSync(OUT, { recursive: true });
const htmlPath = join(OUT, `${key}-poster.html`);
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

await page.pdf({
  path: join(OUT, `${key}-poster.pdf`),
  width: '24.25in', height: '36.25in',
  printBackground: true, pageRanges: '1',
});

// Proof render. Wide enough that the QR in the PNG still decodes: at 1212px
// the modules softened past the point a scanner could read them, and the proof
// is the thing you point a phone at to test before paying a printer.
const PROOF_W = 1800;
await page.setViewportSize({ width: PROOF_W, height: Math.round(PROOF_W * 36.25 / 24.25) });
await page.evaluate((w) => { document.body.style.zoom = String(w / (24.25 * 96)); }, PROOF_W);
await page.screenshot({ path: join(OUT, `${key}-poster.png`), fullPage: false });

await browser.close();
console.log(`✓ ${key}: PDF + PNG proof in marketing/posters/`);
console.log(`  QR target: ${url}`);
