// /api/classifieds.js
// Free neighbor classifieds: Neighbors Swap, Free to a Good Home, Wheels & Water, Help Wanted.
//
// GET                              live listings (public fields only)
// GET  ?action=one&id=             one listing
// POST { action:'submit', ... }    creates an Unverified record, texts a 6-digit code
// POST { action:'verify', id, code } code ok -> AI review: clean goes Live, unsure is held for Daryl
//                                  (texted), clear violations are Rejected (Daryl texted, can override)
// POST { action:'resend', id }     re-texts the stored code
// GET  ?action=review&id=&key=     Daryl's review page (approve / reject / publish anyway / take down)
// GET  ?action=manage&id=&token=   seller's page from their email (renew 30 days / mark sold)
//
// Links opened from texts and emails only ever SHOW a page; the change happens on a button
// press (POST), because message apps and mail scanners open links on their own.

import crypto from 'crypto';
import { Resend } from 'resend';
import { sendSMS, normalizePhone } from './lib/twilio.js';
import { aiReviewClassified } from './lib/classifiedsReview.js';
import {
  CLASSIFIED_CATEGORIES, LISTING_DAYS, dbId, siteUrl, notion, queryClassifieds, parseClassified,
  text, addDays, adminSig, safeEqual, esc, formatPhone, htmlPage, BUTTON,
} from './lib/classifieds.js';

const CATEGORY_IDS = new Set(CLASSIFIED_CATEGORIES.map((c) => c.id));
const CONTACT_METHODS = new Set(['Call or text', 'Text only', 'Call only']);
const CODE_WINDOW_MS = 60 * 60 * 1000;
const FROM = 'Manitou Beach Classifieds <events@manitoubeachmichigan.com>';

const FIREARM_WORDS = /\b(guns?|rifles?|shotguns?|pistols?|handguns?|firearms?|ammo|ammunition|ar-?15|glock)\b/i;
const SPAM_WORDS = ['crypto', 'bitcoin', 'forex', 'work from home', 'make money', 'wire transfer', 'cash app only',
  'gift card', 'western union', 'zelle only', 'click here', 'casino', 'mlm', 'lottery'];
// Help Wanted wording that can read as discrimination; flagged for Daryl, not auto-rejected.
const HIRING_FLAGS = /\b(young|girls? only|guys? only|men only|women only|males? only|females? only|under \d\d|no older than|christian only|english only|recent grads? only)\b/i;

