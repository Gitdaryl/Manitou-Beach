import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, PageSponsorBanner, DiagonalDivider, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, PromoBanner } from '../components/Layout';
import { C } from '../data/config';
import { DEVILS_LAKE_FISH } from './FishingPage';
import { LakesPreservationBanner } from './RoundLakePage';

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

export default function DevilsLakePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
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

