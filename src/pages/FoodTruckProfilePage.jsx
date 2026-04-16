import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn, Btn, SectionLabel } from '../components/Shared';
import SEOHead from '../components/SEOHead';

export default function FoodTruckProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/food-trucks')
      .then(r => r.json())
      .then(data => {
        const found = (data.trucks || []).find(t => t.slug === slug);
        setTruck(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const autoDesc = truck
    ? `${truck.name} is a food truck serving ${truck.cuisine || 'great food'} at Manitou Beach and Devils Lake, Michigan.`
    : '';

  const schema = truck ? {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: truck.name,
    ...(truck.description && { description: truck.description.substring(0, 300) }),
    ...(truck.phone && { telephone: truck.phone }),
    ...(truck.website && { url: truck.website }),
    ...(truck.photoUrl && { image: truck.photoUrl }),
    ...(truck.cuisine && { servesCuisine: truck.cuisine }),
    ...(truck.lat && truck.lng && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: truck.lat,
        longitude: truck.lng,
      },
    }),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Manitou Beach',
      addressRegion: 'MI',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Manitou Beach, Devils Lake, Michigan',
    },
    priceRange: '$',
    potentialAction: {
      '@type': 'ViewAction',
      target: `https://manitoubeachmichigan.com/food-trucks/${slug}`,
    },
  } : null;

  const scrollTo = id => { window.location.href = '/#' + id; };

  // Format a date string nicely
  const fmtDate = str => {
    if (!str) return '';
    return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isActive = truck && !truck.departureTime;
  const accentColor = C.sunset;

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, overflowX: 'hidden', minHeight: '100vh' }}>
      <GlobalStyles />
      {truck && (
        <SEOHead
          title={`${truck.name} - Food Truck, Manitou Beach Michigan`}
          description={truck.description ? truck.description.substring(0, 155) : autoDesc}
          path={`/food-trucks/${slug}`}
          ogImage={truck.photoUrl || undefined}
          schema={schema}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Food Trucks', path: '/food-trucks' },
            { name: truck.name, path: `/food-trucks/${slug}` },
          ]}
        />
      )}
      <Navbar activeSection="" scrollTo={scrollTo} isSubPage />

      <div style={{ paddingTop: 80, minHeight: '100vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: C.sage }}>Loading...</div>
        ) : !truck ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ marginBottom: 8, color: C.textMuted, fontSize: 15 }}>
              That food truck isn't listed right now.
            </p>
            <p style={{ marginBottom: 28, color: C.textMuted, fontSize: 14 }}>
              It may be off the lake for the season, or the URL might have a typo.
            </p>
            <button
              onClick={() => navigate('/food-trucks')}
              style={{ background: accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontSize: 15, fontFamily: "'Libre Franklin', sans-serif" }}
            >
              See All Food Trucks
            </button>
          </div>
        ) : (
          <>
            {/* Page header */}
            <div style={{ background: accentColor, padding: '32px 24px' }}>
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <button
                  onClick={() => navigate('/food-trucks')}
                  style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontSize: 13, marginBottom: 20, fontFamily: "'Libre Franklin', sans-serif" }}
                >
                  ← All Food Trucks
                </button>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {truck.photoUrl && (
                    <img
                      src={truck.photoUrl}
                      alt={`${truck.name} food truck`}
                      style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12, flexShrink: 0, border: '3px solid rgba(255,255,255,0.4)' }}
                    />
                  )}
                  <div>
                    <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                      {truck.name}
                    </h1>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                        Food Truck
                      </span>
                      {truck.cuisine && (
                        <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: '4px 12px', fontSize: 11 }}>
                          {truck.cuisine}
                        </span>
                      )}
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

                {/* Today's Special */}
                {truck.todaysSpecial && (
                  <div style={{ background: `${C.sunset}18`, border: `1px solid ${C.sunset}40`, borderRadius: 12, padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>🌟</span>
                    <div>
                      <div style={{ fontWeight: 700, color: C.sunset, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Today's Special</div>
                      <div style={{ color: C.text, fontSize: 15 }}>{truck.todaysSpecial}</div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {truck.description && (
                  <div style={{ marginBottom: 36 }}>
                    <SectionLabel>About</SectionLabel>
                    <p style={{ fontSize: 17, lineHeight: 1.75, color: C.text, margin: 0, fontFamily: "'Libre Baskerville', serif" }}>
                      {truck.description}
                    </p>
                  </div>
                )}

                {/* Where to find them */}
                <div style={{ marginBottom: 36 }}>
                  <SectionLabel>Where to Find Us</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {truck.locationNote && (
                      <InfoCard icon="📍" label="Current Location">
                        {truck.locationNote}
                      </InfoCard>
                    )}
                    {truck.scheduleNote && (
                      <InfoCard icon="📅" label="Schedule">
                        {truck.scheduleNote}
                      </InfoCard>
                    )}
                    {truck.comingDate && (
                      <InfoCard icon="🗓️" label="Coming Up">
                        {truck.comingEventName
                          ? `${truck.comingEventName} - ${fmtDate(truck.comingDate)}`
                          : fmtDate(truck.comingDate)}
                      </InfoCard>
                    )}
                    {truck.departureTime && (
                      <InfoCard icon="⏰" label="Wrapping Up">
                        {truck.departureTime}
                      </InfoCard>
                    )}
                    {truck.lat && truck.lng && (
                      <a
                        href={`https://maps.google.com/?q=${truck.lat},${truck.lng}`}
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
                    )}
                  </div>
                </div>

                {/* Contact */}
                {(truck.phone || truck.website) && (
                  <div style={{ marginBottom: 36 }}>
                    <SectionLabel>Get in Touch</SectionLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {truck.phone && (
                        <InfoCard icon="📞" label="Phone">
                          <a href={`tel:${truck.phone}`} style={{ color: C.lakeBlue, textDecoration: 'none' }}>
                            {truck.phone}
                          </a>
                        </InfoCard>
                      )}
                      {truck.website && (
                        <InfoCard icon="🌐" label="Website">
                          <a href={truck.website} target="_blank" rel="noopener noreferrer" style={{ color: C.lakeBlue, textDecoration: 'none' }}>
                            {truck.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        </InfoCard>
                      )}
                    </div>
                  </div>
                )}

                {/* Community callout */}
                <div style={{ background: C.warmWhite, borderRadius: 12, padding: '24px 28px', marginBottom: 36, border: `1px solid ${C.sand}` }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>🏖️</span>
                    <div>
                      <div style={{ fontWeight: 600, color: C.dusk, marginBottom: 6, fontSize: 15 }}>
                        Part of the Manitou Beach Community
                      </div>
                      <p style={{ margin: 0, color: C.textLight, fontSize: 14, lineHeight: 1.65 }}>
                        {truck.name} rolls through Manitou Beach, Michigan - on Devils Lake, in the heart of the Irish Hills. Discover more food trucks, local events, and everything happening at the lake.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Back link */}
                <div style={{ paddingTop: 24, borderTop: `1px solid ${C.sand}` }}>
                  <button
                    onClick={() => navigate('/food-trucks')}
                    style={{ background: 'transparent', border: `1px solid ${accentColor}`, color: accentColor, borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}
                  >
                    ← See All Food Trucks
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

function InfoCard({ icon, label, children }) {
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
