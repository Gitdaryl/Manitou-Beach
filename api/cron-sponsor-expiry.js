// Vercel Cron - runs daily at 9am UTC
// Finds page sponsors expiring in exactly 5 days, sends renewal reminder email.
// vercel.json: { "path": "/api/cron-sponsor-expiry", "schedule": "0 9 * * *" }

import { createHmac } from 'crypto';
import { Resend } from 'resend';

export default async function handler(req, res) {
  // Allow Vercel cron scheduler (no Authorization header) or manual trigger with secret
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token  = process.env.NOTION_TOKEN_PAGE_SPONSORS || process.env.NOTION_TOKEN_BUSINESS;
  const dbId   = process.env.NOTION_DB_PAGE_SPONSORS;
  const secret = process.env.SPONSOR_CANCEL_SECRET;
  const siteUrl = process.env.SITE_URL || 'https://manitou-beach.vercel.app';

  if (!token || !dbId || !secret) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  // Target date = today + 5 days
  const target = new Date();
  target.setDate(target.getDate() + 5);
  const targetDate = target.toISOString().split('T')[0]; // YYYY-MM-DD

  let notified = 0;
  let errors   = 0;

  try {
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Status',               select:   { equals: 'active' } },
            { property: 'Expiry Date',           date:     { equals: targetDate } },
            { property: 'Renewal Reminder Sent', checkbox: { equals: false } },
          ],
        },
      }),
    });

    const data = await queryRes.json();
    const records = data.results || [];

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

    for (const record of records) {
      try {
        const p         = record.properties;
        const recordId  = record.id;
        const email     = p['Email']?.email;
        const bizName   = p['Business Name']?.title?.[0]?.plain_text || 'Your business';
        const pageLabel = p['Page Label']?.rich_text?.[0]?.plain_text || p['Page ID']?.select?.name || 'page';
        const expiryRaw = p['Expiry Date']?.date?.start;
        const subId     = p['Stripe Sub ID']?.rich_text?.[0]?.plain_text || '';
        const term      = p['Term']?.select?.name || 'monthly';

        if (!email) continue;

        // Generate HMAC cancel token (no DB storage needed - verified on the fly)
        const cancelToken = createHmac('sha256', secret).update(recordId).digest('hex');
        const cancelUrl   = `${siteUrl}/api/sponsor-cancel?id=${recordId}&token=${cancelToken}`;
        const renewUrl    = `${siteUrl}/business#page-sponsorship`;

        const expiryFmt = expiryRaw
          ? new Date(expiryRaw + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : targetDate;
        const amountFmt = term === 'annual' ? '$970/year' : '$97/month';

        if (resend) {
          await resend.emails.send({
            from: 'Manitou Beach <hello@manitou-beach.com>',
            to: email,
            subject: `Your ${pageLabel} sponsorship expires in 5 days`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#FAF6EF;">
                <h1 style="color:#1A2830;font-size:22px;font-weight:700;margin:0 0 8px;">Your sponsorship is expiring soon.</h1>
                <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.7;">
                  <strong>${bizName}</strong>'s sponsorship of the <strong>${pageLabel}</strong> page expires on
                  <strong style="color:#D4845A;">${expiryFmt}</strong>.
                </p>
                <p style="color:#5C5248;font-size:15px;margin:0 0 32px;line-height:1.7;">
                  Renew to keep your banner running - or let us know you're done and we'll offer the spot to the next person on the waitlist.
                </p>

                <div style="margin-bottom:36px;">
                  <a href="${renewUrl}" style="display:inline-block;background:#1A2830;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:20px;">
                    Renew Now - ${amountFmt} →
                  </a>
                  <br/>
                  <a href="${cancelUrl}" style="display:inline-block;color:#8C806E;text-decoration:none;font-size:13px;border-bottom:1px solid #C8BCAE;padding-bottom:1px;">
                    No thanks - cancel my sponsorship
                  </a>
                </div>

                <p style="color:#8C806E;font-size:12px;line-height:1.6;margin:0;">
                  If you do nothing, your sponsorship will expire on ${expiryFmt} and the spot will open to the waitlist.<br/>
                  Questions? Reply to this email.
                </p>
              </div>
            `,
          });
        }

        // Mark reminder sent
        await fetch(`https://api.notion.com/v1/pages/${recordId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
          body: JSON.stringify({ properties: { 'Renewal Reminder Sent': { checkbox: true } } }),
        });

        notified++;
        console.log(`Renewal reminder sent: ${bizName} → ${email} (${pageLabel}, expires ${expiryFmt})`);
      } catch (err) {
        console.error('Renewal reminder error for record', record.id, ':', err.message);
        errors++;
      }
    }

    return res.status(200).json({ ok: true, checked: records.length, notified, errors, targetDate });
  } catch (err) {
    console.error('cron-sponsor-expiry error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
