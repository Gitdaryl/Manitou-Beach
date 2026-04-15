export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${process.env.NOTION_DB_PRIZE_WHEEL_SPONSORS}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN_BUSINESS}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          filter: { property: 'Active', checkbox: { equals: true } },
          sorts: [{ property: 'Created', direction: 'ascending' }],
        }),
      }
    );

    if (!notionRes.ok) throw new Error(`Notion error: ${await notionRes.text()}`);
    const data = await notionRes.json();

    const prize = [];
    for (const page of data.results || []) {
      const p = page.properties;
      const name = p['Business Name']?.title?.[0]?.text?.content || '';
      const dealLabel = p['Deal Label']?.rich_text?.[0]?.text?.content || '';
      const rawColor = p['Deal Color']?.rich_text?.[0]?.text?.content || '';
      const color = /^#[0-9A-Fa-f]{6}$/.test(rawColor) ? rawColor : '#3498db';
      const slotCount = Math.min(Math.max(p['Slot Count']?.number || 1, 1), 3);
      if (!name || !dealLabel) continue;
      for (let i = 0; i < slotCount; i++) {
        prize.push({ label: dealLabel, sponsor: name, color, type: 'prize', sponsorId: page.id });
      }
    }

    // Build padded wheel (min 8 segments)
    // Strategy: interleave spin-again between prize segments, one tomorrow at the end
    const SPIN_COLORS = ['#4ecdc4', '#f39c12', '#2ecc71'];
    const TOMORROW_COLOR = '#2c3e50';
    const segments = [...prize];

    let spinColorIdx = 0;
    while (segments.length < 8) {
      const needed = 8 - segments.length;
      if (needed === 1) {
        segments.push({ label: 'Try Again Tomorrow', sponsor: '', color: TOMORROW_COLOR, type: 'tomorrow', sponsorId: null });
      } else {
        // Insert a spin-again, keep tomorrow for last slot
        segments.push({
          label: 'Spin Again!',
          sponsor: '',
          color: SPIN_COLORS[spinColorIdx % SPIN_COLORS.length],
          type: 'spin-again',
          sponsorId: null,
        });
        spinColorIdx++;
      }
    }

    return res.status(200).json(segments);
  } catch (err) {
    console.error('Prize wheel sponsors error:', err.message);
    return res.status(500).json({ error: 'Failed to load wheel' });
  }
}
