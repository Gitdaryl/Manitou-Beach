import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { SectionLabel, SectionTitle, FadeIn } from '../components/Shared';
import { C } from '../data/config';

// ============================================================
// 🎨  LLLC VENDOR / ARTIST APPLICATION — /ladies-club/vendor
// ============================================================

const VENDOR_TYPES = [
  { value: 'Artist / Fine Art', label: 'Artist / Fine Art', icon: '🎨', desc: 'Paintings, sculpture, photography, and original fine art' },
  { value: 'Crafter', label: 'Crafter', icon: '✂️', desc: 'Handmade goods, jewelry, ceramics, textiles, and craft items' },
  { value: 'Food Truck', label: 'Food Truck', icon: '🚚', desc: 'Food trucks and mobile food vendors' },
  { value: 'Community Vendor', label: 'Community Vendor', icon: '🏘️', desc: 'Nonprofits, clubs, community organizations, and services' },
  { value: 'Other', label: 'Other', icon: '✦', desc: 'Something that doesn\'t fit the above — describe in your bio' },
];

const BOOTH_SIZES = [
  { value: '10x10 — $25', label: '10 × 10 ft', price: '$25' },
  { value: '20x10 — $40', label: '20 × 10 ft', price: '$40' },
];

const INPUT = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 14px', borderRadius: 8,
  border: `1.5px solid ${C.sand}`, background: '#fff',
  fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
  color: C.text, outline: 'none',
  transition: 'border-color 0.18s',
};

