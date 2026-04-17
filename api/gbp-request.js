import { Resend } from 'resend';

const DB_ID = process.env.NOTION_DB_GBP_REQUESTS;
const NOTION_TOKEN = process.env.NOTION_TOKEN_BUSINESS;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { businessName, ownerName, phone, email, address, category, website, hasGBP, notes, slug } = req.body || {};

  if (!businessName || !ownerName || !phone || !email) {
    return res.status(400).json({ error: 'businessName, ownerName, phone, and email are required' });
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: DB_ID },
        properties: {
          'Business Name':  { title: [{ text: { content: businessName } }] },
          'Owner Name':     { rich_text: [{ text: { content: ownerName } }] },
          'Phone':          { phone_number: phone },
          'Email':          { email: email.toLowerCase().trim() },
          'Address':        { rich_text: [{ text: { content: address || '' } }] },
          'Category':       { rich_text: [{ text: { content: category || '' } }] },
          'Website':        { url: website || null },
          'Has GBP':        { select: { name: hasGBP || 'Not Sure' } },
          'Status':         { select: { name: 'New' } },
          'MB Profile Slug':{ rich_text: [{ text: { content: slug || '' } }] },
          'Notes':          { rich_text: [{ text: { content: notes || '' } }] },
          'Submitted At':   { date: { start: new Date().toISOString() } },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('[gbp-request] Notion error:', err);
      return res.status(500).json({ error: 'Failed to save request' });
    }

    // Notify Daryl by email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
        await resend.emails.send({
          from: 'Manitou Beach <events@manitoubeachmichigan.com>',
          to: 'admin@yetigroove.com',
          subject: `New GBP Setup Request - ${businessName}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px 20px;background:#FAF6EF;">
              <h2 style="color:#2D3B45;margin:0 0 6px;">New GBP Setup Request</h2>
              <p style="color:#9B8E85;font-size:14px;margin:0 0 24px;">Submitted ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                ${[
                  ['Business', businessName],
                  ['Owner', ownerName],
                  ['Phone', phone],
                  ['Email', email],
                  ['Address', address || '—'],
                  ['Category', category || '—'],
                  ['Website', website || '—'],
                  ['Has GBP already?', hasGBP || 'Not Sure'],
                  ['Notes', notes || '—'],
                ].map(([k, v]) => `
                  <tr>
                    <td style="padding:8px 12px;background:#F5F0E8;font-weight:700;color:#6B5D52;width:38%;border-radius:4px 0 0 4px;">${k}</td>
                    <td style="padding:8px 12px;color:#3B3228;background:#fff;border-radius:0 4px 4px 0;">${v}</td>
                  </tr>
                  <tr><td colspan="2" style="height:4px;"></td></tr>
                `).join('')}
              </table>
              ${slug ? `<p style="margin-top:20px;"><a href="${siteUrl}/business/${slug}" style="color:#5B7E95;">View their profile →</a></p>` : ''}
            </div>
          `,
        });
      } catch (err) {
        console.error('[gbp-request] email failed:', err.message);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[gbp-request] error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
