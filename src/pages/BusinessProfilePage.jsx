import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles, compressImage } from '../components/Layout';
import { FadeIn, Btn } from '../components/Shared';
import SEOHead from '../components/SEOHead';
import { toSlug } from '../utils/slugify';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Schema type map ────────────────────────────────────────────────────────
const SCHEMA_TYPES = {
  'Restaurant': 'Restaurant', 'Bar': 'BarOrPub', 'Real Estate': 'RealEstateAgent',
  'Marina': 'Marina', 'Retail': 'Store', 'Hotel': 'LodgingBusiness',
  'Vacation Rental': 'LodgingBusiness', 'Food Truck': 'FoodEstablishment',
  'Winery': 'Winery', 'Art Gallery': 'ArtGallery', 'Bakery': 'Bakery',
  'Cafe': 'CafeOrCoffeeShop', 'Auto': 'AutoRepair', 'Beauty': 'BeautySalon',
  'Fitness': 'SportsActivityLocation',
};

// ─── Category → accent colour ───────────────────────────────────────────────
const CAT_COLORS = {
  'Restaurant': C.sunset,   'Bar': C.driftwood,      'Real Estate': '#5B8A6E',
  'Marina': C.lakeBlue,     'Retail': '#C06FA0',     'Hotel': C.sageDark,
  'Vacation Rental': C.sageDark, 'Food Truck': '#E07B39', 'Winery': '#7D6EAA',
  'Art Gallery': '#C06FA0', 'Service': C.sage,        'Other': C.textMuted,
  'Electrician': C.lakeBlue, 'Contractor': '#8B7355', 'Beauty': '#C06FA0',
};

