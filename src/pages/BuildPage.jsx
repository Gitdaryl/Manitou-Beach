import React, { useState } from 'react';
import { FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';

// ============================================================
export default function BuildPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const [form, setForm] = useState({ name: "", business: "", email: "", phone: "", notes: "", _hp: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState(null);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.business.trim() || !form.email.trim()) {
      setError("Please fill in your name, business name, and email.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const resp = await fetch("/api/build-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone.trim() || null }),
      });
      const data = await resp.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: 10,
    border: `1px solid ${focusField === field ? C.lakeBlue : C.sand}`,
    background: "white",
    color: C.text,
    fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  const OUTCOMES = [
    "More calls", "More walk-ins", "More bookings", "More Google reviews",
    "More trust", "More customers", "More off-season business", "More first impressions that stick",
  ];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── 1. HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 55%, ${C.lakeDark} 100%)`, padding: "140px 24px 100px", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light>Web Presence · Manitou Beach Area</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 5.5vw, 62px)", fontWeight: 400, color: C.cream, margin: "20px 0 24px", lineHeight: 1.1 }}>
            Your neighbors are searching<br />for what you sell.<br />
            <span style={{ color: C.sunsetLight }}>Are they finding you?</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.8 }}>
            Most Manitou Beach businesses don't have a real web presence. The ones that do get found, get called, and get remembered.
          </p>
          <a
            href="#get-started"
            style={{ display: "inline-block", padding: "15px 36px", borderRadius: 10, background: C.sunset, color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", transition: "opacity 0.2s" }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            Tell me about your business →
          </a>
        </FadeIn>
      </section>

      {/* ── 2. MARQUEE ── */}
      <div style={{ background: C.night, padding: "22px 0", overflow: "hidden", borderTop: `1px solid rgba(255,255,255,0.05)`, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <div className="marquee-track">
          {[...OUTCOMES, ...OUTCOMES].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
              <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(16px, 2vw, 22px)", color: i % 2 === 0 ? C.cream : C.driftwood, padding: "0 28px" }}>
                {item}
              </span>
              <span style={{ color: C.sunset, fontSize: 10, opacity: 0.6 }}>◆</span>
            </span>
          ))}
        </div>
      </div>

      <WaveDivider topColor={C.night} bottomColor={C.cream} />

      {/* ── 3. OUTCOMES — no features, no jargon ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <SectionLabel>What Actually Changes</SectionLabel>
              <SectionTitle center>This is what a good web presence does for you.</SectionTitle>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              {
                headline: "People find you when they search",
                body: "Google, the directory, word of mouth — they all point somewhere. Right now that somewhere might be nothing. A real web presence changes that.",
              },
              {
                headline: "You look worth visiting before they arrive",
                body: "A good site does the selling before they ever walk in. Photos, hours, a phone number that works on mobile — that's the difference between a visit and a scroll past.",
              },
              {
                headline: "You stop losing customers to businesses with better websites",
                body: "This is the real cost of not having one. Someone searches, they find your competitor, they go there. You never knew they were looking.",
              },
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ background: C.warmWhite, borderRadius: 14, padding: "32px 28px", border: `1px solid ${C.sand}`, height: "100%", boxSizing: "border-box" }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text, margin: "0 0 14px 0", lineHeight: 1.35 }}>{card.headline}</h3>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.75, margin: 0 }}>{card.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />

      {/* ── 4. YETI / WHO YOU'RE TALKING TO ── */}
      <section style={{ background: C.dusk, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <FadeIn>
            <img
              src="/images/yeti/yeti-camera.png"
              alt="Yeti with camera"
              style={{ width: "clamp(220px, 30vw, 340px)", flexShrink: 0, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
            />
          </FadeIn>
          <FadeIn delay={120} style={{ flex: 1, minWidth: 280, maxWidth: 480 }}>
            <SectionLabel light>Who You're Talking To</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.2 }}>
              Not an agency.<br />Just Daryl.
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 18px" }}>
              Filmmaker. Storyteller. The person who built this community platform you're reading right now. Daryl builds every site personally — because he knows what Manitou Beach businesses actually need, and it's usually not what they think.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 24px" }}>
              Most sites run around <strong style={{ color: C.sunsetLight }}>$97/month</strong>. Some are simpler, some more involved — we work that out in the first conversation. No quote until he knows what you actually need.
            </p>
            <a
              href="#get-started"
              style={{ display: "inline-block", padding: "13px 30px", borderRadius: 8, border: `1.5px solid ${C.sunsetLight}`, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", transition: "all 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.background = C.sunset; e.currentTarget.style.borderColor = C.sunset; e.currentTarget.style.color = C.cream; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.sunsetLight; e.currentTarget.style.color = C.sunsetLight; }}
            >
              Start the conversation →
            </a>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />

      {/* ── 5. CONSULTATION FORM ── */}
      <section id="get-started" style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <SectionLabel>Start the Conversation</SectionLabel>
              <SectionTitle center>Tell me about your business.</SectionTitle>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.75, margin: "12px 0 0" }}>
                No quote until I know what you actually need.<br />Most chats take 10 minutes.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            {submitted ? (
              <div style={{ background: C.cream, borderRadius: 16, border: "1px solid rgba(122,142,114,0.3)", padding: "48px 36px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(122,142,114,0.15)", border: `2px solid ${C.sage}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 22 }}>✓</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.text, marginBottom: 12 }}>Got it — Daryl will be in touch.</div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.75, maxWidth: 360, margin: "0 auto" }}>
                  Expect to hear back within 24 hours. In the meantime, The Dispatch goes out every week with what's happening in Manitou Beach — it's free.
                </p>
                <a
                  href="/dispatch"
                  style={{ display: "inline-block", marginTop: 24, padding: "11px 28px", borderRadius: 8, border: `1.5px solid ${C.sage}`, color: C.sage, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none" }}
                >
                  Subscribe to The Dispatch →
                </a>
              </div>
            ) : (
              <div style={{ background: C.cream, borderRadius: 16, padding: "40px 36px", border: `1px solid ${C.sand}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                <input type="text" value={form._hp} onChange={e => setForm(f => ({ ...f, _hp: e.target.value }))} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Your Name *</label>
                    <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onFocus={() => setFocusField("name")} onBlur={() => setFocusField(null)} style={inputStyle("name")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Business Name *</label>
                    <input type="text" placeholder="Your business name" value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} onFocus={() => setFocusField("business")} onBlur={() => setFocusField(null)} style={inputStyle("business")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Email *</label>
                    <input type="email" placeholder="Email address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onFocus={() => setFocusField("email")} onBlur={() => setFocusField(null)} style={inputStyle("email")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Phone <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                    <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} onFocus={() => setFocusField("phone")} onBlur={() => setFocusField(null)} style={inputStyle("phone")} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Anything I Should Know <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                    <textarea placeholder="What kind of business, do you have a site already, what's bugging you about it..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} onFocus={() => setFocusField("notes")} onBlur={() => setFocusField(null)} rows={4} style={{ ...inputStyle("notes"), resize: "vertical" }} />
                  </div>
                  {error && <p style={{ fontSize: 13, color: C.sunset, margin: 0 }}>{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ width: "100%", padding: 15, borderRadius: 10, border: "none", background: C.sunset, color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.6 : 1, transition: "opacity 0.2s" }}
                  >
                    {submitting ? "Sending…" : "Send it →"}
                  </button>
                  <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                    No quote until we've talked. No obligation.
                  </p>
                </div>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
