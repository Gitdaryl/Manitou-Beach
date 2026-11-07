import React, { useState } from 'react';
import { C } from '../data/config';

// Sits on the events hero video, so the white cards stand out against it.
// Static on purpose: moving text is hard to read for much of this audience, and a
// ticker shows each name for a few seconds. Every sponsor paid the same, so each gets
// the same card and the order reshuffles per visit so nobody is always first.
// logoWidth in config gives each logo about the same area, not the same height, so a
// wide logo and a round one look equally big. Eased for heavy and light artwork.
function shuffled(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Card({ sponsor }) {
  const [line1, line2] = sponsor.name;
  return (
    <a href={sponsor.href} className="sponsor-card" aria-label={`${line1} ${line2}`}>
      <span className="sponsor-card-top">
        <span className={`sponsor-card-mark${sponsor.photo ? ' has-photo' : ''}`}>
          {sponsor.photo && <img className="sponsor-card-photo" src={sponsor.photo} alt="" loading="lazy" />}
          <img src={sponsor.logo} alt="" loading="lazy" style={sponsor.photo ? undefined : { width: `${sponsor.logoWidth}%` }} />
        </span>
        {sponsor.caption && (
          <span className="sponsor-card-caption">
            {sponsor.caption.map(line => <span key={line}>{line}</span>)}
          </span>
        )}
      </span>
      <span className="sponsor-card-name">
        <strong>{line1}</strong>
        <span>{line2}</span>
      </span>
    </a>
  );
}

export function SponsorStrip({ sponsors = [], title }) {
  const [order] = useState(() => shuffled(sponsors));
  if (order.length === 0) return null;

  return (
    <section className="sponsor-strip" aria-label={title}>
      <style>{`
        .sponsor-strip { position: relative; z-index: 3; max-width: 1120px; margin: 56px auto 0; }
        .sponsor-strip::before { content: ''; position: absolute; z-index: -1; top: -48px; bottom: -32px; left: -100vw; right: -100vw; background: linear-gradient(to bottom, rgba(10,18,24,0) 0, rgba(10,18,24,0.62) 72px); pointer-events: none; }
        .sponsor-strip-title { font-family: 'Libre Baskerville', serif; font-size: 20px; line-height: 25px; font-weight: 400; color: ${C.cream}; text-align: center; margin: 0 0 16px; }
        .sponsor-strip-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 12px; }
        .sponsor-card { display: grid; grid-template-rows: 1fr auto; background: #fff; border-radius: 12px; overflow: hidden; text-decoration: none; box-shadow: 0 8px 24px rgba(0,0,0,0.32); transition: transform 0.2s, box-shadow 0.2s; }
        .sponsor-card:hover { transform: translateY(-4px); box-shadow: 0 0 0 3px ${C.sunset}, 0 14px 32px rgba(0,0,0,0.42); }
        .sponsor-card:hover .sponsor-card-name strong { color: ${C.sunset}; }
        .sponsor-card:active { transform: scale(0.98); }
        .sponsor-card:focus-visible { outline: 2px solid ${C.cream}; outline-offset: 2px; }
        .sponsor-card-top { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 124px; padding: 12px 8px; }
        .sponsor-card-mark { display: flex; align-items: center; justify-content: center; width: 100%; }
        .sponsor-card-mark img { height: auto; }
        .sponsor-card-mark.has-photo { gap: 8px; }
        .sponsor-card-mark.has-photo img { flex: none; width: calc(100% - 68px); }
        .sponsor-card-mark.has-photo .sponsor-card-photo { flex: none; width: 60px; height: 60px; }
        .sponsor-card-caption { font-family: 'Libre Franklin', sans-serif; font-size: 12px; line-height: 16px; color: ${C.text}; text-align: center; }
        .sponsor-card-caption span { display: block; }
        .sponsor-card-name { display: block; padding: 8px 4px 12px; border-top: 1px solid ${C.sand}; font-family: 'Libre Franklin', sans-serif; font-size: 13px; line-height: 18px; color: ${C.text}; text-align: center; }
        .sponsor-card-name strong, .sponsor-card-name span { display: block; }
        .sponsor-card-name strong { font-weight: 600; }
        @media (max-width: 760px) {
          .sponsor-strip { margin: 40px -8px 0; }
          .sponsor-strip-title { font-size: 16px; line-height: 22px; margin-bottom: 12px; }
          .sponsor-strip-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
          .sponsor-card-top { min-height: 0; padding: 8px 4px; gap: 4px; }
          .sponsor-card-name { font-size: clamp(11px, 3.1vw, 12px); line-height: 16px; padding: 4px 0 8px; }
          .sponsor-card-caption { font-size: 11px; line-height: 14px; }
          .sponsor-card-mark.has-photo { flex-direction: column; gap: 4px; }
          .sponsor-card-mark.has-photo img { flex: none; width: 88%; }
          .sponsor-card-mark.has-photo .sponsor-card-photo { width: 44px; height: 44px; }
        }
        @media (min-width: 350px) { .sponsor-card-name strong, .sponsor-card-name span { white-space: nowrap; } }
        @media (prefers-reduced-motion: reduce) { .sponsor-card { transition: none; } .sponsor-card:hover, .sponsor-card:active { transform: none; } }
        @media (hover: none) { .sponsor-card:hover { transform: none; box-shadow: 0 8px 24px rgba(0,0,0,0.32); } .sponsor-card:hover .sponsor-card-name strong { color: inherit; } }
      `}</style>
      <h2 className="sponsor-strip-title">{title}</h2>
      <div className="sponsor-strip-grid">
        {order.map(s => <Card key={s.href} sponsor={s} />)}
      </div>
    </section>
  );
}
