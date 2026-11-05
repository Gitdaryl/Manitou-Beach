// /api/ad-upload.js
// Hands the browser a short-lived token to send one original photo straight to
// Blob, so files skip the 4.5 MB function limit and never get shrunk.
// Token and consent are both checked here, before any file can be sent.
//
// clientPayload (JSON string): { pageId, t, consentVersion, consentOwnership, consentUse, size }

import { handleUpload } from '@vercel/blob/client';
import { list } from '@vercel/blob';
import { uploadPrefix, verifyAdToken } from './lib/ad-intake.js';
import { CONSENT_VERSION, IMAGE_TYPES, MAX_FILE_BYTES } from '../src/data/adIntake.js';

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } },
};

// Six full forms' worth, so a shared link cannot fill the store.
const MAX_FILES_PER_BUSINESS = 66;

class Refused extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function checkRequest(pathname, clientPayload) {
  let payload;
  try {
    payload = JSON.parse(clientPayload || '{}');
  } catch {
    throw new Refused(400, 'Bad request.');
  }
  const { pageId, t, consentVersion, consentOwnership, consentUse, size } = payload || {};

  if (typeof pageId !== 'string' || !verifyAdToken(pageId, t)) {
    throw new Refused(403, 'This link is not valid.');
  }
  if (consentOwnership !== true || consentUse !== true || consentVersion !== CONSENT_VERSION) {
    throw new Refused(403, 'Both boxes need to be ticked before uploading.');
  }

  const prefix = uploadPrefix(pageId);
  const match = String(pathname).match(/^(.+)\/(?:logo|photo)-[a-z0-9]{4,32}\.([a-z]{3,4})$/);
  if (!match || match[1] !== prefix || !IMAGE_TYPES[match[2]]) {
    throw new Refused(400, 'Photos only, please: JPG, PNG, WebP or HEIC.');
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_BYTES) {
    throw new Refused(400, 'That file is too big.');
  }

  const { blobs } = await list({ prefix: `${prefix}/`, limit: MAX_FILES_PER_BUSINESS });
  if (blobs.length >= MAX_FILES_PER_BUSINESS) {
    throw new Refused(429, 'We already have plenty from you. Get in touch if you need to send more.');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        await checkRequest(pathname, clientPayload);
        return {
          allowedContentTypes: [...new Set(Object.values(IMAGE_TYPES))],
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return res.json(jsonResponse);
  } catch (err) {
    console.error('ad-upload error:', err.message);
    return res.status(err.status || 400).json({ error: err.status ? err.message : 'Upload could not start.' });
  }
}
