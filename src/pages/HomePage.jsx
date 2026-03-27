import React, { useState, useEffect } from 'react';
import { C, SECTIONS, CAT_COLORS } from '../data/config';
import { BASE_PRICES } from '../data/pricing';
import { ShareBar, CategoryPill, SectionLabel, SectionTitle, FadeIn, ScrollProgress, WaveDivider, PageSponsorBanner, DiagonalDivider, Btn, useCardTilt } from '../components/Shared';
import { GlobalStyles, PromoBanner, NewsletterInline, HollyYetiSection, EventLightbox, Footer, Navbar, ContactModal } from '../components/Layout';
import { DispatchPreviewSection } from './DispatchPage';
import yeti from '../data/errorMessages';

// ============================================================
// 🏠  HOME PAGE — EventTicker, Hero, FeaturedEventsStrip,
//      SubscribeModal, NewsletterBar, HappeningSection,
//      ExploreSection, PricingSection, BusinessDirectory,
//      LivingSection, AboutSection, LiveFoodTruckStrip
// ============================================================

function EventTicker() {
  const [tickerItems, setTickerItems] = useState([]);
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => {
        const upcoming = (data.events || []).map(e => {
          const d = new Date(e.date + "T00:00:00");
          const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return `${e.name} · ${formatted}`;
        });
        const regulars = (data.recurring || []).map(e =>
          `${e.name} · Every ${e.recurringDay || "Week"}`
        );
        setTickerItems([...upcoming, ...regulars]);
      })
      .catch(() => {});
  }, []);

  if (tickerItems.length === 0) return null;
  const repeated = [...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems];
  return (
    <a href="/events" style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: `linear-gradient(90deg, ${C.night} 0%, ${C.dusk} 50%, ${C.night} 100%)`,
        padding: "14px 0",
        overflow: "hidden",
        position: "relative",
        borderBottom: `1px solid ${C.sage}20`,
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(270deg, ${C.night}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div className="marquee-track" style={{ whiteSpace: "nowrap" }}>
          {repeated.map((item, i) => (
            <span key={i} style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12, fontWeight: 500, letterSpacing: 1,
              textTransform: "uppercase", color: C.sunsetLight,
              padding: "0 24px", display: "inline-flex", alignItems: "center", gap: 24,
            }}>
              {item}
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: C.sage, display: "inline-block", opacity: 0.5 }} />
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

// ============================================================
// 🏠  HERO SECTION
// ============================================================
function Hero({ scrollTo }) {
  // All hooks at top — fixes React rules-of-hooks violation from previous pattern
  const [loaded, setLoaded] = useState(false);
  const [heroEvents, setHeroEvents] = useState([]);
  const [heroTakeover, setHeroTakeover] = useState([]);
  const [heroReady, setHeroReady] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFade, setHeroFade] = useState(true);
  const [heroPaused, setHeroPaused] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    fetch("/api/hero")
      .then(r => r.json())
      .then(data => {
        setHeroEvents(data.events || []);
        setHeroReady(true);
      })
      .catch(() => setHeroReady(true));
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => setHeroTakeover(data.heroTakeover || []))
      .catch(() => {});
  }, []);

  // Auto-rotate through hero events every 10 seconds with fade transition
  // Uses takeover events when active, organic events otherwise
  const rotationCount = heroTakeover.length > 0 ? heroTakeover.length : heroEvents.length;
  useEffect(() => {
    if (rotationCount <= 1 || heroPaused) return;
    const t = setInterval(() => {
      setHeroFade(false);
      setTimeout(() => {
        setHeroIndex(i => (i + 1) % rotationCount);
        setHeroFade(true);
      }, 800);
    }, 10000);
    return () => clearInterval(t);
  }, [rotationCount, heroPaused]);

  // Parallax for default video hero
  useEffect(() => {
    const onScroll = () => { if (window.scrollY < window.innerHeight * 1.2) setScrollY(window.scrollY); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollIndicator = (
    <div style={{
      position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
      zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.2)" }} />
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
        Scroll
      </div>
    </div>
  );

  // ── EVENT HERO (with rotation) ──
  // If a paid Hero Takeover promo is active, show takeover events exclusively
  const isSponsored = heroTakeover.length > 0;
  const displayEvents = isSponsored ? heroTakeover : heroEvents;
  const heroEvent = displayEvents[heroIndex] || null;
  if (heroReady && heroEvent) {
    // heroImageUrl = high-res image for full-screen bg (add "Hero Image URL" column in Notion)
    // imageUrl = small event image — shown as a contained card, never stretched
    const bgStyle = heroEvent.heroImageUrl
      ? {}
      : { background: `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 50%, ${C.dusk} 100%)` };

    return (
      <section
        id="home"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", ...bgStyle }}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {heroEvent.heroImageUrl && (() => {
          const isBgVideo = /\.(mp4|webm|mov|m4v)/i.test(heroEvent.heroImageUrl);
          return isBgVideo ? (
            <video
              key={heroEvent.heroImageUrl}
              ref={el => el && (el.muted = true)}
              autoPlay loop playsInline
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            >
              <source src={heroEvent.heroImageUrl} type="video/mp4" />
            </video>
          ) : (
            <img
              key={heroEvent.heroImageUrl}
              src={heroEvent.heroImageUrl}
              alt=""
              aria-hidden="true"
              className="ken-burns-bg"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
            />
          );
        })()}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(26,40,48,0.75) 0%, rgba(26,40,48,0.5) 50%, rgba(26,40,48,0.85) 100%)", zIndex: 1 }} />

        {/* Coming Up / Sponsored badge — top right */}
        <div style={{ position: "absolute", top: 100, right: 48, zIndex: 2 }}>
          <div style={{
            display: "inline-block",
            background: isSponsored ? `${C.sage}22` : `${C.sunset}22`,
            border: `1px solid ${isSponsored ? C.sage : C.sunset}50`,
            borderRadius: 4, padding: "6px 16px", fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
            color: isSponsored ? C.sage : C.sunsetLight,
          }}>
            {isSponsored ? "Sponsored" : "Coming Up"}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 960, margin: "0 auto", padding: "120px 48px 100px" }}>
          <div style={{ opacity: loaded && heroFade ? 1 : 0, transform: loaded && heroFade ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>
              Manitou Beach · Devils Lake, Michigan
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 400, color: C.cream, lineHeight: 1.1, margin: "0 0 12px 0", maxWidth: 700 }}>
              {heroEvent.name}
            </h1>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(18px, 2.5vw, 26px)", color: C.sunsetLight, margin: "0 0 20px 0" }}>
              {new Date(heroEvent.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {heroEvent.time && ` · ${heroEvent.time}`}
            </div>

            {/* Event image/video — wide, contained, below the date */}
            {heroEvent.imageUrl && (() => {
              const isVideo = /\.(mp4|webm|mov|m4v)/i.test(heroEvent.imageUrl);
              const mediaStyle = {
                width: "100%", height: "auto", maxHeight: 320,
                objectFit: "contain", display: "block",
              };
              return (
                <div style={{ margin: "0 0 24px 0", maxWidth: 546, width: "100%", borderRadius: 12, overflow: "hidden" }}>
                  {isVideo ? (
                    <video
                      key={heroEvent.imageUrl}
                      ref={el => el && (el.muted = true)}
                      src={heroEvent.imageUrl}
                      autoPlay loop playsInline
                      style={mediaStyle}
                    />
                  ) : (
                    <img
                      src={heroEvent.imageUrl}
                      alt={heroEvent.name}
                      style={mediaStyle}
                    />
                  )}
                </div>
              );
            })()}

            {heroEvent.tagline && (
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, maxWidth: 560, margin: "0 0 24px 0" }}>
                {heroEvent.tagline}
              </p>
            )}

            {/* CTA button — event-specific (Get Tickets / Learn More etc.) */}
            {heroEvent.eventUrl && (
              <div style={{ marginBottom: 16 }}>
                <a
                  href={heroEvent.eventUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block", padding: "13px 32px",
                    background: "#4A9B6F", color: "#fff", borderRadius: 6,
                    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
                    fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                    textDecoration: "none", transition: "all 0.25s ease",
                  }}
                >
                  {heroEvent.ctaLabel || "Get Tickets"}
                </a>
              </div>
            )}

            {/* Site nav buttons — below, visually separated from event CTA */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: heroEvent.eventUrl ? 4 : 0 }}>
              <Btn href="/events" variant="sunset">See All Events</Btn>
              <Btn onClick={() => scrollTo("businesses")} variant="outlineLight">Explore the Community</Btn>
            </div>
          </div>
        </div>

        {/* Rotation dots — only if multiple events */}
        {displayEvents.length > 1 && (
          <div style={{
            position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)",
            zIndex: 3, display: "flex", gap: 10,
          }}>
            {displayEvents.map((_, i) => (
              <button
                key={i}
                onClick={() => { setHeroFade(false); setTimeout(() => { setHeroIndex(i); setHeroFade(true); }, 400); setHeroPaused(true); }}
                style={{
                  width: i === heroIndex ? 24 : 8, height: 8,
                  borderRadius: 4, border: "none",
                  background: i === heroIndex ? C.sunsetLight : "rgba(255,255,255,0.3)",
                  cursor: "pointer", padding: 0,
                  transition: "all 0.35s ease",
                }}
              />
            ))}
          </div>
        )}

        {scrollIndicator}
      </section>
    );
  }

  // ── DEFAULT HERO (video + parallax) ──
  return (
    <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${C.night} 0%, ${C.lakeDark} 60%, ${C.dusk} 100%)`, zIndex: 0 }} />
      <video
        autoPlay muted loop playsInline
        style={{
          position: "absolute", inset: 0, width: "100%", height: "120%", objectFit: "cover", zIndex: 1,
          transform: `translateY(${scrollY * 0.3}px)`, willChange: "transform",
        }}
      >
        <source src="/videos/hero-default.mp4" type="video/mp4" />
      </video>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, rgba(26,40,48,0.6) 0%, rgba(26,40,48,0.35) 50%, rgba(26,40,48,0.75) 100%)", zIndex: 2 }} />
      <div style={{ position: "absolute", top: "20%", right: "15%", width: 200, height: 200, borderRadius: "50%", background: `${C.sage}08`, zIndex: 2, animation: "float-slow 8s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "25%", left: "10%", width: 120, height: 120, borderRadius: "50%", background: `${C.sunset}06`, zIndex: 2, animation: "float 6s ease-in-out infinite 2s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "60%", right: "8%", width: 60, height: 60, borderRadius: "50%", border: `1px solid ${C.sage}15`, zIndex: 2, animation: "float-slow 10s ease-in-out infinite 1s", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 3, maxWidth: 960, margin: "0 auto", padding: "160px 48px 120px", transform: `translateY(${scrollY * 0.08}px)` }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 24, animation: loaded ? "tracking-in 0.8s ease forwards" : "none" }}>
            Welcome to
          </div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 400, color: C.cream, lineHeight: 1.0, margin: "0 0 16px 0" }}>
            Manitou Beach
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 3vw, 32px)", color: C.sunsetLight, marginBottom: 30 }}>
            on Devils Lake, Michigan
          </div>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 520, margin: "0 0 48px 0" }}>
            Boaters, lake homeowners, and Irish Hills regulars all end up here. Find what's on, where to eat, and who's worth knowing.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Btn onClick={() => scrollTo("businesses")} variant="primary">Explore Businesses</Btn>
            <Btn onClick={() => scrollTo("happening")} variant="outlineLight">Events</Btn>
          </div>
          <ShareBar title="Manitou Beach — Irish Hills, Michigan" />
        </div>
      </div>
      {scrollIndicator}
    </section>
  );
}
function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [error, setError] = useState('');
  const [subCount, setSubCount] = useState(null);

  useEffect(() => {
    fetch('/api/subscribe').then(r => r.json()).then(d => setSubCount(d.count ?? 0)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setAlreadySubscribed(data.alreadySubscribed);
      setShowModal(true);
    } catch (err) {
      setError(yeti.oops());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: C.dusk,
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <SectionLabel light>You Belong Here</SectionLabel>
        <h3 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 400,
          color: C.cream,
          margin: "0 0 10px 0",
        }}>
          The Manitou Beach Dispatch
        </h3>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 12px 0", lineHeight: 1.7 }}>
          {subCount ? `${subCount.toLocaleString()}+ lake neighbors already subscribe.` : 'Your lake neighbors are already here.'} Weekly events, featured businesses, and everything happening on the water.
        </p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", margin: "0 0 28px 0", fontFamily: "'Libre Franklin', sans-serif" }}>
          Free. Unsubscribe anytime.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={submitting}
            style={{
              flex: 1, minWidth: 200, padding: "12px 18px", borderRadius: 4,
              border: `1px solid rgba(255,255,255,0.15)`,
              background: "rgba(255,255,255,0.08)", color: C.cream,
              fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: "none",
            }}
          />
          <Btn variant="sage" disabled={submitting}>{submitting ? 'Joining…' : 'Subscribe'}</Btn>
        </form>
        {error && <p style={{ color: C.sunset, fontSize: 13, marginTop: 10 }}>{error}</p>}
        {showModal && <SubscribeModal alreadySubscribed={alreadySubscribed} onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
}
function HappeningSection() {
  const [notionEvents, setNotionEvents] = useState([]);
  const [lightboxEvent, setLightboxEvent] = useState(null);
  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setNotionEvents(data.events || []))
      .catch(() => {});
  }, []);

  const categoryColors = {
    "Live Music": C.sunset,
    "Food & Social": "#8B5E3C",
    "Sports & Outdoors": C.sage,
    Community: C.lakeBlue,
  };
  const preview = notionEvents.slice(0, 3);

  return (
    <section id="happening" style={{
      position: "relative",
      padding: "100px 24px",
      backgroundImage: "url(/images/happening-bg.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: C.dusk, /* fallback until image is added */
    }}>
      {/* Dark overlay — adjust opacity for photo intensity */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(18,28,35,0.88) 0%, rgba(30,45,54,0.82) 100%)", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
            <div>
              <SectionLabel light>Events & News</SectionLabel>
              <SectionTitle light>Events</SectionTitle>
            </div>
            <Btn href="/events" variant="outlineLight" small>See All Events →</Btn>
          </div>
        </FadeIn>

        {/* Timeline preview — 3 events */}
        <div style={{ position: "relative", marginBottom: 52 }}>
          <div style={{
            position: "absolute", left: 200, top: 0, bottom: 0,
            width: 1, background: "rgba(255,255,255,0.08)",
          }} />
          {preview.length === 0 ? (
            <div style={{ padding: "32px 0", fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
              Adding events soon — check back!
            </div>
          ) : preview.map((event, i) => {
            const color = categoryColors[event.category] || C.sage;
            const dateLabel = (() => {
              try { return new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
              catch { return event.date; }
            })();
            return (
              <FadeIn key={event.id} delay={i * 70}>
                <div
                  onClick={() => setLightboxEvent(event)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 40px 1fr",
                    alignItems: "flex-start",
                    marginBottom: i < preview.length - 1 ? 48 : 0,
                    gap: 0,
                    cursor: "pointer",
                  }}>
                  <div style={{ paddingRight: 24, paddingTop: 4, textAlign: "right" }}>
                    <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color, lineHeight: 1.2 }}>
                      {dateLabel}
                    </div>
                    {event.time && (
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1, marginTop: 3 }}>
                        {event.time}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8 }}>
                    <div style={{ width: 11, height: 11, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 0 3px ${color}22` }} />
                  </div>
                  <div style={{ paddingLeft: 20 }}>
                    <div style={{ marginBottom: 8 }}><CategoryPill>{event.category}</CategoryPill></div>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 400, color: C.cream, margin: "0 0 10px 0", lineHeight: 1.2 }}>
                      {event.name}
                    </h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 6px 0", maxWidth: 560, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {event.description}
                    </p>
                    {event.description && (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'Libre Franklin', sans-serif", fontStyle: "italic", letterSpacing: 0.5 }}>
                        click to see more...
                      </span>
                    )}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Full calendar CTA */}
        <FadeIn delay={240}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>
                {notionEvents.length > 3 ? `+ ${notionEvents.length - 3} more events on the calendar` : "See the full calendar"}
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                weekly regulars, seasonal events & more
              </div>
            </div>
            <Btn href="/events" variant="sunset">Open Full Calendar →</Btn>
          </div>
        </FadeIn>
      </div>
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </section>
  );
}

