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
        mapRef.current = new google.maps.Map(mapDivRef.current, {
          center: { lat: 20, lng: 10 },
          zoom: 2,
          minZoom: 2,
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
      const marker = new google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        map: mapRef.current,
        icon: {
          path: DOT_PATH,
          fillColor: isNew ? '#FFD700' : C.sunset,
          fillOpacity: isNew ? 1 : 0.85,
          strokeColor: isNew ? '#fff' : 'rgba(255,255,255,0.3)',
          strokeWeight: isNew ? 2 : 1,
          scale: isNew ? 1.4 : 1,
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
    <div ref={mapDivRef} style={{ width: '100%', height: 480, background: '#0e1626' }} />
  );
}

// ── Pin submission ───────────────────────────────────────────
function PinSubmitForm({ onPinAdded }) {
  const [step, setStep] = useState('idle'); // idle | detecting | confirm | manual | submitting | done | error
  const [detected, setDetected] = useState(null); // { city, state, country, lat, lng }
  const [manual, setManual] = useState({ city: '', country: '' });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [err, setErr] = useState('');

  const detectLocation = () => {
    setStep('detecting');
    setErr('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'ManitouBeach/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city = addr.city || addr.town || addr.village || addr.hamlet || addr.county || '';
          const state = addr.state || addr.region || '';
          const country = addr.country || '';
          if (!city || !country) { setStep('manual'); return; }
          setDetected({ city, state, country, lat, lng });
          setStep('confirm');
        } catch { setStep('manual'); }
      },
      () => setStep('manual'),
      { timeout: 10000 }
    );
  };

  const submitPin = async (pinData) => {
    setStep('submitting');
    try {
      const res = await fetch('/api/visitor-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pinData, name: name.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setStep('done');
        onPinAdded({ ...pinData, name: name.trim(), message: message.trim() });
      } else {
        setErr(data.error || 'Something went wrong.'); setStep('error');
      }
    } catch { setErr('Network error. Please try again.'); setStep('error'); }
  };

  const geocodeManual = async () => {
    if (!manual.city.trim() || !manual.country.trim()) { setErr('City and country are required.'); return; }
    setStep('submitting');
    try {
      const q = encodeURIComponent(`${manual.city.trim()}, ${manual.country.trim()}`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: { 'User-Agent': 'ManitouBeach/1.0' }
      });
      const results = await res.json();
      const lat = results[0] ? parseFloat(results[0].lat) : null;
      const lng = results[0] ? parseFloat(results[0].lon) : null;
      await submitPin({ ...manual, lat: lat || 0, lng: lng || 0 });
    } catch { setErr('Could not locate that city. Try another.'); setStep('manual'); }
  };

  const inp = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    border: `1px solid rgba(255,255,255,0.15)`, background: 'rgba(255,255,255,0.07)',
    color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };
  const btn = (accent = C.sunset) => ({
    padding: '14px 28px', borderRadius: 24, border: 'none',
    background: accent, color: '#fff',
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
    fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
    cursor: 'pointer', transition: 'opacity 0.2s',
  });

  if (step === 'done') return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📍</div>
      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: '#fff', marginBottom: 8, fontWeight: 400 }}>
        You're on the map!
      </div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.7 }}>
        Your pin is live on the Visitor Wall. Welcome to Manitou Beach.
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {step === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <button onClick={detectLocation} style={btn(C.sunset)}>
            📍 Use My Location
          </button>
          <button onClick={() => setStep('manual')} style={{ ...btn('transparent'), border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            Enter city manually
          </button>
        </div>
      )}

      {step === 'detecting' && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14 }}>
          Finding your location...
        </p>
      )}

      {step === 'confirm' && detected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📍</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: '#fff', fontWeight: 400 }}>
              {[detected.city, detected.state, detected.country].filter(Boolean).join(', ')}
            </div>
          </div>
          <input style={{ ...inp, marginTop: 4 }} placeholder="Your name (optional — or stay anonymous)" value={name} onChange={e => setName(e.target.value)} />
          <input style={inp} placeholder="A note — 'First time here!' / 'Back every summer'" value={message} onChange={e => setMessage(e.target.value)} />
          <button onClick={() => submitPin(detected)} style={btn()}>Pin It →</button>
          <button onClick={() => setStep('manual')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, cursor: 'pointer', textAlign: 'center' }}>
            Wrong location? Enter manually
          </button>
        </div>
      )}

      {step === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <input style={inp} placeholder="City" value={manual.city} onChange={e => setManual(m => ({ ...m, city: e.target.value }))} />
            <input style={inp} placeholder="Country" value={manual.country} onChange={e => setManual(m => ({ ...m, country: e.target.value }))} />
          </div>
          <input style={inp} placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)} />
          <input style={inp} placeholder="A note — 'First time here!' / 'Back every summer'" value={message} onChange={e => setMessage(e.target.value)} />
          {err && <p style={{ color: '#f87171', fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", margin: 0 }}>{err}</p>}
          <button onClick={geocodeManual} style={btn()}>Pin It →</button>
        </div>
      )}

      {step === 'submitting' && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14 }}>
          Pinning your visit...
        </p>
      )}

      {step === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f87171', fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 12 }}>{err}</p>
          <button onClick={() => setStep('idle')} style={btn()}>Try again</button>
        </div>
      )}
    </div>
  );
}

