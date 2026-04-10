import React, { useState } from 'react';
import { C } from '../data/config';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';
import { FadeIn, SectionLabel, Btn } from '../components/Shared';
import yeti from '../data/errorMessages';

const FIELD = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: `1.5px solid ${C.sand}`, fontFamily: "'Libre Franklin', sans-serif",
  fontSize: 15, color: C.text, background: '#fff', outline: 'none', boxSizing: 'border-box',
};
const LABEL = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
  color: C.textMuted, display: 'block', marginBottom: 6,
};
const HINT = {
  fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: '0 0 16px',
  fontFamily: "'Libre Franklin', sans-serif",
};

const OFFER_TYPES = [
  { value: 'free_item', label: 'Free item', example: 'e.g. free cookie, free coffee' },
  { value: 'discount_percent', label: 'Percent off', example: 'e.g. 20% off any entree' },
  { value: 'discount_dollar', label: 'Dollar amount off', example: 'e.g. $5 off any purchase over $20' },
  { value: 'bogo', label: 'Buy one, get one', example: 'e.g. buy one pizza, get one free' },
  { value: 'bundle', label: 'Bundle deal', example: 'e.g. burger + fries + drink for $12' },
  { value: 'other', label: 'Something else', example: 'describe it below' },
];

const LIMIT_OPTIONS = [
  { value: 'first_10', label: 'First 10 people' },
  { value: 'first_15', label: 'First 15 people' },
  { value: 'first_25', label: 'First 25 people' },
  { value: 'first_50', label: 'First 50 people' },
  { value: 'unlimited', label: 'No limit (open to everyone)' },
  { value: 'custom', label: 'Custom limit' },
];

const CONDITION_OPTIONS = [
  { value: 'any_purchase', label: 'With any purchase' },
  { value: 'min_spend', label: 'With minimum spend' },
  { value: 'no_purchase', label: 'No purchase needed' },
  { value: 'new_customer', label: 'New customers only' },
  { value: 'other', label: 'Other condition' },
];

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={LABEL}>{label}</label>
      {hint && <p style={{ ...HINT, marginBottom: 8, fontSize: 12 }}>{hint}</p>}
      {children}
    </div>
  );
}

