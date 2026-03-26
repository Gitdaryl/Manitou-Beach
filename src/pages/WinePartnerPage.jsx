import React, { useState } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import yeti from '../data/errorMessages';

const WINE_PARTNER_HOW = [
  { step: "01", title: "A customer visits your tasting room", copy: "They enjoy a pour, browse your space, connect with what you offer. That experience is already happening — we just give them a way to capture it." },
  { step: "02", title: "You hand them a 4×6 passport card", copy: "One side has the trail map and QR code. The other is a 2×4 grid — one square per stop on the trail. They keep this card for the whole season." },
  { step: "03", title: "They scan, rate, and you stamp", copy: "They scan the QR, pick their wine from the dropdown (or add a new one), leave a star rating. You sign their card square — that's the stamp. They earn 10% off a bottle, right now, while they're there. Leave without buying? Offer expires." },
  { step: "04", title: "Ratings go live — and build all season", copy: "Every rating is a vote. Your scores update in real time on the Manitou Beach wine trail page, visible to every visitor planning their trip. Your fans become your marketing." },
];
const WINE_PARTNER_GETS = [
  { icon: "📊", title: "Live Public Scorecard", copy: "Real-time community ratings across Wine Quality, Service, Atmosphere, and Value. Visitors research the trail before they drive — your scores are what they see first." },
  { icon: "🃏", title: "Passport Cards — Delivered", copy: "100 printed 4×6 passport cards for your counter plus a display insert. Yeti Groove handles design, print, and delivery. Refills available when you run out." },
  { icon: "🏆", title: "Framed Certificate Award", copy: "Top-rated venues in each category receive a custom framed certificate to hang on your wall — something to be proud of and post about. Scores go dark in the final 30 days, so nobody knows until the ceremony." },
  { icon: "👥", title: "Community Visibility", copy: "Your venue on the Manitou Beach wine trail — seen by the region's most engaged local audience: visitors planning trips, seasonal residents, and year-round locals." },
  { icon: "💰", title: "Built-In Bottle Sales", copy: "Every stamp earns the customer 10% off a bottle — but only if they buy before they leave. If they walk out, the offer expires. The card physically drives in-store purchases." },
];
const WINE_PARTNER_AWARDS = [
  "Best Red Wine",
  "Best White Wine",
  "Best Sweet Wine",
  "Best Fruit or Specialty Wine",
  "Best Tasting Room Experience",
  "Outstanding Customer Hospitality",
  "Best Atmosphere",
];
const WINE_PARTNER_FRICTIONLESS = [
  { label: "No app required", sub: "Customers rate in a browser. Done." },
  { label: "No account to manage", sub: "Your profile is already live." },
  { label: "No work to maintain", sub: "We run the system. You run the tasting room." },
  { label: "No hidden cost later", sub: "If that ever changes, you'll hear it from us first." },
];

