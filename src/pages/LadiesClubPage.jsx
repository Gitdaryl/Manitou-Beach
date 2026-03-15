import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline } from '../components/Layout';
import { C } from '../data/config';

// ============================================================
// 🌿  LAND & LAKE LADIES CLUB PAGE (/ladies-club)
// ============================================================
// LADIES_CLUB_EVENTS removed — content now inline in LadiesClubEventsSection

function LadiesClubHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/landlakes-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: C.night,
      padding: "180px 24px 140px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.75) 0%, rgba(10,18,24,0.48) 50%, rgba(10,18,24,0.88) 100%)" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <img src="/images/landlake-club-logo.png" alt="Land & Lake Ladies Club Logo" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: `3px solid rgba(255,255,255,0.18)`, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
          Community · Events · Lake Life
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 20px 0" }}>
          Land & Lake<br />Ladies Club
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
          A community of women dedicated to the lakes, the land, and the social fabric of Manitou Beach — hosting events, fundraisers, and the beloved Summer Festival.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#ladies-events" className="btn-animated" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 28px", borderRadius: 8,
            background: C.sunset, color: C.cream,
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
          }}>
            Events & Activities
          </a>
          <ShareBar title="Land & Lake Ladies Club — Manitou Beach" />
        </div>
      </div>
    </section>
  );
}

