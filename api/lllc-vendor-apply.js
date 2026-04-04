import { Resend } from 'resend';

function generateAppId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'LLLC-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function createNotionRecord(data) {
  const dbId = process.env.NOTION_DB_LLLC_VENDORS;
  if (!dbId) { console.warn('NOTION_DB_LLLC_VENDORS not set — skipping Notion'); return; }

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
        'Name':          { title: [{ text: { content: data.appId } }] },
        'Vendor Type':   { select: { name: data.vendorType } },
        'Contact Name':  { rich_text: [{ text: { content: data.contactName } }] },
        'Business Name': { rich_text: [{ text: { content: data.businessName || '' } }] },
        'Email':         { email: data.email },
        'Business Phone':{ phone_number: data.businessPhone || null },
        'Cell Phone':    { phone_number: data.cellPhone || null },
        'Address':       { rich_text: [{ text: { content: data.address || '' } }] },
        'Facebook URL':  { url: data.facebookUrl || null },
        'Website':       { url: data.website || null },
        'Bio':           { rich_text: [{ text: { content: data.bio || '' } }] },
        'Booth Size':    { select: data.boothSize ? { name: data.boothSize } : null },
        'Status':        { select: { name: 'Pending' } },
        'Applied':       { date: { start: new Date().toISOString().split('T')[0] } },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Notion create error:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    vendorType, contactName, businessName, email,
    businessPhone, cellPhone, address, facebookUrl,
    website, bio, boothSize,
  } = req.body;

  if (!vendorType || !contactName || !email) {
    return res.status(400).json({ error: 'Vendor type, contact name, and email are required.' });
  }

  const appId = generateAppId();
  const ORGANIZER_EMAIL = '1GypsyHeart66@gmail.com';
  const NOTIFY_EMAILS = [ORGANIZER_EMAIL, 'Kristy Faust <kfaust@example.com>'];
  const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    // 1. Notion record
    await createNotionRecord({
      appId, vendorType, contactName, businessName, email,
      businessPhone, cellPhone, address, facebookUrl, website, bio, boothSize,
    });

    // 2. Emails via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const boothLine = boothSize ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booth Size</p><p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${boothSize}</p>` : '';
      const photoNote = ['Artist / Fine Art', 'Crafter'].includes(vendorType)
        ? `<p style="background:#FFF8EE;border:1px solid #E8D8B0;border-radius:8px;padding:14px 18px;color:#5C5248;font-size:13px;line-height:1.6;margin:0 0 24px;">
            <strong>Next step:</strong> Email a minimum of 4 photos of your artwork to
            <a href="mailto:${ORGANIZER_EMAIL}" style="color:#b08d57;">${ORGANIZER_EMAIL}</a>
            with subject line <strong>${appId}</strong>. Applications without photos will not be reviewed.
          </p>`
        : '';

      // Confirmation to applicant
      try {
        await resend.emails.send({
          from: 'Devils Lake Summer Festival <tickets@manitoubeachmichigan.com>',
          to: email,
          subject: `Application received — Devils Lake Summerfest 2026 (${appId})`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <img src="${SITE_URL}/images/ladies-club/summer-festival.png" alt="Devils Lake Summer Festival" style="width:80px;height:80px;object-fit:contain;margin-bottom:20px;display:block;" />
              <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">Application received!</h1>
              <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.6;">
                Thanks ${contactName}! We've received your vendor application for the <strong>2026 Devils Lake Summerfest</strong> (June 20, 2026). We'll review it and get back to you within a week.
              </p>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Application ID</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:24px;font-weight:700;letter-spacing:2px;">${appId}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Vendor Type</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${vendorType}</p>
                ${businessName ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Business</p><p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${businessName}</p>` : ''}
                ${boothLine}
              </div>
              ${photoNote}
              <p style="color:#8C806E;font-size:13px;line-height:1.6;margin:0 0 8px;">
                Application deadline: <strong>May 20, 2026</strong>. Payment will be due within 2 weeks of acceptance.
              </p>
              <p style="color:#8C806E;font-size:13px;line-height:1.6;margin:0;">
                Questions? Text <strong>Kristy Faust</strong> at (517) 403-1788 or <strong>Laura Heidtman</strong> at (419) 708-2805.
              </p>
            </div>
          `,
        });
      } catch (e) { console.error('Applicant email error:', e.message); }

      // Notification to organizer
      try {
        await resend.emails.send({
          from: 'LLLC Applications <tickets@manitoubeachmichigan.com>',
          to: ORGANIZER_EMAIL,
          subject: `New vendor application: ${contactName}${businessName ? ` — ${businessName}` : ''} (${appId})`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <h2 style="color:#1A2830;font-size:18px;margin:0 0 16px;">New Summerfest vendor application</h2>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Application ID</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:18px;font-weight:700;letter-spacing:1px;">${appId}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Vendor Type</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:15px;font-weight:600;">${vendorType}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Contact</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:14px;">${contactName}${businessName ? ` · ${businessName}` : ''}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email / Phone</p>
                <p style="margin:0 0 12px;color:#1A2830;font-size:14px;">
                  <a href="mailto:${email}" style="color:#5B7D8E;">${email}</a>
                  ${businessPhone ? ` · ${businessPhone}` : ''}
                  ${cellPhone ? ` · Cell: ${cellPhone}` : ''}
                </p>
                ${boothSize ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booth Size</p><p style="margin:0 0 12px;color:#1A2830;font-size:14px;">${boothSize}</p>` : ''}
                ${address ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Address</p><p style="margin:0 0 12px;color:#1A2830;font-size:14px;">${address}</p>` : ''}
                ${facebookUrl ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Facebook</p><p style="margin:0 0 12px;color:#1A2830;font-size:14px;"><a href="${facebookUrl}" style="color:#5B7D8E;">${facebookUrl}</a></p>` : ''}
                ${website ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Website</p><p style="margin:0 0 12px;color:#1A2830;font-size:14px;"><a href="${website}" style="color:#5B7D8E;">${website}</a></p>` : ''}
                ${bio ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Bio / Description</p><p style="margin:0;color:#1A2830;font-size:14px;line-height:1.6;">${bio}</p>` : ''}
              </div>
              <p style="color:#8C806E;font-size:12px;">Submitted ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          `,
        });
      } catch (e) { console.error('Organizer email error:', e.message); }
    }

    return res.status(200).json({ success: true, appId });

  } catch (err) {
    console.error('LLLC vendor apply error:', err);
    return res.status(500).json({ error: 'Submission failed. Please try again or contact us directly.' });
  }
}
