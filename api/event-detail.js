// GET /api/event-detail?id=[notion-page-id]
// Returns a single event by Notion page ID with full field set.

const HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Notion-Version': '2022-06-28',
};

function normalizeUrl(url) {
  if (!url || url === 'null' || url === 'undefined') return null;
  try {
    const u = url.trim();
    if (!u.startsWith('http')) return `https://${u}`;
    return u;
  } catch { return null; }
}

function parseTimeRange(raw) {
  if (!raw) return { start: '', end: '' };
  const sep = raw.indexOf(' – ');
  if (sep !== -1) return { start: raw.slice(0, sep).trim(), end: raw.slice(sep + 3).trim() };
  return { start: raw.trim(), end: '' };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });

  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate');

  try {
    // Fetch the page and its blocks in parallel
    const [pageRes, blocksRes] = await Promise.all([
      fetch(`https://api.notion.com/v1/pages/${id}`, { headers: HEADERS }),
      fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=50`, { headers: HEADERS }),
    ]);

    if (!pageRes.ok) {
      return res.status(pageRes.status === 404 ? 404 : 500).json({ error: 'Event not found' });
    }

    const page = await pageRes.json();
    const blocksData = blocksRes.ok ? await blocksRes.json() : { results: [] };
    const p = page.properties;

    // Parse time range from Time End field (which stores "start – end" or just start)
    const timeRaw = p['Time End']?.rich_text?.[0]?.text?.content || '';
    const timeRange = parseTimeRange(timeRaw);

    // Parse description - may be multi-line stored as one block
    const description = p['Description']?.rich_text?.map(t => t.plain_text).join('') || '';

    // Additional detail blocks (if organizer wrote a longer description)
    const detailBlocks = (blocksData.results || [])
      .filter(b => b.type === 'paragraph')
      .map(b => b.paragraph?.rich_text?.map(t => t.plain_text).join('') || '')
      .filter(Boolean);

    const event = {
      id: page.id,
      name: p['Event Name']?.title?.[0]?.plain_text || '',
      date: p['Event date']?.date?.start || null,
      dateEnd: p['Event date']?.date?.end || null,
      timeStart: timeRange.start,
      timeEnd: timeRange.end,
      location: p['Location']?.rich_text?.[0]?.text?.content || '',
      description,
      detailBlocks,
      cost: p['Cost']?.rich_text?.[0]?.text?.content || null,
      imageUrl: normalizeUrl(p['Image URL']?.url || null),
      eventUrl: normalizeUrl(p['Event URL']?.url || null),
      organizerName: p['Organizer Name']?.rich_text?.[0]?.text?.content || null,
      category: p['Category']?.rich_text?.[0]?.text?.content || 'Community',
      attendance: p['Attendance']?.select?.name || 'just_show_up',
      rsvpEnabled: p['RSVP Enabled']?.checkbox || false,
      rsvpCapacity: p['RSVP Capacity']?.number || null,
      ticketsEnabled: p['Tickets Enabled']?.checkbox || false,
      ticketPrice: p['Ticket Price']?.number || null,
      ticketCapacity: p['Ticket Capacity']?.number || null,
      ctaLabel: p['CTA Label']?.select?.name || null,
      recurring: p['Recurring']?.select?.name || null,
      status: p['Status']?.status?.name || null,
    };

    // Only serve Approved or Published events publicly
    if (event.status && !['Approved', 'Published'].includes(event.status)) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ event });
  } catch (err) {
    console.error('event-detail error:', err.message);
    return res.status(500).json({ error: 'Failed to load event' });
  }
}
