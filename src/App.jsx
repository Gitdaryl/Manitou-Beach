import { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";

// ============================================================
// 🎬  GLOBAL CSS KEYFRAMES & ANIMATIONS
// ============================================================
function GlobalStyles() {
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
const C = {
  cream:       "#FAF6EF",
  warmWhite:   "#F5F0E8",
  sand:        "#E8DFD0",
  driftwood:   "#C4B498",
  sage:        "#7A8E72",
  sageDark:    "#5C6F55",
  lakeBlue:    "#5B7E95",
  lakeDark:    "#3D5A6E",
  dusk:        "#2D3B45",
  night:       "#1A2830",
  sunset:      "#D4845A",
  sunsetLight: "#E8A87C",
  warmGray:    "#8A7E6E",
  text:        "#3B3228",
  textLight:   "#6B6052",
  textMuted:   "#9A8E7E",
};

// ============================================================
// 💛  PAGE SPONSORS — update to activate; null = show placeholder
// ============================================================
const PAGE_SPONSORS = {
  home:                 null,
  happening:            null,
  'round-lake':         null,
  village:              null,
  fishing:              null,
  wineries:             null,
  'devils-lake':        null,
  dispatch:             null,
  discover:             null,
  'historical-society': null,
  // To activate a sponsor, replace null with an object:
  // pageName: { name: "Business Name", logo: "/path/to/logo.png", tagline: "Your tagline here", url: "https://example.com" }
};

// ============================================================
// 🧭  NAV SECTIONS
// USA250 — set true to make the page publicly visible + add to Community nav
const USA250_PUBLIC = false;

// Slot caps per tier per category — Enhanced is unlimited (no cap)
const SLOT_CAPS = { premium: 1, featured: 3 };
const LISTING_CATEGORIES = [
  "Real Estate", "Food & Drink", "Boating & Water", "Breweries & Wineries",
  "Shopping & Gifts", "Stays & Rentals", "Creative Media", "Home Services",
  "Health & Beauty", "Pet Services", "Arts & Culture", "Other",
];
// Drop your drone fireworks video in public/images/ and set the path here:
const USA250_VIDEO_URL = ""; // e.g. "/images/fireworks-2025.mp4"

// ============================================================
const SECTIONS = [
  { id: "home",       label: "Home" },
  { id: "happening",  label: "What's Happening" },
  { id: "explore",    label: "Explore" },
  { id: "businesses", label: "Local Businesses" },
  { id: "living",     label: "Living Here" },
  { id: "about",      label: "About" },
];

// ============================================================
// 📋  BUSINESS DIRECTORY DATA
// ============================================================
// Village page editorial listings — hardcoded for the Walk the Village section only.
// BusinessDirectory is 100% Notion-driven and does NOT use this array.
const VILLAGE_BUSINESSES = [
  {
    id: 3,
    name: "Two Lakes Tavern",
    category: "Food & Drink",
    description: "Family-owned lakeside restaurant known for smoked entrees and a full menu of options. Right on the shores of Devils Lake, steps from the water.",
    address: "110 Walnut St, Manitou Beach",
    village: true,
    logo: "/images/two_lakes_logo.jpg",
    website: "https://www.twolakestavern.com",
    phone: "(517) 547-7490",
  },
  {
    id: 16,
    name: "Ang & Co",
    category: "Shopping & Gifts",
    description: "Dirty sodas, satellite wine tasting, custom sweatshirt and t-shirt printing, and curated gifts. A little bit of everything on Lakeview Blvd.",
    address: "141 N. Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/ang_co_logo.png",
    website: "https://www.angandco.net",
    phone: "(517) 547-6030",
  },
  {
    id: 17,
    name: "Faust House Scrap n Craft",
    category: "Shopping & Gifts",
    description: "Scrapbooking supplies, craft workshops, and satellite wine tasting. A creative hub for makers in the heart of Manitou Beach village.",
    address: "140 N Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/faust_house_logo.png",
    website: "https://fausthousescrapncraft.com",
    phone: "(517) 403-1788",
  },
  {
    id: 18,
    name: "Devils Lake View Living",
    category: "Shopping & Gifts",
    description: "High-end fashion, curated home goods, and the iconic lighthouse replica out front. Manitou Beach's village anchor and a satellite wine tasting venue.",
    address: "200 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/dl-view-living-logo.png",
    website: "http://devilslakeviewliving.com",
    phone: "(517) 252-5287",
  },
  {
    id: 19,
    name: "Devils Lake Inn",
    category: "Stays & Rentals",
    description: "Six stylish, modern apartments available year-round. Walking distance to the village shops, the lake, and everything Manitou Beach has to offer.",
    address: "103 Walnut Street, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/dl-inn-logo.png",
    website: "https://www.devilslakeinn.com",
    phone: "(517) 252-5017",
  },
  {
    id: 20,
    name: "Michigan Gypsy",
    category: "Shopping & Gifts",
    description: "A gift boutique with personality — unique finds, local goods, and the kind of shop you stumble into and don't want to leave. Right in the village.",
    address: "136 North Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/michigan-gypsy-logo.png",
    website: "https://michigangypsy.com",
    phone: "(517) 224-1984",
  },
  {
    id: 21,
    name: "Blackbird Cafe",
    category: "Food & Drink",
    description: "Everything handmade — including the coffee syrups. A from-scratch cafe in Manitou Beach village with pastries, specialty drinks, and a loyal following.",
    address: "135 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/blackbird-logo.png",
    website: "https://www.blackbirdcafedevils.com",
    phone: "(567) 404-9655",
  },
  {
    id: 22,
    name: "Trends Salon & Spa",
    category: "Health & Beauty",
    description: "Full-service salon and spa in the heart of Manitou Beach village. Hair, color, nails, and spa treatments for locals and lake visitors alike.",
    address: "126 N Lakeview Blvd, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/trends-logo.png",
    website: "https://www.facebook.com/profile.php?id=100063483493738",
    phone: "(517) 547-5544",
  },
  {
    id: 23,
    name: "Phoenix Rising Wellness",
    category: "Health & Beauty",
    description: "Holistic wellness treatments and restorative services in the Irish Hills. Massage, energy work, and natural healing near the shores of Devils Lake.",
    address: "131 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/pheonix-logo.png",
    website: "https://www.phoenixrising-acupuncture.com/",
    phone: "(517) 759-4018",
  },
  {
    id: 24,
    name: "Trillium House",
    category: "Stays & Rentals",
    description: "A spacious 5-bedroom retreat that sleeps 9. Central air, two full bathrooms, in-unit washer and dryer, and a generous lot on Devils Lake Hwy.",
    address: "350 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/trillium-logo.png",
    website: "https://www.trilliumhouserental.com/",
    phone: "(419) 290-9974",
  },
  {
    id: 25,
    name: "Foundation Realty",
    category: "Real Estate",
    description: "Serving the Manitou Beach community with lakefront and residential real estate. Holly Griewahn — 30+ years of local expertise in the Irish Hills.",
    address: "100 Walnut St, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/foundation-logo.png",
    website: "https://www.foundationlenawee.com/",
    phone: "(517) 266-8888",
  },
  {
    id: 26,
    name: "Diamond in the Ruff",
    category: "Pet Services",
    description: "Professional pet grooming and care in the Manitou Beach area. Keeping your furry family members looking and feeling their best all season.",
    address: "251 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/diamond-ruff-logo.png",
    website: "https://www.facebook.com/diamondintheruffpetgroomingllc",
    phone: "(517) 252-5255",
  },
  {
    id: 28,
    name: "Boathouse Art Gallery",
    category: "Arts & Culture",
    description: "The largest nonprofit art gallery in Lenawee County — 50+ Michigan artists under one roof at the historic boathouse on the lake. Annual home of the Devils Lake Festival of the Arts.",
    address: "138 N. Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/boathouse-art-gallery-logo.jpg",
    website: "https://www.facebook.com/ManitouBeachBoathouseArtGallery/",
    phone: "(517) 224-1984",
  },
  {
    id: 27,
    name: "South Shore Marine",
    category: "Boating & Water",
    description: "Marine sales, service, and repair on Devils Lake. Pontoon boats, outboards, and everything to keep your boat running all season long.",
    address: "209 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    logo: "/images/ss-marine-logo.png",
    website: "https://www.facebook.com/profile.php?id=100092384540558",
    phone: "(517) 260-6910",
  },
  {
    id: 29,
    name: "Lakes Preservation League",
    category: "Community",
    description: "Mission to Preserve and Protect the Lakes for Current and Future Generations. Advocacy, stewardship, and community engagement for the Irish Hills lakes.",
    village: true,
    featured: false,
    logo: null,
    website: "https://lakespreservationleague.org/",
    phone: "(989) 205-5079",
  },
];

// Category → accent color mapping (used by directory + business rows)
const CAT_COLORS = {
  "Real Estate":        C.lakeBlue,
  "Food & Drink":       C.sunset,
  "Boating & Water":    C.sage,
  "Breweries & Wineries": "#8B5E3C",
  "Shopping & Gifts":   "#B07D62",
  "Stays & Rentals":    C.lakeBlue,
  "Creative Media":     C.driftwood,
  "Home Services":      C.sageDark,
  "Health & Beauty":    "#B5737A",
  "Pet Services":       "#8B7355",
  "Arts & Culture":     "#7B68B0",
  "Other":              C.textMuted,
};

// ============================================================
// Events are 100% Notion-driven — no hardcoded data here.
// Add events in Notion with Status = "Approved" or "Published" to appear on site.

// ============================================================
// 🎬  VIDEO / STORY CONTENT
// ============================================================
const VIDEOS = [
  {
    id: 1,
    title: "Party on Devils Lake",
    desc: "Life on the water at Manitou Beach — the boats, the people, and everything that makes this lake special.",
    youtubeId: "3MCb5X4bj9s",
    date: "2025",
    category: "Community",
  },
  {
    id: 2,
    title: "Wooden Boats on Devils Lake",
    desc: "Classic wooden boats and the timeless tradition of craftsmanship on Devils Lake.",
    youtubeId: "IczTln0Jxd4",
    date: "2025",
    category: "Community",
  },
  {
    id: 3,
    title: "July 4th on Devils Lake",
    desc: "Independence Day celebrations on the lake — fireworks, boats, and the full Manitou Beach summer experience.",
    youtubeId: "3MCb5X4bj9s",
    date: "July 4, 2025",
    category: "Community",
  },
  {
    id: 4,
    title: "Devils Lake Tip-Up Festival 2025",
    desc: "The annual Tip-Up Town ice fishing festival in full swing — one of Michigan's beloved winter traditions.",
    youtubeId: "uqEtu9GlBHk",
    date: "Winter 2025",
    category: "Events",
  },
  {
    id: 5,
    title: "Devils Lake Tip-Up Festival 2026",
    desc: "Ice fishing, community, and the spirit of Manitou Beach's signature winter celebration.",
    youtubeId: "6Gc7hTs88LI",
    date: "Winter 2026",
    category: "Events",
  },
  {
    id: 6,
    title: "Cruisin' Till the Sun Goes Down",
    desc: "A golden hour cruise on Devils Lake — the perfect way to end a summer day on the water.",
    youtubeId: "bfPKmB57ltY",
    date: "Summer 2025",
    category: "Community",
  },
];

// ============================================================
// 🧩  SHARED COMPONENTS
// ============================================================

function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "Manitou Beach — Irish Hills, Michigan";

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: shareUrl }); } catch (_) {}
      return;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const btnStyle = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)",
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600,
    letterSpacing: 0.5, cursor: "pointer", textDecoration: "none",
    transition: "all 0.2s",
  };

  const hoverIn = e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; };
  const hoverOut = e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
      <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Share</span>
      {navigator.share ? (
        <button onClick={handleNativeShare} style={btnStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          ↑ Share This Page
        </button>
      ) : (
        <>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            style={btnStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank" rel="noopener noreferrer"
            style={btnStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          >
            X / Twitter
          </a>
          <button onClick={copyLink} style={{ ...btnStyle, border: copied ? `1px solid ${C.sage}` : "1px solid rgba(255,255,255,0.15)", color: copied ? C.sage : "rgba(255,255,255,0.65)" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </>
      )}
    </div>
  );
}

function SectionLabel({ children, light = false, style: styleProp = {} }) {
  return (
    <div style={{
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: 11,
      letterSpacing: 5,
      textTransform: "uppercase",
      color: light ? "rgba(255,255,255,0.5)" : C.sage,
      marginBottom: 14,
      fontWeight: 600,
      ...styleProp,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, light = false, center = false, style: styleProp = {} }) {
  return (
    <h2 style={{
      fontFamily: "'Libre Baskerville', serif",
      fontSize: "clamp(28px, 4.5vw, 46px)",
      fontWeight: 400,
      color: light ? C.cream : C.text,
      margin: "0 0 18px 0",
      lineHeight: 1.2,
      textAlign: center ? "center" : "left",
      ...styleProp,
    }}>
      {children}
    </h2>
  );
}

function FadeIn({ children, delay = 0, direction = "up", style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: "translateY(32px)",
    down: "translateY(-32px)",
    left: "translateX(-40px)",
    right: "translateX(40px)",
    scale: "scale(0.92)",
    none: "none",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) translateX(0) scale(1)" : transforms[direction] || transforms.up,
        transition: `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Scroll progress bar
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress-bar" style={{ width: `${progress}%` }} />;
}

// 3D card tilt hook
function useCardTilt(maxDeg = 6) {
  const ref = useRef(null);
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) translateY(-4px)`;
    el.style.boxShadow = `${x * 12}px ${8 + y * 8}px 30px rgba(0,0,0,0.12)`;
  }, [maxDeg]);
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
    el.style.boxShadow = "";
  }, []);
  return { ref, onMouseMove, onMouseLeave };
}

// SVG wave divider
function WaveDivider({ topColor, bottomColor, flip = false, height = 80 }) {
  return (
    <div style={{ marginTop: -1, marginBottom: -1, lineHeight: 0, overflow: "hidden", transform: flip ? "scaleY(-1)" : "none" }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height }}>
        <path
          d="M0,40 C360,120 720,0 1080,80 C1260,120 1380,60 1440,40 L1440,120 L0,120 Z"
          fill={bottomColor}
        />
        <rect width="1440" height="120" fill={topColor} style={{ opacity: 0 }} />
      </svg>
    </div>
  );
}

// ============================================================
// 💛  PAGE SPONSOR BANNER — appears above Footer on eligible pages
// ============================================================
function PageSponsorBanner({ pageName }) {
  const sponsor = PAGE_SPONSORS[pageName] || null;
  return (
    <section style={{ background: C.night, padding: "88px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Radial glow for depth */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 90% at 50% 50%, rgba(91,126,149,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
        <FadeIn>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 32 }}>
            Brought to you by
          </div>
          {sponsor ? (
            <a href={sponsor.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", textDecoration: "none" }}>
              <img src={sponsor.logo} alt={sponsor.name} style={{ maxWidth: 460, width: "100%", maxHeight: 140, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.92 }} />
              {sponsor.tagline && (
                <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 20, lineHeight: 1.6 }}>{sponsor.tagline}</p>
              )}
            </a>
          ) : (
            <>
              <img src="/images/yeti/yeti-groove-full-logo.png" alt="Holly & The Yeti" style={{ maxWidth: 520, width: "90%", opacity: 0.9, display: "block", margin: "0 auto" }} />
              <div style={{ marginTop: 36, marginBottom: 12 }}>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(18px, 3vw, 28px)", color: C.cream, fontWeight: 400, margin: "0 0 10px", lineHeight: 1.3 }}>
                  Your business deserves a billboard like this.
                </p>
                <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.36)", margin: "0 0 32px", letterSpacing: 0.5 }}>
                  Exclusive · One brand per page · Seen all year long
                </p>
              </div>
              <a href="/featured#page-sponsorship" className="btn-animated" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "18px 48px", borderRadius: 8,
                background: C.sunset, color: C.cream,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 700,
                letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none",
                boxShadow: "0 8px 36px rgba(212,132,90,0.40)",
              }}>
                Own This Space — $97/mo
              </a>
            </>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

// Diagonal slice divider
function DiagonalDivider({ topColor, bottomColor, height = 80 }) {
  return (
    <div style={{ marginTop: -1, marginBottom: -1, lineHeight: 0, overflow: "hidden" }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height }}>
        <polygon points="0,0 1440,60 1440,120 0,120" fill={bottomColor} />
        <polygon points="0,0 1440,0 1440,60 0,120" fill={topColor} />
      </svg>
    </div>
  );
}

function Btn({ children, onClick, href, variant = "primary", small = false, target, rel, style: styleProp }) {
  const base = {
    display: "inline-block",
    fontFamily: "'Libre Franklin', sans-serif",
    fontWeight: 600,
    fontSize: small ? 12 : 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    padding: small ? "9px 20px" : "13px 30px",
    borderRadius: 4,
    transition: "all 0.22s ease",
  };
  const styles = {
    primary: { background: C.sage, color: C.cream },
    outline: { background: "transparent", color: C.sage, border: `1.5px solid ${C.sage}` },
    dark: { background: C.dusk, color: C.cream },
    outlineLight: { background: "transparent", color: C.cream, border: "1.5px solid rgba(255,255,255,0.5)" },
    sunset: { background: C.sunset, color: C.cream },
  };
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      className="btn-animated"
      style={{ ...base, ...styles[variant], ...(styleProp || {}) }}
    >
      {children}
    </Tag>
  );
}

function CategoryPill({ children, dark = false }) {
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: dark ? "rgba(255,255,255,0.65)" : C.sageDark,
      background: dark ? "rgba(122,142,114,0.22)" : `${C.sage}18`,
      border: `1px solid ${dark ? "rgba(122,142,114,0.4)" : `${C.sage}30`}`,
      padding: "4px 10px",
      borderRadius: 3,
    }}>
      {children}
    </span>
  );
}

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
function PromoBanner({ page }) {
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
// 📬  SUBSCRIBE CONFIRMATION MODAL
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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '40px 36px',
          maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          textAlign: 'center', fontFamily: "'Libre Franklin', sans-serif",
        }}
      >
        {alreadySubscribed ? (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.dusk, margin: '0 0 12px' }}>
              Already on the list!
            </h3>
            <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
              You're already subscribed to The Manitou Dispatch. Watch your inbox — the next issue is coming soon.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.dusk, margin: '0 0 12px' }}>
              You're almost in!
            </h3>
            <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
              Check your inbox for a confirmation email from <strong>The Manitou Dispatch</strong>. Click the link inside to confirm and you're set.
            </p>
            <div style={{
              background: '#FFF8EC', border: '1px solid #F5DFA0', borderRadius: 10,
              padding: '14px 18px', marginBottom: 28, textAlign: 'left',
            }}>
              <div style={{ fontWeight: 600, color: C.dusk, fontSize: 13, marginBottom: 6 }}>
                Don't see it?
              </div>
              <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                Check your <strong>spam or junk folder</strong> and mark us as <strong>"Not Spam"</strong> — that's all it takes to make sure every issue lands in your inbox from here on out.
              </div>
            </div>
          </>
        )}
        <button
          onClick={onClose}
          style={{
            background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8,
            padding: '13px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'Libre Franklin', sans-serif", width: '100%',
          }}
        >
          {alreadySubscribed ? 'Got it' : 'Got it — I\'ll check! →'}
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
function NewsletterInline() {
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
function HappeningHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/happening-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      padding: "180px 24px 140px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Dark overlay — preserves text readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(170deg, rgba(10,18,24,0.72) 0%, rgba(10,18,24,0.50) 50%, rgba(10,18,24,0.82) 100%)",
      }} />

      {/* Decorative oversized year — pure design element */}
      <div style={{
        position: "absolute",
        right: -10,
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: "'Libre Baskerville', serif",
        fontSize: "clamp(140px, 22vw, 320px)",
        fontWeight: 700,
        color: "rgba(255,255,255,0.06)",
        lineHeight: 1,
        userSelect: "none",
        letterSpacing: -12,
        pointerEvents: "none",
      }}>
        2026
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Events & Community Calendar
          </div>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: "clamp(56px, 10vw, 120px)",
            fontWeight: 400,
            color: C.cream,
            lineHeight: 0.95,
            margin: "0 0 20px 0",
            letterSpacing: -2,
          }}>
            What's<br />Happening
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 3vw, 30px)", color: C.sunsetLight, marginBottom: 48 }}>
            in Manitou Beach · Devils Lake, Michigan
          </div>
          <Btn href="/#submit" variant="outlineLight">Submit an Event</Btn>
          <ShareBar title="What's Happening in Manitou Beach" />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 📅  /happening — WEEKLY RECURRING EVENTS
// ============================================================
function WeeklyEventsSection({ events, onEventClick }) {
  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };

  // Map full day name to short label — handles Notion "Recurring Day" select values
  const dayShort = (event) => {
    const day = event.recurringDay || "";
    const shorts = { Monday: "MON", Tuesday: "TUE", Wednesday: "WED", Thursday: "THU", Friday: "FRI", Saturday: "SAT", Sunday: "SUN" };
    return shorts[day] || day.slice(0, 3).toUpperCase() || "WKL";
  };

  return (
    <section style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>The Regulars</SectionLabel>
          <SectionTitle>Every Week</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, maxWidth: 480, margin: "0 0 64px 0" }}>
            Some things happen like clockwork on Devils Lake. You just have to know where to be.
          </p>
        </FadeIn>

        {events.length === 0 ? (
          <div style={{ padding: "40px 0", fontSize: 14, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
            Weekly regulars will appear here once added. Add events to Notion with Recurring = Weekly.
          </div>
        ) : (
        <div>
          {events.map((event, i) => {
            const color = eventCatColors[event.category] || C.sage;
            const day = dayShort(event);
            return (
              <FadeIn key={event.id} delay={i * 60}>
                <div
                  onClick={() => onEventClick(event)}
                  className="weekly-event-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr auto",
                    gap: "0 48px",
                    alignItems: "start",
                    padding: "36px 0",
                    borderBottom: `1px solid ${C.sand}`,
                    transition: "all 0.2s",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.paddingLeft = "12px"; e.currentTarget.style.paddingRight = "12px"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.paddingRight = "0"; }}
                >
                  {/* Day abbreviation */}
                  <div style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 32,
                    color,
                    lineHeight: 1,
                    paddingTop: 4,
                    userSelect: "none",
                  }}>
                    {day}
                  </div>

                  {/* Event info */}
                  <div>
                    <h3 style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "clamp(20px, 2.5vw, 30px)",
                      fontWeight: 400,
                      color: C.text,
                      margin: "0 0 6px 0",
                      lineHeight: 1.2,
                    }}>
                      {event.name}
                    </h3>
                    {event.location && (
                      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
                        {event.location}
                      </div>
                    )}
                    <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
                      {event.description}
                    </p>
                  </div>

                  {/* Cost badge */}
                  <div style={{ paddingTop: 8 }}>
                    <span style={{
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 11, fontWeight: 600, letterSpacing: 1,
                      color: event.cost === "Free" || event.cost === "Free to watch" ? C.sage : C.sunset,
                      background: event.cost === "Free" || event.cost === "Free to watch" ? `${C.sage}15` : `${C.sunset}15`,
                      padding: "5px 12px", borderRadius: 20,
                      textTransform: "uppercase",
                    }}>
                      {event.cost || "Free"}
                    </span>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// 📅  /happening — SPECIAL / ONE-OFF EVENTS
// ============================================================
function formatEventDate(dateStr) {
  if (!dateStr || dateStr.includes("TBA")) return dateStr || "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]} ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}`;
  } catch { return dateStr; }
}

function CalendarSection({ events, onEventClick, activeFilter, onFilterChange }) {
  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };
  const categories = ["All", ...new Set(events.map(e => e.category))];
  const filtered = activeFilter === "All" ? events : events.filter(e => e.category === activeFilter);

  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Special Events · 2026</SectionLabel>
          <SectionTitle>On the Calendar</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, maxWidth: 480, margin: "0 0 32px 0" }}>
            The big ones. Mark them down.
          </p>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn delay={100}>
          <div style={{ display: "flex", gap: 8, marginBottom: 48, flexWrap: "wrap" }}>
            {categories.map(cat => {
              const isActive = activeFilter === cat;
              const catColor = eventCatColors[cat] || C.sage;
              return (
                <button
                  key={cat}
                  onClick={() => onFilterChange(cat)}
                  className="btn-animated"
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 12, fontWeight: 600, letterSpacing: 1,
                    textTransform: "uppercase",
                    padding: "8px 18px", borderRadius: 24,
                    border: isActive ? "none" : `1.5px solid ${C.sand}`,
                    background: isActive ? (cat === "All" ? C.dusk : catColor) : "transparent",
                    color: isActive ? C.cream : C.textMuted,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </FadeIn>

        <div>
          {filtered.map((event, i) => {
            const color = eventCatColors[event.category] || C.sage;
            const dateLabel = formatEventDate(event.date);
            return (
              <FadeIn key={event.id} delay={i * 50}>
                <div
                  onClick={() => onEventClick(event)}
                  className="calendar-event-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr auto",
                    gap: "0 32px",
                    alignItems: "center",
                    padding: "24px 0",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.sand}` : "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderRadius: 4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.paddingLeft = "12px"; e.currentTarget.style.paddingRight = "12px"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.paddingRight = "0"; }}
                >
                  {/* Date — compact format */}
                  <div style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 22,
                    color,
                    lineHeight: 1.1,
                    userSelect: "none",
                  }}>
                    {dateLabel}
                  </div>

                  {/* Event info */}
                  <div>
                    <h3 style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "clamp(16px, 2vw, 22px)",
                      fontWeight: 400,
                      color: C.text,
                      margin: "0 0 4px 0",
                      lineHeight: 1.3,
                    }}>
                      {event.name}
                    </h3>
                    <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
                      {event.time && <span>{event.time}</span>}
                      {event.time && event.location && <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>}
                      {event.location && <span>{event.location}</span>}
                    </div>
                  </div>

                  {/* Cost badge */}
                  <div className="calendar-cost-badge">
                    <span style={{
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 11, fontWeight: 600, letterSpacing: 1,
                      color: event.cost === "Free" || event.cost === "Free to watch" ? C.sage : C.sunset,
                      background: event.cost === "Free" || event.cost === "Free to watch" ? `${C.sage}15` : `${C.sunset}15`,
                      padding: "5px 12px", borderRadius: 20,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}>
                      {event.cost || "Free"}
                    </span>
                  </div>
                </div>
              </FadeIn>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}>
              No events in this category yet. Check back soon!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 🎬  /happening — VIDEO SECTION
// ============================================================
function VideoMeta({ video }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <CategoryPill>{video.category}</CategoryPill>
        <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
          {video.date}
        </span>
      </div>
      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.cream, margin: "0 0 8px 0", lineHeight: 1.3 }}>
        {video.title}
      </h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>
        {video.desc}
      </p>
    </div>
  );
}

function VideoSection() {
  return (
    <section style={{ background: C.dusk, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
            <div>
              <SectionLabel light>Videos & Stories</SectionLabel>
              <SectionTitle light>From the Lake</SectionTitle>
            </div>
            <Btn href="https://www.youtube.com/@HollyandtheYetipodcast" variant="outlineLight" small>Watch on YouTube →</Btn>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))", gap: 40 }}>
          {VIDEOS.map((video, i) => (
            <FadeIn key={video.id} delay={i * 80}>
              {video.youtubeId ? (
                <div>
                  <div style={{ position: "relative", paddingTop: "56.25%", marginBottom: 20, borderRadius: 8, overflow: "hidden" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <VideoMeta video={video} />
                </div>
              ) : (
                <a href="https://www.youtube.com/@HollyandtheYetipodcast" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                  {/* Placeholder thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      paddingTop: "56.25%",
                      background: `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 100%)`,
                      borderRadius: 8,
                      overflow: "hidden",
                      marginBottom: 20,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.78"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "rgba(255,255,255,0.12)",
                        border: "1.5px solid rgba(255,255,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, color: C.cream, paddingLeft: 5,
                      }}>
                        ▶
                      </div>
                    </div>
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      background: `${C.sunset}DD`, color: C.cream,
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 9, fontWeight: 700, letterSpacing: 2.5,
                      textTransform: "uppercase", padding: "5px 12px", borderRadius: 3,
                    }}>
                      Coming Soon
                    </div>
                  </div>
                  <VideoMeta video={video} />
                </a>
              )}
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

// ============================================================
// 📅  /happening — INLINE SUBMIT FORM
// ============================================================
const EVENT_CATEGORIES = ["Live Music", "Food & Social", "Sports & Outdoors", "Community", "Arts & Culture", "Markets & Vendors", "Other"];

function HappeningSubmitCTA({ simple = false }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", date: "", time: "", location: "", description: "", eventUrl: "", email: "", phone: "", cost: "", _hp: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = async (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setSubmitError("Event name and email are required."); return; }
    setSubmitting(true); setSubmitError("");
    try {
      let imageUrl = null;
      if (imageFile) {
        const { base64, filename } = await compressImage(imageFile);
        const up = await fetch("/api/upload-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, filename, contentType: "image/jpeg" }) });
        const upData = await up.json();
        if (up.ok) imageUrl = upData.url;
      }
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", background: "rgba(255,255,255,0.06)", color: C.cream, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" };

  if (simple) {
    return (
      <section style={{ background: C.night, padding: "72px 24px", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light>Get Involved</SectionLabel>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>
            Have an event to share?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: "0 0 32px 0", lineHeight: 1.75 }}>
            Free community calendar listings — reviewed and live within 48 hours.
          </p>
          <Btn href="/promote" variant="sunset">Submit Free Listing</Btn>
        </FadeIn>
      </section>
    );
  }

  if (submitted) {
    return (
      <section style={{ background: C.night, padding: "80px 24px", textAlign: "center" }}>
        <FadeIn>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>Event submitted!</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 36px 0" }}>
              We'll review and get it listed within 48 hours. Want more eyes on it?
            </p>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 32px", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 10 }}>Promote Your Event</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 20px 0" }}>
                Hero Feature · Newsletter Spotlight · Featured Banners.<br/>Founding rates available now — limited spots.
              </p>
              <Btn href="/promote" variant="sunset">See Promotion Packages →</Btn>
            </div>
          </div>
        </FadeIn>
      </section>
    );
  }

  return (
    <section id="submit-event" style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>Get Involved</SectionLabel>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "0 0 8px 0" }}>
            Have an event to share?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: "0 0 40px 0", lineHeight: 1.75 }}>
            Free community calendar listings — reviewed and live within 48 hours.
          </p>
        </FadeIn>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Event Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Summer Bonfire at the Point" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select a category</option>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input value={form.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 7:00 PM" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Devils Lake Pavilion" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cost / Admission</label>
              <input value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="e.g. Free · $10 at the door" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Tell us about your event..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Ticket / Event URL</label>
              <input value={form.eventUrl} onChange={e => set("eventUrl", e.target.value)} placeholder="https://" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Your Email *</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="555-555-5555" style={inputStyle} />
            </div>
            {/* Image upload */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Event Image (optional)</label>
              <div
                onClick={() => document.getElementById("happening-img-upload").click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleImage(f); }}
                style={{ border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ maxHeight: 120, borderRadius: 6, objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>Click or drag an image here</span>
                )}
                <input id="happening-img-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImage(e.target.files[0])} />
              </div>
            </div>
          </div>

          {/* Honeypot — hidden from humans, bots fill it automatically */}
          <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form._hp} onChange={e => set("_hp", e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />

          {submitError && <div style={{ fontSize: 13, color: "#ff6b6b", fontFamily: "'Libre Franklin', sans-serif" }}>{submitError}</div>}

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <button type="submit" disabled={submitting} style={{ padding: "13px 32px", background: C.sunset, color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, transition: "all 0.2s" }}>
              {submitting ? "Submitting..." : "Submit Free Listing"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ============================================================
// 🗺️  EXPLORE
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
function HollyYetiSection() {
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
async function compressImage(file, maxWidth = 1200, quality = 0.7) {
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
function FooterNewsletterModal({ onClose }) {
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

function Footer({ scrollTo }) {
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
function Navbar({ activeSection, scrollTo, isSubPage = false }) {
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
function EventLightbox({ event, onClose }) {
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

function HappeningPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const [lightboxEvent, setLightboxEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => {
        setUpcomingEvents(data.events || []);
        setWeeklyEvents(data.recurring || []);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="happening" scrollTo={subScrollTo} isSubPage={true} />
      <HappeningHero />
      <PromoBanner page="Whats Happening" />
      <EventTimeline />
      <WeeklyEventsSection events={weeklyEvents} onEventClick={setLightboxEvent} />
      <CalendarSection events={upcomingEvents} onEventClick={setLightboxEvent} activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Promote upsell strip */}
      <div style={{ background: C.dusk, padding: "32px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 6 }}>
              Want more exposure?
            </div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.cream, fontWeight: 400 }}>
              Hero Feature · Newsletter Spotlight · Featured Banners
            </div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Founding sponsor rates available now — limited spots
            </div>
          </div>
          <Btn href="/promote" variant="sunset">See Packages →</Btn>
        </div>
      </div>

      <VideoSection />
      <HappeningSubmitCTA simple />
      <WaveDivider topColor={C.night} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="happening" />
      <Footer scrollTo={subScrollTo} />
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
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
// 🌊  ROUND LAKE PAGE
// ============================================================
const ROUND_LAKE_STATS = [
  { label: "Surface Area", value: "515 acres" },
  { label: "Max Depth", value: "67 feet" },
  { label: "Elevation", value: "~918 ft" },
  { label: "Water Clarity", value: "Very clear" },
];

const ROUND_LAKE_FISH = [
  { name: "Largemouth Bass", image: "/images/fish/largemouth-bass.jpg", note: "Healthy population — best early morning before boat traffic" },
  { name: "Smallmouth Bass", image: "/images/fish/smallmouth-bass.jpg", note: "Rocky structure near shore" },
  { name: "Bluegill", image: "/images/fish/bluegill.jpg", note: "Excellent numbers — averaged 7\" in DNR surveys, 70% legal size" },
  { name: "Northern Pike", image: "/images/fish/northern-pike.jpg", note: "Tip Up Festival favorite — ice fishing in February" },
  { name: "Walleye", image: "/images/fish/walleye.jpg", note: "DNR stocked — trolling at 10–15 ft depths in summer" },
  { name: "Black Crappie", image: "/images/fish/black-crappie.jpg", note: "Good catches, especially through the ice" },
  { name: "Yellow Perch", image: "/images/fish/yellow-perch.jpg", note: "Averaged 9\"+ in surveys — above state average" },
  { name: "Pumpkinseed Sunfish", image: "/images/fish/pumpkinseed.jpg", note: "Abundant near weed beds" },
];

const ROUND_LAKE_TIMELINE = [
  { year: "~10,000 BC", event: "Wisconsin Glaciation carves Round Lake — a kettle lake formed where the Erie and Saginaw ice lobes met, part of the Irish Hills interlobate moraine." },
  { year: "Pre-1830", event: "Potawatomi and Ojibwa tribes camp along the north and east shores of Round Lake during summers for fishing and gathering. Chief Metwa's people establish council grounds at nearby Devils Lake." },
  { year: "1833", event: "First European settlers arrive — Orson Green and the Beal family secure land in Rollin Township." },
  { year: "1870s", event: "Resort era begins. Hotels spring up, railroad stations bring tourists, and steam launches offer tours through the channel connecting Round Lake and Devils Lake." },
  { year: "1888", event: "Manitou Beach officially founded. Land subdivided and sold for cottage construction around both lakes." },
  { year: "1950s", event: "The Devils and Round Lake Tip Up Festival launches — an ice fishing and winter celebration that continues 73+ years later." },
  { year: "1961–1992", event: "Michigan DNR stocks Round Lake system with tiger muskellunge, walleye, and redear sunfish to enhance the fishery." },
  { year: "Today", event: "Round Lake remains the quieter side of lake life — a residential retreat with clear water, excellent fishing, and deep roots in the Manitou Beach community." },
];

function RoundLakeHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/explore-round-lake.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk,
      padding: "180px 24px 140px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(170deg, rgba(10,18,24,0.72) 0%, rgba(10,18,24,0.45) 50%, rgba(10,18,24,0.82) 100%)",
      }} />

      {/* Decorative "515" — the lake's acreage */}
      <div style={{
        position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
        fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(140px, 22vw, 320px)",
        fontWeight: 700, color: "rgba(255,255,255,0.04)", lineHeight: 1,
        userSelect: "none", letterSpacing: -12, pointerEvents: "none",
      }}>
        515
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Lenawee County · Irish Hills
          </div>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: "clamp(56px, 10vw, 120px)",
            fontWeight: 400, color: C.cream, lineHeight: 0.95, margin: "0 0 20px 0",
          }}>
            Round<br />Lake
          </h1>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)",
            color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 480, margin: "0 0 28px 0",
          }}>
            515 acres of clear water, 67 feet deep. The quieter side of lake life — connected to Devils Lake by a shallow channel and to the Manitou Beach community by everything else.
          </p>
          <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          <ShareBar title="Round Lake — Manitou Beach, Michigan" />
        </div>
      </div>
    </section>
  );
}

function RoundLakeStatsSection() {
  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>The Numbers</SectionLabel>
          <SectionTitle light>Lake Stats</SectionTitle>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginTop: 40 }}>
          {ROUND_LAKE_STATS.map((stat, i) => (
            <FadeIn key={i} delay={i * 60} direction="scale">
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "28px 20px", textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.sunsetLight, fontWeight: 400, marginBottom: 8, lineHeight: 1.2 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={400}>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginTop: 32, maxWidth: 600, fontFamily: "'Libre Franklin', sans-serif" }}>
            Round Lake is a glacial kettle lake carved during the Wisconsin Glaciation when the Erie and Saginaw ice lobes collided to form the Irish Hills interlobate moraine — one of over 50 kettle lakes in the region. Connected to Devils Lake via a shallow channel at Cherry Point.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function RoundLakeHistorySection() {
  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Through the Years</SectionLabel>
          <SectionTitle>A History Shaped by Water</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 0 60px 0" }}>
            Long before the cottages and the boat docks, this land belonged to the Potawatomi. The lake's story starts with ice — and continues with the people who never wanted to leave.
          </p>
        </FadeIn>

        <div style={{ position: "relative", paddingLeft: 40 }}>
          {/* Vertical timeline line */}
          <div style={{ position: "absolute", left: 12, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${C.sage}, ${C.sunset}, ${C.lakeBlue}, transparent)`, borderRadius: 1 }} />

          {ROUND_LAKE_TIMELINE.map((item, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{ marginBottom: 40, position: "relative" }}>
                {/* Dot on the timeline */}
                <div style={{
                  position: "absolute", left: -34, top: 6,
                  width: 10, height: 10, borderRadius: "50%",
                  background: i === ROUND_LAKE_TIMELINE.length - 1 ? C.sunset : C.sage,
                  border: `2px solid ${C.cream}`,
                  boxShadow: i === ROUND_LAKE_TIMELINE.length - 1 ? `0 0 12px ${C.sunset}40` : "none",
                }} />
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sage, marginBottom: 4 }}>
                  {item.year}
                </div>
                <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, margin: 0, maxWidth: 560 }}>
                  {item.event}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoundLakeFishingSection() {
  return (
    <section style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>On the Line</SectionLabel>
          <SectionTitle>Fishing Round Lake</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 0 20px 0" }}>
            Clear water, healthy populations, and fish growth rates that exceed state averages. Round Lake is a serious fishery — whether you're casting from shore or dropping a line through the ice.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {ROUND_LAKE_FISH.map((fish, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div style={{
                background: C.cream, borderRadius: 12, border: `1px solid ${C.sand}`,
                overflow: "hidden", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Fish image or emoji fallback */}
                <div style={{ height: 120, overflow: "hidden", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {fish.image ? (
                    <img src={fish.image} alt={fish.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                  ) : (
                    <span style={{ fontSize: 40 }}>{fish.icon}</span>
                  )}
                </div>
                <div style={{ padding: "14px 18px" }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>
                    {fish.name}
                  </h3>
                  <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6, margin: 0 }}>
                    {fish.note}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Tip Up Festival callout */}
        <FadeIn delay={500}>
          <div style={{
            marginTop: 56, background: `linear-gradient(135deg, ${C.dusk}, ${C.night})`,
            borderRadius: 16, padding: "40px 36px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -20, right: -10, fontSize: 120, opacity: 0.06, userSelect: "none", pointerEvents: "none" }}>🎣</div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunsetLight, marginBottom: 8 }}>Every February · 73+ Years Running</div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0", lineHeight: 1.2 }}>
                Devils & Round Lake Tip Up Festival
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 20px 0", maxWidth: 500 }}>
                Ice fishing contests for pike, walleye, bluegill, crappie, and perch. Plus snowmobile racing, ATV races, outhouse races, and community fundraising. One of the longest-running winter festivals in Michigan.
              </p>
              <Btn href="/happening" variant="outlineLight" small>See All Events →</Btn>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function RoundLakeCommunitySection() {
  return (
    <section style={{ background: C.dusk, padding: "100px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>The Neighborhood</SectionLabel>
          <SectionTitle light>The Quieter Side of Lake Life</SectionTitle>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 560, margin: "0 0 48px 0" }}>
            No bars. No marinas. No tourist attractions. Just homes on the water, families who've been here for generations, and the kind of silence you can't find on the party lake across the road.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { title: "Part of Manitou Beach", desc: "Same post office (49253), same schools (Onsted Community), same township (Rollin). Round Lake and Devils Lake share a census-designated place — officially Manitou Beach-Devils Lake." },
            { title: "Connected by Water", desc: "A shallow channel at Cherry Point links Round Lake to Devils Lake. Too shallow for boats today — but during the resort era, steam launches navigated it carrying tourists between the lakes." },
            { title: "Year-Round & Seasonal", desc: "A mix of full-time residents and seasonal cottage owners. The area is transitioning — more year-round families every year, part of Manitou Beach's evolution from summer resort to permanent community." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 80} direction={i % 2 === 0 ? "left" : "right"}>
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14, padding: "32px 28px",
              }}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, fontWeight: 400, color: C.cream, margin: "0 0 10px 0", lineHeight: 1.3 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Men's Club callout */}
        <FadeIn delay={400}>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 8 }}>Community Organization</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>
              Devils & Round Lake Men's Club
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              A charitable nonprofit that donates laptops to students, supports Toys for Tots, runs benefit auctions, and sponsors Shop with a Cop. The club that ties both lakes together.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function LakesPreservationBanner() {
  return (
    <section style={{ background: C.cream, padding: "0 24px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <a
            href="https://lakespreservationleague.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none", display: "block" }}
          >
            <div style={{
              background: `linear-gradient(135deg, ${C.lakeBlue}10, ${C.sage}10)`,
              border: `1px solid ${C.lakeBlue}30`,
              borderRadius: 14,
              padding: "28px 32px",
              display: "flex",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.lakeBlue}18, ${C.sage}14)`; e.currentTarget.style.borderColor = `${C.lakeBlue}50`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${C.lakeBlue}10, ${C.sage}10)`; e.currentTarget.style.borderColor = `${C.lakeBlue}30`; }}
            >
              <div style={{ fontSize: 32, lineHeight: 1 }}>🌿</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.lakeBlue, marginBottom: 6 }}>Community PSA</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>Lakes Preservation League</h3>
                <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.65, margin: 0, maxWidth: 540 }}>
                  A nonprofit dedicated to protecting and preserving the natural health of area lakes through water quality monitoring, invasive species management, and community education. These lakes are worth protecting.
                </p>
              </div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.lakeBlue, whiteSpace: "nowrap" }}>
                Learn More →
              </div>
            </div>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

function RoundLakePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <RoundLakeHero />
      <RoundLakeStatsSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <RoundLakeHistorySection />
      <PromoBanner page="Round Lake" />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <RoundLakeFishingSection />
      <LakesPreservationBanner />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <RoundLakeCommunitySection />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />
      <NewsletterInline />
      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="round-lake" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🏘️  MANITOU BEACH VILLAGE PAGE
// ============================================================
function VillageHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/explore-lighthouse.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk,
      padding: "180px 24px 140px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(170deg, rgba(10,18,24,0.7) 0%, rgba(10,18,24,0.4) 50%, rgba(10,18,24,0.85) 100%)",
      }} />

      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Shops · Cafes · Gifts · Wine Tasting
          </div>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: "clamp(48px, 9vw, 110px)",
            fontWeight: 400, color: C.cream, lineHeight: 0.95, margin: "0 0 20px 0",
          }}>
            The<br />Village
          </h1>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)",
            color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 480, margin: "0 0 28px 0",
          }}>
            A walkable strip of boutique shops, a from-scratch cafe, satellite wine tasting rooms, and the iconic lighthouse replica. This is where Manitou Beach comes to life on foot.
          </p>
          <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          <ShareBar title="Manitou Beach Village — Shops, Wine & the Lighthouse" />
        </div>
      </div>
    </section>
  );
}

