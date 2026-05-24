import React, { useState, useEffect, useCallback } from 'react';
import { C } from '../data/config';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_META = {
  new:          { label: 'New',          color: '#9B9B9B', bg: '#F5F5F5' },
  contacted:    { label: 'Contacted',    color: '#5B7E95', bg: '#EBF2F7' },
  interested:   { label: 'Interested',   color: '#5B8A6E', bg: '#EBF5EF' },
  'listed-free':{ label: 'Listed Free',  color: '#7D6EAA', bg: '#F0EEF7' },
  'listed-paid':{ label: 'Listed Paid',  color: '#C5821A', bg: '#FDF3E1' },
  'no-interest':{ label: 'No Interest',  color: '#B84040', bg: '#FBEDED' },
  unavailable:  { label: 'Unavailable',  color: '#B87A40', bg: '#FDF1E6' },
};

const ACTIVITY_TYPES = [
  { id: 'call',    icon: '📞', label: 'Call' },
  { id: 'email',   icon: '✉️',  label: 'Email' },
  { id: 'visit',   icon: '🚶', label: 'Visit' },
  { id: 'message', icon: '💬', label: 'Message' },
  { id: 'note',    icon: '📝', label: 'Note' },
];

const NEXT_STATUSES = {
  new:          ['contacted', 'interested', 'no-interest'],
  contacted:    ['interested', 'listed-free', 'no-interest', 'unavailable'],
  interested:   ['listed-free', 'listed-paid', 'no-interest'],
  'listed-free':['listed-paid'],
  'listed-paid':[],
  'no-interest':[],
  unavailable:  ['contacted'],
};

const PRIORITY_META = {
  hot:  { label: 'Hot',  color: '#D4845A' },
  warm: { label: 'Warm', color: '#C5821A' },
  cold: { label: 'Cold', color: '#5B7E95' },
};

const TICKET_TYPES = {
  url_recovery: { label: 'URL Recovery', color: '#5B7E95', icon: '🔗' },
  question:     { label: 'Question',     color: '#7D6EAA', icon: '❓' },
  modification: { label: 'Modification', color: '#C5821A', icon: '✏️' },
  idea:         { label: 'Idea',         color: '#5B8A6E', icon: '💡' },
  other:        { label: 'Other',        color: '#9B9B9B', icon: '📌' },
};

