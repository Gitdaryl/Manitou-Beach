import React, { useState, useEffect, useRef } from 'react';
import { C, DISPATCH_CARD_SPONSORS, DISPATCH_CATEGORIES, USA250_PUBLIC } from '../data/config';
import { Footer, GlobalStyles } from '../components/Layout';
import { DispatchArticleContent } from './DispatchPage';

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

  // ── Revenue Summary ────────────────────────────────────────────
  const [revenueData, setRevenueData] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [pastDueExpanded, setPastDueExpanded] = useState(false);

  // ── Attention Queue ────────────────────────────────────────────
  const [attentionData, setAttentionData] = useState(null);
  const [attentionLoading, setAttentionLoading] = useState(false);
  const [attentionExpanded, setAttentionExpanded] = useState({});

  // ── Ad Slot Monitor ────────────────────────────────────────────
  const [adSlots, setAdSlots] = useState(null);
  const [adSlotsLoading, setAdSlotsLoading] = useState(false);

  // ── Vendor Setup ───────────────────────────────────────────────
  const [vendorForm, setVendorForm] = useState({ eventId: '', organizerName: '', organizerEmail: '', organizerLogoUrl: '', vendorCapacity: '', vendorFee: '' });
  const [vendorSetupStatus, setVendorSetupStatus] = useState('idle'); // idle | loading | success | error
  const [vendorSetupResult, setVendorSetupResult] = useState(null);

  const handleVendorSetup = async () => {
    if (!vendorForm.eventId || !vendorForm.organizerEmail) return;
    setVendorSetupStatus('loading');
    setVendorSetupResult(null);
    try {
      const res = await adminFetch('/api/vendor-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Setup failed');
      setVendorSetupResult(data);
      setVendorSetupStatus('success');
    } catch (err) {
      setVendorSetupResult({ error: err.message });
      setVendorSetupStatus('error');
    }
  };

  // ── Org / Stripe Connect ───────────────────────────────────────
  const [orgForm, setOrgForm] = useState({ orgPageId: '', orgName: '', orgEmail: '' });
  const [orgConnectStatus, setOrgConnectStatus] = useState('idle'); // idle | loading | success | error
  const [orgConnectResult, setOrgConnectResult] = useState(null);
  const [orgCheckStatus, setOrgCheckStatus] = useState('idle');
  const [orgCheckResult, setOrgCheckResult] = useState(null);

  // ── Newsletter Composer ─────────────────────────────────────────
  const NL_DRAFT_KEY = 'yeti_nl_draft';
  const nlDraft = (() => { try { return JSON.parse(localStorage.getItem(NL_DRAFT_KEY) || '{}'); } catch { return {}; } })();
  const nlDefaultDate = (() => {
    const d = new Date();
    const daysUntilThursday = (4 - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilThursday);
    return d.toISOString().split('T')[0];
  })();
  const [nlDate, setNlDate] = useState(nlDraft.nlDate || nlDefaultDate);
  const [nlSubject, setNlSubject] = useState(nlDraft.nlSubject || '');
  const [nlSubjectOptions, setNlSubjectOptions] = useState([]);
  const [nlSubjectLoading, setNlSubjectLoading] = useState(false);
  const [nlNote, setNlNote] = useState(nlDraft.nlNote || '');
  const [nlWeekendText, setNlWeekendText] = useState(nlDraft.nlWeekendText || '');
  const [nlWeekendLoading, setNlWeekendLoading] = useState(false);
  const [nlArticles, setNlArticles] = useState([]);
  const [nlArticlesLoading, setNlArticlesLoading] = useState(false);
  const [nlArticleId, setNlArticleId] = useState(nlDraft.nlArticleId || '');
  const [nlAds, setNlAds] = useState([]);
  const [nlAdsLoading, setNlAdsLoading] = useState(false);
  const [nlAdId, setNlAdId] = useState(nlDraft.nlAdId || '');
  const [nlWelcomeEnabled, setNlWelcomeEnabled] = useState(nlDraft.nlWelcomeEnabled || false);
  const [nlWelcomeText, setNlWelcomeText] = useState(nlDraft.nlWelcomeText || '');
  const [nlWelcomeLoading, setNlWelcomeLoading] = useState(false);
  const [nlGuestEnabled, setNlGuestEnabled] = useState(nlDraft.nlGuestEnabled || false);
  const [nlGuestName, setNlGuestName] = useState(nlDraft.nlGuestName || '');
  const [nlGuestBio, setNlGuestBio] = useState(nlDraft.nlGuestBio || '');
  const [nlGuestContent, setNlGuestContent] = useState(nlDraft.nlGuestContent || '');
  const [nlCopyStatus, setNlCopyStatus] = useState('idle');
  const [nlPreviewChecked, setNlPreviewChecked] = useState(false);
  const [nlPreviewWidth, setNlPreviewWidth] = useState('desktop'); // desktop | mobile
  const [nlStickyStatus, setNlStickyStatus] = useState('idle'); // idle | copied

  // Draft archive helpers — auto-save current draft with date key, keep last 4
  const NL_ARCHIVE_PREFIX = 'yeti_nl_archive_';
  const saveNlArchive = () => {
    if (!nlDate) return;
    try {
      const archiveKey = NL_ARCHIVE_PREFIX + nlDate;
      const draft = { nlDate, nlSubject, nlNote, nlWeekendText, nlArticleId, nlAdId, nlWelcomeEnabled, nlWelcomeText, nlGuestEnabled, nlGuestName, nlGuestBio, nlGuestContent };
      localStorage.setItem(archiveKey, JSON.stringify(draft));
      // Prune to last 4
      const keys = Object.keys(localStorage).filter(k => k.startsWith(NL_ARCHIVE_PREFIX)).sort().reverse();
      keys.slice(4).forEach(k => localStorage.removeItem(k));
    } catch {}
  };
  const getNlArchives = () => {
    try {
      return Object.keys(localStorage)
        .filter(k => k.startsWith(NL_ARCHIVE_PREFIX))
        .sort().reverse()
        .map(k => {
          const d = JSON.parse(localStorage.getItem(k) || '{}');
          return { key: k, date: d.nlDate, label: d.nlDate ? new Date(d.nlDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : k };
        });
    } catch { return []; }
  };
  const loadNlArchive = (key) => {
    try {
      const d = JSON.parse(localStorage.getItem(key) || '{}');
      if (d.nlDate) setNlDate(d.nlDate);
      if (d.nlSubject !== undefined) setNlSubject(d.nlSubject);
      if (d.nlNote !== undefined) setNlNote(d.nlNote);
      if (d.nlWeekendText !== undefined) setNlWeekendText(d.nlWeekendText);
      if (d.nlArticleId !== undefined) setNlArticleId(d.nlArticleId);
      if (d.nlAdId !== undefined) setNlAdId(d.nlAdId);
      if (d.nlWelcomeEnabled !== undefined) setNlWelcomeEnabled(d.nlWelcomeEnabled);
      if (d.nlWelcomeText !== undefined) setNlWelcomeText(d.nlWelcomeText);
      if (d.nlGuestEnabled !== undefined) setNlGuestEnabled(d.nlGuestEnabled);
      if (d.nlGuestName !== undefined) setNlGuestName(d.nlGuestName);
      if (d.nlGuestBio !== undefined) setNlGuestBio(d.nlGuestBio);
      if (d.nlGuestContent !== undefined) setNlGuestContent(d.nlGuestContent);
    } catch {}
  };

  const handleOrgConnect = async () => {
    if (!orgForm.orgPageId || !orgForm.orgName) return;
    setOrgConnectStatus('loading');
    setOrgConnectResult(null);
    try {
      const res = await adminFetch('/api/stripe-connect-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Onboarding failed');
      setOrgConnectResult(data);
      setOrgConnectStatus('success');
    } catch (err) {
      setOrgConnectResult({ error: err.message });
      setOrgConnectStatus('error');
    }
  };

  const handleOrgCheckStatus = async () => {
    if (!orgForm.orgPageId) return;
    setOrgCheckStatus('loading');
    setOrgCheckResult(null);
    try {
      const res = await adminFetch(`/api/stripe-connect-status?orgPageId=${orgForm.orgPageId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status check failed');
      setOrgCheckResult(data);
      setOrgCheckStatus('done');
    } catch (err) {
      setOrgCheckResult({ error: err.message });
      setOrgCheckStatus('error');
    }
  };

  // Detect return from Stripe Connect onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connect_return') === '1') {
      setActiveTab('orgs');
      const returnedOrgId = params.get('orgId');
      if (returnedOrgId) setOrgForm(f => ({ ...f, orgPageId: returnedOrgId }));
    }
  }, []);

  // ── Category Sync ───────────────────────────────────────────────
  const [catSyncStatus, setCatSyncStatus] = useState('idle'); // idle | loading | done | error
  const [catSyncResult, setCatSyncResult] = useState(null);
  const [catPreview, setCatPreview] = useState(null); // live preview from /api/categories

  const loadCatPreview = async () => {
    try {
      const r = await fetch('/api/categories');
      const d = await r.json();
      setCatPreview(d);
    } catch { setCatPreview({ unknownCategories: [], hasOther: false }); }
  };

  const runCatSync = async () => {
    setCatSyncStatus('loading');
    setCatSyncResult(null);
    try {
      const r = await adminFetch('/api/admin/sync-categories', { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Sync failed');
      setCatSyncResult(d);
      setCatSyncStatus('done');
    } catch (err) {
      setCatSyncResult({ error: err.message });
      setCatSyncStatus('error');
    }
  };

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

  // ── Incentive Contracts ─────────────────────────────────────
  const [contracts, setContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [contractsUnconfigured, setContractsUnconfigured] = useState(false);
  const [contractForm, setContractForm] = useState({ vendorName: '', city: 'Manitou Beach, Michigan', offerText: '', tier: 'Single Drop', contactEmail: '', reviewUrl: '', redemptionCap: '' });
  const [contractFormStatus, setContractFormStatus] = useState('idle'); // idle | saving | saved | error
  const [contractFormError, setContractFormError] = useState('');
  const [placeLookupStatus, setPlaceLookupStatus] = useState('idle'); // idle | loading | found | notfound | error
  const [placeLookupResult, setPlaceLookupResult] = useState(null);
  const [contractStatusUpdating, setContractStatusUpdating] = useState({});

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

  const fetchContracts = async () => {
    setContractsLoading(true);
    try {
      const res = await adminFetch('/api/incentive-contracts');
      const data = await res.json();
      setContracts(data.contracts || []);
      setContractsUnconfigured(!!data.unconfigured);
    } catch { setContracts([]); }
    finally { setContractsLoading(false); }
  };

  const handlePlaceLookup = async () => {
    if (!contractForm.vendorName.trim()) return;
    setPlaceLookupStatus('loading');
    setPlaceLookupResult(null);
    try {
      const res = await adminFetch('/api/place-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: contractForm.vendorName, city: contractForm.city }),
      });
      const data = await res.json();
      if (!res.ok) { setPlaceLookupStatus('notfound'); setPlaceLookupResult({ error: data.error }); return; }
      setPlaceLookupResult(data);
      setContractForm(f => ({ ...f, reviewUrl: data.reviewUrl }));
      setPlaceLookupStatus('found');
    } catch (err) {
      setPlaceLookupStatus('error');
      setPlaceLookupResult({ error: err.message });
    }
  };

  const handleContractSubmit = async () => {
    if (!contractForm.vendorName.trim() || !contractForm.tier) return;
    setContractFormStatus('saving');
    setContractFormError('');
    try {
      const res = await adminFetch('/api/incentive-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setContractFormStatus('saved');
      setContractForm({ vendorName: '', city: 'Manitou Beach, Michigan', offerText: '', tier: 'Single Drop', contactEmail: '', reviewUrl: '', redemptionCap: '' });
      setPlaceLookupStatus('idle');
      setPlaceLookupResult(null);
      fetchContracts();
      setTimeout(() => setContractFormStatus('idle'), 3000);
    } catch (err) {
      setContractFormError(err.message);
      setContractFormStatus('error');
    }
  };

  const updateContractStatus = async (id, status) => {
    setContractStatusUpdating(prev => ({ ...prev, [id]: status }));
    try {
      await adminFetch('/api/incentive-contracts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch { /* silent */ }
    finally { setContractStatusUpdating(prev => { const n = { ...prev }; delete n[id]; return n; }); }
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

  const fetchNlArticles = async () => {
    setNlArticlesLoading(true);
    try {
      const res = await adminFetch('/api/admin-articles');
      const data = await res.json();
      setNlArticles(data.articles || []);
    } catch (err) { console.error('nl articles error:', err); }
    finally { setNlArticlesLoading(false); }
  };

  const fetchNlAds = async () => {
    setNlAdsLoading(true);
    try {
      const res = await adminFetch('/api/dispatch-ads?admin=true');
      const data = await res.json();
      setNlAds(data.promos || []);
    } catch (err) { console.error('nl ads error:', err); }
    finally { setNlAdsLoading(false); }
  };

  const handleNlPullEvents = async () => {
    setNlWeekendLoading(true);
    try {
      const evRes = await fetch('/api/events');
      const evData = await evRes.json();
      const now = new Date();
      const in7 = new Date(now.getTime() + 7 * 86400000);
      const upcoming = (evData.events || evData || []).filter(e => {
        const d = new Date(e.date || e.Date || e.startDate || '');
        return d >= now && d <= in7;
      });
      const res = await adminFetch('/api/newsletter-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'weekend-events', events: upcoming }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNlWeekendText((data.bullets || []).join('\n'));
    } catch (err) { console.error('nl pull events error:', err); }
    finally { setNlWeekendLoading(false); }
  };

  const handleNlGenerateSubject = async () => {
    const article = nlArticles.find(a => a.id === nlArticleId);
    setNlSubjectLoading(true);
    try {
      const res = await adminFetch('/api/newsletter-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subject', articleTitle: article?.title || '', eventSummary: nlWeekendText.split('\n')[0] || '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNlSubjectOptions(data.options || []);
    } catch (err) { console.error('nl subject error:', err); }
    finally { setNlSubjectLoading(false); }
  };

  const handleNlWelcomeGenerate = async () => {
    setNlWelcomeLoading(true);
    try {
      const res = await adminFetch('/api/newsletter-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'welcome', businesses: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNlWelcomeText(data.text || '');
    } catch (err) { console.error('nl welcome error:', err); }
    finally { setNlWelcomeLoading(false); }
  };

  // Autosave draft to localStorage whenever any field changes; reset preview-checked flag
  useEffect(() => {
    try {
      localStorage.setItem(NL_DRAFT_KEY, JSON.stringify({
        nlDate, nlSubject, nlNote, nlWeekendText, nlArticleId, nlAdId,
        nlWelcomeEnabled, nlWelcomeText, nlGuestEnabled, nlGuestName, nlGuestBio, nlGuestContent,
      }));
    } catch {}
    setNlPreviewChecked(false);
  }, [nlDate, nlSubject, nlNote, nlWeekendText, nlArticleId, nlAdId, nlWelcomeEnabled, nlWelcomeText, nlGuestEnabled, nlGuestName, nlGuestBio, nlGuestContent]);

  const buildNlPreviewHtml = () => {
    const article = nlArticles.find(a => a.id === nlArticleId);
    const ad = nlAds.find(a => a.id === nlAdId);
    const dateLabel = nlDate ? new Date(nlDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
      body{margin:0;padding:0;background:#f5f0e8;font-family:'Libre Franklin',Arial,sans-serif;}
      .wrap{max-width:600px;margin:0 auto;background:#fff;}
      .header{background:#1A2830;padding:32px 40px;text-align:center;}
      .header h1{color:#fff;font-size:24px;margin:0 0 4px;font-family:'Libre Baskerville',Georgia,serif;letter-spacing:0.04em;}
      .header p{color:#a0b8c0;font-size:13px;margin:0;}
      .section{padding:28px 40px;border-bottom:1px solid #e8e0d0;}
      .section h2{color:#1A2830;font-size:17px;margin:0 0 14px;font-family:'Libre Baskerville',Georgia,serif;}
      .article-box{background:#f9f6f0;border-left:4px solid #4a7c8a;padding:16px 20px;border-radius:0 8px 8px 0;}
      .article-box .cat{font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#4a7c8a;font-weight:700;margin-bottom:6px;}
      .article-box .title{font-size:16px;font-weight:700;color:#1A2830;margin-bottom:6px;font-family:'Libre Baskerville',Georgia,serif;}
      .article-box .excerpt{font-size:13px;color:#5a6a74;line-height:1.6;}
      .ad-box{background:#fff8f0;border:1px solid #e8d0a0;border-radius:10px;padding:20px 24px;}
      .ad-box .bar{height:4px;background:linear-gradient(90deg,#c87941,#e8a84a);border-radius:2px;margin-bottom:14px;}
      .ad-box .biz{font-size:15px;font-weight:700;color:#1A2830;margin-bottom:4px;}
      .ad-box .offer{font-size:13px;color:#5a4a34;line-height:1.5;margin-bottom:10px;}
      .ad-box .cta{display:inline-block;background:#c87941;color:#fff;padding:8px 18px;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;}
      .bullet{padding:6px 0;font-size:14px;color:#2a3a44;line-height:1.5;border-bottom:1px solid #f0ece4;}
      .bullet:last-child{border-bottom:none;}
      .footer{background:#1A2830;padding:24px 40px;text-align:center;}
      .footer p{color:#7a9aa8;font-size:12px;margin:4px 0;line-height:1.6;}
    </style></head><body><div class="wrap">
      <div class="header">
        <h1>The Manitou Dispatch</h1>
        <p>${dateLabel}${nlSubject ? ' · ' + nlSubject : ''}</p>
      </div>
      ${article ? `<div class="section"><h2>This Week</h2><div class="article-box"><div class="cat">${article.category || 'Feature'}</div><div class="title">${article.title}</div><div class="excerpt">${article.excerpt || ''}</div></div></div>` : ''}
      ${nlWeekendText ? `<div class="section"><h2>5 Things This Weekend</h2>${nlWeekendText.split('\n').filter(Boolean).map(b => `<div class="bullet">${b}</div>`).join('')}</div>` : ''}
      ${ad ? `<div class="section"><h2>From Our Sponsors</h2><div class="ad-box"><div class="bar"></div><div class="biz">${ad.businessName || ad.business || ''}</div><div class="offer">${ad.offerText || ad.offer || ''}</div>${ad.link ? `<a class="cta" href="${ad.link}">Learn More →</a>` : ''}</div></div>` : `<div class="section"><h2>From Our Sponsors</h2><div class="ad-box"><div class="bar"></div><div class="biz">Your Business Here</div><div class="offer">Reach thousands of Manitou Beach visitors and locals every week.</div><a class="cta" href="/featured">Get Featured →</a></div></div>`}
      ${nlWelcomeEnabled && nlWelcomeText ? `<div class="section"><h2>Welcome to the Beach 👋</h2><p style="font-size:14px;color:#3a4a54;line-height:1.7;margin:0">${nlWelcomeText}</p></div>` : ''}
      ${nlGuestEnabled && nlGuestContent ? `<div class="section"><h2>Guest Corner</h2><p style="font-size:12px;font-weight:700;color:#4a7c8a;margin:0 0 10px">${nlGuestName}${nlGuestBio ? ' — ' + nlGuestBio : ''}</p><p style="font-size:14px;color:#3a4a54;line-height:1.7;margin:0">${nlGuestContent}</p></div>` : ''}
      ${nlNote ? `<div class="section"><p style="font-size:13px;color:#7a8a94;font-style:italic;margin:0">📝 Internal note: ${nlNote}</p></div>` : ''}
      <div class="footer"><p>The Manitou Dispatch · Manitou Beach, MI</p><p>You're receiving this because you subscribed.</p></div>
    </div></body></html>`;
  };

  const fetchRevenueSummary = async () => {
    setRevenueLoading(true);
    try {
      const res = await adminFetch('/api/admin/revenue-summary');
      if (res.ok) setRevenueData(await res.json());
    } catch (err) { console.error('Revenue summary error:', err); }
    finally { setRevenueLoading(false); }
  };

  const fetchAttentionQueue = async () => {
    setAttentionLoading(true);
    try {
      const res = await adminFetch('/api/admin/attention-queue');
      if (res.ok) setAttentionData(await res.json());
    } catch (err) { console.error('Attention queue error:', err); }
    finally { setAttentionLoading(false); }
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
    if (activeTab === 'newsletter') { fetchNlArticles(); fetchNlAds(); }
    if (activeTab === 'review') fetchDrafts();
    if (activeTab === 'dashboard') { fetchDashboard(); fetchAdSlots(); fetchRevenueSummary(); fetchAttentionQueue(); }
    if (activeTab === 'promos') fetchPromos();
    if (activeTab === 'pois') fetchAdminPois();
    if (activeTab === 'ratings') fetchAdminRatings();
    if (activeTab === 'wines') fetchAdminWines();
    if (activeTab === 'incentives') fetchContracts();
    if (activeTab === 'categories') loadCatPreview();
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
          {[{ id: 'write', label: '✍️  Write' }, { id: 'newsletter', label: '📰  Newsletter' }, { id: 'review', label: '📋  Review Queue' }, { id: 'dashboard', label: '📊  Dashboard' }, { id: 'advertisers', label: '🤝  Advertisers' }, { id: 'promos', label: '🎟️  Promos' }, { id: 'pois', label: '📍  Community POIs' }, { id: 'ratings', label: '🍷  Winery Ratings' }, { id: 'wines', label: '🍾  Wines Registry' }, { id: 'vendors', label: '🏪  Vendors' }, { id: 'orgs', label: '🏛️  Orgs' }, { id: 'incentives', label: '🎁  Incentives' }, { id: 'categories', label: '🗂️  Categories' }].map(tab => (
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

            {/* ── MONEY ROW ── */}
            {revenueLoading ? (
              <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16, textAlign: 'center', color: C.textMuted, fontSize: 13, fontFamily: 'Libre Franklin, sans-serif' }}>Loading revenue…</div>
            ) : revenueData ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 10, fontWeight: 700 }}>💰 Revenue</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 12 }}>
                  {/* MRR */}
                  <div style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${C.sage}` }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>💰</div>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 26, fontWeight: 700, color: C.dusk, marginBottom: 2 }}>${revenueData.mrr.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>MRR</div>
                    <div style={{ fontSize: 12, color: C.textLight, marginTop: 4, fontFamily: 'Libre Franklin, sans-serif' }}>{revenueData.activeSubscriptions} active subs</div>
                  </div>
                  {/* By Tier */}
                  <div style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${C.lakeBlue}` }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📊</div>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 18, fontWeight: 700, color: C.dusk, marginBottom: 2 }}>
                      {revenueData.byTier.Basic} / {revenueData.byTier.Enhanced} / {revenueData.byTier.Featured}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>By Tier</div>
                    <div style={{ fontSize: 12, color: C.textLight, marginTop: 4, fontFamily: 'Libre Franklin, sans-serif' }}>Basic / Enhanced / Featured</div>
                  </div>
                  {/* Past Due */}
                  <div
                    onClick={() => revenueData.pastDue.length > 0 && setPastDueExpanded(e => !e)}
                    style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${revenueData.pastDue.length > 0 ? '#c05a5a' : C.sage}`, cursor: revenueData.pastDue.length > 0 ? 'pointer' : 'default' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{revenueData.pastDue.length > 0 ? '⚠️' : '✅'}</div>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 26, fontWeight: 700, color: revenueData.pastDue.length > 0 ? '#c05a5a' : C.sage, marginBottom: 2 }}>{revenueData.pastDue.length}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>Past Due</div>
                    {revenueData.pastDue.length > 0 && <div style={{ fontSize: 12, color: C.lakeBlue, marginTop: 4, fontFamily: 'Libre Franklin, sans-serif' }}>{pastDueExpanded ? 'hide ↑' : 'tap to expand ↓'}</div>}
                  </div>
                  {/* vs Last Month */}
                  <div style={{ background: '#fff', borderRadius: 12, padding: '18px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `3px solid ${revenueData.thisMonth >= revenueData.lastMonth ? C.sage : C.sunset}` }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{revenueData.thisMonth >= revenueData.lastMonth ? '📈' : '📉'}</div>
                    <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, fontWeight: 700, color: revenueData.thisMonth >= revenueData.lastMonth ? C.sage : C.sunset, marginBottom: 2 }}>
                      {revenueData.thisMonth >= revenueData.lastMonth ? '+' : ''}{(revenueData.thisMonth - revenueData.lastMonth) < 0 ? '-' : ''}&nbsp;${Math.abs(revenueData.thisMonth - revenueData.lastMonth)}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Libre Franklin, sans-serif' }}>vs Last Month</div>
                    <div style={{ fontSize: 12, color: C.textLight, marginTop: 4, fontFamily: 'Libre Franklin, sans-serif' }}>${revenueData.lastMonth} → ${revenueData.thisMonth}</div>
                  </div>
                </div>

                {/* Past Due expansion */}
                {pastDueExpanded && revenueData.pastDue.length > 0 && (
                  <div style={{ background: '#fff5f5', border: '1px solid #f0b0b0', borderRadius: 10, padding: '14px 18px', marginTop: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c05a5a', marginBottom: 10, fontFamily: 'Libre Franklin, sans-serif' }}>Past-Due Accounts</div>
                    {revenueData.pastDue.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < revenueData.pastDue.length - 1 ? '1px solid #f0d0d0' : 'none', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: C.dusk, fontSize: 13, fontFamily: 'Libre Franklin, sans-serif' }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>${item.amount}/mo · {item.daysOverdue}d overdue</div>
                        </div>
                        {item.email && (
                          <button
                            onClick={() => navigator.clipboard.writeText(item.email)}
                            style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, background: 'transparent', border: '1px solid #e0b0b0', borderRadius: 6, color: '#c05a5a', cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap' }}
                          >Copy email</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Wine season */}
                {revenueData.wineSeason.partners > 0 && (
                  <div style={{ marginTop: 10, background: '#fff', borderRadius: 10, padding: '12px 18px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 18 }}>🍷</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif' }}>Wine Trail Season</div>
                      <div style={{ fontSize: 12, color: C.textLight, fontFamily: 'Libre Franklin, sans-serif' }}>{revenueData.wineSeason.partners} partners · ${revenueData.wineSeason.revenue.toLocaleString()} season revenue</div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* ── ATTENTION QUEUE ── */}
            {attentionLoading ? (
              <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16, textAlign: 'center', color: C.textMuted, fontSize: 13, fontFamily: 'Libre Franklin, sans-serif' }}>Checking platform health…</div>
            ) : attentionData ? (() => {
              const totalIssues = attentionData.pendingEvents + attentionData.pendingRatings + attentionData.incompleteBiz.length + attentionData.ghostTrucks.length + attentionData.stalledOnboarding;
              const items = [
                {
                  key: 'events',
                  count: attentionData.pendingEvents,
                  label: count => count === 1 ? '1 Event pending' : `${count} Events pending`,
                  onClick: () => window.open('https://notion.so', '_blank'),
                  expandable: false,
                },
                {
                  key: 'ratings',
                  count: attentionData.pendingRatings,
                  label: count => count === 1 ? '1 Rating to review' : `${count} Ratings to review`,
                  onClick: () => { setActiveTab('ratings'); setRatingsFilter('Pending'); },
                  expandable: false,
                },
                {
                  key: 'incompleteBiz',
                  count: attentionData.incompleteBiz.length,
                  label: count => count === 1 ? '1 Incomplete listing' : `${count} Incomplete listings`,
                  onClick: () => setAttentionExpanded(e => ({ ...e, incompleteBiz: !e.incompleteBiz })),
                  expandable: true,
                  detail: attentionData.incompleteBiz,
                },
                {
                  key: 'ghostTrucks',
                  count: attentionData.ghostTrucks.length,
                  label: count => count === 1 ? '1 Ghost truck' : `${count} Ghost trucks`,
                  onClick: () => setAttentionExpanded(e => ({ ...e, ghostTrucks: !e.ghostTrucks })),
                  expandable: true,
                  detail: attentionData.ghostTrucks,
                },
                {
                  key: 'stalled',
                  count: attentionData.stalledOnboarding,
                  label: count => count === 0 ? 'Onboarding ✓' : `${count} Stalled onboarding`,
                  onClick: null,
                  expandable: false,
                },
              ];
              return (
                <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif' }}>🔔 Needs Attention</div>
                    {totalIssues === 0 && <span style={{ fontSize: 12, color: C.sage, fontFamily: 'Libre Franklin, sans-serif', fontWeight: 600 }}>✓ All clear</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {items.map(item => {
                      const isOk = item.count === 0;
                      return (
                        <div key={item.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <button
                            onClick={item.onClick || undefined}
                            disabled={!item.onClick}
                            style={{
                              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                              fontFamily: 'Libre Franklin, sans-serif',
                              cursor: item.onClick ? 'pointer' : 'default',
                              border: 'none',
                              background: isOk ? '#d1fae5' : '#fef3c7',
                              color: isOk ? '#065f46' : '#92400e',
                            }}
                          >{item.label(item.count)}</button>
                          {/* Expanded detail for incompleteBiz */}
                          {item.key === 'incompleteBiz' && attentionExpanded.incompleteBiz && item.detail?.length > 0 && (
                            <div style={{ background: '#fffbf0', border: '1px solid #e8d090', borderRadius: 8, padding: '10px 14px', minWidth: 220 }}>
                              {item.detail.map((biz, i) => (
                                <div key={i} style={{ fontSize: 12, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif', padding: '3px 0', borderBottom: i < item.detail.length - 1 ? `1px solid ${C.sand}` : 'none' }}>
                                  <strong>{biz.name}</strong> <span style={{ color: C.textMuted }}>— missing {biz.missing.join(', ')}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* Expanded detail for ghostTrucks */}
                          {item.key === 'ghostTrucks' && attentionExpanded.ghostTrucks && item.detail?.length > 0 && (
                            <div style={{ background: '#fffbf0', border: '1px solid #e8d090', borderRadius: 8, padding: '10px 14px', minWidth: 220 }}>
                              {item.detail.map((truck, i) => (
                                <div key={i} style={{ fontSize: 12, color: C.dusk, fontFamily: 'Libre Franklin, sans-serif', padding: '3px 0', borderBottom: i < item.detail.length - 1 ? `1px solid ${C.sand}` : 'none' }}>
                                  <strong>{truck.name}</strong> <span style={{ color: C.textMuted }}>— last check-in: {truck.lastCheckIn || 'never'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })() : null}

            {/* ── EDITORIAL & TOOLS divider ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 20px', opacity: 0.5 }}>
              <div style={{ flex: 1, height: 1, background: C.sand }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap' }}>Editorial &amp; Tools</div>
              <div style={{ flex: 1, height: 1, background: C.sand }} />
            </div>

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
                  onClick={() => { navigator.clipboard.writeText('https://manitou-beach.vercel.app/fireworks?preview=true'); }}
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
                  const claimUrl = promo.claimSlug ? `https://manitou-beach.vercel.app/claim/${promo.claimSlug}` : null;
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

        {/* ── VENDORS TAB ── */}
        {activeTab === 'vendors' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, color: C.text, marginBottom: 6 }}>Vendor Registration Setup</div>
              <p style={{ fontSize: 14, color: C.textLight, lineHeight: 1.7, margin: 0 }}>
                Fill in the event details below and click Activate. The system will enable vendor registration, generate a secure portal token, patch Notion, and email the organizer their two ready-to-share URLs — all in one click.
              </p>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', marginBottom: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <label style={labelStyle}>Notion Event Page ID * <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: C.textMuted }}>(from Notion URL — the long hex string)</span></label>
                  <input style={inputStyle} placeholder="e.g. 3288c729eb5981149a2ffeaa3c9dbda6" value={vendorForm.eventId} onChange={e => setVendorForm(f => ({ ...f, eventId: e.target.value.replace(/-/g, '').trim() }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Organizer Name *</label>
                    <input style={inputStyle} placeholder="e.g. Corks & Kegs Festival" value={vendorForm.organizerName} onChange={e => setVendorForm(f => ({ ...f, organizerName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Organizer Email *</label>
                    <input type="email" style={inputStyle} placeholder="organizer@email.com" value={vendorForm.organizerEmail} onChange={e => setVendorForm(f => ({ ...f, organizerEmail: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Organizer Logo / Hero Image URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: C.textMuted }}>(shown large on vendor reg page)</span></label>
                  <input style={inputStyle} placeholder="https://... (full-width banner image)" value={vendorForm.organizerLogoUrl} onChange={e => setVendorForm(f => ({ ...f, organizerLogoUrl: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Vendor Capacity <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(leave blank = unlimited)</span></label>
                    <input type="number" style={inputStyle} placeholder="e.g. 40" value={vendorForm.vendorCapacity} onChange={e => setVendorForm(f => ({ ...f, vendorCapacity: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Booth Fee $ <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(0 = free registration)</span></label>
                    <input type="number" style={inputStyle} placeholder="e.g. 75" value={vendorForm.vendorFee} onChange={e => setVendorForm(f => ({ ...f, vendorFee: e.target.value }))} />
                  </div>
                </div>

                <button
                  onClick={handleVendorSetup}
                  disabled={vendorSetupStatus === 'loading' || !vendorForm.eventId || !vendorForm.organizerEmail}
                  style={{
                    padding: '13px 0', background: vendorSetupStatus === 'loading' ? C.textMuted : C.dusk, color: '#fff',
                    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                    cursor: vendorSetupStatus === 'loading' || !vendorForm.eventId || !vendorForm.organizerEmail ? 'not-allowed' : 'pointer',
                    fontFamily: 'Libre Franklin, sans-serif', transition: 'background 0.2s',
                  }}
                >
                  {vendorSetupStatus === 'loading' ? 'Activating…' : 'Activate Vendor Registration →'}
                </button>
              </div>
            </div>

            {vendorSetupStatus === 'success' && vendorSetupResult && (
              <div style={{ background: '#f0fff4', border: '1px solid #90d0a0', borderRadius: 12, padding: 24 }}>
                <div style={{ fontWeight: 700, color: '#1a5c2a', marginBottom: 16, fontSize: 15 }}>✓ Vendor registration activated — organizer emailed</div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5c8a6a', marginBottom: 6 }}>Share with vendors</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <code style={{ flex: 1, background: '#fff', border: '1px solid #c0e0c8', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#1A2830', wordBreak: 'break-all' }}>{vendorSetupResult.registrationUrl}</code>
                    <button onClick={() => navigator.clipboard.writeText(vendorSetupResult.registrationUrl)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #c0e0c8', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap' }}>Copy</button>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#5c8a6a', marginBottom: 6 }}>Organizer portal (private)</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <code style={{ flex: 1, background: '#fff', border: '1px solid #c0e0c8', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: '#1A2830', wordBreak: 'break-all' }}>{vendorSetupResult.portalUrl}</code>
                    <button onClick={() => navigator.clipboard.writeText(vendorSetupResult.portalUrl)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #c0e0c8', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap' }}>Copy</button>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: '#5c8a6a', margin: 0, lineHeight: 1.6 }}>
                  Portal token: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{vendorSetupResult.portalToken}</code> — also saved to Notion.
                </p>
              </div>
            )}

            {vendorSetupStatus === 'error' && vendorSetupResult?.error && (
              <div style={{ background: '#fff0f0', border: '1px solid #f0b0b0', borderRadius: 12, padding: 20, color: '#c0392b', fontSize: 14 }}>
                {vendorSetupResult.error}
              </div>
            )}
          </div>
        )}

        {/* ── NEWSLETTER COMPOSER TAB ── */}
        {activeTab === 'newsletter' && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, color: C.dusk, margin: '0 0 6px' }}>Newsletter Composer</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Build each issue section-by-section, preview the HTML, then paste into beehiiv.</p>
                <span style={{ fontSize: 11, color: C.sage, fontFamily: 'Libre Franklin, sans-serif' }}>✓ Draft autosaved</span>
                {/* Draft archive dropdown */}
                {(() => {
                  const archives = getNlArchives();
                  return archives.length > 0 ? (
                    <select
                      onChange={e => { if (e.target.value) { loadNlArchive(e.target.value); e.target.value = ''; } }}
                      defaultValue=""
                      style={{ fontSize: 11, color: C.textMuted, background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                    >
                      <option value="">Load previous…</option>
                      {archives.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                    </select>
                  ) : null;
                })()}
                <button
                  onClick={() => {
                    if (!window.confirm('Clear this draft and start fresh?')) return;
                    saveNlArchive();
                    localStorage.removeItem(NL_DRAFT_KEY);
                    setNlDate(nlDefaultDate); setNlSubject(''); setNlNote(''); setNlWeekendText('');
                    setNlArticleId(''); setNlAdId(''); setNlWelcomeEnabled(false); setNlWelcomeText('');
                    setNlGuestEnabled(false); setNlGuestName(''); setNlGuestBio(''); setNlGuestContent('');
                    setNlSubjectOptions([]);
                  }}
                  style={{ fontSize: 11, color: C.textMuted, background: 'none', border: `1px solid ${C.sand}`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                >Clear draft</button>
              </div>
            </div>

            {/* ── Issue Checklist ── */}
            {(() => {
              const selectedArticle = nlArticles.find(a => a.id === nlArticleId);
              const checks = [
                { label: nlDate ? `Date (${new Date(nlDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : 'Date', ok: !!nlDate, warn: false },
                { label: 'Subject line', ok: nlSubject.trim().length > 0, warn: false },
                { label: 'Weekend events', ok: nlWeekendText.trim().length > 0, warn: false },
                {
                  label: selectedArticle
                    ? (selectedArticle.blogSafe ? 'Article ✓' : 'Article ⚠ Draft')
                    : 'Article',
                  ok: !!nlArticleId && !!selectedArticle?.blogSafe,
                  warn: !!nlArticleId && !selectedArticle?.blogSafe,
                },
                { label: nlAdId ? 'Ad slot ✓' : 'Ad slot (optional)', ok: !!nlAdId, warn: false, optional: true },
                { label: nlPreviewChecked ? 'Preview ✓' : 'Preview checked', ok: nlPreviewChecked, warn: false },
              ];
              const allCoreOk = checks.filter(c => !c.optional).every(c => c.ok);
              return (
                <div style={{ background: allCoreOk ? '#f0fff4' : C.warmWhite, border: `1px solid ${allCoreOk ? '#c0e8c8' : C.sand}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: allCoreOk ? '#065f46' : C.textMuted, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 8 }}>
                    📋 Issue Checklist {allCoreOk ? '— ready to send' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {checks.map((c, i) => (
                      <span key={i} style={{
                        fontSize: 12, fontFamily: 'Libre Franklin, sans-serif', fontWeight: 600,
                        padding: '3px 10px', borderRadius: 20,
                        background: c.ok ? '#d1fae5' : c.warn ? '#fef3c7' : c.optional ? '#f5f5f5' : '#fff3cd',
                        color: c.ok ? '#065f46' : c.warn ? '#92400e' : c.optional ? '#999' : '#856404',
                      }}>
                        {c.ok ? '✅' : c.warn ? '⚠️' : '⬜'} {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Section 1 — Issue Header */}
            <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: C.dusk, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>1</span>
                Issue Header
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Issue Date</label>
                  <input type="date" style={inputStyle} value={nlDate} onChange={e => setNlDate(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Internal Note</label>
                  <input style={inputStyle} placeholder="e.g. Memorial Day weekend edition" value={nlNote} onChange={e => setNlNote(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Subject Line</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input style={{ ...inputStyle, flex: 1 }} placeholder="Write or pick from AI options below" value={nlSubject} onChange={e => setNlSubject(e.target.value)} />
                  <button
                    onClick={handleNlGenerateSubject}
                    disabled={nlSubjectLoading}
                    style={{ padding: '10px 16px', background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: nlSubjectLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', fontFamily: 'Libre Franklin, sans-serif' }}
                  >{nlSubjectLoading ? 'Generating…' : '⚡ AI Generate'}</button>
                </div>
                {nlSubjectOptions.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {nlSubjectOptions.map((opt, i) => (
                      <button key={i} onClick={() => setNlSubject(opt)} style={{ textAlign: 'left', padding: '8px 14px', background: nlSubject === opt ? C.dusk : '#fff', color: nlSubject === opt ? '#fff' : C.text, border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>{opt}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2 — 5 Things This Weekend */}
            <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: C.dusk, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>2</span>
                5 Things This Weekend
              </div>
              <button
                onClick={handleNlPullEvents}
                disabled={nlWeekendLoading}
                style={{ padding: '9px 18px', background: '#fff', color: C.lakeBlue, border: `1px solid ${C.lakeBlue}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: nlWeekendLoading ? 'not-allowed' : 'pointer', marginBottom: 12, fontFamily: 'Libre Franklin, sans-serif' }}
              >{nlWeekendLoading ? 'Pulling events…' : '📅 Pull from Events'}</button>
              {/* Structured event rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {(nlWeekendText ? nlWeekendText.split('\n') : []).map((line, idx, arr) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                      value={line}
                      placeholder="☀️ Fri · Event Name — one line why to go"
                      onChange={e => {
                        const rows = arr.slice();
                        rows[idx] = e.target.value;
                        setNlWeekendText(rows.join('\n'));
                      }}
                    />
                    <button
                      onClick={() => {
                        const rows = arr.filter((_, i) => i !== idx);
                        setNlWeekendText(rows.join('\n'));
                      }}
                      style={{ flexShrink: 0, width: 28, height: 28, background: 'none', border: `1px solid ${C.sand}`, borderRadius: 6, cursor: 'pointer', color: C.textMuted, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove event"
                    >✕</button>
                  </div>
                ))}
                {(!nlWeekendText || nlWeekendText.trim() === '') && (
                  <p style={{ fontSize: 12, color: C.textMuted, margin: 0, fontStyle: 'italic' }}>No events yet — pull from Events or add manually below.</p>
                )}
                <button
                  onClick={() => setNlWeekendText(prev => prev ? prev + '\n☀️ ' : '☀️ ')}
                  style={{ alignSelf: 'flex-start', padding: '7px 14px', background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 8, fontSize: 12, color: C.textLight, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', marginTop: 4 }}
                >+ Add event manually</button>
              </div>
            </div>

            {/* Section 3 — Main Article */}
            <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: C.dusk, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>3</span>
                  Main Article
                </span>
                <button onClick={() => setActiveTab('write')} style={{ fontSize: 12, color: C.lakeBlue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>+ Go to Write tab →</button>
              </div>
              {nlArticlesLoading ? (
                <p style={{ fontSize: 13, color: C.textMuted }}>Loading articles…</p>
              ) : (
                <select
                  style={{ ...inputStyle }}
                  value={nlArticleId}
                  onChange={e => setNlArticleId(e.target.value)}
                >
                  <option value="">— Select an article —</option>
                  {nlArticles.map(a => (
                    <option key={a.id} value={a.id}>{a.title} {a.category ? `[${a.category}]` : ''} {a.blogSafe ? '✅' : '📝'}</option>
                  ))}
                </select>
              )}
              {nlArticleId && nlArticles.find(a => a.id === nlArticleId) && (() => {
                const a = nlArticles.find(x => x.id === nlArticleId);
                return (
                  <div style={{ marginTop: 10 }}>
                    {!a.blogSafe && (
                      <div style={{ padding: '8px 14px', background: '#fff8e0', border: '1px solid #e8d080', borderRadius: 8, fontSize: 12, color: '#806010', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span>⚠️ This article is still a Draft — it won't be on the blog when the newsletter goes out.</span>
                        <button onClick={() => setActiveTab('review')} style={{ whiteSpace: 'nowrap', background: 'none', border: 'none', color: C.lakeBlue, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>Publish now →</button>
                      </div>
                    )}
                    {/* WYSIWYG article preview — styled like newsletter article-box */}
                    <div style={{ marginTop: 4, border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                      <div style={{ borderLeft: `4px solid ${C.lakeBlue}`, padding: '14px 16px' }}>
                        {a.category && (
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C.lakeBlue, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>{a.category}</div>
                        )}
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#222', lineHeight: 1.35, marginBottom: 8, fontFamily: 'Libre Baskerville, serif' }}>{a.title}</div>
                        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.65, fontFamily: 'Libre Franklin, sans-serif' }}>{a.excerpt || 'No excerpt available.'}</div>
                        {a.notionUrl && (
                          <a href={a.notionUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: C.lakeBlue, fontFamily: 'Libre Franklin, sans-serif', textDecoration: 'none', fontWeight: 600 }}>Read full in Notion ↗</a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Section 4 — Ad Slot */}
            <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: C.dusk, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>4</span>
                Ad Slot
              </div>
              {nlAdsLoading ? (
                <p style={{ fontSize: 13, color: C.textMuted }}>Loading ads…</p>
              ) : (
                <select style={inputStyle} value={nlAdId} onChange={e => setNlAdId(e.target.value)}>
                  <option value="">— House ad (default: /featured) —</option>
                  {nlAds.map(a => (
                    <option key={a.id} value={a.id}>{a.businessName || a.business || a.title} — {a.offerText || a.offer || ''}</option>
                  ))}
                </select>
              )}
              {nlAdId && nlAds.find(a => a.id === nlAdId) && (() => {
                const ad = nlAds.find(a => a.id === nlAdId);
                return (
                  <div style={{ marginTop: 10, padding: '14px 18px', background: '#fff8f0', border: '1px solid #e8d0a0', borderRadius: 8 }}>
                    <div style={{ height: 3, background: 'linear-gradient(90deg,#c87941,#e8a84a)', borderRadius: 2, marginBottom: 10 }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.dusk, marginBottom: 4 }}>{ad.businessName || ad.business || ''}</div>
                    <div style={{ fontSize: 13, color: C.textLight }}>{ad.offerText || ad.offer || ''}</div>
                  </div>
                );
              })()}
            </div>

            {/* Section 5 — Welcome New Businesses */}
            <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: C.dusk, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>5</span>
                  Welcome New Businesses
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.textLight }}>
                  <input type="checkbox" checked={nlWelcomeEnabled} onChange={e => setNlWelcomeEnabled(e.target.checked)} style={{ accentColor: C.dusk }} />
                  Include
                </label>
              </div>
              {nlWelcomeEnabled && (
                <>
                  <button
                    onClick={handleNlWelcomeGenerate}
                    disabled={nlWelcomeLoading}
                    style={{ padding: '9px 18px', background: '#fff', color: C.lakeBlue, border: `1px solid ${C.lakeBlue}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: nlWelcomeLoading ? 'not-allowed' : 'pointer', marginBottom: 12, fontFamily: 'Libre Franklin, sans-serif' }}
                  >{nlWelcomeLoading ? 'Writing…' : '⚡ AI Write Shout-out'}</button>
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                    placeholder="Welcome shout-out text…"
                    value={nlWelcomeText}
                    onChange={e => setNlWelcomeText(e.target.value)}
                  />
                </>
              )}
              {!nlWelcomeEnabled && <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Toggle on to include a welcome for new Featured businesses (added in last 14 days).</p>}
            </div>

            {/* Section 6 — Guest Contributor */}
            <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: C.dusk, color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>6</span>
                  Guest Contributor
                </span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.textLight }}>
                  <input type="checkbox" checked={nlGuestEnabled} onChange={e => setNlGuestEnabled(e.target.checked)} style={{ accentColor: C.dusk }} />
                  Include
                </label>
              </div>
              {nlGuestEnabled ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Contributor Name</label>
                      <input style={inputStyle} placeholder="Jane Smith" value={nlGuestName} onChange={e => setNlGuestName(e.target.value)} />
                    </div>
                    <div>
                      <label style={labelStyle}>1-Line Bio</label>
                      <input style={inputStyle} placeholder="Local birder & lake historian" value={nlGuestBio} onChange={e => setNlGuestBio(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Content</label>
                    <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} placeholder="Guest content…" value={nlGuestContent} onChange={e => setNlGuestContent(e.target.value)} />
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>Toggle on to include a guest column. Default: off.</p>
              )}
            </div>

            {/* Preview Panel */}
            <div style={{ border: `2px solid ${C.dusk}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ background: C.dusk, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Preview</span>
                  {/* Mobile/Desktop toggle */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                    {[{ id: 'desktop', label: '🖥 Desktop' }, { id: 'mobile', label: '📱 Mobile' }].map(w => (
                      <button
                        key={w.id}
                        onClick={() => setNlPreviewWidth(w.id)}
                        style={{ padding: '4px 12px', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', background: nlPreviewWidth === w.id ? 'rgba(255,255,255,0.25)' : 'transparent', color: '#fff', transition: 'background 0.15s' }}
                      >{w.label}</button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(buildNlPreviewHtml());
                    setNlCopyStatus('copied');
                    setTimeout(() => setNlCopyStatus('idle'), 2500);
                  }}
                  style={{ padding: '7px 16px', background: nlCopyStatus === 'copied' ? C.sage : C.sunset, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                >{nlCopyStatus === 'copied' ? '✓ Copied!' : '📋 Copy Preview HTML'}</button>
              </div>
              <div style={{ background: '#f0ece4', padding: nlPreviewWidth === 'mobile' ? '16px' : 0, display: 'flex', justifyContent: 'center' }}>
                <iframe
                  key={`${nlDate}-${nlSubject}-${nlArticleId}-${nlAdId}-${nlWeekendText}-${nlWelcomeEnabled}-${nlWelcomeText}-${nlGuestEnabled}-${nlGuestContent}`}
                  srcDoc={buildNlPreviewHtml()}
                  onLoad={() => setNlPreviewChecked(true)}
                  style={{
                    width: nlPreviewWidth === 'mobile' ? 375 : '100%',
                    maxWidth: '100%',
                    height: 700,
                    border: nlPreviewWidth === 'mobile' ? '2px solid rgba(0,0,0,0.15)' : 'none',
                    borderRadius: nlPreviewWidth === 'mobile' ? 12 : 0,
                    display: 'block',
                    transition: 'width 0.2s',
                  }}
                  title="Newsletter Preview"
                />
              </div>
            </div>

            {/* Sticky action bar */}
            {(nlSubject.trim() || nlArticleId || nlWeekendText.trim()) && (
              <div style={{ position: 'sticky', bottom: 16, zIndex: 100, marginTop: 16, background: C.dusk, borderRadius: 12, padding: '14px 20px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(buildNlPreviewHtml());
                    setNlStickyStatus('copied');
                    setTimeout(() => setNlStickyStatus('idle'), 5000);
                  }}
                  style={{ flex: 1, padding: '10px 0', background: nlStickyStatus === 'copied' ? C.sage : C.sunset, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                >
                  {nlStickyStatus === 'copied' ? '✓ Copied — now paste in beehiiv' : '📋 Copy HTML to Clipboard'}
                </button>
                <a
                  href="https://app.beehiiv.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center', fontFamily: 'Libre Franklin, sans-serif' }}
                >🔗 Open beehiiv →</a>
              </div>
            )}
          </div>
        )}

        {/* ── ORGS TAB ── */}
        {activeTab === 'orgs' && (
          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 20, color: C.dusk, margin: '0 0 6px' }}>Community Org Stripe Connect</h2>
              <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
                Connect a community org's bank account via Stripe Express. Once connected, their sponsorship form accepts online payments — funds go directly to their bank, Yetickets keeps 1.25%.
              </p>
            </div>

            <div style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Notion Business DB Page ID *</label>
                <input style={inputStyle} placeholder="e.g. 30d8c729eb59805b9444..." value={orgForm.orgPageId} onChange={e => setOrgForm(f => ({ ...f, orgPageId: e.target.value.replace(/-/g, '').trim() }))} />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>From the org's Notion Business DB record URL</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Org Name *</label>
                  <input style={inputStyle} placeholder="e.g. Ladies Club" value={orgForm.orgName} onChange={e => setOrgForm(f => ({ ...f, orgName: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Org Contact Email</label>
                  <input type="email" style={inputStyle} placeholder="treasurer@org.com" value={orgForm.orgEmail} onChange={e => setOrgForm(f => ({ ...f, orgEmail: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleOrgConnect}
                  disabled={orgConnectStatus === 'loading' || !orgForm.orgPageId || !orgForm.orgName}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: orgConnectStatus === 'loading' ? C.textMuted : C.dusk,
                    color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: orgConnectStatus === 'loading' || !orgForm.orgPageId || !orgForm.orgName ? 'not-allowed' : 'pointer',
                    fontFamily: 'Libre Franklin, sans-serif',
                  }}
                >
                  {orgConnectStatus === 'loading' ? 'Generating link…' : 'Generate Stripe Connect Link →'}
                </button>
                <button
                  onClick={handleOrgCheckStatus}
                  disabled={orgCheckStatus === 'loading' || !orgForm.orgPageId}
                  style={{
                    padding: '12px 18px',
                    background: 'transparent', color: C.lakeBlue,
                    border: `1px solid ${C.lakeBlue}`, borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: orgCheckStatus === 'loading' || !orgForm.orgPageId ? 'not-allowed' : 'pointer',
                    fontFamily: 'Libre Franklin, sans-serif',
                  }}
                >
                  {orgCheckStatus === 'loading' ? 'Checking…' : 'Check Status'}
                </button>
              </div>
            </div>

            {orgConnectStatus === 'success' && orgConnectResult && (
              <div style={{ background: '#f0fff4', border: '1px solid #90d0a0', borderRadius: 12, padding: 24, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#1a5c2a', marginBottom: 12, fontSize: 15 }}>✓ Stripe Express account created</div>
                <p style={{ fontSize: 13, color: '#3a5c40', margin: '0 0 12px', lineHeight: 1.6 }}>
                  Send this link to the org. They'll complete Stripe's hosted onboarding (5 min) — bank details, ID verification. Once done, their sponsorship form accepts payments.
                </p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <code style={{ flex: 1, background: '#fff', border: '1px solid #c0e0c8', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#1A2830', wordBreak: 'break-all' }}>{orgConnectResult.onboardingUrl}</code>
                  <button onClick={() => navigator.clipboard.writeText(orgConnectResult.onboardingUrl)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #c0e0c8', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif', whiteSpace: 'nowrap' }}>Copy</button>
                </div>
                <p style={{ fontSize: 11, color: '#5c8a6a', margin: 0 }}>
                  Account ID: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{orgConnectResult.accountId}</code> — saved to Notion.
                </p>
                <p style={{ fontSize: 12, color: '#5c8a6a', margin: '12px 0 0', lineHeight: 1.6 }}>
                  Then add <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>orgPageId="{orgForm.orgPageId}"</code> to the{' '}
                  <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{'<CommunityDonationForm>'}</code> on their page to activate online payments.
                </p>
              </div>
            )}

            {orgCheckStatus === 'done' && orgCheckResult && (
              <div style={{ background: orgCheckResult.connected ? '#f0fff4' : '#fff8e0', border: `1px solid ${orgCheckResult.connected ? '#90d0a0' : '#e0d090'}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontWeight: 700, color: orgCheckResult.connected ? '#1a5c2a' : '#7a6010', marginBottom: 8, fontSize: 14 }}>
                  {orgCheckResult.connected ? '✓ Account active — ready for payments' : '⏳ Onboarding not yet complete'}
                </div>
                <p style={{ fontSize: 12, color: orgCheckResult.connected ? '#3a5c40' : '#6a5010', margin: 0, lineHeight: 1.7 }}>
                  Account ID: <code style={{ background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{orgCheckResult.accountId}</code><br />
                  Details submitted: {orgCheckResult.detailsSubmitted ? 'Yes' : 'No'} · Charges enabled: {orgCheckResult.chargesEnabled ? 'Yes' : 'No'}
                  {orgCheckResult.email && <><br />Email: {orgCheckResult.email}</>}
                </p>
              </div>
            )}

            {(orgConnectStatus === 'error' || orgCheckStatus === 'error') && (orgConnectResult?.error || orgCheckResult?.error) && (
              <div style={{ background: '#fff0f0', border: '1px solid #f0b0b0', borderRadius: 12, padding: 20, color: '#c0392b', fontSize: 14 }}>
                {orgConnectResult?.error || orgCheckResult?.error}
              </div>
            )}
          </div>
        )}

        {/* ── INCENTIVES TAB ── */}
        {activeTab === 'incentives' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 22, color: C.dusk, margin: '0 0 6px' }}>Subscriber Incentive Contracts</h2>
              <p style={{ fontSize: 13, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
                Vendor partnerships that power subscriber welcome gifts — cookies, discounts, free tastings. Each contract links a vendor to a newsletter episode run and tracks their Google review URL.
              </p>
            </div>

            {/* Tier reference cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { tier: 'Single Drop', episodes: '1 issue', price: '$49', desc: 'One-shot welcome gift — test the waters' },
                { tier: '4-Episode', episodes: '4 issues', price: '$149', desc: 'One month of subscriber welcome drops' },
                { tier: 'Season Run', episodes: '12 issues', price: '$399', desc: 'Full season · best ROI for the vendor', badge: 'Best Value' },
              ].map(t => (
                <div key={t.tier} style={{ background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 10, padding: '16px 14px', position: 'relative' }}>
                  {t.badge && <span style={{ position: 'absolute', top: -8, right: 10, background: C.sunset, color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 10 }}>{t.badge}</span>}
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, marginBottom: 4, fontFamily: 'Libre Franklin, sans-serif' }}>{t.episodes}</div>
                  <div style={{ fontFamily: 'Libre Baskerville, serif', fontSize: 18, color: C.dusk, marginBottom: 2 }}>{t.tier}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.sunset, marginBottom: 6, fontFamily: 'Libre Franklin, sans-serif' }}>{t.price}</div>
                  <div style={{ fontSize: 12, color: C.textLight, lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              ))}
            </div>

            {/* New Contract Form */}
            <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 12, padding: 28, marginBottom: 28 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 15, marginBottom: 20, fontFamily: 'Libre Franklin, sans-serif' }}>New Contract</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Vendor name + Place lookup */}
                <div>
                  <label style={labelStyle}>Vendor Name *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="e.g. Blackbird Cafe & Baking Company"
                      value={contractForm.vendorName}
                      onChange={e => { setContractForm(f => ({ ...f, vendorName: e.target.value })); setPlaceLookupStatus('idle'); setPlaceLookupResult(null); }}
                    />
                    <button
                      onClick={handlePlaceLookup}
                      disabled={placeLookupStatus === 'loading' || !contractForm.vendorName.trim()}
                      style={{
                        padding: '10px 14px', background: placeLookupStatus === 'found' ? C.sage : C.lakeBlue,
                        color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700,
                        cursor: (placeLookupStatus === 'loading' || !contractForm.vendorName.trim()) ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap', fontFamily: 'Libre Franklin, sans-serif', flexShrink: 0,
                      }}
                    >
                      {placeLookupStatus === 'loading' ? 'Looking…' : placeLookupStatus === 'found' ? '✓ Found' : '🔍 Lookup on Google'}
                    </button>
                  </div>
                  {placeLookupStatus === 'found' && placeLookupResult && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#f0fff4', border: '1px solid #90d0a0', borderRadius: 8, fontSize: 12, color: '#1a5c2a' }}>
                      ✓ <strong>{placeLookupResult.name}</strong> — {placeLookupResult.formattedAddress}<br />
                      Place ID: <code style={{ background: '#fff', padding: '1px 5px', borderRadius: 3 }}>{placeLookupResult.placeId}</code>
                    </div>
                  )}
                  {(placeLookupStatus === 'notfound' || placeLookupStatus === 'error') && placeLookupResult?.error && (
                    <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff8e0', border: '1px solid #e0d090', borderRadius: 8, fontSize: 12, color: '#7a5c00' }}>
                      ⚠️ {placeLookupResult.error} — you can still enter the Review URL manually below.
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>City / Location</label>
                    <input style={inputStyle} placeholder="Manitou Beach, Michigan" value={contractForm.city} onChange={e => setContractForm(f => ({ ...f, city: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Contract Tier *</label>
                    <select style={inputStyle} value={contractForm.tier} onChange={e => setContractForm(f => ({ ...f, tier: e.target.value }))}>
                      <option value="Single Drop">Single Drop — 1 issue · $49</option>
                      <option value="4-Episode">4-Episode — 4 issues · $149</option>
                      <option value="Season Run">Season Run — 12 issues · $399</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Offer Text</label>
                  <input style={inputStyle} placeholder="e.g. Free cookie with any purchase — show this screen to your barista" value={contractForm.offerText} onChange={e => setContractForm(f => ({ ...f, offerText: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Contact Email</label>
                    <input type="email" style={inputStyle} placeholder="vendor@email.com" value={contractForm.contactEmail} onChange={e => setContractForm(f => ({ ...f, contactEmail: e.target.value }))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Redemptions</label>
                    <input type="number" style={inputStyle} placeholder="leave blank = unlimited" value={contractForm.redemptionCap} onChange={e => setContractForm(f => ({ ...f, redemptionCap: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Google Review URL <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: C.textMuted }}>(auto-filled by lookup, or paste manually)</span></label>
                  <input style={inputStyle} placeholder="https://search.google.com/local/writereview?placeid=..." value={contractForm.reviewUrl} onChange={e => setContractForm(f => ({ ...f, reviewUrl: e.target.value }))} />
                </div>

                <button
                  onClick={handleContractSubmit}
                  disabled={contractFormStatus === 'saving' || !contractForm.vendorName.trim() || !contractForm.tier}
                  style={{
                    padding: '13px 0', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                    background: contractFormStatus === 'saved' ? C.sage : contractFormStatus === 'error' ? C.sunset : C.dusk,
                    color: '#fff', cursor: (contractFormStatus === 'saving' || !contractForm.vendorName.trim()) ? 'not-allowed' : 'pointer',
                    fontFamily: 'Libre Franklin, sans-serif', transition: 'background 0.2s',
                  }}
                >
                  {contractFormStatus === 'saving' ? 'Saving…' : contractFormStatus === 'saved' ? '✓ Contract saved' : contractFormStatus === 'error' ? 'Save failed — retry' : 'Save Contract →'}
                </button>
                {contractFormStatus === 'error' && contractFormError && (
                  <p style={{ margin: 0, fontSize: 12, color: C.sunset }}>{contractFormError}</p>
                )}
                {contractsUnconfigured && (
                  <div style={{ padding: '10px 14px', background: '#fff8e0', border: '1px solid #e0d090', borderRadius: 8, fontSize: 12, color: '#7a5c00', lineHeight: 1.6 }}>
                    ⚠️ <strong>NOTION_DB_INCENTIVE_CONTRACTS</strong> not set. Contracts won't save until you create the Notion DB and add the env var in Vercel.
                  </div>
                )}
              </div>
            </div>

            {/* Contract Queue */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: C.dusk, fontSize: 15 }}>Contract Queue</div>
                <button onClick={fetchContracts} style={{ fontSize: 12, color: C.lakeBlue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>↻ Refresh</button>
              </div>

              {contractsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontSize: 13 }}>Loading contracts…</div>
              ) : contracts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontSize: 13, background: C.warmWhite, borderRadius: 10, border: `1px dashed ${C.sand}` }}>
                  No contracts yet — add one above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {contracts.map(c => {
                    const statusColor = c.status === 'Active' ? '#1a5c2a' : c.status === 'Expired' ? '#7a7a7a' : '#5c4a00';
                    const statusBg = c.status === 'Active' ? '#f0fff4' : c.status === 'Expired' ? '#f5f5f5' : '#fff8e0';
                    const statusBorder = c.status === 'Active' ? '#90d0a0' : c.status === 'Expired' ? '#ddd' : '#e0d090';
                    return (
                      <div key={c.id} style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 10, padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: C.dusk, fontSize: 15, marginBottom: 2 }}>{c.vendorName}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6 }}>
                              {c.tier} · {c.issuesRemaining != null ? `${c.issuesRemaining} issues remaining` : ''} {c.city ? `· ${c.city}` : ''}
                            </div>
                            {c.offerText && <div style={{ fontSize: 13, color: C.textLight, marginBottom: 6, fontStyle: 'italic' }}>"{c.offerText}"</div>}
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: C.textMuted }}>
                              {c.contactEmail && <span>✉️ {c.contactEmail}</span>}
                              {c.redemptionCap && <span>🎟️ Cap: {c.redemptionCap}</span>}
                              {c.reviewUrl && <a href={c.reviewUrl} target="_blank" rel="noreferrer" style={{ color: C.lakeBlue, textDecoration: 'none' }}>Review link ↗</a>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {c.status}
                            </span>
                            {c.status === 'Queued' && (
                              <button
                                onClick={() => updateContractStatus(c.id, 'Active')}
                                disabled={!!contractStatusUpdating[c.id]}
                                style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: C.sage, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                              >
                                {contractStatusUpdating[c.id] === 'Active' ? '…' : 'Activate'}
                              </button>
                            )}
                            {c.status === 'Active' && (
                              <button
                                onClick={() => updateContractStatus(c.id, 'Expired')}
                                disabled={!!contractStatusUpdating[c.id]}
                                style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 8, background: 'transparent', color: C.textMuted, border: `1px solid ${C.sand}`, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
                              >
                                {contractStatusUpdating[c.id] === 'Expired' ? '…' : 'Expire'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Setup instructions */}
            <div style={{ marginTop: 28, padding: '16px 20px', background: C.warmWhite, border: `1px solid ${C.sand}`, borderRadius: 10, fontSize: 12, color: C.textLight, lineHeight: 1.7 }}>
              <strong style={{ color: C.dusk }}>Setup checklist:</strong><br />
              1. Create a Notion DB with properties: Name (title), Offer Text (rich text), Contract Tier (select), Status (select: Queued/Active/Expired), Contact Email, Review URL, City, Redemption Cap (number), Issues Remaining (number), Created At (date).<br />
              2. Add <code style={{ background: '#fff', padding: '1px 4px', borderRadius: 3 }}>NOTION_DB_INCENTIVE_CONTRACTS</code> to Vercel env vars.<br />
              3. Add <code style={{ background: '#fff', padding: '1px 4px', borderRadius: 3 }}>GOOGLE_PLACES_API_KEY</code> to Vercel env vars (enable Places API on the key in Google Cloud Console).
            </div>
          </div>
        )}

        {/* ── Categories ── */}
        {activeTab === 'categories' && (
          <div>
            <div style={{ fontFamily: 'Libre Franklin, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: C.textMuted, marginBottom: 20 }}>Local Guide — Category Monitor</div>

            {/* Live preview */}
            <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontWeight: 700, color: C.dusk, fontSize: 15, fontFamily: 'Libre Franklin, sans-serif' }}>Current Notion Categories</div>
                <button onClick={loadCatPreview} style={{ padding: '7px 16px', background: C.lakeBlue, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}>Refresh</button>
              </div>

              {!catPreview && (
                <div style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>Click Refresh to load the current state from Notion.</div>
              )}

              {catPreview && !catPreview.hasOther && catPreview.unknownCategories?.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.sage, fontFamily: 'Libre Franklin, sans-serif' }}>
                  <span>✓</span> All categories are mapped. No action needed.
                </div>
              )}

              {catPreview?.hasOther && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fff8e0', border: '1px solid #e0d090', borderRadius: 8, padding: '12px 16px', marginBottom: 12, fontFamily: 'Libre Franklin, sans-serif', fontSize: 13 }}>
                  <span>⚠️</span>
                  <div>
                    <strong>"Other"</strong> is in use — a business is uncategorized. Open Notion, find it, and assign a proper category name.
                  </div>
                </div>
              )}

              {catPreview?.unknownCategories?.map(cat => (
                <div key={cat} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#f0f4ff', border: '1px solid #c0cdf0', borderRadius: 8, padding: '12px 16px', marginBottom: 10, fontFamily: 'Libre Franklin, sans-serif', fontSize: 13 }}>
                  <span>🗂️</span>
                  <div>
                    <strong>"{cat}"</strong> — new category detected. Showing on Local Guide with a placeholder icon.
                    <div style={{ marginTop: 4, color: C.textMuted, fontSize: 12 }}>
                      To add a real icon: drop <code style={{ background: '#e8edf8', padding: '1px 5px', borderRadius: 3 }}>/images/icons/{cat.toLowerCase().replace(/\s+/g, '-')}-icon-dark.png</code> into the repo, then add it to <code style={{ background: '#e8edf8', padding: '1px 5px', borderRadius: 3 }}>discover.js → DISCOVER_DYNAMIC_CAT_ICONS</code>.
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync & notify */}
            <div style={{ background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontWeight: 700, color: C.dusk, fontSize: 15, fontFamily: 'Libre Franklin, sans-serif', marginBottom: 8 }}>Send Sync Report by Email</div>
              <p style={{ fontSize: 13, color: C.textMuted, fontFamily: 'Libre Franklin, sans-serif', margin: '0 0 16px 0' }}>
                Emails a summary of all unmapped and "Other" categories to <strong>daryl@yetigroove.com</strong>. Use this when you want a reminder with the exact steps to fix each one.
              </p>
              <button
                onClick={runCatSync}
                disabled={catSyncStatus === 'loading'}
                style={{ padding: '10px 24px', background: catSyncStatus === 'loading' ? C.textMuted : C.dusk, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: catSyncStatus === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'Libre Franklin, sans-serif' }}
              >
                {catSyncStatus === 'loading' ? 'Sending…' : 'Sync & Send Report'}
              </button>
              {catSyncStatus === 'done' && catSyncResult && (
                <div style={{ marginTop: 12, fontSize: 13, color: catSyncResult.emailSent ? C.sage : C.textMuted, fontFamily: 'Libre Franklin, sans-serif' }}>
                  {catSyncResult.emailSent ? `✓ Report sent — ${(catSyncResult.unknown?.length || 0) + (catSyncResult.hasOther ? 1 : 0)} item(s) flagged.` : `✓ ${catSyncResult.message}`}
                </div>
              )}
              {catSyncStatus === 'error' && catSyncResult?.error && (
                <div style={{ marginTop: 12, fontSize: 13, color: '#c05a5a', fontFamily: 'Libre Franklin, sans-serif' }}>Error: {catSyncResult.error}</div>
              )}
            </div>
          </div>
        )}

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
