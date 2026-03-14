import { useState, useEffect, useRef, useCallback } from "react";
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import BuildPage from './pages/BuildPage';
import RatePage from './pages/RatePage';
import FoundingPage from './pages/FoundingPage';
import FoodTruckPartnerPage from './pages/FoodTruckPartnerPage';
import WinePartnerPage from './pages/WinePartnerPage';
import FoodTrucksPage from './pages/FoodTrucksPage';
import DiscoverPage, { VoiceWidget } from './pages/DiscoverPage';
import ClaimPage from './pages/ClaimPage';
import YetiAdminPage from './pages/YetiAdminPage';
import DispatchPage, { DispatchArticlePage } from './pages/DispatchPage';
import PromotePage, { AdvertisePage } from './pages/PromotePage';
import FeaturedPage from './pages/FeaturedPage';
import HappeningPage, { formatEventDate } from './pages/HappeningPage';
import ClaimPromoView from "./pages/ClaimPromoView";
import RedeemPromoView from "./pages/RedeemPromoView";
import WineriesPage from './pages/WineriesPage';
import FishingPage from './pages/FishingPage';
import HistoricalSocietyPage from './pages/HistoricalSocietyPage';
import MensClubPage from './pages/MensClubPage';
import LadiesClubPage from './pages/LadiesClubPage';
import DevilsLakePage from './pages/DevilsLakePage';
import RoundLakePage from './pages/RoundLakePage';
import VillagePage from './pages/VillagePage';
import USA250Page from "./pages/USA250Page";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";

// ============================================================
// 📑  TABLE OF CONTENTS
// ============================================================
// To easily navigate this 16,000+ line file, use your editors search feature
// (Cmd+F / Ctrl+F) and paste the exact section title below.
//
// line 0004: 🎬  GLOBAL CSS KEYFRAMES & ANIMATIONS
// line 0214: ✏️  CONFIGURABLE CONTENT — manage hero events via Notion
// line 0218: 🎨  DESIGN TOKENS
// line 0240: 💛  PAGE SPONSORS — update to activate; null = show placeholder
// line 0258: 🧭  NAV SECTIONS
// line 0283: 📋  BUSINESS DIRECTORY DATA
// line 0285: Village page editorial listings — hardcoded for the Walk the Village section only.
// line 0485: Events are 100% Notion-driven — no hardcoded data here.
// line 0489: 🎬  VIDEO / STORY CONTENT
// line 0543: 🧩  SHARED COMPONENTS
// line 0731: 💛  PAGE SPONSOR BANNER — appears above Footer on eligible pages
// line 0850: 📢  EVENT TICKER / MARQUEE
// line 0903: 🏠  HERO SECTION
// line 1168: 📅  FEATURED EVENTS STRIP — next 4 upcoming events, below hero
// line 1171: 📢  PROMO BANNER — reusable, fetches active page banners
// line 1353: 📰  NEWSLETTER SIGNUP
// line 1356: 📬  SUBSCRIBE CONFIRMATION MODAL (MAGIC MOMENT)
// line 1524: 📰  INLINE NEWSLETTER CTA (compact banner)
// line 1617: 📅  12-MONTH ROLLING EVENT TIMELINE
// line 1736: 📅  WHAT'S HAPPENING — home page teaser (3 events)
// line 1856: 📅  /happening — PAGE HERO
// line 1924: 📅  /happening — WEEKLY RECURRING EVENTS
// line 2034: 📅  /happening — SPECIAL / ONE-OFF EVENTS
// line 2175: 🎬  /happening — VIDEO SECTION
// line 2275: 📅  /happening — INLINE SUBMIT FORM
// line 2463: 🗺️  EXPLORE
// line 2579: 💰  LISTING TIERS / PRICING SECTION
// line 2814: 🏪  BUSINESS DIRECTORY
// line 3279: 🎙️  HOLLY & THE YETI
// line 3450: 🏡  LIVING HERE
// line 3551: 📝  SUBMISSION FORM
// line 3553: Client-side image compression
// line 3917: ℹ️  ABOUT
// line 3989: 🔻  FOOTER
// line 4188: 🧭  NAVBAR
// line 4518: 📅  /happening — FULL PAGE
// line 4695: 🚚  LIVE FOOD TRUCK STRIP (home page — shows only when a truck has checked in within 12h)
// line 4790: 🌊  ROUND LAKE PAGE
// line 5148: 🏘️  MANITOU BEACH VILLAGE PAGE
// line 5382: ⭐  FEATURED BUSINESS — SALES PAGE + STRIPE CHECKOUT
// line 6148: 🏛️  MEN'S CLUB PAGE (/mens-club)
// line 6484: 🏛️  HISTORICAL SOCIETY PAGE (/historical-society)
// line 6815: 🎣  FISHING PAGE (/fishing)
// line 7383: 🍷  WINERIES PAGE (/wineries)
// line 8759: 🏖️  DEVILS LAKE PAGE (/devils-lake)
// line 9076: 🌿  LAND & LAKE LADIES CLUB PAGE (/ladies-club)
// line 9078: LADIES_CLUB_EVENTS removed — content now inline in LadiesClubEventsSection
// line 9734: 📣  PROMOTE PAGE (/promote)
// line 10585: 📰  THE MANITOU DISPATCH — BLOG / NEWSLETTER ARCHIVE
// line 10606: 📢  AD SLOTS — Dispatch blog advertising
// line 11026: 📰  DISPATCH PREVIEW — Homepage 3-card teaser
// line 11233: 🛠️  YETI ADMIN — AI Article Writer (unlisted, /yeti-admin)
// line 11518: 🇺🇸  USA 250th ANNIVERSARY PAGE (/usa250)
// line 13633: 🎤  VOICE WIDGET — Vapi + ElevenLabs
// line 13912: 🗺️  DISCOVER PAGE — MAP-FIRST COMMUNITY GUIDE
// line 14409: 📄  PRIVACY POLICY
// line 14479: 📄  TERMS OF SERVICE
// line 14543: 🚚  /food-trucks — FOOD TRUCK LOCATOR
// line 14889: 🏗️  /build — WEBSITE RENTAL LEAD CAPTURE
// line 15149: 🔒  /founding — FOUNDING MEMBER PAGE (private link, friend outreach)
// line 15526: 🚚  /food-truck-partner — FOOD TRUCK PARTNER PAGE (private link)
// line 15936: 🍷  /wine-partner — WINE TRAIL PARTNER PAGE (private link)
// line 16526: 📱  BLACKBIRD PROMO - USER CLAIM VIEW
// line 16667: ☕️  BLACKBIRD PROMO - BARISTA REDEEM VIEW
// line 16756: 🌐  APP ROOT
// ============================================================

// ============================================================
// 🎬  GLOBAL CSS KEYFRAMES & ANIMATIONS
// ============================================================
export function GlobalStyles() {
  return (
    <style>{`
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
      @keyframes float-slow {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-18px) rotate(3deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212,132,90,0.3); }
        50% { box-shadow: 0 0 20px 4px rgba(212,132,90,0.15); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes tracking-in {
        0% { letter-spacing: 12px; opacity: 0; }
        100% { letter-spacing: 5px; opacity: 1; }
      }
      @keyframes underline-grow {
        0% { transform: scaleX(0); transform-origin: left; }
        100% { transform: scaleX(1); transform-origin: left; }
      }
      @keyframes scroll-progress {
        0% { width: 0%; }
      }
      .scroll-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #7A8E72, #D4845A);
        z-index: 10000;
        transition: width 0.1s linear;
      }
      @keyframes pulse-line {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes kenBurnsBg {
        0%   { transform: scale(1)    translate(0, 0); }
        100% { transform: scale(1.18) translate(-1.5%, -0.8%); }
      }
      .ken-burns-bg {
        animation: kenBurnsBg 25s ease-in-out infinite alternate;
        transform-origin: center center;
        will-change: transform;
      }
      @keyframes dot-breathe {
        0%, 100% { box-shadow: 0 0 4px currentColor; transform: scale(1); }
        50% { box-shadow: 0 0 16px currentColor; transform: scale(1.2); }
      }
      @keyframes adPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        50% { transform: scale(1.012); box-shadow: 0 8px 28px rgba(0,0,0,0.14); }
      }
      @keyframes adFade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.82; }
      }
      @keyframes adSlide {
        0% { transform: translateX(-12px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes shrinkWidth {
        from { width: 100%; }
        to { width: 0%; }
      }
      .timeline-pulse {
        background: linear-gradient(90deg, rgba(122,142,114,0.1), rgba(212,132,90,0.35), rgba(91,126,149,0.35), rgba(122,142,114,0.1)) !important;
        background-size: 200% 100% !important;
        animation: pulse-line 4s ease-in-out infinite !important;
      }
      .timeline-dot-breathe {
        animation: dot-breathe 3s ease-in-out infinite;
      }
      .marquee-track {
        display: flex;
        animation: marquee 35s linear infinite;
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
      .btn-animated {
        transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      }
      .btn-animated:hover {
        transform: translateY(-2px) scale(1.02) !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
      }
      .card-tilt {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .link-hover-underline {
        position: relative;
        display: inline-block;
      }
      .link-hover-underline::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 1.5px;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }
      .link-hover-underline:hover::after {
        transform: scaleX(1);
      }
      .featured-card-glow:hover {
        border-color: rgba(212,132,90,0.5) !important;
        box-shadow: 0 0 20px rgba(212,132,90,0.10), 0 6px 18px rgba(0,0,0,0.25) !important;
      }
      .horizontal-scroll {
        scrollbar-width: thin;
        scrollbar-color: #7A8E72 transparent;
      }
      .horizontal-scroll::-webkit-scrollbar {
        height: 6px;
      }
      .horizontal-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .horizontal-scroll::-webkit-scrollbar-thumb {
        background: #7A8E7240;
        border-radius: 3px;
      }
      .horizontal-scroll::-webkit-scrollbar-thumb:hover {
        background: #7A8E72;
      }
      @media (prefers-reduced-motion: reduce) {
        .marquee-track { animation: none !important; }
        .card-tilt { transition: none !important; }
        * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
      @media (max-width: 960px) {
        .nav-desktop { display: none !important; }
        .nav-hamburger { display: flex !important; }
        .mobile-col-1 { grid-template-columns: 1fr !important; }
        .living-here-grid { grid-template-columns: 1fr !important; }
        .village-roots-grid { grid-template-columns: 1fr !important; }
        .mens-club-stats { grid-template-columns: repeat(3, 1fr) !important; }
        .wineries-itinerary-grid { grid-template-columns: 1fr !important; }
        .listing-demo-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        .mobile-col-1 { grid-template-columns: 1fr !important; }
        .holly-grid { grid-template-columns: 1fr !important; }
        .weekly-event-row {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
        }
        .fish-card-header { flex-direction: column !important; }
        .fish-card-img { width: 100% !important; height: 160px !important; min-height: unset !important; }
        .fish-card-meta {
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 20px 16px !important;
        }
        .calendar-event-row {
          grid-template-columns: auto 1fr !important;
          gap: 0 16px !important;
        }
        .calendar-cost-badge { display: none !important; }
        .living-here-grid { grid-template-columns: 1fr !important; }
        .mens-club-stats { grid-template-columns: repeat(2, 1fr) !important; }
        .village-roots-grid { grid-template-columns: 1fr !important; }
        .scoreboard-venue-name { width: 100px !important; font-size: 11px !important; }
        .scoreboard-explainer-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
      }
      @keyframes bar-breathe {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.82; box-shadow: 0 0 14px rgba(212,132,90,0.4); }
      }
      @keyframes bar-shimmer {
        0% { background-position: 0% center; }
        100% { background-position: 300% center; }
      }
      @keyframes ticker-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .scoreboard-ticker {
        display: inline-flex;
        animation: ticker-scroll 38s linear infinite;
        white-space: nowrap;
      }
      .scoreboard-ticker:hover { animation-play-state: paused; }
      .scoreboard-leader-bar {
        animation: bar-breathe 3s ease-in-out infinite, bar-shimmer 5s linear infinite;
      }
    `}</style>
  );
}

// ============================================================
// ✏️  CONFIGURABLE CONTENT — manage hero events via Notion
// ============================================================

// ============================================================
// 🎨  DESIGN TOKENS
// ============================================================
import { C, PAGE_SPONSORS, USA250_PUBLIC, SLOT_CAPS, LISTING_CATEGORIES, USA250_VIDEO_URL, SECTIONS, VILLAGE_BUSINESSES, CAT_COLORS, VIDEOS } from './data/config';

import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, useCardTilt, WaveDivider, PageSponsorBanner, DiagonalDivider, Btn, CategoryPill } from './components/Shared';


