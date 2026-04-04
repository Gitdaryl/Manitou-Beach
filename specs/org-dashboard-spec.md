# Org Self-Serve Dashboard - Full Spec
**Status:** Phase 2 ready to build | Phase 3 roadmapped
**Trigger:** Build Phase 2 when 2nd org needs same edit types as LLLC
**First implementation:** LLLC (Land & Lake Ladies Club, Michele Henson)

---

## The Problem in One Sentence

Every gallery swap, sponsor update, and event date change requires a developer. Non-technical org contacts default to calling Daryl. That doesn't scale past 3 orgs.

---

## Design Principles - "The Grandma Test"

Every decision goes through this filter: **Would my 70-year-old neighbor figure this out without asking for help?**

If the answer is no, simplify it.

**Rules:**
- No technical vocabulary. Not "upload" - say "Add a photo." Not "publish" - say "Save."
- One clear action per screen. No menus inside menus.
- Errors speak English: "That didn't save. Try again?" - never a stack trace.
- Mobile-first. She's probably on her phone.
- Big tap targets. Minimum 44px touch area on all buttons.
- After every save: show them what changed. Let them feel it.

---

## Magic Moments Map

These are the moments that turn a skeptical non-tech user into a champion who tells other clubs.

| Action | What she does | Magic moment |
|--------|--------------|--------------|
| First login | Types password, taps Go | Animated welcome card with LLLC logo: "Welcome back, Michele! Your page looks great." |
| Upload photo | Taps "Add Photos," picks from phone | Thumbnail appears instantly in the grid - she sees it before she even saves |
| Save gallery | Taps "Save Gallery" | Confetti burst → "Your gallery is live!" → [See it now →] opens real page in new tab |
| Add sponsor | Types name, taps Add | Sponsor appears in the list immediately |
| Update event date | Picks new date on calendar | Shows new countdown preview ("87 days away!") inline |
| Save anything | Any save action | Brief spinner → green checkmark → "Saved! Your page is updated." → link to live page |

The [See it now →] link is mandatory on every save. That's the payoff. She needs to see her work on the actual website.

---

## Data Architecture

### The Problem with Hardcoded JSX

Currently in `LadiesClubPage.jsx`:
- Gallery: `Array.from({ length: 16 }, ...)` - cannot change without code deploy
- Sponsors: `const PLATINUM = [...]` - hardcoded array
- Event date: `"2026-06-20T13:00:00.000Z"` - hardcoded string
- Map: `/images/ladies-club/summerfest-map.jpg` - hardcoded path

### The Solution: Org Data JSON in Vercel Blob

Each org gets a JSON config file in Vercel Blob: `org-data/[slug].json`

```json
{
  "gallery": [
    { "url": "https://[blob-url]/lllc/gallery/summerfest-1.jpg", "alt": "Summerfest 2025" },
    { "url": "https://[blob-url]/lllc/gallery/summerfest-2.jpg", "alt": "" }
  ],
  "sponsors": {
    "platinum": [
      { "name": "Adrian Steel", "logo": "https://[blob-url]/lllc/sponsors/adrian.jpg", "url": "https://adriansteel.com" },
      { "name": "Dave & Jose", "logo": null, "url": null }
    ],
    "gold": [
      { "name": "Mark Riggle Real Estate", "logo": "https://[blob-url]/lllc/sponsors/riggle.jpg", "url": null }
    ]
  },
  "event": {
    "name": "Summerfest 2026",
    "date": "2026-06-20T13:00:00.000Z",
    "description": "A full day of live music, arts, crafts, food, and family fun.",
    "mapUrl": "https://[blob-url]/lllc/map/summerfest-map.jpg"
  },
  "meta": {
    "lastUpdated": "2026-04-04T18:00:00Z",
    "updatedBy": "Michele"
  }
}
```

**Why JSON-in-Blob instead of Notion:**
- Writes are instant (no Notion API latency)
- No Notion rate limits on read
- Self-contained - org page fetches one URL
- Easy to inspect, backup, and seed for new orgs

**Fallback:** If Blob fetch fails, page falls back to hardcoded defaults. Nothing breaks.

### API Endpoints Needed

**`/api/org-data.js`**
- `GET ?slug=lllc` → returns current JSON from Blob
- `POST` with `{ slug, section, data }` + admin token → writes updated section to Blob

**`/api/org-upload.js`**
- `POST` with file + slug + type (gallery/sponsor/map) → uploads to Vercel Blob → returns URL
- Auth: org-specific token in header

---

## Auth Model

**Keep it simple. One password. No username.**

- URL: `/ladies-club/dashboard` (memorable, not `/admin/lllc` - too techie)
- On arrival: full-page password screen, large input, large "Let me in" button
- Password stored in env var: `LLLC_DASHBOARD_PASS`
- On success: store token in `sessionStorage` (expires when browser closes - fine for this use case)
- On failure: "That's not quite right. Try again?" - warm, not alarming

**No email login. No forgot-password flow. No MFA.**
If she forgets the password, she calls Daryl once. That's better than building auth infrastructure for a club president.

---

## Dashboard UI - Section by Section

### Layout
- Full-page, org-branded (club color, club logo at top)
- Navbar: just "LLLC Dashboard" + "View Live Page →" link
- Sections stacked vertically, each a card
- Mobile scrolls naturally (follow global SOP - never trap scroll)

---

### Section 1: Event Details
**First because it's the most urgent thing to update each year.**

