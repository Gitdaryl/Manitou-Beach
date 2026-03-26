import { useState } from 'react';
import { C } from '../data/config';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';

const TIERS = {
  enhanced: { label: 'Showcased', price: 9, annual: 108 },
  featured: { label: 'Highlighted', price: 25, annual: 300 },
  premium:  { label: 'Front and Center', price: 49, annual: 588 },
};

export default function ActivateBusinessPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const businessName = params.get('business') || '';
  const tierKey = params.get('tier') || 'enhanced';
  const success = params.get('success') === 'true';

  const tier = TIERS[tierKey] || TIERS.enhanced;

  const [email, setEmail] = useState('');
  const [billing, setBilling] = useState('month'); // 'month' | 'year'
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) { setError('A valid email is required.'); return; }
    if (!businessName) { setError('Missing business name — check your link.'); return; }
    setError('');
    setStatus('submitting');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierKey,
          businessName,
          email: email.trim().toLowerCase(),
          mode: 'subscription',
          isBeta: true,
          billingInterval: billing,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('idle');
      }
    } catch {
      setError('Unable to connect. Please try again.');
      setStatus('idle');
    }
  };

  // ── Success state ──
  if (success) {
    const returnedBiz = params.get('business') || 'Your business';
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
        <GlobalStyles />
        <Navbar isSubPage />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
        }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 48, color: C.sunset, margin: '0 0 12px' }}>
            You're all set!
          </p>
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.text, margin: '0 0 16px', fontWeight: 400 }}>
            {decodeURIComponent(returnedBiz)} is activated.
          </p>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textLight, maxWidth: 420, lineHeight: 1.7, margin: '0 0 32px' }}>
            Check your email for a confirmation from us. You can cancel or manage your listing anytime — just reply to the email.
          </p>
          <a href="/" style={{
            display: 'inline-block', background: C.sunset, color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 12,
            letterSpacing: 2.5, textTransform: 'uppercase', padding: '13px 28px',
            borderRadius: 4, textDecoration: 'none',
          }}>
            Explore the Site
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
            Activate Your Listing
          </p>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400,
            color: C.text, margin: '0 0 12px', lineHeight: 1.2,
          }}>
            {businessName ? decodeURIComponent(businessName) : 'Your Business'}
          </h1>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textLight,
            lineHeight: 1.7, maxWidth: 400, margin: '0 auto',
          }}>
            Your listing is already live on Manitou Beach. Add your payment info to keep it active — you won't be charged until May 10.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 28, borderRadius: 8, overflow: 'hidden',
          border: '1px solid #C4B498',
        }}>
          {[
            { key: 'month', label: `$${tier.price}/mo`, sub: 'Monthly' },
            { key: 'year', label: `$${tier.annual}/yr`, sub: 'Annual — pay once' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setBilling(opt.key)}
              style={{
                flex: 1, padding: '14px 12px', border: 'none', cursor: 'pointer',
                background: billing === opt.key ? C.dusk : C.cream,
                color: billing === opt.key ? C.cream : C.text,
                fontFamily: "'Libre Franklin', sans-serif",
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{opt.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        {/* Selected plan badge */}
        <div style={{
          background: '#F0F7FB', border: '1px solid rgba(91,126,149,0.2)',
          borderRadius: 8, padding: '14px 18px', marginBottom: 24,
        }}>
          <div style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 2, textTransform: 'uppercase', color: C.lakeBlue, marginBottom: 4,
          }}>
            {tier.label} Listing — {billing === 'year' ? 'Annual' : 'Monthly'}
          </div>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textLight }}>
            Free through May 10 · then {billing === 'year' ? `$${tier.annual}/yr` : `$${tier.price}/mo`} · cancel anytime
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle} htmlFor="act-email">Your Email</label>
            <input
              id="act-email"
              type="email"
              placeholder="you@yourbusiness.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              disabled={status === 'submitting'}
              autoComplete="email"
            />
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, margin: '5px 0 0' }}>
              Stripe receipts and listing updates go here
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
            {status === 'submitting' ? 'Redirecting to checkout...' : 'Continue to Checkout'}
          </button>

          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted,
            textAlign: 'center', margin: '12px 0 0', lineHeight: 1.6,
          }}>
            Secured by Stripe · Card stored, not charged until May 10 · Cancel before then for zero cost
          </p>
        </form>
      </div>

      <Footer />
    </div>
  );
}
