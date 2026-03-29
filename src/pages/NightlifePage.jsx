import React, { useState, useEffect } from 'react';
import { FadeIn, SectionTitle, SectionLabel, Btn, ShareBar, WaveDivider, ScrollProgress, PageSponsorBanner } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import formatPhone from '../utils/formatPhone';

// ============================================================
// 🌙  NIGHTLIFE PAGE
// ============================================================

function formatDate(dateStr) {
  if (!dateStr || dateStr.includes('TBA')) return dateStr || '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ============================================================
// 🌙  HERO
// ============================================================
function NightlifeHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/explore-nightlife.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      padding: "180px 24px 140px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(170deg, rgba(10,18,24,0.88) 0%, rgba(10,18,24,0.55) 50%, rgba(10,18,24,0.95) 100%)",
      }} />

      {/* Decorative ambient word */}
      <div style={{
        position: "absolute",
        right: -10,
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: "'Libre Baskerville', serif",
        fontSize: "clamp(140px, 22vw, 320px)",
        fontWeight: 700,
        color: "rgba(255,255,255,0.04)",
        lineHeight: 1,
        userSelect: "none",
        letterSpacing: -12,
        pointerEvents: "none",
      }}>
        TONIGHT
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11, letterSpacing: 5, textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)", marginBottom: 28,
          }}>
            Devils Lake · Manitou Beach · Michigan
          </div>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: "clamp(56px, 10vw, 120px)",
            fontWeight: 400,
            color: C.cream,
            lineHeight: 0.95,
            margin: "0 0 20px 0",
            letterSpacing: -2,
          }}>
            The Night<br />Is Young.
          </h1>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(20px, 3vw, 30px)",
            color: C.sunsetLight,
            marginBottom: 48,
          }}>
            Devils Lake doesn't sleep.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Btn href="/" variant="outlineLight">← Back to Home</Btn>
          </div>
          <ShareBar title="Nightlife near Devils Lake — Manitou Beach, Michigan" />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 🎶  EVENT CARD
// ============================================================
function NightlifeEventCard({ event }) {
  const catColors = {
    "Live Music": C.sunset,
    "Food & Social": "#8B5E3C",
  };
  const catColor = catColors[event.category] || C.sunset;
  const isFree = event.cost && event.cost.toLowerCase() === 'free';
  const hasCost = event.cost && event.cost.trim() !== '';

  const card = (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
        cursor: event.eventUrl ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,132,90,0.3)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image area */}
      <div style={{ position: "relative", height: 180, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(135deg, rgba(212,132,90,0.2) 0%, rgba(26,40,48,0.8) 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48,
          }}>
            🎶
          </div>
        )}
        {/* Image bottom fade */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(26,40,48,1) 0%, transparent 60%)",
        }} />
        {/* Date chip */}
        <div style={{
          position: "absolute", bottom: 12, left: 14,
          fontFamily: "'Caveat', cursive",
          fontSize: 17, color: C.sunsetLight,
        }}>
          {formatDate(event.date)}
        </div>
        {/* Cost badge */}
        {hasCost && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            background: isFree ? "rgba(122,142,114,0.9)" : "rgba(212,132,90,0.9)",
            color: "#fff",
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "4px 10px", borderRadius: 20,
          }}>
            {event.cost}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Category badge */}
        <div style={{
          display: "inline-block",
          background: `rgba(${catColor === C.sunset ? '212,132,90' : '139,94,60'},0.2)`,
          border: `1px solid rgba(${catColor === C.sunset ? '212,132,90' : '139,94,60'},0.4)`,
          color: catColor,
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 9, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase",
          padding: "4px 10px", borderRadius: 20,
          alignSelf: "flex-start",
        }}>
          {event.category}
        </div>

        <div style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 19, fontWeight: 400,
          color: C.cream, lineHeight: 1.3,
        }}>
          {event.name}
        </div>

        <div style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 12, color: "rgba(255,255,255,0.45)",
          display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap",
        }}>
          {event.time && <span>{event.time}{event.timeEnd ? ` – ${event.timeEnd}` : ''}</span>}
          {event.time && event.location && <span style={{ opacity: 0.4 }}>·</span>}
          {event.location && <span>{event.location}</span>}
        </div>

        {/* Tickets button */}
        {event.ticketsEnabled && event.eventUrl && (
          <a
            href={event.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              marginTop: "auto",
              display: "inline-block",
              padding: "7px 16px",
              background: C.sunset,
              color: "#fff",
              borderRadius: 20,
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              textTransform: "uppercase",
              textDecoration: "none",
              alignSelf: "flex-start",
              transition: "background 0.2s",
            }}
          >
            Get Tickets →
          </a>
        )}
      </div>
    </div>
  );

  if (event.eventUrl && !event.ticketsEnabled) {
    return (
      <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {card}
      </a>
    );
  }
  return card;
}

