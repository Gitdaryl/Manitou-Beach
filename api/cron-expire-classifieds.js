import { requireCron } from './lib/cronAuth.js';
import { Resend } from 'resend';
import { LISTING_DAYS, siteUrl, notion, queryClassifieds, parseClassified, addDays, esc } from './lib/classifieds.js';
// Daily cron - Classifieds housekeeping:
//   1. Live listings expiring within 3 days get one "keep it up?" email (Renewal Sent = true)
//   2. Live listings past their Expires date flip to Expired, with a "renew any time" email
//   3. Unverified submissions older than 2 days (code never entered) are archived

const FROM = 'Manitou Beach Classifieds <events@manitoubeachmichigan.com>';

function mail(resend, to, subject, l, lead) {
  const manage = `${siteUrl()}/api/classifieds?action=manage&id=${l.id}&token=${l.editToken}`;
  return resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3B3228;background:#FAF6EF;padding:32px 28px;border-radius:8px;">
<p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;">Manitou Beach Classifieds</p>
<p style="font-size:15px;line-height:1.7;margin:12px 0 20px;">${lead}</p>
<p><a href="${manage}" style="display:inline-block;background:#1A2830;color:#FAF6EF;text-decoration:none;padding:13px 22px;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Keep it up ${LISTING_DAYS} more days</a></p>
<p style="font-size:13px;color:#8A7E6E;margin:18px 0 0;">Already sold or filled? Use the same link to mark it sold. Nothing to do otherwise.</p></div>`,
  });
}

export default async function handler(req, res) {
  if (!requireCron(req, res)) return;
  if (!process.env.NOTION_DB_CLASSIFIEDS) return res.status(500).json({ error: 'Missing NOTION_DB_CLASSIFIEDS' });

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const today = new Date().toISOString().split('T')[0];
  const soon = addDays(3);
  const counts = { reminded: 0, expired: 0, archived: 0 };

  try {
    const live = (await queryClassifieds({ property: 'Status', select: { equals: 'Live' } }))
      .map((p) => parseClassified(p, true));

    for (const l of live) {
      if (l.expires && l.expires < today) {
        await notion(`/pages/${l.id}`, 'PATCH', { properties: { Status: { select: { name: 'Expired' } } } });
        if (resend && l.email) {
          await mail(resend, l.email, `Your listing has expired: ${l.title}`, l,
            `Your listing <strong>${esc(l.title)}</strong> has come down after ${LISTING_DAYS} days. Still have it? Put it back up with one tap.`)
            .catch((e) => console.error('classifieds expiry email:', e.message));
        }
        counts.expired++;
      } else if (l.expires && l.expires <= soon && !l.renewalSent) {
        if (resend && l.email) {
          await mail(resend, l.email, `Still selling? ${l.title}`, l,
            `Your listing <strong>${esc(l.title)}</strong> comes down on <strong>${esc(l.expires)}</strong>. Want to keep it up?`)
            .catch((e) => console.error('classifieds reminder email:', e.message));
        }
        await notion(`/pages/${l.id}`, 'PATCH', { properties: { 'Renewal Sent': { checkbox: true } } });
        counts.reminded++;
      }
    }

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const stale = await queryClassifieds({ and: [
      { property: 'Status', select: { equals: 'Unverified' } },
      { timestamp: 'created_time', created_time: { before: twoDaysAgo } },
    ] });
    for (const p of stale) {
      await notion(`/pages/${p.id}`, 'PATCH', { archived: true });
      counts.archived++;
    }

    return res.status(200).json(counts);
  } catch (err) {
    console.error('cron-expire-classifieds error:', err.message);
    return res.status(500).json({ error: err.message, ...counts });
  }
}
