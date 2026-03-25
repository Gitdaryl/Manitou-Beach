import { Navbar, Footer } from '../components/Layout';

const C = {
  night: '#1A2830',
  cream: '#FAF6EF',
  sage: '#7A8E72',
  text: '#3D3530',
  textMuted: '#8C806E',
  sunsetLight: 'rgba(255,220,180,0.85)',
};

export default function ListingConfirmedPage() {
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
            You're live on Manitou Beach.
          </h1>
          <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.sunsetLight, fontStyle: 'italic', margin: '0 0 36px', lineHeight: 1.6 }}>
            Your listing is showing in the Local Guide right now. People can find you.
          </p>

          {/* What's next */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '24px 28px', textAlign: 'left', marginBottom: 32 }}>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 16px' }}>
              A few things worth knowing
            </p>
            {[
              { title: 'You can update your info anytime', body: 'Change your phone, address, description, or logo at any time — just visit the update listing page.' },
              { title: 'Your listing gets better with a description', body: 'If you didn\'t add one yet, a 2–3 sentence description makes a big difference for people deciding to reach out.' },
              { title: 'We\'re actively growing the audience', body: 'We promote the directory to visitors and locals. More people finding the site means more people finding you.' },
            ].map(({ title, body }, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 2 ? 18 : 0 }}>
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

          {/* Accuracy prompt */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>
              Does your listing look right? If anything needs fixing — name, phone, address — update it now.
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/#businesses"
              style={{
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700,
                padding: '13px 24px', borderRadius: 8, background: C.sage, color: '#fff',
                textDecoration: 'none', display: 'inline-block',
              }}
            >
              See your listing →
            </a>
            <a
              href="/update-listing"
              style={{
                fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 600,
                padding: '13px 24px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none', display: 'inline-block', background: 'transparent',
              }}
            >
              Fix something →
            </a>
          </div>

        </div>
      </main>

      <Footer scrollTo={() => {}} />
    </div>
  );
}
