// /api/sms-inbound.js
// Twilio webhook for texts sent TO the Manitou Beach number.
//
// Before this existed, replies hit Twilio's stock "Configure your number's SMS
// URL to change this message" auto-response and nobody was told. An organizer
// texted asking to fix a misspelled performer name and got that back.
//
// Now: forward it to Daryl by text and email, and reply like a human would.

import { sendSMS, normalizePhone } from './lib/twilio.js';
import { Resend } from 'resend';

function twiml(message) {
  const esc = String(message)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${esc}</Message></Response>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const body = req.body || {};
  const from = normalizePhone(body.From || '');
  const text = (body.Body || '').trim();
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  // Twilio retries on non-200, and a duplicate forward is better than a lost
  // message, but a 500 here would also drop the organizer's auto-reply. So we
  // always answer 200 with TwiML and let the forwarding be best-effort.
  try {
    const pretty = from ? `(${from.slice(0, 3)}) ${from.slice(3, 6)}-${from.slice(6)}` : 'unknown number';

    if (process.env.DARYL_PHONE) {
      await sendSMS(
        process.env.DARYL_PHONE,
        `📩 Text to the Manitou number\nFrom: ${pretty}\n\n"${text.slice(0, 400)}"\n\nTheir events: ${siteUrl}/my-events`
      );
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Manitou Beach <tickets@manitoubeachmichigan.com>',
        to: process.env.ADMIN_EMAIL || 'daryl@manitoubeachmichigan.com',
        subject: `Text from ${pretty}`,
        html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#FAF6EF;">
          <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8C806E;margin-bottom:8px;">Inbound text</div>
          <h2 style="color:#1A2830;font-size:18px;margin:0 0 14px;">${pretty}</h2>
          <div style="padding:14px 18px;background:#fff;border:1px solid #E8DDD0;border-radius:8px;font-size:15px;color:#3A3028;line-height:1.7;white-space:pre-wrap;">${text.replace(/</g, '&lt;')}</div>
        </div>`,
      });
    }
  } catch (err) {
    console.error('sms-inbound forward failed:', err.message);
  }

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml(
    `Thanks for the message! Daryl gets these and will get back to you.\n\n` +
    `Need to change an event? You can do it yourself right here: ${siteUrl}/my-events`
  ));
}
