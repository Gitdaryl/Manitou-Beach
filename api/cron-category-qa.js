import { requireCronOrAdmin } from './lib/cronAuth.js';
// /api/cron-category-qa.js
// Category QA agent - checks listed businesses are in a sensible category.
//
// Runs daily. For each listing it has not signed off on yet, Claude compares the
// business against the LIVE Notion category list and returns one of:
//   OK      - already in the right place
//   MOVE    - belongs in a different EXISTING category
//   NO_FIT  - nothing existing fits; suggests a theme for a possible new category
//
// Autonomy (deliberate, see RUNBOOK-notion-feeds.md 2026-08-06):
//   - It MOVES listings between categories that already exist, when confident.
//   - It NEVER creates, renames or deletes a Notion category option. Schema edits
//     are what took the directory down on 2026-08-06. A new category is proposed
//     in the digest and stays a human decision.
//   - It never touches a listing with "Category Locked" checked.
//
// Notion properties used:
//   Category Locked (checkbox)  - manual override, agent skips the row entirely
//   Category QA     (rich_text) - last category the agent signed off on. When this
//                                 differs from Category the row is re-evaluated, so
//                                 changing a category by hand re-triggers a check.
//
// Query params:
//   ?dry=1    evaluate and report, write nothing, send no email (use for backfill)
//   ?limit=N  cap how many listings are evaluated this run (default 40)
//
// Env: ANTHROPIC_API_KEY, NOTION_TOKEN_BUSINESS, NOTION_DB_BUSINESS,
//      RESEND_API_KEY, QA_DIGEST_TO (falls back to ADMIN_EMAIL)

import { Resend } from 'resend';

const NOTION_VERSION = '2022-06-28';
const MODEL = 'claude-haiku-4-5-20251001';

// Confidence at or above this moves the listing. Below it, we only propose.
const MOVE_THRESHOLD = 0.8;
// How many listings must share a theme before we suggest creating a category.
const NEW_CATEGORY_QUORUM = 3;

const HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': NOTION_VERSION,
};

const LISTED_STATUSES = ['Listed Free', 'Listed Enhanced', 'Listed Featured', 'Listed Premium'];

// Categories that are structural rather than descriptive - the agent must never
// move a listing INTO these, because they change how/where the site renders it.
const PROTECTED_CATEGORIES = new Set(['Places to Stay', 'Other']);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!requireCronOrAdmin(req, res)) return;

  const dry = req.query?.dry === '1' || req.query?.dry === 'true';
  const limit = Math.min(parseInt(req.query?.limit, 10) || 40, 100);

  try {
    const categories = await getLiveCategories();
    if (!categories.length) throw new Error('No categories returned from Notion schema');

    const listings = await getListings();
    const pending = listings.filter(l => !l.locked && l.qaSignedOff !== l.category).slice(0, limit);

    if (!pending.length) {
      return res.status(200).json({ ok: true, evaluated: 0, message: 'Nothing new to check' });
    }

    const moved = [], proposed = [], noFit = [], errors = [];

    for (const listing of pending) {
      let verdict;
      try {
        verdict = await evaluate(listing, categories);
      } catch (err) {
        console.error(`category-qa: eval failed for ${listing.name}:`, err.message);
        errors.push({ name: listing.name, error: err.message });
        continue;
      }

      // Safety rail: only ever act on a category that is live in Notion right now.
      // A hallucinated or stale name must never reach a Notion write.
      const target = verdict.category && categories.includes(verdict.category) ? verdict.category : null;

      if (verdict.verdict === 'OK' || (target && target === listing.category)) {
        if (!dry) await signOff(listing.pageId, listing.category);
        continue;
      }

      if (verdict.verdict === 'MOVE' && target && !PROTECTED_CATEGORIES.has(target)) {
        const entry = {
          name: listing.name,
          from: listing.category,
          to: target,
          confidence: verdict.confidence,
          reason: verdict.reason,
        };
        if (verdict.confidence >= MOVE_THRESHOLD) {
          if (!dry) await applyMove(listing, target);
          moved.push(entry);
          console.log(`category-qa: MOVED ${listing.name}: ${listing.category} -> ${target}`);
        } else {
          proposed.push(entry);
        }
        continue;
      }

      // NO_FIT, a protected target, or a category name we do not recognise.
      noFit.push({
        name: listing.name,
        category: listing.category,
        theme: (verdict.theme || 'unclear').trim(),
        reason: verdict.reason,
      });
      if (!dry) await signOff(listing.pageId, listing.category);
    }

    // Cluster the misfits by theme. Only a theme shared by enough listings is
    // worth a new category - one odd business is not a category.
    const themes = {};
    for (const n of noFit) {
      const key = n.theme.toLowerCase();
      (themes[key] = themes[key] || { theme: n.theme, listings: [] }).listings.push(n.name);
    }
    const newCategoryIdeas = Object.values(themes).filter(t => t.listings.length >= NEW_CATEGORY_QUORUM);

    const summary = { evaluated: pending.length, moved, proposed, noFit, newCategoryIdeas, errors };

    if (dry) return res.status(200).json({ ok: true, dryRun: true, ...summary });

    if (moved.length || proposed.length || newCategoryIdeas.length || errors.length) {
      try {
        await sendDigest(summary);
      } catch (err) {
        console.error('category-qa: digest email failed:', err.message);
      }
    }

    return res.status(200).json({ ok: true, ...summary });
  } catch (err) {
    console.error('category-qa error:', err.message);
    return res.status(500).json({ error: 'Category QA failed', detail: err.message });
  }
}

