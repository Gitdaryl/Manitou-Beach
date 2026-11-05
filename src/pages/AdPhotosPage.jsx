import React, { useEffect, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { GlobalStyles, Navbar, Footer } from '../components/Layout';
import SEOHead from '../components/SEOHead';
import { C } from '../data/config';
import {
  CONSENT_OWNERSHIP,
  CONSENT_USE,
  CONSENT_VERSION,
  IMAGE_TYPES,
  MAX_FILE_BYTES,
  MAX_FILE_MB,
  MAX_PHOTOS,
  MONTHS,
  TEXT_LIMITS,
} from '../data/adIntake';

// ============================================================
// 📸  AD PHOTOS  (/ad-photos): logo, photos and scheduling facts
// ------------------------------------------------------------
// Opened from a signed personal link (?slug=&t=) or by an owner who
// already holds a claim token in this browser. Not linked from any
// menu. Files stay on the phone until Send, so nothing leaves before
// both consent boxes are ticked, and they go up as untouched originals.
// ============================================================

const SANS = "'Libre Franklin', sans-serif";
const SERIF = "'Libre Baskerville', serif";
const CONTACT_EMAIL = 'hello@manitoubeachmichigan.com';
const STALL_MS = 90000;

const CARD = {
  background: '#fff', border: `1px solid ${C.sand}`, borderRadius: 14,
  padding: '20px 16px', marginBottom: 16,
};
const H2 = { fontFamily: SERIF, fontSize: 20, lineHeight: '26px', fontWeight: 400, color: C.dusk, margin: '0 0 4px' };
const HINT = { fontSize: 15, lineHeight: '21px', color: C.textLight, margin: '0 0 12px' };
const QUESTION = { display: 'block', fontSize: 17, lineHeight: '22px', fontWeight: 600, color: C.text, margin: '0 0 4px' };
const FIELD = {
  width: '100%', minHeight: 48, padding: '12px 14px', borderRadius: 10, boxSizing: 'border-box',
  border: `1.5px solid ${C.warmGray}`, background: '#fff', color: C.text,
  fontFamily: SANS, fontSize: 17, lineHeight: '22px',
};
const ERROR = { fontSize: 15, lineHeight: '21px', color: '#A32A1C', fontWeight: 600, margin: '8px 0 0' };
const PRIMARY = {
  width: '100%', minHeight: 52, borderRadius: 14, border: 'none', cursor: 'pointer',
  background: C.sageDark, color: '#fff', fontFamily: SANS, fontSize: 17, fontWeight: 700,
};
const SECONDARY = {
  width: '100%', minHeight: 50, borderRadius: 14, cursor: 'pointer',
  background: '#fff', color: C.sageDark, border: `1.5px solid ${C.sageDark}`,
  fontFamily: SANS, fontSize: 17, fontWeight: 600,
};

function fileExt(file) {
  const fromName = /\.([a-z0-9]+)$/i.exec(file.name || '')?.[1]?.toLowerCase();
  if (IMAGE_TYPES[fromName]) return fromName;
  return Object.keys(IMAGE_TYPES).find((ext) => IMAGE_TYPES[ext] === file.type) || null;
}

function storedClaimToken(slug) {
  try {
    return localStorage.getItem(`mb-claim-${slug}`);
  } catch {
    return null;
  }
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        minHeight: 44, minWidth: 0, padding: '0 6px', borderRadius: 10, cursor: 'pointer',
        border: `1.5px solid ${selected ? C.lakeDark : C.warmGray}`,
        background: selected ? C.lakeDark : '#fff', color: selected ? '#fff' : C.text,
        fontFamily: SANS, fontSize: 16, fontWeight: selected ? 700 : 500,
      }}
    >
      {selected ? '✓ ' : ''}{children}
    </button>
  );
}

function MonthChips({ label, months, onChange }) {
  const toggle = (m) => onChange(months.includes(m) ? months.filter((x) => x !== m) : [...months, m]);
  return (
    <div className="adp-months" role="group" aria-label={label}>
      {MONTHS.map((name, i) => (
        <Chip key={name} selected={months.includes(i + 1)} onClick={() => toggle(i + 1)}>{name}</Chip>
      ))}
    </div>
  );
}

