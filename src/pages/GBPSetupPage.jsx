import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn } from '../components/Shared';
import SEOHead from '../components/SEOHead';

const CATEGORIES = [
  'Restaurant', 'Bar', 'Marina', 'Retail', 'Hotel', 'Vacation Rental',
  'Food Truck', 'Winery', 'Art Gallery', 'Beauty', 'Electrician',
  'Contractor', 'Real Estate', 'Service', 'Auto', 'Other',
];

export default function GBPSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillBusiness = searchParams.get('business') || '';
  const prefillSlug = searchParams.get('slug') || '';

  const [form, setForm] = useState({
    businessName: prefillBusiness,
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    category: '',
    website: '',
    hasGBP: 'Not Sure',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.businessName || !form.ownerName || !form.phone || !form.email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gbp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug: prefillSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 15px', borderRadius: 10,
    border: `1.5px solid ${C.sand}`, background: C.warmWhite,
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 15,
    color: C.text, boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.15s',
  };
  const labelStyle = {
    fontSize: 11, fontWeight: 800, letterSpacing: 1.8,
    textTransform: 'uppercase', color: C.textMuted,
    display: 'block', marginBottom: 7,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  const scrollTo = id => { window.location.href = '/#' + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
      <GlobalStyles />
      <style>{`
        .gbp-input:focus { border-color: ${C.lakeBlue} !important; background: #fff !important; }
        .gbp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 520px) { .gbp-row { grid-template-columns: 1fr; } }
        .gbp-radio { display: flex; gap: 10px; flex-wrap: wrap; }
        .gbp-radio label {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border-radius: 50px;
          border: 1.5px solid ${C.sand}; cursor: pointer;
          font-size: 14px; font-weight: 600; color: ${C.text};
          transition: border-color 0.15s, background 0.15s;
          background: ${C.warmWhite};
        }
        .gbp-radio label:has(input:checked) {
          border-color: ${C.sage}; background: ${C.sage}14; color: ${C.sageDark};
        }
        .gbp-radio input { display: none; }
      `}</style>

      <SEOHead
        title="Google Business Profile Setup - Manitou Beach"
        description="Get your Google Business Profile created and optimized by the Manitou Beach team. Included free with Premium listings."
        path="/gbp-setup"
      />

      <Navbar activeSection="" scrollTo={scrollTo} isSubPage />

      {/* Hero */}
      <div style={{
        background: `linear-gradient(145deg, ${C.lakeDark} 0%, ${C.dusk} 60%, #0A1A24 100%)`,
        paddingTop: 96, paddingBottom: 60, paddingLeft: 20, paddingRight: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: `${C.lakeBlue}18`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: `${C.sage}12`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Included with Premium</span>
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
            Google Business Profile Setup
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 0 32px', maxWidth: 520 }}>
            We create and optimize your Google Business Profile so your business shows up when people search locally. You get found on Google Maps, pull in reviews automatically, and look legitimate before a customer even calls.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Shows up on Google Maps', 'Reviews pull into your profile', 'Verified local business badge', 'Free with Premium listing'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7A8E72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form or success */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px 100px' }}>
        {submitted ? (
          <FadeIn>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: `${C.sage}18`, border: `2px solid ${C.sage}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 700, color: C.dusk, margin: '0 0 12px' }}>
                Got it - we're on it.
              </h2>
              <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.75, maxWidth: 440, margin: '0 auto 32px' }}>
                We'll reach out within a day or two to get the process going. Keep an eye on your phone - Google usually needs the owner to verify by phone or postcard.
              </p>
              <button
                onClick={() => navigate(prefillSlug ? `/business/${prefillSlug}` : '/business')}
                style={{
                  background: C.sage, color: '#fff', border: 'none', borderRadius: 50,
                  padding: '14px 32px', cursor: 'pointer', fontSize: 15, fontWeight: 700,
                  fontFamily: "'Libre Franklin', sans-serif",
                  boxShadow: `0 4px 14px ${C.sage}45`,
                }}
              >
                Back to your profile
              </button>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', padding: '36px 32px', borderTop: `3px solid ${C.lakeBlue}` }}>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: C.dusk, margin: '0 0 6px' }}>
                Tell us about your business
              </h2>
              <p style={{ fontSize: 14, color: C.textMuted, margin: '0 0 28px', lineHeight: 1.6 }}>
                We'll handle the setup. You just need to verify ownership when Google contacts you.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div className="gbp-row">
                  <div>
                    <label style={labelStyle}>Business Name *</label>
                    <input className="gbp-input" required style={inputStyle}
                      placeholder="Hammill Electric"
                      value={form.businessName}
                      onChange={e => set('businessName', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Your Name *</label>
                    <input className="gbp-input" required style={inputStyle}
                      placeholder="First and last name"
                      value={form.ownerName}
                      onChange={e => set('ownerName', e.target.value)} />
                  </div>
                </div>

                <div className="gbp-row">
                  <div>
                    <label style={labelStyle}>Phone *</label>
                    <input className="gbp-input" required type="tel" style={inputStyle}
                      placeholder="Best number to reach you"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input className="gbp-input" required type="email" style={inputStyle}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => set('email', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Business Address</label>
                  <input className="gbp-input" style={inputStyle}
                    placeholder="Street address where customers find you"
                    value={form.address}
                    onChange={e => set('address', e.target.value)} />
                </div>

                <div className="gbp-row">
                  <div>
                    <label style={labelStyle}>Category</label>
                    <select className="gbp-input" style={{ ...inputStyle, cursor: 'pointer' }}
                      value={form.category}
                      onChange={e => set('category', e.target.value)}>
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Website (if any)</label>
                    <input className="gbp-input" type="text" style={inputStyle}
                      placeholder="yoursite.com"
                      value={form.website}
                      onChange={e => set('website', e.target.value)} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Do you already have a Google Business Profile?</label>
                  <div className="gbp-radio">
                    {['No', 'Not Sure', 'Yes'].map(opt => (
                      <label key={opt}>
                        <input type="radio" name="hasGBP" value={opt}
                          checked={form.hasGBP === opt}
                          onChange={() => set('hasGBP', opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {form.hasGBP === 'Yes' && (
                    <p style={{ margin: '10px 0 0', fontSize: 13, color: C.textMuted, lineHeight: 1.6, background: C.warmWhite, borderRadius: 8, padding: '10px 14px', border: `1px solid ${C.sand}` }}>
                      No problem - we can claim and optimize your existing profile instead of creating a new one.
                    </p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Anything else we should know?</label>
                  <textarea className="gbp-input" style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                    placeholder="Service area, special hours, anything you want on the profile..."
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)} />
                </div>

                {error && (
                  <p style={{ margin: 0, fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 8, padding: '12px 16px' }}>
                    {error}
                  </p>
                )}

                <button type="submit" disabled={loading} style={{
                  background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 50,
                  padding: '16px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Libre Franklin', sans-serif", marginTop: 4,
                  opacity: loading ? 0.7 : 1,
                  boxShadow: `0 4px 16px ${C.lakeBlue}45`,
                  transition: 'opacity 0.15s, box-shadow 0.15s',
                }}>
                  {loading ? 'Submitting...' : 'Request GBP Setup'}
                </button>

                <p style={{ margin: 0, fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
                  We'll reach out within 1-2 business days. Google verification (postcard or phone) is the only step you need to handle yourself.
                </p>
              </form>
            </div>
          </FadeIn>
        )}
      </div>

      <Footer />
    </div>
  );
}
