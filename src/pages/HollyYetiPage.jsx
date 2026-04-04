import React, { useState, useEffect } from 'react';
import { ShareBar, SectionLabel, SectionTitle, FadeIn, WaveDivider, PageSponsorBanner, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, NewsletterInline, PromoBanner } from '../components/Layout';
import { C } from '../data/config';

const HOLLY_CORNER_COLOR = '#C06FA0';

const SOCIALS = [
  { platform: 'YouTube', icon: '▶', href: 'https://www.youtube.com/@HollyandtheYetipodcast', color: '#FF4444' },
  { platform: 'Facebook', icon: 'f', href: 'https://www.facebook.com/HollyandtheYeti', color: '#4A90D9' },
  { platform: 'Instagram', icon: '◎', href: 'https://www.instagram.com/hollyandtheyeti', color: '#C45FA0' },
];

// ── Hero ────────────────────────────────────────────────────
function HYHero() {
  return (
    <section style={{
      background: `linear-gradient(135deg, ${C.night} 0%, ${C.dusk} 50%, #2A1F3D 100%)`,
      padding: '180px 24px 120px',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Subtle glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${HOLLY_CORNER_COLOR}12 0%, transparent 60%)` }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
        <img src="/images/yeti/yeti-influencer.png" alt="" style={{ height: 120, marginBottom: 20, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }} />
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(38px, 7vw, 60px)', fontWeight: 400, color: C.cream, margin: '0 0 16px', lineHeight: 1.1 }}>
          Holly & The Yeti
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px', fontFamily: "'Libre Franklin', sans-serif" }}>
          A realtor. A cryptid. A podcast.<br />Sometimes he appears as Daryl - most people still call him Yeti.
        </p>

        {/* Social links */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          {SOCIALS.map(s => (
            <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" style={{
              width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${s.color}20`, border: `1px solid ${s.color}40`, color: s.color,
              fontSize: 18, textDecoration: 'none', transition: 'all 0.2s',
            }} onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = '#fff'; }}
               onMouseLeave={e => { e.currentTarget.style.background = `${s.color}20`; e.currentTarget.style.color = s.color; }}>
              {s.icon}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn href="/" variant="outlineLight" small>← Back to Home</Btn>
          <ShareBar />
        </div>
      </div>
    </section>
  );
}

