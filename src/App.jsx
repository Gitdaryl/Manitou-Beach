import { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
        box-shadow: 0 0 30px rgba(212,132,90,0.12), 0 12px 40px rgba(0,0,0,0.3) !important;
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
    description: "Michigan craft beer, wine, and spirits in a gorgeous outdoor setting with twinkly lights. Trivia Wednesdays, live music, and a menu built for lake days.",
    address: "735 Manitou Rd, Manitou Beach",
    featured: true,
    logo: "/images/bootjack_logo.png",
    website: "https://bootjacktavern.com",
    phone: "(517) 252-5475",
  },
  {
    id: 3,
    name: "Two Lakes Tavern",
    category: "Food & Drink",
    description: "Family-owned lakeside restaurant known for their smoked entrees and a big menu full of options. Right on the shores of Devils Lake.",
    address: "110 Walnut St, Manitou Beach",
    village: true,
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
    logo: "/images/yacht_club_logo.png",
    website: "https://www.devilslakeyachtclub.com",
    phone: "",
  },
  {
    id: 5,
    name: "Manitou Beach Marina",
    category: "Boating & Water",
    description: "Pontoon boat sales, rentals, dock slip leases, boating repair, and winter storage. Your one-stop shop for getting out on the water.",
    featured: false,
    logo: "/images/marina_logo.png",
    website: "https://manitoubeachmarina.com",
    phone: "",
  },
  {
    id: 6,
    name: "Devils Lake Water Sports",
    category: "Boating & Water",
    description: "Boat rentals and water sports on Devils Lake. Everything you need to make the most of a day on the water.",
    featured: false,
    logo: "/images/dl_watersports_logo.png",
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
    logo: "/images/yeti_logo.png",
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
  {
    id: 13,
    name: "Chateau Aeronautique Winery",
    category: "Breweries & Wineries",
    description: "Aviation-themed winery in Jackson with a year-round all-weather Biergarten, live tribute concerts every weekend, and Michigan-crafted wines. The Irish Hills' go-to entertainment venue.",
    address: "1849 E Parnall Rd, Jackson",
    featured: false,
    logo: "/images/chateau_logo.png",
    website: "https://chateauaeronautique.com",
    phone: "(517) 795-3620",
  },
  {
    id: 14,
    name: "Cherry Creek Cellars",
    category: "Breweries & Wineries",
    description: "Brooklyn's neighborhood winery — small-batch Michigan wines, a tasting room with character, and a laid-back vibe that feels like visiting a friend's place.",
    address: "5765 Wamplers Lake Rd, Brooklyn",
    featured: false,
    logo: "/images/cherry_creek_logo.png",
    website: "https://cherrycreekcellars.com",
    phone: "(517) 592-4848",
  },
  {
    id: 15,
    name: "Gypsy Blue Vineyards",
    category: "Breweries & Wineries",
    description: "Coming soon to the Irish Hills. A new vineyard and tasting room bringing Michigan wine culture to the heart of lake country.",
    featured: false,
    logo: "/images/gypsy_blue_logo.png",
    website: "",
    phone: "",
  },
  {
    id: 16,
    name: "Ang & Co",
    category: "Shopping & Gifts",
    description: "Dirty sodas, satellite wine tasting (Chateau Fontaine, Leelanau Peninsula), custom sweatshirt and t-shirt printing, and curated gifts. A little bit of everything on Lakeview Blvd.",
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
    description: "Scrapbooking supplies, craft workshops, and satellite wine tasting (Cherry Creek Cellars). A creative hub in the heart of Manitou Beach village.",
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
    description: "High-end fashion, curated home goods, and the iconic lighthouse replica out front. The anchor of Manitou Beach village — and a satellite wine tasting venue launching May 2026.",
    address: "200 Devils Lake Hwy, Manitou Beach",
    village: true,
    featured: false,
    website: "http://devilslakeviewliving.com",
    phone: "(517) 252-5287",
  },
  {
    id: 19,
    name: "Devils Lake Inn",
    category: "Stays & Lodging",
    description: "Six stylish, modern apartments available year-round. Walking distance to the village shops, the lake, and everything Manitou Beach has to offer.",
    address: "103 Walnut Street, Manitou Beach",
    village: true,
    featured: false,
    website: "https://www.devilslakeinn.com",
    phone: "(517) 252-5017",
  },
  {
    id: 20,
    name: "Michigan Gypsy",
    category: "Shopping & Gifts",
    description: "A gift boutique with personality — unique finds, local goods, and the kind of shop you stumble into and don't want to leave.",
    address: "136 North Lakeview Blvd., Manitou Beach",
    village: true,
    featured: false,
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
    website: "https://www.blackbirdcafedevils.com",
    phone: "(567) 404-9655",
  },
];

