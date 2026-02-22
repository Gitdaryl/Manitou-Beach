import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
const BUSINESSES = [
  {
    id: 1,
    name: "Holly Griewahn — Foundation Realty",
    category: "Real Estate",
    description: "Your lakeside real estate expert. Specializing in lake property throughout Lenawee County, Irish Hills, and the Devils Lake area. 30+ years of local expertise.",
    featured: true,
    logo: "/images/holly_logo.jpg",
    website: "https://www.hollygriewahn.com",
    phone: "(517) 403-3413",
  },
  {
    id: 2,
    name: "Boot Jack Tavern",
    category: "Food & Drink",
    description: "Michigan craft beer, wine, and spirits in a gorgeous outdoor setting with twinkly lights. Trivia Wednesdays, live music, and a menu built for lake days. 735 Manitou Rd.",
    featured: true,
    logo: "/images/bootjack_logo.png",
    website: "https://bootjacktavern.com",
    phone: "(517) 252-5475",
  },
  {
    id: 3,
    name: "Two Lakes Tavern",
    category: "Food & Drink",
    description: "Family-owned lakeside restaurant known for their smoked entrees and a big menu full of options. Right on the shores of Devils Lake. 110 Walnut St.",
    featured: true,
    logo: "/images/two_lakes_logo.jpg",
    website: "https://www.twolakestavern.com",
    phone: "(517) 547-7490",
  },
  {
    id: 4,
    name: "Devils Lake Yacht Club",
    category: "Boating & Water",
    description: "Fine dining overlooking Devils Lake, ~100 dock slips, live entertainment Friday and Saturday nights, sailboat races every Sunday, and free sailing lessons all summer.",
    featured: false,
    website: "https://www.devilslakeyachtclub.com",
    phone: "",
  },
  {
    id: 5,
    name: "Manitou Beach Marina",
    category: "Boating & Water",
    description: "Pontoon boat sales, rentals, dock slip leases, boating repair, and winter storage. Your one-stop shop for getting out on the water.",
    featured: false,
    website: "https://manitoubeachmarina.com",
    phone: "",
  },
  {
    id: 6,
    name: "Devils Lake Water Sports",
    category: "Boating & Water",
    description: "Boat rentals and water sports on Devils Lake. Everything you need to make the most of a day on the water.",
    featured: false,
    website: "https://dlwatersports.com",
    phone: "",
  },
  {
    id: 7,
    name: "Highland Inn",
    category: "Food & Drink",
    description: "A Manitou Beach institution since 1927 — survived Prohibition, survived the pandemic, still standing. Classic bar with deep local roots.",
    featured: true,
    logo: "/images/highland_logo.png",
    website: "https://www.thewellstavern.net/highland-inn",
    phone: "(517) 547-9726",
  },
  {
    id: 8,
    name: "Yeti Groove Media",
    category: "Film & Video",
    description: "Cinematic video production for businesses, events, and legacies. Where your story becomes a film.",
    featured: false,
    website: "https://yeti-signature-films.vercel.app",
    phone: "",
  },
  {
    id: 9,
    name: "Irish Hills Plumbing & Heating",
    category: "Home Services",
    description: "Residential plumbing, heating, and HVAC for lakefront and year-round homes in the Devils Lake area.",
    featured: false,
    website: "",
    phone: "",
  },
  {
    id: 10,
    name: "Devils Lake Dock & Deck",
    category: "Home Services",
    description: "Custom dock installation, deck building, and lakefront renovation for waterfront properties.",
    featured: false,
    website: "",
    phone: "",
  },
  {
    id: 11,
    name: "Lenawee Snow & Lawn",
    category: "Home Services",
    description: "Snow removal, salting, and seasonal lawn care for lake properties. Residential and commercial contracts.",
    featured: false,
    website: "",
    phone: "",
  },
  {
    id: 12,
    name: "Irish Hills Landscaping",
    category: "Home Services",
    description: "Waterfront landscaping, seawall planting, and yard maintenance for Devils Lake properties.",
    featured: false,
    website: "",
    phone: "",
  },
];

