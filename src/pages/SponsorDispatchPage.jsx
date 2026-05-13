import React from 'react';
import { C } from '../data/config';
import { Footer, Navbar, GlobalStyles } from '../components/Layout';
import { FadeIn, SectionLabel, WaveDivider } from '../components/Shared';
import SEOHead from '../components/SEOHead';

const TIERS = [
  {
    name: 'Mention',
    price: '$29',
    per: 'per issue',
    emoji: '📣',
    highlight: false,
    perks: [
      'Your business name + one-line pitch in the issue',
      'Live link to your website or profile',
      'Seen by every subscriber that issue',
    ],
    cta: 'Good for events, seasonal promos, quick announcements.',
  },
  {
    name: 'Feature',
    price: '$79',
    per: 'per issue',
    emoji: '⭐',
    highlight: true,
    perks: [
      'Full sponsored section - your story, your offer',
      'Hero placement at the top of the issue',
      'Image or logo included',
      'Live link to your site or profile',
    ],
    cta: 'Best for grand openings, big sales, or building brand recognition.',
  },
  {
    name: 'Monthly Sponsor',
    price: '$149',
    per: 'per month',
    emoji: '🏆',
    highlight: false,
    perks: [
      'Featured placement in every issue that month',
      'Your logo in the leaderboard ad between articles',
      'Fallback ad slot when no other sponsor is active',
      'First right of renewal each month',
    ],
    cta: 'Best for businesses that want consistent visibility all season.',
  },
];

const STATS = [
  { label: 'Subscribers', value: '300+', note: 'and growing' },
  { label: 'Open Rate', value: '~45%', note: 'well above industry avg' },
  { label: 'Issues / Month', value: '2–4', note: 'Tue & Sat cadence' },
  { label: 'Audience', value: 'Local', note: 'Devils Lake + visitors' },
];

