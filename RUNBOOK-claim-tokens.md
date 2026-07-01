# RUNBOOK — "Invalid claim token. Re-verify your phone number." on self-edit / confirm-listing

Last verified: 2026-07-01

## Symptom
- A business owner hits Save on the self-edit form (`/api/self-edit-listing`) or a
  confirm-listing link and gets: `Invalid claim token. Re-verify your phone number.`
- Their claim/edit flow otherwise looks normal — right business, right fields.

## Root cause (the standing one)
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
sees "Invalid claim token" with no other symptom. This is not a one-off — it will recur
every time `NOTION_TOKEN_BUSINESS` rotates, for any owner still sitting on a pre-hardening
token in their browser's `localStorage`.

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
1. **For the affected owner:** have them re-verify their phone (refresh the claim/edit
   page → enter phone → enter the new 6-digit code → then make their edit in the same
   session). `verify-claim.js` issues a fresh token signed with `CLAIM_SIGNING_SECRET`,
   which is permanent and immune to future `NOTION_TOKEN_BUSINESS` rotations. One
   re-verify fixes them for good.
2. **Standing decision, not yet made:** the legacy fallback branch in `verify-claim.js`
   and `confirm-listing.js` could be removed now (it's been 3+ weeks since 2026-06-10;
   most active owners have likely already re-verified organically). Doing so trades
   "landmine fires unpredictably on next token rotation" for "any remaining legacy-token
   holder gets a clean one-time re-verify prompt on their next edit." Not yet decided —
   flag before removing.

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
  lasting impact). Customer instructed to re-verify phone once; permanently resolved
  after that.
