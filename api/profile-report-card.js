// GET /api/profile-report-card?slug=xxx&claimToken=yyy
// Returns completeness score, gaps, and a Haiku-generated nudge for the business owner.
// Only accessible with a valid claim token.

import Anthropic from '@anthropic-ai/sdk';
import { verifyClaimToken } from './verify-claim.js';

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

export function scoreProfile(p) {
  const name    = p['Name']?.title?.[0]?.text?.content || '';
  const tier    = (() => {
    const s = p['Status']?.status?.name || '';
    if (s.includes('Premium')) return 'premium';
    if (s.includes('Featured')) return 'featured';
    if (s.includes('Enhanced')) return 'enhanced';
    return 'free';
  })();
  const category = p['Category']?.select?.name || 'Business';
  const phone   = p['Phone']?.phone_number || '';

  const fields = {
    heroPhoto:  { value: !!(p['Hero Photo URL']?.url),                   points: 20, label: 'hero photo',       tip: 'A real photo makes your listing 3x more clickable.' },
    googlePlaceId: { value: !!(p['Google Place ID']?.rich_text?.[0]?.text?.content), points: 20, label: 'Google reviews', tip: 'Pulls your Google reviews in automatically - social proof that converts.' },
    description:{ value: (p['Description']?.rich_text?.[0]?.text?.content || '').length > 30, points: 15, label: 'description', tip: 'People want to know your vibe before they call.' },
    hours:      { value: !!(p['Hours']?.rich_text?.[0]?.text?.content),  points: 15, label: 'hours',            tip: 'Nothing kills a visit like showing up when you\'re closed.' },
    logo:       { value: !!(p['Logo URL']?.url),                         points: 10, label: 'logo',             tip: 'Brand recognition starts with a face.' },
    website:    { value: !!(p['URL']?.url),                              points:  5, label: 'website link',     tip: 'Sends people straight to you.' },
    tagline:    { value: !!(p['Tagline']?.rich_text?.[0]?.text?.content), points:  5, label: 'tagline',         tip: 'One great line that sticks in someone\'s head.' },
    social:     { value: !!(p['Instagram URL']?.url || p['Facebook URL']?.url), points: 5, label: 'social link', tip: 'Lets visitors follow along all summer.' },
    phone:      { value: !!phone,                                         points:  5, label: 'phone number',    tip: 'Your fastest path to a new customer.' },
  };

  let score = 0;
  const gaps = [];
  const present = [];

  for (const [key, f] of Object.entries(fields)) {
    if (f.value) {
      score += f.points;
      present.push(f.label);
    } else {
      gaps.push({ key, label: f.label, points: f.points, tip: f.tip });
    }
  }

  // Sort gaps by impact
  gaps.sort((a, b) => b.points - a.points);

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

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { slug, claimToken } = req.query;
  if (!slug || !claimToken) return res.status(400).json({ error: 'slug and claimToken required' });

  try {
    const page = await findBusinessBySlug(slug);
    if (!page) return res.status(404).json({ error: 'Business not found' });

    if (!verifyClaimToken(page.id, claimToken)) return res.status(403).json({ error: 'Invalid claim token' });

    const { score, gaps, present, name, tier, category, phone } = scoreProfile(page.properties);
    const nudge = await generateNudge(name, category, score, gaps, present);

    return res.status(200).json({
      score,
      gaps: gaps.slice(0, 3).map(g => ({ label: g.label, tip: g.tip, points: g.points })),
      topGap: gaps[0] || null,
      nudge,
      tier,
      name,
    });
  } catch (err) {
    console.error('profile-report-card error:', err.message);
    return res.status(500).json({ error: 'Could not load report card' });
  }
}
