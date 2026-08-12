// /api/my-events-manifest.js
// A web app manifest generated per organizer.
//
// The point of the whole thing: when someone installs /my-events to their home
// screen, the launcher uses start_url from the manifest. A static manifest would
// drop the token and open a stranger's "enter your phone" screen. So the token
// rides along in start_url and the icon opens straight to their events.
//
// No auth needed here - this only reflects back what's already in the URL. The
// token is verified by /api/my-events when the page actually loads data.

export default function handler(req, res) {
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const phone = String(req.query.phone || '').replace(/\D/g, '').slice(-10);
  const token = String(req.query.token || '');

  const startUrl = phone && token
    ? `/my-events?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}&src=app`
    : '/my-events?src=app';

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
  return res.status(200).json({
    name: 'My Manitou Events',
    short_name: 'My Events',
    description: 'Every event you\'ve put on the Manitou Beach calendar, one tap away.',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1A2830',
    theme_color: '#1A2830',
    icons: [
      { src: `${siteUrl}/images/my-events-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${siteUrl}/images/my-events-512.png`, sizes: '512x512', type: 'image/png' },
    ],
  });
}
