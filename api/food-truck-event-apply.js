// POST /api/food-truck-event-apply
// Food truck applies to an event via vendor registration system
// Body: { slug, token, eventId }
// Auth: slug + checkin token (same as food-trucks.js POST)

import { sendSMS, normalizePhone } from './lib/twilio.js';
import { Resend } from 'resend';

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

function generateVendorId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'VND-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

async function fetchEventDetails(eventId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Notion-Version': '2022-06-28',
    },
  });
  if (!res.ok) return null;
  const page = await res.json();
  const p = page.properties;

  const getProp = (key, type) => {
    if (!p[key]) return null;
    if (type === 'title') return p[key].title?.[0]?.plain_text || null;
    if (type === 'text') return p[key].rich_text?.[0]?.plain_text || null;
    if (type === 'date') return p[key].date?.start || null;
    if (type === 'number') return p[key].number ?? null;
    if (type === 'checkbox') return p[key].checkbox ?? false;
    return null;
  };

  return {
    id: eventId,
    name: getProp('Name', 'title') || getProp('Event Name', 'title') || 'Event',
    date: getProp('Date', 'date'),
    time: getProp('Time', 'text'),
    location: getProp('Location', 'text'),
    vendorRegEnabled: getProp('Vendor Reg Enabled', 'checkbox'),
    vendorCapacity: getProp('Vendor Capacity', 'number') || 0,
    organizerName: getProp('Organizer Name', 'text'),
    organizerEmail: getProp('Organizer Email', 'text'),
    organizerPhone: getProp('Organizer Phone', 'text'),
    vendorPortalToken: getProp('Vendor Portal Token', 'text'),
  };
}

