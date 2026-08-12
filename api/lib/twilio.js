// Shared Twilio SMS utility
// All SMS sending goes through here - no more inline duplicates

/**
 * Strip a phone string to its last 10 digits.
 * Accepts any format: (517) 435-0130, +15174350130, 517-435-0130, etc.
 */
export function normalizePhone(raw) {
  return (raw || '').replace(/\D/g, '').slice(-10);
}

/**
 * Send an SMS to a US phone number in any format - "5174350130",
 * "(517) 435-0130", "+15174350130" all work. Returns true on success,
 * false on failure. Never throws.
 *
 * Normalizing here rather than at the call site is deliberate: callers were
 * passing E.164 values straight through (DARYL_PHONE is stored as +1XXXXXXXXXX),
 * which produced "+1+1XXXXXXXXXX" and silently failed every admin alert.
 */
export async function sendSMS(toDigits, body) {
  const digits = normalizePhone(toDigits);
  if (digits.length !== 10) {
    console.error(`twilio.js: refusing to send - "${toDigits}" is not a US number`);
    return false;
  }
  return sendSMSFull(`+1${digits}`, body);
}

/**
 * Send an SMS to an E.164-formatted phone number (e.g. +15174350130).
 * Returns true on success, false on failure. Never throws.
 */
export async function sendSMSFull(toE164, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;
  if (!sid || !token || !from) {
    console.error('twilio.js: missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE');
    return false;
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: toE164, Body: body }).toString(),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error(`twilio.js: SMS to ${toE164} failed - ${res.status}`, err);
    }
    return res.ok;
  } catch (e) {
    console.error(`twilio.js: SMS to ${toE164} error -`, e.message);
    return false;
  }
}
