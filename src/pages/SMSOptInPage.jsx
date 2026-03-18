import React, { useState } from 'react';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';

export default function SMSOptInPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const S = {
    h2: { fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.dusk, margin: '40px 0 12px' },
    p: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, margin: '0 0 14px' },
    label: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, display: 'block', marginBottom: 6 },
    input: { width: '100%', padding: '12px 16px', fontSize: 16, border: `1px solid ${C.border || '#ddd'}`, borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box' },
    btn: { display: 'inline-block', padding: '14px 36px', background: C.sage, color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, cursor: 'pointer', marginTop: 20 },
    btnDisabled: { opacity: 0.45, cursor: 'not-allowed' },
    check: { display: 'flex', gap: 12, alignItems: 'flex-start', margin: '20px 0' },
    legal: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.7 },
    tag: { display: 'inline-block', background: C.sage + '22', color: C.sage, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 3, marginBottom: 12 },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) return setError('Please enter your mobile number.');
    if (!consent) return setError('Please check the consent box to continue.');
    // Backend endpoint to be wired up after A2P approval
    try {
      const res = await fetch('/api/sms-optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), type: 'general' }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Unable to connect. Please try again later.');
    }
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 28px 80px' }}>

        <div style={S.tag}>SMS Alerts</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, color: C.dusk, margin: '0 0 16px' }}>
          Stay in the loop
        </h1>
        <p style={S.p}>
          Get text alerts for food truck check-ins, community events, and local deals — straight to your phone. No spam, just what's happening at Manitou Beach.
        </p>

        {submitted ? (
          <div style={{ background: C.sage + '18', border: `1px solid ${C.sage}44`, borderRadius: 8, padding: '24px 28px', marginTop: 32 }}>
            <p style={{ ...S.p, color: C.sage, fontWeight: 600, margin: 0 }}>You're subscribed!</p>
            <p style={{ ...S.p, marginTop: 8, marginBottom: 0 }}>Check your phone for a confirmation text. Reply STOP at any time to unsubscribe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: 32 }}>

            <h2 style={S.h2}>What you'll receive</h2>
            <ul style={{ paddingLeft: 20, margin: '0 0 28px' }}>
              {[
                'Food truck alerts — when a truck checks in at the park',
                'Event reminders — Friday Fish Fry, festivals, live music',
                'Business deals — time-sensitive specials from Village shops',
                'Welcome messages — highlights when you arrive for the weekend',
              ].map((item, i) => (
                <li key={i} style={{ ...S.p, margin: '0 0 6px' }}>{item}</li>
              ))}
            </ul>

            <label style={S.label} htmlFor="sms-phone">Mobile phone number</label>
            <input
              id="sms-phone"
              type="tel"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={S.input}
              autoComplete="tel"
            />

            <div style={S.check}>
              <input
                id="sms-consent"
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="sms-consent" style={{ ...S.legal, cursor: 'pointer' }}>
                I agree to receive SMS notifications from Manitou Beach / Yeti Groove Media LLC. Message &amp; data rates may apply. Message frequency varies. Reply <strong>STOP</strong> to unsubscribe at any time. Reply <strong>HELP</strong> for help. View our{' '}
                <a href="/privacy" style={{ color: C.sage }}>Privacy Policy</a> and{' '}
                <a href="/terms" style={{ color: C.sage }}>Terms of Service</a>.
              </label>
            </div>

            {error && (
              <p style={{ ...S.p, color: '#c0392b', margin: '8px 0 0' }}>{error}</p>
            )}

            <button
              type="submit"
              style={{ ...S.btn, ...((!phone || !consent) ? S.btnDisabled : {}) }}
              disabled={!phone || !consent}
            >
              Subscribe to SMS alerts
            </button>

            <p style={{ ...S.legal, marginTop: 20 }}>
              Your number is never shared with third parties. Opt out anytime by replying STOP.
            </p>
          </form>
        )}

        <h2 style={S.h2}>Frequently asked questions</h2>

        {[
          { q: 'How many texts will I get?', a: 'It varies by week — typically a few per week during summer season when trucks and events are active. Much quieter off-season.' },
          { q: 'Can I choose what I get alerts for?', a: 'Right now it\'s a single subscription. Preference controls (food trucks only, events only, etc.) are coming soon.' },
          { q: 'How do I unsubscribe?', a: 'Reply STOP to any message and you\'ll be removed immediately. You\'ll get one confirmation text, then nothing more.' },
          { q: 'Who sends the messages?', a: 'Manitou Beach, operated by Yeti Groove Media LLC. Messages are sent via Twilio.' },
        ].map(({ q, a }, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <p style={{ ...S.p, fontWeight: 600, margin: '0 0 4px' }}>{q}</p>
            <p style={{ ...S.p, margin: 0 }}>{a}</p>
          </div>
        ))}

      </div>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
