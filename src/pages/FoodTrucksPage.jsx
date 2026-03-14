import React, { useState, useEffect } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';

// ============================================================
export default function FoodTrucksPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const truckSlug = params.get("truck") || "";
  const truckToken = params.get("token") || "";
  const isCheckinMode = !!(truckSlug && truckToken);

  const [trucks, setTrucks] = useState(null);
  const [checkinTruck, setCheckinTruck] = useState(null);
  const [checkinNote, setCheckinNote] = useState("");
  const [checkinStatus, setCheckinStatus] = useState(""); // "", "loading", "success", "error"
  const [checkinMsg, setCheckinMsg] = useState("");
  const [sharedId, setSharedId] = useState(null);

  const shareTruck = (truck) => {
    const loc = truck.locationNote ? ` — ${truck.locationNote}` : '';
    const text = `${truck.name} is here today${loc}. Meet you there! 🚚`;
    const url = 'https://manitoubeach.com/food-trucks';
    if (navigator.share) {
      navigator.share({ title: truck.name, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
      setSharedId(truck.id);
      setTimeout(() => setSharedId(null), 2200);
    }
  };

  useEffect(() => {
    fetch("/api/food-trucks")
      .then(r => r.json())
      .then(d => {
        setTrucks(d.trucks || []);
        if (isCheckinMode) {
          const mine = (d.trucks || []).find(t => t.slug === truckSlug);
          setCheckinTruck(mine || null);
        }
      })
      .catch(() => setTrucks([]));
  }, []);

  const handleCheckin = () => {
    setCheckinStatus("loading");
    const doPost = (lat, lng) => {
      fetch("/api/food-trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: truckSlug, token: truckToken, lat, lng, note: checkinNote }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.ok) {
            setCheckinStatus("success");
            setCheckinMsg(`You're checked in! Customers can now see ${d.name} on the locator.`);
          } else {
            setCheckinStatus("error");
            setCheckinMsg(d.error || "Check-in failed. Try again.");
          }
        })
        .catch(() => { setCheckinStatus("error"); setCheckinMsg("Network error. Try again."); });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doPost(pos.coords.latitude, pos.coords.longitude),
        () => doPost(null, null),
        { timeout: 8000 }
      );
    } else {
      doPost(null, null);
    }
  };

  const now = Date.now();
  const isLive = (truck) => {
    if (!truck.lastCheckin) return false;
    return (now - new Date(truck.lastCheckin).getTime()) < 12 * 60 * 60 * 1000;
  };
  const timeAgo = (iso) => {
    const diff = Math.floor((now - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    const h = Math.floor(diff / 60);
    return `${h}h ago`;
  };

  const liveTrucks = (trucks || []).filter(isLive);
  const allTrucks = trucks || [];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 60%, ${C.lakeBlue}33 100%)`,
        padding: "120px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 60% 40%, rgba(91,126,149,0.12) 0%, transparent 65%)" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚚</div>
            <SectionLabel light>Live Locator</SectionLabel>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400, color: C.cream, lineHeight: 1.15, margin: "16px 0 20px" }}>
              Find a Food Truck
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: 480, margin: "0 auto" }}>
              Local food trucks check in when they're open. See who's out on the lake today.
            </p>
            {liveTrucks.length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, background: `${C.sage}22`, border: `1px solid ${C.sage}44`, borderRadius: 20, padding: "8px 18px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.sage, boxShadow: `0 0 6px ${C.sage}` }} />
                <span style={{ fontSize: 13, color: C.sage, fontWeight: 600 }}>{liveTrucks.length} truck{liveTrucks.length !== 1 ? "s" : ""} open now</span>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.warmWhite} />

      {/* Check-in Panel — shown only when ?truck=&token= params are present */}
      {isCheckinMode && (
        <section style={{ background: C.warmWhite, padding: "0 24px 48px" }}>
          <div style={{ maxWidth: 520, margin: "0 auto" }}>
            <div style={{ background: C.cream, borderRadius: 16, border: `2px solid ${C.sage}44`, padding: "32px 28px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
              {trucks === null ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: C.textMuted, fontSize: 14 }}>Loading…</div>
              ) : checkinStatus === "success" ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.text, margin: "0 0 12px" }}>Checked In!</h2>
                  <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.6 }}>{checkinMsg}</p>
                  <button onClick={() => { setCheckinStatus(""); setCheckinMsg(""); }} style={{ marginTop: 20, padding: "10px 22px", background: C.sage, color: C.cream, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Check In Again
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                    {checkinTruck?.photoUrl ? (
                      <img src={checkinTruck.photoUrl} alt={checkinTruck?.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.sand}` }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 10, background: `${C.sage}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🚚</div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 400, color: C.text }}>
                        {checkinTruck?.name || truckSlug}
                      </div>
                      {checkinTruck?.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{checkinTruck.cuisine}</div>}
                    </div>
                  </div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: C.textMuted, marginBottom: 8 }}>
                    Where are you today?
                  </label>
                  <input
                    type="text"
                    value={checkinNote}
                    onChange={e => setCheckinNote(e.target.value)}
                    placeholder="e.g. Near the boat launch, Village parking lot…"
                    style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", color: C.text, background: C.warmWhite, outline: "none" }}
                  />
                  <p style={{ fontSize: 12, color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>
                    We'll also try to grab your GPS location automatically for map accuracy (optional).
                  </p>
                  {checkinStatus === "error" && (
                    <div style={{ marginTop: 8, fontSize: 13, color: "#c05a5a", fontWeight: 500 }}>{checkinMsg}</div>
                  )}
                  <button
                    onClick={handleCheckin}
                    disabled={checkinStatus === "loading"}
                    style={{ marginTop: 20, width: "100%", padding: "14px", background: checkinStatus === "loading" ? C.sand : C.sage, color: C.cream, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: checkinStatus === "loading" ? "default" : "pointer", transition: "background 0.2s", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}
                  >
                    {checkinStatus === "loading" ? "Checking in…" : "I'm Here Today! 🚚"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Live Now section */}
      <section style={{ background: C.warmWhite, padding: isCheckinMode ? "0 24px 72px" : "72px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: liveTrucks.length > 0 ? C.sage : C.sand, flexShrink: 0 }} />
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 400, color: C.text, margin: 0 }}>
                {liveTrucks.length > 0 ? "Open Right Now" : "No trucks checked in today"}
              </h2>
            </div>
          </FadeIn>
          {trucks === null ? (
            <div style={{ textAlign: "center", padding: "48px", color: C.textMuted, fontSize: 14 }}>Loading trucks…</div>
          ) : liveTrucks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: C.cream, borderRadius: 14, border: `1px solid ${C.sand}` }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🌤️</div>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
                No food trucks are checked in right now. Check back later — they update throughout the day.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {liveTrucks.map((truck, i) => (
                <FadeIn key={truck.id} delay={i * 60}>
                  <div style={{ background: C.cream, borderRadius: 14, border: `2px solid ${C.sage}33`, overflow: "hidden", height: "100%" }}>
                    {truck.photoUrl && (
                      <img src={truck.photoUrl} alt={truck.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
                    )}
                    <div style={{ padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 400, color: C.text, margin: 0 }}>{truck.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.sage }} />
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 600 }}>{timeAgo(truck.lastCheckin)}</span>
                        </div>
                      </div>
                      {truck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>{truck.cuisine}</div>}
                      {truck.locationNote && (
                        <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 10 }}>
                          📍 {truck.locationNote}
                        </div>
                      )}
                      {truck.description && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: "0 0 12px" }}>{truck.description}</p>}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {truck.phone && (
                          <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            📱 Call
                          </a>
                        )}
                        {truck.lat && truck.lng && (
                          <a href={`https://www.google.com/maps?q=${truck.lat},${truck.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            🗺️ Directions
                          </a>
                        )}
                        {truck.website && (
                          <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", fontWeight: 600 }}>
                            Website →
                          </a>
                        )}
                        <button
                          onClick={() => shareTruck(truck)}
                          style={{ fontSize: 12, color: sharedId === truck.id ? C.sage : C.sunset, background: "none", border: "none", padding: 0, fontWeight: 700, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", display: "inline-flex", alignItems: "center", gap: 4, transition: "color 0.2s" }}
                        >
                          {sharedId === truck.id ? '✓ Copied' : '↗ Tell a friend'}
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />

      {/* All Trucks directory */}
      {allTrucks.length > 0 && (
        <section style={{ background: C.cream, padding: "64px 24px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ marginBottom: 32 }}>
                <SectionLabel>All Trucks</SectionLabel>
                <SectionTitle>Find Your Favorite</SectionTitle>
              </div>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {allTrucks.map((truck, i) => {
                const live = isLive(truck);
                return (
                  <FadeIn key={truck.id} delay={i * 40}>
                    <div style={{ background: C.warmWhite, borderRadius: 12, border: `1px solid ${C.sand}`, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: live ? `${C.sage}20` : `${C.sand}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        🚚
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.text }}>{truck.name}</span>
                          {live && <span style={{ fontSize: 10, fontWeight: 700, color: C.sage, background: `${C.sage}15`, padding: "2px 7px", borderRadius: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Open</span>}
                        </div>
                        {truck.cuisine && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{truck.cuisine}</div>}
                        {truck.phone && (
                          <a href={`tel:${truck.phone}`} style={{ fontSize: 12, color: C.lakeBlue, textDecoration: "none", display: "block", marginTop: 6 }}>
                            {truck.phone}
                          </a>
                        )}
                        {truck.tier === 'featured' && truck.website && (
                          <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.sunset, textDecoration: "none", display: "block", marginTop: 4, fontWeight: 600 }}>
                            Menu / Info →
                          </a>
                        )}
                        {truck.scheduleNote && (
                          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, lineHeight: 1.5 }}>📅 {truck.scheduleNote}</div>
                        )}
                      </div>
                      {truck.tier === 'featured' && (
                        <div style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.sunset, background: `${C.sunset}15`, border: `1px solid ${C.sunset}30`, borderRadius: 6, padding: "3px 7px", alignSelf: "flex-start" }}>
                          Featured
                        </div>
                      )}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Owner CTA */}
      <section style={{ background: C.dusk, padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🚚</div>
            <SectionLabel light>Are You a Food Truck?</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 400, color: C.cream, margin: "16px 0 16px" }}>
              Get on the Map — $9/mo Founding Rate
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 28 }}>
              Live map pin, personal check-in URL, newsletter shoutout when you're open. Lock in the founding rate before it moves.
            </p>
            <Btn href="/food-truck-partner" variant="sunset">
              See Listing Details →
            </Btn>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} flip />
      <NewsletterInline />
      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
