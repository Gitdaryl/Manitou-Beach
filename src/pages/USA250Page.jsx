import React, { useState, useEffect } from "react";
import { Footer, GlobalStyles, Navbar, NewsletterInline } from "../components/Layout";
import { FadeIn, SectionLabel, SectionTitle, ScrollProgress, WaveDivider, DiagonalDivider, ShareBar } from "../components/Shared";
import { C, USA250_VIDEO_URL } from "../data/config";
import SEOHead from '../components/SEOHead';

// ============================================================
//  AMERICA 250 - DEVILS & ROUND LAKE CELEBRATIONS (/america-250)
// ============================================================

const FW = {
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  navy: "#0D1B3E",
  red: "#B22234",
};

const COMMITTEE = [
  { name: "Craig Gabel",       role: "Chair"     },
  { name: "Byrne Stapleton",   role: "Treasurer" },
  { name: "Chris Sherman",     role: "Committee" },
  { name: "Brent Hopson",      role: "Committee" },
  { name: "Troy Langenderfer", role: "Committee" },
  { name: "Mike Clark",        role: "Founder"   },
];

// Add events here in chronological order as they're confirmed
const ACTIVITIES = [
  {
    date: "July 3rd",
    time: "10:00 AM",
    title: "DLYC Boat Parade",
    body: "Meet at the Devils Lake Yacht Club and parade out onto the water. This year there's a special touch - the DLYC dock will fly American flags only. They normally display flags from around the world, but for the 250th it's all stars and stripes.",
    location: "Devils Lake Yacht Club",
    icon: "⚓",
  },
  {
    date: "July 3rd",
    time: "10:00 AM",
    title: "Round Lake Boat Parade",
    body: "Meet at the sandbar and join the Round Lake parade. Two lakes, two parades, one celebration.",
    location: "The Sandbar, Round Lake",
    icon: "🚤",
  },
  {
    date: "July 3rd",
    time: "10:00 PM",
    title: "Fireworks",
    body: "17 launch barges across both lakes. 2,500 shells. Every dock has a front-row seat. America's 250th - the biggest Fourth of our lifetime.",
    location: "Devils & Round Lake",
    icon: "🎆",
    featured: true,
  },
];

// ─── Hero ────────────────────────────────────────────────────────────────────

