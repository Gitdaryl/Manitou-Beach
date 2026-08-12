// Tells the rest of a business's crew what one of them just did.
//
// The problem it solves is duplicated and contradicted work, not record-keeping:
// the owner asks her daughter on Tuesday to get Saturday's band on the calendar,
// does it herself on Wednesday, and the daughter posts it again on Thursday
// because she has no way to know. The Events DB already holds a pair of
// near-identical submissions from one organizer on one day.
//
// Deliberately domain-agnostic. Nothing here knows what an event is, so a
// stays or food-truck flow can reuse it by passing its own line of copy and
// its own link.

import { sendSMS, normalizePhone } from './twilio.js';
import { linkedPhones, recentlyNotified, markNotified, makeToken, displayNames } from './organizer-links.js';

export function prettyDate(iso) {
  if (!iso) return '';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(Date.UTC(y, m - 1, d))
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function prettyPhone(digits) {
  const d = normalizePhone(digits);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : 'someone';
}

/**
 * Text everyone sharing a list with `fromPhone`, except `fromPhone` itself.
 *
 * @param {string}   fromPhone  who did the thing (never notified)
 * @param {function} message    (recipientLink, fromLabel) => string - the SMS body.
 *                              fromLabel is the sender's chosen display name
 *                              when they've set one, their number otherwise.
 * @param {string}   linkPath   page the link should open, defaults to /my-events
 * @param {boolean}  urgent     skip the anti-spam cooldown. For things that
 *                              can't wait and don't repeat, like a cancellation.
 *                              Routine adds must NOT set this: an organizer
 *                              logging a month of gigs would fire a text per
 *                              event and the second one would be ignored.
 */
export async function notifyLinkedOrganizers({ fromPhone, message, linkPath = '/my-events', urgent = false }) {
  const from = normalizePhone(fromPhone);
  if (from.length !== 10 || typeof message !== 'function') return;

  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  let others = [];
  try {
    others = (await linkedPhones(from)).filter(p => p !== from);
  } catch (err) {
    console.error('organizer-notify: lookup failed -', err.message);
    return;
  }
  if (others.length === 0) return;

  // A name if they've picked one, their number if not.
  const fromLabel = (await displayNames()).get(from) || prettyPhone(from);

  for (const to of others) {
    try {
      if (!urgent) {
        if (await recentlyNotified(from, to)) continue;
        await markNotified(from, to);
      }
      const link = `${siteUrl}${linkPath}?phone=${to}&token=${makeToken(to)}`;
      await sendSMS(to, message(link, fromLabel));
    } catch (err) {
      // A failed heads-up must never fail the action that triggered it.
      console.error('organizer-notify: send failed -', err.message);
    }
  }
}

// Someone added something to a shared calendar.
export function addedMessage({ eventName, eventDate, orgName }) {
  const when = prettyDate(eventDate);
  const whose = orgName ? `the ${orgName}` : 'your';
  return (link, from) =>
    `Manitou Beach Events\n\nHeads up - ${from} just added "${eventName}"${when ? ` (${when})` : ''} to ${whose} calendar, and may be adding more.\n\nWorth a look before you post the same thing:\n${link}`;
}

// Someone cancelled or postponed something. Rare, and the one you can't
// afford to miss - people turn up at the door otherwise.
export function lifecycleMessage({ eventName, eventDate, lifecycle, changeNote }) {
  const when = prettyDate(eventDate);
  const verb = lifecycle === 'Cancelled' ? 'CANCELLED' : lifecycle.toUpperCase();
  return (link, from) =>
    `Manitou Beach Events\n\n${verb}: "${eventName}"${when ? ` (${when})` : ''}\n\n${from} made this change${changeNote ? `:\n"${changeNote}"` : '.'}\n\nIt's already updated on the calendar:\n${link}`;
}
