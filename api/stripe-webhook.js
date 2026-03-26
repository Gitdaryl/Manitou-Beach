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

// Notify the first waiting entry in the Sponsor Waitlist for a given page
async function notifyFirstWaitlistEntry(notionToken, pageId, pageLabel) {
  const dbId = process.env.NOTION_DB_SPONSOR_WAITLIST;
  if (!dbId || !pageId) return;
  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({
        filter: { and: [{ property: 'Page ID', select: { equals: pageId } }, { property: 'Status', select: { equals: 'waiting' } }] },
        sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
        page_size: 1,
      }),
    });
    const data = await res.json();
    if (!data.results?.length) return;

    const entry    = data.results[0];
    const entryId  = entry.id;
    const email    = entry.properties['Email']?.email;
    const name     = entry.properties['Name']?.title?.[0]?.plain_text || 'there';
    const bizName  = entry.properties['Business Name']?.rich_text?.[0]?.plain_text || '';
    const siteUrl  = process.env.SITE_URL || 'https://manitou-beach.vercel.app';

    // Mark as notified
    await fetch(`https://api.notion.com/v1/pages/${entryId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${notionToken}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
      body: JSON.stringify({ properties: { 'Status': { select: { name: 'notified' } }, 'Notified At': { date: { start: new Date().toISOString().split('T')[0] } } } }),
    });

    // Send email
    if (email && process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Manitou Beach <hello@manitou-beach.com>',
        to: email,
        subject: `The ${pageLabel} sponsorship spot just opened`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#FAF6EF;">
            <h1 style="color:#1A2830;font-size:22px;font-weight:700;margin:0 0 8px;">Good news, ${name}.</h1>
            <p style="color:#5C5248;font-size:15px;margin:0 0 24px;line-height:1.7;">
              The <strong>${pageLabel}</strong> page sponsorship on Manitou Beach just opened up.
              ${bizName ? `We saved your spot for <strong>${bizName}</strong>.` : ''}
              You're first in line — but spots go fast.
            </p>
            <a href="${siteUrl}/business#page-sponsorship" style="display:inline-block;background:#1A2830;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:28px;">
              Claim the ${pageLabel} Page →
            </a>
            <p style="color:#8C806E;font-size:12px;line-height:1.6;margin:0;">
              $97/month or $970/year. One exclusive sponsor per page, seen by every visitor all year long.<br/>
              If you've changed your mind, just ignore this email.
            </p>
          </div>
        `,
      });
      console.log(`Waitlist notified: ${email} for ${pageLabel}`);
    }
  } catch (err) {
    console.error('notifyFirstWaitlistEntry error:', err.message);
  }
}

