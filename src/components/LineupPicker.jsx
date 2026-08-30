// "Who else is going to be there?" - the lineup on any event.
//
// Two jobs at once. For the organizer it makes their listing look as busy as their
// event actually is. For us it names the businesses working the event: the ones we
// already have get matched to a slug, and the ones we don't are the leads.
//
// Matching is a suggestion, never an assumption. Picking from the list sets a slug;
// typing a name we don't know keeps the slug blank and that is a perfectly good
// outcome, not an error state. Nothing here contacts anybody.

import React, { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  {
    key: 'trucks',
    label: 'Food trucks',
    // The only category with a directory behind it today, so the only one that suggests.
    directory: '/api/food-trucks',
    placeholder: 'Start typing a truck name…',
    hint: 'Type any truck. If we already know them we\'ll match them up.',
  },
  {
    key: 'entertainment',
    label: 'Live music or entertainment',
    directory: null,
    placeholder: 'Band, DJ, performer…',
    hint: '',
  },
  {
    key: 'vendors',
    label: 'Other vendors or makers',
    directory: null,
    placeholder: 'Craft, retail, artisan…',
    hint: '',
  },
];

export default function LineupPicker({ value, onChange, theme = 'dark' }) {
  const [directory, setDirectory] = useState([]);

  // One fetch for the whole picker. Failure is silent on purpose: with no directory
  // every category simply behaves like free text, which is still a usable form.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/food-trucks')
      .then(r => r.json())
      .then(d => { if (!cancelled) setDirectory((d.trucks || []).map(t => ({ name: t.name, slug: t.slug }))); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const entriesFor = key => value?.[key] || [];
  const setEntries = (key, next) => onChange({ ...(value || {}), [key]: next });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {CATEGORIES.map(cat => (
        <CategoryRow
          key={cat.key}
          cat={cat}
          theme={theme}
          directory={cat.directory ? directory : []}
          entries={entriesFor(cat.key)}
          onEntries={next => setEntries(cat.key, next)}
        />
      ))}
    </div>
  );
}

function CategoryRow({ cat, entries, onEntries, directory, theme }) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);

  const t = theme === 'dark' ? DARK : LIGHT;

  const query = draft.trim().toLowerCase();
  const taken = new Set(entries.map(e => (e.slug || e.name).toLowerCase()));
  const matches = query.length < 2 ? [] : directory
    .filter(d => d.name && d.name.toLowerCase().includes(query) && !taken.has((d.slug || d.name).toLowerCase()))
    .slice(0, 6);

  useEffect(() => {
    const onDocClick = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const add = (entry) => {
    const name = (entry.name || '').trim();
    if (!name) return;
    if (taken.has((entry.slug || name).toLowerCase())) { setDraft(''); setOpen(false); return; }
    onEntries([...entries, { name, slug: entry.slug || '', times: '' }]);
    setDraft('');
    setOpen(false);
    setHighlight(0);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' && matches.length) { e.preventDefault(); setHighlight(h => (h + 1) % matches.length); return; }
    if (e.key === 'ArrowUp' && matches.length)   { e.preventDefault(); setHighlight(h => (h - 1 + matches.length) % matches.length); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (open && matches[highlight]) add(matches[highlight]);
      else add({ name: draft });
      return;
    }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={wrapRef}>
      <label style={t.label}>
        {cat.label} <span style={t.labelSoft}>- optional</span>
      </label>

      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {entries.map((e, i) => (
            <div key={`${e.name}-${i}`} style={t.chip}>
              <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.name}
                {e.slug ? <span style={t.known} title="Already on the food truck locator">on the locator</span> : null}
              </span>
              <input
                style={t.times}
                type="text"
                maxLength={24}
                value={e.times || ''}
                placeholder="Their hours"
                aria-label={`Hours for ${e.name}`}
                onChange={ev => {
                  const next = entries.slice();
                  next[i] = { ...next[i], times: ev.target.value };
                  onEntries(next);
                }}
              />
              <button
                type="button"
                aria-label={`Remove ${e.name}`}
                onClick={() => onEntries(entries.filter((_, j) => j !== i))}
                style={t.remove}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          style={t.input}
          type="text"
          value={draft}
          placeholder={cat.placeholder}
          onChange={ev => { setDraft(ev.target.value); setOpen(true); setHighlight(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {draft.trim() && (
          <button type="button" onClick={() => add({ name: draft })} style={t.addBtn}>Add</button>
        )}

        {open && matches.length > 0 && (
          <div style={t.menu} role="listbox">
            {matches.map((m, i) => (
              <button
                key={m.slug || m.name}
                type="button"
                role="option"
                aria-selected={i === highlight}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => add(m)}
                style={{ ...t.option, ...(i === highlight ? t.optionOn : null) }}
              >
                {m.name}
                <span style={t.known}>on the locator</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {cat.hint && <div style={t.hint}>{cat.hint}</div>}
    </div>
  );
}

// The submit form sits on a dark ground, the edit form on a light one. Same component,
// two token sets, so neither page has to fight the other's styles.
const DARK = {
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 },
  labelSoft: { fontWeight: 400, textTransform: 'none', letterSpacing: 0 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 16px', paddingRight: 64, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#FAF6EF', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: 'none' },
  addBtn: { position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,132,90,0.18)', border: '1px solid rgba(212,132,90,0.4)', color: '#E8A87C', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" },
  chip: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '9px 10px 9px 13px', fontSize: 14, color: '#FAF6EF', fontFamily: "'Libre Franklin', sans-serif" },
  times: { width: 96, flexShrink: 0, boxSizing: 'border-box', padding: '7px 9px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, background: 'rgba(0,0,0,0.18)', color: '#FAF6EF', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12.5, outline: 'none' },
  remove: { flexShrink: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 14, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 },
  known: { marginLeft: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#8FA985' },
  menu: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20, background: '#22313A', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.35)' },
  option: { display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 14px', fontSize: 14, color: '#FAF6EF', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" },
  optionOn: { background: 'rgba(255,255,255,0.08)' },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 1.5 },
};

const LIGHT = {
  label: { display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#9A8E7E', marginBottom: 6 },
  labelSoft: { fontWeight: 400, textTransform: 'none', letterSpacing: 0 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 16px', paddingRight: 64, border: '1px solid #E8DFD0', borderRadius: 8, background: '#F5F0E8', color: '#3B3228', fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, outline: 'none' },
  addBtn: { position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'rgba(212,132,90,0.14)', border: '1px solid rgba(212,132,90,0.4)', color: '#B8683C', borderRadius: 6, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" },
  chip: { display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E8DFD0', borderRadius: 8, padding: '9px 10px 9px 13px', fontSize: 14, color: '#3B3228', fontFamily: "'Libre Franklin', sans-serif" },
  times: { width: 96, flexShrink: 0, boxSizing: 'border-box', padding: '7px 9px', border: '1px solid #E8DFD0', borderRadius: 6, background: '#FAF6EF', color: '#3B3228', fontFamily: "'Libre Franklin', sans-serif", fontSize: 12.5, outline: 'none' },
  remove: { flexShrink: 0, background: 'none', border: 'none', color: '#9A8E7E', fontSize: 14, cursor: 'pointer', padding: '2px 4px', lineHeight: 1 },
  known: { marginLeft: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: '#5C6F55' },
  menu: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20, background: '#FFFFFF', border: '1px solid #E8DFD0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' },
  option: { display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '11px 14px', fontSize: 14, color: '#3B3228', cursor: 'pointer', fontFamily: "'Libre Franklin', sans-serif" },
  optionOn: { background: '#F5F0E8' },
  hint: { fontSize: 12, color: '#9A8E7E', marginTop: 6, lineHeight: 1.5 },
};
