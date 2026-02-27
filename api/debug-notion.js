// Temporary diagnostic endpoint — remove after Notion is confirmed working
// Visit: https://manitou-beach.vercel.app/api/debug-notion
export default async function handler(req, res) {
  const results = {};

  const query = async (filter, label) => {
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
          body: JSON.stringify({ page_size: 10, ...(filter ? { filter } : {}) }),
        }
      );
      const body = await r.json();
      return {
        httpStatus: r.status,
        notionError: body.message || null,
        rowCount: body.results?.length ?? null,
        // Show the actual Status value + date for each row
        rows: body.results?.map(p => ({
          name: p.properties['Event Name']?.title?.[0]?.text?.content || '(no name)',
          statusRaw: p.properties['Status'] || null,
          eventDate: p.properties['Event date']?.date || p.properties['Event date'] || null,
        })) || [],
      };
    } catch (err) {
      return { error: err.message };
    }
  };

  // Test 1: No filter — shows all rows and their raw Status structure
  results.noFilter = await query(null, 'noFilter');

  // Test 2: Status filter using "status" type (newer Notion Status property)
  results.filterStatusType = await query({
    or: [
      { property: 'Status', status: { equals: 'Approved' } },
      { property: 'Status', status: { equals: 'Published' } },
    ],
  }, 'filterStatusType');

  // Test 3: Status filter using "select" type (older Notion Select property)
  results.filterSelectType = await query({
    or: [
      { property: 'Status', select: { equals: 'Approved' } },
      { property: 'Status', select: { equals: 'Published' } },
    ],
  }, 'filterSelectType');

  return res.status(200).json(results);
}