// ─── NOTION: live category options (never a hardcoded list) ────────────────
// Read from the schema every run so a category added or renamed in Notion is
// picked up without a deploy, and so we can never write a dead option name.

async function getLiveCategories() {
  const r = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}`, { headers: HEADERS });
  if (!r.ok) throw new Error(`Notion schema fetch failed: ${await r.text()}`);
  const db = await r.json();
  return (db.properties?.['Category']?.select?.options || []).map(o => o.name);
}

// ─── NOTION: listed businesses ─────────────────────────────────────────────

async function getListings() {
  const pages = [];
  let cursor;
  do {
    const r = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        filter: { or: LISTED_STATUSES.map(s => ({ property: 'Status', status: { equals: s } })) },
        start_cursor: cursor,
        page_size: 100,
      }),
    });
    if (!r.ok) throw new Error(`Notion query failed: ${await r.text()}`);
    const data = await r.json();
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return pages
    .map(page => {
      const p = page.properties;
      return {
        pageId: page.id,
        name: p['Name']?.title?.[0]?.text?.content || '',
        category: p['Category']?.select?.name || 'Other',
        categories: (p['Categories']?.multi_select || []).map(s => s.name),
        tagline: p['Tagline']?.rich_text?.[0]?.text?.content || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        address: p['Address']?.rich_text?.[0]?.text?.content || '',
        website: p['URL']?.url || '',
        locked: p['Category Locked']?.checkbox ?? false,
        qaSignedOff: p['Category QA']?.rich_text?.[0]?.text?.content || '',
        hidden: p['Hidden']?.checkbox ?? false,
      };
    })
    .filter(l => l.name && !l.hidden);
}

// ─── CLAUDE: evaluate one listing ──────────────────────────────────────────

async function evaluate(listing, categories) {
  const prompt = `You are a category QA agent for manitoubeachmichigan.com, a community directory for Manitou Beach and Devils Lake in the Irish Hills, Michigan.

Decide whether this business is in the right directory category.

Business:
- Name: "${listing.name}"
- Current category: "${listing.category}"
- Tagline: "${listing.tagline || '(none)'}"
- Description: "${listing.description || '(none)'}"
- Address: "${listing.address || '(none)'}"
- Website: "${listing.website || '(none)'}"

The ONLY categories that exist (you may not invent others):
${categories.map(c => `- ${c}`).join('\n')}

How these categories are actually used on this site:
- "Food & Drink" means places you go to eat or drink: restaurants, taverns, cafes. NOT food producers or market vendors.
- "Shopping & Gifts" covers retail and local goods, including makers who sell produce, honey, crafts at markets.
- "Places to Stay" is lodging ONLY (cottages, rentals, Airbnb). Never equipment or watercraft rental.
- "Rentals & Recreation" is equipment rental: watercraft, jet skis, golf carts, party equipment.
- "Storage & Property Care" is self storage, boat/RV storage, winterizing, dock and lift work.
- "Health & Wellness" is care and therapy: in-home senior care, home health, massage, chiropractic, fitness.
- "Health & Beauty" is salons, barbers, nails, spa.
- "Other" is a holding pen, never a correct destination.

Rules:
- Answer OK if the current category is reasonable. Prefer OK. Do not churn listings over a marginal preference.
- Answer MOVE only if a DIFFERENT category from the list above is clearly better. Set "category" to that exact string.
- Answer NO_FIT only if nothing in the list fits. Set "theme" to a short 1-3 word label for the kind of business it is (e.g. "farm goods", "auto repair"). Do not propose a category name.
- confidence is 0.0-1.0 for how sure you are. Use below 0.8 when it is a judgement call.

Respond with valid JSON only, no other text:
{"verdict":"OK","category":null,"confidence":0.9,"theme":null,"reason":"one short sentence"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 200, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) throw new Error(`Claude API error: ${await response.text()}`);

  const data = await response.json();
  let text = (data.content?.[0]?.text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`Unparseable model response: ${text.slice(0, 120)}`);
    parsed = JSON.parse(match[0]);
  }

  const verdict = ['OK', 'MOVE', 'NO_FIT'].includes(parsed.verdict) ? parsed.verdict : 'OK';
  const confidence = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0;
  return {
    verdict,
    category: typeof parsed.category === 'string' ? parsed.category : null,
    confidence,
    theme: typeof parsed.theme === 'string' ? parsed.theme : null,
    reason: String(parsed.reason || '').slice(0, 200),
  };
}

