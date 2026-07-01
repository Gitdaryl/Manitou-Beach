import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE = 'https://manitoubeachmichigan.com';
const OUT = '/tmp/mbshots';
fs.mkdirSync(OUT, { recursive: true });

const pages = [
  { name: 'home', url: '/' },
  { name: 'events', url: '/events' },
  { name: 'foodtrucks', url: '/food-trucks' },
  { name: 'businessdir', url: '/business' },
];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 850 });

const errors = {};
page.on('console', m => { if (m.type() === 'error') (errors[page.url()] ||= []).push(m.text().slice(0, 200)); });
page.on('requestfailed', r => (errors[page.url()] ||= []).push('REQFAIL ' + r.url().slice(0, 120)));

async function shoot(name, url, scrolls = [0, 0.35, 0.7]) {
  await page.goto(BASE + url, { waitUntil: 'networkidle2', timeout: 45000 }).catch(e => console.log('NAV ERR', url, e.message));
  await new Promise(r => setTimeout(r, 2500));
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let i = 0; i < scrolls.length; i++) {
    await page.evaluate(y => window.scrollTo(0, y), Math.floor(h * scrolls[i]));
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: `${OUT}/${name}-${i}.jpg`, type: 'jpeg', quality: 45 });
  }
  console.log(name, 'height:', h);
}

for (const p of pages) await shoot(p.name, p.url);

// grab first profile links
const bizSlug = await page.evaluate(() => (document.querySelector('a[href^="/business/"]') || {}).getAttribute?.('href'));
await page.goto(BASE + '/food-trucks', { waitUntil: 'networkidle2' });
const ftSlug = await page.evaluate(() => (document.querySelector('a[href^="/food-trucks/"]:not([href*="qr"])') || {}).getAttribute?.('href'));
console.log('bizSlug', bizSlug, 'ftSlug', ftSlug);
if (bizSlug) await shoot('bizprofile', bizSlug, [0, 0.4]);
if (ftSlug) await shoot('ftprofile', ftSlug, [0, 0.4]);

fs.writeFileSync(`${OUT}/errors.json`, JSON.stringify(errors, null, 2));
console.log('ERRORS', JSON.stringify(errors).slice(0, 3000));
await browser.close();
