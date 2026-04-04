/**
 * Yeti-branded error messages - warm, funny, human.
 * Use yeti.oops() for generic errors, yeti.notFound() for missing stuff, etc.
 * Each returns a random message so it never feels robotic.
 */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const yeti = {
  /** Generic "something went wrong" - server errors, unexpected failures */
  oops: () => pick([
    "Well, that didn't go as planned. The Yeti's on it - give it another shot?",
    "Whoops - something tripped over a cable. Try that again?",
    "Hmm, that didn't work. Probably not your fault. Try once more?",
    "The lake gremlins struck again. One more try should do it.",
    "That's weird - it usually works. Mind trying again?",
  ]),

  /** Network/connection errors */
  network: () => pick([
    "Looks like we lost the signal - lake wifi, am I right? Check your connection and try again.",
    "Can't reach the server - might be a connection hiccup. Give it a sec and try again.",
    "The internet took a swim. Check your connection and we'll try again.",
  ]),

  /** Payment/checkout failures */
  payment: () => pick([
    "Payment didn't go through - your card wasn't charged. Want to give it another go?",
    "The payment got lost somewhere. Don't worry, nothing was charged. Try again?",
    "Checkout hit a snag - no charge on your card. Let's try that again.",
  ]),

  /** Not found - pages, events, promo codes, etc. */
  notFound: (thing = 'that') => pick([
    `Hmm, can't find ${thing}. It might've wandered off - double-check the link?`,
    `${thing.charAt(0).toUpperCase() + thing.slice(1)} seems to have gone swimming. Check the link and try again?`,
    `We looked everywhere for ${thing} but came up empty. Is the link right?`,
  ]),

  /** Form validation - still clear but friendlier */
  validation: (field) => `Oops - looks like ${field} needs a quick fix before we can continue.`,

  /** Upload failures */
  upload: () => pick([
    "Upload didn't make it - want to give it another try?",
    "That file got lost on the way up. Try uploading again?",
  ]),

  /** SMS/verification specific */
  verify: () => pick([
    "That code didn't work - double-check and try again?",
    "Hmm, code didn't match. Make sure you're using the latest text we sent.",
  ]),

  /** Waitlist / subscription errors */
  subscribe: () => pick([
    "Couldn't get you signed up - try again in a sec?",
    "Sign-up hit a bump. One more try?",
  ]),
};

export default yeti;
