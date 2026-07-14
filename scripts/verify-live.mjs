import puppeteer from 'puppeteer';
const BASE = 'https://manitoubeachmichigan.com';
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 900 });

// 1. Paid profile: claim modules gone?
await p.goto(BASE + '/business/blackbird-cafe', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2500));
const claim = await p.evaluate(() => document.body.innerText.match(/Claim (This Listing|your listing)/gi)?.length || 0);
console.log('blackbird claim modules:', claim);

// 2. Test business gone from home?
await p.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));
console.log('Yeti Test Business on home:', await p.evaluate(() => document.body.innerText.includes('Yeti Test Business')));

// 3. End-key navbar check
await p.keyboard.press('End');
await new Promise(r => setTimeout(r, 2000));
const nav = await p.evaluate(() => {
  const n = document.querySelector('nav, header');
  const r2 = n.getBoundingClientRect();
  const white = document.elementFromPoint(720, 300);
  return { navTop: Math.round(r2.top), bottomEl: white ? white.tagName + '.' + String(white.className).slice(0, 25) : 'none' };
});
console.log('after End:', JSON.stringify(nav));

// 4. Events hero video + ops banner on event detail
await p.goto(BASE + '/events', { waitUntil: 'domcontentloaded', timeout: 60000 });
await new Promise(r => setTimeout(r, 3000));
console.log('events video:', await p.evaluate(() => [...document.querySelectorAll('video')].map(v => (v.currentSrc || 'none').split('/').pop() + ' preload=' + v.preload + ' poster=' + !!v.poster)));
await p.goto(BASE + '/events/3328c729-eb59-81c6-82c3-d8a08533dc73', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2000));
console.log('event detail:', await p.evaluate(() => ({ opsBannerFirst: (document.querySelector('main, body').innerText.slice(0, 600).includes('Is this your event')), hasCalendar: document.body.innerText.includes('Calendar') })));

// 5. Truck profile: loves + no claim box
await p.goto(BASE + '/food-trucks/bussin-bowls', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 2000));
console.log('truck profile:', await p.evaluate(() => ({ claimBox: document.body.innerText.includes('CLAIM THIS LISTING') || document.body.innerText.includes('Claim This Listing'), loves: document.body.innerText.match(/Love|loved/i) !== null, findUs: document.body.innerText.match(/Find Us/i) !== null })));
await b.close();
