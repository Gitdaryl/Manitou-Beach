# Prize Wheel — Founding/Comp Offer (NEXT SESSION PICKUP)

Status: PLANNING. Yeti will return to wire up complimentary "founding sponsor"
spots on the prize wheel. This note captures what's decided, what's already
built, and the open questions still to think through — so we start fast.

---

## The goal
Offer a FREE two-week "founding sponsor" spot on the wheel to seed the first
businesses and generate social proof, then convert them to paid. "Comp spots" =
$0 founding placements, granted manually at first.

## Strategy already discussed (decided)
- **Framing: scarcity, not discount.** "Founding sponsor — free for the first
  two weeks, limited to the first X businesses." Protects future pricing.
- **Distribution = the sponsors themselves.** Give each founding business a
  printable "Spin to Win" QR table-tent for their counter. Their foot traffic
  drives spins → redemptions → proof, and solves "how does anyone find /spin."
- **Conversion lever = a trial-ending performance email.** ~3 days before the
  free window ends, auto-email the business their numbers ("38 spins, 12
  redeemed — keep your spot for $X?"). The won-vs-redeemed data already exists.
- Traffic is NOT the problem: ~800 visitors/week, ~2,300 page views (Jun 2026).
  The job is FUNNELING that existing traffic to /spin.

## Already built (don't rebuild)
- Wheel spin + win logic (`src/pages/SpinPage.jsx`)
- Coupon issue: email + (new) optional SMS, 7-day expiry, server-side 1/email/day
  limit (`api/prize-wheel/claim.js`)
- Merchant redemption (`PrizeRedeemPage`, `api/prize-wheel/redeem.js`)
- Per-sponsor analytics dashboard via magic link `/sponsor/:id?pin=XXXX`
  (`SponsorStatsPage`, `api/prize-wheel/sponsor-stats.js`)
- Sponsors read from Notion `NOTION_DB_PRIZE_WHEEL_SPONSORS` (Active checkbox,
  Slot Count 1-3, Logo URL, Vendor PIN); filler "Spin Again" segments

## Technical pieces identified (to build when Yeti returns)
1. **Sponsor lifecycle** — add a "Paid Until" date + auto-deactivate cron when it
   lapses; a "Founding Sponsor" ($0) status. Same mechanism for free trials and
   paid. THIS is what turns "a wheel" into a sellable, time-bound product.
2. **Trial-ending performance email** — cron + Resend, fires N days before expiry
   with spin/redemption stats and a continue/convert prompt.
3. **SMS consent line** — add opt-in text near the new phone field in SpinPage
   (TCPA/A2P). Should land before promoting the SMS path.
4. **Funnel tracking** — capture visitors → spins → claims → redemptions. Today
   only redemptions are tracked; the funnel is the proof that converts trials.
5. Printable QR "Spin to Win" table-tent (art + QR) — Claude can generate.

## OPEN QUESTIONS to think through (Yeti's note — the reason for returning)
- **Onboarding form**: how does a business sign up for a (comp) spot? Fields,
  flow, self-serve vs. Yeti-entered. Possibly repurpose `CreateOfferPage.jsx` /
  `api/create-offer.js` (they exist but aren't wired to the wheel).
- **Offer verbiage**: how the deal/prize label + terms are written and
  constrained (length, what's allowed, "free coffee" vs "10% off", fine print).
- **Logo drop zone**: upload UX for the sponsor logo. Likely reuse
  `api/upload-image.js` with the existing `business-logos` folder; need a clean
  drag/drop + preview on the form.
- How a comp/founding spot is marked & granted (vs paid) in the data model.
- Conversion pricing (what they pay after the free window).
- Max businesses per wheel; spare-spot handling (extra spin / paid duplicate /
  dynamic segment count).

## Recommended first build when we resume
The sponsor lifecycle (#1) — it underpins both the free founding offer and paid
conversion. Then the trial-ending email (#2) and SMS consent (#3).
