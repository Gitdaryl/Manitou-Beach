// Fire-and-forget notice to the n8n "MB Photo Flag Notify" workflow.
// n8n emails Yeti on every flag and adds an SMS for auto-hide / AI blocks.
// Failures here must never break the user-facing request.

const HOOK = process.env.N8N_FLAG_WEBHOOK || 'https://n8n.yetigroove.com/webhook/mb-photo-flag';

// payload: { event: 'flag'|'auto-hide'|'prescreen-block', slug, photoUrl, name, reason, flags, id }
export async function notifyFlagHook(payload) {
  try {
    await fetch(HOOK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined,
    });
  } catch (err) {
    console.warn('flag notify skipped:', err.message);
  }
}
