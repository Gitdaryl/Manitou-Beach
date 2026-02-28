export default async function handler(req, res) {
  // POST — publish an article (set Blog Safe + Status + Published Date)
  if (req.method === 'POST') {
    const { notionId } = req.body || {};
    if (!notionId) return res.status(400).json({ error: 'notionId required' });

    const today = new Date().toISOString().split('T')[0];

    try {
      const getRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
          'Notion-Version': '2022-06-28',
        },
      });
      if (!getRes.ok) return res.status(500).json({ error: 'Failed to fetch page from Notion' });

      const page = await getRes.json();
      const existingDate = page.properties['Published Date']?.date?.start;

      const properties = {
        'Blog Safe': { checkbox: true },
        'Status': { select: { name: 'Published' } },
      };
      if (!existingDate) properties['Published Date'] = { date: { start: today } };

      const patchRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties }),
      });

      if (!patchRes.ok) {
        const err = await patchRes.text();
        console.error('Notion patch failed:', err);
        return res.status(500).json({ error: 'Failed to publish', details: err });
      }

      return res.status(200).json({ success: true, publishedDate: existingDate || today });
    } catch (err) {
      console.error('publish-article error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // GET — fetch all articles for admin (unfiltered)
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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
