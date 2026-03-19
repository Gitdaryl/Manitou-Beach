import React, { useState, useEffect, useRef, useCallback } from "react";
import { C, PAGE_SPONSORS } from "../data/config";
export { C };

// ============================================================
// 🧩  SHARED COMPONENTS
// ============================================================

export function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "Manitou Beach — Irish Hills, Michigan";

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: shareTitle, url: shareUrl }); } catch (_) {}
      return;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const btnStyle = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)",
    fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600,
    letterSpacing: 0.5, cursor: "pointer", textDecoration: "none",
    transition: "all 0.2s",
  };

  const hoverIn = e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; };
  const hoverOut = e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
      <span style={{ fontSize: 10, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Share</span>
      {navigator.share ? (
        <button onClick={handleNativeShare} style={btnStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
          ↑ Share This Page
        </button>
      ) : (
        <>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            style={btnStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`}
            target="_blank" rel="noopener noreferrer"
            style={btnStyle} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          >
            X / Twitter
          </a>
          <button onClick={copyLink} style={{ ...btnStyle, border: copied ? `1px solid ${C.sage}` : "1px solid rgba(255,255,255,0.15)", color: copied ? C.sage : "rgba(255,255,255,0.65)" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </>
      )}
    </div>
  );
}

export function SectionLabel({ children, light = false, style: styleProp = {} }) {
  return (
    <div style={{
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: 11,
      letterSpacing: 5,
      textTransform: "uppercase",
      color: light ? "rgba(255,255,255,0.5)" : C.sage,
      marginBottom: 14,
      fontWeight: 600,
      ...styleProp,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, light = false, center = false, style: styleProp = {} }) {
  return (
    <h2 style={{
      fontFamily: "'Libre Baskerville', serif",
      fontSize: "clamp(28px, 4.5vw, 46px)",
      fontWeight: 400,
      color: light ? C.cream : C.text,
      margin: "0 0 18px 0",
      lineHeight: 1.2,
      textAlign: center ? "center" : "left",
      ...styleProp,
    }}>
      {children}
    </h2>
  );
}

export function FadeIn({ children, delay = 0, direction = "up", style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: "translateY(32px)",
    down: "translateY(-32px)",
    left: "translateX(-40px)",
    right: "translateX(40px)",
    scale: "scale(0.92)",
    none: "none",
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) translateX(0) scale(1)" : transforms[direction] || transforms.up,
        transition: `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Scroll progress bar
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress-bar" style={{ width: `${progress}%` }} />;
}

// 3D card tilt hook — brochure lift effect
export function useCardTilt(maxDeg = 6) {
  const ref = useRef(null);
  const onMouseEnter = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.22s ease, box-shadow 0.22s ease";
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(-10px)";
    el.style.boxShadow = "0 24px 56px rgba(0,0,0,0.32), 0 8px 20px rgba(0,0,0,0.18)";
  }, []);
  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = "none";
    el.style.transform = `perspective(800px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) translateY(-10px)`;
    el.style.boxShadow = `${x * 16}px ${14 + y * 10}px 50px rgba(0,0,0,0.3), 0 24px 56px rgba(0,0,0,0.2)`;
  }, [maxDeg]);
  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.4s ease, box-shadow 0.4s ease";
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
    el.style.boxShadow = "";
  }, []);
  return { ref, onMouseEnter, onMouseMove, onMouseLeave };
}

// SVG wave divider
export function WaveDivider({ topColor, bottomColor, flip = false, height = 80 }) {
  return (
    <div style={{ marginTop: -1, marginBottom: -1, lineHeight: 0, overflow: "hidden", transform: flip ? "scaleY(-1)" : "none" }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height }}>
        <path
          d="M0,40 C360,120 720,0 1080,80 C1260,120 1380,60 1440,40 L1440,120 L0,120 Z"
          fill={bottomColor}
        />
        <rect width="1440" height="120" fill={topColor} style={{ opacity: 0 }} />
      </svg>
    </div>
  );
}

