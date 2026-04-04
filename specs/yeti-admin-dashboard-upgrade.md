# Yeti Admin Dashboard Upgrade - Sonnet Build Spec

**Date:** 2026-03-27
**Builder:** Sonnet
**File:** `src/pages/YetiAdminPage.jsx`
**Scope:** Enhance the Dashboard tab + Newsletter Composer QoL improvements

---

## PART 1: Dashboard Tab Overhaul

The current Dashboard tab shows only editorial metrics (subscriber count, published/draft counts, last article) plus maintenance tools (geocoding, USA250 status, ad slot monitor). It tells you nothing about money, platform health, or what needs your attention.

### What to build: A "Morning Glance" dashboard

Replace the current Dashboard tab content with a reorganized layout. Keep all existing tools - just add the missing operational panels above them.

---

### 1A. Money Row (new - top of dashboard)

**Data source:** New API endpoint `/api/admin/revenue-summary`

This endpoint calls the Stripe API (`stripe.subscriptions.list`) and returns:

```json
{
  "mrr": 234,
  "activeSubscriptions": 12,
  "byTier": { "Basic": 6, "Enhanced": 4, "Featured": 2 },
  "pastDue": [
    { "name": "Diamond in the Ruff", "email": "...", "amount": 25, "daysOverdue": 3 }
  ],
  "thisMonth": 234,
  "lastMonth": 189,
  "wineSeason": { "partners": 4, "revenue": 1116 }
}
```

**Implementation notes for the API:**
- Require `X-Admin-Token` header (same auth as all admin endpoints)
- Use `stripe.subscriptions.list({ status: 'active', limit: 100 })` for active subs
- Use `stripe.subscriptions.list({ status: 'past_due', limit: 100 })` for past-due
- Parse `metadata.tier` or price amount to determine tier ($9 = Basic, $25 = Enhanced, $49 = Featured)
- Wine season revenue: look for one-time payments of $279 (wine partner)
- Cache for 5 minutes (use a simple in-memory cache variable with timestamp) - Stripe rate limits matter

**UI - 4 KPI cards in a row (same grid style as existing editorial cards):**

| Card | Value | Icon | Color | Subtitle |
|------|-------|------|-------|----------|
| MRR | `$234` | 💰 | C.sage | `12 active subscriptions` |
| By Tier | `6 / 4 / 2` | 📊 | C.lakeBlue | `Basic / Enhanced / Featured` |
| Past Due | `1` or `0 ✓` | ⚠️ or ✅ | red if >0, sage if 0 | Click to expand names |
| vs Last Month | `+$45` or `-$12` | 📈 or 📉 | green if up, sunset if down | `$189 → $234` |

**Past Due expansion:** If pastDue.length > 0, clicking the card expands a list below showing business name, amount, and days overdue. Each row has a "Copy email" button so Daryl can follow up quickly.

---

### 1B. Attention Queue (new - below money row)

**Data source:** New API endpoint `/api/admin/attention-queue`

This endpoint queries multiple Notion databases and returns:

```json
{
  "pendingEvents": 3,
  "pendingRatings": 5,
  "incompleteBiz": 2,
  "ghostTrucks": 1,
  "stalledOnboarding": 0
}
```

**How each count is derived:**

- `pendingEvents`: Query Events DB where `Status = "Pending Review"` - count
- `pendingRatings`: Query Winery Ratings DB where `Status = "Pending"` - count (you already have this in the ratings tab, just reuse the query)
- `incompleteBiz`: Query Business DB where `Logo` is empty OR `Description` is empty AND `Status = "Active"` - count
- `ghostTrucks`: Query Food Truck DB where `Status = "Active"` AND `Last Check-In` is empty or older than 30 days - count
- `stalledOnboarding`: Query Business DB where `Stripe Connect Account ID` exists AND `Stripe Connect Status != "complete"` - count (0 is fine, just show it)

**UI - Single horizontal strip with colored badges:**