async function getVendorCount(eventId) {
  if (!process.env.NOTION_DB_VENDOR_REGISTRATIONS) return 0;
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_VENDOR_REGISTRATIONS}/query`, {
    method: 'POST',
    headers: NOTION_EVENTS_HEADERS,
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Event ID', rich_text: { equals: eventId } },
          { property: 'Status', select: { equals: 'Confirmed' } },
        ],
      },
    }),
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return data.results?.length || 0;
}

async function checkDuplicateApplication(eventId, slug) {
  if (!process.env.NOTION_DB_VENDOR_REGISTRATIONS) return false;
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_VENDOR_REGISTRATIONS}/query`, {
    method: 'POST',
    headers: NOTION_EVENTS_HEADERS,
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Event ID', rich_text: { equals: eventId } },
          { property: 'Notes', rich_text: { contains: `food-truck:${slug}` } },
        ],
      },
    }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.results?.length > 0;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { slug, token, eventId } = req.body || {};

  if (!slug || !token || !eventId) {
    return res.status(400).json({ error: 'Missing required fields: slug, token, eventId' });
  }

  try {
    // 1. Auth: find truck by slug + validate checkin token
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`,
      {
        method: 'POST',
        headers: NOTION_BUSINESS_HEADERS,
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Slug', rich_text: { equals: slug } },
              { property: 'Status', select: { equals: 'Active' } },
            ],
          },
          page_size: 1,
        }),
      }
    );

    if (!queryRes.ok) {
      console.error('Food truck lookup failed:', await queryRes.text());
      return res.status(500).json({ error: 'Lookup failed' });
    }

    const queryData = await queryRes.json();
    if (!queryData.results?.length) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    const truck = queryData.results[0];
    const storedToken = truck.properties['Checkin Token']?.rich_text?.[0]?.text?.content || '';

    if (storedToken !== token) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Extract truck profile
    const truckName = truck.properties['Name']?.title?.[0]?.text?.content || 'Food Truck';
    const truckPhone = truck.properties['Phone']?.phone_number || '';
    const truckEmail = truck.properties['Email']?.email || '';
    const truckCuisine = truck.properties['Cuisine']?.rich_text?.[0]?.text?.content || '';

    // 2. Fetch event details
    const event = await fetchEventDetails(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.vendorRegEnabled) {
      return res.status(400).json({ error: 'Vendor registration is not open for this event.' });
    }

    // 3. Check capacity
    if (event.vendorCapacity > 0) {
      const currentCount = await getVendorCount(eventId);
      if (currentCount >= event.vendorCapacity) {
        return res.status(400).json({ error: 'Vendor registration is full for this event.' });
      }
    }

    // 4. Check for duplicate application
    const alreadyApplied = await checkDuplicateApplication(eventId, slug);
    if (alreadyApplied) {
      return res.status(200).json({ ok: true, duplicate: true, eventName: event.name, message: 'You already applied to this event.' });
    }

    // 5. Create Vendor Registration record
    const vendorId = generateVendorId();
    const boothType = truckCuisine ? `Food Truck — ${truckCuisine}` : 'Food Truck';

    const createRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: NOTION_EVENTS_HEADERS,
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_VENDOR_REGISTRATIONS },
        properties: {
          'Vendor ID':     { title: [{ text: { content: vendorId } }] },
          'Vendor Name':   { rich_text: [{ text: { content: truckName } }] },
          'Contact Name':  { rich_text: [{ text: { content: truckName } }] },
          'Email':         { email: truckEmail || null },
          'Phone':         { phone_number: truckPhone || null },
          'Booth Type':    { rich_text: [{ text: { content: boothType } }] },
          'Notes':         { rich_text: [{ text: { content: `food-truck:${slug}` } }] },
          'Event ID':      { rich_text: [{ text: { content: eventId } }] },
          'Event Name':    { rich_text: [{ text: { content: event.name } }] },
          'Status':        { select: { name: 'Pending' } },
          'Fee Paid':      { number: 0 },
          'Registered At': { date: { start: new Date().toISOString() } },
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('Vendor registration creation failed:', err);
      return res.status(500).json({ error: 'Failed to create registration.' });
    }

    // 6. Send "pending review" SMS to truck (best-effort)
    // Coming Event fields are NOT set here — they're set on organizer approval via vendor-status.js
    if (truckPhone) {
      const digits = normalizePhone(truckPhone);
      if (digits.length === 10) {
        sendSMS(
          digits,
          `Applied to ${event.name}! The organizer will review your application and you'll get a text when confirmed. — Manitou Beach`
        ).catch(() => {});
      }
    }

    // 7. Notify organizer of new application (best-effort)
    const siteUrl = process.env.SITE_URL || 'https://manitoubeach.yetigroove.com';
    const portalUrl = event.vendorPortalToken
      ? `${siteUrl}/vendor-portal?token=${event.vendorPortalToken}&event=${eventId}`
      : null;

    // Organizer SMS
    if (event.organizerPhone) {
      const orgDigits = normalizePhone(event.organizerPhone);
      if (orgDigits.length === 10) {
        const sms = portalUrl
          ? `${truckName} wants to join ${event.name} — review in your vendor portal:\n${portalUrl}`
          : `${truckName} wants to join ${event.name} — check your vendor portal to review.`;
        sendSMS(orgDigits, sms).catch(() => {});
      }
    }

    // Organizer email
    if (event.organizerEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const orgName = event.organizerName || event.name;
      resend.emails.send({
        from: `Manitou Beach <tickets@yetigroove.com>`,
        to: event.organizerEmail,
        subject: `New vendor application: ${truckName} → ${event.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
            <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8C806E;margin-bottom:8px;">Vendor Application</div>
            <h2 style="color:#1A2830;font-size:20px;margin:0 0 16px;">${truckName} wants to join ${event.name}</h2>
            <div style="font-size:15px;color:#3A3028;line-height:1.7;">
              <strong>Booth type:</strong> ${truckCuisine ? `Food Truck — ${truckCuisine}` : 'Food Truck'}<br/>
              ${truckEmail ? `<strong>Email:</strong> ${truckEmail}<br/>` : ''}
              ${truckPhone ? `<strong>Phone:</strong> ${truckPhone}<br/>` : ''}
            </div>
            ${portalUrl ? `
            <div style="margin-top:24px;">
              <a href="${portalUrl}" style="display:inline-block;padding:12px 28px;background:#1A2830;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">Review in Vendor Portal</a>
            </div>` : ''}
            <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E8E0D5;">
              <p style="font-size:12px;color:#8C806E;margin:0;">This application is pending your review.</p>
            </div>
          </div>
        `,
      }).catch(() => {});
    }

    console.log(`Food truck event apply: ${truckName} (${slug}) → ${event.name} (${eventId}), vendor ID: ${vendorId}`);

    return res.status(200).json({
      ok: true,
      vendorId,
      eventName: event.name,
      eventDate: event.date || null,
      status: 'pending',
    });

  } catch (err) {
    console.error('food-truck-event-apply error:', err.message);
    return res.status(500).json({ error: 'Application failed. Please try again.' });
  }
}
