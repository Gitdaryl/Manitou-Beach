import { useState, useEffect, useRef, useCallback } from "react";
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import BuildPage from './pages/BuildPage';
import RatePage from './pages/RatePage';
import FoundingPage from './pages/FoundingPage';
import FoodTruckPartnerPage from './pages/FoodTruckPartnerPage';
import WinePartnerPage from './pages/WinePartnerPage';
import FoodTrucksPage from './pages/FoodTrucksPage';
import DiscoverPage, { VoiceWidget } from './pages/DiscoverPage';
import ClaimPage from './pages/ClaimPage';
import YetiAdminPage from './pages/YetiAdminPage';
import DispatchPage, { DispatchArticlePage } from './pages/DispatchPage';
import PromotePage, { AdvertisePage } from './pages/PromotePage';
import FeaturedPage from './pages/FeaturedPage';
import HappeningPage, { formatEventDate } from './pages/HappeningPage';
import ClaimPromoView from "./pages/ClaimPromoView";
import RedeemPromoView from "./pages/RedeemPromoView";
import WineriesPage from './pages/WineriesPage';
import FishingPage from './pages/FishingPage';
import HistoricalSocietyPage from './pages/HistoricalSocietyPage';
import MensClubPage from './pages/MensClubPage';
import LadiesClubPage from './pages/LadiesClubPage';
import DevilsLakePage from './pages/DevilsLakePage';
import RoundLakePage from './pages/RoundLakePage';
import VillagePage from './pages/VillagePage';
import USA250Page from "./pages/USA250Page";
import HomePage from './pages/HomePage';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";

