// Does everything the site depends on still work, and if not, what does a person do?
//
// Two rules, both learned the hard way:
//
//   1. NO JARGON. These alerts have to make sense to whoever is holding the phone,
//      which one day might not be Daryl. Nobody outside this file needs to know the
//      words "token", "env var" or "API". Facebook has not "returned a 190", Facebook
//      has logged us out. Say what stopped working, what still works, and what to do.
//
//   2. EVERY PROBLEM CARRIES ITS REMEDY. An alert that reports a fault and leaves you
//      to work out the fix is half a feature. Each check below either fixes itself and
//      says so, or hands over the exact steps, or hands over a message to paste to
//      Claude. Never a dead end.
//
// Almost nothing here can genuinely self-heal, and pretending otherwise would be worse
// than useless. What the runner does instead is retry once before crying wolf, and
// remember what it said last time so it can tell you something recovered on its own.

const withTimeout = (ms, promise) => Promise.race([
  promise,
  new Promise((_, rej) => setTimeout(() => rej(new Error('timed out')), ms)),
]);

async function ping(url, options = {}) {
  const res = await withTimeout(12000, fetch(url, options));
  if (res.ok) return { ok: true };
  const body = await res.text().catch(() => '');
  return { ok: false, detail: `${res.status} ${body.slice(0, 140)}` };
}

