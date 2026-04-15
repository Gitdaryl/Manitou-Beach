export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { claimCode, vendorPin } = req.body || {};
  if (!claimCode || !vendorPin) {
    return res.status(400).json({ ok: false, error: 'Claim code and PIN are required.' });
  }

  const headers = {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };

  try {
    // Look up the claim by code
    const claimRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_PRIZE_WHEEL_CLAIMS}/query`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: {
            property: 'Claim Code',
            title: { equals: claimCode.toUpperCase().trim() },
          },
        }),
      }
    );

    if (!claimRes.ok) throw new Error('Notion claim lookup failed');
    const claimData = await claimRes.json();

    if (!claimData.results?.length) {
      return res.status(200).json({ ok: false, error: "Code not found. Double-check it and try again." });
    }

    const claim = claimData.results[0];
    const cp = claim.properties;
    const status = cp['Status']?.select?.name;
    const expiresAt = cp['Expires At']?.date?.start;
    const sponsorId = cp['Sponsor ID']?.rich_text?.[0]?.text?.content || '';
    const prizeLabel = cp['Prize Label']?.rich_text?.[0]?.text?.content || '';
    const sponsorName = cp['Sponsor Name']?.rich_text?.[0]?.text?.content || '';

    if (status === 'redeemed') {
      return res.status(200).json({ ok: false, error: 'This prize has already been redeemed.' });
    }
    if (status === 'void') {
      return res.status(200).json({ ok: false, error: 'This prize has been voided.' });
    }
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return res.status(200).json({ ok: false, error: 'This prize has expired.' });
    }
    if (status !== 'issued') {
      return res.status(200).json({ ok: false, error: 'Invalid prize status.' });
    }

    // Validate vendor PIN against the sponsor record
    if (sponsorId) {
      const sponsorRes = await fetch(`https://api.notion.com/v1/pages/${sponsorId}`, { headers: { ...headers, 'Content-Type': undefined } });
      if (sponsorRes.ok) {
        const sponsorPage = await sponsorRes.json();
        const storedPin = sponsorPage.properties['Vendor PIN']?.rich_text?.[0]?.text?.content || '';
        if (storedPin && storedPin.trim() !== String(vendorPin).trim()) {
          return res.status(200).json({ ok: false, error: 'Incorrect PIN.' });
        }
      }
    }

    // Mark as redeemed
    await fetch(`https://api.notion.com/v1/pages/${claim.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        properties: {
          'Status': { select: { name: 'redeemed' } },
          'Redeemed At': { date: { start: new Date().toISOString() } },
          'Redeemed By Vendor': { rich_text: [{ text: { content: sponsorName } }] },
        },
      }),
    });

    return res.status(200).json({ ok: true, prize: prizeLabel, sponsor: sponsorName });
  } catch (err) {
    console.error('Prize wheel redeem error:', err.message);
    return res.status(500).json({ ok: false, error: 'Something went wrong. Try again.' });
  }
}
