// Incentive Contracts — subscriber promo vendor agreements
// GET:   list all contracts
// POST:  create a new contract
// PATCH: update status or review URL
//
// Requires: NOTION_DB_INCENTIVE_CONTRACTS env var
// Contract Tiers: Single Drop (1 issue) | 4-Episode (4 issues) | Season Run (12 issues)

const TIER_ISSUES = { 'Single Drop': 1, '4-Episode': 4, 'Season Run': 12 };

export default async function handler(req, res) {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const DB = process.env.NOTION_DB_INCENTIVE_CONTRACTS;
  if (!DB) {
    // Return empty state so the UI renders — surface the config gap clearly
    if (req.method === 'GET') return res.status(200).json({ contracts: [], unconfigured: true });
    return res.status(500).json({ error: 'NOTION_DB_INCENTIVE_CONTRACTS env var not configured. Create the Notion DB and add the env var to Vercel.' });
  }

  const notionHeaders = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  // ── GET: list contracts ──────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const r = await fetch(`https://api.notion.com/v1/databases/${DB}/query`, {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          sorts: [{ property: 'Created At', direction: 'descending' }],
          page_size: 50,
        }),
      });
      if (!r.ok) throw new Error('Failed to fetch contracts from Notion');
      const data = await r.json();

      const contracts = data.results.map(page => ({
        id: page.id,
        vendorName:      page.properties['Name']?.title?.[0]?.text?.content || '',
        offerText:       page.properties['Offer Text']?.rich_text?.[0]?.text?.content || '',
        tier:            page.properties['Contract Tier']?.select?.name || '',
        status:          page.properties['Status']?.select?.name || 'Queued',
        contactEmail:    page.properties['Contact Email']?.email || '',
        reviewUrl:       page.properties['Review URL']?.url || '',
        city:            page.properties['City']?.rich_text?.[0]?.text?.content || '',
        redemptionCap:   page.properties['Redemption Cap']?.number ?? null,
        issuesRemaining: page.properties['Issues Remaining']?.number ?? null,
        createdAt:       page.properties['Created At']?.date?.start || '',
      }));

      return res.status(200).json({ contracts });
    } catch (err) {
      console.error('incentive-contracts GET error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: create contract ────────────────────────────────────
  if (req.method === 'POST') {
    const { vendorName, offerText, tier, contactEmail, reviewUrl, city, redemptionCap } = req.body || {};
    if (!vendorName?.trim() || !tier) {
      return res.status(400).json({ error: 'vendorName and tier are required' });
    }
    if (!TIER_ISSUES[tier]) {
      return res.status(400).json({ error: `Invalid tier. Use: ${Object.keys(TIER_ISSUES).join(', ')}` });
    }

    const issuesRemaining = TIER_ISSUES[tier];
    const properties = {
      'Name':             { title: [{ text: { content: vendorName.trim() } }] },
      'Offer Text':       { rich_text: [{ text: { content: offerText?.trim() || '' } }] },
      'Contract Tier':    { select: { name: tier } },
      'Status':           { select: { name: 'Queued' } },
      'City':             { rich_text: [{ text: { content: city?.trim() || 'Manitou Beach, Michigan' } }] },
      'Issues Remaining': { number: issuesRemaining },
      'Created At':       { date: { start: new Date().toISOString() } },
    };

    if (contactEmail?.trim()) properties['Contact Email'] = { email: contactEmail.trim() };
    if (reviewUrl?.trim())    properties['Review URL']    = { url: reviewUrl.trim() };
    if (redemptionCap)        properties['Redemption Cap'] = { number: parseInt(redemptionCap) };

    try {
      const r = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({ parent: { database_id: DB }, properties }),
      });
      if (!r.ok) throw new Error('Failed to create contract in Notion');
      const page = await r.json();
      return res.status(200).json({ id: page.id, ok: true });
    } catch (err) {
      console.error('incentive-contracts POST error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PATCH: update status or review URL ──────────────────────
  if (req.method === 'PATCH') {
    const { id, status, reviewUrl } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    const updates = {};
    if (status)    updates['Status']     = { select: { name: status } };
    if (reviewUrl) updates['Review URL'] = { url: reviewUrl };

    try {
      const r = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify({ properties: updates }),
      });
      if (!r.ok) throw new Error('Failed to update contract');
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('incentive-contracts PATCH error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