const KANBAN_COLS = [
  { id: 'new',         label: 'New',         color: '#9B9B9B' },
  { id: 'contacted',   label: 'Contacted',   color: '#5B7E95' },
  { id: 'interested',  label: 'Interested',  color: '#5B8A6E' },
  { id: 'listed-free', label: 'Listed Free', color: '#7D6EAA' },
  { id: 'listed-paid', label: 'Paid ✓',      color: '#C5821A' },
  { id: 'no-interest', label: 'No Interest', color: '#B84040' },
  { id: 'unavailable', label: 'Unavailable', color: '#B87A40' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso);
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

function shortDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PinScreen({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const attempt = async (p) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/outreach', { headers: { 'x-outreach-pin': p } });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('outreach_pin', p);
        sessionStorage.setItem('outreach_agent', data.agent);
        onLogin(p, data.agent, data);
      } else {
        setError('Wrong PIN. Try again.');
        setPin('');
      }
    } catch {
      setError('Connection error. Try again.');
      setPin('');
    }
    setLoading(false);
  };

  const handleKey = (k) => {
    if (loading) return;
    if (k === 'DEL') { setPin(p => p.slice(0, -1)); setError(''); return; }
    const next = pin + k;
    setPin(next);
    if (next.length >= 4) attempt(next);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.night, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div>
      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: '#fff', marginBottom: 4 }}>Outreach Tracker</div>
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 36 }}>Manitou Beach</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: '50%',
            background: i < pin.length ? '#fff' : 'rgba(255,255,255,0.2)',
            transition: 'background 0.15s',
          }} />
        ))}
      </div>

      {error && (
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: '#ff8a8a', marginBottom: 16, textAlign: 'center' }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 12, marginTop: error ? 0 : 16 }}>
        {['1','2','3','4','5','6','7','8','9','','0','DEL'].map((k, i) => (
          k === '' ? <div key={i} /> : (
            <button key={i} onClick={() => handleKey(k)} disabled={loading}
              style={{
                width: 64, height: 64, borderRadius: 12,
                background: k === 'DEL' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: k === 'DEL' ? 18 : 22,
                fontFamily: "'Libre Franklin', sans-serif", fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}>
              {k}
            </button>
          )
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, small }) {
  const m = STATUS_META[status] || STATUS_META.new;
  return (
    <span style={{
      background: m.bg, color: m.color, borderRadius: 20,
      padding: small ? '2px 8px' : '4px 10px',
      fontSize: small ? 11 : 12, fontWeight: 600,
      fontFamily: "'Libre Franklin', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {m.label}
    </span>
  );
}

function BusinessCard({ biz, agent, agentLabel, onOpen }) {
  const isOwn = biz.assignedTo === agent;
  const isFree = !biz.assignedTo;
  const priority = PRIORITY_META[biz.priority] || PRIORITY_META.warm;

  return (
    <div
      onClick={() => onOpen(biz)}
      style={{
        background: '#fff', borderRadius: 12, padding: '14px 16px',
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${isOwn ? priority.color : isFree ? C.sage : '#ddd'}`,
        cursor: 'pointer', marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: C.dusk, marginBottom: 3, lineHeight: 1.2 }}>
            {biz.name}
          </div>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted }}>
            {biz.category}{biz.area ? ` · ${biz.area}` : ''}
          </div>
        </div>
        <StatusBadge status={biz.status} small />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>
          {biz.lastActivity ? `Last: ${timeAgo(biz.lastActivity)}` : 'Not contacted yet'}
        </div>
        {isFree ? (
          <span style={{ fontSize: 11, fontWeight: 700, color: C.sage, fontFamily: "'Libre Franklin', sans-serif" }}>Available →</span>
        ) : !isOwn ? (
          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Claimed</span>
        ) : (
          <span style={{ fontSize: 11, color: priority.color, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif" }}>{priority.label} lead</span>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ biz, agents, onClick }) {
  const priority = PRIORITY_META[biz.priority] || PRIORITY_META.warm;
  const ag = biz.assignedTo ? agents[biz.assignedTo] : null;
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 8, padding: '10px 12px', marginBottom: 8,
      cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderLeft: `3px solid ${priority.color}`,
    }}>
      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 13, color: C.dusk, fontWeight: 600, lineHeight: 1.3 }}>
        {biz.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>{biz.area || ''}</span>
        {ag && (
          <span style={{
            width: 20, height: 20, borderRadius: '50%', background: ag.color,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', fontWeight: 700, fontFamily: "'Libre Franklin', sans-serif",
          }}>
            {ag.label[0]}
          </span>
        )}
      </div>
    </div>
  );
}

function KanbanBoard({ businesses, agents, onOpen }) {
  return (
    <div style={{ overflowX: 'auto', display: 'flex', gap: 10, padding: '12px 16px 32px', WebkitOverflowScrolling: 'touch', minHeight: '60vh' }}>
      {KANBAN_COLS.map(col => {
        const cards = businesses.filter(b => b.status === col.id);
        const isSink = col.id === 'no-interest' || col.id === 'unavailable';
        return (
          <div key={col.id} style={{ flexShrink: 0, width: isSink ? 145 : 185 }}>
            <div style={{
              background: `${col.color}18`, borderRadius: '8px 8px 0 0',
              padding: '8px 10px', borderBottom: `2px solid ${col.color}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
            }}>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: isSink ? 11 : 12, fontWeight: 700, color: col.color }}>
                {col.label}
              </span>
              <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 15, fontWeight: 700, color: C.dusk }}>
                {cards.length}
              </span>
            </div>
            {cards.length === 0 ? (
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, textAlign: 'center', padding: '14px 0', fontStyle: 'italic' }}>empty</div>
            ) : (
              cards.map(b => <KanbanCard key={b.id} biz={b} agents={agents} onClick={() => onOpen(b)} />)
            )}
          </div>
        );
      })}
    </div>
  );
}

