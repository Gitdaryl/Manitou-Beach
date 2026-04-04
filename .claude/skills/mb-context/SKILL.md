---
name: mb-context
description: Load full Manitou Beach project context before writing any code. Use ONLY when the user explicitly asks to add, fix, edit, build, or change something in the codebase - i.e. when about to touch App.jsx, an API file, or any project file. Do NOT trigger for questions, strategy discussions, planning conversations, or general mentions of the project name.
---

# Manitou Beach - Project Context

## What This Is

A community platform for Manitou Beach, Michigan. React 18 monolith on Vercel. The entire frontend lives in one file: `src/App.jsx` (~10,500+ lines). Do NOT refactor into multiple files.

Co-branded: **Holly & The Yeti · Devils Lake**
Owner: Daryl Young | Agency: Yeti Groove Media

---

## Stack & Run Commands

- React 18 + Vite | `npm run dev` | `npm run build`
- Vercel serverless APIs in `/api/` (13 endpoints)
- Notion CMS, Stripe checkout, beehiiv newsletter, ElevenLabs voice concierge (pending), Vercel Blob

---

## Design Tokens (C object - use these, never raw hex)

```js
C.cream      = '#FAF6EF'   // page background
C.warmWhite  = '#F5F0E8'   // section backgrounds
C.sand       = '#E8DFD0'   // borders
C.sage       = '#7A8E72'   // primary green
C.sageDark   = '#5C6E55'
C.lakeBlue   = '#5B7E95'
C.lakeDark   = '#3A5F78'
C.dusk       = '#2D3B45'
C.night      = '#0A1218'
C.sunset     = '#D4845A'
C.sunsetLight= '#E8A882'
C.driftwood  = '#B8956A'
C.text       = '#3B3228'
C.textLight  = '#6B5D52'
C.textMuted  = '#9B8E85'
```

Fonts: Libre Baskerville (serif headings), Libre Franklin (sans body), Caveat (cursive accents)

---

## Architecture Rules

- `src/App.jsx` is intentionally monolithic - one file, always
- Inline CSS-in-JS throughout (no CSS modules, no Tailwind)
- `GlobalStyles` component at top has a `<style>` tag for media queries / CSS classes
- All responsive overrides go in GlobalStyles, not inline
- Add mobile breakpoints at `768px` (and `640px` for fine-tuning)

---

## Reusable Components (already in App.jsx - use these)

| Component | Use for |
|---|---|
| `<Btn href variant small target rel style>` | All buttons - variants: primary, outline, dark, outlineLight, sunset |
| `<FadeIn delay direction>` | Scroll-in animations |
| `<SectionLabel light>` | Small uppercase label above headings |
| `<SectionTitle center>` | Section h2 headings |
| `<WaveDivider topColor bottomColor flip height>` | Wave transitions between sections |
| `<DiagonalDivider topColor bottomColor height>` | Diagonal slice transitions |
| `<ShareBar>` | Social share bar |
| `useCardTilt(degrees)` | Tilt effect hook for cards |

---

## Routes

| Path | Component |
|---|---|
| `/` | HomePage |
| `/happening` | HappeningPage (events calendar) |
| `/featured` | FeaturedPage (business listing + pricing) |
| `/promote` | PromotePage (event promotion packages) |
| `/dispatch` | DispatchPage (blog index) |
| `/dispatch/:slug` | DispatchArticlePage |
| `/yeti-admin` | YetiDeskPage (admin only) |
| `/round-lake` | RoundLakePage |
| `/village` | VillagePage |
| `/wineries` | WineriesPage |
| `/fishing` | FishingPage |
| `/devils-lake` | DevilsLakePage (anchor on homepage) |
| `/mens-club` | MensClubPage |
| `/historical-society` | HistoricalSocietyPage |

---

## Revenue Model

