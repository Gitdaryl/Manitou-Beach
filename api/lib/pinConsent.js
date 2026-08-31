// Permission before publication.
//
// The auto-pin used to fire and then tell the vendor it had fired. On 30 Aug 2026 it
// announced Wieners on the Water on the Devils Lake sandbar during a rainstorm, on a day
// he never left the house. The pin came down in a minute; the Facebook post ran all
// afternoon. Nothing was broken - the design was "notify", and notify is not permission.
//
// So the standing schedule now asks. One text on the morning of, one character back.
//
//   SILENCE MEANS NO. That is the entire point and it is worth the cost. A missing pin
//   costs one vendor one afternoon of trade. A pin for a truck that isn't there costs a
//   customer who boated out for nothing, and that customer never tells you, they just
//   stop opening the map.
//
// Consent is per DAY, never sticky. Saying yes on Saturday says nothing about Sunday.
//
// Vendors who would rather not be asked can choose that (see PIN_CONSENT.AUTOMATIC).
// Choosing to delegate is autonomy too; being enrolled in it without being asked is not.

export const PIN_CONSENT = {
  ASK: 'Ask each time',    // default: no pin unless they say yes today
  AUTOMATIC: 'Automatic',  // they opted into the old behaviour, knowingly
  MANUAL: 'Manual only',   // don't ask, don't auto - they drive it entirely themselves
};

// Three unanswered weekends running is not a reminder problem, it is a vendor who has
// drifted. Stop texting them and tell Daryl instead.
export const ASK_FATIGUE_LIMIT = 3;

const sel = (props, key) => props?.[key]?.select?.name || '';
const num = (props, key) => props?.[key]?.number ?? 0;

export function consentMode(props) {
  const raw = sel(props, 'Pin Consent');
  return Object.values(PIN_CONSENT).includes(raw) ? raw : PIN_CONSENT.ASK;
}

export function skipSocial(props) {
  return props?.['Skip Social']?.checkbox === true;
}

// Michigan's date, which is the only date that means anything to a vendor at the lake.
export function etDateStr(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Detroit', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

// Did they say yes for TODAY? A yes from last Saturday is not a yes for this one.
export function hasConsentToday(props, date = new Date()) {
  const answer = sel(props, 'Consent Answer');
  const forDate = (props?.['Consent For']?.date?.start || '').slice(0, 10);
  return answer === 'Yes' && forDate === etDateStr(date);
}

export function answeredToday(props, date = new Date()) {
  const forDate = (props?.['Consent For']?.date?.start || '').slice(0, 10);
  return !!sel(props, 'Consent Answer') && forDate === etDateStr(date);
}

// Should the auto-pin actually drop for this truck right now?
// Returns { pin: boolean, reason } so the cron's report says why, not just what.
export function autoPinDecision(props, date = new Date()) {
  const mode = consentMode(props);
  if (mode === PIN_CONSENT.MANUAL) return { pin: false, reason: 'consent-manual-only' };
  if (mode === PIN_CONSENT.AUTOMATIC) return { pin: true, reason: 'consent-automatic' };
  if (hasConsentToday(props, date)) return { pin: true, reason: 'consent-yes-today' };
  if (answeredToday(props, date)) return { pin: false, reason: 'consent-no-today' };
  return { pin: false, reason: 'consent-not-answered' };
}

// Should we send the morning ask?
export function shouldAsk(props, date = new Date()) {
  if (consentMode(props) !== PIN_CONSENT.ASK) return false;
  if (answeredToday(props, date)) return false;               // already replied today
  if (num(props, 'Unanswered Asks') >= ASK_FATIGUE_LIMIT) return false;
  return true;
}

// Notion patch recording an answer. Answering also clears the fatigue counter, because
// a vendor who replies is engaged regardless of which way they replied.
export function consentAnswerProperties(answer, date = new Date()) {
  return {
    'Consent Answer': { select: { name: answer ? 'Yes' : 'No' } },
    'Consent For': { date: { start: etDateStr(date) } },
    'Unanswered Asks': { number: 0 },
  };
}

export function askSentProperties(props) {
  return { 'Unanswered Asks': { number: num(props, 'Unanswered Asks') + 1 } };
}

// Reply parsing. Vendors are texting from a service window with one hand, so accept the
// shapes people actually send and refuse to guess at anything else - a wrong guess here
// publishes their location.
export function parseConsentReply(text) {
  const t = String(text || '').trim().toLowerCase().replace(/[.!]+$/, '');
  if (!t) return null;
  if (['y', 'yes', 'yep', 'yeah', 'yup', 'ya', 'sure', 'ok', 'okay', 'yes please', 'im out', "i'm out", 'out today', 'open'].includes(t)) return true;
  if (['n', 'no', 'nope', 'nah', 'not today', 'no thanks', 'closed', 'staying home', 'off today'].includes(t)) return false;
  return null;
}
