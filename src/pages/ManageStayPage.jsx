import React, { useState } from 'react';
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

// ── Step 3: Edit form ──────────────────────────────────────────
function StepEdit({ listing }) {
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
    photoUrl: listing.photoUrl || '',
    photoUrl2: listing.photoUrl2 || '',
    photoUrl3: listing.photoUrl3 || '',
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
        body: JSON.stringify({ pageId: listing.pageId, ...form }),
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
      {sectionHead('Photos')}
      <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
        Paste direct image URLs. Use Airbnb, your website, or upload to{' '}
        <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" style={{ color: C.lakeBlue }}>imgur.com</a> and paste the link.
      </p>
      {['photoUrl', 'photoUrl2', 'photoUrl3'].map((field, i) => (
        <div key={field} style={{ marginBottom: 12 }}>
          <label style={label} htmlFor={`ms-${field}`}>Photo {i + 1}{i === 0 ? ' (main)' : ' (optional)'}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id={`ms-${field}`}
              style={{ ...inp, flex: 1 }}
              value={form[field]}
              onChange={e => set(field, e.target.value)}
              placeholder="https://..."
              onFocus={inputFocus}
              onBlur={inputBlur}
            />
            {form[field] && (
              <img
                src={form[field]}
                alt=""
                style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: `1px solid ${C.sand}`, flexShrink: 0 }}
                onError={e => e.target.style.display = 'none'}
              />
            )}
          </div>
        </div>
      ))}

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
            Want top placement, a Staff Pick badge, and newsletter features?
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
            <StepEdit listing={listing} />
          )}
        </div>
      </div>

      <Footer scrollTo={scrollTo} />
    </div>
  );
}