// ============================================================
// 💛  PAGE SPONSOR BANNER — appears above Footer on eligible pages
// ============================================================
export function PageSponsorBanner({ pageName }) {
  const sponsor = PAGE_SPONSORS[pageName] || null;
  return (
    <section style={{ background: C.night, padding: "88px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Radial glow for depth */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 90% at 50% 50%, rgba(91,126,149,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 960, margin: "0 auto", position: "relative" }}>
        <FadeIn>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 32 }}>
            Brought to you by
          </div>
          {sponsor ? (
            <a href={sponsor.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", textDecoration: "none" }}>
              <img src={sponsor.logo} alt={sponsor.name} style={{ maxWidth: 460, width: "100%", maxHeight: 140, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.92 }} />
              {sponsor.tagline && (
                <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, color: "rgba(255,255,255,0.5)", marginTop: 20, lineHeight: 1.6 }}>{sponsor.tagline}</p>
              )}
            </a>
          ) : (
            <>
              <img src="/images/yeti/yeti-groove-full-logo.png" alt="Holly & The Yeti" style={{ maxWidth: 520, width: "90%", opacity: 0.9, display: "block", margin: "0 auto" }} />
              <div style={{ marginTop: 36, marginBottom: 12 }}>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(18px, 3vw, 28px)", color: C.cream, fontWeight: 400, margin: "0 0 10px", lineHeight: 1.3 }}>
                  Your business deserves a billboard like this.
                </p>
                <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.36)", margin: "0 0 32px", letterSpacing: 0.5 }}>
                  Exclusive · One brand per page · Seen all year long
                </p>
              </div>
              <a href="/business#page-sponsorship" className="btn-animated" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "18px 48px", borderRadius: 8,
                background: C.sunset, color: C.cream,
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 700,
                letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none",
                boxShadow: "0 8px 36px rgba(212,132,90,0.40)",
              }}>
                Own This Space — $97/mo
              </a>
            </>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

// Diagonal slice divider
export function DiagonalDivider({ topColor, bottomColor, height = 80 }) {
  return (
    <div style={{ marginTop: -1, marginBottom: -1, lineHeight: 0, overflow: "hidden" }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: "block", width: "100%", height }}>
        <polygon points="0,0 1440,60 1440,120 0,120" fill={bottomColor} />
        <polygon points="0,0 1440,0 1440,60 0,120" fill={topColor} />
      </svg>
    </div>
  );
}

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

