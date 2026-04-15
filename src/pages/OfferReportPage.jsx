import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { C } from '../data/config';

// Merchant-facing results memo for a completed (or ongoing) offer.
// Route: /offer-report/:slug — e.g. /offer-report/cafe
//
// Hand this URL to a merchant at the end of a promotion to show impact:
// claims, redemptions, email list growth, reviews. Designed to turn
// "doing you a favor" merchants into repeat partners.

export default function OfferReportPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/offer-report?slug=${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Report failed');
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const wrap = { minHeight: '100vh', background: C.cream, fontFamily: "'Libre Franklin', sans-serif", padding: '40px 24px' };
  const center = { maxWidth: 720, margin: '0 auto' };

  if (error) return (
    <div style={{ ...wrap, ...center }}>
      <p style={{ color: C.textLight }}>{error}</p>
    </div>
  );
  if (!data) return (
    <div style={{ ...wrap, ...center }}>
      <p style={{ color: C.textLight }}>Loading report…</p>
    </div>
  );

  const { offer, metrics, publicFeedback } = data;

  const statCard = (label, value, sub) => (
    <div style={{ background: '#fff', borderRadius: 12, padding: '22px 20px', border: `1px solid ${C.sand}`, textAlign: 'center' }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 38, fontFamily: "'Libre Baskerville', serif", color: C.dusk, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={wrap}>
      <div style={center}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.sage, marginBottom: 6 }}>Promotion Report</div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color: C.dusk, margin: '0 0 6px' }}>{offer.merchantName}</h1>
          <p style={{ color: C.textLight, fontSize: 15, margin: 0 }}>Results for your {offer.offerText} promotion{offer.expiresLabel ? ` · ${offer.expiresLabel}` : ''}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
          {statCard('Claims', metrics.claims, offer.cap ? `of ${offer.cap} spots (${metrics.capFilled}%)` : null)}
          {statCard('Redeemed', metrics.redemptions, `${metrics.redemptionRate}% redemption rate`)}
          {statCard('New subscribers', metrics.uniqueEmails, 'will see your name monthly')}
          {metrics.avgRating != null && statCard(`${metrics.avgRating} ★`, metrics.avgRating, `from ${metrics.ratingCount} customer rating${metrics.ratingCount === 1 ? '' : 's'}`)}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: '24px 22px', border: `1px solid ${C.sand}`, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, color: C.dusk, margin: '0 0 12px', fontWeight: 700 }}>What this means for you</h2>
          <ul style={{ margin: 0, paddingLeft: 20, color: C.textLight, fontSize: 14, lineHeight: 1.7 }}>
            <li><strong style={{ color: C.text }}>{metrics.redemptions} people walked through your door</strong> because of this promotion{metrics.pending > 0 ? `, with ${metrics.pending} more codes still outstanding` : ''}.</li>
            <li><strong style={{ color: C.text }}>{metrics.uniqueEmails} new local email subscribers</strong> who'll see The Manitou Dispatch every month — your name alongside them.</li>
            {metrics.avgHoursClaimToRedeem != null && (
              <li>Average time from claim to walk-in: <strong style={{ color: C.text }}>{metrics.avgHoursClaimToRedeem} hours</strong> — these are real customers acting on the offer quickly.</li>
            )}
            {metrics.googleClicks > 0 && (
              <li><strong style={{ color: C.text }}>{metrics.googleClicks} customers</strong> clicked through to leave you a Google review after redeeming.</li>
            )}
          </ul>
        </div>

        {publicFeedback.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 22px', border: `1px solid ${C.sand}`, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, color: C.dusk, margin: '0 0 16px', fontWeight: 700 }}>What your customers said</h2>
            {publicFeedback.map((f, i) => (
              <blockquote key={i} style={{ margin: '0 0 14px', padding: '14px 18px', background: C.cream, borderLeft: `3px solid ${offer.slug === 'cafe' ? '#D4845A' : C.sage}`, color: C.text, fontSize: 14, lineHeight: 1.6 }}>
                <div style={{ color: '#E0A82E', marginBottom: 6, fontSize: 13 }}>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
                "{f.feedback}"
                {f.name && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>— {f.name.split(' ')[0]}</div>}
              </blockquote>
            ))}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: 28 }}>
          The Manitou Dispatch · Manitou Beach, Michigan
        </p>
      </div>
    </div>
  );
}
