import { Resend } from 'resend';

// ============================================================
// Generic community application endpoint
// Handles: Vendor, Member, Sponsor, General application types
// across all communities (Devils Lake, South Haven, etc.)
//
// Body: { community, org, type, contactName, email, ...fields }
// ============================================================

// Org routing config - add one entry per org/type combo when onboarding new partners
const ORG_CONFIG = {
  'LLLC-Vendor': {
    organizerEmail: '1GypsyHeart66@gmail.com',
    eventLabel: 'Devils Lake Summerfest 2026',
    eventDate: 'June 20, 2026 · 9am–2pm',
    deadline: 'May 20, 2026',
    contacts: 'Kristy Faust (517) 403-1788 · Laura Heidtman (419) 708-2805',
    requiresPhotos: (fields) => ['Artist / Fine Art', 'Crafter'].includes(fields.vendorType),
    photoEmail: '1GypsyHeart66@gmail.com',
  },
  'LLLC-Member': {
    organizerEmail: 'Michele.henson0003@gmail.com',
    eventLabel: 'Land & Lake Ladies Club',
    contacts: 'Michele Henson · Michele.henson0003@gmail.com',
    requiresPhotos: () => false,
  },
  // Template for future orgs:
  // 'MensClub-Vendor': { organizerEmail: '...', eventLabel: '...', ... },
};

