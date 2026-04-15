import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { C } from '../data/config';

const MERCHANTS = {
  cafe: {
    name: 'Blackbird Cafe & Baking Company',
    offerText: 'free cookie',
    emoji: '☕',
    accent: '#D4845A',
  },
};

export default function MerchantRedeemPage() {
  const { slug } = useParams();
  const biz = MERCHANTS[slug];

  const [code, setCode] = useState('');
  const [lookup, setLookup] = useState(null);
  const [looking, setLooking] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!biz) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <p style={{ color: C.textLight }}>Unknown merchant.</p>
    </div>
  );

  const reset = () => {
    setCode(''); setLookup(null); setDone(false); setError('');
  };

  const handleLookup = async (e) => {
    e?.preventDefault?.();
    const clean = code.trim().toUpperCase();
    if (clean.length < 4) return;
    setLooking(true);
    setError('');
    setLookup(null);
    try {
      const res = await fetch(`/api/redeem-claim?code=${encodeURIComponent(clean)}&slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Not found');
      setLookup(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLooking(false);
    }
  };

  const handleRedeem = async () => {
    if (!lookup) return;
    setRedeeming(true);
    setError('');
    try {
      const res = await fetch('/api/redeem-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId: lookup.id, code: lookup.code, slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setRedeeming(false);
    }
  };

  const pageBg = '#0F1B23';
  const cardBg = '#1A2830';

  // ── DONE ─────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', background: '#052e16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Libre Franklin', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>✅</div>
        <h1 style={{ color: '#4ade80', fontSize: 32, margin: '0 0 8px', letterSpacing: 2, fontFamily: "'Libre Baskerville', serif" }}>APPROVED</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: '0 0 6px' }}>
          <strong style={{ color: '#a3e635', fontFamily: 'monospace' }}>{lookup.code}</strong> marked used.
        </p>
        {lookup.name && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Enjoy, {lookup.name.split(' ')[0]}!</p>}
        <button
          onClick={reset}
          style={{ marginTop: 32, background: biz.accent, color: '#fff', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
        >Next customer →</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: pageBg, fontFamily: "'Libre Franklin', sans-serif" }}>
      <div style={{ background: cardBg, padding: '18px 24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>Barista Redemption · {biz.emoji}</div>
        <div style={{ fontSize: 14, color: '#fff', marginTop: 4, fontWeight: 600 }}>{biz.name}</div>
      </div>

      <div style={{ maxWidth: 460, margin: '0 auto', padding: '40px 24px' }}>

        {/* LOOKUP FORM */}
        {!lookup && (
          <form onSubmit={handleLookup}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Customer's Claim Code
            </label>
            <input
              autoFocus
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="BB-XXXXXX"
              maxLength={12}
              style={{
                width: '100%', padding: '20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)',
                background: cardBg, color: '#fff', fontSize: 28, fontFamily: 'monospace', letterSpacing: '0.15em',
                textAlign: 'center', fontWeight: 700, boxSizing: 'border-box', outline: 'none',
              }}
            />
            {error && <p style={{ color: '#fca5a5', fontSize: 14, margin: '12px 0 0', textAlign: 'center' }}>{error}</p>}
            <button
              type="submit"
              disabled={looking || code.trim().length < 4}
              style={{
                marginTop: 20, width: '100%', padding: '16px', borderRadius: 10, border: 'none',
                background: looking || code.trim().length < 4 ? '#2a3b47' : biz.accent,
                color: '#fff', fontSize: 16, fontWeight: 700, cursor: looking || code.trim().length < 4 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >{looking ? 'Checking…' : 'Look up →'}</button>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 20, lineHeight: 1.5 }}>
              Ask the customer to show their code or email.<br/>
              Enter their code above (format: BB-XXXXXX).
            </p>
          </form>
        )}

        {/* CONFIRM REDEEM */}
        {lookup && !lookup.redeemed && (
          <div>
            <div style={{ background: cardBg, borderRadius: 14, padding: 28, textAlign: 'center', marginBottom: 20, border: '1px solid rgba(74,222,128,0.3)' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4ade80', marginBottom: 10 }}>Valid ✓</div>
              <div style={{ fontSize: 40, fontFamily: 'monospace', color: '#a3e635', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 16 }}>{lookup.code}</div>
              {lookup.name && (
                <>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Subscriber</div>
                  <div style={{ fontSize: 22, color: '#fff', fontWeight: 700, marginTop: 4 }}>{lookup.name}</div>
                </>
              )}
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 14 }}>
                Offer: {biz.offerText} · one use
              </div>
            </div>
            {error && <p style={{ color: '#fca5a5', fontSize: 14, margin: '0 0 12px', textAlign: 'center' }}>{error}</p>}
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              style={{
                width: '100%', padding: '22px', borderRadius: 12, border: 'none',
                background: redeeming ? '#166534' : '#4ade80', color: '#052e16',
                fontSize: 20, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
                cursor: redeeming ? 'default' : 'pointer', fontFamily: 'inherit',
              }}
            >{redeeming ? 'Approving…' : 'Approve & Redeem'}</button>
            <button
              onClick={reset}
              style={{ marginTop: 12, width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
            >Cancel</button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 14 }}>
              This code will be permanently marked as used.
            </p>
          </div>
        )}

        {/* ALREADY REDEEMED */}
        {lookup && lookup.redeemed && (
          <div style={{ background: '#2a0a0a', borderRadius: 14, padding: 28, textAlign: 'center', border: '1px solid rgba(252,165,165,0.3)' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🚫</div>
            <h2 style={{ color: '#fca5a5', fontSize: 22, margin: '0 0 8px', letterSpacing: 1.5 }}>ALREADY REDEEMED</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 4px' }}>
              Code <strong style={{ fontFamily: 'monospace' }}>{lookup.code}</strong> was used
              {lookup.redeemedAt ? ` on ${new Date(lookup.redeemedAt).toLocaleDateString()}` : ' already'}.
            </p>
            {lookup.name && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>By: {lookup.name}</p>}
            <button
              onClick={reset}
              style={{ marginTop: 24, width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: biz.accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
            >Next customer →</button>
          </div>
        )}

      </div>
    </div>
  );
}
