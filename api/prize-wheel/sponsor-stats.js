export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id, pin } = req.query;
  if (!id || !pin) {
    return res.status(400).json({ error: 'id and pin are required' });
  }

  const headers = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    // Fetch and validate sponsor
    const sponsorRes = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      headers: { ...headers, 'Content-Type': undefined },
    });
    if (!sponsorRes.ok) return res.status(404).json({ error: 'Sponsor not found.' });

    const sponsorPage = await sponsorRes.json();
    const sp = sponsorPage.properties;
    const storedPin = sp['Vendor PIN']?.rich_text?.[0]?.text?.content || '';

    if (storedPin && storedPin.trim() !== String(pin).trim()) {
      return res.status(403).json({ error: 'Incorrect PIN.' });
    }

    const sponsorName = sp['Business Name']?.title?.[0]?.text?.content || '';
    const deal = sp['Deal Label']?.rich_text?.[0]?.text?.content || '';
    const dealDesc = sp['Deal Description']?.rich_text?.[0]?.text?.content || '';
    const address = sp['Address']?.rich_text?.[0]?.text?.content || '';

    // Paginate through all claims for this sponsor
    let allClaims = [];
    let startCursor;
    do {
      const body = {
        filter: { property: 'Sponsor ID', rich_text: { equals: id } },
        sorts: [{ property: 'Issued At', direction: 'descending' }],
        ...(startCursor && { start_cursor: startCursor }),
      };
      const claimsRes = await fetch(
        `https://api.notion.com/v1/databases/${process.env.NOTION_DB_PRIZE_WHEEL_CLAIMS}/query`,
        { method: 'POST', headers, body: JSON.stringify(body) }
      );
      if (!claimsRes.ok) throw new Error('Claims query failed');
      const claimsData = await claimsRes.json();
      allClaims = allClaims.concat(claimsData.results || []);
      startCursor = claimsData.has_more ? claimsData.next_cursor : null;
    } while (startCursor);

    const totalIssued = allClaims.length;
    const totalRedeemed = allClaims.filter(c => c.properties['Status']?.select?.name === 'redeemed').length;
    const redemptionRate = totalIssued > 0 ? Math.round((totalRedeemed / totalIssued) * 100) : 0;

    const recent = allClaims.slice(0, 10).map(c => {
      const cp = c.properties;
      const rawEmail = cp['Winner Email']?.email || '';
      const redactedEmail = rawEmail.replace(/^(.{1,2}).*?(@.*)$/, (_, start, domain) => start + '***' + domain);
      return {
        code: cp['Claim Code']?.title?.[0]?.text?.content || '',
        email: redactedEmail,
        prize: cp['Prize Label']?.rich_text?.[0]?.text?.content || '',
        status: cp['Status']?.select?.name || '',
        issuedAt: cp['Issued At']?.date?.start || '',
        redeemedAt: cp['Redeemed At']?.date?.start || null,
      };
    });

    return res.status(200).json({
      sponsor: sponsorName,
      deal,
      dealDesc,
      address,
      totalIssued,
      totalRedeemed,
      redemptionRate,
      recent,
    });
  } catch (err) {
    console.error('Sponsor stats error:', err.message);
    return res.status(500).json({ error: 'Failed to load stats.' });
  }
}
