export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notionId } = req.body || {};

  if (!notionId) {
    return res.status(400).json({ error: 'notionId required' });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Check if Published Date is already set
    const getRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (!getRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch page from Notion' });
    }

    const page = await getRes.json();
    const existingDate = page.properties['Published Date']?.date?.start;

    const properties = {
      'Blog Safe': { checkbox: true },
      'Status': { select: { name: 'Published' } },
    };

    if (!existingDate) {
      properties['Published Date'] = { date: { start: today } };
    }

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
