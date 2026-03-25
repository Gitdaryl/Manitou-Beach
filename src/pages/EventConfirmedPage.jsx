import { Navbar, Footer } from '../components/Layout';

const C = {
  night: '#1A2830',
  cream: '#FAF6EF',
  sage: '#7A8E72',
  text: '#3D3530',
  textMuted: '#8C806E',
  sunsetLight: 'rgba(255,220,180,0.85)',
};

function getParams() {
  try { return Object.fromEntries(new URLSearchParams(window.location.search)); }
  catch { return {}; }
}

const TIPS = {
  platform_ticketing: [
    { title: 'Tickets go live on the What\'s Happening page', body: 'Attendees can buy directly from the event card. Funds land in your Stripe account within 2 business days of the event.' },
    { title: 'You can update event details anytime', body: 'Check your texts — we sent you a private edit link. Use it to update the time, location, or description at any time.' },
    { title: 'Want more visibility?', body: 'Add a hero banner, newsletter spotlight, or promo pin to get your event in front of every lake neighbor before it sells out.' },
  ],
  vendor_market: [
    { title: 'Vendors register and pay directly to you', body: 'Share your vendor portal link with potential vendors. They register, pay their booth fee, and you receive the money minus the 1.25% platform fee.' },
    { title: 'You\'ll receive the vendor portal link by text', body: 'Your organizer portal shows all registered vendors, their details, and lets you blast last-minute updates.' },
    { title: 'Update your event details anytime', body: 'We sent a private edit link to your phone. Use it to adjust the date, location, or description.' },
  ],
  default: [
    { title: 'Your event is showing right now', body: 'It\'s live on the What\'s Happening page and visible to everyone browsing the site.' },
    { title: 'You can update it anytime', body: 'Check your texts — we sent you a private edit link. Change the time, location, description, or photo whenever you need to.' },
    { title: 'Want more visibility?', body: 'A newsletter shoutout or hero banner gets your event in front of every lake neighbor. Visit the promote page to see options.' },
  ],
};

export default function EventConfirmedPage() {
  const params = getParams();
  const type = params.type || 'default';
  const vendorToken = params.vendorToken;
  const eventPageId = params.event;

  const tips = TIPS[type] || TIPS.default;
  const isVendor = type === 'vendor_market';
  const isTicketing = type === 'platform_ticketing';

  const vendorPortalUrl = vendorToken && eventPageId
    ? `/vendor-portal?token=${vendorToken}&event=${eventPageId}`
    : null;

  return (
    <div style={{ minHeight: '100vh', background: C.night, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>

          {/* Checkmark */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `${C.sage}25`, border: `2px solid ${C.sage}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', fontSize: 30, color: C.sage,
          }}>
            ✓
          </div>

          <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 28, color: C.cream, fontWeight: 400, margin: '0 0 12px' }}>
            {isVendor ? 'Your event is live with vendor registration.' : isTicketing ? 'Your event is live with ticketing.' : 'Your event is live on Manitou Beach.'}
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.sunsetLight, fontStyle: 'italic', margin: '0 0 36px', lineHeight: 1.6 }}>
            {isVendor
              ? 'Vendors can register and pay directly. Check your texts for your organizer portal link.'
              : isTicketing
                ? 'Attendees can buy tickets right now. Check your texts for your edit link.'
                : 'It\'s showing on What\'s Happening right now. People can find it.'}
          </p>

          {/* Tips */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px 28px', textAlign: 'left', marginBottom: 32 }}>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
              A few things worth knowing
            </p>
            {tips.map(({ title, body }, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < tips.length - 1 ? 18 : 0 }}>
                <div style={{
                  flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                  background: `${C.sage}20`, border: `1px solid ${C.sage}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, color: C.sage, marginTop: 2,
                }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: '0 0 4px' }}>{title}</p>
                  <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/happening"
              style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, padding: '13px 24px', borderRadius: 8, background: C.sage, color: '#fff', textDecoration: 'none', display: 'inline-block' }}
            >
              See What's Happening →
            </a>

            {vendorPortalUrl && (
              <a
                href={vendorPortalUrl}
                style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, padding: '13px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'inline-block', background: 'transparent' }}
              >
                Open Vendor Portal →
              </a>
            )}

            {!vendorPortalUrl && (
              <a
                href="/promote"
                style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600, padding: '13px 24px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'inline-block', background: 'transparent' }}
              >
                Boost Visibility →
              </a>
            )}
          </div>

        </div>
      </main>

      <Footer scrollTo={() => {}} />
    </div>
  );
}