// ============================================================
// 📢  EVENT TICKER / MARQUEE
// ============================================================
function EventTicker() {
  const [tickerItems, setTickerItems] = useState([]);
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => {
        const upcoming = (data.events || []).map(e => {
          const d = new Date(e.date + "T00:00:00");
          const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return `${e.name} · ${formatted}`;
        });
        const regulars = (data.recurring || []).map(e =>
          `${e.name} · Every ${e.recurringDay || "Week"}`
        );
        setTickerItems([...upcoming, ...regulars]);
      })
      .catch(() => {});
  }, []);

  if (tickerItems.length === 0) return null;
  const repeated = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems];
  return (
    <a href="/happening" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: `linear-gradient(90deg, ${C.night} 0%, ${C.dusk} 50%, ${C.night} 100%)`,
        padding: "14px 0",
        overflow: "hidden",
        position: "relative",
        borderBottom: `1px solid ${C.sage}20`,
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(270deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div className="marquee-track" style={{ whiteSpace: "nowrap" }}>
          {repeated.map((item, i) => (
            <span key={i} style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12, fontWeight: 500, letterSpacing: 1,
              textTransform: "uppercase", color: C.sunsetLight,
              padding: "0 24px", display: "inline-flex", alignItems: "center", gap: 24,
            }}>
              {item}
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.sage, display: "inline-block", opacity: 0.5 }} />
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

// ============================================================
// 🏠  HERO SECTION
// ============================================================
function Hero({ scrollTo }) {
  // All hooks at top — fixes React rules-of-hooks violation from previous pattern
  const [loaded, setLoaded] = useState(false);
  const [heroEvents, setHeroEvents] = useState([]);
  const [heroTakeover, setHeroTakeover] = useState([]);
  const [heroReady, setHeroReady] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [heroPaused, setHeroPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    fetch("/api/hero")
      .then(r => r.json())
      .then(data => {
        setHeroEvents(data.events || []);
        setHeroReady(true);
      })
      .catch(() => setHeroReady(true));
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => setHeroTakeover(data.heroTakeover || []))
      .catch(() => {});
  }, []);

  // Auto-rotate through hero events every 10 seconds with fade transition
  // Uses takeover events when active, organic events otherwise
  const rotationCount = heroTakeover.length > 0 ? heroTakeover.length : heroEvents.length;
  useEffect(() => {
    if (rotationCount <= 1 || heroPaused) return;
    const t = setInterval(() => {
      setHeroFade(false);
      setTimeout(() => {
        setHeroIndex(i => (i + 1) % rotationCount);
        setHeroFade(true);
      }, 800);
    }, 30000);
    return () => clearInterval(t);
  }, [rotationCount, heroPaused]);

  // Parallax for default video hero
  useEffect(() => {
    const onScroll = () => { if (window.scrollY < window.innerHeight * 1.2) setScrollY(window.scrollY); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollIndicator = (
    <div style={{
      position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
      zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.2)" }} />
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
        Scroll
      </div>
    </div>
  );

  // ── EVENT HERO (with rotation) ──
  // If a paid Hero Takeover promo is active, show takeover events exclusively
  const isSponsored = heroTakeover.length > 0;
  const displayEvents = isSponsored ? heroTakeover : heroEvents;
  const heroEvent = displayEvents[heroIndex] || null;
  if (heroReady && heroEvent) {
    // heroImageUrl = high-res image for full-screen bg (add "Hero Image URL" column in Notion)
    // imageUrl = small event image — shown as a contained card, never stretched
    const bgStyle = heroEvent.heroImageUrl
      ? {}
      : { background: `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 50%, ${C.dusk} 100%)` };

    return (
      <section
        id="home"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", ...bgStyle }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {heroEvent.heroImageUrl && (() => {
          const isBgVideo = /\.(mp4|webm|mov|m4v)/i.test(heroEvent.heroImageUrl);
          return isBgVideo ? (
            <video
              key={heroEvent.heroImageUrl}
              ref={el => el && (el.muted = true)}
              autoPlay loop playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            >
              <source src={heroEvent.heroImageUrl} type="video/mp4" />
            </video>
          ) : (
            <img
              key={heroEvent.heroImageUrl}
              src={heroEvent.heroImageUrl}
              alt=""
              aria-hidden="true"
              className="ken-burns-bg"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            />
          );
        })()}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(26,40,48,0.75) 0%, rgba(26,40,48,0.5) 50%, rgba(26,40,48,0.85) 100%)", zIndex: 1 }} />

        {/* Coming Up / Sponsored badge — top right */}
        <div style={{ position: "absolute", top: 100, right: 48, zIndex: 2 }}>
          <div style={{
            display: "inline-block",
            background: isSponsored ? `${C.sage}22` : `${C.sunset}22`,
            border: `1px solid ${isSponsored ? C.sage : C.sunset}50`,
            borderRadius: 4, padding: "6px 16px", fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
            color: isSponsored ? C.sage : C.sunsetLight,
          }}>
            {isSponsored ? "Sponsored" : "Coming Up"}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "120px 48px 100px" }}>
          <div style={{ opacity: loaded && heroFade ? 1 : 0, transform: loaded && heroFade ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Manitou Beach · Devils Lake, Michigan
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 400, color: C.cream, lineHeight: 1.1, margin: "0 0 12px 0", maxWidth: 700 }}>
              {heroEvent.name}
            </h1>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(18px, 2.5vw, 26px)", color: C.sunsetLight, margin: "0 0 20px 0" }}>
              {new Date(heroEvent.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {heroEvent.time && ` · ${heroEvent.time}`}
            </div>

            {/* Event image/video — wide, contained, below the date */}
            {heroEvent.imageUrl && (() => {
              const isVideo = /\.(mp4|webm|mov|m4v)/i.test(heroEvent.imageUrl);
              const mediaStyle = {
                width: "100%", height: "auto", maxHeight: 320,
                objectFit: "contain", display: "block",
              };
              return (
                <div style={{ margin: "0 0 24px 0", maxWidth: 546, width: "100%", borderRadius: 12, overflow: "hidden" }}>
                  {isVideo ? (
                    <video
                      key={heroEvent.imageUrl}
                      ref={el => el && (el.muted = true)}
                      src={heroEvent.imageUrl}
                      autoPlay loop playsInline
                      style={mediaStyle}
                    />
                  ) : (
                    <img
                      src={heroEvent.imageUrl}
                      alt={heroEvent.name}
                      style={mediaStyle}
                    />
                  )}
                </div>
              );
            })()}

            {heroEvent.tagline && (
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, maxWidth: 560, margin: "0 0 24px 0" }}>
                {heroEvent.tagline}
              </p>
            )}

            {/* CTA button — event-specific (Get Tickets / Learn More etc.) */}
            {heroEvent.eventUrl && (
              <div style={{ marginBottom: 16 }}>
                <a
                  href={heroEvent.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block", padding: "13px 32px",
                    background: "#4A9B6F", color: "#fff", borderRadius: 6,
                    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
                    fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                    textDecoration: "none", transition: "all 0.25s ease",
                  }}
                >
                  {heroEvent.ctaLabel || "Get Tickets"}
                </a>
              </div>
            )}

            {/* Site nav buttons — below, visually separated from event CTA */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: heroEvent.eventUrl ? 4 : 0 }}>
              <Btn href="/happening" variant="sunset">See All Events</Btn>
              <Btn onClick={() => scrollTo("businesses")} variant="outlineLight">Explore the Community</Btn>
            </div>
          </div>
        </div>

        {/* Rotation dots — only if multiple events */}
        {displayEvents.length > 1 && (
          <div style={{
            position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)",
            zIndex: 3, display: "flex", gap: 10,
          }}>
            {displayEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => { setHeroFade(false); setTimeout(() => { setHeroIndex(i); setHeroFade(true); }, 400); setHeroPaused(true); }}
                style={{
                  width: i === heroIndex ? 24 : 8, height: 8,
                  borderRadius: 4, border: "none",
                  background: i === heroIndex ? C.sunsetLight : "rgba(255,255,255,0.3)",
                  cursor: "pointer", padding: 0,
                  transition: "all 0.35s ease",
                }}
              />
            ))}
          </div>
        )}

        {scrollIndicator}
      </section>
    );
  }

  // ── DEFAULT HERO (video + parallax) ──
  return (
    <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${C.night} 0%, ${C.lakeDark} 60%, ${C.dusk} 100%)`, zIndex: 0 }} />
      <video
        autoPlay muted loop playsInline
        style={{
          position: "absolute", inset: 0, width: "100%", height: "120%", objectFit: "cover", zIndex: 1,
          transform: `translateY(${scrollY * 0.3}px)`, willChange: "transform",
        }}
      >
        <source src="/videos/hero-default.mp4" type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(26,40,48,0.6) 0%, rgba(26,40,48,0.35) 50%, rgba(26,40,48,0.75) 100%)", zIndex: 2 }} />
      <div style={{ position: "absolute", top: "20%", right: "15%", width: 200, height: 200, borderRadius: "50%", background: `${C.sage}08`, zIndex: 2, animation: "float-slow 8s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "25%", left: "10%", width: 120, height: 120, borderRadius: "50%", background: `${C.sunset}06`, zIndex: 2, animation: "float 6s ease-in-out infinite 2s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "60%", right: "8%", width: 60, height: 60, borderRadius: "50%", border: `1px solid ${C.sage}15`, zIndex: 2, animation: "float-slow 10s ease-in-out infinite 1s", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 3, maxWidth: 960, margin: "0 auto", padding: "160px 48px 120px", transform: `translateY(${scrollY * 0.08}px)` }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 24, animation: loaded ? "tracking-in 0.8s ease forwards" : "none" }}>
            Welcome to
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 400, color: C.cream, lineHeight: 1.0, margin: "0 0 16px 0" }}>
            Manitou Beach
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 3vw, 32px)", color: C.sunsetLight, marginBottom: 30 }}>
            on Devils Lake, Michigan
          </div>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 48px 0" }}>
            A lakeside community with a big personality. Devils Lake, Round Lake, and everything happening in the Irish Hills.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Btn onClick={() => scrollTo("businesses")} variant="primary">Explore Businesses</Btn>
            <Btn onClick={() => scrollTo("happening")} variant="outlineLight">What's Happening</Btn>
          </div>
          <ShareBar title="Manitou Beach — Irish Hills, Michigan" />
        </div>
      </div>
      {scrollIndicator}
    </section>
  );
}

// ============================================================
// 📅  FEATURED EVENTS STRIP — next 4 upcoming events, below hero
// ============================================================
// ============================================================
// 📢  PROMO BANNER — reusable, fetches active page banners
// ============================================================
export function PromoBanner({ page }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => {
        const banners = data.pageBanners?.[page] || [];
        if (banners.length > 0) setBanner(banners[0]);
      })
      .catch(() => {});
  }, [page]);

  if (!banner) return null;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.night} 0%, #1e3326 100%)`,
      borderBottom: `3px solid ${C.sage}50`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "24px 24px",
        display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap",
      }}>
        {banner.imageUrl && (
          <img
            src={banner.imageUrl}
            alt={banner.name}
            style={{ width: 110, height: 75, objectFit: "cover", borderRadius: 8, flexShrink: 0, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 6 }}>
            {banner.sponsorBadge ? "Sponsored" : "Featured Event"}
          </div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(17px, 2.5vw, 22px)", color: C.cream, lineHeight: 1.2, marginBottom: 4 }}>
            {banner.promoHeadline || banner.name}
          </div>
          {(banner.date || banner.location) && (
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.5)" }}>
              {banner.date && new Date(banner.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {banner.date && banner.location && " · "}
              {banner.location}
            </div>
          )}
        </div>
        {banner.eventUrl && (
          <a
            href={banner.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", padding: "11px 28px",
              background: "#4A9B6F", color: "#fff", borderRadius: 6,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
              fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            {banner.ctaLabel || "Learn More"}
          </a>
        )}
      </div>
    </div>
  );
}

function FeaturedEventsStrip() {
  const [events, setEvents] = useState([]);
  const [stripPin, setStripPin] = useState(null);
  const [lightboxEvent, setLightboxEvent] = useState(null);
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setEvents((data.events || []).slice(0, 4)))
      .catch(() => {});
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => setStripPin(data.stripPin || null))
      .catch(() => {});
  }, []);

  if (events.length === 0) return null;

  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, "Community": C.lakeBlue };
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  // Inject strip pin promo at position 0 (bump last organic event out)
  const displayEvents = stripPin
    ? [{ ...stripPin, isPromoted: true }, ...events.slice(0, 3)]
    : events;

  return (
    <div style={{
      background: `linear-gradient(90deg, ${C.night} 0%, ${C.dusk} 50%, ${C.night} 100%)`,
      padding: "28px 24px",
      borderBottom: `1px solid rgba(255,255,255,0.05)`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
            Coming Up
          </div>
          <a href="/happening" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.sunsetLight, textDecoration: "none" }}>
            See All Events →
          </a>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${displayEvents.length}, 1fr)`,
          gap: 12,
          overflowX: "auto",
        }}>
          {displayEvents.map((event, i) => {
            const d = event.date ? new Date(event.date + "T00:00:00") : null;
            const month = d ? MONTHS[d.getMonth()] : "";
            const day = d ? d.getDate() : "";
            const color = event.isPromoted ? C.sunset : (eventCatColors[event.category] || C.sage);
            const handleClick = () => {
              if (event.isPromoted && event.eventUrl) { window.open(event.eventUrl, "_blank", "noopener noreferrer"); }
              else { setLightboxEvent(event); }
            };
            return (
              <div key={event.id || i} onClick={handleClick} style={{ cursor: "pointer" }}>
                <div
                  style={{
                    background: event.isPromoted ? `${C.sunset}12` : "rgba(255,255,255,0.04)",
                    border: event.isPromoted ? `1px solid ${C.sunset}40` : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, overflow: "hidden",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = event.isPromoted ? `${C.sunset}20` : "rgba(255,255,255,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = event.isPromoted ? `${C.sunset}12` : "rgba(255,255,255,0.04)"}
                >
                  {/* Date block */}
                  <div style={{
                    background: `${color}20`, borderBottom: `2px solid ${color}`,
                    padding: "10px 14px", display: "flex", alignItems: "baseline", gap: 6,
                  }}>
                    {d ? (
                      <>
                        <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color, lineHeight: 1 }}>{day}</span>
                        <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: `${color}cc`, textTransform: "uppercase" }}>{month}</span>
                      </>
                    ) : (
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: `${color}cc`, textTransform: "uppercase" }}>Featured</span>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{
                      fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.cream,
                      lineHeight: 1.3, marginBottom: 6,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {event.name}
                    </div>
                    {event.location && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {event.location}
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, background: `${color}15`, padding: "3px 8px", borderRadius: 3 }}>
                        {event.isPromoted ? "★ Promoted" : event.recurring === 'Annual' ? '● Annual' : event.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </div>
  );
}

// ============================================================
// 📰  NEWSLETTER SIGNUP
// ============================================================
// ============================================================
// 📬  SUBSCRIBE CONFIRMATION MODAL (MAGIC MOMENT)
// ============================================================
function SubscribeModal({ alreadySubscribed, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '48px 40px',
          maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          textAlign: 'center', fontFamily: "'Libre Franklin', sans-serif",
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: `${C.sunset}10`, borderRadius: '50%', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, background: `${C.sage}10`, borderRadius: '50%', pointerEvents: 'none' }}/>

        {alreadySubscribed ? (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>👋</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, margin: '0 0 12px' }}>
              Already on the list!
            </h3>
            <p style={{ color: C.textLight, fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>
              You're already subscribed to The Manitou Dispatch. Watch your inbox — the next issue is coming soon.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍪</div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunset, marginBottom: 10 }}>
              Secret Lake Code
            </div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, margin: '0 0 20px' }}>
              You're almost in...
            </h3>
            
            <div style={{
              background: `linear-gradient(135deg, ${C.sage}10 0%, ${C.lakeBlue}10 100%)`, 
              border: `1px solid ${C.sage}30`, borderRadius: 12, padding: '24px 20px', marginBottom: 28,
              position: 'relative'
            }}>
              <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: '0 0 16px', fontWeight: 600 }}>
                Step 1: Click confirm in your email.
              </p>
              <p style={{ color: C.textLight, fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                Step 2: Show this secret code at <strong>Blackbird Cafe</strong> this weekend for a welcome cookie on us.
              </p>
              <div style={{
                fontFamily: "'Courier New', monospace", fontSize: 22, fontWeight: 700, 
                letterSpacing: 4, color: C.sunset, background: '#fff', padding: '12px 24px', 
                borderRadius: 8, display: 'inline-block', border: `1.5px dashed ${C.sunset}60`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                LAKEBOUND
              </div>
            </div>

            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              Check your <strong>spam/junk</strong> folder if you don't see the confirmation email within a few minutes.
            </p>
          </>
        )}
        <button
          onClick={onClose}
          style={{
            background: C.sage, color: '#fff', border: 'none', borderRadius: 8,
            padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Libre Franklin', sans-serif", width: '100%',
            letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s ease',
            position: 'relative', zIndex: 1
          }}
          onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.target.style.transform = 'none'}
        >
          {alreadySubscribed ? 'Got it' : 'I saved the code →'}
        </button>
      </div>
    </div>
  );
}

function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAlreadySubscribed(data.alreadySubscribed);
      setShowModal(true);
    } catch (err) {
      setError('Something went wrong — try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: C.dusk,
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <SectionLabel light>Stay in the Loop</SectionLabel>
        <h3 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 400,
          color: C.cream,
          margin: "0 0 10px 0",
        }}>
          The Manitou Beach Dispatch
        </h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 28px 0", lineHeight: 1.7 }}>
          Weekly events, featured businesses, and community news. No spam — just lake life.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={submitting}
            style={{
              flex: 1, minWidth: 200, padding: "12px 18px", borderRadius: 4,
              border: `1px solid rgba(255,255,255,0.15)`,
              background: "rgba(255,255,255,0.08)", color: C.cream,
              fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: "none",
            }}
          />
          <Btn variant="sage" disabled={submitting}>{submitting ? 'Joining…' : 'Subscribe'}</Btn>
        </form>
        {error && <p style={{ color: C.sunset, fontSize: 13, marginTop: 10 }}>{error}</p>}
        {showModal && <SubscribeModal alreadySubscribed={alreadySubscribed} onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
}

// ============================================================
// 📰  INLINE NEWSLETTER CTA (compact banner)
// ============================================================
export function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAlreadySubscribed(data.alreadySubscribed);
      setShowModal(true);
      setEmail('');
    } catch {
      setError('Something went wrong — try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.sage}15 0%, ${C.lakeBlue}10 100%)`,
      border: `1px solid ${C.sage}25`,
      borderRadius: 12,
      padding: "32px 40px",
      maxWidth: 1100,
      margin: "0 auto",
      marginTop: -20,
      marginBottom: 40,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 20,
      position: "relative",
      zIndex: 1,
    }}>
      <div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sage, marginBottom: 2 }}>
          The Manitou Beach Dispatch
        </div>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>
          Weekly events, businesses & community news — straight to your inbox.
        </div>
      </div>
      <div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email" placeholder="your@email.com" value={email}
            onChange={e => setEmail(e.target.value)} required disabled={submitting}
            style={{
              padding: "10px 16px", borderRadius: 6, border: `1.5px solid ${C.sand}`,
              background: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif",
              color: C.text, outline: "none", minWidth: 200,
            }}
          />
          <Btn variant="primary" small disabled={submitting}>{submitting ? 'Joining…' : 'Subscribe'}</Btn>
        </form>
        {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: C.sunset }}>{error}</p>}
      </div>
      {DISPATCH_CARD_SPONSORS.length > 0 && (
        <div style={{ flexBasis: '100%', borderTop: '1px solid rgba(122,142,114,0.15)', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          {DISPATCH_CARD_SPONSORS[0].logo ? (
            <img src={DISPATCH_CARD_SPONSORS[0].logo} alt={DISPATCH_CARD_SPONSORS[0].name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'contain', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', padding: 2, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 4, border: '1.5px dashed #c4b09a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>📷</div>
          )}
          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: 9 }}>Sponsored by </span>
            <span style={{ fontWeight: 600, color: C.text }}>{DISPATCH_CARD_SPONSORS[0].name}</span>
            {DISPATCH_CARD_SPONSORS[0].offerText && <span> · {DISPATCH_CARD_SPONSORS[0].offerText}</span>}
          </div>
        </div>
      )}
      {showModal && <SubscribeModal alreadySubscribed={alreadySubscribed} onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ============================================================
// 📅  12-MONTH ROLLING EVENT TIMELINE
// ============================================================
function EventTimeline() {
  const [notionEvents, setNotionEvents] = useState([]);
  const [lightboxEvent, setLightboxEvent] = useState(null);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setNotionEvents(data.events || []))
      .catch(() => {});
  }, []);

  // Next 3 months window
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  // 100% Notion-driven — no hardcoded events
  const allEvents = notionEvents
    .filter(e => { const d = new Date(e.date + "T00:00:00"); return d >= now && d <= cutoff; })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const catColor = (cat) => ({ "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, "Community": C.lakeBlue }[cat] || C.sage);

  // Group events by month for section headers
  const grouped = allEvents.reduce((acc, event) => {
    const d = new Date(event.date + "T00:00:00");
    const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>Coming Up</SectionLabel>
          <SectionTitle light>Next 3 Months</SectionTitle>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 480, marginBottom: 48 }}>
            What's on around the lakes — updated as events are confirmed.
          </p>
        </FadeIn>

        {allEvents.length === 0 ? (
          <FadeIn delay={100}>
            <div style={{ padding: "48px 32px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.7 }}>
                No events confirmed for the next 3 months yet.<br />Check back soon — the lake never stays quiet for long.
              </div>
            </div>
          </FadeIn>
        ) : (
          Object.entries(grouped).map(([monthLabel, events], gi) => (
            <div key={gi} style={{ marginBottom: 48 }}>
              <FadeIn delay={gi * 60}>
                <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 24 }}>
                  {monthLabel}
                </div>
              </FadeIn>
              <div style={{ position: "relative", paddingLeft: 36 }}>
                {/* Vertical line */}
                <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "rgba(255,255,255,0.07)", borderRadius: 1 }} />

                {events.map((event, i) => {
                  const d = new Date(event.date + "T00:00:00");
                  const day = d.getDate();
                  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
                  const color = catColor(event.category);
                  return (
                    <FadeIn key={event.id || i} delay={gi * 60 + i * 50}>
                      <div
                        onClick={() => setLightboxEvent(event)}
                        style={{ display: "flex", gap: 20, marginBottom: 24, position: "relative", cursor: "pointer" }}
                      >
                        {/* Dot */}
                        <div style={{
                          position: "absolute", left: -30, top: 5,
                          width: 10, height: 10, borderRadius: "50%",
                          background: color, border: `2px solid ${C.night}`,
                          boxShadow: `0 0 0 2px ${color}40`, flexShrink: 0,
                        }} />

                        {/* Date block */}
                        <div style={{ minWidth: 40, textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>{weekday}</div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: color, lineHeight: 1 }}>{day}</div>
                        </div>

                        {/* Event info */}
                        <div style={{
                          flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 10, padding: "14px 18px", transition: "background 0.2s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        >
                          <div style={{ fontSize: 10, color, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{event.category}</div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, lineHeight: 1.3, marginBottom: 4 }}>{event.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
                            {event.time}{event.location ? ` · ${event.location}` : ""}
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </section>
  );
}

// ============================================================
// 📅  WHAT'S HAPPENING — home page teaser (3 events)
// ============================================================
function HappeningSection() {
  const [notionEvents, setNotionEvents] = useState([]);
  const [lightboxEvent, setLightboxEvent] = useState(null);
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setNotionEvents(data.events || []))
      .catch(() => {});
  }, []);

  const categoryColors = {
    "Live Music": C.sunset,
    "Food & Social": "#8B5E3C",
    "Sports & Outdoors": C.sage,
    Community: C.lakeBlue,
  };
  const preview = notionEvents.slice(0, 3);

  return (
    <section id="happening" style={{
      position: "relative",
      padding: "100px 24px",
      backgroundImage: "url(/images/happening-bg.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk, /* fallback until image is added */
    }}>
      {/* Dark overlay — adjust opacity for photo intensity */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(18,28,35,0.88) 0%, rgba(30,45,54,0.82) 100%)", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
            <div>
              <SectionLabel light>Events & News</SectionLabel>
              <SectionTitle light>What's Happening</SectionTitle>
            </div>
            <Btn href="/happening" variant="outlineLight" small>See All Events →</Btn>
          </div>
        </FadeIn>

        {/* Timeline preview — 3 events */}
        <div style={{ position: "relative", marginBottom: 52 }}>
          <div style={{
            position: "absolute", left: 200, top: 0, bottom: 0,
            width: 1, background: "rgba(255,255,255,0.08)",
          }} />
          {preview.length === 0 ? (
            <div style={{ padding: "32px 0", fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
              Adding events soon — check back!
            </div>
          ) : preview.map((event, i) => {
            const color = categoryColors[event.category] || C.sage;
            const dateLabel = (() => {
              try { return new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
              catch { return event.date; }
            })();
            return (
              <FadeIn key={event.id} delay={i * 70}>
                <div
                  onClick={() => setLightboxEvent(event)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 40px 1fr",
                    alignItems: "flex-start",
                    marginBottom: i < preview.length - 1 ? 48 : 0,
                    gap: 0,
                    cursor: "pointer",
                  }}>
                  <div style={{ paddingRight: 24, paddingTop: 4, textAlign: "right" }}>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color, lineHeight: 1.2 }}>
                      {dateLabel}
                    </div>
                    {event.time && (
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginTop: 3 }}>
                        {event.time}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
                    <div style={{ width: 11, height: 11, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 0 3px ${color}22` }} />
                  </div>
                  <div style={{ paddingLeft: 20 }}>
                    <div style={{ marginBottom: 8 }}><CategoryPill>{event.category}</CategoryPill></div>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 400, color: C.cream, margin: "0 0 10px 0", lineHeight: 1.2 }}>
                      {event.name}
                    </h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: 0, maxWidth: 560 }}>
                      {event.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Full calendar CTA */}
        <FadeIn delay={240}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>
                {notionEvents.length > 3 ? `+ ${notionEvents.length - 3} more events on the calendar` : "See the full calendar"}
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                weekly regulars, seasonal events & more
              </div>
            </div>
            <Btn href="/happening" variant="sunset">Open Full Calendar →</Btn>
          </div>
        </FadeIn>
      </div>
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </section>
  );
}

// ============================================================
// 📅  /happening — PAGE HERO
// ============================================================
function ExploreCard({ place, large = false, delay = 0 }) {
  const tilt = useCardTilt(5);
  const hasImage = !!place.image;
  return (
    <FadeIn delay={delay} direction={large ? "scale" : "up"}>
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onClick={place.action}
        className="card-tilt"
        style={{
          backgroundImage: hasImage ? `url(${place.image})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "none",
          borderRadius: 14,
          padding: large ? "36px 32px" : "20px 18px",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: large ? 260 : 170,
          position: "relative",
          overflow: "hidden",
          boxShadow: large ? "0 12px 40px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Dark overlay for text readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: hasImage
            ? (large
              ? "linear-gradient(to top, rgba(10,18,24,0.88) 0%, rgba(10,18,24,0.35) 55%, rgba(10,18,24,0.08) 100%)"
              : "linear-gradient(to top, rgba(10,18,24,0.88) 0%, rgba(10,18,24,0.35) 60%, rgba(10,18,24,0.05) 100%)")
            : (large ? `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)` : C.warmWhite),
          borderRadius: 14,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Only show icon on large cards */}
          {large && <div style={{ fontSize: 36, marginBottom: 14 }}>{place.icon}</div>}
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: large ? 22 : 15, fontWeight: 700,
            color: (large || hasImage) ? C.cream : C.text,
            marginBottom: 5,
          }}>{place.name}</div>
          <div style={{
            fontSize: large ? 14 : 12,
            color: (large || hasImage) ? "rgba(255,255,255,0.6)" : C.textMuted,
            lineHeight: 1.55, marginBottom: large ? 16 : 10,
            display: "-webkit-box",
            WebkitLineClamp: large ? 4 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{place.desc}</div>
          {place.actionLabel && (
            <div className="link-hover-underline" style={{
              fontSize: 10, fontFamily: "'Libre Franklin', sans-serif",
              fontWeight: 700, letterSpacing: 1.2, paddingTop: 5,
              color: C.sunsetLight, textTransform: "uppercase",
            }}>
              {place.actionLabel} →
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

function ExploreSection() {
  const places = [
    { icon: "⛵", name: "Devils Lake", desc: "600+ acres of water for boating, fishing, and kayaking. The party lake.", image: "/images/explore-devils-lake.jpg", action: () => window.location.href = "/devils-lake", actionLabel: "Explore Devils Lake" },
    { icon: "🏘️", name: "The Village", desc: "Boutique shops, a handmade cafe, wine tasting, and the lighthouse. The walkable heart of Manitou Beach.", image: "/images/explore-lighthouse.jpg", action: () => window.location.href = "/village" },
    { icon: "🌿", name: "Irish Hills", desc: "Rolling hills, hidden trails, and enough nature to justify the drive.", image: "/images/explore-Irish-hills.jpg", action: () => window.open("https://www.irishhills.com", "_blank"), actionLabel: "Explore Irish Hills" },
    { icon: "🍺", name: "Nightlife", desc: "Year-round bars and restaurants with a dock-side state of mind.", image: "/images/explore-nightlife.jpg", action: () => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" }), actionLabel: "See Businesses" },
    { icon: "🎣", name: "Fishing", desc: "Bass, pike, bluegill, and walleye. Two lakes, twelve months of catching.", image: "/images/explore-fishing.jpg", action: () => window.location.href = "/fishing", actionLabel: "Fishing Guide" },
    { icon: "🍷", name: "Wineries", desc: "Michigan wine and craft beverages, right in the Irish Hills.", image: "/images/Explore-wineries.jpg", action: () => window.location.href = "/wineries", actionLabel: "Wine Trail" },
    { icon: "🌊", name: "Round Lake", desc: "515 acres of clear water. The quieter side of lake life.", image: "/images/explore-round-lake.jpg", action: () => window.location.href = "/round-lake", actionLabel: "Explore" },
  ];

  return (
    <section id="explore" style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn direction="left">
          <SectionLabel>The Area</SectionLabel>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 400, color: C.text, margin: "0 0 18px 0", lineHeight: 1.2 }}>
            Explore Manitou Beach
          </h2>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, marginBottom: 48, maxWidth: 560 }}>
            Sitting on the shores of Devils Lake in the Michigan Irish Hills — there's more to explore here than the name implies.
          </p>
        </FadeIn>

        {/* Bento layout: 2 large cards on top, 4 smaller below */}
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {places.slice(0, 2).map((p, i) => (
            <ExploreCard key={i} place={p} large delay={i * 100} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {places.slice(2).map((p, i) => (
            <ExploreCard key={i + 2} place={p} delay={200 + i * 60} />
          ))}
        </div>

      </div>
    </section>
  );
}

// ============================================================
// 💰  LISTING TIERS / PRICING SECTION
// ============================================================
function PricingSection() {
  const [subCount, setSubCount] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ businessName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    fetch('/api/subscribe')
      .then(r => r.json())
      .then(d => setSubCount(d.count ?? 0))
      .catch(() => setSubCount(0));
  }, []);

  const BASE_PRICES = { enhanced: 9, featured: 23, premium: 43 };
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
      price: priceFor(BASE_PRICES.enhanced), priceInCents: centsFor(BASE_PRICES.enhanced),
      features: ['Everything in Free', 'Clickable website link', 'Business description', 'Expandable listing card', 'Category search placement'],
    },
    {
      id: 'featured', name: 'Featured', color: C.sage, badge: 'Most Popular',
      price: priceFor(BASE_PRICES.featured), priceInCents: centsFor(BASE_PRICES.featured),
      features: ['Everything in Enhanced', 'Spotlight card placement', 'Logo or photo display', 'Above standard listings', 'Email contact button'],
    },
    {
      id: 'premium', name: 'Premium', color: C.sunsetLight, badge: 'Best Visibility',
      price: priceFor(BASE_PRICES.premium), priceInCents: centsFor(BASE_PRICES.premium),
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
        body: JSON.stringify({ tier: modal.tierId, businessName: form.businessName, email: form.email, priceInCents: modal.priceInCents, mode: 'subscription' }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setCheckoutError(data.error || 'Something went wrong. Please try again.'); }
    } catch { setCheckoutError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div id="listing-tiers" style={{ background: C.night, padding: "80px 24px 72px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 14 }}>
              List Your Business
            </div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 400, color: C.cream, margin: "0 0 14px 0" }}>
              Choose Your Visibility
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 520, margin: "0 auto 32px" }}>
              Get discovered by the Manitou Beach community. Lock in your rate today — it's yours forever, no matter what happens next.
            </p>

            {/* Live subscriber counter */}
            <div style={{ maxWidth: 460, margin: "0 auto", background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: 0.5 }}>
                  {inGrace ? 'Founding subscribers' : 'Newsletter subscribers'}
                </span>
                <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream }}>
                  {subCount === null ? '—' : count.toLocaleString()}
                  {inGrace && <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>/ {GRACE}</span>}
                </span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 999, height: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.sage}, ${C.sunsetLight})`, borderRadius: 999, transition: "width 1s ease" }} />
              </div>
              <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.sunsetLight, margin: "10px 0 0", letterSpacing: 0.3 }}>
                {inGrace
                  ? `⚡ Founding rate locks in today and stays fixed while your subscription is active. After ${GRACE} readers, new listings pay more — you won't.`
                  : '⚡ New listings pay more as the audience grows. Your rate stays fixed while your subscription is active — cancel and rejoin and the current rate applies.'}
              </p>
            </div>
          </div>

          {/* Free tier — compact row */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.driftwood, marginBottom: 3 }}>Free</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream }}>$0 <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>forever</span></div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {["Name in directory", "Category & phone", "Community visibility"].map(f => (
                    <span key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      <span style={{ color: C.driftwood, fontWeight: 700 }}>✓</span>{f}
                    </span>
                  ))}
                </div>
              </div>
              <a href="/#submit" style={{ padding: "9px 22px", borderRadius: 8, border: `1.5px solid ${C.driftwood}55`, color: C.driftwood, fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}>
                Get Listed Free
              </a>
            </div>
          </div>

          {/* Paid tiers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
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
                  {inGrace ? `Founding rate · locked at sign-up` : `↑ rises with every new subscriber`}
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
                  onClick={() => { setModal({ tierId: tier.id, tierName: tier.name, price: tier.price, priceInCents: tier.priceInCents, color: tier.color }); setForm({ businessName: '', email: '' }); setCheckoutError(''); }}
                  style={{ display: "block", width: "100%", padding: "11px 0", borderRadius: 8, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", border: "none", background: tier.id === "premium" ? C.sunset : "transparent", color: tier.id === "premium" ? C.cream : tier.color, outline: tier.id === "premium" ? "none" : `1.5px solid ${tier.color}55`, transition: "all 0.22s" }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          {/* Newsletter add-on */}
          <div style={{ marginTop: 32, background: "rgba(91,126,149,0.1)", border: "1px solid rgba(91,126,149,0.22)", borderRadius: 14, padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ maxWidth: 480 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.lakeBlue, marginBottom: 8 }}>Newsletter Add-On</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.cream, margin: "0 0 10px 0" }}>Reach the inbox, not just the directory</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  The Manitou Dispatch lands directly in the inboxes of people already invested in this community. Event organizers know they can't get 2,000 engaged local eyes in a single drop — your business can.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 210 }}>
                {[
                  { label: "Mention", desc: "1-line + link in Dispatch", price: "$29/issue" },
                  { label: "Feature", desc: "Paragraph + photo + CTA", price: "$75/issue" },
                  { label: "Monthly Sponsor", desc: "Every issue that month", price: "$199/mo" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px" }}>
                    <div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: C.cream }}>{item.label}</div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.desc}</div>
                    </div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.lakeBlue, whiteSpace: "nowrap" }}>{item.price}</div>
                  </div>
                ))}
                <a href="mailto:hello@manitoubeach.com?subject=Newsletter%20Add-On%20Inquiry&body=Hi%2C%20I%27m%20interested%20in%20a%20newsletter%20add-on%20for%20my%20business.%20Please%20let%20me%20know%20next%20steps." style={{ textAlign: "center", padding: "10px", borderRadius: 8, background: "transparent", border: `1.5px solid ${C.lakeBlue}55`, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", marginTop: 4, display: "block" }}>
                  Inquire →
                </a>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 12, marginTop: 24, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
            Monthly subscriptions · Cancel anytime · Rate held while subscribed
          </p>
        </div>
      </div>

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
            </div>
            {checkoutError && <p style={{ color: "#ff6b5b", fontSize: 13, marginBottom: 14 }}>{checkoutError}</p>}
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: modal.tierId === "premium" ? C.sunset : modal.color, color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}
            >
              {loading ? "Redirecting…" : "Continue to Secure Checkout →"}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
              Powered by Stripe · Your card details are never stored here
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// 🏪  BUSINESS DIRECTORY
// ============================================================
function BusinessDirectory() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notionFree, setNotionFree] = useState([]);
  const [notionEnhanced, setNotionEnhanced] = useState([]);
  const [notionFeatured, setNotionFeatured] = useState([]);
  const [notionPremium, setNotionPremium] = useState([]);

  useEffect(() => {
    fetch("/api/businesses")
      .then(r => r.json())
      .then(data => {
        setNotionFree(data.free || []);
        setNotionEnhanced(data.enhanced || []);
        setNotionFeatured(data.featured || []);
        setNotionPremium(data.premium || []);
      })
      .catch(() => {});
  }, []);

  // Premium + Featured go into the card carousel; Enhanced + Free go into the row list
  // Directory is 100% Notion-driven
  const allBusinesses = [...notionFree, ...notionEnhanced, ...notionFeatured, ...notionPremium];
  const categories = ["All", ...Array.from(new Set(allBusinesses.map(b => b.category)))];

  const matchesSearch = (b) => {
    const q = search.toLowerCase();
    return !search ||
      b.name.toLowerCase().includes(q) ||
      (b.description || "").toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);
  };

  const filtered = allBusinesses.filter(b => {
    const matchesCat = activeCategory === "All" || b.category === activeCategory;
    return matchesCat && matchesSearch(b);
  });

  // Premium: full-width banner rows at top
  const premiumBusinesses = filtered.filter(b => b.tier === 'premium');

  // Featured cards within their category: Featured + Premium tiers get a dark spotlight card
  const featuredCardBusinesses = filtered.filter(b => b.featured || b.tier === 'featured' || b.tier === 'premium');
  const featuredByCategory = {};
  featuredCardBusinesses.forEach(b => {
    if (!featuredByCategory[b.category]) featuredByCategory[b.category] = [];
    featuredByCategory[b.category].push(b);
  });

  // ALL businesses also appear as rows within their category (additive — paid tiers get both card + row)
  // Free → compact row | Enhanced/Featured/Premium → expanded EnhancedBusinessRow
  const grouped = {};
  filtered.forEach(b => {
    if (!grouped[b.category]) grouped[b.category] = [];
    grouped[b.category].push(b);
  });

  // All categories alphabetically
  const allCategories = Array.from(new Set([
    ...Object.keys(featuredByCategory),
    ...Object.keys(grouped),
  ])).sort();

  return (
    <section id="businesses" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn direction="left">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 32 }}>
            <div>
              <SectionLabel>The Directory</SectionLabel>
              <SectionTitle>Local Businesses</SectionTitle>
            </div>
            <Btn href="/#submit" variant="outline" small>+ List Your Business (Free)</Btn>
          </div>
        </FadeIn>

        {/* Search bar */}
        <FadeIn delay={60}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: C.textMuted, pointerEvents: "none", lineHeight: 1 }}>
              ⌕
            </div>
            <input
              type="text"
              placeholder="Search businesses, services, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "14px 20px 14px 46px",
                borderRadius: 8, border: `1.5px solid ${C.sand}`,
                background: C.cream, fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 14, color: C.text, boxSizing: "border-box",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = C.sage}
              onBlur={e => e.target.style.borderColor = C.sand}
            />
          </div>
        </FadeIn>

        {/* Category pills */}
        <FadeIn delay={80}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 52 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12, fontWeight: 600, letterSpacing: 1,
                  textTransform: "uppercase", padding: "7px 16px", borderRadius: 4,
                  border: `1.5px solid ${activeCategory === cat ? (CAT_COLORS[cat] || C.sage) : C.sand}`,
                  background: activeCategory === cat ? (CAT_COLORS[cat] || C.sage) : "transparent",
                  color: activeCategory === cat ? C.cream : C.textMuted,
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Premium Partners — full-width banner rows, stacked before categories */}
        {premiumBusinesses.length > 0 && (
          <FadeIn delay={100}>
            <div style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: C.sunset, whiteSpace: "nowrap" }}>
                  Premium Partners
                </div>
                <div style={{ flex: 1, height: 1, background: C.sand }} />
              </div>
              {premiumBusinesses.map(b => <PremiumBanner key={b.id} business={b} />)}
            </div>
          </FadeIn>
        )}

        {/* Directory — category sections: featured cards on top, then all businesses as rows */}
        {allCategories.map((category, i) => {
          const catFeatured = featuredByCategory[category] || [];
          const catAll = grouped[category] || [];
          return (
            <FadeIn key={category} delay={120 + i * 10}>
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 12px 0" }}>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: CAT_COLORS[category] || C.textMuted, whiteSpace: "nowrap" }}>
                    {category}
                  </div>
                  <div style={{ flex: 1, height: 1, background: C.sand }} />
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>
                    {catAll.length}
                  </div>
                </div>
                {/* Featured spotlight cards — 3 per row, wraps to new rows as needed */}
                {catFeatured.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 14 }}>
                    {catFeatured.map(b => <FeaturedBusinessCard key={`card-${b.id}`} business={b} />)}
                  </div>
                )}
                {/* All businesses as rows — Enhanced/Featured/Premium get expanded view */}
                {catAll.map(b =>
                  (b.tier === 'enhanced' || b.tier === 'featured' || b.tier === 'premium' || b.featured)
                    ? <EnhancedBusinessRow key={`row-${b.id}`} business={b} />
                    : <BusinessRow key={`row-${b.id}`} business={b} />
                )}
              </div>
            </FadeIn>
          );
        })}

        {/* No results */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text, marginBottom: 8 }}>
              No results for "{search}"
            </div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Try a different search or browse all categories</div>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, padding: "9px 22px", borderRadius: 4, border: `1.5px solid ${C.sand}`, background: "transparent", color: C.textMuted, cursor: "pointer" }}
            >
              Clear search
            </button>
          </div>
        )}

        {/* Upgrade CTA */}
        <FadeIn delay={200}>
          <div style={{
            marginTop: 64,
            background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
            borderRadius: 12, padding: "40px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 24,
          }}>
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 10 }}>
                Get Noticed
              </div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", color: C.cream, margin: "0 0 8px 0", fontWeight: 400 }}>
                Upgrade to a Featured Listing
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 400, lineHeight: 1.7 }}>
                Top-of-directory placement, newsletter inclusion, and a business spotlight video from Holly & The Yeti.
              </p>
            </div>
            <Btn href="/featured" variant="sunset">Upgrade Your Listing</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// Featured business — compact dark card, designed for 3-per-row grid layout
