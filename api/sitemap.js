// Dynamic XML sitemap
// Returns all active business profile URLs + food truck profile URLs + winery profile URLs
// Replaces the static sitemap.xml for dynamic content

import { createHmac } from 'crypto';

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Winery slugs are static (hardcoded data) - keep in sync with src/data/wineries.js
const WINERY_SLUGS = [
  'faust-house-scrap-n-craft',
  'ang-co',
  'manitou-beach-boathouse-art-gallery',
  'devils-lake-view-living',
  'meckleys-flavor-fruit-farm',
  'cherry-creek-cellars',
  'chateau-aeronautique-winery',
  'gypsy-blue-vineyards',
  'grand-river-brewery',
  'black-fire-winery',
];

// Static pages
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/business', priority: '0.9', changefreq: 'weekly' },
  { path: '/food-trucks', priority: '0.9', changefreq: 'daily' },
  { path: '/wineries', priority: '0.8', changefreq: 'monthly' },
  { path: '/village', priority: '0.8', changefreq: 'monthly' },
  { path: '/stays', priority: '0.8', changefreq: 'weekly' },
  { path: '/happening', priority: '0.8', changefreq: 'daily' },
  { path: '/discover', priority: '0.7', changefreq: 'weekly' },
  { path: '/fishing', priority: '0.7', changefreq: 'monthly' },
  { path: '/devils-lake', priority: '0.7', changefreq: 'monthly' },
  { path: '/nightlife', priority: '0.7', changefreq: 'monthly' },
  { path: '/historical-society', priority: '0.6', changefreq: 'monthly' },
  { path: '/dispatch', priority: '0.6', changefreq: 'weekly' },
];

async function fetchAllNotionPages(dbId, token, filterBody) {
  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  let results = [];
  let cursor;
  do {
    const body = cursor ? { ...filterBody, start_cursor: cursor } : filterBody;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) break;
    const data = await res.json();
    results = results.concat(data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return results;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const siteUrl = (process.env.SITE_URL || 'https://manitoubeachmichigan.com').replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];

  const urls = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    urls.push({ loc: `${siteUrl}${page.path}`, changefreq: page.changefreq, priority: page.priority, lastmod: today });
  }

  // ── Business profile pages ──────────────────────────────────────────────
  try {
    const pages = await fetchAllNotionPages(
      process.env.NOTION_DB_BUSINESS,
      process.env.NOTION_TOKEN_BUSINESS,
      {
        filter: {
          and: [
            {
              or: [
                { property: 'Status', status: { equals: 'Listed Free' } },
                { property: 'Status', status: { equals: 'Listed Enhanced' } },
                { property: 'Status', status: { equals: 'Listed Featured' } },
                { property: 'Status', status: { equals: 'Listed Premium' } },
              ],
            },
            { property: 'Category', select: { does_not_equal: 'Stays & Rentals' } },
          ],
        },
      }
    );

    for (const page of pages) {
      const name = page.properties['Name']?.title?.[0]?.text?.content || '';
      if (!name) continue;
      const slug = toSlug(name);
      const lastEdited = page.last_edited_time?.split('T')[0] || today;
      urls.push({
        loc: `${siteUrl}/business/${slug}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: lastEdited,
      });
    }
  } catch (err) {
    console.error('sitemap: business fetch failed:', err.message);
  }

  // ── Food truck profile pages ────────────────────────────────────────────
  try {
    const pages = await fetchAllNotionPages(
      process.env.NOTION_DB_FOOD_TRUCKS,
      process.env.NOTION_TOKEN_BUSINESS,
      {
        filter: { property: 'Status', select: { equals: 'Active' } },
      }
    );

    for (const page of pages) {
      const slug = page.properties['Slug']?.rich_text?.[0]?.text?.content || '';
      if (!slug) continue;
      urls.push({
        loc: `${siteUrl}/food-trucks/${slug}`,
        changefreq: 'daily',
        priority: '0.6',
        lastmod: today,
      });
    }
  } catch (err) {
    console.error('sitemap: food trucks fetch failed:', err.message);
  }

  // ── Winery profile pages (static data) ─────────────────────────────────
  for (const slug of WINERY_SLUGS) {
    urls.push({
      loc: `${siteUrl}/wineries/${slug}`,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: today,
    });
  }

  // ── Build XML ───────────────────────────────────────────────────────────
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u => [
      '  <url>',
      `    <loc>${u.loc}</loc>`,
      `    <lastmod>${u.lastmod}</lastmod>`,
      `    <changefreq>${u.changefreq}</changefreq>`,
      `    <priority>${u.priority}</priority>`,
      '  </url>',
    ].join('\n')),
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
  return res.status(200).send(xml);
}
