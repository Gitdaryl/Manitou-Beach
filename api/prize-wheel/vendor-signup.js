import { Resend } from 'resend';
import { sendSMSFull, sendSMS, normalizePhone } from '../lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const {
    contactName,
    businessName,
    email,
    phone,
    vendorPin,
    logoUrl,
    dealLabel,
    dealDescription,
    dealColor,
  } = req.body || {};

  if (!contactName || !businessName || !email || !dealLabel) {
    return res.status(400).json({ error: 'Contact name, business name, email, and offer are required.' });
  }
  if (!/^\d{4}$/.test(String(vendorPin || ''))) {
    return res.status(400).json({ error: 'PIN must be exactly 4 digits.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  const trialStart = new Date().toISOString();
  const trialEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const safeColor = /^#[0-9A-Fa-f]{6}$/.test(dealColor) ? dealColor : '#D4845A';

  const headers = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_PRIZE_WHEEL_SPONSORS },
        properties: {
          'Business Name':  { title:        [{ text: { content: businessName } }] },
          'Contact Name':   { rich_text:    [{ text: { content: contactName } }] },
          'Contact Email':  { email:        cleanEmail },
          'Contact Phone':  { phone_number: phone || null },
          'Deal Label':     { rich_text:    [{ text: { content: dealLabel } }] },
          'Deal Description': { rich_text:  [{ text: { content: dealDescription || '' } }] },
          'Deal Color':     { rich_text:    [{ text: { content: safeColor } }] },
          ...(logoUrl && { 'Logo URL': { url: logoUrl } }),
          'Vendor PIN':     { rich_text:    [{ text: { content: vendorPin } }] },
          'Active':         { checkbox:     false },
          'Slot Count':     { number:       1 },
          'Plan Type':      { select:       { name: 'trial' } },
          'Trial Start':    { date:         { start: trialStart } },
          'Trial End':      { date:         { start: trialEnd } },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json();
      console.error('Notion vendor-signup error:', JSON.stringify(err));
      return res.status(500).json({ error: 'Failed to save your application. Please try again or contact Daryl directly.' });
    }

    const page = await notionRes.json();
    const sponsorId = page.id;
    const statsUrl = `${siteUrl}/sponsor-stats?id=${sponsorId}&pin=${vendorPin}`;
    const trialEndDisplay = new Date(trialEnd).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Vendor confirmation email
    resend.emails.send({
      from: 'Daryl at Manitou Beach <hello@manitoubeachmichigan.com>',
      to: cleanEmail,
      subject: `You're on the wheel - here's what happens next`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#FAF6EF;padding:32px 24px;border-radius:16px;">
          <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">You're in, ${contactName}!</h1>
          <p style="color:#5C5248;font-size:15px;margin:0 0 20px;line-height:1.6;">
            Thanks for signing up for a spot on the Manitou Beach Spin to Win wheel.
            Daryl will review and activate your slot within 24 hours.
            You'll get another email the moment you go live.
          </p>

          <div style="background:#fff;border-radius:14px;padding:24px;margin-bottom:20px;border:1.5px solid #E8DFD0;">
            <p style="color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 12px;">Your application</p>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;color:#8C806E;font-size:13px;width:120px;">Business</td>
                <td style="padding:6px 0;color:#1A2830;font-size:14px;font-weight:600;">${businessName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#8C806E;font-size:13px;">Offer</td>
                <td style="padding:6px 0;color:#1A2830;font-size:14px;">${dealLabel}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#8C806E;font-size:13px;">Trial ends</td>
                <td style="padding:6px 0;color:#1A2830;font-size:14px;">${trialEndDisplay}</td>
              </tr>
            </table>
          </div>

          <div style="background:#fff;border-radius:14px;padding:24px;margin-bottom:20px;border:1.5px solid #E8DFD0;">
            <p style="color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 8px;">Your vendor PIN</p>
            <p style="font-family:'Courier New',monospace;font-size:36px;letter-spacing:8px;color:#D4845A;font-weight:700;margin:0 0 8px;">${vendorPin}</p>
            <p style="color:#8C806E;font-size:12px;margin:0;line-height:1.5;">
              Your staff enter this PIN when scanning a customer's QR code to validate and redeem it.
              Keep it handy - maybe tape it near the counter.
            </p>
          </div>

          <div style="background:#fff;border-radius:14px;padding:24px;margin-bottom:24px;border:1.5px solid #E8DFD0;">
            <p style="color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 8px;">Your analytics dashboard</p>
            <p style="color:#5C5248;font-size:13px;margin:0 0 12px;line-height:1.5;">
              Track spins, wins, and redemptions in real time. Bookmark this link.
            </p>
            <a href="${statsUrl}" style="display:inline-block;padding:10px 20px;background:#D4845A;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
              View my dashboard
            </a>
          </div>

          <p style="color:#9A8E7E;font-size:12px;line-height:1.5;margin:0;">
            Questions? Reply to this email and Daryl will sort you out.
          </p>
        </div>
      `,
    }).catch(err => console.error('Vendor confirmation email error:', err.message));

    // Internal alert to Daryl
    resend.emails.send({
      from: 'Manitou Beach <hello@manitoubeachmichigan.com>',
      to: 'admin@yetigroove.com',
      subject: `New wheel vendor: ${businessName}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <h2 style="margin:0 0 16px;color:#1A2830;">New wheel vendor signup</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:8px 0;color:#666;width:140px;">Business</td><td style="padding:8px 0;font-weight:600;">${businessName}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Contact</td><td style="padding:8px 0;">${contactName}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;">${cleanEmail}</td></tr>
            ${phone ? `<tr><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;">${phone}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#666;">Offer</td><td style="padding:8px 0;">${dealLabel}</td></tr>
            ${dealDescription ? `<tr><td style="padding:8px 0;color:#666;">Fine print</td><td style="padding:8px 0;">${dealDescription}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#666;">Vendor PIN</td><td style="padding:8px 0;font-family:monospace;font-size:18px;font-weight:700;color:#D4845A;">${vendorPin}</td></tr>
            <tr><td style="padding:8px 0;color:#666;">Trial ends</td><td style="padding:8px 0;">${trialEndDisplay}</td></tr>
          </table>
          <p style="margin-bottom:16px;">
            <a href="https://www.notion.so/${sponsorId.replace(/-/g, '')}"
               style="display:inline-block;padding:10px 20px;background:#1A2830;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin-right:10px;">
              Open in Notion
            </a>
            <a href="${statsUrl}"
               style="display:inline-block;padding:10px 20px;background:#D4845A;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
              Their stats dashboard
            </a>
          </p>
          <p style="color:#666;font-size:13px;">Set <strong>Active = true</strong> in Notion to put them live on the wheel.</p>
        </div>
      `,
    }).catch(err => console.error('Daryl alert email error:', err.message));

    // SMS Daryl so it doesn't get buried in email
    if (process.env.DARYL_PHONE) {
      sendSMSFull(process.env.DARYL_PHONE,
        `Wheel vendor applied: ${businessName} (${contactName}). Go to Notion to approve. Once active they'll appear on the wheel.`
      ).catch(err => console.error('Daryl alert SMS error:', err.message));
    }

    return res.status(200).json({ ok: true, sponsorId, statsUrl });
  } catch (err) {
    console.error('Vendor signup error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
