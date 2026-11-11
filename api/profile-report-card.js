// GET /api/profile-report-card?slug=xxx&claimToken=yyy
// Returns completeness score, gaps, and a Haiku-generated nudge for the business owner.
// Only accessible with a valid claim token.

import Anthropic from '@anthropic-ai/sdk';
import { createHmac, timingSafeEqual } from 'crypto';
import { verifyClaimToken } from './verify-claim.js';
import { howtoFor } from './lib/howtoVideos.js';
import { sendSMS } from './lib/twilio.js';

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

function toSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function findBusinessBySlug(slug) {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
    {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: {
          or: [
            { property: 'Status', status: { equals: 'Listed Free' } },
            { property: 'Status', status: { equals: 'Listed Enhanced' } },
            { property: 'Status', status: { equals: 'Listed Featured' } },
            { property: 'Status', status: { equals: 'Listed Premium' } },
          ],
        },
        page_size: 100,
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data.results || []).find(page => {
    const name = page.properties['Name']?.title?.[0]?.text?.content || '';
    return toSlug(name) === slug;
  }) || null;
}

// Text of a Notion rich_text property, across every chunk.
function richText(prop) {
  return (prop?.rich_text || []).map(r => r.plain_text ?? r.text?.content ?? '').join('');
}

function hasHours(raw) {
  if (!raw) return false;
  try {
    const h = JSON.parse(raw);
    if (h && typeof h === 'object') return Object.values(h).some(v => String(v || '').trim());
  } catch { /* plain text hours */ }
  return !!raw.trim();
}

// Tier as the site renders it (api/businesses.js): an expired Featured listing shows as free.
function tierOf(p) {
  const s = p['Status']?.status?.name || '';
  if (s.includes('Premium')) return 'premium';
  if (s.includes('Featured')) {
    const exp = p['Featured Expires']?.date?.start || '';
    const today = new Date().toISOString().slice(0, 10);
    return exp && exp < today ? 'free' : 'featured';
  }
  if (s.includes('Enhanced') || s.includes('Comp')) return 'enhanced';
  return 'free';
}

// Only fields the owner's tier can edit in the profile edit panel count toward the score,
// so nobody is told to add something they cannot reach (Google Place ID is Featured and
// Premium only, the gallery is Premium only). Score is a percent of what the tier can reach.
// howto = key in api/lib/howtoVideos.js.
export function scoreProfile(p) {
  const name    = p['Name']?.title?.[0]?.text?.content || '';
  const tier    = tierOf(p);
  const category = p['Category']?.select?.name || 'Business';
  const phone   = p['Phone']?.phone_number || '';
  const gallery = (() => { try { const g = JSON.parse(richText(p['Gallery']) || '[]'); return Array.isArray(g) ? g.filter(Boolean) : []; } catch { return []; } })();

  const fields = {
    heroPhoto:     { value: !!(p['Hero Photo URL']?.url),          points: 20, howto: 'photos',  label: 'cover photo',    tip: 'A real photo of your place shows people what to expect before they come.' },
    googlePlaceId: { value: !!richText(p['Google Place ID']).trim(), points: 20, howto: 'google', label: 'Google reviews', tip: 'Your Google star rating and reviews show on your page by themselves.', tiers: ['featured', 'premium'] },
    description:   { value: richText(p['Description']).trim().length > 30, points: 15, howto: 'about', label: 'description', tip: 'Two or three sentences on what you do and what makes you different.' },
    hours:         { value: hasHours(richText(p['Hours'])),        points: 15, howto: 'hours',   label: 'hours',          tip: 'People check hours before they drive out. Seasonal hours count too.' },
    logo:          { value: !!(p['Logo URL']?.url),                points: 10, howto: 'photos',  label: 'logo',           tip: 'Your logo helps people recognize you on the directory and the map.' },
    gallery:       { value: gallery.length >= 3,                   points: 10, howto: 'photos',  label: 'photo gallery',  tip: 'Three or more photos of your place, your work or your team.', tiers: ['premium'] },
    website:       { value: !!(p['URL']?.url),                     points:  5, howto: 'contact', label: 'website link',   tip: 'One tap from your page to your own site.' },
    tagline:       { value: !!richText(p['Tagline']).trim(),       points:  5, howto: 'about',   label: 'tagline',        tip: 'One short line that sums you up.' },
    social:        { value: !!(p['Instagram URL']?.url || p['Facebook URL']?.url), points: 5, howto: 'contact', label: 'social link', tip: 'Lets people follow you on Facebook or Instagram.' },
    phone:         { value: !!phone,                               points:  5, howto: 'contact', label: 'phone number',   tip: 'The quickest way for someone to reach you.' },
  };

  let earned = 0;
  let possible = 0;
  const gaps = [];
  const present = [];

  for (const [key, f] of Object.entries(fields)) {
    if (f.tiers && !f.tiers.includes(tier)) continue;
    possible += f.points;
    if (f.value) {
      earned += f.points;
      present.push(f.label);
    } else {
      gaps.push({ key, label: f.label, points: f.points, tip: f.tip, howto: f.howto });
    }
  }

  // Sort gaps by impact
  gaps.sort((a, b) => b.points - a.points);

  const score = possible ? Math.round((earned / possible) * 100) : 100;
  return { score, gaps, present, name, tier, category, phone };
}

