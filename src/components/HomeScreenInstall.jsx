// Home-screen install, shared by every surface that hands someone their own controls.
//
// There were three copies of this logic before (my-events, the truck check-in page, and
// now the two signup confirmations). Three copies means three chances for one of them to
// point at the wrong manifest and quietly install a link to a stranger's account. One copy,
// parameterised, is the whole point.
//
// The manifest is always generated per person, because start_url is what the launcher
// opens: a static manifest drops the token and the icon lands on a login screen instead
// of their controls.

import React, { useState, useEffect } from 'react';

// Injects the tags that make THIS page installable and point the launcher at THIS
// person's link. iOS reads them from the live DOM when "Add to Home Screen" is tapped,
// which is why they're injected per page rather than sitting in index.html.
export function useInstallable({ manifestHref, icon, appTitle, themeColor, documentTitle }) {
  useEffect(() => {
    if (!manifestHref) return;
    const added = [];
    const add = (tag, attrs) => {
      const el = document.createElement(tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      added.push(el);
    };

    add('link', { rel: 'manifest', href: manifestHref });
    if (icon) add('link', { rel: 'apple-touch-icon', href: icon });
    add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
    if (appTitle) add('meta', { name: 'apple-mobile-web-app-title', content: appTitle });
    add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'default' });
    if (themeColor) add('meta', { name: 'theme-color', content: themeColor });

    const prevTitle = document.title;
    if (documentTitle) document.title = documentTitle;

    return () => {
      added.forEach(el => el.remove());
      if (documentTitle) document.title = prevTitle;
    };
  }, [manifestHref, icon, appTitle, themeColor, documentTitle]);
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// "Add to Home Screen" lives in a different menu on every platform, and the one thing
// worse than no instructions is instructions for the wrong phone. Chrome hands us a real
// prompt event; Safari never will, so iOS gets words.
export function AddToHomeScreen({
  icon,
  heading = 'Put this on your phone',
  body,
  storageKey = 'mb-a2hs-dismissed',
  theme = 'dark',
  style: styleOverride,
}) {
  const [prompt, setPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(storageKey) === '1'; } catch { return false; }
  });

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (isStandalone() || dismissed) return null;

  const t = theme === 'light' ? LIGHT : DARK;
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const close = () => {
    setDismissed(true);
    try { localStorage.setItem(storageKey, '1'); } catch { /* private mode */ }
  };

  return (
    <div style={{ ...t.wrap, ...styleOverride }}>
      <button onClick={close} aria-label="Dismiss" style={t.close}>×</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {icon && <img src={icon} alt="" width={40} height={40} style={{ borderRadius: 9, flexShrink: 0 }} />}
        <div style={t.heading}>{heading}</div>
      </div>
      {body && <p style={t.body}>{body}</p>}
      {prompt ? (
        <button
          onClick={async () => { prompt.prompt(); await prompt.userChoice; setPrompt(null); }}
          style={t.button}
        >
          Add to home screen
        </button>
      ) : isIOS ? (
        <p style={t.how}>
          Tap <strong>Share</strong> at the bottom of Safari (the square with the arrow up),
          scroll down, and tap <strong>Add to Home Screen</strong>.
        </p>
      ) : (
        <p style={t.how}>
          Open your browser's menu (the three dots) and choose <strong>Add to Home screen</strong>
          {' '}or <strong>Install app</strong>.
        </p>
      )}
    </div>
  );
}

const DARK = {
  wrap: { position: 'relative', padding: '18px 20px', borderRadius: 12, background: 'rgba(212,132,90,0.10)', border: '1px solid rgba(212,132,90,0.30)' },
  close: { position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 20, cursor: 'pointer', lineHeight: 1 },
  heading: { fontSize: 15, fontWeight: 700, color: '#FAF6EF', lineHeight: 1.3 },
  body: { fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: '0 0 12px' },
  button: { background: '#D4845A', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer' },
  how: { fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75, margin: 0 },
};

const LIGHT = {
  wrap: { position: 'relative', padding: '18px 20px', borderRadius: 12, background: 'rgba(212,132,90,0.08)', border: '1px solid rgba(212,132,90,0.28)' },
  close: { position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: '#9A8E7E', fontSize: 20, cursor: 'pointer', lineHeight: 1 },
  heading: { fontSize: 15, fontWeight: 700, color: '#3B3228', lineHeight: 1.3 },
  body: { fontSize: 13.5, color: '#6B6052', lineHeight: 1.65, margin: '0 0 12px' },
  button: { background: '#D4845A', color: '#fff', border: 'none', borderRadius: 9, padding: '12px 20px', fontSize: 14, fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer' },
  how: { fontSize: 13.5, color: '#3B3228', lineHeight: 1.75, margin: 0 },
};
