import { useState, useEffect } from 'react';

// Shared pricing logic — single source of truth for subscriber-based pricing
// Server-side equivalent lives in api/create-checkout.js (computePriceCents)

export const BASE_PRICES = { enhanced: 9, featured: 23, premium: 43, food_truck_founding: 9 };
export const GRACE = 100;

export function usePricing() {
  const [subCount, setSubCount] = useState(null);

  useEffect(() => {
    fetch('/api/subscribe')
      .then(r => r.json())
      .then(d => setSubCount(d.count ?? 0))
      .catch(() => setSubCount(0));
  }, []);

  const count = subCount ?? 0;
  const increment = Math.max(0, count - GRACE);
  const inGrace = count < GRACE;
  const priceFor = (base) => (base + increment * 0.01).toFixed(2);
  const centsFor = (base) => Math.round((base + increment * 0.01) * 100);
  const progressPct = inGrace
    ? Math.min(100, (count / GRACE) * 100)
    : Math.min(100, ((count - GRACE) / 900) * 100);

  return { subCount, count, increment, inGrace, priceFor, centsFor, progressPct };
}
