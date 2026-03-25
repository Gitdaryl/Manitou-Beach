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

  // Build Notion properties based on event type
  const properties = {
    'Event Name':        { title: [{ text: { content: eventName.trim() } }] },
    'Status':            { status: { name: hasValidSession ? 'Published' : 'Pending' } },
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
      const err = await notionRes.text();
      console.error('submit-event Notion error:', err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }

    // Session path — already published, no SMS needed
    if (hasValidSession) {
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
