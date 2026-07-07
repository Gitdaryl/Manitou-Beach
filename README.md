# Manitou Beach Michigan - Community Platform
### Holly & The Yeti · Devils Lake

A React (Vite) community website for Manitou Beach, Michigan: events calendar, business directory, newsletter, and SMS-verified submission forms. Data lives in Notion; the site runs on Vercel serverless functions.

Production: **https://manitoubeachmichigan.com** (always reference the `SITE_URL` env var, never hardcode).

---

## 📁 Where things actually live

| Path | Purpose |
|------|---------|
| `src/App.jsx` + `src/pages/` | The live application (routed pages). This is what deploys. |
| `src/data/config.js` | Sponsors (`PAGE_SPONSORS`, `EVENT_TICKER_SPONSORS`) and other front-end config. |
| `api/*.js` | Vercel serverless functions (events, businesses, submit-event, hero, subscribe, etc.). |
| `api/lib/` | Shared helpers (Notion pagination, Twilio SMS, cron auth). |
| Notion databases | The source of truth for events and businesses. Env: `NOTION_DB_EVENTS`, `NOTION_TOKEN_EVENTS`, business equivalents. |
| `manitou-beach-platform.jsx` | ⚠️ **LEGACY / DEAD.** An old single-file Framer prototype. Nothing imports it. Do not edit it to change the live site. |

---

## ✏️ Weekly Content Updates (the real 10-minute task)

Nothing here requires editing `manitou-beach-platform.jsx`. Most updates are data changes in Notion, not code.

### 1. Add or edit an event
Events come from the **Notion Events database**. Two ways in:
- **Public submissions:** the site's Submit Event form posts to `/api/submit-event`, which sends an SMS verification code and creates the event as **Pending**.
- **You, directly:** add or edit a row in the Notion Events DB.

The public calendar (`GET /api/events`) shows events whose Status is **Approved** or **Published**. To publish a pending submission, set its Status to Approved (or Published) in Notion. Past events drop off automatically at the end of their Michigan calendar day, so you do not need to delete them.

### 2. Feature an event in the hero
Check the **"Hero Feature"** checkbox on that event's row in the Notion Events DB. `api/hero.js` reads that checkbox. No code edit, no deploy.

### 3. Update sponsors
Edit `src/data/config.js` (`PAGE_SPONSORS` for page sponsors, `EVENT_TICKER_SPONSORS` for the events ticker), commit, and push. Vercel redeploys automatically.

### 4. Businesses directory
Business listings come from the **Notion Businesses database**. New listings arrive via the site's submission form (with a claim/confirm flow). Approve or edit them in Notion.

---

## 🚀 Deploy

Push to `main`. Vercel builds and deploys automatically. Prefer the Vercel CLI over the MCP redeploy endpoint (per workspace rules). Never commit API keys; secrets are Vercel env vars.

---

## 💰 Pricing (LOCKED)

Promotion tiers are **$9 / $25 / $49**. Do not change without explicit instruction.

---

## 📌 Notes for future sessions / AI agents

- The live site is `src/App.jsx` + `src/pages/`. If you change `manitou-beach-platform.jsx` and "nothing happens," that is why: it is dead code.
- Event and business content is Notion-driven. Reach for a Notion change before a code change.
- Outage behavior: `/api/events` returns a `503` (not an empty 200) and SMS-alerts the admin when Notion is unreachable, so an outage is visible rather than silently showing "no events."

---

*Built by Holly & The Yeti for the Manitou Beach community. No beach. Still worth it.*
