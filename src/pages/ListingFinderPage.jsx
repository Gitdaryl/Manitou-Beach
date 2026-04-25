import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn } from '../components/Shared';
import SEOHead from '../components/SEOHead';

const STORAGE_KEY = 'mb-listing-finder';
const TOTAL_STEPS = 4;

// ── Per-answer reflections ────────────────────────────────────────────────

function q1Reflection(val) {
  if (val === 'a') return `That's the right instinct. Let's find where the gap is.`;
  if (val === 'b') return `A professional presence pays for itself fast when visitors are choosing.`;
  if (val === 'c') return `Summer is the window. Let's make sure you're ready.`;
  if (val === 'd') return `Totally valid. There's a free spot with your name on it.`;
  return '';
}

function q2Reflection(val) {
  if (val === 'a') return `Great. Then we build on top of that foundation.`;
  if (val === 'b') return `A broken Google listing is worse than none. It sends people to a dead number or old address. We fix that.`;
  if (val === 'c') return `Worth a quick look. Most businesses are surprised what they find. We'll check either way.`;
  if (val === 'd') return `This is the most common situation. The good news: we can build it from scratch.`;
  return '';
}

function q3Reflection(val) {
  if (val === 'a') return `Facebook works until the algorithm buries you. Your page here is always on, always searchable.`;
  if (val === 'b') return `A profile here gives you a second door into customers who find Manitou Beach first.`;
  if (val === 'c') return `Then we're adding to something strong. Even a name-in-directory gets you in front of people who search here first.`;
  if (val === 'd') return `Perfect time to start clean and build it right.`;
  return '';
}

function q4Reflection(val) {
  if (val === 'a') return `Then placement matters. Let's make sure your profile does the work.`;
  if (val === 'b') return `That's the right bar. A well-built profile converts better than a bare listing.`;
  if (val === 'c') return `Smart start. You can always upgrade when the season picks up.`;
  return '';
}

// ── FieldCheck feedback bubble (same pattern as GBPSetupPage) ─────────────

