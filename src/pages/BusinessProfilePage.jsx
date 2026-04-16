import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn, Btn, SectionLabel } from '../components/Shared';
import SEOHead from '../components/SEOHead';
import { toSlug } from '../utils/slugify';

export { toSlug } from '../utils/slugify';

// Map business category to Schema.org type
const SCHEMA_TYPES = {
  'Restaurant':       'Restaurant',
  'Bar':              'BarOrPub',
  'Real Estate':      'RealEstateAgent',
  'Marina':           'Marina',
  'Retail':           'Store',
  'Hotel':            'LodgingBusiness',
  'Vacation Rental':  'LodgingBusiness',
  'Food Truck':       'FoodEstablishment',
  'Winery':           'Winery',
  'Art Gallery':      'ArtGallery',
  'Bakery':           'Bakery',
  'Cafe':             'CafeOrCoffeeShop',
  'Auto':             'AutoRepair',
  'Beauty':           'BeautySalon',
  'Fitness':          'SportsActivityLocation',
};

// Category accent colors for badges
const CAT_COLORS = {
  'Restaurant':       C.sunset,
  'Bar':              C.driftwood,
  'Real Estate':      '#5B8A6E',
  'Marina':           C.lakeBlue,
  'Retail':           '#C06FA0',
  'Hotel':            C.sageDark,
  'Vacation Rental':  C.sageDark,
  'Food Truck':       '#E07B39',
  'Winery':           '#7D6EAA',
  'Art Gallery':      '#C06FA0',
  'Service':          C.sage,
  'Other':            C.textMuted,
};

