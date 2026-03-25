import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from '../components/Layout';
import { C } from '../data/config';

const EVENT_TYPES = [
  { value: 'free',              label: 'Free — people just show up',          sub: "No registration needed. We'll show a \"Free · All welcome\" badge." },
  { value: 'rsvp_appreciated',  label: 'RSVP encouraged (but not required)',   sub: "We'll show an RSVP option, but people can still walk in." },
  { value: 'rsvp_required',     label: 'RSVP required — limited spots',        sub: 'Attendees must register. Set a capacity cap if needed.' },
  { value: 'own_ticketing',     label: 'Ticketed — I use my own system',       sub: "We'll show a \"Get Tickets\" button linking to your site or Eventbrite." },
  { value: 'platform_ticketing',label: 'Ticketed — use Manitou Beach ticketing', sub: 'Stripe-powered checkout. Funds go directly to your bank. 1.25% platform fee.' },
  { value: 'vendor_market',     label: 'Vendor market — vendors pay for booths', sub: 'Vendors register and pay via Stripe directly to your account. You get an organizer portal.' },
];

const RECURRING_OPTIONS = ['None', 'Annual', 'Weekly'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SESSION_KEY = 'mb_event_session';
const SESSION_HOURS = 8;

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.token || !s.phone || Date.now() > s.expires) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

function saveSession({ token, phone, organizerName, email }) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    token, phone, organizerName, email,
    expires: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  }));
}

const EMPTY_FORM = {
  eventName: '', date: '', timeStart: '', timeEnd: '',
  location: '', description: '', cost: '',
  organizerName: '', email: '', phone: '',
  eventUrl: '', imageUrl: '',
  ticketPrice: '', ticketCapacity: '',
  rsvpCapacity: '',
  vendorFee: '', vendorCapacity: '',
  recurring: 'None', recurringDay: '',
  eventType: 'free',
};

const input = {
  width: '100%', boxSizing: 'border-box', padding: '13px 16px',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)', color: C.cream,
  fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: 'none',
};

const label = {
  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1,
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6,
};

