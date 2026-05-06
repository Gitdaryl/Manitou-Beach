// POST /api/send-truck-update
// Admin-only: sends the "listing upgrade" update email to all Active food trucks
// Parses email addresses from the Description field (stored as "Contact Email: x@x.com")
// Returns { sent: [{ name, email }], skipped: [{ name, reason }] }

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Manitou Beach Food Trucks <trucks@manitoubeachmichigan.com>';
const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

function parseEmail(description) {
  const line = (description || '').split('\n').find(l => l.startsWith('Contact Email:'));
  if (!line) return '';
  return line.replace('Contact Email:', '').trim();
}

function emailHtml(truckName, slug) {
  const profileUrl = `${SITE_URL}/food-trucks/${slug}`;
  const locatorUrl = `${SITE_URL}/food-trucks`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#2D3B45;border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.4);">Manitou Beach Michigan</p>
      <h1 style="margin:0;font-size:26px;font-weight:400;color:#FAF6EF;line-height:1.3;">Your listing just got<br><em style="color:#D4845A;">a few upgrades.</em></h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:36px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <p style="margin:0 0 20px;font-size:15px;color:#3B3228;line-height:1.75;">
        Hey ${truckName} team - we've been busy upgrading the Manitou Beach Food Truck Locator, and a few of the changes are going to put your truck in front of more hungry people this summer.
      </p>

      <!-- Your profile page -->
      <div style="background:#f5f0e8;border-radius:12px;padding:22px 24px;margin-bottom:18px;border-left:4px solid #7A8E72;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7A8E72;">What's New</p>
        <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#2D3B45;">You have your own profile page now.</p>
        <p style="margin:0 0 14px;font-size:14px;color:#6B5D52;line-height:1.7;">
          Every truck on our map now has a dedicated page that Google can find. Your photo, cuisine, location, schedule, and contact info - all in one spot.
        </p>
        <a href="${profileUrl}" style="display:inline-block;padding:10px 20px;background:#7A8E72;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.5px;">See Your Page →</a>
      </div>

      <!-- Auto-post -->
      <div style="background:#f5f0e8;border-radius:12px;padding:22px 24px;margin-bottom:18px;border-left:4px solid #D4845A;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#D4845A;">Free Marketing</p>
        <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#2D3B45;">Every check-in gets a social post.</p>
        <p style="margin:0;font-size:14px;color:#6B5D52;line-height:1.7;">
          When you drop your pin on the map, we automatically post to the Manitou Beach Facebook page. <em style="color:#2D3B45;">"${truckName} just pulled up at the marina - they are open right now."</em> Free exposure, every single time you're out.
        </p>
      </div>

      <!-- Instagram -->
      <div style="background:#f5f0e8;border-radius:12px;padding:22px 24px;margin-bottom:18px;border-left:4px solid #5B7E95;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#5B7E95;">30 Seconds</p>
        <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#2D3B45;">Add your Instagram and we'll tag you.</p>
        <p style="margin:0;font-size:14px;color:#6B5D52;line-height:1.7;">
          Open your check-in link, add your Instagram handle in your profile, and we'll tag you every time we post about you. Your followers see it. New people find you. Takes 30 seconds.
        </p>
      </div>

      <!-- Photos -->
      <div style="background:#f5f0e8;border-radius:12px;padding:22px 24px;margin-bottom:28px;border-left:4px solid #B8956A;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#B8956A;">More Clicks</p>
        <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#2D3B45;">Add food photos - they rotate in our posts.</p>
        <p style="margin:0;font-size:14px;color:#6B5D52;line-height:1.7;">
          Open your check-in link, scroll down to "Your Photos," and upload a few shots of what you serve. They show on your profile page and rotate into our social posts automatically.
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;padding:24px;background:#2D3B45;border-radius:12px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.5);">Open your check-in link to add your Instagram and photos.</p>
        <p style="margin:0 0 16px;font-size:13px;color:rgba(255,255,255,0.4);">Lost your link? Go here and tap "Text Me My Link" at the bottom.</p>
        <a href="${locatorUrl}" style="display:inline-block;padding:13px 28px;background:#D4845A;color:#fff;text-decoration:none;border-radius:24px;font-size:14px;font-weight:700;letter-spacing:0.5px;">Go to the Locator →</a>
      </div>

      <p style="margin:0;font-size:13px;color:#9B8E85;line-height:1.7;text-align:center;">
        Questions? Just reply to this email.<br>
        See you on the lake - The Yeti at Manitou Beach
      </p>
    </div>

    <p style="text-align:center;font-size:11px;color:#9B8E85;margin:20px 0 0;line-height:1.6;">
      You're receiving this because ${truckName} is listed on the Manitou Beach Food Truck Locator.<br>
      <a href="${SITE_URL}/food-trucks" style="color:#9B8E85;">manitoubeachmichigan.com/food-trucks</a>
    </p>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const notionToken = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_FOOD_TRUCKS;

  if (!notionToken || !dbId) {
    return res.status(500).json({ error: 'Notion credentials not configured' });
  }

  try {
    // Fetch all Active trucks (including Description which has the email)
    let allResults = [];
    let cursor;
    do {
      const body = {
        filter: { property: 'Status', select: { equals: 'Active' } },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('Notion query failed: ' + await r.text());
      const data = await r.json();
      allResults = allResults.concat(data.results);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    const sent = [];
    const skipped = [];

    for (const page of allResults) {
      const p = page.properties;
      const name = p['Name']?.title?.[0]?.text?.content || '';
      const slug = p['Slug']?.rich_text?.[0]?.text?.content || '';
      const description = p['Description']?.rich_text?.[0]?.text?.content || '';
      const email = parseEmail(description);

      if (!name) { skipped.push({ name: '(unnamed)', reason: 'no name' }); continue; }
      if (!email) { skipped.push({ name, reason: 'no email on file' }); continue; }
      if (!slug) { skipped.push({ name, reason: 'no slug' }); continue; }

      try {
        await resend.emails.send({
          from: FROM,
          to: email,
          subject: `${name} - your Manitou Beach listing just got upgraded`,
          html: emailHtml(name, slug),
        });
        sent.push({ name, email });
      } catch (err) {
        skipped.push({ name, reason: `send failed: ${err.message}` });
      }
    }

    return res.status(200).json({
      ok: true,
      total: allResults.length,
      sentCount: sent.length,
      skippedCount: skipped.length,
      sent,
      skipped,
    });
  } catch (err) {
    console.error('send-truck-update error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
