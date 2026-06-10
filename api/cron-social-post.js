import { requireCronOrAdmin } from './lib/cronAuth.js';
// GET /api/cron-social-post
// Runs every Thursday 9am ET — posts "This Weekend" event roundup to FB + IG.
// Skips if the GH Actions pipeline already posted today (checks Vercel Blob marker).
// Supports ?preview=1 to return message + imageUrl without posting.

import { head } from '@vercel/blob';

const FB_API = 'https://graph.facebook.com/v25.0';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

// Rotates weekly — each Thursday gets a different branded image for Instagram
const BRANDED_IMAGES = [
  'happening-hero.jpg',
  'explore-Irish-hills.jpg',
  'community-bg.jpg',
  'dispatch-header-web.jpg',
  'landlakes-hero.jpg',
  'foodtruck_hero.jpg',
  'corks-kegs-hero.jpg',
  'holly-yeti-bg.jpg',
];

function getWeeklyImageUrl(siteUrl) {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return `${siteUrl}/images/${BRANDED_IMAGES[weekNum % BRANDED_IMAGES.length]}`;
}

function getWeekendDates() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 6=Sat
  const fri = new Date(now);
  fri.setDate(now.getDate() + (5 - day));
  const sat = new Date(now);
  sat.setDate(now.getDate() + (6 - day));
  const sun = new Date(now);
  sun.setDate(now.getDate() + (7 - day));
  return {
    friday: fri.toISOString().split('T')[0],
    saturday: sat.toISOString().split('T')[0],
    sunday: sun.toISOString().split('T')[0],
  };
}

function friendlyDate(isoDate) {
  const [, , d] = isoDate.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = months[parseInt(isoDate.split('-')[1], 10) - 1];
  return `${m} ${parseInt(d, 10)}`;
}

function fmtTime(time, timeEnd) {
  if (!time) return '';
  return timeEnd ? `${time} - ${timeEnd}` : time;
}