// Each check describes itself in the language of the business, not the plumbing.
//   what      what it is, as a person would say it
//   why       why anyone should care that it works
//   stillOk   what keeps working even when this is broken - stops a small fault
//             reading like the whole site is down
//   fix       steps a person can follow, or a message to hand to Claude
export const CHECKS = [
  {
    id: 'notion-business',
    what: 'The business and food truck records',
    why: 'Every listing, food truck and map pin is stored here.',
    stillOk: 'Pages people have already loaded still work.',
    severity: 'critical',
    required: ['NOTION_TOKEN_BUSINESS'],
    run: () => ping('https://api.notion.com/v1/users/me', {
      headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`, 'Notion-Version': '2022-06-28' },
    }),
    fix: {
      whoFixes: 'claude',
      steps: [
        'Notion has stopped letting us in. Usually somebody removed or renamed the connection in Notion settings.',
        'Open Notion - that is where all the listings, events and food trucks are stored - go to Settings, then Connections, and check the Manitou Beach connection is still there and still has access to the Business database.',
      ],
      askClaude: 'The Manitou Beach site says it can no longer read the business and food truck records in Notion. Can you check the connection and tell me exactly what to click to fix it?',
    },
  },
  {
    id: 'notion-events',
    what: 'The events calendar records',
    why: 'Everything on the calendar is stored here.',
    stillOk: 'The rest of the site is unaffected.',
    severity: 'critical',
    required: ['NOTION_TOKEN_EVENTS'],
    run: () => ping('https://api.notion.com/v1/users/me', {
      headers: { Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`, 'Notion-Version': '2022-06-28' },
    }),
    fix: {
      whoFixes: 'claude',
      steps: ['Same as above, but for the Events database connection in Notion.'],
      askClaude: 'The Manitou Beach site says it can no longer read the events calendar in Notion. Can you check the connection and tell me what to fix?',
    },
  },
  {
    id: 'texting',
    what: 'Text messages',
    why: 'Verification codes, the Saturday note to the food trucks, organizer links and your own alerts all go out by text.',
    stillOk: 'The website itself is fine. People can still submit events, they just will not get their code.',
    severity: 'critical',
    required: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
    run: () => ping(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}.json`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64'),
      },
    }),
    fix: {
      whoFixes: 'you',
      steps: [
        'Log in to Twilio - that is the company that sends our text messages - and check the account is in good standing.',
        'The usual cause is an unpaid balance. Topping it up brings texting straight back with nothing else to do.',
      ],
      askClaude: 'Text messages have stopped going out from the Manitou Beach site. I have checked the Twilio balance. What else should I look at?',
    },
  },
  {
    id: 'facebook',
    what: 'Posting to Facebook and Instagram',
    why: 'When a food truck goes live we announce it on the Manitou Beach pages. That is most of the reason a truck bothers to check in.',
    stillOk: 'The map and the website are completely fine. Only the automatic posts are affected.',
    severity: 'important',
    required: ['META_PAGE_ACCESS_TOKEN|FB_PAGE_ACCESS_TOKEN'],
    run: () => {
      const t = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
      return ping(`https://graph.facebook.com/v25.0/me?fields=id,name&access_token=${encodeURIComponent(t || '')}`);
    },
    fix: {
      whoFixes: 'claude',
      steps: [
        'Facebook has logged us out. It does this on its own every couple of months and it is not a sign anything is wrong.',
        'It takes about five minutes to sign back in, and it is fiddly enough that it is worth having Claude walk you through it.',
      ],
      askClaude: 'Facebook has logged the Manitou Beach site out again, so food truck pins are not being posted. Walk me through getting a new page access token, and set it up as a permanent one so this stops happening.',
    },
  },
  {
    id: 'payments',
    what: 'Taking payments',
    why: 'Listing upgrades, sponsorships and ticket sales all run through here.',
    stillOk: 'Everything free on the site keeps working normally.',
    severity: 'critical',
    required: ['STRIPE_SECRET_KEY'],
    run: () => ping('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    }),
    fix: {
      whoFixes: 'you',
      steps: [
        'Log in to Stripe - that is the company that handles our card payments - and look for a notice at the top of the dashboard.',
        'Stripe sometimes pauses an account until you confirm some business details, and it will say so right at the top.',
      ],
      askClaude: 'The Manitou Beach site can no longer reach Stripe. Stripe itself shows no warning on the dashboard. What should I check next?',
    },
  },
  {
    id: 'email',
    what: 'Sending email',
    why: 'Confirmations, organizer links and receipts go out by email.',
    stillOk: 'Texting is separate, so anything that goes out by text still gets through.',
    severity: 'important',
    required: ['RESEND_API_KEY'],
    run: () => ping('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    }),
    fix: {
      whoFixes: 'claude',
      steps: ['The company that sends our email (Resend) is refusing us. Usually somebody deleted the key, or the sending domain needs verifying again.'],
      askClaude: 'The Manitou Beach site can no longer send email through Resend. Can you work out why and tell me what to do?',
    },
  },
  {
    id: 'photos',
    what: 'Photo storage',
    why: 'Every photo anyone uploads, and the crowd photo wall, live here.',
    stillOk: 'Photos already uploaded still display. Only new uploads are affected.',
    severity: 'important',
    required: ['BLOB_READ_WRITE_TOKEN'],
    run: async () => {
      const { list } = await import('@vercel/blob');
      await withTimeout(12000, list({ limit: 1, token: process.env.BLOB_READ_WRITE_TOKEN }));
      return { ok: true };
    },
    fix: {
      whoFixes: 'claude',
      steps: ['The place we keep uploaded photos is refusing us. This one almost always needs its key replaced, which is a job for Claude.'],
      askClaude: 'Photo uploads on the Manitou Beach site have stopped working - the storage is refusing us. Can you tell me how to fix it?',
    },
  },
];

// A required setting that is simply absent is a different problem from one that is
// being rejected, and the difference matters: absent usually means a deploy dropped it.
export function missingSettings(check) {
  return (check.required || []).filter(spec => !spec.split('|').some(k => process.env[k]));
}

export async function runCheck(check) {
  const missing = missingSettings(check);
  if (missing.length) {
    return { id: check.id, ok: false, kind: 'missing', detail: `not configured (${missing.join(' or ')})` };
  }
  try {
    const first = await check.run();
    if (first.ok) return { id: check.id, ok: true };
    // One retry before crying wolf. Most single failures are a blip at the other end,
    // and an alert for something that was better a second later trains you to ignore alerts.
    await new Promise(r => setTimeout(r, 1500));
    const second = await check.run();
    if (second.ok) return { id: check.id, ok: true, recoveredOnRetry: true };
    return { id: check.id, ok: false, kind: 'rejected', detail: second.detail || first.detail || 'no answer' };
  } catch (err) {
    return { id: check.id, ok: false, kind: 'error', detail: err.message };
  }
}

export async function runAllChecks() {
  return Promise.all(CHECKS.map(async c => ({ check: c, result: await runCheck(c) })));
}
