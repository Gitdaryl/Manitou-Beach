import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn } from '../components/Shared';
import SEOHead from '../components/SEOHead';

const STORAGE_PREFIX = 'mb-google-setup-';

const DEFAULT_FORM = {
  businessName: '',
  slug: '',
  hasGoogle: '',
  existingGoogleRef: '',
  ownerName: '',
  phone: '',
  email: '',
  locationType: '',
  serviceArea: '',
  whatYouDo: '',
  years: '',
  story: '',
  verifyPref: '',
  reachTime: '',
};

const TOTAL_QUESTION_STEPS = 6;

function yearsReflection(raw) {
  const n = parseInt(raw, 10);
  if (!n || isNaN(n)) return '';
  if (n >= 20) return `${n} years. That's the kind of trust people search for.`;
  if (n >= 10) return `${n} years in. That's real experience.`;
  if (n >= 3)  return `${n} years under your belt. Solid.`;
  return `Fresh on the scene. Google rewards that with the right setup.`;
}

function storyReflection(raw) {
  const trimmed = (raw || '').trim().toLowerCase();
  if (!trimmed) return '';
  if (trimmed.includes('help me with this')) return `We've got you. We'll draft it from your profile.`;
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount < 12) return `Short and honest. That reads great.`;
  return `Beautifully put. Real voice beats marketing speak - and Google agrees.`;
}

function locationReflection(locationType, serviceArea) {
  if (locationType === 'storefront') return `A place people can walk into. We'll make sure it shows up on the map.`;
  if (locationType === 'mobile') {
    const area = (serviceArea || '').trim();
    if (area) return `Got it. We'll set Google up so folks in ${area} can find you - and keep your home address private.`;
    return `A traveling trade. We'll keep your home address private and set Google up for your service area.`;
  }
  if (locationType === 'both') return `Storefront and service calls. We'll set Google up for both.`;
  return '';
}

function googlePresenceReflection(hasGoogle) {
  if (hasGoogle === 'no')      return `Fresh start. We build yours from scratch - cleaner that way.`;
  if (hasGoogle === 'notsure') return `No problem. We'll look for you. If there's something out there, we'll clean it up.`;
  if (hasGoogle === 'yes')     return `Even better. We'll claim what's there and make it shine.`;
  return '';
}

function ownerReflection(name) {
  const first = (name || '').trim().split(/\s+/)[0];
  if (!first) return '';
  return `Nice to meet you, ${first}.`;
}

function whatYouDoReflection(text) {
  const t = (text || '').trim();
  if (!t) return '';
  return `Perfect. That's what we'll anchor your Google listing around.`;
}

function verifyReflection(pref) {
  if (pref === 'postcard') return `Postcard it is. Takes 5-7 days, we'll walk you through it when it lands.`;
  if (pref === 'phone')    return `Phone call - fastest route. We'll prep you for the quick call.`;
  if (pref === 'video')    return `Video call - the personal touch. We'll be on the call with you.`;
  return '';
}

function businessReflection(name) {
  const t = (name || '').trim();
  if (t.length < 2) return '';
  return `Got it. That's exactly how it'll show on Google.`;
}

function phoneReflection(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length < 10) return '';
  return `Perfect. That's where Google will reach you.`;
}

