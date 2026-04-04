import Stripe from 'stripe';

// Creates a $15/year Stripe subscription checkout for LLLC membership.
// Member form data is stored in session metadata so lllc-member-success.js
// can retrieve it after payment and create the Notion record + send emails.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, birthdate, address } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const SITE_URL = process.env.SITE_URL || 'https://manitoubeachmichigan.com';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Land & Lake Ladies Club - Annual Membership',
              description: 'Membership renews automatically each year. Cancel anytime.',
            },
            unit_amount: 1500, // $15.00
            recurring: { interval: 'year' },
          },
          quantity: 1,
        },
      ],
      metadata: {
        name,
        email,
        phone: phone || '',
        birthdate: birthdate || '',
        address: address || '',
        org: 'LLLC',
        type: 'Member',
      },
      subscription_data: {
        metadata: {
          org: 'LLLC',
          memberName: name,
          email,
        },
      },
      success_url: `${SITE_URL}/ladies-club/join?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/ladies-club/join`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('LLLC member checkout error:', err);
    return res.status(500).json({ error: 'Could not create checkout session. Please try again.' });
  }
}
