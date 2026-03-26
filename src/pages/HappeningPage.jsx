import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FadeIn, SectionTitle, SectionLabel, Btn, ShareBar, WaveDivider, PageSponsorBanner, ScrollProgress, CategoryPill } from '../components/Shared';
import { C, PAGE_SPONSORS, VIDEOS } from '../data/config';
import { Footer, GlobalStyles, PromoBanner, EventLightbox, EventTimeline, Navbar, compressImage } from '../components/Layout';
import SMSOptInWidget from '../components/SMSOptInWidget';

const ATTENDANCE_LABELS = {
  just_show_up: "Just Show Up",
  rsvp_appreciated: "RSVP Appreciated",
  rsvp_required: "RSVP Required",
  limited_spots: "Limited Spots",
  registration_required: "Registration Required",
};

const ATTENDANCE_COLORS = {
  just_show_up: C.sage,
  rsvp_appreciated: C.lakeBlue,
  rsvp_required: C.lakeBlue,
  limited_spots: C.sunset,
  registration_required: C.sunset,
};

// ============================================================
function HappeningHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  return (
    <section style={{
      backgroundImage: "url(/images/happening-hero.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center 40%",
      backgroundAttachment: "fixed",
      padding: "180px 24px 140px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Dark overlay — preserves text readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(170deg, rgba(10,18,24,0.72) 0%, rgba(10,18,24,0.50) 50%, rgba(10,18,24,0.82) 100%)",
      }} />

      {/* Decorative oversized year — pure design element */}
      <div style={{
        position: "absolute",
        right: -10,
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: "'Libre Baskerville', serif",
        fontSize: "clamp(140px, 22vw, 320px)",
        fontWeight: 700,
        color: "rgba(255,255,255,0.06)",
        lineHeight: 1,
        userSelect: "none",
        letterSpacing: -12,
        pointerEvents: "none",
      }}>
        2026
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(24px)", transition: "all 0.9s ease" }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 5, textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 28 }}>
            Events & Community Calendar
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
            What's<br />Happening
          </h1>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "clamp(20px, 3vw, 30px)", color: C.sunsetLight, marginBottom: 48 }}>
            in Manitou Beach · Devils Lake, Michigan
          </div>
          <Btn href="#submit-event" variant="outlineLight">Submit an Event</Btn>
          <ShareBar title="What's Happening in Manitou Beach" />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 📅  /happening — WEEKLY RECURRING EVENTS
