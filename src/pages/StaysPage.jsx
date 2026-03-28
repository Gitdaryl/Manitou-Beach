import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, WaveDivider, PageSponsorBanner, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, PromoBanner } from '../components/Layout';
import { C } from '../data/config';
import { DISCOVER_MAP_STYLES } from '../data/discover';
import yeti from '../data/errorMessages';

const STAY_TYPES = ['All', 'Cottage', 'Airbnb', 'Tiny Home', 'Camping', 'Inn/B&B'];

const TYPE_COLORS = {
  'Cottage':  C.lakeBlue,
  'Airbnb':   C.sunset,
  'Tiny Home': C.sage,
  'Camping':  '#7A8E72',
  'Inn/B&B':  '#8B5E3C',
};

const AMENITY_ICONS = {
  Waterfront: '🌊', 'Pet Friendly': '🐾', WiFi: '📶', AC: '❄️',
  'Fire Pit': '🔥', Dock: '⚓', 'Boat Launch': '🚤', Kitchen: '🍳', Grill: '♨️',
};

const AMENITY_OPTIONS = Object.keys(AMENITY_ICONS);

// ── Photo Lightbox (infinite carousel) ──────────────────────
function PhotoLightbox({ images, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const overlayRef = useRef(null);

  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next]);

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        animation: 'lbFadeIn 0.2s ease',
      }}
    >
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 24,
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
        fontSize: 28, cursor: 'pointer', fontFamily: 'sans-serif', lineHeight: 1,
        padding: 8,
      }}>
        ×
      </button>

      {/* Counter */}
      <div style={{
        position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
        fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif",
        letterSpacing: 2,
      }}>
        {idx + 1} / {images.length}
      </div>

      {/* Prev */}
      <button onClick={e => { e.stopPropagation(); prev(); }} style={{
        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
        color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >
        ‹
      </button>

      {/* Image */}
      <img
        key={idx}
        src={images[idx]}
        alt=""
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '85vw', maxHeight: '85vh',
          borderRadius: 12, objectFit: 'contain',
          cursor: 'default',
          animation: 'lbSlideIn 0.25s ease',
        }}
      />

      {/* Next */}
      <button onClick={e => { e.stopPropagation(); next(); }} style={{
        position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50%', width: 48, height: 48, cursor: 'pointer',
        color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      >
        ›
      </button>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8,
        }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt=""
              onClick={e => { e.stopPropagation(); setIdx(i); }}
              style={{
                width: 56, height: 56, borderRadius: 8, objectFit: 'cover',
                border: i === idx ? `2px solid ${C.sunset}` : '2px solid transparent',
                opacity: i === idx ? 1 : 0.5,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes lbFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbSlideIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────
function StaysHero() {
  return (
    <section style={{
      background: `linear-gradient(180deg, ${C.night} 0%, ${C.dusk} 100%)`,
      padding: '180px 24px 140px',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 80%, rgba(91,126,149,0.15) 0%, transparent 60%)' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
        <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: C.sunset, marginBottom: 16 }}>
          Manitou Beach · Devils Lake · Round Lake
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, color: C.cream, margin: '0 0 20px', lineHeight: 1.15 }}>
          Stay at the Lake
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
          Cottages, cabins & camping on Devils Lake and Round Lake. Find your perfect spot — then book directly with the host.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          <ShareBar />
        </div>
      </div>
    </section>
  );
}

