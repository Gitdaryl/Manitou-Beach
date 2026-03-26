import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C, PAGE_SPONSORS, SECTIONS, LISTING_CATEGORIES, VIDEOS, DISPATCH_CARD_SPONSORS, USA250_PUBLIC } from '../data/config';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, WaveDivider, Btn, CategoryPill, PageSponsorBanner } from './Shared';

export function GlobalStyles() {
  return (
    <style>{`
      @keyframes slideUp {
        0% { transform: translateY(100%); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @media (max-width: 768px) {
        .ft-hero-video { display: none !important; }
        .ft-hero-section { background-image: url('/images/foodtruck_hero.jpg') !important; background-size: cover !important; background-position: center !important; padding-top: 80px !important; padding-bottom: 60px !important; }
        .ft-how-grid { grid-template-columns: 1fr !important; }
        .ft-pricing-paid { transform: none !important; }
      }
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
      @keyframes float-slow {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-18px) rotate(3deg); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212,132,90,0.3); }
        50% { box-shadow: 0 0 20px 4px rgba(212,132,90,0.15); }
      }
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes tracking-in {
        0% { letter-spacing: 12px; opacity: 0; }
        100% { letter-spacing: 5px; opacity: 1; }
      }
      @keyframes underline-grow {
        0% { transform: scaleX(0); transform-origin: left; }
        100% { transform: scaleX(1); transform-origin: left; }
      }
      @keyframes scroll-progress {
        0% { width: 0%; }
      }
      .scroll-progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #7A8E72, #D4845A);
        z-index: 10000;
        transition: width 0.1s linear;
      }
      @keyframes pulse-line {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes kenBurnsBg {
        0%   { transform: scale(1)    translate(0, 0); }
        100% { transform: scale(1.18) translate(-1.5%, -0.8%); }
      }
      .ken-burns-bg {
        animation: kenBurnsBg 25s ease-in-out infinite alternate;
        transform-origin: center center;
        will-change: transform;
      }
      @keyframes dot-breathe {
        0%, 100% { box-shadow: 0 0 4px currentColor; transform: scale(1); }
        50% { box-shadow: 0 0 16px currentColor; transform: scale(1.2); }
      }
      @keyframes adPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        50% { transform: scale(1.012); box-shadow: 0 8px 28px rgba(0,0,0,0.14); }
      }
      @keyframes adFade {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.82; }
      }
      @keyframes adSlide {
        0% { transform: translateX(-12px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes shrinkWidth {
        from { width: 100%; }
        to { width: 0%; }
      }
      .timeline-pulse {
        background: linear-gradient(90deg, rgba(122,142,114,0.1), rgba(212,132,90,0.35), rgba(91,126,149,0.35), rgba(122,142,114,0.1)) !important;
        background-size: 200% 100% !important;
        animation: pulse-line 4s ease-in-out infinite !important;
      }
      .timeline-dot-breathe {
        animation: dot-breathe 3s ease-in-out infinite;
      }
      .marquee-track {
        display: flex;
        animation: marquee 35s linear infinite;
      }
      .marquee-track:hover {
        animation-play-state: paused;
      }
      .btn-animated {
        transition: all 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      }
      .btn-animated:hover {
        transform: translateY(-2px) scale(1.02) !important;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
      }
      .card-tilt {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .link-hover-underline {
        position: relative;
        display: inline-block;
      }
      .link-hover-underline::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 1.5px;
        background: currentColor;
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }
      .link-hover-underline:hover::after {
        transform: scaleX(1);
      }
      .featured-card-glow:hover {
        border-color: rgba(212,132,90,0.5) !important;
        box-shadow: 0 0 20px rgba(212,132,90,0.10), 0 6px 18px rgba(0,0,0,0.25) !important;
      }
      @keyframes premium-aura {
        0%, 100% { box-shadow: 0 0 0 1px rgba(212,132,90,0.15), 0 4px 24px rgba(212,132,90,0.08); }
        50%       { box-shadow: 0 0 0 2px rgba(212,132,90,0.35), 0 8px 40px rgba(212,132,90,0.18); }
      }
      .premium-banner-glow {
        animation: premium-aura 3s ease-in-out infinite;
      }
      @keyframes featured-pulse {
        0%, 100% { box-shadow: 0 0 0 1px rgba(122,142,114,0.12), 0 4px 16px rgba(0,0,0,0.2); }
        50%       { box-shadow: 0 0 0 1px rgba(122,142,114,0.30), 0 6px 28px rgba(122,142,114,0.12); }
      }
      .featured-card-pulse {
        animation: featured-pulse 4s ease-in-out infinite;
      }
      .listing-dot-pulse {
        animation: dot-breathe 2.5s ease-in-out infinite;
      }
      .mono-icon {
        filter: grayscale(1);
        opacity: 0.72;
      }
      .horizontal-scroll {
        scrollbar-width: thin;
        scrollbar-color: #7A8E72 transparent;
      }
      .horizontal-scroll::-webkit-scrollbar {
        height: 6px;
      }
      .horizontal-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .horizontal-scroll::-webkit-scrollbar-thumb {
        background: #7A8E7240;
        border-radius: 3px;
      }
      .horizontal-scroll::-webkit-scrollbar-thumb:hover {
        background: #7A8E72;
      }
      @media (prefers-reduced-motion: reduce) {
        .marquee-track { animation: none !important; }
        .card-tilt { transition: none !important; }
        * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
      }
      @media (max-width: 960px) {
        .nav-desktop { display: none !important; }
        .nav-hamburger { display: flex !important; }
        .mobile-col-1 { grid-template-columns: 1fr !important; }
        .living-here-grid { grid-template-columns: 1fr !important; }
        .village-roots-grid { grid-template-columns: 1fr !important; }
        .mens-club-stats { grid-template-columns: repeat(3, 1fr) !important; }
        .wineries-itinerary-grid { grid-template-columns: 1fr !important; }
        .listing-demo-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        .mobile-col-1 { grid-template-columns: 1fr !important; }
        .holly-grid { grid-template-columns: 1fr !important; }
        .weekly-event-row {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
        }
        .fish-card-header { flex-direction: column !important; }
        .fish-card-img { width: 100% !important; height: 160px !important; min-height: unset !important; }
        .fish-card-meta {
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 0 20px 16px !important;
        }
        .calendar-event-row {
          grid-template-columns: auto 1fr !important;
          gap: 0 16px !important;
        }
        .calendar-cost-badge { display: none !important; }
        .living-here-grid { grid-template-columns: 1fr !important; }
        .mens-club-stats { grid-template-columns: repeat(2, 1fr) !important; }
        .village-roots-grid { grid-template-columns: 1fr !important; }
        .scoreboard-venue-name { width: 100px !important; font-size: 11px !important; }
        .scoreboard-explainer-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
      }
      @keyframes bar-breathe {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.82; box-shadow: 0 0 14px rgba(212,132,90,0.4); }
      }
      @keyframes bar-shimmer {
        0% { background-position: 0% center; }
        100% { background-position: 300% center; }
      }
      @keyframes ticker-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .scoreboard-ticker {
        display: inline-flex;
        animation: ticker-scroll 38s linear infinite;
        white-space: nowrap;
      }
      .scoreboard-ticker:hover { animation-play-state: paused; }
      .scoreboard-leader-bar {
        animation: bar-breathe 3s ease-in-out infinite, bar-shimmer 5s linear infinite;
      }
    `}</style>
  );
}

// ============================================================
// ✏️  CONFIGURABLE CONTENT — manage hero events via Notion
// ============================================================




