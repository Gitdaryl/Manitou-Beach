// The end of a signup, spent on the person instead of on us.
//
// The old confirmation screens celebrated and then pointed at the public page, which is
// the one thing the new partner has no stake in yet. This block hands over the controls
// instead: what is yours, how to reach it, and how to keep it on your phone.
//
// Placed at the END on purpose. People remember an experience by its most intense moment
// and its ending (Kahneman and Redelmeier's peak-end work), and control offered after the
// commitment reads as a gift while the same words in front of the form read as a chore.
// What keeps them coming back is autonomy, not novelty.
//
// New verticals (bands, venues, another town) add a key to data/controlSurfaces.js and
// pass it here. No new component.

import React from 'react';
import { AddToHomeScreen, useInstallable, isStandalone } from './HomeScreenInstall';
import { getControlSurface } from '../data/controlSurfaces';

export default function ControlHandoff({
  surface,          // key into CONTROL_SURFACES
  name,             // truck name, event name - whatever they call the thing
  identity,         // { slug, token } or { phone, token } - whatever builds their manifest
  primaryHref,      // where "open my controls" goes
  showHeading = true, // false when the host page already says "X is live" above it
  theme = 'dark',
  children,         // anything the specific page wants under the controls
}) {
  const cfg = getControlSurface(surface);
  const manifestHref = cfg?.install?.manifest && identity ? cfg.install.manifest({ ...identity, name }) : null;

  useInstallable({
    manifestHref,
    icon: cfg?.install?.icon,
    appTitle: cfg?.install?.appTitle,
    themeColor: cfg?.install?.themeColor,
  });

  if (!cfg) return null;
  const t = theme === 'light' ? LIGHT : DARK;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        {showHeading && <h2 style={t.heading}>{cfg.heading(name)}</h2>}
        <p style={t.lede}>{cfg.lede}</p>
      </div>

      <ul style={t.list}>
        {cfg.controls.map((c, i) => (
          <li key={i} style={t.item}>
            <span aria-hidden="true" style={t.tick}>✓</span>
            <span>
              <span style={t.itemTitle}>{c.title}</span>
              <span style={t.itemBody}>{c.body}</span>
            </span>
          </li>
        ))}
      </ul>

      {primaryHref && (
        <a href={primaryHref} style={t.primary}>
          {cfg.primary?.label || 'Open my controls'} →
        </a>
      )}

      {manifestHref && !isStandalone() && (
        <AddToHomeScreen
          theme={theme}
          icon={cfg.install.icon}
          heading={cfg.install.heading}
          body={cfg.install.body}
          storageKey={cfg.install.storageKey}
        />
      )}

      {children}
    </div>
  );
}

const DARK = {
  heading: { fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 400, color: '#FAF6EF', margin: '0 0 8px', lineHeight: 1.3 },
  lede: { fontSize: 14.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 },
  item: { display: 'flex', gap: 11, alignItems: 'flex-start' },
  tick: { flexShrink: 0, color: '#8FA985', fontWeight: 700, fontSize: 14, lineHeight: 1.5, marginTop: 1 },
  itemTitle: { display: 'block', fontSize: 14.5, fontWeight: 700, color: '#FAF6EF', marginBottom: 3 },
  itemBody: { display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 },
  primary: { display: 'inline-block', alignSelf: 'flex-start', padding: '14px 26px', background: '#D4845A', color: '#fff', borderRadius: 28, textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" },
};

const LIGHT = {
  heading: { fontFamily: "'Libre Baskerville', serif", fontSize: 24, fontWeight: 400, color: '#2D3B45', margin: '0 0 8px', lineHeight: 1.3 },
  lede: { fontSize: 14.5, color: '#6B6052', lineHeight: 1.7, margin: 0 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 },
  item: { display: 'flex', gap: 11, alignItems: 'flex-start' },
  tick: { flexShrink: 0, color: '#5C6F55', fontWeight: 700, fontSize: 14, lineHeight: 1.5, marginTop: 1 },
  itemTitle: { display: 'block', fontSize: 14.5, fontWeight: 700, color: '#3B3228', marginBottom: 3 },
  itemBody: { display: 'block', fontSize: 13.5, color: '#6B6052', lineHeight: 1.65 },
  primary: { display: 'inline-block', alignSelf: 'flex-start', padding: '14px 26px', background: '#D4845A', color: '#fff', borderRadius: 28, textDecoration: 'none', fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" },
};
