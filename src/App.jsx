import { useState, useEffect, useRef } from "react";

// ============================================================
// ✏️  CONFIGURABLE CONTENT — Swap these weekly
// ============================================================

/**
 * HERO MODE:
 *   "default"  → standard branding hero
 *   "event"    → featured event takeover
 *   "video"    → video background (set videoUrl below)
 */
const HERO_MODE = "event";

const FEATURED_EVENT = {
  active: true,
  eyebrow: "Coming Up",
  name: "Devils Lake Boat Parade & Fireworks",
  date: "July 4th, 2026",
  description:
    "Join us for the annual Independence Day celebration on Devils Lake. Decorated boats, live music at the village, and the biggest fireworks show in Lenawee County.",
  cta: "See All Events",
  ctaLink: "#happening",
};

const FEATURED_BUSINESS = {
  name: "Rusty Anchor Bar & Grill",
  category: "Food & Drink",
  tagline: "Cold beer, lake views, and the best fish fry in the Irish Hills.",
  url: "#businesses",
  badge: "Featured This Week",
};

const HERO_VIDEO_URL = ""; // paste a YouTube embed URL or MP4 link here if HERO_MODE = "video"

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
const BUSINESSES = [
  {
    id: 1,
    name: "Rusty Anchor Bar & Grill",
    category: "Food & Drink",
    description: "Cold beer, dock seating, nightly specials, and a fish fry that locals drive an hour for.",
    featured: true,
    website: "#",
    phone: "(517) 555-0101",
  },
  {
    id: 2,
    name: "Devils Lake Marina",
    category: "Boating & Water",
    description: "Boat rentals, fuel dock, storage, and everything you need to get out on the water.",
    featured: true,
    website: "#",
    phone: "(517) 555-0102",
  },
  {
    id: 3,
    name: "Holly Griewahn — Foundation Realty",
    category: "Real Estate",
    description: "Your lakeside real estate expert. Buyer and seller specialist for the Manitou Beach and Devils Lake area.",
    featured: true,
    website: "#",
    phone: "(517) 555-0103",
  },
  {
    id: 4,
    name: "Yeti Signature Films",
    category: "Film & Video",
    description: "Cinematic video production for businesses, events, and legacies. Where your story becomes a film.",
    featured: false,
    website: "#",
    phone: "(517) 555-0104",
  },
  {
    id: 5,
    name: "Irish Hills Outfitters",
    category: "Sports & Recreation",
    description: "Kayak and paddleboard rentals, fishing gear, and local guides who know every inch of Devils Lake.",
    featured: false,
    website: "#",
    phone: "(517) 555-0105",
  },
  {
    id: 6,
    name: "Lakeside Coffee Co.",
    category: "Food & Drink",
    description: "Specialty coffee, fresh pastries, and a porch view that makes Monday mornings survivable.",
    featured: false,
    website: "#",
    phone: "(517) 555-0106",
  },
];

// ============================================================
// 📅  EVENTS DATA
// ============================================================
const EVENTS = [
  {
    id: 1,
    name: "Devils Lake Boat Parade & Fireworks",
    date: "July 4, 2026",
    time: "Dusk",
    category: "Community",
    description: "Annual Independence Day celebration with decorated boats and fireworks.",
  },
  {
    id: 2,
    name: "Summer Farmers Market",
    date: "Every Saturday",
    time: "8am – 1pm",
    category: "Market",
    description: "Local produce, artisan goods, and homemade treats at the village green.",
  },
  {
    id: 3,
    name: "Sunset Kayak Tour",
    date: "June 28, 2026",
    time: "7:00 PM",
    category: "Activity",
    description: "Guided kayak tour of Devils Lake with stops at the lighthouse replica.",
  },
  {
    id: 4,
    name: "Holly & The Yeti Live Recording",
    date: "July 12, 2026",
    time: "6:00 PM",
    category: "Media",
    description: "Live podcast episode featuring local business owners and community stories.",
  },
];

