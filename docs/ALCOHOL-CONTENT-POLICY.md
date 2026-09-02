# Alcohol content policy

Editorial rules for anything Manitou Beach publishes to Meta. Applies to the
weekly AI Holly rundown, the daily business spotlight, the Thursday roundup,
and any hand-posted content.

## Why this exists

On 2026-08-28 Meta restricted the Holly & the Yeti Page: "Your Page is
unavailable to people under 18." It followed roughly ten posts flagged
"People under 18 can't see your Post" between 2026-07-21 and 2026-08-31,
accelerating to nine in August alone.

The Page's own Age Restriction setting still reads **Public**. This was
imposed by enforcement, not chosen. Effects are limited to under-18s: they
can't see the content, can't be messaged, and aren't recommended the Page.
Adult reach was unaffected (110,624 Reels views over the same window, up 512
percent).

The strike counter is the risk, not the age gate. Each flagged post stacks.

## The rule

**It is not the depiction. It is the commercial offer.**

Meta's age-appropriate content policy names the restricted category directly:
posts "offering to sell tobacco, nicotine products, alcohol, or firearms when
shared by a legitimate brick-and-mortar business."

So the question is never "does wine appear in this." It is "is this post
offering to sell a drink."

| Post | Call |
|---|---|
| Tasting room opening, tasting flights, bottle pricing, new release, now pouring | **Red.** This is the named category almost word for word. |
| A vineyard opening as a new business | **Amber.** "New business on the trail" is news. "Come taste our wine" is an offer to sell alcohol. |
| Band, food truck, market, fundraiser, or view at a winery or bar | **Green.** An event at a venue. |
| Naming a winery as the venue, or a wine tasting as an event name | **Green.** Plain fact, state it. |

Nothing about the lakes is off limits. Wineries and bars stay coverable as
venues and remain in the events feed. Only the sell moves.

## Route by surface, not by topic

Red content is not banned. It goes where it belongs.

- **manitoubeachmichigan.com** takes the full detail: tastings, flights,
  pricing, hours, launches. No age gate, no Meta. This is what `/wineries` and
  the trail partner tier are for.
- **Holly & the Yeti Page** covers the event angle and drives to the site.
- **The business's own Page** posts its own launch announcement. That is where
  an offer to sell alcohol belongs, and their Page should carry the
  Alcohol-related restriction anyway.

For a shoot at a winery, cut twice: a wine cut delivered to the client for
their Page, and an event cut (music, food, people, water, light) for ours.

## Imagery

The image is the subject as far as the classifier is concerned, and generated
graphics count.

Never make a drinking vessel or a pour the subject of a frame: no pours, no
clinking glasses, no bottle hero shots, no glass in hand. Point the camera at
the band, the plates, the water, the string lights, the people.

This is why `scripts/generate-business-spotlight.js` renders grapes for the
winery category and a stool for the bar category. It used to render a wine
glass and a pint glass, on a daily cron. Do not change them back. Note that
the `bar` regex also catches "Bar and Grill", so a family restaurant was
rendering a pint glass.

## Do not set the Page to "Alcohol-related"

That advice circulates in wine-industry blogs but applies to Pages that were
recommendation-suspended, which this Page was not. Facebook's own dialog warns
that adding any age restriction automatically removes the Page from every
Group it belongs to or manages, which would cost real local distribution.

There is also no content ratio that helps. Meta's remediation dialog says
"moving enough posts to trash can remove the restriction", so the threshold
counts flagged posts, not content mix. Adding family content does not offset
anything.

## Where these rules live in code

- `scripts/holly-persona.md` hard rule 8, the weekly Holly script
- `scripts/generate-business-spotlight.js` ICONS, the daily spotlight graphic
