import React, { useState, useEffect } from 'react';
import { C } from '../data/config';
import { GlobalStyles } from '../components/Layout';
import yeti from '../data/errorMessages';
import formatPhone from '../utils/formatPhone';

function exportCSV(vendors, eventName) {
  const headers = ['Vendor ID', 'Business Name', 'Contact', 'Email', 'Phone', 'Booth Type', 'Notes', 'Status', 'Registered At'];
  const rows = vendors.map(v => [
    v.vendorId, v.vendorName, v.contactName, v.email, v.phone,
    v.boothType, v.notes, v.status, v.registeredAt,
  ].map(cell => `"${(cell || '').replace(/"/g, '""')}"`));

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventName.replace(/[^a-z0-9]/gi, '_')}_vendors.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const inputStyle = {
  width: '100%', padding: '11px 13px', borderRadius: 8, fontSize: 14,
  fontFamily: "'Libre Franklin', sans-serif", boxSizing: 'border-box',
  outline: 'none', color: '#1A2830',
};

export default function VendorPortalPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const eventId = params.get('event');

  const [vendors, setVendors] = useState([]);
  const [eventName, setEventName] = useState('');
  const [vendorCapacity, setVendorCapacity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [blast, setBlast] = useState({ subject: '', message: '' });
  const [blasting, setBlasting] = useState(false);
  const [blastResult, setBlastResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});

  useEffect(() => {
    if (!token || !eventId) { setAuthError(true); setLoading(false); return; }
    fetchVendors();
  }, [token, eventId]);

  async function fetchVendors() {
    try {
      const res = await fetch(`/api/vendor-list?token=${encodeURIComponent(token)}&event=${encodeURIComponent(eventId)}`);
      if (res.status === 403) { setAuthError(true); setLoading(false); return; }
      const data = await res.json();
      setVendors(data.vendors || []);
      setEventName(data.eventName || '');
      setVendorCapacity(data.vendorCapacity || 0);
    } catch {
      setAuthError(true);
    } finally {
      setLoading(false);
    }
  }

  async function sendBlast(channel) {
    if (!blast.subject.trim() || !blast.message.trim()) return;
    setBlasting(true);
    setBlastResult(null);
    try {
      const res = await fetch('/api/vendor-blast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, eventId, subject: blast.subject, message: blast.message, channel }),
      });
      const data = await res.json();
      setBlastResult({ channel, ...data });
    } catch {
      setBlastResult({ error: yeti.network() });
    } finally {
      setBlasting(false);
    }
  }

  const [showRejected, setShowRejected] = useState(false);

  async function updateStatus(pageId, newStatus, vendorName) {
    if (newStatus === 'Rejected') {
      const ok = window.confirm(`Are you sure you want to pass on ${vendorName || 'this vendor'}? They'll get a text letting them know.`);
      if (!ok) return;
    }
    setStatusLoading(prev => ({ ...prev, [pageId]: newStatus }));
    try {
      const res = await fetch('/api/vendor-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: pageId, status: newStatus, token, eventId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || yeti.oops());
        return;
      }
      await fetchVendors();
    } catch {
      alert(yeti.network());
    } finally {
      setStatusLoading(prev => ({ ...prev, [pageId]: null }));
    }
  }

  const pending = vendors.filter(v => v.status === 'Pending');
  const confirmed = vendors.filter(v => v.status === 'Confirmed');
  const rejected = vendors.filter(v => v.status === 'Rejected');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', fontFamily: "'Libre Franklin', sans-serif", color: '#8C806E' }}>
      Loading vendor list…
    </div>
  );

  if (authError) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', fontFamily: "'Libre Franklin', sans-serif", padding: 24 }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: '#1A2830', marginBottom: 8 }}>Access denied</div>
      <div style={{ fontSize: 15, color: '#8C806E' }}>This link doesn't seem right. Check your texts for the latest one?</div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Libre Franklin', sans-serif", background: '#FAF6EF', color: '#1A2830', minHeight: '100vh' }}>
      <GlobalStyles />

      {/* Header */}
      <div style={{ background: '#1A2830', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Vendor Portal</div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: '#fff' }}>{eventName}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {pending.length > 0 && (
            <div style={{ background: 'rgba(212,132,90,0.2)', borderRadius: 8, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#D4845A', lineHeight: 1 }}>{pending.length}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Pending</div>
            </div>
          )}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{confirmed.length}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Confirmed</div>
          </div>
          {vendorCapacity > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: confirmed.length >= vendorCapacity ? '#f0b0b0' : '#8de8a8', lineHeight: 1 }}>{vendorCapacity - confirmed.length}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Remaining</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>

        {/* Pending applications - card layout for mobile-friendliness */}
        {pending.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '2px solid #D4845A', marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E0D5', background: 'rgba(212,132,90,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#1A2830' }}>New Applications ({pending.length})</div>
              <div style={{ fontSize: 13, color: '#5C5248', marginTop: 6, lineHeight: 1.5 }}>
                These folks want to be part of your event! Tap <strong>Welcome Aboard</strong> to confirm them, or <strong>Not This Time</strong> to pass. Either way, they'll get a friendly text from us.
              </div>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pending.map(v => (
                <div key={v.pageId || v.vendorId} style={{ background: '#FAF6EF', borderRadius: 10, padding: '18px 20px', border: '1px solid #E8E0D5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1A2830' }}>{v.vendorName}</div>
                      <div style={{ fontSize: 13, color: '#5C5248', marginTop: 2 }}>{v.boothType || 'Vendor'}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#8C806E' }}>
                      Applied {v.registeredAt ? new Date(v.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </div>
                  </div>
                  {(v.email || v.phone) && (
                    <div style={{ fontSize: 13, color: '#5C5248', marginBottom: 14, lineHeight: 1.6 }}>
                      {v.email && <div>{v.email}</div>}
                      {v.phone && <div>{formatPhone(v.phone)}</div>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => updateStatus(v.pageId, 'Confirmed', v.vendorName)}
                      disabled={!!statusLoading[v.pageId]}
                      style={{
                        padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 700,
                        fontFamily: "'Libre Franklin', sans-serif", minHeight: 44,
                        background: statusLoading[v.pageId] === 'Confirmed' ? '#6a9a6a' : '#2a7a3a',
                        color: '#fff', border: 'none', flex: '1 1 140px',
                        cursor: statusLoading[v.pageId] ? 'wait' : 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      {statusLoading[v.pageId] === 'Confirmed' ? 'Confirming...' : 'Welcome Aboard'}
                    </button>
                    <button
                      onClick={() => updateStatus(v.pageId, 'Rejected', v.vendorName)}
                      disabled={!!statusLoading[v.pageId]}
                      style={{
                        padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 700,
                        fontFamily: "'Libre Franklin', sans-serif", minHeight: 44,
                        background: statusLoading[v.pageId] === 'Rejected' ? '#c08080' : '#fff',
                        color: statusLoading[v.pageId] === 'Rejected' ? '#fff' : '#8C806E',
                        border: '1px solid #E8E0D5', flex: '0 1 160px',
                        cursor: statusLoading[v.pageId] ? 'wait' : 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      {statusLoading[v.pageId] === 'Rejected' ? 'Sending...' : 'Not This Time'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed vendor list */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D5', marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8E0D5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1A2830' }}>Registered Vendors ({confirmed.length})</div>
            {confirmed.length > 0 && (
              <button
                onClick={() => exportCSV(confirmed, eventName)}
                style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #E8E0D5', background: '#FAF6EF', fontSize: 12, fontWeight: 600, color: '#5C5248', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
              >
                Download CSV
              </button>
            )}
          </div>

          {confirmed.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#8C806E', fontSize: 14 }}>
              No confirmed vendors yet. Once you approve pending applications, they'll show up here.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#FAF6EF' }}>
                    {['Business', 'Contact', 'Booth / Category', 'Registered', 'ID'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#8C806E', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #E8E0D5', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {confirmed.map((v, i) => (
                    <tr key={v.vendorId} style={{ borderBottom: i < confirmed.length - 1 ? '1px solid #F0EBE4' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1A2830' }}>{v.vendorName}</div>
                        {v.notes && <div style={{ fontSize: 11, color: '#8C806E', marginTop: 2 }}>{v.notes}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ color: '#3A3028' }}>{v.contactName}</div>
                        <div style={{ fontSize: 11, color: '#8C806E', marginTop: 2 }}>{v.email}</div>
                        {v.phone && <div style={{ fontSize: 11, color: '#8C806E' }}>{formatPhone(v.phone)}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#5C5248' }}>{v.boothType}</td>
                      <td style={{ padding: '12px 16px', color: '#8C806E', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {v.registeredAt ? new Date(v.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#8C806E', background: '#FAF6EF', padding: '2px 6px', borderRadius: 4 }}>{v.vendorId}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rejected vendors - collapsible record */}
        {rejected.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D5', marginBottom: 28, overflow: 'hidden' }}>
            <button
              onClick={() => setShowRejected(!showRejected)}
              style={{
                width: '100%', padding: '14px 24px', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 13, color: '#8C806E' }}>Passed On ({rejected.length})</span>
              <span style={{ fontSize: 12, color: '#8C806E' }}>{showRejected ? 'Hide' : 'Show'}</span>
            </button>
            {showRejected && (
              <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rejected.map(v => (
                  <div key={v.pageId || v.vendorId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FAF6EF', borderRadius: 6, flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#8C806E' }}>{v.vendorName}</span>
                      <span style={{ fontSize: 12, color: '#a09080', marginLeft: 8 }}>{v.boothType}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#a09080' }}>
                      {v.registeredAt ? new Date(v.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blast panel */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E0D5', padding: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A2830', marginBottom: 6 }}>Send Message to All Vendors</div>
          <p style={{ fontSize: 13, color: '#8C806E', margin: '0 0 20px', lineHeight: 1.6 }}>
            Use this to send parking instructions, load-in times, gate codes, last-minute changes, or any other information to all {confirmed.length} registered vendor{confirmed.length !== 1 ? 's' : ''}.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#8C806E', marginBottom: 6 }}>Subject</label>
              <input
                value={blast.subject}
                onChange={e => setBlast(b => ({ ...b, subject: e.target.value }))}
                placeholder="e.g. Load-in instructions for Saturday"
                style={{ ...inputStyle, border: '1px solid #E8E0D5', background: '#FAF6EF' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#8C806E', marginBottom: 6 }}>Message</label>
              <textarea
                value={blast.message}
                onChange={e => setBlast(b => ({ ...b, message: e.target.value }))}
                placeholder="Enter your message to vendors. Parking, gate code, timing, setup details…"
                rows={5}
                style={{ ...inputStyle, border: '1px solid #E8E0D5', background: '#FAF6EF', resize: 'vertical' }}
              />
            </div>

            {blastResult && (
              <div style={{
                borderRadius: 8, padding: '12px 16px', fontSize: 14,
                background: blastResult.error || blastResult.status === 'pending_a2p' ? '#fff8f0' : '#f0fff4',
                border: `1px solid ${blastResult.error ? '#f0c090' : blastResult.status === 'pending_a2p' ? '#f0d090' : '#90d0a0'}`,
                color: blastResult.error ? '#8a4400' : blastResult.status === 'pending_a2p' ? '#6a5200' : '#1a5c2a',
              }}>
                {blastResult.error
                  ? blastResult.error
                  : blastResult.status === 'pending_a2p'
                  ? 'SMS blast will be available once A2P registration is approved.'
                  : `✓ Email sent to ${blastResult.sent} vendor${blastResult.sent !== 1 ? 's' : ''}.`}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => sendBlast('email')}
                disabled={blasting || !blast.subject.trim() || !blast.message.trim() || confirmed.length === 0}
                style={{
                  padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  letterSpacing: 1, fontFamily: "'Libre Franklin', sans-serif", cursor: blasting || !blast.subject.trim() || !blast.message.trim() || confirmed.length === 0 ? 'not-allowed' : 'pointer',
                  background: blasting ? '#8C806E' : '#1A2830', color: '#fff', border: 'none', transition: 'background 0.2s',
                }}
              >
                {blasting ? 'Sending…' : `Email All ${confirmed.length} Vendor${confirmed.length !== 1 ? 's' : ''}`}
              </button>

              <button
                disabled
                title="SMS blast available after A2P approval"
                style={{
                  padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  letterSpacing: 1, fontFamily: "'Libre Franklin', sans-serif", cursor: 'not-allowed',
                  background: '#F0EBE4', color: '#8C806E', border: '1px solid #E8E0D5',
                }}
              >
                SMS Blast - Coming Soon
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#8C806E', margin: 0 }}>SMS blast available after A2P registration approval.</p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #E8E0D5', padding: '16px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, color: '#8C806E' }}>Vendor portal powered by Yetickets</span>
      </div>
    </div>
  );
}
