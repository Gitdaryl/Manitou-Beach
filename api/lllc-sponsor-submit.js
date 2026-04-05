// POST /api/lllc-sponsor-submit
// Receives a sponsorship application from the LLLC page form.
// Writes a pending record to Notion (Active = false).
// Michele checks "Active" in Notion → sponsor appears on the live page.
// Sends: confirmation email to sponsor, notification email to Michele.

import { Resend } from 'resend';

const ORGANIZER_EMAIL = '1GypsyHeart66@gmail.com';
const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

async function writeToNotion(data) {
  const dbId = process.env.NOTION_DB_LLLC_SPONSORS;
  if (!dbId) { console.warn('NOTION_DB_LLLC_SPONSORS not set — skipping Notion'); return; }

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        'Name':         { title:        [{ text: { content: data.sponsorName } }] },
        'Tier':         { select:       { name: data.tier } },
        'Logo URL':     { url:          data.logoUrl || null },
        'Website URL':  { url:          data.websiteUrl || null },
        'Contact Name': { rich_text:    [{ text: { content: data.contactName || '' } }] },
        'Email':        { email:        data.email },
        'Phone':        { phone_number: data.phone || null },
        'Message':      { rich_text:    [{ text: { content: data.message || '' } }] },
        'Active':       { checkbox:     false },
        'Submitted At': { date:         { start: new Date().toISOString().split('T')[0] } },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Notion write error:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sponsorName, contactName, email, phone, tier, message, logoUrl, websiteUrl } = req.body;

  if (!sponsorName?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Sponsor name and email are required.' });
  }

  try {
    await writeToNotion({ sponsorName, contactName, email, phone, tier, message, logoUrl, websiteUrl });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const firstName = (contactName || sponsorName).split(' ')[0] || 'friend';

      // Confirmation to sponsor
      try {
        await resend.emails.send({
          from: 'Land & Lake Ladies Club <tickets@manitoubeachmichigan.com>',
          to: email,
          subject: `Sponsorship application received — LLLC Summerfest 2026`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <img src="${SITE_URL}/images/ladies-club/summer-festival.png" alt="LLLC Summerfest" style="width:72px;height:72px;object-fit:contain;margin-bottom:20px;display:block;" />
              <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">We got it, ${firstName}!</h1>
              <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.6;">
                Thank you for your interest in sponsoring the <strong>2026 LLLC Summerfest</strong>! A club representative will follow up with you within 2 business days.
              </p>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sponsor</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:16px;font-weight:700;">${sponsorName}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sponsorship Level</p>
                <p style="margin:0;color:#1A2830;font-size:15px;">${tier || 'Not specified'}</p>
              </div>
              <p style="color:#8C806E;font-size:13px;line-height:1.6;">
                Questions? Email <a href="mailto:${ORGANIZER_EMAIL}" style="color:#5B7D8E;">${ORGANIZER_EMAIL}</a>
              </p>
            </div>
          `,
        });
      } catch (e) { console.error('Sponsor confirmation email error:', e.message); }

      // Notification to Michele
      try {
        await resend.emails.send({
          from: 'LLLC Sponsorships <tickets@manitoubeachmichigan.com>',
          to: ORGANIZER_EMAIL,
          subject: `New sponsorship application: ${sponsorName}${tier ? ` — ${tier}` : ''}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <h2 style="color:#1A2830;font-size:18px;margin:0 0 16px;">New Summerfest sponsorship application</h2>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sponsor Name</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:16px;font-weight:700;">${sponsorName}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sponsorship Level</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:15px;font-weight:600;">${tier || 'Not specified'}</p>
                ${contactName ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Contact</p><p style="margin:0 0 12px;color:#1A2830;font-size:14px;">${contactName}</p>` : ''}
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:14px;"><a href="mailto:${email}" style="color:#5B7D8E;">${email}</a></p>
                ${phone ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phone</p><p style="margin:0 0 12px;color:#1A2830;font-size:14px;">${phone}</p>` : ''}
                ${websiteUrl ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Website</p><p style="margin:0 0 12px;color:#1A2830;font-size:14px;"><a href="${websiteUrl}" style="color:#5B7D8E;">${websiteUrl}</a></p>` : ''}
                ${message ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p><p style="margin:0;color:#1A2830;font-size:14px;line-height:1.6;">${message}</p>` : ''}
              </div>
              <p style="background:#EEF6EE;border:1px solid #C8E0C8;border-radius:8px;padding:14px 18px;color:#2D5A2D;font-size:13px;line-height:1.6;margin:0 0 16px;">
                <strong>To approve this sponsor:</strong> Open your LLLC Sponsors database in Notion, find <strong>${sponsorName}</strong>, and check the <strong>Active</strong> checkbox. They'll appear on the website within a minute.
              </p>
              <p style="color:#8C806E;font-size:12px;">Submitted ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          `,
        });
      } catch (e) { console.error('Organizer notification email error:', e.message); }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('lllc-sponsor-submit error:', err);
    return res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
}
