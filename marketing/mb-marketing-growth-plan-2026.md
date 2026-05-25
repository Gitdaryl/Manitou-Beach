# Manitou Beach Platform — Marketing & Growth Plan 2026
**PM Document | Author: Claude (acting PM) | Date: 2026-05-24**

---

## Executive Summary

manitoubeachmichigan.com is not a website. It is a community operating system for Devils Lake/Manitou Beach that already has 60+ features live, 5+ revenue streams built, and agentic automation running daily. The problem is not the product. The problem is that nobody knows it exists.

This plan treats traffic as the primary lever for everything downstream. More eyes on the platform:
- Validates the $9/$25/$49 listing value to businesses who are skeptical
- Drives event RSVPs that justify ticketing fees
- Fills the Dispatch subscriber list to unlock sponsorship pricing
- Creates the "proof" that turns a $49 listing into a $1,500 web build conversation

The goal is $5,000 MRR from platform subscriptions within 6 months, with a services upsell pipeline generating another $5,000+/mo by month 9. Platform revenue is the proof of concept that unlocks cloning to the next community.

---

## Part 1 — Platform Feature Audit

### What's Actually Live (full inventory)

| Category | Features Live |
|----------|--------------|
| **Business Directory** | Free + $9/$25/$49 tiers, profile pages at /[slug], photos, hours, call button, quote form, map pin, OG social card, Google reviews (featured+), hero gallery (premium) |
| **Events** | /happening with ticket badges, RSVP, event detail pages, submit events, event edit, RSVP waitlist, event confirmation emails, 48h reminder cron |
| **Food Trucks** | GPS check-in via phone, live map (Google Maps JS), truck cards with location history, video hero, QR page, /food-truck-partner signup $9/mo, partner profile pages |
| **Wine Trail** | /wineries directory, winery profiles, wine ratings system, /wine-partner signup, winery partner page |
| **Stays** | /stays directory, stay listings, submit-stay flow, manage-stay auth |
| **Discover / Activities** | /discover, /fishing, /nightlife, /devils-lake, /round-lake, /village |
| **Community Orgs** | /ladies-club (full with sponsors, vendor portal, member checkout), /mens-club, /historical-society, /usa250 |
| **Newsletter (Dispatch)** | Beehiiv integration, auto-drafted weekly newsletter (cron-newsletter-draft.js), dispatch ads, sponsored slots, article generation |
| **Ticketing** | /ticket-services sales page, Stripe Express Connect, 1.25% fee, PDF+QR tickets, volunteer check-in app (/check-in) |
| **Vendor Management** | Vendor register, vendor portal, vendor blast SMS, event vendor applications |
| **Promo/Offers System** | Create offer, claim promo, redeem promo, merchant redeem, offer report |
| **Prize Wheel** | /spin daily spin, prize redeem, sponsor slots |
| **Social Automation** | Thursday events roundup cron (live), daily business spotlight reel (GitHub Actions, ElevenLabs Yeti Vibe, Hyperframes, Meta Graph API) |
| **Admin & Tools** | Yeti Admin dashboard, organizer dashboard, GBP setup service, AI report card cron, site audit cron, social post cron, review digest cron |
| **SMSs** | SMS blast (A2P pending), SMS opt-in, check-in link sender, vendor notifications |
| **Partner Intake** | /partner-intake unified org onboarding (Stripe Connect wiring needed) |
| **Page Sponsors** | page-sponsor-checkout.js + page-sponsors.js (built, not actively sold) |
| **Sponsor Tools** | /sponsor-dispatch, sponsor stats page, sponsor waitlist, sponsor checkout, sponsor expiry cron |
| **SEO Infrastructure** | Slug-based profile routes, OG meta per page, sitemap.js, www redirect, profile page SEO Phase 1 shipped |

### What's Built But Underutilized

These features exist and are costing nothing to run but are generating zero revenue because they haven't been sold yet:

- Page sponsors (API built, no sales page)
- Dispatch sponsorship (API built, self-promo fallback card not added)
- Prize wheel sponsor slots (prototype, no sponsor deal)
- Offers/promo redemption system (merchant-facing, no merchants using it)
- /partner-intake (built, Stripe Connect not wired)
- GBP setup service (the most undersold feature in the $49 tier)

