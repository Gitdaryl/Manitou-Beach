// Outbound links to businesses, venues and sponsors.
//
// Google's link spam policy requires links that are paid placements to carry
// rel="sponsored". Free listings keep a normal followed link: that is an honest
// editorial directory link and it helps the business.
//
// Paid = a listing tier someone pays for (Showcased 'enhanced', Highlighted
// 'featured', Front and Center 'premium', featured food trucks), a paid winery
// trail partner, or any sponsor. 'Listed Comp' rows arrive as tier 'enhanced'
// with comp: true and are NOT paid, so they keep a followed link.
//
// Every outbound link also gets utm_source/utm_medium so the business's own
// analytics can show what this site sends them.

const PAID_TIERS = new Set(['enhanced', 'featured', 'premium']);
const BASE_REL = 'noopener noreferrer';
export const SPONSORED_REL = `${BASE_REL} sponsored`;

export function isPaidPlacement(item) {
  if (!item) return false;
  if (item.comp) return false;
  if (item.partner === true) return true;
  return PAID_TIERS.has(item.tier);
}

// opts.sponsored = true forces sponsored (sponsor slots are always paid).
export function outboundRel(item, opts = {}) {
  const paid = opts.sponsored === true || isPaidPlacement(item);
  return paid ? SPONSORED_REL : BASE_REL;
}

// medium: 'directory' for listings, 'sponsor' for sponsor slots.
export function trackedUrl(url, medium = 'directory') {
  if (!url || typeof url !== 'string') return url;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return url;
    if (u.hostname.endsWith('manitoubeachmichigan.com')) return url;
    if (u.searchParams.has('utm_source')) return u.toString();
    u.searchParams.set('utm_source', 'manitoubeachmichigan');
    u.searchParams.set('utm_medium', medium);
    return u.toString();
  } catch {
    return url;
  }
}