function FeaturedBusinessCard({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  const tilt = useCardTilt(3);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="card-tilt featured-card-glow"
      style={{
        background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`,
        borderRadius: 12, padding: "18px 20px",
        border: "1px solid rgba(255,255,255,0.07)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      {/* Shimmer overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 12, pointerEvents: "none",
        background: `linear-gradient(110deg, transparent 30%, ${C.sunset}08 50%, transparent 70%)`,
        backgroundSize: "200% 100%", animation: "shimmer 4s ease-in-out infinite",
      }} />
      {/* Header: logo + name + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
          border: `1.5px dashed ${business.logo ? "transparent" : "rgba(255,255,255,0.18)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {business.logo
            ? <img src={business.logo} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", lineHeight: 1.4 }}>Add<br/>Logo</span>
          }
        </div>
        <div>
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, background: `${color}20`, padding: "2px 7px", borderRadius: 3, display: "inline-block", marginBottom: 4 }}>
            Featured
          </span>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 400, color: C.cream, margin: 0, lineHeight: 1.3 }}>
            {business.name}
          </h3>
        </div>
      </div>
      {/* Description */}
      {business.description && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0, flex: 1, position: "relative", zIndex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {business.description}
        </p>
      )}
      {/* Footer: phone + visit */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, position: "relative", zIndex: 1 }}>
        {business.phone && (
          <a href={`tel:${business.phone}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "'Libre Franklin', sans-serif" }}>{business.phone}</a>
        )}
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, textDecoration: "none" }}>Visit →</a>
        )}
      </div>
    </div>
  );
}

// Premium partner — full-width dark banner (stacked at top of directory)
function PremiumBanner({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
      borderRadius: 12, padding: "28px 32px",
      display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
      marginBottom: 16, border: `1px solid rgba(255,255,255,0.07)`,
    }}>
      {/* Logo */}
      <div style={{ width: 110, height: 110, borderRadius: 14, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
        {business.logo ? (
          <img src={business.logo} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 30, color: "rgba(255,255,255,0.2)" }}>{business.name[0]}</span>
        )}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunset, background: `${C.sunset}20`, padding: "3px 8px", borderRadius: 3 }}>Premium Partner</span>
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>{business.category}</span>
        </div>
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 8 }}>{business.name}</div>
        {business.description && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{business.description}</div>
        )}
        {business.address && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8, fontStyle: "italic" }}>{business.address}</div>}
      </div>
      {/* CTAs */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.cream, background: C.sunset, padding: "10px 22px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap" }}>
            Visit Website
          </a>
        )}
        {business.phone && (
          <a href={`tel:${business.phone}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{business.phone}</a>
        )}
      </div>
    </div>
  );
}