// ============================================================
// 📅  /happening — PAGE HERO
// ============================================================
function ExploreCard({ place, large = false, delay = 0 }) {
  const tilt = useCardTilt(5);
  const hasImage = !!place.image;
  return (
    <FadeIn delay={delay} direction={large ? "scale" : "up"}>
      <div
        ref={tilt.ref}
        onMouseEnter={tilt.onMouseEnter}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        onClick={place.action}
        className="card-tilt"
        style={{
          backgroundImage: hasImage ? `url(${place.image})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          border: "none",
          borderRadius: 14,
          padding: large ? "36px 32px" : "24px 20px",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          minHeight: large ? 280 : 200,
          position: "relative",
          overflow: "hidden",
          boxShadow: large ? "0 12px 40px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        {/* Dark overlay for text readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: hasImage
            ? (large
              ? "linear-gradient(to top, rgba(10,18,24,0.88) 0%, rgba(10,18,24,0.35) 55%, rgba(10,18,24,0.08) 100%)"
              : "linear-gradient(to top, rgba(10,18,24,0.88) 0%, rgba(10,18,24,0.35) 60%, rgba(10,18,24,0.05) 100%)")
            : (large ? `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)` : C.warmWhite),
          borderRadius: 14,
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Only show icon on large cards */}
          {large && <div className="mono-icon" style={{ fontSize: 36, marginBottom: 14 }}>{place.icon}</div>}
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: large ? 22 : 15, fontWeight: 700,
            color: (large || hasImage) ? C.cream : C.text,
            marginBottom: 5,
          }}>{place.name}</div>
          <div style={{
            fontSize: large ? 14 : 12,
            color: (large || hasImage) ? "rgba(255,255,255,0.6)" : C.textMuted,
            lineHeight: 1.55, marginBottom: large ? 16 : 10,
            display: "-webkit-box",
            WebkitLineClamp: large ? 4 : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>{place.desc}</div>
          {place.actionLabel && (
            <div className="link-hover-underline" style={{
              fontSize: 10, fontFamily: "'Libre Franklin', sans-serif",
              fontWeight: 700, letterSpacing: 1.2, paddingTop: 5,
              color: C.sunsetLight, textTransform: "uppercase",
            }}>
              {place.actionLabel} →
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

function ExploreSection() {
  const places = [
    { icon: "⛵", name: "Devils Lake", desc: "1,330 acres of water for boating, fishing, and kayaking. The party lake.", image: "/images/explore-devils-lake.jpg", action: () => window.location.href = "/devils-lake", actionLabel: "Explore Devils Lake" },
    { icon: "🏘️", name: "The Village", desc: "Boutique shops, a handmade cafe, wine tasting, and the lighthouse. The walkable heart of Manitou Beach.", image: "/images/explore-lighthouse.jpg", action: () => window.location.href = "/village" },
    { icon: "🌿", name: "Irish Hills", desc: "Rolling hills, hidden trails, and enough nature to justify the drive.", image: "/images/explore-Irish-hills.jpg", action: () => window.open("https://www.irishhills.com", "_blank"), actionLabel: "Explore Irish Hills" },
    { icon: "🍺", name: "Nightlife", desc: "Year-round bars and restaurants with a dock-side state of mind.", image: "/images/explore-nightlife.jpg", action: () => window.location.href = "/nightlife", actionLabel: "Explore Nightlife" },
    { icon: "🎣", name: "Fishing", desc: "Bass, pike, bluegill, and walleye. Two lakes, twelve months of catching.", image: "/images/explore-fishing.jpg", action: () => window.location.href = "/fishing", actionLabel: "Fishing Guide" },
    { icon: "🍷", name: "Wineries", desc: "Michigan wine and craft beverages, right in the Irish Hills.", image: "/images/Explore-wineries.jpg", action: () => window.location.href = "/wineries", actionLabel: "Wine Trail" },
    { icon: "🌊", name: "Round Lake", desc: "515 acres of clear water. The quieter side of lake life.", image: "/images/explore-round-lake.jpg", action: () => window.location.href = "/round-lake", actionLabel: "Explore" },
  ];

  return (
    <section id="explore" style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn direction="left">
          <SectionLabel>The Area</SectionLabel>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 400, color: C.text, margin: "0 0 18px 0", lineHeight: 1.2 }}>
            Explore Manitou Beach
          </h2>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, marginBottom: 48, maxWidth: 560 }}>
            Sitting on the shores of Devils Lake in the Michigan Irish Hills — there's more to explore here than the name implies.
          </p>
        </FadeIn>

        {/* Bento layout: 2 large cards on top, 3+2 smaller below */}
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {places.slice(0, 2).map((p, i) => (
            <ExploreCard key={i} place={p} large delay={i * 100} />
          ))}
        </div>
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
          {places.slice(2, 5).map((p, i) => (
            <ExploreCard key={i + 2} place={p} delay={200 + i * 60} />
          ))}
        </div>
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {places.slice(5).map((p, i) => (
            <ExploreCard key={i + 5} place={p} delay={380 + i * 60} />
          ))}
        </div>

      </div>
    </section>
  );
}
function PricingSection() {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ businessName: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [showContact, setShowContact] = useState(false);

  const PAID_TIERS = [
    {
      id: 'enhanced', name: 'Enhanced', color: C.lakeBlue, badge: null,
      price: BASE_PRICES.enhanced.toFixed(2), priceInCents: BASE_PRICES.enhanced * 100,
      features: ['Everything in Free', 'Clickable website link', 'Business description', 'Expandable listing card', 'Category search placement'],
    },
    {
      id: 'featured', name: 'Featured', color: C.sage, badge: 'Most Popular',
      price: BASE_PRICES.featured.toFixed(2), priceInCents: BASE_PRICES.featured * 100,
      features: ['Everything in Enhanced', 'Spotlight card placement', 'Logo or photo display', 'Above standard listings', 'Email contact button'],
    },
    {
      id: 'premium', name: 'Premium', color: C.sunsetLight, badge: 'Best Visibility',
      price: BASE_PRICES.premium.toFixed(2), priceInCents: BASE_PRICES.premium * 100,
      features: ['Everything in Featured', 'Full-width banner placement', 'Large logo (110×110)', 'Top-of-directory position', 'Cross-page placements'],
    },
  ];

  const handleCheckout = async () => {
    if (!form.businessName.trim() || !form.email.trim()) { setCheckoutError('Business name and email are required.'); return; }
    setLoading(true); setCheckoutError('');
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: modal.tierId, businessName: form.businessName, email: form.email, priceInCents: modal.priceInCents, mode: 'subscription' }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setCheckoutError(data.error || yeti.oops()); }
    } catch { setCheckoutError(yeti.network()); }
    finally { setLoading(false); }
  };

  return (
    <>
      {showContact && <ContactModal onClose={() => setShowContact(false)} defaultCategory="Business Inquiry" />}
      <div id="listing-tiers" style={{ background: C.night, padding: "80px 24px 72px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 14 }}>
              List Your Business
            </div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 400, color: C.cream, margin: "0 0 14px 0" }}>
              Choose Your Visibility
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 520, margin: "0 auto 32px" }}>
              When visitors search for what's here, your business shows up. Simple as that. Pick a tier, get listed, and let the lake do the rest.
            </p>
          </div>

          {/* Free tier — compact row */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.driftwood, marginBottom: 3 }}>Free</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream }}>$0 <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>forever</span></div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {["Name in directory", "Category & phone", "Community visibility"].map(f => (
                    <span key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      <span style={{ color: C.driftwood, fontWeight: 700 }}>✓</span>{f}
                    </span>
                  ))}
                </div>
              </div>
              <a href="/#submit" style={{ padding: "9px 22px", borderRadius: 8, border: `1.5px solid ${C.driftwood}55`, color: C.driftwood, fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", whiteSpace: "nowrap" }}>
                Get Listed Free
              </a>
            </div>
          </div>

          {/* Paid tiers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {PAID_TIERS.map(tier => (
              <div key={tier.id} style={{ background: tier.badge ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${tier.badge ? tier.color + "45" : "rgba(255,255,255,0.09)"}`, borderRadius: 16, padding: "28px 22px", position: "relative", display: "flex", flexDirection: "column" }}>
                {tier.badge && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: tier.color, color: C.night, fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                    {tier.badge}
                  </div>
                )}
                <div style={{ color: tier.color, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{tier.name}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: C.cream, fontWeight: 700 }}>${tier.price}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}>/mo</span>
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16, letterSpacing: 0.3 }}>
                  Cancel anytime · no contracts
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0", flexGrow: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <span style={{ color: tier.color, fontSize: 13, marginTop: 2, flexShrink: 0, fontWeight: 700 }}>✓</span>
                      <span style={{ color: "rgba(255,255,255,0.58)", fontSize: 13, lineHeight: 1.45 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setModal({ tierId: tier.id, tierName: tier.name, price: tier.price, priceInCents: tier.priceInCents, color: tier.color }); setForm({ businessName: '', email: '' }); setCheckoutError(''); }}
                  style={{ display: "block", width: "100%", padding: "11px 0", borderRadius: 8, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", border: "none", background: tier.id === "premium" ? C.sunset : "transparent", color: tier.id === "premium" ? C.cream : tier.color, outline: tier.id === "premium" ? "none" : `1.5px solid ${tier.color}55`, transition: "all 0.22s" }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>

          {/* Newsletter add-on */}
          <div style={{ marginTop: 32, background: "rgba(91,126,149,0.1)", border: "1px solid rgba(91,126,149,0.22)", borderRadius: 14, padding: "28px 28px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ maxWidth: 480 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.lakeBlue, marginBottom: 8 }}>Newsletter Add-On</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.cream, margin: "0 0 10px 0" }}>Reach the inbox, not just the directory</h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  The Manitou Dispatch lands directly in the inboxes of people already invested in this community. Event organizers know they can't get 2,000 engaged local eyes in a single drop — your business can.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 210 }}>
                {[
                  { label: "Mention", desc: "1-line + link in Dispatch", price: "$29/issue" },
                  { label: "Feature", desc: "Paragraph + photo + CTA", price: "$75/issue" },
                  { label: "Monthly Sponsor", desc: "Every issue that month", price: "$199/mo" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 14px" }}>
                    <div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: C.cream }}>{item.label}</div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.desc}</div>
                    </div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.lakeBlue, whiteSpace: "nowrap" }}>{item.price}</div>
                  </div>
                ))}
                <button onClick={() => setShowContact(true)} style={{ textAlign: "center", padding: "10px", borderRadius: 8, background: "transparent", border: `1.5px solid ${C.lakeBlue}55`, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", marginTop: 4, display: "block", width: "100%" }}>
                  Inquire →
                </button>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 12, marginTop: 24, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
            Monthly subscriptions · Cancel anytime · Rate held while subscribed
          </p>
        </div>
      </div>

      {/* Checkout modal */}
      {modal && (() => {
        const tierFeatures = PAID_TIERS.find(t => t.id === modal.tierId)?.features || [];
        return (
        <div role="dialog" aria-modal="true" aria-label={`${modal.tierName} listing checkout`} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(10,18,24,0.88)", backdropFilter: "blur(8px)" }} onClick={() => setModal(null)}>
          <div style={{ background: C.dusk, borderRadius: 20, padding: "36px 32px", maxWidth: 440, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", border: `1px solid ${modal.color}30` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: modal.color, marginBottom: 6 }}>{modal.tierName} Listing</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.cream, margin: "0 0 4px 0" }}>
              ${modal.price}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>/mo</span>
            </h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 20px 0" }}>Monthly subscription · Cancel or pause anytime</p>

            {/* What's included — tier feature summary */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", marginBottom: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>What you get</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {tierFeatures.filter(f => !f.startsWith('Everything')).map(f => (
                  <span key={f} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "'Libre Franklin', sans-serif" }}>
                    <span style={{ color: modal.color, fontWeight: 700, fontSize: 11 }}>+</span>{f}
                  </span>
                ))}
              </div>
            </div>

            {/* Contract terms — clear and upfront */}
            <div style={{ background: `${modal.color}0A`, borderRadius: 10, padding: "14px 16px", marginBottom: 22, border: `1px solid ${modal.color}15` }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>How it works</div>
              {[
                { icon: "↻", text: "Billed monthly — no long-term contract" },
                { icon: "⚡", text: `Your $${modal.price}/mo rate is locked while subscribed` },
                { icon: "✕", text: "Cancel anytime — listing reverts to Free tier" },
                { icon: "↩", text: "Re-subscribe later at whatever the current rate is" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 7, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.45 }}>
                  <span style={{ color: modal.color, flexShrink: 0, width: 16, textAlign: "center" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 5, display: "block" }}>Business name</label>
                <input
                  placeholder="e.g. Lake House Grill"
                  value={form.businessName}
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = `${modal.color}60`}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
              </div>
              <div>
                <label style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 5, display: "block" }}>Email address</label>
                <input
                  placeholder="you@business.com"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = `${modal.color}60`}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
              </div>
            </div>
            {checkoutError && <p style={{ color: "#ff6b5b", fontSize: 13, marginBottom: 14 }}>{checkoutError}</p>}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-animated"
              style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: modal.tierId === "premium" ? C.sunset : modal.color, color: C.cream, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}
            >
              {loading ? "Redirecting to Stripe…" : `Start ${modal.tierName} · $${modal.price}/mo →`}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.22)", marginTop: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
              Secure checkout by Stripe · No card details stored on our servers
            </p>
          </div>
        </div>
        );
      })()}
    </>
  );
}

