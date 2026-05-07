import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // GET - return live subscriber count for milestone display
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions?limit=1`,
        { headers: { 'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}` } }
      );
      if (!response.ok) return res.status(200).json({ count: 0 });
      const data = await response.json();
      return res.status(200).json({ count: data.total_results || 0 });
    } catch {
      return res.status(200).json({ count: 0 });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: false,
          utm_source: 'website',
          utm_medium: 'organic',
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('beehiiv subscribe error:', err);
      return res.status(500).json({ error: 'Subscription failed' });
    }

    const data = await response.json();
    const status = data.data?.status || 'pending';
    const alreadySubscribed = status === 'active';

    // Send our own welcome email for new subscribers only
    if (!alreadySubscribed && process.env.RESEND_API_KEY) {
      const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
      resend.emails.send({
        from: 'The Manitou Dispatch <events@manitoubeachmichigan.com>',
        to: email,
        subject: "You're in. See you at the lake.",
        html: `
          <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#3B3228;background:#FAF6EF;padding:40px 32px;border-radius:8px;">

            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#A8926E;letter-spacing:2px;text-transform:uppercase;">The Manitou Dispatch</p>
            <p style="font-size:24px;font-weight:bold;margin:0 0 20px;color:#1A2830;">Welcome to Manitou Beach.</p>

            <p style="font-size:16px;line-height:1.75;margin:0 0 16px;color:#3B3228;">Every Thursday morning, The Manitou Dispatch lands in your inbox with everything happening at the lake that weekend - events, food trucks, local tips, and a little Yeti wisdom.</p>

            <p style="font-size:16px;line-height:1.75;margin:0 0 28px;color:#3B3228;">That's it. No noise, no spam. Just your weekend sorted, straight from Manitou Beach.</p>

            <p style="margin:0 0 28px;">
              <a href="${siteUrl}/events" style="background:#1A2830;color:#FAF6EF;text-decoration:none;padding:14px 28px;border-radius:4px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;letter-spacing:1px;display:inline-block;">See What's Happening This Weekend</a>
            </p>

            <p style="font-size:14px;line-height:1.75;margin:0 0 6px;color:#6B5F52;">While you're here, check out:</p>
            <ul style="padding-left:20px;margin:0 0 28px;">
              <li style="margin-bottom:8px;font-size:14px;line-height:1.65;"><a href="${siteUrl}/discover" style="color:#D4845A;text-decoration:none;font-weight:bold;">Local Businesses</a> - restaurants, shops, and services at the lake</li>
              <li style="margin-bottom:8px;font-size:14px;line-height:1.65;"><a href="${siteUrl}/wines" style="color:#D4845A;text-decoration:none;font-weight:bold;">Wine Trail</a> - the Irish Hills wineries, ranked by the community</li>
              <li style="margin-bottom:0;font-size:14px;line-height:1.65;"><a href="${siteUrl}/stays" style="color:#D4845A;text-decoration:none;font-weight:bold;">Places to Stay</a> - cabins, rentals, and spots right on the water</li>
            </ul>

            <hr style="border:none;border-top:1px solid #E8DFD0;margin:0 0 20px;"/>
            <p style="font-size:13px;color:#8A7E6E;margin:0 0 4px;">See you at the lake,</p>
            <p style="font-size:14px;font-weight:bold;color:#1A2830;margin:0 0 20px;">The Yeti</p>
            <p style="font-size:11px;color:#9A8E7E;margin:0;">Manitou Beach, Devils Lake Michigan &bull; <a href="${siteUrl}" style="color:#9A8E7E;">manitoubeachmichigan.com</a></p>

          </div>
        `,
      }).catch(err => console.error('subscribe welcome email error:', err.message));
    }

    return res.status(200).json({
      success: true,
      status,
      alreadySubscribed,
    });
  } catch (err) {
    console.error('subscribe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
