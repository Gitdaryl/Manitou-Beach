import React, { useState } from 'react';
import { Btn, FadeIn, ScrollProgress, SectionLabel, SectionTitle, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';

const HOW_IT_WORKS = [
  { step: "01", title: "Sign up below", copy: "Tell us about your organization and event. Takes 30 seconds." },
  { step: "02", title: "Quick bank setup", copy: "You'll be taken to a secure Stripe form to enter your bank details. Money from ticket sales goes straight to your account." },
  { step: "03", title: "We set up your event", copy: "Daryl configures your event on manitoubeachmichigan.com — pricing, capacity, dates. Your 'Get Tickets' button goes live." },
];

const FEATURES = [
  { icon: "🎟️", title: "QR-Coded PDF Tickets", copy: "Every buyer receives a printable PDF ticket with a unique QR code and barcode — delivered instantly after purchase." },
  { icon: "📊", title: "Real-Time Capacity", copy: "Track how many tickets are sold vs. remaining. Your event page shows live availability — no overselling." },
  { icon: "📱", title: "Volunteer Check-In", copy: "Any volunteer with a phone can scan tickets at the door. No app to install — just open the check-in page and point the camera." },
  { icon: "🌐", title: "Featured on Your Community Site", copy: "Your event gets a listing with a 'Get Tickets' button — seen by the region's most engaged local audience." },
  { icon: "💰", title: "Direct Bank Deposit", copy: "Ticket revenue goes straight to your bank account. No waiting for payouts, no holding your money." },
  { icon: "📉", title: "Half the Fees", copy: "We charge a fraction of what Eventbrite charges. Your attendees see one clean price — no surprise fees at checkout." },
];

const PHONE_RISKS = [
  { icon: "🔒", title: "Card numbers over the phone are a liability", copy: "When someone reads you their Visa over the phone, you're now responsible for that number. One sticky note lost, one handwritten list misplaced — and you're the one explaining it." },
  { icon: "✅", title: "Online checkout protects everyone", copy: "Buyers enter their own card directly into Stripe's bank-grade system. It never touches your hands — or your organization's inbox." },
  { icon: "📋", title: "Every sale is automatically recorded", copy: "No spreadsheets, no callbacks, no 'I think I took that order.' Every ticket is logged instantly with the buyer's name and contact info." },
];

function SignupForm() {
  const [orgName, setOrgName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgName.trim() || !contactName.trim() || !email.trim()) {
      setError('Organization name, your name, and email are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/ticket-partner-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName: orgName.trim(), contactName: contactName.trim(), email: email.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      // Redirect to Stripe Express onboarding
      window.location.href = data.onboardingUrl;
    } catch (err) {
      setError(err.message || 'Something went wrong. Please email admin@yetigroove.com directly.');
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
            <label style={labelStyle}>Organization Name *</label>
            <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Rotary Club, Lake Association, ..." style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Your Name *</label>
            <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="First + last" style={fieldStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="best way to reach you" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" style={fieldStyle} />
          </div>
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
          {submitting ? 'One moment...' : 'Get Started — Tell Us Where to Send Your Money →'}
        </button>
        <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
          You'll be taken to a secure Stripe form to set up your bank details. No charge — this just tells us where to send your ticket revenue.
        </p>
      </form>
    </FadeIn>
  );
}

export default function TicketServicesPage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };
  const params = new URLSearchParams(window.location.search);
  const onboarded = params.get('onboarded') === '1';
  const refresh = params.get('refresh') === '1';
  const acct = params.get('acct') || '';
  const errorParam = params.get('error');

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: "hidden" }}>
      <GlobalStyles />
      <ScrollProgress />

      {/* Partner context strip */}
      <div style={{ background: C.night, borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "9px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'Libre Franklin', sans-serif" }}>Yetickets — Community event ticketing</span>
        <a href="/happening" style={{ fontSize: 12, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>See What's Happening →</a>
        <a href="/" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Libre Franklin', sans-serif", textDecoration: "none", whiteSpace: "nowrap" }}>Visit Homepage →</a>
      </div>

      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* ── HERO ── */}
      <section style={{ background: `linear-gradient(160deg, ${C.night} 0%, ${C.dusk} 55%, ${C.night} 100%)`, padding: "clamp(90px, 15vw, 160px) 24px clamp(60px, 10vw, 110px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(90,132,160,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
        <FadeIn>
          <img src="/images/yeti/yetickets_sign.png" alt="Yetickets" style={{ width: "100%", maxWidth: 520, objectFit: "contain", marginBottom: 32 }} />
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 400, color: C.cream, margin: "0 0 24px", lineHeight: 1.15 }}>
            Sell tickets.<br />Skip the middleman.<br /><em>Keep more money.</em>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.85 }}>
            QR-coded PDF tickets, real-time capacity tracking, and a volunteer check-in system — at half the cost of Eventbrite. Money goes directly to your bank account.
          </p>
          <Btn href="#signup" variant="sunset" style={{ whiteSpace: "nowrap" }}>
            Get Started →
          </Btn>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.28)", marginTop: 14 }}>
            No upfront cost · You only pay when tickets sell
          </div>
        </FadeIn>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.cream} />

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <img src="/images/yeti/yetickets_get_tickets.png" alt="Yetickets box office" style={{ width: 260, height: 260, objectFit: "contain" }} />
            </div>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>How It Works</SectionLabel>
            <SectionTitle center>Three steps. You're selling tickets in a day.</SectionTitle>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginTop: 48 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <FadeIn key={s.step} delay={i * 80}>
                <div style={{ background: C.warmWhite, borderRadius: 16, padding: "32px 28px", border: `1px solid ${C.sand}`, position: "relative", overflow: "hidden", height: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 56, fontWeight: 700, color: "rgba(90,132,160,0.1)", position: "absolute", top: 12, right: 18, lineHeight: 1, userSelect: "none" }}>{s.step}</div>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: 15, color: C.lakeBlue, marginBottom: 12, fontWeight: 600 }}>Step {s.step}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 12, lineHeight: 1.4 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.8 }}>{s.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />

      {/* ── THE SAFER WAY ── */}
      <section style={{ background: C.warmWhite, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 60, alignItems: "center" }}>
            <FadeIn>
              <div style={{ textAlign: "center" }}>
                <img
                  src="/images/yeti/yetickets_pci.png"
                  alt="Yetickets PCI compliance"
                  style={{ width: "100%", maxWidth: 380, objectFit: "contain", display: "block", margin: "0 auto" }}
                />
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <SectionLabel>The Safer Way</SectionLabel>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 400, color: C.text, margin: "16px 0 20px", lineHeight: 1.3 }}>
                Stop taking credit cards<br /><em>over the phone.</em>
              </h2>
              <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.9, marginBottom: 32 }}>
                Every event ends up with someone in the back fielding calls and jotting down card numbers on a notepad. It feels like good service — but it's a real liability for your organization. One lost note, one wrong charge, one unhappy member, and it's your problem to untangle.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {PHONE_RISKS.map((item, i) => (
                  <FadeIn key={item.title} delay={i * 70 + 150}>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      <div className="mono-icon" style={{ fontSize: 22, marginTop: 2, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, color: C.text, marginBottom: 6 }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.85 }}>{item.copy}</div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />

      {/* ── WHAT YOU GET ── */}
      <section style={{ background: C.cream, padding: "80px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel style={{ textAlign: "center", display: "block" }}>What You Get</SectionLabel>
            <SectionTitle center>Everything you need to sell tickets — nothing you don't.</SectionTitle>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 48 }}>
            {FEATURES.map((item, i) => (
              <FadeIn key={item.title} delay={i * 70}>
                <div style={{ background: C.cream, borderRadius: 14, padding: "28px 24px", border: `1px solid ${C.sand}`, borderTop: `3px solid ${C.lakeBlue}`, height: "100%", boxSizing: "border-box" }}>
                  <div className="mono-icon" style={{ fontSize: 28, marginBottom: 14 }}>{item.icon}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.text, marginBottom: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.textLight, lineHeight: 1.78 }}>{item.copy}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.dusk} />

      {/* ── PRICING ── */}
      <section style={{ background: C.dusk, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light>Pricing</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 20px", lineHeight: 1.2 }}>
              Half the cost.<br /><em style={{ color: C.sunsetLight }}>Seriously.</em>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.48)", lineHeight: 1.85, maxWidth: 480, margin: "0 auto 48px" }}>
              No monthly fees. No setup cost. You only pay a small percentage when you actually sell tickets.
            </p>
          </FadeIn>

          {/* Comparison */}
          <FadeIn delay={100}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, maxWidth: 560, margin: "0 auto 48px" }}>
              {/* Eventbrite */}
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "32px 28px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 16 }}>Eventbrite</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, fontWeight: 700, color: "rgba(255,255,255,0.35)", lineHeight: 1, marginBottom: 8 }}>~$2.34</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>per $25 ticket<br />6.2% + $0.79</div>
              </div>
              {/* Yetickets */}
              <div style={{ background: "rgba(90,132,160,0.12)", borderRadius: 16, padding: "32px 28px", border: `2px solid ${C.lakeBlue}`, transform: "scale(1.03)" }}>
                <div style={{ fontSize: 12, color: C.lakeBlue, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 16 }}>Yetickets</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, fontWeight: 700, color: C.cream, lineHeight: 1, marginBottom: 8 }}>~$1.34</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>per $25 ticket<br />Processing + 1.25%</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px 28px", maxWidth: 480, margin: "0 auto", textAlign: "left" }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>How it breaks down on a $25 ticket</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Your attendee pays", value: "$25.00", note: "Clean price, no surprises" },
                  { label: "Card processing (Stripe)", value: "−$1.03", note: "2.9% + $0.30 — industry standard" },
                  { label: "Platform fee (Yetickets)", value: "−$0.31", note: "1.25% — keeps the lights on" },
                  { label: "You receive", value: "$23.66", note: "Deposited directly to your bank", highlight: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <div>
                      <div style={{ fontSize: 14, color: row.highlight ? C.cream : "rgba(255,255,255,0.6)", fontWeight: row.highlight ? 700 : 400 }}>{row.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{row.note}</div>
                    </div>
                    <div style={{ fontSize: 15, color: row.highlight ? C.sage : "rgba(255,255,255,0.5)", fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", whiteSpace: "nowrap", marginLeft: 16 }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <WaveDivider topColor={C.dusk} bottomColor={C.night} />

      {/* ── SIGN UP ── */}
      <section id="signup" style={{ background: C.night, padding: "80px 24px clamp(60px, 10vw, 110px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel light style={{ textAlign: "center", display: "block" }}>Get Started</SectionLabel>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400, color: C.cream, margin: "16px 0 12px", lineHeight: 1.25, textAlign: "center" }}>
              Ready to sell tickets?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.42)", lineHeight: 1.85, marginBottom: 44, textAlign: "center" }}>
              Fill in your details — you'll be taken to a quick, secure bank setup. Then we'll configure your event and you're live.
            </p>
          </FadeIn>

          {onboarded ? (
            <FadeIn>
              <div style={{ textAlign: "center", padding: "60px 32px", background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.cream, marginBottom: 12 }}>You're all set.</div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 28px" }}>
                  Your bank account is connected. Daryl will reach out to set up your first event — usually within a day.
                </p>
                <Btn href="/happening" variant="outline" style={{ whiteSpace: "nowrap" }}>See What's Happening →</Btn>
              </div>
            </FadeIn>
          ) : refresh ? (
            <FadeIn>
              <div style={{ textAlign: "center", padding: "60px 32px", background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.cream, marginBottom: 12 }}>Almost there.</div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 28px" }}>
                  Your bank setup isn't quite finished. Click below to pick up where you left off.
                </p>
                <Btn href={`/api/stripe-connect-refresh?acct=${acct}`} variant="sunset" style={{ whiteSpace: "nowrap" }}>Finish Bank Setup →</Btn>
              </div>
            </FadeIn>
          ) : (
            <>
              {errorParam && (
                <FadeIn>
                  <div style={{ textAlign: "center", padding: "16px 24px", background: "rgba(224,112,112,0.12)", borderRadius: 12, border: "1px solid rgba(224,112,112,0.25)", marginBottom: 24 }}>
                    <div style={{ fontSize: 14, color: "#e07070", fontFamily: "'Libre Franklin', sans-serif" }}>
                      Something went wrong with the bank setup. Please try again below, or <a href="mailto:admin@yetigroove.com" style={{ color: "#e07070" }}>email Daryl</a>.
                    </div>
                  </div>
                </FadeIn>
              )}
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", padding: "36px clamp(16px, 5vw, 32px)" }}>
                <SignupForm />
              </div>
            </>
          )}

          <FadeIn delay={300}>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <a href="/partner-intake" style={{
                display: 'inline-block', padding: '10px 22px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)',
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, textDecoration: 'none',
                letterSpacing: 0.5,
              }}>
                Not sure where to start? Fill out a quick intake form →
              </a>
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.8, fontFamily: "'Libre Franklin', sans-serif" }}>
              Questions? <a href="mailto:admin@yetigroove.com?subject=Ticketing" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Email Daryl directly →</a>
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