function VillageMapSection() {
  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>The Strip</SectionLabel>
          <SectionTitle light>Walk the Village</SectionTitle>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 520, marginBottom: 48 }}>
            Everything's within a five-minute walk. Park once, stroll the boulevard, and hit every shop. That's the beauty of a village built to human scale.
          </p>
        </FadeIn>

        {/* Village business cards — staggered layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {VILLAGE_BUSINESSES.map((biz, i) => {
            const color = CAT_COLORS[biz.category] || C.sage;
            return (
              <FadeIn key={biz.id} delay={i * 80} direction={i % 2 === 0 ? "left" : "right"}>
                <div
                  onClick={() => biz.website && window.open(biz.website, "_blank")}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, padding: "28px 24px",
                    cursor: biz.website ? "pointer" : "default",
                    transition: "all 0.25s",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex", flexDirection: "column",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px ${color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Accent stripe */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "14px 0 0 14px" }} />

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1 }}>
                    {biz.logo && (
                      <img src={biz.logo} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.cream, margin: "0 0 4px 0", lineHeight: 1.3 }}>
                        {biz.name}
                      </h3>
                      <div style={{ fontSize: 11, color: color, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                        {biz.category}
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 10px 0", whiteSpace: "pre-line", flex: 1 }}>
                        {biz.description}
                      </p>
                      {biz.address && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                          📍 {biz.address}
                        </div>
                      )}
                      {biz.phone && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                          📞 {biz.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {biz.website && (
                    <div className="link-hover-underline" style={{
                      fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
                      letterSpacing: 1.5, color: C.sunsetLight, textTransform: "uppercase", marginTop: 14,
                    }}>
                      Visit Website →
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VillageHistorySection() {
  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Roots</SectionLabel>
          <SectionTitle>A Village with a Story</SectionTitle>
        </FadeIn>

        <div className="village-roots-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 48 }}>
          <FadeIn delay={100} direction="left">
            <div style={{ background: C.warmWhite, borderRadius: 14, padding: "32px 28px", border: `1px solid ${C.sand}` }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sage, marginBottom: 10 }}>The Resort Era</div>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                By the 1870s, Manitou Beach had hotels, bathhouses, a dance pavilion, and two railroad stations bringing tourists from Detroit and beyond. Steam launches carried passengers between Devils Lake and Round Lake through a dredged channel. The village was the social centre of it all.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200} direction="right">
            <div style={{ background: C.warmWhite, borderRadius: 14, padding: "32px 28px", border: `1px solid ${C.sand}` }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunset, marginBottom: 10 }}>The Revival</div>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                After decades of quiet, the village is finding its rhythm again. Independent shop owners — many of them locals who grew up on the lake — are filling storefronts with boutiques, cafes, and creative businesses. The lighthouse replica stands as a reminder: this place was always meant to draw people in.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={300} direction="left">
            <div style={{ background: C.warmWhite, borderRadius: 14, padding: "32px 28px", border: `1px solid ${C.sand}` }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.lakeBlue, marginBottom: 10 }}>The Lighthouse</div>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                Yes, it's landlocked. No, it never guided ships. But the lighthouse replica at Devils Lake View Living has become the most photographed landmark in Manitou Beach — a beacon for the village and a symbol of a community that builds things worth looking at.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={400} direction="right">
            <div style={{ background: C.warmWhite, borderRadius: 14, padding: "32px 28px", border: `1px solid ${C.sand}` }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "#8B5E3C", marginBottom: 10 }}>Wine Country Meets Lake Country</div>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                Starting May 2026, village shops become satellite tasting rooms for Michigan wineries. Ang & Co pours Chateau Fontaine from Leelanau Peninsula. Faust House represents Cherry Creek Cellars from Brooklyn. A new chapter for the village — and a reason to visit every weekend.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function VillageVisitCTA() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.night} 100%)`,
      padding: "80px 24px",
      textAlign: "center",
    }}>
      <FadeIn direction="scale">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunsetLight, marginBottom: 12 }}>Plan Your Visit</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 400, color: C.cream, margin: "0 0 16px 0", lineHeight: 1.2 }}>
            Come See It for Yourself
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 32px 0" }}>
            The village is on Devils Lake Highway and Lakeview Boulevard in Manitou Beach. Most shops are open Thursday through Sunday — but check individual hours before making the trip.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => window.open("https://maps.google.com/?q=Devils+Lake+Hwy+Manitou+Beach+MI+49253", "_blank")} variant="sunset">Get Directions</Btn>
            <Btn href="/featured" variant="outlineLight">List Your Business</Btn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function VillagePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <VillageHero />
      <PromoBanner page="Village" />
      <VillageMapSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <VillageHistorySection />
      <DiagonalDivider topColor={C.cream} bottomColor={C.dusk} />
      <VillageVisitCTA />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />
      <MBHRSTimelineSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="village" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// ⭐  FEATURED BUSINESS — SALES PAGE + STRIPE CHECKOUT
// ============================================================
const FEATURED_TIERS = [
  { id: "enhanced", name: "Enhanced" },
  { id: "featured", name: "Featured" },
  { id: "premium", name: "Premium" },
];

const SPOTS_TOTAL = 8;
const SPOTS_LEFT = 5; // Update manually when spots fill — future: pull from Notion

function FeaturedPage() {
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
    const cap = SLOT_CAPS[tierId]; // undefined = no cap (Enhanced)
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
                    if (cap === undefined) return null; // Enhanced = no cap
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

// ============================================================
// 🏛️  MEN'S CLUB PAGE (/mens-club)
// ============================================================
const MENS_CLUB_STATS = [
  { label: "Founded", value: "501(c)(3)", sub: "IRS Ruling 2016" },
  { label: "EIN", value: "46-4087550", sub: "Tax-exempt nonprofit" },
  { label: "Tip-Up Festival", value: "70+", sub: "Years running" },
  { label: "Toys for Tots", value: "$8,000+", sub: "In donations" },
  { label: "Address", value: "3171", sub: "Round Lake Hwy" },
  { label: "Annual Events", value: "6+", sub: "Community events" },
];

const MENS_CLUB_EVENTS = [
  {
    title: "Tip-Up Festival",
    date: "First weekend of February",
    desc: "The crown jewel — 70+ years of ice fishing, snowmobile racing, outhouse races, hovercraft rides, poker runs, and the benefit auction. Held on frozen Devils Lake, it's the longest-running winter festival in the Irish Hills.",
    image: "/images/mens-club/tip-up-1.jpg",
  },
  {
    title: "Firecracker 7K Run/Walk",
    date: "July 4th — 8:00 AM",
    desc: "A Fourth of July tradition starting at 3171 Round Lake Hwy. Choose the 7K run/walk or 1-mile family fun run. Proceeds fund the Devils Lake fireworks display.",
    image: "/images/mens-club/firecracker-7k.jpg",
  },
  {
    title: "Golf Outing",
    date: "Annual — Summer",
    desc: "A community golf outing that brings together members, local businesses, and supporters. All proceeds benefit the club's charitable programs.",
    image: "/images/mens-club/golf.jpg",
  },
  {
    title: "Benefit Auction & Raffle",
    date: "During Tip-Up Festival",
    desc: "The auction is the club's biggest fundraiser — local businesses and community members donate items. Proceeds support laptops for students, Toys for Tots, Shop with a Cop, and food pantries.",
    image: "/images/mens-club/auction.jpg",
  },
  {
    title: "Fireworks Display",
    date: "July 4th & Special Events",
    desc: "Working with the Devils & Round Lake Fireworks Association, the club helps fund and organize the summer fireworks display over Devils Lake.",
    image: "/images/mens-club/fireworks.jpg",
  },
  {
    title: "Community Service Days",
    date: "Year-round",
    desc: "Throughout the year, club members volunteer for lake cleanups, food drives, Christmas gift baskets, and support for families in need through the Community for People in Need program.",
    image: "/images/mens-club/shop-with-a-cop.jpg",
  },
];

const MENS_CLUB_PROGRAMS = [
  { icon: "🎓", title: "Laptops for Students", desc: "Donating laptops to college-bound high school graduates from the local community." },
  { icon: "🎄", title: "Toys for Tots", desc: "Over $8,000 contributed to ensure every child in the area has a gift under the tree." },
  { icon: "👮", title: "Shop with a Cop", desc: "Partnering with local law enforcement to give kids a positive holiday shopping experience." },
  { icon: "🍞", title: "Food Pantry Support", desc: "Collecting pantry items for the Kiwanis Club and Community for People in Need." },
  { icon: "🎁", title: "Christmas Gift Baskets", desc: "Assembling and delivering holiday gift baskets to families facing hardship." },
  { icon: "🎆", title: "Fireworks Fund", desc: "Funding the annual July 4th fireworks display over Devils Lake for the entire community." },
];

function MensClubHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/mens-club-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: C.night,
      padding: "180px 24px 140px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.72) 0%, rgba(10,18,24,0.45) 50%, rgba(10,18,24,0.85) 100%)" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <img src="/images/mens_club_logo.png" alt="Men's Club Logo" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: `3px solid rgba(255,255,255,0.18)`, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
          501(c)(3) Nonprofit
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 20px 0" }}>
          Devils & Round Lake<br />Men's Club
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
          Service, leadership, tradition, fellowship, and fun. Supporting needy families and community events across Manitou Beach since the days our grandfathers fished these lakes.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://www.facebook.com/profile.php?id=100064837808733" target="_blank" rel="noopener noreferrer" className="btn-animated" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 8,
            background: C.sunset, color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
          }}>
            Follow on Facebook
          </a>
          <a href="#mens-club-events" className="btn-animated" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 8,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
          }}>
            View Events
          </a>
          <ShareBar title="Devils & Round Lake Men's Club — Manitou Beach" />
        </div>
      </div>
    </section>
  );
}

function MensClubStatsSection() {
  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>At a Glance</SectionLabel>
            <SectionTitle center>By the Numbers</SectionTitle>
          </div>
        </FadeIn>
        <div className="mens-club-stats" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {MENS_CLUB_STATS.map((stat, i) => (
            <FadeIn key={i} delay={i * 60} direction="scale">
              <div style={{
                background: C.warmWhite, borderRadius: 12, padding: "22px 16px", textAlign: "center",
                border: `1px solid ${C.sand}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, whiteSpace: "nowrap" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{stat.sub}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MensClubMissionSection() {
  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Our Mission</SectionLabel>
          <SectionTitle>Serving the Community Since Day One</SectionTitle>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32, marginTop: 40 }}>
          <FadeIn delay={100} direction="left">
            <div>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, margin: "0 0 18px 0" }}>
                The Devils and Round Lake Men's Club is a 501(c)(3) nonprofit dedicated to improving life in the Manitou Beach community. Through annual events like the legendary Tip-Up Festival and the Fourth of July Firecracker 7K, the club raises funds that go directly back to the people who need it most.
              </p>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, margin: 0 }}>
                From buying laptops for college-bound students to donating thousands in toys through Toys for Tots, partnering with law enforcement for Shop with a Cop, and delivering Christmas gift baskets to families in need — the Men's Club is the backbone of Manitou Beach's charitable community.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200} direction="right">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {MENS_CLUB_PROGRAMS.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", background: C.cream, borderRadius: 10, border: `1px solid ${C.sand}` }}>
                  <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 400, color: C.text }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, marginTop: 2 }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function MensClubEventsSection() {
  return (
    <section id="mens-club-events" style={{ background: C.dusk, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel light style={{ color: C.sunsetLight }}>Annual Calendar</SectionLabel>
            <SectionTitle center light>Events & Fundraisers</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gap: 16 }}>
          {MENS_CLUB_EVENTS.map((evt, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                display: "flex", gap: 0, alignItems: "stretch",
                background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                {evt.image ? (
                  <div style={{ width: 130, flexShrink: 0 }}>
                    <img src={evt.image} alt={evt.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ) : (
                  <div style={{ width: 130, flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  </div>
                )}
                <div style={{ flex: 1, padding: "22px 22px" }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.cream, margin: "0 0 4px 0" }}>{evt.title}</h3>
                  <div style={{ fontSize: 12, color: C.sunsetLight, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>{evt.date}</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, margin: 0 }}>{evt.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MensClubGallerySection() {
  // Gallery photos — add image paths here as they become available
  const galleryPhotos = [
    { src: "/images/mens-club/tip-up-1.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-2.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-3.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-4.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-5.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-6.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-7.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/firecracker-7k.jpg", caption: "Firecracker 7K" },
    { src: "/images/mens-club/firecracker-7k-2.jpg", caption: "Firecracker 7K" },
    { src: "/images/mens-club/auction.jpg", caption: "Benefit Auction" },
    { src: "/images/mens-club/fireworks.jpg", caption: "July 4th Fireworks" },
    { src: "/images/mens-club/shop-with-a-cop.jpg", caption: "Shop with a Cop" },
    { src: "/images/mens-club/toys-for-tots.jpg", caption: "Toys for Tots" },
  ];

  return galleryPhotos.length > 0 ? (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Memories</SectionLabel>
            <SectionTitle center>Gallery</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {galleryPhotos.map((photo, i) => (
            <FadeIn key={i} delay={i * 60} direction="scale">
              <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", aspectRatio: "4/3" }}>
                <img src={photo.src} alt={photo.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {photo.caption && (
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "10px 14px", background: "linear-gradient(transparent, rgba(10,18,24,0.8))",
                    fontSize: 12, color: C.cream, fontFamily: "'Libre Franklin', sans-serif",
                  }}>
                    {photo.caption}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  ) : null;
}

function MensClubGetInvolved() {
  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel>Get Involved</SectionLabel>
          <SectionTitle center>Join the Club</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, marginBottom: 32 }}>
            Whether you want to volunteer at Tip-Up, help with the fireworks, or just meet good people who care about this community — the Men's Club is always looking for new members.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://www.facebook.com/profile.php?id=100064837808733" target="_blank" rel="noopener noreferrer" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: C.sunset, color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Message on Facebook
            </a>
            <a href="https://maps.google.com/?q=3171+Round+Lake+Hwy+Manitou+Beach+MI+49253" target="_blank" rel="noopener noreferrer" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: "transparent", border: `1.5px solid ${C.sand}`, color: C.text,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Get Directions
            </a>
          </div>
          <p style={{ fontSize: 12, color: C.textMuted, marginTop: 20 }}>
            3171 Round Lake Hwy, Manitou Beach, MI 49253
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function MensClubPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <MensClubHero />
      <MensClubStatsSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <MensClubMissionSection />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <MensClubEventsSection />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />
      <MensClubGallerySection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <MensClubSponsorsSection />
      <MensClubGetInvolved />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🏛️  HISTORICAL SOCIETY PAGE (/historical-society)
// ============================================================
const MBHRS_PROGRAMS = [
  {
    image: "/images/historical/art-gallery.jpg",
    title: "Boat House Art Gallery",
    desc: "The largest nonprofit art gallery in Lenawee County, featuring work from over 50 artists. Located at 138 N. Lakeview Blvd — curating fine art from Michigan's Irish Hills community.",
    address: "138 North Lakeview Boulevard, Manitou Beach, MI 49253",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
  },
  {
    image: "/images/historical/art-festival.jpg",
    title: "Devils Lake Festival of the Arts",
    desc: "An annual summer art festival in the Village — 50 fine artists, 50 crafters, children's activities, live music, and food trucks. Free shuttle buses run all day between parking lots.",
    date: "Annual — Summer (10 AM – 6 PM)",
    link: "https://www.facebook.com/ManitouBeachBoathouseArtGallery/",
  },
  {
    image: "/images/historical/car-show.jpg",
    title: "Classic Car Shows",
    desc: "Bringing car show enthusiasts together in the Village for community celebrations of automotive history and local culture.",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
  },
  {
    image: "/images/historical/conservation.jpg",
    title: "Land & Water Conservation",
    desc: "Active stewardship projects to protect and restore the natural environment around Devils Lake and the surrounding watershed.",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
  },
  {
    image: "/images/historical/restoration.jpg",
    title: "Village Restoration",
    desc: "Ongoing renovation projects to restore historic buildings and infrastructure in Manitou Beach Village, preserving the area's architectural heritage.",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
  },
  {
    image: "/images/historical/childresn-art.jpg",
    title: "Children's Arts Programs",
    desc: "Arts education and creative programs for young people, fostering the next generation of artists and community members.",
    link: "https://manitoubeachcreative.org",
  },
];

const MBHRS_TIMELINE = [
  { year: "Origins", title: "A Village Built by Visitors", desc: "Manitou Beach emerged as a resort destination in the late 1800s, attracting visitors from across Michigan and beyond. Grand hotels, pavilions, and a thriving commercial district defined the village." },
  { year: "Decline", title: "The Quiet Years", desc: "As highways bypassed the village and resort culture shifted, Manitou Beach's commercial center fell into disrepair. Many historic buildings sat empty or deteriorated." },
  { year: "Revival", title: "MBHRS Is Founded", desc: "The Manitou Beach Historic Renovation Society was established to reverse decades of decline — investing in the future by preserving the past. The mission: restore, renovate, and revitalize the village." },
  { year: "Gallery", title: "The Boat House Opens", desc: "MBHRS transforms a lakeside building into the Boat House Art Gallery — now the largest nonprofit gallery in Lenawee County, showcasing 50+ Michigan artists." },
  { year: "Festival", title: "Festival of the Arts", desc: "The Devils Lake Festival of the Arts debuts, filling the Village with 100 artist booths, live music, food, and thousands of visitors. It becomes an annual tradition." },
  { year: "Today", title: "A Cultural Anchor", desc: "MBHRS continues its mission — the Lock archway greets visitors, the gallery thrives, car shows bring energy, and conservation projects protect the land and water." },
];

function HistoricalSocietyHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/historic-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      backgroundColor: C.night,
      padding: "160px 24px 120px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(10,18,24,0.82) 0%, rgba(10,18,24,0.65) 50%, rgba(10,18,24,0.88) 100%)" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <img src="/images/mbhrs_logo.png" alt="MBHRS Logo" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: `3px solid rgba(255,255,255,0.12)` }} />
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
          Investing in the Future by Preserving the Past
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 5.5vw, 56px)", fontWeight: 400, color: C.cream, lineHeight: 1.1, margin: "0 0 20px 0" }}>
          Manitou Beach Historic<br />Renovation Society
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
          Restoring the Village, cultivating the arts, conserving the land and water — MBHRS is the steward of Manitou Beach's past, present, and future.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#mbhrs-programs" className="btn-animated" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 8,
            background: C.sunset, color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
          }}>
            Our Programs
          </a>
          <a href="https://www.facebook.com/ManitouBeachBoathouseArtGallery/" target="_blank" rel="noopener noreferrer" className="btn-animated" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 8,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
          }}>
            Gallery on Facebook
          </a>
          <ShareBar title="Manitou Beach Historic Renovation Society & Boat House Gallery" />
        </div>
      </div>
    </section>
  );
}

function MBHRSTimelineSection() {
  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 750, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Our Story</SectionLabel>
            <SectionTitle center>A Timeline of Renewal</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div className="timeline-pulse" style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: `${C.sand}`, borderRadius: 2 }} />
          {MBHRS_TIMELINE.map((item, i) => (
            <FadeIn key={i} delay={i * 80} direction={i % 2 === 0 ? "left" : "right"}>
              <div style={{ display: "flex", gap: 24, marginBottom: 36, position: "relative" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: C.cream, letterSpacing: 0.5,
                  fontFamily: "'Libre Franklin', sans-serif",
                  flexShrink: 0, zIndex: 1,
                }}>
                  {item.year.length <= 4 ? item.year : "•"}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sage, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4 }}>
                    {item.year}
                  </div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MBHRSProgramsSection() {
  return (
    <section id="mbhrs-programs" style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>What We Do</SectionLabel>
            <SectionTitle center>Programs & Initiatives</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
          {MBHRS_PROGRAMS.map((prog, i) => (
            <FadeIn key={i} delay={i * 70} direction="scale">
              <div style={{
                background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}`, height: "100%", overflow: "hidden",
              }}>
                <div style={{ paddingTop: "75%", position: "relative", overflow: "hidden" }}>
                  {prog.image ? (
                    <img src={prog.image} alt={prog.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: C.driftwood }}>Photo Coming</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "22px 24px" }}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.text, margin: "0 0 8px 0" }}>{prog.title}</h3>
                <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.7, margin: "0 0 12px 0" }}>{prog.desc}</p>
                {prog.date && <div style={{ fontSize: 11, color: C.sage, fontWeight: 600, letterSpacing: 0.5 }}>{prog.date}</div>}
                {prog.address && (
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                    📍 {prog.address}
                  </div>
                )}
                {prog.phone && (
                  <a href={`tel:${prog.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", display: "block", marginTop: 4 }}>
                    📱 {prog.phone}
                  </a>
                )}
                {prog.email && (
                  <a href={`mailto:${prog.email}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", display: "block", marginTop: 4 }}>
                    ✉️ {prog.email}
                  </a>
                )}
                {prog.link && (
                  <a href={prog.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", display: "inline-block", marginTop: 6, fontWeight: 600 }}>
                    Visit Website →
                  </a>
                )}
                </div>{/* end padding div */}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function MBHRSBoatHouseFeature() {
  return (
    <section style={{
      backgroundImage: "url(/images/boathouse-background.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      padding: "80px 24px",
      position: "relative",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(14,24,32,0.78)", zIndex: 0 }} />
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
            Featured Venue
          </div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 400, color: C.cream, margin: "0 0 16px 0" }}>
            The Boat House Art Gallery
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 24px" }}>
            The largest nonprofit art gallery in Lenawee County. Over 50 Michigan artists showcasing paintings, sculptures, photography, and mixed media. Located in the heart of the Village at 138 N. Lakeview Blvd.
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
            {[
              { label: "Artists", value: "50+" },
              { label: "Status", value: "501(c)(3)" },
              { label: "County", value: "Lenawee" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color: C.cream }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:5172241984" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 8,
              background: C.sunset, color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Call (517) 224-1984
            </a>
            <a href="mailto:mbboathouseartgallery@gmail.com" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 28px", borderRadius: 8,
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Email the Gallery
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function MBHRSSupportSection() {
  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel>Support the Mission</SectionLabel>
          <SectionTitle center>Help Preserve Manitou Beach</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, marginBottom: 32 }}>
            MBHRS is a volunteer-driven nonprofit. Every dollar goes toward restoring the Village, supporting the arts, and conserving our natural resources. Your support makes a direct impact.
          </p>
          <div style={{
            background: C.warmWhite, borderRadius: 14, padding: "32px 28px", border: `1px solid ${C.sand}`,
            textAlign: "left", marginBottom: 32,
          }}>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text, margin: "0 0 14px 0" }}>How to Help</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Volunteer at the Festival of the Arts or car shows",
                "Donate to the gallery or renovation projects",
                "Submit artwork to the Boat House Art Gallery",
                "Attend events and spread the word",
                "Connect local businesses with MBHRS programs",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6, padding: "6px 0", paddingLeft: 20, position: "relative" }}>
                  <span style={{ position: "absolute", left: 0, color: C.sage }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p style={{ fontSize: 12, color: C.textMuted }}>
            MBHRS — 762 Manitou Road, Manitou Beach, MI 49253
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function HistoricalSocietyPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <HistoricalSocietyHero />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <MBHRSProgramsSection />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <MBHRSBoatHouseFeature />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />
      <MBHRSSupportSection />
      <RoundLakeHistorySection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="historical-society" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🎣  FISHING PAGE (/fishing)
// ============================================================
const DEVILS_LAKE_FISH = [
  {
    name: "Largemouth Bass",
    latin: "Micropterus salmoides",
    image: "/images/fish/largemouth-bass.jpg",
    accentColor: C.sage,
    desc: "The king of Devils Lake. Ambush predators that hang tight to structure — docks, fallen timber, weed edges. Aggressive fighters that will have you coming back every weekend.",
    bait: ["Plastic worms (Texas rig)", "Jigs with crawfish trailer", "Topwater frogs over weeds", "Spinnerbaits", "Crankbaits in early spring"],
    tackle: "Medium-heavy rod, 12–17 lb fluorocarbon or braid",
    bestTime: "Dawn & dusk — especially the first two hours after sunrise",
    bestSeason: "Late May through October. Peak: June–July spawn",
    dnrNote: "Healthy, naturally reproducing population. Catch-and-release helps maintain trophy size fish.",
  },
  {
    name: "Smallmouth Bass",
    latin: "Micropterus dolomieu",
    image: "/images/fish/smallmouth-bass.jpg",
    accentColor: C.sage,
    desc: "Pound-for-pound one of the hardest-fighting fish in freshwater. Found along rocky shoreline areas and gravelly points. Smaller than largemouth but will test your drag.",
    bait: ["Tube jigs", "Drop shot with finesse worm", "Small crankbaits", "Live crayfish", "Ned rig"],
    tackle: "Medium rod, 8–12 lb fluorocarbon",
    bestTime: "Morning and late afternoon",
    bestSeason: "Spring (pre-spawn) and Fall. Cooler water brings them shallower.",
    dnrNote: "Prefers cooler, clearer water — more common near rocky areas on the north shore.",
  },
  {
    name: "Bluegill",
    latin: "Lepomis macrochirus",
    image: "/images/fish/bluegill.jpg",
    accentColor: C.lakeBlue,
    desc: "The ultimate family fish and the best eating in the lake. Devils Lake has excellent bluegill numbers — beds are visible from shore in 2–4 feet of water during the June spawn. Great for kids and beginners.",
    bait: ["Small worms on #8 hook", "Crickets", "Small jigs (1/32 oz)", "Wax worms", "Bread balls"],
    tackle: "Light rod, 4–6 lb monofilament, small bobber",
    bestTime: "Midday during spawn (June). Early morning rest of season.",
    bestSeason: "Year-round. Spawn (late May–June) is easiest. Ice fishing produces well in winter.",
    dnrNote: "Averaged 7\" in DNR surveys — 70% legal size. One of the healthiest panfish populations in the region.",
  },
  {
    name: "Northern Pike",
    latin: "Esox lucius",
    image: "/images/fish/northern-pike.jpg",
    accentColor: C.sunset,
    desc: "The Tip-Up Festival star. Aggressive ambush predators with a mouth full of teeth — use a wire leader. Through the ice in February they're at their most accessible. Summer pike hit big lures and live bait near weed beds.",
    bait: ["Large swimbaits", "Live suckers or shiners (ice fishing)", "Tip-ups with sucker minnow", "Big spinnerbaits", "Johnson Silver Minnow over weeds"],
    tackle: "Medium-heavy to heavy rod, 20–30 lb braid, steel or titanium wire leader",
    bestTime: "Early morning and overcast days",
    bestSeason: "Ice fishing (January–February) and early spring post ice-out. Summer weeds produce too.",
    dnrNote: "Popular target for the annual Tip-Up Festival. A 36\"+ fish is a real trophy on Devils Lake.",
  },
  {
    name: "Black Crappie",
    latin: "Pomoxis nigromaculatus",
    image: "/images/fish/black-crappie.jpg",
    accentColor: C.lakeDark,
    desc: "Light flaky meat that fries up beautifully. Crappie school up in spring near submerged structure — brush piles, dock pilings, and fallen trees. Patient fishing pays off.",
    bait: ["Small tube jigs (1/16–1/8 oz)", "Crappie jigs with marabou", "Small minnows under bobber", "Tiny swimbaits", "Wax worms"],
    tackle: "Ultralight rod, 4–6 lb monofilament, sensitive bobber",
    bestTime: "Early morning and late afternoon. Dusk in summer.",
    bestSeason: "Spring spawn (April–May) is prime. Good through ice in winter.",
    dnrNote: "Best spring action near dock structures in 4–8 feet of water.",
  },
  {
    name: "Yellow Perch",
    latin: "Perca flavescens",
    image: "/images/fish/yellow-perch.jpg",
    accentColor: "#D4A017",
    desc: "Michigan's favorite panfish. Yellow perch school in large numbers and tend to be where you find one, you find a hundred. Sweet, firm white meat. A Devils Lake winter staple through the ice.",
    bait: ["Small jigs tipped with wax worm", "Live minnows", "Perch rigs with small hooks", "Gulp minnow tails", "Emerald shiners"],
    tackle: "Ultralight to light rod, 4–6 lb monofilament",
    bestTime: "Morning bite is strongest. Schools move — follow the action.",
    bestSeason: "Year-round. Excellent ice fishing through winter. Fall schools near deep structure.",
    dnrNote: "Averaged 9\"+ in DNR surveys — above state average. Strong naturally reproducing population.",
  },
  {
    name: "Pumpkinseed Sunfish",
    latin: "Lepomis gibbosus",
    image: "/images/fish/pumpkinseed.jpg",
    accentColor: "#E8A030",
    desc: "One of the most colorful freshwater fish in Michigan — orange and blue markings that look almost tropical. Abundant near weed beds and shoreline structure. A favorite for kids and great on ultralight tackle.",
    bait: ["Small worms", "Wax worms", "Tiny jigs", "Crickets", "Small meal worms"],
    tackle: "Ultralight rod, 4 lb line, small hook and bobber",
    bestTime: "Midday near shallow weed beds",
    bestSeason: "Late spring through summer. Spawn in June in shallow weeds.",
    dnrNote: "Abundant throughout Devils Lake near weed beds. Often caught alongside bluegill.",
  },
  {
    name: "Brown Bullhead",
    latin: "Ameiurus nebulosus",
    image: "/images/fish/brown-bullhead.jpg",
    accentColor: C.warmGray,
    desc: "Michigan's classic catfish. Whiskers, no scales, and a fighter at the end of the line. Night fishing for bullheads on warm summer evenings is a Manitou Beach tradition — cast and wait.",
    bait: ["Night crawlers", "Chicken liver", "Stink bait", "Dough balls", "Cut bait"],
    tackle: "Medium rod, 8–10 lb monofilament, bottom rig with 1–2 oz sinker",
    bestTime: "After dark — night fishing is most productive May through August",
    bestSeason: "Late spring through summer. Warm water triggers feeding.",
    dnrNote: "Bottom feeders. Best near muddy substrates and deep holes. A classic after-dark target.",
  },
];

const FISHING_SEASONS = [
  {
    season: "Spring",
    icon: "🌱",
    desc: "Bass spawn in the shallows from late May through June. Pike are aggressive post ice-out. Best topwater action of the year on Devils Lake.",
    tip: "Target weed edges at dawn. Bluegill nests are visible in 2–4 ft of water.",
  },
  {
    season: "Summer",
    icon: "☀️",
    desc: "Largemouth bass hold on deep structure during midday heat. Early morning and evening topwater is productive on both lakes. Round Lake walleye troll at 10–15 ft.",
    tip: "7 AM and 7 PM are prime windows. Dock fishing produces bass all day on Devils Lake.",
  },
  {
    season: "Fall",
    icon: "🍂",
    desc: "Feeding frenzy before winter. Bass, pike, and walleye all pack on weight. Some of the best fishing of the year. Round Lake perch can be exceptional in October.",
    tip: "Jerkbaits and spinnerbaits through October. Don't sleep on Devils Lake pier fishing.",
  },
  {
    season: "Ice Fishing",
    icon: "❄️",
    desc: "February means Tip-Up Festival — the crown jewel of Manitou Beach winters. Northern pike, walleye, bluegill, crappie, and perch through the ice on both lakes.",
    tip: "6–8 inches of clear ice typically by mid-January. Check DNR ice conditions before venturing out.",
  },
];

function FishingHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/explore-fishing.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk,
      padding: "180px 24px 140px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.75) 0%, rgba(10,18,24,0.45) 50%, rgba(10,18,24,0.88) 100%)" }} />
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Devils Lake · Round Lake · Michigan DNR
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 400, color: C.cream, lineHeight: 0.95, margin: "0 0 20px 0" }}>
            Fishing<br />Devils Lake
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 32px 0" }}>
            Two lakes. Twelve months of catching. Bass, pike, walleye, perch, and bluegill — plus one of Michigan's longest-running ice fishing festivals.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn href="https://www.michigan.gov/dnr/managing-resources/fisheries" variant="sunset">Michigan DNR Fishing Info ↗</Btn>
            <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          </div>
          <ShareBar title="Fishing Manitou Beach — Devils Lake & Round Lake" />
        </div>
      </div>
    </section>
  );
}

function FishingLakesSection() {
  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>Two Lakes, Two Fisheries</SectionLabel>
          <SectionTitle light>Know Your Water</SectionTitle>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginTop: 48 }}>
          <FadeIn delay={100} direction="left">
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: C.sunset, borderRadius: "16px 0 0 16px" }} />
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 24, color: C.sunsetLight, marginBottom: 8 }}>Devils Lake</div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.cream, margin: "0 0 16px 0" }}>The Party Lake</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Size", value: "1,330 acres" },
                  { label: "Depth", value: "65 ft max" },
                  { label: "Type", value: "Warm-water" },
                  { label: "Launch", value: "Public ramp" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.cream, fontFamily: "'Libre Baskerville', serif" }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                A warm-water lake with excellent bass, bluegill, and pike fishing. The boat launch is off Manitou Rd. Dock fishing is accessible year-round.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={200} direction="right">
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "36px 32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: C.lakeBlue, borderRadius: "16px 0 0 16px" }} />
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 24, color: "#A8C4D4", marginBottom: 8 }}>Round Lake</div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.cream, margin: "0 0 16px 0" }}>The Serious Fishery</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "Size", value: "515 acres" },
                  { label: "Depth", value: "67 ft max" },
                  { label: "Type", value: "Cold-water" },
                  { label: "Launch", value: "Public ramp" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.cream, fontFamily: "'Libre Baskerville', serif" }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                Deep, clear, and cold. DNR-stocked walleye, trophy perch, and excellent crappie. Fish growth rates exceed state averages. The quieter side of lake life.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function FishingSpeciesSection() {
  const [openFish, setOpenFish] = useState(null);

  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Species Guide</SectionLabel>
          <SectionTitle>Fish Found in Devils Lake</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 600, margin: "0 0 12px 0" }}>
            Eight warm-water species call Devils Lake home. Click any fish for bait recommendations, best tackle, and seasonal timing.
          </p>
          <a href="https://www.michigan.gov/dnr/education/michigan-species/fish-species" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", fontWeight: 600, letterSpacing: 0.5 }}>
            Michigan DNR Full Species Reference ↗
          </a>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 56 }}>
          {DEVILS_LAKE_FISH.map((fish, i) => {
            const isOpen = openFish === i;
            return (
              <FadeIn key={i} delay={i * 50} direction="left">
                <div
                  style={{
                    background: C.warmWhite, borderRadius: 16,
                    border: `1px solid ${isOpen ? fish.accentColor + "50" : C.sand}`,
                    overflow: "hidden", transition: "all 0.25s",
                    boxShadow: isOpen ? `0 8px 32px rgba(0,0,0,0.08)` : "none",
                  }}
                >
                  {/* Card header — always visible */}
                  <div
                    onClick={() => setOpenFish(isOpen ? null : i)}
                    className="fish-card-header"
                    style={{ display: "flex", gap: 0, cursor: "pointer", alignItems: "stretch" }}
                  >
                    {/* Fish illustration */}
                    <div className="fish-card-img" style={{ width: 180, minHeight: 130, flexShrink: 0, overflow: "hidden", background: C.sand, position: "relative" }}>
                      <img
                        src={fish.image}
                        alt={fish.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: fish.accentColor }} />
                    </div>

                    {/* Name + summary */}
                    <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: "0 0 4px 0" }}>{fish.name}</h3>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: C.textMuted, marginBottom: 10 }}>{fish.latin}</div>
                      <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>{fish.desc}</p>
                    </div>

                    {/* Best season badge + expand toggle */}
                    <div className="fish-card-meta" style={{ padding: "20px 20px 20px 0", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0 }}>
                      <div style={{ background: fish.accentColor + "18", border: `1px solid ${fish.accentColor}30`, borderRadius: 20, padding: "4px 10px", fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: fish.accentColor, whiteSpace: "nowrap" }}>
                        {fish.bestSeason.split(".")[0]}
                      </div>
                      <div style={{ fontSize: 18, color: C.textMuted, marginTop: 12, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</div>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  <div style={{ maxHeight: isOpen ? "1200px" : "0", overflow: "hidden", transition: "max-height 0.45s ease" }}>
                    <div style={{ borderTop: `1px solid ${C.sand}`, padding: "28px 24px 28px", background: C.cream }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>

                        {/* Bait & Lures */}
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunset, marginBottom: 12 }}>Bait & Lures</div>
                          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {fish.bait.map((b, j) => (
                              <li key={j} style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, paddingLeft: 14, position: "relative", marginBottom: 4 }}>
                                <span style={{ position: "absolute", left: 0, color: fish.accentColor }}>›</span>
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tackle + Timing */}
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.lakeBlue, marginBottom: 12 }}>Tackle Setup</div>
                          <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "0 0 20px 0" }}>{fish.tackle}</p>

                          <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 8 }}>Best Time of Day</div>
                          <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "0 0 16px 0" }}>{fish.bestTime}</p>

                          <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 8 }}>Season</div>
                          <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{fish.bestSeason}</p>
                        </div>

                        {/* DNR note */}
                        <div style={{ background: C.warmWhite, borderRadius: 10, padding: "16px 18px", border: `1px solid ${C.sand}` }}>
                          <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>Michigan DNR Note</div>
                          <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>{fish.dnrNote}</p>
                          <a href="https://www.michigan.gov/dnr/education/michigan-species/fish-species" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 11, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: "none" }}>
                            DNR Species Page ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>{/* end animation wrapper */}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FishingCharterSection() {
  // Placeholder charter/supplier cards — replace with real partners
  const charters = [
    {
      name: "Your Charter Here",
      tagline: "Lake fishing trips · Half day & full day · All gear provided",
      contact: null,
      placeholder: true,
    },
    {
      name: "Your Charter Here",
      tagline: "Guided ice fishing · Tip-Up Festival packages · Year-round",
      contact: null,
      placeholder: true,
    },
    {
      name: "Your Tackle Shop Here",
      tagline: "Live bait · Licenses · Local knowledge since [year]",
      contact: null,
      placeholder: true,
    },
  ];

  return (
    <section style={{ background: C.night, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
            <div>
              <SectionLabel light>Local Pros</SectionLabel>
              <SectionTitle light>Charters & Suppliers</SectionTitle>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 520, marginTop: 12 }}>
                Know the water before you get in the boat. Local fishing charters and tackle suppliers who've been fishing Devils Lake and Round Lake for years.
              </p>
            </div>
            <a href="/#submit" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 8,
              border: `1px solid ${C.sunset}50`, color: C.sunsetLight,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700,
              letterSpacing: 1, textTransform: "uppercase", textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${C.sunset}15`}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              List Your Charter ↗
            </a>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {charters.map((c, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: c.placeholder ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                border: c.placeholder ? `1.5px dashed rgba(255,255,255,0.1)` : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "32px 28px",
                display: "flex", flexDirection: "column", gap: 16, minHeight: 180,
              }}>
                {c.placeholder ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 10, border: "1.5px dashed rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.15)", fontSize: 22 }}>+</div>
                    <div>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>Advertise Here</div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", lineHeight: 1.6, margin: "0 0 14px 0" }}>{c.tagline}</p>
                      <a href="/#submit" style={{ fontSize: 11, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textDecoration: "none", textTransform: "uppercase" }}>
                        Contact Holly to List →
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.cream, margin: 0 }}>{c.name}</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{c.tagline}</p>
                    {c.contact && <span style={{ fontSize: 12, color: C.sage }}>{c.contact}</span>}
                  </>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FishingSeasonsSection() {
  return (
    <section style={{ background: C.dusk, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>Year-Round</SectionLabel>
          <SectionTitle light>Seasonal Guide</SectionTitle>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, marginTop: 48 }}>
          {FISHING_SEASONS.map((s, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "32px 28px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 12 }}>{s.season}</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 16px 0" }}>{s.desc}</p>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
                  <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 6 }}>Pro Tip</div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, margin: 0 }}>{s.tip}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FishingEventsSection() {
  const events = [
    {
      name: "Tip-Up Town USA",
      when: "First full weekend of February",
      since: "Est. 1950s",
      accent: C.lakeBlue,
      desc: "One of Michigan's longest-running winter festivals — 73+ consecutive years on frozen Devils Lake. Ice fishing tip-up contests, snowmobile racing, outhouse races, hovercraft rides, a poker run, and the legendary benefit auction. Draws thousands to Manitou Beach every February.",
      link: "/mens-club",
      linkLabel: "Men's Club — Event Organizers",
    },
    {
      name: "Bass Fishing Tournament",
      when: "Summer — exact date TBA",
      since: "Annual",
      accent: C.sage,
      desc: "An annual bass tournament on Devils Lake drawing competitive anglers from across the region. Largemouth and smallmouth bass. Check with the Devils Lake Yacht Club or Men's Club for the current year's schedule and registration details.",
      link: "https://www.devilslakeyachtclub.com",
      linkLabel: "Devils Lake Yacht Club →",
    },
  ];

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>On the Calendar</SectionLabel>
          <SectionTitle>Fishing Events</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 580, margin: "0 0 48px 0" }}>
            Devils Lake hosts two signature fishing events each year — one in the heart of winter, one in the heat of summer.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {events.map((evt, i) => (
            <FadeIn key={i} delay={i * 100} direction="left">
              <div style={{ background: C.cream, borderRadius: 16, padding: "36px 32px", border: `1px solid ${C.sand}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: evt.accent, borderRadius: "16px 0 0 16px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.text, margin: "0 0 4px 0" }}>{evt.name}</h3>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: evt.accent, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 0.5 }}>{evt.when}</span>
                      <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Caveat', cursive" }}>{evt.since}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.75, margin: "0 0 20px 0" }}>{evt.desc}</p>
                <a href={evt.link} style={{ fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: evt.accent, textDecoration: "none" }}>
                  {evt.linkLabel}
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FishingTipUpCallout() {
  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
          <SectionLabel light>Annual Tradition</SectionLabel>
          <SectionTitle light>Tip-Up Festival</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 32px" }}>
            First weekend of February. 73+ years of ice fishing on frozen Devils Lake — plus snowmobile racing, outhouse races, hovercraft rides, a poker run, and the legendary benefit auction. One of the longest-running winter festivals in Michigan.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn href="/mens-club" variant="sunset">Men's Club — Event Organizers</Btn>
            <Btn href="/happening" variant="outlineLight" small>See All Events →</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FishingPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <FishingHero />
      <WaveDivider topColor={C.dusk} bottomColor={C.night} />
      <FishingLakesSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <FishingSpeciesSection />
      <WaveDivider topColor={C.cream} bottomColor={C.night} />
      <PromoBanner page="Fishing" />
      <FishingCharterSection />
      <WaveDivider topColor={C.night} bottomColor={C.warmWhite} flip />
      <FishingEventsSection />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <FishingSeasonsSection />
      <WaveDivider topColor={C.dusk} bottomColor={C.night} />
      <FishingTipUpCallout />
      <WaveDivider topColor={C.night} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="fishing" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🍷  WINERIES PAGE (/wineries)
// ============================================================
const WINERY_VENUES = [
  // ── Village Tasting Rooms (opening May 22, 2026) ──────────────────────
  {
    section: "village",
    name: "Faust House Scrap n Craft",
    type: "Craft Store · Satellite Tasting Room",
    tagline: "A beloved craft store getting a delicious upgrade. Stop in, browse the shelves, and stay for a pour of Michigan's finest small-batch wine.",
    address: "140 N Lakeview Blvd., Manitou Beach",
    phone: "(517) 403-1788",
    website: "https://fausthousescrapncraft.com",
    logo: "/images/faust_house_logo.png",
    accent: "#8B5E3C",
    distance: "In the Village",
    openingDate: "May 22, 2026",
    hours: "Hours announced May 2026",
    lat: 41.9717, lng: -84.3091,
    hostedBrands: [
      {
        name: "Cherry Creek Cellars",
        description: "Small-batch wines made just down the road in Brooklyn. Approachable reds and whites from a winery that feels like a well-kept local secret — because it is.",
      },
    ],
  },
  {
    section: "village",
    name: "Ang & Co",
    type: "Lifestyle Shop · Satellite Tasting Room",
    tagline: "Dirty sodas, custom apparel, curated gifts — and now a rotating pour from two of Northern Michigan's finest wine producers.",
    address: "141 N. Lakeview Blvd., Manitou Beach",
    phone: "(517) 547-6030",
    website: "https://www.angandco.net",
    logo: "/images/ang_co_logo.png",
    accent: C.sunsetLight,
    distance: "In the Village",
    openingDate: "May 22, 2026",
    hours: "Hours announced soon",
    lat: 41.9712, lng: -84.3093,
    hostedBrands: [
      {
        name: "French Road Cellars",
        description: "Northern Michigan craftsmanship in every bottle. Stop in to taste what the Leelanau Peninsula's rolling vineyards produce when the growing season is kind.",
      },
      {
        name: "Chateau Fontaine",
        description: "One of Michigan's most decorated estate wineries. Their Pinot Gris alone is worth the trip — and Ang & Co is the only place to taste it without driving to Traverse City.",
      },
    ],
  },
  {
    section: "village",
    name: "Manitou Beach Boathouse Art Gallery",
    type: "Art Gallery · Satellite Tasting Room",
    tagline: "Michigan art meets Michigan wine in one of the Village's most distinctive spaces. Browse the gallery, sip something memorable.",
    address: "138 N. Lakeview Blvd., Manitou Beach",
    phone: "(517) 224-1984",
    website: "https://www.facebook.com/ManitouBeachBoathouseArtGallery/",
    logo: "/images/boathouse-art-gallery-logo.jpg",
    accent: C.lakeBlue,
    distance: "In the Village",
    openingDate: "May 22, 2026",
    hours: "Hours announced soon",
    lat: 41.971727, lng: -84.309131,
    hostedBrands: [
      {
        name: "Amoritas Vineyard",
        description: "Details dropping as we get closer to May — check back soon for the story behind this pour.",
      },
    ],
  },
  {
    section: "village",
    name: "Devils Lake View Living",
    type: "Home & Lifestyle · Satellite Tasting Room",
    tagline: "High-end fashion, curated home goods, and the iconic lighthouse replica out front — with a pour from Brenman Family Winery that turns browsing into an occasion.",
    address: "200 Devils Lake Hwy, Manitou Beach",
    phone: "(517) 252-5287",
    website: "https://devilslakeviewliving.com",
    logo: "/images/dl-view-living-logo.png",
    accent: C.sage,
    distance: "In the Village",
    openingDate: "May 22, 2026",
    hours: "Hours announced soon",
    lat: 41.9708, lng: -84.3099,
    hostedBrands: [
      {
        name: "Brenman Family Winery",
        description: "A family winery with a story worth telling. Details dropping closer to May — this one's worth the wait.",
      },
    ],
  },

  // ── The Trail (day trips) ─────────────────────────────────────────────
  {
    section: "trail",
    name: "Meckleys Flavor Fruit Farm",
    type: "Fruit Farm · Trail Stop",
    tagline: "Start your day here. Fresh-picked fruit, homemade jams, and flavors that reset the palate before your first pour. The perfect opening move on the wine trail.",
    address: "11025 S Jackson Rd, Cement City",
    phone: null,
    website: null,
    logo: "/images/meckleys-logo.png",
    accent: "#B35A1A",
    hours: "Wed–Sat 9am–6pm (seasonal — call ahead)",
    highlight: "The ideal first stop — palate fresh, appetite building",
    distance: "~20 min from Manitou Beach",
    lat: 42.0589177, lng: -84.4059253,
  },
  {
    section: "trail",
    name: "Cherry Creek Cellars",
    type: "Small-Batch Winery",
    tagline: "Brooklyn's neighborhood winery — small-batch Michigan wines in a laid-back tasting room that feels exactly like it should.",
    address: "11500 Silver Lake Hwy, Brooklyn",
    phone: "(517) 592-4848",
    website: "https://cherrycreekwine.com",
    logo: "/images/cherry_creek_logo.png",
    accent: C.sage,
    hours: "Mon–Sat 11am–6pm · Sun Noon–6pm",
    highlight: "Also poured at Faust House in the Village starting May 22",
    distance: "~15 min from Manitou Beach",
    lat: 42.0505, lng: -84.3012,
  },
  {
    section: "trail",
    name: "Chateau Aeronautique Winery",
    type: "Winery & Entertainment Venue",
    tagline: "Aviation-themed. All-weather Biergarten. Live tribute concerts every weekend. Michigan wine with more personality than most.",
    address: "12000 Pentecost Hwy, Onsted",
    phone: "(517) 795-3620",
    website: "https://chateauaeronautiquewinery.com",
    logo: "/images/chateau_logo.png",
    accent: C.sunset,
    hours: "Wed–Thu 3–9pm · Fri–Sat Noon–9pm · Sun Noon–6pm",
    highlight: "Live music every weekend + Michigan-crafted wines",
    distance: "~20 min from Manitou Beach",
    lat: 42.0582, lng: -84.1274,
  },
  {
    section: "trail",
    name: "Gypsy Blue Vineyards",
    type: "Vineyard & Flower Farm",
    tagline: "Handcrafted wines, crisp hard ciders, and seasonal blooms from their own flower farm. Private events, tastings, and a setting that earns the drive.",
    address: "16476 Forrister Rd, Hudson",
    phone: "(517) 252-5023",
    website: "https://gypsybluevineyards.com",
    logo: "/images/gypsy_blue_logo.png",
    accent: C.lakeBlue,
    hours: "Check website for current hours",
    highlight: "Wines + ciders + flower farm — a full afternoon stop",
    distance: "~20 min from Manitou Beach",
    lat: 41.9170, lng: -84.3115,
    photos: [
      "/images/wineries/gypsy_blue_01.jpg",
      "/images/wineries/gypsy_blue_02.jpg",
      "/images/wineries/gypsy_blue_03.jpg",
      "/images/wineries/gypsy_blue_04.jpg",
    ],
  },

  // ── Worth the Drive ───────────────────────────────────────────────────
  {
    section: "extended",
    name: "Grand River Brewery",
    type: "Brewery · Event Partner",
    tagline: "Jackson's craft brewery and a longtime event partner with Cherry Creek Cellars. Worth the drive if you're making a full day of it.",
    address: "117 W Louis Glick Hwy, Jackson",
    phone: null,
    website: null,
    logo: null,
    accent: "#6B4E2A",
    highlight: "Partners with Cherry Creek Cellars for annual events",
    distance: "~35 min from Manitou Beach",
  },
  {
    section: "extended",
    name: "Black Fire Winery",
    type: "Winery",
    tagline: "A regional winery worth knowing about if you're building out a longer Michigan wine day beyond the Irish Hills.",
    address: "1261 E Munger Rd, Tecumseh",
    phone: null,
    website: null,
    logo: null,
    accent: "#4A2040",
    highlight: "Regional gem — best paired with a longer itinerary",
    distance: "~45 min from Manitou Beach",
  },
];

function WineriesHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/Explore-wineries.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk,
      padding: "180px 24px 140px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.75) 0%, rgba(10,18,24,0.45) 50%, rgba(10,18,24,0.88) 100%)" }} />
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Michigan Wine · Irish Hills · Manitou Beach Village
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 400, color: C.cream, lineHeight: 0.95, margin: "0 0 20px 0" }}>
            Wineries &<br />Wine Trails
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 32px 0" }}>
            Michigan wine country meets lake country. From lakeside tasting rooms in the Village to full winery destinations in the Irish Hills — sip your way through one of the state's most scenic wine trails.
          </p>
          <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          <ShareBar title="Irish Hills Wineries & Wine Trail — Manitou Beach" />
        </div>
      </div>
    </section>
  );
}

function WineriesVillageCallout() {
  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light>Opening May 22, 2026</SectionLabel>
          <SectionTitle light center>The Village Comes Alive</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto 20px" }}>
            This May, four Manitou Beach Village shops open their doors as satellite tasting rooms for Michigan wineries. Walk the boulevard. Pop into a gallery. Pick up something for the cottage. Stay for a glass.
          </p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 32px", fontStyle: "italic" }}>
            Cherry Creek Cellars · French Road Cellars · Chateau Fontaine · Amoritas Vineyard · Brenman Family Winery — all in the Village, all within steps of the lake.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Btn href="/village" variant="sunset">Explore the Village</Btn>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Manitou+Beach+Wine+Trail+Opens&dates=20260522%2F20260523&details=Four+Village+shops+open+as+satellite+tasting+rooms+for+Michigan+wineries.+Walk+the+boulevard%2C+pop+into+a+gallery%2C+stay+for+a+glass.&location=N+Lakeview+Blvd%2C+Manitou+Beach%2C+MI"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 2, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.75)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                + Google Calendar
              </a>
              <a
                href={"data:text/calendar;charset=utf8," + encodeURIComponent("BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;VALUE=DATE:20260522\nDTEND;VALUE=DATE:20260523\nSUMMARY:Manitou Beach Wine Trail Opens\nDESCRIPTION:Four Village shops open as satellite tasting rooms for Michigan wineries.\nLOCATION:N Lakeview Blvd\\, Manitou Beach\\, MI\nURL:https://manitoubeach.app/wineries\nEND:VEVENT\nEND:VCALENDAR")}
                download="manitou-beach-wine-trail.ics"
                style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 2, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.75)"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                + Apple / iCal
              </a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function getWineSessionId() {
  try {
    const KEY = "mb-wine-session";
    let id = localStorage.getItem(KEY);
    if (!id) { id = Math.random().toString(36).slice(2, 10); localStorage.setItem(KEY, id); }
    return id;
  } catch { return "anon"; }
}

function useWineryRatings() {
  const [ratings, setRatings] = useState({});
  useEffect(() => {
    fetch('/api/winery-ratings')
      .then(r => r.json())
      .then(d => { if (d.ratings) setRatings(d.ratings); })
      .catch(() => {});
  }, []);
  return { ratings };
}

function useWinePassport() {
  const KEY = "mb-wine-passport-2026";
  const [stamped, setStamped] = useState(() => {
    try { const s = localStorage.getItem(KEY); return s ? new Set(JSON.parse(s)) : new Set(); }
    catch { return new Set(); }
  });
  const toggleStamp = (name) => {
    setStamped(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };
  return { stamped, toggleStamp, isStamped: (name) => stamped.has(name) };
}

function WinePassportWidget({ stamped, villageVenues, trailVenues }) {
  const villageCount = villageVenues.filter(v => stamped.has(v.name)).length;
  const trailCount = trailVenues.filter(v => stamped.has(v.name)).length;
  const villageComplete = villageCount === villageVenues.length;
  const trailComplete = trailCount === trailVenues.length;
  const allComplete = villageComplete && trailComplete;
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const text = "I completed the Manitou Beach Wine Trail — all 8 stops across the Irish Hills. 🍷";
    const url = "https://manitoubeach.app/wineries";
    if (navigator.share) {
      try { await navigator.share({ title: "Manitou Beach Wine Trail", text, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(`${text} ${url}`); setShared(true); setTimeout(() => setShared(false), 3000); } catch {}
    }
  };

  const DotRow = ({ total, filled, accent }) => (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 12, height: 12, borderRadius: "50%",
          background: i < filled ? accent : "transparent",
          border: `2px solid ${i < filled ? accent : C.sand}`,
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );

  return (
    <FadeIn>
      <div style={{
        background: allComplete ? C.dusk : C.warmWhite,
        border: `1px solid ${allComplete ? C.dusk : C.sand}`,
        borderRadius: 16,
        padding: "24px 28px",
        marginBottom: 56,
        transition: "all 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: allComplete ? C.cream : C.text, marginBottom: 4 }}>
              {allComplete ? "Trail Complete — Well Done." : "Your Wine Trail Passport"}
            </div>
            <div style={{ fontSize: 13, color: allComplete ? "rgba(255,255,255,0.5)" : C.textLight, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.65, marginBottom: 4 }}>
              {allComplete
                ? "You've visited every stop on the Manitou Beach Wine Trail. Show this screen at any participating venue — they'll know what it means."
                : "Eight stops across the Irish Hills. Two loops — the Village walkabout, and the full day-trip trail. Stamp each one as you go."}
            </div>
            {!allComplete && (
              <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 16 }}>
                Each stamp requires a quick tasting note — takes 30 seconds and earns you the visit.{" "}
                <span style={{ fontStyle: "italic" }}>Complete all eight and you've done something worth talking about.</span>
              </div>
            )}
            {allComplete && <div style={{ marginBottom: 16 }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: allComplete ? "rgba(255,255,255,0.45)" : C.textMuted, width: 64 }}>Village</div>
                <DotRow total={villageVenues.length} filled={villageCount} accent={C.sunset} />
                <div style={{ fontSize: 12, color: allComplete ? "rgba(255,255,255,0.55)" : C.textLight }}>{villageCount}/{villageVenues.length} stops</div>
                {villageComplete && <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, color: C.sunset, background: "rgba(212,132,90,0.12)", padding: "2px 8px", borderRadius: 20 }}>Complete</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: allComplete ? "rgba(255,255,255,0.45)" : C.textMuted, width: 64 }}>Trail</div>
                <DotRow total={trailVenues.length} filled={trailCount} accent={C.sage} />
                <div style={{ fontSize: 12, color: allComplete ? "rgba(255,255,255,0.55)" : C.textLight }}>{trailCount}/{trailVenues.length} stops</div>
                {trailComplete && <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, color: C.sage, background: "rgba(122,142,114,0.12)", padding: "2px 8px", borderRadius: 20 }}>Complete</div>}
              </div>
            </div>
            {allComplete && (
              <div style={{ marginTop: 20 }}>
                <button
                  onClick={handleShare}
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: "9px 20px", borderRadius: 20,
                    background: shared ? C.sage : "transparent",
                    color: shared ? C.cream : C.sunset,
                    border: `1.5px solid ${shared ? C.sage : C.sunset}`,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                >
                  {shared ? "✓ Link Copied" : "Share Your Trail Badge"}
                </button>
              </div>
            )}
          </div>
          {allComplete && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 4 }}>🏆</div>
              <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunset }}>Full Trail Badge</div>
            </div>
          )}
          {villageComplete && !allComplete && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 4 }}>🍷</div>
              <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunset }}>Village Badge</div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

function StarRow({ label, required, value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <div style={{ width: 110, fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.textMuted, flexShrink: 0 }}>
        {label}{required && <span style={{ color: C.sunset }}> *</span>}
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(s => (
          <button
            key={s}
            onClick={() => onChange(s === value ? 0 : s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, padding: '1px 2px', color: s <= (hover || value) ? C.sunset : C.sand, transition: 'color 0.1s' }}
          >★</button>
        ))}
      </div>
      {!required && value === 0 && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>optional</span>}
    </div>
  );
}

function WineReviewModal({ venue, accent, onSuccess, onClose }) {
  const [rating, setRating] = useState(0);
  const [service, setService] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);
  const [value, setValue] = useState(0);
  const [wineTried, setWineTried] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) { setError('Please rate the wine quality.'); return; }
    if (!wineTried.trim()) { setError('Please tell us what you tried.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/winery-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue, rating,
          service:    service    || undefined,
          atmosphere: atmosphere || undefined,
          value:      value      || undefined,
          wineTried: wineTried.trim(),
          note: note.trim(),
          sessionId: getWineSessionId(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      onSuccess();
    } catch {
      setError('Something went wrong — your stamp was saved locally.');
      onSuccess();
    }
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,24,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div style={{ background: C.warmWhite, borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ height: 5, background: accent }} />
        <div style={{ padding: '28px 32px 32px' }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, fontWeight: 400, color: C.text, marginBottom: 4 }}>Log Your Visit</div>
          <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 24 }}>{venue}</div>

          <div style={{ marginBottom: 20, padding: '16px 16px 6px', background: C.cream, borderRadius: 12, border: `1px solid ${C.sand}` }}>
            <StarRow label="Wine Quality" required value={rating}     onChange={setRating} />
            <StarRow label="Service"      required={false} value={service}     onChange={setService} />
            <StarRow label="Atmosphere"   required={false} value={atmosphere}  onChange={setAtmosphere} />
            <StarRow label="Value"        required={false} value={value}       onChange={setValue} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 8 }}>What did you try? *</label>
            <input
              type="text"
              value={wineTried}
              onChange={e => setWineTried(e.target.value)}
              placeholder="The dry rosé, Cabernet Franc, 2023 Riesling..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text, background: C.cream, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 8 }}>
              Anything else? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Loved the patio, ask for the reserve, perfect for a rainy afternoon..."
              rows={2}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text, background: C.cream, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: 12, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ flex: 1, padding: '12px 20px', borderRadius: 24, background: C.sage, color: C.cream, border: 'none', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s' }}
            >
              {submitting ? 'Saving...' : 'Submit & Earn Your Stamp'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const venueSlug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

function WineryCard({ v, i, isStamped, onStamp, venueRating, autoOpen }) {
  const [showModal, setShowModal] = useState(false);
  const cardRef = useRef(null);
  useEffect(() => {
    if (autoOpen && onStamp && !isStamped) {
      const t1 = setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
      const t2 = setTimeout(() => setShowModal(true), 900);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [autoOpen]);
  return (
    <FadeIn delay={i * 80} direction={i % 2 === 0 ? "left" : "right"}>
      <div
        ref={cardRef}
        onClick={() => v.website && window.open(v.website, "_blank")}
        style={{
          background: C.warmWhite,
          border: `1px solid ${C.sand}`,
          borderRadius: 16,
          padding: "32px 28px",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          cursor: v.website ? "pointer" : "default",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.25s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px ${v.accent}30`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: v.accent, borderRadius: "16px 0 0 16px" }} />
        {v.logo && (
          <img src={v.logo} alt="" style={{ width: 144, height: 144, borderRadius: 16, objectFit: "cover", flexShrink: 0, background: C.sand }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
            <div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: "0 0 4px 0" }}>{v.name}</h3>
              {venueRating && venueRating.count > 0 && (
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
                  <span style={{ color: C.sunset }}>★</span> {venueRating.avg} &nbsp;·&nbsp; {venueRating.count} {venueRating.count === 1 ? 'review' : 'reviews'}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {v.openingDate && (
                <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.cream, background: C.sunset, padding: "4px 10px", borderRadius: 20 }}>Opens {v.openingDate}</span>
              )}
              <span style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.textMuted, background: C.sand, padding: "4px 10px", borderRadius: 20 }}>{v.distance}</span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: v.accent, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{v.type}</div>
          <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 14px 0" }}>{v.tagline}</p>

          {v.hostedBrands && v.hostedBrands.length > 0 && (
            <div style={{ margin: "16px 0", borderTop: `1px solid ${C.sand}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginBottom: 12 }}>Tasting This Season</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {v.hostedBrands.map((brand, bi) => (
                  <div key={bi} style={{ background: C.cream, borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${v.accent}` }}>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 400, color: C.text, marginBottom: 4 }}>{brand.name}</div>
                    <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>{brand.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {v.photos && v.photos.length > 0 && (
            <div style={{ margin: "16px 0 4px 0", overflowX: "auto", display: "flex", gap: 8, paddingBottom: 4 }}>
              {v.photos.map((src, pi) => (
                <img
                  key={pi}
                  src={src}
                  alt=""
                  style={{ height: 110, width: 160, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: `1px solid ${C.sand}` }}
                />
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {v.address && v.address !== "Manitou Beach Village" && <span style={{ fontSize: 12, color: C.textMuted }}>📍 {v.address}</span>}
            {v.phone && <span style={{ fontSize: 12, color: C.textMuted }}>📞 {v.phone}</span>}
            {v.hours && <span style={{ fontSize: 12, color: C.textMuted }}>🕐 {v.hours}</span>}
          </div>
          {v.highlight && (
            <div style={{ marginTop: 12, fontSize: 12, color: v.accent, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>
              ✦ {v.highlight}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 16 }}>
            {v.website && (
              <a
                href={v.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: v.accent, textDecoration: "none" }}
              >
                Visit Website →
              </a>
            )}
            {onStamp && (
              <div style={{ marginLeft: "auto" }}>
                <button
                  onClick={e => { e.stopPropagation(); if (!isStamped) setShowModal(true); }}
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: "8px 16px", borderRadius: 20,
                    cursor: isStamped ? "default" : "pointer",
                    background: isStamped ? C.sage : "transparent",
                    color: isStamped ? C.cream : C.sage,
                    border: `1.5px solid ${C.sage}`,
                    transition: "all 0.25s ease",
                  }}
                >
                  {isStamped ? "✓ Visited" : "+ Stamp My Visit"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <WineReviewModal
          venue={v.name}
          accent={v.accent}
          onSuccess={() => { onStamp(v.name); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </FadeIn>
  );
}

function WineriesMapSection() {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapDivRef = useRef(null);
  const mapObjRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const mapVenues = WINERY_VENUES.filter(v => v.lat && v.lng && v.section !== 'extended');

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setMapError('Map API key not configured.'); return; }
    if (!mapDivRef.current) return;
    let active = true;
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      new Loader({ apiKey, version: 'weekly' }).load().then(google => {
        if (!active || !mapDivRef.current) return;
        googleRef.current = google;
        mapObjRef.current = new google.maps.Map(mapDivRef.current, {
          center: { lat: 42.01, lng: -84.28 },
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          styles: DISCOVER_MAP_STYLES,
        });
        infoWindowRef.current = new google.maps.InfoWindow();
        setMapReady(true);
      }).catch(() => { if (active) setMapError('Map failed to load. Check your API key.'); });
    }).catch(() => { if (active) setMapError('Map loader error.'); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const google = googleRef.current;
    const map = mapObjRef.current;
    if (!google || !map || !mapReady) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    mapVenues.forEach((v, idx) => {
      const color = v.section === 'village' ? C.sunset : C.lakeBlue;
      const marker = new google.maps.Marker({
        position: { lat: v.lat, lng: v.lng },
        map,
        title: v.name,
        icon: { url: createDiscoverPin(color), scaledSize: new google.maps.Size(28, 36), anchor: new google.maps.Point(14, 36) },
        animation: google.maps.Animation.DROP,
        zIndex: idx,
      });
      const dir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v.address)}`;
      const iw = `<div style="padding:6px 8px 10px;max-width:240px;font-family:system-ui,sans-serif;line-height:1.45">
        <div style="font-size:13px;font-weight:700;color:#2D3B45;margin-bottom:2px">${v.name}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:${color};font-weight:700;margin-bottom:6px">${v.type}</div>
        ${v.address ? `<div style="font-size:11px;color:#666;margin-bottom:4px">${v.address}</div>` : ''}
        ${v.hours ? `<div style="font-size:11px;color:#999;margin-bottom:6px;font-style:italic">${v.hours}</div>` : ''}
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a href="${dir}" target="_blank" style="font-size:12px;font-weight:700;color:#5B7E95;text-decoration:none">Directions →</a>
          ${v.website ? `<a href="${v.website}" target="_blank" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Website →</a>` : ''}
        </div>
      </div>`;
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(iw);
        infoWindowRef.current.open(map, marker);
      });
      markersRef.current.push(marker);
    });

    if (mapVenues.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      mapVenues.forEach(v => bounds.extend({ lat: v.lat, lng: v.lng }));
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [mapReady]);

  return (
    <section style={{ background: C.warmWhite, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <SectionLabel>Plan Your Visit</SectionLabel>
          <SectionTitle>The Trail Map</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: '0 0 24px 0' }}>
            Village tasting rooms in the heart of Manitou Beach. Trail wineries within 20 minutes. Tap any pin for hours, directions, and the website.
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, color: C.textLight }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: C.sunset, display: 'inline-block' }} />
              Village Tasting Rooms
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, color: C.textLight }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: C.lakeBlue, display: 'inline-block' }} />
              Wine Trail Stops
            </div>
          </div>
        </FadeIn>
        {mapError ? (
          <div style={{ background: C.sand, borderRadius: 12, padding: 24, fontSize: 13, color: C.textMuted, textAlign: 'center' }}>{mapError}</div>
        ) : (
          <div ref={mapDivRef} style={{ width: '100%', height: 460, borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.sand}`, background: C.sand }} />
        )}
      </div>
    </section>
  );
}

function WineriesScorecardSection() {
  const { ratings } = useWineryRatings();
  const venuesWithRatings = WINERY_VENUES.filter(v => ratings[v.name] && ratings[v.name].count > 0);
  if (venuesWithRatings.length === 0) return null;

  const rnd = n => n != null ? n.toFixed(1) : null;
  const StarDisplay = ({ value, max = 5 }) => {
    if (!value) return <span style={{ color: C.textMuted, fontSize: 12 }}>—</span>;
    const full = Math.round(value);
    return (
      <span style={{ color: C.sunset, fontSize: 13, letterSpacing: 1 }}>
        {'★'.repeat(full)}{'☆'.repeat(max - full)}
        <span style={{ color: C.textMuted, fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", marginLeft: 4 }}>{rnd(value)}</span>
      </span>
    );
  };

  return (
    <section style={{ background: C.warmWhite, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
            <div>
              <SectionLabel>Visitor Scores</SectionLabel>
              <SectionTitle>What Visitors Are Saying</SectionTitle>
            </div>
            <Btn href="/rate" variant="outline" style={{ flexShrink: 0 }}>Rate Your Visit →</Btn>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {venuesWithRatings.map((v, i) => {
            const r = ratings[v.name];
            const dims = [
              { label: 'Wine Quality', val: r.avg },
              { label: 'Service', val: r.service_avg },
              { label: 'Atmosphere', val: r.atmosphere_avg },
              { label: 'Value', val: r.value_avg },
            ].filter(d => d.val != null);
            return (
              <FadeIn key={v.name} delay={i * 60}>
                <div style={{ background: '#fff', borderRadius: 14, padding: '24px 24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${v.accent || C.sunset}`, height: '100%' }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.dusk, marginBottom: 4 }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>
                    {r.count} {r.count === 1 ? 'review' : 'reviews'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dims.map(d => (
                      <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.label}</div>
                        <StarDisplay value={d.val} />
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.7 }}>
            Reviews are curated before publishing — every score is real, every reviewer was there.
          </p>
        </div>
      </div>
    </section>
  );
}

function WineriesVenueSection() {
  const villageVenues = WINERY_VENUES.filter(v => v.section === "village");
  const trailVenues = WINERY_VENUES.filter(v => v.section === "trail");
  const extendedVenues = WINERY_VENUES.filter(v => v.section === "extended");
  const { stamped, toggleStamp, isStamped } = useWinePassport();
  const { ratings } = useWineryRatings();
  const stampSlug = new URLSearchParams(window.location.search).get('stamp') || '';

  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <WinePassportWidget stamped={stamped} villageVenues={villageVenues} trailVenues={trailVenues} />

        {/* Village Tasting Rooms */}
        <FadeIn>
          <SectionLabel>In the Village</SectionLabel>
          <SectionTitle>Village Tasting Rooms</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 580, margin: "0 0 48px 0" }}>
            Starting May 22, four Village shops open their doors as satellite tasting rooms. Walk the boulevard — each stop is a new pour, a new story, all within steps of the lake.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 80 }}>
          {villageVenues.map((v, i) => <WineryCard key={i} v={v} i={i} isStamped={isStamped(v.name)} onStamp={toggleStamp} venueRating={ratings[v.name]} autoOpen={stampSlug === venueSlug(v.name)} />)}
        </div>

        {/* The Trail */}
        <FadeIn>
          <SectionLabel>Day Trips</SectionLabel>
          <SectionTitle>The Wine Trail</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 580, margin: "0 0 48px 0" }}>
            Pack the cooler, pick a starting point, and make a day of it. Meckleys to reset the palate, Cherry Creek for the laid-back pour, Chateau Aeronautique to close it out right.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 80 }}>
          {trailVenues.map((v, i) => <WineryCard key={i} v={v} i={i} isStamped={isStamped(v.name)} onStamp={toggleStamp} venueRating={ratings[v.name]} autoOpen={stampSlug === venueSlug(v.name)} />)}
        </div>

        {/* Worth the Drive */}
        <FadeIn>
          <SectionLabel>Extending Your Trail</SectionLabel>
          <SectionTitle>Worth the Drive</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 580, margin: "0 0 48px 0" }}>
            Full winery destinations beyond the Village loop — the kind of stops that become the reason you came. Add one to anchor a longer day, or build a trip around them.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {extendedVenues.map((v, i) => <WineryCard key={i} v={v} i={i} />)}
        </div>

      </div>
    </section>
  );
}

const WINERY_ITINERARIES = [
  {
    title: "The Village Half-Day",
    duration: "2–3 Hours",
    badge: "Starting May 22",
    accent: C.sunset,
    intro: "Four tasting rooms, one boulevard, zero driving. Walk the Village loop — start anywhere, end at the lake.",
    stops: [
      { time: "11am", stop: "Faust House Scrap n Craft", note: "Cherry Creek pour — browse the shelves, stay for a glass" },
      { time: "11:30am", stop: "Ang & Co", note: "French Road Cellars + Chateau Fontaine — most variety in one stop" },
      { time: "Noon", stop: "Boathouse Art Gallery", note: "Amoritas Vineyard — gallery browse and a pour" },
      { time: "12:30pm", stop: "Devils Lake View Living", note: "Brenman Family Winery — fashion, home goods, lighthouse out front" },
      { time: "1pm", stop: "Lunch at the lake", note: "You've earned it" },
    ],
  },
  {
    title: "The Full Trail Loop",
    duration: "Full Day",
    badge: "Best on a Saturday",
    accent: C.lakeBlue,
    intro: "One loop, four stops, a fruit farm to start. Leave by 10, back lakeside before dark with excellent stories.",
    stops: [
      { time: "10am", stop: "Meckleys Flavor Fruit Farm", note: "Fresh-picked fruit — reset the palate before the first pour" },
      { time: "11:30am", stop: "Cherry Creek Cellars", note: "Small-batch Michigan wines in Brooklyn's laid-back tasting room" },
      { time: "1pm", stop: "Chateau Aeronautique", note: "Lunch + live music — all-weather biergarten, aviation-themed" },
      { time: "3:30pm", stop: "Gypsy Blue Vineyards", note: "Wines, ciders, flower farm — the most scenic stop on the loop" },
      { time: "6pm", stop: "Back to the lake", note: "Dinner in the Village or on the dock" },
    ],
  },
  {
    title: "The Extended Weekend",
    duration: "2 Days",
    badge: "The Full Experience",
    accent: C.sage,
    intro: "Village Saturday morning. Full trail Saturday afternoon. Sunday at the lake. The version you tell people about on Monday.",
    stops: [
      { time: "Sat AM", stop: "Village Tasting Rooms", note: "Walk all four stops — two hours, zero driving" },
      { time: "Sat PM", stop: "Cherry Creek + Chateau Aeronautique", note: "Two trail stops, lunch at Chateau, live music" },
      { time: "Sat Eve", stop: "Dinner lakeside", note: "Village dining or back to the cottage" },
      { time: "Sun AM", stop: "Gypsy Blue Vineyards", note: "The drive earns it — flower farm, ciders, the works" },
      { time: "Sun PM", stop: "Devils Lake", note: "Pontoon, paddleboard, or just a dock chair" },
    ],
  },
];

function WineriesItinerarySection() {
  return (
    <section style={{ background: C.night, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>How to Do It</SectionLabel>
          <SectionTitle>Three Ways to Run the Trail</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 52px 0" }}>
            Pick your pace. Two hours or two days — the trail works either way.
          </p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="wineries-itinerary-grid">
          {WINERY_ITINERARIES.map((it, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", height: "100%" }}>
                <div style={{ height: 4, background: it.accent }} />
                <div style={{ padding: "28px 24px 32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: it.accent }}>{it.badge}</span>
                    <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 20 }}>{it.duration}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 21, fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>{it.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 24px 0" }}>{it.intro}</p>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {it.stops.map((s, si) => (
                      <div key={si} style={{ display: "flex", gap: 14, paddingBottom: 16, position: "relative" }}>
                        {si < it.stops.length - 1 && (
                          <div style={{ position: "absolute", left: 42, top: 18, bottom: 0, width: 1, background: "rgba(255,255,255,0.07)" }} />
                        )}
                        <div style={{ flexShrink: 0, width: 36, paddingTop: 3, fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 0.3, color: it.accent, textAlign: "right", lineHeight: 1.3 }}>{s.time}</div>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: it.accent, flexShrink: 0, marginTop: 5, opacity: 0.75 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontFamily: "'Libre Baskerville', serif", color: C.cream, marginBottom: 3, lineHeight: 1.4 }}>{s.stop}</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", lineHeight: 1.5 }}>{s.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function WineriesCTASection() {
  return (
    <section style={{ background: C.dusk, padding: "100px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light>Plan Your Visit</SectionLabel>
          <SectionTitle light center>Build Your Wine Trail Day</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 16px" }}>
            Spend a morning at the lake, a leisurely lunch in the Village, an afternoon tasting at Chateau Aeronautique, and an evening back on the water. That's a Manitou Beach Saturday.
          </p>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight, marginBottom: 32 }}>
            Holly can help you find the perfect lakefront home to come back to.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn href="/#holly" variant="sunset">Talk to Holly</Btn>
            <Btn href="/happening" variant="outlineLight" small>What's On This Weekend →</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function WineriesPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <WineriesHero />
      <WaveDivider topColor={C.dusk} bottomColor={C.night} />
      <WineriesVillageCallout />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <PromoBanner page="Wineries" />
      <WineriesMapSection />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />
      <WineriesVenueSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <WineriesScorecardSection />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.night} />
      <WineriesItinerarySection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <DiagonalDivider topColor={C.cream} bottomColor={C.dusk} />
      <WineriesCTASection />
      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="wineries" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🏖️  DEVILS LAKE PAGE (/devils-lake)
// ============================================================
const DEVILS_LAKE_STATS = [
  { label: "Surface Area", value: "1,330 acres" },
  { label: "Max Depth", value: "65 ft" },
  { label: "Lake Type", value: "Warm-water" },
  { label: "Public Launch", value: "Manitou Rd" },
  { label: "Connected To", value: "Round Lake" },
];

const DEVILS_LAKE_TIMELINE = [
  { year: "Pre-1830", event: "Potawatomi people have long gathered along these shores. The lake's name traces to a tragic legend — the daughter of Chief Orrinika and her lover vanished in a mysterious fog, leading the lake to be known as the home of an evil spirit. Early settlers and traders interpreted these stories through their own lens, and \"Devils Lake\" was born. A rock formation on the east shore, known as the \"Devil's Chair,\" added to the mystique. The name endures — though the place itself is anything but cursed." },
  { year: "1870s", event: "The resort era begins. Grand hotels, a dance pavilion, bathhouses, and two railroad stations transform Devils Lake into one of Michigan's most popular summer destinations." },
  { year: "1888", event: "Manitou Beach officially platted. Lots sold for cottage construction. A steam launch connects Devils Lake to Round Lake through the dredged channel." },
  { year: "1920s–40s", event: "The Yacht Club is established, formalizing the sailing and boating culture that had grown organically on the lake for decades." },
  { year: "1950s", event: "The Tip-Up Festival launches — an ice fishing celebration on frozen Devils Lake that grows into one of Michigan's longest-running winter festivals (73+ years and counting)." },
  { year: "Today", event: "Devils Lake remains the social heart of Manitou Beach — summer boating, the Firecracker 7K on the Fourth, weekly sailboat races, and a community that lives for the water." },
];

const DEVILS_LAKE_COMMUNITY = [
  { icon: "⛵", title: "Devils Lake Yacht Club", desc: "Sailing, regattas, and the Friday Fish Fry. The Yacht Club has been the social hub of Devils Lake since the 1940s.", href: "https://www.devilslakeyachtclub.com" },
  { icon: "🚤", title: "Public Boat Launch", desc: "Paved public ramp on Devils Lake Rd at the Manitou Beach Marina. Easy access for powerboats, pontoons, kayaks, and canoes.", href: "https://maps.app.goo.gl/3fHSzJaoyJEK4HkS9" },
  { icon: "🏘️", title: "Manitou Beach Village", desc: "Walk from the lake to boutique shops, a cafe, satellite wine tasting rooms, and the iconic lighthouse — all within five minutes.", href: "/village" },
  { icon: "🏒", title: "Devils & Round Lake Mens Club", desc: "The civic backbone of the lakes community — organizing the Tip-Up Festival, Firecracker 7K, Shop with a Cop, and year-round events since the 1940s.", href: "/mens-club" },
  { icon: "🌿", title: "Land & Lake Ladies Club", desc: "A community of women dedicated to the lakes, the land, and the social fabric of Manitou Beach — hosting events, fundraisers, and the beloved Summer Festival.", href: "/ladies-club" },
  { icon: "🏛️", title: "Historic Renovation Society", desc: "Restoring the Village, cultivating the arts, and conserving the land and water — MBHRS is the steward of Manitou Beach's past, present, and future.", href: "/historical-society" },
];

function DevilsLakeHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/explore-devils-lake.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 35%",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk,
      minHeight: "80vh",
      display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(10,18,24,0.72) 0%, rgba(10,18,24,0.42) 50%, rgba(10,18,24,0.88) 100%)" }} />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "140px 24px 100px", position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Manitou Beach · Irish Hills · Michigan
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 400, color: C.cream, lineHeight: 0.95, margin: "0 0 12px 0" }}>
            Devils Lake
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 2.5vw, 28px)", color: C.sunsetLight, marginBottom: 20 }}>
            The Party Lake
          </div>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 32px 0" }}>
            1,330 acres of warm water, 600+ boat slips, and a community that has been coming back every summer since the 1870s. Devils Lake is the beating heart of Manitou Beach.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn href="/#holly" variant="sunset">Talk to Holly — Find a Home</Btn>
            <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          </div>
          <ShareBar title="Devils Lake — Manitou Beach, Michigan" />
        </div>
      </div>
    </section>
  );
}

function DevilsLakeStatsSection() {
  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel light>By the Numbers</SectionLabel>
            <SectionTitle light>The Lake at a Glance</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {DEVILS_LAKE_STATS.map((stat, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "24px 20px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.cream, marginBottom: 6 }}>{stat.value}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{stat.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 24, textAlign: "right" }}>
          Source: fisherman.org
        </p>
      </div>
    </section>
  );
}

function DevilsLakeHistorySection() {
  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Deep Roots</SectionLabel>
          <SectionTitle>A Lake With a Story</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 0 16px 0" }}>
            Devils Lake has been drawing people in for over 150 years. From railroad-era grand hotels to the annual Tip-Up Festival on the ice — the history runs deep.
          </p>
          <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, maxWidth: 560, margin: "0 0 48px 0", fontStyle: "italic" }}>
            Some say Manitow. Some say Manitaw. Some say Manitoo. However you say it — you know the place.
          </p>
        </FadeIn>
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 18, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C.sunset}, ${C.lakeBlue})`, borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 36, paddingLeft: 52 }}>
            {DEVILS_LAKE_TIMELINE.map((item, i) => (
              <FadeIn key={i} delay={i * 80} direction="left">
                <div style={{ position: "relative" }}>
                  {/* Dot */}
                  <div style={{ position: "absolute", left: -42, top: 4, width: 12, height: 12, borderRadius: "50%", background: i === DEVILS_LAKE_TIMELINE.length - 1 ? C.sunset : C.lakeBlue, border: `3px solid ${C.cream}`, boxShadow: `0 0 0 2px ${i === DEVILS_LAKE_TIMELINE.length - 1 ? C.sunset : C.lakeBlue}` }} />
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunset, marginBottom: 6 }}>{item.year}</div>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.75, margin: 0 }}>{item.event}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DevilsLakeFishingSection() {
  return (
    <section style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>On the Line</SectionLabel>
          <SectionTitle>Fishing Devils Lake</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 0 20px 0" }}>
            A warm-water fishery with healthy bass, bluegill, pike, and perch. Year-round access — summer dock fishing and the legendary February Tip-Up Festival on the ice.
          </p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginTop: 48 }}>
          {DEVILS_LAKE_FISH.map((fish, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div style={{ background: C.cream, borderRadius: 12, border: `1px solid ${C.sand}`, overflow: "hidden", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                {/* Fish image */}
                <div style={{ height: 130, overflow: "hidden", background: C.sand, position: "relative" }}>
                  <img src={fish.image} alt={fish.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: fish.accentColor }} />
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>{fish.name}</h3>
                  <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6, margin: 0 }}>{fish.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={150}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Btn href="/fishing" variant="outline">Full Species Guide + Bait Tips →</Btn>
          </div>
        </FadeIn>
        {/* Next Event Banner — update title/date/location/href to change */}
        {(() => {
          const nextEvent = {
            label: "Coming Up",
            title: "Corks & Kegs",
            date: "May 2026",
            location: "Devils Lake Yacht Club",
            href: "https://www.devilslakeyachtclub.com",
          };
          return (
            <FadeIn delay={200}>
              <div style={{ marginTop: 48, background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`, borderRadius: 16, padding: "32px 36px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 10 }}>{nextEvent.label}</div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: C.cream, margin: "0 0 6px 0" }}>{nextEvent.title}</h3>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{nextEvent.date} · {nextEvent.location}</div>
                </div>
                <a href={nextEvent.href} target="_blank" rel="noopener noreferrer" className="btn-animated" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 28px", borderRadius: 8, flexShrink: 0,
                  background: C.sunset, color: C.cream,
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
                }}>
                  Event Details →
                </a>
              </div>
            </FadeIn>
          );
        })()}
      </div>
    </section>
  );
}

