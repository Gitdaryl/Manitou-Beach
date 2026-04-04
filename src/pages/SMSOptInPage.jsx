import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';
import SMSOptInWidget from '../components/SMSOptInWidget';

export default function SMSOptInPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };

  const S = {
    h2: { fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.dusk, margin: '40px 0 12px' },
    p: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, margin: '0 0 14px' },
    tag: { display: 'inline-block', background: C.sage + '22', color: C.sage, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 3, marginBottom: 12 },
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '120px 28px 80px' }}>

        <div style={S.tag}>SMS Alerts</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 400, color: C.dusk, margin: '0 0 16px' }}>
          Stay in the loop
        </h1>
        <p style={S.p}>
          Get text alerts for community events, local deals, and weekend highlights - straight to your phone. No spam, just what's happening at Manitou Beach.
        </p>

        <h2 style={S.h2}>What you'll receive</h2>
        <ul style={{ paddingLeft: 20, margin: '0 0 28px' }}>
          {[
            'Event reminders - Friday Fish Fry, festivals, live music',
            'Business deals - time-sensitive specials from Village shops',
            'Welcome messages - highlights when you arrive for the weekend',
          ].map((item, i) => (
            <li key={i} style={{ ...S.p, margin: '0 0 6px' }}>{item}</li>
          ))}
        </ul>

        <SMSOptInWidget
          type="general"
          source="sms-optin-page"
          heading="Subscribe to SMS alerts"
          subtext="Enter your mobile number to get started."
        />

        <h2 style={S.h2}>Frequently asked questions</h2>

        {[
          { q: 'How many texts will I get?', a: 'It varies by week - typically a few per week during summer season when events are active. Much quieter off-season.' },
          { q: 'Can I choose what I get alerts for?', a: "Right now it's a single subscription. Preference controls (events only, deals only, etc.) are coming soon." },
          { q: 'How do I unsubscribe?', a: "Reply STOP to any message and you'll be removed immediately. You'll get one confirmation text, then nothing more." },
          { q: 'Who sends the messages?', a: 'Manitou Beach, operated by Yeti Groove Media LLC. Messages are sent via Twilio.' },
        ].map(({ q, a }, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <p style={{ ...S.p, fontWeight: 600, margin: '0 0 4px' }}>{q}</p>
            <p style={{ ...S.p, margin: 0 }}>{a}</p>
          </div>
        ))}

      </div>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
