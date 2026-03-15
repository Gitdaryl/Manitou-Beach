import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, PageSponsorBanner, DiagonalDivider, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, PromoBanner } from '../components/Layout';
import { C } from '../data/config';

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
              <Btn href="/events" variant="outlineLight" small>See All Events →</Btn>
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

export function LakesPreservationBanner() {
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

export default function RoundLakePage() {
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
