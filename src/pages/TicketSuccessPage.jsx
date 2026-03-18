import React, { useState, useEffect } from 'react';
import { C } from '../data/config';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';
import { Btn } from '../components/Shared';

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return dateStr; }
}

export default function TicketSuccessPage() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);

  const scrollTo = (id) => { window.location.href = '/#' + id; };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) { setError('No session found.'); setLoading(false); return; }

    // Poll for ticket — webhook may take a few seconds to fire
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      try {
        const res = await fetch(`/api/ticket-confirmation?session_id=${sessionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');

        setTicket(data);
        setLoading(false);
        if (data.pdfUrl) setPdfReady(true);
      } catch (err) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // retry every 2s while webhook processes
        } else {
          setError('Could not load ticket details. Check your email — your ticket was sent there.');
          setLoading(false);
        }
      }
    };

    poll();
  }, []);

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
      <GlobalStyles />
      <Navbar activeSection="happening" scrollTo={scrollTo} isSubPage={true} />

      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

          {loading && (
            <div>
              <img src="/images/yeti/yetickets_doorman.png" alt="Yetickets" style={{ width: 180, height: 180, marginBottom: 24 }} />
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, letterSpacing: 1 }}>
                Preparing your ticket…
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: C.lakeBlue,
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
            </div>
          )}

          {error && !loading && (
            <div>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color: C.text, margin: '0 0 12px' }}>
                Payment Confirmed
              </h1>
              <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.6, margin: '0 0 32px' }}>{error}</p>
              <Btn href="/happening" variant="primary">Browse Events →</Btn>
            </div>
          )}

          {ticket && !loading && (
            <div>
              {/* Logo */}
              <img src="/images/yeti/yetickets_sign.png" alt="Yetickets" style={{ width: 200, marginBottom: 8 }} />

              {/* Big checkmark */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7bba6e, #5a9e4e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 32px rgba(123,186,110,0.35)',
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16l7 7 13-13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 32, color: C.text, margin: '0 0 8px', fontWeight: 400 }}>
                You're in!
              </h1>
              <p style={{ color: C.textMuted, fontSize: 15, margin: '0 0 32px' }}>
                Your spot is confirmed for <strong style={{ color: C.text }}>{ticket.eventName}</strong>.
              </p>

              {/* Ticket card */}
              <div style={{
                background: '#fff',
                border: `1px solid ${C.warmGray}30`,
                borderRadius: 16,
                padding: '28px 32px',
                marginBottom: 24,
                textAlign: 'left',
                boxShadow: '0 4px 24px rgba(26,40,48,0.08)',
              }}>
                {/* Ticket ID — most prominent */}
                <div style={{ textAlign: 'center', paddingBottom: 20, marginBottom: 20, borderBottom: `1px dashed ${C.warmGray}50` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>
                    Ticket ID
                  </div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 30, fontWeight: 700, letterSpacing: 4, color: C.text }}>
                    {ticket.ticketId || '—'}
                  </div>
                </div>

                {/* Event details */}
                {[
                  ticket.eventDate && { label: 'Date', value: formatDate(ticket.eventDate) },
                  ticket.eventTime && { label: 'Time', value: ticket.eventTime },
                  ticket.eventLocation && { label: 'Location', value: ticket.eventLocation },
                  { label: 'Name', value: ticket.buyerName },
                  { label: 'Quantity', value: `${ticket.quantity} ticket${ticket.quantity !== 1 ? 's' : ''}` },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, whiteSpace: 'nowrap' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 14, color: C.text, textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Download button */}
              {pdfReady && (
                <a
                  href={ticket.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    background: C.night,
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '18px 28px',
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 700,
                    marginBottom: 12,
                    boxShadow: '0 4px 20px rgba(26,40,48,0.25)',
                    letterSpacing: 0.5,
                  }}
                >
                  🖨️ Download &amp; Print Ticket
                </a>
              )}

              {/* Email confirmation */}
              <div style={{
                background: `${C.sage}15`,
                border: `1px solid ${C.sage}30`,
                borderRadius: 10,
                padding: '14px 20px',
                marginBottom: 24,
                fontSize: 13,
                color: C.text,
                lineHeight: 1.6,
              }}>
                📧 A confirmation email with your ticket has been sent to{' '}
                <strong>{ticket.email}</strong>.{' '}
                Check your inbox — and your spam folder if you don't see it within a few minutes.
              </div>

              {/* Instructions for old folks */}
              <div style={{
                background: C.warmWhite,
                borderRadius: 10,
                padding: '16px 20px',
                marginBottom: 28,
                textAlign: 'left',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.textMuted, marginBottom: 10 }}>
                  At the door
                </div>
                {[
                  'Print your ticket and bring it with you, OR',
                  'Show this page on your phone, OR',
                  'Show the confirmation email on your phone',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 13, color: C.text }}>
                    <span style={{ color: C.lakeBlue, fontWeight: 700, minWidth: 16 }}>✓</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <a href="/happening" style={{ fontSize: 14, color: C.lakeBlue, textDecoration: 'none', fontWeight: 600 }}>
                ← Browse more events
              </a>
            </div>
          )}

        </div>
      </div>

      <Footer scrollTo={scrollTo} />
    </div>
  );
}
