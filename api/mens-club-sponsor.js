// POST /api/mens-club-sponsor
// Receives a Yearly Sponsor / Golf Hole Sponsor application from /mens-club.
// Persists the payload to Vercel Blob FIRST, then sends emails (persist-before-notify).
// GET ?health=1 returns a config self-check.

import { put } from '@vercel/blob';
import { Resend } from 'resend';

const ADMIN_EMAIL = 'admin@yetigroove.com';
const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
const CLUB_NAME = "Devils Lake & Round Lake Men's Club";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      endpoint: 'mens-club-sponsor',
      blob: !!process.env.BLOB_READ_WRITE_TOKEN,
      resend: !!process.env.RESEND_API_KEY,
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { sponsorName, contactName, email, phone, tier, amount, message, logoUrl } = req.body || {};

  if (!sponsorName?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const record = {
    sponsorName: sponsorName.trim(),
    contactName: contactName?.trim() || '',
    email: email.trim(),
    phone: phone?.trim() || '',
    tier: tier || 'Custom Contribution',
    amount: Number(amount) || 0,
    message: message?.trim() || '',
    logoUrl: logoUrl || null,
    submittedAt: new Date().toISOString(),
  };

  // Persist FIRST — if this fails, the submission is not "received"
  try {
    const slug = record.sponsorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    await put(`intake/mens-club-sponsors/${Date.now()}-${slug}.json`, JSON.stringify(record, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });
  } catch (err) {
    console.error('mens-club-sponsor persist error:', err);
    return res.status(500).json({ error: "That didn't save on our end. Please try again, or call the club." });
  }

  // Notify — best-effort after persistence
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const firstName = (record.contactName || record.sponsorName).split(' ')[0] || 'friend';

    try {
      await resend.emails.send({
        from: `${CLUB_NAME} <tickets@manitoubeachmichigan.com>`,
        to: record.email,
        subject: `Sponsorship application received — ${CLUB_NAME}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
            <img src="${SITE_URL}/images/mens_club_logo.png" alt="${CLUB_NAME}" style="width:72px;height:72px;object-fit:cover;border-radius:50%;margin-bottom:20px;display:block;" />
            <h1 style="color:#3B3228;font-size:22px;margin:0 0 8px;">We got it, ${firstName}!</h1>
            <p style="color:#6B5D52;font-size:15px;margin:0 0 24px;line-height:1.6;">
              Thank you for supporting the <strong>${CLUB_NAME}</strong>. A club representative will follow up within 2 business days.
            </p>
            <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8DFD0;">
              <p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sponsor name (as it will appear on the banner &amp; t-shirt)</p>
              <p style="margin:0 0 12px;color:#3B3228;font-size:16px;font-weight:700;">${record.sponsorName}</p>
              <p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sponsorship</p>
              <p style="margin:0;color:#3B3228;font-size:15px;">${record.tier}${record.amount ? ` · $${record.amount.toLocaleString()}` : ''}</p>
            </div>
            <p style="color:#6B5D52;font-size:14px;line-height:1.7;margin:0 0 20px;">
              To complete your sponsorship, make your check payable to <strong>The ${CLUB_NAME}</strong> and mail it to
              <strong>3171 Round Lake Hwy., Manitou Beach, MI 49253</strong>.
              Yearly sponsorships are due by <strong>May 1st</strong> to be included on the 7K race shirts, golf hole signs, and event banner.
            </p>
            <p style="color:#9B8E85;font-size:13px;line-height:1.6;">
              The ${CLUB_NAME} is a 501(c)(3) nonprofit · EIN 46-4087550. Your contribution may be tax deductible.
            </p>
          </div>
        `,
      });
    } catch (e) { console.error('Sponsor confirmation email error:', e.message); }

    try {
      await resend.emails.send({
        from: `Men's Club Sponsorships <tickets@manitoubeachmichigan.com>`,
        to: ADMIN_EMAIL,
        reply_to: record.email,
        subject: `New Men's Club sponsor application: ${record.sponsorName}${record.tier ? ` — ${record.tier}` : ''}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
            <h2 style="color:#3B3228;font-size:18px;margin:0 0 16px;">New sponsorship application — ${CLUB_NAME}</h2>
            <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8DFD0;">
              <p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name for banner / t-shirt</p>
              <p style="margin:0 0 12px;color:#3B3228;font-size:16px;font-weight:700;">${record.sponsorName}</p>
              <p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sponsorship</p>
              <p style="margin:0 0 12px;color:#3B3228;font-size:15px;font-weight:600;">${record.tier}${record.amount ? ` · $${record.amount.toLocaleString()}` : ''}</p>
              ${record.contactName ? `<p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Contact</p><p style="margin:0 0 12px;color:#3B3228;font-size:14px;">${record.contactName}</p>` : ''}
              <p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</p>
              <p style="margin:0 0 12px;color:#3B3228;font-size:14px;"><a href="mailto:${record.email}">${record.email}</a></p>
              ${record.phone ? `<p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phone</p><p style="margin:0 0 12px;color:#3B3228;font-size:14px;">${record.phone}</p>` : ''}
              ${record.message ? `<p style="margin:0 0 4px;color:#9B8E85;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p><p style="margin:0;color:#3B3228;font-size:14px;line-height:1.6;">${record.message}</p>` : ''}
            </div>
            <p style="background:#EEF6EE;border:1px solid #C8E0C8;border-radius:8px;padding:14px 18px;color:#2D5A2D;font-size:13px;line-height:1.6;margin:0;">
              The sponsor was told to mail a check to 3171 Round Lake Hwy. and that someone will follow up within 2 business days.
              The full submission is saved in Vercel Blob under <strong>intake/mens-club-sponsors/</strong>.
            </p>
          </div>
        `,
      });
    } catch (e) { console.error('Admin notification email error:', e.message); }
  }

  return res.status(200).json({ success: true });
}
