import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, WaveDivider, PageSponsorBanner, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, PromoBanner } from '../components/Layout';
import { C } from '../data/config';
import { DISCOVER_MAP_STYLES } from '../data/discover';
import yeti from '../data/errorMessages';
import SEOHead from '../components/SEOHead';

const STAY_TYPES = ['All', 'Cottage', 'Airbnb', 'Tiny Home', 'Camping', 'Glamping', 'Inn/B&B', 'Hotel', 'Spare Room'];

const TYPE_COLORS = {
  'Cottage':  C.lakeBlue,
  'Airbnb':   C.sunset,
  'Tiny Home': C.sage,
  'Camping':  '#7A8E72',
  'Inn/B&B':  '#8B5E3C',
  'Glamping':  '#9B8856',
  'Hotel':    '#6B5B8D',
  'Spare Room': '#A0856E',
};

const AMENITY_ICONS = {
  Waterfront: '🌊', 'Pet Friendly': '🐾', WiFi: '📶', AC: '❄️',
  'Fire Pit': '🔥', Dock: '⚓', 'Boat Launch': '🚤', Kitchen: '🍳', Grill: '♨️',
  'Non-Smoking': '🚭', Parking: '🅿️',
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
  const scrollToList = () => {
    document.getElementById('list-property')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section style={{
      background: `linear-gradient(160deg, ${C.dusk} 0%, ${C.night} 50%, ${C.dusk} 100%)`,
      padding: '160px 24px 110px',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 45%, rgba(91,126,149,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <FadeIn>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <SectionLabel light>Manitou Beach · Stays & Rentals</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(30px, 5vw, 56px)', fontWeight: 400, color: C.cream, margin: '20px 0 24px', lineHeight: 1.15 }}>
            Your property. On the map.<br /><em>Where lake visitors are already looking.</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto 12px', lineHeight: 1.85 }}>
            Cottages, cabins, Airbnbs, and camping - all in one place. Visitors browse the map, see your photos, and click through to book on your site. We're not a booking platform - we just send guests your way.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.7, fontStyle: 'italic' }}>
            Your Airbnb link, your VRBO page, your own website - wherever you take bookings, that's where we send them.
          </p>
          <div style={{ display: 'inline-block', background: 'rgba(91,126,149,0.15)', border: '1px solid rgba(91,126,149,0.3)', borderRadius: 12, padding: '12px 24px', marginBottom: 28 }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight }}>Summer Launch - list free through July 4th</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Btn onClick={scrollToList} variant="sunset" style={{ whiteSpace: 'nowrap' }}>
              Get on the Map - Free Through July 4 →
            </Btn>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>← Back to Home</a>
              <ShareBar />
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

// ── Booking Drawer (Request to Book / Waitlist) ─────────────
function GuestCalendar({ stay, onClose }) {
  const pageId = stay.id?.replace('stay-', '');
  const isFeatured = stay.tier === 'featured';
  const accent = TYPE_COLORS[stay.stayType] || C.lakeBlue;

  const [blocked, setBlocked] = React.useState(null); // null = loading
  const [checkIn, setCheckIn]   = React.useState(null); // 'YYYY-MM-DD'
  const [checkOut, setCheckOut] = React.useState(null);
  const [hovered, setHovered]   = React.useState(null);
  const [pickStep, setPickStep] = React.useState('in'); // 'in' | 'out' | 'done'
  const [viewMonth, setViewMonth] = React.useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [form, setForm]         = React.useState({ name: '', phone: '', message: '' });
  const [reqStatus, setReqStatus]   = React.useState(null);
  const [waitStatus, setWaitStatus] = React.useState(null);

  React.useEffect(() => {
    if (!pageId) { setBlocked([]); return; }
    fetch(`/api/stay-availability?pageId=${pageId}`)
      .then(r => r.json())
      .then(d => setBlocked(d.blocked || []))
      .catch(() => setBlocked([]));
  }, [pageId]);

  const todayStr = new Date().toISOString().split('T')[0];
  const isDateBlocked = ds => blocked?.some(r => ds >= r.from && ds <= r.to) ?? false;
  const rangeHasBlock = (from, to) => {
    if (!blocked?.length || !from || !to) return false;
    const [a, b] = from <= to ? [from, to] : [to, from];
    return blocked.some(r => r.to >= a && r.from <= b);
  };

  const previewOut = pickStep === 'out' && hovered ? hovered : checkOut;
  const isInRange = ds => {
    if (!checkIn) return false;
    const hi = previewOut;
    if (!hi) return ds === checkIn;
    const [a, b] = checkIn <= hi ? [checkIn, hi] : [hi, checkIn];
    return ds >= a && ds <= b;
  };

  const handleDay = ds => {
    if (ds < todayStr || isDateBlocked(ds)) return;
    if (pickStep === 'in' || (checkIn && ds <= checkIn)) {
      setCheckIn(ds); setCheckOut(null); setPickStep('out');
      setReqStatus(null); setWaitStatus(null);
    } else {
      setCheckOut(ds); setPickStep('done');
    }
  };

  const isAvailable = !!(checkIn && checkOut && !rangeHasBlock(checkIn, checkOut));
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const fmtDate = ds => {
    if (!ds) return '';
    return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const submitRequest = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setReqStatus('error'); return; }
    setReqStatus('loading');
    try {
      const res = await fetch('/api/stay-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, stayName: stay.name, guestName: form.name, guestPhone: form.phone, datesRequested: `${checkIn} to ${checkOut}`, message: form.message }),
      });
      const d = await res.json();
      setReqStatus(d.ok ? 'done' : 'error');
    } catch { setReqStatus('error'); }
  };

  const joinWaitlist = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setWaitStatus('error'); return; }
    setWaitStatus('loading');
    try {
      const res = await fetch('/api/stay-waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, stayName: stay.name, guestName: form.name, guestPhone: form.phone, datesRequested: `${checkIn} to ${checkOut}` }),
      });
      const d = await res.json();
      setWaitStatus(d.ok ? 'done' : 'error');
    } catch { setWaitStatus('error'); }
  };

  const nextM = viewMonth.month === 11 ? { year: viewMonth.year + 1, month: 0 } : { year: viewMonth.year, month: viewMonth.month + 1 };
  const navBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted, padding: '2px 10px', borderRadius: 6, lineHeight: 1 };
  const inp = { width: '100%', padding: '10px 13px', borderRadius: 8, border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.12)' : C.sand}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, background: isFeatured ? 'rgba(255,255,255,0.05)' : '#fff', color: isFeatured ? C.cream : C.text, outline: 'none', boxSizing: 'border-box' };

  const renderMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const label = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= lastDate; d++) {
      cells.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return (
      <div key={`${year}-${month}`} style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif", color: isFeatured ? 'rgba(255,255,255,0.45)' : C.textMuted }}>{label}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d, i) => (
            <div key={i} style={{ fontSize: 9, textAlign: 'center', padding: '3px 0', fontFamily: "'Libre Franklin', sans-serif", color: isFeatured ? 'rgba(255,255,255,0.25)' : C.textMuted }}>{d}</div>
          ))}
          {cells.map((ds, ci) => {
            if (!ds) return <div key={`e${ci}`} />;
            const isPast = ds < todayStr;
            const isBooked = isDateBlocked(ds);
            const isStart = ds === checkIn, isEnd = ds === checkOut;
            const inRange = isInRange(ds);
            let bg = 'transparent', color = isFeatured ? 'rgba(255,255,255,0.7)' : C.text, opacity = 1, fw = 400;
            if (isPast) { opacity = 0.25; }
            else if (isBooked) { bg = isFeatured ? 'rgba(220,38,38,0.2)' : '#FECACA'; color = isFeatured ? '#fca5a5' : '#B91C1C'; }
            else if (isStart || isEnd) { bg = accent; color = '#fff'; fw = 700; }
            else if (inRange) { bg = `${accent}28`; }
            return (
              <button key={ds} type="button" disabled={isPast || isBooked}
                onClick={() => handleDay(ds)}
                onMouseEnter={() => { if (pickStep === 'out' && checkIn) setHovered(ds); }}
                onMouseLeave={() => setHovered(null)}
                style={{ padding: '5px 2px', borderRadius: 5, border: 'none', textAlign: 'center', fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", cursor: (isPast || isBooked) ? 'default' : 'pointer', background: bg, color, opacity, fontWeight: fw, transition: 'background 0.1s' }}>
                {parseInt(ds.split('-')[2])}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${isFeatured ? 'rgba(255,255,255,0.08)' : C.sand}` }}>
      {/* How this stay takes bookings */}
      {(stay.paymentMethod || stay.cancellationPolicy || stay.bookingConfirmation) && (
        <div style={{ background: isFeatured ? 'rgba(255,255,255,0.04)' : `${C.lakeBlue}06`, borderRadius: 10, padding: '11px 14px', marginBottom: 14, border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.07)' : `${C.lakeBlue}12`}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 }}>How {stay.name} takes bookings</div>
          {stay.paymentMethod    && <div style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.55)' : C.textLight, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 3 }}><strong style={{ color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted, fontWeight: 600 }}>Payment</strong> · {stay.paymentMethod}</div>}
          {stay.cancellationPolicy && <div style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.55)' : C.textLight, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 3 }}><strong style={{ color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted, fontWeight: 600 }}>Cancellation</strong> · {stay.cancellationPolicy}</div>}
          {stay.bookingConfirmation && <div style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.55)' : C.textLight, fontFamily: "'Libre Franklin', sans-serif" }}><strong style={{ color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted, fontWeight: 600 }}>Confirmation</strong> · {stay.bookingConfirmation}</div>}
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif", color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted }}>
          {pickStep === 'in' && 'Pick a check-in date'}
          {pickStep === 'out' && 'Now pick check-out'}
          {pickStep === 'done' && checkIn && checkOut && `${fmtDate(checkIn)} → ${fmtDate(checkOut)}`}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {(checkIn || checkOut) && (
            <button type="button" onClick={() => { setCheckIn(null); setCheckOut(null); setPickStep('in'); setReqStatus(null); setWaitStatus(null); }} style={{ fontSize: 11, color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'Libre Franklin', sans-serif" }}>Clear</button>
          )}
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
        </div>
      </div>

      {blocked === null ? (
        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", padding: '12px 0' }}>Loading availability...</div>
      ) : (
        <>
          {/* Month nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <button type="button" style={navBtn} onClick={() => setViewMonth(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 })}>‹</button>
            <button type="button" style={navBtn} onClick={() => setViewMonth(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 })}>›</button>
          </div>

          {/* Calendar */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 10 }}>
            {renderMonth(viewMonth.year, viewMonth.month)}
            {renderMonth(nextM.year, nextM.month)}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#FECACA', display: 'inline-block' }} /> Booked
            </span>
            {checkIn && (
              <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: accent, display: 'inline-block' }} /> Your selection
              </span>
            )}
          </div>

          {/* Availability result */}
          {checkIn && checkOut && (
            <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 14, background: isAvailable ? (isFeatured ? 'rgba(16,185,129,0.12)' : '#F0FDF4') : (isFeatured ? 'rgba(220,38,38,0.12)' : '#FEF2F2'), border: `1px solid ${isAvailable ? '#86EFAC' : '#FECACA'}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: isAvailable ? '#166534' : '#B91C1C', fontFamily: "'Libre Franklin', sans-serif" }}>
                {isAvailable ? `✓ ${fmtDate(checkIn)} to ${fmtDate(checkOut)} looks available` : '✗ Those dates overlap with a booking'}
              </div>
              {!isAvailable && <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginTop: 4 }}>Try different dates, or join the waitlist below.</div>}
            </div>
          )}

          {/* Request form — only when available */}
          {checkIn && checkOut && isAvailable && reqStatus !== 'done' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {reqStatus === 'error' && <div style={{ fontSize: 12, color: '#B91C1C', fontFamily: "'Libre Franklin', sans-serif" }}>Name and phone are required.</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input style={inp} placeholder="Your name" value={form.name} onChange={e => setF('name', e.target.value)} />
                <input style={inp} placeholder="Phone number" value={form.phone} onChange={e => setF('phone', e.target.value)} />
              </div>
              <textarea style={{ ...inp, minHeight: 52, resize: 'none' }} placeholder="Message to owner (optional)" value={form.message} onChange={e => setF('message', e.target.value)} />
              <button type="button" onClick={submitRequest} disabled={reqStatus === 'loading'}
                style={{ alignSelf: 'flex-start', padding: '11px 26px', borderRadius: 22, border: 'none', background: isFeatured ? C.sunset : accent, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: reqStatus === 'loading' ? 'default' : 'pointer' }}>
                {reqStatus === 'loading' ? 'Sending...' : `Request ${fmtDate(checkIn)} → ${fmtDate(checkOut)} →`}
              </button>
            </div>
          )}
          {reqStatus === 'done' && (
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#166534', fontFamily: "'Libre Franklin', sans-serif" }}>
              Request sent! The owner will contact you directly to confirm.
            </div>
          )}

          {/* Waitlist — when dates blocked */}
          {checkIn && checkOut && !isAvailable && waitStatus !== 'done' && (
            <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Notify me if those dates open up</div>
              {waitStatus === 'error' && <div style={{ fontSize: 12, color: '#B91C1C', fontFamily: "'Libre Franklin', sans-serif" }}>Name and phone are required.</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input style={inp} placeholder="Your name" value={form.name} onChange={e => setF('name', e.target.value)} />
                <input style={inp} placeholder="Phone number" value={form.phone} onChange={e => setF('phone', e.target.value)} />
              </div>
              <button type="button" onClick={joinWaitlist} disabled={waitStatus === 'loading'}
                style={{ alignSelf: 'flex-start', padding: '11px 26px', borderRadius: 22, border: `1px solid ${isFeatured ? C.sunset + '50' : accent + '50'}`, background: 'transparent', color: isFeatured ? C.sunsetLight : accent, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: waitStatus === 'loading' ? 'default' : 'pointer' }}>
                {waitStatus === 'loading' ? 'Adding...' : 'Join Waitlist →'}
              </button>
            </div>
          )}
          {waitStatus === 'done' && (
            <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#166534', fontFamily: "'Libre Franklin', sans-serif", marginTop: 4 }}>
              You're on the waitlist. We'll text if those dates open up.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Stay Card ───────────────────────────────────────────────
const DESC_LIMIT = 180;
const CARD_COLLAPSED_H = 185;

function StayCard({ stay, i }) {
  const accent = TYPE_COLORS[stay.stayType] || C.lakeBlue;
  const isFeatured = stay.tier === 'featured';
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [descExpanded, setDescExpanded] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(null);
  const descLong = stay.description && stay.description.length > DESC_LIMIT;

  return (
    <FadeIn delay={i * 80} direction={i % 2 === 0 ? 'left' : 'right'}>
      <div
        className="stay-card-row"
        style={{
          background: isFeatured ? C.dusk : '#fff',
          border: `1px solid ${isFeatured ? C.lakeDark : '#e0dbd4'}`,
          boxShadow: isFeatured ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
          borderRadius: 16,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px ${accent}30`; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = isFeatured ? 'none' : '0 2px 12px rgba(0,0,0,0.06)'; }}
      >
        {/* Left accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: accent, borderRadius: '16px 0 0 16px', zIndex: 1 }} />

        {/* Collapsible content area */}
        <div style={{ maxHeight: expanded ? 'none' : CARD_COLLAPSED_H, overflow: 'hidden', position: 'relative', padding: '28px 28px 0' }}>

          {/* Main row: photo + content */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingBottom: 24 }}>

            {/* Main photo */}
            {(stay.photos?.[0] || stay.logo || stay.photo) && (
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <img
                  className="stay-card-logo"
                  src={stay.photos?.[0] || stay.logo || stay.photo}
                  alt=""
                  onClick={e => { e.stopPropagation(); if (stay.photos?.length) setLightbox({ images: stay.photos, startIndex: 0 }); }}
                  style={{ width: 120, height: 120, borderRadius: 16, objectFit: 'cover', background: C.sand, cursor: stay.photos?.length ? 'zoom-in' : 'default', display: 'block' }}
                  onError={e => e.target.style.display = 'none'}
                />
                {stay.photos?.length > 1 && (
                  <button type="button"
                    onClick={e => { e.stopPropagation(); setLightbox({ images: stay.photos, startIndex: 0 }); }}
                    style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif", background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    📷 {stay.photos.length} photos
                  </button>
                )}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Header */}
              <div className="stay-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
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

              {/* Beds, Guests & Price */}
              {(stay.beds || stay.guests || stay.pricePerNight || stay.minStay) && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                  {stay.beds && <span style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>🛏 {stay.beds} bed{stay.beds !== 1 ? 's' : ''}</span>}
                  {stay.guests && <span style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>👥 Sleeps {stay.guests}</span>}
                  {stay.pricePerNight && <span style={{ fontSize: 12, fontWeight: 700, color: isFeatured ? C.sunsetLight : C.sunset, fontFamily: "'Libre Franklin', sans-serif", background: isFeatured ? `${C.sunset}20` : `${C.sunset}10`, padding: '2px 8px', borderRadius: 10 }}>{stay.pricePerNight}</span>}
                  {stay.minStay && <span style={{ fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>{stay.minStay}+ nights</span>}
                </div>
              )}

              {/* Description */}
              {stay.description && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 14, color: isFeatured ? 'rgba(255,255,255,0.7)' : C.textLight, lineHeight: 1.7, margin: 0 }}>
                    {descLong && !descExpanded ? stay.description.slice(0, DESC_LIMIT).trimEnd() + '...' : stay.description}
                  </p>
                  {descLong && (
                    <button type="button" onClick={e => { e.stopPropagation(); setDescExpanded(v => !v); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isFeatured ? C.sunsetLight : accent, fontFamily: "'Libre Franklin', sans-serif", padding: '4px 0 0', display: 'block' }}>
                      {descExpanded ? 'Show less ↑' : 'Read more ↓'}
                    </button>
                  )}
                </div>
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
              <div className="stay-card-meta" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                {stay.address && <span style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted }}>📍 {stay.address}</span>}
                {stay.phone && <a href={`tel:${stay.phone}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, textDecoration: 'none' }}>📞 {stay.phone}</a>}
                {stay.email && <a href={`mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, textDecoration: 'none' }}>✉️ {stay.email}</a>}
              </div>

              {/* Book Now / Visit Website */}
              {(stay.bookingUrl || stay.website) && (() => {
                const ctaStyle = { fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: isFeatured ? C.sunset : accent, textDecoration: 'none' };
                if (stay.bookingUrl) return <a href={stay.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={ctaStyle}>Book Now →</a>;
                if (stay.website) return <a href={stay.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={ctaStyle}>Visit Website →</a>;
              })()}
            </div>
          </div>{/* end inner row */}

          {/* Gradient fade when collapsed */}
          {!expanded && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, background: `linear-gradient(to bottom, transparent, ${isFeatured ? C.dusk : '#fff'})`, pointerEvents: 'none' }} />
          )}
        </div>{/* end collapsible */}

        {/* Always-visible bottom bar */}
        <div
          onClick={e => e.stopPropagation()}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '10px 20px 14px', borderTop: `1px solid ${isFeatured ? 'rgba(255,255,255,0.06)' : '#f0ebe4'}` }}
        >
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0 }}
          >
            {expanded ? 'Show less ↑' : 'Show more ↓'}
          </button>
          {stay.tier !== 'free' ? (
            <button
              type="button"
              onClick={() => { setExpanded(true); setShowCalendar(v => !v); }}
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: isFeatured ? C.sunsetLight : accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0 }}
            >
              {showCalendar ? 'Close Calendar' : 'Check Availability →'}
            </button>
          ) : (stay.email || stay.phone) ? (
            <a
              href={stay.email ? `mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}` : `tel:${stay.phone}`}
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: accent, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}
            >
              Contact Owner →
            </a>
          ) : null}
        </div>

        {/* Availability calendar — full width, outside the content column */}
        {expanded && showCalendar && stay.tier !== 'free' && (
          <div style={{ padding: '0 28px 24px', borderTop: `1px solid ${isFeatured ? 'rgba(255,255,255,0.06)' : '#f0ebe4'}` }} onClick={e => e.stopPropagation()}>
            <GuestCalendar stay={stay} onClose={() => setShowCalendar(false)} />
          </div>
        )}

        {/* Additional photos strip — only when expanded */}
        {expanded && stay.photos?.length > 1 && (
          <div
            style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 28px 20px', borderTop: `1px solid ${isFeatured ? 'rgba(255,255,255,0.06)' : '#f0ebe4'}` }}
            onClick={e => e.stopPropagation()}
          >
            {stay.photos.slice(1).map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt=""
                onClick={() => setLightbox({ images: stay.photos, startIndex: idx + 1 })}
                style={{ height: 90, width: 'auto', flexShrink: 0, borderRadius: 10, cursor: 'zoom-in', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                onError={e => e.target.style.display = 'none'}
              />
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <PhotoLightbox
            images={lightbox.images}
            startIndex={lightbox.startIndex}
            onClose={() => setLightbox(null)}
          />
        )}
      </div>
    </FadeIn>
  );
}

// ── Map Detail Panel (Zillow-style) ─────────────────────────
function MapDetailPanel({ stay, onBack }) {
  const accent = TYPE_COLORS[stay.stayType] || C.lakeBlue;
  const isFeatured = stay.tier === 'featured';
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [lightbox, setLightbox] = React.useState(null);
  const photos = (stay.photos || []).filter(Boolean);

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: isFeatured ? C.dusk : '#fff' }}>

      {/* Back bar */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${isFeatured ? 'rgba(255,255,255,0.08)' : C.sand}`, display: 'flex', alignItems: 'center', background: isFeatured ? C.dusk : '#fff', position: 'sticky', top: 0, zIndex: 2 }}>
        <button type="button" onClick={onBack}
          style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to search
        </button>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {photos.length >= 3 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '130px 130px', gap: 2 }}>
              <img src={photos[0]} alt=""
                onClick={() => setLightbox({ images: photos, startIndex: 0 })}
                style={{ gridRow: '1 / 3', width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                onError={e => e.target.style.display = 'none'} />
              {photos.slice(1, 5).map((src, idx) => (
                <img key={idx} src={src} alt=""
                  onClick={() => setLightbox({ images: photos, startIndex: idx + 1 })}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
                  onError={e => e.target.style.display = 'none'} />
              ))}
            </div>
          ) : (
            <img src={photos[0]} alt=""
              onClick={() => photos.length > 1 && setLightbox({ images: photos, startIndex: 0 })}
              style={{ width: '100%', height: 240, objectFit: 'cover', cursor: photos.length > 1 ? 'zoom-in' : 'default', display: 'block' }}
              onError={e => e.target.style.display = 'none'} />
          )}
          {photos.length > 1 && (
            <button type="button" onClick={() => setLightbox({ images: photos, startIndex: 0 })}
              style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(0,0,0,0.68)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", backdropFilter: 'blur(4px)' }}>
              ⊞ See all {photos.length} photos
            </button>
          )}
        </div>
      )}

      {/* Details */}
      <div style={{ padding: '20px 20px 0', flex: 1 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          {isFeatured && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.cream, background: C.sunset, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>✦ Staff Pick</span>}
          {stay.stayType && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isFeatured ? C.cream : accent, background: isFeatured ? `${accent}40` : `${accent}15`, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>{stay.stayType}</span>}
        </div>

        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: isFeatured ? C.cream : C.text, margin: '0 0 10px' }}>{stay.name}</h2>

        {/* Price / beds / guests */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 14 }}>
          {stay.pricePerNight && (
            <span style={{ fontSize: 20, fontWeight: 700, color: isFeatured ? C.sunsetLight : C.sunset, fontFamily: "'Libre Franklin', sans-serif" }}>
              {stay.pricePerNight}<span style={{ fontSize: 12, fontWeight: 400, color: C.textMuted }}>/night</span>
            </span>
          )}
          {stay.beds && <span style={{ fontSize: 13, color: isFeatured ? 'rgba(255,255,255,0.6)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>🛏 {stay.beds} bed{stay.beds !== 1 ? 's' : ''}</span>}
          {stay.guests && <span style={{ fontSize: 13, color: isFeatured ? 'rgba(255,255,255,0.6)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>👥 Sleeps {stay.guests}</span>}
          {stay.minStay && <span style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>{stay.minStay}+ nights</span>}
        </div>

        {/* Primary CTAs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          {(stay.bookingUrl || stay.website) && (
            <a href={stay.bookingUrl || stay.website} target="_blank" rel="noopener noreferrer"
              style={{ padding: '11px 22px', borderRadius: 24, background: isFeatured ? C.sunset : accent, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>
              {stay.bookingUrl ? 'Book Now →' : 'Visit Website →'}
            </a>
          )}
          {stay.tier !== 'free' && (
            <button type="button" onClick={() => setShowCalendar(v => !v)}
              style={{ padding: '11px 22px', borderRadius: 24, border: `1.5px solid ${isFeatured ? C.sunset + '60' : accent + '60'}`, background: 'transparent', color: isFeatured ? C.sunsetLight : accent, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>
              {showCalendar ? 'Close Calendar' : 'Check Availability'}
            </button>
          )}
          {!stay.bookingUrl && !stay.website && (stay.email || stay.phone) && (
            <a href={stay.email ? `mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}` : `tel:${stay.phone}`}
              style={{ padding: '11px 22px', borderRadius: 24, background: isFeatured ? C.sunset : accent, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>
              {stay.email ? 'Send Inquiry →' : 'Call Owner →'}
            </a>
          )}
        </div>

        {/* Description */}
        {stay.description && (
          <p style={{ fontSize: 13, color: isFeatured ? 'rgba(255,255,255,0.75)' : C.textLight, lineHeight: 1.75, margin: '0 0 16px' }}>
            {stay.description}
          </p>
        )}

        {/* Amenities */}
        {stay.amenities?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {stay.amenities.map(a => (
              <span key={a} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, background: isFeatured ? 'rgba(255,255,255,0.1)' : `${accent}10`, color: isFeatured ? 'rgba(255,255,255,0.6)' : accent, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.08)' : `${accent}20`}` }}>
                {AMENITY_ICONS[a] || '·'} {a}
              </span>
            ))}
          </div>
        )}

        {/* Stay details grid */}
        {(stay.checkIn || stay.checkOut || stay.cancellationPolicy || stay.houseRules) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, padding: '14px 16px', background: isFeatured ? 'rgba(255,255,255,0.05)' : '#f9f7f4', borderRadius: 12 }}>
            {stay.checkIn && <div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 2 }}>Check In</div><div style={{ fontSize: 13, color: isFeatured ? C.cream : C.text, fontFamily: "'Libre Franklin', sans-serif" }}>{stay.checkIn}</div></div>}
            {stay.checkOut && <div><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 2 }}>Check Out</div><div style={{ fontSize: 13, color: isFeatured ? C.cream : C.text, fontFamily: "'Libre Franklin', sans-serif" }}>{stay.checkOut}</div></div>}
            {stay.cancellationPolicy && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 2 }}>Cancellation</div><div style={{ fontSize: 13, color: isFeatured ? C.cream : C.text, fontFamily: "'Libre Franklin', sans-serif" }}>{stay.cancellationPolicy}</div></div>}
            {stay.houseRules && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 2 }}>House Rules</div><div style={{ fontSize: 13, color: isFeatured ? C.cream : C.text, fontFamily: "'Libre Franklin', sans-serif" }}>{stay.houseRules}</div></div>}
          </div>
        )}

        {/* Contact */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', paddingBottom: 20 }}>
          {stay.address && <span style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted }}>📍 {stay.address}</span>}
          {stay.phone && <a href={`tel:${stay.phone}`} style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, textDecoration: 'none' }}>📞 {stay.phone}</a>}
          {stay.email && <a href={`mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}`} style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.4)' : C.textMuted, textDecoration: 'none' }}>✉️ {stay.email}</a>}
        </div>
      </div>

      {/* Calendar — full width */}
      {showCalendar && stay.tier !== 'free' && (
        <div style={{ padding: '0 20px 24px', borderTop: `1px solid ${isFeatured ? 'rgba(255,255,255,0.06)' : '#f0ebe4'}` }}>
          <GuestCalendar stay={stay} onClose={() => setShowCalendar(false)} />
        </div>
      )}

      {lightbox && <PhotoLightbox images={lightbox.images} startIndex={lightbox.startIndex} onClose={() => setLightbox(null)} />}
    </div>
  );
}

