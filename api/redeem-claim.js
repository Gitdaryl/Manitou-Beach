// Barista-facing redemption against the Promo Claims Notion DB.
// Looks up by Promo Code (title) + slug, marks Redeemed + Status.

const SLUG_TO_OFFER = {
  cafe: 'Blackbird Cookie',
};

const DB_ID = process.env.NOTION_DB_PROMO_CLAIMS;
const NOTION_TOKEN = process.env.NOTION_TOKEN_BUSINESS;

async function queryByCodeOffer(code, offer) {
  const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Promo Code', title: { equals: code } },
          { property: 'Offer', select: { equals: offer } },
        ],
      },
      page_size: 1,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function parseRow(row) {
  return {
    id: row.id,
    code: row.properties?.['Promo Code']?.title?.[0]?.text?.content || '',
    name: row.properties?.Name?.rich_text?.[0]?.text?.content || '',
    email: row.properties?.Email?.email || '',
    claimedAt: row.properties?.['Claimed At']?.date?.start || null,
    redeemed: row.properties?.Redeemed?.checkbox || false,
    redeemedAt: row.properties?.['Redeemed At']?.date?.start || null,
    status: row.properties?.Status?.select?.name || null,
  };
}

export default async function handler(req, res) {
  // --- GET ?code=BB-XXXXXX&slug=cafe ---
  if (req.method === 'GET') {
    const code = (req.query.code || '').toString().trim().toUpperCase();
    const slug = (req.query.slug || '').toString().trim();
    const offer = SLUG_TO_OFFER[slug];
    if (!code || !offer) return res.status(400).json({ error: 'code and slug required' });

    try {
      const data = await queryByCodeOffer(code, offer);
      if (!data.results || data.results.length === 0) {
        return res.status(404).json({ error: 'Code not found. Double-check the characters.' });
      }
      return res.status(200).json(parseRow(data.results[0]));
    } catch (err) {
      console.error('redeem-claim GET error:', err.message);
      return res.status(500).json({ error: 'Lookup failed' });
    }
  }

  // --- POST (mark redeemed) ---
  if (req.method === 'POST') {
    const { notionId, code, slug } = req.body || {};
    const offer = SLUG_TO_OFFER[slug];
    if (!offer || (!notionId && !code)) {
      return res.status(400).json({ error: 'slug + (notionId or code) required' });
    }

    try {
      let pageId = notionId;
      let row = null;

      if (!pageId) {
        const data = await queryByCodeOffer(code.toUpperCase(), offer);
        if (!data.results || data.results.length === 0) {
          return res.status(404).json({ error: 'Code not found' });
        }
        row = parseRow(data.results[0]);
        pageId = row.id;
      }

      if (row?.redeemed) {
        return res.status(409).json({ error: 'Already redeemed', redeemedAt: row.redeemedAt });
      }

      const patchRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: {
            'Redeemed':    { checkbox: true },
            'Redeemed At': { date: { start: new Date().toISOString() } },
            'Status':      { select: { name: 'Redeemed' } },
          },
        }),
      });

      if (!patchRes.ok) {
        const err = await patchRes.text();
        console.error('redeem-claim PATCH error:', err);
        return res.status(500).json({ error: 'Notion write failed' });
      }

      return res.status(200).json({ success: true, pageId });
    } catch (err) {
      console.error('redeem-claim POST error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
