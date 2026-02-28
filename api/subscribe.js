export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: 'website',
          utm_medium: 'organic',
        }),
      }
    );

    // beehiiv returns 201 for new, 200 for already subscribed
    if (!response.ok) {
      const err = await response.text();
      console.error('beehiiv subscribe error:', err);
      return res.status(500).json({ error: 'Subscription failed' });
    }

    const data = await response.json();
    const status = data.data?.status || 'pending';

    return res.status(200).json({
      success: true,
      // 'validating' = double opt-in pending, 'active' = already confirmed
      status,
      alreadySubscribed: status === 'active',
    });
  } catch (err) {
    console.error('subscribe error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