function PillSelect({ options, value, onChange, multi = false }) {
  const isSelected = (v) => multi ? (value || []).includes(v) : value === v;
  const handleClick = (v) => {
    if (multi) {
      const arr = value || [];
      onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    } else {
      onChange(v === value ? '' : v);
    }
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => {
        const sel = isSelected(opt.value);
        return (
          <button key={opt.value} type="button" onClick={() => handleClick(opt.value)} style={{
            padding: '9px 16px', borderRadius: 20, cursor: 'pointer',
            border: `1.5px solid ${sel ? C.sunset : C.sand}`,
            background: sel ? `${C.sunset}12` : '#fff',
            color: sel ? C.sunset : C.textMuted, fontWeight: sel ? 600 : 400,
            fontSize: 14, fontFamily: "'Libre Franklin', sans-serif",
            transition: 'all 0.15s',
          }}>
            {sel ? '✓ ' : ''}{opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CreateOfferPage() {
  const scrollTo = (id) => { window.location.href = '/#' + id; };
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    offerType: '', offerDescription: '',
    limit: '', customLimit: '',
    condition: '', conditionDetail: '',
    startDate: '', endDate: '',
    perCustomer: 'one',
    otherRestrictions: '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setPill = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // Build the plain-language summary
  const buildSummary = () => {
    const parts = [];
    if (!form.offerDescription.trim()) return '';

    parts.push(form.offerDescription.trim());

    const limitOpt = LIMIT_OPTIONS.find(o => o.value === form.limit);
    if (form.limit === 'custom' && form.customLimit.trim()) {
      parts.push(`First ${form.customLimit.trim()} people only.`);
    } else if (limitOpt && form.limit !== 'unlimited') {
      parts.push(`${limitOpt.label} only.`);
    }

    const condOpt = CONDITION_OPTIONS.find(o => o.value === form.condition);
    if (form.condition === 'min_spend' && form.conditionDetail.trim()) {
      parts.push(`Minimum spend: ${form.conditionDetail.trim()}.`);
    } else if (form.condition === 'other' && form.conditionDetail.trim()) {
      parts.push(form.conditionDetail.trim() + '.');
    } else if (condOpt && form.condition !== 'other') {
      parts.push(condOpt.label + '.');
    }

    if (form.startDate && form.endDate) {
      const fmt = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      parts.push(`Valid ${fmt(form.startDate)} - ${fmt(form.endDate)}.`);
    } else if (form.endDate) {
      const fmt = (d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      parts.push(`Valid through ${fmt(form.endDate)}.`);
    }

    if (form.perCustomer === 'one') parts.push('One per customer.');

    if (form.otherRestrictions.trim()) parts.push(form.otherRestrictions.trim());

    return parts.join(' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.contactName.trim()) {
      setError('Business name and your name are required.');
      return;
    }
    if (!form.offerDescription.trim()) {
      setError('Describe the offer so people know what they\'re getting.');
      return;
    }
    if (!form.limit) {
      setError('Pick a limit so you know how many you\'re committing to.');
      return;
    }
    if (!form.endDate) {
      setError('Every offer needs an end date. Even a generous one.');
      return;
    }

    const generatedSummary = buildSummary();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/create-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, summary: generatedSummary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSummary(generatedSummary);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || yeti.oops());
      setSubmitting(false);
    }
  };

  // ── Success state ──
  if (submitted) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh' }}>
        <GlobalStyles />
        <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px' }}>
          <FadeIn>
            <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.sage}, ${C.sageDark})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16l7 7 13-13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color: C.dusk, margin: '0 0 12px' }}>
                Offer submitted!
              </h1>
              <p style={{ color: C.textMuted, fontSize: 15, lineHeight: 1.7, margin: '0 0 24px' }}>
                We'll review everything and get it posted. If anything looks off, we'll reach out before it goes live.
              </p>

              <div style={{
                background: '#fff', border: `1.5px solid ${C.sand}`, borderRadius: 14,
                padding: '20px 24px', textAlign: 'left', margin: '0 0 28px',
              }}>
                <div style={{ ...LABEL, marginBottom: 10, color: C.sunset }}>What will appear on the site</div>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {summary}
                </p>
              </div>

              <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                Want to change something? Just text Daryl or email <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a>. We can update or cancel anytime.
              </p>
            </div>
          </FadeIn>
        </div>
        <Footer scrollTo={scrollTo} />
      </div>
    );
  }

  // ── Live preview ──
  const livePreview = buildSummary();

  // ── Form ──
  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '120px 24px 80px' }}>
        <FadeIn>
          <SectionLabel>Advertiser Tools</SectionLabel>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 400, color: C.dusk, margin: '0 0 12px' }}>
            Build Your Offer
          </h1>
          <p style={HINT}>
            Running a promo on the site? Fill this out so we know exactly what to post. It takes two minutes and saves everyone headaches later.
          </p>
        </FadeIn>

        <form onSubmit={handleSubmit}>
          {/* ── Business info ── */}
          <FadeIn delay={0.05}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text,
              margin: '32px 0 16px', paddingBottom: 8, borderBottom: `1px solid ${C.sand}`,
            }}>About you</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="offer-form-grid">
              <Field label="Business name">
                <input style={FIELD} value={form.businessName} onChange={set('businessName')} placeholder="e.g. Shay's Cookie Co." />
              </Field>
              <Field label="Your name">
                <input style={FIELD} value={form.contactName} onChange={set('contactName')} placeholder="First and last" />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="offer-form-grid">
              <Field label="Email">
                <input style={FIELD} type="email" value={form.email} onChange={set('email')} placeholder="you@business.com" />
              </Field>
              <Field label="Phone (optional)">
                <input style={FIELD} type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 555-5555" />
              </Field>
            </div>
          </FadeIn>

          {/* ── The offer ── */}
          <FadeIn delay={0.1}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text,
              margin: '32px 0 16px', paddingBottom: 8, borderBottom: `1px solid ${C.sand}`,
            }}>The offer</div>

            <Field label="What type of offer?" hint="Pick the closest match. You can always explain more below.">
              <PillSelect options={OFFER_TYPES} value={form.offerType} onChange={setPill('offerType')} />
            </Field>

            <Field label="Describe the offer" hint="Write it the way you'd explain it to a customer standing in front of you.">
              <textarea style={{ ...FIELD, minHeight: 80, resize: 'vertical' }}
                value={form.offerDescription} onChange={set('offerDescription')}
                placeholder="e.g. Free cookie with any purchase of $5 or more"
              />
            </Field>
          </FadeIn>

          {/* ── Limits ── */}
          <FadeIn delay={0.15}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text,
              margin: '32px 0 16px', paddingBottom: 8, borderBottom: `1px solid ${C.sand}`,
            }}>Limits</div>

            <Field label="How many can you give away?" hint="Be honest with yourself here. Better to start small and extend than to overcommit.">
              <PillSelect options={LIMIT_OPTIONS} value={form.limit} onChange={setPill('limit')} />
            </Field>

            {form.limit === 'custom' && (
              <Field label="Custom limit">
                <input style={{ ...FIELD, maxWidth: 200 }} value={form.customLimit} onChange={set('customLimit')} placeholder="e.g. 30" />
              </Field>
            )}

            <Field label="What does someone need to do to qualify?">
              <PillSelect options={CONDITION_OPTIONS} value={form.condition} onChange={setPill('condition')} />
            </Field>

            {(form.condition === 'min_spend' || form.condition === 'other') && (
              <Field label={form.condition === 'min_spend' ? 'Minimum spend amount' : 'Describe the condition'}>
                <input style={FIELD} value={form.conditionDetail} onChange={set('conditionDetail')}
                  placeholder={form.condition === 'min_spend' ? 'e.g. $10' : 'e.g. Must follow us on Instagram'}
                />
              </Field>
            )}

            <Field label="One per customer, or can people come back?">
              <PillSelect
                options={[
                  { value: 'one', label: 'One per customer' },
                  { value: 'unlimited', label: 'No limit per person' },
                ]}
                value={form.perCustomer}
                onChange={setPill('perCustomer')}
              />
            </Field>
          </FadeIn>

          {/* ── Dates ── */}
          <FadeIn delay={0.2}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text,
              margin: '32px 0 16px', paddingBottom: 8, borderBottom: `1px solid ${C.sand}`,
            }}>When does it run?</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="offer-form-grid">
              <Field label="Start date" hint="Leave blank to start as soon as we post it.">
                <input style={FIELD} type="date" value={form.startDate} onChange={set('startDate')} />
              </Field>
              <Field label="End date" hint="When does this offer expire?">
                <input style={FIELD} type="date" value={form.endDate} onChange={set('endDate')} />
              </Field>
            </div>
          </FadeIn>

          {/* ── Anything else ── */}
          <FadeIn delay={0.25}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.text,
              margin: '32px 0 16px', paddingBottom: 8, borderBottom: `1px solid ${C.sand}`,
            }}>Anything else?</div>

            <Field label="Other restrictions or fine print (optional)" hint="Dine-in only? Excludes alcohol? Weekdays only? Put it here.">
              <textarea style={{ ...FIELD, minHeight: 60, resize: 'vertical' }}
                value={form.otherRestrictions} onChange={set('otherRestrictions')}
                placeholder="e.g. Valid for dine-in only. Cannot be combined with other offers."
              />
            </Field>
          </FadeIn>

          {/* ── Live preview ── */}
          {livePreview && (
            <FadeIn delay={0.3}>
              <div style={{
                background: '#fff', border: `1.5px solid ${C.sunset}40`, borderRadius: 14,
                padding: '20px 24px', margin: '24px 0',
              }}>
                <div style={{ ...LABEL, marginBottom: 10, color: C.sunset }}>Preview - what customers will see</div>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: 0, fontFamily: "'Libre Franklin', sans-serif" }}>
                  {livePreview}
                </p>
              </div>
            </FadeIn>
          )}

          {/* ── Agreement ── */}
          <FadeIn delay={0.3}>
            <div style={{
              background: `${C.sand}30`, borderRadius: 12, padding: '16px 20px',
              margin: '20px 0 24px', fontSize: 13, color: C.textLight, lineHeight: 1.7,
              fontFamily: "'Libre Franklin', sans-serif",
            }}>
              By submitting this offer, you agree that your business is solely responsible for honoring it as described above. The platform displays your offer as provided and is not liable for fulfillment, inventory, or availability. Full terms at <a href="/terms" style={{ color: C.sage }}>/terms</a>.
            </div>
          </FadeIn>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1.5px solid #FECACA', borderRadius: 10,
              padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#B91C1C',
              fontFamily: "'Libre Franklin', sans-serif",
            }}>{error}</div>
          )}

          <Btn
            variant="sunset"
            style={{ width: '100%', padding: '14px 0', fontSize: 16, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : 'Submit Offer for Review'}
          </Btn>

          <p style={{ textAlign: 'center', fontSize: 13, color: C.textMuted, margin: '16px 0 0', lineHeight: 1.6 }}>
            Nothing goes live until we review it. Questions? Text Daryl or email <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a>.
          </p>
        </form>
      </div>
      <Footer scrollTo={scrollTo} />
    </div>
  );
}
