// GET /api/cron-newsletter-draft
// Runs every Wednesday at 7pm ET (23:00 UTC)
// Pulls upcoming weekend events, generates AI content via Haiku,
// creates a beehiiv post scheduled for Thursday 9am ET,
// writes a Notion Dispatch article, and emails Daryl a preview link.
// Supports ?preview=1 to return generated content without publishing.

import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const BEEHIIV_BASE = 'https://api.beehiiv.com/v2';
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID;

const NOTION_EVENTS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};
const NOTION_DISPATCH = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const YETI_VOICE = `You are The Yeti - the editorial voice of The Manitou Dispatch, a weekly community newsletter for Manitou Beach and Devils Lake, Michigan.
Your writing style: warm, genuinely witty, conversational but polished. You love this place. Short-form focus - every word earns its place. Never corporate, never stiff.`;

// ── Date helpers ─────────────────────────────────────────────────────────────

function getWeekendDates() {
  const now = new Date();
  const day = now.getDay();
  // Find next Friday from today
  const fri = new Date(now);
  fri.setDate(now.getDate() + ((5 - day + 7) % 7 || 7));
  const sat = new Date(fri); sat.setDate(fri.getDate() + 1);
  const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
  return {
    friday: fri.toISOString().split('T')[0],
    saturday: sat.toISOString().split('T')[0],
    sunday: sun.toISOString().split('T')[0],
    friendlyRange: `${fri.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${sun.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
  };
}

// Next Thursday 9am ET as Unix timestamp (ET = UTC-4 in summer, UTC-5 in winter)
function getThursdaySendTime() {
  const now = new Date();
  const day = now.getDay();
  const thu = new Date(now);
  thu.setDate(now.getDate() + ((4 - day + 7) % 7 || 7));
  // 9am ET - use 13:00 UTC (EDT, summer) - safe approximation
  thu.setUTCHours(13, 0, 0, 0);
  return Math.floor(thu.getTime() / 1000);
}

function friendlyDate(isoDate) {
  const [, m, d] = isoDate.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}`;
}

function isoToSlug(isoDate, title) {
  const [, m, d] = isoDate.split('-');
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `dispatch-${m}-${d}-${slug}`;
}

// ── Notion event fetch ────────────────────────────────────────────────────────

async function fetchWeekendEvents(dates) {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
    {
      method: 'POST',
      headers: NOTION_EVENTS,
      body: JSON.stringify({
        filter: {
          and: [
            { or: [
              { property: 'Status', status: { equals: 'Approved' } },
              { property: 'Status', status: { equals: 'Published' } },
            ]},
            { or: [
              { property: 'Event date', date: { equals: dates.friday } },
              { property: 'Event date', date: { equals: dates.saturday } },
              { property: 'Event date', date: { equals: dates.sunday } },
            ]},
          ],
        },
        sorts: [{ property: 'Event date', direction: 'ascending' }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Notion events error ${res.status}`);
  const data = await res.json();
  return (data.results || []).map(page => {
    const p = page.properties;
    const date = p['Event date']?.date?.start || '';
    return {
      name: p['Event Name']?.title?.[0]?.text?.content || '',
      date,
      day: date === dates.friday ? 'friday' : date === dates.saturday ? 'saturday' : 'sunday',
      time: p['Time']?.rich_text?.[0]?.text?.content || '',
      timeEnd: p['Time End']?.rich_text?.[0]?.text?.content || '',
      location: p['Location']?.rich_text?.[0]?.text?.content || '',
    };
  }).filter(e => e.name);
}

// ── AI content generation ─────────────────────────────────────────────────────

async function generateFeatureArticle(dates, eventCount) {
  const month = new Date().toLocaleString('en-US', { month: 'long' });
  const msg = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    system: YETI_VOICE,
    messages: [{
      role: 'user',
      content: `Write a short feature intro (120-150 words) for this week's Manitou Dispatch newsletter.

Today's date context: ${month}, weekend of ${dates.friendlyRange}.
Events this weekend: ${eventCount} happening at Manitou Beach / Devils Lake.

Pick ONE of these angles (rotate naturally, don't always use the same one):
- What's coming alive right now at the lake (seasonal)
- A "locals know" tip about Manitou Beach or Devils Lake
- A warm welcome to the community (good for early issues)
- Something exciting happening in the area this season

Rules:
- First line is a punchy hook - no "Welcome to" openers
- Warm, conversational, like a text from a friend who lives at the lake
- Mention Manitou Beach or Devils Lake naturally
- End with a natural transition into the events section
- Never use em dashes
- Return ONLY the article text, no title, no JSON`,
    }],
  });
  return msg.content[0].text.trim();
}

async function generateSubjectLine(featureText, eventCount, dates) {
  const msg = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    system: YETI_VOICE,
    messages: [{
      role: 'user',
      content: `Generate the single best email subject line for this week's Manitou Dispatch.

Feature article starts with: "${featureText.slice(0, 120)}..."
Events this weekend: ${eventCount}
Weekend dates: ${dates.friendlyRange}

Rules:
- Under 50 characters
- Warm and inviting, not clickbait
- Should make someone want to open it on a Wednesday night
- Never use em dashes
- Return ONLY the subject line text, nothing else`,
    }],
  });
  return msg.content[0].text.trim().replace(/^["']|["']$/g, '');
}

async function generateEventBullets(events) {
  if (!events.length) return ['Nothing formally scheduled - but the lake\'s always open.'];
  const eventList = events.slice(0, 8).map(e =>
    `${e.day} - ${e.name}${e.time ? ` (${e.time}${e.timeEnd ? '-'+e.timeEnd : ''})` : ''}${e.location ? ` at ${e.location}` : ''}`
  ).join('\n');
  const msg = await ai.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: YETI_VOICE,
    messages: [{
      role: 'user',
      content: `Turn these events into punchy newsletter bullets for "This Weekend at the Lake."

Events:
${eventList}

Format each: "Day, [Date if helpful] - Event Name: one sharp line on what/why"
Pick up to 5. Use Fri/Sat/Sun abbreviations.
Never use em dashes - use a colon or comma instead.
Return ONLY a JSON array of strings: ["...", "...", "..."]`,
    }],
  });
  const raw = msg.content[0].text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(raw);
}

// ── HTML builders ─────────────────────────────────────────────────────────────

function buildEmailHtml(featureText, subject, bullets, dates, siteUrl) {
  const bulletRows = bullets.map(b =>
    `<tr><td style="padding:6px 0 6px 20px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#3B3228;border-left:3px solid #D4845A;">
      ${b.replace(/</g,'&lt;').replace(/>/g,'&gt;')}
    </td></tr>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#FAF6EF;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF6EF;">
<tr><td align="center" style="padding:24px 16px;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

    <!-- Header -->
    <tr><td style="background:#1A2830;padding:28px 32px;border-radius:8px 8px 0 0;text-align:center;">
      <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:24px;font-weight:bold;color:#FAF6EF;letter-spacing:1px;">The Manitou Dispatch</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#A8C4CE;letter-spacing:2px;text-transform:uppercase;">Manitou Beach &amp; Devils Lake, Michigan</p>
    </td></tr>

    <!-- Date bar -->
    <tr><td style="background:#D4845A;padding:8px 32px;text-align:center;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#FAF6EF;letter-spacing:2px;text-transform:uppercase;">Weekend of ${dates.friendlyRange}</p>
    </td></tr>

    <!-- Feature article -->
    <tr><td style="background:#FFFFFF;padding:36px 32px 28px;">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:11px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;">From the Lake</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:17px;line-height:1.75;color:#3B3228;">${featureText.replace(/\n/g, '</p><p style="margin:16px 0 0;font-family:Georgia,serif;font-size:17px;line-height:1.75;color:#3B3228;">')}</p>
    </td></tr>

    <!-- Divider -->
    <tr><td style="background:#FFFFFF;padding:0 32px;">
      <hr style="border:none;border-top:1px solid #E8DFD0;margin:0;"/>
    </td></tr>

    <!-- This Weekend -->
    <tr><td style="background:#FFFFFF;padding:28px 32px 32px;">
      <p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:11px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;">This Weekend at the Lake</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${bulletRows}
      </table>
      <p style="margin:24px 0 0;">
        <a href="${siteUrl}/happening" style="background:#1A2830;color:#FAF6EF;text-decoration:none;padding:12px 24px;border-radius:4px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;display:inline-block;">See Full Event Calendar</a>
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#F0EAE0;padding:24px 32px;border-radius:0 0 8px 8px;border-top:1px solid #E8DFD0;">
      <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:14px;color:#6B5F52;">See you at the lake.</p>
      <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:12px;color:#8A7E6E;">The Yeti, Manitou Beach MI</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#A8926E;">
        <a href="${siteUrl}" style="color:#D4845A;text-decoration:none;">manitoubeachmichigan.com</a>
        &nbsp;&bull;&nbsp;
        <a href="{{unsubscribe_url}}" style="color:#A8926E;text-decoration:none;">unsubscribe</a>
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

// Clean web version for beehiiv's web view (not email-client constrained)
function buildWebHtml(featureText, bullets, dates, siteUrl) {
  const bulletItems = bullets.map(b =>
    `<li style="margin-bottom:10px;line-height:1.65;">${b.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</li>`
  ).join('');

  return `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;color:#3B3228;">
  <p style="font-size:12px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">From the Lake &mdash; Weekend of ${dates.friendlyRange}</p>
  <div style="font-size:17px;line-height:1.8;margin:0 0 32px;">${featureText.replace(/\n\n/g,'</p><p style="font-size:17px;line-height:1.8;margin:16px 0 0;">').replace(/^/, '<p style="font-size:17px;line-height:1.8;margin:0 0 16px;">').replace(/$/, '</p>')}</div>
  <hr style="border:none;border-top:2px solid #E8DFD0;margin:0 0 28px;"/>
  <p style="font-size:12px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">This Weekend at the Lake</p>
  <ul style="padding-left:24px;margin:0 0 28px;">${bulletItems}</ul>
  <p style="margin:0;"><a href="${siteUrl}/happening" style="color:#D4845A;font-weight:bold;text-decoration:none;">Full event calendar at manitoubeachmichigan.com</a></p>
</div>`;
}

// ── beehiiv post creation ─────────────────────────────────────────────────────

async function createBeehiivPost(subject, emailHtml, webHtml, scheduleFor) {
  const body = {
    title: subject,
    subject_line: subject,
    preview_text: 'Your weekend guide to Manitou Beach and Devils Lake.',
    authors: ['The Yeti'],
    content: {
      free: {
        email: emailHtml,
        web: webHtml,
      },
    },
    audience: 'free',
    platform: 'both',
    status: 'confirmed',
    schedule_for: scheduleFor,
  };

  const res = await fetch(`${BEEHIIV_BASE}/publications/${PUB_ID}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || `beehiiv error ${res.status}: ${JSON.stringify(data)}`);
  return data.data;
}

// ── Notion dispatch article creation ─────────────────────────────────────────

async function createNotionArticle(subject, featureText, bullets, dates, sendDate) {
  const slug = isoToSlug(dates.saturday, subject);
  const paragraphs = featureText.split('\n\n').filter(Boolean);

  const children = [
    // Feature article paragraphs
    ...paragraphs.map(p => ({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: p } }] },
    })),
    // Divider
    { object: 'block', type: 'divider', divider: {} },
    // This Weekend heading
    {
      object: 'block', type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: 'This Weekend at the Lake' } }] },
    },
    // Event bullets
    ...bullets.map(b => ({
      object: 'block', type: 'bulleted_list_item',
      bulleted_list_item: { rich_text: [{ type: 'text', text: { content: b } }] },
    })),
  ];

  const page = {
    parent: { database_id: process.env.NOTION_DB_DISPATCH_ARTICLES },
    properties: {
      Title: { title: [{ type: 'text', text: { content: subject } }] },
      Slug: { rich_text: [{ type: 'text', text: { content: slug } }] },
      Excerpt: { rich_text: [{ type: 'text', text: { content: `Your weekend guide to Manitou Beach and Devils Lake. ${dates.friendlyRange}.` } }] },
      Category: { select: { name: 'Weekend Guide' } },
      Author: { rich_text: [{ type: 'text', text: { content: 'The Yeti' } }] },
      'Published Date': { date: { start: sendDate } },
      'Blog Safe': { checkbox: true },
      'AI Generated': { checkbox: true },
    },
    children,
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: NOTION_DISPATCH,
    body: JSON.stringify(page),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Notion create error ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// ── Preview email to Daryl ────────────────────────────────────────────────────

async function emailPreview(subject, beehiivPost, dates) {
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const previewUrl = beehiivPost?.web_url || `https://manitoudispatch.beehiiv.com`;
  const beehiivEditUrl = `https://app.beehiiv.com/publications/${PUB_ID}/posts/${beehiivPost?.id}`;
  const sendTime = new Date(getThursdaySendTime() * 1000).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: 'America/Detroit',
  });

  await resend.emails.send({
    from: `Manitou Beach <events@manitoubeachmichigan.com>`,
    to: 'admin@yetigroove.com',
    subject: `Dispatch draft ready: "${subject}" - sends ${sendTime}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#3B3228;background:#FAF6EF;padding:36px 32px;border-radius:8px;">
        <p style="font-size:13px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;margin:0 0 6px;">Manitou Dispatch</p>
        <p style="font-size:22px;font-weight:bold;margin:0 0 6px;">Your newsletter is queued.</p>
        <p style="font-size:15px;color:#6B5F52;margin:0 0 28px;line-height:1.7;">Subject: <strong>${subject}</strong><br/>Sends: <strong>${sendTime}</strong></p>

        <p style="margin:0 0 12px;">
          <a href="${previewUrl}" style="background:#1A2830;color:#FAF6EF;text-decoration:none;padding:13px 24px;border-radius:4px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;display:inline-block;">Preview Issue</a>
        </p>
        <p style="margin:0 0 28px;">
          <a href="${beehiivEditUrl}" style="background:#D4845A;color:#FAF6EF;text-decoration:none;padding:13px 24px;border-radius:4px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;display:inline-block;">Edit or Cancel in beehiiv</a>
        </p>

        <p style="font-size:13px;color:#8A7E6E;line-height:1.7;margin:0;">Silence means it goes out automatically at ${sendTime}.<br/>To cancel: open beehiiv and change the post status to Draft.</p>

        <hr style="border:none;border-top:1px solid #E8DFD0;margin:28px 0 16px;"/>
        <p style="font-size:11px;color:#9A8E7E;margin:0;">Events this weekend: ${dates.friendlyRange} &bull; ${siteUrl}</p>
      </div>
    `,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow admin UI calls with X-Admin-Token; Vercel cron calls have no token
  const adminToken = req.headers['x-admin-token'];
  if (adminToken && adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const preview = req.query?.preview === '1';
  const sendNow = req.query?.send_now === '1';
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    const dates = getWeekendDates();

    // 1. Fetch events
    let events = [];
    try {
      events = await fetchWeekendEvents(dates);
    } catch (err) {
      console.error('cron-newsletter-draft: events fetch failed:', err.message);
    }

    // 2. Generate AI content in parallel
    const [featureText, bulletResult] = await Promise.all([
      generateFeatureArticle(dates, events.length),
      generateEventBullets(events),
    ]);
    const subject = await generateSubjectLine(featureText, events.length, dates);

    if (preview) {
      return res.status(200).json({ subject, featureText, bullets: bulletResult, dates, eventCount: events.length });
    }

    // 3. Build HTML for email and web
    const emailHtml = buildEmailHtml(featureText, subject, bulletResult, dates, siteUrl);
    const webHtml = buildWebHtml(featureText, bulletResult, dates, siteUrl);

    // 4. Determine send time: Thursday 9am ET for cron, 15 min from now for send_now
    const scheduleFor = sendNow
      ? Math.floor(Date.now() / 1000) + 900
      : getThursdaySendTime();
    const sendDateIso = new Date(scheduleFor * 1000).toISOString().split('T')[0];

    let beehiivPost = null;
    try {
      beehiivPost = await createBeehiivPost(subject, emailHtml, webHtml, scheduleFor);
    } catch (err) {
      console.error('cron-newsletter-draft: beehiiv error:', err.message);
    }

    // 5. Write Notion article (blog post)
    let notionPage = null;
    try {
      notionPage = await createNotionArticle(subject, featureText, bulletResult, dates, sendDateIso);
    } catch (err) {
      console.error('cron-newsletter-draft: notion error:', err.message);
    }

    // 6. Email preview to admin
    try {
      await emailPreview(subject, beehiivPost, dates);
    } catch (err) {
      console.error('cron-newsletter-draft: preview email error:', err.message);
    }

    console.log(`cron-newsletter-draft: done — subject:"${subject}" events:${events.length} beehiiv:${beehiivPost?.id || 'err'} notion:${notionPage?.id || 'err'}`);

    return res.status(200).json({
      success: true,
      subject,
      eventCount: events.length,
      beehiivPostId: beehiivPost?.id,
      beehiivWebUrl: beehiivPost?.web_url,
      notionPageId: notionPage?.id,
      scheduledFor: new Date(scheduleFor * 1000).toISOString(),
    });

  } catch (err) {
    console.error('cron-newsletter-draft error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
