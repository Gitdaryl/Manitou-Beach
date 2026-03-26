import React, { useState } from 'react';
import { Btn, FadeIn, SectionLabel } from '../components/Shared';
import { C } from '../data/config';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { WINERY_VENUES } from './WineriesPage';
import yeti from '../data/errorMessages';

const RATE_VENUES = (WINERY_VENUES || []).filter(v => v.section !== 'extended').map(v => v.name);

export default function RatePage() {
  const subScrollTo = (id) => { window.location.href = "/#" + id; };

  // Pre-select venue from ?venue= param
  const params = new URLSearchParams(window.location.search);
  const preVenue = params.get('venue') || '';

  const [venue, setVenue] = useState(preVenue);
  const [wines, setWines] = useState(['', '', '']);
  const [rating, setRating] = useState(0);
  const [service, setService] = useState(0);
  const [atmosphere, setAtmosphere] = useState(0);
  const [rateValue, setRateValue] = useState(0);
  const [note, setNote] = useState('');
  const [quote, setQuote] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const addWine = () => { if (wines.length < 6) setWines(w => [...w, '']); };
  const updateWine = (i, v) => setWines(w => w.map((x, idx) => idx === i ? v : x));
  const removeWine = (i) => { if (wines.length > 1) setWines(w => w.filter((_, idx) => idx !== i)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!venue) { setError('Please select a venue.'); return; }
    if (!rating) { setError('Wine Quality rating is required.'); return; }
    const filledWines = wines.map(w => w.trim()).filter(Boolean);
    if (filledWines.length === 0) { setError('Please tell us at least one wine or pour you tried.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const wineTried = filledWines.join(' · ');
      const noteText = [note.trim(), visitorName.trim() ? `— ${visitorName.trim()}` : ''].filter(Boolean).join(' ');
      const res = await fetch('/api/winery-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue, rating,
          service:    service    || undefined,
          atmosphere: atmosphere || undefined,
          value:      rateValue  || undefined,
          wineTried,
          note: noteText,
          quote: quote.trim() || undefined,
          sessionId: getWineSessionId(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError(yeti.oops());
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
    letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 8,
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
<GlobalStyles />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, ${C.dusk} 0%, #1a2a35 50%, ${C.night} 100%)`,
        padding: '140px 24px 80px',
        textAlign: 'center',
      }}>
        <FadeIn>
          <SectionLabel light>Manitou Beach Wine Trail</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400, color: C.cream, lineHeight: 1.1, margin: '0 0 16px 0' }}>
            Rate Your Visit
          </h1>
          <p style={{ fontSize: 'clamp(14px, 1.5vw, 17px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 500, margin: '0 auto' }}>
            Honest reviews help the whole trail. Takes two minutes.
          </p>
        </FadeIn>
      </section>

      {/* Form */}
      <section style={{ padding: '60px 24px 80px', background: C.cream }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {submitted ? (
            <FadeIn>
              <div style={{ textAlign: 'center', padding: '60px 32px', background: C.warmWhite, borderRadius: 20, border: `1px solid ${C.sand}` }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, marginBottom: 12 }}>Thank you!</div>
                <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                  Your review has been submitted. We curate every entry before publishing — your score will appear on the trail page soon.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Btn href="/wineries" variant="primary">See the Wine Trail →</Btn>
                  <Btn href="/rate" variant="outline" onClick={() => { setSubmitted(false); setVenue(''); setWines(['','','']); setRating(0); setService(0); setAtmosphere(0); setRateValue(0); setNote(''); setQuote(''); setVisitorName(''); }}>Rate Another Venue</Btn>
                </div>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <form onSubmit={handleSubmit} noValidate>

                {/* Venue */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Venue *</label>
                  <select
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    style={{ ...fieldStyle, cursor: 'pointer', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239B8E85' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 38 }}
                  >
                    <option value="">— Select a venue —</option>
                    {RATE_VENUES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>

                {/* Wines tried */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>What did you try? *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {wines.map((w, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={w}
                          onChange={e => updateWine(i, e.target.value)}
                          placeholder={i === 0 ? "e.g. 2023 Riesling, dry rosé, Cab Franc flight..." : "Another pour..."}
                          style={{ ...fieldStyle, flex: 1 }}
                        />
                        {wines.length > 1 && (
                          <button type="button" onClick={() => removeWine(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: C.textMuted, padding: '0 4px', lineHeight: 1 }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {wines.length < 6 && (
                    <button type="button" onClick={addWine} style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      + Add another wine or pour
                    </button>
                  )}
                </div>

                {/* Star ratings */}
                <div style={{ marginBottom: 24, padding: '20px 20px 10px', background: C.warmWhite, borderRadius: 14, border: `1px solid ${C.sand}` }}>
                  <StarRow label="Wine Quality" required value={rating}        onChange={setRating} />
                  <StarRow label="Service"      required={false} value={service}     onChange={setService} />
                  <StarRow label="Atmosphere"   required={false} value={atmosphere}  onChange={setAtmosphere} />
                  <StarRow label="Value"        required={false} value={rateValue}   onChange={setRateValue} />
                </div>

                {/* Shareable quote */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Your highlight <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — may appear on the site)</span></label>
                  <textarea
                    value={quote}
                    onChange={e => setQuote(e.target.value)}
                    placeholder={"\"Perfect afternoon. The Cab Franc was unlike anything I expected from Michigan...\"" }
                    rows={2}
                    style={{ ...fieldStyle, resize: 'none', fontStyle: quote ? 'italic' : 'normal' }}
                  />
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif", marginTop: 6 }}>
                    Something worth sharing? We may feature it on the trail page with your permission.
                  </div>
                </div>

                {/* Private note */}
                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>Private note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — not published)</span></label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Anything that doesn't need to be public — feedback, suggestions..."
                    rows={2}
                    style={{ ...fieldStyle, resize: 'none' }}
                  />
                </div>

                {/* Name (private) */}
                <div style={{ marginBottom: 32 }}>
                  <label style={labelStyle}>Your name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(private — not published)</span></label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    placeholder="Helps us spot patterns — never shown publicly"
                    style={fieldStyle}
                  />
                </div>

                {error && <div style={{ fontSize: 13, color: '#c0392b', marginBottom: 16, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', padding: '14px 24px', borderRadius: 28, background: C.sage, color: C.cream, border: 'none', fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Your Review'}
                </button>

                <p style={{ marginTop: 16, fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
                  Reviews are curated before publishing. No account needed. Your name stays private.
                </p>
              </form>
            </FadeIn>
          )}
        </div>
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
