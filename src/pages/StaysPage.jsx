import React, { useState, useEffect, useRef } from 'react';
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
function ListYourPropertySection() {
  const [form, setForm] = useState({ name: '', stayType: '', address: '', bookingUrl: '', email: '', description: '', phone: '', beds: '', guests: '', amenities: [], _hp: '' });
  const [status, setStatus] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/stays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${C.sand}`, background: C.warmWhite,
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text,
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: C.textLight, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4, display: 'block' };

  return (
    <section id="list-property" style={{ padding: '80px 24px', background: C.warmWhite }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <SectionLabel>Property Owners</SectionLabel>
        <SectionTitle>List Your Property</SectionTitle>
        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, textAlign: 'center', marginBottom: 24 }}>
          Own a rental, cottage, or campground? Get found by visitors already here looking for their next stay.
        </p>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          {[
            { name: 'Free', price: '$0', color: C.textMuted, features: ['Name & type in directory', 'Basic text listing'] },
            { name: 'Listed', price: '$9/mo', color: C.lakeBlue, features: ['Photo & amenities', 'Map pin & address', 'Booking/inquiry CTA', 'Full listing card'] },
            { name: 'Featured', price: '$25/mo', color: C.sunset, features: ['Everything in Listed', 'Top placement', 'Staff Pick badge', 'Premium dark card', '3 slots per type'] },
          ].map(tier => (
            <div key={tier.name} style={{
              background: '#fff', borderRadius: 12, padding: '20px 18px',
              border: `1.5px solid ${tier.color}25`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: tier.color, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4 }}>
                {tier.name}
              </div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.text, marginBottom: 10 }}>
                {tier.price}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 12, color: C.textLight, lineHeight: 1.8, textAlign: 'left' }}>
                {tier.features.map(f => <li key={f} style={{ paddingLeft: 14, position: 'relative' }}><span style={{ position: 'absolute', left: 0, color: tier.color }}>✓</span> {f}</li>)}
              </ul>
            </div>
          ))}
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: 40, background: C.cream, borderRadius: 16, border: `1px solid ${C.sage}30` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏡</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.text, marginBottom: 8 }}>Submitted!</h3>
            <p style={{ fontSize: 14, color: C.textLight }}>We'll review and get your listing live soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'none' }}><input value={form._hp} onChange={e => set('_hp', e.target.value)} tabIndex={-1} autoComplete="off" /></div>
            <div>
              <label style={labelStyle}>Property Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Lakeside Cottage" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select style={{ ...inputStyle, background: C.warmWhite, color: C.text }} value={form.stayType} onChange={e => set('stayType', e.target.value)}>
                  <option value="">Select type</option>
                  {STAY_TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 123-4567" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email (for inquiries — shown on your listing if no booking URL)</label>
              <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Lake St, Manitou Beach" />
            </div>
            <div>
              <label style={labelStyle}>Booking URL (Airbnb, VRBO, or your site — leave blank if you prefer direct inquiries)</label>
              <input style={inputStyle} value={form.bookingUrl} onChange={e => set('bookingUrl', e.target.value)} placeholder="https://airbnb.com/rooms/..." />
            </div>
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
            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tell visitors about your property..." />
            </div>
            <div>
              <label style={labelStyle}>Amenities</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {AMENITY_OPTIONS.map(a => (
                  <button type="button" key={a} onClick={() => toggleAmenity(a)} style={{
                    fontSize: 12, padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                    border: `1px solid ${form.amenities.includes(a) ? C.sage : C.sand}`,
                    background: form.amenities.includes(a) ? `${C.sage}15` : 'transparent',
                    color: form.amenities.includes(a) ? C.sage : C.textMuted,
                    fontFamily: "'Libre Franklin', sans-serif", transition: 'all 0.15s',
                  }}>
                    {AMENITY_ICONS[a]} {a}
                  </button>
                ))}
              </div>
            </div>
            <Btn type="submit" variant="primary" style={{ marginTop: 8 }}>
              {status === 'sending' ? 'Submitting...' : 'Submit Listing'}
            </Btn>
            {status === 'error' && <p style={{ color: '#c0392b', fontSize: 13, textAlign: 'center' }}>{yeti.oops()}</p>}
          </form>
        )}
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

      <ListYourPropertySection />
      <NewsletterInline />
      <PageSponsorBanner pageName="stays" />
      <Footer />
    </>
  );
}
