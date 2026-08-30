// /api/truck-manifest.js
// A web app manifest generated per food truck.
//
// Same trick as my-events-manifest.js: when a vendor installs their check-in page
// to the home screen, the launcher uses start_url. A static manifest would drop the
// token and open the public locator, so the truck slug + token ride along and the
// icon opens straight to their own "Go Live" button.
//
// No auth needed here - this only reflects back what's already in the URL. The token
// is verified by /api/food-trucks when the vendor actually checks in.

export default function handler(req, res) {
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const slug = String(req.query.truck || '').replace(/[^a-z0-9-]/gi, '').slice(0, 80);
  const token = String(req.query.token || '').replace(/[^a-z0-9]/gi, '').slice(0, 80);
  // Vendors know their own truck's name, not ours. "Drop Pin" is what the icon does.
  const name = String(req.query.name || '').slice(0, 40);

  const startUrl = slug && token
    ? `/food-trucks?truck=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}&ref=app`
    : '/food-trucks';

  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
  return res.status(200).json({
    name: name ? `Drop Pin - ${name}` : 'Drop My Pin',
    short_name: 'Drop Pin',
    description: 'One tap to tell Devils Lake you are open and post it to Facebook.',
    start_url: startUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF6EF',
    theme_color: '#D4845A',
    icons: [
      { src: `${siteUrl}/images/truck-pin-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `${siteUrl}/images/truck-pin-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  });
}