export default function SubmitEventPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [session, setSession] = useState(null); // active verified session

  const [step, setStep]               = useState('form'); // 'form' | 'verify' | 'stripe_redirect' | 'done'
  const [verifyCode, setVerifyCode]   = useState('');
  const [loading, setLoading]         = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resending, setResending]     = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [activatedData, setActivatedData] = useState(null);

  // On mount: restore active session and pre-fill organizer fields
  useEffect(() => {
    const s = loadSession();
    if (s) {
      setSession(s);
      setForm(f => ({
        ...f,
        phone: s.phone || '',
        organizerName: s.organizerName || '',
        email: s.email || '',
      }));
    }
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const needsStripe = form.eventType === 'platform_ticketing' || form.eventType === 'vendor_market';

  const resetForNextEvent = () => {
    setForm(f => ({
      ...EMPTY_FORM,
      phone: f.phone,
      organizerName: f.organizerName,
      email: f.email,
    }));
    setStep('form');
    setActivatedData(null);
    setVerifyCode('');
    setSubmitError('');
    setVerifyError('');
  };

  const handleSubmit = async () => {
    if (!form.eventName.trim()) { setSubmitError('Event name is required.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setSubmitError('A valid email is required.'); return; }
    if (!form.date) { setSubmitError('Event date is required.'); return; }
    const phoneDigits = (form.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10) { setSubmitError('A valid phone number is required — we\'ll text you a verification code.'); return; }

    setLoading(true);
    setSubmitError('');
    try {
      const body = session
        ? { ...form, sessionToken: session.token, _hp: '' }
        : { ...form, _hp: '' };

      const res = await fetch('/api/submit-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) { setSubmitError(data.error); return; }
      if (data.activated) {
        setActivatedData(data);
        setStep('done');
      } else if (data.needsVerification) {
        setStep('verify');
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.trim().length !== 6) { setVerifyError('Enter the 6-digit code from your text message.'); return; }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/verify-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code: verifyCode.trim() }),
      });
      const data = await res.json();
      if (data.error) { setVerifyError(data.error); setVerifyLoading(false); return; }

      // Save session so subsequent events skip verification
      if (data.sessionToken) {
        const s = { token: data.sessionToken, phone: form.phone, organizerName: form.organizerName, email: form.email };
        saveSession(s);
        setSession(s);
      }

      if (data.activated && data.needsStripe) {
        // Trigger Stripe Express onboarding
        setStep('stripe_redirect');
        const onboardRes = await fetch('/api/event-stripe-onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventPageId: data.eventPageId,
            orgName: form.organizerName || form.eventName,
            orgEmail: form.email,
            eventType: data.eventType,
          }),
        });
        const onboardData = await onboardRes.json();
        if (onboardData.onboardingUrl) {
          window.location.href = onboardData.onboardingUrl;
        } else {
          setVerifyError(onboardData.error || 'Payment setup failed. Please try again.');
          setStep('verify');
        }
      } else if (data.activated) {
        setActivatedData(data);
        setStep('done');
      }
    } catch {
      setVerifyError('Something went wrong. Please try again.');
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch('/api/verify-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, resend: true }),
      });
    } catch { /* silent */ }
    finally { setTimeout(() => setResending(false), 3000); }
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.night, color: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={() => {}} isSubPage />

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px 110px' }}>

        {step === 'done' ? (
          /* ── DONE ── */
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>
              {activatedData?.eventName || 'Your event'} is live!
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 28 }}>
              {session ? 'Published instantly — your verified session is still active.' : 'Check your texts — we sent you a private edit link so you can update details anytime.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button
                onClick={resetForNextEvent}
                style={{ padding: '14px 32px', background: '#D4845A', color: '#fff', border: 'none', borderRadius: 28, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Submit Another Event →
              </button>
              <a href="/happening" style={{ display: 'inline-block', padding: '14px 32px', background: 'rgba(255,255,255,0.08)', color: C.cream, borderRadius: 28, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', textDecoration: 'none' }}>
                See What's Happening
              </a>
            </div>
          </div>

        ) : step === 'stripe_redirect' ? (
          /* ── STRIPE REDIRECT ── */
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>✓</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>
              Event verified — setting up payments
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
              Redirecting you to Stripe to connect your bank account…
            </p>
          </div>

        ) : step === 'verify' ? (
          /* ── VERIFY ── */
          <div style={{ textAlign: 'center', maxWidth: 400, margin: '60px auto 0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📱</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.cream, margin: '0 0 8px' }}>
              Check your texts
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 28px' }}>
              We sent a 6-digit code to <strong style={{ color: '#D4845A' }}>{form.phone}</strong>
            </p>
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoFocus
                style={{ ...input, fontSize: 28, fontWeight: 700, textAlign: 'center', letterSpacing: 8, maxWidth: 240, border: `2px solid ${verifyError ? '#e07070' : 'rgba(255,255,255,0.2)'}` }}
              />
            </div>
            {verifyError && <div style={{ fontSize: 13, color: '#e07070', marginBottom: 16 }}>{verifyError}</div>}
            <button
              onClick={handleVerify}
              disabled={verifyLoading || verifyCode.length !== 6}
              style={{ padding: '14px 36px', background: verifyLoading ? '#5C5248' : '#D4845A', color: '#fff', border: 'none', borderRadius: 28, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: verifyLoading ? 'default' : 'pointer', fontFamily: "'Libre Franklin', sans-serif", opacity: verifyCode.length !== 6 ? 0.5 : 1 }}
            >
              {verifyLoading
                ? (needsStripe ? 'Setting up payments…' : 'Verifying…')
                : (needsStripe ? 'Verify & Set Up Payments →' : 'Verify & Publish Event →')}
            </button>
            <div style={{ marginTop: 20 }}>
              <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: resending ? '#7A8E72' : 'rgba(255,255,255,0.35)', cursor: resending ? 'default' : 'pointer', padding: '6px 12px' }}>
                {resending ? '✓ Code re-sent' : "Didn't get it? Resend code"}
              </button>
            </div>
          </div>

        ) : (
          /* ── FORM ── */
          <>
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>Manitou Beach · Submit an Event</p>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: C.cream, margin: '0 0 12px', lineHeight: 1.2 }}>
                Get your event in front of<br /><em>the whole lake community.</em>
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: 0 }}>
                Verify your phone and your event goes live immediately — no waiting for approval.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Event Name */}
              <div>
                <label style={label}>Event Name *</label>
                <input style={input} type="text" value={form.eventName} onChange={set('eventName')} placeholder="e.g. Corks & Kegs Wine Festival" />
              </div>

              {/* Date + Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={label}>Date *</label>
                  <input style={input} type="date" value={form.date} onChange={set('date')} />
                </div>
                <div>
                  <label style={label}>Start Time</label>
                  <input style={input} type="text" value={form.timeStart} onChange={set('timeStart')} placeholder="e.g. 10:00 AM" />
                </div>
                <div>
                  <label style={label}>End Time</label>
                  <input style={input} type="text" value={form.timeEnd} onChange={set('timeEnd')} placeholder="e.g. 4:00 PM" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label style={label}>Location / Venue</label>
                <input style={input} type="text" value={form.location} onChange={set('location')} placeholder="e.g. Manitou Beach Park, Vineyard Ave" />
              </div>

              {/* Description */}
              <div>
                <label style={label}>Description</label>
                <textarea
                  value={form.description} onChange={set('description')}
                  placeholder="Tell people what to expect — 2–4 sentences works great."
                  rows={4}
                  style={{ ...input, resize: 'vertical', lineHeight: 1.7 }}
                />
              </div>

              {/* Event Type */}
              <div>
                <label style={label}>What kind of event is this? *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {EVENT_TYPES.map(et => (
                    <label key={et.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '12px 16px', border: `1px solid ${form.eventType === et.value ? 'rgba(212,132,90,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, background: form.eventType === et.value ? 'rgba(212,132,90,0.08)' : 'rgba(255,255,255,0.03)', transition: 'all 0.15s' }}>
                      <input type="radio" name="eventType" value={et.value} checked={form.eventType === et.value} onChange={set('eventType')} style={{ marginTop: 3, accentColor: '#D4845A', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.cream, marginBottom: 2 }}>{et.label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{et.sub}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditional: Own ticketing URL */}
              {form.eventType === 'own_ticketing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={label}>Ticket Link *</label>
                    <input style={input} type="text" value={form.eventUrl} onChange={set('eventUrl')} placeholder="e.g. eventbrite.com/your-event" />
                  </div>
                  <div style={{ background: 'rgba(122,142,114,0.1)', border: '1px solid rgba(122,142,114,0.25)', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 6px' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.75)' }}>Don't have a ticketing system yet?</strong> We can handle it — buyers pay right on this site, money goes straight to your bank, and you skip the Eventbrite fees.
                    </p>
                    <a
                      href="/ticket-services"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#7A8E72', fontWeight: 700, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}
                    >
                      See how Manitou Beach ticketing works →
                    </a>
                  </div>
                </div>
              )}

              {/* Conditional: Platform ticketing */}
              {form.eventType === 'platform_ticketing' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={label}>Ticket Price ($)</label>
                    <input style={input} type="number" min="0" step="0.01" value={form.ticketPrice} onChange={set('ticketPrice')} placeholder="25.00" />
                  </div>
                  <div>
                    <label style={label}>Capacity <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                    <input style={input} type="number" min="1" value={form.ticketCapacity} onChange={set('ticketCapacity')} placeholder="e.g. 200" />
                  </div>
                </div>
              )}

              {/* Conditional: RSVP capacity */}
              {(form.eventType === 'rsvp_appreciated' || form.eventType === 'rsvp_required') && (
                <div>
                  <label style={label}>RSVP Capacity <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— leave blank for unlimited</span></label>
                  <input style={input} type="number" min="1" value={form.rsvpCapacity} onChange={set('rsvpCapacity')} placeholder="e.g. 50" />
                </div>
              )}

              {/* Conditional: Vendor market */}
              {form.eventType === 'vendor_market' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={label}>Booth Fee ($)</label>
                    <input style={input} type="number" min="0" step="0.01" value={form.vendorFee} onChange={set('vendorFee')} placeholder="20.00" />
                  </div>
                  <div>
                    <label style={label}>Vendor Spots <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                    <input style={input} type="number" min="1" value={form.vendorCapacity} onChange={set('vendorCapacity')} placeholder="e.g. 30" />
                  </div>
                </div>
              )}

              {/* Stripe info banner for money types */}
              {needsStripe && (
                <div style={{ background: 'rgba(212,132,90,0.1)', border: '1px solid rgba(212,132,90,0.25)', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                    After verifying your phone, you'll connect your bank account via Stripe (takes ~5 minutes). Money goes directly to you — we take 1.25%.
                  </p>
                </div>
              )}

              {/* Cost */}
              <div>
                <label style={label}>Cost description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— shown on the event card</span></label>
                <input style={input} type="text" value={form.cost} onChange={set('cost')} placeholder='e.g. "Free", "$10 at the door", "Tickets from $25"' />
              </div>

              {/* Image URL */}
              <div>
                <label style={label}>Event Image URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                <input style={input} type="text" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
              </div>

              {/* Recurring */}
              <div style={{ display: 'grid', gridTemplateColumns: form.recurring !== 'None' ? '1fr 1fr' : '1fr', gap: 10 }}>
                <div>
                  <label style={label}>Recurring?</label>
                  <select value={form.recurring} onChange={set('recurring')} style={{ ...input, cursor: 'pointer' }}>
                    {RECURRING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                {form.recurring !== 'None' && (
                  <div>
                    <label style={label}>Day of Week</label>
                    <select value={form.recurringDay} onChange={set('recurringDay')} style={{ ...input, cursor: 'pointer' }}>
                      <option value="">— select —</option>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Organizer contact */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 14px' }}>Your contact info</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={label}>Your Name / Organization</label>
                    <input style={input} type="text" value={form.organizerName} onChange={set('organizerName')} placeholder="e.g. Irish Hills Wine Trail" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={label}>Email *</label>
                      <input style={input} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                    </div>
                    <div>
                      <label style={label}>Phone * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— for verification only, not shown publicly</span></label>
                      <input style={input} type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden honeypot */}
              <input type="text" name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              {submitError && <div style={{ fontSize: 13, color: '#e07070', fontWeight: 500 }}>{submitError}</div>}

              {session && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(122,142,114,0.12)', border: '1px solid rgba(122,142,114,0.3)', borderRadius: 8 }}>
                  <span style={{ color: '#7A8E72', fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                    Verified session active — events publish instantly, no code needed.
                  </span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '15px 24px', background: loading ? '#5C5248' : '#D4845A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer', fontFamily: "'Libre Franklin', sans-serif", transition: 'background 0.2s', marginTop: 4 }}
              >
                {loading
                  ? (session ? 'Publishing…' : 'Sending verification code…')
                  : (session ? 'Publish Event →' : 'Submit Event — Get Verified →')}
              </button>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.7, margin: '0' }}>
                {session
                  ? 'Your phone is already verified. Events go live immediately.'
                  : "We'll text a code to verify it's you. Once verified, your event goes live instantly."}
              </p>

            </div>
          </>
        )}

      </main>

      <Footer scrollTo={() => {}} />
    </div>
  );
}