// ============================================================
// 🧩  SHARED COMPONENTS
// ============================================================

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

function FadeIn({ children, delay = 0, style = {} }) {
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

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
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
      style={{ ...base, ...styles[variant] }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.82"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {children}
    </Tag>
  );
}

function CategoryPill({ children }) {
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: C.sageDark,
      background: `${C.sage}18`,
      border: `1px solid ${C.sage}30`,
      padding: "4px 10px",
      borderRadius: 3,
    }}>
      {children}
    </span>
  );
}

// ============================================================
// 🏠  HERO SECTION
// ============================================================
function Hero({ scrollTo }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Shared overlay gradient
  const overlay = {
    position: "absolute", inset: 0,
    background: "linear-gradient(170deg, rgba(26,40,48,0.72) 0%, rgba(45,59,69,0.55) 50%, rgba(26,40,48,0.8) 100%)",
    zIndex: 1,
  };

  if (HERO_MODE === "event" && FEATURED_EVENT.active) {
    return (
      <section
        id="home"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          background: `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 50%, ${C.dusk} 100%)`,
          overflow: "hidden",
        }}
      >
        {/* Abstract water shimmer background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 20% 60%, ${C.lakeBlue}25 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 80% 30%, ${C.sageDark}20 0%, transparent 60%),
            radial-gradient(ellipse 100% 60% at 50% 100%, ${C.lakeDark}40 0%, transparent 60%)
          `,
        }} />

        {/* Event badge */}
        <div style={{ position: "absolute", top: 100, right: 48, zIndex: 2, textAlign: "right" }}>
          <div style={{
            display: "inline-block",
            background: `${C.sunset}22`,
            border: `1px solid ${C.sunset}50`,
            borderRadius: 4,
            padding: "6px 16px",
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: C.sunsetLight,
          }}>
            {FEATURED_EVENT.eyebrow}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "120px 48px 80px" }}>
          <div style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.9s ease",
          }}>
            <div style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11, letterSpacing: 5, textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)", marginBottom: 20,
            }}>
              Manitou Beach · Devils Lake, Michigan
            </div>
            <h1 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 400,
              color: C.cream,
              lineHeight: 1.1,
              margin: "0 0 12px 0",
              maxWidth: 700,
            }}>
              {FEATURED_EVENT.name}
            </h1>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(18px, 2.5vw, 26px)",
              color: C.sunsetLight,
              margin: "0 0 24px 0",
            }}>
              {FEATURED_EVENT.date}
            </div>
            <p style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.75,
              maxWidth: 560,
              margin: "0 0 40px 0",
            }}>
              {FEATURED_EVENT.description}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Btn href={FEATURED_EVENT.ctaLink} variant="sunset">{FEATURED_EVENT.cta}</Btn>
              <Btn onClick={() => scrollTo("businesses")} variant="outlineLight">Explore the Community</Btn>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
          zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
            Scroll
          </div>
        </div>
      </section>
    );
  }

  // Default hero
  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        background: `linear-gradient(160deg, ${C.night} 0%, ${C.lakeDark} 60%, ${C.dusk} 100%)`,
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 10% 70%, ${C.lakeBlue}30 0%, transparent 65%),
          radial-gradient(ellipse 50% 60% at 90% 20%, ${C.sage}15 0%, transparent 60%)
        `,
      }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
            Welcome to
          </div>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: 400,
            color: C.cream,
            lineHeight: 1.0,
            margin: "0 0 16px 0",
          }}>
            Manitou Beach
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 3vw, 32px)", color: C.sunsetLight, marginBottom: 30 }}>
            on Devils Lake, Michigan
          </div>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 48px 0" }}>
            A lakeside community with a big personality. Businesses, events, and everything happening on the party lake.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Btn onClick={() => scrollTo("businesses")} variant="primary">Explore Businesses</Btn>
            <Btn onClick={() => scrollTo("happening")} variant="outlineLight">What's Happening</Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 📰  NEWSLETTER SIGNUP
// ============================================================
function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Replace this URL with your actual beehiiv embed action URL
    // Example: https://embeds.beehiiv.com/[your-id]
    console.log("Newsletter signup:", email);
    setSubmitted(true);
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
        {submitted ? (
          <div style={{
            background: `${C.sage}22`,
            border: `1px solid ${C.sage}40`,
            borderRadius: 8,
            padding: "16px 24px",
            color: C.sage,
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 14,
          }}>
            ✓ You're in! Check your inbox for a welcome message.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                minWidth: 200,
                padding: "12px 18px",
                borderRadius: 4,
                border: `1px solid rgba(255,255,255,0.15)`,
                background: "rgba(255,255,255,0.08)",
                color: C.cream,
                fontSize: 14,
                fontFamily: "'Libre Franklin', sans-serif",
                outline: "none",
              }}
            />
            <Btn variant="sage">Subscribe</Btn>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 📅  WHAT'S HAPPENING
// ============================================================
function HappeningSection() {
  const categoryColors = {
    Community: C.lakeBlue,
    Market: C.sage,
    Activity: C.sunset,
    Media: C.driftwood,
  };

  return (
    <section id="happening" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Events & News</SectionLabel>
          <SectionTitle>What's Happening</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, maxWidth: 480, margin: "0 0 56px 0", lineHeight: 1.75 }}>
            From boat parades to farmers markets — everything going on at Manitou Beach and Devils Lake.
          </p>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {EVENTS.map((event, i) => (
            <FadeIn key={event.id} delay={i * 80}>
              <div style={{
                background: C.cream,
                border: `1px solid ${C.sand}`,
                borderRadius: 10,
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{
                  height: 5,
                  background: categoryColors[event.category] || C.sage,
                }} />
                <div style={{ padding: "22px 22px 26px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <CategoryPill>{event.category}</CategoryPill>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: C.sunset, textAlign: "right" }}>
                      {event.time}
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: C.text, margin: "0 0 6px 0", lineHeight: 1.3 }}>
                    {event.name}
                  </h3>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.sage, fontWeight: 600, marginBottom: 10 }}>
                    {event.date}
                  </div>
                  <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.65, margin: 0 }}>
                    {event.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={200}>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>
              Have an event to share? Submit it free.
            </p>
            <Btn href="#submit" variant="outline">Submit Your Event</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================
// 🗺️  EXPLORE
// ============================================================
function ExploreSection() {
  const places = [
    { icon: "⛵", name: "Devils Lake", desc: "600+ acres of water for boating, fishing, and kayaking. The party lake." },
    { icon: "🏠", name: "Lighthouse Replica", desc: "The village's beloved icon. Photogenic and completely landlocked." },
    { icon: "🌿", name: "Irish Hills", desc: "Rolling hills, hidden trails, and enough nature to justify the drive." },
    { icon: "🍺", name: "Lake Town Nightlife", desc: "Year-round bars and restaurants with a dock-side state of mind." },
    { icon: "🎣", name: "Fishing", desc: "Bass, pike, bluegill — and the occasional tall tale about the one that got away." },
    { icon: "🏡", name: "Cottage Country", desc: "Weekend rentals, seasonal getaways, and the forever-home dream." },
  ];

  return (
    <section id="explore" style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <FadeIn>
            <div>
              <SectionLabel>The Area</SectionLabel>
              <SectionTitle>Explore Manitou Beach</SectionTitle>
              <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, marginBottom: 32 }}>
                Sitting on the shores of Devils Lake in the Michigan Irish Hills — there's more to explore here than the name implies. (Yes, we're aware there's no beach. We've all made peace with it.)
              </p>
              <Btn onClick={() => {}} variant="dark">Get Directions</Btn>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {places.map((p, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div style={{
                  background: C.warmWhite,
                  border: `1px solid ${C.sand}`,
                  borderRadius: 10,
                  padding: "20px 18px",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.sage; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 5 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 🏪  BUSINESS DIRECTORY
// ============================================================
function BusinessDirectory() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(BUSINESSES.map(b => b.category)))];
  const filtered = filter === "All" ? BUSINESSES : BUSINESSES.filter(b => b.category === filter);
  const featured = filtered.filter(b => b.featured);
  const regular = filtered.filter(b => !b.featured);

  return (
    <section id="businesses" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
            <div>
              <SectionLabel>The Directory</SectionLabel>
              <SectionTitle>Local Businesses</SectionTitle>
            </div>
            <Btn href="#submit" variant="outline" small>+ List Your Business (Free)</Btn>
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 48 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  padding: "7px 16px",
                  borderRadius: 4,
                  border: `1.5px solid ${filter === cat ? C.sage : C.sand}`,
                  background: filter === cat ? C.sage : "transparent",
                  color: filter === cat ? C.cream : C.textMuted,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Featured listings */}
        {featured.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.sunset, marginBottom: 20, fontWeight: 700 }}>
              ★ Featured Listings
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              {featured.map((b, i) => (
                <FadeIn key={b.id} delay={i * 70}>
                  <BusinessCard business={b} featured />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Regular listings */}
        {regular.length > 0 && (
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.textMuted, marginBottom: 20, fontWeight: 600 }}>
              Community Members
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {regular.map((b, i) => (
                <FadeIn key={b.id} delay={i * 60}>
                  <BusinessCard business={b} />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* Featured upsell CTA */}
        <FadeIn delay={200}>
          <div style={{
            marginTop: 56,
            background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
            borderRadius: 12,
            padding: "40px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 24,
          }}>
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 10 }}>
                Get Noticed
              </div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", color: C.cream, margin: "0 0 8px 0", fontWeight: 400 }}>
                Upgrade to a Featured Listing
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 400, lineHeight: 1.7 }}>
                Get a premium slot at the top of the directory, newsletter placement, and a business highlight video from Holly & The Yeti.
              </p>
            </div>
            <Btn href="#submit" variant="sunset">Upgrade Your Listing</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function BusinessCard({ business, featured = false }) {
  return (
    <div style={{
      background: C.cream,
      border: `1px solid ${featured ? C.sunset + "40" : C.sand}`,
      borderRadius: 10,
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      position: "relative",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {featured && (
        <div style={{ height: 4, background: `linear-gradient(90deg, ${C.sunset}, ${C.sunsetLight})` }} />
      )}
      <div style={{ padding: "22px 22px 24px" }}>
        {featured && (
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.sunset, marginBottom: 10 }}>
            ★ Featured
          </div>
        )}
        <CategoryPill>{business.category}</CategoryPill>
        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: featured ? 18 : 16, fontWeight: 700, color: C.text, margin: "10px 0 8px 0" }}>
          {business.name}
        </h3>
        <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.65, margin: "0 0 18px 0" }}>
          {business.description}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>{business.phone}</span>
          <a href={business.website} style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
            color: C.sage, textDecoration: "none",
          }}>Visit →</a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🎙️  HOLLY & THE YETI
// ============================================================
function HollyYetiSection() {
  return (
    <section id="holly" style={{
      background: `linear-gradient(160deg, ${C.night} 0%, ${C.lakeDark} 100%)`,
      padding: "100px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(ellipse 80% 60% at 80% 50%, ${C.lakeBlue}15 0%, transparent 70%)`,
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <FadeIn>
            <SectionLabel light>The Voices of the Lake</SectionLabel>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 400,
              color: C.cream,
              lineHeight: 1.15,
              margin: "0 0 24px 0",
            }}>
              Holly &<br />The Yeti
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 16 }}>
              A local realtor with straight-shooter expertise and an Australian-accented community character with a flair for comedy walk into a podcast...
            </p>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 36 }}>
              Holly Griewahn brings the real estate knowledge and market insight. The Yeti brings the AI-generated videos and the stories that make Manitou Beach feel like the community it actually is.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn href="https://www.youtube.com/@HollyandtheYetipodcast" variant="sunset">Watch on YouTube</Btn>
              <Btn href="https://www.facebook.com/HollyandtheYeti" variant="outlineLight">Facebook</Btn>
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Social cards */}
              {[
                { platform: "YouTube", handle: "@HollyandtheYetipodcast", desc: "Full episodes, community highlights, and business spotlight videos.", icon: "▶", href: "https://www.youtube.com/@HollyandtheYetipodcast" },
                { platform: "Facebook", handle: "HollyandtheYeti", desc: "Community updates, event news, and behind-the-scenes moments.", icon: "f", href: "https://www.facebook.com/HollyandtheYeti" },
                { platform: "Instagram", handle: "@hollyandtheyeti", desc: "Lake life photos, short clips, and the occasional cryptid sighting.", icon: "◎", href: "https://www.instagram.com/hollyandtheyeti" },
              ].map(s => (
                <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                  display: "block",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  textDecoration: "none",
                  transition: "all 0.22s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                >
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 8,
                      background: `${C.sage}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color: C.sage,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 13, color: C.cream }}>{s.platform}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{s.handle}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "12px 0 0 0", lineHeight: 1.6 }}>{s.desc}</p>
                </a>
              ))}

              {/* Yeti Signature Films callout */}
              <div style={{
                background: `${C.sunset}15`,
                border: `1px solid ${C.sunset}35`,
                borderRadius: 10,
                padding: "18px 20px",
              }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 6 }}>
                  Premium Service
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.cream, marginBottom: 6 }}>
                  Yeti Signature Films
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 12px 0", lineHeight: 1.65 }}>
                  Cinematic storytelling for corporate and personal legacies. Starting from $25K.
                </p>
                <a href="#" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight, textDecoration: "none" }}>
                  Learn More →
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
      cta: "Community Guide", href: "#about",
    },
    {
      title: "Lake Access Magazine",
      desc: "Our regional media partner covering lake communities across Michigan. Find more lake towns, more listings, and more lake life.",
      cta: "Visit Lake Access", href: "#",
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 24 }}>
          {items.map((item, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: C.warmWhite,
                border: `1px solid ${C.sand}`,
                borderRadius: 10,
                padding: "28px 26px 26px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.sage}60`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.transform = "none"; }}
              >
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, margin: "0 0 12px 0", fontWeight: 700 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 24px 0", flex: 1 }}>
                  {item.desc}
                </p>
                <a href={item.href} style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                  color: C.sage, textDecoration: "none",
                }}>
                  {item.cta} →
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 📝  SUBMISSION FORM
// ============================================================
function SubmitSection() {
  const [tab, setTab] = useState("business");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", phone: "", website: "", email: "", description: "", upgrade: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with your Tally.so form embed URL or Formspree endpoint
    // Example Tally: https://tally.so/r/YOUR_FORM_ID
    console.log("Form submitted:", { tab, ...form });
    setSubmitted(true);
  };

  const input = (field, placeholder, type = "text") => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
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
              background: `${C.sage}15`,
              border: `1px solid ${C.sage}40`,
              borderRadius: 10,
              padding: "32px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text, marginBottom: 8 }}>
                Submission received!
              </div>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                We review all submissions within 48 hours. You'll hear from us soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {tab === "business" ? (
                <>
                  {input("name", "Business Name")}
                  {input("category", "Category (e.g. Food & Drink, Boating, Real Estate)")}
                  {input("phone", "Phone Number", "tel")}
                  {input("website", "Website URL", "url")}
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
                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "16px", background: `${C.sunset}0D`, border: `1px solid ${C.sunset}25`, borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.upgrade}
                      onChange={e => setForm(f => ({ ...f, upgrade: e.target.checked }))}
                      style={{ marginTop: 2, accentColor: C.sunset }}
                    />
                    <div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>
                        I'm interested in a Featured Listing
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
                        Featured listings get top-of-directory placement, newsletter inclusion, and a business highlight video. Someone from Holly & The Yeti will be in touch.
                      </div>
                    </div>
                  </label>
                </>
              ) : (
                <>
                  {input("name", "Event Name")}
                  {input("category", "Event Type (e.g. Community, Market, Music)")}
                  {input("email", "Your Email", "email")}
                  {input("phone", "Phone (optional)", "tel")}
                  <textarea
                    placeholder="Event description — date, time, location, and what people can expect"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={5}
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
                </>
              )}

              <button
                type="submit"
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "15px 32px",
                  borderRadius: 6,
                  border: "none",
                  background: C.sage,
                  color: C.cream,
                  cursor: "pointer",
                  width: "100%",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.target.style.opacity = "0.85"}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                Submit {tab === "business" ? "Business" : "Event"}
              </button>

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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <FadeIn>
            <SectionLabel>The Story</SectionLabel>
            <SectionTitle>About This Platform</SectionTitle>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 20 }}>
              Manitou Beach, Michigan sits on Devils Lake in the Irish Hills. Locals call it "the party lake" — and anyone who's spent a summer here knows why. But for all the personality, the community didn't have a central digital home.
            </p>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 20 }}>
              This platform is that home. A directory for local businesses, a calendar for community events, and a newsletter that keeps the lake life going year-round — built by people who actually live here.
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
            © {new Date().getFullYear()} Manitou Beach Michigan · Holly & The Yeti
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.15)" }}>
            No beach. Still worth it. 🏕️
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// 🧭  NAVBAR
// ============================================================
function Navbar({ activeSection, scrollTo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrollY > 60;

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: solid ? "10px 0" : "18px 0",
      background: solid ? "rgba(250,246,239,0.97)" : "transparent",
      backdropFilter: solid ? "blur(14px)" : "none",
      borderBottom: solid ? `1px solid ${C.sand}` : "none",
      transition: "all 0.35s ease",
    }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <div style={{ cursor: "pointer" }} onClick={() => scrollTo("home")}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: solid ? C.dusk : C.cream, transition: "color 0.35s" }}>
            Manitou Beach
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: solid ? C.sage : "rgba(255,255,255,0.5)", marginTop: -2, transition: "color 0.35s" }}>
            on Devils Lake
          </div>
        </div>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
          {SECTIONS.filter(s => s.id !== "home").map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              style={{
                background: activeSection === id ? `${C.sage}18` : "transparent",
                border: "none",
                color: activeSection === id ? C.sageDark : (solid ? C.textLight : "rgba(255,255,255,0.7)"),
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
              onMouseEnter={e => { e.currentTarget.style.color = solid ? C.sageDark : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = activeSection === id ? C.sageDark : (solid ? C.textLight : "rgba(255,255,255,0.7)"); e.currentTarget.style.background = activeSection === id ? `${C.sage}18` : "transparent"; }}
            >
              {label}
            </button>
          ))}
          <div style={{ marginLeft: 8 }}>
            <Btn onClick={() => scrollTo("submit")} variant="primary" small>List Your Business</Btn>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// 🌐  APP ROOT
// ============================================================
export default function App() {
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
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <Navbar activeSection={activeSection} scrollTo={scrollTo} />
      <Hero scrollTo={scrollTo} />
      <NewsletterBar />
      <HappeningSection />
      <ExploreSection />
      <BusinessDirectory />
      <HollyYetiSection />
      <LivingSection />
      <SubmitSection />
      <AboutSection />
      <Footer scrollTo={scrollTo} />
    </div>
  );
}
