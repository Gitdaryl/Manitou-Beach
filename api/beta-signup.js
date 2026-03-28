// /api/beta-signup.js
// GET  — returns { remaining } spots count
// POST { name, phone, email, is_business } — saves beta tester, returns access code on screen
import { Resend } from 'resend';
import { normalizePhone } from './lib/twilio.js';

const LAUNCH_DATE_DISPLAY = 'May 1 at noon';

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

  const max = parseInt(process.env.MAX_BETA_CODES || '30', 10);

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
        error: 'Beta access is full. Join us on launch day — May 1.',
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
        subject: `You're in, ${firstName} — your free Manitou Beach listing is waiting`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228; background: #FAF6EF; padding: 40px 32px; border-radius: 8px;">
            <p style="font-size: 22px; font-weight: bold; margin: 0 0 6px; color: #1A2830;">Welcome to Manitou Beach, ${firstName}.</p>
            <p style="font-size: 15px; color: #6B5F52; margin: 0 0 24px; line-height: 1.7;">You're one of the first businesses on a platform built for this community — for the people who love Devils Lake and come back every summer.</p>
            <p style="font-size: 15px; margin: 0 0 8px;">Your beta code: <strong style="font-size: 20px; letter-spacing: 3px; color: #1A2830;">${code}</strong></p>
            <p style="font-size: 13px; color: #8A7E6E; margin: 0 0 28px;">Screenshot it — you'll enter it when the site opens April 10.</p>
            <p style="font-size: 15px; margin: 0 0 16px; line-height: 1.7;">As a founding business, your listing is <strong>completely free through May 10</strong>. Add your card now — you won't be charged a cent until after the site launches.</p>
            <p style="margin: 28px 0;">
              <a href="${baseUrl}/beta-business" style="background: #D4845A; color: #FAF6EF; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                Choose My Listing Tier →
              </a>
            </p>
            <div style="background: #fff; border-radius: 6px; padding: 20px 24px; margin-bottom: 24px; border: 1px solid #E8DFD0;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #8A7E6E; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">Three tiers. All free until May 10.</p>
              <p style="margin: 0 0 6px; font-size: 14px;"><strong>Enhanced</strong> <span style="color: #8A7E6E;">— $9/mo</span> · Link, description, expandable card</p>
              <p style="margin: 0 0 6px; font-size: 14px;"><strong>Featured</strong> <span style="color: #8A7E6E;">— $23/mo</span> · Spotlight card, logo, priority placement (3 slots)</p>
              <p style="margin: 0; font-size: 14px;"><strong>Premium</strong> <span style="color: #8A7E6E;">— $43/mo</span> · Full-width banner, top of page (1 slot)</p>
            </div>
            <p style="font-size: 13px; color: #8A7E6E; margin: 0 0 6px;">Questions? Reply here or DM us on Facebook. We'll get back to you fast.</p>
            <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 28px 0 16px;">
            <p style="font-size: 11px; color: #9A8E7E; margin: 0;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
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
          `Hey ${firstName} — you're in! Welcome to the Manitou Beach beta.\n\n` +
          `Your personal access code: ${code}\n\n` +
          `This code is unique to you — please don't share it. Use it to enter the site each time you visit.\n\n` +
          `You have exclusive early access starting right now. The site opens to the public ${LAUNCH_DATE_DISPLAY} at manitoubeachmichigan.com — you get a head start.\n\n` +
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
    const spot_number = count + 1;
    return res.status(200).json({ success: true, code, remaining_codes, spot_number, is_business: !!is_business });
  } catch (err) {
    console.error('beta-signup error:', err.message);
    return res.status(500).json({ error: 'Server error — please try again' });
  }
}
