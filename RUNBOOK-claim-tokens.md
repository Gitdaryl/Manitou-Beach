# RUNBOOK — "Invalid claim token. Re-verify your phone number." on self-edit / confirm-listing

Last verified: 2026-07-01

## Symptom
- A business owner hits Save on the self-edit form (`/api/self-edit-listing`) or a
  confirm-listing link and gets: `Invalid claim token. Re-verify your phone number.`
- Their claim/edit flow otherwise looks normal — right business, right fields.
- Telling them to "just refresh and re-verify" may NOT be enough — see Bug #2 below.
  If they're still stuck after that instruction, check whether they're on a build that
  predates commit `b214cf5` (2026-07-01) first, before assuming anything else is wrong.

## Root cause #1 — legacy token signed against a rotatable secret
`api/verify-claim.js` signs claim tokens as `HMAC(pageId, CLAIM_SIGNING_SECRET)`.
`CLAIM_SIGNING_SECRET` was introduced **2026-06-10** in commit `0a77a01`
("Harden claim/edit token signing (AF-7)"). Before that date, tokens were signed with
`NOTION_TOKEN_BUSINESS` instead.

To avoid breaking already-issued links, both `verify-claim.js` and `confirm-listing.js`
kept a **legacy fallback**: a token that fails the new-secret check is re-checked against
the token signed with **today's** `NOTION_TOKEN_BUSINESS` value.

**The landmine:** that legacy check only works if `NOTION_TOKEN_BUSINESS` hasn't changed
since the token was issued. Any time `NOTION_TOKEN_BUSINESS` is rotated (see the standing
infra rule on this — it's shared across MB, Stays, Yetickets, etc.), **every claim token
that predates 2026-06-10 and hasn't been re-verified since instantly breaks.** The owner
sees "Invalid claim token" with no other symptom. This will recur every time
`NOTION_TOKEN_BUSINESS` rotates, for any owner still sitting on a pre-hardening token in
their browser's `localStorage`.

## Root cause #2 — no UI path back to phone verification (fixed 2026-07-01, commit b214cf5)
Even with a valid re-verify, owners had no way to *get to* the phone-entry screen once a
bad token was already stored. In `BusinessProfilePage.jsx`:
- `claimToken` is loaded from `localStorage['mb-claim-{slug}']` on every page load with
  no validity check — just "is something there."
- The "Verify my number" button only rendered when `setupMode && !claimToken` — and
  `setupMode` is only ever true right after a Stripe-checkout redirect (`?setup=true` in
  the URL). A normal returning visit never sets `setupMode`, so that button never shows.
- `handleEditSave`'s catch block just displayed the 403 error text — it never cleared the
  stale token or reopened the claim modal.

**Net effect:** telling an owner to "refresh and re-verify" did nothing — there was no
control on the page that would ever show them a phone-entry field again once a token,
valid or not, existed in `localStorage`. The only workarounds were opening the page in
private/incognito (bypasses `localStorage` entirely) or manually clearing site data.

**Fix (commit `b214cf5`):** `handleEditSave` now detects a 403 from `/api/self-edit-listing`,
clears the token from `localStorage`, closes the edit modal, and reopens the claim modal
at the phone step with an explanatory message — so the owner can self-serve a re-verify.
This fixes the recovery path for *everyone* going forward, not just legacy-token holders;
any future cause of token invalidation will now self-heal the same way.

## Audit: other user-editable flows checked for the same pattern (2026-07-01)
The dangerous combination is: (1) a token derived from a secret that can be rotated,
(2) cached indefinitely in `localStorage`, (3) no UI path to detect staleness and
re-authenticate. Checked every token/localStorage-based editable flow in the codebase:

| Flow | Token mechanism | At risk? |
|---|---|---|
| Business self-edit (`BusinessProfilePage.jsx`) | HMAC tied to `CLAIM_SIGNING_SECRET`, persisted in `localStorage` | **Was** — fixed in b214cf5 |
| Event edit (`EventEditPage.jsx`, `api/event-edit.js`) | Random token stored on the Notion page itself, passed via URL each time (magic link, never cached) | No |
| Food truck check-in (`FoodTrucksPage.jsx`, `api/verify-food-truck.js` / `api/submit-food-truck.js`) | Random per-truck token stored on the Notion record, URL-based | No |
| Promo/offer claim (`ClaimPage.jsx`, `api/submit-claim.js`) | Session code in `localStorage`, but has a built-in "Resend" self-service recovery button already | No — already resilient |
| Listing update, manual-review path (`UpdateListingPage.jsx`, `api/update-listing.js`) | Re-enter name + email every time, nothing persisted | No |
| `WineryProfilePage.jsx` / `FoodTruckProfilePage.jsx` | Read-only display, no self-edit exists yet | N/A |

**Dormant risk, not yet active:** `api/confirm-listing.js` has the identical
`CLAIM_SIGNING_SECRET` / legacy-`NOTION_TOKEN_BUSINESS`-fallback structure as
`verify-claim.js`, but no page in the frontend currently calls it — it appears to be
unwired/orphaned. Not exploitable today. **If it's ever wired into a page, it needs the
same recovery-path treatment as `BusinessProfilePage.jsx` got in b214cf5** — don't assume
it's safe just because the backend token logic looks familiar.

## Diagnose (2 min)
1. Check the business's Notion page `Created time` / when they last successfully edited.
   If it's before 2026-06-10, they're almost certainly on a legacy token.
2. Confirm `CLAIM_SIGNING_SECRET` is actually set in Vercel prod — if it's unset,
   `verifyClaimToken` fails closed (returns false) for *everyone*, not just legacy
   claimants, and re-verifying won't fix it either. (Live-tested working 2026-07-01.)
3. To test without touching a real customer record: use the "Yeti Test Business" /
   "yeti test 2 business" pages in the Business Listings DB. Set `Verification Code`
   directly via Notion, then curl `/api/verify-claim` and `/api/self-edit-listing`
   with that phone/code — no SMS needed. Clear the Verification Code / test phone
   after.

## Fix
1. **For an affected owner today:** the app now self-heals (b214cf5) — a failed save
   automatically clears their bad token and reopens the phone-verify step. If they're
   still stuck, confirm they're loading a post-b214cf5 deploy (hard refresh / incognito
   rules out a CDN-cached old bundle).
