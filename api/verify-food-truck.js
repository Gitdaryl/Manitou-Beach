// /api/verify-food-truck.js
// POST { phone, code, tier }
// 1. Finds "Pending Verification" truck matching phone + code in Notion
// 2. Auto-generates slug from truck name + checkin token
// 3. Free tier: sets Active immediately, SMS's check-in link
// 4. Paid tier: sets "Verified" (activated after Stripe payment), returns redirectToStripe
//
// Also handles resend: POST { phone, resend: true } — re-sends the code

import crypto from 'crypto';
import { sendSMS, normalizePhone } from './lib/twilio.js';

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function queryPendingTrucks(notionToken, dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Status', select: { equals: 'Pending Verification' } },
      page_size: 100,
    }),
  });
  if (!res.ok) throw new Error('Notion query failed: ' + await res.text());
  return (await res.json()).results || [];
}

async function queryAllSlugs(notionToken, dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Status', select: { equals: 'Active' } },
      page_size: 100,
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || [])
    .map(p => p.properties['Slug']?.rich_text?.[0]?.text?.content || '')
    .filter(Boolean);
}

function dedupeSlug(base, existingSlugs) {
  if (!existingSlugs.includes(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!existingSlugs.includes(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phone, code, tier, resend } = req.body || {};
  const inputDigits = normalizePhone(phone);

  if (inputDigits.length < 10) {
    return res.status(400).json({ error: 'Valid phone number required.' });
  }

  const notionToken = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_FOOD_TRUCKS;

  try {
    // Find pending truck matching this phone
    const pendingTrucks = await queryPendingTrucks(notionToken, dbId);
    // Find all pending records for this phone, then match by code (handles duplicate submissions)
    const phoneMatches = pendingTrucks.filter(page => {
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
    const truckName = match.properties['Name']?.title?.[0]?.text?.content || '';

    // ── RESEND flow ──
    if (resend) {
      if (!storedCode) {
        return res.status(400).json({ error: 'No verification code found. Please sign up again.' });
      }
      await sendSMS(inputDigits, `Manitou Beach Food Trucks\n\nYour verification code is: ${storedCode}\n\nEnter this on the signup page to activate your listing.`);
      return res.status(200).json({ ok: true, resent: true });
    }

    // ── VERIFY flow ──
    if (!code || code.trim().length !== 6) {
      return res.status(400).json({ error: 'Please enter your 6-digit verification code.' });
    }

    if (code.trim() !== storedCode) {
      return res.status(400).json({ error: 'Incorrect code. Please check your text messages and try again.' });
    }

    // Code matches — generate slug + token
    const existingSlugs = await queryAllSlugs(notionToken, dbId);
    const baseSlug = slugify(truckName);
    const slug = dedupeSlug(baseSlug, existingSlugs);
    const checkinToken = generateToken();

    const isPaid = tier === 'paid';

    // Beta grace period: before May 10 2026, everyone gets Featured/Active for free
    const BETA_END = new Date('2026-05-10T00:00:00');
    const isBeta = new Date() < BETA_END;

    // During beta: activate everyone as Featured immediately (no Stripe needed)
    // After beta: free tier → Active/Basic, paid tier → Verified (needs Stripe)
    const activateNow = isBeta || !isPaid;

    const updateProps = {
      'Slug':              { rich_text: [{ text: { content: slug } }] },
      'Checkin Token':     { rich_text: [{ text: { content: checkinToken } }] },
      'Verification Code': { rich_text: [{ text: { content: '' } }] }, // clear code
      'Status':            { select: { name: activateNow ? 'Active' : 'Verified' } },
    };

    // Beta users get Featured tier regardless of selection
    if (isBeta) {
      updateProps['Tier'] = { select: { name: 'Featured' } };
      updateProps['Beta Expires'] = { date: { start: '2026-05-10' } };
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
      console.error('verify-food-truck PATCH failed:', await patchRes.text());
      return res.status(500).json({ error: 'Activation failed. Please try again.' });
    }

    const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
    const checkinUrl = `${siteUrl}/food-trucks?truck=${encodeURIComponent(slug)}&token=${encodeURIComponent(checkinToken)}`;

    if (activateNow) {
      // Active immediately — send check-in link
      const betaNote = isBeta && isPaid
        ? `\n\nYou're a founding food truck — everything is free through May 10. After that, it's $9/month to stay live on the map.`
        : '';
      await sendSMS(inputDigits,
        `Manitou Beach Food Trucks\n\n${truckName} is live! 🎉\n\nHere's your personal check-in link:\n${checkinUrl}\n\nOpen it each time you head to Manitou Beach. Drop your pin, add today's special, and go live on the map.${betaNote}\n\nSave this to your home screen for quick access.`
      );

      return res.status(200).json({
        ok: true,
        activated: true,
        beta: isBeta,
        slug,
        checkinUrl,
        truckName,
      });
    }

    // Post-beta paid tier — verified but needs Stripe payment to activate
    return res.status(200).json({
      ok: true,
      verified: true,
      slug,
      truckName,
      needsPayment: true,
    });
  } catch (err) {
    console.error('verify-food-truck error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
