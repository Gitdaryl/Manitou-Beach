import { useState } from 'react';
import { C } from '../data/config';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';
import yeti from '../data/errorMessages';

export default function ActivateWineryPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const venueName = params.get('venue') || '';
  const joined = params.get('joined') === '1';

  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactName.trim()) { setError('Your name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('A valid email is required.'); return; }
    if (!venueName) { setError('Missing venue name — check your link.'); return; }
    setError('');
    setStatus('submitting');
    try {
      const res = await fetch('/api/wine-partner-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueName,
          contactName: contactName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          note: 'Activated via /activate-winery link',
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || yeti.oops());
        setStatus('idle');
      }
    } catch {
      setError(yeti.network());
      setStatus('idle');
    }
  };

  // ── Success state ──
  if (joined) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
        <GlobalStyles />
        <Navbar isSubPage />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
        }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 48, color: C.sunset, margin: '0 0 12px' }}>
            You're on the trail!
          </p>
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.text, margin: '0 0 16px', fontWeight: 400 }}>
            {venueName ? decodeURIComponent(venueName) : 'Your venue'} is locked in for 2026.
          </p>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textLight, maxWidth: 420, lineHeight: 1.7, margin: '0 0 32px' }}>
            Daryl will be in touch within a day or two to confirm enrollment and coordinate your passport card delivery. Check your email for a receipt from Stripe.
          </p>
          <a href="/wineries" style={{
            display: 'inline-block', background: C.sunset, color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 12,
            letterSpacing: 2.5, textTransform: 'uppercase', padding: '13px 28px',
            borderRadius: 4, textDecoration: 'none',
          }}>
            See the Wine Trail
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Activation form ──
  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 6,
    border: '1px solid #C4B498', fontSize: 15,
    fontFamily: "'Libre Franklin', sans-serif", color: C.text,
    background: '#FAF6EF', boxSizing: 'border-box', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
    textTransform: 'uppercase', color: C.textMuted, marginBottom: 6,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: C.cream }}>
      <GlobalStyles />
      <Navbar isSubPage />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: 3.5, textTransform: 'uppercase', color: C.sunsetLight, margin: '0 0 12px',
          }}>
            Manitou Beach Wine Trail · 2026
          </p>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400,
            color: C.text, margin: '0 0 12px', lineHeight: 1.2,
          }}>
            {venueName ? decodeURIComponent(venueName) : 'Your Venue'}
          </h1>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textLight,
            lineHeight: 1.7, maxWidth: 420, margin: '0 auto',
          }}>
            Your tasting room is already on the Manitou Beach wine trail. Complete your enrollment to lock in your spot for the 2026 season.
          </p>
        </div>

        {/* Pricing badge */}
        <div style={{
          background: C.dusk, borderRadius: 12, padding: '20px 24px',
          marginBottom: 28, border: '2px solid rgba(212,132,90,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, fontWeight: 700, color: C.cream }}>$279</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>for the full 2026 season</span>
          </div>
          <div style={{ fontSize: 12, color: C.sage, fontWeight: 600, letterSpacing: 0.5 }}>
            May 22 – October 31 · One-time charge · Everything included
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px',
            marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            {[
              'Trail map pin', 'Live scorecard',
              '100 passport cards', 'QR setup + delivery',
              'Season-end award', 'Year-round listing',
              '2 ceremony seats included', '50% off extra ceremony tickets',
            ].map(item => (
              <div key={item} style={{
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12,
                color: 'rgba(255,255,255,0.55)', padding: '3px 0',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: C.sage, fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle} htmlFor="aw-name">Your Name *</label>
              <input
                id="aw-name" type="text" placeholder="First + last"
                value={contactName} onChange={e => setContactName(e.target.value)}
                style={inputStyle} disabled={status === 'submitting'}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="aw-phone">Phone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                id="aw-phone" type="tel" placeholder="(555) 555-5555"
                value={phone} onChange={e => setPhone(e.target.value)}
                style={inputStyle} disabled={status === 'submitting'}
              />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle} htmlFor="aw-email">Email *</label>
            <input
              id="aw-email" type="email" placeholder="you@yourvenue.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} disabled={status === 'submitting'} autoComplete="email"
            />
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, margin: '5px 0 0' }}>
              Receipt and enrollment confirmation go here
            </p>
          </div>

          {error && (
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.sunset, margin: '0 0 14px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              width: '100%', padding: '14px',
              background: status === 'submitting' ? 'rgba(212,132,90,0.5)' : C.sunset,
              color: C.cream, border: 'none', borderRadius: 6,
              fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
              fontSize: 13, letterSpacing: 2.5, textTransform: 'uppercase',
              cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'submitting' ? 'Redirecting to checkout...' : 'Join the 2026 Trail — $279'}
          </button>

          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted,
            textAlign: 'center', margin: '12px 0 0', lineHeight: 1.6,
          }}>
            Secure Stripe checkout · One-time charge for the full season · No subscription
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
}
