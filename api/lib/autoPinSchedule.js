// Standing auto-pin schedule for food trucks.
//
// Some vendors park in the same spot on the same days every week and simply forget
// to tap their check-in link. For those, we drop the pin for them on a schedule.
// The cron (api/cron-truck-autopin.js) reads this file, so changing a time, a spot,
// or switching a truck off is a one-line edit + deploy.
//
// Fields
//   slug          Notion "Slug" of the truck (must be Status = Active)
//   enabled       false = paused, keeps the entry around for next season
//   days          ET weekdays, 0=Sun … 6=Sat
//   startET       "HH:MM" 24h Michigan time - when the pin drops
//   endET         "HH:MM" 24h Michigan time - written as Departure Time, which is what
//                 makes the pin fall off the map on its own (see isLive in FoodTrucksPage)
//   lat/lng       where the pin lands
//   note          Location Note - shown on the card AND used in the Facebook post as
//                 "<Truck> just pulled up at <note>", so write it to read that way
//   todaysSpecial optional Todays Special text ('' = leave blank)
//   until         'YYYY-MM-DD' last day this runs, or null for "until further notice"
//   notify        text the vendor after the auto-drop with their pull-the-pin link
//
// The vendor keeps full control: their normal check-in link still works, and tapping
// "check out" (sold out early) pulls the pin down. The cron only ever fires inside a
// short window around startET, so an early checkout is never overwritten.

export const AUTO_PIN_SCHEDULE = [
  {
    slug: 'wieners-on-the-water',
    enabled: true,
    days: [6, 0], // Saturday + Sunday
    startET: '12:30',
    endET: '17:00',
    lat: 41.97641336070263,
    lng: -84.28956004588389,
    // Reads as "<Truck> just pulled up at <note>" in the Facebook post. Wording follows
    // how the vendor describes the spot in his own check-ins.
    note: 'the middle of the Devils Lake sandbar - look for the boat',
    todaysSpecial: '',
    until: null,
    notify: true,
  },
];

export function getAutoPinEntry(slug) {
  return AUTO_PIN_SCHEDULE.find(e => e.enabled && e.slug === slug) || null;
}

// Michigan wall-clock parts for a given instant.
export function etParts(date = new Date()) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Detroit',
    hour12: false,
    weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(date).map(x => [x.type, x.value]));
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  const hour = Number(p.hour) % 24; // hour12:false can emit "24" at midnight
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour,
    minute: Number(p.minute),
    weekday,
    dateStr: `${p.year}-${p.month}-${p.day}`,
    minutesOfDay: hour * 60 + Number(p.minute),
  };
}

// Today's <hh:mm> Michigan time as a real UTC instant (DST-correct).
export function etTimeToISO(hhmm, date = new Date()) {
  const [h, m] = hhmm.split(':').map(Number);
  const parts = etParts(date);
  // Offset between the ET wall clock and UTC at this instant.
  const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0);
  const nowFloor = Math.floor(date.getTime() / 60000) * 60000;
  const offsetMs = asUTC - nowFloor;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, h, m, 0) - offsetMs).toISOString();
}

export function parseHHMM(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