// Enhanced business row — collapses to look identical to Free row, expands on click
function EnhancedBusinessRow({ business }) {
  const [expanded, setExpanded] = useState(false);
  const color = CAT_COLORS[business.category] || C.sage;
  const tierLabel = business.tier === 'premium' ? 'Premium' : business.tier === 'featured' ? 'Featured' : 'Enhanced';

  return (
    <div style={{ borderBottom: `1px solid ${C.sand}` }}>
      {/* Collapsed header — same grid as BusinessRow */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "grid",
          gridTemplateColumns: "10px 1fr auto",
          gap: "0 20px",
          alignItems: "center",
          padding: "15px 10px",
          borderLeft: "3px solid transparent",
          marginLeft: -13,
          paddingLeft: 10,
          transition: "all 0.18s",
          borderRadius: expanded ? "0 4px 0 0" : "0 4px 4px 0",
          cursor: "pointer",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.background = `${color}08`; }}
        onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
      >
        {/* Category dot */}
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        {/* Name + tier badge + phone + address */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text, fontWeight: 400 }}>{business.name}</span>
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, background: `${color}15`, padding: "2px 7px", borderRadius: 3 }}>{tierLabel}</span>
            {business.phone && (
              <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap" }}>{business.phone}</span>
            )}
          </div>
          {business.address && (
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", opacity: 0.7 }}>{business.address}</span>
          )}
        </div>
        {/* Expand toggle */}
        <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap" }}>
          {expanded ? "Less ↑" : "More ↓"}
        </span>
      </div>

      {/* Expanded detail panel — animated ease-out */}
      <div style={{ maxHeight: expanded ? "400px" : 0, overflow: "hidden", transition: "max-height 0.5s ease-out" }}>
        <div style={{
          padding: "14px 10px 16px 27px",
          background: `${color}05`,
          borderLeft: `3px solid ${color}30`,
          marginLeft: -13,
          paddingLeft: 27,
          borderRadius: "0 0 4px 0",
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            {business.logo && (
              <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: `${color}12` }}>
                <img src={business.logo} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {business.description && (
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65, margin: "0 0 10px 0", fontFamily: "'Libre Franklin', sans-serif" }}>{business.description}</p>
              )}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sage, textDecoration: "none" }}>Visit Website →</a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: C.textMuted, textDecoration: "none" }}>{business.email}</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Regular business — compact list row
