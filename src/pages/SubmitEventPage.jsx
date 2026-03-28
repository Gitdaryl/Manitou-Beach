import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from '../components/Layout';
import { C } from '../data/config';
import yeti from '../data/errorMessages';
import { celebrate } from '../data/celebrate';

const EVENT_TYPES = [
  { value: 'free',              label: 'Just show up — no registration',       sub: "No sign-up needed. Leave the price blank if it's free, or add a door price below." },
  { value: 'rsvp_appreciated',  label: 'RSVP encouraged (but not required)',   sub: "We'll show an RSVP option, but people can still walk in." },
  { value: 'rsvp_required',     label: 'RSVP required — limited spots',        sub: 'Attendees must register. Set a capacity cap if needed.' },
  { value: 'own_ticketing',     label: 'Ticketed — I use my own system',       sub: "We'll show a \"Get Tickets\" button linking to your site or Eventbrite." },
  { value: 'platform_ticketing',label: "Ticketed — we'll handle it for you", sub: 'Secure checkout right on this site. No setup fees, no monthly charges. 1.25% + standard card processing.' },
  { value: 'vendor_market',     label: 'Vendor market — vendors pay for booths', sub: 'Vendors register and pay securely on this site. Money goes straight to your bank. You get an organizer portal.' },
];

const RECURRING_OPTIONS = ['None', 'Annual', 'Monthly', 'Weekly'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const RECURRING_LABELS = { None: 'None', Annual: 'Annual', Monthly: 'Monthly — pick a day below', Weekly: 'Weekly — pick a day below' };

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
  eventName: '', date: '', dateEnd: '', timeStart: '', timeEnd: '',
  location: '', description: '', cost: '',
  organizerName: '', email: '', phone: '',
  eventUrl: '', imageUrl: '',
  ticketPrice: '', ticketCapacity: '',
  rsvpCapacity: '',
  vendorFee: '', vendorCapacity: '',
  recurring: 'None', recurringDay: '', recurringEndDate: '',
  eventType: 'free',
};

