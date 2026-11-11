import { put, list, del } from '@vercel/blob';

const BLOB_PREFIX = 'analytics/views';

async function readCurrent() {
  const { blobs } = await list({ prefix: BLOB_PREFIX, token: process.env.BLOB_READ_WRITE_TOKEN });
  if (!blobs.length) return { bizViews: {}, pageViews: {}, monthly: {} };
  const res = await fetch(blobs[0].url);
  return res.ok ? res.json() : { bizViews: {}, pageViews: {}, monthly: {} };
}

async function writeCurrent(data) {
  const { blobs } = await list({ prefix: BLOB_PREFIX, token: process.env.BLOB_READ_WRITE_TOKEN });
  const payload = { ...data, updatedAt: new Date().toISOString() };
  await put('analytics/views/data.json', JSON.stringify(payload), {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: true,
  });
  if (blobs.length) await del(blobs.map(b => b.url), { token: process.env.BLOB_READ_WRITE_TOKEN });
}

// A view counts as human only from a US or Canadian IP, a browser user agent that is not a
// known crawler or headless tool, a client that reports navigator.webdriver false (wd: false),
// and not the listing's own owner checking their page (owner: true).
// The raw counters above stay as they were; humanMonthly is the one safe to show an owner.
const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|bingpreview|python|curl|wget|httpclient|axios|node-fetch|go-http|java\/|playwright|puppeteer|phantom|selenium|scrapy|semrush|ahrefs|mj12|dotbot|petal|yandex|baidu/i;

function isHumanView(req, body) {
  const country = String(req.headers['x-vercel-ip-country'] || '').toUpperCase();
  if (country !== 'US' && country !== 'CA') return false;
  const ua = String(req.headers['user-agent'] || '');
  if (!ua || !/Mozilla\//.test(ua) || BOT_UA.test(ua)) return false;
  if (body.wd !== false) return false;
  if (body.owner === true) return false;
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { page, slug } = req.body || {};
  if (!page || !slug) return res.status(400).json({ error: 'Missing page or slug' });

  const month = new Date().toISOString().slice(0, 7); // "2026-06"

  try {
    const data = await readCurrent();

    // Per-business/profile view counts
    const key = `${page}:${slug}`;
    if (!data.bizViews[key]) data.bizViews[key] = { total: 0, name: slug, type: page };
    data.bizViews[key].total += 1;

    // Monthly breakdown
    if (!data.monthly[key]) data.monthly[key] = {};
    data.monthly[key][month] = (data.monthly[key][month] || 0) + 1;

    // Bot-filtered monthly count
    if (isHumanView(req, req.body || {})) {
      if (!data.humanMonthly) data.humanMonthly = {};
      if (!data.humanMonthly[key]) data.humanMonthly[key] = {};
      data.humanMonthly[key][month] = (data.humanMonthly[key][month] || 0) + 1;
    }

    // Page-level totals
    if (!data.pageViews[page]) data.pageViews[page] = 0;
    data.pageViews[page] += 1;

    await writeCurrent(data);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('track-view error:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
}
