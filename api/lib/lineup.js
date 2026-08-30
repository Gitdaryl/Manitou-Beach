// Shared shape for "who else is going to be there" on an event.
//
// A lineup is an attribute of ANY event, not an event type. A wine tasting with two
// food trucks parked outside is the common case, and before this it could not be
// represented at all: a truck could only attach to an event whose Vendor Reg Enabled
// box was ticked, and that box was only ticked for eventType 'vendor_market'.
//
// Storage: one Notion rich_text property per category, one entry per line, fields
// separated by " | ". Readable and editable directly in Notion, which matters because
// that is where these get corrected:
//
//   Wieners on the Water | wieners-on-the-water | 1-5
//   Smoky D'z BBQ |  | 12-8
//
// A slug means we matched the name to a truck already in the directory. A blank slug
// is a name we don't have yet, which is the lead. Nothing here drops a pin or contacts
// anyone - this is only the capture layer.

export const LINEUP_FIELDS = {
  trucks:        'Lineup Trucks',
  entertainment: 'Lineup Entertainment',
  vendors:       'Lineup Vendors',
};

export const LINEUP_CATEGORIES = Object.keys(LINEUP_FIELDS);

const MAX_ENTRIES = 20;      // an event with more than 20 trucks is a festival, and those get entered by hand
const MAX_NAME = 80;
const MAX_TIMES = 24;

// Pipes and newlines are the delimiters, so they can never survive inside a value.
const clean = (v, max) => String(v ?? '').replace(/[|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

// Accepts what the form sends: an array of {name, slug, times}, or plain strings.
export function serializeLineup(entries) {
  if (!Array.isArray(entries)) return '';
  return entries
    .map(e => (typeof e === 'string' ? { name: e } : e || {}))
    .map(e => ({
      name: clean(e.name, MAX_NAME),
      slug: clean(e.slug, MAX_NAME).toLowerCase().replace(/[^a-z0-9-]/g, ''),
      times: clean(e.times, MAX_TIMES),
    }))
    .filter(e => e.name)
    .slice(0, MAX_ENTRIES)
    .map(e => `${e.name} | ${e.slug} | ${e.times}`)
    .join('\n');
}

export function parseLineup(text) {
  if (!text) return [];
  return String(text)
    .split('\n')
    .map(line => {
      const [name = '', slug = '', times = ''] = line.split('|').map(s => s.trim());
      return { name, slug: slug || null, times: times || null };
    })
    .filter(e => e.name);
}

// Read all three categories off a Notion page's properties.
export function readLineup(props) {
  const out = {};
  for (const [key, field] of Object.entries(LINEUP_FIELDS)) {
    out[key] = parseLineup(props?.[field]?.rich_text?.[0]?.text?.content
      || props?.[field]?.rich_text?.[0]?.plain_text
      || '');
  }
  return out;
}

// Build the Notion properties patch for a submitted lineup. Categories the caller
// didn't send are left alone, so an edit that only touches trucks can't wipe the band.
export function lineupProperties(lineup) {
  const properties = {};
  if (!lineup || typeof lineup !== 'object') return properties;
  for (const [key, field] of Object.entries(LINEUP_FIELDS)) {
    if (lineup[key] === undefined) continue;
    properties[field] = { rich_text: [{ text: { content: serializeLineup(lineup[key]).slice(0, 1900) } }] };
  }
  return properties;
}

// True when anything at all was named. Used to decide whether to render the section.
export function hasLineup(lineup) {
  return LINEUP_CATEGORIES.some(k => (lineup?.[k] || []).length > 0);
}
