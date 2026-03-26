import React, { useState, useEffect } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle } from '../components/Shared';
import { C, LISTING_CATEGORIES, PAGE_SPONSORS, SLOT_CAPS } from '../data/config';
import { BASE_PRICES } from '../data/pricing';
import { Footer, GlobalStyles, Navbar, SubmitSection } from '../components/Layout';
import yeti from '../data/errorMessages';

// ============================================================
const FEATURED_TIERS = [
  { id: "enhanced", name: "Showcased" },
  { id: "featured", name: "Highlighted" },
  { id: "premium", name: "Front and Center" },
];

const SPOTS_TOTAL = 8;
const SPOTS_LEFT = 5; // Update manually when spots fill — future: pull from Notion

export default function FeaturedPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const spotsLeft = SPOTS_LEFT;
  const isFull = spotsLeft === 0;
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const priceFor = (base) => base.toFixed(2);
  const centsFor = (base) => Math.round(base * 100);
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

  // Page sponsorship
  const SPONSORABLE_PAGES = [
    { id: 'home',               label: 'Home' },
    { id: 'happening',          label: "What's Happening" },
    { id: 'round-lake',         label: 'Round Lake' },
    { id: 'village',            label: 'Village' },
    { id: 'fishing',            label: 'Fishing' },
    { id: 'wineries',           label: 'Wineries' },
    { id: 'devils-lake',        label: 'Devils Lake' },
    { id: 'dispatch',           label: 'Dispatch' },
    { id: 'discover',           label: 'Discover Map' },
    { id: 'stays',              label: 'Stays & Rentals' },
    { id: 'holly-yeti',         label: 'Holly & The Yeti' },
    { id: 'food-trucks',        label: 'Food Trucks' },
    { id: 'historical-society', label: 'Historical Society' },
    { id: 'nightlife',          label: 'Nightlife' },
  ];
  const [takenPageIds, setTakenPageIds] = useState(() => new Set(Object.keys(PAGE_SPONSORS).filter(k => PAGE_SPONSORS[k])));
  const openPages = SPONSORABLE_PAGES.filter(p => !takenPageIds.has(p.id));
  const [sponsorForm, setSponsorForm] = useState({ name: '', email: '', business: '', phone: '', page: openPages[0]?.id || 'home', tagline: '', term: 'monthly', _hp: '' });
  const [sponsorStatus, setSponsorStatus] = useState('idle');
  const [sponsorReturnData, setSponsorReturnData] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorError, setSponsorError] = useState('');
  const [takenPageWl, setTakenPageWl] = useState(null);
  const [pageWlForm, setPageWlForm] = useState({ name: '', email: '', business: '', _hp: '' });
  const [pageWlStatus, setPageWlStatus] = useState('idle');
  const setSF = (k, v) => setSponsorForm(f => ({ ...f, [k]: v }));

  const handleSponsorClaim = async (e) => {
    e.preventDefault();
    if (sponsorForm._hp) return;
    setSponsorLoading(true);
    setSponsorError('');
    try {
      let logoUrl = '';
      if (logoFile) {
        const b64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(logoFile);
        });
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: b64, filename: logoFile.name, contentType: logoFile.type, folder: 'sponsors' }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) logoUrl = uploadData.url;
      }
      const { name, email, business, phone, page, tagline, term } = sponsorForm;
      const pageName = SPONSORABLE_PAGES.find(p => p.id === page)?.label || page;
      const checkoutRes = await fetch('/api/page-sponsor-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: page, pageName, businessName: business, name, email, phone, tagline, logoUrl, term, betaSponsor: true, _hp: '' }),
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      } else {
        setSponsorError(checkoutData.error || yeti.oops());
        setSponsorLoading(false);
      }
    } catch {
      setSponsorError(yeti.network());
      setSponsorLoading(false);
    }
  };

  const handlePageWaitlist = async (e) => {
    e.preventDefault();
    if (pageWlForm._hp) return;
    const pg = SPONSORABLE_PAGES.find(p => p.id === takenPageWl);
    try {
      await fetch('/api/sponsor-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pageWlForm.name,
          email: pageWlForm.email,
          businessName: pageWlForm.business,
          pageId: takenPageWl,
          pageLabel: pg?.label || takenPageWl,
          _hp: '',
        }),
      });
    } catch {}
    setPageWlStatus('success');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setStatus({ type: "success", business: params.get("business") || "" });
    else if (params.get("cancelled")) setStatus({ type: "cancelled" });
    if (params.get("ps")) {
      setSponsorStatus('success');
      setSponsorReturnData({
        pageName:     params.get("page") || '',
        businessName: params.get("biz")  || '',
        term:         params.get("term") || 'monthly',
        expiresAt:    params.get("exp")  || '',
      });
    }
  }, []);

  useEffect(() => {
    fetch('/api/businesses?slots=true')
      .then(r => r.json())
      .then(d => setSlotCounts(d))
      .catch(() => {});
    fetch('/api/page-sponsors?all=true')
      .then(r => r.json())
      .then(d => {
        if (d.taken?.length) {
          setTakenPageIds(new Set(d.taken.map(s => s.pageId)));
        }
      })
      .catch(() => {});
  }, []);

  const PAID_TIERS = [
    {
      id: 'enhanced', name: 'Showcased', color: C.lakeBlue, badge: null,
      price: priceFor(9), priceInCents: centsFor(9),
      features: ['Everything in Free', 'Clickable website link', 'Business description', 'Expandable listing card', 'Category search placement', 'Pin on Discover map'],
    },
    {
      id: 'featured', name: 'Highlighted', color: C.sage, badge: 'Most Popular',
      price: priceFor(25), priceInCents: centsFor(25),
      features: ['Everything in Showcased', 'Spotlight card placement', 'Logo or photo display', 'Above standard listings', 'Email contact button'],
    },
    {
      id: 'premium', name: 'Front and Center', color: C.sunsetLight, badge: 'Best Visibility',
      price: priceFor(49), priceInCents: centsFor(49),
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
      else { setCheckoutError(data.error || yeti.oops()); }
    } catch { setCheckoutError(yeti.network()); }
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
    { icon: "⚡", title: "More People Find You", desc: "Every week, visitors search this directory for exactly what you offer. The businesses at the top get the call. Right now, that's not you." },
    { icon: "🎨", title: "Look Worth Visiting", desc: "A polished listing with your logo and photos signals quality before they ever arrive. First impressions convert." },
    { icon: "📱", title: "Fewer Lost Customers", desc: "People decide in seconds on mobile. One tap to call you means the difference between a visit and a scroll past." },
    { icon: "📰", title: "In Front of 500+ Local Inboxes Weekly", desc: "The Dispatch goes to subscribers who live here and spend here. Your business stays top of mind, not just when they're searching." },
    { icon: "🎙️", title: "A Personal Endorsement", desc: "A podcast shoutout isn't an ad — it's a neighbor telling hundreds of people you're worth their money. That kind of trust doesn't come from a banner." },
  ];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
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
              ? "All spots are claimed for now — join the waitlist and you'll be first to know when your category opens up."
              : "This is where Manitou Beach looks first. Make sure you're here when they do."}
          </p>
        </FadeIn>
      </section>

      {/* Category Slot Availability Band — shows Premium + Featured tier availability */}
      {slotCounts && slotCounts.tierCounts && !isFull && (() => {
        const premiumCats = LISTING_CATEGORIES.filter(cat => (slotCounts.tierCounts.premium?.[cat] || 0) > 0);
        const featuredCats = LISTING_CATEGORIES.filter(cat => (slotCounts.tierCounts.featured?.[cat] || 0) > 0);
        if (premiumCats.length === 0 && featuredCats.length === 0) return null;
        const renderPills = (cats, tierId) => cats.map(cat => {
          const used = slotCounts.tierCounts[tierId]?.[cat] || 0;
          const cap = SLOT_CAPS[tierId];
          const left = Math.max(0, cap - used);
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
                {full ? "Full" : `${left} of ${cap} left`}
              </span>
            </span>
          );
        });
        return (
          <div style={{ background: C.night, borderBottom: `1px solid rgba(255,255,255,0.06)`, padding: "14px 24px" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {premiumCats.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.sunsetLight, flexShrink: 0, minWidth: 68 }}>Premium</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{renderPills(premiumCats, 'premium')}</div>
                </div>
              )}
              {featuredCats.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.sage, flexShrink: 0, minWidth: 68 }}>Featured</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{renderPills(featuredCats, 'featured')}</div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Success / Cancelled banners */}
      {status?.type === "success" && (
        <div style={{ background: `${C.sage}20`, borderBottom: `2px solid ${C.sage}`, padding: "24px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.sage, marginBottom: 6 }}>You're in!</div>
          <p style={{ fontSize: 14, color: C.textLight, margin: 0 }}>
            {status.business ? `${decodeURIComponent(status.business)} — ` : ""}Your featured listing will be live within 24 hours. Check your inbox for a confirmation with all the details.
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
              <SectionLabel>What It&apos;s Worth</SectionLabel>
              <SectionTitle center>More customers. Less guesswork.</SectionTitle>
            </div>
          </FadeIn>
          {isMobile ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {benefits.slice(0, 3).map((b, i) => (
                  <FadeIn key={i} delay={i * 60}>
                    <div style={{ padding: "24px 20px", background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}` }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>{b.title}</h3>
                      <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, maxWidth: "66.66%", margin: "0 auto", width: "100%" }}>
                {benefits.slice(3).map((b, i) => (
                  <FadeIn key={i + 3} delay={(i + 3) * 60}>
                    <div style={{ padding: "24px 20px", background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}` }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>{b.title}</h3>
                      <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Choose Your Visibility — subscriber-based pricing */}
      {!isFull && (
        <section style={{ background: C.night, padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 14 }}>
                  Your Place in the Community
                </div>
                <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 400, color: C.cream, margin: "0 0 14px 0" }}>
                  Showcased is real visibility. There's more when you're ready.
                </h2>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.65 }}>
                  Every listing here reaches people who chose to follow Manitou Beach — neighbors, visitors, and regulars who care where they spend. Showcased puts your business in front of that audience. Highlighted and Front and Center go further, but spots at each tier are limited by business category. The businesses that claim them own their space in this community.
                </p>
                <div style={{ maxWidth: 460, margin: "0 auto", background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.65, textAlign: "center" }}>
                    Highlighted and Front and Center hold a limited number of spots per business category. If yours is full, join the waitlist — you'll be first to know when a seat opens.
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <div style={{ color: tier.color, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{tier.name}</div>
                    {SLOT_CAPS[tier.id] && (
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "2px 8px", borderRadius: 20, background: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}35`, whiteSpace: "nowrap" }}>
                        {SLOT_CAPS[tier.id] === 1 ? 'Exclusive · 1 per category' : `${SLOT_CAPS[tier.id]} spots per category`}
                      </span>
                    )}
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: C.cream, fontWeight: 700 }}>${tier.price}</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}>/mo</span>
                  </div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.sunsetLight, marginBottom: 16, letterSpacing: 0.3 }}>
                    Limited spots per category
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

      {/* How Spots Work */}
      {!isFull && (
        <section style={{ background: C.cream, padding: "80px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <SectionLabel>How It Works</SectionLabel>
                <SectionTitle center>No contracts. No year-long commitments.</SectionTitle>
                <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.7, maxWidth: 540, margin: "16px auto 0" }}>
                  Featured and Premium spots work month-to-month. Take a spot for the summer. Cancel in the off-season. Come back next year. Here's exactly how it works.
                </p>
              </div>
            </FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  num: "01",
                  title: "Pick your tier and your month",
                  body: "Featured and Premium billing is monthly — nothing annual. If summer is your busy season, go Featured in June and cancel in September. Pause instead of canceling and your spot is held when you're ready to come back.",
                },
                {
                  num: "02",
                  title: "Spots are limited — by category",
                  body: "Featured has 3 spots per business category. Premium has 1 spot per category — it's exclusive. If you're a restaurant and all 3 Featured restaurant slots are taken, you go on the waitlist. Different categories have different availability, so it's worth checking yours.",
                },
                {
                  num: "03",
                  title: "On the waitlist? You'll get a text when a spot opens",
                  body: "When you join the waitlist, we save your payment details — but we don't charge you anything yet. The moment a spot opens in your category, you'll get an SMS notification. You have 48 hours to claim it. If you claim it, your card is billed and your listing goes live. If you don't, no charge — the next person on the list gets the offer.",
                },
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div style={{
                    display: "flex", gap: isMobile ? 16 : 32, padding: "32px 0",
                    borderBottom: i < 2 ? `1px solid ${C.sand}` : "none",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "flex-start",
                  }}>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: C.sand, fontWeight: 400, lineHeight: 1, flexShrink: 0, minWidth: 48 }}>{step.num}</div>
                    <div>
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text, margin: "0 0 10px 0" }}>{step.title}</h3>
                      <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.75, margin: 0 }}>{step.body}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
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
                    {yeti.oops()}
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
              <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontWeight: 700, color: C.sunsetLight }}>$97 / month</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>·</span>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontWeight: 700, color: C.sage }}>$970 / year <span style={{ fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>(2 months free)</span></span>
              </div>
              {/* Beta founding sponsor bonus — auto-hides after April 10 */}
              {Date.now() < new Date('2026-04-10T16:00:00Z').getTime() && (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(212,160,23,0.12)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  borderRadius: 20,
                  padding: "8px 18px",
                  marginTop: 16,
                }}>
                  <span style={{ fontSize: 14 }}>🎁</span>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: "#D4A017" }}>
                    Beta founding bonus: sign up now and get <strong>13 months</strong> for the price of 12
                  </span>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Page availability grid */}
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: takenPageWl ? 20 : 40 }}>
              {SPONSORABLE_PAGES.map(pg => {
                const taken = takenPageIds.has(pg.id);
                const sponsor = PAGE_SPONSORS[pg.id];
                const isSelected = !taken && sponsorForm.page === pg.id;
                const isWlActive = takenPageWl === pg.id;
                return (
                  <div
                    key={pg.id}
                    onClick={() => {
                      if (taken) { setTakenPageWl(isWlActive ? null : pg.id); setPageWlStatus('idle'); }
                      else { setSF('page', pg.id); setTakenPageWl(null); }
                    }}
                    style={{
                      background: isSelected ? `${C.sage}18` : taken ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isSelected ? C.sage + "80" : isWlActive ? C.sunsetLight + "55" : taken ? "rgba(255,255,255,0.07)" : C.sage + "40"}`,
                      borderRadius: 10, padding: "14px 14px 10px", cursor: "pointer", transition: "all 0.18s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: taken ? "rgba(255,255,255,0.3)" : isSelected ? C.sage : C.cream, fontWeight: isSelected ? 600 : 400 }}>{pg.label}</span>
                      <span style={{
                        fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700,
                        letterSpacing: 1.2, textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, marginLeft: 6, flexShrink: 0,
                        background: taken ? `${C.sunset}20` : `${C.sage}20`,
                        color: taken ? C.sunsetLight : C.sage,
                      }}>{taken ? "Taken" : "Open"}</span>
                    </div>
                    {taken && sponsor?.expiresAt && (
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 5 }}>Runs until {sponsor.expiresAt}</div>
                    )}
                    {taken && (
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: isWlActive ? C.sunsetLight : "rgba(255,255,255,0.28)", marginTop: 4, textDecoration: "underline" }}>
                        {isWlActive ? "Hide ↑" : "Join waitlist →"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Waitlist panel for taken pages */}
            {takenPageWl && (() => {
              const pg = SPONSORABLE_PAGES.find(p => p.id === takenPageWl);
              const sponsor = PAGE_SPONSORS[takenPageWl];
              return (
                <div style={{ maxWidth: 480, margin: "0 auto 48px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.sunsetLight}30`, borderRadius: 14, padding: "24px 28px" }}>
                  {pageWlStatus === 'success' ? (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <div style={{ fontSize: 28, marginBottom: 10, color: C.sage }}>✓</div>
                      <h4 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.cream, margin: "0 0 8px" }}>You're on the list</h4>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: 0 }}>
                        When the <strong style={{ color: "rgba(255,255,255,0.6)" }}>{pg?.label}</strong> spot opens, you'll get an email. First in line gets first offer.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 8 }}>
                        Waitlist — {pg?.label}
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14, lineHeight: 1.6 }}>
                        {sponsor?.expiresAt
                          ? <>Current sponsor runs until <strong style={{ color: "rgba(255,255,255,0.55)" }}>{sponsor.expiresAt}</strong>. If they don't renew, you're first to know.</>
                          : "When this spot opens, we'll notify you by email. No obligation — you choose whether to claim it."
                        }
                      </p>
                      <form onSubmit={handlePageWaitlist} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                          { k: 'name',     placeholder: 'Your name',      type: 'text',  required: true },
                          { k: 'email',    placeholder: 'Email address',  type: 'email', required: true },
                          { k: 'business', placeholder: 'Business name',  type: 'text',  required: true },
                        ].map(({ k, placeholder, type, required }) => (
                          <input key={k} type={type} placeholder={placeholder} required={required}
                            value={pageWlForm[k]} onChange={e => setPageWlForm(f => ({ ...f, [k]: e.target.value }))}
                            style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, outline: "none" }}
                          />
                        ))}
                        <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={pageWlForm._hp} onChange={e => setPageWlForm(f => ({ ...f, _hp: e.target.value }))} style={{ position: "absolute", left: "-9999px", opacity: 0 }} />
                        <button type="submit" style={{
                          padding: "11px 0", borderRadius: 8, border: "none",
                          background: C.sunsetLight, color: C.night,
                          fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                        }}>Notify Me When It Opens</button>
                      </form>
                    </>
                  )}
                </div>
              );
            })()}
          </FadeIn>

          {/* Claim form */}
          <FadeIn>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              {sponsorStatus === 'success' ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 16, color: C.sage }}>✓</div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 400, color: C.cream, margin: "0 0 10px" }}>
                    {sponsorReturnData?.businessName ? `${sponsorReturnData.businessName} is going live` : "Your page is being set up"}
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 440, margin: "0 auto 12px" }}>
                    Your sponsor banner for the <strong style={{ color: C.cream }}>{sponsorReturnData?.pageName || 'selected'}</strong> page goes live within 24 hours of payment confirmation.
                  </p>
                  {sponsorReturnData?.expiresAt && (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 auto 12px" }}>
                      Sponsorship runs until <strong style={{ color: C.sunsetLight }}>{new Date(sponsorReturnData.expiresAt + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: "0 auto 24px" }}>
                    A confirmation email is on its way to your inbox.
                  </p>
                  <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "24px 28px", textAlign: "left", marginBottom: 20, maxWidth: 460, margin: "0 auto 20px" }}>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>What to expect</div>
                    {[
                      "Your logo and tagline appear at the bottom of the page, seen by every visitor",
                      `Subscription: ${sponsorReturnData?.term === 'annual' ? '$970/year — renews in 12 months' : '$97/month — renews monthly'}`,
                      "5 days before expiry, we'll email you to renew or let it go",
                      "If you don't renew, the spot is offered to the next person on the waitlist",
                      "Check your inbox for a Stripe receipt confirming your subscription",
                    ].map((line, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 4 ? 10 : 0, alignItems: "flex-start" }}>
                        <span style={{ color: C.sage, fontSize: 8, marginTop: 5, flexShrink: 0 }}>◆</span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
                    Questions? Email hello@manitou-beach.com and we'll be in touch within a few hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSponsorClaim} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 4, textAlign: "center" }}>
                    Claim a page
                  </div>
                  {[
                    { key: 'name',     placeholder: 'Your name',       type: 'text',  required: true },
                    { key: 'email',    placeholder: 'Email address',   type: 'email', required: true },
                    { key: 'business', placeholder: 'Business name',   type: 'text',  required: true },
                    { key: 'phone',    placeholder: 'Phone (optional)', type: 'tel',   required: false },
                  ].map(({ key, placeholder, type, required }) => (
                    <input key={key} type={type} placeholder={placeholder} required={required}
                      value={sponsorForm[key]} onChange={e => setSF(key, e.target.value)}
                      style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                    />
                  ))}

                  {/* Page select */}
                  <select value={sponsorForm.page} onChange={e => setSF('page', e.target.value)}
                    style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "#2D3B45", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}>
                    {SPONSORABLE_PAGES.filter(p => !takenPageIds.has(p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>

                  {/* Tagline */}
                  <input type="text" placeholder="Your slogan or short description (optional)" maxLength={80}
                    value={sponsorForm.tagline} onChange={e => setSF('tagline', e.target.value)}
                    style={{ padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none" }}
                  />

                  {/* Logo upload */}
                  <div>
                    <label style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
                      Logo or brand image (optional — you can send it after)
                    </label>
                    {logoPreview ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.06)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)" }}>
                        <img src={logoPreview} alt="Logo preview" style={{ height: 40, maxWidth: 100, objectFit: "contain", filter: "brightness(2)" }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{logoFile?.name}</span>
                        <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(''); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 20, padding: 0, lineHeight: 1 }}>×</button>
                      </div>
                    ) : (
                      <label style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "16px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.18)",
                        background: "rgba(255,255,255,0.03)", cursor: "pointer",
                        fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.3)",
                        transition: "all 0.18s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                      >
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
                          setLogoFile(file);
                          setLogoPreview(URL.createObjectURL(file));
                        }} />
                        ↑ Upload logo or brand image
                      </label>
                    )}
                  </div>

                  {/* Term selector */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[{ val: 'monthly', label: '$97/month' }, { val: 'annual', label: '$970/year (save $194)' }].map(({ val, label }) => (
                      <button key={val} type="button" onClick={() => setSF('term', val)} style={{
                        flex: 1, minWidth: 130, padding: "11px 8px", borderRadius: 8,
                        border: `1px solid ${sponsorForm.term === val ? C.sage : "rgba(255,255,255,0.12)"}`,
                        background: sponsorForm.term === val ? `${C.sage}22` : "rgba(255,255,255,0.04)",
                        color: sponsorForm.term === val ? C.sage : "rgba(255,255,255,0.4)",
                        fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: sponsorForm.term === val ? 700 : 400,
                        cursor: "pointer", transition: "all 0.18s",
                      }}>{label}</button>
                    ))}
                  </div>

                  {/* Honeypot */}
                  <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={sponsorForm._hp} onChange={e => setSF('_hp', e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />

                  {/* Error */}
                  {sponsorError && <p style={{ fontSize: 13, color: C.sunsetLight, textAlign: "center", margin: 0 }}>{sponsorError}</p>}

                  {/* Submit */}
                  <button type="submit" disabled={sponsorLoading} className="btn-animated" style={{
                    padding: "15px 0", borderRadius: 8, border: "none",
                    background: sponsorLoading ? C.textMuted : C.sage, color: C.cream,
                    fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                    cursor: sponsorLoading ? "default" : "pointer", transition: "background 0.2s",
                  }}>
                    {sponsorLoading ? "Processing…" : `Claim This Page — ${sponsorForm.term === 'annual' ? '$970/yr' : '$97/mo'}`}
                  </button>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", lineHeight: 1.6, textAlign: "center", margin: 0 }}>
                    You'll be taken to secure checkout. Sponsor banner goes live within 24 hours. Cancel anytime.
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
            { q: "Do I have to commit for a whole year?", a: "No. Everything is month-to-month. Featured is $25/month, Premium is $49/month — billed monthly, cancel anytime. There is no annual contract. Take a spot for one month, the whole summer, or as long as you want." },
            { q: "Can I do Featured or Premium just for the summer?", a: "Yes, that's exactly how it's designed. Sign up when your season starts, cancel when it ends. If you pause instead of canceling, your rate is locked and waiting for you when you come back next year." },
            { q: "What if the Featured or Premium spots in my category are taken?", a: "Join the waitlist. We'll save your payment details — but nothing gets charged yet. The moment a spot opens in your category, you'll receive a text notification. You'll have 48 hours to claim it. Claim it and your card is billed and your listing goes live. Don't claim it and no charge — the next person on the list gets the offer." },
            { q: "How many businesses can be Featured or Premium in my category?", a: "Featured has 3 spots per category. Premium has 1 spot per category — it's exclusive, one business at a time. Different categories have different availability, so check the availability band at the top of this page to see where your category stands." },
            { q: "I already have a free listing. What changes?", a: "Your free listing stays as-is. The featured upgrade gives you a premium card at the top of the directory, above all free listings. It's a separate, more visible placement — not a replacement." },
            { q: "What happens if I cancel my listing?", a: "Your listing reverts to the free directory. No lock-in, cancel anytime. If you cancel and later rejoin, you pay whatever the current rate is at that time — your original rate is not held after a full cancellation." },
            { q: "What if I pause my subscription?", a: "Pausing is fine — your spot and rate are held while paused. Only a full cancellation releases your category spot. If your business is seasonal, pause in the off-months and your placement is waiting when you come back." },
            { q: "Can I change my listing details after I pay?", a: "Absolutely. Email us and we'll update your logo, description, phone number, or link within 24 hours." },
            { q: "What's the Holly & Yeti podcast mention?", a: "Premium tier businesses get a shoutout on the Holly & Yeti community podcast, reaching the broader Devils Lake and Irish Hills audience." },
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

            {/* Food Truck interstitial */}
            {form.category === 'Food Truck' ? (
              <div style={{ background: 'linear-gradient(135deg, #1A2830 0%, #2D4A3E 100%)', borderRadius: 12, padding: '24px 20px', marginTop: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <img src="/images/icons/food-truck-icon.png" alt="Food truck" style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} />
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: '#F5F0E8', fontWeight: 400, lineHeight: 1.3 }}>
                    Hold on — you qualify for something better
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 18px', fontFamily: "'Libre Franklin', sans-serif" }}>
                  Manitou Beach has a whole special section just for food trucks — way more than a basic listing. You get your own personal page you tap when you're parked and open. Anyone following your truck gets a text message the moment you're there. Takes about two minutes to finish.
                </p>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (form.businessName) params.set('name', form.businessName);
                      if (form.email) params.set('email', form.email);
                      window.location.href = `/food-truck-partner?${params.toString()}`;
                    }}
                    style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, padding: '12px 22px', borderRadius: 8, border: 'none', background: '#4A7A5A', color: '#fff', cursor: 'pointer' }}
                  >
                    Set up my truck →
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, category: '' }))} style={{ background: 'none', border: 'none', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0 }}>
                    ← Start over
                  </button>
                </div>
              </div>
            ) : (
            <>
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
            </>
            )}
          </div>
        </div>
      )}

      {/* Website nudge strip */}
      <section style={{ background: C.warmWhite, padding: "32px 24px", borderTop: `1px solid ${C.sand}` }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, marginBottom: 6 }}>
              Customers are looking for you. Are you showing up?
            </div>
            <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
              If you don't have a proper web presence, people move on to whoever does. We help local businesses get found — no tech knowledge needed.
            </div>
          </div>
          <Btn href="/build" variant="outline" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
            See How It Works →
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
