import Stripe from 'stripe';
import { Resend } from 'resend';

// Called by the success page after Stripe redirects back.
// Verifies the session, creates a Notion record, and sends emails.
// Safe to call multiple times - Notion write is idempotent on app ID.

function generateMemberId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'LLLC-M-';
  for (let i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function saveToNotion({ memberId, name, email, phone, birthdate, address }) {
  const dbId = process.env.NOTION_DB_COMMUNITY_APPS;
  if (!dbId) { console.warn('NOTION_DB_COMMUNITY_APPS not set'); return; }

  await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        'Name':         { title: [{ text: { content: memberId } }] },
        'Community':    { select: { name: 'Devils Lake' } },
        'Org':          { select: { name: 'LLLC' } },
        'Type':         { select: { name: 'Member' } },
        'Status':       { select: { name: 'Accepted' } },
        'Contact Name': { rich_text: [{ text: { content: name } }] },
        'Email':        { email },
        'Business Phone': { phone_number: phone || null },
        'Address':      { rich_text: [{ text: { content: address || '' } }] },
        'Bio':          { rich_text: [{ text: { content: birthdate ? `DOB: ${birthdate}` : '' } }] },
        'Applied':      { date: { start: new Date().toISOString().split('T')[0] } },
      },
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed.' });
    }

    const { name, email, phone, birthdate, address } = session.metadata;
    const memberId = generateMemberId();

    // Notion record
    await saveToNotion({ memberId, name, email, phone, birthdate, address });

    // Emails
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

      // Welcome email to member
      try {
        await resend.emails.send({
          from: 'Land & Lake Ladies Club <tickets@manitoubeachmichigan.com>',
          to: email,
          subject: `Welcome to the Land & Lake Ladies Club! (${memberId})`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <img src="${SITE_URL}/images/landlake-club-logo.png" alt="LLLC" style="width:64px;height:64px;object-fit:contain;margin-bottom:20px;display:block;border-radius:50%;" />
              <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">Welcome to the club, ${name}!</h1>
              <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.6;">
                You're officially a member of the <strong>Land & Lake Ladies Club</strong> - where community comes together.
                Your $15 annual membership will renew automatically each year. You can manage or cancel your membership anytime
                through the link in your Stripe receipt email.
              </p>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Member ID</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:22px;font-weight:700;letter-spacing:2px;">${memberId}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</p>
                <p style="margin:0;color:#1A2830;font-size:15px;">${name}</p>
              </div>
              <p style="color:#8C806E;font-size:13px;line-height:1.6;margin:0 0 8px;">
                Questions or want to get more involved? Reach out to Michele Henson at
                <a href="mailto:Michele.henson0003@gmail.com" style="color:#5B7D8E;">Michele.henson0003@gmail.com</a>.
              </p>
              <p style="color:#8C806E;font-size:13px;margin:0;">
                Visit our <a href="https://www.facebook.com/groups/LandAndLakeLadiesClub" style="color:#5B7D8E;">Facebook page</a> to stay connected.
              </p>
            </div>
          `,
        });
      } catch (e) { console.error('Member welcome email error:', e.message); }

      // Notification to Michele
      try {
        await resend.emails.send({
          from: 'LLLC Memberships <tickets@manitoubeachmichigan.com>',
          to: 'Michele.henson0003@gmail.com',
          subject: `New LLLC member: ${name} (${memberId})`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <h2 style="color:#1A2830;font-size:18px;margin:0 0 16px;">New LLLC membership - $15/year</h2>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Member ID</p>
                <p style="margin:0 0 14px;color:#1A2830;font-size:18px;font-weight:700;letter-spacing:1px;">${memberId}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</p>
                <p style="margin:0 0 14px;color:#1A2830;font-size:15px;font-weight:600;">${name}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</p>
                <p style="margin:0 0 14px;color:#1A2830;font-size:14px;"><a href="mailto:${email}" style="color:#5B7D8E;">${email}</a></p>
                ${phone ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phone</p><p style="margin:0 0 14px;color:#1A2830;font-size:14px;">${phone}</p>` : ''}
                ${birthdate ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Birthdate</p><p style="margin:0 0 14px;color:#1A2830;font-size:14px;">${birthdate}</p>` : ''}
                ${address ? `<p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Address</p><p style="margin:0;color:#1A2830;font-size:14px;">${address}</p>` : ''}
              </div>
              <p style="color:#8C806E;font-size:12px;">Membership renews automatically $15/year via Stripe. Joined ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.</p>
            </div>
          `,
        });
      } catch (e) { console.error('Michele notification error:', e.message); }
    }

    return res.status(200).json({ success: true, memberId, name });

  } catch (err) {
    console.error('LLLC member success error:', err);
    return res.status(500).json({ error: 'Could not verify payment.' });
  }
}
