import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, eventId, subject, message, channel } = req.body;
  if (!token || !eventId || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields: token, eventId, subject, message' });
  }

  // SMS is stubbed until A2P approval
  if (channel === 'sms') {
    return res.status(200).json({ status: 'pending_a2p', message: 'SMS blast available after A2P registration is approved.' });
  }

  try {
    // Validate token
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!pageRes.ok) return res.status(404).json({ error: 'Event not found' });

    const page = await pageRes.json();
    const p = page.properties;
    const storedToken = p['Vendor Portal Token']?.rich_text?.[0]?.plain_text;
    if (!storedToken || storedToken !== token) {
      return res.status(403).json({ error: 'Invalid access token' });
    }

    const eventName = p['Name']?.title?.[0]?.plain_text || p['Event Name']?.title?.[0]?.plain_text || 'Event';
    const organizerName = p['Organizer Name']?.rich_text?.[0]?.plain_text || eventName;

    // Fetch confirmed vendors
    if (!process.env.NOTION_DB_VENDOR_REGISTRATIONS) {
      return res.status(500).json({ error: 'Vendor registrations database not configured' });
    }

    const vendorRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_VENDOR_REGISTRATIONS}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Event ID', rich_text: { equals: eventId } },
            { property: 'Status', select: { equals: 'Confirmed' } },
          ],
        },
      }),
    });

    if (!vendorRes.ok) return res.status(500).json({ error: 'Failed to fetch vendor list' });
    const vendorData = await vendorRes.json();

    const recipients = vendorData.results
      .map(v => v.properties['Email']?.email)
      .filter(Boolean);

    if (recipients.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No confirmed vendors to email.' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Resend batch API — send individually to each recipient to avoid exposing addresses
    let sent = 0;
    const errors = [];
    const messageHtml = message.replace(/\n/g, '<br/>');

    for (const emailAddr of recipients) {
      try {
        await resend.emails.send({
          from: `${organizerName} <tickets@yetigroove.com>`,
          to: emailAddr,
          subject,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8C806E;margin-bottom:8px;">${organizerName} — Vendor Update</div>
              <h2 style="color:#1A2830;font-size:20px;margin:0 0 20px;">${subject}</h2>
              <div style="font-size:15px;color:#3A3028;line-height:1.7;white-space:pre-line;">${messageHtml}</div>
              <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E8E0D5;">
                <p style="font-size:12px;color:#8C806E;margin:0;">This message was sent to registered vendors for <strong>${eventName}</strong>.</p>
              </div>
            </div>
          `,
        });
        sent++;
      } catch (e) {
        errors.push({ email: emailAddr, error: e.message });
      }
    }

    console.log(`Vendor blast: ${sent}/${recipients.length} sent for event ${eventId}`);
    return res.status(200).json({ sent, total: recipients.length, errors });

  } catch (err) {
    console.error('vendor-blast error:', err);
    return res.status(500).json({ error: 'Blast failed. Please try again.' });
  }
}
