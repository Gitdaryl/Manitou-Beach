import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlobalStyles, Navbar, Footer, NewsletterInline } from '../components/Layout';
import { ScrollProgress, SectionLabel } from '../components/Shared';
import { PhotoGallery } from '../components/PhotoGallery';
import { GALLERIES, galleryPhotos } from '../data/galleries';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';

// ============================================================
// 📸  PUBLIC EVENT GALLERY  (/gallery/:slug)
// ============================================================
export default function GalleryPage() {
  const { slug } = useParams();
  const g = GALLERIES[slug];
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  // Unknown slug → gentle not-found rather than a blank screen.
  if (!g) {
    return (
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
        <GlobalStyles />
        <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '140px 24px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, marginBottom: 12 }}>Gallery not found</h1>
          <p style={{ color: C.textLight, marginBottom: 24 }}>That gallery doesn’t exist or has moved.</p>
          <Link to="/" style={{ color: C.lakeBlue || C.text, fontWeight: 600 }}>← Back home</Link>
        </div>
        <Footer scrollTo={subScrollTo} />
      </div>
    );
  }

  const photos = galleryPhotos(g);
  const ogImage = `${g.folder}/${g.prefix}-01.jpg`;

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden' }}>
      <SEOHead
        title={g.title}
        description={g.ogDescription || `${g.title} — photos from Manitou Beach on Devils Lake, Michigan.`}
        path={`/gallery/${slug}`}
        ogImage={ogImage}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: g.title, path: `/gallery/${slug}` },
        ]}
      />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Header */}
      <section style={{ background: C.cream, padding: '120px 24px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <SectionLabel>Photo Gallery</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 44px)', color: C.text, margin: '10px 0 12px', lineHeight: 1.15 }}>
            {g.title}
          </h1>
          {g.subtitle && (
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>{g.subtitle}</p>
          )}
          <p style={{ fontSize: 13, color: C.textLight, marginTop: 14, opacity: 0.85 }}>
            Tap any photo to view it larger — then share your favorites.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ background: C.cream, padding: '16px 24px 72px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <PhotoGallery photos={photos} slug={slug} title={g.title} shareText={`${g.title} — Manitou Beach, Devils Lake 🌅 See the whole gallery:`} />
        </div>
      </section>

      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
