import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import SEOHead from '../components/SEOHead';

const CAT_COLORS = {
  'Live Music': C.sunset,
  'Food & Social': '#8B5E3C',
  'Sports & Outdoors': C.sage,
  'Community': C.lakeBlue,
  'Arts & Culture': '#7B6BA0',
  'Markets & Vendors': '#8B5E3C',
  'Other': C.textMuted,
};

const FALLBACK_IMAGES = [
  '/images/happening-hero.jpg',
  '/images/explore-Irish-hills.jpg',
  '/images/community-bg.jpg',
];

function formatFullDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatShortDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function isPast(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr + 'T23:59:59') < new Date();
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://manitoubeachmichigan.com';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`/api/event-detail?id=${encodeURIComponent(eventId)}`)
      .then(r => r.json())
      .then(d => { setEvent(d.event || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleShare = () => {
    const url = `${siteUrl}/happening/${eventId}`;
    if (navigator.share) {
      navigator.share({ title: event?.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  };

  const scrollTo = (id) => { window.location.href = '/#' + id; };
  const past = event ? isPast(event.date) : false;
  const catColor = event ? (CAT_COLORS[event.category] || C.sage) : C.sage;
  const heroImage = event?.imageUrl || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

  const metaDescription = event
    ? `${event.name} at Manitou Beach${event.location ? ` - ${event.location}` : ''}. ${event.date ? formatShortDate(event.date) : ''}${event.description ? '. ' + event.description.slice(0, 120) : ''}`
    : 'Event details at Manitou Beach, Devils Lake Michigan.';

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, color: C.text, minHeight: '100vh' }}>
      <GlobalStyles />

      {event && (
        <SEOHead
          title={`${event.name} - Manitou Beach`}
          description={metaDescription}
          path={`/happening/${eventId}`}
          ogImage={event.imageUrl || `${siteUrl}/images/happening-hero.jpg`}
          ogType="event"
        />
      )}

      <Navbar activeSection="" scrollTo={scrollTo} isSubPage={true} />

      <div style={{ paddingTop: 72, minHeight: '100vh' }}>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.textMuted }}>Loading event...</div>
          </div>
        )}

        {/* ── Not found ── */}
        {!loading && !event && (
          <div style={{ maxWidth: 560, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏖️</div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, marginBottom: 12 }}>Event not found</h1>
            <p style={{ color: C.textMuted, lineHeight: 1.7, marginBottom: 28 }}>This event may have been removed or the link might be wrong. Check the full calendar for what's happening this weekend.</p>
            <Link to="/happening" style={{ display: 'inline-block', background: C.dusk, color: C.cream, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              See All Events
            </Link>
          </div>
        )}

        {/* ── Event found ── */}
        {!loading && event && (
          <>
            {/* Hero image */}
            <div style={{ position: 'relative', height: 340, overflow: 'hidden', background: C.night }} className="event-hero">
              <img
                src={heroImage}
                alt={event.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: past ? 0.45 : 0.75 }}
                onError={e => { e.target.src = '/images/happening-hero.jpg'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,18,24,0.3) 0%, rgba(10,18,24,0.75) 100%)' }} />

              {/* Category badge */}
              <div style={{ position: 'absolute', top: 20, left: 24 }}>
                <span style={{ background: catColor, color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  {event.category}
                </span>
                {past && (
                  <span style={{ marginLeft: 8, background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: 20, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                    Past Event
                  </span>
                )}
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(8px)' }}
              >
                {copied ? '✓ Copied' : '↗ Share'}
              </button>

              {/* Event title over hero */}
              <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, padding: '0 28px' }}>
                <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 32, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }} className="event-title-hero">
                  {event.name}
                </h1>
                {event.organizerName && (
                  <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif" }}>
                    Hosted by {event.organizerName}
                  </p>
                )}
              </div>
            </div>

            {/* ── Content area ── */}
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 80px' }}>

              {/* Past event banner */}
              {past && (
                <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 10, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dusk, marginBottom: 2 }}>This event has passed</div>
                    <div style={{ fontSize: 13, color: C.textMuted }}>It happened {formatShortDate(event.date)}. See what's coming up next.</div>
                  </div>
                  <Link to="/happening" style={{ background: C.dusk, color: C.cream, padding: '9px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                    Upcoming Events →
                  </Link>
                </div>
              )}

              {/* Date / Time / Location row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }} className="event-meta-grid">
                {event.date && (
                  <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Date</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.dusk, lineHeight: 1.3 }}>{formatFullDate(event.date)}</div>
                    {event.dateEnd && event.dateEnd !== event.date && (
                      <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>through {formatShortDate(event.dateEnd)}</div>
                    )}
                  </div>
                )}

                {(event.timeStart || event.timeEnd) && (
                  <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Time</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.dusk }}>
                      {event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}
                    </div>
                  </div>
                )}

                {event.location && (
                  <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Location</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.dusk, lineHeight: 1.3 }}>{event.location}</div>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(event.location + ' Manitou Beach Michigan')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: C.lakeBlue, textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                    >
                      Get directions →
                    </a>
                  </div>
                )}

                {event.cost && (
                  <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>Cost</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.dusk }}>{event.cost}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.dusk, margin: '0 0 12px' }}>About this event</h2>
                  <p style={{ fontSize: 16, lineHeight: 1.8, color: C.text, margin: 0, whiteSpace: 'pre-wrap' }}>{event.description}</p>
                  {event.detailBlocks?.filter(b => b !== event.description).map((b, i) => (
                    <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: C.text, margin: '12px 0 0', whiteSpace: 'pre-wrap' }}>{b}</p>
                  ))}
                </div>
              )}

              {/* CTA buttons */}
              {!past && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
                  {event.ticketsEnabled && event.eventUrl && (
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: C.sunset, color: '#fff', padding: '13px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}
                    >
                      {event.ctaLabel || 'Get Tickets'}{event.ticketPrice ? ` - $${event.ticketPrice}` : ''}
                    </a>
                  )}
                  {event.rsvpEnabled && (
                    <a
                      href={event.eventUrl || `mailto:?subject=RSVP: ${encodeURIComponent(event.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: C.dusk, color: '#fff', padding: '13px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}
                    >
                      {event.ctaLabel || 'RSVP'}
                    </a>
                  )}
                  {event.eventUrl && !event.ticketsEnabled && !event.rsvpEnabled && (
                    <a
                      href={event.eventUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: C.lakeBlue, color: '#fff', padding: '13px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}
                    >
                      {event.ctaLabel || 'More Info'}
                    </a>
                  )}
                  <button
                    onClick={handleShare}
                    style={{ background: 'transparent', border: `1.5px solid ${C.sand}`, color: C.text, padding: '12px 22px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                  >
                    {copied ? '✓ Link copied' : '↗ Share this event'}
                  </button>
                </div>
              )}

              {/* Back + more events */}
              <div style={{ borderTop: `1px solid ${C.sand}`, paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <Link to="/happening" style={{ color: C.lakeBlue, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                  ← Back to all events
                </Link>
                <Link to="/submit-event" style={{ color: C.textMuted, textDecoration: 'none', fontSize: 13 }}>
                  Got an event? List it free →
                </Link>
              </div>

            </div>
          </>
        )}
      </div>

      <Footer scrollTo={scrollTo} />

      <style>{`
        @media (max-width: 640px) {
          .event-hero { height: 260px !important; }
          .event-title-hero { font-size: 22px !important; }
          .event-meta-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
