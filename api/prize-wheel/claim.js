import { Resend } from 'resend';
import QRCode from 'qrcode';
import { sendSMS, normalizePhone } from '../lib/twilio.js';

// Unambiguous chars - no I, O, 0, 1, L
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function genCode() {
  const pick = (n) => Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
  return `MB-${pick(4)}-${pick(2)}`;
}

// Server-side daily limit: has this email already claimed a coupon in the last 24h?
// The client localStorage gate (mb_spin_date) is UX only and trivially bypassed
// (incognito / clear storage), so the coupon — the thing of actual value — is
// gated here on the server. Keyed on email (not IP) so shared wifi at a cafe
// doesn't block legitimate separate visitors.
async function hasClaimedToday(email) {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  try {
    const res = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_PRIZE_WHEEL_CLAIMS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Winner Email', email: { equals: email } },
              { property: 'Issued At', date: { on_or_after: cutoff } },
            ],
          },
          page_size: 1,
        }),
      }
    );
    if (!res.ok) {
      // Fail OPEN on a query error: don't block a real winner because Notion
      // hiccuped. Abuse protection degrades gracefully; it never hard-fails a claim.
      console.error('Daily-limit check query failed:', res.status);
      return false;
    }
    const data = await res.json();
    return (data.results || []).length > 0;
  } catch (err) {
    console.error('Daily-limit check error:', err.message);
    return false; // fail open
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, phone, prizeLabel, sponsorName, sponsorId } = req.body || {};
  if (!email || !prizeLabel || !sponsorName) {
    return res.status(400).json({ error: 'email, prizeLabel, and sponsorName are required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (!cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email.' });
  }

  // One coupon per email per day (server-enforced)
  if (await hasClaimedToday(cleanEmail)) {
    return res.status(429).json({
      error: "Looks like you've already claimed a prize today. Come back tomorrow for another spin!",
      alreadyClaimed: true,
    });
  }

  const claimCode = genCode();
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const redeemUrl = `${siteUrl}/redeem?code=${claimCode}`;

  try {
    // Write claim to Notion
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_PRIZE_WHEEL_CLAIMS },
        properties: {
          'Claim Code': { title: [{ text: { content: claimCode } }] },
          'Winner Email': { email: cleanEmail },
          'Prize Label': { rich_text: [{ text: { content: prizeLabel } }] },
          'Sponsor Name': { rich_text: [{ text: { content: sponsorName } }] },
          ...(sponsorId && { 'Sponsor ID': { rich_text: [{ text: { content: sponsorId } }] } }),
          'Issued At': { date: { start: issuedAt } },
          'Expires At': { date: { start: expiresAt } },
          'Status': { select: { name: 'issued' } },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json();
      console.error('Notion claim write error:', err);
      return res.status(500).json({ error: 'Failed to save your prize. Try again in a sec.' });
    }

    // Generate QR as base64 (for both email inline + attachment)
    const qrBuffer = await QRCode.toBuffer(redeemUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#1A2830', light: '#FFFFFF' },
    });
    const qrBase64 = qrBuffer.toString('base64');
    const qrDataUrl = `data:image/png;base64,${qrBase64}`;

    const expiryDisplay = new Date(expiresAt).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    // Fire email - no await so response returns fast
    const resend = new Resend(process.env.RESEND_API_KEY);
    resend.emails.send({
      from: 'Manitou Beach <hello@manitoubeachmichigan.com>',
      to: cleanEmail,
      subject: `Your prize is locked in - ${prizeLabel}`,
      attachments: [{ filename: 'prize-qr.png', content: qrBase64 }],
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#FAF6EF;padding:32px 24px;border-radius:16px;">
          <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">You won something good.</h1>
          <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.6;">
            Show this to the staff at <strong>${sponsorName}</strong> and your prize is yours. No fuss - just show the QR code or read off the code below.
          </p>

          <div style="background:#fff;border-radius:14px;padding:24px;text-align:center;margin-bottom:24px;border:1.5px solid #E8DFD0;">
            <p style="color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 8px;">Your prize</p>
            <p style="font-size:22px;font-weight:700;color:#1A2830;margin:0 0 4px;">${prizeLabel}</p>
            <p style="font-size:14px;color:#7A8E72;margin:0 0 20px;">from ${sponsorName}</p>

            <img src="${qrDataUrl}" alt="QR Code" width="200" height="200"
              style="display:block;margin:0 auto 14px;border-radius:8px;" />
            <p style="font-family:'Courier New',monospace;font-size:18px;letter-spacing:3px;color:#2D3B45;font-weight:700;margin:0 0 8px;">${claimCode}</p>
            <p style="font-size:12px;color:#9A8E7E;margin:0;">QR code also attached to this email</p>
          </div>

          <div style="background:#fff;border-radius:10px;padding:14px 20px;margin-bottom:20px;border:1px solid #E8DFD0;">
            <p style="margin:0 0 4px;color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Expires</p>
            <p style="margin:0;color:#1A2830;font-size:14px;">${expiryDisplay}</p>
          </div>

          <p style="color:#6B6052;font-size:13px;line-height:1.6;margin:0 0 8px;">
            Valid for 7 days. One use only. Staff will mark it redeemed when you visit.
          </p>
          <p style="color:#9A8E7E;font-size:12px;line-height:1.5;margin:0;">
            Questions? Stop in and the folks at ${sponsorName} will take care of you.
          </p>
        </div>
      `,
    }).then(r => {
      if (r.error) console.error('Resend claim email error:', JSON.stringify(r.error));
    }).catch(err => console.error('Resend claim email exception:', err.message));

    // Optional SMS delivery - fire-and-forget, never blocks the response and
    // never fails the claim (sendSMS returns false on any error). Only attempts
    // if the visitor supplied a phone that normalizes to 10 US digits.
    const digits = normalizePhone(phone);
    if (digits.length === 10) {
      const smsBody =
        `Manitou Beach: You won ${prizeLabel} from ${sponsorName}! ` +
        `Code ${claimCode} - show it within 7 days. Details: ${redeemUrl}`;
      sendSMS(digits, smsBody).catch(err => console.error('Claim SMS error:', err.message));
    }

    return res.status(200).json({ claimCode, expiresAt });
  } catch (err) {
    console.error('Prize wheel claim error:', err.message);
    return res.status(500).json({ error: 'Something went wrong saving your prize. Try again.' });
  }
}