```
┌──────────────────────────────────────────────────────────────┐
│  🔔 NEEDS ATTENTION                                         │
│                                                              │
│  [3 Events pending]  [5 Ratings to review]  [2 Incomplete]  │
│  [1 Ghost truck]     [0 Stalled onboarding ✓]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Each badge is a clickable pill:
- "Events pending" → switches to... well, there's no events review tab yet. For now, link to the Notion Events DB URL.
- "Ratings to review" → `setActiveTab('ratings')` + `setRatingsFilter('Pending')`
- "Incomplete listings" → expand inline showing business names + what's missing (no logo, no description)
- "Ghost trucks" → expand inline showing truck names + last check-in date
- Counts of 0 show as green with a checkmark. Counts >0 show as amber/orange.

**Cache:** 2 minutes. This makes multiple Notion queries so don't hit it on every tab switch.

---

### 1C. Existing Dashboard Content - Keep as-is, move below

Everything currently in the Dashboard tab stays but moves below the new panels:

1. Money Row (new)
2. Attention Queue (new)
3. Editorial metrics (existing 4-card grid - subscribers, published, drafts, last published)
4. Most Recent Article (existing)
5. beehiiv note (existing)
6. Refresh button (existing)
7. Geocode Businesses tool (existing)
8. USA250 Page Status (existing)
9. Ad Slot Monitor (existing)

Add a thin horizontal divider between the new operational panels and the existing editorial section. Label the divider: "Editorial & Tools"

---

### 1D. Loading States

When the dashboard tab loads, fire three parallel fetches:
1. `fetchDashboard()` (existing - editorial metrics)
2. `fetchRevenueSummary()` (new)
3. `fetchAttentionQueue()` (new)
4. `fetchAdSlots()` (existing)

Each panel shows its own loading skeleton independently. Don't block the whole page while one panel loads.

---

## PART 2: Newsletter Composer QoL Improvements

After reading the full newsletter tab implementation, here are the friction points and fixes:

---

### 2A. Issue Checklist (new - top of newsletter tab)

**Problem:** There's no way to see at a glance whether the newsletter is ready to send. Daryl has to mentally check each section.

**Fix:** Add a checklist strip at the very top of the newsletter tab, above Section 1:

```
┌──────────────────────────────────────────────────────────────┐
│  📋 ISSUE CHECKLIST                                         │
│                                                              │
│  ✅ Date set (Apr 3)    ✅ Subject line     ⬜ Weekend events │
│  ✅ Article selected    ⬜ Ad slot          ⬜ Preview checked│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Logic:**
- Date set: `nlDate` is truthy → green
- Subject line: `nlSubject.trim().length > 0` → green
- Weekend events: `nlWeekendText.trim().length > 0` → green
- Article selected: `nlArticleId` is truthy → green. If selected but draft (not blogSafe), show amber with "⚠️ Draft"
- Ad slot: `nlAdId` is truthy → green. If empty, show as gray (optional, not blocking)
- Preview checked: new state `nlPreviewChecked` - set to true when user scrolls the preview iframe into view or clicks the preview panel header. Resets when any content changes.

This is purely informational - no blocking behavior.

---

### 2B. "Send to beehiiv" Workflow Improvement

**Problem:** The current flow is: build newsletter → copy HTML → open beehiiv → paste. The copy button is at the very bottom inside the preview panel. Easy to miss.

**Fix:**
1. Add a **sticky action bar** at the bottom of the newsletter tab when content exists (at least subject + article OR weekend events):

```
┌──────────────────────────────────────────────────────────────┐
│  📋 Copy HTML to Clipboard    │    🔗 Open beehiiv →        │
└──────────────────────────────────────────────────────────────┘
```

Style: fixed to bottom of the newsletter section (not the viewport - just visually prominent). Background: C.dusk. Two buttons side by side.

"Copy HTML" does what the existing button does (`buildNlPreviewHtml()` → clipboard).
"Open beehiiv" opens `https://app.beehiiv.com` in a new tab.

2. After copying, the button changes to "✓ Copied - now paste in beehiiv" for 5 seconds.

3. Keep the existing copy button in the preview panel header too - don't remove it.

---

### 2C. Article Preview in Newsletter Context

**Problem:** When you select an article from the dropdown, you only see the excerpt in a small box. You can't see how it'll look in the actual newsletter without scrolling to the preview at the bottom.

**Fix:** After selecting an article, show a mini inline preview card (styled like the newsletter article-box from `buildNlPreviewHtml`):

```
┌─ Article Preview ────────────────────────────────────────────┐
│  ▎ LAKE LIFE                                                 │
│  ▎ Why Devils Lake Bluegill Are the Best in Michigan         │
│  ▎ The DNR numbers don't lie - and neither do the old-timers │
│  ▎ who've been pulling slabs off these beds since the '60s.  │
│                                                              │
│  [Read full in Notion ↗]                                     │
└──────────────────────────────────────────────────────────────┘
```

This already partially exists (the excerpt box) but style it to match the newsletter visual so it doubles as a WYSIWYG check.

---

### 2D. Weekend Events - Edit After Pull

**Problem:** The "Pull from Events" button generates bullet text, but it dumps raw AI text into a textarea. If one event is wrong or missing, you have to manually edit freeform text.

