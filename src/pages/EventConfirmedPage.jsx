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
    { title: 'People can buy tickets right now', body: 'Your event is live on What\'s Happening - anyone browsing can grab tickets. Money goes straight to your bank.' },
    { title: 'Need to change something?', body: 'We texted you an edit link. Tap it anytime to update the details - no hoops.' },
    { title: 'Want the whole lake to know?', body: 'Homepage hero, newsletter shoutout, featured banners - there are some fun ways to pack the house.' },
  ],
  vendor_market: [
    { title: 'Vendors can sign up and pay now', body: 'Share your vendor portal link and they handle everything themselves. Money lands in your account minus a tiny 1.25% fee.' },
    { title: 'Check your texts for your portal link', body: 'That\'s your command center - see who\'s registered, send updates, all that good stuff.' },
    { title: 'Need to tweak the details?', body: 'We sent you an edit link by text too. Change the date, location, whatever - anytime.' },
  ],
  default: [
    { title: 'It\'s live - people can see it right now', body: 'Head over to What\'s Happening and you\'ll see your event on the calendar.' },
    { title: 'Want to change something later?', body: 'We texted you an edit link. Tap it whenever you need to update anything.' },
    { title: 'Want the whole lake to know?', body: 'A newsletter shoutout or homepage feature gets your event in front of everyone around the lake.' },
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
            {isVendor ? 'You\'re all set - vendors can start signing up!' : isTicketing ? 'Tickets are live - let\'s sell some!' : 'Your event is on the calendar!'}
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.sunsetLight, fontStyle: 'italic', margin: '0 0 36px', lineHeight: 1.6 }}>
            {isVendor
              ? 'Check your texts - we sent you a link to your organizer portal.'
              : isTicketing
                ? 'People can buy tickets right now. We texted you an edit link too.'
                : 'It\'s showing on What\'s Happening right now. Nice work!'}
          </p>

          {/* Tips */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px 28px', textAlign: 'left', marginBottom: 32 }}>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
              Here's the good stuff
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
              See Events →
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
