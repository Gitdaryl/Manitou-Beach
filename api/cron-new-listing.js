// GET /api/cron-new-listing
// Runs daily at 10am ET — welcomes new Active business + stay listings to social media
// and sends the owner a tips email to help them get more out of their listing.
// Supports ?preview=1 to return planned posts without posting or emailing.

import { Resend } from 'resend';

const FB_API = 'https://graph.facebook.com/v25.0';
const NOTION_VERSION = '2022-06-28';

const BUSINESS_HEADERS = {
  'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': NOTION_VERSION,
};

// Category → fallback image when no photo/logo uploaded
const CATEGORY_IMAGES = {
  'Winery':      'corks-kegs-hero.jpg',
  'Bar':         'corks-kegs-hero.jpg',
  'Nightlife':   'corks-kegs-hero.jpg',
  'Restaurant':  'foodtruck_hero.jpg',
  'Food':        'foodtruck_hero.jpg',
  'Cafe':        'foodtruck_hero.jpg',
  'Marina':      'DL-boat.jpg',
  'Boat Rental': 'DL-boat.jpg',
  'Lodging':     'landlakes-hero.jpg',
  'Cottage':     'landlakes-hero.jpg',
  'Recreation':  'explore-Irish-hills.jpg',
  'Outdoors':    'explore-Irish-hills.jpg',
  'Fitness':     'explore-Irish-hills.jpg',
  'Events':      'happening-hero.jpg',
  'Entertainment': 'happening-hero.jpg',
};
const DEFAULT_IMAGE = 'community-bg.jpg';

function categoryImage(category, siteUrl) {
  const img = CATEGORY_IMAGES[category] || DEFAULT_IMAGE;
  return `${siteUrl}/images/${img}`;
}

function stayImage(amenities, photo, siteUrl) {
  if (photo) return photo;
  return amenities.includes('Waterfront') || amenities.includes('Dock')
    ? `${siteUrl}/images/DL-boat.jpg`
    : `${siteUrl}/images/landlakes-hero.jpg`;
}

function buildBusinessPost(biz, siteUrl) {
  const desc = biz.tagline || biz.description?.slice(0, 120) || '';
  const lines = [
    `New on Manitou Beach: ${biz.name} is now listed in the local directory.`,
    '',
  ];
  if (desc) lines.push(desc, '');
  lines.push(`Find them, get directions, and check hours at ${siteUrl}/featured`);
  lines.push('');
  lines.push('#ManitouBeachMI #ShopLocal #DevilsLakeMI #IrishHills #MichiganBusiness');
  return lines.join('\n');
}

function buildStayPost(stay, siteUrl) {
  const sleeps = stay.guests ? `Sleeps ${stay.guests}.` : '';
  const beds = stay.beds ? `${stay.beds} bed${stay.beds !== 1 ? 's' : ''}.` : '';
  const highlights = stay.amenities.slice(0, 3).join(', ');
  const bookLink = stay.bookingUrl || `${siteUrl}/stays`;

  const lines = [
    `New on Manitou Beach: ${stay.name}`,
    '',
    [beds, sleeps, highlights].filter(Boolean).join(' '),
    '',
    `Book your summer weekend: ${bookLink}`,
    '',
    '#ManitouBeachMI #DevilsLake #MichiganCabin #LakeHouse #IrishHills #MichiganRentals',
  ];
  return lines.join('\n');
}