// ============================================================
// 🏪  BUSINESS DIRECTORY
// ============================================================
function BusinessDirectory() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [notionFree, setNotionFree] = useState([]);
  const [notionEnhanced, setNotionEnhanced] = useState([]);
  const [notionFeatured, setNotionFeatured] = useState([]);
  const [notionPremium, setNotionPremium] = useState([]);

  useEffect(() => {
    fetch("/api/businesses")
      .then(r => r.json())
      .then(data => {
        setNotionFree(data.free || []);
        setNotionEnhanced(data.enhanced || []);
        setNotionFeatured(data.featured || []);
        setNotionPremium(data.premium || []);
      })
      .catch(() => {});
  }, []);

  // Premium + Featured go into the card carousel; Enhanced + Free go into the row list
  // Directory is 100% Notion-driven
  const allBusinesses = [...notionFree, ...notionEnhanced, ...notionFeatured, ...notionPremium];
  const categories = ["All", ...Array.from(new Set(allBusinesses.map(b => b.category)))];

  const matchesSearch = (b) => {
    const q = search.toLowerCase();
    return !search ||
      b.name.toLowerCase().includes(q) ||
      (b.description || "").toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q);
  };

  const filtered = allBusinesses.filter(b => {
    const matchesCat = activeCategory === "All" || b.category === activeCategory;
    return matchesCat && matchesSearch(b);
  });

  // Premium: full-width banner rows at top
  const premiumBusinesses = filtered.filter(b => b.tier === 'premium');

  // Featured cards within their category: Featured + Premium tiers get a dark spotlight card
  const featuredCardBusinesses = filtered.filter(b => b.featured || b.tier === 'featured' || b.tier === 'premium');
  const featuredByCategory = {};
  featuredCardBusinesses.forEach(b => {
    if (!featuredByCategory[b.category]) featuredByCategory[b.category] = [];
    featuredByCategory[b.category].push(b);
  });

  // ALL businesses also appear as rows within their category (additive — paid tiers get both card + row)
  // Free → compact row | Enhanced/Featured/Premium → expanded EnhancedBusinessRow
  const grouped = {};
  filtered.forEach(b => {
    if (!grouped[b.category]) grouped[b.category] = [];
    grouped[b.category].push(b);
  });

  // All categories alphabetically
  const allCategories = Array.from(new Set([
    ...Object.keys(featuredByCategory),
    ...Object.keys(grouped),
  ])).sort();

  return (
    <section id="businesses" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <FadeIn direction="left">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 32 }}>
            <div>
              <SectionLabel>The Directory</SectionLabel>
              <SectionTitle>Local Businesses</SectionTitle>
            </div>
            <Btn href="/business" variant="outline" small>+ List Your Business (Free)</Btn>
          </div>
        </FadeIn>

        {/* Search bar */}
        <FadeIn delay={60}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 17, color: C.textMuted, pointerEvents: "none", lineHeight: 1 }}>
              ⌕
            </div>
            <input
              type="text"
              placeholder="Search businesses, services, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "14px 20px 14px 46px",
                borderRadius: 8, border: `1.5px solid ${C.sand}`,
                background: C.cream, fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 14, color: C.text, boxSizing: "border-box",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = C.sage}
              onBlur={e => e.target.style.borderColor = C.sand}
            />
          </div>
        </FadeIn>

        {/* Category pills */}
        <FadeIn delay={80}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 52 }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12, fontWeight: 600, letterSpacing: 1,
                  textTransform: "uppercase", padding: "7px 16px", borderRadius: 4,
                  border: `1.5px solid ${activeCategory === cat ? (CAT_COLORS[cat] || C.sage) : C.sand}`,
                  background: activeCategory === cat ? (CAT_COLORS[cat] || C.sage) : "transparent",
                  color: activeCategory === cat ? C.cream : C.textMuted,
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Premium Partners — full-width banner rows, stacked before categories */}
        {premiumBusinesses.length > 0 && (
          <FadeIn delay={100}>
            <div style={{ marginBottom: 56 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: C.sunset, whiteSpace: "nowrap" }}>
                  Premium Partners
                </div>
                <div style={{ flex: 1, height: 1, background: C.sand }} />
              </div>
              {premiumBusinesses.map(b => <PremiumBanner key={b.id} business={b} />)}
            </div>
          </FadeIn>
        )}

        {/* Directory — category sections: featured cards on top, then all businesses as rows */}
        {allCategories.map((category, i) => {
          const catFeatured = featuredByCategory[category] || [];
          const catAll = grouped[category] || [];
          return (
            <FadeIn key={category} delay={120 + i * 10}>
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "0 0 12px 0" }}>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3.5, textTransform: "uppercase", color: CAT_COLORS[category] || C.textMuted, whiteSpace: "nowrap" }}>
                    {category}
                  </div>
                  <div style={{ flex: 1, height: 1, background: C.sand }} />
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>
                    {catAll.length}
                  </div>
                </div>
                {/* Featured spotlight cards — 3 per row, wraps to new rows as needed */}
                {catFeatured.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, marginBottom: 14 }}>
                    {catFeatured.map(b => <FeaturedBusinessCard key={`card-${b.id}`} business={b} />)}
                  </div>
                )}
                {/* All businesses as rows — Enhanced/Featured/Premium get expanded view */}
                {catAll.map(b =>
                  (b.tier === 'enhanced' || b.tier === 'featured' || b.tier === 'premium' || b.featured)
                    ? <EnhancedBusinessRow key={`row-${b.id}`} business={b} />
                    : <BusinessRow key={`row-${b.id}`} business={b} />
                )}
              </div>
            </FadeIn>
          );
        })}

        {/* No results */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text, marginBottom: 8 }}>
              No results for "{search}"
            </div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Try a different search or browse all categories</div>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, padding: "9px 22px", borderRadius: 4, border: `1.5px solid ${C.sand}`, background: "transparent", color: C.textMuted, cursor: "pointer" }}
            >
              Clear search
            </button>
          </div>
        )}

        {/* Upgrade CTA */}
        <FadeIn delay={200}>
          <div style={{
            marginTop: 64,
            background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
            borderRadius: 12, padding: "40px",
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 24,
          }}>
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 10 }}>
                Get Noticed
              </div>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", color: C.cream, margin: "0 0 8px 0", fontWeight: 400 }}>
                Upgrade to a Featured Listing
              </h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 400, lineHeight: 1.7 }}>
                Top-of-directory placement, newsletter inclusion, and a business spotlight video from Holly & The Yeti.
              </p>
            </div>
            <Btn href="/business" variant="sunset">Upgrade Your Listing</Btn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// Featured business — compact dark card, designed for 3-per-row grid layout
