import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { C } from '../data/config';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';

const FIELD = {
  width: '100%', padding: '12px 16px', borderRadius: 10,
  border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
  fontSize: 16, color: C.text, background: '#fff', outline: 'none', boxSizing: 'border-box',
  textTransform: 'uppercase', letterSpacing: 2,
};

export default function PrizeRedeemPage() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState((searchParams.get('code') || '').toUpperCase());
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // {ok, prize, sponsor, error}
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  const scrollTo = () => {};

  const handleRedeem = async () => {
    if (!code.trim()) return;
    if (!pin.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/prize-wheel/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimCode: code.trim(), vendorPin: pin.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ ok: false, error: 'Network error. Check connection and try again.' });
    }
    setSubmitting(false);
  };

  // ── QR scanner ──
  const startScanner = async () => {
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader-redeem');
      html5QrRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          let extractedCode = decoded;
          try {
            const url = new URL(decoded);
            const param = url.searchParams.get('code');
            if (param) extractedCode = param;
          } catch {}
          scanner.stop().catch(() => {});
          html5QrRef.current = null;
          setScanning(false);
          setCode(extractedCode.toUpperCase());
        },
        () => {}
      );
    } catch (err) {
      console.error('QR scanner error:', err);
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => () => stopScanner(), []);

  const resetForm = () => {
    setCode('');
    setPin('');
    setResult(null);
    setScanning(false);
  };

  const LABEL = {
    fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
    color: C.textMuted, display: 'block', marginBottom: 6,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '120px 24px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
            color: C.sunset, marginBottom: 8, fontFamily: "'Libre Franklin', sans-serif",
          }}>
            Vendor Tool
          </div>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 400,
            color: C.dusk, margin: '0 0 10px',
          }}>
            Mark a Prize Redeemed
          </h1>
          <p style={{ color: C.textLight, fontSize: 15, lineHeight: 1.6, margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
            Scan the customer's QR code or type their code, enter your PIN, and tap the button.
          </p>
        </div>

        {/* Success */}
        {result?.ok && (
          <div style={{
            background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 16,
            padding: '28px 24px', textAlign: 'center', marginBottom: 24,
          }}>
            <div style={{ fontSize: 56, marginBottom: 12, lineHeight: 1 }}>✅</div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 22,
              color: '#15803D', margin: '0 0 8px',
            }}>
              Prize Redeemed!
            </h2>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#166534', margin: '0 0 4px', fontFamily: "'Libre Franklin', sans-serif" }}>
              {result.prize}
            </p>
            <p style={{ fontSize: 14, color: '#15803D', margin: '0 0 20px', fontFamily: "'Libre Franklin', sans-serif" }}>
              from {result.sponsor}
            </p>
            <button onClick={resetForm} style={{
              padding: '12px 28px', borderRadius: 10, border: 'none',
              background: '#15803D', color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              Redeem Another
            </button>
          </div>
        )}

        {/* Failure */}
        {result && !result.ok && (
          <div style={{
            background: '#FEF2F2', border: '2px solid #FECACA', borderRadius: 16,
            padding: '28px 24px', textAlign: 'center', marginBottom: 24,
          }}>
            <div style={{ fontSize: 56, marginBottom: 12, lineHeight: 1 }}>❌</div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 22,
              color: '#B91C1C', margin: '0 0 8px',
            }}>
              Can't Redeem
            </h2>
            <p style={{ fontSize: 15, color: '#991B1B', margin: '0 0 20px', fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.6 }}>
              {result.error}
            </p>
            <button onClick={() => setResult(null)} style={{
              padding: '12px 28px', borderRadius: 10, border: 'none',
              background: '#B91C1C', color: '#fff', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              Try Again
            </button>
          </div>
        )}

        {/* Form - hidden after successful redemption */}
        {!result?.ok && (
          <div style={{
            background: '#fff', borderRadius: 16, padding: '24px',
            border: `1.5px solid ${C.sand}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            {/* QR scanner */}
            <div style={{ marginBottom: 20 }}>
              {scanning ? (
                <div>
                  <div id="qr-reader-redeem" style={{ width: '100%', borderRadius: 10, overflow: 'hidden' }} />
                  <button onClick={stopScanner} style={{
                    marginTop: 10, width: '100%', padding: '10px', borderRadius: 8,
                    border: `1.5px solid ${C.sand}`, background: '#fff',
                    color: C.textMuted, fontSize: 14, cursor: 'pointer',
                    fontFamily: "'Libre Franklin', sans-serif",
                  }}>
                    Cancel Scan
                  </button>
                </div>
              ) : (
                <button onClick={startScanner} style={{
                  width: '100%', padding: '12px', borderRadius: 10,
                  border: `1.5px solid ${C.lakeBlue}`, background: `${C.lakeBlue}10`,
                  color: C.lakeBlue, fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Libre Franklin', sans-serif", display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>📷</span> Scan QR Code
                </button>
              )}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 20px',
            }}>
              <div style={{ flex: 1, height: 1, background: C.sand }} />
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>or type it in</span>
              <div style={{ flex: 1, height: 1, background: C.sand }} />
            </div>

            {/* Claim code */}
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL}>Claim Code</label>
              <input
                style={FIELD}
                placeholder="MB-XXXX-XX"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                maxLength={11}
              />
            </div>

            {/* PIN */}
            <div style={{ marginBottom: 20 }}>
              <label style={LABEL}>Your Vendor PIN</label>
              <input
                style={{ ...FIELD, letterSpacing: 6, textTransform: 'none' }}
                type="password"
                inputMode="numeric"
                placeholder="PIN"
                value={pin}
                onChange={e => setPin(e.target.value)}
                maxLength={6}
                onKeyDown={e => e.key === 'Enter' && handleRedeem()}
              />
            </div>

            <button
              onClick={handleRedeem}
              disabled={submitting || !code.trim() || !pin.trim()}
              style={{
                width: '100%', padding: '15px', borderRadius: 10, border: 'none',
                background: (!code.trim() || !pin.trim()) ? C.sand : C.sunset,
                color: (!code.trim() || !pin.trim()) ? C.textMuted : '#fff',
                fontSize: 16, fontWeight: 700, cursor: submitting || !code.trim() || !pin.trim() ? 'not-allowed' : 'pointer',
                fontFamily: "'Libre Franklin', sans-serif",
                transition: 'background 0.2s',
              }}
            >
              {submitting ? 'Checking...' : 'Mark Redeemed'}
            </button>

            <p style={{
              marginTop: 16, fontSize: 12, color: C.textMuted, lineHeight: 1.6,
              textAlign: 'center', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              This marks the prize as used in the system. Only tap it once the customer is in front of you ready to receive the deal.
            </p>
          </div>
        )}
      </div>

      <Footer scrollTo={scrollTo} />
    </div>
  );
}