---

## Part 2 — Revenue Map

### Current Revenue Streams (active)

| Stream | Unit Economics | Current MRR Est. | Notes |
|--------|---------------|------------------|-------|
| Business listings | $9/$25/$49/mo | $0-50 | Presumed 0-5 paying listings |
| Food truck partner | $9/mo | $0-18 | 0-2 paying trucks |
| Ticketing fees | 1.25% of face value | $0 | No active paid events yet |
| LLLC membership checkout | One-time/annual | Occasional | Handled |
| **Total MRR est.** | | **<$100** | Pre-launch state |

### Revenue Streams Ready to Activate (built, not yet sold)

| Stream | Unit Price | Revenue Potential | Effort to Activate |
|--------|-----------|-------------------|--------------------|
| Dispatch sponsorship | $25-100/issue | $100-400/mo at 300 subs | Phase 0: add fallback card (30 min dev) |
| Page sponsors | $49-149/mo per page | $500/mo at 10 pages | Create simple pitch page |
| Prize wheel sponsor slots | $50-200/slot | $150-600/mo | Prospect 3 local businesses |
| Offers/promo upsell | Add-on to listing tier | $20-50/mo per merchant | Feature awareness campaign |

### Revenue Streams Requiring Relationship + Build

| Stream | Unit Price | Revenue Potential | Effort |
|--------|-----------|-------------------|--------------------|
| Business listings (50 paying) | $9-49/mo avg $20 | $1,000/mo | Traffic proof + outreach |
| Services upsell (web build) | $1,500-3,000 one-time | $3-6k/client | Built on listing trust |
| Services upsell (AI chatbot) | $199/mo | $2k/mo at 10 clients | Existing tech |
| Services upsell (reputation mgmt) | $149/mo | $1.5k/mo at 10 clients | GBP work already done |
| Ticketing (5 events/mo) | 1.25% of $10k avg | $125/mo | Drive event organizer adoption |
| Wine partner memberships | $25-49/mo | $500/mo at 10 wineries | Outreach + wine trail traffic |
| Org dashboards (5 orgs) | $49-99/mo | $250-500/mo | Platform fee model |
| Category Spotlight (Phase 3) | $39-149/mo | $2-5k/mo | 100+ listings first |

### The Funnel Math

```
100 unique visitors/day
  → ~2% click a business listing        = 2 businesses/day seeing their value
  → ~5% of those contact Daryl          = 1-2 serious prospects/week
  → 30% close on $9 (lowest barrier)    = 3-5 new listings/month
  → 20% of $9 listings upgrade in 90d   = 1 upgrade/month (compound)
  → 10% of listings want a web build    = 1 web build conversation/quarter
```

The math only works if there is traffic. Everything is downstream of eyeballs.

---

## Part 3 — KPIs

### Tier 1 KPIs (primary, revenue-linked)

| KPI | Current | 30-Day Target | 90-Day Target | 6-Month Target |
|-----|---------|--------------|---------------|----------------|
| **MRR (subscriptions)** | ~$50 | $250 | $750 | $2,500 |
| **Paying business listings** | ~2 | 10 | 25 | 75 |
| **Newsletter subscribers** | Unknown | 150 | 400 | 1,000 |
| **Dispatch sponsor revenue** | $0 | $0 (Phase 0 live) | $50 | $200 |
| **Ticketing volume ($ processed)** | $0 | $0 | $500 | $5,000 |
| **Services pipeline value** | $0 | $1,500 | $5,000 | $15,000 |

### Tier 2 KPIs (traffic, proves value to businesses)

| KPI | Current | 30-Day Target | 90-Day Target | 6-Month Target |
|-----|---------|--------------|---------------|----------------|
| **Monthly unique visitors** | Unknown | 500 | 2,000 | 7,500 |
| **Business profile page views/mo** | Unknown | 200 | 1,000 | 5,000 |
| **Event page views/mo** | Unknown | 100 | 500 | 2,000 |
| **Facebook page reach/week** | Unknown | 1,000 | 5,000 | 15,000 |
| **Instagram reach/week** | Unknown | 500 | 3,000 | 10,000 |
| **Food truck check-ins/mo** | Unknown | 2 | 8 | 20 |
| **Event RSVPs/mo** | Unknown | 10 | 50 | 200 |

