import React, { useState, useEffect } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';

const FOUNDING_TIERS = [
  { name: "Enhanced", price: 9,  perks: ["Business listing on Manitou Beach", "Map pin on /discover", "Category placement", "Contact info + description", "Link to your website", "Upgrade to Featured or Premium at founding rates — any time"] },
  { name: "Featured", price: 23, highlight: true, perks: ["Everything in Enhanced", "Priority placement in category", "Logo displayed on listing", "Newsletter mention eligibility", "Highlighted card styling", "Upgrade to Premium at founding rates — any time"] },
  { name: "Premium",  price: 43, perks: ["Everything in Featured", "Top of category, always", "Monthly newsletter feature eligible", "First call for sponsorship spots", "Founding badge on listing"] },
];

const FOUNDING_MATH = [
  { subs: "Today",    newPrice: null,  yourPrice: 9,  label: "Founding rate" },
  { subs: "200 subs", newPrice: 10,   yourPrice: 9,  label: "You still pay $9" },
  { subs: "500 subs", newPrice: 13,   yourPrice: 9,  label: "You still pay $9" },
  { subs: "1,000 subs", newPrice: 18, yourPrice: 9,  label: "You still pay $9" },
];

function FoundingListingDemo() {
  const [expanded, setExpanded] = useState(false);
  const accentColor = C.sage;
  useEffect(() => {
    const t = setInterval(() => setExpanded(e => !e), 3500);
    return () => clearInterval(t);
  }, []);
  return (
    <section style={{ background: C.cream, padding: "72px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel style={{ textAlign: "center", display: "block" }}>What You're Getting</SectionLabel>
          <SectionTitle center>Free listing vs. Enhanced — live.</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 540, margin: "0 auto 52px", textAlign: "center" }}>
            This is the actual directory. Watch what happens when you upgrade.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="listing-demo-grid">

          {/* FREE COLUMN */}
          <FadeIn delay={60}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Free</div>
            <div style={{ background: "#fff", borderRadius: "0 4px 4px 0", borderLeft: "3px solid transparent", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", gap: "0 10px", alignItems: "start", padding: "14px 16px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.textMuted, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 14, color: C.text }}>Lakeside Hardware</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>(517) 555-0182</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>4 Lakeview Blvd, Manitou Beach</div>
                </div>
                <div style={{ fontSize: 11, color: C.lakeBlue, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap", paddingTop: 2 }}>Upgrade →</div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "14px 18px", background: `${C.sunset}10`, border: `1px dashed ${C.sunset}50`, borderRadius: 10 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: C.sunset, fontWeight: 700, marginBottom: 6 }}>That's the whole listing.</div>
              <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.7, fontFamily: "'Libre Franklin', sans-serif" }}>
                Name, phone number, address.<br />No description. No website. No way to stand out.
              </div>
            </div>
          </FadeIn>

          {/* ENHANCED COLUMN */}
          <FadeIn delay={120}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Enhanced</div>
            <div
              style={{ background: "#fff", borderRadius: "0 4px 4px 0", borderLeft: `3px solid ${accentColor}`, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden", cursor: "pointer" }}
              onClick={() => setExpanded(e => !e)}
            >
              <div style={{ display: "grid", gridTemplateColumns: "10px 1fr auto", gap: "0 10px", alignItems: "start", padding: "14px 16px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 14, color: C.text }}>Lakeside Hardware</span>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", background: `${accentColor}18`, color: accentColor, borderRadius: 4, padding: "2px 6px", fontFamily: "'Libre Franklin', sans-serif" }}>Enhanced</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>(517) 555-0182</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>4 Lakeview Blvd, Manitou Beach</div>
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", paddingTop: 2, whiteSpace: "nowrap" }}>
                  {expanded ? "Less ↑" : "More ↓"}
                </div>
              </div>
              <div style={{ maxHeight: expanded ? "300px" : 0, overflow: "hidden", transition: "max-height 0.5s ease-out" }}>
                <div style={{ padding: "12px 16px 16px", background: `${accentColor}05`, borderTop: `1px solid ${accentColor}20`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🏠</div>
                  <div>
                    <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.75, marginBottom: 10, fontFamily: "'Libre Franklin', sans-serif" }}>
                      Everything you need for the lake house — lumber, hardware, seasonal supplies. Family owned since 1987.
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, letterSpacing: 0.5, fontFamily: "'Libre Franklin', sans-serif", textTransform: "uppercase" }}>Visit Website →</span>
                      <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>info@lakesidehardware.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: "14px 18px", background: `${accentColor}0D`, border: `1px dashed ${accentColor}50`, borderRadius: 10 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: accentColor, fontWeight: 700, marginBottom: 6 }}>Everything above, plus:</div>
              <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.8, fontFamily: "'Libre Franklin', sans-serif" }}>
                ✓ Full description &nbsp;·&nbsp; ✓ Website link<br />
                ✓ Email contact &nbsp;·&nbsp; ✓ Logo / brand mark<br />
                ✓ Enhanced tier badge &nbsp;·&nbsp; ✓ Expandable panel
              </div>
            </div>
          </FadeIn>

        </div>

        <FadeIn delay={200}>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: C.textMuted }}>← Click the Enhanced row to toggle it yourself</div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function FoundingPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />

      {/* Private context strip */}
      <div style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "9px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>This page isn't public — you're seeing it because someone sent it to you.</span>
        <a href="/featured" style={{ fontSize: 12, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>See the Public Listing Page →</a>
        <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", whiteSpace: "nowrap" }}>Visit Homepage →</a>
      </div>

      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 60%, ${C.night} 100%)`, padding: "160px 24px 110px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(91,126,149,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
        <FadeIn>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "6px 16px", marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>Early Rate Access</span>
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 400, color: C.cream, margin: "0 0 24px", lineHeight: 1.15 }}>
            List your business now,<br />at the rate that holds.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 16px", lineHeight: 1.85 }}>
            Manitou Beach pricing is tied to the newsletter audience. The rate you start at today is your rate permanently — even as the audience grows and new listings cost more.
          </p>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: "rgba(255,255,255,0.3)", marginBottom: 40 }}>
            Like locking in a rate before the market moves.
          </p>
          <Btn href="/featured" variant="sunset" style={{ whiteSpace: "nowrap" }}>
            See Listing Options →
          </Btn>
        </FadeIn>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.cream} />

      {/* ── LISTING DEMO ── */}
      <FoundingListingDemo />

      <WaveDivider topColor={C.cream} bottomColor={C.cream} />

      {/* ── THE MATH ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 48, alignItems: "center", marginBottom: 40, flexWrap: "wrap-reverse" }}>
            <FadeIn delay={120} style={{ flex: "0 0 auto", textAlign: "center" }}>
              <img src="/images/founding-rate-illustration.png" alt="" aria-hidden="true" style={{ width: "min(420px, 80vw)", opacity: 0.92 }} />
            </FadeIn>
            <FadeIn style={{ flex: "1 1 260px" }}>
              <SectionLabel>The Formula</SectionLabel>
              <SectionTitle>Here's exactly how it works.</SectionTitle>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, margin: 0 }}>
                The base price is $9/mo for an Enhanced listing. After 100 newsletter subscribers, the price rises by one cent per new subscriber — automatically, for everyone who signs up after. But your rate? Locked in the day you join. Forever.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={100}>
            <div style={{ background: C.warmWhite, borderRadius: 16, border: `1px solid ${C.sand}`, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: C.dusk, padding: "14px 28px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>When</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>New members pay</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.sunsetLight, textAlign: "right" }}>You pay</div>
              </div>
              {FOUNDING_MATH.map((row, i) => (
                <div key={row.subs} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "18px 28px", borderBottom: i < FOUNDING_MATH.length - 1 ? `1px solid ${C.sand}` : "none", alignItems: "center" }}>
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
            <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", marginTop: 14, lineHeight: 1.7 }}>
              Example shown for Enhanced tier. Featured and Premium follow the same formula from their base rates.
            </p>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />

      {/* ── WHAT'S A SUBSCRIBER ── */}
      <section style={{ background: C.warmWhite, padding: "64px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>What's a Subscriber?</SectionLabel>
            <SectionTitle center>The newsletter, explained.</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 580, margin: "0 auto 40px", textAlign: "center" }}>
              Manitou Beach runs a community newsletter through beehiiv — sent regularly to real people who live near, visit, or own property around Devils Lake and Manitou Beach. Not a random email list. People who opted in because they actually care about what's happening here.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { icon: "📰", label: "What it covers", copy: "Upcoming events, seasonal guides, food truck locations, wine trail news, new business spotlights, and community updates." },
              { icon: "👥", label: "Who reads it", copy: "Lake homeowners, seasonal visitors, local residents, boaters, and anyone who follows the Irish Hills community." },
              { icon: "📍", label: "Why it matters", copy: "As the list grows, your listing reaches more of those readers. The pricing formula reflects that growing value — which is why the rate rises." },
              { icon: "🔒", label: "Your rate is fixed", copy: "Whatever rate you start at today is yours indefinitely. You don't reprice with the market. New subscribers don't affect your bill." },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 60}>
                <div style={{ background: C.cream, borderRadius: 12, padding: "22px 20px", border: `1px solid ${C.sand}` }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.7 }}>{item.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} flip />

      {/* ── TIERS ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>Current Rates</SectionLabel>
            <SectionTitle center>Pick your listing level.</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 480, margin: "0 auto 48px", textAlign: "center" }}>
              The rate you start at today is your rate for as long as your listing runs — regardless of where the newsletter audience goes after.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {FOUNDING_TIERS.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 80}>
                <div style={{
                  background: tier.highlight ? C.dusk : C.cream,
                  borderRadius: 18,
                  padding: "36px 28px",
                  border: tier.highlight ? "none" : `1px solid ${C.sand}`,
                  boxShadow: tier.highlight ? "0 12px 40px rgba(0,0,0,0.2)" : "none",
                  transform: tier.highlight ? "scale(1.03)" : "none",
                  position: "relative",
                  overflow: "hidden",
                  height: "100%",
                  boxSizing: "border-box",
                }}>
                  {tier.highlight && (
                    <div style={{ position: "absolute", top: 16, right: 16, background: C.sunset, color: C.cream, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", borderRadius: 50, padding: "4px 10px" }}>Most Popular</div>
                  )}
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: tier.highlight ? C.sunsetLight : C.textMuted, marginBottom: 12 }}>{tier.name}</div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 48, fontWeight: 700, color: tier.highlight ? C.cream : C.text }}>${tier.price}</span>
                    <span style={{ fontSize: 14, color: tier.highlight ? "rgba(255,255,255,0.45)" : C.textMuted, marginLeft: 4 }}>/mo</span>
                  </div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: tier.highlight ? C.sunsetLight : C.sage, marginBottom: 24 }}>today's rate — yours permanently</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {tier.perks.map(p => (
                      <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ color: tier.highlight ? C.sunsetLight : C.sage, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 13, color: tier.highlight ? "rgba(255,255,255,0.65)" : C.textLight, lineHeight: 1.5 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 28 }}>
                    <a
                      href="/featured"
                      style={{ display: "block", textAlign: "center", padding: "12px 20px", borderRadius: 24, background: tier.highlight ? C.sunset : "transparent", color: tier.highlight ? C.cream : C.sage, border: `1.5px solid ${tier.highlight ? C.sunset : C.sage}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", transition: "all 0.2s" }}
                    >
                      List as {tier.name} →
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDERS BONUS ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap" }}>
            <FadeIn delay={120} style={{ flex: "0 0 auto", textAlign: "center" }}>
              <img src="/images/community-illustration.png" alt="" aria-hidden="true" style={{ width: "min(520px, 80vw)", opacity: 0.92 }} />
            </FadeIn>
            <FadeIn style={{ flex: "1 1 300px" }}>
              <SectionLabel>Founders Bonus</SectionLabel>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 400, color: C.dusk, margin: "16px 0 20px", lineHeight: 1.25 }}>
                Your founding rate follows you<br /><em style={{ color: C.sunset }}>all the way up.</em>
              </h2>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, marginBottom: 28 }}>
                Start at Enhanced today. If you ever want a Featured or Premium listing — for a busy summer season, Tip-Up Festival, a grand opening — you upgrade at your original founding rate, not whatever the market rate is at that time. That protection follows you through every tier, permanently.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "🔒", text: "Upgrade to any higher tier at your founding rate — whenever you want, for as long as you're listed" },
                  { icon: "📅", text: "Useful for seasonal peaks: Tip-Up Festival, July 4th, Memorial Day, summer opening weekend" },
                  { icon: "⚡", text: "Founding rate access closes once early spots fill — first in, first protected. No exceptions after." },
                ].map((item, i) => (
                  <FadeIn key={i} delay={i * 80 + 200}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: C.warmWhite, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.sand}` }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: C.textLight, lineHeight: 1.75, fontFamily: "'Libre Franklin', sans-serif" }}>{item.text}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.textMuted }}>No catch. Just the benefit of moving early.</div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />

      {/* ── NEWSLETTER INVITE ── */}
      <section style={{ background: C.warmWhite, padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>While You're Here</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 400, color: C.dusk, margin: "16px 0 16px", lineHeight: 1.25 }}>
              Join The Manitou Dispatch.
            </h2>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 480, margin: "0 auto 32px" }}>
              The community newsletter for Devils Lake and Manitou Beach. Events, local news, food truck locations, wine trail updates, and what's happening on the water — delivered to people who actually live here or love it here.
            </p>
          </FadeIn>
          <NewsletterInline />
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.night} />

      {/* ── CTA ── */}
      <section style={{ background: C.night, padding: "80px 24px 110px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light>Before the Rate Rises</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.25 }}>
              Today's rate holds.<br />Tomorrow's might not.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 16 }}>
              Once the newsletter crosses 100 subscribers, new listings are priced against a larger audience. Listings that started earlier pay what they started at. The gap widens automatically.
            </p>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: "rgba(255,255,255,0.28)", marginBottom: 44 }}>
              Choose your tier and get listed in minutes.
            </p>
            <Btn href="/featured" variant="sunset" style={{ whiteSpace: "nowrap" }}>
              Start My Listing →
            </Btn>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
