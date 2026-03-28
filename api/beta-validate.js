// /api/beta-validate.js
// POST { code } — checks a beta code against the Notion Beta Testers DB
// Returns { valid: true, name? } or { valid: false }

const NOTION_HEADERS = {
  Authorization: `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body || {};

  if (!code || !/^MB[A-Z0-9]{4}$/.test(code)) {
    return res.status(200).json({ valid: false });
  }

  try {
    const queryRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_BETA_TESTERS}/query`,
      {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          filter: {
            property: 'Access Code',
            rich_text: { equals: code },
          },
          page_size: 1,
        }),
      }
    );

    if (!queryRes.ok) return res.status(200).json({ valid: false });

    const data = await queryRes.json();

    if (data.results?.length > 0) {
      const firstName = data.results[0].properties?.Name?.title?.[0]?.plain_text?.split(' ')?.[0] || '';
      return res.status(200).json({ valid: true, name: firstName });
    }

    return res.status(200).json({ valid: false });
  } catch {
    // Fail safe — don't permanently block someone if Notion is down
    return res.status(200).json({ valid: false });
  }
}