### Tier 3 KPIs (platform health, retention)

| KPI | Current | Target (6mo) | Why It Matters |
|-----|---------|-------------|----------------|
| **Business listing churn rate** | N/A | <5%/mo | Keep once they're in |
| **Profile completion rate** | Low | >60% | Incomplete profiles don't convert |
| **Report card email open rate** | N/A | >40% | Proof of value = anti-churn |
| **Returning visitor rate** | Unknown | >35% | Community = habit, not destination |
| **Dispatch open rate** | Unknown | >35% | Justifies sponsorship pricing |

### Revenue KPI Dashboard (what Daryl should check weekly)

```
- MRR total
- New listings this week
- Churned listings this week
- Newsletter sub count (delta)
- FB/IG total reach this week
- Tickets sold this week + $ processed
- Services pipeline (qualified prospects)
```

---

## Part 4 — SEO Strategy

### Current State Assessment

**Strengths:**
- Slug-based profile pages (each is an indexable page)
- OG meta per page
- www redirect working
- Dynamic sitemap API exists

**Critical Gaps:**
- No structured local business schema (JSON-LD) on profile pages
- No FAQ schema on event pages
- Google Search Console not confirmed set up
- Core Web Vitals not confirmed optimized (image cache headers pending)
- Zero backlinks (new domain, Vercel URL)
- No Google Business Profile for the platform itself

### Primary Keyword Strategy

The platform should own "Devils Lake Michigan" + "Manitou Beach Michigan" clusters. These are low competition, high purchase intent for local tourism.

**Tier 1 — Own These (primary traffic drivers)**

| Keyword | Est. Monthly Searches | Competition | Our Page |
|---------|----------------------|-------------|----------|
| manitou beach michigan | 500-2,000 | Low | Home |
| devils lake michigan things to do | 1,000-3,000 | Low | /discover |
| devils lake michigan events | 500-1,500 | Low | /happening |
| manitou beach michigan restaurants | 200-500 | Low | /village + profiles |
| food trucks devils lake michigan | 100-300 | Low | /food-trucks |
| wineries near devils lake michigan | 200-600 | Low | /wineries |
| cabins manitou beach michigan | 300-800 | Low | /stays |

**Tier 2 — Compound via Business Profiles**

Every active business listing page is a local SEO asset. "Carrie Lynn Wellness Manitou Beach Michigan", "Devils Lake Michigan electrician" etc. These compound passively. Priority: get businesses to fill in their profiles.

**Tier 3 — Long Tail via Events**

Each event page is a keyword: "Corks and Kegs 2026 Manitou Beach", "LLLC Summer Festival 2026", "Tip-Up Town Devils Lake 2026". Low volume but high intent. Already auto-generating pages.

### SEO Build Requirements

These need to be built to execute the SEO strategy:

**Priority 1 — Must Do (high impact, low effort)**

1. **Local Business JSON-LD schema on every profile page** - Add structured data for name, address, phone, hours, price range, category. Google surfaces this in rich results. Estimated: 2-3 hours dev.

2. **Event schema on /happening and event detail pages** - JSON-LD Event markup with startDate, location, organizer, offers. Eligible for Google Events carousel (huge organic traffic). Estimated: 2 hours dev.

3. **Dynamic sitemap update** - Sprint 3 task from profile_pages_tasklist. Include all profile + event + winery URLs. Estimated: 1-2 hours dev.

4. **Google Search Console setup** - Verify the domain, submit sitemap, monitor indexation. 30 min, Daryl's action.

5. **Google Business Profile for the platform** - Create a GBP for "Manitou Beach Community Platform" or "Visit Manitou Beach". Category: Tourist Information Center. Link to the site. Free. Estimated: 1 hour Daryl's time.

**Priority 2 — High Impact, Medium Effort**

