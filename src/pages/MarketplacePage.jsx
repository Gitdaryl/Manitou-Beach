import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { SectionLabel, SectionTitle, ScrollProgress, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';
import { MARKETPLACE_LISTINGS, getListing } from '../data/marketplace';

// ============================================================
// 🏡  MARKETPLACE (/marketplace, /marketplace/:slug)
// Homes and land for sale by owner. Buyers contact the owner
// directly; we only host the listing.
// ============================================================

const photoBase = (slug) => `/images/marketplace/${slug}`;
const fullSrc = (slug, id) => `${photoBase(slug)}/full/${id}.webp`;
const thumbSrc = (slug, id) => `${photoBase(slug)}/thumb/${id}.webp`;

const DISCLAIMER =
  'Listed by the owner. Manitou Beach Michigan is not a real estate broker and does not represent the buyer or seller. All details are provided by the seller and should be independently verified.';

function MarketplaceStyles() {
  return (
    <style>{`
      .mkt-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
      .mkt-hero { position: relative; height: 88vh; min-height: 520px; overflow: hidden; background: ${C.night}; }
      .mkt-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .mkt-hero-copy { position: absolute; inset: auto 0 0 0; padding: 120px 0 48px;
        background: linear-gradient(to top, rgba(26,40,48,0.88), rgba(26,40,48,0.45) 60%, transparent); color: ${C.cream}; }
      .mkt-badge { display: inline-block; background: ${C.sunset}; color: ${C.cream}; font: 700 12px 'Libre Franklin', sans-serif;
        letter-spacing: 2px; text-transform: uppercase; padding: 7px 14px; border-radius: 3px; margin-bottom: 16px; }
      .mkt-hero h1 { font: 400 clamp(38px, 6vw, 68px)/1.05 'Libre Baskerville', serif; margin: 6px 0 8px; color: ${C.cream}; }
      .mkt-kicker { font: 600 13px 'Libre Franklin', sans-serif; letter-spacing: 2px; text-transform: uppercase; color: ${C.sunsetLight}; }
      .mkt-locale { font: 400 18px 'Libre Franklin', sans-serif; color: rgba(250,246,239,0.85); }
      .mkt-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
      .mkt-pill { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border-radius: 999px;
        border: 1.5px solid rgba(255,255,255,0.55); background: rgba(26,40,48,0.35); color: ${C.cream}; cursor: pointer;
        font: 600 14px 'Libre Franklin', sans-serif; text-decoration: none; backdrop-filter: blur(6px); }
      .mkt-pill.solid { background: ${C.sunset}; border-color: ${C.sunset}; }

      .mkt-notice { background: ${C.dusk}; color: ${C.cream}; }
      .mkt-notice .mkt-wrap { display: flex; gap: 14px; align-items: center; padding-top: 18px; padding-bottom: 18px;
        font: 500 15px/1.5 'Libre Franklin', sans-serif; }
      .mkt-notice strong { color: ${C.sunsetLight}; }

      .mkt-intro { padding: 72px 0 56px; background: ${C.cream}; }
      .mkt-intro-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 56px; align-items: start; }
      .mkt-tagline { font: 400 clamp(24px, 3vw, 32px)/1.3 'Libre Baskerville', serif; color: ${C.dusk}; margin-bottom: 20px; }
      .mkt-desc { font: 400 17px/1.8 'Libre Franklin', sans-serif; color: ${C.text}; }
      .mkt-price-card { background: ${C.warmWhite}; border: 1px solid ${C.sand}; border-radius: 12px; padding: 28px; }
      .mkt-price { font: 700 40px 'Libre Baskerville', serif; color: ${C.dusk}; }
      .mkt-price-sub { font: 500 14px 'Libre Franklin', sans-serif; color: ${C.textMuted}; margin: 4px 0 20px; }
      .mkt-facts { display: flex; flex-wrap: wrap; gap: 1px; background: ${C.sand};
        border: 1px solid ${C.sand}; border-radius: 12px; overflow: hidden; margin-top: 48px; }
      .mkt-fact { flex: 1 1 120px; background: ${C.warmWhite}; padding: 22px 12px; text-align: center; }
      .mkt-fact .num { font: 700 28px 'Libre Baskerville', serif; color: ${C.dusk}; }
      .mkt-fact .lbl { font: 600 12px 'Libre Franklin', sans-serif; letter-spacing: 1.5px; text-transform: uppercase; color: ${C.textMuted}; margin-top: 4px; }

      .mkt-features { padding: 64px 0; background: ${C.warmWhite}; }
      .mkt-feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 28px; }
      .mkt-feature { background: ${C.cream}; border: 1px solid ${C.sand}; border-radius: 12px; padding: 26px; }
      .mkt-feature h3 { font: 400 22px 'Libre Baskerville', serif; color: ${C.dusk}; margin: 0 0 14px; }
      .mkt-feature ul { margin: 0; padding: 0; list-style: none; }
      .mkt-feature li { position: relative; padding: 8px 0 8px 22px; font: 400 15.5px/1.55 'Libre Franklin', sans-serif; color: ${C.text};
        border-top: 1px solid ${C.sand}; }
      .mkt-feature li:first-child { border-top: 0; }
      .mkt-feature li::before { content: ''; position: absolute; left: 2px; top: 16px; width: 8px; height: 8px; border-radius: 50%; background: ${C.sage}; }

      .mkt-gallery { padding: 72px 0; background: ${C.cream}; }
      .mkt-gallery-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; flex-wrap: wrap; }
      .mkt-count { font: 500 14px 'Libre Franklin', sans-serif; color: ${C.textMuted}; }
      .mkt-chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 20px 0 24px; }
      .mkt-chips button { min-height: 40px; padding: 0 16px; border-radius: 999px; border: 1px solid ${C.sand}; background: ${C.warmWhite};
        color: ${C.dusk}; font: 600 14px 'Libre Franklin', sans-serif; cursor: pointer; }
      .mkt-chips button:hover { border-color: ${C.sage}; background: ${C.sage}18; }
      .mkt-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-flow: dense; gap: 12px; }
      .mkt-grid button { display: block; width: 100%; border: 0; padding: 0; background: ${C.sand}; cursor: zoom-in;
        border-radius: 8px; overflow: hidden; scroll-margin-top: 90px; }
      .mkt-grid button.feature { grid-column: span 2; }
      .mkt-grid img { display: block; width: 100%; height: 100%; aspect-ratio: 3 / 2; object-fit: cover; transition: transform 0.5s ease; }
      .mkt-grid button:hover img { transform: scale(1.035); }
      .mkt-ph-fill { position: relative; display: block; aspect-ratio: 3 / 2; overflow: hidden; }
      .mkt-ph-fill .blur { position: absolute; inset: 0; aspect-ratio: auto; filter: blur(20px) brightness(0.9); transform: scale(1.2); }
      .mkt-ph-fill .main { position: relative; aspect-ratio: auto; object-fit: contain; }

      .mkt-map { padding: 72px 0; background: ${C.warmWhite}; }
      .mkt-map-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: start; }
      .mkt-map iframe { width: 100%; height: 380px; border: 0; border-radius: 12px; }
      .mkt-area { list-style: none; margin: 20px 0 0; padding: 0; }
      .mkt-area li { display: flex; justify-content: space-between; gap: 12px; padding: 11px 0; border-top: 1px solid ${C.sand};
        font: 400 15.5px 'Libre Franklin', sans-serif; color: ${C.text}; }
      .mkt-area .d { color: ${C.textMuted}; white-space: nowrap; }
      .mkt-area-note { font: 400 13px 'Libre Franklin', sans-serif; color: ${C.textMuted}; margin-top: 12px; }

      .mkt-contact { padding: 80px 0; background: ${C.night}; color: ${C.cream}; }
      .mkt-contact-inner { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: center; }
      .mkt-contact h2 { font: 400 clamp(30px, 4vw, 44px)/1.15 'Libre Baskerville', serif; margin: 10px 0 14px; color: ${C.cream}; }
      .mkt-contact p { font: 400 16.5px/1.7 'Libre Franklin', sans-serif; color: rgba(250,246,239,0.8); margin: 0; }
      .mkt-contact-ctas { display: flex; flex-direction: column; gap: 12px; }
      .mkt-contact-ctas a { text-align: center; }
      .mkt-disclaimer { font: 400 13px/1.6 'Libre Franklin', sans-serif; color: ${C.textMuted}; padding: 28px 0; background: ${C.cream}; }

      .mkt-sticky { position: fixed; left: 0; right: 0; bottom: 0; z-index: 900; display: none; gap: 10px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
        background: rgba(26,40,48,0.96); backdrop-filter: blur(10px); }
      .mkt-sticky a { flex: 1; text-align: center; }

      .mkt-lightbox { position: fixed; inset: 0; z-index: 2000; background: rgba(10,16,20,0.96); display: flex; align-items: center; justify-content: center; }
      .mkt-lightbox img { max-width: 94vw; max-height: 88vh; object-fit: contain; }
      .mkt-lb-btn { position: absolute; width: 48px; height: 48px; border-radius: 50%; border: 0; background: rgba(255,255,255,0.12);
        color: #fff; font-size: 28px; line-height: 48px; cursor: pointer; }
      .mkt-lb-prev { left: 16px; top: 50%; transform: translateY(-50%); }
      .mkt-lb-next { right: 16px; top: 50%; transform: translateY(-50%); }
      .mkt-lb-close { top: 16px; right: 16px; font-size: 20px; }
      .mkt-lb-counter { position: absolute; bottom: 18px; left: 0; right: 0; text-align: center; color: rgba(255,255,255,0.7);
        font: 500 14px 'Libre Franklin', sans-serif; }

      .mkt-index-hero { padding: 150px 0 64px; background: linear-gradient(160deg, ${C.dusk}, ${C.night}); color: ${C.cream}; }
      .mkt-index-hero h1 { font: 400 clamp(38px, 6vw, 60px)/1.1 'Libre Baskerville', serif; margin: 12px 0 16px; color: ${C.cream}; }
      .mkt-index-hero p { font: 400 18px/1.7 'Libre Franklin', sans-serif; color: rgba(250,246,239,0.8); max-width: 640px; margin: 0; }
      .mkt-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 28px; padding: 64px 0 80px; }
      .mkt-card { display: block; background: ${C.warmWhite}; border: 1px solid ${C.sand}; border-radius: 14px; overflow: hidden;
        text-decoration: none; color: inherit; transition: transform 0.25s ease, box-shadow 0.25s ease; }
      .mkt-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(26,40,48,0.14); }
      .mkt-card-img { position: relative; aspect-ratio: 3 / 2; }
      .mkt-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .mkt-card-img .mkt-badge { position: absolute; top: 14px; left: 14px; margin: 0; }
      .mkt-card-body { padding: 22px 24px 26px; }
      .mkt-card-price { font: 700 26px 'Libre Baskerville', serif; color: ${C.dusk}; }
      .mkt-card-addr { font: 600 17px 'Libre Franklin', sans-serif; color: ${C.text}; margin-top: 6px; }
      .mkt-card-sum { font: 400 15px/1.6 'Libre Franklin', sans-serif; color: ${C.textLight}; margin-top: 10px; }
      .mkt-sell { background: ${C.warmWhite}; border-top: 1px solid ${C.sand}; padding: 56px 0; text-align: center; }
      .mkt-sell p { font: 400 17px/1.7 'Libre Franklin', sans-serif; color: ${C.textLight}; max-width: 560px; margin: 0 auto 24px; }

      @media (max-width: 860px) {
        .mkt-intro-grid, .mkt-map-grid, .mkt-contact-inner { grid-template-columns: 1fr; gap: 32px; }
        .mkt-feature-grid { grid-template-columns: 1fr; }
        .mkt-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .mkt-hero { height: 78vh; }
        .mkt-sticky { display: flex; }
        .mkt-disclaimer { padding-bottom: 96px; }
      }
      @media (max-width: 480px) {
        .mkt-wrap { padding: 0 16px; }
        .mkt-cards { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}

function Lightbox({ photos, index, onClose, onMove }) {
  const touchX = useRef(null);
  const prev = useCallback(() => onMove((index - 1 + photos.length) % photos.length), [index, photos.length, onMove]);
  const next = useCallback(() => onMove((index + 1) % photos.length), [index, photos.length, onMove]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [prev, next, onClose]);

  // Preload neighbors so the arrows feel instant
  useEffect(() => {
    [index - 1, index + 1].forEach((i) => { new Image().src = photos[(i + photos.length) % photos.length]; });
  }, [index, photos]);

  return (
    <div
      className="mkt-lightbox"
      onClick={onClose}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (dx > 45) prev();
        else if (dx < -45) next();
      }}
    >
      <img src={photos[index]} alt={`Photo ${index + 1}`} onClick={(e) => e.stopPropagation()} />
      <button className="mkt-lb-btn mkt-lb-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
      <button className="mkt-lb-btn mkt-lb-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
      <button className="mkt-lb-btn mkt-lb-close" aria-label="Close" onClick={onClose}>✕</button>
      <div className="mkt-lb-counter">{index + 1} / {photos.length}</div>
    </div>
  );
}

function PageShell({ children, seo }) {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'clip' }}>
      <SEOHead {...seo} />
      <GlobalStyles />
      <MarketplaceStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      {children}
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ── /marketplace ─────────────────────────────────────────────
export default function MarketplacePage() {
  return (
    <PageShell
      seo={{
        title: 'Marketplace: Homes for Sale by Owner',
        description: 'Homes and land for sale by owner around Devils Lake, Manitou Beach, and the Michigan Irish Hills. Contact the owner directly.',
        path: '/marketplace',
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Marketplace', path: '/marketplace' },
        ],
      }}
    >
      <section className="mkt-index-hero">
        <div className="mkt-wrap">
          <SectionLabel light>Marketplace</SectionLabel>
          <h1>For Sale by Owner, around the lake</h1>
          <p>Homes and land offered by your neighbors around Devils Lake and the Irish Hills. No middleman: every listing puts you straight in touch with the owner.</p>
        </div>
      </section>
      <div className="mkt-wrap">
        <div className="mkt-cards">
          {MARKETPLACE_LISTINGS.map((l) => (
            <a key={l.slug} className="mkt-card" href={`/marketplace/${l.slug}`}>
              <div className="mkt-card-img">
                <img src={thumbSrc(l.slug, l.heroImage)} alt={`${l.address}, ${l.city}`} />
                <span className="mkt-badge">{l.status}</span>
              </div>
              <div className="mkt-card-body">
                <div className="mkt-card-price">{l.price}</div>
                <div className="mkt-card-addr">{l.address}, {l.city}</div>
                <div className="mkt-card-sum">{l.summary}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <section className="mkt-sell">
        <div className="mkt-wrap">
          <SectionTitle center>Selling your own place?</SectionTitle>
          <p>We can put your home or land in front of the folks who already follow the lake. Drop us a note and we will get you set up.</p>
          <Btn href="mailto:hello@manitoubeachmichigan.com?subject=Marketplace%20listing" variant="primary">Get in touch</Btn>
        </div>
      </section>
    </PageShell>
  );
}

// ── /marketplace/:slug ───────────────────────────────────────
export function MarketplaceListingPage() {
  const { slug } = useParams();
  const listing = getListing(slug);
  const [lightbox, setLightbox] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!listing) {
    return (
      <PageShell seo={{ title: 'Listing not found', path: '/marketplace', noindex: true }}>
        <div className="mkt-wrap" style={{ padding: '180px 24px 120px' }}>
          <SectionTitle>That listing is no longer here</SectionTitle>
          <p style={{ marginTop: 12 }}><a href="/marketplace" style={{ color: C.sage }}>See everything in the Marketplace</a></p>
        </div>
      </PageShell>
    );
  }

  const fullAddress = `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`;
  const photos = listing.gallery.map((id) => fullSrc(listing.slug, id));
  const portraits = new Set(listing.portraits || []);
  const { contact } = listing;
  const smsBody = encodeURIComponent(`Hi ${contact.name}, I saw ${listing.address} on Manitou Beach Michigan and would like to set up a showing.`);
  const smsHref = `sms:${contact.tel}?&body=${smsBody}`;

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${listing.address}, ${listing.city}`, url }); } catch { /* dismissed */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard blocked */ }
  };

  let landscapeIdx = 0;

  return (
    <PageShell
      seo={{
        title: `${listing.address}, ${listing.city} - For Sale by Owner`,
        description: `${listing.price}. ${listing.summary}`,
        path: `/marketplace/${listing.slug}`,
        ogImage: `https://manitoubeachmichigan.com/images/og/marketplace-${listing.slug}.jpg`,
        breadcrumbs: [
          { name: 'Home', path: '/' },
          { name: 'Marketplace', path: '/marketplace' },
          { name: listing.address, path: `/marketplace/${listing.slug}` },
        ],
        schema: {
          '@context': 'https://schema.org',
          '@type': 'SingleFamilyResidence',
          name: fullAddress,
          description: listing.summary,
          numberOfRooms: listing.facts.Bedrooms,
          floorSize: { '@type': 'QuantitativeValue', value: listing.facts['Sq Ft'].replace(/,/g, ''), unitCode: 'FTK' },
          address: {
            '@type': 'PostalAddress',
            streetAddress: listing.address,
            addressLocality: listing.city,
            addressRegion: listing.state,
            postalCode: listing.zip,
            addressCountry: 'US',
          },
          image: `https://manitoubeachmichigan.com${fullSrc(listing.slug, listing.heroImage)}`,
        },
      }}
    >
      <section className="mkt-hero">
        <img src={fullSrc(listing.slug, listing.heroImage)} alt={fullAddress} fetchpriority="high" />
        <div className="mkt-hero-copy">
          <div className="mkt-wrap">
            <span className="mkt-badge">{listing.status} · {listing.price}</span>
            <div className="mkt-kicker">{listing.tagline}</div>
            <h1>{listing.address}</h1>
            <div className="mkt-locale">{listing.city}, Michigan {listing.zip}</div>
            <div className="mkt-hero-actions">
              <a className="mkt-pill solid" href="#contact">Book a showing</a>
              <button className="mkt-pill" onClick={share}>{copied ? 'Link copied' : 'Share this home'}</button>
            </div>
          </div>
        </div>
      </section>

      <div className="mkt-notice" role="note">
        <div className="mkt-wrap">
          <span aria-hidden="true" style={{ fontSize: 22 }}>🔑</span>
          <span><strong>By appointment only.</strong> Please do not stop by the house. Call or text {contact.name} at <a href={`tel:${contact.tel}`} style={{ color: C.cream }}>{contact.phone}</a> to set up a showing.</span>
        </div>
      </div>

      <section className="mkt-intro">
        <div className="mkt-wrap">
          <div className="mkt-intro-grid">
            <div>
              <SectionLabel>Marketplace · For Sale by Owner</SectionLabel>
              <div className="mkt-tagline">Country space, minutes from the lake.</div>
              <p className="mkt-desc">{listing.description}</p>
            </div>
            <div className="mkt-price-card">
              <div className="mkt-price">{listing.price}</div>
              <div className="mkt-price-sub">Offered by the owner</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Btn href={`tel:${contact.tel}`} variant="sunset" style={{ textAlign: 'center' }}>Call {contact.name}</Btn>
                <Btn href={smsHref} variant="outline" style={{ textAlign: 'center' }}>Text {contact.name}</Btn>
              </div>
            </div>
          </div>
          <div className="mkt-facts">
            {Object.entries(listing.facts).map(([label, value]) => (
              <div className="mkt-fact" key={label}>
                <div className="num">{value}</div>
                <div className="lbl">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-features">
        <div className="mkt-wrap">
          <SectionLabel>What you get</SectionLabel>
          <SectionTitle>The details</SectionTitle>
          <div className="mkt-feature-grid">
            {listing.features.map((group) => (
              <div className="mkt-feature" key={group.title}>
                <h3>{group.title}</h3>
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-gallery">
        <div className="mkt-wrap">
          <div className="mkt-gallery-head">
            <SectionTitle style={{ marginBottom: 0 }}>Photo tour</SectionTitle>
            <div className="mkt-count">{listing.gallery.length} photos</div>
          </div>
          <div className="mkt-chips">
            {listing.gallerySections.map((s) => (
              <button
                key={s.label}
                onClick={() => document.getElementById(`photo-${s.startId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mkt-grid">
            {listing.gallery.map((id, i) => {
              const portrait = portraits.has(id);
              const feature = !portrait && landscapeIdx++ % 7 === 0;
              const alt = `${listing.address} photo ${i + 1}`;
              const loading = i < 6 ? 'eager' : 'lazy';
              return (
                <button key={id} id={`photo-${id}`} className={feature ? 'feature' : undefined} onClick={() => setLightbox(i)}>
                  {portrait ? (
                    <span className="mkt-ph-fill">
                      <img className="blur" src={thumbSrc(listing.slug, id)} alt="" aria-hidden="true" loading={loading} />
                      <img className="main" src={thumbSrc(listing.slug, id)} alt={alt} loading={loading} />
                    </span>
                  ) : (
                    <img src={feature ? fullSrc(listing.slug, id) : thumbSrc(listing.slug, id)} alt={alt} loading={loading} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mkt-map">
        <div className="mkt-wrap mkt-map-grid">
          <div>
            <SectionLabel>Location</SectionLabel>
            <SectionTitle>Just south of Devils Lake</SectionTitle>
            <p className="mkt-desc" style={{ fontSize: 16 }}>{fullAddress}. Quiet country road, open sky, and the lake a few minutes away.</p>
            <ul className="mkt-area">
              {listing.area.map((a) => (
                <li key={a.name}><span>{a.name}</span><span className="d">{a.dist} · {a.time}</span></li>
              ))}
            </ul>
            <div className="mkt-area-note">Approximate driving distances.</div>
          </div>
          <iframe
            title={`Map of ${fullAddress}`}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.mapQuery)}&z=13&output=embed`}
          />
        </div>
      </section>

      <section className="mkt-contact" id="contact">
        <div className="mkt-wrap mkt-contact-inner">
          <div>
            <SectionLabel light>Contact the owner</SectionLabel>
            <h2>Want to see it? Call or text {contact.name}.</h2>
            <p>{listing.showingNote}</p>
          </div>
          <div className="mkt-contact-ctas">
            <Btn href={`tel:${contact.tel}`} variant="sunset">Call {contact.phone}</Btn>
            <Btn href={smsHref} variant="outlineLight">Text {contact.name}</Btn>
          </div>
        </div>
      </section>

      <div className="mkt-disclaimer">
        <div className="mkt-wrap">{DISCLAIMER} <a href="/marketplace" style={{ color: C.sage }}>More Marketplace listings</a></div>
      </div>

      {lightbox == null && (
        <div className="mkt-sticky">
          <Btn href={`tel:${contact.tel}`} variant="sunset" small>Call</Btn>
          <Btn href={smsHref} variant="outlineLight" small>Text</Btn>
        </div>
      )}

      {lightbox != null && (
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} onMove={setLightbox} />
      )}
    </PageShell>
  );
}
