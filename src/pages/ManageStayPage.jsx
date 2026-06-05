import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { C } from '../data/config';
import yeti from '../data/errorMessages';

const STAY_TYPES = ['Cottage', 'Airbnb', 'Tiny Home', 'Camping', 'Inn/B&B'];

const AMENITY_OPTIONS = ['Waterfront', 'Pet Friendly', 'WiFi', 'AC', 'Fire Pit', 'Dock', 'Boat Launch', 'Kitchen', 'Grill'];

const TIER_LABELS = {
  'Listed Enhanced': { label: 'Listed', color: C.lakeBlue },
  'Listed Featured': { label: 'Featured', color: C.sunset },
  'Listed Premium':  { label: 'Premium', color: '#7B68B0' },
  'Listed Free':     { label: 'Directory', color: C.textMuted },
  'New':             { label: 'Pending Review', color: C.textMuted },
};

const inp = {
  width: '100%', padding: '13px 15px', borderRadius: 10,
  fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
  background: C.warmWhite, border: `1px solid ${C.sand}`,
  color: C.text, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const label = {
  fontSize: 12, fontWeight: 600, color: C.textLight,
  fontFamily: "'Libre Franklin', sans-serif",
  marginBottom: 6, display: 'block', letterSpacing: 0.3,
};

// ── Step 1: Enter phone ────────────────────────────────────────
function StepPhone({ onSent }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit phone number.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/manage-stay-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else if (data.sent) { onSent(digits); }
    } catch { setError(yeti.network()); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏡</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.lakeBlue, marginBottom: 8 }}>
          Welcome back
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 400, color: C.text, margin: '0 0 10px' }}>
          Manage Your Listing
        </h1>
        <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
          Enter the phone number you used when you signed up. We'll text you a code.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={label} htmlFor="ms-phone">Phone number</label>
        <input
          id="ms-phone"
          type="tel"
          inputMode="tel"
          placeholder="(555) 555-5555"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inp}
          autoFocus
          onFocus={e => e.target.style.borderColor = C.lakeBlue}
          onBlur={e => e.target.style.borderColor = C.sand}
        />
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '15px', borderRadius: 28, border: 'none',
          background: loading ? `${C.lakeBlue}80` : C.lakeBlue,
          color: '#fff', fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Sending...' : 'Text Me a Code →'}
      </button>

      <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
        Don't have a listing yet?{' '}
        <a href="/stays#list-property" style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 600 }}>
          Sign up here
        </a>
      </p>
    </form>
  );
}

