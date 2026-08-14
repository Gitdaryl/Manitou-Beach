import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlobalStyles, Navbar, Footer, NewsletterInline } from '../components/Layout';
import { ScrollProgress, SectionLabel } from '../components/Shared';
import { PhotoGallery } from '../components/PhotoGallery';
import EventPhotoWall from '../components/EventPhotoWall';
import { GALLERIES, galleryPhotos, galleryCover } from '../data/galleries';
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

  // "Know this car?" — galleries whose photos went up unlabelled let visitors
  // name what they are looking at. Returns the API's JSON so the form can show
  // a real message instead of a generic failure.
  const identify = async (fields) => {
    const r = await fetch('/api/car-identify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, ...fields }),
    });
    return r.json().catch(() => ({ error: 'That did not save. Please try again.' }));
  };

  // Curated galleries preview their first photo; crowd galleries use their cover.
  const ogImage = g.folder && g.prefix && g.count > 0 ? `${g.folder}/${g.prefix}-01.jpg` : galleryCover(g);

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
          {g.identify && (
            <p style={{ fontSize: 14.5, color: C.text, marginTop: 16, lineHeight: 1.65, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', background: C.warmWhite, border: `1px solid ${(C.lakeBlue || '#456') + '22'}`, borderRadius: 12, padding: '14px 18px' }}>
              <strong>Find your car.</strong> We have the photos but not the names, so open
              yours and tap <em>Know this car?</em> to tell us what it is. That is how the
              list gets built for next year.
            </p>
          )}
        </div>
      </section>

      {/* Curated gallery (only when there are placed photos) */}
      {photos.length > 0 && (
        <section style={{ background: C.cream, padding: '16px 24px 40px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <PhotoGallery photos={photos} slug={slug} title={g.title} shareText={`${g.title} — Manitou Beach, Devils Lake 🌅 See the whole gallery:`} onIdentify={g.identify ? identify : undefined} />
          </div>
        </section>
      )}

      {/* Crowd photo wall: upload + live community feed + community flagging */}
      {g.crowd && <EventPhotoWall slug={slug} title={g.title} />}

      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
