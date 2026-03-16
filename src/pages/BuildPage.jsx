import React, { useState } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
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

  const BUILD_INCLUDES = [
    { icon: "📄", title: "5 Professional Pages", copy: "Home, About, Services, Contact, plus one custom page. Everything a local business needs." },
    { icon: "📱", title: "Mobile-Ready", copy: "Over 60% of local searches happen on phones. Your site looks sharp on every screen." },
    { icon: "🔍", title: "Local SEO Basics", copy: "Google Business optimization, meta titles, and sitemap — so people actually find you." },
    { icon: "✏️", title: "2 Updates Per Month", copy: "New hours, a seasonal menu, a fresh photo. Email us and it's done within 48 hours." },
    { icon: "☁️", title: "Hosting + Maintenance", copy: "We host it, secure it, and keep it running. You never have to call your nephew again." },
    { icon: "⭐", title: "Free Enhanced Listing", copy: "Your business on Manitou Beach — the local directory the community actually uses. Included." },
  ];

  const BUILD_FAQS = [
    { q: "Do I own the website?", a: "You own your content and your domain. If you ever stop, we send you the files or point your domain wherever you want. No lock-in." },
    { q: "What if I need to sell products online?", a: "Shopify is the right tool for that — it handles inventory, shipping, and payments better than a custom build. We'll help you get there." },
    { q: "How long does it take?", a: "Two to three weeks from our first call to launch. You send us your logo, photos, and a few sentences about what you do — we handle the rest." },
    { q: "What happens after 2 updates per month?", a: "We quote extra changes at an hourly rate. Most clients never hit the limit — it's there for businesses with frequent menu or hours changes." },
  ];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── 1. HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 55%, ${C.lakeDark} 100%)`, padding: "140px 24px 100px", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light>Website Rental · Manitou Beach Area</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 700, color: C.cream, margin: "20px 0 20px", lineHeight: 1.1 }}>
            Your website is costing<br />you customers.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.75 }}>
            Visitors Google you before they walk in. If they can't find you — or don't like what they see — they go somewhere else.
          </p>
          <Btn href="#get-started" variant="sunset" style={{ whiteSpace: "nowrap" }}>
            Get Started — $499 to Launch
          </Btn>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: "rgba(255,255,255,0.35)", marginTop: 14 }}>
            Then $49/mo. Cancel anytime.
          </div>
        </FadeIn>
      </section>

      <WaveDivider topColor={C.lakeDark} bottomColor={C.cream} />

      {/* ── 2. WHAT'S INCLUDED ── */}
      <section style={{ background: C.cream, padding: "72px 24px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>Everything Handled</SectionLabel>
            <SectionTitle center>You get a site that works.<br />We take care of the rest.</SectionTitle>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>
            {BUILD_INCLUDES.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.07}>
                <div style={{
                  background: i === 5 ? "rgba(122,142,114,0.06)" : C.warmWhite,
                  borderRadius: 14,
                  padding: "28px 24px",
                  border: `1px solid ${C.sand}`,
                  borderLeft: i === 5 ? `4px solid ${C.sage}` : `1px solid ${C.sand}`,
                  height: "100%",
                  boxSizing: "border-box",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 8, fontWeight: 700 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7 }}>{item.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.35}>
            <div style={{ background: "rgba(122,142,114,0.08)", border: "1px solid rgba(122,142,114,0.25)", borderRadius: 12, padding: "18px 24px", marginTop: 32, maxWidth: 620, marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7 }}>
                <strong style={{ color: C.sageDark }}>Already thinking about a Featured or Premium listing?</strong> Website clients get a discounted rate — mention it when we connect.
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />

      {/* ── 3. THE OFFER ── */}
      <section style={{ background: C.dusk, padding: "80px 24px", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light style={{ textAlign: "center", display: "block" }}>One Simple Price</SectionLabel>
          <div style={{ maxWidth: 460, margin: "28px auto 0", background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "48px 36px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div>
              <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 60, fontWeight: 700, color: C.cream }}>$499</span>
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>to launch</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 32, fontWeight: 700, color: C.cream }}>$49</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>/mo after that</span>
            </div>
            <div style={{ width: 48, height: 1, background: "rgba(255,255,255,0.12)", margin: "24px auto" }} />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: "0 0 24px" }}>
              You make a call. Send us your logo, your hours, and a few photos. Two to three weeks later, you have a real website. After that, we keep it updated, hosted, and running — you never think about it again.
            </p>
            <div style={{ background: "rgba(122,142,114,0.15)", border: "1px solid rgba(122,142,114,0.35)", borderRadius: 10, padding: "14px 18px", marginBottom: 28, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
              <strong style={{ color: C.sunsetLight }}>Included:</strong> Free Enhanced listing on Manitou Beach<br />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>($9/mo value — the local directory your community uses)</span>
            </div>
            <Btn href="#get-started" variant="sunset" style={{ whiteSpace: "nowrap", display: "block", textAlign: "center" }}>
              Request a Callback →
            </Btn>
          </div>
        </FadeIn>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />

      {/* ── 4. LEAD CAPTURE FORM ── */}
      <section id="get-started" style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>Get Started</SectionLabel>
            <SectionTitle center>Tell us about your business.</SectionTitle>
            <p style={{ textAlign: "center", fontSize: 14, color: C.textLight, lineHeight: 1.7, marginBottom: 36 }}>
              Daryl will follow up personally within 24 hours.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            {submitted ? (
              <div style={{ background: C.cream, borderRadius: 16, border: "1px solid rgba(122,142,114,0.3)", padding: "48px 36px", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(122,142,114,0.15)", border: `2px solid ${C.sage}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 22 }}>✓</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.text, marginBottom: 12 }}>You're on the list.</div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, maxWidth: 340, margin: "0 auto" }}>
                  Daryl will reach out within 24 hours to learn more about your business and answer any questions.
                </p>
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
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textLight, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>Anything We Should Know <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                    <textarea placeholder="Your current website URL if you have one, your industry, your timeline..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} onFocus={() => setFocusField("notes")} onBlur={() => setFocusField(null)} rows={4} style={{ ...inputStyle("notes"), resize: "vertical" }} />
                  </div>
                  {error && <p style={{ fontSize: 13, color: C.sunset, margin: 0 }}>{error}</p>}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ width: "100%", padding: 15, borderRadius: 10, border: "none", background: C.sunset, color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.6 : 1, transition: "opacity 0.2s" }}
                  >
                    {submitting ? "Sending…" : "Send My Inquiry →"}
                  </button>
                </div>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} flip />

      {/* ── 5. FAQ ── */}
      <section style={{ background: C.cream, padding: "72px 24px 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>Questions</SectionLabel>
            <SectionTitle center>The answers you'll want before you call.</SectionTitle>
          </FadeIn>
          <div style={{ marginTop: 40 }}>
            {BUILD_FAQS.map((faq, i) => (
              <FadeIn key={faq.q} delay={i * 0.08}>
                <div style={{ borderBottom: `1px solid ${C.sand}`, padding: "24px 0" }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 10, fontWeight: 700 }}>{faq.q}</div>
                  <div style={{ fontSize: 14, color: C.textLight, lineHeight: 1.75 }}>{faq.a}</div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.4}>
            <div style={{ background: C.warmWhite, borderRadius: 12, padding: "20px 24px", marginTop: 32, border: `1px solid ${C.sand}` }}>
              <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.75 }}>
                <strong style={{ color: C.text }}>Need a full online store?</strong> Shopify is built for that — inventory, shipping, payments. We'll help you get set up and pointed in the right direction.
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
