#!/usr/bin/env node
/**
 * Business Spotlight Reel Generator
 *
 * Usage:
 *   node scripts/generate-business-spotlight.js              — auto-picks next unfeatured business
 *   node scripts/generate-business-spotlight.js --slug chateau-aeronautique-winery
 *   node scripts/generate-business-spotlight.js --name "Chateau Aeronautique Winery"
 *
 * Outputs:
 *   - Rendered MP4 in video-templates/business-spotlight-b/renders/
 *   - Caption text logged to console (copy/paste for social post)
 *   - updates featured-log.json for round-robin rotation
 */

import fs   from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import Anthropic from '@anthropic-ai/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const require    = createRequire(import.meta.url);

// Load .env files manually (dotenv may not be installed; use built-in)
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  });
}
loadEnv(path.join(__dirname, '../.env.local'));
loadEnv(path.join(__dirname, '../.env'));

const NOTION_TOKEN  = process.env.NOTION_TOKEN_BUSINESS;
const NOTION_DB     = process.env.NOTION_DB_BUSINESS;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const TEMPLATE_DIR  = path.join(__dirname, '../video-templates/business-spotlight-b');
const TEMPLATE_FILE = path.join(TEMPLATE_DIR, 'template.html');  // source of truth
const RENDER_FILE   = path.join(TEMPLATE_DIR, 'index.html');     // generated before each render
const FEATURED_LOG  = path.join(TEMPLATE_DIR, 'featured-log.json');

// ── Slug util (mirrors src/utils/slugify.js) ────────────────────────────────
const toSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ── Category → gradient + bloom + SVG icon ──────────────────────────────────
const ICONS = {
  winery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200" width="520" height="867"
    fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 18,10 C 16,52 36,86 46,94 L 46,158 M 74,94 C 84,86 104,52 102,10 M 46,94 Q 60,100 74,94"/>
    <line x1="60" y1="158" x2="60" y2="158"/>
    <path d="M 46,158 L 74,158"/>
    <path d="M 28,168 Q 60,156 92,168"/>
  </svg>`,

  bar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180" width="560" height="840"
    fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 22,14 L 98,14 L 90,158 L 30,158 Z"/>
    <line x1="22" y1="14" x2="98" y2="14"/>
    <path d="M 18,8 L 102,8"/>
    <line x1="55" y1="60" x2="65" y2="60"/>
    <line x1="52" y1="90" x2="68" y2="90"/>
    <line x1="50" y1="120" x2="70" y2="120"/>
  </svg>`,

  water: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" width="900" height="450"
    fill="none" stroke="white" stroke-width="6" stroke-linecap="round">
    <path d="M 0,45 Q 40,12 80,45 Q 120,78 160,45 Q 200,12 240,45 Q 280,78 320,45"/>
    <path d="M 0,82 Q 40,49 80,82 Q 120,115 160,82 Q 200,49 240,82 Q 280,115 320,82"/>
    <path d="M 0,119 Q 40,86 80,119 Q 120,152 160,119 Q 200,86 240,119 Q 280,152 320,119"/>
  </svg>`,

  foodtruck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160" width="880" height="470"
    fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="48" width="178" height="88" rx="8"/>
    <path d="M 186,48 L 228,48 L 268,74 L 268,136 L 186,136"/>
    <circle cx="68" cy="144" r="22"/>
    <circle cx="210" cy="144" r="22"/>
    <rect x="38" y="66" width="108" height="46" rx="4"/>
    <path d="M 190,53 L 222,53 L 256,73 L 256,96 L 190,96"/>
    <line x1="8" y1="48" x2="186" y2="48"/>
  </svg>`,

  retail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 210" width="700" height="567"
    fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="20" y="88" width="220" height="122"/>
    <polygon points="10,88 130,22 250,88"/>
    <path d="M 103,210 L 103,163 Q 103,146 130,146 Q 157,146 157,163 L 157,210"/>
    <rect x="35" y="106" width="58" height="38" rx="3"/>
    <rect x="167" y="106" width="58" height="38" rx="3"/>
    <path d="M 85,132 Q 130,118 175,132"/>
  </svg>`,

  default: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 220" width="440" height="968"
    fill="none" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M 28,210 L 22,68 L 78,68 L 72,210 Z"/>
    <rect x="16" y="46" width="68" height="24" rx="2"/>
    <polygon points="12,46 50,18 88,46"/>
    <path d="M 38,210 L 38,174 Q 50,162 62,174 L 62,210"/>
    <line x1="23" y1="108" x2="77" y2="108"/>
    <line x1="22" y1="140" x2="78" y2="140"/>
    <line x1="22" y1="172" x2="78" y2="172"/>
  </svg>`,
};

