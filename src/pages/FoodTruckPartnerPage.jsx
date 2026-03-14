import React, { useState, useEffect } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';

const TRUCK_HOW = [
  { step: "01", title: "Sign up for your Founding listing", copy: "Truck name, cuisine, email — that's it. Your founding rate is locked the moment you pay. Daryl sets you up with a check-in link the same day." },
  { step: "02", title: "Use your check-in URL when you're nearby", copy: "Heading to Manitou Beach? Hit your link. Your pin goes live on the map with a 'Live Now' badge. Takes three seconds." },
  { step: "03", title: "Locals find you in real time", copy: "People checking the locator see you're here, right now. Not a static listing — a live signal that drives foot traffic." },
];
const TRUCK_AUDIENCE = [
  { icon: "🏖️", label: "Lake crowd", copy: "Manitou Beach draws thousands of summer visitors — boaters, swimmers, families. They're hungry and they're looking." },
  { icon: "🍷", label: "Wine trail visitors", copy: "The Irish Hills wine trail runs through here. Day-trippers who've been tasting since noon are your best customers." },
  { icon: "🏡", label: "Lake homeowners", copy: "300+ waterfront properties and seasonal rentals nearby. People who've been here all week and want something different for lunch." },
  { icon: "📅", label: "Event weekends", copy: "Tournaments, festivals, car shows, open-air concerts. High-traffic weekends where a well-placed truck cleans up." },
];
const TRUCK_GETS = [
  { icon: "📍", title: "Live map pin", copy: "Your truck appears on the Manitou Beach Food Truck Locator the moment you check in. 'Live Now' badge, your name, what you serve." },
  { icon: "🔗", title: "Personal check-in URL", copy: "A private link that's yours. Open it from your phone when you're rolling into town. No login, no app, no fuss." },
  { icon: "📋", title: "Directory listing", copy: "Year-round presence in the All Trucks directory — your name, cuisine, and contact info visible even when you're not checked in." },
  { icon: "☀️", title: "Summer season visibility", copy: "Manitou Beach peaks June through September. Your truck is in front of the right people at the right time." },
];
const TRUCK_FOUNDING_ITEMS = [
  { icon: "📍", label: "Live map pin", sub: "Your truck appears on the map the moment you check in." },
  { icon: "🔗", label: "Personal check-in URL", sub: "Your private link. Open from your phone. No app, no login." },
  { icon: "🔗", label: "Website / menu / Instagram link", sub: "One tap to your menu on every live card." },
  { icon: "⭐", label: "Featured Truck badge", sub: "You stand out in the map and directory." },
  { icon: "📰", label: "Newsletter shoutout when live", sub: "On send days, we mention you're open. One email, hundreds of readers." },
  { icon: "🥇", label: "Priority in All Trucks directory", sub: "Listed first. Above Basic trucks." },
  { icon: "📅", label: "Seasonal schedule note (optional)", sub: "Tell regulars where to find you every week." },
];
const TRUCK_BASIC_ITEMS = [
  { icon: "📋", label: "Directory listing", sub: "Your truck name and cuisine in the All Trucks list. Nothing else." },
];
const TRUCK_FOUNDING_MATH = [
  { subs: "Today",      newPrice: null, yourPrice: 9, label: "Founding rate" },
  { subs: "200 subs",   newPrice: 10,   yourPrice: 9, label: "You still pay $9" },
  { subs: "500 subs",   newPrice: 13,   yourPrice: 9, label: "You still pay $9" },
  { subs: "1,000 subs", newPrice: 18,   yourPrice: 9, label: "You still pay $9" },
];

