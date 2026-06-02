import { handleUpload } from '@vercel/blob/client';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminToken = req.headers['x-admin-token'];
  const isAdmin = adminToken && adminToken === process.env.ADMIN_SECRET;

  // Only admins can upload videos for now (self-service via Stripe comes later)
  if (!isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'],
        maximumSizeInBytes: 250 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('Event video uploaded:', blob.url);
      },
    });
    return res.json(jsonResponse);
  } catch (err) {
    console.error('upload-video error:', err.message);
    return res.status(400).json({ error: err.message });
  }
}
