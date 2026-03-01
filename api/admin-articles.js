function richTextToString(arr) {
  if (!arr || !arr.length) return '';
  return arr.map(t => t.plain_text).join('');
}

function parseBlocks(blocks) {
  const content = [];
  let listBuffer = [];
  let listType = null;
  const flushList = () => {
    if (listBuffer.length) { content.push({ type: listType, items: [...listBuffer] }); listBuffer = []; listType = null; }
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
    if (type === 'paragraph') { const text = richTextToString(block.paragraph?.rich_text); if (text) content.push({ type: 'p', text }); }
    else if (type === 'heading_1') content.push({ type: 'h1', text: richTextToString(block.heading_1?.rich_text) });
    else if (type === 'heading_2') content.push({ type: 'h2', text: richTextToString(block.heading_2?.rich_text) });
    else if (type === 'heading_3') content.push({ type: 'h3', text: richTextToString(block.heading_3?.rich_text) });
    else if (type === 'quote') content.push({ type: 'quote', text: richTextToString(block.quote?.rich_text) });
    else if (type === 'callout') content.push({ type: 'callout', text: richTextToString(block.callout?.rich_text), icon: block.callout?.icon?.emoji || '💡' });
    else if (type === 'divider') content.push({ type: 'divider' });
    else if (type === 'image') { const url = block.image?.file?.url || block.image?.external?.url || null; if (url) content.push({ type: 'image', url, caption: richTextToString(block.image?.caption) }); }
  }
  flushList();
  return content;
}

export default async function handler(req, res) {
  // Auth check — all methods
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const HEADERS = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  // GET ?id=<notionId> — single article with full content blocks (for preview of drafts)
  if (req.method === 'GET' && req.query?.id) {
    try {
      const [pageRes, blocksRes] = await Promise.all([
        fetch(`https://api.notion.com/v1/pages/${req.query.id}`, { headers: HEADERS }),
        fetch(`https://api.notion.com/v1/blocks/${req.query.id}/children?page_size=100`, { headers: HEADERS }),
      ]);
      if (!pageRes.ok) return res.status(404).json({ error: 'Article not found' });
      const page = await pageRes.json();
      const blocksData = blocksRes.ok ? await blocksRes.json() : { results: [] };
      const p = page.properties;
      return res.status(200).json({
        article: {
          id: page.id,
          title: p['Title']?.title?.[0]?.plain_text || '',
          slug: p['Slug']?.rich_text?.[0]?.plain_text || '',
          excerpt: p['Excerpt']?.rich_text?.[0]?.plain_text || '',
          editorNote: p["Editor's Note"]?.rich_text?.[0]?.plain_text || '',
          category: p['Category']?.select?.name || 'Lake Life',
          author: p['Author']?.rich_text?.[0]?.plain_text || 'The Yeti',
          coverImage: p['Cover Image URL']?.url || null,
          publishedDate: p['Published Date']?.date?.start || null,
          tags: p['Tags']?.multi_select?.map(t => t.name) || [],
          aiGenerated: p['AI Generated']?.checkbox || false,
          blogSafe: p['Blog Safe']?.checkbox || false,
          status: p['Status']?.select?.name || 'Draft',
          notionUrl: `https://notion.so/${page.id.replace(/-/g, '')}`,
          content: parseBlocks(blocksData.results || []),
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // POST — publish / edit / unpublish
  if (req.method === 'POST') {
    const { action, notionId } = req.body || {};
    if (!notionId) return res.status(400).json({ error: 'notionId required' });

    // action=publish (default — sets Blog Safe + Status + date)
    if (!action || action === 'publish') {
      const today = new Date().toISOString().split('T')[0];
      try {
        const getRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, { headers: HEADERS });
        if (!getRes.ok) return res.status(500).json({ error: 'Failed to fetch page from Notion' });
        const page = await getRes.json();
        const existingDate = page.properties['Published Date']?.date?.start;
        const properties = { 'Blog Safe': { checkbox: true }, 'Status': { select: { name: 'Published' } } };
        if (!existingDate) properties['Published Date'] = { date: { start: today } };
        const patchRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
          method: 'PATCH', headers: HEADERS, body: JSON.stringify({ properties }),
        });
        if (!patchRes.ok) return res.status(500).json({ error: 'Failed to publish' });
        return res.status(200).json({ success: true, publishedDate: existingDate || today });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    // action=edit — patch title, excerpt, editor's note
    if (action === 'edit') {
      const { title, excerpt, editorNote } = req.body;
      try {
        const properties = {};
        if (title !== undefined) properties['Title'] = { title: [{ text: { content: title } }] };
        if (excerpt !== undefined) properties['Excerpt'] = { rich_text: [{ text: { content: excerpt } }] };
        if (editorNote !== undefined) properties["Editor's Note"] = { rich_text: [{ text: { content: editorNote } }] };
        const patchRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
          method: 'PATCH', headers: HEADERS, body: JSON.stringify({ properties }),
        });
        if (!patchRes.ok) return res.status(500).json({ error: 'Failed to save edits' });
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    // action=unpublish — reverts to draft
    if (action === 'unpublish') {
      try {
        const patchRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
          method: 'PATCH', headers: HEADERS,
          body: JSON.stringify({ properties: { 'Blog Safe': { checkbox: false }, 'Status': { select: { name: 'Draft' } } } }),
        });
        if (!patchRes.ok) return res.status(500).json({ error: 'Failed to unpublish' });
        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  // GET (no query) — all articles list for admin
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_DISPATCH_ARTICLES}/query`,
      {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ sorts: [{ timestamp: 'created_time', direction: 'descending' }], page_size: 50 }),
      }
    );
    if (!response.ok) return res.status(200).json({ articles: [] });
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
    return res.status(200).json({ articles: [] });
  }
}
