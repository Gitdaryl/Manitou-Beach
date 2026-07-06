import React, { useState, useEffect, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';
import { galleryList } from '../data/galleries';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';

// ============================================================
// 🔒  GALLERY ADMIN  (/gallery-admin)  — mobile-friendly
// ------------------------------------------------------------
// Your one-tap takedown view. Enter the admin token once (stored on
// this device). Pick an event, see every photo with flagged ones
// floated to the top, and take anything down (or restore it).
// Also prints a QR board for the event so people can scan and submit.
// noindex — never surfaced to the public.
// ============================================================

const crowdGalleries = () => galleryList().filter((g) => g.crowd);

export default function GalleryAdminPage() {
  const [token, setToken] = useState(() => (typeof localStorage !== 'undefined' && localStorage.getItem('mbGalleryToken')) || '');
  const [slug, setSlug] = useState(() => crowdGalleries()[0]?.slug || '');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [authed, setAuthed] = useState(false);
  const galleries = crowdGalleries();
  const subScrollTo = () => { window.location.href = '/'; };

  const load = useCallback(async () => {
    if (!token || !slug) return;
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`/api/photos-admin?slug=${encodeURIComponent(slug)}`, {
        headers: { 'x-admin-token': token },
      });
      if (r.status === 401) { setAuthed(false); setErr('That token was not accepted.'); setPhotos([]); return; }
      const d = await r.json();
      if (!r.ok) { setErr(d.error || 'Could not load photos.'); setPhotos([]); return; }
      setAuthed(true);
      localStorage.setItem('mbGalleryToken', token);
      setPhotos(d.photos || []);
    } catch {
      setErr('Network error.');
    } finally { setLoading(false); }
  }, [token, slug]);

  useEffect(() => { if (token && slug) load(); /* eslint-disable-next-line */ }, [slug]);

  const act = async (id, action) => {
    try {
      const r = await fetch('/api/photos-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ action, id }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || 'Action failed.'); return; }
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status: d.status } : p)));
    } catch { setErr('Network error.'); }
  };

  const boardUrl = typeof window !== 'undefined' ? `${window.location.origin}/gallery/${slug}` : `/gallery/${slug}`;

  const input = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', fontSize: 16, borderRadius: 10, border: `1px solid ${C.lakeBlue}44`, background: '#fff', color: C.text, fontFamily: "'Libre Franklin', sans-serif" };
  const btn = (bg) => ({ background: bg, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" });

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
      <SEOHead title="Gallery Admin" description="Private gallery moderation." path="/gallery-admin" noindex={true} />
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '110px 20px 64px' }}>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, margin: '0 0 6px' }}>Gallery admin</h1>
        <p style={{ color: C.textLight, fontSize: 14, margin: '0 0 20px' }}>Take down anything that shouldn’t be up. Flagged photos show first.</p>

        {/* Controls */}
        <div style={{ display: 'grid', gap: 12, maxWidth: 420, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12.5, color: C.textLight, fontWeight: 600 }}>Event</label>
            <select value={slug} onChange={(e) => setSlug(e.target.value)} style={{ ...input, marginTop: 4 }}>
              {galleries.map((g) => <option key={g.slug} value={g.slug}>{g.title}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12.5, color: C.textLight, fontWeight: 600 }}>Admin token</label>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_SECRET"
              style={{ ...input, marginTop: 4 }} onKeyDown={(e) => e.key === 'Enter' && load()} />
          </div>
          <button onClick={load} style={btn(C.lakeBlue)}>{loading ? 'Loading…' : 'Load photos'}</button>
          {err && <div style={{ color: C.sunset, fontSize: 13, fontWeight: 600 }}>{err}</div>}
        </div>

        {/* QR board for this event */}
        {authed && slug && (
          <div style={{ background: '#fff', border: `1px solid ${C.lakeBlue}22`, borderRadius: 14, padding: 20, marginBottom: 28, textAlign: 'center', maxWidth: 320 }}>
            <div style={{ fontSize: 12.5, color: C.textLight, fontWeight: 600, marginBottom: 12 }}>Print this on the event board</div>
            <div style={{ background: '#fff', padding: 8, display: 'inline-block' }}>
              <QRCode value={boardUrl} size={160} />
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 12, wordBreak: 'break-all' }}>{boardUrl}</div>
            <button onClick={() => window.print()} style={{ ...btn(C.sunset), marginTop: 14 }}>Print QR</button>
          </div>
        )}

        {/* Photos */}
        {authed && (
          <>
            <div style={{ fontSize: 13, color: C.textLight, marginBottom: 12 }}>{photos.length} photo{photos.length === 1 ? '' : 's'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {photos.map((p) => {
                const down = p.status === 'hidden';
                const flagged = p.status === 'flagged';
                return (
                  <div key={p.id} style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${flagged ? C.sunset : 'transparent'}`, background: C.warmWhite, opacity: down ? 0.55 : 1 }}>
                    <div style={{ position: 'relative', aspectRatio: '1 / 1', background: C.cream }}>
                      <img src={p.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {flagged && <span style={{ position: 'absolute', top: 6, left: 6, background: C.sunset, color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>⚑ {p.flags}</span>}
                      {down && <span style={{ position: 'absolute', top: 6, left: 6, background: C.night, color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>Down</span>}
                    </div>
                    <div style={{ padding: 8, display: 'flex', gap: 6 }}>
                      {down
                        ? <button onClick={() => act(p.id, 'restore')} style={{ ...btn(C.lakeBlue), flex: 1, padding: '7px 0', fontSize: 12.5 }}>Restore</button>
                        : <button onClick={() => act(p.id, 'hide')} style={{ ...btn(C.sunset), flex: 1, padding: '7px 0', fontSize: 12.5 }}>Take down</button>}
                    </div>
                  </div>
                );
              })}
            </div>
            {photos.length === 0 && !loading && <p style={{ color: C.textMuted }}>No photos yet.</p>}
          </>
        )}
      </section>

      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