function LogModal({ biz, agent, pin, onClose, onUpdated }) {
  const [actType, setActType] = useState('call');
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const nextStatuses = NEXT_STATUSES[biz.status] || [];

  const save = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-outreach-pin': pin },
        body: JSON.stringify({ id: biz.id, action: 'log', type: actType, note, newStatus: newStatus || undefined }),
      });
      if (res.ok) { const d = await res.json(); onUpdated(d.business); onClose(); }
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', padding: '20px 16px 32px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.dusk, marginBottom: 16, fontWeight: 700 }}>
          Log Activity — {biz.name}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>What did you do?</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ACTIVITY_TYPES.map(t => (
              <button key={t.id} onClick={() => setActType(t.id)}
                style={{
                  padding: '8px 14px', borderRadius: 8, border: `2px solid ${actType === t.id ? C.lakeBlue : '#ddd'}`,
                  background: actType === t.id ? `${C.lakeBlue}15` : '#fff',
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, cursor: 'pointer',
                  color: actType === t.id ? C.lakeBlue : C.text,
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {nextStatuses.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Update status? (optional)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {nextStatuses.map(s => {
                const m = STATUS_META[s];
                return (
                  <button key={s} onClick={() => setNewStatus(s === newStatus ? '' : s)}
                    style={{
                      padding: '6px 12px', borderRadius: 8,
                      border: `2px solid ${newStatus === s ? m.color : '#ddd'}`,
                      background: newStatus === s ? m.bg : '#fff',
                      fontFamily: "'Libre Franklin', sans-serif", fontSize: 12,
                      color: newStatus === s ? m.color : C.text, cursor: 'pointer',
                    }}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quick note (optional)</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Left voicemail, they said call back Thursday, etc."
            rows={3}
            style={{
              width: '100%', borderRadius: 8, border: `1px solid #ddd`, padding: '10px 12px',
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, resize: 'vertical',
              boxSizing: 'border-box', outline: 'none',
            }}
          />
        </div>

        <button onClick={save} disabled={loading}
          style={{
            width: '100%', background: C.sage, color: '#fff', border: 'none',
            borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600,
            fontFamily: "'Libre Franklin', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? 'Saving…' : 'Save Activity'}
        </button>
      </div>
    </div>
  );
}

function BusinessDetail({ biz, agent, pin, agents, onClose, onUpdated, onTicketCreated }) {
  const [showLog, setShowLog] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState(biz.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const isOwn = biz.assignedTo === agent;
  const isFree = !biz.assignedTo;
  const isAdmin = agent === 'admin';
  const canAct = isOwn || isAdmin;
  const canClaim = isFree || isAdmin;

  const claim = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-outreach-pin': pin },
        body: JSON.stringify({ id: biz.id, action: 'claim' }),
      });
      if (res.ok) { const d = await res.json(); onUpdated(d.business); }
    } catch {}
    setClaiming(false);
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch('/api/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-outreach-pin': pin },
        body: JSON.stringify({ id: biz.id, action: 'notes', notes }),
      });
      if (res.ok) { const d = await res.json(); onUpdated(d.business); setEditNotes(false); }
    } catch {}
    setSavingNotes(false);
  };

  const assignedLabel = biz.assignedTo ? (agents[biz.assignedTo]?.label || biz.assignedTo) : 'Unassigned';

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
        <div style={{ background: C.cream, borderRadius: '16px 16px 0 0', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, fontWeight: 700, color: C.dusk }}>{biz.name}</div>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, marginTop: 2 }}>
                  {biz.category}{biz.area ? ` · ${biz.area}` : ''}
                </div>
              </div>
              <StatusBadge status={biz.status} />
            </div>

            {/* Info grid */}
            <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              {biz.phone && (
                <a href={`tel:${biz.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '8px 0', borderBottom: `1px solid ${C.sand}` }}>
                  <span style={{ fontSize: 18 }}>📞</span>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.lakeBlue, fontWeight: 600 }}>{biz.phone}</span>
                </a>
              )}
              {biz.contact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.sand}` }}>
                  <span style={{ fontSize: 18 }}>👤</span>
                  <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text }}>{biz.contact}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.text }}>Assigned: {assignedLabel}</span>
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Notes</div>
                {canAct && !editNotes && (
                  <button onClick={() => setEditNotes(true)} style={{ background: 'none', border: 'none', color: C.lakeBlue, fontSize: 12, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>Edit</button>
                )}
              </div>
              {editNotes ? (
                <>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                    style={{ width: '100%', borderRadius: 8, border: `1px solid #ddd`, padding: '8px 10px', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={saveNotes} disabled={savingNotes}
                      style={{ flex: 1, background: C.sage, color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                      {savingNotes ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setEditNotes(false); setNotes(biz.notes || ''); }}
                      style={{ flex: 1, background: '#eee', color: C.text, border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: biz.notes ? C.text : C.textMuted, lineHeight: 1.5 }}>
                  {biz.notes || 'No notes yet.'}
                </div>
              )}
            </div>

            {/* Activity log */}
            {biz.activityLog?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Activity Log</div>
                {[...biz.activityLog].reverse().map((entry, i) => {
                  const t = ACTIVITY_TYPES.find(a => a.id === entry.type);
                  const aLabel = agents[entry.agent]?.label || entry.agent;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: i < biz.activityLog.length - 1 ? `1px solid ${C.sand}` : 'none' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{t?.icon || '📝'}</span>
                      <div>
                        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.4 }}>
                          <strong>{t?.label || 'Note'}</strong>{entry.note ? ` — ${entry.note}` : ''}
                        </div>
                        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                          {aLabel} · {shortDate(entry.date)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {canAct && (
                <button onClick={() => setShowLog(true)}
                  style={{ background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer' }}>
                  📋 Log Activity
                </button>
              )}
              {canClaim && !isOwn && (
                <button onClick={claim} disabled={claiming}
                  style={{ background: C.sage, color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", cursor: claiming ? 'not-allowed' : 'pointer', opacity: claiming ? 0.7 : 1 }}>
                  {claiming ? 'Claiming…' : '🙋 Claim This Lead'}
                </button>
              )}
              <button onClick={() => setShowTicket(true)}
                style={{ background: 'none', border: `1px solid ${C.sand}`, color: C.textMuted, borderRadius: 10, padding: '12px', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", cursor: 'pointer' }}>
                🎫 Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLog && (
        <LogModal biz={biz} agent={agent} pin={pin} onClose={() => setShowLog(false)} onUpdated={(updated) => { onUpdated(updated); setShowLog(false); }} />
      )}

      {showTicket && (
        <CreateTicketModal
          biz={biz} pin={pin}
          onClose={() => setShowTicket(false)}
          onCreated={(t) => { onTicketCreated?.(t); setShowTicket(false); }}
        />
      )}
    </>
  );
}

function AddBusinessModal({ pin, onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', category: 'Other', area: 'Manitou Beach', phone: '', contact: '', priority: 'warm', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { setError('Business name is required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-outreach-pin': pin },
        body: JSON.stringify(form),
      });
      if (res.ok) { const d = await res.json(); onAdded(d.business); onClose(); }
      else { const d = await res.json(); setError(d.error || 'Failed to add'); }
    } catch { setError('Connection error'); }
    setLoading(false);
  };

  const inputStyle = { width: '100%', borderRadius: 8, border: `1px solid #ddd`, padding: '10px 12px', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, boxSizing: 'border-box', outline: 'none', background: '#fff' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ background: C.cream, borderRadius: '16px 16px 0 0', width: '100%', padding: '20px 16px 32px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.dusk, marginBottom: 16, fontWeight: 700 }}>Add Business</div>

        {error && <div style={{ background: '#FBEDED', color: '#B84040', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Business Name *</div>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dave's Marina" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Category</div>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
                {['Restaurant','Bar','Marina','Retail','Accommodation','Food Truck','Winery','Service','Real Estate','Event Organizer','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Area</div>
              <select value={form.area} onChange={e => set('area', e.target.value)} style={inputStyle}>
                {['Manitou Beach','Irish Hills','Brooklyn','Cambridge Junction','Clarklake','Other'].map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Phone</div>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="517-555-1234" type="tel" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Contact Name</div>
            <input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Owner's name" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Priority</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(PRIORITY_META).map(([k, v]) => (
                <button key={k} onClick={() => set('priority', k)}
                  style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${form.priority === k ? v.color : '#ddd'}`, background: form.priority === k ? `${v.color}15` : '#fff', color: form.priority === k ? v.color : C.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Notes</div>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Anything useful to know..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        <button onClick={save} disabled={loading}
          style={{ marginTop: 16, width: '100%', background: C.sage, color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Adding…' : 'Add Business'}
        </button>
      </div>
    </div>
  );
}

function CreateTicketModal({ biz, pin, onClose, onCreated }) {
  const [type, setType] = useState('question');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-outreach-pin': pin },
        body: JSON.stringify({ action: 'ticket', bizId: biz?.id, bizName: biz?.name || '', type, body }),
      });
      if (res.ok) { const d = await res.json(); onCreated(d.ticket); onClose(); }
      else { const d = await res.json(); setError(d.error || 'Failed'); }
    } catch { setError('Connection error'); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', padding: '20px 16px 32px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.dusk, fontWeight: 700, marginBottom: 4 }}>Report Issue</div>
        {biz && <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, marginBottom: 16 }}>{biz.name}</div>}
        {error && <div style={{ background: '#FBEDED', color: '#B84040', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>{error}</div>}

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Type</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(TICKET_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setType(k)}
                style={{
                  padding: '7px 12px', borderRadius: 8, border: `2px solid ${type === k ? v.color : '#ddd'}`,
                  background: type === k ? `${v.color}15` : '#fff',
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, cursor: 'pointer',
                  color: type === k ? v.color : C.text, fontWeight: type === k ? 600 : 400,
                }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>

        {type === 'url_recovery' && (
          <div style={{ background: '#EBF2F7', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.lakeBlue }}>
            Auto-handled: system looks up their listing in Notion and sends them the URL.
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Details</div>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
            placeholder={type === 'url_recovery' ? 'Any extra context (optional)' : 'What happened or what needs attention?'}
            style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', padding: '10px 12px', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>

        <button onClick={save} disabled={loading}
          style={{ width: '100%', background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 600, fontFamily: "'Libre Franklin', sans-serif", cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </div>
    </div>
  );
}

// ── Admin Stats ───────────────────────────────────────────────────────────────

function AdminStats({ stats, agents }) {
  const statusOrder = ['new','contacted','interested','listed-free','listed-paid','no-interest','unavailable'];
  return (
    <div style={{ padding: '0 16px 16px' }}>
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Team Progress</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {Object.entries(agents).filter(([k]) => k !== 'admin').map(([k, v]) => (
          <div key={k} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: v.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, fontFamily: "'Libre Franklin', sans-serif" }}>{v.label}</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: C.dusk }}>{stats.byAgent[k] || 0}</div>
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>leads claimed</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Pipeline</div>
        {statusOrder.map(s => {
          const count = stats.byStatus[s] || 0;
          if (!count) return null;
          const m = STATUS_META[s];
          return (
            <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <StatusBadge status={s} small />
              <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, fontWeight: 700, color: C.dusk }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TicketsTab({ tickets, agents, isAdmin, pin, onResolved }) {
  const [filter, setFilter] = useState('open');
  const [resolving, setResolving] = useState(null);
  const shown = tickets.filter(t => filter === 'open' ? t.status === 'open' : t.status !== 'open');
  const openCount = tickets.filter(t => t.status === 'open').length;

  const resolve = async (ticket) => {
    setResolving(ticket.id);
    try {
      const res = await fetch('/api/outreach', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-outreach-pin': pin },
        body: JSON.stringify({ action: 'resolve_ticket', ticketId: ticket.id, resolution: 'Manually resolved' }),
      });
      if (res.ok) { const d = await res.json(); onResolved(d.ticket); }
    } catch {}
    setResolving(null);
  };

  return (
    <div style={{ padding: '12px 16px 80px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['open', `Open (${openCount})`], ['resolved', 'Resolved']].map(([f, label]) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              flex: 1, padding: '8px', borderRadius: 8,
              border: `2px solid ${filter === f ? C.lakeBlue : '#ddd'}`,
              background: filter === f ? `${C.lakeBlue}15` : '#fff',
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: filter === f ? 700 : 400,
              color: filter === f ? C.lakeBlue : C.text, cursor: 'pointer',
            }}>
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎫</div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.dusk, marginBottom: 6 }}>
            {filter === 'open' ? 'No open tickets' : 'No resolved tickets yet'}
          </div>
          <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>
            {filter === 'open' ? 'All clear. Nice work.' : 'Resolved tickets will appear here.'}
          </div>
        </div>
      ) : shown.map(t => {
        const tt = TICKET_TYPES[t.type] || TICKET_TYPES.other;
        const ag = agents[t.agent] || { label: t.agent, color: '#999' };
        return (
          <div key={t.id} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', borderLeft: `4px solid ${tt.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <div>
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, color: tt.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {tt.icon} {tt.label}
                </span>
                {t.bizName && <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, fontWeight: 700, color: C.dusk, marginTop: 2 }}>{t.bizName}</div>}
              </div>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted, whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(t.createdAt)}</span>
            </div>
            {t.body && <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.text, lineHeight: 1.5, marginBottom: 8 }}>{t.body}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: C.textMuted }}>
                by <span style={{ color: ag.color, fontWeight: 600 }}>{ag.label}</span>
              </span>
              {t.status === 'resolved' && t.resolution && (
                <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, color: '#5B8A6E' }}>✓ {t.resolution}</span>
              )}
              {t.status === 'open' && isAdmin && (
                <button onClick={() => resolve(t)} disabled={resolving === t.id}
                  style={{ background: 'none', border: `1px solid ${C.sage}`, color: C.sage, borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                  {resolving === t.id ? '…' : '✓ Resolve'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function OutreachPage() {
  const [pin, setPin] = useState(() => sessionStorage.getItem('outreach_pin') || '');
  const [agent, setAgent] = useState(() => sessionStorage.getItem('outreach_agent') || '');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('mine');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSeed = async (clear = false) => {
    if (seeding) return;
    setSeeding(true);
    setSeedMsg('');
    setConfirmClear(false);
    try {
      const res = await fetch('/api/seed-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-outreach-pin': pin },
        body: JSON.stringify({ clear }),
      });
      const d = await res.json();
      if (res.ok) {
        setSeedMsg(clear
          ? `Cleared + imported ${d.added} businesses (${d.excluded} excluded)`
          : `Added ${d.added} new (${d.excluded} excluded, ${d.total} total)`
        );
        await load(pin);
      } else {
        setSeedMsg(d.error || 'Seed failed');
      }
    } catch {
      setSeedMsg('Connection error');
    }
    setSeeding(false);
    setTimeout(() => setSeedMsg(''), 6000);
  };

  const load = useCallback(async (p = pin) => {
    if (!p) return;
    setLoading(true);
    try {
      const res = await fetch('/api/outreach', { headers: { 'x-outreach-pin': p } });
      if (res.ok) { const d = await res.json(); setData(d); }
      else { setPin(''); setAgent(''); sessionStorage.clear(); }
    } catch {}
    setLoading(false);
  }, [pin]);

  useEffect(() => { if (pin) load(); }, []);

  const handleLogin = (p, a, d) => { setPin(p); setAgent(a); setData(d); };

  const handleUpdated = (updated) => {
    setData(prev => ({
      ...prev,
      businesses: prev.businesses.map(b => b.id === updated.id ? updated : b),
    }));
    setSelected(updated);
  };

  const handleAdded = (biz) => {
    setData(prev => ({ ...prev, businesses: [...prev.businesses, biz] }));
  };

  const handleTicketCreated = (ticket) => {
    setData(prev => ({ ...prev, tickets: [...(prev.tickets || []), ticket] }));
  };
  const handleTicketResolved = (updated) => {
    setData(prev => ({
      ...prev,
      tickets: (prev.tickets || []).map(t => t.id === updated.id ? updated : t),
    }));
  };

  if (!pin || !agent) return <PinScreen onLogin={handleLogin} />;
  if (!data) return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Libre Franklin', sans-serif", color: C.textMuted }}>Loading…</div>
    </div>
  );

  const { businesses = [], agents = {}, stats = {}, tickets = [] } = data;
  const isAdmin = agent === 'admin';
  const agentLabel = agents[agent]?.label || agent;

  // Filter businesses based on tab + search
  const filtered = businesses.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.name.toLowerCase().includes(q) || (b.area || '').toLowerCase().includes(q) || (b.category || '').toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (tab === 'mine') return b.assignedTo === agent;
    if (tab === 'available') return !b.assignedTo;
    if (tab === 'all') return true;
    if (tab === 'active') return ['contacted','interested'].includes(b.status);
    if (tab === 'listed') return b.status === 'listed-free' || b.status === 'listed-paid';
    return true;
  });

  const openTicketCount = tickets.filter(t => t.status === 'open').length;
  const tabs = isAdmin
    ? [
        { id: 'all',       label: 'All',     count: businesses.length },
        { id: 'board',     label: '⬛ Board', count: null },
        { id: 'available', label: 'Available', count: businesses.filter(b => !b.assignedTo).length },
        { id: 'active',    label: 'Active',  count: businesses.filter(b => ['contacted','interested'].includes(b.status)).length },
        { id: 'listed',    label: 'Listed',  count: businesses.filter(b => ['listed-free','listed-paid'].includes(b.status)).length },
        { id: 'tickets',   label: `🎫 ${openTicketCount > 0 ? `Tickets (${openTicketCount})` : 'Tickets'}`, count: null },
      ]
    : [
        { id: 'mine',      label: 'My Leads', count: businesses.filter(b => b.assignedTo === agent).length },
        { id: 'available', label: 'Available', count: businesses.filter(b => !b.assignedTo).length },
        { id: 'tickets',   label: `🎫 ${openTicketCount > 0 ? `(${openTicketCount})` : 'Tickets'}`, count: null },
      ];

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: C.cream, minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: C.dusk, padding: '16px 16px 0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: '#fff', fontWeight: 700 }}>Outreach Tracker</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>{agentLabel}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAdmin && (
              <>
                <button onClick={() => setShowAdd(true)}
                  style={{ background: C.sage, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                  + Add
                </button>
                {confirmClear ? (
                  <>
                    <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: '#ffcc88' }}>Clear all leads?</span>
                    <button onClick={() => handleSeed(true)} disabled={seeding}
                      style={{ background: '#B84040', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                      Yes
                    </button>
                    <button onClick={() => setConfirmClear(false)}
                      style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '7px 10px', fontSize: 12, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}>
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleSeed(false)} disabled={seeding}
                      title="Add new businesses from Google Places (keeps existing)"
                      style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 10px', fontSize: 12, cursor: seeding ? 'not-allowed' : 'pointer', opacity: seeding ? 0.6 : 1, fontFamily: "'Libre Franklin', sans-serif" }}>
                      {seeding ? '…' : '⬇ Seed'}
                    </button>
                    <button onClick={() => setConfirmClear(true)} disabled={seeding}
                      title="Clear all leads and re-import from Google Places"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#ffcc88', border: '1px solid rgba(255,200,100,0.3)', borderRadius: 8, padding: '8px 10px', fontSize: 12, cursor: seeding ? 'not-allowed' : 'pointer', opacity: seeding ? 0.6 : 1, fontFamily: "'Libre Franklin', sans-serif" }}>
                      🔄
                    </button>
                  </>
                )}
              </>
            )}
            <button onClick={() => { setPin(''); setAgent(''); sessionStorage.clear(); setData(null); }}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
          {seedMsg && (
            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: seedMsg.includes('Added') ? '#90ee90' : '#ff8a8a', marginTop: 6, paddingBottom: 4 }}>
              {seedMsg}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '8px 14px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                background: tab === t.id ? C.cream : 'transparent',
                color: tab === t.id ? C.dusk : 'rgba(255,255,255,0.6)',
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
              {t.label} {t.count > 0 && <span style={{ opacity: 0.7 }}>({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 0' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search businesses…"
          style={{ width: '100%', borderRadius: 8, border: `1px solid ${C.sand}`, padding: '10px 14px', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, boxSizing: 'border-box', background: '#fff' }}
        />
      </div>

      {/* Admin stats (admin only, all tab) */}
      {isAdmin && tab === 'all' && stats.total > 0 && (
        <div style={{ padding: '12px 0 0' }}>
          <AdminStats stats={stats} agents={agents} />
        </div>
      )}

      {/* Kanban board */}
      {tab === 'board' && isAdmin && (
        <KanbanBoard businesses={businesses} agents={agents} onOpen={setSelected} />
      )}

      {/* Tickets inbox */}
      {tab === 'tickets' && (
        <TicketsTab tickets={tickets} agents={agents} isAdmin={isAdmin} pin={pin} onResolved={handleTicketResolved} />
      )}

      {/* Business list (all non-board, non-tickets tabs) */}
      {tab !== 'board' && tab !== 'tickets' && (
        <div style={{ padding: '12px 16px 80px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 16, color: C.dusk, marginBottom: 6 }}>
                {tab === 'mine' ? 'No leads claimed yet' : tab === 'available' ? 'All leads are claimed' : 'Nothing here'}
              </div>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted }}>
                {tab === 'mine' ? 'Go to "Available" to claim your first lead.' : tab === 'available' ? 'Check back when new businesses are added.' : 'Try a different filter.'}
              </div>
            </div>
          ) : (
            filtered.map(b => (
              <BusinessCard key={b.id} biz={b} agent={agent} agents={agents} onOpen={setSelected} />
            ))
          )}
        </div>
      )}

      {/* Refresh button (floating) */}
      <button onClick={() => load()}
        style={{
          position: 'fixed', bottom: 20, right: 16, background: C.dusk, color: '#fff', border: 'none',
          borderRadius: 28, padding: '12px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Libre Franklin', sans-serif", boxShadow: '0 4px 14px rgba(0,0,0,0.2)', zIndex: 20,
        }}>
        ↻ Refresh
      </button>

      {/* Modals */}
      {selected && (
        <BusinessDetail
          biz={selected} agent={agent} pin={pin} agents={agents}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          onTicketCreated={handleTicketCreated}
        />
      )}

      {showAdd && (
        <AddBusinessModal pin={pin} onClose={() => setShowAdd(false)} onAdded={handleAdded} />
      )}
    </div>
  );
}
