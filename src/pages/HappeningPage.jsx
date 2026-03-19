import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FadeIn, SectionTitle, SectionLabel, Btn, ShareBar, WaveDivider, PageSponsorBanner, ScrollProgress, CategoryPill } from '../components/Shared';
import { C, PAGE_SPONSORS, VIDEOS } from '../data/config';
import { Footer, GlobalStyles, PromoBanner, EventLightbox, EventTimeline, Navbar, compressImage } from '../components/Layout';

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
                      {event.description}
                    </p>
                  </div>

                  {/* Cost badge */}
                  <div style={{ paddingTop: 8 }}>
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
                    <h3 style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: "clamp(16px, 2vw, 22px)",
                      fontWeight: 400,
                      color: C.text,
                      margin: "0 0 4px 0",
                      lineHeight: 1.3,
                    }}>
                      {event.name}
                    </h3>
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
// 📅  /happening — INLINE SUBMIT FORM
// ============================================================
const EVENT_CATEGORIES = ["Live Music", "Food & Social", "Sports & Outdoors", "Community", "Arts & Culture", "Markets & Vendors", "Other"];

export function HappeningSubmitCTA({ simple = false }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [rsvpSelected, setRsvpSelected] = useState(false);
  const [rsvpMonths, setRsvpMonths] = useState(1);
  const [form, setForm] = useState({ name: "", category: "", date: "", time: "", timeEnd: "", location: "", description: "", eventUrl: "", email: "", phone: "", cost: "", attendance: "", rsvpCapacity: "", _hp: "" });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = async (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setSubmitError("Event name and email are required."); return; }
    setSubmitting(true); setSubmitError("");
    try {
      let imageUrl = null;
      if (imageFile) {
        const { base64, filename } = await compressImage(imageFile);
        const up = await fetch("/api/upload-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: base64, filename, contentType: "image/jpeg" }) });
        const upData = await up.json();
        if (up.ok) imageUrl = upData.url;
      }
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      // If RSVP add-on selected, redirect to Stripe after listing is saved
      if (rsvpSelected) {
        const promoRes = await fetch("/api/create-promo-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: "rsvp_collection", eventName: form.name, email: form.email, months: rsvpMonths, returnPath: "happening" }),
        });
        const promoData = await promoRes.json();
        if (promoData.url) { window.location.href = promoData.url; return; }
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", background: "rgba(255,255,255,0.06)", color: C.cream, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" };

  if (simple) {
    return (
      <section style={{ background: C.night, padding: "72px 24px", textAlign: "center" }}>
        <FadeIn>
          <SectionLabel light>Get Involved</SectionLabel>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>
            Have an event to share?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: "0 0 32px 0", lineHeight: 1.75 }}>
            Free community calendar listings — reviewed and live within 48 hours.
          </p>
          <Btn href="/promote" variant="sunset">Submit Free Listing</Btn>
        </FadeIn>
      </section>
    );
  }

  if (submitted) {
    return (
      <section style={{ background: C.night, padding: "80px 24px", textAlign: "center" }}>
        <FadeIn>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 400, color: C.cream, margin: "0 0 12px 0" }}>Event submitted!</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 36px 0" }}>
              We'll review and get it listed within 48 hours. Want more eyes on it?
            </p>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 32px", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 10 }}>Promote Your Event</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 20px 0" }}>
                Hero Feature · Newsletter Spotlight · Featured Banners.<br/>Founding rates available now — limited spots.
              </p>
              <Btn href="/promote" variant="sunset">See Promotion Packages →</Btn>
            </div>
          </div>
        </FadeIn>
      </section>
    );
  }

  return (
    <section id="submit-event" style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>Get Involved</SectionLabel>
          <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "0 0 8px 0" }}>
            Have an event to share?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", margin: "0 0 40px 0", lineHeight: 1.75 }}>
            Free community calendar listings — reviewed and live within 48 hours.
          </p>
        </FadeIn>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Event Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Summer Bonfire at the Point" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select a category</option>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Start Time</label>
              <input value={form.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 7:00 PM" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End Time <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
              <input value={form.timeEnd} onChange={e => set("timeEnd", e.target.value)} placeholder="e.g. 10:00 PM" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Devils Lake Pavilion" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cost / Admission</label>
              <input value={form.cost} onChange={e => set("cost", e.target.value)} placeholder="e.g. Free · $10 at the door" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Attendance / RSVP</label>
              <select value={form.attendance} onChange={e => set("attendance", e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">— Select attendance type (optional)</option>
                <option value="just_show_up">Just Show Up — open to all, no registration needed</option>
                <option value="rsvp_appreciated">RSVP Appreciated — please let us know, but not required</option>
                <option value="rsvp_required">RSVP Required — must register to attend</option>
                <option value="limited_spots">Limited Spots — finite capacity, act quickly</option>
                <option value="registration_required">Registration Required — formal signup needed</option>
              </select>
            </div>
            {['rsvp_appreciated','rsvp_required','limited_spots','registration_required'].includes(form.attendance) && (
              <>
                {/* Max attendees input */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Max Attendees <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — leave blank for unlimited)</span></label>
                  <input type="number" min="1" value={form.rsvpCapacity} onChange={e => set("rsvpCapacity", e.target.value)} placeholder="e.g. 20" style={{ ...inputStyle, width: "120px" }} />
                </div>

                {/* RSVP Collection upsell card — click to select/deselect */}
                <div
                  onClick={() => setRsvpSelected(s => !s)}
                  style={{ gridColumn: "1 / -1", border: `1px solid ${rsvpSelected ? "rgba(212,132,90,0.85)" : "rgba(212,132,90,0.4)"}`, borderRadius: 10, padding: "20px 22px", background: rsvpSelected ? "rgba(212,132,90,0.13)" : "rgba(212,132,90,0.07)", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    {/* Checkbox */}
                    <div style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, borderRadius: 4, border: `2px solid ${rsvpSelected ? C.sunset : "rgba(255,255,255,0.25)"}`, background: rsvpSelected ? C.sunset : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                      {rsvpSelected && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1, fontWeight: 700 }}>✓</span>}
                    </div>

                    <div style={{ flex: 1 }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.sunsetLight }}>
                            RSVP Collection — Add-On
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.sunset, background: "rgba(212,132,90,0.15)", border: "1px solid rgba(212,132,90,0.3)", borderRadius: 4, padding: "1px 6px", fontFamily: "'Libre Franklin', sans-serif" }}>
                            Limited Time
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 22, fontWeight: 700, color: C.cream, lineHeight: 1 }}>${rsvpMonths * 9}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>
                            {rsvpMonths > 1 ? `(${rsvpMonths} × $9/mo)` : "/ month"}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: "0 0 12px 0" }}>
                        In-app RSVP form, organizer notifications, and email reminders the day before and day of.
                      </p>

                      {/* Duration selector — stop propagation so clicks don't toggle the card */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", marginRight: 2 }}>Duration:</span>
                        {[1, 2, 3, 6].map(m => (
                          <button key={m} type="button"
                            onClick={e => { e.stopPropagation(); setRsvpMonths(m); if (!rsvpSelected) setRsvpSelected(true); }}
                            style={{ padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                              border: `1px solid ${rsvpMonths === m ? C.sunset : "rgba(255,255,255,0.15)"}`,
                              background: rsvpMonths === m ? "rgba(212,132,90,0.2)" : "transparent",
                              color: rsvpMonths === m ? C.sunsetLight : "rgba(255,255,255,0.35)",
                              cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "all 0.15s" }}>
                            {m === 1 ? "1 mo" : `${m} mo`}
                          </button>
                        ))}
                      </div>

                      {rsvpSelected && (
                        <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.35)", fontStyle: "italic", fontFamily: "'Libre Franklin', sans-serif" }}>
                          You'll be redirected to checkout after your listing is submitted.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Tell us about your event..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Ticket / Event URL</label>
              <input value={form.eventUrl} onChange={e => set("eventUrl", e.target.value)} placeholder="https://" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Your Email *</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@email.com" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Phone (optional)</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="555-555-5555" style={inputStyle} />
            </div>
            {/* Image upload */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Event Image (optional)</label>
              <div
                onClick={() => document.getElementById("happening-img-upload").click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleImage(f); }}
                style={{ border: "1.5px dashed rgba(255,255,255,0.15)", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ maxHeight: 120, borderRadius: 6, objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>Click or drag an image here</span>
                )}
                <input id="happening-img-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImage(e.target.files[0])} />
              </div>
            </div>
          </div>

          {/* Honeypot — hidden from humans, bots fill it automatically */}
          <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form._hp} onChange={e => set("_hp", e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />

          {submitError && <div style={{ fontSize: 13, color: "#ff6b6b", fontFamily: "'Libre Franklin', sans-serif" }}>{submitError}</div>}

          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <button type="submit" disabled={submitting} style={{ padding: "13px 32px", background: C.sunset, color: "#fff", border: "none", borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, transition: "all 0.2s" }}>
              {submitting
                ? "Submitting..."
                : rsvpSelected
                  ? `Submit + Add RSVP ($${rsvpMonths * 9}${rsvpMonths > 1 ? ` · ${rsvpMonths} mo` : ""}) →`
                  : "Submit Free Listing"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ============================================================
// 🗺️  EXPLORE

export default function HappeningPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [weeklyEvents, setWeeklyEvents] = useState([]);
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
  }, []);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="happening" scrollTo={subScrollTo} isSubPage={true} />
      <HappeningHero />
      <PromoBanner page="Whats Happening" />
      <EventTimeline />
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
              Hero Feature · Newsletter Spotlight · Featured Banners
            </div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              Founding sponsor rates available now — limited spots
            </div>
          </div>
          <Btn href="/promote" variant="sunset">See Packages →</Btn>
        </div>
      </div>

      <VideoSection />
      <HappeningSubmitCTA simple />
      <WaveDivider topColor={C.night} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="happening" />
      <Footer scrollTo={subScrollTo} />
      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </div>
  );
}
