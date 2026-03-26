import React, { useState } from 'react';
import { Btn, FadeIn, SectionLabel, SectionTitle } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import yeti from '../data/errorMessages';

const TIERS = {
  enhanced: { label: 'Showcased',        price: 9,  annual: 108, description: 'Clickable website link, business description, expandable listing card.' },
  featured: { label: 'Highlighted',      price: 25, annual: 300, description: 'Spotlight card, logo display, above standard listings.' },
  premium:  { label: 'Front and Center', price: 49, annual: 588, description: 'Full-width banner, large logo, top-of-directory placement, email contact button.' },
};

const TIER_ORDER = ['enhanced', 'featured', 'premium'];

function inputStyle(focused) {
  return {
    width: '100%', padding: '12px 16px', borderRadius: 6, boxSizing: 'border-box',
    border: `1.5px solid ${focused ? C.sage : C.sand}`,
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text,
    background: C.cream, outline: 'none', transition: 'border-color 0.2s',
  };
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || label}
      type={type}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(focused)}
    />
  );
}

export default function UpgradeListingPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const successParam = params.get('success') === 'true';
  const returnedBiz = params.get('business') || '';
  const returnedTier = params.get('tier') || '';

  const [step, setStep] = useState(1);
  const [verifyName, setVerifyName] = useState(params.get('business') || '');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [business, setBusiness] = useState(null); // { name, email, tier }
  const [selectedTier, setSelectedTier] = useState('');
  const [billing, setBilling] = useState('month');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  async function handleVerify(e) {
    e.preventDefault();
    if (!verifyName.trim() || !verifyEmail.trim()) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch(`/api/upgrade-listing?name=${encodeURIComponent(verifyName.trim())}&email=${encodeURIComponent(verifyEmail.trim().toLowerCase())}`);
      const data = await res.json();
      if (data.found) {
        setBusiness({ name: data.businessName, email: verifyEmail.trim().toLowerCase(), tier: data.tier });
        setStep(2);
      } else {
        setVerifyError("We couldn't find an active subscription listing for that name and email. Need help? Email us at hello@yetigroove.com.");
      }
    } catch {
      setVerifyError(yeti.network());
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleUpgrade(tierKey) {
    setSelectedTier(tierKey);
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/upgrade-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: business.name,
          email: business.email,
          currentTier: business.tier,
          newTier: tierKey,
          billingInterval: billing,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || yeti.oops());
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError(yeti.network());
      setCheckoutLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────
  if (successParam) {
    const tierLabel = TIERS[returnedTier]?.label || 'upgraded';
    return (
      <>
        <GlobalStyles />
        <Navbar />
        <main style={{ minHeight: '100vh', background: C.cream, paddingTop: 80 }}>
          <section style={{ background: C.warmWhite, padding: '80px 24px 100px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              <FadeIn>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: `${C.sage}20`, border: `2px solid ${C.sage}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', fontSize: 26, color: C.sage,
                }}>✓</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.text, marginBottom: 12, fontWeight: 400 }}>
                  You're moving up.
                </div>
                <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, margin: '0 0 8px', fontFamily: "'Libre Franklin', sans-serif" }}>
                  <strong>{decodeURIComponent(returnedBiz)}</strong> is now {tierLabel} on Manitou Beach.
                </p>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: '0 0 36px', fontFamily: "'Libre Franklin', sans-serif" }}>
                  Check your email for confirmation. Your previous subscription will be cancelled automatically — nothing extra to do.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Btn href="/business" variant="primary">See all local businesses</Btn>
                  <Btn href="/update-listing" variant="outline">Update listing info</Btn>
                </div>
              </FadeIn>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // ── Main page ──────────────────────────────────────────────
  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main style={{ minHeight: '100vh', background: C.cream, paddingTop: 80 }}>
        <section style={{ background: C.warmWhite, padding: '80px 24px 100px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <FadeIn>
              <SectionLabel>Your Listing</SectionLabel>
              <SectionTitle>Ready for more visibility?</SectionTitle>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.75, marginBottom: 40 }}>
                Upgrading takes about two minutes. Enter your business name and email and we'll show you exactly what's available.
              </p>

              {/* ── Step 1: verify ───────────────────────────── */}
              {step === 1 && (
                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Business Name" value={verifyName} onChange={setVerifyName} placeholder="Same name you used when you signed up" />
                  <Field label="Email Address" value={verifyEmail} onChange={setVerifyEmail} type="email" placeholder="Email address from your original signup" />
                  {verifyError && (
                    <p style={{ fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px', margin: 0 }}>
                      {verifyError}
                    </p>
                  )}
                  <Btn variant="primary" style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                    {verifyLoading ? 'Looking…' : 'Show my options →'}
                  </Btn>
                </form>
              )}

              {/* ── Step 2: choose upgrade ───────────────────── */}
              {step === 2 && business && (
                <div>
                  <div style={{ background: `${C.sage}15`, border: `1px solid ${C.sage}40`, borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
                    <p style={{ margin: 0, fontSize: 14, color: C.sageDark, fontFamily: "'Libre Franklin', sans-serif" }}>
                      Upgrading: <strong>{business.name}</strong> · Currently <strong>{TIERS[business.tier]?.label || business.tier}</strong>
                    </p>
                  </div>

                  {/* Billing toggle */}
                  <div style={{ display: 'flex', marginBottom: 24, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.sand}` }}>
                    {[
                      { key: 'month', label: 'Monthly' },
                      { key: 'year', label: 'Annual — pay once' },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setBilling(opt.key)}
                        style={{
                          flex: 1, padding: '12px', border: 'none', cursor: 'pointer',
                          background: billing === opt.key ? C.dusk : C.cream,
                          color: billing === opt.key ? C.cream : C.text,
                          fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600,
                          transition: 'background 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Upgrade tier cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                    {TIER_ORDER.filter(t => TIER_ORDER.indexOf(t) > TIER_ORDER.indexOf(business.tier)).map(tierKey => {
                      const t = TIERS[tierKey];
                      const price = billing === 'year' ? `$${t.annual}/yr` : `$${t.price}/mo`;
                      const isLoading = checkoutLoading && selectedTier === tierKey;
                      return (
                        <button
                          key={tierKey}
                          type="button"
                          onClick={() => handleUpgrade(tierKey)}
                          disabled={checkoutLoading}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '18px 20px', borderRadius: 8,
                            cursor: checkoutLoading ? 'not-allowed' : 'pointer',
                            border: `1.5px solid ${C.sage}40`,
                            background: C.warmWhite, textAlign: 'left',
                            opacity: checkoutLoading && selectedTier !== tierKey ? 0.5 : 1,
                            transition: 'border-color 0.2s',
                          }}
                          onMouseEnter={e => { if (!checkoutLoading) e.currentTarget.style.borderColor = C.sage; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = `${C.sage}40`; }}
                        >
                          <div>
                            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 4 }}>
                              {t.label}
                            </div>
                            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textLight, lineHeight: 1.5 }}>
                              {t.description}
                            </div>
                          </div>
                          <div style={{ flexShrink: 0, marginLeft: 20, textAlign: 'right' }}>
                            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontWeight: 700, color: C.text }}>
                              {isLoading ? '…' : price}
                            </div>
                            {!isLoading && (
                              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.sage, fontWeight: 600, marginTop: 2 }}>
                                Upgrade →
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {checkoutError && (
                    <p style={{ fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px', margin: '0 0 16px' }}>
                      {checkoutError}
                    </p>
                  )}

                  <button type="button" onClick={() => setStep(1)} style={{
                    background: 'none', border: 'none', fontSize: 13, color: C.textMuted,
                    cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0,
                  }}>
                    ← Start over
                  </button>
                </div>
              )}
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
