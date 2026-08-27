// POST /api/internal-alert
// Internal-only: sends an SMS alert to a NAMED recipient.
// Used by automated systems (e.g. Sunny Skies dispatcher) to surface operational warnings.
// Body: { token, message, to }
// token = either ADMIN_SECRET or ALERT_TOKEN.
// to    = a name from RECIPIENTS below, default 'admin'. Never a phone number:
//         ALERT_TOKEN is a low-privilege token shared with several unattended
//         jobs, and accepting a raw number would turn it into an SMS relay for
//         anyone who ever sees it in a log. Adding a recipient is a deliberate
//         code change plus an env var, which is the point.
//
// ALERT_TOKEN is a lower-privilege ops token that only opens this endpoint,
// same idea as FUEL_ALERT_TOKEN in fuel-alert.js. Callers that can only ever
// need to send a text should use it rather than ADMIN_SECRET, which also
// unlocks image and video upload, article generation, and the winery admin
// endpoints. The GitHub Actions runner that writes the AI Holly draft uses it.
// ADMIN_SECRET is still accepted so existing callers keep working unchanged.

import { sendSMSFull } from './lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, message, to: who = 'admin' } = req.body || {};

  const accepted = [process.env.ADMIN_SECRET, process.env.ALERT_TOKEN].filter(Boolean);
  if (!token || !accepted.includes(token)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const RECIPIENTS = {
    admin: process.env.ADMIN_PHONE,
    holly: process.env.HOLLY_PHONE,
  };

  if (!Object.prototype.hasOwnProperty.call(RECIPIENTS, who)) {
    return res.status(400).json({ error: `Unknown recipient '${who}'` });
  }

  const to = RECIPIENTS[who];
  if (!to) {
    // Named but not configured. Say which, because the alternative is an
    // unattended job reporting success for a text nobody received.
    return res.status(500).json({ error: `No phone number configured for '${who}'` });
  }

  const ok = await sendSMSFull(to, message.trim());
  if (!ok) return res.status(500).json({ error: 'SMS send failed' });

  return res.status(200).json({ sent: true, to: who });
}