const CATEGORY_CONFIGS = {
  winery: {
    gradient: 'linear-gradient(168deg,#0A0614 0%,#160922 30%,#200D32 58%,#120718 80%,#06030E 100%)',
    bloom:    'rgba(140,60,180,0.10)',
    icon:     ICONS.winery,
    label:    'WINERY',
  },
  bar: {
    gradient: 'linear-gradient(168deg,#100800 0%,#1C0E00 30%,#261400 58%,#120900 80%,#060400 100%)',
    bloom:    'rgba(180,100,20,0.11)',
    icon:     ICONS.bar,
    label:    'BAR & GRILL',
  },
  restaurant: {
    gradient: 'linear-gradient(168deg,#0E0800 0%,#1A0E00 30%,#221200 58%,#100800 80%,#060400 100%)',
    bloom:    'rgba(160,80,20,0.10)',
    icon:     ICONS.bar,
    label:    'RESTAURANT',
  },
  water: {
    gradient: 'linear-gradient(168deg,#040C14 0%,#081626 30%,#0A1E36 58%,#060E1A 80%,#020810 100%)',
    bloom:    'rgba(30,100,160,0.12)',
    icon:     ICONS.water,
    label:    'OUTDOORS',
  },
  foodtruck: {
    gradient: 'linear-gradient(168deg,#100800 0%,#1E1000 30%,#2C1600 58%,#120900 80%,#060400 100%)',
    bloom:    'rgba(200,110,10,0.11)',
    icon:     ICONS.foodtruck,
    label:    'FOOD TRUCK',
  },
  retail: {
    gradient: 'linear-gradient(168deg,#060C14 0%,#0C1826 30%,#101E30 58%,#081018 80%,#040810 100%)',
    bloom:    'rgba(60,100,140,0.10)',
    icon:     ICONS.retail,
    label:    'LOCAL BUSINESS',
  },
  default: {
    gradient: 'linear-gradient(168deg,#060C12 0%,#0D1B26 30%,#122230 58%,#0A1820 80%,#060C12 100%)',
    bloom:    'rgba(91,126,149,0.08)',
    icon:     ICONS.default,
    label:    'LOCAL BUSINESS',
  },
};

function getCategoryConfig(categories, customLabel) {
  const cat = (categories || []).join(' ').toLowerCase();
  let config;
  if (/wine|winery|vineyard|cider/.test(cat))                  config = { ...CATEGORY_CONFIGS.winery };
  else if (/food.?truck|truck/.test(cat))                      config = { ...CATEGORY_CONFIGS.foodtruck };
  else if (/water|marine|marina|boat|kayak|fishing|paddle/.test(cat)) config = { ...CATEGORY_CONFIGS.water };
  else if (/bar|tavern|brewery|brewing|pub|lounge/.test(cat))  config = { ...CATEGORY_CONFIGS.bar };
  else if (/restaurant|cafe|diner|dining|bistro|eatery|pizza|pizza/.test(cat)) config = { ...CATEGORY_CONFIGS.restaurant };
  else if (/retail|shop|store|boutique|gallery|salon|spa/.test(cat)) config = { ...CATEGORY_CONFIGS.retail };
  else                                                          config = { ...CATEGORY_CONFIGS.default };

  // Use the first Notion category as the label if available
  if (customLabel) config.label = customLabel.toUpperCase();
  else if (categories && categories[0]) config.label = categories[0].toUpperCase();
  return config;
}

// ── Name split ──────────────────────────────────────────────────────────────
function splitBusinessName(name) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return { line1: '', line2: name + '.' };
  if (words.length === 2) return { line1: words[0], line2: words[1] + '.' };
  const half = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, half).join(' '),
    line2: words.slice(half).join(' ') + '.',
  };
}

