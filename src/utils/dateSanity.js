// Catches the date typos people actually make on the event form.
//
// The one that started this: an organizer's Sept 5 event was saved as
// "0026-09-05" instead of "2026-09-05". A date input accepts that happily,
// and the events feed filters on start date, so the event silently vanished
// off the calendar. Nobody found out until the organizer asked why.
//
// Returns a friendly sentence, or null when the date looks fine. Never blocks
// the submit - it nudges, it doesn't scold.

export function todayET() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Detroit' }).format(new Date());
}

export function dateSanityHint(iso) {
  if (!iso) return null;
  const [yStr, mStr, dStr] = String(iso).slice(0, 10).split('-');
  const year = Number(yStr);
  if (!year || !Number(mStr) || !Number(dStr)) return null;

  const thisYear = Number(todayET().slice(0, 4));

  // The classic: a digit dropped or an extra one added, giving year 26 or 20260.
  if (year < 1000 || year > 9999) {
    return `That year came out as ${year}. Looks like a typo - did you mean ${thisYear}?`;
  }
  if (year < thisYear) {
    return `That says ${year}, which has already been and gone. Did you mean ${thisYear}?`;
  }
  if (year > thisYear + 2) {
    return `Just checking - that's ${year}, which is a good way off. Did you mean ${thisYear}?`;
  }
  if (iso.slice(0, 10) < todayET()) {
    return 'Heads up, that date already passed, so it won\'t show on the calendar.';
  }
  return null;
}

// Sensible bounds for the browser's own date picker.
export function dateBounds() {
  const thisYear = Number(todayET().slice(0, 4));
  return { min: todayET(), max: `${thisYear + 2}-12-31` };
}
