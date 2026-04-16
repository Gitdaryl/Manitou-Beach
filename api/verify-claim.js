// /api/verify-claim.js
// POST { slug, phone, code } - verify SMS code, return HMAC claim token
//
// The claim token is HMAC(pageId, secret) - deterministic, no storage needed.
// Browser stores it in localStorage['mb-claim-{slug}'] and sends it with edits.

import { createHmac } from 'crypto';
import { normalizePhone } from './lib/twilio.js';

function toSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function makeClaimToken(pageId) {
  const secret = process.env.NOTION_TOKEN_BUSINESS || 'fallback';
  return createHmac('sha256', secret).update(`claim:${pageId}`).digest('hex').slice(0, 48);
}

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

async function findBusinessBySlug(slug) {
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

  const { slug, phone, code } = req.body || {};
  if (!slug || !phone || !code) return res.status(400).json({ error: 'slug, phone, and code are required' });

  if (!code || code.trim().length !== 6) {
    return res.status(400).json({ error: 'Please enter your 6-digit code.' });
  }

  const inputDigits = normalizePhone(phone);

  try {
    const page = await findBusinessBySlug(slug);
    if (!page) return res.status(404).json({ error: 'Business not found' });

    // Verify phone still matches
    const storedPhone = normalizePhone(page.properties['Phone']?.phone_number || '');
    if (storedPhone !== inputDigits) {
      return res.status(403).json({ error: 'Phone number mismatch.' });
    }

    const storedCode = page.properties['Verification Code']?.rich_text?.[0]?.text?.content || '';
    if (!storedCode) {
      return res.status(400).json({ error: 'No code on file. Request a new one.' });
    }
    if (code.trim() !== storedCode) {
      return res.status(400).json({ error: 'Incorrect code. Check your messages and try again.' });
    }

    // Clear the code so it cannot be reused
    await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
      method: 'PATCH',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        properties: {
          'Verification Code': { rich_text: [{ text: { content: '' } }] },
        },
      }),
    });

    const claimToken = makeClaimToken(page.id);
    return res.status(200).json({ ok: true, claimToken, pageId: page.id });
  } catch (err) {
    console.error('verify-claim error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
