import React, { useState, useEffect } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle } from '../components/Shared';
import { C, LISTING_CATEGORIES, PAGE_SPONSORS, SLOT_CAPS } from '../data/config';
import { Footer, GlobalStyles, Navbar, SubmitSection } from '../components/Layout';

// ============================================================
const FEATURED_TIERS = [
  { id: "enhanced", name: "Enhanced" },
  { id: "featured", name: "Featured" },
  { id: "premium", name: "Premium" },
];

const SPOTS_TOTAL = 8;
const SPOTS_LEFT = 5; // Update manually when spots fill — future: pull from Notion

export default function FeaturedPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const spotsLeft = SPOTS_LEFT;
  const isFull = spotsLeft === 0;

  const [subCount, setSubCount] = useState(null);
  const [slotCounts, setSlotCounts] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ businessName: '', email: '', duration: 3, category: '' });
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [status, setStatus] = useState(null);

  const slotsLeft = (tierId, cat) => {
    if (!slotCounts || !cat) return null;
    const cap = SLOT_CAPS[tierId];
    if (cap === undefined) return null;
    const used = slotCounts.tierCounts?.[tierId]?.[cat] || 0;
    return Math.max(0, cap - used);
  };

  // Waitlist state (spots full)
  const [wl, setWl] = useState({ name: "", email: "", businessName: "", tier: "featured_90", _hp: "" });
  const [wlStatus, setWlStatus] = useState("idle"); // idle | loading | success | error

  // Page sponsorship interest form
  const SPONSORABLE_PAGES = [
    { id: 'home', label: 'Home' },
    { id: 'happening', label: "What's Happening" },
    { id: 'round-lake', label: 'Round Lake' },
    { id: 'village', label: 'Village' },
    { id: 'fishing', label: 'Fishing' },
    { id: 'wineries', label: 'Wineries' },
    { id: 'devils-lake', label: 'Devils Lake' },
    { id: 'dispatch', label: 'Dispatch' },
    { id: 'discover', label: 'Discover Map' },
    { id: 'historical-society', label: 'Historical Society' },
  ];
  const [sponsorForm, setSponsorForm] = useState({ name: '', email: '', business: '', phone: '', page: 'home', term: 'monthly', message: '', _hp: '' });
  const [sponsorStatus, setSponsorStatus] = useState('idle');
  const setSF = (k, v) => setSponsorForm(f => ({ ...f, [k]: v }));
  const handleSponsorInquiry = (e) => {
    e.preventDefault();
    if (sponsorForm._hp) return;
    const { name, email, business, phone, page, term, message } = sponsorForm;
    const subject = encodeURIComponent(`Page Sponsorship Inquiry — ${SPONSORABLE_PAGES.find(p => p.id === page)?.label || page}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nBusiness: ${business}\nPhone: ${phone}\nPage: ${SPONSORABLE_PAGES.find(p => p.id === page)?.label || page}\nTerm: ${term === 'monthly' ? '$97/month' : '$970/year'}\nMessage: ${message}`);
    window.open(`mailto:hello@manitoubeach.com?subject=${subject}&body=${body}`, '_blank');
    setSponsorStatus('success');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setStatus({ type: "success", business: params.get("business") || "" });
    else if (params.get("cancelled")) setStatus({ type: "cancelled" });
  }, []);

  useEffect(() => {
    fetch('/api/subscribe')
      .then(r => r.json())
      .then(d => setSubCount(d.count ?? 0))
      .catch(() => setSubCount(0));
    fetch('/api/businesses?slots=true')
      .then(r => r.json())
      .then(d => setSlotCounts(d))
      .catch(() => {});
  }, []);

  const GRACE = 100;
  const count = subCount ?? 0;
  const increment = Math.max(0, count - GRACE);
  const inGrace = count < GRACE;
  const priceFor = (base) => (base + increment * 0.01).toFixed(2);
  const centsFor = (base) => Math.round((base + increment * 0.01) * 100);
  const progressPct = inGrace ? Math.min(100, (count / GRACE) * 100) : Math.min(100, ((count - GRACE) / 900) * 100);

  const PAID_TIERS = [
    {
      id: 'enhanced', name: 'Enhanced', color: C.lakeBlue, badge: null,
      price: priceFor(9), priceInCents: centsFor(9),
      features: ['Everything in Free', 'Clickable website link', 'Business description', 'Expandable listing card', 'Category search placement', 'Pin on Discover map'],
    },
    {
      id: 'featured', name: 'Featured', color: C.sage, badge: 'Most Popular',
      price: priceFor(23), priceInCents: centsFor(23),
      features: ['Everything in Enhanced', 'Spotlight card placement', 'Logo or photo display', 'Above standard listings', 'Email contact button'],
    },
    {
      id: 'premium', name: 'Premium', color: C.sunsetLight, badge: 'Best Visibility',
      price: priceFor(43), priceInCents: centsFor(43),
      features: ['Everything in Featured', 'Full-width banner placement', 'Large logo (110×110)', 'Top-of-directory position', 'Cross-page placements'],
    },
  ];

  const handleCheckout = async () => {
    if (!form.businessName.trim() || !form.email.trim()) { setCheckoutError('Business name and email are required.'); return; }
    setLoading(true); setCheckoutError('');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: modal.tierId, businessName: form.businessName, email: form.email, priceInCents: modal.priceInCents, mode: 'subscription', duration: form.duration, category: form.category }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setCheckoutError(data.error || 'Something went wrong. Please try again.'); }
    } catch { setCheckoutError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!wl.name || !wl.email || !wl.businessName) return;
    setWlStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wl),
      });
      const data = await res.json();
      if (data.success) setWlStatus("success");
      else setWlStatus("error");
    } catch {
      setWlStatus("error");
    }
  };

  const benefits = [
    { icon: "⚡", title: "Be First", desc: "When someone searches for a business like yours, you're what they find. Not buried three pages down — first." },
    { icon: "🎨", title: "Look Like You Belong", desc: "A branded card with your logo tells people you're the real deal — an established part of this community, worth visiting." },
    { icon: "📱", title: "One Tap Away", desc: "Customers decide in seconds. Your number, clickable on mobile, means no friction between them and your door." },
    { icon: "📰", title: "In the Weekly Conversation", desc: "The Dispatch lands in local inboxes every week. Your business gets mentioned in the same breath as community news." },
    { icon: "🎙️", title: "A Warm Introduction", desc: "Premium tier gets you a shoutout on the Holly & Yeti podcast — that's not just traffic, it's a neighbor telling hundreds of people you're worth knowing." },
  ];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{ background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`, padding: "160px 24px 100px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 300, height: 300, borderRadius: "50%", background: `${C.sunset}08`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: `${C.sage}06`, pointerEvents: "none" }} />
        <FadeIn>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
            Free Listings · Featured Upgrades Available
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 400, color: C.cream, lineHeight: 1, margin: "0 0 20px 0" }}>
            {isFull ? <>Join the Waitlist</> : <>Your neighbors are already<br />looking for you.</>}
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 0" }}>
            {isFull
              ? "All founding spots are taken — but join the waitlist and we'll hold your early-bird rate when the next one opens."
              : "This is where Manitou Beach looks first. Make sure you're here when they do."}
          </p>
        </FadeIn>
      </section>

      {/* Category Slot Availability Band — shows Featured tier (most popular) */}
      {slotCounts && slotCounts.tierCounts && !isFull && (() => {
        const activeCats = LISTING_CATEGORIES.filter(cat => (slotCounts.tierCounts.featured?.[cat] || 0) > 0);
        if (activeCats.length === 0) return null;
        return (
          <div style={{ background: C.night, borderBottom: `1px solid rgba(255,255,255,0.06)`, padding: "14px 24px" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                Featured Spots
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {activeCats.map(cat => {
                  const used = slotCounts.tierCounts.featured?.[cat] || 0;
                  const left = Math.max(0, SLOT_CAPS.featured - used);
                  const full = left === 0;
                  const almostFull = left === 1;
                  const dotColor = full ? C.sunset : almostFull ? C.driftwood : C.sage;
                  return (
                    <span key={cat} style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 20,
                      background: full ? `${C.sunset}12` : almostFull ? `${C.driftwood}12` : `${C.sage}10`,
                      border: `1px solid ${dotColor}28`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{cat}</span>
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: full ? C.sunset : "rgba(255,255,255,0.3)" }}>
                        {full ? "Full" : `${left} of ${SLOT_CAPS.featured} left`}
                      </span>
                    </span>
                  );
                })}
              </div>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>
                Premium: 1/cat · Featured: 3/cat · Enhanced: 6/cat
              </span>
            </div>
          </div>
        );
      })()}

      {/* Success / Cancelled banners */}
      {status?.type === "success" && (
        <div style={{ background: `${C.sage}20`, borderBottom: `2px solid ${C.sage}`, padding: "24px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.sage, marginBottom: 6 }}>You're in!</div>
          <p style={{ fontSize: 14, color: C.textLight, margin: 0 }}>
            {status.business ? `${decodeURIComponent(status.business)} — ` : ""}Your featured listing will be live within 24 hours. We'll email you when it's up.
          </p>
        </div>
      )}
      {status?.type === "cancelled" && (
        <div style={{ background: `${C.sunset}15`, borderBottom: `2px solid ${C.sunset}40`, padding: "16px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: C.textLight, margin: 0 }}>No worries — no charge was made. Your spot is still available.</p>
        </div>
      )}

      {/* What you get */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <SectionLabel>What Changes</SectionLabel>
              <SectionTitle center>This is what being found feels like</SectionTitle>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {benefits.map((b, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div style={{ padding: "24px 20px", background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}` }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Your Visibility — subscriber-based pricing */}
      {!isFull && (
        <section style={{ background: C.night, padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 14 }}>
                  {inGrace ? 'Founding Flex Rate · Limited Time' : 'List Your Business'}
                </div>
                <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 400, color: C.cream, margin: "0 0 14px 0" }}>
                  {inGrace ? 'Start at $9. Lock in every tier.' : 'Choose Your Visibility'}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.65 }}>
                  {inGrace
                    ? '$9 today locks in your Featured and Premium rate too. Flex up whenever your season calls for it — you\'ll pay what was live when you joined, not whatever it costs new businesses then.'
                    : 'Your rate is set the day you join. As the community grows, your audience goes up. Your cost doesn\'t.'}
                </p>
                {/* Live subscriber counter */}
                <div style={{ maxWidth: 460, margin: "0 auto", background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                      Weekly Dispatch readers
                    </span>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream }}>
                      {subCount === null ? '—' : count.toLocaleString()}
                      {inGrace && <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.28)", marginLeft: 6 }}>/ {GRACE}</span>}
                    </span>
                  </div>
                  <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 12px 0", lineHeight: 1.5, textAlign: "left" }}>
                    Local residents who chose to follow Manitou Beach — and will see your listing every week.
                  </p>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.sage}, ${C.sunsetLight})`, borderRadius: 999, transition: "width 1s ease" }} />
                  </div>
                  <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.sunsetLight, margin: "10px 0 0", letterSpacing: 0.3, lineHeight: 1.55 }}>
                    {inGrace
                      ? `⚡ Founding rate locks in today and stays fixed for as long as you stay subscribed. After ${GRACE} readers, new listings pay more — you won't.`
                      : '⚡ New listings pay more as the audience grows. Your rate stays fixed for as long as your subscription is active — cancel and rejoin and the current rate applies.'}
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* All tiers: Free + Paid in one unified grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {/* Free tier card */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "28px 22px", display: "flex", flexDirection: "column" }}>
                <div style={{ color: C.driftwood, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Free</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: C.cream, fontWeight: 700 }}>$0</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}> forever</span>
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16, letterSpacing: 0.3 }}>
                  Always free · no credit card
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0", flexGrow: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                  {["Name in directory", "Category & phone", "Community visibility"].map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <span style={{ color: C.driftwood, fontSize: 13, marginTop: 2, flexShrink: 0, fontWeight: 700 }}>✓</span>
                      <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.45 }}>{f}</span>
                    </li>
                  ))}
                  {["No website link", "No map pin", "No description or logo"].map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13, marginTop: 2, flexShrink: 0 }}>—</span>
                      <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 13, lineHeight: 1.45 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="#submit" style={{ display: "block", width: "100%", padding: "11px 0", borderRadius: 8, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", textAlign: "center", border: `1.5px solid ${C.driftwood}55`, color: C.driftwood }}>
                  Get Listed Free
                </a>
              </div>

              {/* Paid tiers */}
              {PAID_TIERS.map(tier => (
                <div key={tier.id} style={{ background: tier.badge ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${tier.badge ? tier.color + "45" : "rgba(255,255,255,0.09)"}`, borderRadius: 16, padding: "28px 22px", position: "relative", display: "flex", flexDirection: "column" }}>
                  {tier.badge && (
                    <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: tier.color, color: C.night, fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                      {tier.badge}
                    </div>
                  )}
                  <div style={{ color: tier.color, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{tier.name}</div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: C.cream, fontWeight: 700 }}>${tier.price}</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}>/mo</span>
                  </div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: inGrace ? "rgba(255,255,255,0.35)" : C.sunsetLight, marginBottom: 16, letterSpacing: 0.3 }}>
                    {inGrace ? 'Founding rate · flex up at this price too' : '↑ rises with every new subscriber'}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flexGrow: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                    {tier.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                        <span style={{ color: tier.color, fontSize: 13, marginTop: 2, flexShrink: 0, fontWeight: 700 }}>✓</span>
                        <span style={{ color: "rgba(255,255,255,0.58)", fontSize: 13, lineHeight: 1.45 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setModal({ tierId: tier.id, tierName: tier.name, price: tier.price, priceInCents: tier.priceInCents, color: tier.color }); setForm({ businessName: '', email: '', duration: 3, category: '' }); setCheckoutError(''); }}
                    style={{ display: "block", width: "100%", padding: "11px 0", borderRadius: 8, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", border: "none", background: tier.id === "premium" ? C.sunset : "transparent", color: tier.id === "premium" ? C.cream : tier.color, outline: tier.id === "premium" ? "none" : `1.5px solid ${tier.color}55`, transition: "all 0.22s" }}
                  >
                    Get Started
                  </button>
                  {slotCounts && (() => {
                    const cap = SLOT_CAPS[tier.id];
                    if (cap === undefined) return null;
                    const fullCats = LISTING_CATEGORIES.filter(cat => (slotCounts.tierCounts?.[tier.id]?.[cat] || 0) >= cap).length;
                    if (fullCats === 0) return null;
                    const openCats = LISTING_CATEGORIES.length - fullCats;
                    return (
                      <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: openCats === 0 ? C.sunset : C.driftwood, margin: "8px 0 0", textAlign: "center", letterSpacing: 0.3 }}>
                        {openCats === 0 ? `All ${tier.name} spots filled` : `${openCats} of ${LISTING_CATEGORIES.length} categories open`}
                      </p>
                    );
                  })()}
                </div>
              ))}
            </div>

            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 12, marginTop: 24, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
              Monthly subscriptions · Cancel anytime · Rate held while subscribed
            </p>
          </div>
        </section>
      )}

      {/* Free business listing form */}
      {!isFull && <SubmitSection />}

      {/* Waitlist form — shown when all spots are taken */}
      {isFull && (
        <section style={{ background: C.cream, padding: "80px 24px" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <FadeIn>
              <SectionLabel>Waitlist</SectionLabel>
              <SectionTitle>Hold Your Rate</SectionTitle>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, marginBottom: 32 }}>
                Join the waitlist and we'll contact you the moment a spot opens. No obligation until you're ready.
              </p>
            </FadeIn>

            {wlStatus === "success" ? (
              <FadeIn>
                <div style={{ background: `${C.sage}15`, border: `1px solid ${C.sage}40`, borderRadius: 12, padding: "32px 28px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎉</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.sage, marginBottom: 8 }}>You're on the list!</div>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                    We'll reach out as soon as a spot opens and hold your rate. Keep an eye on your inbox.
                  </p>
                </div>
              </FadeIn>
            ) : (
              <form onSubmit={handleWaitlist} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { key: "name", label: "Your Name", type: "text", placeholder: "Jane Smith" },
                  { key: "email", label: "Email", type: "email", placeholder: "you@yourbusiness.com" },
                  { key: "businessName", label: "Business Name", type: "text", placeholder: "e.g. Boot Jack Tavern" },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: 6 }}>
                      {field.label} <span style={{ color: C.sunset }}>*</span>
                    </label>
                    <input
                      type={field.type} value={wl[field.key]} placeholder={field.placeholder} required
                      onChange={e => setWl(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 8,
                        border: `1px solid ${C.sand}`, background: C.warmWhite,
                        fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text,
                        outline: "none", transition: "border 0.2s", boxSizing: "border-box",
                      }}
                      onFocus={e => { e.target.style.borderColor = C.sage; }}
                      onBlur={e => { e.target.style.borderColor = C.sand; }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: 6 }}>
                    Preferred Tier
                  </label>
                  <select
                    value={wl.tier}
                    onChange={e => setWl(prev => ({ ...prev, tier: e.target.value }))}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 8,
                      border: `1px solid ${C.sand}`, background: C.warmWhite,
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text,
                      outline: "none", boxSizing: "border-box",
                    }}
                  >
                    {FEATURED_TIERS.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Honeypot */}
                <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={wl._hp} onChange={e => setWl(prev => ({ ...prev, _hp: e.target.value }))} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />

                {wlStatus === "error" && (
                  <div style={{ background: `${C.sunset}15`, border: `1px solid ${C.sunset}40`, borderRadius: 8, padding: "12px 16px", fontSize: 13, color: C.sunset }}>
                    Something went wrong. Please try again or email hello@manitoubeach.com
                  </div>
                )}

                <button
                  type="submit"
                  disabled={wlStatus === "loading"}
                  className="btn-animated"
                  style={{
                    width: "100%", marginTop: 8, padding: "14px 0", borderRadius: 8,
                    background: wlStatus === "loading" ? C.textMuted : C.sunset,
                    color: C.cream, border: "none", cursor: wlStatus === "loading" ? "default" : "pointer",
                    fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700,
                    letterSpacing: 1, textTransform: "uppercase", transition: "background 0.2s",
                  }}
                >
                  {wlStatus === "loading" ? "Joining..." : "Join the Waitlist"}
                </button>

                <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, textAlign: "center", margin: 0 }}>
                  No obligation. We'll contact you when a spot opens and confirm before any charge.
                </p>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Page Sponsorship */}
      <section id="page-sponsorship" style={{ background: C.dusk, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionLabel light>Page Sponsorship</SectionLabel>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>Own a Page All Year</h2>
              <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 520, margin: "0 auto 12px" }}>
                One exclusive sponsor per page. Your logo, your tagline, your brand — seen by everyone who visits that page, all year long.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginTop: 10 }}>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontWeight: 700, color: C.sunsetLight }}>$97 / month</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>·</span>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontWeight: 700, color: C.sage }}>$970 / year <span style={{ fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>(2 months free)</span></span>
              </div>
            </div>
          </FadeIn>

          {/* Page availability grid */}
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 56 }}>
              {SPONSORABLE_PAGES.map(pg => {
                const taken = !!PAGE_SPONSORS[pg.id];
                return (
                  <div key={pg.id} style={{
                    background: taken ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${taken ? "rgba(255,255,255,0.08)" : C.sage + "50"}`,
                    borderRadius: 10, padding: "16px 18px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: taken ? "rgba(255,255,255,0.35)" : C.cream }}>{pg.label}</span>
                    <span style={{
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700,
                      letterSpacing: 1.2, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4,
                      background: taken ? `${C.sunset}25` : `${C.sage}25`,
                      color: taken ? C.sunsetLight : C.sage,
                    }}>{taken ? "Sold" : "Open"}</span>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          {/* Interest form */}
          <FadeIn>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              {sponsorStatus === 'success' ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.cream, margin: "0 0 10px" }}>Inquiry sent!</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>We'll be in touch within 24 hours to confirm availability and get your brand set up.</p>
                </div>
              ) : (
                <form onSubmit={handleSponsorInquiry} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4, textAlign: "center" }}>
                    Claim a page
                  </div>
                  {[
                    { key: 'name', placeholder: 'Your name', type: 'text', required: true },
                    { key: 'email', placeholder: 'Email address', type: 'email', required: true },
                    { key: 'business', placeholder: 'Business name', type: 'text', required: true },
                    { key: 'phone', placeholder: 'Phone (optional)', type: 'tel', required: false },
                  ].map(({ key, placeholder, type, required }) => (
                    <input key={key} type={type} placeholder={placeholder} required={required}
                      value={sponsorForm[key]} onChange={e => setSF(key, e.target.value)}
                      style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                    />
                  ))}
                  <select value={sponsorForm.page} onChange={e => setSF('page', e.target.value)}
                    style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "#2D3B45", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}>
                    {SPONSORABLE_PAGES.filter(p => !PAGE_SPONSORS[p.id]).map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ val: 'monthly', label: '$97/month' }, { val: 'annual', label: '$970/year (save $194)' }].map(({ val, label }) => (
                      <button key={val} type="button" onClick={() => setSF('term', val)} style={{
                        flex: 1, padding: "11px 0", borderRadius: 8,
                        border: `1px solid ${sponsorForm.term === val ? C.sage : "rgba(255,255,255,0.12)"}`,
                        background: sponsorForm.term === val ? `${C.sage}22` : "rgba(255,255,255,0.04)",
                        color: sponsorForm.term === val ? C.sage : "rgba(255,255,255,0.4)",
                        fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: sponsorForm.term === val ? 700 : 400,
                        cursor: "pointer", transition: "all 0.18s",
                      }}>{label}</button>
                    ))}
                  </div>
                  <textarea placeholder="Anything you'd like us to know?" value={sponsorForm.message} onChange={e => setSF('message', e.target.value)} rows={3}
                    style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none", resize: "vertical" }} />
                  {/* Honeypot */}
                  <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={sponsorForm._hp} onChange={e => setSF('_hp', e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
                  <button type="submit" className="btn-animated" style={{
                    padding: "14px 0", borderRadius: 8, border: "none",
                    background: C.sage, color: C.cream,
                    fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                  }}>Send Sponsorship Inquiry</button>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.6, textAlign: "center", margin: 0 }}>
                    We'll confirm availability and set up your sponsor banner within 24 hours. No charge until you approve.
                  </p>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionTitle center>Common Questions</SectionTitle>
            </div>
          </FadeIn>
          {[
            { q: "I already have a free listing. What changes?", a: "Your free listing stays as-is. The featured upgrade gives you a premium dark card at the top of the directory, above all free listings. It's a separate, more visible placement — not a replacement." },
            { q: "What happens if I cancel my listing?", a: "Your listing reverts to the free directory. No lock-in, cancel anytime. If you cancel and later rejoin, you pay whatever the current rate is at that time — your original rate is not held after cancellation." },
            { q: "What if I pause my subscription?", a: "Pausing is fine — your rate is held while your subscription is paused. Only a full cancellation resets your rate. If your business is seasonal, you can pause in the off-months and your founding rate is still there when you resume." },
            { q: "Can I change my listing details after I pay?", a: "Absolutely. Email us and we'll update your logo, description, phone number, or link within 24 hours." },
            { q: "What's the Holly & Yeti podcast mention?", a: "Premium tier businesses get a shoutout on the Holly & Yeti community podcast, reaching the broader Devils Lake and Irish Hills audience." },
            { q: "Why are prices so low right now?", a: "We're in launch mode and want founding businesses on board. The rate you sign up at is held for as long as your subscription stays active — it only rises for new sign-ups after you. Lock in early." },
          ].map((faq, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div style={{ padding: "24px 0", borderBottom: `1px solid ${C.sand}` }}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: "0 0 8px 0" }}>{faq.q}</h3>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Checkout modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(10,18,24,0.88)", backdropFilter: "blur(8px)" }} onClick={() => setModal(null)}>
          <div style={{ background: C.dusk, borderRadius: 20, padding: "36px 32px", maxWidth: 420, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", border: `1px solid ${modal.color}30` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: modal.color, marginBottom: 6 }}>{modal.tierName} Listing</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.cream, margin: "0 0 4px 0" }}>
              ${modal.price}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>/mo</span>
            </h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 28px 0" }}>Rate held while subscribed — cancel anytime, pause anytime.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <input
                placeholder="Business name"
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
              />
              <input
                placeholder="Email address"
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
              />
              <div>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(30,40,50,0.9)", color: form.category ? C.cream : "rgba(255,255,255,0.38)", fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none", appearance: "none" }}
                >
                  <option value="">Select your category</option>
                  {LISTING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {form.category && (() => {
                  const left = slotsLeft(modal.tierId, form.category);
                  if (left === null) return null;
                  const cap = SLOT_CAPS[modal.tierId];
                  if (left === 0) return (
                    <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.sunset, margin: "7px 0 0", letterSpacing: 0.3 }}>
                      All {modal.tierName} spots for {form.category} are taken — choose a different category or tier.
                    </p>
                  );
                  return (
                    <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: left === 1 ? C.driftwood : "rgba(255,255,255,0.32)", margin: "7px 0 0", letterSpacing: 0.3 }}>
                      {left} of {cap} {modal.tierName} spot{cap === 1 ? '' : 's'} remaining in {form.category}
                    </p>
                  );
                })()}
              </div>
            </div>
            {/* Contract duration */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
                Commitment Length
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[3, 6, 12].map(mo => (
                  <button
                    key={mo}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, duration: mo }))}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${form.duration === mo ? modal.color : "rgba(255,255,255,0.12)"}`,
                      background: form.duration === mo ? `${modal.color}22` : "rgba(255,255,255,0.04)",
                      color: form.duration === mo ? modal.color : "rgba(255,255,255,0.4)",
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: form.duration === mo ? 700 : 400,
                      cursor: "pointer", transition: "all 0.18s",
                    }}
                  >
                    {mo} mo
                  </button>
                ))}
              </div>
              <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.2)", margin: "8px 0 0", letterSpacing: 0.3 }}>
                Billed monthly · cancel anytime · your commitment is noted
              </p>
            </div>
            {checkoutError && <p style={{ color: "#ff6b5b", fontSize: 13, marginBottom: 14 }}>{checkoutError}</p>}
            {(() => {
              const catFull = form.category && slotsLeft(modal.tierId, form.category) === 0;
              return (
                <button
                  onClick={handleCheckout}
                  disabled={loading || catFull}
                  style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: catFull ? "rgba(255,255,255,0.08)" : modal.tierId === "premium" ? C.sunset : modal.color, color: catFull ? "rgba(255,255,255,0.3)" : C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: loading ? "wait" : catFull ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s" }}
                >
                  {catFull ? "Category Full — Choose Another" : loading ? "Redirecting…" : "Continue to Secure Checkout →"}
                </button>
              );
            })()}
            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
              Powered by Stripe · Your card details are never stored here
            </p>
          </div>
        </div>
      )}

      {/* Website nudge strip */}
      <section style={{ background: C.warmWhite, padding: "32px 24px", borderTop: `1px solid ${C.sand}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, marginBottom: 6 }}>
              Don't have a website yet?
            </div>
            <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
              We build 5-page sites for local businesses — $499 to launch, $49/mo. Free Enhanced listing included.
            </div>
          </div>
          <Btn href="/build" variant="outline" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
            Learn More →
          </Btn>
        </div>
      </section>

      {/* Amplify nudge strip */}
      <section style={{ background: C.dusk, padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <SectionLabel light style={{ textAlign: "center", display: "block" }}>Want Even More Reach?</SectionLabel>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
              Beyond your listing — put your brand in front of the community through newsletters, page banners, and more.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: "✉️", title: "Newsletter Feature", desc: "Top of the next Dispatch email — your brand, in every inbox.", price: "from $29" },
              { icon: "🗺️", title: "Page Banners", desc: "Full-width placement on the pages your customers already visit.", price: "from $29/mo" },
              { icon: "🎥", title: "Holly & Yeti Video", desc: "A short video feature about your business, live on the site for 30 days.", price: "$179" },
            ].map(({ icon, title, desc, price }) => (
              <a key={title} href="/advertise" style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "20px 18px", border: "1px solid rgba(255,255,255,0.07)", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(212,132,90,0.4)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 10 }}>{desc}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>{price} →</div>
              </a>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Btn href="/advertise" variant="sunset" small style={{ whiteSpace: "nowrap" }}>See All Ad Placements</Btn>
          </div>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
