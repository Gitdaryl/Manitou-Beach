import React, { useState, useEffect, useRef } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar, NewsletterInline } from '../components/Layout';

// Session ID for rate-limiting loves (one love per item per session)
function getTruckSessionId() {
  const key = 'mb-truck-session';
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, sid);
  }
  return sid;
}

// ============================================================
export default function FoodTrucksPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const truckSlug = params.get("truck") || "";
  const truckToken = params.get("token") || "";
  const isCheckinMode = !!(truckSlug && truckToken);

  // Truck data
  const [trucks, setTrucks] = useState(null);
  const [loves, setLoves] = useState({});
  const [lovedItems, setLovedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mb-truck-loves') || '{}'); } catch { return {}; }
  });

  // Check-in state
  const [checkinTruck, setCheckinTruck] = useState(null);
  const [checkinNote, setCheckinNote] = useState("");
  const [checkinSpecial, setCheckinSpecial] = useState("");
  const [checkinDeparture, setCheckinDeparture] = useState("");
  const [checkinStatus, setCheckinStatus] = useState("");
  const [checkinMsg, setCheckinMsg] = useState("");

  // Vendor mode: captured location for map preview
  const [checkinLat, setCheckinLat] = useState(null);
  const [checkinLng, setCheckinLng] = useState(null);
  const [pinStatus, setPinStatus] = useState(''); // '' | 'loading' | 'pinned' | 'denied'
  const [shareCopied, setShareCopied] = useState(false);

  // Public map
  const mapsKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_MAPS_API_KEY : '';
  const [mapReady, setMapReady] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Location history — per-truck, stored in localStorage
  const locsKey = `mb-truck-locs-${truckSlug}`;
  const [savedLocations, setSavedLocations] = useState(() => {
    try { return JSON.parse(localStorage.getItem(locsKey) || '[]'); } catch { return []; }
  });
  const saveLocation = (note) => {
    if (!note || !note.trim()) return;
    const trimmed = note.trim();
    const updated = [trimmed, ...savedLocations.filter(l => l !== trimmed)].slice(0, 6);
    setSavedLocations(updated);
    localStorage.setItem(locsKey, JSON.stringify(updated));
  };

  // "Text me my link" recovery form
  const [smsPhone, setSmsPhone] = useState('');
  const [smsStatus, setSmsStatus] = useState(''); // '' | 'loading' | 'sent' | 'error'

  // Share + love input state
  const [sharedId, setSharedId] = useState(null);
  const [loveInput, setLoveInput] = useState({ slug: '', text: '' }); // one open at a time

  // Share truck
  const shareTruck = (truck) => {
    const loc = truck.locationNote ? ` — ${truck.locationNote}` : '';
    const text = `${truck.name} is here today${loc}. Meet you there! 🚚`;
    const url = 'https://manitoubeach.com/food-trucks';
    if (navigator.share) {
      navigator.share({ title: truck.name, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
      setSharedId(truck.id);
      setTimeout(() => setSharedId(null), 2200);
    }
  };

  // Handle love tap
  const handleLove = async (slug, item) => {
    const key = `${slug}:${item}`;
    if (lovedItems[key]) return; // already loved client-side
    const sessionId = getTruckSessionId();

    // Optimistic update
    const newLovedItems = { ...lovedItems, [key]: true };
    setLovedItems(newLovedItems);
    localStorage.setItem('mb-truck-loves', JSON.stringify(newLovedItems));
    setLoves(prev => {
      const truckLoves = prev[slug] || { items: {}, total: 0 };
      return {
        ...prev,
        [slug]: {
          items: { ...truckLoves.items, [item]: (truckLoves.items[item] || 0) + 1 },
          total: truckLoves.total + 1,
        },
      };
    });

    try {
      await fetch('/api/food-truck-loves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, item, sessionId }),
      });
    } catch { /* optimistic update stands */ }
  };

  const handleLoveCustom = async (slug) => {
    const item = loveInput.text.trim().toLowerCase();
    if (!item) return;
    setLoveInput({ slug: '', text: '' });
    await handleLove(slug, item);
  };

  // Fetch trucks + loves in parallel
  useEffect(() => {
    fetch("/api/food-trucks")
      .then(r => r.json())
      .then(d => {
        setTrucks(d.trucks || []);
        if (isCheckinMode) {
          const mine = (d.trucks || []).find(t => t.slug === truckSlug);
          setCheckinTruck(mine || null);
        }
      })
      .catch(() => setTrucks([]));

    fetch("/api/food-truck-loves")
      .then(r => r.json())
      .then(d => setLoves(d.loves || {}))
      .catch(() => {});
  }, []);

  // Load Google Maps JS API for public map (not in vendor mode)
  useEffect(() => {
    if (!mapsKey || isCheckinMode) return;
    if (window.google?.maps) { setMapReady(true); return; }
    let active = true;
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      new Loader({ apiKey: mapsKey, version: 'weekly' }).load().then(() => {
        if (active) setMapReady(true);
      }).catch(err => console.error('Maps load error:', err.message));
    }).catch(err => console.error('Maps loader error:', err.message));
    return () => { active = false; };
  }, []);

  // Init map + markers whenever live trucks with coords change
  useEffect(() => {
    if (!mapReady || !mapDivRef.current) return;
    const pts = (trucks || []).filter(t => isLive(t) && typeof t.lat === 'number' && typeof t.lng === 'number');
    if (!pts.length) return;

    const G = window.google.maps;
    const makeIcon = (name, selected) => {
      const w = Math.min(name.length * 7 + 28, 160);
      const h = 26;
      const bg = selected ? '#7A8E72' : '#FAF6EF';
      const fg = selected ? '#FAF6EF' : '#3B3228';
      const border = '#7A8E72';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + 8}">
        <rect x="0" y="0" width="${w}" height="${h}" rx="13" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
        <text x="${w / 2}" y="17" font-family="sans-serif" font-size="11" font-weight="600" fill="${fg}" text-anchor="middle">${name}</text>
        <polygon points="${w / 2 - 5},${h} ${w / 2 + 5},${h} ${w / 2},${h + 7}" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
      </svg>`;
      return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new G.Size(w, h + 8), anchor: new G.Point(w / 2, h + 8) };
    };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new G.Map(mapDivRef.current, {
        zoom: 14,
        center: { lat: pts[0].lat, lng: pts[0].lng },
        mapTypeControl: false, fullscreenControl: false, streetViewControl: false,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });
      mapInstanceRef.current.addListener('click', () => setSelectedTruck(null));
    }

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new G.LatLngBounds();
    pts.forEach(truck => {
      bounds.extend({ lat: truck.lat, lng: truck.lng });
      const m = new G.Marker({ position: { lat: truck.lat, lng: truck.lng }, map: mapInstanceRef.current, icon: makeIcon(truck.name, false), title: truck.name });
      m.addListener('click', () => {
        setSelectedTruck(prev => prev?.id === truck.id ? null : truck);
        markersRef.current.forEach(mk => mk.setIcon(makeIcon(mk.getTitle(), mk.getTitle() === truck.name)));
      });
      markersRef.current.push(m);
    });

    if (pts.length === 1) { mapInstanceRef.current.setCenter({ lat: pts[0].lat, lng: pts[0].lng }); mapInstanceRef.current.setZoom(15); }
    else { mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 }); }
  }, [mapReady, trucks]);

  // Drop pin handler — vendor taps this to capture GPS before submitting
  const handleDropPin = () => {
    if (!navigator.geolocation) { setPinStatus('denied'); return; }
    setPinStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCheckinLat(pos.coords.latitude);
        setCheckinLng(pos.coords.longitude);
        setPinStatus('pinned');
      },
      () => setPinStatus('denied'),
      { timeout: 10000 }
    );
  };

  // Check-in handler — uses pre-pinned coords if available, skips geo request
  const handleCheckin = () => {
    setCheckinStatus("loading");
    const doPost = (lat, lng) => {
      fetch("/api/food-trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: truckSlug,
          token: truckToken,
          lat, lng,
          note: checkinNote,
          todaysSpecial: checkinSpecial,
          departureTime: checkinDeparture,
        }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.ok) {
            setCheckinStatus("success");
            setCheckinMsg(`You're checked in! Customers can now see ${d.name} on the locator.`);
            saveLocation(checkinNote);
          } else {
            setCheckinStatus("error");
            setCheckinMsg(d.error || "Check-in failed. Try again.");
          }
        })
        .catch(() => { setCheckinStatus("error"); setCheckinMsg("Network error. Try again."); });
    };

    // Use already-pinned coords if vendor dropped a pin, otherwise skip geo
    if (checkinLat && checkinLng) {
      doPost(checkinLat, checkinLng);
    } else {
      doPost(null, null);
    }
  };

  // Time helpers
  const now = Date.now();
  const isLive = (truck) => {
    if (!truck.lastCheckin) return false;
    return (now - new Date(truck.lastCheckin).getTime()) < 12 * 60 * 60 * 1000;
  };
  const timeAgo = (iso) => {
    const diff = Math.floor((now - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    return `${h}h ago`;
  };
  const formatComingDate = (iso) => {
    const d = new Date(iso);
    const diffDays = Math.ceil((d - now) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 6) return d.toLocaleDateString('en-US', { weekday: 'long' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const liveTrucks = (trucks || []).filter(isLive);
  const liveTrucksWithCoords = liveTrucks.filter(t => typeof t.lat === 'number' && typeof t.lng === 'number');
  const comingTrucks = (trucks || []).filter(t =>
    t.comingDate && new Date(t.comingDate) > new Date() && !isLive(t)
  );
  const allTrucks = trucks || [];

  // Love pills renderer (shared between live + directory cards)
  const LovePills = ({ slug }) => {
    const truckLoves = loves[slug];
    const items = truckLoves?.items || {};
    const sortedItems = Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const showInput = loveInput.slug === slug;

    return (
      <div style={{ marginBottom: 10 }}>
        {sortedItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {sortedItems.map(([item, count]) => {
              const key = `${slug}:${item}`;
              const loved = !!lovedItems[key];
              return (
                <button
                  key={item}
                  onClick={() => handleLove(slug, item)}
                  title={loved ? "Already loved!" : `Love ${item}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "4px 10px", borderRadius: 14,
                    background: loved ? `${C.sunset}20` : `${C.sunset}10`,
                    border: `1px solid ${loved ? C.sunset + '60' : C.sunset + '30'}`,
                    fontSize: 12, color: loved ? C.sunset : C.textLight,
                    fontWeight: loved ? 600 : 400,
                    cursor: loved ? "default" : "pointer",
                    fontFamily: "'Libre Franklin', sans-serif",
                    transition: "all 0.18s",
                    textTransform: "capitalize",
                  }}
                >
                  {loved ? '❤️' : '🤍'} {item} <span style={{ opacity: 0.65 }}>({count})</span>
                </button>
              );
            })}
          </div>
        )}
        {showInput ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              autoFocus
              type="text"
              value={loveInput.text}
              onChange={e => setLoveInput({ slug, text: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter') handleLoveCustom(slug); if (e.key === 'Escape') setLoveInput({ slug: '', text: '' }); }}
              placeholder="What did you love?"
              maxLength={50}
              style={{ flex: 1, padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", color: C.text, outline: "none", background: C.warmWhite }}
            />
            <button
              onClick={() => handleLoveCustom(slug)}
              style={{ padding: "5px 12px", borderRadius: 8, background: C.sunset, color: C.cream, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif" }}
            >
              ❤️
            </button>
            <button
              onClick={() => setLoveInput({ slug: '', text: '' })}
              style={{ padding: "5px 8px", borderRadius: 8, background: "transparent", color: C.textMuted, border: `1px solid ${C.sand}`, fontSize: 12, cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLoveInput({ slug, text: '' })}
            style={{ fontSize: 11, color: C.textMuted, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "underline" }}
          >
            + Love something else
          </button>
        )}
      </div>
    );
  };

  // ─── VENDOR CHECK-IN MODE ───────────────────────────────────
  // When a vendor opens their check-in URL, they see ONLY this.
  // No Navbar, no public sections, no Footer. Just their tool.
  if (isCheckinMode) {
    const truckName = checkinTruck?.name || truckSlug;

    const handleVendorShare = () => {
      const text = `🚚 ${truckName} is open at Manitou Beach! See all the food trucks out today →`;
      const url = 'https://manitoubeach.com/food-trucks';
      if (navigator.share) {
        navigator.share({ title: truckName, text, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2200);
      }
    };

    const handleCopyLink = () => {
      const loc = checkinNote ? ` at ${checkinNote}` : '';
      const special = checkinSpecial ? ` Today's special: ${checkinSpecial}.` : '';
      const text = `🚚 ${truckName} is serving${loc}!${special} Find us → https://manitoubeach.com/food-trucks`;
      navigator.clipboard.writeText(text).catch(() => {});
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    };

    const inputStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", color: C.text, background: C.warmWhite, outline: "none", marginBottom: 16 };
    const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: C.textMuted, marginBottom: 8 };

    return (
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "48px 24px 32px" }}>

          {/* Vendor Header — always visible */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sage, fontWeight: 600 }}>
              Manitou Beach · Food Truck Check-in
            </p>
            {checkinTruck?.photoUrl ? (
              <img src={checkinTruck.photoUrl} alt={truckName} style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover", border: `2px solid ${C.sand}`, margin: "0 auto 12px", display: "block" }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 14, background: `${C.sage}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px" }}>🚚</div>
            )}
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 400, color: C.text, margin: "0 0 4px" }}>
              {truckName}
            </h1>
            {checkinTruck?.cuisine && <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>{checkinTruck.cuisine}</p>}
          </div>

          {/* Loading state */}
          {trucks === null ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: C.textMuted, fontSize: 14 }}>Loading…</div>

          /* ─── SUCCESS STATE ─── */
          ) : checkinStatus === "success" ? (
            <div>
              {/* You're Live header */}
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 64, height: 64, borderRadius: "50%",
                  background: `${C.sage}15`, border: `2px solid ${C.sage}33`,
                  marginBottom: 16, fontSize: 32,
                }}>
                  📍
                </div>
                <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.sage, margin: "0 0 8px" }}>
                  You're Live!
                </h2>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
                  Customers can find you on the Manitou Beach Food Truck Locator right now.
                </p>
              </div>

              {/* Customer Preview Card */}
              <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, fontWeight: 600, marginBottom: 10 }}>
                Your customers see this:
              </p>
              <div style={{
                background: C.cream, borderRadius: 14,
                border: `2px solid ${C.sage}33`,
                overflow: "hidden", marginBottom: 20,
              }}>
                {checkinTruck?.photoUrl && (
                  <img src={checkinTruck.photoUrl} alt={truckName} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                )}
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.text, margin: 0 }}>{truckName}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.sage }} />
                      <span style={{ fontSize: 11, color: C.sage, fontWeight: 600 }}>just now</span>
                    </div>
                  </div>
                  {checkinTruck?.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{checkinTruck.cuisine}</div>}
                  {checkinNote && (
                    <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 8 }}>
                      📍 {checkinNote}
                    </div>
                  )}
                  {checkinSpecial && (
                    <div style={{ fontSize: 13, background: `${C.sunset}12`, border: `1px solid ${C.sunset}30`, borderRadius: 8, padding: "7px 12px", marginBottom: 8, color: C.sunset, fontWeight: 500 }}>
                      ⭐ {checkinSpecial}
                    </div>
                  )}
                  {checkinDeparture && (
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                      ⏱ Open until {checkinDeparture}
                    </div>
                  )}
                  {checkinTruck?.description && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{checkinTruck.description}</p>}
                </div>
              </div>

              {/* Map Preview */}
              {checkinLat && checkinLng && mapsKey && (
                <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.sand}` }}>
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${checkinLat},${checkinLng}&zoom=15&size=480x200&scale=2&markers=color:green|${checkinLat},${checkinLng}&key=${mapsKey}`}
                    alt="Your location on the map"
                    style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
                  />
                </div>
              )}

              {/* Share Section */}
              <div style={{ borderTop: `1px solid ${C.sand}`, paddingTop: 24, marginTop: 8 }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunset, margin: "0 0 4px", textAlign: "center" }}>
                  Bring the crowd
                </p>
                <p style={{ fontSize: 13, color: C.textLight, textAlign: "center", margin: "0 0 20px", lineHeight: 1.5 }}>
                  Share your location and let people know you're open.
                </p>

                <button
                  onClick={handleVendorShare}
                  style={{
                    width: "100%", padding: "14px", background: C.sage, color: C.cream,
                    border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif",
                    letterSpacing: 0.5, marginBottom: 10, transition: "background 0.2s",
                  }}
                >
                  {shareCopied ? '✓ Copied!' : 'Share the Food Truck Map 📣'}
                </button>

                <button
                  onClick={handleCopyLink}
                  style={{
                    width: "100%", padding: "12px", background: "transparent",
                    color: C.textLight, border: `1px solid ${C.sand}`, borderRadius: 10,
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    fontFamily: "'Libre Franklin', sans-serif", transition: "all 0.2s",
                  }}
                >
                  Copy My Check-in Link
                </button>

                <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
                  <button
                    onClick={() => { setCheckinStatus(""); setCheckinMsg(""); setCheckinSpecial(""); setCheckinDeparture(""); setCheckinNote(""); setCheckinLat(null); setCheckinLng(null); setPinStatus(""); }}
                    style={{ fontSize: 13, color: C.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "underline" }}
                  >
                    Check in again
                  </button>
                  <a
                    href="/food-trucks"
                    style={{ fontSize: 13, color: C.lakeBlue, textDecoration: "none", fontWeight: 600 }}
                  >
                    View the public page →
                  </a>
                </div>
              </div>
            </div>

          /* ─── CHECK-IN FORM ─── */
          ) : (
            <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.sand}`, padding: "28px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: "0 0 4px", textAlign: "center" }}>
                Let your customers know you're here
              </h2>
              <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", margin: "0 0 24px" }}>
                Fill in the details and go live on the locator.
              </p>

              <label style={labelStyle}>
                Where are you today?
              </label>

              {/* Saved location pills */}
              {savedLocations.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {savedLocations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setCheckinNote(loc)}
                      style={{
                        padding: '5px 12px', borderRadius: 20,
                        background: checkinNote === loc ? `${C.sage}20` : C.warmWhite,
                        border: `1px solid ${checkinNote === loc ? C.sage : C.sand}`,
                        fontSize: 12, color: checkinNote === loc ? C.sage : C.textLight,
                        fontWeight: checkinNote === loc ? 600 : 400,
                        cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif",
                        transition: 'all 0.15s',
                      }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={checkinNote}
                onChange={e => setCheckinNote(e.target.value)}
                placeholder={savedLocations.length > 0 ? "Or type a new location…" : "e.g. Near the boat launch, floating on Devils Lake…"}
                style={{ ...inputStyle, marginBottom: 10 }}
              />

              {/* Drop Pin button */}
              <div style={{ marginBottom: 20 }}>
                {pinStatus !== 'pinned' ? (
                  <button
                    onClick={handleDropPin}
                    disabled={pinStatus === 'loading'}
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: pinStatus === 'loading' ? C.sand : `${C.lakeBlue}15`,
                      border: `1px dashed ${pinStatus === 'loading' ? C.sand : C.lakeBlue}`,
                      borderRadius: 8, fontSize: 13, fontWeight: 600,
                      color: pinStatus === 'loading' ? C.textMuted : C.lakeBlue,
                      cursor: pinStatus === 'loading' ? 'default' : 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif",
                      transition: 'all 0.2s',
                    }}
                  >
                    {pinStatus === 'loading' ? 'Getting your location…' :
                     pinStatus === 'denied' ? '📍 Location denied — no pin (that\'s ok)' :
                     '📍 Drop My Pin — mark my exact spot'}
                  </button>
                ) : (
                  <div>
                    {/* Mini map thumbnail confirming pin dropped */}
                    {mapsKey && (
                      <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.sage}40`, marginBottom: 8 }}>
                        <img
                          src={`https://maps.googleapis.com/maps/api/staticmap?center=${checkinLat},${checkinLng}&zoom=15&size=480x160&scale=2&markers=color:green|${checkinLat},${checkinLng}&key=${mapsKey}`}
                          alt="Your pinned location"
                          style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: C.sage, fontWeight: 600 }}>
                        ✓ Pin dropped — your spot is marked
                      </span>
                      <button
                        onClick={handleDropPin}
                        style={{ fontSize: 12, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'underline', padding: 0 }}
                      >
                        Re-drop
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <label style={labelStyle}>
                Today's Special <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={checkinSpecial}
                onChange={e => setCheckinSpecial(e.target.value)}
                placeholder="e.g. Half-price pulled pork, new brisket sandwich…"
                style={inputStyle}
              />

              <label style={labelStyle}>
                Leaving around… <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={checkinDeparture}
                onChange={e => setCheckinDeparture(e.target.value)}
                placeholder="e.g. 3pm, sunset, until sold out"
                style={{ ...inputStyle, marginBottom: 8 }}
              />

              {checkinStatus === "error" && (
                <div style={{ marginBottom: 12, fontSize: 13, color: "#c05a5a", fontWeight: 500 }}>{checkinMsg}</div>
              )}
              <button
                onClick={handleCheckin}
                disabled={checkinStatus === "loading"}
                style={{
                  marginTop: 8, width: "100%", padding: "14px",
                  background: checkinStatus === "loading" ? C.sand : C.sage,
                  color: C.cream, border: "none", borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  cursor: checkinStatus === "loading" ? "default" : "pointer",
                  transition: "background 0.2s",
                  fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5,
                }}
              >
                {checkinStatus === "loading" ? "Checking in…" : "Check In — Go Live 📍"}
              </button>
            </div>
          )}
        </div>

        {/* Vendor Footer */}
        <div style={{ textAlign: "center", padding: "24px", borderTop: `1px solid ${C.sand}` }}>
          <a href="/food-trucks" style={{ fontSize: 12, color: C.textMuted, textDecoration: "none" }}>
            Powered by Manitou Beach · Devils Lake, Michigan
          </a>
        </div>
      </div>
    );
  }
  // ─── END VENDOR MODE ──────────────────────────────────────

  // ─── PUBLIC PAGE ──────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section className="ft-hero-section" style={{ position: "relative", overflow: "hidden", padding: "120px 24px 80px", textAlign: "center" }}>
        {/* Video background — desktop only (hidden on mobile via CSS class) */}
        <video
          className="ft-hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/images/foodtruck_hero.jpg"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        >
          <source src="https://dmg0joh3jdjfmu8k.public.blob.vercel-storage.com/foodtruck_webloop.mp4" type="video/mp4" />
        </video>
        {/* Overlay — darkens video for text legibility */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(10,18,24,0.72) 0%, rgba(45,59,69,0.65) 60%, rgba(10,18,24,0.55) 100%)", zIndex: 1 }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <FadeIn>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚚</div>
            <SectionLabel light>Live Locator</SectionLabel>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400, color: C.cream, lineHeight: 1.15, margin: "16px 0 20px" }}>
              Find a Food Truck
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 480, margin: "0 auto" }}>
              Local food trucks check in when they're open. See who's out on the lake today.
            </p>
            {liveTrucks.length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, background: `${C.sage}22`, border: `1px solid ${C.sage}44`, borderRadius: 20, padding: "8px 18px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.sage, boxShadow: `0 0 6px ${C.sage}` }} />
                <span style={{ fontSize: 13, color: C.sage, fontWeight: 600 }}>{liveTrucks.length} truck{liveTrucks.length !== 1 ? "s" : ""} open now</span>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.night} bottomColor={mapsKey && liveTrucksWithCoords.length > 0 ? C.dusk : C.warmWhite} />

      {/* Live Map — only when trucks have coordinates */}
      {mapsKey && liveTrucksWithCoords.length > 0 && (
        <section style={{ background: C.dusk, padding: "16px 24px 48px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16, textAlign: 'center' }}>Live Locations</p>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.08)`, boxShadow: '0 8px 40px rgba(0,0,0,0.35)' }}>
              {/* Map canvas */}
              <div ref={mapDivRef} style={{ width: '100%', height: 340 }} />

              {/* Selected truck card — slides up from bottom of map */}
              {selectedTruck && (
                <div
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: C.cream, borderTop: `2px solid ${C.sage}33`,
                    borderRadius: '0 0 16px 16px',
                    padding: '16px 20px 20px',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.10)',
                    animation: 'slideUp 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: 0 }}>{selectedTruck.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.sage }} />
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 600 }}>open now</span>
                        </div>
                      </div>
                      {selectedTruck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>{selectedTruck.cuisine}</div>}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {selectedTruck.locationNote && (
                          <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>📍 {selectedTruck.locationNote}</span>
                        )}
                        {selectedTruck.todaysSpecial && (
                          <span style={{ fontSize: 12, color: C.sunset, fontWeight: 500 }}>⭐ {selectedTruck.todaysSpecial}</span>
                        )}
                        {selectedTruck.departureTime && (
                          <span style={{ fontSize: 12, color: C.textMuted }}>⏱ Until {selectedTruck.departureTime}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedTruck(null); markersRef.current.forEach(m => { const pts2 = liveTrucksWithCoords; m.setIcon((() => { const w2 = Math.min(m.getTitle().length * 7 + 28, 160); const h2 = 26; const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="${w2}" height="${h2 + 8}"><rect x="0" y="0" width="${w2}" height="${h2}" rx="13" fill="#FAF6EF" stroke="#7A8E72" stroke-width="1.5"/><text x="${w2/2}" y="17" font-family="sans-serif" font-size="11" font-weight="600" fill="#3B3228" text-anchor="middle">${m.getTitle()}</text><polygon points="${w2/2-5},${h2} ${w2/2+5},${h2} ${w2/2},${h2+7}" fill="#FAF6EF" stroke="#7A8E72" stroke-width="1.5"/></svg>`; return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg2), scaledSize: new window.google.maps.Size(w2, h2 + 8), anchor: new window.google.maps.Point(w2 / 2, h2 + 8) }; })()); }); }}
                      style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: C.sand, border: 'none', cursor: 'pointer', fontSize: 14, color: C.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}
                    >×</button>
                  </div>
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: '10px 0 0', letterSpacing: '0.05em' }}>
              Tap a truck label to see details · {liveTrucksWithCoords.length} location{liveTrucksWithCoords.length !== 1 ? 's' : ''} pinned today
            </p>
          </div>
        </section>
      )}

      {mapsKey && liveTrucksWithCoords.length > 0
        ? <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} />
        : null
      }

      {/* Live Now section */}
      <section style={{ background: C.warmWhite, padding: "72px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: liveTrucks.length > 0 ? C.sage : C.sand, flexShrink: 0 }} />
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: C.text, margin: 0 }}>
                {liveTrucks.length > 0 ? "Open Right Now" : "No trucks checked in today"}
              </h2>
            </div>
          </FadeIn>
          {trucks === null ? (
            <div style={{ textAlign: "center", padding: "48px", color: C.textMuted, fontSize: 14 }}>Loading trucks…</div>
          ) : liveTrucks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}` }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🌤️</div>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
                No food trucks are checked in right now. Check back later — they update throughout the day.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {liveTrucks.map((truck, i) => (
                <FadeIn key={truck.id} delay={i * 60}>
                  <div style={{ background: C.cream, borderRadius: 14, border: `2px solid ${C.sage}33`, overflow: "hidden", height: "100%" }}>
                    {truck.photoUrl && (
                      <img src={truck.photoUrl} alt={truck.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    )}
                    <div style={{ padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.text, margin: 0 }}>{truck.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.sage }} />
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 600 }}>{timeAgo(truck.lastCheckin)}</span>
                        </div>
                      </div>
                      {truck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{truck.cuisine}</div>}
                      {truck.locationNote && (
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 8 }}>
                          📍 {truck.locationNote}
                        </div>
                      )}
                      {/* Today's Special + Departure */}
                      {truck.todaysSpecial && (
                        <div style={{ fontSize: 13, background: `${C.sunset}12`, border: `1px solid ${C.sunset}30`, borderRadius: 8, padding: "7px 12px", marginBottom: 8, color: C.sunset, fontWeight: 500 }}>
                          ⭐ {truck.todaysSpecial}
                        </div>
                      )}
                      {truck.departureTime && (
                        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                          ⏱ Open until {truck.departureTime}
                        </div>
                      )}
                      {truck.description && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "0 0 10px" }}>{truck.description}</p>}
                      {/* Love Pills */}
                      {truck.slug && <LovePills slug={truck.slug} />}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                        {truck.phone && (
                          <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            📱 Call
                          </a>
                        )}
                        {truck.lat && truck.lng && (
                          <a href={`https://www.google.com/maps?q=${truck.lat},${truck.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            🗺️ Directions
                          </a>
                        )}
                        {truck.website && (
                          <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600 }}>
                            Website →
                          </a>
                        )}
                        <button
                          onClick={() => shareTruck(truck)}
                          style={{ fontSize: 12, color: sharedId === truck.id ? C.sage : C.sunset, background: "none", border: "none", padding: 0, fontWeight: 700, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", display: "inline-flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}
                        >
                          {sharedId === truck.id ? '✓ Copied' : '↗ Tell a friend'}
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />

      {/* Coming Soon section */}
      {comingTrucks.length > 0 && (
        <section style={{ background: C.cream, padding: "48px 24px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 20 }}>📅</span>
                <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 400, color: C.text, margin: 0 }}>
                  Coming Soon
                </h2>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {comingTrucks.map((truck, i) => (
                <FadeIn key={truck.id} delay={i * 40}>
                  <div style={{ background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}`, padding: "16px 18px", display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: `${C.lakeBlue}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🚚</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.text }}>{truck.name}</div>
                      {truck.cuisine && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{truck.cuisine}</div>}
                      <div style={{ fontSize: 12, color: C.lakeBlue, fontWeight: 600, marginTop: 4 }}>{formatComingDate(truck.comingDate)}</div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Trucks directory */}
      {allTrucks.length > 0 && (
        <section style={{ background: C.cream, padding: comingTrucks.length > 0 ? "24px 24px 64px" : "64px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ marginBottom: 32 }}>
                <SectionLabel>All Trucks</SectionLabel>
                <SectionTitle>Find Your Favorite</SectionTitle>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {allTrucks.map((truck, i) => {
                const live = isLive(truck);
                return (
                  <FadeIn key={truck.id} delay={i * 40}>
                    <div style={{ background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}`, padding: "18px 20px" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: live ? `${C.sage}20` : `${C.sand}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                          🚚
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.text }}>{truck.name}</span>
                            {live && <span style={{ fontSize: 10, fontWeight: 700, color: C.sage, background: `${C.sage}15`, padding: "2px 7px", borderRadius: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Open</span>}
                          </div>
                          {truck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{truck.cuisine}</div>}
                          {truck.phone && (
                            <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", display: "block", marginTop: 6 }}>
                              {truck.phone}
                            </a>
                          )}
                          {truck.tier === 'featured' && truck.website && (
                            <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.sunset, textDecoration: "none", display: "block", marginTop: 4, fontWeight: 600 }}>
                              Menu / Info →
                            </a>
                          )}
                          {truck.scheduleNote && (
                            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, lineHeight: 1.5 }}>📅 {truck.scheduleNote}</div>
                          )}
                        </div>
                        {truck.tier === 'featured' && (
                          <div style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.sunset, background: `${C.sunset}15`, border: `1px solid ${C.sunset}30`, borderRadius: 6, padding: "3px 7px", alignSelf: "flex-start" }}>
                            Featured
                          </div>
                        )}
                      </div>
                      {/* Love pills in directory too */}
                      {truck.slug && <LovePills slug={truck.slug} />}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Owner CTA */}
      <section style={{ background: C.dusk, padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🚚</div>
            <SectionLabel light>Are You a Food Truck?</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 400, color: C.cream, margin: "16px 0 16px" }}>
              Get on the Map — $9/mo Founding Rate
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 28 }}>
              Live map pin, personal check-in URL, newsletter shoutout when you're open. Lock in the founding rate before it moves.
            </p>
            <Btn href="/food-truck-partner" variant="sunset">
              See Listing Details →
            </Btn>

            {/* Forgot check-in link */}
            <div style={{ marginTop: 36, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 28 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                Already a member? Text your check-in link to your phone.
              </p>
              {smsStatus === 'sent' ? (
                <p style={{ fontSize: 14, color: C.sage, fontWeight: 600 }}>✓ Check your texts — link is on its way.</p>
              ) : (
                <div style={{ display: "flex", gap: 8, maxWidth: 340, margin: "0 auto" }}>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={e => setSmsPhone(e.target.value)}
                    placeholder="Your mobile number"
                    style={{
                      flex: 1, padding: "11px 14px", borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.08)", color: C.cream,
                      fontSize: 14, fontFamily: "'Libre Franklin', sans-serif",
                      outline: "none",
                    }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSmsRequest(); }}
                  />
                  <button
                    onClick={() => {
                      if (!smsPhone.replace(/\D/g, '').length >= 10) return;
                      setSmsStatus('loading');
                      fetch('/api/send-checkin-link', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: smsPhone }),
                      })
                        .then(r => r.json())
                        .then(() => setSmsStatus('sent'))
                        .catch(() => setSmsStatus('sent')); // always show sent — don't leak whether registered
                    }}
                    disabled={smsStatus === 'loading'}
                    style={{
                      padding: "11px 18px", borderRadius: 8,
                      background: smsStatus === 'loading' ? "rgba(255,255,255,0.1)" : C.sage,
                      color: C.cream, border: "none", fontSize: 13, fontWeight: 700,
                      cursor: smsStatus === 'loading' ? "default" : "pointer",
                      fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap",
                    }}
                  >
                    {smsStatus === 'loading' ? '…' : 'Text Me'}
                  </button>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
