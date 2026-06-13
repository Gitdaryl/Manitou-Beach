// POST /api/prize-wheel/launch-wheel
// Admin-only. Resets all active vendor Trial Start to today and Trial End to today+60.
// Notifies all vendors by email + SMS that the wheel is live.
// Call this once when the 6th vendor activates to start all trials from the same date.

import { Resend } from 'resend';
import { sendSMSFull, normalizePhone } from '../lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const headers = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_PRIZE_WHEEL_SPONSORS}/query`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: { property: 'Active', checkbox: { equals: true } },
        }),
      }
    );

    if (!queryRes.ok) throw new Error('Failed to query sponsors');
    const data = await queryRes.json();
    const vendors = data.results || [];

    if (vendors.length < 6) {
      return res.status(400).json({
        error: `Only ${vendors.length} active vendor${vendors.length === 1 ? '' : 's'}. Need at least 6 to launch.`,
        count: vendors.length,
      });
    }

    const trialStart = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    // Update all active vendors in parallel
    await Promise.all(
      vendors.map(vendor =>
        fetch(`https://api.notion.com/v1/pages/${vendor.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            properties: {
              'Trial Start': { date: { start: trialStart } },
              'Trial End':   { date: { start: trialEnd } },
              'Plan Type':   { select: { name: 'trial' } },
            },
          }),
        })
      )
    );

    const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
    const resend = new Resend(process.env.RESEND_API_KEY);
    const trialEndDisplay = new Date(trialEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Notify each vendor - email + SMS
    const names = [];
    for (const vendor of vendors) {
      const p = vendor.properties;
      const name = p['Business Name']?.title?.[0]?.text?.content || 'Unknown';
      const contactName = p['Contact Name']?.rich_text?.[0]?.text?.content || '';
      const email = p['Contact Email']?.email || '';
      const phone = p['Contact Phone']?.phone_number || '';
      const pin = p['Vendor PIN']?.rich_text?.[0]?.text?.content || '';
      const statsUrl = `${siteUrl}/sponsor/${vendor.id}?pin=${pin}`;
      names.push(name);

      if (email) {
        resend.emails.send({
          from: 'Daryl at Manitou Beach <hello@manitoubeachmichigan.com>',
          to: email,
          subject: `The wheel is live - your spot is active!`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#FAF6EF;padding:32px 24px;border-radius:16px;">
              <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">You're live, ${contactName || name}!</h1>
              <p style="color:#5C5248;font-size:15px;margin:0 0 20px;line-height:1.6;">
                The Manitou Beach Spin to Win wheel is now active on the site. Visitors are spinning right now.
                Your 60-day free trial starts today and runs until <strong>${trialEndDisplay}</strong>.
              </p>
              <div style="background:#fff;border-radius:14px;padding:20px 24px;margin-bottom:16px;border:1.5px solid #E8DFD0;">
                <p style="color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 8px;">Your staff redeem link</p>
                <p style="color:#1A2830;font-size:15px;font-weight:600;margin:0 0 6px;">${siteUrl}/redeem</p>
                <p style="color:#8C806E;font-size:12px;margin:0;">Staff go here, scan the customer's QR code, and enter your PIN <strong style="font-family:monospace;font-size:14px;color:#D4845A;">${pin}</strong></p>
              </div>
              <div style="background:#fff;border-radius:14px;padding:20px 24px;margin-bottom:20px;border:1.5px solid #E8DFD0;">
                <p style="color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;margin:0 0 8px;">Your dashboard</p>
                <a href="${statsUrl}" style="display:inline-block;padding:10px 20px;background:#D4845A;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">View spins + redemptions</a>
              </div>
              <p style="color:#9A8E7E;font-size:12px;line-height:1.5;margin:0;">Questions? Reply to this email.</p>
            </div>
          `,
        }).catch(err => console.error(`Launch notify email error (${name}):`, err.message));
      }

      const digits = normalizePhone(phone || '');
      if (digits.length === 10) {
        sendSMSFull(`+1${digits}`,
          `Manitou Beach: The Spin to Win wheel is live! Your ${name} offer is now on the wheel. Staff redeem at ${siteUrl}/redeem using PIN ${pin}. Dashboard: ${statsUrl}`
        ).catch(err => console.error(`Launch notify SMS error (${name}):`, err.message));
      }
    }

    return res.status(200).json({
      ok: true,
      count: vendors.length,
      trialStart,
      trialEnd,
      vendors: names,
    });
  } catch (err) {
    console.error('Launch wheel error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