function emailReflection(raw) {
  const t = (raw || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return '';
  return `All set. Updates will land in your inbox.`;
}

function reachTimeReflection(raw) {
  const t = (raw || '').trim();
  if (t.length < 2) return '';
  return `Noted. We'll stick to that window.`;
}

function FieldCheck({ show, children }) {
  if (!show || !children) return null;
  return (
    <div className="gs-check" style={{
      marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 10,
      fontSize: 14, color: '#5C6E55', fontWeight: 600,
      background: 'rgba(122,142,114,0.10)', padding: '10px 14px', borderRadius: 10,
      lineHeight: 1.5, border: '1px solid rgba(122,142,114,0.22)',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A8E72" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default function GBPSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillBusiness = searchParams.get('business') || '';
  const prefillSlug = searchParams.get('slug') || '';

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    businessName: prefillBusiness,
    slug: prefillSlug,
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [nudge, setNudge] = useState('');
  const cardRef = useRef(null);

  const storageKey = STORAGE_PREFIX + (prefillSlug || 'anon');

  // Load saved progress + prefill from business record
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(f => ({ ...f, ...parsed, businessName: prefillBusiness || parsed.businessName, slug: prefillSlug || parsed.slug }));
        if (parsed.step) setStep(parsed.step);
      }
    } catch {}
    window.scrollTo(0, 0);
    // Best-effort prefill from the business record so phone/email are not re-asked
    if (prefillSlug) {
      fetch(`/api/businesses?all=true`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          const list = Array.isArray(data) ? data : data?.businesses || [];
          const match = list.find(b => b.slug === prefillSlug || b.name === prefillBusiness);
          if (match) {
            setForm(f => ({
              ...f,
              phone: f.phone || match.phone || '',
              email: f.email || match.email || '',
            }));
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line

  // Auto-save
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...form, step }));
    } catch {}
  }, [form, step, storageKey]);

  // Focus the card on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNudge('');
  }, [step]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const scrollTo = id => { window.location.href = '/#' + id; };

  function goNext() {
    const msg = validate(step);
    if (msg) { setNudge(msg); return; }
    setNudge('');
    setStep(s => s + 1);
  }
  function goBack() {
    setNudge('');
    setStep(s => Math.max(0, s - 1));
  }

  function validate(s) {
    if (s === 1) {
      if (!form.hasGoogle) return `Just pick whichever fits - there's no wrong answer.`;
    }
    if (s === 2) {
      if (!form.ownerName.trim()) return `We need a name so Google knows who to verify.`;
      if (!form.businessName.trim()) return `Your business name helps us find the right listing.`;
      if (!form.phone.trim()) return `A phone number Google can reach.`;
      if (!form.email.trim()) return `An email so we can send you updates.`;
    }
    if (s === 3) {
      if (!form.locationType) return `Pick whichever fits - shop, traveling, or a bit of both.`;
      if (form.locationType !== 'storefront' && !form.serviceArea.trim()) {
        return `Give us a couple of towns or a radius - even a rough one is fine.`;
      }
    }
    if (s === 4) {
      if (!form.whatYouDo.trim()) return `A few words is plenty. Whatever you'd tell a new neighbor.`;
    }
    if (s === 6) {
      if (!form.verifyPref) return `Pick whichever feels easiest - we help you with any of them.`;
      if (!form.reachTime.trim()) return `Even a rough window is fine. "Mornings" works.`;
    }
    return '';
  }

  async function handleSubmit() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gbp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          ownerName: form.ownerName,
          phone: form.phone,
          email: form.email,
          hasGBP: form.hasGoogle === 'yes' ? 'Yes' : form.hasGoogle === 'no' ? 'No' : 'Not Sure',
          slug: form.slug,
          // Structured new fields:
          existingGoogleRef: form.existingGoogleRef,
          locationType: form.locationType,
          serviceArea: form.serviceArea,
          whatYouDo: form.whatYouDo,
          years: form.years,
          story: form.story,
          verifyPref: form.verifyPref,
          reachTime: form.reachTime,
          // Legacy fields kept for email compatibility:
          address: form.locationType === 'storefront' ? '' : '',
          category: form.whatYouDo,
          website: '',
          notes: [
            form.existingGoogleRef ? `Existing Google reference: ${form.existingGoogleRef}` : '',
            form.serviceArea ? `Service area: ${form.serviceArea}` : '',
            form.whatYouDo ? `What they do: ${form.whatYouDo}` : '',
            form.years ? `Years in business: ${form.years}` : '',
            form.story ? `Their story: ${form.story}` : '',
            form.verifyPref ? `Preferred verification: ${form.verifyPref}` : '',
            form.reachTime ? `Best reach time: ${form.reachTime}` : '',
            form.locationType ? `Location type: ${form.locationType}` : '',
          ].filter(Boolean).join('\n'),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something hiccuped on our end.');
      setSubmitted(true);
      try { localStorage.removeItem(storageKey); } catch {}
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '16px 18px', borderRadius: 12,
    border: `1.5px solid ${C.sand}`, background: '#fff',
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 17,
    color: C.text, boxSizing: 'border-box', outline: 'none',
    transition: 'border-color 0.15s',
  };
  const labelStyle = {
    fontSize: 13, fontWeight: 700, color: C.textLight,
    display: 'block', marginBottom: 8,
    fontFamily: "'Libre Franklin', sans-serif",
  };
  const tapStyle = (active) => ({
    width: '100%', textAlign: 'left',
    padding: '18px 20px', borderRadius: 14,
    border: `2px solid ${active ? C.sage : C.sand}`,
    background: active ? `${C.sage}12` : '#fff',
    color: C.text, cursor: 'pointer',
    fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 16, fontWeight: active ? 700 : 500,
    display: 'flex', alignItems: 'flex-start', gap: 14,
    transition: 'all 0.15s',
    marginBottom: 10,
  });

  // ── Step content renderers ───────────────────────────────────────────────
  function Step0Welcome() {
    return (
      <>
        <div style={{ fontSize: 44, marginBottom: 12 }}>👋</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 700, color: C.dusk, margin: '0 0 14px', lineHeight: 1.2 }}>
          Let's get you on Google.
        </h2>
        <p style={{ fontSize: 17, color: C.textLight, lineHeight: 1.7, margin: '0 0 18px' }}>
          When somebody nearby pulls out their phone and searches for what you do, Google shows them a short list of businesses. We're going to make sure you're on that list.
        </p>
        <p style={{ fontSize: 17, color: C.textLight, lineHeight: 1.7, margin: '0 0 10px' }}>
          Six quick questions. About five minutes. No tech knowledge needed - and nothing gets saved to Google until we talk with you first.
        </p>
        <div style={{ background: `${C.sage}10`, border: `1px solid ${C.sage}30`, borderRadius: 12, padding: '14px 18px', margin: '24px 0 8px' }}>
          <p style={{ fontSize: 14, color: C.sageDark, margin: 0, lineHeight: 1.6 }}>
            <strong>Tip:</strong> If you get interrupted, come back anytime. Your answers are saved as you go.
          </p>
        </div>
      </>
    );
  }

  function Step1Google() {
    const reflection = googlePresenceReflection(form.hasGoogle);
    return (
      <>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 700, color: C.dusk, margin: '0 0 10px', lineHeight: 1.25 }}>
          Have you ever set up a Google listing before?
        </h2>
        <p style={{ fontSize: 16, color: C.textLight, margin: '0 0 24px', lineHeight: 1.6 }}>
          Meaning: the thing that shows up when someone Googles your business name and a little box appears on the right with your phone and hours.
        </p>
        {[
          { val: 'no',      icon: '✨', title: 'No, brand new', desc: "Perfect. We'll build it from scratch." },
          { val: 'notsure', icon: '🤔', title: "Not sure",      desc: "That's fine - we'll look and let you know." },
          { val: 'yes',     icon: '✅', title: 'Yes, I have one', desc: "Even better. We'll claim it and clean it up." },
        ].map(opt => (
          <button key={opt.val} type="button" onClick={() => set('hasGoogle', opt.val)} style={tapStyle(form.hasGoogle === opt.val)}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{opt.icon}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700, color: C.dusk, marginBottom: 2 }}>{opt.title}</span>
              <span style={{ display: 'block', fontSize: 14, color: C.textMuted, fontWeight: 500 }}>{opt.desc}</span>
            </span>
          </button>
        ))}
        <FieldCheck show={!!reflection}>{reflection}</FieldCheck>
        {form.hasGoogle === 'yes' && (
          <FadeIn>
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Paste the link, or just type the business name as Google shows it</label>
              <input
                className="gbp-input" style={inputStyle}
                placeholder="Copy from Google or type it here"
                value={form.existingGoogleRef}
                onChange={e => set('existingGoogleRef', e.target.value)}
              />
              <p style={{ margin: '8px 0 0', fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
                Can't find it? Skip this and move on - we'll track it down.
              </p>
            </div>
          </FadeIn>
        )}
      </>
    );
  }

  function Step2Owner() {
    return (
      <>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 700, color: C.dusk, margin: '0 0 10px', lineHeight: 1.25 }}>
          Who runs the show?
        </h2>
        <p style={{ fontSize: 16, color: C.textLight, margin: '0 0 24px', lineHeight: 1.6 }}>
          Google wants to know there's a real person behind the business. That's you.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Your name</label>
            <input
              className="gbp-input" style={inputStyle}
              placeholder="First and last"
              value={form.ownerName}
              onChange={e => set('ownerName', e.target.value)}
              autoFocus
            />
            <FieldCheck show={!!ownerReflection(form.ownerName)}>{ownerReflection(form.ownerName)}</FieldCheck>
          </div>
          <div>
            <label style={labelStyle}>Business name</label>
            <input
              className="gbp-input" style={inputStyle}
              placeholder="Exactly how you want it on Google"
              value={form.businessName}
              onChange={e => set('businessName', e.target.value)}
            />
            <FieldCheck show={!!businessReflection(form.businessName)}>{businessReflection(form.businessName)}</FieldCheck>
          </div>
          <div>
            <label style={labelStyle}>A phone number Google can reach you at</label>
            <input
              className="gbp-input" style={inputStyle} type="tel"
              placeholder="Your business line"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
            <FieldCheck show={!!phoneReflection(form.phone)}>{phoneReflection(form.phone)}</FieldCheck>
          </div>
          <div>
            <label style={labelStyle}>Your email (just so we can send you updates)</label>
            <input
              className="gbp-input" style={inputStyle} type="email"
              placeholder="you@yourbusiness.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            <FieldCheck show={!!emailReflection(form.email)}>{emailReflection(form.email)}</FieldCheck>
          </div>
        </div>
      </>
    );
  }

  function Step3Location() {
    return (
      <>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 700, color: C.dusk, margin: '0 0 10px', lineHeight: 1.25 }}>
          Where does the work happen?
        </h2>
        <p style={{ fontSize: 16, color: C.textLight, margin: '0 0 24px', lineHeight: 1.6 }}>
          This tells Google whether to show a pin on the map, or just the towns you serve. Important - it's how we keep your home address private if you work out of your house.
        </p>
        {[
          { val: 'storefront', icon: '🏪', title: 'Customers come to my shop or office', desc: 'A place with a sign and a door.' },
          { val: 'mobile',     icon: '🚐', title: 'I travel to customers',                desc: 'Electrician, plumber, contractor, groomer - you go to them.' },
          { val: 'both',       icon: '🔀', title: 'A bit of both',                         desc: 'Shop you can visit and jobs on the road.' },
        ].map(opt => (
          <button key={opt.val} type="button" onClick={() => set('locationType', opt.val)} style={tapStyle(form.locationType === opt.val)}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{opt.icon}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700, color: C.dusk, marginBottom: 2 }}>{opt.title}</span>
              <span style={{ display: 'block', fontSize: 14, color: C.textMuted, fontWeight: 500 }}>{opt.desc}</span>
            </span>
          </button>
        ))}
        <FieldCheck show={form.locationType === 'storefront' || form.locationType === 'both' || (form.locationType === 'mobile' && !!form.serviceArea.trim())}>
          {locationReflection(form.locationType, form.serviceArea)}
        </FieldCheck>
        {(form.locationType === 'mobile' || form.locationType === 'both') && (
          <FadeIn>
            <div style={{ marginTop: 18 }}>
              <label style={labelStyle}>Which areas do you cover?</label>
              <input
                className="gbp-input" style={inputStyle}
                placeholder="e.g., Manitou Beach, Adrian, Tecumseh, anywhere in Lenawee County"
                value={form.serviceArea}
                onChange={e => set('serviceArea', e.target.value)}
              />
              <p style={{ margin: '8px 0 0', fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
                Towns, a county, or a mile radius - whatever comes naturally. Rough is fine.
              </p>
            </div>
          </FadeIn>
        )}
      </>
    );
  }

  function Step4WhatYouDo() {
    return (
      <>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 700, color: C.dusk, margin: '0 0 10px', lineHeight: 1.25 }}>
          In your own words - what do you do?
        </h2>
        <p style={{ fontSize: 16, color: C.textLight, margin: '0 0 24px', lineHeight: 1.6 }}>
          Whatever you'd say if a new neighbor asked what you do for a living. One line is plenty.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>What do folks hire you for?</label>
            <input
              className="gbp-input" style={inputStyle}
              placeholder="e.g., I'm an electrician. Or: we run a breakfast diner."
              value={form.whatYouDo}
              onChange={e => set('whatYouDo', e.target.value)}
              autoFocus
            />
            <p style={{ margin: '8px 0 0', fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
              Don't overthink it. We translate this into Google's categories for you.
            </p>
            <FieldCheck show={!!whatYouDoReflection(form.whatYouDo)}>{whatYouDoReflection(form.whatYouDo)}</FieldCheck>
          </div>
          <div>
            <label style={labelStyle}>How many years have you been at it?</label>
            <input
              className="gbp-input" style={{ ...inputStyle, maxWidth: 220 }} type="number" min="0" max="99"
              placeholder="e.g., 22"
              value={form.years}
              onChange={e => set('years', e.target.value)}
            />
            <FieldCheck show={!!yearsReflection(form.years)}>{yearsReflection(form.years)}</FieldCheck>
          </div>
        </div>
      </>
    );
  }

  function Step5Story() {
    return (
      <>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 700, color: C.dusk, margin: '0 0 10px', lineHeight: 1.25 }}>
          If a neighbor asked, what makes you different?
        </h2>
        <p style={{ fontSize: 16, color: C.textLight, margin: '0 0 24px', lineHeight: 1.6 }}>
          Two or three sentences is plenty. We'll shape this into a proper Google description for you - you won't see any "SEO speak" in the final version.
        </p>
        <label style={labelStyle}>Your version</label>
        <textarea
          className="gbp-input" style={{ ...inputStyle, minHeight: 150, resize: 'vertical', lineHeight: 1.6 }}
          placeholder="e.g., We've been the go-to plumber in Lenawee County for 22 years. Family-run. We show up on time, we don't leave messes, and we do what we said we'd do."
          value={form.story}
          onChange={e => set('story', e.target.value)}
          autoFocus
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
            Stuck? Type <strong>help me with this</strong> and we'll draft it from your profile.
          </p>
          <button
            type="button"
            onClick={() => set('story', 'help me with this')}
            style={{
              background: 'transparent', border: `1.5px solid ${C.sand}`,
              borderRadius: 50, padding: '8px 16px', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: C.textLight,
              fontFamily: "'Libre Franklin', sans-serif",
            }}
          >
            Help me write this
          </button>
        </div>
        <FieldCheck show={!!storyReflection(form.story)}>{storyReflection(form.story)}</FieldCheck>
      </>
    );
  }

  function Step6Verify() {
    return (
      <>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4.5vw, 28px)', fontWeight: 700, color: C.dusk, margin: '0 0 10px', lineHeight: 1.25 }}>
          Last one - how should Google check you're you?
        </h2>
        <p style={{ fontSize: 16, color: C.textLight, margin: '0 0 24px', lineHeight: 1.6 }}>
          Google does a quick ownership check before turning your listing on. Pick whichever feels easiest - we'll walk you through every one of them.
        </p>
        {[
          { val: 'postcard', icon: '📮', title: 'A postcard in the mail', desc: 'Most common. Takes 5-7 days. You read us a short code when it arrives.' },
          { val: 'phone',    icon: '📞', title: 'A phone call',           desc: 'Fastest - if Google offers it. They call, we help you answer.' },
          { val: 'video',    icon: '🎥', title: 'A short video call',     desc: 'About 20 minutes. You show your sign or your van. We are on the call with you.' },
        ].map(opt => (
          <button key={opt.val} type="button" onClick={() => set('verifyPref', opt.val)} style={tapStyle(form.verifyPref === opt.val)}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>{opt.icon}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700, color: C.dusk, marginBottom: 2 }}>{opt.title}</span>
              <span style={{ display: 'block', fontSize: 14, color: C.textMuted, fontWeight: 500 }}>{opt.desc}</span>
            </span>
          </button>
        ))}
        <FieldCheck show={!!verifyReflection(form.verifyPref)}>{verifyReflection(form.verifyPref)}</FieldCheck>
        <div style={{ marginTop: 22 }}>
          <label style={labelStyle}>When's a good time to reach you?</label>
          <input
            className="gbp-input" style={inputStyle}
            placeholder="e.g., mornings before 10, or Tuesday-Thursday afternoons"
            value={form.reachTime}
            onChange={e => set('reachTime', e.target.value)}
          />
          <p style={{ margin: '8px 0 0', fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
            We only call if Google needs something from you - never for sales.
          </p>
          <FieldCheck show={!!reachTimeReflection(form.reachTime)}>{reachTimeReflection(form.reachTime)}</FieldCheck>
        </div>
      </>
    );
  }

  function SuccessScreen() {
    const first = (form.ownerName || '').trim().split(/\s+/)[0] || 'friend';
    return (
      <div style={{ textAlign: 'center', padding: '20px 8px' }}>
        <div style={{
          width: 92, height: 92, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.sage} 0%, ${C.sageDark} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 26px',
          boxShadow: `0 12px 32px ${C.sage}50`,
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 5vw, 34px)', fontWeight: 700, color: C.dusk, margin: '0 0 14px', lineHeight: 1.2 }}>
          We've got everything we need, {first}.
        </h2>
        <p style={{ fontSize: 17, color: C.textLight, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 28px' }}>
          A real person on our team reads every one of these. No form-letter replies. We'll be in touch with next steps within 48 hours.
        </p>
        <div style={{
          textAlign: 'left', background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 16,
          padding: '22px 22px', maxWidth: 480, margin: '0 auto 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.sage, marginBottom: 14 }}>
            What happens next
          </div>
          {[
            { n: '1', t: 'We start the build', d: 'Within 48 hours. Usually sooner.' },
            { n: '2', t: 'Google checks you out', d: 'Postcard, phone, or video - whichever you picked. We coach you through it.' },
            { n: '3', t: "You're on the map", d: 'Usually 5-10 days after we start. You get a text the moment you go live.' },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{
                flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                background: `${C.sage}18`, color: C.sageDark,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800,
              }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.dusk, marginBottom: 2 }}>{s.t}</div>
                <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.55 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          background: `${C.sunset}12`, border: `1px solid ${C.sunset}30`, borderRadius: 14,
          padding: '18px 20px', maxWidth: 480, margin: '0 auto 28px',
        }}>
          <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.65, textAlign: 'left' }}>
            <strong style={{ color: C.sunset }}>While you wait:</strong> Add a few photos and your hours to your Manitou Beach page. Every bit of life on your profile helps when Google takes a look at you.
          </p>
        </div>
        <button
          onClick={() => navigate(form.slug ? `/business/${form.slug}` : '/business')}
          style={{
            background: C.sage, color: '#fff', border: 'none', borderRadius: 50,
            padding: '16px 36px', cursor: 'pointer', fontSize: 16, fontWeight: 700,
            fontFamily: "'Libre Franklin', sans-serif",
            boxShadow: `0 6px 20px ${C.sage}55`,
          }}
        >
          See my profile →
        </button>
      </div>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  const isWelcome = step === 0;
  const isLastQuestion = step === TOTAL_QUESTION_STEPS;
  const isFinalReview = step === TOTAL_QUESTION_STEPS + 1;

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.warmWhite, color: C.text, minHeight: '100vh' }}>
      <GlobalStyles />
      <style>{`
        .gbp-input:focus { border-color: ${C.lakeBlue} !important; box-shadow: 0 0 0 3px ${C.lakeBlue}22 !important; }
        .gs-card { animation: gsFade 0.3s ease-out; }
        @keyframes gsFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .gs-check { animation: gsCheck 0.35s ease-out; }
        @keyframes gsCheck { from { opacity: 0; transform: translateY(-4px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <SEOHead
        title="Get you on Google - Manitou Beach"
        description="We handle setting up your Google listing so folks searching nearby can find you. Included with Front and Center."
        path="/gbp-setup"
      />

      <Navbar activeSection="" scrollTo={scrollTo} isSubPage />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '96px 18px 80px' }}>

        {/* Progress bar (hidden on welcome + success) */}
        {!isWelcome && !submitted && !isFinalReview && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: C.textMuted }}>
                Step {step} of {TOTAL_QUESTION_STEPS}
              </span>
              <span style={{ fontSize: 12, color: C.textMuted }}>Answers save as you go</span>
            </div>
            <div style={{ height: 6, background: C.sand, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${(step / TOTAL_QUESTION_STEPS) * 100}%`,
                height: '100%', background: `linear-gradient(90deg, ${C.sage}, ${C.sageDark})`,
                transition: 'width 0.35s ease-out',
              }} />
            </div>
          </div>
        )}

        {/* Card */}
        <div ref={cardRef} className="gs-card" key={step} style={{
          background: '#fff', borderRadius: 20,
          padding: 'clamp(26px, 4vw, 40px)',
          boxShadow: '0 4px 28px rgba(0,0,0,0.06)',
          border: `1px solid ${C.sand}`,
          borderTop: `3px solid ${submitted ? C.sage : C.lakeBlue}`,
        }}>
          {submitted ? <SuccessScreen /> : (
            <>
              {step === 0 && <Step0Welcome />}
              {step === 1 && <Step1Google />}
              {step === 2 && <Step2Owner />}
              {step === 3 && <Step3Location />}
              {step === 4 && <Step4WhatYouDo />}
              {step === 5 && <Step5Story />}
              {step === 6 && <Step6Verify />}
              {isFinalReview && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
                  <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 700, color: C.dusk, margin: '0 0 14px' }}>
                    Ready to send this off?
                  </h2>
                  <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.7, margin: '0 0 24px' }}>
                    We've got your answers. Hit the button and we'll start the build.
                  </p>
                </div>
              )}

              {/* Friendly nudge */}
              {nudge && (
                <div style={{
                  marginTop: 18, padding: '12px 16px', borderRadius: 10,
                  background: `${C.sunset}12`, border: `1px solid ${C.sunset}35`,
                  color: C.sunset, fontSize: 14, lineHeight: 1.55, fontWeight: 600,
                }}>
                  {nudge}
                </div>
              )}

              {/* Submit error */}
              {error && (
                <div style={{
                  marginTop: 18, padding: '12px 16px', borderRadius: 10,
                  background: '#FDF0F0', border: '1px solid #F5C6C6',
                  color: '#C0392B', fontSize: 14, lineHeight: 1.55, fontWeight: 600,
                }}>
                  {error} Give it another try in a moment, or email admin@yetigroove.com.
                </div>
              )}

              {/* Nav buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }}>
                {step > 0 && !isFinalReview && (
                  <button
                    type="button" onClick={goBack}
                    style={{
                      flex: '0 0 auto', background: 'transparent',
                      border: `1.5px solid ${C.sand}`, borderRadius: 50,
                      padding: '14px 22px', cursor: 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 15, fontWeight: 600, color: C.textLight,
                    }}
                  >
                    ← Back
                  </button>
                )}
                {isFinalReview ? (
                  <>
                    <button type="button" onClick={goBack} style={{
                      flex: '0 0 auto', background: 'transparent',
                      border: `1.5px solid ${C.sand}`, borderRadius: 50,
                      padding: '14px 22px', cursor: 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 15, fontWeight: 600, color: C.textLight,
                    }}>
                      ← Change an answer
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={loading} style={{
                      flex: 1, minWidth: 200, background: C.sage, color: '#fff',
                      border: 'none', borderRadius: 50, padding: '16px',
                      cursor: loading ? 'wait' : 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 16, fontWeight: 700,
                      boxShadow: `0 6px 20px ${C.sage}55`,
                      opacity: loading ? 0.75 : 1,
                    }}>
                      {loading ? 'Sending…' : 'Send it off →'}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={goNext} style={{
                    flex: 1, minWidth: 200,
                    background: step === 0 ? C.lakeBlue : C.sage, color: '#fff',
                    border: 'none', borderRadius: 50, padding: '16px',
                    cursor: 'pointer',
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 16, fontWeight: 700,
                    boxShadow: `0 6px 20px ${(step === 0 ? C.lakeBlue : C.sage)}55`,
                  }}>
                    {step === 0 ? "Let's do it →" : isLastQuestion ? 'Review my answers →' : 'Next →'}
                  </button>
                )}
              </div>

            </>
          )}
        </div>

        {/* Trust note */}
        {!submitted && (
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
            A real person reads every one of these. We never sell your information, and nothing goes to Google without talking with you first.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
