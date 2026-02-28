export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, category, phone, website, email, description, address, newsletter, tier, duration, logoUrl } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Business name is required' });
  }

  // Normalize website URL — Notion requires full URL with protocol
  let normalizedUrl = null;
  if (website && website.trim()) {
    let url = website.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    normalizedUrl = url;
  }

  let normalizedLogoUrl = null;
  if (logoUrl && logoUrl.trim()) {
    let url = logoUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    normalizedLogoUrl = url;
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_BUSINESS },
        properties: {
          'Name': { title: [{ text: { content: name } }] },
          'Category': { select: { name: category || 'Other' } },
          'Phone': { phone_number: phone || null },
          'URL': { url: normalizedUrl },
          'Email': { email: email || null },
          'Description': { rich_text: [{ text: { content: description || '' } }] },
          'Address': { rich_text: [{ text: { content: address || '' } }] },
          ...(normalizedLogoUrl && { 'Logo URL': { url: normalizedLogoUrl } }),
          ...(tier && { 'Requested Tier': { select: { name: tier } } }),
          ...(duration && { 'Requested Duration': { number: parseInt(duration, 10) } }),
          ...((newsletter === true || newsletter === 'true') && { 'Newsletter': { checkbox: true } }),
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Notion error:', err);
      return res.status(500).json({ error: 'Failed to save submission', detail: err?.message || JSON.stringify(err) });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Server error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
