import React, { useState, useEffect } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { usePricing } from '../data/pricing';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';

const TRUCK_HOW = [
  { step: "01", title: "Sign up — 2 minutes flat", copy: "Truck name, cuisine, email, photo. Pick your tier. Done. Daryl sends your personal check-in link the same day — it's a private URL just for you, no app, no login." },
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
  { icon: "❤️", title: "Customer favorites", copy: "Regulars can heart your truck directly from the locator. They build a shortlist of favorites and never miss you when you're nearby." },
  { icon: "📱", title: "Text alerts when you drop", copy: "When someone favorites your truck, they opt in to texts. Drop your pin — they get a notification the moment you go live." },
  { icon: "📰", title: "Newsletter shoutout", copy: "When you're checked in on send days, hundreds of readers who follow Manitou Beach see your name." },
  { icon: "📋", title: "Directory listing year-round", copy: "Your name, cuisine, and contact info stay visible in the All Trucks list even when you're not checked in." },
];
const TRUCK_PAID_ITEMS = [
  { icon: "📍", label: "Live map pin", sub: "Goes live the moment you check in. Off when you leave." },
  { icon: "🔗", label: "Personal check-in URL", sub: "Your private link. Open from your phone. No app, no login — ever." },
  { icon: "⭐", label: "Today's Special badge", sub: "Add a special on check-in — it highlights on your live card." },
  { icon: "📅", label: "Coming Soon pre-announce", sub: "Set a future date. Customers see 'Coming This Saturday' before you arrive." },
  { icon: "❤️", label: "Customer favorites", sub: "Regulars heart your truck. They get texts the moment you go live." },
  { icon: "📱", label: "Text alerts to your fans", sub: "Drop your pin — customers who favorited you get notified instantly." },
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

  const { centsFor } = usePricing();
  const [form, setForm] = useState({ truckName: '', cuisine: '', email: '', phone: '', website: '' });
  const [selectedTier, setSelectedTier] = useState('free'); // 'free' | 'paid'
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    setLoading(true);
    setSubmitError('');
    try {
      // Always record in Notion first
      await fetch('/api/submit-food-truck', {
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
        }),
      });

      if (selectedTier === 'free') {
        setSubmitted(true);
        return;
      }

      // Paid tier → Stripe checkout
      const res = await fetch('/api/create-checkout', {
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
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.85 }}>
            Your name in the directory is free. For $9/month, your truck goes live on the map the moment you check in — and customers can favorite you and receive a text the instant you drop your pin.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Btn onClick={() => scrollToSignup('paid')} variant="sunset" style={{ whiteSpace: "nowrap" }}>
              Get on the Map — $9/mo →
            </Btn>
            <Btn onClick={() => scrollToSignup('free')} variant="outlineLight" style={{ whiteSpace: "nowrap" }}>
              Get the free listing →
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, marginTop: 32 }}>
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
            <SectionLabel light>$9 / month</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 48px", lineHeight: 1.2, textAlign: "center" }}>
              Everything you get<br /><em style={{ color: C.sunsetLight }}>for $9 a month.</em>
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

      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />

      {/* ── PRICING ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>Pricing</SectionLabel>
            <SectionTitle center>One price. Everything included.</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 560, margin: "0 auto 48px", textAlign: "center" }}>
              $9/month gets your truck live on the map, your fans notified when you arrive, and your name in front of hundreds of Manitou Beach followers. Free keeps you in the directory — nothing else.
            </p>
          </FadeIn>

          {/* Illustration */}
          <FadeIn delay={80}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <img src="/images/foodtruck-1-illustration.png" alt="" aria-hidden="true" style={{ width: "min(420px, 88vw)", opacity: 0.92 }} />
            </div>
          </FadeIn>

          {/* Two-tier pricing cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 720, margin: "0 auto 56px" }}>
            {/* Basic */}
            <FadeIn delay={60}>
              <div style={{ background: C.warmWhite, borderRadius: 18, padding: "36px 28px", border: `1.5px solid ${C.sand}`, height: "100%", boxSizing: "border-box" }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 12 }}>Basic</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 48, fontWeight: 700, color: C.text }}>$0</span>
                  <span style={{ fontSize: 14, color: C.textMuted, marginLeft: 4 }}>/mo</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.textMuted, marginBottom: 28 }}>always free</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {TRUCK_BASIC_ITEMS.map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: C.sage, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <div>
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginTop: 2 }}>{item.sub}</div>
                      </div>
                    </div>
                  ))}
                  {/* Show explicitly what's NOT included */}
                  {[
                    "No map pin",
                    "No check-in URL",
                    "No website link",
                    "No newsletter mention",
                  ].map(x => (
                    <div key={x} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: C.sand, fontSize: 13, flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{x}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 28 }}>
                  <button
                    onClick={() => scrollToSignup('free')}
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "12px 20px", borderRadius: 24, background: "transparent", color: C.sage, border: `1.5px solid ${C.sage}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Get the Free Listing →
                  </button>
                </div>
              </div>
            </FadeIn>

            {/* Live Listing */}
            <FadeIn delay={120}>
              <div style={{ background: C.dusk, borderRadius: 18, padding: "36px 28px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden", height: "100%", boxSizing: "border-box", transform: "scale(1.03)" }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 12 }}>Live Listing</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 48, fontWeight: 700, color: C.cream }}>$9</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>/mo</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.sunsetLight, marginBottom: 28 }}>live on the map · fans get texts when you arrive</div>
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
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "12px 20px", borderRadius: 24, background: C.sunset, color: C.cream, border: "none", fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Get on the Map — $9/mo →
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
              Your truck. Your listing.<br /><em style={{ color: C.sunsetLight }}>Pick your plan.</em>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 32, textAlign: "center" }}>
              Free puts your name in the directory. $9/month gets you live on the map — and your fans get a text the moment you arrive.
            </p>

            {submitted ? (
              /* ── FREE TIER SUCCESS ── */
              <div style={{ textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🍔</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, fontWeight: 400, margin: "0 0 12px" }}>You're in the directory!</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 28px" }}>
                  Daryl will review and activate your listing within 24 hours. You'll hear from him at <strong style={{ color: C.sunsetLight }}>{form.email}</strong>.
                </p>
                <a href="/food-trucks" style={{ fontSize: 13, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: "none" }}>
                  See the locator →
                </a>
              </div>
            ) : (
              <>
                {/* ── TIER SELECTOR ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
                  <button
                    onClick={() => setSelectedTier('free')}
                    style={{
                      padding: "14px 12px", borderRadius: 10, border: selectedTier === 'free' ? `2px solid ${C.sage}` : "2px solid rgba(255,255,255,0.12)",
                      background: selectedTier === 'free' ? "rgba(122,142,114,0.15)" : "rgba(255,255,255,0.04)",
                      color: selectedTier === 'free' ? C.cream : "rgba(255,255,255,0.45)",
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center", transition: "all 0.18s",
                    }}
                  >
                    <div style={{ fontSize: 15, marginBottom: 3 }}>Free Listing</div>
                    <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>Directory only · $0/mo</div>
                  </button>
                  <button
                    onClick={() => setSelectedTier('paid')}
                    style={{
                      padding: "14px 12px", borderRadius: 10, border: selectedTier === 'paid' ? `2px solid ${C.sunset}` : "2px solid rgba(255,255,255,0.12)",
                      background: selectedTier === 'paid' ? "rgba(212,132,90,0.15)" : "rgba(255,255,255,0.04)",
                      color: selectedTier === 'paid' ? C.cream : "rgba(255,255,255,0.45)",
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", textAlign: "center", transition: "all 0.18s",
                    }}
                  >
                    <div style={{ fontSize: 15, marginBottom: 3 }}>Live Listing</div>
                    <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>Live map + fan texts · $9/mo</div>
                  </button>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
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
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Phone</label>
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

                  {submitError && (
                    <div style={{ fontSize: 13, color: "#e07070", fontWeight: 500 }}>{submitError}</div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || imageUploading}
                    style={{
                      marginTop: 6, padding: "15px 24px",
                      background: loading ? C.sand : selectedTier === 'paid' ? C.sunset : C.sage,
                      color: C.cream, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                      letterSpacing: 1.5, textTransform: "uppercase",
                      cursor: (loading || imageUploading) ? "default" : "pointer",
                      fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.2s",
                    }}
                  >
                    {loading
                      ? (selectedTier === 'paid' ? "Redirecting to checkout…" : "Submitting…")
                      : selectedTier === 'paid'
                        ? "Get on the Map — $9/mo →"
                        : "Get My Free Listing →"
                    }
                  </button>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.7, margin: "2px 0 0" }}>
                    {selectedTier === 'paid'
                      ? `Secure checkout via Stripe. Daryl sends your personal check-in link after payment — usually same day.`
                      : "Free listings reviewed by Daryl within 24 hours. You'll get a confirmation at the email above."
                    }
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