// Category → accent color mapping (used by directory + business rows)
const CAT_COLORS = {
  "Real Estate":        C.lakeBlue,
  "Food & Drink":       C.sunset,
  "Boating & Water":    C.sage,
  "Breweries & Wineries": "#8B5E3C",
  "Shopping & Gifts":   "#B07D62",
  "Stays & Lodging":    C.lakeBlue,
  "Film & Video":       C.driftwood,
  "Home Services":      C.sageDark,
};

// ============================================================
// 📅  EVENTS DATA
// ============================================================
const EVENTS = [
  // ── RECURRING (weekly) ──
  { id: 1, name: "Friday Night Fish Fry", date: "Every Friday", time: "Dinner", category: "Food & Social", cost: "$$", description: "A weekly Devils Lake tradition at the Yacht Club. Fresh fish, cold drinks, and the best view on the lake.", location: "Devils Lake Yacht Club" },
  { id: 2, name: "Live Music at the Yacht Club", date: "Every Friday & Saturday", time: "Evening", category: "Live Music", cost: "Free", description: "Live entertainment on the water all season long at Devils Lake Yacht Club.", location: "Devils Lake Yacht Club" },
  { id: 3, name: "Trivia Night at Boot Jack Tavern", date: "Every Wednesday", time: "Evening", category: "Food & Social", cost: "Free", description: "Test your knowledge with the locals at Boot Jack Tavern. Michigan craft beer on tap.", location: "Boot Jack Tavern, 735 Manitou Rd" },
  { id: 4, name: "Sunday Sailboat Races", date: "Every Sunday (Summer)", time: "Afternoon", category: "Sports & Outdoors", cost: "Free to watch", description: "Weekly sailboat races on Devils Lake hosted by the Yacht Club — a summer staple since the club's founding.", location: "Devils Lake Yacht Club" },
  // ── ONE-OFF / SPECIAL EVENTS (sorted by date) ──
  { id: 101, name: "Grateful Dead Tribute — Cosmic Rose", date: "2026-02-27", time: "7:00 PM", category: "Live Music", cost: "Ticket", description: "An evening of Grateful Dead classics at Chateau Aeronautique Winery with dinner and drinks.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 100, name: "Bob Seger Tribute — Kat Mandu", date: "2026-02-28", time: "7:00 PM", category: "Live Music", cost: "Ticket", description: "Live tribute to Bob Seger at Chateau Aeronautique Winery. Dinner and beverages available in the all-weather Biergarten.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 102, name: "Bon Jovi Tribute — Wanted", date: "2026-03-07", time: "7:00 PM", category: "Live Music", cost: "Ticket", description: "Bon Jovi tribute night at Chateau Aeronautique. Full dinner and craft beverage menu.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 103, name: "Neil Young Tribute — Sugar Mountain", date: "2026-03-13", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Sugar Mountain performs Neil Young classics at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 104, name: "Queen Tribute — Simply Queen", date: "2026-03-14", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Simply Queen brings the Freddie Mercury experience to the Irish Hills.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 105, name: "Journey Tribute — Infinity & Beyond", date: "2026-03-20", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Don't stop believin'. Journey tribute night at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 106, name: "Tom Petty Tribute — Teddy Petty", date: "2026-03-21", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Teddy Petty & The Refugees perform Tom Petty classics at Chateau Aeronautique.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 107, name: "Linkin Park Tribute — Land of Linkin", date: "2026-03-27", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Linkin Park tribute at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 120, name: "Lenten Retreat — Catholic Young Adults", date: "2026-03-27", time: "6:30 PM", category: "Community", cost: "Free", description: "Detroit & Lansing Catholic Young Adults Lenten Retreat at Vineyard Lake.", location: "The Carls Family Village, Vineyard Lake" },
  { id: 108, name: "Def Leppard Tribute — Armageddon", date: "2026-03-28", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Def Leppard tribute night at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 109, name: "Mötley Crüe Tribute — Wrëking Crüe", date: "2026-04-03", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Mötley Crüe tribute bringing the wild energy to Chateau Aeronautique.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 110, name: "80's Night — HairMania", date: "2026-04-04", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Full 1980s tribute night at Chateau Aeronautique Winery. Big hair, bigger riffs.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 111, name: "Led Zeppelin Tribute — Kashmir", date: "2026-04-11", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Kashmir performs Led Zeppelin at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 112, name: "Ozzy Tribute — Ozzy Rebourne", date: "2026-04-18", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Ozzy Osbourne tribute with Awaken at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 113, name: "Metallica Tribute — Battery", date: "2026-04-24", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Metallica tribute by Battery with Flowers on the Grave at Chateau Aeronautique.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 114, name: "Stevie Nicks Tribute — Street Angel", date: "2026-04-25", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Street Angel performs Stevie Nicks classics at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 115, name: "STP / Coldplay / Killers — Stone Cold Killers", date: "2026-05-01", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "Triple tribute: Stone Temple Pilots, Coldplay, and The Killers at Chateau Aeronautique.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 116, name: "Van Halen Tribute — PANAMA", date: "2026-05-02", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "PANAMA brings Van Halen to the Irish Hills at Chateau Aeronautique Winery.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 117, name: "AC/DC Tribute — ThunderStruck", date: "2026-05-15", time: "8:00 PM", category: "Live Music", cost: "Ticket", description: "ThunderStruck with Blaine Luis Band performing AC/DC at Chateau Aeronautique.", location: "Chateau Aeronautique Winery, Onsted" },
  { id: 130, name: "Satellite Wine Tasting Rooms Launch", date: "2026-05-22", time: "Afternoon", category: "Food & Social", cost: "Varies", description: "Local businesses become satellite tasting rooms for Michigan wineries. Ang & Co pours Chateau Fontaine (Leelanau Peninsula), Faust House represents Cherry Creek Cellars (Brooklyn), and more venues TBA. A new way to explore Michigan wine without leaving the lake.", location: "Multiple venues — Manitou Beach" },
  { id: 118, name: "Irish Hills Music Festival", date: "2026-07-01", time: "All Day", category: "Live Music", cost: "Free", description: "Free annual music festival supporting Michigan Parkinson's Disease Foundation and area hospices. 501(c)(3) nonprofit — live music, food trucks, community gathering.", location: "Irish Hills Area" },
  { id: 5, name: "Devils Lake Yacht Regatta", date: "2026-09-15", time: "All Day", category: "Sports & Outdoors", cost: "Free to watch", description: "The annual regatta on Devils Lake — a beloved tradition since 1941. Sailboat racing, community gathering, and lake life at its best.", location: "Devils Lake Yacht Club" },
  { id: 119, name: "Irish Hills Gravel Race", date: "2026-10-17", time: "Morning", category: "Sports & Outdoors", cost: "$100 entry", description: "Gravel cycling event with 100km, 50km, and mini course options. Part of the 2026 Michigan Gravel Race Series.", location: "Michigan International Speedway, Brooklyn" },
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
  const items = EVENTS.map(e => `${e.name} · ${e.date}`);
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <a href="/happening" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: `linear-gradient(90deg, ${C.night} 0%, ${C.dusk} 50%, ${C.night} 100%)`,
        padding: "14px 0",
        overflow: "hidden",
        position: "relative",
        borderBottom: `1px solid ${C.sage}20`,
      }}>
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(270deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div className="marquee-track" style={{ whiteSpace: "nowrap" }}>
          {repeated.map((item, i) => (
            <span key={i} style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: C.sunsetLight,
              padding: "0 24px",
              display: "inline-flex",
              alignItems: "center",
              gap: 24,
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

  // ── DEFAULT HERO (with parallax) ──
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => { if (window.scrollY < window.innerHeight * 1.2) setScrollY(window.scrollY); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      {/* Fallback color behind video */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${C.night} 0%, ${C.lakeDark} 60%, ${C.dusk} 100%)`, zIndex: 0 }} />

      {/* Looping video background — parallax */}
      <video
        autoPlay muted loop playsInline
        style={{
          position: "absolute", inset: 0, width: "100%", height: "120%", objectFit: "cover", zIndex: 1,
          transform: `translateY(${scrollY * 0.3}px)`, willChange: "transform",
        }}
      >
        <source src="/videos/hero-default.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(26,40,48,0.6) 0%, rgba(26,40,48,0.35) 50%, rgba(26,40,48,0.75) 100%)", zIndex: 2 }} />

      {/* Floating ambient elements */}
      <div style={{ position: "absolute", top: "20%", right: "15%", width: 200, height: 200, borderRadius: "50%", background: `${C.sage}08`, zIndex: 2, animation: "float-slow 8s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "25%", left: "10%", width: 120, height: 120, borderRadius: "50%", background: `${C.sunset}06`, zIndex: 2, animation: "float 6s ease-in-out infinite 2s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "60%", right: "8%", width: 60, height: 60, borderRadius: "50%", border: `1px solid ${C.sage}15`, zIndex: 2, animation: "float-slow 10s ease-in-out infinite 1s", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 3, maxWidth: 960, margin: "0 auto", padding: "160px 48px 120px", transform: `translateY(${scrollY * 0.08}px)` }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
          <div style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)", marginBottom: 24,
            animation: loaded ? "tracking-in 0.8s ease forwards" : "none",
          }}>
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
// 📰  INLINE NEWSLETTER CTA (compact banner)
// ============================================================
function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); if (!email) return; console.log("Newsletter signup:", email); setDone(true); };

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
      {done ? (
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.sage, fontWeight: 600 }}>
          You're in!
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
            style={{
              padding: "10px 16px", borderRadius: 6, border: `1.5px solid ${C.sand}`,
              background: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif",
              color: C.text, outline: "none", minWidth: 200,
            }}
          />
          <Btn variant="primary" small>Subscribe</Btn>
        </form>
      )}
    </div>
  );
}

// ============================================================
// 📅  12-MONTH ROLLING EVENT TIMELINE
// ============================================================
function EventTimeline() {
  const [notionEvents, setNotionEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [lightboxEvent, setLightboxEvent] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setNotionEvents(data.events || []))
      .catch(() => {});
  }, []);

  // Merge hardcoded EVENTS (that have real dates) + Notion events
  const allEvents = [
    ...EVENTS.filter(e => !e.date.toLowerCase().startsWith("every") && e.date !== "TBA 2026").map(e => ({
      id: `local-${e.id}`, name: e.name, date: e.date.includes("September") ? "2026-09-15" : e.date,
      category: e.category, description: e.description, time: e.time, location: "", imageUrl: null,
    })),
    ...notionEvents,
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Build 12-month range
  const now = new Date();
  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ label: d.toLocaleDateString("en-US", { month: "short" }), year: d.getFullYear(), month: d.getMonth(), date: d });
  }
  const startDate = months[0].date;
  const endDate = new Date(months[11].date.getFullYear(), months[11].date.getMonth() + 1, 0);
  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

  const getPosition = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    const dayOffset = (d - startDate) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (dayOffset / totalDays) * 100));
  };

  const categoryColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };

  // Desktop: horizontal | Mobile: vertical
  return (
    <section style={{ background: C.night, padding: "80px 24px", overflow: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn direction="left">
          <SectionLabel light>12-Month View</SectionLabel>
          <SectionTitle light>Event Timeline</SectionTitle>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 48, maxWidth: 480, lineHeight: 1.7 }}>
            Plan ahead. Hover to preview, click for full details.
          </p>
        </FadeIn>

        {/* === DESKTOP HORIZONTAL TIMELINE === */}
        <div className="timeline-desktop" style={{ position: "relative" }}>
          {/* Month labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, paddingRight: 20 }}>
            {months.map((m, i) => (
              <FadeIn key={i} delay={i * 30} direction="none">
                <div style={{ textAlign: "center", minWidth: 0 }}>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: m.month === now.getMonth() && m.year === now.getFullYear() ? C.sunsetLight : "rgba(255,255,255,0.25)" }}>
                    {m.label}
                  </div>
                  {(i === 0 || m.month === 0) && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", fontFamily: "'Libre Franklin', sans-serif", marginTop: 2 }}>{m.year}</div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Timeline track */}
          <div
            ref={scrollRef}
            style={{ position: "relative", height: 160, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "visible" }}
          >
            {/* Track line — pulsating energy */}
            <div className="timeline-pulse" style={{ position: "absolute", top: 30, left: 20, right: 20, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              {/* "Now" marker — breathing */}
              <div className="timeline-dot-breathe" style={{ position: "absolute", left: 0, top: -5, width: 12, height: 12, borderRadius: "50%", background: C.sunset, color: C.sunset }}>
                <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 8, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight, whiteSpace: "nowrap" }}>NOW</div>
              </div>
            </div>

            {/* Month dividers */}
            {months.slice(1).map((m, i) => {
              const pos = getPosition(`${m.year}-${String(m.month + 1).padStart(2, "0")}-01`);
              return (
                <div key={i} style={{ position: "absolute", left: `calc(20px + ${pos}% * (100% - 40px) / 100)`, top: 20, bottom: 20, width: 1, background: "rgba(255,255,255,0.04)" }} />
              );
            })}

            {/* Event dots */}
            {allEvents.map((event) => {
              const pos = getPosition(event.date);
              const color = categoryColors[event.category] || C.sage;
              const isActive = activeEvent?.id === event.id;
              return (
                <div
                  key={event.id}
                  style={{ position: "absolute", left: `calc(20px + ${pos}% * (100% - 40px) / 100)`, top: 24, transform: "translateX(-50%)", zIndex: isActive ? 10 : 1, cursor: "pointer" }}
                  onMouseEnter={() => setActiveEvent(event)}
                  onMouseLeave={() => setActiveEvent(null)}
                  onClick={() => setLightboxEvent(event)}
                >
                  {/* Dot */}
                  <div style={{
                    width: isActive ? 16 : 10, height: isActive ? 16 : 10,
                    borderRadius: "50%", background: color,
                    border: `2px solid ${isActive ? C.cream : color}`,
                    boxShadow: isActive ? `0 0 16px ${color}60` : "none",
                    transition: "all 0.2s ease",
                  }} />

                  {/* Hover preview card */}
                  {isActive && (
                    <div style={{
                      position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
                      background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.night} 100%)`,
                      border: `1px solid ${color}40`, borderRadius: 10,
                      padding: "14px 18px", minWidth: 220, maxWidth: 280,
                      boxShadow: `0 12px 40px rgba(0,0,0,0.4)`,
                      animation: "float 0.3s ease forwards",
                      whiteSpace: "normal",
                    }}>
                      {event.imageUrl && (
                        <img src={event.imageUrl} alt="" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 6, marginBottom: 10 }} />
                      )}
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color, marginBottom: 4 }}>
                        {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.cream, marginBottom: 4, lineHeight: 1.3 }}>
                        {event.name}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                        {event.description.slice(0, 100)}{event.description.length > 100 ? "..." : ""}
                      </div>
                      {event.time && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{event.time}{event.location ? ` · ${event.location}` : ""}</div>}
                      <div style={{ fontSize: 9, color, marginTop: 8, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Click for details</div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {allEvents.length === 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif" }}>
                  Events will appear here as they're submitted
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === MOBILE VERTICAL TIMELINE === */}
        <div className="timeline-mobile" style={{ display: "none" }}>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${C.sunset}, ${C.sage}, transparent)`, borderRadius: 1 }} />

            {allEvents.length === 0 && (
              <div style={{ padding: "40px 0", fontSize: 13, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif" }}>
                Events will appear as they're submitted
              </div>
            )}

            {allEvents.map((event, i) => {
              const color = categoryColors[event.category] || C.sage;
              return (
                <div key={event.id} onClick={() => setLightboxEvent(event)} style={{ marginBottom: 28, cursor: "pointer", position: "relative" }}>
                  {/* Dot on the line */}
                  <div style={{ position: "absolute", left: -27, top: 6, width: 10, height: 10, borderRadius: "50%", background: color, border: `2px solid ${C.night}` }} />
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color, marginBottom: 2 }}>
                    {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, marginBottom: 4, lineHeight: 1.3 }}>
                    {event.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                    {event.description.slice(0, 80)}{event.description.length > 80 ? "..." : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LIGHTBOX — reuse shared component */}
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />

      {/* Mobile/desktop toggle styles */}
      <style>{`
        @media (max-width: 768px) {
          .timeline-desktop { display: none !important; }
          .timeline-mobile { display: block !important; }
        }
      `}</style>
    </section>
  );
}

// ============================================================
// 📅  WHAT'S HAPPENING — home page teaser (3 events)
// ============================================================
function HappeningSection() {
  const categoryColors = {
    "Live Music": C.sunset,
    "Food & Social": "#8B5E3C",
    "Sports & Outdoors": C.sage,
    Community: C.lakeBlue,
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
function WeeklyEventsSection({ events, onEventClick }) {
  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };
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
            const color = eventCatColors[event.category] || C.sage;
            const day = dayLabels[event.date] || event.date;
            return (
              <FadeIn key={event.id} delay={i * 60}>
                <div
                  onClick={() => onEventClick(event)}
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
          <div className="link-hover-underline" style={{
            fontSize: 10, fontFamily: "'Libre Franklin', sans-serif",
            fontWeight: 700, letterSpacing: 1.2,
            color: C.sunsetLight, textTransform: "uppercase",
          }}>
            {place.actionLabel} →
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function ExploreSection() {
  const places = [
    { icon: "⛵", name: "Devils Lake", desc: "600+ acres of water for boating, fishing, and kayaking. The party lake.", image: "/images/explore-devils-lake.jpg", action: () => window.open("https://maps.google.com/?q=Devils+Lake+Manitou+Beach+MI", "_blank"), actionLabel: "Open in Maps" },
    { icon: "🏘️", name: "The Village", desc: "Boutique shops, a handmade cafe, wine tasting, and the lighthouse. The walkable heart of Manitou Beach.", image: "/images/explore-lighthouse.jpg", action: () => window.location.href = "/village", actionLabel: "Explore the Village" },
    { icon: "🌿", name: "Irish Hills", desc: "Rolling hills, hidden trails, and enough nature to justify the drive.", image: "/images/explore-Irish-hills.jpg", action: () => window.open("https://www.irishhills.com", "_blank"), actionLabel: "Explore Irish Hills" },
    { icon: "🍺", name: "Nightlife", desc: "Year-round bars and restaurants with a dock-side state of mind.", image: "/images/explore-nightlife.jpg", action: () => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" }), actionLabel: "See Businesses" },
    { icon: "🎣", name: "Fishing", desc: "Bass, pike, bluegill, and walleye. Two lakes, twelve months of catching.", image: "/images/explore-fishing.jpg", action: () => window.open("https://www.michigan.gov/dnr/managing-resources/fisheries", "_blank"), actionLabel: "Fishing Info" },
    { icon: "🍷", name: "Wineries", desc: "Michigan wine and craft beverages, right in the Irish Hills.", image: "/images/Explore-wineries.jpg", action: () => document.getElementById("businesses")?.scrollIntoView({ behavior: "smooth" }), actionLabel: "See Wineries" },
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {places.slice(0, 2).map((p, i) => (
            <ExploreCard key={i} place={p} large delay={i * 100} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {places.slice(2).map((p, i) => (
            <ExploreCard key={i + 2} place={p} delay={200 + i * 60} />
          ))}
        </div>

        <FadeIn delay={400}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Btn onClick={() => window.open("https://maps.google.com/?q=Manitou+Beach+Michigan+49267", "_blank")} variant="dark">Get Directions</Btn>
          </div>
        </FadeIn>
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

        {/* Featured listings — horizontal scroll showcase */}
        {featured.length > 0 && (
          <FadeIn delay={100} direction="right">
            <div style={{ marginBottom: 60 }}>
              <div
                className="horizontal-scroll"
                style={{
                  display: "flex", gap: 24, overflowX: "auto",
                  scrollSnapType: "x mandatory", padding: "8px 4px 20px",
                  margin: "0 -4px",
                }}
              >
                {featured.map(b => (
                  <div key={b.id} style={{ minWidth: 340, maxWidth: 380, flex: "0 0 auto", scrollSnapAlign: "start" }}>
                    <FeaturedBusinessCard business={b} />
                  </div>
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

// Featured business — editorial dark card with glow + tilt
function FeaturedBusinessCard({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  const tilt = useCardTilt(4);
  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="card-tilt featured-card-glow"
      style={{
        background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`,
        borderRadius: 14, padding: "18px 20px",
        border: "1px solid rgba(255,255,255,0.07)",
        height: "auto",
        minHeight: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 14, pointerEvents: "none",
        background: `linear-gradient(110deg, transparent 30%, ${C.sunset}08 50%, transparent 70%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 4s ease-in-out infinite",
      }} />
      {/* Compact horizontal layout: logo + info */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{
          width: 56, height: 56, borderRadius: 10, flexShrink: 0, overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
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
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.cream, margin: "0 0 6px 0", lineHeight: 1.25 }}>
            {business.name}
          </h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 6px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {business.description}
          </p>
          {business.address && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4, fontStyle: "italic" }}>
              {business.address}
            </div>
          )}
          {business.phone && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", marginBottom: 6 }}>
              {business.phone}
            </div>
          )}
          {business.website && (
            <a href={business.website} target="_blank" rel="noopener noreferrer" className="link-hover-underline" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, textDecoration: "none" }}>
              Visit →
            </a>
          )}
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
      {/* Subtle texture + decorative waveform */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(ellipse 80% 60% at 80% 50%, ${C.lakeBlue}15 0%, transparent 70%)`,
      }} />
      {/* Large decorative quotation mark */}
      <div style={{
        position: "absolute", top: 40, left: 40, zIndex: 0,
        fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(200px, 30vw, 400px)",
        color: "rgba(255,255,255,0.02)", lineHeight: 0.8, userSelect: "none", pointerEvents: "none",
      }}>"</div>
      {/* Floating ambient circles */}
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 150, height: 150, borderRadius: "50%", border: `1px solid ${C.sage}10`, animation: "float 8s ease-in-out infinite", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "15%", left: "60%", width: 80, height: 80, borderRadius: "50%", background: `${C.sunset}06`, animation: "float-slow 10s ease-in-out infinite 3s", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <FadeIn direction="left">
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
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
  const [form, setForm] = useState({ name: "", category: "", phone: "", website: "", email: "", description: "", upgrade: false, date: "", dateEnd: "", time: "", location: "" });

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

      // Upload image if present (event tab only)
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

      const endpoint = tab === "business" ? "/api/submit-business" : "/api/submit-event";
      const payload = tab === "event"
        ? { ...form, imageUrl }
        : form;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {input("date", "Event Date", "date")}
                    {input("dateEnd", "End Date (optional)", "date")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {input("time", "Time (e.g. 6:00 PM)")}
                    {input("location", "Location / Venue")}
                  </div>
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
                  {/* Image upload with preview */}
                  <div style={{
                    border: `1.5px dashed ${C.sand}`, borderRadius: 8, padding: "16px",
                    background: C.cream, textAlign: "center",
                  }}>
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
                          Add an event photo (optional)
                        </div>
                        <div style={{ fontSize: 11, color: C.textMuted, opacity: 0.6 }}>
                          Auto-compressed for fast loading
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
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
    if (id === "mens-club") { window.location.href = "/mens-club"; return; }
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
        background: solid ? "rgba(250,246,239,0.97)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        borderBottom: solid ? `1px solid ${C.sand}` : "none",
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
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: solid ? C.sage : "rgba(255,255,255,0.5)", marginTop: -2, transition: "color 0.35s" }}>
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
            {/* Community dropdown */}
            <div ref={comRef} style={{ position: "relative" }}>
              <button
                onClick={() => setComOpen(o => !o)}
                style={{
                  background: comOpen ? `${C.sage}18` : "transparent",
                  border: "none", color: solid ? C.textLight : "rgba(255,255,255,0.7)",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: 0.5,
                  padding: "7px 13px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = solid ? C.sageDark : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
                onMouseLeave={e => { if (!comOpen) { e.currentTarget.style.color = solid ? C.textLight : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; } }}
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
                    { label: "Men's Club", id: "mens-club" },
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
        {/* Community sub-links */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginTop: 8, fontFamily: "'Libre Franklin', sans-serif" }}>Community</div>
        {[
          { label: "Men's Club", id: "mens-club" },
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
  const isRecurring = event.date?.toLowerCase().startsWith("every");
  const dateDisplay = isRecurring ? event.date : (() => {
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
          <img src={event.imageUrl} alt={event.name} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 10, marginBottom: 20 }} />
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
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
        </div>

        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 4vw, 32px)", color: C.cream, margin: "14px 0 10px 0", fontWeight: 400, lineHeight: 1.2 }}>
          {event.name}
        </h2>

        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color, marginBottom: 16 }}>
          {dateDisplay}
          {event.dateEnd && ` — ${new Date(event.dateEnd + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
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

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: 0 }}>
          {event.description}
        </p>
      </div>
    </div>
  );
}

function HappeningPage() {
  const weeklyEvents = EVENTS.filter(e => e.date.toLowerCase().startsWith("every"));
  const calendarEvents = EVENTS.filter(e => !e.date.toLowerCase().startsWith("every"));
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const [lightboxEvent, setLightboxEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

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
      <EventTimeline />
      <WeeklyEventsSection events={weeklyEvents} onEventClick={setLightboxEvent} />
      <CalendarSection events={calendarEvents} onEventClick={setLightboxEvent} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
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
      <EventTicker />
      <NewsletterBar />
      <WaveDivider topColor={C.dusk} bottomColor={C.dusk} />
      <HappeningSection />
      <EventTimeline />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />
      <ExploreSection />
      <NewsletterInline />
      <BusinessDirectory />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.night} />
      <HollyYetiSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <LivingSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <SubmitSection />
      <AboutSection />
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
  { label: "Elevation", value: "~1,043 ft" },
  { label: "Water Clarity", value: "Very clear" },
  { label: "Origin", value: "Glacial kettle lake" },
  { label: "Watershed", value: "Bean Creek" },
];

const ROUND_LAKE_FISH = [
  { name: "Largemouth Bass", icon: "🎣", note: "Healthy population — best early morning before boat traffic" },
  { name: "Smallmouth Bass", icon: "🎣", note: "Rocky structure near shore" },
  { name: "Bluegill", icon: "🐟", note: "Excellent numbers — averaged 7\" in DNR surveys, 70% legal size" },
  { name: "Northern Pike", icon: "🐊", note: "Tip Up Festival favorite — ice fishing in February" },
  { name: "Walleye", icon: "🐟", note: "DNR stocked — trolling at 10–15 ft depths in summer" },
  { name: "Black Crappie", icon: "🐟", note: "Good catches, especially through the ice" },
  { name: "Yellow Perch", icon: "🐟", note: "Averaged 9\"+ in surveys — above state average" },
  { name: "Pumpkinseed Sunfish", icon: "☀️", note: "Abundant near weed beds" },
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
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3vw, 30px)", color: C.sunsetLight, fontWeight: 400, marginBottom: 8, lineHeight: 1.1 }}>
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {ROUND_LAKE_FISH.map((fish, i) => (
            <FadeIn key={i} delay={i * 50}>
              <div style={{
                background: C.cream, borderRadius: 12, padding: "24px",
                border: `1px solid ${C.sand}`, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{fish.icon}</span>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.text, margin: 0 }}>
                    {fish.name}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: 0 }}>
                  {fish.note}
                </p>
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
const VILLAGE_BUSINESSES = BUSINESSES.filter(b => b.village);

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
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.3), 0 0 0 1px ${color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Accent stripe */}
                  <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "14px 0 0 14px" }} />

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    {biz.logo && (
                      <img src={biz.logo} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.cream, margin: "0 0 4px 0", lineHeight: 1.3 }}>
                        {biz.name}
                      </h3>
                      <div style={{ fontSize: 11, color: color, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                        {biz.category}
                      </div>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, margin: "0 0 10px 0" }}>
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
      <VillageMapSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <VillageHistorySection />
      <DiagonalDivider topColor={C.cream} bottomColor={C.dusk} />
      <VillageVisitCTA />
      <WaveDivider topColor={C.night} bottomColor={C.cream} />
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
                        border: "none", cursor: "pointer",
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
    icon: "🎣",
  },
  {
    title: "Firecracker 7K Run/Walk",
    date: "July 4th — 8:00 AM",
    desc: "A Fourth of July tradition starting at 3171 Round Lake Hwy. Choose the 7K run/walk or 1-mile family fun run. Proceeds fund the Devils Lake fireworks display.",
    icon: "🏃",
  },
  {
    title: "Golf Outing",
    date: "Annual — Summer",
    desc: "A community golf outing that brings together members, local businesses, and supporters. All proceeds benefit the club's charitable programs.",
    icon: "⛳",
  },
  {
    title: "Benefit Auction & Raffle",
    date: "During Tip-Up Festival",
    desc: "The auction is the club's biggest fundraiser — local businesses and community members donate items. Proceeds support laptops for students, Toys for Tots, Shop with a Cop, and food pantries.",
    icon: "🎁",
  },
  {
    title: "Fireworks Display",
    date: "July 4th & Special Events",
    desc: "Working with the Devils & Round Lake Fireworks Association, the club helps fund and organize the summer fireworks display over Devils Lake.",
    icon: "🎆",
  },
  {
    title: "Community Service Days",
    date: "Year-round",
    desc: "Throughout the year, club members volunteer for lake cleanups, food drives, Christmas gift baskets, and support for families in need through the Community for People in Need program.",
    icon: "🤝",
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
      background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`,
      padding: "160px 24px 120px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", top: -60, right: -60, width: 350, height: 350, borderRadius: "50%", background: `${C.sunset}06`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 260, height: 260, borderRadius: "50%", background: `${C.sage}05`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
          501(c)(3) Nonprofit
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 20px 0" }}>
          Devils & Round Lake<br />Men's Club
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 }}>
          {MENS_CLUB_STATS.map((stat, i) => (
            <FadeIn key={i} delay={i * 60} direction="scale">
              <div style={{
                background: C.warmWhite, borderRadius: 12, padding: "22px 16px", textAlign: "center",
                border: `1px solid ${C.sand}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, fontWeight: 400, color: C.text }}>
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
                display: "flex", gap: 18, alignItems: "flex-start",
                background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "24px 22px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{evt.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.cream, margin: "0 0 4px 0" }}>{evt.title}</h3>
                  <div style={{ fontSize: 12, color: C.sunsetLight, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>{evt.date}</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>{evt.desc}</p>
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
    // { src: "/images/mens-club/tip-up-1.jpg", caption: "Tip-Up Festival 2024" },
    // { src: "/images/mens-club/firecracker-7k.jpg", caption: "Firecracker 7K" },
    // { src: "/images/mens-club/auction.jpg", caption: "Benefit Auction" },
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
    icon: "🎨",
    title: "Boat House Art Gallery",
    desc: "The largest nonprofit art gallery in Lenawee County, featuring work from over 50 artists. Located at 138 N. Lakeview Blvd — curating fine art from Michigan's Irish Hills community.",
    address: "138 North Lakeview Boulevard, Manitou Beach, MI 49253",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
  },
  {
    icon: "🎭",
    title: "Devils Lake Festival of the Arts",
    desc: "An annual summer art festival in the Village — 50 fine artists, 50 crafters, children's activities, live music, and food trucks. Free shuttle buses run all day between parking lots.",
    date: "Annual — Summer (10 AM – 6 PM)",
  },
  {
    icon: "🚗",
    title: "Classic Car Shows",
    desc: "Bringing car show enthusiasts together in the Village for community celebrations of automotive history and local culture.",
  },
  {
    icon: "🌊",
    title: "Land & Water Conservation",
    desc: "Active stewardship projects to protect and restore the natural environment around Devils Lake and the surrounding watershed.",
  },
  {
    icon: "🏗️",
    title: "Village Restoration",
    desc: "Ongoing renovation projects to restore historic buildings and infrastructure in Manitou Beach Village, preserving the area's architectural heritage.",
  },
  {
    icon: "🎒",
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
      background: `linear-gradient(145deg, ${C.night} 0%, ${C.dusk} 100%)`,
      padding: "160px 24px 120px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", top: -40, left: -40, width: 300, height: 300, borderRadius: "50%", background: `${C.sage}06`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `${C.sunset}05`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
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
                background: C.cream, borderRadius: 14, padding: "28px 24px",
                border: `1px solid ${C.sand}`, height: "100%",
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{prog.icon}</div>
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
    <section style={{ background: C.dusk, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
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
      <MBHRSTimelineSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <MBHRSProgramsSection />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <MBHRSBoatHouseFeature />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />
      <MBHRSSupportSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <NewsletterInline />
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
        <Route path="/historical-society" element={<HistoricalSocietyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
