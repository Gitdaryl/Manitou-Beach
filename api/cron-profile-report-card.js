import { requireCron } from './lib/cronAuth.js';
// GET /api/cron-profile-report-card
// Runs 1st of each month at 10am ET
// Sends each active business owner an SMS with their profile report card link.
// Add ?preview=1 to see who would get a message without sending anything.

import Anthropic from '@anthropic-ai/sdk';
import { sendSMS, normalizePhone } from './lib/twilio.js';
import { scoreProfile } from './profile-report-card.js';
import { makeClaimToken } from './verify-claim.js';

const ai = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

export default async function handler(req, res) {
  if (!requireCron(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  const preview = req.query.preview === '1';
  const results = { sent: [], skipped: [], errors: [] };

  try {
    const pages = await fetchAllActiveBusinesses();

    for (const page of pages) {
      const p = page.properties;
      const name = p['Name']?.title?.[0]?.text?.content || '';
      const phone = normalizePhone(p['Phone']?.phone_number || '');

      if (!phone || phone.length !== 10) {
        results.skipped.push({ name, reason: 'no phone' });
        continue;
      }

      const { score, gaps } = scoreProfile(p);

      // Only message businesses with room to improve
      if (score >= 95) {
        results.skipped.push({ name, reason: 'profile complete' });
        continue;
      }

      const slug = toSlug(name);
      const claimToken = makeClaimToken(page.id);
      const profileUrl = `${SITE_URL}/business/${slug}`;

      const nudge = await generateSmsNudge(name, score, gaps);
      if (!nudge) {
        results.errors.push({ name, reason: 'nudge generation failed' });
        continue;
      }

      const message = nudge.replace('[LINK]', profileUrl);

      if (preview) {
        results.sent.push({ name, phone: `***-***-${phone.slice(-4)}`, score, message });
        continue;
      }

      const ok = await sendSMS(phone, message);
      if (ok) {
        results.sent.push({ name, score });
      } else {
        results.errors.push({ name, reason: 'SMS failed' });
      }

      // Rate limit - Twilio doesn't love bursts
      await new Promise(r => setTimeout(r, 300));
    }

    return res.status(200).json({
      preview,
      sent: results.sent.length,
      skipped: results.skipped.length,
      errors: results.errors.length,
      detail: results,
    });
  } catch (err) {
    console.error('cron-profile-report-card error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