// ── Haiku: generate 3 punchy spotlight lines ────────────────────────────────
async function generateSpotlightLines(businessName, description, categories) {
  const client = new Anthropic({ apiKey: ANTHROPIC_KEY });
  const catStr = (categories || []).join(', ') || 'local business';
  const descStr = description || `A ${catStr} in Manitou Beach, Michigan`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `Business: ${businessName} (${catStr})
Description: ${descStr}

Write exactly 3 punchy ALL-CAPS phrases (2-4 words each) capturing what this business offers for a 10-second social reel. Also write one short lowercase subtitle (5-8 words, no period).

Rules: be specific to the business, not generic. No em dashes. Keep it warm and fun.

Respond with JSON only, no other text:
{"lines":["PHRASE ONE.","PHRASE TWO.","PHRASE THREE."],"sub":"short subtitle here"}`
    }]
  });

  try {
    const raw = msg.content[0].text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,'');
    const parsed = JSON.parse(raw);
    // Ensure each line ends with a period
    parsed.lines = parsed.lines.map(l => l.endsWith('.') ? l : l + '.');
    return parsed;
  } catch {
    // Fallback if Haiku returns unexpected format
    return {
      lines: ['LOCALLY OWNED.', 'MANITOU BEACH.', 'COME CHECK US OUT.'],
      sub: 'Part of your community.',
    };
  }
}

// ── Notion fetch ─────────────────────────────────────────────────────────────
async function fetchActiveBusinesses() {
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  });

  if (!res.ok) throw new Error(`Notion error: ${res.status} ${await res.text()}`);
  const data = await res.json();

  return data.results.map(page => {
    const p = page.properties;
    const txt = prop => prop?.rich_text?.[0]?.plain_text || prop?.title?.[0]?.plain_text || '';
    let categories = [];
    if (p['Categories']?.multi_select?.length) categories = p['Categories'].multi_select.map(c => c.name);
    else if (p['Category']?.select?.name) categories = [p['Category'].select.name];
    return {
      name:        txt(p['Name']),
      description: txt(p['Description']),
      logo:        p['Logo URL']?.url || null,
      website:     p['URL']?.url || null,
      instagram:   p['Instagram URL']?.url || null,
      facebook:    p['Facebook URL']?.url || null,
      categories,
      status:      p['Status']?.status?.name || '',
    };
  }).filter(b => b.name && b.status.startsWith('Listed'));
}

// ── Round-robin picker ───────────────────────────────────────────────────────
function pickNextBusiness(businesses, log, forceSlug) {
  if (forceSlug) {
    const match = businesses.find(b => toSlug(b.name) === forceSlug || b.name.toLowerCase() === forceSlug.toLowerCase());
    if (!match) throw new Error(`No active business found matching: ${forceSlug}`);
    return match;
  }

  const sorted = [...businesses].sort((a, b) => a.name.localeCompare(b.name));
  const featured = log.featured || [];
  const featuredSlugs = new Set(featured.map(f => f.slug));

  // First pass: any never-featured business
  const fresh = sorted.find(b => !featuredSlugs.has(toSlug(b.name)));
  if (fresh) return fresh;

  // All featured - pick the one featured longest ago
  const lastDate = {};
  featured.forEach(f => { lastDate[f.slug] = f.date; });
  return sorted.sort((a, b) => {
    const da = lastDate[toSlug(a.name)] || '1970-01-01';
    const db = lastDate[toSlug(b.name)] || '1970-01-01';
    return da.localeCompare(db);
  })[0];
}

// ── HTML generation ──────────────────────────────────────────────────────────
function buildLogoBlock(logoUrl) {
  if (!logoUrl) return '';
  // 260px on 1080px canvas ≈ 90px on a phone screen — visible, not oversized
  // top:190px centers a 260px circle in the top third (top-third midpoint: 320px, 320-130=190)
  return `  <div id="biz-logo" class="clip"
    data-start="0" data-duration="10" data-track-index="1"
    style="position:absolute;top:190px;left:50%;transform:translateX(-50%);
    width:260px;height:260px;border-radius:50%;overflow:hidden;
    border:3px solid rgba(250,246,239,0.28);
    box-shadow:0 0 60px rgba(255,255,255,0.10),0 0 120px rgba(255,255,255,0.04);
    opacity:0;">
    <img src="${logoUrl}" style="width:100%;height:100%;object-fit:cover;" alt=""/>
  </div>`;
}