function DevilsLakeCommunitySection() {
  return (
    <section style={{
      backgroundImage: "url(/images/community-bg.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      padding: "100px 24px",
      position: "relative",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(18,28,36,0.80)", zIndex: 0 }} />
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <SectionLabel light>Life on the Lake</SectionLabel>
          <SectionTitle light>The Community</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 540, margin: "0 0 56px 0" }}>
            Devils Lake isn't just a place to visit — it's a community. Generations of families have built their summers, and often their lives, around this water.
          </p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {DEVILS_LAKE_COMMUNITY.map((item, i) => (
            <FadeIn key={i} delay={i * 80}>
              <a href={item.href} target={item.href && item.href.startsWith("http") ? "_blank" : undefined} rel={item.href && item.href.startsWith("http") ? "noopener noreferrer" : undefined} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div className="card-tilt" style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 14, overflow: "hidden", cursor: "pointer",
                  transition: "background 0.2s ease, border-color 0.2s ease", height: "100%",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
                >
                  {/* Image placeholder with icon centred, title overlaid at bottom */}
                  <div style={{ position: "relative", paddingTop: "62.5%", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 44, opacity: 0.6 }}>{item.icon}</span>
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(14,24,32,0.88), transparent)", padding: "28px 20px 14px" }}>
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.cream, margin: 0, lineHeight: 1.2 }}>{item.title}</h3>
                    </div>
                  </div>
                  {/* Description */}
                  <div style={{ padding: "16px 22px 22px" }}>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>

        {/* Men's Club callout */}
        <FadeIn delay={400}>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 8 }}>Community Organization</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>
              Ready to call Devils Lake home?
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 24px" }}>
              Holly Griewahn at Foundation Realty knows this lake like the back of her hand. Lakefront, cottage, or year-round — she's your person.
            </p>
            <Btn href="/#holly" variant="sunset">Talk to Holly</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function DevilsLakePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <DevilsLakeHero />
      <WaveDivider topColor={C.dusk} bottomColor={C.night} />
      <DevilsLakeStatsSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <DevilsLakeHistorySection />
      <section style={{
        backgroundImage: "url(/images/DL-boat.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: 420,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,18,24,0.45)" }} />
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px 24px" }}>
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 400, fontStyle: "italic", color: C.cream, margin: 0, lineHeight: 1.4, maxWidth: 640 }}>
            "The party lake."
          </p>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: 18 }}>Devils Lake · Manitou Beach, Michigan</p>
        </div>
      </section>
      <PromoBanner page="Devils Lake" />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <DevilsLakeFishingSection />
      <LakesPreservationBanner />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <DevilsLakeCommunitySection />
      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="devils-lake" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🌿  LAND & LAKE LADIES CLUB PAGE (/ladies-club)
// ============================================================
// LADIES_CLUB_EVENTS removed — content now inline in LadiesClubEventsSection

function LadiesClubHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/landlakes-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: C.night,
      padding: "180px 24px 140px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.75) 0%, rgba(10,18,24,0.48) 50%, rgba(10,18,24,0.88) 100%)" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <img src="/images/landlake-club-logo.png" alt="Land & Lake Ladies Club Logo" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: `3px solid rgba(255,255,255,0.18)`, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
          Community · Events · Lake Life
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 20px 0" }}>
          Land & Lake<br />Ladies Club
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
          A community of women dedicated to the lakes, the land, and the social fabric of Manitou Beach — hosting events, fundraisers, and the beloved Summer Festival.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#ladies-events" className="btn-animated" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 8,
            background: C.sunset, color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
          }}>
            Events & Activities
          </a>
          <ShareBar title="Land & Lake Ladies Club — Manitou Beach" />
        </div>
      </div>
    </section>
  );
}

