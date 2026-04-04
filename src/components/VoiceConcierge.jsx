import { useState, useCallback, useRef, useEffect } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { C } from '../data/config';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

export default function VoiceConcierge() {
  if (!AGENT_ID) return null;
  return (
    <ConversationProvider>
      <VoiceConciergeInner />
    </ConversationProvider>
  );
}

function VoiceConciergeInner() {
  const [cards, setCards] = useState([]);       // link/contact/info cards
  const [trayOpen, setTrayOpen] = useState(false);
  const trayRef = useRef(null);

  // Auto-open tray when cards arrive, auto-close when cleared
  useEffect(() => {
    if (cards.length > 0) setTrayOpen(true);
  }, [cards.length]);

  const conversation = useConversation({
    onError: (err) => console.error('ElevenLabs error:', err),
  });

  const { status, isSpeaking } = conversation;
  const isActive = status === 'connected';
  const isConnecting = status === 'connecting';

  const startConversation = useCallback(async () => {
    setCards([]);
    setTrayOpen(false);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        clientTools: {
          // Surface a clickable link card
          showLink: async ({ url, label, sublabel }) => {
            setCards(prev => prev.some(c => c.id === url) ? prev : [...prev, { type: 'link', id: url, url, label: label || 'Open Link', sublabel }]);
            return 'Link shown to user';
          },
          // Surface a business/contact card
          showContact: async ({ name, phone, address, url }) => {
            const id = `contact-${name}`;
            setCards(prev => prev.some(c => c.id === id) ? prev : [...prev, { type: 'contact', id, name, phone, address, url }]);
            return 'Contact card shown to user';
          },
          // Surface a text info card (event details, directions, etc.)
          showInfo: async ({ title, text }) => {
            const id = `info-${title}`;
            setCards(prev => prev.some(c => c.id === id) ? prev : [...prev, { type: 'info', id, title, text }]);
            return 'Info card shown to user';
          },
          // Surface a numbered step-by-step guide the user can follow along
          showSteps: async ({ title, steps, actionUrl, actionLabel }) => {
            const id = `steps-${title}`;
            // steps may come as newline-separated string or array
            const stepList = Array.isArray(steps) ? steps : (steps || '').split('\n').filter(Boolean);
            setCards(prev => prev.some(c => c.id === id) ? prev : [...prev, { type: 'steps', id, title, steps: stepList, actionUrl, actionLabel }]);
            return 'Step-by-step guide shown to user';
          },
          // Navigate to a page on the site
          navigateTo: async ({ path }) => {
            window.location.href = path;
            return 'Navigating user to ' + path;
          },
          // Look up events from the live calendar (Notion DB)
          lookupEvents: async ({ query }) => {
            try {
              const url = query
                ? `/api/concierge-events?q=${encodeURIComponent(query)}`
                : '/api/concierge-events';
              const res = await fetch(url);
              const data = await res.json();
              return JSON.stringify({
                summary: data.summary,
                upcoming: (data.upcoming || []).slice(0, 5).map(e => ({
                  name: e.name,
                  date: e.dateFriendly,
                  time: e.time,
                  location: e.location,
                  cost: e.cost,
                  ticketsEnabled: e.ticketsEnabled,
                  ticketStatus: e.ticketStatus,
                  ticketPrice: e.ticketPrice,
                  ticketsRemaining: e.ticketsRemaining,
                })),
                recurring: (data.recurring || []).slice(0, 3).map(e => ({
                  name: e.name,
                  recurringDay: e.recurringDay,
                  time: e.time,
                  location: e.location,
                })),
                total: data.total,
                matched: data.matched ? data.matched.slice(0, 3).map(e => ({
                  name: e.name,
                  date: e.dateFriendly,
                  time: e.time,
                  location: e.location,
                  ticketsEnabled: e.ticketsEnabled,
                  ticketStatus: e.ticketStatus,
                  ticketPrice: e.ticketPrice,
                })) : undefined,
              });
            } catch {
              return JSON.stringify({ summary: "I couldn't pull up events right now. Click Events in the menu bar to see the calendar.", error: true });
            }
          },
          // Look up businesses from the live directory (Notion DB)
          lookupBusinesses: async ({ query, category }) => {
            try {
              const params = new URLSearchParams();
              if (query) params.set('q', query);
              if (category) params.set('category', category);
              const url = `/api/concierge-businesses${params.toString() ? '?' + params : ''}`;
              const res = await fetch(url);
              const data = await res.json();
              return JSON.stringify({
                summary: data.summary,
                businesses: (data.businesses || []).slice(0, 5).map(b => ({
                  name: b.name,
                  description: b.description,
                  phone: b.phone,
                  address: b.address,
                  website: b.website,
                  categories: b.categories,
                })),
                total: data.total,
                categories: data.categories,
              });
            } catch {
              return JSON.stringify({ summary: "I couldn't pull up the business directory right now. Click Home in the menu, then Local Businesses to browse.", error: true });
            }
          },
          // Get user's GPS location
          getUserLocation: async () => {
            try {
              const pos = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
              );
              return JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            } catch {
              return JSON.stringify({ error: 'Location unavailable - user denied or not supported' });
            }
          },
        },
      });
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  }, [conversation]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const dismissCard = (id) => {
    setCards(prev => {
      const next = prev.filter(c => c.id !== id);
      if (next.length === 0) setTrayOpen(false);
      return next;
    });
  };

  const hasCards = cards.length > 0;

  return (
    <>
      {/* ── Card Tray - slides up when agent surfaces info ── */}
      {trayOpen && hasCards && (
        <div ref={trayRef} style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 9997,
          width: 320,
          display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'vc-slide-up 0.3s ease-out',
        }}>
          {/* Dismiss all */}
          <button onClick={() => { setCards([]); setTrayOpen(false); }} style={{
            alignSelf: 'flex-end', background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.35)', fontSize: 11, cursor: 'pointer',
            fontFamily: "'Libre Franklin', sans-serif", padding: '2px 0',
          }}>Clear all ×</button>

          {cards.map(card => (
            <div key={card.id} style={{
              background: 'rgba(26,40,48,0.96)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14, overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              position: 'relative',
            }}>
              {/* Dismiss single card */}
              <button onClick={() => dismissCard(card.id)} style={{
                position: 'absolute', top: 8, right: 10,
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 0,
              }}>×</button>

              {card.type === 'link' && (
                <a href={card.url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textDecoration: 'none', padding: '14px 16px',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", paddingRight: 20 }}>{card.label}</div>
                  {card.sublabel && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3, fontFamily: "'Libre Franklin', sans-serif" }}>{card.sublabel}</div>}
                  <div style={{ fontSize: 11, color: C.sunset, marginTop: 6, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>Open →</div>
                </a>
              )}

              {card.type === 'contact' && (
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'Libre Franklin', sans-serif", paddingRight: 20 }}>{card.name}</div>
                  {card.phone && (
                    <a href={`tel:${card.phone}`} style={{ display: 'block', fontSize: 13, color: C.sage, marginTop: 6, fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none', fontWeight: 600 }}>
                      📞 {card.phone}
                    </a>
                  )}
                  {card.address && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4, fontFamily: "'Libre Franklin', sans-serif" }}>{card.address}</div>}
                  {card.url && (
                    <a href={card.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', fontSize: 11, color: C.sunset, marginTop: 6, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600, textDecoration: 'none' }}>
                      Visit website →
                    </a>
                  )}
                </div>
              )}

              {card.type === 'info' && (
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif", paddingRight: 20 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.5 }}>{card.text}</div>
                </div>
              )}

              {card.type === 'steps' && (
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.sage, fontFamily: "'Libre Franklin', sans-serif", paddingRight: 20, marginBottom: 10 }}>{card.title}</div>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    {(card.steps || []).map((step, si) => (
                      <li key={si} style={{
                        fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'Libre Franklin', sans-serif",
                        lineHeight: 1.55, marginBottom: 6, paddingLeft: 4,
                      }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {card.actionUrl && (
                    <a href={card.actionUrl} style={{
                      display: 'inline-block', marginTop: 10, padding: '7px 16px',
                      background: `${C.sage}25`, border: `1px solid ${C.sage}50`,
                      borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.sage,
                      fontFamily: "'Libre Franklin', sans-serif", textDecoration: 'none',
                    }}>
                      {card.actionLabel || 'Get started'} →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Status pill - shows during active call ── */}
      {(isActive || isConnecting) && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 9996,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(26,40,48,0.92)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '6px 14px 6px 10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          animation: 'vc-fade-in 0.25s ease-out',
        }}>
          {/* Status dot */}
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isConnecting ? C.sunset : C.sage,
            animation: isActive ? 'vc-breathe 1.5s ease-in-out infinite' : 'none',
          }} />
          <span style={{
            fontFamily: "'Libre Franklin', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}>
            {isConnecting ? 'Connecting…' : isSpeaking ? 'Speaking' : 'Listening'}
          </span>
          {/* Audio bars animation when speaking */}
          {isSpeaking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 2 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  width: 2, borderRadius: 1,
                  background: C.sage,
                  animation: `vc-bar 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                }} />
              ))}
            </div>
          )}
          {/* End button inline */}
          <button onClick={endConversation} style={{
            background: 'none', border: 'none', color: 'rgba(255,100,100,0.7)',
            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
            fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer',
            marginLeft: 4, padding: '2px 0',
          }}>End</button>
        </div>
      )}

      {/* ── Floating mic button ── */}
      <button
        onClick={isActive ? endConversation : startConversation}
        title={isActive ? 'End call' : 'Ask your Manitou Beach guide'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
          width: 56, height: 56, borderRadius: '50%',
          background: isActive ? C.sunset : C.dusk,
          border: `2px solid ${isActive ? C.sunset + '80' : 'rgba(255,255,255,0.15)'}`,
          boxShadow: isActive
            ? `0 0 0 8px ${C.sunset}18, 0 8px 28px rgba(0,0,0,0.35)`
            : '0 4px 20px rgba(0,0,0,0.35)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease',
          animation: isActive ? 'vc-pulse 2s ease-in-out infinite' : 'none',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isActive ? (
            <rect x="6" y="6" width="12" height="12" rx="2" fill="white" stroke="none" />
          ) : (
            <>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </>
          )}
        </svg>
      </button>

      <style>{`
        @keyframes vc-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes vc-float { to { transform: translateY(-4px); } }
        @keyframes vc-pulse { 0%, 100% { box-shadow: 0 0 0 8px ${C.sunset}18, 0 8px 28px rgba(0,0,0,0.35); } 50% { box-shadow: 0 0 0 14px ${C.sunset}08, 0 8px 28px rgba(0,0,0,0.35); } }
        @keyframes vc-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vc-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vc-bar { from { height: 4px; } to { height: 12px; } }
      `}</style>
    </>
  );
}
