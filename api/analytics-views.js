import { list } from '@vercel/blob';

const BLOB_PREFIX = 'analytics/views';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX, token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!blobs.length) return res.status(200).json({ bizViews: {}, pageViews: {}, monthly: {}, updatedAt: null });

    const dataRes = await fetch(blobs[0].url);
    const data = dataRes.ok ? await dataRes.json() : {};

    // Sort bizViews by total descending and return as array
    const sorted = Object.entries(data.bizViews || {})
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.total - a.total);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

    const sortedWithMonthly = sorted.map(item => ({
      ...item,
      thisMonth: (data.monthly?.[item.key]?.[currentMonth]) || 0,
      lastMonth: (data.monthly?.[item.key]?.[prevMonth]) || 0,
    }));

    res.status(200).json({
      bizViews: sortedWithMonthly,
      pageViews: data.pageViews || {},
      updatedAt: data.updatedAt || null,
    });
  } catch (err) {
    console.error('analytics-views error:', err);
    res.status(500).json({ error: 'Failed to read analytics' });
  }
}
