// /api/self-edit-listing.js
// POST { slug, claimToken, ...fields } - owner-authenticated direct Notion update
//
// claimToken is HMAC(pageId, secret) - verified server-side without any stored state.
// Fields: description, phone, website, address, hours (JSON string), heroPhotoUrl, googlePlaceId
//
// Bypasses the manual-review flow in update-listing.js - changes go live immediately.

import { createHmac } from 'crypto';
import { normalizePhone } from './lib/twilio.js';

export const config = {
  api: { bodyParser: { sizeLimit: '6mb' } },
};

function toSlug(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function makeClaimToken(pageId) {
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

  const {
    slug,
    claimToken,
    description,
    phone,
    website,
    address,
    hours,       // JSON string: { Mon: "9am-5pm", Tue: "9am-5pm", ... }
    heroPhotoUrl,
    logoUrl,
    googlePlaceId,
    socialInstagram,
    socialFacebook,
    tagline,
    accentColor,
    emergency,
  } = req.body || {};

  if (!slug || !claimToken) {
    return res.status(400).json({ error: 'slug and claimToken are required' });
  }

  try {
    const page = await findBusinessBySlug(slug);
    if (!page) return res.status(404).json({ error: 'Business not found' });

    // Verify the claim token
    const expected = makeClaimToken(page.id);
    if (claimToken !== expected) {
      return res.status(403).json({ error: 'Invalid claim token. Re-verify your phone number.' });
    }

    // Validate hours JSON if provided
    if (hours) {
      try { JSON.parse(hours); } catch {
        return res.status(400).json({ error: 'Invalid hours format.' });
      }
    }

    let normalizedUrl = null;
    if (website && website.trim()) {
      const u = website.trim();
      normalizedUrl = /^https?:\/\//i.test(u) ? u : 'https://' + u;
    }

    let normalizedHero = null;
    if (heroPhotoUrl && heroPhotoUrl.trim()) {
      const u = heroPhotoUrl.trim();
      normalizedHero = /^https?:\/\//i.test(u) ? u : 'https://' + u;
    }

    const properties = {};
    if (description !== undefined)  properties['Description']    = { rich_text: [{ text: { content: description || '' } }] };
    if (phone !== undefined)         properties['Phone']           = { phone_number: normalizePhone(phone) || null };
    if (normalizedUrl !== undefined) properties['URL']             = { url: normalizedUrl };
    if (address !== undefined)       properties['Address']         = { rich_text: [{ text: { content: address || '' } }] };
    if (hours !== undefined)         properties['Hours']           = { rich_text: [{ text: { content: hours || '' } }] };
    if (normalizedHero)              properties['Hero Photo URL']  = { url: normalizedHero };

    let normalizedLogo = null;
    if (logoUrl && logoUrl.trim()) {
      const u = logoUrl.trim();
      normalizedLogo = /^https?:\/\//i.test(u) ? u : 'https://' + u;
    }
    if (normalizedLogo)              properties['Logo URL']        = { url: normalizedLogo };
    if (googlePlaceId !== undefined) properties['Google Place ID'] = { rich_text: [{ text: { content: googlePlaceId || '' } }] };
    if (socialInstagram !== undefined) properties['Instagram URL'] = { url: socialInstagram || null };
    if (socialFacebook !== undefined)  properties['Facebook URL']  = { url: socialFacebook || null };
    if (tagline !== undefined)         properties['Tagline']       = { rich_text: [{ text: { content: tagline || '' } }] };
    if (accentColor !== undefined)     properties['Accent Color']  = { rich_text: [{ text: { content: accentColor || '' } }] };
    if (emergency !== undefined)       properties['Emergency']     = { checkbox: !!emergency };

    if (Object.keys(properties).length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
      method: 'PATCH',
      headers: NOTION_HEADERS,
      body: JSON.stringify({ properties }),
    });

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error('self-edit-listing PATCH failed:', err);
      return res.status(500).json({ error: 'Update failed. Try again.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('self-edit-listing error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
}
