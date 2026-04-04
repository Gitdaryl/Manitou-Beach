// /api/extract-events.js
// "Magic Upload" - accepts an image (photo of chalkboard, screenshot of FB post, flyer)
// or pasted text, uses Claude to extract structured event data, and creates
// Pending records in the Events Notion database for Daryl to review & publish.
//
// No SMS verification required - this is a concierge intake, not self-serve.
// Events land as "Pending" so Daryl approves before they go live.

import Anthropic from '@anthropic-ai/sdk';

const EVENT_CATEGORIES = [
  'Live Music', 'Food & Social', 'Sports & Outdoors',
  'Community', 'Arts & Culture', 'Markets & Vendors', 'Other',
];

const EXTRACTION_PROMPT = `You are an event data extractor for a community calendar in Manitou Beach, Michigan.

Extract ALL events from the provided content. For each event, return a JSON object with these fields:

- eventName (string, required) - the name/title of the event
- date (string, YYYY-MM-DD format if possible, or "unknown" if not clear)
- dateEnd (string, YYYY-MM-DD if multi-day, otherwise null)
- timeStart (string, HH:MM in 24h format, or null)
- timeEnd (string, HH:MM in 24h format, or null)
- location (string, or null) - venue name and/or address
- description (string) - a short natural description of the event
- cost (string, or null) - e.g. "$5", "Free", "$10 cover"
- recurring (string) - one of: "None", "Weekly", "Monthly", "Annual"
- recurringDay (string or null) - day of week if recurring (e.g. "Thursday")
- category (string) - best fit from: ${EVENT_CATEGORIES.join(', ')}

IMPORTANT RULES:
- Extract EVERY event you can find, even partial ones.
- If a date says something like "every Thursday" that's recurring Weekly on Thursday.
- If the year isn't specified, assume 2026.
- If you see "tonight", "tomorrow", "this Saturday" etc., try to infer the date but if you can't, use "unknown".
- For time, convert to 24h format (e.g. "7pm" → "19:00").
- Return a JSON array of event objects. Nothing else - no markdown, no explanation.
- If you cannot extract any events, return an empty array: []

TRIBUTE BAND LABELING (for bar/venue entertainment schedules):
- When the source material is a bar, venue, or entertainment schedule (chalkboard, poster, social media post listing bands on specific nights), apply these rules:
- Bands marked with an asterisk (*) or explicitly noted as original acts should be treated as original - use their name as-is.
- All other bands on the schedule are likely tribute acts. For these, format the eventName as: "[Band Name] - [Original Artist] Tribute"
  Examples: "Kashmir - Led Zeppelin Tribute", "Rumours - Fleetwood Mac Tribute", "One - Metallica Tribute"
- If the band name IS a famous original artist name (e.g. just "Led Zeppelin" on a bar board with no asterisk), it's almost certainly a tribute - label it: "Led Zeppelin Tribute"
- If the band name is clearly a tribute band name (e.g. "Get The Led Out", "Kashmir", "Rumours"), label as: "[Name] - [Original Artist] Tribute"
- If you genuinely cannot tell whether a band is a tribute or original (ambiguous name, no clear context), leave the name as-is - do not guess.
- Do NOT apply tribute labeling to community events, festivals, markets, or non-entertainment-venue sources - only bar/venue band schedules.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageData, imageType, text, businessName, businessEmail, businessPhone } = req.body || {};

  if (!imageData && !text?.trim()) {
    return res.status(400).json({ error: 'Please upload an image or paste some text.' });
  }

  // Admin-only for now - Daryl is the one running this intake
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Not authorized.' });
  }

  try {
    // ── Step 1: Extract events using Claude ──
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const messages = [];
    const content = [];

    if (imageData) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageType || 'image/jpeg',
          data: imageData,
        },
      });
      content.push({
        type: 'text',
        text: `Extract all events from this image. The business is "${businessName || 'unknown'}".`,
      });
    } else {
      content.push({
        type: 'text',
        text: `Extract all events from this text. The business is "${businessName || 'unknown'}".\n\n---\n${text}`,
      });
    }

    messages.push({ role: 'user', content });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: EXTRACTION_PROMPT,
      messages,
    });

    const raw = response.content[0]?.text || '[]';

    // Parse the JSON - handle markdown code fences and any surrounding text
    let events;
    try {
      // Strip code fences
      let cleaned = raw.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
      // If there's text before the array, find the first [
      const arrStart = cleaned.indexOf('[');
      const arrEnd = cleaned.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1) {
        cleaned = cleaned.slice(arrStart, arrEnd + 1);
      }
      events = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('extract-events: Failed to parse Claude response:', raw.slice(0, 500));
      return res.status(500).json({ error: 'Could not parse events from the content. Try a clearer image or paste the text instead.', debug: raw.slice(0, 300) });
    }

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(200).json({ ok: true, count: 0, message: 'No events found in the content.' });
    }

    // ── Step 2: Create Pending records in Notion ──
    const notionToken = process.env.NOTION_TOKEN_EVENTS;
    const dbId = process.env.NOTION_DB_EVENTS;
    const created = [];
    const errors = [];

    for (const evt of events) {
      const properties = {
        'Event Name': { title: [{ text: { content: (evt.eventName || 'Untitled Event').slice(0, 200) } }] },
        'Status': { status: { name: 'Pending' } },
        'Source': { select: { name: 'Quick Upload' } },
      };

      // Date
      if (evt.date && evt.date !== 'unknown') {
        const dateObj = { start: evt.date };
        if (evt.dateEnd) dateObj.end = evt.dateEnd;
        properties['Event date'] = { date: dateObj };
      }

      // Time
      const timeParts = [evt.timeStart, evt.timeEnd].filter(Boolean);
      if (timeParts.length) {
        properties['Time End'] = { rich_text: [{ text: { content: timeParts.join(' – ') } }] };
      }

      // Location
      if (evt.location) {
        properties['Location'] = { rich_text: [{ text: { content: evt.location.slice(0, 200) } }] };
      }

      // Description - include business attribution
      const descParts = [];
      if (evt.description) descParts.push(evt.description);
      if (businessName) descParts.push(`Submitted by: ${businessName}`);
      if (descParts.length) {
        properties['Description'] = { rich_text: [{ text: { content: descParts.join('\n').slice(0, 2000) } }] };
      }

      // Cost
      if (evt.cost) {
        properties['Cost'] = { rich_text: [{ text: { content: evt.cost } }] };
      }

      // Recurring
      if (evt.recurring && evt.recurring !== 'None') {
        properties['Recurring'] = { select: { name: evt.recurring } };
      }
      if (evt.recurringDay) {
        properties['Recurring Day'] = { select: { name: evt.recurringDay } };
      }

      // Category
      if (evt.category && EVENT_CATEGORIES.includes(evt.category)) {
        properties['Category'] = { select: { name: evt.category } };
      }

      // Attendance - default to just_show_up
      properties['Attendance'] = { select: { name: 'just_show_up' } };

      // Business contact info
      if (businessEmail) properties['Email'] = { email: businessEmail };
      if (businessPhone) properties['Phone'] = { phone_number: businessPhone };
      if (businessName) properties['Organizer Name'] = { rich_text: [{ text: { content: businessName } }] };

      try {
        const notionRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${notionToken}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({ parent: { database_id: dbId }, properties }),
        });

        if (notionRes.ok) {
          created.push(evt.eventName);
        } else {
          const errText = await notionRes.text();
          console.error(`extract-events: Notion error for "${evt.eventName}":`, errText);
          errors.push(evt.eventName);
        }
      } catch (notionErr) {
        console.error(`extract-events: Notion request failed for "${evt.eventName}":`, notionErr.message);
        errors.push(evt.eventName);
      }
    }

    return res.status(200).json({
      ok: true,
      count: created.length,
      events: created,
      errors: errors.length > 0 ? errors : undefined,
      message: `Found ${events.length} event${events.length === 1 ? '' : 's'}. ${created.length} added to the calendar for review.`,
    });
  } catch (err) {
    console.error('extract-events error:', err.message);
    return res.status(500).json({ error: 'Something went wrong processing the events. Please try again.' });
  }
}
