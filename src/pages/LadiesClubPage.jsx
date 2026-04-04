import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, CommunityDonationForm } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, ContactModal } from '../components/Layout';
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
      backgroundColor: C.night,
      padding: "180px 24px 140px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.75) 0%, rgba(10,18,24,0.48) 50%, rgba(10,18,24,0.88) 100%)" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <img src="/images/landlake-club-logo.png" alt="Land & Lake Ladies Club Logo" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: `3px solid rgba(255,255,255,0.18)`, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
          Where Community Comes Together
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 20px 0" }}>
          Land & Lake<br />Ladies Club
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
          A nonprofit civic organization serving Devils Lake, Round Lake, Addison, and Manitou Beach — bringing women together to strengthen our community through events, fundraising, and good old-fashioned neighborly love.
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
    { title: "Summer Festival", desc: "Our signature annual event — a full day of live music, fine arts, crafts, food, and family fun for the whole lakes community." },
    { title: "Veterans Luncheon", desc: "Hosting a lunch to honor and celebrate the local veterans who've served our country." },
    { title: "Angel Tree", desc: "Making the holidays merry for local families — gifts and giving organized with community support." },
    { title: "Senior Scholarships", desc: "Scholarships awarded to graduating seniors from the local area each year." },
    { title: "Adopt a Family / Senior", desc: "Assistance programs to support families and seniors in need throughout the year." },
    { title: "Holiday Food Baskets", desc: "Holiday giving baskets assembled and distributed in partnership with the Addison Kiwanis." },
    { title: "Farmers & Crafters Market", desc: "Partnering with Kathy Reed to support local vendors at the Manitou Beach market." },
    { title: "4th of July Run", desc: "Water and popsicles along the Firecracker Run route — keeping runners cool and smiling." },
  ];

  const partners = ["Men's Club", "Chamber of Commerce", "Addison Kiwanis", "Lake Preservation League", "Devils & Round Lakes Organizations"];

  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>About the Club</SectionLabel>
          <SectionTitle>Women of the Lakes</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, maxWidth: 680, margin: "0 0 12px 0" }}>
            The Land & Lake Ladies Club (LLLC) is a 501(c)(4) nonprofit civic organization open to women in the Devils Lake, Round Lake, Addison, and Manitou Beach communities. Members come together to build friendships, welcome new residents, and make a real difference right where they live.
          </p>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 680, margin: "0 0 12px 0" }}>
            Every dollar raised goes back into our community — supporting local schools and teachers, youth programs, student art camps, fireworks, and families and seniors in need. No special skills needed, just a willingness to help.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", maxWidth: 680, marginBottom: 48 }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginRight: 4 }}>Partners:</span>
            {partners.map(p => (
              <span key={p} style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", background: C.cream, border: `1px solid ${C.sand}`, borderRadius: 20, padding: "2px 10px" }}>{p}</span>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sage, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 20 }}>
            What We Do
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
  const [lightbox, setLightbox] = useState(null);
  const photos = Array.from({ length: 15 }, (_, i) => `/images/ladies-club/summerfest/LLLC-${i + 1}.jpg`);

  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Memories</SectionLabel>
            <SectionTitle center>Festival Gallery</SectionTitle>
            <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, maxWidth: 400, margin: "0 auto" }}>
              A look at the community coming together — Summer Festival moments from the lakes.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {photos.map((src, i) => (
            <FadeIn key={i} delay={i * 30} direction="scale">
              <div
                onClick={() => setLightbox(i)}
                style={{
                  borderRadius: 10, overflow: "hidden", position: "relative", paddingTop: "75%",
                  cursor: "pointer", background: C.warmWhite,
                }}
              >
                <img
                  src={src}
                  alt={`Summer Festival photo ${i + 1}`}
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(10,18,24,0.92)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24,
            }}
          >
            <button
              onClick={e => { e.stopPropagation(); setLightbox(l => (l > 0 ? l - 1 : photos.length - 1)); }}
              style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", color: "#fff", fontSize: 20 }}
            >‹</button>
            <img
              src={photos[lightbox]}
              alt=""
              style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 8 }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={e => { e.stopPropagation(); setLightbox(l => (l < photos.length - 1 ? l + 1 : 0)); }}
              style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", color: "#fff", fontSize: 20 }}
            >›</button>
            <button
              onClick={() => setLightbox(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 18 }}
            >×</button>
            <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
              {lightbox + 1} / {photos.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LadiesClubSponsorsSection() {
  const PLATINUM = [
    { name: "Adrian Steel",             logo: "/images/ladies-club/sponsors/adrian-logo.jpg",      url: "https://adriansteel.com" },
    { name: "Dave & Jose",              logo: null,                                                  url: null },
    { name: "Decker and Sons Insurance",logo: "/images/ladies-club/sponsors/decker-logo.jpg",      url: "https://deckerandsonsinsurance.com" },
    { name: "Foundation Realty",        logo: "/images/ladies-club/sponsors/foundation-logo.jpg",   url: "https://foundationlenawee.com" },
    { name: "Lakeside Construction",    logo: "/images/ladies-club/sponsors/lakeside-logo.jpg",     url: null },
    { name: "Land To Lakes",            logo: "/images/ladies-club/sponsors/landtolakes-logo.jpg",  url: "https://landtolakes.com" },
  ];

  const GOLD = [
    { name: "Edison Builders",         logo: null },
    { name: "Henson Family",           logo: null },
    { name: "Kerentoff Family",        logo: null },
    { name: "Mark Riggle Real Estate", logo: "/images/ladies-club/sponsors/riggle-logo.jpg" },
    { name: "North Shore Pontoon",     logo: "/images/ladies-club/sponsors/northshore-logo.jpg" },
    { name: "Sterling Market",         logo: "/images/ladies-club/sponsors/sterling-logo.jpg" },
  ];

  const SILVER = [
    "FN Cuthbert Company",
    "Boot Jack Tavern",
    "Devil's Lake Golf Course",
    "Manitou Beach Glass Factory",
    "Papa's Place",
    "Redwood Tree Service",
    "Trends Salon and Spa",
    "Two Lakes Tavern",
    "Devil's Lake View Living",
  ];

  const BRONZE = ["Glamour Auto Shop"];

  const FRIENDS = ["Freddie Freeze"];

  const TierHeader = ({ label, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, marginTop: 44 }}>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
      <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color, fontWeight: 400, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: C.sand }} />
    </div>
  );

  // Tile used for Platinum and Gold — shows logo or fallback name card
  const LogoTile = ({ name, logo, url, platinum }) => {
    const [hovered, setHovered] = React.useState(false);
    const inner = (
      <div
        onMouseEnter={() => url && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          border: `1.5px solid ${hovered ? "#b08d57" : "#e8e0d5"}`,
          borderRadius: 12,
          height: platinum ? 140 : 120,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          gap: 10,
          cursor: url ? "pointer" : "default",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hovered ? "0 8px 24px rgba(176,141,87,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
          transition: "all 0.22s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {logo ? (
          <img
            src={logo}
            alt={name}
            style={{ maxWidth: "100%", maxHeight: platinum ? 88 : 72, objectFit: "contain" }}
          />
        ) : (
          <span style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: platinum ? 14 : 13,
            color: "#3a3228",
            textAlign: "center",
            lineHeight: 1.4,
            fontWeight: 400,
          }}>{name}</span>
        )}
        {url && platinum && (
          <span style={{
            fontSize: 10,
            color: hovered ? "#b08d57" : "#b0a090",
            fontFamily: "'Libre Franklin', sans-serif",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>Visit Site →</span>
        )}
      </div>
    );
    if (url && platinum) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          {inner}
        </a>
      );
    }
    return inner;
  };

  // Name-only chip for Silver / Bronze
  const NameChip = ({ name }) => (
    <div style={{
      background: "#fff",
      border: "1px solid #e8e0d5",
      borderRadius: 8,
      padding: "10px 18px",
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: 13,
      color: "#3a3228",
      textAlign: "center",
      lineHeight: 1.3,
    }}>{name}</div>
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

        {/* Platinum */}
        <FadeIn>
          <TierHeader label="Platinum Sponsors" color="#b08d57" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
            {PLATINUM.map(s => <LogoTile key={s.name} {...s} platinum />)}
          </div>
        </FadeIn>

        {/* Gold */}
        <FadeIn>
          <TierHeader label="Gold Sponsors" color="#c9a227" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
            {GOLD.map(s => <LogoTile key={s.name} {...s} />)}
          </div>
        </FadeIn>

        {/* Silver — name chips */}
        <FadeIn>
          <TierHeader label="Silver Sponsors" color="#8a9ba8" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {SILVER.map(name => <NameChip key={name} name={name} />)}
          </div>
        </FadeIn>

        {/* Bronze — name chips */}
        <FadeIn>
          <TierHeader label="Bronze Sponsors" color="#a0522d" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {BRONZE.map(name => <NameChip key={name} name={name} />)}
          </div>
        </FadeIn>

        {/* Friends & Family */}
        <FadeIn>
          <TierHeader label="Friends & Family of LLLC" color={C.sage} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center", padding: "4px 0 8px" }}>
            {FRIENDS.map(name => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img src="/images/landlake-club-logo.png" alt="LLLC" style={{ width: 16, height: 16, objectFit: "contain", opacity: 0.6 }} />
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>{name}</span>
              </div>
            ))}
          </div>
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
            Interested in sponsoring the Ladies Club?{" "}
            <button onClick={() => document.querySelector('[data-section="ladies-sponsor-form"]')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: "none", border: "none", padding: 0, color: C.sage, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: "underline" }}>Get in touch</button>{" "}
            and we'll connect you with the club.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