function moderate(f) {
  const combined = `${f.title} ${f.description}`.toLowerCase();
  const flags = [];
  const spam = SPAM_WORDS.filter((w) => combined.includes(w));
  if (spam.length) flags.push(`Spam words: ${spam.join(', ')}`);
  if ((f.description.match(/https?:\/\//gi) || []).length > 1) flags.push('Links in description');
  if (f.title.length > 5 && f.title === f.title.toUpperCase() && /[A-Z]/.test(f.title)) flags.push('ALL CAPS title');
  if (f.category === 'Help Wanted' && HIRING_FLAGS.test(combined)) flags.push('Hiring wording to check');
  return flags;
}

const clip = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function validate(body) {
  const f = {
    title: clip(body.title, 80),
    category: clip(body.category, 40),
    price: clip(body.price, 40),
    description: clip(body.description, 1200),
    town: clip(body.town, 60),
    sellerName: clip(body.sellerName, 60),
    phone: normalizePhone(body.phone),
    contactMethod: clip(body.contactMethod, 20) || 'Call or text',
    email: clip(body.email, 120).toLowerCase(),
    photos: Array.isArray(body.photos) ? body.photos.filter((u) => typeof u === 'string'
      && /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(u)).slice(0, 3) : [],
  };
  if (f.title.length < 3) return { error: 'Give your listing a title.' };
  if (!CATEGORY_IDS.has(f.category)) return { error: 'Pick a category.' };
  if (f.description.length < 10) return { error: 'Add a short description (a sentence or two).' };
  if (f.sellerName.length < 2) return { error: 'Add your name.' };
  if (f.phone.length !== 10) return { error: 'Add a 10-digit phone number.' };
  if (!CONTACT_METHODS.has(f.contactMethod)) return { error: 'Pick how buyers should contact you.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return { error: 'Add a valid email (kept private, used for renewal reminders).' };
  if (FIREARM_WORDS.test(`${f.title} ${f.description}`)) return { error: 'Firearms and ammunition can\'t be listed on Manitou Beach Classifieds.' };
  if (f.category === 'Free to a Good Home') f.price = 'Free';
  return { f };
}

async function sendCode(phone, code) {
  return sendSMS(phone, `Manitou Beach Classifieds: your code is ${code}. It confirms this number is yours. Msg & data rates may apply. Reply STOP to opt out.`);
}

function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY || !to) return Promise.resolve();
  return new Resend(process.env.RESEND_API_KEY).emails.send({ from: FROM, to, subject, html })
    .catch((e) => console.error('classifieds email error:', e.message));
}

const emailWrap = (inner) => `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3B3228;background:#FAF6EF;padding:32px 28px;border-radius:8px;">
<p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;">Manitou Beach Classifieds</p>${inner}
<p style="font-size:12px;color:#9A8E7E;margin:24px 0 0;">Manitou Beach, Devils Lake Michigan &bull; <a href="${siteUrl()}" style="color:#9A8E7E;">manitoubeachmichigan.com</a></p></div>`;

const manageUrl = (l) => `${siteUrl()}/api/classifieds?action=manage&id=${l.id}&token=${l.editToken}`;
const listingUrl = (l) => `${siteUrl()}/classifieds/${l.id}`;

function listingSummaryHtml(l) {
  const photos = l.photos.map((u) => `<img src="${esc(u)}" alt="" style="width:31%;aspect-ratio:1;object-fit:cover;border-radius:6px;margin-right:2%;">`).join('');
  return `<div style="background:#fff;border:1px solid #E8DFD0;border-radius:10px;padding:18px;margin:0 0 20px;">
<p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#A8926E;">${esc(l.category)}</p>
<p style="margin:4px 0 0;font-family:Georgia,serif;font-size:20px;color:#1A2830;">${esc(l.title)}${l.price ? ` &middot; ${esc(l.price)}` : ''}</p>
<p style="margin:10px 0;font-size:15px;line-height:1.6;white-space:pre-wrap;">${esc(l.description)}</p>
${photos ? `<div style="margin:10px 0;">${photos}</div>` : ''}
<p style="margin:0;font-size:14px;color:#6B5F52;">${esc(l.sellerName)} &middot; ${esc(formatPhone(l.phone))} (${esc(l.contactMethod)})${l.town ? ` &middot; ${esc(l.town)}` : ''}</p>
${l.email ? `<p style="margin:4px 0 0;font-size:13px;color:#8A7E6E;">Private email: ${esc(l.email)}</p>` : ''}
</div>`;
}

async function getPage(id) {
  if (!/^[0-9a-f]{32}$/i.test(id || '')) return null;
  try { return await notion(`/pages/${id}`); } catch { return null; }
}

async function update(id, properties) {
  return notion(`/pages/${id}`, 'PATCH', { properties });
}

// ── handlers ──────────────────────────────────────────────────

async function handleList(req, res) {
  const pages = await queryClassifieds(
    { property: 'Status', select: { equals: 'Live' } },
    [{ property: 'Posted', direction: 'descending' }],
  );
  const today = new Date().toISOString().split('T')[0];
  const listings = pages.map((p) => parseClassified(p)).filter((l) => !l.expires || l.expires >= today);
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ listings, categories: CLASSIFIED_CATEGORIES });
}

