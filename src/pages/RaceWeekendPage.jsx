import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline } from '../components/Layout';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';

// ============================================================
// 🏁  RACE WEEKEND PAGE (/race-weekend)
// Targets visitors coming for Michigan International Speedway
// ============================================================

const RACE_WEEKEND_TIPS = [
  {
    icon: "🏖️",
    title: "Arrive Friday, Leave Monday",
    desc: "Race day is the main event but the lake weekend is the full experience. Come early, watch the sunset from the water, and recover on Sunday before the drive home.",
  },
  {
    icon: "🚤",
    title: "Book your stay early",
    desc: "Race weekend fills up. Lakefront rentals go first - sometimes months out. Don't wing it and end up at a highway motel. Plan ahead.",
  },
  {
    icon: "🍺",
    title: "The after-race tradition",
    desc: "Skip the traffic jam out of Brooklyn. Drive straight to the lake instead. By the time the highway clears, you'll be cold drink in hand watching the sun go down.",
  },
  {
    icon: "🌅",
    title: "Sunday on the water",
    desc: "Race day is loud and brilliant. Sunday on Devils Lake is the quiet counterpart - paddleboards, pontoons, and nobody in a hurry. It's the reset you didn't know you needed.",
  },
];

const THINGS_TO_DO = [
  {
    icon: "⛵",
    title: "Get on the water",
    desc: "Pontoon rentals, kayak launches, and boat slips - Devils Lake is warm water with 600+ boat slips and a public launch. If your rental has dock access, use it.",
    href: "/devils-lake",
  },
  {
    icon: "🏘️",
    title: "Walk the Village",
    desc: "Boutique shops, a cafe, satellite wine tasting rooms, and the iconic lighthouse. Five minutes on foot from the lake. No parking drama.",
    href: "/village",
  },
  {
    icon: "🍷",
    title: "Irish Hills wine trail",
    desc: "Michigan's most underrated wine region is right here. A dozen wineries within a short drive, most with lakeside views or outdoor seating.",
    href: "/wineries",
  },
  {
    icon: "🎣",
    title: "Fishing on both lakes",
    desc: "Devils Lake connects to Round Lake through a dredged channel. Bass, walleye, bluegill - locals fish it all weekend while the rest of the world watches the race.",
    href: "/fishing",
  },
  {
    icon: "🍔",
    title: "Food trucks and local eats",
    desc: "Rotating food trucks hit the area on weekends. Check what's rolling in before you arrive.",
    href: "/food-trucks",
  },
  {
    icon: "🏒",
    title: "July 4th Firecracker 7K",
    desc: "If your race weekend lines up with the Fourth - the annual 7K run on Devils Lake is a community tradition worth waking up early for.",
    href: "/happening",
  },
];

// ============================================================
// HERO
// ============================================================
function RaceWeekendHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/explore-devils-lake.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk,
      minHeight: "85vh",
      display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, rgba(10,18,24,0.82) 0%, rgba(10,18,24,0.45) 50%, rgba(10,18,24,0.9) 100%)",
      }} />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "140px 24px 100px", position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Michigan International Speedway · Irish Hills · Michigan
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(42px, 8vw, 96px)", fontWeight: 400, color: C.cream, lineHeight: 0.95, margin: "0 0 12px 0" }}>
            Race Weekend<br />at Manitou Beach
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 2.5vw, 28px)", color: C.sunsetLight, marginBottom: 20 }}>
            The lake is 20 minutes from the track
          </div>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 540, margin: "0 0 36px 0" }}>
            Michigan International Speedway is one of NASCAR's crown jewels. Manitou Beach is the quiet lake town just down the road that race fans have been discovering for years. Skip the highway exit motels. Stay where the locals stay.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn href="/stays" variant="primary">Find a place to stay</Btn>
            <Btn href="/devils-lake" variant="outlineLight" small>Explore the lake</Btn>
          </div>
          <ShareBar title="Race Weekend at Manitou Beach - Michigan" />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// WHY SECTION
