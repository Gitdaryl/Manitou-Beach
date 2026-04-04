// /api/beta-feedback.js
// POST { page, type, description, email } - saves beta feedback to Notion + emails Daryl
import { Resend } from 'resend';

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const TYPE_OPTIONS = ['Bug', 'Suggestion', 'Question'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page, type, description, email } = req.body || {};

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const typeClean = TYPE_OPTIONS.includes(type) ? type : 'Feedback';
  const pageClean = (page || '/').slice(0, 200);
  const emailClean = (email || '').trim().toLowerCase();

  try {
    // ── Save to Notion ─────────────────────────────────────────────────────
    if (process.env.NOTION_DB_FEEDBACK) {
      const notionRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DB_FEEDBACK },
          properties: {
            'Page':         { title: [{ text: { content: pageClean } }] },
            'Type':         { select: { name: typeClean } },
            'Description':  { rich_text: [{ text: { content: description.trim().slice(0, 2000) } }] },
            ...(emailClean && emailClean.includes('@') && {
              'Email': { email: emailClean },
            }),
            'Submitted At': { date: { start: new Date().toISOString() } },
          },
        }),
      });
      if (!notionRes.ok) {
        console.error('beta-feedback Notion error:', await notionRes.text());
      }
    }

    // ── Email Daryl (fire-and-forget) ──────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail = process.env.ADMIN_EMAIL || 'daryl@manitoubeachmichigan.com';
      resend.emails.send({
        from: 'Manitou Beach Beta <events@manitoubeachmichigan.com>',
        to: adminEmail,
        subject: `[Beta ${typeClean}] ${pageClean}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; color: #3B3228;">
            <p><strong>Type:</strong> ${typeClean}</p>
            <p><strong>Page:</strong> ${pageClean}</p>
            ${emailClean ? `<p><strong>From:</strong> ${emailClean}</p>` : ''}
            <p><strong>Description:</strong></p>
            <blockquote style="border-left: 3px solid #D4845A; margin: 8px 0; padding: 8px 16px; background: #FAF6EF; color: #3B3228;">
              ${description.trim().replace(/\n/g, '<br>')}
            </blockquote>
          </div>
        `,
      }).catch(() => {});
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('beta-feedback error:', err.message);
    return res.status(500).json({ error: 'Server error - please try again' });
  }
}
