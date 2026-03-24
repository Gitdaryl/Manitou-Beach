const NOTION_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

async function findByNameAndEmail(name, email) {
  const res = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
    {
      method: 'POST',
      headers: NOTION_HEADERS,
      body: JSON.stringify({
        filter: {
          and: [
            { property: 'Name', title: { equals: name } },
            { property: 'Email', email: { equals: email } },
          ],
        },
        page_size: 1,
      }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}

export default async function handler(req, res) {
  // GET — verify identity and return current listing details
  if (req.method === 'GET') {
    const { name, email } = req.query;
    if (!name || !email) return res.status(400).json({ found: false, error: 'Name and email are required' });

    try {
      const page = await findByNameAndEmail(name.trim(), email.trim().toLowerCase());
      if (!page) return res.status(200).json({ found: false });

      const p = page.properties;
      return res.status(200).json({
        found: true,
        business: {
          name: p['Name']?.title?.[0]?.text?.content || '',
          phone: p['Phone']?.phone_number || '',
          website: p['URL']?.url || '',
          address: p['Address']?.rich_text?.[0]?.text?.content || '',
          description: p['Description']?.rich_text?.[0]?.text?.content || '',
          logo: p['Logo URL']?.url || '',
          category: p['Category']?.select?.name || '',
        },
      });
    } catch (err) {
      console.error('update-listing GET error:', err.message);
      return res.status(500).json({ found: false, error: 'Server error' });
    }
  }

  // POST — submit an update request
  if (req.method === 'POST') {
    const { name, email, phone, website, address, description, logoUrl, category } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, error: 'Name and email are required' });

    try {
      // Re-verify email matches Notion record (security — prevent updating someone else's listing)
      const existing = await findByNameAndEmail(name.trim(), email.trim().toLowerCase());
      if (!existing) return res.status(403).json({ success: false, error: 'Could not verify your listing. Check the name and email match your original submission.' });

      let normalizedUrl = null;
      if (website && website.trim()) {
        const u = website.trim();
        normalizedUrl = /^https?:\/\//i.test(u) ? u : 'https://' + u;
      }

      let normalizedLogo = null;
      if (logoUrl && logoUrl.trim()) {
        const u = logoUrl.trim();
        normalizedLogo = /^https?:\/\//i.test(u) ? u : 'https://' + u;
      }

      const notionRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DB_BUSINESS },
          properties: {
            'Name': { title: [{ text: { content: name.trim() } }] },
            'Email': { email: email.trim().toLowerCase() },
            'Status': { status: { name: 'Update Request' } },
            ...(phone && { 'Phone': { phone_number: phone } }),
            ...(normalizedUrl && { 'URL': { url: normalizedUrl } }),
            ...(address && { 'Address': { rich_text: [{ text: { content: address } }] } }),
            ...(description && { 'Description': { rich_text: [{ text: { content: description } }] } }),
            ...(normalizedLogo && { 'Logo URL': { url: normalizedLogo } }),
            ...(category && { 'Category': { select: { name: category } } }),
          },
        }),
      });

      if (!notionRes.ok) {
        const err = await notionRes.json();
        console.error('Notion error creating update request:', err);
        return res.status(500).json({ success: false, error: 'Failed to submit update' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('update-listing POST error:', err.message);
      return res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
