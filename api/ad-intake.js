// /api/ad-intake.js
// POST { action: 'verify', slug, t }  - is this link good, and whose is it?
// POST { action: 'submit', slug, t, ... } - save what a business sent us.
//
// Every submission is a new blob, never an overwrite, and the write finishes
// before the text to Daryl goes out. Nothing here feeds /api/businesses or any
// other public response, and the record's URL is never returned.

import { randomBytes } from 'crypto';
import { put } from '@vercel/blob';
import { findListedBusiness, RECORD_PREFIX, uploadPrefix, verifyAdToken } from './lib/ad-intake.js';
import { normalizePhone, sendSMS } from './lib/twilio.js';
import {
  CONSENT_OWNERSHIP,
  CONSENT_USE,
  CONSENT_VERSION,
  IMAGE_TYPES,
  MAX_PHOTOS,
  TEXT_CONSENT,
  TEXT_CONSENT_VERSION,
  TEXT_LIMITS,
} from '../src/data/adIntake.js';

export const config = {
  api: { bodyParser: { sizeLimit: '100kb' } },
};

class Invalid extends Error {}

function cleanText(value, max, label) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new Invalid(`${label} doesn't look right.`);
  const text = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  if (text.length > max) throw new Invalid(`${label} is too long. Keep it under ${max} characters.`);
  return text;
}

function cleanMonths(value, label) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.some((m) => !Number.isInteger(m) || m < 1 || m > 12)) {
    throw new Invalid(`${label} doesn't look right.`);
  }
  return [...new Set(value)].sort((a, b) => a - b);
}

function cleanFileUrl(value, prefix, kind) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Invalid('One of your files did not finish sending. Please try again.');
  }
  // Our own store only: its host comes from the read-write token's store id.
  const storeId = (process.env.BLOB_READ_WRITE_TOKEN || '').split('_')[3]?.toLowerCase();
  const file = url.pathname.startsWith(`/${prefix}/`) ? url.pathname.slice(prefix.length + 2) : '';
  const shape = new RegExp(`^${kind}-[A-Za-z0-9_-]+\\.([a-z]{3,4})$`).exec(file);
  const ok = url.protocol === 'https:'
    && url.hostname === `${storeId}.public.blob.vercel-storage.com`
    && !url.search
    && !url.hash
    && Boolean(shape && IMAGE_TYPES[shape[1]]);
  if (!ok) throw new Invalid('One of your files did not finish sending. Please try again.');
  return url.toString();
}