6. **Internal linking** - Every /discover, /fishing, /nightlife, /village page should link to relevant business profiles. Creates SEO equity flow and improves crawl depth.

7. **Editorial content pages** - "Best Things to Do at Devils Lake Michigan", "Complete Guide to Manitou Beach Michigan Summer 2026". 800-1200 word SEO articles. Can be Haiku-drafted. 2-3 core pillar pages unlock the cluster.

8. **Review aggregate schema** - If Google reviews are pulling for featured/premium listings, add aggregate rating schema. Google surfaces stars in search results.

9. **Image alt text audit** - Ensure all hero images, business photos, event images have keyword-rich alt text.

**Priority 3 — Structural SEO (later)**

10. **Core Web Vitals** - Immutable cache headers, async fonts, LCP preload (Sprint SEO Phase 2 from profile_pages_tasklist). Blocking organic ranking above a threshold.

11. **Backlink acquisition** - Get the platform listed on: Michigan tourism boards, Lenawee County Chamber of Commerce, Devils Lake Association website, Michigan.org events calendar. Each is a free high-authority backlink. Estimated: 1-2 hours outreach.

---

## Part 5 — Social Media Strategy

### What's Running Automatically

- **Thursday 9am (live):** Notion Events DB → Haiku copy → FB + IG post
- **Daily 12pm ET (live):** Business spotlight reel — Haiku script + Yeti Vibe VO + Hyperframes render → FB + IG Reel

### What Needs to Be Built (social automation gaps)

**Build 1 — Social Scheduling Queue (medium priority)**
Notion DB with: Post copy, Image URL, Scheduled Date, Platform, Status (Queued/Approved/Posted/Rejected)
Monday cron sends Daryl an email digest of the week. Silence = approved. One-click reject.
This unblocks Tuesday + Saturday posts without requiring Daryl's real-time attention.

**Build 2 — Food Truck Arrival Social Trigger (high priority)**
When a food truck checks in (GPS drop), auto-post to FB/IG: "LIVE NOW: [Truck Name] is at [Location] until [time]. Get there."
This is the single highest-virality trigger on the platform. Food + FOMO = shares.
Files: `/api/submit-food-truck.js` needs a Meta post call after successful check-in.

**Build 3 — Event Countdown (high priority)**
48h before events with ticket sales enabled: auto-post "Tomorrow: [Event Name]. Tickets still available → [link]"
Drives last-minute ticket conversions. `api/cron-event-reminders.js` already exists - extend it to social.

**Build 4 — New Business Welcome Post (medium priority)**
When Notion Business DB Status flips to Active: auto-generate a welcome reel.
Already in the daily spotlight pipeline. Just needs a "new listing" trigger in addition to the rotation.

### Content Calendar (Proposed Steady State)

| Day | Content | Source | Automation Level |
|-----|---------|--------|-----------------|
| Mon | Behind-the-scenes / lifestyle | Manual draft queue | Semi-auto |
| Tue | Business feature / spotlight | Pipeline (already live) | Fully auto |
| Thu | Weekend events roundup | Cron (live) | Fully auto |
| Fri | "This weekend at the lake" vibe post | Draft queue | Semi-auto |
| Sat | User generated feel / community moment | Draft queue | Manual |
| As-needed | Food truck arrival | Triggered | Fully auto |
| As-needed | New listing welcome | Triggered | Fully auto |
| As-needed | Event countdown (48h) | Triggered | Fully auto |

### Content Pillars (what drives follows + shares)

1. **FOMO/Discovery** - "You won't believe this [view/dish/event] is 90 minutes from Toledo" (triggers shares from outsiders, pride from locals)
2. **Community Pride** - "These businesses built Manitou Beach" (local owner feels seen, shares to family)
3. **Utility** - "This weekend at Devils Lake: 4 things to do" (saves + bookmarks)
4. **Behind the scenes** - Food truck arriving, sunset at the dock, wine tasting (raw, non-polished, algorithm-friendly)
5. **Social proof** - "847 people visited [Business] through the platform last month" (convinces other businesses to join)

### Video Scripts — Priority Queue

These need Hyperframes renders + can autopost via existing pipeline:

