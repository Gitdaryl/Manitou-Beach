import React from 'react';

// ============================================================
// 🎗️  LIFECYCLE RIBBON - "change of plans" heads-up on event cards
// Only Cancelled / Postponed render. Active = nothing; Paused events are
// pulled from the public feed entirely (silent), so they never reach here.
// Shared across HappeningPage (list rows) and EventDetailPage (hero).
// ============================================================
export const LIFECYCLE_BADGES = {
  Cancelled: { label: "Cancelled", color: "#C0392B", bg: "rgba(192,57,43,0.14)" },
  Postponed: { label: "Postponed", color: "#B07A12", bg: "rgba(176,122,18,0.16)" },
};

export function LifecycleRibbon({ event, size = "sm" }) {
  const cfg = event?.lifecycle && LIFECYCLE_BADGES[event.lifecycle];
  if (!cfg) return null;
  const lg = size === "lg";
  return (
    <span style={{
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: lg ? 12 : 10, fontWeight: 800, letterSpacing: 1.5,
      textTransform: "uppercase", color: cfg.color, background: cfg.bg,
      padding: lg ? "5px 14px" : "3px 10px", borderRadius: 10,
      border: `1px solid ${cfg.color}55`, whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  );
}
