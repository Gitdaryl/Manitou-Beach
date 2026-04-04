// POST /api/vendor-status
// Organizer approve/reject for vendor event applications
// Body: { registrationId, status, token, eventId }
// Auth: Vendor Portal Token (same as vendor-blast.js)

import { sendSMS, normalizePhone } from './lib/twilio.js';

const NOTION_EVENTS_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

const NOTION_BUSINESS_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { registrationId, status, token, eventId } = req.body || {};

  if (!registrationId || !status || !token || !eventId) {
    return res.status(400).json({ error: 'Missing required fields: registrationId, status, token, eventId' });
  }

  if (status !== 'Confirmed' && status !== 'Rejected') {
    return res.status(400).json({ error: 'Status must be "Confirmed" or "Rejected"' });
  }

  try {
    // 1. Validate token against event's Vendor Portal Token
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!pageRes.ok) return res.status(404).json({ error: 'Event not found' });

    const page = await pageRes.json();
    const ep = page.properties;
    const storedToken = ep['Vendor Portal Token']?.rich_text?.[0]?.plain_text;
    if (!storedToken || storedToken !== token) {
      return res.status(403).json({ error: 'Invalid access token' });
    }

    const eventName = ep['Name']?.title?.[0]?.plain_text || ep['Event Name']?.title?.[0]?.plain_text || 'Event';
    const eventDate = ep['Date']?.date?.start || null;
    const eventLocation = ep['Location']?.rich_text?.[0]?.plain_text || '';

    // 2. Fetch the registration record
    const regRes = await fetch(`https://api.notion.com/v1/pages/${registrationId}`, {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Notion-Version': '2022-06-28',
      },
    });
    if (!regRes.ok) return res.status(404).json({ error: 'Registration not found' });

    const reg = await regRes.json();
    const rp = reg.properties;

    // 3. Verify registration belongs to this event
    const regEventId = rp['Event ID']?.rich_text?.[0]?.plain_text || '';
    if (regEventId !== eventId) {
      return res.status(400).json({ error: 'Registration does not belong to this event' });
    }

    const vendorName = rp['Vendor Name']?.rich_text?.[0]?.plain_text || 'Vendor';
    const vendorPhone = rp['Phone']?.phone_number || '';
    const notes = rp['Notes']?.rich_text?.[0]?.plain_text || '';

    // 4. PATCH registration status
    const patchRes = await fetch(`https://api.notion.com/v1/pages/${registrationId}`, {
      method: 'PATCH',
      headers: NOTION_EVENTS_HEADERS,
      body: JSON.stringify({
        properties: { Status: { select: { name: status } } },
      }),
    });
    if (!patchRes.ok) {
      console.error('vendor-status: PATCH registration failed:', await patchRes.text());
      return res.status(500).json({ error: 'Failed to update registration status' });
    }

    // 5. Food-truck-specific: update Coming Event fields on truck record
    const foodTruckMatch = notes.match(/^food-truck:(.+)$/);
    if (foodTruckMatch) {
      const slug = foodTruckMatch[1];
      await handleFoodTruckFields(slug, status, eventId, eventName, eventDate);
    }

    // 6. Send status SMS to vendor (best-effort, works for all vendor types)
    if (vendorPhone) {
      const digits = normalizePhone(vendorPhone);
      if (digits.length === 10) {
        const dateLine = eventDate
          ? new Date(eventDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : '';

        let smsBody;
        if (status === 'Confirmed') {
          const parts = [`Great news - you're confirmed for ${eventName}!`];
          if (dateLine) parts.push(dateLine);
          if (eventLocation) parts.push(eventLocation);
          parts.push('See you there! - Manitou Beach');
          smsBody = parts.join('\n');
        } else {
          smsBody = `Hey - thanks for your interest in ${eventName}! This one's full, but we'd love to have you at a future event. We'll keep you in the loop. - Manitou Beach`;
        }

        sendSMS(digits, smsBody).catch(() => {});
      }
    }

    console.log(`vendor-status: ${vendorName} → ${status} for ${eventName} (${eventId})`);

    return res.status(200).json({ ok: true, status, vendorName });

  } catch (err) {
    console.error('vendor-status error:', err.message);
    return res.status(500).json({ error: 'Status update failed. Please try again.' });
  }
}

/**
 * Food-truck-specific: set or clear Coming Event fields on the truck record.
 * Only called when registration Notes contains food-truck:{slug}.
 */
async function handleFoodTruckFields(slug, status, eventId, eventName, eventDate) {
  try {
    // Look up truck by slug
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`,
      {
        method: 'POST',
        headers: NOTION_BUSINESS_HEADERS,
        body: JSON.stringify({
          filter: { property: 'Slug', rich_text: { equals: slug } },
          page_size: 1,
        }),
      }
    );
    if (!queryRes.ok) return;
    const data = await queryRes.json();
    if (!data.results?.length) return;

    const truck = data.results[0];
    let patchProps;

    if (status === 'Confirmed') {
      patchProps = {
        'Coming Event ID': { rich_text: [{ text: { content: eventId } }] },
        'Coming Event Name': { rich_text: [{ text: { content: eventName } }] },
      };
      if (eventDate) {
        patchProps['Coming Date'] = { date: { start: eventDate } };
      }
    } else {
      // Rejected - clear Coming Event fields only if they match this event
      const currentEventId = truck.properties['Coming Event ID']?.rich_text?.[0]?.text?.content || '';
      if (currentEventId !== eventId) return; // different event, don't clear
      patchProps = {
        'Coming Event ID': { rich_text: [] },
        'Coming Event Name': { rich_text: [] },
        'Coming Date': { date: null },
      };
    }

    await fetch(`https://api.notion.com/v1/pages/${truck.id}`, {
      method: 'PATCH',
      headers: NOTION_BUSINESS_HEADERS,
      body: JSON.stringify({ properties: patchProps }),
    });
  } catch (err) {
    console.error('vendor-status: food truck field update failed:', err.message);
  }
}
