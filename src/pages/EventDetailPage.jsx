import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import SEOHead from '../components/SEOHead';
import { LIFECYCLE_BADGES } from '../components/LifecycleRibbon';

const CAT_COLORS = {
  'Live Music': C.sunset,
  'Food & Social': '#8B5E3C',
  'Sports & Outdoors': C.sage,
  'Community': C.lakeBlue,
  'Arts & Culture': '#7B6BA0',
  'Markets & Vendors': '#8B5E3C',
  'Other': C.textMuted,
};

// ── Smart image picker ────────────────────────────────────────────────────────
// Priority: venue keyword → category → generic fallback

const VENUE_IMAGES = [
  { keys: ['aeronautique', 'winery', 'wine', 'corks', 'kegs', 'highland', 'cherry creek', 'chateau', 'vineyard'], img: '/images/Explore-wineries.jpg' },
  { keys: ['nightlife', 'tavern', 'bar & grill', 'bar and grill', 'saloon', 'pub'], img: '/images/explore-nightlife.jpg' },
  { keys: ['food truck', 'foodtruck', 'wieners', 'taco', 'bbq truck'], img: '/images/foodtruck_hero.jpg' },
  { keys: ['lighthouse'], img: '/images/explore-lighthouse.jpg' },
  { keys: ['fishing', 'fish', 'bass', 'walleye', 'bluegill', 'ice fish'], img: '/images/explore-fishing.jpg' },
  { keys: ['irish hills', 'explore'], img: '/images/explore-Irish-hills.jpg' },
  { keys: ['devils lake', 'round lake', 'kayak', 'swim', 'boat', 'pontoon', 'waterski', 'jetski', 'paddle'], img: '/images/explore-devils-lake.jpg' },
  { keys: ['historic', 'museum', 'history', 'heritage', 'historical'], img: '/images/historic-hero.jpg' },
  { keys: ['village', 'community', 'festival', 'fair', 'flea market', 'vendor show', 'open house'], img: '/images/landlakes-hero.jpg' },
  { keys: ['music', 'concert', 'band', 'tribute', 'dj ', 'live at', 'performs'], img: '/images/happening-hero.jpg' },
];

const CAT_IMAGES = {
  'Live Music': '/images/explore-nightlife.jpg',
  'Food & Social': '/images/foodtruck_hero.jpg',
  'Sports & Outdoors': '/images/explore-devils-lake.jpg',
  'Community': '/images/community-bg.jpg',
  'Arts & Culture': '/images/dispatch-header-web.jpg',
  'Markets & Vendors': '/images/landlakes-hero.jpg',
};

