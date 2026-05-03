// GET /api/cron-social-post
// Runs every Thursday 9am ET — posts "This Weekend" event roundup to Facebook Page.
// Instagram feed posts require an image; Phase 2 will add AI-generated images for IG.

const FB_API = 'https://graph.facebook.com/v25.0';

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

function getWeekendDates() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 6=Sat
  const sat = new Date(now);
  sat.setDate(now.getDate() + (6 - day));
  const sun = new Date(now);
  sun.setDate(now.getDate() + (7 - day));
  return {
    saturday: sat.toISOString().split('T')[0],
    sunday: sun.toISOString().split('T')[0],
  };
}

function fmtTime(time, timeEnd) {
  if (!time) return '';
  return timeEnd ? `${time} - ${timeEnd}` : time;
}

function buildPost(events, siteUrl) {
  const satEvents = events.filter(e => e.day === 'saturday');
  const sunEvents = events.filter(e => e.day === 'sunday');

  const lines = ['Weekend plans? We have you covered.', ''];

  if (satEvents.length) {
    lines.push('Saturday:');
    for (const e of satEvents) {
      const time = fmtTime(e.time, e.timeEnd);
      const loc = e.location ? ` @ ${e.location}` : '';
      lines.push(`  ${e.name}${time ? ` (${time})` : ''}${loc}`);
    }
  }

  if (satEvents.length && sunEvents.length) lines.push('');

  if (sunEvents.length) {
    lines.push('Sunday:');
    for (const e of sunEvents) {
      const time = fmtTime(e.time, e.timeEnd);
      const loc = e.location ? ` @ ${e.location}` : '';
      lines.push(`  ${e.name}${time ? ` (${time})` : ''}${loc}`);
    }
  }

  lines.push('');
  lines.push(`Full details: ${siteUrl}/events`);
  lines.push('');
  lines.push('#ManitouBeach #ManitouBeachMichigan #IrishHills #Michigan #LakeLife #ThisWeekend');

  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const pageId = process.env.META_PAGE_ID || process.env.FB_PAGE_ID;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageId || !pageToken) {
    console.error('cron-social-post: META credentials not configured');
    return res.status(500).json({ error: 'META credentials not configured' });
  }

  const { saturday, sunday } = getWeekendDates();

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
        day: date === saturday ? 'saturday' : 'sunday',
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

  const message = buildPost(events, siteUrl);

  // Post to Facebook Page
  try {
    const fbRes = await fetch(`${FB_API}/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, access_token: pageToken }),
    });

    const fbData = await fbRes.json();
    if (fbData.error) throw new Error(fbData.error.message);

    console.log(`cron-social-post: posted to Facebook (${fbData.id}), ${events.length} events`);
    return res.status(200).json({ success: true, facebookId: fbData.id, events: events.length });
  } catch (err) {
    console.error('cron-social-post: Facebook post error:', err.message);
    return res.status(200).json({ success: false, error: err.message });
  }
}
