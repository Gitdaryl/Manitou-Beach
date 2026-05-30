// POST /api/fuel-alert
// Internal-only: SMS alert for automated content pipeline warnings (e.g. Sunny Skies dispatcher).
// Body: { token, message }
// token = FUEL_ALERT_TOKEN env var (separate from ADMIN_SECRET — lower-privilege ops token)

import { sendSMSFull } from './lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, message } = req.body || {};

  if (!token || token !== process.env.FUEL_ALERT_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const to = process.env.ADMIN_PHONE;
  if (!to) return res.status(500).json({ error: 'ADMIN_PHONE not configured' });

  const ok = await sendSMSFull(to, message.trim());
  if (!ok) return res.status(500).json({ error: 'SMS send failed' });

  return res.status(200).json({ sent: true });
}