function buildRecord(business, body) {
  if (body.consentOwnership !== true || body.consentUse !== true) {
    throw new Invalid('Both boxes need to be ticked before we can use your photos.');
  }
  if (body.consentVersion !== CONSENT_VERSION) {
    throw new Invalid('This page is out of date. Please refresh and tick both boxes again.');
  }

  const name = cleanText(body.name, TEXT_LIMITS.name, 'Your name');
  const email = cleanText(body.email, TEXT_LIMITS.email, 'Your email');
  if (!name) throw new Invalid('Please add your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Invalid('Please check your email address.');

  const prefix = uploadPrefix(business.pageId);
  const noLogo = body.noLogo === true;
  const logoUrl = body.logoUrl ? cleanFileUrl(body.logoUrl, prefix, 'logo') : null;
  if (!logoUrl && !noLogo) throw new Invalid('Please add your logo, or tick "I don\'t have a logo yet".');
  if (logoUrl && noLogo) throw new Invalid('You added a logo and also ticked "I don\'t have a logo yet". Please pick one.');

  const rawPhotos = body.photoUrls ?? [];
  if (!Array.isArray(rawPhotos)) throw new Invalid('Your photos did not come through. Please try again.');
  if (rawPhotos.length > MAX_PHOTOS) throw new Invalid(`We can take up to ${MAX_PHOTOS} photos.`);
  const photoUrls = [...new Set(rawPhotos.map((u) => cleanFileUrl(u, prefix, 'photo')))];

  const closedMonths = cleanMonths(body.closedMonths, 'Closed months');
  if (closedMonths.length === 12) throw new Invalid('You ticked every month as closed. Please check those.');
  let openAllYear = null;
  if (body.openAllYear === true) {
    if (closedMonths.length) throw new Invalid('You said open all year and also ticked closed months. Please pick one.');
    openAllYear = true;
  } else if (body.openAllYear === false && closedMonths.length) {
    openAllYear = false;
  }

  // Only kept when they ticked the box: a number with no consent is never stored.
  let textAlerts = null;
  if (body.textOk === true) {
    if (body.textConsentVersion !== TEXT_CONSENT_VERSION) {
      throw new Invalid('This page is out of date. Please refresh and try again.');
    }
    const phone = normalizePhone(cleanText(body.phone, TEXT_LIMITS.phone, 'Your mobile number'));
    if (phone.length !== 10) throw new Invalid('Please check your mobile number.');
    textAlerts = { phone, version: TEXT_CONSENT_VERSION, text: TEXT_CONSENT, page: '/ad-photos' };
  }

  return {
    business: business.name,
    slug: business.slug,
    pageId: business.pageId,
    name,
    email,
    submittedAt: new Date().toISOString(),
    consent: {
      version: CONSENT_VERSION,
      ownership: true,
      use: true,
      ownershipText: CONSENT_OWNERSHIP,
      useText: CONSENT_USE,
    },
    noLogo,
    logoUrl,
    photoUrls,
    social: {
      facebook: cleanText(body.facebook, TEXT_LIMITS.social, 'Your Facebook page'),
      instagram: cleanText(body.instagram, TEXT_LIMITS.social, 'Your Instagram'),
      personal: cleanText(body.personalSocial, TEXT_LIMITS.social, 'Your personal account'),
      wantsSetupHelp: body.wantsSetupHelp === true,
    },
    textAlerts,
    answers: {
      openAllYear,
      closedMonths,
      bestMonths: cleanMonths(body.bestMonths, 'Best months'),
      specialDays: cleanText(body.specialDays, TEXT_LIMITS.specialDays, 'Special days'),
      knownFor: cleanText(body.knownFor, TEXT_LIMITS.knownFor, 'Best known for'),
      leaveOut: cleanText(body.leaveOut, TEXT_LIMITS.leaveOut, 'Things to leave out'),
    },
  };
}

function textFor(record) {
  const oneLine = (s) => s.replace(/\s+/g, ' ').slice(0, 60);
  const logo = record.logoUrl ? 'logo' : 'no logo';
  const photos = `${record.photoUrls.length} photo${record.photoUrls.length === 1 ? '' : 's'}`;
  const help = record.social.wantsSetupHelp ? ' Wants help setting up social pages.' : '';
  return `MB ad photos: ${oneLine(record.business)} sent ${logo}, ${photos}. From ${oneLine(record.name)}.${help} Run pull-intake.py`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (body.action !== 'verify' && body.action !== 'submit') {
    return res.status(400).json({ error: 'Bad request.' });
  }

  let business;
  try {
    business = await findListedBusiness(body.slug);
  } catch (err) {
    console.error('ad-intake lookup failed:', err.message);
    return res.status(503).json({ error: 'We could not check your link just now. Please try again in a minute.' });
  }
  if (!business || !verifyAdToken(business.pageId, body.t)) {
    return res.status(403).json({ error: 'invalid-link' });
  }

  if (body.action === 'verify') {
    return res.status(200).json({
      ok: true,
      business: business.name,
      pageId: business.pageId,
      uploadPrefix: uploadPrefix(business.pageId),
      facebook: business.facebook,
      instagram: business.instagram,
    });
  }

  let record;
  try {
    record = buildRecord(business, body);
  } catch (err) {
    if (err instanceof Invalid) return res.status(400).json({ error: err.message });
    console.error('ad-intake validation error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Your form is safe, please try again.' });
  }

  // Persist first. Records hold names and emails, so they live in their own
  // private store and there is no fallback to the public one. The payload is
  // only logged when the write fails, as the safety net.
  try {
    const token = process.env.AD_INTAKE_READ_WRITE_TOKEN;
    if (!token) throw new Error('AD_INTAKE_READ_WRITE_TOKEN is not set');
    const stamp = record.submittedAt.replace(/[^0-9]/g, '').slice(0, 14);
    await put(`${RECORD_PREFIX}${stamp}-${randomBytes(12).toString('hex')}.json`, JSON.stringify(record, null, 2), {
      access: 'private',
      addRandomSuffix: true,
      contentType: 'application/json',
      token,
    });
  } catch (err) {
    console.error('[AD-INTAKE] record write failed:', err.message, JSON.stringify(record));
    return res.status(500).json({ error: 'We could not save that. Your form is safe, please try again.' });
  }

  // Best effort from here on: the record is safe, so a failed text is only logged.
  try {
    const sent = await sendSMS(process.env.DARYL_PHONE, textFor(record));
    if (!sent) console.error('[AD-INTAKE] text failed for', record.slug);
  } catch (err) {
    console.error('[AD-INTAKE] text failed for', record.slug, err.message);
  }

  return res.status(200).json({ ok: true });
}
