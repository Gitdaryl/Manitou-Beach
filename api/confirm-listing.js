import { createHmac } from 'crypto';

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

  // PATCH Notion page to Listed Free
  const notionRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({ properties: { 'Status': { status: { name: 'Listed Free' } } } }),
  });

  if (!notionRes.ok) {
    console.error('confirm-listing Notion PATCH failed:', await notionRes.text());
    return res.status(500).send('Something went wrong confirming your listing. Please reply to your welcome email and we\'ll sort it out.');
  }

  // Redirect to business directory with a confirmed flag
  const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
  return res.redirect(302, `${siteUrl}/listing-confirmed`);
}
