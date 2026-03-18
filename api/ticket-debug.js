/**
 * One-time debug endpoint — manually runs ticket fulfillment for a Stripe session.
 * Requires ?secret=ADMIN_SECRET to prevent misuse.
 * DELETE after debugging is complete.
 */
import Stripe from 'stripe';
import { Resend } from 'resend';
import { put } from '@vercel/blob';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

async function generateTicketPDF({ ticketId, eventName, eventDate, eventTime, eventLocation, buyerName, quantity }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 400]);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const dark = rgb(0.11, 0.16, 0.19);
  const accent = rgb(0.36, 0.49, 0.58);
  const muted = rgb(0.54, 0.49, 0.43);
  const white = rgb(1, 1, 1);
  const cream = rgb(0.98, 0.96, 0.94);

  page.drawRectangle({ x: 0, y: 0, width: 612, height: 400, color: cream });
  page.drawRectangle({ x: 0, y: 340, width: 612, height: 60, color: dark });
  page.drawText('MANITOU BEACH', { x: 24, y: 362, size: 16, font: helveticaBold, color: white });
  page.drawText('EVENT TICKET', { x: 612 - 24 - helveticaBold.widthOfTextAtSize('EVENT TICKET', 12), y: 365, size: 12, font: helveticaBold, color: accent });

  const nameSize = eventName.length > 35 ? 18 : 22;
  page.drawText(eventName, { x: 24, y: 305, size: nameSize, font: helveticaBold, color: dark, maxWidth: 360 });

  let detailY = 275;
  if (eventDate) { page.drawText(eventDate, { x: 24, y: detailY, size: 13, font: helveticaBold, color: accent }); detailY -= 18; }
  if (eventTime) { page.drawText(eventTime, { x: 24, y: detailY, size: 12, font: helvetica, color: muted }); detailY -= 18; }
  if (eventLocation) { page.drawText(eventLocation, { x: 24, y: detailY, size: 12, font: helvetica, color: muted }); detailY -= 18; }

  detailY -= 10;
  page.drawText(`Admit: ${buyerName}`, { x: 24, y: detailY, size: 12, font: helveticaBold, color: dark });
  detailY -= 18;
  page.drawText(`Quantity: ${quantity}`, { x: 24, y: detailY, size: 11, font: helvetica, color: muted });
  page.drawText(ticketId, { x: 24, y: 50, size: 20, font: helveticaBold, color: dark });
  page.drawText('Print this page and bring it with you', { x: 24, y: 28, size: 9, font: helvetica, color: muted });

  const verifyUrl = `https://manitoubeach.com/check-in?ticket=${ticketId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: '#1A2830', light: '#FAF6EF' } });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);
  page.drawImage(qrImage, { x: 430, y: 160, width: 140, height: 140 });

  try {
    const barcodeBuffer = await bwipjs.toBuffer({ bcid: 'code128', text: ticketId, scale: 3, height: 12, includetext: false });
    const barcodeImage = await pdfDoc.embedPng(barcodeBuffer);
    page.drawImage(barcodeImage, { x: 420, y: 115, width: 160, height: 36 });
  } catch (err) {
    // barcode optional
  }

  const ticketIdWidth = helvetica.widthOfTextAtSize(ticketId, 9);
  page.drawText(ticketId, { x: 420 + (160 - ticketIdWidth) / 2, y: 100, size: 9, font: helvetica, color: muted });
  for (let y = 340; y > 0; y -= 8) { page.drawRectangle({ x: 405, y, width: 1, height: 4, color: muted }); }

  return Buffer.from(await pdfDoc.save());
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const { session_id, secret } = req.query;
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  const log = [];
  const step = (msg) => { log.push(msg); console.log('[ticket-debug]', msg); };

  try {
    step('1. Fetching Stripe session...');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    step(`   payment_status=${session.payment_status}, mode=${session.mode}`);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Session not paid', log });
    }

    const metadata = session.metadata || {};
    step(`   metadata.type=${metadata.type}, metadata.ticketId=${metadata.ticketId}`);

    if (metadata.type !== 'ticket') {
      return res.status(400).json({ error: 'Not a ticket session', metadata, log });
    }

    const ticketId = metadata.ticketId;
    const quantity = parseInt(metadata.quantity, 10) || 1;
    const buyerEmail = session.customer_email || session.customer_details?.email || '';

    step(`2. Generating PDF for ${ticketId}...`);
    const pdfBuffer = await generateTicketPDF({
      ticketId,
      eventName: metadata.eventName || 'Event',
      eventDate: metadata.eventDate || '',
      eventTime: metadata.eventTime || '',
      eventLocation: metadata.eventLocation || '',
      buyerName: metadata.buyerName || 'Guest',
      quantity,
    });
    step(`   PDF size: ${pdfBuffer.length} bytes`);

    step('3. Uploading to Vercel Blob...');
    const { url: pdfUrl } = await put(`tickets/${ticketId}.pdf`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    step(`   PDF URL: ${pdfUrl}`);

    step('4. Writing to Notion...');
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
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
          'Event Name':        { rich_text: [{ text: { content: metadata.eventName || 'Event' } }] },
          'Event Page ID':     { rich_text: [{ text: { content: metadata.eventId || '' } }] },
          'Buyer Name':        { rich_text: [{ text: { content: metadata.buyerName || 'Guest' } }] },
          'Email':             { email: buyerEmail },
          'Quantity':          { number: quantity },
          'Status':            { select: { name: 'Valid' } },
          'Stripe Payment ID': { rich_text: [{ text: { content: session.payment_intent || session.id } }] },
          'PDF URL':           { url: pdfUrl },
          'Created At':        { date: { start: new Date().toISOString() } },
        },
      }),
    });
    const notionData = await notionRes.json();
    if (!notionRes.ok) {
      step(`   Notion ERROR: ${JSON.stringify(notionData)}`);
      return res.status(500).json({ error: 'Notion write failed', details: notionData, log });
    }
    step(`   Notion page created: ${notionData.id}`);

    step(`5. Sending email to ${buyerEmail}...`);
    if (!buyerEmail) {
      step('   SKIP: no buyer email');
    } else if (!process.env.RESEND_API_KEY) {
      step('   SKIP: no RESEND_API_KEY');
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error: emailError } = await resend.emails.send({
        from: 'Yetickets <tickets@yetigroove.com>',
        to: buyerEmail,
        subject: `Your ticket for ${metadata.eventName || 'the event'} — ${ticketId}`,
        html: `<p>DEBUG TEST — Ticket ID: <strong>${ticketId}</strong></p><p><a href="${pdfUrl}">Download PDF</a></p>`,
      });
      if (emailError) {
        step(`   Email ERROR: ${JSON.stringify(emailError)}`);
        return res.status(500).json({ error: 'Email failed', details: emailError, pdfUrl, log });
      }
      step(`   Email sent: ${data?.id}`);
    }

    return res.status(200).json({ success: true, ticketId, pdfUrl, email: buyerEmail, log });

  } catch (err) {
    step(`EXCEPTION: ${err.message}`);
    return res.status(500).json({ error: err.message, stack: err.stack, log });
  }
}
