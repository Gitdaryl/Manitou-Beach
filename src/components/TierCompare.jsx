import React from 'react';
import { C } from '../data/config';
import { BASE_PRICES } from '../data/pricing';

// Tick-box comparison of the four listing tiers (Yeti, Nov 11 2026: ticks, not "everything in X plus").
// Every row must be true in the code today. Check BusinessProfilePage.jsx and HomePage.jsx before adding one.
// Video ad rows stay hidden until the ad program launches (same flag as the photo form, VITE_AD_INTAKE_OPEN).
const ADS_ON = import.meta.env.VITE_AD_INTAKE_OPEN === '1';

const TIERS = [
  { id: 'free', name: 'Free', price: '$0', color: C.textMuted },
  { id: 'enhanced', name: 'Showcased', short: 'Show\u00ADcased', price: `$${BASE_PRICES.enhanced}`, color: C.lakeBlue },
  { id: 'featured', name: 'Highlighted', short: 'High\u00ADlighted', price: `$${BASE_PRICES.featured}`, color: C.sage },
  { id: 'premium', name: 'Front and Center', price: `$${BASE_PRICES.premium}`, color: C.sunset },
];

// [label, free, showcased, highlighted, front and center]: true = tick, false = dash, string = text
const GROUPS = [
  {
    title: 'Your page',
    rows: [
      ['Your own page with a link you can share', true, true, true, true],
      ['Logo, cover photo, description and hours', true, true, true, true],
      ['Call button, map pin and quote form', true, true, true, true],
      ['Update it yourself, anytime', true, true, true, true],
      ['Monthly checkup with how-to videos', true, true, true, true],
    ],
  },
  {
    title: 'Getting noticed',
    rows: [
      ['Shown above free listings in your category', false, true, true, true],
      ['Card in the directory with your logo and story', false, true, true, true],
      ['Color highlight so you stand out', false, false, true, true],
      ['Your Google stars and reviews on your page', false, false, true, true],
      ['Badge on your page', false, false, true, true],
      ['First in your category, always-open banner', false, false, false, true],
      ['Photo gallery and gold accent on your page', false, false, false, true],
      ['We set up your Google Business Profile', false, false, false, true],
    ],
  },
  ...(ADS_ON ? [{
    title: 'Video ads on Manitou Beach Life',
    rows: [
      ['3 free video ads a year', true, true, true, true],
      ['Seasonal reposts of your ads', false, true, true, true],
      ['Video files to post on your own pages', false, true, true, true],
      ['A new ad every quarter', false, false, true, true],
      ['A new ad every other month, your timing', false, false, false, true],
      ['Extra ads', '$80', '$80', '$60', '$40'],
    ],
  }] : []),
];

function Cell({ v, color }) {
  if (typeof v === 'string') {
    return <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>{v}</span>;
  }
  if (v) {
    return (
      <span role="img" aria-label="Included" className="tc-tick" style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26, borderRadius: '50%', background: '#2E8B57', color: '#fff',
        fontSize: 15, fontWeight: 800, lineHeight: 1,
      }}>✓</span>
    );
  }
  return <span aria-label="Not included" style={{ color: '#B9B0A4', fontSize: 18, fontWeight: 700 }}>–</span>;
}

export default function TierCompare({ onSelect }) {
  return (
    <div className="tc" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Phones: all four tiers stay on screen (no sideways scroll), so the labels narrow and the tier names shrink */}
      <style>{`
        .tc-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
        .tc-label { width: 40%; }
        @media (max-width: 600px) {
          .tc-label { width: 34%; }
          .tc-table th.tc-row { padding: 10px 8px 10px 12px !important; font-size: 14px !important; }
          .tc-table td { padding: 10px 2px !important; }
          .tc-name { font-size: 11px !important; letter-spacing: 0 !important; text-transform: none !important; }
          .tc-price { font-size: 18px !important; }
          .tc-mo { display: none; }
          .tc-tick { width: 24px !important; height: 24px !important; font-size: 14px !important; }
          .tc-cta { padding: 0 6px !important; font-size: 13px !important; }
        }
      `}</style>
      <div style={{ borderRadius: 16, border: `1px solid ${C.sand}`, background: '#fff', overflow: 'hidden' }}>
        <table className="tc-table" style={{ fontFamily: "'Libre Franklin', sans-serif" }}>
          <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            What each listing tier includes
          </caption>
          <thead>
            <tr>
              <th scope="col" className="tc-label" style={{ padding: 0 }} />
              {TIERS.map(t => (
                <th key={t.id} scope="col" style={{ padding: '18px 4px 14px', textAlign: 'center', verticalAlign: 'bottom', borderBottom: `3px solid ${t.color}` }}>
                  <div className="tc-name" style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: t.color, lineHeight: 1.25, hyphens: 'manual' }}>{t.short || t.name}</div>
                  <div className="tc-price" style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: C.text, marginTop: 4 }}>
                    {t.price}<span className="tc-mo" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 400, color: C.textMuted }}>{t.id === 'free' ? '' : '/mo'}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map(g => (
              <React.Fragment key={g.title}>
                <tr>
                  <th scope="rowgroup" colSpan={5} style={{ textAlign: 'left', padding: '18px 16px 8px', fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.textMuted, background: C.warmWhite }}>
                    {g.title}
                  </th>
                </tr>
                {g.rows.map(([label, ...vals]) => (
                  <tr key={label} style={{ borderTop: `1px solid ${C.sand}` }}>
                    <th scope="row" className="tc-row" style={{ textAlign: 'left', padding: '12px 16px', fontSize: 15, fontWeight: 400, color: C.text, lineHeight: 1.4 }}>
                      {label}
                    </th>
                    {vals.map((v, i) => (
                      <td key={TIERS[i].id} style={{ textAlign: 'center', padding: '12px 8px', background: TIERS[i].id === 'premium' ? `${C.sunset}0D` : 'transparent' }}>
                        <Cell v={v} color={TIERS[i].color} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {onSelect && (
              <tr style={{ borderTop: `1px solid ${C.sand}` }}>
                <td />
                {TIERS.map(t => (
                  <td key={t.id} style={{ textAlign: 'center', padding: '14px 6px 18px' }}>
                    {t.id === 'free' ? (
                      <a href="#submit" className="tc-cta" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, padding: '0 12px', borderRadius: 10, fontSize: 14, fontWeight: 700, color: t.color, border: `1.5px solid ${t.color}66`, textDecoration: 'none' }}>Free</a>
                    ) : (
                      <button type="button" className="tc-cta" onClick={() => onSelect(t.id)} style={{ minHeight: 44, padding: '0 12px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', background: t.id === 'premium' ? C.sunset : t.color, color: '#fff' }}>Choose</button>
                    )}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textMuted, textAlign: 'center', margin: '14px 0 0' }}>
        Monthly, cancel anytime. Start free and move up when your season does.
      </p>
    </div>
  );
}
