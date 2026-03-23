import { useState } from 'react';
import { C } from '../data/config';

// Reusable SMS opt-in widget — drop into any page
// Props:
//   type      — 'general' | 'event' | 'deals' | 'welcome'  (default: 'general')
//   source    — page slug for tracking (e.g. 'happening', 'village')
//   heading   — optional override headline
//   subtext   — optional override description
//   compact   — if true, renders single-line inline style
//   style     — optional container style override

export default function SMSOptInWidget({
  type = 'general',
  source = '',
  heading,
  subtext,
  compact = false,
  style: containerStyle,
}) {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const defaultHeadings = {
    general: 'Get text alerts',
    event:   'Never miss an event',
    deals:   'Get deal alerts',
    welcome: 'Weekend highlights by text',
  };

  const defaultSubtext = {
    general: "What's happening at Manitou Beach — straight to your phone.",
    event:   'Get a reminder before events you care about.',
    deals:   'Time-sensitive specials from local businesses.',
    welcome: "One text with this weekend's highlights when you arrive.",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) { setError('Enter a valid 10-digit phone number.'); return; }
    if (!consent) { setError('Please check the consent box.'); return; }

    setStatus('submitting');
    try {
      const res = await fetch('/api/sms-optin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, type, source }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setError(data.error || 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setError('Unable to connect. Try again.');
      setStatus('error');
    }
  };

  // ── Success state ─────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={{
        background: C.sage + '15',
        border: `1px solid ${C.sage}33`,
        borderRadius: 10,
        padding: compact ? '14px 20px' : '20px 24px',
        textAlign: 'center',
        ...containerStyle,
      }}>
        <p style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 15, fontWeight: 600, color: C.sage, margin: 0,
        }}>
          You're subscribed!
        </p>
        <p style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 13, color: C.textMuted, margin: '6px 0 0',
        }}>
          Check your phone for a confirmation text. Reply STOP anytime.
        </p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: C.warmWhite,
      border: `1px solid ${C.sand}`,
      borderRadius: 10,
      padding: compact ? '16px 20px' : '24px 28px',
      ...containerStyle,
    }}>
      {!compact && (
        <>
          <p style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 18, fontWeight: 400, color: C.dusk, margin: '0 0 6px',
          }}>
            {heading || defaultHeadings[type] || defaultHeadings.general}
          </p>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 14, color: C.textMuted, lineHeight: 1.6, margin: '0 0 16px',
          }}>
            {subtext || defaultSubtext[type] || defaultSubtext.general}
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 10 : 12,
        alignItems: compact ? 'center' : 'stretch',
      }}>
        {compact && (
          <span style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 13, fontWeight: 600, color: C.dusk,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {heading || defaultHeadings[type] || 'Get text alerts'}
          </span>
        )}

        <input
          type="tel"
          placeholder="(555) 555-5555"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          inputMode="numeric"
          autoComplete="tel"
          disabled={status === 'submitting'}
          style={{
            flex: 1,
            padding: compact ? '10px 14px' : '12px 16px',
            fontSize: 16,
            fontFamily: "'Libre Franklin', sans-serif",
            border: `1px solid ${C.sand}`,
            borderRadius: 6,
            background: '#fff',
            color: C.text,
            outline: 'none',
            boxSizing: 'border-box',
            minWidth: 0,
          }}
        />

        <button
          type="submit"
          disabled={status === 'submitting' || !phone || !consent}
          style={{
            padding: compact ? '10px 18px' : '13px 24px',
            background: (status === 'submitting' || !phone || !consent) ? C.sage + '66' : C.sage,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontFamily: "'Libre Franklin', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 0.5,
            cursor: (status === 'submitting' || !phone || !consent) ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {status === 'submitting' ? 'Subscribing...' : 'Subscribe'}
        </button>

        {/* Consent checkbox — always below the input row */}
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          ...(compact ? { flexBasis: '100%', order: 3 } : {}),
        }}>
          <input
            type="checkbox"
            id={`sms-consent-${type}-${source}`}
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, width: 15, height: 15, cursor: 'pointer' }}
          />
          <label htmlFor={`sms-consent-${type}-${source}`} style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11, color: C.textMuted, lineHeight: 1.5, cursor: 'pointer',
          }}>
            I agree to receive SMS from Manitou Beach. Msg &amp; data rates may apply. Reply <strong>STOP</strong> to unsubscribe. <a href="/privacy" style={{ color: C.sage }}>Privacy</a> · <a href="/terms" style={{ color: C.sage }}>Terms</a>
          </label>
        </div>

        {error && (
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 13, color: '#c0392b', margin: 0,
            ...(compact ? { flexBasis: '100%', order: 4 } : {}),
          }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
