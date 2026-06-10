function normalizeUrl(url) {
  if (!url || !url.trim()) return null;
  const u = url.trim();
  return /^https?:\/\//i.test(u) ? u : 'https://' + u;
}

function notionHeaders() {
  return {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
}

async function findEventByToken(token) {
  const response = await fetch(
    `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
    {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: { property: 'Edit Token', rich_text: { equals: token } },
        page_size: 1,
      }),
    }
  );
  if (!response.ok) {
    console.error('event-edit: Notion query failed:', response.status, await response.text());
    return null;
  }
  const data = await response.json();
  return data.results?.[0] || null;
}

export default async function handler(req, res) {
  // GET - fetch event data by token
  if (req.method === 'GET') {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });

    try {
      const page = await findEventByToken(token);
      if (!page) return res.status(404).json({ error: 'Event not found or token invalid' });

      const p = page.properties;
      return res.status(200).json({
        id: page.id,
        name: p['Event Name']?.title?.[0]?.text?.content || '',
        date: p['Event date']?.date?.start || '',
        // Time data is stored in 'Time End' as "start – end" or just "start"
        time: (() => {
          const raw = p['Time End']?.rich_text?.[0]?.text?.content || '';
          return raw.includes('–') ? raw.split('–')[0].trim() : raw;
        })(),
        timeEnd: (() => {
          const raw = p['Time End']?.rich_text?.[0]?.text?.content || '';
          return raw.includes('–') ? raw.split('–')[1].trim() : '';
        })(),
        location: p['Location']?.rich_text?.[0]?.text?.content || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        cost: p['Cost']?.rich_text?.[0]?.text?.content || '',
        eventUrl: p['Event URL']?.url || '',
        imageUrl: p['Image URL']?.url || '',
        attendance: p['Attendance']?.select?.name || '',
        category: p['Category']?.rich_text?.[0]?.text?.content || '',
        lifecycle: p['Lifecycle']?.select?.name || 'Active',
        changeNote: p['Change Note']?.rich_text?.[0]?.text?.content || '',
      });
    } catch (err) {
      console.error('Event edit GET error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // POST - update event fields by token
  if (req.method === 'POST') {
    const { token, time, timeEnd, location, description, cost, eventUrl, imageUrl, attendance, date, lifecycle, changeNote } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    try {
      const page = await findEventByToken(token);
      if (!page) return res.status(404).json({ error: 'Event not found or token invalid' });

      const properties = { 'Updated': { checkbox: true } };
      // Lifecycle = organizer-controlled status (Active / Postponed / Cancelled).
      // Tracked separately from the moderation Status so it never affects approval state.
      const LIFECYCLE_VALUES = ['Active', 'Paused', 'Postponed', 'Cancelled'];
      if (lifecycle !== undefined && LIFECYCLE_VALUES.includes(lifecycle)) {
        properties['Lifecycle'] = { select: { name: lifecycle } };
      }
      if (changeNote !== undefined) properties['Change Note'] = { rich_text: [{ text: { content: (changeNote || '').slice(0, 200) } }] };
      // Combine start + end time into 'Time End' property (same format as submit-event.js)
      if (time !== undefined || timeEnd !== undefined) {
        const start = time || '';
        const end = timeEnd || '';
        const combined = start && end ? `${start} – ${end}` : start || end;
        properties['Time End'] = { rich_text: [{ text: { content: combined } }] };
      }
      if (location !== undefined) properties['Location'] = { rich_text: [{ text: { content: location || '' } }] };
      if (description !== undefined) properties['Description'] = { rich_text: [{ text: { content: description || '' } }] };
      if (cost !== undefined) properties['Cost'] = { rich_text: [{ text: { content: cost || '' } }] };
      if (date) properties['Event date'] = { date: { start: date } };
      if (attendance !== undefined) properties['Attendance'] = attendance ? { select: { name: attendance } } : { select: null };

      const normalizedEventUrl = normalizeUrl(eventUrl);
      if (normalizedEventUrl !== undefined && eventUrl !== undefined) {
        try { properties['Event URL'] = { url: normalizedEventUrl }; } catch (_) {}
      }
      const normalizedImageUrl = normalizeUrl(imageUrl);
      if (normalizedImageUrl !== undefined && imageUrl !== undefined) {
        try { properties['Image URL'] = { url: normalizedImageUrl }; } catch (_) {}
      }

      const patchProps = (props) => fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers: notionHeaders(),
        body: JSON.stringify({ properties: props }),
      });

      let updateRes = await patchProps(properties);

      if (!updateRes.ok) {
        const err = await updateRes.json();
        // Lifecycle / Change Note fields may not exist yet - retry without them so core edits still save
        if (/Lifecycle|Change Note|is not a property/i.test(err?.message || '') && (properties['Lifecycle'] || properties['Change Note'])) {
          delete properties['Lifecycle'];
          delete properties['Change Note'];
          updateRes = await patchProps(properties);
        }
        if (!updateRes.ok) {
          console.error('Notion update error:', JSON.stringify(err));
          return res.status(500).json({ error: 'Update failed', notionError: err?.message });
        }
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Event edit POST error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
