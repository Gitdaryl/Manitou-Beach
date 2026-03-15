import React, { useState, useEffect } from "react";
import { Footer, GlobalStyles, Navbar, NewsletterInline } from "../components/Layout";
import { FadeIn, SectionLabel, ScrollProgress, WaveDivider, DiagonalDivider, ShareBar, Btn } from "../components/Shared";
import { C, USA250_PUBLIC } from "../data/config";

// ============================================================
// 🇺🇸  USA 250th ANNIVERSARY PAGE (/usa250)
// ============================================================

const C250 = { navy: "#0D1B3E", gold: "#C9A84C", goldLight: "#E8C97A", red: "#B22234" };

const USA250_TIMELINE = [
  { year: "1776", title: "The First Celebration", body: "Philadelphia erupts in bonfires, bells, and cannon fire on July 4th. John Adams writes to Abigail that the day should be 'celebrated with Pomp and Parade, with Shews, Games, Sports, Guns, Bells, Bonfires and Illuminations.'" },
  { year: "1777", title: "Congress Makes It Official", body: "The Second Continental Congress celebrates with a 13-gun salute, a band, fireworks, and illuminated ships. The tradition is born by the vote of the nation's founders." },
  { year: "1870s", title: "Manitou Beach Is Born", body: "As commercial fireworks manufacturers emerge across America, the resort era begins on Devils Lake. Manitou Beach is platted in 1888 — and the Fourth of July becomes the summer's signature night." },
  { year: "1920s", title: "The Golden Age of Fireworks", body: "Synchronized aerial displays become an American institution. Italian pyrotechnics families bring the art to its peak. The country lights up from coast to coast every July 4th." },
  { year: "1976", title: "The Bicentennial", body: "America's 200th birthday sets the record for celebration. Operation Sail brings tall ships to New York Harbor. Communities across the country stage their greatest displays yet." },
  { year: "2026", title: "Semiquincentennial", body: "The 250th. The biggest Fourth of July in American history. Manitou Beach — this lake, this community — stands alongside the nation in celebrating 250 years of freedom, fireworks, and the people who make a place home." },
];

const USA250_SPONSOR_TIERS = [
  { tier: "Presenting Sponsor", amount: "$2,500+", perks: ["Named in all promotions", "Logo on this page (largest)", "Newsletter feature", "Social media campaign inclusion", "On-site banner placement"] },
  { tier: "Gold Sponsor", amount: "$1,000+", perks: ["Logo on this page", "Newsletter mention", "Social media tag", "On-site recognition"] },
  { tier: "Silver Sponsor", amount: "$500+", perks: ["Name on this page", "Newsletter mention", "Community recognition"] },
  { tier: "Community Partner", amount: "$100+", perks: ["Name listed on this page", "Community recognition"] },
];

// Named donors — populated after the organizing meeting. Add any tier.
// Format: { name: "The Smith Family", tier: "presenting" | "gold" | "silver" | "community" }
const USA250_SPONSORS = [
  // Presenting
  // { name: "Example Business", tier: "presenting" },
  // Gold
  // { name: "The Johnson Family", tier: "gold" },
  // Silver
  // { name: "Lakeside Hardware", tier: "silver" },
  // Community — families, individuals, small donors
  // { name: "The Williams Family", tier: "community" },
];

