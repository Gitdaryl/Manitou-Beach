import React, { useState, useRef } from 'react';
import { Navbar, Footer, GlobalStyles } from '../components/Layout';
import { C } from '../data/config';

const input = {
  width: '100%', boxSizing: 'border-box', padding: '13px 16px',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  background: 'rgba(255,255,255,0.06)', color: C.cream,
  fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: 'none',
};

const label = {
  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1,
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6,
};

export default function QuickEventsPage() {
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imageType, setImageType] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [adminKey, setAdminKey] = useState(() => {
    try { return localStorage.getItem('mb_admin_key') || ''; } catch { return ''; }
  });
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image is too large — keep it under 5 MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('That doesn\'t look like an image. Try a JPG, PNG, or screenshot.');
      return;
    }
    setError('');
    setImageType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      // Strip the data:image/...;base64, prefix for the API
      const base64 = e.target.result.split(',')[1];
      setImageData(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  }

  function clearImage() {
    setImagePreview(null);
    setImageData(null);
    setImageType(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit() {
    if (!businessName.trim()) {
      setError('Which business is this for? Type their name above.');
      return;
    }
    if (!imageData && !text.trim()) {
      setError('Upload a photo or paste some text — we need something to work with.');
      return;
    }
    if (!adminKey.trim()) {
      setError('Admin key required.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      localStorage.setItem('mb_admin_key', adminKey);
    } catch {}

    try {
      const body = {
        businessName: businessName.trim(),
        businessEmail: businessEmail.trim() || undefined,
        businessPhone: businessPhone.trim() || undefined,
      };

      if (imageData) {
        body.imageData = imageData;
        body.imageType = imageType;
      } else {
        body.text = text.trim();
      }

      const res = await fetch('/api/extract-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminKey,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      setResult(data);

      // Clear form for next upload
      if (data.count > 0) {
        setText('');
        clearImage();
      }
    } catch (err) {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const hasContent = imageData || text.trim();

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', background: C.night, color: C.cream }}>
        <Navbar />

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 20px 80px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase',
              color: C.sage, marginBottom: 14, fontFamily: "'Libre Franklin', sans-serif",
            }}>
              Quick Events
            </div>
            <h1 style={{
              fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 400, color: C.cream, margin: '0 0 16px', lineHeight: 1.2,
            }}>
              Snap it. We'll handle the rest.
            </h1>
            <p style={{
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 15,
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto',
            }}>
              Photo of a chalkboard, screenshot of a Facebook post, picture of a flyer —
              send it over and we'll turn it into beautiful calendar listings.
            </p>
          </div>

          {/* Business Info */}
          <div style={{ marginBottom: 28 }}>
            <label style={label}>Business name *</label>
            <input
              type="text"
              placeholder="e.g. Devils Lake Bar & Grill"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              style={input}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div>
              <label style={label}>Email (optional)</label>
              <input
                type="email"
                placeholder="their@email.com"
                value={businessEmail}
                onChange={e => setBusinessEmail(e.target.value)}
                style={input}
              />
            </div>
            <div>
              <label style={label}>Phone (optional)</label>
              <input
                type="tel"
                placeholder="(517) 555-1234"
                value={businessPhone}
                onChange={e => setBusinessPhone(e.target.value)}
                style={input}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0 32px',
            position: 'relative', textAlign: 'center',
          }}>
            <span style={{
              position: 'relative', top: -10, background: C.night, padding: '0 16px',
              fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              Upload or paste
            </span>
          </div>

          {/* Image Upload Zone */}
          {!imagePreview ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? C.sage : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dragOver ? 'rgba(122,142,114,0.08)' : 'rgba(255,255,255,0.02)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.6 }}>📸</div>
              <div style={{
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, fontWeight: 600,
                color: C.cream, marginBottom: 6,
              }}>
                Drop a photo here or tap to upload
              </div>
              <div style={{
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13,
                color: 'rgba(255,255,255,0.4)', lineHeight: 1.6,
              }}>
                Chalkboard, Facebook screenshot, printed flyer, whiteboard — anything works
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={e => handleFile(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{
              position: 'relative', marginBottom: 20, borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <img
                src={imagePreview}
                alt="Uploaded content"
                style={{ width: '100%', display: 'block', borderRadius: 16 }}
              />
              <button
                onClick={clearImage}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none',
                  borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                  fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
              <div style={{
                position: 'absolute', bottom: 12, left: 12,
                background: 'rgba(0,0,0,0.7)', color: C.sage, padding: '6px 14px',
                borderRadius: 20, fontSize: 12, fontWeight: 600,
                fontFamily: "'Libre Franklin', sans-serif",
              }}>
                Ready to extract
              </div>
            </div>
          )}

          {/* OR divider */}
          <div style={{ textAlign: 'center', margin: '4px 0 20px' }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              or paste text
            </span>
          </div>

          {/* Text Paste Area */}
          <textarea
            placeholder={"Paste their event list, Facebook post, email — whatever you've got...\n\nExample:\nLive music every Thursday 7pm\nWing night Wednesdays $0.75 wings\nKaraoke Saturday 9pm-close"}
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={!!imageData}
            style={{
              ...input,
              minHeight: 140,
              resize: 'vertical',
              lineHeight: 1.6,
              opacity: imageData ? 0.3 : 1,
            }}
          />
          {imageData && (
            <div style={{
              fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6,
              fontFamily: "'Libre Franklin', sans-serif",
            }}>
              Image uploaded — clear it to paste text instead
            </div>
          )}

          {/* Admin Key */}
          <div style={{ marginTop: 28 }}>
            <label style={label}>Admin key</label>
            <input
              type="password"
              placeholder="Required"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              style={{ ...input, maxWidth: 240 }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 20, padding: '14px 18px', borderRadius: 10,
              background: 'rgba(192,60,60,0.15)', border: '1px solid rgba(192,60,60,0.3)',
              color: '#E88', fontSize: 14, fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !hasContent}
            style={{
              width: '100%', marginTop: 28, padding: '18px 24px',
              borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
              background: loading ? C.dusk : (hasContent ? C.sage : 'rgba(255,255,255,0.06)'),
              color: hasContent ? '#fff' : 'rgba(255,255,255,0.3)',
              fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, fontWeight: 700,
              letterSpacing: 0.5, transition: 'all 0.3s',
            }}
          >
            {loading ? 'Reading events...' : 'Extract & Add to Calendar'}
          </button>

          {loading && (
            <div style={{
              textAlign: 'center', marginTop: 16, fontSize: 13,
              color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              Claude is reading the content and pulling out every event...
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{
              marginTop: 28, padding: '24px', borderRadius: 16,
              background: result.count > 0 ? 'rgba(122,142,114,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${result.count > 0 ? 'rgba(122,142,114,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                color: result.count > 0 ? C.sage : 'rgba(255,255,255,0.4)',
                marginBottom: 12, fontFamily: "'Libre Franklin', sans-serif",
              }}>
                {result.count > 0 ? `${result.count} event${result.count === 1 ? '' : 's'} extracted` : 'No events found'}
              </div>

              {result.events?.map((name, i) => (
                <div key={i} style={{
                  padding: '10px 14px', marginBottom: 6, borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)',
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: C.cream,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ color: C.sage, fontSize: 16 }}>✓</span>
                  {name}
                </div>
              ))}

              {result.count > 0 && (
                <div style={{
                  marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.4)',
                  fontFamily: "'Libre Franklin', sans-serif", lineHeight: 1.6,
                }}>
                  These are in your review queue as Pending. Open Notion to publish them.
                </div>
              )}

              {result.errors?.length > 0 && (
                <div style={{
                  marginTop: 12, fontSize: 13, color: '#E88',
                  fontFamily: "'Libre Franklin', sans-serif",
                }}>
                  Failed to save: {result.errors.join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Another upload prompt */}
          {result?.count > 0 && (
            <div style={{
              textAlign: 'center', marginTop: 24, fontSize: 14,
              color: 'rgba(255,255,255,0.4)', fontFamily: "'Libre Franklin', sans-serif",
            }}>
              Got another one? Drop the next photo or paste above.
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
