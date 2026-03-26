// /api/verify-event.js
// POST { phone, code } — verifies SMS code, publishes event, sets Edit Token.
// POST { phone, resend: true } — resends stored code.
//
// For platform_ticketing and vendor_market types, returns needsStripe: true.
// The frontend then calls /api/event-stripe-onboard to create the Stripe Express account.

import crypto from 'crypto';
import { sendSMS, normalizePhone } from './lib/twilio.js';
import { Resend } from 'resend';

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// HMAC session token — valid for the current 8-hour window.
// Lets a rep verify once and submit multiple events without re-verifying.
function generateSessionToken(normalizedPhone) {
  const window = Math.floor(Date.now() / (8 * 60 * 60 * 1000));
  return crypto
    .createHmac('sha256', process.env.NOTION_TOKEN_EVENTS)
    .update(`${normalizedPhone}:${window}`)
    .digest('hex');
}

async function queryPendingEvents(notionToken, dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Status', status: { equals: 'Pending' } },
      page_size: 100,
    }),
  });
  if (!res.ok) throw new Error('Notion query failed: ' + await res.text());
  return (await res.json()).results || [];
}

function getEventType(page) {
  const p = page.properties;
  if (p['Vendor Reg Enabled']?.checkbox) return 'vendor_market';
  if (p['Tickets Enabled']?.checkbox) return 'platform_ticketing';
  if (p['RSVP Enabled']?.checkbox) {
    const attendance = p['Attendance']?.select?.name || '';
    return attendance === 'rsvp_required' ? 'rsvp_required' : 'rsvp_appreciated';
  }
  if (p['Event URL']?.url) return 'own_ticketing';
  return 'free';
}

