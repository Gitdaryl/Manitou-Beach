import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, PageSponsorBanner, DiagonalDivider } from '../components/Shared';
import { Footer, Navbar } from '../components/Layout';
import { C } from '../data/config';

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
    link: "https://www.facebook.com/ManitouBeachBoathouseArtGallery/",
  },
  {
    image: "/images/historical/car-show.jpg",
    title: "Classic Car Shows",
    desc: "Bringing car show enthusiasts together in the Village for community celebrations of automotive history and local culture.",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
  },
  {
    image: "/images/historical/conservation.jpg",
    title: "Land & Water Conservation",
    desc: "Active stewardship projects to protect and restore the natural environment around Devils Lake and the surrounding watershed.",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
  },
  {
    image: "/images/historical/restoration.jpg",
    title: "Village Restoration",
    desc: "Ongoing renovation projects to restore historic buildings and infrastructure in Manitou Beach Village, preserving the area's architectural heritage.",
    phone: "(517) 224-1984",
    email: "mbboathouseartgallery@gmail.com",
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

export default function HistoricalSocietyPage() {
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
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="historical-society" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

