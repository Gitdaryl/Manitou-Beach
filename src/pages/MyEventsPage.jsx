import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footer, GlobalStyles, Navbar } from '../components/Layout';
import { C } from '../data/config';
import yeti from '../data/errorMessages';

const inp = {
  width: '100%', padding: '15px 16px', borderRadius: 10,
  fontFamily: "'Libre Franklin', sans-serif", fontSize: 16,
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)',
  color: C.cream, outline: 'none', boxSizing: 'border-box',
};

const btn = {
  width: '100%', padding: '15px 20px', borderRadius: 10, border: 'none',
  background: C.sunset, color: '#fff', fontSize: 15, fontWeight: 700,
  fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer',
};

function prettyDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function isPast(iso) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit' }).format(new Date());
  return (iso || '').slice(0, 10) < today;
}

// Tells the browser this page is installable, and points the launcher at THIS
// organizer's link so the icon opens their events rather than a login screen.
// iOS reads these tags from the live DOM at "Add to Home Screen" time, which is
// why they're injected here rather than sitting in index.html for every page.
function useInstallable(phone, token) {
  useEffect(() => {
    const q = phone && token
      ? `?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}`
      : '';
    const added = [];
    const add = (tag, attrs) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      added.push(el);
    };

    add('link', { rel: 'manifest', href: `/api/my-events-manifest${q}` });
    add('link', { rel: 'apple-touch-icon', href: '/images/my-events-192.png' });
    add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
    add('meta', { name: 'apple-mobile-web-app-title', content: 'My Events' });
    add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });
    add('meta', { name: 'theme-color', content: '#1A2830' });

    const prevTitle = document.title;
    document.title = 'My Events - Manitou Beach';
    return () => { added.forEach(el => el.remove()); document.title = prevTitle; };
  }, [phone, token]);
}

// "Add to Home Screen" lives in a different menu on every platform, and the one
// thing worse than no instructions is instructions for the wrong phone.
function AddToHomeScreen() {
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem('mb-a2hs-dismissed') === '1'; } catch { return false; }
  });

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const standalone = typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);
  if (standalone || dismissed) return null;

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);

  const close = () => {
    setDismissed(true);
    try { localStorage.setItem('mb-a2hs-dismissed', '1'); } catch { /* private mode */ }
  };

  return (
    <div style={{ position: 'relative', marginTop: 28, padding: '20px 22px', borderRadius: 14, background: 'rgba(122,142,114,0.14)', border: '1px solid rgba(122,142,114,0.35)' }}>
      <button onClick={close} aria-label="Dismiss" style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <img src="/images/my-events-192.png" alt="" width={40} height={40} style={{ borderRadius: 9 }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: C.cream }}>Keep this on your phone</div>
      </div>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 14px' }}>
        Add it to your home screen and your events are one tap away, like any other app. No link to find, no password.
      </p>
      {prompt ? (
        <button
          onClick={async () => { prompt.prompt(); await prompt.userChoice; setPrompt(null); }}
          style={{ ...btn, background: C.sage }}
        >
          Add to home screen
        </button>
      ) : isIOS ? (
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0 }}>
          Tap <strong>Share</strong> at the bottom of Safari (the square with the arrow), scroll down,
          and tap <strong>Add to Home Screen</strong>.
        </p>
      ) : (
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, margin: 0 }}>
          Open your browser's menu (the three dots) and choose <strong>Add to Home screen</strong>
          {' '}or <strong>Install app</strong>.
        </p>
      )}
    </div>
  );
}

