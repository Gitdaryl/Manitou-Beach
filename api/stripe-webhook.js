import Stripe from 'stripe';
import { Resend } from 'resend';
import { put } from '@vercel/blob';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const getRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

// Shared helper — update a Notion page property by querying business name
async function updateNotionBusiness(businessName, properties) {
  const searchRes = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: { property: 'Name', title: { equals: businessName } }
    })
  });
  const data = await searchRes.json();
  if (data.results && data.results.length > 0) {
    const pageId = data.results[0].id;
    await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties })
    });
    return pageId;
  }
  return null;
}

// Generate a unique ticket number: MB-XXXXXX (6 uppercase alphanumeric)
function generateTicketNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
  let id = 'MB-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// Generate printable ticket PDF with QR code + Code 128 barcode
async function generateTicketPDF({ ticketId, eventName, eventDate, eventTime, eventLocation, buyerName, quantity }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 400]); // landscape-ish ticket
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const dark = rgb(0.11, 0.16, 0.19);     // night
  const accent = rgb(0.36, 0.49, 0.58);    // lakeBlue
  const muted = rgb(0.54, 0.49, 0.43);     // warmGray
  const white = rgb(1, 1, 1);
  const cream = rgb(0.98, 0.96, 0.94);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 400, color: cream });

  // Header bar
  page.drawRectangle({ x: 0, y: 340, width: 612, height: 60, color: dark });
  page.drawText('MANITOU BEACH', { x: 24, y: 362, size: 16, font: helveticaBold, color: white });
  page.drawText('EVENT TICKET', { x: 612 - 24 - helveticaBold.widthOfTextAtSize('EVENT TICKET', 12), y: 365, size: 12, font: helveticaBold, color: accent });

  // Event name
  const nameSize = eventName.length > 35 ? 18 : 22;
  page.drawText(eventName, { x: 24, y: 305, size: nameSize, font: helveticaBold, color: dark, maxWidth: 360 });

  // Event details
  let detailY = 275;
  if (eventDate) {
    page.drawText(eventDate, { x: 24, y: detailY, size: 13, font: helveticaBold, color: accent });
    detailY -= 18;
  }
  if (eventTime) {
    page.drawText(eventTime, { x: 24, y: detailY, size: 12, font: helvetica, color: muted });
    detailY -= 18;
  }
  if (eventLocation) {
    page.drawText(eventLocation, { x: 24, y: detailY, size: 12, font: helvetica, color: muted });
    detailY -= 18;
  }

  // Buyer info
  detailY -= 10;
  page.drawText(`Admit: ${buyerName}`, { x: 24, y: detailY, size: 12, font: helveticaBold, color: dark });
  detailY -= 18;
  page.drawText(`Quantity: ${quantity}`, { x: 24, y: detailY, size: 11, font: helvetica, color: muted });

  // Ticket number (large, human-readable)
  page.drawText(ticketId, { x: 24, y: 50, size: 20, font: helveticaBold, color: dark });
  page.drawText('Print this page and bring it with you', { x: 24, y: 28, size: 9, font: helvetica, color: muted });

  // QR code (right side)
  const verifyUrl = `https://manitoubeach.com/check-in?ticket=${ticketId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: '#1A2830', light: '#FAF6EF' } });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  page.drawImage(qrImage, { x: 430, y: 160, width: 140, height: 140 });

  // Code 128 barcode (below QR)
  try {
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: 'code128',
      text: ticketId,
      scale: 3,
      height: 12,
      includetext: false,
    });
    const barcodeImage = await pdfDoc.embedPng(barcodeBuffer);
    const barcodeWidth = 160;
    const barcodeHeight = 36;
    page.drawImage(barcodeImage, { x: 420, y: 115, width: barcodeWidth, height: barcodeHeight });
  } catch (err) {
    console.error('Barcode generation error:', err.message);
  }

  // Barcode label
  const ticketIdWidth = helvetica.widthOfTextAtSize(ticketId, 9);
  page.drawText(ticketId, { x: 420 + (160 - ticketIdWidth) / 2, y: 100, size: 9, font: helvetica, color: muted });

  // Dashed tear line
  for (let y = 340; y > 0; y -= 8) {
    page.drawRectangle({ x: 405, y, width: 1, height: 4, color: muted });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Create ticket record in Notion Tickets DB
async function createTicketInNotion({ ticketId, eventId, eventName, buyerName, email, phone, quantity, stripePaymentId, pdfUrl, ticketPartner }) {
  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: process.env.NOTION_DB_TICKETS },
      properties: {
        'Ticket ID':         { title: [{ text: { content: ticketId } }] },
        'Event Name':        { rich_text: [{ text: { content: eventName } }] },
        'Event Page ID':     { rich_text: [{ text: { content: eventId } }] },
        'Buyer Name':        { rich_text: [{ text: { content: buyerName } }] },
        'Email':             { email: email },
        'Phone':             { phone_number: phone || null },
        'Quantity':          { number: quantity },
        'Status':            { select: { name: 'Valid' } },
        'Stripe Payment ID': { rich_text: [{ text: { content: stripePaymentId } }] },
        'PDF URL':           { url: pdfUrl },
        'Created At':        { date: { start: new Date().toISOString() } },
        ...(ticketPartner ? { 'Ticket Partner': { rich_text: [{ text: { content: ticketPartner } }] } } : {}),
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion ticket creation failed: ${err.message || JSON.stringify(err)}`);
  }
  return res.json();
}