**Script 1: "The Food Truck Map" (30s Reel)**
```
[0s] SLAM: "FOOD TRUCKS."
[1s] "Not sure where they are?"
[2s] Breathe. Map visual.
[3s-6s] "Real-time location. Tap the truck. Get there."
[7s] Dissolve. Logo. "manitoubeachmichigan.com"
```

**Script 2: "List Your Business" (30s Reel)**
```
[0s] SLAM: "Still on Facebook?"
[1s] "That's fine. But your competitors just got a website."
[3s] Show profile page visual
[5s] "Yours is free to start. $9/mo for the real thing."
[7s] "manitoubeachmichigan.com/featured"
```

**Script 3: "Sell Tickets Here" (30s Reel — org-facing)**
```
[0s] SLAM: "EVENTBRITE TAKES $3."
[1s] "We take 75 cents."
[3s] Show ticket page visual
[5s] "Same QR tickets. Same PDF. Less robbery."
[7s] "manitoubeachmichigan.com/ticket-services"
```

**Script 4: "Wine Trail" (30s Reel — tourist-facing)**
```
[0s] Wide shot: vineyard at golden hour
[1s] "Seven wineries. One lake. One weekend."
[3s] Show /wineries page
[5s] "Plan the whole thing in 5 minutes."
[7s] "manitoubeachmichigan.com/wineries"
```

### Paid Social Strategy (small budget, high precision)

Boost target: people in Toledo, Detroit, Columbus, Ann Arbor, Cleveland within 150mi
Interest targeting: fishing, lake house, wine tasting, small town travel, Michigan tourism

**Boost Budget Allocation (starting $50/mo)**
- $20/mo — "Hidden gem" awareness post (dock sunset image, 150mi radius)
- $20/mo — Food truck FOMO post when trucks are active (hyperlocal)
- $10/mo — Event ticket post 48h before major events (tight geo, Toledo bias)

Scale this to $200/mo once organic content proves which formats convert. Never boost before organic validation.

---

## Part 6 — Business Development Plan

### The Outreach Sequence (how to get paid listings)

This is not cold outreach. The platform IS the pitch deck. The sequence:

**Week 1-2: Anchor Tenants (3-5 businesses, personal relationship)**
- Get 3 businesses in that Daryl knows personally to take the $49 Front and Center tier
- These become the social proof ("Your neighbors are already on here")
- Goal: not revenue. Proof. Published profiles with real photos.

**Week 3-4: The Show-and-Tell Campaign**
- Create a 2-minute screen recording walking through a filled-out profile
- Send it via DM to 20 local business Facebook pages
- Message: "I built something for Manitou Beach. No strings attached - here's what a listing looks like."
- Do not mention price in the first message.

**Month 2: Stats as Sales Tool**
- Once 5+ businesses are listed, screenshot the Vercel Analytics showing profile views
- Post to FB: "Your neighbors' businesses got 847 profile views through the platform last month. Free to list."
- Add a stats email to every listed business at the 30-day mark

**Month 3+: The Upgrade Drip**
- Businesses at $9 who've had 30+ profile views get a personal message: "Your listing got 47 visitors this month. Thought you'd want to know. If you ever want to add photos or hours, that's the $9 upgrade."
- This is Maslow-level: they're already getting value, the upgrade just makes it more visible.

### The GBP Pitch (most important single message)

The single biggest closing message for the $49 tier:

> "The thing about Front and Center - we set up your Google Business Profile for you. That's the page that shows up when someone searches your business name on Google. Agencies charge $200-400 a month just for that. You're getting it plus a full profile page for $49."

Use this in every sales conversation. It is the only time the pricing math makes a business owner feel like they're stealing.

### Wine Trail Partnership

The wine trail is underexploited. 7 wineries within 30 minutes of the lake is a weekend-trip story that sells itself to the Toledo/Detroit market.

Target: get all 7 wineries listed at minimum $25 tier within 60 days.
Pitch: "We're building a dedicated wine trail marketing page. The 7 wineries that are listed get on the map. The ones that aren't... don't."

Scarcity is legitimate here. The map has 7 pins. Be on it or not.

