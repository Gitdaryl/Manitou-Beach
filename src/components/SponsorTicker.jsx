import React, { useRef } from 'react';
import { C } from '../data/config';

function Dot() {
  return (
    <span style={{
      display: 'inline-block',
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: C.sunset,
      margin: '0 24px',
      verticalAlign: 'middle',
      opacity: 0.6,
      flexShrink: 0,
    }} />
  );
}

function SponsorItem({ sponsor }) {
  const inner = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {sponsor.logo && (
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          style={{ height: 20, width: 'auto', opacity: 0.8, verticalAlign: 'middle', flexShrink: 0 }}
        />
      )}
      <span style={{
        fontFamily: "'Libre Franklin', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: C.cream,
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
      }}>
        {sponsor.name}
      </span>
      {sponsor.tagline && (
        <span style={{
          fontFamily: "'Libre Franklin', sans-serif",
          fontSize: 12,
          color: 'rgba(255,255,255,0.32)',
          whiteSpace: 'nowrap',
        }}>
          {sponsor.tagline}
        </span>
      )}
    </span>
  );

  if (sponsor.url) {
    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center' }}
      >
        {inner}
      </a>
    );
  }
  return inner;
}

export function SponsorTicker({ sponsors = [] }) {
  const trackRef = useRef(null);

  if (!sponsors || sponsors.length < 1) return null;

  // Triple-duplicate so loop is always seamless regardless of count
  const items = [...sponsors, ...sponsors, ...sponsors];
  const duration = Math.max(20, sponsors.length * 9);

  return (
    <>
      <style>{`
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          background: C.night,
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
          overflow: 'hidden',
          height: 44,
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused'; }}
        onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running'; }}
      >
        {/* Left label + fade */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 130,
          background: `linear-gradient(90deg, ${C.night} 65%, transparent 100%)`,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 20,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: "'Libre Franklin', sans-serif",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: C.sunset,
            opacity: 0.85,
          }}>
            Event Sponsors
          </span>
        </div>

        {/* Scrolling track */}
        <div
          ref={trackRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            animation: `tickerScroll ${duration}s linear infinite`,
            paddingLeft: 140,
            willChange: 'transform',
          }}
        >
          {items.map((s, i) => (
            <React.Fragment key={i}>
              <SponsorItem sponsor={s} />
              <Dot />
            </React.Fragment>
          ))}
        </div>

        {/* Right fade */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(270deg, ${C.night} 50%, transparent 100%)`,
          zIndex: 2,
          pointerEvents: 'none',
        }} />
      </div>
    </>
  );
}