// ── Stay Card ───────────────────────────────────────────────
function StayCard({ stay, i }) {
  const accent = TYPE_COLORS[stay.stayType] || C.lakeBlue;
  const isFeatured = stay.tier === 'featured';

  return (
    <FadeIn delay={i * 80} direction={i % 2 === 0 ? 'left' : 'right'}>
      <div
        style={{
          background: isFeatured ? C.dusk : '#fff',
          border: `1px solid ${isFeatured ? C.lakeDark : '#e0dbd4'}`,
          boxShadow: isFeatured ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
          borderRadius: 16,
          padding: '32px 28px',
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.25s',
          cursor: (stay.bookingUrl || stay.website || stay.email || stay.phone) ? 'pointer' : 'default',
        }}
        onClick={() => {
          const url = stay.bookingUrl || stay.website;
          if (url) window.open(url, '_blank');
          else if (stay.email) window.location.href = `mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}`;
          else if (stay.phone) window.location.href = `tel:${stay.phone}`;
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px ${accent}30`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Left accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: accent, borderRadius: '16px 0 0 16px' }} />

        {/* Logo */}
        {stay.logo && (
          <img src={stay.logo} alt="" style={{ width: 120, height: 120, borderRadius: 16, objectFit: 'cover', flexShrink: 0, background: C.sand }} />
        )}

        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: isFeatured ? C.cream : C.text, margin: 0 }}>
              {stay.name}
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {isFeatured && (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.cream, background: C.sunset, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>
                  ✦ Staff Pick
                </span>
              )}
              {stay.stayType && (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isFeatured ? C.cream : accent, background: isFeatured ? `${accent}40` : `${accent}15`, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {stay.stayType}
                </span>
              )}
            </div>
          </div>

          {/* Beds & Guests */}
          {(stay.beds || stay.guests) && (
            <div style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 8 }}>
              {stay.beds && <span>🛏 {stay.beds} bed{stay.beds !== 1 ? 's' : ''}</span>}
              {stay.beds && stay.guests && <span> · </span>}
              {stay.guests && <span>👥 Sleeps {stay.guests}</span>}
            </div>
          )}

          {/* Description */}
          {stay.description && (
            <p style={{ fontSize: 14, color: isFeatured ? 'rgba(255,255,255,0.7)' : C.textLight, lineHeight: 1.7, margin: '0 0 14px 0' }}>
              {stay.description}
            </p>
          )}

          {/* Amenity tags */}
          {stay.amenities && stay.amenities.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {stay.amenities.map(a => (
                <span key={a} style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 12,
                  background: isFeatured ? 'rgba(255,255,255,0.1)' : `${accent}10`,
                  color: isFeatured ? 'rgba(255,255,255,0.6)' : accent,
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontWeight: 600,
                  border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.08)' : `${accent}20`}`,
                }}>
                  {AMENITY_ICONS[a] || '·'} {a}
                </span>
              ))}
            </div>
          )}

          {/* Address, Phone & Email */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
            {stay.address && <span style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted }}>📍 {stay.address}</span>}
            {stay.phone && <a href={`tel:${stay.phone}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, textDecoration: 'none' }}>📞 {stay.phone}</a>}
            {stay.email && <a href={`mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, textDecoration: 'none' }}>✉️ {stay.email}</a>}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {(() => {
              const ctaStyle = {
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700,
                letterSpacing: 1.5, textTransform: 'uppercase',
                color: isFeatured ? C.sunset : accent,
                textDecoration: 'none',
              };
              if (stay.bookingUrl) return <a href={stay.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={ctaStyle}>Book Now →</a>;
              if (stay.website) return <a href={stay.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={ctaStyle}>Visit Website →</a>;
              if (stay.email) return <a href={`mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}`} onClick={e => e.stopPropagation()} style={ctaStyle}>Send Inquiry →</a>;
              if (stay.phone) return <a href={`tel:${stay.phone}`} onClick={e => e.stopPropagation()} style={ctaStyle}>Call to Inquire →</a>;
              return null;
            })()}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// ── Map Section ─────────────────────────────────────────────
function StaysMapSection({ stays }) {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapDivRef = useRef(null);
  const mapObjRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const mapStays = stays.filter(s => s.lat && s.lng);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError('Map API key not configured.'); return; }
    if (!mapDivRef.current) return;
    let active = true;
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      new Loader({ apiKey, version: 'weekly' }).load().then(google => {
        if (!active || !mapDivRef.current) return;
        googleRef.current = google;
        mapObjRef.current = new google.maps.Map(mapDivRef.current, {
          center: { lat: 42.005, lng: -84.289 },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          styles: DISCOVER_MAP_STYLES,
        });
        infoWindowRef.current = new google.maps.InfoWindow();
        setMapReady(true);
      }).catch(() => { if (active) setMapError('Map failed to load.'); });
    }).catch(() => { if (active) setMapError('Map loader error.'); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!mapReady || !googleRef.current || !mapObjRef.current) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    mapStays.forEach(stay => {
      const color = TYPE_COLORS[stay.stayType] || C.lakeBlue;
      const marker = new googleRef.current.maps.Marker({
        position: { lat: stay.lat, lng: stay.lng },
        map: mapObjRef.current,
        title: stay.name,
        icon: {
          path: googleRef.current.maps.SymbolPath.CIRCLE,
          fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 8,
        },
      });
      marker.addListener('click', () => {
        const bookLink = stay.bookingUrl || stay.website;
        infoWindowRef.current.setContent(`
          <div style="font-family:'Libre Franklin',sans-serif;padding:4px;max-width:220px">
            <strong style="font-size:14px">${stay.name}</strong><br>
            <span style="font-size:11px;color:#666">${stay.stayType || ''}</span>
            ${stay.beds ? `<br><span style="font-size:11px">🛏 ${stay.beds} beds · 👥 ${stay.guests || '?'} guests</span>` : ''}
            ${bookLink ? `<br><a href="${bookLink}" target="_blank" style="font-size:12px;color:${C.sunset};font-weight:700;text-decoration:none">${stay.bookingUrl ? 'Book Now →' : 'Website →'}</a>` : stay.email ? `<br><a href="mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}" style="font-size:12px;color:${C.sunset};font-weight:700;text-decoration:none">Send Inquiry →</a>` : stay.phone ? `<br><a href="tel:${stay.phone}" style="font-size:12px;color:${C.sunset};font-weight:700;text-decoration:none">Call →</a>` : ''}
          </div>
        `);
        infoWindowRef.current.open(mapObjRef.current, marker);
      });
      markersRef.current.push(marker);
    });
  }, [mapReady, mapStays.length]);

  if (!mapStays.length) return null;

  return (
    <section style={{ padding: '80px 24px', background: C.cream }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <SectionLabel>Find Your Spot</SectionLabel>
        <SectionTitle>Where to Stay</SectionTitle>
        {mapError ? (
          <p style={{ color: C.textMuted, textAlign: 'center' }}>{mapError}</p>
        ) : (
          <div ref={mapDivRef} style={{ width: '100%', height: 420, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.sand}`, marginTop: 24 }} />
        )}
      </div>
    </section>
  );
}

// ── List Your Property Form ─────────────────────────────────

const TIERS = [
  { key: 'free', name: 'Directory', price: '$0', priceSub: 'forever', color: C.textMuted, accent: C.warmGray, icon: '📋',
    headline: 'Get Found',
    tagline: 'Your name in the directory so visitors know you exist.',
    features: ['Name & property type', 'Basic text listing', 'Visible in directory search'],
  },
  { key: 'listed', name: 'Listed', price: '$9', priceSub: '/mo', color: C.lakeBlue, accent: C.lakeBlue, icon: '📸',
    headline: 'Stand Out',
    tagline: 'Photos, map pin, and a booking link — everything a guest needs to say yes.',
    features: ['Beautiful photo gallery', 'Map pin with address', 'Booking URL or inquiry button', 'Amenity badges', 'Full listing card'],
  },
  { key: 'featured', name: 'Featured', price: '$25', priceSub: '/mo', color: C.sunset, accent: C.sunset, icon: '✦',
    headline: 'Front & Center',
    tagline: 'Top placement, Staff Pick badge, and a listing that feels like a destination.',
    features: ['Everything in Listed', 'Top of directory placement', 'Staff Pick badge', 'Premium dark card design', 'Priority in search & map', 'Only 3 slots per type'],
    limited: true,
  },
];

function ListYourPropertySection({ stays = [] }) {
  const [tier, setTier] = useState('free');
  const [form, setForm] = useState({ name: '', stayType: '', address: '', bookingUrl: '', email: '', description: '', phone: '', beds: '', guests: '', amenities: [], photoUrl: '', photoUrl2: '', photoUrl3: '', _hp: '' });
  const [status, setStatus] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const formRef = useRef(null);

  const activeTier = TIERS.find(t => t.key === tier);
  const isFeatured = tier === 'featured';
  const isListed = tier === 'listed';
  const isPaid = isFeatured || isListed;

  // Featured slot availability — 3 per stay type
  const selectedType = form.stayType;
  const featuredCountForType = selectedType
    ? stays.filter(s => s.tier === 'featured' && s.stayType === selectedType).length
    : 0;
  const featuredFull = isFeatured && selectedType && featuredCountForType >= 3;
  const featuredSlotsLeft = selectedType ? Math.max(0, 3 - featuredCountForType) : 3;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));

  const selectTier = (key) => {
    setTier(key);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/stays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier }),
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  const baseInputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  };

  const inputStyle = isFeatured ? {
    ...baseInputStyle,
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid rgba(255,255,255,0.12)`,
    color: C.cream,
  } : {
    ...baseInputStyle,
    background: C.warmWhite,
    border: `1px solid ${C.sand}`,
    color: C.text,
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600,
    color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textLight,
    fontFamily: "'Libre Franklin', sans-serif", marginBottom: 6, display: 'block',
    letterSpacing: 0.3,
  };

  // Form background per tier
  const formBg = isFeatured
    ? `linear-gradient(170deg, ${C.night} 0%, #1E2D36 40%, ${C.dusk} 100%)`
    : isPaid
      ? '#fff'
      : C.warmWhite;

  const formBorder = isFeatured
    ? `1px solid ${C.sunset}30`
    : isPaid
      ? `1px solid ${C.lakeBlue}20`
      : `1px solid ${C.sand}`;

  return (
    <>
    {lightbox && (
      <PhotoLightbox
        images={lightbox.images}
        startIndex={lightbox.startIndex}
        onClose={() => setLightbox(null)}
      />
    )}
    <section id="list-property" style={{ padding: '80px 24px', background: C.warmWhite }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <SectionLabel>Property Owners</SectionLabel>
        <SectionTitle>List Your Property</SectionTitle>
        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, textAlign: 'center', marginBottom: 36 }}>
          Own a rental, cottage, or campground? Pick your tier — the form adapts to match.
        </p>

        {/* ── Tier Selector Buttons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {TIERS.map(t => {
            const active = tier === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => selectTier(t.key)}
                style={{
                  position: 'relative',
                  background: active
                    ? t.key === 'featured' ? `linear-gradient(135deg, ${C.night}, ${C.dusk})` : '#fff'
                    : '#fff',
                  borderRadius: 16,
                  padding: active ? '28px 20px 24px' : '24px 18px 20px',
                  border: active ? `2.5px solid ${t.accent}` : `1.5px solid ${C.sand}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: active ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: active
                    ? `0 8px 32px ${t.accent}25, 0 0 0 1px ${t.accent}15`
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.borderColor = `${t.accent}60`; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = C.sand; } }}
              >
                {/* Active indicator dot */}
                {active && (
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 8, height: 8, borderRadius: '50%',
                    background: t.accent,
                    boxShadow: `0 0 8px ${t.accent}80`,
                  }} />
                )}

                {/* Limited badge */}
                {t.limited && (
                  <div style={{
                    position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
                    color: '#fff',
                    background: featuredSlotsLeft === 0 ? C.warmGray : t.accent,
                    padding: '3px 12px', borderRadius: '0 0 8px 8px',
                    fontFamily: "'Libre Franklin', sans-serif",
                  }}>
                    {selectedType
                      ? featuredSlotsLeft === 0 ? 'Waitlist' : `${featuredSlotsLeft} Slot${featuredSlotsLeft !== 1 ? 's' : ''} Left`
                      : '3 Per Type'}
                  </div>
                )}

                <div style={{ fontSize: 28, marginBottom: 8, filter: active ? 'none' : 'grayscale(0.3)' }}>{t.icon}</div>

                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                  color: active ? t.accent : C.textMuted,
                  fontFamily: "'Libre Franklin', sans-serif", marginBottom: 6,
                  transition: 'color 0.3s',
                }}>
                  {t.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: active ? 10 : 6 }}>
                  <span style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: active ? 32 : 24,
                    color: active && t.key === 'featured' ? C.cream : C.text,
                    fontWeight: 400, transition: 'all 0.3s',
                  }}>
                    {t.price}
                  </span>
                  <span style={{
                    fontSize: 12, color: active && t.key === 'featured' ? 'rgba(255,255,255,0.4)' : C.textMuted,
                    fontFamily: "'Libre Franklin', sans-serif",
                  }}>
                    {t.priceSub}
                  </span>
                </div>

                {active && (
                  <div style={{ animation: 'fadeSlideIn 0.3s ease' }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: t.key === 'featured' ? C.cream : C.text,
                      fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4,
                    }}>
                      {t.headline}
                    </div>
                    <div style={{
                      fontSize: 12, color: t.key === 'featured' ? 'rgba(255,255,255,0.5)' : C.textLight,
                      lineHeight: 1.5, fontFamily: "'Libre Franklin', sans-serif",
                    }}>
                      {t.tagline}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feature checklist under tier buttons */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 28, padding: '16px 20px', borderRadius: 12,
          background: isFeatured ? `${C.sunset}08` : isPaid ? `${C.lakeBlue}06` : 'transparent',
          border: isPaid ? `1px solid ${activeTier.accent}15` : 'none',
          transition: 'all 0.3s',
        }}>
          {activeTier.features.map(f => (
            <span key={f} style={{
              fontSize: 11, padding: '5px 12px', borderRadius: 20,
              background: isFeatured ? `${C.sunset}12` : isPaid ? `${C.lakeBlue}10` : `${C.sand}60`,
              color: isFeatured ? C.sunset : isPaid ? C.lakeBlue : C.textMuted,
              fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
              border: `1px solid ${isFeatured ? `${C.sunset}20` : isPaid ? `${C.lakeBlue}15` : `${C.sand}`}`,
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* ── Sample Listings — what each tier looks like ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: activeTier.accent, fontFamily: "'Libre Franklin', sans-serif",
            textAlign: 'center', marginBottom: 14,
          }}>
            {tier === 'free' ? 'Your listing will look like this' : tier === 'listed' ? 'Your listing will look like this' : 'This is what guests see'}
          </div>

          {/* Free sample — matches real StayCard layout */}
          {tier === 'free' && (
            <div style={{
              background: '#fff', border: `1px solid #e0dbd4`, borderRadius: 16,
              padding: '32px 28px', display: 'flex', gap: 24, alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: C.warmGray, borderRadius: '16px 0 0 16px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: 0 }}>
                    Lakeside Cottage
                  </h3>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.lakeBlue, background: `${C.lakeBlue}15`, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>
                    Cottage
                  </span>
                </div>
                <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6, marginBottom: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
                  Name and type only — no photo, no booking link, no amenities. Enough to be found, but guests won't have much to go on.
                </p>
              </div>
            </div>
          )}

          {/* Listed ($9) sample — matches real StayCard layout */}
          {tier === 'listed' && (
            <div style={{
              background: '#fff', border: `1px solid #e0dbd4`, borderRadius: 16,
              padding: '32px 28px', display: 'flex', gap: 24, alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#7A8E72', borderRadius: '16px 0 0 16px' }} />
              <div style={{ width: 120, height: 120, borderRadius: 16, background: `linear-gradient(135deg, ${C.lakeBlue}20, ${C.sage}15)`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                🏕
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: 0 }}>Pine Ridge Campsite</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#7A8E72', background: '#7A8E7215', padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>Camping</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 8 }}>🛏 2 beds · 👥 Sleeps 6</div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: '0 0 14px' }}>
                  Wooded sites with fire rings, just a short walk to the lake. Wake up to birdsong and coffee over the campfire.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {['Waterfront', 'Fire Pit', 'Boat Launch'].map(a => (
                    <span key={a} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, background: `#7A8E7210`, color: '#7A8E72', fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, border: `1px solid #7A8E7220` }}>
                      {AMENITY_ICONS[a]} {a}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>📍 4521 Round Lake Rd</span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>📞 (517) 555-0142</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7A8E72', fontFamily: "'Libre Franklin', sans-serif" }}>Book Now →</span>
              </div>
            </div>
          )}

          {/* Featured ($25) sample — matches real StayCard layout exactly */}
          {tier === 'featured' && (
            <div style={{
              background: C.dusk, border: `1px solid ${C.lakeDark}`, borderRadius: 16,
              padding: '32px 28px', display: 'flex', gap: 24, alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: C.sunset, borderRadius: '16px 0 0 16px' }} />
              <img
                src="/images/yeti/yeti-cabin.jpg"
                alt=""
                style={{ width: 120, height: 120, borderRadius: 16, objectFit: 'cover', flexShrink: 0, background: C.night }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.cream, margin: 0 }}>Yeti's Cozy Cabin</h3>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.cream, background: C.sunset, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>✦ Staff Pick</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.cream, background: `${C.lakeBlue}40`, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>Cottage</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: "'Libre Franklin', sans-serif", marginBottom: 8 }}>🛏 3 beds · 👥 Sleeps 8</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: '0 0 14px' }}>
                  Lakefront cabin with a hot tub, fire pit, and the best sunset view on Devils Lake. The kind of place you never want to leave.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {['Waterfront', 'Fire Pit', 'Dock', 'WiFi', 'Kitchen'].map(a => (
                    <span key={a} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
                      {AMENITY_ICONS[a]} {a}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📍 7832 Devils Lake Hwy</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>📞 (517) 555-0199</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.sunset, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>Book Now →</span>
              </div>
            </div>
          )}
        </div>

        {/* ── The Form ── */}
        <div ref={formRef} style={{
          background: formBg,
          border: formBorder,
          borderRadius: 20,
          padding: isFeatured ? '40px 32px' : isPaid ? '36px 28px' : '28px 24px',
          boxShadow: isFeatured
            ? `0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
            : isPaid
              ? '0 8px 32px rgba(0,0,0,0.06)'
              : 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>

          {/* Featured tier header flourish */}
          {isFeatured && (
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                display: 'inline-block', fontSize: 9, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase',
                color: C.sunset, background: `${C.sunset}15`, padding: '6px 18px', borderRadius: 20,
                border: `1px solid ${C.sunset}25`, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 12,
              }}>
                Front & Center
              </div>
              <h3 style={{
                fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.cream,
                fontWeight: 400, margin: '0 0 8px', lineHeight: 1.3,
              }}>
                Your property deserves more attention
              </h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>
                The kind of listing guests bookmark, share with friends, and come back to every summer.
              </p>
            </div>
          )}

          {/* Listed tier header */}
          {isListed && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h3 style={{
                fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text,
                fontWeight: 400, margin: '0 0 6px',
              }}>
                Build Your Listing
              </h3>
              <p style={{ fontSize: 13, color: C.textLight, margin: 0 }}>
                Photos, details, and a direct booking link — guests get everything they need.
              </p>
            </div>
          )}

          {status === 'success' ? (
            <div style={{
              textAlign: 'center', padding: 48,
              background: isFeatured ? 'rgba(255,255,255,0.04)' : C.cream,
              borderRadius: 16,
              border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.08)' : `${C.sage}30`}`,
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏡</div>
              <h3 style={{
                fontFamily: "'Libre Baskerville', serif", fontSize: 24,
                color: isFeatured ? C.cream : C.text, marginBottom: 10, fontWeight: 400,
              }}>
                {isFeatured ? 'Welcome to the front page.' : 'Submitted!'}
              </h3>
              <p style={{ fontSize: 14, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textLight, lineHeight: 1.6 }}>
                {isFeatured
                  ? "We're building your premium listing now. You'll hear from us within 24 hours."
                  : "We'll review and get your listing live soon."}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: isFeatured ? 20 : 16 }}>
              <div style={{ display: 'none' }}><input value={form._hp} onChange={e => set('_hp', e.target.value)} tabIndex={-1} autoComplete="off" /></div>

              {/* Property Name — all tiers */}
              <div>
                <label style={labelStyle}>Property Name *</label>
                <input
                  style={{
                    ...inputStyle,
                    ...(isFeatured ? { fontSize: 18, padding: '18px 20px', fontFamily: "'Libre Baskerville', serif" } : {}),
                  }}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                  placeholder="e.g. Lakeside Cottage"
                />
              </div>

              {/* Type + Phone — all tiers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    style={{
                      ...inputStyle,
                      ...(isFeatured ? { background: 'rgba(255,255,255,0.06)' } : { background: C.warmWhite }),
                    }}
                    value={form.stayType}
                    onChange={e => set('stayType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    {STAY_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 123-4567" />
                </div>
              </div>

              {/* Email — all tiers */}
              <div>
                <label style={labelStyle}>Email {isPaid ? '' : '(for inquiries)'}</label>
                <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              </div>

              {/* ── Paid-tier fields ── */}
              {isPaid && (
                <>
                  {/* Photo Drop Zone(s) */}
                  <div>
                    <label style={labelStyle}>
                      {isFeatured ? 'Photos — 3 images to show off your property' : 'Property Photo'}
                    </label>

                    {/* Hero photo drop zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); }}
                      style={{
                        borderRadius: 16,
                        border: `2px dashed ${dragOver
                          ? (isFeatured ? C.sunset : C.lakeBlue)
                          : (isFeatured ? 'rgba(255,255,255,0.15)' : C.sand)}`,
                        background: dragOver
                          ? (isFeatured ? `${C.sunset}10` : `${C.lakeBlue}06`)
                          : (isFeatured ? 'rgba(255,255,255,0.03)' : `${C.cream}`),
                        padding: isFeatured ? '48px 24px' : '36px 24px',
                        textAlign: 'center',
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        fontSize: isFeatured ? 44 : 36, marginBottom: 12,
                        filter: dragOver ? 'none' : 'grayscale(0.2)',
                        transition: 'filter 0.2s',
                      }}>
                        {isFeatured ? '🏠' : '📷'}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 600,
                        color: isFeatured ? C.cream : C.text,
                        fontFamily: "'Libre Franklin', sans-serif", marginBottom: 6,
                      }}>
                        {isFeatured ? 'Hero photo — the one that stops the scroll' : 'Drag a photo here'}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted,
                        fontFamily: "'Libre Franklin', sans-serif", marginBottom: 12,
                      }}>
                        JPG or PNG, under 2 MB
                      </div>
                      <div style={{
                        display: 'inline-block', fontSize: 11, fontWeight: 700,
                        letterSpacing: 1, textTransform: 'uppercase',
                        color: isFeatured ? C.sunset : C.lakeBlue,
                        padding: '8px 20px', borderRadius: 20,
                        border: `1px solid ${isFeatured ? `${C.sunset}40` : `${C.lakeBlue}30`}`,
                        fontFamily: "'Libre Franklin', sans-serif",
                      }}>
                        Or Choose File
                      </div>
                    </div>
                    <input
                      style={{ ...inputStyle, marginTop: 8, fontSize: 12, padding: '10px 14px' }}
                      value={form.photoUrl}
                      onChange={e => set('photoUrl', e.target.value)}
                      placeholder="Or paste an image URL"
                    />

                    {/* Gallery photos 2 & 3 — Featured only */}
                    {isFeatured && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                        {[
                          { key: 'photoUrl2', label: 'Interior or living space', num: '2' },
                          { key: 'photoUrl3', label: 'View, dock, or outdoor area', num: '3' },
                        ].map(slot => (
                          <div key={slot.key}>
                            <div style={{
                              borderRadius: 14,
                              border: `2px dashed rgba(255,255,255,0.12)`,
                              background: 'rgba(255,255,255,0.03)',
                              padding: '28px 16px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}>
                              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.6 }}>📷</div>
                              <div style={{
                                fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                                fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4,
                              }}>
                                Photo {slot.num}
                              </div>
                              <div style={{
                                fontSize: 11, color: 'rgba(255,255,255,0.3)',
                                fontFamily: "'Libre Franklin', sans-serif",
                              }}>
                                {slot.label}
                              </div>
                            </div>
                            <input
                              style={{ ...inputStyle, marginTop: 6, fontSize: 11, padding: '8px 12px' }}
                              value={form[slot.key]}
                              onChange={e => set(slot.key, e.target.value)}
                              placeholder="Paste image URL"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Lake St, Manitou Beach" />
                  </div>

                  {/* Booking URL */}
                  <div>
                    <label style={labelStyle}>
                      {isFeatured
                        ? 'Booking URL — where guests go to book (Airbnb, VRBO, your own site)'
                        : 'Booking URL (Airbnb, VRBO, or your site)'}
                    </label>
                    <input style={inputStyle} value={form.bookingUrl} onChange={e => set('bookingUrl', e.target.value)} placeholder="https://airbnb.com/rooms/..." />
                  </div>

                  {/* Beds + Guests */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Bedrooms</label>
                      <input type="number" min="0" style={inputStyle} value={form.beds} onChange={e => set('beds', e.target.value)} placeholder="3" />
                    </div>
                    <div>
                      <label style={labelStyle}>Max Guests</label>
                      <input type="number" min="0" style={inputStyle} value={form.guests} onChange={e => set('guests', e.target.value)} placeholder="8" />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={labelStyle}>
                      {isFeatured ? 'Description — sell the experience, not just the specs' : 'Description'}
                    </label>
                    <textarea
                      style={{
                        ...inputStyle,
                        height: isFeatured ? 120 : 80,
                        resize: 'vertical',
                        lineHeight: 1.7,
                      }}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder={isFeatured
                        ? "What makes this place special? The view from the dock at sunset? The fire pit where everyone gathers? Paint the picture..."
                        : "Tell visitors about your property..."}
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label style={labelStyle}>Amenities</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {AMENITY_OPTIONS.map(a => {
                        const selected = form.amenities.includes(a);
                        return (
                          <button type="button" key={a} onClick={() => toggleAmenity(a)} style={{
                            fontSize: 13, padding: '8px 16px', borderRadius: 24, cursor: 'pointer',
                            border: `1.5px solid ${selected
                              ? (isFeatured ? C.sunset : C.sage)
                              : (isFeatured ? 'rgba(255,255,255,0.1)' : C.sand)}`,
                            background: selected
                              ? (isFeatured ? `${C.sunset}20` : `${C.sage}15`)
                              : (isFeatured ? 'rgba(255,255,255,0.04)' : 'transparent'),
                            color: selected
                              ? (isFeatured ? C.sunset : C.sage)
                              : (isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted),
                            fontFamily: "'Libre Franklin', sans-serif",
                            fontWeight: selected ? 700 : 500,
                            transition: 'all 0.2s ease',
                            transform: selected ? 'scale(1.02)' : 'scale(1)',
                          }}>
                            {AMENITY_ICONS[a]} {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Submit / Waitlist */}
              {featuredFull ? (
                <div style={{
                  marginTop: 12, padding: '28px 24px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
                    color: C.sunset, marginBottom: 10, fontFamily: "'Libre Franklin', sans-serif",
                  }}>
                    All 3 {selectedType} Featured Spots Are Taken
                  </div>
                  <p style={{ fontSize: 14, color: C.cream, fontFamily: "'Libre Baskerville', serif", margin: '0 0 6px', fontWeight: 400 }}>
                    Join the waitlist — you'll be first to know
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 20px', lineHeight: 1.5 }}>
                    When a Featured spot opens up, we'll text or email you before anyone else.
                    Current Featured holders get first right of renewal — if they pass, you're next in line.
                  </p>
                  <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto 16px' }}>
                    <input
                      style={{
                        ...inputStyle, flex: 1, fontSize: 13, padding: '12px 14px',
                        textAlign: 'center',
                      }}
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="Your email"
                      type="email"
                    />
                    <input
                      style={{
                        ...inputStyle, flex: 1, fontSize: 13, padding: '12px 14px',
                        textAlign: 'center',
                      }}
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="Phone for text"
                    />
                  </div>
                  <Btn
                    type="submit"
                    variant="primary"
                    style={{
                      width: '100%', maxWidth: 400,
                      padding: '16px 24px', fontSize: 13, borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.lakeBlue}, ${C.lakeDark})`,
                      boxShadow: `0 4px 16px ${C.lakeBlue}30`,
                    }}
                  >
                    {status === 'sending' ? 'Joining...' : 'Join the Waitlist'}
                  </Btn>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 12, lineHeight: 1.5 }}>
                    You can also submit as a $9 Listed property now and upgrade when a slot opens.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: isFeatured ? 12 : 8 }}>
                  {/* Slot count hint for featured */}
                  {isFeatured && selectedType && featuredSlotsLeft > 0 && featuredSlotsLeft <= 2 && (
                    <p style={{
                      fontSize: 12, color: C.sunset, textAlign: 'center',
                      fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                      marginBottom: 10,
                    }}>
                      {featuredSlotsLeft === 1 ? 'Last spot' : `${featuredSlotsLeft} spots left`} for {selectedType}
                    </p>
                  )}
                  <Btn
                    type="submit"
                    variant={isFeatured ? 'primary' : isPaid ? 'primary' : 'outlineDark'}
                    style={{
                      width: '100%',
                      padding: isFeatured ? '18px 24px' : '14px 20px',
                      fontSize: isFeatured ? 14 : 13,
                      borderRadius: isFeatured ? 14 : 12,
                      ...(isFeatured ? {
                        background: `linear-gradient(135deg, ${C.sunset}, ${C.sunsetLight})`,
                        boxShadow: `0 4px 20px ${C.sunset}40`,
                      } : {}),
                    }}
                  >
                    {status === 'sending'
                      ? 'Submitting...'
                      : isFeatured
                        ? 'Claim Your Spot — $25/mo'
                        : isListed
                          ? 'Submit Listing — $9/mo'
                          : 'Submit Free Listing'}
                  </Btn>
                </div>
              )}

              {status === 'error' && (
                <p style={{
                  color: isFeatured ? '#E8A87C' : '#c0392b',
                  fontSize: 13, textAlign: 'center',
                }}>
                  {yeti.oops()}
                </p>
              )}
            </form>
          )}
        </div>

        {/* CSS animation */}
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </section>
    </>
  );
}

// ── Manage Your Listing ─────────────────────────────────────
function ManageListingSection() {
  const [email, setEmail] = useState('');
  const [lookupStatus, setLookupStatus] = useState(null); // null | 'loading' | 'found' | 'not-found' | 'error'
  const [listings, setListings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  const lookup = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLookupStatus('loading');
    setListings([]);
    setEditingId(null);
    try {
      const res = await fetch(`/api/stays?manage=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.stays && data.stays.length > 0) {
        setListings(data.stays);
        setLookupStatus('found');
      } else {
        setLookupStatus('not-found');
      }
    } catch {
      setLookupStatus('error');
    }
  };

  const startEdit = (listing) => {
    setEditingId(listing.pageId);
    setSaveStatus(null);
    setEditForm({
      name: listing.name || '',
      stayType: listing.stayType || '',
      phone: listing.phone || '',
      email: listing.email || '',
      website: listing.website || '',
      bookingUrl: listing.bookingUrl || '',
      description: listing.description || '',
      address: listing.address || '',
      beds: listing.beds ?? '',
      guests: listing.guests ?? '',
      amenities: listing.amenities || [],
      photoUrl: listing.photo || '',
      photoUrl2: listing.photo2 || '',
      photoUrl3: listing.photo3 || '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/stays', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: editingId, ...editForm }),
      });
      if (res.ok) {
        setSaveStatus('saved');
        // Update the listing in local state
        setListings(prev => prev.map(l => l.pageId === editingId ? { ...l, ...editForm, photo: editForm.photoUrl, photo2: editForm.photoUrl2, photo3: editForm.photoUrl3 } : l));
        setTimeout(() => setEditingId(null), 1500);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const setField = (k, v) => setEditForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a) => setEditForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 12,
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
    background: C.warmWhite, border: `1px solid ${C.sand}`, color: C.text,
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: C.textLight,
    fontFamily: "'Libre Franklin', sans-serif", marginBottom: 6, display: 'block',
    letterSpacing: 0.3,
  };

  return (
    <section id="manage-listing" style={{ padding: '60px 24px 80px', background: C.cream }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <SectionLabel>Already Listed?</SectionLabel>
        <SectionTitle>Manage Your Listing</SectionTitle>
        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, textAlign: 'center', marginBottom: 32 }}>
          Enter the email you used when you listed your property. We'll pull up your listing so you can update it.
        </p>

        {/* Email lookup */}
        <form onSubmit={lookup} style={{
          display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto 32px',
        }}>
          <input
            type="email"
            style={{ ...inputStyle, flex: 1 }}
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Btn type="submit" variant="outlineDark" small style={{ whiteSpace: 'nowrap' }}>
            {lookupStatus === 'loading' ? 'Looking...' : 'Find My Listing'}
          </Btn>
        </form>

        {/* Not found */}
        {lookupStatus === 'not-found' && (
          <div style={{ textAlign: 'center', padding: '32px 20px', background: C.warmWhite, borderRadius: 16, border: `1px solid ${C.sand}` }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14, color: C.textLight, margin: 0, lineHeight: 1.6 }}>
              No listing found for <strong>{email}</strong>. Double-check the email, or{' '}
              <a href="#list-property" style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 600 }}>list your property</a> to get started.
            </p>
          </div>
        )}

        {lookupStatus === 'error' && (
          <p style={{ color: '#c0392b', fontSize: 13, textAlign: 'center' }}>{yeti.oops()}</p>
        )}

        {/* Listings found */}
        {lookupStatus === 'found' && listings.map(listing => (
          <div key={listing.pageId} style={{
            background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 16,
            padding: '24px 24px', marginBottom: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            {editingId === listing.pageId ? (
              /* ── Edit Form ── */
              <form onSubmit={saveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                  color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4,
                }}>
                  Editing: {listing.name}
                </div>

                <div>
                  <label style={labelStyle}>Property Name *</label>
                  <input style={inputStyle} value={editForm.name} onChange={e => setField('name', e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select style={inputStyle} value={editForm.stayType} onChange={e => setField('stayType', e.target.value)}>
                      <option value="">Select type</option>
                      {STAY_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} value={editForm.phone} onChange={e => setField('phone', e.target.value)} placeholder="(555) 123-4567" />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" style={inputStyle} value={editForm.email} onChange={e => setField('email', e.target.value)} />
                </div>

                <div>
                  <label style={labelStyle}>Address</label>
                  <input style={inputStyle} value={editForm.address} onChange={e => setField('address', e.target.value)} placeholder="123 Lake St, Manitou Beach" />
                </div>

                <div>
                  <label style={labelStyle}>Booking URL</label>
                  <input style={inputStyle} value={editForm.bookingUrl} onChange={e => setField('bookingUrl', e.target.value)} placeholder="https://airbnb.com/rooms/..." />
                </div>

                <div>
                  <label style={labelStyle}>Website</label>
                  <input style={inputStyle} value={editForm.website} onChange={e => setField('website', e.target.value)} placeholder="https://..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>Bedrooms</label>
                    <input type="number" min="0" style={inputStyle} value={editForm.beds} onChange={e => setField('beds', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Guests</label>
                    <input type="number" min="0" style={inputStyle} value={editForm.guests} onChange={e => setField('guests', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea style={{ ...inputStyle, height: 80, resize: 'vertical', lineHeight: 1.7 }} value={editForm.description} onChange={e => setField('description', e.target.value)} />
                </div>

                <div>
                  <label style={labelStyle}>Photo URL</label>
                  <input style={inputStyle} value={editForm.photoUrl} onChange={e => setField('photoUrl', e.target.value)} placeholder="Paste image URL" />
                </div>

                {(listing.tier === 'featured' || editForm.photoUrl2 || editForm.photoUrl3) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={labelStyle}>Photo 2</label>
                      <input style={inputStyle} value={editForm.photoUrl2} onChange={e => setField('photoUrl2', e.target.value)} placeholder="Paste image URL" />
                    </div>
                    <div>
                      <label style={labelStyle}>Photo 3</label>
                      <input style={inputStyle} value={editForm.photoUrl3} onChange={e => setField('photoUrl3', e.target.value)} placeholder="Paste image URL" />
                    </div>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Amenities</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {AMENITY_OPTIONS.map(a => {
                      const selected = editForm.amenities.includes(a);
                      return (
                        <button type="button" key={a} onClick={() => toggleAmenity(a)} style={{
                          fontSize: 12, padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                          border: `1.5px solid ${selected ? C.sage : C.sand}`,
                          background: selected ? `${C.sage}15` : 'transparent',
                          color: selected ? C.sage : C.textMuted,
                          fontFamily: "'Libre Franklin', sans-serif", fontWeight: selected ? 700 : 500,
                          transition: 'all 0.2s',
                        }}>
                          {AMENITY_ICONS[a]} {a}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <Btn type="submit" variant="primary" small style={{ flex: 1 }}>
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                  </Btn>
                  <Btn type="button" variant="outlineDark" small onClick={() => setEditingId(null)} style={{ flex: 0 }}>
                    Cancel
                  </Btn>
                </div>
                {saveStatus === 'error' && (
                  <p style={{ color: '#c0392b', fontSize: 12, textAlign: 'center', margin: 0 }}>{yeti.oops()}</p>
                )}
              </form>
            ) : (
              /* ── Listing Summary (read-only) ── */
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {listing.photo && (
                  <img src={listing.photo} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: C.sand }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text, margin: 0 }}>
                      {listing.name}
                    </h4>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {listing.tier === 'featured' && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', background: C.sunset, padding: '3px 8px', borderRadius: 12, fontFamily: "'Libre Franklin', sans-serif" }}>Featured</span>
                      )}
                      {listing.stayType && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: TYPE_COLORS[listing.stayType] || C.lakeBlue, background: `${TYPE_COLORS[listing.stayType] || C.lakeBlue}15`, padding: '3px 8px', borderRadius: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
                          {listing.stayType}
                        </span>
                      )}
                    </div>
                  </div>
                  {listing.description && (
                    <p style={{ fontSize: 13, color: C.textLight, margin: '4px 0 12px', lineHeight: 1.6 }}>
                      {listing.description.length > 120 ? listing.description.slice(0, 120) + '...' : listing.description}
                    </p>
                  )}
                  <Btn variant="outlineDark" small onClick={() => startEdit(listing)}>
                    Edit Listing
                  </Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function StaysPage() {
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/stays')
      .then(r => r.json())
      .then(d => { setStays(d.stays || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? stays : stays.filter(s => s.stayType === filter);

  return (
    <>
      <GlobalStyles />
      <PromoBanner />
      <Navbar />
      <StaysHero />

      {/* Category Filter */}
      <section style={{
        padding: '20px 24px',
        background: C.cream,
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: `1px solid ${C.sand}`,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STAY_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                letterSpacing: 1, textTransform: 'uppercase',
                padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                border: `1.5px solid ${filter === type ? C.lakeBlue : C.sand}`,
                background: filter === type ? C.lakeBlue : 'transparent',
                color: filter === type ? C.cream : C.textMuted,
                transition: 'all 0.2s',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section style={{ padding: '60px 24px 80px', background: C.cream }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 14 }}>Loading stays...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏕</div>
              <p style={{ color: C.textMuted, fontSize: 15 }}>
                {filter === 'All' ? 'No stays listed yet — be the first!' : `No ${filter} listings yet.`}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {filtered.map((stay, i) => (
                <StayCard key={stay.id} stay={stay} i={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seasonal banner */}
      <section style={{ padding: '40px 24px', background: `linear-gradient(135deg, ${C.sunset}15, ${C.lakeBlue}10)`, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: C.text, fontFamily: "'Libre Baskerville', serif", margin: 0 }}>
          Peak season: June – September. <a href="/happening" style={{ color: C.sunset, textDecoration: 'none', fontWeight: 600 }}>See what's happening →</a>
        </p>
      </section>

      <WaveDivider />
      <StaysMapSection stays={stays} />

      <ListYourPropertySection stays={stays} />
      <ManageListingSection />
      <NewsletterInline />
      <PageSponsorBanner pageName="stays" />
      <Footer />
    </>
  );
}
