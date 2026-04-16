import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn } from '../components/Shared';
import SEOHead from '../components/SEOHead';
import { WINERY_VENUES } from '../data/wineries';
import { toSlug } from '../utils/slugify';

const SECTION_LABELS = {
  village: 'Manitou Beach Village',
  trail: 'Irish Hills Wine Trail',
  extended: 'Worth the Drive',
};

export default function WineryProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 280);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const venue = WINERY_VENUES.find(v => toSlug(v.name) === slug) || null;

  const accent = venue?.accent || C.sage;
  const hasActions = venue && (venue.phone || venue.website);

  const schema = venue ? {
    '@context': 'https://schema.org',
    '@type': 'Winery',
    name: venue.name,
    description: venue.tagline,
    ...(venue.phone && { telephone: venue.phone }),
    ...(venue.website && { url: venue.website }),
    ...(venue.logo && { image: venue.logo }),
    ...(venue.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: venue.address,
        addressRegion: 'MI',
        addressCountry: 'US',
      },
    }),
    ...(venue.lat && venue.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: venue.lat, longitude: venue.lng },
    }),
    areaServed: { '@type': 'Place', name: 'Irish Hills, Michigan' },
  } : null;

  const scrollTo = id => { window.location.href = '/#' + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      <style>{`
        .wp-hero-img { width: 100%; height: 280px; object-fit: cover; display: block; }
        @media (min-width: 640px) { .wp-hero-img { height: 400px; } }

        .wp-identity-card {
          position: relative; z-index: 2;
          margin: -52px 16px 0; border-radius: 18px;
          background: #fff; box-shadow: 0 4px 32px rgba(0,0,0,0.13);
          padding: 22px 22px 18px;
        }
        @media (min-width: 640px) {
          .wp-identity-card { margin: -68px 32px 0; padding: 28px 32px 24px; }
        }

        .wp-section-card {
          background: #fff; border-radius: 14px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          padding: 22px 22px; margin-bottom: 16px;
        }
        @media (min-width: 640px) { .wp-section-card { padding: 28px 28px; } }

        .wp-action-btn {
          flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center;
          gap: 7px; padding: 14px 12px; border-radius: 12px; font-size: 14px;
          font-weight: 700; font-family: "'Libre Franklin', sans-serif";
          text-decoration: none; border: none; cursor: pointer;
          transition: filter 0.15s, transform 0.1s;
        }
        .wp-action-btn:active { transform: scale(0.97); filter: brightness(0.93); }

        .wp-section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: ${C.textMuted};
          margin-bottom: 14px; font-family: "'Libre Franklin', sans-serif";
        }

        .wp-brand-card {
          background: ${C.warmWhite}; border-radius: 12px;
          padding: 16px 18px; border: 1px solid ${C.sand};
          margin-bottom: 10px;
        }
        .wp-brand-card:last-child { margin-bottom: 0; }

        .wp-sticky {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: rgba(250,246,239,0.92); backdrop-filter: blur(16px);
          border-top: 1px solid ${C.sand};
          padding: 12px 16px calc(18px + env(safe-area-inset-bottom, 0px)); display: flex; gap: 10px;
          transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 -8px 32px rgba(0,0,0,0.1);
        }
        .wp-sticky.visible { transform: translateY(0); }
      `}</style>

      {venue && (
        <SEOHead
          title={`${venue.name} - ${venue.type}, Irish Hills Michigan`}
          description={venue.tagline}
          path={`/wineries/${slug}`}
          ogImage={venue.logo || undefined}
          ogType="website"
          schema={schema}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Wineries', path: '/wineries' },
            { name: venue.name, path: `/wineries/${slug}` },
          ]}
        />
      )}

      <Navbar activeSection="" scrollTo={scrollTo} isSubPage />

      {/* ── NOT FOUND ── */}
      {!venue && (
        <div style={{ paddingTop: 120, textAlign: 'center', padding: '120px 24px 80px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, marginBottom: 10 }}>
            Venue not found
          </h1>
          <p style={{ color: C.textMuted, fontSize: 15, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
            Head back to browse all wineries and trail stops.
          </p>
          <button
            onClick={() => navigate('/wineries')}
            style={{ background: C.sage, color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}
          >
            Back to Wine Trail
          </button>
        </div>
      )}

      {/* ── PROFILE ── */}
      {venue && (
        <>
          {/* Hero */}
          <div style={{ position: 'relative', paddingTop: 64, background: C.dusk }}>
            {(venue.photos?.[0] || venue.logo) ? (
              <img
                src={venue.photos?.[0] || venue.logo}
                alt={`${venue.name} - ${venue.type} in Irish Hills, Michigan`}
                className="wp-hero-img"
                style={{ objectPosition: 'center center' }}
              />
            ) : (
              <div className="wp-hero-img" style={{
                background: `linear-gradient(135deg, ${accent}cc 0%, ${C.dusk} 60%, ${C.lakeDark} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36,
                }}>
                  🍷
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>
                  {venue.name}
                </div>
              </div>
            )}
            {/* Gradient fade */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
              background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            {/* Back button */}
            <button
              onClick={() => navigate('/wineries')}
              style={{
                position: 'absolute', top: 80, left: 16,
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                borderRadius: 20, padding: '7px 14px 7px 10px',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: "'Libre Franklin', sans-serif",
              }}
            >
              ← Wine Trail
            </button>
          </div>

          {/* ── Identity card ── */}
          <div className="wp-identity-card">
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 4, borderRadius: 4, background: accent, alignSelf: 'stretch', flexShrink: 0, minHeight: 32 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Type + section chips */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{
                    background: `${accent}18`, color: accent,
                    borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 700,
                    letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>
                    {venue.type}
                  </span>
                  {venue.section && SECTION_LABELS[venue.section] && (
                    <span style={{
                      background: `${C.driftwood}18`, color: C.driftwood,
                      borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      {SECTION_LABELS[venue.section]}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 'clamp(22px, 5vw, 30px)',
                  fontWeight: 700, color: C.dusk, margin: '0 0 6px', lineHeight: 1.2,
                }}>
                  {venue.name}
                </h1>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textMuted, fontSize: 13, flexWrap: 'wrap' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{venue.distance || 'Irish Hills, MI'}</span>
                  {venue.address && (
                    <>
                      <span style={{ color: C.sand }}>·</span>
                      <span style={{ color: C.textMuted }}>{venue.address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 120px' }}>

            {/* Action buttons */}
            {hasActions && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="wp-action-btn"
                    style={{ background: C.sage, color: '#fff' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                    </svg>
                    Call
                  </a>
                )}
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer" className="wp-action-btn"
                    style={{ background: C.warmWhite, color: C.text, border: `1.5px solid ${C.sand}` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Website
                  </a>
                )}
                {venue.lat && venue.lng && (
                  <a
                    href={`https://maps.google.com/?q=${venue.lat},${venue.lng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="wp-action-btn"
                    style={{ background: C.warmWhite, color: C.text, border: `1.5px solid ${C.sand}` }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    Directions
                  </a>
                )}
              </div>
            )}

            <FadeIn>

              {/* ── Tagline / About ── */}
              <div className="wp-section-card">
                <div className="wp-section-label">About</div>
                <p style={{
                  fontSize: 16, lineHeight: 1.8,
                  color: C.text, margin: 0,
                  fontFamily: "'Libre Baskerville', serif",
                }}>
                  {venue.tagline}
                </p>
                {venue.highlight && (
                  <div style={{
                    marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: `${accent}10`, borderRadius: 8, padding: '10px 14px',
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>✨</span>
                    <span style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>{venue.highlight}</span>
                  </div>
                )}
              </div>

              {/* ── Hours ── */}
              {venue.hours && (
                <div className="wp-section-card">
                  <div className="wp-section-label">Hours</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                      background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{venue.hours}</div>
                      {venue.openingDate && (
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
                          Opening {venue.openingDate}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Hosted brands (Village tasting rooms) ── */}
              {venue.hostedBrands?.length > 0 && (
                <div className="wp-section-card">
                  <div className="wp-section-label">
                    {venue.hostedBrands.length === 1 ? 'Winery Poured Here' : 'Wineries Poured Here'}
                  </div>
                  {venue.hostedBrands.map((brand, i) => (
                    <div key={i} className="wp-brand-card">
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, marginBottom: brand.description ? 8 : 0,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16,
                        }}>
                          🍷
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.dusk }}>{brand.name}</div>
                      </div>
                      {brand.description && (
                        <p style={{ margin: 0, fontSize: 13, color: C.textLight, lineHeight: 1.65 }}>
                          {brand.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Photo gallery (if has photos array) ── */}
              {venue.photos?.length > 1 && (
                <div className="wp-section-card" style={{ padding: '22px 22px 16px' }}>
                  <div className="wp-section-label">Photos</div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                  }}>
                    {venue.photos.slice(0, 4).map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${venue.name} photo ${i + 1}`}
                        style={{
                          width: '100%',
                          height: i === 0 ? 180 : 120,
                          objectFit: 'cover',
                          borderRadius: 10,
                          ...(i === 0 && { gridColumn: '1 / -1', height: 200 }),
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Contact ── */}
              {(venue.phone || venue.website || venue.address) && (
                <div className="wp-section-card">
                  <div className="wp-section-label">Contact & Find Us</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {venue.address && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(venue.address + ', Michigan')}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          background: C.warmWhite, borderRadius: 10,
                          padding: '12px 14px', textDecoration: 'none',
                          border: `1.5px solid ${C.sand}`,
                        }}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 2 }}>Address</div>
                          <div style={{ fontSize: 14, color: C.lakeBlue, fontWeight: 500 }}>
                            {venue.address} <span style={{ fontSize: 11, opacity: 0.7 }}>↗</span>
                          </div>
                        </div>
                      </a>
                    )}
                    {venue.phone && (
                      <a href={`tel:${venue.phone}`} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: C.warmWhite, borderRadius: 10,
                        padding: '12px 14px', textDecoration: 'none',
                        border: `1.5px solid ${C.sand}`,
                      }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 2 }}>Phone</div>
                          <div style={{ fontSize: 14, color: C.lakeBlue, fontWeight: 500 }}>{venue.phone}</div>
                        </div>
                      </a>
                    )}
                    {venue.website && (
                      <a href={venue.website} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: C.warmWhite, borderRadius: 10,
                        padding: '12px 14px', textDecoration: 'none',
                        border: `1.5px solid ${C.sand}`,
                      }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 2 }}>Website</div>
                          <div style={{ fontSize: 14, color: C.lakeBlue, fontWeight: 500 }}>
                            {venue.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} <span style={{ fontSize: 11, opacity: 0.7 }}>↗</span>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* ── Trail badge ── */}
              <div style={{
                borderRadius: 14, overflow: 'hidden',
                background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
                padding: '24px 22px', marginBottom: 16,
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>🍷</div>
                  <div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 5 }}>
                      Irish Hills Wine Trail
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                      {venue.name} is part of the Manitou Beach Michigan wine and brewery trail - Michigan wine country meets lake country in the Irish Hills.
                    </p>
                    <a href="/wineries" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: 0.3 }}>
                      Explore the full trail →
                    </a>
                  </div>
                </div>
              </div>

            </FadeIn>
          </div>

          {/* ── Sticky action bar ── */}
          {hasActions && (
            <div className={`wp-sticky${stickyVisible ? ' visible' : ''}`}>
              {venue.phone && (
                <a href={`tel:${venue.phone}`} className="wp-action-btn"
                  style={{ background: C.sage, color: '#fff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                  </svg>
                  Call
                </a>
              )}
              {venue.website && (
                <a href={venue.website} target="_blank" rel="noopener noreferrer" className="wp-action-btn"
                  style={{ background: accent, color: '#fff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  Website
                </a>
              )}
            </div>
          )}
        </>
      )}

      {venue && <Footer />}
    </div>
  );
}
