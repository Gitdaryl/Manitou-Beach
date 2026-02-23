# Sonnet Task List — Manitou Beach

## Project Context
- **Stack**: React 18 + Vite, Vercel serverless functions, Notion as CMS
- **Key file**: `src/App.jsx` — monolithic single file (~4,700 lines), all components/styles/logic
- **API endpoints**: `/api/` directory — submit-business.js, submit-event.js, create-checkout.js, events.js, upload-image.js
- **Deployed**: Vercel, GitHub repo at Gitdaryl/Manitou-Beach
- **Run**: `npm run dev` | **Build**: `npm run build`
- **Important**: App.jsx is intentionally monolithic — don't refactor into multiple files

---

## Task 1: Dynamic Hero Events (Notion-powered)
**Priority: HIGH**

The homepage hero should dynamically swap to promote upcoming key events, pulled from a Notion database.

**How it works:**
- Notion database: "Manitou Beach Hero Events"
- Env vars already set: `NOTION_TOKEN_HERO`, `NOTION_DB_HERO`
- Columns in Notion: `Event Name` (title), `Date` (date), `Tagline` (rich_text), checkbox column (likely "Active" — toggle to make it live), `Hero Image URL` (url), `Hero Video URL` (url)

**Logic:**
1. Create new API endpoint: `api/hero-event.js`
   - Fetch from Notion using `NOTION_TOKEN_HERO` / `NOTION_DB_HERO`
   - Filter: checkbox is checked AND date is within 14 days from now (or in the future)
   - Return the single active hero event (or null if none active)
   - Cache for 5 minutes (same pattern as `api/events.js`)
2. In App.jsx `Hero` component:
   - On mount, fetch `/api/hero-event`
   - If an active hero event exists: swap in the event hero (event name as title, tagline as subtitle, hero image/video as background, CTA links to /happening or the event)
   - If no active event: show the default hero (current behavior)
   - Smooth crossfade transition between default and event hero
3. After the event date passes AND checkbox is unchecked, the default hero returns automatically

**User workflow in Notion:**
1. Create a row: "Taste of the Irish Hills", date June 15, tagline "Farm-to-table dining on the lake", upload hero image
2. Two weeks before: check the Active box → hero swaps on the live site
3. After the event: uncheck the box (or it auto-expires based on date)

---

## Task 2: Debug Event Submission
**Priority: HIGH**

The event submission form (`/api/submit-event.js`) returns "something went wrong" when submitting.

**Env vars are confirmed set** in Vercel: `NOTION_TOKEN_EVENTS` and `NOTION_DB_EVENTS`.

**Most likely cause**: Notion database schema mismatch. The API sends these property names — they must match EXACTLY (case-sensitive) in the Notion events database:
- `Event Name` — Title type
- `Category` — Rich text
- `Email` — Email type
- `Phone` — Phone number type
- `Description` — Rich text
- `Time` — Rich text
- `Location` — Rich text
- `Event Date` — Date type
- `Event URL` — URL type (**newly added — probably missing from Notion**)
- `Image URL` — URL type (**may also be missing**)

**Fix approach:**
1. Add better error logging — return Notion's actual error message to help debug
2. Make `Event URL` and `Image URL` properties optional/resilient — if Notion rejects them, retry without those fields
3. Tell the user which Notion columns to add if missing

**Also**: Does the `upload-image.js` endpoint work? It needs `BLOB_READ_WRITE_TOKEN` env var for @vercel/blob (confirmed set in Vercel).

---

## Task 2: Fishing Info Page (`/fishing`)
**Priority: MEDIUM**

Build a dedicated fishing page for the two lakes. Content direction:
- Devils Lake: 157 acres, 30ft deep, warm-water species (largemouth/smallmouth bass, bluegill, crappie, pike, perch)
- Round Lake: 515 acres, 67ft deep, cold-water species (walleye, bass, pike, panfish)
- Include Tip-Up Festival cross-link to /mens-club page
- Boat launch locations, fishing regulations link (Michigan DNR)
- Seasonal guide (spring/summer/fall/winter + ice fishing)
- Use same page structure as RoundLakePage (hero, stats, sections, dividers)

Images: Check `public/images/` for any fishing-related images. Use explore-fishing.jpg if available for hero.

---

## Task 3: Wineries Page (`/wineries`)
**Priority: MEDIUM**

Build a dedicated wineries/breweries page. Current businesses with winery data in BUSINESSES array:
- Chateau Aeronautique (winery with aviation theme)
- Cherry Creek Cellars
- Gypsy Blue (tasting room)
- Ang & Co (wine bar)
- Faust House

Structure: Hero → Map/list of venues → Winery cards with details → "Plan Your Wine Trail" CTA
Link from the Wineries explore card on homepage.

---

