import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, DiagonalDivider, CommunityDonationForm } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline } from '../components/Layout';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';
import EventPhotoWall from '../components/EventPhotoWall';

// ============================================================
// 🏛️  MEN'S CLUB PAGE (/mens-club)
// ============================================================

// --- Golf Outing 2026 ---
// Hero flips to golf mode until the event has passed, then reverts automatically.
const GOLF_OUTING = {
  date: new Date("2026-09-13T08:30:00-04:00"),
  heroUntil: new Date("2026-09-14T00:00:00-04:00"),
  venue: "Devils Lake Golf Course",
  address: "14600 U.S. 223, Manitou Beach, MI 49253",
  phone: "(517) 547-3653",
  video: "/images/mens-club/video/golf-hero-loop.mp4",
  poster: "/images/mens-club/golf.jpg",
};

const GOLF_SPONSOR_TIERS = [
  {
    tier: "Gold",
    accent: "#C9A227",
    sponsors: [
      { name: "National Transportation Associates", sub: "NTA Truck Team · Independent Insurance Agent", logo: null, url: null },
    ],
  },
  {
    tier: "Silver",
    accent: "#9BA3AD",
    sponsors: [
      { name: "Scotty's Body Shop", sub: "Quality Autobody Repair Since 1990 · 2410 East US 223, Adrian · (517) 265-3711", logo: null, url: null },
    ],
  },
  {
    tier: "Bronze",
    accent: "#A87243",
    sponsors: [
      { name: "Edison Builders LLC", sub: "Licensed & Insured · (517) 448-8653", logo: "/images/mens-club/sponsors/edison-logo.jpg", url: null },
    ],
  },
];

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    mins: Math.floor(diff / 60000) % 60,
    secs: Math.floor(diff / 1000) % 60,
    done: diff === 0,
  };
}

const MENS_CLUB_STATS = [
  { label: "Founded", value: "501(c)(3)", sub: "IRS Ruling 2016" },
  { label: "EIN", value: "46-4087550", sub: "Tax-exempt nonprofit" },
  { label: "Tip-Up Festival", value: "70+", sub: "Years running" },
  { label: "Toys for Tots", value: "$8,000+", sub: "In donations" },
  { label: "Yearly Sponsors", value: "48", sub: "Businesses & families" },
  { label: "Annual Events", value: "6+", sub: "Community events" },
];

const MENS_CLUB_EVENTS = [
  {
    title: "Tip-Up Festival",
    date: "First weekend of February",
    desc: "The crown jewel - 70+ years of ice fishing, snowmobile racing, outhouse races, hovercraft rides, poker runs, and the benefit auction. Held on frozen Devils Lake, it's the longest-running winter festival in the Irish Hills.",
    image: "/images/mens-club/tip-up-1.jpg",
  },
  {
    title: "Firecracker 7K Run/Walk",
    date: "July 4th - 8:00 AM",
    desc: "A Fourth of July tradition starting at 3171 Round Lake Hwy. Choose the 7K run/walk or 1-mile family fun run. Proceeds fund the Devils Lake fireworks display.",
    image: "/images/mens-club/firecracker-7k.jpg",
  },
  {
    title: "Golf Outing",
    date: "September 13, 2026 - Shotgun start 8:30 AM",
    desc: "18 holes plus cart at Devils Lake Golf Course - $75 per person or $300 per foursome. Check in at 8:00 am, hot dogs at the turn, a chance at a Yeti cooler, and a hole-in-one contest where an ace wins a 2-year lease on a Ford Bronco Sport. All proceeds benefit the club's charitable programs.",
    image: "/images/mens-club/golf.jpg",
  },
  {
    title: "Halloween Hot Dog Roast",
    date: "Late October",
    desc: "A fall tradition for the whole family - hot dogs over the fire, costumes, and neighbors gathering one more time before the lake freezes and Tip-Up season begins.",
    image: "/images/mens-club/halloween-hot-dog-roast.jpg",
  },
  {
    title: "Benefit Auction & Raffle",
    date: "During Tip-Up Festival",
    desc: "The auction is the club's biggest fundraiser - local businesses and community members donate items. Proceeds support laptops for students, Toys for Tots, Shop with a Hero, and food pantries.",
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
    image: "/images/mens-club/shop-with-a-hero.jpg",
  },
];