function WinePartnerSignupSection() {
  const [venueName, setVenueName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venueName.trim() || !contactName.trim() || !email.trim()) {
      setError('Venue name, your name, and email are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/wine-partner-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueName: venueName.trim(), contactName: contactName.trim(), email: email.trim(), phone: phone.trim(), note: note.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || yeti.oops());
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10,
    border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 15, color: C.text, background: '#fff', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 8,
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Venue Name *</label>
            <input type="text" value={venueName} onChange={e => setVenueName(e.target.value)} placeholder="Faust House, Ang & Co, ..." style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="First + last" style={fieldStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="best way to reach you" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" style={fieldStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Anything else? <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Delivery address, questions, anything helpful..." rows={2} style={{ ...fieldStyle, resize: 'none' }} />
        </div>

        {error && <div style={{ fontSize: 13, color: '#e07070', marginBottom: 16, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: 28,
            background: C.sunset, color: C.cream, border: 'none',
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700,
            letterSpacing: 1.5, textTransform: 'uppercase',
            cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s',
          }}
        >
          {submitting ? 'One moment...' : 'Join the 2026 Trail — $279 →'}
        </button>
        <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
          Secure Stripe checkout. One-time charge for the full 2026 season — no subscription.
        </p>
      </form>
    </FadeIn>
  );
}

function WinePartnerReserveSection() {
  const [open, setOpen] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleReserve = async () => {
    if (!venueName.trim() || !contactName.trim() || !email.trim()) {
      setError('All three fields are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/wine-partner-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueName: venueName.trim(), contactName: contactName.trim(), email: email.trim(), reserveOnly: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDone(true);
    } catch (err) {
      setError(err.message || yeti.oops());
      setSubmitting(false);
    }
  };

  const fieldStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.15)', fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 14, color: C.text, background: '#fff', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
    letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6,
  };

  if (done) return (
    <div style={{ marginTop: 20, padding: '20px 24px', background: 'rgba(255,255,255,0.06)', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.12)' }}>
      <div style={{ fontSize: 16, color: '#fff', fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}>✓ Spot reserved!</div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '8px 0 0', fontFamily: "'Libre Franklin', sans-serif" }}>Daryl will follow up before cards go to print.</p>
    </div>
  );

  return (
    <div style={{ marginTop: 20 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", padding: 0, textDecoration: 'underline' }}>
          Not ready to pay yet? Reserve your spot →
        </button>
      ) : (
        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.10)', marginTop: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: 16, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.3 }}>Hold My Spot — No payment yet</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div><label style={labelStyle}>Venue Name</label><input style={fieldStyle} placeholder="Your tasting room" value={venueName} onChange={e => setVenueName(e.target.value)} /></div>
            <div><label style={labelStyle}>Your Name</label><input style={fieldStyle} placeholder="First + last" value={contactName} onChange={e => setContactName(e.target.value)} /></div>
            <div><label style={labelStyle}>Email</label><input type="email" style={fieldStyle} placeholder="best way to reach you" value={email} onChange={e => setEmail(e.target.value)} /></div>
          </div>
          {error && <div style={{ fontSize: 12, color: '#e07070', marginBottom: 12, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleReserve}
              disabled={submitting}
              style={{ flex: 1, padding: '12px', borderRadius: 28, background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >{submitting ? 'Saving…' : 'Hold My Spot'}</button>
            <button onClick={() => setOpen(false)} style={{ padding: '12px 18px', borderRadius: 28, background: 'none', color: 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WinePartnerPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const joined = new URLSearchParams(window.location.search).get('joined') === '1';
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
<GlobalStyles />
      <ScrollProgress />

      {/* Partner context strip */}
      <div style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "9px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>This page isn't public — you're seeing it because someone sent it to you.</span>
        <a href="/wineries" style={{ fontSize: 12, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>See the Wine Trail →</a>
        <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", whiteSpace: "nowrap" }}>Visit Homepage →</a>
      </div>

      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 55%, ${C.night} 100%)`, padding: "160px 24px 110px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(139,30,30,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
        <FadeIn>
          <SectionLabel light>Manitou Beach Wine Trail · 2026</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 400, color: C.cream, margin: "20px 0 24px", lineHeight: 1.15 }}>
            Your tasting room.<br />Rated. Recognized.<br /><em>Celebrated.</em>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.85 }}>
            Manitou Beach visitors are already discovering your tasting room. Now they have a way to tell the community what they found — and at the end of the season, the best venues get recognized for it.
          </p>
          <Btn href="#signup" variant="sunset" style={{ whiteSpace: "nowrap" }}>
            Join the Trail →
          </Btn>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.28)", marginTop: 14 }}>
            $279 for the 2026 season · May 22 – October 31
          </div>
        </FadeIn>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.cream} />

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>How It Works</SectionLabel>
            <SectionTitle center>Three steps. Zero work on your end.</SectionTitle>
          </FadeIn>
          <FadeIn delay={100}>
            <div style={{ textAlign: "center", margin: "32px 0 44px" }}>
              <img src="/images/passport-review-illustration.png" alt="" aria-hidden="true" style={{ width: "min(760px, 90vw)", opacity: 0.93 }} />
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
            {WINE_PARTNER_HOW.map((s, i) => (
              <FadeIn key={s.step} delay={i * 80}>
                <div style={{ background: C.warmWhite, borderRadius: 16, padding: "32px 28px", border: `1px solid ${C.sand}`, position: "relative", overflow: "hidden", height: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 56, fontWeight: 700, color: "rgba(212,132,90,0.1)", position: "absolute", top: 12, right: 18, lineHeight: 1, userSelect: "none" }}>{s.step}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.sunset, marginBottom: 12, fontWeight: 600 }}>Step {s.step}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 12, lineHeight: 1.4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.8 }}>{s.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />

      {/* ── WHAT YOU GET ── */}
      <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>What You Get</SectionLabel>
            <SectionTitle center>Everything that comes with being on the trail.</SectionTitle>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 48 }}>
            {WINE_PARTNER_GETS.map((item, i) => (
              <FadeIn key={item.title} delay={i * 70}>
                <div style={{ background: C.cream, borderRadius: 14, padding: "28px 24px", border: `1px solid ${C.sand}`, borderTop: `3px solid ${C.sunset}`, height: "100%", boxSizing: "border-box" }}>
                  <div className="mono-icon" style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.78 }}>{item.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />

      {/* ── THE AWARDS ── */}
      <section style={{ background: C.dusk, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light>Season-End Recognition</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.2 }}>
              The 2026 Manitou Beach<br /><em style={{ color: C.sunsetLight }}>Wine Trail Awards</em>
            </h2>
            <div style={{ margin: "0 0 24px" }}>
              <img src="/images/award-illustration.png" alt="" aria-hidden="true" style={{ width: "min(620px, 92vw)", opacity: 0.93 }} />
            </div>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sunsetLight, margin: "0 0 6px" }}>
              7 awards up for grabs
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", lineHeight: 1.85, maxWidth: 520, margin: "0 auto 36px" }}>
              100% people's choice — voted on by every visitor who stamps your stop on the trail.
            </p>
          </FadeIn>

          {/* How nominations work */}
          <FadeIn delay={150}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '24px 28px', maxWidth: 520, margin: '0 auto 44px', textAlign: 'left' }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>How it works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '🃏', text: 'A visitor gets a 4×6 passport card at your counter — grid on the back, one square per stop on the trail.' },
                  { icon: '⭐', text: 'They scan the QR code, pick their wine from the dropdown (or add a new one), and leave a star rating. Takes 30 seconds.' },
                  { icon: '✍️', text: 'You sign their card square. That\'s the stamp. They earn 10% off a bottle right now, on the spot — expires if they leave.' },
                  { icon: '📊', text: 'Ratings go live immediately. Season Standings update in real time — every vote moves the board.' },
                  { icon: '🌑', text: 'Scores go dark in the final 30 days. Nobody knows the winners until the awards ceremony.' },
                  { icon: '🏆', text: 'Winners receive a custom framed certificate — designed to hang on the wall. A 100% people\'s choice award.' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{row.icon}</span>
                    <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.52)', lineHeight: 1.7 }}>{row.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 420, margin: "0 auto 48px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {WINE_PARTNER_AWARDS.map((award, i) => (
              <FadeIn key={award} delay={i * 50}>
                <div style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: "rgba(255,255,255,0.72)", fontWeight: 400 }}>{award}</span>
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(255,255,255,0.25)" }}>people's choice</span>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={400}>
            <div style={{ background: "rgba(212,132,90,0.1)", border: "1px solid rgba(212,132,90,0.22)", borderRadius: 14, padding: "24px 32px", maxWidth: 500, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <img src="/images/yeti/yeti-camera.png" alt="The Yeti" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(212,132,90,0.3)" }} />
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: C.sunsetLight }}>A note from The Yeti</div>
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.85, margin: 0 }}>
                "These awards aren't handed down by some panel of snobs in a back room. They're earned by the people actually sitting at your counter — real patrons, honest opinions, publicly on record. That's what makes them worth hanging on your wall. I'll also be at the ceremony, which should tell you everything."
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.cream} flip />

      {/* ── PRICING ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>2026 Season</SectionLabel>
            <SectionTitle center>One rate. Everything included.</SectionTitle>
          </FadeIn>
          <FadeIn delay={80}>
            <div style={{ background: C.dusk, borderRadius: 20, padding: "44px 40px", border: `2px solid rgba(212,132,90,0.35)`, marginTop: 40 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 52, fontWeight: 700, color: C.cream, lineHeight: 1 }}>$279</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>for the season<br />May 22 – Oct 31, 2026</div>
              </div>
              <div style={{ fontSize: 12, color: C.sage, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 32 }}>
                Season starts earlier every year as the trail grows
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { icon: "📍", text: "Your venue on the interactive trail map" },
                  { icon: "📊", text: "Live community scorecard — Wine Quality, Service, Atmosphere, Value" },
                  { icon: "🎟️", text: "Stamp trail — guests collect a stamp at each stop and come back to finish the full trail" },
                  { icon: "⭐", text: "Verified public reviews, curated before publishing" },
                  { icon: "🃏", text: "100 printed 4×6 passport cards + counter display insert" },
                  { icon: "📬", text: "QR code setup, cards delivered to your door" },
                  { icon: "🏆", text: "Season-end framed certificate award — designed, printed, and delivered" },
                  { icon: "🌐", text: "Full venue listing on Manitou Beach year-round" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span className="mono-icon" style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 36 }}>
                <Btn href="#signup" variant="sunset" style={{ whiteSpace: "nowrap", width: "100%", textAlign: "center" }}>Join the 2026 Trail →</Btn>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />

      {/* ── SIGN UP ── */}
      <section id="signup" style={{ background: C.night, padding: "80px 24px 110px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light style={{ textAlign: "center", display: "block" }}>Get On the Trail</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 12px", lineHeight: 1.25, textAlign: "center" }}>
              Ready to be on the trail?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 44, textAlign: "center" }}>
              Fill in your details and you'll be taken to a secure checkout. Cards will be delivered before the season opens May 22.
            </p>
          </FadeIn>
          {joined ? (
            <FadeIn>
              <div style={{ textAlign: "center", padding: "60px 32px", background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.cream, marginBottom: 12 }}>You're on the trail.</div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 28px" }}>
                  Daryl will be in touch within a day or two to confirm your enrollment and coordinate delivery.
                </p>
                <Btn href="/wineries" variant="outline" style={{ whiteSpace: "nowrap" }}>See the Wine Trail →</Btn>
              </div>
            </FadeIn>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: "36px 32px" }}>
              <WinePartnerSignupSection />
              <WinePartnerReserveSection />
            </div>
          )}
          <FadeIn delay={300}>
            <p style={{ marginTop: 32, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.8, fontFamily: "'Libre Franklin', sans-serif" }}>
              Questions? <a href="mailto:admin@yetigroove.com?subject=Wine Trail" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Email Daryl directly →</a>
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