export default function SponsorDispatchPage() {
  return (
    <>
      <GlobalStyles />
      <SEOHead
        title="Sponsor the Manitou Dispatch"
        description="Reach engaged Devils Lake community members and visitors through the Manitou Dispatch newsletter. Simple pricing, real results."
        canonicalPath="/sponsor-dispatch"
      />
      <div style={{ background: C.cream, minHeight: '100vh' }}>
        <Navbar />

        {/* Hero */}
        <section style={{ background: C.dusk, paddingTop: 120, paddingBottom: 80, textAlign: 'center', position: 'relative' }}>
          <FadeIn>
            <SectionLabel light>The Manitou Dispatch</SectionLabel>
            <h1 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: '#fff',
              fontWeight: 700,
              margin: '12px auto 20px',
              maxWidth: 680,
              lineHeight: 1.2,
            }}>
              Put your business in front of people who actually care about this place.
            </h1>
            <p style={{
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 18,
              color: 'rgba(255,255,255,0.75)',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              The Dispatch goes out to real Devils Lake regulars - residents, cottage owners, and visitors who look forward to every issue. No bots, no cold lists.
            </p>
          </FadeIn>
        </section>

        <WaveDivider topColor={C.dusk} bottomColor={C.warmWhite} />

        {/* Stats strip */}
        <section style={{ background: C.warmWhite, padding: '40px 24px' }}>
          <div style={{
            maxWidth: 860,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}>
            {STATS.map(s => (
              <FadeIn key={s.label}>
                <div style={{ padding: '20px 16px', background: C.cream, borderRadius: 12, border: `1px solid ${C.sand}` }}>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 32, fontWeight: 700, color: C.dusk }}>{s.value}</div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, fontWeight: 700, color: C.text, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: C.textMuted, marginTop: 2 }}>{s.note}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <WaveDivider topColor={C.warmWhite} bottomColor={C.cream} />

        {/* Tiers */}
        <section style={{ padding: '60px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <SectionLabel>Sponsorship Options</SectionLabel>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(24px, 3vw, 36px)', color: C.dusk, margin: '8px 0 12px' }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 16, color: C.textLight, maxWidth: 480, margin: '0 auto' }}>
                No minimums, no contracts. Buy an issue, see how it goes.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {TIERS.map((tier, i) => (
              <FadeIn key={tier.name} delay={i * 80}>
                <div style={{
                  background: tier.highlight ? C.dusk : '#fff',
                  border: tier.highlight ? 'none' : `1px solid ${C.sand}`,
                  borderRadius: 16,
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: tier.highlight ? '0 8px 32px rgba(10,18,24,0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
                  position: 'relative',
                }}>
                  {tier.highlight && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: C.sunset,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "'Libre Franklin', sans-serif",
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      padding: '4px 14px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                    }}>Most Popular</div>
                  )}
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{tier.emoji}</div>
                  <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 22, fontWeight: 700, color: tier.highlight ? '#fff' : C.dusk, marginBottom: 4 }}>{tier.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 36, fontWeight: 700, color: tier.highlight ? C.sunsetLight : C.lakeBlue }}>{tier.price}</span>
                    <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: tier.highlight ? 'rgba(255,255,255,0.6)' : C.textMuted }}>{tier.per}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1 }}>
                    {tier.perks.map((perk, j) => (
                      <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                        <span style={{ color: tier.highlight ? C.sunsetLight : C.sage, flexShrink: 0, marginTop: 2, fontSize: 14 }}>✓</span>
                        <span style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 14, color: tier.highlight ? 'rgba(255,255,255,0.85)' : C.textLight, lineHeight: 1.5 }}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 12, color: tier.highlight ? 'rgba(255,255,255,0.5)' : C.textMuted, fontStyle: 'italic', marginBottom: 20, lineHeight: 1.5 }}>{tier.cta}</p>
                  <a
                    href={`mailto:daryl@manitoubeachmichigan.com?subject=Dispatch Sponsorship - ${tier.name}&body=Hi Daryl, I'm interested in the ${tier.name} tier ($${tier.price} ${tier.per}) for the Manitou Dispatch. Here's a bit about my business and what I'd like to promote:%0A%0A`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '12px 20px',
                      borderRadius: 8,
                      background: tier.highlight ? C.sunset : C.lakeBlue,
                      color: '#fff',
                      fontFamily: "'Libre Franklin', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    Get in touch →
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <WaveDivider topColor={C.cream} bottomColor={C.warmWhite} />

        {/* FAQ / reassurance strip */}
        <section style={{ background: C.warmWhite, padding: '60px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <FadeIn>
              <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 26, color: C.dusk, marginBottom: 32, textAlign: 'center' }}>
                A few things people ask.
              </h2>
            </FadeIn>
            {[
              {
                q: 'Do I need to write the copy myself?',
                a: "Nope. Send us your offer and we'll write something that sounds like a real human - because it will be. You approve it before it goes out.",
              },
              {
                q: 'How soon can I get in the next issue?',
                a: "Usually within a few days. We publish Tuesdays and Saturdays - just reach out before the weekend and we'll get you slotted.",
              },
              {
                q: "What if I want to run something ongoing?",
                a: "The Monthly Sponsor tier locks in your spot for a full month. First right of renewal, so you don't lose your slot to someone else.",
              },
              {
                q: "Is there a contract?",
                a: "No contracts, ever. Pay per issue or per month. If it doesn't work for your business, no hard feelings.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: i < 3 ? `1px solid ${C.sand}` : 'none' }}>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontWeight: 700, fontSize: 16, color: C.dusk, marginBottom: 8 }}>{item.q}</div>
                  <div style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 15, color: C.textLight, lineHeight: 1.7 }}>{item.a}</div>
                </div>
              </FadeIn>
            ))}

            <FadeIn>
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: C.sage, marginBottom: 16 }}>
                  Ready to get in front of this community?
                </p>
                <a
                  href="mailto:daryl@manitoubeachmichigan.com?subject=Dispatch Sponsorship Inquiry"
                  style={{
                    display: 'inline-block',
                    padding: '14px 32px',
                    background: C.dusk,
                    color: '#fff',
                    fontFamily: "'Libre Franklin', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  Email Daryl directly →
                </a>
                <p style={{ fontFamily: "'Libre Franklin', sans-serif", fontSize: 13, color: C.textMuted, marginTop: 12 }}>
                  daryl@manitoubeachmichigan.com - usually replies same day.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <WaveDivider topColor={C.warmWhite} bottomColor={C.dusk} />
        <Footer />
      </div>
    </>
  );
}
