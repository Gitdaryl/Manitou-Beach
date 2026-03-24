import React, { useState, useRef } from 'react';
import { Btn, FadeIn, SectionLabel, SectionTitle } from '../components/Shared';
import { C, LISTING_CATEGORIES } from '../data/config';
import { Footer, GlobalStyles, Navbar, compressImage } from '../components/Layout';

// ─── helpers ────────────────────────────────────────────────
function inputStyle(focused) {
  return {
    width: '100%', padding: '12px 16px', borderRadius: 6, boxSizing: 'border-box',
    border: `1.5px solid ${focused ? C.sage : C.sand}`,
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text,
    background: C.cream, outline: 'none', transition: 'border-color 0.2s',
  };
}

function Field({ label, value, onChange, type = 'text', placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  const props = {
    value, onChange: e => onChange(e.target.value),
    placeholder: placeholder || label,
    type, onFocus: () => setFocused(true), onBlur: () => setFocused(false),
    style: { ...inputStyle(focused), ...(multiline ? { resize: 'vertical', minHeight: 90 } : {}) },
  };
  return multiline ? <textarea {...props} /> : <input {...props} />;
}

function CategorySelect({ value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
    >
      <option value="">Select a category…</option>
      {LISTING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}

// ─── main component ─────────────────────────────────────────
export default function UpdateListingPage() {
  const [step, setStep] = useState(1); // 1 = verify, 2 = update form, 3 = done

  // Step 1 state
  const [verifyName, setVerifyName] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Step 2 state — pre-filled from Notion response
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState({ phone: '', website: '', address: '', description: '', category: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileRef = useRef();

  // ── Step 1: verify identity ──────────────────────────────
  async function handleVerify(e) {
    e.preventDefault();
    if (!verifyName.trim() || !verifyEmail.trim()) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch(`/api/update-listing?name=${encodeURIComponent(verifyName.trim())}&email=${encodeURIComponent(verifyEmail.trim().toLowerCase())}`);
      const data = await res.json();
      if (data.found) {
        setBusiness({ name: verifyName.trim(), email: verifyEmail.trim().toLowerCase() });
        setForm({
          phone: data.business.phone || '',
          website: data.business.website || '',
          address: data.business.address || '',
          description: data.business.description || '',
          category: data.business.category || '',
        });
        if (data.business.logo) setLogoPreview(data.business.logo);
        setStep(2);
      } else {
        setVerifyError("We couldn't find a match for that name and email address. Make sure they're spelled exactly as you entered them when you first signed up. Still stuck? Just email us at hello@manitoubeach.com and we'll sort it out.");
      }
    } catch {
      setVerifyError('Something went wrong — please try again.');
    } finally {
      setVerifyLoading(false);
    }
  }

  // ── Step 2: logo selection ───────────────────────────────
  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const { base64 } = await compressImage(file, 600, 0.85);
    setLogoPreview(`data:image/jpeg;base64,${base64}`);
  }

  // ── Step 2: submit update ────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');
    try {
      let logoUrl = null;
      if (logoFile) {
        const { base64, filename } = await compressImage(logoFile, 600, 0.85);
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64, filename: `logo-${filename}`, contentType: 'image/jpeg' }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Logo upload failed');
        logoUrl = uploadData.url;
      }

      const res = await fetch('/api/update-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: business.name,
          email: business.email,
          ...form,
          logoUrl,
          category: form.category || null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Update failed');
      setStep(3);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong — please try again.');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main style={{ minHeight: '100vh', background: C.cream, paddingTop: 80 }}>
        <section style={{ background: C.warmWhite, padding: '80px 24px 100px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <FadeIn>
              <SectionLabel>Your Business</SectionLabel>
              <SectionTitle>Need to change something?</SectionTitle>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.75, marginBottom: 40 }}>
                No problem at all — happens to everyone. Just type in your business name and the email address you used when you signed up, and we'll bring up your info right away.
              </p>

              {/* ── Step 1: verify ───────────────────────── */}
              {step === 1 && (
                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Business Name" value={verifyName} onChange={setVerifyName} placeholder="Same name you used when you signed up" />
                  <Field label="Email Address" value={verifyEmail} onChange={setVerifyEmail} type="email" placeholder="Email address you used when you signed up" />
                  {verifyError && (
                    <p style={{ fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px', margin: 0 }}>
                      {verifyError}
                    </p>
                  )}
                  <Btn variant="primary" style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                    {verifyLoading ? 'Looking…' : 'Find my business →'}
                  </Btn>
                </form>
              )}

              {/* ── Step 2: update form ───────────────────── */}
              {step === 2 && business && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ background: `${C.sage}15`, border: `1px solid ${C.sage}40`, borderRadius: 8, padding: '12px 16px', marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 14, color: C.sageDark, fontFamily: "'Libre Franklin', sans-serif" }}>
                      Updating: <strong>{business.name}</strong>
                    </p>
                  </div>

                  {/* Logo upload */}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>
                      Logo
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      {logoPreview && (
                        <img src={logoPreview} alt="Logo preview" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 8, border: `1px solid ${C.sand}`, background: '#fff', padding: 4 }} />
                      )}
                      <div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                        <button type="button" onClick={() => fileRef.current?.click()} style={{
                          fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600,
                          padding: '8px 16px', borderRadius: 4, border: `1.5px solid ${C.sage}`,
                          background: 'transparent', color: C.sage, cursor: 'pointer',
                        }}>
                          {logoPreview ? 'Change logo' : 'Upload logo'}
                        </button>
                        <p style={{ fontSize: 12, color: C.textMuted, margin: '6px 0 0', fontFamily: "'Libre Franklin', sans-serif" }}>
                          Any photo works — we'll handle the rest
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>
                      Category
                    </p>
                    <CategorySelect
                      value={form.category}
                      onChange={v => setForm(f => ({ ...f, category: v }))}
                    />
                  </div>

                  <Field label="Phone Number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} type="tel" />
                  <Field label="Website" value={form.website} onChange={v => setForm(f => ({ ...f, website: v }))} placeholder="Your website address (if you have one)" />
                  <Field label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
                  <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} multiline placeholder="Brief description (2–3 sentences)" />

                  {/* Food Truck interstitial — redirect instead of update */}
                  {form.category === 'Food Truck' ? (
                    <div style={{ background: `linear-gradient(135deg, #1A2830 0%, #2D4A3E 100%)`, borderRadius: 12, padding: '28px 24px' }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>🚚</div>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: '#F5F0E8', marginBottom: 10, fontWeight: 400 }}>
                        Hold on — you qualify for something better
                      </div>
                      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 20px', fontFamily: "'Libre Franklin', sans-serif" }}>
                        Manitou Beach has a whole special section just for food trucks — way more than a basic business listing. You get your own personal page you tap when you're parked and open. Anyone following your truck gets a text message the moment you're there. You can even show which events you'll be at. Takes about two minutes to finish, and we've already saved your info to get you started.
                      </p>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (business?.name) params.set('name', business.name);
                            if (business?.email) params.set('email', business.email);
                            if (form.phone) params.set('phone', form.phone);
                            if (form.website) params.set('website', form.website);
                            window.location.href = `/food-truck-partner?${params.toString()}`;
                          }}
                          style={{
                            fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 700,
                            padding: '12px 24px', borderRadius: 8, border: 'none',
                            background: C.sage, color: '#fff', cursor: 'pointer',
                          }}
                        >
                          Set up my truck →
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{
                          background: 'none', border: 'none', fontSize: 13, color: 'rgba(255,255,255,0.45)',
                          cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0,
                        }}>
                          ← Start over
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {submitError && (
                        <p style={{ fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px', margin: 0 }}>
                          {submitError}
                        </p>
                      )}
                      <p style={{ fontSize: 13, color: C.textMuted, margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
                        We'll take a look and get your changes showing within 24 hours.
                      </p>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                        <Btn variant="primary">
                          {submitLoading ? 'Sending…' : 'Save my changes →'}
                        </Btn>
                        <button type="button" onClick={() => setStep(1)} style={{
                          background: 'none', border: 'none', fontSize: 13, color: C.textMuted,
                          cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0,
                        }}>
                          ← Start over
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* ── Step 3: success ───────────────────────── */}
              {step === 3 && (
                <div style={{
                  background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
                  borderRadius: 12, padding: '40px 32px', textAlign: 'center',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: `${C.sage}25`, border: `2px solid ${C.sage}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: 22, color: C.sage,
                  }}>✓</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, marginBottom: 10, fontWeight: 400 }}>
                    Got it — thank you!
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 28px', fontFamily: "'Libre Franklin', sans-serif" }}>
                    We'll take a look and have your changes showing within 24 hours. We really appreciate you keeping things up to date — it makes a big difference for people trying to find you.
                  </p>
                  <Btn href="/business" variant="outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}>
                    See all local businesses
                  </Btn>
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