// ============================================================
// 📅  THIS WEEKEND SECTION
// ============================================================
function ThisWeekendSection({ events }) {
  return (
    <section style={{ background: C.night, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>This Weekend</SectionLabel>
          <SectionTitle light>What's On Tonight</SectionTitle>
          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.4)",
            lineHeight: 1.8, maxWidth: 480, margin: "0 0 56px 0",
          }}>
            Live music, pop-up dinners, and whatever else is happening on the lake.
          </p>
        </FadeIn>

        {events.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))",
            gap: 20,
          }}>
            {events.map(ev => (
              <FadeIn key={ev.id}>
                <NightlifeEventCard event={ev} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "56px 40px",
              textAlign: "center",
              maxWidth: 560,
              margin: "0 auto",
            }}>
              {/* Amber accent line */}
              <div style={{
                width: 48, height: 2,
                background: C.sunset,
                margin: "0 auto 28px",
                borderRadius: 2,
              }} />
              <div style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 24, color: C.cream,
                margin: "0 0 10px 0",
              }}>
                Nothing on the calendar yet.
              </div>
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 20, color: C.sunsetLight,
                margin: "0 0 28px 0",
              }}>
                But the bars are always open.
              </div>
              <a
                href="#venues"
                onClick={e => { e.preventDefault(); document.getElementById('venues')?.scrollIntoView({ behavior: 'smooth' }); }}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 13, color: C.sunsetLight,
                  textDecoration: "none",
                  borderBottom: `1px solid rgba(232,168,124,0.4)`,
                  paddingBottom: 2,
                }}
              >
                → See the venues below
              </a>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