async function postToFacebook(message, pageId, pageToken) {
  const res = await fetch(`${FB_API}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, access_token: pageToken }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.id;
}

async function postToInstagram(caption, imageUrl, igAccountId, pageToken) {
  // Step 1: create container
  const containerRes = await fetch(`${FB_API}/${igAccountId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: pageToken }),
  });
  const container = await containerRes.json();
  if (container.error) throw new Error(container.error.message);

  // Step 2: poll until ready (max 10 attempts, 6s apart)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 6000));
    const statusRes = await fetch(`${FB_API}/${container.id}?fields=status_code&access_token=${pageToken}`);
    const status = await statusRes.json();
    if (status.status_code === 'FINISHED') break;
    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new Error(`IG container ${status.status_code}`);
    }
  }

  // Step 3: publish
  const publishRes = await fetch(`${FB_API}/${igAccountId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: container.id, access_token: pageToken }),
  });
  const published = await publishRes.json();
  if (published.error) throw new Error(published.error.message);
  return published.id;
}

async function markPosted(pageId) {
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: BUSINESS_HEADERS,
    body: JSON.stringify({ properties: { 'Social Welcome Posted': { checkbox: true } } }),
  });
}

function businessTipsEmail(biz, siteUrl) {
  const missing = [];
  if (!biz.logo && !biz.heroPhoto) missing.push('a photo or logo');
  if (!biz.description) missing.push('a description');
  if (!biz.socialInstagram && !biz.socialFacebook) missing.push('your social media links');

  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#3B3228;line-height:1.6;">
      <div style="background:#5B7E95;padding:32px;text-align:center;">
        <h1 style="color:#FAF6EF;font-size:24px;margin:0;">Welcome to Manitou Beach, ${biz.name}!</h1>
      </div>
      <div style="padding:32px;">
        <p>Your listing is live on <a href="${siteUrl}/featured" style="color:#5B7E95;">manitoubeachmichigan.com</a>. We just posted a welcome to our Facebook and Instagram to introduce you to the community.</p>
        <p>Here are a few things you can do right now to get more out of your listing:</p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <tr>
            <td style="padding:12px;border-bottom:1px solid #E8DFD0;vertical-align:top;">
              <strong style="color:#D4845A;">Add a photo or logo</strong><br>
              Listings with images get significantly more clicks. Even a phone photo is better than nothing.
            </td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #E8DFD0;vertical-align:top;">
              <strong style="color:#D4845A;">Write a great description</strong><br>
              Tell visitors what makes you special. What should they order? What should they know before they come?
            </td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #E8DFD0;vertical-align:top;">
              <strong style="color:#D4845A;">Add your Instagram and Facebook</strong><br>
              We link directly to your profiles so visitors can follow you and stay updated.
            </td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #E8DFD0;vertical-align:top;">
              <strong style="color:#D4845A;">List your hours</strong><br>
              The number one question visitors have before they drive out. Make it easy.
            </td>
          </tr>
          <tr>
            <td style="padding:12px;vertical-align:top;">
              <strong style="color:#D4845A;">Share your listing</strong><br>
              Post it on your own Facebook page. Your regulars will tag their friends. Free reach.
            </td>
          </tr>
        </table>

        <div style="background:#FAF6EF;border-left:4px solid #7A8E72;padding:16px;margin:24px 0;">
          <strong>Have an upcoming event?</strong> You can list it for free too - just go to <a href="${siteUrl}/events" style="color:#5B7E95;">${siteUrl}/events</a> and we'll add it to the calendar.
        </div>

        <p style="color:#6B5D52;font-size:14px;">Questions? Just reply to this email. We're real people and we're happy to help.</p>
        <p>Welcome to the community.<br><strong>Manitou Beach Michigan</strong></p>
      </div>
    </div>
  `;
}

