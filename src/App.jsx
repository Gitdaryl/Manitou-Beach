import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import BuildPage from './pages/BuildPage';
import RatePage from './pages/RatePage';
import FoundingPage from './pages/FoundingPage';
import FoodTruckPartnerPage from './pages/FoodTruckPartnerPage';
import WinePartnerPage from './pages/WinePartnerPage';
import FoodTrucksPage from './pages/FoodTrucksPage';
import FoodTruckQRPage from './pages/FoodTruckQRPage';
import DiscoverPage, { VoiceWidget } from './pages/DiscoverPage';
import ClaimPage from './pages/ClaimPage';
import YetiAdminPage from './pages/YetiAdminPage';
import DispatchPage, { DispatchArticlePage } from './pages/DispatchPage';
import PromotePage, { AdvertisePage } from './pages/PromotePage';
import FeaturedPage from './pages/FeaturedPage';
import HappeningPage from './pages/HappeningPage';
import ClaimPromoView from "./pages/ClaimPromoView";
import RedeemPromoView from "./pages/RedeemPromoView";
import WineriesPage from './pages/WineriesPage';
import FishingPage from './pages/FishingPage';
import HistoricalSocietyPage from './pages/HistoricalSocietyPage';
import MensClubPage from './pages/MensClubPage';
import LadiesClubPage from './pages/LadiesClubPage';
import DevilsLakePage from './pages/DevilsLakePage';
import RoundLakePage from './pages/RoundLakePage';
import VillagePage from './pages/VillagePage';
import USA250Page from "./pages/USA250Page";
import HomePage from './pages/HomePage';
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
        <Route path="/usa250" element={<USA250Page />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
      <VoiceWidget />
    </BrowserRouter>
  );
}