### Event Organizer Outreach

The ticketing platform is fully built with no clients. Target list:
1. LLLC (already partner - offer Summerfest ticketing)
2. Men's Club (Tip-Up Town - existing relationship)
3. Devils Lake Yacht Club (meeting already had)
4. Bass fishing tournaments (personal connection via Daryl's friend's son)
5. Local church fundraisers (faith community has events year-round)

The pitch for ticketing is a 3-line comparison:
- Eventbrite: $2-3/ticket
- Square/Paypal: no QR check-in
- MB Platform: 75 cents/ticket, PDF + QR, volunteer check-in app included

---

## Part 7 — Build Requirements (PM perspective)

Ranked by revenue impact per dev hour:

### Immediate (this week, high impact, low effort)

| Build | Effort | Revenue Impact | Priority |
|-------|--------|---------------|----------|
| Dispatch self-promo fallback card | 30 min | Turns every dead issue into a lead | P0 |
| Local Business JSON-LD schema on profile pages | 2-3 hrs | Google rich results, SEO compound | P0 |
| Event schema on /happening + detail pages | 2 hrs | Google Events carousel eligibility | P0 |
| Food truck arrival social auto-post | 2-3 hrs | Highest virality trigger on platform | P0 |

### Sprint 2 (this month, critical path)

| Build | Effort | Revenue Impact | Priority |
|-------|--------|---------------|----------|
| SMS verify to unlock self-edit on profiles | 4-6 hrs | "Facebook moment" — business can own their listing | P1 |
| Photo upload from phone on profile | 3-4 hrs | Profile completion drives retention | P1 |
| Event countdown auto-social post | 2 hrs | Ticket sales conversion | P1 |
| Social scheduling queue (Notion + cron) | 4-6 hrs | Scales Tue/Sat content without Daryl's time | P1 |
| Dynamic sitemap API | 2 hrs | SEO indexation of all profiles | P1 |

### Sprint 3 (next 60 days, compounding value)

| Build | Effort | Revenue Impact | Priority |
|-------|--------|---------------|----------|
| Google Places reviews pull on profiles | 4 hrs | Upgrades $25 tier value, drives conversions | P2 |
| AI Report Card delivery (cron exists, needs SMS) | 4 hrs | Anti-churn, passive upsell | P2 |
| /sponsor-dispatch sales page | 3 hrs | Opens new revenue stream when at 300 subs | P2 |
| 3 SEO pillar articles (Haiku-drafted) | 2 hrs | Tier 1 keyword rankings | P2 |
| Page sponsor pitch page | 2 hrs | Activates built-but-unsold revenue stream | P2 |

### Sprint 4 (month 3+, Phase 3 triggers)