// ============================================================
// 📑  TABLE OF CONTENTS
// ============================================================
// To easily navigate this 16,000+ line file, use your editors search feature
// (Cmd+F / Ctrl+F) and paste the exact section title below.
//
// line 0004: 🎬  GLOBAL CSS KEYFRAMES & ANIMATIONS
// line 0214: ✏️  CONFIGURABLE CONTENT — manage hero events via Notion
// line 0218: 🎨  DESIGN TOKENS
// line 0240: 💛  PAGE SPONSORS — update to activate; null = show placeholder
// line 0258: 🧭  NAV SECTIONS
// line 0283: 📋  BUSINESS DIRECTORY DATA
// line 0285: Village page editorial listings — hardcoded for the Walk the Village section only.
// line 0485: Events are 100% Notion-driven — no hardcoded data here.
// line 0489: 🎬  VIDEO / STORY CONTENT
// line 0543: 🧩  SHARED COMPONENTS
// line 0731: 💛  PAGE SPONSOR BANNER — appears above Footer on eligible pages
// line 0850: 📢  EVENT TICKER / MARQUEE
// line 0903: 🏠  HERO SECTION
// line 1168: 📅  FEATURED EVENTS STRIP — next 4 upcoming events, below hero
// line 1171: 📢  PROMO BANNER — reusable, fetches active page banners
// line 1353: 📰  NEWSLETTER SIGNUP
// line 1356: 📬  SUBSCRIBE CONFIRMATION MODAL (MAGIC MOMENT)
// line 1524: 📰  INLINE NEWSLETTER CTA (compact banner)
// line 1617: 📅  12-MONTH ROLLING EVENT TIMELINE
// line 1736: 📅  WHAT'S HAPPENING — home page teaser (3 events)
// line 1856: 📅  /happening — PAGE HERO
// line 1924: 📅  /happening — WEEKLY RECURRING EVENTS
// line 2034: 📅  /happening — SPECIAL / ONE-OFF EVENTS
// line 2175: 🎬  /happening — VIDEO SECTION
// line 2275: 📅  /happening — INLINE SUBMIT FORM
// line 2463: 🗺️  EXPLORE
// line 2579: 💰  LISTING TIERS / PRICING SECTION
// line 2814: 🏪  BUSINESS DIRECTORY
// line 3279: 🎙️  HOLLY & THE YETI
// line 3450: 🏡  LIVING HERE
// line 3551: 📝  SUBMISSION FORM
// line 3553: Client-side image compression
// line 3917: ℹ️  ABOUT
// line 3989: 🔻  FOOTER
// line 4188: 🧭  NAVBAR
// line 4518: 📅  /happening — FULL PAGE
// line 4695: 🚚  LIVE FOOD TRUCK STRIP (home page — shows only when a truck has checked in within 12h)
// line 4790: 🌊  ROUND LAKE PAGE
// line 5148: 🏘️  MANITOU BEACH VILLAGE PAGE
// line 5382: ⭐  FEATURED BUSINESS — SALES PAGE + STRIPE CHECKOUT
// line 6148: 🏛️  MEN'S CLUB PAGE (/mens-club)
// line 6484: 🏛️  HISTORICAL SOCIETY PAGE (/historical-society)
// line 6815: 🎣  FISHING PAGE (/fishing)
// line 7383: 🍷  WINERIES PAGE (/wineries)
// line 8759: 🏖️  DEVILS LAKE PAGE (/devils-lake)
// line 9076: 🌿  LAND & LAKE LADIES CLUB PAGE (/ladies-club)
// line 9078: LADIES_CLUB_EVENTS removed — content now inline in LadiesClubEventsSection
// line 9734: 📣  PROMOTE PAGE (/promote)
// line 10585: 📰  THE MANITOU DISPATCH — BLOG / NEWSLETTER ARCHIVE
// line 10606: 📢  AD SLOTS — Dispatch blog advertising
// line 11026: 📰  DISPATCH PREVIEW — Homepage 3-card teaser
// line 11233: 🛠️  YETI ADMIN — AI Article Writer (unlisted, /yeti-admin)
// line 11518: 🇺🇸  USA 250th ANNIVERSARY PAGE (/usa250)
// line 13633: 🎤  VOICE WIDGET — Vapi + ElevenLabs
// line 13912: 🗺️  DISCOVER PAGE — MAP-FIRST COMMUNITY GUIDE
// line 14409: 📄  PRIVACY POLICY
// line 14479: 📄  TERMS OF SERVICE
// line 14543: 🚚  /food-trucks — FOOD TRUCK LOCATOR
// line 14889: 🏗️  /build — WEBSITE RENTAL LEAD CAPTURE
// line 15149: 🔒  /founding — FOUNDING MEMBER PAGE (private link, friend outreach)
// line 15526: 🚚  /food-truck-partner — FOOD TRUCK PARTNER PAGE (private link)
// line 15936: 🍷  /wine-partner — WINE TRAIL PARTNER PAGE (private link)
// line 16526: 📱  BLACKBIRD PROMO - USER CLAIM VIEW
// line 16667: ☕️  BLACKBIRD PROMO - BARISTA REDEEM VIEW
// line 16756: 🌐  APP ROOT
// ============================================================

// ============================================================
// 🎬  GLOBAL CSS KEYFRAMES & ANIMATIONS
// ============================================================
export { GlobalStyles, PromoBanner, NewsletterInline, EventTimeline, HollyYetiSection,
  compressImage, SubmitSection, FooterNewsletterModal, Footer, Navbar, EventLightbox,
  CATEGORY_COLORS
} from './components/Layout';

// ============================================================
// 📢  AD SLOTS — Dispatch blog advertising
// ============================================================

