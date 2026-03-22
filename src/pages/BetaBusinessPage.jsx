import { useState, useEffect } from 'react';
import { C } from '../data/config';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';

const TIERS = [
  {
    id: 'enhanced',
    label: 'Showcased',
    price: 9,
    tagline: 'Show up when lake visitors go looking',
    features: [
      'Clickable website link',
      'Business description',
      'Expandable listing card',
      'Listed in community directory',
    ],
    slots: null, // unlimited
    accent: C.sage,
  },
  {
    id: 'featured',
    label: 'Highlighted',
    price: 23,
    tagline: 'Stand out from the crowd',
    features: [
      'Everything in Showcased',
      'Spotlight card with logo',
      'Above standard listings',
      'Priority directory placement',
    ],
    slots: 3,
    accent: C.lakeBlue,
    popular: true,
  },
  {
    id: 'premium',
    label: 'Front and Center',
    price: 43,
    tagline: 'Maximum visibility',
    features: [
      'Everything in Highlighted',
      'Full-width banner display',
      'Large logo prominence',
      'Top-of-directory placement',
      'Email contact button',
    ],
    slots: 1,
    accent: C.sunset,
  },
];

const CATEGORIES = [
  'Real Estate', 'Food & Drink', 'Boating & Water', 'Breweries & Wineries',
  'Shopping & Gifts', 'Stays & Rentals', 'Creative Media', 'Home Services',
  'Health & Beauty', 'Pet Services', 'Arts & Culture', 'Other',
];

function TierCard({ tier, slots, onSelect }) {
  const isFull = tier.slots !== null && slots !== null && slots.available === 0;
  const remainingLabel = tier.slots === null
    ? 'Unlimited spots'
    : slots === null
      ? `${tier.slots} spots total`
      : slots.available === 0
        ? 'All spots taken'
        : `${slots.available} of ${tier.slots} spots left`;

  const urgent = tier.slots !== null && slots !== null && slots.available === 1;

  return (
    <div style={{
      background: C.cream,
      borderRadius: 12,
      padding: '28px 24px',
      border: tier.popular ? `2px solid ${C.lakeBlue}` : '1px solid #E8DFD0',
      position: 'relative',
      opacity: isFull ? 0.55 : 1,
      transition: 'box-shadow 0.2s',
      boxShadow: tier.popular ? '0 4px 24px rgba(91,126,149,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      {tier.popular && (
        <div style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: C.lakeBlue,
          color: C.cream,
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          padding: '4px 14px',
          borderRadius: 20,
          whiteSpace: 'nowrap',
        }}>Most Popular</div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: tier.accent,
          marginBottom: 6,
        }}>
          {tier.label}
        </div>
        <div style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 36,
          color: C.text,
          lineHeight: 1,
          fontWeight: 400,
        }}>
          ${tier.price}
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, marginLeft: 4 }}>
            /mo
          </span>
        </div>
        <div style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 12,
          color: C.textLight,
          marginTop: 4,
        }}>
          {tier.tagline}
        </div>
      </div>

      {/* Slot availability */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
        padding: '8px 12px',
        background: isFull ? '#FEF2F2' : urgent ? '#FFF7ED' : '#F0F9F0',
        borderRadius: 6,
      }}>
        <span style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: isFull ? '#DC2626' : urgent ? C.sunset : C.sage,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: isFull ? '#DC2626' : urgent ? C.sunset : C.sageDark,
          letterSpacing: 0.5,
        }}>
          {remainingLabel}
        </span>
      </div>

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
        {tier.features.map(f => (
          <li key={f} style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 13,
            color: C.textLight,
            padding: '5px 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            borderBottom: '1px solid rgba(196,180,152,0.2)',
          }}>
            <span style={{ color: tier.accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => !isFull && onSelect(tier)}
        disabled={isFull}
        style={{
          width: '100%',
          padding: '13px',
          background: isFull ? '#E8DFD0' : tier.accent,
          color: isFull ? C.textMuted : C.cream,
          border: 'none',
          borderRadius: 6,
          fontFamily: "'Libre Franklin', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor: isFull ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        {isFull ? 'Slots Full' : 'Start Free'}
      </button>

      <p style={{
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 10,
        color: C.textMuted,
        textAlign: 'center',
        margin: '10px 0 0',
        letterSpacing: 0.3,
      }}>
        Free through May 10 · then ${tier.price}/mo
      </p>
    </div>
  );
}

function CheckoutForm({ tier, onBack, onSuccess }) {
  const [form, setForm] = useState({ businessName: '', category: '', email: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) { setError('Business name is required.'); return; }
    if (!form.category) { setError('Please select a category.'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('A valid email is required.'); return; }
    setError('');
    setStatus('submitting');

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier:         tier.id,
          businessName: form.businessName.trim(),
          category:     form.category,
          email:        form.email.trim().toLowerCase(),
          mode:         'subscription',
          isBeta:       true,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
        setStatus('idle');
      }
    } catch {
      setError('Unable to connect. Please try again.');
      setStatus('idle');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 6,
    border: '1px solid #C4B498',
    fontSize: 15,
    fontFamily: "'Libre Franklin', sans-serif",
    color: C.text,
    background: '#FAF6EF',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: C.textMuted,
    marginBottom: 6,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 12,
          color: C.textMuted,
          cursor: 'pointer',
          padding: '0 0 20px',
          letterSpacing: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Back to tiers
      </button>

      <div style={{
        background: '#F0F7FB',
        border: '1px solid rgba(91,126,149,0.2)',
        borderRadius: 8,
        padding: '14px 18px',
        marginBottom: 24,
      }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: C.lakeBlue, marginBottom: 4 }}>
          Selected: {tier.label} Listing
        </div>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textLight }}>
          Free through May 10 · then ${tier.price}/mo · cancel anytime
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="bb-name">Business Name</label>
          <input
            id="bb-name"
            type="text"
            placeholder="Your Business Name"
            value={form.businessName}
            onChange={e => set('businessName', e.target.value)}
            style={inputStyle}
            disabled={status === 'submitting'}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="bb-category">Category</label>
          <select
            id="bb-category"
            value={form.category}
            onChange={e => set('category', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
            disabled={status === 'submitting'}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle} htmlFor="bb-email">Email Address</label>
          <input
            id="bb-email"
            type="email"
            placeholder="you@yourbusiness.com"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            style={inputStyle}
            disabled={status === 'submitting'}
            autoComplete="email"
          />
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, margin: '5px 0 0' }}>
            Receipts and listing updates will go here
          </p>
        </div>

        {error && (
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.sunset, margin: '0 0 14px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          style={{
            width: '100%',
            padding: '14px',
            background: status === 'submitting' ? 'rgba(212,132,90,0.5)' : C.sunset,
            color: C.cream,
            border: 'none',
            borderRadius: 6,
            fontFamily: "'Libre Franklin', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'submitting' ? 'Redirecting to checkout…' : 'Continue to Checkout →'}
        </button>

        <p style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 11,
          color: C.textMuted,
          textAlign: 'center',
          margin: '12px 0 0',
          lineHeight: 1.6,
        }}>
          Secured by Stripe · Card stored, not charged until May 10 · Cancel before then for zero cost
        </p>
      </form>
    </div>
  );
}

