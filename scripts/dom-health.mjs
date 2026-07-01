import puppeteer from 'puppeteer';
const BASE = 'https://manitoubeachmichigan.com';
const urls = ['/', '/events', '/food-trucks', '/business'];
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 850 });
for (const u of urls) {
  await p.goto(BASE + u, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  const info = await p.evaluate(() => {
    const imgs = [...document.images];
    const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.slice(-60));
    const vids = [...document.querySelectorAll('video')].map(v => ({ src: (v.currentSrc || v.src || 'none').slice(-60), playing: !v.paused, readyState: v.readyState, w: v.offsetWidth }));
    const h1 = document.querySelector('h1')?.innerText?.slice(0, 80);
    const heroEl = document.elementFromPoint(640, 400);
    const heroBg = heroEl ? getComputedStyle(heroEl).backgroundImage.slice(0, 80) : '';
    const sections = [...document.querySelectorAll('h2')].map(h => h.innerText.trim().slice(0, 50)).slice(0, 20);
    return { title: document.title.slice(0, 70), h1, imgCount: imgs.length, broken, vids, heroTag: heroEl?.tagName, heroBg, sections, height: document.documentElement.scrollHeight };
  });
  console.log('=== ' + u + ' ===');
  console.log(JSON.stringify(info, null, 1));
}
await b.close();
