// Tells the rest of a business's crew when one of them posts an event.
//
// The problem it solves is duplicated work, not record-keeping: the owner asks
// her daughter on Tuesday to get Saturday's band on the calendar, does it
// herself on Wednesday, and the daughter posts it again on Thursday because
// she has no way to know. The Events DB already has a pair of near-identical
// submissions from one organizer on one day, so this isn't hypothetical.
//
// One text per submitting session, not one per event - an organizer logging a
// month of gigs in a sitting would otherwise fire a dozen texts at their
// partner, and the second one would already be ignored.

import { sendSMS, normalizePhone } from './twilio.js';
import { linkedPhones, recentlyNotified, markNotified, makeToken } from './organizer-links.js';

function prettyDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(Date.UTC(y, m - 1, d))
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export async function notifyLinkedOrganizers({ fromPhone, eventName, eventDate, orgName }) {
  const from = normalizePhone(fromPhone);
  if (from.length !== 10) return;

  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  let others = [];
  try {
    others = (await linkedPhones(from)).filter(p => p !== from);
  } catch (err) {
    console.error('organizer-notify: lookup failed -', err.message);
    return;
  }
  if (others.length === 0) return;

  const when = prettyDate(eventDate);
  const who = orgName ? `the ${orgName}` : 'your';

  for (const to of others) {
    try {
      if (await recentlyNotified(from, to)) continue;
      await markNotified(from, to);
      await sendSMS(
        to,
        `Manitou Beach Events\n\nHeads up - (${from.slice(0, 3)}) ${from.slice(3, 6)}-${from.slice(6)} just added "${eventName}"${when ? ` (${when})` : ''} to ${who} calendar, and may be adding more.\n\nWorth a look before you post the same thing:\n${siteUrl}/my-events?phone=${to}&token=${makeToken(to)}`
      );
    } catch (err) {
      // A failed heads-up must never fail the submission that triggered it.
      console.error('organizer-notify: send failed -', err.message);
    }
  }
}
