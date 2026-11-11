// Shared by the /ad-photos page and api/ad-upload.js + api/ad-intake.js, so the
// wording a business ticks and the wording the server records can never drift.
// Changing either consent sentence means bumping CONSENT_VERSION.

export const CONSENT_VERSION = '2026-11-v2'; // v2 Nov 11: each ad is sent to the business before it posts (Yeti's Nov 10 promise to Charles Noe)

export const CONSENT_OWNERSHIP =
  'I own these photos and this logo, or have permission to share them, and anyone clearly shown is OK with being in them.';

export const CONSENT_USE =
  'Manitou Beach Life and YetiGroove may use them, along with my listing details, to create and post social media ads for my business, and may clean them up, including with AI tools. They will send me each ad before it posts, and I can ask for a change, skip it, or have it removed at any time.';

// Texts are optional and never a condition of sending the form.
// Changing this sentence means bumping TEXT_CONSENT_VERSION.
export const TEXT_CONSENT_VERSION = '2026-11-v1';

export const TEXT_CONSENT =
  'Manitou Beach can text me when one of my ads goes up, one text per ad. Message and data rates may apply. Reply STOP to opt out, HELP for help.';

export const MAX_PHOTOS = 10;
export const MAX_FILE_MB = 20;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

// Browsers often report HEIC with an empty type, so the extension decides.
export const IMAGE_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

export const TEXT_LIMITS = {
  name: 100,
  email: 200,
  specialDays: 600,
  knownFor: 300,
  leaveOut: 300,
  social: 300,
  phone: 20,
};

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
