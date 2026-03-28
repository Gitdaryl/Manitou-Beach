import React, { useState, useEffect, useRef } from 'react';
import { Btn, FadeIn, PageSponsorBanner, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C, GEO } from '../data/config';
import { Footer, GlobalStyles, Navbar, NewsletterInline } from '../components/Layout';
import yeti from '../data/errorMessages';
import { celebrate } from '../data/celebrate';

// Format departure time for display — always today, so just show local time
function formatDeparture(dt) {
  if (!dt) return '';
  if (dt === 'after-dark') return 'after dark';
  const d = new Date(dt);
  if (!isNaN(d.getTime())) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return dt;
}

// Quick-pick preset colors (shown as swatches) — stored as hex
const PIN_PRESETS = [
  '#C44D3F', '#E07060', '#D4845A', '#C4A035',
  '#7A8E72', '#4A6741', '#4A9E8E', '#4A7FB5',
  '#3D5A6E', '#7B5EA7', '#A3456A', '#555555',
  '#E84393', '#0984E3', '#00B894', '#FDCB6E',
  '#E17055', '#6C5CE7', '#00CEC9', '#2D3436',
];

// Darken a hex color by ~25% for the pin stroke
function darkenHex(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = (v) => Math.max(0, Math.round(v * 0.72)).toString(16).padStart(2, '0');
  return `#${d(r)}${d(g)}${d(b)}`;
}

// Legacy ID → hex migration map (for trucks that checked in with old color IDs)
const LEGACY_COLORS = {
  sage: '#7A8E72', red: '#C44D3F', blue: '#4A7FB5', orange: '#D4845A',
  purple: '#7B5EA7', teal: '#4A9E8E', gold: '#C4A035', navy: '#3D5A6E',
  coral: '#E07060', forest: '#4A6741', charcoal: '#555555', berry: '#A3456A',
};

function getPinColor(colorVal) {
  // Accept hex (#xxxxxx), legacy ID, or empty
  let hex = colorVal?.startsWith('#') ? colorVal : LEGACY_COLORS[colorVal] || '#7A8E72';
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) hex = '#7A8E72'; // fallback to sage
  return { fill: hex, stroke: darkenHex(hex) };
}

// Build a teardrop drop-pin SVG with floating name callout
function makeMapPin(name, selected, G, colorId) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const initial = name.charAt(0).toUpperCase();
  const pc = getPinColor(colorId);

  // Pin geometry
  const pinR = 18; // pin head outer radius
  const circR = 13; // inner circle radius (for initial)
  const pinTip = 14; // length of the point below the circle
  const pinW = pinR * 2 + 4;
  const pinH = pinR * 2 + pinTip + 4;
  const pinCy = pinR + 2; // vertical center of circle head

  // Label geometry
  const charW = 6.2;
  const labelPad = 14;
  const labelW = Math.min(name.length * charW + labelPad * 2, 180);
  const labelH = 22;
  const gap = 6;

  // Total canvas
  const totalW = Math.max(pinW, labelW) + 4; // +4 for shadow room
  const totalH = labelH + gap + pinH + 4;
  const midX = totalW / 2;

  // Label position
  const labelX = (totalW - labelW) / 2;

  // Pin position
  const pCx = midX;
  const pCy = labelH + gap + pinCy;
  const pBottom = labelH + gap + pinH;

  // Colors — use truck's chosen color, darken on select
  const pinFill = selected ? pc.stroke : pc.fill;
  const pinStroke = pc.stroke;
  const innerFill = '#FFFFFF';
  const initialColor = pinFill;
  const labelBg = selected ? pc.stroke : '#FAF6EF';
  const labelStroke = selected ? pc.stroke : pc.fill;
  const labelText = selected ? '#FFFFFF' : '#3B3228';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">
<defs>
  <filter id="d"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.22"/></filter>
