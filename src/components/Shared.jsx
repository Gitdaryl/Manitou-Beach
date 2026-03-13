import React from "react";

export const C = {
  cream:       "#FAF6EF",
  warmWhite:   "#F5F0E8",
  sand:        "#E8DFD0",
  driftwood:   "#C4B498",
  sage:        "#7A8E72",
  sageDark:    "#5C6F55",
  lakeBlue:    "#5B7E95",
  lakeDark:    "#3D5A6E",
  dusk:        "#2D3B45",
  night:       "#1A2830",
  sunset:      "#D4845A",
  sunsetLight: "#E8A87C",
  warmGray:    "#8A7E6E",
  text:        "#3B3228",
  textLight:   "#6B6052",
  textMuted:   "#9A8E7E",
};

export function Btn({ children, onClick, href, variant = "primary", small = false, target, rel, style: styleProp }) {
  const base = {
    display: "inline-block",
    fontFamily: "'Libre Franklin', sans-serif",
    fontWeight: 600,
    fontSize: small ? 12 : 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    padding: small ? "9px 20px" : "13px 30px",
    borderRadius: 4,
    transition: "all 0.22s ease",
  };
  const styles = {
    primary: { background: C.sage, color: C.cream },
    outline: { background: "transparent", color: C.sage, border: `1.5px solid ${C.sage}` },
    dark: { background: C.dusk, color: C.cream },
    outlineLight: { background: "transparent", color: C.cream, border: "1.5px solid rgba(255,255,255,0.5)" },
    sunset: { background: C.sunset, color: C.cream },
  };
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      className="btn-animated"
      style={{ ...base, ...styles[variant], ...(styleProp || {}) }}
    >
      {children}
    </Tag>
  );
}
