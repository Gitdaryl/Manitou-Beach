// Admin-only — look up a Google Place ID and return the Google review URL
// Requires GOOGLE_PLACES_API_KEY env var (same key as VITE_GOOGLE_MAPS_API_KEY often works)
// POST { businessName, city }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  const { businessName, city = 'Manitou Beach, Michigan' } = req.body || {};
  if (!businessName?.trim()) return res.status(400).json({ error: 'businessName required' });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'No Google API key configured. Add GOOGLE_PLACES_API_KEY to Vercel env vars.' });
  }

  const input = encodeURIComponent(`${businessName.trim()} ${city}`);
  const fields = 'place_id,name,formatted_address';
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${input}&inputtype=textquery&fields=${fields}&key=${apiKey}`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (data.status === 'REQUEST_DENIED') {
      return res.status(500).json({ error: 'Google API key denied. Make sure Places API is enabled for this key.' });
    }

    if (data.status !== 'OK' || !data.candidates?.length) {
      return res.status(404).json({ error: `Not found (Google status: ${data.status || 'unknown'})` });
    }

    const candidate = data.candidates[0];
    const placeId = candidate.place_id;
    const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;

    return res.status(200).json({
      placeId,
      name: candidate.name,
      formattedAddress: candidate.formatted_address,
      reviewUrl,
    });
  } catch (err) {
    console.error('place-lookup error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
