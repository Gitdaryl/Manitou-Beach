import { useState, useCallback, useRef } from 'react';
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [links, setLinks] = useState([]);
  const scrollRef = useRef(null);

  const conversation = useConversation({
    onMessage: ({ message, source }) => {
      if (message) {
        setTranscript(prev => [...prev.slice(-12), { role: source === 'user' ? 'user' : 'assistant', text: message }]);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 60);
      }
    },
    onError: (err) => {
      console.error('ElevenLabs error:', err);
    },
  });

  const { status, isSpeaking } = conversation;
  const isActive = status === 'connected';
  const isConnecting = status === 'connecting';

  const startConversation = useCallback(async () => {
    setPanelOpen(true);
    setTranscript([]);
    setLinks([]);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        clientTools: {
          showLink: async ({ url, label, sublabel }) => {
            setLinks(prev => prev.some(l => l.url === url) ? prev : [...prev, { url, label: label || 'Open Link', sublabel }]);
            return 'Link shown to user';
          },
          navigateTo: async ({ path }) => {
            window.location.href = path;
            return 'Navigating user to ' + path;
          },
          getUserLocation: async () => {
            try {
              const pos = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
              );
              return JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            } catch {
              return JSON.stringify({ error: 'Location unavailable — user denied or not supported' });
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

  return (
    <>
      {/* Chat Panel */}
      {panelOpen && (
        <div style={{
          position: 'fixed', bottom: 92, right: 24, zIndex: 9997,
          width: 340, maxHeight: 480,
          background: 'rgba(26,40,48,0.96)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isActive ? C.sage : isConnecting ? C.sunset : 'rgba(255,255,255,0.25)',
                animation: isActive ? 'vc-breathe 1.5s ease-in-out infinite' : 'none',
              }} />
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
                {isConnecting ? 'Connecting…' : isActive ? (isSpeaking ? 'Speaking' : 'Listening') : 'Manitou Beach Guide'}
              </span>
            </div>
            <button onClick={() => setPanelOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '2px 4px' }}>×</button>
          </div>

          {/* Transcript */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320 }}>
            {transcript.length === 0 && isConnecting && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'center', margin: '24px 0' }}>Connecting to your guide…</p>
            )}
            {transcript.length === 0 && isActive && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'center', margin: '24px 0' }}>Ask me anything about Manitou Beach…</p>
            )}
            {!isActive && !isConnecting && transcript.length === 0 && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: "'Libre Franklin', sans-serif", textAlign: 'center', margin: '24px 0' }}>Tap the mic to start talking</p>
            )}
            {transcript.map((t, i) => (
              <div key={i} style={{
                alignSelf: t.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: t.role === 'user' ? `${C.sage}22` : 'rgba(255,255,255,0.07)',
                border: `1px solid ${t.role === 'user' ? C.sage + '35' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: t.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '8px 12px',
              }}>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.55 }}>{t.text}</p>
              </div>
            ))}
            {isSpeaking && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '10px 14px', background: 'rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 4px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.sage, animation: `vc-float 0.6s ease-in-out ${i * 0.15}s infinite alternate` }} />
                ))}
              </div>
            )}
            {links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'block', textDecoration: 'none',
                background: `${C.sunset}15`, border: `1px solid ${C.sunset}40`,
                borderRadius: 10, padding: '10px 14px', transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = `${C.sunset}28`}
                onMouseLeave={e => e.currentTarget.style.background = `${C.sunset}15`}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: C.sunsetLight, fontFamily: "'Libre Franklin', sans-serif" }}>{link.label}</div>
                {link.sublabel && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: "'Libre Franklin', sans-serif" }}>{link.sublabel}</div>}
                <div style={{ fontSize: 11, color: C.sunset, marginTop: 4, fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600 }}>Open →</div>
              </a>
            ))}
          </div>

          {/* End call */}
          {isActive && (
            <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'center' }}>
              <button onClick={endConversation} style={{
                background: 'rgba(220,60,60,0.12)', border: '1px solid rgba(220,60,60,0.3)',
                color: '#ff7070', borderRadius: 8, padding: '7px 22px',
                fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer',
              }}>
                End Call
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating mic button */}
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
      `}</style>
    </>
  );
}
