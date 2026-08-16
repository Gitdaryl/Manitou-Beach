# Manitou Beach - Claude Rules

See also: [Global Rules](../CLAUDE.md)

---

## Scroll & Keyboard Navigation

Follow the global SOP. This project had one instance of the scroll-trap pattern on `/launch` (fixed 2026-04-01). The correct layout uses `position: fixed` for the video background and a normal document flow for content.

All other pages in this project use the standard Layout component and are not affected.

---

## Project Essentials

- Production URL: `https://manitoubeachmichigan.com` - always use `SITE_URL` env var, never hardcode
- `manitoubeach.com` is NOT a valid URL - never use it
- Pricing is LOCKED: $9 / $25 / $49 - do not change without explicit instruction
- All copy must be warm, upbeat, conversational - "Would my 70-year-old neighbor smile?" test

---

## position: sticky Gotcha (learned 2026-08-03)

`overflow-x: hidden` on html/body or any ancestor silently breaks `position: sticky` in Chrome. This repo uses `overflow-x: clip` instead (GlobalStyles + WineriesPage root) - clip gives the same clipping without creating a scroll container. Do not change it back to `hidden`. The cork-pop scrub hero on /wineries depends on this.

## Cork-Pop Scrub Hero (/wineries)

- 73 WebP frames in `public/images/wine-scrub/` extracted from a Seedance 2.0 video (source: Yeti's cork-pop reference)
- `SCRUB_FRAME_COUNT` in WineriesPage.jsx - set to 0 to instantly fall back to the static hero
- Regenerate frames: `ffmpeg -i cork-pop.mp4 -vf "select='not(mod(n\,2))',scale=1280:-2" -vsync vfr -c:v libwebp -quality 72 frame_%03d.webp`

## Trail Partner Tier (wineries page)

Paying trail partners get `partner: true` in wineries.js: top billing, Featured Trail Partner badge, glow border, logo, photos, profile link. Free trail listings render as compact one-line rows (intentional - the contrast sells the upgrade; upsell caption links to /featured). Gypsy Blue is the first paying partner (Aug 2026). When a winery pays, add the flag and move them up the array.

## Chateau Aeronautique - canonical record (locked 2026-08-16)

The owner trades under three names and the staff do not agree either, so the site picks one and holds it. Do not "correct" any of these from a Google result, a staff answer, or the milehighdistillery.com hero.

- Name: **Chateau Aeronautique Winery**. Never Mile High Distillery, never a fusion of the two.
- Address: **12000 Pentecost Hwy, Onsted, MI 49265** (lat 42.0582, lng -84.1274). The Parnall Rd, Jackson address that used to be in `discover.js` was wrong and put the map pin 22 miles off.
- Phone: **(517) 446-4052** (Google, and what the events rows already used). The old (517) 795-3620 is retired.
- Website: **https://chateauaeronautiquewinery.com**. It 301s to milehighdistillery.com, which is fine - it is the brand-consistent URL and it survives an un-redirect. `chateauaeronautique.com` does not resolve, do not link it.
- Tribute shows: **$25 cover at the door**, Fri and Sat, all-weather Biergarten. Confirmed in person.

Lives in `src/data/wineries.js`, `src/data/discover.js` (POI + `SITE_KNOWLEDGE`), `scripts/seed-community-pois.mjs`, `agent_configs/*`, plus the Business, POI, and Events rows in Notion. Change one, change all of them.

## Blank event Cost means free (learned 2026-08-16)

`Cost` in the Events DB is optional free text, and blank does not mean "unknown", it means free: no cost badge on the card, and `isAccessibleForFree: true` in the schema.org Event markup (`src/components/SEOHead.jsx`). `scripts/import-chateau-events.mjs` shipped 77 shows without it and every one published as free. Any script or agent writing events must set Cost explicitly, "Free" included. Backfill helper: `scripts/set-chateau-cost.mjs`.

## SMS Gotchas (learned 2026-08-11)

- `sendSMS()` in `api/lib/twilio.js` normalizes any US phone format itself. Pass it raw values. Do NOT pre-format at the call site. It used to blindly prefix `+1`, and since `DARYL_PHONE` is stored E.164 every admin alert went to `+1+1XXXXXXXXXX` and failed silently for months.
- Never fire-and-forget an SMS or email before returning from a Vercel function. The function is frozen the moment you return, so the send is a coin flip. `await` it, even in a "best effort" path.
- Inbound texts to the Manitou number hit `api/sms-inbound.js`, which forwards to Daryl and auto-replies. If that endpoint 500s, organizers get silence.
- Organizer edit tokens are per-event. `/my-events` is the front door: an organizer enters their phone and gets one texted magic link listing all of them. Send that, not individual edit links.
