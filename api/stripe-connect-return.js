import Stripe from 'stripe';

// Called when an org completes (or returns from) Stripe Express onboarding.
// Checks if onboarding is complete, updates Notion, sends welcome email, redirects.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const acct = req.query.acct;
  if (!acct || !acct.startsWith('acct_')) {
    return res.redirect('/ticket-services?error=invalid');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.redirect('/ticket-services?error=config');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const account = await stripe.accounts.retrieve(acct);
    const isComplete = account.charges_enabled && account.details_submitted;

    if (isComplete) {
      // Update Notion: mark onboarding complete + status Active (searches both DBs)
      // Also sends welcome email to org contact
      await updatePartnerInNotion(acct, true);
      return res.redirect('/partner-intake?onboarded=1');
    } else {
      // Onboarding not finished - let them retry
      return res.redirect(`/api/stripe-connect-refresh?acct=${acct}`);
    }
  } catch (err) {
    console.error('stripe-connect-return error:', err.message);
    return res.redirect('/ticket-services?error=return');
  }
}

async function updatePartnerInNotion(stripeAccountId, complete) {
  // Search both the Ticket Partners DB and the Partner Intake DB
  const dbs = [
    { dbId: process.env.NOTION_DB_TICKET_PARTNERS, token: process.env.NOTION_TOKEN_EVENTS },
    { dbId: process.env.NOTION_DB_PARTNER_INTAKE,  token: process.env.NOTION_TOKEN_EVENTS },
  ].filter(d => d.dbId);

  for (const { dbId, token } of dbs) {
    try {
      const searchRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: { property: 'Stripe Account ID', rich_text: { equals: stripeAccountId } },
        }),
      });

      const data = await searchRes.json();
      if (!data.results || data.results.length === 0) continue;

      const page = data.results[0];
      const pageId = page.id;

      // Extract org info for the welcome email
      const props = page.properties || {};
      const orgName     = props['Org Name']?.title?.[0]?.text?.content || '';
      const contactName = props['Contact Name']?.rich_text?.[0]?.text?.content || '';
      const email       = props['Email']?.email || '';
      // Optional: if a "Page URL" field exists in Notion, include it in the email
      // Add this field to the Notion DB when the org's community page goes live
      const pageUrl     = props['Page URL']?.url || props['Page URL']?.rich_text?.[0]?.text?.content || '';

      // Update Notion status
      await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: {
            'Onboarding Complete': { checkbox: complete },
            'Status': { select: { name: complete ? 'Active' : 'Pending' } },
          },
        }),
      });

      // Send welcome email
      if (complete && email) {
        await sendWelcomeEmail({ orgName, contactName, email, pageUrl });
      }

      return; // Found and updated - stop searching
    } catch (err) {
      console.error(`updatePartnerInNotion error (db ${dbId}):`, err.message);
    }
  }

  console.error('Partner not found in any Notion DB for:', stripeAccountId);
}

async function sendWelcomeEmail({ orgName, contactName, email, pageUrl }) {
  if (!process.env.RESEND_API_KEY) return;

  const firstName = contactName ? contactName.split(' ')[0] : 'there';
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  const sponsorSection = pageUrl
    ? `
      <p style="margin:0 0 16px;">Your sponsor page is live and ready to share:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${pageUrl}" style="background:#1a2830;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          View Your Sponsor Page →
        </a>
      </div>
      <p style="margin:0 0 16px;">Share that link with potential sponsors - they'll find a sign-up form right on the page. Just tell them to scroll down to the sponsorship section and fill it out. Easy as that.</p>
    `
    : `
      <p style="margin:0 0 16px;">Your community page on Manitou Beach Michigan will be live soon - Daryl will send you the link to share with your sponsors. In the meantime, start warming up those conversations!</p>
    `;

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;color:#3B3228;">
      <div style="background:#1a2830;padding:32px;text-align:center;border-radius:12px 12px 0 0;">
        <p style="color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">Yetickets</p>
        <h1 style="color:#fff;font-size:24px;margin:0;">You're all connected! 🎉</h1>
      </div>

      <div style="background:#fff;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e8dfd0;border-top:none;">
        <p style="margin:0 0 16px;">Hi ${firstName},</p>

        <p style="margin:0 0 16px;">
          <strong>${orgName || 'Your organization'}</strong> is officially set up on Yetickets.
          Your bank account is connected and you're ready to accept sponsorship payments -
          funds will deposit directly to your account, minus a small processing fee.
        </p>

        <h2 style="font-size:16px;margin:28px 0 12px;color:#1a2830;">What to do next</h2>

        ${sponsorSection}

        <p style="margin:0 0 16px;">
          When a sponsor submits, they'll get an instant receipt and you'll get a notification.
          No chasing checks. No waiting. Just money in the account.
        </p>

        <div style="background:#faf6ef;border-radius:8px;padding:16px 20px;margin:24px 0;border-left:3px solid #5B7E95;">
          <p style="margin:0;font-size:13px;color:#6B5D52;">
            <strong>Questions?</strong> Reach out to Daryl directly -
            <a href="mailto:daryl@yetigroove.com" style="color:#5B7E95;">daryl@yetigroove.com</a>.
            He'll get you sorted.
          </p>
        </div>

        <p style="margin:24px 0 0;font-size:13px;color:#9B8E85;">
          - Daryl &amp; The Yeti<br>
          <a href="${siteUrl}" style="color:#5B7E95;text-decoration:none;">Manitou Beach Michigan</a>
        </p>
      </div>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Yetickets <tickets@manitoubeachmichigan.com>',
        to: email,
        subject: `You're connected - ${orgName || 'your account'} is ready to accept sponsorships`,
        html,
      }),
    });
  } catch (err) {
    console.error('sendWelcomeEmail error:', err.message);
  }
}
