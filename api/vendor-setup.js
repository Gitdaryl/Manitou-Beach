// Admin endpoint — activates vendor registration for an event:
// generates portal token, patches Notion, emails organizer their two ready-to-use URLs
import { Resend } from 'resend';

function generatePortalToken(length = 12) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < length; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { eventId, organizerName, organizerEmail, organizerLogoUrl, vendorCapacity, vendorFee } = req.body;
  if (!eventId || !organizerEmail) {
    return res.status(400).json({ error: 'eventId and organizerEmail are required' });
  }

  try {
    // Generate portal token
    const portalToken = generatePortalToken();

    const siteUrl = process.env.SITE_URL || 'https://manitoubeach.yetigroove.com';
    const registrationUrl = `${siteUrl}/vendor-register?event=${eventId}`;
    const portalUrl = `${siteUrl}/vendor-portal?token=${portalToken}&event=${eventId}`;

    // Patch the Notion event page
    const properties = {
      'Vendor Reg Enabled':  { checkbox: true },
      'Vendor Portal Token': { rich_text: [{ text: { content: portalToken } }] },
    };
    if (organizerName) properties['Organizer Name'] = { rich_text: [{ text: { content: organizerName } }] };
    if (organizerEmail) properties['Organizer Email'] = { email: organizerEmail };
    if (organizerLogoUrl) properties['Organizer Logo URL'] = { url: organizerLogoUrl };
    if (vendorCapacity != null && vendorCapacity !== '') properties['Vendor Capacity'] = { number: Number(vendorCapacity) };
    if (vendorFee != null && vendorFee !== '') properties['Vendor Fee'] = { number: Number(vendorFee) };

    const notionRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json();
      throw new Error(`Notion patch failed: ${err.message || JSON.stringify(err)}`);
    }

    // Fetch event name for the email
    const eventPage = await notionRes.json();
    const eventName = eventPage.properties['Event Name']?.title?.[0]?.plain_text || 'your event';

    // Email the organizer their ready-to-use URLs
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Yetickets <tickets@yetigroove.com>',
        to: organizerEmail,
        subject: `Vendor registration is live — ${eventName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
            <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">Your vendor registration is live!</h1>
            <p style="color:#5C5248;font-size:15px;margin:0 0 32px;">
              Here are your two links for <strong>${eventName}</strong>. Keep the portal link private — it's your organizer access.
            </p>

            <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #E8E0D5;">
              <p style="margin:0 0 6px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Share with vendors</p>
              <p style="margin:0 0 12px;color:#3A3028;font-size:13px;">Send this link to anyone who wants to register a vendor booth for your event.</p>
              <a href="${registrationUrl}" style="display:inline-block;background:#1A2830;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;word-break:break-all;">
                ${registrationUrl}
              </a>
            </div>

            <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:32px;border:1px solid #E8E0D5;">
              <p style="margin:0 0 6px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your organizer portal (private)</p>
              <p style="margin:0 0 12px;color:#3A3028;font-size:13px;">See who's registered, send messages to all vendors, and download your vendor list.</p>
              <a href="${portalUrl}" style="display:inline-block;background:#5B7D8E;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;word-break:break-all;">
                Open Vendor Portal →
              </a>
            </div>

            <div style="background:#F0F7F3;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#1A2830;">What happens next</p>
              <ul style="margin:0;padding:0 0 0 18px;color:#5C5248;font-size:14px;line-height:1.8;">
                <li>Every time a vendor registers, you'll get an email notification with their details</li>
                <li>Vendors receive a PDF receipt immediately after registering</li>
                <li>Use your portal to see the full list, send updates, and download a CSV</li>
                <li>You can email all vendors at once from the portal — great for parking instructions, load-in times, and last-minute changes</li>
              </ul>
            </div>

            <p style="color:#8C806E;font-size:12px;line-height:1.6;margin:0;">
              Powered by Yetickets · <a href="${siteUrl}/ticket-services" style="color:#5B7D8E;">manitoubeachmichigan.com</a>
            </p>
          </div>
        `,
      });
    }

    return res.status(200).json({
      success: true,
      eventName,
      portalToken,
      registrationUrl,
      portalUrl,
    });

  } catch (err) {
    console.error('vendor-setup error:', err);
    return res.status(500).json({ error: err.message || 'Setup failed' });
  }
}