async function generateNudge(name, category, score, gaps, present) {
  const topGap = gaps[0];
  const presentStr = present.slice(0, 3).join(', ');
  const gapStr = gaps.slice(0, 2).map(g => g.label).join(' and ');

  const prompt = `You write short, warm encouragement messages for small business owners. The business is "${name}", a ${category} in Manitou Beach, Michigan.

Their profile is ${score}% complete. They have set up: ${presentStr || 'the basics'}.
${topGap ? `The single most impactful missing thing is: ${topGap.label}. Why it matters: ${topGap.tip}` : 'Their profile looks great.'}

Write exactly 2 short sentences in a warm, casual, friendly tone (like a helpful neighbor, not a marketer).
- Sentence 1: acknowledge something specific and positive about what they have set up
- Sentence 2: gently mention the most impactful missing piece and why it matters to real visitors

Rules: no em dashes, no corporate language, under 160 characters total, use plain language.`;

  try {
    const msg = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    });
    return msg.content[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

// ── Stop link for the monthly email ────────────────────────────────────────
// Signed per listing, never expires. GET shows a confirm button and POST does the
// work, because mail scanners (Microsoft 365 Safe Links) open every link in an email.
function stopSig(pageId) {
  const secret = process.env.CLAIM_SIGNING_SECRET;
  if (!secret) throw new Error('CLAIM_SIGNING_SECRET is not set - refusing to sign stop link');
  return createHmac('sha256', secret).update(`report-stop:${pageId}`).digest('hex').slice(0, 24);
}

export function makeStopLink(siteUrl, pageId) {
  return `${siteUrl}/api/profile-report-card?stop=${encodeURIComponent(pageId)}&sig=${stopSig(pageId)}`;
}

function stopSigOk(pageId, sig) {
  if (!process.env.CLAIM_SIGNING_SECRET || typeof sig !== 'string' || !/^[0-9a-f-]{32,36}$/i.test(pageId || '')) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(stopSig(pageId));
  return a.length === b.length && timingSafeEqual(a, b);
}

function stopPage(body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Monthly profile note</title></head>
<body style="margin:0;background:#FAF6EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1A2830">
<div style="max-width:480px;margin:0 auto;padding:48px 16px;font-size:17px;line-height:1.5">${body}</div></body></html>`;
}

async function handleStop(req, res) {
  const pageId = String(req.query.stop || req.body?.stop || '');
  const sig = String(req.query.sig || req.body?.sig || '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (!stopSigOk(pageId, sig)) {
    return res.status(400).send(stopPage('<p>This link is not valid. Reply to the email with STOP and we will take care of it.</p>'));
  }

  if (req.method === 'GET') {
    return res.status(200).send(stopPage(`
      <h1 style="font-size:22px;margin:0 0 12px">Stop the monthly profile note?</h1>
      <p style="margin:0 0 24px">Your listing stays up either way. This only stops the monthly email and text about your profile.</p>
      <form method="POST" action="/api/profile-report-card">
        <input type="hidden" name="stop" value="${pageId}">
        <input type="hidden" name="sig" value="${sig}">
        <button type="submit" style="min-height:50px;width:100%;border:0;border-radius:12px;background:#2D5F7C;color:#fff;font-size:17px;font-weight:600;cursor:pointer">Yes, stop them</button>
      </form>`));
  }

  // Persist first. If the write fails (for example the Skip Report Card checkbox is missing
  // from the listings database), text the admin so the stop is still honoured by hand.
  let saved = false;
  let reason = '';
  try {
    const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: NOTION_HEADERS,
      body: JSON.stringify({ properties: { 'Skip Report Card': { checkbox: true } } }),
    });
    saved = r.ok;
    if (!r.ok) reason = `Notion ${r.status}: ${(await r.text()).slice(0, 160)}`;
  } catch (err) {
    reason = err.message;
  }
  if (!saved) {
    console.error('report card stop not saved', pageId, reason);
    const admin = process.env.DARYL_PHONE || process.env.ADMIN_PHONE;
    if (admin) await sendSMS(admin, `MB report card STOP request not saved for listing ${pageId}. Tick Skip Report Card by hand. ${reason}`.slice(0, 300));
  }
  return res.status(200).send(stopPage(`
    <h1 style="font-size:22px;margin:0 0 12px">Done</h1>
    <p style="margin:0">You will not get the monthly profile note any more. Your listing stays up as it is.</p>`));
}

export default async function handler(req, res) {
  if (req.query?.stop || req.body?.stop) return handleStop(req, res);
  if (req.method !== 'GET') return res.status(405).end();

  const { slug, claimToken } = req.query;
  if (!slug || !claimToken) return res.status(400).json({ error: 'slug and claimToken required' });

  try {
    const page = await findBusinessBySlug(slug);
    if (!page) return res.status(404).json({ error: 'Business not found' });

    if (!verifyClaimToken(page.id, claimToken)) return res.status(403).json({ error: 'Invalid claim token' });

    const { score, gaps, present, name, tier, category, phone } = scoreProfile(page.properties);
    const nudge = await generateNudge(name, category, score, gaps, present);
    const withVideo = g => ({ label: g.label, tip: g.tip, points: g.points, howto: howtoFor(g.howto) });

    return res.status(200).json({
      score,
      gaps: gaps.slice(0, 3).map(withVideo),
      topGap: gaps[0] ? withVideo(gaps[0]) : null,
      nudge,
      tier,
      name,
    });
  } catch (err) {
    console.error('profile-report-card error:', err.message);
    return res.status(500).json({ error: 'Could not load report card' });
  }
}
