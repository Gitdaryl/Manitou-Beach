# Prize Wheel - Demo Build Spec

**Goal:** Wire up the working pieces needed to pitch vendors. Standalone `/spin` page, real Notion-backed claims, real QR email, real redemption flow. Skip auto-popup, corner pill, daily reset for now — those come after pitch validation.

## What's Done

- Notion DB created: `Manitou Beach - Prize Wheel Sponsors` (`NOTION_DB_PRIZE_WHEEL_SPONSORS=3438c729eb5981d3ace7e075fd98b79e`)
- Notion DB created: `Manitou Beach - Prize Wheel Claims` (`NOTION_DB_PRIZE_WHEEL_CLAIMS=3438c729eb598173bbede428d1661886`)
- Env vars added to `.env.local`
- Prototype lives at `/Users/darylyoung/Documents/Claude Code/prize-wheel-prototype.html`

## Existing Conventions (Follow These)

- All Notion calls use `fetch` with `Authorization: Bearer ${NOTION_TOKEN_BUSINESS}`, `Notion-Version: 2022-06-28`. See `api/businesses.js` for reference.
- Resend already imported in `api/` files. From: `noreply@yetigroove.com` (will swap to `manitoubeachmichigan.com` later).
- All copy: warm Yeti voice, no em dashes, no corporate tone. "Would my 70-year-old neighbor smile?" test.
- API auth: vendor PIN compared in plain text from Notion (pilot only — fine for demo).

## Schemas

### Sponsors DB props
- Business Name (title), Contact Email, Contact Phone, Deal Label (rich_text), Deal Description, Deal Color (hex), Slot Count (number, 1-3), Active (checkbox), Trial Ends (date), Vendor PIN (rich_text), Address, Logo URL, Created.

### Claims DB props
- Claim Code (title, e.g. `MB-A7K2-9X`), Winner Email, Prize Label, Sponsor Name, Sponsor ID, Issued At, Expires At, Status (select: issued/redeemed/expired/void), Redeemed At, Redeemed By Vendor.

## Build Tasks

### 1. `api/prize-wheel/sponsors.js` (GET)
- Returns active sponsors as wheel segments. Expand by `slot_count` (3 slots = 3 entries on wheel).
- Output: `[{label, sponsor, color, type:'prize', sponsorId}]`
- Pad with `spin-again` and `tomorrow` segments to maintain min 8-segment wheel (match prototype scenarios).
- 60s edge cache.

### 2. `api/prize-wheel/claim.js` (POST)
- Body: `{email, prizeLabel, sponsorName, sponsorId}`
- Generate code: `MB-` + 4 chars + `-` + 2 chars (uppercase alphanumeric, no ambiguous chars).
- Write Notion row (status=issued, issued_at=now, expires_at=now+7d).
- Generate QR via `qrcode` npm: encode redemption URL `${SITE_URL}/redeem?code=XXX`.
- Email via Resend: warm subject ("Your Manitou Beach prize is locked in"), prize details, QR image inline (data URL or base64 attachment), expiry date, vendor name + address, fine print.
- Return `{claimCode, expiresAt}`.

### 3. `api/prize-wheel/redeem.js` (POST)
- Body: `{claimCode, vendorPin}`
- Lookup claim by code. Validate: status=issued AND not expired AND vendor PIN matches sponsor's PIN.
- On success: update status=redeemed, redeemed_at=now, redeemed_by_vendor=name.
- Return `{ok, prize, sponsor, error?}`.

### 4. `api/prize-wheel/sponsor-stats.js` (GET, takes `?id=sponsorPageId&pin=XXX`)
- Returns: `{sponsor, deal, totalIssued, totalRedeemed, redemptionRate, recent: [last 10 claims]}`.

### 5. `/redeem` route in App.jsx
- Mobile-first. Input for claim code (auto-uppercase). Optional QR scan via `html5-qrcode` (already in deps).
- Vendor PIN input (4-6 digit).
- "Mark Redeemed" button → POST /api/prize-wheel/redeem.
- Big green check on success showing prize + sponsor. Big red X on failure with reason.
- No login. PIN gates per-sponsor.

### 6. `/sponsor/:id` route in App.jsx
- Magic link emailed at sponsor activation. Opens with `?pin=XXX` in URL.
- Shows: deal, total wins, redemption rate, last 10 claims (email partially redacted: `j***@gmail.com`).
- Daryl's pitch tool. Vendor sees their own ROI.

### 7. `/spin` route in App.jsx
- Lift prototype HTML into React component. Use `react-qr-code` if needed (already in deps).
- Fetch wheel segments from `/api/prize-wheel/sponsors`.
- On win: show win panel with email input → POST /api/prize-wheel/claim → success state "Check your inbox in a sec".
- Daily gate: `localStorage.lastSpinDate` vs local midnight. Soft gate, not server-enforced.

### 8. Seed sponsors (post-build, manual or scripted)
- 3 demo sponsors in Notion: Highland Inn, Devils Lake Bar & Grill, Sweet Spot.
- Active=true, Slot Count=1, Trial Ends=+30 days, Vendor PIN=4 digits each.
- Realistic deal labels (under 18 chars to fit wheel).

## Vercel Env Vars to Add

After local build works, push to Vercel:
- `NOTION_DB_PRIZE_WHEEL_SPONSORS`
- `NOTION_DB_PRIZE_WHEEL_CLAIMS`

(NOTION_TOKEN_BUSINESS already set in Vercel.)

## Out of Scope (Save for Post-Pitch)

- Corner pill UI + first-visit auto-open
- Daily reset on user's local midnight (current localStorage gate is fine for demo)
- Sponsor self-onboard / Stripe billing
- A2P SMS notifications
- Multi-community templating
- Lift to Yetickets/Yeti Web Services as productized offering
