// YouTube Data API v3 proxy - fetches latest videos from Holly & The Yeti channel
// Falls back to hardcoded video list if API key is missing or request fails

const CHANNEL_ID = 'UCnjEuUEFlrsNzkWDyLkarcA';
const MAX_RESULTS = 6;

// Fallback videos (from config.js VIDEOS array)
const FALLBACK = [
  { videoId: '6Gc7hTs88LI', title: 'Devils Lake Tip-Up Festival 2026', publishedAt: '2026-01-15', thumbnail: '' },
  { videoId: 'bfPKmB57ltY', title: "Cruisin' Till the Sun Goes Down", publishedAt: '2025-08-01', thumbnail: '' },
  { videoId: 'uqEtu9GlBHk', title: 'Devils Lake Tip-Up Festival 2025', publishedAt: '2025-01-20', thumbnail: '' },
  { videoId: 'IczTln0Jxd4', title: 'Wooden Boats on Devils Lake', publishedAt: '2025-06-01', thumbnail: '' },
  { videoId: '3MCb5X4bj9s', title: 'Party on Devils Lake', publishedAt: '2025-07-04', thumbnail: '' },
].map(v => ({ ...v, thumbnail: v.thumbnail || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`, description: '' }));

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ videos: FALLBACK, source: 'fallback' });
  }

  try {
    // Fetch latest videos directly using channel ID
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?channelId=${CHANNEL_ID}&order=date&type=video&part=snippet&maxResults=${MAX_RESULTS}&key=${apiKey}`
    );
    if (!searchRes.ok) throw new Error('Search failed');
    const searchData = await searchRes.json();

    const videos = (searchData.items || []).map(item => ({
      videoId: item.id?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      publishedAt: item.snippet?.publishedAt?.split('T')[0] || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id?.videoId}/mqdefault.jpg`,
    }));

    // Cache for 1 hour at CDN level
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json({ videos, source: 'youtube' });
  } catch (err) {
    console.error('YouTube API error:', err.message);
    return res.status(200).json({ videos: FALLBACK, source: 'fallback' });
  }
}
