// Google Places Details - returns rating, review count, and up to 2 review snippets
// GET /api/google-places?placeId=ChIJ...
// Requires GOOGLE_PLACES_API_KEY env var
//
// Places API (New) first, legacy Places Details as the fallback.
// Why (Nov 2026): the legacy API cannot read service-area businesses that hide
// their address. Yeti Groove Media and On Point JD answered NOT_FOUND / "no longer
// valid" there, while Places API (New) returns both (5.0 with 14 and 1 reviews).
// The fallback keeps storefronts working if the New API is ever switched off.

const NEW_FIELDS = 'rating,userRatingCount,reviews';

async function fromNewApi(placeId, apiKey) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': NEW_FIELDS },
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    console.error(`Places API (New) ${r.status}:`, body.slice(0, 300));
    return null;
  }
  const d = await r.json();
  if (d.rating == null && !d.userRatingCount) return null;
  return {
    rating: d.rating ?? null,
    reviewCount: d.userRatingCount ?? 0,
    reviews: (d.reviews || [])
      .slice(0, 2)
      .map(rv => ({
        text: (rv.text?.text || rv.originalText?.text || '').slice(0, 300),
        author: rv.authorAttribution?.displayName || 'Guest',
      }))
      .filter(rv => rv.text),
  };
}

async function fromLegacyApi(placeId, apiKey) {
  const fields = 'rating,user_ratings_total,reviews';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${apiKey}`;
  const r = await fetch(url);
  const data = await r.json();
  if (data.status === 'REQUEST_DENIED') {
    console.error('Google Places API denied:', data.error_message);
    return { error: 'Google API key denied. Ensure Places API is enabled.', code: 500 };
  }
  if (data.status !== 'OK' || !data.result) {
    return { error: `Place not found (status: ${data.status || 'unknown'})`, code: 404 };
  }
  const { rating, user_ratings_total, reviews } = data.result;
  return {
    rating: rating ?? null,
    reviewCount: user_ratings_total ?? 0,
    reviews: (reviews || [])
      .slice(0, 2)
      .map(rv => ({ text: rv.text?.slice(0, 300) || '', author: rv.author_name || 'Guest' }))
      .filter(rv => rv.text),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const placeId = req.query.placeId?.trim();
  if (!placeId) return res.status(400).json({ error: 'placeId is required' });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_PLACES_API_KEY not configured' });
  }

  try {
    const fresh = await fromNewApi(placeId, apiKey);
    const result = fresh || await fromLegacyApi(placeId, apiKey);

    if (result.error) {
      // Do not let the CDN hold a miss for 12 hours.
      res.setHeader('Cache-Control', 'no-store');
      return res.status(result.code).json({ error: result.error });
    }

    // Cache at CDN layer for 12 hours - reviews don't change that often
    res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=3600');
    return res.status(200).json(result);
  } catch (err) {
    console.error('google-places error:', err.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: err.message });
  }
}
