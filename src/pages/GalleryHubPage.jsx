import React from 'react';
import { Link } from 'react-router-dom';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';
import { ScrollProgress, SectionLabel } from '../components/Shared';
import { galleryList, galleryCover } from '../data/galleries';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';

// ============================================================
// 📸  GALLERY HUB  (/gallery)
// ------------------------------------------------------------
// The front door for every event gallery, newest first. Community
// members and out-of-state visitors browse here; each tile opens the
// full gallery for that event (curated + crowd photos).
// ============================================================
export default function GalleryHubPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  const galleries = galleryList();

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <SEOHead
        title="Event Photo Galleries"
        description="Community photo galleries from events around Manitou Beach and Devils Lake, Michigan. Browse the moments, add your own, and share the day."
        path="/gallery"
        breadcrumbs={[{ name: 'Home', path: '/' }, { name: 'Galleries', path: '/gallery' }]}
      />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Header */}
      <section style={{ background: C.cream, padding: '120px 24px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionLabel>Photo Galleries</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 44px)', color: C.text, margin: '10px 0 12px', lineHeight: 1.15 }}>
            Moments around the lake
          </h1>
          <p style={{ color: C.textLight, fontSize: 16, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
            Photos from our community events on Devils Lake. Were you there? Open a gallery and add yours.
          </p>
        </div>
      </section>

      {/* Grid of galleries */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {galleries.map((g) => (
            <Link
              key={g.slug}
              to={`/gallery/${g.slug}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div style={{
                borderRadius: 14, overflow: 'hidden', background: C.warmWhite,
                border: `1px solid ${C.lakeBlue}22`, boxShadow: '0 2px 10px rgba(26,40,48,0.06)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(26,40,48,0.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,40,48,0.06)'; }}
              >
                <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', background: C.cream }}>
                  <img src={galleryCover(g)} alt={g.title} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {g.crowd && (
                    <span style={{ position: 'absolute', top: 10, left: 10, background: C.sunset, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                      Add your photos
                    </span>
                  )}
                </div>
                <div style={{ padding: '16px 18px 20px' }}>
                  <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.text, margin: '0 0 4px' }}>{g.title}</h2>
                  {g.date && <div style={{ color: C.textMuted, fontSize: 12.5, marginBottom: 6 }}>{g.date}</div>}
                  {g.subtitle && <p style={{ color: C.textLight, fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{g.subtitle}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
