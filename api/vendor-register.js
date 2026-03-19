import { Resend } from 'resend';
import { put } from '@vercel/blob';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Generate a unique vendor ID: VND-XXXXXX
function generateVendorId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'VND-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// Fetch event details from Notion by page ID
async function fetchEventDetails(eventId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
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
    if (type === 'url') return p[key].url || null;
    if (type === 'email') return p[key].email || null;
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
    vendorFee: getProp('Vendor Fee', 'number') || 0,
    organizerName: getProp('Organizer Name', 'text'),
    organizerLogoUrl: getProp('Organizer Logo URL', 'url'),
    organizerEmail: getProp('Organizer Email', 'email'),
    vendorPortalToken: getProp('Vendor Portal Token', 'text'),
  };
}

// Count confirmed vendors for an event
async function getVendorCount(eventId) {
  if (!process.env.NOTION_DB_VENDOR_REGISTRATIONS) return 0;
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_VENDOR_REGISTRATIONS}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
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

// Create vendor record in Notion
async function createVendorInNotion({ vendorId, vendorName, contactName, email, phone, boothType, notes, eventId, eventName, pdfUrl }) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DB_VENDOR_REGISTRATIONS },
      properties: {
        'Vendor ID':       { title: [{ text: { content: vendorId } }] },
        'Vendor Name':     { rich_text: [{ text: { content: vendorName } }] },
        'Contact Name':    { rich_text: [{ text: { content: contactName } }] },
        'Email':           { email: email },
        'Phone':           { phone_number: phone || null },
        'Booth Type':      { rich_text: [{ text: { content: boothType } }] },
        'Notes':           { rich_text: [{ text: { content: notes || '' } }] },
        'Event ID':        { rich_text: [{ text: { content: eventId } }] },
        'Event Name':      { rich_text: [{ text: { content: eventName } }] },
        'Status':          { select: { name: 'Confirmed' } },
        'Fee Paid':        { number: 0 },
        'Receipt PDF URL': { url: pdfUrl },
        'Registered At':   { date: { start: new Date().toISOString() } },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion vendor creation failed: ${err.message || JSON.stringify(err)}`);
  }
  return res.json();
}

// Generate vendor receipt PDF
async function generateVendorReceipt({ vendorId, vendorName, contactName, boothType, eventName, eventDate, eventTime, eventLocation, organizerName, fee }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 360]);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const dark = rgb(0.11, 0.16, 0.19);
  const accent = rgb(0.36, 0.49, 0.58);
  const muted = rgb(0.54, 0.49, 0.43);
  const white = rgb(1, 1, 1);
  const cream = rgb(0.98, 0.96, 0.94);
  const sage = rgb(0.29, 0.49, 0.33);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 360, color: cream });

  // Header bar — organizer branded
  page.drawRectangle({ x: 0, y: 300, width: 612, height: 60, color: dark });
  const orgDisplay = (organizerName || 'Event Organizer').toUpperCase();
  const orgSize = orgDisplay.length > 28 ? 13 : 16;
  page.drawText(orgDisplay, { x: 24, y: 322, size: orgSize, font: helveticaBold, color: white });
  page.drawText('VENDOR REGISTRATION', { x: 612 - 24 - helveticaBold.widthOfTextAtSize('VENDOR REGISTRATION', 11), y: 325, size: 11, font: helveticaBold, color: accent });

  // Confirmed badge
  page.drawRectangle({ x: 24, y: 262, width: 90, height: 22, color: sage });
  page.drawText('✓  CONFIRMED', { x: 30, y: 268, size: 9, font: helveticaBold, color: white });

  // Event name
  const nameSize = eventName.length > 40 ? 16 : 20;
  page.drawText(eventName, { x: 24, y: 238, size: nameSize, font: helveticaBold, color: dark, maxWidth: 420 });

  // Event details
  let detailY = 210;
  if (eventDate) {
    page.drawText(eventDate, { x: 24, y: detailY, size: 12, font: helveticaBold, color: accent });
    detailY -= 18;
  }
  if (eventTime) {
    page.drawText(eventTime, { x: 24, y: detailY, size: 11, font: helvetica, color: muted });
    detailY -= 18;
  }
  if (eventLocation) {
    page.drawText(eventLocation, { x: 24, y: detailY, size: 11, font: helvetica, color: muted });
    detailY -= 18;
  }

  // Divider
  page.drawRectangle({ x: 24, y: detailY - 6, width: 564, height: 1, color: rgb(0.88, 0.84, 0.78) });
  detailY -= 24;

  // Vendor info
  page.drawText('VENDOR', { x: 24, y: detailY, size: 9, font: helveticaBold, color: muted, letterSpacing: 1.5 });
  detailY -= 16;
  page.drawText(vendorName, { x: 24, y: detailY, size: 15, font: helveticaBold, color: dark });
  detailY -= 18;
  page.drawText(`Contact: ${contactName}`, { x: 24, y: detailY, size: 11, font: helvetica, color: muted });
  detailY -= 16;
  page.drawText(`Booth / Category: ${boothType}`, { x: 24, y: detailY, size: 11, font: helvetica, color: muted });

  // Fee
  const feeText = fee > 0 ? `Booth Fee: $${fee}` : 'Complimentary Registration';
  page.drawText(feeText, { x: 24, y: 28, size: 10, font: helveticaBold, color: sage });

  // Confirmation ID (right column)
  page.drawText('CONFIRMATION', { x: 400, y: detailY + 34, size: 9, font: helveticaBold, color: muted });
  page.drawText(vendorId, { x: 400, y: detailY + 16, size: 18, font: helveticaBold, color: dark });
  page.drawText('Present at vendor check-in', { x: 400, y: detailY, size: 9, font: helvetica, color: muted, maxWidth: 190 });

  // Powered by
  const pwText = 'Powered by Yetickets';
  page.drawText(pwText, { x: 612 - 24 - helvetica.widthOfTextAtSize(pwText, 8), y: 10, size: 8, font: helvetica, color: muted });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { vendorName, contactName, email, phone, boothType, notes, eventId } = req.body;

  if (!vendorName || !contactName || !email || !eventId) {
    return res.status(400).json({ error: 'Missing required fields: vendorName, contactName, email, eventId' });
  }

  try {
    // 1. Fetch event details
    const event = await fetchEventDetails(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.vendorRegEnabled) return res.status(400).json({ error: 'Vendor registration is not enabled for this event' });

    // 2. Check capacity
    if (event.vendorCapacity > 0) {
      const currentCount = await getVendorCount(eventId);
      if (currentCount >= event.vendorCapacity) {
        return res.status(400).json({ error: 'Vendor registration is full for this event' });
      }
    }

    // 3. Generate vendor ID
    const vendorId = generateVendorId();

    // 4. Generate receipt PDF
    const pdfBuffer = await generateVendorReceipt({
      vendorId,
      vendorName,
      contactName,
      boothType: boothType || 'General',
      eventName: event.name,
      eventDate: event.date,
      eventTime: event.time,
      eventLocation: event.location,
      organizerName: event.organizerName,
      fee: event.vendorFee || 0,
    });

    // 5. Upload to Vercel Blob
    const blob = await put(`vendors/${vendorId}.pdf`, pdfBuffer, { access: 'public', contentType: 'application/pdf' });

    // 6. Create Notion record
    await createVendorInNotion({
      vendorId, vendorName, contactName, email,
      phone: phone || '',
      boothType: boothType || 'General',
      notes: notes || '',
      eventId,
      eventName: event.name,
      pdfUrl: blob.url,
    });

    // 7. Send confirmation email to vendor
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const eventDateLine = [event.date, event.time].filter(Boolean).join(' · ');
      const orgName = event.organizerName || event.name;

      try {
        await resend.emails.send({
          from: `${orgName} <tickets@yetigroove.com>`,
          to: email,
          subject: `Vendor registration confirmed — ${event.name} (${vendorId})`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
              <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">You're registered!</h1>
              <p style="color:#5C5248;font-size:15px;margin:0 0 24px;">
                Your vendor spot for <strong>${event.name}</strong> is confirmed.
                ${eventDateLine ? `<br/>${eventDateLine}` : ''}
                ${event.location ? `<br/>${event.location}` : ''}
              </p>
              <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Confirmation ID</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:24px;font-weight:700;letter-spacing:2px;">${vendorId}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Business</p>
                <p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${vendorName}</p>
                <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booth / Category</p>
                <p style="margin:0;color:#1A2830;font-size:15px;">${boothType || 'General'}</p>
              </div>
              <a href="${blob.url}" style="display:inline-block;background:#1A2830;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:24px;">
                Download Your Receipt
              </a>
              <p style="color:#8C806E;font-size:13px;line-height:1.6;">
                Bring this receipt (printed or on your phone) to the vendor check-in booth on the day of the event.
                The organizer may send you additional information about load-in times, parking, and setup before the event.
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error('Vendor confirmation email error:', emailErr.message);
      }

      // 8. Notify organizer
      if (event.organizerEmail) {
        try {
          const currentCount = await getVendorCount(eventId);
          const capacityLine = event.vendorCapacity > 0
            ? `${currentCount} of ${event.vendorCapacity} vendor spots filled.`
            : `${currentCount} vendor${currentCount !== 1 ? 's' : ''} registered.`;

          await resend.emails.send({
            from: 'Yetickets <tickets@yetigroove.com>',
            to: event.organizerEmail,
            subject: `New vendor registered: ${vendorName} — ${event.name}`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
                <h2 style="color:#1A2830;font-size:18px;margin:0 0 16px;">New vendor registration</h2>
                <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Business</p>
                  <p style="margin:0 0 12px;color:#1A2830;font-size:16px;font-weight:600;">${vendorName}</p>
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Contact</p>
                  <p style="margin:0 0 12px;color:#1A2830;font-size:14px;">${contactName} — ${email}${phone ? ` · ${phone}` : ''}</p>
                  <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Booth / Category</p>
                  <p style="margin:0;color:#1A2830;font-size:14px;">${boothType || 'General'}</p>
                </div>
                <p style="color:#4A7A5A;font-size:15px;font-weight:600;margin:0 0 24px;">${capacityLine}</p>
                ${event.vendorPortalToken ? `<p style="color:#5C5248;font-size:13px;">View all vendors: <a href="${process.env.SITE_URL || 'https://manitoubeach.com'}/vendor-portal?token=${event.vendorPortalToken}&event=${eventId}" style="color:#5B7D8E;">Open Vendor Portal →</a></p>` : ''}
              </div>
            `,
          });
        } catch (orgEmailErr) {
          console.error('Organizer notification email error:', orgEmailErr.message);
        }
      }
    }

    return res.status(200).json({ success: true, vendorId, pdfUrl: blob.url, eventName: event.name });

  } catch (err) {
    console.error('Vendor registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}
