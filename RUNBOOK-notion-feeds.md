# RUNBOOK — Notion-backed feed is DOWN (empty section on site)

Last verified: 2026-08-06

## Symptom
- SMS alert: `⚠️ Manitou Beach: the "<feed>" feed is DOWN (Notion query failed). ... check the matching NOTION_TOKEN_* in Vercel.`
- A section of the live site is blank.
- The feed's API endpoint returns an empty payload **with no `suppressed` field**, e.g.
  `GET https://manitoubeachmichigan.com/api/community-pois` → `{"pois":[]}`.

> Tell apart "broken" vs "genuinely empty": the success path returns BOTH the data array
> AND a `suppressed` field. If `suppressed` is missing, you're in the failure branch
> (Notion returned a non-2xx). See `api/community-pois.js` and `api/lib/notionGuard.js`.

## Root cause (the common one)
The feed's Notion **internal integration** was deleted / revoked, or got **disconnected
from its database** — so the token in Vercel can no longer authenticate (401) or can't
see the DB (404). Same class of bug as the earlier `/events` token incident.
Less common: the matching `NOTION_DB_*` id in Vercel is blank or wrong.

## Root cause (the other one) — a filter names an option that no longer exists
**Check this FIRST if the feed broke right after someone edited the Notion schema.**
The token is fine and the alert's "check the matching `NOTION_TOKEN_*`" advice is a red herring.

Notion rejects the **entire query** with `400 validation_error` if a `select` /
`multi_select` filter names an option that is not currently in the database:

```
select option "Stays & Rentals" not found for property "Category".
Available options: "Food & Drink", "Places to Stay", ...
```

The API catches that and falls back to empty arrays, so the section goes blank exactly
like a token failure. Tell them apart by the alert text: `validation_error` +
`... not found for property ...` is this, never a credentials problem.

Anything in `api/` that hardcodes a category string is exposed. Current filter sites:
`api/businesses.js` and `api/sitemap.js` (both exclude `Places to Stay`, since lodging
lives in the separate Stays DB and renders on `/stays`).

**Fix:** make the filter string match a live Notion option, or re-add the missing option
in Notion. Then redeploy.

**Prevent:** renaming a Notion select option is safe (assignments follow the rename).
**Deleting** one is a breaking change to any deployed code that filters on it. Order of
operations when retiring a category:
1. Add the new option, keep the old one.
2. Move every row off the old option.
3. Deploy code that references only the new option.
4. Only then delete the old option in Notion.

Do NOT leave the old name in a filter "for back-compat" during a rename. That is the
opposite of safe here: it guarantees the 400 the moment the option is deleted.

## Diagnose (5 min)
1. Confirm the database itself is healthy (exists, schema intact, has rows). The schema the
   code expects: `Status` select (`Active`/`Hidden`), `Name` (title), `Lat`/`Lng` (number),
   `Category` select.
2. Check a *different* Notion feed (e.g. `/api/businesses`). If that returns data, the site +
   Vercel + Notion path are fine and the problem is isolated to this one feed's token/connection.
3. List the workspace integrations (Notion → Settings → Connections, or the API users list).
   If the feed's expected integration is **missing**, it was deleted → recreate it.

## Fix
1. **Create / locate the integration:** Notion → https://www.notion.so/profile/integrations →
   New internal integration (Read content capability is enough), associated to **Daryl Young's Notion**.
2. **Connect it to the database** — THIS is the step people miss: open the actual *database page*
   → `•••` (top-right) → **Connections** → **+ Add connections** → pick the integration → Confirm.
   (Doing this on the integration's own settings page does nothing — "Save connection" stays greyed.)
3. **Copy the Access token** (`ntn_...`) → Vercel → project → Settings → Environment Variables →
   paste into the matching `NOTION_TOKEN_*` (Production). Confirm the matching `NOTION_DB_*` id too.
4. **Redeploy** — env changes only take effect on a fresh build. Vercel → Deployments → `•••` →
   Redeploy → wait for **Ready**.
5. **Verify:** curl the endpoint. Success = populated array **plus** the `suppressed` field.

## Env var ↔ integration ↔ database map
| Env token            | Notion integration name           | Database                              |
|----------------------|-----------------------------------|---------------------------------------|
| NOTION_TOKEN_POIS    | Community Pois                    | Manitou Beach - Community POIs (id `31c8c729-eb59-81ba-ac48-f12f50366ef1`) |
| NOTION_TOKEN_BUSINESS| Business Listing                 | Manitou Beach - Business Listings     |
| NOTION_TOKEN_EVENTS  | Manitou Beach - Event Submission | Manitou Beach - Event Submissions     |
| NOTION_TOKEN_HERO    | Hero Events                      | Manitou Beach Hero Events             |
| NOTION_TOKEN_DISPATCH| (verify in Notion)               | Manitou Dispatch - Articles/Promotions/Issues |

## Gotchas
- If you recreate an integration you may end up with **duplicates of the same name**. Harmless.
  The keeper is the one whose **Access token matches Vercel** (compare last 6 chars). Delete the
  other only after confirming its token is NOT the Vercel value. Deleting the wrong one just
  re-breaks the feed; recover by re-pasting the survivor's token + redeploy.

## Incident log
- **2026-08-06** — `businesses` feed down ~20 min. Not a token issue. During the category
  split (`Stays & Rentals` → `Places to Stay` + new Rentals / Storage / Health & Wellness
  categories) the old select option was deleted from Notion while deployed code still had
  `does_not_equal: 'Stays & Rentals'`, so every query 400'd and the directory served zero
  businesses. Made worse by "excluding both the old and new name for back-compat", which
  kept the dead reference alive in the new code too. Fixed in `1161007` by filtering only
  on the live option. See "Root cause (the other one)" above.
- **2026-06-26** — `community-pois` feed down. The dedicated POIs integration had been deleted
  (no "Community Pois" bot in the workspace; DB + schema were healthy). Recreated integration,
  connected it to the Community POIs DB, pasted token into `NOTION_TOKEN_POIS`, redeployed.
  Feed restored (35 active POIs + 3 suppressed). Left one duplicate "Community Pois" integration
  in the workspace — harmless.
