// /api/submit-food-truck.js
// Captures a food truck signup into Notion (Food Trucks DB)
// Normal flow: sends 6-digit SMS verification code, activates on confirm
// skipVerification=true: activates immediately (used when phone already verified via business listing)

import crypto from 'crypto';
import { sendSMS, sendSMSFull, normalizePhone } from './lib/twilio.js';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function slugify(name) {
  return (name || '').toLowerCase().replace(/['']/g, '').replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

async function queryActiveSlugs(notionToken, dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
    body: JSON.stringify({ filter: { property: 'Status', select: { equals: 'Active' } }, page_size: 100 }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map(p => p.properties['Slug']?.rich_text?.[0]?.text?.content || '').filter(Boolean);
}

function dedupeSlug(base, existing) {
  if (!existing.includes(base)) return base;
  for (let i = 2; i < 100; i++) {
    const c = `${base}-${i}`;
    if (!existing.includes(c)) return c;
  }
  return `${base}-${Date.now()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { truckName, cuisine, email, phone, website, imageUrl, tier, skipVerification, _hp } = req.body || {};

  // Honeypot — bots fill hidden fields, humans don't
  if (_hp) return res.status(200).json({ ok: true, needsVerification: true });

  if (!truckName?.trim() || !email?.trim() || !email.includes('@')) {
    return res.status(400).json({ error: 'Truck name and valid email are required.' });
  }

  const digits = normalizePhone(phone);
  if (digits.length < 10) {
    return res.status(400).json({ error: 'A valid phone number is required.' });
  }

  const notionToken = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_FOOD_TRUCKS;

  // Build Description with contact info + image URL fallback
  const descParts = [`Contact Email: ${email.trim()}`];
  if (imageUrl?.trim()) descParts.push(`Image URL: ${imageUrl.trim()}`);
  const descText = descParts.join('\n');

  const BETA_END = new Date('2026-05-10T00:00:00');
  const isBeta = new Date() < BETA_END;

  try {
    if (skipVerification) {
      // Phone already verified — activate immediately
      const existingSlugs = await queryActiveSlugs(notionToken, dbId);
      const slug = dedupeSlug(slugify(truckName), existingSlugs);
      const checkinToken = crypto.randomBytes(16).toString('hex');

      const properties = {
        'Name':          { title: [{ text: { content: truckName.trim() } }] },
        'Status':        { select: { name: 'Active' } },
        'Tier':          { select: { name: 'Featured' } },
        'Description':   { rich_text: [{ text: { content: descText } }] },
        'Slug':          { rich_text: [{ text: { content: slug } }] },
        'Checkin Token': { rich_text: [{ text: { content: checkinToken } }] },
      };
      if (isBeta) properties['Beta Expires'] = { date: { start: '2026-05-10' } };
      if (cuisine?.trim()) properties['Cuisine'] = { select: { name: cuisine.trim() } };
      if (phone?.trim()) properties['Phone'] = { phone_number: phone.trim() };
      if (website?.trim()) properties['Website'] = { url: website.trim().startsWith('http') ? website.trim() : `https://${website.trim()}` };
      if (imageUrl?.trim()) properties['Photo URL'] = { url: imageUrl.trim() };

      const notionRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: { Authorization: `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
        body: JSON.stringify({ parent: { database_id: dbId }, properties }),
      });

      if (!notionRes.ok) {
        const err = await notionRes.text();
        console.error('submit-food-truck (skip) Notion error:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again.' });
      }

      const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
      const checkinUrl = `${siteUrl}/food-trucks?truck=${encodeURIComponent(slug)}&token=${encodeURIComponent(checkinToken)}`;

      // Send welcome SMS with check-in link
      await sendSMS(
        digits,
        `Manitou Beach Food Trucks\n\n${truckName.trim()} is live! 🎉\n\nHere's your personal check-in link:\n${checkinUrl}\n\nOpen it each time you head to Manitou Beach. Save it to your home screen for quick access.`
      );

      return res.status(200).json({ ok: true, activated: true, slug, checkinUrl, truckName: truckName.trim() });
    }

    // Normal flow — create Pending Verification record, send code via SMS
    const code = generateCode();
    const properties = {
      'Name':              { title: [{ text: { content: truckName.trim() } }] },
      'Status':            { select: { name: 'Pending Verification' } },
      'Tier':              { select: { name: 'Featured' } },
      'Description':       { rich_text: [{ text: { content: descText } }] },
      'Verification Code': { rich_text: [{ text: { content: code } }] },
    };
    if (cuisine?.trim()) properties['Cuisine'] = { select: { name: cuisine.trim() } };
    if (phone?.trim()) properties['Phone'] = { phone_number: phone.trim() };
    if (website?.trim()) properties['Website'] = { url: website.trim().startsWith('http') ? website.trim() : `https://${website.trim()}` };
    if (imageUrl?.trim()) properties['Photo URL'] = { url: imageUrl.trim() };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ parent: { database_id: dbId }, properties }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('submit-food-truck Notion error:', err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }

    const smsOk = await sendSMS(
      digits,
      `Manitou Beach Food Trucks\n\nYour verification code is: ${code}\n\nEnter this on the signup page to activate your listing.`
    );

    if (!smsOk) {
      return res.status(200).json({ ok: true, needsVerification: true, smsFailed: true });
    }

    return res.status(200).json({ ok: true, needsVerification: true });
  } catch (err) {
    console.error('submit-food-truck error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
