// ============================================================
// 🗺️  DISCOVER PAGE - MAP-FIRST COMMUNITY GUIDE
// ============================================================
// Shared constants for Discover, Wineries, and any future map pages.

// ============================================================
// 📢  AD SLOTS - Dispatch blog advertising
// ============================================================
import { useState, useEffect } from 'react';
import formatPhone from '../utils/formatPhone';

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

export function pickAd(slotAds) {
  if (!slotAds || !slotAds.length) return null;
  return slotAds[Math.floor(Math.random() * slotAds.length)];
}

// ============================================================
// 🎤  VOICE CONCIERGE - Site Knowledge Base
// ============================================================

export const SITE_KNOWLEDGE = `
ABOUT MANITOU BEACH & DEVILS LAKE:
Manitou Beach, Michigan sits on Devils Lake in the Irish Hills - locals call it "the party lake." Devils Lake is 1,330 acres with 600+ boat slips. The community has been coming back every summer since the 1870s. This platform is the community's digital home: business directory, events calendar, and newsletter.

ROUND LAKE:
515 acres, 67 feet deep - the quieter side of lake life. Connected to Devils Lake by a shallow channel at Cherry Point. A glacial kettle lake carved ~10,000 BC. No bars or marinas - just homes, families, and serious fishing. Same zip code (49253) and township (Rollin) as Devils Lake.

THE VILLAGE:
A walkable strip on Devils Lake Highway and Lakeview Boulevard with boutique shops, a from-scratch cafe, satellite wine tasting rooms, and an iconic lighthouse replica. Open mostly Thursday–Sunday. Starting May 2026, village shops become satellite tasting rooms for Michigan wineries - Ang & Co pours Chateau Fontaine, Faust House pours Cherry Creek Cellars.

FISHING:
Eight warm-water species: Largemouth Bass (aggressive, near docks/weed edges), Bluegill (excellent numbers, great for families), Northern Pike (Tip-Up Festival star, through ice in winter), Yellow Perch (averaged 9"+ in DNR surveys, a winter staple), Black Crappie, Smallmouth Bass, Walleye (Round Lake), Pumpkinseed Sunfish. Spring bass spawn in shallows. Winter ice fishing on frozen Devils Lake is a major tradition.

WINERIES:
Cherry Creek Cellars - small-batch Michigan wines, 11500 Silver Lake Hwy, Brooklyn MI 49230, 20 min from Manitou Beach. Gypsy Blue Vineyards - new vineyard in the Irish Hills. Village tasting rooms: Ang & Co (141 N. Lakeview Blvd) and Faust House Scrap n Craft (140 N. Lakeview Blvd).

MEN'S CLUB (Devils and Round Lake Men's Club):
501(c)(3) nonprofit running the Tip-Up Festival (70+ year ice fishing festival on frozen Devils Lake, held in February) and the Fourth of July Firecracker 7K run starting at 3171 Round Lake Hwy. Raises funds for scholarships, Toys for Tots, Shop with a Cop, and Christmas gift baskets for families in need.

HISTORICAL SOCIETY (MBHRS - Manitou Beach Historic Renovation Society):
Restoring and revitalizing the village. Home of the Boat House Art Gallery - largest nonprofit gallery in Lenawee County, 50+ Michigan artists, at 138 N. Lakeview Blvd. Annual events: Devils Lake Festival of the Arts (100 artist booths, live music, food trucks) and Village Car Shows. Located at 762 Manitou Road, Manitou Beach MI 49253.

HISTORY:
Pre-1830: Potawatomi and Ojibwa people camped along the shores. 1870s: Grand hotels, dance pavilion, bathhouses, and two railroad stations made Devils Lake a top Michigan summer destination. 1888: Manitou Beach officially platted. 1920s–40s: Yacht Club established. 1950s: Tip-Up Festival launched. Today: boating, fishing, festivals, and a tight-knit lake community.

DEVILS LAKE YACHT CLUB: Fine dining overlooking Devils Lake, sailing races, and a gathering place for the boating community.
`.trim();


// ============================================================
// 🗺️  MAP CONSTANTS
// ============================================================

export const DISCOVER_MAP_CENTER = { lat: 42.0160, lng: -84.2888 };

