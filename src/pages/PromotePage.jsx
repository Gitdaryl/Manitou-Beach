import React, { useState } from 'react';
import { Btn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles, NewsletterInline, HollyYetiSection, ContactModal } from '../components/Layout';
import { HappeningSubmitCTA } from './HappeningPage';

const PROMO_PAGES = ["Home", "Whats Happening", "Village", "Devils Lake", "Wineries", "Fishing", "Round Lake"];

const ADVERTISE_PACKAGES = [
  { id: "newsletter_mention", label: "Newsletter Mention",   detail: "1 Issue",            price: "$29",  fullPrice: "$49",  diagramType: "newsletter_sm",
    desc: "Your brand, product, or event mentioned with a link in the next Dispatch email.",
    plain: "One or two sentences about you, with a link, in front of everyone who reads the weekly email. Simple and effective." },
  { id: "newsletter",         label: "Newsletter Feature",   detail: "1 Issue",            price: "$39",  fullPrice: "$79",  diagramType: "newsletter",
    desc: "A full dedicated section at the top of the next Manitou Beach Dispatch — before anyone scrolls.",
    plain: "Your business or event gets its own section at the very top of the email. Image, copy, link. The whole community sees it before anything else." },
  { id: "banner_1p",          label: "Page Banner",          detail: "1 Page · 30 Days",  price: "$29",  fullPrice: "$59",  diagramType: "banner",
    desc: "A full-width banner for your brand on whichever page your customers visit most.",
    plain: "Like renting a billboard, but on the website. Pick the page — Fishing, Wineries, Devils Lake — and your banner sits right there for 30 days." },
  { id: "banner_3p",          label: "Page Banner",          detail: "3 Pages · 30 Days", price: "$69",  fullPrice: "$129", diagramType: "banner3",
    desc: "Same banner treatment across three pages at once — maximum coverage for 30 days.",
    plain: "Three pages, one price. Catch people wherever they're browsing — whether they're checking fishing conditions, planning a winery visit, or reading about the lake." },
  { id: "holly_yeti",         label: "Holly & Yeti Feature", detail: "Video · 30 Days",   price: "$179", fullPrice: "$350", diagramType: "video",
    desc: "Holly and The Yeti create a short video about your business. Lives on the site for 30 days and shared on social.",
    plain: "We come out, tell your story on camera, and put it on the website for a month. Real people, real place — the kind of thing the community actually watches." },
];

const PROMOTE_PACKAGES = [
  { id: "event_spotlight", label: "Event Spotlight",        detail: "Featured Listing",   price: "$25",  fullPrice: "$49",  diagramType: "calendar",
    desc: "Your event in the calendar with a photo and a ticket button.",
    plain: "Instead of just a line of text like the free listings, yours shows up with a photo and a big 'Get Tickets' button. Stands out." },
  { id: "hero_7d",         label: "Hero Feature",           detail: "7 Days",             price: "$75",  fullPrice: "$149", diagramType: "hero",
    desc: "The first thing anyone sees when they visit the site — full screen, your event, for 7 days.",
    plain: "Picture the front page of a newspaper. That's your event, full size, the moment anyone opens the website. Every visitor sees it first, for a whole week." },
  { id: "hero_30d",        label: "Hero Feature",           detail: "30 Days",            price: "$249", fullPrice: "$499", diagramType: "hero",
    desc: "Own the front of the site for a full month.",
    plain: "Same front-page treatment as the 7-day option — just for a whole month. Great for building buzz leading up to a big event." },
  { id: "newsletter",      label: "Newsletter Feature",     detail: "1 Issue",            price: "$39",  fullPrice: "$79",  diagramType: "newsletter",
    desc: "Top spot in the next Manitou Beach Dispatch email — before anyone scrolls.",
    plain: "A big beautiful announcement at the very top of our weekly email. The whole community sees it in their inbox before they read anything else." },
  { id: "banner_1p",       label: "Page Feature Banner",    detail: "1 Page · 30 Days",  price: "$29",  fullPrice: "$59",  diagramType: "banner",
    desc: "A wide banner for your event sitting in the middle of whichever page your crowd visits most.",
    plain: "Like a billboard, but on the website. Pick the page where your people hang out — Fishing, Wineries, Devils Lake — and your banner is right there for 30 days." },
  { id: "banner_3p",       label: "Page Feature Banner",    detail: "3 Pages · 30 Days", price: "$69",  fullPrice: "$129", diagramType: "banner3",
    desc: "Same billboard treatment, but on three different pages at once.",
    plain: "Cover more ground — your banner shows up on three pages across the site. Catch people wherever they're browsing." },
  { id: "strip_pin",       label: "Featured Strip Pin",     detail: "30 Days",            price: "$19",  fullPrice: "$39",  diagramType: "strip",
    desc: "First spot in the 'Coming Up' list on the homepage — right below the big banner.",
    plain: "There's a scrolling list of upcoming events near the top of the home page. Your event goes first on that list for 30 days. Hard to scroll past." },
  { id: "holly_yeti",      label: "Holly & Yeti Spotlight", detail: "30 Days",            price: "$179", fullPrice: "$350", diagramType: "video",
    desc: "Holly and The Yeti make a short video about your event or business. Lives on the site for 30 days.",
    plain: "We come out, shoot a short video, and it lives on the website for a month. We share it on social too. It's the kind of thing people actually watch." },
  { id: "spotlight",       label: "Full Launch Bundle",     detail: "Best Value",         price: "$149", fullPrice: "$299", diagramType: "bundle",
    desc: "Front page of the site for 7 days + top of the newsletter + featured calendar listing. All three at once.",
    plain: "The whole shebang. Front page of the website, top of the email, featured in the calendar. Maximum coverage — and you save $55 doing it this way.", badge: "Best Value" },
  { id: "rsvp_collection", label: "RSVP Collection",        detail: "Per Event",          price: "$9",   fullPrice: "$19",  diagramType: "calendar",
    desc: "In-app RSVP form, organizer notifications, and email reminders the day before and day of.",
    plain: "Visitors register right on the site. You get notified for each RSVP. Everyone gets a reminder email the day before and day of your event. SMS reminders coming soon." },
];