function FieldCheck({ show, children }) {
  if (!show || !children) return null;
  return (
    <div className="lf-check" style={{
      marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 10,
      fontSize: 14, color: C.sageDark, fontWeight: 600,
      background: `rgba(122,142,114,0.10)`, padding: '10px 14px', borderRadius: 10,
      lineHeight: 1.5, border: '1px solid rgba(122,142,114,0.22)',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

// ── Score → tier recommendation ───────────────────────────────────────────

const TIER_META = {
  premium:  { key: 'premium',  label: 'Front and Center', price: 49,  color: C.sunset },
  featured: { key: 'featured', label: 'Highlighted',       price: 25,  color: C.sage   },
  enhanced: { key: 'enhanced', label: 'Showcased',         price: 9,   color: C.lakeBlue },
  free:     { key: null,       label: 'Free',              price: 0,   color: C.driftwood },
};

function computeHighlights(answers, tierKey) {
  if (tierKey === 'premium') {
    const googleLine = answers.q2 === 'b'
      ? 'Google Business cleanup -- your listing is outdated, we fix every field and make it accurate'
      : answers.q2 === 'd'
      ? 'Google Business setup from scratch -- we build yours so locals can actually find you'
      : 'Full Google Business optimization -- photos, description, and map pin, done right';
    const placementLine = (answers.q1 === 'a' || answers.q4 === 'a')
      ? 'Top placement in the directory -- the first profile visitors see when they browse'
      : 'Full photo gallery with a feature hero -- your story told in images';
    return [
      googleLine,
      placementLine,
      'Profile page with photos, hours, call button, and your Google star rating all in one place',
    ];
  }
  if (tierKey === 'featured') {
    const badgeLine = (answers.q4 === 'a' || answers.q4 === 'b')
      ? 'Highlighted badge on your profile header -- stands out in search results'
      : 'Your own profile page with a real URL you can share anywhere';
    const reviewLine = (answers.q1 === 'b' || answers.q1 === 'c')
      ? 'Google star rating right on your profile -- visitors see your reputation before they call'
      : 'Your Google reviews embedded on your page -- social proof without having to ask for it';
    return [
      badgeLine,
      reviewLine,
      'Photos, hours, call button, and a map pin -- everything visitors need to choose you',
    ];
  }
  if (tierKey === 'enhanced') {
    const firstLine = answers.q3 === 'a'
      ? 'A permanent home beyond Facebook -- always on, always searchable'
      : 'Your own profile page with a real URL -- your actual page, not just a search result';
    const lastLine = answers.q1 === 'c'
      ? 'Visible to lake visitors searching for things to do this summer'
      : 'Listed in the directory visitors browse when planning their trip';
    return [
      firstLine,
      'Photos, hours, call button, and a map pin -- the essentials, done clean',
      lastLine,
    ];
  }
  return [
    'Your name and category in the community directory -- always free, no card required',
    'You can upgrade to a full profile page anytime -- no contract, no pressure',
    'Part of the Manitou Beach community from day one',
  ];
}

function computeRecommendation(answers) {
  let visibility = 0, google = 0, depth = 0, standing = 0;

  if (answers.q1 === 'a') { visibility += 2; }
  if (answers.q1 === 'b') { depth += 1; standing += 1; }
  if (answers.q1 === 'c') { visibility += 1; depth += 1; }

  if (answers.q2 === 'b') { google += 2; }
  if (answers.q2 === 'c') { google += 1; }
  if (answers.q2 === 'd') { google += 2; }

  if (answers.q3 === 'a') { depth += 1; }
  if (answers.q3 === 'b') { standing += 1; }
  if (answers.q3 === 'd') { depth += 1; visibility += 1; }

  if (answers.q4 === 'a') { standing += 1; visibility += 1; }
  if (answers.q4 === 'b') { standing += 1; }

  const score = visibility + google + depth + standing;
  const googleBroken = answers.q2 === 'b' || answers.q2 === 'd';

  let meta;
  if (googleBroken || score >= 5) {
    meta = TIER_META.premium;
  } else if (score >= 4) {
    meta = TIER_META.featured;
  } else if (score >= 2) {
    meta = TIER_META.enhanced;
  } else {
    meta = TIER_META.free;
  }

  const highlights = computeHighlights(answers, meta.key);

  const message = {
    premium: `Here's what's happening: people are searching for what you do, and Google isn't showing them you. Front and Center fixes that. We build (or clean up) your Google listing, verify it with Google, add photos, and write your description. Agencies charge $200-400/month for this. It's included.`,
    featured: `Your business has a story worth telling. Highlighted gives you a real profile page plus your Google reviews right on it. Visitors see your reputation before they even call.`,
    enhanced: `You need more than a name in a list. Showcased gives you a real profile page with photos, hours, and a one-tap call button. That's what turns a "who's this?" into a phone call.`,
    free: `You're already in decent shape online. A free listing puts your name in the community directory with no credit card and no commitment. Come back whenever the picture changes.`,
  }[meta.key || 'free'];

  return { ...meta, score, googleBroken, highlights, message };
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ListingFinderPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
  const [nudge, setNudge] = useState('');

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.step)         setStep(p.step);
        if (p.businessName) setBusinessName(p.businessName);
        if (p.answers)      setAnswers(p.answers);
      }
    } catch {}
    window.scrollTo(0, 0);
  }, []);

  // Auto-save on any change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, businessName, answers }));
    } catch {}
  }, [step, businessName, answers]);

  // Scroll to top + clear nudge on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNudge('');
  }, [step]);

  const answer = (q, val) => setAnswers(a => ({ ...a, [q]: val }));

  function validate(s) {
    if (s === 0 && !businessName.trim()) return `What's your business called? We'll use this to personalize your result.`;
    if (s === 1 && !answers.q1) return `Pick whichever feels closest -- there's no wrong answer here.`;
    if (s === 2 && !answers.q2) return `Take a guess if you're not sure. This is the most important question.`;
    if (s === 3 && !answers.q3) return `Pick the one that's closest to where you are today.`;
    if (s === 4 && !answers.q4) return `Any of these is a fine answer.`;
    return '';
  }

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

  // ── Tap card style ────────────────────────────────────────────────────────
  const tap = (active) => ({
    width: '100%', textAlign: 'left', padding: '16px 20px', borderRadius: 14,
    border: `2px solid ${active ? C.sage : C.sand}`,
    background: active ? `${C.sage}12` : '#fff',
    color: C.text, cursor: 'pointer',
    fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 16, fontWeight: active ? 700 : 500,
    display: 'flex', alignItems: 'flex-start', gap: 14,
    transition: 'all 0.15s', marginBottom: 10,
  });

  // ── Step renderers ────────────────────────────────────────────────────────

  function Step0Welcome() {
    return (
      <>
        <div style={{ fontSize: 42, marginBottom: 14 }}>🧭</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: C.dusk, margin: '0 0 12px', lineHeight: 1.2 }}>
          Find the right fit for your business.
        </h2>
        <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.7, margin: '0 0 24px' }}>
          Four questions. About two minutes. We'll suggest the plan that actually makes sense for where you are right now -- not the most expensive one, the right one.
        </p>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: C.textLight, display: 'block', marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>
            What's your business called?
          </label>
          <input
            className="lf-input"
            style={{ width: '100%', padding: '15px 18px', borderRadius: 12, border: `1.5px solid ${C.sand}`, background: '#fff', fontFamily: "'Libre Franklin', sans-serif", fontSize: 17, color: C.text, boxSizing: 'border-box', outline: 'none' }}
            placeholder="e.g. Sunrise Bait Shop"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') goNext(); }}
          />
        </div>
        <div style={{ background: `${C.lakeBlue}10`, border: `1px solid ${C.lakeBlue}25`, borderRadius: 12, padding: '13px 16px', marginTop: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: C.lakeDark, lineHeight: 1.6 }}>
            <strong>Tip:</strong> If you get interrupted, come back anytime. Your answers save as you go.
          </p>
        </div>
      </>
    );
  }

  function StepQ(qKey, question, subtext, options, reflectionFn) {
    const current = answers[qKey];
    const reflection = reflectionFn(current);
    return (
      <>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(21px, 4.5vw, 27px)', fontWeight: 700, color: C.dusk, margin: '0 0 8px', lineHeight: 1.25 }}>
          {question}
        </h2>
        {subtext && (
          <p style={{ fontSize: 15, color: C.textLight, margin: '0 0 22px', lineHeight: 1.6 }}>{subtext}</p>
        )}
        {options.map(opt => (
          <button key={opt.val} type="button" onClick={() => answer(qKey, opt.val)} style={tap(current === opt.val)}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{opt.icon}</span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontWeight: 700, color: C.dusk, marginBottom: 2 }}>{opt.title}</span>
              {opt.desc && <span style={{ display: 'block', fontSize: 13, color: C.textMuted, fontWeight: 400 }}>{opt.desc}</span>}
            </span>
          </button>
        ))}
        <FieldCheck show={!!reflection}>{reflection}</FieldCheck>
      </>
    );
  }

  function StepResult() {
    const rec = computeRecommendation(answers);
    const isPaid = rec.key !== null;
    const activateUrl = isPaid
      ? `/activate?tier=${rec.key}&business=${encodeURIComponent(businessName.trim())}`
      : '/business';

    return (
      <>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-block', background: `${rec.color}15`, border: `1.5px solid ${rec.color}40`, borderRadius: 50, padding: '6px 18px', marginBottom: 14 }}>
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: rec.color }}>
              Our recommendation for {businessName || 'your business'}
            </span>
          </div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 700, color: C.dusk, marginBottom: 4 }}>
            {rec.label}
          </div>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", color: C.textMuted, fontSize: 15 }}>
            {rec.price === 0 ? 'Free forever' : `$${rec.price}/month, cancel anytime`}
          </div>
        </div>

        <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, margin: '0 0 22px', borderLeft: `3px solid ${rec.color}`, paddingLeft: 14 }}>
          {rec.message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {rec.highlights.map((h, i) => (
            <FadeIn key={i} delay={i * 80} direction="up">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: `${C.warmWhite}`, border: `1px solid ${C.sand}`, borderRadius: 12, padding: '12px 16px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={rec.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>{h}</span>
              </div>
            </FadeIn>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            try { localStorage.removeItem(STORAGE_KEY); } catch {}
            navigate(activateUrl);
          }}
          style={{
            width: '100%', background: rec.color, color: '#fff', border: 'none',
            borderRadius: 50, padding: '17px', cursor: 'pointer',
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontWeight: 700,
            boxShadow: `0 6px 20px ${rec.color}55`, marginBottom: 12,
          }}
        >
          {isPaid ? `Start my ${rec.label} listing →` : 'Get my free listing →'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/business')}
          style={{
            width: '100%', background: 'transparent', color: C.textMuted, border: `1.5px solid ${C.sand}`,
            borderRadius: 50, padding: '14px', cursor: 'pointer',
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600,
          }}
        >
          See all plans instead
        </button>
      </>
    );
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  const isWelcome = step === 0;
  const isResult  = step === TOTAL_STEPS + 1;

  const q1Options = [
    { val: 'a', icon: '📍', title: 'People need to find me -- I feel invisible',          desc: "Customers are out there, but they can't find you." },
    { val: 'b', icon: '✨', title: 'I want to look more established and professional',    desc: "You want to make a strong first impression." },
    { val: 'c', icon: '☀️', title: 'I want to attract new customers this summer',        desc: "Seasonal traffic is the opportunity." },
    { val: 'd', icon: '📌', title: "I just want to be listed somewhere local",           desc: "A name in the community directory is plenty for now." },
  ];
  const q2Options = [
    { val: 'a', icon: '✅', title: 'A Google listing shows up and it looks right',       desc: '' },
    { val: 'b', icon: '⚠️', title: 'Something shows up but it\'s outdated or wrong',     desc: '' },
    { val: 'c', icon: '❓', title: "I'm honestly not sure -- haven't checked",            desc: '' },
    { val: 'd', icon: '✗',  title: "Nothing. I don't think I have one",                  desc: '' },
  ];
  const q3Options = [
    { val: 'a', icon: '📱', title: 'Just a Facebook page, honestly',                     desc: '' },
    { val: 'b', icon: '🌐', title: "A website, but I'm not sure it's helping",            desc: '' },
    { val: 'c', icon: '💪', title: 'Pretty solid -- website, Google, the works',          desc: '' },
    { val: 'd', icon: '🌱', title: 'Nothing yet -- starting from scratch',                desc: '' },
  ];
  const q4Options = [
    { val: 'a', icon: '🏆', title: 'Very -- I want to be first',                          desc: "Placement and profile depth matter." },
    { val: 'b', icon: '👍', title: 'I want to look good, not just be listed',             desc: "Quality over quantity." },
    { val: 'c', icon: '🎯', title: 'Being findable is enough for now',                    desc: "You can always upgrade when the season picks up." },
  ];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.warmWhite, color: C.text, minHeight: '100vh' }}>
      <GlobalStyles />
      <style>{`
        .lf-input:focus { border-color: ${C.lakeBlue} !important; box-shadow: 0 0 0 3px ${C.lakeBlue}22 !important; }
        .lf-card  { animation: lfFade 0.28s ease-out; }
        @keyframes lfFade  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .lf-check { animation: lfCheck 0.35s ease-out; }
        @keyframes lfCheck { from { opacity: 0; transform: translateY(-4px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <SEOHead
        title="Find the right listing plan -- Manitou Beach"
        description="Not sure which listing plan fits your business? Four quick questions and we'll point you to the right one."
        path="/listing-finder"
      />

      <Navbar activeSection="" scrollTo={() => {}} isSubPage />

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '96px 18px 80px' }}>

        {/* Progress bar (hidden on welcome + result) */}
        {!isWelcome && !isResult && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: C.textMuted }}>
                Question {step} of {TOTAL_STEPS}
              </span>
              <span style={{ fontSize: 12, color: C.textMuted }}>Answers save as you go</span>
            </div>
            <div style={{ height: 5, background: C.sand, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${(step / TOTAL_STEPS) * 100}%`,
                height: '100%', background: `linear-gradient(90deg, ${C.sage}, ${C.sageDark})`,
                transition: 'width 0.35s ease-out',
              }} />
            </div>
          </div>
        )}

        {/* Card */}
        <div className="lf-card" key={step} style={{
          background: '#fff', borderRadius: 20,
          padding: 'clamp(24px, 4vw, 38px)',
          boxShadow: '0 4px 28px rgba(0,0,0,0.06)',
          border: `1px solid ${C.sand}`,
          borderTop: `3px solid ${isResult ? computeRecommendation(answers).color : C.lakeBlue}`,
        }}>
          {step === 0 && <Step0Welcome />}
          {step === 1 && StepQ('q1', 'What matters most for your business right now?', null, q1Options, q1Reflection)}
          {step === 2 && StepQ('q2', `When someone Googles "${businessName || 'your business'} Manitou Beach"...`, `This is the most important question. Take your best guess if you're not sure.`, q2Options, q2Reflection)}
          {step === 3 && StepQ('q3', 'What does your business look like online right now?', null, q3Options, q3Reflection)}
          {step === 4 && StepQ('q4', 'How important is standing out from other listings?', null, q4Options, q4Reflection)}
          {isResult && <StepResult />}

          {/* Nudge */}
          {nudge && (
            <div style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 10,
              background: `${C.sunset}12`, border: `1px solid ${C.sunset}35`,
              color: C.sunset, fontSize: 14, lineHeight: 1.55, fontWeight: 600,
            }}>
              {nudge}
            </div>
          )}

          {/* Nav buttons (hidden on result step) */}
          {!isResult && (
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              {step > 0 && (
                <button type="button" onClick={goBack} style={{
                  flex: '0 0 auto', background: 'transparent',
                  border: `1.5px solid ${C.sand}`, borderRadius: 50,
                  padding: '13px 22px', cursor: 'pointer',
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 15, fontWeight: 600, color: C.textLight,
                }}>
                  ← Back
                </button>
              )}
              <button type="button" onClick={goNext} style={{
                flex: 1, minWidth: 180,
                background: step === 0 ? C.lakeBlue : C.sage,
                color: '#fff', border: 'none', borderRadius: 50, padding: '15px',
                cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 16, fontWeight: 700,
                boxShadow: `0 6px 20px ${(step === 0 ? C.lakeBlue : C.sage)}55`,
              }}>
                {step === 0 ? "Let's find out →" : step === TOTAL_STEPS ? 'See my recommendation →' : 'Next →'}
              </button>
            </div>
          )}
        </div>

        {/* Escape hatch (always visible, not on result) */}
        {!isResult && (
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: C.textMuted }}>
            Already know what you need?{' '}
            <a href="/business" style={{ color: C.textMuted, textDecoration: 'underline' }}>
              See all listing plans
            </a>
          </p>
        )}

        {/* Trust note on result */}
        {isResult && (
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
            No commitment until you enter a card. Cancel anytime, no questions asked.{' '}
            <a href="/business" style={{ color: C.textMuted, textDecoration: 'underline' }}>
              Compare all plans
            </a>
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
