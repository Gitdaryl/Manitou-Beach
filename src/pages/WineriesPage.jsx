import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 600);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, PageSponsorBanner, DiagonalDivider, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, PromoBanner } from '../components/Layout';
import SMSOptInWidget from '../components/SMSOptInWidget';
import { C } from '../data/config';
import { DISCOVER_MAP_STYLES, createDiscoverPin } from '../data/discover';
import yeti from '../data/errorMessages';

// ============================================================
// 🍷  WINERIES PAGE (/wineries)
// ============================================================
export const WINERY_VENUES = [
  // ── Village Tasting Rooms (opening Spring 2026) ──────────────────────
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
    openingDate: "Spring 2026",
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
    openingDate: "Spring 2026",
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
    openingDate: "Spring 2026",
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
    openingDate: "Spring 2026",
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
    distance: "~16 min from Manitou Beach",
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
    highlight: "Also poured at Faust House in the Village — opening soon",
    distance: "~13 min from Manitou Beach",
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
    distance: "~22 min from Manitou Beach",
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
    openingDate: "Spring 2026",
    hours: "Check website for current hours",
    highlight: "Wines + ciders + flower farm — a full afternoon stop",
    distance: "~6 min from Manitou Beach",
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
            Wine · Beer · Cider · Irish Hills · Manitou Beach Village
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 9vw, 110px)", fontWeight: 400, color: C.cream, lineHeight: 0.95, margin: "0 0 20px 0" }}>
            Wineries &<br />Breweries Trail
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 32px 0" }}>
            Michigan wine country meets lake country. From lakeside tasting rooms in the Village to full winery and brewery destinations in the Irish Hills — sip your way through wine, craft beer, and hard cider on one of the state's most scenic trails.
          </p>
          <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          <ShareBar title="Irish Hills Wineries & Breweries Trail — Manitou Beach" />
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
          <SectionLabel light>Opening Spring 2026</SectionLabel>
          <SectionTitle light center>The Village Comes Alive</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto 20px" }}>
            Four Manitou Beach Village shops are opening their doors as satellite tasting rooms for Michigan wineries. Walk the boulevard. Pop into a gallery. Pick up something for the cottage. Stay for a glass.
          </p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 32px", fontStyle: "italic" }}>
            Cherry Creek Cellars · French Road Cellars · Chateau Fontaine · Amoritas Vineyard · Brenman Family Winery — all in the Village, all within steps of the lake.
          </p>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Btn href="/village" variant="sunset">Explore the Village</Btn>
            <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              Exact date announced when licenses are approved
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function WineTrailNotifySection() {
  return (
    <section style={{ background: C.cream, padding: '64px 24px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(22px, 4vw, 30px)',
              fontWeight: 400,
              color: C.text,
              lineHeight: 1.25,
              marginBottom: 12,
            }}>
              Be the First to Know
            </div>
            <p style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 15,
              color: C.textLight,
              lineHeight: 1.75,
              maxWidth: 460,
              margin: '0 auto',
            }}>
              The Village tasting rooms are finishing up their final licensing approvals. Drop your number and we'll text you the moment the first pour is ready — no spam, just the good news.
            </p>
          </div>
          <SMSOptInWidget
            type="wine-trail"
            source="wineries"
            heading="Text me when the trail opens"
            subtext="One text when the first tasting room opens. That's it."
          />
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 17,
            color: C.textMuted,
            marginTop: 20,
            marginBottom: 0,
          }}>
            Four shops hosting five Michigan wineries — all within steps of the lake.
          </p>
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
  const [wineRankings, setWineRankings] = useState([]);
  useEffect(() => {
    fetch('/api/winery-ratings')
      .then(r => r.json())
      .then(d => {
        if (d.ratings) setRatings(d.ratings);
        if (d.wineRankings) setWineRankings(d.wineRankings);
      })
      .catch(() => {});
  }, []);
  return { ratings, wineRankings };
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
              {allComplete ? "Trail Complete — Well Done." : "Your Digital Trail Tracker"}
            </div>
            <div style={{ fontSize: 13, color: allComplete ? "rgba(255,255,255,0.5)" : C.textLight, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.65, marginBottom: 4 }}>
              {allComplete
                ? "You've visited every stop on the Manitou Beach Wine Trail. Show this screen at any participating venue — they'll know what it means."
                : "Track your stops online as you go. Visit a tasting room, hit '+ Stamp My Visit', rate your pour. Eight stops — Village walkabout + the full trail loop."}
            </div>
            {!allComplete && (
              <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 16 }}>
                Pick up a physical passport card at any tasting room counter — staff signs your card square and you earn 10% off a bottle.{" "}
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
              <img src="/images/icons/trophy-icon.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 4 }} />
              <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunset }}>Full Trail Badge</div>
            </div>
          )}
          {villageComplete && !allComplete && (
            <div style={{ textAlign: "center" }}>
              <img src="/images/icons/wine-rating.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 4 }} />
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
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, marginBottom: isMobile ? 14 : 10 }}>
      <div style={{ width: isMobile ? 80 : 110, fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: C.textMuted, flexShrink: 0, lineHeight: 1.3 }}>
        {label}{required && <span style={{ color: C.sunset }}> *</span>}
      </div>
      <div style={{ display: 'flex', gap: isMobile ? 4 : 2 }}>
        {[1,2,3,4,5].map(s => (
          <button
            key={s}
            onClick={() => onChange(s === value ? 0 : s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            // 44px minimum touch target on mobile (Apple HIG)
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? 28 : 24, padding: isMobile ? '8px 6px' : '1px 2px', minWidth: isMobile ? 44 : 'auto', minHeight: isMobile ? 44 : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s <= (hover || value) ? C.sunset : C.sand, transition: 'color 0.1s' }}
          >★</button>
        ))}
      </div>
      {!required && value === 0 && !isMobile && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>optional</span>}
    </div>
  );
}