function FeaturedBusinessCard({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  const tilt = useCardTilt(3);
  return (
    <div
      ref={tilt.ref}
      onMouseEnter={tilt.onMouseEnter}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className="card-tilt featured-card-glow featured-card-pulse"
      style={{
        background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`,
        borderRadius: 12, padding: "18px 20px",
        border: "1px solid rgba(255,255,255,0.07)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      {/* Shimmer overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 12, pointerEvents: "none",
        background: `linear-gradient(110deg, transparent 30%, ${C.sunset}08 50%, transparent 70%)`,
        backgroundSize: "200% 100%", animation: "shimmer 4s ease-in-out infinite",
      }} />
      {/* Header: logo + name + badge */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 8, flexShrink: 0, overflow: "hidden",
          background: "rgba(255,255,255,0.06)",
          border: `1.5px dashed ${business.logo ? "transparent" : "rgba(255,255,255,0.18)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {business.logo
            ? <img src={business.logo} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", lineHeight: 1.4 }}>Add<br/>Logo</span>
          }
        </div>
        <div>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 400, color: C.cream, margin: 0, lineHeight: 1.3 }}>
            {business.name}
          </h3>
        </div>
      </div>
      {/* Description */}
      {business.description && (
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0, flex: 1, position: "relative", zIndex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {business.description}
        </p>
      )}
      {/* Footer: phone + visit */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6, position: "relative", zIndex: 1 }}>
        {business.phone && (
          <a href={`tel:${business.phone}`} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "'Libre Franklin', sans-serif" }}>{business.phone}</a>
        )}
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, textDecoration: "none" }}>Visit →</a>
        )}
      </div>
    </div>
  );
}

