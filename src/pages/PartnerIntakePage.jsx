import React, { useState } from 'react';
import { C } from '../data/config';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';
import { FadeIn } from '../components/Shared';

const FIELD = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: `1.5px solid ${C.warmGray}40`, fontFamily: "'Libre Franklin', sans-serif",
  fontSize: 15, color: C.text, background: '#fff', outline: 'none', boxSizing: 'border-box',
};
const LABEL = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
  color: C.textMuted, display: 'block', marginBottom: 6,
};
const SECTION_TITLE = {
  fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text,
  margin: '32px 0 16px', paddingBottom: 8, borderBottom: `1px solid ${C.warmGray}30`,
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function CheckPill({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      padding: '8px 16px', borderRadius: 20, marginRight: 10, marginBottom: 8,
      border: `1.5px solid ${checked ? C.lakeBlue : C.warmGray + '50'}`,
      background: checked ? `${C.lakeBlue}15` : '#fff',
      fontSize: 14, color: checked ? C.lakeBlue : C.textMuted, fontWeight: checked ? 600 : 400,
      transition: 'all 0.15s',
    }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {checked ? '✓ ' : ''}{label}
    </label>
  );
}

export default function PartnerIntakePage() {
  const scrollTo = (id) => { window.location.href = '/#' + id; };
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    orgName: '', orgType: '', is501c3: false,
    contactName: '', email: '', phone: '',
    wantsTickets: false, wantsSponsorships: false,
    eventNames: '', typicalAttendance: '', ticketPriceRange: '', eventFrequency: '',
    sponsorTiers: '', sponsorBenefits: '',
    notes: '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const toggle = (key) => () => setForm(f => ({ ...f, [key]: !f[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.orgName.trim() || !form.contactName.trim() || !form.email.trim()) {
      setError('Organization name, your name, and email are required.');
      return;
    }
    if (!form.wantsTickets && !form.wantsSponsorships) {
      setError('Please select at least one service — tickets, sponsorships, or both.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const services = [form.wantsTickets && 'Tickets', form.wantsSponsorships && 'Sponsorships'].filter(Boolean);
      const res = await fetch('/api/partner-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: form.orgName, orgType: form.orgType, is501c3: form.is501c3,
          contactName: form.contactName, email: form.email, phone: form.phone,
          services,
          eventNames: form.eventNames, typicalAttendance: form.typicalAttendance,
          ticketPriceRange: form.ticketPriceRange, eventFrequency: form.eventFrequency,
          sponsorTiers: form.sponsorTiers, sponsorBenefits: form.sponsorBenefits,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again or email admin@yetigroove.com.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
        <GlobalStyles />
        <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
            <img src="/images/yeti/yetickets_sign.png" alt="Yetickets" style={{ width: '100%', maxWidth: 420, marginBottom: 24 }} />
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #7bba6e, #5a9e4e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M6 16l7 7 13-13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, margin: '0 0 12px' }}>You're on the list.</h1>
            <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
              Daryl will review your details and reach out within a day or two to get you set up.
              Once your bank account is connected, your first event goes live.
            </p>
            <a href="/ticket-services" style={{ fontSize: 14, color: C.lakeBlue, textDecoration: 'none', fontWeight: 600 }}>
              ← Back to Ticket Services
            </a>
          </div>
        </div>
        <Footer scrollTo={scrollTo} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '120px 24px 80px' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <img src="/images/yeti/yetickets_sign.png" alt="Yetickets" style={{ width: '100%', maxWidth: 400, marginBottom: 24 }} />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.textMuted, marginBottom: 12 }}>
              Partner Setup
            </div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 32, fontWeight: 400, margin: '0 0 12px' }}>
              Tell us about your organization
            </h1>
            <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
              This helps us set up exactly the right features for you. Takes about 3 minutes.
              Daryl will follow up to get your bank connected and your first event live.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <form onSubmit={handleSubmit} noValidate style={{
            background: '#fff', borderRadius: 20, padding: 'clamp(24px, 5vw, 40px)',
            boxShadow: '0 4px 32px rgba(26,40,48,0.08)', border: `1px solid ${C.warmGray}20`,
          }}>

            {/* Organization */}
            <div style={SECTION_TITLE}>Organization</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <Field label="Organization Name *">
                <input type="text" value={form.orgName} onChange={set('orgName')} placeholder="Ladies Club, Rotary, Marina, ..." style={FIELD} />
              </Field>
              <Field label="Organization Type">
                <select value={form.orgType} onChange={set('orgType')} style={{ ...FIELD, appearance: 'none' }}>
                  <option value="">Select one...</option>
                  <option value="Yacht Club">Yacht Club</option>
                  <option value="Community Club">Community Club</option>
                  <option value="Nonprofit">Nonprofit</option>
                  <option value="Business Association">Business Association</option>
                  <option value="Church / Faith Org">Church / Faith Org</option>
                  <option value="Festival / Event Co.">Festival / Event Co.</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>
            <Field label="Is your organization a registered 501(c)(3)?">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: C.text }}>
                <input type="checkbox" checked={form.is501c3} onChange={set('is501c3')} style={{ width: 16, height: 16 }} />
                Yes — we're a tax-exempt nonprofit
              </label>
            </Field>

            {/* Contact */}
            <div style={SECTION_TITLE}>Your Contact Info</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <Field label="Your Name *">
                <input type="text" value={form.contactName} onChange={set('contactName')} placeholder="First + last" style={FIELD} />
              </Field>
              <Field label="Email *">
                <input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" style={FIELD} />
              </Field>
              <Field label="Phone (optional)">
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 555-5555" style={FIELD} />
              </Field>
            </div>

            {/* Services */}
            <div style={SECTION_TITLE}>What do you need?</div>
            <Field label="Select all that apply *">
              <div>
                <CheckPill label="🎟️ Ticket Sales" checked={form.wantsTickets} onChange={toggle('wantsTickets')} />
                <CheckPill label="🤝 Sponsorships" checked={form.wantsSponsorships} onChange={toggle('wantsSponsorships')} />
              </div>
            </Field>

            {/* Events */}
            <div style={SECTION_TITLE}>Your Events</div>
            <Field label="Event name(s)">
              <input type="text" value={form.eventNames} onChange={set('eventNames')} placeholder="Annual Gala, Spring Dinner, Summer Festival, ..." style={FIELD} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <Field label="Typical attendance">
                <input type="number" value={form.typicalAttendance} onChange={set('typicalAttendance')} placeholder="e.g. 150" style={FIELD} min="1" />
              </Field>
              <Field label="Ticket price range">
                <input type="text" value={form.ticketPriceRange} onChange={set('ticketPriceRange')} placeholder="e.g. $25–$75 per person" style={FIELD} />
              </Field>
              <Field label="How often?">
                <input type="text" value={form.eventFrequency} onChange={set('eventFrequency')} placeholder="e.g. Annual, 3× per year" style={FIELD} />
              </Field>
            </div>

            {/* Sponsorships — only show if selected */}
            {form.wantsSponsorships && (
              <>
                <div style={SECTION_TITLE}>Sponsorship Details</div>
                <Field label="Sponsorship tiers you have in mind">
                  <input type="text" value={form.sponsorTiers} onChange={set('sponsorTiers')} placeholder="e.g. $100 / $250 / $500 / $1,000" style={FIELD} />
                </Field>
                <Field label="What do sponsors receive?">
                  <textarea value={form.sponsorBenefits} onChange={set('sponsorBenefits')}
                    placeholder="e.g. Logo on banner, mention at event, listing on website, ..."
                    rows={3} style={{ ...FIELD, resize: 'vertical', lineHeight: 1.6 }} />
                </Field>
              </>
            )}

            {/* Notes */}
            <div style={SECTION_TITLE}>Anything else?</div>
            <Field label="Notes or questions">
              <textarea value={form.notes} onChange={set('notes')}
                placeholder="Special requirements, timeline, questions for Daryl..."
                rows={3} style={{ ...FIELD, resize: 'vertical', lineHeight: 1.6 }} />
            </Field>

            {error && (
              <div style={{ fontSize: 13, color: '#c0392b', background: 'rgba(192,57,43,0.08)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '15px 24px', borderRadius: 12,
                background: submitting ? `${C.night}80` : C.night,
                color: '#fff', border: 'none',
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 700,
                letterSpacing: 1.5, textTransform: 'uppercase',
                cursor: submitting ? 'default' : 'pointer', transition: 'background 0.2s',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit — Daryl Will Be In Touch →'}
            </button>

            <p style={{ marginTop: 14, fontSize: 12, color: C.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
              No payment required to submit. Bank setup happens in a separate step after Daryl reviews your details.
            </p>
          </form>
        </FadeIn>
      </div>

      <Footer scrollTo={scrollTo} />
    </div>
  );
}