// ── AUTO-MODERATION ──
// Checks event content quality before publishing.
// Returns { pass: true/false, flags: string[], severity: 'clean'|'warn'|'hold' }
function moderateEvent(page) {
  const p = page.properties;
  const name = p['Event Name']?.title?.[0]?.text?.content || '';
  const desc = p['Description']?.rich_text?.[0]?.text?.content || '';
  const location = p['Location']?.rich_text?.[0]?.text?.content || '';
  const combined = `${name} ${desc} ${location}`.toLowerCase();

  const flags = [];

  // 1. Name too short or empty
  if (name.trim().length < 3) flags.push('Event name is suspiciously short');

  // 2. All-caps name (screaming)
  if (name.length > 5 && name === name.toUpperCase() && /[A-Z]/.test(name)) flags.push('Event name is ALL CAPS');

  // 3. Excessive URLs in description (> 2 links)
  const urlCount = (desc.match(/https?:\/\//gi) || []).length;
  if (urlCount > 2) flags.push(`Description contains ${urlCount} URLs`);

  // 4. Spam keywords
  const spamWords = ['buy now', 'limited offer', 'act fast', 'click here', 'make money', 'work from home',
    'crypto', 'bitcoin', 'forex', 'mlm', 'weight loss', 'diet pills', 'viagra', 'casino', 'betting',
    'free money', 'wire transfer', 'nigerian', 'lottery', 'congratulations you'];
  const spamHits = spamWords.filter(w => combined.includes(w));
  if (spamHits.length > 0) flags.push(`Spam keywords: ${spamHits.join(', ')}`);

  // 5. Gibberish detector — high consonant-to-vowel ratio in name
  const letters = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (letters.length > 6) {
    const vowels = (letters.match(/[aeiou]/g) || []).length;
    const ratio = vowels / letters.length;
    if (ratio < 0.15) flags.push('Event name appears to be gibberish');
  }

  // 6. Phone number in description (harvesting attempt)
  if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(desc) && urlCount > 1) {
    flags.push('Description mixes phone numbers with multiple URLs');
  }

  // Severity logic
  let severity = 'clean';
  if (flags.length === 1) severity = 'warn';       // publish, notify admin
  if (flags.length >= 2) severity = 'hold';         // hold for review, don't publish
  if (spamHits.length >= 2) severity = 'hold';      // multiple spam words = definite hold

  return { pass: severity !== 'hold', flags, severity };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, code, resend } = req.body || {};
  const inputDigits = normalizePhone(phone);

  if (inputDigits.length < 10) return res.status(400).json({ error: 'Valid phone number required.' });

  const notionToken = process.env.NOTION_TOKEN_EVENTS;
  const dbId = process.env.NOTION_DB_EVENTS;

  try {
    const pendingEvents = await queryPendingEvents(notionToken, dbId);

    // Handle duplicate submissions — find all Pending records for this phone
    const phoneMatches = pendingEvents.filter(page => {
      const stored = page.properties['Phone']?.phone_number || '';
      return normalizePhone(stored) === inputDigits;
    });

    if (phoneMatches.length === 0) {
      return res.status(404).json({ error: 'No pending event submission found for this phone number.' });
    }

    // For resend or verify: use most recent if no code match found
    const match = resend
      ? phoneMatches[phoneMatches.length - 1]
      : phoneMatches.find(page => {
          const c = page.properties['Verification Code']?.rich_text?.[0]?.text?.content || '';
          return c === (code?.trim() || '');
        }) || phoneMatches[phoneMatches.length - 1];

    const storedCode = match.properties['Verification Code']?.rich_text?.[0]?.text?.content || '';
    const eventName = match.properties['Event Name']?.title?.[0]?.text?.content || 'Your event';
    const email = match.properties['Email']?.email || '';
    const eventType = getEventType(match);

    // ── RESEND ──
    if (resend) {
      if (!storedCode) return res.status(400).json({ error: 'No verification code found. Please submit your event again.' });
      await sendSMS(inputDigits, `Manitou Beach Events\n\nYour verification code is: ${storedCode}\n\nEnter this to publish your event listing.`);
      return res.status(200).json({ ok: true, resent: true });
    }

    // ── VERIFY ──
    if (!code || code.trim().length !== 6) return res.status(400).json({ error: 'Please enter your 6-digit verification code.' });
    if (code.trim() !== storedCode) return res.status(400).json({ error: 'Incorrect code. Please check your text messages and try again.' });

    // Generate Edit Token
    const editToken = generateToken();
    const organizerName = match.properties['Organizer Name']?.rich_text?.[0]?.plain_text || '';

    // ── AUTO-MODERATION ──
    const modResult = moderateEvent(match);

    // Decide status: clean/warn → Published, hold → Review (not visible on site)
    const publishStatus = modResult.pass ? 'Published' : 'Review';

    const updateProps = {
      'Status':            { status: { name: publishStatus } },
      'Verification Code': { rich_text: [{ text: { content: '' } }] },
      'Edit Token':        { rich_text: [{ text: { content: editToken } }] },
    };

    let patchRes = await fetch(`https://api.notion.com/v1/pages/${match.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties: updateProps }),
    });

    // If "Review" status doesn't exist in Notion yet, fall back to "Pending"
    if (!patchRes.ok && publishStatus === 'Review') {
      console.warn('verify-event: "Review" status not found in Notion, falling back to "Pending"');
      updateProps['Status'] = { status: { name: 'Pending' } };
      patchRes = await fetch(`https://api.notion.com/v1/pages/${match.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${notionToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties: updateProps }),
      });
    }

    if (!patchRes.ok) {
      console.error('verify-event PATCH failed:', await patchRes.text());
      return res.status(500).json({ error: 'Activation failed. Please try again.' });
    }

    const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
    const sessionToken = generateSessionToken(inputDigits);

    // Notify admin — different urgency based on moderation result
    if (modResult.severity === 'hold') {
      notifyAdmin({
        eventName, email, eventType, organizerName,
        modFlags: modResult.flags,
        held: true,
      }).catch(() => {});
      // Still return success to the user — don't reveal the hold
      // They get their session token so they can submit more (those get moderated too)
      return res.status(200).json({
        ok: true,
        activated: true,
        eventName,
        eventType,
        editToken,
        sessionToken,
      });
    }

    // warn or clean — publish and notify admin
    notifyAdmin({
      eventName, email, eventType, organizerName,
      modFlags: modResult.flags,
      held: false,
    }).catch(() => {});

    // Types requiring Stripe Express onboarding — don't send welcome SMS yet,
    // that happens in event-stripe-return.js after onboarding completes.
    if (eventType === 'platform_ticketing' || eventType === 'vendor_market') {
      return res.status(200).json({
        ok: true,
        activated: true,
        needsStripe: true,
        eventPageId: match.id,
        eventName,
        eventType,
        email,
        editToken,
        sessionToken,
      });
    }

    // Simple types — send welcome SMS and done
    const editUrl = `${siteUrl}/events/edit?token=${editToken}`;
    await sendSMS(inputDigits,
      `Manitou Beach Events\n\n${eventName} is live! 🎉\n\nEdit your event anytime:\n${editUrl}`
    );

    return res.status(200).json({
      ok: true,
      activated: true,
      eventName,
      eventType,
      editToken,
      sessionToken,
    });

  } catch (err) {
    console.error('verify-event error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

async function notifyAdmin({ eventName, email, eventType, organizerName, modFlags = [], held = false }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'daryl@yetigroove.com';
  const darylPhone = process.env.DARYL_PHONE;
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  const typeLabel = {
    free: 'Free', rsvp_appreciated: 'RSVP', rsvp_required: 'RSVP Required',
    own_ticketing: 'Own Ticketing', platform_ticketing: 'Platform Ticketing', vendor_market: 'Vendor Market',
  }[eventType] || eventType;

  const flagText = modFlags.length > 0 ? `\n⚠️ Flags: ${modFlags.join('; ')}` : '';

  // SMS — urgent tone for held events
  if (darylPhone) {
    if (held) {
      sendSMS(darylPhone, `🚩 EVENT HELD FOR REVIEW:\n${eventName}\n${organizerName || email} · ${typeLabel}${flagText}\n\nNot live — check Notion to approve or reject.`).catch(() => {});
    } else if (modFlags.length > 0) {
      sendSMS(darylPhone, `New event live (with flag):\n${eventName}\n${organizerName || email} · ${typeLabel}${flagText}\n${siteUrl}/happening`).catch(() => {});
    } else {
      sendSMS(darylPhone, `New event live on Manitou Beach:\n${eventName}\n${organizerName || email} · ${typeLabel}\n${siteUrl}/happening`).catch(() => {});
    }
  }

  // Email
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const statusBadge = held
      ? '<span style="display:inline-block;background:#ff6b6b;color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px;">HELD FOR REVIEW</span>'
      : modFlags.length > 0
        ? '<span style="display:inline-block;background:#D4845A;color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px;">FLAGGED — LIVE</span>'
        : '<span style="display:inline-block;background:#7A8E72;color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1px;">AUTO-APPROVED</span>';

    const flagsHtml = modFlags.length > 0
      ? `<div style="margin-top:14px;padding:12px 16px;background:${held ? '#FFF0F0' : '#FFF8F0'};border:1px solid ${held ? '#ffcccc' : '#F0E4D0'};border-radius:8px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${held ? '#ff6b6b' : '#D4845A'};margin-bottom:6px;">Moderation Flags</div>
          <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#3A3028;line-height:1.7;">${modFlags.map(f => `<li>${f}</li>`).join('')}</ul>
          ${held ? '<div style="margin-top:10px;font-size:12px;color:#666;">This event is NOT visible on the site. Open Notion to approve or reject it.</div>' : ''}
        </div>`
      : '';

    resend.emails.send({
      from: 'Manitou Beach <tickets@yetigroove.com>',
      to: adminEmail,
      subject: held ? `🚩 Event held for review: ${eventName}` : `New event published: ${eventName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px 20px;background:#FAF6EF;">
          <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8C806E;margin-bottom:6px;">New Event · Self-Submitted</div>
          <h2 style="color:#1A2830;font-size:20px;margin:0 0 8px;">${eventName}</h2>
          ${statusBadge}
          <div style="font-size:14px;color:#3A3028;line-height:1.7;margin-top:14px;">
            ${organizerName ? `<strong>Organizer:</strong> ${organizerName}<br/>` : ''}
            <strong>Email:</strong> ${email}<br/>
            <strong>Type:</strong> ${typeLabel}
          </div>
          ${flagsHtml}
          <div style="margin-top:20px;">
            <a href="${siteUrl}/happening" style="display:inline-block;padding:10px 22px;background:#1A2830;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:700;">View on Happening →</a>
          </div>
        </div>
      `,
    }).catch(() => {});
  }
}