const LADIES_SPONSOR_TIERS = [
  { level: "Platinum Sponsor", amount: 500, perks: ["Named in all event promotions & signage", "Logo on website & Festival banners", "Largest logo on Festival T-shirt", "Social media feature", "Newsletter spotlight"] },
  { level: "Gold Sponsor", amount: 250, perks: ["Logo on website & Festival banners", "Logo on Festival T-shirt", "Social media tag", "Newsletter mention"] },
  { level: "Silver Sponsor", amount: 100, perks: ["Name on website", "Name on Festival T-shirt", "Social media mention"] },
  { level: "Bronze Sponsor", amount: 50, perks: ["Name on Festival T-shirt", "Online page recognition", "Community recognition"] },
  { level: "Friend", amount: 25, perks: ["Name listed on website", "Online page recognition", "Community recognition"] },
];

function LadiesClubSponsorForm() {
  return (
    <section data-section="ladies-sponsor-form" style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Support the Festival</SectionLabel>
            <SectionTitle center>Become a Sponsor</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
              Your sponsorship helps bring the Devils Lake Summer Festival to life — a full day of food, music, crafts, and community for everyone on the lake.
            </p>
          </div>
        </FadeIn>
        <CommunityDonationForm
          orgName="Land & Lake Ladies Club"
          tiers={LADIES_SPONSOR_TIERS}
          accentColor={C.sunset}
          hideFee
          logoTiers={["Platinum Sponsor", "Gold Sponsor", "Silver Sponsor", "Bronze Sponsor"]}
          note="Checks payable to: Land and Lake Ladies Club · Sponsorship deadline: March 20th, 2026. A club representative will follow up within 2 business days."
        />
      </div>
    </section>
  );
}