function BusinessRow({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "10px 1fr auto",
        gap: "0 20px",
        alignItems: "center",
        padding: "15px 10px",
        borderBottom: `1px solid ${C.sand}`,
        borderLeft: "3px solid transparent",
        marginLeft: -13,
        paddingLeft: 10,
        transition: "all 0.18s",
        borderRadius: "0 4px 4px 0",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.background = `${color}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
    >
      {/* Category dot */}
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />

      {/* Name + phone + address */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text, fontWeight: 400 }}>
            {business.name}
          </span>
          {business.phone && (
            <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap" }}>
              {business.phone}
            </span>
          )}
        </div>
        {business.address && (
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", opacity: 0.7 }}>
            {business.address}
          </span>
        )}
      </div>

      {/* Free tier — no website link. Upgrade to Enhanced+ to unlock. */}
      <a href="#listing-tiers" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, color: C.driftwood, textDecoration: "none", whiteSpace: "nowrap", opacity: 0.65 }}>
        Upgrade →
      </a>
    </div>
  );
}

// ============================================================
// 🎙️  HOLLY & THE YETI
// ============================================================
export function HollyYetiSection() {
  const [videoSpotlight, setVideoSpotlight] = useState(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => setVideoSpotlight(data.videoSpotlight || null))
      .catch(() => {});
  }, []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match?.[1] || null;
  };

  const videoId = videoSpotlight ? getYouTubeId(videoSpotlight.videoUrl) : '6Kjt2pNsdH0';
  const videoLabel = videoSpotlight
    ? `${videoSpotlight.name} — Sponsored Content`
    : 'Devils Lake Tip-Up Wrap Up — Holly & The Yeti';

  return (
    <section id="holly" style={{
      backgroundImage: "url(/images/holly-yeti-bg.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      padding: "100px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(12,20,26,0.75)", zIndex: 0 }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* 2×2 grid on desktop → single column on mobile via holly-grid class */}
        <div className="holly-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto auto",
          gap: 32,
        }}>

          {/* TOP LEFT — Text (frosted glass panel) */}
          <FadeIn direction="left">
            <div style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: 18,
              padding: "44px 40px",
              height: "100%",
              boxSizing: "border-box",
            }}>
              <SectionLabel light>The Voices of the Lake</SectionLabel>
              <h2 style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 400,
                color: C.cream,
                lineHeight: 1.1,
                margin: "0 0 20px 0",
              }}>
                Holly &<br />The Yeti
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.85, marginBottom: 14 }}>
                A local realtor with straight-shooter expertise and an Australian-accented community character with a flair for comedy walk into a podcast...
              </p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.85, marginBottom: 32 }}>
                Holly Griewahn brings the real estate knowledge and market insight. The Yeti brings the AI-generated videos and the stories that make Manitou Beach feel like the community it actually is.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn href="https://www.youtube.com/@HollyandtheYetipodcast" variant="sunset" target="_blank" rel="noopener noreferrer">Watch on YouTube</Btn>
                <Btn href="https://www.facebook.com/HollyandtheYeti" variant="outlineLight" target="_blank" rel="noopener noreferrer">Facebook</Btn>
                <Btn href="https://m.me/HollyandtheYeti" variant="outlineLight" target="_blank" rel="noopener noreferrer">Message Holly</Btn>
              </div>
            </div>
          </FadeIn>

          {/* TOP RIGHT — Portrait */}
          <FadeIn delay={80} direction="right">
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", height: "100%" }}>
              <img
                src="/images/holly_yeti.png"
                alt="Holly and The Yeti"
                style={{ width: "100%", maxWidth: 300, display: "block", objectFit: "contain" }}
              />
            </div>
          </FadeIn>

          {/* BOTTOM LEFT — YouTube video (supports Sponsored Video Spotlight promo) */}
          <FadeIn delay={160} direction="left">
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: videoSpotlight ? C.sunsetLight : "rgba(255,255,255,0.25)", marginBottom: 12 }}>
                {videoSpotlight ? "Sponsored Content" : "Watch"}
              </div>
              <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", boxShadow: "0 16px 60px rgba(0,0,0,0.55)", border: videoSpotlight ? `2px solid ${C.sunset}40` : "none" }}>
                {videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13 }}>
                    Video coming soon
                  </div>
                )}
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
                {videoLabel}
              </div>
            </div>
          </FadeIn>

          {/* BOTTOM RIGHT — Social cards (frosted glass) */}
          <FadeIn delay={200} direction="right">
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
                Follow Along
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { platform: "YouTube", handle: "@HollyandtheYetipodcast", desc: "Full episodes, community highlights, and business spotlights.", icon: "▶", href: "https://www.youtube.com/@HollyandtheYetipodcast", color: "#FF4444" },
                  { platform: "Facebook", handle: "HollyandtheYeti", desc: "Community updates, event news, and behind-the-scenes moments.", icon: "f", href: "https://www.facebook.com/HollyandtheYeti", color: "#4A90D9" },
                  { platform: "Instagram", handle: "@hollyandtheyeti", desc: "Lake life photos, short clips, and the occasional cryptid sighting.", icon: "◎", href: "https://www.instagram.com/hollyandtheyeti", color: "#C45FA0" },
                ].map(s => (
                  <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", gap: 14, alignItems: "center",
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    textDecoration: "none",
                    transition: "all 0.22s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.borderColor = `${s.color}50`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                      background: `${s.color}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, color: s.color,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 13, color: C.cream }}>{s.platform}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>{s.handle}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

// ============================================================
// 🏡  LIVING HERE
// ============================================================
function LivingSection() {
  const items = [
    {
      title: "Buy or Sell",
      desc: "Holly Griewahn at Foundation Realty knows this lake like the back of her hand. Whether you're buying lakefront or selling your cottage, she's your person.",
      cta: "Talk to Holly", href: "#businesses",
    },
    {
      title: "Short-Term Rentals",
      desc: "Weekend getaway? The area has seasonal cottage rentals, lakefront homes, and the kind of view that makes you want to stop renting and start buying.",
      cta: "Browse Stays", href: "#businesses",
    },
    {
      title: "Year-Round Life",
      desc: "Manitou Beach isn't just a summer destination. Ice fishing, quiet winters, and a tight-knit community that actually knows each other's names.",
      cta: "Explore Devils Lake", href: "/devils-lake",
    },
    {
      title: "Lake Access Magazine",
      desc: "Our regional media partner covering lake communities across Michigan. Find more lake towns, listings, and lake life. Use code HOLLY or YETI for 10% off your subscription.",
      cta: "Visit Lake Access", href: "https://lake-access.com/", external: true,
    },
  ];

  return (
    <section id="living" style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Relocate & Stay</SectionLabel>
          <SectionTitle>Living Here</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, maxWidth: 500, margin: "0 0 56px 0", lineHeight: 1.75 }}>
            Whether you're visiting for a weekend or ready to make the lake your permanent address — here's what you need to know.
          </p>
        </FadeIn>

        {/* Magazine layout: hero card + 3 smaller */}
        <FadeIn direction="scale">
          <div
            style={{
              background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
              borderRadius: 16, padding: "48px 44px",
              marginBottom: 20, position: "relative", overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: `${C.sage}08`, pointerEvents: "none" }} />
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 3.5vw, 36px)", color: C.cream, margin: "0 0 14px 0", fontWeight: 400 }}>
              {items[0].title}
            </h3>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 28px 0", maxWidth: 520 }}>
              {items[0].desc}
            </p>
            <a href={items[0].href} className="link-hover-underline" style={{
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700,
              letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight, textDecoration: "none",
            }}>
              {items[0].cta} →
            </a>
          </div>
        </FadeIn>

        <div className="mobile-col-1 living-here-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {items.slice(1).map((item, i) => {
            const tilt = useCardTilt(4);
            return (
              <FadeIn key={i} delay={i * 100} direction={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                <div
                  ref={tilt.ref}
                  onMouseMove={tilt.onMouseMove}
                  onMouseLeave={tilt.onMouseLeave}
                  className="card-tilt"
                  style={{
                    background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 14,
                    padding: "28px 26px 26px", display: "flex", flexDirection: "column", height: "100%",
                  }}
                >
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, margin: "0 0 12px 0", fontWeight: 700 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 24px 0", flex: 1 }}>
                    {item.desc}
                  </p>
                  <a href={item.href} target={item.external ? "_blank" : "_self"} rel={item.external ? "noopener noreferrer" : undefined}
                    className="link-hover-underline"
                    style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sage, textDecoration: "none" }}
                  >
                    {item.cta} →
                  </a>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 📝  SUBMISSION FORM