export function useDispatchAds(page) {
  const [slots, setSlots] = useState({});
  useEffect(() => {
    fetch(`/api/dispatch-ads?page=${page}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots || {}))
      .catch(() => {});
  }, [page]);
  return slots;
}

// Pick a random ad from the slot array (for rotation)
export function pickAd(slotAds) {
  if (!slotAds || !slotAds.length) return null;
  return slotAds[Math.floor(Math.random() * slotAds.length)];
}


// ── Dispatch Card Sponsors ──────────────────────────────────────────────────────
// Add/remove sponsors here. Rotates across cards by index.
// logo: path in /public (e.g. '/images/blackbird-logo.png'), or null → shows 📷 placeholder
// Set array to [] to hide all sponsor strips.
export const DISPATCH_CARD_SPONSORS = [
  {
    name: 'Blackbird Cafe & Baking Co.',
    logo: '/images/blackbird-logo.png',
    offerText: 'Free cookie for new subscribers',
  },
];

// ============================================================
// 📰  DISPATCH PREVIEW — Homepage 3-card teaser


// ============================================================
// 🛠️  YETI ADMIN — AI Article Writer (unlisted, /yeti-admin)
// ============================================================
export const DISPATCH_CATEGORIES = ['Lake Life', 'Community', 'Events', 'Real Estate', 'Food & Drink', 'History', 'Recreation', 'Seasonal Tips', "Holly's Corner", 'Advertorial'];

// ─── Review Capture — Business Config ────────────────────────────────────────
// Add a key per business slug (matches /claim/:slug URL)
const CLAIM_BUSINESSES = {
  cafe: {
    name: 'Blackbird Cafe & Baking Company',
    offerText: 'free cookie',
    descLine: 'A welcome gift from The Manitou Dispatch',
    emoji: '☕',
    accentColor: '#D4845A',
    reviewUrl: 'https://www.yelp.com/writeareview/biz/BV2J5pWMspuXAU78MeQo_A?return_url=%2Fbiz%2FBV2J5pWMspuXAU78MeQo_A&review_origin=biz-details-war-button',
  },
};




// ============================================================
// 🎤  VOICE WIDGET — Vapi + ElevenLabs
// ============================================================
export const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
export const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

export const SITE_KNOWLEDGE = `
ABOUT MANITOU BEACH & DEVILS LAKE:
Manitou Beach, Michigan sits on Devils Lake in the Irish Hills — locals call it "the party lake." Devils Lake is 1,330 acres with 600+ boat slips. The community has been coming back every summer since the 1870s. This platform is the community's digital home: business directory, events calendar, and newsletter.

ROUND LAKE:
515 acres, 67 feet deep — the quieter side of lake life. Connected to Devils Lake by a shallow channel at Cherry Point. A glacial kettle lake carved ~10,000 BC. No bars or marinas — just homes, families, and serious fishing. Same zip code (49253) and township (Rollin) as Devils Lake.

THE VILLAGE:
A walkable strip on Devils Lake Highway and Lakeview Boulevard with boutique shops, a from-scratch cafe, satellite wine tasting rooms, and an iconic lighthouse replica. Open mostly Thursday–Sunday. Starting May 2026, village shops become satellite tasting rooms for Michigan wineries — Ang & Co pours Chateau Fontaine, Faust House pours Cherry Creek Cellars.

FISHING:
Eight warm-water species: Largemouth Bass (aggressive, near docks/weed edges), Bluegill (excellent numbers, great for families), Northern Pike (Tip-Up Festival star, through ice in winter), Yellow Perch (averaged 9"+ in DNR surveys, a winter staple), Black Crappie, Smallmouth Bass, Walleye (Round Lake), Pumpkinseed Sunfish. Spring bass spawn in shallows. Winter ice fishing on frozen Devils Lake is a major tradition.

WINERIES:
Cherry Creek Cellars — small-batch Michigan wines, 11500 Silver Lake Hwy, Brooklyn MI 49230, 20 min from Manitou Beach. Gypsy Blue Vineyards — new vineyard in the Irish Hills. Village tasting rooms: Ang & Co (141 N. Lakeview Blvd) and Faust House Scrap n Craft (140 N. Lakeview Blvd).

MEN'S CLUB (Devils and Round Lake Men's Club):
501(c)(3) nonprofit running the Tip-Up Festival (70+ year ice fishing festival on frozen Devils Lake, held in February) and the Fourth of July Firecracker 7K run starting at 3171 Round Lake Hwy. Raises funds for scholarships, Toys for Tots, Shop with a Cop, and Christmas gift baskets for families in need.

HISTORICAL SOCIETY (MBHRS — Manitou Beach Historic Renovation Society):
Restoring and revitalizing the village. Home of the Boat House Art Gallery — largest nonprofit gallery in Lenawee County, 50+ Michigan artists, at 138 N. Lakeview Blvd. Annual events: Devils Lake Festival of the Arts (100 artist booths, live music, food trucks) and Village Car Shows. Located at 762 Manitou Road, Manitou Beach MI 49253.

HISTORY:
Pre-1830: Potawatomi and Ojibwa people camped along the shores. 1870s: Grand hotels, dance pavilion, bathhouses, and two railroad stations made Devils Lake a top Michigan summer destination. 1888: Manitou Beach officially platted. 1920s–40s: Yacht Club established. 1950s: Tip-Up Festival launched. Today: boating, fishing, festivals, and a tight-knit lake community.

DEVILS LAKE YACHT CLUB: Fine dining overlooking Devils Lake, sailing races, and a gathering place for the boating community.
`.trim();


// ============================================================
// 🗺️  DISCOVER PAGE — MAP-FIRST COMMUNITY GUIDE
// ============================================================

export const DISCOVER_MAP_CENTER = { lat: 42.0047, lng: -84.2888 };

export const DISCOVER_CATS = [
  { id: 'all',        label: 'All',                icon: '🗺️', color: '#7A8E72' },
  { id: 'food',       label: 'Food & Drink',        icon: '🍽️', color: '#D4845A', notionKey: 'Food & Drink' },
  { id: 'stays',      label: 'Stays & Rentals',      icon: '🏠', color: '#2D3B45', notionKey: 'Stays & Rentals' },
  { id: 'wineries',   label: 'Wineries',             icon: '🍷', color: '#7B4F2E', notionKey: 'Breweries & Wineries' },
  { id: 'water',      label: 'Boat & Water',         icon: '⛵', color: '#3A6B85', notionKey: 'Boating & Water' },
  { id: 'events',     label: 'Events & Venues',      icon: '🥂', color: '#8B6BA8', notionKey: 'Events & Venues' },
  { id: 'shopping',   label: 'Shopping',             icon: '🛍️', color: '#B07D62', notionKey: 'Shopping & Gifts' },
  { id: 'services',   label: 'Home Services',        icon: '🔧', color: '#5B6E5A', notionKey: 'Home Services' },
  { id: 'healthcare', label: 'Healthcare',           icon: '🏥', color: '#c05a5a' },
  { id: 'grocery',    label: 'Grocery & Pharmacy',  icon: '🛒', color: '#5B7E95' },
  { id: 'schools',    label: 'Schools',              icon: '🎓', color: '#6B7EC8' },
  { id: 'community',  label: 'Community',            icon: '🏛️', color: '#7A8E72' },
  { id: 'gas',        label: 'Gas Stations',         icon: '⛽', color: '#B8860B' },
  // ↑ To add a new category: add a line here + set the same id as the Notion Category value
];

export const DISCOVER_POIS = [
  // Healthcare — Tecumseh ~84.94°W, Adrian ~84.04°W
  { id: 'herrick', name: 'ProMedica Herrick Hospital', cat: 'healthcare', sub: 'Full Hospital · ER', address: '500 E Pottawatamie St, Tecumseh, MI', phone: '(517) 424-3000', note: '~15 min from Manitou Beach', lat: 42.0005, lng: -83.9340, website: 'https://www.promedica.org/herrick-hospital' },
  { id: 'allegiance', name: 'Henry Ford Allegiance Health', cat: 'healthcare', sub: 'Full Hospital · Level II Trauma', address: '205 N East Ave, Jackson, MI', phone: '(517) 788-4800', note: '~30 min · Major medical center', lat: 42.2490, lng: -84.3945, website: 'https://www.henryford.com/locations/allegiance' },
  { id: 'urgent-tec', name: 'Urgent Care – Tecumseh', cat: 'healthcare', sub: 'Urgent Care', address: '821 W Chicago Blvd, Tecumseh, MI', phone: '(517) 423-3200', note: '~15 min · Walk-in, no appointment needed', lat: 42.0040, lng: -83.9580 },
  { id: 'cvs-tec', name: 'CVS Pharmacy – Tecumseh', cat: 'healthcare', sub: 'Pharmacy · MinuteClinic', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0035, lng: -83.9548 },
  { id: 'walgreens-adr', name: 'Walgreens – Adrian', cat: 'healthcare', sub: 'Pharmacy', address: 'N Main St, Adrian, MI', note: '~20 min · Open late', lat: 41.9197, lng: -84.0382 },
  // Grocery
  { id: 'walmart-adr', name: 'Walmart Supercenter', cat: 'grocery', sub: 'Grocery · Pharmacy · Bait & Tackle', address: '1601 E US Hwy 223, Adrian, MI', note: '~20 min', lat: 41.9001, lng: -84.0174 },
  { id: 'meijer-tec', name: 'Meijer', cat: 'grocery', sub: 'Grocery · Gas Station', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0030, lng: -83.9565 },
  // Boat & Water — southwest end of Devils Lake, just off Devils Lake Hwy
  { id: 'launch-main', name: 'Public Boat Launch – Devils Lake', cat: 'water', sub: 'Free Public Ramp', address: 'Devils Lake Hwy, Manitou Beach, MI', note: 'Free · Paved ramp · 60-car trailer parking', lat: 41.9795, lng: -84.3088 },
  { id: 'dnr-ramp', name: 'DNR Access Site – Round Lake', cat: 'water', sub: 'State DNR Ramp', address: 'Round Lake, Manitou Beach, MI', note: 'Kayaks · Canoes · Small boats', lat: 41.9580, lng: -84.3200 },
  { id: 'marina', name: 'Manitou Beach Marina', cat: 'water', sub: 'Marina · 600+ Slips', address: '9517 Devils Lake Hwy, Manitou Beach, MI', note: 'Seasonal dockage available', lat: 41.9812, lng: -84.3091 },
  // Schools
  { id: 'onsted-hs', name: 'Onsted High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '8036 Macon Rd, Onsted, MI', phone: '(517) 467-2170', note: '~10 min · Closest district to Manitou Beach', lat: 42.0030, lng: -84.1870 },
  { id: 'onsted-elem', name: 'Onsted Elementary School', cat: 'schools', sub: 'Public K–5 · Onsted Community Schools', address: 'Onsted, MI', phone: '(517) 467-2170', note: '~10 min · Same campus area as HS', lat: 42.0043, lng: -84.1882 },
  { id: 'addison-hs', name: 'Addison Community Schools', cat: 'schools', sub: 'Public K–12 · Addison Community Schools', address: '219 N Comstock St, Addison, MI', phone: '(517) 547-6500', note: '~15 min · Northwest Lenawee County', lat: 41.9887, lng: -84.3448 },
  { id: 'tec-hs', name: 'Tecumseh High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '400 N Maumee St, Tecumseh, MI', phone: '(517) 423-3366', note: '~15 min · Tecumseh Public Schools', lat: 42.0100, lng: -83.9450 },
  { id: 'adrian-hs', name: 'Adrian High School', cat: 'schools', sub: 'Public HS · Grades 9–12', address: '785 Riverside Ave, Adrian, MI', phone: '(517) 263-2115', note: '~20 min · Adrian Public Schools', lat: 41.9060, lng: -84.0280 },
  { id: 'lenawee-christian', name: 'Lenawee Christian School', cat: 'schools', sub: 'Private K–12', address: 'Adrian, MI', phone: '(517) 265-5020', note: '~20 min · Faith-based PreK–12', lat: 41.8902, lng: -84.0557 },
  // Wineries
  { id: 'chateau-aero', name: 'Chateau Aeronautique Winery', cat: 'wineries', sub: 'Winery & Event Venue', address: '1849 E Parnall Rd, Jackson, MI', phone: '(517) 795-3620', note: '~30 min · Live music weekends · All-weather biergarten', lat: 42.2380, lng: -84.3750, website: 'https://chateauaeronautique.com' },
  { id: 'cherry-creek', name: 'Cherry Creek Cellars', cat: 'wineries', sub: 'Small-Batch Winery', address: '11500 Silver Lake Hwy, Brooklyn, MI 49230', phone: '(517) 592-4315', note: '~20 min · Laid-back tasting room', lat: 42.0504585, lng: -84.3012163, website: 'https://cherrycreekcellars.com' },
  { id: 'ang-co-wine', name: 'Ang & Co', cat: 'wineries', sub: 'Satellite Tasting Room', address: '141 N Lakeview Blvd, Manitou Beach, MI', phone: '(517) 547-6030', note: 'In the Village · Michigan wine + gifts', lat: 41.9720, lng: -84.3040, website: 'https://www.angandco.net' },
  // Community — Manitou Beach Village at south end of lake ~41.9697, -84.3083
  { id: 'yacht-club-loc', name: 'Devils Lake Yacht Club', cat: 'community', cats: ['community', 'water', 'food'], sub: 'Sailing & Social Club', address: '2097 Marsh Dr, Manitou Beach, MI', note: 'Since the 1940s · Regattas · Friday Fish Fry', lat: 41.9678, lng: -84.2880, website: 'https://www.devilslakeyachtclub.com' },
  { id: 'mens-club-loc', name: "Devils & Round Lake Men's Club", cat: 'community', sub: 'Civic Organization', address: 'Manitou Beach, MI', note: 'Tip-Up Festival · Firecracker 7K · Shop with a Cop', lat: 41.9720, lng: -84.2990, href: '/mens-club' },
  { id: 'mbhrs-loc', name: 'Manitou Beach Historic Renovation Society', cat: 'community', sub: 'Historical & Arts Org', address: 'Manitou Beach Village', note: 'Village restoration · Arts · Community stewardship', lat: 41.9730, lng: -84.3040, href: '/historical-society' },
  { id: 'village-loc', name: 'Manitou Beach Village', cat: 'community', sub: 'Village District', address: 'N Lakeview Blvd, Manitou Beach, MI', note: 'Shops · Cafe · Wine tasting · The Lighthouse', lat: 41.9720, lng: -84.3055, href: '/village' },
];

export const DISCOVER_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f2ede3' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3B3228' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#faf6ef' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#9dc3d4' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5B7E95' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#e8e0d0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ddd5c0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#cdc0a8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#b8a88a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c5d5a8' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#7A8E72' }] },
];

export function createDiscoverPin(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22s14-12.67 14-22C28 6.27 21.73 0 14 0z" fill="${color}" stroke="rgba(0,0,0,0.12)" stroke-width="1"/><circle cx="14" cy="14" r="5.5" fill="white" opacity="0.95"/></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function buildDiscoverInfoWindow(poi) {
  const cat = DISCOVER_CATS.find(c => c.id === poi.cat);
  const color = cat?.color || '#7A8E72';
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((poi.address || poi.name) + (poi.address ? '' : ', MI'))}`;
  return `<div style="padding:6px 8px 10px;max-width:250px;font-family:system-ui,sans-serif;line-height:1.45">
    <div style="font-size:13px;font-weight:700;color:#2D3B45;margin-bottom:3px">${poi.name}</div>
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:${color};font-weight:700;margin-bottom:6px">${poi.sub}</div>
    ${poi.address ? `<div style="font-size:11px;color:#666;margin-bottom:4px">${poi.address}</div>` : ''}
    ${poi.phone ? `<a href="tel:${poi.phone.replace(/\D/g, '')}" style="display:block;font-size:12px;font-weight:600;color:#7A8E72;margin-bottom:4px;text-decoration:none">${poi.phone}</a>` : ''}
    ${poi.note ? `<div style="font-size:11px;color:#999;margin-bottom:8px;font-style:italic">${poi.note}</div>` : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="${dir}" target="_blank" style="font-size:12px;font-weight:700;color:#5B7E95;text-decoration:none">Get Directions →</a>
      ${poi.website ? `<a href="${poi.website}" target="_blank" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Website →</a>` : ''}
      ${poi.href ? `<a href="${poi.href}" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Learn More →</a>` : ''}
    </div>
  </div>`;
}


// ============================================================
// 📄  PRIVACY POLICY

// ============================================================
// 📄  TERMS OF SERVICE

// ============================================================
// 🚚  /food-trucks — FOOD TRUCK LOCATOR

// ============================================================
// 🏗️  /build — WEBSITE RENTAL LEAD CAPTURE

// ============================================================
// 🔒  /founding — FOUNDING MEMBER PAGE (private link, friend outreach)
// ============================================================
const FOUNDING_TIERS = [
  { name: "Enhanced", price: 9,  perks: ["Business listing on Manitou Beach", "Map pin on /discover", "Category placement", "Contact info + description", "Link to your website", "Upgrade to Featured or Premium at founding rates — any time"] },
  { name: "Featured", price: 23, highlight: true, perks: ["Everything in Enhanced", "Priority placement in category", "Logo displayed on listing", "Newsletter mention eligibility", "Highlighted card styling", "Upgrade to Premium at founding rates — any time"] },
  { name: "Premium",  price: 43, perks: ["Everything in Featured", "Top of category, always", "Monthly newsletter feature eligible", "First call for sponsorship spots", "Founding badge on listing"] },
];

const FOUNDING_MATH = [
  { subs: "Today",    newPrice: null,  yourPrice: 9,  label: "Founding rate" },
  { subs: "200 subs", newPrice: 10,   yourPrice: 9,  label: "You still pay $9" },
  { subs: "500 subs", newPrice: 13,   yourPrice: 9,  label: "You still pay $9" },
  { subs: "1,000 subs", newPrice: 18, yourPrice: 9,  label: "You still pay $9" },
];


// ============================================================
// 🚚  /food-truck-partner — FOOD TRUCK PARTNER PAGE (private link)
// ============================================================
const TRUCK_HOW = [
  { step: "01", title: "Sign up for your Founding listing", copy: "Truck name, cuisine, email — that's it. Your founding rate is locked the moment you pay. Daryl sets you up with a check-in link the same day." },
  { step: "02", title: "Use your check-in URL when you're nearby", copy: "Heading to Manitou Beach? Hit your link. Your pin goes live on the map with a 'Live Now' badge. Takes three seconds." },
  { step: "03", title: "Locals find you in real time", copy: "People checking the locator see you're here, right now. Not a static listing — a live signal that drives foot traffic." },
];
const TRUCK_AUDIENCE = [
  { icon: "🏖️", label: "Lake crowd", copy: "Manitou Beach draws thousands of summer visitors — boaters, swimmers, families. They're hungry and they're looking." },
  { icon: "🍷", label: "Wine trail visitors", copy: "The Irish Hills wine trail runs through here. Day-trippers who've been tasting since noon are your best customers." },
  { icon: "🏡", label: "Lake homeowners", copy: "300+ waterfront properties and seasonal rentals nearby. People who've been here all week and want something different for lunch." },
  { icon: "📅", label: "Event weekends", copy: "Tournaments, festivals, car shows, open-air concerts. High-traffic weekends where a well-placed truck cleans up." },
];
const TRUCK_GETS = [
  { icon: "📍", title: "Live map pin", copy: "Your truck appears on the Manitou Beach Food Truck Locator the moment you check in. 'Live Now' badge, your name, what you serve." },
  { icon: "🔗", title: "Personal check-in URL", copy: "A private link that's yours. Open it from your phone when you're rolling into town. No login, no app, no fuss." },
  { icon: "📋", title: "Directory listing", copy: "Year-round presence in the All Trucks directory — your name, cuisine, and contact info visible even when you're not checked in." },
  { icon: "☀️", title: "Summer season visibility", copy: "Manitou Beach peaks June through September. Your truck is in front of the right people at the right time." },
];
const TRUCK_FOUNDING_ITEMS = [
  { icon: "📍", label: "Live map pin", sub: "Your truck appears on the map the moment you check in." },
  { icon: "🔗", label: "Personal check-in URL", sub: "Your private link. Open from your phone. No app, no login." },
  { icon: "🔗", label: "Website / menu / Instagram link", sub: "One tap to your menu on every live card." },
  { icon: "⭐", label: "Featured Truck badge", sub: "You stand out in the map and directory." },
  { icon: "📰", label: "Newsletter shoutout when live", sub: "On send days, we mention you're open. One email, hundreds of readers." },
  { icon: "🥇", label: "Priority in All Trucks directory", sub: "Listed first. Above Basic trucks." },
  { icon: "📅", label: "Seasonal schedule note (optional)", sub: "Tell regulars where to find you every week." },
];
const TRUCK_BASIC_ITEMS = [
  { icon: "📋", label: "Directory listing", sub: "Your truck name and cuisine in the All Trucks list. Nothing else." },
];
const TRUCK_FOUNDING_MATH = [
  { subs: "Today",      newPrice: null, yourPrice: 9, label: "Founding rate" },
  { subs: "200 subs",   newPrice: 10,   yourPrice: 9, label: "You still pay $9" },
  { subs: "500 subs",   newPrice: 13,   yourPrice: 9, label: "You still pay $9" },
  { subs: "1,000 subs", newPrice: 18,   yourPrice: 9, label: "You still pay $9" },
];


// ============================================================
// 🍷  /wine-partner — WINE TRAIL PARTNER PAGE (private link)
// ============================================================
const WINE_PARTNER_HOW = [
  { step: "01", title: "A customer visits your tasting room", copy: "They enjoy a pour, browse your space, connect with what you offer. That experience is already happening — we just give them a way to capture it." },
  { step: "02", title: "They scan the QR card, rate their visit", copy: "Wine quality, service, atmosphere, value. A minute on their phone. No app to download, no account to create. Scan, rate, done." },
  { step: "03", title: "Your scorecard builds — publicly", copy: "Every rating adds to your live community scorecard on Manitou Beach. Visitors researching the trail see your scores before they visit. Your fans become your best marketing." },
];
const WINE_PARTNER_GETS = [
  { icon: "📊", title: "Public Scorecard", copy: "Live community ratings across four dimensions — Wine Quality, Service, Atmosphere, Value. Visible to anyone exploring the trail on Manitou Beach." },
  { icon: "📄", title: "Print Kit", copy: "100 printed stamp cards (6×4) for your counter plus a display insert. $49 one-time covers design, print, and delivery. Refills are $29 per 100 cards when you run out." },
  { icon: "🏆", title: "Season-End Award", copy: "At the end of 2026, top-rated venues in each category receive a plaque — something to hang on your wall, post online, and be proud of." },
  { icon: "👥", title: "Community Visibility", copy: "Your listing on Manitou Beach, seen by the region's most engaged local audience — visitors, locals, and seasonal residents all in one place." },
];
const WINE_PARTNER_AWARDS = [
  "Best Red Wine",
  "Best White Wine",
  "Best Sweet Wine",
  "Best Fruit or Specialty Wine",
  "Best Tasting Room Experience",
  "Outstanding Customer Hospitality",
  "Best Atmosphere",
];
// ── /rate — Universal Wine Trail Rating Page ──────────────────────────
const RATE_VENUES = WINERY_VENUES.filter(v => v.section !== 'extended').map(v => v.name);


const WINE_PARTNER_FRICTIONLESS = [
  { label: "No app required", sub: "Customers rate in a browser. Done." },
  { label: "No account to manage", sub: "Your profile is already live." },
  { label: "No work to maintain", sub: "We run the system. You run the tasting room." },
  { label: "No hidden cost later", sub: "If that ever changes, you'll hear it from us first." },
];





// ============================================================
// 🌐  APP ROOT
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/claim-promo" element={<ClaimPromoView />} />
        <Route path="/redeem-promo" element={<RedeemPromoView />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/happening" element={<HappeningPage />} />
        <Route path="/round-lake" element={<RoundLakePage />} />
        <Route path="/village" element={<VillagePage />} />
        <Route path="/featured" element={<FeaturedPage />} />
        <Route path="/mens-club" element={<MensClubPage />} />
        <Route path="/ladies-club" element={<LadiesClubPage />} />
        <Route path="/historical-society" element={<HistoricalSocietyPage />} />
        <Route path="/fishing" element={<FishingPage />} />
        <Route path="/wineries" element={<WineriesPage />} />
        <Route path="/devils-lake" element={<DevilsLakePage />} />
        <Route path="/promote" element={<PromotePage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/dispatch/:slug" element={<DispatchArticlePage />} />
        <Route path="/yeti-admin" element={<YetiAdminPage />} />
        <Route path="/claim/:slug" element={<ClaimPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/food-trucks" element={<FoodTrucksPage />} />
        <Route path="/build" element={<BuildPage />} />
        <Route path="/rate" element={<RatePage />} />
        <Route path="/wine-partner" element={<WinePartnerPage />} />
        <Route path="/food-truck-partner" element={<FoodTruckPartnerPage />} />
        <Route path="/founding" element={<FoundingPage />} />
        <Route path="/usa250" element={<USA250Page />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
      <VoiceWidget />
    </BrowserRouter>
  );
}
