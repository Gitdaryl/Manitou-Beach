import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SectionLabel, SectionTitle, ScrollProgress, Btn } from '../components/Shared';
import { Footer, GlobalStyles, Navbar, compressImage } from '../components/Layout';
import { C } from '../data/config';
import SEOHead from '../components/SEOHead';

// ============================================================
// 📰  CLASSIFIEDS (/classifieds, /classifieds/post, /classifieds/:id)
// Free neighbor listings. Sellers confirm their phone by text code,
// Daryl approves, listings run 30 days and new ones go in the
// Thursday Dispatch. API: /api/classifieds
// ============================================================

const CATEGORIES = [
  { id: 'Neighbors Swap', slug: 'swap', blurb: 'Kids\' stuff, furniture, tools, household' },
  { id: 'Free to a Good Home', slug: 'free', blurb: 'Giveaways, no money changes hands' },
  { id: 'Wheels & Water', slug: 'wheels-water', blurb: 'Cars, boats, trailers, docks, lifts' },
  { id: 'Help Wanted', slug: 'help-wanted', blurb: 'Local jobs, seasonal and year-round' },
];
const CAT_COLOR = {
  'Neighbors Swap': C.lakeBlue,
  'Free to a Good Home': C.sage,
  'Wheels & Water': C.dusk,
  'Help Wanted': C.sunset,
};

const formatPhone = (d) => (d && d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d);

function postedLabel(iso) {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(`${iso}T12:00:00`).getTime()) / 86400000);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  return `Posted ${days} days ago`;
}

