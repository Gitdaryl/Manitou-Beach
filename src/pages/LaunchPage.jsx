import { useState, useEffect, useRef } from 'react';
import { C } from '../data/config';
import { GlobalStyles } from '../components/Layout';
import yeti from '../data/errorMessages';

const LAUNCH_DATE = new Date('2026-05-01T16:00:00Z');
const SITE_URL = 'https://manitoubeachmichigan.com';

// ── Countdown hook ─────────────────────────────────────────────────────────────
function computeParts(target) {
  const diff = Math.max(0, target - Date.now());
  if (diff === 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
  return {
    days:     Math.floor(diff / 86400000),
    hours:    Math.floor((diff % 86400000) / 3600000),
    minutes:  Math.floor((diff % 3600000)  / 60000),
    seconds:  Math.floor((diff % 60000)    / 1000),
    launched: false,
  };
}

function useCountdown(target) {
  const [parts, setParts] = useState(() => computeParts(target));
  useEffect(() => {
    const id = setInterval(() => setParts(computeParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return parts;
}

// ── CountdownStrip ─────────────────────────────────────────────────────────────
function CountdownStrip({ parts }) {
  const units = [
    { value: parts.days,    label: 'Days' },
    { value: parts.hours,   label: 'Hours' },
    { value: parts.minutes, label: 'Mins' },
    { value: parts.seconds, label: 'Secs' },
  ];
  return (
    <div style={{ display: 'flex', gap: 'clamp(6px, 2.5vw, 32px)', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {units.map(({ value, label }, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2.5vw, 32px)', minWidth: 0 }}>
          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(32px, 9vw, 84px)',
              fontWeight: 400,
              color: C.cream,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>
              {String(value).padStart(2, '0')}
            </div>
            <div style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 'clamp(8px, 2vw, 10px)',
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginTop: 6,
            }}>
              {label}
            </div>
          </div>
          {i < 3 && (
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(20px, 4vw, 52px)',
              color: 'rgba(255,255,255,0.2)',
              lineHeight: 1,
              marginBottom: 16,
              userSelect: 'none',
            }}>·</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── LaunchedMessage ────────────────────────────────────────────────────────────
function LaunchedMessage() {
  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(28px, 5vw, 48px)', color: C.sunsetLight, margin: '0 0 24px 0' }}>
        We're live!
      </p>
      <a href="/" style={{
        display: 'inline-block', background: C.sunset, color: C.cream,
        fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 14,
        letterSpacing: 2, textTransform: 'uppercase', padding: '14px 36px', borderRadius: 4, textDecoration: 'none',
      }}>
        Explore Manitou Beach
      </a>
    </div>
  );
}

// ── BetaFullMessage ────────────────────────────────────────────────────────────
function BetaFullMessage() {
  return (
    <div style={{ textAlign: 'center', animation: 'slideUp 0.6s ease both', maxWidth: 420, width: '100%' }}>
      <p style={{ fontFamily: "'Caveat', cursive", fontSize: 'clamp(30px, 5.5vw, 48px)', color: C.sunsetLight, margin: '0 0 10px 0', lineHeight: 1.15 }}>
        The yeti ate all 30 spots.
      </p>
      <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 8px 0' }}>
        Beta access is full - every last one, gone like hot cookies at Blackbird.
      </p>
      <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, margin: '0 0 24px 0' }}>
        But the gates open to everyone on May 1 at noon.<br />
        See you on the lake.
      </p>
    </div>
  );
}

// ── SpotsCounter ───────────────────────────────────────────────────────────────
function SpotsCounter({ remaining }) {
  if (remaining === null) return null;
  const urgent = remaining <= 5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{
        display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
        background: urgent ? C.sunset : C.sage,
        animation: 'pulse-glow 2s ease-in-out infinite', flexShrink: 0,
      }} />
      <span style={{
        fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700,
        letterSpacing: 2, textTransform: 'uppercase',
        color: urgent ? C.sunsetLight : 'rgba(255,255,255,0.45)',
      }}>
        {remaining === 0 ? 'No spots remaining' : `${remaining} spot${remaining === 1 ? '' : 's'} remaining`}
      </span>
    </div>
  );
}

// ── AnimatedCode - characters reveal one by one ────────────────────────────────
function AnimatedCode({ code }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(4px, 1.5vw, 10px)', flexWrap: 'nowrap' }}>
      {code.split('').map((char, i) => (
        <span
          key={i}
          style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(32px, 7vw, 52px)',
            color: C.sunsetLight,
            letterSpacing: '0.04em',
            lineHeight: 1,
            display: 'inline-block',
            animation: `codeCharReveal 0.4s ease both`,
            animationDelay: `${i * 0.08}s`,
            opacity: 0,
          }}
        >
          {char}
        </span>
      ))}
      <style>{`
        @keyframes codeCharReveal {
          from { opacity: 0; transform: translateY(12px) scale(0.7); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ── SitePreviewPeek - teaser pills of what's inside ───────────────────────────
function SitePreviewPeek() {
  const items = [
    { icon: '📅', label: 'Local Events' },
    { icon: '🍺', label: 'Businesses' },
    { icon: '🚤', label: 'Lake Life' },
    { icon: '🍔', label: 'Food Trucks' },
    { icon: '🗞️', label: 'The Dispatch' },
    { icon: '🎁', label: 'Free Cookie' },
  ];
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <p style={{
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        margin: '0 0 10px',
        textAlign: 'center',
      }}>
        What you'll find on May 1
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {items.map(({ icon, label }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '6px 12px',
          }}>
            <span style={{ fontSize: 13 }}>{icon}</span>
            <span style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11,
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 500,
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WhatsNextTimeline ─────────────────────────────────────────────────────────
function WhatsNextTimeline({ isBusiness }) {
  const steps = [
    { dot: C.sage,      text: 'Your spot is locked in. Screenshot your code.' },
    { dot: C.lakeBlue,  text: isBusiness ? 'Check your email - activate your free listing.' : 'May 1 at noon - the gates open.' },
    { dot: C.sunsetLight, text: isBusiness ? 'Your listing goes live to thousands of visitors.' : 'Redeem your free cookie at Blackbird Cafe.' },
  ];
  return (
    <div style={{ width: '100%', maxWidth: 340 }}>
      <p style={{
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        margin: '0 0 12px',
        textAlign: 'center',
      }}>
        What happens next
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', paddingLeft: 8 }}>
        {steps.map(({ dot, text }, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: dot,
              flexShrink: 0,
              marginTop: 3,
            }} />
            <span style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.5,
              textAlign: 'left',
            }}>
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ShareButtons ──────────────────────────────────────────────────────────────
function ShareButtons() {
  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Manitou Beach Launches!')}&dates=20260501T160000Z/20260501T170000Z&details=${encodeURIComponent('The site goes live! manitoubeachmichigan.com')}&location=${encodeURIComponent('manitoubeachmichigan.com')}`;
  const fbUrl  = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`;
  const smsUrl = `sms:?&body=${encodeURIComponent('I just got early beta access to the new Manitou Beach community platform - pretty cool! Only a few spots left if you want one: ' + SITE_URL)}`;

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 20,
    fontFamily: "'Libre Franklin', sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textDecoration: 'none',
    cursor: 'pointer',
    border: 'none',
  };

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      <p style={{
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 9, fontWeight: 700, letterSpacing: 2.5,
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        margin: '0 0 10px', textAlign: 'center',
      }}>
        Save the date · Spread the word
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={calUrl} target="_blank" rel="noopener noreferrer" style={{
          ...btnBase,
          background: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          📅 Add May 1 to Calendar
        </a>
        <a href={fbUrl} target="_blank" rel="noopener noreferrer" style={{
          ...btnBase,
          background: 'rgba(24,119,242,0.2)',
          color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(24,119,242,0.3)',
        }}>
          👍 Share on Facebook
        </a>
        <a href={smsUrl} style={{
          ...btnBase,
          background: 'rgba(122,142,114,0.25)',
          color: 'rgba(255,255,255,0.65)',
          border: '1px solid rgba(122,142,114,0.3)',
        }}>
          💬 Text a Friend
        </a>
      </div>
    </div>
  );
}

// ── SignupForm ─────────────────────────────────────────────────────────────────
function SignupForm({ remaining, onSpotsUpdate }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', is_business: false, _hp: '' });
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) { setError('Your name is required.'); return false; }
    if (![10, 11].includes(form.phone.replace(/\D/g, '').length)) { setError('Enter a valid 10-digit phone number.'); return false; }
    const e = form.email.trim().toLowerCase();
    if (!e || !e.includes('@')) { setError('A valid email address is required.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form._hp) return;
    setError('');
    if (!validate()) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name.trim(),
          phone:       form.phone.replace(/\D/g, ''),
          email:       form.email.trim().toLowerCase(),
          is_business: form.is_business,
          _hp:         form._hp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        try { localStorage.setItem('mb_beta_code', data.code); } catch {}
        onSpotsUpdate(data.remaining_codes);
        setResult({
          name:         form.name.trim().split(' ')[0],
          code:         data.code,
          remaining:    data.remaining_codes,
          spot_number:  data.spot_number,
          is_business:  data.is_business,
        });
        setStatus('success');
      } else {
        onSpotsUpdate(0);
        setError(data.error || yeti.oops());
        setStatus('idle');
      }
    } catch {
      setError(yeti.network());
      setStatus('idle');
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)', fontSize: 16,
    fontFamily: "'Libre Franklin', sans-serif",
    background: 'rgba(255,255,255,0.07)', color: C.cream,
    outline: 'none', boxSizing: 'border-box', WebkitAppearance: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: 3,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
    marginBottom: 7, fontFamily: "'Libre Franklin', sans-serif",
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === 'success' && result) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 24, animation: 'slideUp 0.6s ease both', maxWidth: 440, width: '100%',
      }}>
        {/* Welcome headline */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(30px, 5.5vw, 46px)',
            color: C.cream, margin: '0 0 6px 0', lineHeight: 1.1,
          }}>
            Welcome to Manitou Beach, {result.name}.
          </p>
          {result.spot_number && (
            <p style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 12, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', color: C.sage, margin: 0,
            }}>
              You're beta tester #{result.spot_number} of 30
            </p>
          )}
        </div>

        {/* Code block with animated reveal */}
        <div style={{
          border: '1px solid rgba(212,132,90,0.35)',
          background: 'rgba(212,132,90,0.08)',
          borderRadius: 10, padding: '20px 28px', width: '100%', textAlign: 'center',
        }}>
          <div style={{ ...labelStyle, textAlign: 'center', marginBottom: 12 }}>Your Access Code</div>
          <AnimatedCode code={result.code} />
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            margin: '12px 0 0', letterSpacing: 0.5,
          }}>
            Save this - enter it on this page anytime to access the site
          </p>
        </div>

        {/* Enter the site now CTA */}
        <button
          onClick={() => window.location.replace('/')}
          className="btn-animated"
          style={{
            width: '100%', padding: '15px 24px',
            background: C.sunset, color: C.cream,
            border: 'none', borderRadius: 4,
            fontFamily: "'Libre Franklin', sans-serif",
            fontWeight: 700, fontSize: 14,
            letterSpacing: 2, textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Enter the Site Now →
        </button>

        {/* Business-specific OR community messaging */}
        {result.is_business ? (
          <div style={{
            background: 'rgba(91,126,149,0.12)',
            border: '1px solid rgba(91,126,149,0.25)',
            borderRadius: 8, padding: '14px 18px', width: '100%', textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.65,
            }}>
              <span style={{ color: C.sunsetLight, fontWeight: 700 }}>Check your email</span>
              {' '}- we sent a link to activate your{' '}
              <span style={{ color: C.cream, fontWeight: 600 }}>free listing</span>.
              {' '}No charge until May 10. You're a founding business on Manitou Beach.
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(122,142,114,0.12)',
            border: '1px solid rgba(122,142,114,0.2)',
            borderRadius: 8, padding: '14px 18px', width: '100%', textAlign: 'center',
          }}>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 6px', lineHeight: 1.5 }}>
              <span style={{ fontSize: 16 }}>🎁</span>{' '}
              <span style={{ color: C.sunsetLight, fontWeight: 700 }}>Free cookie from Blackbird Cafe</span>
              {' '}- claim it on the site when it opens May 1.
            </p>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 4px' }}>
              Your welcome gift from the Manitou Beach community.
            </p>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              First 20 people only. Expires May 31.
            </p>
          </div>
        )}

        {/* Scarcity after signup */}
        {result.remaining !== null && result.remaining > 0 && (
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 11,
            color: result.remaining <= 5 ? C.sunsetLight : 'rgba(255,255,255,0.22)',
            letterSpacing: 1.5, textTransform: 'uppercase', margin: '-10px 0 -8px', textAlign: 'center',
          }}>
            Only {result.remaining} spot{result.remaining === 1 ? '' : 's'} left after yours.
          </p>
        )}
        {result.remaining === 0 && (
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 11,
            color: C.sunsetLight, letterSpacing: 1.5, textTransform: 'uppercase',
            margin: '-10px 0 -8px', textAlign: 'center',
          }}>
            You got the last spot.
          </p>
        )}

        {/* What you'll find */}
        <SitePreviewPeek />

        {/* What happens next */}
        <WhatsNextTimeline isBusiness={result.is_business} />

        {/* Share & calendar */}
        <ShareButtons />
      </div>
    );
  }

  // ── Full state ─────────────────────────────────────────────────────────────
  if (remaining === 0) return <BetaFullMessage />;

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%', maxWidth: 400 }}>
      {/* Honeypot */}
      <input
        type="text" name="_hp" value={form._hp} onChange={e => set('_hp', e.target.value)}
        tabIndex={-1} aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        autoComplete="off"
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle} htmlFor="beta-name">Name</label>
          <input id="beta-name" type="text" autoComplete="given-name" placeholder="First name"
            value={form.name} onChange={e => set('name', e.target.value)}
            style={inputStyle} disabled={status === 'submitting'} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle} htmlFor="beta-phone">Mobile</label>
          <input id="beta-phone" type="tel" autoComplete="tel" placeholder="(555) 555-5555"
            value={form.phone} onChange={e => set('phone', e.target.value)}
            style={inputStyle} disabled={status === 'submitting'} inputMode="numeric" />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle} htmlFor="beta-email">Email</label>
        <input id="beta-email" type="email" autoComplete="email" placeholder="your@email.com"
          value={form.email} onChange={e => set('email', e.target.value)}
          style={inputStyle} disabled={status === 'submitting'} />
      </div>

      {/* Cookie teaser above checkbox */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(122,142,114,0.1)',
        border: '1px solid rgba(122,142,114,0.2)',
        borderRadius: 6, padding: '8px 12px', marginBottom: 12,
      }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>🎁</span>
        <span style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4,
        }}>
          Every beta tester gets a <span style={{ color: C.sunsetLight, fontWeight: 700 }}>free cookie from Blackbird Cafe</span> - claim it on site. First 20 people only, expires May 31.
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input
            type="checkbox" checked={form.is_business} onChange={e => set('is_business', e.target.checked)}
            disabled={status === 'submitting'}
            style={{ accentColor: C.sunset, width: 16, height: 16, flexShrink: 0, cursor: 'pointer', marginTop: 1 }}
          />
          <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
            I own or manage a local business -{' '}
            <span style={{ color: C.sunsetLight }}>get a free listing through May 10</span>
          </span>
        </label>
      </div>

      {error && (
        <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.sunsetLight, margin: '0 0 10px 0' }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-animated"
        style={{
          width: '100%', padding: '15px 24px',
          background: status === 'submitting' ? 'rgba(212,132,90,0.5)' : C.sunset,
          color: C.cream, border: 'none', borderRadius: 4,
          fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700,
          fontSize: 14, letterSpacing: 2, textTransform: 'uppercase',
          cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          animation: status === 'idle' ? 'pulse-glow 3s ease-in-out infinite' : 'none',
        }}
      >
        {status === 'submitting' ? 'Claiming your spot…' : 'Claim My Spot →'}
      </button>

      <p style={{
        fontFamily: "'Libre Franklin', sans-serif", fontSize: 11,
        color: 'rgba(255,255,255,0.2)', textAlign: 'center',
        margin: '10px 0 0 0', letterSpacing: 0.5,
      }}>
        Code appears on screen · Free for everyone · Cancel newsletter anytime
      </p>
    </form>
  );
}

// ── CodeEntryForm - for returning testers on a new device ──────────────────────
function CodeEntryForm() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle | checking | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!/^MB[A-Z0-9]{4}$/.test(clean)) {
      setErrorMsg('Codes start with MB followed by 4 characters - e.g. MB7X2K.');
      return;
    }
    setStatus('checking');
    setErrorMsg('');
    try {
      const res = await fetch('/api/beta-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();
      if (data.valid) {
        try { localStorage.setItem('mb_beta_code', clean); } catch {}
        setStatus('success');
        setTimeout(() => { window.location.replace('/'); }, 1200);
      } else {
        setErrorMsg("That code didn't match. Double-check the text we sent you.");
        setStatus('idle');
      }
    } catch {
      setErrorMsg("Couldn't reach the server - try again in a moment.");
      setStatus('idle');
    }
  };

  const inputBase = {
    width: '100%', padding: '13px 16px', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
    color: C.cream, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Libre Franklin', sans-serif", WebkitAppearance: 'none',
  };

  return (
    <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 24, cursor: 'pointer',
            padding: '10px 22px',
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
          }}
        >
          Already have a code? Enter here →
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: 2.5, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', margin: 0,
          }}>
            Enter your beta code
          </p>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setErrorMsg(''); }}
            placeholder="MB7X2K"
            maxLength={6}
            autoFocus
            autoCapitalize="characters"
            style={{ ...inputBase, fontSize: 22, fontWeight: 700, letterSpacing: 6, textAlign: 'center' }}
          />
          {errorMsg && (
            <p style={{
              color: '#ff8b7b', fontSize: 13, margin: 0,
              fontFamily: "'Libre Franklin', sans-serif",
            }}>
              {errorMsg}
            </p>
          )}
          {status === 'success' ? (
            <p style={{
              color: C.sage, fontSize: 14, margin: 0,
              fontFamily: "'Libre Franklin', sans-serif",
            }}>
              ✓ Code accepted - heading in...
            </p>
          ) : (
            <button
              type="submit"
              disabled={status === 'checking'}
              style={{
                padding: '13px 24px', borderRadius: 6, border: 'none',
                background: status === 'checking' ? 'rgba(255,255,255,0.08)' : C.sunset,
                color: status === 'checking' ? 'rgba(255,255,255,0.35)' : '#fff',
                fontFamily: "'Libre Franklin', sans-serif",
                fontSize: 13, fontWeight: 700, letterSpacing: 1.5,
                textTransform: 'uppercase',
                cursor: status === 'checking' ? 'default' : 'pointer',
              }}
            >
              {status === 'checking' ? 'Checking...' : 'Enter the Site'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

// ── LaunchPage ─────────────────────────────────────────────────────────────────
export default function LaunchPage() {
  const parts = useCountdown(LAUNCH_DATE);
  const videoRef = useRef(null);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true;
  }, []);

  useEffect(() => {
    fetch('/api/beta-signup')
      .then(r => r.json())
      .then(d => setRemaining(d.remaining ?? null))
      .catch(() => setRemaining(null));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.night }}>
      <GlobalStyles />

      {/* Video background - fixed so it stays put while content scrolls */}
      <video ref={videoRef} autoPlay loop muted playsInline style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', zIndex: 0, opacity: 0.6,
      }}>
        <source src="/videos/hero-default.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay - fixed */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(170deg, rgba(26,40,48,0.88) 0%, rgba(26,40,48,0.65) 50%, rgba(26,40,48,0.92) 100%)',
        zIndex: 1,
      }} />

      {/* Wordmark */}
      <div style={{ position: 'fixed', top: 28, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 3 }}>
        <span style={{
          fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
        }}>
          Manitou Beach · Michigan
        </span>
      </div>

      {/* Main content - scrolls naturally with the page */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 640,
        margin: '0 auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '80px 24px 60px',
        gap: 'clamp(16px, 2.5vh, 28px)',
        textAlign: 'center',
        animation: 'slideUp 0.8s ease both',
      }}>

        {/* Label */}
        <p style={{
          fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700,
          letterSpacing: 3.5, textTransform: 'uppercase', color: C.sunsetLight,
          margin: 0, opacity: 0.85,
        }}>
          Beta Access · Launching May 1
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 'clamp(30px, 5.5vw, 58px)',
          fontWeight: 400, color: C.cream, margin: 0, lineHeight: 1.15,
        }}>
          Something Special is Coming<br />
          <span style={{ color: C.driftwood }}>to Manitou Beach</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(20px, 3.5vw, 32px)',
          color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1,
        }}>
          Devils Lake, Michigan
        </p>

        {/* Countdown or launched */}
        {parts.launched ? <LaunchedMessage /> : <CountdownStrip parts={parts} />}

        {!parts.launched && (
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.15)' }} />
        )}

        {!parts.launched && <SpotsCounter remaining={remaining} />}

        {!parts.launched && (
          <SignupForm remaining={remaining} onSpotsUpdate={setRemaining} />
        )}

        {/* Returning tester on a new device - always visible pre-launch */}
        {!parts.launched && (
          <>
            <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <CodeEntryForm />
          </>
        )}
      </div>

      {/* Privacy */}
      <div style={{ display: 'flex', justifyContent: 'center', zIndex: 2, paddingBottom: 20 }}>
        <a href="/privacy" style={{
          fontFamily: "'Libre Franklin', sans-serif", fontSize: 10,
          letterSpacing: 1.5, textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.2)', textDecoration: 'none',
        }}>
          Privacy
        </a>
      </div>
    </div>
  );
}