// ─── NOTION: writes (page properties only, never the schema) ───────────────

// Replace the old primary category in Categories[] while preserving any extra
// cross-listing tags a human added (e.g. Rob's Rentals also tagged Boating & Water).
function nextCategories(listing, target) {
  const kept = listing.categories.filter(c => c !== listing.category);
  return [...new Set([target, ...kept])];
}

async function applyMove(listing, target) {
  const r = await fetch(`https://api.notion.com/v1/pages/${listing.pageId}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({
      properties: {
        'Category': { select: { name: target } },
        'Categories': { multi_select: nextCategories(listing, target).map(name => ({ name })) },
        'Category QA': { rich_text: [{ type: 'text', text: { content: target } }] },
      },
    }),
  });
  if (!r.ok) throw new Error(`Notion move failed for ${listing.name}: ${await r.text()}`);
}

async function signOff(pageId, category) {
  const r = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ properties: { 'Category QA': { rich_text: [{ type: 'text', text: { content: category } }] } } }),
  });
  if (!r.ok) console.error(`category-qa: sign-off failed for ${pageId}:`, await r.text());
}

// ─── EMAIL DIGEST ──────────────────────────────────────────────────────────

function digestHtml({ evaluated, moved, proposed, newCategoryIdeas, errors }) {
  const site = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const row = (label, body) => `
    <div style="margin:0 0 24px;">
      <p style="margin:0 0 8px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${label}</p>
      ${body}
    </div>`;
  const li = items => `<ul style="margin:0;padding-left:18px;color:#3B3228;font-size:15px;line-height:1.7;">${items.join('')}</ul>`;

  const parts = [];

  if (moved.length) {
    parts.push(row(`Moved automatically (${moved.length})`, li(moved.map(m =>
      `<li><strong>${m.name}</strong>: ${m.from} &rarr; ${m.to}<br>
       <span style="color:#6B5D52;font-size:13px;">${m.reason}</span></li>`))));
  }
  if (proposed.length) {
    parts.push(row(`Needs your call (${proposed.length})`, li(proposed.map(p =>
      `<li><strong>${p.name}</strong>: currently ${p.from}, looks like <strong>${p.to}</strong>
       <span style="color:#8C806E;font-size:12px;">(${Math.round(p.confidence * 100)}% sure, left alone)</span><br>
       <span style="color:#6B5D52;font-size:13px;">${p.reason}</span></li>`))));
  }
  if (newCategoryIdeas.length) {
    parts.push(row('Possible new categories', li(newCategoryIdeas.map(t =>
      `<li>${t.listings.length} listings look like <strong>${t.theme}</strong>: ${t.listings.join(', ')}<br>
       <span style="color:#6B5D52;font-size:13px;">No category created. Add one in Notion if you agree.</span></li>`))));
  }
  if (errors.length) {
    parts.push(row(`Errors (${errors.length})`, li(errors.map(e => `<li>${e.name}: ${e.error}</li>`))));
  }

  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#3B3228;line-height:1.6;">
      <div style="background:#5B7E95;padding:28px;text-align:center;">
        <h1 style="color:#FAF6EF;font-size:20px;margin:0;">Category check</h1>
        <p style="color:#DCE7EE;font-size:13px;margin:6px 0 0;">${evaluated} listing${evaluated === 1 ? '' : 's'} reviewed</p>
      </div>
      <div style="padding:28px;">
        ${parts.join('')}
        <p style="color:#8C806E;font-size:12px;border-top:1px solid #E8DFD0;padding-top:14px;margin-top:8px;">
          The agent only moves listings between categories that already exist. It never creates,
          renames or deletes a category. Tick <strong>Category Locked</strong> on any listing you
          want it to leave alone. <a href="${site}/discover" style="color:#5B7E95;">View directory</a>
        </p>
      </div>
    </div>`;
}

async function sendDigest(summary) {
  // ADMIN_EMAIL is not set in prod today, so the literal is the working default
  // (same address cron-outreach-resolve uses).
  const to = process.env.QA_DIGEST_TO || process.env.ADMIN_EMAIL || 'admin@yetigroove.com';
  const resend = new Resend(process.env.RESEND_API_KEY);
  const n = summary.moved.length + summary.proposed.length;
  const { error } = await resend.emails.send({
    from: 'Manitou Beach <hello@manitoubeachmichigan.com>',
    to,
    subject: `Category check: ${summary.moved.length} moved, ${summary.proposed.length} to review`,
    html: digestHtml(summary),
  });
  if (error) throw new Error(JSON.stringify(error));
  console.log(`category-qa: digest sent to ${to} (${n} items)`);
}