const GUIDE_KEY = 'mb_event_guide_dismissed';

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
  const [guideOpen, setGuideOpen] = useState(false);
  const [formStep, setFormStep] = useState(1); // 1 = basics, 2 = details, 3 = you & publish

  const [step, setStep]               = useState('form'); // 'form' | 'verify' | 'stripe_redirect' | 'done'
  const [verifyCode, setVerifyCode]   = useState('');
  const [loading, setLoading]         = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resending, setResending]     = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [activatedData, setActivatedData] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const [ticketInfoOpen, setTicketInfoOpen] = useState(false);

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { setSubmitError('Image must be under 2 MB.'); return; }
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target.result;
      setImagePreview(src);
      setImageUploading(true);
      setSubmitError('');
      try {
        const base64 = src.split(',')[1];
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'events' }),
        });
        const data = await res.json();
        if (data.url) {
          setForm(f => ({ ...f, imageUrl: data.url }));
        } else {
          setSubmitError(data.error || 'Image upload failed.');
          setImagePreview('');
        }
      } catch {
        setSubmitError('Image upload failed — try again or paste a URL instead.');
        setImagePreview('');
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // On mount: restore active session and pre-fill organizer fields; show guide if not dismissed
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
    if (!localStorage.getItem(GUIDE_KEY)) {
      setGuideOpen(true);
    }
  }, []);

  const dismissGuide = () => {
    localStorage.setItem(GUIDE_KEY, '1');
    setGuideOpen(false);
  };

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
    setFormStep(1);
    setActivatedData(null);
    setVerifyCode('');
    setSubmitError('');
    setVerifyError('');
    setImagePreview('');
    setImageDragOver(false);
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
      const hpVal = document.querySelector('input[name="_hp"]')?.value || '';
      const body = session
        ? { ...form, sessionToken: session.token, _hp: hpVal }
        : { ...form, _hp: hpVal };

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
        celebrate();
      } else if (data.needsVerification) {
        setStep('verify');
      }
    } catch {
      setSubmitError(yeti.oops());
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
          setVerifyError(onboardData.error || yeti.payment());
          setStep('verify');
        }
      } else if (data.activated) {
        setActivatedData(data);
        setStep('done');
        celebrate();
      }
    } catch {
      setVerifyError(yeti.oops());
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
          /* ── DONE — MAGIC MOMENT ── */
          <div style={{ paddingTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <img src="/images/yeti/yeti-celebrates.png" alt="Yeti celebrating your event" style={{ width: 'clamp(140px, 28vw, 220px)', height: 'auto', marginBottom: 16, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }} />
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>
                {activatedData?.eventName || 'Your event'} is live!
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0 }}>
                This sounds fun — want to see what it looks like on the calendar?
              </p>
            </div>

            {/* See it live */}
            <a
              href="/happening"
              style={{ display: 'block', padding: '18px 22px', background: 'rgba(122,142,114,0.15)', border: '1px solid rgba(122,142,114,0.35)', borderRadius: 12, textDecoration: 'none', marginBottom: 14, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(122,142,114,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(122,142,114,0.15)'}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>See your event on the page</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                Check out how it looks on the community calendar — make sure everything reads right.
              </div>
            </a>

            {/* Edit */}
            {activatedData?.editToken && (
              <a
                href={`/events/edit?token=${activatedData.editToken}`}
                style={{ display: 'block', padding: '18px 22px', background: 'rgba(212,132,90,0.08)', border: '1px solid rgba(212,132,90,0.2)', borderRadius: 12, textDecoration: 'none', marginBottom: 14, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,132,90,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(212,132,90,0.08)'}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Need to change something?</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                  {session
                    ? 'Tap here to edit — and bookmark this link so you can come back anytime.'
                    : 'We also emailed you an edit link. You can update your event anytime — no login needed.'}
                </div>
              </a>
            )}

            {/* Share to Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/happening' : 'https://manitoubeachmichigan.com/happening')}&quote=${encodeURIComponent((activatedData?.eventName || 'My event') + ' is happening at Manitou Beach! Check it out:')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', padding: '18px 22px', background: 'rgba(66,103,178,0.1)', border: '1px solid rgba(66,103,178,0.25)', borderRadius: 12, textDecoration: 'none', marginBottom: 14, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(66,103,178,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(66,103,178,0.1)'}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Share it on Facebook — free exposure</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                The more people who know, the better the turnout. One tap, and your friends and neighbors see it.
              </div>
            </a>

            {/* Promote upsell */}
            <a
              href="/promote"
              style={{ display: 'block', padding: '18px 22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, textDecoration: 'none', marginBottom: 28, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Want even more eyeballs?</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                Homepage features, newsletter spots, and social boosts starting at $9. Over 4,000 locals see these every week.
              </div>
            </a>

            {/* Submit another */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={resetForNextEvent}
                style={{ padding: '14px 32px', background: '#D4845A', color: '#fff', border: 'none', borderRadius: 28, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Submit Another Event →
              </button>
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
          /* ── FORM — STEP FLOW ── */
          <>
            <div style={{ marginBottom: 40 }}>
              <div className="submit-hero-row" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ background: 'rgba(122,142,114,0.2)', border: '1px solid rgba(122,142,114,0.35)', borderRadius: 12, padding: '14px 18px', marginBottom: 0 }}>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(16px, 3vw, 20px)', color: C.cream, lineHeight: 1.3, marginBottom: 6 }}>
                      This is free. Always.
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                      No credit card. No catch. Three quick steps and you're on the community calendar.
                    </div>
                  </div>
                </div>
                <img src="/images/yeti/yeti-celebrates.png" alt="Yeti celebrating" style={{ width: 'clamp(100px, 20vw, 180px)', height: 'auto', flexShrink: 0, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }} />
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>Manitou Beach · Submit an Event</p>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: C.cream, margin: '0 0 12px', lineHeight: 1.2 }}>
                Get your event in front of<br /><em>the whole lake community.</em>
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: 0 }}>
                Quick text code, fill in the fun stuff, and you're on the calendar. That's it.
              </p>
            </div>

            {/* ── YETI GUIDE ── */}
            {guideOpen && (
              <div style={{ background: 'rgba(212,132,90,0.07)', border: '1px solid rgba(212,132,90,0.22)', borderRadius: 12, padding: '18px 20px', marginBottom: 28, position: 'relative' }}>
                <button
                  onClick={dismissGuide}
                  style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}
                  aria-label="Dismiss guide"
                >×</button>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#D4845A', margin: '0 0 12px' }}>Hey — quick heads up from the Yeti</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['① One text code, you\'re in.', 'First event? We\'ll text you a quick code. After that you\'re good for 8 hours — no more codes, just submit and go.'],
                    ['② Got a bunch of events?', 'Once you\'re verified, each one publishes with a single click. Your name and info stay filled in — just change the event stuff.'],
                    ['③ Weekly thing? One entry does it.', 'Farmers market every Saturday? Live music every Friday? Pick "Weekly," choose the day, set when it ends. Boom — whole season covered.'],
                    ['④ Multi-day?', 'Set a start and end date. We\'ll show the full range on the calendar. Easy.'],
                  ].map(([title, body]) => (
                    <div key={title} style={{ marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.cream }}>{title}</span>{' '}
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{body}</span>
                    </div>
                  ))}
                </div>
                <button onClick={dismissGuide} style={{ marginTop: 14, background: 'none', border: '1px solid rgba(212,132,90,0.3)', borderRadius: 20, padding: '6px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                  Got it — hide this
                </button>
              </div>
            )}

            {!guideOpen && (
              <button
                onClick={() => setGuideOpen(true)}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'rgba(212,132,90,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0, marginBottom: 4 }}
              >
                ? Tips for listing multiple events
              </button>
            )}

            {/* ── STEP PROGRESS BAR ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, padding: '0 4px' }}>
              {[
                { num: 1, title: 'The Basics' },
                { num: 2, title: 'The Fun Stuff' },
                { num: 3, title: 'You & Publish' },
              ].map((s, i) => {
                const done = formStep > s.num;
                const active = formStep === s.num;
                return (
                  <React.Fragment key={s.num}>
                    {i > 0 && (
                      <div style={{ flex: 1, height: 2, background: done ? '#7A8E72' : 'rgba(255,255,255,0.1)', margin: '0 -2px', transition: 'background 0.3s' }} />
                    )}
                    <div
                      onClick={() => { if (done || active) setFormStep(s.num); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: done || active ? 'pointer' : 'default', minWidth: 80 }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif",
                        background: done ? '#7A8E72' : active ? '#D4845A' : 'rgba(255,255,255,0.08)',
                        color: done || active ? '#fff' : 'rgba(255,255,255,0.3)',
                        border: active ? '2px solid rgba(212,132,90,0.5)' : done ? '2px solid #7A8E72' : '2px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.3s',
                      }}>
                        {done ? '✓' : s.num}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: active ? '#D4845A' : done ? '#7A8E72' : 'rgba(255,255,255,0.25)', transition: 'color 0.3s', textAlign: 'center' }}>
                        {s.title}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* ══════════════════════════════════════ */}
            {/* STEP 1 — THE BASICS                   */}
            {/* ══════════════════════════════════════ */}
            {formStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#D4845A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>1</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.cream, fontFamily: "'Libre Franklin', sans-serif" }}>The Basics</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>What's happening and when?</div>
                  </div>
                </div>

                {/* One-time vs Recurring */}
                <div>
                  <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, recurring: 'None' }))}
                      style={{ flex: 1, padding: '14px 16px', border: 'none', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 0.5, transition: 'all 0.15s', background: form.recurring === 'None' ? '#D4845A' : 'rgba(255,255,255,0.04)', color: form.recurring === 'None' ? '#fff' : 'rgba(255,255,255,0.45)' }}
                    >
                      One-time event
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, recurring: f.recurring === 'None' ? 'Weekly' : f.recurring }))}
                      style={{ flex: 1, padding: '14px 16px', border: 'none', borderLeft: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 0.5, transition: 'all 0.15s', background: form.recurring !== 'None' ? '#D4845A' : 'rgba(255,255,255,0.04)', color: form.recurring !== 'None' ? '#fff' : 'rgba(255,255,255,0.45)' }}
                    >
                      Recurring event
                    </button>
                  </div>
                </div>

                {/* Event Name */}
                <div>
                  <label style={label}>Event Name *</label>
                  <input style={input} type="text" value={form.eventName} onChange={set('eventName')} placeholder="e.g. Corks & Kegs Wine Festival" autoFocus />
                </div>

                {/* Date section */}
                {form.recurring === 'None' ? (
                  <div className="event-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={label}>Date *</label>
                      <input style={input} type="date" value={form.date} onChange={set('date')} />
                    </div>
                    <div>
                      <label style={label}>End Date <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— if multi-day</span></label>
                      <input style={input} type="date" value={form.dateEnd} onChange={set('dateEnd')} min={form.date || undefined} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="event-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={label}>How often?</label>
                        <select value={form.recurring} onChange={set('recurring')} style={{ ...input, cursor: 'pointer' }}>
                          {RECURRING_OPTIONS.filter(o => o !== 'None').map(o => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={label}>Day of Week</label>
                        <select value={form.recurringDay} onChange={set('recurringDay')} style={{ ...input, cursor: 'pointer' }}>
                          <option value="">— select —</option>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="event-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={label}>First date *</label>
                        <input style={input} type="date" value={form.date} onChange={set('date')} />
                      </div>
                      <div>
                        <label style={label}>Last date of series</label>
                        <input style={input} type="date" value={form.recurringEndDate} onChange={set('recurringEndDate')} min={form.date || undefined} />
                      </div>
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6, margin: 0 }}>
                      e.g. Farmers market every Saturday, May 24 – Oct 11 → Weekly · Saturday
                    </p>
                  </div>
                )}

                {/* Times */}
                <div className="event-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

                {submitError && formStep === 1 && <div style={{ fontSize: 13, color: '#e07070', fontWeight: 500 }}>{submitError}</div>}

                {/* Next → */}
                <button
                  type="button"
                  onClick={() => {
                    if (!form.eventName.trim()) { setSubmitError('Give your event a name so people know what it is.'); return; }
                    if (!form.date) { setSubmitError('Pick a date — even a rough one works.'); return; }
                    setSubmitError('');
                    setFormStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ padding: '16px 24px', background: '#D4845A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", transition: 'background 0.2s' }}
                >
                  Next — Tell People More →
                </button>
              </div>
            )}

            {/* ══════════════════════════════════════ */}
            {/* STEP 2 — THE FUN STUFF                */}
            {/* ══════════════════════════════════════ */}
            {formStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#D4845A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>2</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.cream, fontFamily: "'Libre Franklin', sans-serif" }}>The Fun Stuff</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Description, type, image — make it pop.</div>
                  </div>
                </div>

                {/* Quick recap of Step 1 */}
                <div style={{ background: 'rgba(122,142,114,0.1)', border: '1px solid rgba(122,142,114,0.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.cream }}>{form.eventName}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                      {form.date}{form.timeStart ? ` · ${form.timeStart}` : ''}{form.location ? ` · ${form.location}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFormStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ background: 'none', border: 'none', color: '#D4845A', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: '4px 8px', flexShrink: 0 }}
                  >
                    Edit
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label style={label}>Description</label>
                  <textarea
                    value={form.description} onChange={set('description')}
                    placeholder="Tell people what to expect — 2–4 sentences works great."
                    rows={4}
                    style={{ ...input, resize: 'vertical', lineHeight: 1.7 }}
                    autoFocus
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
                      <button
                        onClick={() => setTicketInfoOpen(true)}
                        style={{ fontSize: 12, color: '#7A8E72', fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'left' }}
                      >
                        See what you and your attendees get →
                      </button>
                    </div>
                  </div>
                )}

                {/* Conditional: Platform ticketing */}
                {form.eventType === 'platform_ticketing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="event-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={label}>Ticket Price ($)</label>
                        <input style={input} type="number" min="0" step="0.01" value={form.ticketPrice} onChange={set('ticketPrice')} placeholder="25.00" />
                      </div>
                      <div>
                        <label style={label}>Capacity <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                        <input style={input} type="number" min="1" value={form.ticketCapacity} onChange={set('ticketCapacity')} placeholder="e.g. 200" />
                      </div>
                    </div>
                    <div style={{ background: 'rgba(122,142,114,0.1)', border: '1px solid rgba(122,142,114,0.25)', borderRadius: 8, padding: '14px 16px' }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 8px' }}>
                        <strong style={{ color: 'rgba(255,255,255,0.75)' }}>What your 1.25% gets your attendees:</strong> automatic email & text reminders the day before and day of your event, plus instant notifications if anything changes — postponed, moved, cancelled. No extra cost, no extra work.
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: '0 0 8px' }}>
                        Stripe charges their standard processing fee (~2.9% + 30¢) on top — that's the same fee they charge everyone, including Eventbrite.
                      </p>
                      <button
                        onClick={() => setTicketInfoOpen(true)}
                        style={{ fontSize: 12, color: '#7A8E72', fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'left' }}
                      >
                        See how it works for you and your attendees →
                      </button>
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
                  <div className="event-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                      After verifying your phone, we'll walk you through connecting your bank account (takes ~5 minutes). Money goes directly to you — our platform fee is just 1.25%.
                    </p>
                  </div>
                )}

                {/* Cost */}
                <div>
                  <label style={label}>Cost {form.eventType === 'free' ? '' : 'description '}<span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— {form.eventType === 'free' ? 'leave blank if free' : 'shown on the event card'}</span></label>
                  <input style={input} type="text" value={form.cost} onChange={set('cost')} placeholder={form.eventType === 'free' ? 'e.g. "$5 at the door" — or leave blank for free' : 'e.g. "Free", "$10 at the door", "Tickets from $25"'} />
                </div>

                {/* Image Upload */}
                <div>
                  <label style={label}>Event Image / Logo <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span></label>
                  <div
                    onClick={() => document.getElementById('event-img-upload').click()}
                    onDragOver={e => { e.preventDefault(); setImageDragOver(true); }}
                    onDragLeave={() => setImageDragOver(false)}
                    onDrop={e => { e.preventDefault(); setImageDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                    style={{ border: `1.5px dashed ${imageDragOver ? 'rgba(212,132,90,0.6)' : 'rgba(255,255,255,0.15)'}`, borderRadius: 10, padding: imagePreview || form.imageUrl ? '12px' : '28px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: imageDragOver ? 'rgba(212,132,90,0.06)' : 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => { if (!imageDragOver) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                    onMouseLeave={e => { if (!imageDragOver) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  >
                    {imageUploading ? (
                      <span style={{ fontSize: 13, color: '#D4845A', fontFamily: "'Libre Franklin', sans-serif" }}>Uploading…</span>
                    ) : imagePreview || form.imageUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <img src={imagePreview || form.imageUrl} alt="preview" style={{ maxHeight: 140, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif" }}>Click or drop to replace</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 28, opacity: 0.3 }}>📷</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'Libre Franklin', sans-serif" }}>Drop an image here or click to upload</span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'Libre Franklin', sans-serif" }}>JPG, PNG, or WebP · Max 2 MB</span>
                      </div>
                    )}
                    <input id="event-img-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleImageFile(e.target.files[0]); e.target.value = ''; }} />
                  </div>
                  {!imagePreview && !form.imageUrl && (
                    <div style={{ marginTop: 8 }}>
                      <input style={{ ...input, fontSize: 12 }} type="text" value={form.imageUrl} onChange={set('imageUrl')} placeholder="…or paste an image URL" />
                    </div>
                  )}
                  {(imagePreview || form.imageUrl) && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(''); setForm(f => ({ ...f, imageUrl: '' })); }}
                      style={{ marginTop: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0 }}
                    >
                      ✕ Remove image
                    </button>
                  )}
                </div>

                {submitError && formStep === 2 && <div style={{ fontSize: 13, color: '#e07070', fontWeight: 500 }}>{submitError}</div>}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => { setFormStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ flex: 0, padding: '14px 20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError('');
                      setFormStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ flex: 1, padding: '16px 24px', background: '#D4845A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", transition: 'background 0.2s' }}
                  >
                    Next — Almost Done! →
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════ */}
            {/* STEP 3 — YOU & PUBLISH                */}
            {/* ══════════════════════════════════════ */}
            {formStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#D4845A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>3</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.cream, fontFamily: "'Libre Franklin', sans-serif" }}>You & Publish</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Who's behind this event? Then you're done.</div>
                  </div>
                </div>

                {/* Summary of Steps 1+2 */}
                <div style={{ background: 'rgba(122,142,114,0.1)', border: '1px solid rgba(122,142,114,0.2)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>{form.eventName}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                    {form.date}{form.dateEnd ? ` – ${form.dateEnd}` : ''}{form.timeStart ? ` · ${form.timeStart}` : ''}{form.timeEnd ? `–${form.timeEnd}` : ''}
                    {form.location ? <><br />{form.location}</> : ''}
                    {form.description ? <><br /><span style={{ color: 'rgba(255,255,255,0.3)' }}>{form.description.slice(0, 80)}{form.description.length > 80 ? '…' : ''}</span></> : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="button" onClick={() => { setFormStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: '#D4845A', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0 }}>
                      Edit basics
                    </button>
                    <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                    <button type="button" onClick={() => { setFormStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ background: 'none', border: 'none', color: '#D4845A', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0 }}>
                      Edit details
                    </button>
                  </div>
                </div>

                {/* Organizer contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={label}>Your Name / Organization</label>
                    <input style={input} type="text" value={form.organizerName} onChange={set('organizerName')} placeholder="e.g. Irish Hills Wine Trail" autoFocus />
                  </div>
                  <div className="event-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={label}>Email *</label>
                      <input style={input} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                    </div>
                    <div>
                      <label style={label}>Phone * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— we'll text you a code</span></label>
                      <input style={input} type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
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
                      You're verified — just fill it out and hit publish!
                    </span>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => { setFormStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ flex: 0, padding: '14px 20px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ flex: 1, padding: '16px 24px', background: loading ? '#5C5248' : '#7A8E72', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer', fontFamily: "'Libre Franklin', sans-serif", transition: 'background 0.2s' }}
                  >
                    {loading
                      ? (session ? 'Publishing…' : 'Sending code…')
                      : (session ? 'Publish My Event!' : 'Submit & Verify →')}
                  </button>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.7, margin: '0' }}>
                  {session
                    ? 'You\'re verified — this publishes instantly.'
                    : "We'll text you a quick code to make sure you're real. Takes 30 seconds."}
                </p>
              </div>
            )}
          </>
        )}

      </main>

      <Footer scrollTo={() => {}} />

      {/* ── TICKETING INFO LIGHTBOX ── */}
      {ticketInfoOpen && (
        <div
          onClick={() => setTicketInfoOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#1a1f2a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '32px 28px', position: 'relative' }}
          >
            {/* Close button */}
            <button
              onClick={() => setTicketInfoOpen(false)}
              style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0 }}
              aria-label="Close"
            >×</button>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.cream, margin: '0 0 6px', fontFamily: "'Libre Franklin', sans-serif" }}>
              Here's what happens when you sell tickets through us
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 28px', lineHeight: 1.6 }}>
              You focus on your event — we handle the rest.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* 1. Tickets */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 12, background: 'rgba(122,142,114,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A8E72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                    <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Tickets that work for everyone</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    Your attendees buy right on this site — no account needed. They can save the ticket to their phone or print it at home. Works either way.
                  </div>
                </div>
              </div>

              {/* 2. Reminders */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 12, background: 'rgba(212,132,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4845A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
                    <path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Better turnout, automatically</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    We text your attendees the day before — <em style={{ color: 'rgba(255,255,255,0.65)' }}>"Looking forward to seeing you tomorrow!"</em> — and again the morning of. No-shows drop, you don't lift a finger.
                  </div>
                </div>
              </div>

              {/* 3. QR Check-in */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 12, background: 'rgba(122,142,114,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A8E72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3z"/><path d="M21 14v7h-7"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Smooth check-in at the door</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    Every ticket has a QR code. Any staff member or volunteer opens their phone camera, scans it — valid or not, instant answer. No special app, no equipment.
                  </div>
                </div>
              </div>

              {/* 4. Dashboard */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 12, background: 'rgba(212,132,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4845A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Know your numbers</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    See how many tickets sold, who showed up, and what you earned — all in one place. We'll text you the link when your event goes live.
                  </div>
                </div>
              </div>

              {/* 5. Announcements */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 12, background: 'rgba(122,142,114,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A8E72" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Plans change? We've got it</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                    If your event gets postponed, moved, or cancelled — we notify every ticket holder by text so they know right away. No frantic phone calls.
                  </div>
                </div>
              </div>

            </div>

            {/* Fee summary */}
            <div style={{ marginTop: 28, padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.cream, marginBottom: 8 }}>What it costs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <span>Setup fee</span><span style={{ fontWeight: 600, color: '#7A8E72' }}>None</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <span>Monthly fee</span><span style={{ fontWeight: 600, color: '#7A8E72' }}>None</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <span>Platform fee</span><span style={{ fontWeight: 600, color: C.cream }}>1.25% per ticket</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  <span>Card processing</span><span style={{ fontWeight: 600, color: C.cream }}>~2.9% + 30¢</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '10px 0 0', lineHeight: 1.5 }}>
                Card processing is Stripe's standard rate — the same fee every platform pays, including Eventbrite. The difference is we don't pile our own fees on top of it.
              </p>
            </div>

            <button
              onClick={() => setTicketInfoOpen(false)}
              style={{ marginTop: 20, width: '100%', padding: '12px 20px', background: 'rgba(122,142,114,0.2)', border: '1px solid rgba(122,142,114,0.35)', borderRadius: 10, color: C.cream, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
            >
              Got it — back to my event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