function generateAppId(org) {
  const prefix = org === 'LLLC' ? 'LLLC' : org.toUpperCase().slice(0, 4);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${suffix}`;
}

async function saveToNotion({ appId, community, org, type, contactName, businessName, email,
  businessPhone, cellPhone, address, facebookUrl, website, bio, boothSize }) {
  const dbId = process.env.NOTION_DB_COMMUNITY_APPS;
  if (!dbId) { console.warn('NOTION_DB_COMMUNITY_APPS not set - skipping Notion'); return; }

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
        'Name':           { title: [{ text: { content: appId } }] },
        'Community':      { select: { name: community } },
        'Org':            { select: { name: org } },
        'Type':           { select: { name: type } },
        'Status':         { select: { name: 'Pending' } },
        'Contact Name':   { rich_text: [{ text: { content: contactName } }] },
        'Business Name':  { rich_text: [{ text: { content: businessName || '' } }] },
        'Email':          { email },
        'Business Phone': { phone_number: businessPhone || null },
        'Cell Phone':     { phone_number: cellPhone || null },
        'Address':        { rich_text: [{ text: { content: address || '' } }] },
        'Facebook URL':   { url: facebookUrl || null },
        'Website':        { url: website || null },
        'Bio':            { rich_text: [{ text: { content: bio || '' } }] },
        'Booth Size':     boothSize ? { select: { name: boothSize } } : { select: null },
        'Applied':        { date: { start: new Date().toISOString().split('T')[0] } },
      },
    }),
  });
  if (!res.ok) console.error('Notion error:', await res.text());
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    community, org, type,
    contactName, businessName, email,
    businessPhone, cellPhone, address,
    facebookUrl, website, bio, boothSize,
    vendorType, // passed through for photo logic
  } = req.body;

  if (!community || !org || !type || !contactName || !email) {
    return res.status(400).json({ error: 'community, org, type, contactName, and email are required.' });
  }

  const configKey = `${org}-${type}`;
  const config = ORG_CONFIG[configKey] || {};
  const appId = generateAppId(org);
  const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const needsPhotos = config.requiresPhotos?.({ vendorType }) ?? false;

  try {
    await saveToNotion({
      appId, community, org, type, contactName, businessName, email,
      businessPhone, cellPhone, address, facebookUrl, website, bio, boothSize,
    });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const photoBlock = needsPhotos
        ? `<div style="background:#FFF8EE;border:1px solid #E8D8B0;border-radius:8px;padding:14px 18px;margin:0 0 20px;">
            <p style="margin:0 0 4px;font-weight:700;color:#7a5c1e;font-size:13px;">📸 Next step - send your photos</p>
            <p style="margin:0;color:#5a4010;font-size:13px;line-height:1.6;">
              Email at least 4 photos of your artwork to
              <a href="mailto:${config.photoEmail}" style="color:#b08d57;">${config.photoEmail}</a>
              with subject line <strong>${appId}</strong>. Applications without photos will not be reviewed.
            </p>
          </div>`
        : '';

      const deadlineLine = config.deadline
        ? `<p style="color:#8C806E;font-size:13px;margin:0 0 6px;">Deadline: <strong>${config.deadline}</strong> · Payment due within 2 weeks of acceptance.</p>`
        : '';

      const contactLine = config.contacts
        ? `<p style="color:#8C806E;font-size:13px;margin:0;">Questions? ${config.contacts}</p>`
        : '';

      // Confirmation to applicant
      try {
        await resend.emails.send({
          from: `${config.eventLabel || org} <tickets@manitoubeachmichigan.com>`,
          to: email,
          subject: `Application received - ${config.eventLabel || org} (${appId})`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">Application received!</h1>
              <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.6;">
                Thanks ${contactName}! We've received your ${type.toLowerCase()} application
                ${config.eventLabel ? `for <strong>${config.eventLabel}</strong>` : ''}.
                We'll review it and respond within a week.
              </p>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Application ID</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:26px;font-weight:700;letter-spacing:2px;">${appId}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Type</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${vendorType || type}</p>
                ${businessName ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Business</p><p style="margin:0;color:#1A2830;font-size:15px;">${businessName}</p>` : ''}
              </div>
              ${photoBlock}
              ${deadlineLine}
              ${contactLine}
            </div>
          `,
        });
      } catch (e) { console.error('Applicant email error:', e.message); }

      // Notification to organizer
      if (config.organizerEmail) {
        try {
          await resend.emails.send({
            from: 'Community Applications <tickets@manitoubeachmichigan.com>',
            to: config.organizerEmail,
            subject: `New ${type} application: ${contactName}${businessName ? ` - ${businessName}` : ''} (${appId})`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
                <h2 style="color:#1A2830;font-size:18px;margin:0 0 4px;">New ${type} application</h2>
                <p style="color:#8C806E;font-size:13px;margin:0 0 20px;">${community} · ${org}</p>
                <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Application ID</p>
                  <p style="margin:0 0 14px;color:#1A2830;font-size:20px;font-weight:700;letter-spacing:1px;">${appId}</p>
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Contact</p>
                  <p style="margin:0 0 14px;color:#1A2830;font-size:14px;">${contactName}${businessName ? ` · ${businessName}` : ''}</p>
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email / Phone</p>
                  <p style="margin:0 0 14px;color:#1A2830;font-size:14px;">
                    <a href="mailto:${email}" style="color:#5B7D8E;">${email}</a>
                    ${businessPhone ? ` · ${businessPhone}` : ''}
                    ${cellPhone ? ` · Cell: ${cellPhone}` : ''}
                  </p>
                  ${vendorType ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Vendor Type</p><p style="margin:0 0 14px;color:#1A2830;font-size:14px;">${vendorType}</p>` : ''}
                  ${boothSize ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booth Size</p><p style="margin:0 0 14px;color:#1A2830;font-size:14px;">${boothSize}</p>` : ''}
                  ${address ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Address</p><p style="margin:0 0 14px;color:#1A2830;font-size:14px;">${address}</p>` : ''}
                  ${facebookUrl ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Facebook</p><p style="margin:0 0 14px;color:#1A2830;font-size:14px;"><a href="${facebookUrl}" style="color:#5B7D8E;">${facebookUrl}</a></p>` : ''}
                  ${bio ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Bio / Description</p><p style="margin:0;color:#1A2830;font-size:14px;line-height:1.6;">${bio}</p>` : ''}
                </div>
                <p style="color:#8C806E;font-size:12px;margin:0;">Submitted ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            `,
          });
        } catch (e) { console.error('Organizer email error:', e.message); }
      }
    }

    return res.status(200).json({ success: true, appId });

  } catch (err) {
    console.error('community-apply error:', err);
    return res.status(500).json({ error: 'Submission failed. Please try again.' });
  }
}
