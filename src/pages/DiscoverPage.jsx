import React, { useState, useEffect, useRef } from 'react';
import { Btn, PageSponsorBanner, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { DISCOVER_MAP_CENTER, DISCOVER_CATS, DISCOVER_DYNAMIC_CAT_ICONS, DISCOVER_POIS, DISCOVER_MAP_STYLES, createDiscoverPin, buildDiscoverInfoWindow } from '../data/discover';

// Renders a PNG icon (when path starts with /) or falls back to emoji/text
function CatIcon({ icon, size = 18, style = {} }) {
  if (!icon) return null;
  if (icon.startsWith('/')) {
    return <img src={icon} alt="" style={{ width: size, height: size, objectFit: 'contain', display: 'inline-block', ...style }} />;
  }
  return <span style={{ fontSize: size - 2, lineHeight: 1, ...style }}>{icon}</span>;
}

export default function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [businesses, setBusinesses] = useState([]);
  const [dynamicCats, setDynamicCats] = useState([]); // categories from Notion not in DISCOVER_CATS
  const [communityPois, setCommunityPois] = useState(null); // null = loading, [] = loaded (empty or not)
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapDivRef = useRef(null);
  const mapObjRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    fetch('/api/businesses')
      .then(r => r.json())
      .then(d => setBusinesses([...(d.free || []), ...(d.enhanced || []), ...(d.featured || []), ...(d.premium || [])]))
      .catch(() => {});
    // Community POIs from Notion — merged with hardcoded fallbacks
    fetch('/api/community-pois')
      .then(r => r.json())
      .then(d => setCommunityPois(d.pois || []))
      .catch(() => setCommunityPois([])); // fall back to hardcoded on error
    // Dynamic categories — Notion categories not yet in DISCOVER_CATS get auto-pills
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        const cats = (d.unknownCategories || []).map(notionKey => {
          const override = DISCOVER_DYNAMIC_CAT_ICONS[notionKey];
          return {
            id: `dynamic-${notionKey.toLowerCase().replace(/\s+/g, '-')}`,
            label: notionKey,
            notionKey,
            icon: override?.icon || null, // null = star placeholder rendered inline
            color: override?.color || '#9B8B7A',
            dynamic: true,
          };
        });
        setDynamicCats(cats);
      })
      .catch(() => {});
  }, []);

  // Load Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('VITE_GOOGLE_MAPS_API_KEY is not set. Add it to Vercel environment variables and redeploy.');
      return;
    }
    if (!mapDivRef.current) return;
    let active = true;
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      new Loader({ apiKey, version: 'weekly' }).load().then(google => {
        if (!active || !mapDivRef.current) return;
        googleRef.current = google;
        mapObjRef.current = new google.maps.Map(mapDivRef.current, {
          center: DISCOVER_MAP_CENTER,
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          styles: DISCOVER_MAP_STYLES,
        });
        infoWindowRef.current = new google.maps.InfoWindow();
        setMapReady(true);
      }).catch(err => {
        if (active) setMapError('Map failed to load: ' + err.message);
      });
    }).catch(err => {
      if (active) setMapError('Loader error: ' + err.message);
    });
    return () => { active = false; };
  }, []);

  // Merge Notion community POIs with hardcoded fallbacks (dedup by name)
  // communityPois === null means still loading — show hardcoded pins immediately
  const mergedPois = communityPois === null
    ? DISCOVER_POIS
    : communityPois.length > 0
      ? (() => {
          const notionNames = new Set(communityPois.map(p => p.name.toLowerCase()));
          const extras = DISCOVER_POIS.filter(p => !notionNames.has(p.name.toLowerCase()));
          return [...communityPois, ...extras];
        })()
      : DISCOVER_POIS; // API returned nothing — full hardcoded fallback

  // Update markers when category, map readiness, or POI data changes
  useEffect(() => {
    const google = googleRef.current;
    const map = mapObjRef.current;
    if (!google || !map) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    const activeCatObj = [...DISCOVER_CATS, ...dynamicCats].find(c => c.id === activeCategory) || DISCOVER_CATS[0];

    // Paid Notion businesses with valid coords — these take precedence over hardcoded POIs
    const bizPins = businesses.filter(b =>
      b.tier !== 'free' && b.lat && b.lng &&
      (activeCategory === 'all' || b.categories?.includes(activeCatObj.notionKey))
    );
    // Names of businesses that override their POI counterpart (so we don't double-pin)
    const bizOverrideNames = new Set(bizPins.map(b => b.name?.toLowerCase()));

    // POIs: show all, but skip any whose name is covered by a Notion business (Notion coords are authoritative)
    const pois = activeCategory === 'all' ? mergedPois : mergedPois.filter(p => (p.cats || [p.cat]).includes(activeCategory));
    pois.forEach((poi, idx) => {
      if (bizOverrideNames.has(poi.name.toLowerCase())) return; // Notion business pin shows instead
      const color = DISCOVER_CATS.find(c => c.id === poi.cat)?.color || '#7A8E72';
      const marker = new google.maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map,
        title: poi.name,
        icon: { url: createDiscoverPin(color), scaledSize: new google.maps.Size(28, 36), anchor: new google.maps.Point(14, 36) },
        animation: google.maps.Animation.DROP,
        zIndex: idx,
      });
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(buildDiscoverInfoWindow(poi));
        infoWindowRef.current.open(map, marker);
      });
      markersRef.current.push(marker);
    });
    bizPins.forEach((biz, idx) => {
      const marker = new google.maps.Marker({
        position: { lat: biz.lat, lng: biz.lng },
        map,
        title: biz.name,
        icon: { url: createDiscoverPin('#D4845A'), scaledSize: new google.maps.Size(24, 31), anchor: new google.maps.Point(12, 31) },
        animation: google.maps.Animation.DROP,
        zIndex: 1000 + idx,
      });
      const iwContent = `<div style="padding:6px 8px 10px;max-width:240px;font-family:system-ui,sans-serif;line-height:1.45">
        <div style="font-size:13px;font-weight:700;color:#2D3B45;margin-bottom:3px">${biz.name}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#D4845A;font-weight:700;margin-bottom:6px">${biz.category}</div>
        ${biz.address ? `<div style="font-size:11px;color:#666;margin-bottom:4px">${biz.address}</div>` : ''}
        ${biz.phone ? `<a href="tel:${biz.phone.replace(/\D/g,'')}" style="display:block;font-size:12px;font-weight:600;color:#7A8E72;margin-bottom:8px;text-decoration:none">${biz.phone}</a>` : ''}
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${biz.website ? `<a href="${biz.website}" target="_blank" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Website →</a>` : ''}
        </div>
        <div style="margin-top:8px;font-size:10px;color:#aaa">Listed on Manitou Beach</div>
      </div>`;
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(iwContent);
        infoWindowRef.current.open(map, marker);
      });
      markersRef.current.push(marker);
    });

    const allPinned = [...pois, ...bizPins];
    if (activeCategory === 'all') {
      // Lock "All" view to the lake — fitBounds would zoom way out to cover distant POIs
      map.panTo(DISCOVER_MAP_CENTER);
      map.setZoom(12);
    } else if (allPinned.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      allPinned.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
    } else if (allPinned.length === 1) {
      map.panTo({ lat: allPinned[0].lat, lng: allPinned[0].lng });
      map.setZoom(14);
    }
  }, [activeCategory, mapReady, businesses, communityPois, dynamicCats]);

  // Auto-scroll active chip into view on mobile
  const chipsRef = useRef(null);
  useEffect(() => {
    const bar = chipsRef.current;
    if (!bar) return;
    const activeChip = bar.querySelector('[data-chip-active]');
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeCategory]);

  const allCats = [...DISCOVER_CATS, ...dynamicCats];
  const activeCat = allCats.find(c => c.id === activeCategory) || DISCOVER_CATS[0];
  const filteredPois = activeCategory === 'all' ? mergedPois : mergedPois.filter(p => (p.cats || [p.cat]).includes(activeCategory));
  const filteredBizzes = activeCat.notionKey
    ? businesses
        .filter(b => b.categories?.includes(activeCat.notionKey))
        .sort((a, b) => (b.emergency ? 1 : 0) - (a.emergency ? 1 : 0)) // emergency first
    : [];
  const showBizCTA = !!activeCat.notionKey && filteredBizzes.length === 0;

  const DRIVE_TIMES = [
    { city: 'Tecumseh', time: '15 min', note: 'Hospital · Grocery · Hardware' },
    { city: 'Adrian', time: '20 min', note: 'Walmart · Meijer · Shopping' },
    { city: 'Jackson', time: '30 min', note: 'Airport · Chateau Aeronautique' },
    { city: 'Ann Arbor', time: '55 min', note: 'U of M Medical Center' },
    { city: 'Toledo', time: '50 min', note: 'Ohio border city' },
    { city: 'Detroit (DTW)', time: '~70 min', note: 'Major airport access' },
  ];

  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── Compact Title Bar ── */}
      <div style={{ backgroundImage: 'url(/images/DL-boat.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 40%', position: 'relative', minHeight: 'clamp(280px, 40vh, 380px)', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,18,24,0.55) 0%, rgba(10,18,24,0.88) 100%)' }} />
        <div className="discover-hero-inner" style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 10 }}>
            Manitou Beach · Devils Lake · Michigan
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 400, color: C.cream, margin: '0 0 8px 0', lineHeight: 1.1 }}>
            Discover Manitou Beach
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Food, healthcare, schools, water access, wineries, community — all in one place.
          </p>
        </div>
      </div>

      {/* ── Sticky Category Chips ── */}
      <div className="discover-chips-wrapper" style={{ position: 'sticky', top: 64, zIndex: 100, background: 'rgba(250,246,239,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.sand}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div ref={chipsRef} className="discover-chips-bar" style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {allCats.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} data-chip-active={active || undefined} onClick={() => setActiveCategory(cat.id)} style={{
                flexShrink: 0, background: active ? cat.color : '#fff', color: active ? '#fff' : C.text,
                border: `1.5px solid ${active ? cat.color : C.sand}`, borderRadius: 24, padding: '6px 14px',
                fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: "'Libre Franklin', sans-serif",
                cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: active ? `0 2px 8px ${cat.color}40` : 'none',
              }}>
                {cat.icon
                  ? <CatIcon icon={cat.icon} size={28} style={{ filter: active ? 'brightness(0) invert(1)' : 'none', transition: 'filter 0.18s' }} />
                  : <span style={{ fontSize: 20, opacity: 0.6 }}>★</span>
                }
                {cat.label}
              </button>
            );
          })}
          <a href="/food-trucks" style={{
            flexShrink: 0, background: '#fff', color: C.text,
            border: `1.5px solid ${C.sand}`, borderRadius: 24, padding: '6px 14px',
            fontSize: 13, fontWeight: 500, fontFamily: "'Libre Franklin', sans-serif",
            cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
          }}>
            <CatIcon icon="/images/icons/food-truck-icon-dark.png" size={28} />
            Food Trucks
          </a>
        </div>
      </div>

      {/* ── Google Map ── */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(300px, 52vh, 540px)', background: '#e8e0d0' }}>
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
        {!mapReady && !mapError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2ede3', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.sage}`, borderTopColor: 'transparent', animation: 'discspin 0.8s linear infinite' }} />
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>Loading map…</div>
          </div>
        )}
        {mapError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2ede3', flexDirection: 'column', gap: 10, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>🗺️</div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: '#c05a5a', fontWeight: 600, maxWidth: 440 }}>{mapError}</div>
          </div>
        )}
        {activeCategory !== 'all' && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(250,246,239,0.96)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: activeCat.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: C.dusk }}>{activeCat.label}</span>
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>· {filteredPois.length} location{filteredPois.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── List Panel ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 400, color: C.dusk, margin: 0 }}>
            {activeCategory === 'all' ? 'Everything nearby' : activeCat.label}
          </h2>
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>
            {filteredPois.length + filteredBizzes.length} place{filteredPois.length + filteredBizzes.length !== 1 ? 's' : ''}
          </span>
          {activeCategory === 'food' && (
            <a href="/food-trucks" style={{
              display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(212,132,90,0.08)',
              border: '1px solid rgba(212,132,90,0.2)', borderRadius: 8, padding: '10px 16px',
              textDecoration: 'none', transition: 'background 0.15s', maxWidth: 520,
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,132,90,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,132,90,0.08)'}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>🔥</span>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                <strong style={{ color: C.sunset }}>Looking for food trucks?</strong> They have their own live locator — see who's here right now, where they're parked, and what they're serving. <span style={{ color: C.sunset, fontWeight: 600 }}>Open the locator →</span>
              </span>
            </a>
          )}
          {activeCategory === 'healthcare' && (
            <div style={{ background: '#c05a5a10', border: '1px solid #c05a5a28', borderRadius: 8, padding: '6px 14px', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: '#c05a5a', lineHeight: 1.45, maxWidth: 500 }}>
              <strong>Tip:</strong> Always call your insurance first — network coverage varies by plan. Use the number on your card or your insurer's provider finder.
            </div>
          )}
        </div>

        {filteredPois.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: filteredBizzes.length > 0 || showBizCTA ? 40 : 0 }}>
            {filteredPois.map(poi => {
              const catInfo = DISCOVER_CATS.find(c => c.id === poi.cat);
              const color = catInfo?.color || '#7A8E72';
              const dir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((poi.address || poi.name) + (poi.address ? '' : ', MI'))}`;
              return (
                <div key={poi.id} style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 12, overflow: 'hidden', display: 'flex', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ width: 4, background: color, flexShrink: 0 }} />
                  <div style={{ padding: '15px 18px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 400, color: C.dusk, lineHeight: 1.3 }}>{poi.name}</div>
                      <CatIcon icon={catInfo?.icon} size={28} style={{ flexShrink: 0, opacity: 0.75 }} />
                    </div>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, marginBottom: 5 }}>{poi.sub}</div>
                    {poi.address && <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.text, marginBottom: 3 }}>{poi.address}</div>}
                    {poi.note && <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: C.textMuted, marginBottom: 8, fontStyle: 'italic' }}>{poi.note}</div>}
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
                      {poi.phone && <a href={`tel:${poi.phone.replace(/\D/g, '')}`} style={{ fontSize: 12, fontWeight: 600, color: C.sage, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>{poi.phone}</a>}
                      <a href={dir} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: C.lakeBlue, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Get Directions →</a>
                      {poi.website && <a href={poi.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: C.sunset, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Website →</a>}
                      {poi.href && <a href={poi.href} style={{ fontSize: 12, fontWeight: 600, color: C.sunset, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Learn More →</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredBizzes.length > 0 && (
          <>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.textMuted, marginBottom: 16 }}>Local Businesses</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {filteredBizzes.map((biz, i) => (
                <div key={biz.id || i} style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {biz.logo
                    ? <img src={biz.logo} alt={biz.name} style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'contain', border: `1px solid ${C.sand}`, background: '#faf5ef', padding: 4, flexShrink: 0 }} />
                    : <div style={{ width: 46, height: 46, borderRadius: 8, background: `${activeCat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {activeCat.icon ? <CatIcon icon={activeCat.icon} size={24} /> : <span style={{ fontSize: 20 }}>★</span>}
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.dusk }}>{biz.name}</div>
                      {biz.emergency && <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", background: '#c05a5a', color: '#fff', borderRadius: 4, padding: '2px 6px', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>24hr / Emergency</span>}
                    </div>
                    {biz.tagline && <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, lineHeight: 1.4, marginBottom: 8 }}>{biz.tagline}</div>}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {biz.phone && <a href={`tel:${biz.phone}`} style={{ fontSize: biz.emergency ? 14 : 12, fontWeight: 700, color: biz.emergency ? '#c05a5a' : C.sage, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>{biz.phone}</a>}
                      {biz.website && <a href={biz.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: C.lakeBlue, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Visit →</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showBizCTA && (
          <div style={{ background: `${activeCat.color}08`, border: `1.5px dashed ${activeCat.color}45`, borderRadius: 16, padding: '40px 32px', textAlign: 'center', marginTop: filteredPois.length > 0 ? 32 : 0 }}>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              {activeCat.icon ? <CatIcon icon={activeCat.icon} size={48} /> : <span style={{ fontSize: 40 }}>★</span>}
            </div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 8 }}>
              No {activeCat.label} businesses listed yet.
            </div>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textMuted, maxWidth: 380, margin: '0 auto 24px' }}>
              Own a {activeCat.label.toLowerCase()} business near Manitou Beach? This is where locals and visitors look.
            </p>
            <Btn href="/business" variant="primary" small>Get Listed — from $9/mo</Btn>
          </div>
        )}
      </div>

      {/* ── Explore More ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 52px' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.textMuted, marginBottom: 14 }}>Explore More</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {[
            { icon: '🎣', label: 'Fishing Guide', href: '/fishing' },
            { icon: '🍷', label: 'Wineries', href: '/wineries' },
            { icon: '🛍️', label: 'The Village', href: '/village' },
            { icon: '📅', label: 'Events', href: '/events' },
            { icon: '⛵', label: 'Devils Lake', href: '/devils-lake' },
            { icon: '💧', label: 'Round Lake', href: '/round-lake' },
            { icon: '🏛️', label: 'Local History', href: '/historical-society' },
          ].map((tile, i) => (
            <a key={i} href={tile.href} style={{ flexShrink: 0, textDecoration: 'none', background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 8, transition: 'box-shadow 0.18s, transform 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: 18 }}>{tile.icon}</span>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: C.dusk, whiteSpace: 'nowrap' }}>{tile.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Drive Times ── */}
      <section style={{ background: C.dusk }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 20px' }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 10 }}>Location</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: C.cream, margin: '0 0 10px 0' }}>Closer than you think.</h2>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.48)', margin: '0 0 40px 0', maxWidth: 480 }}>
            You're not in the middle of nowhere. You're in the middle of everything that matters — just far enough from the noise.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
            {DRIVE_TIMES.map((row, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '20px 22px', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.cream, lineHeight: 1 }}>{row.time}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: C.sage, marginTop: 6 }}>{row.city}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 4 }}>{row.note}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: 'rgba(255,255,255,0.32)', marginTop: 20, fontStyle: 'italic' }}>
            Year-round community. Quiet winters. Summers on the water.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 400, color: C.dusk, marginBottom: 10 }}>
          This is your community too.
        </div>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textMuted, maxWidth: 420, margin: '0 auto 28px' }}>
          Get your business in front of the people who live here, visit here, and move here.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="/business" variant="primary">List Your Business</Btn>
          <Btn href="/promote" variant="sunset">List an Event</Btn>
        </div>
      </section>
      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="discover" />
      <style>{`
        @keyframes discspin { to { transform: rotate(360deg); } }
        .discover-hero-inner { padding: 80px 48px 36px; }
        @media (max-width: 768px) {
          .discover-hero-inner { padding: 80px 20px 28px; }
          .discover-chips-bar {
            padding: 10px 16px !important;
            gap: 6px !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .discover-chips-bar::-webkit-scrollbar { display: none; }
          .discover-chips-bar button,
          .discover-chips-bar a { padding: 6px 12px !important; font-size: 12px !important; }
          /* Fade hints on edges to show scrollability */
          .discover-chips-wrapper {
            position: relative;
          }
          .discover-chips-wrapper::after {
            content: '';
            position: absolute;
            top: 0; right: 0; bottom: 0;
            width: 32px;
            background: linear-gradient(90deg, transparent, rgba(250,246,239,0.97));
            pointer-events: none;
            z-index: 1;
          }
        }
      `}</style>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
