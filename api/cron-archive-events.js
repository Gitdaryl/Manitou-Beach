// Nightly cron - archive past one-time events in Event Submissions.
// Skips Weekly/Monthly recurring events (no natural end date).
// Annual and non-recurring events get archived the day after they pass.
// Requires "Archived" to exist as a Status option in the Notion DB.

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = process.env.NOTION_TOKEN_EVENTS;
  const dbId = process.env.NOTION_DB_EVENTS;
  if (!token || !dbId) {
    return res.status(500).json({ error: 'Missing Notion config' });
  }

  const today = new Date().toISOString().split('T')[0];
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    // Paginate through all past non-archived events
    let results = [];
    let startCursor;
    do {
      const body = {
        filter: {
          and: [
            { property: 'Event date', date: { before: today } },
            { property: 'Status', status: { does_not_equal: 'Archived' } },
          ],
        },
      };
      if (startCursor) body.start_cursor = startCursor;

      const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!queryRes.ok) {
        const err = await queryRes.text();
        console.error('Archive events query failed:', err);
        return res.status(500).json({ error: 'Query failed' });
      }

      const data = await queryRes.json();
      results = results.concat(data.results || []);
      startCursor = data.has_more ? data.next_cursor : null;
    } while (startCursor);

    let archived = 0;
    let skipped = 0;

    for (const page of results) {
      const recurring = page.properties['Recurring']?.select?.name;

      // Skip events that repeat on a schedule - they never truly "end"
      if (recurring === 'Weekly' || recurring === 'Monthly') {
        skipped++;
        continue;
      }

      const name = page.properties['Event Name']?.title?.[0]?.text?.content || page.id;

      const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          properties: {
            'Status': { status: { name: 'Archived' } },
          },
        }),
      });

      if (patchRes.ok) {
        console.log(`Archived: ${name}`);
        archived++;
      } else {
        const err = await patchRes.json();
        console.error(`Failed to archive "${name}":`, err?.message);
      }
    }

    return res.status(200).json({ archived, skipped, checked: results.length });
  } catch (err) {
    console.error('Cron archive-events error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
