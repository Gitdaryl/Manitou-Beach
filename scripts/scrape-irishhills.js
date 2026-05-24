#!/usr/bin/env node
// Scrapes the Irish Hills Chamber of Commerce business directory
// and imports into the outreach DB.
//
// Usage:
//   OUTREACH_PIN=xxxx node scripts/scrape-irishhills.js
//   OUTREACH_PIN=xxxx node scripts/scrape-irishhills.js --dry   (preview only)
//
// API_URL defaults to https://manitoubeachmichigan.com
// Set API_URL=http://localhost:5173 for local testing.

import { decode } from 'node:querystring';

const API_URL = process.env.API_URL || 'https://manitoubeachmichigan.com';
const PIN     = process.env.OUTREACH_PIN;
const DRY_RUN = process.argv.includes('--dry');

if (!PIN && !DRY_RUN) {
  console.error('Error: set OUTREACH_PIN env var (your admin PIN)');
  process.exit(1);
}

const CATEGORIES = [
  { slug: 'restaurants-food-beverages-22',        cat: 'Food & Drink'    },
  { slug: 'lodging-travel-15',                    cat: 'Lodging'         },
  { slug: 'sports-recreation-24',                 cat: 'Recreation'      },
  { slug: 'arts-culture-entertainment-3',         cat: 'Recreation'      },
  { slug: 'shopping-specialty-retail-23',         cat: 'Shopping'        },
  { slug: 'home-garden-12',                       cat: 'Home Services'   },
  { slug: 'construction-equipment-contractors-7', cat: 'Home Services'   },
  { slug: 'personal-services-care-17',            cat: 'Health & Beauty' },
  { slug: 'health-care-11',                       cat: 'Health & Beauty' },
  { slug: 'automotive-marine-4',                  cat: 'Auto'            },
  { slug: 'real-estate-moving-storage-20',        cat: 'Services'        },
  { slug: 'finance-insurance-10',                 cat: 'Services'        },
  { slug: 'business-professional-services-5',     cat: 'Services'        },
  { slug: 'agriculture-fishing-forestry-2',       cat: 'Other'           },
];

function inferArea(address) {
  const a = (address || '').toLowerCase();
  if (a.includes('manitou beach') || a.includes('49253')) return 'Manitou Beach';
  if (a.includes('onsted'))                                return 'Manitou Beach';
  if (a.includes('brooklyn'))                              return 'Brooklyn';
  if (a.includes('cambridge'))                             return 'Cambridge Junction';
  if (a.includes('clark lake') || a.includes('clarklake') || a.includes('49234')) return 'Clark Lake';
  if (a.includes('jerome') || a.includes('addison') || a.includes('hayes') || a.includes('irish hills')) return 'Irish Hills';
  return 'Irish Hills Area';
}

function decodeAddr(raw) {
  return raw.replace(/%2C/gi, ',').replace(/%20/gi, ' ').replace(/\+/g, ' ').trim();
}

function parsePage(html, defaultCat) {
  // Names: <a href=".../list/member/...">TEXT</a> where TEXT is non-empty
  const names = [...html.matchAll(/href="https:\/\/business\.irishhills\.com\/list\/member\/[^"]+?"[^>]*>([^<]+)</g)]
    .map(m => m[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim())
    .filter(Boolean);

  // Phones: all <a href="tel:DIGITS"> — Chamber's number is NOT a tel: link, no skipping needed
  const phones = [...html.matchAll(/href="tel:(\d+)"/g)].map(m => m[1]);

  // Addresses: Google Maps q= param
  const addrs = [...html.matchAll(/href="https:\/\/www\.google\.com\/maps\?q=([^"]+)"/g)]
    .map(m => decodeAddr(m[1]));

  const businesses = [];
  for (let i = 0; i < names.length; i++) {
    const rawPhone = phones[i] || '';
    const phone = rawPhone.length === 10
      ? `(${rawPhone.slice(0,3)}) ${rawPhone.slice(3,6)}-${rawPhone.slice(6)}`
      : rawPhone;
    const address = addrs[i] || '';
    businesses.push({
      name: names[i],
      phone,
      address,
      category: defaultCat,
      area: inferArea(address),
    });
  }
  return businesses;
}

async function scrape() {
  const all = [];
  const seen = new Set();

  for (const { slug, cat } of CATEGORIES) {
    const url = `https://business.irishhills.com/list/ql/${slug}`;
    process.stdout.write(`  ${cat.padEnd(16)} `);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' } });
      if (!res.ok) { console.log(`HTTP ${res.status} — skipped`); continue; }
      const html = await res.text();
      const found = parsePage(html, cat);
      let added = 0;
      for (const biz of found) {
        const key = biz.name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        all.push(biz);
        added++;
      }
      console.log(`${String(added).padStart(3)} businesses`);
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nTotal unique: ${all.length}`);

  if (DRY_RUN) {
    console.log('\n--- Preview (first 30) ---');
    all.slice(0, 30).forEach((b, i) =>
      console.log(`${String(i+1).padStart(3)}. ${b.name.padEnd(42)} ${b.phone.padEnd(16)} [${b.category}] ${b.area}`)
    );
    console.log(`\nRun without --dry to import to ${API_URL}`);
    return;
  }

  // Import in batches of 50
  const BATCH = 50;
  let totalAdded = 0, totalSkipped = 0;
  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    process.stdout.write(`  Batch ${Math.floor(i/BATCH)+1}: importing ${chunk.length} ... `);
    const res = await fetch(`${API_URL}/api/outreach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-outreach-pin': PIN },
      body: JSON.stringify({ action: 'batch', businesses: chunk }),
    });
    const d = await res.json();
    if (res.ok) {
      console.log(`added ${d.added}, skipped ${d.skipped} duplicates`);
      totalAdded += d.added;
      totalSkipped += (d.skipped || 0);
    } else {
      console.log(`Error: ${d.error}`);
    }
  }

  console.log(`\nDone. Added ${totalAdded} new businesses, skipped ${totalSkipped} duplicates.`);
}

console.log(`\nIrish Hills Chamber scraper — ${DRY_RUN ? 'DRY RUN' : `importing to ${API_URL}`}\n`);
scrape().catch(err => { console.error(err); process.exit(1); });