// ============================================================
// Client-side image compression
export async function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
        resolve({ base64, filename: file.name.replace(/\.[^.]+$/, ".jpg") });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function SubmitSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", phone: "", address: "", website: "", email: "", description: "", logoUrl: "", tier: "Free", duration: "1", newsletter: false, _hp: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      let logoUploadUrl = null;
      if (logoFile) {
        const { base64, filename } = await compressImage(logoFile, 600, 0.85);
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64, filename: `logo-${filename}`, contentType: "image/jpeg" }),
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) logoUploadUrl = uploadData.url;
      }

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logoUrl: logoUploadUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message && err.message !== "Submission failed"
        ? err.message
        : "Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const input = (field, placeholder, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      autoComplete="off"
      data-lpignore="true"
      data-form-type="other"
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 6,
        border: `1.5px solid ${C.sand}`,
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 14,
        color: C.text,
        background: C.cream,
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = C.sage}
      onBlur={e => e.target.style.borderColor = C.sand}
    />
  );

  return (
    <section id="submit" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Get Listed</SectionLabel>
          <SectionTitle>Submit Your Listing</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.75, marginBottom: 36 }}>
            Free listings for all Manitou Beach and Devils Lake area businesses. Featured placement available for businesses wanting top-of-directory visibility.
          </p>

          {submitted ? (
            <div style={{
              background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
              borderRadius: 12,
              padding: "40px 32px",
              textAlign: "center",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: `${C.sage}30`, border: `2px solid ${C.sage}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 22, color: C.sage,
              }}>✓</div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, marginBottom: 12, fontWeight: 400 }}>
                You're in the directory.
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 28px 0", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                We review every submission before it goes live — usually within 48 hours. If you're interested in an upgraded listing, we'll reach out with details.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12, fontWeight: 600, letterSpacing: 1.5,
                  textTransform: "uppercase", padding: "10px 24px",
                  borderRadius: 4, border: `1.5px solid rgba(255,255,255,0.2)`,
                  background: "transparent", color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                }}
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <>

                  {input("name", "Business Name")}
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 6,
                      border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 14, color: form.category ? C.text : C.textMuted,
                      background: C.cream, boxSizing: "border-box", outline: "none",
                      appearance: "none", cursor: "pointer", transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = C.sage}
                    onBlur={e => e.target.style.borderColor = C.sand}
                  >
                    <option value="" disabled>Category</option>
                    <option>Food & Drink</option>
                    <option>Events & Venues</option>
                    <option>Stays & Rentals</option>
                    <option>Boating & Water</option>
                    <option>Breweries & Wineries</option>
                    <option>Shopping & Gifts</option>
                    <option>Home Services</option>
                    <option>Health & Beauty</option>
                    <option>Real Estate</option>
                    <option>Creative Media</option>
                    <option>Pet Services</option>
                    <option>Other</option>
                  </select>
                  {input("phone", "Phone Number", "tel")}
                  {input("address", "Address (optional)")}
                  {input("website", "Website (e.g. yetigroove.com)")}
                  {input("email", "Your Email", "email")}
                  <textarea
                    placeholder="Brief description (2-3 sentences)"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 6,
                      border: `1.5px solid ${C.sand}`,
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 14,
                      color: C.text,
                      background: C.cream,
                      resize: "vertical",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = C.sage}
                    onBlur={e => e.target.style.borderColor = C.sand}
                  />
                  {/* Tier selector */}
                  <div>
                    <select
                      value={form.tier}
                      onChange={e => setForm(f => ({ ...f, tier: e.target.value, duration: "1" }))}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 6,
                        border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
                        fontSize: 14, color: C.text, background: C.cream,
                        boxSizing: "border-box", outline: "none", appearance: "none", cursor: "pointer",
                      }}
                      onFocus={e => e.target.style.borderColor = C.sage}
                      onBlur={e => e.target.style.borderColor = C.sand}
                    >
                      <option value="Free">Free — $0 · Name, category & phone</option>
                      <option value="Enhanced">Enhanced — $9/mo · + Website link & description</option>
                      <option value="Featured">Featured — $23/mo · + Spotlight card & logo</option>
                      <option value="Premium">Premium — $43/mo · + Full banner & top placement</option>
                    </select>
                  </div>

                  {/* Duration — only for paid tiers */}
                  {form.tier !== "Free" && (
                    <div>
                      <select
                        value={form.duration}
                        onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: 6,
                          border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
                          fontSize: 14, color: C.text, background: C.cream,
                          boxSizing: "border-box", outline: "none", appearance: "none", cursor: "pointer",
                        }}
                        onFocus={e => e.target.style.borderColor = C.sage}
                        onBlur={e => e.target.style.borderColor = C.sand}
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                          <option key={n} value={String(n)}>
                            {n} {n === 1 ? "month" : "months"}{n >= 6 ? " · Best value" : ""}
                          </option>
                        ))}
                      </select>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, marginTop: 6, paddingLeft: 2 }}>
                        Total: ${({ Free: 0, Enhanced: 9, Featured: 23, Premium: 43 }[form.tier] * parseInt(form.duration)).toLocaleString()} · We'll confirm and invoice before going live
                      </div>
                    </div>
                  )}

                  {/* Logo upload — drag & drop, compressed, Vercel Blob */}
                  <div>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 8, letterSpacing: 0.5 }}>
                      Logo (optional · displayed on Featured & Premium tiers)
                    </div>
                    <div
                      onDragEnter={e => { e.preventDefault(); setIsLogoDragging(true); }}
                      onDragOver={e => { e.preventDefault(); setIsLogoDragging(true); }}
                      onDragLeave={() => setIsLogoDragging(false)}
                      onDrop={e => {
                        e.preventDefault();
                        setIsLogoDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (!file || !file.type.startsWith("image/")) return;
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setLogoPreview(ev.target.result);
                        reader.readAsDataURL(file);
                      }}
                      style={{
                        border: `1.5px dashed ${isLogoDragging ? C.sage : C.sand}`,
                        borderRadius: 8, padding: "14px",
                        background: isLogoDragging ? "rgba(122,142,114,0.06)" : C.cream,
                        textAlign: "center", transition: "all 0.2s",
                      }}
                    >
                      {logoPreview ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img src={logoPreview} alt="Logo preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, objectFit: "contain", display: "block" }} />
                          <button
                            type="button"
                            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                            style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, lineHeight: 1 }}
                          >×</button>
                        </div>
                      ) : (
                        <label style={{ cursor: "pointer", display: "block" }}>
                          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, marginBottom: 4 }}>
                            {isLogoDragging ? "Drop to upload" : "Drag & drop logo or click to upload"}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted, opacity: 0.6 }}>
                            Square image recommended · JPG or PNG · auto-compressed
                          </div>
                          <input
                            type="file" accept="image/*"
                            onChange={e => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setLogoFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => setLogoPreview(ev.target.result);
                              reader.readAsDataURL(file);
                            }}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "14px 16px", background: `${C.sage}0D`, border: `1px solid ${C.sage}25`, borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={e => setForm(f => ({ ...f, newsletter: e.target.checked }))}
                      style={{ marginTop: 2, accentColor: C.sage }}
                    />
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                      Subscribe to the Manitou Beach newsletter — local events, business spotlights & lake life
                    </div>
                  </label>
              </>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "15px 32px",
                  borderRadius: 6,
                  border: "none",
                  background: submitting ? C.driftwood : C.sage,
                  color: C.cream,
                  cursor: submitting ? "not-allowed" : "pointer",
                  width: "100%",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => { if (!submitting) e.target.style.opacity = "0.85"; }}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                {submitting ? "Sending…" : "Submit Business"}
              </button>

              {/* Honeypot — hidden from humans, bots fill it automatically */}
              <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form._hp} onChange={e => setForm(f => ({ ...f, _hp: e.target.value }))} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />

              {submitError && (
                <p style={{ fontSize: 13, color: "#c0392b", textAlign: "center", margin: 0 }}>{submitError}</p>
              )}

              <p style={{ fontSize: 11, color: C.textMuted, textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                Free listings are reviewed within 48 hours. No spam, no fees unless you upgrade.
              </p>
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", margin: 0 }}>
                Have an event? <a href="/promote" style={{ color: C.sage, textDecoration: "none", fontWeight: 600 }}>List it on the promote page →</a>
              </p>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================
// ℹ️  ABOUT
// ============================================================
function AboutSection() {
  return (
    <section id="about" style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <FadeIn>
            <SectionLabel>The Story</SectionLabel>
            <SectionTitle>About This Platform</SectionTitle>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 20 }}>
              Manitou Beach, Michigan sits on Devils Lake in the Irish Hills. Locals call it "the party lake" — and anyone who's spent a summer here knows why. But for all the personality, the community didn't have a central digital home.
            </p>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 20 }}>
              This platform is that home. A directory for local businesses, a calendar for community events, and a newsletter that keeps the lake life going year-round — built by people who actually live here. And when we say "here," we mean all of it — Devils Lake, Round Lake, and every address in between.
            </p>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 36 }}>
              (And yes — we're fully aware the name "Manitou Beach" is an ironic masterpiece given that there's no actual beach. We've all made peace with it.)
            </p>
            <Btn onClick={() => {}} variant="dark">Get in Touch</Btn>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{
                background: C.warmWhite,
                border: `1px solid ${C.sand}`,
                borderRadius: 10,
                padding: "28px",
              }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 10, fontWeight: 700 }}>
                  Holly Griewahn
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 12, fontWeight: 600 }}>
                  Foundation Realty · Manitou Beach
                </div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                  Local real estate expert and co-host of Holly & The Yeti. If you're buying or selling on Devils Lake, she's the person with the keys.
                </p>
                <a href="#businesses" style={{ fontSize: 12, fontWeight: 700, color: C.sage, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif" }}>
                  View Listings →
                </a>
              </div>

              <div style={{
                background: C.warmWhite,
                border: `1px solid ${C.sand}`,
                borderRadius: 10,
                padding: "28px",
              }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 10, fontWeight: 700 }}>
                  Lake Access Magazine
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.lakeBlue, marginBottom: 12, fontWeight: 600 }}>
                  Regional Media Partner
                </div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                  Covering lake communities across Michigan. Manitou Beach is one part of a much bigger lake life story.
                </p>
                <a href="https://lake-access.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: C.lakeBlue, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif" }}>
                  Visit Lake Access →
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 🔻  FOOTER
// ============================================================
export function FooterNewsletterModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDone(true);
    } catch { setError("Something went wrong — try again."); }
    finally { setSubmitting(false); }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.dusk, borderRadius: 16, padding: "40px 36px", maxWidth: 440, width: "100%", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sage, marginBottom: 6 }}>The Manitou Beach Dispatch</div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 24px 0" }}>Weekly events, local businesses, and community news — straight to your inbox. Free.</p>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.cream, marginBottom: 6 }}>You're in!</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Check your inbox for a confirmation email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ flex: 1, minWidth: 180, padding: "11px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: C.cream, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: "none" }} />
            <button type="submit" disabled={submitting} style={{ padding: "11px 22px", background: C.sage, color: C.cream, border: "none", borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? "..." : "Subscribe"}
            </button>
            {error && <div style={{ width: "100%", fontSize: 12, color: C.sunset, marginTop: 4 }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

export function Footer({ scrollTo }) {
  const [showNewsletter, setShowNewsletter] = useState(false);
  return (
    <>
    {showNewsletter && <FooterNewsletterModal onClose={() => setShowNewsletter(false)} />}
    <footer style={{ background: C.night, padding: "64px 24px 36px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 4 }}>
              Manitou Beach
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              on Devils Lake, Michigan
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, margin: 0 }}>
              Community platform for Manitou Beach and the Devils Lake area.
            </p>
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              Navigate
            </div>
            {SECTIONS.map(({ id, label }) => (
              <div key={id} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => scrollTo(id)}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 13, cursor: "pointer", padding: 0,
                    fontFamily: "'Libre Franklin', sans-serif",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.color = C.sunsetLight}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                >
                  {label}
                </button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              Connect
            </div>
            {[
              { label: "Facebook", href: "https://www.facebook.com/HollyandtheYeti" },
              { label: "YouTube", href: "https://www.youtube.com/@HollyandtheYetipodcast" },
              { label: "Instagram", href: "https://www.instagram.com/hollyandtheyeti" },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 8 }}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", fontFamily: "'Libre Franklin', sans-serif", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = C.sunsetLight}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                >
                  {l.label}
                </a>
              </div>
            ))}
            <div style={{ marginBottom: 8 }}>
              <button
                onClick={() => setShowNewsletter(true)}
                style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.sunsetLight}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                Newsletter
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              For Businesses
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.75, margin: "0 0 16px 0" }}>
              Free directory listing. Upgrade for featured placement, newsletter mentions, and video content.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href="/featured"
                style={{
                  display: "inline-block",
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "9px 20px",
                  borderRadius: 4,
                  background: `${C.sunset}20`,
                  border: `1px solid ${C.sunset}40`,
                  color: C.sunsetLight,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                Get Featured →
              </a>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif" }}>
              © {new Date().getFullYear()} Yeti Groove Media LLC
            </div>
            <a href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>Privacy</a>
            <a href="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>Terms</a>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.15)" }}>
            No beach. Still worth it. 🏕️
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
            Powered by{" "}
            <a
              href="https://yetigroovemedia.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = C.sunsetLight}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
            >
              Yeti Groove Media
            </a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}

// ============================================================
// 🧭  NAVBAR
// ============================================================
export function Navbar({ activeSection, scrollTo, isSubPage = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [comOpen, setComOpen] = useState(false);
  const comRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 960) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close community dropdown on outside click
  useEffect(() => {
    const close = (e) => { if (comRef.current && !comRef.current.contains(e.target)) setComOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const solid = scrollY > 60 || menuOpen;

  const handleNavClick = (id) => {
    setMenuOpen(false);
    if (id === "happening") { window.location.href = "/happening"; return; }
    if (id === "devils-lake") { window.location.href = "/devils-lake"; return; }
    if (id === "mens-club") { window.location.href = "/mens-club"; return; }
    if (id === "ladies-club") { window.location.href = "/ladies-club"; return; }
    if (id === "historical-society") { window.location.href = "/historical-society"; return; }
    if (id === "round-lake") { window.location.href = "/round-lake"; return; }
    if (id === "village") { window.location.href = "/village"; return; }
    if (id === "wineries") { window.location.href = "/wineries"; return; }
    if (isSubPage) {
      window.location.href = "/#" + id;
      return;
    }
    scrollTo(id);
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: solid ? "10px 0" : "18px 0",
        background: solid ? "rgba(250,246,239,0.55)" : "transparent",
        backdropFilter: solid ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: solid ? "blur(20px) saturate(160%)" : "none",
        borderBottom: solid ? `1px solid rgba(122,142,114,0.2)` : "none",
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }} onClick={() => handleNavClick("home")}>
            <img src="/images/manitou_beach_icon.png" alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", opacity: solid ? 1 : 0.85, transition: "opacity 0.35s" }} />
            <div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: solid ? C.dusk : C.cream, transition: "color 0.35s" }}>
                Manitou Beach
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: solid ? C.textMuted : "rgba(255,255,255,0.5)", marginTop: -2, transition: "color 0.35s" }}>
                on Devils Lake
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 2, alignItems: "center", "@media(max-width:768px)": { display: "none" } }} className="nav-desktop">
            {SECTIONS.filter(s => s.id !== "home").map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                style={{
                  background: activeSection === id ? `${C.sage}18` : "transparent",
                  border: "none",
                  color: activeSection === id ? C.sageDark : solid ? C.text : "rgba(255,255,255,0.7)",
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12,
                  fontWeight: activeSection === id ? 700 : 500,
                  letterSpacing: 0.5,
                  padding: "7px 13px",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
                onMouseLeave={e => { e.currentTarget.style.color = activeSection === id ? C.sageDark : solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = activeSection === id ? `${C.sage}18` : "transparent"; }}
              >
                {label}
              </button>
            ))}
            {/* Dispatch link */}
            <button
              onClick={() => { window.location.href = "/dispatch"; }}
              style={{
                background: "transparent", border: "none",
                color: solid ? C.text : "rgba(255,255,255,0.7)",
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: 0.5, padding: "7px 13px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
            >
              Blog
            </button>

            {/* Local Guide link */}
            <button
              onClick={() => { window.location.href = "/discover"; }}
              style={{
                background: "transparent", border: "none",
                color: solid ? C.text : "rgba(255,255,255,0.7)",
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: 0.5, padding: "7px 13px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
            >
              Local Guide
            </button>

            {/* Community dropdown */}
            <div ref={comRef} style={{ position: "relative" }}>
              <button
                onClick={() => setComOpen(o => !o)}
                style={{
                  background: comOpen ? `${C.sage}18` : "transparent",
                  border: "none", color: solid ? C.text : "rgba(255,255,255,0.7)",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: 0.5,
                  padding: "7px 13px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
                onMouseLeave={e => { if (!comOpen) { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; } }}
              >
                Community ▾
              </button>
              {comOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, marginTop: 6,
                  background: "rgba(250,246,239,0.98)", backdropFilter: "blur(14px)",
                  borderRadius: 10, border: `1px solid ${C.sand}`, boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
                  padding: "8px 0", minWidth: 200, zIndex: 1001,
                }}>
                  {[
                    { label: "Holly & The Yeti", href: "/#holly" },
                    { label: "Food Truck Locator", href: "/food-trucks" },
                    { label: "Devils Lake", id: "devils-lake" },
                    { label: "Round Lake", href: "/round-lake" },
                    { label: "The Village", href: "/village" },
                    { label: "Wineries & Breweries", href: "/wineries" },
                    { label: "Men's Club", id: "mens-club" },
                    { label: "Ladies Club", id: "ladies-club" },
                    { label: "Historical Society", id: "historical-society" },
                    { label: "Gallery ↗", href: "https://photogallery.yetigroove.com/folder/muVgmuXuvFwI/", external: true },
                    ...(USA250_PUBLIC ? [{ label: "🇺🇸 USA 250th Fireworks", href: "/usa250" }] : []),
                  ].map((link, i) => (
                    link.href ? (
                      <a key={i} href={link.href} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{
                        display: "block", padding: "10px 18px", fontSize: 13, color: C.text,
                        textDecoration: "none", fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.15s",
                      }} onMouseEnter={e => e.currentTarget.style.background = `${C.sage}10`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {link.label}
                      </a>
                    ) : (
                      <button key={i} onClick={() => { setComOpen(false); handleNavClick(link.id); }} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "10px 18px", fontSize: 13, color: C.text,
                        background: "none", border: "none", cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.15s",
                      }} onMouseEnter={e => e.currentTarget.style.background = `${C.sage}10`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {link.label}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginLeft: 8, display: "flex", gap: 8 }}>
              <Btn href="/featured" variant="primary" small style={{ minWidth: 152, textAlign: "center", whiteSpace: "nowrap" }}>List Your Business</Btn>
              <Btn href="/promote" variant="sunset" small style={{ minWidth: 152, textAlign: "center", whiteSpace: "nowrap" }}>List Your Event</Btn>
            </div>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="nav-hamburger"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              flexDirection: "column",
              gap: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block",
                width: 22,
                height: 2,
                background: solid ? C.dusk : C.cream,
                borderRadius: 2,
                transition: "all 0.25s ease",
                transformOrigin: "center",
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                  : i === 2 ? "rotate(-45deg) translate(5px, -5px)"
                  : "scaleX(0)"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999,
        background: "rgba(250,246,239,0.98)",
        backdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s ease",
      }}>
        {SECTIONS.filter(s => s.id !== "home").map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleNavClick(id)}
            style={{
              background: "none",
              border: "none",
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 24,
              fontWeight: 400,
              color: activeSection === id ? C.sage : C.text,
              cursor: "pointer",
              padding: "12px 32px",
              letterSpacing: 0.5,
            }}
          >
            {label}
          </button>
        ))}
        {/* Blog link — mobile */}
        <button onClick={() => { setMenuOpen(false); window.location.href = "/dispatch"; }} style={{
          background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
          fontSize: 24, fontWeight: 400, color: C.text, cursor: "pointer", padding: "12px 32px",
        }}>
          Blog
        </button>
        {/* Local Guide link — mobile */}
        <button onClick={() => { setMenuOpen(false); window.location.href = "/discover"; }} style={{
          background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
          fontSize: 24, fontWeight: 400, color: C.text, cursor: "pointer", padding: "12px 32px",
        }}>
          Local Guide
        </button>

        {/* Community sub-links */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginTop: 8, fontFamily: "'Libre Franklin', sans-serif" }}>Community</div>
        {[
          { label: "Holly & The Yeti", href: "/#holly" },
          { label: "Food Truck Locator", href: "/food-trucks" },
          { label: "Devils Lake", id: "devils-lake" },
          { label: "Round Lake", id: "round-lake" },
          { label: "The Village", id: "village" },
          { label: "Wineries & Breweries", id: "wineries" },
          { label: "Men's Club", id: "mens-club" },
          { label: "Ladies Club", id: "ladies-club" },
          { label: "Historical Society", id: "historical-society" },
        ].map(link => (
          link.href ? (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 20, fontWeight: 400, color: C.text,
              textDecoration: "none", padding: "8px 32px", display: "block",
            }}>
              {link.label}
            </a>
          ) :
          <button key={link.id} onClick={() => handleNavClick(link.id)} style={{
            background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
            fontSize: 20, fontWeight: 400, color: C.text, cursor: "pointer", padding: "8px 32px",
          }}>
            {link.label}
          </button>
        ))}
        <a
          href="https://photogallery.yetigroove.com/folder/muVgmuXuvFwI/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 20, fontWeight: 400, color: C.textLight,
            textDecoration: "none", padding: "10px 32px", display: "block",
          }}
        >
          Gallery ↗
        </a>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <Btn href="/featured" variant="primary" style={{ width: 200, textAlign: "center", whiteSpace: "nowrap" }}>List Your Business</Btn>
          <Btn href="/promote" variant="sunset" style={{ width: 200, textAlign: "center", whiteSpace: "nowrap" }}>List Your Event</Btn>
        </div>
      </div>

      {/* Responsive styles handled by GlobalStyles */}
    </>
  );
}

// ============================================================
// 📅  /happening — FULL PAGE
// ============================================================
export function EventLightbox({ event, onClose }) {
  if (!event) return null;
  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };
  const color = eventCatColors[event.category] || C.sage;
  const isRecurring = event.recurring === 'Weekly' || event.recurring === 'Monthly';
  const isAnnual = event.recurring === 'Annual';
  const dateDisplay = isRecurring
    ? `Every ${event.recurringDay || "Week"}`
    : (() => {
        try {
          return new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        } catch { return event.date; }
      })();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(10,18,24,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`,
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16, padding: "36px",
          maxWidth: 520, width: "100%",
          maxHeight: "85vh", overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 24, cursor: "pointer" }}
        >×</button>

        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.name} style={{ display: "block", maxWidth: "100%", maxHeight: 220, width: "auto", margin: "0 auto 20px", objectFit: "contain", borderRadius: 10 }} />
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <CategoryPill dark>{event.category}</CategoryPill>
          {event.cost && (
            <span style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11, fontWeight: 600, letterSpacing: 1,
              color: event.cost === "Free" || event.cost === "Free to watch" ? C.sage : C.sunsetLight,
              textTransform: "uppercase",
            }}>
              {event.cost}
            </span>
          )}
          {isAnnual && (
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, color: C.lakeBlue, textTransform: "uppercase" }}>
              ● Annual Event
            </span>
          )}
        </div>

        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 4vw, 32px)", color: C.cream, margin: "14px 0 10px 0", fontWeight: 400, lineHeight: 1.2 }}>
          {event.name}
        </h2>

        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color, marginBottom: 16 }}>
          {dateDisplay}
          {!isRecurring && event.dateEnd && ` — ${new Date(event.dateEnd + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
        </div>

        {(event.time || event.location) && (
          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
            {event.time && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin', sans-serif" }}>
                🕐 {event.time}
              </div>
            )}
            {event.location && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin', sans-serif" }}>
                📍 {event.location}
              </div>
            )}
          </div>
        )}

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 20px 0" }}>
          {event.description}
        </p>

        {event.eventUrl && (
          <a
            href={event.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", color: C.cream,
              background: C.sunset, padding: "10px 22px",
              borderRadius: 6, textDecoration: "none",
            }}
          >
            Get Tickets / More Info →
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🚚  LIVE FOOD TRUCK STRIP (home page — shows only when a truck has checked in within 12h)
function LiveFoodTruckStrip() {
  const [liveTrucks, setLiveTrucks] = useState([]);
  useEffect(() => {
    fetch('/api/food-trucks')
      .then(r => r.json())
      .then(data => {
        const now = Date.now();
        const live = (data.trucks || []).filter(t =>
          t.lastCheckin && (now - new Date(t.lastCheckin).getTime()) < 12 * 60 * 60 * 1000
        );
        setLiveTrucks(live);
      })
      .catch(() => {});
  }, []);

  if (liveTrucks.length === 0) return null;

  return (
    <div style={{ background: C.sunset, padding: "9px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.9)", animation: "dot-breathe 2s ease-in-out infinite", color: "#fff" }} />
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>Live nearby</span>
        </div>
        <span style={{ color: "#fff", fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 500 }}>
          {liveTrucks.map(t => t.name).join(' · ')}
        </span>
        <a href="/food-trucks" style={{ marginLeft: "auto", color: "#fff", fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textDecoration: "none", opacity: 0.85, whiteSpace: "nowrap", flexShrink: 0 }}>
          Find them →
        </a>
      </div>
    </div>
  );
}

// 🏠  HOME PAGE
// ============================================================
function HomePage() {
  const [activeSection, setActiveSection] = useState("home");

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection={activeSection} scrollTo={scrollTo} />
      <Hero scrollTo={scrollTo} />
      <FeaturedEventsStrip />
      <LiveFoodTruckStrip />
      <EventTicker />
      <NewsletterBar />
      <WaveDivider topColor={C.dusk} bottomColor={C.dusk} />
      <HappeningSection />
      <PromoBanner page="Home" />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />
      <ExploreSection />
      <DispatchPreviewSection />
      <NewsletterInline />
      <div style={{ textAlign: "center", padding: "8px 24px 40px" }}>
        <Btn onClick={() => window.open("https://maps.google.com/?q=Manitou+Beach+Michigan+49267", "_blank")} variant="dark">Get Directions</Btn>
      </div>
      <BusinessDirectory />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.night} />
      <HollyYetiSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <LivingSection />
      <AboutSection />
      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="home" />
      <Footer scrollTo={scrollTo} />
    </div>
  );
}



// ============================================================
// ⭐  FEATURED BUSINESS — SALES PAGE + STRIPE CHECKOUT



// ============================================================
// 📣  PROMOTE PAGE (/promote)
// ============================================================
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
];


const PROMO_PAGES = ["Home", "Whats Happening", "Village", "Devils Lake", "Wineries", "Fishing", "Round Lake"];

// ─── /advertise ──────────────────────────────────────────────────────────────

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



// ============================================================
// 📰  THE MANITOU DISPATCH — BLOG / NEWSLETTER ARCHIVE
// ============================================================

export const CATEGORY_COLORS = {
  'Lake Life':       C.lakeBlue,
  'Community':       '#D4845A',
  'Community News':  '#D4845A',
  'Events':          '#E07B39',
  'Real Estate':     '#5B8A6E',
  'Food & Drink':    '#C06FA0',
  'History':         '#8B7355',
  'Local History':   '#8B7355',
  'Recreation':      C.sage,
  'Seasonal Tips':   C.sage,
  'Hollys Corner':   '#C06FA0',
  "Holly's Corner":  '#C06FA0',
  'PSA':             '#C0392B',
  'Advertorial':     '#7D6EAA',
};

// ============================================================
// 📢  AD SLOTS — Dispatch blog advertising
// ============================================================

export function useDispatchAds(page) {
  const [slots, setSlots] = useState({});
  useEffect(() => {
    fetch(`/api/dispatch-ads?page=${page}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots || {}))
      .catch(() => {});
  }, [page]);
  return slots;
}