// Premium partner — full-width dark banner (stacked at top of directory)
function PremiumBanner({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  return (
    <div className="premium-banner-glow" style={{
      background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
      borderRadius: 12, padding: "28px 32px",
      display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
      marginBottom: 16, border: `1px solid rgba(255,255,255,0.07)`,
    }}>
      {/* Logo */}
      <div style={{ width: 110, height: 110, borderRadius: 14, flexShrink: 0, overflow: "hidden", background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.1)" }}>
        {business.logo ? (
          <img src={business.logo} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 30, color: "rgba(255,255,255,0.2)" }}>{business.name[0]}</span>
        )}
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>{business.category}</span>
        </div>
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 8 }}>{business.name}</div>
        {business.description && (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{business.description}</div>
        )}
        {business.address && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8, fontStyle: "italic" }}>{business.address}</div>}
      </div>
      {/* CTAs */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        {business.website && (
          <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.cream, background: C.sunset, padding: "10px 22px", borderRadius: 6, textDecoration: "none", whiteSpace: "nowrap" }}>
            Visit Website
          </a>
        )}
        {business.phone && (
          <a href={`tel:${business.phone}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{business.phone}</a>
        )}
      </div>
    </div>
  );
}

// Enhanced business row — visually distinct from Free row with persistent border, tint, and icon badge
function EnhancedBusinessRow({ business }) {
  const [expanded, setExpanded] = useState(false);
  const color = CAT_COLORS[business.category] || C.sage;
  const isPremium = business.tier === 'premium';
  const isFeatured = business.tier === 'featured';
  const dotColor = isPremium ? C.sunset : color;

  return (
    <div style={{ borderBottom: `1px solid ${C.sand}` }}>
      {/* Collapsed header — persistent left border + tint to distinguish from free listings */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "grid",
          gridTemplateColumns: "10px 1fr auto",
          gap: "0 20px",
          alignItems: "center",
          padding: "15px 10px",
          borderLeft: `3px solid ${color}55`,
          marginLeft: -13,
          paddingLeft: 10,
          background: `${color}06`,
          transition: "all 0.18s",
          borderRadius: expanded ? "0 4px 0 0" : "0 4px 4px 0",
          cursor: "pointer",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.background = `${color}12`; }}
        onMouseLeave={e => { e.currentTarget.style.borderLeftColor = `${color}55`; e.currentTarget.style.background = `${color}06`; }}
      >
        {/* Category dot — all enhanced+ tiers get the pulse */}
        <div
          className="listing-dot-pulse"
          style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }}
        />
        {/* Name + icon badge + phone + address */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text, fontWeight: 400 }}>{business.name}</span>
            {business.phone && (
              <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap" }}>{business.phone}</span>
            )}
          </div>
          {business.address && (
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", opacity: 0.7 }}>{business.address}</span>
          )}
        </div>
        {/* Expand toggle */}
        <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap" }}>
          {expanded ? "Less ↑" : "More ↓"}
        </span>
      </div>

      {/* Expanded detail panel — animated ease-out */}
      <div style={{ maxHeight: expanded ? "400px" : 0, overflow: "hidden", transition: "max-height 0.5s ease-out" }}>
        <div style={{
          padding: "14px 10px 16px 27px",
          background: `${color}05`,
          borderLeft: `3px solid ${color}30`,
          marginLeft: -13,
          paddingLeft: 27,
          borderRadius: "0 0 4px 0",
        }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            {business.logo && (
              <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: `${color}12` }}>
                <img src={business.logo} alt={business.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {business.description && (
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65, margin: "0 0 10px 0", fontFamily: "'Libre Franklin', sans-serif" }}>{business.description}</p>
              )}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sage, textDecoration: "none" }}>Visit Website →</a>
                )}
                {business.email && (
                  <a href={`mailto:${business.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: C.textMuted, textDecoration: "none" }}>{business.email}</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Regular business — compact list row
function BusinessRow({ business }) {
  const color = CAT_COLORS[business.category] || C.sage;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "10px 1fr auto",
        gap: "0 20px",
        alignItems: "center",
        padding: "15px 10px",
        borderBottom: `1px solid ${C.sand}`,
        borderLeft: "3px solid transparent",
        marginLeft: -13,
        paddingLeft: 10,
        transition: "all 0.18s",
        borderRadius: "0 4px 4px 0",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderLeftColor = color; e.currentTarget.style.background = `${color}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderLeftColor = "transparent"; e.currentTarget.style.background = "transparent"; }}
    >
      {/* Category dot */}
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />

      {/* Name + phone + address */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text, fontWeight: 400 }}>
            {business.name}
          </span>
          {business.phone && (
            <span style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap" }}>
              {business.phone}
            </span>
          )}
        </div>
        {business.address && (
          <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", opacity: 0.7 }}>
            {business.address}
          </span>
        )}
      </div>

      {/* Free tier — no website link. Upgrade to Enhanced+ to unlock. */}
      <a href="#listing-tiers" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, color: C.driftwood, textDecoration: "none", whiteSpace: "nowrap", opacity: 0.65 }}>
        Upgrade →
      </a>
    </div>
  );
}
function LivingSection() {
  return (
    <section id="living" style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Relocate & Stay</SectionLabel>
          <SectionTitle>Your Lake Life Starts Here</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, maxWidth: 560, margin: "0 0 56px 0", lineHeight: 1.75 }}>
            Whether you're planning a weekend escape or imagining a new forever address — Manitou Beach has a way of making visitors into neighbors.
          </p>
        </FadeIn>

        {/* Block A — "Picture Yourself Here" hero */}
        <FadeIn direction="scale">
          <div style={{
            background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
            borderRadius: 16, padding: "56px 48px", marginBottom: 28,
            position: "relative", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: `${C.sage}08`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: `${C.lakeBlue}06`, pointerEvents: "none" }} />
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.sunsetLight, marginBottom: 10, letterSpacing: 0.5 }}>
              Devils Lake is calling
            </div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(26px, 4vw, 42px)", color: C.cream, margin: "0 0 28px 0", fontWeight: 400, lineHeight: 1.15 }}>
              Picture Yourself Here
            </h3>
            <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600 }}>
              <a href="/#holly" style={{
                display: "block", textDecoration: "none",
                background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "20px 22px",
                transition: "all 0.22s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = `${C.sunsetLight}40`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, marginBottom: 6 }}>Buying or Selling?</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 10 }}>Holly Griewahn at Foundation Realty knows this lake like the back of her hand.</div>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight }}>Talk to Holly →</span>
              </a>
              <a href="#businesses" style={{
                display: "block", textDecoration: "none",
                background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "20px 22px",
                transition: "all 0.22s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = `${C.lakeBlue}40`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
              >
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, marginBottom: 6 }}>Just Visiting?</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 10 }}>Lakefront cottages, village apartments, and the kind of view that makes you forget what day it is.</div>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.lakeBlue }}>Browse Stays →</span>
              </a>
            </div>
          </div>
        </FadeIn>

        {/* Block B — Short-Term Rentals */}
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28, alignItems: "center" }}>
          <FadeIn direction="left">
            <div style={{ padding: "8px 0" }}>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 2.5vw, 28px)", color: C.text, margin: "0 0 16px 0", fontWeight: 400 }}>
                Short-Term Rentals
              </h3>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, margin: "0 0 20px 0" }}>
                Lakefront cottages, village apartments, and the kind of view that makes you forget what day it is. Whether you're here for a weekend or a whole season — we'll help you find your spot.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <Btn href="#businesses" variant="outline" small>Browse Stays →</Btn>
                <span style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.sunset }}>
                  Full Rentals Directory — Coming Soon
                </span>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={120} direction="right">
            <div style={{
              background: `linear-gradient(145deg, ${C.lakeBlue}12, ${C.sage}10)`,
              border: `1px solid ${C.sand}`,
              borderRadius: 16, padding: "36px 32px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, filter: "grayscale(0.2)" }}>🏡</div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.lakeDark, marginBottom: 8 }}>
                "We came for the weekend..."
              </div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                Inns · Cottages · Campgrounds · Airbnb
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Block C — Year-Round Life (mirrored) */}
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 28, alignItems: "center" }}>
          <FadeIn direction="left">
            <div style={{
              background: `linear-gradient(145deg, ${C.sage}10, ${C.dusk}08)`,
              border: `1px solid ${C.sand}`,
              borderRadius: 16, padding: "36px 32px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, filter: "grayscale(0.2)" }}>❄️</div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sageDark, marginBottom: 8 }}>
                "Not just a summer thing."
              </div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                Ice fishing · Quiet winters · Year-round community
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={120} direction="right">
            <div style={{ padding: "8px 0" }}>
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 2.5vw, 28px)", color: C.text, margin: "0 0 16px 0", fontWeight: 400 }}>
                Year-Round Life
              </h3>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.8, margin: "0 0 20px 0" }}>
                Manitou Beach isn't a summer fling. Ice fishing on frozen Devils Lake. Quiet mornings with coffee and fog on the water. Neighbors who wave whether it's July or January. This is year-round life.
              </p>
              <Btn href="/devils-lake" variant="outline" small>Explore Devils Lake →</Btn>
            </div>
          </FadeIn>
        </div>

        {/* Block D — Lake Access Magazine (co-branded dark strip) */}
        <FadeIn>
          <div style={{
            background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 50%, ${C.dusk} 100%)`,
            borderRadius: 16, padding: "48px 40px", textAlign: "center",
            position: "relative", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, borderRadius: "50%", background: `${C.lakeBlue}06`, pointerEvents: "none" }} />
            <SectionLabel light>Media Partner</SectionLabel>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3vw, 34px)", color: C.cream, margin: "12px 0 16px 0", fontWeight: 400 }}>
              Lake Access Magazine
            </h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 520, margin: "0 auto 24px" }}>
              Covering lake communities across Michigan. Manitou Beach is proud to be part of the story.
            </p>
            <div style={{
              display: "inline-block", background: `${C.sunset}15`, border: `1px solid ${C.sunset}35`,
              borderRadius: 50, padding: "8px 24px", marginBottom: 24,
            }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.sunsetLight }}>
                Use code HOLLY or YETI for 10% off your subscription
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Btn href="https://lake-access.com/" variant="sunset" target="_blank" rel="noopener noreferrer">Visit Lake Access Magazine</Btn>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", margin: 0 }}>
              Watch for upcoming Yeti-produced video features for Lake Access advertising clients
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
function AboutSection() {
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', category: 'Question', message: '', _hp: '' });
  const [contactStatus, setContactStatus] = useState('idle'); // idle | sending | success | error

  useEffect(() => {
    if (!showContact) return;
    const handleEsc = (e) => { if (e.key === 'Escape') setShowContact(false); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showContact]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (contactStatus === 'sending') return;
    setContactStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error('Failed');
      setContactStatus('success');
    } catch {
      setContactStatus('error');
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box", padding: "12px 14px",
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 14,
    background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.15)`,
    borderRadius: 8, color: C.cream, outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <section id="about" style={{ background: C.warmWhite, padding: "100px 24px", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 30% 20%, ${C.sage}06, transparent)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <div className="mobile-col-1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 6vw, 80px)" }}>
          <FadeIn>
            <SectionLabel>The Story</SectionLabel>
            <SectionTitle>About This Platform</SectionTitle>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 20 }}>
              Devils Lake sits in the heart of Michigan's Irish Hills — 1,330 acres of water, 600+ boat slips, and a community that's been coming back every summer since the 1870s. Locals call it "the party lake," and anyone who's spent a Saturday at the Yacht Club knows why.
            </p>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 20 }}>
              This platform is that home. A directory of local businesses, a calendar for what's actually happening this week, and The Manitou Dispatch — a newsletter keeping the lake connected year-round. Built by people who live here, for everyone who loves this place.
            </p>

            {/* Handwritten quote */}
            <div style={{ padding: "4px 0 4px 20px", borderLeft: `3px solid ${C.sunset}30`, margin: "8px 0 24px 0" }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunset, fontStyle: "italic" }}>
                "The kind of place where your neighbor brings you fish they just caught."
              </span>
            </div>

            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.85, marginBottom: 32 }}>
              (And yes — we're fully aware the name "Manitou Beach" is an ironic masterpiece given that there's no actual beach. We've all made peace with it.)
            </p>

            {/* Community stats */}
            <div style={{ display: "flex", gap: 0, marginBottom: 36, flexWrap: "wrap" }}>
              {[
                { num: "1,330", label: "acres of lake" },
                { num: "150+", label: "years of community" },
                { num: "600+", label: "boat slips" },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: "1 1 80px", textAlign: "center",
                  borderLeft: i > 0 ? `1px solid ${C.sand}` : "none",
                  padding: "8px 12px",
                }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 4vw, 28px)", color: C.sage, fontWeight: 700, lineHeight: 1.1 }}>{s.num}</div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: C.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Btn onClick={() => setShowContact(true)} variant="dark">Get in Touch</Btn>
          </FadeIn>

          <FadeIn delay={100}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{
                background: C.cream, borderTop: `3px solid ${C.sage}`,
                border: `1px solid ${C.sand}`, borderTopWidth: 3, borderTopColor: C.sage,
                borderRadius: 10, padding: "28px",
              }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 10, fontWeight: 700 }}>
                  Holly Griewahn
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.sage, marginBottom: 12, fontWeight: 600 }}>
                  Foundation Realty · Manitou Beach
                </div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                  Local real estate expert and co-host of Holly & The Yeti. If you're buying or selling on Devils Lake, she's the person with the keys.
                </p>
                <a href="#businesses" style={{ fontSize: 12, fontWeight: 700, color: C.sage, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif" }}>
                  View Listings →
                </a>
              </div>

              <div style={{
                background: C.cream, borderTop: `3px solid ${C.lakeBlue}`,
                border: `1px solid ${C.sand}`, borderTopWidth: 3, borderTopColor: C.lakeBlue,
                borderRadius: 10, padding: "28px",
              }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 10, fontWeight: 700 }}>
                  Lake Access Magazine
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.lakeBlue, marginBottom: 12, fontWeight: 600 }}>
                  Regional Media Partner
                </div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                  Covering lake communities across Michigan. Manitou Beach is one part of a much bigger lake life story.
                </p>
                <a href="https://lake-access.com/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: C.lakeBlue, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif" }}>
                  Visit Lake Access →
                </a>
              </div>

              {/* Dispatch card */}
              <div style={{
                background: C.cream, borderTop: `3px solid ${C.sunset}`,
                border: `1px solid ${C.sand}`, borderTopWidth: 3, borderTopColor: C.sunset,
                borderRadius: 10, padding: "28px",
              }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text, marginBottom: 10, fontWeight: 700 }}>
                  The Manitou Dispatch
                </div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.sunset, marginBottom: 12, fontWeight: 600 }}>
                  Community Newsletter
                </div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: "0 0 16px 0" }}>
                  Lake news, events, and stories delivered to your inbox. The dispatch that keeps this community connected.
                </p>
                <a href="/dispatch" style={{ fontSize: 12, fontWeight: 700, color: C.sunset, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Libre Franklin', sans-serif" }}>
                  Read the Dispatch →
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowContact(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div style={{
            background: C.dusk, borderRadius: 16, padding: "40px 36px",
            maxWidth: 480, width: "100%", position: "relative",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <button onClick={() => setShowContact(false)} style={{
              position: "absolute", top: 16, right: 16, background: "none", border: "none",
              color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", padding: 4,
            }} aria-label="Close">×</button>

            {contactStatus === 'success' ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, marginBottom: 12 }}>
                  Message Sent
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  Thanks for reaching out — we'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit}>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, margin: "0 0 8px 0" }}>
                  Get in Touch
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 28px 0", lineHeight: 1.5 }}>
                  Question, feedback, partnership, or just want to say hey.
                </p>

                {/* Honeypot */}
                <div style={{ position: "absolute", left: -9999, opacity: 0 }}>
                  <input name="_hp" tabIndex={-1} autoComplete="off" value={contactForm._hp} onChange={e => setContactForm(f => ({ ...f, _hp: e.target.value }))} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>Name *</label>
                    <input required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = C.sage}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>Email *</label>
                    <input required type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = C.sage}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>Category</label>
                    <select value={contactForm.category} onChange={e => setContactForm(f => ({ ...f, category: e.target.value }))}
                      style={{ ...inputStyle, appearance: "none", cursor: "pointer", background: C.dusk, color: C.cream }}
                    >
                      <option value="Question" style={{ background: C.dusk, color: C.cream }}>Question</option>
                      <option value="Feedback" style={{ background: C.dusk, color: C.cream }}>Feedback</option>
                      <option value="Bug Report" style={{ background: C.dusk, color: C.cream }}>Bug Report</option>
                      <option value="Partnership" style={{ background: C.dusk, color: C.cream }}>Partnership Inquiry</option>
                      <option value="Other" style={{ background: C.dusk, color: C.cream }}>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>Message *</label>
                    <textarea required rows={4} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={e => e.target.style.borderColor = C.sage}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                    />
                  </div>
                </div>

                {contactStatus === 'error' && (
                  <p style={{ fontSize: 13, color: "#E87461", marginTop: 12 }}>{yeti.oops()}</p>
                )}

                <div style={{ marginTop: 24 }}>
                  <Btn type="submit" variant="sunset" style={{ width: "100%" }}>
                    {contactStatus === 'sending' ? 'Sending...' : 'Send Message'}
                  </Btn>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
function LiveFoodTruckStrip() {
  const [liveTrucks, setLiveTrucks] = useState([]);
  useEffect(() => {
    fetch('/api/food-trucks')
      .then(r => r.json())
      .then(data => {
        const now = Date.now();
        const live = (data.trucks || []).filter(t =>
          t.lastCheckin && (now - new Date(t.lastCheckin).getTime()) < 12 * 60 * 60 * 1000
        );
        setLiveTrucks(live);
      })
      .catch(() => {});
  }, []);

  if (liveTrucks.length === 0) return null;

  return (
    <div style={{ background: C.sunset, padding: "9px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.9)", animation: "dot-breathe 2s ease-in-out infinite", color: "#fff" }} />
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>Live nearby</span>
        </div>
        <span style={{ color: "#fff", fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 500 }}>
          {liveTrucks.map(t => t.name).join(' · ')}
        </span>
        <a href="/food-trucks" style={{ marginLeft: "auto", color: "#fff", fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textDecoration: "none", opacity: 0.85, whiteSpace: "nowrap", flexShrink: 0 }}>
          Find them →
        </a>
      </div>
    </div>
  );
}

// 🏠  HOME PAGE
// ============================================================
function HomePage() {
  const [activeSection, setActiveSection] = useState("home");

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection={activeSection} scrollTo={scrollTo} />
      <Hero scrollTo={scrollTo} />
      <LiveFoodTruckStrip />
      <EventTicker />
      <NewsletterBar />
      <WaveDivider topColor={C.dusk} bottomColor={C.dusk} />
      <HappeningSection />
      <PromoBanner page="Home" />
      <WaveDivider topColor={C.dusk} bottomColor={C.cream} />
      <ExploreSection />
      <DispatchPreviewSection />
      <NewsletterInline />
      <BusinessDirectory />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.night} />
      <HollyYetiSection />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <LivingSection />
      <AboutSection />
      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="home" />
      <Footer scrollTo={scrollTo} />
    </div>
  );
}

export default HomePage;
