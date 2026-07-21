import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FadeIn } from './Shared';
import { thumbSrc } from '../data/galleries';
import { C } from '../data/config';

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
 * Mobile shows one native Share button (shares the bare URL for a rich, tappable card).
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

  // Mobile: share the bare URL. The recipient's app fetches it and renders a rich card
  // with the photo (per-photo OG), tappable → drives traffic. url alone is what makes
  // iOS reliably attach the link + preview instead of dropping it.
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

const FLAG_REASONS = [
  ['not-event', 'Not from this event'],
  ['inappropriate', 'Inappropriate'],
  ['remove-request', 'Someone in it asked to remove it'],
  ['spam', 'Spam or ads'],
];

const NAV_BTN = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', color: '#fff', fontSize: 20, zIndex: 2 };

/**
 * Lightbox — full-screen photo viewer with a finger-follow carousel.
 * The photo tracks your thumb as you drag; on release it snaps to the neighbour
 * (or back) with eased motion. Swipe down to close. Arrows / keyboard also animate.
 *   photos    : ordered array of full-size image paths
 *   index     : current photo index (controlled by parent)
 *   setIndex  : (newIndex) => void — parent commits the new index
 *   onClose   : () => void
 *   shareUrl  : shareable deep link for the current photo
 */
export function Lightbox({ photos, index, setIndex, onClose, title, shareUrl, shareText, onReport, reactions, onHeart }) {
  const n = photos.length;
  const cur = reactions ? reactions[photos[index]] : null;
  const [reported, setReported] = useState(!!cur?.flagged);
  const [askReason, setAskReason] = useState(false);
  const [dx, setDx] = useState(0);          // live horizontal drag offset (px)
  const [anim, setAnim] = useState(false);  // whether the track is transitioning
  const startRef = useRef(null);
  const busyRef = useRef(false);            // true while a snap animation is running
  const movedRef = useRef(false);          // suppress the click-to-close after a drag
  const timerRef = useRef(null);           // pending snap-commit timer (cleared on unmount)
  const DUR = 320;

  const prevIdx = (index - 1 + n) % n;
  const nextIdx = (index + 1) % n;

  // Reset the "reported" acknowledgement when the visible photo changes.
  useEffect(() => { setReported(!!(reactions && reactions[photos[index]]?.flagged)); setAskReason(false); }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate the track to a neighbour, then commit the new index and re-center instantly.
  const commit = (targetPx, newIndex) => {
    if (busyRef.current || n < 2) { setAnim(true); setDx(0); return; }
    busyRef.current = true;
    setAnim(true);
    setDx(targetPx);
    timerRef.current = window.setTimeout(() => {
      setAnim(false);
      setDx(0);
      setIndex(newIndex);
      busyRef.current = false;
    }, DUR);
  };
  const goNext = () => commit(-window.innerWidth, nextIdx);
  const goPrev = () => commit(window.innerWidth, prevIdx);

  // Keyboard (no deps → closures see the current index each render).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Preload neighbours so the swipe animates a decoded image (no pop).
  useEffect(() => {
    [prevIdx, nextIdx].forEach(j => { const im = new Image(); im.src = photos[j]; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Lock background scroll while open; clear any pending snap timer on unmount so a
  // late commit can't reopen the lightbox after it's been closed.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const onTouchStart = (e) => {
    if (busyRef.current) return;
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY, locked: false, vertical: false };
    movedRef.current = false;
    setAnim(false);
  };
  const onTouchMove = (e) => {
    const s = startRef.current;
    if (!s) return;
    const t = e.touches[0];
    const ddx = t.clientX - s.x;
    const ddy = t.clientY - s.y;
    if (!s.locked && (Math.abs(ddx) > 8 || Math.abs(ddy) > 8)) {
      s.locked = true;
      s.vertical = Math.abs(ddy) > Math.abs(ddx);
      movedRef.current = true;
    }
    if (s.vertical) return;      // vertical gesture → handled on release (close)
    setDx(ddx);
  };
  const onTouchEnd = (e) => {
    const s = startRef.current;
    startRef.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const ddx = t.clientX - s.x;
    const ddy = t.clientY - s.y;
    if (s.vertical) { if (ddy > 90) onClose(); return; }
    const w = window.innerWidth;
    if (ddx <= -w * 0.2) goNext();
    else if (ddx >= w * 0.2) goPrev();
    else { setAnim(true); setDx(0); }   // snap back
  };

  const onBgClick = () => {
    if (movedRef.current) { movedRef.current = false; return; }
    onClose();
  };

  const slide = { flex: '0 0 100vw', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px 96px', boxSizing: 'border-box' };
  const imgStyle = { maxWidth: '92vw', maxHeight: 'calc(100vh - 175px)', objectFit: 'contain', borderRadius: 8, userSelect: 'none', WebkitUserSelect: 'none' };

  return (
    <div
      onClick={onBgClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,18,24,0.93)', overflow: 'hidden', touchAction: 'none' }}
    >
      {/* Sliding track: [prev, current, next], centered via translateX(-100vw). */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        transform: `translateX(calc(-100vw + ${dx}px))`,
        transition: anim ? `transform ${DUR}ms cubic-bezier(0.22, 0.61, 0.36, 1)` : 'none',
        willChange: 'transform',
      }}>
        {[prevIdx, index, nextIdx].map((pi, slot) => (
          <div key={`${slot}-${pi}`} style={slide}>
            <div style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }} onClick={(e) => e.stopPropagation()}>
              <img src={photos[pi]} alt={`${title} - photo ${pi + 1}`} draggable={false} style={imgStyle} />
              {slot === 1 && onHeart && cur && (
                <button
                  onClick={(e) => { e.stopPropagation(); onHeart(); }}
                  aria-label={cur.hearted ? 'Remove your heart' : 'Heart this photo'}
                  style={{ position: 'absolute', right: 10, bottom: 10, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(10,18,24,0.6)', border: 'none', borderRadius: 17, height: 34, padding: '0 13px', cursor: 'pointer', color: cur.hearted ? '#ff6b81' : '#fff', fontSize: 15, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}
                >
                  {cur.hearted ? '♥' : '♡'}{cur.hearts > 0 ? ` ${cur.hearts}` : ''}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chrome */}
      <button onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous photo" style={{ ...NAV_BTN, left: 20 }}>‹</button>
      <button onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next photo" style={{ ...NAV_BTN, right: 20 }}>›</button>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: '#fff', fontSize: 18, zIndex: 2 }}>×</button>

      {/* Community flag — only on crowd galleries (onReport supplied).
          Calm grey until tapped; a reason is required before the flag counts. */}
      {onReport && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
          {!askReason ? (
            <button
              onClick={() => { if (!reported) setAskReason(true); }}
              aria-label="Flag this photo"
              style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 16, height: 34, padding: '0 14px', cursor: reported ? 'default' : 'pointer', color: reported ? '#ff8a8a' : 'rgba(255,255,255,0.75)', fontSize: 12.5, fontFamily: "'Libre Franklin', sans-serif", opacity: reported ? 0.9 : 1 }}
            >
              {reported ? '⚑ Flagged' : '⚑ Flag'}
            </button>
          ) : (
            <div style={{ background: 'rgba(16,26,34,0.97)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 12, padding: '10px 8px 4px', width: 232, boxShadow: '0 8px 28px rgba(0,0,0,0.45)' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12.5, fontWeight: 600, margin: '0 6px 8px', fontFamily: "'Libre Franklin', sans-serif" }}>Why flag this photo?</div>
              {FLAG_REASONS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { onReport(key); setReported(true); setAskReason(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fff', fontSize: 13, padding: '8px 6px', cursor: 'pointer', borderRadius: 6, fontFamily: "'Libre Franklin', sans-serif" }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setAskReason(false)}
                style={{ display: 'block', width: '100%', textAlign: 'center', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, padding: '8px 6px 6px', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}


      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.55)', fontSize: 12, fontFamily: "'Libre Franklin', sans-serif", zIndex: 2 }}>
        {title} · {index + 1} / {n}
      </div>

      <div style={{ position: 'absolute', bottom: 22, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 16px', zIndex: 2 }}>
        <ShareRow url={shareUrl} title={title} text={shareText} />
      </div>
    </div>
  );
}

/**
 * PhotoGallery — masonry grid + shared Lightbox with per-photo sharing and deep links.
 *   photos    : ordered array of full-size image paths (grid uses thumbSrc())
 *   slug      : gallery slug, used to build shareable ?photo= deep links
 *   title     : gallery title
 *   shareText : optional custom share message
 */
export function PhotoGallery({ photos, slug, title, shareText, thumbOf = thumbSrc, onReport, reactions, onHeart, urlSync = true, shareKeyOf }) {
  const [searchParams, setSearchParams] = useSearchParams();
  // Stable share key per photo. Curated photos use their 1-based position (files
  // never reorder); crowd photos pass shareKeyOf to use the photo's KV id, so a
  // shared link keeps pointing at the same photo as new uploads shift positions.
  const keyFor = (i) => (shareKeyOf ? String(shareKeyOf(photos[i], i)) : String(i + 1));
  // index of open photo, or null. Initialised from ?photo= so deep links open straight to it.
  const [index, setIndex] = useState(() => {
    if (!urlSync) return null;
    const p = searchParams.get('photo') || '';
    if (!p) return null;
    const byKey = photos.findIndex((_, i) => keyFor(i) === p);
    if (byKey >= 0) return byKey;
    // Legacy numeric links (pre-id sharing) fall back to position.
    const n = parseInt(p, 10);
    return Number.isInteger(n) && n >= 1 && n <= photos.length ? n - 1 : null;
  });

  // Keep the URL in sync with the open photo (shareable while swiping).
  // Several galleries can share one page (event sections), so each gallery only
  // ever sets its own keys and only clears the param when it holds one of ours —
  // never someone else's, and never on mount.
  useEffect(() => {
    if (!urlSync) return;
    const next = new URLSearchParams(searchParams);
    const cur = next.get('photo');
    if (index !== null) {
      if (cur === keyFor(index)) return;
      next.set('photo', keyFor(index));
    } else {
      const owned = cur && photos.some((_, i) => keyFor(i) === cur);
      if (!owned) return;
      next.delete('photo');
    }
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const shareUrl = index !== null && typeof window !== 'undefined'
    ? `${window.location.origin}/gallery/${slug}?photo=${encodeURIComponent(keyFor(index))}`
    : '';

  return (
    <>
      {/* Masonry: each photo keeps its natural shape, nothing cropped. */}
      <div style={{ columnWidth: 240, columnGap: 10 }}>
        {photos.map((src, i) => (
          <FadeIn key={src} delay={Math.min(i, 8) * 30} direction="scale" style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid', marginBottom: 10 }}>
            <div
              onClick={() => setIndex(i)}
              style={{ borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: C.warmWhite || '#f5f2ec', lineHeight: 0, position: 'relative' }}
            >
              <img
                src={thumbOf(src)}
                alt={`${title} - photo ${i + 1}`}
                loading="lazy"
                style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.35s ease' }}
                onMouseEnter={ev => (ev.currentTarget.style.transform = 'scale(1.04)')}
                onMouseLeave={ev => (ev.currentTarget.style.transform = 'scale(1)')}
              />
              {onHeart && reactions?.[src] && (
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); onHeart(src); }}
                  aria-label={reactions[src].hearted ? 'Remove your heart' : 'Heart this photo'}
                  style={{ position: 'absolute', right: 8, bottom: 8, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(10,18,24,0.55)', border: 'none', color: reactions[src].hearted ? '#ff6b81' : '#fff', borderRadius: 14, padding: '5px 10px', fontSize: 13, lineHeight: '16px', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
                >
                  {reactions[src].hearted ? '♥' : '♡'}{reactions[src].hearts > 0 ? ` ${reactions[src].hearts}` : ''}
                </button>
              )}
            </div>
          </FadeIn>
        ))}
      </div>

      {index !== null && (
        <Lightbox
          photos={photos}
          index={index}
          setIndex={setIndex}
          onClose={() => setIndex(null)}
          title={title}
          shareUrl={shareUrl}
          shareText={shareText}
          onReport={onReport ? (reason) => onReport(photos[index], reason) : undefined}
          reactions={reactions}
          onHeart={onHeart ? () => onHeart(photos[index]) : undefined}
        />
      )}
    </>
  );
}
