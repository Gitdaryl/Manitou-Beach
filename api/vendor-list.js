// Token-gated vendor list for organizer portal
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token, event: eventId } = req.query;
  if (!token || !eventId) return res.status(400).json({ error: 'Missing token or event id' });

  try {
    // Validate token against event's Vendor Portal Token
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!pageRes.ok) return res.status(404).json({ error: 'Event not found' });

    const page = await pageRes.json();
    const p = page.properties;
    const storedToken = p['Vendor Portal Token']?.rich_text?.[0]?.plain_text;

    if (!storedToken || storedToken !== token) {
      return res.status(403).json({ error: 'Invalid access token' });
    }

    const eventName = p['Name']?.title?.[0]?.plain_text || p['Event Name']?.title?.[0]?.plain_text || 'Event';
    const vendorCapacity = p['Vendor Capacity']?.number || 0;

    // Fetch all vendors for this event
    if (!process.env.NOTION_DB_VENDOR_REGISTRATIONS) {
      return res.status(200).json({ vendors: [], eventName, vendorCapacity });
    }

    const vendorRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_VENDOR_REGISTRATIONS}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        filter: { property: 'Event ID', rich_text: { equals: eventId } },
        sorts: [{ property: 'Registered At', direction: 'ascending' }],
      }),
    });

    if (!vendorRes.ok) return res.status(500).json({ error: 'Failed to fetch vendors' });
    const vendorData = await vendorRes.json();

    const vendors = vendorData.results.map(v => {
      const vp = v.properties;
      return {
        vendorId: vp['Vendor ID']?.title?.[0]?.plain_text || '',
        vendorName: vp['Vendor Name']?.rich_text?.[0]?.plain_text || '',
        contactName: vp['Contact Name']?.rich_text?.[0]?.plain_text || '',
        email: vp['Email']?.email || '',
        phone: vp['Phone']?.phone_number || '',
        boothType: vp['Booth Type']?.rich_text?.[0]?.plain_text || '',
        notes: vp['Notes']?.rich_text?.[0]?.plain_text || '',
        status: vp['Status']?.select?.name || 'Confirmed',
        registeredAt: vp['Registered At']?.date?.start || '',
        pdfUrl: vp['Receipt PDF URL']?.url || '',
      };
    });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ vendors, eventName, vendorCapacity });

  } catch (err) {
    console.error('vendor-list error:', err);
    return res.status(500).json({ error: 'Failed to load vendor list' });
  }
}