function LadiesClubGetInvolved() {
  const cards = [
    {
      icon: "🏆",
      label: "Become a Sponsor",
      desc: "Support the Summer Festival and get your business in front of the whole community. Five tiers starting at $25.",
      action: "View Sponsorship",
      href: "#ladies-sponsor-form",
      onClick: (e) => { e.preventDefault(); document.querySelector('[data-section="ladies-sponsor-form"]')?.scrollIntoView({ behavior: 'smooth' }); },
      accent: "#b08d57",
    },
    {
      icon: "🎨",
      label: "Vendor / Artist Booth",
      desc: "Artists, crafters, food trucks, and community vendors — apply for a booth at the 2026 Devils Lake Summerfest.",
      action: "Apply Now",
      href: "/ladies-club/vendor",
      accent: C.sage,
      badge: "Open",
    },
    {
      icon: "💙",
      label: "Join the Club",
      desc: "Open to women in the lakes community. Meet great people, give back, and be part of something that matters.",
      action: "Coming Soon",
      href: null,
      accent: C.sunset,
      disabled: true,
    },
  ];

  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel style={{ color: "rgba(255,255,255,0.45)" }}>Get Involved</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, color: C.cream, margin: "8px 0 12px" }}>
              Three Ways to Be Part of It
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
              Whether you're a business, an artist, or just someone who loves this community — there's a place for you.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {cards.map((card, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16, padding: "28px 24px", height: "100%", boxSizing: "border-box",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{card.icon}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.cream, fontWeight: 400 }}>{card.label}</span>
                  {card.badge && (
                    <span style={{ background: C.sage, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 0.5, padding: "2px 8px", borderRadius: 20, fontFamily: "'Libre Franklin', sans-serif", textTransform: "uppercase" }}>{card.badge}</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, flex: 1, margin: "0 0 20px" }}>{card.desc}</p>
                {card.disabled ? (
                  <span style={{ display: "inline-block", padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textAlign: "center" }}>
                    {card.action}
                  </span>
                ) : (
                  <a
                    href={card.href}
                    onClick={card.onClick}
                    style={{
                      display: "inline-block", padding: "11px 20px", borderRadius: 8,
                      background: card.accent, color: "#fff",
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700,
                      textDecoration: "none", textAlign: "center", letterSpacing: 0.3,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    {card.action}
                  </a>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={300}>
          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 40 }}>
            Questions? Email{" "}
            <a href="mailto:Michele.henson0003@gmail.com" style={{ color: "rgba(255,255,255,0.55)" }}>Michele.henson0003@gmail.com</a>
            {" "}or visit our{" "}
            <a href="https://www.facebook.com/groups/LandAndLakeLadiesClub" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.55)" }}>Facebook page</a>.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

export default function LadiesClubPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <LadiesClubHero />
      <LadiesClubMissionSection />
      <LadiesClubEventsSection />
      <LadiesClubSponsorsSection />
      <LadiesClubGallerySection />
      <LadiesClubSponsorForm />
      <LadiesClubGetInvolved />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
