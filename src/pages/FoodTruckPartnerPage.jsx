import React, { useState, useEffect } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { BASE_PRICES } from '../data/pricing';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import yeti from '../data/errorMessages';

const TRUCK_HOW = [
  { step: "01", title: "Sign up — 2 minutes flat", copy: "Truck name, cuisine, phone, photo. Pick your tier. Verify your phone with a quick text code — and your personal check-in link arrives instantly. No app, no login, no waiting." },
  { step: "02", title: "Tap your link every time you head out", copy: "Pulling into Manitou Beach? Open your link. Drop a location note ('near the boat launch'), add today's special, set your estimated departure. Tap 'I'm Here.' Your map pin goes live in seconds." },
  { step: "03", title: "Locals find you right now", copy: "Anyone checking the locator sees your Live Now badge, today's special, and how long you'll be around. Not a static ad — a real-time signal that turns browsers into customers." },
  { step: "04", title: "Pre-announce a run before you leave home", copy: "Planning to be there Saturday? Set your Coming Date and customers see 'Coming This Saturday' in the locator before you even hitch up. You show up to a crowd instead of building one." },
];
const TRUCK_AUDIENCE = [
  { icon: "🏖️", label: "Lake crowd", copy: "Manitou Beach draws thousands of summer visitors — boaters, swimmers, families. They're hungry and they're looking." },
  { icon: "🍷", label: "Wine trail visitors", copy: "The Irish Hills wine trail runs through here. Day-trippers who've been tasting since noon are your best customers." },
  { icon: "🏡", label: "Lake homeowners", copy: "300+ waterfront properties and seasonal rentals nearby. People who've been here all week and want something different for lunch." },
  { icon: "📅", label: "Event weekends", copy: "Tournaments, festivals, car shows, open-air concerts. High-traffic weekends where a well-placed truck cleans up." },
];
const TRUCK_GETS = [
  { icon: "📍", title: "Live map pin", copy: "Your truck appears on the locator the moment you check in — 'Live Now' badge, location, what you serve. Off when you're not here." },
  { icon: "🔗", title: "Personal check-in URL", copy: "A private link that's yours forever. Open from your phone, fill in two fields, tap one button. On the map in under a minute." },
  { icon: "⭐", title: "Today's Special badge", copy: "Running a lunch deal or testing a new item? Add it on check-in. It shows as a highlighted badge on your live card." },
  { icon: "📅", title: "Coming Soon pre-announce", copy: "Planning a Saturday run? Set your date and customers see 'Coming This Saturday' in the locator before you arrive." },
  { icon: "❤️", title: "Customer hearts + dish ratings", copy: "Customers heart your truck and tag what they loved — 'the ribs', 'fish tacos'. Every heart builds your love count on the locator." },
  { icon: "🏆", title: "Most Loved ranking", copy: "The locator sorts by love count. The truck with the most hearts and dish ratings rises to the top — more visibility, more customers." },
  { icon: "📰", title: "Newsletter shoutout", copy: "When you're checked in on send days, hundreds of readers who follow Manitou Beach see your name." },
  { icon: "📋", title: "Directory listing year-round", copy: "Your name, cuisine, and contact info stay visible in the All Trucks list even when you're not checked in." },
];
const TRUCK_PAID_ITEMS = [
  { icon: "📍", label: "Live map pin", sub: "Goes live the moment you check in. Off when you leave." },
  { icon: "🔗", label: "Personal check-in URL", sub: "Your private link. Open from your phone. No app, no login — ever." },
  { icon: "⭐", label: "Today's Special badge", sub: "Add a special on check-in — it highlights on your live card." },
  { icon: "📅", label: "Coming Soon pre-announce", sub: "Set a future date. Customers see 'Coming This Saturday' before you arrive." },
  { icon: "❤️", label: "Customer hearts + dish ratings", sub: "Customers heart your truck and tag what they loved. Every heart counts." },
  { icon: "🏆", label: "Most Loved ranking", sub: "More hearts = higher on the locator. The ranking is public and competitive." },
  { icon: "🔗", label: "Website / menu / Instagram link", sub: "One tap to your menu on every live card." },
  { icon: "📰", label: "Newsletter shoutout when live", sub: "Hundreds of readers, on days you're checked in." },
];
const TRUCK_BASIC_ITEMS = [
  { icon: "📋", label: "Directory listing", sub: "Your truck name and cuisine in the All Trucks list. Nothing else." },
];

