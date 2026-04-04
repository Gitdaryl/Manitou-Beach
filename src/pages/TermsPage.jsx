import React, {  } from 'react';
import { C } from '../data/config';
import { Footer, Navbar } from '../components/Layout';

// ============================================================
export default function TermsPage() {
  const subScrollTo = (id) => { window.location.href = '/#' + id; };
  const S = {
    h2: { fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 400, color: C.dusk, margin: '40px 0 12px' },
    p: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, margin: '0 0 14px' },
    li: { fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.text, lineHeight: 1.8, marginBottom: 6 },
  };
  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Navbar activeSection="" scrollTo={subScrollTo} isSubPage={true} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '120px 28px 80px' }}>
        <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: C.sage, marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 400, color: C.dusk, margin: '0 0 8px' }}>Terms of Service</h1>
        <p style={{ ...S.p, color: C.textMuted, fontSize: 13, marginBottom: 40 }}>Effective date: March 2026 &nbsp;·&nbsp; Yeti Groove Media LLC</p>

        <p style={S.p}>By using the Manitou Beach community platform at manitoubeachmichigan.com ("the Site"), you agree to these Terms. If you don't agree, please don't use the Site.</p>

        <h2 style={S.h2}>Who we are</h2>
        <p style={S.p}>The Site is operated by Yeti Groove Media LLC, a Michigan limited liability company. Contact: <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a>.</p>

        <h2 style={S.h2}>Business listings</h2>
        <p style={S.p}>By submitting a business listing, you confirm that:</p>
        <ul style={{ paddingLeft: 20, margin: '0 0 14px' }}>
          {[
            'You are authorized to represent the business',
            'All submitted information is accurate and not misleading',
            'The business is lawfully operating',
            'You will notify us of material changes to your listing information',
          ].map((item, i) => <li key={i} style={S.li}>{item}</li>)}
        </ul>
        <p style={S.p}>We reserve the right to approve, edit, or remove any listing at our sole discretion. Free listings are not guaranteed placement or visibility.</p>

        <h2 style={S.h2}>Paid subscriptions</h2>
        <p style={S.p}>Paid listing tiers (Showcased, Highlighted, Front and Center) are billed monthly via Stripe. By subscribing, you authorize recurring charges. You may cancel at any time; your listing will remain active through the end of the current billing period. No refunds for partial months.</p>
        <p style={S.p}>Pricing may change with 30 days' notice. Founding members who are currently subscribed will not be subject to price increases while their subscription remains active.</p>

        <h2 style={S.h2}>SMS notifications</h2>
        <p style={S.p}><strong>Program name:</strong> Manitou Beach SMS Alerts, operated by Yeti Groove Media LLC.</p>
        <p style={S.p}><strong>How to opt in:</strong> You must explicitly opt in by submitting your mobile phone number through an opt-in form on this Site and checking the consent checkbox. Opting in is entirely voluntary.</p>
        <p style={S.p}><strong>Message types:</strong> Community event reminders, food truck check-in alerts, local business flash deals, and welcome messages. These are informational notifications only - not marketing from third parties.</p>
        <p style={S.p}><strong>Message frequency:</strong> Varies. You may receive up to a few messages per week depending on community activity and your subscription preferences.</p>
        <p style={S.p}><strong>Message &amp; data rates:</strong> Message and data rates may apply depending on your mobile carrier plan.</p>
        <p style={S.p}><strong>How to opt out:</strong> Reply <strong>STOP</strong> to any message at any time. You will receive one confirmation message and no further texts will be sent.</p>
        <p style={S.p}><strong>Help:</strong> Reply <strong>HELP</strong> to any message or email <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a> for assistance.</p>
        <p style={S.p}><strong>Third-party sharing:</strong> Your phone number and opt-in consent are never sold or shared with unauthorized third parties. Numbers are transmitted to Twilio solely for message delivery.</p>
        <p style={S.p}>Supported carriers include AT&amp;T, T-Mobile, Verizon, and most major US carriers. Carrier liability is not assumed.</p>

        <h2 style={S.h2}>Acceptable use</h2>
        <p style={S.p}>You agree not to submit content that is false, defamatory, harassing, illegal, or infringes the rights of others. We may remove content and terminate access for violations without notice.</p>

        <h2 style={S.h2}>Intellectual property</h2>
        <p style={S.p}>Editorial content, design, and original photography on this Site are owned by Yeti Groove Media LLC. By submitting a logo or photo, you grant us a non-exclusive license to display it on the Site in connection with your listing.</p>
        <p style={S.p}>To report a copyright claim, contact <a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a> with "DMCA" in the subject line.</p>

        <h2 style={S.h2}>Disclaimer &amp; limitation of liability</h2>
        <p style={S.p}>The Site is provided "as is." We make no warranties about the accuracy, completeness, or reliability of directory listings. Business information is submitted by third parties - always verify directly with a business before visiting or transacting.</p>
        <p style={S.p}>To the fullest extent permitted by law, Yeti Groove Media LLC is not liable for any indirect, incidental, or consequential damages arising from your use of the Site.</p>

        <h2 style={S.h2}>Governing law</h2>
        <p style={S.p}>These Terms are governed by the laws of the State of Michigan. Any disputes shall be resolved in the courts of Lenawee County, Michigan.</p>

        <h2 style={S.h2}>Changes to these Terms</h2>
        <p style={S.p}>We may update these Terms at any time. We'll post the updated date at the top of this page. Continued use of the Site constitutes acceptance.</p>

        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}><a href="mailto:admin@yetigroove.com" style={{ color: C.sage }}>admin@yetigroove.com</a></p>
      </div>
      <Footer scrollTo={subScrollTo} />
    </div>
  );
}