// Category → accent color mapping (used by directory + business rows)
const CAT_COLORS = {
  "Real Estate":    C.lakeBlue,
  "Food & Drink":   C.sunset,
  "Boating & Water": C.sage,
  "Film & Video":   C.driftwood,
  "Home Services":  C.sageDark,
};

// ============================================================
// 📅  EVENTS DATA
// ============================================================
const EVENTS = [
  {
    id: 1,
    name: "Friday Night Fish Fry",
    date: "Every Friday",
    time: "Dinner",
    category: "Community",
    description: "A weekly Devils Lake tradition at the Yacht Club. Fresh fish, cold drinks, and the best view on the lake.",
  },
  {
    id: 2,
    name: "Live Music at the Yacht Club",
    date: "Every Friday & Saturday",
    time: "Evening",
    category: "Activity",
    description: "Live entertainment on the water all season long at Devils Lake Yacht Club.",
  },
  {
    id: 3,
    name: "Trivia Night at Boot Jack Tavern",
    date: "Every Wednesday",
    time: "Evening",
    category: "Activity",
    description: "Test your knowledge with the locals at Boot Jack Tavern. Michigan craft beer on tap.",
  },
  {
    id: 4,
    name: "Sunday Sailboat Races",
    date: "Every Sunday (Summer)",
    time: "Afternoon",
    category: "Community",
    description: "Weekly sailboat races on Devils Lake hosted by the Yacht Club — a summer staple since the club's founding.",
  },
  {
    id: 5,
    name: "Devils Lake Yacht Regatta",
    date: "Mid-September 2026",
    time: "All Day",
    category: "Community",
    description: "The annual regatta on Devils Lake — a beloved tradition since 1941. Sailboat racing, community gathering, and lake life at its best.",
  },
  {
    id: 6,
    name: "Holly & The Yeti Live Recording",
    date: "TBA 2026",
    time: "6:00 PM",
    category: "Media",
    description: "Live podcast episode featuring local business owners and community stories. Stay tuned for the date.",
  },
];

