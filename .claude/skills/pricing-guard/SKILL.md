---
name: pricing-guard
description: Enforce Manitou Beach pricing rules and warn against underpricing. Use whenever the user touches pricing copy, tier names, price amounts, the FeaturedPage, PricingSection, PAID_TIERS, SubmitSection tier selector, or any text mentioning "$", "per month", "free", "enhanced", "featured", or "premium". Also use when the user says "lower the price", "make it cheaper", "simplify pricing", or anything that sounds like reducing what they charge.
---

# pricing-guard

Protect the Manitou Beach pricing model from instinct-driven underpricing.

## The model (do not change without Daryl explicitly confirming)

**Tier names** (locked — never revert to old names):
- Enhanced — $9/mo base
- Featured — $23/mo base
- Premium — $43/mo base
- Free — $0 forever

**Penny-per-subscriber formula:**
```
displayed price = base + max(0, subscriberCount - 100) * 0.01
```
- First 100 subscribers: founding rate — flat, no rise
- Sub #101+: price rises $0.01 per new subscriber
- Founding members: grandfathered at sign-up price forever
- This is a real urgency mechanic — it is NOT a gimmick

**Newsletter add-ons:**
- Mention: $29/issue
- Feature: $75/issue
- Monthly Sponsor: $199/mo

**Constants in App.jsx:**
- `GRACE = 100` — subscriber threshold before price rises
- `SPOTS_LEFT` / `SPOTS_TOTAL` — waitlist trigger
- When `SPOTS_LEFT === 0`: FeaturedPage flips to waitlist mode

## Tier names that are WRONG (never use these)

| Wrong | Correct |
|---|---|
| Starter | Enhanced |
| Basic | Enhanced |
| Silver | Featured |
| Season Pass | Featured |
| Gold | Premium |
| Spotlight | Premium |

## The warning to keep in mind

Daryl underprices by instinct due to background. When his gut says "that's too high" — trust the market data, not the instinct.

At market rate this platform is worth **$40,000–$60,000**. The pricing is already discounted. Do not suggest further discounts unless Daryl gives a specific business reason (e.g. first-client deal, limited-time launch offer).

## When to flag a concern

If the user asks you to:
- Lower any tier price below the base rates above
- Remove the penny-per-subscriber mechanic
- Rename tiers back to old names
- Make the "all tiers" cheaper "to attract more sign-ups"

...pause and say: *"Just flagging — this goes against the pricing model in pricing-guard. Want to keep the change or stick with the current rates?"*

Do not block the change — Daryl is the boss. Just make sure it's intentional.

## The Free tier

Free listings are a deliberate funnel into paid. The Free tier should:
- Always appear first / leftmost in the pricing grid
- Never include logo, website link, or priority placement
- Have a clear CTA pointing to the listing form (`#submit` anchor on /featured)

Do not add features to the Free tier that belong to paid tiers.
