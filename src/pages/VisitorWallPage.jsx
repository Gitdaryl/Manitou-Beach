import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { C } from '../data/config';
import { FadeIn, SectionLabel, SectionTitle } from '../components/Shared';

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c38' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
  { featureType: 'road', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

// ── Live ticker ──────────────────────────────────────────────
function VisitorTicker({ pins }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!pins.length) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % Math.min(pins.length, 20));
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(id);
  }, [pins.length]);

  if (!pins.length) return null;
  const pin = pins[idx];
  const location = [pin.city, pin.state, pin.country].filter(Boolean).join(', ');

  return (
    <div style={{
      background: `${C.night}CC`, backdropFilter: 'blur(8px)',
      borderTop: `1px solid rgba(91,126,149,0.2)`,
      borderBottom: `1px solid rgba(91,126,149,0.2)`,
      padding: '10px 24px', textAlign: 'center',
    }}>
      <span style={{
        fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
        color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3,
        display: 'inline-block',
        transition: 'opacity 0.4s',
        opacity: visible ? 1 : 0,
      }}>
        📍 Someone from <strong style={{ color: C.sunsetLight || '#E8A07A', fontWeight: 600 }}>{location}</strong> pinned their visit
      </span>
    </div>
  );
}

// ── World map ────────────────────────────────────────────────
function WorldPinMap({ pins, highlightPin }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef([]);
  const [mapError, setMapError] = useState(null);

  const DOT_PATH = 'M 0, 0 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0';

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError('Map unavailable'); return; }
    if (!mapDivRef.current) return;
    let active = true;

    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      new Loader({ apiKey, version: 'weekly' }).load().then(google => {
        if (!active || !mapDivRef.current) return;
        googleRef.current = google;
        const isMobile = window.innerWidth < 768;
        mapRef.current = new google.maps.Map(mapDivRef.current, {
          center: { lat: 20, lng: 10 },
          zoom: isMobile ? 1 : 2,
          minZoom: 1,
          maxZoom: 8,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          styles: DARK_MAP_STYLES,
          backgroundColor: '#0e1626',
          restriction: {
            latLngBounds: { north: 85, south: -85, west: -180, east: 180 },
            strictBounds: false,
          },
        });
      });
    }).catch(() => setMapError('Map failed to load'));

    return () => { active = false; };
  }, []);

  // Add markers as pins are loaded
  useEffect(() => {
    if (!mapRef.current || !googleRef.current || !pins.length) return;
    const google = googleRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    pins.forEach(pin => {
      if (!pin.lat || !pin.lng) return;
      const isNew = highlightPin && pin.id === highlightPin.id;
      const dotColor = pin.pinColor || C.sunset;
      const marker = new google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        map: mapRef.current,
        icon: {
          path: DOT_PATH,
          fillColor: isNew ? dotColor : dotColor,
          fillOpacity: isNew ? 1 : 0.9,
          strokeColor: isNew ? '#fff' : 'rgba(255,255,255,0.4)',
          strokeWeight: isNew ? 2 : 1.5,
          scale: isNew ? 1.5 : 1,
        },
        title: [pin.city, pin.country].filter(Boolean).join(', '),
        zIndex: isNew ? 100 : 1,
      });

      const location = [pin.city, pin.state, pin.country].filter(Boolean).join(', ');
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-family:'Libre Franklin',sans-serif;font-size:13px;padding:4px 2px;min-width:120px">
          <strong>${location}</strong>${pin.message ? `<br/><span style="color:#666;font-size:12px">"${pin.message}"</span>` : ''}
        </div>`,
      });
      marker.addListener('click', () => infoWindow.open(mapRef.current, marker));
      markersRef.current.push(marker);
    });
  }, [pins, highlightPin]);

  if (mapError) return (
    <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e1626', color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14 }}>
      {mapError}
    </div>
  );

  return (
    <div ref={mapDivRef} style={{ width: '100%', height: 'clamp(280px, 50vw, 480px)', background: '#0e1626' }} />
  );
}

const PIN_COLORS = [
  '#FF6B6B', // coral red
  '#FF9B47', // amber
  '#FFD166', // yellow
  '#7BC67E', // sage green
  '#3EB489', // emerald
  '#4EC5C1', // teal
  '#74B3CE', // sky blue
  '#6699FF', // periwinkle
  '#A78BFA', // purple
  '#F472B6', // pink
  '#FB923C', // orange
  '#FFFFFF', // white
];

function ColorPicker({ value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif", marginBottom: 10 }}>
        Pick your pin color
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {PIN_COLORS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none',
              background: color,
              cursor: 'pointer',
              transform: value === color ? 'scale(1.25)' : 'scale(1)',
              boxShadow: value === color ? `0 0 0 3px rgba(255,255,255,0.8), 0 0 12px ${color}` : `0 0 0 1px rgba(255,255,255,0.15)`,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            title={color}
          />
        ))}
        {/* Custom color option */}
        <label style={{ position: 'relative', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', flexShrink: 0, overflow: 'hidden', boxShadow: !PIN_COLORS.includes(value) && value ? `0 0 0 3px rgba(255,255,255,0.8), 0 0 12px ${value}` : '0 0 0 1px rgba(255,255,255,0.15)', background: !PIN_COLORS.includes(value) && value ? value : 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', transition: 'all 0.15s' }} title="Custom color">
          <input type="color" value={value || '#FF6B6B'} onChange={e => onChange(e.target.value)} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
        </label>
      </div>
    </div>
  );
}

// ── Place map: country → suggested regions/cities ────────────
const PLACE_MAP = {
  'United States':       ['Michigan', 'Ohio', 'Indiana', 'Illinois', 'Wisconsin', 'Florida', 'Texas', 'California', 'New York', 'Colorado', 'Utah', 'Tennessee', 'Georgia', 'Pennsylvania', 'Minnesota', 'Arizona', 'Nevada', 'Oregon', 'Washington', 'Missouri'],
  'Canada':              ['Ontario', 'British Columbia', 'Quebec', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia'],
  'Australia':           ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast', 'Darwin', 'Hobart'],
  'New Zealand':         ['Auckland', 'Wellington', 'Christchurch', 'Queenstown', 'Dunedin'],
  'United Kingdom':      ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Bristol', 'Glasgow', 'Cardiff', 'Belfast'],
  'Ireland':             ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford'],
  'Germany':             ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'],
  'France':              ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 'Toulouse'],
  'Netherlands':         ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'],
  'Italy':               ['Rome', 'Milan', 'Florence', 'Venice', 'Naples', 'Turin'],
  'Spain':               ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Bilbao'],
  'Portugal':            ['Lisbon', 'Porto', 'Faro', 'Braga'],
  'Sweden':              ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'],
  'Norway':              ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
  'Denmark':             ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg'],
  'Switzerland':         ['Zurich', 'Geneva', 'Bern', 'Basel', 'Lausanne'],
  'Austria':             ['Vienna', 'Graz', 'Salzburg', 'Innsbruck'],
  'Belgium':             ['Brussels', 'Antwerp', 'Ghent', 'Bruges'],
  'Poland':              ['Warsaw', 'Kraków', 'Wrocław', 'Gdańsk'],
  'Czech Republic':      ['Prague', 'Brno', 'Ostrava'],
  'Japan':               ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Sapporo'],
  'South Korea':         ['Seoul', 'Busan', 'Incheon', 'Jeju'],
  'China':               ['Beijing', 'Shanghai', 'Guangzhou', 'Hong Kong', 'Chengdu'],
  'India':               ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
  'Singapore':           ['Singapore'],
  'Thailand':            ['Bangkok', 'Chiang Mai', 'Phuket'],
  'Mexico':              ['Mexico City', 'Guadalajara', 'Monterrey', 'Cancun', 'Tijuana'],
  'Brazil':              ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
  'Argentina':           ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'],
  'Colombia':            ['Bogotá', 'Medellín', 'Cali', 'Cartagena'],
  'United Arab Emirates':['Dubai', 'Abu Dhabi', 'Sharjah'],
  'South Africa':        ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'],
};
const SORTED_COUNTRIES = Object.keys(PLACE_MAP).sort();

// ── Pin submission ───────────────────────────────────────────
function PinSubmitForm({ onPinAdded }) {
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [pinColor, setPinColor] = useState('#FF6B6B');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
    color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };

  const submitPin = async () => {
    const finalCity = showCustom ? customCity.trim() : city;
    if (!country || !finalCity) { setErr('Pick your country and city first.'); return; }
    setSubmitting(true); setErr('');
    try {
      // Geocode the city + country on the client
      const q = encodeURIComponent(`${finalCity}, ${country}`);
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: { 'User-Agent': 'ManitouBeach/1.0' },
      });
      const geoData = await geoRes.json();
      const lat = geoData[0] ? parseFloat(geoData[0].lat) : 0;
      const lng = geoData[0] ? parseFloat(geoData[0].lon) : 0;

      const res = await fetch('/api/visitor-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: finalCity, country, state: '', lat, lng, name: name.trim(), message: message.trim(), pinColor }),
      });
      const data = await res.json();
      if (data.ok) {
        setDone(true);
        onPinAdded({ city: finalCity, country, state: '', lat, lng, name: name.trim(), message: message.trim(), pinColor });
      } else {
        setErr(data.error || 'Something went wrong.'); setSubmitting(false);
      }
    } catch { setErr('Network error. Please try again.'); setSubmitting(false); }
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: '#fff', marginBottom: 8, fontWeight: 400 }}>You're on the map!</div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.7, marginBottom: 24 }}>Your pin is live. Welcome to Manitou Beach.</p>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 12 }}>Know someone else who's been here?</p>
      <ShareButton label="Invite them to pin" />
    </div>
  );

  const cities = PLACE_MAP[country] || [];

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      {/* VPN note */}
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
        Using a VPN? Just pick your real country below. Capital city or state works perfectly - no need to be specific.
      </p>

      {/* Country selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif", display: 'block', marginBottom: 8 }}>
          Your country
        </label>
        <select
          value={country}
          onChange={e => { setCountry(e.target.value); setCity(''); setShowCustom(false); setCustomCity(''); }}
          style={{ ...inp, appearance: 'none', cursor: 'pointer', backgroundImage: 'none' }}
        >
          <option value="">Select your country...</option>
          {SORTED_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="_other">Other country</option>
        </select>
      </div>

      {/* Country "other" free text */}
      {country === '_other' && (
        <div style={{ marginBottom: 20 }}>
          <input style={inp} placeholder="Your country" value={customCity} onChange={e => setCustomCity(e.target.value)} />
        </div>
      )}

      {/* City/region picker */}
      {country && country !== '_other' && cities.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif", display: 'block', marginBottom: 10 }}>
            {country === 'United States' || country === 'Canada' ? 'State / Province' : 'City or region'} <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>— keep it general if you like</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {cities.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setCity(c); setShowCustom(false); setCustomCity(''); }}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
                  background: city === c ? pinColor : 'rgba(255,255,255,0.1)',
                  color: city === c ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: city === c ? 700 : 400,
                  transform: city === c ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.15s',
                  boxShadow: city === c ? `0 0 12px ${pinColor}60` : 'none',
                }}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setShowCustom(true); setCity(''); }}
              style={{
                padding: '8px 16px', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.2)', cursor: 'pointer',
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12,
                background: 'transparent', color: 'rgba(255,255,255,0.35)', transition: 'all 0.15s',
              }}
            >
              Somewhere else...
            </button>
          </div>
          {showCustom && (
            <input
              autoFocus
              style={{ ...inp, marginTop: 10 }}
              placeholder="e.g. Southern Utah, St. George, Moab, Rural Victoria..."
              value={customCity}
              onChange={e => setCustomCity(e.target.value)}
            />
          )}
        </div>
      )}

      {/* Show form fields once location is chosen */}
      {(city || (showCustom && customCity.trim()) || country === '_other') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ColorPicker value={pinColor} onChange={setPinColor} />
          <input style={inp} placeholder="Your name (optional - or stay anonymous)" value={name} onChange={e => setName(e.target.value)} />
          <input style={inp} placeholder="A note — 'First time here!' / 'Back every summer'" value={message} onChange={e => setMessage(e.target.value)} />
          {err && <p style={{ color: '#f87171', fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", margin: 0 }}>{err}</p>}
          <button
            type="button"
            onClick={submitPin}
            disabled={submitting}
            style={{ padding: '14px 28px', borderRadius: 24, border: 'none', background: submitting ? 'rgba(255,255,255,0.15)' : pinColor, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer', transition: 'all 0.2s', boxShadow: submitting ? 'none' : `0 4px 20px ${pinColor}50` }}
          >
            {submitting ? 'Pinning...' : 'Pin It →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Share button ─────────────────────────────────────────────
function ShareButton({ label = 'Share with friends', style: styleProp = {} }) {
  const [copied, setCopied] = useState(false);
  const url = 'https://manitoubeachmichigan.com/visitor-wall';
  const text = 'Hey - show where you\'re from on the Manitou Beach visitor wall. Visitors from around the world are adding their pin. Takes 30 seconds:';

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Manitou Beach Visitor Wall', text, url });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {});
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      style={{
        padding: '12px 24px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)',
        fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 0.3,
        ...styleProp,
      }}
    >
      {copied ? '✓ Link copied!' : `↗ ${label}`}
    </button>
  );
}

// ── Gallery lightbox ─────────────────────────────────────────
function GalleryLightbox({ items, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const touchX = useRef(null);

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(items.length - 1, i + 1)), [items.length]);

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const item = items[idx];
  const src = item?.url || item?.mediaUrl || '';
  const caption = item?.caption || '';

  const onTouchStart = e => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchX.current == null) return;
    const delta = touchX.current - e.changedTouches[0].clientX;
    if (delta > 50) next();
    else if (delta < -50) prev();
    touchX.current = null;
  };

  const btnStyle = (side) => ({
    position: 'absolute', top: '50%', [side]: 16, transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
    width: 44, height: 44, borderRadius: '50%', fontSize: 20, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s', zIndex: 2,
  });

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Close */}
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', fontSize: 20, cursor: 'pointer', zIndex: 3 }}>✕</button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1, zIndex: 3 }}>
        {idx + 1} / {items.length}
      </div>

      {/* Image */}
      <img
        src={src}
        alt={caption || 'Visitor photo'}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ maxHeight: '88vh', maxWidth: '92vw', objectFit: 'contain', borderRadius: 8, userSelect: 'none' }}
      />

      {/* Caption */}
      {caption && (
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", maxWidth: '80vw', textAlign: 'center', zIndex: 3 }}>
          {caption}
        </div>
      )}

      {/* Prev */}
      {idx > 0 && <button onClick={e => { e.stopPropagation(); prev(); }} style={btnStyle('left')}>‹</button>}
      {/* Next */}
      {idx < items.length - 1 && <button onClick={e => { e.stopPropagation(); next(); }} style={btnStyle('right')}>›</button>}
    </div>
  );
}

// ── Client-side image compression ───────────────────────────
async function compressImage(file, maxPx = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Arch photo gallery + upload ──────────────────────────────
function ArchGallery() {
  const [photos, setPhotos] = useState([]);
  const [igPosts, setIgPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [caption, setCaption] = useState('');
  const [lightbox, setLightbox] = useState(null); // { items, index }
  const inputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/arch-photo').then(r => r.json()).catch(() => ({ photos: [] })),
      fetch('/api/instagram-gallery').then(r => r.json()).catch(() => ({ posts: [] })),
    ]).then(([archData, igData]) => {
      setPhotos(archData.photos || []);
      setIgPosts(igData.posts || []);
      setLoaded(true);
    });
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadErr('Please select an image file.'); return; }

    setUploading(true); setUploadErr(''); setUploadDone(false);
    try {
      const compressed = await compressImage(file);
      const res = await fetch('/api/arch-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: compressed, caption: caption.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setPhotos(prev => [{ id: Date.now(), url: data.url, caption: caption.trim(), created: new Date().toISOString() }, ...prev]);
        setUploadDone(true); setCaption('');
      } else { setUploadErr(data.error || 'Upload failed.'); }
    } catch { setUploadErr('Upload failed. Please try again.'); }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  // Merge + sort newest first — uploads use `created`, IG posts use `timestamp`
  const allItems = [
    ...photos.map(p => ({ type: 'upload', sortDate: p.created || '', ...p })),
    ...igPosts.map(p => ({ type: 'ig', sortDate: p.timestamp || '', ...p })),
  ].sort((a, b) => (b.sortDate > a.sortDate ? 1 : -1));

  // Dynamic columns: more photos = more columns = smaller tiles
  const colCount = allItems.length <= 20 ? 2 : allItems.length <= 60 ? 3 : allItems.length <= 150 ? 4 : 5;
  const colStyle = `${colCount} ${Math.max(120, 260 - colCount * 20)}px`;

  const inp = { width: '100%', padding: '11px 14px', borderRadius: 10, border: `1px solid ${C.sand}`, background: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.text, outline: 'none', boxSizing: 'border-box' };

  return (
    <section style={{ padding: '80px 24px', background: C.warmWhite }}>
      {lightbox && <GalleryLightbox items={lightbox.items} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <SectionLabel>From the Community</SectionLabel>
        <SectionTitle>Padlock Arch — Visitor Photos</SectionTitle>

        {/* Upload box */}
        <div style={{ maxWidth: 500, margin: '0 auto 48px', textAlign: 'center', background: '#fff', borderRadius: 16, padding: '28px 24px', border: `1px solid ${C.sand}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
          <p style={{ fontSize: 14, color: C.text, fontWeight: 600, marginBottom: 4 }}>Been to the padlock arch?</p>
          <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 20, lineHeight: 1.6 }}>Drop your photo here. It goes straight into the gallery — no Instagram needed.</p>

          <input style={{ ...inp, marginBottom: 12 }} placeholder="Add a caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} />

          <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} style={{ display: 'none' }} id="arch-photo-input" />

          {uploadDone ? (
            <div style={{ color: C.sage, fontWeight: 700, fontSize: 14, padding: '10px 0' }}>✓ Photo added to the gallery!</div>
          ) : (
            <label htmlFor="arch-photo-input" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: 24, background: uploading ? C.sand : C.lakeBlue, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
              {uploading ? 'Uploading...' : 'Choose Photo →'}
            </label>
          )}

          {uploadErr && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 10, fontFamily: "'Libre Franklin', sans-serif" }}>{uploadErr}</p>}
          <p style={{ fontSize: 11, color: C.textMuted, marginTop: 12 }}>Photos compress automatically. Max 7MB.</p>
        </div>

        {/* Gallery grid — dynamic column count based on total items */}
        {loaded && allItems.length > 0 ? (
          <div style={{ columns: colStyle, columnGap: 10 }}>
            {allItems.map((item, i) => (
              <div
                key={item.id || i}
                onClick={() => setLightbox({ items: allItems, index: i })}
                style={{ marginBottom: 10, borderRadius: 10, overflow: 'hidden', breakInside: 'avoid', background: C.sand, cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <img
                  src={item.url || item.mediaUrl}
                  alt={item.caption || 'Visitor photo at Manitou Beach padlock arch'}
                  style={{ width: '100%', display: 'block' }}
                  onError={e => e.target.closest('div').style.display = 'none'}
                  loading="lazy"
                />
                {item.caption && <div style={{ padding: '6px 10px', background: '#fff' }}><p style={{ fontSize: 11, color: C.textLight, margin: 0, lineHeight: 1.5, fontFamily: "'Libre Franklin', sans-serif" }}>{item.caption}</p></div>}
              </div>
            ))}
          </div>
        ) : loaded && allItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
            <p style={{ fontSize: 14 }}>No photos yet — upload yours above and be the first!</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function VisitorWallPage() {
  const [pins, setPins] = useState([]);
  const [newPin, setNewPin] = useState(null);
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  useEffect(() => {
    fetch('/api/visitor-pin')
      .then(r => r.json())
      .then(d => setPins(d.pins || []))
      .catch(() => {});
  }, []);

  const handlePinAdded = (pinData) => {
    // Optimistically add to pins list and highlight on map
    const optimistic = { id: 'new-' + Date.now(), ...pinData };
    setPins(prev => [optimistic, ...prev]);
    setNewPin(optimistic);
    setTimeout(() => setNewPin(null), 5000);
    // Re-fetch to get the real Notion ID
    setTimeout(() => {
      fetch('/api/visitor-pin').then(r => r.json()).then(d => setPins(d.pins || [])).catch(() => {});
    }, 2000);
  };

  const uniqueCountries = [...new Set(pins.map(p => p.country).filter(Boolean))].length;
  const pinCount = pins.length;

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, minHeight: '100vh', color: C.text }}>
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(180deg, ${C.night} 0%, ${C.dusk} 100%)`,
        padding: '130px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(91,126,149,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <FadeIn>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif", marginBottom: 20 }}>
              Manitou Beach · Visitor Wall
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 400, color: '#fff', margin: '0 0 20px', lineHeight: 1.2 }}>
              Where the world<br /><em>comes to Devils Lake.</em>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.8 }}>
              Visitors find their way here from every corner of the globe. Add your pin, leave your mark - just like the padlock arch in the village.
            </p>

            {/* Live stats */}
            {pinCount > 0 && (
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: C.sunset, fontWeight: 400 }}>{pinCount}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" }}>visitors pinned</div>
                </div>
                {uniqueCountries > 1 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: C.sunset, fontWeight: 400 }}>{uniqueCountries}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" }}>countries</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#add-pin" onClick={e => { e.preventDefault(); document.getElementById('add-pin')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 24, background: C.sunset, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' }}>
                Add Your Pin →
              </a>
              <ShareButton label="Send to friends" />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── Ticker ── */}
      <VisitorTicker pins={pins} />

      {/* ── World map ── */}
      <section style={{ background: C.night }}>
        <WorldPinMap pins={pins} highlightPin={newPin} />
      </section>

      {/* ── Add your pin ── */}
      <section id="add-pin" style={{ background: `linear-gradient(180deg, ${C.night} 0%, #1e2d38 100%)`, padding: '80px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel light>Leave Your Mark</SectionLabel>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 400, color: '#fff', margin: '16px 0 12px', lineHeight: 1.3 }}>
            Where are you from?
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 36, lineHeight: 1.7 }}>
            Pick your country and city - as general or specific as you like. Your pin goes on the world map.
          </p>
          <PinSubmitForm onPinAdded={handlePinAdded} />
        </div>
      </section>

      {/* ── Padlock arch crossover ── */}
      <section style={{ background: C.dusk, padding: '56px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>
            Found the padlock arch?
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 20 }}>
            Leave your lock on the arch in Manitou Beach Village, post a photo to Instagram and tag <strong style={{ color: C.sunsetLight || '#E8A07A' }}>@manitoubeachlife</strong> - we'll add it to the gallery below.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
            Two ways to leave your mark. One for the village. One for the world.
          </p>
        </div>
      </section>

      {/* ── Arch photo gallery + upload ── */}
      <ArchGallery />

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
