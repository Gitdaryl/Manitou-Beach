import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    orgName, orgType,
    contactName, email, phone,
    services, // array: ['tickets', 'sponsorships']
    eventNames, typicalAttendance, ticketPriceRange, eventFrequency,
    sponsorTiers, sponsorBenefits,
    notes,
  } = req.body || {};

  if (!orgName || !contactName || !email) {
    return res.status(400).json({ error: 'Organization name, contact name, and email are required.' });
  }

  if (!process.env.NOTION_DB_PARTNER_INTAKE || !process.env.NOTION_TOKEN_EVENTS) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const servicesLabel = Array.isArray(services) ? services.join(', ') : (services || '');
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    // 1. Save intake record to Notion
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_DB_PARTNER_INTAKE },
        properties: {
          'Org Name':           { title: [{ text: { content: orgName.trim() } }] },
          'Org Type':           { select: { name: orgType || 'Other' } },
          'Contact Name':       { rich_text: [{ text: { content: contactName.trim() } }] },
          'Email':              { email: email.trim() },
          'Phone':              { phone_number: (phone || '').trim() || null },
          'Services':           { rich_text: [{ text: { content: servicesLabel } }] },
          'Event Names':        { rich_text: [{ text: { content: (eventNames || '').trim() } }] },
          'Typical Attendance': { number: parseInt(typicalAttendance, 10) || null },
          'Ticket Price Range': { rich_text: [{ text: { content: (ticketPriceRange || '').trim() } }] },
          'Event Frequency':    { rich_text: [{ text: { content: (eventFrequency || '').trim() } }] },
          'Sponsor Tiers':      { rich_text: [{ text: { content: (sponsorTiers || '').trim() } }] },
          'Sponsor Benefits':   { rich_text: [{ text: { content: (sponsorBenefits || '').trim() } }] },
          'Notes':              { rich_text: [{ text: { content: (notes || '').trim() } }] },
          'Status':             { select: { name: 'New' } },
          'Submitted At':       { date: { start: new Date().toISOString() } },
        },
      }),
    });

    const notionData = await notionRes.json();
    if (!notionRes.ok) {
      console.error('Notion partner-intake error:', JSON.stringify(notionData));
      return res.status(500).json({ error: 'Failed to save. Please try again.' });
    }

    const notionPageId = notionData.id;

    // 2. Create Stripe Express account
    if (!process.env.STRIPE_SECRET_KEY) {
      // Stripe not configured — fall back to manual follow-up
      return res.status(200).json({ ok: true });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      email: email.trim(),
      metadata: { orgName: orgName.trim(), notionPageId },
    });

    // 3. Save Stripe Account ID back to Notion record
    await fetch(`https://api.notion.com/v1/pages/${notionPageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        properties: {
          'Stripe Account ID': { rich_text: [{ text: { content: account.id } }] },
          'Status':            { select: { name: 'Stripe Pending' } },
        },
      }),
    });

    // 4. Create onboarding link — partner goes straight to Stripe's bank + ID form
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      refresh_url: `${siteUrl}/api/stripe-connect-refresh?acct=${account.id}`,
      return_url:  `${siteUrl}/api/stripe-connect-return?acct=${account.id}`,
    });

    return res.status(200).json({ ok: true, onboardingUrl: accountLink.url });

  } catch (err) {
    console.error('partner-intake error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