function stayTipsEmail(stay, siteUrl) {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#3B3228;line-height:1.6;">
      <div style="background:#5B7E95;padding:32px;text-align:center;">
        <h1 style="color:#FAF6EF;font-size:24px;margin:0;">Welcome to Manitou Beach, ${stay.name}!</h1>
      </div>
      <div style="padding:32px;">
        <p>Your stay is live on <a href="${siteUrl}/stays" style="color:#5B7E95;">manitoubeachmichigan.com</a>. We posted a welcome to our Facebook and Instagram to start getting eyes on your place.</p>
        <p>A few things that make a big difference:</p>

        <table style="width:100%;border-collapse:collapse;margin:24px 0;">
          <tr>
            <td style="padding:12px;border-bottom:1px solid #E8DFD0;vertical-align:top;">
              <strong style="color:#D4845A;">Add multiple photos</strong><br>
              Listings with 3 or more photos get far more interest. Show the dock, the view, the cozy living room - all of it.
            </td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #E8DFD0;vertical-align:top;">
              <strong style="color:#D4845A;">Check your amenities</strong><br>
              Waterfront, dock, AC, WiFi, grill - make sure everything is marked. People filter by these.
            </td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #E8DFD0;vertical-align:top;">
              <strong style="color:#D4845A;">Update your booking link</strong><br>
              Link directly to your Airbnb, VRBO, or a contact form. The easier it is to book, the more bookings you get.
            </td>
          </tr>
          <tr>
            <td style="padding:12px;vertical-align:top;">
              <strong style="color:#D4845A;">Write something memorable</strong><br>
              "Sleeps 6 on Devils Lake with a private dock and a screened porch" beats "Nice house, good location" every time.
            </td>
          </tr>
        </table>

        <div style="background:#FAF6EF;border-left:4px solid #7A8E72;padding:16px;margin:24px 0;">
          <strong>Hosting an event?</strong> Open houses, wine nights, bonfire weekends - you can list events for free at <a href="${siteUrl}/events" style="color:#5B7E95;">${siteUrl}/events</a>.
        </div>

        <p style="color:#6B5D52;font-size:14px;">Questions? Just reply. We're happy to help you get more bookings this summer.</p>
        <p>Welcome to the community.<br><strong>Manitou Beach Michigan</strong></p>
      </div>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const preview = req.query?.preview === '1' || req.query?.preview === 'true';
  const siteUrl = process.env.SITE_URL || 'https://manitoubeachmichigan.com';
  const pageId = process.env.META_PAGE_ID || process.env.FB_PAGE_ID;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
  const igAccountId = process.env.META_IG_ACCOUNT_ID || process.env.IG_BUSINESS_ACCOUNT_ID;

  if (!preview && (!pageId || !pageToken)) {
    return res.status(500).json({ error: 'META credentials not configured' });
  }

  // ── Fetch new businesses ──
  let newBusinesses = [];
  try {
    const bizRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BUSINESS}/query`,
      {
        method: 'POST',
        headers: BUSINESS_HEADERS,
        body: JSON.stringify({
          filter: {
            and: [
              {
                or: [
                  { property: 'Status', status: { equals: 'Listed Free' } },
                  { property: 'Status', status: { equals: 'Listed Enhanced' } },
                  { property: 'Status', status: { equals: 'Listed Premium' } },
                  { property: 'Status', status: { equals: 'Active' } },
                ],
              },
              { property: 'Social Welcome Posted', checkbox: { equals: false } },
            ],
          },
          sorts: [{ property: 'Name', direction: 'ascending' }],
          page_size: 1,
        }),
      }
    );
    if (!bizRes.ok) throw new Error(`Notion businesses ${bizRes.status}`);
    const bizData = await bizRes.json();
    newBusinesses = (bizData.results || []).map(page => {
      const p = page.properties;
      return {
        _pageId: page.id,
        name: p['Name']?.title?.[0]?.text?.content || '',
        category: p['Category']?.select?.name || 'Other',
        email: p['Email']?.email || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        tagline: p['Tagline']?.rich_text?.[0]?.text?.content || '',
        logo: p['Logo URL']?.url || null,
        heroPhoto: p['Hero Photo URL']?.url || null,
        socialInstagram: p['Instagram URL']?.url || null,
        socialFacebook: p['Facebook URL']?.url || null,
      };
    }).filter(b => b.name);
  } catch (err) {
    console.error('cron-new-listing: businesses fetch error:', err.message);
  }

  // ── Fetch new stays ──
  let newStays = [];
  try {
    const stayRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_STAYS}/query`,
      {
        method: 'POST',
        headers: BUSINESS_HEADERS,
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Status', status: { equals: 'Active' } },
              { property: 'Social Welcome Posted', checkbox: { equals: false } },
            ],
          },
          sorts: [{ property: 'Name', direction: 'ascending' }],
          page_size: 1,
        }),
      }
    );
    if (!stayRes.ok) throw new Error(`Notion stays ${stayRes.status}`);
    const stayData = await stayRes.json();
    newStays = (stayData.results || []).map(page => {
      const p = page.properties;
      return {
        _pageId: page.id,
        name: p['Name']?.title?.[0]?.text?.content || '',
        email: p['Email']?.email || '',
        description: p['Description']?.rich_text?.[0]?.text?.content || '',
        beds: p['Beds']?.number ?? null,
        guests: p['Guests']?.number ?? null,
        amenities: (p['Amenities']?.multi_select || []).map(s => s.name),
        bookingUrl: p['Booking URL']?.url || '',
        photo: p['Photo URL']?.url || null,
      };
    }).filter(s => s.name);
  } catch (err) {
    console.error('cron-new-listing: stays fetch error:', err.message);
  }

  if (!newBusinesses.length && !newStays.length) {
    return res.status(200).json({ skipped: true, reason: 'No new listings today' });
  }

  // Preview — return planned posts without acting
  if (preview) {
    return res.status(200).json({
      businesses: newBusinesses.map(b => ({
        name: b.name,
        post: buildBusinessPost(b, siteUrl),
        image: b.heroPhoto || b.logo || categoryImage(b.category, siteUrl),
        emailTo: b.email,
      })),
      stays: newStays.map(s => ({
        name: s.name,
        post: buildStayPost(s, siteUrl),
        image: stayImage(s.amenities, s.photo, siteUrl),
        emailTo: s.email,
      })),
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const results = { businesses: [], stays: [] };

  // ── Process each new business ──
  for (const biz of newBusinesses) {
    const result = { name: biz.name, fb: null, ig: null, email: null, errors: {} };
    const message = buildBusinessPost(biz, siteUrl);
    const imageUrl = biz.heroPhoto || biz.logo || categoryImage(biz.category, siteUrl);

    try {
      result.fb = await postToFacebook(message, pageId, pageToken);
    } catch (err) {
      result.errors.fb = err.message;
      console.error(`cron-new-listing: FB error for ${biz.name}:`, err.message);
    }

    if (igAccountId) {
      try {
        result.ig = await postToInstagram(message, imageUrl, igAccountId, pageToken);
      } catch (err) {
        result.errors.ig = err.message;
        console.error(`cron-new-listing: IG error for ${biz.name}:`, err.message);
      }
    }

    if (biz.email) {
      try {
        await resend.emails.send({
          from: 'Manitou Beach <hello@manitoubeachmichigan.com>',
          to: biz.email,
          subject: `Welcome to Manitou Beach, ${biz.name} - a few tips to get more visitors`,
          html: businessTipsEmail(biz, siteUrl),
        });
        result.email = 'sent';
      } catch (err) {
        result.errors.email = err.message;
        console.error(`cron-new-listing: email error for ${biz.name}:`, err.message);
      }
    }

    await markPosted(biz._pageId);
    results.businesses.push(result);
    console.log(`cron-new-listing: business welcomed — ${biz.name} | FB:${result.fb || 'err'} IG:${result.ig || result.errors.ig || 'skip'}`);
  }

  // ── Process each new stay ──
  for (const stay of newStays) {
    const result = { name: stay.name, fb: null, ig: null, email: null, errors: {} };
    const message = buildStayPost(stay, siteUrl);
    const imageUrl = stayImage(stay.amenities, stay.photo, siteUrl);

    try {
      result.fb = await postToFacebook(message, pageId, pageToken);
    } catch (err) {
      result.errors.fb = err.message;
      console.error(`cron-new-listing: FB error for stay ${stay.name}:`, err.message);
    }

    if (igAccountId) {
      try {
        result.ig = await postToInstagram(message, imageUrl, igAccountId, pageToken);
      } catch (err) {
        result.errors.ig = err.message;
        console.error(`cron-new-listing: IG error for stay ${stay.name}:`, err.message);
      }
    }

    if (stay.email) {
      try {
        await resend.emails.send({
          from: 'Manitou Beach <hello@manitoubeachmichigan.com>',
          to: stay.email,
          subject: `Welcome to Manitou Beach, ${stay.name} - tips to get more bookings`,
          html: stayTipsEmail(stay, siteUrl),
        });
        result.email = 'sent';
      } catch (err) {
        result.errors.email = err.message;
        console.error(`cron-new-listing: email error for stay ${stay.name}:`, err.message);
      }
    }

    await markPosted(stay._pageId);
    results.stays.push(result);
    console.log(`cron-new-listing: stay welcomed — ${stay.name} | FB:${result.fb || 'err'} IG:${result.ig || result.errors.ig || 'skip'}`);
  }

  return res.status(200).json({ success: true, results });
}
