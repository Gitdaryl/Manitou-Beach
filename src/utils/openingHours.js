// Turn the free-text Hours stored in Notion into schema.org
// openingHoursSpecification entries.
//
// Hours are entered by business owners (and by us) with no format enforcement,
// so the stored values are inconsistent. Real examples from the live DB:
//   {"Tue":"8:30 AM - 4:30 PM", ...}   The Lakes Print Shop
//   {"Mon":"9-5", ...}                 Hammill Electric
//
// Rule: parse what we confidently can, silently skip the rest. A day we cannot
// read is omitted from the schema. Emitting a guessed time is worse than
// emitting nothing, because wrong hours in search results send people to a
// closed door.

const DAY_NAMES = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

// "8:30 AM", "9", "17:00", "5pm" → minutes since midnight, or null.
// `isEnd` only matters for bare numbers with no am/pm, where we have to guess.
function parseTime(raw, isEnd) {
  const s = String(raw).trim().toLowerCase().replace(/\./g, '');
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;

  let hour = parseInt(m[1], 10);
  const mins = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3];

  if (mins > 59) return null;

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    return hour * 60 + mins;
  }

  // Already 24-hour ("17:00", "13:30").
  if (hour > 12) return hour <= 23 ? hour * 60 + mins : null;

  // Bare 1-12 with no am/pm, e.g. "9-5". Assume ordinary business hours:
  // 7-11 reads as morning, everything else as afternoon. "9-5" → 09:00-17:00.
  const isMorning = hour >= 7 && hour <= 11;
  if (isEnd) return (isMorning ? hour : hour === 12 ? 12 : hour + 12) * 60 + mins;
  return (isMorning || hour === 12 ? hour : hour + 12) * 60 + mins;
}

const hhmm = mins => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

// "8:30 AM - 4:30 PM" / "9-5" / "9 to 5" → { opens, closes } in 24h, or null.
export function parseHoursRange(value) {
  if (!value || typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || /^(closed|by appointment|appt|n\/?a|varies|seasonal)/i.test(text)) return null;
  if (/24\s*(hours|hrs|\/7)/i.test(text)) return { opens: '00:00', closes: '23:59' };

  const parts = text.split(/\s*(?:-|–|—|to)\s*/i);
  if (parts.length !== 2) return null;

  let open = parseTime(parts[0], false);
  let close = parseTime(parts[1], true);
  if (open === null || close === null) return null;

  // "9 - 5" where the guess produced a close at or before the open: the end is
  // almost certainly the following PM, so push it by 12h once.
  if (close <= open && close + 720 > open) close += 720;
  if (close <= open) return null;
  if (close > 1439) return null;

  return { opens: hhmm(open), closes: hhmm(close) };
}

// hours: { Mon: "9-5", Tue: "Closed", ... } → array of schema.org
// OpeningHoursSpecification. Days sharing the same window are grouped into one
// entry, which is how Google's examples express it. Returns [] when nothing
// parses, so callers can spread it away safely.
export function buildOpeningHoursSpec(hours) {
  if (!hours || typeof hours !== 'object') return [];

  const byWindow = new Map();
  for (const [short, full] of Object.entries(DAY_NAMES)) {
    const range = parseHoursRange(hours[short]);
    if (!range) continue;
    const key = `${range.opens}-${range.closes}`;
    if (!byWindow.has(key)) byWindow.set(key, { ...range, days: [] });
    byWindow.get(key).days.push(full);
  }

  return [...byWindow.values()].map(({ days, opens, closes }) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: days.length === 1 ? days[0] : days,
    opens,
    closes,
  }));
}