async function handleOne(req, res) {
  const page = await getPage(req.query.id);
  const l = page && page.parent?.database_id?.replace(/-/g, '') === dbId().replace(/-/g, '') ? parseClassified(page) : null;
  if (!l || !['Live', 'Sold'].includes(l.status)) return res.status(404).json({ error: 'Listing not found' });
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ listing: l });
}

async function handleSubmit(req, res) {
  const { f, error } = validate(req.body || {});
  if (error) return res.status(400).json({ error });

  // Each submit sends a paid text, so cap how often one number can be used.
  const hourAgo = new Date(Date.now() - CODE_WINDOW_MS).toISOString();
  const recent = await queryClassifieds({ and: [
    { property: 'Phone', phone_number: { equals: f.phone } },
    { timestamp: 'created_time', created_time: { after: hourAgo } },
  ] });
  if (recent.length >= 3) return res.status(429).json({ error: 'Too many listings from this number in the last hour. Try again later.' });

  const code = String(crypto.randomInt(100000, 1000000));
  const flags = moderate(f);
  // Persist before notify: the record exists even if the text fails.
  const page = await notion('/pages', 'POST', {
    parent: { database_id: dbId() },
    properties: {
      Title: { title: text(f.title) },
      Category: { select: { name: f.category } },
      Status: { select: { name: 'Unverified' } },
      Price: { rich_text: text(f.price) },
      Description: { rich_text: text(f.description) },
      Town: { rich_text: text(f.town) },
      Photos: { rich_text: text(JSON.stringify(f.photos)) },
      'Seller Name': { rich_text: text(f.sellerName) },
      Phone: { phone_number: f.phone },
      'Contact Method': { select: { name: f.contactMethod } },
      Email: { email: f.email },
      'Verification Code': { rich_text: text(code) },
      'Edit Token': { rich_text: text(crypto.randomBytes(16).toString('hex')) },
      Flags: { rich_text: text(flags.join('; ')) },
    },
  });
  const sent = await sendCode(f.phone, code);
  if (!sent) return res.status(502).json({ error: 'We couldn\'t text that number. Check it and try again.' });
  return res.status(200).json({ id: page.id.replace(/-/g, '') });
}

