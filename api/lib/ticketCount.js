// AF-8: Authoritative ticket counting.
//
// Notion has NO atomic increment, so the mutable "Tickets Sold" number on an
// Event page cannot be maintained safely with read-modify-write: two
// concurrent purchases both read the same starting value and one increment is
// lost (count drifts low) — or, once capacity is enforced against that
// counter, the event can oversell.
//
// Fix: treat the Tickets DB as the source of truth. Each completed purchase
// writes exactly one ticket row (in the Stripe webhook), so the sold count is
// the sum of `Quantity` over all non-Refunded ticket rows for the event.
// The "Tickets Sold" event property is kept ONLY as a cached/display value,
// reconciled from this count after every sale (see stripe-webhook.js).
// Capacity checks (ticket-checkout.js) use this count, never the cached
// counter.
//
// Refunds: a ticket with Status = 'Refunded' (set by admin/refund flow, also
// rejected at the door by ticket-verify.js) does not count toward sold or
// capacity. 'Valid' and 'Used' both count.
//
// HONEST LIMITS — residual race window (documented, not hidden):
// - Notion offers no transactions or locks, so this is a mitigation, not a
//   guarantee of atomicity.
// - Two webhook deliveries reconciling at the same instant may each miss the
//   other's just-created row (cross-writer read lag), so the cached counter
//   can briefly be low — but it self-heals on the next reconcile, and the
//   counter is never used for enforcement.
// - Capacity is checked at Checkout-session creation, but payment completes
//   later; N concurrent buyers can all pass the check while seats remain,
//   so an oversell of up to the in-flight quantities is still possible.
// A future hard fix requires a real transactional store: e.g. a Postgres/
// Redis inventory row decremented atomically when the Checkout session is
// created (with a TTL to release abandoned sessions), or serializing all
// fulfillment through a single-consumer queue, with Notion demoted to a
// read-only mirror.

const NOTION_VERSION = '2022-06-28';

/**
 * Count tickets sold for an event by summing Quantity over non-Refunded
 * ticket rows in the Tickets DB.
 *
 * @param {string} eventId - Notion page ID of the event.
 * @param {object} [opts]
 * @param {string} [opts.includeTicketId] - Ticket ID of a row this process
 *   just created. If the query does not return it yet (read-after-write lag),
 *   its quantity is added so the caller's own sale is never undercounted.
 * @param {number} [opts.includeQuantity] - Quantity of that just-created row.
 * @returns {Promise<number>} authoritative sold count
 * @throws on Notion API failure (callers decide their fallback).
 */
export async function countTicketsSold(eventId, { includeTicketId, includeQuantity = 0 } = {}) {
  if (!process.env.NOTION_DB_TICKETS) {
    throw new Error('NOTION_DB_TICKETS is not configured');
  }

  let sold = 0;
  let sawIncludedTicket = false;
  let startCursor = undefined;

  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_TICKETS}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION,
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Event Page ID', rich_text: { equals: eventId } },
            { property: 'Status', select: { does_not_equal: 'Refunded' } },
          ],
        },
        page_size: 100,
        ...(startCursor ? { start_cursor: startCursor } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Notion tickets query failed (${res.status}): ${err.message || 'unknown error'}`);
    }

    const data = await res.json();
    for (const row of data.results || []) {
      const props = row.properties || {};
      sold += props['Quantity']?.number || 1;
      if (includeTicketId && props['Ticket ID']?.title?.[0]?.plain_text === includeTicketId) {
        sawIncludedTicket = true;
      }
    }

    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);

  // Read-after-write safeguard: never undercount our own just-created row.
  if (includeTicketId && !sawIncludedTicket) {
    sold += includeQuantity;
  }

  return sold;
}
