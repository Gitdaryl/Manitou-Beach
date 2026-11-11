// Short how-to videos for business owners, keyed by report card gap.
// Hosted on the site (public/videos, Yeti Nov 11: the link opens for everyone, no app or login).
// Source and rebuild steps: ~/Projects/mb-social/how-to/listing/README.md. Re-record after edit panel changes.
// When a url is set, the report card panel and the monthly email show a "Watch how" link.

export const HOWTO_VIDEOS = {
  claim:   { title: 'Open your listing editor',                 url: '/videos/howto-claim.mp4' },
  photos:  { title: 'Add your cover photo and logo',            url: '/videos/howto-photos.mp4' },
  about:   { title: 'Write your description and tagline',       url: '/videos/howto-about.mp4' },
  hours:   { title: 'Set your hours',                           url: '/videos/howto-hours.mp4' },
  contact: { title: 'Add your phone, website and social links', url: '/videos/howto-contact.mp4' },
  google:  { title: 'Connect your Google reviews',              url: null },
};

export function howtoFor(key) {
  const v = key && HOWTO_VIDEOS[key];
  if (!v || !v.url) return null;
  // Absolute, because the monthly email needs a full link
  const url = v.url.startsWith('/') ? `${process.env.SITE_URL || 'https://manitoubeachmichigan.com'}${v.url}` : v.url;
  return { key, title: v.title, url };
}