// Pick a random ad from the slot array (for rotation)
export function pickAd(slotAds) {
  if (!slotAds || !slotAds.length) return null;
  return slotAds[Math.floor(Math.random() * slotAds.length)];
}


// ── Dispatch Card Sponsors ──────────────────────────────────────────────────────
// Add/remove sponsors here. Rotates across cards by index.
// logo: path in /public (e.g. '/images/blackbird-logo.png'), or null → shows 📷 placeholder
// Set array to [] to hide all sponsor strips.
export const DISPATCH_CARD_SPONSORS = [
  {
    name: 'Blackbird Cafe & Baking Co.',
    logo: '/images/blackbird-logo.png',
    offerText: 'Free cookie for new subscribers',
  },
];

// ============================================================
// 📰  DISPATCH PREVIEW — Homepage 3-card teaser


// ============================================================
// 🛠️  YETI ADMIN — AI Article Writer (unlisted, /yeti-admin)
// ============================================================
export const DISPATCH_CATEGORIES = ['Lake Life', 'Community', 'Events', 'Real Estate', 'Food & Drink', 'History', 'Recreation', 'Seasonal Tips', "Holly's Corner", 'Advertorial'];

// ─── Review Capture — Business Config ────────────────────────────────────────
// Add a key per business slug (matches /claim/:slug URL)
const CLAIM_BUSINESSES = {
  cafe: {
    name: 'Blackbird Cafe & Baking Company',
    offerText: 'free cookie',
    descLine: 'A welcome gift from The Manitou Dispatch',
    emoji: '☕',
    accentColor: '#D4845A',
    reviewUrl: 'https://www.yelp.com/writeareview/biz/BV2J5pWMspuXAU78MeQo_A?return_url=%2Fbiz%2FBV2J5pWMspuXAU78MeQo_A&review_origin=biz-details-war-button',
  },
};




// ============================================================
// 🎤  VOICE WIDGET — Vapi + ElevenLabs
// ============================================================
export const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
export const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

export const SITE_KNOWLEDGE = `
ABOUT MANITOU BEACH & DEVILS LAKE:
Manitou Beach, Michigan sits on Devils Lake in the Irish Hills — locals call it "the party lake." Devils Lake is 1,330 acres with 600+ boat slips. The community has been coming back every summer since the 1870s. This platform is the community's digital home: business directory, events calendar, and newsletter.

ROUND LAKE:
515 acres, 67 feet deep — the quieter side of lake life. Connected to Devils Lake by a shallow channel at Cherry Point. A glacial kettle lake carved ~10,000 BC. No bars or marinas — just homes, families, and serious fishing. Same zip code (49253) and township (Rollin) as Devils Lake.

THE VILLAGE:
A walkable strip on Devils Lake Highway and Lakeview Boulevard with boutique shops, a from-scratch cafe, satellite wine tasting rooms, and an iconic lighthouse replica. Open mostly Thursday–Sunday. Starting May 2026, village shops become satellite tasting rooms for Michigan wineries — Ang & Co pours Chateau Fontaine, Faust House pours Cherry Creek Cellars.

FISHING:
Eight warm-water species: Largemouth Bass (aggressive, near docks/weed edges), Bluegill (excellent numbers, great for families), Northern Pike (Tip-Up Festival star, through ice in winter), Yellow Perch (averaged 9"+ in DNR surveys, a winter staple), Black Crappie, Smallmouth Bass, Walleye (Round Lake), Pumpkinseed Sunfish. Spring bass spawn in shallows. Winter ice fishing on frozen Devils Lake is a major tradition.

WINERIES:
Cherry Creek Cellars — small-batch Michigan wines, 11500 Silver Lake Hwy, Brooklyn MI 49230, 20 min from Manitou Beach. Gypsy Blue Vineyards — new vineyard in the Irish Hills. Village tasting rooms: Ang & Co (141 N. Lakeview Blvd) and Faust House Scrap n Craft (140 N. Lakeview Blvd).

MEN'S CLUB (Devils and Round Lake Men's Club):
501(c)(3) nonprofit running the Tip-Up Festival (70+ year ice fishing festival on frozen Devils Lake, held in February) and the Fourth of July Firecracker 7K run starting at 3171 Round Lake Hwy. Raises funds for scholarships, Toys for Tots, Shop with a Cop, and Christmas gift baskets for families in need.

HISTORICAL SOCIETY (MBHRS — Manitou Beach Historic Renovation Society):
Restoring and revitalizing the village. Home of the Boat House Art Gallery — largest nonprofit gallery in Lenawee County, 50+ Michigan artists, at 138 N. Lakeview Blvd. Annual events: Devils Lake Festival of the Arts (100 artist booths, live music, food trucks) and Village Car Shows. Located at 762 Manitou Road, Manitou Beach MI 49253.

HISTORY:
Pre-1830: Potawatomi and Ojibwa people camped along the shores. 1870s: Grand hotels, dance pavilion, bathhouses, and two railroad stations made Devils Lake a top Michigan summer destination. 1888: Manitou Beach officially platted. 1920s–40s: Yacht Club established. 1950s: Tip-Up Festival launched. Today: boating, fishing, festivals, and a tight-knit lake community.

DEVILS LAKE YACHT CLUB: Fine dining overlooking Devils Lake, sailing races, and a gathering place for the boating community.
`.trim();


// ============================================================
// 🗺️  DISCOVER PAGE — MAP-FIRST COMMUNITY GUIDE
// ============================================================

export const DISCOVER_MAP_CENTER = { lat: 42.0047, lng: -84.2888 };