async function handleVerify(req, res) {
  const { id, code } = req.body || {};
  const page = await getPage(id);
  const l = page && parseClassified(page, true);
  if (!l || l.status !== 'Unverified') return res.status(400).json({ error: 'This listing was already confirmed or can\'t be found. Start a new one if needed.' });
  if (Date.now() - new Date(l.createdTime).getTime() > CODE_WINDOW_MS) return res.status(400).json({ error: 'That code has expired. Please submit the listing again.' });
  if (!safeEqual(String(code || '').trim(), l.code)) return res.status(400).json({ error: 'That code doesn\'t match. Check the text and try again.' });

  await update(l.id, {
    Status: { select: { name: 'Pending Review' } },
    'Verification Code': { rich_text: [] },
  });

  // AI first pass. Word-rule flags always hold for Daryl; no answer from the AI holds too.
  const verdict = await aiReviewClassified(l);
  const outcome = verdict?.decision === 'reject' ? 'Rejected'
    : verdict?.decision === 'approve' && !l.flags ? 'Live'
    : 'Pending Review';
  const aiNote = verdict ? `AI: ${verdict.decision}${verdict.reasons.length ? ` (${verdict.reasons.join('; ')})` : ''}` : 'AI: no answer';
  l.flags = [l.flags, aiNote].filter(Boolean).join(' | ');
  await update(l.id, { Flags: { rich_text: text(l.flags) } });

  const reviewUrl = `${siteUrl()}/api/classifieds?action=review&id=${l.id}&key=${adminSig(l.id, 'review')}`;
  const adminEmail = process.env.ADMIN_EMAIL || 'daryl@manitoubeachmichigan.com';
  const textDaryl = (msg) => (process.env.DARYL_PHONE ? sendSMS(process.env.DARYL_PHONE, msg) : null);
  const flagBox = `<p style="background:#FBE9DF;border-radius:6px;padding:10px 12px;font-size:14px;margin:0 0 16px;"><strong>Why:</strong> ${esc(l.flags)}</p>`;

  if (outcome === 'Live') {
    await publish(l);
    await sendEmail(adminEmail, `Auto-approved: ${l.title}`,
      emailWrap(`<p style="font-size:20px;margin:8px 0 16px;color:#1A2830;">Published automatically</p>
<p style="font-size:14px;color:#6B5F52;margin:0 0 16px;">The AI review found nothing wrong, so this one is live. Nothing to do unless it looks off.</p>
${listingSummaryHtml(l)}<p><a href="${reviewUrl}" style="${BUTTON}background:#1A2830;color:#FAF6EF;">Open (take down if needed)</a></p>`));
  } else if (outcome === 'Rejected') {
    await rejectListing(l);
    await Promise.all([
      textDaryl(`Classified REJECTED by AI (${l.category}): ${l.title}\nby ${l.sellerName}\nWhy: ${l.flags}\nOverride: ${reviewUrl}`),
      sendEmail(adminEmail, `AI rejected: ${l.title}`,
        emailWrap(`<p style="font-size:20px;margin:8px 0 16px;color:#1A2830;">Rejected by the AI review</p>${flagBox}
${listingSummaryHtml(l)}<p><a href="${reviewUrl}" style="${BUTTON}background:#1A2830;color:#FAF6EF;">Publish anyway</a></p>`)),
    ]);
  } else {
    await Promise.all([
      textDaryl(`Classified needs your eyes (${l.category}): ${l.title}\nby ${l.sellerName}\nWhy: ${l.flags}\nReview: ${reviewUrl}`),
      sendEmail(adminEmail, `Classified to review: ${l.title}`,
        emailWrap(`<p style="font-size:20px;margin:8px 0 16px;color:#1A2830;">New listing to review</p>${flagBox}
${listingSummaryHtml(l)}<p><a href="${reviewUrl}" style="${BUTTON}background:#1A2830;color:#FAF6EF;">Review listing</a></p>`)),
      sendEmail(l.email, 'We got your listing',
        emailWrap(`<p style="font-size:20px;margin:8px 0 12px;color:#1A2830;">Thanks, ${esc(l.sellerName.split(' ')[0])}.</p>
<p style="font-size:15px;line-height:1.7;">Your listing <strong>${esc(l.title)}</strong> is with us for a quick look. We check listings to keep scammers out. You'll get an email the moment it's live.</p>`)),
    ]);
  }
  return res.status(200).json({ ok: true, status: outcome, id: l.id });
}

async function publish(l) {
  await update(l.id, {
    Status: { select: { name: 'Live' } },
    Posted: { date: { start: new Date().toISOString().split('T')[0] } },
    Expires: { date: { start: addDays(LISTING_DAYS) } },
    'Renewal Sent': { checkbox: false },
  });
  await sendEmail(l.email, `Your listing is live: ${l.title}`,
    emailWrap(`<p style="font-size:20px;margin:8px 0 12px;color:#1A2830;">You're live.</p>
<p style="font-size:15px;line-height:1.7;"><strong>${esc(l.title)}</strong> is now on Manitou Beach Classifieds for ${LISTING_DAYS} days, and new listings go out in our Thursday newsletter.</p>
<p><a href="${listingUrl(l)}" style="${BUTTON}background:#1A2830;color:#FAF6EF;">See your listing</a></p>
<p style="font-size:14px;line-height:1.7;color:#6B5F52;">Sold it, or need more time? Use this link any time: <a href="${manageUrl(l)}" style="color:#D4845A;">manage your listing</a>. Keep this email.</p>`));
}