export default function FoodTruckPartnerPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const [subCount, setSubCount] = useState(null);
  const [form, setForm] = useState({ truckName: '', cuisine: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const GRACE = 100;
  const count = subCount ?? 0;
  const increment = Math.max(0, count - GRACE);
  const inGrace = count < GRACE;
  const priceFor = (base) => (base + increment * 0.01).toFixed(2);
  const centsFor = (base) => Math.round((base + increment * 0.01) * 100);
  useEffect(() => {
    fetch('/api/subscribe').then(r => r.json()).then(d => setSubCount(d.count ?? 0)).catch(() => setSubCount(0));
  }, []);
  const handleTruckCheckout = async () => {
    if (!form.truckName.trim() || !form.email.trim()) { setCheckoutError('Truck name and email are required.'); return; }
    setLoading(true); setCheckoutError('');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'food_truck_founding', businessName: form.truckName, email: form.email, priceInCents: centsFor(9), mode: 'subscription' }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setCheckoutError(data.error || 'Something went wrong. Please try again.'); }
    } catch { setCheckoutError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.85 }}>
            Your name in the directory is free. Lock in a Founding rate for ${priceFor(9)}/mo and get a live map pin, check-in link, and newsletter reach.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Btn onClick={() => document.getElementById('food-truck-signup')?.scrollIntoView({ behavior: 'smooth' })} variant="sunset" style={{ whiteSpace: "nowrap" }}>
              Claim Your Founding Rate — ${priceFor(9)}/mo →
            </Btn>
            <Btn href="mailto:admin@yetigroove.com?subject=Food Truck Listing — Basic" variant="outlineLight" style={{ whiteSpace: "nowrap" }}>
              Just list me free →
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginTop: 32 }}>
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
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
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
            <SectionLabel light>Founding Listing</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 48px", lineHeight: 1.2, textAlign: "center" }}>
              Everything you get<br /><em style={{ color: C.sunsetLight }}>with your Founding listing.</em>
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            {TRUCK_GETS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 70}>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "28px 24px", border: "1px solid rgba(255,255,255,0.1)", height: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
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
            <SectionTitle center>The Founding Food Truck rate.</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 540, margin: "0 auto 16px", textAlign: "center" }}>
              The rate you start at today is your rate permanently — as long as your listing stays active. After {GRACE} newsletter subscribers, new food trucks pay more. Yours doesn't change.
            </p>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: inGrace ? C.sage : C.sunset }}>
                {inGrace ? `⚡ Founding rate — lock in today before subscriber ${GRACE}` : `↑ Price now rising with audience — lock in what's left`}
              </span>
            </div>
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
                  <a
                    href="mailto:admin@yetigroove.com?subject=Food Truck Listing — Basic"
                    style={{ display: "block", textAlign: "center", padding: "12px 20px", borderRadius: 24, background: "transparent", color: C.sage, border: `1.5px solid ${C.sage}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none" }}
                  >
                    Get the Free Listing →
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Founding */}
            <FadeIn delay={120}>
              <div style={{ background: C.dusk, borderRadius: 18, padding: "36px 28px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden", height: "100%", boxSizing: "border-box", transform: "scale(1.03)" }}>
                <div style={{ position: "absolute", top: 16, right: 16, background: C.sunset, color: C.cream, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderRadius: 50, padding: "4px 10px" }}>Founding Rate</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 12 }}>Founding Food Truck</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 48, fontWeight: 700, color: C.cream }}>${priceFor(9)}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>/mo</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.sunsetLight, marginBottom: 28 }}>today's rate — yours permanently</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {TRUCK_FOUNDING_ITEMS.map(item => (
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
                    onClick={() => document.getElementById('food-truck-signup')?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "12px 20px", borderRadius: 24, background: C.sunset, color: C.cream, border: "none", fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Claim This Rate →
                  </button>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Math table */}
          <FadeIn delay={140}>
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <SectionLabel style={{ textAlign: "center", display: "block" }}>The Formula</SectionLabel>
              <p style={{ fontSize: 14, color: C.textLight, textAlign: "center", marginBottom: 24, lineHeight: 1.75 }}>
                After {GRACE} newsletter subscribers, the base price rises by one cent per new subscriber — for new sign-ups only. Your rate is fixed the day you join.
              </p>
              <div style={{ background: C.warmWhite, borderRadius: 16, border: `1px solid ${C.sand}`, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: C.dusk, padding: "14px 28px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>When</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>New trucks pay</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.sunsetLight, textAlign: "right" }}>You pay</div>
                </div>
                {TRUCK_FOUNDING_MATH.map((row, i) => (
                  <div key={row.subs} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "18px 28px", borderBottom: i < TRUCK_FOUNDING_MATH.length - 1 ? `1px solid ${C.sand}` : "none", alignItems: "center" }}>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text, fontWeight: i === 0 ? 700 : 400 }}>{row.subs}</div>
                    <div style={{ textAlign: "center", fontSize: 14, color: row.newPrice ? C.textLight : C.sage, fontWeight: 600 }}>
                      {row.newPrice ? `$${row.newPrice}/mo` : <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.sage }}>founding rate</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: C.sunset }}>${row.yourPrice}/mo</span>
                      {i > 0 && <div style={{ fontSize: 11, color: C.sage, fontWeight: 600 }}>✓ locked</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />

      {/* ── SIGNUP ── */}
      <section id="food-truck-signup" style={{ background: C.night, padding: "80px 24px 110px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, rgba(212,132,90,0.12) 0%, transparent 65%)", pointerEvents: "none" }} />
            <SectionLabel light>Claim Your Rate</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 12px", lineHeight: 1.25, textAlign: "center" }}>
              Lock in ${priceFor(9)}/mo<br /><em style={{ color: C.sunsetLight }}>before the price moves.</em>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 36, textAlign: "center" }}>
              Your founding rate stays fixed as long as your listing is active. Cancel anytime — your rate resets if you come back.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Truck Name</label>
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
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  style={{ width: "100%", boxSizing: "border-box", padding: "13px 16px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                />
              </div>
              {checkoutError && (
                <div style={{ fontSize: 13, color: "#e07070", fontWeight: 500 }}>{checkoutError}</div>
              )}
              <button
                onClick={handleTruckCheckout}
                disabled={loading}
                style={{ marginTop: 8, padding: "15px 24px", background: loading ? C.sand : C.sunset, color: C.cream, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: loading ? "default" : "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.2s" }}
              >
                {loading ? "Redirecting to checkout…" : `Claim Your Founding Rate — $${priceFor(9)}/mo →`}
              </button>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", lineHeight: 1.7, margin: "4px 0 0" }}>
                Secure checkout via Stripe. Daryl sets up your check-in link and map pin after payment — usually the same day.
              </p>
            </div>
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <a
                href="/food-trucks"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", letterSpacing: 0.5, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >
                See the locator first →
              </a>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.15)", margin: "0 12px" }}>·</span>
              <a
                href="mailto:admin@yetigroove.com?subject=Food Truck Listing — Basic"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", letterSpacing: 0.5, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >
                Just list me free →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