const MENS_CLUB_PROGRAMS = [
  { icon: "🎓", title: "Laptops for Students", desc: "Donating laptops to college-bound high school graduates from the local community." },
  { icon: "🎄", title: "Toys for Tots", desc: "Over $8,000 contributed to ensure every child in the area has a gift under the tree." },
  { icon: "🦸", title: "Shop with a Hero", desc: "Partnering with local law enforcement and first responders to give kids a positive holiday shopping experience." },
  { icon: "🍞", title: "Food Pantry Support", desc: "Collecting pantry items for the Kiwanis Club and Community for People in Need." },
  { icon: "🎁", title: "Christmas Gift Baskets", desc: "Delivering holiday gift baskets to families facing hardship, and supplying the hams for the Kiwanis Christmas Baskets." },
  { icon: "🛡️", title: "Catherine Cobb Domestic Violence Center", desc: "Supporting the Lenawee County shelter that helps survivors of domestic violence rebuild their lives." },
  { icon: "🌊", title: "Lakes Preservation", desc: "Backing the Lakes Preservation League's work to keep Devils Lake and Round Lake healthy for the next generation." },
  { icon: "🎆", title: "Fireworks Fund", desc: "Funding the annual July 4th fireworks display over Devils Lake for the entire community." },
];

function GolfCountdown() {
  const { days, hours, mins, secs } = useCountdown(GOLF_OUTING.date);
  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Min", value: mins },
    { label: "Sec", value: secs },
  ];
  return (
    <div style={{ display: "flex", gap: "clamp(8px, 2vw, 14px)", justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
      {units.map((u) => (
        <div key={u.label} style={{
          minWidth: "clamp(64px, 16vw, 92px)", padding: "clamp(10px, 2vw, 16px) 8px",
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 5vw, 40px)", color: C.cream, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {String(u.value).padStart(2, "0")}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight, marginTop: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function MensClubHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);
  const golfMode = Date.now() < GOLF_OUTING.heroUntil.getTime();

  return (
    <section style={{
      backgroundImage: golfMode ? `url(${GOLF_OUTING.poster})` : "url(/images/mens-club-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor: C.night,
      padding: golfMode ? "160px 24px 110px" : "180px 24px 140px",
      position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      {golfMode && (
        <video
          autoPlay muted loop playsInline
          poster={GOLF_OUTING.poster}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src={GOLF_OUTING.video} type="video/mp4" />
        </video>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(10,18,24,0.72) 0%, rgba(10,18,24,0.45) 50%, rgba(10,18,24,0.85) 100%)" }} />
      <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
        <img src="/images/mens_club_logo.png" alt="Men's Club Logo" style={{ width: golfMode ? 180 : 96, height: golfMode ? 180 : 96, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: `3px solid rgba(255,255,255,0.18)`, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
        {golfMode ? (
          <>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunsetLight, marginBottom: 12 }}>
              Devils Lake & Round Lake Men's Club presents
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(34px, 6vw, 62px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 14px 0" }}>
              Golf Outing 2026
            </h1>
            <p style={{ fontSize: "clamp(14px, 1.6vw, 18px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 28px" }}>
              September 13, 2026 · Shotgun start 8:30 am<br />
              {GOLF_OUTING.venue} · Manitou Beach
            </p>
            <GolfCountdown />
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="#golf-outing" className="btn-animated" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 8,
                background: C.sunset, color: C.cream,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
              }}>
                Event Details
              </a>
              <a href={`tel:${GOLF_OUTING.phone.replace(/[^0-9]/g, "")}`} className="btn-animated" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: 8,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: C.cream,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
              }}>
                Call to Sign Up
              </a>
              <ShareBar title="Men's Club Golf Outing 2026 - Devils Lake Golf Course - Manitou Beach" />
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight, marginBottom: 12 }}>
              501(c)(3) Nonprofit
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 400, color: C.cream, lineHeight: 1.05, margin: "0 0 20px 0" }}>
              Devils Lake & Round Lake<br />Men's Club
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
              <ShareBar title="Devils Lake & Round Lake Men's Club - Manitou Beach" />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function MensClubSponsorTicker() {
  // Two identical halves so the -50% marquee loop is seamless.
  const items = [{ name: "Thank You · 2026-27 Yearly Sponsors", badge: true }, ...MENS_CLUB_YEARLY_SPONSORS];
  const repeated = [...items, ...items];
  return (
    <a href="#sponsors" aria-label="See all 2026-2027 yearly sponsors" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: `linear-gradient(90deg, ${C.night} 0%, ${C.dusk} 50%, ${C.night} 100%)`,
        padding: "13px 0", overflow: "hidden", position: "relative",
        borderBottom: `1px solid ${C.sage}20`,
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(270deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div className="marquee-track" style={{ whiteSpace: "nowrap", animationDuration: "32s" }}>
          {repeated.map((s, i) => (
            <span key={i} style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12, fontWeight: s.badge ? 700 : 500, letterSpacing: 1,
              textTransform: "uppercase", color: s.badge ? C.sunsetLight : "rgba(255,255,255,0.75)",
              padding: "0 20px", display: "inline-flex", alignItems: "center", gap: 20,
            }}>
              {s.name}
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.sage, display: "inline-block", opacity: 0.5 }} />
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

function GolfOutingSection() {
  const details = [
    { label: "When", value: "September 13, 2026" },
    { label: "Check-In", value: "8:00 am" },
    { label: "Shotgun Start", value: "8:30 am" },
    { label: "Cost", value: "$75 / person" },
    { label: "Foursome", value: "$300 / team" },
    { label: "At the Turn", value: "Hot dogs" },
  ];

  return (
    <section id="golf-outing" style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionLabel>September 13, 2026</SectionLabel>
            <SectionTitle center>Golf Outing at Devils Lake Golf Course</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
              Grab your foursome and join us for 18 holes, cart included, on the shore of Devils Lake. Every dollar raised goes right back into the community through the club's charitable programs.
            </p>
          </div>
        </FadeIn>

        <div className="mens-club-stats" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 28 }}>
          {details.map((d, i) => (
            <FadeIn key={d.label} delay={i * 60} direction="scale">
              <div style={{ background: C.cream, borderRadius: 12, padding: "20px 12px", textAlign: "center", border: `1px solid ${C.sand}`, height: "100%" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {d.label}
                </div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text }}>{d.value}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={100}>
          <div style={{
            display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", justifyContent: "center",
            background: C.dusk, borderRadius: 16, padding: "28px 28px", marginBottom: 28, textAlign: "center",
          }}>
            <span className="mono-icon" style={{ fontSize: 36, lineHeight: 1 }}>🏌️</span>
            <div style={{ flex: "1 1 320px" }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 6 }}>
                Hole-in-One: Win a 2-Year Lease on a Ford Bronco Sport
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                Hole-in-one prize packages courtesy of Ford / Lincoln and Bell. Ace the contest hole and drive home a Bronco Sport. Plus a chance to win a Yeti cooler on the course.
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <SectionLabel>Thank You</SectionLabel>
            <SectionTitle center>2026 Golf Outing Sponsors</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gap: 14, marginBottom: 28 }}>
          {GOLF_SPONSOR_TIERS.map((tier, ti) => (
            <FadeIn key={tier.tier} delay={ti * 80}>
              <div style={{ background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}`, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: tier.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textLight, fontFamily: "'Libre Franklin', sans-serif" }}>
                    {tier.tier} Sponsor
                  </span>
                </div>
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  {tier.sponsors.map((s) => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 14, flex: "1 1 280px" }}>
                      {s.logo && (
                        <img src={s.logo} alt={s.name} style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 8, background: "#fff", border: `1px solid ${C.sand}`, flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text }}>{s.name}</div>
                        {s.sub && <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5, marginTop: 2 }}>{s.sub}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={180}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <a href="#become-a-sponsor" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: C.sunset, color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Put Your Business on the Course
            </a>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 10 }}>
              Join these sponsors and support the club's charitable programs
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div style={{ background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}`, padding: "26px 26px" }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, marginBottom: 10 }}>
                ⛳ Sign Up Your Team
              </div>
              <p style={{ fontSize: 13.5, color: C.textLight, lineHeight: 1.75, margin: "0 0 14px 0" }}>
                $300 per foursome or $75 per person. Reservations must be accompanied by a check payable to <strong>Men's Club</strong> - mail your registration and payment to 3171 Round Lake Highway, Manitou Beach, MI 49253. Flying solo? Ask to be placed on a team.
              </p>
              <a href={`tel:${GOLF_OUTING.phone.replace(/[^0-9]/g, "")}`} className="btn-animated" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 22px", borderRadius: 8,
                background: C.sage, color: C.cream,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textDecoration: "none",
              }}>
                Call {GOLF_OUTING.venue} · {GOLF_OUTING.phone}
              </a>
            </div>
            <div style={{ background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}`, padding: "26px 26px" }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, marginBottom: 10 }}>
                🚩 Sponsor a Hole - $50
              </div>
              <p style={{ fontSize: 13.5, color: C.textLight, lineHeight: 1.75, margin: "0 0 14px 0" }}>
                A sign with your business name at one of the 18 holes, seen by every golfer on the course - plus a thank-you in the golf day program. Email your name and logo to get on a hole.
              </p>
              <a href="mailto:jborton1031@gmail.com?subject=Golf%20Outing%20Hole%20Sponsorship" className="btn-animated" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 22px", borderRadius: 8,
                background: C.sunset, color: C.cream,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textDecoration: "none",
              }}>
                Email jborton1031@gmail.com
              </a>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={240}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, marginBottom: 12 }}>
              {GOLF_OUTING.venue} · {GOLF_OUTING.address}
            </p>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 19, color: C.sage, margin: 0 }}>
              Save the date: Tip-Up 2027 · February 5, 6 & 7
            </p>
          </div>
        </FadeIn>
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
                The Devils Lake & Round Lake Men's Club is a 501(c)(3) nonprofit dedicated to improving life in the Manitou Beach community. Through the legendary Tip-Up Festival, the Fourth of July Firecracker 7K, the September Golf Outing, and the Halloween Hot Dog Roast, the club raises funds that go directly back to the people who need it most.
              </p>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, margin: 0 }}>
                From buying laptops for college-bound students to donating thousands in toys through Toys for Tots, partnering with law enforcement for Shop with a Hero, and delivering Christmas gift baskets to families in need - the Men's Club is the backbone of Manitou Beach's charitable community.
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
  // Gallery photos - add image paths here as they become available
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
    { src: "/images/mens-club/shop-with-a-hero.jpg", caption: "Shop with a Hero" },
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

// Real club programs from the 2026 sponsor letter: $130/yr Yearly Sponsor, $50 golf hole.
// Form default is tiers[1] (Yearly Sponsor) — keep it second in this array.
const MENS_CLUB_SPONSOR_TIERS = [
  {
    level: "Golf Hole Sponsor", amount: 50,
    perks: [
      "A sign with your business name at one of the 18 holes at the Golf Outing",
      "Acknowledged in the golf day program and brochure",
    ],
  },
  {
    level: "Yearly Sponsor", amount: 130,
    perks: [
      "Your name on the banner displayed at every club event - Tip-Up, Firecracker 7K, Golf Outing, and the Halloween Hot Dog Roast",
      "Your name printed on the back of the Firecracker 7K race t-shirts",
      "Your name displayed on a hole at the Golf Outing",
      "A cling label for your door or window",
    ],
  },
];

const YEARLY_SPONSOR_PERK_CARDS = [
  { icon: "🚩", title: "Banner at Every Event", desc: "Your name on the club banner at Tip-Up, the Firecracker 7K, the Golf Outing, and the Halloween Hot Dog Roast." },
  { icon: "👕", title: "On the 7K Race Shirts", desc: "Printed on the back of every Firecracker 7K run/walk t-shirt - worn all over the lakes, all summer long." },
  { icon: "⛳", title: "Your Own Golf Hole", desc: "Your name displayed on a hole at the September Golf Outing at Devils Lake Golf Course." },
  { icon: "🪟", title: "Window Cling", desc: "A cling label for your door or window that tells everyone you back the lakes community." },
];

// 2026-2027 Yearly Sponsors, transcribed from the club's golf brochure.
// url: official website when one exists, else the business's own Facebook page,
// else null (renders as plain text). Verified July 2026.
const MENS_CLUB_YEARLY_SPONSORS = [
  { name: "Addison Gun Club", url: "https://www.facebook.com/p/Addison-Defense-and-Gun-Club-61573124099438/" },
  { name: "Addison Kiwanis", url: "https://www.facebook.com/addison.kiwanis.2025/" },
  { name: "Alumi-Span Docks", url: "https://www.alumi-span.com/" },
  { name: "American 1 Towing", url: "https://american1-towing.com/" },
  { name: "Ashby Lift Truck Service", url: "https://www.facebook.com/people/Ashby-Lift-Truck-Service/100054264891286/" },
  { name: "Batko Family", url: null },
  { name: "Benny D's on 223", url: "https://www.facebook.com/BennyD223" },
  { name: "Blackbird Cafe", url: "https://blackbirdcafedevils.com" },
  { name: "Boot Jack Tavern", url: "https://bootjacktavern.com" },
  { name: "Bow to Stern Marine", url: "https://www.facebook.com/p/Bow-To-Stern-Marine-61576982261903/" },
  { name: "Carrie Lynn Wellness", url: "https://www.carrielynnwellness.com" },
  { name: "CDs Party Rental", url: "https://cdspartyrental.com/" },
  { name: "County National Bank - Hudson", url: "https://www.cnbb.bank/About-CNB/Locations-Hours/Hudson" },
  { name: "Decker & Sons Insurance", url: "https://www.deckerandsonsinsurance.com/" },
  { name: "Dempsey & Dempsey Accounting", url: "https://www.dempseycpa.com/" },
  { name: "Devils Lake Bar & Grill", url: "https://www.facebook.com/Thecovedevilslake/" },
  { name: "Devils Lake Golf Course", url: "https://www.devilslakegolfcourse.com/" },
  { name: "Devils Lake View Living", url: "http://devilslakeviewliving.com" },
  { name: "Devils Lake Water Sports", url: "https://dlwatersports.com" },
  { name: "Down 2 Earth Custom Logging", url: "https://d2elogging.com/" },
  { name: "Edison Builders", url: null },
  { name: "Faust House Scrap & Craft / Ice Cream", url: "https://fausthousescrapncraft.com" },
  { name: "Gil Henry & Assoc. Inc", url: "https://www.gilhenryandassociates.com/" },
  { name: "Glamour Auto Shop", url: "https://www.facebook.com/p/Glamour-Auto-Shop-100092441275673/" },
  { name: "Harper Landscaping & Patio", url: "https://www.facebook.com/HarperLandscapePatioLlc/" },
  { name: "Highland Inn", url: "https://thewellstavern.net/highland-inn" },
  { name: "Jeff Jackson Farm Bureau Ins", url: "https://www.michfb.com/insurance/find-an-agent/jeff-jackson-4025-s-adrian-hwy" },
  { name: "Lakeside Construction", url: null },
  { name: "Lakes Preservation League - Devils & Round Lake", url: "https://lakespreservationleague.org/" },
  { name: "Lightning Quick Gas N Go", url: null },
  { name: "Manitou Beach Marina", url: "https://manitoubeachmarina.com/" },
  { name: "Manitou Storage Co.", url: "https://www.manitoustorageco.com/" },
  { name: "McAuliffe's Meats", url: "https://www.facebook.com/McauliffesMeats/" },
  { name: "MonsterMotors.com", url: "https://www.monstermotors.com/" },
  { name: "National Transportation Associates", url: "https://www.ntains.com/" },
  { name: "Poppas Place Inc", url: "https://www.facebook.com/poppasplacedos/" },
  { name: "Printed on a Lark", url: "https://printedonalark.com/" },
  { name: "Rock Hard Concrete - Adrian", url: null },
  { name: "Sam & Jeryl Cepida - Foundation Realty", url: "https://www.foundationlenawee.com/" },
  { name: "Mark Scarlato Family", url: null },
  { name: "Scotty's Body Shop", url: "https://scottysbodyshopmi.com/" },
  { name: "Shea'Nanigans", url: "https://sheananigansmi.com/" },
  { name: "South Shore Marine Services", url: "https://www.facebook.com/p/South-Shore-Marine-Services-LLC-100092384540558/" },
  { name: "Sterling Market & Pizzeria", url: "https://www.sterlingmarketandpizzeria.com/" },
  { name: "The Lakes Print Shop", url: "https://thelakesprintshop.com/" },
  { name: "The Springs BP", url: null },
  { name: "The Tavern on 223", url: "https://www.facebook.com/CheeseHouse1/" },
  { name: "Trends Salon & Spa", url: "https://trendssalonmi.wixsite.com/salon" },
];

function MensClubSponsorWall() {
  return (
    <section id="sponsors" style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionLabel>Thank You</SectionLabel>
            <SectionTitle center>2026-2027 Yearly Sponsors</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
              These {MENS_CLUB_YEARLY_SPONSORS.length} businesses and families fund everything the club does - from student laptops to the fireworks over the lake. When you see their name, thank them.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={100}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px 20px",
            background: C.cream, border: `1px solid ${C.sand}`, borderRadius: 16, padding: "28px 28px",
          }}>
            {MENS_CLUB_YEARLY_SPONSORS.map((s) => (
              <div key={s.name} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "5px 0", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, lineHeight: 1.45 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.sunset, flexShrink: 0, marginTop: 6 }} />
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-hover-underline" style={{ color: C.lakeDark, textDecoration: "none" }}>
                    {s.name}
                  </a>
                ) : (
                  <span style={{ color: C.text }}>{s.name}</span>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
        <FadeIn delay={150}>
          <p style={{ textAlign: "center", fontSize: 14, color: C.textLight, marginTop: 24, marginBottom: 0 }}>
            Want your name on this wall, the race shirts, and the event banner?{" "}
            <a href="#become-a-sponsor" style={{ color: C.sunset, fontWeight: 600, textDecoration: "none" }}>Become a Yearly Sponsor for $130 →</a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

function MensClubSponsorForm() {
  return (
    <section id="become-a-sponsor" style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <SectionLabel>Support the Mission</SectionLabel>
            <SectionTitle center>Become a Yearly Sponsor</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, maxWidth: 560, margin: "0 auto" }}>
              For <strong style={{ color: C.text }}>$130 a year</strong>, your name travels with the club through every season - and every dollar funds laptops for students, Toys for Tots, Shop with a Hero, and families in need right here at the lakes.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 28 }}>
          {YEARLY_SPONSOR_PERK_CARDS.map((p, i) => (
            <FadeIn key={p.title} delay={i * 60} direction="scale">
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "18px 20px", background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}`, height: "100%" }}>
                <span className="mono-icon" style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text }}>{p.title}</div>
                  <div style={{ fontSize: 12.5, color: C.textLight, lineHeight: 1.6, marginTop: 3 }}>{p.desc}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={100}>
          <div style={{
            display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
            background: C.dusk, borderRadius: 14, padding: "20px 24px", marginBottom: 36,
          }}>
            <span className="mono-icon" style={{ fontSize: 30, lineHeight: 1 }}>📅</span>
            <div style={{ flex: "1 1 300px" }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, marginBottom: 4 }}>
                Sponsorships are due by May 1st
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                That's the cutoff to get your name on the 7K shirts, your golf hole sign, and the event banner for the year.
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={140}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text, marginBottom: 6 }}>
              Apply online
            </div>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              Enter your name <em>exactly as you want it to appear</em> on the banner and t-shirt. Prefer paper? Mail your form and check, payable to <strong style={{ color: C.textLight }}>The Devils Lake & Round Lake Men's Club</strong>, to 3171 Round Lake Hwy., Manitou Beach, MI 49253.
            </p>
          </div>
        </FadeIn>
        <CommunityDonationForm
          orgName="Devils Lake & Round Lake Men's Club"
          submitEndpoint="/api/mens-club-sponsor"
          tiers={MENS_CLUB_SPONSOR_TIERS}
          accentColor={C.sunset}
          note="A club representative will follow up within 2 business days to arrange payment by check. The Devils Lake & Round Lake Men's Club is a 501(c)(3) nonprofit - EIN 46-4087550 - so your sponsorship may be tax deductible."
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
            Whether you want to volunteer at Tip-Up, help with the fireworks, or just meet good people who care about this community - the Men's Club is always looking for new members.
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
<SEOHead
        title="Men's Club"
        description="Devils Lake & Round Lake Men's Club - 501(c)(3) serving Manitou Beach, Michigan. Tip-Up Festival, Firecracker 7K, Golf Outing, yearly sponsorships, and membership."
        path="/mens-club"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: "Men's Club", path: '/mens-club' },
        ]}
      />
<GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <MensClubHero />
      <MensClubSponsorTicker />
      <GolfOutingSection />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />
      <MensClubStatsSection />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <MensClubMissionSection />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <MensClubEventsSection />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />
      <EventPhotoWall slug="mens-club" title="Men's Club" />
      <MensClubGallerySection />
      <MensClubSponsorWall />
      <MensClubSponsorForm />
      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />
      <MensClubGetInvolved />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

