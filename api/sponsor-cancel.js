// GET /api/sponsor-cancel?id=NOTION_PAGE_ID&token=HMAC
// Called when a sponsor clicks "No Thanks" in the renewal reminder email.
// Cancels their Stripe subscription, marks Notion record as cancelled,
// and notifies the first person on the waitlist for that page.

import Stripe from 'stripe';
import { createHmac } from 'crypto';

async function notifyFirstWaitlistEntry(notionToken, pageId, pageLabel, siteUrl) {
  const dbId = process.env.NOTION_DB_SPONSOR_WAITLIST;
  if (!dbId || !pageId) return;

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
    body: JSON.stringify({
      filter: { and: [{ property: 'Page ID', select: { equals: pageId } }, { property: 'Status', select: { equals: 'waiting' } }] },
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
      page_size: 1,
    }),
  });
  const data = await res.json();
  if (!data.results?.length) return;

  const entry   = data.results[0];
  const entryId = entry.id;
  const email   = entry.properties['Email']?.email;
  const name    = entry.properties['Name']?.title?.[0]?.plain_text || 'there';
  const bizName = entry.properties['Business Name']?.rich_text?.[0]?.plain_text || '';

  // Mark notified
  await fetch(`https://api.notion.com/v1/pages/${entryId}`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
    body: JSON.stringify({ properties: { 'Status': { select: { name: 'notified' } }, 'Notified At': { date: { start: new Date().toISOString().split('T')[0] } } } }),
  });

  if (email && process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Manitou Beach <hello@manitou-beach.com>',
      to: email,
      subject: `The ${pageLabel} sponsorship spot just opened`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#FAF6EF;">
          <h1 style="color:#1A2830;font-size:22px;font-weight:700;margin:0 0 8px;">Good news, ${name}.</h1>
          <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.7;">
            The <strong>${pageLabel}</strong> page sponsorship on Manitou Beach just opened up.
            ${bizName ? `We had you on the list for <strong>${bizName}</strong>.` : ''}
            You're first in line - spots go fast.
          </p>
          <a href="${siteUrl}/business#page-sponsorship" style="display:inline-block;background:#1A2830;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:28px;">
            Claim the ${pageLabel} Page →
          </a>
          <p style="color:#8C806E;font-size:12px;line-height:1.6;margin:0;">
            $97/month or $970/year. One exclusive sponsor per page, seen by every visitor all year long.
          </p>
        </div>
      `,
    });
    console.log(`Waitlist notified: ${email} for ${pageLabel}`);
  }
}

export default async function handler(req, res) {
  const { id: recordId, token } = req.query;
  const secret   = process.env.SPONSOR_CANCEL_SECRET;
  const siteUrl  = process.env.SITE_URL || 'https://manitou-beach.vercel.app';

  if (!recordId || !token || !secret) {
    return res.status(400).send(errorPage('Invalid cancel link.'));
  }

  // Verify HMAC token
  const expected = createHmac('sha256', secret).update(recordId).digest('hex');
  if (token !== expected) {
    return res.status(403).send(errorPage('This cancel link is invalid or has already been used.'));
  }

  const notionToken = process.env.NOTION_TOKEN_PAGE_SPONSORS || process.env.NOTION_TOKEN_BUSINESS;
  const dbId        = process.env.NOTION_DB_PAGE_SPONSORS;
  if (!notionToken || !dbId) {
    return res.status(500).send(errorPage('System configuration error.'));
  }

  try {
    // Fetch the Notion record
    const pageRes  = await fetch(`https://api.notion.com/v1/pages/${recordId}`, {
      headers: { 'Authorization': `Bearer ${notionToken}`, 'Notion-Version': '2022-06-28' },
    });
    const pageData = await pageRes.json();
    if (!pageData.id) return res.status(404).send(errorPage('Sponsorship record not found.'));

    const p         = pageData.properties;
    const subId     = p['Stripe Sub ID']?.rich_text?.[0]?.plain_text;
    const bizName   = p['Business Name']?.title?.[0]?.plain_text || 'Your business';
    const pageLabel = p['Page Label']?.rich_text?.[0]?.plain_text || 'page';
    const pgId      = p['Page ID']?.select?.name;
    const status    = p['Status']?.select?.name;

    // Idempotent - already cancelled
    if (status === 'cancelled' || status === 'expired') {
      return res.status(200).send(successPage(bizName, pageLabel, true));
    }

    // Cancel Stripe subscription
    if (subId && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(subId);
      } catch (stripeErr) {
        // Subscription may already be cancelled - proceed anyway
        console.warn('Stripe cancel warning:', stripeErr.message);
      }
    }

    // Mark Notion record as cancelled
    await fetch(`https://api.notion.com/v1/pages/${recordId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ properties: { 'Status': { select: { name: 'cancelled' } } } }),
    });

    // Notify first waitlist entry
    await notifyFirstWaitlistEntry(notionToken, pgId, pageLabel, siteUrl);

    console.log(`Sponsor cancelled via link: ${bizName} → ${pageLabel}`);
    return res.status(200).send(successPage(bizName, pageLabel, false));
  } catch (err) {
    console.error('sponsor-cancel error:', err.message);
    return res.status(500).send(errorPage('Something went wrong. Please email hello@manitou-beach.com.'));
  }
}

function successPage(bizName, pageLabel, alreadyCancelled) {
  const msg = alreadyCancelled
    ? `Your ${pageLabel} sponsorship was already cancelled.`
    : `${bizName}'s sponsorship of the ${pageLabel} page has been cancelled. The spot will be offered to the next person on the waitlist.`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Sponsorship Cancelled</title>
    <style>body{font-family:sans-serif;background:#FAF6EF;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{max-width:480px;padding:48px 40px;background:#fff;border-radius:16px;border:1px solid #E8E0D5;text-align:center}
    h1{color:#1A2830;font-size:22px;margin:0 0 12px}p{color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 28px}
    a{color:#1A2830;font-size:13px}</style></head>
    <body><div class="box"><div style="font-size:36px;margin-bottom:20px">✓</div>
    <h1>Cancelled</h1><p>${msg}</p>
    <a href="/">← Back to Manitou Beach</a></div></body></html>`;
}

function errorPage(msg) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error</title>
    <style>body{font-family:sans-serif;background:#FAF6EF;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
    .box{max-width:480px;padding:48px 40px;background:#fff;border-radius:16px;border:1px solid #E8E0D5;text-align:center}
    h1{color:#1A2830;font-size:22px;margin:0 0 12px}p{color:#5C5248;font-size:15px;line-height:1.7;margin:0 0 28px}
    a{color:#1A2830;font-size:13px}</style></head>
    <body><div class="box"><div style="font-size:36px;margin-bottom:20px">✗</div>
    <h1>Link Error</h1><p>${msg}</p>
    <a href="/">← Back to Manitou Beach</a></div></body></html>`;
}