export default function BetaBusinessPage() {
  const [slots, setSlots] = useState(null); // null = loading
  const [selectedTier, setSelectedTier] = useState(null);

  // Check for success return from Stripe
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const success = params.get('success');
  const businessName = params.get('business');

  useEffect(() => {
    fetch('/api/slot-availability')
      .then(r => r.json())
      .then(d => setSlots(d))
      .catch(() => setSlots(null));
  }, []);

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', flexDirection: 'column' }}>
        <GlobalStyles />
        <Navbar isSubPage />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: 48, color: C.sunset, margin: '0 0 12px' }}>
            You're listed!
          </p>
          <p style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 22,
            color: C.text,
            margin: '0 0 16px',
            fontWeight: 400,
          }}>
            {businessName ? `${decodeURIComponent(businessName)} is now on Manitou Beach.` : 'Your listing is live.'}
          </p>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.textLight, maxWidth: 400, lineHeight: 1.7, margin: '0 0 32px' }}>
            Your listing will be live when the site launches on April 10. You won't be charged anything until May 10 — check your email for confirmation.
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              background: C.sunset,
              color: C.cream,
              fontFamily: "'Libre Franklin', sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              padding: '13px 28px',
              borderRadius: 4,
              textDecoration: 'none',
            }}
          >
            Explore the Site
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Checkout form ────────────────────────────────────────────────────────
  if (selectedTier) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream }}>
        <GlobalStyles />
        <Navbar isSubPage />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '60px 24px' }}>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: C.sunsetLight,
            marginBottom: 8,
          }}>
            Founding Business Listing
          </p>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 32,
            fontWeight: 400,
            color: C.text,
            margin: '0 0 32px',
          }}>
            Activate Your Free Listing
          </h1>
          <CheckoutForm
            tier={selectedTier}
            onBack={() => setSelectedTier(null)}
          />
        </div>
        <Footer />
      </div>
    );
  }

  // ── Tier selection ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: C.cream }}>
      <GlobalStyles />
      <Navbar isSubPage />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 3.5,
            textTransform: 'uppercase',
            color: C.sunsetLight,
            margin: '0 0 12px',
          }}>
            Founding Business — Get Listed Before We Open
          </p>
          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 400,
            color: C.text,
            margin: '0 0 16px',
            lineHeight: 1.2,
          }}>
            Your listing, free through May 10
          </h1>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 15,
            color: C.textLight,
            maxWidth: 520,
            margin: '0 auto 24px',
            lineHeight: 1.7,
          }}>
            This is where Manitou Beach lives online. This summer, it's where lake visitors will find you.<br/><br/>Choose your tier and add your card. We won't charge anything until May 10 —
            that's your entire founding period free. Cancel before then and you owe nothing.
          </p>

          {/* Beta bonus badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#FFF7ED',
            border: '1px solid rgba(212,132,90,0.3)',
            borderRadius: 20,
            padding: '8px 18px',
          }}>
            <span style={{ fontSize: 14 }}>🎁</span>
            <span style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: C.sunset,
            }}>
              Beta founders · Site launches April 10 · No charge until May 10
            </span>
          </div>
        </div>

        {/* Tier grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          marginBottom: 48,
        }}>
          {TIERS.map(tier => (
            <TierCard
              key={tier.id}
              tier={tier}
              slots={slots ? slots[tier.id] : null}
              onSelect={setSelectedTier}
            />
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 12,
          color: C.textMuted,
          textAlign: 'center',
          lineHeight: 1.7,
        }}>
          All listings are monthly subscriptions — cancel anytime, no contracts.
          Founding members keep this pricing for as long as they remain subscribed.
          Questions? <a href="mailto:events@yetigroove.com" style={{ color: C.lakeBlue }}>Email us</a> or DM on Facebook.
        </p>
      </div>

      <Footer />
    </div>
  );
}