// ── Instagram gallery ────────────────────────────────────────
function InstagramGallery() {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/instagram-gallery')
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section style={{ padding: '80px 24px', background: C.warmWhite }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <SectionLabel>From the Community</SectionLabel>
        <SectionTitle>Padlock Arch — Visitor Photos</SectionTitle>
        <p style={{ fontSize: 14, color: C.textLight, textAlign: 'center', lineHeight: 1.7, marginBottom: 12 }}>
          Visiting Manitou Beach? Tag <strong style={{ color: C.lakeBlue }}>@manitoubeachlife</strong> at the padlock arch and we'll add your photo here.
        </p>
        <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', marginBottom: 40, fontFamily: "'Libre Franklin', sans-serif" }}>
          Found in the village near the waterfront.
        </p>

        {loaded && posts.length > 0 ? (
          <div style={{
            columns: '3 240px', columnGap: 14,
          }}>
            {posts.map(post => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', marginBottom: 14, borderRadius: 12, overflow: 'hidden', breakInside: 'avoid', textDecoration: 'none' }}
              >
                <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: C.sand }}>
                  <img
                    src={post.mediaUrl}
                    alt={post.caption || 'Manitou Beach visitor photo'}
                    style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    onError={e => e.target.closest('a').style.display = 'none'}
                  />
                  {post.caption && (
                    <div style={{ padding: '10px 12px', background: '#fff' }}>
                      <p style={{ fontSize: 12, color: C.textLight, margin: 0, lineHeight: 1.5, fontFamily: "'Libre Franklin', sans-serif" }}>
                        {post.caption.length > 100 ? post.caption.slice(0, 100) + '…' : post.caption}
                      </p>
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : loaded ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📸</div>
            <p style={{ fontSize: 14, marginBottom: 8 }}>No photos yet — be the first!</p>
            <a href="https://instagram.com/manitoubeachlife" target="_blank" rel="noopener noreferrer" style={{ color: C.lakeBlue, fontSize: 13, fontWeight: 700 }}>
              @manitoubeachlife →
            </a>
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
    fetch('/api/visitor-pins')
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
      fetch('/api/visitor-pins').then(r => r.json()).then(d => setPins(d.pins || [])).catch(() => {});
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

            <a href="#add-pin" onClick={e => { e.preventDefault(); document.getElementById('add-pin')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 24, background: C.sunset, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' }}>
              Add Your Pin →
            </a>
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
            One tap. Your city goes on the map.
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

      {/* ── Instagram gallery ── */}
      <InstagramGallery />

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