function PlacementDiagram({ type, dark = false }) {
  const hl = "rgba(212,132,90,0.85)";
  const bg = dark ? "rgba(255,255,255,0.05)" : "rgba(45,59,69,0.04)";
  const line = dark ? "rgba(255,255,255,0.10)" : "rgba(45,59,69,0.12)";
  const muted = dark ? "rgba(255,255,255,0.09)" : "rgba(45,59,69,0.09)";
  const base = { borderRadius: 6, overflow: "hidden", marginBottom: 14, border: `1px solid ${line}`, background: bg, padding: "8px 10px", position: "relative" };
  if (type === "free") return (<div style={base}><div style={{ height: 8, borderRadius: 3, background: muted, marginBottom: 5, width: "55%" }} />{[1,2,3].map(i => (<div key={i} style={{ height: 8, borderRadius: 3, background: muted, marginBottom: 3, opacity: i === 1 ? 1 : 0.6 }} />))}<div style={{ fontSize: 7, color: dark ? "rgba(255,255,255,0.35)" : "rgba(45,59,69,0.4)", fontFamily: "'Libre Franklin',sans-serif", marginTop: 3, letterSpacing: 0.5 }}>Text-only listing in the calendar</div></div>);
  if (type === "hero") return (<div style={base}><div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: muted }} /><div style={{ flex: 1, height: 4, borderRadius: 2, background: muted }} /><div style={{ width: 20, height: 4, borderRadius: 2, background: muted }} /><div style={{ width: 16, height: 4, borderRadius: 2, background: muted }} /></div><div style={{ height: 38, borderRadius: 4, background: hl, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Your Event — Full Screen</span></div><div style={{ display: "flex", gap: 4, marginTop: 5 }}>{[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 10, borderRadius: 3, background: muted }} />)}</div></div>);
  if (type === "calendar") return (<div style={base}><div style={{ height: 8, borderRadius: 3, background: muted, marginBottom: 5, width: "60%" }} /><div style={{ borderRadius: 4, border: `1.5px solid ${hl}`, background: `${hl}20`, padding: "4px 6px", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 20, height: 14, borderRadius: 2, background: hl, flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.5)", marginBottom: 2 }} /><div style={{ height: 3, borderRadius: 2, background: muted, width: "70%" }} /></div><div style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: hl, whiteSpace: "nowrap", letterSpacing: 0.5 }}>GET TICKETS</div></div>{[1,2].map(i => <div key={i} style={{ height: 10, borderRadius: 3, background: muted, marginBottom: 3 }} />)}</div>);
  if (type === "newsletter_sm") return (<div style={base}><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}><div style={{ fontSize: 12 }}>✉️</div><div style={{ flex: 1, height: 4, borderRadius: 2, background: muted }} /></div>{[1,2].map(i => <div key={i} style={{ height: 4, borderRadius: 2, background: muted, marginBottom: 3, width: "100%" }} />)}<div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 3, background: `${hl}30`, border: `1px solid ${hl}60`, marginBottom: 3 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: hl, flexShrink: 0 }} /><div style={{ flex: 1, height: 3, borderRadius: 2, background: hl, opacity: 0.7 }} /><div style={{ fontSize: 6, color: dark ? "rgba(255,255,255,0.5)" : "rgba(45,59,69,0.5)", fontFamily: "'Libre Franklin',sans-serif", whiteSpace: "nowrap" }}>↗</div></div>{[1,2].map(i => <div key={i} style={{ height: 4, borderRadius: 2, background: muted, marginBottom: 3, width: i === 2 ? "65%" : "100%" }} />)}<div style={{ fontSize: 7, color: dark ? "rgba(255,255,255,0.35)" : "rgba(45,59,69,0.4)", fontFamily: "'Libre Franklin',sans-serif", letterSpacing: 0.5 }}>Brand mention with link in email body</div></div>);
  if (type === "newsletter") return (<div style={base}><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}><div style={{ fontSize: 12 }}>✉️</div><div style={{ flex: 1, height: 4, borderRadius: 2, background: muted }} /></div><div style={{ borderRadius: 3, background: hl, padding: "4px 6px", marginBottom: 4, textAlign: "center" }}><span style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>Your Brand — Top of Email</span></div>{[1,2,3].map(i => <div key={i} style={{ height: 4, borderRadius: 2, background: muted, marginBottom: 3, width: i === 3 ? "55%" : "100%" }} />)}</div>);
  if (type === "banner" || type === "banner3") return (<div style={base}><div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: muted }} /><div style={{ flex: 1, height: 3, borderRadius: 2, background: muted }} /></div>{[1,2].map(i => <div key={i} style={{ height: 5, borderRadius: 2, background: muted, marginBottom: 3 }} />)}<div style={{ height: 14, borderRadius: 3, background: hl, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3, position: "relative" }}><span style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>{type === "banner3" ? "Your Banner — 3 Pages" : "Your Banner Placement"}</span></div>{[1,2].map(i => <div key={i} style={{ height: 5, borderRadius: 2, background: muted, marginBottom: 3 }} />)}{type === "banner3" && (<div style={{ display: "flex", gap: 3 }}>{["Page 1","Page 2","Page 3"].map(p => (<div key={p} style={{ flex: 1, height: 8, borderRadius: 2, background: `${hl}40`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 6, color: "rgba(255,255,255,0.6)", fontFamily: "'Libre Franklin',sans-serif" }}>{p}</span></div>))}</div>)}</div>);
  if (type === "strip") return (<div style={base}><div style={{ height: 24, borderRadius: 4, background: muted, marginBottom: 5, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin',sans-serif" }}>Hero Area</span></div><div style={{ display: "flex", gap: 4, overflow: "hidden" }}><div style={{ flexShrink: 0, width: 44, height: 28, borderRadius: 4, background: hl, border: `1.5px solid rgba(255,255,255,0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 6, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>YOUR<br/>EVENT</span></div>{[1,2,3].map(i => <div key={i} style={{ flexShrink: 0, width: 44, height: 28, borderRadius: 4, background: muted }} />)}</div><div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin',sans-serif", marginTop: 3, letterSpacing: 0.5 }}>First in the Coming Up strip</div></div>);
  if (type === "video") return (<div style={base}><div style={{ height: 44, borderRadius: 4, background: `linear-gradient(135deg,rgba(10,18,24,0.9),rgba(45,59,69,0.9))`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${hl}60` }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: hl, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, marginLeft: 2 }}>▶</span></div><div><div style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>Holly & The Yeti</div><div style={{ fontSize: 6, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin',sans-serif" }}>feature your event</div></div></div></div>);
  if (type === "bundle") return (<div style={base}><div style={{ height: 14, borderRadius: 3, background: hl, display: "flex", alignItems: "center", paddingLeft: 6, marginBottom: 3 }}><span style={{ fontSize: 6, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" }}>Front Page</span></div><div style={{ display: "flex", gap: 3, marginBottom: 3 }}><div style={{ flex: 1, height: 8, borderRadius: 2, background: `${hl}80`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 6, color: "#fff", fontFamily: "'Libre Franklin',sans-serif" }}>✉️ Newsletter</span></div><div style={{ flex: 1, height: 8, borderRadius: 2, background: `${hl}60`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 6, color: "#fff", fontFamily: "'Libre Franklin',sans-serif" }}>📅 Calendar</span></div></div><div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin',sans-serif", textAlign: "center", letterSpacing: 0.5 }}>All three placements at once</div></div>);
  return null;
}

export function AdvertisePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get("success") === "true";
  const isCancelled = params.get("cancelled") === "true";
  const successName = params.get("event") || "";

  const [form, setForm] = useState({ brandName: "", email: "", tier: "", promoPages: [], notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showContact, setShowContact] = useState(false);

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
<GlobalStyles />
      {showContact && <ContactModal onClose={() => setShowContact(false)} defaultCategory="Sponsorship Inquiry" />}
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
          <button
            onClick={() => setShowContact(true)}
            style={{
              display: "inline-block",
              background: C.sunset, color: "#fff",
              fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
              fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase",
              border: "none", padding: "12px 28px", borderRadius: 4,
              cursor: "pointer", transition: "opacity 0.2s",
            }}
          >
            Check Availability →
          </button>
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
              <button onClick={() => setShowContact(true)} style={{ background: "none", border: "none", padding: 0, color: C.lakeBlue, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline" }}>contact us</button>{" "}
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
      <div id="submit-event">
        <HappeningSubmitCTA />
      </div>

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
            These are our launch prices. Rates may increase as the platform grows.
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
