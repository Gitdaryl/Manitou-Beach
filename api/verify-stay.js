// /api/verify-stay.js
// POST { phone, code, tier, resend }
// 1. Finds "New" stay matching phone + code in Notion (status type property)
// 2. During beta (before May 10 2026): auto-activates as "Listed Enhanced" ($9/mo tier free)
// 3. After beta, free tier: activates immediately
// 4. After beta, paid tier: sets verified, returns needsPayment for Stripe
//
// Also handles resend: POST { phone, resend: true } — re-sends the code

import { sendSMS, normalizePhone } from './lib/twilio.js';

async function queryNewStays(notionToken, dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Status', status: { equals: 'New' } },
      page_size: 100,
    }),
  });
  if (!res.ok) throw new Error('Notion query failed: ' + await res.text());
  return (await res.json()).results || [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, code, tier, resend } = req.body || {};
  const inputDigits = normalizePhone(phone);

  if (inputDigits.length < 10) {
    return res.status(400).json({ error: 'Valid phone number required.' });
  }

  const notionToken = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_STAYS;

  try {
    // Find pending stays matching this phone
    const pendingStays = await queryNewStays(notionToken, dbId);
    const phoneMatches = pendingStays.filter(page => {
      const stored = page.properties['Phone']?.phone_number || '';
      return normalizePhone(stored) === inputDigits;
    });

    if (phoneMatches.length === 0) {
      return res.status(404).json({ error: 'No pending signup found for this phone number.' });
    }

    // For resend, use the most recent record
    // For verify, find the record whose code matches
    const match = resend
      ? phoneMatches[phoneMatches.length - 1]
      : phoneMatches.find(page => {
          const c = page.properties['Verification Code']?.rich_text?.[0]?.text?.content || '';
          return c === (code?.trim() || '');
        }) || phoneMatches[phoneMatches.length - 1];

    const storedCode = match.properties['Verification Code']?.rich_text?.[0]?.text?.content || '';
    const stayName = match.properties['Name']?.title?.[0]?.text?.content || '';

    // ── RESEND flow ──
    if (resend) {
      if (!storedCode) {
        return res.status(400).json({ error: 'No verification code found. Please sign up again.' });
      }
      await sendSMS(inputDigits, `Manitou Beach Stays\n\nYour verification code is: ${storedCode}\n\nEnter this on the signup page to activate your listing.`);
      return res.status(200).json({ ok: true, resent: true });
    }

    // ── VERIFY flow ──
    if (!code || code.trim().length !== 6) {
      return res.status(400).json({ error: 'Please enter your 6-digit verification code.' });
    }

    if (code.trim() !== storedCode) {
      return res.status(400).json({ error: 'Incorrect code. Please check your text messages and try again.' });
    }

    // Code matches — determine activation path
    const isPaid = tier === 'listed' || tier === 'featured';
    const BETA_END = new Date('2026-05-10T00:00:00');
    const isBeta = new Date() < BETA_END;

    // During beta: everyone gets Listed Enhanced for free (full experience)
    // After beta: free tier → activate immediately, paid tier → needs Stripe
    const activateNow = isBeta || !isPaid;

    const updateProps = {
      'Verification Code': { rich_text: [{ text: { content: '' } }] }, // clear code
    };

    if (isBeta) {
      // Beta: everyone gets full Listed Enhanced experience free through May 10
      updateProps['Status'] = { status: { name: 'Listed Enhanced' } };
      updateProps['Featured Expires'] = { date: { start: '2026-05-10' } };
    } else if (!isPaid) {
      // Post-beta free tier — basic directory listing
      updateProps['Status'] = { status: { name: 'Listed Enhanced' } };
    } else {
      // Post-beta paid tier — verified but needs Stripe payment to go live
      updateProps['Status'] = { status: { name: 'New' } };
      // Stays in "New" until Stripe webhook confirms payment, then manually promoted
    }

    const patchRes = await fetch(`https://api.notion.com/v1/pages/${match.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties: updateProps }),
    });

    if (!patchRes.ok) {
      console.error('verify-stay PATCH failed:', await patchRes.text());
      return res.status(500).json({ error: 'Activation failed. Please try again.' });
    }

    if (activateNow) {
      // Send confirmation SMS
      const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
      await sendSMS(inputDigits,
        `Manitou Beach Stays\n\n${stayName} is listed! 🏡\n\nYour property is now live at ${siteUrl}/stays — visitors can find you and click through to book on your site.\n\nBefore May 10 we'll reach out about keeping your listing live. Month to month, no contract, cancel anytime. Founding properties get first pick on Featured slots.\n\nWelcome aboard!`
      );

      return res.status(200).json({
        ok: true,
        activated: true,
        beta: isBeta,
        stayName,
      });
    }

    // Post-beta paid tier — verified but needs Stripe payment
    return res.status(200).json({
      ok: true,
      verified: true,
      needsPayment: true,
      stayName,
    });
  } catch (err) {
    console.error('verify-stay error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
