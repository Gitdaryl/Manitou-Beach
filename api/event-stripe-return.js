// /api/event-stripe-return.js
// Called by Stripe after the organizer completes (or returns from) Express onboarding.
// URL params: acct, eventPageId, eventType
//
// On success:
//   - Sets Onboarding Complete on the event record
//   - For vendor_market: generates and stores a Vendor Portal Token
//   - Sends welcome SMS to the organizer
//   - Redirects to /event-confirmed?type=<eventType>
//
// If onboarding not finished: redirects to refresh to restart.

import Stripe from 'stripe';
import crypto from 'crypto';
import { sendSMSFull } from './lib/twilio.js';

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

  const { acct, eventPageId, eventType } = req.query;

  if (!acct || !acct.startsWith('acct_') || !eventPageId) {
    return res.redirect('/submit-event?error=invalid');
  }

  const baseUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const account = await stripe.accounts.retrieve(acct);
    const isComplete = account.charges_enabled && account.details_submitted;

    if (!isComplete) {
      // Onboarding not finished — regenerate link and send back
      const params = new URLSearchParams({ acct, eventPageId, eventType: eventType || 'free' });
      return res.redirect(`${baseUrl}/api/event-stripe-refresh?${params}`);
    }

    // Fetch the event record to get phone, event name, edit token
    const notionToken = process.env.NOTION_TOKEN_EVENTS;
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${eventPageId}`, {
      headers: { Authorization: `Bearer ${notionToken}`, 'Notion-Version': '2022-06-28' },
    });

    let eventName = 'Your event';
    let phone = null;
    let editToken = '';

    if (pageRes.ok) {
      const page = await pageRes.json();
      const p = page.properties;
      eventName = p['Event Name']?.title?.[0]?.text?.content || 'Your event';
      phone = p['Phone']?.phone_number || null;
      editToken = p['Edit Token']?.rich_text?.[0]?.text?.content || '';
    }

    // Build update properties
    const updateProps = { 'Onboarding Complete': { checkbox: true } };

    let vendorPortalToken = null;
    if (eventType === 'vendor_market') {
      vendorPortalToken = generateToken().slice(0, 24); // shorter = more shareable
      updateProps['Vendor Portal Token'] = { rich_text: [{ text: { content: vendorPortalToken } }] };
    }

    // Update event record
    await fetch(`https://api.notion.com/v1/pages/${eventPageId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties: updateProps }),
    }).catch(e => console.error('event-stripe-return Notion patch failed:', e));

    // Send welcome SMS
    if (phone) {
      const digits = phone.replace(/\D/g, '').slice(-10);
      const toPhone = `+1${digits}`;
      const editUrl = `${baseUrl}/events/edit?token=${editToken}`;

      const dashboardUrl = `${baseUrl}/organizer-dashboard?token=${editToken}&event=${eventPageId}`;

      let smsBody;
      if (eventType === 'vendor_market') {
        const portalUrl = `${baseUrl}/vendor-portal?token=${vendorPortalToken}&event=${eventPageId}`;
        smsBody = `Manitou Beach Events\n\n${eventName} is live with vendor registration! 🎉\n\nYour organizer portal (share this with vendors):\n${portalUrl}\n\nSee your ticket sales + check-ins:\n${dashboardUrl}\n\nEdit your event:\n${editUrl}`;
      } else {
        smsBody = `Manitou Beach Events\n\n${eventName} is live with ticketing! 🎉\n\nSee your ticket sales + check-ins:\n${dashboardUrl}\n\nEdit your event:\n${editUrl}`;
      }

      await sendSMSFull(toPhone, smsBody);
    }

    // Redirect to confirmed page
    const confirmedParams = new URLSearchParams({ type: eventType || 'platform_ticketing' });
    if (vendorPortalToken) confirmedParams.set('vendorToken', vendorPortalToken);
    confirmedParams.set('event', eventPageId);
    return res.redirect(`${baseUrl}/event-confirmed?${confirmedParams}`);

  } catch (err) {
    console.error('event-stripe-return error:', err.message);
    return res.redirect(`${baseUrl}/submit-event?error=stripe_return`);
  }
}