export default function FoodTruckPartnerPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const scrollToSignup = (tier) => {
    if (tier) setSelectedTier(tier);
    document.getElementById('food-truck-signup')?.scrollIntoView({ behavior: 'smooth' });
  };

  const centsFor = (base) => Math.round(base * 100);

  // Pre-fill from URL params (e.g. redirected from /update-listing)
  const prefill = (() => {
    try { return Object.fromEntries(new URLSearchParams(window.location.search)); }
    catch { return {}; }
  })();

  const [form, setForm] = useState({
    truckName: prefill.name || '',
    cuisine: '',
    email: prefill.email || '',
    phone: prefill.phone || '',
    website: prefill.website || '',
  });
  const [selectedTier, setSelectedTier] = useState('paid'); // beta: everyone gets Featured
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Verification flow states
  const [step, setStep] = useState('form'); // 'form' | 'verify' | 'activated' | 'redirecting'
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [activationData, setActivationData] = useState(null); // { slug, checkinUrl, truckName }
  const [resending, setResending] = useState(false);

  const handleImageSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImagePreview(URL.createObjectURL(file));
    setImageUploading(true);
    setImageUrl('');
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'food-trucks' }),
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch { /* image is optional — silent fail */ }
    finally { setImageUploading(false); }
  };

  const handleSubmit = async () => {
    if (!form.truckName.trim() || !form.email.trim()) {
      setSubmitError('Truck name and email are required.');
      return;
    }
    const phoneDigits = (form.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setSubmitError('A valid phone number is required — we\'ll text you a verification code.');
      return;
    }
    setLoading(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit-food-truck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckName: form.truckName,
          cuisine: form.cuisine,
          email: form.email,
          phone: form.phone,
          website: form.website,
          imageUrl,
          tier: selectedTier,
          skipVerification: prefill.verified === 'true',
          _hp: document.querySelector('input[name="_hp"]')?.value || '',
        }),
      });
      const data = await res.json();
      if (data.activated) {
        try { localStorage.setItem('mb_ft_slug', data.slug); } catch {}
        setActivationData({ slug: data.slug, checkinUrl: data.checkinUrl, truckName: data.truckName });
        setStep('activated');
      } else if (data.needsVerification) {
        setStep('verify');
      } else if (data.error) {
        setSubmitError(data.error);
      }
    } catch {
      setSubmitError(yeti.network());
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.trim().length !== 6) {
      setVerifyError('Enter the 6-digit code from your text message.');
      return;
    }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/verify-food-truck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, code: verifyCode.trim(), tier: selectedTier }),
      });
      const data = await res.json();

      if (data.error) {
        setVerifyError(data.error);
        setVerifyLoading(false);
        return;
      }

      if (data.activated) {
        // Free tier — they're live
        try { localStorage.setItem('mb_ft_slug', data.slug); } catch {}
        setActivationData({ slug: data.slug, checkinUrl: data.checkinUrl, truckName: data.truckName });
        setStep('activated');
      } else if (data.needsPayment) {
        // Paid tier — verified, now redirect to Stripe
        setStep('redirecting');
        const checkoutRes = await fetch('/api/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: 'food_truck_founding',
            businessName: form.truckName,
            email: form.email,
            priceInCents: centsFor(9),
            mode: 'subscription',
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
        } else {
          setVerifyError(checkoutData.error || yeti.payment());
          setStep('verify');
        }
      }
    } catch {
      setVerifyError(yeti.network());
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch('/api/verify-food-truck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, resend: true }),
      });
    } catch { /* silent */ }
    finally {
      setTimeout(() => setResending(false), 3000); // 3s cooldown
    }
  };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />

      {/* Partner context strip */}
      <div style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "9px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>This page isn't public — you're seeing it because someone sent it to you.</span>
        <a href="/food-trucks" style={{ fontSize: 12, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>See the Locator →</a>
        <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", whiteSpace: "nowrap" }}>Visit Homepage →</a>
      </div>

      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.dusk} 0%, ${C.night} 50%, ${C.dusk} 100%)`, padding: "160px 24px 110px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 55% 45%, rgba(212,132,90,0.2) 0%, transparent 60%)`, pointerEvents: "none" }} />
        <FadeIn>
          <SectionLabel light>Manitou Beach · Food Truck Locator</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 400, color: C.cream, margin: "20px 0 24px", lineHeight: 1.15 }}>
            Your truck. Live on the map.<br /><em>Every time you're nearby.</em>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 20px", lineHeight: 1.85 }}>
            Live on the map the moment you check in — customers heart your truck, rate their favourite dishes, and push you to the top of the Most Loved rankings.
          </p>
          <div style={{ marginBottom: 20 }}>
            <img src="/images/yeti/yeti-celebrates.png" alt="The Yeti" style={{ width: 200, height: 200, objectFit: "contain" }} />
          </div>
          <div style={{ display: "inline-block", background: "rgba(212,132,90,0.15)", border: "1px solid rgba(212,132,90,0.3)", borderRadius: 12, padding: "12px 24px", marginBottom: 28 }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight }}>Founding trucks get everything free through May 10</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Btn onClick={() => scrollToSignup('paid')} variant="sunset" style={{ whiteSpace: "nowrap" }}>
              Get on the Map — Free During Beta →
            </Btn>
          </div>
        </FadeIn>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>How It Works</SectionLabel>
            <SectionTitle center>On the map in under a minute.</SectionTitle>
            <div style={{ textAlign: "center", margin: "24px 0 12px" }}>
              <img src="/images/foodtruck-2-illustration.png" alt="" aria-hidden="true" style={{ width: "min(320px, 80vw)", opacity: 0.92 }} />
            </div>
          </FadeIn>
          <div className="ft-how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginTop: 32 }}>
            {TRUCK_HOW.map((s, i) => (
              <FadeIn key={s.step} delay={i * 80}>
                <div style={{ background: C.warmWhite, borderRadius: 16, padding: "32px 28px", border: `1px solid ${C.sand}`, position: "relative", overflow: "hidden", height: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 56, fontWeight: 700, color: "rgba(212,132,90,0.1)", position: "absolute", top: 12, right: 18, lineHeight: 1, userSelect: "none" }}>{s.step}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.sunset, marginBottom: 12, fontWeight: 600 }}>Step {s.step}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 12, lineHeight: 1.4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.8 }}>{s.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />

      {/* ── THE AUDIENCE ── */}
      <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 48, alignItems: "center", marginBottom: 48, flexWrap: "wrap" }}>
            <FadeIn style={{ flex: "1 1 280px" }}>
              <SectionLabel>Who's Out There</SectionLabel>
              <SectionTitle>The Manitou Beach crowd is your crowd.</SectionTitle>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 420, margin: 0 }}>
                These are people with a full day, money to spend, and no plan for lunch.
              </p>
            </FadeIn>
            <FadeIn delay={120} style={{ flex: "0 0 auto", textAlign: "center" }}>
              <img src="/images/community-illustration.png" alt="" aria-hidden="true" style={{ width: "min(360px, 78vw)", opacity: 0.93 }} />
            </FadeIn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {TRUCK_AUDIENCE.map((item, i) => (
              <FadeIn key={item.label} delay={i * 70}>
                <div style={{ background: C.cream, borderRadius: 14, padding: "28px 24px", border: `1px solid ${C.sand}`, borderTop: `3px solid ${C.sunset}`, height: "100%", boxSizing: "border-box" }}>
                  <div className="mono-icon" style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 10 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.78 }}>{item.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />

      {/* ── WHAT YOU GET ── */}
      <section style={{ background: C.dusk, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light>Founding Truck Beta</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 48px", lineHeight: 1.2, textAlign: "center" }}>
              Everything you get<br /><em style={{ color: C.sunsetLight }}>free through May 10.</em>
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {TRUCK_GETS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 70}>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "28px 24px", border: "1px solid rgba(255,255,255,0.1)", height: "100%", boxSizing: "border-box" }}>
                  <div className="mono-icon" style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, marginBottom: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.78 }}>{item.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAGIC MOMENT ── */}
      <section style={{ background: C.dusk, padding: "0 24px 48px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", background: "rgba(212,132,90,0.1)", border: "1px solid rgba(212,132,90,0.2)", borderRadius: 18, padding: "28px 32px", textAlign: "center" }}>
          <FadeIn>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunsetLight, marginBottom: 8 }}>The Magic Moment</div>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, lineHeight: 1.6, margin: "0 0 8px" }}>
              A customer walks up and says:<br /><em style={{ color: C.sunsetLight }}>"I saw you on the map and came straight here."</em>
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>
              That's the moment your truck becomes a destination, not an accident. Everything we built is designed to create more of those moments — for you and for the hungry people at the lake.
            </p>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />

      {/* ── PRICING ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>Beta Launch</SectionLabel>
            <SectionTitle center>Founding trucks get everything.</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 560, margin: "0 auto 48px", textAlign: "center" }}>
              Sign up now and get the full Featured experience — live map pin, customer hearts, Most Loved rankings, newsletter mentions — completely free through May 10. After that, it's $9/month to stay live on the map.
            </p>
          </FadeIn>

          {/* Illustration */}
          <FadeIn delay={80}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <img src="/images/foodtruck-1-illustration.png" alt="" aria-hidden="true" style={{ width: "min(420px, 88vw)", opacity: 0.92 }} />
            </div>
          </FadeIn>

          {/* Single founding beta card */}
          <div style={{ maxWidth: 480, margin: "0 auto 56px" }}>
            <FadeIn delay={80}>
              <div style={{ background: C.dusk, borderRadius: 18, padding: "36px 28px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden" }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 12 }}>Founding Truck</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 48, fontWeight: 700, color: C.cream }}>$0</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>/mo through May 10</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.sunsetLight, marginBottom: 8 }}>everything included · no card required</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 24, lineHeight: 1.6 }}>After May 10: $9/mo to stay live on the map, or downgrade to a free directory listing.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {TRUCK_PAID_ITEMS.map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: C.sunsetLight, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <div>
                        <div style={{ fontSize: 13, color: C.cream, fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginTop: 2 }}>{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 28 }}>
                  <button
                    onClick={() => scrollToSignup('paid')}
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "14px 20px", borderRadius: 24, background: C.sunset, color: C.cream, border: "none", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Sign Up Free →
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />

      {/* ── SIGNUP ── */}
      <section id="food-truck-signup" style={{ background: C.night, padding: "80px 24px 110px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(212,132,90,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
            <SectionLabel light>Get Listed</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 12px", lineHeight: 1.25, textAlign: "center" }}>
              Your truck. Live on the map.<br /><em style={{ color: C.sunsetLight }}>Free through May 10.</em>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 32, textAlign: "center" }}>
              Founding trucks get the full Featured experience — live map pin, customer hearts, Most Loved rankings — completely free. No card required.
            </p>

            {step === 'activated' ? (
              /* ── ACTIVATED SUCCESS ── */
              <div style={{ textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 56, marginBottom: 16, animation: "foodTruckPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>🎉</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.cream, fontWeight: 400, margin: "0 0 8px" }}>
                  {activationData?.truckName || 'Your truck'} is live!
                </h3>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight, marginBottom: 20 }}>
                  You're a founding truck — check your texts for your personal check-in link.
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 28px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                  Open that link every time you head to Manitou Beach. Drop your pin, add today's special, and you're live on the map in seconds.
                </p>
                <a href="/food-trucks" style={{
                  display: "inline-block", padding: "14px 32px", background: C.sunset, color: C.cream, borderRadius: 28,
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
                  textTransform: "uppercase", textDecoration: "none",
                }}>
                  See the Locator →
                </a>
                <style>{`@keyframes foodTruckPop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }`}</style>
              </div>

            ) : step === 'verify' ? (
              /* ── VERIFICATION CODE ENTRY ── */
              <div style={{ textAlign: "center", padding: "44px 28px", background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📱</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, fontWeight: 400, margin: "0 0 8px" }}>
                  Check your texts
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 28px" }}>
                  We sent a 6-digit code to <strong style={{ color: C.sunsetLight }}>{form.phone}</strong>
                </p>
                <div style={{ maxWidth: 240, margin: "0 auto 20px" }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    autoFocus
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "16px 20px",
                      border: `2px solid ${verifyError ? '#e07070' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: 12, background: "rgba(255,255,255,0.06)", color: C.cream,
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 28, fontWeight: 700,
                      textAlign: "center", letterSpacing: 8, outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => { if (!verifyError) e.currentTarget.style.borderColor = C.sunset; }}
                    onBlur={e => { if (!verifyError) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  />
                </div>
                {verifyError && (
                  <div style={{ fontSize: 13, color: "#e07070", fontWeight: 500, marginBottom: 16 }}>{verifyError}</div>
                )}
                <button
                  onClick={handleVerify}
                  disabled={verifyLoading || verifyCode.length !== 6}
                  style={{
                    padding: "14px 36px", background: verifyLoading ? C.sand : C.sunset,
                    color: C.cream, border: "none", borderRadius: 28, fontSize: 13, fontWeight: 700,
                    letterSpacing: 1.5, textTransform: "uppercase", cursor: verifyLoading ? "default" : "pointer",
                    fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.2s",
                    opacity: verifyCode.length !== 6 ? 0.5 : 1,
                  }}
                >
                  {verifyLoading ? (step === 'redirecting' ? "Heading to checkout…" : "Verifying…") : "Verify & Activate →"}
                </button>
                <div style={{ marginTop: 20 }}>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    style={{
                      background: "none", border: "none", fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 12, color: resending ? C.sage : "rgba(255,255,255,0.35)",
                      cursor: resending ? "default" : "pointer", padding: "6px 12px",
                    }}
                  >
                    {resending ? "✓ Code re-sent" : "Didn't get it? Resend code"}
                  </button>
                </div>
              </div>

            ) : step === 'redirecting' ? (
              /* ── STRIPE REDIRECT ── */
              <div style={{ textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, fontWeight: 400, margin: "0 0 12px" }}>
                  Phone verified — heading to checkout
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                  Redirecting to Stripe…
                </p>
              </div>

            ) : (
              <>
                {/* ── BETA BADGE ── */}
                <div style={{ textAlign: "center", marginBottom: 24, padding: "14px 20px", background: "rgba(212,132,90,0.12)", border: "1px solid rgba(212,132,90,0.25)", borderRadius: 12 }}>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: C.sunsetLight, marginBottom: 2 }}>Founding Truck — Free through May 10</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Full Featured experience. No credit card. No catch.</div>
                </div>

                {/* ── FORM FIELDS ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Truck Name *</label>
                    <input
                      type="text"
                      value={form.truckName}
                      onChange={e => setForm(f => ({ ...f, truckName: e.target.value }))}
                      placeholder="e.g. Lakeside BBQ Co."
                      style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Cuisine / What You Serve</label>
                    <input
                      type="text"
                      value={form.cuisine}
                      onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))}
                      placeholder="e.g. BBQ, Tacos, Wood-fired Pizza"
                      style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div className="event-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com"
                        style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Phone * <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— for verification</span></label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="(555) 000-0000"
                        style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Website or Instagram</label>
                    <input
                      type="text"
                      value={form.website}
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="instagram.com/yourtruckname"
                      style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                    />
                  </div>

                  {/* ── IMAGE DROPPER ── */}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                      Truck Photo or Logo <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span>
                    </label>
                    <div
                      onClick={() => !imageUploading && document.getElementById('truck-image-input')?.click()}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = C.sunset; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                      style={{
                        border: `2px dashed ${imageUrl ? C.sage : "rgba(255,255,255,0.15)"}`,
                        borderRadius: 10, padding: "20px 16px", textAlign: "center",
                        cursor: imageUploading ? "default" : "pointer",
                        background: "rgba(255,255,255,0.03)", transition: "border-color 0.2s",
                        position: "relative", minHeight: 90,
                        display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
                      }}
                    >
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)" }} />
                          <span style={{ fontSize: 12, color: imageUrl ? C.sage : "rgba(255,255,255,0.4)" }}>
                            {imageUploading ? "Uploading…" : imageUrl ? "✓ Photo uploaded" : "Upload failed — tap to retry"}
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 24 }}>🖼</span>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                            {imageUploading ? "Uploading…" : "Drop a photo here, or tap to upload"}
                          </span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>JPG, PNG — max 2MB</span>
                        </>
                      )}
                    </div>
                    <input
                      id="truck-image-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSelect(f); }}
                    />
                  </div>

                  {/* Hidden honeypot */}
                  <input type="text" name="_hp" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                  {submitError && (
                    <div style={{ fontSize: 13, color: "#e07070", fontWeight: 500 }}>{submitError}</div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || imageUploading}
                    style={{
                      marginTop: 6, padding: "15px 24px",
                      background: loading ? C.sand : C.sunset,
                      color: C.cream, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                      letterSpacing: 1.5, textTransform: "uppercase",
                      cursor: (loading || imageUploading) ? "default" : "pointer",
                      fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.2s",
                    }}
                  >
                    {loading
                      ? "Sending verification code…"
                      : "Get on the Map — Free →"
                    }
                  </button>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.7, margin: "2px 0 0" }}>
                    We'll text a verification code to your phone. Once verified, you're live on the map instantly.
                  </p>
                </div>
              </>
            )}

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a
                href="/food-trucks"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", letterSpacing: 0.5, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >
                See the locator first →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
