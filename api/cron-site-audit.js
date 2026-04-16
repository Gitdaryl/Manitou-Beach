// /api/cron-site-audit.js
// Monthly site health audit - SMS report to Daryl
// Schedule: 0 9 1 * * (9am on the 1st of each month)
//
// Also serves as the foundation for Sprint 4 owner reports.
// auditBusiness() is intentionally exported for reuse.

import Anthropic from '@anthropic-ai/sdk';
import { sendSMS, normalizePhone } from './lib/twilio.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

async function fetchAllBusinesses() {
  let results = [];
  let startCursor;
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
      ...(startCursor && { start_cursor: startCursor }),
    };
    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      { method: 'POST', headers: NOTION_HEADERS, body: JSON.stringify(body) }
    );
    if (!res.ok) throw new Error(`Notion query failed: ${await res.text()}`);
    const data = await res.json();
    results = results.concat(data.results);
    startCursor = data.has_more ? data.next_cursor : null;
  } while (startCursor);

  return results.map(page => {
    const p = page.properties;
    const status = p['Status']?.status?.name || '';
    const tier = status.includes('Premium') ? 'premium'
      : status.includes('Featured') ? 'featured'
      : status.includes('Enhanced') ? 'enhanced'
      : 'free';
    return {
      name: p['Name']?.title?.[0]?.text?.content || '',
      category: p['Category']?.select?.name || 'Other',
      tier,
      phone: p['Phone']?.phone_number || null,
      description: p['Description']?.rich_text?.[0]?.text?.content || null,
      logo: p['Logo URL']?.url || null,
      heroPhoto: p['Hero Photo URL']?.url || null,
      hours: p['Hours']?.rich_text?.[0]?.text?.content || null,
      googlePlaceId: p['Google Place ID']?.rich_text?.[0]?.text?.content || null,
      email: p['Email']?.email || null,
    };
  }).filter(b => b.name);
}

// ── Reusable per-business health check ──────────────────────────────────────
// Called by this cron (aggregated) and Sprint 4 owner reports (per-business).
// Returns { score: 0-100, flags: string[] }
export function auditBusiness(biz) {
  const flags = [];
  if (!biz.heroPhoto && !biz.logo)                                       flags.push('no_photo');
  if (!biz.description)                                                   flags.push('no_description');
  if (!biz.hours)                                                         flags.push('no_hours');
  if (!biz.phone)                                                         flags.push('no_phone');
  if (['featured', 'premium'].includes(biz.tier) && !biz.googlePlaceId)  flags.push('no_place_id');
  const score = Math.round(((5 - flags.length) / 5) * 100);
  return { flags, score };
}

// Flag copy for SMS readability
const FLAG_LABELS = {
  no_photo:       'no photo',
  no_description: 'no description',
  no_hours:       'no hours',
  no_phone:       'no phone',
  no_place_id:    'no Google Place ID (reviews locked)',
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const businesses = await fetchAllBusinesses();

    // ── Per-business audit ───────────────────────────────────────────────────
    const audits = businesses.map(biz => ({ biz, ...auditBusiness(biz) }));
    const flagged = audits.filter(a => a.flags.length > 0);

    // ── Aggregate stats ──────────────────────────────────────────────────────
    const totalListings = businesses.length;
    const byTier = { premium: 0, featured: 0, enhanced: 0, free: 0 };
    businesses.forEach(b => byTier[b.tier]++);

    // Category counts - flag when 3+ (category page trigger)
    const categoryCounts = {};
    businesses.forEach(b => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });
    const categoryPageReady = Object.entries(categoryCounts)
      .filter(([, count]) => count >= 3)
      .map(([cat, count]) => `${cat} (${count})`);

    // Top issues across all listings
    const issueCounts = {};
    flagged.forEach(a => a.flags.forEach(f => {
      issueCounts[f] = (issueCounts[f] || 0) + 1;
    }));

    // Listings with the most flags (most attention needed)
    const needsAttention = flagged
      .sort((a, b) => b.flags.length - a.flags.length)
      .slice(0, 5)
      .map(a => `${a.biz.name} (${a.flags.map(f => FLAG_LABELS[f]).join(', ')})`);

    const auditSummary = {
      totalListings,
      byTier,
      listingsWithIssues: flagged.length,
      topIssues: Object.entries(issueCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([flag, count]) => `${FLAG_LABELS[flag]}: ${count}`),
      needsAttention,
      categoryPageReady,
    };

    // ── Haiku summary ────────────────────────────────────────────────────────
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{
        role: 'user',
        content: `You're the site manager for Manitou Beach Michigan (manitoubeachmichigan.com). Write a SHORT monthly SMS audit for Daryl (the owner/admin). Max 10 lines, direct and warm. No corporate language. Use bullet-style lines. Here's the data:\n\n${JSON.stringify(auditSummary, null, 2)}\n\nFormat:\n- Line 1: total listings and tier breakdown\n- Lines 2-5: top issues that need attention (be specific - name the businesses if count is small)\n- If any categories hit 3+ listings, flag it as "time for a category page"\n- Last line: one honest, encouraging note about where things stand`,
      }],
    });

    const smsSummary = msg.content[0]?.text || 'Audit complete - check Notion for details.';

    // ── SMS to Daryl ─────────────────────────────────────────────────────────
    if (process.env.DARYL_PHONE) {
      await sendSMS(
        normalizePhone(process.env.DARYL_PHONE),
        `MB Monthly Audit\n\n${smsSummary}`
      );
    }

    return res.status(200).json({ ok: true, auditSummary, smsSummary });
  } catch (err) {
    console.error('cron-site-audit error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
