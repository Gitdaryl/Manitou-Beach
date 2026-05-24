// POST /api/cron-outreach-resolve
// Runs daily at 9am via Vercel cron
// Auth: CRON_SECRET (cron) or admin PIN (manual trigger from /outreach)
//
// URL Recovery tickets: looks up business in Notion, sends SMS/email with listing URL
// All other open tickets: compiles daily digest email to Daryl

import { put, list } from '@vercel/blob';
import { Resend } from 'resend';
import { sendSMS, normalizePhone } from './lib/twilio.js';

const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

async function readDb() {
  try {
    const { blobs } = await list({ prefix: 'outreach/db', token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blobs.length) return { businesses: [], tickets: [] };
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const r = await fetch(latest.url);
    if (!r.ok) return { businesses: [], tickets: [] };
    return await r.json();
  } catch {
    return { businesses: [], tickets: [] };
  }
}

async function writeDb(data) {
  await put('outreach/db.json', JSON.stringify({ ...data, lastUpdated: new Date().toISOString() }), {
    access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true,
  });
}

async function lookupNotionListing(bizName) {
  if (!bizName || !process.env.NOTION_DB_BUSINESS) return null;
  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`, {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: { property: 'Name', title: { contains: bizName } },
        page_size: 1,
      }),
    });
    const data = await r.json();
    if (!data.results?.length) return null;
    const page = data.results[0];
    const slug = page.properties?.Slug?.rich_text?.[0]?.plain_text
      || page.properties?.slug?.rich_text?.[0]?.plain_text;
    return slug ? `${SITE_URL}/business/${slug}` : null;
  } catch {
    return null;
  }
}

async function resolveUrlRecovery(ticket, biz) {
  const listingUrl = await lookupNotionListing(ticket.bizName || biz?.name || '');

  // If we have the URL and a phone number, SMS it directly to the business
  if (listingUrl && biz?.phone) {
    const digits = normalizePhone(biz.phone);
    if (digits.length === 10) {
      const sent = await sendSMS(digits, `Hi! Your Manitou Beach listing is at: ${listingUrl} - save this link. Questions? Reply anytime.`);
      if (sent) return `SMS sent with URL: ${listingUrl}`;
    }
  }

  // Otherwise escalate to Daryl via email
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'Manitou Beach Outreach <hello@manitoubeachmichigan.com>',
    to: 'admin@yetigroove.com',
    subject: `URL Recovery needed: ${ticket.bizName}`,
    html: `
      <h3 style="font-family:Georgia,serif;color:#2D3B45">URL Recovery Request</h3>
      <p style="font-family:Arial,sans-serif;font-size:14px">
        Agent <strong>${ticket.agent}</strong> logged this for <strong>${ticket.bizName}</strong>.
      </p>
      ${listingUrl
        ? `<p style="font-family:Arial,sans-serif;font-size:14px">Listing URL found: <a href="${listingUrl}">${listingUrl}</a></p>`
        : `<p style="font-family:Arial,sans-serif;font-size:14px;color:#B84040">No matching listing found in Notion - may need to be created.</p>`
      }
      ${biz?.phone
        ? `<p style="font-family:Arial,sans-serif;font-size:14px">Phone on file: <strong>${biz.phone}</strong></p>`
        : `<p style="font-family:Arial,sans-serif;font-size:14px;color:#999">No phone on file in outreach DB.</p>`
      }
      ${ticket.body ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:#666">Agent note: ${ticket.body}</p>` : ''}
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#999;margin-top:20px">
        Resolve at: <a href="${SITE_URL}/outreach">${SITE_URL}/outreach</a>
      </p>
    `,
  });

  return listingUrl
    ? `URL found (${listingUrl}) - no SMS phone, emailed Daryl`
    : `No Notion listing found - emailed Daryl`;
}

async function sendDigestEmail(tickets, agents) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const AGENT_NAMES = { lead: 'Chelsea', connector: 'Erin', followup: 'Amy', admin: 'Daryl' };
  const TYPE_LABELS = { question: 'Question', modification: 'Modification', idea: 'Idea', other: 'Other' };

  const rows = tickets.map(t => `
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:14px"><strong>${t.bizName || '—'}</strong></td>
      <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:13px;color:#5B7E95">${TYPE_LABELS[t.type] || t.type}</td>
      <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:13px">${AGENT_NAMES[t.agent] || t.agent}</td>
      <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:13px;color:#555">${t.body || '—'}</td>
      <td style="padding:10px 12px;font-family:Arial,sans-serif;font-size:12px;color:#999">${new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
    </tr>
  `).join('');

  await resend.emails.send({
    from: 'Manitou Beach Outreach <hello@manitoubeachmichigan.com>',
    to: 'admin@yetigroove.com',
    subject: `Outreach Inbox - ${tickets.length} open ticket${tickets.length > 1 ? 's' : ''}`,
    html: `
      <h2 style="font-family:Georgia,serif;color:#2D3B45;margin-bottom:4px">Outreach Inbox</h2>
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#999;margin-top:0">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Business</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Type</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Agent</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Details</th>
            <th style="padding:10px 12px;text-align:left;font-family:Arial,sans-serif;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:0.5px">Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#999;margin-top:24px">
        Resolve tickets at: <a href="${SITE_URL}/outreach" style="color:#5B7E95">${SITE_URL}/outreach</a>
      </p>
    `,
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // Auth: Vercel cron sends Authorization: Bearer <CRON_SECRET>, or admin can call manually
  const cronSecret = req.headers['authorization']?.replace('Bearer ', '');
  const adminPin = req.headers['x-outreach-pin'];
  const isAuthorized = (cronSecret && cronSecret === process.env.CRON_SECRET)
    || (adminPin && adminPin === process.env.OUTREACH_PIN_ADMIN);
  if (!isAuthorized) return res.status(401).json({ error: 'Unauthorized' });

  const db = await readDb();
  const openTickets = (db.tickets || []).filter(t => t.status === 'open');
  if (!openTickets.length) return res.status(200).json({ ok: true, processed: 0, message: 'No open tickets' });

  const urlRecoveryTickets = openTickets.filter(t => t.type === 'url_recovery');
  const otherTickets = openTickets.filter(t => t.type !== 'url_recovery');
  const autoResolved = [];

  // Handle URL recovery tickets individually - fully automated
  for (const ticket of urlRecoveryTickets) {
    const biz = (db.businesses || []).find(b => b.id === ticket.bizId);
    try {
      const resolution = await resolveUrlRecovery(ticket, biz);
      const idx = db.tickets.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        db.tickets[idx] = { ...db.tickets[idx], status: 'resolved', resolution, resolvedAt: new Date().toISOString() };
      }
      autoResolved.push({ id: ticket.id, bizName: ticket.bizName, resolution });
    } catch (err) {
      console.error(`outreach-resolve: URL recovery failed for ${ticket.bizName}:`, err.message);
    }
  }

  // Send daily digest for non-automated ticket types
  if (otherTickets.length > 0) {
    try {
      await sendDigestEmail(otherTickets, {});
    } catch (err) {
      console.error('outreach-resolve: digest email failed:', err.message);
    }
  }

  if (autoResolved.length > 0 || otherTickets.length > 0) {
    await writeDb(db);
  }

  return res.status(200).json({
    ok: true,
    autoResolved: autoResolved.length,
    digestSent: otherTickets.length > 0,
    details: autoResolved,
  });
}
