// POST /api/generate-social-copy
// Admin-only: generates social media copy in the Yeti/Manitou Beach voice using Haiku.
// Body: { token, postType, context? }

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You write social media posts for Manitou Beach Michigan - a community platform for a small lake town in the Irish Hills region.

Voice: warm, upbeat, conversational, slightly humorous. Like a friendly neighbor texting you about something fun happening at the lake. Community celebration energy - "there's a party and everyone's invited." Never corporate, never salesy, never stiff.

Rules:
- Short sentences. Punchy.
- No em dashes. Use commas, periods, or "..." instead.
- No hashtags except at the very end (2-4 relevant ones)
- No quotes around the post
- No intro like "Here's a post:" - just write the post directly
- Max 5 lines of copy before the hashtags
- Always end with a line break then hashtags
- The Yeti is a friendly mascot character - reference "the Yeti" occasionally but not every post
- Site URL is manitoubeachmichigan.com`;

const POST_TYPES = {
  launch: {
    label: 'Launch Announcement',
    prompt: 'Write a launch announcement post. The site is live and open to the community. Warm welcome energy, everyone is invited.',
  },
  events_calendar: {
    label: 'Events Calendar',
    prompt: 'Write a post promoting the events calendar. People can find out what\'s happening at the lake this weekend. Never miss something fun again.',
  },
  submit_event: {
    label: 'Submit Your Event',
    prompt: 'Write a post encouraging locals to submit their events (free, takes 5 minutes). Concerts, markets, cookoffs, bonfires, club meetings - all welcome.',
  },
  list_business: {
    label: 'List Your Business',
    prompt: 'Write a post encouraging local businesses to get listed in the directory. Restaurants, marinas, shops, rentals, services - get discovered by visitors.',
  },
  newsletter: {
    label: 'Newsletter',
    prompt: 'Write a post promoting the weekly newsletter. Short, no fluff, just what\'s happening at the lake each week.',
  },
  food_truck: {
    label: 'Food Truck Map',
    prompt: 'Write a post about the food truck tracker - find out which trucks are rolling in and where they\'re parked.',
  },
  wine_trail: {
    label: 'Wine Trail',
    prompt: 'Write a post about the Irish Hills wine trail and the wineries around Manitou Beach. Relaxed, fun, day-trip energy.',
  },
  weekend: {
    label: 'Weekend Vibe',
    prompt: 'Write a general "come to the lake this weekend" post. Warm, inviting, makes people want to drop what they\'re doing and head out.',
  },
  custom: {
    label: 'Custom',
    prompt: '', // filled from context field
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, postType = 'weekend', context = '' } = req.body || {};

  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const type = POST_TYPES[postType];
  if (!type) return res.status(400).json({ error: 'Invalid postType' });

  const userPrompt = postType === 'custom'
    ? `Write a social media post about: ${context}`
    : type.prompt + (context ? `\n\nExtra context: ${context}` : '');

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const copy = message.content[0]?.text?.trim() || '';
    return res.status(200).json({ copy });
  } catch (err) {
    console.error('generate-social-copy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
