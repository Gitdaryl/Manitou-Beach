import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';
import EventPhotoWall from '../components/EventPhotoWall';
import SEOHead from '../components/SEOHead';
import { GALLERIES } from '../data/galleries';
import { C } from '../data/config';

// ============================================================
// 📷  SNAP  (/snap/:key)  — where a printed poster QR lands
// ------------------------------------------------------------
// The QR on an A-frame encodes only /snap/<key>. This page asks
// /api/snap-resolve what is on today and pre-picks it, then shows
// the pick as a confirmable chip. The guess is never silent: a
// wrong one costs the visitor a tap, instead of filing the Gypsy
// Blue crowd's photos into the Men's Club gallery.
//
// Design rule for this page: it is opened one-handed, outdoors, in
// sun, by someone who is at a party. Big targets, no scrolling to
// reach the upload button, no explaining.
// ============================================================

// The API answers with event tags; titles live in galleries.js, which the
// client can import and the API functions can't. Fall back to the raw name.
function optionLabel(o) {
  const def = GALLERIES[o.slug]?.events?.find((e) => e.key === o.event);
  return def?.title || o.title || GALLERIES[o.slug]?.title || 'This event';
}

const prettyDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function SnapPage() {
  const { key } = useParams();
  const [res, setRes] = useState(null);
  const [failed, setFailed] = useState(false);
  const [choice, setChoice] = useState(null);   // visitor's own pick, wins over the guess
  const [picking, setPicking] = useState(false);
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  useEffect(() => {
    let alive = true;
    fetch(`/api/snap-resolve?key=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad key'))))
      .then((d) => { if (alive) { setRes(d); setPicking(d.confidence === 'ambiguous'); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [key]);

  const shell = (children) => (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
      <SEOHead title="Share your photos" description="Add your photos to the Manitou Beach community gallery." path={`/snap/${key}`} noindex />
      <GlobalStyles />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      {children}
      <Footer scrollTo={subScrollTo} />
    </div>
  );

  if (failed) {
    return shell(
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '140px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, margin: '0 0 12px' }}>That code isn’t active</h1>
        <p style={{ color: C.textLight, marginBottom: 24, lineHeight: 1.6 }}>
          The poster you scanned points at a gallery we can’t find. You can still browse and add photos from the gallery hub.
        </p>
        <Link to="/gallery" style={{ display: 'inline-block', background: C.sunset, color: '#fff', borderRadius: 26, padding: '14px 30px', fontWeight: 600, textDecoration: 'none' }}>
          Open the galleries
        </Link>
      </div>
    );
  }

  if (!res) {
    return shell(
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '160px 24px', textAlign: 'center', color: C.textLight }}>
        Finding today’s event…
      </div>
    );
  }

  const active = choice || res.picked;
  // Fall back to the poster's own gallery when nothing is on the calendar, so
  // the upload screen always opens and photos always have somewhere to land.
  const slug = active?.slug || res.slug || null;
  const gallery = slug ? GALLERIES[slug] : null;

  // Everything the visitor can choose: today's real events, then the gallery's
  // standing event list, deduped by tag.
  const staticOpts = (GALLERIES[slug]?.events || []).map((e) => ({ slug, event: e.key, title: e.title, date: '', when: 'list' }));
  const options = [...(res.options || []), ...staticOpts]
    .filter((o, i, all) => all.findIndex((x) => x.slug === o.slug && x.event === o.event) === i);

  const chipText = () => {
    if (!active) return null;
    const when = active.when === 'yesterday' ? 'yesterday' : active.when === 'upcoming' ? prettyDate(active.date) : 'today';
    return `${optionLabel(active)} · ${when}`;
  };

  return shell(
    <>
      <section style={{ padding: '110px 20px 4px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 6vw, 38px)', margin: '0 0 8px', lineHeight: 1.2 }}>
            Share your photos
          </h1>
          <p style={{ color: C.textLight, fontSize: 15.5, lineHeight: 1.6, margin: '0 0 18px' }}>
            {gallery ? `They go straight to the ${gallery.title} gallery for everyone to see.` : 'They go straight to the community gallery for everyone to see.'}
          </p>

          {/* The guess, shown not assumed. One tap to correct it. */}
          {active && !picking && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
              background: C.warmWhite, border: `1px solid ${C.lakeBlue}33`, borderRadius: 999, padding: '10px 18px', marginBottom: 6,
            }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>📍 {chipText()}</span>
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  style={{ background: 'none', border: 'none', color: C.lakeBlue, fontSize: 13.5, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                >
                  not this one?
                </button>
              )}
            </div>
          )}

          {picking && (
            <div style={{ maxWidth: 420, margin: '0 auto 6px', textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 10px', textAlign: 'center' }}>
                {res.confidence === 'ambiguous' ? 'A couple of things are on today. Which one are you at?' : 'Which event are these from?'}
              </p>
              {options.map((o) => (
                <button
                  key={`${o.slug}:${o.event}`}
                  type="button"
                  onClick={() => { setChoice(o); setPicking(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', marginBottom: 8, cursor: 'pointer',
                    background: '#fff', border: `1px solid ${C.lakeBlue}33`, borderRadius: 12,
                    padding: '14px 16px', fontSize: 15.5, fontFamily: 'inherit', color: C.text,
                  }}
                >
                  <strong>{optionLabel(o)}</strong>
                  {o.date && <span style={{ color: C.textMuted, fontSize: 13 }}> · {prettyDate(o.date)}</span>}
                </button>
              ))}
              {slug && (
                <button
                  type="button"
                  onClick={() => { setChoice({ slug, event: '', title: GALLERIES[slug]?.generalTitle || 'General', when: 'list' }); setPicking(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: 'none', border: `1px dashed ${C.lakeBlue}44`, borderRadius: 12,
                    padding: '14px 16px', fontSize: 14.5, fontFamily: 'inherit', color: C.textLight,
                  }}
                >
                  None of these — just add them
                </button>
              )}
            </div>
          )}

          {!active && !picking && (
            <button
              type="button"
              onClick={() => setPicking(true)}
              style={{ background: 'none', border: 'none', color: C.lakeBlue, fontSize: 14, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Tag these to an event
            </button>
          )}
        </div>
      </section>

      {slug ? (
        <EventPhotoWall
          slug={slug}
          title={gallery?.title || 'Manitou Beach'}
          initialEvent={active?.event || ''}
          hideEventPicker
          compact
        />
      ) : (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 24px 80px', textAlign: 'center' }}>
          <p style={{ color: C.textLight, lineHeight: 1.6, marginBottom: 20 }}>
            Nothing is running right now that we can file photos under. Pick a gallery and add them there.
          </p>
          <Link to="/gallery" style={{ display: 'inline-block', background: C.sunset, color: '#fff', borderRadius: 26, padding: '14px 30px', fontWeight: 600, textDecoration: 'none' }}>
            Open the galleries
          </Link>
        </div>
      )}
    </>
  );
}
