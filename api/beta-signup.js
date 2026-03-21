// /api/beta-signup.js
// GET  — returns { remaining } spots count
// POST { name, phone, email, is_business } — saves beta tester, returns access code on screen
import { Resend } from 'resend';

const LAUNCH_DATE_DISPLAY = 'April 10 at noon';

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

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

async function getBetaCount() {
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BETA_TESTERS}/query`,
      {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({ page_size: 1 }),
      }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return data.total_results_estimate ?? (data.results?.length ?? 0);
  } catch {
    return 0;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const max = parseInt(process.env.MAX_BETA_CODES || '29', 10);

  // ── GET: return remaining spots ───────────────────────────────────────────
  if (req.method === 'GET') {
    const count = await getBetaCount();
    return res.status(200).json({ remaining: Math.max(0, max - count) });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, is_business, _hp } = req.body || {};

    // Honeypot — bots fill this, humans don't
    if (_hp) {
      return res.status(200).json({ success: true, code: 'MBTEST', remaining_codes: max });
    }

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const digits = normalizePhone(phone);
    if (digits.length !== 10) {
      return res.status(400).json({ error: 'A valid 10-digit phone number is required' });
    }
    const emailClean = (email || '').trim().toLowerCase();
    if (!emailClean || !emailClean.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }

    // ── Cap check ─────────────────────────────────────────────────────────
    const count = await getBetaCount();
    if (count >= max) {
      return res.status(200).json({
        success: false,
        error: 'Beta access is full. Join us on launch day — April 10.',
      });
    }

    const firstName = name.trim().split(' ')[0];
    const code = generateCode();

    // ── Save to Notion ─────────────────────────────────────────────────────
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_BETA_TESTERS },
        properties: {
          'Name':        { title: [{ text: { content: name.trim() } }] },
          'Phone':       { phone_number: `+1${digits}` },
          'Email':       { email: emailClean },
          'Access Code': { rich_text: [{ text: { content: code } }] },
          'Signup Date': { date: { start: new Date().toISOString() } },
          'SMS Sent':    { checkbox: false },
          'Is Business': { checkbox: !!is_business },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('beta-signup Notion error:', err);
      return res.status(500).json({ error: 'Failed to save — please try again' });
    }

    // ── Beehiiv auto-subscribe (fire-and-forget) ───────────────────────────
    if (process.env.BEEHIIV_PUBLICATION_ID && process.env.BEEHIIV_API_KEY) {
      fetch(
        `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailClean,
            reactivate_existing: false,
            send_welcome_email: false,
            utm_source: 'beta-signup',
            utm_medium: 'organic',
          }),
        }
      ).catch(() => {});
    }

    // ── Business owner: email with self-serve listing link ─────────────────
    if (is_business && process.env.RESEND_API_KEY) {
      const baseUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: 'Manitou Beach <events@yetigroove.com>',
        to: emailClean,
        subject: 'Your free beta listing is waiting — choose your tier',
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228;">
            <p style="font-size: 18px; margin-bottom: 8px;">Hi ${firstName},</p>
            <p>Welcome to the Manitou Beach beta! Your access code is <strong>${code}</strong> — screenshot it, you'll need it on April 10.</p>
            <p>As a local business owner, your listing is <strong>free through May 10th</strong>. Choose your tier and add your card — no charge until May 10:</p>
            <p style="margin: 24px 0;">
              <a href="${baseUrl}/beta-business" style="background: #D4845A; color: #FAF6EF; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
                Activate My Free Listing →
              </a>
            </p>
            <p style="font-size: 13px; color: #8A7E6E;">
              <strong>Enhanced</strong> — $9/mo · Clickable link, description, expandable card<br>
              <strong>Featured</strong> — $23/mo · Spotlight card, logo, priority placement<br>
              <strong>Premium</strong> — $43/mo · Full-width banner, top placement (1 slot)
            </p>
            <p style="font-size: 13px; color: #8A7E6E;">Questions? Reply to this email or DM us on Facebook.</p>
            <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 24px 0;">
            <p style="font-size: 11px; color: #9A8E7E;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
          </div>
        `,
      }).catch(() => {});
    }

    // ── SMS via Twilio (guarded — soft-fail if A2P not live) ───────────────
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

        await fetch(
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
      } catch (twilioErr) {
        console.error('beta-signup SMS exception:', twilioErr.message);
      }
    }

    const remaining_codes = Math.max(0, max - count - 1);
    return res.status(200).json({ success: true, code, remaining_codes, is_business: !!is_business });
  } catch (err) {
    console.error('beta-signup error:', err.message);
    return res.status(500).json({ error: 'Server error — please try again' });
  }
}