export default function BusinessProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/businesses')
      .then(r => r.json())
      .then(data => {
        const all = [
          ...(data.premium || []),
          ...(data.featured || []),
          ...(data.enhanced || []),
          ...(data.free || []),
        ];
        setBusiness(all.find(b => toSlug(b.name) === slug) || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const schemaType = business ? (SCHEMA_TYPES[business.category] || 'LocalBusiness') : null;
  const autoDesc = business
    ? `${business.name} is a local ${(business.category || 'business').toLowerCase()} in Manitou Beach, Devils Lake, Michigan.`
    : '';

  const schema = business ? {
    '@context': 'https://schema.org',
    '@type': schemaType,
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
        addressRegion: 'MI',
        addressCountry: 'US',
      },
    }),
    ...(business.lat && business.lng && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.lat,
        longitude: business.lng,
      },
    }),
    areaServed: {
      '@type': 'Place',
      name: 'Manitou Beach, Devils Lake, Michigan',
    },
    containedInPlace: {
      '@type': 'Place',
      name: 'Manitou Beach',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Manitou Beach',
        addressRegion: 'MI',
        addressCountry: 'US',
      },
    },
  } : null;

  const scrollTo = id => { window.location.href = '/#' + id; };
  const accentColor = business ? (CAT_COLORS[business.category] || C.sage) : C.sage;
  const hasUpgrade = business && (business.tier === 'free' || business.tier === 'enhanced');

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />
      {business && (
        <SEOHead
          title={`${business.name} - ${business.category || 'Local Business'}, Manitou Beach Michigan`}
          description={business.description ? business.description.substring(0, 155) : autoDesc}
          path={`/business/${slug}`}
          ogImage={business.logo || undefined}
          schema={schema}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Businesses', path: '/business' },
            { name: business.name, path: `/business/${slug}` },
          ]}
        />
      )}
      <Navbar activeSection="" scrollTo={scrollTo} isSubPage />

      <div style={{ paddingTop: 80, minHeight: '100vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: C.sage }}>Loading...</div>
        ) : !business ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ marginBottom: 8, color: C.textMuted, fontSize: 15 }}>
              That listing isn't available right now.
            </p>
            <p style={{ marginBottom: 28, color: C.textMuted, fontSize: 14 }}>
              It may have been removed, or the URL might have a typo.
            </p>
            <button
              onClick={() => navigate('/business')}
              style={{ background: C.sage, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 15, fontFamily: "'Libre Franklin', sans-serif" }}
            >
              Browse All Businesses
            </button>
          </div>
        ) : (
          <>
            {/* Page header strip */}
            <div style={{ background: accentColor, padding: '32px 24px' }}>
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <button
                  onClick={() => navigate('/business')}
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 13, marginBottom: 20, fontFamily: "'Libre Franklin', sans-serif" }}
                >
                  ← All Businesses
                </button>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {business.logo && (
                    <img
                      src={business.logo}
                      alt={`${business.name} logo`}
                      style={{ width: 90, height: 90, objectFit: 'contain', borderRadius: 12, background: 'rgba(255,255,255,0.15)', flexShrink: 0, padding: 8 }}
                    />
                  )}
                  <div>
                    <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                      {business.name}
                    </h1>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                        {business.category || 'Local Business'}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: '4px 12px', fontSize: 11 }}>
                        Manitou Beach, MI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
              <FadeIn>

                {/* Description */}
                {business.description && (
                  <div style={{ marginBottom: 36 }}>
                    <SectionLabel>About</SectionLabel>
                    <p style={{ fontSize: 17, lineHeight: 1.75, color: C.text, margin: 0, fontFamily: "'Libre Baskerville', serif" }}>
                      {business.description}
                    </p>
                  </div>
                )}

                {/* Contact details */}
                <div style={{ marginBottom: 36 }}>
                  <SectionLabel>Contact & Visit</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {business.address && (
                      <ContactRow icon="📍" label="Address">
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(business.address + ', Manitou Beach, MI')}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: C.lakeBlue, textDecoration: 'none' }}
                        >
                          {business.address}
                        </a>
                      </ContactRow>
                    )}
                    {business.phone && (
                      <ContactRow icon="📞" label="Phone">
                        <a href={`tel:${business.phone}`} style={{ color: C.lakeBlue, textDecoration: 'none' }}>
                          {business.phone}
                        </a>
                      </ContactRow>
                    )}
                    {business.website && (
                      <ContactRow icon="🌐" label="Website">
                        <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: C.lakeBlue, textDecoration: 'none' }}>
                          {business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      </ContactRow>
                    )}
                    {business.email && (
                      <ContactRow icon="✉️" label="Email">
                        <a href={`mailto:${business.email}`} style={{ color: C.lakeBlue, textDecoration: 'none' }}>
                          {business.email}
                        </a>
                      </ContactRow>
                    )}
                  </div>
                </div>

                {/* Map link */}
                {business.lat && business.lng && (
                  <div style={{ marginBottom: 36 }}>
                    <a
                      href={`https://maps.google.com/?q=${business.lat},${business.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10,
                        padding: '14px 20px', textDecoration: 'none', color: C.text,
                        fontSize: 15, fontWeight: 500,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>🗺️</span>
                      <span>View on Map</span>
                      <span style={{ marginLeft: 'auto', color: C.textMuted, fontSize: 13 }}>Open in Google Maps →</span>
                    </a>
                  </div>
                )}

                {/* Part of the Manitou Beach community */}
                <div style={{ background: C.warmWhite, borderRadius: 12, padding: '24px 28px', marginBottom: 36, border: `1px solid ${C.sand}` }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>🏖️</span>
                    <div>
                      <div style={{ fontWeight: 600, color: C.dusk, marginBottom: 6, fontSize: 15 }}>
                        Part of the Manitou Beach Community
                      </div>
                      <p style={{ margin: 0, color: C.textLight, fontSize: 14, lineHeight: 1.65 }}>
                        {business.name} is listed on Manitou Beach Michigan - your local guide to Devils Lake, the Irish Hills, and everything around it. Find things to do, places to eat, and people who make this area special.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA - only for free/enhanced listings */}
                {hasUpgrade && (
                  <div style={{ background: `linear-gradient(135deg, ${C.sage}15, ${C.lakeBlue}15)`, borderRadius: 12, padding: '24px 28px', border: `1px solid ${C.sage}30` }}>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, fontWeight: 700, color: C.dusk, marginBottom: 8 }}>
                      Own this listing?
                    </div>
                    <p style={{ color: C.textLight, fontSize: 14, lineHeight: 1.65, marginBottom: 16 }}>
                      Add your description, logo, website link, and a pin on the Discover map. Visitors who find you here can click straight through to your site.
                    </p>
                    <Btn href="/business" variant="primary" small>Upgrade Your Listing</Btn>
                  </div>
                )}

                {/* Back link */}
                <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.sand}` }}>
                  <button
                    onClick={() => navigate('/business')}
                    style={{ background: 'transparent', border: `1px solid ${C.sage}`, color: C.sage, borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}
                  >
                    ← Browse All Businesses
                  </button>
                </div>

              </FadeIn>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function ContactRow({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fff', borderRadius: 10, padding: '12px 16px', border: `1px solid ${C.sand}` }}>
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 15, color: C.text }}>{children}</div>
      </div>
    </div>
  );
}
