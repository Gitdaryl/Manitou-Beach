// Temporary diagnostic endpoint — remove after Notion is confirmed working
// Visit: https://your-site.vercel.app/api/debug-notion
export default async function handler(req, res) {
  const results = {};

  // 1. Check env vars exist (don't expose values, just presence)
  results.env = {
    NOTION_TOKEN_EVENTS: !!process.env.NOTION_TOKEN_EVENTS,
    NOTION_DB_EVENTS: !!process.env.NOTION_DB_EVENTS,
    NOTION_TOKEN_HERO: !!process.env.NOTION_TOKEN_HERO,
    NOTION_DB_HERO: !!process.env.NOTION_DB_HERO,
    // Show first 8 chars to verify correct var is being read
    TOKEN_EVENTS_PREFIX: process.env.NOTION_TOKEN_EVENTS?.slice(0, 8) || 'MISSING',
    DB_EVENTS_PREFIX: process.env.NOTION_DB_EVENTS?.slice(0, 8) || 'MISSING',
  };

  // 2. Try hitting the Events database
  try {
    const r = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_EVENTS}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_EVENTS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ page_size: 1 }),
      }
    );
    const body = await r.json();
    results.eventsDb = {
      httpStatus: r.status,
      notionCode: body.code || null,
      notionMessage: body.message || null,
      rowCount: body.results?.length ?? null,
      // Show first result's property keys so we can check column names
      firstRowProperties: body.results?.[0]
        ? Object.keys(body.results[0].properties)
        : null,
    };
  } catch (err) {
    results.eventsDb = { error: err.message };
  }

  // 3. Try hitting the Hero database
  try {
    const r = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_HERO}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NOTION_TOKEN_HERO}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({ page_size: 1 }),
      }
    );
    const body = await r.json();
    results.heroDb = {
      httpStatus: r.status,
      notionCode: body.code || null,
      notionMessage: body.message || null,
      rowCount: body.results?.length ?? null,
      firstRowProperties: body.results?.[0]
        ? Object.keys(body.results[0].properties)
        : null,
    };
  } catch (err) {
    results.heroDb = { error: err.message };
  }

  return res.status(200).json(results);
}
