import puppeteer from 'puppeteer';
const BASE = 'https://manitoubeachmichigan.com';
const urls = ['/events','/food-trucks','/business/blackbird-cafe','/food-trucks/bussin-bowls','/events/3328c729-eb59-81c6-82c3-d8a08533dc73'];
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await p.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
for (const u of urls) {
  await p.goto(BASE + u, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  const r = await p.evaluate(() => {
    const overflow = document.documentElement.scrollWidth;
    const offenders = [];
    document.querySelectorAll('body *').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 395 && rect.right > 400 && offenders.length < 5) offenders.push(el.tagName + '.' + (el.className || '').toString().slice(0, 30) + ' w=' + Math.round(rect.width));
    });
    const nav = document.querySelector('nav, header');
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const burger = !![...document.querySelectorAll('button')].find(b => (b.getAttribute('aria-label') || b.className || '').toString().match(/menu|burger|nav/i));
    const h1 = document.querySelector('h1');
    const h1size = h1 ? getComputedStyle(h1).fontSize : null;
    const tap = [...document.querySelectorAll('a,button')].filter(el => { const r2 = el.getBoundingClientRect(); return r2.width > 0 && r2.height > 0 && r2.height < 32 && r2.top < 900; }).length;
    return { scrollW: overflow, hOverflow: overflow > 395, offenders, navH: Math.round(navH), burger, h1size, smallTapTargets: tap };
  });
  console.log(u, JSON.stringify(r));
}
await b.close();