function LadiesClubMissionSection() {
  const initiatives = [
    { title: "Adopt a Family / Senior", desc: "Monthly grocery and toiletry stipends for nominated families and seniors in need." },
    { title: "Teacher Fund", desc: "$600 annually to honor and support Addison teachers." },
    { title: "Angel Tree", desc: "Holiday gifts for up to 50 children, organized with community support." },
    { title: "Senior Scholarships", desc: "Three scholarships awarded to graduating seniors from the local area each year." },
    { title: "Veteran's Lunch", desc: "Hosting lunches to honor and celebrate local veterans." },
    { title: "Firecracker Run", desc: "Water stations and treats for runners — bomb pops and poppers along the route." },
    { title: "Holiday Gift Baskets", desc: "Pantry items for holiday baskets in partnership with Kiwanis." },
    { title: "Farmer's Craft & Market", desc: "Insurance support and coordination for local vendors at the Manitou Beach market." },
  ];

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>About the Club</SectionLabel>
          <SectionTitle>Women of the Lakes</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, maxWidth: 680, margin: "0 0 12px 0" }}>
            The Land & Lake Ladies Club (LLLC) is a 501(c)(4) nonprofit civic group dedicated to family-friendly projects that strengthen our community. Women from around the lakes gather to care for their neighbors, celebrate this place they call home, and give back in ways large and small.
          </p>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 680, margin: "0 0 48px 0" }}>
            From the Annual Summer Festival to quiet acts of service, the Ladies Club is the heart of what makes Manitou Beach more than a lake town.
          </p>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sage, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 20 }}>
            Key Initiatives
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {initiatives.map((item, i) => (
            <FadeIn key={i} delay={i * 40}>
              <div style={{ background: C.cream, borderRadius: 12, padding: "20px 22px", border: `1px solid ${C.sand}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>{item.title}</div>
                <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function LadiesClubEventsSection() {
  const features = [
    { label: "Live Music", desc: "Continuous entertainment throughout the day with seating provided for relaxation" },
    { label: "Fine Arts Section", desc: "A dozen or more outdoor artist booths featuring local talent and original work" },
    { label: "Children's Area", desc: "Bounce items, face painting, Lucky Ducky, balloons, and fun for all ages" },
    { label: "Crafts & Vendors", desc: "Local makers, artisan goods, handmade creations, and the Farmer's Craft Market" },
    { label: "Food & Drinks", desc: "Shaved ice, acai bowls, possible craft beer and wine — something for everyone" },
    { label: "Flower Sale", desc: "Fresh blooms and plants available while supplies last" },
  ];

  const tiers = [
    {
      level: "Platinum", amount: "$500", color: "#C8A84B",
      benefits: [
        "Individual sponsor banner for event or projects",
        "Featured advertisement on social media for event sponsorship",
        "Larger logo / print on Festival T-shirt",
        "Recognition on Sponsor Board",
        "Recognition on Festival Sponsor Banner and Brochures",
        "Recognition on this web page",
      ],
      areas: ["Children's Area", "Vendor & Crafter's Market", "Live Music Entertainment", "Fine Artists Section", "LLLC Community Projects"],
    },
    {
      level: "Gold", amount: "$250", color: "#E8C547",
      benefits: [
        "Advertisement on social media for sponsorship",
        "Larger logo / print on Festival T-shirt",
        "Recognition on Sponsor Board",
        "Recognition on Festival Sponsor Banner and Brochures",
        "Recognition on this web page",
      ],
    },
    {
      level: "Silver", amount: "$100", color: "#A8B8C8",
      benefits: [
        "Advertisement on social media for sponsorship",
        "Name / logo on Festival T-shirt",
        "Recognition on Sponsor Board",
        "Recognition on Festival Sponsor Banner and Brochures",
        "Recognition on this web page",
      ],
    },
    {
      level: "Bronze", amount: "$50", color: "#B87333",
      benefits: [
        "Advertisement on social media for sponsorship",
        "Name listed on Festival T-shirt",
        "Recognition on Sponsor Board and Brochures",
        "Recognition on this web page",
      ],
    },
    {
      level: "Friend", amount: "$25", color: C.sage,
      benefits: [
        "Advertisement on social media for sponsorship",
        "Name listed on Festival T-shirt",
        "Recognition on this web page",
      ],
    },
  ];

  return (
    <section id="ladies-events" style={{
      background: C.night, padding: "100px 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Subtle background texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/community-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", opacity: 0.12 }} />
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <SectionLabel light>Signature Event</SectionLabel>
            <SectionTitle center light>Summer Festival 2026</SectionTitle>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              The Land & Lake Ladies Club presents a lively day of food, music, crafts, art, and community — right in the heart of Manitou Beach Village.
            </p>
          </div>
        </FadeIn>

        {/* Festival card */}
        <FadeIn delay={100}>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 20, overflow: "hidden", marginBottom: 32,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }} className="mobile-col-1">

              {/* Image / logo side */}
              <div style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", minHeight: 400 }}>
                <img
                  src="/images/ladies-club/summer-festival.png"
                  alt="Summer Festival 2026"
                  style={{ width: 400, height: 400, objectFit: "contain", maxWidth: "100%" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>

              {/* Info side */}
              <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <img src="/images/landlake-club-logo.png" alt="LLLC Logo" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: "2px solid rgba(255,255,255,0.15)" }} />

                {/* Date badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: `${C.sunset}22`, border: `1px solid ${C.sunset}50`,
                  borderRadius: 6, padding: "6px 14px", marginBottom: 20, width: "fit-content",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: 2.5, textTransform: "uppercase", color: C.sunsetLight,
                }}>
                  June 20th, 2026
                </div>

                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 400, color: C.cream, margin: "0 0 8px 0", lineHeight: 1.15 }}>
                  Devils Lake<br />Summer Festival
                </h3>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight, marginBottom: 24 }}>
                  Saturday · 9:00 AM – 2:00 PM
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {[
                    { icon: "📍", text: "Manitou Beach Village" },
                    { icon: "📧", text: "michele.henson0003@gmail.com" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'Libre Franklin', sans-serif" }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                <a href="mailto:michele.henson0003@gmail.com" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 8, width: "fit-content",
                  background: C.sunset, color: C.cream, textDecoration: "none",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
                }}>
                  Get in Touch →
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* What to Expect — 3 per row, larger text */}
        <FadeIn delay={150}>
          <div style={{ marginBottom: 20, fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
            What to Expect
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }} className="mobile-col-1">
          {features.map((f, i) => (
            <FadeIn key={i} delay={160 + i * 40}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 22px" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.cream, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>{f.label}</div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Festival Map */}
        <FadeIn delay={200}>
          <img
            src="/images/ladies-club/summerfest-map.png"
            alt="Summer Festival 2026 Map — Manitou Beach Village"
            style={{ width: "100%", borderRadius: 14, marginBottom: 56, display: "block", border: "1px solid rgba(255,255,255,0.08)" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </FadeIn>

        {/* Sponsorship intro */}
        <FadeIn delay={220}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              Sponsorship Opportunities
            </div>
            <SectionTitle center light>Become a Sponsor</SectionTitle>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 640, margin: "0 auto" }}>
              Join us in supporting the Land and Lake Ladies Club (LLLC) Summer Festival 2026! Your sponsorship helps make this community celebration possible while providing your business with valuable recognition.
            </p>
          </div>
        </FadeIn>

        {/* Tier cards */}
        {/* Platinum — full width featured */}
        {tiers.slice(0, 1).map(tier => (
          <FadeIn key={tier.level} delay={240}>
            <div style={{
              background: `linear-gradient(135deg, rgba(200,168,75,0.12) 0%, rgba(200,168,75,0.04) 100%)`,
              border: `1px solid ${tier.color}50`, borderRadius: 18, padding: "36px 36px", marginBottom: 16,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: tier.color, borderRadius: "18px 0 0 18px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="mobile-col-1">
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: tier.color }}>{tier.level}</span>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "rgba(255,255,255,0.6)" }}>{tier.amount}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {tier.benefits.map((b, j) => (
                      <li key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                        <span style={{ color: tier.color, fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: tier.color, marginBottom: 14 }}>
                    Option to Sponsor a Specific Area
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {tier.areas.map((a, j) => (
                      <li key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}

        {/* Gold + Silver */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="mobile-col-1">
          {tiers.slice(1, 3).map((tier, i) => (
            <FadeIn key={tier.level} delay={260 + i * 40}>
              <div style={{
                background: "rgba(255,255,255,0.04)", border: `1px solid ${tier.color}35`, borderRadius: 14, padding: "28px 28px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: tier.color, borderRadius: "14px 0 0 14px" }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 18 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: tier.color }}>{tier.level}</span>
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.5)" }}>{tier.amount}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.benefits.map((b, j) => (
                    <li key={j} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                      <span style={{ color: tier.color, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bronze + Friend */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }} className="mobile-col-1">
          {tiers.slice(3).map((tier, i) => (
            <FadeIn key={tier.level} delay={300 + i * 40}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${tier.color}30`, borderRadius: 14, padding: "24px 24px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: tier.color, borderRadius: "14px 0 0 14px" }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: tier.color }}>{tier.level}</span>
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "rgba(255,255,255,0.45)" }}>{tier.amount}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.benefits.map((b, j) => (
                    <li key={j} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                      <span style={{ color: tier.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Footer */}
        <FadeIn delay={340}>
          <div style={{ textAlign: "center", padding: "24px 0 0" }}>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 600, margin: "0 auto 12px" }}>
              Your support helps LLLC continue funding community projects while creating a fun and memorable festival for all ages.
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
              Checks payable to: Land and Lake Ladies Club · Sponsorship deadline: March 20th, 2026
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function LadiesClubGallerySection() {
  // Photos coming soon — placeholders until new images are provided
  const placeholders = [1, 2, 3];

  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Memories</SectionLabel>
            <SectionTitle center>Gallery</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {placeholders.map((_, i) => (
            <FadeIn key={i} delay={i * 80} direction="scale">
              <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", paddingTop: "75%", background: C.warmWhite, border: `1px solid ${C.sand}` }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>Photo coming soon</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function LadiesClubSponsorsSection() {
  // Placeholder tiles — swap null for logo path as sponsors are confirmed
  const SponsorTile = ({ height = 110 }) => (
    <div style={{
      background: "#fff", border: `1.5px dashed ${C.sand}`, borderRadius: 12,
      height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      </div>
      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.8, textTransform: "uppercase" }}>Logo</span>
    </div>
  );

  const TierHeader = ({ label, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, marginTop: 40 }}>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
      <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color, fontWeight: 400, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
    </div>
  );

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <SectionLabel>Thank You</SectionLabel>
            <SectionTitle center>Our 2026 Sponsors</SectionTitle>
            <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              The Summer Festival is made possible by the generous support of our community sponsors.
            </p>
          </div>
        </FadeIn>

        {/* Platinum — 3 across */}
        <FadeIn>
          <TierHeader label="Platinum Sponsors" color="#b08d57" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[0,1,2].map(i => <SponsorTile key={i} height={140} />)}
          </div>
        </FadeIn>

        {/* Gold — 4 across */}
        <FadeIn>
          <TierHeader label="Gold Sponsors" color="#c9a227" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[0,1,2,3].map(i => <SponsorTile key={i} height={120} />)}
          </div>
        </FadeIn>

        {/* Silver — 5 across */}
        <FadeIn>
          <TierHeader label="Silver Sponsors" color="#8a9ba8" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[0,1,2,3,4].map(i => <SponsorTile key={i} height={100} />)}
          </div>
        </FadeIn>

        {/* Bronze — 6 across */}
        <FadeIn>
          <TierHeader label="Bronze Sponsors" color="#a0522d" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {[0,1,2,3,4,5].map(i => <SponsorTile key={i} height={88} />)}
          </div>
        </FadeIn>

        {/* Friends — text list with logo */}
        <FadeIn>
          <TierHeader label="Friends of LLLC" color={C.sage} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", justifyContent: "center", padding: "4px 0 8px" }}>
            {["Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend"].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/images/landlake-club-logo.png" alt="LLLC" style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.7 }} />
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>Friend Name</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p style={{ textAlign: "center", fontSize: 13, color: C.textMuted, marginTop: 40, lineHeight: 1.7 }}>
            Interested in sponsoring? Contact{" "}
            <a href="mailto:michele.henson0003@gmail.com" style={{ color: C.sage, textDecoration: "none" }}>michele.henson0003@gmail.com</a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function MensClubSponsorsSection() {
  const SponsorTile = ({ height = 110 }) => (
    <div style={{
      background: "#fff", border: `1.5px dashed ${C.sand}`, borderRadius: 12,
      height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      </div>
      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.8, textTransform: "uppercase" }}>Logo</span>
    </div>
  );

  const TierHeader = ({ label, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, marginTop: 40 }}>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
      <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color, fontWeight: 400, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
    </div>
  );

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <SectionLabel>Thank You</SectionLabel>
            <SectionTitle center>Our 2026 Sponsors</SectionTitle>
            <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              The Tip-Up Festival and our year-round programs are made possible by the generous support of our community sponsors.
            </p>
          </div>
        </FadeIn>

        {/* Platinum — 3 across */}
        <FadeIn>
          <TierHeader label="Platinum Sponsors" color="#b08d57" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[0,1,2].map(i => <SponsorTile key={i} height={140} />)}
          </div>
        </FadeIn>

        {/* Gold — 4 across */}
        <FadeIn>
          <TierHeader label="Gold Sponsors" color="#c9a227" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[0,1,2,3].map(i => <SponsorTile key={i} height={120} />)}
          </div>
        </FadeIn>

        {/* Silver — 5 across */}
        <FadeIn>
          <TierHeader label="Silver Sponsors" color="#8a9ba8" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[0,1,2,3,4].map(i => <SponsorTile key={i} height={100} />)}
          </div>
        </FadeIn>

        {/* Bronze — 6 across */}
        <FadeIn>
          <TierHeader label="Bronze Sponsors" color="#a0522d" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {[0,1,2,3,4,5].map(i => <SponsorTile key={i} height={88} />)}
          </div>
        </FadeIn>

        {/* Friends — text list */}
        <FadeIn>
          <TierHeader label="Friends of the Club" color={C.sage} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", justifyContent: "center", padding: "4px 0 8px" }}>
            {["Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend"].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/images/mens_club_logo.png" alt="DRLMC" style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.7 }} />
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>Friend Name</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p style={{ textAlign: "center", fontSize: 13, color: C.textMuted, marginTop: 40, lineHeight: 1.7 }}>
            Interested in sponsoring the Men's Club?{" "}
            <a href="mailto:hello@manitoubeach.com" style={{ color: C.sage, textDecoration: "none" }}>Get in touch</a>{" "}
            and we'll connect you with the club.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function LadiesClubGetInvolved() {
  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel>Get Involved</SectionLabel>
          <SectionTitle center>Connect with the Club</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, marginBottom: 32 }}>
            Interested in the Summer Festival, community events, or membership? Reach out — the lakes community is always welcoming new faces.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:michele.henson0003@gmail.com" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: C.sunset, color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Send us a message
            </a>
            <a href="/devils-lake" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: "transparent", border: `1.5px solid ${C.sand}`, color: C.text,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Back to Devils Lake
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function LadiesClubPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <LadiesClubHero />
      <LadiesClubMissionSection />
      <LadiesClubEventsSection />
      <LadiesClubSponsorsSection />
      <LadiesClubGallerySection />
      <LadiesClubGetInvolved />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

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

function PlacementDiagram({ type, dark = false }) {
  // dark=true → card is selected (dark bg). dark=false → card is unselected (cream bg)
  const hl = "rgba(212,132,90,0.85)";
  const bg = dark ? "rgba(255,255,255,0.05)" : "rgba(45,59,69,0.04)";
  const line = dark ? "rgba(255,255,255,0.10)" : "rgba(45,59,69,0.12)";
  const muted = dark ? "rgba(255,255,255,0.09)" : "rgba(45,59,69,0.09)";
  const base = {
    borderRadius: 6, overflow: "hidden", marginBottom: 14,
    border: `1px solid ${line}`, background: bg,
    padding: "8px 10px", position: "relative",
  };

  if (type === "free") return (
    <div style={base}>
      <div style={{ height: 8, borderRadius: 3, background: muted, marginBottom: 5, width: "55%" }} />
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 8, borderRadius: 3, background: muted, marginBottom: 3, opacity: i === 1 ? 1 : 0.6 }} />
      ))}
      <div style={{ fontSize: 7, color: dark ? "rgba(255,255,255,0.35)" : "rgba(45,59,69,0.4)", fontFamily: "'Libre Franklin',sans-serif", marginTop: 3, letterSpacing: 0.5 }}>Text-only listing in the calendar</div>
    </div>
  );

  if (type === "hero") return (
    <div style={base}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 5 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: muted }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: muted }} />
        <div style={{ width: 20, height: 4, borderRadius: 2, background: muted }} />
        <div style={{ width: 16, height: 4, borderRadius: 2, background: muted }} />
      </div>
      <div style={{ height: 38, borderRadius: 4, background: hl, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 8, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Your Event — Full Screen</span>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
        {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 10, borderRadius: 3, background: muted }} />)}
      </div>
    </div>
  );

  if (type === "calendar") return (
    <div style={base}>
      <div style={{ height: 8, borderRadius: 3, background: muted, marginBottom: 5, width: "60%" }} />
      <div style={{ borderRadius: 4, border: `1.5px solid ${hl}`, background: `${hl}20`, padding: "4px 6px", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 20, height: 14, borderRadius: 2, background: hl, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.5)", marginBottom: 2 }} />
          <div style={{ height: 3, borderRadius: 2, background: muted, width: "70%" }} />
        </div>
        <div style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: hl, whiteSpace: "nowrap", letterSpacing: 0.5 }}>GET TICKETS</div>
      </div>
      {[1,2].map(i => <div key={i} style={{ height: 10, borderRadius: 3, background: muted, marginBottom: 3 }} />)}
    </div>
  );

  if (type === "newsletter_sm") return (
    <div style={base}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
        <div style={{ fontSize: 12 }}>✉️</div>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: muted }} />
      </div>
      {[1,2].map(i => <div key={i} style={{ height: 4, borderRadius: 2, background: muted, marginBottom: 3, width: "100%" }} />)}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 3, background: `${hl}30`, border: `1px solid ${hl}60`, marginBottom: 3 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: hl, flexShrink: 0 }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: hl, opacity: 0.7 }} />
        <div style={{ fontSize: 6, color: dark ? "rgba(255,255,255,0.5)" : "rgba(45,59,69,0.5)", fontFamily: "'Libre Franklin',sans-serif", whiteSpace: "nowrap" }}>↗</div>
      </div>
      {[1,2].map(i => <div key={i} style={{ height: 4, borderRadius: 2, background: muted, marginBottom: 3, width: i === 2 ? "65%" : "100%" }} />)}
      <div style={{ fontSize: 7, color: dark ? "rgba(255,255,255,0.35)" : "rgba(45,59,69,0.4)", fontFamily: "'Libre Franklin',sans-serif", letterSpacing: 0.5 }}>Brand mention with link in email body</div>
    </div>
  );

  if (type === "newsletter") return (
    <div style={base}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
        <div style={{ fontSize: 12 }}>✉️</div>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: muted }} />
      </div>
      <div style={{ borderRadius: 3, background: hl, padding: "4px 6px", marginBottom: 4, textAlign: "center" }}>
        <span style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>Your Brand — Top of Email</span>
      </div>
      {[1,2,3].map(i => <div key={i} style={{ height: 4, borderRadius: 2, background: muted, marginBottom: 3, width: i === 3 ? "55%" : "100%" }} />)}
    </div>
  );

  if (type === "banner" || type === "banner3") return (
    <div style={base}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: muted }} />
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: muted }} />
      </div>
      {[1,2].map(i => <div key={i} style={{ height: 5, borderRadius: 2, background: muted, marginBottom: 3 }} />)}
      <div style={{ height: 14, borderRadius: 3, background: hl, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3, position: "relative" }}>
        <span style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>
          {type === "banner3" ? "Your Banner — 3 Pages" : "Your Banner Placement"}
        </span>
      </div>
      {[1,2].map(i => <div key={i} style={{ height: 5, borderRadius: 2, background: muted, marginBottom: 3 }} />)}
      {type === "banner3" && (
        <div style={{ display: "flex", gap: 3 }}>
          {["Page 1","Page 2","Page 3"].map(p => (
            <div key={p} style={{ flex: 1, height: 8, borderRadius: 2, background: `${hl}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 6, color: "rgba(255,255,255,0.6)", fontFamily: "'Libre Franklin',sans-serif" }}>{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (type === "strip") return (
    <div style={base}>
      <div style={{ height: 24, borderRadius: 4, background: muted, marginBottom: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin',sans-serif" }}>Hero Area</span>
      </div>
      <div style={{ display: "flex", gap: 4, overflow: "hidden" }}>
        <div style={{ flexShrink: 0, width: 44, height: 28, borderRadius: 4, background: hl, border: `1.5px solid rgba(255,255,255,0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 6, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>YOUR<br/>EVENT</span>
        </div>
        {[1,2,3].map(i => <div key={i} style={{ flexShrink: 0, width: 44, height: 28, borderRadius: 4, background: muted }} />)}
      </div>
      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin',sans-serif", marginTop: 3, letterSpacing: 0.5 }}>First in the Coming Up strip</div>
    </div>
  );

  if (type === "video") return (
    <div style={base}>
      <div style={{ height: 44, borderRadius: 4, background: `linear-gradient(135deg,rgba(10,18,24,0.9),rgba(45,59,69,0.9))`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${hl}60` }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: hl, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 8, marginLeft: 2 }}>▶</span>
        </div>
        <div>
          <div style={{ fontSize: 7, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>Holly & The Yeti</div>
          <div style={{ fontSize: 6, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin',sans-serif" }}>feature your event</div>
        </div>
      </div>
    </div>
  );

  if (type === "bundle") return (
    <div style={base}>
      <div style={{ height: 14, borderRadius: 3, background: hl, display: "flex", alignItems: "center", paddingLeft: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 6, fontFamily: "'Libre Franklin',sans-serif", fontWeight: 700, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" }}>Front Page</span>
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 2, background: `${hl}80`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 6, color: "#fff", fontFamily: "'Libre Franklin',sans-serif" }}>✉️ Newsletter</span>
        </div>
        <div style={{ flex: 1, height: 8, borderRadius: 2, background: `${hl}60`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 6, color: "#fff", fontFamily: "'Libre Franklin',sans-serif" }}>📅 Calendar</span>
        </div>
      </div>
      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin',sans-serif", textAlign: "center", letterSpacing: 0.5 }}>All three placements at once</div>
    </div>
  );

  return null;
}

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

function PromotePage() {
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

// ============================================================
// 📰  THE MANITOU DISPATCH — BLOG / NEWSLETTER ARCHIVE
// ============================================================

const CATEGORY_COLORS = {
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

function useDispatchAds(page) {
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
function pickAd(slotAds) {
  if (!slotAds || !slotAds.length) return null;
  return slotAds[Math.floor(Math.random() * slotAds.length)];
}

function AdSlot({ ads, variant = 'leaderboard' }) {
  const ad = pickAd(ads);
  if (!ad) return null;

  const animStyle =
    ad.animation === 'pulse' ? { animation: 'adPulse 3s ease-in-out infinite' } :
    ad.animation === 'slide' ? { animation: 'adSlide 0.6s ease-out forwards' } :
    ad.animation === 'fade'  ? { animation: 'adFade 4s ease-in-out infinite' } :
    {};

  const heights = { leaderboard: 90, 'mid-article': 220, 'footer-strip': 110, 'listing-banner': 90 };
  const h = heights[variant] || 90;

  const outerPad = variant === 'mid-article'
    ? { maxWidth: 720, margin: '32px auto 0', padding: '0 24px' }
    : { maxWidth: 1100, margin: '0 auto', padding: '20px 24px 0' };

  return (
    <div style={outerPad}>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#bbb', marginBottom: 5, fontFamily: "'Libre Franklin', sans-serif", textAlign: 'right' }}>
        Sponsored
      </div>
      <a
        href={ad.linkUrl || '#'}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{ display: 'block', textDecoration: 'none', borderRadius: 10, overflow: 'hidden', ...animStyle }}
        aria-label={ad.altText || ad.name}
      >
        {ad.imageUrl ? (
          <>
            <img
              src={ad.imageUrl}
              alt={ad.altText || ad.name}
              style={{ width: '100%', height: h, objectFit: 'cover', display: 'block' }}
            />
            {ad.offerText && (
              <div style={{ background: C.night, padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>{ad.offerText}</span>
                {ad.couponCode && (
                  <span style={{ background: C.sunset, color: '#fff', borderRadius: 5, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    CODE: {ad.couponCode}
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ background: `linear-gradient(135deg, ${C.dusk}, ${C.lakeBlue})`, height: h, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, padding: 24 }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: variant === 'mid-article' ? 20 : 16, color: '#fff', fontWeight: 700, textAlign: 'center' }}>{ad.name}</div>
            {ad.offerText && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>{ad.offerText}</div>}
            {ad.couponCode && <div style={{ background: C.sunset, color: '#fff', borderRadius: 5, padding: '4px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>CODE: {ad.couponCode}</div>}
          </div>
        )}
      </a>
    </div>
  );
}

function DispatchArticleContent({ content }) {
  if (!content || !content.length) return null;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', fontFamily: "'Libre Franklin', sans-serif", color: C.text, lineHeight: 1.8, fontSize: 17 }}>
      {content.map((block, i) => {
        if (block.type === 'p') return (
          <p key={i} style={{ marginBottom: 20 }}>{block.text}</p>
        );
        if (block.type === 'h1') return (
          <h1 key={i} style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 700, color: C.dusk, marginTop: 40, marginBottom: 16 }}>{block.text}</h1>
        );
        if (block.type === 'h2') return (
          <h2 key={i} style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: C.dusk, marginTop: 36, marginBottom: 12 }}>{block.text}</h2>
        );
        if (block.type === 'h3') return (
          <h3 key={i} style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: C.dusk, marginTop: 28, marginBottom: 10 }}>{block.text}</h3>
        );
        if (block.type === 'quote') return (
          <blockquote key={i} style={{ borderLeft: `4px solid ${C.sage}`, paddingLeft: 20, margin: '24px 0', fontStyle: 'italic', color: '#5a5a5a', fontSize: 18 }}>{block.text}</blockquote>
        );
        if (block.type === 'callout') return (
          <div key={i} style={{ background: C.warmWhite, borderRadius: 10, padding: '16px 20px', margin: '24px 0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22 }}>{block.icon}</span>
            <span>{block.text}</span>
          </div>
        );
        if (block.type === 'divider') return (
          <hr key={i} style={{ border: 'none', borderTop: `1px solid ${C.sage}30`, margin: '32px 0' }} />
        );
        if (block.type === 'image') return (
          <figure key={i} style={{ margin: '28px 0' }}>
            <img src={block.url} alt={block.caption || ''} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
            {block.caption && <figcaption style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 8 }}>{block.caption}</figcaption>}
          </figure>
        );
        if (block.type === 'ul') return (
          <ul key={i} style={{ paddingLeft: 24, marginBottom: 20 }}>
            {block.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
          </ul>
        );
        if (block.type === 'ol') return (
          <ol key={i} style={{ paddingLeft: 24, marginBottom: 20 }}>
            {block.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
          </ol>
        );
        return null;
      })}
    </div>
  );
}

function DispatchArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle'); // idle | loading | success | exists | error
  const [moreArticles, setMoreArticles] = useState([]);
  const adSlots = useDispatchAds('dispatch-article');
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  const handleInlineSub = async (e) => {
    e.preventDefault();
    if (!subEmail || subStatus === 'loading') return;
    setSubStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSubStatus(data.alreadySubscribed ? 'exists' : 'success');
    } catch {
      setSubStatus('error');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/dispatch-articles?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { setArticle(d.article || null); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/dispatch-articles')
      .then(r => r.json())
      .then(d => setMoreArticles((d.articles || []).filter(a => a.slug !== slug).slice(0, 3)))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    const prevTitle = document.title;
    document.title = `${article.title} — The Manitou Dispatch`;
    const setMeta = (attr, name, content) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', `${article.title} — The Manitou Dispatch`);
    setMeta('property', 'og:description', article.excerpt || 'Lake life, local news, and a little Yeti wisdom from Manitou Beach.');
    setMeta('property', 'og:type', 'article');
    if (article.coverImage) setMeta('property', 'og:image', article.coverImage);
    setMeta('name', 'description', article.excerpt || 'Lake life, local news, and a little Yeti wisdom from Manitou Beach.');
    return () => { document.title = prevTitle; };
  }, [article]);

  const formatDate = (str) => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      <div style={{ paddingTop: 80, minHeight: '100vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: C.sage }}>Loading…</div>
        ) : !article ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ marginBottom: 20, color: '#888' }}>Article not found.</p>
            <button onClick={() => navigate('/dispatch')} style={{ background: C.sage, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 15 }}>← Back to Dispatch</button>
          </div>
        ) : (
          <>
            {article.coverImage && (
              <div style={{ width: '100%', maxHeight: 420, overflow: 'hidden', position: 'relative' }}>
                <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
                {article.photoCredit && (
                  <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em' }}>
                    <a href={article.photoCredit.photographerUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                      {article.photoCredit.text}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard ad — below hero, above article */}
            <AdSlot ads={adSlots['leaderboard']} variant="leaderboard" />

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
              <button
                onClick={() => navigate('/dispatch')}
                style={{ background: 'transparent', border: `1px solid ${C.sage}`, color: C.sage, borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                ← The Dispatch
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ background: CATEGORY_COLORS[article.category] || C.lakeBlue, color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {article.category}
                </span>
                {article.tags.map(tag => (
                  <span key={tag} style={{ background: C.warmWhite, color: C.sage, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 500 }}>#{tag}</span>
                ))}
              </div>

              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 700, color: C.dusk, lineHeight: 1.25, marginBottom: 16 }}>
                {article.title}
              </h1>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: '#888', fontSize: 14, marginBottom: 36, flexWrap: 'wrap' }}>
                <span>By <strong style={{ color: C.text }}>{article.author}</strong></span>
                {article.publishedDate && <span>{formatDate(article.publishedDate)}</span>}
              </div>

              {article.excerpt && (
                <p style={{ fontSize: 19, fontStyle: 'italic', color: '#5a5a5a', borderLeft: `4px solid ${C.lakeBlue}`, paddingLeft: 20, marginBottom: 36, lineHeight: 1.6 }}>
                  {article.excerpt}
                </p>
              )}

              {/* Article content — split at block 4 for mid-article ad injection */}
              {(() => {
                const content = article.content || [];
                const splitAt = Math.min(4, Math.floor(content.length / 2));
                const top = content.slice(0, splitAt);
                const bottom = content.slice(splitAt);
                return (
                  <>
                    <DispatchArticleContent content={top} />
                    <AdSlot ads={adSlots['mid-article']} variant="mid-article" />
                    <DispatchArticleContent content={bottom} />
                  </>
                );
              })()}

              {/* Yeti Desk sign-off */}
              <div style={{ margin: '56px 0 40px', borderTop: `2px solid ${C.sand}`, paddingTop: 36 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <img
                    src="/images/yeti/yeti-camera.png"
                    alt="The Yeti"
                    onError={e => { e.target.style.display = 'none'; }}
                    style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sage, marginBottom: 4 }}>
                      {article.aiGenerated ? 'The Yeti Desk' : 'Editor\'s Note · The Yeti Desk'}
                    </div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, fontWeight: 700, color: C.dusk, marginBottom: article.editorNote ? 10 : 0 }}>
                      {article.aiGenerated ? `Written by The Yeti` : `By ${article.author}`}
                    </div>
                    {article.editorNote && (
                      <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                        {article.editorNote}
                      </p>
                    )}
                    <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>
                      Holly &amp; The Yeti · Devils Lake, Michigan
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer-strip ad — between sign-off and subscribe form */}
              <AdSlot ads={adSlots['footer-strip']} variant="footer-strip" />

              {/* More from The Dispatch */}
              {moreArticles.length > 0 && (
                <div style={{ margin: '52px 0 40px' }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.dusk, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.sand}` }}>More from The Dispatch</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {moreArticles.map(a => (
                      <a key={a.id} href={`/dispatch/${a.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)'; }}
                      >
                        {a.coverImage ? (
                          <img src={a.coverImage} alt={a.title} style={{ width: 84, height: 62, objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 84, height: 62, background: `url(/images/dispatch-header-web.jpg) center/cover`, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, background: `${C.dusk}99` }} />
                          </div>
                        )}
                        <div style={{ padding: '10px 14px 10px 0', flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10, color: CATEGORY_COLORS[a.category] || C.lakeBlue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{a.category}</div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: C.dusk, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.title}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 40, padding: '36px 32px', background: C.night, borderRadius: 14, textAlign: 'center' }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.warmWhite, marginBottom: 8 }}>Enjoying The Dispatch?</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>Get lake life news, local tips, and a little Yeti wisdom delivered to your inbox.</p>
                <ShareBar title={article.title} />
                <div style={{ height: 24 }} />
                {subStatus === 'success' ? (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📬</div>
                    <p style={{ color: C.warmWhite, fontWeight: 600, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>Check your inbox!</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>Click the confirmation link to complete sign-up. Check spam if you don't see it.</p>
                    <a href="/dispatch" style={{ display: 'inline-block', marginTop: 18, fontSize: 14, color: C.lakeBlue, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>← Back to The Dispatch</a>
                  </div>
                ) : subStatus === 'exists' ? (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
                    <p style={{ color: C.warmWhite, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}>You're already on the list — next issue incoming!</p>
                    <a href="/dispatch" style={{ display: 'inline-block', marginTop: 16, fontSize: 14, color: C.lakeBlue, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>← Back to The Dispatch</a>
                  </div>
                ) : (
                  <form onSubmit={handleInlineSub} style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={subEmail}
                      onChange={e => setSubEmail(e.target.value)}
                      required
                      disabled={subStatus === 'loading'}
                      style={{
                        flex: 1, minWidth: 200, padding: '12px 18px', borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.08)', color: C.warmWhite,
                        fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={subStatus === 'loading'}
                      style={{ background: C.sunset, color: '#fff', border: 'none', borderRadius: 6, padding: '12px 24px', cursor: subStatus === 'loading' ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}
                    >
                      {subStatus === 'loading' ? 'Joining…' : 'Subscribe Free'}
                    </button>
                    {subStatus === 'error' && <p style={{ width: '100%', color: '#ff9f9f', fontSize: 13, marginTop: 4 }}>Something went wrong — try again.</p>}
                  </form>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ── Dispatch Card Sponsors ──────────────────────────────────────────────────────
// Add/remove sponsors here. Rotates across cards by index.
// logo: path in /public (e.g. '/images/blackbird-logo.png'), or null → shows 📷 placeholder
// Set array to [] to hide all sponsor strips.
const DISPATCH_CARD_SPONSORS = [
  {
    name: 'Blackbird Cafe & Baking Co.',
    logo: '/images/blackbird-logo.png',
    offerText: 'Free cookie for new subscribers',
  },
];

function SponsorStrip({ index = 0 }) {
  if (!DISPATCH_CARD_SPONSORS.length) return null;
  const sponsor = DISPATCH_CARD_SPONSORS[index % DISPATCH_CARD_SPONSORS.length];
  return (
    <div style={{ borderTop: '1px solid #ede8df', padding: '10px 20px 13px', display: 'flex', alignItems: 'center', gap: 10, background: '#fdf9f4' }}>
      {sponsor.logo ? (
        <img src={sponsor.logo} alt={sponsor.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'contain', border: '1px solid #e8dfd0', background: '#fff', padding: 3, flexShrink: 0 }} />
      ) : (
        <div style={{ width: 40, height: 40, borderRadius: 6, border: '1.5px dashed #c4b09a', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf5ef', flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>📷</span>
        </div>
      )}
      <div style={{ minWidth: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#b8a898', fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 1 }}>Sponsored by</div>
        <div style={{ fontSize: 12, color: C.dusk, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sponsor.name}</div>
        {sponsor.offerText && <div style={{ fontSize: 11, color: C.textLight, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.35, marginTop: 1 }}>{sponsor.offerText}</div>}
      </div>
    </div>
  );
}

// ============================================================
// 📰  DISPATCH PREVIEW — Homepage 3-card teaser
// ============================================================
function DispatchPreviewSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dispatch-articles')
      .then(r => r.json())
      .then(d => { setArticles((d.articles || []).slice(0, 3)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && articles.length === 0) return null;

  const formatDate = (str) => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <section style={{ background: C.cream, padding: '56px 24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <SectionLabel>Latest Stories</SectionLabel>
            <SectionTitle>The Manitou Dispatch</SectionTitle>
          </div>
          <a href="/dispatch" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.lakeBlue, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Read all stories →
          </a>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, height: 280, opacity: 0.35 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {articles.map((article, idx) => (
              <FadeIn key={article.id}>
                <a
                  href={`/dispatch/${article.slug}`}
                  style={{ textDecoration: 'none', display: 'block', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.07)'; }}
                >
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 180, background: 'url(/images/dispatch-header-web.jpg) center/cover', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.dusk}cc, ${C.lakeBlue}99)` }} />
                      <span style={{ position: 'absolute', bottom: 12, left: 16, fontFamily: "'Caveat', cursive", fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>The Dispatch</span>
                    </div>
                  )}
                  <div style={{ padding: '18px 20px 22px' }}>
                    <span style={{ background: CATEGORY_COLORS[article.category] || C.lakeBlue, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {article.category}
                    </span>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: C.dusk, margin: '10px 0 6px', lineHeight: 1.3 }}>
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                        {article.excerpt.length > 90 ? article.excerpt.slice(0, 90) + '…' : article.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#999', borderTop: `1px solid ${C.sand}`, paddingTop: 10, marginTop: 10 }}>
                      <span>{article.author}{article.publishedDate && ` · ${formatDate(article.publishedDate)}`}</span>
                      <span style={{ color: C.lakeBlue, fontWeight: 600, fontSize: 12 }}>Read story →</span>
                    </div>
                  </div>
                  <SponsorStrip index={idx} />
                </a>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function DispatchPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const adSlots = useDispatchAds('dispatch-listing');
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/dispatch-articles')
      .then(r => { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then(d => { setArticles(d.articles || []); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, []);

  const formatDate = (str) => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        backgroundImage: 'url(/images/dispatch-header-web.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        minHeight: 380,
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,18,24,0.3) 0%, rgba(10,18,24,0.75) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '48px 32px', maxWidth: 800, width: '100%', margin: '0 auto' }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.sunset, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Holly & The Yeti present</div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
            The Manitou Dispatch
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, margin: 0, fontStyle: 'italic' }}>
            Lake life, local news, and a little Yeti wisdom
          </p>
        </div>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />

      {/* Listing banner ad — below hero wave, above article grid */}
      <AdSlot ads={adSlots['listing-banner']} variant="listing-banner" />

      {/* Articles Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.sage }}>Loading the latest…</div>
        ) : fetchError ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: C.sunset, marginBottom: 8 }}>Something went sideways.</p>
            <p style={{ color: '#888', fontSize: 15 }}>Couldn't load the articles right now — try refreshing in a moment.</p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: C.sage, marginBottom: 8 }}>First issue coming soon.</p>
            <p style={{ color: '#888', fontSize: 15 }}>Subscribe below to be the first to get it.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {articles.map((article, idx) => (
              <FadeIn key={article.id}>
                <div
                  onClick={() => navigate(`/dispatch/${article.slug}`)}
                  style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)'; }}
                >
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 200, background: 'url(/images/dispatch-header-web.jpg) center/cover', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.dusk}cc, ${C.lakeBlue}99)` }} />
                      <span style={{ position: 'absolute', bottom: 14, left: 18, fontFamily: "'Caveat', cursive", fontSize: 28, color: 'rgba(255,255,255,0.75)' }}>The Dispatch</span>
                    </div>
                  )}
                  <div style={{ padding: '20px 22px 24px' }}>
                    <span style={{ background: CATEGORY_COLORS[article.category] || C.lakeBlue, color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {article.category}
                    </span>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: C.dusk, margin: '12px 0 8px', lineHeight: 1.3 }}>
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, margin: '0 0 14px' }}>
                        {article.excerpt.length > 120 ? article.excerpt.slice(0, 120) + '…' : article.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#999', borderTop: `1px solid ${C.sand}`, paddingTop: 10, marginTop: 4 }}>
                      <span>{article.author}{article.publishedDate && ` · ${formatDate(article.publishedDate)}`}</span>
                      <span style={{ color: C.lakeBlue, fontWeight: 600 }}>Read story →</span>
                    </div>
                  </div>
                  <SponsorStrip index={idx} />
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />
      <NewsletterInline />
      <WaveDivider topColor={C.night} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="dispatch" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🛠️  YETI ADMIN — AI Article Writer (unlisted, /yeti-admin)
// ============================================================
const DISPATCH_CATEGORIES = ['Lake Life', 'Community', 'Events', 'Real Estate', 'Food & Drink', 'History', 'Recreation', 'Seasonal Tips', "Holly's Corner", 'Advertorial'];

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

function ClaimPage() {
  const { slug } = useParams();
  const biz = CLAIM_BUSINESSES[slug];

  const [step, setStep] = useState('form'); // form | confirm | rate | done
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [notionId, setNotionId] = useState(null);
  const [claimCode, setClaimCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Restore previous claim from localStorage (so code survives tab close)
  useEffect(() => {
    const saved = localStorage.getItem(`claim_${slug}`);
    if (saved) {
      try {
        const { notionId: nid, claimCode: cc, name: n } = JSON.parse(saved);
        if (nid && cc) {
          setNotionId(nid);
          setClaimCode(cc);
          if (n) setName(n);
          setStep('confirm');
          return;
        }
      } catch {}
    }
    // Pre-fill from beehiiv URL params: /claim/cafe?email=...&name=...
    const p = new URLSearchParams(window.location.search);
    if (p.get('email')) setEmail(decodeURIComponent(p.get('email')));
    if (p.get('name'))  setName(decodeURIComponent(p.get('name')));
  }, [slug]);

  const handleClaim = async () => {
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setNotionId(data.notionId);
      setClaimCode(data.claimCode);
      localStorage.setItem(`claim_${slug}`, JSON.stringify({ notionId: data.notionId, claimCode: data.claimCode, name: name.trim() }));
      setStep('confirm');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = (n) => {
    setRating(n);
    // Save rating immediately for 4-5 (they may not tap Google Review button)
    if (n >= 4 && notionId) {
      fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId, rating: n }),
      }).catch(() => {});
    }
  };

  const handleReviewClick = () => {
    if (notionId) {
      fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId, rating, googleClicked: true }),
      }).catch(() => {});
    }
    window.open(biz.reviewUrl, '_blank');
  };

  const handleFeedbackSubmit = () => {
    if (notionId) {
      fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId, rating, feedback: feedback.trim() }),
      }).catch(() => {});
    }
    setStep('done');
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: `1px solid ${C.sand}`, fontSize: 16, color: C.text,
    fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600, color: C.dusk,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
  };

  if (!biz) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <p style={{ color: C.textLight }}>Offer not found.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Libre Franklin', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: C.dusk, padding: '14px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.sage }}>The Manitou Dispatch</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>× {biz.name}</div>
      </div>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* ── STEP: FORM ───────────────────────────────── */}
        {step === 'form' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>{biz.emoji}</div>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, margin: '0 0 8px', lineHeight: 1.3 }}>
                Your {biz.offerText} is waiting
              </h1>
              <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{biz.descLine}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Your Name</label>
                <input style={inputStyle} placeholder="First name is fine" value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" />
              </div>
              {error && <p style={{ color: C.sunset, fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
              <button
                onClick={handleClaim}
                disabled={submitting || !name.trim() || !email.trim()}
                style={{
                  width: '100%', padding: '14px', borderRadius: 8, border: 'none',
                  background: submitting || !name.trim() || !email.trim() ? C.driftwood : biz.accentColor,
                  color: '#fff', fontSize: 16, fontWeight: 700,
                  cursor: submitting || !name.trim() || !email.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background 0.15s',
                }}
              >{submitting ? 'Just a sec…' : `Claim My ${biz.offerText.replace(/^./, c => c.toUpperCase())} →`}</button>
              <p style={{ textAlign: 'center', fontSize: 11, color: C.textMuted, marginTop: 12, lineHeight: 1.5 }}>
                One per person · Manitou Dispatch subscribers only
              </p>
            </div>
          </div>
        )}

        {/* ── STEP: CONFIRMATION ───────────────────────── */}
        {step === 'confirm' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, margin: '0 0 8px' }}>
              You're all set, {name.split(' ')[0]}!
            </h1>
            <p style={{ color: C.textLight, fontSize: 15, marginBottom: 28 }}>Show this screen to your barista at {biz.name}</p>
            <div style={{ background: C.dusk, borderRadius: 14, padding: '24px 32px', marginBottom: 28, display: 'inline-block', minWidth: 220 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>Claim Code</div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: '#fff', letterSpacing: '0.1em', fontWeight: 700 }}>{claimCode}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{biz.offerText} · one use</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
              <p style={{ margin: '0 0 16px', color: C.text, fontSize: 15, lineHeight: 1.5 }}>
                Enjoy your {biz.offerText}! Once you've got it, take 10 seconds to rate your visit:
              </p>
              <button
                onClick={() => setStep('rate')}
                style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: biz.accentColor, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >Rate My Visit ★</button>
            </div>
          </div>
        )}

        {/* ── STEP: RATE ───────────────────────────────── */}
        {step === 'rate' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.dusk, margin: '0 0 8px' }}>
              How was it at {biz.name}?
            </h2>
            <p style={{ color: C.textLight, fontSize: 14, marginBottom: 32 }}>Tap a star</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => handleRate(n)}
                  style={{
                    width: 54, height: 54, borderRadius: 12, border: 'none',
                    background: n <= rating ? '#FFF3E0' : C.warmWhite,
                    cursor: 'pointer', fontSize: 30,
                    color: n <= rating ? '#F5A623' : '#CCC',
                    transition: 'all 0.12s',
                  }}
                >★</button>
              ))}
            </div>

            {/* Low rating — private feedback */}
            {rating > 0 && rating <= 3 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'left' }}>
                <p style={{ color: C.dusk, fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Sorry to hear that.</p>
                <p style={{ color: C.textLight, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  Tell {biz.name} directly — they want to make it right.
                </p>
                <textarea
                  style={{ ...inputStyle, fontSize: 14, minHeight: 80, resize: 'vertical' }}
                  placeholder="What could have been better?"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <button
                  onClick={handleFeedbackSubmit}
                  style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: C.dusk, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >Send Feedback</button>
              </div>
            )}

            {/* High rating — Yelp Review */}
            {rating >= 4 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <p style={{ color: C.dusk, fontWeight: 700, marginBottom: 6, fontSize: 17 }}>Love it! 🙌</p>
                <p style={{ color: C.textLight, fontSize: 14, marginBottom: 18, lineHeight: 1.6 }}>
                  A Yelp review means everything to a small local business. Takes 30 seconds.
                </p>
                <button
                  onClick={handleReviewClick}
                  style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: '#D32323', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >Leave a Yelp Review →</button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: DONE (after private feedback) ─────── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, margin: '0 0 12px' }}>
              Thanks for the feedback
            </h2>
            <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 28px' }}>
              {biz.name} will see your message and do better next time. That's how good places get great.
            </p>
            <a href="/" style={{ fontSize: 14, color: C.lakeBlue, textDecoration: 'none' }}>← Back to The Dispatch</a>
          </div>
        )}

      </div>

      <div style={{ textAlign: 'center', padding: '20px', borderTop: `1px solid ${C.sand}` }}>
        <div style={{ fontSize: 11, color: C.textMuted }}>The Manitou Dispatch · Manitou Beach, Michigan</div>
      </div>
    </div>
  );
}

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