**Fix:** After pulling events, parse the text into individual lines and show them as editable chips/rows:

```
┌──────────────────────────────────────────────────────────────┐
│  ☀️ Fri · Trivia at Two Lakes - 7pm                    [✕]  │
│  ☀️ Sat · Festival of the Arts - all day               [✕]  │
│  ☀️ Sat · Live Music at Chateau Aero - 6pm             [✕]  │
│  ☀️ Sun · Farmers Market - 9am                         [✕]  │
│                                                              │
│  [+ Add event manually]                                      │
└──────────────────────────────────────────────────────────────┘
```

Each row is editable inline (click to edit text). [✕] removes that line. [+ Add] appends a blank row.

The underlying `nlWeekendText` state still stores newline-separated text (for backward compatibility with the preview builder), but the UI presents it as structured rows.

**Implementation:** Split `nlWeekendText` on `\n`, render as a list of controlled inputs. On change, rejoin with `\n` and update `nlWeekendText`.

---

### 2E. Draft History / Previous Issues

**Problem:** There's a "Clear draft" button but no way to see what was in a previous issue. If Daryl wants to reference last week's newsletter, he has to go to beehiiv.

**Fix:** Add a small "Previous issues" dropdown at the top of the newsletter tab next to "Clear draft":

Before clearing, auto-save the current draft to localStorage with a key like `yeti_nl_archive_2026-04-03`. Keep the last 4 issues.

Add a dropdown: `[Load previous: Apr 3 | Mar 27 | Mar 20 | Mar 13]`

Selecting one loads that draft's fields into the form. This is purely localStorage - no API calls.

---

### 2F. Newsletter Preview - Mobile Width Toggle

**Problem:** The newsletter preview iframe renders at full width, but most readers will see it on mobile. No way to check mobile rendering.

**Fix:** Add a width toggle above the preview iframe:

```
[Desktop 600px]  [Mobile 375px]
```

Toggle sets the iframe's max-width. Desktop = 100% (current). Mobile = 375px, centered.

---

## PART 3: API Endpoints to Create

### `/api/admin/revenue-summary.js`

```
GET /api/admin/revenue-summary
Headers: X-Admin-Token (required)

Response: {
  mrr, activeSubscriptions, byTier, pastDue[], thisMonth, lastMonth, wineSeason
}

Dependencies: stripe (already in package.json)
Cache: 5-minute in-memory
```

### `/api/admin/attention-queue.js`

```
GET /api/admin/attention-queue
Headers: X-Admin-Token (required)

Response: {
  pendingEvents, pendingRatings, incompleteBiz[], ghostTrucks[], stalledOnboarding
}

Dependencies: @notionhq/client (already in package.json)
Notion tokens: NOTION_TOKEN_EVENTS, NOTION_TOKEN_BUSINESS
Cache: 2-minute in-memory
```

For `incompleteBiz` and `ghostTrucks`, return arrays of `{ name, missing: ["logo", "description"] }` or `{ name, lastCheckIn: "2026-02-14" }` so the dashboard can show details on expand.

---

## PART 4: Build Order

1. **API first:** Build `/api/admin/revenue-summary.js` and `/api/admin/attention-queue.js`. Test with curl.
2. **Dashboard tab:** Add Money Row, Attention Queue, reorganize existing content below.
3. **Newsletter checklist:** Add the issue checklist strip.
4. **Newsletter sticky bar:** Add the copy + beehiiv action bar.
5. **Weekend events rows:** Convert textarea to structured editable rows.
6. **Newsletter extras:** Mobile preview toggle, draft archive, article preview card.

Items 1-4 are high value. Items 5-6 are nice-to-have if time allows.

---

## Styling Notes

- Match all existing YetiAdminPage patterns exactly: `C.dusk`, `C.sage`, `C.lakeBlue`, `C.sand`, `C.warmWhite`, `C.cream`, `C.sunset`, `C.textMuted`, `C.textLight`
- Font families: `Libre Baskerville, serif` for headings, `Libre Franklin, sans-serif` for body
- Card style: `background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)'`
- KPI card style: same as existing 4-card grid with `borderTop: 3px solid ${color}`
- All new panels use the same `adminFetch()` helper for auth
- No new dependencies. No new packages.

---

## What This Does NOT Include

- Vercel Analytics integration (requires Vercel API key setup - separate task)
- Advertiser-facing analytics (social proof dashboard for selling ads - Phase 2, needs traffic first)
- Stripe webhook for real-time payment alerts (overkill for now - polling on tab load is fine)
- Breaking YetiAdminPage into sub-components (the file is 2652 lines but it works - refactor is a separate task if wanted)
