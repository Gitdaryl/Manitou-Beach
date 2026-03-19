// Fetch public event details needed for vendor registration page
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing event id' });

  try {
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!pageRes.ok) return res.status(404).json({ error: 'Event not found' });

    const page = await pageRes.json();
    const p = page.properties;

    const getProp = (key, type) => {
      if (!p[key]) return null;
      if (type === 'title') return p[key].title?.[0]?.plain_text || null;
      if (type === 'text') return p[key].rich_text?.[0]?.plain_text || null;
      if (type === 'date') return p[key].date?.start || null;
      if (type === 'number') return p[key].number ?? null;
      if (type === 'checkbox') return p[key].checkbox ?? false;
      if (type === 'url') return p[key].url || null;
      return null;
    };

    const vendorRegEnabled = getProp('Vendor Reg Enabled', 'checkbox');
    if (!vendorRegEnabled) return res.status(400).json({ error: 'Vendor registration not enabled' });

    const vendorCapacity = getProp('Vendor Capacity', 'number') || 0;

    // Get current confirmed vendor count
    let vendorCount = 0;
    if (process.env.NOTION_DB_VENDOR_REGISTRATIONS) {
      const countRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_VENDOR_REGISTRATIONS}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Event ID', rich_text: { equals: id } },
              { property: 'Status', select: { equals: 'Confirmed' } },
            ],
          },
        }),
      });
      if (countRes.ok) {
        const countData = await countRes.json();
        vendorCount = countData.results?.length || 0;
      }
    }

    const event = {
      id,
      name: getProp('Name', 'title') || getProp('Event Name', 'title') || 'Event',
      date: getProp('Date', 'date'),
      time: getProp('Time', 'text'),
      location: getProp('Location', 'text'),
      vendorRegEnabled,
      vendorCapacity,
      vendorFee: getProp('Vendor Fee', 'number') || 0,
      organizerName: getProp('Organizer Name', 'text'),
      organizerLogoUrl: getProp('Organizer Logo URL', 'url'),
      vendorPortalToken: getProp('Vendor Portal Token', 'text'),
      // organizerEmail intentionally excluded from public endpoint
    };

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ event, vendorCount });

  } catch (err) {
    console.error('vendor-event fetch error:', err);
    return res.status(500).json({ error: 'Failed to load event' });
  }
}
