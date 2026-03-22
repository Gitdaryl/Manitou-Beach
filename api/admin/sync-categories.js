import { Resend } from 'resend';

// Notion category values already mapped in DISCOVER_CATS — no alert needed for these
const KNOWN_NOTION_KEYS = new Set([
  'Food & Drink',
  'Stays & Rentals',
  'Breweries & Wineries',
  'Boating & Water',
  'Events & Venues',
  'Shopping & Gifts',
  'Home Services',
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            or: [
              { property: 'Status', status: { equals: 'Listed Free' } },
              { property: 'Status', status: { equals: 'Listed Enhanced' } },
              { property: 'Status', status: { equals: 'Listed Featured' } },
              { property: 'Status', status: { equals: 'Listed Premium' } },
            ],
          },
        }),
      }
    );

    if (!notionRes.ok) throw new Error('Notion query failed');
    const data = await notionRes.json();

    const seen = new Set();
    const unknown = [];
    let hasOther = false;

    data.results.forEach(page => {
      const cat = page.properties['Category']?.select?.name || 'Other';
      if (cat === 'Other') { hasOther = true; return; }
      if (KNOWN_NOTION_KEYS.has(cat)) return;
      if (!seen.has(cat)) {
        seen.add(cat);
        unknown.push(cat);
      }
    });

    if (!hasOther && unknown.length === 0) {
      return res.status(200).json({ ok: true, message: 'All categories are mapped. Nothing to report.', emailSent: false });
    }

    // Build email body
    const lines = [];
    if (hasOther) {
      lines.push('• <strong>"Other"</strong> is still in use — at least one listed business has no category. Open Notion, find it, and assign a proper category or create a new one.');
    }
    unknown.forEach(u => {
      const slug = u.toLowerCase().replace(/\s+/g, '-');
      lines.push(
        `• <strong>"${u}"</strong> — new category detected on the Local Guide. ` +
        `A pill is showing with a placeholder icon. ` +
        `To wire up a real icon: create <code>/images/icons/${slug}-icon-dark.png</code> and add an entry to ` +
        `<code>discover.js → DISCOVER_DYNAMIC_CAT_ICONS</code>.`
      );
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Manitou Beach <hello@manitou-beach.com>',
      to: process.env.ADMIN_EMAIL || 'daryl@yetigroove.com',
      subject: `⚠️ Local Guide category sync — ${lines.length} item${lines.length !== 1 ? 's' : ''} need attention`,
      html: `
        <div style="font-family:sans-serif;max-width:540px;line-height:1.6">
          <h2 style="color:#2D3B45">Local Guide — Category Sync Report</h2>
          <p>The following items were detected during your category sync:</p>
          <ul style="padding-left:20px">${lines.map(l => `<li style="margin-bottom:12px">${l}</li>`).join('')}</ul>
          <p style="color:#888;font-size:13px;border-top:1px solid #eee;padding-top:12px">Triggered manually from YetiAdmin → Categories tab.</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true, unknown, hasOther, emailSent: true });
  } catch (err) {
    console.error('Sync categories error:', err.message);
    return res.status(500).json({ error: 'Failed to sync categories' });
  }
}
