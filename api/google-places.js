// Google Places Details - returns rating, review count, and up to 2 review snippets
// GET /api/google-places?placeId=ChIJ...
// Requires GOOGLE_PLACES_API_KEY env var

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { placeId } = req.query;
  if (!placeId?.trim()) return res.status(400).json({ error: 'placeId is required' });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_PLACES_API_KEY not configured' });
  }

  // Cache at CDN layer for 12 hours - reviews don't change that often
  res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600');

  const fields = 'rating,user_ratings_total,reviews';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId.trim())}&fields=${fields}&key=${apiKey}`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Places API denied:', data.error_message);
      return res.status(500).json({ error: 'Google API key denied. Ensure Places API is enabled.' });
    }

    if (data.status === 'NOT_FOUND' || data.status === 'INVALID_REQUEST') {
      return res.status(404).json({ error: `Place not found (status: ${data.status})` });
    }

    if (data.status !== 'OK' || !data.result) {
      return res.status(404).json({ error: `No data returned (status: ${data.status || 'unknown'})` });
    }

    const { rating, user_ratings_total, reviews } = data.result;

    // Return top 2 reviews sorted by relevance (Google's default)
    const snippets = (reviews || [])
      .slice(0, 2)
      .map(r => ({
        text: r.text?.slice(0, 300) || '',
        author: r.author_name || 'Guest',
      }))
      .filter(r => r.text);

    return res.status(200).json({
      rating: rating ?? null,
      reviewCount: user_ratings_total ?? 0,
      reviews: snippets,
    });
  } catch (err) {
    console.error('google-places error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