// ============================================================
// 🤝  COMMUNITY SPONSORSHIP / DONATION FORM
// Used on org pages (Men's Club, Ladies Club, Historical, Fireworks)
// No platform branding. Uses 1.25% fee structure.
// ============================================================
export function CommunityDonationForm({ orgName, tiers, accentColor, darkBg = false, note }) {
  const FEE_RATE = 0.0125;
  const [selectedTier, setSelectedTier] = useState(tiers?.[1] ?? tiers?.[0] ?? null);
  const [customAmt, setCustomAmt] = useState('');
  const [form, setForm] = useState({ name: '', org: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const amount = selectedTier ? selectedTier.amount : (parseFloat(customAmt) || 0);
  const fee = amount ? parseFloat((amount * FEE_RATE).toFixed(2)) : 0;
  const net = amount ? parseFloat((amount - fee).toFixed(2)) : 0;

  const accent = accentColor || C.sunset;
  const textColor = darkBg ? C.cream : C.text;
  const textMuted = darkBg ? 'rgba(255,255,255,0.45)' : C.textMuted;
  const inputBg = darkBg ? 'rgba(255,255,255,0.06)' : C.cream;
  const inputBorder = darkBg ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${C.sand}`;
  const cardBg = darkBg ? 'rgba(255,255,255,0.04)' : C.cream;
  const cardBorder = darkBg ? 'rgba(255,255,255,0.1)' : C.sand;

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', padding: '12px 16px',
    border: inputBorder, borderRadius: 8, background: inputBg,
    color: textColor, fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1,
    textTransform: 'uppercase', color: textMuted, marginBottom: 6,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    if (!amount || amount < 1) { setError('Please select a sponsorship level or enter an amount.'); return; }
    setError('');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '56px 24px', background: cardBg, borderRadius: 16, border: `1px solid ${cardBorder}` }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🤝</div>
        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: textColor, fontWeight: 400, margin: '0 0 12px' }}>
          Thank you, {form.name.split(' ')[0]}!
        </h3>
        <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.8, maxWidth: 440, margin: '0 auto 16px' }}>
          Your {selectedTier ? selectedTier.level : `$${amount} contribution`} application has been received.
          Someone from {orgName} will be in touch at <strong style={{ color: accent }}>{form.email}</strong>.
        </p>
        {amount > 0 && (
          <p style={{ fontSize: 12, color: textMuted, margin: 0, lineHeight: 1.9 }}>
            Amount: <strong style={{ color: textColor }}>${amount.toLocaleString()}</strong>
            {' · '}Processing fee: <strong style={{ color: textColor }}>${fee.toFixed(2)}</strong>
            {' · '}{orgName} receives: <strong style={{ color: accent }}>${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Tier picker */}
      {tiers && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
          {tiers.map((tier) => {
            const active = selectedTier?.level === tier.level;
            return (
              <button key={tier.level} onClick={() => { setSelectedTier(tier); setCustomAmt(''); }} style={{
                padding: '18px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                border: active ? `2px solid ${accent}` : `2px solid ${cardBorder}`,
                background: active ? `${accent}18` : cardBg,
                transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: textMuted, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>{tier.level}</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: active ? accent : textColor }}>${tier.amount.toLocaleString()}</div>
              </button>
            );
          })}
          <button onClick={() => setSelectedTier(null)} style={{
            padding: '18px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
            border: selectedTier === null ? `2px solid ${accent}` : `2px solid ${cardBorder}`,
            background: selectedTier === null ? `${accent}18` : cardBg,
            transition: 'all 0.15s',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: textMuted, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Custom</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: selectedTier === null ? accent : textColor }}>Any amount</div>
          </button>
        </div>
      )}

      {/* Custom amount */}
      {selectedTier === null && (
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Contribution Amount ($)</label>
          <input type="number" min="1" value={customAmt} onChange={e => setCustomAmt(e.target.value)}
            placeholder="Enter amount" style={inputStyle} />
        </div>
      )}

      {/* Selected tier perks */}
      {selectedTier?.perks?.length > 0 && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 10, background: darkBg ? 'rgba(255,255,255,0.04)' : `${C.sage}0D`, border: `1px solid ${darkBg ? 'rgba(255,255,255,0.08)' : `${C.sage}25`}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: textMuted, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>What's Included</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {selectedTier.perks.map((perk, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: textMuted, lineHeight: 1.5 }}>
                <span style={{ color: C.sage, flexShrink: 0 }}>✓</span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fee summary */}
      {amount > 0 && (
        <div style={{ marginBottom: 20, padding: '12px 18px', borderRadius: 10, background: darkBg ? 'rgba(255,255,255,0.04)' : `${C.sage}10`, border: `1px solid ${darkBg ? 'rgba(255,255,255,0.08)' : `${C.sage}28`}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: textMuted, fontFamily: "'Libre Franklin', sans-serif", marginBottom: 4 }}>
            <span>Processing fee (1.25%)</span><span>−${fee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: textColor, fontFamily: "'Libre Franklin', sans-serif" }}>
            <span>{orgName} receives</span><span style={{ color: accent }}>${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="First &amp; Last Name" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Business or Organization</label>
            <input type="text" value={form.org} onChange={e => setForm(f => ({ ...f, org: e.target.value }))} placeholder="Optional" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Message or Questions</label>
          <textarea rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            placeholder="Optional — any questions, notes, or special requests"
            style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        {error && <p style={{ fontSize: 13, color: '#c0392b', margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</p>}
        <button onClick={handleSubmit} style={{
          padding: '15px 28px', borderRadius: 8, background: accent, color: C.cream, border: 'none',
          fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700,
          letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
        }}>
          Submit Application →
        </button>
        {note && <p style={{ fontSize: 11, color: textMuted, textAlign: 'center', lineHeight: 1.7, margin: '4px 0 0', fontFamily: "'Libre Franklin', sans-serif" }}>{note}</p>}
      </div>
    </div>
  );
}

export function CategoryPill({ children, dark = false }) {
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "'Libre Franklin', sans-serif",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: dark ? "rgba(255,255,255,0.65)" : C.sageDark,
      background: dark ? "rgba(122,142,114,0.22)" : `${C.sage}18`,
      border: `1px solid ${dark ? "rgba(122,142,114,0.4)" : `${C.sage}30`}`,
      padding: "4px 10px",
      borderRadius: 3,
    }}>
      {children}
    </span>
  );
}