function FireworksHero() {
  const [loaded, setLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    setTimeout(() => setLoaded(true), 80);
    // Countdown to Friday July 3, 2026 10:00 PM
    const target = new Date("2026-07-03T22:00:00");
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      setTimeLeft({
        days:  Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins:  Math.floor((diff % 3600000)  / 60000),
        secs:  Math.floor((diff % 60000)    / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = n => String(n).padStart(2, "0");

  return (
    <section style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      background: `linear-gradient(160deg, ${FW.navy} 0%, #0A1218 40%, #16091e 100%)`,
    }}>
      {USA250_VIDEO_URL && (
        <video autoPlay muted loop playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          src={USA250_VIDEO_URL}
        />
      )}

      {USA250_VIDEO_URL && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(13,27,62,0.88) 100%)",
        }} />
      )}

      {!USA250_VIDEO_URL && (
        <>
          <style>{`
            @keyframes fw-twinkle {
              0%,100% { opacity:.12; transform:scale(1) }
              50%      { opacity:.9;  transform:scale(1.5) }
            }
            @keyframes fw-burst {
              0%   { opacity:0; transform:scale(0.2) }
              25%  { opacity:1 }
              100% { opacity:0; transform:scale(3) }
            }
            .fw-spark {
              position:absolute; border-radius:50%;
              animation: fw-twinkle var(--d,2.5s) ease-in-out infinite;
              animation-delay: var(--dl,0s);
              pointer-events: none;
            }
            .fw-ring {
              position:absolute; border-radius:50%;
              animation: fw-burst var(--d,4s) ease-out infinite;
              animation-delay: var(--dl,0s);
              pointer-events:none;
            }
          `}</style>

          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="fw-spark" style={{
              width:  i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
              height: i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
              left: `${Math.sin(i * 137.5) * 48 + 50}%`,
              top:  `${Math.cos(i * 97.3)  * 48 + 50}%`,
              background: i % 5 === 0 ? FW.red : i % 7 === 0 ? "#ffffff" : FW.gold,
              "--d":  `${2 + (i % 5) * 0.6}s`,
              "--dl": `${(i % 9) * 0.35}s`,
              zIndex: 1,
            }} />
          ))}

          {[
            { l: "18%", t: "28%", sz: 130, c: `${FW.gold}18`,    d: "4s",   dl: "0.4s" },
            { l: "76%", t: "22%", sz: 90,  c: `${FW.red}15`,     d: "5.2s", dl: "1.9s" },
            { l: "60%", t: "68%", sz: 110, c: `${FW.goldLight}12`,d: "4.8s", dl: "3.1s" },
            { l: "35%", t: "75%", sz: 70,  c: `#ffffff0e`,        d: "3.5s", dl: "2.2s" },
          ].map((b, i) => (
            <div key={i} className="fw-ring" style={{
              left: b.l, top: b.t, width: b.sz, height: b.sz,
              background: `radial-gradient(circle, ${b.c} 0%, transparent 65%)`,
              "--d": b.d, "--dl": b.dl, zIndex: 1,
            }} />
          ))}
        </>
      )}

      <div style={{
        position: "relative", zIndex: 2,
        textAlign: "center",
        padding: "160px 24px 80px",
        maxWidth: 840,
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(28px)",
        transition: "all 0.9s ease",
      }}>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 14,
          marginBottom: 28,
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 10, fontWeight: 700, letterSpacing: 4.5,
          textTransform: "uppercase", color: FW.gold,
        }}>
          <span style={{ width: 36, height: 1, background: `${FW.gold}55`, display: "block" }} />
          Devils &amp; Round Lake · Manitou Beach
          <span style={{ width: 36, height: 1, background: `${FW.gold}55`, display: "block" }} />
        </div>

        <h1 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: "clamp(44px, 9vw, 90px)",
          fontWeight: 700,
          color: C.cream,
          margin: "0 0 4px 0",
          lineHeight: 1.0,
          letterSpacing: -1.5,
        }}>
          America
        </h1>
        <div style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: "clamp(40px, 8vw, 82px)",
          fontWeight: 700,
          color: FW.gold,
          margin: "0 0 20px 0",
          lineHeight: 1.0,
          letterSpacing: -1,
        }}>
          250
        </div>

        <div style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "clamp(18px, 2.5vw, 26px)",
          color: "rgba(255,255,255,0.6)",
          marginBottom: 52,
          lineHeight: 1.4,
        }}>
          July 3rd, 2026 · Celebrations on the Lake
        </div>

        <style>{`
          @keyframes fw-colon-pulse { 0%,100%{opacity:1} 50%{opacity:0.15} }
          .fw-countdown {
            display: flex;
            gap: clamp(8px, 2vw, 20px);
            justify-content: center;
            flex-wrap: nowrap;
            align-items: stretch;
            margin-bottom: 56px;
            width: 100%;
            max-width: 720px;
            margin-left: auto;
            margin-right: auto;
          }
          .fw-card {
            text-align: center;
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(201,168,76,0.25);
            border-radius: 16px;
            padding: clamp(16px,2.5vw,32px) clamp(12px,2.5vw,36px);
            box-shadow: 0 0 32px rgba(201,168,76,0.09), inset 0 1px 0 rgba(255,255,255,0.08);
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .fw-num {
            font-family: 'Libre Baskerville', serif;
            font-size: clamp(36px, 6vw, 80px);
            font-weight: 700;
            color: #C9A84C;
            line-height: 1;
            letter-spacing: -2px;
            font-variant-numeric: tabular-nums;
            text-shadow: 0 0 40px rgba(201,168,76,0.33);
          }
          .fw-unit {
            font-size: clamp(8px, 1.1vw, 11px);
            letter-spacing: 4px;
            text-transform: uppercase;
            color: rgba(255,255,255,0.45);
            margin-top: 10px;
            font-weight: 700;
            font-family: 'Libre Franklin', sans-serif;
          }
          .fw-colon {
            font-size: clamp(24px, 4vw, 56px);
            color: #C9A84C;
            font-family: 'Libre Baskerville', serif;
            line-height: 1;
            opacity: 0.4;
            align-self: center;
            margin-top: -16px;
            animation: fw-colon-pulse 1s steps(1) infinite;
            flex-shrink: 0;
          }
        `}</style>
        <div className="fw-countdown">
          {[
            { val: timeLeft.days,  label: "Days"  },
            { val: timeLeft.hours, label: "Hours" },
            { val: timeLeft.mins,  label: "Min"   },
            { val: timeLeft.secs,  label: "Sec"   },
          ].map(({ val, label }, i) => (
            <React.Fragment key={label}>
              <div className="fw-card">
                <div className="fw-num">{pad(val)}</div>
                <div className="fw-unit">{label}</div>
              </div>
              {i < 3 && <div className="fw-colon">:</div>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <a href="#events" className="btn-animated" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px", borderRadius: 6,
            background: FW.gold, color: FW.navy,
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase", textDecoration: "none",
          }}>
            See What's Happening →
          </a>
          <ShareBar title="America 250 - Devils &amp; Round Lake Celebrations, July 3rd 2026" />
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 2, fontSize: 18, opacity: 0.3,
      }}>↓</div>
    </section>
  );
}

