import { useState, useEffect, useRef } from 'react';
import { C } from '../data/config';
import { GlobalStyles } from '../components/Layout';

// ⚙️  LAUNCH DATE — update this when A2P clears and you have a firm date
//   12:00pm Eastern on launch day = UTC+4 during EDT
const LAUNCH_DATE = new Date('2026-04-10T16:00:00Z');

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
    <div style={{
      display: 'flex',
      gap: 'clamp(12px, 3vw, 32px)',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {units.map(({ value, label }, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 32px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(44px, 8vw, 84px)',
              fontWeight: 400,
              color: C.cream,
              lineHeight: 1,
              minWidth: '2ch',
              tabularNums: true,
              letterSpacing: '-0.02em',
            }}>
              {String(value).padStart(2, '0')}
            </div>
            <div style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 10,
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
              fontSize: 'clamp(28px, 5vw, 52px)',
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
      <p style={{
        fontFamily: "'Caveat', cursive",
        fontSize: 'clamp(28px, 5vw, 48px)',
        color: C.sunsetLight,
        margin: '0 0 24px 0',
      }}>
        We're live!
      </p>
      <a
        href="/"
        style={{
          display: 'inline-block',
          background: C.sunset,
          color: C.cream,
          fontFamily: "'Libre Franklin', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 2,
          textTransform: 'uppercase',
          padding: '14px 36px',
          borderRadius: 4,
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        Explore Manitou Beach
      </a>
    </div>
  );
}

// ── SignupForm ─────────────────────────────────────────────────────────────────
function SignupForm() {
  const [form, setForm] = useState({ name: '', phone: '', _hp: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [result, setResult] = useState(null);   // { name, code }
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) { setError('Your name is required.'); return false; }
    if (form.phone.replace(/\D/g, '').length !== 10) { setError('Enter a valid 10-digit phone number.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form._hp) return; // honeypot
    setError('');
    if (!validate()) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:  form.name.trim(),
          phone: form.phone.replace(/\D/g, ''),
          _hp:   form._hp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        try { localStorage.setItem('mb_beta_code', data.code); } catch {}
        setResult({ name: form.name.trim().split(' ')[0], code: data.code });
        setStatus('success');
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
    padding: '13px 16px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    fontSize: 16,
    fontFamily: "'Libre Franklin', sans-serif",
    background: 'rgba(255,255,255,0.07)',
    color: C.cream,
    outline: 'none',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 7,
    fontFamily: "'Libre Franklin', sans-serif",
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === 'success' && result) {
    return (
      <div style={{
        textAlign: 'center',
        animation: 'slideUp 0.6s ease both',
        maxWidth: 440,
        width: '100%',
      }}>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(28px, 5vw, 44px)',
          color: C.cream,
          margin: '0 0 20px 0',
          lineHeight: 1.1,
        }}>
          You're in, {result.name}.
        </p>

        {/* Code block */}
        <div style={{
          border: '1px solid rgba(212,132,90,0.35)',
          background: 'rgba(212,132,90,0.08)',
          borderRadius: 8,
          padding: '20px 28px',
          marginBottom: 20,
        }}>
          <div style={labelStyle}>Your Access Code</div>
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(36px, 7vw, 54px)',
            color: C.sunsetLight,
            letterSpacing: '0.12em',
            lineHeight: 1,
          }}>
            {result.code}
          </div>
        </div>

        <p style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 14,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.7,
          margin: 0,
        }}>
          Check your phone — your code is on the way.<br />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            Screenshot this as backup. Opens April 10 at noon.
          </span>
        </p>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ width: '100%', maxWidth: 400 }}
    >
      {/* Honeypot — hidden from humans */}
      <input
        type="text"
        name="_hp"
        value={form._hp}
        onChange={e => set('_hp', e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        autoComplete="off"
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {/* Name */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle} htmlFor="beta-name">Name</label>
          <input
            id="beta-name"
            type="text"
            autoComplete="given-name"
            placeholder="First name"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            style={inputStyle}
            disabled={status === 'submitting'}
          />
        </div>

        {/* Phone */}
        <div style={{ flex: 1 }}>
          <label style={labelStyle} htmlFor="beta-phone">Mobile</label>
          <input
            id="beta-phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 555-5555"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            style={inputStyle}
            disabled={status === 'submitting'}
            inputMode="numeric"
          />
        </div>
      </div>

      {error && (
        <p style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 13,
          color: C.sunsetLight,
          margin: '0 0 10px 0',
        }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-animated"
        style={{
          width: '100%',
          padding: '14px 24px',
          background: status === 'submitting' ? 'rgba(212,132,90,0.5)' : C.sunset,
          color: C.cream,
          border: 'none',
          borderRadius: 4,
          fontFamily: "'Libre Franklin', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 2.5,
          textTransform: 'uppercase',
          cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          animation: status === 'idle' ? 'pulse-glow 3s ease-in-out infinite' : 'none',
        }}
      >
        {status === 'submitting' ? 'Sending…' : 'Request Beta Access'}
      </button>

      <p style={{
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 11,
        color: 'rgba(255,255,255,0.25)',
        textAlign: 'center',
        margin: '10px 0 0 0',
        letterSpacing: 0.5,
      }}>
        Code arrives by text · No spam · Unsubscribe anytime
      </p>
    </form>
  );
}

// ── LaunchPage ─────────────────────────────────────────────────────────────────
export default function LaunchPage() {
  const parts = useCountdown(LAUNCH_DATE);
  const videoRef = useRef(null);

  // Ensure video mute (iOS workaround)
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true;
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      height: '100vh',
      // 100dvh accounts for mobile browser chrome
      // eslint-disable-next-line no-dupe-keys
      overflow: 'hidden',
      background: C.night,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <GlobalStyles />

      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.6,
        }}
      >
        <source src="/videos/hero-default.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(170deg, rgba(26,40,48,0.88) 0%, rgba(26,40,48,0.65) 50%, rgba(26,40,48,0.92) 100%)',
        zIndex: 1,
      }} />

      {/* Wordmark — top center */}
      <div style={{
        position: 'absolute',
        top: 28,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}>
          Manitou Beach · Michigan
        </span>
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(16px, 2.5vh, 28px)',
        padding: '0 24px',
        width: '100%',
        maxWidth: 640,
        textAlign: 'center',
        animation: 'slideUp 0.8s ease both',
      }}>

        {/* Label */}
        <p style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3.5,
          textTransform: 'uppercase',
          color: C.sunsetLight,
          margin: 0,
          opacity: 0.85,
        }}>
          Beta Access · Opening April 10
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 'clamp(30px, 5.5vw, 58px)',
          fontWeight: 400,
          color: C.cream,
          margin: 0,
          lineHeight: 1.15,
        }}>
          Something Special is Coming<br />
          <span style={{ color: C.driftwood }}>to Manitou Beach</span>
        </h1>

        {/* Caveat subtitle */}
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(20px, 3.5vw, 32px)',
          color: 'rgba(255,255,255,0.5)',
          margin: 0,
          lineHeight: 1,
        }}>
          Devils Lake, Michigan
        </p>

        {/* Countdown or launched message */}
        {parts.launched ? <LaunchedMessage /> : <CountdownStrip parts={parts} />}

        {/* Divider */}
        {!parts.launched && (
          <div style={{
            width: 40,
            height: 1,
            background: 'rgba(255,255,255,0.15)',
          }} />
        )}

        {/* Form */}
        {!parts.launched && <SignupForm />}
      </div>

      {/* Bottom privacy note */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        <a
          href="/privacy"
          style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            textDecoration: 'none',
          }}
        >
          Privacy
        </a>
      </div>
    </div>
  );
}
