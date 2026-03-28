// /api/food-trucks.js
// GET  — returns all Active food trucks (with last check-in time)
// POST — truck checks in; verifies slug + token, then updates Notion record

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    let allResults = [];
    let cursor = undefined;

    do {
      const body = {
        filter: { property: 'Status', select: { equals: 'Active' } },
        sorts: [{ property: 'Name', direction: 'ascending' }],
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      };

      const response = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        console.error('Food Trucks Notion query failed:', await response.text());
        return res.status(200).json({ trucks: [] });
      }

      const data = await response.json();
      allResults = allResults.concat(data.results);
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    const trucks = allResults
      .map(page => {
        const p = page.properties;
        const name = p['Name']?.title?.[0]?.text?.content || '';
        if (!name) return null;
        const tierRaw = p['Tier']?.select?.name || 'Basic';
        return {
          id: page.id,
          name,
          tier: tierRaw.toLowerCase() === 'featured' ? 'featured' : 'basic',
          slug: p['Slug']?.rich_text?.[0]?.text?.content || '',
          description: (p['Description']?.rich_text?.[0]?.text?.content || '')
            .split('\n').filter(l => !l.startsWith('Contact Email:') && !l.startsWith('Image URL:')).join('\n').trim(),
          phone: p['Phone']?.phone_number || '',
          website: p['Website']?.url || '',
          photoUrl: p['Photo URL']?.url || '',
          cuisine: p['Cuisine']?.select?.name || '',
          lat: p['Lat']?.number ?? null,
          lng: p['Lng']?.number ?? null,
          locationNote: p['Location Note']?.rich_text?.[0]?.text?.content || '',
          lastCheckin: p['Last Checkin']?.date?.start || null,
          scheduleNote: p['Schedule Note']?.rich_text?.[0]?.text?.content || '',
          todaysSpecial: p['Todays Special']?.rich_text?.[0]?.text?.content || '',
          departureTime: p['Departure Time']?.rich_text?.[0]?.text?.content || '',
          comingDate: p['Coming Date']?.date?.start || null,
          comingEventId: p['Coming Event ID']?.rich_text?.[0]?.text?.content || null,
          comingEventName: p['Coming Event Name']?.rich_text?.[0]?.text?.content || null,
          pinColor: p['Pin Color']?.rich_text?.[0]?.text?.content || '',
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Featured trucks first, then basic; alpha within each group
        if (a.tier === b.tier) return a.name.localeCompare(b.name);
        return a.tier === 'featured' ? -1 : 1;
      });

    return res.status(200).json({ trucks });
  } catch (err) {
    console.error('Food Trucks GET error:', err.message);
    return res.status(200).json({ trucks: [] });
  }
}

async function handlePost(req, res) {
  try {
    const { slug, token, action, comingDate, scheduleNote, lat, lng, note, todaysSpecial, departureTime, pinColor } = req.body || {};

    if (!slug || !token) {
      return res.status(400).json({ error: 'slug and token are required' });
    }

    // Find the truck by slug
    const queryBody = {
      filter: {
        and: [
          { property: 'Slug', rich_text: { equals: slug } },
          { property: 'Status', select: { equals: 'Active' } },
        ],
      },
      page_size: 1,
    };

    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(queryBody),
      }
    );

    if (!queryRes.ok) {
      console.error('Food Trucks lookup failed:', await queryRes.text());
      return res.status(500).json({ error: 'Lookup failed' });
    }

    const queryData = await queryRes.json();
    if (!queryData.results?.length) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    const page = queryData.results[0];
    const storedToken = page.properties['Checkin Token']?.rich_text?.[0]?.text?.content || '';

    if (storedToken !== token) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // ── CHECKOUT — truck is done for the day, pull the pin ──
    if (action === 'checkout') {
      try {
        const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            properties: {
              'Last Checkin': { date: null },
              'Departure Time': { rich_text: [{ type: 'text', text: { content: '' } }] },
              'Todays Special': { rich_text: [{ type: 'text', text: { content: '' } }] },
              'Location Note': { rich_text: [{ type: 'text', text: { content: '' } }] },
            },
          }),
        });
        if (!patchRes.ok) console.error('Checkout PATCH failed:', await patchRes.text());
      } catch (err) {
        console.error('Checkout error:', err.message);
      }
      return res.status(200).json({ ok: true });
    }

    // ── PIN COLOR UPDATE — quick patch just for pin color ──
    if (action === 'update-pin-color') {
      try {
        const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({ properties: { 'Pin Color': { rich_text: [{ type: 'text', text: { content: (pinColor || '').slice(0, 20) } }] } } }),
        });
        if (!patchRes.ok) console.error('Pin color PATCH failed:', await patchRes.text());
      } catch (err) {
        console.error('Pin color update error:', err.message);
      }
      return res.status(200).json({ ok: true });
    }

    // ── SCHEDULE ACTION — only patches Coming Date ──
    if (action === 'schedule') {
      const updateProps = {
        'Coming Date': comingDate ? { date: { start: comingDate } } : { date: null },
        'Schedule Note': { rich_text: [{ type: 'text', text: { content: (scheduleNote || '').slice(0, 200) } }] },
        'Coming Event ID': { rich_text: [{ text: { content: '' } }] },
        'Coming Event Name': { rich_text: [{ text: { content: '' } }] },
      };
      const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties: updateProps }),
      });
      if (!patchRes.ok) {
        console.error('Food Trucks schedule PATCH failed:', await patchRes.text());
        return res.status(500).json({ error: 'Schedule update failed' });
      }
      return res.status(200).json({ ok: true, comingDate: comingDate || null });
    }

    // Update the truck's location and last check-in time
    const updateProps = {
      'Last Checkin': { date: { start: new Date().toISOString() } },
      'Location Note': { rich_text: [{ type: 'text', text: { content: note || '' } }] },
      'Todays Special': { rich_text: [{ type: 'text', text: { content: (todaysSpecial || '').slice(0, 200) } }] },
      'Departure Time': { rich_text: [{ type: 'text', text: { content: (departureTime || '').slice(0, 50) } }] },
    };

    if (typeof lat === 'number' && typeof lng === 'number') {
      updateProps['Lat'] = { number: lat };
      updateProps['Lng'] = { number: lng };
    }

    const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties: updateProps }),
    });

    if (!patchRes.ok) {
      console.error('Food Trucks PATCH failed:', await patchRes.text());
      return res.status(500).json({ error: 'Check-in failed' });
    }

    // Best-effort pin color update — separate call so it doesn't block check-in
    if (pinColor) {
      fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ properties: { 'Pin Color': { rich_text: [{ type: 'text', text: { content: pinColor.slice(0, 20) } }] } } }),
      }).catch(err => console.error('Pin color update failed (non-blocking):', err.message));
    }

    return res.status(200).json({ ok: true, name: page.properties['Name']?.title?.[0]?.text?.content || slug });
  } catch (err) {
    console.error('Food Trucks POST error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
}
