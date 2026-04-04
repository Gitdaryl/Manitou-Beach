# LLLC Summerfest - Annual Turnover Checklist
**For Daryl** - what needs to change each year, what doesn't

---

## What Changes Every Year (5 things max)

| Item | Where it lives in the code | How to update |
|------|---------------------------|---------------|
| Event date + time | `LadiesClubHero` → countdown ISO string | Change `"2026-06-20T13:00:00.000Z"` |
| Date badge display | `LadiesClubEventsSection` → "June 20th, 2026" text | Update literal string |
| Time display | Same section → "Saturday · 9:00 AM – 2:00 PM" | Update literal string |
| Event logo | `public/images/ladies-club/summer-festival.png` | Replace file (keep same filename) |
| Sponsor deadline note | Bottom of tier section → "March 20th, 2026" | Update literal string |

That's it. Everything else - mission, about, join flow, vendor signup, get involved, gallery - stays the same year to year.

---

## What Should NOT Require Manual Changes (the automation goal)

- **Sponsors** → should auto-populate from sponsorship form submissions (Phase 1.5)
- **Gallery** → should be uploadable by Michele directly (Phase 2)
- **"What to Expect" features** → almost never changes, leave hardcoded

---

## Phase 1.5 - Wire Sponsors to Auto-Populate

Currently the `CommunityDonationForm` on the page sends an email. Daryl manually adds sponsors to the hardcoded arrays.

**Target state:** Form submission → writes to Notion DB → `LadiesClubSponsorsSection` fetches from Notion at runtime → no manual code changes.

**What to build:**
- Notion DB: `LLLC Sponsors 2026` - columns: Name, Tier, Logo URL, Website, Active (checkbox)
- `/api/lllc-sponsors.js` → GET: query Notion, return JSON grouped by tier
- `LadiesClubSponsorsSection` → fetch on mount, fall back to hardcoded if API fails
- Sponsorship form → on submit, write to Notion DB + send email notification to Michele
- Michele logs into Notion → checks the "Active" checkbox for each confirmed sponsor → it appears on the page

**The key:** Michele controls what appears. She clicks a checkbox. No code. No Daryl.

---

## Year Turnover SOP (once above is built)

1. Michele emails new event logo (PNG preferred)
2. Daryl drops it in as `/images/ladies-club/summer-festival.png`
3. Daryl updates 4 text strings (date, time, sponsor deadline) - 10 minutes total
4. New sponsors fill out the form → Michele checks them off in Notion → they appear
5. Done

**Total Daryl time per year: ~20 minutes** (down from multi-hour manual edit sessions)
