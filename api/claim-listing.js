// /api/claim-listing.js
// POST { slug, phone } - find business by slug, verify phone matches, send 6-digit SMS code
//
// The business must be in a Listed status and have a phone number on record.
// Returns { ok: true } on success, { error: string } on failure.

import crypto from 'crypto';
import { sendSMS, normalizePhone } from './lib/twilio.js';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function toSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

async function findBusinessBySlug(slug) {
  // Fetch all listed businesses and find the one matching the slug
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
    {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: {
          or: [
            { property: 'Status', status: { equals: 'Listed Free' } },
            { property: 'Status', status: { equals: 'Listed Enhanced' } },
            { property: 'Status', status: { equals: 'Listed Featured' } },
            { property: 'Status', status: { equals: 'Listed Premium' } },
          ],
        },
        page_size: 100,
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return (data.results || []).find(page => {
    const name = page.properties['Name']?.title?.[0]?.text?.content || '';
    return toSlug(name) === slug;
  }) || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, phone } = req.body || {};
  if (!slug || !phone) return res.status(400).json({ error: 'slug and phone are required' });

  const inputDigits = normalizePhone(phone);
  if (inputDigits.length < 10) return res.status(400).json({ error: 'Valid phone number required' });

  try {
    const page = await findBusinessBySlug(slug);
    if (!page) return res.status(404).json({ error: 'Business not found' });

    // Verify phone matches what is on file
    const storedPhone = normalizePhone(page.properties['Phone']?.phone_number || '');
    if (!storedPhone) {
      return res.status(400).json({ error: 'No phone number on file for this listing. Email hello@yetigroove.com to claim it.' });
    }
    if (storedPhone !== inputDigits) {
      return res.status(403).json({ error: 'That number does not match our records for this business.' });
    }

    // Generate and store verification code
    const code = generateCode();
    const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
      method: 'PATCH',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        properties: {
          'Verification Code': { rich_text: [{ text: { content: code } }] },
        },
      }),
    });
    if (!patchRes.ok) {
      console.error('claim-listing: Notion PATCH failed:', await patchRes.text());
      return res.status(500).json({ error: 'Could not initiate claim. Try again.' });
    }

    const businessName = page.properties['Name']?.title?.[0]?.text?.content || 'your business';
    const smsOk = await sendSMS(
      inputDigits,
      `Manitou Beach\n\nYour code to manage ${businessName}: ${code}\n\nEnter this on the website to unlock editing. Code expires in 15 minutes.`
    );

    if (!smsOk) {
      return res.status(200).json({ ok: true, smsFailed: true });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('claim-listing error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
