# Manitou Beach Michigan — Community Platform
### Holly & The Yeti · Devils Lake

A React-based community website for Manitou Beach, Michigan. Business directory, events calendar, newsletter signup, and submission forms — all in a single file.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `manitou-beach-platform.jsx` | The entire platform — one React component file |

---

## ✏️ Weekly Content Updates (Your 10-Minute Task)

Everything you need to change week-to-week lives at the **very top of the file**, inside the clearly marked `CONFIGURABLE CONTENT` section.

### 1. Switch the Hero Mode
```js
const HERO_MODE = "event"; // "default" | "event" | "video"
```
- `"default"` — Standard branding hero with lake background
- `"event"` — Features your FEATURED_EVENT content in the hero
- `"video"` — Video background (paste URL into HERO_VIDEO_URL)

### 2. Update the Featured Event
```js
const FEATURED_EVENT = {
  active: true,
  eyebrow: "Coming Up",
  name: "Devils Lake Boat Parade & Fireworks",
  date: "July 4th, 2026",
  description: "Your event description here.",
  cta: "See All Events",
  ctaLink: "#happening",
};
```
Change `active: false` to hide the event without deleting anything.

### 3. Update the Featured Business
```js
const FEATURED_BUSINESS = {
  name: "Rusty Anchor Bar & Grill",
  category: "Food & Drink",
  tagline: "Cold beer, lake views, and the best fish fry in the Irish Hills.",
  url: "#businesses",
  badge: "Featured This Week",
};
```

---

## 🏪 Managing the Business Directory

Find the `BUSINESSES` array near the top of the file. Each business looks like this:

```js
{
  id: 1,
  name: "Business Name",
  category: "Food & Drink",       // Used for category filter tabs
  description: "2-3 sentences.",
  featured: true,                  // true = top "Featured" section | false = regular listing
  website: "https://...",
  phone: "(517) 555-0101",
},
```

**To add a new business:** Copy an existing entry, paste it at the end of the array, update the `id` number, and fill in the details.

**To mark as featured:** Change `featured: false` to `featured: true`.

**Categories used:** Food & Drink · Boating & Water · Real Estate · Film & Video · Sports & Recreation — add any category you want; the filter tabs generate automatically.

---

## 📅 Managing Events

Find the `EVENTS` array. Each event:

```js
{
  id: 1,
  name: "Event Name",
  date: "July 4, 2026",
  time: "Dusk",
  category: "Community",   // Community | Market | Activity | Media
  description: "Brief description.",
},
```

To remove a past event, delete its block from the array.

---

## 🔗 Connecting Your Real Tools

The platform is pre-wired for your tech stack. Search for `TODO` comments in the file to find each connection point.

### Newsletter (beehiiv)
In the `NewsletterBar` component, replace the `console.log` line:
```js
// Replace with your beehiiv embed action URL
// Get this from: beehiiv Dashboard → Grow → Embeds → Embed Form
window.location.href = "https://embeds.beehiiv.com/YOUR_FORM_ID";
```
Or use beehiiv's embed code directly in an `<iframe>` — either works.

### Submission Forms (Tally.so)
In the `SubmitSection` component, the form `onSubmit` handler has a `TODO`. You have two options:

**Option A — Keep the React form, post to Tally:**
```js
// Add to your form element:
action="https://tally.so/r/YOUR_FORM_ID"
method="POST"
```

**Option B — Replace with Tally embed:**
```jsx
// Replace the entire form with:
<iframe
  src="https://tally.so/embed/YOUR_FORM_ID"
  width="100%"
  height="600"
  frameBorder="0"
/>
```
Tally forms are free and require zero backend setup.

---

## 🚀 Hosting on Framer

This is a React `.jsx` file. To use it on Framer:

1. In Framer, create a new project
2. Go to **Assets → Code** → click `+` to add a code component
3. Paste the entire contents of `manitou-beach-platform.jsx`
4. Framer will render it as a full-page component
5. Set it as your main page component

**Note:** Framer handles Google Fonts automatically — the `<link>` tag at the top of the app will work in Framer's environment.

Alternatively, this file works in any React app (Vite, Create React App, Next.js).

---

## 🎨 Design Tokens (Colors)

All colors are in the `C` object at the top. Change them here to retheme the whole site:

```js
const C = {
  cream:       "#FAF6EF",   // Main background
  sage:        "#7A8E72",   // Primary accent (buttons, labels, links)
  lakeBlue:    "#5B7E95",   // Secondary blue
  dusk:        "#2D3B45",   // Dark sections, nav
  sunset:      "#D4845A",   // Featured/highlighted elements
  text:        "#3B3228",   // Body text
  // ...
};
```

---

## 💰 Revenue Model

| Tier | What They Get | Price |
|------|--------------|-------|
| Free listing | Name, description, phone, website in directory | $0 |
| Featured listing | Top of directory, ★ badge, newsletter mention | $150–200/mo |
| Featured listing + video | All above + business highlight video | $300–500/mo |
| Yeti Signature Films | Full cinematic production | Starting $25K |

**Holly's partnership contribution** covers platform infrastructure (~$200–300/month) in exchange for her listing appearing as featured by default and newsletter/co-branded content for her real estate marketing.

---

## 📱 Social Media Links

Update these in the `HollyYetiSection` and `Footer` components:

| Platform | Handle | URL |
|----------|--------|-----|
| Facebook | HollyandtheYeti | facebook.com/HollyandtheYeti |
| YouTube | @HollyandtheYetipodcast | youtube.com/@HollyandtheYetipodcast |
| Instagram | @hollyandtheyeti | instagram.com/hollyandtheyeti |

---

## 📋 Launch Checklist

- [ ] Replace placeholder business data with real local businesses
- [ ] Set up beehiiv account → connect newsletter form
- [ ] Set up Tally.so forms → connect submission forms
- [ ] Update all social media links
- [ ] Add Holly's real contact info and Foundation Realty details
- [ ] Set up Notion CRM for tracking leads
- [ ] Set up Stripe for invoicing featured listing clients
- [ ] Upload to Framer (or chosen host)
- [ ] Set HERO_MODE to "event" when first event is ready
- [ ] Send launch announcement via beehiiv

---

## 🛠️ Tech Stack

| Tool | Purpose | Cost |
|------|---------|------|
| Framer | Hosting + CMS | $5/month |
| beehiiv | Newsletter | Free |
| Tally.so | Form submissions | Free |
| Notion | CRM + pipeline | Free |
| Stripe | Client invoicing | Transaction fees only |

**Monthly platform cost: ~$5/month** until volume justifies upgrades.

---

*Built by Holly & The Yeti for the Manitou Beach community. No beach. Still worth it.*