// ── Zillow-Style Map View ────────────────────────────────────
function StaysMapView({ stays, filtered }) {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [activeStay, setActiveStay] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [visibleIds, setVisibleIds] = useState(null); // null = show all (before map loads)
  const mapDivRef = useRef(null);
  const mapObjRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef({});
  const infoWindowRef = useRef(null);
  const cardRefs = useRef({});

  const mapStays = filtered.filter(s => s.lat && s.lng);

  // Init map
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
          fullscreenControl: false,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          styles: DISCOVER_MAP_STYLES,
        });
        infoWindowRef.current = new google.maps.InfoWindow();
        mapObjRef.current.addListener('idle', () => {
          const bounds = mapObjRef.current.getBounds();
          if (!bounds) return;
          const ids = new Set();
          Object.entries(markersRef.current).forEach(([id, m]) => {
            if (bounds.contains(m.getPosition())) ids.add(id);
          });
          setVisibleIds(ids);
        });
        setMapReady(true);
      }).catch(() => { if (active) setMapError('Map failed to load.'); });
    }).catch(() => { if (active) setMapError('Map loader error.'); });
    return () => { active = false; };
  }, []);

  // Place markers
  useEffect(() => {
    if (!mapReady || !googleRef.current || !mapObjRef.current) return;
    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.setMap(null));
    markersRef.current = {};

    mapStays.forEach(stay => {
      const color = TYPE_COLORS[stay.stayType] || C.lakeBlue;
      const isFeatured = stay.tier === 'featured';
      const pinPath = 'M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0zm0 16.2c-2.3 0-4.2-1.9-4.2-4.2S9.7 7.8 12 7.8s4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2z';
      const marker = new googleRef.current.maps.Marker({
        position: { lat: stay.lat, lng: stay.lng },
        map: mapObjRef.current,
        title: stay.name,
        icon: {
          path: pinPath,
          fillColor: isFeatured ? C.sunset : '#D93025',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 1.5,
          scale: isFeatured ? 1.6 : 1.3,
          anchor: new googleRef.current.maps.Point(12, 36),
        },
        zIndex: isFeatured ? 10 : 1,
      });

      marker.addListener('click', () => {
        setActiveStay(stay.id);
        setSelectedStay(stay);
        openInfoWindow(stay, marker);
      });

      markersRef.current[stay.id] = marker;
    });

    // Fit bounds if we have multiple markers
    if (mapStays.length > 1) {
      const bounds = new googleRef.current.maps.LatLngBounds();
      mapStays.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }));
      mapObjRef.current.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    }
  }, [mapReady, mapStays.length, filtered.length]);

  const openInfoWindow = (stay, marker) => {
    if (!infoWindowRef.current) return;
    const accent = TYPE_COLORS[stay.stayType] || C.lakeBlue;
    const isFeatured = stay.tier === 'featured';
    const bookLink = stay.bookingUrl || stay.website;
    const cta = bookLink
      ? `<a href="${bookLink}" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${isFeatured ? C.sunset : accent};text-decoration:none;font-family:'Libre Franklin',sans-serif">${stay.bookingUrl ? 'Book Now →' : 'Visit Website →'}</a>`
      : stay.email
        ? `<a href="mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}" style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${accent};text-decoration:none;font-family:'Libre Franklin',sans-serif">Send Inquiry →</a>`
        : stay.phone
          ? `<a href="tel:${stay.phone}" style="display:inline-block;margin-top:8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${accent};text-decoration:none;font-family:'Libre Franklin',sans-serif">Call →</a>`
          : '';

    infoWindowRef.current.setContent(`
      <div style="font-family:'Libre Franklin',sans-serif;padding:8px 4px;max-width:280px;min-width:200px">
        <div style="display:flex;gap:10px;align-items:flex-start">
          ${stay.logo ? `<img src="${stay.logo}" style="width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0" />` : ''}
          <div style="flex:1">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
              ${isFeatured ? `<span style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#fff;background:${C.sunset};padding:2px 7px;border-radius:10px">✦ Staff Pick</span>` : ''}
              ${stay.stayType ? `<span style="font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${accent};background:${accent}15;padding:2px 7px;border-radius:10px">${stay.stayType}</span>` : ''}
            </div>
            <strong style="font-size:15px;font-family:'Libre Baskerville',serif;font-weight:400;color:#2C3E50">${stay.name}</strong>
            ${stay.beds || stay.guests ? `<div style="font-size:11px;color:#999;margin-top:3px">${stay.beds ? `🛏 ${stay.beds} bed${stay.beds !== 1 ? 's' : ''}` : ''}${stay.beds && stay.guests ? ' · ' : ''}${stay.guests ? `👥 Sleeps ${stay.guests}` : ''}</div>` : ''}
          </div>
        </div>
        ${stay.description ? `<p style="font-size:12px;color:#666;line-height:1.5;margin:8px 0 0;max-height:48px;overflow:hidden">${stay.description.length > 120 ? stay.description.slice(0, 120) + '...' : stay.description}</p>` : ''}
        ${stay.amenities && stay.amenities.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">${stay.amenities.slice(0, 4).map(a => `<span style="font-size:10px;padding:2px 7px;border-radius:8px;background:${accent}10;color:${accent};font-weight:600">${AMENITY_ICONS[a] || '·'} ${a}</span>`).join('')}</div>` : ''}
        ${cta}
      </div>
    `);
    infoWindowRef.current.open(mapObjRef.current, marker);
  };

  const handleCardClick = (stay) => {
    setActiveStay(stay.id);
    setSelectedStay(stay);
    const marker = markersRef.current[stay.id];
    if (marker && mapObjRef.current) {
      mapObjRef.current.panTo(marker.getPosition());
      mapObjRef.current.setZoom(Math.max(mapObjRef.current.getZoom(), 14));
      openInfoWindow(stay, marker);
    }
  };

  const handleCardHover = (stayId, hovering) => {
    const marker = markersRef.current[stayId];
    if (!marker || !googleRef.current) return;
    const stay = stays.find(s => s.id === stayId);
    const color = TYPE_COLORS[stay?.stayType] || C.lakeBlue;
    const pinPath = 'M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0zm0 16.2c-2.3 0-4.2-1.9-4.2-4.2S9.7 7.8 12 7.8s4.2 1.9 4.2 4.2-1.9 4.2-4.2 4.2z';
    const isFeatured = stay?.tier === 'featured';
    marker.setIcon({
      path: pinPath,
      fillColor: hovering ? C.sunset : (isFeatured ? C.sunset : '#D93025'),
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: hovering ? 2.5 : 1.5,
      scale: hovering ? 1.8 : (isFeatured ? 1.6 : 1.3),
      anchor: new googleRef.current.maps.Point(12, 36),
    });
    if (hovering) marker.setZIndex(100);
    else marker.setZIndex(stay?.tier === 'featured' ? 10 : 1);
  };

  return (
    <section style={{
      display: 'flex', height: 'calc(100vh - 120px)',
      background: C.cream, overflow: 'hidden',
    }}>
      {/* Map - left side */}
      <div style={{ flex: '0 0 60%', position: 'relative' }}>
        {mapError ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <p style={{ color: C.textMuted }}>{mapError}</p>
          </div>
        ) : (
          <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
        )}
      </div>

      {/* Right panel — detail view or card list */}
      <div style={{
        flex: '0 0 40%', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: C.cream,
        borderLeft: `1px solid ${C.sand}`,
      }}>
        {selectedStay ? (
          <MapDetailPanel stay={selectedStay} onBack={() => { setSelectedStay(null); setActiveStay(null); }} />
        ) : (
        <div style={{ overflowY: 'auto', padding: '20px 20px 20px 16px', flex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
          color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif",
          marginBottom: 14, paddingLeft: 4,
        }}>
          {(() => {
            const cardStays = visibleIds ? filtered.filter(s => visibleIds.has(s.id) || !(s.lat && s.lng)) : filtered;
            return cardStays.length;
          })()} {visibleIds ? 'in this area' : (filtered.length === 1 ? 'property' : 'properties')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(visibleIds ? filtered.filter(s => visibleIds.has(s.id) || !(s.lat && s.lng)) : filtered).map(stay => {
            const accent = TYPE_COLORS[stay.stayType] || C.lakeBlue;
            const isFeatured = stay.tier === 'featured';
            const isActive = activeStay === stay.id;
            const hasLocation = stay.lat && stay.lng;

            return (
              <div
                key={stay.id}
                ref={el => cardRefs.current[stay.id] = el}
                onClick={() => hasLocation && handleCardClick(stay)}
                onMouseEnter={() => hasLocation && handleCardHover(stay.id, true)}
                onMouseLeave={() => hasLocation && handleCardHover(stay.id, false)}
                style={{
                  background: isFeatured ? C.dusk : '#fff',
                  border: isActive
                    ? `2px solid ${isFeatured ? C.sunset : accent}`
                    : `1px solid ${isFeatured ? C.lakeDark : '#e0dbd4'}`,
                  borderRadius: 14,
                  padding: '20px 18px',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  position: 'relative', overflow: 'hidden',
                  cursor: hasLocation ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? `0 4px 20px ${accent}20` : '0 1px 6px rgba(0,0,0,0.04)',
                }}
              >
                {/* Left accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent, borderRadius: '14px 0 0 14px' }} />

                {/* Thumbnail */}
                {(stay.photos?.[0] || stay.logo || stay.photo) && (
                  <img src={stay.photos?.[0] || stay.logo || stay.photo} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: C.sand }} onError={e => e.target.style.display='none'} />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                    <h3 style={{
                      fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400,
                      color: isFeatured ? C.cream : C.text, margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {stay.name}
                    </h3>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {isFeatured && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: C.cream, background: C.sunset, padding: '2px 7px', borderRadius: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
                          ✦ Staff Pick
                        </span>
                      )}
                      {stay.stayType && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: isFeatured ? C.cream : accent, background: isFeatured ? `${accent}40` : `${accent}15`, padding: '2px 7px', borderRadius: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
                          {stay.stayType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Beds & guests */}
                  {(stay.beds || stay.guests) && (
                    <div style={{ fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.45)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4 }}>
                      {stay.beds && <span>🛏 {stay.beds} bed{stay.beds !== 1 ? 's' : ''}</span>}
                      {stay.beds && stay.guests && <span> · </span>}
                      {stay.guests && <span>👥 {stay.guests}</span>}
                    </div>
                  )}

                  {/* Description snippet */}
                  {stay.description && (
                    <p style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.55)' : C.textLight, lineHeight: 1.5, margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {stay.description}
                    </p>
                  )}

                  {/* Amenities - compact */}
                  {stay.amenities && stay.amenities.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                      {stay.amenities.slice(0, 3).map(a => (
                        <span key={a} style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 8,
                          background: isFeatured ? 'rgba(255,255,255,0.08)' : `${accent}08`,
                          color: isFeatured ? 'rgba(255,255,255,0.5)' : accent,
                          fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                        }}>
                          {AMENITY_ICONS[a] || '·'} {a}
                        </span>
                      ))}
                      {stay.amenities.length > 3 && (
                        <span style={{ fontSize: 10, color: isFeatured ? 'rgba(255,255,255,0.3)' : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
                          +{stay.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  {(() => {
                    const ctaColor = isFeatured ? C.sunset : accent;
                    const ctaStyle = { fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: ctaColor, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" };
                    if (stay.bookingUrl) return <a href={stay.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={ctaStyle}>Book Now →</a>;
                    if (stay.website) return <a href={stay.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={ctaStyle}>Website →</a>;
                    if (stay.email) return <a href={`mailto:${stay.email}?subject=Inquiry about ${encodeURIComponent(stay.name)}`} onClick={e => e.stopPropagation()} style={ctaStyle}>Inquire →</a>;
                    if (stay.phone) return <a href={`tel:${stay.phone}`} onClick={e => e.stopPropagation()} style={ctaStyle}>Call →</a>;
                    return null;
                  })()}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏕</div>
              <p style={{ color: C.textMuted, fontSize: 13 }}>
                No properties match your filters.
              </p>
            </div>
          )}
        </div>
        </div>
        )}
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          section[style*="calc(100vh"] {
            flex-direction: column !important;
            height: auto !important;
          }
          section[style*="calc(100vh"] > div:first-child {
            flex: none !important;
            height: 50vh !important;
          }
          section[style*="calc(100vh"] > div:last-child {
            flex: none !important;
            height: auto !important;
            max-height: 50vh !important;
            border-left: none !important;
            border-top: 1px solid ${C.sand} !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── List Your Property Form ─────────────────────────────────

function FormPhotoUploader({ photos, onChange, maxPhotos, isFeatured, inputStyle }) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef();

  const compressImage = (file) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1200 / img.width);
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob || file), 'image/jpeg', 0.82);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (photos.length >= maxPhotos) return;
    setUploading(true);
    try {
      const processed = file.size > 1.4 * 1024 * 1024 ? await compressImage(file) : file;
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => resolve(ev.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(processed);
      });
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: 'image/jpeg', data: base64, folder: 'stays' }),
      });
      const data = await res.json();
      if (data.url) onChange([...photos, data.url]);
    } catch { /* silent */ }
    finally { setUploading(false); e.target.value = ''; }
  };

  const remove = (i) => onChange(photos.filter((_, idx) => idx !== i));
  const accent = isFeatured ? C.sunset : C.lakeBlue;
  const textColor = isFeatured ? 'rgba(255,255,255,0.6)' : C.textLight;
  const mutedColor = isFeatured ? 'rgba(255,255,255,0.3)' : C.textMuted;

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: textColor, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 10, display: 'block', letterSpacing: 0.8, textTransform: 'uppercase' }}>
        Photos <span style={{ fontWeight: 400, color: mutedColor }}>(up to {maxPhotos})</span>
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
        {photos.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.15)' : C.sand}`, flexShrink: 0 }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button type="button" onClick={() => remove(i)} style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 8, textAlign: 'center', padding: '2px 0', fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>MAIN</div>}
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: 80, height: 80, borderRadius: 10, border: `2px dashed ${isFeatured ? 'rgba(255,255,255,0.2)' : C.sand}`, background: isFeatured ? 'rgba(255,255,255,0.04)' : C.cream, color: mutedColor, fontSize: 22, cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            {uploading ? <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif" }}>...</span> : <>+<span style={{ fontSize: 9, fontFamily: "'Libre Franklin', sans-serif" }}>Add</span></>}
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <p style={{ fontSize: 11, color: mutedColor, margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
        {photos.length}/{maxPhotos} added. JPG or PNG, max 2MB each. First photo is your main image.
      </p>
    </div>
  );
}

const TIERS = [
  { key: 'free', name: 'Directory', price: '$0', priceSub: 'forever', betaPrice: null, color: C.textMuted, accent: C.warmGray, icon: '📋',
    headline: 'Get Found',
    tagline: 'Your name in the directory so visitors know you exist.',
    features: ['Name & property type', 'Basic text listing', 'Visible in directory search'],
  },
  { key: 'listed', name: 'Listed', price: '$9', priceSub: '/mo', betaPrice: '$0', color: C.lakeBlue, accent: C.lakeBlue, icon: '📸',
    headline: 'Stand Out',
    tagline: 'Up to 5 photos, map pin, and an availability calendar - everything a guest needs.',
    features: ['Up to 5 photos', 'Map pin with address', 'Availability calendar', 'Request to Book form', 'Price & house rules', 'Amenity badges', 'Full listing card'],
  },
  { key: 'featured', name: 'Featured', price: '$25', priceSub: '/mo', betaPrice: '$0', color: C.sunset, accent: C.sunset, icon: '✦',
    headline: 'Front & Center',
    tagline: 'Up to 10 photos, top placement, and waitlist auto-notify when dates open up.',
    features: ['Up to 10 photos', 'Top of directory placement', 'Staff Pick badge', 'Waitlist auto-notify on cancellation', 'Priority in search & map', 'Featured in weekly newsletter', 'Social media spotlight post'],
  },
];

function ListYourPropertySection({ stays = [] }) {
  const [tier, setTier] = useState('listed'); // default to Listed during beta

  // Pre-fill from query params if arriving from /business redirect
  const prefill = (() => {
    try {
      const hash = window.location.hash; // e.g. #list-property?name=Foo&email=bar
      const qIndex = hash.indexOf('?');
      if (qIndex === -1) return {};
      const p = new URLSearchParams(hash.slice(qIndex + 1));
      return { name: p.get('name') || '', email: p.get('email') || '' };
    } catch { return {}; }
  })();

  const [form, setForm] = useState({ name: prefill.name, stayType: '', address: '', bookingUrl: '', email: prefill.email, description: '', phone: '', beds: '', guests: '', amenities: [], photos: [], pricePerNight: '', minStay: '', checkIn: '', checkOut: '', houseRules: '', paymentMethod: '', cancellationPolicy: '', bookingConfirmation: '', icalUrl: '', _hp: '' });
  const [status, setStatus] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const formRef = useRef(null);

  // SMS verification flow states
  const [step, setStep] = useState('form'); // 'form' | 'verify' | 'activated'
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resending, setResending] = useState(false);

  const activeTier = TIERS.find(t => t.key === tier);
  const isFeatured = tier === 'featured';
  const isListed = tier === 'listed';
  const isPaid = isFeatured || isListed;

  const selectedType = form.stayType;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));

  const selectTier = (key) => {
    setTier(key);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setStatus('error_name'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setStatus('error_email'); return; }
    const phoneDigits = (form.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10) { setStatus('error_phone'); return; }
    setStatus('sending');
    try {
      const res = await fetch('/api/submit-stay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photos: form.photos, tier, _hp: form._hp }),
      });
      const data = await res.json();
      if (data.needsVerification) {
        setStep('verify');
        setStatus(null);
      } else if (data.error) {
        setStatus('error');
      } else {
        setStatus('error');
      }
    } catch { setStatus('error'); }
  };

  const handleVerify = async () => {
    if (verifyCode.trim().length !== 6) {
      setVerifyError('Enter the 6-digit code from your text message.');
      return;
    }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/verify-stay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code: verifyCode.trim(), tier }),
      });
      const data = await res.json();
      if (data.error) {
        setVerifyError(data.error);
      } else if (data.activated) {
        setStep('activated');
      } else if (data.needsPayment) {
        // Post-beta paid tier - redirect to Stripe
        const checkoutRes = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: tier === 'featured' ? 'stays_featured' : 'stays_listed',
            businessName: form.name,
            email: form.email,
            priceInCents: tier === 'featured' ? 2500 : 900,
            mode: 'subscription',
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
        } else {
          setVerifyError(checkoutData.error || yeti.payment());
        }
      }
    } catch {
      setVerifyError(yeti.network());
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch('/api/verify-stay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, resend: true }),
      });
    } catch { /* silent */ }
    finally {
      setTimeout(() => setResending(false), 3000);
    }
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
        <SectionLabel>Get Listed</SectionLabel>
        <SectionTitle>Your booking. Your rules. Your money.</SectionTitle>
        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, textAlign: 'center', marginBottom: 10, maxWidth: 580, margin: '0 auto 10px' }}>
          We put your property in front of lake visitors - you handle the booking your own way. No commission on every stay, no platform dictating your cancellation policy, no middleman between you and your guests.
        </p>
        <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, textAlign: 'center', marginBottom: 20, maxWidth: 520, margin: '0 auto 20px' }}>
          Take payment by Zelle, bank transfer, PayPal - whatever works for you. Set your own deposit and cancellation terms. Talk directly with guests before they arrive. Keep every dollar.
        </p>

        {/* Summer launch badge */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', background: `${C.sunset}10`, border: `1px solid ${C.sunset}25`, borderRadius: 12, padding: '12px 24px' }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: C.sunset, marginBottom: 2 }}>Summer Launch - Free through July 4th</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Full Listed experience. No credit card. No catch.</div>
          </div>
        </div>

        {/* ── Tier Selector Buttons ── */}
        <div className="tier-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {TIERS.map(t => {
            const active = tier === t.key;
            return (
              <button
                key={t.key}
                type="button"
                className={`tier-btn-inner${active ? ' active' : ''}`}
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


                <div style={{ fontSize: 28, marginBottom: 8, filter: active ? 'none' : 'grayscale(0.3)' }}>{t.icon}</div>

                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                  color: active ? t.accent : C.textMuted,
                  fontFamily: "'Libre Franklin', sans-serif", marginBottom: 6,
                  transition: 'color 0.3s',
                }}>
                  {t.name}
                </div>

                {t.betaPrice !== undefined && t.betaPrice !== null ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: 2 }}>
                      <span style={{
                        fontFamily: "'Libre Baskerville', serif",
                        fontSize: active ? 36 : 28,
                        color: active && t.key === 'featured' ? C.cream : C.text,
                        fontWeight: 400, transition: 'all 0.3s',
                      }}>
                        {t.betaPrice}
                      </span>
                      <span style={{
                        fontSize: 12, color: active && t.key === 'featured' ? 'rgba(255,255,255,0.4)' : C.textMuted,
                        fontFamily: "'Libre Franklin', sans-serif",
                      }}>
                        thru July 4
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: active ? 10 : 6 }}>
                      <span style={{
                        fontFamily: "'Libre Baskerville', serif",
                        fontSize: active ? 22 : 18,
                        color: active && t.key === 'featured' ? 'rgba(255,255,255,0.6)' : C.text,
                        fontWeight: 400, transition: 'all 0.3s',
                      }}>
                        then {t.price}
                      </span>
                      <span style={{
                        fontSize: 13, color: active && t.key === 'featured' ? 'rgba(255,255,255,0.35)' : C.textMuted,
                        fontFamily: "'Libre Franklin', sans-serif",
                      }}>
                        {t.priceSub}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: active ? 10 : 6 }}>
                    <span style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: active ? 36 : 28,
                      color: active && t.key === 'featured' ? C.cream : C.text,
                      fontWeight: 400, transition: 'all 0.3s',
                    }}>
                      {t.price}
                    </span>
                    <span style={{
                      fontSize: 13, color: active && t.key === 'featured' ? 'rgba(255,255,255,0.4)' : C.textMuted,
                      fontFamily: "'Libre Franklin', sans-serif",
                    }}>
                      {t.priceSub}
                    </span>
                  </div>
                )}

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

        {/* ── Sample Listings - same property, three tiers ── */}
        <div key={tier} style={{ marginBottom: 32, animation: 'sampleFadeIn 0.35s ease' }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: activeTier.accent, fontFamily: "'Libre Franklin', sans-serif",
            textAlign: 'center', marginBottom: 14,
          }}>
            Your listing will look like this
          </div>

          {/* Free sample - same cabin, bare minimum */}
          {tier === 'free' && (
            <div style={{
              background: '#fff', border: `1px solid #e0dbd4`, borderRadius: 16,
              padding: '32px 28px', display: 'flex', gap: 24, alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: C.lakeBlue, borderRadius: '16px 0 0 16px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: 0 }}>
                    Yeti's Cozy Cabin
                  </h3>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.lakeBlue, background: `${C.lakeBlue}15`, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>
                    Cottage
                  </span>
                </div>
                <p style={{ fontSize: 12, color: C.textMuted, marginTop: 6, marginBottom: 0, fontStyle: 'italic', lineHeight: 1.6 }}>
                  That's it. Name and type only - no photo, no description, no booking link. Guests see you exist, but have nothing to go on.
                </p>
              </div>
            </div>
          )}

          {/* Listed ($9) sample - same cabin, full card with photo */}
          {tier === 'listed' && (
            <div className="sample-card-row" style={{
              background: '#fff', border: `1px solid #e0dbd4`, borderRadius: 16,
              padding: '32px 28px', display: 'flex', gap: 24, alignItems: 'flex-start',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: C.lakeBlue, borderRadius: '16px 0 0 16px' }} />
              <img className="sample-card-img" src="/images/yeti/yeti-cabin.jpg" alt="" style={{ width: 120, height: 120, borderRadius: 16, objectFit: 'cover', flexShrink: 0, background: C.sand }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: 0 }}>Yeti's Cozy Cabin</h3>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.lakeBlue, background: `${C.lakeBlue}15`, padding: '4px 10px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>Cottage</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 8 }}>🛏 3 beds · 👥 Sleeps 8</div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: '0 0 14px' }}>
                  Lakefront cabin with a fire pit, private dock, and the best sunset view on Devils Lake. The kind of place you never want to leave.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {['Waterfront', 'Fire Pit', 'Dock', 'WiFi', 'Kitchen'].map(a => (
                    <span key={a} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 12, background: `${C.lakeBlue}10`, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, border: `1px solid ${C.lakeBlue}20` }}>
                      {AMENITY_ICONS[a]} {a}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>📍 7832 Devils Lake Hwy</span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>📞 (517) 555-0199</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif" }}>Book Now →</span>
              </div>
            </div>
          )}

          {/* Featured ($25) sample - same cabin, premium treatment */}
          {tier === 'featured' && (() => {
            const samplePhotos = ['/images/yeti/yeti-cabin.jpg', '/images/yeti/yeti-cabin-2.jpg', '/images/yeti/yeti-cabin-3.jpg'];
            return (
              <div style={{
                background: C.dusk, border: `1px solid ${C.lakeDark}`, borderRadius: 16,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: C.sunset, borderRadius: '16px 0 0 16px' }} />

                {/* Card body */}
                <div className="sample-card-row" style={{ padding: '32px 28px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  <img
                    className="sample-card-img"
                    src={samplePhotos[0]}
                    alt=""
                    onClick={() => setLightbox({ images: samplePhotos, startIndex: 0 })}
                    style={{ width: 120, height: 120, borderRadius: 16, objectFit: 'cover', flexShrink: 0, background: C.night, cursor: 'pointer', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.sunset, fontFamily: "'Libre Franklin', sans-serif" }}>Book Now →</span>
                  </div>
                </div>

                {/* Photo gallery strip - Featured perk */}
                <div className="gallery-strip" style={{
                  display: 'flex', gap: 10, padding: '0 28px 24px',
                  borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20,
                  overflowX: 'auto',
                }}>
                  {samplePhotos.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      onClick={() => setLightbox({ images: samplePhotos, startIndex: i })}
                      style={{
                        height: 110, width: 'auto', flexShrink: 0,
                        borderRadius: 12, cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── The Form ── */}
        <div key={`form-${tier}`} ref={formRef} style={{
          background: formBg,
          border: formBorder,
          animation: 'sampleFadeIn 0.35s ease',
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
                Photos, details, and a direct booking link - guests get everything they need.
              </p>
            </div>
          )}

          {step === 'activated' ? (
            /* ── ACTIVATED SUCCESS ── */
            <div style={{
              textAlign: 'center', padding: 48,
              background: isFeatured ? 'rgba(255,255,255,0.04)' : C.cream,
              borderRadius: 16,
              border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.08)' : `${C.sage}30`}`,
            }}>
              <div style={{ fontSize: 56, marginBottom: 16, animation: 'staysPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>🏡</div>
              <h3 style={{
                fontFamily: "'Libre Baskerville', serif", fontSize: 24,
                color: isFeatured ? C.cream : C.text, marginBottom: 10, fontWeight: 400,
              }}>
                {form.name || 'Your property'} is on the map!
              </h3>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunset, marginBottom: 20 }}>
                You're live for summer - welcome aboard.
              </div>
              <p style={{ fontSize: 14, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textLight, lineHeight: 1.8, margin: '0 0 16px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
                Your listing is live on the stays page. Visitors can find you on the map, see your details, and click through to book with you directly. Check your texts for a confirmation.
              </p>
              <p style={{ fontSize: 13, color: isFeatured ? 'rgba(255,255,255,0.35)' : C.textMuted, lineHeight: 1.7, margin: '0 0 20px', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
                Before July 4th we'll send you details about keeping your listing live after the summer launch period ends - month to month, no contract, cancel anytime.
              </p>
              <div style={{ background: isFeatured ? 'rgba(255,255,255,0.06)' : '#f0f8ff', border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.1)' : C.lakeBlue + '30'}`, borderRadius: 12, padding: '16px 20px', maxWidth: 460, margin: '0 auto 28px', textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isFeatured ? C.cream : C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5, marginBottom: 6 }}>Next step: set your availability</div>
                <p style={{ fontSize: 12, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textLight, margin: '0 0 10px', lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  Guests can see and select your available dates in real time. Head to your manage page to block out dates or add your Airbnb/VRBO calendar for automatic sync.
                </p>
                <a href="/stays/manage" style={{ fontSize: 11, fontWeight: 700, color: isFeatured ? C.sunsetLight : C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1, textTransform: 'uppercase', textDecoration: 'none' }}>
                  Set Up Calendar →
                </a>
              </div>
              <a href="/stays" style={{
                display: 'inline-block', padding: '14px 32px', background: C.lakeBlue, color: C.cream, borderRadius: 28,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
                textTransform: 'uppercase', textDecoration: 'none',
              }}>
                See Your Listing →
              </a>
              <style>{`@keyframes staysPop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }`}</style>
            </div>

          ) : step === 'verify' ? (
            /* ── VERIFICATION CODE ENTRY ── */
            <div style={{
              textAlign: 'center', padding: '44px 28px',
              background: isFeatured ? 'rgba(255,255,255,0.04)' : C.cream,
              borderRadius: 16,
              border: `1px solid ${isFeatured ? 'rgba(255,255,255,0.1)' : `${C.sage}20`}`,
            }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📱</div>
              <h3 style={{
                fontFamily: "'Libre Baskerville', serif", fontSize: 22,
                color: isFeatured ? C.cream : C.text, fontWeight: 400, margin: '0 0 8px',
              }}>
                Check your texts
              </h3>
              <p style={{ fontSize: 14, color: isFeatured ? 'rgba(255,255,255,0.5)' : C.textLight, lineHeight: 1.8, margin: '0 0 28px' }}>
                We sent a 6-digit code to <strong style={{ color: isFeatured ? C.sunsetLight : C.text }}>{form.phone}</strong>
              </p>
              <div style={{ maxWidth: 240, margin: '0 auto 20px' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '16px 20px',
                    border: `2px solid ${verifyError ? '#e07070' : (isFeatured ? 'rgba(255,255,255,0.2)' : C.sand)}`,
                    borderRadius: 12,
                    background: isFeatured ? 'rgba(255,255,255,0.06)' : C.warmWhite,
                    color: isFeatured ? C.cream : C.text,
                    fontFamily: "'Libre Franklin', sans-serif", fontSize: 28, fontWeight: 700,
                    textAlign: 'center', letterSpacing: 8, outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { if (!verifyError) e.currentTarget.style.borderColor = C.lakeBlue; }}
                  onBlur={e => { if (!verifyError) e.currentTarget.style.borderColor = isFeatured ? 'rgba(255,255,255,0.2)' : C.sand; }}
                />
              </div>
              {verifyError && (
                <div style={{ fontSize: 13, color: '#e07070', fontWeight: 500, marginBottom: 16 }}>{verifyError}</div>
              )}
              <button
                onClick={handleVerify}
                disabled={verifyLoading || verifyCode.length !== 6}
                style={{
                  padding: '14px 36px',
                  background: verifyLoading ? C.sand : C.lakeBlue,
                  color: C.cream, border: 'none', borderRadius: 28, fontSize: 13, fontWeight: 700,
                  letterSpacing: 1.5, textTransform: 'uppercase', cursor: verifyLoading ? 'default' : 'pointer',
                  fontFamily: "'Libre Franklin', sans-serif", transition: 'background 0.2s',
                  opacity: verifyCode.length !== 6 ? 0.5 : 1,
                }}
              >
                {verifyLoading ? 'Verifying...' : 'Verify & Get Listed →'}
              </button>
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  style={{
                    background: 'none', border: 'none', fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 12, color: resending ? C.sage : C.textMuted,
                    cursor: resending ? 'default' : 'pointer', padding: '6px 12px',
                  }}
                >
                  {resending ? '✓ Code re-sent' : "Didn't get it? Resend code"}
                </button>
              </div>
            </div>

          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: isFeatured ? 20 : 16 }}>
              <div style={{ display: 'none' }}><input value={form._hp} onChange={e => set('_hp', e.target.value)} tabIndex={-1} autoComplete="off" /></div>

              {/* Property Name - all tiers */}
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

              {/* Type + Phone - all tiers */}
              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                  <label style={labelStyle}>Phone * <span style={{ fontWeight: 400, letterSpacing: 0 }}>- for verification</span></label>
                  <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 123-4567" />
                </div>
              </div>

              {/* Email - all tiers */}
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              </div>

              {/* ── Paid-tier fields ── */}
              {isPaid && (
                <>
                  {/* Photos */}
                  <FormPhotoUploader
                    photos={form.photos}
                    onChange={urls => set('photos', urls)}
                    maxPhotos={isFeatured ? 10 : 5}
                    isFeatured={isFeatured}
                    inputStyle={inputStyle}
                  />

                  {/* Address */}
                  <div>
                    <label style={labelStyle}>Address</label>
                    <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Lake St, Manitou Beach" />
                  </div>

                  {/* Booking URL */}
                  <div>
                    <label style={labelStyle}>Booking URL <span style={{ fontWeight: 400, color: isFeatured ? 'rgba(255,255,255,0.3)' : C.textMuted }}>(optional - Airbnb, VRBO, your own site)</span></label>
                    <input style={inputStyle} value={form.bookingUrl} onChange={e => set('bookingUrl', e.target.value)} placeholder="https://airbnb.com/rooms/..." />
                  </div>

                  {/* iCal calendar sync */}
                  <div>
                    <label style={labelStyle}>Availability calendar link <span style={{ fontWeight: 400, color: isFeatured ? 'rgba(255,255,255,0.3)' : C.textMuted }}>(optional)</span></label>
                    <input style={inputStyle} value={form.icalUrl} onChange={e => set('icalUrl', e.target.value)} placeholder="https://www.airbnb.com/calendar/ical/..." />
                    <p style={{ fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.25)' : C.textMuted, margin: '6px 0 0', lineHeight: 1.6 }}>
                      On Airbnb or VRBO? Paste your calendar export link and we sync your booked dates every day.
                      Not on any platform? <strong style={{ fontWeight: 700 }}>Google Calendar is free</strong> - create events for your bookings, grab the public iCal link from Calendar Settings, and paste it here.
                    </p>
                  </div>

                  {/* How you take bookings */}
                  <div>
                    <label style={labelStyle}>How you take bookings <span style={{ fontWeight: 400, color: isFeatured ? 'rgba(255,255,255,0.3)' : C.textMuted }}>(guests see this before reaching out)</span></label>
                    <div style={{ display: 'grid', gap: 10 }}>
                      <input style={inputStyle} value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} placeholder="Payment method - e.g. Zelle, PayPal, bank transfer" />
                      <input style={inputStyle} value={form.cancellationPolicy} onChange={e => set('cancellationPolicy', e.target.value)} placeholder="Cancellation policy - e.g. 50% deposit, full refund 30+ days out" />
                      <input style={inputStyle} value={form.bookingConfirmation} onChange={e => set('bookingConfirmation', e.target.value)} placeholder="Confirmation - e.g. Written rental agreement sent by email" />
                    </div>
                    <p style={{ fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.25)' : C.textMuted, margin: '8px 0 0', lineHeight: 1.6 }}>
                      Your booking, your rules. We never handle payments or stand between you and your guests.
                    </p>
                  </div>

                  {/* Beds + Guests */}
                  <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                      {isFeatured ? 'Description - sell the experience, not just the specs' : 'Description'}
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

                  {/* Pricing & policies */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Price per night</label>
                      <input style={inputStyle} value={form.pricePerNight} onChange={e => set('pricePerNight', e.target.value)} placeholder="e.g. From $150/night" />
                    </div>
                    <div>
                      <label style={labelStyle}>Minimum stay (nights)</label>
                      <input type="number" min="1" style={inputStyle} value={form.minStay} onChange={e => set('minStay', e.target.value)} placeholder="e.g. 2" />
                    </div>
                    <div>
                      <label style={labelStyle}>Check-in time</label>
                      <input style={inputStyle} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} placeholder="e.g. 3:00 PM" />
                    </div>
                    <div>
                      <label style={labelStyle}>Check-out time</label>
                      <input style={inputStyle} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} placeholder="e.g. 11:00 AM" />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>House rules <span style={{ fontWeight: 400, color: isFeatured ? 'rgba(255,255,255,0.3)' : C.textMuted }}>(optional)</span></label>
                    <textarea style={{ ...inputStyle, height: 64, resize: 'vertical', lineHeight: 1.6 }} value={form.houseRules} onChange={e => set('houseRules', e.target.value)} placeholder="No smoking, pets by arrangement, quiet after 10pm..." />
                  </div>
                </>
              )}

              {/* Submit / Waitlist */}

                <div style={{ marginTop: isFeatured ? 12 : 8 }}>
                  {/* Validation hints */}
                  {status === 'error_name' && <p style={{ fontSize: 13, color: '#c0392b', textAlign: 'center', margin: '0 0 8px' }}>Property name is required.</p>}
                  {status === 'error_email' && <p style={{ fontSize: 13, color: '#c0392b', textAlign: 'center', margin: '0 0 8px' }}>A valid email address is required.</p>}
                  {status === 'error_phone' && <p style={{ fontSize: 13, color: '#c0392b', textAlign: 'center', margin: '0 0 8px' }}>A valid phone number is required - we'll text you a verification code.</p>}
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
                      ? 'Sending verification code...'
                      : 'Get on the Map →'}
                  </Btn>
                </div>

              <p style={{ fontSize: 11, color: isFeatured ? 'rgba(255,255,255,0.25)' : C.textMuted, textAlign: 'center', lineHeight: 1.7, margin: '4px 0 0' }}>
                We'll text a verification code to your phone. Once verified, your listing goes live.
              </p>
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

        {/* CSS animations */}
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes sampleFadeIn {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
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

                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                  <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
              <div className="manage-card-row" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {listing.photo && (
                  <img src={listing.photo} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', flexShrink: 0, background: C.sand }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
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
  const [view, setView] = useState('list'); // 'list' | 'map'
  const [minBeds, setMinBeds] = useState('');
  const [minGuests, setMinGuests] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = minBeds || minGuests || selectedAmenities.length > 0;

  const toggleAmenity = (a) => setSelectedAmenities(prev =>
    prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
  );

  const clearFilters = () => {
    setFilter('All');
    setMinBeds('');
    setMinGuests('');
    setSelectedAmenities([]);
  };

  useEffect(() => {
    fetch('/api/stays')
      .then(r => r.json())
      .then(d => { setStays(d.stays || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = stays.filter(s => {
    if (filter !== 'All' && s.stayType !== filter) return false;
    if (minBeds && (s.beds || 0) < parseInt(minBeds, 10)) return false;
    if (minGuests && (s.guests || 0) < parseInt(minGuests, 10)) return false;
    if (selectedAmenities.length > 0 && !selectedAmenities.every(a => (s.amenities || []).includes(a))) return false;
    return true;
  });

  return (
    <div style={{ overflowX: 'hidden' }}>
      <SEOHead
        title="Lakefront Stays & Vacation Rentals"
        description="Book lakefront stays on Devils Lake, Michigan. Cottages, Airbnbs, tiny homes, camping, and lodging in the heart of the Irish Hills."
        path="/stays"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Stays', path: '/stays' },
        ]}
      />
      <GlobalStyles />
      <style>{`
        @media (max-width: 600px) {
          .stay-card-row { flex-direction: column !important; gap: 16px !important; }
          .stay-card-row .stay-card-logo { width: 100% !important; height: 180px !important; border-radius: 12px !important; }
          .sample-card-row { flex-direction: column !important; gap: 16px !important; }
          .sample-card-row .sample-card-img { width: 100% !important; height: 180px !important; border-radius: 12px !important; }
          .tier-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .manage-card-row { flex-direction: column !important; gap: 12px !important; }
          .manage-card-row img { width: 100% !important; height: 160px !important; border-radius: 12px !important; }
          .gallery-strip { gap: 6px !important; padding: 0 16px 16px !important; }
          .gallery-strip img { height: 72px !important; border-radius: 8px !important; }
          .filter-bar-inner { flex-direction: column !important; gap: 10px !important; }
          .stays-filter-panel { flex-direction: column !important; gap: 16px !important; }
          .stay-card-header { flex-direction: column !important; align-items: flex-start !important; }
          .stay-card-meta { flex-direction: column !important; gap: 6px !important; }
        }
        @media (max-width: 480px) {
          .tier-btn-inner { padding: 20px 14px 16px !important; }
          .tier-btn-inner.active { padding: 24px 16px 20px !important; }
        }
      `}</style>
      <PromoBanner />
      <Navbar />
      <StaysHero />

      {/* Category Filter + View Toggle */}
      <section style={{
        padding: '16px 24px',
        background: C.cream,
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: `1px solid ${C.sand}`,
      }}>
        <div className="filter-bar-inner" style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Type filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, justifyContent: 'center' }}>
            {STAY_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                  letterSpacing: 1, textTransform: 'uppercase',
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
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

          {/* Filter toggle + View toggle */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
            <button
              onClick={() => setFiltersOpen(p => !p)}
              style={{
                fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase',
                padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                border: `1.5px solid ${hasActiveFilters ? C.sunset : C.sand}`,
                background: filtersOpen ? (hasActiveFilters ? C.sunset : C.lakeBlue) : 'transparent',
                color: filtersOpen ? C.cream : (hasActiveFilters ? C.sunset : C.textMuted),
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {filtersOpen ? '✕ Filters' : '⚙ Filters'}
              {hasActiveFilters && !filtersOpen && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 8, height: 8, borderRadius: '50%',
                  background: C.sunset,
                }} />
              )}
            </button>

            <div style={{
              display: 'flex', borderRadius: 10, overflow: 'hidden',
              border: `1.5px solid ${C.sand}`, flexShrink: 0,
            }}>
              <button
                onClick={() => setView('list')}
                style={{
                  fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                  padding: '7px 14px', cursor: 'pointer', border: 'none',
                  background: view === 'list' ? C.lakeBlue : 'transparent',
                  color: view === 'list' ? C.cream : C.textMuted,
                  transition: 'all 0.2s', letterSpacing: 0.5,
                }}
              >
                List
              </button>
              <button
                onClick={() => setView('map')}
                style={{
                  fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                  padding: '7px 14px', cursor: 'pointer', border: 'none',
                  borderLeft: `1px solid ${C.sand}`,
                  background: view === 'map' ? C.lakeBlue : 'transparent',
                  color: view === 'map' ? C.cream : C.textMuted,
                  transition: 'all 0.2s', letterSpacing: 0.5,
                }}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* Expandable filter panel */}
        {filtersOpen && (
          <div style={{
            maxWidth: 960, margin: '12px auto 0', padding: '16px 20px',
            background: '#fff', borderRadius: 14,
            border: `1px solid ${C.sand}`,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}>
            <div className="stays-filter-panel" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {/* Beds & Guests */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", display: 'block', marginBottom: 6 }}>
                    Min Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Any"
                    value={minBeds}
                    onChange={e => setMinBeds(e.target.value)}
                    style={{
                      width: 72, padding: '8px 10px', borderRadius: 10,
                      border: `1.5px solid ${minBeds ? C.lakeBlue : C.sand}`,
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
                      color: C.text, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", display: 'block', marginBottom: 6 }}>
                    Min Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Any"
                    value={minGuests}
                    onChange={e => setMinGuests(e.target.value)}
                    style={{
                      width: 72, padding: '8px 10px', borderRadius: 10,
                      border: `1.5px solid ${minGuests ? C.lakeBlue : C.sand}`,
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
                      color: C.text, outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>
              </div>

              {/* Amenity toggles */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", display: 'block', marginBottom: 6 }}>
                  Amenities
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AMENITY_OPTIONS.map(a => {
                    const active = selectedAmenities.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        style={{
                          fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                          padding: '5px 12px', borderRadius: 16, cursor: 'pointer',
                          border: `1.5px solid ${active ? C.lakeBlue : C.sand}`,
                          background: active ? C.lakeBlue : 'transparent',
                          color: active ? C.cream : C.textMuted,
                          transition: 'all 0.2s',
                        }}
                      >
                        {AMENITY_ICONS[a]} {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Clear all */}
            {hasActiveFilters && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.sand}` }}>
                <button
                  onClick={clearFilters}
                  style={{
                    fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                    color: C.sunset, background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0, textDecoration: 'underline',
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Listings - list or map view */}
      {view === 'map' ? (
        <StaysMapView stays={stays} filtered={filtered} />
      ) : (
        <section style={{ padding: '60px 24px 80px', background: C.cream }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 14 }}>Loading stays...</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏕</div>
                <p style={{ color: C.textMuted, fontSize: 15, marginBottom: hasActiveFilters ? 12 : 0 }}>
                  {hasActiveFilters
                    ? 'No properties match those filters. Try loosening your search.'
                    : filter === 'All' ? 'No stays listed yet - be the first!' : `No ${filter} listings yet.`
                  }
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    style={{
                      fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                      color: C.cream, background: C.sunset, border: 'none',
                      padding: '8px 20px', borderRadius: 20, cursor: 'pointer',
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {filtered.map((stay, i) => (
                  <StayCard key={stay.id} stay={stay} i={i} />
                ))}
                {/* Visitor wall teaser */}
                <a href="/visitor-wall" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '20px 24px', borderRadius: 16, background: `${C.night}`, border: `1px solid rgba(91,126,149,0.2)`, textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4 }}>Visitor Wall</div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: '#fff', fontWeight: 400 }}>🌍 Visitors find their way here from around the world</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.sunset, fontFamily: "'Libre Franklin', sans-serif" }}>See the map →</span>
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Seasonal banner */}
      <section style={{ padding: '40px 24px', background: `linear-gradient(135deg, ${C.sunset}15, ${C.lakeBlue}10)`, textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: C.text, fontFamily: "'Libre Baskerville', serif", margin: 0 }}>
          Peak season: June - September. <a href="/events" style={{ color: C.sunset, textDecoration: 'none', fontWeight: 600 }}>See what's happening →</a>
        </p>
      </section>

      <WaveDivider />

      <ListYourPropertySection stays={stays} />
      <ManageListingSection />

      {/* ── FAQ ── */}
      <section style={{ padding: '80px 24px', background: C.warmWhite }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <SectionLabel>Common Questions</SectionLabel>
          <SectionTitle>How It Works</SectionTitle>
          {[
            {
              q: 'Is this a booking site?',
              a: "No - we're not Airbnb or VRBO. We don't handle reservations or take a cut of your bookings. Your listing links directly to wherever you take bookings - your Airbnb page, your VRBO listing, your own website, or just your phone number and email. We send guests your way. That's it.",
            },
            {
              q: "What happens after July 4th?",
              a: "Before July 4th, we'll send you an email and a text with details about keeping your listing live. You pick a tier - $9/month for a full listing with photos, map pin, and booking link, or $25/month for Featured placement with a Staff Pick badge. No obligation. If you don't want to continue, your listing simply moves to a free directory entry.",
            },
            {
              q: 'Is there a contract?',
              a: "No. Everything is month to month. Cancel anytime - no fees, no penalties, no awkward phone calls. If you cancel, your listing downgrades to a free directory entry (name and type only).",
            },
            {
              q: "What do visitors actually see?",
              a: "Visitors come to the Stays page and see a map of all listed properties plus cards with your photos, description, amenity tags, and a direct link to book on your site. Featured listings appear first with a Staff Pick badge and premium card design.",
            },
            {
              q: "Can I update my listing after I submit it?",
              a: "Absolutely. Scroll up to the \"Manage Your Listing\" section, enter the email you used when you signed up, and you can edit everything - photos, description, amenities, booking link, all of it.",
            },
          ].map((faq, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div style={{
                marginBottom: 20,
                padding: '24px 28px',
                background: '#fff',
                borderRadius: 14,
                border: `1px solid ${C.sand}`,
                boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
              }}>
                <h4 style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 16, fontWeight: 400, color: C.text,
                  margin: '0 0 10px',
                }}>
                  {faq.q}
                </h4>
                <p style={{
                  fontSize: 14, color: C.textLight, lineHeight: 1.75,
                  margin: 0,
                }}>
                  {faq.a}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <NewsletterInline />
      <PageSponsorBanner pageName="stays" />
      <Footer />
    </div>
  );
}
