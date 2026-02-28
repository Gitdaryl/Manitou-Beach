// Converts a Notion rich_text array to a plain string with basic markdown hints
function richTextToString(richTextArr) {
  if (!richTextArr || !richTextArr.length) return '';
  return richTextArr.map(t => t.plain_text).join('');
}

// Converts Notion blocks to a simple content array the frontend can render
function parseBlocks(blocks) {
  const content = [];
  let listBuffer = [];
  let listType = null;

  const flushList = () => {
    if (listBuffer.length) {
      content.push({ type: listType, items: [...listBuffer] });
      listBuffer = [];
      listType = null;
    }
  };

  for (const block of blocks) {
    const type = block.type;

    if (type === 'bulleted_list_item' || type === 'numbered_list_item') {
      const newListType = type === 'bulleted_list_item' ? 'ul' : 'ol';
      if (listType && listType !== newListType) flushList();
      listType = newListType;
      listBuffer.push(richTextToString(block[type]?.rich_text));
      continue;
    }

    flushList();

    if (type === 'paragraph') {
      const text = richTextToString(block.paragraph?.rich_text);
      if (text) content.push({ type: 'p', text });
    } else if (type === 'heading_1') {
      content.push({ type: 'h1', text: richTextToString(block.heading_1?.rich_text) });
    } else if (type === 'heading_2') {
      content.push({ type: 'h2', text: richTextToString(block.heading_2?.rich_text) });
    } else if (type === 'heading_3') {
      content.push({ type: 'h3', text: richTextToString(block.heading_3?.rich_text) });
    } else if (type === 'quote') {
      content.push({ type: 'quote', text: richTextToString(block.quote?.rich_text) });
    } else if (type === 'callout') {
      content.push({ type: 'callout', text: richTextToString(block.callout?.rich_text), icon: block.callout?.icon?.emoji || '💡' });
    } else if (type === 'divider') {
      content.push({ type: 'divider' });
    } else if (type === 'image') {
      const url = block.image?.file?.url || block.image?.external?.url || null;
      const caption = richTextToString(block.image?.caption);
      if (url) content.push({ type: 'image', url, caption });
    }
  }

  flushList();
  return content;
}

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  try {
    // Find the article by slug (or fallback to ID)
    const queryResponse = await fetch(
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
            property: 'Slug', rich_text: { equals: slug },
          },
          page_size: 1,
        }),
      }
    );

    if (!queryResponse.ok) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const queryData = await queryResponse.json();
    const page = queryData.results[0] || null;

    if (!page) return res.status(404).json({ error: 'Article not found' });

    // Fetch page content blocks
    const blocksResponse = await fetch(
      `https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
          'Notion-Version': '2022-06-28',
        },
      }
    );

    const blocksData = blocksResponse.ok ? await blocksResponse.json() : { results: [] };
    const p = page.properties;

    const article = {
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
      editorNote: p["Editor's Note"]?.rich_text?.[0]?.plain_text || null,
      content: parseBlocks(blocksData.results || []),
    };

    return res.status(200).json({ article });
  } catch (err) {
    console.error('Dispatch article API error:', err.message);
    return res.status(500).json({ error: 'Failed to load article' });
  }
}
