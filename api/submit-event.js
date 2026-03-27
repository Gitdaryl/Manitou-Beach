// /api/submit-event.js
// Self-serve event submission with SMS verification.
// Creates a Pending record in the Events DB, sends a 6-digit SMS code.
// On verify (verify-event.js): Status → Published, Edit Token set.
// For platform_ticketing + vendor_market types: verify-event.js returns needsStripe=true
// and the frontend then calls event-stripe-onboard.js to create the Express account.
//
// Session flow: if a valid sessionToken is provided (issued by verify-event.js),
// the event is published immediately without SMS — lets reps log multiple events in one sitting.

import crypto from 'crypto';
import { sendSMS, normalizePhone } from './lib/twilio.js';
import { Resend } from 'resend';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Validates the HMAC session token issued by verify-event.js.
// Token is bound to the phone number and the current 8-hour window.
function validateSessionToken(normalizedPhone, token) {
  if (!token || !normalizedPhone || normalizedPhone.length < 10) return false;
  const window = Math.floor(Date.now() / (8 * 60 * 60 * 1000));
  const expected = crypto
    .createHmac('sha256', process.env.NOTION_TOKEN_EVENTS)
    .update(`${normalizedPhone}:${window}`)
    .digest('hex');
  return token === expected;
}

function normalizeUrl(url) {
  if (!url || !url.trim()) return null;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

// Quick content moderation for session-path (already verified, submitting another event)
function moderateContent(name, description, location) {
  const combined = `${name} ${description} ${location}`.toLowerCase();
  const flags = [];

  if (name.trim().length < 3) flags.push('Event name too short');
  if (name.length > 5 && name === name.toUpperCase() && /[A-Z]/.test(name)) flags.push('ALL CAPS name');

  const urlCount = (description.match(/https?:\/\//gi) || []).length;
  if (urlCount > 2) flags.push(`${urlCount} URLs in description`);

  const spamWords = ['buy now', 'limited offer', 'act fast', 'click here', 'make money', 'work from home',
    'crypto', 'bitcoin', 'forex', 'mlm', 'weight loss', 'diet pills', 'viagra', 'casino', 'betting',
    'free money', 'wire transfer', 'lottery'];
  const spamHits = spamWords.filter(w => combined.includes(w));
  if (spamHits.length > 0) flags.push(`Spam: ${spamHits.join(', ')}`);

  const letters = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (letters.length > 6) {
    const vowels = (letters.match(/[aeiou]/g) || []).length;
    if (vowels / letters.length < 0.15) flags.push('Gibberish name');
  }

  const shouldHold = flags.length >= 2 || spamHits.length >= 2;
  return { shouldHold, flags };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    eventName, date, dateEnd, timeStart, timeEnd, location, description, cost,
    email, phone, organizerName,
    eventType,          // 'free' | 'rsvp_appreciated' | 'rsvp_required' | 'own_ticketing' | 'platform_ticketing' | 'vendor_market'
    eventUrl,           // for own_ticketing
    imageUrl,
    ticketPrice,        // for platform_ticketing
    ticketCapacity,     // for platform_ticketing
    rsvpCapacity,       // for rsvp_required
    vendorFee,          // for vendor_market
    vendorCapacity,     // for vendor_market
    recurring,          // 'Annual' | 'Weekly' | 'Monthly' | 'None'
    recurringDay,       // 'Monday' … 'Sunday'
    recurringEndDate,   // last date in the recurring series (stored in description metadata)
    sessionToken,       // HMAC token from a prior verify — skip SMS if valid
    _hp,                // honeypot
  } = req.body || {};

  const digits = normalizePhone(phone);
  const hasValidSession = validateSessionToken(digits, sessionToken);

  // Honeypot — bots fill hidden fields, humans don't
  if (_hp) return res.status(200).json({ ok: true, needsVerification: true });

  if (!eventName?.trim()) return res.status(400).json({ error: 'Event name is required.' });
  if (!email?.trim() || !email.includes('@')) return res.status(400).json({ error: 'A valid email is required.' });
  if (!date) return res.status(400).json({ error: 'Event date is required.' });

  if (digits.length < 10) return res.status(400).json({ error: 'A valid phone number is required — we\'ll text you a verification code.' });

  const notionToken = process.env.NOTION_TOKEN_EVENTS;
  const dbId = process.env.NOTION_DB_EVENTS;
  const code = hasValidSession ? '' : generateCode();
  const editToken = hasValidSession ? crypto.randomBytes(16).toString('hex') : '';

  // Run content moderation for session-path (immediate publish)
  const modCheck = hasValidSession
    ? moderateContent(eventName || '', description || '', location || '')
    : { shouldHold: false, flags: [] };
  const sessionStatus = hasValidSession
    ? (modCheck.shouldHold ? 'Review' : 'Published')
    : 'Pending';

  // Build Notion properties based on event type
  const properties = {
    'Event Name':        { title: [{ text: { content: eventName.trim() } }] },
    'Status':            { status: { name: sessionStatus } },
    'Verification Code': { rich_text: [{ text: { content: code } }] },
    'Source':            { select: { name: 'Self-Submitted' } },
    'Email':             { email: email.trim() },
    'Phone':             { phone_number: phone.trim() },
  };
  if (hasValidSession && editToken) {
    properties['Edit Token'] = { rich_text: [{ text: { content: editToken } }] };
  }

  if (organizerName?.trim()) properties['Organizer Name'] = { rich_text: [{ text: { content: organizerName.trim() } }] };
  // Support multi-day events via Notion's native date range (start + end)
  if (date) properties['Event date'] = { date: { start: date, ...(dateEnd?.trim() && { end: dateEnd.trim() }) } };
  if (timeStart?.trim()) properties['Time End'] = { rich_text: [{ text: { content: timeStart.trim() } }] }; // stored in Time End temporarily; Time field is system created_time
  if (timeEnd?.trim()) properties['Time End'] = { rich_text: [{ text: { content: [timeStart, timeEnd].filter(Boolean).join(' – ') } }] };
  if (location?.trim()) properties['Location'] = { rich_text: [{ text: { content: location.trim() } }] };
  // Append recurring end date as metadata to description (stripped before public display)
  const descParts = [];
  if (description?.trim()) descParts.push(description.trim());
  if (recurringEndDate?.trim()) descParts.push(`Runs until: ${recurringEndDate.trim()}`);
  if (descParts.length) properties['Description'] = { rich_text: [{ text: { content: descParts.join('\n') } }] };
  if (cost?.trim()) properties['Cost'] = { rich_text: [{ text: { content: cost.trim() } }] };
  if (imageUrl?.trim()) { try { properties['Image URL'] = { url: normalizeUrl(imageUrl) }; } catch (_) {} }
  if (recurring && recurring !== 'None') properties['Recurring'] = { select: { name: recurring } };
  if (recurringDay) properties['Recurring Day'] = { select: { name: recurringDay } };

  // Event type → set the right flags
  switch (eventType) {
    case 'free':
      properties['Attendance'] = { select: { name: 'just_show_up' } };
      break;
    case 'rsvp_appreciated':
      properties['Attendance']    = { select: { name: 'rsvp_appreciated' } };
      properties['RSVP Enabled']  = { checkbox: true };
      if (rsvpCapacity) properties['RSVP Capacity'] = { number: parseInt(rsvpCapacity, 10) };
      break;
    case 'rsvp_required':
      properties['Attendance']    = { select: { name: 'rsvp_required' } };
      properties['RSVP Enabled']  = { checkbox: true };
      properties['CTA Label']     = { select: { name: 'Register' } };
      if (rsvpCapacity) properties['RSVP Capacity'] = { number: parseInt(rsvpCapacity, 10) };
      break;
    case 'own_ticketing':
      properties['CTA Label']     = { select: { name: 'Get Tickets' } };
      if (eventUrl?.trim()) { try { properties['Event URL'] = { url: normalizeUrl(eventUrl) }; } catch (_) {} }
      break;
    case 'platform_ticketing':
      properties['Tickets Enabled'] = { checkbox: true };
      properties['CTA Label']       = { select: { name: 'Get Tickets' } };
      if (ticketPrice) properties['Ticket Price'] = { number: parseFloat(ticketPrice) };
      if (ticketCapacity) properties['Ticket Capacity'] = { number: parseInt(ticketCapacity, 10) };
      break;
    case 'vendor_market':
      properties['Vendor Reg Enabled'] = { checkbox: true };
      properties['CTA Label']          = { select: { name: 'Register' } };
      if (vendorFee) properties['Vendor Fee'] = { number: parseFloat(vendorFee) };
      if (vendorCapacity) properties['Vendor Capacity'] = { number: parseInt(vendorCapacity, 10) };
      break;
    default:
      properties['Attendance'] = { select: { name: 'just_show_up' } };
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ parent: { database_id: dbId }, properties }),
    });

    if (!notionRes.ok) {
      const errText = await notionRes.text();
      // If "Review" status doesn't exist in Notion, retry with "Pending"
      if (sessionStatus === 'Review' && errText.includes('Review')) {
        console.warn('submit-event: "Review" status not in Notion, falling back to "Pending"');
        properties['Status'] = { status: { name: 'Pending' } };
        const retryRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: { Authorization: `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
          body: JSON.stringify({ parent: { database_id: dbId }, properties }),
        });
        if (!retryRes.ok) {
          console.error('submit-event retry Notion error:', await retryRes.text());
          return res.status(500).json({ error: 'Something went wrong. Please try again.' });
        }
      } else {
        console.error('submit-event Notion error:', errText);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
      }
    }

    // Session path — already verified, moderation decides status
    if (hasValidSession) {
      // Notify admin if flagged (best-effort)
      if (modCheck.flags.length > 0 && process.env.DARYL_PHONE) {
        const { sendSMS: sms } = await import('./lib/twilio.js');
        const prefix = modCheck.shouldHold ? '🚩 EVENT HELD:' : '⚠️ Flagged (live):';
        sms(process.env.DARYL_PHONE, `${prefix}\n${eventName.trim()}\n${organizerName || email}\nFlags: ${modCheck.flags.join('; ')}`).catch(() => {});
      }
      // Send welcome email to organizer (session path — no SMS edit link sent)
      if (editToken && email) {
        sendOrganizerWelcomeEmail({
          eventName: eventName.trim(),
          email: email.trim(),
          editToken,
          organizerName: organizerName?.trim(),
        }).catch(() => {});
      }
      // Return activated=true either way — user doesn't know about the hold
      return res.status(200).json({ ok: true, activated: true, eventName: eventName.trim(), editToken });
    }

    // Send SMS verification code
    const smsOk = await sendSMS(
      digits,
      `Manitou Beach Events\n\nYour verification code is: ${code}\n\nEnter this to publish your event listing.`
    );

    if (!smsOk) {
      return res.status(200).json({ ok: true, needsVerification: true, smsFailed: true });
    }

    return res.status(200).json({ ok: true, needsVerification: true });
  } catch (err) {
    console.error('submit-event error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

async function sendOrganizerWelcomeEmail({ eventName, email, editToken, organizerName }) {
  if (!process.env.RESEND_API_KEY || !email) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const editUrl = `${siteUrl}/events/edit?token=${editToken}`;
  const happeningUrl = `${siteUrl}/happening`;
  const promoteUrl = `${siteUrl}/promote`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(happeningUrl)}&quote=${encodeURIComponent(`${eventName} is happening at Manitou Beach! Check it out:`)}`;
  const firstName = (organizerName || '').split(' ')[0] || 'Hey';

  await resend.emails.send({
    from: 'Manitou Beach Events <tickets@yetigroove.com>',
    to: email,
    subject: `${eventName} is live on the community calendar!`,
    html: `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:0;background:#FAF6EF;">
        <div style="background:#1A2830;padding:32px 28px 24px;text-align:center;">
          <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:8px;">Manitou Beach Events</div>
          <h1 style="font-size:24px;font-weight:400;color:#FAF6EF;margin:0;font-family:Georgia,serif;line-height:1.3;">${eventName} is live!</h1>
        </div>
        <div style="padding:28px 28px 20px;">
          <p style="font-size:15px;color:#3A3028;line-height:1.8;margin:0 0 24px;">
            ${firstName} — your event is on the community calendar and people can see it right now. Nice work.
          </p>
          <a href="${happeningUrl}" style="display:block;padding:16px 20px;background:#7A8E72;color:#fff;text-decoration:none;border-radius:10px;margin-bottom:14px;">
            <div style="font-size:14px;font-weight:700;margin-bottom:2px;">See your event on the calendar →</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.7);">Check how it looks — make sure everything reads right.</div>
          </a>
          <a href="${editUrl}" style="display:block;padding:16px 20px;background:#F5EDE3;color:#3A3028;text-decoration:none;border-radius:10px;border:1px solid #E8DDD0;margin-bottom:14px;">
            <div style="font-size:14px;font-weight:700;margin-bottom:2px;">Need to change something?</div>
            <div style="font-size:12px;color:#8C806E;line-height:1.5;">Tap here to edit your event anytime — no login needed. Bookmark this link.</div>
          </a>
          <div style="border-top:1px solid #E8DDD0;margin:24px 0 20px;"></div>
          <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8C806E;margin:0 0 12px;">Get the word out — free</p>
          <a href="${fbShareUrl}" style="display:block;padding:14px 20px;background:#4267B2;color:#fff;text-decoration:none;border-radius:10px;margin-bottom:12px;text-align:center;">
            <div style="font-size:14px;font-weight:700;">Share on Facebook</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px;">The more people who know, the better the turnout.</div>
          </a>
          <p style="font-size:13px;color:#8C806E;line-height:1.7;margin:16px 0 0;">
            Copy this link and post it anywhere — text it to friends, drop it in a group chat, pin it on Nextdoor:<br/>
            <a href="${happeningUrl}" style="color:#D4845A;font-weight:600;text-decoration:none;">${happeningUrl}</a>
          </p>
          <div style="border-top:1px solid #E8DDD0;margin:24px 0 20px;"></div>
          <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8C806E;margin:0 0 12px;">Want even more eyeballs?</p>
          <a href="${promoteUrl}" style="display:block;padding:16px 20px;background:#FAF6EF;border:1.5px solid #D4845A;color:#3A3028;text-decoration:none;border-radius:10px;">
            <div style="font-size:14px;font-weight:700;color:#D4845A;margin-bottom:4px;">Promotion packages from $9</div>
            <div style="font-size:13px;color:#8C806E;line-height:1.6;">Homepage feature, newsletter spotlight, social boost — over 4,000 locals see these every week.</div>
          </a>
        </div>
        <div style="padding:20px 28px;background:#F0EAE0;text-align:center;">
          <p style="font-size:11px;color:#8C806E;margin:0;line-height:1.6;">
            Manitou Beach · Community calendar for the lake folks<br/>
            <a href="${siteUrl}" style="color:#D4845A;text-decoration:none;">${siteUrl.replace('https://', '')}</a>
          </p>
        </div>
      </div>
    `,
  });
}
