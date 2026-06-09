// scripts/tech-radar.js
// Weekly capability radar for the Yeti Groove portfolio.
// Scans the frontier (AI model releases, dev tooling, Claude Code skills/MCP,
// video/creative AI, and optional competitor/clone alerts), ranks each item
// against Daryl's actual stack + projects with Haiku, then:
//   - emails a ranked digest to Daryl (Resend)
//   - creates Notion Command Center task rows for the "do" items only
//
// Designed to clone like the video pipeline: every external dependency
// degrades gracefully. A missing key skips that source/sink with a logged
// note, never a hard failure.
//
// Run weekly via .github/workflows/weekly-tech-radar.yml
// Flags:
//   --preview   fetch + rank + print only (no email, no Notion writes)

import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { sendSMS, normalizePhone } from '../api/lib/twilio.js';

const PREVIEW = process.argv.includes('--preview');

const {
  ANTHROPIC_API_KEY,
  RESEND_API_KEY,
  RADAR_FROM = 'Yeti Radar <radar@yetigroove.com>',
  RADAR_TO = 'admin@yetigroove.com',
  // Notion Command Center (Yeti workspace - NOT the MB business token)
  NOTION_COMMAND_CENTER_TOKEN,
  NOTION_DB_COMMAND_CENTER,
  // Optional integrations
  GITHUB_TOKEN,
  BRAVE_API_KEY,
  // SMS ping for high-urgency items (reuses MB's Twilio setup)
  DARYL_PHONE,
} = process.env;

// Falls back to the known Master Task Board id. Uses `||` not a default param
// because GitHub Actions injects "" (not undefined) for unset secrets.
const COMMAND_CENTER_DB = NOTION_DB_COMMAND_CENTER || '14f8e7a675dc442394d304c6498d5bb2';