export const DISCOVER_CATS = [
  { id: 'all',        label: 'All',               icon: '/images/icons/plan-map-icon-dark.png',      color: '#7A8E72' },
  { id: 'food',       label: 'Food & Drink',       icon: '/images/icons/food-drink-icon-dark.png',    color: '#D4845A', notionKey: 'Food & Drink' },
  { id: 'stays',      label: 'Stays & Rentals',    icon: '/images/icons/stays-icon-dark.png',         color: '#2D3B45', notionKey: 'Stays & Rentals' },
  { id: 'wineries',   label: 'Wineries',           icon: '/images/icons/wine-rating-dark.png',        color: '#7B4F2E', notionKey: 'Breweries & Wineries' },
  { id: 'water',      label: 'Boat & Water',       icon: '/images/icons/boat-icon-dark.png',          color: '#3A6B85', notionKey: 'Boating & Water' },
  { id: 'events',     label: 'Events & Venues',    icon: '/images/icons/events-icon-dark.png',        color: '#8B6BA8', notionKey: 'Events & Venues' },
  { id: 'shopping',   label: 'Shopping',           icon: '/images/icons/shopping-icon-dark.png',      color: '#B07D62', notionKey: 'Shopping & Gifts' },
  { id: 'services',   label: 'Home Services',      icon: '/images/icons/home-services-icon-dark.png', color: '#5B6E5A', notionKey: 'Home Services' },
  { id: 'healthcare', label: 'Healthcare',         icon: '/images/icons/medical-icon-dark.png',       color: '#c05a5a' },
  { id: 'grocery',    label: 'Grocery & Pharmacy', icon: '/images/icons/grocery-icon-dark.png',       color: '#5B7E95' },
  { id: 'schools',    label: 'Schools',            icon: '/images/icons/school-icon-dark.png',        color: '#6B7EC8' },
  { id: 'community',  label: 'Community',          icon: '/images/icons/community-icon-dark.png',     color: '#7A8E72' },
  { id: 'gas',        label: 'Gas Stations',       icon: '/images/icons/gas-station-icon-dark.png',   color: '#B8860B' },
];

// Icon/color overrides for dynamic categories detected in Notion but not yet in DISCOVER_CATS.
// When admin creates an icon for a new category, add it here to wire it up.
// Key = exact Notion Category select value.
export const DISCOVER_DYNAMIC_CAT_ICONS = {
  'Activities':     { icon: '/images/icons/activities-icon-dark.png',  color: '#8B7355' },
  'Real Estate':    { icon: '/images/icons/realestate-icon-dark.png',  color: '#5B6E8A' },
  'Creative Media': { icon: '/images/icons/creative-icon-dark.png',    color: '#8B5E8B' },
  'Health & Beauty':{ icon: '/images/icons/beauty-icon-dark.png',      color: '#C07080' },
  'Pet Services':   { icon: '/images/icons/pets-icon-dark.png',        color: '#7A8E5A' },
};

export const DISCOVER_POIS = [
  // Healthcare
  { id: 'herrick', name: 'ProMedica Herrick Hospital', cat: 'healthcare', sub: 'Full Hospital · ER', address: '500 E Pottawatamie St, Tecumseh, MI', phone: '(517) 424-3000', note: '~15 min from Manitou Beach', lat: 42.0005, lng: -83.9340, website: 'https://www.promedica.org/herrick-hospital' },
  { id: 'allegiance', name: 'Henry Ford Allegiance Health', cat: 'healthcare', sub: 'Full Hospital · Level II Trauma', address: '205 N East Ave, Jackson, MI', phone: '(517) 788-4800', note: '~30 min · Major medical center', lat: 42.2490, lng: -84.3945, website: 'https://www.henryford.com/locations/allegiance' },
  { id: 'urgent-tec', name: 'Urgent Care – Tecumseh', cat: 'healthcare', sub: 'Urgent Care', address: '821 W Chicago Blvd, Tecumseh, MI', phone: '(517) 423-3200', note: '~15 min · Walk-in, no appointment needed', lat: 42.0040, lng: -83.9580 },
  { id: 'cvs-tec', name: 'CVS Pharmacy – Tecumseh', cat: 'healthcare', sub: 'Pharmacy · MinuteClinic', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0035, lng: -83.9548 },
  { id: 'walgreens-adr', name: 'Walgreens – Adrian', cat: 'healthcare', sub: 'Pharmacy', address: 'N Main St, Adrian, MI', note: '~20 min · Open late', lat: 41.9197, lng: -84.0382 },
  // Grocery
  { id: 'walmart-adr', name: 'Walmart Supercenter', cat: 'grocery', sub: 'Grocery · Pharmacy · Bait & Tackle', address: '1601 E US Hwy 223, Adrian, MI', note: '~20 min', lat: 41.9001, lng: -84.0174 },
  { id: 'meijer-tec', name: 'Meijer', cat: 'grocery', sub: 'Grocery · Gas Station', address: 'W Chicago Blvd, Tecumseh, MI', note: '~15 min', lat: 42.0030, lng: -83.9565 },
  // Boat & Water
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
  // Community
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
    ${poi.phone ? `<a href="tel:${poi.phone.replace(/\D/g, '')}" style="display:block;font-size:12px;font-weight:600;color:#7A8E72;margin-bottom:4px;text-decoration:none">${formatPhone(poi.phone)}</a>` : ''}
    ${poi.note ? `<div style="font-size:11px;color:#999;margin-bottom:8px;font-style:italic">${poi.note}</div>` : ''}
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="${dir}" target="_blank" style="font-size:12px;font-weight:700;color:#5B7E95;text-decoration:none">Get Directions →</a>
      ${poi.website ? `<a href="${poi.website}" target="_blank" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Website →</a>` : ''}
      ${poi.href ? `<a href="${poi.href}" style="font-size:12px;font-weight:700;color:#D4845A;text-decoration:none">Learn More →</a>` : ''}
    </div>
  </div>`;
}