function ClassifiedsStyles() {
  return (
    <style>{`
      .cls-wrap { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
      .cls-hero { padding: 150px 0 56px; background: linear-gradient(160deg, ${C.dusk}, ${C.night}); color: ${C.cream}; }
      .cls-hero h1 { font: 400 clamp(36px, 6vw, 58px)/1.1 'Libre Baskerville', serif; margin: 12px 0 16px; color: ${C.cream}; }
      .cls-hero p { font: 400 18px/1.7 'Libre Franklin', sans-serif; color: rgba(250,246,239,0.8); max-width: 640px; margin: 0 0 28px; }
      .cls-chips { display: flex; gap: 8px; flex-wrap: wrap; padding: 32px 0 8px; }
      .cls-chips button { min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid ${C.sand}; background: ${C.warmWhite};
        color: ${C.dusk}; font: 600 15px 'Libre Franklin', sans-serif; cursor: pointer; }
      .cls-chips button.on { background: ${C.dusk}; border-color: ${C.dusk}; color: ${C.cream}; }
      .cls-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 22px; padding: 24px 0 72px; }
      .cls-card { display: flex; flex-direction: column; background: ${C.warmWhite}; border: 1px solid ${C.sand}; border-radius: 12px; overflow: hidden;
        text-decoration: none; color: inherit; transition: transform 0.2s ease, box-shadow 0.2s ease; }
      .cls-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(26,40,48,0.12); }
      .cls-card-img { aspect-ratio: 4 / 3; background: ${C.sand}; position: relative; overflow: hidden; }
      .cls-card-img img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
      .cls-card-noimg { position: absolute; inset: 0; display: flex; align-items: flex-end; padding: 52px 16px 16px; box-sizing: border-box;
        font: 400 20px/1.25 'Libre Baskerville', serif; color: ${C.cream}; overflow: hidden; }
      .cls-photo-main.cls-card-noimg { position: relative; align-items: center; justify-content: center; text-align: center; padding: 24px; font-size: 28px; }
      .cls-tag { display: inline-block; font: 700 11px 'Libre Franklin', sans-serif; letter-spacing: 1.5px; text-transform: uppercase;
        color: ${C.cream}; padding: 6px 10px; border-radius: 3px; }
      .cls-card-img .cls-tag { position: absolute; top: 12px; left: 12px; }
      .cls-card-body { padding: 16px 18px 20px; }
      .cls-card-title { font: 600 17px/1.35 'Libre Franklin', sans-serif; color: ${C.text}; }
      .cls-card-price { font: 700 20px 'Libre Baskerville', serif; color: ${C.dusk}; margin-top: 6px; }
      .cls-card-meta { font: 400 13.5px 'Libre Franklin', sans-serif; color: ${C.textMuted}; margin-top: 8px; }
      .cls-empty { text-align: center; padding: 56px 16px 80px; font: 400 17px/1.7 'Libre Franklin', sans-serif; color: ${C.textLight}; }
      .cls-note { background: ${C.warmWhite}; border-top: 1px solid ${C.sand}; padding: 40px 0; }
      .cls-note p { font: 400 15px/1.7 'Libre Franklin', sans-serif; color: ${C.textLight}; max-width: 760px; margin: 0 0 8px; }

      .cls-detail { padding: 120px 0 72px; }
      .cls-detail-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: start; }
      .cls-photo-main { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 12px; background: ${C.sand}; display: block; }
      .cls-thumbs { display: flex; gap: 10px; margin-top: 10px; }
      .cls-thumbs button { border: 2px solid transparent; padding: 0; border-radius: 8px; overflow: hidden; cursor: pointer; width: 84px; height: 64px; background: ${C.sand}; }
      .cls-thumbs button.on { border-color: ${C.sunset}; }
      .cls-thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cls-detail h1 { font: 400 clamp(28px, 4vw, 40px)/1.15 'Libre Baskerville', serif; color: ${C.dusk}; margin: 12px 0 8px; }
      .cls-detail .price { font: 700 30px 'Libre Baskerville', serif; color: ${C.dusk}; }
      .cls-desc { font: 400 17px/1.75 'Libre Franklin', sans-serif; color: ${C.text}; white-space: pre-wrap; margin: 18px 0 24px; }
      .cls-contact { background: ${C.warmWhite}; border: 1px solid ${C.sand}; border-radius: 12px; padding: 22px; }
      .cls-contact .who { font: 600 16px 'Libre Franklin', sans-serif; color: ${C.text}; margin-bottom: 14px; }
      .cls-contact .btns { display: flex; gap: 10px; flex-wrap: wrap; }
      .cls-safety { font: 400 13.5px/1.6 'Libre Franklin', sans-serif; color: ${C.textMuted}; margin-top: 16px; }

      .cls-form { max-width: 680px; margin: 0 auto; padding: 120px 24px 80px; }
      .cls-form h1 { font: 400 clamp(30px, 5vw, 44px)/1.15 'Libre Baskerville', serif; color: ${C.dusk}; margin: 12px 0 8px; }
      .cls-form .lead { font: 400 16.5px/1.7 'Libre Franklin', sans-serif; color: ${C.textLight}; margin: 0 0 28px; }
      .cls-field { margin-bottom: 20px; }
      .cls-field label, .cls-legend { display: block; font: 600 14px 'Libre Franklin', sans-serif; color: ${C.dusk}; margin-bottom: 7px; }
      .cls-field .hint { font: 400 13px 'Libre Franklin', sans-serif; color: ${C.textMuted}; margin-top: 6px; }
      .cls-input { width: 100%; box-sizing: border-box; min-height: 48px; padding: 12px 14px; border-radius: 8px; border: 1.5px solid ${C.sand};
        background: #fff; color: ${C.text}; font: 400 16px 'Libre Franklin', sans-serif; outline: none; }
      .cls-input:focus { border-color: ${C.sage}; }
      textarea.cls-input { min-height: 130px; resize: vertical; line-height: 1.6; }
      .cls-cat-pick { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .cls-cat-pick button { text-align: left; min-height: 64px; padding: 12px 14px; border-radius: 10px; border: 1.5px solid ${C.sand};
        background: #fff; cursor: pointer; font: 600 15px 'Libre Franklin', sans-serif; color: ${C.text}; }
      .cls-cat-pick button span { display: block; font: 400 13px 'Libre Franklin', sans-serif; color: ${C.textMuted}; margin-top: 3px; }
      .cls-cat-pick button.on { border-color: ${C.dusk}; box-shadow: inset 0 0 0 1px ${C.dusk}; background: ${C.warmWhite}; }
      .cls-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .cls-photos { display: flex; gap: 10px; flex-wrap: wrap; }
      .cls-photo-slot { position: relative; width: 96px; height: 96px; border-radius: 10px; overflow: hidden; background: ${C.sand}; }
      .cls-photo-slot img { width: 100%; height: 100%; object-fit: cover; }
      .cls-photo-slot button { position: absolute; top: 4px; right: 4px; width: 28px; height: 28px; border-radius: 50%; border: 0;
        background: rgba(26,40,48,0.8); color: #fff; cursor: pointer; font-size: 14px; line-height: 28px; }
      .cls-photo-add { width: 96px; height: 96px; border-radius: 10px; border: 1.5px dashed ${C.textMuted}; background: transparent;
        color: ${C.textMuted}; font: 600 13px 'Libre Franklin', sans-serif; cursor: pointer; }
      .cls-submit { width: 100%; min-height: 52px; border: 0; border-radius: 8px; background: ${C.dusk}; color: ${C.cream};
        font: 700 16px 'Libre Franklin', sans-serif; letter-spacing: 0.5px; cursor: pointer; }
      .cls-submit:disabled { opacity: 0.6; cursor: default; }
      .cls-error { background: #FBE9DF; color: #8A3B22; border-radius: 8px; padding: 12px 14px; font: 500 15px 'Libre Franklin', sans-serif; margin-bottom: 16px; }
      .cls-fine { font: 400 13px/1.6 'Libre Franklin', sans-serif; color: ${C.textMuted}; margin: 12px 0 0; }
      .cls-code { font: 700 28px 'Libre Franklin', sans-serif; letter-spacing: 10px; text-align: center; }
      .cls-link { background: none; border: 0; padding: 0; color: ${C.sunset}; font: 600 15px 'Libre Franklin', sans-serif; cursor: pointer; text-decoration: underline; }

      @media (max-width: 860px) { .cls-detail-grid { grid-template-columns: 1fr; gap: 24px; } }
      @media (max-width: 520px) {
        .cls-wrap { padding: 0 16px; }
        .cls-row, .cls-cat-pick { grid-template-columns: 1fr; }
        .cls-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        .cls-card-body { padding: 12px 12px 14px; }
        .cls-card-title { font-size: 15px; }
        .cls-card-noimg { font-size: 16px; padding: 48px 12px 12px; }
        .cls-tag { font-size: 10px; letter-spacing: 1px; padding: 5px 8px; }
        .cls-card-price { font-size: 17px; }
      }
    `}</style>
  );
}

