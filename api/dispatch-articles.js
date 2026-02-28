export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_DISPATCH_ARTICLES}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Status', select: { equals: 'Published' } },
              { property: 'Blog Safe', checkbox: { equals: true } },
            ],
          },
          sorts: [{ property: 'Published Date', direction: 'descending' }],
        }),
      }
    );

    if (!response.ok) {
      console.error('Notion query failed:', await response.text());
      return res.status(200).json({ articles: [] });
    }

    const data = await response.json();

    const articles = data.results
      .map(page => {
        const p = page.properties;
        return {
          id: page.id,
          title: p['Title']?.title?.[0]?.plain_text || '',
          slug: p['Slug']?.rich_text?.[0]?.plain_text || page.id,
          excerpt: p['Excerpt']?.rich_text?.[0]?.plain_text || '',
          category: p['Category']?.select?.name || 'Lake Life',
          author: p['Author']?.rich_text?.[0]?.plain_text || 'The Yeti',
          coverImage: p['Cover Image URL']?.url || null,
          publishedDate: p['Published Date']?.date?.start || null,
          tags: p['Tags']?.multi_select?.map(t => t.name) || [],
          aiGenerated: p['AI Generated']?.checkbox || false,
        };
      })
      .filter(a => a.title);

    return res.status(200).json({ articles });
  } catch (err) {
    console.error('Dispatch articles API error:', err.message);
    return res.status(200).json({ articles: [] });
  }
}
