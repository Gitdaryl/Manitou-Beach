// Merchant-facing results report for an offer.
// GET /api/offer-report?slug=cafe
//
// Returns aggregate stats from the Promo Claims Notion DB, scoped to the
// offer's notionOfferName. Used by /offer-report/:slug to generate a
// "results memo" we can hand a merchant at the end of a promotion.

import { getOffer } from '../src/data/offers.js';

const DB_ID = process.env.NOTION_DB_PROMO_CLAIMS;
const NOTION_TOKEN = process.env.NOTION_TOKEN_BUSINESS;

async function queryAllForOffer(notionOfferName) {
  const all = [];
  let cursor;
  while (true) {
    const body = {
      filter: { property: 'Offer', select: { equals: notionOfferName } },
      page_size: 100,
    };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    all.push(...(data.results || []));
    if (!data.has_more) break;
    cursor = data.next_cursor;
  }
  return all;
}

function parseRow(row) {
  const p = row.properties || {};
  return {
    id: row.id,
    code: p['Promo Code']?.title?.[0]?.text?.content || '',
    name: p.Name?.rich_text?.[0]?.text?.content || '',
    email: p.Email?.email || '',
    claimedAt: p['Claimed At']?.date?.start || null,
    redeemed: p.Redeemed?.checkbox || false,
    redeemedAt: p['Redeemed At']?.date?.start || null,
    rating: p.Rating?.number ?? null,
    feedback: p.Feedback?.rich_text?.[0]?.text?.content || '',
    googleClicked: p['Google Clicked']?.checkbox || false,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const slug = (req.query.slug || '').toString().trim();
  const offer = getOffer(slug);
  if (!offer) return res.status(404).json({ error: 'Unknown offer' });

  try {
    const rows = (await queryAllForOffer(offer.notionOfferName)).map(parseRow);

    const claims = rows.length;
    const redemptions = rows.filter(r => r.redeemed).length;
    const pending = claims - redemptions;
    const uniqueEmails = new Set(rows.map(r => r.email).filter(Boolean)).size;

    const ratings = rows.filter(r => r.rating != null);
    const avgRating = ratings.length
      ? Number((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(2))
      : null;
    const googleClicks = rows.filter(r => r.googleClicked).length;

    const redeemed = rows.filter(r => r.redeemed && r.redeemedAt);
    const claimToRedeemHours = redeemed.length
      ? Number((redeemed.reduce((s, r) => {
          const delta = (new Date(r.redeemedAt) - new Date(r.claimedAt)) / (1000 * 60 * 60);
          return s + delta;
        }, 0) / redeemed.length).toFixed(1))
      : null;

    const redemptionRate = claims ? Math.round((redemptions / claims) * 100) : 0;
    const capFilled = offer.cap ? Math.round((claims / offer.cap) * 100) : null;

    const publicFeedback = rows
      .filter(r => r.feedback && r.rating != null && r.rating >= 4)
      .map(r => ({ rating: r.rating, feedback: r.feedback, name: r.name }));

    return res.status(200).json({
      offer: {
        slug: offer.slug,
        merchantName: offer.merchantName,
        offerText: offer.offerText,
        cap: offer.cap,
        status: offer.status,
        expiresLabel: offer.expiresLabel,
      },
      metrics: {
        claims,
        redemptions,
        pending,
        redemptionRate,
        uniqueEmails,
        capFilled,
        avgRating,
        ratingCount: ratings.length,
        googleClicks,
        avgHoursClaimToRedeem: claimToRedeemHours,
      },
      publicFeedback,
    });
  } catch (err) {
    console.error('offer-report error:', err.message);
    return res.status(500).json({ error: 'Report failed' });
  }
}
