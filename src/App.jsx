import { lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PageThemeProvider } from './context/PageThemeContext';

// Eager - first paint
import HomePage from './pages/HomePage';

// Lazy-loaded pages
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const SMSOptInPage = lazy(() => import('./pages/SMSOptInPage'));
const BuildPage = lazy(() => import('./pages/BuildPage'));
const RatePage = lazy(() => import('./pages/RatePage'));
const FoundingPage = lazy(() => import('./pages/FoundingPage'));
const FoodTruckPartnerPage = lazy(() => import('./pages/FoodTruckPartnerPage'));
const WinePartnerPage = lazy(() => import('./pages/WinePartnerPage'));
const FoodTrucksPage = lazy(() => import('./pages/FoodTrucksPage'));
const FoodTruckQRPage = lazy(() => import('./pages/FoodTruckQRPage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const ClaimPage = lazy(() => import('./pages/ClaimPage'));
const YetiAdminPage = lazy(() => import('./pages/YetiAdminPage'));
const DispatchPage = lazy(() => import('./pages/DispatchPage'));
const PromotePage = lazy(() => import('./pages/PromotePage'));
const FeaturedPage = lazy(() => import('./pages/FeaturedPage'));
const HappeningPage = lazy(() => import('./pages/HappeningPage'));
const ClaimPromoView = lazy(() => import('./pages/ClaimPromoView'));
const RedeemPromoView = lazy(() => import('./pages/RedeemPromoView'));
const WineriesPage = lazy(() => import('./pages/WineriesPage'));
const FishingPage = lazy(() => import('./pages/FishingPage'));
const HistoricalSocietyPage = lazy(() => import('./pages/HistoricalSocietyPage'));
const MensClubPage = lazy(() => import('./pages/MensClubPage'));
const LadiesClubPage = lazy(() => import('./pages/LadiesClubPage'));
const LadiesClubVendorPage = lazy(() => import('./pages/LadiesClubVendorPage'));
const LadiesClubJoinPage = lazy(() => import('./pages/LadiesClubJoinPage'));
const DevilsLakePage = lazy(() => import('./pages/DevilsLakePage'));
const RoundLakePage = lazy(() => import('./pages/RoundLakePage'));
const VillagePage = lazy(() => import('./pages/VillagePage'));
const USA250Page = lazy(() => import('./pages/USA250Page'));
const StaysPage = lazy(() => import('./pages/StaysPage'));
const HollyYetiPage = lazy(() => import('./pages/HollyYetiPage'));
const UpdateListingPage = lazy(() => import('./pages/UpdateListingPage'));
const UpgradeListingPage = lazy(() => import('./pages/UpgradeListingPage'));
const ManageBillingPage = lazy(() => import('./pages/ManageBillingPage'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const TicketServicesPage = lazy(() => import('./pages/TicketServicesPage'));
const TicketSuccessPage = lazy(() => import('./pages/TicketSuccessPage'));
const PartnerIntakePage = lazy(() => import('./pages/PartnerIntakePage'));
const EventEditPage = lazy(() => import('./pages/EventEditPage'));
const VendorRegisterPage = lazy(() => import('./pages/VendorRegisterPage'));
const VendorPortalPage = lazy(() => import('./pages/VendorPortalPage'));
const NightlifePage = lazy(() => import('./pages/NightlifePage'));
const OrganizerDashboardPage = lazy(() => import('./pages/OrganizerDashboardPage'));
const LaunchPage = lazy(() => import('./pages/LaunchPage'));
const BetaBusinessPage = lazy(() => import('./pages/BetaBusinessPage'));
const ActivateBusinessPage = lazy(() => import('./pages/ActivateBusinessPage'));
const ActivateWineryPage = lazy(() => import('./pages/ActivateWineryPage'));
const ListingConfirmedPage = lazy(() => import('./pages/ListingConfirmedPage'));
const SubmitEventPage = lazy(() => import('./pages/SubmitEventPage'));
const EventConfirmedPage = lazy(() => import('./pages/EventConfirmedPage'));
const QuickEventsPage = lazy(() => import('./pages/QuickEventsPage'));

// ── Beta gate - redirects / to /launch until LAUNCH_DATE
//   ⚙️  Update LAUNCH_DATE when you have a firm date (must match LaunchPage.jsx)
const LAUNCH_DATE = new Date('2026-05-01T16:00:00Z'); // 12:00pm ET May 1

function BetaGate({ children }) {
  // Gate only activates on the production domain - Vercel preview URLs bypass it entirely
  if (typeof window !== 'undefined' && window.location.hostname !== 'manitoubeachmichigan.com') return children;
  if (Date.now() >= LAUNCH_DATE.getTime()) return children;
  try {
    // Beta testers - unique access code issued at signup
    const code = localStorage.getItem('mb_beta_code');
    if (code && /^MB[A-Z0-9]{4}$/.test(code)) return children;
    // Food truck operators - backstage crew access after partner registration
    const ftSlug = localStorage.getItem('mb_ft_slug');
    if (ftSlug) return children;
  } catch {} // Safari private mode throws on localStorage
  if (typeof window !== 'undefined') window.location.replace('/launch');
  return null;
}

// Lazy sub-components from named exports
const DispatchArticlePage = lazy(() => import('./pages/DispatchPage').then(m => ({ default: m.DispatchArticlePage })));
const AdvertisePage = lazy(() => import('./pages/PromotePage').then(m => ({ default: m.AdvertisePage })));
const BetaFeedbackStrip = lazy(() => import('./components/Layout').then(m => ({ default: m.BetaFeedbackStrip })));
const VoiceConcierge = lazy(() => import('./components/VoiceConcierge'));

class SafeVoice extends Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  componentDidCatch(e) { console.error('VoiceConcierge crashed:', e); }
  render() { return this.state.err ? null : this.props.children; }
}

// Catches stale-chunk 404s after a redeploy and forces a one-time hard reload.
// Without this, any lazy page that 404s shows a permanent blank with no feedback.
class ChunkErrorBoundary extends Component {
  state = { dead: false };
  static getDerivedStateFromError(err) {
    const isChunk =
      err?.name === 'ChunkLoadError' ||
      /dynamically imported module|Failed to fetch/i.test(err?.message ?? '');
    if (isChunk) {
      try {
        if (!sessionStorage.getItem('_chunk_reloaded')) {
          sessionStorage.setItem('_chunk_reloaded', '1');
          window.location.reload();
          return { dead: false }; // stay blank briefly while reload fires
        }
      } catch {}
    }
    return { dead: true };
  }
  render() {
    if (this.state.dead) return null; // silent fail - better than a crash screen
    return this.props.children;
  }
}

// ============================================================
// 📑  PROJECT STRUCTURE (post-extraction)
// ============================================================
// App.jsx is now the router + shared config/exports.
// All pages live in src/pages/, shared components in src/components/.
//
// src/data/config.js     - Design tokens (C), sponsors, nav, village data, videos
// src/components/Shared.jsx - ShareBar, SectionLabel, SectionTitle, FadeIn, Btn, etc.
// src/components/Layout.jsx - GlobalStyles, PromoBanner, Newsletter, Footer, Navbar, etc.
//
// This file contains:
//   - Re-exports from Layout/config/discover (backward compat)
//   - App router (all routes)
// ============================================================

// ============================================================
// 🎬  GLOBAL CSS KEYFRAMES & ANIMATIONS
// ============================================================
export { GlobalStyles, PromoBanner, NewsletterInline, EventTimeline, HollyYetiSection,
  compressImage, SubmitSection, FooterNewsletterModal, Footer, Navbar, EventLightbox,
  CATEGORY_COLORS
} from './components/Layout';

// Re-exports from data modules (backward compat for any remaining imports from '../App')
export { useDispatchAds, pickAd, SITE_KNOWLEDGE,
  DISCOVER_MAP_CENTER, DISCOVER_CATS, DISCOVER_POIS, DISCOVER_MAP_STYLES,
  createDiscoverPin, buildDiscoverInfoWindow } from './data/discover';
export { DISPATCH_CARD_SPONSORS, DISPATCH_CATEGORIES } from './data/config';


// ============================================================
// 🌐  APP ROOT
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      {/* Page routes get their own Suspense so VoiceConcierge / BetaFeedbackStrip
          can't block the main content from appearing while they download. */}
      <ChunkErrorBoundary>
        <Suspense fallback={null}>
          <Routes>
          <Route path="/claim-promo" element={<ClaimPromoView />} />
          <Route path="/redeem-promo" element={<RedeemPromoView />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/" element={<BetaGate><HomePage /></BetaGate>} />
          <Route path="/events" element={<HappeningPage />} />
          <Route path="/events/edit" element={<EventEditPage />} />
          <Route path="/happening" element={<HappeningPage />} />
          <Route path="/round-lake" element={<RoundLakePage />} />
          <Route path="/village" element={<VillagePage />} />
          <Route path="/nightlife" element={<NightlifePage />} />
          <Route path="/business" element={<FeaturedPage />} />
          <Route path="/featured" element={<FeaturedPage />} />
          <Route path="/update-listing" element={<UpdateListingPage />} />
          <Route path="/upgrade-listing" element={<UpgradeListingPage />} />
          <Route path="/manage-billing" element={<ManageBillingPage />} />
          <Route path="/listing-confirmed" element={<ListingConfirmedPage />} />
          <Route path="/submit-event" element={<SubmitEventPage />} />
          <Route path="/event-confirmed" element={<EventConfirmedPage />} />
          <Route path="/mens-club" element={<MensClubPage />} />
          <Route path="/ladies-club" element={<LadiesClubPage />} />
          <Route path="/ladies-club/vendor" element={<LadiesClubVendorPage />} />
          <Route path="/ladies-club/join" element={<LadiesClubJoinPage />} />
          <Route path="/historical-society" element={<HistoricalSocietyPage />} />
          <Route path="/fishing" element={<FishingPage />} />
          <Route path="/wineries" element={<WineriesPage />} />
          <Route path="/devils-lake" element={<DevilsLakePage />} />
          <Route path="/promote" element={<PromotePage />} />
          <Route path="/event" element={<Navigate to="/submit-event" replace />} />
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/vendor-register" element={<VendorRegisterPage />} />
          <Route path="/vendor-portal" element={<VendorPortalPage />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboardPage />} />
          <Route path="/dispatch" element={<DispatchPage />} />
          <Route path="/dispatch/:slug" element={<DispatchArticlePage />} />
          <Route path="/yeti-admin" element={<YetiAdminPage />} />
          <Route path="/claim/:slug" element={<ClaimPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/food-trucks" element={<FoodTrucksPage />} />
          <Route path="/food-trucks/qr/:slug" element={<FoodTruckQRPage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/rate" element={<RatePage />} />
          <Route path="/wine-partner" element={<WinePartnerPage />} />
          <Route path="/food-truck-partner" element={<FoodTruckPartnerPage />} />
          <Route path="/founding" element={<FoundingPage />} />
          <Route path="/stays" element={<StaysPage />} />
          <Route path="/holly-yeti" element={<HollyYetiPage />} />
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/ticket-services" element={<TicketServicesPage />} />
          <Route path="/ticket-success" element={<TicketSuccessPage />} />
          <Route path="/partner-intake" element={<PartnerIntakePage />} />
          <Route path="/fireworks" element={<USA250Page />} />
          <Route path="/usa250" element={<USA250Page />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/sms" element={<SMSOptInPage />} />
          <Route path="/beta-business" element={<BetaBusinessPage />} />
          <Route path="/activate" element={<ActivateBusinessPage />} />
          <Route path="/activate-winery" element={<ActivateWineryPage />} />
          <Route path="/quick-events" element={<QuickEventsPage />} />
        </Routes>
        </Suspense>
      </ChunkErrorBoundary>
      {/* These load independently - they must NOT block page content */}
      <SafeVoice>
        <Suspense fallback={null}><VoiceConcierge /></Suspense>
      </SafeVoice>
      <Suspense fallback={null}><BetaFeedbackStrip /></Suspense>
    </BrowserRouter>
  );
}
