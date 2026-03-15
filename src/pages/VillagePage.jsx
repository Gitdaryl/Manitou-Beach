import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, PageSponsorBanner, DiagonalDivider, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, PromoBanner } from '../components/Layout';
import { C } from '../data/config';

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
            <Btn href="/business" variant="outlineLight">List Your Business</Btn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

export default function VillagePage() {
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
