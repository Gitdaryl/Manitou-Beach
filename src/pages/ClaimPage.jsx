import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { C } from '../data/config';
import yeti from '../data/errorMessages';

const CLAIM_BUSINESSES = {
  cafe: {
    name: 'Blackbird Cafe & Baking Company',
    offerText: 'free cookie',
    descLine: 'A welcome gift from The Manitou Dispatch',
    emoji: '☕',
    accentColor: '#D4845A',
    reviewUrl: 'https://www.yelp.com/writeareview/biz/BV2J5pWMspuXAU78MeQo_A?return_url=%2Fbiz%2FBV2J5pWMspuXAU78MeQo_A&review_origin=biz-details-war-button',
  },
};

export default function ClaimPage() {
  const { slug } = useParams();
  const biz = CLAIM_BUSINESSES[slug];

  const [step, setStep] = useState('form'); // form | confirm | rate | done
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [notionId, setNotionId] = useState(null);
  const [claimCode, setClaimCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Restore previous claim from localStorage (so code survives tab close)
  useEffect(() => {
    const saved = localStorage.getItem(`claim_${slug}`);
    if (saved) {
      try {
        const { notionId: nid, claimCode: cc, name: n } = JSON.parse(saved);
        if (nid && cc) {
          setNotionId(nid);
          setClaimCode(cc);
          if (n) setName(n);
          setStep('confirm');
          return;
        }
      } catch {}
    }
    // Pre-fill from beehiiv URL params: /claim/cafe?email=...&name=...
    const p = new URLSearchParams(window.location.search);
    if (p.get('email')) setEmail(decodeURIComponent(p.get('email')));
    if (p.get('name'))  setName(decodeURIComponent(p.get('name')));
  }, [slug]);

  const handleClaim = async () => {
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setNotionId(data.notionId);
      setClaimCode(data.claimCode);
      localStorage.setItem(`claim_${slug}`, JSON.stringify({ notionId: data.notionId, claimCode: data.claimCode, name: name.trim() }));
      setStep('confirm');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRate = (n) => {
    setRating(n);
    // Save rating immediately for 4-5 (they may not tap Google Review button)
    if (n >= 4 && notionId) {
      fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId, rating: n }),
      }).catch(() => {});
    }
  };

  const handleReviewClick = () => {
    if (notionId) {
      fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId, rating, googleClicked: true }),
      }).catch(() => {});
    }
    window.open(biz.reviewUrl, '_blank');
  };

  const handleFeedbackSubmit = () => {
    if (notionId) {
      fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId, rating, feedback: feedback.trim() }),
      }).catch(() => {});
    }
    setStep('done');
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    border: `1px solid ${C.sand}`, fontSize: 16, color: C.text,
    fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600, color: C.dusk,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
  };

  if (!biz) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <p style={{ color: C.textLight }}>Hmm, can't find that offer. It may have already been claimed!</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Libre Franklin', sans-serif" }}>
{/* Header */}
      <div style={{ background: C.dusk, padding: '14px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.sage }}>The Manitou Dispatch</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>× {biz.name}</div>
      </div>

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* ── STEP: FORM ───────────────────────────────── */}
        {step === 'form' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>{biz.emoji}</div>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, margin: '0 0 8px', lineHeight: 1.3 }}>
                Your {biz.offerText} is waiting
              </h1>
              <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{biz.descLine}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Your Name</label>
                <input style={inputStyle} placeholder="First name is fine" value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" />
              </div>
              {error && <p style={{ color: C.sunset, fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
              <button
                onClick={handleClaim}
                disabled={submitting || !name.trim() || !email.trim()}
                style={{
                  width: '100%', padding: '14px', borderRadius: 8, border: 'none',
                  background: submitting || !name.trim() || !email.trim() ? C.driftwood : biz.accentColor,
                  color: '#fff', fontSize: 16, fontWeight: 700,
                  cursor: submitting || !name.trim() || !email.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background 0.15s',
                }}
              >{submitting ? 'Just a sec…' : `Claim My ${biz.offerText.replace(/^./, c => c.toUpperCase())} →`}</button>
              <p style={{ textAlign: 'center', fontSize: 11, color: C.textMuted, marginTop: 12, lineHeight: 1.5 }}>
                One per person · Manitou Dispatch subscribers only
              </p>
            </div>
          </div>
        )}

        {/* ── STEP: CONFIRMATION ───────────────────────── */}
        {step === 'confirm' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, margin: '0 0 8px' }}>
              You're all set, {name.split(' ')[0]}!
            </h1>
            <p style={{ color: C.textLight, fontSize: 15, marginBottom: 28 }}>Show this screen to your barista at {biz.name}</p>
            <div style={{ background: C.dusk, borderRadius: 14, padding: '24px 32px', marginBottom: 28, display: 'inline-block', minWidth: 220 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>Claim Code</div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, color: '#fff', letterSpacing: '0.1em', fontWeight: 700 }}>{claimCode}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{biz.offerText} · one use</div>
            </div>
            <div style={{ margin: '0 auto 20px', padding: '16px 20px', background: '#fdf9f3', border: `1px solid ${C.sand}`, borderRadius: 12, display: 'inline-block' }}>
              <QRCode value={window.location.href} size={160} />
              <p style={{ margin: '10px 0 0', fontSize: 12, color: C.textMuted, textAlign: 'center', fontFamily: 'Libre Franklin, sans-serif' }}>Barista: scan to see full screen →</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
              <p style={{ margin: '0 0 16px', color: C.text, fontSize: 15, lineHeight: 1.5 }}>
                Enjoy your {biz.offerText}! Once you've got it, take 10 seconds to rate your visit:
              </p>
              <button
                onClick={() => setStep('rate')}
                style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: biz.accentColor, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
              >Rate My Visit ★</button>
            </div>
          </div>
        )}

        {/* ── STEP: RATE ───────────────────────────────── */}
        {step === 'rate' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.dusk, margin: '0 0 8px' }}>
              How was it at {biz.name}?
            </h2>
            <p style={{ color: C.textLight, fontSize: 14, marginBottom: 32 }}>Tap a star</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  onClick={() => handleRate(n)}
                  style={{
                    width: 54, height: 54, borderRadius: 12, border: 'none',
                    background: n <= rating ? '#FFF3E0' : C.warmWhite,
                    cursor: 'pointer', fontSize: 30,
                    color: n <= rating ? '#F5A623' : '#CCC',
                    transition: 'all 0.12s',
                  }}
                >★</button>
              ))}
            </div>

            {/* Low rating - private feedback */}
            {rating > 0 && rating <= 3 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', textAlign: 'left' }}>
                <p style={{ color: C.dusk, fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Sorry to hear that.</p>
                <p style={{ color: C.textLight, fontSize: 13, marginBottom: 14, lineHeight: 1.5 }}>
                  Tell {biz.name} directly - they want to make it right.
                </p>
                <textarea
                  style={{ ...inputStyle, fontSize: 14, minHeight: 80, resize: 'vertical' }}
                  placeholder="What could have been better?"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
                <button
                  onClick={handleFeedbackSubmit}
                  style={{ marginTop: 12, width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: C.dusk, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >Send Feedback</button>
              </div>
            )}

            {/* High rating - Yelp Review */}
            {rating >= 4 && (
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <p style={{ color: C.dusk, fontWeight: 700, marginBottom: 6, fontSize: 17 }}>Love it! 🙌</p>
                <p style={{ color: C.textLight, fontSize: 14, marginBottom: 18, lineHeight: 1.6 }}>
                  A Yelp review means everything to a small local business. Takes 30 seconds.
                </p>
                <button
                  onClick={handleReviewClick}
                  style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: '#D32323', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                >Leave a Yelp Review →</button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: DONE (after private feedback) ─────── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, margin: '0 0 12px' }}>
              Thanks for the feedback
            </h2>
            <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 28px' }}>
              {biz.name} will see your message and do better next time. That's how good places get great.
            </p>
            <a href="/" style={{ fontSize: 14, color: C.lakeBlue, textDecoration: 'none' }}>← Back to The Dispatch</a>
          </div>
        )}

      </div>

      <div style={{ textAlign: 'center', padding: '20px', borderTop: `1px solid ${C.sand}` }}>
        <div style={{ fontSize: 11, color: C.textMuted }}>The Manitou Dispatch · Manitou Beach, Michigan</div>
      </div>
    </div>
  );
}