// ─── Activities Timeline ──────────────────────────────────────────────────────

function ActivitiesSection() {
  return (
    <section id="events" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionLabel>July 3rd, 2026</SectionLabel>
            <SectionTitle center>What's On</SectionTitle>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, maxWidth: 520, margin: "0 auto" }}>
              More events being added as details are confirmed. Check back closer to the date.
            </p>
          </div>
        </FadeIn>

        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute",
            left: 28,
            top: 0,
            bottom: 0,
            width: 2,
            background: `linear-gradient(to bottom, ${FW.gold}60, ${FW.gold}18)`,
            borderRadius: 2,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {ACTIVITIES.map((event, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                  {/* Icon bubble */}
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                    background: event.featured
                      ? `linear-gradient(135deg, ${FW.gold} 0%, ${FW.goldLight} 100%)`
                      : `linear-gradient(135deg, ${FW.navy} 0%, #1a2d5a 100%)`,
                    border: event.featured ? `2px solid ${FW.goldLight}` : `2px solid ${FW.gold}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22,
                    boxShadow: event.featured
                      ? `0 0 24px ${FW.gold}40`
                      : `0 2px 12px rgba(0,0,0,0.15)`,
                    zIndex: 1,
                    position: "relative",
                  }}>
                    {event.icon}
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1,
                    background: event.featured
                      ? `linear-gradient(135deg, rgba(201,168,76,0.07) 0%, ${C.cream} 100%)`
                      : C.cream,
                    border: `1px solid ${event.featured ? FW.gold + "50" : C.sand}`,
                    borderRadius: 16,
                    padding: "22px 28px",
                    boxShadow: event.featured
                      ? `0 4px 24px rgba(201,168,76,0.12)`
                      : `0 2px 12px rgba(0,0,0,0.05)`,
                    marginBottom: 4,
                  }}>
                    {/* Time badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      marginBottom: 10,
                    }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
                        textTransform: "uppercase",
                        fontFamily: "'Libre Franklin', sans-serif",
                        color: event.featured ? FW.gold : C.textMuted,
                        border: `1px solid ${event.featured ? FW.gold + "60" : C.sand}`,
                        borderRadius: 4, padding: "3px 9px",
                      }}>
                        {event.date}
                      </span>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        fontFamily: "'Libre Franklin', sans-serif",
                        color: event.featured ? FW.gold : C.text,
                      }}>
                        {event.time}
                      </span>
                    </div>

                    <h3 style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: event.featured ? 22 : 18,
                      fontWeight: 700,
                      color: C.text,
                      margin: "0 0 10px 0",
                    }}>
                      {event.title}
                    </h3>

                    <p style={{
                      fontSize: 14, color: C.textLight, lineHeight: 1.75, margin: "0 0 12px 0",
                    }}>
                      {event.body}
                    </p>

                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: 12, color: C.textMuted,
                      fontFamily: "'Libre Franklin', sans-serif",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {event.location}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Story / Committee ────────────────────────────────────────────────────────

function FireworksStorySection() {
  return (
    <section style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="mobile-col-1">

          <FadeIn>
            <SectionLabel>The Origin</SectionLabel>
            <SectionTitle>A Legacy in the Sky</SectionTitle>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.9, marginBottom: 18 }}>
              Years ago, Mike Clark looked out over Devils and Round Lake and decided this place deserved something worth gathering for. He wasn't thinking about a single show - he was thinking about a tradition. A summer night that families would plan around, that kids would grow up remembering, that neighbors would watch from their docks year after year.
            </p>
            <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.9, marginBottom: 18 }}>
              Mike was the original - the OG - but even the boldest visions need a crew. He called on fellow lifetime "Lakers," people who knew these waters and these summer nights like their own backyard. Together, they built something that's been growing ever since.
            </p>
            <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.85 }}>
              What began as a vision became a tradition. What became a tradition is now, in 2026, something legendary.
            </p>
          </FadeIn>

          <FadeIn delay={120}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
              color: C.sage, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 24,
            }}>
              The Committee
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COMMITTEE.map((m, i) => (
                <FadeIn key={i} delay={140 + i * 40}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: m.role === "Founder"
                      ? `linear-gradient(135deg, rgba(201,168,76,0.07) 0%, ${C.cream} 100%)`
                      : C.cream,
                    border: `1px solid ${m.role === "Founder" ? FW.gold + "55" : C.sand}`,
                    borderRadius: 12, padding: "16px 20px",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      background: m.role === "Founder" ? `${FW.gold}22`
                               : m.role === "Chair"    ? `${C.lakeBlue}1e`
                               : `${C.sage}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: 14, fontWeight: 700,
                      color: m.role === "Founder" ? FW.gold
                           : m.role === "Chair"    ? C.lakeBlue
                           : C.sage,
                    }}>
                      {m.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 700, color: C.text }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>{m.role}</div>
                    </div>
                    {m.role === "Founder" && (
                      <div style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: 2,
                        textTransform: "uppercase", color: FW.gold,
                        fontFamily: "'Libre Franklin', sans-serif",
                        border: `1px solid ${FW.gold}45`,
                        borderRadius: 4, padding: "3px 9px", flexShrink: 0,
                      }}>
                        OG
                      </div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

// ─── Fireworks Show Details ───────────────────────────────────────────────────

function Fireworks2026Section() {
  const stats = [
    { number: "17",     label: "Launch Barges",  detail: "Positioned across both lakes - every shoreline is the best seat in the house" },
    { number: "2,500+", label: "Shells",          detail: "Each one a tribute to 250 years of American freedom" },
    { number: "2",      label: "Lakes",           detail: "Devils and Round Lake, covered from every dock" },
    { number: "250",    label: "Years",           detail: "America's semiquincentennial - the biggest Fourth of our lifetime" },
  ];

  return (
    <section style={{ background: C.night, padding: "100px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(/images/fireworks/devilslake-dlyc-bg1.jpg)",
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundAttachment: "fixed",
        opacity: 0.22,
      }} />
      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>

        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionLabel light>The Fireworks</SectionLabel>
            <SectionTitle center light>2026: Bigger Than Ever Before</SectionTitle>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.85, maxWidth: 600, margin: "0 auto" }}>
              In honor of America's 250th, the committee is honoring it properly. At dawn on July 3rd, the crew heads out on the water to position 17 launch barges across both lakes - so no matter where you're watching from, you've got a front-row view.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 56 }}>
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${FW.gold}30`,
                borderRadius: 16, padding: "32px 20px",
                textAlign: "center",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 24px rgba(0,0,0,0.2)`,
              }}>
                <div style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: "clamp(36px, 5vw, 54px)",
                  fontWeight: 700, color: FW.gold,
                  lineHeight: 1, marginBottom: 10,
                }}>
                  {s.number}
                </div>
                <div style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase", color: C.cream, marginBottom: 10,
                }}>
                  {s.label}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", lineHeight: 1.65, margin: 0 }}>
                  {s.detail}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={220}>
          <div style={{
            background: `linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(255,255,255,0.04) 100%)`,
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: `1px solid ${FW.gold}30`,
            borderRadius: 20, padding: "44px 48px",
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.25)`,
          }}>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 22, color: FW.goldLight, marginBottom: 20,
            }}>
              And there's something new this year.
            </div>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.62)", lineHeight: 1.9, margin: "0 0 20px 0", maxWidth: 700 }}>
              When the sky ignites on July 3rd, 2,500 shells will go up in waves of color, thunder, and light. Reflections across the water. Cheers from every dock. And when you think the show is winding down - there's something new in the program. Something the committee is keeping close to the vest. Something worthy of 250 years.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", lineHeight: 1.85, margin: 0, maxWidth: 680 }}>
              This is early mornings loading barges. Volunteers giving their time. Neighbors becoming friends. A community pulling together to create something worth remembering - not just a show, but a night.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function GalleryTile({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div style={{
        borderRadius: 14, overflow: "hidden", paddingTop: "75%",
        background: C.warmWhite, border: `1px solid ${C.sand}`,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: C.sand,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
          </div>
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.4 }}>
            Photo coming soon
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 14, overflow: "hidden", paddingTop: "75%",
      position: "relative", background: C.warmWhite,
    }}>
      <img
        src={src} alt={alt}
        onError={() => setFailed(true)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

function FireworksGallerySection() {
  const images = [
    "/images/fireworks/devilslake-fireworks-1.jpg",
    "/images/fireworks/devilslake-fireworks-2.jpg",
    "/images/fireworks/devilslake-fireworks-3.jpg",
    "/images/fireworks/devilslake-fireworks-4.jpg",
    "/images/fireworks/devilslake-fireworks-5.jpg",
    "/images/fireworks/devilslake-fireworks-6.jpg",
  ];

  return (
    <section style={{ background: C.cream, padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <SectionLabel>Memories</SectionLabel>
            <SectionTitle center>Gallery</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
          {images.map((src, i) => (
            <FadeIn key={i} delay={i * 55} direction="scale">
              <GalleryTile src={src} alt={`Fireworks ${2026 - i}`} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stay in the Loop ─────────────────────────────────────────────────────────

function StayInLoop() {
  return (
    <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel>Stay Connected</SectionLabel>
          <SectionTitle center>More Events Coming</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.85, marginBottom: 36 }}>
            We're still pulling together the full schedule for the weekend. Subscribe to The Dispatch and you'll hear about every new event, parade detail, and fireworks update before anyone else.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/#newsletter" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: C.sunset, color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Subscribe to The Dispatch
            </a>
            <a href="/devils-lake" className="btn-animated" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px", borderRadius: 8,
              background: "transparent", border: `1.5px solid ${C.sand}`, color: C.text,
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 14, fontWeight: 600, letterSpacing: 0.5, textDecoration: "none",
            }}>
              Back to Devils Lake
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function USA250Page() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <SEOHead
        title="America 250 - July 4th Celebrations at Devils Lake"
        description="Boat parades, fireworks, and America's 250th anniversary celebrations at Devils and Round Lake, Manitou Beach Michigan. July 3rd, 2026."
        path="/america-250"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'America 250', path: '/america-250' },
        ]}
      />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <FireworksHero />
      <WaveDivider topColor={FW.navy} bottomColor={C.warmWhite} />
      <ActivitiesSection />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.warmWhite} />
      <FireworksStorySection />
      <DiagonalDivider topColor={C.warmWhite} bottomColor={C.night} />
      <Fireworks2026Section />
      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />
      <FireworksGallerySection />
      <StayInLoop />
      <NewsletterInline />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
