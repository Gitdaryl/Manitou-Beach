export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
          sorts: [{ timestamp: 'created_time', direction: 'descending' }],
          page_size: 50,
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
          status: p['Status']?.select?.name || 'Draft',
          blogSafe: p['Blog Safe']?.checkbox || false,
          publishedDate: p['Published Date']?.date?.start || null,
          aiGenerated: p['AI Generated']?.checkbox || false,
          coverImage: p['Cover Image URL']?.url || null,
          notionUrl: `https://notion.so/${page.id.replace(/-/g, '')}`,
        };
      })
      .filter(a => a.title);

    return res.status(200).json({ articles });
  } catch (err) {
    console.error('Admin articles API error:', err.message);
    return res.status(200).json({ articles: [] });
  }
}