function PageShell({ children, seo }) {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'clip' }}>
      <SEOHead {...seo} />
      <GlobalStyles />
      <ClassifiedsStyles />
      <ScrollProgress />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      {children}
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}

const Tag = ({ category }) => (
  <span className="cls-tag" style={{ background: CAT_COLOR[category] || C.dusk }}>{category}</span>
);

// ── /classifieds ─────────────────────────────────────────────
export default function ClassifiedsPage() {
  const [params, setParams] = useSearchParams();
  const [listings, setListings] = useState(null);
  const [failed, setFailed] = useState(false);
  const active = CATEGORIES.find((c) => c.slug === params.get('c'))?.id || 'All';

  useEffect(() => {
    fetch('/api/classifieds')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setListings(d.listings || []))
      .catch(() => { setFailed(true); setListings([]); });
  }, []);

  const pick = (id) => {
    const slug = CATEGORIES.find((c) => c.id === id)?.slug;
    setParams(slug ? { c: slug } : {}, { replace: true });
  };
  const shown = (listings || []).filter((l) => active === 'All' || l.category === active);

  return (
    <PageShell
      seo={{
        title: 'Classifieds',
        description: 'Free local classifieds for Manitou Beach, Devils Lake and the Irish Hills: neighbors swap, free stuff, cars and boats, and help wanted.',
        path: '/classifieds',
        breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Classifieds', path: '/classifieds' }],
      }}
    >
      <section className="cls-hero">
        <div className="cls-wrap">
          <SectionLabel light>Classifieds</SectionLabel>
          <h1>Neighbors buying, selling and hiring</h1>
          <p>Free listings for everyone around Devils Lake and the Irish Hills. Every listing is checked by a real person, and new ones go out in our Thursday newsletter.</p>
          <Btn href="/classifieds/post" variant="sunset">Post a free listing</Btn>
        </div>
      </section>

      <div className="cls-wrap">
        <div className="cls-chips" role="tablist" aria-label="Categories">
          {['All', ...CATEGORIES.map((c) => c.id)].map((id) => (
            <button key={id} role="tab" aria-selected={active === id} className={active === id ? 'on' : ''} onClick={() => pick(id)}>{id}</button>
          ))}
        </div>

        {listings === null ? (
          <div className="cls-empty">Loading listings...</div>
        ) : failed ? (
          <div className="cls-empty">We couldn't load the listings just now. Please refresh in a moment.</div>
        ) : shown.length === 0 ? (
          <div className="cls-empty">
            <p style={{ margin: '0 0 18px' }}>Nothing in {active === 'All' ? 'the classifieds' : active} yet. Be the first.</p>
            <Btn href="/classifieds/post" variant="primary">Post a free listing</Btn>
          </div>
        ) : (
          <div className="cls-grid">
            {shown.map((l) => (
              <a key={l.id} className="cls-card" href={`/classifieds/${l.id}`}>
                <div className="cls-card-img">
                  {l.photos?.[0]
                    ? <img src={l.photos[0]} alt={l.title} loading="lazy" />
                    : <div className="cls-card-noimg" style={{ background: CAT_COLOR[l.category] || C.dusk }}>{l.title}</div>}
                  <Tag category={l.category} />
                </div>
                <div className="cls-card-body">
                  <div className="cls-card-title">{l.title}</div>
                  {l.price && <div className="cls-card-price">{l.price}</div>}
                  <div className="cls-card-meta">{[l.town, postedLabel(l.posted)].filter(Boolean).join(' · ')}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <section className="cls-note">
        <div className="cls-wrap">
          <SectionTitle>How it works</SectionTitle>
          <p>Listings are free and stay up for 30 days. Sellers confirm their phone number, and we look over every listing before it goes live to keep scammers out.</p>
          <p>Buyers contact the seller directly. Meet in a public place, bring a friend for big-ticket items, and never pay by gift card or wire. No firearms, please.</p>
          <p>Selling a home or land? See the <a href="/marketplace" style={{ color: C.sunset, fontWeight: 600 }}>Marketplace</a>.</p>
        </div>
      </section>
    </PageShell>
  );
}

// ── /classifieds/:id ─────────────────────────────────────────
export function ClassifiedListingPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [missing, setMissing] = useState(false);
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    fetch(`/api/classifieds?action=one&id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setListing(d.listing))
      .catch(() => setMissing(true));
  }, [id]);

  const seo = {
    title: listing ? `${listing.title} - Classifieds` : 'Classifieds',
    description: listing ? listing.description.slice(0, 155) : 'Free local classifieds around Devils Lake.',
    path: `/classifieds/${id}`,
    noindex: true,
  };

  if (missing) {
    return (
      <PageShell seo={seo}>
        <div className="cls-form" style={{ textAlign: 'center' }}>
          <h1>This listing is gone</h1>
          <p className="lead">It may have sold or expired.</p>
          <Btn href="/classifieds" variant="primary">See all listings</Btn>
        </div>
      </PageShell>
    );
  }
  if (!listing) return <PageShell seo={seo}><div className="cls-form"><p className="lead">Loading...</p></div></PageShell>;

  const sold = listing.status === 'Sold';
  const digits = listing.phone;
  const canCall = listing.contactMethod !== 'Text only';
  const canText = listing.contactMethod !== 'Call only';
  const firstName = (listing.sellerName || '').split(' ')[0];
  const smsBody = encodeURIComponent(`Hi, I saw "${listing.title}" on Manitou Beach Classifieds.`);

  return (
    <PageShell seo={seo}>
      <div className="cls-wrap cls-detail">
        <a href="/classifieds" style={{ color: C.sunset, fontWeight: 600, textDecoration: 'none' }}>&larr; All classifieds</a>
        <div className="cls-detail-grid" style={{ marginTop: 20 }}>
          <div>
            {listing.photos?.length ? (
              <>
                <img className="cls-photo-main" src={listing.photos[photo]} alt={listing.title} />
                {listing.photos.length > 1 && (
                  <div className="cls-thumbs">
                    {listing.photos.map((u, i) => (
                      <button key={u} className={i === photo ? 'on' : ''} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`}>
                        <img src={u} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="cls-photo-main cls-card-noimg" style={{ background: CAT_COLOR[listing.category] || C.dusk }}>{listing.title}</div>
            )}
          </div>
          <div>
            <Tag category={listing.category} />
            {sold && <span className="cls-tag" style={{ background: C.textMuted, marginLeft: 8 }}>Sold</span>}
            <h1>{listing.title}</h1>
            {listing.price && <div className="price">{listing.price}</div>}
            <div className="cls-card-meta">{[listing.town, postedLabel(listing.posted)].filter(Boolean).join(' · ')}</div>
            <div className="cls-desc">{listing.description}</div>
            {!sold && (
              <div className="cls-contact">
                <div className="who">{listing.category === 'Help Wanted' ? `Contact ${listing.sellerName}` : `Contact ${firstName}`}: {formatPhone(digits)}</div>
                <div className="btns">
                  {canCall && <Btn href={`tel:+1${digits}`} variant="primary">Call</Btn>}
                  {canText && <Btn href={`sms:+1${digits}?&body=${smsBody}`} variant="sunset">Text</Btn>}
                </div>
                <div className="cls-safety">Meet in a public place, check items before paying, and never pay by gift card or wire transfer.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ── /classifieds/post ────────────────────────────────────────
const EMPTY = { category: '', title: '', price: '', description: '', town: '', sellerName: '', phone: '', contactMethod: 'Call or text', email: '' };

export function ClassifiedPostPage() {
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('form');
  const [id, setId] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);
  const topRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isFree = form.category === 'Free to a Good Home';
  const isJob = form.category === 'Help Wanted';
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth' });

  const addPhotos = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - photos.length);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const { base64, filename } = await compressImage(file, 1400, 0.75);
        const r = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename, contentType: 'image/jpeg', data: base64, folder: 'classifieds' }),
        });
        const d = await r.json();
        if (!r.ok || !d.url) throw new Error(d.error || 'Upload failed');
        setPhotos((p) => [...p, d.url].slice(0, 3));
      }
    } catch {
      setError('One of the photos didn\'t upload. Try a smaller photo, or post without it.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Pick a category first.'); scrollTop(); return; }
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/classifieds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', ...form, photos }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Something went wrong.');
      setId(d.id);
      setStep('code');
      scrollTop();
    } catch (err) {
      setError(err.message);
      scrollTop();
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/classifieds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', id, code }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'That didn\'t work.');
      setStep('done');
      scrollTop();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError('');
    setNotice('');
    const r = await fetch('/api/classifieds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resend', id }),
    }).catch(() => null);
    if (r?.ok) setNotice('Sent again. It can take a minute.');
    else setError('We couldn\'t resend the code. Please submit the listing again.');
  };

  return (
    <PageShell
      seo={{
        title: 'Post a Free Classified',
        description: 'Post a free classified for the Devils Lake and Irish Hills area: sell, give away, or hire.',
        path: '/classifieds/post',
      }}
    >
      <div className="cls-form" ref={topRef}>
        <SectionLabel>Classifieds</SectionLabel>

        {step === 'done' && (
          <>
            <h1>Thanks, you're in line</h1>
            <p className="lead">We look over every listing to keep scammers out. You'll get an email the moment yours is live, usually the same day. New listings also go out in our Thursday newsletter.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn href="/classifieds" variant="primary">See the classifieds</Btn>
              <button className="cls-link" onClick={() => { setForm(EMPTY); setPhotos([]); setCode(''); setStep('form'); }}>Post another</button>
            </div>
          </>
        )}

        {step === 'code' && (
          <form onSubmit={verify}>
            <h1>Check your phone</h1>
            <p className="lead">We texted a 6-digit code to {formatPhone(form.phone.replace(/\D/g, '').slice(-10))}. Enter it to confirm the number is yours.</p>
            {error && <div className="cls-error">{error}</div>}
            {notice && <p className="cls-fine" style={{ marginBottom: 12 }}>{notice}</p>}
            <div className="cls-field">
              <label htmlFor="cls-code">Code</label>
              <input id="cls-code" className="cls-input cls-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
            </div>
            <button className="cls-submit" disabled={busy || code.length !== 6}>{busy ? 'Checking...' : 'Confirm'}</button>
            <p className="cls-fine">No text? <button type="button" className="cls-link" onClick={resend}>Send it again</button></p>
          </form>
        )}

        {step === 'form' && (
          <form onSubmit={submit}>
            <h1>Post a free listing</h1>
            <p className="lead">For neighbors around Devils Lake and the Irish Hills. Free, up for 30 days, and new listings go out in the Thursday newsletter.</p>
            {error && <div className="cls-error">{error}</div>}

            <div className="cls-field">
              <span className="cls-legend">Category</span>
              <div className="cls-cat-pick">
                {CATEGORIES.map((c) => (
                  <button type="button" key={c.id} className={form.category === c.id ? 'on' : ''}
                    aria-pressed={form.category === c.id} onClick={() => setForm((f) => ({ ...f, category: c.id }))}>
                    {c.id}<span>{c.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cls-field">
              <label htmlFor="cls-title">{isJob ? 'Job title' : 'What are you listing?'}</label>
              <input id="cls-title" className="cls-input" maxLength={80} value={form.title} onChange={set('title')} required
                placeholder={isJob ? 'Line cook, weekends' : 'Kids\' bike, 16 inch'} />
            </div>

            {!isFree && (
              <div className="cls-field">
                <label htmlFor="cls-price">{isJob ? 'Pay (optional)' : 'Price'}</label>
                <input id="cls-price" className="cls-input" maxLength={40} value={form.price} onChange={set('price')}
                  placeholder={isJob ? '$16/hr' : '$40 or best offer'} />
              </div>
            )}

            <div className="cls-field">
              <label htmlFor="cls-desc">Description</label>
              <textarea id="cls-desc" className="cls-input" maxLength={1200} value={form.description} onChange={set('description')} required
                placeholder={isJob ? 'Hours, what the job involves, how to apply' : 'Condition, size, pickup details'} />
            </div>

            <div className="cls-field">
              <span className="cls-legend">Photos (up to 3, optional)</span>
              <div className="cls-photos">
                {photos.map((u) => (
                  <div className="cls-photo-slot" key={u}>
                    <img src={u} alt="" />
                    <button type="button" aria-label="Remove photo" onClick={() => setPhotos((p) => p.filter((x) => x !== u))}>✕</button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button type="button" className="cls-photo-add" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Uploading...' : '+ Add photo'}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
            </div>

            <div className="cls-field">
              <label htmlFor="cls-town">Town or area (optional)</label>
              <input id="cls-town" className="cls-input" maxLength={60} value={form.town} onChange={set('town')} placeholder="Manitou Beach" />
            </div>

            <div className="cls-row">
              <div className="cls-field">
                <label htmlFor="cls-name">{isJob ? 'Business or contact name' : 'Your name'}</label>
                <input id="cls-name" className="cls-input" maxLength={60} autoComplete="name" value={form.sellerName} onChange={set('sellerName')} required />
              </div>
              <div className="cls-field">
                <label htmlFor="cls-phone">Phone (shown on the listing)</label>
                <input id="cls-phone" className="cls-input" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} required placeholder="(517) 555-0123" />
              </div>
            </div>

            <div className="cls-field">
              <label htmlFor="cls-method">How should people reach you?</label>
              <select id="cls-method" className="cls-input" value={form.contactMethod} onChange={set('contactMethod')}>
                <option>Call or text</option>
                <option>Text only</option>
                <option>Call only</option>
              </select>
            </div>

            <div className="cls-field">
              <label htmlFor="cls-email">Email (private)</label>
              <input id="cls-email" className="cls-input" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
              <div className="hint">Never shown. We use it to tell you when your listing is live and before it expires.</div>
            </div>

            <button className="cls-submit" disabled={busy || uploading}>{busy ? 'Sending...' : 'Continue'}</button>
            <p className="cls-fine">Next, we text a one-time code to the phone number above to confirm it's yours. Msg &amp; data rates may apply. We don't use your number for marketing. No firearms or ammunition, please.</p>
          </form>
        )}
      </div>
    </PageShell>
  );
}
