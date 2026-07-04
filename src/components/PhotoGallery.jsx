import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FadeIn } from './Shared';
import { thumbSrc } from '../data/galleries';
import { C } from '../data/config';

// Touch gestures for a lightbox: swipe left/right to navigate, swipe down to close.
// Attach the returned handlers to the lightbox container. A short move is treated as a
// tap (so buttons still work), not a swipe.
export function useSwipeNav({ onPrev, onNext, onClose }) {
  const start = useRef(null);
  return {
    onTouchStart: (e) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) < 45 && Math.abs(dy) < 45) return; // tap, not a swipe
      if (Math.abs(dx) > Math.abs(dy)) {
        (dx < 0 ? onNext : onPrev)();
      } else if (dy > 70) {
        onClose();
      }
    },
  };
}

// Slide-in animation for lightbox photo changes. Direction depends on nav direction:
// next → new photo slides in from the right, prev → from the left.
const LB_KEYFRAMES = `
@keyframes lbInNext { from { opacity: 0; transform: translateX(7%) scale(0.985); } to { opacity: 1; transform: none; } }
@keyframes lbInPrev { from { opacity: 0; transform: translateX(-7%) scale(0.985); } to { opacity: 1; transform: none; } }
`;
export function LightboxKeyframes() { return <style>{LB_KEYFRAMES}</style>; }

// ── Share icons (inline SVG, monochrome) ─────────────────────
const Ic = ({ children }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{children}</svg>
);
const IcFacebook = () => <Ic><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H17V4.6c-.3 0-1.3-.1-2.45-.1-2.43 0-4.1 1.48-4.1 4.2v2.3H7.7V14h2.75v8h3.05z"/></Ic>;
const IcX = () => <Ic><path d="M17.9 3H21l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21H2.5l7.1-8.1L2 3h6.3l4.35 5.75L17.9 3zm-1.07 16.2h1.7L7.25 4.7H5.43l11.4 14.5z"/></Ic>;
const IcWhatsApp = () => <Ic><path d="M12 2a10 10 0 00-8.5 15.3L2 22l4.85-1.45A10 10 0 1012 2zm0 18.1a8.1 8.1 0 01-4.1-1.13l-.3-.17-2.88.86.87-2.8-.2-.31A8.1 8.1 0 1112 20.1zm4.5-6.05c-.25-.13-1.46-.72-1.68-.8-.23-.08-.4-.13-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.42.06-.64.31-.22.25-.84.82-.84 2.01s.86 2.33.98 2.49c.12.16 1.7 2.6 4.12 3.64.58.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.11-.22-.17-.47-.29z"/></Ic>;
const IcMail = () => <Ic><path d="M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7.5L4.2 7H19.8L12 12.5zM4 8.2V17h16V8.2l-8 5.6-8-5.6z"/></Ic>;
const IcLink = () => <Ic><path d="M10.6 13.4a1 1 0 010-1.4l3-3a1 1 0 011.4 0 3 3 0 010 4.2l-1.5 1.5a1 1 0 01-1.4-1.4l1.5-1.5a1 1 0 000-1.4 1 1 0 00-1.4 0l-3 3a1 1 0 01-1.6-.6zm2.8-2.8a1 1 0 010 1.4l-3 3a1 1 0 01-1.4 0 3 3 0 010-4.2l1.5-1.5a1 1 0 011.4 1.4l-1.5 1.5a1 1 0 000 1.4 1 1 0 001.4 0l3-3a1 1 0 011.6.6z"/></Ic>;
const IcMore = () => <Ic><path d="M18 8a3 3 0 10-2.82-4H15a3 3 0 00.14 6l.09-.01L9.9 12.2a3 3 0 100 3.6l5.32 2.2A3 3 0 1018 16a3 3 0 00-2.05.8l-5.3-2.2a3 3 0 000-1.2l5.3-2.2A3 3 0 0018 8z"/></Ic>;

/**
 * ShareRow — a row of share targets for one photo/URL. Self-contained; no page deps.
 * Link targets (FB/X/WhatsApp/Mail) rely on the page's OG tags for their preview image;
 * middleware.js injects the specific photo per ?photo= so those previews show the photo.
 * "More" uses the native share sheet with the actual image file (best on mobile).
 */
