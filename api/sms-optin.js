// POST /api/sms-optin
// Stub endpoint — returns pending_a2p until Twilio A2P registration is approved.
// Once A2P is live, replace this with real opt-in logic (RSVP reminders, event alerts, etc.)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  return res.status(200).json({ status: 'pending_a2p' });
}
