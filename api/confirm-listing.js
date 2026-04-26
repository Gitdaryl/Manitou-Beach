import { createHmac } from 'crypto';
import { Resend } from 'resend';

function makeConfirmToken(pageId) {
  const secret = process.env.NOTION_TOKEN_BUSINESS || 'fallback';
  return createHmac('sha256', secret).update(pageId).digest('hex').slice(0, 40);
}

export default async function handler(req, res) {
  const { id: pageId, token } = req.query;

  if (!pageId || !token) {
    return res.status(400).send('Missing confirmation parameters.');
  }

  const expected = makeConfirmToken(pageId);
  if (token !== expected) {
    return res.status(400).send('Invalid or expired confirmation link.');
  }

  const PAID_STATUSES = new Set(['Listed Enhanced', 'Listed Featured', 'Listed Premium']);

  // Fetch page first to check current status and get name/email
  const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
  const notionHeaders = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: notionHeaders,
  });
  if (!pageRes.ok) {
    console.error('confirm-listing Notion GET failed:', await pageRes.text());
    return res.status(500).send('Something went wrong confirming your listing. Please reply to your welcome email and we\'ll sort it out.');
  }
  const page = await pageRes.json();
  const currentStatus = page.properties?.['Status']?.status?.name || '';

  // Only activate to Listed Free if not already on a paid tier
  if (!PAID_STATUSES.has(currentStatus)) {
    const patchRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: notionHeaders,
      body: JSON.stringify({ properties: { 'Status': { status: { name: 'Listed Free' } } } }),
    });
    if (!patchRes.ok) {
      console.error('confirm-listing Notion PATCH failed:', await patchRes.text());
      return res.status(500).send('Something went wrong confirming your listing. Please reply to your welcome email and we\'ll sort it out.');
    }
  }

  try {
    if (process.env.RESEND_API_KEY) {
      const businessName = page.properties?.['Name']?.title?.[0]?.plain_text || '';
      const email = page.properties?.['Email']?.email || '';
      if (email && businessName) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        resend.emails.send({
          from: 'Manitou Beach <events@manitoubeachmichigan.com>',
          to: email,
          subject: `${businessName} is live on Manitou Beach`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228; background: #FAF6EF; padding: 40px 32px; border-radius: 8px;">
              <p style="font-size: 26px; font-weight: bold; margin: 0 0 8px; color: #1A2830;">You're live.</p>
              <p style="font-size: 15px; color: #6B5F52; margin: 0 0 24px; line-height: 1.7;">
                <strong>${businessName}</strong> is showing in the Manitou Beach Local Guide right now.
                Every visitor heading to Devils Lake this summer will find you here - no charge, no contracts.
              </p>
              <p style="margin: 0 0 28px;">
                <a href="${siteUrl}/discover" style="background: #1A2830; color: #FAF6EF; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                  See Your Listing →
                </a>
              </p>
              <p style="font-size: 13px; color: #8A7E6E; margin: 0 0 6px; line-height: 1.7;">
                Want to stand out more? A highlighted or featured listing puts you at the top of the results and adds your logo, photos, and a longer description.
                <a href="${siteUrl}/upgrade-listing" style="color: #4A7A5A;">See upgrade options →</a>
              </p>
              <p style="font-size: 13px; color: #8A7E6E; margin: 12px 0 0; line-height: 1.7;">
                Need to update your info, fix a typo, or add a logo? Visit
                <a href="${siteUrl}/update-listing" style="color: #4A7A5A;">manitoubeachmichigan.com/update-listing</a>
                anytime.
              </p>
              <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 28px 0 16px;">
              <p style="font-size: 11px; color: #9A8E7E; margin: 0;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
            </div>
          `,
        }).catch((err) => console.error('confirm-listing welcome email failed:', err));
      }
    }
  } catch (err) {
    console.error('confirm-listing email fetch failed:', err);
    // Non-fatal - still redirect
  }

  return res.redirect(302, `${siteUrl}/listing-confirmed`);
}