// ============================================================
// 🎬  VIDEO / STORY CONTENT
// ============================================================
const VIDEOS = [
  {
    id: 1,
    title: "Manitou Beach: The Party Lake",
    desc: "A look at life on Devils Lake — the boats, the bars, and the community that makes it special.",
    youtubeId: null, // Replace with real YouTube video ID (e.g. "dQw4w9WgXcQ")
    date: "Coming Soon",
    category: "Community",
  },
  {
    id: 2,
    title: "Holly & The Yeti — Episode 1",
    desc: "First episode of the community podcast. Local business owners, lake life stories, and market insights.",
    youtubeId: null,
    date: "Coming Soon",
    category: "Media",
  },
  {
    id: 3,
    title: "Boot Jack Tavern — Business Spotlight",
    desc: "Cinematic story of one of Manitou Beach's most beloved lakeside venues.",
    youtubeId: null,
    date: "Coming Soon",
    category: "Media",
  },
  {
    id: 4,
    title: "Sunday Races on Devils Lake",
    desc: "A season of sailboat racing at the Yacht Club. From first light to the last finish line.",
    youtubeId: null,
    date: "Coming Soon",
    category: "Community",
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
// 🏠  HERO SECTION
// ============================================================
function Hero({ scrollTo }) {
  const [loaded, setLoaded] = useState(false);
  const [heroEvent, setHeroEvent] = useState(null);
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    // Fetch active hero event from Notion
    fetch("/api/hero")
      .then(r => r.json())
      .then(data => {
        setHeroEvent(data.event || null);
        setHeroReady(true);
      })
      .catch(() => setHeroReady(true));
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

  // ── EVENT HERO ──
  if (heroReady && heroEvent) {
    const bgStyle = heroEvent.imageUrl
      ? { backgroundImage: `url(${heroEvent.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 50%, ${C.dusk} 100%)` };

    return (
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", ...bgStyle }}>
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(26,40,48,0.75) 0%, rgba(26,40,48,0.5) 50%, rgba(26,40,48,0.85) 100%)", zIndex: 1 }} />

        {/* Event badge */}
        <div style={{ position: "absolute", top: 100, right: 48, zIndex: 2, textAlign: "right" }}>
          <div style={{
            display: "inline-block", background: `${C.sunset}22`, border: `1px solid ${C.sunset}50`,
            borderRadius: 4, padding: "6px 16px", fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunsetLight,
          }}>
            Coming Up
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "120px 48px 80px" }}>
          <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(30px)", transition: "all 0.9s ease" }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Manitou Beach · Devils Lake, Michigan
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 400, color: C.cream, lineHeight: 1.1, margin: "0 0 12px 0", maxWidth: 700 }}>
              {heroEvent.name}
            </h1>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(18px, 2.5vw, 26px)", color: C.sunsetLight, margin: "0 0 24px 0" }}>
              {new Date(heroEvent.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {heroEvent.tagline && (
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, maxWidth: 560, margin: "0 0 40px 0" }}>
                {heroEvent.tagline}
              </p>
            )}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Btn href="#happening" variant="sunset">See All Events</Btn>
              <Btn onClick={() => scrollTo("businesses")} variant="outlineLight">Explore the Community</Btn>
            </div>
          </div>
        </div>
        {scrollIndicator}
      </section>
    );
  }

  // ── DEFAULT HERO ──
  return (
    <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      {/* Fallback color behind video (shows until video loads) */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${C.night} 0%, ${C.lakeDark} 60%, ${C.dusk} 100%)`, zIndex: 0 }} />

      {/* Looping video background */}
      <video
        autoPlay muted loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 1 }}
      >
        <source src="/videos/hero-default.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(26,40,48,0.6) 0%, rgba(26,40,48,0.35) 50%, rgba(26,40,48,0.75) 100%)", zIndex: 2 }} />

      <div style={{ position: "relative", zIndex: 3, maxWidth: 960, margin: "0 auto", padding: "160px 48px 120px" }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
            Welcome to
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 400, color: C.cream, lineHeight: 1.0, margin: "0 0 16px 0" }}>
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
      {scrollIndicator}
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
// 📅  WHAT'S HAPPENING — home page teaser (3 events)
// ============================================================
function HappeningSection() {
  const categoryColors = {
    Community: C.lakeBlue,
    Market: C.sage,
    Activity: C.sunset,
    Media: C.driftwood,
  };
  const preview = EVENTS.slice(0, 3);

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
          {preview.map((event, i) => {
            const color = categoryColors[event.category] || C.sage;
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
                      {event.date}
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
                + {EVENTS.length - 3} more events on the calendar
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
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 📅  /happening — WEEKLY RECURRING EVENTS
// ============================================================
function WeeklyEventsSection({ events }) {
  const categoryColors = { Community: C.lakeBlue, Activity: C.sunset, Media: C.driftwood, Market: C.sage };
  const dayLabels = {
    "Every Friday": "FRI",
    "Every Friday & Saturday": "FRI — SAT",
    "Every Wednesday": "WED",
    "Every Sunday (Summer)": "SUN",
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

        <div>
          {events.map((event, i) => {
            const color = categoryColors[event.category] || C.sage;
            const day = dayLabels[event.date] || event.date;
            return (
              <FadeIn key={event.id} delay={i * 60}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr auto",
                    gap: "0 48px",
                    alignItems: "start",
                    padding: "36px 0",
                    borderBottom: `1px solid ${C.sand}`,
                    transition: "background 0.2s",
                    borderRadius: 4,
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
                      margin: "0 0 10px 0",
                      lineHeight: 1.2,
                    }}>
                      {event.name}
                    </h3>
                    <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
                      {event.description}
                    </p>
                  </div>

                  {/* Category */}
                  <div style={{ paddingTop: 8 }}>
                    <CategoryPill>{event.category}</CategoryPill>
                  </div>
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
// 📅  /happening — SPECIAL / ONE-OFF EVENTS
// ============================================================
function CalendarSection({ events }) {
  const categoryColors = { Community: C.lakeBlue, Activity: C.sunset, Media: C.driftwood, Market: C.sage };

  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Special Events · 2026</SectionLabel>
          <SectionTitle>On the Calendar</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, maxWidth: 480, margin: "0 0 64px 0" }}>
            The big ones. Mark them down.
          </p>
        </FadeIn>

        <div>
          {events.map((event, i) => {
            const color = categoryColors[event.category] || C.sage;
            return (
              <FadeIn key={event.id} delay={i * 80}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "260px 1fr",
                  gap: "0 80px",
                  alignItems: "start",
                  padding: "64px 0",
                  borderBottom: i < events.length - 1 ? `1px solid ${C.sand}` : "none",
                }}>
                  {/* Date — large editorial */}
                  <div>
                    <div style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "clamp(30px, 4vw, 52px)",
                      fontWeight: 400,
                      color: C.driftwood,
                      lineHeight: 1.1,
                      marginBottom: 6,
                    }}>
                      {event.date.replace(" 2026", "")}
                    </div>
                    <div style={{
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 11, fontWeight: 600, letterSpacing: 3,
                      textTransform: "uppercase", color: C.textMuted,
                    }}>
                      2026
                    </div>
                  </div>

                  {/* Event */}
                  <div>
                    <CategoryPill>{event.category}</CategoryPill>
                    <h2 style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "clamp(24px, 3.5vw, 44px)",
                      fontWeight: 400,
                      color: C.text,
                      margin: "18px 0 14px 0",
                      lineHeight: 1.1,
                    }}>
                      {event.name}
                    </h2>
                    <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, margin: "0 0 16px 0", maxWidth: 500 }}>
                      {event.description}
                    </p>
                    {event.time && (
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color }}>
                        {event.time}
                      </div>
                    )}
                  </div>
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

        <FadeIn delay={300}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif", textAlign: "center", marginTop: 48, letterSpacing: 0.5 }}>
            Add real YouTube video IDs to the VIDEOS array in App.jsx to embed live content
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================
// 📅  /happening — SUBMIT CTA
// ============================================================
function HappeningSubmitCTA() {
  return (
    <div style={{ background: C.lakeDark, padding: "80px 24px", textAlign: "center" }}>
      <FadeIn>
        <SectionLabel light>Get Involved</SectionLabel>
        <h3 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: "clamp(24px, 4vw, 40px)",
          fontWeight: 400, color: C.cream, margin: "0 0 16px 0",
        }}>
          Have an event to share?
        </h3>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 36px 0", lineHeight: 1.75, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
          Free community calendar listings. Submit your event and we'll get it listed within 48 hours.
        </p>
        <Btn href="/#submit" variant="sunset">Submit Your Event</Btn>
      </FadeIn>
    </div>
  );
}

// ============================================================
// 🗺️  EXPLORE
// ============================================================
function ExploreSection() {
  const places = [
    {
      icon: "⛵", name: "Devils Lake",
      desc: "600+ acres of water for boating, fishing, and kayaking. The party lake.",
      action: () => window.open("https://maps.google.com/?q=Devils+Lake+Manitou+Beach+MI", "_blank"),
      actionLabel: "Open in Maps",
    },
    {
      icon: "🏠", name: "Lighthouse Replica",
      desc: "The village's beloved icon. Photogenic and completely landlocked.",
      action: () => window.open("https://maps.google.com/?q=Manitou+Beach+Lighthouse+Replica+Michigan", "_blank"),
      actionLabel: "Get Directions",
    },
    {
      icon: "🌿", name: "Irish Hills",
      desc: "Rolling hills, hidden trails, and enough nature to justify the drive.",
      action: () => window.open("https://www.irishhills.com", "_blank"),
      actionLabel: "Explore Irish Hills",
    },
    {
      icon: "🍺", name: "Lake Town Nightlife",
      desc: "Year-round bars and restaurants with a dock-side state of mind.",
      action: () => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" }),
      actionLabel: "See Local Businesses",
    },
    {
      icon: "🎣", name: "Fishing",
      desc: "Bass, pike, bluegill — and the occasional tall tale about the one that got away.",
      action: () => window.open("https://www.michigan.gov/dnr/managing-resources/fisheries", "_blank"),
      actionLabel: "DNR Fishing Info",
    },
    {
      icon: "🏡", name: "Cottage Country",
      desc: "Weekend rentals, seasonal getaways, and the forever-home dream.",
      action: () => document.getElementById("holly")?.scrollIntoView({ behavior: "smooth" }),
      actionLabel: "Talk to Holly",
    },
  ];

  return (
    <section id="explore" style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <FadeIn>
            <div>
              <SectionLabel>The Area</SectionLabel>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 400, color: C.text, margin: "0 0 18px 0", lineHeight: 1.2 }}>
                Explore<br />Manitou Beach
              </h2>
              <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, marginBottom: 32 }}>
                Sitting on the shores of Devils Lake in the Michigan Irish Hills — there's more to explore here than the name implies. (Yes, we're aware there's no beach. We've all made peace with it.)
              </p>
              <Btn onClick={() => window.open("https://maps.google.com/?q=Manitou+Beach+Michigan+49267", "_blank")} variant="dark">Get Directions</Btn>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {places.map((p, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div
                  onClick={p.action}
                  style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 10, padding: "20px 18px", transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.sage; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.sand; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 5 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 10 }}>{p.desc}</div>
                  <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, color: C.sage, textTransform: "uppercase" }}>
                    {p.actionLabel} →
                  </div>
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
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(BUSINESSES.map(b => b.category)))];

  const matchesSearch = (b) => {
    const q = search.toLowerCase();
    return !search ||
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);
  };

  const filtered = BUSINESSES.filter(b => {
    const matchesCat = activeCategory === "All" || b.category === activeCategory;
    return matchesCat && matchesSearch(b);
  });

  const featured = filtered.filter(b => b.featured);
  const regular = filtered.filter(b => !b.featured);

  // Group regular listings by category
  const grouped = {};
  regular.forEach(b => {
    if (!grouped[b.category]) grouped[b.category] = [];
    grouped[b.category].push(b);
  });

  return (
    <section id="businesses" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn>
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

        {/* Featured listings — editorial dark cards */}
        {featured.length > 0 && (
          <FadeIn delay={100}>
            <div style={{ marginBottom: 60 }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3.5, textTransform: "uppercase", color: C.sunset, marginBottom: 20, fontWeight: 700 }}>
                ★ Featured Partners
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20, alignItems: "start" }}>
                {featured.map(b => (
                  <FeaturedBusinessCard key={b.id} business={b} />
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Directory list — grouped by category */}
        {Object.entries(grouped).map(([category, businesses]) => (
          <FadeIn key={category} delay={120}>
            <div style={{ marginBottom: 40 }}>
              {/* Category group header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 2px 0" }}>
                <div style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 10, fontWeight: 700, letterSpacing: 3.5,
                  textTransform: "uppercase",
                  color: CAT_COLORS[category] || C.textMuted,
                  whiteSpace: "nowrap",
                }}>
                  {category}
                </div>
                <div style={{ flex: 1, height: 1, background: C.sand }} />
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>
                  {businesses.length}
                </div>
              </div>
              {businesses.map(b => <BusinessRow key={b.id} business={b} />)}
            </div>
          </FadeIn>
        ))}

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

// Featured business — editorial dark card
function FeaturedBusinessCard({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  return (
    <div
      style={{
        background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`,
        borderRadius: 12, padding: "28px",
        border: "1px solid rgba(255,255,255,0.07)",
        transition: "transform 0.2s, border-color 0.2s",
        display: "flex", flexDirection: "column",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = `${color}50`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >
      {/* Logo / photo area */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 8, flexShrink: 0, overflow: "hidden",
          background: "rgba(255,255,255,0.05)",
          border: `1.5px dashed ${business.logo ? "transparent" : "rgba(255,255,255,0.18)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {business.logo ? (
            <img src={business.logo} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.22)", textAlign: "center", lineHeight: 1.5 }}>
              Add<br/>Logo
            </span>
          )}
        </div>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunset }}>
          ★ Featured Partner
        </div>
      </div>
      <CategoryPill dark>{business.category}</CategoryPill>
      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.cream, margin: "12px 0 10px 0", lineHeight: 1.25 }}>
        {business.name}
      </h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 20px 0", flex: 1 }}>
        {business.description}
      </p>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>
          {business.phone}
        </span>
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, textDecoration: "none" }}>
            Visit →
          </a>
        )}
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

      {/* Name + phone */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, minWidth: 0, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text, fontWeight: 400 }}>
          {business.name}
        </span>
        {business.phone && (
          <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap" }}>
            {business.phone}
          </span>
        )}
      </div>

      {/* Visit link, or claim prompt if no contact info */}
      {business.website ? (
        <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sage, textDecoration: "none", whiteSpace: "nowrap" }}>
          Visit →
        </a>
      ) : !business.phone ? (
        <a href="#submit" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, color: C.driftwood, textDecoration: "none", whiteSpace: "nowrap", opacity: 0.7 }}>
          Claim listing →
        </a>
      ) : (
        <span style={{ fontSize: 13, color: C.sand }}>—</span>
      )}
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

              {/* Yeti Groove Media callout */}
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
                  Yeti Groove Media
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
                <a href={item.href} target={item.external ? "_blank" : "_self"} rel={item.external ? "noopener noreferrer" : undefined} style={{
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({ name: "", category: "", phone: "", website: "", email: "", description: "", upgrade: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const endpoint = tab === "business" ? "/api/submit-business" : "/api/submit-event";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setSubmitError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
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
function Navbar({ activeSection, scrollTo, isSubPage = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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

  const solid = scrollY > 60 || menuOpen;

  const handleNavClick = (id) => {
    setMenuOpen(false);
    if (id === "happening") {
      window.location.href = "/happening";
      return;
    }
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
        background: solid ? "rgba(250,246,239,0.97)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: solid ? `1px solid ${C.sand}` : "none",
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <div style={{ cursor: "pointer" }} onClick={() => handleNavClick("home")}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: solid ? C.dusk : C.cream, transition: "color 0.35s" }}>
              Manitou Beach
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: solid ? C.sage : "rgba(255,255,255,0.5)", marginTop: -2, transition: "color 0.35s" }}>
              on Devils Lake
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
            {/* Gallery external link */}
            <a
              href="https://photogallery.yetigroove.com/folder/muVgmuXuvFwI/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 12, fontWeight: 500, letterSpacing: 0.5,
                padding: "7px 13px", borderRadius: 6,
                color: solid ? C.textLight : "rgba(255,255,255,0.7)",
                textDecoration: "none", transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = solid ? C.sageDark : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = solid ? C.textLight : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
            >
              Gallery ↗
            </a>
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

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ============================================================
// 📅  /happening — FULL PAGE
// ============================================================
function HappeningPage() {
  const weeklyEvents = EVENTS.filter(e => e.date.toLowerCase().startsWith("every"));
  const calendarEvents = EVENTS.filter(e => !e.date.toLowerCase().startsWith("every"));
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <Navbar activeSection="happening" scrollTo={subScrollTo} isSubPage={true} />
      <HappeningHero />
      <WeeklyEventsSection events={weeklyEvents} />
      <CalendarSection events={calendarEvents} />
      <VideoSection />
      <HappeningSubmitCTA />
      <Footer scrollTo={subScrollTo} />
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

// ============================================================
// 🌐  APP ROOT
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/happening" element={<HappeningPage />} />
      </Routes>
    </BrowserRouter>
  );
}
