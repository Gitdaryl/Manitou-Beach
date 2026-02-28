import { searchUnsplash } from './_unsplash.js';

export default async function handler(req, res) {
  const query = req.method === 'GET' ? req.query.q : req.body?.query;

  if (!query) return res.status(400).json({ error: 'query (q) required' });

  try {
    const photo = await searchUnsplash(query);
    if (!photo) return res.status(404).json({ error: 'No photos found for this query' });
    return res.status(200).json(photo);
  } catch (err) {
    console.error('fetch-cover-image error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
