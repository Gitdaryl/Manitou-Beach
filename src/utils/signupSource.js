// Remembers where a visitor first arrived from (a Holly reel, a bar's events card, a food truck post)
// so a newsletter signup later in the visit is credited to that source in beehiiv.
// Links carry ?utm_source=holly&utm_medium=reel&utm_campaign=weekend; QR cards use ?src=card-boot-jack.

const KEY = 'mb_first_touch';

function read() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}

export function captureFirstTouch() {
  if (typeof window === 'undefined' || read()) return;
  const p = new URLSearchParams(window.location.search);
  const source = p.get('utm_source') || p.get('src');
  if (!source) return;
  const touch = {
    utm_source: source,
    utm_medium: p.get('utm_medium') || (p.get('src') ? 'qr' : ''),
    utm_campaign: p.get('utm_campaign') || '',
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    // Private mode or blocked storage: the signup is still credited to the page it happened on.
  }
}

// Fields to spread into the /api/subscribe POST body.
export function signupSource(form) {
  const touch = read() || {};
  return {
    ...touch,
    page: typeof window === 'undefined' ? '' : window.location.pathname,
    form,
  };
}