// ============================================================
// 📢  PROMO BANNER — reusable, fetches active page banners
// ============================================================
export function PromoBanner({ page }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => {
        const banners = data.pageBanners?.[page] || [];
        if (banners.length > 0) setBanner(banners[0]);
      })
      .catch(() => {});
  }, [page]);

  if (!banner) return null;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.night} 0%, #1e3326 100%)`,
      borderBottom: `3px solid ${C.sage}50`,
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "24px 24px",
        display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap",
      }}>
        {banner.imageUrl && (
          <img
            src={banner.imageUrl}
            alt={banner.name}
            style={{ width: 110, height: 75, objectFit: "cover", borderRadius: 8, flexShrink: 0, boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
          />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 6 }}>
            {banner.sponsorBadge ? "Sponsored" : "Featured Event"}
          </div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(17px, 2.5vw, 22px)", color: C.cream, lineHeight: 1.2, marginBottom: 4 }}>
            {banner.promoHeadline || banner.name}
          </div>
          {(banner.date || banner.location) && (
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.5)" }}>
              {banner.date && new Date(banner.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {banner.date && banner.location && " · "}
              {banner.location}
            </div>
          )}
        </div>
        {banner.eventUrl && (
          <a
            href={banner.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", padding: "11px 28px",
              background: "#4A9B6F", color: "#fff", borderRadius: 6,
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
              fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
              textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            {banner.ctaLabel || "Learn More"}
          </a>
        )}
      </div>
    </div>
  );
}


// ============================================================
// 📰  INLINE NEWSLETTER CTA (compact banner)
function SubscribeModal({ alreadySubscribed, onClose }) {
  const [showContent, setShowContent] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Entrance animation — slight delay for modal to render, then content slides in
    const t = setTimeout(() => setShowContent(true), 80);
    // Confetti burst for new subscribers
    if (!alreadySubscribed) {
      const particles = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 60,
        y: 30 + Math.random() * 20,
        color: [C.sage, C.sunset, C.lakeBlue, C.sunsetLight, '#E8DFD0'][i % 5],
        delay: Math.random() * 0.4,
        dx: (Math.random() - 0.5) * 120,
        dy: -(40 + Math.random() * 60),
        rot: Math.random() * 360,
        size: 4 + Math.random() * 5,
      }));
      setConfetti(particles);
    }
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [onClose, alreadySubscribed]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alreadySubscribed ? "Already subscribed" : "Welcome to The Manitou Dispatch"}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '48px 40px',
          maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          textAlign: 'center', fontFamily: "'Libre Franklin', sans-serif",
          position: 'relative', overflow: 'hidden',
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Confetti particles */}
        {confetti.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: p.size > 6 ? 2 : '50%',
            background: p.color, pointerEvents: 'none', zIndex: 10,
            animation: `confetti-burst 1.2s ${p.delay}s ease-out forwards`,
            '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg`,
            opacity: 0,
          }} />
        ))}
        <style>{`
          @keyframes confetti-burst {
            0% { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
            70% { opacity: 1; }
            100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.3); }
          }
        `}</style>

        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: `${C.sunset}10`, borderRadius: '50%', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, background: `${C.sage}10`, borderRadius: '50%', pointerEvents: 'none' }}/>

        {alreadySubscribed ? (
          <>
            <div style={{ fontSize: 44, marginBottom: 16 }}>👋</div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, margin: '0 0 12px' }}>
              You're already one of us!
            </h3>
            <p style={{ color: C.textLight, fontSize: 16, lineHeight: 1.6, margin: '0 0 32px' }}>
              You're part of the Manitou Beach community. Watch your inbox — the next Dispatch is coming soon.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍪</div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: C.sunset, marginBottom: 10 }}>
              Welcome to the Community
            </div>
            <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, margin: '0 0 20px' }}>
              You're in. Here's your welcome gift.
            </h3>

            <div style={{
              background: `linear-gradient(135deg, ${C.sage}10 0%, ${C.lakeBlue}10 100%)`,
              border: `1px solid ${C.sage}30`, borderRadius: 12, padding: '24px 20px', marginBottom: 28,
              position: 'relative'
            }}>
              <p style={{ color: C.text, fontSize: 15, lineHeight: 1.6, margin: '0 0 16px', fontWeight: 600 }}>
                Step 1: Click confirm in your email.
              </p>
              <p style={{ color: C.textLight, fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
                Step 2: Show this secret code at <strong>Blackbird Cafe</strong> this weekend for a welcome cookie on us.
              </p>
              <div style={{
                fontFamily: "'Courier New', monospace", fontSize: 22, fontWeight: 700,
                letterSpacing: 4, color: C.sunset, background: '#fff', padding: '12px 24px',
                borderRadius: 8, display: 'inline-block', border: `1.5px dashed ${C.sunset}60`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}>
                LAKEBOUND
              </div>
            </div>

            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
              Check your <strong>spam/junk</strong> folder if you don't see the confirmation email within a few minutes.
            </p>
          </>
        )}
        <button
          onClick={onClose}
          style={{
            background: C.sage, color: '#fff', border: 'none', borderRadius: 8,
            padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'Libre Franklin', sans-serif", width: '100%',
            letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s ease',
            position: 'relative', zIndex: 1
          }}
          onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.target.style.transform = 'none'}
        >
          {alreadySubscribed ? 'Got it' : 'I saved the code →'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
export function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantSMS, setWantSMS] = useState(false);
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
      // Fire-and-forget SMS opt-in if phone provided
      if (wantSMS && phone.replace(/\D/g, '').length === 10) {
        fetch('/api/sms-optin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone.replace(/\D/g, ''), type: 'welcome', source: 'newsletter-inline' }),
        }).catch(() => {});
      }
      setAlreadySubscribed(data.alreadySubscribed);
      setShowModal(true);
      setEmail('');
      setPhone('');
      setWantSMS(false);
    } catch {
      setError('Something went wrong — try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.sage}15 0%, ${C.lakeBlue}10 100%)`,
      border: `1px solid ${C.sage}25`,
      borderRadius: 12,
      padding: "32px 40px",
      maxWidth: 1100,
      margin: "0 auto",
      marginTop: -20,
      marginBottom: 40,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 20,
      position: "relative",
      zIndex: 1,
    }}>
      <div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sage, marginBottom: 2 }}>
          The Manitou Beach Dispatch
        </div>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, lineHeight: 1.55 }}>
          <strong style={{ color: C.text }}>Free newsletter delivered to your email inbox.</strong><br />
          Events, local businesses &amp; community news — every week. No cost, ever.{subCount ? ` Join ${subCount.toLocaleString()}+ neighbors already subscribed.` : ''}
        </div>
      </div>
      <div>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email" placeholder="your@email.com" value={email}
            onChange={e => setEmail(e.target.value)} required disabled={submitting}
            style={{
              padding: "10px 16px", borderRadius: 6, border: `1.5px solid ${C.sand}`,
              background: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif",
              color: C.text, outline: "none", minWidth: 200,
            }}
          />
          <Btn variant="primary" small disabled={submitting}>{submitting ? 'Joining…' : 'Subscribe'}</Btn>
        </form>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8, flexBasis: '100%' }}>
          <input type="checkbox" id="nl-sms" checked={wantSMS} onChange={e => setWantSMS(e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, cursor: 'pointer' }} />
          <label htmlFor="nl-sms" style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer', lineHeight: 1.4 }}>
            Also text me weekend highlights
          </label>
        </div>
        {wantSMS && (
          <input
            type="tel" placeholder="(555) 555-5555" value={phone}
            onChange={e => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel"
            style={{
              padding: "10px 16px", borderRadius: 6, border: `1.5px solid ${C.sand}`,
              background: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif",
              color: C.text, outline: "none", minWidth: 200, marginTop: 4,
            }}
          />
        )}
        {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: C.sunset }}>{error}</p>}
        <p style={{ margin: '6px 0 0', fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
          No spam. No tracking cookies. Unsubscribe anytime.{wantSMS ? ' SMS: reply STOP to opt out.' : ''}
        </p>
      </div>
      {DISPATCH_CARD_SPONSORS.length > 0 && (
        <div style={{ flexBasis: '100%', borderTop: '1px solid rgba(122,142,114,0.15)', paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          {DISPATCH_CARD_SPONSORS[0].logo ? (
            <img src={DISPATCH_CARD_SPONSORS[0].logo} alt={DISPATCH_CARD_SPONSORS[0].name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'contain', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', padding: 2, flexShrink: 0 }} />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 4, border: '1.5px dashed #c4b09a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12 }}>📷</div>
          )}
          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontSize: 9 }}>Sponsored by </span>
            <span style={{ fontWeight: 600, color: C.text }}>{DISPATCH_CARD_SPONSORS[0].name}</span>
            {DISPATCH_CARD_SPONSORS[0].offerText && <span> · {DISPATCH_CARD_SPONSORS[0].offerText}</span>}
          </div>
        </div>
      )}
      {showModal && <SubscribeModal alreadySubscribed={alreadySubscribed} onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ============================================================
// 📅  12-MONTH ROLLING EVENT TIMELINE
// ============================================================
export function EventTimeline() {
  const [notionEvents, setNotionEvents] = useState([]);
  const [lightboxEvent, setLightboxEvent] = useState(null);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setNotionEvents(data.events || []))
      .catch(() => {});
  }, []);

  // Next 3 months window
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

  // 100% Notion-driven — no hardcoded events
  const allEvents = notionEvents
    .filter(e => { const d = new Date(e.date + "T00:00:00"); return d >= now && d <= cutoff; })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const catColor = (cat) => ({ "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, "Community": C.lakeBlue }[cat] || C.sage);

  // Group events by month for section headers
  const grouped = allEvents.reduce((acc, event) => {
    const d = new Date(event.date + "T00:00:00");
    const key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(event);
    return acc;
  }, {});

  return (
    <section style={{ background: C.night, padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel light>Coming Up</SectionLabel>
          <SectionTitle light>Next 3 Months</SectionTitle>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 480, marginBottom: 48 }}>
            What's on around the lakes — updated as events are confirmed.
          </p>
        </FadeIn>

        {allEvents.length === 0 ? (
          <FadeIn delay={100}>
            <div style={{ padding: "48px 32px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.7 }}>
                No events confirmed for the next 3 months yet.<br />Check back soon — the lake never stays quiet for long.
              </div>
            </div>
          </FadeIn>
        ) : (
          Object.entries(grouped).map(([monthLabel, events], gi) => (
            <div key={gi} style={{ marginBottom: 48 }}>
              <FadeIn delay={gi * 60}>
                <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 24 }}>
                  {monthLabel}
                </div>
              </FadeIn>
              <div style={{ position: "relative", paddingLeft: 36 }}>
                {/* Vertical line */}
                <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "rgba(255,255,255,0.07)", borderRadius: 1 }} />

                {events.map((event, i) => {
                  const d = new Date(event.date + "T00:00:00");
                  const day = d.getDate();
                  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
                  const color = catColor(event.category);
                  return (
                    <FadeIn key={event.id || i} delay={gi * 60 + i * 50}>
                      <div
                        onClick={() => setLightboxEvent(event)}
                        style={{ display: "flex", gap: 20, marginBottom: 24, position: "relative", cursor: "pointer" }}
                      >
                        {/* Dot */}
                        <div
                          className={event.heroFeature ? "listing-dot-pulse" : ""}
                          style={{
                            position: "absolute", left: -30, top: 5,
                            width: 10, height: 10, borderRadius: "50%",
                            background: color, border: `2px solid ${C.night}`,
                            boxShadow: `0 0 0 2px ${color}40`, flexShrink: 0,
                          }}
                        />

                        {/* Date block */}
                        <div style={{ minWidth: 40, textAlign: "center", flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: 1 }}>{weekday}</div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: color, lineHeight: 1 }}>{day}</div>
                        </div>

                        {/* Event info */}
                        <div style={{
                          flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 10, padding: "14px 18px", transition: "background 0.2s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        >
                          <div style={{ fontSize: 10, color, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{event.category}</div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.cream, lineHeight: 1.3, marginBottom: 4 }}>{event.name}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif" }}>
                            {event.time}{event.location ? ` · ${event.location}` : ""}
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <EventLightbox event={lightboxEvent} onClose={() => setLightboxEvent(null)} />
    </section>
  );
}

// ============================================================
// 🎙️  HOLLY & THE YETI
// ============================================================
export function HollyYetiSection() {
  const [videoSpotlight, setVideoSpotlight] = useState(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then(r => r.json())
      .then(data => setVideoSpotlight(data.videoSpotlight || null))
      .catch(() => {});
  }, []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match?.[1] || null;
  };

  const videoId = videoSpotlight ? getYouTubeId(videoSpotlight.videoUrl) : '6Kjt2pNsdH0';
  const videoLabel = videoSpotlight
    ? `${videoSpotlight.name} — Sponsored Content`
    : 'Devils Lake Tip-Up Wrap Up — Holly & The Yeti';

  return (
    <section id="holly" style={{
      backgroundImage: "url(/images/holly-yeti-bg.jpg)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      padding: "100px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(12,20,26,0.75)", zIndex: 0 }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* 2×2 grid on desktop → single column on mobile via holly-grid class */}
        <div className="holly-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto auto",
          gap: 32,
        }}>

          {/* TOP LEFT — Text (frosted glass panel) */}
          <FadeIn direction="left">
            <div style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: 18,
              padding: "44px 40px",
              height: "100%",
              boxSizing: "border-box",
            }}>
              <SectionLabel light>The Voices of the Lake</SectionLabel>
              <h2 style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: 400,
                color: C.cream,
                lineHeight: 1.1,
                margin: "0 0 20px 0",
              }}>
                Holly &<br />The Yeti
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.85, marginBottom: 14 }}>
                A local realtor with straight-shooter expertise and an Australian-accented community cryptid with a flair for comedy walk into a podcast...
              </p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.62)", lineHeight: 1.85, marginBottom: 32 }}>
                Holly Griewahn brings the real estate knowledge and market insight. Daryl — AKA The Yeti — brings the AI-generated videos, the unexpected camera angles, and the community stories that make Manitou Beach feel like the place it actually is.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Btn href="https://www.youtube.com/@HollyandtheYetipodcast" variant="sunset" target="_blank" rel="noopener noreferrer">Watch on YouTube</Btn>
                <Btn href="https://www.facebook.com/HollyandtheYeti" variant="outlineLight" target="_blank" rel="noopener noreferrer">Facebook</Btn>
                <Btn href="https://m.me/HollyandtheYeti" variant="outlineLight" target="_blank" rel="noopener noreferrer">Message Holly</Btn>
              </div>
            </div>
          </FadeIn>

          {/* TOP RIGHT — Portrait */}
          <FadeIn delay={80} direction="right">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <img
                src="/images/holly_yeti.png"
                alt="Holly and The Yeti"
                style={{ width: "100%", maxWidth: 300, display: "block", objectFit: "contain" }}
              />
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.3)", marginTop: 10, textAlign: "center" }}>
                Real estate meets cryptid comedy
              </div>
            </div>
          </FadeIn>

          {/* BOTTOM LEFT — YouTube video (supports Sponsored Video Spotlight promo) */}
          <FadeIn delay={160} direction="left">
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: videoSpotlight ? C.sunsetLight : "rgba(255,255,255,0.25)", marginBottom: 12 }}>
                {videoSpotlight ? "Sponsored Content" : "Watch"}
              </div>
              <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", boxShadow: "0 16px 60px rgba(0,0,0,0.55)", border: videoSpotlight ? `2px solid ${C.sunset}40` : "none" }}>
                {videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13 }}>
                    Video coming soon
                  </div>
                )}
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>
                {videoLabel}
              </div>
            </div>
          </FadeIn>

          {/* BOTTOM RIGHT — Social cards (frosted glass) */}
          <FadeIn delay={200} direction="right">
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
                Follow Along
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { platform: "YouTube", handle: "@HollyandtheYetipodcast", desc: "Full episodes, community highlights, and business spotlights.", icon: "▶", href: "https://www.youtube.com/@HollyandtheYetipodcast", color: "#FF4444" },
                  { platform: "Facebook", handle: "HollyandtheYeti", desc: "Community updates, event news, and behind-the-scenes moments.", icon: "f", href: "https://www.facebook.com/HollyandtheYeti", color: "#4A90D9" },
                  { platform: "Instagram", handle: "@hollyandtheyeti", desc: "Lake life photos, short clips, and the occasional cryptid sighting.", icon: "◎", href: "https://www.instagram.com/hollyandtheyeti", color: "#C45FA0" },
                ].map(s => (
                  <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", gap: 14, alignItems: "center",
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    padding: "14px 18px",
                    textDecoration: "none",
                    transition: "all 0.22s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; e.currentTarget.style.borderColor = `${s.color}50`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                      background: `${s.color}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, color: s.color,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 13, color: C.cream }}>{s.platform}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 3 }}>{s.handle}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>

        {/* Scroll continuation hint */}
        <div style={{ textAlign: "center", marginTop: 40, opacity: 0.3 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: C.cream, marginBottom: 6 }}>
            More below
          </div>
          <div style={{ fontSize: 16, color: C.cream, animation: "float 2s ease-in-out infinite" }}>↓</div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// 📝  SUBMISSION FORM
// ============================================================
// Client-side image compression
export async function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
        resolve({ base64, filename: file.name.replace(/\.[^.]+$/, ".jpg") });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function SubmitSection() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", phone: "", address: "", website: "", email: "", description: "", logoUrl: "", newsletter: true, _hp: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      let logoUploadUrl = null;
      if (logoFile) {
        const { base64, filename } = await compressImage(logoFile, 600, 0.85);
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64, filename: `logo-${filename}`, contentType: "image/jpeg" }),
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) logoUploadUrl = uploadData.url;
      }

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logoUrl: logoUploadUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message && err.message !== "Submission failed"
        ? err.message
        : "Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const input = (field, placeholder, type = "text", required = false) => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[field]}
      required={required}
      autoComplete="off"
      data-lpignore="true"
      data-form-type="other"
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: 6,
        border: `1.5px solid ${C.sand}`,
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 14,
        color: C.text,
        background: C.cream,
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = C.sage}
      onBlur={e => e.target.style.borderColor = C.sand}
    />
  );

  return (
    <section id="submit" style={{ background: C.warmWhite, padding: "100px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Join the Directory</SectionLabel>
          <SectionTitle>Your Neighbors Are Looking for You</SectionTitle>
          <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.75, marginBottom: 36 }}>
            Every local business belongs here. List for free in 60 seconds — upgrade anytime for more visibility.
          </p>

          {submitted ? (
            <div style={{
              background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
              borderRadius: 12,
              padding: "40px 32px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Confetti burst on successful submit */}
              {Array.from({ length: 18 }, (_, i) => {
                const colors = [C.sage, C.sunset, C.lakeBlue, C.sunsetLight, '#E8DFD0'];
                const dx = (Math.random() - 0.5) * 140;
                const dy = -(30 + Math.random() * 70);
                const rot = Math.random() * 360;
                return (
                  <div key={i} style={{
                    position: "absolute",
                    left: `${45 + Math.random() * 10}%`,
                    top: "40%",
                    width: 4 + Math.random() * 5,
                    height: 4 + Math.random() * 5,
                    borderRadius: Math.random() > 0.5 ? "50%" : "1px",
                    background: colors[i % colors.length],
                    opacity: 0,
                    pointerEvents: "none",
                    animation: `confetti-burst 0.9s ${Math.random() * 0.3}s ease-out forwards`,
                    '--dx': `${dx}px`,
                    '--dy': `${dy}px`,
                    '--rot': `${rot}deg`,
                  }} />
                );
              })}
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `${C.sage}25`, border: `2px solid ${C.sage}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 24, color: C.sage,
                animation: "pulse-glow 2s ease-in-out infinite",
              }}>✓</div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream, marginBottom: 8, fontWeight: 400 }}>
                Check your phone — one tap and you're live.
              </div>
              <p style={{ fontSize: 14, color: C.sunsetLight, margin: "0 0 20px 0", fontFamily: "'Libre Franklin', sans-serif", fontStyle: "italic" }}>
                We texted you a confirmation link. Takes two seconds.
              </p>

              {/* Phone + email notice */}
              <div style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8, padding: "14px 18px", maxWidth: 380, margin: "0 auto 24px", textAlign: "left",
              }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "0 0 6px", fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>
                  We sent a text to {form.phone || "your phone"}
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.6 }}>
                  Can't find it? Check your email — we sent the confirm link there too.
                </p>
              </div>

              {/* What happens next */}
              <div style={{ textAlign: "left", maxWidth: 380, margin: "0 auto 24px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
                  What happens next
                </p>
                {[
                  "Tap the confirmation link in your text — your listing goes live instantly",
                  "You'll appear in the Local Guide and on the Discover map",
                  "We're actively growing our audience — we want people finding you",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                      background: `${C.sage}30`, border: `1px solid ${C.sage}60`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: C.sage, fontFamily: "'Libre Franklin', sans-serif",
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>{step}</span>
                  </div>
                ))}
              </div>

              {/* Soft Enhanced upsell */}
              <div style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, padding: "16px 20px", maxWidth: 380, margin: "0 auto 20px", textAlign: "left",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>
                  Whenever you're ready
                </p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.6 }}>
                  If you ever want a bit more visibility, the Enhanced listing adds:
                </p>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {["Clickable website link", "Business description", "Expandable card", "Category search placement", "Pin on the Discover map"].map(b => (
                    <li key={b} style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", paddingLeft: 14, position: "relative", marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>
                      <span style={{ position: "absolute", left: 0, color: C.sage }}>·</span>{b}
                    </li>
                  ))}
                </ul>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 12, marginBottom: 0, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.5 }}>
                  No pressure — it's always here when you want it.{" "}
                  <a href="/business#pricing" style={{ color: C.sunsetLight, textDecoration: "underline" }}>See pricing →</a>
                </p>
              </div>

              {/* Update listing link */}
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24, fontFamily: "'Libre Franklin', sans-serif" }}>
                Need to add your logo or contact details?{" "}
                <a href="/update-listing" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "underline" }}>Update your listing →</a>
              </p>

              <button
                onClick={() => setSubmitted(false)}
                className="btn-animated"
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 12, fontWeight: 600, letterSpacing: 1.5,
                  textTransform: "uppercase", padding: "10px 24px",
                  borderRadius: 4, border: `1.5px solid rgba(255,255,255,0.2)`,
                  background: "transparent", color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                }}
              >
                Submit another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <>

                  {input("name", "Business Name")}
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 6,
                      border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 14, color: form.category ? C.text : C.textMuted,
                      background: C.cream, boxSizing: "border-box", outline: "none",
                      appearance: "none", cursor: "pointer", transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = C.sage}
                    onBlur={e => e.target.style.borderColor = C.sand}
                  >
                    <option value="" disabled>Category</option>
                    {LISTING_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                  {form.category === 'Food Truck' && (
                    <div style={{ background: 'linear-gradient(135deg, #1A2830 0%, #2D4A3E 100%)', borderRadius: 12, padding: '24px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <img src="/images/icons/food-truck-icon.png" alt="Food truck" style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }} />
                        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: '#F5F0E8', fontWeight: 400, lineHeight: 1.3 }}>
                          Hold on — you qualify for something better
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 18px', fontFamily: "'Libre Franklin', sans-serif" }}>
                        Manitou Beach has a whole special section just for food trucks — way more than a basic listing. You get your own personal page you tap when you're parked and open. Anyone following your truck gets a text message the moment you're there. Takes about two minutes to finish.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const params = new URLSearchParams();
                            if (form.name) params.set('name', form.name);
                            if (form.email) params.set('email', form.email);
                            if (form.phone) params.set('phone', form.phone);
                            if (form.website) params.set('website', form.website);
                            window.location.href = `/food-truck-partner?${params.toString()}`;
                          }}
                          style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 8, border: 'none', background: '#4A7A5A', color: '#fff', cursor: 'pointer' }}
                        >
                          Set up my truck →
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, category: '' }))}
                          style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          ← Start over
                        </button>
                      </div>
                    </div>
                  )}

                  {input("phone", "Phone Number *", "tel", true)}
                  {input("address", "Address (optional)")}
                  {input("website", "Website (e.g. yetigroove.com)")}
                  {input("email", "Your Email *", "email", true)}
                  <textarea
                    placeholder="Brief description (2-3 sentences)"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 6,
                      border: `1.5px solid ${C.sand}`,
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontSize: 14,
                      color: C.text,
                      background: C.cream,
                      resize: "vertical",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = C.sage}
                    onBlur={e => e.target.style.borderColor = C.sand}
                  />
                  {/* Tier selector */}
                  <div>
                    <select
                      value={form.tier}
                      onChange={e => setForm(f => ({ ...f, tier: e.target.value, duration: "1" }))}
                      style={{
                        width: "100%", padding: "12px 16px", borderRadius: 6,
                        border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
                        fontSize: 14, color: C.text, background: C.cream,
                        boxSizing: "border-box", outline: "none", appearance: "none", cursor: "pointer",
                      }}
                      onFocus={e => e.target.style.borderColor = C.sage}
                      onBlur={e => e.target.style.borderColor = C.sand}
                    >
                      <option value="Free">Free — $0 · Name, category & phone</option>
                      <option value="Enhanced">Enhanced — $9/mo · + Website link & description</option>
                      <option value="Featured">Featured — $25/mo · + Spotlight card & logo</option>
                      <option value="Premium">Premium — $49/mo · + Full banner & top placement</option>
                    </select>
                  </div>

                  {/* Duration — only for paid tiers */}
                  {form.tier !== "Free" && (
                    <div>
                      <select
                        value={form.duration}
                        onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                        style={{
                          width: "100%", padding: "12px 16px", borderRadius: 6,
                          border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
                          fontSize: 14, color: C.text, background: C.cream,
                          boxSizing: "border-box", outline: "none", appearance: "none", cursor: "pointer",
                        }}
                        onFocus={e => e.target.style.borderColor = C.sage}
                        onBlur={e => e.target.style.borderColor = C.sand}
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                          <option key={n} value={String(n)}>
                            {n} {n === 1 ? "month" : "months"}{n >= 6 ? " · Best value" : ""}
                          </option>
                        ))}
                      </select>
                      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, marginTop: 6, paddingLeft: 2 }}>
                        Total: ${({ Free: 0, Enhanced: 9, Featured: 25, Premium: 49 }[form.tier] * parseInt(form.duration)).toLocaleString()} · We'll confirm and invoice before going live
                      </div>
                    </div>
                  )}

                  {/* Logo upload — drag & drop, compressed, Vercel Blob */}
                  <div>
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 600, color: C.textLight, marginBottom: 8, letterSpacing: 0.5 }}>
                      Logo (optional · displayed on Featured & Premium tiers)
                    </div>
                    <div
                      onDragEnter={e => { e.preventDefault(); setIsLogoDragging(true); }}
                      onDragOver={e => { e.preventDefault(); setIsLogoDragging(true); }}
                      onDragLeave={() => setIsLogoDragging(false)}
                      onDrop={e => {
                        e.preventDefault();
                        setIsLogoDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (!file || !file.type.startsWith("image/")) return;
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onload = (ev) => setLogoPreview(ev.target.result);
                        reader.readAsDataURL(file);
                      }}
                      style={{
                        border: `1.5px dashed ${isLogoDragging ? C.sage : C.sand}`,
                        borderRadius: 8, padding: "14px",
                        background: isLogoDragging ? "rgba(122,142,114,0.06)" : C.cream,
                        textAlign: "center", transition: "all 0.2s",
                      }}
                    >
                      {logoPreview ? (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img src={logoPreview} alt="Logo preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, objectFit: "contain", display: "block" }} />
                          <button
                            type="button"
                            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                            style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, lineHeight: 1 }}
                          >×</button>
                        </div>
                      ) : (
                        <label style={{ cursor: "pointer", display: "block" }}>
                          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, marginBottom: 4 }}>
                            {isLogoDragging ? "Drop to upload" : "Drag & drop logo or click to upload"}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted, opacity: 0.6 }}>
                            Square image recommended · JPG or PNG · auto-compressed
                          </div>
                          <input
                            type="file" accept="image/*"
                            onChange={e => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setLogoFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => setLogoPreview(ev.target.result);
                              reader.readAsDataURL(file);
                            }}
                            style={{ display: "none" }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "14px 16px", background: `${C.sage}0D`, border: `1px solid ${C.sage}25`, borderRadius: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.newsletter}
                      onChange={e => setForm(f => ({ ...f, newsletter: e.target.checked }))}
                      style={{ marginTop: 2, accentColor: C.sage }}
                    />
                    <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                      Keep me in the loop — weekly events, business spotlights & lake life delivered free
                    </div>
                  </label>
              </>

              {form.category !== 'Food Truck' && (
              <>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "15px 32px",
                  borderRadius: 6,
                  border: "none",
                  background: submitting ? C.driftwood : C.sage,
                  color: C.cream,
                  cursor: submitting ? "not-allowed" : "pointer",
                  width: "100%",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={e => { if (!submitting) e.target.style.opacity = "0.85"; }}
                onMouseLeave={e => e.target.style.opacity = "1"}
              >
                {submitting ? "Sending…" : "Submit Business"}
              </button>

              {/* Honeypot — hidden from humans, bots fill it automatically */}
              <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={form._hp} onChange={e => setForm(f => ({ ...f, _hp: e.target.value }))} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />

              {submitError && (
                <p style={{ fontSize: 13, color: "#c0392b", textAlign: "center", margin: 0 }}>{submitError}</p>
              )}

              <p style={{ fontSize: 11, color: C.textMuted, textAlign: "center", margin: 0, lineHeight: 1.6 }}>
                Free forever. Reviewed within 48 hours. No fees unless you choose to upgrade.
              </p>
              <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", margin: 0 }}>
                Have an event? <a href="/promote" style={{ color: C.sage, textDecoration: "none", fontWeight: 600 }}>List it on the promote page →</a>
              </p>
              </>
              )}
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

// ============================================================
// 🔻  FOOTER
// ============================================================
export function FooterNewsletterModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantSMS, setWantSMS] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (wantSMS && phone.replace(/\D/g, '').length === 10) {
        fetch('/api/sms-optin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phone.replace(/\D/g, ''), type: 'welcome', source: 'newsletter-footer-modal' }),
        }).catch(() => {});
      }
      setDone(true);
    } catch { setError("Something went wrong — try again."); }
    finally { setSubmitting(false); }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.dusk, borderRadius: 16, padding: "40px 36px", maxWidth: 440, width: "100%", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sage, marginBottom: 6 }}>The Manitou Beach Dispatch</div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 24px 0" }}>Weekly events, local businesses, and community news — straight to your inbox. Free.</p>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.cream, marginBottom: 6 }}>You're in!</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Check your inbox for a confirmation email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ flex: 1, minWidth: 180, padding: "11px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: C.cream, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: "none" }} />
            <button type="submit" disabled={submitting} style={{ padding: "11px 22px", background: C.sage, color: C.cream, border: "none", borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? "..." : "Subscribe"}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 4 }}>
              <input type="checkbox" id="fnl-sms" checked={wantSMS} onChange={e => setWantSMS(e.target.checked)} style={{ flexShrink: 0, cursor: 'pointer' }} />
              <label htmlFor="fnl-sms" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer' }}>Also text me weekend highlights</label>
            </div>
            {wantSMS && (
              <input type="tel" placeholder="(555) 555-5555" value={phone} onChange={e => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" style={{ flex: 1, minWidth: 180, padding: "11px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: C.cream, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: "none" }} />
            )}
            {error && <div style={{ width: "100%", fontSize: 12, color: C.sunset, marginTop: 4 }}>{error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

export function ContactModal({ onClose, defaultCategory = 'General Question' }) {
  const CATEGORIES = ['General Question', 'Bug Report', 'Website Issue', 'Business Inquiry', 'Sponsorship Inquiry'];
  const [form, setForm] = useState({ name: '', email: '', category: defaultCategory, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || submitting) return;
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, category: form.category, message: form.message, _hp: '' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDone(true);
    } catch { setError('Something went wrong — please try again.'); }
    finally { setSubmitting(false); }
  };
  const inp = { padding: '11px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: C.cream, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.dusk, borderRadius: 16, padding: '40px 36px', maxWidth: 480, width: '100%', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 4 }}>Contact Us</div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: '0 0 24px 0' }}>Send us a message — we read every one.</p>
        {done ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.cream, marginBottom: 6 }}>Message received!</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>We'll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={inp} />
            <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required style={inp} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="How can we help?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4} style={{ ...inp, resize: 'vertical' }} />
            {error && <div style={{ fontSize: 12, color: C.sunset }}>{error}</div>}
            <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: C.sage, color: C.cream, border: 'none', borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: submitting ? 'wait' : 'pointer' }}>
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Footer({ scrollTo }) {
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactCategory, setContactCategory] = useState('General Question');
  const openContact = (category = 'General Question') => { setContactCategory(category); setShowContact(true); };
  return (
    <>
    {showNewsletter && <FooterNewsletterModal onClose={() => setShowNewsletter(false)} />}
    {showContact && <ContactModal onClose={() => setShowContact(false)} defaultCategory={contactCategory} />}
    <footer style={{ background: C.night, padding: "64px 24px 36px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 4 }}>
              Manitou Beach
            </div>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
              on Devils Lake, Michigan
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, margin: 0 }}>
              Community platform for Manitou Beach and the Devils Lake area.
            </p>
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              Navigate
            </div>
            {SECTIONS.map(({ id, label }) => (
              <div key={id} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => scrollTo(id)}
                  style={{
                    background: "none", border: "none",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 13, cursor: "pointer", padding: 0,
                    fontFamily: "'Libre Franklin', sans-serif",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.color = C.sunsetLight}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                >
                  {label}
                </button>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              Connect
            </div>
            {[
              { label: "Facebook", href: "https://www.facebook.com/HollyandtheYeti" },
              { label: "YouTube", href: "https://www.youtube.com/@HollyandtheYetipodcast" },
              { label: "Instagram", href: "https://www.instagram.com/hollyandtheyeti" },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 8 }}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "none", fontFamily: "'Libre Franklin', sans-serif", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = C.sunsetLight}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
                >
                  {l.label}
                </a>
              </div>
            ))}
            <div style={{ marginBottom: 8 }}>
              <button
                onClick={() => setShowNewsletter(true)}
                style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.sunsetLight}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                Newsletter
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <button
                onClick={() => openContact('General Question')}
                style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.sunsetLight}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                Contact Us
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <button
                onClick={() => openContact('Bug Report')}
                style={{ background: "none", border: "none", padding: 0, color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = C.sunsetLight}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.4)"}
              >
                Report a Bug
              </button>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 16 }}>
              For Businesses
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.75, margin: "0 0 16px 0" }}>
              Free directory listing. Upgrade for featured placement, newsletter mentions, and video content.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <a
                href="/business"
                style={{
                  display: "inline-block",
                  fontFamily: "'Libre Franklin', sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase",
                  padding: "9px 20px",
                  borderRadius: 4,
                  background: `${C.sunset}20`,
                  border: `1px solid ${C.sunset}40`,
                  color: C.sunsetLight,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                Get Featured →
              </a>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 20,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif" }}>
              © {new Date().getFullYear()} Yeti Groove Media LLC
            </div>
            <a href="/privacy" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>Privacy</a>
            <a href="/terms" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}>Terms</a>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: "rgba(255,255,255,0.15)" }}>
            No beach. Still worth it. 🏕️
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>
            Powered by{" "}
            <a
              href="https://yetigroovemedia.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = C.sunsetLight}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
            >
              Yeti Groove Media
            </a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}

// ============================================================
// 🧭  NAVBAR
// ============================================================
export function Navbar({ activeSection, scrollTo, isSubPage = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [homeOpen, setHomeOpen] = useState(false);
  const [comOpen, setComOpen] = useState(false);
  const homeRef = useRef(null);
  const comRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 960) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = (e) => {
      if (homeRef.current && !homeRef.current.contains(e.target)) setHomeOpen(false);
      if (comRef.current && !comRef.current.contains(e.target)) setComOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const solid = scrollY > 60 || menuOpen;

  const handleNavClick = (id) => {
    setMenuOpen(false);
    if (id === "happening") { window.location.href = "/events"; return; }
    if (id === "devils-lake") { window.location.href = "/devils-lake"; return; }
    if (id === "mens-club") { window.location.href = "/mens-club"; return; }
    if (id === "ladies-club") { window.location.href = "/ladies-club"; return; }
    if (id === "fireworks") { window.location.href = "/fireworks"; return; }
    if (id === "historical-society") { window.location.href = "/historical-society"; return; }
    if (id === "round-lake") { window.location.href = "/round-lake"; return; }
    if (id === "village") { window.location.href = "/village"; return; }
    if (id === "wineries") { window.location.href = "/wineries"; return; }
    if (isSubPage) {
      window.location.href = "/#" + id;
      return;
    }
    scrollTo(id);
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: solid ? "10px 0" : "18px 0",
        background: solid ? "rgba(250,246,239,0.55)" : "transparent",
        backdropFilter: solid ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: solid ? "blur(20px) saturate(160%)" : "none",
        borderBottom: solid ? `1px solid rgba(122,142,114,0.2)` : "none",
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo */}
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }} onClick={() => handleNavClick("home")}>
            <img src="/images/manitou_beach_icon.png" alt="Manitou Beach" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", opacity: solid ? 1 : 0.85, transition: "opacity 0.35s" }} />
            <div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: solid ? C.dusk : C.cream, transition: "color 0.35s" }}>
                Manitou Beach
              </div>
              <div style={{ fontFamily: "'Caveat', cursive", fontSize: 12, color: solid ? C.textMuted : "rgba(255,255,255,0.5)", marginTop: -2, transition: "color 0.35s" }}>
                on Devils Lake
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div style={{ display: "flex", gap: 2, alignItems: "center", "@media(max-width:768px)": { display: "none" } }} className="nav-desktop">

            {/* Home dropdown */}
            <div ref={homeRef} style={{ position: "relative" }}>
              <button
                onClick={() => setHomeOpen(o => !o)}
                style={{
                  background: homeOpen ? `${C.sage}18` : "transparent",
                  border: "none", color: solid ? C.text : "rgba(255,255,255,0.7)",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: 0.5,
                  padding: "7px 13px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
                onMouseLeave={e => { if (!homeOpen) { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; } }}
              >
                Home ▾
              </button>
              {homeOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, marginTop: 6,
                  background: "rgba(250,246,239,0.98)", backdropFilter: "blur(14px)",
                  borderRadius: 10, border: `1px solid ${C.sand}`, boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
                  padding: "8px 0", minWidth: 180, zIndex: 1001,
                }}>
                  {[
                    { id: "explore",    label: "Explore" },
                    { id: "businesses", label: "Local Businesses" },
                    { id: "living",     label: "Living Here" },
                    { id: "about",      label: "About" },
                  ].map(({ id, label }) => (
                    <button key={id} onClick={() => { setHomeOpen(false); handleNavClick(id); }} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "10px 18px", fontSize: 13, color: C.text,
                      background: "none", border: "none", cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.15s",
                    }} onMouseEnter={e => e.currentTarget.style.background = `${C.sage}10`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* What's Happening */}
            <button
              onClick={() => handleNavClick("happening")}
              style={{
                background: "transparent", border: "none",
                color: solid ? C.text : "rgba(255,255,255,0.7)",
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: 0.5, padding: "7px 13px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
            >
              What&apos;s Happening
            </button>

            {/* Local Guide */}
            <button
              onClick={() => { window.location.href = "/discover"; }}
              style={{
                background: "transparent", border: "none",
                color: solid ? C.text : "rgba(255,255,255,0.7)",
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: 0.5, padding: "7px 13px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
            >
              Local Guide
            </button>

            {/* Blog */}
            <button
              onClick={() => { window.location.href = "/dispatch"; }}
              style={{
                background: "transparent", border: "none",
                color: solid ? C.text : "rgba(255,255,255,0.7)",
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500,
                letterSpacing: 0.5, padding: "7px 13px", borderRadius: 6, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
              onMouseLeave={e => { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
            >
              Blog
            </button>

            {/* Community dropdown */}
            <div ref={comRef} style={{ position: "relative" }}>
              <button
                onClick={() => setComOpen(o => !o)}
                style={{
                  background: comOpen ? `${C.sage}18` : "transparent",
                  border: "none", color: solid ? C.text : "rgba(255,255,255,0.7)",
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 500, letterSpacing: 0.5,
                  padding: "7px 13px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = solid ? C.dusk : C.cream; e.currentTarget.style.background = `${C.sage}15`; }}
                onMouseLeave={e => { if (!comOpen) { e.currentTarget.style.color = solid ? C.text : "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; } }}
              >
                Community ▾
              </button>
              {comOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, marginTop: 6,
                  background: "rgba(250,246,239,0.98)", backdropFilter: "blur(14px)",
                  borderRadius: 10, border: `1px solid ${C.sand}`, boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
                  padding: "8px 0", minWidth: 200, zIndex: 1001,
                }}>
                  {[
                    { label: "Holly & The Yeti", href: "/holly-yeti" },
                    { label: "Food Truck Locator", href: "/food-trucks" },
                    { label: "Devils Lake", href: "/devils-lake" },
                    { label: "Round Lake", href: "/round-lake" },
                    { label: "The Village", href: "/village" },
                    { label: "Stays & Rentals", href: "/stays" },
                    { label: "Wineries & Breweries", href: "/wineries" },
                    { label: "Men's Club", href: "/mens-club" },
                    { label: "Ladies Club", href: "/ladies-club" },
                    { label: "Historical Society", href: "/historical-society" },
                    { label: "Gallery ↗", href: "https://photogallery.yetigroove.com/folder/muVgmuXuvFwI/", external: true },
                    ...(USA250_PUBLIC ? [{ label: "July 4th Fireworks", href: "/fireworks" }] : []),
                  ].map((link, i) => (
                    link.href ? (
                      <a key={i} href={link.href} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{
                        display: "block", padding: "10px 18px", fontSize: 13, color: C.text,
                        textDecoration: "none", fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.15s",
                      }} onMouseEnter={e => e.currentTarget.style.background = `${C.sage}10`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {link.label}
                      </a>
                    ) : (
                      <button key={i} onClick={() => { setComOpen(false); handleNavClick(link.id); }} style={{
                        display: "block", width: "100%", textAlign: "left", padding: "10px 18px", fontSize: 13, color: C.text,
                        background: "none", border: "none", cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif", transition: "background 0.15s",
                      }} onMouseEnter={e => e.currentTarget.style.background = `${C.sage}10`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {link.label}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginLeft: 8, display: "flex", gap: 8 }}>
              <Btn href="/business" variant="primary" small style={{ minWidth: 152, textAlign: "center", whiteSpace: "nowrap" }}>List Your Business</Btn>
              <Btn href="/event" variant="sunset" small style={{ minWidth: 152, textAlign: "center", whiteSpace: "nowrap" }}>List Your Event</Btn>
            </div>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="nav-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              flexDirection: "column",
              gap: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "block",
                width: 22,
                height: 2,
                background: solid ? C.dusk : C.cream,
                borderRadius: 2,
                transition: "all 0.25s ease",
                transformOrigin: "center",
                transform: menuOpen
                  ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
                  : i === 2 ? "rotate(-45deg) translate(5px, -5px)"
                  : "scaleX(0)"
                  : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999,
        background: "rgba(250,246,239,0.98)",
        backdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 8,
        overflowY: "auto",
        paddingTop: 80,
        paddingBottom: 40,
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s ease",
      }}>
        {/* What's Happening — mobile top level */}
        <button onClick={() => { setMenuOpen(false); handleNavClick("happening"); }} style={{
          background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
          fontSize: 24, fontWeight: 400, color: C.text, cursor: "pointer", padding: "12px 32px", letterSpacing: 0.5,
        }}>
          What&apos;s Happening
        </button>
        <button onClick={() => { setMenuOpen(false); window.location.href = "/discover"; }} style={{
          background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
          fontSize: 24, fontWeight: 400, color: C.text, cursor: "pointer", padding: "12px 32px", letterSpacing: 0.5,
        }}>
          Local Guide
        </button>
        <button onClick={() => { setMenuOpen(false); window.location.href = "/dispatch"; }} style={{
          background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
          fontSize: 24, fontWeight: 400, color: C.text, cursor: "pointer", padding: "12px 32px", letterSpacing: 0.5,
        }}>
          Blog
        </button>

        {/* Home sub-sections */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginTop: 8, fontFamily: "'Libre Franklin', sans-serif" }}>On This Page</div>
        {[
          { id: "explore",    label: "Explore" },
          { id: "businesses", label: "Local Businesses" },
          { id: "living",     label: "Living Here" },
          { id: "about",      label: "About" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => handleNavClick(id)} style={{
            background: "none", border: "none", fontFamily: "'Libre Baskerville', serif",
            fontSize: 20, fontWeight: 400, color: C.textLight, cursor: "pointer", padding: "8px 32px", letterSpacing: 0.5,
          }}>
            {label}
          </button>
        ))}

        {/* Community sub-links */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted, marginTop: 8, fontFamily: "'Libre Franklin', sans-serif" }}>Community</div>
        {[
          { label: "Holly & The Yeti", href: "/holly-yeti" },
          { label: "Food Truck Locator", href: "/food-trucks" },
          { label: "Devils Lake", href: "/devils-lake" },
          { label: "Round Lake", href: "/round-lake" },
          { label: "The Village", href: "/village" },
          { label: "Wineries & Breweries", href: "/wineries" },
          { label: "Men's Club", href: "/mens-club" },
          { label: "Ladies Club", href: "/ladies-club" },
          { label: "July 4th Fireworks", href: "/fireworks" },
          { label: "Historical Society", href: "/historical-society" },
        ].map(link => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 20, fontWeight: 400, color: C.text,
            textDecoration: "none", padding: "8px 32px", display: "block",
          }}>
            {link.label}
          </a>
        ))}
        <a
          href="https://photogallery.yetigroove.com/folder/muVgmuXuvFwI/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 20, fontWeight: 400, color: C.textLight,
            textDecoration: "none", padding: "10px 32px", display: "block",
          }}
        >
          Gallery ↗
        </a>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <Btn href="/business" variant="primary" style={{ width: 200, textAlign: "center", whiteSpace: "nowrap" }}>List Your Business</Btn>
          <Btn href="/event" variant="sunset" style={{ width: 200, textAlign: "center", whiteSpace: "nowrap" }}>List Your Event</Btn>
        </div>
      </div>

      {/* Responsive styles handled by GlobalStyles */}
    </>
  );
}

// ============================================================
// 📅  /happening — FULL PAGE
// ============================================================
export function EventLightbox({ event, onClose }) {
  const [ticketForm, setTicketForm] = React.useState({ buyerName: '', email: '', phone: '', quantity: 1 });
  const [ticketLoading, setTicketLoading] = React.useState(false);
  const [ticketError, setTicketError] = React.useState('');
  const [showTicketForm, setShowTicketForm] = React.useState(false);
  const [rsvpForm, setRsvpForm] = React.useState({ name: '', email: '', phone: '', guests: 1 });
  const [rsvpLoading, setRsvpLoading] = React.useState(false);
  const [rsvpError, setRsvpError] = React.useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = React.useState(false);
  const [waitlistForm, setWaitlistForm] = React.useState({ name: '', email: '', phone: '' });
  const [waitlistLoading, setWaitlistLoading] = React.useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = React.useState(false);

  if (!event) return null;
  const eventCatColors = { "Live Music": C.sunset, "Food & Social": "#8B5E3C", "Sports & Outdoors": C.sage, Community: C.lakeBlue };
  const color = eventCatColors[event.category] || C.sage;
  const isRecurring = event.recurring === 'Weekly' || event.recurring === 'Monthly';
  const isAnnual = event.recurring === 'Annual';
  const dateDisplay = isRecurring
    ? `Every ${event.recurringDay || "Week"}`
    : (() => {
        try {
          return new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        } catch { return event.date; }
      })();

  const ticketsSoldOut = event.ticketsEnabled && event.ticketCapacity > 0 && event.ticketsSold >= event.ticketCapacity;
  const ticketsRemaining = event.ticketCapacity > 0 ? Math.max(0, event.ticketCapacity - (event.ticketsSold || 0)) : null;

  const rsvpSoldOut = event.rsvpEnabled && event.rsvpCapacity > 0 && (event.rsvpsCount || 0) >= event.rsvpCapacity;
  const rsvpSpotsLeft = event.rsvpCapacity > 0 ? Math.max(0, event.rsvpCapacity - (event.rsvpsCount || 0)) : null;

  const RSVP_ATTENDANCE_TYPES = ['rsvp_required', 'rsvp_appreciated', 'limited_spots', 'registration_required'];

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistForm.email) return;
    setWaitlistLoading(true);
    try {
      await fetch('/api/rsvp-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, eventName: event.name, ...waitlistForm }),
      });
      setWaitlistSubmitted(true);
    } catch { /* silent */ } finally {
      setWaitlistLoading(false);
    }
  };

  const handleRsvp = async (e) => {
    e.preventDefault();
    if (!rsvpForm.name || !rsvpForm.email) { setRsvpError('Name and email are required'); return; }
    setRsvpLoading(true);
    setRsvpError('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
          organizerEmail: event.email,
          ...rsvpForm,
        }),
      });
      const data = await res.json();
      if (res.status === 409) { setRsvpError('This event is now full — join the waitlist below.'); return; }
      if (!res.ok) throw new Error(data.error || 'RSVP failed');
      setRsvpSubmitted(true);
    } catch (err) {
      setRsvpError(err.message);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleTicketPurchase = async (e) => {
    e.preventDefault();
    if (!ticketForm.buyerName || !ticketForm.email) {
      setTicketError('Name and email are required');
      return;
    }
    setTicketLoading(true);
    setTicketError('');
    try {
      const res = await fetch('/api/ticket-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          quantity: ticketForm.quantity,
          buyerName: ticketForm.buyerName,
          email: ticketForm.email,
          phone: ticketForm.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setTicketError(err.message);
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(10,18,24,0.85)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: `linear-gradient(145deg, ${C.dusk} 0%, ${C.night} 100%)`,
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16, padding: "36px",
          maxWidth: 520, width: "100%",
          maxHeight: "85vh", overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 24, cursor: "pointer" }}
        >×</button>

        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.name} style={{ display: "block", maxWidth: "100%", maxHeight: 220, width: "auto", margin: "0 auto 20px", objectFit: "contain", borderRadius: 10 }} />
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <CategoryPill dark>{event.category}</CategoryPill>
          {event.cost && (
            <span style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11, fontWeight: 600, letterSpacing: 1,
              color: event.cost === "Free" || event.cost === "Free to watch" ? C.sage : C.sunsetLight,
              textTransform: "uppercase",
            }}>
              {event.cost}
            </span>
          )}
          {isAnnual && (
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, color: C.lakeBlue, textTransform: "uppercase" }}>
              ● Annual Event
            </span>
          )}
          {event.updated && (
            <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, color: C.sunsetLight, textTransform: "uppercase", fontStyle: "italic" }}>
              ↻ Details recently updated
            </span>
          )}
        </div>

        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 4vw, 32px)", color: C.cream, margin: "14px 0 10px 0", fontWeight: 400, lineHeight: 1.2 }}>
          {event.name}
        </h2>

        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color, marginBottom: 16 }}>
          {dateDisplay}
          {!isRecurring && event.dateEnd && ` — ${new Date(event.dateEnd + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
        </div>

        {(event.time || event.location || event.attendance) && (
          <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {event.time && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin', sans-serif" }}>
                🕐 {event.time}{event.timeEnd ? ` – ${event.timeEnd}` : ""}
              </div>
            )}
            {event.location && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'Libre Franklin', sans-serif" }}>
                📍 {event.location}
              </div>
            )}
            {event.attendance && (() => {
              const LABELS = { just_show_up: "Just Show Up", rsvp_appreciated: "RSVP Appreciated", rsvp_required: "RSVP Required", limited_spots: "Limited Spots", registration_required: "Registration Required" };
              const COLORS = { just_show_up: C.sage, rsvp_appreciated: C.lakeBlue, rsvp_required: C.lakeBlue, limited_spots: C.sunset, registration_required: C.sunset };
              const ICONS = { just_show_up: "✓", rsvp_appreciated: "📋", rsvp_required: "📋", limited_spots: "⚡", registration_required: "📝" };
              const aColor = COLORS[event.attendance] || C.sage;
              return (
                <div style={{ fontSize: 12, color: aColor, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, letterSpacing: 0.5, background: `${aColor}15`, padding: "3px 10px", borderRadius: 12 }}>
                  {ICONS[event.attendance]} {LABELS[event.attendance]}
                </div>
              );
            })()}
          </div>
        )}

        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 20px 0" }}>
          {event.description}
        </p>

        {/* RSVP section — full in-app form (paid feature) OR dead-end fix (free) */}
        {RSVP_ATTENDANCE_TYPES.includes(event.attendance) && !event.ticketsEnabled && (
          <div style={{ marginBottom: 20 }}>
            {/* Spots-left pill — only show when ≤5 remain and not yet sold out */}
            {!rsvpSoldOut && rsvpSpotsLeft !== null && rsvpSpotsLeft <= 5 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 20, padding: "4px 12px", marginBottom: 12, fontSize: 12, fontWeight: 700, color: rsvpSpotsLeft <= 2 ? "#ff6b6b" : C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 1 }}>
                🔴 {rsvpSpotsLeft} spot{rsvpSpotsLeft === 1 ? "" : "s"} left
              </div>
            )}
            {event.rsvpEnabled ? (
              rsvpSoldOut ? (
                /* Sold out state + notify-me form */
                waitlistSubmitted ? (
                  <div style={{ background: `${C.sage}18`, border: `1px solid ${C.sage}40`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.sage, fontFamily: "'Libre Franklin', sans-serif" }}>
                    ✓ You're on the list! We'll let you know if a spot opens.
                  </div>
                ) : (
                  <div style={{ background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: 12, padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ fontSize: 28 }}>🎟️</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#ff6b6b", fontFamily: "'Libre Franklin', sans-serif", marginBottom: 2 }}>This event is full</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif" }}>Join the waitlist — we'll notify you if a spot opens up.</div>
                      </div>
                    </div>
                    <form onSubmit={handleWaitlist} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[{ key: 'name', placeholder: 'Your name', type: 'text' }, { key: 'email', placeholder: 'Email *', type: 'email' }].map(f => (
                          <input key={f.key} type={f.type} value={waitlistForm[f.key]} onChange={e => setWaitlistForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder} required={f.key === 'email'}
                            style={{ padding: "9px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box", width: "100%" }} />
                        ))}
                      </div>
                      <button type="submit" disabled={waitlistLoading}
                        style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.cream, background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.4)", padding: "10px 24px", borderRadius: 6, cursor: waitlistLoading ? "not-allowed" : "pointer", opacity: waitlistLoading ? 0.6 : 1, alignSelf: "flex-start" }}>
                        {waitlistLoading ? "Saving..." : "Notify Me →"}
                      </button>
                    </form>
                  </div>
                )
              ) : rsvpSubmitted ? (
                <div style={{ background: `${C.sage}18`, border: `1px solid ${C.sage}40`, borderRadius: 10, padding: "14px 18px", fontSize: 14, color: C.sage, fontFamily: "'Libre Franklin', sans-serif" }}>
                  ✓ You're registered! We'll send a reminder the day before.
                </div>
              ) : (
                <form onSubmit={handleRsvp} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.lakeBlue, marginBottom: 14, fontFamily: "'Libre Franklin', sans-serif" }}>
                    RSVP — It's Free
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                    {[
                      { key: 'name', placeholder: 'Your name *', required: true, type: 'text' },
                      { key: 'email', placeholder: 'Email *', required: true, type: 'email' },
                      { key: 'phone', placeholder: 'Phone (optional)', required: false, type: 'text' },
                    ].map(f => (
                      <input key={f.key} type={f.type} value={rsvpForm[f.key]} onChange={e => setRsvpForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} required={f.required}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box" }}
                      />
                    ))}
                    <select value={rsvpForm.guests} onChange={e => setRsvpForm(p => ({ ...p, guests: parseInt(e.target.value, 10) }))}
                      style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", outline: "none" }}>
                      {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                    </select>
                  </div>
                  {rsvpError && <div style={{ fontSize: 12, color: "#ff6b6b", marginBottom: 10, fontFamily: "'Libre Franklin', sans-serif" }}>{rsvpError}</div>}
                  <button type="submit" disabled={rsvpLoading}
                    style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.cream, background: C.lakeBlue, padding: "12px 28px", borderRadius: 6, border: "none", cursor: rsvpLoading ? "not-allowed" : "pointer", opacity: rsvpLoading ? 0.6 : 1 }}>
                    {rsvpLoading ? "Registering..." : "RSVP Now →"}
                  </button>
                </form>
              )
            ) : (
              /* Dead-end fix — route to eventUrl / email / contact */
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {event.eventUrl ? (
                  <a href={event.eventUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-block", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.cream, background: C.sunset, padding: "10px 22px", borderRadius: 6, textDecoration: "none" }}>
                    Register / RSVP →
                  </a>
                ) : event.email ? (
                  <a href={`mailto:${event.email}?subject=RSVP: ${encodeURIComponent(event.name)}`}
                    style={{ display: "inline-block", fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunset, border: `1px solid ${C.sunset}60`, padding: "10px 22px", borderRadius: 6, textDecoration: "none" }}>
                    Email to Register →
                  </a>
                ) : (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif", fontStyle: "italic" }}>
                    Contact the organizer to register.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ticket purchase section */}
        {event.ticketsEnabled && (
          <div style={{ marginBottom: 16 }}>
            {ticketsSoldOut ? (
              <div style={{
                display: "inline-block",
                fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
                textTransform: "uppercase", color: "#ff6b6b",
                background: "rgba(255,80,80,0.12)",
                padding: "10px 22px", borderRadius: 6,
              }}>
                Sold Out
              </div>
            ) : !showTicketForm ? (
              <div>
                <button
                  onClick={() => setShowTicketForm(true)}
                  style={{
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
                    textTransform: "uppercase", color: C.cream,
                    background: C.sage, padding: "12px 28px",
                    borderRadius: 6, border: "none", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Get Tickets — ${event.ticketPrice}
                </button>
                {ticketsRemaining !== null && ticketsRemaining <= 20 && (
                  <span style={{ fontSize: 12, color: C.sunsetLight, marginLeft: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
                    {ticketsRemaining} left
                  </span>
                )}
              </div>
            ) : (
              <form onSubmit={handleTicketPurchase} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.sunsetLight, marginBottom: 14, fontFamily: "'Libre Franklin', sans-serif" }}>
                  Ticket Details — ${event.ticketPrice}/ticket
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input
                    value={ticketForm.buyerName} onChange={e => setTicketForm(f => ({ ...f, buyerName: e.target.value }))}
                    placeholder="Your name *" required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box" }}
                  />
                  <input
                    type="email" value={ticketForm.email} onChange={e => setTicketForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email *" required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box" }}
                  />
                  <input
                    value={ticketForm.phone} onChange={e => setTicketForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone (optional)"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box" }}
                  />
                  <select
                    value={ticketForm.quantity} onChange={e => setTicketForm(f => ({ ...f, quantity: parseInt(e.target.value, 10) }))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: C.cream, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif", outline: "none", boxSizing: "border-box", appearance: "none" }}
                  >
                    {Array.from({ length: Math.min(10, ticketsRemaining || 10) }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} ticket{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                {ticketError && <div style={{ fontSize: 12, color: "#ff6b6b", marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif" }}>{ticketError}</div>}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    type="submit" disabled={ticketLoading}
                    style={{
                      padding: "10px 24px", background: C.sage, color: C.cream, border: "none", borderRadius: 6,
                      fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                      cursor: ticketLoading ? "not-allowed" : "pointer", opacity: ticketLoading ? 0.6 : 1,
                      fontFamily: "'Libre Franklin', sans-serif", transition: "all 0.2s",
                    }}
                  >
                    {ticketLoading ? "Processing..." : `Pay $${(event.ticketPrice * ticketForm.quantity).toFixed(2)}`}
                  </button>
                  <button
                    type="button" onClick={() => setShowTicketForm(false)}
                    style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "'Libre Franklin', sans-serif" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {event.vendorRegEnabled && (
          <div style={{ marginBottom: 12 }}>
            <a
              href={`/vendor-register?event=${event.id}`}
              style={{
                display: "inline-block",
                fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
                textTransform: "uppercase", color: C.cream,
                background: C.lakeBlue, padding: "10px 22px",
                borderRadius: 6, textDecoration: "none",
              }}
            >
              Register as a Vendor →
            </a>
          </div>
        )}

        {event.eventUrl && (
          <a
            href={event.eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
              textTransform: "uppercase", color: C.cream,
              background: event.ticketsEnabled ? 'transparent' : C.sunset,
              border: event.ticketsEnabled ? `1px solid rgba(255,255,255,0.2)` : 'none',
              padding: "10px 22px",
              borderRadius: 6, textDecoration: "none",
            }}
          >
            {event.ticketsEnabled ? 'More Info →' : 'Get Tickets / More Info →'}
          </a>
        )}
      </div>
    </div>
  );
}




// ============================================================
// ⭐  FEATURED BUSINESS — SALES PAGE + STRIPE CHECKOUT



// ============================================================
// 📣  PROMOTE PAGE (/promote)
// ============================================================
const PROMOTE_PACKAGES = [
  { id: "event_spotlight", label: "Event Spotlight",        detail: "Featured Listing",   price: "$25",  fullPrice: "$49",  diagramType: "calendar",
    desc: "Your event in the calendar with a photo and a ticket button.",
    plain: "Instead of just a line of text like the free listings, yours shows up with a photo and a big 'Get Tickets' button. Stands out." },
  { id: "hero_7d",         label: "Hero Feature",           detail: "7 Days",             price: "$75",  fullPrice: "$149", diagramType: "hero",
    desc: "The first thing anyone sees when they visit the site — full screen, your event, for 7 days.",
    plain: "Picture the front page of a newspaper. That's your event, full size, the moment anyone opens the website. Every visitor sees it first, for a whole week." },
  { id: "hero_30d",        label: "Hero Feature",           detail: "30 Days",            price: "$249", fullPrice: "$499", diagramType: "hero",
    desc: "Own the front of the site for a full month.",
    plain: "Same front-page treatment as the 7-day option — just for a whole month. Great for building buzz leading up to a big event." },
  { id: "newsletter",      label: "Newsletter Feature",     detail: "1 Issue",            price: "$39",  fullPrice: "$79",  diagramType: "newsletter",
    desc: "Top spot in the next Manitou Beach Dispatch email — before anyone scrolls.",
    plain: "A big beautiful announcement at the very top of our weekly email. The whole community sees it in their inbox before they read anything else." },
  { id: "banner_1p",       label: "Page Feature Banner",    detail: "1 Page · 30 Days",  price: "$29",  fullPrice: "$59",  diagramType: "banner",
    desc: "A wide banner for your event sitting in the middle of whichever page your crowd visits most.",
    plain: "Like a billboard, but on the website. Pick the page where your people hang out — Fishing, Wineries, Devils Lake — and your banner is right there for 30 days." },
  { id: "banner_3p",       label: "Page Feature Banner",    detail: "3 Pages · 30 Days", price: "$69",  fullPrice: "$129", diagramType: "banner3",
    desc: "Same billboard treatment, but on three different pages at once.",
    plain: "Cover more ground — your banner shows up on three pages across the site. Catch people wherever they're browsing." },
  { id: "strip_pin",       label: "Featured Strip Pin",     detail: "30 Days",            price: "$19",  fullPrice: "$39",  diagramType: "strip",
    desc: "First spot in the 'Coming Up' list on the homepage — right below the big banner.",
    plain: "There's a scrolling list of upcoming events near the top of the home page. Your event goes first on that list for 30 days. Hard to scroll past." },
  { id: "holly_yeti",      label: "Holly & Yeti Spotlight", detail: "30 Days",            price: "$179", fullPrice: "$350", diagramType: "video",
    desc: "Holly and The Yeti make a short video about your event or business. Lives on the site for 30 days.",
    plain: "We come out, shoot a short video, and it lives on the website for a month. We share it on social too. It's the kind of thing people actually watch." },
  { id: "spotlight",       label: "Full Launch Bundle",     detail: "Best Value",         price: "$149", fullPrice: "$299", diagramType: "bundle",
    desc: "Front page of the site for 7 days + top of the newsletter + featured calendar listing. All three at once.",
    plain: "The whole shebang. Front page of the website, top of the email, featured in the calendar. Maximum coverage — and you save $55 doing it this way.", badge: "Best Value" },
];


const PROMO_PAGES = ["Home", "Whats Happening", "Village", "Devils Lake", "Wineries", "Fishing", "Round Lake"];

// ─── /advertise ──────────────────────────────────────────────────────────────

const ADVERTISE_PACKAGES = [
  { id: "newsletter_mention", label: "Newsletter Mention",   detail: "1 Issue",            price: "$29",  fullPrice: "$49",  diagramType: "newsletter_sm",
    desc: "Your brand, product, or event mentioned with a link in the next Dispatch email.",
    plain: "One or two sentences about you, with a link, in front of everyone who reads the weekly email. Simple and effective." },
  { id: "newsletter",         label: "Newsletter Feature",   detail: "1 Issue",            price: "$39",  fullPrice: "$79",  diagramType: "newsletter",
    desc: "A full dedicated section at the top of the next Manitou Beach Dispatch — before anyone scrolls.",
    plain: "Your business or event gets its own section at the very top of the email. Image, copy, link. The whole community sees it before anything else." },
  { id: "banner_1p",          label: "Page Banner",          detail: "1 Page · 30 Days",  price: "$29",  fullPrice: "$59",  diagramType: "banner",
    desc: "A full-width banner for your brand on whichever page your customers visit most.",
    plain: "Like renting a billboard, but on the website. Pick the page — Fishing, Wineries, Devils Lake — and your banner sits right there for 30 days." },
  { id: "banner_3p",          label: "Page Banner",          detail: "3 Pages · 30 Days", price: "$69",  fullPrice: "$129", diagramType: "banner3",
    desc: "Same banner treatment across three pages at once — maximum coverage for 30 days.",
    plain: "Three pages, one price. Catch people wherever they're browsing — whether they're checking fishing conditions, planning a winery visit, or reading about the lake." },
  { id: "holly_yeti",         label: "Holly & Yeti Feature", detail: "Video · 30 Days",   price: "$179", fullPrice: "$350", diagramType: "video",
    desc: "Holly and The Yeti create a short video about your business. Lives on the site for 30 days and shared on social.",
    plain: "We come out, tell your story on camera, and put it on the website for a month. Real people, real place — the kind of thing the community actually watches." },
];



// ============================================================
// 📰  THE MANITOU DISPATCH — BLOG / NEWSLETTER ARCHIVE
// ============================================================

export const CATEGORY_COLORS = {
  'Lake Life':       C.lakeBlue,
  'Community':       '#D4845A',
  'Community News':  '#D4845A',
  'Events':          '#E07B39',
  'Real Estate':     '#5B8A6E',
  'Food & Drink':    '#C06FA0',
  'History':         '#8B7355',
  'Local History':   '#8B7355',
  'Recreation':      C.sage,
  'Seasonal Tips':   C.sage,
  'Hollys Corner':   '#C06FA0',
  "Holly's Corner":  '#C06FA0',
  'PSA':             '#C0392B',
  'Advertorial':     '#7D6EAA',
};

// ============================================================
// 📢  AD SLOTS — Dispatch blog advertising
// ============================================================

// ============================================================
// 🧪  BETA FEEDBACK STRIP — visible to beta testers until April 10
// ============================================================

const BETA_CODE_RE = /^MB[A-Z0-9]{4}$/;
const BETA_LAUNCH_DATE = new Date('2026-04-10T16:00:00Z');

export function BetaFeedbackStrip() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'Bug', description: '', email: '' });
  const [submitState, setSubmitState] = useState('idle'); // idle | submitting | done

  useEffect(() => {
    try {
      const code = localStorage.getItem('mb_beta_code');
      const alreadyDismissed = sessionStorage.getItem('mb_beta_strip_dismissed');
      if (code && BETA_CODE_RE.test(code) && Date.now() < BETA_LAUNCH_DATE.getTime() && !alreadyDismissed) {
        setVisible(true);
        const storedEmail = localStorage.getItem('mb_beta_email');
        if (storedEmail) setForm(f => ({ ...f, email: storedEmail }));
      }
    } catch {}
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem('mb_beta_strip_dismissed', '1'); } catch {}
    setDismissed(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    setSubmitState('submitting');
    try {
      await fetch('/api/beta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page:        window.location.pathname,
          type:        form.type,
          description: form.description.trim(),
          email:       form.email.trim().toLowerCase(),
        }),
      });
    } catch {}
    setSubmitState('done');
    setTimeout(() => { setOpen(false); setSubmitState('idle'); setForm(f => ({ ...f, description: '' })); }, 2000);
  };

  if (!visible || dismissed) return null;

  const stripStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 998,
    background: '#D4A017',
    color: '#1A2830',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '0 -2px 12px rgba(0,0,0,0.25)',
  };

  const btnStyle = {
    background: 'rgba(26,40,48,0.15)',
    border: '1px solid rgba(26,40,48,0.25)',
    color: '#1A2830',
    borderRadius: 4,
    padding: '5px 12px',
    fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    cursor: 'pointer',
  };

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,40,48,0.65)',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  };

  const modalStyle = {
    background: C.cream,
    borderRadius: 10,
    padding: '28px 28px 24px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    position: 'relative',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 5,
    border: '1px solid #C4B498',
    fontSize: 14,
    fontFamily: "'Libre Franklin', sans-serif",
    color: C.text,
    background: '#FAF6EF',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.textMuted,
    marginBottom: 5,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  return (
    <>
      {/* Strip */}
      <div style={stripStyle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            background: 'rgba(26,40,48,0.2)',
            borderRadius: 3,
            padding: '2px 7px',
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 2,
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>BETA</span>
          <span style={{ opacity: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            This site is in development · Disappears April 10
          </span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button style={btnStyle} onClick={() => setOpen(true)}>
            Give Feedback
          </button>
          <button
            onClick={dismiss}
            style={{ ...btnStyle, padding: '5px 9px', background: 'transparent', border: 'none' }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </span>
      </div>

      {/* Feedback modal */}
      {open && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={modalStyle}>
            <button
              onClick={() => setOpen(false)}
              style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: C.textMuted }}
            >✕</button>

            {submitState === 'done' ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 28, color: C.sunset, margin: '0 0 8px' }}>Thanks!</p>
                <p style={{ fontSize: 14, color: C.textLight, margin: 0 }}>Your feedback was sent.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, margin: '0 0 18px', fontWeight: 400 }}>
                  Beta Feedback
                </p>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option>Bug</option>
                    <option>Suggestion</option>
                    <option>Question</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>
                    Description <span style={{ color: C.sunset }}>*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe what you found or what you'd like to see…"
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                    required
                  />
                  <p style={{ fontSize: 11, color: C.textMuted, margin: '4px 0 0', fontFamily: "'Libre Franklin', sans-serif" }}>
                    Page: <code style={{ fontSize: 11 }}>{typeof window !== 'undefined' ? window.location.pathname : ''}</code>
                  </p>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Your Email (optional — for follow-up)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitState === 'submitting' || !form.description.trim()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: submitState === 'submitting' ? 'rgba(212,132,90,0.5)' : C.sunset,
                    color: C.cream,
                    border: 'none',
                    borderRadius: 4,
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    cursor: submitState === 'submitting' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitState === 'submitting' ? 'Sending…' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