// ── Meet the Hosts ──────────────────────────────────────────
function MeetTheHosts() {
  const hosts = [
    {
      name: 'Holly Griewahn',
      role: 'Real Estate Expert · Co-Host',
      image: '/images/holly_logo.jpg',
      accent: C.sunset,
      bio: "Holly knows every street, every lake lot, and every neighbor's dog by name. A straight-shooting realtor with Foundation Realty who's been selling lakefront dreams for decades - and the voice of reason when The Yeti gets too creative.",
      traits: ['Lakefront Expert', 'Community Builder', 'Voice of Reason'],
    },
    {
      name: 'Daryl AKA The Yeti',
      role: 'Creator · Filmmaker · Co-Host',
      image: '/images/yeti/yeti-director.png',
      accent: HOLLY_CORNER_COLOR,
      bio: "An AI-generated, Australian-accented cryptid who wandered out of the woods and into a podcast. The Yeti brings the comedy, the unexpected camera angles, and the community stories that make Manitou Beach feel like the place it actually is.",
      traits: ['Filmmaker', 'Storyteller', 'Professional Cryptid'],
    },
  ];

  return (
    <section style={{ padding: '80px 24px', background: C.cream }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SectionLabel>The Show</SectionLabel>
        <SectionTitle>Meet Your Hosts</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28, marginTop: 32 }}>
          {hosts.map((h, i) => (
            <FadeIn key={h.name} delay={i * 120} direction={i === 0 ? 'left' : 'right'}>
              <div style={{
                background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 20,
                padding: 32, textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: h.accent }} />
                <img src={h.image} alt={h.name} style={{
                  width: 140, height: 140, borderRadius: '50%', objectFit: 'cover',
                  border: `3px solid ${h.accent}30`, margin: '0 auto 16px',
                }} />
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.text, margin: '0 0 4px' }}>{h.name}</h3>
                <div style={{ fontSize: 11, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: h.accent, marginBottom: 14 }}>{h.role}</div>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, marginBottom: 16 }}>{h.bio}</p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {h.traits.map(t => (
                    <span key={t} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, background: `${h.accent}12`, color: h.accent, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", letterSpacing: 0.5 }}>{t}</span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Latest Videos ───────────────────────────────────────────
function LatestVideos() {
  const [videos, setVideos] = useState([]);
  const [lightboxId, setLightboxId] = useState(null);

  useEffect(() => {
    fetch('/api/youtube')
      .then(r => r.json())
      .then(d => setVideos((d.videos || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  // Close lightbox on ESC
  useEffect(() => {
    if (!lightboxId) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightboxId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxId]);

  if (!videos.length) return null;

  return (
    <section style={{ padding: '80px 24px', background: C.warmWhite }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SectionLabel>Latest from the Show</SectionLabel>
        <SectionTitle>Watch Holly & The Yeti</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 28 }}>
          {videos.map((v, i) => (
            <FadeIn key={v.videoId} delay={i * 80}>
              <div style={{
                background: C.cream, border: `1px solid ${C.sand}`, borderRadius: 14,
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s',
              }}
              onClick={() => setLightboxId(v.videoId)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={v.thumbnail} alt={v.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.22)', transition: 'background 0.2s',
                  }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>▶</div>
                  </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h4 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 400, color: C.text, margin: 0, lineHeight: 1.4 }}>{v.title}</h4>
                  {v.publishedAt && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontFamily: "'Libre Franklin', sans-serif" }}>{v.publishedAt}</div>}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Btn href="https://www.youtube.com/@HollyandtheYetipodcast" variant="outlineLight" small target="_blank" rel="noopener noreferrer" style={{ color: C.text, borderColor: C.sand }}>
            See All on YouTube →
          </Btn>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxId && (
        <div
          onClick={() => setLightboxId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 900 }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 14, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
              <iframe
                src={`https://www.youtube.com/embed/${lightboxId}?autoplay=1`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <button
              onClick={() => setLightboxId(null)}
              style={{
                display: 'block', margin: '16px auto 0', background: 'none',
                border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.5)',
                padding: '8px 24px', borderRadius: 8, cursor: 'pointer',
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, letterSpacing: 1,
              }}
            >Close</button>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Book Holly & Yeti ───────────────────────────────────────
function BookSection() {
  const services = [
    {
      name: 'Holly & Yeti Spotlight',
      price: '$179',
      detail: '30 Days',
      desc: 'Holly and The Yeti make a short video about your event or business. Lives on the site for 30 days.',
      icon: '🎬',
      href: '/promote',
    },
    {
      name: 'Holly & Yeti Feature',
      price: '$179',
      detail: 'Video · 30 Days',
      desc: 'Holly and The Yeti create a short video about your business. Lives on the site for 30 days and shared on social.',
      icon: '📣',
      href: '/advertise',
    },
  ];

  return (
    <section style={{ padding: '80px 24px', background: `linear-gradient(135deg, ${C.dusk}, ${C.night})` }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel style={{ color: C.sunset }}>Services</SectionLabel>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>Put Us to Work</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
          Want Holly and The Yeti to spotlight your business or event? We'll make you look good.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {services.map((s, i) => (
            <FadeIn key={s.name} delay={i * 100}>
              <div style={{
                background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.1)`,
                borderRadius: 18, padding: '36px 28px', position: 'relative', overflow: 'hidden',
              }}>
                <div className="mono-icon" style={{ fontSize: 40, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 400, color: C.cream, margin: '0 0 8px' }}>{s.name}</h3>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: C.sunset, fontFamily: "'Libre Franklin', sans-serif" }}>{s.price}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif" }}>{s.detail}</span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 20 }}>{s.desc}</p>
                <Btn href={s.href} variant="sunset" small>Get Started →</Btn>
              </div>
            </FadeIn>
          ))}
        </div>

        <img src="/images/yeti/yeti-camera.png" alt="" style={{ height: 80, marginTop: 32, opacity: 0.3, filter: 'brightness(2)' }} />
      </div>
    </section>
  );
}

// ── Holly's Corner Articles ─────────────────────────────────
function HollysCorner() {
  const [articles, setArticles] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/dispatch-articles')
      .then(r => r.json())
      .then(d => {
        const hollys = (d.articles || []).filter(a => a.category === "Holly's Corner").slice(0, 3);
        setArticles(hollys);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section style={{ padding: '80px 24px', background: C.cream }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <SectionLabel style={{ color: HOLLY_CORNER_COLOR }}>From the Desk of Holly</SectionLabel>
        <SectionTitle>Holly's Corner</SectionTitle>

        {!loaded ? (
          <p style={{ textAlign: 'center', color: C.textMuted }}>Loading...</p>
        ) : articles.length === 0 ? (
          <FadeIn>
            <div style={{ textAlign: 'center', padding: '48px 24px', background: C.warmWhite, borderRadius: 18, border: `1px solid ${C.sand}` }}>
              <img src="/images/yeti/yeti-painting.png" alt="" style={{ height: 80, marginBottom: 16, opacity: 0.6 }} />
              <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text, margin: '0 0 8px' }}>Coming Soon</h3>
              <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>
                Holly's first column drops this season. Real estate tips, lake life stories, and the kind of local insight you can't Google.
              </p>
              <Btn href="/dispatch" variant="primary" small style={{ marginTop: 16 }}>Read The Dispatch →</Btn>
            </div>
          </FadeIn>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
            {articles.map((a, i) => (
              <FadeIn key={a.slug || i} delay={i * 80}>
                <a href={`/dispatch/${a.slug}`} style={{
                  display: 'flex', gap: 20, alignItems: 'center',
                  background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 14,
                  padding: 20, textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {a.coverImage && <img src={a.coverImage} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
                  <div>
                    <h4 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 400, color: C.text, margin: '0 0 4px' }}>{a.title}</h4>
                    {a.excerpt && <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.5, margin: 0 }}>{a.excerpt}</p>}
                    {a.date && <div style={{ fontSize: 11, color: HOLLY_CORNER_COLOR, marginTop: 6, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>{a.date}</div>}
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function HollyYetiPage() {
  return (
    <>
      <GlobalStyles />
      <PromoBanner />
      <Navbar />
      <HYHero />
      <MeetTheHosts />
      <WaveDivider />
      <LatestVideos />
      <BookSection />
      <HollysCorner />
      <PageSponsorBanner pageName="holly-yeti" />
      <NewsletterInline />
      <Footer />
    </>
  );
}