function generateHtml(template, data) {
  return template
    .replace('{{BG_GRADIENT}}',   data.bgGradient)
    .replace('{{BLOOM_COLOR}}',   data.bloomColor)
    .replace('{{ICON_SVG}}',      data.iconSvg)
    .replace('{{LOGO_BLOCK}}',    data.logoBlock)
    .replace('{{CATEGORY_LABEL}}', data.categoryLabel)
    .replace('{{NAME_LINE_1}}',   data.nameLine1)
    .replace('{{NAME_LINE_2}}',   data.nameLine2)
    .replace('{{DESC_LINE_1}}',   data.descLine1)
    .replace('{{DESC_LINE_2}}',   data.descLine2)
    .replace('{{DESC_LINE_3}}',   data.descLine3)
    .replace('{{DESC_SUB}}',      data.descSub)
    .replace('{{PROFILE_SLUG}}',  data.profileSlug);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  let forceSlug = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i+1]) forceSlug = args[i+1];
    if (args[i] === '--name' && args[i+1]) forceSlug = toSlug(args[i+1]);
  }

  console.log('Fetching businesses from Notion...');
  const businesses = await fetchActiveBusinesses();
  console.log(`Found ${businesses.length} active businesses.`);

  const log = fs.existsSync(FEATURED_LOG)
    ? JSON.parse(fs.readFileSync(FEATURED_LOG, 'utf8'))
    : { featured: [] };

  const biz = pickNextBusiness(businesses, log, forceSlug);
  const slug = toSlug(biz.name);
  console.log(`\nSpotlighting: ${biz.name} (${slug})`);

  console.log('Generating spotlight lines with Haiku...');
  const spotlight = await generateSpotlightLines(biz.name, biz.description, biz.categories);
  console.log('Lines:', spotlight.lines);
  console.log('Sub:', spotlight.sub);

  const catConfig = getCategoryConfig(biz.categories);
  const { line1, line2 } = splitBusinessName(biz.name);

  const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');  // reads template.html
  const html = generateHtml(template, {
    bgGradient:    catConfig.gradient,
    bloomColor:    catConfig.bloom,
    iconSvg:       catConfig.icon,
    logoBlock:     buildLogoBlock(biz.logo),
    categoryLabel: catConfig.label,
    nameLine1:     line1,
    nameLine2:     line2,
    descLine1:     spotlight.lines[0] || 'LOCALLY OWNED.',
    descLine2:     spotlight.lines[1] || 'COMMUNITY FAVORITE.',
    descLine3:     spotlight.lines[2] || 'MANITOU BEACH.',
    descSub:       spotlight.sub || 'Right here in Manitou Beach.',
    profileSlug:   slug,
  });

  // Write to index.html (what hyperframes renders) — template.html stays clean
  fs.writeFileSync(RENDER_FILE, html, 'utf8');

  console.log('\nRendering video...');
  execSync('npx hyperframes render', { cwd: TEMPLATE_DIR, stdio: 'inherit' });

  // Find the newest render
  const renders = fs.readdirSync(path.join(TEMPLATE_DIR, 'renders'))
    .filter(f => f.endsWith('.mp4'))
    .map(f => ({ f, t: fs.statSync(path.join(TEMPLATE_DIR, 'renders', f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);

  const videoPath = renders[0] ? path.join(TEMPLATE_DIR, 'renders', renders[0].f) : null;

  // Update featured log
  log.featured.push({ name: biz.name, slug, date: new Date().toISOString().slice(0, 10) });
  // Keep last 200 entries
  if (log.featured.length > 200) log.featured = log.featured.slice(-200);
  fs.writeFileSync(FEATURED_LOG, JSON.stringify(log, null, 2), 'utf8');

  // Extract Instagram handle from URL or raw handle string
  function extractInstagramHandle(raw) {
    if (!raw) return null;
    // Strip URL prefix: https://instagram.com/handle or https://www.instagram.com/handle/
    const match = raw.match(/instagram\.com\/([^/?#]+)/i);
    if (match) return `@${match[1].replace(/\/$/, '')}`;
    // Already a handle
    const h = raw.trim();
    if (h.startsWith('@')) return h;
    if (/^[a-zA-Z0-9_.]+$/.test(h)) return `@${h}`;
    return null;
  }

  // Build caption
  const profileUrl = `https://manitoubeachmichigan.com/business/${slug}`;
  const igHandle  = extractInstagramHandle(biz.instagram);
  const websiteLine = biz.website ? `\nVisit them at: ${biz.website}` : '';
  const tagLine = igHandle ? `\nFollow them: ${igHandle}` : '';
  const caption = [
    `Shining a light on ${biz.name} - one of Manitou Beach's favorite local businesses.`,
    '',
    spotlight.lines.map(l => l.replace(/\.$/, '')).join(' - '),
    '',
    `Find them on the community guide:${websiteLine}${tagLine}`,
    profileUrl,
    '',
    '#ManitouBeach #MichiganLakeside #LocalBusiness #SupportLocal #IrishHillsMichigan',
  ].join('\n');

  console.log('\n--- SOCIAL CAPTION ---');
  console.log(caption);
  console.log('----------------------');
  if (videoPath) console.log(`\nVideo: ${videoPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