// Increment Tickets Sold count on the Event record
async function incrementSoldCount(eventId, additionalQty) {
  // Fetch current sold count
  const getRes = await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Notion-Version': '2022-06-28',
    },
  });
  if (!getRes.ok) return;
  const page = await getRes.json();
  const currentSold = page.properties['Tickets Sold']?.number || 0;

  await fetch(`https://api.notion.com/v1/pages/${eventId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      properties: {
        'Tickets Sold': { number: currentSold + additionalQty },
      },
    }),
  });
}

// Log a promo or wine partner purchase to Website Inquiries DB
async function logPurchaseToNotion(name, details) {
  try {
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_WEBSITE_INQUIRIES },
        properties: {
          'Name':         { title: [{ text: { content: name } }] },
          'Notes':        { rich_text: [{ text: { content: details } }] },
          'Submitted At': { date: { start: new Date().toISOString() } },
          'Status':       { select: { name: 'Paid' } },
        },
      }),
    });
  } catch (err) {
    console.error('logPurchaseToNotion error:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe env vars.');
    return res.status(500).send('Webhook unconfigured');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── checkout.session.completed ──────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    // 1. Business Listing subscription checkout
    if (metadata.businessName && metadata.type === 'listing') {
      const businessName = metadata.businessName;
      const tierId = metadata.tier;

      let statusName = 'Listed Enhanced';
      if (tierId === 'premium') statusName = 'Listed Premium';
      if (tierId === 'featured') statusName = 'Listed Featured';
      if (tierId === 'food_truck_founding') statusName = 'Listed Featured';

      try {
        const pageId = await updateNotionBusiness(businessName, {
          'Status': { status: { name: statusName } }
        });
        if (pageId) {
          console.log(`Successfully upgraded ${businessName} to ${statusName} in Notion.`);
        } else {
          console.error(`Webhook Error: Business "${businessName}" not found in Notion to upgrade.`);
        }
      } catch (err) {
        console.error('Notion Webhook Fulfillment Error:', err);
      }
    }

    // 2. Featured placement one-time payment (/featured page)
    if (metadata.businessName && !metadata.type && metadata.days) {
      const businessName = metadata.businessName;
      const days = parseInt(metadata.days, 10);
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const expiresISO = expires.toISOString().split('T')[0]; // YYYY-MM-DD
      try {
        const pageId = await updateNotionBusiness(businessName, {
          'Status': { status: { name: 'Listed Featured' } },
          'Featured Expires': { date: { start: expiresISO } },
        });
        if (pageId) {
          console.log(`ONE-TIME upgrade: ${businessName} (${metadata.tier}, ${days} days, expires ${expiresISO})`);
        }
      } catch (err) {
        console.error('Notion Webhook Fulfillment Error:', err);
      }
    }

    // 3. Event/Advertising promo purchase (from create-promo-checkout.js)
    if (metadata.eventName) {
      const { eventName, tier, days, promoPages, notes } = metadata;
      const details = [
        `Promo tier: ${tier}`,
        days && days !== 'n/a' ? `Duration: ${days} days` : null,
        promoPages ? `Pages: ${promoPages}` : null,
        notes ? `Notes: ${notes}` : null,
        `Stripe Payment: ${session.payment_intent || session.id}`,
        `Amount: $${(session.amount_total / 100).toFixed(2)}`,
      ].filter(Boolean).join('\n');

      await logPurchaseToNotion(`Promo: ${eventName} — ${tier}`, details);
      console.log(`Promo purchase recorded: ${eventName} — ${tier}`);
    }

    // 4. Ticket purchase (from ticket-checkout.js)
    if (metadata.type === 'ticket' && metadata.eventId) {
      const ticketId = metadata.ticketId || generateTicketNumber();
      const quantity = parseInt(metadata.quantity, 10) || 1;
      try {
        // Generate printable PDF
        const pdfBuffer = await generateTicketPDF({
          ticketId,
          eventName: metadata.eventName || 'Event',
          eventDate: metadata.eventDate || '',
          eventTime: metadata.eventTime || '',
          eventLocation: metadata.eventLocation || '',
          buyerName: metadata.buyerName || 'Guest',
          quantity,
        });

        // Store PDF in Vercel Blob
        const { url: pdfUrl } = await put(`tickets/${ticketId}.pdf`, pdfBuffer, {
          access: 'public',
          contentType: 'application/pdf',
        });

        // Create ticket record in Notion
        await createTicketInNotion({
          ticketId,
          eventId: metadata.eventId,
          eventName: metadata.eventName || 'Event',
          buyerName: metadata.buyerName || 'Guest',
          email: session.customer_email || session.customer_details?.email || '',
          phone: metadata.phone || '',
          quantity,
          stripePaymentId: session.payment_intent || session.id,
          pdfUrl,
          ticketPartner: metadata.ticketPartner || '',
        });

        // Increment sold count on the event
        await incrementSoldCount(metadata.eventId, quantity);

        // Send confirmation email with PDF download link
        const buyerEmail = session.customer_email || session.customer_details?.email;
        if (buyerEmail && process.env.RESEND_API_KEY) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const eventDateLine = [metadata.eventDate, metadata.eventTime].filter(Boolean).join(' · ');
            await resend.emails.send({
              from: 'Yetickets <tickets@yetigroove.com>',
              to: buyerEmail,
              subject: `Your ticket for ${metadata.eventName || 'the event'} — ${ticketId}`,
              html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
                  <img src="https://manitoubeach.com/images/yeti/yetickets_sign.png" alt="Yetickets" style="width:200px;margin-bottom:24px;" />
                  <h1 style="color:#1A2830;font-size:22px;margin:0 0 8px;">You're in! 🎉</h1>
                  <p style="color:#5C5248;font-size:15px;margin:0 0 24px;">
                    Here's your ticket for <strong>${metadata.eventName || 'the event'}</strong>.
                    ${eventDateLine ? `<br/>${eventDateLine}` : ''}
                    ${metadata.eventLocation ? `<br/>${metadata.eventLocation}` : ''}
                  </p>

                  <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                    <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Ticket ID</p>
                    <p style="margin:0 0 16px;color:#1A2830;font-size:24px;font-weight:700;letter-spacing:2px;">${ticketId}</p>
                    <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</p>
                    <p style="margin:0 0 16px;color:#1A2830;font-size:15px;">${metadata.buyerName || 'Guest'}</p>
                    <p style="margin:0 0 4px;color:#8C806E;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Quantity</p>
                    <p style="margin:0;color:#1A2830;font-size:15px;">${quantity}</p>
                  </div>

                  <a href="${pdfUrl}" style="display:inline-block;background:#1A2830;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:24px;">
                    Download &amp; Print Ticket
                  </a>

                  <p style="color:#8C806E;font-size:13px;line-height:1.6;">
                    Show this ticket (printed or on your phone) at the door. The QR code will be scanned for entry.<br/><br/>
                    Lost your ticket? Reply to this email or visit <a href="https://manitoubeach.com" style="color:#5B7D8E;">manitoubeach.com</a> to retrieve it.
                  </p>
                </div>
              `,
            });
            console.log(`Ticket email sent to ${buyerEmail} for ${ticketId}`);
          } catch (emailErr) {
            console.error('Ticket email send error:', emailErr.message);
          }
        }
        // TODO: Send confirmation SMS (after A2P approval)

        console.log(`Ticket sold: ${ticketId} — ${metadata.eventName} x${quantity} for ${metadata.buyerName}${metadata.ticketPartner ? ` (Partner: ${metadata.ticketPartner})` : ''} — PDF: ${pdfUrl}`);
      } catch (err) {
        console.error('Ticket fulfillment error:', err);
      }
    }

    // 5. Wine partner signup (from wine-partner-signup.js)
    if (metadata.venueName) {
      const { venueName, contactName, phone, note } = metadata;
      const details = [
        `Wine Trail Partner — 2026 Season`,
        `Venue: ${venueName}`,
        `Contact: ${contactName}`,
        phone ? `Phone: ${phone}` : null,
        note ? `Note: ${note}` : null,
        `Stripe Payment: ${session.payment_intent || session.id}`,
        `Amount: $${(session.amount_total / 100).toFixed(2)}`,
      ].filter(Boolean).join('\n');

      await logPurchaseToNotion(`Wine Partner: ${venueName} — PAID`, details);
      console.log(`Wine partner payment recorded: ${venueName}`);
    }
  }

  // ── customer.subscription.deleted ───────────────────────────
  // Fires when a subscriber cancels (end of billing period) or is removed
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const metadata = subscription.metadata || {};
    if (metadata.businessName && metadata.type === 'listing') {
      try {
        const pageId = await updateNotionBusiness(metadata.businessName, {
          'Status': { status: { name: 'Cancelled' } }
        });
        if (pageId) {
          console.log(`Subscription cancelled: ${metadata.businessName} → Cancelled`);
        }
      } catch (err) {
        console.error('Subscription cancellation Notion error:', err);
      }
    }
  }

  // ── invoice.payment_failed ──────────────────────────────────
  // Fires when a recurring payment fails (expired card, insufficient funds)
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    // Try to get metadata from the subscription
    if (invoice.subscription) {
      try {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription);
        const metadata = sub.metadata || {};
        if (metadata.businessName && metadata.type === 'listing') {
          const pageId = await updateNotionBusiness(metadata.businessName, {
            'Status': { status: { name: 'Payment Failed' } }
          });
          if (pageId) {
            console.log(`Payment failed: ${metadata.businessName} → Payment Failed`);
          }
        }
      } catch (err) {
        console.error('Payment failed Notion error:', err);
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
}
