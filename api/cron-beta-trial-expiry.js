// Nightly cron — emails beta business owners a reminder 5 days before their trial ends (May 10)
// Runs daily; fires reminder once per business, then marks Trial Reminder Sent = true

import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_BUSINESS;
  if (!token || !dbId) {
    return res.status(500).json({ error: 'Missing Notion config' });
  }

  // Only start sending reminders from May 5 (5 days before May 10 billing)
  const today = new Date();
  const reminderStart = new Date('2026-05-05T00:00:00Z');
  const billingDate   = new Date('2026-05-10T00:00:00Z');

  if (today < reminderStart || today >= billingDate) {
    return res.status(200).json({ skipped: true, reason: 'Outside reminder window' });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    // Find beta businesses where Trial Reminder Sent is false (or not set)
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Beta',                 checkbox: { equals: true } },
            { property: 'Trial Reminder Sent',  checkbox: { equals: false } },
          ],
        },
      }),
    });

    if (!queryRes.ok) {
      console.error('Beta trial cron query failed:', await queryRes.text());
      return res.status(500).json({ error: 'Query failed' });
    }

    const data = await queryRes.json();
    const businesses = data.results || [];

    const baseUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
    let reminded = 0;

    for (const page of businesses) {
      const name  = page.properties['Name']?.title?.[0]?.text?.content || page.id;
      const email = page.properties['Email']?.email;
      const tier  = page.properties['Tier']?.select?.name || 'your listing';

      // Send reminder email
      if (email && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: 'Manitou Beach <events@yetigroove.com>',
            to: email,
            subject: `Your free beta listing ends May 10 — ${name}`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228;">
                <p style="font-size: 17px; margin-bottom: 8px;">Hi,</p>
                <p>Just a heads up — your free beta listing for <strong>${name}</strong> on Manitou Beach ends <strong>May 10</strong>.</p>
                <p>Your card on file will be charged automatically to continue your <strong>${tier}</strong> listing. No action needed to keep your listing live.</p>
                <p>If you'd like to cancel before May 10, you can do so through the Stripe customer portal or reply to this email and we'll handle it.</p>
                <p style="margin: 24px 0;">
                  <a href="${baseUrl}/discover" style="background: #D4845A; color: #FAF6EF; text-decoration: none; padding: 13px 24px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 13px; letter-spacing: 1px;">
                    View Your Listing →
                  </a>
                </p>
                <p style="font-size: 13px; color: #8A7E6E;">Thanks for being a Manitou Beach beta founder.</p>
                <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 24px 0;">
                <p style="font-size: 11px; color: #9A8E7E;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error(`Beta trial reminder email failed for ${name}:`, emailErr.message);
          continue; // Don't mark as sent if email failed
        }
      }

      // Mark Trial Reminder Sent = true
      await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: { 'Trial Reminder Sent': { checkbox: true } },
        }),
      });

      console.log(`Beta trial reminder sent: ${name} (${email})`);
      reminded++;
    }

    return res.status(200).json({ reminded, checked: businesses.length });
  } catch (err) {
    console.error('cron-beta-trial-expiry error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
