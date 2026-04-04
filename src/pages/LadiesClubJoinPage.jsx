import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { SectionLabel, SectionTitle, FadeIn } from '../components/Shared';
import { C } from '../data/config';

// ============================================================
// 💙  LLLC MEMBERSHIP — /ladies-club/join
// ============================================================

const INPUT = {
  width: '100%', boxSizing: 'border-box',
  padding: '12px 14px', borderRadius: 8,
  border: `1.5px solid ${C.sand}`, background: '#fff',
  fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
  color: C.text, outline: 'none', transition: 'border-color 0.18s',
};

function Field({ label, required, hint, children }) {
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

function SuccessScreen({ memberId, name }) {
  return (
    <div style={{ minHeight: '100vh', background: C.warmWhite, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EBF5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>💙</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color: C.text, fontWeight: 400, margin: '0 0 12px' }}>
          Welcome to the club!
        </h1>
        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, margin: '0 0 32px' }}>
          {name ? `${name}, you're` : "You're"} officially a member of the Land & Lake Ladies Club. A welcome email is on its way to you.
        </p>

        <div style={{ background: '#fff', border: `1.5px solid ${C.sand}`, borderRadius: 14, padding: '24px 28px', marginBottom: 24, textAlign: 'left' }}>
          {memberId && (
            <>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: C.textMuted, letterSpacing: 1, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" }}>Member ID</p>
              <p style={{ margin: '0 0 20px', fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: 2, fontFamily: "'Libre Franklin', sans-serif" }}>{memberId}</p>
            </>
          )}
          <p style={{ margin: 0, fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
            Your $15 membership renews automatically each year. Manage or cancel anytime via the link in your Stripe receipt.
          </p>
        </div>

        <div style={{ background: C.cream, borderRadius: 10, padding: '16px 20px', marginBottom: 32, textAlign: 'left' }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Questions? Reach out to Michele:</p>
          <p style={{ margin: 0, fontSize: 13, color: C.text }}>
            <a href="mailto:Michele.henson0003@gmail.com" style={{ color: C.sage }}>Michele.henson0003@gmail.com</a>
          </p>
        </div>

        <a href="/ladies-club" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.textMuted, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>
          ← Back to Ladies Club
        </a>
      </div>
    </div>
  );
}

export default function LadiesClubJoinPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', birthdate: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { memberId, name }
  const [verifying, setVerifying] = useState(false);

  // Handle Stripe success redirect
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const isSuccess = searchParams.get('success') === 'true';
    if (isSuccess && sessionId) {
      setVerifying(true);
      fetch(`/api/lllc-member-success?session_id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setSuccess({ memberId: data.memberId, name: data.name });
          else setError(data.error || 'Could not verify payment. Please contact Michele.');
        })
        .catch(() => setError('Could not verify payment. Please contact Michele.'))
        .finally(() => setVerifying(false));
    }
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/lllc-member-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.');
      window.location.href = data.url; // redirect to Stripe
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (verifying) return (
    <>
      <GlobalStyles />
      <Navbar />
      <div style={{ minHeight: '100vh', background: C.warmWhite, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.textMuted }}>Confirming your membership…</p>
      </div>
      <Footer />
    </>
  );

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

      {/* Back nav */}
      <div style={{ background: C.night, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px' }}>
        <a href="/ladies-club" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', letterSpacing: 0.3 }}>
          ← Ladies Club
        </a>
      </div>

      {/* Hero */}
      <section style={{ background: C.night, padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, rgba(10,18,24,0.9) 0%, rgba(20,35,45,0.85) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <img src="/images/landlake-club-logo.png" alt="LLLC" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', marginBottom: 20, border: '2px solid rgba(255,255,255,0.15)' }} />
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight, marginBottom: 10 }}>
            Where Community Comes Together
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 400, color: C.cream, margin: '0 0 16px', lineHeight: 1.1 }}>
            Join the Land & Lake<br />Ladies Club
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
            Open enrollment — no special skills needed, just a willingness to help. $15/year, auto-renews annually.
          </p>
        </div>
      </section>

      {/* Maslow needs — 4 cards */}
      <div style={{ background: C.warmWhite, borderBottom: `1px solid ${C.sand}`, padding: '40px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { icon: '🤝', label: 'Belonging', copy: "Walk into any LLLC event and you already know half the room. Real friendships built around a real lake." },
            { icon: '🌱', label: 'Purpose', copy: "Every bake sale, every clean-up, every fundraiser — you're the reason this community keeps getting better." },
            { icon: '✨', label: 'Recognition', copy: 'Your name on the roster. Your ideas on the agenda. Your face in the photos. You show up, you get seen.' },
            { icon: '🏡', label: 'Legacy', copy: "Decades from now, someone will be grateful this club existed. You're the one who kept it going." },
          ].map(({ icon, label, copy }) => (
            <div key={label} style={{ background: '#fff', border: `1.5px solid ${C.sand}`, borderRadius: 12, padding: '22px 20px' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
              <p style={{ margin: '0 0 6px', fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted }}>{label}</p>
              <p style={{ margin: 0, fontSize: 13, color: C.textLight, lineHeight: 1.65 }}>{copy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <section style={{ background: C.warmWhite, padding: '64px 24px 100px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <FadeIn>
            <SectionLabel>Membership</SectionLabel>
            <SectionTitle>Join for $15/year</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, marginBottom: 40 }}>
              Fill out the form below and you'll be taken to a secure checkout. Your membership renews automatically each year — cancel anytime.
            </p>
          </FadeIn>

          <form onSubmit={handleSubmit} noValidate>
            <FadeIn>
              <Field label="Full Name" required>
                <Input value={form.name} onChange={set('name')} placeholder="First Last" required />
              </Field>
            </FadeIn>

            <FadeIn>
              <Field label="Email Address" required hint="Your welcome email and receipt will be sent here.">
                <Input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </Field>
            </FadeIn>

            <FadeIn>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Phone Number">
                  <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="(517) 555-0100" />
                </Field>
                <Field label="Date of Birth">
                  <Input type="date" value={form.birthdate} onChange={set('birthdate')} />
                </Field>
              </div>
            </FadeIn>

            <FadeIn>
              <Field label="Mailing Address">
                <Input value={form.address} onChange={set('address')} placeholder="123 Lake Rd, Manitou Beach, MI 49253" />
              </Field>
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
                  background: submitting ? C.sand : C.sunset,
                  border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, fontWeight: 700,
                  color: '#fff', letterSpacing: 0.4, transition: 'background 0.2s',
                }}
              >
                {submitting ? 'Redirecting to checkout…' : 'Join for $15/year →'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: 12, lineHeight: 1.5 }}>
                Secure payment via Stripe. Renews annually — cancel anytime from your receipt email.
              </p>
            </FadeIn>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
