import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, PageSponsorBanner, Btn } from '../components/Shared';
import { Footer, Navbar } from '../App';
import { C } from '../data/config';

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

export default function FishingPage() {
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