Fields:
- Event Name (text input, pre-filled)
- Event Date + Time (date/time picker, large, mobile-friendly)
- Short Description (textarea, 160 char max with counter - "like a tweet")

Live preview: As she types the date, show "That's X days from now!" inline.

Save button: "Save Event Info" → spinner → "Saved! ✓"

---

### Section 2: Festival Map
**Simple - one image, replace it.**

Shows: current map at full width (clickable to zoom)
Action: "Update Map" button → file picker → shows new image preview immediately
Save button: "Use This Map" → uploads to Blob → updates JSON → "Map updated! ✓"

No drag-drop required. Just a file picker. She knows how to pick a file from Photos.

---

### Section 3: Gallery
**The most visual, highest magic moment potential.**

Current state: grid of thumbnails, 4 columns on desktop, 2 on mobile
Each thumbnail: X button in corner to remove

"Add Photos" button: opens native file picker, allows multi-select (up to 20 at once)
On select: thumbnails appear in the grid immediately (before upload - use object URLs)
Order: drag handles (desktop) OR up/down arrows (simpler, works on mobile)

Save button: "Save Gallery" → uploads all new files to Blob in parallel → rewrites JSON → confetti → "Your gallery is live! [See it now →]"

Note: Show upload progress per image ("Saving photo 3 of 7...")

---

### Section 4: Sponsors
**Two tiers: Platinum and Gold. Each is a sortable list.**

Each sponsor row:
- Logo (thumbnail or placeholder silhouette if no logo)
- Name (editable inline)
- Website URL (optional, editable inline)
- [Upload Logo] button (small) → file picker → instant preview
- [Remove] button (trash icon, tap-to-confirm)

"Add Platinum Sponsor" / "Add Gold Sponsor" buttons at bottom of each section.
New sponsor: appears as blank row, focus goes to name field.

Reorder: up/down arrows (no drag - too hard on phone)

Save button: "Save Sponsors" → writes JSON → "Sponsors updated! ✓"

---

## Template Architecture - How New Orgs Are Added

One config file governs all orgs. Adding a new org = one config entry + one env var + one Blob seed.

### `/src/data/orgConfigs.js`

```js
export const ORG_CONFIGS = {
  lllc: {
    slug: "lllc",
    name: "Land & Lake Ladies Club",
    shortName: "LLLC",
    dashboardPath: "/ladies-club/dashboard",
    livePath: "/ladies-club",
    color: "#5B8B5A",
    logo: "/images/landlake-club-logo.png",
    passwordEnvVar: "LLLC_DASHBOARD_PASS",
    sections: ["eventDetails", "map", "gallery", "sponsors"],
    sponsorTiers: ["platinum", "gold"],
  },
  // Future orgs:
  // drlmc: { slug: "drlmc", name: "Devils Lake Men's Club", ... }
  // winetrail: { slug: "winetrail", name: "Irish Hills Wine Trail", ... }
};
```

### New Org Checklist (2 hours of work, not a custom build)

1. Add entry to `ORG_CONFIGS` - pick which `sections` they need
2. Add `[SLUG]_DASHBOARD_PASS` env var in Vercel
3. Add route in `App.jsx`: `<Route path="/[slug]/dashboard" element={<OrgDashboardPage slug="[slug]" />} />`
4. Seed initial Blob JSON: copy template, update paths
5. Update org's page component to `useFetch('/api/org-data?slug=[slug]')` instead of hardcoded arrays
6. Done. Live in 2 hours.

---

## Component Plan

```
src/pages/OrgDashboardPage.jsx       ← Shell + auth gate (takes slug prop)
src/components/org-dashboard/
  DashboardAuth.jsx                  ← Password screen
  DashboardShell.jsx                 ← Branded wrapper, nav
  EventDetailsSection.jsx            ← Event name/date/desc
  FestivalMapSection.jsx             ← Single image replace
  GallerySection.jsx                 ← Multi-photo grid manager
  SponsorsSection.jsx                ← Tiered sponsor list editor
  SaveButton.jsx                     ← Spinner → success → link
  MagicMomentToast.jsx               ← Confetti + "live!" message
api/
  org-data.js                        ← GET + POST org JSON
  org-upload.js                      ← File upload to Blob
```

---

## Phase Triggers

| Phase | Trigger | What gets built |
|-------|---------|-----------------|
| **Phase 1 (done)** | First org (LLLC) - manual edits by Daryl | Current hardcoded LadiesClubPage |
| **Phase 2** | 2nd org needs same edit types | Full dashboard spec above, LLLC migrated first |
| **Phase 3** | 5+ active orgs | Master provisioning UI, self-serve onboarding, no env var per org |

---

## Phase 3 Vision (Don't Build Yet)

When 5+ orgs are self-editing regularly:

- Each org gets `/org/[slug]/dashboard` (unified URL pattern)
- Admin creates new orgs from a UI (no more env vars, no code)
- Org contacts set their own password
- Daryl's master view: all orgs, last-updated timestamps, which orgs are active
- Natural extension of Yetickets multi-tenant model
- This becomes a paid feature: "Manage your page yourself - included in your $49/mo plan"

---

## What NOT to Build in Phase 2

- No rich text editor (they'll break it)
- No user accounts / email login
- No analytics on their own page (confusing)
- No publish/draft workflow (they don't think in drafts)
- No image cropping tool (use browser's native - it's good enough)
- No undo history (just let them re-save)

**The temptation to over-build this is high. Resist it. The power is in the simplicity.**
