import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const YETI_VOICE = `You are The Yeti — the editorial voice of The Manitou Dispatch, a community newsletter for Manitou Beach and Devils Lake, Michigan.

Your writing style:
- Warm, fun, and genuinely witty — like a knowledgeable local who's actually lived it
- Conversational but polished — not sloppy, not stuffy
- You love this place. That comes through in every line.
- Short-form focus — every word earns its place.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const { action, articleTitle, eventSummary, events, businesses } = req.body || {};

  try {
    if (action === 'subject') {
      // Generate 3 subject line options
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: YETI_VOICE,
        messages: [{
          role: 'user',
          content: `Generate 3 punchy email subject lines for this Manitou Dispatch newsletter issue.
Main article: "${articleTitle || 'Community update'}"
Weekend events: ${eventSummary || 'local events this weekend'}

Rules:
- Under 55 characters each
- Warm, community-feel, never clickbait
- Variety: one playful, one direct, one evocative of lake life
- Return ONLY a JSON array of 3 strings: ["...", "...", "..."]`,
        }],
      });

      const raw = msg.content[0].text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const options = JSON.parse(raw);
      return res.status(200).json({ options });
    }

    if (action === 'weekend-events') {
      // Format events into 5 weekend bullets
      const eventList = (events || []).slice(0, 10).map(e =>
        `${e.title || e.Name} — ${e.date || e.Date || ''} ${e.time || ''}`
      ).join('\n');

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: YETI_VOICE,
        messages: [{
          role: 'user',
          content: `Turn these upcoming events into exactly 5 newsletter bullets for "5 Things This Weekend".

Events:
${eventList}

Format each bullet: "☀️ Day · Event Name — one punchy line of what it is / why to go"
Use day abbreviations: Fri, Sat, Sun, Mon, etc.
Pick the 5 most interesting / varied events.
Return ONLY a JSON array of 5 strings: ["...", "...", "...", "...", "..."]`,
        }],
      });

      const raw = msg.content[0].text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const bullets = JSON.parse(raw);
      return res.status(200).json({ bullets });
    }

    if (action === 'welcome') {
      // Write a warm welcome shout-out for new businesses
      const names = (businesses || []).join(', ');

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: YETI_VOICE,
        messages: [{
          role: 'user',
          content: `Write a warm 2-sentence welcome shout-out for the newsletter, welcoming these new businesses to Manitou Beach: ${names}.

- Friendly, community-feel, genuine
- Mention the names naturally
- End with an invitation for readers to check them out
- Return ONLY the 2 sentences as a plain string (no JSON, no quotes)`,
        }],
      });

      const text = msg.content[0].text.trim();
      return res.status(200).json({ text });
    }

    return res.status(400).json({ error: 'Unknown action. Use: subject, weekend-events, welcome' });

  } catch (err) {
    console.error('newsletter-compose error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