function WineReviewModal({ venue, accent, onSuccess, onClose }) {
  const isMobile = useIsMobile();
  const [rating, setRating] = useState(0);
  const [service, setService] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);
  const [value, setValue] = useState(0);
  const [wineTried, setWineTried] = useState('');
  const [note, setNote] = useState('');
  const [firstName, setFirstName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [wineList, setWineList] = useState([]);

  useEffect(() => {
    fetch('/api/winery-wines')
      .then(r => r.json())
      .then(d => setWineList(d.wines || []))
      .catch(() => {});
  }, []);

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
          firstName: firstName.trim() || undefined,
          sessionId: getWineSessionId(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      onSuccess();
    } catch {
      setError(yeti.oops());
      onSuccess();
    }
  };

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,18,24,0.7)', zIndex: 1000,
        display: 'flex',
        // On mobile: pin to bottom like a sheet; on desktop: centre
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 24,
      }}
    >
      <div style={{
        background: C.warmWhite,
        borderRadius: isMobile ? '20px 20px 0 0' : 20,
        width: '100%',
        maxWidth: isMobile ? '100%' : 480,
        boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        maxHeight: isMobile ? '92vh' : '90vh',
        overflowY: 'auto',
        // Prevent rubber-band scroll bleeding through on iOS
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Drag handle on mobile */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.sand }} />
          </div>
        )}
        <div style={{ height: 5, background: accent }} />
        <div style={{ padding: isMobile ? '20px 16px 32px' : '28px 32px 32px' }}>
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
              list="wine-suggestions"
              value={wineTried}
              onChange={e => setWineTried(e.target.value)}
              placeholder="The dry rosé, Cabernet Franc, 2023 Riesling..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text, background: C.cream, outline: 'none', boxSizing: 'border-box' }}
            />
            <datalist id="wine-suggestions">
              {wineList.map(w => (
                <option key={w.id} value={w.fullName || w.name}>{w.name} — {w.venue}</option>
              ))}
            </datalist>
            {(() => {
              const match = wineList.find(w =>
                (w.fullName || w.name).toLowerCase() === wineTried.trim().toLowerCase()
              );
              if (!match || !match.category) return null;
              const catColors = { Red: '#8B3A3A', White: '#7A8E72', Sweet: '#C9A84C', 'Rosé': '#D4845A', 'Fruit & Specialty': '#5B7E95' };
              const bg = catColors[match.category] || C.sage;
              return (
                <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 20, background: bg, color: '#fff', fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 0.5 }}>
                  {match.category}
                </span>
              );
            })()}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 8 }}>
              Leave a comment? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — shows on site)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Loved the patio, ask for the reserve, perfect for a rainy afternoon..."
              rows={2}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text, background: C.cream, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {note.trim().length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 8 }}>
                First name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(shows with your comment)</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="e.g. Sarah"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text, background: C.cream, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          )}

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