// ============================================================
function WeeklyEventsSection({ events, onEventClick }) {
  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };

  // Map full day name to short label — handles Notion "Recurring Day" select values
  const dayShort = (event) => {
    const day = event.recurringDay || "";
    const shorts = { Monday: "MON", Tuesday: "TUE", Wednesday: "WED", Thursday: "THU", Friday: "FRI", Saturday: "SAT", Sunday: "SUN" };
    return shorts[day] || day.slice(0, 3).toUpperCase() || "WKL";
  };

  // Build a friendly recurrence label like "Every Sunday in June" or "Every Saturday, May – Sep"
  const recurrenceLabel = (event) => {
    const day = event.recurringDay;
    if (!day) return null;
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const startDate = event.date ? new Date(event.date + "T00:00:00") : null;
    const endDate = event.dateEnd ? new Date(event.dateEnd + "T00:00:00") : null;
    if (!endDate) return `Every ${day}`;
    const endMonth = months[endDate.getMonth()];
    if (!startDate || startDate.getMonth() === endDate.getMonth()) {
      return `Every ${day} in ${endMonth}`;
    }
    const startMonth = months[startDate.getMonth()];
    return `Every ${day}, ${startMonth} – ${endMonth}`;
  };

  return (
    <section style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>The Regulars</SectionLabel>
          <SectionTitle>Every Week</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, maxWidth: 480, margin: "0 0 64px 0" }}>
            Some things happen like clockwork on Devils Lake. You just have to know where to be.
          </p>
        </FadeIn>

        {events.length === 0 ? (
          <div style={{ padding: "40px 0", fontSize: 14, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
            Weekly regulars will appear here once added. Add events to Notion with Recurring = Weekly.
          </div>
        ) : (
        <div>
          {events.map((event, i) => {
            const color = eventCatColors[event.category] || C.sage;
            const day = dayShort(event);
            return (
              <FadeIn key={event.id} delay={i * 60}>
                <div
                  onClick={() => onEventClick(event)}
                  className="weekly-event-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr auto",
                    gap: "0 48px",
                    alignItems: "start",
                    padding: "36px 0",
                    borderBottom: `1px solid ${C.sand}`,
                    transition: "all 0.2s",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.paddingLeft = "12px"; e.currentTarget.style.paddingRight = "12px"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.paddingRight = "0"; }}
                >
                  {/* Day abbreviation */}
                  <div style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 32,
                    color,
                    lineHeight: 1,
                    paddingTop: 4,
                    userSelect: "none",
                  }}>
                    {day}
                  </div>

                  {/* Event info */}
                  <div>
                    <h3 style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "clamp(20px, 2.5vw, 30px)",
                      fontWeight: 400,
                      color: C.text,
                      margin: "0 0 6px 0",
                      lineHeight: 1.2,
                    }}>
                      {event.name}
                    </h3>
                    {event.location && (
                      <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
                        {event.location}
                      </div>
                    )}
                    <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0, maxWidth: 520 }}>
                      {event.description?.replace(/\.?\s*Runs until:?\s*\d{4}-\d{2}-\d{2}\.?/i, "").trim()}
                    </p>
                    {recurrenceLabel(event) && (
                      <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic", marginTop: 6, fontFamily: "'Libre Franklin', sans-serif" }}>
                        {recurrenceLabel(event)}
                      </div>
                    )}
                  </div>

                  {/* Cost badge + share */}
                  <div style={{ paddingTop: 8, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <span style={{
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 11, fontWeight: 600, letterSpacing: 1,
                      color: event.cost === "Free" || event.cost === "Free to watch" ? C.sage : C.sunset,
                      background: event.cost === "Free" || event.cost === "Free to watch" ? `${C.sage}15` : `${C.sunset}15`,
                      padding: "5px 12px", borderRadius: 20,
                      textTransform: "uppercase",
                    }}>
                      {event.cost || "Free"}
                    </span>
                    <EventShareBtn event={event} color={color} />
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// 🔗 COMPACT SHARE BUTTON — for individual event rows
// ============================================================
function EventShareBtn({ event, color }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${siteUrl}/happening`;
  const shareText = `${event.name}${event.date ? ` — ${formatEventDate(event.date)}` : ""} at Manitou Beach`;

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try { await navigator.share({ title: shareText, url: shareUrl }); } catch (_) {}
      return;
    }
    setOpen(!open);
  };

  const share = (platform, e) => {
    e.stopPropagation();
    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        setCopied(true);
        setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
      });
    }
  };

  const pillStyle = {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "4px 10px", borderRadius: 14, border: "none",
    background: `${color || C.sage}12`, color: color || C.sage,
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 600,
    letterSpacing: 0.5, cursor: "pointer", transition: "all 0.2s",
    whiteSpace: "nowrap",
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={handleClick}
        style={pillStyle}
        onMouseEnter={e => { e.currentTarget.style.background = `${color || C.sage}25`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${color || C.sage}12`; }}
        aria-label={`Share ${event.name}`}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "100%", marginTop: 6, zIndex: 20,
          background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          border: `1px solid ${C.sand}`, padding: "6px 4px", minWidth: 140,
          display: "flex", flexDirection: "column", gap: 2,
        }}>
          {[
            { key: "facebook", label: "Facebook" },
            { key: "x", label: "X / Twitter" },
            { key: "copy", label: copied ? "Copied!" : "Copy Link" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={(e) => share(key, e)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 14px", border: "none", borderRadius: 6,
                background: key === "copy" && copied ? `${C.sage}15` : "transparent",
                color: key === "copy" && copied ? C.sage : C.text,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500,
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!(key === "copy" && copied)) e.currentTarget.style.background = `${C.sand}80`; }}
              onMouseLeave={e => { if (!(key === "copy" && copied)) e.currentTarget.style.background = "transparent"; }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 📅  /happening — SPECIAL / ONE-OFF EVENTS
// ============================================================
export function formatEventDate(dateStr) {
  if (!dateStr || dateStr.includes("TBA")) return dateStr || "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]} ${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}`;
  } catch { return dateStr; }
}

function CalendarSection({ events, onEventClick, activeFilter, onFilterChange }) {
  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };
  const categories = ["All", ...new Set(events.map(e => e.category))];
  const filtered = activeFilter === "All" ? events : events.filter(e => e.category === activeFilter);

  return (
    <section style={{ background: C.cream, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Special Events · 2026</SectionLabel>
          <SectionTitle>On the Calendar</SectionTitle>
          <p style={{ fontSize: 16, color: C.textLight, lineHeight: 1.8, maxWidth: 480, margin: "0 0 32px 0" }}>
            The big ones. Mark them down.
          </p>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn delay={100}>
          <div style={{ display: "flex", gap: 8, marginBottom: 48, flexWrap: "wrap" }}>
            {categories.map(cat => {
              const isActive = activeFilter === cat;
              const catColor = eventCatColors[cat] || C.sage;
              return (
                <button
                  key={cat}
                  onClick={() => onFilterChange(cat)}
                  className="btn-animated"
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 12, fontWeight: 600, letterSpacing: 1,
                    textTransform: "uppercase",
                    padding: "8px 18px", borderRadius: 24,
                    border: isActive ? "none" : `1.5px solid ${C.sand}`,
                    background: isActive ? (cat === "All" ? C.dusk : catColor) : "transparent",
                    color: isActive ? C.cream : C.textMuted,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </FadeIn>

        <div>
          {filtered.map((event, i) => {
            const color = eventCatColors[event.category] || C.sage;
            const dateLabel = formatEventDate(event.date);
            return (
              <FadeIn key={event.id} delay={i * 50}>
                <div
                  onClick={() => onEventClick(event)}
                  className="calendar-event-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr auto",
                    gap: "0 32px",
                    alignItems: "center",
                    padding: "24px 0",
                    borderBottom: i < filtered.length - 1 ? `1px solid ${C.sand}` : "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    borderRadius: 4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}08`; e.currentTarget.style.paddingLeft = "12px"; e.currentTarget.style.paddingRight = "12px"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "0"; e.currentTarget.style.paddingRight = "0"; }}
                >
                  {/* Date — compact format */}
                  <div style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 22,
                    color,
                    lineHeight: 1.1,
                    userSelect: "none",
                  }}>
                    {dateLabel}
                  </div>

                  {/* Event info */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h3 style={{
                        fontFamily: "'Libre Baskerville', serif",
                        fontSize: "clamp(16px, 2vw, 22px)",
                        fontWeight: 400,
                        color: C.text,
                        margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {event.name}
                      </h3>
                      {event.promoType && (!event.promoEnd || new Date(event.promoEnd + 'T23:59:59') >= new Date()) && (
                        <span style={{
                          fontFamily: "'Libre Franklin', sans-serif",
                          fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                          textTransform: "uppercase",
                          color: C.sage, background: `${C.sage}18`,
                          padding: "3px 10px", borderRadius: 10,
                          whiteSpace: "nowrap", flexShrink: 0,
                        }}>
                          Featured
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
                      {event.time && <span>{event.time}{event.timeEnd ? ` – ${event.timeEnd}` : ""}</span>}
                      {event.time && event.location && <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>}
                      {event.location && <span>{event.location}</span>}
                    </div>
                  </div>

                  {/* Cost badge + tickets + attendance + updated */}
                  <div className="calendar-cost-badge" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 11, fontWeight: 600, letterSpacing: 1,
                      color: event.cost === "Free" || event.cost === "Free to watch" ? C.sage : C.sunset,
                      background: event.cost === "Free" || event.cost === "Free to watch" ? `${C.sage}15` : `${C.sunset}15`,
                      padding: "5px 12px", borderRadius: 20,
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}>
                      {event.cost || "Free"}
                    </span>
                    {event.ticketsEnabled && (
                      <span style={{
                        fontFamily: "'Libre Franklin', sans-serif",
                        fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                        color: event.ticketCapacity > 0 && event.ticketsSold >= event.ticketCapacity ? "#ff6b6b" : C.sage,
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}>
                        {event.ticketCapacity > 0 && event.ticketsSold >= event.ticketCapacity ? "Sold Out" : "Tickets Available"}
                      </span>
                    )}
                    {event.rsvpEnabled && event.rsvpCapacity > 0 && event.rsvpsCount >= event.rsvpCapacity ? (
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "#ff6b6b", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Sold Out
                      </span>
                    ) : event.rsvpEnabled && event.rsvpCapacity > 0 && (event.rsvpCapacity - event.rsvpsCount) <= 5 ? (
                      <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: C.sunset, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {event.rsvpCapacity - event.rsvpsCount} spot{event.rsvpCapacity - event.rsvpsCount === 1 ? "" : "s"} left
                      </span>
                    ) : event.attendance && !event.ticketsEnabled && (
                      <span style={{
                        fontFamily: "'Libre Franklin', sans-serif",
                        fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                        color: ATTENDANCE_COLORS[event.attendance] || C.sage,
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}>
                        {ATTENDANCE_LABELS[event.attendance]}
                      </span>
                    )}
                    {event.updated && (
                      <span style={{
                        fontFamily: "'Libre Franklin', sans-serif",
                        fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                        color: C.sunsetLight,
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}>
                        ↻ Details Updated
                      </span>
                    )}
                    {event.vendorRegEnabled && (
                      <span style={{
                        fontFamily: "'Libre Franklin', sans-serif",
                        fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                        color: "#8B5E3C",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}>
                        Vendors Welcome
                      </span>
                    )}
                    <EventShareBtn event={event} color={color} />
                  </div>
                </div>
              </FadeIn>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}>
              No events in this category yet. Check back soon!
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 🎬  /happening — VIDEO SECTION
// ============================================================
function VideoMeta({ video }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <CategoryPill>{video.category}</CategoryPill>
        <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
          {video.date}
        </span>
      </div>
      <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.cream, margin: "0 0 8px 0", lineHeight: 1.3 }}>
        {video.title}
      </h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, margin: 0 }}>
        {video.desc}
      </p>
    </div>
  );
}

function VideoSection() {
  return (
    <section style={{ background: C.dusk, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 56 }}>
            <div>
              <SectionLabel light>Videos & Stories</SectionLabel>
              <SectionTitle light>From the Lake</SectionTitle>
            </div>
            <Btn href="https://www.youtube.com/@HollyandtheYetipodcast" variant="outlineLight" small>Watch on YouTube →</Btn>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))", gap: 40 }}>
          {VIDEOS.map((video, i) => (
            <FadeIn key={video.id} delay={i * 80}>
              {video.youtubeId ? (
                <div>
                  <div style={{ position: "relative", paddingTop: "56.25%", marginBottom: 20, borderRadius: 8, overflow: "hidden" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <VideoMeta video={video} />
                </div>
              ) : (
                <a href="https://www.youtube.com/@HollyandtheYetipodcast" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                  {/* Placeholder thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      paddingTop: "56.25%",
                      background: `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 100%)`,
                      borderRadius: 8,
                      overflow: "hidden",
                      marginBottom: 20,
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.78"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "rgba(255,255,255,0.12)",
                        border: "1.5px solid rgba(255,255,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 22, color: C.cream, paddingLeft: 5,
                      }}>
                        ▶
                      </div>
                    </div>
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      background: `${C.sunset}DD`, color: C.cream,
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 9, fontWeight: 700, letterSpacing: 2.5,
                      textTransform: "uppercase", padding: "5px 12px", borderRadius: 3,
                    }}>
                      Coming Soon
                    </div>
                  </div>
                  <VideoMeta video={video} />
                </a>
              )}
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

// ============================================================
// 📅  SUBMIT EVENT CTA — redirects to /submit-event
// ============================================================

export function HappeningSubmitCTA({ simple = false }) {
  if (simple) {
    return (
      <section style={{ background: C.night, padding: "72px 24px", textAlign: "center" }}>
        <FadeIn>
          <img src="/images/yeti/yeti-clapper.png" alt="Yeti with clapperboard" style={{ width: 'clamp(120px, 22vw, 200px)', height: 'auto', marginBottom: 20, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }} />
          <SectionLabel light>Get Involved</SectionLabel>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>
            Got something good happening?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: "0 0 32px 0", lineHeight: 1.75 }}>
            Quick text code, fill in the fun stuff, and you're on the calendar. It's free — always.
          </p>
          <Btn href="/submit-event" variant="sunset">List Your Event Free →</Btn>
        </FadeIn>
      </section>
    );
  }

  return (
    <section id="submit-event" style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <img src="/images/yeti/yeti-clapper.png" alt="Yeti with clapperboard" style={{ width: 'clamp(140px, 25vw, 220px)', height: 'auto', marginBottom: 20, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }} />
          <SectionLabel light>Get Involved</SectionLabel>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "0 0 16px 0" }}>
            Got something good happening?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 44px 0", lineHeight: 1.8 }}>
            Tell the whole lake about it. Fill in the details, verify your number,<br />and you're on the calendar. It's free — always.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 44 }}>
            {[
              { icon: "📱", label: "Quick text code", sub: "Takes about 30 seconds" },
              { icon: "✓", label: "You're on the calendar", sub: "People can see it right away" },
              { icon: "✏️", label: "Change stuff anytime", sub: "We text you an edit link" },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ flex: "1 1 160px", maxWidth: 200, padding: "20px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: C.cream, marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{sub}</div>
              </div>
            ))}
          </div>
          <Btn href="/submit-event" variant="sunset">List Your Event Free →</Btn>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 18, lineHeight: 1.6 }}>
            Always free. Always easy. That's how we roll at the lake.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================
// 🗺️  EXPLORE

// ============================================================
// HERO TAKEOVER — full-width featured event from promotions API
// ============================================================
function HeroTakeover({ event, onEventClick }) {
  if (!event) return null;
  return (
    <section style={{
      background: `linear-gradient(135deg, ${C.night} 0%, #1e3326 100%)`,
      padding: "48px 24px",
      borderBottom: `3px solid ${C.sage}50`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
      }}>
        {(event.heroImageUrl || event.imageUrl) && (
          <img
            src={event.heroImageUrl || event.imageUrl}
            alt={event.name}
            style={{ width: 240, height: 160, objectFit: "cover", borderRadius: 12, flexShrink: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 8 }}>
            Featured Event
          </div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 36px)", color: C.cream, lineHeight: 1.2, marginBottom: 8 }}>
            {event.promoHeadline || event.name}
          </div>
          {(event.date || event.location) && (
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
              {event.date && new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {event.date && event.location && " · "}
              {event.location}
            </div>
          )}
          {event.time && (
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
              {event.time}
            </div>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {event.eventUrl ? (
              <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block", padding: "12px 28px",
                background: C.sage, color: "#fff", borderRadius: 6,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
                fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                textDecoration: "none",
              }}>
                {event.ctaLabel || "Get Details"}
              </a>
            ) : (
              <button onClick={() => onEventClick && onEventClick(event)} style={{
                padding: "12px 28px", background: C.sage, color: "#fff", border: "none", borderRadius: 6,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
                fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer",
              }}>
                View Event
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HappeningPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const [heroTakeover, setHeroTakeover] = useState(null);
  const [stripPin, setStripPin] = useState(null);
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const [lightboxEvent, setLightboxEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => {
        setUpcomingEvents(data.events || []);
        setWeeklyEvents(data.recurring || []);
      })
      .catch(() => {});

    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => {
        if (data.heroTakeover?.length > 0) setHeroTakeover(data.heroTakeover[0]);
        if (data.stripPin) setStripPin(data.stripPin);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="happening" scrollTo={subScrollTo} isSubPage={true} />
      <HappeningHero />
      <PromoBanner page="Whats Happening" />
      <HeroTakeover event={heroTakeover} onEventClick={setLightboxEvent} />
      <EventTimeline stripPin={stripPin} />
      <WeeklyEventsSection events={weeklyEvents} onEventClick={setLightboxEvent} />
      <CalendarSection events={upcomingEvents} onEventClick={setLightboxEvent} activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Promote upsell strip */}
      <div style={{ background: C.dusk, padding: "32px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 6 }}>
              Want more exposure?
            </div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.cream, fontWeight: 400 }}>
              Homepage · Newsletter · Featured Banners
            </div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Founding sponsor rates available now — limited spots
            </div>
          </div>
          <Btn href="/promote" variant="sunset">See Packages →</Btn>
        </div>
      </div>

      <VideoSection />

      {/* SMS opt-in for event reminders */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px 40px' }}>
        <SMSOptInWidget
          type="event"
          source="happening"
          heading="Never miss an event"
          subtext="Get a text before Fish Fry, festivals, and live music at Manitou Beach."
        />
      </div>

      <HappeningSubmitCTA simple />
      <WaveDivider topColor={C.night} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="happening" />
      <Footer scrollTo={subScrollTo} />
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </div>
  );
}
