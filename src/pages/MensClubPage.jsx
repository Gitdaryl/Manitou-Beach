import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, DiagonalDivider, CommunityDonationForm } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline } from '../components/Layout';
import { C } from '../data/config';

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
    image: "/images/mens-club/tip-up-1.jpg",
  },
  {
    title: "Firecracker 7K Run/Walk",
    date: "July 4th — 8:00 AM",
    desc: "A Fourth of July tradition starting at 3171 Round Lake Hwy. Choose the 7K run/walk or 1-mile family fun run. Proceeds fund the Devils Lake fireworks display.",
    image: "/images/mens-club/firecracker-7k.jpg",
  },
  {
    title: "Golf Outing",
    date: "Annual — Summer",
    desc: "A community golf outing that brings together members, local businesses, and supporters. All proceeds benefit the club's charitable programs.",
    image: "/images/mens-club/golf.jpg",
  },
  {
    title: "Benefit Auction & Raffle",
    date: "During Tip-Up Festival",
    desc: "The auction is the club's biggest fundraiser — local businesses and community members donate items. Proceeds support laptops for students, Toys for Tots, Shop with a Cop, and food pantries.",
    image: "/images/mens-club/auction.jpg",
  },
  {
    title: "Fireworks Display",
    date: "July 4th & Special Events",
    desc: "Working with the Devils & Round Lake Fireworks Association, the club helps fund and organize the summer fireworks display over Devils Lake.",
    image: "/images/mens-club/fireworks.jpg",
  },
  {
    title: "Community Service Days",
    date: "Year-round",
    desc: "Throughout the year, club members volunteer for lake cleanups, food drives, Christmas gift baskets, and support for families in need through the Community for People in Need program.",
    image: "/images/mens-club/shop-with-a-cop.jpg",
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
      backgroundImage: "url(/images/mens-club-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: C.night,
      padding: "180px 24px 140px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.72) 0%, rgba(10,18,24,0.45) 50%, rgba(10,18,24,0.85) 100%)" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <img src="/images/mens_club_logo.png" alt="Men's Club Logo" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: `3px solid rgba(255,255,255,0.18)`, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
          501(c)(3) Nonprofit
        </div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 20px 0" }}>
          Devils & Round Lake<br />Men's Club
        </h1>
        <p style={{ fontSize: "clamp(14px, 1.5vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 32px" }}>
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
          <ShareBar title="Devils & Round Lake Men's Club — Manitou Beach" />
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
        <div className="mens-club-stats" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
          {MENS_CLUB_STATS.map((stat, i) => (
            <FadeIn key={i} delay={i * 60} direction="scale">
              <div style={{
                background: C.warmWhite, borderRadius: 12, padding: "22px 16px", textAlign: "center",
                border: `1px solid ${C.sand}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, whiteSpace: "nowrap" }}>
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
                  <span className="mono-icon" style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
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
            <SectionLabel light style={{ color: C.sunsetLight }}>Annual Calendar</SectionLabel>
            <SectionTitle center light>Events & Fundraisers</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gap: 16 }}>
          {MENS_CLUB_EVENTS.map((evt, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{
                display: "flex", gap: 0, alignItems: "stretch",
                background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                {evt.image ? (
                  <div style={{ width: 130, flexShrink: 0 }}>
                    <img src={evt.image} alt={evt.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                ) : (
                  <div style={{ width: 130, flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  </div>
                )}
                <div style={{ flex: 1, padding: "22px 22px" }}>
                  <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.cream, margin: "0 0 4px 0" }}>{evt.title}</h3>
                  <div style={{ fontSize: 12, color: C.sunsetLight, fontWeight: 600, letterSpacing: 0.5, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>{evt.date}</div>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, margin: 0 }}>{evt.desc}</p>
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
    { src: "/images/mens-club/tip-up-1.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-2.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-3.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-4.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-5.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-6.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/tip-up-7.jpg", caption: "Tip-Up Festival" },
    { src: "/images/mens-club/firecracker-7k.jpg", caption: "Firecracker 7K" },
    { src: "/images/mens-club/firecracker-7k-2.jpg", caption: "Firecracker 7K" },
    { src: "/images/mens-club/auction.jpg", caption: "Benefit Auction" },
    { src: "/images/mens-club/fireworks.jpg", caption: "July 4th Fireworks" },
    { src: "/images/mens-club/shop-with-a-cop.jpg", caption: "Shop with a Cop" },
    { src: "/images/mens-club/toys-for-tots.jpg", caption: "Toys for Tots" },
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

const MENS_CLUB_SPONSOR_TIERS = [
  { level: "Presenting Sponsor", amount: 2500, perks: ["Named sponsor in all event promotions", "Logo on website & event banners", "Newsletter feature story", "On-site recognition at Tip-Up Festival", "Social media campaign inclusion"] },
  { level: "Gold Sponsor", amount: 1000, perks: ["Logo on website & event banners", "Newsletter mention", "Social media tag", "On-site recognition at events"] },
  { level: "Silver Sponsor", amount: 500, perks: ["Name on website", "Newsletter mention", "Community recognition at events"] },
  { level: "Community Partner", amount: 100, perks: ["Name listed on website", "Community recognition"] },
];

function MensClubSponsorForm() {
  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Support the Mission</SectionLabel>
            <SectionTitle center>Become a Sponsor</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
              Your sponsorship directly funds laptops for students, Toys for Tots, the annual fireworks display, and the programs that have made Manitou Beach stronger for over 70 years.
            </p>
          </div>
        </FadeIn>
        <CommunityDonationForm
          orgName="Devils & Round Lake Men's Club"
          tiers={MENS_CLUB_SPONSOR_TIERS}
          accentColor={C.sunset}
          note="Your application will be reviewed and a club representative will follow up within 2 business days."
        />
      </div>
    </section>
  );
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

export default function MensClubPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
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
      <MensClubSponsorForm />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <MensClubGetInvolved />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