export const DISCOVER_CATS = [
  { id: 'all',        label: 'All',                icon: '🗺️', color: '#7A8E72' },
  { id: 'food',       label: 'Food & Drink',        icon: '🍽️', color: '#D4845A', notionKey: 'Food & Drink' },
  { id: 'stays',      label: 'Stays & Rentals',      icon: '🏠', color: '#2D3B45', notionKey: 'Stays & Rentals' },
  { id: 'wineries',   label: 'Wineries',             icon: '🍷', color: '#7B4F2E', notionKey: 'Breweries & Wineries' },
  { id: 'water',      label: 'Boat & Water',         icon: '⛵', color: '#3A6B85', notionKey: 'Boating & Water' },
  { id: 'events',     label: 'Events & Venues',      icon: '🥂', color: '#8B6BA8', notionKey: 'Events & Venues' },
  { id: 'shopping',   label: 'Shopping',             icon: '🛍️', color: '#B07D62', notionKey: 'Shopping & Gifts' },
  { id: 'services',   label: 'Home Services',        icon: '🔧', color: '#5B6E5A', notionKey: 'Home Services' },
  { id: 'healthcare', label: 'Healthcare',           icon: '🏥', color: '#c05a5a' },
  { id: 'grocery',    label: 'Grocery & Pharmacy',  icon: '🛒', color: '#5B7E95' },
  { id: 'schools',    label: 'Schools',              icon: '🎓', color: '#6B7EC8' },
  { id: 'community',  label: 'Community',            icon: '🏛️', color: '#7A8E72' },
  { id: 'gas',        label: 'Gas Stations',         icon: '⛽', color: '#B8860B' },
  // ↑ To add a new category: add a line here + set the same id as the Notion Category value
];

export const DISCOVER_POIS = [
  // Healthcare — Tecumseh ~84.94°W, Adrian ~84.04°W
  { id: 'herrick', name: 'ProMedica Herrick Hospital', cat: 'healthcare', sub: 'Full Hospital · ER', address: '500 E Pottawatamie St, Tecumseh, MI', phone: '(517) 424-3000', note: '~15 min from Manitou Beach', lat: 42.0005, lng: -83.9340, website: 'https://www.promedica.org/herrick-hospital' },
  { id: 'allegiance', name: 'Henry Ford Allegiance Health', cat: 'healthcare', sub: 'Full Hospital · Level II Trauma', address: '205 N East Ave, Jackson, MI', phone: '(517) 788-4800', note: '~30 min · Major medical center', lat: 42.2490, lng: -84.3945, website: 'https://www.henryford.com/locations/allegiance' },
  { id: 'urgent-tec', name: 'Urgent Care – Tecumseh', cat: 'healthcare', sub: 'Urgent Care', address: '821 W Chicago Blvd, Tecumseh, MI', phone: '(517) 423-3200', note: '~15 min · Walk-in, no appointment needed', lat: 42.0040, lng: -83.9580 },
  { id: 'cvs-tec', name: 'CVS Pharmacy – Tecumseh', cat: 'healthcare', sub: 'Pharmacy · MinuteClinic', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0035, lng: -83.9548 },
  { id: 'walgreens-adr', name: 'Walgreens – Adrian', cat: 'healthcare', sub: 'Pharmacy', address: 'N Main St, Adrian, MI', note: '~20 min · Open late', lat: 41.9197, lng: -84.0382 },
  // Grocery
  { id: 'walmart-adr', name: 'Walmart Supercenter', cat: 'grocery', sub: 'Grocery · Pharmacy · Bait & Tackle', address: '1601 E US Hwy 223, Adrian, MI', note: '~20 min', lat: 41.9001, lng: -84.0174 },
  { id: 'meijer-tec', name: 'Meijer', cat: 'grocery', sub: 'Grocery · Gas Station', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0030, lng: -83.9565 },
  // Boat & Water — southwest end of Devils Lake, just off Devils Lake Hwy
  { id: 'launch-main', name: 'Public Boat Launch – Devils Lake', cat: 'water', sub: 'Free Public Ramp', address: 'Devils Lake Hwy, Manitou Beach, MI', note: 'Free · Paved ramp · 60-car trailer parking', lat: 41.9795, lng: -84.3088 },
  { id: 'dnr-ramp', name: 'DNR Access Site – Round Lake', cat: 'water', sub: 'State DNR Ramp', address: 'Round Lake, Manitou Beach, MI', note: 'Kayaks · Canoes · Small boats', lat: 41.9580, lng: -84.3200 },
  { id: 'marina', name: 'Manitou Beach Marina', cat: 'water', sub: 'Marina · 600+ Slips', address: '9517 Devils Lake Hwy, Manitou Beach, MI', note: 'Seasonal dockage available', lat: 41.9812, lng: -84.3091 },
  // Schools
  { id: 'onsted-hs', name: 'Onsted High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '8036 Macon Rd, Onsted, MI', phone: '(517) 467-2170', note: '~10 min · Closest district to Manitou Beach', lat: 42.0030, lng: -84.1870 },
  { id: 'onsted-elem', name: 'Onsted Elementary School', cat: 'schools', sub: 'Public K–5 · Onsted Community Schools', address: 'Onsted, MI', phone: '(517) 467-2170', note: '~10 min · Same campus area as HS', lat: 42.0043, lng: -84.1882 },
  { id: 'addison-hs', name: 'Addison Community Schools', cat: 'schools', sub: 'Public K–12 · Addison Community Schools', address: '219 N Comstock St, Addison, MI', phone: '(517) 547-6500', note: '~15 min · Northwest Lenawee County', lat: 41.9887, lng: -84.3448 },
  { id: 'tec-hs', name: 'Tecumseh High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '400 N Maumee St, Tecumseh, MI', phone: '(517) 423-3366', note: '~15 min · Tecumseh Public Schools', lat: 42.0100, lng: -83.9450 },
  { id: 'adrian-hs', name: 'Adrian High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '785 Riverside Ave, Adrian, MI', phone: '(517) 263-2115', note: '~20 min · Adrian Public Schools', lat: 41.9060, lng: -84.0280 },
  { id: 'lenawee-christian', name: 'Lenawee Christian School', cat: 'schools', sub: 'Private K–12', address: 'Adrian, MI', phone: '(517) 265-5020', note: '~20 min · Faith-based PreK–12', lat: 41.8902, lng: -84.0557 },
  // Wineries
  { id: 'chateau-aero', name: 'Chateau Aeronautique Winery', cat: 'wineries', sub: 'Winery & Event Venue', address: '1849 E Parnall Rd, Jackson, MI', phone: '(517) 795-3620', note: '~30 min · Live music weekends · All-weather biergarten', lat: 42.2380, lng: -84.3750, website: 'https://chateauaeronautique.com' },
  { id: 'cherry-creek', name: 'Cherry Creek Cellars', cat: 'wineries', sub: 'Small-Batch Winery', address: '11500 Silver Lake Hwy, Brooklyn, MI 49230', phone: '(517) 592-4315', note: '~20 min · Laid-back tasting room', lat: 42.0504585, lng: -84.3012163, website: 'https://cherrycreekcellars.com' },
  { id: 'ang-co-wine', name: 'Ang & Co', cat: 'wineries', sub: 'Satellite Tasting Room', address: '141 N Lakeview Blvd, Manitou Beach, MI', phone: '(517) 547-6030', note: 'In the Village · Michigan wine + gifts', lat: 41.9720, lng: -84.3040, website: 'https://www.angandco.net' },
  // Community — Manitou Beach Village at south end of lake ~41.9697, -84.3083
  { id: 'yacht-club-loc', name: 'Devils Lake Yacht Club', cat: 'community', cats: ['community', 'water', 'food'], sub: 'Sailing & Social Club', address: '2097 Marsh Dr, Manitou Beach, MI', note: 'Since the 1940s · Regattas · Friday Fish Fry', lat: 41.9678, lng: -84.2880, website: 'https://www.devilslakeyachtclub.com' },
  { id: 'mens-club-loc', name: "Devils & Round Lake Men's Club", cat: 'community', sub: 'Civic Organization', address: 'Manitou Beach, MI', note: 'Tip-Up Festival · Firecracker 7K · Shop with a Cop', lat: 41.9720, lng: -84.2990, href: '/mens-club' },
  { id: 'mbhrs-loc', name: 'Manitou Beach Historic Renovation Society', cat: 'community', sub: 'Historical & Arts Org', address: 'Manitou Beach Village', note: 'Village restoration · Arts · Community stewardship', lat: 41.9730, lng: -84.3040, href: '/historical-society' },
  { id: 'village-loc', name: 'Manitou Beach Village', cat: 'community', sub: 'Village District', address: 'N Lakeview Blvd, Manitou Beach, MI', note: 'Shops · Cafe · Wine tasting · The Lighthouse', lat: 41.9720, lng: -84.3055, href: '/village' },
];

export const DISCOVER_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f2ede3' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3B3228' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#faf6ef' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#9dc3d4' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5B7E95' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#e8e0d0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ddd5c0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#cdc0a8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#b8a88a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c5d5a8' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#7A8E72' }] },
];

export function createDiscoverPin(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22s14-12.67 14-22C28 6.27 21.73 0 14 0z" fill="${color}" stroke="rgba(0,0,0,0.12)" stroke-width="1"/><circle cx="14" cy="14" r="5.5" fill="white" opacity="0.95"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function buildDiscoverInfoWindow(poi) {
  const cat = DISCOVER_CATS.find(c => c.id === poi.cat);
  const color = cat?.color || '#7A8E72';
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((poi.address || poi.name) + (poi.address ? '' : ', MI'))}`;
  return `<div style="padding:6px 8px 10px;max-width:250px;font-family:system-ui,sans-serif;line-height:1.45">
    <div style="font-size:13px;font-weight:700;color:#2D3B45;margin-bottom:3px">${poi.name}</div>
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:${color};font-weight:700;margin-bottom:6px">${poi.sub}</div>
    ${poi.address ? `<div style="font-size:11px;color:#666;margin-bottom:4px">${poi.address}</div>` : ''}
    ${poi.phone ? `<a href="tel:${poi.phone.replace(/\D/g, '')}" style="display:block;font-size:12px;font-weight:600;color:#7A8E72;margin-bottom:4px;text-decoration:none">${poi.phone}</a>` : ''}
    ${poi.note ? `<div style="font-size:11px;color:#999;margin-bottom:8px;font-style:italic">${poi.note}</div>` : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="${dir}" target="_blank" style="font-size:12px;font-weight:700;color:#5B7E95;text-decoration:none">Get Directions →</a>
      ${poi.website ? `<a href="${poi.website}" target="_blank" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Website →</a>` : ''}
      ${poi.href ? `<a href="${poi.href}" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Learn More →</a>` : ''}
    </div>
  </div>`;
}


// ============================================================
// 📄  PRIVACY POLICY

// ============================================================
// 📄  TERMS OF SERVICE

// ============================================================
// 🚚  /food-trucks — FOOD TRUCK LOCATOR

// ============================================================
// 🏗️  /build — WEBSITE RENTAL LEAD CAPTURE

// ============================================================
// 🔒  /founding — FOUNDING MEMBER PAGE (private link, friend outreach)
// ============================================================
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


// ============================================================
// 🚚  /food-truck-partner — FOOD TRUCK PARTNER PAGE (private link)
// ============================================================
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


// ============================================================
// 🍷  /wine-partner — WINE TRAIL PARTNER PAGE (private link)
// ============================================================
const WINE_PARTNER_HOW = [
  { step: "01", title: "A customer visits your tasting room", copy: "They enjoy a pour, browse your space, connect with what you offer. That experience is already happening — we just give them a way to capture it." },
  { step: "02", title: "They scan the QR card, rate their visit", copy: "Wine quality, service, atmosphere, value. A minute on their phone. No app to download, no account to create. Scan, rate, done." },
  { step: "03", title: "Your scorecard builds — publicly", copy: "Every rating adds to your live community scorecard on Manitou Beach. Visitors researching the trail see your scores before they visit. Your fans become your best marketing." },
];
const WINE_PARTNER_GETS = [
  { icon: "📊", title: "Public Scorecard", copy: "Live community ratings across four dimensions — Wine Quality, Service, Atmosphere, Value. Visible to anyone exploring the trail on Manitou Beach." },
  { icon: "📄", title: "Print Kit", copy: "100 printed stamp cards (6×4) for your counter plus a display insert. $49 one-time covers design, print, and delivery. Refills are $29 per 100 cards when you run out." },
  { icon: "🏆", title: "Season-End Award", copy: "At the end of 2026, top-rated venues in each category receive a plaque — something to hang on your wall, post online, and be proud of." },
  { icon: "👥", title: "Community Visibility", copy: "Your listing on Manitou Beach, seen by the region's most engaged local audience — visitors, locals, and seasonal residents all in one place." },
];
const WINE_PARTNER_AWARDS = [
  "Best Red Wine",
  "Best White Wine",
  "Best Sweet Wine",
  "Best Fruit or Specialty Wine",
  "Best Tasting Room Experience",
  "Outstanding Customer Hospitality",
  "Best Atmosphere",
];
// ── /rate — Universal Wine Trail Rating Page ──────────────────────────
const RATE_VENUES = WINERY_VENUES.filter(v => v.section !== 'extended').map(v => v.name);


const WINE_PARTNER_FRICTIONLESS = [
  { label: "No app required", sub: "Customers rate in a browser. Done." },
  { label: "No account to manage", sub: "Your profile is already live." },
  { label: "No work to maintain", sub: "We run the system. You run the tasting room." },
  { label: "No hidden cost later", sub: "If that ever changes, you'll hear it from us first." },
];





// ============================================================
// 🌐  APP ROOT
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/claim-promo" element={<ClaimPromoView />} />
        <Route path="/redeem-promo" element={<RedeemPromoView />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/happening" element={<HappeningPage />} />
        <Route path="/round-lake" element={<RoundLakePage />} />
        <Route path="/village" element={<VillagePage />} />
        <Route path="/featured" element={<FeaturedPage />} />
        <Route path="/mens-club" element={<MensClubPage />} />
        <Route path="/ladies-club" element={<LadiesClubPage />} />
        <Route path="/historical-society" element={<HistoricalSocietyPage />} />
        <Route path="/fishing" element={<FishingPage />} />
        <Route path="/wineries" element={<WineriesPage />} />
        <Route path="/devils-lake" element={<DevilsLakePage />} />
        <Route path="/promote" element={<PromotePage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/dispatch/:slug" element={<DispatchArticlePage />} />
        <Route path="/yeti-admin" element={<YetiAdminPage />} />
        <Route path="/claim/:slug" element={<ClaimPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/food-trucks" element={<FoodTrucksPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/rate" element={<RatePage />} />
        <Route path="/wine-partner" element={<WinePartnerPage />} />
        <Route path="/food-truck-partner" element={<FoodTruckPartnerPage />} />
        <Route path="/founding" element={<FoundingPage />} />
        <Route path="/usa250" element={<USA250Page />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
      <VoiceWidget />
    </BrowserRouter>
  );
}