async function rejectListing(l) {
  await update(l.id, { Status: { select: { name: 'Rejected' } } });
  await sendEmail(l.email, 'About your Manitou Beach listing',
    emailWrap(`<p style="font-size:15px;line-height:1.7;margin-top:12px;">Thanks for sending <strong>${esc(l.title)}</strong>. We weren't able to publish it on Manitou Beach Classifieds. If you think that's a mistake, just reply to this email.</p>`));
}

async function handleResend(req, res) {
  const page = await getPage((req.body || {}).id);
  const l = page && parseClassified(page, true);
  if (!l || l.status !== 'Unverified' || Date.now() - new Date(l.createdTime).getTime() > CODE_WINDOW_MS) {
    return res.status(400).json({ error: 'Please submit the listing again.' });
  }
  const sent = await sendCode(l.phone, l.code);
  return sent ? res.status(200).json({ ok: true }) : res.status(502).json({ error: 'We couldn\'t send the text. Try again in a minute.' });
}

function sendHtml(res, status, title, body) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).send(htmlPage(title, body));
}

async function handleReview(req, res) {
  const { id, key } = req.query;
  if (!safeEqual(String(key || ''), adminSig(id, 'review'))) return sendHtml(res, 403, 'Link not valid', '<p>This review link isn\'t valid.</p>');
  const page = await getPage(id);
  if (!page) return sendHtml(res, 404, 'Not found', '<p>That listing no longer exists.</p>');
  const l = parseClassified(page, true);
  const form = (decision, label, bg) => `<form method="POST" action="/api/classifieds" style="display:inline-block;margin:0 10px 10px 0;">
<input type="hidden" name="action" value="decide"><input type="hidden" name="id" value="${l.id}">
<input type="hidden" name="key" value="${esc(key)}"><input type="hidden" name="decision" value="${decision}">
<button type="submit" style="${BUTTON}background:${bg};color:#fff;">${label}</button></form>`;
  const actions = {
    'Pending Review': `${form('approve', 'Approve and publish', '#5B7A5A')}${form('reject', 'Reject', '#B5543A')}`,
    Rejected: `<p style="font-size:15px;">This listing was <strong>rejected</strong>.</p>${form('approve', 'Publish anyway', '#5B7A5A')}`,
    Live: `<p style="font-size:15px;">This listing is <strong>live</strong>.</p>${form('takedown', 'Take it down', '#B5543A')}`,
  }[l.status] || `<p style="font-size:15px;">Status: <strong>${esc(l.status)}</strong>. Nothing to do.</p>`;
  return sendHtml(res, 200, 'Review listing', `${l.flags ? `<p style="background:#FBE9DF;border-radius:6px;padding:10px 12px;font-size:14px;"><strong>Why:</strong> ${esc(l.flags)}</p>` : ''}${listingSummaryHtml(l)}${actions}`);
}

async function handleDecide(req, res) {
  const { id, key, decision } = req.body || {};
  if (!safeEqual(String(key || ''), adminSig(id, 'review'))) return sendHtml(res, 403, 'Link not valid', '<p>This review link isn\'t valid.</p>');
  const page = await getPage(id);
  const l = page && parseClassified(page, true);
  if (!l) return sendHtml(res, 404, 'Not found', '<p>That listing no longer exists.</p>');
  const allowed = { approve: ['Pending Review', 'Rejected'], reject: ['Pending Review'], takedown: ['Live'] }[decision];
  if (!allowed) return sendHtml(res, 400, 'Unknown choice', '<p>Nothing changed.</p>');
  if (!allowed.includes(l.status)) return sendHtml(res, 200, 'Already handled', `<p>This listing is already <strong>${esc(l.status)}</strong>.</p>`);

  if (decision === 'approve') {
    await publish(l);
    return sendHtml(res, 200, 'Published', `<p>${esc(l.title)} is live. ${esc(l.sellerName)} has been emailed.</p><p><a href="${listingUrl(l)}" style="color:#D4845A;">View it</a></p>`);
  }
  await rejectListing(l);
  return sendHtml(res, 200, decision === 'takedown' ? 'Taken down' : 'Rejected', `<p>${esc(l.title)} is off the board and the seller was emailed.</p>`);
}