2. **Standing decision, not yet made:** the legacy fallback branch in `verify-claim.js`
   and `confirm-listing.js` could be removed now (it's been 3+ weeks since 2026-06-10;
   most active owners have likely already re-verified organically). Doing so trades
   "landmine fires unpredictably on next token rotation" for "any remaining legacy-token
   holder gets a clean one-time re-verify prompt on their next edit" — which, now that
   root cause #2 is fixed, is a much lower-stakes trade than it was before b214cf5. Not
   yet decided — flag before removing.

## Related bug fixed in this incident (2026-07-01)
`api/self-edit-listing.js`: `normalizedUrl` defaulted to `null` instead of `undefined`,
so any partial save that omitted `website` from the payload (e.g. just updating hours or
a photo) silently wiped the business's `URL` property in Notion. Fixed to match the
`!== undefined` gate used by every other field in that handler. Confirmed live via the
Yeti Test Business record — omitting `website` no longer touches the URL field.

## Incident log
- **2026-07-01** — The Lakes Print Shop (claimed 2026-05-01, pre-hardening) hit "Invalid
  claim token" on the self-edit form after a `NOTION_TOKEN_BUSINESS` rotation. Confirmed
  `CLAIM_SIGNING_SECRET` is set and working via live test against her record (token
  issued, self-edit accepted). Found and fixed the `website`-field wipe bug in the same
  pass (accidentally triggered and reverted on her real record during testing — no
  lasting impact). Customer instructed to re-verify; still hit the same error because of
  root cause #2 (no UI recovery path) — fixed in commit `b214cf5`. Audited the rest of
  the codebase for the same pattern; nothing else at risk (see table above).