| Build | Effort | Revenue Impact | Priority |
|-------|--------|---------------|----------|
| Category Spotlight ad inventory (Phase 3) | 8-10 hrs | $2-5k/mo at 100+ listings | P3 |
| New listing welcome auto-reel | 2 hrs | Viral acquisition loop | P3 |
| Org dashboard (LLLC/Men's Club/Yacht Club) | Full session | Platform retention + service upsell | P3 |
| Winery profile pages | 4 hrs | SEO + wine trail sales | P3 |

---

## Part 8 — Timeline

### Month 1 (June 2026) — "Make It Real"

**Goal:** Platform goes from ghost town to proof of concept. 10 paying listings. 150 newsletter subscribers. Traffic visible to businesses.

- Week 1: P0 builds (schema, food truck trigger, dispatch fallback)
- Week 2: 3-5 anchor tenant outreach (personal relationships, Front and Center)
- Week 3: Sprint 2 builds (SMS self-edit, photo upload, sitemap)
- Week 4: Show-and-tell campaign (20 DMs to local businesses with screen recording)
- Content: Post daily. Use scheduled queue once built. Boost $20 on dock sunset post.
- SEO: Submit sitemap to Google Search Console. Verify domain. Create GBP for the platform.

**KPI Checkpoints (end of June):**
- MRR: $250
- Paying listings: 10
- Newsletter subs: 150
- Monthly unique visitors: 500
- Weekly FB reach: 1,000

---

### Month 2 (July 2026) — "Summer Push"

**Goal:** Summer season is peak tourist traffic. Use it. Events, food trucks, wine trail all generating content.

- Launch /sponsor-dispatch page with rates
- Get LLLC + Men's Club using ticketing for at least 1 event
- Wine trail outreach — target all 7 wineries
- Boost paid social to $50/mo (food truck FOMO + wine trail)
- Stats email to all listed businesses: "Here's what your listing did this month"
- Google Places reviews live on featured/premium profiles
- Personal outreach to 5 highest-viewed $9 listings: upgrade conversation

**KPI Checkpoints (end of July):**
- MRR: $500
- Paying listings: 25
- Newsletter subs: 400
- Monthly unique visitors: 2,000
- Ticketing: 1 event processed
- First services upsell conversation opened

---

### Month 3 (August 2026) — "Compound"

**Goal:** Platform is self-proving. Let the stats do the selling. AI Report Card live. Services pipeline opening.

- AI Report Card: every listed business gets monthly stats SMS
- Category Spotlight waitlist page visible on Business Profile pages (psychological pressure)
- Services pitch to top 10 most-active $9 listings (web build conversations)
- Dispatch sponsorship: first paid sponsor at $50/issue if at 300+ subs
- Social: scale to 5x/week with full scheduling queue
- Explore: second community territory (South Haven? Traverse City?)

**KPI Checkpoints (end of August):**
- MRR: $1,000
- Paying listings: 40
- Newsletter subs: 600
- Services pipeline: $5,000 qualified
- Ticketing: 3+ events processed

---

### Months 4-6 (Sep-Nov 2026) — "System"

**Goal:** Platform runs mostly autonomously. Daryl's direct involvement is sales conversations, not operations.

- All social posting automated (Tue/Thu/Sat cron)
- Business spotlight pipeline running daily without oversight
- Report cards generating passively
- Category Spotlight launches at 100+ listings
- First clone territory identified + pitch started
- MRR target: $2,500 platform + $2,500+ services

---

## Part 9 — The Money Map Summary

When you zoom out, there are 3 bets being made with this platform:

**Bet 1: Traffic proves value to businesses ($9-49/mo)**
Traffic comes first. Once businesses see 200+ profile views/mo, $49 feels like theft. Every SEO and social effort feeds this bet. The vehicle is platform subscriptions.

**Bet 2: Platform is a trust accelerator for services ($1.5k-$3k web builds, $149-299/mo retainers)**
A business owner who has spent $9/mo on MB for 3 months has already trusted Daryl with their brand. The web build conversation starts from trust, not cold. Services is where the real money lives - $10k/mo at 5-6 active clients.

**Bet 3: The community OS is clonable**
Manitou Beach is not the destination. It's the blueprint. Once the proof of concept is solid (100+ paying businesses, 1,000+ newsletter subs, 3+ event ticketing clients), the system gets cloned to South Haven, Traverse City, or any tourist destination. Yeti Groove's moat is execution velocity and the community relationships that come with it, not technology.

---

## Appendix — Quick Reference

### Immediate Actions (no builds needed)

1. Google Search Console — verify manitoubeachmichigan.com, submit sitemap
2. Google Business Profile — create for the platform (category: Tourist Information Center)
3. DM outreach — 3 personal contacts for Front and Center anchor listings
4. Boost $20 — dock sunset post, 150mi radius, Toledo/Detroit/Columbus audience

### Beehiiv Subscriber Growth Tactics

- Add subscribe CTA to every event detail page
- Add subscribe CTA to every food truck check-in confirmation
- Add subscribe modal after 3 page views (exit-intent or scroll-triggered)
- Cross-post 1 dispatch article per week to FB with "full version in the newsletter"

### KPI Tracking Cadence

- **Daily:** Vercel Analytics (unique visitors, top pages)
- **Weekly:** FB/IG reach, new listings, sub count delta
- **Monthly:** MRR total, profile views per business (for report cards), churn count

---

*This document supersedes the marketing notes in social-drafts-may2026.md. That file remains the content queue.*
*Last updated: 2026-05-24*