function CheckRow({ checked, onChange, disabled, children }) {
  return (
    <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', minHeight: 44, boxSizing: 'border-box', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 24, height: 24, margin: 0, flexShrink: 0, accentColor: C.sageDark }}
      />
      <span style={{ fontSize: 17, lineHeight: '24px', color: C.text }}>{children}</span>
    </label>
  );
}

function FileTile({ item, onRemove, onRetry, sending, canRetry, contain }) {
  const [broken, setBroken] = useState(false); // HEIC previews only work in Safari
  const failed = item.status === 'failed';
  return (
    <div>
      <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: C.warmWhite, border: `1px solid ${C.sand}` }}>
        {broken ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, textAlign: 'center', fontSize: 14, lineHeight: '19px', color: C.textLight, overflowWrap: 'anywhere' }}>
            {item.file.name}
          </div>
        ) : (
          <img
            src={item.preview}
            alt={`Preview of ${item.file.name}`}
            onError={() => setBroken(true)}
            style={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', display: 'block' }}
          />
        )}
        {!sending && item.status !== 'uploading' && (
          <button
            type="button"
            aria-label={`Remove ${item.file.name}`}
            onClick={() => onRemove(item.id)}
            style={{ position: 'absolute', top: 0, right: 0, width: 44, height: 44, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'rgba(26,40,48,0.78)', color: '#fff', fontSize: 18, lineHeight: 1 }}>×</span>
          </button>
        )}
        {item.status === 'uploading' && (
          <div role="progressbar" aria-label={`Sending ${item.file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(item.pct)} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, background: 'rgba(26,40,48,0.35)' }}>
            <div style={{ height: '100%', width: `${item.pct}%`, background: C.sage }} />
          </div>
        )}
        {item.status === 'done' && (
          <span style={{ position: 'absolute', left: 8, bottom: 8, padding: '2px 8px', borderRadius: 8, background: C.sageDark, color: '#fff', fontSize: 14, fontWeight: 700 }}>✓ Sent</span>
        )}
      </div>
      {failed && (
        <div style={{ marginTop: 6 }}>
          <p style={{ ...ERROR, margin: '0 0 6px' }}>That one didn't send.</p>
          <button type="button" disabled={sending || !canRetry} onClick={() => onRetry(item.id)} style={{ ...SECONDARY, minHeight: 44, fontSize: 16 }}>Try again</button>
        </div>
      )}
    </div>
  );
}

export default function AdPhotosPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || '';
  const token = params.get('t') || (slug ? storedClaimToken(slug) : null);

  const [phase, setPhase] = useState('checking'); // checking | bad | down | form | done
  const [link, setLink] = useState(null);         // { business, pageId, uploadPrefix }
  const [attempt, setAttempt] = useState(0);

  const [items, setItems] = useState([]);         // { id, kind, file, preview, status, pct, url }
  const itemsRef = useRef([]);
  const nextId = useRef(1);
  const logoInput = useRef(null);
  const photoInput = useRef(null);

  const [noLogo, setNoLogo] = useState(false);
  const [openAllYear, setOpenAllYear] = useState(null);
  const [closedMonths, setClosedMonths] = useState([]);
  const [bestMonths, setBestMonths] = useState([]);
  const [specialDays, setSpecialDays] = useState('');
  const [knownFor, setKnownFor] = useState('');
  const [leaveOut, setLeaveOut] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consentOwnership, setConsentOwnership] = useState(false);
  const [consentUse, setConsentUse] = useState(false);

  const [sending, setSending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fileNotes, setFileNotes] = useState({ logo: '', photo: '' });
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (!slug || !token) { setPhase('bad'); return undefined; }
    let alive = true;
    setPhase('checking');
    fetch('/api/ad-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', slug, t: token }),
    })
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 403) { setPhase('bad'); return; }
        const data = await res.json();
        if (!res.ok || !data.ok) { setPhase('down'); return; }
        setLink(data);
        setPhase('form');
      })
      .catch(() => { if (alive) setPhase('down'); });
    return () => { alive = false; };
  }, [slug, token, attempt]);

  useEffect(() => () => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
  }, []);

  const commit = (next) => {
    itemsRef.current = next;
    setItems(next);
  };
  const patch = (id, changes) => commit(itemsRef.current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  const removeItem = (id) => {
    const gone = itemsRef.current.find((item) => item.id === id);
    if (gone) URL.revokeObjectURL(gone.preview);
    commit(itemsRef.current.filter((item) => item.id !== id));
  };

  const makeItem = (file, kind) => ({
    id: nextId.current++, kind, file, preview: URL.createObjectURL(file), status: 'ready', pct: 0, url: null,
  });

  const problemWith = (file) => {
    if (!fileExt(file)) return `${file.name} isn't a photo we can use. JPG, PNG, WebP or HEIC work.`;
    if (file.size > MAX_FILE_BYTES) return `${file.name} is over ${MAX_FILE_MB} MB.`;
    return '';
  };

  const pickLogo = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const problem = problemWith(file);
    setFileNotes((n) => ({ ...n, logo: problem }));
    if (problem) return;
    itemsRef.current.filter((item) => item.kind === 'logo').forEach((item) => removeItem(item.id));
    commit([...itemsRef.current, makeItem(file, 'logo')]);
    setFieldErrors((f) => ({ ...f, logo: '' }));
  };

  const pickPhotos = (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    const notes = [];
    const room = MAX_PHOTOS - itemsRef.current.filter((item) => item.kind === 'photo').length;
    const good = files.filter((file) => {
      const problem = problemWith(file);
      if (problem) notes.push(problem);
      return !problem;
    });
    if (good.length > room) notes.push(`We can take up to ${MAX_PHOTOS} photos, so we kept the first ${MAX_PHOTOS}.`);
    setFileNotes((n) => ({ ...n, photo: notes.join(' ') }));
    commit([...itemsRef.current, ...good.slice(0, Math.max(room, 0)).map((file) => makeItem(file, 'photo'))]);
  };

  const uploadItem = async (item) => {
    patch(item.id, { status: 'uploading', pct: 0 });
    const ext = fileExt(item.file);
    const id = Math.random().toString(36).slice(2, 12).padEnd(6, '0');

    // The SDK quietly retries a lost connection for many minutes. Give up on a
    // file that has gone silent so the owner sees Try again instead of a stuck page.
    const controller = new AbortController();
    let timer;
    let giveUp;
    const stalled = new Promise((_, reject) => { giveUp = reject; });
    const keepAlive = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { controller.abort(); giveUp(new Error('stalled')); }, STALL_MS);
    };
    keepAlive();

    try {
      const blob = await Promise.race([stalled, upload(`${link.uploadPrefix}/${item.kind}-${id}.${ext}`, item.file, {
        access: 'public',
        contentType: IMAGE_TYPES[ext],
        handleUploadUrl: '/api/ad-upload',
        abortSignal: controller.signal,
        clientPayload: JSON.stringify({
          pageId: link.pageId, t: token, consentVersion: CONSENT_VERSION, consentOwnership, consentUse, size: item.file.size,
        }),
        onUploadProgress: ({ percentage }) => {
          keepAlive();
          patch(item.id, { pct: percentage });
        },
      })]);
      patch(item.id, { status: 'done', pct: 100, url: blob.url });
    } catch (err) {
      console.warn('ad photo upload failed:', err.message);
      patch(item.id, { status: 'failed', pct: 0 });
    } finally {
      clearTimeout(timer);
    }
  };

  const retryItem = (id) => {
    const item = itemsRef.current.find((x) => x.id === id);
    if (item) uploadItem(item);
  };

  const validate = () => {
    const errors = {};
    if (!noLogo && !itemsRef.current.some((item) => item.kind === 'logo')) {
      errors.logo = 'Please add your logo, or tick the box if you don\'t have one yet.';
    }
    if (!name.trim()) errors.name = 'Please add your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please check your email address.';
    setFieldErrors(errors);
    const first = ['logo', 'name', 'email'].find((key) => errors[key]);
    if (first) document.getElementById(`adp-${first}`)?.scrollIntoView({ block: 'center' });
    return !first;
  };

  const send = async (e) => {
    e.preventDefault();
    if (sending || !consentOwnership || !consentUse) return;
    setSendError('');
    if (!validate()) return;

    setSending(true);
    const queue = itemsRef.current.filter((item) => item.status !== 'done');
    let next = 0;
    const worker = async () => {
      while (next < queue.length) await uploadItem(queue[next++]);
    };
    await Promise.all([worker(), worker()]);

    const failed = itemsRef.current.filter((item) => item.status !== 'done').length;
    if (failed) {
      setSending(false);
      setSendError(`${failed === 1 ? 'One file' : `${failed} files`} didn't send, usually a weak signal. Everything else is safe. Tap Send to try again, or remove ${failed === 1 ? 'it' : 'them'}.`);
      return;
    }

    try {
      const res = await fetch('/api/ad-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          slug,
          t: token,
          name,
          email,
          consentVersion: CONSENT_VERSION,
          consentOwnership,
          consentUse,
          noLogo,
          logoUrl: itemsRef.current.find((item) => item.kind === 'logo')?.url || null,
          photoUrls: itemsRef.current.filter((item) => item.kind === 'photo').map((item) => item.url),
          openAllYear,
          closedMonths: openAllYear === false ? closedMonths : [],
          bestMonths,
          specialDays,
          knownFor,
          leaveOut,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error === 'invalid-link' ? 'This link has stopped working. Please get in touch.' : data.error);
      setPhase('done');
      window.scrollTo(0, 0);
    } catch (err) {
      setSendError(err.message && err.name !== 'TypeError' ? err.message : 'We could not reach the site. Your form is safe, please try again.');
    } finally {
      setSending(false);
    }
  };

  const shell = (children) => (
    <div className="adp" style={{ fontFamily: SANS, background: C.cream, color: C.text, minHeight: '100dvh' }}>
      <SEOHead title="Send us your photos" description="Add your logo and photos for your free video ads." path="/ad-photos" noindex />
      <GlobalStyles />
      <style>{`
        .adp button:disabled { cursor: not-allowed; }
        .adp button:active:not(:disabled) { opacity: 0.75; }
        .adp :focus-visible { outline: 3px solid ${C.lakeBlue}; outline-offset: 2px; }
        .adp-months { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
        .adp-tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
        @media (min-width: 600px) {
          .adp-months { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .adp-tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '112px max(16px, env(safe-area-inset-right)) 56px max(16px, env(safe-area-inset-left))', boxSizing: 'border-box' }}>
        {children}
      </main>
      <Footer scrollTo={subScrollTo} />
    </div>
  );

  const notice = (title, body, action) => shell(
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 28, lineHeight: '36px', fontWeight: 400, color: C.dusk, margin: '0 0 12px' }}>{title}</h1>
      <p style={{ fontSize: 17, lineHeight: '26px', color: C.textLight, margin: '0 0 24px' }}>{body}</p>
      {action}
    </div>
  );

  const mailLink = <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: C.lakeDark, overflowWrap: 'anywhere' }}>{CONTACT_EMAIL}</a>;

  if (phase === 'checking') return notice('One moment', 'Checking your link.');

  if (phase === 'bad') {
    return notice(
      'We can\'t open this link',
      <>It may be missing a piece, or it got cut off when it was copied. Try tapping the link in your message again. Still stuck? Email {mailLink} and we'll sort it out.</>
    );
  }

  if (phase === 'down') {
    return notice(
      'We can\'t reach the site right now',
      'Nothing is wrong with your link. Give it a minute and try again.',
      <button type="button" onClick={() => setAttempt((a) => a + 1)} style={{ ...PRIMARY, maxWidth: 280 }}>Try again</button>
    );
  }

  if (phase === 'done') {
    return notice(
      'Got it, thank you!',
      <>Everything from {link.business} is safe with us. We'll take it from here. Questions or second thoughts? Email {mailLink}.</>,
      <button type="button" onClick={() => window.location.reload()} style={{ ...SECONDARY, maxWidth: 280 }}>Send more photos</button>
    );
  }

  const logoItem = items.find((item) => item.kind === 'logo');
  const photoItems = items.filter((item) => item.kind === 'photo');
  const bothTicked = consentOwnership && consentUse;
  const doneCount = items.filter((item) => item.status === 'done').length;

  return shell(
    <form onSubmit={send} noValidate>
      <header style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.sageDark, margin: '0 0 6px' }}>Free video ads</p>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(26px, 6vw, 34px)', lineHeight: 1.2, fontWeight: 400, color: C.dusk, margin: '0 0 8px' }}>Send us your photos</h1>
        <p style={{ fontSize: 17, lineHeight: '24px', fontWeight: 600, color: C.text, margin: '0 0 8px', overflowWrap: 'anywhere' }}>For {link.business}</p>
        <p style={{ fontSize: 17, lineHeight: '25px', color: C.textLight, margin: 0 }}>
          The best ads start with real pictures. Add your logo and up to {MAX_PHOTOS} photos, answer a few quick questions, and we'll do the rest.
        </p>
      </header>

      <section style={CARD} id="adp-logo">
        <h2 style={H2}>Your logo</h2>
        <p style={HINT}>The clearest copy you have.</p>
        <input ref={logoInput} type="file" accept="image/*,.heic,.heif" onChange={pickLogo} hidden />
        {logoItem && (
          <div style={{ maxWidth: 180, marginBottom: 12 }}>
            <FileTile item={logoItem} onRemove={removeItem} onRetry={retryItem} sending={sending} canRetry={bothTicked} contain />
          </div>
        )}
        {!noLogo && (
          <button type="button" disabled={sending} onClick={() => logoInput.current?.click()} style={SECONDARY}>
            {logoItem ? 'Choose a different logo' : 'Add your logo'}
          </button>
        )}
        <CheckRow
          checked={noLogo}
          disabled={sending}
          onChange={(on) => {
            setNoLogo(on);
            if (on && logoItem) removeItem(logoItem.id);
            setFieldErrors((f) => ({ ...f, logo: '' }));
          }}
        >
          I don't have a logo yet
        </CheckRow>
        {fileNotes.logo && <p role="alert" style={ERROR}>{fileNotes.logo}</p>}
        {fieldErrors.logo && <p role="alert" style={ERROR}>{fieldErrors.logo}</p>}
      </section>

      <section style={CARD}>
        <h2 style={H2}>Your photos</h2>
        <p style={HINT}>Your place, your people at work, your best product. Phone photos are fine.</p>
        <input ref={photoInput} type="file" accept="image/*,.heic,.heif" multiple onChange={pickPhotos} hidden />
        {photoItems.length > 0 && (
          <div className="adp-tiles">
            {photoItems.map((item) => (
              <FileTile key={item.id} item={item} onRemove={removeItem} onRetry={retryItem} sending={sending} canRetry={bothTicked} />
            ))}
          </div>
        )}
        <button type="button" disabled={sending || photoItems.length >= MAX_PHOTOS} onClick={() => photoInput.current?.click()} style={{ ...SECONDARY, opacity: photoItems.length >= MAX_PHOTOS ? 0.6 : 1 }}>
          {photoItems.length >= MAX_PHOTOS ? `That's all ${MAX_PHOTOS}` : photoItems.length ? `Add more (${photoItems.length} of ${MAX_PHOTOS})` : 'Add photos'}
        </button>
        {fileNotes.photo && <p role="alert" style={ERROR}>{fileNotes.photo}</p>}
      </section>

      <section style={CARD}>
        <h2 style={{ ...H2, marginBottom: 14 }}>Your year</h2>

        <span style={QUESTION}>Open all year?</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 8 }}>
          <Chip selected={openAllYear === true} onClick={() => setOpenAllYear(openAllYear === true ? null : true)}>Yes</Chip>
          <Chip selected={openAllYear === false} onClick={() => setOpenAllYear(openAllYear === false ? null : false)}>No</Chip>
        </div>
        {openAllYear === false && (
          <div style={{ marginTop: 12 }}>
            <p style={HINT}>Tick the months you're closed.</p>
            <MonthChips label="Months you're closed" months={closedMonths} onChange={setClosedMonths} />
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <span style={QUESTION}>When do you most want customers to hear from you?</span>
          <p style={HINT}>Like docks in spring and fall, or snow removal in winter.</p>
          <MonthChips label="Best months" months={bestMonths} onChange={setBestMonths} />
        </div>

        <div style={{ marginTop: 24 }}>
          <label htmlFor="adp-special" style={QUESTION}>Any dates we should know about?</label>
          <p style={HINT}>Opening day, anniversary, holiday hours, a yearly sale.</p>
          <textarea id="adp-special" rows={3} maxLength={TEXT_LIMITS.specialDays} value={specialDays} onChange={(e) => setSpecialDays(e.target.value)} style={{ ...FIELD, resize: 'vertical' }} />
        </div>
      </section>

      <section style={CARD}>
        <h2 style={{ ...H2, marginBottom: 14 }}>Your business</h2>
        <label htmlFor="adp-known" style={QUESTION}>What are you best known for?</label>
        <p style={HINT}>One or two lines.</p>
        <textarea id="adp-known" rows={2} maxLength={TEXT_LIMITS.knownFor} value={knownFor} onChange={(e) => setKnownFor(e.target.value)} style={{ ...FIELD, resize: 'vertical' }} />

        <div style={{ marginTop: 24 }}>
          <label htmlFor="adp-leave" style={{ ...QUESTION, marginBottom: 8 }}>Anything we should never say or show?</label>
          <textarea id="adp-leave" rows={2} maxLength={TEXT_LIMITS.leaveOut} value={leaveOut} onChange={(e) => setLeaveOut(e.target.value)} style={{ ...FIELD, resize: 'vertical' }} />
        </div>
      </section>

      <section style={CARD}>
        <h2 style={{ ...H2, marginBottom: 14 }}>About you</h2>
        <label htmlFor="adp-name" style={{ ...QUESTION, marginBottom: 8 }}>Your name</label>
        <input id="adp-name" type="text" autoComplete="name" maxLength={TEXT_LIMITS.name} placeholder="Your name" value={name} onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: '' })); }} style={FIELD} />
        {fieldErrors.name && <p role="alert" style={ERROR}>{fieldErrors.name}</p>}

        <label htmlFor="adp-email" style={{ ...QUESTION, margin: '20px 0 8px' }}>Your email</label>
        <input id="adp-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" maxLength={TEXT_LIMITS.email} placeholder="Your email" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((f) => ({ ...f, email: '' })); }} style={FIELD} />
        {fieldErrors.email && <p role="alert" style={ERROR}>{fieldErrors.email}</p>}
      </section>

      <section style={CARD}>
        <h2 style={{ ...H2, marginBottom: 8 }}>Your OK</h2>
        <CheckRow checked={consentOwnership} disabled={sending} onChange={setConsentOwnership}>{CONSENT_OWNERSHIP}</CheckRow>
        <CheckRow checked={consentUse} disabled={sending} onChange={setConsentUse}>{CONSENT_USE}</CheckRow>
        <p style={{ ...HINT, margin: '8px 0 0' }}>
          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: C.lakeDark, display: 'inline-block', padding: '12px 0' }}>Read our Terms</a>
        </p>
      </section>

      <button type="submit" disabled={!bothTicked || sending} style={{ ...PRIMARY, background: bothTicked ? C.sageDark : C.warmGray, opacity: sending ? 0.75 : 1 }}>
        {sending ? 'Sending…' : 'Send'}
      </button>
      {!bothTicked && (
        <p style={{ ...HINT, margin: '10px 0 0', textAlign: 'center' }}>
          Tick both boxes above to send. We can't use your photos without your OK.
        </p>
      )}
      {sending && items.length > 0 && (
        <p aria-live="polite" style={{ ...HINT, margin: '10px 0 0', textAlign: 'center' }}>
          {doneCount} of {items.length} sent. Please keep this page open.
        </p>
      )}
      {sendError && <p role="alert" style={{ ...ERROR, textAlign: 'center' }}>{sendError}</p>}
    </form>
  );
}