export default function USA250Page() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const isPreview = window.location.search.includes("preview=true");

  // Redirect if not public and no preview param
  if (!USA250_PUBLIC && !isPreview) {
    window.location.replace("/");
    return null;
  }

  // Countdown to July 4, 2026 9:00 PM
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  useEffect(() => {
    const target = new Date("2026-07-04T21:00:00");
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  const [donateAmount, setDonateAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [volForm, setVolForm] = useState({ name: "", email: "", role: "", message: "" });
  const [volSent, setVolSent] = useState(false);

  const finalDonate = customAmount ? Number(customAmount) : donateAmount;
  const donateMailto = `mailto:hello@manitoubeach.com?subject=USA250%20Donation%20%E2%80%94%20%24${finalDonate}&body=I%27d%20like%20to%20donate%20%24${finalDonate}%20to%20the%20Manitou%20Beach%20USA%20250th%20Anniversary%20fireworks%20campaign.%0A%0AName%3A%20%0APhone%3A%20%0A`;

  const handleVolSubmit = () => {
    if (!volForm.name || !volForm.email) return;
    const body = `Name: ${volForm.name}%0AEmail: ${volForm.email}%0AHow I can help: ${volForm.role}%0AMessage: ${volForm.message || "—"}`;
    window.location.href = `mailto:hello@manitoubeach.com?subject=USA250%20Volunteer%20%E2%80%94%20${encodeURIComponent(volForm.name)}&body=${body}`;
    setVolSent(true);
  };

  const pad = n => String(n).padStart(2, "0");

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C250.navy, color: C.cream, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Draft banner */}
      {isPreview && !USA250_PUBLIC && (
        <div style={{ background: C250.gold, color: C250.navy, textAlign: "center", padding: "8px 24px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif", position: "relative", zIndex: 999 }}>
          Preview Mode — This page is not yet public
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", background: `linear-gradient(160deg, ${C250.navy} 0%, #0A1218 40%, #1a0a2e 100%)` }}>
        {/* Video background */}
        {USA250_VIDEO_URL && (
          <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} src={USA250_VIDEO_URL} />
        )}
        {/* Star/spark overlay */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: USA250_VIDEO_URL ? "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(13,27,62,0.8) 100%)" : "none", pointerEvents: "none" }} />
        {/* Animated sparkles via CSS */}
        {!USA250_VIDEO_URL && (
          <style>{`
            @keyframes twinkle{0%,100%{opacity:.15;transform:scale(1)}50%{opacity:.8;transform:scale(1.3)}}
            .spark{position:absolute;border-radius:50%;background:${C250.gold};animation:twinkle var(--d,2.5s) ease-in-out infinite;animation-delay:var(--delay,0s)}
          `}</style>
        )}
        {!USA250_VIDEO_URL && Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="spark" style={{ width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2, left: `${Math.sin(i * 137.5) * 50 + 50}%`, top: `${Math.cos(i * 97.3) * 50 + 50}%`, "--d": `${2 + (i % 5) * 0.7}s`, "--delay": `${(i % 7) * 0.4}s`, zIndex: 1 }} />
        ))}

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "140px 24px 80px", maxWidth: 860 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 24 }}>🇺🇸</div>
            <SectionLabel light style={{ margin: 0, color: C250.gold, letterSpacing: 6 }}>July 4, 2026 · Manitou Beach</SectionLabel>
            <div style={{ fontSize: 24 }}>🇺🇸</div>
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 9vw, 88px)", fontWeight: 700, color: C.cream, margin: "0 0 16px 0", lineHeight: 1.05, letterSpacing: -1 }}>
            America Turns 250.
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.2vw, 19px)", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto 48px" }}>
            Manitou Beach celebrates the nation's most significant Fourth of July in a generation. One night. One lake. 250 years of freedom.
          </p>

          {/* Countdown */}
          <div style={{ display: "flex", gap: "clamp(12px,3vw,32px)", justifyContent: "center", marginBottom: 52, flexWrap: "wrap" }}>
            {[{ val: timeLeft.days, label: "Days" }, { val: timeLeft.hours, label: "Hrs" }, { val: timeLeft.mins, label: "Min" }, { val: timeLeft.secs, label: "Sec" }].map(({ val, label }) => (
              <div key={label} style={{ textAlign: "center", minWidth: 72 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(42px,7vw,72px)", fontWeight: 700, color: C250.gold, lineHeight: 1, letterSpacing: -2, fontVariantNumeric: "tabular-nums" }}>
                  {pad(val)}
                </div>
                <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          <a href="#get-involved" style={{ display: "inline-block", background: C250.gold, color: C250.navy, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", padding: "14px 36px", borderRadius: 4, transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            🎆 Be Part of It
          </a>
          <div style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
            Fireworks begin at 9:00 PM · Devils Lake, Manitou Beach
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 2, animation: "bounce 2s ease-in-out infinite", fontSize: 18, opacity: 0.4 }}>↓</div>
        <style>{`@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(6px)}}`}</style>
      </section>

      {/* ── HOLLY & YETI CAMPAIGN ── */}
      <section style={{ background: C.night, padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }} className="mobile-col-1">
          <FadeIn>
            <SectionLabel light>Campaign Partners</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 400, color: C.cream, margin: "0 0 18px 0", lineHeight: 1.2 }}>
              Holly & The Yeti<br/>Are Covering It
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 24 }}>
              Holly & The Yeti are documenting the effort to bring Manitou Beach's biggest-ever July 4th to life — fundraising, community organizing, and the story behind the spectacle.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 28 }}>
              From the first planning meeting to the final burst over the lake, they're getting it on camera so the community can be part of it even before the night arrives.
            </p>
            <Btn href="/#holly" variant="outlineLight" small style={{ whiteSpace: "nowrap" }}>Meet Holly & The Yeti →</Btn>
          </FadeIn>
          <FadeIn delay={150}>
            {/* Video placeholder */}
            <div style={{ position: "relative", paddingBottom: "56.25%", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: `1px solid rgba(255,255,255,0.1)`, overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: C250.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>▶</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", textAlign: "center", padding: "0 24px" }}>
                  Campaign video<br/>coming soon
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.warmWhite} />

      {/* ── TIMELINE ── */}
      <section style={{ background: C.warmWhite, padding: "72px 24px 80px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SectionLabel style={{ color: C250.navy, textAlign: "center", display: "block" }}>250 Years of the Tradition</SectionLabel>
              <SectionTitle center style={{ color: C250.navy }}>A History Written in Light and Fire</SectionTitle>
            </div>
          </FadeIn>
          <div style={{ position: "relative" }}>
            {/* Timeline spine */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C250.navy}, ${C250.gold})`, transform: "translateX(-50%)", opacity: 0.2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
              {USA250_TIMELINE.map((item, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", alignItems: "start", gap: 0 }}>
                    {/* Left side (odd) */}
                    <div style={{ padding: "0 32px 0 0", textAlign: "right", ...(i % 2 !== 0 ? { opacity: 0 } : {}) }}>
                      {i % 2 === 0 && (
                        <div style={{ background: C.cream, borderRadius: 12, padding: "20px 22px", border: `1px solid ${C.sand}`, display: "inline-block", maxWidth: 340, textAlign: "left" }}>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 700, color: C250.navy, marginBottom: 4 }}>{item.year}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>{item.title}</div>
                          <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7 }}>{item.body}</div>
                        </div>
                      )}
                    </div>
                    {/* Center dot */}
                    <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: C250.gold, border: `2px solid ${C250.navy}`, flexShrink: 0 }} />
                    </div>
                    {/* Right side (even) */}
                    <div style={{ padding: "0 0 0 32px", ...(i % 2 === 0 ? { opacity: 0 } : {}) }}>
                      {i % 2 !== 0 && (
                        <div style={{ background: C.cream, borderRadius: 12, padding: "20px 22px", border: `1px solid ${C.sand}`, display: "inline-block", maxWidth: 340 }}>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 700, color: C250.navy, marginBottom: 4 }}>{item.year}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>{item.title}</div>
                          <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7 }}>{item.body}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DiagonalDivider topColor={C.warmWhite} bottomColor={C250.navy} />

      {/* ── DONATE ── */}
      <section style={{ background: C250.navy, padding: "80px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <SectionLabel light style={{ color: C250.gold, textAlign: "center", display: "block" }}>Support the Effort</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, color: C.cream, margin: "0 0 16px 0", lineHeight: 1.15 }}>Help Light Up the Sky</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 36px" }}>
              The 250th is a once-in-a-lifetime celebration. Your donation helps fund the most ambitious fireworks display Manitou Beach has ever seen — and every dollar stays in this community.
            </p>
            {/* Preset amounts */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {[25, 50, 100, 250].map(amt => (
                <button key={amt} onClick={() => { setDonateAmount(amt); setCustomAmount(""); }}
                  style={{ padding: "10px 22px", borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Libre Franklin', sans-serif", border: `2px solid ${donateAmount === amt && !customAmount ? C250.gold : "rgba(255,255,255,0.2)"}`, background: donateAmount === amt && !customAmount ? C250.gold : "transparent", color: donateAmount === amt && !customAmount ? C250.navy : C.cream }}
                >${amt}</button>
              ))}
              <input
                type="number" min="1" placeholder="Custom"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setDonateAmount(0); }}
                style={{ width: 90, padding: "10px 14px", borderRadius: 6, fontSize: 15, fontWeight: 600, background: customAmount ? C250.gold : "transparent", color: customAmount ? C250.navy : C.cream, border: `2px solid ${customAmount ? C250.gold : "rgba(255,255,255,0.2)"}`, outline: "none", fontFamily: "'Libre Franklin', sans-serif" }}
              />
            </div>
            <a href={donateMailto}
              style={{ display: "inline-block", background: C250.gold, color: C250.navy, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", padding: "14px 36px", borderRadius: 4, marginBottom: 14, transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Donate ${finalDonate || "—"} →
            </a>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
              Opens your email app · Secure online payment link coming soon
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C250.navy} bottomColor={C.cream} flip />

      {/* ── SPONSORS ── */}
      <section style={{ background: C.cream, padding: "72px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionLabel style={{ color: C250.navy, textAlign: "center", display: "block" }}>Supporting This Celebration</SectionLabel>
              <SectionTitle center style={{ color: C250.navy }}>Our Sponsors</SectionTitle>
              <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 500, margin: "0 auto" }}>
                Sponsor recognition is displayed here and in every Dispatch newsletter leading to July 4th.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {USA250_SPONSOR_TIERS.map((tier, ti) => {
              const tierKey = ["presenting","gold","silver","community"][ti];
              const tierSponsors = USA250_SPONSORS.filter(s => s.tier === tierKey);
              const mailtoLink = `mailto:hello@manitoubeach.com?subject=USA250%20Sponsorship%20%E2%80%94%20${encodeURIComponent(tier.tier)}&body=I%27d%20like%20to%20become%20a%20${encodeURIComponent(tier.tier)}%20for%20the%20USA%20250th%20fireworks%20at%20Manitou%20Beach.%0A%0AName%3A%20%0AContact%3A%20`;
              return (
              <FadeIn key={tier.tier} delay={ti * 60}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ height: 1, flex: 1, background: C.sand }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C250.navy, fontFamily: "'Libre Franklin', sans-serif" }}>{tier.tier}</span>
                    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>{tier.amount}</span>
                    <div style={{ height: 1, flex: 1, background: C.sand }} />
                  </div>
                  {tierSponsors.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: ti <= 1 ? 14 : 10, marginBottom: 14 }}>
                      {tierSponsors.map((s, si) => (
                        <div key={si} style={{
                          padding: ti === 0 ? "14px 28px" : ti === 1 ? "10px 20px" : "7px 16px",
                          borderRadius: ti === 0 ? 10 : 8,
                          background: ti === 0 ? C250.navy : ti === 1 ? C.warmWhite : "transparent",
                          border: ti === 0 ? `1px solid ${C250.gold}40` : ti <= 1 ? `1px solid ${C.sand}` : "none",
                          fontFamily: "'Libre Baskerville', serif",
                          fontSize: ti === 0 ? 18 : ti === 1 ? 15 : 13,
                          fontWeight: ti === 0 ? 700 : 400,
                          color: ti === 0 ? C250.gold : C250.navy,
                          letterSpacing: ti === 0 ? 0.5 : 0,
                        }}>
                          {s.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: C.textMuted, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", fontStyle: "italic", marginBottom: 12 }}>
                      Sponsor slots available — your name here.
                    </div>
                  )}
                  <a href={mailtoLink} style={{ display: "inline-block", fontSize: 12, color: C250.navy, fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", borderBottom: `1px solid ${C250.gold}80`, paddingBottom: 1 }}
                    onMouseEnter={e => e.currentTarget.style.borderBottomColor = C250.gold}
                    onMouseLeave={e => e.currentTarget.style.borderBottomColor = `${C250.gold}80`}
                  >
                    Become a {tier.tier} →
                  </a>
                  <div style={{ marginTop: 10 }}>
                    <ul style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", padding: 0, margin: 0, listStyle: "none" }}>
                      {tier.perks.map(p => <li key={p} style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>✓ {p}</li>)}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            );})}
          </div>
        </div>
      </section>

      <DiagonalDivider topColor={C.cream} bottomColor={C.dusk} />

      {/* ── GET INVOLVED ── */}
      <section id="get-involved" style={{ background: C.dusk, padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <SectionLabel light style={{ textAlign: "center", display: "block" }}>Get Involved</SectionLabel>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0", lineHeight: 1.2 }}>This Is Your Celebration Too</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto" }}>
                Whether you're setting up chairs or spreading the word — there's a place for you in making this night happen.
              </p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }} className="mobile-col-1">
            {/* Volunteer form */}
            <FadeIn>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "28px 24px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 20 }}>Volunteer Sign-Up</div>
                {volSent ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🎆</div>
                    <div style={{ color: C250.gold, fontWeight: 600, marginBottom: 8 }}>You're in!</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>We'll be in touch as the date approaches. Thank you.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[{ key: "name", label: "Your Name *", type: "text", ph: "Jane Smith" }, { key: "email", label: "Email *", type: "email", ph: "jane@example.com" }].map(f => (
                      <div key={f.key}>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.ph} value={volForm[f.key]} onChange={e => setVolForm(v => ({ ...v, [f.key]: e.target.value }))}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", boxSizing: "border-box", outline: "none" }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>How Would You Like to Help?</label>
                      <select value={volForm.role} onChange={e => setVolForm(v => ({ ...v, role: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(30,40,55,0.9)", color: C.cream, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: "none" }}>
                        <option value="">Select a role…</option>
                        {["Set up / tear down", "Parking & traffic", "Photography or video", "Food service", "Fundraising", "Promotion & social media", "Other"].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>Message (optional)</label>
                      <textarea rows={2} placeholder="Anything else you'd like us to know…" value={volForm.message} onChange={e => setVolForm(v => ({ ...v, message: e.target.value }))}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", resize: "vertical", boxSizing: "border-box", outline: "none" }} />
                    </div>
                    <button onClick={handleVolSubmit}
                      style={{ background: C250.gold, color: C250.navy, border: "none", borderRadius: 4, padding: "12px 24px", fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", marginTop: 4 }}>
                      Sign Me Up →
                    </button>
                  </div>
                )}
              </div>
            </FadeIn>
            {/* Share */}
            <FadeIn delay={120}>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "28px 24px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 12 }}>Spread the Word</div>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 20 }}>
                    The bigger the crowd, the better the night. Share this page with everyone you know who loves Manitou Beach.
                  </p>
                  <ShareBar url="https://manitoubeach.com/usa250" title="Manitou Beach is celebrating America's 250th — July 4, 2026. Be there." />
                </div>
                <div style={{ background: "rgba(201,168,76,0.08)", borderRadius: 14, padding: "24px 22px", border: `1px solid ${C250.gold}30` }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C250.gold, marginBottom: 10 }}>Subscribe for Updates</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 16 }}>
                    Get event updates, fundraising milestones, and Holly & Yeti behind-the-scenes content in the Manitou Beach Dispatch.
                  </p>
                  <Btn href="/#newsletter" variant="outlineLight" small style={{ whiteSpace: "nowrap" }}>Subscribe to The Dispatch →</Btn>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

