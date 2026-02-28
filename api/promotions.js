export default async function handler(req, res) {
  // Cache for 5 minutes — promos are time-sensitive
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Promo Type', select: { is_not_empty: true } },
              { property: 'Promo End', date: { on_or_after: today } },
              {
                or: [
                  { property: 'Status', status: { equals: 'Approved' } },
                  { property: 'Status', status: { equals: 'Published' } },
                ],
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Notion promotions query failed:', await response.text());
      return res.status(200).json({ heroTakeover: [], pageBanners: {}, stripPin: null, videoSpotlight: null });
    }

    const data = await response.json();
    const now = new Date();

    const promos = data.results
      .filter(page => {
        // Also check Promo Start if set — don't show before start date
        const startStr = page.properties['Promo Start']?.date?.start;
        if (startStr) {
          const start = new Date(startStr + 'T00:00:00');
          if (start > now) return false;
        }
        return true;
      })
      .map(page => {
        const p = page.properties;
        return {
          id: page.id,
          name: p['Event Name']?.title?.[0]?.text?.content || '',
          promoHeadline: p['Promo Headline']?.rich_text?.[0]?.text?.content || null,
          date: p['Event date']?.date?.start || '',
          time: p['Time']?.rich_text?.[0]?.text?.content || '',
          location: p['Location']?.rich_text?.[0]?.text?.content || '',
          imageUrl: p['Image URL']?.url || null,
          heroImageUrl: p['Hero Image URL']?.url || null,
          eventUrl: p['Event URL']?.url || null,
          ctaLabel: p['CTA Label']?.select?.name || null,
          videoUrl: p['Video URL']?.url || null,
          cost: p['Cost']?.rich_text?.[0]?.text?.content || null,
          promoType: p['Promo Type']?.select?.name || '',
          promoPages: (p['Promo Pages']?.multi_select || []).map(s => s.name),
          sponsorBadge: p['Sponsor Badge']?.checkbox || false,
          isPromo: true,
        };
      })
      .filter(e => e.name && e.promoType);

    // Group by type
    const heroTakeover = promos.filter(e => e.promoType === 'Hero Takeover');

    const pageBannerPromos = promos.filter(e => e.promoType === 'Page Banner');
    const pageBanners = {};
    pageBannerPromos.forEach(promo => {
      promo.promoPages.forEach(page => {
        if (!pageBanners[page]) pageBanners[page] = [];
        pageBanners[page].push(promo);
      });
    });

    const stripPin = promos.find(e => e.promoType === 'Strip Pin') || null;
    const videoSpotlight = promos.find(e => e.promoType === 'Video Spotlight') || null;

    return res.status(200).json({ heroTakeover, pageBanners, stripPin, videoSpotlight });
  } catch (err) {
    console.error('Promotions API error:', err.message);
    return res.status(200).json({ heroTakeover: [], pageBanners: {}, stripPin: null, videoSpotlight: null });
  }
}
