# Manitou Beach — Platform Audit

Date: 2026-06-09 · Auditor: Claude (Fable 5) · Scope: code (217 files) + live site

Lens: five personas — **Visitor**, **Admin (you)**, **Business owner**, **Food truck**, **Event organiser**.
Each finding is tagged with severity, the affected persona(s), file refs, and a recommended **fix model**
(Fable = needs cross-file/security reasoning; Sonnet = well-specified mechanical change).

Live site is up; per-route OG middleware works (verified on `/`). Pricing locked at $9/$25/$49 per project rules.

---

## P0 — Money / security (do first)

### S1. Cron endpoints have no caller authentication
**Severity: HIGH · Persona: Admin, Business, Organiser · Fix: Fable (design) + Sonnet (apply)**

At least six `api/cron-*.js` endpoints have no `CRON_SECRET`/header check and are publicly reachable:
`cron-event-reminders.js`, `cron-new-listing.js`, `cron-profile-report-card.js`, `cron-review-digest.js`,
`cron-site-audit.js`, `cron-social-post.js`. Anyone who guesses the path can trigger SMS/email blasts,
social posts, and AI generation on demand. That's a direct cost vector (Twilio + Anthropic spend) and a
reputational one (spam sent from your numbers/accounts).

Fix: require `Authorization: Bearer ${CRON_SECRET}` (Vercel sends this automatically to cron jobs) and
reject anything else. One shared helper, applied to every `cron-*` file. Fable should set the pattern and
sweep all 12 cron files for consistency; Sonnet can apply once the pattern exists.

### S2. Forgeable claim/edit tokens via `'fallback'` HMAC secret
**Severity: HIGH · Persona: Business owner · Fix: Fable**

`self-edit-listing.js`, `confirm-listing.js`, `verify-claim.js`, `businesses.js` all sign claim tokens with
`process.env.NOTION_TOKEN_BUSINESS || 'fallback'`. Two problems: (1) if that env var is ever missing in an
environment, every claim token is signable with the literal public string `'fallback'` — anyone could forge a
token and edit/hijack any business listing. (2) Using the Notion API token as a signing key means rotating
that token silently invalidates every outstanding claim link. Introduce a dedicated `CLAIM_SIGNING_SECRET`,
remove the `'fallback'` default (fail closed if unset).

### S3. `upload-image.js` default upload path is unauthenticated
**Severity: HIGH · Persona: Admin (cost) · Fix: Sonnet**

The `action=apply` branch checks admin auth, but the default `action=upload` branch accepts base64 file data
from anyone and writes it to your public Vercel Blob (2MB cap, no auth, no rate limit). Anyone can fill your
blob storage or host arbitrary images under your domain. Gate uploads behind a token tied to the originating
form, or at minimum a per-IP rate limit.

### S4. Ticket "sold" count is read-modify-write (oversell risk)
**Severity: MEDIUM · Persona: Organiser · Fix: Fable**

`stripe-webhook.js` reads `Tickets Sold`, adds, and writes back. Two concurrent purchases lose an update;
if you ever enforce capacity you can oversell. Notion has no atomic increment — needs a documented strategy
(serialize via a queue, or reconcile from ticket records as source of truth). Same bug class I just fixed in
Yetickets; flagging here so MB gets the same treatment deliberately rather than by accident.

---

## P1 — Admin correctness

### A1. `ADMIN_TOKEN` vs `ADMIN_SECRET` are used inconsistently
**Severity: MEDIUM · Persona: Admin · Fix: Sonnet**

`admin/attention-queue.js`, `admin/revenue-summary.js`, `admin/sync-categories.js` check `process.env.ADMIN_TOKEN`.
Most other admin endpoints (and the admin UI login) check `ADMIN_SECRET`. If the two env vars aren't both set to
the same value, those three admin pages silently 401 regardless of correct login. Also `upload-image.js:17` comment
says "ADMIN_TOKEN" while the code checks `ADMIN_SECRET`. Standardize on one var name; delete the other.

### A2. Admin auth is a single shared password in `sessionStorage`
**Severity: LOW–MEDIUM · Persona: Admin · Fix: Fable (note only)**

`YetiAdminPage.jsx` stores one password as `yeti_admin_token` and sends it as `x-admin-token`. Fine for a
solo admin, but it's a long-lived bearer with no rotation/expiry controlling SMS blasts and revenue data.
Worth a documented rotation plan; not urgent if you're the only admin.

---

## P1 — Persona UX

### U1. Verify `/api/events` and `/api/food-trucks` return data in production
**Severity: VERIFY · Persona: Visitor, Food truck · Fix: Sonnet**

Live fetches of both endpoints returned empty bodies during this audit. This may be a fetch-tool artifact
(JSON stripped) rather than a real outage — but if these are genuinely empty, the events calendar and food
truck directory render blank for every visitor. Confirm with a real browser/curl before assuming OK.

### U2. Directory pages have no social-share image
**Severity: LOW · Persona: Business owner, Marketing · Fix: Sonnet**

`middleware.js` OG_MAP sets `image: null` for `/business` and `/featured` (comments say "NEEDS IMAGE").
When an owner shares their directory link, the preview is blank — weak for the pages you most want shared.
Add a Main Street / business-collage OG image.

### U3. 32 TODO/FIXME/hardcoded markers across `api/` and `src/pages/`
**Severity: LOW · Persona: All · Fix: Sonnet (triage)**

Includes a hardcoded Google review Place ID in `promo-redeem.js` flagged "replace with Blackbird's actual ID."
Worth a one-pass triage to separate live-data placeholders from harmless notes.

---

## Model recommendation (per SOP)

This audit itself was correctly a Fable 5 job — the P0 findings come from reasoning across the checkout →
webhook → Notion → cron surface at once, not from any single file. For the **fixes**:

- **Fable 5**: S1 (design cron-auth pattern + sweep), S2 (token-signing redesign), S4 (oversell strategy).
  These touch multiple files and have security/correctness blast radius.
- **Sonnet**: S3, A1, U1, U2, U3 — well-specified, single-file, mechanical. This is your existing
  SONNET-TASKS lane and the cost-efficient choice.

Net: spend Fable tokens on the three reasoning-heavy security items; downgrade the rest.
