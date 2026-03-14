import React, {  } from 'react';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';

// ============================================================
export default function PrivacyPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  const S = { // shared prose styles
    h2: { fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.dusk, margin: '40px 0 12px' },
    p: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, margin: '0 0 14px' },
    li: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 6 },
  };
  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px 28px 80px' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: C.sage, marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 400, color: C.dusk, margin: '0 0 8px' }}>Privacy Policy</h1>
        <p style={{ ...S.p, color: C.textMuted, fontSize: 13, marginBottom: 40 }}>Effective date: March 2026 &nbsp;·&nbsp; Yeti Groove Media LLC</p>

        <p style={S.p}>This Privacy Policy explains how Yeti Groove Media LLC ("we", "us", "our") collects, uses, and protects information submitted through the Manitou Beach community platform at manitoubeach.com ("the Site"). We keep it plain — no legalese.</p>

        <h2 style={S.h2}>What we collect</h2>
        <p style={S.p}><strong>Newsletter sign-ups:</strong> Your email address. Delivered through beehiiv. You can unsubscribe at any time using the link in any email.</p>
        <p style={S.p}><strong>Business listing submissions:</strong> Business name, category, phone number, website, email address, physical address, and an optional logo. This information is submitted voluntarily and is used to populate the public business directory.</p>
        <p style={S.p}><strong>Event submissions:</strong> Event name, description, date, and contact email. Used to list your event on the site.</p>
        <p style={S.p}><strong>Offer claims (QR/loyalty):</strong> Name and email, collected when you redeem a business offer. This information is shared with the participating business for redemption verification only.</p>
        <p style={S.p}><strong>Payment information:</strong> Processed entirely by Stripe. We never receive or store your card number, CVV, or bank details. Stripe's privacy policy governs payment data.</p>

        <h2 style={S.h2}>How we use it</h2>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'To display your business or event in the public directory',
            'To send the Manitou Beach newsletter (email only, opt-in)',
            'To process paid listing subscriptions via Stripe',
            'To verify offer redemptions at participating businesses',
            'To improve the site and understand what content is useful',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>
        <p style={S.p}>We do not sell, rent, or trade your personal information to any third party for marketing purposes.</p>

        <h2 style={S.h2}>Third-party services</h2>
        <p style={S.p}>The Site uses the following third-party services, each with their own privacy practices:</p>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'Notion — business and event data storage',
            'beehiiv — newsletter delivery and subscriber management',
            'Stripe — payment processing for paid listings',
            'Google Maps — interactive map on the Discover page (may set cookies)',
            'Vercel — hosting and serverless functions',
            'OpenStreetMap / Nominatim — address geocoding (no personal data sent)',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>

        <h2 style={S.h2}>Cookies &amp; browser storage</h2>
        <p style={S.p}>We do not use advertising or analytics cookies. Google Maps may store data in your browser to function correctly. We do not track you across other websites.</p>

        <h2 style={S.h2}>Data retention</h2>
        <p style={S.p}>Business listings remain in our Notion database until you request removal. Newsletter subscriptions are retained until you unsubscribe. You may request deletion of any personal information at any time by emailing us.</p>

        <h2 style={S.h2}>Your rights</h2>
        <p style={S.p}>You may request access to, correction of, or deletion of any personal data we hold about you. Email <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a> and we will respond promptly.</p>

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>Yeti Groove Media LLC<br /><a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a></p>
        <p style={{ ...S.p, fontSize: 13, color: C.textMuted }}>This policy may be updated from time to time. Continued use of the Site after changes constitutes acceptance of the revised policy.</p>
      </div>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
