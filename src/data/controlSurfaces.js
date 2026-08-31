// What each kind of partner actually controls, in their words.
//
// This is the copy that runs at the end of every signup, and it is deliberately data
// rather than markup: adding bands, venues or another community means adding a key here,
// not writing another confirmation screen.
//
// Two rules that are not negotiable, because breaking either one turns this from a
// feature into a betrayal:
//
//   1. Every line below must map to a switch that really exists. If we ever post on
//      someone's behalf in a way they can't stop, the line promising they can stop it
//      has to come out first. Manufactured control is worse than none - they find out
//      at the worst possible moment and they tell the other vendors.
//   2. These are stated at the END of a flow, after the person has committed. The same
//      words in front of the form read as homework.
//
// Ordering matters. The first line should be the thing they were quietly worried about.

export const CONTROL_SURFACES = {
  // ── Food trucks ──────────────────────────────────────────────────────────
  truck: {
    heading: name => `${name || 'You'} are on the map`,
    lede: 'Here is what you control, and nobody else can do any of it for you.',
    controls: [
      {
        title: 'You decide when you appear',
        body: 'The map only shows you after you drop your pin. Sold out early or not heading out? Pull it down in one tap and you disappear.',
      },
      {
        title: 'Your spot, your words',
        body: 'Where you are parked and what you are running today is whatever you type. We never guess it for you.',
      },
      {
        title: 'Nothing gets posted without you',
        body: 'Dropping your pin is what posts you to Facebook. No pin, no post.',
      },
    ],
    install: {
      icon: '/images/truck-pin-192.png',
      appTitle: 'Drop Pin',
      themeColor: '#D4845A',
      storageKey: 'mb-truck-a2hs-dismissed',
      heading: 'Keep it on your phone',
      body: 'One tap from your home screen, the same as any other app. No text to dig up, no link to find.',
      manifest: ({ slug, token, name }) =>
        `/api/truck-manifest?truck=${encodeURIComponent(slug || '')}&token=${encodeURIComponent(token || '')}${name ? `&name=${encodeURIComponent(name)}` : ''}`,
    },
    primary: { label: 'Open my controls' },
  },

  // ── Event organizers ─────────────────────────────────────────────────────
  organizer: {
    heading: name => `${name || 'Your event'} is live`,
    lede: 'It is yours to change. You do not need us, and you do not need a password.',
    controls: [
      {
        title: 'Change or cancel it yourself, any time',
        body: 'Times move and weather happens. Update it and the calendar updates with it, in seconds, without asking anyone.',
      },
      {
        title: 'Every event you post lives in one place',
        body: 'One link lists all of them. Share it with whoever else runs your events and they can edit too.',
      },
      {
        title: 'No login to lose',
        body: 'We text you the link. Lost it? Ask for it again with your phone number.',
      },
    ],
    install: {
      icon: '/images/my-events-192.png',
      appTitle: 'My Events',
      themeColor: '#1A2830',
      storageKey: 'mb-a2hs-dismissed',
      heading: 'Keep your events on your phone',
      body: 'Add it to your home screen and everything you have posted is one tap away.',
      manifest: ({ phone, token }) =>
        `/api/my-events-manifest?phone=${encodeURIComponent(phone || '')}&token=${encodeURIComponent(token || '')}`,
    },
    primary: { label: 'Manage my events' },
  },
};

export function getControlSurface(key) {
  return CONTROL_SURFACES[key] || null;
}
