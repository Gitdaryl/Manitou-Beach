import { requireCron } from './lib/cronAuth.js';
// GET /api/cron-profile-report-card
// Runs 1st of each month at 10am ET
// Sends each active business owner an SMS with their profile report card link,
// and an email with the top 3 gaps (Org Contact Email, else the listing Email).
// Add ?preview=1 to see who would get a message without sending anything.
// Visit numbers only appear in the email when REPORT_SHOW_VISITS=1.

import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { list } from '@vercel/blob';
import { sendSMS, normalizePhone } from './lib/twilio.js';
import { scoreProfile, makeStopLink } from './profile-report-card.js';
import { makeOwnerLink } from './verify-claim.js';
import { howtoFor } from './lib/howtoVideos.js';

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Notion page ids that never get the monthly text.
// On Point JD (comp, Nov 2026): its phone is OnPoint's 24/7 customer line, so it
// never gets a "finish your profile" nudge even if a field goes missing later.
const SKIP_REPORT_CARD = new Set([
  '4128c729-eb59-817c-bc3d-c3f4d4afb774',
]);

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

function toSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchAllActiveBusinesses() {
  const pages = [];
  let cursor = undefined;

  do {
    const body = {
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Listed Free' } },
          { property: 'Status', status: { equals: 'Listed Enhanced' } },
          { property: 'Status', status: { equals: 'Listed Featured' } },
          { property: 'Status', status: { equals: 'Listed Premium' } },
        ],
      },
      page_size: 100,
      ...(cursor && { start_cursor: cursor }),
    };

    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      { method: 'POST', headers: NOTION_HEADERS, body: JSON.stringify(body) }
    );
    if (!res.ok) break;
    const data = await res.json();
    pages.push(...(data.results || []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return pages;
}

async function generateSmsNudge(name, score, gaps) {
  if (!gaps.length) return `Your ${name} profile on Manitou Beach is looking sharp - totally complete. Nice work!`;

  const topGap = gaps[0];
  const prompt = `Write a single friendly SMS message (under 140 chars, casual tone, no em dashes) for a small business owner in Manitou Beach.

Business: "${name}". Profile is ${score}% complete. The biggest missing piece is: ${topGap.label} (${topGap.tip}).

Start with something encouraging, then hint at the one thing worth adding. End with their profile link placeholder [LINK]. Keep it warm, not pushy.`;

  try {
    const msg = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{ role: 'user', content: prompt }],
    });
    return msg.content[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

function maskEmail(e) {
  const [user, domain] = String(e).split('@');
  return `${(user || '').slice(0, 1)}***@${domain || ''}`;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Bot-filtered visits for last month (api/track-view.js humanMonthly). Null when off or missing.
async function loadLastMonthVisits() {
  if (process.env.REPORT_SHOW_VISITS !== '1') return null;
  try {
    const { blobs } = await list({ prefix: 'analytics/views', token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blobs.length) return null;
    const r = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!r.ok) return null;
    const data = await r.json();
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 1);
    const month = d.toISOString().slice(0, 7);
    const monthName = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    return { month, monthName, human: data.humanMonthly || {} };
  } catch {
    return null;
  }
}

export function buildReportEmail({ name, score, gaps, ownerUrl, stopUrl, visits }) {
  const top = gaps.slice(0, 3);
  const claimVideo = howtoFor('claim');
  const subject = `${name}: your Manitou Beach page is ${score}% complete`;

  const textLines = [
    'Hi there,',
    '',
    `Here is your monthly check on the ${name} page at Manitou Beach Michigan. It is ${score}% complete. A few small additions help people decide to call or stop in.`,
    '',
  ];
  if (visits != null) {
    textLines.push(`In ${visits.monthName}, ${visits.count} ${visits.count === 1 ? 'person' : 'people'} opened your page.`, '');
  }
  textLines.push('Here is what would help most:', '');
  top.forEach((g, i) => {
    const v = howtoFor(g.howto);
    textLines.push(`${i + 1}. Add your ${g.label}`, `   ${g.tip}`);
    if (v) textLines.push(`   Watch how: ${v.url}`);
    textLines.push('');
  });
  textLines.push(
    'Open your page to make changes. This link signs you in, no code needed, for the next 30 days:',
    ownerUrl,
    '',
  );
  if (claimVideo) textLines.push(`New to the editor? Watch how it works: ${claimVideo.url}`, '');
  textLines.push(
    'Thanks for being part of Manitou Beach.',
    'Manitou Beach Michigan',
    '',
    '---',
    `Questions? Just reply to this email.`,
    `Rather not get this monthly note? Stop it here: ${stopUrl}`,
  );
  const text = textLines.join('\n');

  const gapRows = top.map((g, i) => {
    const v = howtoFor(g.howto);
    return `
      <tr><td style="padding:0 0 16px">
        <div style="font-size:16px;font-weight:700;color:#1A2830">${i + 1}. Add your ${esc(g.label)}</div>
        <div style="font-size:15px;color:#5C5248;line-height:1.5;margin-top:2px">${esc(g.tip)}</div>
        ${v ? `<a href="${esc(v.url)}" style="display:inline-block;margin-top:6px;font-size:15px;color:#2D5F7C;font-weight:600">Watch how</a>` : ''}
      </td></tr>`;
  }).join('');

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 20px;background:#FAF6EF;color:#1A2830">
    <p style="font-size:16px;line-height:1.6;margin:0 0 12px">Hi there,</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Here is your monthly check on the <strong>${esc(name)}</strong> page at Manitou Beach Michigan. A few small additions help people decide to call or stop in.</p>
    <div style="background:#fff;border-radius:12px;padding:16px;margin:0 0 20px">
      <div style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#5B7B65">Your page is ${score}% complete</div>
      <div style="background:#EADFCB;border-radius:4px;height:8px;margin-top:10px;overflow:hidden"><div style="width:${score}%;height:8px;background:#5B7B65"></div></div>
      ${visits != null ? `<div style="font-size:15px;color:#5C5248;margin-top:10px">In ${esc(visits.monthName)}, ${visits.count} ${visits.count === 1 ? 'person' : 'people'} opened your page.</div>` : ''}
    </div>
    <p style="font-size:16px;font-weight:700;margin:0 0 12px">Here is what would help most:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${gapRows}</table>
    <div style="text-align:center;margin:8px 0 12px">
      <a href="${esc(ownerUrl)}" style="display:inline-block;background:#2D5F7C;color:#fff;text-decoration:none;font-weight:600;font-size:17px;padding:14px 28px;border-radius:12px">Open my page</a>
    </div>
    <p style="font-size:14px;color:#5C5248;text-align:center;margin:0 0 20px">This button signs you in, no code needed, for the next 30 days.${claimVideo ? ` <a href="${esc(claimVideo.url)}" style="color:#2D5F7C">New to the editor? Watch how it works.</a>` : ''}</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 4px">Thanks for being part of Manitou Beach.</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 28px">Manitou Beach Michigan</p>
    <p style="font-size:13px;color:#8A7F73;line-height:1.5;margin:0;border-top:1px solid #EADFCB;padding-top:12px">Questions? Just reply to this email. Rather not get this monthly note? <a href="${esc(stopUrl)}" style="color:#8A7F73">Stop it here</a>.</p>
  </div>`;

  return { subject, text, html };
}

export default async function handler(req, res) {
  if (!requireCron(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  const preview = req.query.preview === '1';
  const results = { sent: [], skipped: [], errors: [] };
  const email = { sent: [], skipped: [], errors: [] };
  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  try {
    const pages = await fetchAllActiveBusinesses();
    const visitData = await loadLastMonthVisits();

    for (const page of pages) {
      const p = page.properties;
      const name = p['Name']?.title?.[0]?.text?.content || '';
      const phone = normalizePhone(p['Phone']?.phone_number || '');

      // Comped and hand-managed listings whose phone is a customer lead line:
      // a monthly "finish your profile" text there is noise.
      if (SKIP_REPORT_CARD.has(page.id) || p['Skip Report Card']?.checkbox) {
        results.skipped.push({ name, reason: 'skip report card' });
        email.skipped.push({ name, reason: 'skip report card' });
        continue;
      }

      const { score, gaps } = scoreProfile(p);

      // Only message businesses with room to improve
      if (score >= 95) {
        results.skipped.push({ name, reason: 'profile complete' });
        email.skipped.push({ name, reason: 'profile complete' });
        continue;
      }

      const slug = toSlug(name);
      // Signed for the owner, so the link opens their score panel, not just the public profile
      const profileUrl = `${SITE_URL}/business/${slug}?owner=${makeOwnerLink(page.id)}`;

      // ── Text (unchanged) ──
      if (!phone || phone.length !== 10) {
        results.skipped.push({ name, reason: 'no phone' });
      } else {
        const nudge = await generateSmsNudge(name, score, gaps);
        if (!nudge) {
          results.errors.push({ name, reason: 'nudge generation failed' });
        } else {
          const message = nudge.replace('[LINK]', profileUrl);
          if (preview) {
            results.sent.push({ name, phone: `***-***-${phone.slice(-4)}`, score, message });
          } else {
            const ok = await sendSMS(phone, message);
            if (ok) results.sent.push({ name, score });
            else results.errors.push({ name, reason: 'SMS failed' });
            // Rate limit - Twilio doesn't love bursts
            await new Promise(r => setTimeout(r, 300));
          }
        }
      }

      // ── Email ──
      const to = (p['Org Contact Email']?.email || p['Email']?.email || '').trim();
      if (p['Is Demo']?.checkbox || p['Hidden']?.checkbox) {
        email.skipped.push({ name, reason: 'demo or hidden listing' });
      } else if (!to || !to.includes('@')) {
        email.skipped.push({ name, reason: 'no email' });
      } else {
        const key = `business:${slug}`;
        const visits = visitData ? { monthName: visitData.monthName, count: visitData.human[key]?.[visitData.month] || 0 } : null;
        const msg = buildReportEmail({ name, score, gaps, ownerUrl: profileUrl, stopUrl: makeStopLink(SITE_URL, page.id), visits });
        if (preview) {
          email.sent.push({ name, to: maskEmail(to), score, subject: msg.subject, text: msg.text });
        } else if (!resend) {
          email.errors.push({ name, reason: 'RESEND_API_KEY not set' });
        } else {
          try {
            const r = await resend.emails.send({
              from: 'Manitou Beach <hello@manitoubeachmichigan.com>',
              // Replies land in admin@, which the lead-catcher job reads several times a day (Yeti, Nov 11: hello@ is not watched)
              reply_to: 'admin@yetigroove.com',
              to,
              subject: msg.subject,
              html: msg.html,
              text: msg.text,
            });
            if (r.error) email.errors.push({ name, reason: r.error.message || 'Resend error' });
            else email.sent.push({ name, score });
          } catch (err) {
            email.errors.push({ name, reason: err.message });
          }
          await new Promise(r => setTimeout(r, 600)); // Resend allows ~2 requests a second
        }
      }
    }

    return res.status(200).json({
      preview,
      sent: results.sent.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      emailSent: email.sent.length,
      emailSkipped: email.skipped.length,
      emailErrors: email.errors.length,
      detail: results,
      email,
    });
  } catch (err) {
    console.error('cron-profile-report-card error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
