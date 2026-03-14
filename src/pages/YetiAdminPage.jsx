import React, { useState, useEffect, useRef } from 'react';
import { C } from '../data/config';
import { Footer } from '../App';

export default function YetiAdminPage() {
  // ── Auth ──────────────────────────────────────────────────────
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('yeti_admin_token'));
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem('yeti_admin_token') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Tabs ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('write'); // write | review | dashboard

  // ── Write tab ─────────────────────────────────────────────────
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('Lake Life');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [applyStatus, setApplyStatus] = useState('idle'); // idle | applying | applied | error
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | done | error
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDims, setPhotoDims] = useState(null); // { w, h }

  // ── Review tab ────────────────────────────────────────────────
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [swapStatus, setSwapStatus] = useState({});

  // ── Preview modal ──────────────────────────────────────────────
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('preview'); // preview | edit
  const [editFields, setEditFields] = useState({ title: '', excerpt: '', editorNote: '' });
  const [saveStatus, setSaveStatus] = useState('idle');
  const [unpublishingId, setUnpublishingId] = useState(null);

  // ── Dashboard ──────────────────────────────────────────────────
  const [dashLoading, setDashLoading] = useState(false);
  const [dashData, setDashData] = useState(null);

  // ── Ad Slot Monitor ────────────────────────────────────────────
  const [adSlots, setAdSlots] = useState(null);
  const [adSlotsLoading, setAdSlotsLoading] = useState(false);

  // ── Batch geocoding ────────────────────────────────────────────
  const [geoStatus, setGeoStatus] = useState('idle'); // idle | running | done | error
  const [geoResult, setGeoResult] = useState(null);

  const runBatchGeocode = async () => {
    setGeoStatus('running');
    setGeoResult(null);
    try {
      const r = await adminFetch('/api/geocode-batch', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Unknown error');
      setGeoResult(d);
      setGeoStatus('done');
    } catch (err) {
      setGeoResult({ error: err.message });
      setGeoStatus('error');
    }
  };

  const fetchAdSlots = async () => {
    setAdSlotsLoading(true);
    try {
      const res = await fetch('/api/businesses?slots=true');
      const d = await res.json();
      setAdSlots(d);
    } catch { setAdSlots(null); }
    finally { setAdSlotsLoading(false); }
  };

  // ── Promos ─────────────────────────────────────────────────────
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // ── Community POIs ─────────────────────────────────────────────
  const [adminPois, setAdminPois] = useState(null);
  const [adminPoisLoading, setAdminPoisLoading] = useState(false);

  // ── Wines Registry ─────────────────────────────────────────────
  const [adminWines, setAdminWines] = useState(null);
  const [adminWinesLoading, setAdminWinesLoading] = useState(false);
  const [wineForm, setWineForm] = useState({ name: '', venue: '', category: '', fullName: '' });
  const [wineFormSaving, setWineFormSaving] = useState(false);
  const [wineFormError, setWineFormError] = useState('');
  const [wineToggles, setWineToggles] = useState({});

  // ── Winery Ratings curation ────────────────────────────────────
  const [adminRatings, setAdminRatings] = useState(null);
  const [adminRatingsLoading, setAdminRatingsLoading] = useState(false);
  const [ratingsUpdating, setRatingsUpdating] = useState({});
  const [ratingsFilter, setRatingsFilter] = useState('Pending'); // Pending | Published | Flagged | all

  const fetchAdminPois = async () => {
    setAdminPoisLoading(true);
    try {
      const res = await fetch('/api/community-pois');
      const d = await res.json();
      setAdminPois(d.pois || []);
    } catch { setAdminPois([]); }
    finally { setAdminPoisLoading(false); }
  };

  const fetchAdminWines = async () => {
    setAdminWinesLoading(true);
    try {
      const res = await adminFetch('/api/winery-wines');
      const d = await res.json();
      setAdminWines(d.wines || []);
    } catch { setAdminWines([]); }
    finally { setAdminWinesLoading(false); }
  };

  const addWine = async (e) => {
    e.preventDefault();
    if (!wineForm.name.trim() || !wineForm.venue || !wineForm.category) {
      setWineFormError('Name, venue, and category are required.');
      return;
    }
    setWineFormSaving(true);
    setWineFormError('');
    try {
      const res = await adminFetch('/api/winery-wines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...wineForm, name: wineForm.name.trim(), fullName: wineForm.fullName.trim() || undefined }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setWineForm({ name: '', venue: '', category: '', fullName: '' });
      fetchAdminWines();
    } catch (err) {
      setWineFormError(err.message);
    } finally { setWineFormSaving(false); }
  };

  const toggleWineActive = async (wine) => {
    const next = !wine.active;
    setWineToggles(prev => ({ ...prev, [wine.id]: true }));
    try {
      await adminFetch('/api/winery-wines', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: wine.id, active: next }),
      });
      setAdminWines(prev => prev.map(w => w.id === wine.id ? { ...w, active: next } : w));
    } catch { /* silent */ }
    finally { setWineToggles(prev => { const n = { ...prev }; delete n[wine.id]; return n; }); }
  };

  const fetchAdminRatings = async () => {
    setAdminRatingsLoading(true);
    try {
      const res = await adminFetch('/api/winery-ratings-admin');
      const d = await res.json();
      setAdminRatings(d.ratings || []);
    } catch { setAdminRatings([]); }
    finally { setAdminRatingsLoading(false); }
  };

  const updateRatingStatus = async (id, status) => {
    setRatingsUpdating(prev => ({ ...prev, [id]: status }));
    try {
      await adminFetch('/api/winery-ratings-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setAdminRatings(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch { /* silent */ }
    finally { setRatingsUpdating(prev => { const n = { ...prev }; delete n[id]; return n; }); }
  };

  // ── Publish abort timer (Gmail undo-send) ──────────────────────
  const [pendingPublish, setPendingPublish] = useState(null); // { id, countdown, source }
  const publishIntervalRef = useRef(null);

  // Helper: fetch with auth token
  const adminFetch = (url, options = {}) => fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), 'X-Admin-Token': authToken },
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginPassword.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin-articles', {
        headers: { 'X-Admin-Token': loginPassword.trim() },
      });
      if (res.status === 401) { setLoginError('Wrong password — try again.'); setLoginLoading(false); return; }
      sessionStorage.setItem('yeti_admin_token', loginPassword.trim());
      setAuthToken(loginPassword.trim());
      setAuthed(true);
    } catch { setLoginError('Connection error — try again.'); }
    finally { setLoginLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('yeti_admin_token');
    setAuthed(false); setAuthToken(''); setLoginPassword('');
  };

  const fetchDrafts = async () => {
    setDraftsLoading(true);
    try {
      const res = await adminFetch('/api/admin-articles');
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      setDrafts(data.articles || []);
    } catch (err) { console.error('Failed to load drafts:', err); }
    finally { setDraftsLoading(false); }
  };

  const fetchDashboard = async () => {
    setDashLoading(true);
    try {
      const [subRes, artRes] = await Promise.all([
        fetch('/api/subscribe'),
        adminFetch('/api/admin-articles'),
      ]);
      const subData = await subRes.json();
      const artData = await artRes.json();
      const articles = artData.articles || [];
      const published = articles.filter(a => a.blogSafe);
      const draftsArr = articles.filter(a => !a.blogSafe);
      const lastPub = [...published].sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''))[0];
      setDashData({ subCount: subData.count || 0, published: published.length, drafts: draftsArr.length, lastPublished: lastPub || null });
    } catch (err) { console.error('Dashboard fetch error:', err); }
    finally { setDashLoading(false); }
  };

  const fetchPromos = async () => {
    setPromosLoading(true);
    try {
      const res = await adminFetch('/api/dispatch-ads?admin=true');
      const data = await res.json();
      setPromos(data.promos || []);
    } catch (err) { console.error('Promos fetch error:', err); }
    finally { setPromosLoading(false); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openPreview = async (article) => {
    setPreviewArticle({ ...article, content: null });
    setPreviewTab('preview');
    setEditFields({ title: article.title, excerpt: article.excerpt || '', editorNote: '' });
    setSaveStatus('idle');
    setPreviewLoading(true);
    try {
      const res = await adminFetch(`/api/admin-articles?id=${article.id}`);
      if (res.ok) {
        const data = await res.json();
        setPreviewArticle(data.article);
        setEditFields({ title: data.article.title, excerpt: data.article.excerpt || '', editorNote: data.article.editorNote || '' });
      }
    } catch (err) { console.error('Preview fetch error:', err); }
    finally { setPreviewLoading(false); }
  };

  const handleSaveEdit = async () => {
    if (!previewArticle) return;
    setSaveStatus('saving');
    try {
      const res = await adminFetch('/api/admin-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', notionId: previewArticle.id, ...editFields }),
      });
      if (!res.ok) throw new Error('Save failed');
      setPreviewArticle(prev => ({ ...prev, ...editFields }));
      setDrafts(prev => prev.map(a => a.id === previewArticle.id ? { ...a, title: editFields.title, excerpt: editFields.excerpt } : a));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch { setSaveStatus('error'); }
  };

  const executePublish = async (notionId, source) => {
    setPublishingId(notionId);
    try {
      const res = await adminFetch('/api/admin-articles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionId }),
      });
      if (source === 'card' && res.status === 401) { handleLogout(); return; }
      if (!res.ok) throw new Error('Publish failed');
      setDrafts(prev => prev.map(a => a.id === notionId ? { ...a, blogSafe: true, status: 'Published' } : a));
      if (source === 'modal') setPreviewArticle(prev => prev ? { ...prev, blogSafe: true, status: 'Published' } : null);
    } catch (err) { console.error(err); }
    finally { setPublishingId(null); }
  };

  const startPublishCountdown = (notionId, source) => {
    if (publishIntervalRef.current) clearInterval(publishIntervalRef.current);
    let count = 5;
    setPendingPublish({ id: notionId, countdown: count, source });
    publishIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(publishIntervalRef.current);
        publishIntervalRef.current = null;
        setPendingPublish(null);
        executePublish(notionId, source);
      } else {
        setPendingPublish(prev => prev ? { ...prev, countdown: count } : null);
      }
    }, 1000);
  };

  const cancelPublish = () => {
    if (publishIntervalRef.current) { clearInterval(publishIntervalRef.current); publishIntervalRef.current = null; }
    setPendingPublish(null);
  };

  const handlePublishFromModal = () => {
    if (!previewArticle) return;
    startPublishCountdown(previewArticle.id, 'modal');
  };

  const handleUnpublish = async () => {
    if (!previewArticle) return;
    setUnpublishingId(previewArticle.id);
    try {
      const res = await adminFetch('/api/admin-articles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish', notionId: previewArticle.id }),
      });
      if (!res.ok) throw new Error('Unpublish failed');
      setPreviewArticle(prev => ({ ...prev, blogSafe: false, status: 'Draft' }));
      setDrafts(prev => prev.map(a => a.id === previewArticle.id ? { ...a, blogSafe: false, status: 'Draft' } : a));
    } catch (err) { console.error(err); }
    finally { setUnpublishingId(null); }
  };

  const handlePublish = (notionId) => {
    startPublishCountdown(notionId, 'card');
  };

  const handleSwapPhoto = async (articleId, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setSwapStatus(prev => ({ ...prev, [articleId]: 'uploading' }));
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1];
          const uploadRes = await adminFetch('/api/upload-image', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'dispatch' }),
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
          const applyRes = await adminFetch('/api/upload-image', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'apply', notionId: articleId, url: uploadData.url }),
          });
          if (!applyRes.ok) throw new Error('Failed to apply to Notion');
          setDrafts(prev => prev.map(a => a.id === articleId ? { ...a, coverImage: uploadData.url } : a));
          setSwapStatus(prev => ({ ...prev, [articleId]: 'done' }));
          setTimeout(() => setSwapStatus(prev => ({ ...prev, [articleId]: 'idle' })), 3500);
        } catch (err) { console.error(err); setSwapStatus(prev => ({ ...prev, [articleId]: 'error' })); }
      };
      reader.readAsDataURL(file);
    } catch { setSwapStatus(prev => ({ ...prev, [articleId]: 'error' })); }
  };

  useEffect(() => {
    if (!authed) return;
    if (activeTab === 'review') fetchDrafts();
    if (activeTab === 'dashboard') { fetchDashboard(); fetchAdSlots(); }
    if (activeTab === 'promos') fetchPromos();
    if (activeTab === 'pois') fetchAdminPois();
    if (activeTab === 'ratings') fetchAdminRatings();
    if (activeTab === 'wines') fetchAdminWines();
  }, [activeTab, authed]);

  // Preview file locally before uploading — no network call yet
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setPhotoPreview(src);
      setPendingFile(file);
      const img = new Image();
      img.onload = () => setPhotoDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const clearPhotoPreview = () => { setPendingFile(null); setPhotoPreview(null); setPhotoDims(null); };

  const handlePhotoUpload = async (file) => {
    if (!file || !result?.notionId) return;
    if (!file.type.startsWith('image/')) { setUploadStatus('error'); return; }
    setUploadStatus('uploading');
    setUploadedUrl(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const uploadRes = await adminFetch('/api/upload-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, contentType: file.type, data: base64, folder: 'dispatch' }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
        const applyRes = await adminFetch('/api/upload-image', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'apply', notionId: result.notionId, url: uploadData.url }),
        });
        if (!applyRes.ok) throw new Error('Failed to apply to Notion');
        setUploadedUrl(uploadData.url);
        setUploadStatus('done');
        clearPhotoPreview();
      };
      reader.readAsDataURL(file);
    } catch (err) { console.error(err); setUploadStatus('error'); }
  };

  const handleApplyImage = async () => {
    if (!result?.notionId || !result?.coverImage) return;
    setApplyStatus('applying');
    try {
      const res = await adminFetch('/api/upload-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', notionId: result.notionId, filename: result.coverImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setApplyStatus('applied');
    } catch { setApplyStatus('error'); }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('loading'); setResult(null); setErrorMsg('');
    try {
      const res = await adminFetch('/api/generate-article', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), category, notes: notes.trim() }),
      });
      if (res.status === 401) { handleLogout(); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setResult(data); setStatus('success');
    } catch (err) { setErrorMsg(err.message); setStatus('error'); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${C.sand}`, background: '#fff',
    fontSize: 15, color: C.text, fontFamily: 'Libre Franklin, sans-serif',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: C.dusk, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' };

  // ── LOGIN SCREEN ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: C.night, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}>
          <img src="/images/yeti/yeti-front-profile.png" alt="" onError={e => { e.target.style.display = 'none'; }} style={{ width: 96, height: 96, objectFit: 'contain', marginBottom: 20 }} />
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.sage, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>The Manitou Dispatch</div>
          <h1 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 28, color: C.cream, margin: '0 0 32px' }}>The Yeti Desk</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '13px 18px', borderRadius: 8, boxSizing: 'border-box', marginBottom: 12,
                border: loginError ? '1.5px solid #ff6b6b' : '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.07)', color: C.cream,
                fontSize: 16, fontFamily: 'Libre Franklin, sans-serif', outline: 'none',
              }}
            />
            {loginError && <p style={{ color: '#ff9f9f', fontSize: 13, marginBottom: 12, textAlign: 'left' }}>{loginError}</p>}
            <button
              type="submit"
              disabled={loginLoading || !loginPassword.trim()}
              style={{
                width: '100%', padding: '13px', borderRadius: 8, border: 'none',
                background: loginLoading ? C.driftwood : C.lakeBlue,
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Libre Franklin, sans-serif',
              }}
            >{loginLoading ? 'Checking…' : 'Enter The Desk →'}</button>
          </form>
        </div>
      </div>
    );
  }

  // ── ADMIN UI ──────────────────────────────────────────────────
  return (
    <>
    {/* Preview / Edit Modal */}
    {previewArticle && (
      <div
        onClick={() => { cancelPublish(); setPreviewArticle(null); }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(10,18,24,0.82)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: C.cream, borderRadius: 16, width: '100%', maxWidth: 780, marginTop: 16, marginBottom: 40, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.45)' }}
        >
          {/* Modal header */}
          <div style={{ background: C.dusk, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 2, fontFamily: 'Libre Franklin, sans-serif' }}>{previewArticle.category}</div>
              <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 16, color: C.cream, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewArticle.title}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '3px 12px', borderRadius: 20, background: previewArticle.blogSafe ? C.sage : 'rgba(255,255,255,0.15)', color: '#fff' }}>
                {previewArticle.blogSafe ? 'Live' : 'Draft'}
              </span>
              <button onClick={() => { cancelPublish(); setPreviewArticle(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 20, lineHeight: 1, fontFamily: 'Libre Franklin, sans-serif' }}>×</button>
            </div>
          </div>

          {/* Modal tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.sand}`, background: '#fff' }}>
            {[{ id: 'preview', label: '👁  Preview' }, { id: 'edit', label: '✏️  Edit' }].map(t => (
              <button key={t.id} onClick={() => setPreviewTab(t.id)} style={{ padding: '12px 24px', fontFamily: 'Libre Franklin, sans-serif', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: previewTab === t.id ? C.cream : '#fff', color: previewTab === t.id ? C.dusk : C.textLight, borderBottom: previewTab === t.id ? `2px solid ${C.lakeBlue}` : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Modal body */}
          <div style={{ padding: '28px 32px', maxHeight: '55vh', overflowY: 'auto' }}>
            {previewLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: C.sage, fontSize: 14 }}>Loading…</div>
            ) : previewTab === 'preview' ? (
              <div>
                {previewArticle.coverImage && <img src={previewArticle.coverImage} alt="" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 20, display: 'block' }} />}
                {previewArticle.excerpt && <p style={{ fontSize: 16, fontStyle: 'italic', color: '#5a5a5a', borderLeft: `4px solid ${C.lakeBlue}`, paddingLeft: 16, marginBottom: 24, lineHeight: 1.6 }}>{previewArticle.excerpt}</p>}
                {previewArticle.content
                  ? <DispatchArticleContent content={previewArticle.content} />
                  : <p style={{ color: C.textMuted, fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>Fetching article content…</p>
                }
                {previewArticle.editorNote && (
                  <div style={{ marginTop: 28, padding: '16px 20px', background: C.warmWhite, borderRadius: 10, borderLeft: `3px solid ${C.sage}` }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.sage, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>Editor's Note</div>
                    <p style={{ margin: 0, fontSize: 14, color: C.textLight, lineHeight: 1.6, fontStyle: 'italic' }}>{previewArticle.editorNote}</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input style={inputStyle} value={editFields.title} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Excerpt</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={editFields.excerpt} onChange={e => setEditFields(f => ({ ...f, excerpt: e.target.value }))} placeholder="One-sentence teaser (max 160 chars)" />
                </div>
                <div>
                  <label style={labelStyle}>Editor's Note</label>
                  <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={editFields.editorNote} onChange={e => setEditFields(f => ({ ...f, editorNote: e.target.value }))} placeholder="Personal aside from The Yeti…" />
                </div>
                <button
                  onClick={handleSaveEdit}
                  disabled={saveStatus === 'saving' || !editFields.title?.trim()}
                  style={{ alignSelf: 'flex-start', padding: '11px 24px', background: saveStatus === 'saved' ? C.sage : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: (saveStatus === 'saving' || !editFields.title?.trim()) ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif', opacity: !editFields.title?.trim() ? 0.5 : 1 }}
                >
                  {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Save failed — retry' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Modal footer actions */}
          <div style={{ padding: '14px 32px', borderTop: `1px solid ${C.sand}`, background: '#fff', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {!previewArticle.blogSafe ? (
              <button
                onClick={handlePublishFromModal}
                disabled={publishingId === previewArticle.id}
                style={{ background: publishingId === previewArticle.id ? C.driftwood : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: publishingId === previewArticle.id ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
              >{publishingId === previewArticle.id ? 'Publishing…' : '⚡ Publish Live'}</button>
            ) : (
              <>
                <button
                  onClick={handleUnpublish}
                  disabled={unpublishingId === previewArticle.id}
                  style={{ background: 'transparent', color: C.sunset, border: `1px solid ${C.sunset}`, borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                >{unpublishingId === previewArticle.id ? 'Unpublishing…' : 'Unpublish'}</button>
                <a href={`/dispatch/${previewArticle.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.sage, fontWeight: 600, textDecoration: 'none' }}>View Live ↗</a>
              </>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <a href={`https://notion.so/${previewArticle.id?.replace(/-/g, '')}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.textMuted, textDecoration: 'none' }}>Notion ↗</a>
            </div>
          </div>
        </div>
      </div>
    )}

    <div style={{ minHeight: '100vh', background: C.cream, padding: '60px 20px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sage, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>The Manitou Dispatch</div>
            <h1 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 32, color: C.dusk, margin: 0 }}>The Yeti Desk</h1>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '6px 14px', fontSize: 12, color: C.textMuted, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>Sign out</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {[{ id: 'write', label: '✍️  Write' }, { id: 'review', label: '📋  Review Queue' }, { id: 'dashboard', label: '📊  Dashboard' }, { id: 'advertisers', label: '🤝  Advertisers' }, { id: 'promos', label: '🎟️  Promos' }, { id: 'pois', label: '📍  Community POIs' }, { id: 'ratings', label: '🍷  Winery Ratings' }, { id: 'wines', label: '🍾  Wines Registry' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                fontFamily: 'Libre Franklin, sans-serif', cursor: 'pointer',
                border: activeTab === tab.id ? 'none' : `1px solid ${C.sand}`,
                background: activeTab === tab.id ? C.dusk : '#fff',
                color: activeTab === tab.id ? '#fff' : C.textLight,
                transition: 'all 0.15s',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === 'dashboard' && (
          <div>
            {dashLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>Loading metrics…</div>
            ) : dashData ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: 'Subscribers', value: dashData.subCount.toLocaleString(), icon: '📬', color: C.lakeBlue },
                    { label: 'Published', value: dashData.published, icon: '✅', color: C.sage },
                    { label: 'In Draft', value: dashData.drafts, icon: '✏️', color: C.sunset },
                    { label: 'Last Published', value: dashData.lastPublished?.publishedDate || '—', icon: '🗓', color: C.dusk, small: true },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${stat.color}` }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: stat.small ? 15 : 26, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>{stat.value}</div>
                      <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                {dashData.lastPublished && (
                  <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.sage, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>Most Recent Article</div>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 16, color: C.dusk, fontWeight: 700, marginBottom: 4 }}>{dashData.lastPublished.title}</div>
                    <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>{dashData.lastPublished.publishedDate} · {dashData.lastPublished.category}</div>
                    <a href={`/dispatch/${dashData.lastPublished.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.lakeBlue, textDecoration: 'none', display: 'inline-block', marginTop: 8, fontFamily: 'Libre Franklin, sans-serif' }}>View live →</a>
                  </div>
                )}
                <div style={{ background: C.warmWhite, borderRadius: 12, padding: '20px 24px', border: `1px solid ${C.sand}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.dusk, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>Open & Click Rates</div>
                  <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, margin: '0 0 12px', fontFamily: 'Libre Franklin, sans-serif' }}>
                    Per-send analytics (open rates, click rates) are available in beehiiv's paid plans. Your current plan shows subscriber count and growth.
                  </p>
                  <a href="https://app.beehiiv.com" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.lakeBlue, fontWeight: 600, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif' }}>Open beehiiv Dashboard →</a>
                </div>
                <button onClick={fetchDashboard} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 18px', fontSize: 13, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻ Refresh</button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Could not load metrics.</div>
            )}

            {/* ── Batch Geocoding Tool ── */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, marginBottom: 4, fontFamily: 'Libre Franklin, sans-serif' }}>📍 Geocode Businesses</div>
              <p style={{ fontSize: 13, color: C.textLight, margin: '0 0 14px', lineHeight: 1.5, fontFamily: 'Libre Franklin, sans-serif' }}>
                Scans all Notion business entries with an address but no lat/lng, and auto-fills their coordinates. Safe to re-run — already-geocoded entries are skipped.
              </p>
              <button
                onClick={runBatchGeocode}
                disabled={geoStatus === 'running'}
                style={{ background: geoStatus === 'running' ? C.sand : C.dusk, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: geoStatus === 'running' ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif', transition: 'background 0.15s' }}
              >
                {geoStatus === 'running' ? '⏳ Geocoding… (1 req/sec)' : '▶ Run Geocoder'}
              </button>
              {geoResult && geoStatus === 'done' && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, color: C.sage, fontWeight: 700, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>
                    ✅ Done — {geoResult.updated} updated · {geoResult.skipped} skipped · {geoResult.failed} failed
                  </div>
                  {geoResult.details?.length > 0 && (
                    <div style={{ maxHeight: 200, overflowY: 'auto', background: C.cream, borderRadius: 8, padding: '10px 14px' }}>
                      {geoResult.details.map((d, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', padding: '3px 0', borderBottom: `1px solid ${C.sand}` }}>
                          <strong>{d.name}</strong> — {d.result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {geoStatus === 'error' && (
                <div style={{ marginTop: 10, fontSize: 13, color: '#c05a5a', fontFamily: 'Libre Franklin, sans-serif' }}>Error: {geoResult?.error}</div>
              )}
            </div>

            {/* ── USA250 Page Status ── */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20, borderLeft: `4px solid ${USA250_PUBLIC ? C.sage : C250.gold}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif' }}>🇺🇸 USA250 Page</div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: USA250_PUBLIC ? '#d1fae5' : '#fef3c7', color: USA250_PUBLIC ? '#065f46' : '#92400e', fontFamily: 'Libre Franklin, sans-serif' }}>
                  {USA250_PUBLIC ? 'LIVE' : 'DRAFT — not public'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: C.textLight, margin: '0 0 14px', lineHeight: 1.6, fontFamily: 'Libre Franklin, sans-serif' }}>
                {USA250_PUBLIC
                  ? 'Page is live and linked in Community nav.'
                  : 'Page is hidden. Share the preview link with organizers before publishing. To go live: set USA250_PUBLIC = true in App.jsx and deploy.'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { navigator.clipboard.writeText('https://manitoubeach.com/usa250?preview=true'); }}
                  style={{ background: C.dusk, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                >
                  📋 Copy Preview URL
                </button>
                <a href="/usa250?preview=true" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: C.dusk, border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif' }}>
                  Open Preview ↗
                </a>
              </div>
            </div>

            {/* ── Ad Slot Monitor ── */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif' }}>
                  Ad Slot Monitor
                </div>
                <button onClick={fetchAdSlots} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '5px 12px', fontSize: 12, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻</button>
              </div>
              <p style={{ fontSize: 12, color: C.textLight, margin: '0 0 16px', lineHeight: 1.5, fontFamily: 'Libre Franklin, sans-serif' }}>
                Max 3 paid spots per category (Enhanced + Featured + Premium combined). Red = full, waitlist only.
              </p>
              {adSlotsLoading ? (
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Loading…</div>
              ) : adSlots && Object.keys(adSlots.categoryCounts || {}).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(adSlots.categoryCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => {
                      const max = adSlots.maxSlots || 3;
                      const pct = count / max;
                      const barColor = pct >= 1 ? '#c05a5a' : pct >= 0.67 ? C.driftwood : C.sage;
                      const label = pct >= 1 ? 'FULL' : `${count}/${max}`;
                      return (
                        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 130, fontSize: 12, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif', fontWeight: 500, flexShrink: 0 }}>{cat}</div>
                          <div style={{ flex: 1, background: C.sand, borderRadius: 999, height: 8, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, pct * 100)}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
                          </div>
                          <div style={{ width: 48, fontSize: 11, color: pct >= 1 ? '#c05a5a' : C.textMuted, fontFamily: 'Libre Franklin, sans-serif', textAlign: 'right', fontWeight: pct >= 1 ? 700 : 400 }}>
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.sand}`, display: 'flex', gap: 20 }}>
                    <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                      Total paid slots used: <strong style={{ color: C.dusk }}>{Object.values(adSlots.categoryCounts).reduce((a, b) => a + b, 0)}</strong>
                    </span>
                    <span style={{ fontSize: 11, color: '#c05a5a', fontFamily: 'Libre Franklin, sans-serif' }}>
                      {Object.values(adSlots.categoryCounts).filter(c => c >= (adSlots.maxSlots || 3)).length} categories full
                    </span>
                  </div>
                </div>
              ) : !adSlotsLoading ? (
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  No paid listings yet — all categories open.
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ── REVIEW QUEUE TAB ── */}
        {activeTab === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ margin: 0, color: C.textLight, fontSize: 14, fontFamily: 'Libre Franklin, sans-serif' }}>Click any article to preview, edit, and publish.</p>
              <button onClick={fetchDrafts} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '7px 16px', fontSize: 13, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻ Refresh</button>
            </div>
            {draftsLoading && <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>Loading articles…</div>}
            {!draftsLoading && drafts.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14 }}>No articles found.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {drafts.map(article => {
                const isPublished = article.blogSafe;
                const isPublishing = publishingId === article.id;
                return (
                  <div
                    key={article.id}
                    onClick={() => openPreview(article)}
                    style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderLeft: `4px solid ${isPublished ? C.sage : C.sand}`, cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 10px', borderRadius: 20, background: isPublished ? C.sage : C.driftwood, color: '#fff' }}>
                            {isPublished ? 'Live' : 'Draft'}
                          </span>
                          {article.aiGenerated && <span style={{ fontSize: 11, color: C.textMuted, background: C.cream, padding: '2px 8px', borderRadius: 20, fontFamily: 'Libre Franklin, sans-serif' }}>AI</span>}
                          <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>{article.category}</span>
                          {article.publishedDate && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>{article.publishedDate}</span>}
                        </div>
                        <h3 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 16, color: C.dusk, margin: '0 0 4px', lineHeight: 1.3 }}>{article.title}</h3>
                        {article.excerpt && <p style={{ margin: 0, fontSize: 12, color: C.textLight, lineHeight: 1.5, fontFamily: 'Libre Franklin, sans-serif' }}>{article.excerpt.length > 100 ? article.excerpt.slice(0, 100) + '…' : article.excerpt}</p>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, alignItems: 'flex-end' }}>
                        {article.coverImage && <img src={article.coverImage} alt="" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                        {!isPublished ? (
                          <button
                            onClick={e => { e.stopPropagation(); handlePublish(article.id); }}
                            disabled={isPublishing}
                            style={{ background: isPublishing ? C.driftwood : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: isPublishing ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                          >{isPublishing ? '…' : '⚡ Publish'}</button>
                        ) : (
                          <span style={{ fontSize: 11, color: C.sage, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif' }}>✓ Live</span>
                        )}
                      </div>
                    </div>
                    {/* Photo strip */}
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.sand}` }} onClick={e => e.stopPropagation()}>
                      <input id={`swap-input-${article.id}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleSwapPhoto(article.id, e.target.files[0])} />
                      {swapStatus[article.id] === 'done' && article.coverImage ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={article.coverImage} alt="cover" style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 5, flexShrink: 0, border: `2px solid ${C.sage}40` }} />
                          <div>
                            <div style={{ fontSize: 12, color: C.sage, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif' }}>✓ Photo updated</div>
                            <button onClick={e => { e.stopPropagation(); document.getElementById(`swap-input-${article.id}`).click(); }} style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 11, color: C.textMuted, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', textDecoration: 'underline' }}>swap again</button>
                          </div>
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>tap card to preview & edit</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {swapStatus[article.id] === 'uploading' ? (
                            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Uploading…</span>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); document.getElementById(`swap-input-${article.id}`).click(); }} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '4px 12px', fontSize: 11, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>
                              {article.coverImage ? '📷 Swap Photo' : '📷 Add Photo'}
                            </button>
                          )}
                          {swapStatus[article.id] === 'error' && <span style={{ fontSize: 12, color: C.sunset, fontFamily: 'Libre Franklin, sans-serif' }}>Upload failed</span>}
                          <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>tap to preview & edit</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ADVERTISERS TAB ── */}
        {activeTab === 'advertisers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Card Sponsors */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.dusk, marginBottom: 4 }}>Card Sponsors</div>
              <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 20 }}>Showing on every Dispatch card — homepage + /dispatch listing</div>

              {DISPATCH_CARD_SPONSORS.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 20px', background: C.warmWhite, borderRadius: 10 }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                  <div style={{ fontFamily: 'Libre Franklin, sans-serif', fontSize: 14, color: C.textMuted }}>No card sponsors active. Add one to DISPATCH_CARD_SPONSORS in App.jsx</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {DISPATCH_CARD_SPONSORS.map((sponsor, i) => (
                    <div key={i} style={{ border: `1px solid ${C.sand}`, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        {sponsor.logo ? (
                          <img src={sponsor.logo} alt={sponsor.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'contain', border: `1px solid ${C.sand}`, background: '#fff', padding: 4, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 52, height: 52, borderRadius: 8, border: '1.5px dashed #c4b09a', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf5ef', flexShrink: 0 }}>
                            <span style={{ fontSize: 22 }}>📷</span>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Libre Franklin, sans-serif', fontWeight: 700, fontSize: 15, color: C.dusk, marginBottom: 3 }}>{sponsor.name}</div>
                          {sponsor.offerText && <div style={{ fontSize: 13, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 4 }}>{sponsor.offerText}</div>}
                          <div style={{ fontSize: 11, color: sponsor.logo ? C.sage : C.sunset, fontFamily: 'monospace', fontWeight: 600 }}>
                            {sponsor.logo ? `logo: ${sponsor.logo}` : 'logo: null — drop a PNG into /public/images/ and set the path'}
                          </div>
                        </div>
                        <span style={{ background: `${C.sage}20`, color: C.sage, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', fontFamily: 'Libre Franklin, sans-serif', letterSpacing: 0.5, flexShrink: 0 }}>Slot {i + 1}</span>
                      </div>
                      <div style={{ borderTop: `1px solid ${C.sand}`, background: C.warmWhite }}>
                        <div style={{ padding: '8px 16px 2px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Live preview</div>
                        <SponsorStrip index={i} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 20, padding: '14px 16px', background: `${C.lakeBlue}08`, borderRadius: 8, border: `1px dashed ${C.lakeBlue}40` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>To add or update sponsors</div>
                <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'monospace', lineHeight: 1.8 }}>
                  Search App.jsx for <strong style={{ color: C.dusk }}>DISPATCH_CARD_SPONSORS</strong><br />
                  Add: {'{ name: "Business Name", logo: "/images/file.png", offerText: "Your offer" }'}<br />
                  Set logo: null to show a 📷 placeholder until the file lands
                </div>
              </div>
            </div>

            {/* Newsletter Ad SOP */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.dusk, marginBottom: 4 }}>Newsletter Ad Rules</div>
              <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 20 }}>SOP — follow every issue, no exceptions</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
                {[
                  { icon: '2️⃣', label: 'Max ads per issue', value: '2 total — never more' },
                  { icon: '⭐', label: 'Primary sponsor slot', value: 'Mid-newsletter, after main article' },
                  { icon: '🏠', label: 'House ad slot', value: 'Footer — promote /featured or events' },
                  { icon: '📅', label: 'Best send time', value: 'Tue or Thu · 8–9am EST' },
                  { icon: '📝', label: 'Contract minimum', value: '30 days (1 issue cycle)' },
                  { icon: '💎', label: 'Sweet spot contract', value: '3 months — better results' },
                  { icon: '🔄', label: 'Renewal window', value: 'Contact 1 week before expiry' },
                  { icon: '🎯', label: 'Conflict resolution', value: '2 advertisers want offer slot → one gets next issue' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '14px 16px', background: C.warmWhite, borderRadius: 8 }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 3, fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif', fontWeight: 600, lineHeight: 1.4 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter Layout Template */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 19, color: C.dusk, marginBottom: 4 }}>Newsletter Layout Template</div>
              <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 20 }}>Replicate this structure in beehiiv every issue</div>
              <div style={{ border: `1px solid ${C.sand}`, borderRadius: 10, overflow: 'hidden' }}>
                {[
                  { section: '🌊 THIS WEEKEND ON THE LAKE', desc: '2–3 bullet events Fri–Sun. Pull from your Notion events DB or notes.', accent: C.lakeBlue },
                  { section: '📰 FROM THE DESK', desc: 'The Yeti\'s main piece — 250–350 words. AI-generated + edited by you. One story, told well.', accent: C.sage },
                  { section: '🏘️ COMMUNITY CORNER', desc: '1–2 items: local biz spotlight, historical fact, neighbor news. You write 2–3 sentences.', accent: C.sunset },
                  { section: '━━ SPONSORED BY [Business] ━━', desc: 'Logo + offer text + claim link. ONE sponsor max. Clear, honest, not pushy.', accent: '#b8860b', isAd: true },
                  { section: '📅 UPCOMING EVENTS', desc: '3–5 events. Date · Time · Location. Pull from events DB. No editorializing needed.', accent: C.lakeBlue },
                  { section: '📸 AROUND THE LAKE', desc: '1 reader-submitted photo + caption. Or: "Send us your best lake shot →"', accent: C.sage },
                  { section: '💼 SUPPORT THE DISPATCH', desc: 'Soft pitch: "[X] subscribers and growing" + link to /featured for business listings.', accent: C.dusk, isAd: true },
                ].map((row, i, arr) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'stretch', borderBottom: i < arr.length - 1 ? `1px solid ${C.sand}` : 'none', background: row.isAd ? '#fffbf0' : '#fff' }}>
                    <div style={{ width: 4, background: row.accent, flexShrink: 0 }} />
                    <div style={{ padding: '13px 18px', flex: 1 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: row.isAd ? '#b8860b' : C.dusk, marginBottom: 3 }}>{row.section}</div>
                      <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', lineHeight: 1.5 }}>{row.desc}</div>
                    </div>
                    {row.isAd && <div style={{ padding: '13px 14px 13px 0', display: 'flex', alignItems: 'center' }}><span style={{ fontSize: 10, fontWeight: 700, color: '#b8860b', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif', border: '1px solid #b8860b40', borderRadius: 4, padding: '2px 6px' }}>AD</span></div>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── PROMOS TAB ── */}
        {activeTab === 'promos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 4 }}>Promotions</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Manage ad slots and generate newsletter promo blocks</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={fetchPromos} style={{ background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 16px', fontSize: 13, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻ Refresh</button>
                <a href="https://www.notion.so/3158c729eb59810f8a48d27b6c6a8d31" target="_blank" rel="noreferrer" style={{ background: C.dusk, color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif' }}>+ Add in Notion</a>
              </div>
            </div>

            {promosLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.sage, fontFamily: 'Libre Franklin, sans-serif' }}>Loading promos…</div>
            ) : promos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎟️</div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 18, color: C.dusk, marginBottom: 8 }}>No promotions yet</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Add your first promotion in Notion — it'll appear here with copy-ready newsletter blocks.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {promos.map(promo => {
                  const claimUrl = promo.claimSlug ? `https://manitoubeach.com/claim/${promo.claimSlug}` : null;
                  const expiryStr = promo.expiry ? new Date(promo.expiry + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

                  // Newsletter block text — copy-paste ready for beehiiv
                  const newsletterBlock = [
                    `🎟️ READER EXCLUSIVE — ${promo.name}`,
                    promo.offerText || '',
                    promo.couponCode ? `Use code: ${promo.couponCode}` : '',
                    claimUrl ? `Claim here → ${claimUrl}` : promo.linkUrl ? `Learn more → ${promo.linkUrl}` : '',
                    expiryStr ? `Offer expires ${expiryStr}` : '',
                  ].filter(s => s && s.trim()).join('\n');

                  return (
                    <div key={promo.id} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', borderLeft: `4px solid ${promo.active ? C.sage : C.sand}` }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 17, color: C.dusk, marginBottom: 6 }}>{promo.name}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ background: promo.active ? `${C.sage}20` : `${C.sand}40`, color: promo.active ? C.sage : '#999', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', fontFamily: 'Libre Franklin, sans-serif' }}>
                              {promo.active ? '● Active' : '○ Inactive'}
                            </span>
                            <span style={{ background: `${C.lakeBlue}15`, color: C.lakeBlue, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif' }}>{promo.slot}</span>
                            <span style={{ background: `${C.dusk}10`, color: C.dusk, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontFamily: 'Libre Franklin, sans-serif' }}>{promo.tier}</span>
                          </div>
                        </div>
                        <a href={promo.notionUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.textMuted, textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '4px 10px' }}>Edit in Notion →</a>
                      </div>

                      {/* Offer details */}
                      {promo.offerText && (
                        <div style={{ fontSize: 14, color: C.text, marginBottom: 8, fontFamily: 'Libre Franklin, sans-serif' }}>{promo.offerText}</div>
                      )}
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                        {promo.couponCode && <span>Code: <strong style={{ color: C.sunset }}>{promo.couponCode}</strong></span>}
                        {expiryStr && <span>Expires: {expiryStr}</span>}
                      </div>

                      {/* Claim URL */}
                      {claimUrl && (
                        <div style={{ background: C.warmWhite, borderRadius: 8, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', flexShrink: 0 }}>Claim URL</span>
                          <span style={{ fontSize: 13, color: C.lakeBlue, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>{claimUrl}</span>
                          <button
                            onClick={() => copyToClipboard(claimUrl, `url-${promo.id}`)}
                            style={{ background: copiedId === `url-${promo.id}` ? C.sage : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', flexShrink: 0 }}
                          >
                            {copiedId === `url-${promo.id}` ? '✓ Copied' : 'Copy URL'}
                          </button>
                        </div>
                      )}

                      {/* Newsletter block */}
                      <div style={{ background: `${C.night}08`, borderRadius: 8, padding: '12px 14px', border: `1px dashed ${C.sand}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Newsletter block — paste into beehiiv</span>
                          <button
                            onClick={() => copyToClipboard(newsletterBlock, `nl-${promo.id}`)}
                            style={{ background: copiedId === `nl-${promo.id}` ? C.sage : C.sunset, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                          >
                            {copiedId === `nl-${promo.id}` ? '✓ Copied!' : 'Copy Block'}
                          </button>
                        </div>
                        <pre style={{ margin: 0, fontSize: 12, color: C.text, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{newsletterBlock}</pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── COMMUNITY POIs TAB ── */}
        {activeTab === 'pois' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 4 }}>Community POIs</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  Notion-managed visitor info pins on /discover — hospitals, schools, launches, wineries, etc.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://www.notion.so/31c8c729eb5981baac48f12f50366ef1" target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', textDecoration: 'none', padding: '8px 16px', border: `1px solid ${C.lakeBlue}`, borderRadius: 8 }}>
                  Open in Notion →
                </a>
                <button onClick={fetchAdminPois} style={{ fontSize: 13, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>↻ Refresh</button>
              </div>
            </div>

            {adminPoisLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14, fontFamily: 'Libre Franklin, sans-serif' }}>Loading POIs…</div>
            ) : adminPois === null ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Click Refresh to load POIs.</div>
            ) : (
              <>
                {/* Summary by category */}
                {(() => {
                  const catCounts = {};
                  adminPois.forEach(p => { catCounts[p.cat] = (catCounts[p.cat] || 0) + 1; });
                  const cats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
                      <div style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `3px solid ${C.sage}`, gridColumn: '1' }}>
                        <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 26, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>{adminPois.length}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>Total Active</div>
                      </div>
                      {cats.map(([cat, count]) => {
                        const catObj = [
                          { id: 'food', label: 'Food', color: '#5B8A5B' }, { id: 'events', label: 'Events', color: '#D4845A' },
                          { id: 'stays', label: 'Stays', color: '#C25C5C' }, { id: 'wineries', label: 'Wineries', color: '#8B5E8B' },
                          { id: 'water', label: 'Water', color: '#5B7E95' }, { id: 'shopping', label: 'Shopping', color: '#B8A030' },
                          { id: 'services', label: 'Services', color: '#7A8E72' }, { id: 'healthcare', label: 'Healthcare', color: '#C2607A' },
                          { id: 'grocery', label: 'Grocery', color: '#8B6E4A' }, { id: 'schools', label: 'Schools', color: '#6B6B6B' },
                          { id: 'community', label: 'Community', color: '#7A8E72' },
                        ].find(c => c.id === cat) || { label: cat, color: C.textMuted };
                        return (
                          <div key={cat} style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `3px solid ${catObj.color}` }}>
                            <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, fontWeight: 700, color: C.dusk, marginBottom: 4 }}>{count}</div>
                            <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>{catObj.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* POI list */}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ borderBottom: `1px solid ${C.sand}`, padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 90px 120px', gap: 12, background: C.warmWhite }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif' }}>Name</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif' }}>Category</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Libre Franklin, sans-serif' }}>Coords</div>
                  </div>
                  {adminPois.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', fontSize: 14 }}>
                      No Active POIs found. Check the Notion DB — set Status to Active to show pins.
                    </div>
                  ) : (
                    adminPois.map((poi, i) => (
                      <div key={poi.id} style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '1fr 90px 120px', gap: 12, alignItems: 'center', borderBottom: i < adminPois.length - 1 ? `1px solid ${C.sand}` : 'none', background: i % 2 === 0 ? '#fff' : '#fdfaf6' }}>
                        <div>
                          <div style={{ fontFamily: 'Libre Franklin, sans-serif', fontSize: 14, fontWeight: 600, color: C.dusk }}>{poi.name}</div>
                          {poi.sub && <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginTop: 1 }}>{poi.sub}</div>}
                        </div>
                        <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif' }}>{poi.cat}</div>
                        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: 'monospace' }}>{poi.lat?.toFixed(4)}, {poi.lng?.toFixed(4)}</div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: 16, padding: '12px 16px', background: `${C.lakeBlue}08`, borderRadius: 8, border: `1px dashed ${C.lakeBlue}40` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>How to add / edit POIs</div>
                  <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', lineHeight: 1.7 }}>
                    Open Notion → <strong>Manitou Beach - Community POIs</strong> DB → add or edit rows.<br />
                    Set <strong>Status → Active</strong> to show on map · <strong>Hidden</strong> to remove without deleting.<br />
                    Changes appear live on /discover within seconds (no-store cache).
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── RATINGS TAB ── */}
        {activeTab === 'ratings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 4 }}>Winery Ratings</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  Curate submitted reviews — approve to publish, flag to hide.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="https://www.notion.so/31c8c729eb598182-9d07e5901bc07f6e" target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, fontWeight: 600, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', textDecoration: 'none', padding: '7px 14px', border: `1px solid ${C.lakeBlue}`, borderRadius: 8 }}>
                  Open in Notion →
                </a>
                <button onClick={fetchAdminRatings} style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}>↻ Refresh</button>
              </div>
            </div>

            {/* Filter chips */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['Pending', 'Published', 'Flagged', 'all'].map(f => (
                <button key={f} onClick={() => setRatingsFilter(f)} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Libre Franklin, sans-serif',
                  background: ratingsFilter === f ? C.dusk : '#fff',
                  color: ratingsFilter === f ? '#fff' : C.textLight,
                  border: ratingsFilter === f ? 'none' : `1px solid ${C.sand}`,
                }}>
                  {f === 'all' ? 'All' : f}
                  {adminRatings && f !== 'all' && (
                    <span style={{ marginLeft: 6, opacity: 0.7 }}>({adminRatings.filter(r => r.status === f).length})</span>
                  )}
                </button>
              ))}
            </div>

            {adminRatingsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: C.textMuted, fontSize: 14, fontFamily: 'Libre Franklin, sans-serif' }}>Loading ratings…</div>
            ) : adminRatings === null ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Click Refresh to load ratings.</div>
            ) : (() => {
              const filtered = ratingsFilter === 'all' ? adminRatings : adminRatings.filter(r => r.status === ratingsFilter);
              if (filtered.length === 0) return (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', fontSize: 14 }}>
                  No {ratingsFilter === 'all' ? '' : ratingsFilter.toLowerCase()} ratings yet.
                </div>
              );
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {filtered.map(r => {
                    const stars = n => n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '—';
                    const statusColor = r.status === 'Published' ? C.sage : r.status === 'Flagged' ? '#c0392b' : C.driftwood;
                    const updating = ratingsUpdating[r.id];
                    return (
                      <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${statusColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, fontWeight: 700, color: C.dusk }}>{r.venue}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginTop: 2 }}>{r.date}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'Libre Franklin, sans-serif' }}>{r.status}</span>
                          </div>
                        </div>

                        {/* Scores */}
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                          {[['Quality', r.rating], ['Service', r.service], ['Atmos.', r.atmosphere], ['Value', r.value]].map(([label, val]) => val && (
                            <div key={label} style={{ fontSize: 12, fontFamily: 'Libre Franklin, sans-serif' }}>
                              <span style={{ color: C.textMuted, fontWeight: 600 }}>{label}: </span>
                              <span style={{ color: C.sunset }}>{stars(val)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Wine tried */}
                        <div style={{ fontSize: 13, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', marginBottom: r.quote || r.note ? 8 : 0 }}>
                          <strong>Tried:</strong> {r.wineTried}
                        </div>

                        {/* Quote (shareable) */}
                        {r.quote && (
                          <div style={{ fontSize: 13, fontStyle: 'italic', color: C.text, fontFamily: "'Libre Baskerville', serif", borderLeft: `3px solid ${C.sunset}`, paddingLeft: 12, marginBottom: 8 }}>
                            "{r.quote}"
                          </div>
                        )}

                        {/* Private note */}
                        {r.note && (
                          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600 }}>Private note:</span> {r.note}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                          {r.status !== 'Published' && (
                            <button
                              onClick={() => updateRatingStatus(r.id, 'Published')}
                              disabled={!!updating}
                              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: 'Libre Franklin, sans-serif', cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1, background: C.sage, color: '#fff', border: 'none' }}
                            >{updating === 'Published' ? 'Publishing…' : '✓ Publish'}</button>
                          )}
                          {r.status !== 'Pending' && (
                            <button
                              onClick={() => updateRatingStatus(r.id, 'Pending')}
                              disabled={!!updating}
                              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif', cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1, background: 'transparent', color: C.textLight, border: `1px solid ${C.sand}` }}
                            >← Requeue</button>
                          )}
                          {r.status !== 'Flagged' && (
                            <button
                              onClick={() => updateRatingStatus(r.id, 'Flagged')}
                              disabled={!!updating}
                              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif', cursor: updating ? 'default' : 'pointer', opacity: updating ? 0.6 : 1, background: 'transparent', color: '#c0392b', border: '1px solid #e8c0bb' }}
                            >⚑ Flag</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── WINES REGISTRY TAB ── */}
        {activeTab === 'wines' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 20, color: C.dusk, marginBottom: 4 }}>Wines Registry</div>
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  Add wines and toggle visibility. Active wines appear in autocomplete on /rate and count toward the scoreboard.
                </div>
              </div>
              <button onClick={fetchAdminWines} style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif', background: 'transparent', border: `1px solid ${C.sand}`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer' }}>↻ Refresh</button>
            </div>

            {/* Add wine form */}
            <div style={{ background: C.warmWhite, borderRadius: 12, padding: '20px 24px', border: `1px solid ${C.sand}`, marginBottom: 28 }}>
              <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: C.dusk, marginBottom: 16 }}>Add a Wine</div>
              <form onSubmit={addWine} noValidate>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>Wine Name *</div>
                    <input
                      type="text" value={wineForm.name} onChange={e => setWineForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. 2023 Cab Franc"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.sand}`, fontFamily: 'Libre Franklin, sans-serif', fontSize: 13, color: C.text, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>Venue *</div>
                    <select value={wineForm.venue} onChange={e => setWineForm(f => ({ ...f, venue: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.sand}`, fontFamily: 'Libre Franklin, sans-serif', fontSize: 13, color: C.text, boxSizing: 'border-box', background: '#fff' }}>
                      <option value="">— Select —</option>
                      {['Cherry Creek Cellars','Chateau Aeronautique','Gypsy Blue Vineyards','Meckleys Flavor Fruit Farm','Faust House Scrap n Craft','Ang & Co','Boathouse Art Gallery','Devils Lake View Living'].map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>Category *</div>
                    <select value={wineForm.category} onChange={e => setWineForm(f => ({ ...f, category: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.sand}`, fontFamily: 'Libre Franklin, sans-serif', fontSize: 13, color: C.text, boxSizing: 'border-box', background: '#fff' }}>
                      <option value="">— Select —</option>
                      {['Red','White','Sweet','Rosé','Fruit & Specialty'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>Display Name <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></div>
                    <input
                      type="text" value={wineForm.fullName} onChange={e => setWineForm(f => ({ ...f, fullName: e.target.value }))}
                      placeholder={wineForm.venue && wineForm.name ? `${wineForm.venue} · ${wineForm.name}` : 'auto-generated'}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${C.sand}`, fontFamily: 'Libre Franklin, sans-serif', fontSize: 13, color: C.text, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                {wineFormError && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: 10, fontFamily: 'Libre Franklin, sans-serif' }}>{wineFormError}</div>}
                <button type="submit" disabled={wineFormSaving} style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'Libre Franklin, sans-serif', background: C.sage, color: '#fff', border: 'none', cursor: wineFormSaving ? 'default' : 'pointer', opacity: wineFormSaving ? 0.7 : 1 }}>
                  {wineFormSaving ? 'Saving…' : '+ Add Wine'}
                </button>
              </form>
            </div>

            {/* Wine list */}
            {adminWinesLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', fontSize: 14 }}>Loading…</div>
            ) : adminWines === null ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Click Refresh to load wines.</div>
            ) : adminWines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', fontSize: 14 }}>No wines yet — add the first one above.</div>
            ) : (
              <div>
                {/* Group by venue */}
                {[...new Set(adminWines.map(w => w.venue))].sort().map(venue => (
                  <div key={venue} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.sand}` }}>{venue}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {adminWines.filter(w => w.venue === venue).map(wine => (
                        <div key={wine.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 8, padding: '10px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', opacity: wine.active ? 1 : 0.5 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 14, color: C.dusk }}>{wine.name}</span>
                            <span style={{ marginLeft: 10, fontSize: 11, fontFamily: 'Libre Franklin, sans-serif', fontWeight: 700, padding: '2px 8px', borderRadius: 12,
                              background: wine.category === 'Red' ? '#f9e0e0' : wine.category === 'White' ? '#fdf6dc' : wine.category === 'Sweet' ? '#fce8f4' : wine.category === 'Rosé' ? '#fce8e8' : '#e8f5e9',
                              color: wine.category === 'Red' ? '#922' : wine.category === 'White' ? '#876' : wine.category === 'Sweet' ? '#925' : wine.category === 'Rosé' ? '#944' : '#2a6',
                            }}>{wine.category}</span>
                          </div>
                          <button
                            onClick={() => toggleWineActive(wine)}
                            disabled={!!wineToggles[wine.id]}
                            style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Libre Franklin, sans-serif', padding: '5px 14px', borderRadius: 20, border: 'none', cursor: wineToggles[wine.id] ? 'default' : 'pointer',
                              background: wine.active ? C.sage : C.sand, color: wine.active ? '#fff' : C.textLight, opacity: wineToggles[wine.id] ? 0.6 : 1,
                            }}
                          >
                            {wineToggles[wine.id] ? '…' : wine.active ? 'Active' : 'Hidden'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 16, fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  {adminWines.filter(w => w.active).length} active · {adminWines.filter(w => !w.active).length} hidden · {adminWines.length} total
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── WRITE TAB ── */}
        {activeTab === 'write' && <>
        {/* Form */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', marginBottom: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Topic *</label>
            <input
              style={inputStyle}
              placeholder="e.g. Why Devils Lake is Michigan's best-kept secret"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Category</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {DISPATCH_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Notes / Angle (optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
              placeholder="Any specific angle, local details, or tone notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={status === 'loading' || !topic.trim()}
            style={{
              background: status === 'loading' ? C.driftwood : C.lakeBlue,
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '12px 28px', fontSize: 15, fontWeight: 600,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              fontFamily: 'Libre Franklin, sans-serif',
              transition: 'background 0.2s',
              width: '100%',
            }}
          >
            {status === 'loading' ? '✍️  Yeti is writing...' : '⚡ Generate Article'}
          </button>
          {status === 'loading' && (
            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
              The Yeti is writing… usually about 20 seconds ☕
            </p>
          )}
        </div>

        {/* Success */}
        {status === 'success' && result && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderLeft: `4px solid ${C.sage}` }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.sage, marginBottom: 12 }}>Draft saved to Notion</div>
            <h2 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, color: C.dusk, margin: '0 0 8px' }}>{result.title}</h2>
            <p style={{ color: C.textLight, fontSize: 14, margin: '0 0 20px', fontStyle: 'italic' }}>{result.excerpt}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={result.notionUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: C.dusk, color: '#fff', borderRadius: 8,
                  padding: '10px 20px', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', fontFamily: 'Libre Franklin, sans-serif',
                }}
              >
                Review in Notion →
              </a>
              <button
                onClick={() => setActiveTab('review')}
                style={{ background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
              >
                Go to Review Queue →
              </button>
              <button
                onClick={() => { setStatus('idle'); setTopic(''); setNotes(''); setResult(null); setApplyStatus('idle'); setUploadStatus('idle'); setUploadedUrl(null); }}
                style={{
                  background: 'transparent', color: C.textLight,
                  border: `1px solid ${C.sand}`, borderRadius: 8,
                  padding: '10px 20px', fontSize: 14, cursor: 'pointer',
                  fontFamily: 'Libre Franklin, sans-serif',
                }}
              >
                Write another
              </button>
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: C.textMuted }}>
              slug: <code style={{ background: C.cream, padding: '2px 6px', borderRadius: 4 }}>{result.slug}</code>
            </div>

            {/* Unsplash auto-photo */}
            {result.unsplashPhoto && (
              <div style={{ marginTop: 14, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.sand}`, position: 'relative' }}>
                <img
                  src={result.unsplashPhoto.thumbUrl}
                  alt="Auto-selected cover"
                  style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.55))', padding: '20px 12px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>
                    <a href={result.unsplashPhoto.photographerUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>
                      {result.unsplashPhoto.credit}
                    </a>
                  </span>
                  <span style={{ fontSize: 11, color: '#fff', fontWeight: 600, background: C.sage, padding: '2px 8px', borderRadius: 4 }}>✓ Applied to Notion</span>
                </div>
              </div>
            )}

            {result.coverImage && (
              <div style={{ marginTop: 12, padding: '14px 16px', background: C.warmWhite, borderRadius: 8, fontSize: 13, borderLeft: `3px solid ${result.coverImageApplied || applyStatus === 'applied' ? C.sage : C.lakeBlue}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: C.dusk }}>Cover image:</span>
                  <code style={{ color: C.lakeBlue, background: '#fff', padding: '2px 8px', borderRadius: 4 }}>{result.coverImage}</code>
                  {result.coverStyle && (
                    <span style={{ background: result.coverStyle === 'realism' ? C.dusk : C.sage, color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {result.coverStyle}
                    </span>
                  )}
                  {(result.coverImageApplied || applyStatus === 'applied') && (
                    <span style={{ color: C.sage, fontWeight: 600, fontSize: 12 }}>✓ Applied to Notion</span>
                  )}
                </div>
                {result.coverNote && <p style={{ margin: '0 0 10px', color: C.textLight, fontStyle: 'italic', lineHeight: 1.5 }}>{result.coverNote}</p>}
                {!result.coverImageApplied && applyStatus !== 'applied' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ color: C.textMuted }}>Image not in folder yet — create it, drop it in <code>public/images/yeti/</code> and push, then:</span>
                    <button
                      onClick={handleApplyImage}
                      disabled={applyStatus === 'applying'}
                      style={{ background: applyStatus === 'applying' ? C.driftwood : C.lakeBlue, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 12, fontWeight: 600, cursor: applyStatus === 'applying' ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                    >
                      {applyStatus === 'applying' ? 'Applying…' : applyStatus === 'error' ? 'Try again' : 'Apply Image'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Own photo upload — preview-first flow */}
            {result.notionId && uploadStatus !== 'done' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8, textAlign: 'center' }}>— or use your own photo —</div>

                {photoPreview ? (
                  /* ── Step 2: Preview + confirm ── */
                  <div>
                    {/* 16:9 crop preview */}
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000', marginBottom: 10 }}>
                      <img src={photoPreview} alt="preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, fontFamily: "'Libre Franklin', sans-serif" }}>
                        Cover preview
                      </div>
                    </div>

                    {/* Dimensions + warning */}
                    {photoDims && (() => {
                      const { w, h } = photoDims;
                      const isPortrait = h > w;
                      const isTooSmall = w < 800;
                      const isIdeal = w >= 1200 && (w / h) >= 1.55;
                      return (
                        <div style={{ marginBottom: 10, fontSize: 12, fontFamily: "'Libre Franklin', sans-serif" }}>
                          <span style={{ color: C.textMuted }}>{w} × {h}px</span>
                          {isIdeal && <span style={{ color: C.sage, marginLeft: 8 }}>✓ Great size</span>}
                          {isPortrait && <span style={{ color: C.sunset, marginLeft: 8 }}>⚠️ Portrait — will be cropped to landscape. Rotate in Photos first for best results.</span>}
                          {!isPortrait && isTooSmall && <span style={{ color: C.driftwood, marginLeft: 8 }}>⚠️ Small — may look blurry at full width. Try 1200×630px or larger.</span>}
                        </div>
                      );
                    })()}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={() => handlePhotoUpload(pendingFile)}
                        disabled={uploadStatus === 'uploading'}
                        style={{ flex: 1, background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 13, fontWeight: 700, cursor: uploadStatus === 'uploading' ? 'not-allowed' : 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
                      >
                        {uploadStatus === 'uploading' ? 'Uploading…' : 'Use This Photo'}
                      </button>
                      <button
                        onClick={clearPhotoPreview}
                        style={{ background: 'transparent', border: `1px solid ${C.sand}`, color: C.textMuted, borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" }}
                      >
                        Choose Different
                      </button>
                    </div>
                    {uploadStatus === 'error' && <p style={{ margin: '8px 0 0', color: C.sunset, fontSize: 12 }}>Upload failed — try again</p>}
                  </div>
                ) : (
                  /* ── Step 1: Drop zone ── */
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById('photo-upload-input').click()}
                    style={{
                      border: `2px dashed ${isDragging ? C.lakeBlue : C.sand}`,
                      borderRadius: 10, padding: '28px 16px', textAlign: 'center',
                      cursor: 'pointer', background: isDragging ? '#EEF4F8' : '#fff',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input id="photo-upload-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                    <p style={{ margin: '0 0 6px', fontSize: 14, color: C.dusk, fontWeight: 600 }}>
                      {isDragging ? 'Drop it!' : 'Drop a photo here'}
                    </p>
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: C.textMuted }}>or click to browse</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.textMuted, opacity: 0.7 }}>Best at 1200×630px · landscape (16:9) · JPG, PNG, WebP</p>
                  </div>
                )}
              </div>
            )}
            {uploadStatus === 'done' && uploadedUrl && (
              <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: `2px solid ${C.sage}40` }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                  <img src={uploadedUrl} alt="cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '10px 14px', background: C.warmWhite, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: C.sage, fontSize: 14 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 600, color: C.sage, fontSize: 13, fontFamily: "'Libre Franklin', sans-serif" }}>Photo uploaded &amp; applied to Notion</div>
                    <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Libre Franklin', sans-serif" }}>Cover image is set and ready to publish</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', borderLeft: `4px solid ${C.sunset}` }}>
            <div style={{ color: C.sunset, fontWeight: 600, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ color: C.textLight, fontSize: 14 }}>{errorMsg}</div>
            <button
              onClick={() => setStatus('idle')}
              style={{ marginTop: 16, background: 'transparent', color: C.lakeBlue, border: 'none', cursor: 'pointer', fontSize: 14, padding: 0 }}
            >
              Try again
            </button>
          </div>
        )}
        </>}
      </div>
    </div>

    {/* ── Publish abort toast (Gmail undo-send) ── */}
    {pendingPublish && (
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: C.night, borderRadius: 12, padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: '0 8px 36px rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Libre Franklin, sans-serif', minWidth: 300, overflow: 'hidden' }}>
        <span style={{ color: C.warmWhite, fontSize: 14 }}>Publishing in {pendingPublish.countdown}s…</span>
        <button onClick={cancelPublish} style={{ marginLeft: 'auto', background: C.sunset, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', flexShrink: 0 }}>Undo</button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, background: C.lakeBlue, borderRadius: '0 0 0 12px', animation: 'shrinkWidth 5s linear forwards' }} />
      </div>
    )}
    </>
  );
}