## Task 4: Blog / Dispatch Section
**Priority: MEDIUM**

Build "The Manitou Beach Dispatch" — a simple blog section.
- Image exists: `public/images/dispatch-header.jpg` — use as the blog header
- Initially can be static content (hardcoded blog posts in App.jsx)
- Later: fetch from a Notion database (similar pattern to events.js)
- Route: `/dispatch` or section on homepage
- Keep it simple: title, date, excerpt, full article

---

## Task 5: Newsletter Integration (beehiiv)
**Priority: LOW**

Current newsletter form logs to console. Wire it to beehiiv:
- The `handleSubmit` in the newsletter sections currently just does `console.log("Newsletter signup:", email)`
- Replace with actual beehiiv API call or embed code
- User will provide beehiiv publication ID / API key
- There are 3 newsletter touchpoints: main NewsletterBar, NewsletterInline (on sub-pages), and any future footer placement

---

## Task 6: Browse Stays / Community Guide Destinations
**Priority: LOW**

The "Living Here" section has cards for Buying a Home, Local Schools, Community Guide, and Browse Stays.
- "Browse Stays" should link somewhere (Airbnb search for Manitou Beach? Or a curated stays page?)
- "Community Guide" could link to a simple page or PDF
- Decide with user what these should do

---

## Task 7: Events Page Filters — FREE / Family-Friendly
**Priority: LOW**

The `/happening` page CalendarSection has filter tabs (All, Live Music, Food & Social, etc.)
- Add "Free" filter — show events where cost is "Free" or "$0"
- Add "Family" filter — need a way to tag events as family-friendly
- Cost data is in each event's `cost` field

---

## Task 8: Round Lake Polaroid Gallery
**Priority: LOW**

Add a polaroid-style photo gallery to the Round Lake page (`/round-lake`).
- Slightly rotated photos with white borders and captions
- Can be a simple CSS-only approach (transform: rotate, white padding, box-shadow)
- User will provide photos — check `public/images/` for any round-lake-gallery-* images

---

## Task 9: Fish Species Real Photos
**Priority: LOW**

The RoundLakeFishingSection in the Round Lake page shows 8 fish species with emoji icons.
- Replace emoji with real fish images (user will provide or use public domain)
- Check `public/images/` for any fish-* images

---

## Task 10: Business Scraping + Claim Listing
**Priority: FUTURE**

Scrape Google Maps / Yelp for Manitou Beach area businesses and pre-populate the directory.
- Add "Claim this listing" button on unclaimed business cards
- Claimed = verified owner, can edit details
- This is a bigger feature — discuss approach with user first

---

## Images to Expect
The user is creating images before starting this session. Look for NEW images in `public/images/`:
- **Men's Club gallery**: `public/images/mens-club/` directory (Tip-Up Festival, Firecracker 7K, community events)
- **Historical Society**: Village/Boat House photos
- **Men's Club logo**: 400x400px PNG
- **MBHRS logo**: 400x400px PNG
- **Holly & Yeti section**: 800x1000px PNG portrait cutout
- **Round Lake gallery**: Polaroid-style lake photos
- Any other new images the user adds

When starting, run `ls public/images/` and `ls public/images/mens-club/ 2>/dev/null` to see what's available.

---

## Env Vars in Vercel (ALL CONFIRMED SET)
All of these are already configured in Vercel:
- `STRIPE_SECRET_KEY` — for featured listing checkout (added 14h ago)
- `BLOB_READ_WRITE_TOKEN` — for Vercel Blob image uploads (added 2d ago)
- `NOTION_TOKEN_HERO` — for hero event swap feature (added 3d ago)
- `NOTION_DB_HERO` — hero events database ID (added 3d ago)
- `NOTION_TOKEN_BUSINESS` — for business submissions (added 3d ago)
- `NOTION_TOKEN_EVENTS` — for event submissions (added 3d ago)
- `NOTION_DB_BUSINESS` — business database ID (added 3d ago)
- `NOTION_DB_EVENTS` — events database ID (added 3d ago)
- `SITE_URL` — **NOT YET SET** — needs to be added once custom domain is connected

---

## Domain Name Question
Connecting a custom domain to Vercel doesn't change how the code works. The APIs will work the same. The only thing to update is:
- Set `SITE_URL` env var in Vercel to the custom domain (e.g. `https://manitoubeach.com`)
- This ensures Stripe checkout redirects go to the right place
- OG image meta tags in `index.html` should use absolute URLs once domain is set

---

## Village Page Additions (if not done)
- **Lock archway**: Add a section/card about the iconic Lock archway at the village entrance
- **Historical Society link**: Add a link/card pointing to `/historical-society`
- **Children's arts programs**: Link to manitoubeachcreative.org
- **Boat House Gallery**: Link to gallery info (already on /historical-society page)
