import React, { useState } from 'react';
import { Btn, FadeIn, SectionLabel, SectionTitle } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import yeti from '../data/errorMessages';

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

export default function ManageBillingPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const returned = params.get('returned') === 'true';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: name.trim(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.noStripe) {
        setError("We found your listing but it doesn't have an active subscription. Need help? Reply to your welcome email or email hello@yetigroove.com.");
      } else if (!data.found) {
        setError("We couldn't find a listing for that name and email. Need help? Email us at hello@yetigroove.com.");
      } else {
        setError(yeti.oops());
      }
    } catch {
      setError(yeti.network());
    } finally {
      setLoading(false);
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
              <SectionLabel>Your Listing</SectionLabel>
              <SectionTitle>Manage your billing</SectionTitle>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.75, marginBottom: 40 }}>
                {returned
                  ? "You're back. Everything looks good on our end."
                  : 'Upgrade, downgrade, or cancel your subscription - all in one place. Enter your business name and email to get started.'}
              </p>

              {returned ? (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Btn href="/update-listing" variant="primary">Update listing info</Btn>
                  <Btn href="/business" variant="outline">See all local businesses</Btn>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Business Name" value={name} onChange={setName} placeholder="Same name you used when you signed up" />
                  <Field label="Email Address" value={email} onChange={setEmail} type="email" placeholder="Email address from your original signup" />
                  {error && (
                    <p style={{ fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px', margin: 0 }}>
                      {error}
                    </p>
                  )}
                  <Btn variant="primary" style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                    {loading ? 'One moment…' : 'Go to billing →'}
                  </Btn>
                  <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
                    You'll be redirected to a secure Stripe portal to manage your plan.
                  </p>
                </form>
              )}
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