// ── Ask for the phone number, then text them a link ──
function AskForPhone() {
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | sent | none
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) { setError('That looks like it\'s missing a digit or two. Ten numbers, please!'); return; }
    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/my-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); setState('idle'); return; }
      setState(data.found ? 'sent' : 'none');
    } catch {
      setError(yeti.oops());
      setState('idle');
    }
  };

  if (state === 'sent') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>📲</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>
          Sent! Check your texts.
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>
          Tap the link we just sent and you'll see everything you've put on the calendar, all in one place.
          That link keeps working, so save it somewhere handy.
        </p>
      </div>
    );
  }

  if (state === 'none') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🤔</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>
          Nothing under that number
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 28px' }}>
          It might be under a different phone. Try another number, or if you're stuck, just email
          {' '}<a href="mailto:daryl@manitoubeachmichigan.com" style={{ color: C.sunsetLight }}>daryl@manitoubeachmichigan.com</a>
          {' '}and we'll dig it out for you.
        </p>
        <button onClick={() => setState('idle')} style={{ ...btn, background: 'rgba(255,255,255,0.08)' }}>Try another number</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 30, fontWeight: 400, color: C.cream, margin: '0 0 14px' }}>
        Your events, all in one place
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 32px' }}>
        No password, no account. Pop in the phone number you used when you added your events and we'll text
        you a link to the whole list.
      </p>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
        Your phone number
      </label>
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="(517) 555-0130"
        style={inp}
      />
      {error && <p style={{ color: '#E8A87C', fontSize: 14, margin: '10px 0 0' }}>{error}</p>}
      <button type="submit" disabled={state === 'sending'} style={{ ...btn, marginTop: 18, opacity: state === 'sending' ? 0.6 : 1 }}>
        {state === 'sending' ? 'Looking...' : 'Text me my events'}
      </button>
    </form>
  );
}

// ── The list itself ──
function EventList({ phone, token }) {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/my-events?phone=${encodeURIComponent(phone)}&token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => (d.error ? setError(d.error) : setEvents(d.events || [])))
      .catch(() => setError(yeti.oops()));
  }, [phone, token]);

  if (error) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🔑</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, fontWeight: 400, color: C.cream, margin: '0 0 12px' }}>{error}</h2>
        <a href="/my-events" style={{ color: C.sunsetLight, fontSize: 15 }}>Get a new link →</a>
      </div>
    );
  }

  if (!events) {
    return <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, padding: '40px 0' }}>Getting your events...</div>;
  }

  const upcoming = events.filter(e => !isPast(e.date));
  const past = events.filter(e => isPast(e.date));

  const Card = ({ e, dim }) => (
    <Link
      to={`/events/edit?token=${encodeURIComponent(e.editToken)}`}
      style={{
        display: 'block', padding: '18px 20px', marginBottom: 12, borderRadius: 12,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
        textDecoration: 'none', opacity: dim ? 0.45 : 1,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.sunsetLight, marginBottom: 6 }}>
        {prettyDate(e.date)}{e.time ? ` · ${e.time}` : ''}
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: C.cream, marginBottom: 4 }}>{e.name}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
        {e.lifecycle && e.lifecycle !== 'Active' ? `${e.lifecycle} · ` : ''}
        {e.location || 'Manitou Beach'} · <span style={{ color: C.sunsetLight, fontWeight: 600 }}>Edit →</span>
      </div>
    </Link>
  );

  return (
    <div>
      <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 30, fontWeight: 400, color: C.cream, margin: '0 0 10px' }}>
        Your events
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: '0 0 32px' }}>
        Tap any one to change the name, date, time, or anything else. Edits go live right away.
        Bookmark this page and you'll never have to hunt for a link again.
      </p>

      {upcoming.length === 0 && (
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
          Nothing coming up right now. <a href="/submit-event" style={{ color: C.sunsetLight }}>Add an event →</a>
        </p>
      )}
      {upcoming.map(e => <Card key={e.id} e={e} />)}

      {past.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '36px 0 14px' }}>
            Already happened
          </div>
          {past.slice().reverse().map(e => <Card key={e.id} e={e} dim />)}
        </>
      )}

      <AddToHomeScreen />

      <a href="/submit-event" style={{ display: 'block', textAlign: 'center', marginTop: 32, padding: '15px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: C.cream, textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>
        + Add another event
      </a>
    </div>
  );
}

export default function MyEventsPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const phone = params.get('phone');
  const token = params.get('token');

  useInstallable(phone, token);

  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main style={{ minHeight: '100vh', background: C.night, padding: '90px 24px 120px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {phone && token ? <EventList phone={phone} token={token} /> : <AskForPhone />}
        </div>
      </main>
      <Footer />
    </>
  );
}
