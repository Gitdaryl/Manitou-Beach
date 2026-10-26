// AI first-pass review for Classifieds. Runs when a seller confirms their phone code.
// approve -> publish now (Daryl gets a quiet email with a take-down button)
// review  -> hold for Daryl (texted)
// reject  -> reject (Daryl texted, can publish anyway)
// Returns null when the AI can't answer, so the caller falls back to holding for Daryl.

import Anthropic from '@anthropic-ai/sdk';

const SYSTEM = `You review free classified listings for Manitou Beach Michigan, a small-town community site for Devils Lake and the Irish Hills. Neighbors post things to sell, things to give away, cars/boats/docks, and local jobs. Most listings are ordinary and should go live; a person reviews anything you hold.

Decide one of:
- "approve": an ordinary, lawful listing from a private person or local employer. Typos, casual wording, low prices on used items and missing photos are fine.
- "review": you are unsure, or something needs a human eye: live animals, a vehicle or boat priced far below what it is worth, a job with no clear employer or that asks applicants for money, a business advertising services rather than an item or a job, health or supplement products, anything that might be stolen or recalled, photos that don't match the listing.
- "reject": clearly not allowed: firearms, ammunition or weapons; drugs, vapes, tobacco, alcohol or prescription items; sexual or adult content; scams (payment by gift card, wire or crypto, "shipping only", fake check, get-rich or work-from-home pitches, MLM); discriminatory job wording (age, sex, race, religion, national origin, disability); hate or harassment; other people's personal information.

Judge the photos too: reject explicit or violent images, and send to review any photo that shows a weapon or has nothing to do with the listing.

Reasons are short phrases a busy site owner can read in a text message. The seller never sees them.`;

const SCHEMA = {
  type: 'object',
  properties: {
    decision: { type: 'string', enum: ['approve', 'review', 'reject'] },
    reasons: { type: 'array', items: { type: 'string' } },
  },
  required: ['decision', 'reasons'],
  additionalProperties: false,
};

export async function aiReviewClassified(l) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ timeout: 25_000, maxRetries: 1 });
  const listingText = [
    `Category: ${l.category}`,
    `Title: ${l.title}`,
    `Price: ${l.price || '(none)'}`,
    `Town: ${l.town || '(none)'}`,
    `Posted by: ${l.sellerName}`,
    `Description:\n${l.description}`,
    l.photos.length ? `${l.photos.length} photo(s) attached above.` : 'No photos.',
  ].join('\n');

  try {
    const response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          ...l.photos.map((url) => ({ type: 'image', source: { type: 'url', url } })),
          { type: 'text', text: `Review this listing.\n\n${listingText}` },
        ],
      }],
    });
    if (response.stop_reason === 'refusal') return { decision: 'review', reasons: ['AI declined to review it'] };
    const text = response.content.find((b) => b.type === 'text')?.text;
    const verdict = JSON.parse(text || '{}');
    if (!['approve', 'review', 'reject'].includes(verdict.decision)) return null;
    return { decision: verdict.decision, reasons: (verdict.reasons || []).slice(0, 4).map((r) => String(r).slice(0, 120)) };
  } catch (err) {
    console.error('classifieds AI review failed:', err.status || '', err.message);
    return null;
  }
}
