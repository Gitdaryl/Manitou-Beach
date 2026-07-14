import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PhotoGallery } from './PhotoGallery';
import { SectionLabel } from './Shared';
import { C } from '../data/config';

// ============================================================
// 📸  EventPhotoWall  — the drop-anywhere crowd photo module
// ------------------------------------------------------------
// Put this on any event page or inside a gallery:
//     <EventPhotoWall slug="america-250" title="America 250" />
//
// It does three things:
//   1. Lets anyone add photos (camera or library), downscaled in the
//      browser before upload so a 12MB phone shot becomes web-fast.
//   2. Shows the live community feed (reuses the site's PhotoGallery grid).
//   3. Lets the community flag anything off — 3 flags auto-hides it and
//      bumps it to the top of your admin view.
// ============================================================

const MAX_EDGE = 1600;   // longest side after downscale
const JPEG_QUALITY = 0.82;

// Downscale + recompress an image File in the browser. Returns
// { base64, contentType, w, h } ready for the upload endpoint.
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (Math.max(width, height) > MAX_EDGE) {
        const scale = MAX_EDGE / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve({
        base64: dataUrl.split(',')[1],
        contentType: 'image/jpeg',
        w: width,
        h: height,
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

// Crowd photos are full Blob URLs (already web-sized); curated photos are
// local .webp paths that have a matching /thumbs/ file. This tells the grid
// to use each source as its own thumbnail.
const crowdThumb = (src) => src;

// Stable anonymous id for this browser — powers one-flag / one-heart per person.
function deviceId() {
  try {
    let d = localStorage.getItem('mb-device');
    if (!d) {
      d = globalThis.crypto?.randomUUID?.() || 'd_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('mb-device', d);
    }
    return d;
  } catch { return 'anon-' + Math.random().toString(36).slice(2, 10); }
}
const localIds = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
const hasLocal = (key, id) => localIds(key).includes(id);
const setLocal = (key, id, on) => {
  try {
    let a = localIds(key).filter((x) => x !== id);
    if (on) a.push(id);
    localStorage.setItem(key, JSON.stringify(a.slice(-800)));
  } catch { /* private mode etc. */ }
};

export default function EventPhotoWall({ slug, title, compact = false }) {
  const [photos, setPhotos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const inputRef = useRef(null);

  const flash = (m, ms = 3500) => { setMsg(m); setTimeout(() => setMsg(null), ms); };

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/photos-list?slug=${encodeURIComponent(slug)}`);
      const d = await r.json();
      setPhotos(d.photos || []);
    } catch { /* leave feed as-is */ }
    finally { setLoaded(true); }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setBusy(true);
    let ok = 0;
    for (const file of files) {
      try {
        const shrunk = await shrinkImage(file);
        const res = await fetch('/api/photos-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            filename: file.name || 'photo.jpg',
            contentType: shrunk.contentType,
            data: shrunk.base64,
            w: shrunk.w,
            h: shrunk.h,
          }),
        });
        const d = await res.json();
        if (res.ok && d.photo) { setPhotos((prev) => [d.photo, ...prev]); ok += 1; }
        else flash(d.error || 'One photo could not be added.');
      } catch {
        flash('One photo could not be added.');
      }
    }
    setBusy(false);
    if (ok) flash(ok === 1 ? 'Thanks! Your photo is live. 📸' : `Thanks! ${ok} photos added. 📸`);
    if (inputRef.current) inputRef.current.value = '';
  };

  const reportPhoto = async (id, reason) => {
    if (!id) return;
    try {
      await fetch('/api/photos-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason, deviceId: deviceId() }),
      });
      setLocal('mb-flagged', id, true);
      setPhotos((prev) => [...prev]);
      flash('Thanks — that photo has been flagged for review.');
    } catch { flash('Could not flag that photo.'); }
  };

  const heartPhoto = async (id) => {
    if (!id) return;
    try {
      const res = await fetch('/api/photos-heart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, deviceId: deviceId() }),
      });
      const d = await res.json();
      if (res.ok) {
        setLocal('mb-hearted', id, !!d.hearted);
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, hearts: d.hearts } : p)));
      }
    } catch { /* leave count as-is */ }
  };

  const urls = photos.map((p) => p.url);
  const reactions = {};
  photos.forEach((p) => {
    reactions[p.url] = { id: p.id, hearts: p.hearts || 0, hearted: hasLocal('mb-hearted', p.id), flagged: hasLocal('mb-flagged', p.id) };
  });

  // Machine-readable engagement (schema.org InteractionCounter / LikeAction)
  // so AI search and crawlers can see real community interaction on these photos.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const elId = `photowall-jsonld-${slug}`;
    document.getElementById(elId)?.remove();
    if (!photos.length) return undefined;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = elId;
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: `${title} — community photos`,
      image: photos.slice(0, 50).map((p) => ({
        '@type': 'ImageObject',
        contentUrl: p.url,
        name: p.name || undefined,
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: { '@type': 'LikeAction' },
          userInteractionCount: p.hearts || 0,
        },
      })),
    });
    document.head.appendChild(el);
    return () => document.getElementById(elId)?.remove();
  }, [photos, slug, title]);

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: compact ? '8px 20px 32px' : '24px 20px 56px' }}>
      {!compact && <div style={{ textAlign: 'center' }}><SectionLabel>Add Your Photos</SectionLabel></div>}

      {/* Upload card */}
      <div style={{
        background: C.warmWhite, border: `1px solid ${C.lakeBlue}22`, borderRadius: 16,
        padding: '28px 24px', textAlign: 'center', margin: '10px auto 28px', maxWidth: 620,
      }}>
        <div style={{ fontSize: 34, lineHeight: 1, marginBottom: 8 }}>📸</div>
        <h3 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.text, margin: '0 0 6px' }}>
          Share your {title} photos
        </h3>
        <p style={{ color: C.textLight, fontSize: 14, margin: '0 0 18px', lineHeight: 1.5 }}>
          Snap a photo or pick from your camera roll. It goes straight to the community gallery below.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
          id={`photo-input-${slug}`}
        />
        <label
          htmlFor={`photo-input-${slug}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, cursor: busy ? 'wait' : 'pointer',
            background: busy ? C.textMuted : C.sunset, color: '#fff', border: 'none', borderRadius: 26,
            height: 50, padding: '0 30px', fontSize: 16, fontWeight: 600,
            fontFamily: "'Libre Franklin', sans-serif", opacity: busy ? 0.8 : 1,
          }}
        >
          {busy ? 'Uploading…' : 'Add your photos'}
        </label>

        {msg && (
          <div style={{ marginTop: 14, fontSize: 13.5, color: C.lakeBlue, fontWeight: 600 }}>{msg}</div>
        )}
        <p style={{ color: C.textMuted, fontSize: 11.5, margin: '16px 0 0' }}>
          Keep it friendly. Anything off can be flagged by the community and removed.
        </p>
      </div>

      {/* Live community feed */}
      {loaded && urls.length > 0 && (
        <>
          <p style={{ textAlign: 'center', color: C.textLight, fontSize: 13, margin: '0 0 16px' }}>
            {urls.length} community {urls.length === 1 ? 'photo' : 'photos'} · tap any photo to view, heart, share, or flag
          </p>
          <PhotoGallery
            photos={urls}
            slug={slug}
            title={`${title} — community photos`}
            thumbOf={crowdThumb}
            onReport={(src, reason) => {
              const p = photos.find((x) => x.url === src);
              if (p) reportPhoto(p.id, reason);
            }}
            reactions={reactions}
            onHeart={(src) => {
              const p = photos.find((x) => x.url === src);
              if (p) heartPhoto(p.id);
            }}
          />
        </>
      )}
      {loaded && urls.length === 0 && (
        <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 14 }}>
          Be the first to add a photo from {title}!
        </p>
      )}
    </section>
  );
}
