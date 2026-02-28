const UTM = 'utm_source=manitou_dispatch&utm_medium=referral';

export async function searchUnsplash(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY not set');

  // Add geographic context for more relevant results
  const enrichedQuery = `${query} michigan lake nature`;

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(enrichedQuery)}&per_page=5&orientation=landscape&content_filter=high`,
    { headers: { Authorization: `Client-ID ${accessKey}` } }
  );

  if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);

  const data = await res.json();
  const photo = data.results?.[0];
  if (!photo) return null;

  // Trigger download event — required by Unsplash API guidelines
  fetch(photo.links.download_location, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  }).catch(() => {});

  return {
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    photographerName: photo.user.name,
    photographerUrl: `${photo.user.links.html}?${UTM}`,
    photoPageUrl: `${photo.links.html}?${UTM}`,
    credit: `Photo by ${photo.user.name} on Unsplash`,
  };
}
