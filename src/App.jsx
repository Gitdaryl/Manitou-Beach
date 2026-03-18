import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Eager — first paint
import HomePage from './pages/HomePage';

// Lazy-loaded pages
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
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
const DevilsLakePage = lazy(() => import('./pages/DevilsLakePage'));
const RoundLakePage = lazy(() => import('./pages/RoundLakePage'));
const VillagePage = lazy(() => import('./pages/VillagePage'));
const USA250Page = lazy(() => import('./pages/USA250Page'));
const StaysPage = lazy(() => import('./pages/StaysPage'));
const HollyYetiPage = lazy(() => import('./pages/HollyYetiPage'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const TicketServicesPage = lazy(() => import('./pages/TicketServicesPage'));
const TicketSuccessPage = lazy(() => import('./pages/TicketSuccessPage'));

// Lazy sub-components from named exports
const DispatchArticlePage = lazy(() => import('./pages/DispatchPage').then(m => ({ default: m.DispatchArticlePage })));
const AdvertisePage = lazy(() => import('./pages/PromotePage').then(m => ({ default: m.AdvertisePage })));
const VoiceWidget = lazy(() => import('./pages/DiscoverPage').then(m => ({ default: m.VoiceWidget })));

// ============================================================
// 📑  PROJECT STRUCTURE (post-extraction)
// ============================================================
// App.jsx is now the router + shared config/exports.
// All pages live in src/pages/, shared components in src/components/.
//
// src/data/config.js     — Design tokens (C), sponsors, nav, village data, videos
// src/components/Shared.jsx — ShareBar, SectionLabel, SectionTitle, FadeIn, Btn, etc.
// src/components/Layout.jsx — GlobalStyles, PromoBanner, Newsletter, Footer, Navbar, etc.
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
export { useDispatchAds, pickAd, VAPI_PUBLIC_KEY, VAPI_ASSISTANT_ID, SITE_KNOWLEDGE,
  DISCOVER_MAP_CENTER, DISCOVER_CATS, DISCOVER_POIS, DISCOVER_MAP_STYLES,
  createDiscoverPin, buildDiscoverInfoWindow } from './data/discover';
export { DISPATCH_CARD_SPONSORS, DISPATCH_CATEGORIES } from './data/config';


// ============================================================
// 🌐  APP ROOT
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/claim-promo" element={<ClaimPromoView />} />
          <Route path="/redeem-promo" element={<RedeemPromoView />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<HappeningPage />} />
          <Route path="/happening" element={<HappeningPage />} />
          <Route path="/round-lake" element={<RoundLakePage />} />
          <Route path="/village" element={<VillagePage />} />
          <Route path="/business" element={<FeaturedPage />} />
          <Route path="/featured" element={<FeaturedPage />} />
          <Route path="/mens-club" element={<MensClubPage />} />
          <Route path="/ladies-club" element={<LadiesClubPage />} />
          <Route path="/historical-society" element={<HistoricalSocietyPage />} />
          <Route path="/fishing" element={<FishingPage />} />
          <Route path="/wineries" element={<WineriesPage />} />
          <Route path="/devils-lake" element={<DevilsLakePage />} />
          <Route path="/promote" element={<PromotePage />} />
          <Route path="/event" element={<PromotePage />} />
          <Route path="/advertise" element={<AdvertisePage />} />
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
          <Route path="/usa250" element={<USA250Page />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
        <VoiceWidget />
      </Suspense>
    </BrowserRouter>
  );
}