// ============================================================
// 🍺  VENUE CARD
// ============================================================
function VenueCard({ venue }) {
  const monogram = venue.name ? venue.name.charAt(0).toUpperCase() : '?';
  const displayCategory = venue.category === 'Food & Drink' ? 'Bar & Restaurant' : venue.category;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        gap: 18,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(212,132,90,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Logo / Monogram */}
      <div style={{ flexShrink: 0 }}>
        {venue.logo ? (
          <img
            src={venue.logo}
            alt={venue.name}
            style={{
              width: 64, height: 64,
              borderRadius: 10,
              objectFit: "contain",
              background: "rgba(255,255,255,0.06)",
            }}
          />
        ) : (
          <div style={{
            width: 64, height: 64,
            borderRadius: 10,
            background: "rgba(212,132,90,0.15)",
            border: "1px solid rgba(212,132,90,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 26, fontWeight: 700,
            color: C.sunset,
          }}>
            {monogram}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Tier badge + category */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <div style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: 2,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}>
            {displayCategory}
          </div>
          {(venue.tier === 'featured' || venue.tier === 'premium') && (
            <div style={{
              background: "rgba(212,132,90,0.2)",
              border: "1px solid rgba(212,132,90,0.35)",
              color: C.sunsetLight,
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 8, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase",
              padding: "2px 8px", borderRadius: 20,
            }}>
              Featured
            </div>
          )}
        </div>

        <div style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 18, color: C.cream,
          marginBottom: 6,
        }}>
          {venue.name}
        </div>

        {venue.description && (
          <div style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 13, color: "rgba(255,255,255,0.5)",
            lineHeight: 1.65,
            marginBottom: 10,
          }}>
            {venue.description}
          </div>
        )}

        {/* Address + phone */}
        <div style={{ marginBottom: 14 }}>
          {venue.address && (
            <div style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11, color: "rgba(255,255,255,0.35)",
              marginBottom: 3,
            }}>
              📍 {venue.address}
            </div>
          )}
          {venue.phone && (
            <div style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11, color: "rgba(255,255,255,0.35)",
            }}>
              📞 <a
                href={`tel:${venue.phone.replace(/\D/g, '')}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {formatPhone(venue.phone)}
              </a>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {venue.address && (
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(venue.address)}`, '_blank')}
              style={{
                padding: "10px 18px",
                border: `1px solid rgba(212,132,90,0.5)`,
                background: "transparent",
                color: C.sunsetLight,
                borderRadius: 20,
                fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                cursor: "pointer",
                transition: "all 0.2s",
                minHeight: 44,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,132,90,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Get Directions ↗
            </button>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 11, fontWeight: 600,
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                paddingBottom: 1,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = C.cream; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            >
              Website →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 🍺  VENUES SECTION
// ============================================================
const VENUE_TABS = ['All', 'Bars & Restaurants', 'Breweries & Wineries'];

function VenuesSection({ venues }) {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? venues
    : venues.filter(v =>
        activeTab === 'Bars & Restaurants'
          ? v.category === 'Food & Drink'
          : v.category === 'Breweries & Wineries'
      );

  return (
    <section id="venues" style={{ background: C.dusk, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>Bars · Restaurants · Breweries</SectionLabel>
          <SectionTitle light>The Venues</SectionTitle>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(18px, 2.5vw, 24px)",
            color: C.sunsetLight,
            fontStyle: "italic",
            margin: "0 0 40px 0",
          }}>
            Open year-round. Dock-side state of mind.
          </div>

          {/* Tab filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 48 }}>
            {VENUE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 24,
                  border: activeTab === tab
                    ? "none"
                    : "1.5px solid rgba(255,255,255,0.15)",
                  background: activeTab === tab ? C.sunset : "transparent",
                  color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.45)",
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </FadeIn>

        {filtered.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))",
            gap: 16,
          }}>
            {filtered.map((venue, i) => (
              <FadeIn key={venue.id || i}>
                <VenueCard venue={venue} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div style={{
              textAlign: "center", padding: "40px 0",
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.3)",
            }}>
              No venues listed yet.{" "}
              <a href="/business" style={{ color: C.sunsetLight, textDecoration: "none" }}>
                Add yours for free →
              </a>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

// ============================================================
// 📣  BOTTOM CTA
// ============================================================
function NightlifeCTA() {
  return (
    <section style={{ background: C.night, padding: "72px 24px", textAlign: "center" }}>
      <FadeIn>
        <SectionLabel light>Grow the List</SectionLabel>
        <h3 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: "clamp(24px, 4vw, 38px)",
          fontWeight: 400, color: C.cream,
          margin: "0 0 12px 0",
        }}>
          Know a place we're missing?
        </h3>
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.4)",
          margin: "0 0 32px 0", lineHeight: 1.75,
        }}>
          The list is a work in progress — add your bar, restaurant, or brewery for free.
        </p>
        <Btn href="/business" variant="sunset">Add Your Venue →</Btn>
      </FadeIn>
    </section>
  );
}

// ============================================================
// 🌙  PAGE ROOT
// ============================================================
export default function NightlifePage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(r => r.json()),
      fetch('/api/businesses').then(r => r.json()),
    ]).then(([evData, bizData]) => {
      // Filter events: Live Music + Food & Social, next 7 days
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() + 7);
      const nightlifeCats = ['Live Music', 'Food & Social'];

      const filtered = (evData.events || [])
        .filter(ev => {
          if (!nightlifeCats.includes(ev.category)) return false;
          if (!ev.date || ev.date.includes('TBA')) return false;
          const d = new Date(ev.date + 'T00:00:00');
          return d >= today && d <= cutoff;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setEvents(filtered);

      // Merge all tiers, filter by nightlife categories, preserve tier order
      const allBiz = [
        ...(bizData.premium || []),
        ...(bizData.featured || []),
        ...(bizData.enhanced || []),
        ...(bizData.free || []),
      ].filter(b => ['Food & Drink', 'Breweries & Wineries'].includes(b.category));

      setVenues(allBiz);
    }).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.night, color: C.cream, overflowX: "hidden" }}>
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="nightlife" scrollTo={subScrollTo} isSubPage={true} />
      <NightlifeHero />
      <ThisWeekendSection events={events} />
      <VenuesSection venues={venues} />
      <NightlifeCTA />
      <PageSponsorBanner pageName="nightlife" />
      <Footer />
    </div>
  );
}