function USA250Page() {
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

function YetiAdminPage() {
  // ── Auth ──────────────────────────────────────────────────────
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('yeti_admin_token'));
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('yeti_admin_token') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Tabs ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('write'); // write | review | dashboard

  // ── Write tab ─────────────────────────────────────────────────
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Lake Life');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [applyStatus, setApplyStatus] = useState('idle'); // idle | applying | applied | error
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | done | error
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDims, setPhotoDims] = useState(null); // { w, h }

  // ── Review tab ────────────────────────────────────────────────
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [swapStatus, setSwapStatus] = useState({});

  // ── Preview modal ──────────────────────────────────────────────
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('preview'); // preview | edit
  const [editFields, setEditFields] = useState({ title: '', excerpt: '', editorNote: '' });
  const [saveStatus, setSaveStatus] = useState('idle');
  const [unpublishingId, setUnpublishingId] = useState(null);

  // ── Dashboard ──────────────────────────────────────────────────
  const [dashLoading, setDashLoading] = useState(false);
  const [dashData, setDashData] = useState(null);

  // ── Ad Slot Monitor ────────────────────────────────────────────
  const [adSlots, setAdSlots] = useState(null);
  const [adSlotsLoading, setAdSlotsLoading] = useState(false);

  // ── Batch geocoding ────────────────────────────────────────────
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | running | done | error
  const [geoResult, setGeoResult] = useState(null);

  const runBatchGeocode = async () => {
    setGeoStatus('running');
    setGeoResult(null);
    try {
      const r = await adminFetch('/api/geocode-batch', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Unknown error');
      setGeoResult(d);
      setGeoStatus('done');
    } catch (err) {
      setGeoResult({ error: err.message });
      setGeoStatus('error');
    }
  };

  const fetchAdSlots = async () => {
    setAdSlotsLoading(true);
    try {
      const res = await fetch('/api/businesses?slots=true');
      const d = await res.json();
      setAdSlots(d);
    } catch { setAdSlots(null); }
    finally { setAdSlotsLoading(false); }
  };

  // ── Promos ─────────────────────────────────────────────────────
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // ── Community POIs ─────────────────────────────────────────────
  const [adminPois, setAdminPois] = useState(null);
  const [adminPoisLoading, setAdminPoisLoading] = useState(false);

  // ── Winery Ratings curation ────────────────────────────────────
  const [adminRatings, setAdminRatings] = useState(null);
  const [adminRatingsLoading, setAdminRatingsLoading] = useState(false);
  const [ratingsUpdating, setRatingsUpdating] = useState({});
  const [ratingsFilter, setRatingsFilter] = useState('Pending'); // Pending | Published | Flagged | all

  const fetchAdminPois = async () => {
    setAdminPoisLoading(true);
    try {
      const res = await fetch('/api/community-pois');
      const d = await res.json();
      setAdminPois(d.pois || []);
    } catch { setAdminPois([]); }
    finally { setAdminPoisLoading(false); }
  };

  const fetchAdminRatings = async () => {
    setAdminRatingsLoading(true);
    try {
      const res = await adminFetch('/api/winery-ratings-admin');
      const d = await res.json();
      setAdminRatings(d.ratings || []);
    } catch { setAdminRatings([]); }
    finally { setAdminRatingsLoading(false); }
  };

  const updateRatingStatus = async (id, status) => {
    setRatingsUpdating(prev => ({ ...prev, [id]: status }));
    try {
      await adminFetch('/api/winery-ratings-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setAdminRatings(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { /* silent */ }
    finally { setRatingsUpdating(prev => { const n = { ...prev }; delete n[id]; return n; }); }
  };

  // ── Publish abort timer (Gmail undo-send) ──────────────────────
  const [pendingPublish, setPendingPublish] = useState(null); // { id, countdown, source }
  const publishIntervalRef = useRef(null);

  // Helper: fetch with auth token
  const adminFetch = (url, options = {}) => fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), 'X-Admin-Token': authToken },
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginPassword.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin-articles', {
        headers: { 'X-Admin-Token': loginPassword.trim() },
      });
      if (res.status === 401) { setLoginError('Wrong password — try again.'); setLoginLoading(false); return; }
      sessionStorage.setItem('yeti_admin_token', loginPassword.trim());
      setAuthToken(loginPassword.trim());
      setAuthed(true);
    } catch { setLoginError('Connection error — try again.'); }
    finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('yeti_admin_token');
    setAuthed(false); setAuthToken(''); setLoginPassword('');
  };

  const fetchDrafts = async () => {
    setDraftsLoading(true);
    try {
      const res = await adminFetch('/api/admin-articles');
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setDrafts(data.articles || []);
    } catch (err) { console.error('Failed to load drafts:', err); }
    finally { setDraftsLoading(false); }
  };

  const fetchDashboard = async () => {
    setDashLoading(true);
    try {
      const [subRes, artRes] = await Promise.all([
        fetch('/api/subscribe'),
        adminFetch('/api/admin-articles'),
      ]);
      const subData = await subRes.json();
      const artData = await artRes.json();
      const articles = artData.articles || [];
      const published = articles.filter(a => a.blogSafe);
      const draftsArr = articles.filter(a => !a.blogSafe);
      const lastPub = [...published].sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''))[0];
      setDashData({ subCount: subData.count || 0, published: published.length, drafts: draftsArr.length, lastPublished: lastPub || null });
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setDashLoading(false); }
  };

  const fetchPromos = async () => {
    setPromosLoading(true);
    try {
      const res = await adminFetch('/api/dispatch-ads?admin=true');
      const data = await res.json();
      setPromos(data.promos || []);
    } catch (err) { console.error('Promos fetch error:', err); }
    finally { setPromosLoading(false); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openPreview = async (article) => {
    setPreviewArticle({ ...article, content: null });
    setPreviewTab('preview');
    setEditFields({ title: article.title, excerpt: article.excerpt || '', editorNote: '' });
    setSaveStatus('idle');
    setPreviewLoading(true);
    try {
      const res = await adminFetch(`/api/admin-articles?id=${article.id}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewArticle(data.article);
        setEditFields({ title: data.article.title, excerpt: data.article.excerpt || '', editorNote: data.article.editorNote || '' });
      }
    } catch (err) { console.error('Preview fetch error:', err); }
    finally { setPreviewLoading(false); }
  };

  const handleSaveEdit = async () => {
    if (!previewArticle) return;
    setSaveStatus('saving');
    try {
      const res = await adminFetch('/api/admin-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', notionId: previewArticle.id, ...editFields }),
      });
      if (!res.ok) throw new Error('Save failed');
      setPreviewArticle(prev => ({ ...prev, ...editFields }));
      setDrafts(prev => prev.map(a => a.id === previewArticle.id ? { ...a, title: editFields.title, excerpt: editFields.excerpt } : a));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch { setSaveStatus('error'); }
  };

  const executePublish = async (notionId, source) => {
    setPublishingId(notionId);
    try {
      const res = await adminFetch('/api/admin-articles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId }),
      });
      if (source === 'card' && res.status === 401) { handleLogout(); return; }
      if (!res.ok) throw new Error('Publish failed');
      setDrafts(prev => prev.map(a => a.id === notionId ? { ...a, blogSafe: true, status: 'Published' } : a));
      if (source === 'modal') setPreviewArticle(prev => prev ? { ...prev, blogSafe: true, status: 'Published' } : null);
    } catch (err) { console.error(err); }
    finally { setPublishingId(null); }
  };

  const startPublishCountdown = (notionId, source) => {
    if (publishIntervalRef.current) clearInterval(publishIntervalRef.current);
    let count = 5;
    setPendingPublish({ id: notionId, countdown: count, source });
    publishIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(publishIntervalRef.current);
        publishIntervalRef.current = null;
        setPendingPublish(null);
        executePublish(notionId, source);
      } else {
        setPendingPublish(prev => prev ? { ...prev, countdown: count } : null);
      }
    }, 1000);
  };

  const cancelPublish = () => {
    if (publishIntervalRef.current) { clearInterval(publishIntervalRef.current); publishIntervalRef.current = null; }
    setPendingPublish(null);
  };

  const handlePublishFromModal = () => {
    if (!previewArticle) return;
    startPublishCountdown(previewArticle.id, 'modal');
  };

  const handleUnpublish = async () => {
    if (!previewArticle) return;
    setUnpublishingId(previewArticle.id);
    try {
      const res = await adminFetch('/api/admin-articles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish', notionId: previewArticle.id }),
      });
      if (!res.ok) throw new Error('Unpublish failed');
      setPreviewArticle(prev => ({ ...prev, blogSafe: false, status: 'Draft' }));
      setDrafts(prev => prev.map(a => a.id === previewArticle.id ? { ...a, blogSafe: false, status: 'Draft' } : a));
    } catch (err) { console.error(err); }
    finally { setUnpublishingId(null); }
  };

  const handlePublish = (notionId) => {
    startPublishCountdown(notionId, 'card');
  };

  const handleSwapPhoto = async (articleId, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSwapStatus(prev => ({ ...prev, [articleId]: 'uploading' }));
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1];
          const uploadRes = await adminFetch('/api/upload-image', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'dispatch' }),
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
          const applyRes = await adminFetch('/api/upload-image', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'apply', notionId: articleId, url: uploadData.url }),
          });
          if (!applyRes.ok) throw new Error('Failed to apply to Notion');
          setDrafts(prev => prev.map(a => a.id === articleId ? { ...a, coverImage: uploadData.url } : a));
          setSwapStatus(prev => ({ ...prev, [articleId]: 'done' }));
          setTimeout(() => setSwapStatus(prev => ({ ...prev, [articleId]: 'idle' })), 3500);
        } catch (err) { console.error(err); setSwapStatus(prev => ({ ...prev, [articleId]: 'error' })); }
      };
      reader.readAsDataURL(file);
    } catch { setSwapStatus(prev => ({ ...prev, [articleId]: 'error' })); }
  };

  useEffect(() => {
    if (!authed) return;
    if (activeTab === 'review') fetchDrafts();
    if (activeTab === 'dashboard') { fetchDashboard(); fetchAdSlots(); }
    if (activeTab === 'promos') fetchPromos();
    if (activeTab === 'pois') fetchAdminPois();
    if (activeTab === 'ratings') fetchAdminRatings();
  }, [activeTab, authed]);

  // Preview file locally before uploading — no network call yet
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setPhotoPreview(src);
      setPendingFile(file);
      const img = new Image();
      img.onload = () => setPhotoDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const clearPhotoPreview = () => { setPendingFile(null); setPhotoPreview(null); setPhotoDims(null); };

  const handlePhotoUpload = async (file) => {
    if (!file || !result?.notionId) return;
    if (!file.type.startsWith('image/')) { setUploadStatus('error'); return; }
    setUploadStatus('uploading');
    setUploadedUrl(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const uploadRes = await adminFetch('/api/upload-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'dispatch' }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
        const applyRes = await adminFetch('/api/upload-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'apply', notionId: result.notionId, url: uploadData.url }),
        });
        if (!applyRes.ok) throw new Error('Failed to apply to Notion');
        setUploadedUrl(uploadData.url);
        setUploadStatus('done');
        clearPhotoPreview();
      };
      reader.readAsDataURL(file);
    } catch (err) { console.error(err); setUploadStatus('error'); }
  };

  const handleApplyImage = async () => {
    if (!result?.notionId || !result?.coverImage) return;
    setApplyStatus('applying');
    try {
      const res = await adminFetch('/api/upload-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', notionId: result.notionId, filename: result.coverImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setApplyStatus('applied');
    } catch { setApplyStatus('error'); }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('loading'); setResult(null); setErrorMsg('');
    try {
      const res = await adminFetch('/api/generate-article', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), category, notes: notes.trim() }),
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResult(data); setStatus('success');
    } catch (err) { setErrorMsg(err.message); setStatus('error'); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${C.sand}`, background: '#fff',
    fontSize: 15, color: C.text, fontFamily: 'Libre Franklin, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: C.dusk, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' };

  // ── LOGIN SCREEN ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: C.night, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
          <img src="/images/yeti/yeti-front-profile.png" alt="" onError={e => { e.target.style.display = 'none'; }} style={{ width: 96, height: 96, objectFit: 'contain', marginBottom: 20 }} />
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.sage, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>The Manitou Dispatch</div>
          <h1 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 28, color: C.cream, margin: '0 0 32px' }}>The Yeti Desk</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '13px 18px', borderRadius: 8, boxSizing: 'border-box', marginBottom: 12,
                border: loginError ? '1.5px solid #ff6b6b' : '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.07)', color: C.cream,
                fontSize: 16, fontFamily: 'Libre Franklin, sans-serif', outline: 'none',
              }}
            />
            {loginError && <p style={{ color: '#ff9f9f', fontSize: 13, marginBottom: 12, textAlign: 'left' }}>{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading || !loginPassword.trim()}
              style={{
                width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                background: loginLoading ? C.driftwood : C.lakeBlue,
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Libre Franklin, sans-serif',
              }}
            >{loginLoading ? 'Checking…' : 'Enter The Desk →'}</button>
          </form>
        </div>
      </div>
    );
  }

  // ── ADMIN UI ──────────────────────────────────────────────────
  return (
    <>
    {/* Preview / Edit Modal */}
    {previewArticle && (
      <div
        onClick={() => { cancelPublish(); setPreviewArticle(null); }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,24,0.82)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: C.cream, borderRadius: 16, width: '100%', maxWidth: 780, marginTop: 16, marginBottom: 40, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}
        >
          {/* Modal header */}
          <div style={{ background: C.dusk, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'Libre Franklin, sans-serif' }}>{previewArticle.category}</div>
              <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 16, color: C.cream, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewArticle.title}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 12px', borderRadius: 20, background: previewArticle.blogSafe ? C.sage : 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {previewArticle.blogSafe ? 'Live' : 'Draft'}
              </span>
              <button onClick={() => { cancelPublish(); setPreviewArticle(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 20, lineHeight: 1, fontFamily: 'Libre Franklin, sans-serif' }}>×</button>
            </div>
          </div>

          {/* Modal tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.sand}`, background: '#fff' }}>
            {[{ id: 'preview', label: '👁  Preview' }, { id: 'edit', label: '✏️  Edit' }].map(t => (
              <button key={t.id} onClick={() => setPreviewTab(t.id)} style={{ padding: '12px 24px', fontFamily: 'Libre Franklin, sans-serif', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: previewTab === t.id ? C.cream : '#fff', color: previewTab === t.id ? C.dusk : C.textLight, borderBottom: previewTab === t.id ? `2px solid ${C.lakeBlue}` : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Modal body */}
          <div style={{ padding: '28px 32px', maxHeight: '55vh', overflowY: 'auto' }}>
            {previewLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: C.sage, fontSize: 14 }}>Loading…</div>
            ) : previewTab === 'preview' ? (
              <div>
                {previewArticle.coverImage && <img src={previewArticle.coverImage} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 20, display: 'block' }} />}
                {previewArticle.excerpt && <p style={{ fontSize: 16, fontStyle: 'italic', color: '#5a5a5a', borderLeft: `4px solid ${C.lakeBlue}`, paddingLeft: 16, marginBottom: 24, lineHeight: 1.6 }}>{previewArticle.excerpt}</p>}
                {previewArticle.content
                  ? <DispatchArticleContent content={previewArticle.content} />
                  : <p style={{ color: C.textMuted, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Fetching article content…</p>
                }
                {previewArticle.editorNote && (
                  <div style={{ marginTop: 28, padding: '16px 20px', background: C.warmWhite, borderRadius: 10, borderLeft: `3px solid ${C.sage}` }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.sage, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>Editor's Note</div>
                    <p style={{ margin: 0, fontSize: 14, color: C.textLight, lineHeight: 1.6, fontStyle: 'italic' }}>{previewArticle.editorNote}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input style={inputStyle} value={editFields.title} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Excerpt</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={editFields.excerpt} onChange={e => setEditFields(f => ({ ...f, excerpt: e.target.value }))} placeholder="One-sentence teaser (max 160 chars)" />
                </div>
                <div>
                  <label style={labelStyle}>Editor's Note</label>
                  <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={editFields.editorNote} onChange={e => setEditFields(f => ({ ...f, editorNote: e.target.value }))} placeholder="Personal aside from The Yeti…" />
                </div>
                <button
                  onClick={handleSaveEdit}
                  disabled={saveStatus === 'saving' || !editFields.title?.trim()}
                  style={{ alignSelf: 'flex-start', padding: '11px 24px', background: saveStatus === 'saved' ? C.sage : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: (saveStatus === 'saving' || !editFields.title?.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif', opacity: !editFields.title?.trim() ? 0.5 : 1 }}
                >
                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Save failed — retry' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Modal footer actions */}
          <div style={{ padding: '14px 32px', borderTop: `1px solid ${C.sand}`, background: '#fff', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {!previewArticle.blogSafe ? (
              <button
                onClick={handlePublishFromModal}
                disabled={publishingId === previewArticle.id}
                style={{ background: publishingId === previewArticle.id ? C.driftwood : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: publishingId === previewArticle.id ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
              >{publishingId === previewArticle.id ? 'Publishing…' : '⚡ Publish Live'}</button>
            ) : (
              <>
                <button
                  onClick={handleUnpublish}
                  disabled={unpublishingId === previewArticle.id}
                  style={{ background: 'transparent', color: C.sunset, border: `1px solid ${C.sunset}`, borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                >{unpublishingId === previewArticle.id ? 'Unpublishing…' : 'Unpublish'}</button>
                <a href={`/dispatch/${previewArticle.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.sage, fontWeight: 600, textDecoration: 'none' }}>View Live ↗</a>
              </>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <a href={`https://notion.so/${previewArticle.id?.replace(/-/g, '')}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.textMuted, textDecoration: 'none' }}>Notion ↗</a>
            </div>
          </div>
        </div>
      </div>
    )}

    <div style={{ minHeight: '100vh', background: C.cream, padding: '60px 20px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sage, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>The Manitou Dispatch</div>
            <h1 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 32, color: C.dusk, margin: 0 }}>The Yeti Desk</h1>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '6px 14px', fontSize: 12, color: C.textMuted, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>Sign out</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {[{ id: 'write', label: '✍️  Write' }, { id: 'review', label: '📋  Review Queue' }, { id: 'dashboard', label: '📊  Dashboard' }, { id: 'advertisers', label: '🤝  Advertisers' }, { id: 'promos', label: '🎟️  Promos' }, { id: 'pois', label: '📍  Community POIs' }, { id: 'ratings', label: '🍷  Winery Ratings' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                fontFamily: 'Libre Franklin, sans-serif', cursor: 'pointer',
                border: activeTab === tab.id ? 'none' : `1px solid ${C.sand}`,
                background: activeTab === tab.id ? C.dusk : '#fff',
                color: activeTab === tab.id ? '#fff' : C.textLight,
                transition: 'all 0.15s',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div>
            {dashLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>Loading metrics…</div>
            ) : dashData ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: 'Subscribers', value: dashData.subCount.toLocaleString(), icon: '📬', color: C.lakeBlue },
                    { label: 'Published', value: dashData.published, icon: '✅', color: C.sage },
                    { label: 'In Draft', value: dashData.drafts, icon: '✏️', color: C.sunset },
                    { label: 'Last Published', value: dashData.lastPublished?.publishedDate || '—', icon: '🗓', color: C.dusk, small: true },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${stat.color}` }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: stat.small ? 15 : 26, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                {dashData.lastPublished && (
                  <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.sage, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>Most Recent Article</div>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 16, color: C.dusk, fontWeight: 700, marginBottom: 4 }}>{dashData.lastPublished.title}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>{dashData.lastPublished.publishedDate} · {dashData.lastPublished.category}</div>
                    <a href={`/dispatch/${dashData.lastPublished.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.lakeBlue, textDecoration: 'none', display: 'inline-block', marginTop: 8, fontFamily: 'Libre Franklin, sans-serif' }}>View live →</a>
                  </div>
                )}
                <div style={{ background: C.warmWhite, borderRadius: 12, padding: '20px 24px', border: `1px solid ${C.sand}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.dusk, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>Open & Click Rates</div>
                  <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: '0 0 12px', fontFamily: 'Libre Franklin, sans-serif' }}>
                    Per-send analytics (open rates, click rates) are available in beehiiv's paid plans. Your current plan shows subscriber count and growth.
                  </p>
                  <a href="https://app.beehiiv.com" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.lakeBlue, fontWeight: 600, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif' }}>Open beehiiv Dashboard →</a>
                </div>
                <button onClick={fetchDashboard} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 18px', fontSize: 13, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻ Refresh</button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Could not load metrics.</div>
            )}

            {/* ── Batch Geocoding Tool ── */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, marginBottom: 4, fontFamily: 'Libre Franklin, sans-serif' }}>📍 Geocode Businesses</div>
              <p style={{ fontSize: 13, color: C.textLight, margin: '0 0 14px', lineHeight: 1.5, fontFamily: 'Libre Franklin, sans-serif' }}>
                Scans all Notion business entries with an address but no lat/lng, and auto-fills their coordinates. Safe to re-run — already-geocoded entries are skipped.
              </p>
              <button
                onClick={runBatchGeocode}
                disabled={geoStatus === 'running'}
                style={{ background: geoStatus === 'running' ? C.sand : C.dusk, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: geoStatus === 'running' ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif', transition: 'background 0.15s' }}
              >
                {geoStatus === 'running' ? '⏳ Geocoding… (1 req/sec)' : '▶ Run Geocoder'}
              </button>
              {geoResult && geoStatus === 'done' && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, color: C.sage, fontWeight: 700, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>
                    ✅ Done — {geoResult.updated} updated · {geoResult.skipped} skipped · {geoResult.failed} failed
                  </div>
                  {geoResult.details?.length > 0 && (
                    <div style={{ maxHeight: 200, overflowY: 'auto', background: C.cream, borderRadius: 8, padding: '10px 14px' }}>
                      {geoResult.details.map((d, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', padding: '3px 0', borderBottom: `1px solid ${C.sand}` }}>
                          <strong>{d.name}</strong> — {d.result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {geoStatus === 'error' && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#c05a5a', fontFamily: 'Libre Franklin, sans-serif' }}>Error: {geoResult?.error}</div>
              )}
            </div>

            {/* ── USA250 Page Status ── */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20, borderLeft: `4px solid ${USA250_PUBLIC ? C.sage : C250.gold}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif' }}>🇺🇸 USA250 Page</div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: USA250_PUBLIC ? '#d1fae5' : '#fef3c7', color: USA250_PUBLIC ? '#065f46' : '#92400e', fontFamily: 'Libre Franklin, sans-serif' }}>
                  {USA250_PUBLIC ? 'LIVE' : 'DRAFT — not public'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: C.textLight, margin: '0 0 14px', lineHeight: 1.6, fontFamily: 'Libre Franklin, sans-serif' }}>
                {USA250_PUBLIC
                  ? 'Page is live and linked in Community nav.'
                  : 'Page is hidden. Share the preview link with organizers before publishing. To go live: set USA250_PUBLIC = true in App.jsx and deploy.'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { navigator.clipboard.writeText('https://manitoubeach.com/usa250?preview=true'); }}
                  style={{ background: C.dusk, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                >
                  📋 Copy Preview URL
                </button>
                <a href="/usa250?preview=true" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: C.dusk, border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif' }}>
                  Open Preview ↗
                </a>
              </div>
            </div>

            {/* ── Ad Slot Monitor ── */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif' }}>
                  Ad Slot Monitor
                </div>
                <button onClick={fetchAdSlots} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '5px 12px', fontSize: 12, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻</button>
              </div>
              <p style={{ fontSize: 12, color: C.textLight, margin: '0 0 16px', lineHeight: 1.5, fontFamily: 'Libre Franklin, sans-serif' }}>
                Max 3 paid spots per category (Enhanced + Featured + Premium combined). Red = full, waitlist only.
              </p>
              {adSlotsLoading ? (
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Loading…</div>
              ) : adSlots && Object.keys(adSlots.categoryCounts || {}).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(adSlots.categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const max = adSlots.maxSlots || 3;
                      const pct = count / max;
                      const barColor = pct >= 1 ? '#c05a5a' : pct >= 0.67 ? C.driftwood : C.sage;
                      const label = pct >= 1 ? 'FULL' : `${count}/${max}`;
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 130, fontSize: 12, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif', fontWeight: 500, flexShrink: 0 }}>{cat}</div>
                          <div style={{ flex: 1, background: C.sand, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, pct * 100)}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
                          </div>
                          <div style={{ width: 48, fontSize: 11, color: pct >= 1 ? '#c05a5a' : C.textMuted, fontFamily: 'Libre Franklin, sans-serif', textAlign: 'right', fontWeight: pct >= 1 ? 700 : 400 }}>
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.sand}`, display: 'flex', gap: 20 }}>
                    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                      Total paid slots used: <strong style={{ color: C.dusk }}>{Object.values(adSlots.categoryCounts).reduce((a, b) => a + b, 0)}</strong>
                    </span>
                    <span style={{ fontSize: 11, color: '#c05a5a', fontFamily: 'Libre Franklin, sans-serif' }}>
                      {Object.values(adSlots.categoryCounts).filter(c => c >= (adSlots.maxSlots || 3)).length} categories full
                    </span>
                  </div>
                </div>
              ) : !adSlotsLoading ? (
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  No paid listings yet — all categories open.
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ── REVIEW QUEUE TAB ── */}
        {activeTab === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ margin: 0, color: C.textLight, fontSize: 14, fontFamily: 'Libre Franklin, sans-serif' }}>Click any article to preview, edit, and publish.</p>
              <button onClick={fetchDrafts} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '7px 16px', fontSize: 13, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻ Refresh</button>
            </div>
            {draftsLoading && <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>Loading articles…</div>}
            {!draftsLoading && drafts.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>No articles found.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {drafts.map(article => {
                const isPublished = article.blogSafe;
                const isPublishing = publishingId === article.id;
                return (
                  <div
                    key={article.id}
                    onClick={() => openPreview(article)}
                    style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${isPublished ? C.sage : C.sand}`, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 10px', borderRadius: 20, background: isPublished ? C.sage : C.driftwood, color: '#fff' }}>
                            {isPublished ? 'Live' : 'Draft'}
                          </span>
                          {article.aiGenerated && <span style={{ fontSize: 11, color: C.textMuted, background: C.cream, padding: '2px 8px', borderRadius: 20, fontFamily: 'Libre Franklin, sans-serif' }}>AI</span>}
                          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>{article.category}</span>
                          {article.publishedDate && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>{article.publishedDate}</span>}
                        </div>
                        <h3 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 16, color: C.dusk, margin: '0 0 4px', lineHeight: 1.3 }}>{article.title}</h3>
                        {article.excerpt && <p style={{ margin: 0, fontSize: 12, color: C.textLight, lineHeight: 1.5, fontFamily: 'Libre Franklin, sans-serif' }}>{article.excerpt.length > 100 ? article.excerpt.slice(0, 100) + '…' : article.excerpt}</p>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                        {article.coverImage && <img src={article.coverImage} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                        {!isPublished ? (
                          <button
                            onClick={e => { e.stopPropagation(); handlePublish(article.id); }}
                            disabled={isPublishing}
                            style={{ background: isPublishing ? C.driftwood : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: isPublishing ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                          >{isPublishing ? '…' : '⚡ Publish'}</button>
                        ) : (
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif' }}>✓ Live</span>
                        )}
                      </div>
                    </div>
                    {/* Photo strip */}
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.sand}` }} onClick={e => e.stopPropagation()}>
                      <input id={`swap-input-${article.id}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleSwapPhoto(article.id, e.target.files[0])} />
                      {swapStatus[article.id] === 'done' && article.coverImage ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={article.coverImage} alt="cover" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 5, flexShrink: 0, border: `2px solid ${C.sage}40` }} />
                          <div>
                            <div style={{ fontSize: 12, color: C.sage, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif' }}>✓ Photo updated</div>
                            <button onClick={e => { e.stopPropagation(); document.getElementById(`swap-input-${article.id}`).click(); }} style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 11, color: C.textMuted, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', textDecoration: 'underline' }}>swap again</button>
                          </div>
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>tap card to preview & edit</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {swapStatus[article.id] === 'uploading' ? (
                            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Uploading…</span>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); document.getElementById(`swap-input-${article.id}`).click(); }} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '4px 12px', fontSize: 11, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>
                              {article.coverImage ? '📷 Swap Photo' : '📷 Add Photo'}
                            </button>
                          )}
                          {swapStatus[article.id] === 'error' && <span style={{ fontSize: 12, color: C.sunset, fontFamily: 'Libre Franklin, sans-serif' }}>Upload failed</span>}
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>tap to preview & edit</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ADVERTISERS TAB ── */}
        {activeTab === 'advertisers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Card Sponsors */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.dusk, marginBottom: 4 }}>Card Sponsors</div>
              <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 20 }}>Showing on every Dispatch card — homepage + /dispatch listing</div>

              {DISPATCH_CARD_SPONSORS.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 20px', background: C.warmWhite, borderRadius: 10 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                  <div style={{ fontFamily: 'Libre Franklin, sans-serif', fontSize: 14, color: C.textMuted }}>No card sponsors active. Add one to DISPATCH_CARD_SPONSORS in App.jsx</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {DISPATCH_CARD_SPONSORS.map((sponsor, i) => (
                    <div key={i} style={{ border: `1px solid ${C.sand}`, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        {sponsor.logo ? (
                          <img src={sponsor.logo} alt={sponsor.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'contain', border: `1px solid ${C.sand}`, background: '#fff', padding: 4, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 52, height: 52, borderRadius: 8, border: '1.5px dashed #c4b09a', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf5ef', flexShrink: 0 }}>
                            <span style={{ fontSize: 22 }}>📷</span>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Libre Franklin, sans-serif', fontWeight: 700, fontSize: 15, color: C.dusk, marginBottom: 3 }}>{sponsor.name}</div>
                          {sponsor.offerText && <div style={{ fontSize: 13, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 4 }}>{sponsor.offerText}</div>}
                          <div style={{ fontSize: 11, color: sponsor.logo ? C.sage : C.sunset, fontFamily: 'monospace', fontWeight: 600 }}>
                            {sponsor.logo ? `logo: ${sponsor.logo}` : 'logo: null — drop a PNG into /public/images/ and set the path'}
                          </div>
                        </div>
                        <span style={{ background: `${C.sage}20`, color: C.sage, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'Libre Franklin, sans-serif', letterSpacing: 0.5, flexShrink: 0 }}>Slot {i + 1}</span>
                      </div>
                      <div style={{ borderTop: `1px solid ${C.sand}`, background: C.warmWhite }}>
                        <div style={{ padding: '8px 16px 2px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Live preview</div>
                        <SponsorStrip index={i} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 20, padding: '14px 16px', background: `${C.lakeBlue}08`, borderRadius: 8, border: `1px dashed ${C.lakeBlue}40` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>To add or update sponsors</div>
                <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'monospace', lineHeight: 1.8 }}>
                  Search App.jsx for <strong style={{ color: C.dusk }}>DISPATCH_CARD_SPONSORS</strong><br />
                  Add: {'{ name: "Business Name", logo: "/images/file.png", offerText: "Your offer" }'}<br />
                  Set logo: null to show a 📷 placeholder until the file lands
                </div>
              </div>
            </div>

            {/* Newsletter Ad SOP */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.dusk, marginBottom: 4 }}>Newsletter Ad Rules</div>
              <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 20 }}>SOP — follow every issue, no exceptions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                {[
                  { icon: '2️⃣', label: 'Max ads per issue', value: '2 total — never more' },
                  { icon: '⭐', label: 'Primary sponsor slot', value: 'Mid-newsletter, after main article' },
                  { icon: '🏠', label: 'House ad slot', value: 'Footer — promote /featured or events' },
                  { icon: '📅', label: 'Best send time', value: 'Tue or Thu · 8–9am EST' },
                  { icon: '📝', label: 'Contract minimum', value: '30 days (1 issue cycle)' },
                  { icon: '💎', label: 'Sweet spot contract', value: '3 months — better results' },
                  { icon: '🔄', label: 'Renewal window', value: 'Contact 1 week before expiry' },
                  { icon: '🎯', label: 'Conflict resolution', value: '2 advertisers want offer slot → one gets next issue' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '14px 16px', background: C.warmWhite, borderRadius: 8 }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 3, fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif', fontWeight: 600, lineHeight: 1.4 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Layout Template */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.dusk, marginBottom: 4 }}>Newsletter Layout Template</div>
              <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 20 }}>Replicate this structure in beehiiv every issue</div>
              <div style={{ border: `1px solid ${C.sand}`, borderRadius: 10, overflow: 'hidden' }}>
                {[
                  { section: '🌊 THIS WEEKEND ON THE LAKE', desc: '2–3 bullet events Fri–Sun. Pull from your Notion events DB or notes.', accent: C.lakeBlue },
                  { section: '📰 FROM THE DESK', desc: 'The Yeti\'s main piece — 250–350 words. AI-generated + edited by you. One story, told well.', accent: C.sage },
                  { section: '🏘️ COMMUNITY CORNER', desc: '1–2 items: local biz spotlight, historical fact, neighbor news. You write 2–3 sentences.', accent: C.sunset },
                  { section: '━━ SPONSORED BY [Business] ━━', desc: 'Logo + offer text + claim link. ONE sponsor max. Clear, honest, not pushy.', accent: '#b8860b', isAd: true },
                  { section: '📅 UPCOMING EVENTS', desc: '3–5 events. Date · Time · Location. Pull from events DB. No editorializing needed.', accent: C.lakeBlue },
                  { section: '📸 AROUND THE LAKE', desc: '1 reader-submitted photo + caption. Or: "Send us your best lake shot →"', accent: C.sage },
                  { section: '💼 SUPPORT THE DISPATCH', desc: 'Soft pitch: "[X] subscribers and growing" + link to /featured for business listings.', accent: C.dusk, isAd: true },
                ].map((row, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'stretch', borderBottom: i < arr.length - 1 ? `1px solid ${C.sand}` : 'none', background: row.isAd ? '#fffbf0' : '#fff' }}>
                    <div style={{ width: 4, background: row.accent, flexShrink: 0 }} />
                    <div style={{ padding: '13px 18px', flex: 1 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: row.isAd ? '#b8860b' : C.dusk, marginBottom: 3 }}>{row.section}</div>
                      <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', lineHeight: 1.5 }}>{row.desc}</div>
                    </div>
                    {row.isAd && <div style={{ padding: '13px 14px 13px 0', display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 10, fontWeight: 700, color: '#b8860b', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif', border: '1px solid #b8860b40', borderRadius: 4, padding: '2px 6px' }}>AD</span></div>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── PROMOS TAB ── */}
        {activeTab === 'promos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 4 }}>Promotions</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Manage ad slots and generate newsletter promo blocks</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={fetchPromos} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 16px', fontSize: 13, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻ Refresh</button>
                <a href="https://www.notion.so/3158c729eb59810f8a48d27b6c6a8d31" target="_blank" rel="noreferrer" style={{ background: C.dusk, color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif' }}>+ Add in Notion</a>
              </div>
            </div>

            {promosLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.sage, fontFamily: 'Libre Franklin, sans-serif' }}>Loading promos…</div>
            ) : promos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎟️</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.dusk, marginBottom: 8 }}>No promotions yet</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Add your first promotion in Notion — it'll appear here with copy-ready newsletter blocks.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {promos.map(promo => {
                  const claimUrl = promo.claimSlug ? `https://manitoubeach.com/claim/${promo.claimSlug}` : null;
                  const expiryStr = promo.expiry ? new Date(promo.expiry + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

                  // Newsletter block text — copy-paste ready for beehiiv
                  const newsletterBlock = [
                    `🎟️ READER EXCLUSIVE — ${promo.name}`,
                    promo.offerText || '',
                    promo.couponCode ? `Use code: ${promo.couponCode}` : '',
                    claimUrl ? `Claim here → ${claimUrl}` : promo.linkUrl ? `Learn more → ${promo.linkUrl}` : '',
                    expiryStr ? `Offer expires ${expiryStr}` : '',
                  ].filter(s => s && s.trim()).join('\n');

                  return (
                    <div key={promo.id} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderLeft: `4px solid ${promo.active ? C.sage : C.sand}` }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.dusk, marginBottom: 6 }}>{promo.name}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: promo.active ? `${C.sage}20` : `${C.sand}40`, color: promo.active ? C.sage : '#999', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'Libre Franklin, sans-serif' }}>
                              {promo.active ? '● Active' : '○ Inactive'}
                            </span>
                            <span style={{ background: `${C.lakeBlue}15`, color: C.lakeBlue, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif' }}>{promo.slot}</span>
                            <span style={{ background: `${C.dusk}10`, color: C.dusk, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontFamily: 'Libre Franklin, sans-serif' }}>{promo.tier}</span>
                          </div>
                        </div>
                        <a href={promo.notionUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.textMuted, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '4px 10px' }}>Edit in Notion →</a>
                      </div>

                      {/* Offer details */}
                      {promo.offerText && (
                        <div style={{ fontSize: 14, color: C.text, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>{promo.offerText}</div>
                      )}
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                        {promo.couponCode && <span>Code: <strong style={{ color: C.sunset }}>{promo.couponCode}</strong></span>}
                        {expiryStr && <span>Expires: {expiryStr}</span>}
                      </div>

                      {/* Claim URL */}
                      {claimUrl && (
                        <div style={{ background: C.warmWhite, borderRadius: 8, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', flexShrink: 0 }}>Claim URL</span>
                          <span style={{ fontSize: 13, color: C.lakeBlue, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>{claimUrl}</span>
                          <button
                            onClick={() => copyToClipboard(claimUrl, `url-${promo.id}`)}
                            style={{ background: copiedId === `url-${promo.id}` ? C.sage : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', flexShrink: 0 }}
                          >
                            {copiedId === `url-${promo.id}` ? '✓ Copied' : 'Copy URL'}
                          </button>
                        </div>
                      )}

                      {/* Newsletter block */}
                      <div style={{ background: `${C.night}08`, borderRadius: 8, padding: '12px 14px', border: `1px dashed ${C.sand}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Newsletter block — paste into beehiiv</span>
                          <button
                            onClick={() => copyToClipboard(newsletterBlock, `nl-${promo.id}`)}
                            style={{ background: copiedId === `nl-${promo.id}` ? C.sage : C.sunset, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                          >
                            {copiedId === `nl-${promo.id}` ? '✓ Copied!' : 'Copy Block'}
                          </button>
                        </div>
                        <pre style={{ margin: 0, fontSize: 12, color: C.text, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{newsletterBlock}</pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COMMUNITY POIs TAB ── */}
        {activeTab === 'pois' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 4 }}>Community POIs</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  Notion-managed visitor info pins on /discover — hospitals, schools, launches, wineries, etc.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://www.notion.so/31c8c729eb5981baac48f12f50366ef1" target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', textDecoration: 'none', padding: '8px 16px', border: `1px solid ${C.lakeBlue}`, borderRadius: 8 }}>
                  Open in Notion →
                </a>
                <button onClick={fetchAdminPois} style={{ fontSize: 13, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>↻ Refresh</button>
              </div>
            </div>

            {adminPoisLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14, fontFamily: 'Libre Franklin, sans-serif' }}>Loading POIs…</div>
            ) : adminPois === null ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Click Refresh to load POIs.</div>
            ) : (
              <>
                {/* Summary by category */}
                {(() => {
                  const catCounts = {};
                  adminPois.forEach(p => { catCounts[p.cat] = (catCounts[p.cat] || 0) + 1; });
                  const cats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
                      <div style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `3px solid ${C.sage}`, gridColumn: '1' }}>
                        <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 26, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>{adminPois.length}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>Total Active</div>
                      </div>
                      {cats.map(([cat, count]) => {
                        const catObj = [
                          { id: 'food', label: 'Food', color: '#5B8A5B' }, { id: 'events', label: 'Events', color: '#D4845A' },
                          { id: 'stays', label: 'Stays', color: '#C25C5C' }, { id: 'wineries', label: 'Wineries', color: '#8B5E8B' },
                          { id: 'water', label: 'Water', color: '#5B7E95' }, { id: 'shopping', label: 'Shopping', color: '#B8A030' },
                          { id: 'services', label: 'Services', color: '#7A8E72' }, { id: 'healthcare', label: 'Healthcare', color: '#C2607A' },
                          { id: 'grocery', label: 'Grocery', color: '#8B6E4A' }, { id: 'schools', label: 'Schools', color: '#6B6B6B' },
                          { id: 'community', label: 'Community', color: '#7A8E72' },
                        ].find(c => c.id === cat) || { label: cat, color: C.textMuted };
                        return (
                          <div key={cat} style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `3px solid ${catObj.color}` }}>
                            <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>{count}</div>
                            <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>{catObj.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* POI list */}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ borderBottom: `1px solid ${C.sand}`, padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 90px 120px', gap: 12, background: C.warmWhite }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif' }}>Name</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif' }}>Category</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif' }}>Coords</div>
                  </div>
                  {adminPois.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', fontSize: 14 }}>
                      No Active POIs found. Check the Notion DB — set Status to Active to show pins.
                    </div>
                  ) : (
                    adminPois.map((poi, i) => (
                      <div key={poi.id} style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 90px 120px', gap: 12, alignItems: 'center', borderBottom: i < adminPois.length - 1 ? `1px solid ${C.sand}` : 'none', background: i % 2 === 0 ? '#fff' : '#fdfaf6' }}>
                        <div>
                          <div style={{ fontFamily: 'Libre Franklin, sans-serif', fontSize: 14, fontWeight: 600, color: C.dusk }}>{poi.name}</div>
                          {poi.sub && <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginTop: 1 }}>{poi.sub}</div>}
                        </div>
                        <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif' }}>{poi.cat}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'monospace' }}>{poi.lat?.toFixed(4)}, {poi.lng?.toFixed(4)}</div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: 16, padding: '12px 16px', background: `${C.lakeBlue}08`, borderRadius: 8, border: `1px dashed ${C.lakeBlue}40` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>How to add / edit POIs</div>
                  <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', lineHeight: 1.7 }}>
                    Open Notion → <strong>Manitou Beach - Community POIs</strong> DB → add or edit rows.<br />
                    Set <strong>Status → Active</strong> to show on map · <strong>Hidden</strong> to remove without deleting.<br />
                    Changes appear live on /discover within seconds (no-store cache).
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── RATINGS TAB ── */}
        {activeTab === 'ratings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 4 }}>Winery Ratings</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  Curate submitted reviews — approve to publish, flag to hide.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="https://www.notion.so/31c8c729eb598182-9d07e5901bc07f6e" target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, fontWeight: 600, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', textDecoration: 'none', padding: '7px 14px', border: `1px solid ${C.lakeBlue}`, borderRadius: 8 }}>
                  Open in Notion →
                </a>
                <button onClick={fetchAdminRatings} style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}>↻ Refresh</button>
              </div>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['Pending', 'Published', 'Flagged', 'all'].map(f => (
                <button key={f} onClick={() => setRatingsFilter(f)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Libre Franklin, sans-serif',
                  background: ratingsFilter === f ? C.dusk : '#fff',
                  color: ratingsFilter === f ? '#fff' : C.textLight,
                  border: ratingsFilter === f ? 'none' : `1px solid ${C.sand}`,
                }}>
                  {f === 'all' ? 'All' : f}
                  {adminRatings && f !== 'all' && (
                    <span style={{ marginLeft: 6, opacity: 0.7 }}>({adminRatings.filter(r => r.status === f).length})</span>
                  )}
                </button>
              ))}
            </div>

            {adminRatingsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14, fontFamily: 'Libre Franklin, sans-serif' }}>Loading ratings…</div>
            ) : adminRatings === null ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Click Refresh to load ratings.</div>
            ) : (() => {
              const filtered = ratingsFilter === 'all' ? adminRatings : adminRatings.filter(r => r.status === ratingsFilter);
              if (filtered.length === 0) return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', fontSize: 14 }}>
                  No {ratingsFilter === 'all' ? '' : ratingsFilter.toLowerCase()} ratings yet.
                </div>
              );
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {filtered.map(r => {
                    const stars = n => n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '—';
                    const statusColor = r.status === 'Published' ? C.sage : r.status === 'Flagged' ? '#c0392b' : C.driftwood;
                    const updating = ratingsUpdating[r.id];
                    return (
                      <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${statusColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, fontWeight: 700, color: C.dusk }}>{r.venue}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginTop: 2 }}>{r.date}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Libre Franklin, sans-serif' }}>{r.status}</span>
                          </div>
                        </div>

                        {/* Scores */}
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                          {[['Quality', r.rating], ['Service', r.service], ['Atmos.', r.atmosphere], ['Value', r.value]].map(([label, val]) => val && (
                            <div key={label} style={{ fontSize: 12, fontFamily: 'Libre Franklin, sans-serif' }}>
                              <span style={{ color: C.textMuted, fontWeight: 600 }}>{label}: </span>
                              <span style={{ color: C.sunset }}>{stars(val)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Wine tried */}
                        <div style={{ fontSize: 13, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', marginBottom: r.quote || r.note ? 8 : 0 }}>
                          <strong>Tried:</strong> {r.wineTried}
                        </div>

                        {/* Quote (shareable) */}
                        {r.quote && (
                          <div style={{ fontSize: 13, fontStyle: 'italic', color: C.text, fontFamily: "'Libre Baskerville', serif", borderLeft: `3px solid ${C.sunset}`, paddingLeft: 12, marginBottom: 8 }}>
                            "{r.quote}"
                          </div>
                        )}

                        {/* Private note */}
                        {r.note && (
                          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>Private note:</span> {r.note}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                          {r.status !== 'Published' && (
                            <button
                              onClick={() => updateRatingStatus(r.id, 'Published')}
                              disabled={!!updating}
                              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'Libre Franklin, sans-serif', cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1, background: C.sage, color: '#fff', border: 'none' }}
                            >{updating === 'Published' ? 'Publishing…' : '✓ Publish'}</button>
                          )}
                          {r.status !== 'Pending' && (
                            <button
                              onClick={() => updateRatingStatus(r.id, 'Pending')}
                              disabled={!!updating}
                              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif', cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1, background: 'transparent', color: C.textLight, border: `1px solid ${C.sand}` }}
                            >← Requeue</button>
                          )}
                          {r.status !== 'Flagged' && (
                            <button
                              onClick={() => updateRatingStatus(r.id, 'Flagged')}
                              disabled={!!updating}
                              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif', cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1, background: 'transparent', color: '#c0392b', border: '1px solid #e8c0bb' }}
                            >⚑ Flag</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── WRITE TAB ── */}
        {activeTab === 'write' && <>
        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', marginBottom: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Topic *</label>
            <input
              style={inputStyle}
              placeholder="e.g. Why Devils Lake is Michigan's best-kept secret"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Category</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {DISPATCH_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Notes / Angle (optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Any specific angle, local details, or tone notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !topic.trim()}
            style={{
              background: status === 'loading' ? C.driftwood : C.lakeBlue,
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 28px', fontSize: 15, fontWeight: 600,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              fontFamily: 'Libre Franklin, sans-serif',
              transition: 'background 0.2s',
              width: '100%',
            }}
          >
            {status === 'loading' ? '✍️  Yeti is writing...' : '⚡ Generate Article'}
          </button>
          {status === 'loading' && (
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
              The Yeti is writing… usually about 20 seconds ☕
            </p>
          )}
        </div>

        {/* Success */}
        {status === 'success' && result && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderLeft: `4px solid ${C.sage}` }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sage, marginBottom: 12 }}>Draft saved to Notion</div>
            <h2 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, color: C.dusk, margin: '0 0 8px' }}>{result.title}</h2>
            <p style={{ color: C.textLight, fontSize: 14, margin: '0 0 20px', fontStyle: 'italic' }}>{result.excerpt}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={result.notionUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: C.dusk, color: '#fff', borderRadius: 8,
                  padding: '10px 20px', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif',
                }}
              >
                Review in Notion →
              </a>
              <button
                onClick={() => setActiveTab('review')}
                style={{ background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
              >
                Go to Review Queue →
              </button>
              <button
                onClick={() => { setStatus('idle'); setTopic(''); setNotes(''); setResult(null); setApplyStatus('idle'); setUploadStatus('idle'); setUploadedUrl(null); }}
                style={{
                  background: 'transparent', color: C.textLight,
                  border: `1px solid ${C.sand}`, borderRadius: 8,
                  padding: '10px 20px', fontSize: 14, cursor: 'pointer',
                  fontFamily: 'Libre Franklin, sans-serif',
                }}
              >
                Write another
              </button>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: C.textMuted }}>
              slug: <code style={{ background: C.cream, padding: '2px 6px', borderRadius: 4 }}>{result.slug}</code>
            </div>

            {/* Unsplash auto-photo */}
            {result.unsplashPhoto && (
              <div style={{ marginTop: 14, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.sand}`, position: 'relative' }}>
                <img
                  src={result.unsplashPhoto.thumbUrl}
                  alt="Auto-selected cover"
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.55))', padding: '20px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>
                    <a href={result.unsplashPhoto.photographerUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                      {result.unsplashPhoto.credit}
                    </a>
                  </span>
                  <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, background: C.sage, padding: '2px 8px', borderRadius: 4 }}>✓ Applied to Notion</span>
                </div>
              </div>
            )}

            {result.coverImage && (
              <div style={{ marginTop: 12, padding: '14px 16px', background: C.warmWhite, borderRadius: 8, fontSize: 13, borderLeft: `3px solid ${result.coverImageApplied || applyStatus === 'applied' ? C.sage : C.lakeBlue}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: C.dusk }}>Cover image:</span>
                  <code style={{ color: C.lakeBlue, background: '#fff', padding: '2px 8px', borderRadius: 4 }}>{result.coverImage}</code>
                  {result.coverStyle && (
                    <span style={{ background: result.coverStyle === 'realism' ? C.dusk : C.sage, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {result.coverStyle}
                    </span>
                  )}
                  {(result.coverImageApplied || applyStatus === 'applied') && (
                    <span style={{ color: C.sage, fontWeight: 600, fontSize: 12 }}>✓ Applied to Notion</span>
                  )}
                </div>
                {result.coverNote && <p style={{ margin: '0 0 10px', color: C.textLight, fontStyle: 'italic', lineHeight: 1.5 }}>{result.coverNote}</p>}
                {!result.coverImageApplied && applyStatus !== 'applied' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ color: C.textMuted }}>Image not in folder yet — create it, drop it in <code>public/images/yeti/</code> and push, then:</span>
                    <button
                      onClick={handleApplyImage}
                      disabled={applyStatus === 'applying'}
                      style={{ background: applyStatus === 'applying' ? C.driftwood : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: applyStatus === 'applying' ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                    >
                      {applyStatus === 'applying' ? 'Applying…' : applyStatus === 'error' ? 'Try again' : 'Apply Image'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Own photo upload — preview-first flow */}
            {result.notionId && uploadStatus !== 'done' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, textAlign: 'center' }}>— or use your own photo —</div>

                {photoPreview ? (
                  /* ── Step 2: Preview + confirm ── */
                  <div>
                    {/* 16:9 crop preview */}
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000', marginBottom: 10 }}>
                      <img src={photoPreview} alt="preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, fontFamily: "'Libre Franklin', sans-serif" }}>
                        Cover preview
                      </div>
                    </div>

                    {/* Dimensions + warning */}
                    {photoDims && (() => {
                      const { w, h } = photoDims;
                      const isPortrait = h > w;
                      const isTooSmall = w < 800;
                      const isIdeal = w >= 1200 && (w / h) >= 1.55;
                      return (
                        <div style={{ marginBottom: 10, fontSize: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
                          <span style={{ color: C.textMuted }}>{w} × {h}px</span>
                          {isIdeal && <span style={{ color: C.sage, marginLeft: 8 }}>✓ Great size</span>}
                          {isPortrait && <span style={{ color: C.sunset, marginLeft: 8 }}>⚠️ Portrait — will be cropped to landscape. Rotate in Photos first for best results.</span>}
                          {!isPortrait && isTooSmall && <span style={{ color: C.driftwood, marginLeft: 8 }}>⚠️ Small — may look blurry at full width. Try 1200×630px or larger.</span>}
                        </div>
                      );
                    })()}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={() => handlePhotoUpload(pendingFile)}
                        disabled={uploadStatus === 'uploading'}
                        style={{ flex: 1, background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
                      >
                        {uploadStatus === 'uploading' ? 'Uploading…' : 'Use This Photo'}
                      </button>
                      <button
                        onClick={clearPhotoPreview}
                        style={{ background: 'transparent', border: `1px solid ${C.sand}`, color: C.textMuted, borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
                      >
                        Choose Different
                      </button>
                    </div>
                    {uploadStatus === 'error' && <p style={{ margin: '8px 0 0', color: C.sunset, fontSize: 12 }}>Upload failed — try again</p>}
                  </div>
                ) : (
                  /* ── Step 1: Drop zone ── */
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById('photo-upload-input').click()}
                    style={{
                      border: `2px dashed ${isDragging ? C.lakeBlue : C.sand}`,
                      borderRadius: 10, padding: '28px 16px', textAlign: 'center',
                      cursor: 'pointer', background: isDragging ? '#EEF4F8' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input id="photo-upload-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                    <p style={{ margin: '0 0 6px', fontSize: 14, color: C.dusk, fontWeight: 600 }}>
                      {isDragging ? 'Drop it!' : 'Drop a photo here'}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: C.textMuted }}>or click to browse</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.textMuted, opacity: 0.7 }}>Best at 1200×630px · landscape (16:9) · JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
            )}
            {uploadStatus === 'done' && uploadedUrl && (
              <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: `2px solid ${C.sage}40` }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                  <img src={uploadedUrl} alt="cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '10px 14px', background: C.warmWhite, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: C.sage, fontSize: 14 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 600, color: C.sage, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>Photo uploaded &amp; applied to Notion</div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Cover image is set and ready to publish</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderLeft: `4px solid ${C.sunset}` }}>
            <div style={{ color: C.sunset, fontWeight: 600, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ color: C.textLight, fontSize: 14 }}>{errorMsg}</div>
            <button
              onClick={() => setStatus('idle')}
              style={{ marginTop: 16, background: 'transparent', color: C.lakeBlue, border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
            >
              Try again
            </button>
          </div>
        )}
        </>}
      </div>
    </div>

    {/* ── Publish abort toast (Gmail undo-send) ── */}
    {pendingPublish && (
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: C.night, borderRadius: 12, padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 8px 36px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Libre Franklin, sans-serif', minWidth: 300, overflow: 'hidden' }}>
        <span style={{ color: C.warmWhite, fontSize: 14 }}>Publishing in {pendingPublish.countdown}s…</span>
        <button onClick={cancelPublish} style={{ marginLeft: 'auto', background: C.sunset, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', flexShrink: 0 }}>Undo</button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, background: C.lakeBlue, borderRadius: '0 0 0 12px', animation: 'shrinkWidth 5s linear forwards' }} />
      </div>
    )}
    </>
  );
}

// ============================================================
// 🎤  VOICE WIDGET — Vapi + ElevenLabs
// ============================================================
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const SITE_KNOWLEDGE = `
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

function VoiceWidget() {
  const [status, setStatus] = useState('idle'); // idle | connecting | active | ending
  const [panelOpen, setPanelOpen] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [links, setLinks] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const vapiRef = useRef(null);
  const liveDataRef = useRef({ events: '', businesses: '', weather: '' });

  useEffect(() => {
    if (!VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY === 'your-vapi-public-key-here') return;
    import('@vapi-ai/web').then(({ default: Vapi }) => {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);

      vapi.on('call-start', () => {
        setStatus('active');
        // Inject live data as system context immediately after call connects
        const { events, businesses, weather } = liveDataRef.current;
        setTimeout(() => {
          vapi.send({
            type: 'add-message',
            message: {
              role: 'system',
              content: `COMMUNITY KNOWLEDGE:\n${SITE_KNOWLEDGE}\n\nLIVE DATA (updated at call start):\n\nUPCOMING EVENTS:\n${events}\n\nLOCAL BUSINESSES:\n${businesses}\n\nWEATHER:\n${weather}\n\nUse the above to answer questions. If something isn't covered, say "I don't have that info right now — check manitou-beach.vercel.app for the latest."`,
            },
          });
        }, 300);
      });
      vapi.on('call-end', () => { setStatus('idle'); setIsSpeaking(false); });
      vapi.on('speech-start', () => setIsSpeaking(true));
      vapi.on('speech-end', () => setIsSpeaking(false));
      vapi.on('error', (err) => { console.error('Vapi error:', err); setStatus('idle'); });

      vapi.on('message', async (message) => {
        // Transcript — detect link intent from AI and auto-show button from known data
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setTranscript(prev => [...prev.slice(-8), { role: message.role, text: message.transcript }]);
          if (message.role === 'assistant') {
            const text = message.transcript.toLowerCase();
            const hasLinkIntent = ['popped that up', 'pulled that up', "here's the link", 'added that link', 'link for you', 'button for you', 'check it out at'].some(p => text.includes(p));
            if (hasLinkIntent) {
              const { rawEvents, rawBusinesses } = liveDataRef.current;
              // Find most relevant URL by matching recent transcript words against event/business names
              const recentText = text;
              const allItems = [
                ...rawEvents.map(e => ({ label: e.name, sublabel: e.date, url: e.eventUrl })),
                ...rawBusinesses.map(b => ({ label: b.name, sublabel: b.category, url: b.website })),
              ].filter(i => i.url);
              const match = allItems.find(i => i.label && recentText.includes(i.label.toLowerCase().split(' ').slice(0, 3).join(' ')));
              const item = match || allItems[0];
              if (item) {
                setLinks(prev => prev.some(l => l.url === item.url) ? prev : [...prev, { url: item.url, label: item.label || 'Open Link', sublabel: item.sublabel }]);
              }
            }
          }
        }
      });

      vapiRef.current = vapi;
    });
    return () => { vapiRef.current?.stop(); };
  }, []);

  const startCall = async () => {
    if (!vapiRef.current || !VAPI_ASSISTANT_ID || VAPI_ASSISTANT_ID === 'your-vapi-assistant-id-here') return;
    setStatus('connecting');
    setPanelOpen(true);
    setTranscript([]);
    setLinks([]);
    try {
      // Pre-fetch live data to inject into assistant context at call start
      const [eventsRes, bizRes, wxRes] = await Promise.allSettled([
        fetch('/api/events').then(r => r.json()),
        fetch('/api/businesses?all=true').then(r => r.json()),
        fetch('https://api.open-meteo.com/v1/forecast?latitude=41.96&longitude=-84.02&current=temperature_2m,wind_speed_10m,precipitation,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=America%2FDetroit&forecast_days=3&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch').then(r => r.json()),
      ]);

      // Format events
      let events = 'No upcoming events found.';
      if (eventsRes.status === 'fulfilled') {
        const list = (eventsRes.value.events || []).slice(0, 10);
        if (list.length) events = list.map(e =>
          `${e.name} — ${new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${e.location ? ', ' + e.location : ''}${e.cost ? ' (' + e.cost + ')' : ''}${e.eventUrl ? ' | ' + e.eventUrl : ''}`
        ).join('\n');
      }

      // Format businesses — API returns { free, enhanced, featured, premium }
      let businesses = 'No business listings found.';
      if (bizRes.status === 'fulfilled') {
        const d = bizRes.value;
        const list = [...(d.premium || []), ...(d.featured || []), ...(d.enhanced || []), ...(d.free || [])].slice(0, 15);
        if (list.length) businesses = list.map(b =>
          `${b.name}${b.category ? ' (' + b.category + ')' : ''}${b.phone ? ' · ' + b.phone : ''}${b.address ? ' · ' + b.address : ''}${b.website ? ' | ' + b.website : ''}`
        ).join('\n');
      }

      // Format weather
      let weather = 'Weather data unavailable.';
      if (wxRes.status === 'fulfilled') {
        const wx = wxRes.value;
        const WD = {0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',61:'Rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Showers',95:'Thunderstorm'};
        const desc = c => WD[c] || 'Mixed';
        const cur = wx.current;
        const d = wx.daily;
        const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        weather = `Now: ${Math.round(cur.temperature_2m)}°F, ${desc(cur.weathercode)}, wind ${Math.round(cur.wind_speed_10m)} mph. ` +
          [0,1,2].map(i => {
            const day = i === 0 ? 'Today' : dayNames[new Date(d.time[i] + 'T12:00:00').getDay()];
            return `${day}: ${Math.round(d.temperature_2m_max[i])}°/${Math.round(d.temperature_2m_min[i])}° ${desc(d.weathercode[i])}${d.precipitation_sum[i] > 0 ? ' ' + d.precipitation_sum[i].toFixed(2) + '"' : ''}`;
          }).join(', ');
      }

      const rawEvents = eventsRes.status === 'fulfilled' ? (eventsRes.value.events || []) : [];
      const d2 = bizRes.status === 'fulfilled' ? bizRes.value : {};
      const rawBusinesses = [...(d2.premium||[]), ...(d2.featured||[]), ...(d2.enhanced||[]), ...(d2.free||[])];
      liveDataRef.current = { events, businesses, weather, rawEvents, rawBusinesses };
      await vapiRef.current.start(VAPI_ASSISTANT_ID);
    }
    catch (err) { console.error('Vapi start error:', err); setStatus('idle'); }
  };

  const endCall = () => { vapiRef.current?.stop(); setStatus('ending'); };
  const isActive = status === 'active' || status === 'connecting';

  if (!VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY === 'your-vapi-public-key-here') return null;

  return (
    <>
      {/* Panel */}
      {panelOpen && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 9997,
          width: 320, maxHeight: 440,
          background: 'rgba(26,40,48,0.96)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isActive ? C.sage : 'rgba(255,255,255,0.25)', animation: isActive ? 'dot-breathe 1.5s ease-in-out infinite' : 'none' }} />
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                {status === 'connecting' ? 'Connecting…' : status === 'active' ? 'Listening' : 'Call ended'}
              </span>
            </div>
            <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '2px 4px' }}>×</button>
          </div>

          {/* Transcript + links */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {transcript.length === 0 && status === 'connecting' && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'center', margin: '24px 0' }}>Connecting to your guide…</p>
            )}
            {transcript.length === 0 && status === 'active' && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'center', margin: '24px 0' }}>Ask me anything about Manitou Beach…</p>
            )}
            {transcript.map((t, i) => (
              <div key={i} style={{
                alignSelf: t.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: t.role === 'user' ? `${C.sage}22` : 'rgba(255,255,255,0.07)',
                border: `1px solid ${t.role === 'user' ? C.sage + '35' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: t.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '8px 12px',
              }}>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.55 }}>{t.text}</p>
              </div>
            ))}
            {isSpeaking && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 4px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.sage, animation: `float 0.6s ease-in-out ${i * 0.15}s infinite alternate` }} />
                ))}
              </div>
            )}
            {links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', textDecoration: 'none',
                background: `${C.sunset}15`, border: `1px solid ${C.sunset}40`,
                borderRadius: 10, padding: '10px 14px', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = `${C.sunset}28`}
                onMouseLeave={e => e.currentTarget.style.background = `${C.sunset}15`}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif" }}>{link.label}</div>
                {link.sublabel && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: "'Libre Franklin', sans-serif" }}>{link.sublabel}</div>}
                <div style={{ fontSize: 11, color: C.sunset, marginTop: 4, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>Open →</div>
              </a>
            ))}
          </div>

          {/* End call */}
          {isActive && (
            <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
              <button onClick={endCall} style={{
                background: 'rgba(220,60,60,0.12)', border: '1px solid rgba(220,60,60,0.3)',
                color: '#ff7070', borderRadius: 8, padding: '7px 22px',
                fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer',
              }}>
                End Call
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating mic button */}
      <button
        onClick={isActive ? endCall : startCall}
        title={isActive ? 'End call' : 'Ask your Manitou Beach guide'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: 56, height: 56, borderRadius: '50%',
          background: isActive ? C.sunset : C.dusk,
          border: `2px solid ${isActive ? C.sunset + '80' : 'rgba(255,255,255,0.15)'}`,
          boxShadow: isActive
            ? `0 0 0 8px ${C.sunset}18, 0 8px 28px rgba(0,0,0,0.35)`
            : '0 4px 20px rgba(0,0,0,0.35)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease',
          animation: isActive ? 'pulse-glow 2s ease-in-out infinite' : 'none',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isActive ? (
            <rect x="6" y="6" width="12" height="12" rx="2" fill="white" stroke="none" />
          ) : (
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}

// ============================================================
// 🗺️  DISCOVER PAGE — MAP-FIRST COMMUNITY GUIDE
// ============================================================

const DISCOVER_MAP_CENTER = { lat: 42.0047, lng: -84.2888 };

const DISCOVER_CATS = [
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

const DISCOVER_POIS = [
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

const DISCOVER_MAP_STYLES = [
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

function createDiscoverPin(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22s14-12.67 14-22C28 6.27 21.73 0 14 0z" fill="${color}" stroke="rgba(0,0,0,0.12)" stroke-width="1"/><circle cx="14" cy="14" r="5.5" fill="white" opacity="0.95"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function buildDiscoverInfoWindow(poi) {
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

function DiscoverPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [businesses, setBusinesses] = useState([]);
  const [communityPois, setCommunityPois] = useState(null); // null = loading, [] = loaded (empty or not)
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapDivRef = useRef(null);
  const mapObjRef = useRef(null);
  const googleRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  useEffect(() => {
    fetch('/api/businesses')
      .then(r => r.json())
      .then(d => setBusinesses([...(d.free || []), ...(d.enhanced || []), ...(d.featured || []), ...(d.premium || [])]))
      .catch(() => {});
    // Community POIs from Notion — merged with hardcoded fallbacks
    fetch('/api/community-pois')
      .then(r => r.json())
      .then(d => setCommunityPois(d.pois || []))
      .catch(() => setCommunityPois([])); // fall back to hardcoded on error
  }, []);

  // Load Google Maps
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('VITE_GOOGLE_MAPS_API_KEY is not set. Add it to Vercel environment variables and redeploy.');
      return;
    }
    if (!mapDivRef.current) return;
    let active = true;
    import('@googlemaps/js-api-loader').then(({ Loader }) => {
      new Loader({ apiKey, version: 'weekly' }).load().then(google => {
        if (!active || !mapDivRef.current) return;
        googleRef.current = google;
        mapObjRef.current = new google.maps.Map(mapDivRef.current, {
          center: DISCOVER_MAP_CENTER,
          zoom: 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
          styles: DISCOVER_MAP_STYLES,
        });
        infoWindowRef.current = new google.maps.InfoWindow();
        setMapReady(true);
      }).catch(err => {
        if (active) setMapError('Map failed to load: ' + err.message);
      });
    }).catch(err => {
      if (active) setMapError('Loader error: ' + err.message);
    });
    return () => { active = false; };
  }, []);

  // Merge Notion community POIs with hardcoded fallbacks (dedup by name)
  // communityPois === null means still loading — show hardcoded pins immediately
  const mergedPois = communityPois === null
    ? DISCOVER_POIS
    : communityPois.length > 0
      ? (() => {
          const notionNames = new Set(communityPois.map(p => p.name.toLowerCase()));
          const extras = DISCOVER_POIS.filter(p => !notionNames.has(p.name.toLowerCase()));
          return [...communityPois, ...extras];
        })()
      : DISCOVER_POIS; // API returned nothing — full hardcoded fallback

  // Update markers when category, map readiness, or POI data changes
  useEffect(() => {
    const google = googleRef.current;
    const map = mapObjRef.current;
    if (!google || !map) return;
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    const activeCatObj = DISCOVER_CATS.find(c => c.id === activeCategory) || DISCOVER_CATS[0];

    // Paid Notion businesses with valid coords — these take precedence over hardcoded POIs
    const bizPins = businesses.filter(b =>
      b.tier !== 'free' && b.lat && b.lng &&
      (activeCategory === 'all' || b.categories?.includes(activeCatObj.notionKey))
    );
    // Names of businesses that override their POI counterpart (so we don't double-pin)
    const bizOverrideNames = new Set(bizPins.map(b => b.name?.toLowerCase()));

    // POIs: show all, but skip any whose name is covered by a Notion business (Notion coords are authoritative)
    const pois = activeCategory === 'all' ? mergedPois : mergedPois.filter(p => (p.cats || [p.cat]).includes(activeCategory));
    pois.forEach((poi, idx) => {
      if (bizOverrideNames.has(poi.name.toLowerCase())) return; // Notion business pin shows instead
      const color = DISCOVER_CATS.find(c => c.id === poi.cat)?.color || '#7A8E72';
      const marker = new google.maps.Marker({
        position: { lat: poi.lat, lng: poi.lng },
        map,
        title: poi.name,
        icon: { url: createDiscoverPin(color), scaledSize: new google.maps.Size(28, 36), anchor: new google.maps.Point(14, 36) },
        animation: google.maps.Animation.DROP,
        zIndex: idx,
      });
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(buildDiscoverInfoWindow(poi));
        infoWindowRef.current.open(map, marker);
      });
      markersRef.current.push(marker);
    });
    bizPins.forEach((biz, idx) => {
      const marker = new google.maps.Marker({
        position: { lat: biz.lat, lng: biz.lng },
        map,
        title: biz.name,
        icon: { url: createDiscoverPin('#D4845A'), scaledSize: new google.maps.Size(24, 31), anchor: new google.maps.Point(12, 31) },
        animation: google.maps.Animation.DROP,
        zIndex: 1000 + idx,
      });
      const iwContent = `<div style="padding:6px 8px 10px;max-width:240px;font-family:system-ui,sans-serif;line-height:1.45">
        <div style="font-size:13px;font-weight:700;color:#2D3B45;margin-bottom:3px">${biz.name}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#D4845A;font-weight:700;margin-bottom:6px">${biz.category}</div>
        ${biz.address ? `<div style="font-size:11px;color:#666;margin-bottom:4px">${biz.address}</div>` : ''}
        ${biz.phone ? `<a href="tel:${biz.phone.replace(/\D/g,'')}" style="display:block;font-size:12px;font-weight:600;color:#7A8E72;margin-bottom:8px;text-decoration:none">${biz.phone}</a>` : ''}
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${biz.website ? `<a href="${biz.website}" target="_blank" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Website →</a>` : ''}
        </div>
        <div style="margin-top:8px;font-size:10px;color:#aaa">Listed on Manitou Beach</div>
      </div>`;
      marker.addListener('click', () => {
        infoWindowRef.current.setContent(iwContent);
        infoWindowRef.current.open(map, marker);
      });
      markersRef.current.push(marker);
    });

    const allPinned = [...pois, ...bizPins];
    if (allPinned.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      allPinned.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, { top: 60, right: 40, bottom: 40, left: 40 });
    } else if (allPinned.length === 1) {
      map.panTo({ lat: allPinned[0].lat, lng: allPinned[0].lng });
      map.setZoom(14);
    }
  }, [activeCategory, mapReady, businesses, communityPois]);

  const activeCat = DISCOVER_CATS.find(c => c.id === activeCategory) || DISCOVER_CATS[0];
  const filteredPois = activeCategory === 'all' ? mergedPois : mergedPois.filter(p => (p.cats || [p.cat]).includes(activeCategory));
  const filteredBizzes = activeCat.notionKey
    ? businesses
        .filter(b => b.categories?.includes(activeCat.notionKey))
        .sort((a, b) => (b.emergency ? 1 : 0) - (a.emergency ? 1 : 0)) // emergency first
    : [];
  const showBizCTA = !!activeCat.notionKey && filteredBizzes.length === 0;

  const DRIVE_TIMES = [
    { city: 'Tecumseh', time: '15 min', note: 'Hospital · Grocery · Hardware' },
    { city: 'Adrian', time: '20 min', note: 'Walmart · Meijer · Shopping' },
    { city: 'Jackson', time: '30 min', note: 'Airport · Chateau Aeronautique' },
    { city: 'Ann Arbor', time: '55 min', note: 'U of M Medical Center' },
    { city: 'Toledo', time: '50 min', note: 'Ohio border city' },
    { city: 'Detroit (DTW)', time: '~70 min', note: 'Major airport access' },
  ];

  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── Compact Title Bar ── */}
      <div style={{ backgroundImage: 'url(/images/DL-boat.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 40%', position: 'relative', minHeight: 'clamp(280px, 40vh, 380px)', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,18,24,0.55) 0%, rgba(10,18,24,0.88) 100%)' }} />
        <div className="discover-hero-inner" style={{ position: 'relative', zIndex: 1, maxWidth: 960, margin: '0 auto', width: '100%' }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 10 }}>
            Manitou Beach · Devils Lake · Michigan
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 400, color: C.cream, margin: '0 0 8px 0', lineHeight: 1.1 }}>
            Discover Manitou Beach
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Food, healthcare, schools, water access, wineries, community — all in one place.
          </p>
        </div>
      </div>

      {/* ── Sticky Category Chips ── */}
      <div style={{ position: 'sticky', top: 64, zIndex: 100, background: 'rgba(250,246,239,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.sand}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="discover-chips-bar" style={{ maxWidth: 1100, margin: '0 auto', padding: '10px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DISCOVER_CATS.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                flexShrink: 0, background: active ? cat.color : '#fff', color: active ? '#fff' : C.text,
                border: `1.5px solid ${active ? cat.color : C.sand}`, borderRadius: 24, padding: '6px 14px',
                fontSize: 13, fontWeight: active ? 700 : 500, fontFamily: "'Libre Franklin', sans-serif",
                cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: active ? `0 2px 8px ${cat.color}40` : 'none',
              }}>
                <span style={{ fontSize: 15 }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
          <a href="/food-trucks" style={{
            flexShrink: 0, background: '#fff', color: C.text,
            border: `1.5px solid ${C.sand}`, borderRadius: 24, padding: '6px 14px',
            fontSize: 13, fontWeight: 500, fontFamily: "'Libre Franklin', sans-serif",
            cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
          }}>
            <span style={{ fontSize: 15 }}>🚚</span>
            Food Trucks
          </a>
        </div>
      </div>

      {/* ── Google Map ── */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(300px, 52vh, 540px)', background: '#e8e0d0' }}>
        <div ref={mapDivRef} style={{ width: '100%', height: '100%' }} />
        {!mapReady && !mapError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2ede3', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.sage}`, borderTopColor: 'transparent', animation: 'discspin 0.8s linear infinite' }} />
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>Loading map…</div>
          </div>
        )}
        {mapError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f2ede3', flexDirection: 'column', gap: 10, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>🗺️</div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: '#c05a5a', fontWeight: 600, maxWidth: 440 }}>{mapError}</div>
          </div>
        )}
        {activeCategory !== 'all' && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(250,246,239,0.96)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: activeCat.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: C.dusk }}>{activeCat.label}</span>
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>· {filteredPois.length} location{filteredPois.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── List Panel ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 400, color: C.dusk, margin: 0 }}>
            {activeCategory === 'all' ? 'Everything nearby' : activeCat.label}
          </h2>
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>
            {filteredPois.length + filteredBizzes.length} place{filteredPois.length + filteredBizzes.length !== 1 ? 's' : ''}
          </span>
          {activeCategory === 'healthcare' && (
            <div style={{ background: '#c05a5a10', border: '1px solid #c05a5a28', borderRadius: 8, padding: '6px 14px', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: '#c05a5a', lineHeight: 1.45, maxWidth: 500 }}>
              <strong>Tip:</strong> Always call your insurance first — network coverage varies by plan. Use the number on your card or your insurer's provider finder.
            </div>
          )}
        </div>

        {filteredPois.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginBottom: filteredBizzes.length > 0 || showBizCTA ? 40 : 0 }}>
            {filteredPois.map(poi => {
              const catInfo = DISCOVER_CATS.find(c => c.id === poi.cat);
              const color = catInfo?.color || '#7A8E72';
              const dir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((poi.address || poi.name) + (poi.address ? '' : ', MI'))}`;
              return (
                <div key={poi.id} style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 12, overflow: 'hidden', display: 'flex', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ width: 4, background: color, flexShrink: 0 }} />
                  <div style={{ padding: '15px 18px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 400, color: C.dusk, lineHeight: 1.3 }}>{poi.name}</div>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{catInfo?.icon}</span>
                    </div>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, marginBottom: 5 }}>{poi.sub}</div>
                    {poi.address && <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.text, marginBottom: 3 }}>{poi.address}</div>}
                    {poi.note && <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: C.textMuted, marginBottom: 8, fontStyle: 'italic' }}>{poi.note}</div>}
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
                      {poi.phone && <a href={`tel:${poi.phone.replace(/\D/g, '')}`} style={{ fontSize: 12, fontWeight: 600, color: C.sage, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>{poi.phone}</a>}
                      <a href={dir} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: C.lakeBlue, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Get Directions →</a>
                      {poi.website && <a href={poi.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: C.sunset, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Website →</a>}
                      {poi.href && <a href={poi.href} style={{ fontSize: 12, fontWeight: 600, color: C.sunset, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Learn More →</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredBizzes.length > 0 && (
          <>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.textMuted, marginBottom: 16 }}>Local Businesses</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {filteredBizzes.map((biz, i) => (
                <div key={biz.id || i} style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {biz.logo
                    ? <img src={biz.logo} alt={biz.name} style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'contain', border: `1px solid ${C.sand}`, background: '#faf5ef', padding: 4, flexShrink: 0 }} />
                    : <div style={{ width: 46, height: 46, borderRadius: 8, background: `${activeCat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{activeCat.icon}</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.dusk }}>{biz.name}</div>
                      {biz.emergency && <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", background: '#c05a5a', color: '#fff', borderRadius: 4, padding: '2px 6px', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>24hr / Emergency</span>}
                    </div>
                    {biz.tagline && <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, lineHeight: 1.4, marginBottom: 8 }}>{biz.tagline}</div>}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {biz.phone && <a href={`tel:${biz.phone}`} style={{ fontSize: biz.emergency ? 14 : 12, fontWeight: 700, color: biz.emergency ? '#c05a5a' : C.sage, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>{biz.phone}</a>}
                      {biz.website && <a href={biz.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: C.lakeBlue, textDecoration: 'none', fontFamily: "'Libre Franklin', sans-serif" }}>Visit →</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showBizCTA && (
          <div style={{ background: `${activeCat.color}08`, border: `1.5px dashed ${activeCat.color}45`, borderRadius: 16, padding: '40px 32px', textAlign: 'center', marginTop: filteredPois.length > 0 ? 32 : 0 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{activeCat.icon}</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 8 }}>
              No {activeCat.label} businesses listed yet.
            </div>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textMuted, maxWidth: 380, margin: '0 auto 24px' }}>
              Own a {activeCat.label.toLowerCase()} business near Manitou Beach? This is where locals and visitors look.
            </p>
            <Btn href="/featured" variant="primary" small>Get Listed — from $9/mo</Btn>
          </div>
        )}
      </div>

      {/* ── Explore More ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 52px' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.textMuted, marginBottom: 14 }}>Explore More</div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {[
            { icon: '🎣', label: 'Fishing Guide', href: '/fishing' },
            { icon: '🍷', label: 'Wineries', href: '/wineries' },
            { icon: '🛍️', label: 'The Village', href: '/village' },
            { icon: '📅', label: 'Events', href: '/happening' },
            { icon: '⛵', label: 'Devils Lake', href: '/devils-lake' },
            { icon: '💧', label: 'Round Lake', href: '/round-lake' },
            { icon: '🏛️', label: 'Local History', href: '/historical-society' },
          ].map((tile, i) => (
            <a key={i} href={tile.href} style={{ flexShrink: 0, textDecoration: 'none', background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 8, transition: 'box-shadow 0.18s, transform 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: 18 }}>{tile.icon}</span>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: C.dusk, whiteSpace: 'nowrap' }}>{tile.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Drive Times ── */}
      <section style={{ background: C.dusk }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 20px' }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 10 }}>Location</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 400, color: C.cream, margin: '0 0 10px 0' }}>Closer than you think.</h2>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.48)', margin: '0 0 40px 0', maxWidth: 480 }}>
            You're not in the middle of nowhere. You're in the middle of everything that matters — just far enough from the noise.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
            {DRIVE_TIMES.map((row, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '20px 22px', borderRight: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.cream, lineHeight: 1 }}>{row.time}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: C.sage, marginTop: 6 }}>{row.city}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 4 }}>{row.note}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: 'rgba(255,255,255,0.32)', marginTop: 20, fontStyle: 'italic' }}>
            Year-round community. Quiet winters. Summers on the water.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 400, color: C.dusk, marginBottom: 10 }}>
          This is your community too.
        </div>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textMuted, maxWidth: 420, margin: '0 auto 28px' }}>
          Get your business in front of the people who live here, visit here, and move here.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="/featured" variant="primary">List Your Business</Btn>
          <Btn href="/promote" variant="sunset">List an Event</Btn>
        </div>
      </section>
      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="discover" />
      <style>{`
        @keyframes discspin { to { transform: rotate(360deg); } }
        .discover-hero-inner { padding: 80px 48px 36px; }
        @media (max-width: 640px) {
          .discover-hero-inner { padding: 80px 20px 28px; }
          .discover-chips-bar { padding: 10px 16px !important; gap: 6px !important; }
          .discover-chips-bar button { padding: 6px 12px !important; font-size: 12px !important; }
        }
      `}</style>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 📄  PRIVACY POLICY
// ============================================================
function PrivacyPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  const S = { // shared prose styles
    h2: { fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.dusk, margin: '40px 0 12px' },
    p: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, margin: '0 0 14px' },
    li: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 6 },
  };
  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px 28px 80px' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: C.sage, marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 400, color: C.dusk, margin: '0 0 8px' }}>Privacy Policy</h1>
        <p style={{ ...S.p, color: C.textMuted, fontSize: 13, marginBottom: 40 }}>Effective date: March 2026 &nbsp;·&nbsp; Yeti Groove Media LLC</p>

        <p style={S.p}>This Privacy Policy explains how Yeti Groove Media LLC ("we", "us", "our") collects, uses, and protects information submitted through the Manitou Beach community platform at manitoubeach.com ("the Site"). We keep it plain — no legalese.</p>

        <h2 style={S.h2}>What we collect</h2>
        <p style={S.p}><strong>Newsletter sign-ups:</strong> Your email address. Delivered through beehiiv. You can unsubscribe at any time using the link in any email.</p>
        <p style={S.p}><strong>Business listing submissions:</strong> Business name, category, phone number, website, email address, physical address, and an optional logo. This information is submitted voluntarily and is used to populate the public business directory.</p>
        <p style={S.p}><strong>Event submissions:</strong> Event name, description, date, and contact email. Used to list your event on the site.</p>
        <p style={S.p}><strong>Offer claims (QR/loyalty):</strong> Name and email, collected when you redeem a business offer. This information is shared with the participating business for redemption verification only.</p>
        <p style={S.p}><strong>Payment information:</strong> Processed entirely by Stripe. We never receive or store your card number, CVV, or bank details. Stripe's privacy policy governs payment data.</p>

        <h2 style={S.h2}>How we use it</h2>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'To display your business or event in the public directory',
            'To send the Manitou Beach newsletter (email only, opt-in)',
            'To process paid listing subscriptions via Stripe',
            'To verify offer redemptions at participating businesses',
            'To improve the site and understand what content is useful',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>
        <p style={S.p}>We do not sell, rent, or trade your personal information to any third party for marketing purposes.</p>

        <h2 style={S.h2}>Third-party services</h2>
        <p style={S.p}>The Site uses the following third-party services, each with their own privacy practices:</p>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'Notion — business and event data storage',
            'beehiiv — newsletter delivery and subscriber management',
            'Stripe — payment processing for paid listings',
            'Google Maps — interactive map on the Discover page (may set cookies)',
            'Vercel — hosting and serverless functions',
            'OpenStreetMap / Nominatim — address geocoding (no personal data sent)',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>

        <h2 style={S.h2}>Cookies &amp; browser storage</h2>
        <p style={S.p}>We do not use advertising or analytics cookies. Google Maps may store data in your browser to function correctly. We do not track you across other websites.</p>

        <h2 style={S.h2}>Data retention</h2>
        <p style={S.p}>Business listings remain in our Notion database until you request removal. Newsletter subscriptions are retained until you unsubscribe. You may request deletion of any personal information at any time by emailing us.</p>

        <h2 style={S.h2}>Your rights</h2>
        <p style={S.p}>You may request access to, correction of, or deletion of any personal data we hold about you. Email <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a> and we will respond promptly.</p>

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>Yeti Groove Media LLC<br /><a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a></p>
        <p style={{ ...S.p, fontSize: 13, color: C.textMuted }}>This policy may be updated from time to time. Continued use of the Site after changes constitutes acceptance of the revised policy.</p>
      </div>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 📄  TERMS OF SERVICE
// ============================================================
function TermsPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  const S = {
    h2: { fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.dusk, margin: '40px 0 12px' },
    p: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, margin: '0 0 14px' },
    li: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 6 },
  };
  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px 28px 80px' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: C.sage, marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 400, color: C.dusk, margin: '0 0 8px' }}>Terms of Service</h1>
        <p style={{ ...S.p, color: C.textMuted, fontSize: 13, marginBottom: 40 }}>Effective date: March 2026 &nbsp;·&nbsp; Yeti Groove Media LLC</p>

        <p style={S.p}>By using the Manitou Beach community platform at manitoubeach.com ("the Site"), you agree to these Terms. If you don't agree, please don't use the Site.</p>

        <h2 style={S.h2}>Who we are</h2>
        <p style={S.p}>The Site is operated by Yeti Groove Media LLC, a Michigan limited liability company. Contact: <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a>.</p>

        <h2 style={S.h2}>Business listings</h2>
        <p style={S.p}>By submitting a business listing, you confirm that:</p>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'You are authorized to represent the business',
            'All submitted information is accurate and not misleading',
            'The business is lawfully operating',
            'You will notify us of material changes to your listing information',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>
        <p style={S.p}>We reserve the right to approve, edit, or remove any listing at our sole discretion. Free listings are not guaranteed placement or visibility.</p>

        <h2 style={S.h2}>Paid subscriptions</h2>
        <p style={S.p}>Paid listing tiers (Enhanced, Featured, Premium) are billed monthly via Stripe. By subscribing, you authorize recurring charges. You may cancel at any time; your listing will remain active through the end of the current billing period. No refunds for partial months.</p>
        <p style={S.p}>Pricing may change with 30 days' notice. Founding members who are currently subscribed will not be subject to price increases while their subscription remains active.</p>

        <h2 style={S.h2}>Acceptable use</h2>
        <p style={S.p}>You agree not to submit content that is false, defamatory, harassing, illegal, or infringes the rights of others. We may remove content and terminate access for violations without notice.</p>

        <h2 style={S.h2}>Intellectual property</h2>
        <p style={S.p}>Editorial content, design, and original photography on this Site are owned by Yeti Groove Media LLC. By submitting a logo or photo, you grant us a non-exclusive license to display it on the Site in connection with your listing.</p>
        <p style={S.p}>To report a copyright claim, contact <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a> with "DMCA" in the subject line.</p>

        <h2 style={S.h2}>Disclaimer &amp; limitation of liability</h2>
        <p style={S.p}>The Site is provided "as is." We make no warranties about the accuracy, completeness, or reliability of directory listings. Business information is submitted by third parties — always verify directly with a business before visiting or transacting.</p>
        <p style={S.p}>To the fullest extent permitted by law, Yeti Groove Media LLC is not liable for any indirect, incidental, or consequential damages arising from your use of the Site.</p>

        <h2 style={S.h2}>Governing law</h2>
        <p style={S.p}>These Terms are governed by the laws of the State of Michigan. Any disputes shall be resolved in the courts of Lenawee County, Michigan.</p>

        <h2 style={S.h2}>Changes to these Terms</h2>
        <p style={S.p}>We may update these Terms at any time. We'll post the updated date at the top of this page. Continued use of the Site constitutes acceptance.</p>

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}><a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a></p>
      </div>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🚚  /food-trucks — FOOD TRUCK LOCATOR
// ============================================================
function FoodTrucksPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const truckSlug = params.get("truck") || "";
  const truckToken = params.get("token") || "";
  const isCheckinMode = !!(truckSlug && truckToken);

  const [trucks, setTrucks] = useState(null);
  const [checkinTruck, setCheckinTruck] = useState(null);
  const [checkinNote, setCheckinNote] = useState("");
  const [checkinStatus, setCheckinStatus] = useState(""); // "", "loading", "success", "error"
  const [checkinMsg, setCheckinMsg] = useState("");
  const [sharedId, setSharedId] = useState(null);

  const shareTruck = (truck) => {
    const loc = truck.locationNote ? ` — ${truck.locationNote}` : '';
    const text = `${truck.name} is here today${loc}. Meet you there! 🚚`;
    const url = 'https://manitoubeach.com/food-trucks';
    if (navigator.share) {
      navigator.share({ title: truck.name, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
      setSharedId(truck.id);
      setTimeout(() => setSharedId(null), 2200);
    }
  };

  useEffect(() => {
    fetch("/api/food-trucks")
      .then(r => r.json())
      .then(d => {
        setTrucks(d.trucks || []);
        if (isCheckinMode) {
          const mine = (d.trucks || []).find(t => t.slug === truckSlug);
          setCheckinTruck(mine || null);
        }
      })
      .catch(() => setTrucks([]));
  }, []);

  const handleCheckin = () => {
    setCheckinStatus("loading");
    const doPost = (lat, lng) => {
      fetch("/api/food-trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: truckSlug, token: truckToken, lat, lng, note: checkinNote }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.ok) {
            setCheckinStatus("success");
            setCheckinMsg(`You're checked in! Customers can now see ${d.name} on the locator.`);
          } else {
            setCheckinStatus("error");
            setCheckinMsg(d.error || "Check-in failed. Try again.");
          }
        })
        .catch(() => { setCheckinStatus("error"); setCheckinMsg("Network error. Try again."); });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doPost(pos.coords.latitude, pos.coords.longitude),
        () => doPost(null, null),
        { timeout: 8000 }
      );
    } else {
      doPost(null, null);
    }
  };

  const now = Date.now();
  const isLive = (truck) => {
    if (!truck.lastCheckin) return false;
    return (now - new Date(truck.lastCheckin).getTime()) < 12 * 60 * 60 * 1000;
  };
  const timeAgo = (iso) => {
    const diff = Math.floor((now - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    return `${h}h ago`;
  };

  const liveTrucks = (trucks || []).filter(isLive);
  const allTrucks = trucks || [];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 60%, ${C.lakeBlue}33 100%)`,
        padding: "120px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 60% 40%, rgba(91,126,149,0.12) 0%, transparent 65%)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚚</div>
            <SectionLabel light>Live Locator</SectionLabel>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400, color: C.cream, lineHeight: 1.15, margin: "16px 0 20px" }}>
              Find a Food Truck
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 480, margin: "0 auto" }}>
              Local food trucks check in when they're open. See who's out on the lake today.
            </p>
            {liveTrucks.length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, background: `${C.sage}22`, border: `1px solid ${C.sage}44`, borderRadius: 20, padding: "8px 18px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.sage, boxShadow: `0 0 6px ${C.sage}` }} />
                <span style={{ fontSize: 13, color: C.sage, fontWeight: 600 }}>{liveTrucks.length} truck{liveTrucks.length !== 1 ? "s" : ""} open now</span>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.warmWhite} />

      {/* Check-in Panel — shown only when ?truck=&token= params are present */}
      {isCheckinMode && (
        <section style={{ background: C.warmWhite, padding: "0 24px 48px" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ background: C.cream, borderRadius: 16, border: `2px solid ${C.sage}44`, padding: "32px 28px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
              {trucks === null ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: C.textMuted, fontSize: 14 }}>Loading…</div>
              ) : checkinStatus === "success" ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.text, margin: "0 0 12px" }}>Checked In!</h2>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6 }}>{checkinMsg}</p>
                  <button onClick={() => { setCheckinStatus(""); setCheckinMsg(""); }} style={{ marginTop: 20, padding: "10px 22px", background: C.sage, color: C.cream, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Check In Again
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                    {checkinTruck?.photoUrl ? (
                      <img src={checkinTruck.photoUrl} alt={checkinTruck?.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.sand}` }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 10, background: `${C.sage}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🚚</div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text }}>
                        {checkinTruck?.name || truckSlug}
                      </div>
                      {checkinTruck?.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{checkinTruck.cuisine}</div>}
                    </div>
                  </div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>
                    Where are you today?
                  </label>
                  <input
                    type="text"
                    value={checkinNote}
                    onChange={e => setCheckinNote(e.target.value)}
                    placeholder="e.g. Near the boat launch, Village parking lot…"
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", color: C.text, background: C.warmWhite, outline: "none" }}
                  />
                  <p style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>
                    We'll also try to grab your GPS location automatically for map accuracy (optional).
                  </p>
                  {checkinStatus === "error" && (
                    <div style={{ marginTop: 8, fontSize: 13, color: "#c05a5a", fontWeight: 500 }}>{checkinMsg}</div>
                  )}
                  <button
                    onClick={handleCheckin}
                    disabled={checkinStatus === "loading"}
                    style={{ marginTop: 20, width: "100%", padding: "14px", background: checkinStatus === "loading" ? C.sand : C.sage, color: C.cream, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: checkinStatus === "loading" ? "default" : "pointer", transition: "background 0.2s", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}
                  >
                    {checkinStatus === "loading" ? "Checking in…" : "I'm Here Today! 🚚"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Live Now section */}
      <section style={{ background: C.warmWhite, padding: isCheckinMode ? "0 24px 72px" : "72px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: liveTrucks.length > 0 ? C.sage : C.sand, flexShrink: 0 }} />
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: C.text, margin: 0 }}>
                {liveTrucks.length > 0 ? "Open Right Now" : "No trucks checked in today"}
              </h2>
            </div>
          </FadeIn>
          {trucks === null ? (
            <div style={{ textAlign: "center", padding: "48px", color: C.textMuted, fontSize: 14 }}>Loading trucks…</div>
          ) : liveTrucks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}` }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🌤️</div>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
                No food trucks are checked in right now. Check back later — they update throughout the day.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {liveTrucks.map((truck, i) => (
                <FadeIn key={truck.id} delay={i * 60}>
                  <div style={{ background: C.cream, borderRadius: 14, border: `2px solid ${C.sage}33`, overflow: "hidden", height: "100%" }}>
                    {truck.photoUrl && (
                      <img src={truck.photoUrl} alt={truck.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    )}
                    <div style={{ padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.text, margin: 0 }}>{truck.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.sage }} />
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 600 }}>{timeAgo(truck.lastCheckin)}</span>
                        </div>
                      </div>
                      {truck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{truck.cuisine}</div>}
                      {truck.locationNote && (
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 10 }}>
                          📍 {truck.locationNote}
                        </div>
                      )}
                      {truck.description && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "0 0 12px" }}>{truck.description}</p>}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {truck.phone && (
                          <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            📱 Call
                          </a>
                        )}
                        {truck.lat && truck.lng && (
                          <a href={`https://www.google.com/maps?q=${truck.lat},${truck.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            🗺️ Directions
                          </a>
                        )}
                        {truck.website && (
                          <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600 }}>
                            Website →
                          </a>
                        )}
                        <button
                          onClick={() => shareTruck(truck)}
                          style={{ fontSize: 12, color: sharedId === truck.id ? C.sage : C.sunset, background: "none", border: "none", padding: 0, fontWeight: 700, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", display: "inline-flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}
                        >
                          {sharedId === truck.id ? '✓ Copied' : '↗ Tell a friend'}
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />

      {/* All Trucks directory */}
      {allTrucks.length > 0 && (
        <section style={{ background: C.cream, padding: "64px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ marginBottom: 32 }}>
                <SectionLabel>All Trucks</SectionLabel>
                <SectionTitle>Find Your Favorite</SectionTitle>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {allTrucks.map((truck, i) => {
                const live = isLive(truck);
                return (
                  <FadeIn key={truck.id} delay={i * 40}>
                    <div style={{ background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}`, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: live ? `${C.sage}20` : `${C.sand}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        🚚
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.text }}>{truck.name}</span>
                          {live && <span style={{ fontSize: 10, fontWeight: 700, color: C.sage, background: `${C.sage}15`, padding: "2px 7px", borderRadius: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Open</span>}
                        </div>
                        {truck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{truck.cuisine}</div>}
                        {truck.phone && (
                          <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", display: "block", marginTop: 6 }}>
                            {truck.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Owner CTA */}
      <section style={{ background: C.dusk, padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🚚</div>
            <SectionLabel light>Are You a Food Truck?</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 400, color: C.cream, margin: "16px 0 16px" }}>
              Get Listed — It's Free
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 28 }}>
              We'll set you up with a personal check-in link. Bookmark it and tap it every time you're open. Your customers will always know where to find you.
            </p>
            <Btn href="mailto:admin@yetigroove.com?subject=Food%20Truck%20Listing%20Request" variant="sunset">
              Get Your Check-In Link
            </Btn>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🏗️  /build — WEBSITE RENTAL LEAD CAPTURE
// ============================================================
function BuildPage() {
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
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
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

// ============================================================
// 🔒  /founding — FOUNDING MEMBER PAGE (private link, friend outreach)
// ============================================================
const FOUNDING_TIERS = [
  { name: "Enhanced", price: 9,  perks: ["Business listing on Manitou Beach", "Map pin on /discover", "Category placement", "Contact info + description", "Link to your website", "Upgrade to Featured or Premium at founding rates — any time"] },
  { name: "Featured", price: 23, highlight: true, perks: ["Everything in Enhanced", "Priority placement in category", "Logo displayed on listing", "Newsletter mention eligibility", "Highlighted card styling", "Upgrade to Premium at founding rates — any time"] },
  { name: "Premium",  price: 43, perks: ["Everything in Featured", "Top of category, always", "Monthly newsletter feature eligible", "First call for sponsorship spots", "Founding badge on listing"] },
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

const FOUNDING_MATH = [
  { subs: "Today",    newPrice: null,  yourPrice: 9,  label: "Founding rate" },
  { subs: "200 subs", newPrice: 10,   yourPrice: 9,  label: "You still pay $9" },
  { subs: "500 subs", newPrice: 13,   yourPrice: 9,  label: "You still pay $9" },
  { subs: "1,000 subs", newPrice: 18, yourPrice: 9,  label: "You still pay $9" },
];

function FoundingPage() {
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
          <Btn href="mailto:admin@yetigroove.com?subject=Business Listing — Early Rate" variant="sunset" style={{ whiteSpace: "nowrap" }}>
            Start My Listing →
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
              <img src="/images/founding-rate-illustration.png" alt="" aria-hidden="true" style={{ width: "min(340px, 70vw)", opacity: 0.92 }} />
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
                      href={`mailto:admin@yetigroove.com?subject=Founding Member — ${tier.name} Listing`}
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

      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />

      {/* ── FOUNDERS BONUS ── */}
      <section style={{ background: C.dusk, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap" }}>
            <FadeIn delay={120} style={{ flex: "0 0 auto", textAlign: "center" }}>
              <img src="/images/community-illustration.png" alt="" aria-hidden="true" style={{ width: "min(260px, 65vw)", opacity: 0.92 }} />
            </FadeIn>
            <FadeIn style={{ flex: "1 1 300px" }}>
              <SectionLabel light>Founders Bonus</SectionLabel>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.25 }}>
                Your founding rate follows you<br /><em style={{ color: C.sunsetLight }}>all the way up.</em>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.85, marginBottom: 28 }}>
                Start at Enhanced today. If you ever want a Featured or Premium listing — for a busy summer season, Tip-Up Festival, a grand opening — you upgrade at your original founding rate, not whatever the market rate is at that time. That protection follows you through every tier, permanently.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "🔒", text: "Upgrade to any higher tier at your founding rate — whenever you want, for as long as you're listed" },
                  { icon: "📅", text: "Useful for seasonal peaks: Tip-Up Festival, July 4th, Memorial Day, summer opening weekend" },
                  { icon: "⚡", text: "Founding rate access closes once early spots fill — first in, first protected. No exceptions after." },
                ].map((item, i) => (
                  <FadeIn key={i} delay={i * 80 + 200}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, fontFamily: "'Libre Franklin', sans-serif" }}>{item.text}</span>
                    </div>
                  </FadeIn>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.28)" }}>No catch. Just the benefit of moving early.</div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />

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
              Email Daryl with the tier you want. He'll get your listing set up.
            </p>
            <Btn href="mailto:admin@yetigroove.com?subject=Business Listing — Early Rate" variant="sunset" style={{ whiteSpace: "nowrap" }}>
              Start My Listing →
            </Btn>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🚚  /food-truck-partner — FOOD TRUCK PARTNER PAGE (private link)
// ============================================================
const TRUCK_HOW = [
  { step: "01", title: "Tell Daryl you want to be listed", copy: "One email. He adds you to the map — your truck name, what you serve, and a private check-in link that's yours forever." },
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
const TRUCK_FREE_ITEMS = [
  { label: "No commission", sub: "We don't take a cut. Not now, not later." },
  { label: "No subscription", sub: "Free to list, free to check in, free forever." },
  { label: "No exclusivity", sub: "Work every market you want. We're one more audience." },
  { label: "No setup work", sub: "Daryl handles the listing. You just show up." },
];

function FoodTruckPartnerPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
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
            The Manitou Beach Food Truck Locator shows locals and visitors which trucks are out right now. Get listed free — one check-in and you're live.
          </p>
          <Btn href="mailto:admin@yetigroove.com?subject=Food Truck Listing" variant="sunset" style={{ whiteSpace: "nowrap" }}>
            Get Your Truck on the Map →
          </Btn>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.28)", marginTop: 14 }}>Free. Always.</div>
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
              <img src="/images/community-illustration.png" alt="" aria-hidden="true" style={{ width: "min(280px, 70vw)", opacity: 0.93 }} />
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
            <SectionLabel light>What's Included</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 48px", lineHeight: 1.2, textAlign: "center" }}>
              Everything you get<br /><em style={{ color: C.sunsetLight }}>when you're on the map.</em>
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

      {/* ── ZERO COST ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 48, alignItems: "center", marginBottom: 44, flexWrap: "wrap-reverse" }}>
            <FadeIn delay={120} style={{ flex: "0 0 auto", textAlign: "center" }}>
              <img src="/images/foodtruck-1-illustration.png" alt="" aria-hidden="true" style={{ width: "min(300px, 75vw)", opacity: 0.93 }} />
            </FadeIn>
            <FadeIn style={{ flex: "1 1 280px" }}>
              <SectionLabel>The Cost</SectionLabel>
              <SectionTitle>What you pay to be on the map.</SectionTitle>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(56px, 10vw, 96px)", fontWeight: 700, color: C.sunset, margin: "8px 0 12px", lineHeight: 1 }}>$0</div>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 420, margin: 0 }}>
                No commission, no platform fee, no monthly bill. Manitou Beach gets more food options for the community. You get in front of people who are already there and hungry.
              </p>
            </FadeIn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, textAlign: "left", maxWidth: 660, margin: "0 auto" }}>
            {TRUCK_FREE_ITEMS.map((item, i) => (
              <FadeIn key={item.label} delay={i * 60}>
                <div style={{ background: C.warmWhite, borderRadius: 12, padding: "20px 20px", border: `1px solid ${C.sand}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.sageDark, marginBottom: 4 }}>✓ {item.label}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{item.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />

      {/* ── CTA ── */}
      <section style={{ background: C.night, padding: "80px 24px 110px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light>Get On the Map</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.25 }}>
              Ready to get listed?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 44 }}>
              Send Daryl your truck name, what you serve, and a phone number. He'll get you set up with a check-in link the same day. That's the whole process.
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <Btn href="mailto:admin@yetigroove.com?subject=Food Truck Listing" variant="sunset" style={{ whiteSpace: "nowrap" }}>
                Get Your Truck on the Map →
              </Btn>
              <a
                href="/food-trucks"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", letterSpacing: 0.5, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >
                See the locator first →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

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
  { icon: "📄", title: "QR Kit", copy: "Printed cards for your tasting room counter or table. Daryl delivers them. You place one out. That's the full setup." },
  { icon: "🏆", title: "Season-End Award", copy: "At the end of 2026, top-rated venues in each category receive a plaque — something to hang on your wall, post online, and be proud of." },
  { icon: "👥", title: "Community Visibility", copy: "Your listing on Manitou Beach, seen by the region's most engaged local audience — visitors, locals, and seasonal residents all in one place." },
];
const WINE_PARTNER_AWARDS = [
  { name: "Best Wine Quality", icon: "🍷" },
  { name: "Best Service", icon: "⭐" },
  { name: "Best Atmosphere", icon: "✨" },
  { name: "Best Value", icon: "💎" },
  { name: "People's Choice", icon: "🏅" },
  { name: "Best Hidden Gem", icon: "🗺️" },
];
// ── /rate — Universal Wine Trail Rating Page ──────────────────────────
const RATE_VENUES = WINERY_VENUES.filter(v => v.section !== 'extended').map(v => v.name);

function RatePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  // Pre-select venue from ?venue= param
  const params = new URLSearchParams(window.location.search);
  const preVenue = params.get('venue') || '';

  const [venue, setVenue] = useState(preVenue);
  const [wines, setWines] = useState(['', '', '']);
  const [rating, setRating] = useState(0);
  const [service, setService] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);
  const [rateValue, setRateValue] = useState(0);
  const [note, setNote] = useState('');
  const [quote, setQuote] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const addWine = () => { if (wines.length < 6) setWines(w => [...w, '']); };
  const updateWine = (i, v) => setWines(w => w.map((x, idx) => idx === i ? v : x));
  const removeWine = (i) => { if (wines.length > 1) setWines(w => w.filter((_, idx) => idx !== i)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venue) { setError('Please select a venue.'); return; }
    if (!rating) { setError('Wine Quality rating is required.'); return; }
    const filledWines = wines.map(w => w.trim()).filter(Boolean);
    if (filledWines.length === 0) { setError('Please tell us at least one wine or pour you tried.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const wineTried = filledWines.join(' · ');
      const noteText = [note.trim(), visitorName.trim() ? `— ${visitorName.trim()}` : ''].filter(Boolean).join(' ');
      const res = await fetch('/api/winery-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue, rating,
          service:    service    || undefined,
          atmosphere: atmosphere || undefined,
          value:      rateValue  || undefined,
          wineTried,
          note: noteText,
          quote: quote.trim() || undefined,
          sessionId: getWineSessionId(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or find us at the event.');
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 15, color: C.text, background: '#fff', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 8,
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${C.dusk} 0%, #1a2a35 50%, ${C.night} 100%)`,
        padding: '140px 24px 80px',
        textAlign: 'center',
      }}>
        <FadeIn>
          <SectionLabel light>Manitou Beach Wine Trail</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400, color: C.cream, lineHeight: 1.1, margin: '0 0 16px 0' }}>
            Rate Your Visit
          </h1>
          <p style={{ fontSize: 'clamp(14px, 1.5vw, 17px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
            Honest reviews help the whole trail. Takes two minutes.
          </p>
        </FadeIn>
      </section>

      {/* Form */}
      <section style={{ padding: '60px 24px 80px', background: C.cream }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {submitted ? (
            <FadeIn>
              <div style={{ textAlign: 'center', padding: '60px 32px', background: C.warmWhite, borderRadius: 20, border: `1px solid ${C.sand}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, marginBottom: 12 }}>Thank you!</div>
                <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                  Your review has been submitted. We curate every entry before publishing — your score will appear on the trail page soon.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Btn href="/wineries" variant="primary">See the Wine Trail →</Btn>
                  <Btn href="/rate" variant="outline" onClick={() => { setSubmitted(false); setVenue(''); setWines(['','','']); setRating(0); setService(0); setAtmosphere(0); setRateValue(0); setNote(''); setQuote(''); setVisitorName(''); }}>Rate Another Venue</Btn>
                </div>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <form onSubmit={handleSubmit} noValidate>

                {/* Venue */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Venue *</label>
                  <select
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239B8E85' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 38 }}
                  >
                    <option value="">— Select a venue —</option>
                    {RATE_VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                {/* Wines tried */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>What did you try? *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {wines.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={w}
                          onChange={e => updateWine(i, e.target.value)}
                          placeholder={i === 0 ? "e.g. 2023 Riesling, dry rosé, Cab Franc flight..." : "Another pour..."}
                          style={{ ...fieldStyle, flex: 1 }}
                        />
                        {wines.length > 1 && (
                          <button type="button" onClick={() => removeWine(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.textMuted, padding: '0 4px', lineHeight: 1 }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {wines.length < 6 && (
                    <button type="button" onClick={addWine} style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      + Add another wine or pour
                    </button>
                  )}
                </div>

                {/* Star ratings */}
                <div style={{ marginBottom: 24, padding: '20px 20px 10px', background: C.warmWhite, borderRadius: 14, border: `1px solid ${C.sand}` }}>
                  <StarRow label="Wine Quality" required value={rating}        onChange={setRating} />
                  <StarRow label="Service"      required={false} value={service}     onChange={setService} />
                  <StarRow label="Atmosphere"   required={false} value={atmosphere}  onChange={setAtmosphere} />
                  <StarRow label="Value"        required={false} value={rateValue}   onChange={setRateValue} />
                </div>

                {/* Shareable quote */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Your highlight <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — may appear on the site)</span></label>
                  <textarea
                    value={quote}
                    onChange={e => setQuote(e.target.value)}
                    placeholder={"\"Perfect afternoon. The Cab Franc was unlike anything I expected from Michigan...\"" }
                    rows={2}
                    style={{ ...fieldStyle, resize: 'none', fontStyle: quote ? 'italic' : 'normal' }}
                  />
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginTop: 6 }}>
                    Something worth sharing? We may feature it on the trail page with your permission.
                  </div>
                </div>

                {/* Private note */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Private note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — not published)</span></label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Anything that doesn't need to be public — feedback, suggestions..."
                    rows={2}
                    style={{ ...fieldStyle, resize: 'none' }}
                  />
                </div>

                {/* Name (private) */}
                <div style={{ marginBottom: 32 }}>
                  <label style={labelStyle}>Your name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(private — not published)</span></label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    placeholder="Helps us spot patterns — never shown publicly"
                    style={fieldStyle}
                  />
                </div>

                {error && <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 16, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', padding: '14px 24px', borderRadius: 28, background: C.sage, color: C.cream, border: 'none', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Your Review'}
                </button>

                <p style={{ marginTop: 16, fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  Reviews are curated before publishing. No account needed. Your name stays private.
                </p>
              </form>
            </FadeIn>
          )}
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

const WINE_PARTNER_FRICTIONLESS = [
  { label: "No app required", sub: "Customers rate in a browser. Done." },
  { label: "No account to manage", sub: "Your profile is already live." },
  { label: "No work to maintain", sub: "We run the system. You run the tasting room." },
  { label: "No hidden cost later", sub: "If that ever changes, you'll hear it from us first." },
];

function WinePartnerPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />

      {/* Partner context strip */}
      <div style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "9px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>This page isn't public — you're seeing it because someone sent it to you.</span>
        <a href="/wineries" style={{ fontSize: 12, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>See the Wine Trail →</a>
        <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", whiteSpace: "nowrap" }}>Visit Homepage →</a>
      </div>

      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 55%, ${C.night} 100%)`, padding: "160px 24px 110px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(139,30,30,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
        <FadeIn>
          <SectionLabel light>Manitou Beach Wine Trail · 2026</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 400, color: C.cream, margin: "20px 0 24px", lineHeight: 1.15 }}>
            Your tasting room.<br />Rated. Recognized.<br /><em>Celebrated.</em>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.85 }}>
            Manitou Beach visitors are already discovering your tasting room. Now they have a way to tell the community what they found — and at the end of the season, the best venues get recognized for it.
          </p>
          <Btn href="mailto:admin@yetigroove.com?subject=QR Kit Request" variant="sunset" style={{ whiteSpace: "nowrap" }}>
            Request Your QR Kit →
          </Btn>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.28)", marginTop: 14 }}>
            Free. No setup. We deliver.
          </div>
        </FadeIn>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.cream} />

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>How It Works</SectionLabel>
            <SectionTitle center>Three steps. Zero work on your end.</SectionTitle>
          </FadeIn>
          <FadeIn delay={100}>
            <div style={{ textAlign: "center", margin: "32px 0 44px" }}>
              <img src="/images/passport-review-illustration.png" alt="" aria-hidden="true" style={{ width: "min(760px, 90vw)", opacity: 0.93 }} />
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
            {WINE_PARTNER_HOW.map((s, i) => (
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

      {/* ── WHAT YOU GET ── */}
      <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>What You Get</SectionLabel>
            <SectionTitle center>Everything that comes with being on the trail.</SectionTitle>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginTop: 48 }}>
            {WINE_PARTNER_GETS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 70}>
                <div style={{ background: C.cream, borderRadius: 14, padding: "28px 24px", border: `1px solid ${C.sand}`, borderTop: `3px solid ${C.sunset}`, height: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.78 }}>{item.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />

      {/* ── THE AWARDS ── */}
      <section style={{ background: C.dusk, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light>Season-End Recognition</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.2 }}>
              The 2026 Manitou Beach<br /><em style={{ color: C.sunsetLight }}>Wine Trail Awards</em>
            </h2>
            <div style={{ margin: "0 0 24px" }}>
              <img src="/images/award-illustration.png" alt="" aria-hidden="true" style={{ width: "min(220px, 55vw)", opacity: 0.93 }} />
            </div>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", lineHeight: 1.85, maxWidth: 520, margin: "0 auto 44px" }}>
              At the end of the season, the community has voted. The top-rated venues in each category receive a framed plaque — designed, printed, and delivered by us. Hang it. Post it. It's yours.
            </p>
          </FadeIn>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginBottom: 48 }}>
            {WINE_PARTNER_AWARDS.map((award, i) => (
              <FadeIn key={award.name} delay={i * 60}>
                <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "10px 20px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{award.icon}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>{award.name}</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={400}>
            <div style={{ background: "rgba(212,132,90,0.1)", border: "1px solid rgba(212,132,90,0.22)", borderRadius: 14, padding: "24px 32px", maxWidth: 500, margin: "0 auto" }}>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 10 }}>A note from Daryl</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.85, margin: 0 }}>
                "These awards matter because the community chose them — not an algorithm, not a paid ranking. I want venues to be able to hang something on their wall that means something. That's the whole point."
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />

      {/* ── ZERO FRICTION ── */}
      <section style={{ background: C.cream, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>For the Record</SectionLabel>
            <SectionTitle center>What this costs you.</SectionTitle>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(56px, 10vw, 96px)", fontWeight: 700, color: C.sunset, margin: "8px 0 12px", lineHeight: 1 }}>$0</div>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 460, margin: "0 auto 44px" }}>
              No subscription. No platform fee. No dashboard to log into. You're already on the trail — we just want to help you get recognized for what you're building.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, textAlign: "left", maxWidth: 700, margin: "0 auto" }}>
            {WINE_PARTNER_FRICTIONLESS.map((item, i) => (
              <FadeIn key={item.label} delay={i * 60}>
                <div style={{ background: C.warmWhite, borderRadius: 12, padding: "20px 20px", border: `1px solid ${C.sand}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.sageDark, marginBottom: 4 }}>✓ {item.label}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{item.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />

      {/* ── CTA ── */}
      <section style={{ background: C.night, padding: "80px 24px 110px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light>Get Involved</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.25 }}>
              Ready for your QR kit?<br />Or just have thoughts?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 44 }}>
              We're building this with venues, not at them. If you want a QR kit for your counter — or if you have ideas that would make this work better — Daryl wants to hear it.
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <Btn href="mailto:admin@yetigroove.com?subject=QR Kit Request" variant="sunset" style={{ whiteSpace: "nowrap" }}>
                Request Your QR Kit →
              </Btn>
              <a
                href="mailto:admin@yetigroove.com?subject=Wine Trail Feedback"
                style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", letterSpacing: 0.5, transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
              >
                Have a suggestion? →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🌐  APP ROOT
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
