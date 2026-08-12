// /api/event-edit.js
// GET  ?token=X   → the event's current values, for the edit form
// POST { token, ...fields, baseline, as, t }
//                 → saves, refusing to silently clobber someone else's change
//
// Shared calendars made the clobber real: two people can now open the same
// event, and Notion's last_edited_time is only minute-granular, so a timestamp
// check would miss the case it exists for. Instead the form sends back the
// values it originally loaded, and we only reject a field when the stored copy
// has moved away from that baseline AND this editor is changing it. Two people
// editing different fields both succeed, which is what you'd want.

import { normalizePhone } from './lib/twilio.js';
import { validToken } from './lib/organizer-links.js';
import { notifyLinkedOrganizers, lifecycleMessage } from './lib/organizer-notify.js';

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

// Single source of truth for reading an event, so the values the form loads
// and the values we compare against on save can never drift apart.
function readEventFields(page) {
  const p = page.properties;
  const rawTime = p['Time End']?.rich_text?.[0]?.text?.content || '';
  return {
    name: p['Event Name']?.title?.[0]?.text?.content || '',
    date: p['Event date']?.date?.start || '',
    time: rawTime.includes('–') ? rawTime.split('–')[0].trim() : rawTime,
    timeEnd: rawTime.includes('–') ? rawTime.split('–')[1].trim() : '',
    location: p['Location']?.rich_text?.[0]?.text?.content || '',
    description: p['Description']?.rich_text?.[0]?.text?.content || '',
    cost: p['Cost']?.rich_text?.[0]?.text?.content || '',
    eventUrl: p['Event URL']?.url || '',
    imageUrl: p['Image URL']?.url || '',
    attendance: p['Attendance']?.select?.name || '',
    category: p['Category']?.rich_text?.[0]?.text?.content || '',
    lifecycle: p['Lifecycle']?.select?.name || 'Active',
    changeNote: p['Change Note']?.rich_text?.[0]?.text?.content || '',
  };
}

const GUARDED = ['name', 'date', 'time', 'timeEnd', 'location', 'description', 'cost', 'eventUrl', 'attendance', 'lifecycle'];

const FIELD_LABELS = {
  name: 'Event name', date: 'Date', time: 'Start time', timeEnd: 'End time',
  location: 'Location', description: 'Description', cost: 'Cost',
  eventUrl: 'Ticket link', attendance: 'Attendance', lifecycle: 'Status',
};

// A conflict is only a conflict if BOTH of us touched the same field.
function findConflicts(current, baseline, incoming) {
  const conflicts = [];
  for (const key of GUARDED) {
    if (incoming[key] === undefined) continue;
    const base = baseline[key] ?? '';
    const mine = incoming[key] ?? '';
    const theirs = current[key] ?? '';
    if (String(mine) === String(base)) continue;   // I didn't change it
    if (String(theirs) === String(base)) continue; // they didn't either
    if (String(mine) === String(theirs)) continue; // we happened to agree
    conflicts.push({ field: key, label: FIELD_LABELS[key] || key, theirs, mine });
  }
  return conflicts;
}

export default async function handler(req, res) {
  // GET - fetch event data by token
  if (req.method === 'GET') {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });

    try {
      const page = await findEventByToken(token);
      if (!page) return res.status(404).json({ error: 'Event not found or token invalid' });
      return res.status(200).json({ id: page.id, ...readEventFields(page) });
    } catch (err) {
      console.error('Event edit GET error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // POST - update event fields by token
  if (req.method === 'POST') {
    const {
      token, name, time, timeEnd, location, description, cost, eventUrl, imageUrl,
      attendance, date, lifecycle, changeNote,
      baseline,     // what the form loaded, for conflict detection
      force,        // "keep mine" after being shown the conflict
      as, t,        // who's editing, when they came in from a shared list
    } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    try {
      const page = await findEventByToken(token);
      if (!page) return res.status(404).json({ error: 'Event not found or token invalid' });

      const current = readEventFields(page);

      if (baseline && !force) {
        const conflicts = findConflicts(current, baseline, req.body);
        if (conflicts.length) {
          return res.status(409).json({
            error: 'Someone else changed this while you had it open.',
            conflicts,
            current,
          });
        }
      }

      const properties = { 'Updated': { checkbox: true } };
      // Organizers misspell performer names in the title more than anything else,
      // so the name has to be editable. Ignore blanks - never wipe the title.
      if (typeof name === 'string' && name.trim()) {
        properties['Event Name'] = { title: [{ text: { content: name.trim().slice(0, 200) } }] };
      }
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

      // A cancellation is the one change the rest of the crew can't afford to
      // miss - people turn up at the door otherwise. No cooldown on these.
      if (lifecycle && lifecycle !== 'Active' && lifecycle !== current.lifecycle) {
        // Who did it: the viewer's own number when they came from a shared
        // list, otherwise the number the event was submitted under. Either way
        // the actor is excluded from their own notification.
        const viewer = normalizePhone(as || '');
        const actor = (viewer.length === 10 && validToken(viewer, t))
          ? viewer
          : normalizePhone(page.properties['Phone']?.phone_number || '');

        await notifyLinkedOrganizers({
          fromPhone: actor,
          urgent: true,
          message: lifecycleMessage({
            fromPhone: actor,
            eventName: name?.trim() || current.name,
            eventDate: date || current.date,
            lifecycle,
            changeNote,
          }),
        });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Event edit POST error:', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