function WineryCard({ v, i, isStamped, onStamp, venueRating, wineRankings, autoOpen }) {
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
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.text, margin: "0 0 6px 0" }}>{v.name}</h3>
              {venueRating && venueRating.count > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Amazon-style: bold score, filled stars, count */}
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 20, fontWeight: 700, color: C.sunset, lineHeight: 1 }}>
                    {venueRating.avg}
                  </span>
                  <span style={{ color: C.sunset, fontSize: 16, letterSpacing: 1 }}>
                    {'★'.repeat(Math.round(venueRating.avg))}{'☆'.repeat(5 - Math.round(venueRating.avg))}
                  </span>
                  <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
                    out of 5 &nbsp;·&nbsp; {venueRating.count.toLocaleString()} {venueRating.count === 1 ? 'rating' : 'ratings'}
                  </span>
                  {wineRankings && wineRankings.find(w => w.venue === v.name) && (
                    <span style={{ fontSize: 11, padding: '2px 10px', background: `${C.sunset}20`, color: C.sunset, borderRadius: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700 }}>
                      🏅 {wineRankings.find(w => w.venue === v.name)?.fullName || wineRankings.find(w => w.venue === v.name)?.name}
                    </span>
                  )}
                </div>
              ) : onStamp ? (
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", fontStyle: 'italic' }}>
                  Be the first to rate this stop →
                </div>
              ) : null}
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

          {/* Visitor comments */}
          {venueRating?.comments?.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {venueRating.comments.map((c, ci) => (
                <div key={ci} style={{ background: C.cream, borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${v.accent}40`, position: 'relative' }}>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.65, fontStyle: 'italic' }}>
                    "{c.note}"
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
                    {c.firstName ? `— ${c.firstName}` : '— Trail visitor'}
                    {c.wineTried && <span style={{ color: v.accent, marginLeft: 6 }}>· {c.wineTried}</span>}
                  </div>
                </div>
              ))}
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
      {showModal && ReactDOM.createPortal(
        <WineReviewModal
          venue={v.name}
          accent={v.accent}
          onSuccess={() => { onStamp(v.name); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />,
        document.body
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
    <section style={{ background: C.warmWhite, padding: '52px 24px' }}>
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
              Wineries & Breweries Trail Stops
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
    <section style={{ background: C.warmWhite, padding: '52px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
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
  const { ratings, wineRankings } = useWineryRatings();
  const stampSlug = new URLSearchParams(window.location.search).get('stamp') || '';

  return (
    <section style={{ background: C.cream, padding: "56px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <WinePassportWidget stamped={stamped} villageVenues={villageVenues} trailVenues={trailVenues} />

        {/* Village Tasting Rooms */}
        <FadeIn>
          <SectionLabel>In the Village</SectionLabel>
          <SectionTitle>Village Tasting Rooms</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 580, margin: "0 0 48px 0" }}>
            Four Village shops are opening their doors as satellite tasting rooms. Walk the boulevard — each stop is a new pour, a new story, all within steps of the lake.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 80 }}>
          {villageVenues.map((v, i) => <WineryCard key={i} v={v} i={i} isStamped={isStamped(v.name)} onStamp={toggleStamp} venueRating={ratings[v.name]} wineRankings={wineRankings} autoOpen={stampSlug === venueSlug(v.name)} />)}
        </div>

        {/* The Trail */}
        <FadeIn>
          <SectionLabel>Day Trips</SectionLabel>
          <SectionTitle>The Wineries & Breweries Trail</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 580, margin: "0 0 48px 0" }}>
            Pack the cooler, pick a starting point, and make a day of it. Meckleys to reset the palate, Cherry Creek for the laid-back pour, Chateau Aeronautique to close it out right.
          </p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 80 }}>
          {trailVenues.map((v, i) => <WineryCard key={i} v={v} i={i} isStamped={isStamped(v.name)} onStamp={toggleStamp} venueRating={ratings[v.name]} wineRankings={wineRankings} autoOpen={stampSlug === venueSlug(v.name)} />)}
        </div>

      </div>
    </section>
  );
}

const WINERY_ITINERARIES = [
  {
    title: "The Village Half-Day",
    duration: "2–3 Hours",
    badge: "Opening Soon",
    accent: C.sunset,
    intro: "Four tasting rooms, one boulevard, zero driving. Walk the Village loop — start anywhere, end at the lake.",
    stops: [
      { time: "11am", stop: "Faust House Scrap n Craft", note: "Cherry Creek pour — browse the shelves, stay for a glass" },
      { time: "11:30am", stop: "Ang & Co", note: "French Road Cellars + Chateau Fontaine — most variety in one stop" },
      { time: "Noon", stop: "Boathouse Art Gallery", note: "Amoritas Vineyard — gallery browse and a pour" },
      { time: "12:30pm", stop: "Devils Lake View Living", note: "Brenman Family Winery — fashion, home goods, lighthouse out front" },
      { time: "1pm", stop: "Lunch at Blackbird Cafe or Two Lakes Tavern", note: "Lakeside dining — you've earned it" },
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
    ],
  },
  {
    title: "The Full Weekend",
    duration: "2 Days",
    badge: "The Full Experience",
    accent: C.sage,
    intro: "All eight stops across two days. Village Saturday morning, trail Saturday afternoon and evening, Sunday wine country. The version you talk about all winter.",
    stops: [
      { time: "Sat AM", stop: "Village Tasting Rooms", note: "Walk all four stops — two hours, zero driving" },
      { time: "Sat Noon", stop: "Cherry Creek Cellars", note: "Lunch stop in Brooklyn — small-batch wines, laid-back room" },
      { time: "Sat Eve", stop: "Chateau Aeronautique", note: "Evening entertainment — live tribute bands, all-weather biergarten" },
      { time: "Sun Brunch", stop: "Meckleys Flavor Fruit Farm", note: "Brunch at the farm — fresh fruit, jams, the perfect wake-up" },
      { time: "Sun PM", stop: "Gypsy Blue Vineyards", note: "Flower farm, ciders, wines — the most scenic finish on the trail" },
    ],
  },
];

function WineriesItinerarySection() {
  return (
    <section style={{ background: C.night, padding: "64px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>How to Do It</SectionLabel>
          <SectionTitle light>Three Ways to Run the Trail</SectionTitle>
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
    <section style={{ background: C.dusk, padding: "64px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light>Plan Your Visit</SectionLabel>
          <SectionTitle light center>Make a Day of It</SectionTitle>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 36px" }}>
            Spend a morning at the lake, a leisurely lunch in the Village, an afternoon tasting at Chateau Aeronautique, and an evening back on the water. That's a Manitou Beach Saturday.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn href="/happening" variant="sunset">What's On This Weekend →</Btn>
            <Btn href="/village" variant="outlineLight" small>Explore the Village →</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function WineScoreboardSection() {
  const { ratings, wineRankings } = useWineryRatings();
  const [grow, setGrow] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const [activeWineCat, setActiveWineCat] = useState('all');

  const eligibleVenues = WINERY_VENUES.filter(v => v.section !== 'extended');
  const venueData = eligibleVenues
    .map(v => ({ ...v, r: ratings[v.name] || null }))
    .filter(v => v.r && v.r.count > 0);

  const totalReviews = venueData.reduce((s, v) => s + (v.r?.count || 0), 0);

  useEffect(() => { setDisplayCount(totalReviews); }, [totalReviews]);

  // Decorative tick — illusion of live movement, no API call
  useEffect(() => {
    if (totalReviews === 0) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.12) setDisplayCount(n => n + 1);
    }, 9000);
    return () => clearInterval(interval);
  }, [totalReviews]);

  useEffect(() => {
    const t = setTimeout(() => setGrow(true), 400);
    return () => clearTimeout(t);
  }, []);

  if (venueData.length === 0 && wineRankings.length === 0) return null;

  const MEDAL = ['#C9A84C', '#A8A8A8', '#C07B40'];

  const WINE_CATS = [
    { id: 'all',               label: 'All Wines',          color: C.sunset },
    { id: 'Red',               label: 'Red',                color: '#B84040' },
    { id: 'White',             label: 'White',              color: '#C9A84C' },
    { id: 'Sweet',             label: 'Sweet',              color: '#D4845A' },
    { id: 'Rosé',              label: 'Rosé',               color: '#C97B9A' },
    { id: 'Fruit & Specialty', label: 'Fruit & Specialty',  color: C.sage },
  ];

  const catColor = (cat) => WINE_CATS.find(c => c.id === cat)?.color || C.sunset;

  const filteredWines = activeWineCat === 'all'
    ? wineRankings
    : wineRankings.filter(w => w.category === activeWineCat);
  const topWines = filteredWines.slice(0, activeWineCat === 'all' ? 8 : 3);
  const maxWineCount = topWines[0]?.count || 1;

  const tickerItems = wineRankings.length > 0
    ? wineRankings.slice(0, 12).map(w => `${w.fullName || w.name}  ·  ${w.venue}  ·  ${w.count} ${w.count === 1 ? 'vote' : 'votes'}`)
    : venueData.flatMap(v => {
        const items = [];
        const s = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
        if (v.r.avg)            items.push(`${v.name}  ·  Wine Quality  ·  ${s(v.r.avg)}`);
        if (v.r.service_avg)    items.push(`${v.name}  ·  Hospitality  ·  ${s(v.r.service_avg)}`);
        if (v.r.atmosphere_avg) items.push(`${v.name}  ·  Atmosphere  ·  ${s(v.r.atmosphere_avg)}`);
        return items;
      });

  return (
    <section style={{ background: C.dusk, padding: '52px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header + live total */}
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <SectionLabel light>People's Choice</SectionLabel>
              <SectionTitle light>Season Standings</SectionTitle>
            </div>
            {totalReviews > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 48, fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>
                  {displayCount.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                  reviews this season
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* How it works — slim explainer */}
        <FadeIn delay={100}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }} className="scoreboard-explainer-grid">
            {[
              { n: '1', label: 'Stamp a stop', body: 'Visit any tasting room on the trail and stamp it in your passport.' },
              { n: '2', label: 'Rate what you tried', body: 'Name the wine and leave a star rating. Takes 30 seconds.' },
              { n: '3', label: 'Move the board', body: 'Every review is a vote. Top wines rise. Awards follow at season end.' },
            ].map(step => (
              <div key={step.n} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '20px 20px 18px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 32, color: C.sunset, lineHeight: 1, marginBottom: 8 }}>{step.n}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>{step.label}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Scrolling ticker */}
        {tickerItems.length > 0 && (
          <div style={{ overflow: 'hidden', marginBottom: 52, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px 0', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="scoreboard-ticker">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  padding: '0 28px',
                  fontSize: 12,
                  fontFamily: "'Libre Franklin', sans-serif",
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: 0.4,
                  whiteSpace: 'nowrap',
                }}>
                  {item}
                  <span style={{ marginLeft: 28, color: 'rgba(255,255,255,0.12)' }}>·</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Wine leaderboard — category tabs + ranked list */}
        <FadeIn>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {WINE_CATS.map(cat => (
                <button key={cat.id} onClick={() => setActiveWineCat(cat.id)} style={{
                  border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 20,
                  fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 0.3,
                  background: activeWineCat === cat.id ? cat.color : 'rgba(255,255,255,0.07)',
                  color: activeWineCat === cat.id ? '#fff' : 'rgba(255,255,255,0.4)',
                  transition: 'background 200ms, color 200ms',
                }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {wineRankings.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '36px 24px', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Baskerville', serif", marginBottom: 8 }}>
                  Wine Rankings — Coming This Season
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', fontFamily: "'Libre Franklin', sans-serif" }}>
                  Rate wines as you visit the trail — the leaderboard builds from your reviews.
                </div>
              </div>
            ) : topWines.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                No wines in this category yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topWines.map((wine, i) => {
                  const pct = Math.max(8, (wine.count / maxWineCount) * 82 + 18);
                  const color = catColor(wine.category);
                  return (
                    <div key={wine.id || wine.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: i < 3 ? MEDAL[i] : 'rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif",
                        color: i < 3 ? C.night : 'rgba(255,255,255,0.3)',
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ width: 200, flexShrink: 0, lineHeight: 1.3 }}>
                        <div className="scoreboard-venue-name" style={{
                          fontSize: 13, fontFamily: "'Libre Baskerville', serif",
                          color: i === 0 ? C.cream : 'rgba(255,255,255,0.6)',
                        }}>
                          {wine.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif" }}>
                          {wine.venue}
                        </div>
                      </div>
                      <div style={{
                        flexShrink: 0, fontSize: 10, fontFamily: "'Libre Franklin', sans-serif",
                        fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
                        background: color + '22', color: color, borderRadius: 4, padding: '3px 8px',
                      }}>
                        {wine.category}
                      </div>
                      <div style={{ flex: 1, height: 34, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                        <div
                          className={i === 0 ? 'scoreboard-bar scoreboard-leader-bar' : 'scoreboard-bar'}
                          style={{
                            width: grow ? `${pct}%` : '0%',
                            height: '100%',
                            background: i === 0
                              ? `linear-gradient(90deg, ${color} 0%, ${color}99 100%)`
                              : color + '55',
                            borderRadius: 6,
                            transition: `width ${600 + i * 100}ms ease-out`,
                          }}
                        />
                        {i === 0 && grow && (
                          <div style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            fontSize: 9, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
                            letterSpacing: 1.5, textTransform: 'uppercase', color: C.cream, pointerEvents: 'none',
                          }}>
                            Leading
                          </div>
                        )}
                      </div>
                      <div style={{
                        width: 32, textAlign: 'right', flexShrink: 0,
                        fontSize: 13, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif",
                        color: i === 0 ? '#C9A84C' : 'rgba(255,255,255,0.25)',
                      }}>
                        {wine.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.18)', fontFamily: "'Libre Franklin', sans-serif" }}>
              Updated as reviews are published · wines are nominated by visitors.
            </div>
          </div>
        </FadeIn>

        {/* Tasting Room Scores — service + atmosphere by venue */}
        {venueData.some(v => v.r?.service_avg || v.r?.atmosphere_avg) && (
          <FadeIn>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 18 }}>
                Tasting Room Scores
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {venueData
                  .filter(v => v.r?.service_avg || v.r?.atmosphere_avg)
                  .sort((a, b) => ((b.r?.service_avg || 0) + (b.r?.atmosphere_avg || 0)) - ((a.r?.service_avg || 0) + (a.r?.atmosphere_avg || 0)))
                  .map(v => {
                    const s = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
                    return (
                      <div key={v.name} style={{
                        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                        background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 16px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <div style={{ flex: 1, fontFamily: "'Libre Baskerville', serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', minWidth: 130 }}>
                          {v.name}
                        </div>
                        {v.r?.service_avg > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Hospitality</span>
                            <span style={{ color: C.sunset, fontSize: 12 }}>{s(v.r.service_avg)}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif" }}>{v.r.service_avg.toFixed(1)}</span>
                          </div>
                        )}
                        {v.r?.atmosphere_avg > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Atmosphere</span>
                            <span style={{ color: C.sunset, fontSize: 12 }}>{s(v.r.atmosphere_avg)}</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif" }}>{v.r.atmosphere_avg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </FadeIn>
        )}

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <Btn href="/rate" variant="outlineLight" small>Leave Your Rating →</Btn>
        </div>

      </div>
    </section>
  );
}

const WINE_PASSPORT_HOW = [
  { icon: '/images/icons/plan-map-icon.png',    title: 'Plan your stops',     desc: 'Eight venues across the Village and the Trail. One afternoon or a full day.' },
  { icon: '/images/icons/passport-icon.png',    title: 'Grab a passport card', desc: 'Pick one up at any tasting room counter. Grid on the back — one square per stop.' },
  { icon: '/images/icons/wine-rating.png',      title: 'Taste & scan',         desc: 'Scan the QR, pick your wine, leave a star rating. Takes 30 seconds.' },
  { icon: '/images/icons/stamp-offer-icon.png', title: 'Stamp + 10% off',      desc: 'Staff signs your card square. Each stamp earns 10% off a bottle — buy before you leave.' },
  { icon: '/images/icons/trophy-icon.png',      title: 'Live standings',       desc: 'Ratings post live as they come in. Scores go dark for the final 30 days — winners revealed at an October awards ceremony.' },
];

const WINERY_AWARD_CATEGORIES = [
  "Best Red Wine", "Best White Wine", "Best Sweet Wine",
  "Best Fruit or Specialty Wine", "Best Hard Cider",
  "Best Craft Ale or Brew", "Best Tasting Room Experience",
  "Outstanding Customer Hospitality", "Best Atmosphere",
];

function WineriesHowItWorksSection() {
  return (
    <section style={{ background: C.night, padding: '52px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <FadeIn>
          <SectionLabel light>The Wine Passport</SectionLabel>
          <SectionTitle light>How It Works</SectionTitle>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginTop: 24, alignItems: 'stretch' }}>
          {WINE_PASSPORT_HOW.map((step, i) => (
            <FadeIn key={i} delay={i * 80} style={{ height: '100%' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '24px 20px', height: '100%', boxSizing: 'border-box' }}>
                <img src={step.icon} alt="" style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 12, opacity: 0.92 }} />
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: '#fff', marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function WineAwardCeremonySection() {
  return (
    <section style={{ background: C.night, padding: '52px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <SectionLabel light>Annual Awards · May – October</SectionLabel>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 40px)", color: '#fff', margin: '16px 0 20px', fontWeight: 400, lineHeight: 1.15 }}>
            The 2026 Manitou Beach<br /><em style={{ color: C.sunsetLight }}>Wine Trail Awards</em>
          </h2>
          <div style={{ width: 48, height: 2, background: C.sunset, margin: '0 auto 28px' }} />

          {/* How it runs */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 32px', maxWidth: 560, margin: '0 auto 40px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '/images/icons/wine-rating.png',      text: 'Visitors rate what they tried at each stop — wine quality, service, atmosphere. Scores go live instantly.' },
                { icon: '/images/icons/leaderboard-icon.png', text: 'Rankings build all season. Every rating is a vote. The leaderboard updates in real time.' },
                { icon: '/images/icons/sealed-icon.png',       text: 'Scores go dark in the final 30 days. Nobody knows the winners — until the ceremony.' },
                { icon: '/images/icons/trophy-icon.png',       text: 'At the awards night (location TBA), winners receive a custom framed certificate to hang on their wall.' },
                { icon: '/images/icons/events-icon.png',       text: 'This is an annual event — May to October, every year. The trail grows. The awards grow with it.' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <img src={row.icon} alt="" style={{ width: 40, height: 40, objectFit: 'contain', flexShrink: 0, marginTop: 1, opacity: 0.88 }} />
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{row.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Award categories */}
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 16 }}>
            9 awards up for grabs
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 44 }}>
            {WINERY_AWARD_CATEGORIES.map((cat, i) => (
              <span key={i} style={{ fontSize: 13, padding: '7px 16px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)', fontFamily: "'Libre Franklin', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <img src="/images/icons/trophy-icon.png" alt="" style={{ width: 14, height: 14, objectFit: 'contain', opacity: 0.8 }} />
                {cat}
              </span>
            ))}
          </div>

          {/* Yeti note */}
          <div style={{ background: 'rgba(212,132,90,0.1)', border: '1px solid rgba(212,132,90,0.22)', borderRadius: 14, padding: '24px 28px', maxWidth: 480, margin: '0 auto 44px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <img src="/images/yeti/yeti-camera.png" alt="The Yeti" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(212,132,90,0.3)' }} />
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: C.sunsetLight }}>A note from The Yeti</div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
              "100% peoples choice. Voted on by every real person who sat at their counter and tried something. The certificates look great on a wall — and I plan to be at the ceremony, which should tell you something."
            </p>
          </div>

          {/* Newsletter — constrained so it doesn't blow out */}
          <div style={{ maxWidth: 540, margin: '0 auto' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 16, fontFamily: "'Libre Franklin', sans-serif" }}>
              Get notified when awards are announced — join the Dispatch:
            </p>
            <NewsletterInline />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function WineriesPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <WineriesHero />
      <WaveDivider topColor={C.dusk} bottomColor={C.night} />
      <WineriesHowItWorksSection />
      <WineriesVillageCallout />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <WineTrailNotifySection />
      <WaveDivider topColor={C.cream} bottomColor={C.night} />
      <WineriesItinerarySection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <PromoBanner page="Wineries" />
      <WineriesMapSection />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />
      <WineriesVenueSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <WineriesScorecardSection />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <WineScoreboardSection />
      <WaveDivider topColor={C.dusk} bottomColor={C.night} />
      <WineAwardCeremonySection />
      <WaveDivider topColor={C.night} bottomColor={C.dusk} />
      <WineriesCTASection />
      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} />
      <PageSponsorBanner pageName="wineries" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