function getSmartImage(event) {
  if (event.imageUrl) return event.imageUrl;
  const haystack = `${event.name} ${event.location} ${event.description}`.toLowerCase();
  for (const { keys, img } of VENUE_IMAGES) {
    if (keys.some(k => haystack.includes(k))) return img;
  }
  return CAT_IMAGES[event.category] || '/images/happening-hero.jpg';
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function formatFullDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatShortDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMonthDay(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return { month: d.toLocaleDateString('en-US', { month: 'short' }), day: d.getDate() };
}

function isPast(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T23:59:59') < new Date();
}

// ── Related event card ────────────────────────────────────────────────────────

function RelatedCard({ event }) {
  const color = CAT_COLORS[event.category] || C.sage;
  const { month, day } = formatMonthDay(event.date);
  const img = getSmartImage(event);
  const past = isPast(event.date);
  if (past) return null;

  return (
    <Link
      to={`/events/${event.id}`}
      style={{ textDecoration: 'none', display: 'block', borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.sand}`, background: '#fff', transition: 'box-shadow 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ height: 110, position: 'relative', overflow: 'hidden', background: C.dusk }}>
        <img src={img} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} onError={e => { e.target.src = '/images/happening-hero.jpg'; }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,18,24,0.7))' }} />
        <div style={{ position: 'absolute', top: 8, left: 10, background: '#fff', borderRadius: 6, padding: '3px 8px', textAlign: 'center', minWidth: 38 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: 1, fontFamily: "'Libre Franklin', sans-serif" }}>{month}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.dusk, lineHeight: 1, fontFamily: "'Libre Baskerville', serif" }}>{day}</div>
        </div>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3, fontFamily: "'Libre Franklin', sans-serif" }}>{event.category}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.dusk, lineHeight: 1.3, marginBottom: 4, fontFamily: "'Libre Baskerville', serif" }}>{event.name}</div>
        {event.location && <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>{event.location}</div>}
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const siteUrl = 'https://manitoubeachmichigan.com';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/event-detail?id=${encodeURIComponent(eventId)}`)
      .then(r => r.json())
      .then(d => { setEvent(d.event || null); setRelated(d.related || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleShare = () => {
    const url = `${siteUrl}/events/${eventId}`;
    if (navigator.share && event) {
      navigator.share({ title: event.name, text: `Check out ${event.name} at Manitou Beach`, url });
    } else {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
    }
  };

  const scrollTo = (id) => { window.location.href = '/#' + id; };
  const past = event ? isPast(event.date) : false;
  const catColor = event ? (CAT_COLORS[event.category] || C.sage) : C.sage;
  const heroImage = event ? getSmartImage(event) : '/images/happening-hero.jpg';
  const hasOrganizerImage = event?.imageUrl;

  const metaDesc = event
    ? `${event.name}${event.location ? ` at ${event.location}` : ''}. ${event.date ? formatFullDate(event.date) : ''}${event.description ? '. ' + event.description.slice(0, 100) : ''}`
    : 'Event details at Manitou Beach, Devils Lake Michigan.';

  const eventSchema = event ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    startDate: event.date ? `${event.date}${event.timeStart ? 'T' + event.timeStart : 'T00:00:00'}` : undefined,
    endDate: event.date ? `${event.date}${event.timeEnd ? 'T' + event.timeEnd : 'T23:59:59'}` : undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location || 'Manitou Beach, Michigan',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Manitou Beach',
        addressRegion: 'MI',
        addressCountry: 'US',
      },
    },
    description: event.description || undefined,
    image: event.imageUrl || `${siteUrl}${heroImage}`,
    url: `${siteUrl}/events/${eventId}`,
    ...(event.organizerName ? { organizer: { '@type': 'Organization', name: event.organizerName } } : {}),
    ...(event.ticketPrice ? { offers: { '@type': 'Offer', price: String(event.ticketPrice), priceCurrency: 'USD', url: `${siteUrl}/events/${eventId}`, availability: 'https://schema.org/InStock' } } : {}),
  } : null;

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
      <GlobalStyles />

      {event && (
        <SEOHead
          title={`${event.name} - Manitou Beach`}
          description={metaDesc}
          path={`/events/${eventId}`}
          ogImage={hasOrganizerImage ? event.imageUrl : `${siteUrl}${heroImage}`}
          ogType="event"
          schema={eventSchema}
        />
      )}

      <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />

      <div style={{ paddingTop: 72, minHeight: '100vh' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.textMuted }}>Loading...</div>
          </div>
        )}

        {/* Not found */}
        {!loading && !event && (
          <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏖️</div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, margin: '0 0 12px' }}>Event not found</h1>
            <p style={{ color: C.textMuted, lineHeight: 1.7, marginBottom: 28 }}>This event may have been removed or the link might be wrong.</p>
            <Link to="/events" style={{ display: 'inline-block', background: C.dusk, color: C.cream, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              See All Events
            </Link>
          </div>
        )}

        {/* Event found */}
        {!loading && event && (
          <>
            {/* ── Hero ── */}
            <div style={{ position: 'relative', overflow: 'hidden', background: C.night }} className="event-detail-hero">
              <img
                src={heroImage}
                alt={event.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: past ? 0.4 : 0.72, position: 'absolute', inset: 0 }}
                onError={e => { e.target.src = '/images/happening-hero.jpg'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(10,18,24,0.25) 0%, rgba(10,18,24,0.82) 100%)' }} />

              <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: '52px 28px 44px' }} className="event-detail-hero-content">

                {/* Badges row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  <span style={{ background: catColor, color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" }}>
                    {event.category}
                  </span>
                  {LIFECYCLE_BADGES[event.lifecycle] && (
                    <span style={{ background: LIFECYCLE_BADGES[event.lifecycle].color, color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" }}>
                      {LIFECYCLE_BADGES[event.lifecycle].label}
                    </span>
                  )}
                  {past && (
                    <span style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', padding: '4px 14px', borderRadius: 20, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Libre Franklin', sans-serif" }}>
                      Past Event
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.15, textShadow: '0 2px 16px rgba(0,0,0,0.4)' }} className="event-detail-title">
                  {event.name}
                </h1>

                {LIFECYCLE_BADGES[event.lifecycle] && event.changeNote && (
                  <p style={{ margin: '0 0 16px', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', borderLeft: `3px solid ${LIFECYCLE_BADGES[event.lifecycle].color}`, color: '#fff', fontSize: 15, lineHeight: 1.6, fontFamily: "'Libre Franklin', sans-serif" }}>
                    {event.changeNote}
                  </p>
                )}

                {event.organizerName && (
                  <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.72)', fontSize: 15, fontFamily: "'Libre Franklin', sans-serif" }}>
                    Hosted by {event.organizerName}
                  </p>
                )}

                {/* Quick date + share row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {event.date && (
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 500 }}>
                      📅 {formatFullDate(event.date)}{event.timeStart ? ` · ${event.timeStart}` : ''}
                    </span>
                  )}
                  <button
                    onClick={handleShare}
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)', fontFamily: "'Libre Franklin', sans-serif" }}
                  >
                    {copied ? '✓ Copied' : '↗ Share'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 0' }}>

              {/* Past event banner */}
              {past && (
                <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 10, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dusk, marginBottom: 2, fontFamily: "'Libre Baskerville', serif" }}>This event has passed</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>It happened {formatShortDate(event.date)}. Catch what's coming up next.</div>
                  </div>
                  <Link to="/events" style={{ background: C.dusk, color: C.cream, padding: '9px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                    Upcoming Events →
                  </Link>
                </div>
              )}

              {/* No-image nudge */}
              {!hasOrganizerImage && !past && (
                <div style={{ background: `${C.lakeBlue}10`, border: `1px solid ${C.lakeBlue}30`, borderRadius: 8, padding: '10px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: C.lakeBlue, fontFamily: "'Libre Franklin', sans-serif" }}>
                    📷 Is this your event? Add a photo - it shows when people share the link.
                  </span>
                  <Link to="/submit-event" style={{ fontSize: 12, fontWeight: 700, color: C.lakeBlue, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Update event →
                  </Link>
                </div>
              )}

              {/* Details grid */}
              <div style={{ display: 'grid', gap: 14, marginBottom: 28 }} className="event-detail-grid">
                {event.date && (
                  <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 18px' }}>
                    <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Date</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.dusk, fontFamily: "'Libre Baskerville', serif" }}>{formatFullDate(event.date)}</div>
                    {event.dateEnd && event.dateEnd !== event.date && (
                      <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>through {formatShortDate(event.dateEnd)}</div>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="event-detail-subgrid">
                  {(event.timeStart || event.timeEnd) && (
                    <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 18px' }}>
                      <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Time</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.dusk, fontFamily: "'Libre Baskerville', serif" }}>
                        {event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}
                      </div>
                    </div>
                  )}
                  {event.cost && (
                    <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 18px' }}>
                      <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Cost</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.dusk, fontFamily: "'Libre Baskerville', serif" }}>{event.cost}</div>
                    </div>
                  )}
                </div>

                {event.location && (
                  <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.8, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Location</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.dusk, fontFamily: "'Libre Baskerville', serif", lineHeight: 1.3 }}>{event.location}</div>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(event.location + ' Manitou Beach Michigan')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: C.lakeBlue, color: '#fff', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                    >
                      Get directions
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, margin: '0 0 12px' }}>About this event</h2>
                  <p style={{ fontSize: 16, lineHeight: 1.85, color: C.text, margin: 0, whiteSpace: 'pre-wrap' }}>{event.description}</p>
                  {event.detailBlocks?.filter(b => b !== event.description).map((b, i) => (
                    <p key={i} style={{ fontSize: 16, lineHeight: 1.85, color: C.text, margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>{b}</p>
                  ))}
                </div>
              )}

              {/* CTAs */}
              {!past && (event.ticketsEnabled || event.rsvpEnabled || event.eventUrl) && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                  {event.ticketsEnabled && event.eventUrl && (
                    <a href={event.eventUrl} target="_blank" rel="noreferrer"
                      style={{ background: C.sunset, color: '#fff', padding: '13px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                      {event.ctaLabel || 'Get Tickets'}{event.ticketPrice ? ` · $${event.ticketPrice}` : ''}
                    </a>
                  )}
                  {event.rsvpEnabled && (
                    <a href={event.eventUrl || '#'} target="_blank" rel="noreferrer"
                      style={{ background: C.dusk, color: '#fff', padding: '13px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                      {event.ctaLabel || 'RSVP'}
                    </a>
                  )}
                  {event.eventUrl && !event.ticketsEnabled && !event.rsvpEnabled && (
                    <a href={event.eventUrl} target="_blank" rel="noreferrer"
                      style={{ background: C.lakeBlue, color: '#fff', padding: '13px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
                      {event.ctaLabel || 'More Info'}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ── More events strip ── */}
            {related.filter(e => !isPast(e.date)).length > 0 && (
              <div style={{ background: C.warmWhite, borderTop: `1px solid ${C.sand}`, marginTop: 16, padding: '36px 0 48px' }}>
                <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                    <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, margin: 0 }}>More coming up at Manitou Beach</h2>
                    <Link to="/events" style={{ fontSize: 13, color: C.lakeBlue, textDecoration: 'none', fontWeight: 600 }}>See all events →</Link>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="event-related-grid">
                    {related.filter(e => !isPast(e.date)).map(e => <RelatedCard key={e.id} event={e} />)}
                  </div>
                </div>
              </div>
            )}

            {/* Footer nav */}
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <Link to="/events" style={{ color: C.lakeBlue, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← All events</Link>
              <Link to="/submit-event" style={{ color: C.textMuted, textDecoration: 'none', fontSize: 13 }}>Got an event? List it free →</Link>
            </div>
          </>
        )}
      </div>

      <Footer scrollTo={scrollTo} />

      <style>{`
        .event-detail-hero { height: 380px; }
        .event-detail-hero-content { padding-top: 64px !important; padding-bottom: 48px !important; }
        .event-detail-title { font-size: 36px !important; }
        .event-detail-grid { grid-template-columns: 1fr; }
        .event-detail-subgrid { grid-template-columns: 1fr 1fr; }
        .event-related-grid { grid-template-columns: repeat(4, 1fr); }

        @media (max-width: 768px) {
          .event-related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .event-detail-hero { height: 280px !important; }
          .event-detail-hero-content { padding-top: 40px !important; padding-bottom: 32px !important; }
          .event-detail-title { font-size: 24px !important; }
          .event-detail-subgrid { grid-template-columns: 1fr !important; }
          .event-related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