</defs>
<rect x="${labelX}" y="1" width="${labelW}" height="${labelH}" rx="11" fill="${labelBg}" stroke="${labelStroke}" stroke-width="1.2" filter="url(#d)"/>
<text x="${midX}" y="${1 + labelH / 2 + 4}" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="600" fill="${labelText}" text-anchor="middle">${esc(name)}</text>
<line x1="${midX}" y1="${1 + labelH}" x2="${midX}" y2="${labelH + gap}" stroke="${labelStroke}" stroke-width="1" opacity="0.35"/>
<path d="M${pCx},${pBottom} C${pCx - 4},${pCy + pinR * 0.7} ${pCx - pinR},${pCy + pinR * 0.25} ${pCx - pinR},${pCy} A${pinR},${pinR} 0 1,1 ${pCx + pinR},${pCy} C${pCx + pinR},${pCy + pinR * 0.25} ${pCx + 4},${pCy + pinR * 0.7} ${pCx},${pBottom}Z" fill="${pinFill}" stroke="${pinStroke}" stroke-width="1.5" filter="url(#d)"/>
<circle cx="${pCx}" cy="${pCy}" r="${circR}" fill="${innerFill}"/>
<text x="${pCx}" y="${pCy + 5}" font-family="system-ui,-apple-system,sans-serif" font-size="15" font-weight="700" fill="${initialColor}" text-anchor="middle">${initial}</text>
</svg>`;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new G.Size(totalW, totalH),
    anchor: new G.Point(midX, pBottom),
  };
}

// Upgrade a pin to show the truck's photo instead of an initial
function upgradeMarkerWithPhoto(marker, photoUrl, name, selected, G, colorId) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const pc = getPinColor(colorId);
    // Pin geometry (must match makeMapPin)
    const pinR = 18, circR = 13, pinTip = 14;
    const pinW = pinR * 2 + 4, pinH = pinR * 2 + pinTip + 4, pinCy = pinR + 2;
    const charW = 6.2, labelPad = 14;
    const labelW = Math.min(name.length * charW + labelPad * 2, 180);
    const labelH = 22, gap = 6;
    const scale = 2; // retina
    const totalW = Math.max(pinW, labelW) + 4;
    const totalH = labelH + gap + pinH + 4;
    const midX = totalW / 2;
    const pCy = labelH + gap + pinCy;
    const pBottom = labelH + gap + pinH;
    const labelX = (totalW - labelW) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = totalW * scale;
    canvas.height = totalH * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const pinFill = selected ? pc.stroke : pc.fill;
    const pinStroke = pc.stroke;
    const labelBg = selected ? pc.stroke : '#FAF6EF';
    const labelStroke = selected ? pc.stroke : pc.fill;
    const labelText = selected ? '#FFFFFF' : '#3B3228';

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;

    // Label pill
    const r = 11;
    ctx.beginPath();
    ctx.roundRect(labelX, 1, labelW, labelH, r);
    ctx.fillStyle = labelBg;
    ctx.fill();
    ctx.strokeStyle = labelStroke;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Label text
    ctx.shadowColor = 'transparent';
    ctx.font = '600 11px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = labelText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, midX, 1 + labelH / 2);

    // Connector line
    ctx.beginPath();
    ctx.moveTo(midX, 1 + labelH);
    ctx.lineTo(midX, labelH + gap);
    ctx.strokeStyle = labelStroke;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.35;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Teardrop pin
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1;
    ctx.beginPath();
    ctx.moveTo(midX, pBottom);
    ctx.bezierCurveTo(midX - 4, pCy + pinR * 0.7, midX - pinR, pCy + pinR * 0.25, midX - pinR, pCy);
    ctx.arc(midX, pCy, pinR, Math.PI, 0, false);
    ctx.bezierCurveTo(midX + pinR, pCy + pinR * 0.25, midX + 4, pCy + pinR * 0.7, midX, pBottom);
    ctx.closePath();
    ctx.fillStyle = pinFill;
    ctx.fill();
    ctx.strokeStyle = pinStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Clip circle for photo
    ctx.shadowColor = 'transparent';
    ctx.save();
    ctx.beginPath();
    ctx.arc(midX, pCy, circR, 0, Math.PI * 2);
    ctx.clip();
    // Draw photo centered and covering the circle
    const sz = circR * 2;
    const aspect = img.width / img.height;
    let dw = sz, dh = sz;
    if (aspect > 1) dw = sz * aspect; else dh = sz / aspect;
    ctx.drawImage(img, midX - dw / 2, pCy - dh / 2, dw, dh);
    ctx.restore();

    // Circle border
    ctx.beginPath();
    ctx.arc(midX, pCy, circR, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    marker.setIcon({
      url: canvas.toDataURL(),
      scaledSize: new G.Size(totalW, totalH),
      anchor: new G.Point(midX, pBottom),
    });
  };
  img.onerror = () => {}; // keep the initial-based pin on failure
  img.src = photoUrl;
}

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

// Haversine distance in miles between two lat/lng points
function milesFrom(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isNearby(truck) {
  if (typeof truck.lat !== 'number' || typeof truck.lng !== 'number') return true; // no coords = show in list, skip map
  return milesFrom(GEO.centerLat, GEO.centerLng, truck.lat, truck.lng) <= GEO.mapRadiusMiles;
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
  const [checkinPinColor, setCheckinPinColor] = useState("#7A8E72");
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
  const truckCardRefs = useRef({});

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

  // Coming schedule (vendor mode)
  const [comingDateLocal, setComingDateLocal] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleNote, setScheduleNote] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState(''); // '' | 'loading' | 'saved' | 'cleared' | 'error'
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  // Event apply (vendor mode)
  const [vendorEvents, setVendorEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [applyStatus, setApplyStatus] = useState(''); // '' | 'loading' | 'applied' | 'duplicate' | 'error'
  const [applyEventName, setApplyEventName] = useState('');

  // Share + love input state
  const [sharedId, setSharedId] = useState(null);
  const [loveInput, setLoveInput] = useState({ slug: '', text: '' }); // one open at a time

  // Share truck
  const shareTruck = (truck) => {
    const loc = truck.locationNote ? ` — ${truck.locationNote}` : '';
    const text = `${truck.name} is here today${loc}. Meet you there! 🚚`;
    const url = 'https://manitou-beach.vercel.app/food-trucks';
    if (navigator.share) {
      navigator.share({ title: truck.name, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
      setSharedId(truck.id);
      setTimeout(() => setSharedId(null), 2200);
    }
  };

  // Sync comingDateLocal, pinColor, and detect "already live" on load
  useEffect(() => {
    if (!checkinTruck) return;
    if (checkinTruck.comingDate) setComingDateLocal(checkinTruck.comingDate);
    if (checkinTruck.pinColor) {
      const pc = checkinTruck.pinColor;
      setCheckinPinColor(pc.startsWith('#') ? pc : LEGACY_COLORS[pc] || '#7A8E72');
    }
    // If truck is already live (e.g. page refresh), restore success state
    if (checkinStatus === '' && isCheckinMode && isLive(checkinTruck)) {
      setCheckinNote(checkinTruck.locationNote || '');
      setCheckinSpecial(checkinTruck.todaysSpecial || '');
      if (checkinTruck.lat && checkinTruck.lng) {
        setCheckinLat(checkinTruck.lat);
        setCheckinLng(checkinTruck.lng);
      }
      setCheckinStatus('success');
      setCheckinMsg(`You're already live! Customers can see ${checkinTruck.name} on the locator.`);
    }
  }, [checkinTruck]);

  // Fetch events accepting vendors (vendor mode)
  useEffect(() => {
    if (!isCheckinMode) return;
    fetch('/api/events')
      .then(r => r.json())
      .then(data => {
        const eligible = (data.events || []).filter(e => e.vendorRegEnabled);
        setVendorEvents(eligible);
      })
      .catch(() => {});
  }, [isCheckinMode]);

  // Schedule handlers (vendor mode)
  const handleSchedule = async () => {
    if (!scheduleDate) return;
    setScheduleStatus('loading');
    try {
      const res = await fetch('/api/food-trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: truckSlug, token: truckToken, action: 'schedule', comingDate: scheduleDate, scheduleNote }),
      });
      const d = await res.json();
      if (d.ok) { setComingDateLocal(scheduleDate); setScheduleDate(''); setScheduleNote(''); setScheduleStatus('saved'); }
      else setScheduleStatus('error');
    } catch { setScheduleStatus('error'); }
  };

  const handleClearSchedule = async () => {
    setScheduleStatus('loading');
    try {
      const res = await fetch('/api/food-trucks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: truckSlug, token: truckToken, action: 'schedule', comingDate: null }),
      });
      const d = await res.json();
      if (d.ok) { setComingDateLocal(null); setScheduleStatus('cleared'); }
      else setScheduleStatus('error');
    } catch { setScheduleStatus('error'); }
  };

  // Apply to event (vendor mode)
  const handleEventApply = async () => {
    if (!selectedEventId) return;
    setApplyStatus('loading');
    try {
      const res = await fetch('/api/food-truck-event-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: truckSlug, token: truckToken, eventId: selectedEventId }),
      });
      const d = await res.json();
      if (d.duplicate) {
        setApplyEventName(d.eventName || '');
        setApplyStatus('duplicate');
      } else if (d.ok) {
        setApplyEventName(d.eventName || '');
        if (d.eventDate) setComingDateLocal(d.eventDate);
        setApplyStatus('applied');
        setSelectedEventId('');
      } else {
        setApplyStatus('error');
      }
    } catch { setApplyStatus('error'); }
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
    const makeIcon = (name, selected, colorId) => makeMapPin(name, selected, G, colorId);

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

    const nearbyPts = pts.filter(isNearby);
    const bounds = new G.LatLngBounds();

    pts.forEach(truck => {
      if (isNearby(truck)) bounds.extend({ lat: truck.lat, lng: truck.lng });
      const m = new G.Marker({ position: { lat: truck.lat, lng: truck.lng }, map: mapInstanceRef.current, icon: makeIcon(truck.name, false, truck.pinColor), title: truck.name });
      m.addListener('click', () => {
        setSelectedTruck(prev => prev?.id === truck.id ? null : truck);
        markersRef.current.forEach(mk => {
          const sel = mk.getTitle() === truck.name;
          const t = pts.find(p => p.name === mk.getTitle());
          mk.setIcon(makeIcon(mk.getTitle(), sel, t?.pinColor));
          if (t?.photoUrl) upgradeMarkerWithPhoto(mk, t.photoUrl, t.name, sel, G, t?.pinColor);
        });
      });
      markersRef.current.push(m);
      if (truck.photoUrl) upgradeMarkerWithPhoto(m, truck.photoUrl, truck.name, false, G, truck.pinColor);
    });

    // Fit bounds only to nearby trucks so far-away ones don't zoom out the map
    if (nearbyPts.length === 1) { mapInstanceRef.current.setCenter({ lat: nearbyPts[0].lat, lng: nearbyPts[0].lng }); mapInstanceRef.current.setZoom(15); }
    else if (nearbyPts.length > 1) { mapInstanceRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 }); }
    else { mapInstanceRef.current.setCenter({ lat: GEO.centerLat, lng: GEO.centerLng }); mapInstanceRef.current.setZoom(12); }
  }, [mapReady, trucks]);

  // Scroll-to and highlight when landing from QR scan (?truck=slug, no token)
  useEffect(() => {
    if (!truckSlug || isCheckinMode || trucks === null) return;
    const el = truckCardRefs.current[truckSlug];
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'box-shadow 0.4s';
      el.style.boxShadow = `0 0 0 3px ${C.sunset}80`;
      setTimeout(() => { el.style.boxShadow = ''; }, 2400);
    }, 600);
  }, [trucks, truckSlug, isCheckinMode]);

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
          pinColor: checkinPinColor,
          departureTime: (() => {
            if (!checkinDeparture || checkinDeparture === 'after-dark') return checkinDeparture || '';
            const d = new Date(); d.setHours(parseInt(checkinDeparture), 0, 0, 0);
            return d.toISOString();
          })(),
        }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.ok) {
            setCheckinStatus("success");
            setCheckinMsg(`You're checked in! Customers can now see ${d.name} on the locator.`);
            saveLocation(checkinNote);
            celebrate();
          } else {
            setCheckinStatus("error");
            setCheckinMsg(d.error || yeti.oops());
          }
        })
        .catch(() => { setCheckinStatus("error"); setCheckinMsg(yeti.network()); });
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
    if ((now - new Date(truck.lastCheckin).getTime()) > 12 * 60 * 60 * 1000) return false;
    if (truck.departureTime) {
      const dept = new Date(truck.departureTime);
      if (!isNaN(dept.getTime())) return now < dept.getTime();
    }
    return true;
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
  const nearbyLiveTrucks = liveTrucks.filter(isNearby);
  const travelingLiveTrucks = liveTrucks.filter(t => !isNearby(t));
  const liveTrucksWithCoords = liveTrucks.filter(t => typeof t.lat === 'number' && typeof t.lng === 'number');
  const comingTrucks = (trucks || []).filter(t =>
    t.comingDate && new Date(t.comingDate) > new Date() && !isLive(t)
  );
  const allTrucks = trucks || [];

  // Popularity sort — by total love count (desc)
  const loveCount = (slug) => loves[slug]?.total || 0;
  const sortedLiveTrucks = [...nearbyLiveTrucks].sort((a, b) => loveCount(b.slug) - loveCount(a.slug));
  const sortedTravelingTrucks = [...travelingLiveTrucks].sort((a, b) => loveCount(b.slug) - loveCount(a.slug));
  const sortedAllTrucks = [...allTrucks].sort((a, b) => loveCount(b.slug) - loveCount(a.slug));
  const maxLoves = allTrucks.reduce((m, t) => Math.max(m, loveCount(t.slug)), 0);
  const isMostLoved = (slug) => maxLoves >= 3 && loveCount(slug) === maxLoves;

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
        ) : sortedItems.length === 0 ? (
          <button
            onClick={() => setLoveInput({ slug, text: '' })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 20,
              background: `${C.sunset}12`, border: `1.5px dashed ${C.sunset}40`,
              fontSize: 12, color: C.sunset, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif",
              transition: "all 0.18s",
            }}
          >
            ❤️ Love a dish
          </button>
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
      const url = 'https://manitou-beach.vercel.app/food-trucks';
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
      const text = `🚚 ${truckName} is serving${loc}!${special} Find us → https://manitou-beach.vercel.app/food-trucks`;
      navigator.clipboard.writeText(text).catch(() => {});
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    };

    const inputStyle = { width: "100%", boxSizing: "border-box", padding: "13px 14px", border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 16, fontFamily: "'Libre Franklin', sans-serif", color: C.text, background: C.warmWhite, outline: "none", marginBottom: 16 };
    const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: C.textMuted, marginBottom: 8 };

    return (
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes pinDrop {
          0%   { transform: translateY(-20px) scale(1.3); opacity: 0; }
          60%  { transform: translateY(4px) scale(0.95); opacity: 1; }
          80%  { transform: translateY(-4px) scale(1.05); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pinPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(122,142,114,0.5); }
          50%       { box-shadow: 0 0 0 10px rgba(122,142,114,0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        <div style={{ flex: 1, maxWidth: 480, width: "100%", margin: "0 auto", padding: "clamp(24px, 6vw, 48px) 24px 32px" }}>

          {/* Vendor Header — always visible */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ margin: "0 0 12px", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.sage, fontWeight: 600 }}>
              Manitou Beach · Food Truck Check-in
            </p>
            {checkinTruck?.photoUrl ? (
              <img src={checkinTruck.photoUrl} alt={truckName} style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover", border: `2px solid ${C.sand}`, margin: "0 auto 12px", display: "block" }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 14, background: `${C.sage}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><img src="/images/icons/food-truck-icon-dark.png" alt="" style={{ width: 56, height: 56, objectFit: "contain" }} /></div>
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
                      ⏱ Open until {checkinDeparture === 'after-dark' ? 'after dark' : (() => { const d = new Date(); d.setHours(parseInt(checkinDeparture), 0, 0, 0); return isNaN(d.getTime()) ? checkinDeparture : d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }); })()}
                    </div>
                  )}
                  {checkinTruck?.description && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{checkinTruck.description}</p>}
                </div>
              </div>

              {/* Change Pin Color on the fly */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, fontWeight: 600, display: "block", marginBottom: 8 }}>
                  Change your pin color
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {PIN_PRESETS.map(hex => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        setCheckinPinColor(hex);
                        fetch("/api/food-trucks", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ slug: truckSlug, token: truckToken, pinColor: hex, action: 'update-pin-color' }),
                        }).catch(() => {});
                      }}
                      style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: hex,
                        border: checkinPinColor === hex ? `3px solid ${C.text}` : `2px solid transparent`,
                        cursor: "pointer",
                        boxShadow: checkinPinColor === hex ? `0 0 0 2px #FFFFFF, 0 0 6px ${hex}66` : 'none',
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                  <label style={{ position: "relative", width: 26, height: 26, cursor: "pointer" }}>
                    <input
                      type="color"
                      value={checkinPinColor}
                      onChange={e => {
                        const hex = e.target.value;
                        setCheckinPinColor(hex);
                        fetch("/api/food-trucks", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ slug: truckSlug, token: truckToken, pinColor: hex, action: 'update-pin-color' }),
                        }).catch(() => {});
                      }}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    />
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`,
                      border: !PIN_PRESETS.includes(checkinPinColor) ? `3px solid ${C.text}` : `2px solid ${C.sand}`,
                      boxShadow: !PIN_PRESETS.includes(checkinPinColor) ? `0 0 0 2px #FFFFFF, 0 0 6px ${checkinPinColor}66` : 'none',
                    }} />
                  </label>
                </div>
              </div>

              {/* Map Preview */}
              {checkinLat && checkinLng && mapsKey && (
                <div style={{ marginBottom: 20, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.sand}` }}>
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${checkinLat},${checkinLng}&zoom=15&size=480x200&scale=2&markers=color:0x${checkinPinColor.slice(1)}|${checkinLat},${checkinLng}&key=${mapsKey}`}
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

                <button
                  onClick={() => {
                    if (!window.confirm("Pack up for the day? Your pin will be removed from the map.")) return;
                    fetch("/api/food-trucks", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ slug: truckSlug, token: truckToken, action: "checkout" }),
                    })
                      .then(r => r.json())
                      .then(d => {
                        if (d.ok) {
                          setCheckinStatus("success");
                          setCheckinMsg("You're all packed up! Your pin has been removed from the map. See you next time! 👋");
                        }
                      })
                      .catch(() => {});
                  }}
                  style={{
                    width: "100%", padding: "13px", marginTop: 8,
                    background: "transparent", color: C.sunset,
                    border: `1.5px solid ${C.sunset}44`, borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Libre Franklin', sans-serif", transition: "all 0.2s",
                  }}
                >
                  Pack Up &amp; Go — I'm Done for Today
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
              <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", margin: "0 0 24px", lineHeight: 1.5 }}>
                Three quick steps and you're live on the map.
              </p>

              {/* ═══ STEP 1 — Drop Your Pin ═══ */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: pinStatus === 'pinned' ? C.sage : C.lakeBlue,
                    color: '#fff', fontSize: 14, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Libre Franklin', sans-serif",
                  }}>{pinStatus === 'pinned' ? '✓' : '1'}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Drop your pin</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>
                      {pinStatus === 'pinned' ? 'Got it! Your location is on the map.' : 'Tap the button so customers can find you.'}
                    </div>
                  </div>
                </div>

                {pinStatus !== 'pinned' ? (
                  <button
                    onClick={handleDropPin}
                    disabled={pinStatus === 'loading'}
                    style={{
                      width: '100%', padding: '16px 14px',
                      background: pinStatus === 'loading' ? C.sand
                        : pinStatus === 'denied' ? `${C.driftwood}` : C.lakeBlue,
                      border: 'none',
                      borderRadius: 12, fontSize: 16, fontWeight: 700,
                      color: pinStatus === 'loading' ? C.textMuted : C.cream,
                      cursor: pinStatus === 'loading' ? 'default' : 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif",
                      letterSpacing: 0.5,
                      transition: 'all 0.2s',
                      boxShadow: pinStatus === 'loading' || pinStatus === 'denied'
                        ? 'none' : '0 4px 18px rgba(91,126,149,0.35)',
                    }}
                  >
                    {pinStatus === 'loading' ? '⏳  Getting your location…' :
                     pinStatus === 'denied' ? '📍  Location denied — type your spot below' :
                     '📍  Tap Here to Drop My Pin'}
                  </button>
                ) : (
                  <div style={{ animation: 'fadeSlideUp 0.35s ease' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: `${C.sage}12`, border: `1.5px solid ${C.sage}50`,
                      borderRadius: 12, padding: '12px 16px', marginBottom: 10,
                      animation: 'pinPulse 1.5s ease 1',
                    }}>
                      <span style={{ fontSize: 28, lineHeight: 1, animation: 'pinDrop 0.55s cubic-bezier(.36,.07,.19,.97) both' }}>
                        📍
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.sage }}>Your spot is locked in!</div>
                      </div>
                      <button
                        onClick={handleDropPin}
                        style={{ fontSize: 12, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'underline', padding: 0, flexShrink: 0 }}
                      >
                        Re-drop
                      </button>
                    </div>
                    {mapsKey && (
                      <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.sage}30`, animation: 'fadeSlideUp 0.4s ease 0.15s both' }}>
                        <img
                          src={`https://maps.googleapis.com/maps/api/staticmap?center=${checkinLat},${checkinLng}&zoom=15&size=480x160&scale=2&markers=color:0x${checkinPinColor.slice(1)}|${checkinLat},${checkinLng}&key=${mapsKey}`}
                          alt="Your pinned location"
                          style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ═══ STEP 2 — Add the Details ═══ */}
              <div style={{ marginBottom: 24, opacity: pinStatus === 'pinned' || pinStatus === 'denied' ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: C.sand, color: C.text, fontSize: 14, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Libre Franklin', sans-serif",
                  }}>2</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Add the details</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>All optional — fill in what you want customers to see.</div>
                  </div>
                </div>

                <label style={labelStyle}>
                  {pinStatus === 'pinned' ? 'Describe your spot' : 'Where are you today?'}{' '}
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </label>

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
                  placeholder={savedLocations.length > 0 ? "Or type a new location…" : "e.g. Near the boat launch, by the park pavilion…"}
                  style={inputStyle}
                />

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
                  Your Map Pin Color <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(pick one so you stand out)</span>
                </label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
                  {PIN_PRESETS.map(hex => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setCheckinPinColor(hex)}
                      style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: hex,
                        border: checkinPinColor === hex ? `3px solid ${C.text}` : `2px solid transparent`,
                        cursor: "pointer",
                        boxShadow: checkinPinColor === hex ? `0 0 0 2px #FFFFFF, 0 0 8px ${hex}66` : 'none',
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                  <label style={{ position: "relative", width: 30, height: 30, cursor: "pointer" }}>
                    <input
                      type="color"
                      value={checkinPinColor}
                      onChange={e => setCheckinPinColor(e.target.value)}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                    />
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`,
                      border: !PIN_PRESETS.includes(checkinPinColor) ? `3px solid ${C.text}` : `2px solid ${C.sand}`,
                      boxShadow: !PIN_PRESETS.includes(checkinPinColor) ? `0 0 0 2px #FFFFFF, 0 0 8px ${checkinPinColor}66` : 'none',
                    }} />
                  </label>
                </div>

                <label style={labelStyle}>
                  Leaving around… <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </label>
                <select
                  value={checkinDeparture}
                  onChange={e => setCheckinDeparture(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0, appearance: 'none', backgroundImage: 'none' }}
                >
                  <option value="">— not sure</option>
                  {['10','11','12','13','14','15','16','17','18','19','20','21','22'].map(h => {
                    const d = new Date(); d.setHours(parseInt(h), 0, 0, 0);
                    return <option key={h} value={h}>{d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</option>;
                  })}
                  <option value="after-dark">After dark</option>
                </select>
              </div>

              {/* ═══ STEP 3 — Go Live ═══ */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: C.sage, color: '#fff', fontSize: 14, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Libre Franklin', sans-serif",
                  }}>3</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Go live!</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>Hit the button and you're on the map. That's it.</div>
                  </div>
                </div>

                {checkinStatus === "error" && (
                  <div style={{ marginBottom: 12, fontSize: 13, color: "#c05a5a", fontWeight: 500 }}>{checkinMsg}</div>
                )}
                <button
                  onClick={handleCheckin}
                  disabled={checkinStatus === "loading"}
                  style={{
                    width: "100%", padding: "16px",
                    background: checkinStatus === "loading" ? C.sand : C.sage,
                    color: C.cream, border: "none", borderRadius: 12,
                    fontSize: 17, fontWeight: 700,
                    cursor: checkinStatus === "loading" ? "default" : "pointer",
                    transition: "background 0.2s",
                    fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5,
                    boxShadow: checkinStatus === "loading" ? 'none' : `0 4px 18px ${C.sage}55`,
                  }}
                >
                  {checkinStatus === "loading" ? "Checking in…" : "Go Live — I'm Open for Business!"}
                </button>
              </div>
            </div>
          )}

          {/* ── COMING RUNS — self-serve schedule (always visible once truck loads) ── */}
          {trucks !== null && checkinTruck && (
            <div style={{ marginTop: 24 }}>
              <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.sand}`, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: "0 0 4px" }}>
                  📅 Coming Runs
                </h3>
                <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 16px", lineHeight: 1.5 }}>
                  Let customers know when you're planning a run before you arrive — they'll see it on the locator.
                </p>

                {/* Apply to an event */}
                {vendorEvents.length > 0 && (
                  <div style={{ marginBottom: 16, padding: "14px 16px", background: `${C.sunset}08`, border: `1px solid ${C.sunset}25`, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunset, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>
                      Join an Upcoming Event
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <select
                        value={selectedEventId}
                        onChange={e => { setSelectedEventId(e.target.value); setApplyStatus(''); }}
                        style={{ flex: 1, padding: "11px 12px", border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", color: C.text, background: "#fff", outline: "none", appearance: "none" }}
                      >
                        <option value="">Pick your next event…</option>
                        {vendorEvents.map(ev => (
                          <option key={ev.id} value={ev.id}>
                            {ev.name}{ev.date ? ` — ${new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleEventApply}
                        disabled={!selectedEventId || applyStatus === 'loading'}
                        style={{
                          padding: "11px 16px", borderRadius: 8, whiteSpace: "nowrap",
                          background: !selectedEventId || applyStatus === 'loading' ? C.sand : C.sunset,
                          color: C.cream, border: "none", fontSize: 13, fontWeight: 700,
                          cursor: !selectedEventId || applyStatus === 'loading' ? "default" : "pointer",
                          fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.2s",
                        }}
                      >
                        {applyStatus === 'loading' ? '…' : 'Apply'}
                      </button>
                    </div>
                    {applyStatus === 'applied' && <p style={{ fontSize: 12, color: C.sage, fontWeight: 600, margin: "8px 0 0", wordBreak: "break-word" }}>You're on the lineup for {applyEventName}! The organizer will be in touch with details.</p>}
                    {applyStatus === 'duplicate' && <p style={{ fontSize: 12, color: C.lakeBlue, margin: "8px 0 0", wordBreak: "break-word" }}>You're already on the list for {applyEventName} — you're all set!</p>}
                    {applyStatus === 'error' && <p style={{ fontSize: 12, color: "#c05a5a", margin: "8px 0 0" }}>{yeti.oops()}</p>}
                  </div>
                )}

                {comingDateLocal && new Date(comingDateLocal) > new Date() && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `${C.lakeBlue}10`, border: `1px solid ${C.lakeBlue}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: C.lakeBlue, fontWeight: 600 }}>
                      📅 {formatComingDate(comingDateLocal)} — showing on the locator
                    </span>
                    <button
                      onClick={handleClearSchedule}
                      disabled={scheduleStatus === 'loading'}
                      style={{ fontSize: 12, color: C.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", padding: 0, textDecoration: "underline" }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input
                    type="date"
                    min={tomorrowStr}
                    value={scheduleDate}
                    onChange={e => { setScheduleDate(e.target.value); setScheduleStatus(''); }}
                    style={{ flex: 1, padding: "13px 12px", border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 16, fontFamily: "'Libre Franklin', sans-serif", color: C.text, background: C.warmWhite, outline: "none" }}
                  />
                  <button
                    onClick={handleSchedule}
                    disabled={!scheduleDate || scheduleStatus === 'loading'}
                    style={{
                      padding: "13px 18px", borderRadius: 8, whiteSpace: "nowrap",
                      background: !scheduleDate || scheduleStatus === 'loading' ? C.sand : C.lakeBlue,
                      color: C.cream, border: "none", fontSize: 13, fontWeight: 700,
                      cursor: !scheduleDate || scheduleStatus === 'loading' ? "default" : "pointer",
                      fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.2s",
                    }}
                  >
                    {scheduleStatus === 'loading' ? '…' : 'Set Date'}
                  </button>
                </div>
                <input
                  type="text"
                  value={scheduleNote}
                  onChange={e => { setScheduleNote(e.target.value); setScheduleStatus(''); }}
                  placeholder="Where / what event? e.g. Summer Festival, Beer Tent, Boat Launch…"
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 12px", border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 16, fontFamily: "'Libre Franklin', sans-serif", color: C.text, background: C.warmWhite, outline: "none" }}
                />

                {scheduleStatus === 'saved' && <p style={{ fontSize: 12, color: C.sage, fontWeight: 600, margin: "10px 0 0" }}>✓ Saved! Customers will see this on the locator.</p>}
                {scheduleStatus === 'cleared' && <p style={{ fontSize: 12, color: C.textMuted, margin: "10px 0 0" }}>Coming date cleared.</p>}
                {scheduleStatus === 'error' && <p style={{ fontSize: 12, color: "#c05a5a", margin: "10px 0 0" }}>{yeti.oops()}</p>}
              </div>
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
            <div style={{ marginBottom: 16 }}><img src="/images/icons/food-truck-icon.png" alt="" style={{ width: 140, height: 140, objectFit: "contain" }} /></div>
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
                          <span style={{ fontSize: 12, color: C.textMuted }}>⏱ Until {formatDeparture(selectedTruck.departureTime)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedTruck(null); const G = window.google.maps; const pts2 = (trucks || []).filter(t => isLive(t) && typeof t.lat === 'number'); markersRef.current.forEach(m => { const t = pts2.find(p => p.name === m.getTitle()); m.setIcon(makeMapPin(m.getTitle(), false, G, t?.pinColor)); if (t?.photoUrl) upgradeMarkerWithPhoto(m, t.photoUrl, t.name, false, G, t?.pinColor); }); }}
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
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: nearbyLiveTrucks.length > 0 ? C.sage : C.sand, flexShrink: 0 }} />
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: C.text, margin: 0 }}>
                {nearbyLiveTrucks.length > 0 ? "Open Right Now" : liveTrucks.length > 0 ? "No nearby trucks right now" : "No trucks checked in today"}
              </h2>
            </div>
          </FadeIn>
          {trucks === null ? (
            <div style={{ textAlign: "center", padding: "48px", color: C.textMuted, fontSize: 14 }}>Loading trucks…</div>
          ) : nearbyLiveTrucks.length === 0 && travelingLiveTrucks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}` }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🌤️</div>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
                No food trucks are checked in right now. Check back later — they update throughout the day.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {sortedLiveTrucks.map((truck, i) => (
                <FadeIn key={truck.id} delay={i * 60}>
                  <div
                    ref={el => { if (truck.slug) truckCardRefs.current[truck.slug] = el; }}
                    style={{ background: "#FFFFFF", borderRadius: 18, border: `1px solid ${C.sand}`, overflow: "hidden", height: "100%", boxShadow: `0 4px 20px rgba(0,0,0,0.08)` }}
                  >
                    {/* Hero header — logo IS the brand */}
                    <div style={{ background: `linear-gradient(160deg, ${C.cream} 0%, ${C.sand}55 100%)`, padding: "28px 22px 18px", textAlign: "center", position: "relative" }}>
                      {/* Live badge — top right */}
                      <div style={{ position: "absolute", top: 14, right: 16, display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.sage, boxShadow: `0 0 6px ${C.sage}88` }} />
                        <span style={{ fontSize: 11, color: C.sage, fontWeight: 700, letterSpacing: 0.3 }}>{timeAgo(truck.lastCheckin)}</span>
                      </div>
                      {/* Most Loved badge — top left */}
                      {isMostLoved(truck.slug) && (
                        <div style={{ position: "absolute", top: 14, left: 16 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.sunset, background: `${C.sunset}15`, border: `1px solid ${C.sunset}30`, padding: "3px 9px", borderRadius: 10, letterSpacing: 0.5 }}>Most Loved ❤️</span>
                        </div>
                      )}
                      {/* Logo — big and proud, this is their identity */}
                      {truck.photoUrl ? (
                        <div style={{ width: 160, height: 160, borderRadius: 24, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", overflow: "hidden", boxShadow: `0 4px 20px ${C.driftwood}30`, border: `3px solid #FFFFFF` }}>
                          <img src={truck.photoUrl} alt={truck.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                        </div>
                      ) : (
                        <div style={{ width: 160, height: 160, borderRadius: 24, background: `${C.sage}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: `3px solid ${C.sage}20` }}>
                          <img src="/images/icons/food-truck-icon-dark.png" alt="" style={{ width: 96, height: 96, objectFit: "contain" }} />
                        </div>
                      )}
                      {/* Name */}
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: "0 0 6px", lineHeight: 1.3 }}>{truck.name}</h3>
                      {/* Meta line — cuisine + location on one line */}
                      <div style={{ fontSize: 13, color: C.textLight, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                        {truck.cuisine && <span>{truck.cuisine}</span>}
                        {truck.cuisine && truck.locationNote && <span style={{ color: C.driftwood }}>·</span>}
                        {truck.locationNote && <span style={{ fontWeight: 500 }}>📍 {truck.locationNote}</span>}
                      </div>
                      {/* Love count */}
                      {loveCount(truck.slug) > 0 && (
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>❤️ {loveCount(truck.slug)} love{loveCount(truck.slug) !== 1 ? 's' : ''}</div>
                      )}
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "16px 22px 20px" }}>
                      {/* Today's Special — prominent callout */}
                      {truck.todaysSpecial && (
                        <div style={{ background: `linear-gradient(135deg, ${C.sunset}18 0%, ${C.sunset}08 100%)`, border: `1.5px solid ${C.sunset}30`, borderRadius: 12, padding: "11px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18, lineHeight: 1 }}>⭐</span>
                          <span style={{ fontSize: 14, color: C.sunset, fontWeight: 600, lineHeight: 1.4 }}>{truck.todaysSpecial}</span>
                        </div>
                      )}
                      {/* Departure time */}
                      {truck.departureTime && (
                        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12, textAlign: "center" }}>
                          ⏱ Open until {formatDeparture(truck.departureTime)}
                        </div>
                      )}
                      {truck.description && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "0 0 12px", textAlign: "center" }}>{truck.description}</p>}
                      {/* Love Pills */}
                      {truck.slug && <LovePills slug={truck.slug} />}
                      {/* Action toolbar */}
                      <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 14, borderTop: `1.5px solid ${C.sand}`, paddingTop: 14 }}>
                        {truck.phone && (
                          <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, background: `${C.lakeBlue}15`, padding: "6px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${C.lakeBlue}30` }}>
                            📱 Call
                          </a>
                        )}
                        {truck.lat && truck.lng && (
                          <a href={`https://www.google.com/maps?q=${truck.lat},${truck.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, background: `${C.lakeBlue}15`, padding: "6px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${C.lakeBlue}30` }}>
                            🗺️ Directions
                          </a>
                        )}
                        {truck.website && (
                          <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, background: `${C.lakeBlue}15`, padding: "6px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${C.lakeBlue}30` }}>
                            Website →
                          </a>
                        )}
                        <button
                          onClick={() => shareTruck(truck)}
                          style={{ fontSize: 12, color: sharedId === truck.id ? C.sage : C.sunset, background: sharedId === truck.id ? `${C.sage}10` : `${C.sunset}10`, border: `1px solid ${sharedId === truck.id ? C.sage : C.sunset}20`, padding: "6px 14px", borderRadius: 20, fontWeight: 700, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}
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

          {/* Also Serving Today — live trucks outside the map radius */}
          {sortedTravelingTrucks.length > 0 && (
            <>
              <FadeIn>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 48, marginBottom: 20 }}>
                  <span style={{ fontSize: 18 }}>🛣️</span>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 400, color: C.text, margin: 0 }}>
                    Also Serving Today
                  </h3>
                  <span style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>farther out</span>
                </div>
              </FadeIn>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
                {sortedTravelingTrucks.map((truck, i) => {
                  const dist = typeof truck.lat === 'number' && typeof truck.lng === 'number'
                    ? Math.round(milesFrom(GEO.centerLat, GEO.centerLng, truck.lat, truck.lng))
                    : null;
                  return (
                    <FadeIn key={truck.id} delay={i * 60}>
                      <div
                        ref={el => { if (truck.slug) truckCardRefs.current[truck.slug] = el; }}
                        style={{ background: "#FFFFFF", borderRadius: 18, border: `1px solid ${C.sand}`, overflow: "hidden", height: "100%", boxShadow: `0 4px 20px rgba(0,0,0,0.06)`, opacity: 0.8 }}
                      >
                        {/* Hero header */}
                        <div style={{ background: `linear-gradient(160deg, ${C.cream} 0%, ${C.sand}44 100%)`, padding: "24px 22px 18px", textAlign: "center", position: "relative" }}>
                          <div style={{ position: "absolute", top: 14, right: 16, display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.driftwood }} />
                            <span style={{ fontSize: 11, color: C.driftwood, fontWeight: 600 }}>{timeAgo(truck.lastCheckin)}</span>
                          </div>
                          {truck.photoUrl ? (
                            <div style={{ width: 140, height: 140, borderRadius: 22, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", overflow: "hidden", boxShadow: `0 3px 14px ${C.driftwood}20`, border: `3px solid #FFFFFF` }}>
                              <img src={truck.photoUrl} alt={truck.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />
                            </div>
                          ) : (
                            <div style={{ width: 140, height: 140, borderRadius: 22, background: `${C.driftwood}10`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", border: `3px solid ${C.driftwood}18` }}>
                              <img src="/images/icons/food-truck-icon-dark.png" alt="" style={{ width: 80, height: 80, objectFit: "contain" }} />
                            </div>
                          )}
                          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text, margin: "0 0 6px" }}>{truck.name}</h3>
                          <div style={{ fontSize: 13, color: C.textLight, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
                            {truck.cuisine && <span>{truck.cuisine}</span>}
                            {truck.cuisine && truck.locationNote && <span style={{ color: C.driftwood }}>·</span>}
                            {truck.locationNote && <span style={{ fontWeight: 500 }}>📍 {truck.locationNote}</span>}
                          </div>
                          {dist && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>~{dist} mi away</div>}
                        </div>
                        <div style={{ padding: "14px 22px 18px" }}>
                          {truck.todaysSpecial && (
                            <div style={{ background: `linear-gradient(135deg, ${C.sunset}18 0%, ${C.sunset}08 100%)`, border: `1.5px solid ${C.sunset}30`, borderRadius: 12, padding: "11px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 18, lineHeight: 1 }}>⭐</span>
                              <span style={{ fontSize: 14, color: C.sunset, fontWeight: 600 }}>{truck.todaysSpecial}</span>
                            </div>
                          )}
                          {truck.description && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "0 0 12px", textAlign: "center" }}>{truck.description}</p>}
                          {truck.slug && <LovePills slug={truck.slug} />}
                          <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 14, borderTop: `1.5px solid ${C.sand}`, paddingTop: 14 }}>
                            {truck.lat && truck.lng && (
                              <a href={`https://www.google.com/maps?q=${truck.lat},${truck.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, background: `${C.lakeBlue}15`, padding: "6px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${C.lakeBlue}30` }}>
                                🗺️ Directions
                              </a>
                            )}
                            {truck.phone && (
                              <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, background: `${C.lakeBlue}15`, padding: "6px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${C.lakeBlue}30` }}>
                                📱 Call
                              </a>
                            )}
                            <button
                              onClick={() => shareTruck(truck)}
                              style={{ fontSize: 12, color: sharedId === truck.id ? C.sage : C.sunset, background: sharedId === truck.id ? `${C.sage}10` : `${C.sunset}10`, border: `1px solid ${sharedId === truck.id ? C.sage : C.sunset}20`, padding: "6px 14px", borderRadius: 20, fontWeight: 700, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}
                            >
                              {sharedId === truck.id ? '✓ Copied' : '↗ Tell a friend'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Love CTA — encourage engagement */}
      {liveTrucks.length > 0 && (
        <div style={{ background: C.warmWhite, padding: "0 24px 32px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", background: `linear-gradient(135deg, ${C.sunset}08 0%, ${C.cream} 100%)`, border: `1px solid ${C.sunset}20`, borderRadius: 16, padding: "22px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>❤️</div>
            <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: "0 0 4px", fontWeight: 500 }}>
              Show some love to your favorites
            </p>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>
              Drop a heart and tell them what you had. The more love a truck gets, the higher they climb on the list.
            </p>
          </div>
        </div>
      )}

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
                    <div style={{ width: 52, height: 52, borderRadius: 10, background: `${C.lakeBlue}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><img src="/images/icons/food-truck-icon-dark.png" alt="" style={{ width: 40, height: 40, objectFit: "contain" }} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.text }}>{truck.name}</div>
                      {truck.cuisine && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{truck.cuisine}</div>}
                      <div style={{ fontSize: 12, color: C.lakeBlue, fontWeight: 600, marginTop: 4 }}>{formatComingDate(truck.comingDate)}</div>
                      {truck.comingEventName && (
                        <a href="/happening" style={{ fontSize: 11, color: C.sunset, fontWeight: 600, marginTop: 2, display: "block", textDecoration: "none", lineHeight: 1.4 }}>
                          {truck.comingEventName}
                        </a>
                      )}
                      {truck.scheduleNote && !truck.comingEventName && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{truck.scheduleNote}</div>}
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
                <SectionTitle>Sorted by Most Loved</SectionTitle>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {sortedAllTrucks.map((truck, i) => {
                const live = isLive(truck);
                return (
                  <FadeIn key={truck.id} delay={i * 40}>
                    <div
                      ref={el => { if (truck.slug) truckCardRefs.current[truck.slug] = el; }}
                      style={{ background: "#FFFFFF", borderRadius: 18, border: `1px solid ${C.sand}`, overflow: "hidden", boxShadow: `0 4px 16px rgba(0,0,0,0.07)` }}
                    >
                      {/* Hero header */}
                      <div style={{ background: `linear-gradient(160deg, ${C.cream} 0%, ${C.sand}33 100%)`, padding: "24px 20px 16px", textAlign: "center", position: "relative" }}>
                        {/* Badges — top corners */}
                        {live && (
                          <div style={{ position: "absolute", top: 12, left: 14 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C.sage, background: `${C.sage}15`, padding: "3px 9px", borderRadius: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Open</span>
                          </div>
                        )}
                        {truck.tier === 'featured' && (
                          <div style={{ position: "absolute", top: 12, right: 14 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.sunset, background: `${C.sunset}12`, border: `1px solid ${C.sunset}25`, borderRadius: 8, padding: "3px 8px" }}>Featured</span>
                          </div>
                        )}
                        {/* Logo */}
                        {truck.photoUrl ? (
                          <div style={{ width: 120, height: 120, borderRadius: 20, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", overflow: "hidden", boxShadow: `0 3px 14px ${C.driftwood}22`, border: `2px solid #FFFFFF` }}>
                            <img src={truck.photoUrl} alt={truck.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 5 }} />
                          </div>
                        ) : (
                          <div style={{ width: 120, height: 120, borderRadius: 20, background: live ? `${C.sage}10` : `${C.sand}66`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                            <img src="/images/icons/food-truck-icon-dark.png" alt="" style={{ width: 72, height: 72, objectFit: "contain" }} />
                          </div>
                        )}
                        {/* Name + badges */}
                        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.text, margin: "0 0 4px" }}>{truck.name}</h3>
                        {truck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 2 }}>{truck.cuisine}</div>}
                        {isMostLoved(truck.slug) && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: C.sunset, background: `${C.sunset}15`, border: `1px solid ${C.sunset}30`, padding: "2px 8px", borderRadius: 10, letterSpacing: 0.5 }}>Most Loved ❤️</span>
                        )}
                        {loveCount(truck.slug) > 0 && !isMostLoved(truck.slug) && (
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>❤️ {loveCount(truck.slug)} love{loveCount(truck.slug) !== 1 ? 's' : ''}</div>
                        )}
                      </div>
                      {/* Card body */}
                      <div style={{ padding: "14px 20px 18px", textAlign: "center" }}>
                        {truck.scheduleNote && (
                          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, lineHeight: 1.5 }}>📅 {truck.scheduleNote}</div>
                        )}
                        {truck.slug && <LovePills slug={truck.slug} />}
                        {/* Actions */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 12, borderTop: `1px solid ${C.sand}`, paddingTop: 12 }}>
                          {truck.phone && (
                            <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, background: `${C.lakeBlue}15`, padding: "6px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, border: `1.5px solid ${C.lakeBlue}30` }}>
                              📱 {truck.phone}
                            </a>
                          )}
                          {truck.tier === 'featured' && truck.website && (
                            <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.sunset, textDecoration: "none", fontWeight: 600, background: `${C.sunset}10`, padding: "6px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${C.sunset}20` }}>
                              Menu / Info →
                            </a>
                          )}
                        </div>
                      </div>
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
            <div style={{ marginBottom: 16 }}><img src="/images/icons/food-truck-icon.png" alt="" style={{ width: 120, height: 120, objectFit: "contain" }} /></div>
            <SectionLabel light>Are You a Food Truck?</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 400, color: C.cream, margin: "16px 0 16px" }}>
              Get on the Map — $9/month
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 16 }}>
              Live map pin, personal check-in URL, Today's Special badge, and your name in front of hundreds of Manitou Beach followers.
            </p>
            <div style={{ background: "rgba(212,132,90,0.12)", border: "1px solid rgba(212,132,90,0.25)", borderRadius: 14, padding: "16px 20px", marginBottom: 28, textAlign: "center" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight, marginBottom: 4 }}>Magic Moment</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>
                A customer walks up and says "I saw you on the map and came straight here." That's the moment your truck becomes a destination.
              </p>
            </div>
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
      <PageSponsorBanner pageName="food-trucks" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
