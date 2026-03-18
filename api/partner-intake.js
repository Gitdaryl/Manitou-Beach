export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    orgName, orgType, is501c3,
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

  try {
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
          'Is 501(c)(3)':       { checkbox: !!is501c3 },
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

    const data = await notionRes.json();
    if (!notionRes.ok) {
      console.error('Notion partner-intake error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Failed to save. Please try again.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('partner-intake error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