async function sellerListing(id, token) {
  const page = await getPage(id);
  const l = page && parseClassified(page, true);
  return l && safeEqual(String(token || ''), l.editToken) ? l : null;
}

async function handleManage(req, res) {
  const { id, token } = req.query;
  const l = await sellerListing(id, token);
  if (!l) return sendHtml(res, 404, 'Link not valid', '<p>We couldn\'t find that listing. Check the link in your email.</p>');
  const button = (op, label, bg) => `<form method="POST" action="/api/classifieds" style="display:inline-block;margin:0 10px 10px 0;">
<input type="hidden" name="action" value="manage-do"><input type="hidden" name="id" value="${l.id}">
<input type="hidden" name="token" value="${esc(token)}"><input type="hidden" name="op" value="${op}">
<button type="submit" style="${BUTTON}background:${bg};color:#fff;">${label}</button></form>`;
  let status;
  let actions = '';
  if (l.status === 'Live' || l.status === 'Expired') {
    status = l.status === 'Live' ? `Live until <strong>${esc(l.expires)}</strong>.` : 'This listing has <strong>expired</strong>.';
    actions = `${button('renew', `Keep it up ${LISTING_DAYS} more days`, '#5B7A5A')}${button('sold', 'Mark as sold / filled', '#1A2830')}`;
  } else if (l.status === 'Pending Review') {
    status = 'We\'re still reviewing this listing. You\'ll get an email when it\'s live.';
  } else {
    status = `Status: <strong>${esc(l.status)}</strong>.`;
  }
  return sendHtml(res, 200, l.title, `<p style="font-size:15px;">${status}</p>${actions}`);
}

async function handleManageDo(req, res) {
  const { id, token, op } = req.body || {};
  const l = await sellerListing(id, token);
  if (!l) return sendHtml(res, 404, 'Link not valid', '<p>We couldn\'t find that listing.</p>');
  if (!['Live', 'Expired'].includes(l.status)) return sendHtml(res, 200, l.title, `<p>Status: <strong>${esc(l.status)}</strong>. Nothing changed.</p>`);
  if (op === 'renew') {
    const expires = addDays(LISTING_DAYS);
    await update(l.id, {
      Status: { select: { name: 'Live' } },
      Expires: { date: { start: expires } },
      'Renewal Sent': { checkbox: false },
    });
    return sendHtml(res, 200, 'Renewed', `<p>${esc(l.title)} stays up until <strong>${expires}</strong>.</p><p><a href="${listingUrl(l)}" style="color:#D4845A;">See your listing</a></p>`);
  }
  if (op === 'sold') {
    await update(l.id, { Status: { select: { name: 'Sold' } } });
    return sendHtml(res, 200, 'Marked as sold', `<p>Nice. ${esc(l.title)} is marked sold and comes off the board. Thanks for using Manitou Beach Classifieds.</p>`);
  }
  return sendHtml(res, 400, 'Unknown choice', '<p>Nothing changed.</p>');
}

export default async function handler(req, res) {
  if (!dbId() || !process.env.NOTION_TOKEN_BUSINESS) return res.status(500).json({ error: 'Classifieds not configured' });
  const action = req.method === 'GET' ? req.query.action : (req.body || {}).action;
  try {
    if (req.method === 'GET') {
      if (!action) return await handleList(req, res);
      if (action === 'one') return await handleOne(req, res);
      if (action === 'review') return await handleReview(req, res);
      if (action === 'manage') return await handleManage(req, res);
    } else if (req.method === 'POST') {
      if (action === 'submit') return await handleSubmit(req, res);
      if (action === 'verify') return await handleVerify(req, res);
      if (action === 'resend') return await handleResend(req, res);
      if (action === 'decide') return await handleDecide(req, res);
      if (action === 'manage-do') return await handleManageDo(req, res);
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error('classifieds error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