// ============================================================
function WhySection() {
  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionLabel>Why Manitou Beach</SectionLabel>
        <SectionTitle>Beats a highway hotel every time</SectionTitle>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(15px, 1.6vw, 17px)", color: C.textLight, lineHeight: 1.9, marginBottom: 28 }}>
          Brooklyn, Michigan has been hosting NASCAR fans for decades. Most visitors book whatever's left on the highway corridor and spend their non-race hours in a parking lot. A smarter move: stay 20 minutes south on a genuine Michigan lake community.
        </p>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(15px, 1.6vw, 17px)", color: C.textLight, lineHeight: 1.9, marginBottom: 28 }}>
          Manitou Beach sits on Devils Lake - 1,330 acres of warm water, a walkable village with actual character, and enough going on that you won't be staring at the ceiling between race sessions. It's the kind of place you come for a race weekend and end up coming back to just for the lake.
        </p>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: "clamp(15px, 1.6vw, 17px)", color: C.textLight, lineHeight: 1.9 }}>
          The locals here have a quiet appreciation for race weekend. The extra visitors bring life to the village, the food trucks show up, and for a few days every summer, Manitou Beach buzzes a little louder than usual. Then the race ends, the highway clears, and the lake goes back to being a well-kept secret.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// TIPS SECTION
// ============================================================
function TipsSection() {
  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <SectionLabel>Race weekend tips</SectionLabel>
        <SectionTitle>Make the most of it</SectionTitle>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24, marginTop: 40,
        }}>
          {RACE_WEEKEND_TIPS.map((tip, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: C.cream,
                borderRadius: 12,
                padding: "28px 24px",
                border: `1px solid ${C.sand}`,
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{tip.icon}</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, marginBottom: 10 }}>
                  {tip.title}
                </h3>
                <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                  {tip.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// THINGS TO DO
// ============================================================
function ThingsToDoSection() {
  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <SectionLabel>Between races</SectionLabel>
        <SectionTitle>Things to do at Manitou Beach</SectionTitle>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20, marginTop: 40,
        }}>
          {THINGS_TO_DO.map((item, i) => (
            <FadeIn key={i} delay={i * 60}>
              <a href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: C.warmWhite,
                  borderRadius: 12,
                  padding: "24px 22px",
                  border: `1px solid ${C.sand}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 8 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// STAYS CTA
// ============================================================
function StaysCTA() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${C.lakeDark} 0%, ${C.dusk} 100%)`,
      padding: "80px 24px",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunsetLight, marginBottom: 16 }}>
          Don't end up at the highway exit
        </div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 5vw, 48px)", color: C.cream, marginBottom: 20, lineHeight: 1.1 }}>
          Find a lakefront stay for race weekend
        </h2>
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, marginBottom: 36 }}>
          Cabins, cottages, and lakefront rentals on Devils Lake and Round Lake - a short drive from Michigan International Speedway. They book out early, so don't wait.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn href="/stays" variant="primary" large>Browse available stays</Btn>
          <Btn href="/devils-lake" variant="outlineLight">About Devils Lake</Btn>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// LOGISTICS SECTION
// ============================================================
function LogisticsSection() {
  const items = [
    { label: "Distance to MIS", value: "About 20 min", note: "via US-12 and Cement City Rd" },
    { label: "Lake access", value: "Public boat launch", note: "Manitou Rd at the marina" },
    { label: "Best arrival", value: "Thursday or Friday", note: "before the crowds hit" },
    { label: "Village parking", value: "Easy and free", note: "no tickets, no meters" },
    { label: "Nearest airport", value: "DTW - Detroit Metro", note: "about 60 miles east" },
    { label: "Cell coverage", value: "Good", note: "AT&T and Verizon both reliable" },
  ];

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionLabel>Getting here</SectionLabel>
        <SectionTitle>Practical details</SectionTitle>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16, marginTop: 40,
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: C.cream,
              borderRadius: 10,
              padding: "20px 18px",
              border: `1px solid ${C.sand}`,
            }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.textMuted, marginBottom: 6 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text, marginBottom: 4 }}>
                {item.value}
              </div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted }}>
                {item.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================
export default function RaceWeekendPage() {
  return (
    <>
      <SEOHead
        title="Race Weekend Near Michigan International Speedway | Manitou Beach"
        description="Staying near MIS for the NASCAR race? Manitou Beach is 20 minutes from Michigan International Speedway - lakefront rentals, warm water, and a real Michigan community. Way better than a highway hotel."
        path="/race-weekend"
      />
      <GlobalStyles />
      <Navbar />
      <RaceWeekendHero />
      <WhySection />
      <TipsSection />
      <ThingsToDoSection />
      <LogisticsSection />
      <StaysCTA />
      <NewsletterInline />
      <Footer />
    </>
  );
}
