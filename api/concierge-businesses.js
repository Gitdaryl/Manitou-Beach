// Notion Business Directory proxy for ElevenLabs voice concierge
// Returns businesses with category filtering, search, and voice-ready summaries

const DB_ID = process.env.NOTION_DB_BUSINESS;
const TOKEN = process.env.NOTION_TOKEN_BUSINESS;

async function queryAllNotionPages(dbId, token, body) {
  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  };
  let results = [];
  let startCursor;
  do {
    const pageBody = startCursor ? { ...body, start_cursor: startCursor } : body;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(pageBody) });
    if (!res.ok) throw new Error(`Notion query failed: ${await res.text()}`);
    const data = await res.json();
    results = results.concat(data.results);
    startCursor = data.has_more ? data.next_cursor : null;
  } while (startCursor);
  return results;
}

function txt(prop) {
  if (!prop) return '';
  if (prop.title) return prop.title.map(t => t.plain_text).join('');
  if (prop.rich_text) return prop.rich_text.map(t => t.plain_text).join('');
  return '';
}

function normalizeUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
}

function tierFromStatus(status) {
  if (!status) return 'free';
  const s = status.toLowerCase();
  if (s.includes('premium')) return 'premium';
  if (s.includes('featured')) return 'featured';
  if (s.includes('enhanced')) return 'enhanced';
  if (s.includes('comp')) return 'enhanced';
  return 'free';
}

function mapBusiness(page) {
  const p = page.properties;
  const name = txt(p['Name']);
  const description = txt(p['Description']);
  const address = txt(p['Address']);
  const phone = p['Phone']?.phone_number || null;
  const email = p['Email']?.email || null;
  const website = normalizeUrl(p['URL']?.url || null);
  const logo = p['Logo URL']?.url || null;
  const status = p['Status']?.status?.name || '';
  const tier = tierFromStatus(status);

  // Categories - try multi_select first, fall back to select
  let categories = [];
  if (p['Categories']?.multi_select?.length) {
    categories = p['Categories'].multi_select.map(c => c.name);
  } else if (p['Category']?.select?.name) {
    categories = [p['Category'].select.name];
  }

  const emergency = p['Emergency']?.checkbox || false;

  return {
    name,
    description: description || null,
    address: address || null,
    phone,
    email,
    website,
    logo,
    categories,
    tier,
    emergency,
  };
}

function buildVoiceSummary(businesses, query, category) {
  if (businesses.length === 0) {
    if (query) {
      return `I didn't find any businesses matching "${query}." Try clicking Home in the menu bar and then Local Businesses to browse by category.`;
    }
    if (category) {
      return `I don't see any ${category} businesses listed right now. Click Home in the menu bar, then Local Businesses to check all categories.`;
    }
    return "I'm not finding any businesses to show right now. Click Home in the menu bar and then Local Businesses to browse the full directory.";
  }

  const parts = [];

  if (query) {
    parts.push(`I found ${businesses.length} business${businesses.length === 1 ? '' : 'es'} matching "${query}."`);
  } else if (category) {
    parts.push(`There ${businesses.length === 1 ? 'is' : 'are'} ${businesses.length} ${category} business${businesses.length === 1 ? '' : 'es'} listed.`);
  } else {
    parts.push(`There are ${businesses.length} businesses in the directory.`);
  }

  // Show top 3
  businesses.slice(0, 3).forEach(b => {
    let line = b.name;
    if (b.description) {
      // Truncate description to first sentence for voice
      const firstSentence = b.description.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.length < 100) line += ` - ${firstSentence}`;
    }
    if (b.phone) line += `. Phone: ${b.phone}`;
    parts.push(line + '.');
  });

  if (businesses.length > 3) {
    parts.push(`Plus ${businesses.length - 3} more. Click Home in the menu and then Local Businesses to see them all.`);
  }

  return parts.join(' ');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const pages = await queryAllNotionPages(DB_ID, TOKEN, {
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Listed Free' } },
          { property: 'Status', status: { equals: 'Listed Enhanced' } },
          { property: 'Status', status: { equals: 'Listed Featured' } },
          { property: 'Status', status: { equals: 'Listed Premium' } },
          { property: 'Status', status: { equals: 'Listed Comp' } },
        ],
      },
    });

    let businesses = pages.map(mapBusiness);

    // Sort: premium > featured > enhanced > free
    const tierOrder = { premium: 0, featured: 1, enhanced: 2, free: 3 };
    businesses.sort((a, b) => (tierOrder[a.tier] ?? 4) - (tierOrder[b.tier] ?? 4));

    // Optional filters from query params
    const q = (req.query.q || '').toLowerCase().trim();
    const cat = (req.query.category || '').toLowerCase().trim();

    let filtered = businesses;

    if (cat) {
      filtered = filtered.filter(b =>
        b.categories.some(c => c.toLowerCase().includes(cat))
      );
    }

    if (q) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q)) ||
        b.categories.some(c => c.toLowerCase().includes(q))
      );
    }

    const summary = buildVoiceSummary(filtered, q, cat);

    // Return categories list for the concierge to reference
    const allCategories = [...new Set(businesses.flatMap(b => b.categories))].sort();

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    return res.status(200).json({
      businesses: filtered.slice(0, 15),
      total: filtered.length,
      categories: allCategories,
      summary,
      source: 'notion',
    });
  } catch (err) {
    console.error('Concierge businesses error:', err.message);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json({
      businesses: [],
      total: 0,
      categories: [],
      summary: "I'm having trouble pulling up the business directory right now. Click Home in the menu bar and then Local Businesses to browse.",
      source: 'error',
    });
  }
}