export function ShareRow({ url, title, text, dark = true }) {
  const [msg, setMsg] = useState(null);
  const [touch, setTouch] = useState(false);

  // Touch device WITH a native share sheet → mobile treatment. Desktop Chrome also
  // exposes navigator.share, so gate on a coarse pointer too.
  useEffect(() => {
    setTouch(
      typeof navigator !== 'undefined' && !!navigator.share &&
      typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)')?.matches
    );
  }, []);

  const e = encodeURIComponent;
  const shareText = text || title;
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2500); };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); flash('Link copied!'); }
    catch { flash(url); }
  };

  // Mobile: share the bare URL. The recipient's app (Messages, Facebook, WhatsApp)
  // fetches it and renders a rich card showing the photo (per-photo OG) that's tappable —
  // which drives traffic. Passing url alone (no text/file) is what makes iOS reliably
  // attach the link + preview instead of dropping it, which is what went wrong before.
  const nativeShare = async () => {
    try { await navigator.share({ url }); }
    catch { /* user cancelled */ }
  };

  const fg = dark ? '#fff' : (C.text || '#1a1a1a');
  const bg = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)';
  const toast = msg && (
    <div style={{ fontSize: 12, color: fg, background: bg, padding: '4px 12px', borderRadius: 14, maxWidth: '80vw', textAlign: 'center', wordBreak: 'break-all' }}>{msg}</div>
  );

  // ── Mobile: one clear Share button (native sheet) + Copy link ──
  if (touch) {
    return (
      <div onClick={ev => ev.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="button" onClick={ev => { ev.stopPropagation(); nativeShare(); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#12202b', border: 'none', borderRadius: 24, height: 46, padding: '0 24px', fontSize: 16, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
            <IcMore /> Share
          </button>
          <button type="button" onClick={ev => { ev.stopPropagation(); copyLink(); }} aria-label="Copy link" title="Copy link"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46, borderRadius: '50%', background: bg, border: 'none', color: fg, cursor: 'pointer' }}>
            <IcLink />
          </button>
        </div>
        {toast}
      </div>
    );
  }

  // ── Desktop: explicit network icons (these behave on a logged-in computer) ──
  const style = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: bg, border: 'none', cursor: 'pointer', color: fg, textDecoration: 'none', transition: 'background 0.2s' };
  const linkChip = (label, href, icon) => (
    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
       style={style} onClick={ev => ev.stopPropagation()}>{icon}</a>
  );
  return (
    <div onClick={ev => ev.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {linkChip('Share on Facebook', `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`, <IcFacebook />)}
        {linkChip('Share on X', `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(shareText)}`, <IcX />)}
        {linkChip('Share on WhatsApp', `https://wa.me/?text=${e(shareText + ' ' + url)}`, <IcWhatsApp />)}
        {linkChip('Share by email', `mailto:?subject=${e(title)}&body=${e(shareText + '\n\n' + url)}`, <IcMail />)}
        <button type="button" aria-label="Copy link" title="Copy link" style={style} onClick={ev => { ev.stopPropagation(); copyLink(); }}><IcLink /></button>
      </div>
      {toast}
    </div>
  );
}

/**
 * PhotoGallery — masonry grid + lightbox with per-photo sharing and deep links.
 *   photos    : ordered array of full-size image paths (grid uses thumbSrc())
 *   slug      : gallery slug, used to build shareable ?photo= deep links
 *   title     : gallery title (used in share text)
 *   shareText : optional custom share message
 */
export function PhotoGallery({ photos, slug, title, shareText }) {
  const [searchParams, setSearchParams] = useSearchParams();
  // index of open photo, or null. Initialised from ?photo= so deep links open straight to it.
  const [index, setIndex] = useState(() => {
    const p = parseInt(searchParams.get('photo') || '', 10);
    return p >= 1 && p <= photos.length ? p - 1 : null;
  });
  const [dir, setDir] = useState(1); // last nav direction: 1 = next, -1 = prev (drives slide-in)

  const goNext = () => { setDir(1); setIndex(i => (i < photos.length - 1 ? i + 1 : 0)); };
  const goPrev = () => { setDir(-1); setIndex(i => (i > 0 ? i - 1 : photos.length - 1)); };

  // Keep the URL in sync with the open photo (shareable while swiping).
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (index !== null) next.set('photo', String(index + 1));
    else next.delete('photo');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Keyboard: arrows navigate, Esc closes.
  useEffect(() => {
    if (index === null) return;
    const onKey = (ev) => {
      if (ev.key === 'Escape') setIndex(null);
      else if (ev.key === 'ArrowRight') goNext();
      else if (ev.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, photos.length]);

  const shareUrl = index !== null && typeof window !== 'undefined'
    ? `${window.location.origin}/gallery/${slug}?photo=${index + 1}`
    : '';

  const swipe = useSwipeNav({ onPrev: goPrev, onNext: goNext, onClose: () => setIndex(null) });

  return (
    <>
      {/* Masonry: each photo keeps its natural shape, nothing cropped. */}
      <div style={{ columnWidth: 240, columnGap: 10 }}>
        {photos.map((src, i) => (
          <FadeIn key={src} delay={Math.min(i, 8) * 30} direction="scale" style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', marginBottom: 10 }}>
            <div
              onClick={() => setIndex(i)}
              style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: C.warmWhite || '#f5f2ec', lineHeight: 0 }}
            >
              <img
                src={thumbSrc(src)}
                alt={`${title} - photo ${i + 1}`}
                loading="lazy"
                style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.35s ease' }}
                onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}
              />
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Lightbox */}
      {index !== null && (
        <div
          onClick={() => setIndex(null)}
          {...swipe}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,18,24,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 96px', touchAction: 'none' }}
        >
          <LightboxKeyframes />
          <button onClick={ev => { ev.stopPropagation(); goPrev(); }}
            aria-label="Previous photo"
            style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', fontSize: 20 }}>‹</button>

          <img key={index} src={photos[index]} alt={`${title} - photo ${index + 1}`}
            style={{ maxWidth: '92vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: 8, animation: `${dir < 0 ? 'lbInPrev' : 'lbInNext'} 0.3s ease` }}
            onClick={ev => ev.stopPropagation()} />

          <button onClick={ev => { ev.stopPropagation(); goNext(); }}
            aria-label="Next photo"
            style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', fontSize: 20 }}>›</button>

          <button onClick={() => setIndex(null)} aria-label="Close"
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18 }}>×</button>

          <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
            {title} · {index + 1} / {photos.length}
          </div>

          {/* Share row under the photo */}
          <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
            <ShareRow url={shareUrl} title={title} text={shareText} imageSrc={photos[index]} />
          </div>
        </div>
      )}
    </>
  );
}