**Business Listings (penny-per-subscriber):**
- Enhanced $9 · Featured $23 · Premium $43/mo (base)
- Formula: `price = base + max(0, subCount - 100) * 0.01`
- First 100 subscribers: founding rate flat
- Sub #101+: rises $0.01/subscriber - grandfathered forever at sign-up price
- `GRACE = 100` | `SPOTS_LEFT` / `SPOTS_TOTAL` constants at top of file

**Newsletter add-ons:** Mention $29/issue · Feature $75/issue · Monthly Sponsor $199/mo

**Tier names:** Enhanced / Featured / Premium (never Starter, Silver, Gold, Spotlight)

---

## Key Data Structures

- `VILLAGE_BUSINESSES` - hardcoded array for Walk the Village section (not Notion-driven)
- `PAID_TIERS` - dynamic array built from subscriber count (subscriber-based pricing)
- `PROMOTE_PACKAGES` - event promotion tiers
- `FEATURED_TIERS` - simplified waitlist tiers (Enhanced/Featured/Premium)
- `CAT_COLORS` - category → accent color map

---

## API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET/POST /api/events` | Events |
| `GET/POST /api/businesses` | Business directory (`?all=true` bypasses status filter) |
| `GET/POST /api/admin-articles` | Admin article management |
| `GET /api/dispatch-articles` | Public blog articles |
| `POST /api/generate-article` | AI article generation |
| `POST /api/upload-image` | Image upload to Vercel Blob |
| `POST /api/submit-claim` | Blackbird Cafe claim system |
| `GET /api/hero` | Dynamic hero (14-day window) |
| `GET /api/promotions` | Active promotions |
| `POST /api/create-checkout` | Stripe business listing |
| `POST /api/create-promo-checkout` | Stripe event promotion |
| `POST /api/subscribe` | beehiiv newsletter subscribe |
| `GET /api/dispatch-ads` | Ad slots for blog |

---

## Navbar Behaviour

- Transparent (not solid): all text **white** (`rgba(255,255,255,0.7)`)
- On scroll (solid): frosted glass `rgba(250,246,239,0.55)` + `blur(20px)`
- On scroll text: logo → `C.dusk`, nav links → `C.text`
- Pattern for color: `solid ? C.text : "rgba(255,255,255,0.7)"` - never hardcode one state
- Desktop CTAs: "List Your Business" (primary/sage) + "List Your Event" (sunset)
- Mobile CTAs: same, stacked vertically

---

## Images (public/images/)

Key images to know:
- `dispatch-header-web.jpg` - Dispatch page hero + article fallback
- `holly_yeti.png` - portrait cutout (HollyYetiSection, maxWidth 280px)
- `DL-boat.jpg` - parallax break on DevilsLakePage
- `mens-club-hero.jpg` - MensClubPage parallax hero
- `corks-kegs-logo.png` - Corks & Kegs winery logo
- `mens-club/` - 13 gallery photos
- `fish/` - 8 fish species JPGs
- `yeti/` - 20 Yeti images

---

## Lake Facts (confirmed correct)

- **Devils Lake**: 1,330 acres, 65 ft deep, warm-water, public launch at Manitou Rd, 600+ boat slips
- **Round Lake**: 515 acres, 67 ft deep, glacial kettle lake, cold-water, ~918 ft elevation
- Do NOT use 925 acres / 70 ft for Round Lake - those are wrong for Lenawee County

---

## Daryl's Pricing Instinct Warning

Daryl underprices by instinct (poverty background). When his gut says "too high" - trust market data. The platform is worth $40–60K at market rate. See `pricing-strategy.md` in memory for full context.

---

## Before Writing Any Code

1. The file is `src/App.jsx` - read the relevant section before editing
2. Use `C.` tokens, never raw hex
3. Add CSS classes to GlobalStyles for responsive behaviour, not inline
4. Btn component accepts: `href variant small target rel style` props
5. Run `npm run build` mentally - check for JSX syntax errors before saving
6. Always check for `SPOTS_LEFT === 0` (waitlist mode) when touching FeaturedPage
