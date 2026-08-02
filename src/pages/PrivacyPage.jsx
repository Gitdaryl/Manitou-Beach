import React, {  } from 'react';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';
import SEOHead from '../components/SEOHead';

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
      <SEOHead title="Privacy Policy" description="Privacy policy for Manitou Beach Michigan community platform." path="/privacy" />
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px 28px 80px' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: C.sage, marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 400, color: C.dusk, margin: '0 0 8px' }}>Privacy Policy</h1>
        <p style={{ ...S.p, color: C.textMuted, fontSize: 13, marginBottom: 40 }}>Effective date: March 2026 &nbsp;·&nbsp; Updated August 2026 &nbsp;·&nbsp; Yeti Groove Media LLC</p>

        <p style={S.p}>This Privacy Policy explains how Yeti Groove Media LLC ("we", "us", "our") collects, uses, and protects information submitted through the Manitou Beach community platform at manitoubeachmichigan.com ("the Site"). We keep it plain - no legalese.</p>

        <h2 style={S.h2}>What we collect</h2>
        <p style={S.p}><strong>Newsletter sign-ups:</strong> Your email address. Delivered through beehiiv. You can unsubscribe at any time using the link in any email.</p>
        <p style={S.p}><strong>Business listing submissions:</strong> Business name, category, phone number, website, email address, physical address, and an optional logo. This information is submitted voluntarily and is used to populate the public business directory.</p>
        <p style={S.p}><strong>Event submissions:</strong> Event name, description, date, and contact email. Used to list your event on the site.</p>
        <p style={S.p}><strong>Property stays listings:</strong> Property name, type, address, contact details, description, photos, pricing, and booking policies submitted by property owners. Displayed publicly on the Stays directory. We do not collect or store any guest payment information - all financial transactions occur directly between property owners and guests outside this platform.</p>
        <p style={S.p}><strong>Booking requests &amp; waitlist:</strong> Name and phone number submitted by visitors using the Request to Book or Join Waitlist features. Used solely to connect the visitor with the property owner via SMS. Not shared with third parties or used for marketing.</p>
        <p style={S.p}><strong>Offer claims (QR/loyalty):</strong> Name and email, collected when you redeem a business offer. This information is shared with the participating business for redemption verification only.</p>
        <p style={S.p}><strong>Payment information:</strong> Processed entirely by Stripe. We never receive or store your card number, CVV, or bank details. Stripe's privacy policy governs payment data.</p>
        <p style={S.p}><strong>SMS opt-ins:</strong> Your mobile phone number, collected when you voluntarily subscribe to SMS notifications through an opt-in form on this Site. We use this to send you text messages about community events, food truck check-ins, and local business alerts. You may opt out at any time by replying STOP to any message. SMS opt-in data and consent are never shared with third parties.</p>
        <p style={S.p}><strong>Community photo galleries:</strong> Photos you upload to our event galleries, along with the event you tag them to. Uploaded photos are displayed publicly on the Site. Before publishing, every upload is automatically screened by an AI service (Anthropic) to block inappropriate content; images are transmitted to Anthropic solely for this screening and are not used to train AI models. We also store a random identifier in your browser's local storage so the site can remember which photos you have hearted or flagged; this identifier is not linked to your name or contact details. Heart counts are displayed publicly. If you flag a photo, the reason you select is stored with the photo for moderation.</p>

        <h2 style={S.h2}>How we use it</h2>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'To display your business or event in the public directory',
            'To send the Manitou Beach newsletter (email only, opt-in)',
            'To send SMS notifications you have explicitly opted in to receive',
            'To process paid listing subscriptions via Stripe',
            'To verify offer redemptions at participating businesses',
            'To improve the site and understand what content is useful',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>
        <p style={S.p}>We do not sell, rent, or trade your personal information to any third party for marketing purposes. SMS opt-in information is never shared with unauthorized third parties.</p>

        <h2 style={S.h2}>Third-party services</h2>
        <p style={S.p}>The Site uses the following third-party services, each with their own privacy practices:</p>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'Notion - business and event data storage',
            'beehiiv - newsletter delivery and subscriber management',
            'Stripe - payment processing for paid listings',
            'Twilio - SMS delivery for community notifications (phone numbers are transmitted to Twilio solely for message delivery and are not shared with other parties)',
            'Google Maps - interactive map on the Discover page (may set cookies)',
            'Vercel - hosting, serverless functions, and photo storage (Vercel Blob)',
            'Upstash - storage for photo heart counts and moderation flags',
            'Anthropic - automated AI screening of uploaded gallery photos before publication',
            'OpenStreetMap / Nominatim - address geocoding (no personal data sent)',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>

        <h2 style={S.h2}>Cookies &amp; browser storage</h2>
        <p style={S.p}><strong>What we don't use:</strong> We have no advertising cookies, no analytics tracking cookies, no Facebook Pixel, no Google Analytics, and no third-party tracking of any kind. We do not follow you across other websites.</p>
        <p style={S.p}><strong>What we do use:</strong> We use your browser's <em>local storage</em> (not cookies) for purely functional features - things like remembering your saved food truck favorites, wine trail preferences, and offer claim codes between visits. This data never leaves your device and is not accessible to us or any third party.</p>
        <p style={S.p}><strong>Third-party storage:</strong> Google Maps (used on our Discover, Stays, and Food Trucks pages) may store data in your browser to function. Google Fonts loads typefaces from Google's servers, which may log your request. Stripe sets session cookies during payment flows. None of these are used for advertising or cross-site tracking on our behalf.</p>
        <p style={S.p}>If you'd like to clear any locally stored data, you can do so through your browser's settings at any time.</p>

        <h2 style={S.h2}>Data retention</h2>
        <p style={S.p}>Business listings remain in our Notion database until you request removal. Newsletter subscriptions are retained until you unsubscribe. Gallery photos remain published until removed by moderation or by request. You may request deletion of any personal information at any time by emailing us.</p>
        <p style={S.p}><strong>Photo removal:</strong> If you appear in a gallery photo and want it taken down, use the flag button on the photo or email us - we honor removal requests promptly, no questions asked.</p>

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
