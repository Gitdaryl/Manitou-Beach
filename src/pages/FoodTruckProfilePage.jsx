import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn, Btn } from '../components/Shared';
import SEOHead from '../components/SEOHead';

// ─── Accent ──────────────────────────────────────────────────────────────────
const ACCENT = C.sunset;

export default function FoodTruckProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/food-trucks')
      .then(r => r.json())
      .then(data => {
        const found = (data.trucks || []).find(t => t.slug === slug);
        setTruck(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const autoDesc = truck
    ? `${truck.name} is a food truck serving ${truck.cuisine || 'great food'} at Manitou Beach and Devils Lake, Michigan.`
    : '';

  const schema = truck ? {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: truck.name,
    ...(truck.description && { description: truck.description.substring(0, 300) }),
    ...(truck.phone && { telephone: truck.phone }),
    ...(truck.website && { url: truck.website }),
    ...(truck.photoUrl && { image: truck.photoUrl }),
    ...(truck.cuisine && { servesCuisine: truck.cuisine }),
    ...(truck.lat && truck.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: truck.lat, longitude: truck.lng },
    }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Manitou Beach',
      addressRegion: 'MI',
      addressCountry: 'US',
    },
    areaServed: { '@type': 'Place', name: 'Manitou Beach, Devils Lake, Michigan' },
    priceRange: '$',
    potentialAction: {
      '@type': 'ViewAction',
      target: `${import.meta.env.VITE_SITE_URL || 'https://manitoubeachmichigan.com'}/food-trucks/${slug}`,
    },
  } : null;

  const scrollTo = id => { window.location.href = '/#' + id; };

  const fmtDate = str => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const hasHero = truck?.photoUrl;
  const hasActions = truck?.phone || truck?.website;
  const isActive = truck && !truck.departureTime;

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />
      <style>{`
        .ftp-hero-img {
          width: 100%; height: 300px; object-fit: cover; display: block;
        }
        @media (min-width: 768px) {
          .ftp-hero-img { height: 420px; }
        }
        .ftp-identity-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 32px rgba(0,0,0,0.12);
          padding: 24px 22px 22px;
          margin: -56px 16px 0;
          position: relative;
          z-index: 10;
        }
        @media (min-width: 640px) {
          .ftp-identity-card {
            margin: -72px auto 0;
            max-width: 660px;
            padding: 28px 28px 24px;
          }
        }
        .ftp-section-card {
          background: #fff;
          border-radius: 14px;
          padding: 22px 20px;
          margin-bottom: 14px;
          box-shadow: 0 1px 8px rgba(0,0,0,0.05);
          border: 1.5px solid ${C.sand};
        }
        @media (min-width: 640px) {
          .ftp-section-card { padding: 24px 24px; }
        }
        .ftp-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: ${C.textMuted};
          margin-bottom: 14px;
        }
        .ftp-action-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 7px; flex: 1; padding: 13px 10px;
          border-radius: 10px; border: none; cursor: pointer;
          font-size: 14px; font-weight: 700;
          font-family: "'Libre Franklin', sans-serif";
          text-decoration: none; transition: opacity 0.15s;
          min-height: 48px;
        }
        .ftp-action-btn:hover { opacity: 0.88; }
        .ftp-sticky {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: rgba(250,246,239,0.96); backdrop-filter: blur(12px);
          border-top: 1.5px solid ${C.sand};
          padding: 12px 16px max(12px, env(safe-area-inset-bottom));
          display: flex; gap: 10px;
          transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .ftp-sticky.visible { transform: translateY(0); }
        .ftp-info-row {
          display: flex; gap: 12px; align-items: flex-start;
          background: ${C.warmWhite}; border-radius: 10px;
          padding: 13px 14px; border: 1.5px solid ${C.sand};
          margin-bottom: 10px;
        }
      `}</style>

      {truck && (
        <SEOHead
          title={`${truck.name} - Food Truck at Manitou Beach, Michigan`}
          description={truck.description ? truck.description.substring(0, 155) : autoDesc}
          path={`/food-trucks/${slug}`}
          ogImage={truck.photoUrl || undefined}
          schema={schema}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Food Trucks', path: '/food-trucks' },
            { name: truck.name, path: `/food-trucks/${slug}` },
          ]}
        />
      )}

      <Navbar activeSection="" scrollTo={scrollTo} isSubPage />

      {loading ? (
        <div style={{ paddingTop: 120, textAlign: 'center', color: C.textMuted, fontSize: 15 }}>Loading...</div>
      ) : !truck ? (
        <div style={{ paddingTop: 120, textAlign: 'center', padding: '120px 24px 80px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚚</div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: C.dusk, marginBottom: 8 }}>
            Truck Not Found
          </div>
          <p style={{ color: C.textMuted, fontSize: 15, marginBottom: 28, maxWidth: 340, marginInline: 'auto' }}>
            This truck isn't on the lake right now - it may be off-season or the link has a typo.
          </p>
          <Btn onClick={() => navigate('/food-trucks')} variant="primary">See All Food Trucks</Btn>
        </div>
      ) : (
        <>
          {/* ── Hero ── */}
          <div style={{ position: 'relative', paddingTop: 60 }}>
            {/* Back button over hero */}
            <button
              onClick={() => navigate('/food-trucks')}
              style={{
                position: 'absolute', top: 70, left: 16, zIndex: 20,
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 20, padding: '6px 14px',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                fontFamily: "'Libre Franklin', sans-serif",
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              All Trucks
            </button>

            {hasHero ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={truck.photoUrl}
                  alt={`${truck.name} food truck`}
                  className="ftp-hero-img"
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.45) 100%)',
                }} />
                {/* Active status badge */}
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 72, right: 16,
                    background: '#22c55e', color: '#fff',
                    borderRadius: 20, padding: '5px 12px',
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    display: 'flex', alignItems: 'center', gap: 5,
                    boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
                  }}>
                    <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', display: 'inline-block' }}></span>
                    ON THE LAKE
                  </div>
                )}
              </div>
            ) : (
              /* No photo placeholder */
              <div style={{
                height: 220, paddingTop: 0,
                background: `linear-gradient(135deg, ${ACCENT}30 0%, ${ACCENT}10 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ fontSize: 64, opacity: 0.35 }}>🚚</div>
              </div>
            )}
          </div>

          {/* ── Identity card ── */}
          <div className="ftp-identity-card">
            {/* Category accent bar */}
            <div style={{
              height: 3, borderRadius: 2, marginBottom: 16,
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}80)`,
            }} />

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  fontWeight: 700, color: C.dusk,
                  margin: '0 0 8px', lineHeight: 1.15,
                }}>
                  {truck.name}
                </h1>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    background: `${ACCENT}18`, color: ACCENT,
                    borderRadius: 20, padding: '3px 11px',
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                  }}>
                    Food Truck
                  </span>
                  {truck.cuisine && (
                    <span style={{
                      background: C.warmWhite, color: C.textLight,
                      borderRadius: 20, padding: '3px 11px',
                      fontSize: 11, fontWeight: 500,
                      border: `1px solid ${C.sand}`,
                    }}>
                      {truck.cuisine}
                    </span>
                  )}
                  <span style={{ color: C.textMuted, fontSize: 11 }}>Manitou Beach, MI</span>
                </div>
              </div>
            </div>

            {/* Inline action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {truck.phone && (
                <a href={`tel:${truck.phone}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: C.sage, color: '#fff',
                  borderRadius: 8, padding: '9px 16px',
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  minHeight: 44,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                  </svg>
                  Call
                </a>
              )}
              {truck.website && (
                <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: C.warmWhite, color: C.dusk,
                  borderRadius: 8, padding: '9px 16px',
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  border: `1.5px solid ${C.sand}`, minHeight: 44,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15,3 21,3 21,9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Website
                </a>
              )}
            </div>
          </div>

          {/* ── Page content ── */}
          <div style={{ maxWidth: 660, margin: '0 auto', padding: '20px 16px 100px' }}>
            <FadeIn>

              {/* Today's Special - prominent callout */}
              {truck.todaysSpecial && (
                <div style={{
                  background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
                  border: `2px solid ${ACCENT}40`,
                  borderRadius: 14, padding: '18px 20px', marginBottom: 14,
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: ACCENT, display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>
                      Today's Special
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.dusk, lineHeight: 1.4 }}>
                      {truck.todaysSpecial}
                    </div>
                  </div>
                </div>
              )}

              {/* About */}
              {truck.description && (
                <div className="ftp-section-card">
                  <div className="ftp-section-label">About This Truck</div>
                  <p style={{
                    margin: 0, fontSize: 16, lineHeight: 1.75,
                    color: C.text,
                    fontFamily: "'Libre Baskerville', serif",
                  }}>
                    {truck.description}
                  </p>
                </div>
              )}

              {/* Where to find */}
              {(truck.locationNote || truck.scheduleNote || truck.comingDate || truck.departureTime || truck.lat) && (
                <div className="ftp-section-card">
                  <div className="ftp-section-label">Where to Find Us</div>
                  <div>
                    {truck.locationNote && (
                      <TruckInfoRow
                        icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
                        label="Current Location"
                        accent={ACCENT}
                      >
                        {truck.locationNote}
                      </TruckInfoRow>
                    )}
                    {truck.scheduleNote && (
                      <TruckInfoRow
                        icon={<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                        label="Schedule"
                        accent={ACCENT}
                      >
                        {truck.scheduleNote}
                      </TruckInfoRow>
                    )}
                    {truck.comingDate && (
                      <TruckInfoRow
                        icon={<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>}
                        label="Coming Up"
                        accent={ACCENT}
                      >
                        {truck.comingEventName
                          ? `${truck.comingEventName} - ${fmtDate(truck.comingDate)}`
                          : fmtDate(truck.comingDate)}
                      </TruckInfoRow>
                    )}
                    {truck.departureTime && (
                      <TruckInfoRow
                        icon={<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>}
                        label="Wrapping Up"
                        accent={C.textMuted}
                      >
                        {truck.departureTime}
                      </TruckInfoRow>
                    )}
                    {truck.lat && truck.lng && (
                      <a
                        href={`https://maps.google.com/?q=${truck.lat},${truck.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          marginTop: 4, display: 'flex', alignItems: 'center', gap: 10,
                          background: C.warmWhite, borderRadius: 10,
                          padding: '13px 16px', textDecoration: 'none', color: C.text,
                          border: `1.5px solid ${C.sand}`, transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.sand}
                      >
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="3,11 22,2 13,21 11,13"/>
                        </svg>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Get Directions</span>
                        <span style={{ fontSize: 12, color: C.textMuted }}>Google Maps ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              {(truck.phone || truck.website) && (
                <div className="ftp-section-card">
                  <div className="ftp-section-label">Contact</div>
                  <div>
                    {truck.phone && (
                      <TruckInfoRow
                        icon={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>}
                        label="Phone"
                        accent={ACCENT}
                      >
                        <a href={`tel:${truck.phone}`} style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 500 }}>
                          {truck.phone}
                        </a>
                      </TruckInfoRow>
                    )}
                    {truck.website && (
                      <TruckInfoRow
                        icon={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}
                        label="Website"
                        accent={ACCENT}
                      >
                        <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 500 }}>
                          {truck.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>↗</span>
                        </a>
                      </TruckInfoRow>
                    )}
                  </div>
                </div>
              )}

              {/* Community badge */}
              <div style={{
                borderRadius: 14, overflow: 'hidden',
                background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
                padding: '24px 22px', marginBottom: 16,
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>🏖️</div>
                  <div>
                    <div style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 5,
                    }}>
                      Part of Manitou Beach
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                      {truck.name} rolls through Manitou Beach, Michigan - on Devils Lake, in the heart of the Irish Hills.
                    </p>
                    <a href="/food-trucks" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: 0.3 }}>
                      See all food trucks →
                    </a>
                  </div>
                </div>
              </div>

              {/* Claim nudge */}
              <div style={{
                borderRadius: 14, background: `${ACCENT}10`,
                border: `1.5px dashed ${ACCENT}50`,
                padding: '20px 22px',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.dusk, marginBottom: 6 }}>
                  Is this your truck?
                </div>
                <p style={{ margin: '0 0 14px', fontSize: 13, color: C.textLight, lineHeight: 1.65 }}>
                  Add your photo, schedule, specials, and contact info. Starting at $9/mo.
                </p>
                <Btn href="/featured" variant="primary" small>Claim This Listing</Btn>
              </div>

            </FadeIn>
          </div>

          {/* ── Sticky action bar ── */}
          {hasActions && (
            <div className={`ftp-sticky${stickyVisible ? ' visible' : ''}`}>
              {truck.phone && (
                <a href={`tel:${truck.phone}`} className="ftp-action-btn"
                  style={{ background: C.sage, color: '#fff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                  </svg>
                  Call Now
                </a>
              )}
              {truck.website && (
                <a href={truck.website} target="_blank" rel="noopener noreferrer" className="ftp-action-btn"
                  style={{ background: ACCENT, color: '#fff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15,3 21,3 21,9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Visit Website
                </a>
              )}
            </div>
          )}
        </>
      )}

      {!loading && <Footer />}
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function TruckInfoRow({ icon, label, children, accent }) {
  return (
    <div className="ftp-info-row">
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: C.text }}>
          {children}
        </div>
      </div>
    </div>
  );
}