const NOW = Date.now();
const SINCE_TS = Math.floor((NOW - 7 * 24 * 60 * 60 * 1000) / 1000); // 7 days ago, unix seconds
const SINCE_DATE = new Date(NOW - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // YYYY-MM-DD

// ── Portfolio context (drives relevance ranking) ────────────────────────────
// Kept concise but specific. This is what makes the radar signal not noise.
const PORTFOLIO_CONTEXT = `
You are the capability scout for Daryl Young's company, Yeti Groove Media LLC.
Your job: from a list of recent tech items, decide which actually matter to HIS work and rank them. Be ruthless. Most items are noise.

HIS STACK: React + Vite + Tailwind, deployed on Vercel. Notion as CMS/DB (via REST API). Stripe Connect (Express) for payments. Twilio for SMS. Resend for email. Anthropic Claude (Haiku for automation, Opus for strategy) for all AI. ElevenLabs TTS. Hyperframes/HeyGen + Puppeteer + FFmpeg for video. Meta Graph API for social posting. Seedance/Kie AI + Higgsfield for generative video. GitHub Actions for cron automation.

HIS PROJECTS:
- Manitou Beach: hyperlocal community platform (events, business listings, ticketing, SMS, food trucks, wineries). His flagship and main income engine.
- Yetickets: standalone ticketing SaaS, Stripe Connect, multi-community expansion.
- Sunny Skies / Hammill Electric / Holly Realty: client work — automated social video, AI receptionists (Vapi), real estate sites.
- YetiClone: AI video SaaS (HeyGen wrapper, white-label).
- Legacy archives: Joe Profit, Swayze, Warhawks.

HIS STRATEGY & MOAT: The moat is hyperlocal network density and merchant/community relationships, NOT software features. Goals: (1) make the platform run autonomously (AI CEO vision), (2) templatize Manitou Beach so new territory "fishbowls" spin up at near-zero marginal cost, (3) raise revenue. He wants to adopt useful tech FASTER than a funded competitor could, and get early warning of anyone cloning his model in his target territories (South Haven, Traverse City, and other Michigan/Midwest tourist towns).

RANK each item with one of three verdicts:
- "do": directly useful to a current project or strategy AND adoptable soon. Reserve this for genuinely actionable, high-signal items. These become tasks.
- "watch": relevant trajectory, worth knowing, not yet actionable.
- "ignore": noise for him. (You will drop these — do not return them.)
`;

// ── Source fetchers (all degrade gracefully) ────────────────────────────────

async function safe(label, fn) {
  try {
    const items = await fn();
    console.log(`  [${label}] ${items.length} items`);
    return items;
  } catch (err) {
    console.warn(`  [${label}] skipped: ${err.message}`);
    return [];
  }
}

// Hacker News (Algolia API, no key) — AI model releases + creative-AI chatter
async function fetchHN(queries, sourceTag) {
  const out = [];
  for (const q of queries) {
    const url = `https://hn.algolia.com/api/v1/search?tags=story&query=${encodeURIComponent(q)}&numericFilters=created_at_i>${SINCE_TS},points>40&hitsPerPage=8`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HN ${res.status}`);
    const { hits = [] } = await res.json();
    for (const h of hits) {
      out.push({
        source: sourceTag,
        title: h.title,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        signal: `${h.points} pts, ${h.num_comments || 0} comments`,
      });
    }
  }
  return dedupe(out);
}

// GitHub repositories created in the last 7 days, by stars, for given queries
async function fetchGitHub(queries, sourceTag) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'yeti-tech-radar',
    ...(GITHUB_TOKEN && { Authorization: `Bearer ${GITHUB_TOKEN}` }),
  };
  const out = [];
  for (const q of queries) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`${q} created:>${SINCE_DATE}`)}&sort=stars&order=desc&per_page=6`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const { items = [] } = await res.json();
    for (const r of items) {
      if ((r.stargazers_count || 0) < 25) continue; // floor out noise
      out.push({
        source: sourceTag,
        title: `${r.full_name} — ${r.description || 'no description'}`,
        url: r.html_url,
        signal: `${r.stargazers_count}★ new`,
      });
    }
  }
  return dedupe(out);
}

// Optional: competitor / clone alerts via Brave Search API
async function fetchCloneAlerts() {
  if (!BRAVE_API_KEY) {
    console.warn('  [clone-alerts] skipped: no BRAVE_API_KEY (add one to enable competitor monitoring)');
    return [];
  }
  const queries = [
    'community events platform South Haven Michigan',
    'local business directory Traverse City Michigan',
    'town community website ticketing Michigan launch',
  ];
  const out = [];
  for (const q of queries) {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&freshness=pw&count=5`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'X-Subscription-Token': BRAVE_API_KEY },
    });
    if (!res.ok) throw new Error(`Brave ${res.status}`);
    const data = await res.json();
    for (const r of data.web?.results || []) {
      out.push({
        source: 'clone-alert',
        title: `${r.title} — ${r.description || ''}`.slice(0, 220),
        url: r.url,
        signal: 'past week',
      });
    }
  }
  return dedupe(out);
}

function dedupe(items) {
  const seen = new Set();
  return items.filter(i => {
    const key = (i.url || i.title || '').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Gather all candidates ───────────────────────────────────────────────────
async function gatherCandidates() {
  console.log('Gathering candidates (last 7 days)...');
  const groups = await Promise.all([
    // AI model + Claude releases
    safe('ai-releases', () => fetchHN(
      ['Claude Anthropic', 'OpenAI GPT', 'Gemini model', 'open source LLM release'],
      'ai-release',
    )),
    // GitHub + dev tooling relevant to his stack
    safe('dev-tooling', () => fetchGitHub(
      ['topic:mcp', 'claude code skill', 'topic:ai-agents', 'stripe OR notion OR vercel toolkit'],
      'dev-tool',
    )),
    // Video / creative AI
    safe('video-ai', () => fetchHN(
      ['text to video model', 'AI video generation', 'voice cloning TTS'],
      'video-ai',
    )),
    // Competitor / clone alerts (optional)
    safe('clone-alerts', () => fetchCloneAlerts()),
  ]);
  const all = dedupe(groups.flat());
  console.log(`Total unique candidates: ${all.length}`);
  return all;
}

// ── Rank with Haiku ─────────────────────────────────────────────────────────
async function rankCandidates(candidates) {
  if (!candidates.length) return [];
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY required for ranking');

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const numbered = candidates.map((c, i) =>
    `${i}. [${c.source}] ${c.title}\n   ${c.url} (${c.signal})`
  ).join('\n');

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: PORTFOLIO_CONTEXT,
    messages: [{
      role: 'user',
      content: `Here are this week's candidate items. Rank the ones that matter to Daryl. Drop everything you'd mark "ignore".

Return ONLY a JSON array (no prose, no markdown fences). Each element:
{
  "index": <number from the list>,
  "verdict": "do" | "watch",
  "category": "AI model" | "Dev tool" | "Video/creative" | "Competitor" | "Other",
  "project": one of ["Manitou Beach","Yetickets","Sunny Skies","Swayze Legacy","Holly Realty","Joe Profit","DLVL - Darlene","YetiClone","Yeti Groove Media","Business Dev"],
  "why": "<one sharp sentence: what it is + why it matters to HIS work>",
  "effort": "trivial" | "moderate" | "significant",
  "urgent": true | false
}

Set "urgent": true ONLY for items that warrant interrupting his day with a text — a competitor/clone surfacing in one of his target territories, or a capability shift that materially changes a build already in progress. Almost everything should be urgent:false. A normal week has zero urgent items.

Order the array most-important first. Max 12 items. Be ruthless — fewer, higher-signal items beat a long list.

CANDIDATES:
${numbered}`,
    }],
  });

  const raw = msg.content[0]?.text || '[]';
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    parsed = match ? JSON.parse(match[0]) : [];
  }

  // Hydrate with original candidate data
  return parsed
    .filter(r => candidates[r.index])
    .map(r => ({ ...candidates[r.index], ...r }));
}

// ── Notion: create task rows for "do" items ─────────────────────────────────
async function pushToNotion(items) {
  const doItems = items.filter(i => i.verdict === 'do');
  if (!doItems.length) {
    console.log('No "do" items — nothing pushed to Command Center.');
    return 0;
  }
  if (!NOTION_COMMAND_CENTER_TOKEN) {
    console.warn(`  [notion] skipped: no NOTION_COMMAND_CENTER_TOKEN. ${doItems.length} "do" items would have been created. (Add a Yeti-workspace Notion token with Command Center access to enable.)`);
    return 0;
  }

  const headers = {
    Authorization: `Bearer ${NOTION_COMMAND_CENTER_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  let created = 0;
  for (const it of doItems) {
    const body = {
      parent: { database_id: COMMAND_CENTER_DB },
      properties: {
        Task: { title: [{ text: { content: `Radar: ${it.title}`.slice(0, 100) } }] },
        Status: { select: { name: 'Backlog' } },
        Priority: { select: { name: it.effort === 'trivial' ? 'High' : 'Medium' } },
        Type: { select: { name: 'Decision' } },
        Project: { select: { name: it.project || 'Yeti Groove Media' } },
        Assigned: { select: { name: 'Daryl' } },
        Notes: { rich_text: [{ text: { content: `${it.why}\n\n${it.url}\n[${it.category} · effort: ${it.effort} · source: ${it.source}]`.slice(0, 1900) } }] },
      },
    };
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST', headers, body: JSON.stringify(body),
    });
    if (res.ok) {
      created++;
    } else {
      console.warn(`  [notion] failed for "${it.title}": ${await res.text()}`);
    }
  }
  console.log(`Notion: created ${created}/${doItems.length} task rows.`);
  return created;
}

// ── Email digest via Resend ─────────────────────────────────────────────────
function renderEmail(items, candidateCount) {
  const doItems = items.filter(i => i.verdict === 'do');
  const watchItems = items.filter(i => i.verdict === 'watch');
  const week = new Date(NOW).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const row = (it) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top;">
        <div style="font-weight:600;color:#1a1a1a;">${esc(it.title)}</div>
        <div style="color:#444;font-size:14px;margin:4px 0;">${esc(it.why || '')}</div>
        <div style="font-size:12px;color:#888;">
          ${esc(it.category)} · ${esc(it.project)} · effort: ${esc(it.effort)} ·
          <a href="${esc(it.url)}" style="color:#5B7E95;">open</a>
        </div>
      </td>
    </tr>`;

  const section = (title, list, color) => list.length ? `
    <h2 style="font-size:15px;color:${color};margin:24px 0 4px;text-transform:uppercase;letter-spacing:.5px;">${title} (${list.length})</h2>
    <table width="100%" cellpadding="0" cellspacing="0">${list.map(row).join('')}</table>` : '';

  return `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#FAF6EF;margin:0;padding:24px;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;">
      <div style="font-size:13px;color:#D4845A;font-weight:700;letter-spacing:1px;">YETI CAPABILITY RADAR</div>
      <h1 style="font-size:22px;color:#1a1a1a;margin:4px 0 2px;">Week of ${week}</h1>
      <div style="font-size:13px;color:#888;">${candidateCount} items scanned · ${doItems.length} actionable · ${watchItems.length} to watch</div>
      ${doItems.length ? `<div style="font-size:13px;color:#444;margin-top:12px;">The ${doItems.length} "do" item(s) below were added to your Command Center backlog.</div>` : ''}
      ${section('Do now', doItems, '#C0392B')}
      ${section('Watch', watchItems, '#5B7E95')}
      ${!items.length ? '<p style="color:#888;margin-top:20px;">Quiet week — nothing cleared the bar. That is fine.</p>' : ''}
      <div style="margin-top:28px;font-size:11px;color:#aaa;">Auto-generated by tech-radar.js · reply to this email to tune what it watches.</div>
    </div></body></html>`;
}

function esc(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendDigest(items, candidateCount) {
  if (!RESEND_API_KEY) {
    console.warn('  [email] skipped: no RESEND_API_KEY');
    return false;
  }
  const resend = new Resend(RESEND_API_KEY);
  const doCount = items.filter(i => i.verdict === 'do').length;
  const { error } = await resend.emails.send({
    from: RADAR_FROM,
    to: RADAR_TO,
    subject: `Yeti Radar · ${doCount} to act on this week`,
    html: renderEmail(items, candidateCount),
  });
  if (error) {
    console.warn(`  [email] failed: ${JSON.stringify(error)}`);
    return false;
  }
  console.log(`Email: digest sent to ${RADAR_TO}.`);
  return true;
}

// ── SMS ping for urgent items (rare by design) ──────────────────────────────
async function pingUrgent(items) {
  const urgent = items.filter(i => i.urgent && i.verdict === 'do');
  if (!urgent.length) {
    console.log('No urgent items — no SMS.');
    return false;
  }
  if (!DARYL_PHONE) {
    console.warn(`  [sms] skipped: no DARYL_PHONE. ${urgent.length} urgent item(s) would have pinged.`);
    return false;
  }
  const lead = urgent[0];
  const extra = urgent.length > 1 ? ` (+${urgent.length - 1} more)` : '';
  const body = `Yeti Radar - URGENT${extra}\n${lead.title.slice(0, 110)}\n${lead.why.slice(0, 120)}\n${lead.url}\nFull digest in your inbox.`;
  try {
    await sendSMS(normalizePhone(DARYL_PHONE), body);
    console.log(`SMS: pinged ${DARYL_PHONE} about ${urgent.length} urgent item(s).`);
    return true;
  } catch (err) {
    console.warn(`  [sms] failed: ${err.message}`);
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Yeti Tech Radar — ${new Date(NOW).toISOString()}${PREVIEW ? ' (PREVIEW)' : ''}`);

  const candidates = await gatherCandidates();
  const ranked = await rankCandidates(candidates);
  console.log(`Ranked ${ranked.length} items (${ranked.filter(i => i.verdict === 'do').length} "do", ${ranked.filter(i => i.verdict === 'watch').length} "watch").`);

  if (PREVIEW) {
    console.log('\n=== PREVIEW (no writes) ===');
    for (const it of ranked) {
      const flag = it.urgent ? ' ⚠ URGENT' : '';
      console.log(`[${it.verdict.toUpperCase()}]${flag} (${it.project}) ${it.title}\n   ${it.why}\n   ${it.url}\n`);
    }
    return;
  }

  await pushToNotion(ranked);
  await sendDigest(ranked, candidates.length);
  await pingUrgent(ranked);
  console.log('Done.');
}

main().catch(err => {
  console.error('tech-radar fatal:', err);
  process.exit(1);
});
