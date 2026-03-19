import React, { useState, useEffect } from 'react';
import { C } from '../data/config';
import { GlobalStyles } from '../components/Layout';

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
      setBlastResult({ error: 'Network error. Please try again.' });
    } finally {
      setBlasting(false);
    }
  }

  const confirmed = vendors.filter(v => v.status === 'Confirmed');

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', fontFamily: "'Libre Franklin', sans-serif", color: '#8C806E' }}>
      Loading vendor list…
    </div>
  );

  if (authError) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', fontFamily: "'Libre Franklin', sans-serif", padding: 24 }}>
      <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
      <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, color: '#1A2830', marginBottom: 8 }}>Access denied</div>
      <div style={{ fontSize: 15, color: '#8C806E' }}>This link is invalid or your access token has expired.</div>
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
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{confirmed.length}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>Registered</div>
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

        {/* Vendor list */}
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
              No vendors registered yet. Share your registration link to get started.
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
                        {v.phone && <div style={{ fontSize: 11, color: '#8C806E' }}>{v.phone}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#5C5248' }}>{v.boothType}</td>
                      <td style={{ padding: '12px 16px', color: '#8C806E', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {v.registeredAt ? new Date(v.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
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
                SMS Blast — Coming Soon
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
