// /api/beta-signup.js
// POST { name, phone } — saves beta tester to Notion, generates access code, sends SMS
//
// ⚙️  LAUNCH DATE — update this when A2P clears and you have a firm date:
//   LAUNCH_DATE is informational only here (used in SMS copy)
//   The actual gate is controlled by LAUNCH_DATE in src/App.jsx
const LAUNCH_DATE_DISPLAY = 'April 10 at noon';

function generateCode() {
  // MB + 4 random chars — excludes confusable chars (0, O, I, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MB';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // e.g. "MB7X2K"
}

function normalizePhone(raw) {
  return (raw || '').replace(/\D/g, '').slice(-10);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, _hp } = req.body || {};

    // Honeypot — bots fill this, humans don't
    if (_hp) {
      return res.status(200).json({ success: true, code: 'MBTEST' });
    }

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const digits = normalizePhone(phone);
    if (digits.length !== 10) {
      return res.status(400).json({ error: 'A valid 10-digit phone number is required' });
    }

    const firstName = name.trim().split(' ')[0];
    const code = generateCode();

    // ── Save to Notion ─────────────────────────────────────────────────────────
    const notionRes = await fetch(
      `https://api.notion.com/v1/pages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DB_BETA_TESTERS },
          properties: {
            'Name':        { title: [{ text: { content: name.trim() } }] },
            'Phone':       { phone_number: `+1${digits}` },
            'Access Code': { rich_text: [{ text: { content: code } }] },
            'Signup Date': { date: { start: new Date().toISOString() } },
            'SMS Sent':    { checkbox: false },
          },
        }),
      }
    );

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('beta-signup Notion error:', err);
      return res.status(500).json({ error: 'Failed to save — please try again' });
    }

    const notionPage = await notionRes.json();

    // ── Send SMS via Twilio (guarded — never fails the request if A2P not live) ──
    const twilioReady =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE;

    if (twilioReady) {
      try {
        const smsBody =
          `Hey ${firstName} — welcome to Manitou Beach!\n\n` +
          `Your beta access code: ${code}\n\n` +
          `Opens ${LAUNCH_DATE_DISPLAY}. Enter your code at manitoubeachmichigan.com — save this message.\n\n` +
          `Reply STOP to opt out.`;

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: 'Basic ' + Buffer.from(
                `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
              ).toString('base64'),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: process.env.TWILIO_PHONE,
              To: `+1${digits}`,
              Body: smsBody,
            }).toString(),
          }
        );

        if (twilioRes.ok) {
          // Best-effort: update SMS Sent flag in Notion
          fetch(`https://api.notion.com/v1/pages/${notionPage.id}`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
              properties: { 'SMS Sent': { checkbox: true } },
            }),
          }).catch(() => {}); // fire-and-forget
        } else {
          console.error('beta-signup Twilio error:', await twilioRes.text());
        }
      } catch (twilioErr) {
        console.error('beta-signup SMS exception:', twilioErr.message);
        // Continue — Notion save succeeded, return code to client as fallback
      }
    }

    return res.status(200).json({ success: true, code });
  } catch (err) {
    console.error('beta-signup error:', err.message);
    return res.status(500).json({ error: 'Server error — please try again' });
  }
}
