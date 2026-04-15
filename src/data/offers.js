// Single source of truth for all claim offers.
// Used by /api/submit-claim, /api/redeem-claim, ClaimPage, MerchantRedeemPage,
// and eventually the prize wheel.
//
// To add a new offer: copy a block, change slug + merchantName + codePrefix,
// push. No other files need to change.
//
// To swap an offer: either edit the existing row (keeps the same slug + URL,
// so old emails keep working) or flip status to 'ended' and add a new one.
//
// status: 'active' | 'paused' | 'ended'
//   - active: claimable at /claim/:slug, redeemable at /redeem/:slug
//   - paused: /claim/:slug shows "temporarily unavailable", redeems still work
//   - ended: both pages show "this offer has wrapped up"

export const OFFERS = [
  {
    slug: 'cafe',
    status: 'active',
    codePrefix: 'BB',
    notionOfferName: 'Blackbird Cookie', // must match 'Offer' select in Promo Claims Notion DB
    merchantName: 'Blackbird Cafe & Baking Company',
    offerText: 'free cookie',
    descLine: 'A welcome gift from The Manitou Dispatch',
    emoji: '☕',
    accent: '#D4845A',
    cap: 20,
    capLabel: 'First 20 people only',
    expiresLabel: 'Expires May 31',
    ownerEmails: ['admin@yetigroove.com'], // swap for Blackbird owner when shared
    reviewUrl: 'https://www.yelp.com/writeareview/biz/BV2J5pWMspuXAU78MeQo_A?return_url=%2Fbiz%2FBV2J5pWMspuXAU78MeQo_A&review_origin=biz-details-war-button',
    showOnWheel: false,
    wheelWeight: 1,
  },
];

export function getOffer(slug) {
  return OFFERS.find(o => o.slug === slug);
}

export function getActiveOffers() {
  return OFFERS.filter(o => o.status === 'active');
}

export function getClaimableOffer(slug) {
  const o = getOffer(slug);
  if (!o) return null;
  if (o.status === 'ended') return null;
  return o;
}

export function getOfferByNotionName(notionOfferName) {
  return OFFERS.find(o => o.notionOfferName === notionOfferName);
}

export function getWheelOffers() {
  return OFFERS.filter(o => o.status === 'active' && o.showOnWheel);
}
