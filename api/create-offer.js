// POST /api/create-offer
// Saves an advertiser offer submission to Notion for Daryl to review before posting.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    businessName, contactName, email, phone,
    offerType, offerDescription,
    limit, customLimit, condition, conditionDetail,
    startDate, endDate, perCustomer, otherRestrictions,
    summary,
  } = req.body || {};

  if (!businessName || !contactName) {
    return res.status(400).json({ error: 'Business name and contact name are required.' });
  }
  if (!offerDescription) {
    return res.status(400).json({ error: 'Offer description is required.' });
  }
  if (!endDate) {
    return res.status(400).json({ error: 'End date is required.' });
  }

  const token = process.env.NOTION_TOKEN_BUSINESS;
  const dbId = process.env.NOTION_DB_ADVERTISER_OFFERS;

  // If Notion isn't configured yet, still succeed but log it
  if (!token || !dbId) {
    console.warn('NOTION_DB_ADVERTISER_OFFERS not configured - offer logged but not saved to Notion');
    console.log('Offer submission:', JSON.stringify({ businessName, contactName, email, offerDescription, summary }));
    return res.status(200).json({ ok: true, note: 'logged' });
  }

  // Build the limit string
  const limitStr = limit === 'custom' ? `First ${customLimit || '?'}` : (limit || 'Not specified');

  // Build condition string
  let condStr = condition || 'Not specified';
  if ((condition === 'min_spend' || condition === 'other') && conditionDetail) {
    condStr += `: ${conditionDetail}`;
  }

  try {
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          'Business':     { title:     [{ text: { content: businessName } }] },
          'Contact':      { rich_text: [{ text: { content: contactName } }] },
          'Email':        { email:     email || null },
          'Phone':        { phone_number: phone || null },
          'Offer Type':   { select:    { name: offerType || 'other' } },
          'Description':  { rich_text: [{ text: { content: offerDescription } }] },
          'Limit':        { rich_text: [{ text: { content: limitStr } }] },
          'Condition':    { rich_text: [{ text: { content: condStr } }] },
          'Start Date':   startDate ? { date: { start: startDate } } : { date: null },
          'End Date':     { date:      { start: endDate } },
          'Per Customer': { select:    { name: perCustomer === 'one' ? 'One per customer' : 'Unlimited' } },
          'Restrictions': { rich_text: [{ text: { content: otherRestrictions || '' } }] },
          'Summary':      { rich_text: [{ text: { content: summary || '' } }] },
          'Status':       { select:    { name: 'Pending Review' } },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.json();
      console.error('create-offer Notion error:', err.message);
      return res.status(500).json({ error: 'Failed to save offer' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('create-offer error:', err.message);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
