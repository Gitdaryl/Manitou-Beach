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
        100% { transform: scale(1.12) translate(-1.5%, -0.8%); }
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
      @media (max-width: 768px) {
        .nav-desktop { display: none !important; }
        .nav-hamburger { display: flex !important; }
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
// 🧭  NAV SECTIONS
// ============================================================
const SECTIONS = [
  { id: "home",       label: "Home" },
  { id: "happening",  label: "What's Happening" },
  { id: "explore",    label: "Explore" },
  { id: "businesses", label: "Local Businesses" },
  { id: "holly",      label: "Holly & The Yeti" },
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
    website: "",
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
    website: "https://www.hollygriewahn.com",
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

function SectionLabel({ children, light = false }) {
  return (
    <div style={{
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: 11,
      letterSpacing: 5,
      textTransform: "uppercase",
      color: light ? "rgba(255,255,255,0.5)" : C.sage,
      marginBottom: 14,
      fontWeight: 600,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, light = false, center = false }) {
  return (
    <h2 style={{
      fontFamily: "'Libre Baskerville', serif",
      fontSize: "clamp(28px, 4.5vw, 46px)",
      fontWeight: 400,
      color: light ? C.cream : C.text,
      margin: "0 0 18px 0",
      lineHeight: 1.2,
      textAlign: center ? "center" : "left",
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

function Btn({ children, onClick, href, variant = "primary", small = false }) {
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
      className="btn-animated"
      style={{ ...base, ...styles[variant] }}
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
            const href = event.isPromoted && event.eventUrl ? event.eventUrl : "/happening";
            return (
              <a key={event.id || i} href={href} target={event.isPromoted && event.eventUrl ? "_blank" : undefined} rel={event.isPromoted ? "noopener noreferrer" : undefined} style={{ textDecoration: "none" }}>
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
              </a>
            );
          })}
        </div>
      </div>
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
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "180px 40px 1fr",
                  alignItems: "flex-start",
                  marginBottom: i < preview.length - 1 ? 48 : 0,
                  gap: 0,
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
                  <div>
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

function HappeningSubmitCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", date: "", time: "", location: "", description: "", eventUrl: "", email: "", phone: "", cost: "" });

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

          {submitError && <div style={{ fontSize: 13, color: "#ff6b6b", fontFamily: "'Libre Franklin', sans-serif" }}>{submitError}</div>}

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <button type="submit" disabled={submitting} style={{ padding: "13px 32px", background: C.sunset, color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, transition: "all 0.2s" }}>
              {submitting ? "Submitting..." : "Submit Free Listing"}
            </button>
            <a href="/promote" style={{ fontSize: 13, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", opacity: 0.8 }}>
              Want paid promotion? →
            </a>
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
  const tiers = [
    {
      name: "Free",
      price: "Free",
      period: "forever",
      color: C.driftwood,
      badge: null,
      features: [
        "Name in business directory",
        "Category & phone number",
        "Community visibility",
      ],
      cta: "Get Listed",
    },
    {
      name: "Bronze",
      price: "$9",
      period: "/ month",
      color: "#CD8B3A",
      badge: null,
      features: [
        "Everything in Free",
        "Clickable website link",
        "Business description",
        "Expandable listing card",
      ],
      cta: "Get Started",
    },
    {
      name: "Silver",
      price: "$17",
      period: "/ month",
      color: "#A8A9AD",
      badge: "Popular",
      features: [
        "Everything in Bronze",
        "Spotlight card placement",
        "Logo or photo display",
        "Above standard listings",
      ],
      cta: "Get Started",
    },
    {
      name: "Gold",
      price: "$34",
      period: "/ month",
      color: C.sunsetLight,
      badge: "Best Visibility",
      features: [
        "Everything in Silver",
        "Full-width banner ad",
        "Large logo (110×110)",
        "Top-of-directory placement",
        "Email contact button",
      ],
      cta: "Get Started",
    },
  ];

  return (
    <div id="listing-tiers" style={{ background: C.night, padding: "80px 24px 72px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 14 }}>
            List Your Business
          </div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 400, color: C.cream, margin: "0 0 14px 0" }}>
            Choose Your Visibility
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, maxWidth: 460, margin: "0 auto" }}>
            Get discovered by the Manitou Beach community. Start free, upgrade anytime.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {tiers.map(tier => (
            <div key={tier.name} style={{
              background: tier.badge ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${tier.badge ? tier.color + "45" : "rgba(255,255,255,0.09)"}`,
              borderRadius: 16,
              padding: "28px 22px 28px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}>
              {tier.badge && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: tier.color, color: C.night,
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: 2, textTransform: "uppercase",
                  padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap",
                }}>
                  {tier.badge}
                </div>
              )}

              <div style={{ color: tier.color, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                {tier.name}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 22 }}>
                <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 34, color: C.cream, fontWeight: 700 }}>{tier.price}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>{tier.period}</span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flexGrow: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                {tier.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <span style={{ color: tier.color, fontSize: 13, marginTop: 2, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.58)", fontSize: 13, lineHeight: 1.45 }}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#submit"
                style={{
                  display: "block", textAlign: "center",
                  padding: "10px 0", borderRadius: 8,
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700,
                  letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none",
                  background: tier.name === "Gold" ? C.sunset : "transparent",
                  color: tier.name === "Gold" ? C.cream : tier.color,
                  border: `1.5px solid ${tier.name === "Gold" ? "transparent" : tier.color + "55"}`,
                  transition: "all 0.22s ease",
                }}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 28, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
          Monthly pricing · Annual plans available · Contact us to get listed
        </p>
      </div>
    </div>
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
            <Btn href="#submit" variant="outline" small>+ List Your Business (Free)</Btn>
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
            <Btn href="#submit" variant="sunset">Upgrade Your Listing</Btn>
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

      {/* Free tier — no website link. Upgrade to Bronze+ to unlock. */}
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
                <Btn href="https://www.youtube.com/@HollyandtheYetipodcast" variant="sunset">Watch on YouTube</Btn>
                <Btn href="https://www.facebook.com/HollyandtheYeti" variant="outlineLight">Facebook</Btn>
                <Btn href="https://m.me/HollyandtheYeti" variant="outlineLight">Message Holly</Btn>
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

        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
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
  const [tab, setTab] = useState("business");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", phone: "", address: "", website: "", email: "", description: "", logoUrl: "", tier: "Free", duration: "1", newsletter: false, date: "", time: "", location: "", eventUrl: "" });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      let imageUrl = null;

      // Upload event image (event tab)
      if (tab === "event" && imageFile) {
        const { base64, filename } = await compressImage(imageFile);
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64, filename, contentType: "image/jpeg" }),
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) imageUrl = uploadData.url;
      }

      // Upload business logo (business tab) — compressed square-friendly
      let logoUploadUrl = null;
      if (tab === "business" && logoFile) {
        const { base64, filename } = await compressImage(logoFile, 600, 0.85);
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64, filename: `logo-${filename}`, contentType: "image/jpeg" }),
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) logoUploadUrl = uploadData.url;
      }

      const endpoint = tab === "business" ? "/api/businesses" : "/api/events";
      const payload = tab === "event"
        ? { name: form.name, category: form.category, date: form.date, time: form.time, location: form.location, email: form.email, phone: form.phone, description: form.description, eventUrl: form.eventUrl, imageUrl }
        : { ...form, logoUrl: logoUploadUrl || null };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

          {/* Tab switcher */}
          <div style={{ display: "flex", background: C.sand, borderRadius: 8, padding: 4, marginBottom: 36, width: "fit-content" }}>
            {[{ key: "business", label: "Business" }, { key: "event", label: "Event" }].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 13, fontWeight: 600,
                  padding: "9px 24px",
                  borderRadius: 6,
                  border: "none",
                  background: tab === t.key ? C.cream : "transparent",
                  color: tab === t.key ? C.text : C.textMuted,
                  cursor: "pointer",
                  boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

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
                {tab === "business" ? "You're in the directory." : "Event submitted."}
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 28px 0", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                {tab === "business"
                  ? "We review every submission before it goes live — usually within 48 hours. If you're interested in an upgraded listing, we'll reach out with details."
                  : "We'll review your event and have it on the calendar within 48 hours. Keep an eye on the What's Happening section."}
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
              {tab === "business" ? (
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
                    <option>Real Estate</option>
                    <option>Food & Drink</option>
                    <option>Boating & Water</option>
                    <option>Breweries & Wineries</option>
                    <option>Shopping & Gifts</option>
                    <option>Stays & Rentals</option>
                    <option>Creative Media</option>
                    <option>Home Services</option>
                    <option>Health & Beauty</option>
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
                      <option value="Bronze">Bronze — $9/mo · + Website link & description</option>
                      <option value="Silver">Silver — $17/mo · + Spotlight card & logo</option>
                      <option value="Gold">Gold — $34/mo · + Full banner & top placement</option>
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
                        Total: ${({ Free: 0, Bronze: 9, Silver: 17, Gold: 34 }[form.tier] * parseInt(form.duration)).toLocaleString()} · We'll confirm and invoice before going live
                      </div>
                    </div>
                  )}

                  {/* Logo upload — drag & drop, compressed, Vercel Blob */}
                  <div>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 8, letterSpacing: 0.5 }}>
                      Logo (optional · used for Silver & Gold tiers)
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
              ) : (
                <>
                  {input("name", "Event Name")}
                  {input("category", "Event Type (e.g. Community, Market, Music)")}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {input("date", "Event Date", "date")}
                    {input("time", "Time (e.g. 6:00 PM)")}
                  </div>
                  {input("location", "Location / Venue")}
                  {input("eventUrl", "Event Link (Facebook event, website, etc.)")}
                  {input("email", "Your Email", "email")}
                  {input("phone", "Phone (optional)", "tel")}
                  <textarea
                    placeholder="Event description — what people can expect"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 6,
                      border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 14, color: C.text, background: C.cream,
                      resize: "vertical", boxSizing: "border-box", outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = C.sage}
                    onBlur={e => e.target.style.borderColor = C.sand}
                  />
                  {/* Image upload with drag & drop */}
                  <div
                    onDragEnter={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (!file || !file.type.startsWith("image/")) return;
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setImagePreview(ev.target.result);
                      reader.readAsDataURL(file);
                    }}
                    style={{
                      border: `1.5px dashed ${isDragging ? C.sage : C.sand}`,
                      borderRadius: 8, padding: "16px",
                      background: isDragging ? "rgba(122,142,114,0.06)" : C.cream,
                      textAlign: "center", transition: "all 0.2s",
                    }}
                  >
                    {imagePreview ? (
                      <div style={{ position: "relative" }}>
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 6, objectFit: "cover" }} />
                        <button
                          type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                          style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 12, lineHeight: 1 }}
                        >×</button>
                      </div>
                    ) : (
                      <label style={{ cursor: "pointer", display: "block" }}>
                        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, marginBottom: 4 }}>
                          {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, opacity: 0.6 }}>
                          JPG, PNG, HEIC — any size
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                      </label>
                    )}
                  </div>
                </>
              )}

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
                {submitting ? "Sending…" : `Submit ${tab === "business" ? "Business" : "Event"}`}
              </button>

              {submitError && (
                <p style={{ fontSize: 13, color: "#c0392b", textAlign: "center", margin: 0 }}>{submitError}</p>
              )}

              <p style={{ fontSize: 11, color: C.textMuted, textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                Free listings are reviewed within 48 hours. No spam, no fees unless you upgrade.
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
                <a href="#" style={{ fontSize: 12, fontWeight: 700, color: C.lakeBlue, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif" }}>
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
function Footer({ scrollTo }) {
  return (
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
              { label: "Newsletter", href: "#submit" },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 8 }}>
                <a
                  href={l.href}
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", fontFamily: "'Libre Franklin', sans-serif", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = C.sunsetLight}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                >
                  {l.label}
                </a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              For Businesses
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.75, margin: "0 0 16px 0" }}>
              Free directory listing. Upgrade for featured placement, newsletter mentions, and video content.
            </p>
            <a
              href="#submit"
              style={{
                display: "inline-block",
                fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: 2,
                textTransform: "uppercase",
                padding: "9px 20px",
                borderRadius: 4,
                background: `${C.sage}25`,
                border: `1px solid ${C.sage}40`,
                color: C.sage,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Get Listed
            </a>
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
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif" }}>
            © {new Date().getFullYear()} Yeti Groove Media LLC
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
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
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
        background: solid ? "rgba(250,246,239,0.20)" : "transparent",
        backdropFilter: solid ? "blur(28px) saturate(180%)" : "none",
        WebkitBackdropFilter: solid ? "blur(28px) saturate(180%)" : "none",
        borderBottom: solid ? "1px solid rgba(255,255,255,0.15)" : "none",
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }} onClick={() => handleNavClick("home")}>
            <img src="/images/manitou_beach_icon.png" alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", opacity: solid ? 1 : 0.85, transition: "opacity 0.35s" }} />
            <div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: C.cream, transition: "color 0.35s" }}>
                Manitou Beach
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: -2, transition: "color 0.35s" }}>
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
                  color: activeSection === id ? C.sageDark : "rgba(255,255,255,0.7)",
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
                onMouseEnter={e => { e.currentTarget.style.color = C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
                onMouseLeave={e => { e.currentTarget.style.color = activeSection === id ? C.sageDark : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = activeSection === id ? `${C.sage}18` : "transparent"; }}
              >
                {label}
              </button>
            ))}
            {/* Dispatch link */}
            <button
              onClick={() => { window.location.href = "/dispatch"; }}
              style={{
                background: "transparent", border: "none",
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: 0.5, padding: "7px 13px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
            >
              Dispatch
            </button>

            {/* Promote link — accent styled */}
            <button
              onClick={() => { window.location.href = "/promote"; }}
              style={{
                background: solid ? `${C.sunset}12` : `${C.sunset}22`,
                border: `1px solid ${C.sunset}40`,
                color: solid ? C.sunset : C.sunsetLight,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700,
                letterSpacing: 0.5, padding: "7px 14px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.sunset; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = C.sunset; }}
              onMouseLeave={e => { e.currentTarget.style.background = solid ? `${C.sunset}12` : `${C.sunset}22`; e.currentTarget.style.color = solid ? C.sunset : C.sunsetLight; e.currentTarget.style.borderColor = `${C.sunset}40`; }}
            >
              ★ Promote
            </button>

            {/* Community dropdown */}
            <div ref={comRef} style={{ position: "relative" }}>
              <button
                onClick={() => setComOpen(o => !o)}
                style={{
                  background: comOpen ? `${C.sage}18` : "transparent",
                  border: "none", color: "rgba(255,255,255,0.7)",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: 0.5,
                  padding: "7px 13px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
                onMouseLeave={e => { if (!comOpen) { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; } }}
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
                    { label: "Devils Lake", id: "devils-lake" },
                    { label: "Round Lake", href: "/round-lake" },
                    { label: "The Village", href: "/village" },
                    { label: "Wineries & Breweries", href: "/wineries" },
                    { label: "Men's Club", id: "mens-club" },
                    { label: "Ladies Club", id: "ladies-club" },
                    { label: "Historical Society", id: "historical-society" },
                    { label: "Gallery ↗", href: "https://photogallery.yetigroove.com/folder/muVgmuXuvFwI/" },
                  ].map((link, i) => (
                    link.href ? (
                      <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{
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
            <div style={{ marginLeft: 8 }}>
              <Btn onClick={() => handleNavClick("submit")} variant="primary" small>List Your Business</Btn>
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
        {/* Dispatch link — mobile */}
        <button onClick={() => { setMenuOpen(false); window.location.href = "/dispatch"; }} style={{
          background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
          fontSize: 24, fontWeight: 400, color: C.text, cursor: "pointer", padding: "12px 32px",
        }}>
          Dispatch
        </button>

        {/* Community sub-links */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginTop: 8, fontFamily: "'Libre Franklin', sans-serif" }}>Community</div>
        {[
          { label: "Devils Lake", id: "devils-lake" },
          { label: "Men's Club", id: "mens-club" },
          { label: "Ladies Club", id: "ladies-club" },
          { label: "Historical Society", id: "historical-society" },
        ].map(link => (
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
        <div style={{ marginTop: 16 }}>
          <Btn onClick={() => handleNavClick("submit")} variant="primary">List Your Business</Btn>
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
      <HappeningSubmitCTA />
      <Footer scrollTo={subScrollTo} />
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </div>
  );
}

// ============================================================
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
      <EventTicker />
      <NewsletterBar />
      <WaveDivider topColor={C.dusk} bottomColor={C.dusk} />
      <HappeningSection />
      <PromoBanner page="Home" />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />
      <ExploreSection />
      <NewsletterInline />
      <div style={{ textAlign: "center", padding: "8px 24px 40px" }}>
        <Btn onClick={() => window.open("https://maps.google.com/?q=Manitou+Beach+Michigan+49267", "_blank")} variant="dark">Get Directions</Btn>
      </div>
      <BusinessDirectory />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.night} />
      <HollyYetiSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <LivingSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <SubmitSection />
      <PricingSection />
      <AboutSection />
      <Footer scrollTo={scrollTo} />
    </div>
  );
}

// ============================================================
// 🌊  ROUND LAKE PAGE
// ============================================================
const ROUND_LAKE_STATS = [
  { label: "Surface Area", value: "925 acres" },
  { label: "Max Depth", value: "70 feet" },
  { label: "Elevation", value: "~1,043 ft" },
  { label: "Water Clarity", value: "Very clear" },
  { label: "Origin", value: "Glacial kettle lake" },
  { label: "Watershed", value: "Bean Creek" },
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
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.sunsetLight, fontWeight: 400, marginBottom: 8, lineHeight: 1.2 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={400}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", lineHeight: 1.7, marginTop: 32, maxWidth: 600, fontFamily: "'Libre Franklin', sans-serif" }}>
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

        {/* Watercraft notice */}
        <FadeIn delay={100}>
          <div style={{
            background: `${C.lakeBlue}10`, border: `1px solid ${C.lakeBlue}25`, borderRadius: 12,
            padding: "16px 24px", marginBottom: 48, display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>ℹ️</span>
            <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
              <strong style={{ color: C.text }}>Watercraft notice:</strong> Water skiing and towing of persons on water skis, surfboards, or similar devices is prohibited on Round Lake (DNR local watercraft control — Cambridge & Franklin Townships, Lenawee County).
            </div>
          </div>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { title: "Part of Manitou Beach", desc: "Same post office (49253), same schools (Onsted Community), same township (Rollin). Round Lake and Devils Lake share a census-designated place — officially Manitou Beach-Devils Lake." },
            { title: "Connected by Water", desc: "A shallow channel at Cherry Point links Round Lake to Devils Lake. Too shallow for boats today — but during the resort era, steam launches navigated it carrying tourists between the lakes." },
            { title: "Geneva", desc: "The unincorporated community of Geneva sits at the south end of Round Lake. A quiet cluster of homes with its own identity within the broader Manitou Beach area." },
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
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <RoundLakeCommunitySection />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />
      <NewsletterInline />
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 48 }}>
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
            <Btn href="/#submit" variant="outlineLight">List Your Business</Btn>
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
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// ⭐  FEATURED BUSINESS — SALES PAGE + STRIPE CHECKOUT
// ============================================================
const FEATURED_TIERS = [
  {
    id: "featured_30",
    name: "Starter",
    period: "30 days",
    price: "$50",
    earlyBird: "$29",
    priceNum: 2900,
    features: [
      "Premium dark card with shimmer effect",
      "Logo + business link displayed",
      "Top placement in directory",
      "Phone number visible to visitors",
    ],
  },
  {
    id: "featured_90",
    name: "Season Pass",
    period: "90 days",
    price: "$150",
    earlyBird: "$79",
    priceNum: 7900,
    save: "Save 47%",
    features: [
      "Everything in Starter",
      "Full season of visibility",
      "Featured in newsletter shoutout",
      "Priority placement over Starter",
    ],
    popular: true,
  },
  {
    id: "featured_video_30",
    name: "Spotlight",
    period: "30 days",
    price: "$300",
    earlyBird: "$149",
    priceNum: 14900,
    features: [
      "Everything in Season Pass",
      "Cinematic video produced by Yeti Groove",
      "Holly & Yeti podcast mention",
      "Social media feature across channels",
    ],
  },
];

const SPOTS_TOTAL = 8;

function FeaturedPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const [form, setForm] = useState({ businessName: "", email: "", phone: "", website: "" });
  const [selectedTier, setSelectedTier] = useState("featured_90");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const spotsLeft = 5; // TODO: fetch from Notion or a counter

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setStatus({ type: "success", business: params.get("business") || "" });
    else if (params.get("cancelled")) setStatus({ type: "cancelled" });
  }, []);

  const handleCheckout = async (tierId) => {
    if (!form.businessName || !form.email) {
      setStatus({ type: "error", message: "Business name and email are required." });
      document.getElementById("featured-form")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId, businessName: form.businessName, email: form.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setStatus({ type: "error", message: data.error || "Something went wrong." });
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    }
    setLoading(false);
  };

  const benefits = [
    { icon: "⚡", title: "Top Placement", desc: "Featured businesses appear first — above every free listing in the directory." },
    { icon: "🎨", title: "Premium Card Design", desc: "Dark card with shimmer effect, your logo prominently displayed, and a direct link to your website." },
    { icon: "📱", title: "Click-to-Call", desc: "Your phone number displayed and clickable on mobile — customers call you directly from the listing." },
    { icon: "🎬", title: "Spotlight Video", desc: "Upgrade to Spotlight and get a cinematic video produced by Yeti Groove Media, embedded right in your listing." },
    { icon: "📰", title: "Newsletter Feature", desc: "Season Pass and Spotlight tiers include a shoutout in The Manitou Beach Dispatch — our community newsletter." },
    { icon: "🎙️", title: "Holly & Yeti Mention", desc: "Spotlight tier businesses get mentioned on the Holly & Yeti podcast — reaching the broader Devils Lake audience." },
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
            Early Bird Pricing — Limited Spots
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 400, color: C.cream, lineHeight: 1, margin: "0 0 20px 0" }}>
            Put Your Business<br />in the Spotlight
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 28px" }}>
            Manitou Beach is growing. The businesses who get in early get seen first — and remembered longest.
          </p>
          {/* Urgency bar */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", borderRadius: 30, padding: "10px 24px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: SPOTS_TOTAL }).map((_, i) => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < spotsLeft ? C.sunset : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: C.sunsetLight, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
              {spotsLeft} of {SPOTS_TOTAL} early bird spots left
            </span>
          </div>
        </FadeIn>
      </section>

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
              <SectionLabel>What You Get</SectionLabel>
              <SectionTitle center>More Than a Listing</SectionTitle>
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

      {/* Pricing tiers */}
      <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <SectionLabel>Early Bird Pricing</SectionLabel>
              <SectionTitle center>Choose Your Plan</SectionTitle>
              <p style={{ fontSize: 14, color: C.textLight, maxWidth: 440, margin: "12px auto 0", lineHeight: 1.7 }}>
                Lock in early bird rates now. Prices go up as spots fill.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURED_TIERS.map((tier, i) => {
              const isSelected = selectedTier === tier.id;
              return (
                <FadeIn key={tier.id} delay={i * 100} direction="scale">
                  <div
                    onClick={() => setSelectedTier(tier.id)}
                    style={{
                      background: isSelected ? `linear-gradient(145deg, ${C.dusk}, ${C.night})` : C.cream,
                      border: tier.popular ? `2px solid ${C.sunset}` : `1px solid ${isSelected ? "rgba(255,255,255,0.15)" : C.sand}`,
                      borderRadius: 16, padding: "32px 28px",
                      cursor: "pointer", transition: "all 0.25s",
                      position: "relative", overflow: "hidden",
                      transform: isSelected ? "scale(1.02)" : "none",
                      boxShadow: isSelected ? "0 16px 48px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    {tier.popular && (
                      <div style={{
                        position: "absolute", top: 16, right: -26,
                        background: C.sunset, color: C.cream,
                        fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                        padding: "4px 36px", transform: "rotate(45deg)",
                        fontFamily: "'Libre Franklin', sans-serif",
                      }}>Most Popular</div>
                    )}
                    {isSelected && <div style={{ position: "absolute", top: 14, left: 14, width: 18, height: 18, borderRadius: "50%", background: C.sunset, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.cream }}>✓</div>}

                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: isSelected ? C.sunsetLight : C.sage, marginBottom: 10 }}>
                      {tier.name}
                    </div>

                    {/* Prices — show strikethrough + early bird */}
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, color: isSelected ? "rgba(255,255,255,0.25)" : C.textMuted, textDecoration: "line-through", marginRight: 10 }}>
                        {tier.price}
                      </span>
                      <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 38, fontWeight: 400, color: isSelected ? C.cream : C.text }}>
                        {tier.earlyBird}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: isSelected ? "rgba(255,255,255,0.4)" : C.textMuted, marginBottom: tier.save ? 4 : 14 }}>
                      for {tier.period}
                    </div>
                    {tier.save && (
                      <div style={{ display: "inline-block", fontSize: 11, color: C.cream, fontWeight: 700, background: C.sunset, padding: "3px 10px", borderRadius: 12, marginBottom: 14 }}>{tier.save}</div>
                    )}

                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {tier.features.map((f, j) => (
                        <li key={j} style={{ fontSize: 13, color: isSelected ? "rgba(255,255,255,0.5)" : C.textLight, lineHeight: 1.5, padding: "4px 0", paddingLeft: 20, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: C.sage }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={e => { e.stopPropagation(); handleCheckout(tier.id); }}
                      className="btn-animated"
                      style={{
                        width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 8,
                        cursor: "pointer",
                        fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                        background: isSelected ? C.sunset : "transparent",
                        color: isSelected ? C.cream : C.sage,
                        border: isSelected ? "none" : `1.5px solid ${C.sand}`,
                      }}
                    >
                      {loading && isSelected ? "Redirecting..." : `Get ${tier.name} — ${tier.earlyBird}`}
                    </button>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form */}
      <section id="featured-form" style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Your Details</SectionLabel>
            <SectionTitle>Claim Your Spot</SectionTitle>
            <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, marginBottom: 32 }}>
              Fill in your info below, then hit the checkout button on your chosen plan above. Your listing goes live within 24 hours.
            </p>
          </FadeIn>

          {status?.type === "error" && (
            <div style={{ background: `${C.sunset}15`, border: `1px solid ${C.sunset}40`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: C.sunset }}>
              {status.message}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { key: "businessName", label: "Business Name", type: "text", placeholder: "e.g. Boot Jack Tavern" },
              { key: "email", label: "Email", type: "email", placeholder: "you@yourbusiness.com" },
              { key: "phone", label: "Phone (optional)", type: "tel", placeholder: "(517) 555-0000" },
              { key: "website", label: "Website (optional)", type: "text", placeholder: "www.yourbusiness.com" },
            ].map(field => (
              <div key={field.key}>
                <label style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: C.textMuted, display: "block", marginBottom: 6 }}>
                  {field.label} {(field.key === "businessName" || field.key === "email") && <span style={{ color: C.sunset }}>*</span>}
                </label>
                <input
                  type={field.type} value={form[field.key]} placeholder={field.placeholder}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
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
          </div>

          <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginTop: 20, textAlign: "center" }}>
            Secure checkout by Stripe. No recurring charges — one-time payment for your chosen period. Questions? Email hello@manitoubeach.com
          </p>
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
            { q: "What happens when my featured period ends?", a: "Your listing reverts to the free directory. No recurring charges, no surprises. You can renew anytime." },
            { q: "Can I change my listing details after I pay?", a: "Absolutely. Email us and we'll update your logo, description, phone number, or link within 24 hours." },
            { q: "What's the Holly & Yeti podcast mention?", a: "Spotlight tier businesses get a shoutout on the Holly & Yeti community podcast, reaching the broader Devils Lake and Irish Hills audience." },
            { q: "Why are prices so low right now?", a: "We're building the platform and want founding businesses on board. Early bird rates are locked in for your booking period. As traffic grows and spots fill, prices return to full rate." },
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
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
            <SectionLabel style={{ color: C.sunsetLight }}>Annual Calendar</SectionLabel>
            <SectionTitle center style={{ color: C.cream }}>Events & Fundraisers</SectionTitle>
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
  },
  {
    image: "/images/historical/car-show.jpg",
    title: "Classic Car Shows",
    desc: "Bringing car show enthusiasts together in the Village for community celebrations of automotive history and local culture.",
  },
  {
    image: "/images/historical/conservation.jpg",
    title: "Land & Water Conservation",
    desc: "Active stewardship projects to protect and restore the natural environment around Devils Lake and the surrounding watershed.",
  },
  {
    image: "/images/historical/restoration.jpg",
    title: "Village Restoration",
    desc: "Ongoing renovation projects to restore historic buildings and infrastructure in Manitou Beach Village, preserving the area's architectural heritage.",
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
                  { label: "Size", value: "925 acres" },
                  { label: "Depth", value: "70 ft max" },
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
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🍷  WINERIES PAGE (/wineries)
// ============================================================
const WINERY_VENUES = [
  {
    name: "Chateau Aeronautique Winery",
    type: "Winery & Entertainment Venue",
    tagline: "Aviation-themed. All-weather Biergarten. Live tribute concerts every weekend.",
    address: "1849 E Parnall Rd, Jackson",
    phone: "(517) 795-3620",
    website: "https://chateauaeronautique.com",
    logo: "/images/chateau_logo.png",
    accent: C.sunset,
    highlight: "Live music every weekend + Michigan-crafted wines",
    distance: "20 min from Manitou Beach",
  },
  {
    name: "Cherry Creek Cellars",
    type: "Small-Batch Winery",
    tagline: "Brooklyn's neighborhood winery — small-batch Michigan wines, laid-back tasting room.",
    address: "5765 Wamplers Lake Rd, Brooklyn",
    phone: "(517) 592-4315",
    website: "https://cherrycreekcellars.com",
    logo: null,
    accent: C.sage,
    highlight: "Also poured at Faust House in the Village",
    distance: "15 min from Manitou Beach",
  },
  {
    name: "Gypsy Blue Vineyards",
    type: "Vineyard (Coming Soon)",
    tagline: "A new vineyard bringing Michigan wine culture to the heart of the Irish Hills.",
    address: "Irish Hills Area",
    phone: null,
    website: "https://michigangypsy.com",
    logo: null,
    accent: C.lakeBlue,
    highlight: "Opening soon — watch this space",
    distance: "Irish Hills",
  },
  {
    name: "Ang & Co",
    type: "Satellite Tasting Room · Village",
    tagline: "Dirty sodas, custom apparel, curated gifts — and Michigan wine from Chateau Fontaine (Leelanau Peninsula).",
    address: "141 N. Lakeview Blvd., Manitou Beach",
    phone: "(517) 547-6030",
    website: "https://www.angandco.net",
    logo: "/images/ang_co_logo.png",
    accent: C.sunsetLight,
    highlight: "Right in the Village — walk from the lake",
    distance: "In the Village",
  },
  {
    name: "Faust House Scrap n Craft",
    type: "Satellite Tasting Room · Village",
    tagline: "Scrapbooking, crafts, and satellite wine tasting for Cherry Creek Cellars right on Lakeview Blvd.",
    address: "140 N Lakeview Blvd., Manitou Beach",
    phone: "(517) 403-1788",
    website: "https://fausthousescrapncraft.com",
    logo: "/images/faust_house_logo.png",
    accent: "#8B5E3C",
    highlight: "Cherry Creek Cellars in the Village",
    distance: "In the Village",
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
          <div style={{ fontSize: 36, marginBottom: 16 }}>🍷</div>
          <SectionLabel light>Coming May 2026</SectionLabel>
          <SectionTitle light>Satellite Tasting Rooms in the Village</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 32px" }}>
            Starting May 2026, Manitou Beach Village shops become satellite tasting rooms for Michigan wineries. Walk the boulevard, pop into Ang & Co for a Leelanau Peninsula pour, and discover Cherry Creek Cellars at Faust House — all within steps of the lake.
          </p>
          <Btn href="/village" variant="sunset">Explore the Village</Btn>
        </FadeIn>
      </div>
    </section>
  );
}

function WineriesVenueSection() {
  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>The Wine Trail</SectionLabel>
          <SectionTitle>Wineries & Tasting Rooms</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 0 56px 0" }}>
            Five places to taste Michigan wine — two right in the Village, three worth the short drive into the Irish Hills.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {WINERY_VENUES.map((v, i) => (
            <FadeIn key={i} delay={i * 80} direction={i % 2 === 0 ? "left" : "right"}>
              <div
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
                  <img src={v.logo} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", flexShrink: 0, background: C.sand }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: 0 }}>{v.name}</h3>
                    <span style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.textMuted, background: C.sand, padding: "4px 10px", borderRadius: 20 }}>{v.distance}</span>
                  </div>
                  <div style={{ fontSize: 11, color: v.accent, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>{v.type}</div>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 14px 0" }}>{v.tagline}</p>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    {v.address && <span style={{ fontSize: 12, color: C.textMuted }}>📍 {v.address}</span>}
                    {v.phone && <span style={{ fontSize: 12, color: C.textMuted }}>📞 {v.phone}</span>}
                  </div>
                  {v.highlight && (
                    <div style={{ marginTop: 12, fontSize: 12, color: v.accent, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>
                      ✦ {v.highlight}
                    </div>
                  )}
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
          <SectionTitle light>Build Your Wine Trail Day</SectionTitle>
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
      <WineriesVenueSection />
      <DiagonalDivider topColor={C.cream} bottomColor={C.dusk} />
      <WineriesCTASection />
      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
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
  { label: "Public Launch", value: "Yes — Manitou Rd" },
  { label: "Connected To", value: "Round Lake" },
  { label: "Boat Slips", value: "600+" },
];

const DEVILS_LAKE_TIMELINE = [
  { year: "Pre-1830", event: "Potawatomi and Ojibwa people camp along the shores of Devils Lake during summer — the lake's name comes from a mispronunciation of the tribal word for the area." },
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
          Source: <a href="https://fisherman.org" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>fisherman.org</a>
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
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 0 56px 0" }}>
            Devils Lake has been drawing people in for over 150 years. From railroad-era grand hotels to the annual Tip-Up Festival on the ice — the history runs deep.
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
                  <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.6, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{fish.desc}</p>
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
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <DevilsLakeCommunitySection />
      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
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
  { id: "event_spotlight", label: "Event Spotlight",        detail: "Featured Listing",   price: "$25",  fullPrice: "$49",
    desc: "Your event in the calendar with a photo and a ticket button.",
    plain: "Instead of just a line of text like the free listings, yours shows up with a photo and a big 'Get Tickets' button. Stands out." },
  { id: "hero_7d",         label: "Hero Feature",           detail: "7 Days",             price: "$75",  fullPrice: "$149",
    desc: "The first thing anyone sees when they visit the site — full screen, your event, for 7 days.",
    plain: "Picture the front page of a newspaper. That's your event, full size, the moment anyone opens the website. Every visitor sees it first, for a whole week." },
  { id: "hero_30d",        label: "Hero Feature",           detail: "30 Days",            price: "$249", fullPrice: "$499",
    desc: "Own the front of the site for a full month.",
    plain: "Same front-page treatment as the 7-day option — just for a whole month. Great for building buzz leading up to a big event." },
  { id: "newsletter",      label: "Newsletter Feature",     detail: "1 Issue",            price: "$39",  fullPrice: "$79",
    desc: "Top spot in the next Manitou Beach Dispatch email — before anyone scrolls.",
    plain: "A big beautiful announcement at the very top of our weekly email. The whole community sees it in their inbox before they read anything else." },
  { id: "banner_1p",       label: "Page Feature Banner",    detail: "1 Page · 30 Days",  price: "$29",  fullPrice: "$59",
    desc: "A wide banner for your event sitting in the middle of whichever page your crowd visits most.",
    plain: "Like a billboard, but on the website. Pick the page where your people hang out — Fishing, Wineries, Devils Lake — and your banner is right there for 30 days." },
  { id: "banner_3p",       label: "Page Feature Banner",    detail: "3 Pages · 30 Days", price: "$69",  fullPrice: "$129",
    desc: "Same billboard treatment, but on three different pages at once.",
    plain: "Cover more ground — your banner shows up on three pages across the site. Catch people wherever they're browsing." },
  { id: "strip_pin",       label: "Featured Strip Pin",     detail: "30 Days",            price: "$19",  fullPrice: "$39",
    desc: "First spot in the 'Coming Up' list on the homepage — right below the big banner.",
    plain: "There's a scrolling list of upcoming events near the top of the home page. Your event goes first on that list for 30 days. Hard to scroll past." },
  { id: "holly_yeti",      label: "Holly & Yeti Spotlight", detail: "30 Days",            price: "$179", fullPrice: "$350",
    desc: "Holly and The Yeti make a short video about your event or business. Lives on the site for 30 days.",
    plain: "We come out, shoot a short video, and it lives on the website for a month. We share it on social too. It's the kind of thing people actually watch." },
  { id: "spotlight",       label: "Full Launch Bundle",     detail: "Best Value",         price: "$149", fullPrice: "$299",
    desc: "Front page of the site for 7 days + top of the newsletter + featured calendar listing. All three at once.",
    plain: "The whole shebang. Front page of the website, top of the email, featured in the calendar. Maximum coverage — and you save $55 doing it this way.", badge: "Best Value" },
];

const PROMO_PAGES = ["Home", "Whats Happening", "Village", "Devils Lake", "Wineries", "Fishing", "Round Lake"];

function PromotePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get("success") === "true";
  const isCancelled = params.get("cancelled") === "true";
  const successEvent = params.get("event") || "";

  const [form, setForm] = useState({ eventName: "", email: "", tier: "banner_1p", promoPages: [], notes: "" });
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
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 400, color: C.cream, margin: "0 0 20px 0", lineHeight: 1.15 }}>
          Promote Your Event
        </h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, maxWidth: 580, margin: "0 auto 0" }}>
          Manitou Beach is where the community gathers. Put your event front and centre — on the hero, in the newsletter, or on the pages your audience already visits.
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
                  {PROMOTE_PACKAGES.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.label} — {pkg.detail} — {pkg.price}</option>
                  ))}
                </select>
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
                {loading ? "Redirecting to Checkout…" : `Purchase — ${selectedPkg?.price || ""}`}
              </button>

              <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", lineHeight: 1.6, margin: 0 }}>
                Secure checkout via Stripe. After payment, you'll receive a confirmation and your promotion will go live within 24 hours.
                <br />Questions? <a href="mailto:holly@foundationrealty.com" style={{ color: C.lakeBlue }}>Email Holly</a>
              </p>
            </div>
          </div>
        </section>
      )}

      <WaveDivider topColor={C.cream} bottomColor={C.night} />
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
  'Seasonal Tips':   C.sage,
  'Community News':  C.sunset,
  'Hollys Corner':   '#C06FA0',
  'Events':          '#E07B39',
  'Local History':   '#8B7355',
  'PSA':             '#C0392B',
  'Advertorial':     '#7D6EAA',
};

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
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/dispatch-articles?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { setArticle(d.article || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

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

              <DispatchArticleContent content={article.content} />

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

              <div style={{ marginTop: 60, padding: '32px', background: C.night, borderRadius: 14, textAlign: 'center' }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.warmWhite, marginBottom: 8 }}>Enjoying The Dispatch?</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>Get lake life news, local tips, and a little Yeti wisdom delivered to your inbox.</p>
                <button onClick={() => subScrollTo('submit')} style={{ background: C.sunset, color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                  Subscribe Free
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

function DispatchPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/dispatch-articles')
      .then(r => r.json())
      .then(d => { setArticles(d.articles || []); setLoading(false); })
      .catch(() => setLoading(false));
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
        backgroundImage: 'url(/images/dispatch-header.jpg)',
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

      {/* Articles Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.sage }}>Loading the latest…</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: C.sage, marginBottom: 8 }}>First issue coming soon.</p>
            <p style={{ color: '#888', fontSize: 15 }}>Subscribe below to be the first to get it.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {articles.map(article => (
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
                    <div style={{ width: '100%', height: 200, background: `linear-gradient(135deg, ${C.dusk}, ${C.lakeBlue})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Caveat', cursive", fontSize: 28, color: 'rgba(255,255,255,0.4)' }}>The Dispatch</span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#999', marginTop: 'auto' }}>
                      <span>{article.author}</span>
                      {article.publishedDate && <span>{formatDate(article.publishedDate)}</span>}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />
      <NewsletterInline />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

// ============================================================
// 🛠️  YETI ADMIN — AI Article Writer (unlisted, /yeti-admin)
// ============================================================
const DISPATCH_CATEGORIES = ['Lake Life', 'Community', 'Events', 'Real Estate', 'Food & Drink', 'History', 'Recreation'];

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

function YetiAdminPage() {
  const [activeTab, setActiveTab] = useState('write'); // write | review

  // Write tab state
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

  // Review tab state
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [publishingId, setPublishingId] = useState(null); // notionId being published
  const [publishedIds, setPublishedIds] = useState(new Set());
  const [swapStatus, setSwapStatus] = useState({}); // { [articleId]: 'uploading' | 'done' | 'error' }
  const [swappedUrls, setSwappedUrls] = useState({});  // { [articleId]: url }

  const fetchDrafts = async () => {
    setDraftsLoading(true);
    try {
      const res = await fetch('/api/admin-articles');
      const data = await res.json();
      setDrafts(data.articles || []);
    } catch (err) {
      console.error('Failed to load drafts:', err);
    } finally {
      setDraftsLoading(false);
    }
  };

  const handleSwapPhoto = async (articleId, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSwapStatus(prev => ({ ...prev, [articleId]: 'uploading' }));
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1];
          const uploadRes = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'dispatch' }),
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
          const applyRes = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'apply', notionId: articleId, url: uploadData.url }),
          });
          if (!applyRes.ok) throw new Error('Failed to apply to Notion');
          setSwappedUrls(prev => ({ ...prev, [articleId]: uploadData.url }));
          setDrafts(prev => prev.map(a => a.id === articleId ? { ...a, coverImage: uploadData.url } : a));
          setSwapStatus(prev => ({ ...prev, [articleId]: 'done' }));
        } catch (err) {
          console.error(err);
          setSwapStatus(prev => ({ ...prev, [articleId]: 'error' }));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setSwapStatus(prev => ({ ...prev, [articleId]: 'error' }));
    }
  };

  const handlePublish = async (notionId) => {
    setPublishingId(notionId);
    try {
      const res = await fetch('/api/admin-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId }),
      });
      if (!res.ok) throw new Error('Publish failed');
      setPublishedIds(prev => new Set([...prev, notionId]));
      // Update local state so card reflects published immediately
      setDrafts(prev => prev.map(a => a.id === notionId ? { ...a, blogSafe: true, status: 'Published' } : a));
    } catch (err) {
      console.error(err);
    } finally {
      setPublishingId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'review') fetchDrafts();
  }, [activeTab]);

  const handlePhotoUpload = async (file) => {
    if (!file || !result?.notionId) return;
    if (!file.type.startsWith('image/')) { setUploadStatus('error'); return; }
    setUploadStatus('uploading');
    setUploadedUrl(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'dispatch' }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
        // Apply the Blob URL directly to the Notion page
        const applyRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'apply', notionId: result.notionId, url: uploadData.url }),
        });
        if (!applyRes.ok) throw new Error('Failed to apply to Notion');
        setUploadedUrl(uploadData.url);
        setUploadStatus('done');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
    }
  };

  const handleApplyImage = async () => {
    if (!result?.notionId || !result?.coverImage) return;
    setApplyStatus('applying');
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', notionId: result.notionId, filename: result.coverImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setApplyStatus('applied');
    } catch (err) {
      setApplyStatus('error');
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('loading');
    setResult(null);
    setErrorMsg('');
    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), category, notes: notes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResult(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${C.sand}`, background: '#fff',
    fontSize: 15, color: C.text, fontFamily: 'Libre Franklin, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: C.dusk, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' };

  return (
    <div style={{ minHeight: '100vh', background: C.cream, padding: '60px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sage, marginBottom: 8 }}>The Manitou Dispatch</div>
          <h1 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 32, color: C.dusk, margin: 0 }}>The Yeti Desk</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[{ id: 'write', label: '✍️  Write' }, { id: 'review', label: '📋  Review Queue' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 22px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                fontFamily: 'Libre Franklin, sans-serif', cursor: 'pointer',
                border: activeTab === tab.id ? 'none' : `1px solid ${C.sand}`,
                background: activeTab === tab.id ? C.dusk : '#fff',
                color: activeTab === tab.id ? '#fff' : C.textLight,
                transition: 'all 0.15s',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Review Queue Tab */}
        {activeTab === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ margin: 0, color: C.textLight, fontSize: 14 }}>All articles — click Publish to make live.</p>
              <button
                onClick={fetchDrafts}
                style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '7px 16px', fontSize: 13, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
              >↻ Refresh</button>
            </div>

            {draftsLoading && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>Loading articles…</div>
            )}

            {!draftsLoading && drafts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>No articles found.</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {drafts.map(article => {
                const isPublished = article.blogSafe;
                const isPublishing = publishingId === article.id;
                return (
                  <div
                    key={article.id}
                    style={{
                      background: '#fff', borderRadius: 12, padding: '20px 24px',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      borderLeft: `4px solid ${isPublished ? C.sage : C.sand}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                            padding: '2px 10px', borderRadius: 20,
                            background: isPublished ? C.sage : C.driftwood,
                            color: '#fff',
                          }}>{isPublished ? 'Live' : 'Draft'}</span>
                          {article.aiGenerated && (
                            <span style={{ fontSize: 11, color: C.textMuted, background: C.cream, padding: '2px 8px', borderRadius: 20 }}>AI</span>
                          )}
                          <span style={{ fontSize: 11, color: C.textMuted }}>{article.category}</span>
                          {article.publishedDate && (
                            <span style={{ fontSize: 11, color: C.textMuted }}>{article.publishedDate}</span>
                          )}
                        </div>
                        <h3 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 17, color: C.dusk, margin: '0 0 6px', lineHeight: 1.3 }}>{article.title}</h3>
                        {article.excerpt && (
                          <p style={{ margin: 0, fontSize: 13, color: C.textLight, lineHeight: 1.5, fontStyle: 'italic' }}>{article.excerpt}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                        {!isPublished ? (
                          <button
                            onClick={() => handlePublish(article.id)}
                            disabled={isPublishing}
                            style={{
                              background: isPublishing ? C.driftwood : C.lakeBlue,
                              color: '#fff', border: 'none', borderRadius: 8,
                              padding: '8px 18px', fontSize: 13, fontWeight: 700,
                              cursor: isPublishing ? 'not-allowed' : 'pointer',
                              fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap',
                            }}
                          >{isPublishing ? 'Publishing…' : '⚡ Publish'}</button>
                        ) : (
                          <span style={{ fontSize: 12, color: C.sage, fontWeight: 600, textAlign: 'center' }}>✓ Live</span>
                        )}
                        <a
                          href={article.notionUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, color: C.lakeBlue, textDecoration: 'none', textAlign: 'center' }}
                        >Notion →</a>
                      </div>
                    </div>

                    {/* Photo strip */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.sand}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                      {article.coverImage && (
                        <img src={article.coverImage} alt="" style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      )}
                      <input
                        id={`swap-input-${article.id}`}
                        type="file" accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleSwapPhoto(article.id, e.target.files[0])}
                      />
                      {swapStatus[article.id] === 'uploading' ? (
                        <span style={{ fontSize: 12, color: C.textMuted }}>Uploading…</span>
                      ) : swapStatus[article.id] === 'done' ? (
                        <span style={{ fontSize: 12, color: C.sage, fontWeight: 600 }}>✓ Photo updated</span>
                      ) : (
                        <button
                          onClick={() => document.getElementById(`swap-input-${article.id}`).click()}
                          style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '5px 14px', fontSize: 12, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                        >{article.coverImage ? '📷 Swap Photo' : '📷 Add Photo'}</button>
                      )}
                      {swapStatus[article.id] === 'error' && (
                        <span style={{ fontSize: 12, color: C.sunset }}>Upload failed — try again</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Write Tab */}
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

            {/* Own photo upload */}
            {result.notionId && uploadStatus !== 'done' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, textAlign: 'center' }}>— or use your own photo —</div>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); handlePhotoUpload(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('photo-upload-input').click()}
                  style={{
                    border: `2px dashed ${isDragging ? C.lakeBlue : C.sand}`,
                    borderRadius: 10, padding: '24px 16px', textAlign: 'center',
                    cursor: 'pointer', background: isDragging ? '#EEF4F8' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    id="photo-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handlePhotoUpload(e.target.files[0])}
                  />
                  {uploadStatus === 'uploading' ? (
                    <p style={{ margin: 0, color: C.sage, fontSize: 14 }}>Uploading…</p>
                  ) : (
                    <>
                      <p style={{ margin: '0 0 4px', fontSize: 14, color: C.dusk, fontWeight: 600 }}>Drop a photo here</p>
                      <p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>or click to browse · max 2MB · JPG, PNG, WebP</p>
                    </>
                  )}
                  {uploadStatus === 'error' && <p style={{ margin: '8px 0 0', color: C.sunset, fontSize: 12 }}>Upload failed — try again</p>}
                </div>
              </div>
            )}
            {uploadStatus === 'done' && uploadedUrl && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: C.warmWhite, borderRadius: 8, borderLeft: `3px solid ${C.sage}`, display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={uploadedUrl} alt="cover" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: C.sage, fontSize: 13 }}>✓ Photo uploaded &amp; applied to Notion</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Cover image is set and ready to publish</div>
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
Cherry Creek Cellars — small-batch Michigan wines, 5765 Wamplers Lake Rd, Brooklyn MI, 15 min from Manitou Beach. Gypsy Blue Vineyards — new vineyard in the Irish Hills. Village tasting rooms: Ang & Co (141 N. Lakeview Blvd) and Faust House Scrap n Craft (140 N. Lakeview Blvd).

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
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/dispatch/:slug" element={<DispatchArticlePage />} />
        <Route path="/yeti-admin" element={<YetiAdminPage />} />
        <Route path="/claim/:slug" element={<ClaimPage />} />
      </Routes>
      <VoiceWidget />
    </BrowserRouter>
  );
}
