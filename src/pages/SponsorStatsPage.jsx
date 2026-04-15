import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { C } from '../data/config';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#fff', border: `1.5px solid ${C.sand}`, borderRadius: 14,
      padding: '20px 24px', textAlign: 'center',
    }}>
      <div style={{
        fontSize: 36, fontWeight: 700, color: accent || C.sunset,
        fontFamily: "'Libre Baskerville', serif", lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
        color: C.textMuted, marginTop: 6, fontFamily: "'Libre Franklin', sans-serif",
      }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: C.textLight, marginTop: 4, fontFamily: "'Libre Franklin', sans-serif" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    issued: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Issued' },
    redeemed: { bg: '#F0FDF4', color: '#15803D', label: 'Redeemed' },
    expired: { bg: '#F9FAFB', color: '#6B7280', label: 'Expired' },
    void: { bg: '#FEF2F2', color: '#B91C1C', label: 'Void' },
  };
  const s = map[status] || map.issued;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      fontFamily: "'Libre Franklin', sans-serif",
    }}>
      {s.label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SponsorStatsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const pin = searchParams.get('pin') || '';
  const scrollTo = () => {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) { setError('No sponsor ID in URL.'); setLoading(false); return; }
    if (!pin) { setError('No PIN in URL. Use your magic link.'); setLoading(false); return; }

    fetch(`/api/prize-wheel/sponsor-stats?id=${encodeURIComponent(id)}&pin=${encodeURIComponent(pin)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load your stats. Check your link and try again.'); setLoading(false); });
  }, [id, pin]);

  const SECTION_TITLE = {
    fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text,
    margin: '32px 0 16px', paddingBottom: 8, borderBottom: `1px solid ${C.sand}`,
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '120px 24px 80px' }}>

        {loading && (
          <div style={{ textAlign: 'center', color: C.textMuted, padding: '60px 0', fontFamily: "'Libre Franklin', sans-serif" }}>
            Loading your dashboard...
          </div>
        )}

        {!loading && error && (
          <div style={{
            background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 14,
            padding: '24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", color: '#B91C1C', margin: '0 0 8px' }}>
              Can't load dashboard
            </h2>
            <p style={{ color: '#991B1B', fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {!loading && data && (
          <>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                color: C.sunset, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif",
              }}>
                Sponsor Dashboard
              </div>
              <h1 style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 400,
                color: C.dusk, margin: '0 0 8px',
              }}>
                {data.sponsor}
              </h1>
              <div style={{
                display: 'inline-block', background: `${C.sunset}15`,
                border: `1.5px solid ${C.sunset}40`,
                borderRadius: 8, padding: '6px 14px',
                fontSize: 14, color: C.sunset, fontWeight: 600,
                fontFamily: "'Libre Franklin', sans-serif",
              }}>
                {data.deal}
              </div>
              {data.dealDesc && (
                <p style={{ color: C.textLight, fontSize: 14, margin: '10px 0 0', lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {data.dealDesc}
                </p>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <StatCard
                label="Prizes Won"
                value={data.totalIssued}
                sub="people claimed your deal"
                accent={C.lakeBlue}
              />
              <StatCard
                label="Redeemed"
                value={data.totalRedeemed}
                sub="showed up in person"
                accent={C.sage}
              />
              <StatCard
                label="Redemption Rate"
                value={`${data.redemptionRate}%`}
                sub={data.totalIssued > 0 ? 'of winners came in' : 'no spins yet'}
                accent={C.sunset}
              />
            </div>

            {/* What this means */}
            {data.totalIssued > 0 && (
              <div style={{
                background: '#fff', border: `1.5px solid ${C.sand}`, borderRadius: 14,
                padding: '20px 24px', marginTop: 14,
                fontFamily: "'Libre Franklin', sans-serif",
              }}>
                <p style={{ margin: 0, fontSize: 14, color: C.textLight, lineHeight: 1.7 }}>
                  {data.totalRedeemed > 0
                    ? `${data.totalRedeemed} ${data.totalRedeemed === 1 ? 'person' : 'people'} walked through your door because of the wheel. ${data.redemptionRate >= 50 ? 'That\'s a strong conversion rate - people are excited about your deal.' : 'Every one of those is a new face at your place.'}`
                    : `${data.totalIssued} ${data.totalIssued === 1 ? 'person' : 'people'} has your deal in their inbox right now. They have 7 days to come in and redeem it.`
                  }
                </p>
              </div>
            )}

            {/* Recent claims */}
            {data.recent?.length > 0 && (
              <>
                <div style={SECTION_TITLE}>Recent Activity</div>
                <div style={{
                  background: '#fff', border: `1.5px solid ${C.sand}`,
                  borderRadius: 14, overflow: 'hidden',
                }}>
                  {data.recent.map((claim, i) => (
                    <div key={claim.code} style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 12,
                      padding: '14px 20px',
                      borderBottom: i < data.recent.length - 1 ? `1px solid ${C.sand}` : 'none',
                      alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, color: C.text, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>
                          {claim.prize}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2, fontFamily: "'Libre Franklin', sans-serif" }}>
                          {claim.email} &middot; {fmtDate(claim.issuedAt)}
                          {claim.redeemedAt && <span style={{ color: C.sage }}> &middot; redeemed {fmtDate(claim.redeemedAt)}</span>}
                        </div>
                      </div>
                      <StatusBadge status={claim.status} />
                    </div>
                  ))}
                </div>
                {data.totalIssued > 10 && (
                  <p style={{ fontSize: 12, color: C.textMuted, marginTop: 8, fontFamily: "'Libre Franklin', sans-serif" }}>
                    Showing most recent 10 of {data.totalIssued} total.
                  </p>
                )}
              </>
            )}

            {data.totalIssued === 0 && (
              <div style={{
                background: '#fff', border: `1.5px solid ${C.sand}`, borderRadius: 14,
                padding: '32px 24px', textAlign: 'center', marginTop: 24,
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎡</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", color: C.dusk, margin: '0 0 8px' }}>
                  Wheel is live - waiting for first spin
                </h3>
                <p style={{ fontSize: 14, color: C.textLight, margin: 0, lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  As soon as someone lands on your deal, you'll see it here.
                </p>
              </div>
            )}

            {/* Footer note */}
            <p style={{
              marginTop: 32, fontSize: 12, color: C.textMuted, lineHeight: 1.6,
              textAlign: 'center', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              This dashboard is private to you. Bookmark this page to check back anytime.
              Questions? Email <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a>
            </p>
          </>
        )}
      </div>

      <Footer scrollTo={scrollTo} />
    </div>
  );
}