// ── Step 2: Enter code ─────────────────────────────────────────
function StepCode({ phone, onVerified }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  const verify = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) { setError('Enter the 6-digit code from your text.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/manage-stay-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: code.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else if (data.listing) { onVerified(data.listing); }
    } catch { setError(yeti.network()); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    setResending(true);
    try {
      await fetch('/api/manage-stay-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
    } catch { /* silent */ }
    finally { setTimeout(() => setResending(false), 3000); }
  };

  return (
    <form onSubmit={verify} style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 400, color: C.text, margin: '0 0 10px' }}>
          Check your texts
        </h2>
        <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
          We sent a 6-digit code to {phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={label} htmlFor="ms-code">Verification code</label>
        <input
          id="ms-code"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          style={{ ...inp, fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
          autoFocus
          onFocus={e => e.target.style.borderColor = C.lakeBlue}
          onBlur={e => e.target.style.borderColor = C.sand}
        />
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '15px', borderRadius: 28, border: 'none',
          background: loading ? `${C.lakeBlue}80` : C.lakeBlue,
          color: '#fff', fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Verifying...' : 'Open My Listing →'}
      </button>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
        >
          {resending ? 'Code resent!' : "Didn't get it? Resend"}
        </button>
      </div>
    </form>
  );
}

// ── Photo manager ──────────────────────────────────────────────
function PhotoManager({ photos, onChange, maxPhotos }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

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
    } catch { /* ignore upload errors silently */ }
    finally { setUploading(false); e.target.value = ''; }
  };

  const remove = (i) => onChange(photos.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        {photos.map((url, i) => (
          <div key={i} style={{ position: 'relative', width: 88, height: 88, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.sand}`, flexShrink: 0 }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.opacity = 0.3} />
            <button type="button" onClick={() => remove(i)} style={{ position: 'absolute', top: 3, right: 3, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 9, textAlign: 'center', padding: '2px 0', fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>MAIN</div>}
          </div>
        ))}
        {photos.length < maxPhotos && (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ width: 88, height: 88, borderRadius: 10, border: `1.5px dashed ${C.sand}`, background: C.warmWhite, color: C.textMuted, fontSize: 28, cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {uploading ? <span style={{ fontSize: 12, fontFamily: "'Libre Franklin', sans-serif" }}>Uploading...</span> : <>+<span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.3 }}>Add photo</span></>}
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <p style={{ fontSize: 12, color: C.textMuted, margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
        {photos.length}/{maxPhotos} photos. First photo is your main image. JPG or PNG, max 2MB each.
      </p>
    </div>
  );
}

// ── Availability calendar ──────────────────────────────────────
function AvailabilityCalendar({ listing }) {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null); // { from: Date }
  const [hovered, setHovered] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    fetch(`/api/stay-availability?pageId=${listing.pageId}`)
      .then(r => r.json())
      .then(d => setBlocked(d.blocked || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listing.pageId]);

  const isBlocked = useCallback((date) => {
    const d = date.toISOString().split('T')[0];
    return blocked.some(r => d >= r.from && d <= r.to);
  }, [blocked]);

  const findBlockedRange = (date) => {
    const d = date.toISOString().split('T')[0];
    return blocked.find(r => d >= r.from && d <= r.to);
  };

  const handleDayClick = async (date) => {
    if (date < new Date(new Date().toDateString())) return; // no past dates

    const range = findBlockedRange(date);
    if (range) {
      // Unblock this range
      setSaving(true);
      try {
        const res = await fetch('/api/stay-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pageId: listing.pageId, action: 'unblock', from: range.from, to: range.to, stayName: listing.name }),
        });
        const data = await res.json();
        if (data.ok) { setBlocked(data.blocked); setSaved('Dates unblocked - waitlist notified if applicable.'); }
      } catch { /* ignore */ }
      finally { setSaving(false); setTimeout(() => setSaved(''), 3000); }
      return;
    }

    if (!selecting) {
      setSelecting({ from: date });
    } else {
      const from = selecting.from <= date ? selecting.from : date;
      const to = selecting.from <= date ? date : selecting.from;
      setSelecting(null);
      setSaving(true);
      try {
        const res = await fetch('/api/stay-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: listing.pageId,
            action: 'block',
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0],
          }),
        });
        const data = await res.json();
        if (data.ok) { setBlocked(data.blocked); setSaved('Dates blocked.'); }
      } catch { /* ignore */ }
      finally { setSaving(false); setTimeout(() => setSaved(''), 3000); }
    }
  };

  const renderMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const days = [];
    const today = new Date(new Date().toDateString());

    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

    const inSelection = (date) => {
      if (!selecting || !hovered) return false;
      const a = selecting.from, b = hovered;
      const lo = a <= b ? a : b, hi = a <= b ? b : a;
      return date >= lo && date <= hi;
    };

    return (
      <div style={{ flex: 1, minWidth: 240 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 8, letterSpacing: 0.5 }}>{monthName}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} style={{ fontSize: 10, color: C.textMuted, textAlign: 'center', padding: '4px 0', fontFamily: "'Libre Franklin', sans-serif" }}>{d}</div>
          ))}
          {days.map((date, i) => {
            if (!date) return <div key={`e${i}`} />;
            const past = date < today;
            const blocked_ = isBlocked(date);
            const inSel = inSelection(date);
            const isFrom = selecting && date.toDateString() === selecting.from.toDateString();
            return (
              <button
                key={date.getDate()}
                type="button"
                disabled={past}
                onClick={() => handleDayClick(date)}
                onMouseEnter={() => selecting && setHovered(date)}
                style={{
                  padding: '6px 2px', borderRadius: 6, border: 'none', textAlign: 'center',
                  fontSize: 12, fontFamily: "'Libre Franklin', sans-serif",
                  cursor: past ? 'default' : 'pointer',
                  background: blocked_ ? '#FECACA' : inSel || isFrom ? `${C.lakeBlue}25` : 'transparent',
                  color: past ? C.textMuted : blocked_ ? '#B91C1C' : C.text,
                  fontWeight: isFrom ? 700 : 400,
                  transition: 'all 0.1s',
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const prevMonth = () => setViewMonth(v => {
    const m = v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 };
    return m;
  });
  const nextMonth = () => setViewMonth(v => {
    const m = v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 };
    return m;
  });
  const nextM = viewMonth.month === 11 ? { year: viewMonth.year + 1, month: 0 } : { year: viewMonth.year, month: viewMonth.month + 1 };

  if (loading) return <div style={{ fontSize: 13, color: C.textMuted, padding: '20px 0' }}>Loading calendar...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button type="button" onClick={prevMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: C.textLight, padding: '4px 8px' }}>‹</button>
        <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
          {renderMonth(viewMonth.year, viewMonth.month)}
          {renderMonth(nextM.year, nextM.month)}
        </div>
        <button type="button" onClick={nextMonth} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: C.textLight, padding: '4px 8px' }}>›</button>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: '#FECACA' }} />
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Blocked (click to unblock)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: `${C.lakeBlue}25` }} />
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Selection</span>
        </div>
      </div>
      {selecting && (
        <div style={{ fontSize: 13, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 8 }}>
          Start date selected. Click an end date to block the range.
        </div>
      )}
      {saving && <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Saving...</div>}
      {saved && <div style={{ fontSize: 13, color: '#166534', fontFamily: "'Libre Franklin', sans-serif" }}>{saved}</div>}
      <p style={{ fontSize: 12, color: C.textMuted, margin: '12px 0 0', fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.6 }}>
        Click any available date to start blocking a range, then click the end date. Click a blocked range (red) to unblock it - waitlist guests are auto-notified when dates open.
      </p>
    </div>
  );
}

// ── Step 3: Edit form ──────────────────────────────────────────
function StepEdit({ listing }) {
  const tierStatus = listing.tier || '';
  const isPaid = tierStatus !== 'Listed Free' && tierStatus !== 'New';
  const isFeatured = tierStatus === 'Listed Featured' || tierStatus === 'Listed Premium';
  const maxPhotos = isFeatured ? 10 : 5;

  const [form, setForm] = useState({
    name: listing.name || '',
    stayType: listing.stayType || '',
    address: listing.address || '',
    bookingUrl: listing.bookingUrl || '',
    website: listing.website || '',
    description: listing.description || '',
    phone: listing.phone || '',
    email: listing.email || '',
    beds: listing.beds ?? '',
    guests: listing.guests ?? '',
    amenities: listing.amenities || [],
    photos: listing.photos || [listing.photoUrl, listing.photoUrl2, listing.photoUrl3].filter(Boolean),
    pricePerNight: listing.pricePerNight || '',
    minStay: listing.minStay ?? '',
    checkIn: listing.checkIn || '',
    checkOut: listing.checkOut || '',
    houseRules: listing.houseRules || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };
  const toggleAmenity = (a) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
  }));

  const tierInfo = TIER_LABELS[listing.tier] || { label: listing.tier, color: C.textMuted };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Property name is required.'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/stays', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: listing.pageId, ...form, photos: form.photos }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setSaved(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    } catch { setError(yeti.network()); }
    finally { setSaving(false); }
  };

  const sectionHead = (text) => (
    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, fontWeight: 400, margin: '32px 0 16px', paddingBottom: 10, borderBottom: `1px solid ${C.sand}` }}>
      {text}
    </div>
  );

  const inputFocus = (e) => e.target.style.borderColor = C.lakeBlue;
  const inputBlur = (e) => e.target.style.borderColor = C.sand;

  return (
    <form onSubmit={save} style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.lakeBlue, marginBottom: 4 }}>
            Your listing
          </div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.text, margin: 0 }}>
            {listing.name}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: tierInfo.color, background: `${tierInfo.color}15`, padding: '5px 12px', borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif" }}>
            {tierInfo.label}
          </span>
          <a href="/stays" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: 'none', fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}>
            View live →
          </a>
        </div>
      </div>

      {saved && (
        <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '14px 18px', fontSize: 14, color: '#166534', marginBottom: 24, fontFamily: "'Libre Franklin', sans-serif" }}>
          Changes saved! Your listing is updated.
        </div>
      )}

      {/* Property basics */}
      {sectionHead('Property details')}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={label} htmlFor="ms-name">Property name</label>
          <input id="ms-name" style={inp} value={form.name} onChange={e => set('name', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div>
          <label style={label} htmlFor="ms-type">Type</label>
          <select id="ms-type" style={{ ...inp, appearance: 'none' }} value={form.stayType} onChange={e => set('stayType', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
            <option value="">Select type...</option>
            {STAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={label} htmlFor="ms-address">Address</label>
          <input id="ms-address" style={inp} value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Lake Dr, Manitou Beach" onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div>
          <label style={label} htmlFor="ms-beds">Bedrooms</label>
          <input id="ms-beds" type="number" min="1" max="20" style={inp} value={form.beds} onChange={e => set('beds', e.target.value)} placeholder="3" onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div>
          <label style={label} htmlFor="ms-guests">Max guests</label>
          <input id="ms-guests" type="number" min="1" max="50" style={inp} value={form.guests} onChange={e => set('guests', e.target.value)} placeholder="6" onFocus={inputFocus} onBlur={inputBlur} />
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={label} htmlFor="ms-desc">Description</label>
        <textarea
          id="ms-desc"
          style={{ ...inp, minHeight: 110, resize: 'vertical', lineHeight: 1.65 }}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Tell visitors what makes your place special..."
          onFocus={inputFocus}
          onBlur={inputBlur}
        />
      </div>

      {/* Amenities */}
      {sectionHead('Amenities')}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {AMENITY_OPTIONS.map(a => {
          const active = form.amenities.includes(a);
          return (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              style={{
                padding: '7px 16px', borderRadius: 20, border: `1.5px solid ${active ? C.lakeBlue : C.sand}`,
                background: active ? `${C.lakeBlue}12` : C.warmWhite,
                color: active ? C.lakeBlue : C.textLight,
                fontSize: 13, fontFamily: "'Libre Franklin', sans-serif",
                fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {a}
            </button>
          );
        })}
      </div>

      {/* Photos */}
      {sectionHead(`Photos (up to ${maxPhotos})`)}
      <PhotoManager photos={form.photos} onChange={urls => set('photos', urls)} maxPhotos={maxPhotos} />

      {/* Pricing & Policies */}
      {isPaid && (<>
        {sectionHead('Pricing & policies')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={label} htmlFor="ms-price">Price per night</label>
            <input id="ms-price" style={inp} value={form.pricePerNight} onChange={e => set('pricePerNight', e.target.value)} placeholder="e.g. From $150/night" onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div>
            <label style={label} htmlFor="ms-minstay">Minimum stay (nights)</label>
            <input id="ms-minstay" type="number" min="1" max="30" style={inp} value={form.minStay} onChange={e => set('minStay', e.target.value)} placeholder="e.g. 2" onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div>
            <label style={label} htmlFor="ms-checkin">Check-in time</label>
            <input id="ms-checkin" style={inp} value={form.checkIn} onChange={e => set('checkIn', e.target.value)} placeholder="e.g. 3:00 PM" onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div>
            <label style={label} htmlFor="ms-checkout">Check-out time</label>
            <input id="ms-checkout" style={inp} value={form.checkOut} onChange={e => set('checkOut', e.target.value)} placeholder="e.g. 11:00 AM" onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={label} htmlFor="ms-rules">House rules</label>
          <textarea id="ms-rules" style={{ ...inp, minHeight: 72, resize: 'vertical', lineHeight: 1.65 }} value={form.houseRules} onChange={e => set('houseRules', e.target.value)} placeholder="No smoking, pets by arrangement, quiet after 10pm..." onFocus={inputFocus} onBlur={inputBlur} />
        </div>
      </>)}

      {/* Links */}
      {sectionHead('Booking & contact')}
      <div style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={label} htmlFor="ms-booking">Booking URL <span style={{ color: C.textMuted, fontWeight: 400 }}>(Airbnb, VRBO, your site...)</span></label>
          <input id="ms-booking" style={inp} value={form.bookingUrl} onChange={e => set('bookingUrl', e.target.value)} placeholder="https://airbnb.com/rooms/..." onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div>
          <label style={label} htmlFor="ms-website">Website <span style={{ color: C.textMuted, fontWeight: 400 }}>(optional)</span></label>
          <input id="ms-website" style={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." onFocus={inputFocus} onBlur={inputBlur} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={label} htmlFor="ms-email">Contact email</label>
            <input id="ms-email" type="email" style={inp} value={form.email} onChange={e => set('email', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div>
            <label style={label} htmlFor="ms-phone">Contact phone</label>
            <input id="ms-phone" type="tel" style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          width: '100%', padding: '16px', borderRadius: 28, border: 'none',
          background: saving ? `${C.lakeBlue}80` : C.lakeBlue,
          color: '#fff', fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 14, fontWeight: 700, letterSpacing: 1.5,
          textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', marginTop: 8,
        }}
        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = C.lakeDark; }}
        onMouseLeave={e => { if (!saving) e.currentTarget.style.background = C.lakeBlue; }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {listing.tier !== 'Listed Featured' && listing.tier !== 'Listed Premium' && (
        <div style={{ textAlign: 'center', marginTop: 24, padding: '20px', background: `${C.sunset}08`, borderRadius: 12, border: `1px solid ${C.sunset}20` }}>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>
            Want top placement, a Staff Pick badge, and waitlist auto-notify?
          </div>
          <a
            href="/stays#list-property"
            style={{ fontSize: 13, fontWeight: 700, color: C.sunset, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}
          >
            Upgrade to Featured →
          </a>
        </div>
      )}
    </form>
  );
}

// ── Availability wrapper (shown below the edit form) ───────────
function ManageAvailability({ listing }) {
  const isPaid = listing.tier !== 'Listed Free' && listing.tier !== 'New';
  if (!isPaid || !listing.pageId) return null;

  const sectionHead = (text) => (
    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, fontWeight: 400, margin: '40px 0 16px', paddingBottom: 10, borderBottom: `1px solid ${C.sand}` }}>
      {text}
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 40 }}>
      {sectionHead('Availability calendar')}
      <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, marginBottom: 20 }}>
        Block dates when your property is booked. Visitors see your availability before they reach out - no more apologising for booked windows. When you unblock dates, anyone on your waitlist gets an automatic text.
      </p>
      <AvailabilityCalendar listing={listing} />
    </div>
  );
}

// ── Page shell ─────────────────────────────────────────────────
export default function ManageStayPage() {
  const [step, setStep] = useState('phone'); // phone | code | edit
  const [phone, setPhone] = useState('');
  const [listing, setListing] = useState(null);

  const scrollTo = (id) => { window.location.href = '/#' + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, minHeight: '100vh', color: C.text }}>
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />

      <div style={{ paddingTop: 100, paddingBottom: 80, minHeight: '80vh' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>

          {/* Step indicator */}
          {step !== 'edit' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 48 }}>
              {['phone', 'code'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif",
                    background: step === s ? C.lakeBlue : step === 'code' && s === 'phone' ? `${C.lakeBlue}30` : C.sand,
                    color: step === s ? '#fff' : step === 'code' && s === 'phone' ? C.lakeBlue : C.textMuted,
                    transition: 'all 0.3s',
                  }}>
                    {i + 1}
                  </div>
                  {i < 1 && <div style={{ width: 32, height: 1, background: C.sand }} />}
                </div>
              ))}
            </div>
          )}

          {step === 'phone' && (
            <StepPhone onSent={(digits) => { setPhone(digits); setStep('code'); }} />
          )}
          {step === 'code' && (
            <StepCode phone={phone} onVerified={(data) => { setListing(data); setStep('edit'); }} />
          )}
          {step === 'edit' && listing && (
            <>
              <StepEdit listing={listing} />
              <ManageAvailability listing={listing} />
            </>
          )}
        </div>
      </div>

      <Footer scrollTo={scrollTo} />
    </div>
  );
}
