import React, { useState, useEffect } from 'react';
import { C } from '../data/config';
import { Btn, ScrollProgress } from '../components/Shared';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';
import yeti from '../data/errorMessages';

const subScrollTo = (id) => { window.location.href = '/#' + id; };

function CapacityBar({ filled, total }) {
  if (!total || total === 0) return null;
  const pct = Math.min(100, Math.round((filled / total) * 100));
  const remaining = total - filled;
  const almostFull = remaining <= Math.ceil(total * 0.15);
  const full = remaining <= 0;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: full ? '#c0392b' : almostFull ? C.sunset : C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>
          {full ? 'Registration Full' : almostFull ? `Only ${remaining} spot${remaining !== 1 ? 's' : ''} left` : `${remaining} of ${total} spots available`}
        </span>
        <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>{pct}% filled</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.sand, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: full ? '#c0392b' : almostFull ? C.sunset : C.sage, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

export default function VendorRegisterPage() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('event');

  const [event, setEvent] = useState(null);
  const [vendorCount, setVendorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({ vendorName: '', contactName: '', email: '', phone: '', boothType: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // { vendorId, pdfUrl, eventName }

  useEffect(() => {
    if (!eventId) { setNotFound(true); setLoading(false); return; }
    fetchEvent();
  }, [eventId]);

  async function fetchEvent() {
    try {
      const res = await fetch(`/api/vendor-event?id=${eventId}`);
      if (!res.ok) { setNotFound(true); setLoading(false); return; }
      const data = await res.json();
      setEvent(data.event);
      setVendorCount(data.vendorCount || 0);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!form.vendorName || !form.contactName || !form.email || !form.boothType) {
      setError('Please fill in all required fields.');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/vendor-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, eventId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess({ vendorId: data.vendorId, pdfUrl: data.pdfUrl, eventName: data.eventName });
      } else {
        setError(data.error || yeti.oops());
        setSubmitting(false);
      }
    } catch {
      setError(yeti.network());
      setSubmitting(false);
    }
  }

  const isFull = event?.vendorCapacity > 0 && vendorCount >= event.vendorCapacity;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.cream, fontFamily: "'Libre Franklin', sans-serif", color: C.textMuted }}>
      Loading event details…
    </div>
  );

  if (notFound || !event) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.cream, fontFamily: "'Libre Franklin', sans-serif", padding: 24 }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>🔍</div>
      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: C.text, marginBottom: 8 }}>Hmm, can't find that event</div>
      <div style={{ fontSize: 15, color: C.textMuted }}>This link might be old or the event moved. Double-check with the organizer?</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden' }}>
      <GlobalStyles />
      <ScrollProgress />

      {/* Organizer Hero — their brand, not ours */}
      <section style={{
        background: event.organizerLogoUrl
          ? `linear-gradient(to bottom, rgba(15,22,28,0.55) 0%, rgba(15,22,28,0.2) 60%, ${C.cream} 100%)`
          : `linear-gradient(135deg, ${C.night} 0%, ${C.lakeDark} 60%, ${C.dusk} 100%)`,
        position: 'relative',
        minHeight: event.organizerLogoUrl ? 320 : 240,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 48px',
        textAlign: 'center',
      }}>
        {event.organizerLogoUrl && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${event.organizerLogoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {event.organizerName && (
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: event.organizerLogoUrl ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)', marginBottom: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
              Vendor Registration
            </div>
          )}
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 400, color: '#fff', margin: '0 0 12px', lineHeight: 1.1, textShadow: event.organizerLogoUrl ? '0 2px 12px rgba(0,0,0,0.6)' : 'none' }}>
            {event.name}
          </h1>
          {(event.date || event.location) && (
            <div style={{ fontSize: 15, color: event.organizerLogoUrl ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)', fontFamily: "'Libre Franklin', sans-serif", textShadow: event.organizerLogoUrl ? '0 1px 6px rgba(0,0,0,0.5)' : 'none' }}>
              {[event.date, event.time, event.location].filter(Boolean).join(' · ')}
            </div>
          )}
          {event.vendorFee > 0 && (
            <div style={{ marginTop: 14, display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '5px 16px', fontSize: 13, color: '#fff', fontWeight: 600 }}>
              ${event.vendorFee} booth fee
            </div>
          )}
          {event.vendorFee === 0 && (
            <div style={{ marginTop: 14, display: 'inline-block', background: 'rgba(74,154,111,0.25)', border: '1px solid rgba(74,154,111,0.4)', borderRadius: 20, padding: '5px 16px', fontSize: 13, color: '#8de8a8', fontWeight: 600 }}>
              Free Registration
            </div>
          )}
        </div>
      </section>

      {/* Success state */}
      {success && (
        <section style={{ background: C.warmWhite, padding: '64px 24px' }}>
          <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.text, margin: '0 0 10px' }}>You're registered!</h2>
            <p style={{ fontSize: 15, color: C.textLight, lineHeight: 1.7, margin: '0 0 32px' }}>
              Your vendor spot for <strong>{success.eventName}</strong> is confirmed. Check your email for your receipt.
            </p>
            <div style={{ background: C.cream, borderRadius: 12, padding: '20px 24px', border: `1px solid ${C.sand}`, marginBottom: 28, display: 'inline-block' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Confirmation ID</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: 3 }}>{success.vendorId}</div>
            </div>
            <div>
              <Btn href={success.pdfUrl} target="_blank" rel="noopener noreferrer">Download Receipt →</Btn>
            </div>
            <p style={{ fontSize: 12, color: C.textMuted, marginTop: 20, lineHeight: 1.6 }}>
              The organizer may reach out with load-in details, parking instructions, and event-day information closer to the event.
            </p>
          </div>
        </section>
      )}

      {/* Registration form */}
      {!success && (
        <section style={{ padding: '56px 24px 72px', background: C.warmWhite }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            {event.vendorCapacity > 0 && (
              <CapacityBar filled={vendorCount} total={event.vendorCapacity} />
            )}

            {isFull ? (
              <div style={{ background: '#fff0f0', border: '1px solid #f0b0b0', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>😔</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.text, marginBottom: 8 }}>Vendor spots are full</div>
                <div style={{ fontSize: 14, color: C.textLight }}>All vendor spots for this event have been filled.</div>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.text, margin: '0 0 6px' }}>Register as a Vendor</h2>
                <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: '0 0 32px' }}>
                  Fill in your details below to secure your vendor spot. You'll receive a confirmation receipt by email.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Business / Vendor Name *</label>
                      <input
                        value={form.vendorName}
                        onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))}
                        placeholder="e.g. Oak Street Pottery"
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box', background: C.cream, color: C.text, outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Your Name *</label>
                      <input
                        value={form.contactName}
                        onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                        placeholder="First & last name"
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box', background: C.cream, color: C.text, outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@email.com"
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box', background: C.cream, color: C.text, outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Phone</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="(optional)"
                        style={{ width: '100%', padding: '11px 13px', borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box', background: C.cream, color: C.text, outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>What Are You Selling / Booth Type *</label>
                    <input
                      value={form.boothType}
                      onChange={e => setForm(f => ({ ...f, boothType: e.target.value }))}
                      placeholder="e.g. Handmade jewelry, Food — BBQ, Photography"
                      style={{ width: '100%', padding: '11px 13px', borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box', background: C.cream, color: C.text, outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Notes to Organizer <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Booth size needs, power requirements, any questions…"
                      rows={3}
                      style={{ width: '100%', padding: '11px 13px', borderRadius: 8, border: `1px solid ${C.sand}`, fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box', background: C.cream, color: C.text, outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  {error && (
                    <div style={{ background: '#fff0f0', border: '1px solid #f0b0b0', borderRadius: 8, padding: '12px 16px', fontSize: 14, color: '#c0392b' }}>
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      padding: '15px 0', background: submitting ? C.textMuted : C.sage, color: '#fff',
                      border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
                      letterSpacing: 1.5, textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif", transition: 'background 0.2s', width: '100%',
                    }}
                  >
                    {submitting ? 'Registering…' : event.vendorFee > 0 ? `Reserve & Pay — $${event.vendorFee} →` : 'Register My Spot →'}
                  </button>

                  <p style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                    A confirmation receipt will be emailed to you immediately.
                    {event.vendorFee === 0 && ' No payment required.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Powered by */}
      <div style={{ background: C.cream, borderTop: `1px solid ${C.sand}`, padding: '16px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: C.textMuted, letterSpacing: 0.5 }}>
          Vendor registration powered by{' '}
          <a href="https://manitoubeachmichigan.com/ticket-services" style={{ color: C.textMuted, textDecoration: 'underline' }}>Yetickets</a>
        </span>
      </div>
    </div>
  );
}
