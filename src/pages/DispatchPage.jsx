import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FadeIn, PageSponsorBanner, ScrollProgress, SectionLabel, SectionTitle, ShareBar, WaveDivider } from '../components/Shared';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles, NewsletterInline, CATEGORY_COLORS } from '../components/Layout';
import { useDispatchAds, pickAd, DISPATCH_CARD_SPONSORS, DISPATCH_CATEGORIES } from '../App';


export function DispatchArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle'); // idle | loading | success | exists | error
  const [moreArticles, setMoreArticles] = useState([]);
  const adSlots = useDispatchAds('dispatch-article');
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  const handleInlineSub = async (e) => {
    e.preventDefault();
    if (!subEmail || subStatus === 'loading') return;
    setSubStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSubStatus(data.alreadySubscribed ? 'exists' : 'success');
    } catch {
      setSubStatus('error');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/dispatch-articles?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { setArticle(d.article || null); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/dispatch-articles')
      .then(r => r.json())
      .then(d => setMoreArticles((d.articles || []).filter(a => a.slug !== slug).slice(0, 3)))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    const prevTitle = document.title;
    document.title = `${article.title} — The Manitou Dispatch`;
    const setMeta = (attr, name, content) => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', `${article.title} — The Manitou Dispatch`);
    setMeta('property', 'og:description', article.excerpt || 'Lake life, local news, and a little Yeti wisdom from Manitou Beach.');
    setMeta('property', 'og:type', 'article');
    if (article.coverImage) setMeta('property', 'og:image', article.coverImage);
    setMeta('name', 'description', article.excerpt || 'Lake life, local news, and a little Yeti wisdom from Manitou Beach.');
    return () => { document.title = prevTitle; };
  }, [article]);

  const formatDate = (str) => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      <div style={{ paddingTop: 80, minHeight: '100vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: C.sage }}>Loading…</div>
        ) : !article ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ marginBottom: 20, color: '#888' }}>Article not found.</p>
            <button onClick={() => navigate('/dispatch')} style={{ background: C.sage, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 15 }}>← Back to Dispatch</button>
          </div>
        ) : (
          <>
            {article.coverImage && (
              <div style={{ width: '100%', maxHeight: 420, overflow: 'hidden', position: 'relative' }}>
                <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
                {article.photoCredit && (
                  <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em' }}>
                    <a href={article.photoCredit.photographerUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                      {article.photoCredit.text}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard ad — below hero, above article */}
            <AdSlot ads={adSlots['leaderboard']} variant="leaderboard" />

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
              <button
                onClick={() => navigate('/dispatch')}
                style={{ background: 'transparent', border: `1px solid ${C.sage}`, color: C.sage, borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontSize: 13, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                ← The Dispatch
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{ background: CATEGORY_COLORS[article.category] || C.lakeBlue, color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {article.category}
                </span>
                {article.tags.map(tag => (
                  <span key={tag} style={{ background: C.warmWhite, color: C.sage, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 500 }}>#{tag}</span>
                ))}
              </div>

              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 700, color: C.dusk, lineHeight: 1.25, marginBottom: 16 }}>
                {article.title}
              </h1>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: '#888', fontSize: 14, marginBottom: 36, flexWrap: 'wrap' }}>
                <span>By <strong style={{ color: C.text }}>{article.author}</strong></span>
                {article.publishedDate && <span>{formatDate(article.publishedDate)}</span>}
              </div>

              {article.excerpt && (
                <p style={{ fontSize: 19, fontStyle: 'italic', color: '#5a5a5a', borderLeft: `4px solid ${C.lakeBlue}`, paddingLeft: 20, marginBottom: 36, lineHeight: 1.6 }}>
                  {article.excerpt}
                </p>
              )}

              {/* Article content — split at block 4 for mid-article ad injection */}
              {(() => {
                const content = article.content || [];
                const splitAt = Math.min(4, Math.floor(content.length / 2));
                const top = content.slice(0, splitAt);
                const bottom = content.slice(splitAt);
                return (
                  <>
                    <DispatchArticleContent content={top} />
                    <AdSlot ads={adSlots['mid-article']} variant="mid-article" />
                    <DispatchArticleContent content={bottom} />
                  </>
                );
              })()}

              {/* Yeti Desk sign-off */}
              <div style={{ margin: '56px 0 40px', borderTop: `2px solid ${C.sand}`, paddingTop: 36 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <img
                    src="/images/yeti/yeti-camera.png"
                    alt="The Yeti"
                    onError={e => { e.target.style.display = 'none'; }}
                    style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sage, marginBottom: 4 }}>
                      {article.aiGenerated ? 'The Yeti Desk' : 'Editor\'s Note · The Yeti Desk'}
                    </div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, fontWeight: 700, color: C.dusk, marginBottom: article.editorNote ? 10 : 0 }}>
                      {article.aiGenerated ? `Written by The Yeti` : `By ${article.author}`}
                    </div>
                    {article.editorNote && (
                      <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                        {article.editorNote}
                      </p>
                    )}
                    <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>
                      Holly &amp; The Yeti · Devils Lake, Michigan
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer-strip ad — between sign-off and subscribe form */}
              <AdSlot ads={adSlots['footer-strip']} variant="footer-strip" />

              {/* More from The Dispatch */}
              {moreArticles.length > 0 && (
                <div style={{ margin: '52px 0 40px' }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.dusk, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.sand}` }}>More from The Dispatch</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {moreArticles.map(a => (
                      <a key={a.id} href={`/dispatch/${a.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)'; }}
                      >
                        {a.coverImage ? (
                          <img src={a.coverImage} alt={a.title} style={{ width: 84, height: 62, objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 84, height: 62, background: `url(/images/dispatch-header-web.jpg) center/cover`, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, background: `${C.dusk}99` }} />
                          </div>
                        )}
                        <div style={{ padding: '10px 14px 10px 0', flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 10, color: CATEGORY_COLORS[a.category] || C.lakeBlue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{a.category}</div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: C.dusk, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.title}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 40, padding: '36px 32px', background: C.night, borderRadius: 14, textAlign: 'center' }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.warmWhite, marginBottom: 8 }}>Enjoying The Dispatch?</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 }}>Get lake life news, local tips, and a little Yeti wisdom delivered to your inbox.</p>
                <ShareBar title={article.title} />
                <div style={{ height: 24 }} />
                {subStatus === 'success' ? (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📬</div>
                    <p style={{ color: C.warmWhite, fontWeight: 600, marginBottom: 6, fontFamily: "'Libre Franklin', sans-serif" }}>Check your inbox!</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>Click the confirmation link to complete sign-up. Check spam if you don't see it.</p>
                    <a href="/dispatch" style={{ display: 'inline-block', marginTop: 18, fontSize: 14, color: C.lakeBlue, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>← Back to The Dispatch</a>
                  </div>
                ) : subStatus === 'exists' ? (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>👋</div>
                    <p style={{ color: C.warmWhite, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}>You're already on the list — next issue incoming!</p>
                    <a href="/dispatch" style={{ display: 'inline-block', marginTop: 16, fontSize: 14, color: C.lakeBlue, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none' }}>← Back to The Dispatch</a>
                  </div>
                ) : (
                  <form onSubmit={handleInlineSub} style={{ display: 'flex', gap: 10, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={subEmail}
                      onChange={e => setSubEmail(e.target.value)}
                      required
                      disabled={subStatus === 'loading'}
                      style={{
                        flex: 1, minWidth: 200, padding: '12px 18px', borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.08)', color: C.warmWhite,
                        fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={subStatus === 'loading'}
                      style={{ background: C.sunset, color: '#fff', border: 'none', borderRadius: 6, padding: '12px 24px', cursor: subStatus === 'loading' ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}
                    >
                      {subStatus === 'loading' ? 'Joining…' : 'Subscribe Free'}
                    </button>
                    {subStatus === 'error' && <p style={{ width: '100%', color: '#ff9f9f', fontSize: 13, marginTop: 4 }}>Something went wrong — try again.</p>}
                  </form>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}


// ============================================================
export function DispatchPreviewSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dispatch-articles')
      .then(r => r.json())
      .then(d => { setArticles((d.articles || []).slice(0, 3)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && articles.length === 0) return null;

  const formatDate = (str) => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <section style={{ background: C.cream, padding: '56px 24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <SectionLabel>Latest Stories</SectionLabel>
            <SectionTitle>The Manitou Dispatch</SectionTitle>
          </div>
          <a href="/dispatch" style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.lakeBlue, textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Read all stories →
          </a>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, height: 280, opacity: 0.35 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {articles.map((article, idx) => (
              <FadeIn key={article.id}>
                <a
                  href={`/dispatch/${article.slug}`}
                  style={{ textDecoration: 'none', display: 'block', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.07)'; }}
                >
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 180, background: 'url(/images/dispatch-header-web.jpg) center/cover', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.dusk}cc, ${C.lakeBlue}99)` }} />
                      <span style={{ position: 'absolute', bottom: 12, left: 16, fontFamily: "'Caveat', cursive", fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>The Dispatch</span>
                    </div>
                  )}
                  <div style={{ padding: '18px 20px 22px' }}>
                    <span style={{ background: CATEGORY_COLORS[article.category] || C.lakeBlue, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {article.category}
                    </span>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: C.dusk, margin: '10px 0 6px', lineHeight: 1.3 }}>
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                        {article.excerpt.length > 90 ? article.excerpt.slice(0, 90) + '…' : article.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#999', borderTop: `1px solid ${C.sand}`, paddingTop: 10, marginTop: 10 }}>
                      <span>{article.author}{article.publishedDate && ` · ${formatDate(article.publishedDate)}`}</span>
                      <span style={{ color: C.lakeBlue, fontWeight: 600, fontSize: 12 }}>Read story →</span>
                    </div>
                  </div>
                  <SponsorStrip index={idx} />
                </a>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SponsorStrip({ index = 0 }) {
  return null; // Sponsor strips handled inline by dispatch ads
}

export default function DispatchPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const adSlots = useDispatchAds('dispatch-listing');
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/dispatch-articles')
      .then(r => { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then(d => { setArticles(d.articles || []); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, []);

  const formatDate = (str) => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Libre+Franklin:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <GlobalStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        backgroundImage: 'url(/images/dispatch-header-web.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        minHeight: 380,
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,18,24,0.3) 0%, rgba(10,18,24,0.75) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '48px 32px', maxWidth: 800, width: '100%', margin: '0 auto' }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 16, color: C.sunset, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Holly & The Yeti present</div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
            The Manitou Dispatch
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 18, margin: 0, fontStyle: 'italic' }}>
            Lake life, local news, and a little Yeti wisdom
          </p>
        </div>
      </section>

      <WaveDivider topColor={C.night} bottomColor={C.cream} flip />

      {/* Listing banner ad — below hero wave, above article grid */}
      <AdSlot ads={adSlots['listing-banner']} variant="listing-banner" />

      {/* Articles Grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px 80px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: C.sage }}>Loading the latest…</div>
        ) : fetchError ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: C.sunset, marginBottom: 8 }}>Something went sideways.</p>
            <p style={{ color: '#888', fontSize: 15 }}>Couldn't load the articles right now — try refreshing in a moment.</p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: 26, color: C.sage, marginBottom: 8 }}>First issue coming soon.</p>
            <p style={{ color: '#888', fontSize: 15 }}>Subscribe below to be the first to get it.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 32 }}>
            {articles.map((article, idx) => (
              <FadeIn key={article.id}>
                <div
                  onClick={() => navigate(`/dispatch/${article.slug}`)}
                  style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)'; }}
                >
                  {article.coverImage ? (
                    <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 200, background: 'url(/images/dispatch-header-web.jpg) center/cover', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.dusk}cc, ${C.lakeBlue}99)` }} />
                      <span style={{ position: 'absolute', bottom: 14, left: 18, fontFamily: "'Caveat', cursive", fontSize: 28, color: 'rgba(255,255,255,0.75)' }}>The Dispatch</span>
                    </div>
                  )}
                  <div style={{ padding: '20px 22px 24px' }}>
                    <span style={{ background: CATEGORY_COLORS[article.category] || C.lakeBlue, color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {article.category}
                    </span>
                    <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: C.dusk, margin: '12px 0 8px', lineHeight: 1.3 }}>
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, margin: '0 0 14px' }}>
                        {article.excerpt.length > 120 ? article.excerpt.slice(0, 120) + '…' : article.excerpt}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#999', borderTop: `1px solid ${C.sand}`, paddingTop: 10, marginTop: 4 }}>
                      <span>{article.author}{article.publishedDate && ` · ${formatDate(article.publishedDate)}`}</span>
                      <span style={{ color: C.lakeBlue, fontWeight: 600 }}>Read story →</span>
                    </div>
                  </div>
                  <SponsorStrip index={idx} />
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      <WaveDivider topColor={C.cream} bottomColor={C.night} />
      <NewsletterInline />
      <WaveDivider topColor={C.night} bottomColor={C.dusk} />
      <PageSponsorBanner pageName="dispatch" />
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