// Generate sponsor acknowledgment PDF
async function generateSponsorPDF({ sponsorId, orgName, sponsorName, tierLevel, amount, perks }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 500]);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const dark  = rgb(0.11, 0.16, 0.19);
  const accent = rgb(0.36, 0.49, 0.58);
  const muted = rgb(0.54, 0.49, 0.43);
  const sage  = rgb(0.48, 0.56, 0.44);
  const cream = rgb(0.98, 0.96, 0.94);
  const white = rgb(1, 1, 1);

  // Background
  page.drawRectangle({ x: 0, y: 0, width: 612, height: 500, color: cream });

  // Header bar
  page.drawRectangle({ x: 0, y: 440, width: 612, height: 60, color: dark });
  page.drawText(orgName.toUpperCase(), { x: 24, y: 462, size: 14, font: helveticaBold, color: white });
  page.drawText('SPONSORSHIP ACKNOWLEDGMENT', {
    x: 612 - 24 - helveticaBold.widthOfTextAtSize('SPONSORSHIP ACKNOWLEDGMENT', 10),
    y: 465, size: 10, font: helveticaBold, color: accent,
  });

  // Thank you line
  page.drawText(`Thank you for your support!`, { x: 24, y: 405, size: 18, font: helveticaBold, color: dark });

  // Sponsor name + tier
  page.drawText(`Sponsor: ${sponsorName}`, { x: 24, y: 370, size: 13, font: helveticaBold, color: dark });
  page.drawText(`Tier: ${tierLevel}`, { x: 24, y: 350, size: 12, font: helvetica, color: muted });
  page.drawText(`Amount: $${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, { x: 24, y: 330, size: 13, font: helveticaBold, color: accent });

  // Divider
  page.drawRectangle({ x: 24, y: 312, width: 564, height: 1, color: muted });

  // What's included
  if (perks?.length > 0) {
    page.drawText("What's Included", { x: 24, y: 295, size: 11, font: helveticaBold, color: sage });
    let perkY = 275;
    for (const perk of perks.slice(0, 8)) {
      page.drawText(`✓  ${perk}`, { x: 32, y: perkY, size: 11, font: helvetica, color: dark, maxWidth: 550 });
      perkY -= 18;
    }
  }

  // Confirmation ID + date
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  page.drawText(`Confirmation ID: ${sponsorId}`, { x: 24, y: 70, size: 11, font: helveticaBold, color: dark });
  page.drawText(`Date: ${dateStr}`, { x: 24, y: 52, size: 10, font: helvetica, color: muted });
  page.drawText('This document serves as your sponsorship acknowledgment.', { x: 24, y: 34, size: 9, font: helvetica, color: muted });

  // Powered-by footer
  page.drawText('Powered by Yetickets · yetigroove.com', {
    x: 612 - 24 - helvetica.widthOfTextAtSize('Powered by Yetickets · yetigroove.com', 8),
    y: 20, size: 8, font: helvetica, color: muted,
  });

  return Buffer.from(await pdfDoc.save());
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
  const baseUrl = process.env.SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/check-in?ticket=${ticketId}`;
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

    // 0. Food Truck founding subscription — activate in FOOD_TRUCKS db, not BUSINESS
    if (metadata.tier === 'food_truck_founding' && metadata.businessName) {
      const truckName = metadata.businessName;
      try {
        // Find the truck by name in Food Trucks DB (status should be "Verified" from phone verification)
        const ftQuery = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DB_FOOD_TRUCKS}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
          },
          body: JSON.stringify({
            filter: {
              and: [
                { property: 'Name', title: { equals: truckName } },
                { property: 'Status', select: { equals: 'Verified' } },
              ],
            },
            page_size: 1,
          }),
        });
        const ftData = await ftQuery.json();
        const ftPage = ftData.results?.[0];

        if (ftPage) {
          // Activate the truck
          await fetch(`https://api.notion.com/v1/pages/${ftPage.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
              properties: {
                'Status': { select: { name: 'Active' } },
              },
            }),
          });

          // SMS the check-in link
          const slug = ftPage.properties['Slug']?.rich_text?.[0]?.text?.content || '';
          const token = ftPage.properties['Checkin Token']?.rich_text?.[0]?.text?.content || '';
          const phone = ftPage.properties['Phone']?.phone_number || '';
          const phoneDigits = (phone || '').replace(/\D/g, '').slice(-10);

          if (slug && token && phoneDigits.length >= 10 && process.env.TWILIO_ACCOUNT_SID) {
            const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
            const checkinUrl = `${siteUrl}/food-trucks?truck=${encodeURIComponent(slug)}&token=${encodeURIComponent(token)}`;
            await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
              {
                method: 'POST',
                headers: {
                  Authorization: 'Basic ' + Buffer.from(
                    `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
                  ).toString('base64'),
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  From: process.env.TWILIO_PHONE,
                  To: `+1${phoneDigits}`,
                  Body: `Manitou Beach Food Trucks\n\n${truckName} is live on the map! 🎉\n\nHere's your personal check-in link:\n${checkinUrl}\n\nOpen it each time you head to Manitou Beach. Drop your pin, add today's special, and go live on the map.\n\nSave this to your home screen for quick access.`,
                }).toString(),
              }
            );
          }
          console.log(`Food truck activated: ${truckName}`);
        } else {
          console.error(`Webhook: Food truck "${truckName}" not found in Verified status`);
        }
      } catch (err) {
        console.error('Food truck webhook activation error:', err);
      }
    }

    // 1. Business Listing subscription checkout (non-food-truck)
    if (metadata.businessName && metadata.type === 'listing' && metadata.tier !== 'food_truck_founding') {
      const businessName = metadata.businessName;
      const tierId = metadata.tier;

      let statusName = 'Listed Enhanced';
      if (tierId === 'premium') statusName = 'Listed Premium';
      if (tierId === 'featured') statusName = 'Listed Featured';

      // Beta business: CREATE a new Notion listing row (no existing row to update)
      if (metadata.beta === 'true') {
        try {
          const customerEmail = session.customer_email || session.customer_details?.email || '';
          await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
              'Content-Type': 'application/json',
              'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
              parent: { database_id: process.env.NOTION_DB_BUSINESS },
              properties: {
                'Name':               { title: [{ text: { content: businessName } }] },
                'Email':              { email: customerEmail },
                'Status':             { status: { name: statusName } },
                'Beta':               { checkbox: true },
                'Featured Expires':   { date: { start: '2026-05-10' } },
                'Stripe Customer ID': { rich_text: [{ text: { content: String(session.customer || '') } }] },
              },
            }),
          });
          // Send confirmation email to business owner
          if (customerEmail && process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const tierLabel = tierId.charAt(0).toUpperCase() + tierId.slice(1);
            const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
            resend.emails.send({
              from: 'Manitou Beach <events@yetigroove.com>',
              to: customerEmail,
              subject: `You're on the map — ${businessName} is a Manitou Beach founding business`,
              html: `
                <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228; background: #FAF6EF; padding: 40px 32px; border-radius: 8px;">
                  <p style="font-size: 26px; font-weight: bold; margin: 0 0 8px; color: #1A2830;">You're on the map.</p>
                  <p style="font-size: 15px; color: #6B5F52; margin: 0 0 24px; line-height: 1.7;">
                    <strong>${businessName}</strong> is now a founding business on Manitou Beach — the community platform for Devils Lake, Michigan.
                    When the site opens on <strong>April 10</strong>, every visitor heading to the lake this summer will find you here.
                  </p>
                  <div style="background: #fff; border-radius: 6px; padding: 20px 24px; margin-bottom: 28px; border: 1px solid #E8DFD0;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #8A7E6E; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">Your listing</p>
                    <p style="margin: 0 0 4px; font-size: 18px; font-weight: bold; color: #1A2830;">${businessName}</p>
                    <p style="margin: 0 0 12px; font-size: 14px; color: #D4845A; font-weight: bold;">${tierLabel} Founding Business</p>
                    <p style="margin: 0; font-size: 13px; color: #8A7E6E; line-height: 1.6;">
                      Free through <strong style="color: #3B3228;">May 10</strong> — no charge until then.<br>
                      We'll send you a reminder 5 days before billing starts.
                    </p>
                  </div>
                  <p style="margin: 0 0 28px;">
                    <a href="${siteUrl}/discover" style="background: #1A2830; color: #FAF6EF; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                      See Your Listing →
                    </a>
                  </p>
                  <p style="font-size: 13px; color: #8A7E6E; margin: 0 0 6px; line-height: 1.7;">
                    Want to update your business info, add a logo, or change your tagline? Reply to this email and we'll take care of it.
                  </p>
                  <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 28px 0 16px;">
                  <p style="font-size: 11px; color: #9A8E7E; margin: 0;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
                </div>
              `,
            }).catch(() => {});
          }
          console.log(`Beta listing created: ${businessName} → ${statusName}`);
        } catch (err) {
          console.error('Beta Notion listing creation error:', err);
        }
      } else {
        // Non-beta: update existing Notion row
        try {
          const pageId = await updateNotionBusiness(businessName, {
            'Status': { status: { name: statusName } },
            ...(session.customer && { 'Stripe Customer ID': { rich_text: [{ text: { content: String(session.customer) } }] } }),
          });
          if (pageId) {
            console.log(`Successfully upgraded ${businessName} to ${statusName} in Notion.`);
          } else {
            console.error(`Webhook Error: Business "${businessName}" not found in Notion to upgrade.`);
          }

          // If this is a tier upgrade, cancel any old subscriptions for this customer
          if (metadata.upgrade === 'true' && session.customer && session.subscription) {
            try {
              const subs = await stripe.subscriptions.list({ customer: session.customer, status: 'active' });
              for (const sub of subs.data) {
                if (sub.id !== session.subscription) {
                  await stripe.subscriptions.cancel(sub.id);
                  console.log(`Cancelled old subscription ${sub.id} on upgrade — ${businessName}`);
                }
              }
            } catch (err) {
              console.error('Error cancelling old subscription on upgrade:', err);
            }
          }

          // Send confirmation email
          const customerEmail = session.customer_email || session.customer_details?.email || '';
          if (customerEmail && process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const tierLabel = tierId === 'premium' ? 'Front and Center' : tierId === 'featured' ? 'Highlighted' : 'Showcased';
            const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
            const billingLabel = metadata.billingInterval === 'year' ? '/yr' : '/mo';
            const amount = `$${(session.amount_total / 100).toFixed(0)}${billingLabel}`;

            const isUpgrade = metadata.upgrade === 'true';
            resend.emails.send({
              from: 'Manitou Beach <events@yetigroove.com>',
              to: customerEmail,
              subject: isUpgrade
                ? `Your listing just got an upgrade — ${businessName} is now ${tierLabel}`
                : `Welcome to Manitou Beach — ${businessName} is listed`,
              html: isUpgrade ? `
                <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228; background: #FAF6EF; padding: 40px 32px; border-radius: 8px;">
                  <p style="font-size: 26px; font-weight: bold; margin: 0 0 8px; color: #1A2830;">You're moving up.</p>
                  <p style="font-size: 15px; color: #6B5F52; margin: 0 0 24px; line-height: 1.7;">
                    <strong>${businessName}</strong> has been upgraded to <strong>${tierLabel}</strong> on Manitou Beach.
                    Your previous subscription has been cancelled — nothing else you need to do.
                  </p>
                  <div style="background: #fff; border-radius: 6px; padding: 20px 24px; margin-bottom: 28px; border: 1px solid #E8DFD0;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #8A7E6E; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">Your listing</p>
                    <p style="margin: 0 0 4px; font-size: 18px; font-weight: bold; color: #1A2830;">${businessName}</p>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #D4845A; font-weight: bold;">${tierLabel} · ${amount}</p>
                    <p style="margin: 0; font-size: 13px; color: #8A7E6E; line-height: 1.6;">
                      Cancel anytime — no contracts, no hassle.
                    </p>
                  </div>
                  <p style="margin: 0 0 28px;">
                    <a href="${siteUrl}/discover" style="background: #1A2830; color: #FAF6EF; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                      See Your Listing →
                    </a>
                  </p>
                  <p style="font-size: 13px; color: #8A7E6E; margin: 0 0 6px; line-height: 1.7;">
                    Want to update your info or add a logo? Just reply to this email.
                  </p>
                  <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 28px 0 16px;">
                  <p style="font-size: 11px; color: #9A8E7E; margin: 0;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
                </div>
              ` : `
                <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228; background: #FAF6EF; padding: 40px 32px; border-radius: 8px;">
                  <p style="font-size: 26px; font-weight: bold; margin: 0 0 8px; color: #1A2830;">You're on the map.</p>
                  <p style="font-size: 15px; color: #6B5F52; margin: 0 0 24px; line-height: 1.7;">
                    <strong>${businessName}</strong> is now listed on Manitou Beach — the community hub for Devils Lake, Michigan.
                    Visitors heading to the lake will find you right here.
                  </p>
                  <div style="background: #fff; border-radius: 6px; padding: 20px 24px; margin-bottom: 28px; border: 1px solid #E8DFD0;">
                    <p style="margin: 0 0 8px; font-size: 12px; color: #8A7E6E; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">Your listing</p>
                    <p style="margin: 0 0 4px; font-size: 18px; font-weight: bold; color: #1A2830;">${businessName}</p>
                    <p style="margin: 0 0 4px; font-size: 14px; color: #D4845A; font-weight: bold;">${tierLabel} · ${amount}</p>
                    <p style="margin: 0; font-size: 13px; color: #8A7E6E; line-height: 1.6;">
                      Cancel anytime — no contracts, no hassle.
                    </p>
                  </div>
                  <p style="margin: 0 0 28px;">
                    <a href="${siteUrl}/discover" style="background: #1A2830; color: #FAF6EF; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                      See Your Listing →
                    </a>
                  </p>
                  <p style="font-size: 13px; color: #8A7E6E; margin: 0 0 6px; line-height: 1.7;">
                    Want to update your info, add a logo, or change anything? Just reply to this email. Want more visibility? <a href="${siteUrl}/upgrade-listing" style="color: #4A7A5A;">Upgrade your listing anytime →</a>
                  </p>
                  <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 28px 0 16px;">
                  <p style="font-size: 11px; color: #9A8E7E; margin: 0;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
                </div>
              `,
            }).catch(() => {});
          }
        } catch (err) {
          console.error('Notion Webhook Fulfillment Error:', err);
        }
      }
    }

    // 2. Featured placement one-time payment (/featured page)
    if (metadata.businessName && !metadata.type && metadata.days) {
      const businessName = metadata.businessName;
      const days = parseInt(metadata.days, 10);
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const expiresISO = expires.toISOString().split('T')[0]; // YYYY-MM-DD
      const expiresReadable = expires.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      try {
        const pageId = await updateNotionBusiness(businessName, {
          'Status': { status: { name: 'Listed Featured' } },
          'Featured Expires': { date: { start: expiresISO } },
        });
        if (pageId) {
          console.log(`ONE-TIME upgrade: ${businessName} (${metadata.tier}, ${days} days, expires ${expiresISO})`);
        }
        // Send confirmation email
        const customerEmail = session.customer_email || session.customer_details?.email || '';
        if (customerEmail && process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
          resend.emails.send({
            from: 'Manitou Beach <events@yetigroove.com>',
            to: customerEmail,
            subject: `${businessName} is now Featured on Manitou Beach`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #3B3228; background: #FAF6EF; padding: 40px 32px; border-radius: 8px;">
                <p style="font-size: 26px; font-weight: bold; margin: 0 0 8px; color: #1A2830;">You're featured.</p>
                <p style="font-size: 15px; color: #6B5F52; margin: 0 0 24px; line-height: 1.7;">
                  <strong>${businessName}</strong> now has a spotlight listing on Manitou Beach.
                  Your featured card goes live within 24 hours and stays up through <strong>${expiresReadable}</strong>.
                </p>
                <div style="background: #fff; border-radius: 6px; padding: 20px 24px; margin-bottom: 28px; border: 1px solid #E8DFD0;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #8A7E6E; text-transform: uppercase; letter-spacing: 1px; font-family: sans-serif;">Your placement</p>
                  <p style="margin: 0 0 4px; font-size: 18px; font-weight: bold; color: #1A2830;">${businessName}</p>
                  <p style="margin: 0 0 4px; font-size: 14px; color: #D4845A; font-weight: bold;">Featured · ${days} days</p>
                  <p style="margin: 0; font-size: 13px; color: #8A7E6E; line-height: 1.6;">
                    Active through ${expiresReadable}
                  </p>
                </div>
                <p style="margin: 0 0 28px;">
                  <a href="${siteUrl}/discover" style="background: #1A2830; color: #FAF6EF; text-decoration: none; padding: 15px 30px; border-radius: 4px; font-family: sans-serif; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block;">
                    See Your Listing →
                  </a>
                </p>
                <p style="font-size: 13px; color: #8A7E6E; margin: 0 0 6px; line-height: 1.7;">
                  Questions or want to extend your placement? Just reply to this email.
                </p>
                <hr style="border: none; border-top: 1px solid #E8DFD0; margin: 28px 0 16px;">
                <p style="font-size: 11px; color: #9A8E7E; margin: 0;">Manitou Beach · Devils Lake, Michigan · manitoubeachmichigan.com</p>
              </div>
            `,
          }).catch(() => {});
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

    // 5. Sponsorship payment (from sponsor-checkout.js)
    if (metadata.type === 'sponsor_payment' && metadata.sponsorId) {
      const { sponsorId, orgName, orgPageId, orgContactEmail, sponsorName, tierLevel, amount, perks } = metadata;
      const perkList = perks ? perks.split('|').filter(Boolean) : [];
      try {
        // Generate PDF acknowledgment
        const pdfBuffer = await generateSponsorPDF({ sponsorId, orgName, sponsorName, tierLevel, amount, perks: perkList });
        const { url: pdfUrl } = await put(`sponsors/${sponsorId}.pdf`, pdfBuffer, {
          access: 'public',
          contentType: 'application/pdf',
        });

        const sponsorEmail = session.customer_email || session.customer_details?.email;

        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const amountFmt = `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

          // Gratitude email → sponsor
          if (sponsorEmail) {
            await resend.emails.send({
              from: 'Yetickets <tickets@yetigroove.com>',
              to: sponsorEmail,
              subject: `You're making it happen — ${orgName} thanks you!`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#FAF6EF;">
                  <h1 style="color:#1A2830;font-size:26px;font-weight:700;margin:0 0 6px;">You're making it happen.</h1>
                  <p style="color:#5C5248;font-size:15px;margin:0 0 32px;line-height:1.7;">
                    Your <strong>${tierLevel}</strong> sponsorship of <strong>${orgName}</strong> is confirmed —
                    and it means more than you might think.
                    Every dollar from sponsors like you is what turns a good idea into something the whole community gets to experience.
                  </p>

                  <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #E8E0D5;">
                    <p style="margin:0 0 4px;color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Sponsorship</p>
                    <p style="margin:0 0 6px;color:#1A2830;font-size:20px;font-weight:700;">${tierLevel}</p>
                    <p style="margin:0 0 16px;color:#5B7D8E;font-size:16px;font-weight:700;">${amountFmt}</p>
                    ${perkList.length > 0 ? `
                    <p style="margin:0 0 8px;color:#8C806E;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">What you get</p>
                    <ul style="margin:0;padding:0 0 0 0;list-style:none;">
                      ${perkList.map(p => `<li style="padding:3px 0;font-size:13px;color:#3A3028;">✓&nbsp; ${p}</li>`).join('')}
                    </ul>` : ''}
                  </div>

                  <a href="${pdfUrl}" style="display:inline-block;background:#1A2830;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-size:14px;font-weight:600;margin-bottom:32px;">
                    Download Your Acknowledgment →
                  </a>

                  <p style="color:#8C806E;font-size:12px;line-height:1.7;margin:0;">
                    Confirmation ID: <strong style="color:#1A2830;">${sponsorId}</strong><br />
                    Powered by Yetickets · <a href="https://manitoubeach.com" style="color:#5B7D8E;">manitoubeach.com</a>
                  </p>
                </div>
              `,
            });
          }

          // Notification → org contact
          if (orgContactEmail) {
            await resend.emails.send({
              from: 'Yetickets <tickets@yetigroove.com>',
              to: orgContactEmail,
              subject: `New sponsorship: ${sponsorName} — ${tierLevel} (${amountFmt})`,
              html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAF6EF;">
                  <h2 style="color:#1A2830;font-size:20px;margin:0 0 16px;">New sponsorship received 🎉</h2>
                  <div style="background:#fff;border-radius:10px;padding:20px 24px;border:1px solid #E8E0D5;margin-bottom:20px;">
                    <p style="margin:0 0 8px;font-size:14px;color:#3A3028;"><strong>Sponsor:</strong> ${sponsorName}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#3A3028;"><strong>Email:</strong> ${sponsorEmail || 'n/a'}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#3A3028;"><strong>Tier:</strong> ${tierLevel}</p>
                    <p style="margin:0;font-size:14px;color:#3A3028;"><strong>Amount:</strong> <span style="color:#5B7D8E;font-weight:700;">${amountFmt}</span></p>
                  </div>
                  <a href="${pdfUrl}" style="display:inline-block;background:#5B7D8E;color:#fff;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:24px;">
                    View Acknowledgment PDF →
                  </a>
                  <p style="color:#8C806E;font-size:12px;line-height:1.6;margin:0;">
                    Confirmation ID: ${sponsorId}<br />
                    Funds will be deposited to your connected bank account by Stripe.
                  </p>
                </div>
              `,
            });
          }
        }

        console.log(`Sponsor payment: ${sponsorId} — ${sponsorName} → ${tierLevel} @ ${amount} for ${orgName} — PDF: ${pdfUrl}`);
      } catch (err) {
        console.error('Sponsor payment fulfillment error:', err);
      }
    }

    // 6. Wine partner signup (from wine-partner-signup.js)
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

    // 7. Page sponsorship (from FeaturedPage claim form)
    if (metadata.type === 'page_sponsorship') {
      try {
        const bonusMonths = metadata.beta === 'true' ? 1 : 0;
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + (metadata.term === 'annual' ? 12 : 1) + bonusMonths);
        const expiryDate = expiry.toISOString().split('T')[0];
        const startDate  = new Date().toISOString().split('T')[0];
        const siteUrl    = process.env.SITE_URL || 'https://manitou-beach.vercel.app';
        const token      = process.env.NOTION_TOKEN_PAGE_SPONSORS || process.env.NOTION_TOKEN_BUSINESS;
        const dbId       = process.env.NOTION_DB_PAGE_SPONSORS;

        // Write to Notion
        if (token && dbId) {
          await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
            body: JSON.stringify({
              parent: { database_id: dbId },
              properties: {
                'Business Name':      { title:        [{ text: { content: metadata.businessName || '' } }] },
                'Page ID':            { select:       { name: metadata.pageId || '' } },
                'Page Label':         { rich_text:    [{ text: { content: metadata.pageName || '' } }] },
                'Contact Name':       { rich_text:    [{ text: { content: metadata.name || '' } }] },
                'Email':              { email:        session.customer_email || session.customer_details?.email || '' },
                'Phone':              { phone_number: metadata.phone || null },
                'Tagline':            { rich_text:    [{ text: { content: metadata.tagline || '' } }] },
                'Logo URL':           { url:          metadata.logoUrl || null },
                'Website URL':        { url:          null },
                'Stripe Sub ID':      { rich_text:    [{ text: { content: session.subscription || '' } }] },
                'Stripe Customer ID': { rich_text:    [{ text: { content: String(session.customer || '') } }] },
                'Term':               { select:       { name: metadata.term || 'monthly' } },
                'Status':             { select:       { name: 'active' } },
                'Start Date':         { date:         { start: startDate } },
                'Expiry Date':        { date:         { start: expiryDate } },
              },
            }),
          });
        }

        // Send confirmation email to sponsor
        const sponsorEmail = session.customer_email || session.customer_details?.email;
        if (sponsorEmail && process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const expiryFmt = new Date(expiryDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          const amountFmt = metadata.term === 'annual' ? '$970/year' : '$97/month';
          await resend.emails.send({
            from: 'Manitou Beach <hello@manitou-beach.com>',
            to: sponsorEmail,
            subject: `You own the ${metadata.pageName} page — confirmed`,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;background:#FAF6EF;">
                <h1 style="color:#1A2830;font-size:24px;font-weight:700;margin:0 0 8px;">You're live.</h1>
                <p style="color:#5C5248;font-size:15px;margin:0 0 28px;line-height:1.7;">
                  <strong>${metadata.businessName}</strong> now sponsors the <strong>${metadata.pageName}</strong> page.
                  Your banner goes live within 24 hours.
                </p>
                <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #E8E0D5;">
                  <p style="margin:0 0 6px;font-size:14px;color:#3A3028;"><strong>Page:</strong> ${metadata.pageName}</p>
                  <p style="margin:0 0 6px;font-size:14px;color:#3A3028;"><strong>Rate:</strong> ${amountFmt}</p>
                  <p style="margin:0 0 6px;font-size:14px;color:#3A3028;"><strong>Runs until:</strong> <span style="color:#D4845A;font-weight:700;">${expiryFmt}</span></p>
                  ${metadata.tagline ? `<p style="margin:0;font-size:14px;color:#3A3028;"><strong>Tagline:</strong> "${metadata.tagline}"</p>` : ''}
                </div>
                <p style="color:#8C806E;font-size:13px;line-height:1.75;margin:0 0 8px;">
                  We'll email you 5 days before expiry to renew or pass. If you don't renew, the spot goes to the next person on the waitlist.
                </p>
                <p style="color:#8C806E;font-size:12px;margin:0;">Questions? Reply to this email.</p>
              </div>
            `,
          });
        }

        // Admin notification
        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const amountFmt = metadata.term === 'annual' ? '$970/year' : '$97/month';
          await resend.emails.send({
            from: 'Manitou Beach <hello@manitou-beach.com>',
            to: 'hello@manitou-beach.com',
            subject: `New page sponsor: ${metadata.businessName} → ${metadata.pageName}`,
            html: `<div style="font-family:sans-serif;padding:24px;"><h2>New Page Sponsor</h2>
              <p><strong>Business:</strong> ${metadata.businessName}</p>
              <p><strong>Contact:</strong> ${metadata.name || '—'}</p>
              <p><strong>Email:</strong> ${session.customer_email || session.customer_details?.email || '—'}</p>
              <p><strong>Phone:</strong> ${metadata.phone || '—'}</p>
              <p><strong>Page:</strong> ${metadata.pageName}</p>
              <p><strong>Term:</strong> ${amountFmt}</p>
              <p><strong>Expires:</strong> ${expiryDate}</p>
              ${metadata.tagline ? `<p><strong>Tagline:</strong> "${metadata.tagline}"</p>` : ''}
              ${metadata.logoUrl ? `<p><strong>Logo:</strong> <a href="${metadata.logoUrl}">View</a></p>` : ''}
            </div>`,
          }).catch(() => {});
        }
        console.log(`Page sponsorship confirmed: ${metadata.businessName} → ${metadata.pageName} (${metadata.term}) expires ${expiryDate}`);
      } catch (err) {
        console.error('Page sponsorship fulfillment error:', err);
      }
    }
  }

  // ── customer.subscription.deleted ───────────────────────────
  // Fires when a subscriber cancels (end of billing period) or is removed
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const metadata = subscription.metadata || {};

    // Listing subscription cancelled
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

    // Page sponsorship subscription cancelled/lapsed — mark expired and notify waitlist
    if (metadata.type === 'page_sponsorship') {
      try {
        const token = process.env.NOTION_TOKEN_PAGE_SPONSORS || process.env.NOTION_TOKEN_BUSINESS;
        const dbId  = process.env.NOTION_DB_PAGE_SPONSORS;
        if (token && dbId) {
          const findRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
            body: JSON.stringify({ filter: { property: 'Stripe Sub ID', rich_text: { equals: subscription.id } } }),
          });
          const findData = await findRes.json();
          if (findData.results?.length > 0) {
            const record   = findData.results[0];
            const recordId = record.id;
            const pgId     = record.properties['Page ID']?.select?.name;
            const pgLabel  = record.properties['Page Label']?.rich_text?.[0]?.plain_text || pgId;

            // Mark as expired/cancelled
            await fetch(`https://api.notion.com/v1/pages/${recordId}`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
              body: JSON.stringify({ properties: { 'Status': { select: { name: 'expired' } } } }),
            });

            // Notify first waitlist entry
            await notifyFirstWaitlistEntry(token, pgId, pgLabel);
            console.log(`Page sponsorship lapsed: ${pgLabel} — waitlist notified`);
          }
        }
      } catch (err) {
        console.error('Page sponsorship cancellation error:', err);
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
