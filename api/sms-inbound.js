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
import {
  parseConsentReply, consentAnswerProperties, consentMode, PIN_CONSENT,
} from './lib/pinConsent.js';

// A vendor answering the morning permission text should not have to open a browser.
// One character back is the lowest-friction thing a person with one free hand can do,
// so Y and N are handled here before anything else looks at the message.
//
// Returns a reply string when this was a vendor answering, or null to fall through to
// the normal "forward it to Daryl" path. Falling through is the safe default: a message
// we can't confidently read is a message for a human, never a guess that publishes
// somebody's location.
async function handleVendorConsent(fromDigits, text) {
  const answer = parseConsentReply(text);
  if (answer === null) return null;

  const token = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_FOOD_TRUCKS;
  if (!token || !dbId) return null;

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Status', select: { equals: 'Active' } },
      page_size: 100,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();

  // Match on the phone number they texted from. Notion stores these in whatever shape
  // they were typed, so compare normalised digits rather than raw strings.
  const page = (data.results || []).find(
    pg => normalizePhone(pg.properties?.['Phone']?.phone_number || '') === fromDigits
  );
  if (!page) return null;

  const props = page.properties;
  const name = props['Name']?.title?.[0]?.text?.content || 'your truck';
  // Only trucks that are actually being asked can answer. A truck on Automatic texting
  // "yes" is answering a question nobody put to them, so hand it to Daryl instead.
  if (consentMode(props) !== PIN_CONSENT.ASK) return null;

  await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ properties: consentAnswerProperties(answer) }),
  });

  const slug = props['Slug']?.rich_text?.[0]?.text?.content || '';
  const tok = props['Checkin Token']?.rich_text?.[0]?.text?.content || '';
  const site = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const link = slug && tok
    ? `\n\n${site}/food-trucks?truck=${encodeURIComponent(slug)}&token=${encodeURIComponent(tok)}&ref=consent`
    : '';

  return answer
    ? `Got it - ${name} goes on the map today, and we'll post you to Facebook when the pin drops.\n\nChanged your mind, or want a different spot? Tap here any time:${link}`
    : `No problem - ${name} stays off the map today. Nothing gets posted.\n\nIf that changes, you can put yourself up in one tap:${link}`;
}

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
  // Vendor answering the morning permission text? Handle it and stop - Daryl does not
  // need a forwarded "Y" every Saturday morning.
  try {
    const consentReply = from ? await handleVendorConsent(from, text) : null;
    if (consentReply) {
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml(consentReply));
    }
  } catch (err) {
    // A failure here must never swallow the message. Fall through and forward it.
    console.error('sms-inbound consent handling failed:', err.message);
  }

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
