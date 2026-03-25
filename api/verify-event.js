// /api/verify-event.js
// POST { phone, code } — verifies SMS code, publishes event, sets Edit Token.
// POST { phone, resend: true } — resends stored code.
//
// For platform_ticketing and vendor_market types, returns needsStripe: true.
// The frontend then calls /api/event-stripe-onboard to create the Stripe Express account.

import crypto from 'crypto';
import { sendSMS, normalizePhone } from './lib/twilio.js';

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

    // Publish the event — Status → Published, clear verification code, set Edit Token
    const updateProps = {
      'Status':            { status: { name: 'Published' } },
      'Verification Code': { rich_text: [{ text: { content: '' } }] },
      'Edit Token':        { rich_text: [{ text: { content: editToken } }] },
    };

    const patchRes = await fetch(`https://api.notion.com/v1/pages/${match.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties: updateProps }),
    });

    if (!patchRes.ok) {
      console.error('verify-event PATCH failed:', await patchRes.text());
      return res.status(500).json({ error: 'Activation failed. Please try again.' });
    }

    const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

    const sessionToken = generateSessionToken(inputDigits);

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