function buildPost(events, siteUrl, dates) {
  const friEvents = events.filter(e => e.day === 'friday');
  const satEvents = events.filter(e => e.day === 'saturday');
  const sunEvents = events.filter(e => e.day === 'sunday');
  const total = events.length;

  const lines = [
    `${total} thing${total !== 1 ? 's' : ''} happening at Manitou Beach this weekend. Pick your adventure.`,
    '',
  ];

  if (friEvents.length) {
    lines.push(`Friday, ${friendlyDate(dates.friday)}:`);
    for (const e of friEvents) {
      const time = fmtTime(e.time, e.timeEnd);
      const loc = e.location ? ` - ${e.location}` : '';
      lines.push(`  ${e.name}${time ? `, ${time}` : ''}${loc}`);
    }
    lines.push('');
  }

  if (satEvents.length) {
    lines.push(`Saturday, ${friendlyDate(dates.saturday)}:`);
    for (const e of satEvents) {
      const time = fmtTime(e.time, e.timeEnd);
      const loc = e.location ? ` - ${e.location}` : '';
      lines.push(`  ${e.name}${time ? `, ${time}` : ''}${loc}`);
    }
    lines.push('');
  }

  if (sunEvents.length) {
    lines.push(`Sunday, ${friendlyDate(dates.sunday)}:`);
    for (const e of sunEvents) {
      const time = fmtTime(e.time, e.timeEnd);
      const loc = e.location ? ` - ${e.location}` : '';
      lines.push(`  ${e.name}${time ? `, ${time}` : ''}${loc}`);
    }
    lines.push('');
  }

  lines.push(`Full details + food truck locator: ${siteUrl}/events`);
  lines.push('');
  lines.push(`Your event not here? It could be - list it free: ${siteUrl}/events`);
  lines.push('');
  lines.push('#ManitouBeachMI #DevilsLakeMI #WeekendPlans #MichiganEvents #LakeLife #IrishHills');

  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authorized callers: Vercel cron (Bearer CRON_SECRET) or the admin UI (X-Admin-Token)
  if (!requireCronOrAdmin(req, res)) return;

  const preview = req.query?.preview === '1' || req.query?.preview === 'true';
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const pageId = process.env.META_PAGE_ID || process.env.FB_PAGE_ID;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
  const igAccountId = process.env.META_IG_ACCOUNT_ID || process.env.IG_BUSINESS_ACCOUNT_ID;

  if (!preview && (!pageId || !pageToken)) {
    console.error('cron-social-post: META credentials not configured');
    return res.status(500).json({ error: 'META credentials not configured' });
  }

  // Skip if the GH Actions video pipeline already ran today
  try {
    const today = new Date().toISOString().split('T')[0];
    await head(`thursday-post-${today}.json`, { token: process.env.BLOB_READ_WRITE_TOKEN });
    console.log('cron-social-post: video already posted today via GH Actions – skipping text fallback');
    return res.status(200).json({ skipped: true, reason: 'Video post already made today by GH Actions' });
  } catch {
    // marker not found – proceed with text fallback
  }

  const dates = getWeekendDates();
  const { friday, saturday, sunday } = dates;

  // Fetch weekend events from Notion
  let events = [];
  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
      {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: {
            and: [
              {
                or: [
                  { property: 'Status', status: { equals: 'Approved' } },
                  { property: 'Status', status: { equals: 'Published' } },
                ],
              },
              {
                or: [
                  { property: 'Event date', date: { equals: friday } },
                  { property: 'Event date', date: { equals: saturday } },
                  { property: 'Event date', date: { equals: sunday } },
                ],
              },
            ],
          },
          sorts: [{ property: 'Event date', direction: 'ascending' }],
        }),
      }
    );

    if (!notionRes.ok) throw new Error(`Notion error ${notionRes.status}`);
    const notionData = await notionRes.json();

    events = (notionData.results || []).map(page => {
      const p = page.properties;
      const date = p['Event date']?.date?.start || '';
      return {
        name: p['Event Name']?.title?.[0]?.text?.content || '',
        date,
        day: date === friday ? 'friday' : date === saturday ? 'saturday' : 'sunday',
        time: p['Time']?.rich_text?.[0]?.text?.content || '',
        timeEnd: p['Time End']?.rich_text?.[0]?.text?.content || '',
        location: p['Location']?.rich_text?.[0]?.text?.content || '',
      };
    }).filter(e => e.name);
  } catch (err) {
    console.error('cron-social-post: Notion fetch error:', err.message);
    return res.status(200).json({ skipped: true, reason: 'Notion fetch failed', error: err.message });
  }

  if (!events.length) {
    console.log(`cron-social-post: no events for ${saturday} or ${sunday}, skipping`);
    return res.status(200).json({ skipped: true, reason: 'No events this weekend' });
  }

  const message = buildPost(events, siteUrl, dates);
  const imageUrl = getWeeklyImageUrl(siteUrl);

  // Preview mode — return without posting
  if (preview) {
    return res.status(200).json({ message, imageUrl, events: events.length, saturday, sunday });
  }

  const results = {};
  const errors = {};

  // Post to Facebook Page with branded image
  try {
    const fbRes = await fetch(`${FB_API}/${pageId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, url: imageUrl, access_token: pageToken }),
    });
    const fbData = await fbRes.json();
    if (fbData.error) throw new Error(fbData.error.message);
    results.facebook = fbData.id;
  } catch (err) {
    console.error('cron-social-post: Facebook error:', err.message);
    errors.facebook = err.message;
  }

  // Post to Instagram (requires image — use rotating branded image)
  if (igAccountId) {
    try {
      // Step 1: Create media container
      const containerRes = await fetch(`${FB_API}/${igAccountId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl, caption: message, access_token: pageToken }),
      });
      const containerData = await containerRes.json();
      if (containerData.error) throw new Error(containerData.error.message);

      // Step 2: Publish
      const publishRes = await fetch(`${FB_API}/${igAccountId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerData.id, access_token: pageToken }),
      });
      const publishData = await publishRes.json();
      if (publishData.error) throw new Error(publishData.error.message);
      results.instagram = publishData.id;
    } catch (err) {
      console.error('cron-social-post: Instagram error:', err.message);
      errors.instagram = err.message;
    }
  }

  const hasSuccess = Object.keys(results).length > 0;
  console.log(`cron-social-post: done — FB:${results.facebook || 'err'} IG:${results.instagram || errors.instagram || 'skipped'} events:${events.length}`);
  return res.status(200).json({ success: hasSuccess, results, ...(Object.keys(errors).length && { errors }), events: events.length });
}
