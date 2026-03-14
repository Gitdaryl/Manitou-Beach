import React, { useState } from 'react';
import { Btn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, Navbar } from '../App';

function PlacementDiagram({ type, dark = false }

function AdvertisePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get("success") === "true";
  const isCancelled = params.get("cancelled") === "true";
  const successName = params.get("event") || "";

  const [form, setForm] = useState({ brandName: "", email: "", tier: "", promoPages: [], notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsPages = ["banner_1p", "banner_3p"].includes(form.tier);
  const selectedPkg = ADVERTISE_PACKAGES.find(p => p.id === form.tier);

  const togglePage = (page) => {
    setForm(f => ({
      ...f,
      promoPages: f.promoPages.includes(page)
        ? f.promoPages.filter(p => p !== page)
        : [...f.promoPages, page],
    }));
  };

  const handleSubmit = async () => {
    if (!form.brandName || !form.email || !form.tier) {
      setError("Please fill in your name, email, and a package.");
      return;
    }
    if (needsPages && form.promoPages.length === 0) {
      setError("Please select at least one page for your banner.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/create-promo-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: form.tier,
          eventName: form.brandName,
          email: form.email,
          promoPages: form.promoPages.join(", "),
          notes: form.notes,
          returnPath: "advertise",
        }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${C.night} 0%, ${C.dusk} 55%, ${C.lakeDark} 100%)`,
        padding: "140px 24px 80px",
        textAlign: "center",
      }}>
        <SectionLabel light>Advertising &amp; Sponsorships</SectionLabel>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(34px, 5.5vw, 62px)", fontWeight: 400, color: C.cream, margin: "0 0 20px 0", lineHeight: 1.15 }}>
          Your brand, in front of people<br/>who actually live here.
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 540, margin: "0 auto" }}>
          Manitou Beach isn't a passing-through crowd. These are lake residents, seasonal visitors, and local loyalists — a tight community that buys local and pays attention.
        </p>
      </section>

      {/* Success / Cancelled */}
      {isSuccess && (
        <div style={{ background: "#1e3326", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, marginBottom: 8 }}>Payment Received!</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "0 auto" }}>
            Thank you{successName ? `, ${successName}` : ""}. We'll have your placement live within 24 hours. Check your email for confirmation.
          </div>
        </div>
      )}
      {isCancelled && (
        <div style={{ background: "#2a1a1a", padding: "24px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }}>Checkout was cancelled — your details are saved below if you'd like to try again.</div>
        </div>
      )}

      {/* Who it's for */}
      <section style={{ background: C.warmWhite, padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionLabel style={{ textAlign: "center", display: "block" }}>Who This Is For</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 20 }}>
            {[
              { icon: "🏪", title: "Local Businesses", body: "You're already in the directory. Now put your brand in front of the community beyond search results — in their inbox, on the pages they actually visit." },
              { icon: "🗺️", title: "Regional Brands", body: "Reach a highly-engaged audience of lake homeowners, cottage visitors, and outdoor recreation buyers. Targeted placements, no ad-tech overhead." },
              { icon: "📣", title: "Event Organizers", body: "Running a market, festival, or fundraiser? Page banners and newsletter features put your event in front of the right crowd before the date." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ background: C.cream, borderRadius: 12, padding: "24px 20px", border: `1px solid ${C.sand}` }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section style={{ background: C.cream, padding: "60px 24px 56px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
            <SectionTitle style={{ margin: 0 }}>Ad Placements</SectionTitle>
            <div style={{ background: `${C.sunset}18`, border: `1px solid ${C.sunset}40`, borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunset, fontFamily: "'Libre Franklin', sans-serif" }}>
              Founding Rates — Limited Time
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 36, fontFamily: "'Libre Franklin', sans-serif" }}>
            These are launch prices.{" "}
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: C.sunset, letterSpacing: 0.3 }}>
              Early advertisers lock in today's rate for life.
            </span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {ADVERTISE_PACKAGES.map(pkg => {
              const isSelected = form.tier === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setForm(f => ({ ...f, tier: pkg.id }))}
                  style={{
                    background: isSelected ? `linear-gradient(135deg, ${C.night}, ${C.lakeDark})` : C.cream,
                    border: `2px solid ${isSelected ? C.sage : C.sand}`,
                    borderRadius: 14, padding: "24px 22px", cursor: "pointer",
                    transition: "all 0.2s", position: "relative",
                    boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = C.lakeBlue; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.sand; }}
                >
                  <PlacementDiagram type={pkg.diagramType} dark={isSelected} />
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: isSelected ? C.sunsetLight : C.textMuted, marginBottom: 8 }}>
                    {pkg.detail}
                  </div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: isSelected ? C.cream : C.text, marginBottom: 6 }}>
                    {pkg.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: isSelected ? C.cream : C.text, fontFamily: "'Libre Franklin', sans-serif" }}>{pkg.price}</span>
                    <span style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.35)" : C.textMuted, textDecoration: "line-through", fontFamily: "'Libre Franklin', sans-serif" }}>{pkg.fullPrice}</span>
                  </div>
                  <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.55)" : C.textLight, lineHeight: 1.6, marginBottom: 10 }}>
                    {pkg.desc}
                  </div>
                  <div style={{ fontSize: 12, color: isSelected ? "rgba(255,255,255,0.38)" : C.textMuted, lineHeight: 1.65, fontStyle: "italic", borderTop: `1px solid ${isSelected ? "rgba(255,255,255,0.08)" : C.sand}`, paddingTop: 10 }}>
                    {pkg.plain}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Page Sponsorship callout */}
      <section style={{ background: C.night, padding: "56px 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}>
          <SectionLabel light style={{ textAlign: "center", display: "block" }}>Exclusive Placement</SectionLabel>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 400, color: C.cream, margin: "0 0 16px 0", lineHeight: 1.2 }}>
            Own a page. Be the only brand on it.
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 28px" }}>
            Ten pages. One exclusive sponsor per page. Your logo, tagline, and link — the only ad on that page for the full term. A bait shop on the Fishing page. A winery on the Wineries page. A real estate office on the Devils Lake page.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.cream, fontFamily: "'Libre Franklin', sans-serif" }}>$97</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1 }}>per month</div>
            </div>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif" }}>$970</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1 }}>per year (2 months free)</div>
            </div>
          </div>
          <a
            href={`mailto:hello@manitoubeach.com?subject=Page%20Sponsorship%20Inquiry&body=Hi%2C%20I%27m%20interested%20in%20sponsoring%20a%20page%20on%20Manitou%20Beach.%0A%0ABusiness%2FBrand%3A%20%0APage%20of%20interest%3A%20%0AMonthly%20or%20annual%3A%20`}
            style={{
              display: "inline-block",
              background: C.sunset, color: "#fff",
              fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
              fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
              textDecoration: "none", padding: "12px 28px", borderRadius: 4,
              transition: "opacity 0.2s",
            }}
          >
            Check Availability →
          </a>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 14, fontFamily: "'Libre Franklin', sans-serif" }}>
            10 pages available · 1 sponsor per page · we'll confirm availability by email
          </div>
        </div>
      </section>

      {/* Checkout form */}
      {!isSuccess && form.tier && (
        <section style={{ background: C.warmWhite, padding: "64px 24px 72px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <SectionTitle>Get Started</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, margin: "0 0 36px 0" }}>
              You've selected <strong style={{ color: C.text }}>{selectedPkg?.label}</strong>
              {selectedPkg && ` — ${selectedPkg.price}`}. Fill in your details and we'll have your placement live within 24 hours.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Business or Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manitou Bait & Tackle"
                  value={form.brandName}
                  onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, boxSizing: "border-box", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Contact Email *</label>
                <input
                  type="email"
                  placeholder="you@yourbusiness.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, boxSizing: "border-box", outline: "none" }}
                />
              </div>
              {needsPages && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>
                    Which page(s)? {form.tier === "banner_3p" ? "(pick 3)" : "(pick 1)"}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {PROMO_PAGES.map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => togglePage(page)}
                        style={{
                          padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          fontFamily: "'Libre Franklin', sans-serif", cursor: "pointer", transition: "all 0.15s",
                          background: form.promoPages.includes(page) ? C.lakeBlue : "transparent",
                          color: form.promoPages.includes(page) ? "#fff" : C.text,
                          border: `1.5px solid ${form.promoPages.includes(page) ? C.lakeBlue : C.sand}`,
                        }}
                      >{page}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Notes (optional)</label>
                <textarea
                  placeholder="Anything you'd like us to know — URL to include, preferred timing, etc."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1.5px solid ${C.sand}`, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, resize: "vertical", boxSizing: "border-box", outline: "none" }}
                />
              </div>
              {error && <div style={{ color: "#c0392b", fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}
              <Btn onClick={handleSubmit} variant="primary" style={{ width: "100%", textAlign: "center", opacity: loading ? 0.6 : 1 }}>
                {loading ? "Redirecting to checkout…" : `Continue to Payment — ${selectedPkg?.price}`}
              </Btn>
              <div style={{ fontSize: 12, color: C.textMuted, textAlign: "center", fontFamily: "'Libre Franklin', sans-serif" }}>
                Secure payment via Stripe · Your placement goes live within 24 hours
              </div>
            </div>
          </div>
        </section>
      )}

      {!isSuccess && !form.tier && (
        <section style={{ background: C.warmWhite, padding: "40px 24px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
              ↑ Select a package above to get started, or{" "}
              <a href="mailto:hello@manitoubeach.com" style={{ color: C.lakeBlue, textDecoration: "none" }}>email us</a>{" "}
              if you'd like to discuss a custom arrangement.
            </div>
          </div>
        </section>
      )}

      <NewsletterInline />
      <Footer />
    </div>
  );
}

export default function PromotePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get("success") === "true";
  const isCancelled = params.get("cancelled") === "true";
  const successEvent = params.get("event") || "";

  const [form, setForm] = useState({ eventName: "", email: "", tier: "free", promoPages: [], notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsPages = ["banner_1p", "banner_3p"].includes(form.tier);
  const selectedPkg = PROMOTE_PACKAGES.find(p => p.id === form.tier);

  const togglePage = (page) => {
    setForm(f => ({
      ...f,
      promoPages: f.promoPages.includes(page)
        ? f.promoPages.filter(p => p !== page)
        : [...f.promoPages, page],
    }));
  };

  const handleSubmit = async () => {
    if (!form.eventName || !form.email || !form.tier) {
      setError("Please fill in your event name, email, and promotion package.");
      return;
    }
    if (form.tier === "free") {
      document.getElementById("submit-event")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (needsPages && form.promoPages.length === 0) {
      setError("Please select at least one page for your banner.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/create-promo-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: form.tier,
          eventName: form.eventName,
          email: form.email,
          promoPages: form.promoPages.join(", "),
          notes: form.notes,
        }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 60%, ${C.dusk} 100%)`,
        padding: "140px 24px 80px",
        textAlign: "center",
      }}>
        <SectionLabel light>Reach the Community</SectionLabel>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 400, color: C.cream, margin: "0 0 20px 0", lineHeight: 1.1 }}>
          Your event deserves a full room.
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 0" }}>
          Manitou Beach people want things to do. Give them something to show up for — and the place to find it.
        </p>
      </section>

      {/* Success / Cancelled states */}
      {isSuccess && (
        <div style={{ background: "#1e3326", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, marginBottom: 8 }}>Payment Received!</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "0 auto" }}>
            Thank you{successEvent ? ` for promoting "${successEvent}"` : ""}. We'll have your promotion live within 24 hours. Check your email for confirmation.
          </div>
        </div>
      )}
      {isCancelled && (
        <div style={{ background: "#2a1a1a", padding: "24px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)" }}>Checkout was cancelled — your details are still saved below if you'd like to try again.</div>
        </div>
      )}

      {/* List Free — event submission */}
      <HappeningSubmitCTA />

      {/* Package grid */}
      <section style={{ background: C.warmWhite, padding: "72px 24px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
            <SectionTitle style={{ margin: 0 }}>Promotion Packages</SectionTitle>
            <div style={{ background: `${C.sunset}18`, border: `1px solid ${C.sunset}40`, borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunset, fontFamily: "'Libre Franklin', sans-serif" }}>
              Founding Sponsor Rates — Limited Time
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 40, fontFamily: "'Libre Franklin', sans-serif" }}>
            These are our launch prices. Full rates take effect after summer 2026 —{" "}
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunset, letterSpacing: 0.3 }}>
              founding sponsors lock in today's rate for life.
            </span>
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {/* Free listing card */}
            <div
              onClick={() => setForm(f => ({ ...f, tier: "free" }))}
              style={{
                background: form.tier === "free" ? `linear-gradient(135deg, ${C.night}, ${C.lakeDark})` : C.cream,
                border: `2px solid ${form.tier === "free" ? C.sage : C.sand}`,
                borderRadius: 14, padding: "24px 22px", cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: form.tier === "free" ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
              }}
              onMouseEnter={e => { if (form.tier !== "free") e.currentTarget.style.borderColor = C.lakeBlue; }}
              onMouseLeave={e => { if (form.tier !== "free") e.currentTarget.style.borderColor = C.sand; }}
            >
              <PlacementDiagram type="free" dark={form.tier === "free"} />
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: form.tier === "free" ? C.sunsetLight : C.textMuted, marginBottom: 8 }}>
                Community Calendar
              </div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: form.tier === "free" ? C.cream : C.text, marginBottom: 6 }}>
                Free Listing
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: form.tier === "free" ? C.cream : C.text, fontFamily: "'Libre Franklin', sans-serif" }}>$0</span>
                <span style={{ fontSize: 13, color: form.tier === "free" ? "rgba(255,255,255,0.35)" : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>always free</span>
              </div>
              <div style={{ fontSize: 13, color: form.tier === "free" ? "rgba(255,255,255,0.55)" : C.textLight, lineHeight: 1.6 }}>
                Your event on the community calendar where locals actually check what's happening this weekend. Live within 48 hours, no card required.
              </div>
            </div>

            {PROMOTE_PACKAGES.map(pkg => {
              const isSelected = form.tier === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setForm(f => ({ ...f, tier: pkg.id }))}
                  style={{
                    background: isSelected ? `linear-gradient(135deg, ${C.night}, ${C.lakeDark})` : C.cream,
                    border: `2px solid ${isSelected ? C.sage : C.sand}`,
                    borderRadius: 14, padding: "24px 22px", cursor: "pointer",
                    transition: "all 0.2s", position: "relative",
                    boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = C.lakeBlue; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = C.sand; }}
                >
                  {pkg.badge && (
                    <div style={{ position: "absolute", top: -10, right: 16, background: C.sunset, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 10px", borderRadius: 10, fontFamily: "'Libre Franklin', sans-serif" }}>
                      {pkg.badge}
                    </div>
                  )}
                  <PlacementDiagram type={pkg.diagramType} dark={isSelected} />
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: isSelected ? C.sunsetLight : C.textMuted, marginBottom: 8 }}>
                    {pkg.detail}
                  </div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: isSelected ? C.cream : C.text, marginBottom: 6 }}>
                    {pkg.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: isSelected ? C.cream : C.text, fontFamily: "'Libre Franklin', sans-serif" }}>{pkg.price}</span>
                    <span style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.35)" : C.textMuted, textDecoration: "line-through", fontFamily: "'Libre Franklin', sans-serif" }}>{pkg.fullPrice}</span>
                  </div>
                  <div style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.55)" : C.textLight, lineHeight: 1.6, marginBottom: pkg.plain ? 10 : 0 }}>
                    {pkg.desc}
                  </div>
                  {pkg.plain && (
                    <div style={{ fontSize: 12, color: isSelected ? "rgba(255,255,255,0.38)" : C.textMuted, lineHeight: 1.65, fontStyle: "italic", borderTop: `1px solid ${isSelected ? "rgba(255,255,255,0.08)" : C.sand}`, paddingTop: 10 }}>
                      {pkg.plain}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Checkout form */}
      {!isSuccess && (
        <section style={{ background: C.cream, padding: "72px 24px 80px" }}>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <SectionTitle>Get Started</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, margin: "0 0 40px 0" }}>
              Fill in your details and click Purchase — you'll be taken to a secure Stripe checkout. Once payment is confirmed, we'll activate your promotion within 24 hours.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Event / Business Name *</label>
                <input
                  value={form.eventName}
                  onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
                  placeholder="e.g. Cherry Creek Cellars — Grape Stomp"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", boxSizing: "border-box", background: C.warmWhite, color: C.text, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Your Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@email.com"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", boxSizing: "border-box", background: C.warmWhite, color: C.text, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Promotion Package *</label>
                <select
                  value={form.tier}
                  onChange={e => setForm(f => ({ ...f, tier: e.target.value, promoPages: [] }))}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", boxSizing: "border-box", background: C.warmWhite, color: C.text, outline: "none" }}
                >
                  <option value="free">Free Listing — Community Calendar — $0</option>
                  {PROMOTE_PACKAGES.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.label} — {pkg.detail} — {pkg.price}</option>
                  ))}
                </select>
                {form.tier === "free" && (
                  <div style={{ fontSize: 13, color: C.textLight, marginTop: 6, lineHeight: 1.5 }}>Your event will be listed in the community calendar — reviewed and live within 48 hours. No payment needed.</div>
                )}
                {selectedPkg && (
                  <div style={{ fontSize: 13, color: C.textLight, marginTop: 6, lineHeight: 1.5 }}>{selectedPkg.desc}</div>
                )}
              </div>

              {needsPages && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.textMuted, marginBottom: 10 }}>Target Pages (choose {form.tier === "banner_3p" ? "up to 3" : "1"}) *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {PROMO_PAGES.map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => togglePage(page)}
                        style={{
                          padding: "8px 16px", borderRadius: 6, fontSize: 13,
                          fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                          cursor: "pointer", border: `1px solid ${form.promoPages.includes(page) ? C.sage : C.sand}`,
                          background: form.promoPages.includes(page) ? C.sage : C.warmWhite,
                          color: form.promoPages.includes(page) ? "#fff" : C.text,
                          transition: "all 0.15s",
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Event date, preferred start date, image URL, or anything else we should know..."
                  rows={3}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 15, fontFamily: "'Libre Franklin', sans-serif", boxSizing: "border-box", background: C.warmWhite, color: C.text, outline: "none", resize: "vertical" }}
                />
              </div>

              {error && (
                <div style={{ background: "#fff0f0", border: "1px solid #f0b0b0", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#c0392b" }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "15px 0", background: loading ? C.textMuted : "#4A9B6F", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700,
                  letterSpacing: 1.5, textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.2s",
                  width: "100%",
                }}
              >
                {loading ? "Redirecting to Checkout…" : form.tier === "free" ? "Submit Free Listing →" : `Purchase — ${selectedPkg?.price || ""}`}
              </button>

              <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
                Secure checkout via Stripe. After payment, you'll receive a confirmation and your promotion will go live within 24 hours.
                <br />Questions? <a href="mailto:holly@foundationrealty.com" style={{ color: C.lakeBlue }}>Email Holly</a>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Amplify nudge — for businesses / recurring advertisers */}
      <section style={{ background: C.warmWhite, padding: "40px 24px", borderTop: `1px solid ${C.sand}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, marginBottom: 6 }}>Running a business, not just an event?</div>
            <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>Ongoing ad placements — newsletter sponsorships, page banners, and video features — are on the advertising page.</div>
          </div>
          <Btn href="/advertise" variant="outline" small style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Explore Ad Placements →</Btn>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.night} />
      <HollyYetiSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