function Field({ label, required, children, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: C.textMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#c0392b', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ margin: '5px 0 0', fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function Input({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{ ...INPUT, borderColor: focused ? C.sage : C.sand, ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function Textarea({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      style={{ ...INPUT, borderColor: focused ? C.sage : C.sand, resize: 'vertical', minHeight: 120, lineHeight: 1.6, ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function SuccessScreen({ appId, vendorType, contactName }) {
  const needsPhotos = ['Artist / Fine Art', 'Crafter'].includes(vendorType);
  return (
    <div style={{ minHeight: '100vh', background: C.warmWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EBF5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>✓</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color: C.text, fontWeight: 400, margin: '0 0 12px' }}>
          Application submitted!
        </h1>
        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, margin: '0 0 32px' }}>
          Thanks {contactName}! We'll review your application and respond within a week.
        </p>

        <div style={{ background: '#fff', border: `1.5px solid ${C.sand}`, borderRadius: 14, padding: '24px 28px', marginBottom: 24, textAlign: 'left' }}>
          <p style={{ margin: '0 0 4px', fontSize: 11, color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" }}>Application ID</p>
          <p style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: 2, fontFamily: "'Libre Franklin', sans-serif" }}>{appId}</p>
          <p style={{ margin: 0, fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
            A confirmation email is on its way to you. Keep your application ID handy — reference it in any follow-up.
          </p>
        </div>

        {needsPhotos && (
          <div style={{ background: '#FFF8EE', border: `1.5px solid #E8D8B0`, borderRadius: 12, padding: '18px 22px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: '#7a5c1e', fontFamily: "'Libre Franklin', sans-serif" }}>📸 One more step — send your photos</p>
            <p style={{ margin: 0, fontSize: 13, color: '#5a4010', lineHeight: 1.6 }}>
              Email a minimum of <strong>4 photos of your artwork</strong> to{' '}
              <a href="mailto:1GypsyHeart66@gmail.com" style={{ color: '#b08d57' }}>1GypsyHeart66@gmail.com</a>{' '}
              with subject line <strong>{appId}</strong>. Applications without photos will not be reviewed.
            </p>
          </div>
        )}

        <div style={{ background: C.cream, borderRadius: 10, padding: '16px 20px', marginBottom: 32, textAlign: 'left' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Questions? Text us:</p>
          <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.7 }}>
            Kristy Faust · (517) 403-1788<br />
            Laura Heidtman · (419) 708-2805
          </p>
        </div>

        <a href="/ladies-club" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.textMuted, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>
          ← Back to Ladies Club
        </a>
      </div>
    </div>
  );
}

export default function LadiesClubVendorPage() {
  const [vendorType, setVendorType] = useState('');
  const [form, setForm] = useState({
    contactName: '', businessName: '', email: '',
    businessPhone: '', cellPhone: '', address: '',
    facebookUrl: '', website: '', bio: '', boothSize: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { appId, vendorType, contactName }

  const isArtOrCraft = ['Artist / Fine Art', 'Crafter'].includes(vendorType);
  const isFoodTruck = vendorType === 'Food Truck';

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!vendorType) { setError('Please select a vendor type.'); return; }
    if (!form.contactName || !form.email) { setError('Contact name and email are required.'); return; }
    if (isArtOrCraft && !form.boothSize) { setError('Please select a booth size.'); return; }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/community-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          community: 'Devils Lake',
          org: 'LLLC',
          type: 'Vendor',
          vendorType,
          boothSize: form.boothSize || undefined,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSuccess({ appId: data.appId, vendorType, contactName: form.contactName });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) return (
    <>
      <GlobalStyles />
      <Navbar />
      <SuccessScreen {...success} />
      <Footer />
    </>
  );

  return (
    <>
      <GlobalStyles />
      <Navbar />

      {/* Hero */}
      <section style={{ background: C.night, padding: '100px 24px 60px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(10,18,24,0.9) 0%, rgba(20,35,45,0.85) 100%)' }} />
        {/* Back arrow — inside hero, top-left */}
        <a href="/ladies-club" style={{ position: 'absolute', top: 20, left: 24, zIndex: 2, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, letterSpacing: 0.2, background: 'rgba(255,255,255,0.08)', padding: '7px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)' }}>
          ← Ladies Club
        </a>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <img src="/images/ladies-club/summer-festival.png" alt="Devils Lake Summer Festival" style={{ width: 160, height: 160, objectFit: 'contain', marginBottom: 20 }} />
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight, marginBottom: 10 }}>
            Devils Lake Summerfest 2026
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 400, color: C.cream, margin: '0 0 16px', lineHeight: 1.1 }}>
            Vendor & Artist<br />Application
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            June 20, 2026 · Manitou Beach, MI · Application deadline May 20, 2026
          </p>
        </div>
      </section>

      {/* Intro strip */}
      <div style={{ background: C.cream, borderBottom: `1px solid ${C.sand}`, padding: '20px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Show Date', val: 'June 20, 2026 · 9am–2pm' },
            { label: 'Booth (10×10)', val: '$25' },
            { label: 'Booth (20×10)', val: '$40' },
            { label: 'Deadline', val: 'May 20, 2026' },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: "'Libre Franklin', sans-serif" }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: "'Libre Franklin', sans-serif" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <section style={{ background: C.warmWhite, padding: '64px 24px 100px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <FadeIn>
            <SectionLabel>Apply Now</SectionLabel>
            <SectionTitle>Tell us about yourself</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, marginBottom: 40 }}>
              Fill out the form below. All accepted artists and crafters will be featured on our Facebook page with your bio and photos before the event. Payment is due within 2 weeks of acceptance.
            </p>
          </FadeIn>

          <form onSubmit={handleSubmit} noValidate>

            {/* Vendor type selector */}
            <FadeIn>
              <Field label="What kind of vendor are you?" required>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
                  {VENDOR_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => { setVendorType(t.value); setError(''); }}
                      style={{
                        background: vendorType === t.value ? '#EBF5EE' : '#fff',
                        border: `1.5px solid ${vendorType === t.value ? C.sage : C.sand}`,
                        borderRadius: 10, padding: '14px 14px 12px',
                        textAlign: 'left', cursor: 'pointer',
                        transition: 'all 0.18s',
                      }}
                    >
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>{t.label}</div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </Field>
            </FadeIn>

            {vendorType && (
              <>
                {/* Booth size — artists & crafters only */}
                {isArtOrCraft && (
                  <FadeIn>
                    <Field label="Booth Size" required hint="Located on N. Lakeview Blvd. Payment due within 2 weeks of acceptance.">
                      <div style={{ display: 'flex', gap: 12 }}>
                        {BOOTH_SIZES.map(b => (
                          <button
                            key={b.value}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, boothSize: b.value }))}
                            style={{
                              flex: 1, background: form.boothSize === b.value ? '#EBF5EE' : '#fff',
                              border: `1.5px solid ${form.boothSize === b.value ? C.sage : C.sand}`,
                              borderRadius: 10, padding: '16px 12px', cursor: 'pointer', transition: 'all 0.18s',
                            }}
                          >
                            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, fontWeight: 700, color: C.text }}>{b.label}</div>
                            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 20, color: C.sage, fontWeight: 700 }}>{b.price}</div>
                          </button>
                        ))}
                      </div>
                    </Field>
                  </FadeIn>
                )}

                {/* Contact info */}
                <FadeIn>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Your Name" required>
                      <Input value={form.contactName} onChange={set('contactName')} placeholder="First Last" required />
                    </Field>
                    <Field label="Business Name">
                      <Input value={form.businessName} onChange={set('businessName')} placeholder={isFoodTruck ? 'Truck name' : 'Studio / shop name (optional)'} />
                    </Field>
                  </div>
                </FadeIn>

                <FadeIn>
                  <Field label="Email Address" required hint="Your confirmation will be sent here.">
                    <Input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
                  </Field>
                </FadeIn>

                <FadeIn>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Business Phone">
                      <Input type="tel" value={form.businessPhone} onChange={set('businessPhone')} placeholder="(517) 555-0100" />
                    </Field>
                    <Field label="Cell Phone">
                      <Input type="tel" value={form.cellPhone} onChange={set('cellPhone')} placeholder="(517) 555-0101" />
                    </Field>
                  </div>
                </FadeIn>

                <FadeIn>
                  <Field label="Mailing Address">
                    <Input value={form.address} onChange={set('address')} placeholder="123 Lake Rd, Manitou Beach, MI 49253" />
                  </Field>
                </FadeIn>

                <FadeIn>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Facebook Page URL">
                      <Input type="url" value={form.facebookUrl} onChange={set('facebookUrl')} placeholder="facebook.com/yourbusiness" />
                    </Field>
                    <Field label="Website">
                      <Input type="url" value={form.website} onChange={set('website')} placeholder="yourwebsite.com (optional)" />
                    </Field>
                  </div>
                </FadeIn>

                {/* Bio */}
                <FadeIn>
                  <Field
                    label={isArtOrCraft ? 'About your work' : isFoodTruck ? 'About your truck & menu' : 'About you / your organization'}
                    hint={isArtOrCraft ? 'Describe your work, medium, and process. This info will be used in all marketing and advertising of your art.' : 'Tell us a bit about what you offer.'}
                  >
                    <Textarea
                      value={form.bio}
                      onChange={set('bio')}
                      placeholder={
                        isArtOrCraft
                          ? 'I create original oil paintings inspired by Michigan lake life…'
                          : isFoodTruck
                          ? 'We specialize in wood-fired pizza using locally sourced ingredients…'
                          : 'Describe your organization or what you\'ll be offering at the festival…'
                      }
                    />
                  </Field>
                </FadeIn>

                {/* Photo note for artists */}
                {isArtOrCraft && (
                  <FadeIn>
                    <div style={{ background: '#FFF8EE', border: `1.5px solid #E8D8B0`, borderRadius: 12, padding: '18px 22px', marginBottom: 28 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#7a5c1e', fontFamily: "'Libre Franklin', sans-serif" }}>📸 Photos required</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#5a4010', lineHeight: 1.6 }}>
                        After submitting, email a minimum of <strong>4 photos of your artwork</strong> to{' '}
                        <a href="mailto:1GypsyHeart66@gmail.com" style={{ color: '#b08d57' }}>1GypsyHeart66@gmail.com</a>.
                        Use your application ID as the subject line. Applications without photos will not be reviewed.
                      </p>
                    </div>
                  </FadeIn>
                )}

                {/* Permission line from the paper form */}
                <FadeIn>
                  <div style={{ background: C.cream, borderRadius: 10, padding: '14px 18px', marginBottom: 28, fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                    By submitting this application you grant permission to the Land & Lake Ladies Club to use images of your work for festival publicity.
                  </div>
                </FadeIn>

                {error && (
                  <div style={{ background: '#FEF0EE', border: '1px solid #f5c6c2', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#c0392b', fontFamily: "'Libre Franklin', sans-serif" }}>
                    {error}
                  </div>
                )}

                <FadeIn>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%', padding: '16px 24px', borderRadius: 10,
                      background: submitting ? C.sand : C.sage,
                      border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, fontWeight: 700,
                      color: '#fff', letterSpacing: 0.4,
                      transition: 'background 0.2s',
                    }}
                  >
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: 12 }}>
                    Questions? Text Kristy Faust (517) 403-1788 or Laura Heidtman (419) 708-2805
                  </p>
                </FadeIn>
              </>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
