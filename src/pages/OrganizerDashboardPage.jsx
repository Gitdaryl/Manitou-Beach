import React, { useState, useEffect } from 'react';
import { C } from '../data/config';
import { GlobalStyles } from '../components/Layout';
import yeti from '../data/errorMessages';
import formatPhone from '../utils/formatPhone';

// ── Default theme: Manitou Beach ──────────────────────────────────────────────
// Pass a different theme prop to reskin for Yetickets or any future community.
const MB_THEME = {
  name: 'Manitou Beach',
  bg: C.cream,
  bgDark: C.night,
  bgCard: '#fff',
  bgSubtle: C.cream,
  border: '#E8E0D5',
  borderSubtle: '#F0EBE4',
  text: C.night,
  textSecondary: '#5C5248',
  textMuted: '#8C806E',
  accent: C.lakeBlue,
  accentDark: C.lakeDark,
  success: C.sage,
  warning: C.sunset,
  warningBg: 'rgba(212,132,90,0.12)',
  fontHeading: "'Libre Baskerville', serif",
  fontBody: "'Libre Franklin', sans-serif",
  chrome: C.driftwood,
  footerText: 'Powered by Yetickets',
};

function fmt$(n) { return '$' + n.toFixed(2); }
function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function exportCSV(buyers, eventName) {
  const headers = ['Ticket ID', 'Name', 'Email', 'Phone', 'Qty', 'Status', 'Purchased', 'Checked In'];
  const rows = buyers.map(b => [
    b.ticketId, b.buyerName, b.email, b.phone, b.quantity,
    b.status, b.purchasedAt, b.usedAt || '',
  ].map(cell => `"${(String(cell || '')).replace(/"/g, '""')}"`));
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventName.replace(/[^a-z0-9]/gi, '_')}_tickets.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrganizerDashboardPage({ theme: themeProp }) {
  const T = { ...MB_THEME, ...themeProp };
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const eventId = params.get('event');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [sortField, setSortField] = useState('purchasedAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    if (!token || !eventId) { setAuthError(true); setLoading(false); return; }
    fetch(`/api/organizer-dashboard?token=${encodeURIComponent(token)}&event=${encodeURIComponent(eventId)}`)
      .then(r => {
        if (r.status === 403) { setAuthError(true); setLoading(false); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(() => setAuthError(true))
      .finally(() => setLoading(false));
  }, [token, eventId]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.fontBody, color: T.textMuted }}>
      Loading your event…
    </div>
  );

  // ── Auth error ──────────────────────────────────────────────────────────────
  if (authError) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: T.bg, fontFamily: T.fontBody, padding: 24 }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
      <div style={{ fontFamily: T.fontHeading, fontSize: 22, color: T.text, marginBottom: 8 }}>Access denied</div>
      <div style={{ fontSize: 15, color: T.textMuted }}>This link doesn't seem right. Check your texts for the latest one?</div>
    </div>
  );

  if (!data) return null;

  const { eventName, eventDate, ticketPrice, ticketCapacity, ticketsSold, totalQuantity, checkedIn, revenue, buyers } = data;
  const capacityPct = ticketCapacity > 0 ? Math.min(100, Math.round((ticketsSold / ticketCapacity) * 100)) : 0;
  const checkedInPct = totalQuantity > 0 ? Math.round((checkedIn / totalQuantity) * 100) : 0;

  // Sort buyers
  const sorted = [...buyers].sort((a, b) => {
    let va = a[sortField] ?? '';
    let vb = b[sortField] ?? '';
    if (sortField === 'quantity') return sortDir === 'asc' ? va - vb : vb - va;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }

  const sortArrow = (field) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  // ── Vintage gauge (SVG, 240° arc) ──────────────────────────────────────────
  const CX = 100, CY = 100, R = 80, R_CHROME = 84;
  const START = 150, SWEEP = 240;
  const toRad = (d) => (d * Math.PI) / 180;
  const ptAt = (angle, r = R) => ({ x: CX + r * Math.cos(toRad(angle)), y: CY + r * Math.sin(toRad(angle)) });

  const DashboardGauge = ({ value, max, label, sub, color, warningColor, warningThreshold = 90, T: theme }) => {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    const hasData = max > 0;
    const fillColor = (warningColor && pct >= warningThreshold) ? warningColor : color;

    const s = ptAt(START);
    const e = ptAt(START + SWEEP);
    const trackD = `M ${s.x} ${s.y} A ${R} ${R} 0 1 1 ${e.x} ${e.y}`;

    // Chrome trim (outer ring)
    const sc = ptAt(START, R_CHROME);
    const ec = ptAt(START + SWEEP, R_CHROME);
    const chromeD = `M ${sc.x} ${sc.y} A ${R_CHROME} ${R_CHROME} 0 1 1 ${ec.x} ${ec.y}`;

    // Value arc
    const valAngle = START + (pct / 100) * SWEEP;
    const ve = ptAt(valAngle);
    const largeArc = (valAngle - START) > 180 ? 1 : 0;
    const valD = `M ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${ve.x} ${ve.y}`;

    // Needle
    const tip = ptAt(valAngle, R - 10);
    const perp = valAngle + 90;
    const nb1 = { x: CX + 3 * Math.cos(toRad(perp)), y: CY + 3 * Math.sin(toRad(perp)) };
    const nb2 = { x: CX - 3 * Math.cos(toRad(perp)), y: CY - 3 * Math.sin(toRad(perp)) };
    const needleD = `M ${nb1.x} ${nb1.y} L ${tip.x} ${tip.y} L ${nb2.x} ${nb2.y} Z`;

    // Tick marks at 0%, 25%, 50%, 75%, 100%
    const ticks = [0, 25, 50, 75, 100].map(p => {
      const a = START + (p / 100) * SWEEP;
      return {
        x1: CX + (R - 10) * Math.cos(toRad(a)), y1: CY + (R - 10) * Math.sin(toRad(a)),
        x2: CX + (R + 2) * Math.cos(toRad(a)),  y2: CY + (R + 2) * Math.sin(toRad(a)),
      };
    });

    const uid = `gauge-${label.replace(/\s/g, '')}`;

    return (
      <div style={{ textAlign: 'center', padding: '12px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{label}</div>
        <svg viewBox="0 0 200 155" style={{ width: '100%', maxWidth: 190 }}>
          <defs>
            <radialGradient id={`${uid}-glass`} cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Chrome trim */}
          <path d={chromeD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" />

          {/* Track */}
          <path d={trackD} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />

          {/* Value arc */}
          {hasData && pct > 0 && (
            <path d={valD} fill="none" stroke={fillColor} strokeWidth="12" strokeLinecap="round" style={{ transition: 'stroke 0.3s ease' }} />
          )}

          {/* Tick marks */}
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          ))}

          {/* Glass highlight */}
          <circle cx={CX} cy={CY} r={R - 4} fill={`url(#${uid}-glass)`} />

          {/* Needle */}
          {hasData && (
            <path d={needleD} fill="rgba(255,255,255,0.7)" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
          )}

          {/* Chrome hub cap */}
          <circle cx={CX} cy={CY} r="6" fill={theme.chrome} opacity="0.6" />
          <circle cx={CX} cy={CY} r="3" fill="rgba(255,255,255,0.3)" />

          {/* Value text */}
          <text x={CX} y={CY + 30} textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700" fontFamily={theme.fontBody}>
            {hasData ? value : '-'}
          </text>
          <text x={CX} y={CY + 46} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="12" fontFamily={theme.fontBody}>
            {hasData ? `${pct}%` : ''}
          </text>
        </svg>
        {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: -4 }}>{sub}</div>}
      </div>
    );
  };

  // ── Vintage readout panel (odometer style) ────────────────────────────────
  const DashboardReadout = ({ label, value, sub, color, T: theme }) => (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      padding: '20px 24px',
      boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: color || '#fff', fontFamily: theme.fontBody, fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{sub}</div>}
    </div>
  );

  // ── Status pill ─────────────────────────────────────────────────────────────
  const StatusPill = ({ status }) => {
    const colors = {
      Valid: { bg: 'rgba(122,142,114,0.15)', text: T.success },
      Used: { bg: 'rgba(91,126,149,0.15)', text: T.accent },
      Refunded: { bg: 'rgba(212,132,90,0.15)', text: T.warning },
    };
    const c = colors[status] || colors.Valid;
    return (
      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.text }}>
        {status === 'Used' ? 'Checked in' : status}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: T.fontBody, background: T.bg, color: T.text, minHeight: '100vh' }}>
      <GlobalStyles />

      {/* ── Dark header with stats ─────────────────────────────────────────── */}
      <div style={{ background: T.bgDark, padding: 'clamp(24px, 4vw, 40px) clamp(20px, 4vw, 40px)' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Your Event at a Glance</div>
          <div style={{ fontFamily: T.fontHeading, fontSize: 'clamp(22px, 3.5vw, 32px)', color: '#fff', marginBottom: 4 }}>{eventName}</div>
          {eventDate && <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{fmtDate(eventDate)}</div>}

          {/* Gauge grid - 2×2 on desktop, stacked on mobile */}
          <div className="dashboard-gauge-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <DashboardGauge
              label="Tickets Sold"
              value={ticketsSold}
              max={ticketCapacity}
              sub={ticketCapacity > 0 ? `of ${ticketCapacity}` : 'No cap set'}
              color={T.success}
              warningColor={T.warning}
              warningThreshold={90}
              T={T}
            />
            <DashboardGauge
              label="Checked In"
              value={checkedIn}
              max={totalQuantity}
              sub={totalQuantity > 0 ? `of ${totalQuantity} tickets` : null}
              color={T.accent}
              T={T}
            />
            <DashboardReadout
              label="Revenue"
              value={fmt$(revenue.gross)}
              sub={ticketPrice > 0 ? `@ ${fmt$(ticketPrice)} each` : null}
              color={T.success}
              T={T}
            />
            <DashboardReadout
              label="Your Payout"
              value={fmt$(revenue.netPayout)}
              sub="After all fees"
              color={revenue.netPayout > 0 ? '#8de8a8' : 'rgba(255,255,255,0.5)'}
              T={T}
            />
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: 'clamp(24px, 3vw, 40px) clamp(20px, 4vw, 40px)' }}>

        {/* Revenue breakdown card */}
        <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: '24px 28px', marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 16 }}>Revenue Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <RevenueRow label="Gross ticket sales" value={fmt$(revenue.gross)} bold color={T.text} T={T} />
            <RevenueRow label={`Card processing (2.9% + $0.30)`} value={`−${fmt$(revenue.stripeProcessing)}`} color={T.textMuted} T={T} />
            <RevenueRow label="Platform fee (1.25%)" value={`−${fmt$(revenue.platformFee)}`} color={T.textMuted} T={T} />
            <div style={{ height: 1, background: T.border, margin: '4px 0' }} />
            <RevenueRow label="Your payout" value={fmt$(revenue.netPayout)} bold color={T.success} T={T} />
          </div>
          {ticketsSold > 0 && (
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 14, lineHeight: 1.5 }}>
              Payouts go directly to your bank account through Stripe. Processing usually takes 2–3 business days after each sale.
            </div>
          )}
        </div>

        {/* Buyer list */}
        <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>
              Ticket Buyers ({buyers.length})
            </div>
            {buyers.length > 0 && (
              <button
                onClick={() => exportCSV(buyers, eventName)}
                style={{
                  padding: '7px 16px', borderRadius: 6, border: `1px solid ${T.border}`,
                  background: T.bgSubtle, fontSize: 12, fontWeight: 600, color: T.textSecondary,
                  cursor: 'pointer', fontFamily: T.fontBody,
                }}
              >
                Download CSV
              </button>
            )}
          </div>

          {buyers.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎟️</div>
              <div style={{ fontSize: 15, color: T.textMuted, lineHeight: 1.6 }}>
                No tickets sold yet. Once buyers purchase tickets, they'll show up here with all the details.
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} className="dashboard-table-desktop">
                  <thead>
                    <tr style={{ background: T.bgSubtle }}>
                      {[
                        { key: 'buyerName', label: 'Name' },
                        { key: 'email', label: 'Contact' },
                        { key: 'quantity', label: 'Qty' },
                        { key: 'purchasedAt', label: 'Purchased' },
                        { key: 'status', label: 'Status' },
                      ].map(col => (
                        <th
                          key={col.key}
                          onClick={() => toggleSort(col.key)}
                          style={{
                            padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: T.textMuted,
                            fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
                            borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
                            cursor: 'pointer', userSelect: 'none',
                          }}
                        >
                          {col.label}{sortArrow(col.key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((b, i) => (
                      <tr key={b.ticketId || i} style={{ borderBottom: i < sorted.length - 1 ? `1px solid ${T.borderSubtle}` : 'none' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: T.text }}>{b.buyerName || 'Guest'}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 11, color: T.textMuted, marginTop: 2 }}>{b.ticketId}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: T.textSecondary }}>{b.email}</div>
                          {b.phone && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>{formatPhone(b.phone)}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: T.text }}>{b.quantity}</td>
                        <td style={{ padding: '12px 16px', color: T.textMuted, whiteSpace: 'nowrap', fontSize: 12 }}>
                          {fmtDate(b.purchasedAt)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusPill status={b.status} />
                          {b.usedAt && (
                            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>
                              {fmtDate(b.usedAt)} {fmtTime(b.usedAt)}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="dashboard-cards-mobile" style={{ display: 'none', padding: '12px 16px', flexDirection: 'column', gap: 12 }}>
                {sorted.map((b, i) => (
                  <div key={b.ticketId || i} style={{ background: T.bgSubtle, borderRadius: 10, padding: '16px 18px', border: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{b.buyerName || 'Guest'}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: T.textMuted, marginTop: 2 }}>{b.ticketId}</div>
                      </div>
                      <StatusPill status={b.status} />
                    </div>
                    <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
                      {b.email && <div>{b.email}</div>}
                      {b.phone && <div>{formatPhone(b.phone)}</div>}
                      <div style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>
                        {b.quantity > 1 ? `${b.quantity} tickets` : '1 ticket'} · {fmtDate(b.purchasedAt)}
                      </div>
                      {b.usedAt && (
                        <div style={{ fontSize: 12, color: T.accent, marginTop: 2 }}>
                          Checked in {fmtDate(b.usedAt)} {fmtTime(b.usedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '16px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: T.textMuted }}>{T.footerText}</span>
      </div>

      {/* Responsive: swap table for cards on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .dashboard-table-desktop { display: none !important; }
          .dashboard-cards-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// ── Revenue row sub-component ─────────────────────────────────────────────────
function RevenueRow({ label, value, bold, color, T }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
      <span style={{ color: T.textSecondary }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400, color, fontFamily: 'monospace', fontSize: 15 }}>{value}</span>
    </div>
  );
}