export default function BusinessProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ name: '', phone: '', message: '' });
  const [quoteSent, setQuoteSent] = useState(false);

  // ── Setup mode (fresh signup redirect) ──────────────────────────────────
  const [setupMode, setSetupMode] = useState(false);

  // ── Claim flow ──────────────────────────────────────────────────────────
  const [claimToken, setClaimToken] = useState(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimStep, setClaimStep] = useState('phone'); // 'phone' | 'code'
  const [claimPhone, setClaimPhone] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');

  // ── Google reviews ──────────────────────────────────────────────────────
  const [googleData, setGoogleData] = useState(null);

  // ── Edit mode ───────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editHours, setEditHours] = useState({});
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSaved, setEditSaved] = useState(false);
  const heroFileRef = useRef();

  useEffect(() => {
    window.scrollTo(0, 0);
    const stored = localStorage.getItem(`mb-claim-${slug}`);
    if (stored) setClaimToken(stored);

    // Detect setup mode (fresh signup redirect from Stripe)
    const params = new URLSearchParams(window.location.search);
    const isSetup = params.get('setup') === 'true';
    if (isSetup) {
      setSetupMode(true);
      window.history.replaceState({}, '', window.location.pathname);
    }

    let cancelled = false;
    let attempts = 0;

    const loadBusiness = () => {
      fetch('/api/businesses')
        .then(r => r.json())
        .then(data => {
          if (cancelled) return;
          const all = [
            ...(data.premium || []), ...(data.featured || []),
            ...(data.enhanced || []), ...(data.free || []),
          ];
          const biz = all.find(b => toSlug(b.name) === slug) || null;
          if (biz) {
            setBusiness(biz);
            if (biz.googlePlaceId) {
              fetch(`/api/google-places?placeId=${encodeURIComponent(biz.googlePlaceId)}`)
                .then(r => r.ok ? r.json() : null)
                .then(d => { if (d?.rating) setGoogleData(d); })
                .catch(() => {});
            }
            setEditForm({
              description: biz.description || '',
              phone: biz.phone || '',
              website: biz.website || '',
              address: biz.address || '',
              googlePlaceId: biz.googlePlaceId || '',
            });
            setEditHours(biz.hours || {});
            if (biz.heroPhoto) setHeroPreview(biz.heroPhoto);
            setLoading(false);
            // In setup mode, auto-open the claim modal after the page settles
            if (isSetup && !localStorage.getItem(`mb-claim-${slug}`)) {
              setTimeout(() => setClaimOpen(true), 900);
            }
          } else if (isSetup && attempts < 8) {
            // Webhook may not have fired yet - retry every 2s for up to 16s
            attempts++;
            setTimeout(loadBusiness, 2000);
          } else {
            setLoading(false);
          }
        })
        .catch(() => { if (!cancelled) setLoading(false); });
    };

    loadBusiness();
    return () => { cancelled = true; };
  }, [slug]);

  // Show sticky action bar after scrolling past hero
  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Claim handlers ──────────────────────────────────────────────────────
  const handleClaimPhone = async e => {
    e.preventDefault();
    if (!claimPhone.trim()) return;
    setClaimLoading(true);
    setClaimError('');
    try {
      const res = await fetch('/api/claim-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, phone: claimPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not send code');
      setClaimStep('code');
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  const handleClaimCode = async e => {
    e.preventDefault();
    if (!claimCode.trim()) return;
    setClaimLoading(true);
    setClaimError('');
    try {
      const res = await fetch('/api/verify-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, phone: claimPhone.trim(), code: claimCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Invalid code');
      localStorage.setItem(`mb-claim-${slug}`, data.claimToken);
      setClaimToken(data.claimToken);
      setClaimOpen(false);
      setClaimStep('phone');
      setClaimCode('');
      setEditOpen(true);
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  // ── Edit handlers ────────────────────────────────────────────────────────
  const handleHeroChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroFile(file);
    const { base64 } = await compressImage(file, 1400, 0.85);
    setHeroPreview(`data:image/jpeg;base64,${base64}`);
  };

  const handleEditSave = async e => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    try {
      let heroPhotoUrl = business?.heroPhoto || null;
      if (heroFile) {
        const { base64, filename } = await compressImage(heroFile, 1400, 0.85);
        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64, filename: `hero-${filename}`, contentType: 'image/jpeg', folder: 'business-photos' }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Photo upload failed');
        heroPhotoUrl = uploadData.url;
      }
      const res = await fetch('/api/self-edit-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          claimToken,
          ...editForm,
          hours: Object.keys(editHours).length ? JSON.stringify(editHours) : undefined,
          heroPhotoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Save failed');
      setEditSaved(true);
      setEditOpen(false);
      // Refresh business data
      const refresh = await fetch('/api/businesses').then(r => r.json());
      const all = [...(refresh.premium || []), ...(refresh.featured || []), ...(refresh.enhanced || []), ...(refresh.free || [])];
      const updated = all.find(b => toSlug(b.name) === slug);
      if (updated) setBusiness(updated);
      setTimeout(() => setEditSaved(false), 4000);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleQuote = async e => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone) return;
    if (business?.email) {
      window.location.href = `mailto:${business.email}?subject=Quote Request - ${business.name}&body=Name: ${quoteForm.name}%0APhone: ${quoteForm.phone}%0A%0A${quoteForm.message}`;
    }
    setQuoteSent(true);
    setQuoteOpen(false);
  };

  // Build schema
  const schema = business ? {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPES[business.category] || 'LocalBusiness',
    name: business.name,
    ...(business.description && { description: business.description }),
    ...(business.phone && { telephone: business.phone }),
    ...(business.website && { url: business.website }),
    ...(business.logo && { image: business.logo }),
    ...(business.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address,
        addressLocality: 'Manitou Beach',
        addressRegion: 'MI', addressCountry: 'US',
      },
    }),
    ...(business.lat && business.lng && {
      geo: { '@type': 'GeoCoordinates', latitude: business.lat, longitude: business.lng },
    }),
    areaServed: { '@type': 'Place', name: 'Manitou Beach, Devils Lake, Michigan' },
    containedInPlace: {
      '@type': 'Place', name: 'Manitou Beach',
      address: { '@type': 'PostalAddress', addressLocality: 'Manitou Beach', addressRegion: 'MI', addressCountry: 'US' },
    },
  } : null;

  const scrollTo = id => { window.location.href = '/#' + id; };
  const accent = business ? (CAT_COLORS[business.category] || C.sage) : C.sage;
  const hasActions = business && (business.phone || business.email || business.website);
  const autoDesc = business
    ? `${business.name} is a ${(business.category || 'local business').toLowerCase()} serving Manitou Beach, Devils Lake, and the Irish Hills area of Michigan.`
    : '';

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* ── Inline styles for profile-specific classes ── */}
      <style>{`
        .bp-hero-img { width: 100%; height: 300px; object-fit: cover; display: block; }
        @media (min-width: 640px) { .bp-hero-img { height: 420px; } }

        .bp-identity-card {
          position: relative; z-index: 2;
          margin: -56px 16px 0; border-radius: 18px;
          background: #fff; box-shadow: 0 4px 32px rgba(0,0,0,0.13);
          padding: 22px 22px 18px;
        }
        @media (min-width: 640px) {
          .bp-identity-card { margin: -72px 32px 0; padding: 28px 32px 24px; }
        }

        .bp-section-card {
          background: #fff; border-radius: 14px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          padding: 22px 22px; margin-bottom: 16px;
        }
        @media (min-width: 640px) { .bp-section-card { padding: 28px 28px; } }

        .bp-action-btn {
          flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center;
          gap: 7px; padding: 14px 12px; border-radius: 12px; font-size: 14px;
          font-weight: 700; font-family: "'Libre Franklin', sans-serif";
          text-decoration: none; border: none; cursor: pointer;
          transition: filter 0.15s, transform 0.1s;
        }
        .bp-action-btn:active { transform: scale(0.97); filter: brightness(0.93); }

        .bp-hours-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media (min-width: 480px) { .bp-hours-grid { grid-template-columns: repeat(4, 1fr); } }

        .bp-review-card {
          background: ${C.warmWhite}; border-radius: 10px;
          padding: 14px 16px; border: 1px solid ${C.sand};
          font-size: 13px; line-height: 1.6; color: ${C.textLight};
          font-style: italic;
        }

        .bp-sticky {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: rgba(250,246,239,0.92); backdrop-filter: blur(16px);
          border-top: 1px solid ${C.sand};
          padding: 12px 16px calc(18px + env(safe-area-inset-bottom, 0px)); display: flex; gap: 10px;
          transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 -8px 32px rgba(0,0,0,0.1);
        }
        .bp-sticky.visible { transform: translateY(0); }

        .bp-section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: ${C.textMuted};
          margin-bottom: 14px; font-family: "'Libre Franklin', sans-serif";
        }

        .bp-quote-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(10,18,24,0.65); backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
        }
        @media (min-width: 640px) {
          .bp-quote-overlay { align-items: center; }
        }
        .bp-quote-sheet {
          background: #fff; width: 100%; max-width: 520px;
          border-radius: 20px 20px 0 0; padding: 28px 24px calc(40px + env(safe-area-inset-bottom, 0px));
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
          overflow-y: auto; max-height: 90dvh;
        }
        @media (min-width: 640px) {
          .bp-quote-sheet { border-radius: 20px; margin: 0 16px; padding: 32px; max-height: none; }
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .bp-input {
          width: 100%; padding: 12px 14px; border-radius: 8px;
          border: 1.5px solid ${C.sand}; background: ${C.warmWhite};
          font-family: "'Libre Franklin', sans-serif"; font-size: 15px;
          color: ${C.text}; box-sizing: border-box; outline: none;
          transition: border-color 0.15s;
        }
        .bp-input:focus { border-color: ${C.lakeBlue}; background: #fff; }

        .bp-claim-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(10,18,24,0.65); backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
        }
        @media (min-width: 640px) { .bp-claim-overlay { align-items: center; } }

        .bp-claim-sheet {
          background: #fff; width: 100%; max-width: 480px;
          border-radius: 20px 20px 0 0; padding: 28px 24px calc(44px + env(safe-area-inset-bottom, 0px));
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
          overflow-y: auto; max-height: 90dvh;
        }
        @media (min-width: 640px) {
          .bp-claim-sheet { border-radius: 20px; margin: 0 16px; padding: 32px; max-height: none; }
        }

        .bp-edit-overlay {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(10,18,24,0.72); backdrop-filter: blur(4px);
          display: flex; align-items: flex-end; justify-content: center;
        }
        @media (min-width: 640px) { .bp-edit-overlay { align-items: center; } }

        .bp-edit-sheet {
          background: #fff; width: 100%; max-width: 560px;
          border-radius: 20px 20px 0 0;
          padding: 28px 24px calc(52px + env(safe-area-inset-bottom, 0px));
          animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1);
          margin-top: auto;
          overflow-y: auto;
          max-height: 92dvh;
        }
        @media (min-width: 640px) {
          .bp-edit-sheet { border-radius: 20px; margin: 24px 16px; padding: 32px; max-height: none; overflow-y: visible; }
        }

        .bp-hours-editor { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media (min-width: 440px) { .bp-hours-editor { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 600px) { .bp-hours-editor { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      {business && (
        <SEOHead
          title={`${business.name} - ${business.category || 'Local Business'}, Manitou Beach Michigan`}
          description={business.description ? business.description.substring(0, 155) : autoDesc}
          path={`/business/${slug}`}
          ogImage={business.logo || undefined}
          ogType="website"
          schema={schema}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Businesses', path: '/business' },
            { name: business.name, path: `/business/${slug}` },
          ]}
        />
      )}

      <Navbar activeSection="" scrollTo={scrollTo} isSubPage />

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ paddingTop: 100, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${C.sand}`, borderTopColor: C.sage, animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 14, color: C.textMuted }}>
              {setupMode ? 'Setting up your profile...' : 'Loading…'}
            </span>
            {setupMode && (
              <span style={{ fontSize: 12, color: C.textMuted, maxWidth: 280, lineHeight: 1.6 }}>
                This takes a few seconds the first time.
              </span>
            )}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── NOT FOUND ── */}
      {!loading && !business && (
        <div style={{ paddingTop: 120, textAlign: 'center', padding: '120px 24px 80px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏖️</div>
          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 24, color: C.dusk, marginBottom: 10 }}>
            Listing not found
          </h1>
          <p style={{ color: C.textMuted, fontSize: 15, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
            This listing may have been removed, or the URL has a typo. Head back to browse all businesses.
          </p>
          <button
            onClick={() => navigate('/business')}
            style={{ background: C.sage, color: '#fff', border: 'none', borderRadius: 10, padding: '13px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}
          >
            Browse All Businesses
          </button>
        </div>
      )}

      {/* ── PROFILE ── */}
      {!loading && business && (
        <>
          {/* Setup welcome banner - shown after fresh signup */}
          {setupMode && !claimToken && (
            <div style={{
              background: C.sage, padding: '14px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 12, flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>🎉</span>
                <div>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    Your profile is live!
                  </span>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', marginLeft: 8 }}>
                    Verify your number to start editing it.
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setClaimOpen(true); setClaimStep('phone'); setClaimError(''); }}
                style={{
                  background: '#fff', color: C.sageDark, border: 'none', borderRadius: 8,
                  padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  fontFamily: "'Libre Franklin', sans-serif", flexShrink: 0,
                }}
              >
                Verify my number
              </button>
            </div>
          )}
          {setupMode && claimToken && (
            <div style={{
              background: C.sageDark, padding: '12px 20px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>✓</span>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: '#fff' }}>
                You're all set. Use the Edit button below to update your profile anytime.
              </span>
            </div>
          )}

          {/* Hero */}
          <div style={{ position: 'relative', paddingTop: 64, background: C.dusk }}>
            {(business.heroPhoto || business.logo) ? (
              <img
                src={business.heroPhoto || business.logo}
                alt={`${business.name} - ${business.category} in Manitou Beach, Michigan`}
                className="bp-hero-img"
                style={{ objectPosition: 'center top' }}
              />
            ) : (
              // Branded gradient hero when no photo
              <div className="bp-hero-img" style={{
                background: `linear-gradient(135deg, ${accent}cc 0%, ${C.dusk} 60%, ${C.lakeDark} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, color: 'rgba(255,255,255,0.5)', fontFamily: "'Libre Baskerville', serif", fontWeight: 700,
                }}>
                  {business.name[0].toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>
                  Add a photo to make this page shine
                </div>
              </div>
            )}
            {/* Gradient fade at bottom of hero */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
              background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            {/* Back button */}
            <button
              onClick={() => navigate('/business')}
              style={{
                position: 'absolute', top: 80, left: 16,
                background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                borderRadius: 20, padding: '7px 14px 7px 10px',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: "'Libre Franklin', sans-serif",
              }}
            >
              ← Businesses
            </button>
          </div>

          {/* ── Identity card (floats up over hero) ── */}
          <div className="bp-identity-card">
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Category color bar */}
              <div style={{ width: 4, borderRadius: 4, background: accent, alignSelf: 'stretch', flexShrink: 0, minHeight: 32 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Category + tier chips */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{
                    background: `${accent}18`, color: accent,
                    borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 700,
                    letterSpacing: 0.5, textTransform: 'uppercase',
                  }}>
                    {business.category || 'Local Business'}
                  </span>
                  {(business.tier === 'premium' || business.tier === 'featured') && (
                    <span style={{
                      background: `${C.driftwood}18`, color: C.driftwood,
                      borderRadius: 20, padding: '3px 11px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      {business.tier === 'premium' ? '⭐ Featured Member' : '✓ Verified'}
                    </span>
                  )}
                </div>

                {/* Business name */}
                <h1 style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: 'clamp(22px, 5vw, 30px)',
                  fontWeight: 700, color: C.dusk, margin: '0 0 6px', lineHeight: 1.2,
                }}>
                  {business.name}
                </h1>

                {/* Location + service area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.textMuted, fontSize: 13, flexWrap: 'wrap' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Manitou Beach, MI</span>
                  {business.address && (
                    <>
                      <span style={{ color: C.sand }}>·</span>
                      <span style={{ color: C.textMuted }}>{business.address}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 120px' }}>

            {/* Action buttons - inline (always visible, sticky version appears on scroll) */}
            {hasActions && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="bp-action-btn"
                    style={{ background: C.sage, color: '#fff', fontSize: 14 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                    </svg>
                    Call
                  </a>
                )}
                {(business.email || business.phone) && (
                  <button className="bp-action-btn"
                    onClick={() => setQuoteOpen(true)}
                    style={{ background: accent, color: '#fff', fontSize: 14 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Get a Quote
                  </button>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="bp-action-btn"
                    style={{ background: C.warmWhite, color: C.text, border: `1.5px solid ${C.sand}`, fontSize: 14 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    Website
                  </a>
                )}
              </div>
            )}

            <FadeIn>

              {/* ── About ── */}
              {business.description && (
                <div className="bp-section-card">
                  <div className="bp-section-label">About</div>
                  <p style={{
                    fontSize: 16, lineHeight: 1.8,
                    color: C.text, margin: 0,
                    fontFamily: "'Libre Baskerville', serif",
                  }}>
                    {business.description}
                  </p>
                </div>
              )}

              {/* ── Hours ── */}
              {business.hours ? (
                <div className="bp-section-card">
                  <div className="bp-section-label">Hours</div>
                  <div className="bp-hours-grid">
                    {DAYS.map(day => {
                      const h = business.hours?.[day];
                      const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
                      const isToday = day === today;
                      return (
                        <div key={day} style={{
                          padding: '10px 12px', borderRadius: 8,
                          background: isToday ? `${accent}12` : C.warmWhite,
                          border: isToday ? `1.5px solid ${accent}40` : `1.5px solid ${C.sand}`,
                        }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isToday ? accent : C.textMuted, marginBottom: 3 }}>
                            {day}{isToday && <span style={{ marginLeft: 3, fontSize: 10 }}>TODAY</span>}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: h ? C.text : C.textMuted }}>
                            {h || 'Closed'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Teaser for missing hours - visible to all, nudges owner to add them
                <div className="bp-section-card" style={{ border: `1.5px dashed ${C.sand}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${C.sage}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>Hours not listed yet</div>
                      <div style={{ fontSize: 13, color: C.textMuted }}>
                        Own this business?{' '}
                        <a href="/update-listing" style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 600 }}>
                          Add your hours →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Google Reviews teaser ── */}
              {googleData ? (
                <div className="bp-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div className="bp-section-label" style={{ marginBottom: 0 }}>Reviews</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Google G */}
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span style={{ fontSize: 13, color: C.textMuted }}>Google</span>
                    </div>
                  </div>
                  {/* Star rating */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, fontWeight: 700, color: C.dusk, lineHeight: 1 }}>
                      {googleData.rating}
                    </span>
                    <div>
                      <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} width="16" height="16" viewBox="0 0 24 24"
                            fill={i <= Math.round(googleData.rating) ? '#FBBF24' : C.sand}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>
                        {googleData.reviewCount ? `${googleData.reviewCount} reviews` : 'on Google'}
                      </div>
                    </div>
                  </div>
                  {/* Review snippets */}
                  {googleData.reviews?.slice(0, 2).map((r, i) => (
                    <div key={i} className="bp-review-card" style={{ marginBottom: i < 1 ? 8 : 0 }}>
                      "{r.text}"
                      <div style={{ marginTop: 6, fontSize: 11, fontStyle: 'normal', color: C.textMuted, fontWeight: 600 }}>
                        - {r.author}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Reviews teaser - upsell to Featured
                <div className="bp-section-card" style={{ background: `linear-gradient(135deg, #fff 0%, ${C.warmWhite} 100%)` }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                      background: '#FFF8E7', border: '1.5px solid #FBBF2440',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#FBBF24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>
                        Show your Google reviews here
                      </div>
                      <p style={{ margin: '0 0 12px', fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                        Upgrade to Featured and your star rating and reviews pull straight from Google. Social proof that works while you sleep.
                      </p>
                      <a href="/business" style={{
                        fontSize: 12, fontWeight: 700, color: C.sage,
                        textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        Upgrade to Featured →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Contact details ── */}
              <div className="bp-section-card">
                <div className="bp-section-label">Contact & Find Us</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {business.address && (
                    <ContactDetail
                      icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>}
                      label="Address"
                      accent={accent}
                    >
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(business.address + ', Manitou Beach, MI')}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 500 }}
                      >
                        {business.address}
                        <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>↗</span>
                      </a>
                    </ContactDetail>
                  )}
                  {business.phone && (
                    <ContactDetail
                      icon={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>}
                      label="Phone"
                      accent={accent}
                    >
                      <a href={`tel:${business.phone}`} style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 500 }}>
                        {business.phone}
                      </a>
                    </ContactDetail>
                  )}
                  {business.website && (
                    <ContactDetail
                      icon={<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>}
                      label="Website"
                      accent={accent}
                    >
                      <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 500 }}>
                        {business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <span style={{ marginLeft: 4, fontSize: 11, opacity: 0.7 }}>↗</span>
                      </a>
                    </ContactDetail>
                  )}
                  {business.email && (
                    <ContactDetail
                      icon={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}
                      label="Email"
                      accent={accent}
                    >
                      <a href={`mailto:${business.email}`} style={{ color: C.lakeBlue, textDecoration: 'none', fontWeight: 500 }}>
                        {business.email}
                      </a>
                    </ContactDetail>
                  )}
                  {/* Map CTA */}
                  {business.lat && business.lng && (
                    <a
                      href={`https://maps.google.com/?q=${business.lat},${business.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        marginTop: 4, display: 'flex', alignItems: 'center', gap: 10,
                        background: C.warmWhite, borderRadius: 10,
                        padding: '13px 16px', textDecoration: 'none', color: C.text,
                        border: `1.5px solid ${C.sand}`, transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.lakeBlue}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.sand}
                    >
                      <span style={{ fontSize: 20 }}>🗺️</span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Get Directions</span>
                      <span style={{ fontSize: 12, color: C.textMuted }}>Google Maps ↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* ── Community badge ── */}
              <div style={{
                borderRadius: 14, overflow: 'hidden',
                background: `linear-gradient(135deg, ${C.dusk} 0%, ${C.lakeDark} 100%)`,
                padding: '24px 22px', marginBottom: 16,
                position: 'relative',
              }}>
                {/* Background texture dots */}
                <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>🏖️</div>
                  <div>
                    <div style={{
                      fontFamily: "'Libre Baskerville', serif",
                      fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 5,
                    }}>
                      Part of Manitou Beach
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                      {business.name} is listed on Manitou Beach Michigan - the community guide for Devils Lake, the Irish Hills, and the people who love it.
                    </p>
                    <a href="/" style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: 0.3 }}>
                      Explore the lake →
                    </a>
                  </div>
                </div>
              </div>

              {/* ── Owner panel: edit button (when claimed) or claim nudge ── */}
              {claimToken ? (
                <div style={{
                  borderRadius: 14, background: `${C.sage}12`,
                  border: `1.5px solid ${C.sage}40`, padding: '18px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.sageDark }}>Your listing</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Changes go live right away</div>
                  </div>
                  <button
                    onClick={() => setEditOpen(true)}
                    style={{
                      background: C.sage, color: '#fff', border: 'none', borderRadius: 10,
                      padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                      fontFamily: "'Libre Franklin', sans-serif", flexShrink: 0,
                    }}
                  >
                    Edit listing
                  </button>
                </div>
              ) : (
                <div style={{
                  borderRadius: 14, background: `${accent}08`,
                  border: `1.5px dashed ${accent}40`, padding: '18px 20px',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>
                    Is this your business?
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: 13, color: C.textLight, lineHeight: 1.6 }}>
                    Verify your phone number to update hours, photos, and details yourself.
                  </p>
                  <button
                    onClick={() => { setClaimOpen(true); setClaimStep('phone'); setClaimError(''); }}
                    style={{
                      background: accent, color: '#fff', border: 'none', borderRadius: 8,
                      padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      fontFamily: "'Libre Franklin', sans-serif",
                    }}
                  >
                    Claim This Listing
                  </button>
                </div>
              )}

            </FadeIn>
          </div>

          {/* ── Sticky action bar ── */}
          {hasActions && (
            <div className={`bp-sticky${stickyVisible ? ' visible' : ''}`}>
              {business.phone && (
                <a href={`tel:${business.phone}`} className="bp-action-btn"
                  style={{ background: C.sage, color: '#fff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.4 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 17z"/>
                  </svg>
                  Call Now
                </a>
              )}
              {(business.email || business.phone) && (
                <button className="bp-action-btn"
                  onClick={() => setQuoteOpen(true)}
                  style={{ background: accent, color: '#fff' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Get a Quote
                </button>
              )}
            </div>
          )}

          {/* ── Quote modal ── */}
          {quoteOpen && (
            <div className="bp-quote-overlay" onClick={e => { if (e.target === e.currentTarget) setQuoteOpen(false); }}>
              <div className="bp-quote-sheet">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: C.dusk }}>
                      Get a Quote
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>from {business.name}</div>
                  </div>
                  <button onClick={() => setQuoteOpen(false)}
                    style={{ background: C.warmWhite, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: C.textMuted }}>
                    ×
                  </button>
                </div>
                <form onSubmit={handleQuote} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 6 }}>Your Name *</label>
                    <input className="bp-input" required placeholder="First and last name"
                      value={quoteForm.name} onChange={e => setQuoteForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 6 }}>Phone Number *</label>
                    <input className="bp-input" type="tel" required placeholder="Best number to reach you"
                      value={quoteForm.phone} onChange={e => setQuoteForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, display: 'block', marginBottom: 6 }}>What do you need? (optional)</label>
                    <textarea className="bp-input" rows={3} placeholder="Describe the job or service…"
                      value={quoteForm.message} onChange={e => setQuoteForm(f => ({ ...f, message: e.target.value }))}
                      style={{ resize: 'vertical', minHeight: 80 }} />
                  </div>
                  <button type="submit" style={{
                    background: accent, color: '#fff', border: 'none', borderRadius: 10,
                    padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Libre Franklin', sans-serif", marginTop: 4,
                  }}>
                    Send Request
                  </button>
                  <p style={{ margin: 0, fontSize: 11, color: C.textMuted, textAlign: 'center' }}>
                    Your info goes directly to {business.name}.
                  </p>
                </form>
              </div>
            </div>
          )}

          {/* Quote sent toast */}
          {quoteSent && (
            <div style={{
              position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
              background: C.dusk, color: '#fff', borderRadius: 30, padding: '12px 24px',
              fontSize: 14, fontWeight: 600, zIndex: 400, whiteSpace: 'nowrap',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              animation: 'fadeInUp 0.3s ease-out',
            }}>
              ✓ Quote request sent
            </div>
          )}

          {/* Edit saved toast */}
          {editSaved && (
            <div style={{
              position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
              background: C.sageDark, color: '#fff', borderRadius: 30, padding: '12px 24px',
              fontSize: 14, fontWeight: 600, zIndex: 400, whiteSpace: 'nowrap',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}>
              ✓ Listing updated
            </div>
          )}

          {/* ── Claim modal ── */}
          {claimOpen && (
            <div className="bp-claim-overlay" onClick={e => { if (e.target === e.currentTarget) setClaimOpen(false); }}>
              <div className="bp-claim-sheet">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: C.dusk }}>
                      {claimStep === 'phone' ? 'Claim This Listing' : 'Enter your code'}
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>
                      {claimStep === 'phone'
                        ? 'Enter the phone number on file for this business'
                        : `We sent a 6-digit code to ${claimPhone}`}
                    </div>
                  </div>
                  <button onClick={() => setClaimOpen(false)}
                    style={{ background: C.warmWhite, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: C.textMuted }}>
                    ×
                  </button>
                </div>

                {claimStep === 'phone' && (
                  <form onSubmit={handleClaimPhone} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      type="tel" required autoFocus
                      placeholder="Your phone number"
                      value={claimPhone}
                      onChange={e => setClaimPhone(e.target.value)}
                      className="bp-input"
                    />
                    {claimError && (
                      <p style={{ margin: 0, fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px' }}>{claimError}</p>
                    )}
                    <button type="submit" disabled={claimLoading} style={{
                      background: accent, color: '#fff', border: 'none', borderRadius: 10,
                      padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif", opacity: claimLoading ? 0.7 : 1,
                    }}>
                      {claimLoading ? 'Sending code...' : 'Send verification code'}
                    </button>
                    <p style={{ margin: 0, fontSize: 11, color: C.textMuted, textAlign: 'center' }}>
                      We send a code to the phone number we have on file for this business.
                    </p>
                  </form>
                )}

                {claimStep === 'code' && (
                  <form onSubmit={handleClaimCode} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                      required autoFocus
                      placeholder="6-digit code"
                      value={claimCode}
                      onChange={e => setClaimCode(e.target.value.replace(/\D/g, ''))}
                      className="bp-input"
                      style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
                    />
                    {claimError && (
                      <p style={{ margin: 0, fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px' }}>{claimError}</p>
                    )}
                    <button type="submit" disabled={claimLoading} style={{
                      background: C.sage, color: '#fff', border: 'none', borderRadius: 10,
                      padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'Libre Franklin', sans-serif", opacity: claimLoading ? 0.7 : 1,
                    }}>
                      {claimLoading ? 'Verifying...' : 'Verify and unlock editing'}
                    </button>
                    <button type="button" onClick={() => { setClaimStep('phone'); setClaimError(''); setClaimCode(''); }}
                      style={{ background: 'none', border: 'none', fontSize: 13, color: C.textMuted, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                      Use a different number
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ── Edit panel ── */}
          {editOpen && (
            <div className="bp-edit-overlay" onClick={e => { if (e.target === e.currentTarget) setEditOpen(false); }}>
              <div className="bp-edit-sheet">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                  <div>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, fontWeight: 700, color: C.dusk }}>
                      Edit Listing
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>{business.name}</div>
                  </div>
                  <button onClick={() => setEditOpen(false)}
                    style={{ background: C.warmWhite, border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: C.textMuted }}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Hero photo */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 8 }}>Hero Photo</div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                      {heroPreview && (
                        <img src={heroPreview} alt="Hero preview" style={{ width: 80, height: 52, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.sand}` }} />
                      )}
                      <div>
                        <input ref={heroFileRef} type="file" accept="image/*" capture="environment" onChange={handleHeroChange} style={{ display: 'none' }} />
                        <button type="button" onClick={() => heroFileRef.current?.click()} style={{
                          fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600,
                          padding: '8px 16px', borderRadius: 6, border: `1.5px solid ${C.sage}`,
                          background: 'transparent', color: C.sage, cursor: 'pointer',
                        }}>
                          {heroPreview ? 'Change photo' : 'Upload photo'}
                        </button>
                        <p style={{ fontSize: 11, color: C.textMuted, margin: '5px 0 0', fontFamily: "'Libre Franklin', sans-serif" }}>
                          Snap one from your phone or pick from your library
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Description</div>
                    <textarea
                      className="bp-input" rows={3}
                      placeholder="Brief description of your business (2-3 sentences)"
                      value={editForm.description || ''}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      style={{ resize: 'vertical', minHeight: 72 }}
                    />
                  </div>

                  {/* Phone + Website side by side on wide screens */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Phone</div>
                      <input type="tel" className="bp-input" placeholder="Phone number"
                        value={editForm.phone || ''} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Website</div>
                      <input type="text" className="bp-input" placeholder="yoursite.com"
                        value={editForm.website || ''} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 6 }}>Address</div>
                    <input type="text" className="bp-input" placeholder="Street address"
                      value={editForm.address || ''} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} />
                  </div>

                  {/* Hours */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 10 }}>Hours</div>
                    <div className="bp-hours-editor">
                      {DAYS.map(day => (
                        <div key={day}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.textMuted, marginBottom: 4 }}>{day}</div>
                          <input
                            type="text"
                            className="bp-input"
                            placeholder="e.g. 9am-5pm"
                            value={editHours[day] || ''}
                            onChange={e => setEditHours(h => ({ ...h, [day]: e.target.value }))}
                            style={{ fontSize: 12, padding: '8px 10px' }}
                          />
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: C.textMuted, margin: '6px 0 0' }}>Leave blank for Closed</p>
                  </div>

                  {editError && (
                    <p style={{ margin: 0, fontSize: 13, color: '#C0392B', background: '#FDF0F0', border: '1px solid #F5C6C6', borderRadius: 6, padding: '10px 14px' }}>{editError}</p>
                  )}

                  <button type="submit" disabled={editLoading} style={{
                    background: C.sage, color: '#fff', border: 'none', borderRadius: 10,
                    padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    fontFamily: "'Libre Franklin', sans-serif", marginTop: 4,
                    opacity: editLoading ? 0.7 : 1,
                  }}>
                    {editLoading ? 'Saving...' : 'Save changes'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </>
      )}

      {!loading && <Footer />}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ContactDetail({ icon, label, children, accent }) {
  return (
    <div style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      background: C.warmWhite, borderRadius: 10,
      padding: '12px 14px', border: `1.5px solid ${C.sand}`,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: `${accent}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.textMuted, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: C.text }}>
          {children}
        </div>
      </div>
    </div>
  );
}
