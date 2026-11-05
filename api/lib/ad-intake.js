// Shared by api/ad-intake.js, api/ad-upload.js, api/confirm-listing.js and
// scripts/ad-intake-links.mjs.
//
// Signed ad-photo links use the claim token scheme with their own purpose
// string, so a link passed around a business can send photos but can never
// edit the listing. An owner's existing claim token is accepted here as well.

import { createHmac, timingSafeEqual } from 'crypto';
import { verifyClaimToken } from '../verify-claim.js';

export function toSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function hmac(value) {
  const secret = process.env.CLAIM_SIGNING_SECRET;
  if (!secret) throw new Error('CLAIM_SIGNING_SECRET is not set');
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function makeAdToken(pageId) {
  return hmac(`ad-intake:${pageId}`).slice(0, 48);
}

export function verifyAdToken(pageId, token) {
  if (!pageId || !token || typeof token !== 'string') return false;
  if (!process.env.CLAIM_SIGNING_SECRET) return false; // fail closed
  const given = Buffer.from(token);
  const expected = Buffer.from(makeAdToken(pageId));
  if (given.length === expected.length && timingSafeEqual(given, expected)) return true;
  return verifyClaimToken(pageId, token);
}

// Keyed with the server secret so a folder can't be worked out from a slug.
export function uploadPrefix(pageId) {
  return `ad-intake/${hmac(`ad-intake-path:${pageId}`).slice(0, 32)}`;
}

export const RECORD_PREFIX = 'ad-intake-records/';

// Same rows as the public directory in api/businesses.js: listed, not a demo,
// not hidden, not a test row, and not lodging.
export async function listedBusinesses() {
  const pages = [];
  let start_cursor;
  do {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            and: [
              {
                or: [
                  { property: 'Status', status: { equals: 'Listed Free' } },
                  { property: 'Status', status: { equals: 'Listed Enhanced' } },
                  { property: 'Status', status: { equals: 'Listed Featured' } },
                  { property: 'Status', status: { equals: 'Listed Premium' } },
                ],
              },
              { property: 'Category', select: { does_not_equal: 'Places to Stay' } },
            ],
          },
          page_size: 100,
          ...(start_cursor ? { start_cursor } : {}),
        }),
      }
    );
    if (!res.ok) throw new Error(`Notion query failed: ${res.status}`);
    const data = await res.json();
    pages.push(...(data.results || []));
    start_cursor = data.has_more ? data.next_cursor : null;
  } while (start_cursor);

  return pages
    .filter((page) => {
      const p = page.properties;
      const name = p['Name']?.title?.[0]?.text?.content || '';
      const skip = (p['Is Demo']?.checkbox ?? false) || (p['Hidden']?.checkbox ?? false) || (p['Is Test']?.checkbox ?? false);
      return name && !skip && !/\byeti\s*test\b|\btest\s*business\b|^\s*test[\s-]/i.test(name);
    })
    .map((page) => {
      const name = page.properties['Name'].title[0].text.content;
      return { pageId: page.id, name, slug: toSlug(name) };
    });
}

export async function findListedBusiness(slug) {
  if (typeof slug !== 'string' || !/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  return (await listedBusinesses()).find((b) => b.slug === slug) || null;
}
