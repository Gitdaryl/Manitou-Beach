// Shared helpers for the Classifieds DB (api/classifieds.js, the expiry cron, the newsletter draft).
// Listings are free, verified by SMS code, approved by Daryl, and live for 30 days.

import crypto from 'crypto';

export const CLASSIFIED_CATEGORIES = [
  { id: 'Neighbors Swap', slug: 'swap', label: 'Neighbors Swap' },
  { id: 'Free to a Good Home', slug: 'free', label: 'Free to a Good Home' },
  { id: 'Wheels & Water', slug: 'wheels-water', label: 'Wheels & Water' },
  { id: 'Help Wanted', slug: 'help-wanted', label: 'Help Wanted' },
];

export const LISTING_DAYS = 30;

export function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
}

export const dbId = () => process.env.NOTION_DB_CLASSIFIEDS;
export const siteUrl = () => process.env.SITE_URL || 'https://manitoubeachmichigan.com';

export async function notion(path, method = 'GET', body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: notionHeaders(),
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`Notion ${method} ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function queryClassifieds(filter, sorts) {
  const out = [];
  let cursor;
  do {
    const data = await notion(`/databases/${dbId()}/query`, 'POST', {
      filter,
      ...(sorts && { sorts }),
      page_size: 100,
      ...(cursor && { start_cursor: cursor }),
    });
    out.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return out;
}

export const text = (v) => (v ? [{ text: { content: String(v).slice(0, 2000) } }] : []);
const plain = (p) => (p?.rich_text || p?.title || []).map((t) => t.plain_text).join('');

// Raw page -> object. includePrivate adds seller email and tokens for server-side use only.
export function parseClassified(page, includePrivate = false) {
  const p = page.properties;
  let photos = [];
  try { photos = JSON.parse(plain(p['Photos']) || '[]'); } catch { photos = []; }
  const contactMethod = p['Contact Method']?.select?.name || 'Call or text';
  const listing = {
    id: page.id.replace(/-/g, ''),
    title: plain(p['Title']),
    category: p['Category']?.select?.name || '',
    price: plain(p['Price']),
    description: plain(p['Description']),
    town: plain(p['Town']),
    photos,
    sellerName: plain(p['Seller Name']),
    phone: p['Phone']?.phone_number || '',
    contactMethod,
    status: p['Status']?.select?.name || '',
    posted: p['Posted']?.date?.start || null,
    expires: p['Expires']?.date?.start || null,
  };
  if (includePrivate) {
    Object.assign(listing, {
      email: p['Email']?.email || '',
      code: plain(p['Verification Code']),
      editToken: plain(p['Edit Token']),
      flags: plain(p['Flags']),
      renewalSent: !!p['Renewal Sent']?.checkbox,
      createdTime: page.created_time,
    });
  }
  return listing;
}

export function addDays(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Signs Daryl's approve/reject links so only he can act on them.
export function adminSig(id, decision) {
  return crypto.createHmac('sha256', process.env.ADMIN_SECRET || '').update(`classified:${id}:${decision}`).digest('hex').slice(0, 32);
}

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length || !a.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function formatPhone(digits) {
  const d = (digits || '').replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : digits;
}

// Small branded HTML page for links opened from texts and emails (review, renew, mark sold).
export function htmlPage(title, bodyHtml) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)}</title></head>
<body style="margin:0;background:#FAF6EF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#3B3228;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#A8926E;">Manitou Beach Classifieds</p>
<h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 20px;color:#1A2830;">${esc(title)}</h1>
${bodyHtml}
<p style="margin:32px 0 0;font-size:13px;"><a href="${siteUrl()}/classifieds" style="color:#D4845A;">manitoubeachmichigan.com/classifieds</a></p>
</div></body></html>`;
}

export const BUTTON = 'display:inline-block;border:0;border-radius:6px;padding:14px 22px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;';
