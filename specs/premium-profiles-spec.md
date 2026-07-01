# Premium Profiles Spec — 2026-07-01

Written by Fable after visual review (desktop 1440 + mobile 390 audit) of the live site.
Goal: profile & event-detail pages should feel premium to the businesses paying $9/$25/$49,
and effortless to visitors. Use ONLY the existing design vocabulary: palette `C` from
src/data/config.js, Libre Baskerville / Libre Franklin / Caveat, FadeIn / useCardTilt /
WaveDivider from src/components/Shared.jsx. No new dependencies. No new animation libraries.

## Principles
1. Never show a blank viewport. Reveals must trigger BEFORE content enters view.
2. Ops/plumbing UI (claim boxes, upsells, "add a photo" nags) is never the first thing a
   visitor sees, and is NEVER shown for claimed/paid listings.
3. Hero is never a flat void. Photo-forward when a photo exists; branded fallback otherwise
   (layered C.night→C.lakeDark gradient + existing lake imagery with the kenBurnsBg class).
4. Every change respects prefers-reduced-motion (pattern already in Layout.jsx).
5. Copy passes the "would my 70-year-old neighbor smile?" test (see CLAUDE.md).

## A. BusinessProfilePage.jsx (src/pages/BusinessProfilePage.jsx ONLY)
Observed: dark hero is an empty gradient void (tiny 110px logo, no cover image), paid
"Front and Center" verified listing (blackbird-cafe) still shows BOTH "Get found when people
search Google … Claim your listing" AND "Is this your business? Claim This Listing".
1. Hero: if listing has photos/cover → full-bleed cover with dark gradient scrim.
   Else: branded fallback — gradient + subtle Ken Burns lake texture (reuse an existing
   /public/images asset), so it never looks empty. Logo 140px with soft ring. Name in
   Libre Baskerville, clamp(2.5rem, 6vw, 4rem).
2. Hide claim/Google-upsell modules whenever the listing is claimed OR on any paid tier.
   Investigate how tier/claimed status arrives from the API and gate on it. Unclaimed free
   listings keep ONE claim module, moved to the bottom above the footer.
3. Content order after hero: About → Hours & Contact cards → Photos (if any) → related
   offers/events (if data exists) → Map. Wrap sections in FadeIn, stagger ≤ 80ms.
4. Sticky bottom action bar: keep, but max-width 720px centered pill on desktop, and add
   page bottom padding so it never covers the footer.
5. If loves/testimonials exist for the business, surface them as chips (parity with trucks).

## B. FoodTruckProfilePage.jsx + EventDetailPage.jsx (those two files ONLY)
FoodTruckProfilePage — observed: strong hero photo + overlap card (keep!), but body is thin
(contact card only), love-chips from the listing page don't carry over, featured trucks still
show "Is this your truck? CLAIM THIS LISTING", mobile h1 is 20px.
1. Mobile h1 ≥ 28px.
2. Add loves count + love chips (same data the /food-trucks cards use) to the profile.
3. Add "Find us" section: current check-in status (ON THE LAKE pill already exists),
   next/regular schedule if data exists; otherwise link to the live map/all trucks.
4. Menu / Menu-Info link made prominent (button row in the overlap card).
5. Hide the claim box for claimed/featured trucks; unclaimed keep it at page bottom.
EventDetailPage — observed: solid hero + info cards + related events. Issues: first element
under hero is an ops banner ("Is this your event? Add a photo … Update event"); mobile h1 24px.
6. Demote the ops banner to a small text link above the footer.
7. Add an "Add to Calendar" action (generate .ics client-side, no deps) next to Share.
8. If the venue string matches a business listing, link it to /business/:slug.
9. Wrap sections in FadeIn consistent with the rest of the site; mobile h1 ≥ 28px.

## C. Global fixes (src/components/Shared.jsx, Layout.jsx, HomePage.jsx, public/videos)
1. FadeIn (Shared.jsx): IntersectionObserver rootMargin '0px 0px 200px 0px' so reveals fire
   ~200px before entry; duration 0.55s; cap delay at 150ms; if element is already in the
   viewport on mount, show immediately (no animation). This kills the blank-viewport-while-
   scrolling problem seen on Home, Food Trucks and profiles.
2. Home bottom bug: jumping to page bottom (End key) leaves a white void and the fixed navbar
   detaches and renders mid-page. Likely a transform/animation on an ancestor creating a
   containing block for position:fixed, or the sponsor-billboard section. Reproduce with
   puppeteer (scripts/ has examples), diagnose, fix.
3. Remove "Yeti Test Business" (and any test-flagged listing) from public directory output —
   filter at the API layer if possible so all pages inherit it.
4. Videos: rename "public/videos/events hero.mp4" → "events-hero.mp4" (update references);
   add poster images + preload="metadata" to all autoplay hero videos. If ffmpeg is easy to
   install, transcode events hero (9.5MB) and re-upload foodtruck loop (7MB) targets ≤ 3MB
   1080p; otherwise leave a note in the report.
5. Do NOT touch pricing, copy tone, or nav structure.

## Process rules for agents
- Work on the VPS repo /root/Manitou-Beach via the available remote-project tools.
- Verify with `npm run build` (and scripts/dom-health.mjs where relevant).
- Do NOT git commit, push, or deploy. Leave changes in the working tree and report:
  files changed, what changed, how verified, anything you couldn't do.
- Stay strictly inside your assigned files listed above.
