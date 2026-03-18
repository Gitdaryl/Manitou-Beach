import React, { useState, useEffect, useRef, useCallback } from 'react';
import { C } from '../data/config';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';

// Dead simple check-in page for event volunteers
// Open on phone → camera scans QR → big green checkmark or red X
// No login, no training needed

function CheckInPage() {
  const [result, setResult] = useState(null); // { status, ticketId, buyerName, eventName, quantity, usedAt }
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  // Check URL params for pre-filled ticket ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket');
    if (ticket) {
      verifyTicket(ticket);
    }
  }, []);

  const verifyTicket = useCallback(async (ticketId) => {
    const id = ticketId.trim().toUpperCase();
    if (!id) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/ticket-verify?id=${encodeURIComponent(id)}`);
      const data = await res.json();
      setResult(data);

      // Vibrate on scan (mobile feedback)
      if (navigator.vibrate) {
        if (data.status === 'valid') navigator.vibrate(200);
        else if (data.status === 'used') navigator.vibrate([100, 50, 100]);
        else navigator.vibrate([100, 50, 100, 50, 100]);
      }
    } catch {
      setError('Network error — check your connection');
    } finally {
      setLoading(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    setScanning(true);
    setResult(null);
    setError('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Extract ticket ID from URL or use raw text
          let ticketId = decodedText;
          try {
            const url = new URL(decodedText);
            const param = url.searchParams.get('ticket');
            if (param) ticketId = param;
          } catch {
            // Not a URL, use as-is (might be a raw ticket ID)
          }

          scanner.stop().catch(() => {});
          html5QrRef.current = null;
          setScanning(false);
          verifyTicket(ticketId);
        },
        () => {} // ignore scan failures (normal while searching)
      );
    } catch (err) {
      setScanning(false);
      setError('Camera access denied. Use manual entry below.');
    }
  }, [verifyTicket]);

  const stopScanner = useCallback(() => {
    if (html5QrRef.current) {
      html5QrRef.current.stop().catch(() => {});
      html5QrRef.current = null;
    }
    setScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      verifyTicket(manualId);
      setManualId('');
    }
  };

  const scanAnother = () => {
    setResult(null);
    setError('');
    startScanner();
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, month: 'short', day: 'numeric' });
    } catch { return iso; }
  };

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.night, color: C.cream, minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Minimal header — no navbar needed for volunteers */}
      <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.dusk}`, textAlign: 'center' }}>
        <img src="/images/yeti/yetickets_sign.png" alt="Yetickets" style={{ height: 72, maxWidth: 320, objectFit: 'contain', display: 'block', margin: '0 auto 10px' }} />
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.cream }}>
          Event Check-In
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px' }}>

        {/* Result display */}
        {result && (
          <div style={{
            borderRadius: 16,
            padding: '48px 32px',
            textAlign: 'center',
            marginBottom: 24,
            background: result.status === 'valid' ? 'rgba(122,142,114,0.15)'
              : result.status === 'used' ? 'rgba(212,132,90,0.15)'
              : 'rgba(255,80,80,0.12)',
            border: `2px solid ${
              result.status === 'valid' ? C.sage
              : result.status === 'used' ? C.sunset
              : '#ff5050'
            }`,
          }}>
            {/* Big status icon */}
            <div style={{
              fontSize: 72,
              lineHeight: 1,
              marginBottom: 16,
            }}>
              {result.status === 'valid' ? '✓' : result.status === 'used' ? '⚠' : '✗'}
            </div>

            {/* Status label */}
            <div style={{
              fontSize: 28,
              fontFamily: "'Libre Baskerville', serif",
              fontWeight: 700,
              color: result.status === 'valid' ? C.sage
                : result.status === 'used' ? C.sunset
                : '#ff5050',
              marginBottom: 20,
            }}>
              {result.status === 'valid' ? 'VALID — ADMIT'
                : result.status === 'used' ? 'ALREADY USED'
                : 'INVALID'}
            </div>

            {/* Ticket details */}
            {(result.status === 'valid' || result.status === 'used') && (
              <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '16px 20px' }}>
                {result.buyerName && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textMuted }}>Name</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.cream }}>{result.buyerName}</div>
                  </div>
                )}
                {result.eventName && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textMuted }}>Event</span>
                    <div style={{ fontSize: 14, color: C.cream }}>{result.eventName}</div>
                  </div>
                )}
                {result.quantity && result.quantity > 1 && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textMuted }}>Tickets</span>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.cream }}>{result.quantity}</div>
                  </div>
                )}
                {result.ticketId && (
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textMuted }}>Ticket #</span>
                    <div style={{ fontSize: 14, fontFamily: 'monospace', color: C.textMuted }}>{result.ticketId}</div>
                  </div>
                )}
                {result.status === 'used' && result.usedAt && (
                  <div>
                    <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: C.sunset }}>Scanned at</span>
                    <div style={{ fontSize: 13, color: C.sunset }}>{formatTime(result.usedAt)}</div>
                  </div>
                )}
              </div>
            )}

            {result.status === 'invalid' && result.reason === 'refunded' && (
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>This ticket has been refunded</div>
            )}

            <button
              onClick={scanAnother}
              style={{
                marginTop: 24,
                padding: '14px 32px',
                background: C.lakeBlue,
                color: C.cream,
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: "'Libre Franklin', sans-serif",
                width: '100%',
              }}
            >
              Scan Next Ticket
            </button>
          </div>
        )}

        {/* Scanner */}
        {!result && (
          <>
            {!scanning ? (
              <>
                {/* Mascot + instructions */}
                {!loading && (
                  <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
                    <img src="/images/yeti/yetickets_doorman.png" alt="" style={{ width: 220, height: 220, objectFit: 'contain', display: 'block', margin: '0 auto 14px' }} />
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.cream, marginBottom: 10 }}>
                      Ready to check people in?
                    </div>
                    <div style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.8, maxWidth: 320, margin: '0 auto' }}>
                      Tap the button below, then point your phone camera at the QR code on their ticket.
                      You'll see a <span style={{ color: '#7bba6e', fontWeight: 700 }}>green checkmark</span> for valid
                      or a <span style={{ color: '#ff6b6b', fontWeight: 700 }}>red X</span> if there's a problem.
                    </div>
                  </div>
                )}
                <button
                  onClick={startScanner}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '26px',
                    background: C.sage,
                    color: C.cream,
                    border: 'none',
                    borderRadius: 14,
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: "'Libre Franklin', sans-serif",
                    marginBottom: 20,
                    boxShadow: '0 4px 20px rgba(122,142,114,0.3)',
                  }}
                >
                  {loading ? 'Checking...' : '📷  Tap to Scan QR Code'}
                </button>
              </>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div id="qr-reader" ref={scannerRef} style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }} />
                <button
                  onClick={stopScanner}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    color: C.textMuted,
                    border: `1px solid ${C.dusk}`,
                    borderRadius: 8,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: "'Libre Franklin', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Manual entry fallback */}
            <div style={{ borderTop: `1px solid ${C.dusk}`, paddingTop: 20, marginTop: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.textMuted, marginBottom: 10, textAlign: 'center' }}>
                Or type ticket number
              </div>
              <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 8 }}>
                <input
                  value={manualId}
                  onChange={e => setManualId(e.target.value)}
                  placeholder="MB-XXXXXX"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${C.dusk}`,
                    background: 'rgba(255,255,255,0.06)',
                    color: C.cream,
                    fontSize: 16,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !manualId.trim()}
                  style={{
                    padding: '12px 20px',
                    background: C.lakeBlue,
                    color: C.cream,
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: "'Libre Franklin', sans-serif",
                    opacity: loading || !manualId.trim() ? 0.5 : 1,
                  }}
                >
                  {loading ? '...' : 'Check'}
                </button>
              </form>
            </div>
          </>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#ff6b6b', fontSize: 13, marginTop: 12 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckInPage;
