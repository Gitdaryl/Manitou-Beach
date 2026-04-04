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