function LadiesClubMissionSection() {
  const initiatives = [
    { title: "Adopt a Family / Senior", desc: "Monthly grocery and toiletry stipends for nominated families and seniors in need." },
    { title: "Teacher Fund", desc: "$600 annually to honor and support Addison teachers." },
    { title: "Angel Tree", desc: "Holiday gifts for up to 50 children, organized with community support." },
    { title: "Senior Scholarships", desc: "Three scholarships awarded to graduating seniors from the local area each year." },
    { title: "Veteran's Lunch", desc: "Hosting lunches to honor and celebrate local veterans." },
    { title: "Firecracker Run", desc: "Water stations and treats for runners — bomb pops and poppers along the route." },
    { title: "Holiday Gift Baskets", desc: "Pantry items for holiday baskets in partnership with Kiwanis." },
    { title: "Farmer's Craft & Market", desc: "Insurance support and coordination for local vendors at the Manitou Beach market." },
  ];

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>About the Club</SectionLabel>
          <SectionTitle>Women of the Lakes</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, maxWidth: 680, margin: "0 0 12px 0" }}>
            The Land & Lake Ladies Club (LLLC) is a 501(c)(4) nonprofit civic group dedicated to family-friendly projects that strengthen our community. Women from around the lakes gather to care for their neighbors, celebrate this place they call home, and give back in ways large and small.
          </p>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 680, margin: "0 0 48px 0" }}>
            From the Annual Summer Festival to quiet acts of service, the Ladies Club is the heart of what makes Manitou Beach more than a lake town.
          </p>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sage, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 20 }}>
            Key Initiatives
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {initiatives.map((item, i) => (
            <FadeIn key={i} delay={i * 40}>
              <div style={{ background: C.cream, borderRadius: 12, padding: "20px 22px", border: `1px solid ${C.sand}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>{item.title}</div>
                <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function LadiesClubEventsSection() {
  const features = [
    { label: "Live Music", desc: "Continuous entertainment throughout the day with seating provided for relaxation" },
    { label: "Fine Arts Section", desc: "A dozen or more outdoor artist booths featuring local talent and original work" },
    { label: "Children's Area", desc: "Bounce items, face painting, Lucky Ducky, balloons, and fun for all ages" },
    { label: "Crafts & Vendors", desc: "Local makers, artisan goods, handmade creations, and the Farmer's Craft Market" },
    { label: "Food & Drinks", desc: "Shaved ice, acai bowls, possible craft beer and wine — something for everyone" },
    { label: "Flower Sale", desc: "Fresh blooms and plants available while supplies last" },
  ];

  const tiers = [
    {
      level: "Platinum", amount: "$500", color: "#C8A84B",
      benefits: [
        "Individual sponsor banner for event or projects",
        "Featured advertisement on social media for event sponsorship",
        "Larger logo / print on Festival T-shirt",
        "Recognition on Sponsor Board",
        "Recognition on Festival Sponsor Banner and Brochures",
        "Recognition on this web page",
      ],
      areas: ["Children's Area", "Vendor & Crafter's Market", "Live Music Entertainment", "Fine Artists Section", "LLLC Community Projects"],
    },
    {
      level: "Gold", amount: "$250", color: "#E8C547",
      benefits: [
        "Advertisement on social media for sponsorship",
        "Larger logo / print on Festival T-shirt",
        "Recognition on Sponsor Board",
        "Recognition on Festival Sponsor Banner and Brochures",
        "Recognition on this web page",
      ],
    },
    {
      level: "Silver", amount: "$100", color: "#A8B8C8",
      benefits: [
        "Advertisement on social media for sponsorship",
        "Name / logo on Festival T-shirt",
        "Recognition on Sponsor Board",
        "Recognition on Festival Sponsor Banner and Brochures",
        "Recognition on this web page",
      ],
    },
    {
      level: "Bronze", amount: "$50", color: "#B87333",
      benefits: [
        "Advertisement on social media for sponsorship",
        "Name listed on Festival T-shirt",
        "Recognition on Sponsor Board and Brochures",
        "Recognition on this web page",
      ],
    },
    {
      level: "Friend", amount: "$25", color: C.sage,
      benefits: [
        "Advertisement on social media for sponsorship",
        "Name listed on Festival T-shirt",
        "Recognition on this web page",
      ],
    },
  ];

  return (
    <section id="ladies-events" style={{
      background: C.night, padding: "100px 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Subtle background texture */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/community-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", opacity: 0.12 }} />
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <SectionLabel light>Signature Event</SectionLabel>
            <SectionTitle center light>Summer Festival 2026</SectionTitle>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              The Land & Lake Ladies Club presents a lively day of food, music, crafts, art, and community — right in the heart of Manitou Beach Village.
            </p>
          </div>
        </FadeIn>

        {/* Festival card */}
        <FadeIn delay={100}>
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 20, overflow: "hidden", marginBottom: 32,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }} className="mobile-col-1">

              {/* Image / logo side */}
              <div style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", minHeight: 400 }}>
                <img
                  src="/images/ladies-club/summer-festival.png"
                  alt="Summer Festival 2026"
                  style={{ width: 400, height: 400, objectFit: "contain", maxWidth: "100%" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              </div>

              {/* Info side */}
              <div style={{ padding: "44px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <img src="/images/landlake-club-logo.png" alt="LLLC Logo" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: "2px solid rgba(255,255,255,0.15)" }} />

                {/* Date badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: `${C.sunset}22`, border: `1px solid ${C.sunset}50`,
                  borderRadius: 6, padding: "6px 14px", marginBottom: 20, width: "fit-content",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700,
                  letterSpacing: 2.5, textTransform: "uppercase", color: C.sunsetLight,
                }}>
                  June 20th, 2026
                </div>

                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 400, color: C.cream, margin: "0 0 8px 0", lineHeight: 1.15 }}>
                  Devils Lake<br />Summer Festival
                </h3>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: C.sunsetLight, marginBottom: 24 }}>
                  Saturday · 9:00 AM – 2:00 PM
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {[
                    { icon: "📍", text: "Manitou Beach Village" },
                    { icon: "📧", text: "michele.henson0003@gmail.com" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'Libre Franklin', sans-serif" }}>{item.text}</span>
                    </div>
                  ))}
                </div>

                <a href="mailto:michele.henson0003@gmail.com" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 8, width: "fit-content",
                  background: C.sunset, color: C.cream, textDecoration: "none",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5,
                }}>
                  Get in Touch →
                </a>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* What to Expect — 3 per row, larger text */}
        <FadeIn delay={150}>
          <div style={{ marginBottom: 20, fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
            What to Expect
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }} className="mobile-col-1">
          {features.map((f, i) => (
            <FadeIn key={i} delay={160 + i * 40}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "24px 22px" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.cream, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>{f.label}</div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Festival Map */}
        <FadeIn delay={200}>
          <img
            src="/images/ladies-club/summerfest-map.png"
            alt="Summer Festival 2026 Map — Manitou Beach Village"
            style={{ width: "100%", borderRadius: 14, marginBottom: 56, display: "block", border: "1px solid rgba(255,255,255,0.08)" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </FadeIn>

        {/* Sponsorship intro */}
        <FadeIn delay={220}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              Sponsorship Opportunities
            </div>
            <SectionTitle center light>Become a Sponsor</SectionTitle>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 640, margin: "0 auto" }}>
              Join us in supporting the Land and Lake Ladies Club (LLLC) Summer Festival 2026! Your sponsorship helps make this community celebration possible while providing your business with valuable recognition.
            </p>
          </div>
        </FadeIn>

        {/* Tier cards */}
        {/* Platinum — full width featured */}
        {tiers.slice(0, 1).map(tier => (
          <FadeIn key={tier.level} delay={240}>
            <div style={{
              background: `linear-gradient(135deg, rgba(200,168,75,0.12) 0%, rgba(200,168,75,0.04) 100%)`,
              border: `1px solid ${tier.color}50`, borderRadius: 18, padding: "36px 36px", marginBottom: 16,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: "100%", background: tier.color, borderRadius: "18px 0 0 18px" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="mobile-col-1">
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: tier.color }}>{tier.level}</span>
                    <span style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "rgba(255,255,255,0.6)" }}>{tier.amount}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {tier.benefits.map((b, j) => (
                      <li key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                        <span style={{ color: tier.color, fontSize: 14, marginTop: 1, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: tier.color, marginBottom: 14 }}>
                    Option to Sponsor a Specific Area
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {tier.areas.map((a, j) => (
                      <li key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: tier.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}

        {/* Gold + Silver */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="mobile-col-1">
          {tiers.slice(1, 3).map((tier, i) => (
            <FadeIn key={tier.level} delay={260 + i * 40}>
              <div style={{
                background: "rgba(255,255,255,0.04)", border: `1px solid ${tier.color}35`, borderRadius: 14, padding: "28px 28px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: tier.color, borderRadius: "14px 0 0 14px" }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 18 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: tier.color }}>{tier.level}</span>
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.5)" }}>{tier.amount}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.benefits.map((b, j) => (
                    <li key={j} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
                      <span style={{ color: tier.color, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Bronze + Friend */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }} className="mobile-col-1">
          {tiers.slice(3).map((tier, i) => (
            <FadeIn key={tier.level} delay={300 + i * 40}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${tier.color}30`, borderRadius: 14, padding: "24px 24px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: tier.color, borderRadius: "14px 0 0 14px" }} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: tier.color }}>{tier.level}</span>
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "rgba(255,255,255,0.45)" }}>{tier.amount}</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {tier.benefits.map((b, j) => (
                    <li key={j} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                      <span style={{ color: tier.color, fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Footer */}
        <FadeIn delay={340}>
          <div style={{ textAlign: "center", padding: "24px 0 0" }}>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 600, margin: "0 auto 12px" }}>
              Your support helps LLLC continue funding community projects while creating a fun and memorable festival for all ages.
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
              Checks payable to: Land and Lake Ladies Club · Sponsorship deadline: March 20th, 2026
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function LadiesClubGallerySection() {
  // Photos coming soon — placeholders until new images are provided
  const placeholders = [1, 2, 3];

  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Memories</SectionLabel>
            <SectionTitle center>Gallery</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {placeholders.map((_, i) => (
            <FadeIn key={i} delay={i * 80} direction="scale">
              <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", paddingTop: "75%", background: C.warmWhite, border: `1px solid ${C.sand}` }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>Photo coming soon</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function LadiesClubSponsorsSection() {
  // Placeholder tiles — swap null for logo path as sponsors are confirmed
  const SponsorTile = ({ height = 110 }) => (
    <div style={{
      background: "#fff", border: `1.5px dashed ${C.sand}`, borderRadius: 12,
      height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      </div>
      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.8, textTransform: "uppercase" }}>Logo</span>
    </div>
  );

  const TierHeader = ({ label, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, marginTop: 40 }}>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
      <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color, fontWeight: 400, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
    </div>
  );

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <SectionLabel>Thank You</SectionLabel>
            <SectionTitle center>Our 2026 Sponsors</SectionTitle>
            <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              The Summer Festival is made possible by the generous support of our community sponsors.
            </p>
          </div>
        </FadeIn>

        {/* Platinum — 3 across */}
        <FadeIn>
          <TierHeader label="Platinum Sponsors" color="#b08d57" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[0,1,2].map(i => <SponsorTile key={i} height={140} />)}
          </div>
        </FadeIn>

        {/* Gold — 4 across */}
        <FadeIn>
          <TierHeader label="Gold Sponsors" color="#c9a227" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[0,1,2,3].map(i => <SponsorTile key={i} height={120} />)}
          </div>
        </FadeIn>

        {/* Silver — 5 across */}
        <FadeIn>
          <TierHeader label="Silver Sponsors" color="#8a9ba8" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[0,1,2,3,4].map(i => <SponsorTile key={i} height={100} />)}
          </div>
        </FadeIn>

        {/* Bronze — 6 across */}
        <FadeIn>
          <TierHeader label="Bronze Sponsors" color="#a0522d" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {[0,1,2,3,4,5].map(i => <SponsorTile key={i} height={88} />)}
          </div>
        </FadeIn>

        {/* Friends — text list with logo */}
        <FadeIn>
          <TierHeader label="Friends of LLLC" color={C.sage} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", justifyContent: "center", padding: "4px 0 8px" }}>
            {["Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend"].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/images/landlake-club-logo.png" alt="LLLC" style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.7 }} />
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>Friend Name</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p style={{ textAlign: "center", fontSize: 13, color: C.textMuted, marginTop: 40, lineHeight: 1.7 }}>
            Interested in sponsoring? Contact{" "}
            <a href="mailto:michele.henson0003@gmail.com" style={{ color: C.sage, textDecoration: "none" }}>michele.henson0003@gmail.com</a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function MensClubSponsorsSection() {
  const SponsorTile = ({ height = 110 }) => (
    <div style={{
      background: "#fff", border: `1.5px dashed ${C.sand}`, borderRadius: 12,
      height, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      </div>
      <span style={{ fontSize: 9, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.8, textTransform: "uppercase" }}>Logo</span>
    </div>
  );

  const TierHeader = ({ label, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, marginTop: 40 }}>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
      <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color, fontWeight: 400, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
    </div>
  );

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <SectionLabel>Thank You</SectionLabel>
            <SectionTitle center>Our 2026 Sponsors</SectionTitle>
            <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              The Tip-Up Festival and our year-round programs are made possible by the generous support of our community sponsors.
            </p>
          </div>
        </FadeIn>

        {/* Platinum — 3 across */}
        <FadeIn>
          <TierHeader label="Platinum Sponsors" color="#b08d57" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[0,1,2].map(i => <SponsorTile key={i} height={140} />)}
          </div>
        </FadeIn>

        {/* Gold — 4 across */}
        <FadeIn>
          <TierHeader label="Gold Sponsors" color="#c9a227" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {[0,1,2,3].map(i => <SponsorTile key={i} height={120} />)}
          </div>
        </FadeIn>

        {/* Silver — 5 across */}
        <FadeIn>
          <TierHeader label="Silver Sponsors" color="#8a9ba8" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[0,1,2,3,4].map(i => <SponsorTile key={i} height={100} />)}
          </div>
        </FadeIn>

        {/* Bronze — 6 across */}
        <FadeIn>
          <TierHeader label="Bronze Sponsors" color="#a0522d" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            {[0,1,2,3,4,5].map(i => <SponsorTile key={i} height={88} />)}
          </div>
        </FadeIn>

        {/* Friends — text list */}
        <FadeIn>
          <TierHeader label="Friends of the Club" color={C.sage} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", justifyContent: "center", padding: "4px 0 8px" }}>
            {["Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend", "Friend"].map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/images/mens_club_logo.png" alt="DRLMC" style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.7 }} />
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>Friend Name</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p style={{ textAlign: "center", fontSize: 13, color: C.textMuted, marginTop: 40, lineHeight: 1.7 }}>
            Interested in sponsoring the Men's Club?{" "}
            <a href="mailto:hello@manitoubeach.com" style={{ color: C.sage, textDecoration: "none" }}>Get in touch</a>{" "}
            and we'll connect you with the club.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function LadiesClubGetInvolved() {
  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel>Get Involved</SectionLabel>
          <SectionTitle center>Connect with the Club</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, marginBottom: 32 }}>
            Interested in the Summer Festival, community events, or membership? Reach out — the lakes community is always welcoming new faces.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:michele.henson0003@gmail.com" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: C.sunset, color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Send us a message
            </a>
            <a href="/devils-lake" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: "transparent", border: `1.5px solid ${C.sand}`, color: C.text,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Back to Devils Lake
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function LadiesClubPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <LadiesClubHero />
      <LadiesClubMissionSection />
      <LadiesClubEventsSection />
      <LadiesClubSponsorsSection />
      <LadiesClubGallerySection />
      <LadiesClubGetInvolved />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
