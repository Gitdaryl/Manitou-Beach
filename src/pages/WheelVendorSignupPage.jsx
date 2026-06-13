import { useState, useRef } from 'react';
import { C } from '../data/config';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';

const WHEEL_COLORS = [
  { hex: '#D4845A', label: 'Sunset'   },
  { hex: '#7A8E72', label: 'Sage'     },
  { hex: '#5B7E95', label: 'Lake'     },
  { hex: '#9b59b6', label: 'Grape'    },
  { hex: '#e74c3c', label: 'Cherry'   },
  { hex: '#f39c12', label: 'Amber'    },
];

const MAX_LABEL_CHARS = 32;

export default function WheelVendorSignupPage() {
  const [form, setForm] = useState({
    contactName: '',
    businessName: '',
    email: '',
    phone: '',
    dealLabel: '',
    dealDescription: '',
    dealColor: '#D4845A',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { statsUrl }
  const fileRef = useRef();

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  async function handleLogoFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Image must be under 2MB.');
      return;
    }
    setLogoError('');
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          filename: file.name,
          contentType: file.type,
          data: base64,
          folder: 'sponsors',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
      setLogoUrl(data.url);
    } catch (err) {
      setLogoError('Logo upload failed. You can skip it for now and we can add it later.');
      setLogoPreview('');
      setLogoFile(null);
    } finally {
      setLogoUploading(false);
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoFile(file);
  }

  async function handleSubmit() {
    setError('');
    if (!form.contactName.trim()) return setError('Please enter your name.');
    if (!form.businessName.trim()) return setError('Please enter your business name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Please enter a valid email.');
    if (!form.dealLabel.trim()) return setError('Please enter your offer.');

    setSubmitting(true);
    try {
      const res = await fetch('/api/prize-wheel/vendor-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: form.email.trim().toLowerCase(),
          logoUrl: logoUrl || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess({ statsUrl: data.statsUrl });
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again or email hello@manitoubeachmichigan.com');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: `1.5px solid ${C.sand}`,
    background: '#fff',
    color: C.text,
    fontSize: 15,
    fontFamily: "'Libre Franklin', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: C.warmGray,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 6,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  const sectionStyle = {
    background: '#fff',
    borderRadius: 14,
    border: `1.5px solid ${C.sand}`,
    padding: '24px 24px 20px',
    marginBottom: 16,
  };

  const sectionHeadStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: C.dusk,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 18,
    fontFamily: "'Libre Franklin', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  if (success) {
    return (
      <>
        <GlobalStyles />
        <Navbar />
        <div style={{ minHeight: '100vh', background: C.cream, paddingTop: 80 }}>
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px 80px' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎡</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: C.night, margin: '0 0 10px', fontFamily: "'Playfair Display', serif" }}>
                You're on the list!
              </h1>
              <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                Daryl will review your application and activate your wheel slot within 24 hours.
                You'll get an email the moment you go live - plus your vendor PIN to redeem prizes.
              </p>
            </div>

            <div style={{ ...sectionStyle, textAlign: 'center' }}>
              <p style={{ ...labelStyle, textAlign: 'center', marginBottom: 10 }}>Next step</p>
              <p style={{ color: C.textLight, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
                Keep an eye on your inbox. Daryl will send your vendor PIN and dashboard link once you're live.
                In the meantime, think about where you'd put the "Spin to Win" QR sign at your counter.
              </p>
              <div style={{
                padding: '16px 20px',
                background: C.cream,
                borderRadius: 10,
                border: `1px solid ${C.sand}`,
                color: C.textLight,
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                <strong style={{ color: C.dusk }}>Free trial:</strong> 60 days, no credit card needed.
                We'll email your numbers before the trial ends so you know what you're getting before any conversation about continuing.
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  background: C.sunset,
                  color: '#fff',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 15,
                  fontFamily: "'Libre Franklin', sans-serif",
                }}
              >
                Back to Manitou Beach
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <GlobalStyles />
      <Navbar />
      <div style={{ minHeight: '100vh', background: C.cream, paddingTop: 80 }}>

        {/* Hero */}
        <div style={{
          background: `linear-gradient(135deg, ${C.night} 0%, ${C.dusk} 100%)`,
          padding: '48px 24px 40px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎡</div>
          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 38px)',
            fontWeight: 800,
            margin: '0 0 12px',
            fontFamily: "'Playfair Display', serif",
            lineHeight: 1.2,
          }}>
            Get your business on<br />the Spin to Win wheel
          </h1>
          <p style={{ fontSize: 16, opacity: 0.8, margin: '0 auto', maxWidth: 480, lineHeight: 1.6 }}>
            Manitou Beach visitors spin the wheel for a chance to win your offer.
            They collect it as a QR code, then redeem it when they visit you.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 20,
            background: 'rgba(212,132,90,0.25)',
            border: '1px solid rgba(212,132,90,0.5)',
            borderRadius: 999,
            padding: '8px 18px',
          }}>
            <span style={{ fontSize: 14, color: C.sunsetLight, fontWeight: 600 }}>
              Free 60-day trial - no credit card needed
            </span>
          </div>
        </div>

        {/* Form */}
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 80px' }}>

          {/* Contact */}
          <div style={sectionStyle}>
            <div style={sectionHeadStyle}>
              <span style={{ color: C.sunset }}>01</span> About you
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Your name *</label>
                <input
                  style={inputStyle}
                  placeholder="Jane Smith"
                  value={form.contactName}
                  onChange={e => set('contactName', e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.sunset}
                  onBlur={e => e.target.style.borderColor = C.sand}
                />
              </div>
              <div>
                <label style={labelStyle}>Business name *</label>
                <input
                  style={inputStyle}
                  placeholder="The Crow Bar"
                  value={form.businessName}
                  onChange={e => set('businessName', e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.sunset}
                  onBlur={e => e.target.style.borderColor = C.sand}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="jane@thecrowbar.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.sunset}
                  onBlur={e => e.target.style.borderColor = C.sand}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone <span style={{ color: C.textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="(517) 555-0100"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  onFocus={e => e.target.style.borderColor = C.sunset}
                  onBlur={e => e.target.style.borderColor = C.sand}
                />
              </div>
            </div>
          </div>

          {/* Offer */}
          <div style={sectionStyle}>
            <div style={sectionHeadStyle}>
              <span style={{ color: C.sunset }}>02</span> Your offer
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                What will visitors win? *{' '}
                <span style={{ color: C.textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                  ({MAX_LABEL_CHARS} chars max - this appears on the wheel)
                </span>
              </label>
              <input
                style={inputStyle}
                placeholder="Free scoop with any purchase"
                value={form.dealLabel}
                maxLength={MAX_LABEL_CHARS}
                onChange={e => set('dealLabel', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.sunset}
                onBlur={e => e.target.style.borderColor = C.sand}
              />
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, textAlign: 'right' }}>
                {form.dealLabel.length}/{MAX_LABEL_CHARS}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                Fine print{' '}
                <span style={{ color: C.textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional - dine-in only, one per visit, etc.)</span>
              </label>
              <textarea
                style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                placeholder="Dine-in only. One per customer per visit. Cannot be combined with other offers."
                value={form.dealDescription}
                onChange={e => set('dealDescription', e.target.value)}
                onFocus={e => e.target.style.borderColor = C.sunset}
                onBlur={e => e.target.style.borderColor = C.sand}
              />
            </div>

            <div>
              <label style={labelStyle}>Wheel segment color</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {WHEEL_COLORS.map(({ hex, label }) => (
                  <button
                    key={hex}
                    title={label}
                    onClick={() => set('dealColor', hex)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: hex,
                      border: form.dealColor === hex ? `3px solid ${C.night}` : '3px solid transparent',
                      cursor: 'pointer',
                      outline: form.dealColor === hex ? `2px solid ${hex}` : 'none',
                      outlineOffset: 2,
                      transition: 'transform 0.1s',
                    }}
                  />
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.textMuted, margin: '8px 0 0' }}>
                This is the color of your segment on the wheel. Pick whatever matches your brand.
              </p>
            </div>
          </div>

          {/* Logo */}
          <div style={sectionStyle}>
            <div style={sectionHeadStyle}>
              <span style={{ color: C.sunset }}>03</span> Logo
              <span style={{ color: C.textMuted, fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>(optional)</span>
            </div>

            {logoPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 10, border: `1px solid ${C.sand}`, background: '#fff', padding: 4 }}
                />
                <div>
                  {logoUploading && <p style={{ color: C.textMuted, fontSize: 13, margin: '0 0 6px' }}>Uploading...</p>}
                  {logoUrl && <p style={{ color: C.sage, fontSize: 13, margin: '0 0 6px' }}>Uploaded!</p>}
                  {logoError && <p style={{ color: '#c0392b', fontSize: 12, margin: '0 0 6px' }}>{logoError}</p>}
                  <button
                    onClick={() => { setLogoFile(null); setLogoPreview(''); setLogoUrl(''); setLogoError(''); }}
                    style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 12, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? C.sunset : C.driftwood}`,
                  borderRadius: 12,
                  padding: '32px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'rgba(212,132,90,0.05)' : C.cream,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>🖼</div>
                <p style={{ color: C.textLight, fontSize: 14, margin: '0 0 4px' }}>
                  Drop your logo here or <span style={{ color: C.sunset, fontWeight: 600 }}>click to browse</span>
                </p>
                <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>JPG, PNG, WebP - max 2MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleLogoFile(e.target.files?.[0])}
            />
            {logoError && !logoPreview && (
              <p style={{ color: '#c0392b', fontSize: 12, margin: '8px 0 0' }}>{logoError}</p>
            )}
            <p style={{ color: C.textMuted, fontSize: 12, margin: '10px 0 0', lineHeight: 1.5 }}>
              Shows on the coupon email your customers receive. Skip for now and we can add it later.
            </p>
          </div>

          {/* What's next info box */}
          <div style={{
            background: `linear-gradient(135deg, rgba(91,126,149,0.08), rgba(212,132,90,0.08))`,
            border: `1.5px solid ${C.sand}`,
            borderRadius: 14,
            padding: '20px 22px',
            marginBottom: 20,
          }}>
            <p style={{ fontWeight: 700, color: C.dusk, fontSize: 13, margin: '0 0 10px' }}>What happens after you submit</p>
            <ol style={{ margin: 0, paddingLeft: 18, color: C.textLight, fontSize: 13, lineHeight: 1.8 }}>
              <li>Daryl reviews your application (usually within a few hours)</li>
              <li>You get an email with your vendor PIN - give it to your staff</li>
              <li>Your offer goes live on the wheel - visitors start spinning</li>
              <li>When someone wins, they get a QR coupon by email and SMS</li>
              <li>They visit your business, staff scans the QR and enters the PIN to redeem</li>
              <li>You get a weekly report showing spins, wins, and redemptions</li>
            </ol>
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.08)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 16,
              color: '#c0392b',
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || logoUploading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 12,
              border: 'none',
              background: submitting ? C.driftwood : C.sunset,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: submitting || logoUploading ? 'not-allowed' : 'pointer',
              fontFamily: "'Libre Franklin', sans-serif",
              transition: 'background 0.2s, transform 0.1s',
              boxShadow: submitting ? 'none' : '0 4px 16px rgba(212,132,90,0.35)',
            }}
            onMouseEnter={e => { if (!submitting) e.target.style.background = '#c0735a'; }}
            onMouseLeave={e => { if (!submitting) e.target.style.background = C.sunset; }}
          >
            {logoUploading ? 'Uploading logo...' : submitting ? 'Submitting...' : 'Submit my application'}
          </button>

          <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 12, margin: '14px 0 0', lineHeight: 1.5 }}>
            Free for 60 days. No credit card needed to start.
            We'll email your performance numbers before the trial ends.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
