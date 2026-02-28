export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notionId, rating, feedback, googleClicked } = req.body || {};

  if (!notionId) {
    return res.status(400).json({ error: 'notionId required' });
  }

  const properties = {};
  if (rating)        properties['Rating']         = { number: rating };
  if (feedback)      properties['Feedback']        = { rich_text: [{ text: { content: feedback } }] };
  if (googleClicked) properties['Google Clicked']  = { checkbox: true };

  if (Object.keys(properties).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/pages/${notionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_DISPATCH}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error('Notion submit-rating error:', err);
      return res.status(500).json({ error: 'Failed to record rating' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('submit-rating error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
